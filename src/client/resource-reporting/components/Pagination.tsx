import React, { useCallback } from 'react';
import { Select, SelectSelectedItemSet } from '@servicenow/react-components/Select';

interface Props {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_ITEMS = [
    { id: '10', label: '10' },
    { id: '25', label: '25' },
    { id: '50', label: '50' },
    { id: '100', label: '100' },
];

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: Props) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const firstRow = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastRow = Math.min(page * pageSize, total);

    const handleSize = useCallback<SelectSelectedItemSet>(
        event => onPageSizeChange(parseInt(String(event.detail.payload.value), 10) || 25),
        [onPageSizeChange]
    );

    return (
        <>
            <div className="rr-table-toolbar">
                <div className="rr-page-size">
                    <span>Show</span>
                    <Select
                        label=""
                        items={PAGE_SIZE_ITEMS}
                        selectedItem={String(pageSize)}
                        configAria={{ trigger: { 'aria-label': 'Entries per page' } }}
                        onSelectedItemSet={handleSize}
                    />
                    <span>entries</span>
                </div>
                <span className="rr-showing">
                    Showing {firstRow}–{lastRow} of {total} entries
                </span>
            </div>
            <div className="rr-pager">
                <button
                    type="button"
                    className="rr-pg-btn"
                    aria-label="First page"
                    disabled={page <= 1}
                    onClick={() => onPageChange(1)}
                >
                    «
                </button>
                <button
                    type="button"
                    className="rr-pg-btn"
                    aria-label="Previous page"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    ‹
                </button>
                <span className="rr-pager__status">
                    Page {page} of {totalPages}
                </span>
                <button
                    type="button"
                    className="rr-pg-btn"
                    aria-label="Next page"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    ›
                </button>
                <button
                    type="button"
                    className="rr-pg-btn"
                    aria-label="Last page"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(totalPages)}
                >
                    »
                </button>
            </div>
        </>
    );
}
