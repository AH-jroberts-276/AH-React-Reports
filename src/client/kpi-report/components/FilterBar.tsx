import React, { useCallback, useEffect, useState } from 'react';
import { DateTime } from '@servicenow/react-components/DateTime';
import { Button } from '@servicenow/react-components/Button';
import { Checkbox } from '@servicenow/react-components/Checkbox';
import { MultiSelect } from './MultiSelect';
import { fetchGroups, fetchGroupMembers, Option, ReportParams } from '../services/api';

interface Props {
    loading: boolean;
    hasData: boolean;
    onGenerate: (params: ReportParams) => void;
    onRefresh: (params: ReportParams) => void;
}

// State/server contract stays canonical yyyy-MM-dd; the DateTime field only
// DISPLAYS MM-dd-yyyy (matches the SLA Breach report's date handling).
function isoToDisplay(iso: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? `${m[2]}-${m[3]}-${m[1]}` : '';
}
function displayToIso(display: string): string {
    const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(display || '');
    return m ? `${m[3]}-${m[1]}-${m[2]}` : '';
}

// TRD-style grouped filter card. Assignment groups are preloaded from the
// role-scoped (ITIL / PPS-resource) list; selecting one or more groups preloads
// their active members into the Users field (so the full list shows on open).
// The Users field is disabled until a group is chosen, and stale user
// selections are pruned (still-valid ones kept) when the group changes — the
// same cascade as the Task & Resource Assignment Dashboard.
export function FilterBar({ loading, hasData, onGenerate, onRefresh }: Props) {
    const [groups, setGroups] = useState<Option[]>([]);
    const [users, setUsers] = useState<Option[]>([]);
    const [groupsLoading, setGroupsLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [groupIds, setGroupIds] = useState<string[]>([]);
    const [userIds, setUserIds] = useState<string[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [limitWorkNotesToAssignee, setLimitWorkNotesToAssignee] = useState(false);
    // Signature of the filter criteria (groups/users/dates — NOT the work-notes
    // checkbox) that produced the current data set. Refresh stays enabled only
    // while the live inputs still match this; changing any filter disables it.
    const [appliedSig, setAppliedSig] = useState<string | null>(null);

    // Load the role-scoped assignment-group list once on mount.
    useEffect(() => {
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

    // Signature of the filter criteria only (work-notes checkbox excluded, so
    // toggling it keeps Refresh enabled).
    const currentSig = JSON.stringify({
        g: [...groupIds].sort(),
        u: [...userIds].sort(),
        s: startDate,
        e: endDate,
    });

    const buildParams = useCallback(
        (): ReportParams => ({
            userSysIds: userIds,
            groupSysIds: groupIds,
            startDate,
            endDate,
            limitWorkNotesToAssignee,
        }),
        [userIds, groupIds, startDate, endDate, limitWorkNotesToAssignee]
    );

    const handleGenerate = useCallback(() => {
        onGenerate(buildParams());
        setAppliedSig(currentSig);
    }, [onGenerate, buildParams, currentSig]);

    const handleRefresh = useCallback(() => {
        onRefresh(buildParams());
    }, [onRefresh, buildParams]);

    // Require at least one Assignment group or User before the report can run.
    const hasSubject = groupIds.length > 0 || userIds.length > 0;
    // Refresh appears once a data set exists and stays enabled only while the
    // filter criteria still match those that produced it.
    const canRefresh = hasData && appliedSig !== null && currentSig === appliedSig;

    return (
        <div className="rr-filter-card">
            <div className="rr-filterbar">
                <div className="rr-filterbar__grid">
                    <div className="rr-filterbar__field">
                        <MultiSelect
                            label="Assignment groups"
                            options={groups}
                            selected={groupIds}
                            disabled={groupsLoading}
                            onChange={setGroupIds}
                        />
                    </div>
                    <div className="rr-filterbar__field">
                        <MultiSelect
                            label="Users"
                            options={users}
                            selected={userIds}
                            disabled={usersLoading || groupIds.length === 0}
                            onChange={setUserIds}
                        />
                    </div>
                </div>

                <div className="rr-filterbar__section">
                    <span className="rr-filterbar__section-label">Dates</span>
                    <div className="rr-filterbar__row">
                        <div className="rr-filterbar__field rr-filterbar__field--date">
                            <DateTime
                                label="Start date"
                                type="date"
                                format="MM-dd-yyyy"
                                optional
                                value={isoToDisplay(startDate)}
                                onValueSet={e => setStartDate(displayToIso(e.detail.payload.value || ''))}
                            />
                        </div>
                        <div className="rr-filterbar__field rr-filterbar__field--date">
                            <DateTime
                                label="End date"
                                type="date"
                                format="MM-dd-yyyy"
                                optional
                                value={isoToDisplay(endDate)}
                                onValueSet={e => setEndDate(displayToIso(e.detail.payload.value || ''))}
                            />
                        </div>
                    </div>
                </div>

                <div className="rr-filterbar__row">
                    <div className="rr-filterbar__field">
                        <Checkbox
                            label="Limit Work Notes to Assigned to"
                            checked={limitWorkNotesToAssignee}
                            onCheckedSet={e => setLimitWorkNotesToAssignee(!!e.detail.payload.value)}
                        />
                    </div>
                    <div className="rr-filterbar__actions">
                        {hasData && (
                            <Button
                                label="Refresh"
                                variant="secondary"
                                disabled={loading || !canRefresh}
                                onClicked={handleRefresh}
                            />
                        )}
                        <Button
                            label="Apply"
                            variant="primary"
                            disabled={loading || !hasSubject}
                            onClicked={handleGenerate}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
