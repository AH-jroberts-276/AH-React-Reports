import React, { useCallback } from 'react';
import { Select, SelectSelectedItemSet } from '@servicenow/react-components/Select';
import { PAGE_SIZE_ITEMS, DEFAULT_PAGE_SIZE } from '../utils/constants';

interface Props {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: Props) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const firstRow = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastRow = Math.min(page * pageSize, total);

    const handleSize = useCallback<SelectSelectedItemSet>(
        event => onPageSizeChange(parseInt(String(event.detail.payload.value), 10) || DEFAULT_PAGE_SIZE),
        [onPageSizeChange],
    );

    return (
        <>
            <div className="trad-table-toolbar">
                <div className="trad-page-size">
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
                <span className="trad-showing">
                    Showing {firstRow}–{lastRow} of {total} entries
                </span>
            </div>
            <div className="trad-pager">
                <button
                    type="button"
                    className="trad-pg-btn"
                    aria-label="First page"
                    disabled={page <= 1}
                    onClick={() => onPageChange(1)}
                >
                    «
                </button>
                <button
                    type="button"
                    className="trad-pg-btn"
                    aria-label="Previous page"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    ‹
                </button>
                <span className="trad-pager__status">
                    Page {page} of {totalPages}
                </span>
                <button
                    type="button"
                    className="trad-pg-btn"
                    aria-label="Next page"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    ›
                </button>
                <button
                    type="button"
                    className="trad-pg-btn"
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
