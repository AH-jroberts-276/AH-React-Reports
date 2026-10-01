import React, { useMemo, useState } from 'react';
import { Loader } from '@servicenow/react-components/Loader';
import { Alert } from '@servicenow/react-components/Alert';
import { ReportResult, ReportRow } from '../services/api';
import { formatHours, formatUtilization } from '../utils/format';
import { buildAggregateLink, buildTimeCardLink } from '../utils/links';
import { Pagination } from './Pagination';

interface Props {
    loading: boolean;
    error: string;
    data: ReportResult | null;
    granularity: 'weekly' | 'monthly';
}

type SortKey = keyof Pick<
    ReportRow,
    'period' | 'userName' | 'capacity' | 'availability' | 'allocated' | 'actual' | 'timeCardHours' | 'utilization'
>;
type SortDir = 'asc' | 'desc';

// Aggregate categories that drill into the resource aggregate list.
type AggregateKey = 'capacity' | 'availability' | 'allocated' | 'actual';

interface Column {
    key: SortKey;
    label: string;
    numeric: boolean;
    tooltip?: string;
}

// Column tooltips recovered from the original report source.
const COLUMNS: Column[] = [
    { key: 'period', label: 'Period', numeric: false },
    { key: 'userName', label: 'User', numeric: false },
    { key: 'capacity', label: 'Capacity (hrs)', numeric: true, tooltip: 'Scheduled capacity for the period. Source: Resource Aggregate table (parent_category = capacity).' },
    { key: 'availability', label: 'Availability (hrs)', numeric: true, tooltip: 'Unallocated availability for the period. Source: Resource Aggregate table (parent_category = availability).' },
    { key: 'allocated', label: 'Allocated (hrs)', numeric: true, tooltip: 'Hours allocated via Resource Plans for the period. Source: Resource Aggregate table (parent_category = allocated).' },
    { key: 'actual', label: 'Actual Hours', numeric: true, tooltip: 'Resource Assignments only. This reflects time logged that is associated with a specific RA. Source: Resource Aggregate table (parent_category = actual).' },
    { key: 'timeCardHours', label: 'Time Card Hours', numeric: true, tooltip: 'Total hours from all time cards submitted by this user in the period, including entries with no associated Resource Assignment. Source: time_card table.' },
    { key: 'utilization', label: 'Utilization %', numeric: true, tooltip: 'Percentage of capacity actually used. Calculated as: (Time Card Hours ÷ Capacity) × 100. A value above 100% means the user logged more hours than their scheduled capacity.' },
];

const AGGREGATE_KEYS: AggregateKey[] = ['capacity', 'availability', 'allocated', 'actual'];

export function ResultsView({ loading, error, data, granularity }: Props) {
    const [sortKey, setSortKey] = useState<SortKey>('period');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    const rows = data?.rows ?? [];

    const sorted = useMemo(() => {
        const column = COLUMNS.find(c => c.key === sortKey);
        const copy = [...rows];
        copy.sort((a, b) => {
            let cmp: number;
            if (column?.numeric) {
                cmp = (a[sortKey] as number) - (b[sortKey] as number);
            } else if (sortKey === 'period') {
                cmp = a.period < b.period ? -1 : a.period > b.period ? 1 : 0;
            } else {
                cmp = String(a[sortKey]).toLowerCase().localeCompare(String(b[sortKey]).toLowerCase());
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });
        return copy;
    }, [rows, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;
    const visible = sorted.slice(start, start + pageSize);

    const handleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
        setPage(1);
    };

    if (loading) {
        return <Loader label="Loading report data..." size="lg" announceLabel />;
    }
    if (error) {
        return <Alert status="critical" header="Unable to load report" content={error} />;
    }
    if (!data) {
        return (
            <Alert
                status="info"
                header="No report yet"
                content="Choose filters and select Generate Report to run the report."
            />
        );
    }
    if (rows.length === 0) {
        return <Alert status="info" header="No results" content="No resource data matched the selected filters." />;
    }

    return (
        <div className="rr-results">
            {data.truncated && (
                <Alert
                    status="warning"
                    header="Results truncated"
                    content="Only the first 10,000 rows are shown. Narrow the date range or filters to see all data."
                />
            )}
            <Pagination
                page={currentPage}
                pageSize={pageSize}
                total={sorted.length}
                onPageChange={setPage}
                onPageSizeChange={size => {
                    setPageSize(size);
                    setPage(1);
                }}
            />
            <div className="rr-table-wrap">
                <table className="rr-table">
                    <thead>
                        <tr>
                            {COLUMNS.map(col => {
                                const active = col.key === sortKey;
                                return (
                                    <th
                                        key={col.key}
                                        className={col.numeric ? 'rr-th rr-th--num' : 'rr-th'}
                                        aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <button
                                            type="button"
                                            className={`rr-sort${col.tooltip ? ' rr-sort--tip' : ''}`}
                                            title={col.tooltip}
                                            onClick={() => handleSort(col.key)}
                                        >
                                            <span className="rr-sort__label">{col.label}</span>
                                            <span className="rr-sort__ind" aria-hidden="true">
                                                {active ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                                            </span>
                                        </button>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map(row => (
                            <tr key={`${row.period}|${row.userSysId}`}>
                                <td className="rr-td">{row.periodLabel}</td>
                                <td className="rr-td">{row.userName || 'Unknown user'}</td>
                                {AGGREGATE_KEYS.map(cat => (
                                    <td key={cat} className="rr-td rr-td--num">
                                        <a
                                            className="rr-link"
                                            href={buildAggregateLink(row, cat, granularity)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {formatHours(row[cat])}
                                        </a>
                                    </td>
                                ))}
                                <td className="rr-td rr-td--num">
                                    <a
                                        className="rr-link"
                                        href={buildTimeCardLink(row, granularity)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {formatHours(row.timeCardHours)}
                                    </a>
                                </td>
                                <td className="rr-td rr-td--num">{formatUtilization(row.utilization)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
