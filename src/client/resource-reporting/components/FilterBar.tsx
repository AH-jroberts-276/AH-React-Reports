import React, { useCallback, useEffect, useState } from 'react';
import { DateTime } from '@servicenow/react-components/DateTime';
import { Select } from '@servicenow/react-components/Select';
import { Button } from '@servicenow/react-components/Button';
import { MultiSelect } from './MultiSelect';
import { fetchGroups, fetchGroupMembers, Option, ReportParams } from '../services/api';

interface Props {
    loading: boolean;
    onGenerate: (params: ReportParams) => void;
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

const GRANULARITY_ITEMS = [
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
];

// TRD-style grouped filter card. Assignment groups are preloaded from the
// role-scoped (ITIL / PPS-resource) list; selecting one or more groups preloads
// their active members into the Users field (so the full list shows on open).
// The Users field is disabled until a group is chosen, and stale user
// selections are pruned (still-valid ones kept) when the group changes — the
// same cascade as the Task & Resource Assignment Dashboard.
export function FilterBar({ loading, onGenerate }: Props) {
    const [groups, setGroups] = useState<Option[]>([]);
    const [users, setUsers] = useState<Option[]>([]);
    const [groupsLoading, setGroupsLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [groupIds, setGroupIds] = useState<string[]>([]);
    const [userIds, setUserIds] = useState<string[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [granularity, setGranularity] = useState<'weekly' | 'monthly'>('weekly');

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

    const handleGenerate = useCallback(() => {
        onGenerate({
            userSysIds: userIds,
            groupSysIds: groupIds,
            startDate,
            endDate,
            granularity,
        });
    }, [userIds, groupIds, startDate, endDate, granularity, onGenerate]);

    // Require at least one Assignment group or User before the report can run.
    const hasSubject = groupIds.length > 0 || userIds.length > 0;

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
                            optional={false}
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
                    <div className="rr-filterbar__field rr-filterbar__field--granularity">
                        <Select
                            label="Granularity"
                            items={GRANULARITY_ITEMS}
                            selectedItem={granularity}
                            itemsListConstrain={{ minWidth: 220 }}
                            onSelectedItemSet={e =>
                                setGranularity(e.detail.payload.value === 'monthly' ? 'monthly' : 'weekly')
                            }
                        />
                    </div>
                    <div className="rr-filterbar__actions">
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
