import React, { useEffect, useState } from 'react'
import { Heading } from '@servicenow/react-components/Heading'
import FilterBar from './components/FilterBar'
import BreachResults from './components/BreachResults'
import ErrorBoundary from './components/ErrorBoundary'
import {
    fetchGroups,
    fetchSlas,
    fetchBreaches,
    GroupOption,
    BreachResponse,
    SortField,
    SortDir,
} from './services/api'
import { buildCsv } from './utils/csv'
import './app.css'

const DEFAULT_PAGE_SIZE = 50

interface AppliedFilters {
    groups: string[]
    breaching: string[]
    slas: string[]
    from: string
    to: string
    exclude: boolean
}

export default function App() {
    const [groups, setGroups] = useState<GroupOption[]>([])
    const [slas, setSlas] = useState<GroupOption[]>([])
    const [selectedGroups, setSelectedGroups] = useState<GroupOption[]>([])
    const [selectedBreaching, setSelectedBreaching] = useState<GroupOption[]>([])
    const [selectedSlas, setSelectedSlas] = useState<GroupOption[]>([])
    const [createdFrom, setCreatedFrom] = useState('')
    const [createdTo, setCreatedTo] = useState('')
    const [excludeGroup, setExcludeGroup] = useState(false)

    const [applied, setApplied] = useState<AppliedFilters | null>(null)

    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [orderBy, setOrderBy] = useState<SortField>('number')
    const [orderDir, setOrderDir] = useState<SortDir>('desc')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<BreachResponse | null>(null)
    const [exporting, setExporting] = useState(false)

    const load = (f: AppliedFilters, off: number, size: number, ob: SortField, od: SortDir) => {
        setLoading(true)
        setError(null)
        fetchBreaches(f.groups, f.breaching, f.slas, f.from, f.to, f.exclude, {
            limit: size,
            offset: off,
            orderBy: ob,
            orderDir: od,
        })
            .then(setResult)
            .catch((e) => setError(String(e && e.message ? e.message : e)))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchGroups()
            .then(setGroups)
            .catch((e) => setError(String(e && e.message ? e.message : e)))
        fetchSlas()
            .then(setSlas)
            .catch(() => undefined)

        // Deep-link / diagnostics support: auto-apply when filters are in the URL.
        const params = new URLSearchParams(window.location.search)
        const gids = (params.get('group') || '').split(',').filter(Boolean)
        const bids = (params.get('breaching') || '').split(',').filter(Boolean)
        if (gids.length || bids.length) {
            const sids = (params.get('sla') || '').split(',').filter(Boolean)
            const f: AppliedFilters = {
                groups: gids,
                breaching: bids,
                slas: sids,
                from: params.get('created_from') || '',
                to: params.get('created_to') || '',
                exclude: params.get('exclude') === 'true',
            }
            setSelectedGroups(gids.map((id) => ({ id, label: id })))
            setSelectedBreaching(bids.map((id) => ({ id, label: id })))
            setSelectedSlas(sids.map((id) => ({ id, label: id })))
            setCreatedFrom(f.from)
            setCreatedTo(f.to)
            setExcludeGroup(f.exclude)
            setApplied(f)
            load(f, 0, DEFAULT_PAGE_SIZE, 'number', 'desc')
        }
    }, [])

    const onApply = () => {
        if (selectedGroups.length === 0 && selectedBreaching.length === 0) {
            return
        }
        const f: AppliedFilters = {
            groups: selectedGroups.map((g) => g.id),
            breaching: selectedBreaching.map((g) => g.id),
            slas: selectedSlas.map((s) => s.id),
            from: createdFrom,
            to: createdTo,
            exclude: excludeGroup,
        }
        setApplied(f)
        load(f, 0, pageSize, orderBy, orderDir)
    }

    const onSort = (field: SortField) => {
        if (!applied) {
            return
        }
        let dir: SortDir
        if (orderBy === field) {
            dir = orderDir === 'asc' ? 'desc' : 'asc'
        } else {
            dir = field === 'number' ? 'desc' : 'asc'
        }
        setOrderBy(field)
        setOrderDir(dir)
        load(applied, 0, pageSize, field, dir)
    }

    const onPageSize = (size: number) => {
        setPageSize(size)
        if (applied) {
            load(applied, 0, size, orderBy, orderDir)
        }
    }

    const goToOffset = (off: number) => {
        if (applied) {
            load(applied, off, pageSize, orderBy, orderDir)
        }
    }

    const onExport = () => {
        if (!applied) {
            return
        }
        setExporting(true)
        fetchBreaches(applied.groups, applied.breaching, applied.slas, applied.from, applied.to, applied.exclude, {
            limit: result?.maxResults || 1000,
            offset: 0,
            orderBy,
            orderDir,
        })
            .then((response) => {
                const headers = [
                    'Incident',
                    'Assignment group',
                    'Short description',
                    'SLA',
                    'Breached (planned end)',
                    'Breaching group',
                ]
                const dataRows = (response.rows || []).map((row) => [
                    row.number,
                    row.assignment_group,
                    row.short_description,
                    row.sla,
                    row.planned_end_time,
                    row.assigned_group_at_breach,
                ])
                let content = '\uFEFF' + buildCsv(headers, dataRows)
                if (response.capped) {
                    content +=
                        '\r\nNote: export truncated to the first ' +
                        response.maxResults.toLocaleString() +
                        ' records (server cap).'
                }
                const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `sla-breach-by-team-${new Date().toISOString().slice(0, 10)}.csv`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
            })
            .catch((e) => setError(String(e && e.message ? e.message : e)))
            .finally(() => setExporting(false))
    }

    return (
        <div className="sla-dashboard">
            <header className="sla-header">
                <Heading level={1} variant="header-primary" label="SLA Breach by Team" />
                <p className="sla-subtitle">
                    Lists incident SLAs that have breached. Filter by the incident's current assignment group, and
                    optionally by SLA or a created-date range. The <strong>Breaching group</strong> column shows the
                    group the incident was assigned to at the exact time the SLA breached (from the assignment-group
                    metric history), which can differ from its current group.
                </p>
            </header>
            <section className="sla-card sla-filter-card">
                <FilterBar
                    groups={groups}
                    selectedGroups={selectedGroups}
                    onGroupsSelected={setSelectedGroups}
                    selectedBreaching={selectedBreaching}
                    onBreachingSelected={setSelectedBreaching}
                    slas={slas}
                    selectedSlas={selectedSlas}
                    onSlasSelected={setSelectedSlas}
                    createdFrom={createdFrom}
                    createdTo={createdTo}
                    onCreatedFrom={setCreatedFrom}
                    onCreatedTo={setCreatedTo}
                    excludeGroup={excludeGroup}
                    onExcludeGroup={setExcludeGroup}
                    onApply={onApply}
                    loading={loading}
                />
            </section>
            <ErrorBoundary>
                <BreachResults
                    applied={!!applied}
                    loading={loading}
                    error={error}
                    result={result}
                    pageSize={pageSize}
                    onPageSize={onPageSize}
                    onSort={onSort}
                    onGoToOffset={goToOffset}
                    onExport={onExport}
                    exporting={exporting}
                />
            </ErrorBoundary>
        </div>
    )
}
