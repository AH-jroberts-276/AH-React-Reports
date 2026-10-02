import React, { useCallback, useMemo, useState } from 'react';
import { Loader } from '@servicenow/react-components/Loader';
import { Alert } from '@servicenow/react-components/Alert';
import { Button } from '@servicenow/react-components/Button';
import { Select, SelectSelectedItemSet } from '@servicenow/react-components/Select';
import { DashboardRow } from '../services/api';
import { COLUMNS, PAGE_SIZE_ITEMS, DATE_SORT_FIELD, Column } from '../utils/constants';
import { csvField } from '../utils/csv';

interface Props {
    rows: DashboardRow[];
    loading: boolean;
    error: string;
    prompt: string;
    page: number;
    pageSize: number;
    onPageChange: (p: number) => void;
    onPageSizeChange: (n: number) => void;
    overflowMessage: string;
}

type SortDir = 'asc' | 'desc';

export function ResultsTable({
    rows,
    loading,
    error,
    prompt,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    overflowMessage,
}: Props) {
    const [sortKey, setSortKey] = useState<string>('type');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    // 'matchedVia' only when aggregate rows exist; 'task' only for RA rows.
    const visibleColumns = useMemo<Column[]>(() => {
        const hasAggregate = rows.some(r => r.kind === 'project' || r.kind === 'demand');
        const hasRa = rows.some(r => r.kind === 'ra');
        return COLUMNS.filter(c => {
            if (c.key === 'matchedVia') return hasAggregate;
            if (c.key === 'task') return hasRa;
            return true;
        });
    }, [rows]);

    const effectiveSortKey = visibleColumns.some(c => c.key === sortKey) ? sortKey : 'type';
    const effectiveSortDir = visibleColumns.some(c => c.key === sortKey) ? sortDir : 'asc';

    const sortedRows = useMemo(() => {
        const dateField = DATE_SORT_FIELD[effectiveSortKey];
        const copy = [...rows];
        copy.sort((a, b) => {
            let cmp: number;
            if (dateField) {
                const av = (a as unknown as Record<string, string>)[dateField] || '';
                const bv = (b as unknown as Record<string, string>)[dateField] || '';
                cmp = av < bv ? -1 : av > bv ? 1 : 0;
                if (cmp === 0) cmp = a.number.localeCompare(b.number, undefined, { numeric: true });
            } else {
                const av = String((a as unknown as Record<string, string>)[effectiveSortKey] ?? '');
                const bv = String((b as unknown as Record<string, string>)[effectiveSortKey] ?? '');
                cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' });
                if (cmp === 0) cmp = a.number.localeCompare(b.number, undefined, { numeric: true });
            }
            return effectiveSortDir === 'asc' ? cmp : -cmp;
        });
        return copy;
    }, [rows, effectiveSortKey, effectiveSortDir]);

    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;
    const pageRows = sortedRows.slice(start, start + pageSize);
    const rangeStart = total === 0 ? 0 : start + 1;
    const rangeEnd = Math.min(start + pageSize, total);

    const handleSort = (key: string) => {
        if (key === effectiveSortKey) {
            setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const handlePageSize = useCallback<SelectSelectedItemSet>(
        event => onPageSizeChange(Number(event.detail.payload.value)),
        [onPageSizeChange],
    );

    const exportCsv = () => {
        const lines = [visibleColumns.map(c => csvField(c.label)).join(',')];
        for (const row of sortedRows) {
            lines.push(
                visibleColumns
                    .map(c => csvField(String((row as unknown as Record<string, unknown>)[c.key] ?? '')))
                    .join(','),
            );
        }
        let content = `\uFEFF${lines.join('\r\n')}`;
        if (overflowMessage) {
            content += `\r\n\r\nNOTE: Some results were truncated, so this export may be incomplete.\r\n${overflowMessage}`;
        }
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `task-resource-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="trad-state">
                <Loader label="Loading task and resource assignments…" size="lg" announceLabel />
            </div>
        );
    }
    if (error) {
        return (
            <div className="trad-state">
                <Alert status="critical" header="Unable to load results" content={error} />
            </div>
        );
    }
    if (prompt) {
        return (
            <div className="trad-state">
                <Alert status="info" header="Choose filters to begin" content={prompt} />
            </div>
        );
    }
    if (total === 0) {
        return (
            <div className="trad-state">
                <Alert
                    status="info"
                    header="No matching records"
                    content="No tasks or resource assignments match the selected filters."
                />
            </div>
        );
    }

    const renderCell = (row: DashboardRow, col: Column): React.ReactNode => {
        if (col.key === 'type') {
            return (
                <span className={`trad-type-badge trad-type-badge--${row.kind === 'ra' ? 'resource' : 'task'}`}>
                    {row.type}
                </span>
            );
        }
        if (col.key === 'number') {
            return (
                <a
                    className="trad-link"
                    href={`/${row.table}.do?sys_id=${row.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {row.number}
                </a>
            );
        }
        if (col.key === 'task') {
            return row.taskId ? (
                <a
                    className="trad-link"
                    href={`/task.do?sys_id=${row.taskId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {row.task}
                </a>
            ) : (
                row.task
            );
        }
        return (row as unknown as Record<string, string>)[col.key];
    };

    return (
        <>
            {overflowMessage && (
                <div className="trad-results__warning">
                    <Alert status="warning" header="Results truncated" content={overflowMessage} />
                </div>
            )}
            <div className="trad-results__toolbar">
                <Button variant="secondary" size="sm" label="Export CSV" icon="download-outline" onClicked={exportCsv} />
            </div>
            <table className="trad-table">
                <thead>
                    <tr>
                        {visibleColumns.map(col => {
                            const active = col.key === effectiveSortKey;
                            const indicator = active ? (effectiveSortDir === 'asc' ? ' ↑' : ' ↓') : '';
                            return (
                                <th
                                    key={col.key}
                                    aria-sort={active ? (effectiveSortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSort(col.key)}
                                >
                                    {col.label}
                                    {indicator}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {pageRows.map(row => (
                        <tr key={`${row.table}:${row.id}`}>
                            {visibleColumns.map(col => (
                                <td key={col.key}>{renderCell(row, col)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="trad-pagination">
                <div className="trad-pagination__size">
                    <Select
                        label="Per page"
                        items={PAGE_SIZE_ITEMS}
                        selectedItem={String(pageSize)}
                        onSelectedItemSet={handlePageSize}
                    />
                </div>
                <div className="trad-pagination__info">
                    {`${rangeStart}\u2013${rangeEnd} of ${total} \u00b7 Page ${currentPage} of ${totalPages}`}
                </div>
                <div className="trad-pagination__controls">
                    <Button
                        variant="secondary"
                        size="sm"
                        label="Previous"
                        icon="arrow-left-outline"
                        disabled={currentPage <= 1}
                        onClicked={() => onPageChange(currentPage - 1)}
                    />
                    <Button
                        variant="secondary"
                        size="sm"
                        label="Next"
                        icon="arrow-right-outline"
                        disabled={currentPage >= totalPages}
                        onClicked={() => onPageChange(currentPage + 1)}
                    />
                </div>
            </div>
        </>
    );
}
