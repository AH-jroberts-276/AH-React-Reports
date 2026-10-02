// Drill-down link builders — extracted verbatim from the inline hrefs that
// ResultsTable's renderCell previously constructed. Pure string helpers; each
// record link is opened in a new tab by the caller.

export function buildRecordLink(table: string, sysId: string): string {
    return `/${table}.do?sys_id=${sysId}`;
}

export function buildTaskLink(taskId: string): string {
    return `/task.do?sys_id=${taskId}`;
}
