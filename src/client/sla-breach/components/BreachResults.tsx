import React from 'react'
import { Alert } from '@servicenow/react-components/Alert'
import { Loader } from '@servicenow/react-components/Loader'
import { Heading } from '@servicenow/react-components/Heading'
import { Button } from '@servicenow/react-components/Button'
import { Select } from '@servicenow/react-components/Select'
import { BreachResponse, SortField } from '../services/api'
import { buildIncidentLink, buildBreachMetricLink } from '../utils/links'

interface BreachResultsProps {
    applied: boolean
    loading: boolean
    error: string | null
    result: BreachResponse | null
    pageSize: number
    onPageSize: (size: number) => void
    onSort: (field: SortField) => void
    onGoToOffset: (offset: number) => void
    onExport: () => void
    exporting: boolean
}

const SORT_COLUMNS: { key: SortField; label: string }[] = [
    { key: 'number', label: 'Incident' },
    { key: 'short_description', label: 'Short description' },
    { key: 'sla', label: 'SLA' },
    { key: 'planned_end_time', label: 'Breached (planned end)' },
]

const PAGE_SIZE_ITEMS = [
    { id: '10', label: '10' },
    { id: '25', label: '25' },
    { id: '50', label: '50' },
    { id: '100', label: '100' },
]

export default function BreachResults(props: BreachResultsProps) {
    if (props.loading) {
        return <Loader label="Loading breached SLAs and resolving the group assigned at each breach…" size="md" />
    }
    if (props.error) {
        return <Alert status="critical" header="Could not load breaches" content={props.error} />
    }
    if (!props.applied || !props.result) {
        return (
            <Alert
                status="info"
                header="Select a group to begin"
                content="Choose an assignment group or breaching group (and optionally an SLA or created-date range), then click Apply."
            />
        )
    }

    const result = props.result
    const rows = result.rows || []

    if (result.total === 0 || rows.length === 0) {
        return (
            <Alert
                status="info"
                header={'No breached SLAs for ' + (result.groupName || 'these filters')}
                content={result.note || 'No breached incident SLAs match the selected filters.'}
            />
        )
    }

    const { offset, limit, total, orderBy, orderDir } = result
    // When capped, paginate within the first `maxResults` records only.
    const basis = result.capped ? Math.min(result.displayTotal || result.maxResults, result.maxResults) : total
    const page = Math.floor(offset / limit) + 1
    const totalPages = Math.max(1, Math.ceil(basis / limit))
    const start = basis === 0 ? 0 : offset + 1
    const end = offset + rows.length

    const sortHeader = (key: SortField, label: string) => (
        <th
            key={key}
            className="sla-th"
            aria-sort={orderBy === key ? (orderDir === 'asc' ? 'ascending' : 'descending') : 'none'}
        >
            <button type="button" className="sla-sort" onClick={() => props.onSort(key)}>
                <span className="sla-sort__label">{label}</span>
                <span className="sla-sort__ind" aria-hidden>
                    {orderBy === key ? (orderDir === 'asc' ? '\u2191' : '\u2193') : '\u21c5'}
                </span>
            </button>
        </th>
    )

    const col = (key: SortField) => SORT_COLUMNS.find((c) => c.key === key)!

    return (
        <div className="sla-results">
            <Heading
                level={2}
                variant="title-secondary"
                label={
                    total.toLocaleString() +
                    ' breached SLA' +
                    (total === 1 ? '' : 's') +
                    ' on incidents currently assigned to ' +
                    result.groupName
                }
            />

            {result.capped && (
                <div className="sla-cap-alert">
                    <Alert
                        status="warning"
                        header={'More than ' + result.maxResults.toLocaleString() + ' records were returned'}
                        content={
                            result.total.toLocaleString() +
                            ' matching breached SLAs were found. Showing the first ' +
                            result.maxResults.toLocaleString() +
                            ' — add more filters (assignment group, breaching group, SLA, or a created-date range) to narrow the results.'
                        }
                    />
                </div>
            )}

            <div className="sla-results-toolbar">
                <Button
                    variant="secondary"
                    size="sm"
                    label="Export CSV"
                    icon="download-outline"
                    disabled={props.exporting || rows.length === 0}
                    onClicked={props.onExport}
                />
            </div>

            <div className="sla-table-wrap">
                <table className="sla-table">
                    <thead>
                        <tr>
                            {sortHeader('number', col('number').label)}
                            <th className="sla-th">Assignment group</th>
                            {sortHeader('short_description', col('short_description').label)}
                            {sortHeader('sla', col('sla').label)}
                            {sortHeader('planned_end_time', col('planned_end_time').label)}
                            <th className="sla-th">Breaching group</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => {
                            const moved = row.inherited
                            return (
                                <tr key={row.sys_id}>
                                    <td className="sla-td sla-cell-number">
                                        {row.incident_id ? (
                                            <a
                                                className="sla-link"
                                                href={buildIncidentLink(row.incident_id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {row.number}
                                            </a>
                                        ) : (
                                            row.number
                                        )}
                                    </td>
                                    <td className="sla-td">{row.assignment_group}</td>
                                    <td className="sla-td">{row.short_description}</td>
                                    <td className="sla-td">{row.sla}</td>
                                    <td className="sla-td">{row.planned_end_time}</td>
                                    <td className={moved ? 'sla-td sla-cell-moved' : 'sla-td'}>
                                        {row.assigned_group_at_breach && row.incident_id ? (
                                            <a
                                                className="sla-link"
                                                href={buildBreachMetricLink(row.incident_id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {row.assigned_group_at_breach}
                                            </a>
                                        ) : (
                                            row.assigned_group_at_breach || '—'
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <div className="sla-table-toolbar">
                <div className="sla-page-size">
                    <span>Show</span>
                    <Select
                        label=""
                        items={PAGE_SIZE_ITEMS}
                        selectedItem={String(props.pageSize)}
                        configAria={{ trigger: { 'aria-label': 'Entries per page' } }}
                        onSelectedItemSet={(e) => props.onPageSize(Number(e.detail.payload.value))}
                    />
                    <span>entries</span>
                </div>
                <span className="sla-showing">
                    Showing {start.toLocaleString()}-{end.toLocaleString()} of {basis.toLocaleString()}
                    {result.capped ? ' (capped)' : ''}
                </span>
            </div>
            <div className="sla-pager">
                <button
                    type="button"
                    className="sla-pg-btn"
                    aria-label="First page"
                    disabled={offset <= 0}
                    onClick={() => props.onGoToOffset(0)}
                >
                    «
                </button>
                <button
                    type="button"
                    className="sla-pg-btn"
                    aria-label="Previous page"
                    disabled={offset <= 0}
                    onClick={() => props.onGoToOffset(Math.max(0, offset - limit))}
                >
                    ‹
                </button>
                <span className="sla-pager__status">
                    Page {page} of {totalPages}
                </span>
                <button
                    type="button"
                    className="sla-pg-btn"
                    aria-label="Next page"
                    disabled={offset + rows.length >= basis}
                    onClick={() => props.onGoToOffset(offset + limit)}
                >
                    ›
                </button>
                <button
                    type="button"
                    className="sla-pg-btn"
                    aria-label="Last page"
                    disabled={page >= totalPages}
                    onClick={() => props.onGoToOffset((totalPages - 1) * limit)}
                >
                    »
                </button>
            </div>
        </div>
    )
}
