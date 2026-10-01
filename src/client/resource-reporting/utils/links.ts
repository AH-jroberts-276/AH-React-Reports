import { ReportRow } from '../services/api';

// Drill-down link builders — recovered verbatim from the original report source
// (components/ReportTable.tsx). Each hours value links to the underlying list,
// opened in a new tab.

function aggregateTable(granularity: string): string {
    return granularity === 'weekly' ? 'resource_aggregate_weekly' : 'resource_aggregate_monthly';
}

function dateField(granularity: string): string {
    return granularity === 'weekly' ? 'week_starts_on' : 'month_starts_on';
}

export function buildAggregateLink(row: ReportRow, category: string, granularity: string): string {
    const table = aggregateTable(granularity);
    const field = dateField(granularity);
    const query = `user=${row.userSysId}^${field}=${row.period}^parent_category=${category}`;
    return `/${table}_list.do?sysparm_query=${encodeURIComponent(query)}`;
}

export function buildTimeCardLink(row: ReportRow, granularity: string): string {
    if (granularity === 'weekly') {
        const query = `user=${row.userSysId}^week_starts_on=${row.period}`;
        return `/time_card_list.do?sysparm_query=${encodeURIComponent(query)}`;
    }
    const monthStart = row.period;
    const date = new Date(monthStart + 'T00:00:00');
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];
    const query = `user=${row.userSysId}^week_starts_on>=${monthStart}^week_starts_on<${nextMonthStr}`;
    return `/time_card_list.do?sysparm_query=${encodeURIComponent(query)}`;
}
