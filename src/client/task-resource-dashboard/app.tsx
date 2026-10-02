import React, { useCallback, useEffect, useState } from 'react';
import { Heading } from '@servicenow/react-components/Heading';
import { FilterBar } from './components/FilterBar';
import { ResultsTable } from './components/ResultsTable';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
    fetchGroups,
    fetchGroupMembers,
    fetchStatusOptions,
    fetchDashboardRows,
    Option,
    DashboardRow,
    Overflow,
} from './services/api';
import { DEFAULT_PAGE_SIZE } from './utils/constants';
import './app.css';

const PROMPT = 'Choose filters to begin';
const TITLE = 'Task & Resource Assignment Dashboard';

export default function App() {
    const [groups, setGroups] = useState<Option[]>([]);
    const [users, setUsers] = useState<Option[]>([]);
    const [groupsLoading, setGroupsLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [groupIds, setGroupIds] = useState<string[]>([]);
    const [userIds, setUserIds] = useState<string[]>([]);
    const [typeSel, setTypeSel] = useState<string[]>([]);
    const [statusSel, setStatusSel] = useState<string[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusOptions, setStatusOptions] = useState<Option[]>([]);
    const [allRows, setAllRows] = useState<DashboardRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [overflows, setOverflows] = useState<Overflow[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [hasRun, setHasRun] = useState(false);

    // On mount: set the Polaris permalink (iframe) and load the group options.
    useEffect(() => {
        if (window.self !== window.top) {
            const ce = (window as unknown as { CustomEvent?: { fireTop?: (name: string, detail: unknown) => void } })
                .CustomEvent;
            ce?.fireTop?.('magellanNavigator.permalink.set', {
                relativePath: window.location.pathname + window.location.search,
                title: TITLE,
            });
        }
        fetchGroups()
            .then(setGroups)
            .catch(() => setGroups([]))
            .finally(() => setGroupsLoading(false));
    }, []);

    // When the group selection changes, reload members and drop stale users.
    useEffect(() => {
        if (!groupIds.length) {
            setUsers([]);
            setUserIds(ids => (ids.length ? [] : ids));
            return;
        }
        setUsersLoading(true);
        fetchGroupMembers(groupIds)
            .then(members => {
                setUsers(members);
                const valid = new Set(members.map(m => m.value));
                setUserIds(ids => ids.filter(id => valid.has(id)));
            })
            .catch(() => setUsers([]))
            .finally(() => setUsersLoading(false));
    }, [groupIds]);

    // When the work-type selection changes, reload status options and prune.
    useEffect(() => {
        if (!typeSel.length) {
            setStatusOptions([]);
            setStatusSel(sel => (sel.length ? [] : sel));
            return;
        }
        fetchStatusOptions(typeSel)
            .then(opts => {
                setStatusOptions(opts);
                const valid = new Set(opts.map(o => o.value));
                setStatusSel(sel => sel.filter(s => valid.has(s)));
            })
            .catch(() => setStatusOptions([]));
    }, [typeSel]);

    const handleApply = useCallback(async () => {
        setLoading(true);
        setError('');
        setHasRun(true);
        try {
            const result = await fetchDashboardRows({
                groupIds,
                userIds,
                memberIds: users.map(u => u.value),
                typeIds: typeSel,
                statusLabels: statusSel,
                startDate,
                endDate,
            });
            setAllRows(result.rows);
            setOverflows(result.overflows);
            setPage(1);
        } catch (e) {
            setAllRows([]);
            setOverflows([]);
            setError(e instanceof Error ? e.message : 'Failed to load results.');
        } finally {
            setLoading(false);
        }
    }, [groupIds, userIds, users, typeSel, statusSel, startDate, endDate]);

    const handleClear = useCallback(() => {
        setGroupIds([]);
        setUserIds([]);
        setTypeSel([]);
        setStatusSel([]);
        setStartDate('');
        setEndDate('');
        setAllRows([]);
        setError('');
        setOverflows([]);
        setPage(1);
        setHasRun(false);
    }, []);

    const overflowMessage = overflows.length
        ? `Showing the first 1000 of ${overflows
              .map(o => `${o.label} (${o.total})`)
              .join(', ')}. Narrow your filters to see every record.`
        : '';

    const prompt = !hasRun && !loading && allRows.length === 0 ? PROMPT : '';

    return (
        <ErrorBoundary>
            <div className="trad-app">
                <header className="trad-app__header">
                    <Heading label={TITLE} level={1} variant="header-primary" />
                    <p className="trad-app__subtitle">
                        Unified view of tasks and resource assignments filtered by assignment group and user.
                    </p>
                </header>

                <div className="trad-card">
                    <FilterBar
                        groups={groups}
                        users={users}
                        groupsLoading={groupsLoading}
                        usersLoading={usersLoading}
                        groupIds={groupIds}
                        userIds={userIds}
                        typeSel={typeSel}
                        statusSel={statusSel}
                        startDate={startDate}
                        endDate={endDate}
                        statuses={statusOptions}
                        busy={loading}
                        onGroupChange={setGroupIds}
                        onUserChange={setUserIds}
                        onTypeChange={setTypeSel}
                        onStatusChange={setStatusSel}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                        onApply={handleApply}
                        onClear={handleClear}
                    />
                </div>

                <div className="trad-card trad-card--results">
                    <div className="trad-results__meta">{`${allRows.length} record(s)`}</div>
                    <ResultsTable
                        rows={allRows}
                        loading={loading}
                        error={error}
                        prompt={prompt}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={n => {
                            setPageSize(n);
                            setPage(1);
                        }}
                        overflowMessage={overflowMessage}
                    />
                </div>
            </div>
        </ErrorBoundary>
    );
}
