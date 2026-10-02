// Service layer: all ServiceNow API access for the SLA Breach by Team dashboard.

export interface GroupOption {
    id: string
    label: string
}

export interface BreachRow {
    sys_id: string
    number: string
    incident_id: string
    assignment_group: string
    short_description: string
    sla: string
    sla_id: string
    planned_end_time: string
    assigned_group_at_breach: string
    inherited: boolean
}

export type SortField = 'number' | 'short_description' | 'sla' | 'planned_end_time'
export type SortDir = 'asc' | 'desc'

export interface BreachQuery {
    limit: number
    offset: number
    orderBy: SortField
    orderDir: SortDir
}

export interface BreachResponse {
    group: string
    groupName: string
    total: number
    offset: number
    limit: number
    orderBy: SortField
    orderDir: SortDir
    shown: number
    rows: BreachRow[]
    note?: string
    capped: boolean
    maxResults: number
    displayTotal: number
}

function authHeaders(): Record<string, string> {
    return {
        Accept: 'application/json',
        // Session token required for authenticated instance API calls.
        'X-UserToken': (window as unknown as { g_ck: string }).g_ck,
    }
}

/**
 * Load active assignment groups that have the ITIL role, via the
 * sys_group_has_role M2M table (filtered on role name + active group). Returns a
 * de-duplicated, name-sorted list.
 */
export async function fetchGroups(): Promise<GroupOption[]> {
    const url =
        '/api/now/table/sys_group_has_role' +
        '?sysparm_query=role.name=itil^group.active=true^ORDERBYgroup.name' +
        '&sysparm_fields=group' +
        '&sysparm_display_value=all' +
        '&sysparm_limit=5000'
    const res = await fetch(url, { headers: authHeaders() })
    if (!res.ok) {
        throw new Error('Failed to load assignment groups (HTTP ' + res.status + ').')
    }
    const data = await res.json()
    const seen: Record<string, boolean> = {}
    const out: GroupOption[] = []
    for (const r of data.result || []) {
        const g = r.group
        if (!g || !g.value || seen[g.value]) {
            continue
        }
        seen[g.value] = true
        out.push({ id: g.value, label: g.display_value || g.value })
    }
    return out
}

/**
 * Load active SLA definitions (contract_sla) for the optional SLA filter.
 * Restricted to definitions whose name contains "(Resolution)" or "(Response)".
 */
export async function fetchSlas(): Promise<GroupOption[]> {
    const url =
        '/api/now/table/contract_sla' +
        '?sysparm_query=active=true^nameLIKE(Resolution)^ORnameLIKE(Response)^ORDERBYname' +
        '&sysparm_fields=sys_id,name' +
        '&sysparm_limit=1000'
    const res = await fetch(url, { headers: authHeaders() })
    if (!res.ok) {
        throw new Error('Failed to load SLA definitions (HTTP ' + res.status + ').')
    }
    const data = await res.json()
    return (data.result || [])
        .filter((r: { sys_id: string; name: string }) => r.sys_id && r.name)
        .map((r: { sys_id: string; name: string }) => ({ id: r.sys_id, label: r.name }))
}

/**
 * Call the scoped Scripted REST endpoint. Filters breached incident SLAs by the
 * incident's current assignment group, paginated and sorted server-side.
 */
export async function fetchBreaches(
    groups: string[],
    breaching: string[],
    slas: string[],
    from: string,
    to: string,
    exclude: boolean,
    q: BreachQuery,
): Promise<BreachResponse> {
    const params = new URLSearchParams({
        group: groups.join(','),
        limit: String(q.limit),
        offset: String(q.offset),
        order_by: q.orderBy,
        order_dir: q.orderDir,
    })
    if (breaching.length) {
        params.set('breaching', breaching.join(','))
    }
    if (exclude) {
        params.set('exclude', 'true')
    }
    if (slas.length) {
        params.set('sla', slas.join(','))
    }
    if (from) {
        params.set('created_from', from)
    }
    if (to) {
        params.set('created_to', to)
    }
    const url = '/api/x_cahcs_react_rpt/sla_breach_by_team/breaches?' + params.toString()
    const res = await fetch(url, { headers: authHeaders() })
    if (!res.ok) {
        throw new Error('Breach attribution request failed (HTTP ' + res.status + ').')
    }
    const data = await res.json()
    // Accept either a bare body or a `result` envelope.
    const payload = data && data.rows === undefined && data.result ? data.result : data
    return {
        group: payload.group,
        groupName: payload.groupName || '',
        total: typeof payload.total === 'number' ? payload.total : 0,
        offset: typeof payload.offset === 'number' ? payload.offset : q.offset,
        limit: typeof payload.limit === 'number' ? payload.limit : q.limit,
        orderBy: payload.orderBy || q.orderBy,
        orderDir: payload.orderDir === 'asc' ? 'asc' : 'desc',
        shown: typeof payload.shown === 'number' ? payload.shown : 0,
        rows: Array.isArray(payload.rows) ? payload.rows : [],
        note: payload.note || payload.unattributableNote,
        capped: !!payload.capped,
        maxResults: typeof payload.maxResults === 'number' ? payload.maxResults : 1000,
        displayTotal:
            typeof payload.displayTotal === 'number'
                ? payload.displayTotal
                : typeof payload.total === 'number'
                  ? payload.total
                  : 0,
    }
}
