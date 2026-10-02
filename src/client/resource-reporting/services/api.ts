// Data layer for the Resource Time Report.
//
// Transport:
//   - User/group pickers use the ServiceNow Table API (/api/now/table/...).
//   - Report data comes from the scoped Scripted REST API
//     /api/x_cahcs_react_rpt/resource_reporting/report-data, which returns rows
//     already pivoted to one entry per (period, user).
//
// All requests are authenticated with the current session token via the
// `X-UserToken` header (window.g_ck) and ask for JSON responses.

export interface UserOption {
    sysId: string;
    name: string;
    email?: string;
}

export interface GroupOption {
    sysId: string;
    name: string;
}

export interface ReportRow {
    period: string;
    periodLabel: string;
    userSysId: string;
    userName: string;
    capacity: number;
    availability: number;
    allocated: number;
    actual: number;
    timeCardHours: number;
    utilization: number;
}

export interface ReportResult {
    rows: ReportRow[];
    total: number;
    truncated?: boolean;
}

export interface ReportParams {
    userSysIds: string[];
    groupSysIds: string[];
    startDate: string;
    endDate: string;
    granularity: 'weekly' | 'monthly';
}

const REPORT_DATA_ENDPOINT = '/api/x_cahcs_react_rpt/resource_reporting/report-data';

function authHeaders(): Record<string, string> {
    return {
        Accept: 'application/json',
        'X-UserToken': (window as unknown as { g_ck: string }).g_ck,
    };
}

interface TableResponse<T> {
    result?: T[];
}

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url, { method: 'GET', headers: authHeaders() });
    if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
    }
    return (await response.json()) as T;
}

export async function searchUsers(term: string): Promise<UserOption[]> {
    if (term.length < 2) {
        return [];
    }
    const query = `active=true^nameLIKE${term}^ORDERBYname`;
    const url =
        `/api/now/table/sys_user?sysparm_query=${encodeURIComponent(query)}` +
        `&sysparm_fields=${encodeURIComponent('sys_id,name,email')}` +
        `&sysparm_limit=20`;
    const data = await fetchJson<TableResponse<{ sys_id: string; name: string; email?: string }>>(url);
    return (data.result ?? []).map(r => ({ sysId: r.sys_id, name: r.name, email: r.email }));
}

export async function searchGroupMembers(term: string, groupSysIds: string[]): Promise<UserOption[]> {
    if (!groupSysIds.length || term.length < 2) {
        return [];
    }
    const query =
        `group.active=true^groupIN${groupSysIds.join(',')}` +
        `^user.active=true^user.nameLIKE${term}^ORDERBYuser.name`;
    const url =
        `/api/now/table/sys_user_grmember?sysparm_query=${encodeURIComponent(query)}` +
        `&sysparm_fields=${encodeURIComponent('user.sys_id,user.name,user.email')}` +
        `&sysparm_limit=20`;
    const data = await fetchJson<
        TableResponse<{ 'user.sys_id': string; 'user.name': string; 'user.email'?: string }>
    >(url);
    // A user can belong to multiple selected groups; de-duplicate by sys_id.
    const seen = new Set<string>();
    const out: UserOption[] = [];
    for (const r of data.result ?? []) {
        const sysId = r['user.sys_id'];
        if (!sysId || seen.has(sysId)) continue;
        seen.add(sysId);
        out.push({ sysId, name: r['user.name'], email: r['user.email'] });
    }
    return out;
}

export async function searchGroups(term: string): Promise<GroupOption[]> {
    if (term.length < 2) {
        return [];
    }
    const query = `active=true^nameLIKE${term}^ORDERBYname`;
    const url =
        `/api/now/table/sys_user_group?sysparm_query=${encodeURIComponent(query)}` +
        `&sysparm_fields=${encodeURIComponent('sys_id,name')}` +
        `&sysparm_limit=20`;
    const data = await fetchJson<TableResponse<{ sys_id: string; name: string }>>(url);
    return (data.result ?? []).map(r => ({ sysId: r.sys_id, name: r.name }));
}

export async function fetchReport(params: ReportParams): Promise<ReportResult> {
    const search = new URLSearchParams({
        user_sys_ids: params.userSysIds.join(','),
        group_sys_ids: params.groupSysIds.join(','),
        start_date: params.startDate,
        end_date: params.endDate,
        granularity: params.granularity,
    });
    const url = `${REPORT_DATA_ENDPOINT}?${search.toString()}`;

    const response = await fetch(url, { method: 'GET', headers: authHeaders() });

    let data: unknown;
    try {
        data = await response.json();
    } catch {
        throw new Error('Received an invalid response from the server.');
    }

    // Surface error payloads as thrown errors. The handler's 403 gate returns
    // { error: string }; the platform may wrap failures as { error: { message } }.
    if (data && typeof data === 'object' && 'error' in data) {
        const err = (data as { error: unknown }).error;
        const message =
            typeof err === 'string'
                ? err
                : (err as { message?: string } | null)?.message ?? `Request failed (${response.status})`;
        throw new Error(message);
    }

    if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
    }

    // ServiceNow Scripted REST responses are wrapped in a { result: ... }
    // envelope. Unwrap it if present; otherwise read the top level directly.
    let body: unknown = data ?? {};
    if (body && typeof body === 'object' && !('rows' in body) && 'result' in body) {
        body = (body as { result: unknown }).result ?? {};
    }
    const payload = (body ?? {}) as Partial<ReportResult>;
    const rows = payload.rows ?? [];
    return {
        rows,
        total: payload.total ?? rows.length,
        truncated: payload.truncated,
    };
}
