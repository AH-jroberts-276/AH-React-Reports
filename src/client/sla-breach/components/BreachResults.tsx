import React from 'react'
import { Alert } from '@servicenow/react-components/Alert'
import { Loader } from '@servicenow/react-components/Loader'
import { Heading } from '@servicenow/react-components/Heading'
import { Button } from '@servicenow/react-components/Button'
import { ButtonBare } from '@servicenow/react-components/ButtonBare'
import { Select } from '@servicenow/react-components/Select'
import { TextLink } from '@servicenow/react-components/TextLink'
import { BreachResponse, SortField } from '../services/api'

interface BreachResultsProps {
    applied: boolean
    loading: boolean
    error: string | null
    result: BreachResponse | null
    pageSize: number
    onPageSize: (size: number) => void
    onSort: (field: SortField) => void
    onGoToOffset: (offset: number) => void
}

const SORT_COLUMNS: { key: SortField; label: string }[] = [
    { key: 'number', label: 'Incident' },
    { key: 'short_description', label: 'Short description' },
    { key: 'sla', label: 'SLA' },
    { key: 'planned_end_time', label: 'Breached (planned end)' },
]

const PAGE_SIZES = [10, 25, 50, 100, 200]

// Active "Assignment Group" metric definition on incident. The Breaching group
// link opens this incident's assignment-group metric_instance history.
const ASSIGNMENT_GROUP_METRIC = '39d43745c0a808ae0062603b77018b90'

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
    const start = offset + 1
    const end = offset + rows.length
    const page = Math.floor(offset / limit) + 1
    const pages = Math.max(1, Math.ceil(basis / limit))
    const arrow = (key: SortField) => (orderBy === key ? (orderDir === 'asc' ? ' ▲' : ' ▼') : '')

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

            <table className="sla-table">
                <thead>
                    <tr>
                        {SORT_COLUMNS.map((col) => (
                            <React.Fragment key={col.key}>
                                <th scope="col" aria-sort={orderBy === col.key ? (orderDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                                    <ButtonBare label={col.label + arrow(col.key)} variant="secondary" onClicked={() => props.onSort(col.key)} />
                                </th>
                                {col.key === 'number' && <th scope="col">Assignment group</th>}
                            </React.Fragment>
                        ))}
                        <th scope="col">Breaching group</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        const moved = row.inherited
                        const metricListUrl =
                            '/metric_instance_list.do?sysparm_query=' +
                            encodeURIComponent('definition=' + ASSIGNMENT_GROUP_METRIC + '^table=incident^id=' + row.incident_id + '^ORDERBYstart')
                        return (
                            <tr key={row.sys_id}>
                                <td className="sla-cell-number">
                                    {row.incident_id ? <TextLink label={row.number} href={'/incident.do?sys_id=' + row.incident_id} opensWindow /> : row.number}
                                </td>
                                <td>{row.assignment_group}</td>
                                <td>{row.short_description}</td>
                                <td>{row.sla}</td>
                                <td>{row.planned_end_time}</td>
                                <td className={moved ? 'sla-cell-moved' : ''}>
                                    {row.assigned_group_at_breach && row.incident_id ? (
                                        <TextLink label={row.assigned_group_at_breach} href={metricListUrl} opensWindow />
                                    ) : (
                                        row.assigned_group_at_breach || '—'
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            <div className="sla-toolbar sla-toolbar-bottom">
                <div className="sla-pagesize">
                    <Select
                        label="Per page"
                        fieldLayout={{ layout: 'horizontal', columns: ['auto', '90px'] }}
                        items={PAGE_SIZES.map((n) => ({ id: String(n), label: String(n) }))}
                        selectedItem={String(props.pageSize)}
                        onSelectedItemSet={(e) => props.onPageSize(Number(e.detail.payload.value))}
                    />
                </div>
                <div className="sla-pager">
                    <span className="sla-pager-info">
                        {start.toLocaleString()}–{end.toLocaleString()} of {basis.toLocaleString()}
                        {result.capped ? ' (capped)' : ''} · Page {page} of {pages}
                    </span>
                    <Button label="Previous" variant="secondary" size="sm" disabled={offset <= 0} onClicked={() => props.onGoToOffset(Math.max(0, offset - limit))} />
                    <Button label="Next" variant="secondary" size="sm" disabled={offset + rows.length >= basis} onClicked={() => props.onGoToOffset(offset + limit)} />
                </div>
            </div>
        </div>
    )
}
