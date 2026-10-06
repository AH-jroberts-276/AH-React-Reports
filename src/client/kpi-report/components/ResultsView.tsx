import React, { useMemo, useState } from 'react';
import { Loader } from '@servicenow/react-components/Loader';
import { Alert } from '@servicenow/react-components/Alert';
import { Button } from '@servicenow/react-components/Button';
import { ReportResult, ReportRow } from '../services/api';
import { buildRecordLink } from '../utils/links';
import { formatWorkNotesText } from '../utils/format';
import { buildCsv } from '../utils/csv';
import { Pagination } from './Pagination';

interface Props {
    loading: boolean;
    error: string;
    data: ReportResult | null;
}

type SortKey = keyof Pick<
    ReportRow,
    'userName' | 'number' | 'assignmentGroup' | 'createdOn' | 'assignment' | 'placedOnHold' | 'resolution'
>;
type SortDir = 'asc' | 'desc';

interface Column {
    key: SortKey;
    label: string;
    tooltip?: string;
}

// Columns rendered in the results table. Rows are grouped/sorted by user first
// (then record number), matching how the server samples per user.
const COLUMNS: Column[] = [
    { key: 'number', label: 'Number', tooltip: 'Opens the Incident / Catalog Task record in a new tab.' },
    { key: 'assignmentGroup', label: 'Assignment group' },
    { key: 'userName', label: 'Assigned to' },
    { key: 'createdOn', label: 'Created On' },
    { key: 'assignment', label: 'Assignment', tooltip: 'Yes when the record was assigned to its current assignment group within 24 hours of creation.' },
    { key: 'placedOnHold', label: 'Placed On-Hold', tooltip: 'Incidents only — whether the incident was ever placed On Hold. N/A for Catalog Tasks.' },
    { key: 'resolution', label: 'Resolution', tooltip: 'Close notes recorded on the record.' },
];

function compareText(a: string, b: string): number {
    return String(a || '').toLowerCase().localeCompare(String(b || '').toLowerCase());
}

export function ResultsView({ loading, error, data }: Props) {
    const [sortKey, setSortKey] = useState<SortKey>('userName');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    const rows = data?.rows ?? [];

    const sorted = useMemo(() => {
        const copy = [...rows];
        copy.sort((a, b) => {
            let cmp = compareText(String(a[sortKey]), String(b[sortKey]));
            // Secondary sort: keep each user's rows ordered by number.
            if (cmp === 0 && sortKey !== 'number') {
                cmp = compareText(a.number, b.number);
            }
            if (cmp === 0 && sortKey !== 'userName') {
                cmp = compareText(a.userName, b.userName);
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

    // Export the full sorted result set (not just the current page). Work notes
    // are flattened into a single joined string for the CSV cell.
    const exportCsv = () => {
        const headers = COLUMNS.map(c => c.label).concat('Work Notes');
        const dataRows = sorted.map(row => {
            const base = COLUMNS.map(c => String(row[c.key] ?? ''));
            base.push(formatWorkNotesText(row.workNotes));
            return base;
        });
        const content = `\uFEFF${buildCsv(headers, dataRows)}`;
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `kpi-report-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
                content="Choose filters and select Apply to run the report."
            />
        );
    }
    if (rows.length === 0) {
        return <Alert status="info" header="No results" content="No records matched the selected filters." />;
    }

    return (
        <div className="rr-results">
            <div className="rr-results-toolbar">
                <Button
                    variant="secondary"
                    size="sm"
                    label="Export CSV"
                    icon="download-outline"
                    onClicked={exportCsv}
                />
            </div>
            <div className="rr-table-wrap">
                <table className="rr-table">
                    <thead>
                        <tr>
                            {COLUMNS.map(col => {
                                const active = col.key === sortKey;
                                return (
                                    <th
                                        key={col.key}
                                        className="rr-th"
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
                            <th className="rr-th">
                                <span className="rr-sort__label rr-th__plain">Work Notes</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map(row => (
                            <tr key={`${row.table}|${row.sysId}`}>
                                <td className="rr-td">
                                    <a
                                        className="rr-link"
                                        href={buildRecordLink(row)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {row.number || row.sysId}
                                    </a>
                                </td>
                                <td className="rr-td">{row.assignmentGroup || '—'}</td>
                                <td className="rr-td">{row.userName || 'Unknown user'}</td>
                                <td className="rr-td">{row.createdOn}</td>
                                <td className="rr-td">{row.assignment}</td>
                                <td className="rr-td">{row.placedOnHold}</td>
                                <td className="rr-td rr-td--resolution">
                                    {row.resolution ? (
                                        <div className="rr-resolution">{row.resolution}</div>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td className="rr-td rr-td--notes">
                                    {row.workNotes && row.workNotes.length ? (
                                        <details className="rr-notes">
                                            <summary className="rr-notes__summary">
                                                {row.workNotes.length} note{row.workNotes.length === 1 ? '' : 's'}
                                            </summary>
                                            <ul className="rr-notes__list">
                                                {row.workNotes.map((n, i) => (
                                                    <li key={i} className="rr-notes__item">
                                                        <span className="rr-notes__meta">
                                                            {n.author}
                                                            {n.createdOn ? ` · ${n.createdOn}` : ''}
                                                        </span>
                                                        <span className="rr-notes__value">{n.value}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
        </div>
    );
}
