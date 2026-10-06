import { ReportRow } from '../services/api';

// Drill-down link builder for the KPI Report. Each row's Number links to the
// underlying record's form (incident or sc_task), opened in a new tab.
export function buildRecordLink(row: ReportRow): string {
    const table = row.table || 'incident';
    return `/${table}.do?sys_id=${encodeURIComponent(row.sysId)}`;
}
