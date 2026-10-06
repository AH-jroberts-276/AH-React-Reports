// Drill-down link builders — extracted verbatim from the inline hrefs that
// ResultsTable's renderCell previously constructed. Pure string helpers; each
// record link is opened in a new tab by the caller.

export function buildRecordLink(table: string, sysId: string): string {
    return `/${table}.do?sys_id=${sysId}`;
}

export function buildTaskLink(taskId: string): string {
    return `/task.do?sys_id=${taskId}`;
}

// List view of the resource assignments that produced an aggregate match.
// `encodedQuery` is built by the data layer (fetchAggregate) and already
// scopes to the matched users/members, date window, and this record.
export function buildRaListLink(encodedQuery: string): string {
    return `/sn_plng_att_core_resource_assignment_list.do?sysparm_query=${encodeURIComponent(encodedQuery)}`;
}
