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

export interface Option {
    value: string;
    label: string;
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

// Active assignment groups that carry an ITIL or PPS-resource role — the same
// role-scoped list the Task & Resource Dashboard uses. Loaded once up front and
// filtered client-side by the MultiSelect. De-duplicated, name-sorted.
export async function fetchGroups(): Promise<Option[]> {
    const query = 'role.nameINitil,pps_resource^group.active=true^ORDERBYgroup.name';
    const url =
        `/api/now/table/sys_group_has_role?sysparm_query=${encodeURIComponent(query)}` +
        `&sysparm_fields=group&sysparm_display_value=all` +
        `&sysparm_exclude_reference_link=true&sysparm_limit=5000`;
    const data = await fetchJson<TableResponse<{ group: { value: string; display_value: string } }>>(url);
    const seen = new Set<string>();
    const out: Option[] = [];
    for (const r of data.result ?? []) {
        const g = r.group;
        if (!g || !g.value || seen.has(g.value)) continue;
        seen.add(g.value);
        out.push({ value: g.value, label: g.display_value || g.value });
    }
    return out;
}

// Active members of the selected group(s). Preloaded when the group selection
// changes so the Users field shows the full list on open (mirrors the TRD).
// A user can belong to multiple selected groups; de-duplicate by sys_id.
export async function fetchGroupMembers(groupSysIds: string[]): Promise<Option[]> {
    if (!groupSysIds.length) {
        return [];
    }
    const query = `groupIN${groupSysIds.join(',')}^user.active=true^ORDERBYuser.name`;
    const url =
        `/api/now/table/sys_user_grmember?sysparm_query=${encodeURIComponent(query)}` +
        `&sysparm_fields=user&sysparm_display_value=all` +
        `&sysparm_exclude_reference_link=true&sysparm_limit=5000`;
    const data = await fetchJson<TableResponse<{ user: { value: string; display_value: string } }>>(url);
    const seen = new Set<string>();
    const out: Option[] = [];
    for (const r of data.result ?? []) {
        const u = r.user;
        if (!u || !u.value || seen.has(u.value)) continue;
        seen.add(u.value);
        out.push({ value: u.value, label: u.display_value || u.value });
    }
    return out;
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
