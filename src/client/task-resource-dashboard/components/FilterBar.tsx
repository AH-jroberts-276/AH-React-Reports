import React, { useCallback } from 'react';
import { DateTime, DateTimeValueSet } from '@servicenow/react-components/DateTime';
import { Button } from '@servicenow/react-components/Button';
import { MultiSelect } from './MultiSelect';
import { Option } from '../services/api';
import { TYPE_REGISTRY } from '../utils/constants';
import { readDateValue, toIsoDate, toDisplayDate } from '../utils/dates';

interface Props {
    groups: Option[];
    users: Option[];
    groupsLoading: boolean;
    usersLoading: boolean;
    groupIds: string[];
    userIds: string[];
    typeSel: string[];
    statusSel: string[];
    startDate: string;
    endDate: string;
    statuses: Option[];
    busy: boolean;
    onGroupChange: (v: string[]) => void;
    onUserChange: (v: string[]) => void;
    onTypeChange: (v: string[]) => void;
    onStatusChange: (v: string[]) => void;
    onStartDateChange: (iso: string) => void;
    onEndDateChange: (iso: string) => void;
    onApply: () => void;
    onClear: () => void;
}

const TYPE_OPTIONS: Option[] = TYPE_REGISTRY.map(e => ({ value: e.id, label: e.label }));

export function FilterBar(props: Props) {
    const { onStartDateChange, onEndDateChange } = props;

    const handleStart = useCallback<DateTimeValueSet>(
        e => onStartDateChange(toIsoDate(readDateValue(e))),
        [onStartDateChange],
    );
    const handleEnd = useCallback<DateTimeValueSet>(
        e => onEndDateChange(toIsoDate(readDateValue(e))),
        [onEndDateChange],
    );

    const applyDisabled =
        props.busy || props.groupsLoading || props.groupIds.length === 0 || props.typeSel.length === 0;

    return (
        <div className="trad-filterbar">
            <div className="trad-filterbar__grid">
                <div className="trad-filterbar__field trad-filterbar__field--group">
                    <MultiSelect
                        label="Assignment group"
                        options={props.groups}
                        selected={props.groupIds}
                        disabled={props.groupsLoading}
                        onChange={props.onGroupChange}
                    />
                </div>
                <div className="trad-filterbar__field trad-filterbar__field--user">
                    <MultiSelect
                        label="User"
                        options={props.users}
                        selected={props.userIds}
                        disabled={props.usersLoading || props.groupIds.length === 0}
                        onChange={props.onUserChange}
                    />
                </div>
                <div className="trad-filterbar__field trad-filterbar__field--type">
                    <MultiSelect
                        label="Work type"
                        options={TYPE_OPTIONS}
                        selected={props.typeSel}
                        onChange={props.onTypeChange}
                    />
                </div>
                <div className="trad-filterbar__field trad-filterbar__field--status">
                    <MultiSelect
                        label="Status/State"
                        addPlaceholder={props.statuses.length ? 'Search & add a status…' : 'No statuses available'}
                        options={props.statuses}
                        selected={props.statusSel}
                        disabled={!props.statuses.length}
                        onChange={props.onStatusChange}
                    />
                </div>
            </div>

            <div className="trad-filterbar__section">
                <span className="trad-filterbar__section-label">Dates</span>
                <div className="trad-filterbar__row">
                    <div className="trad-filterbar__field trad-filterbar__field--date">
                        <DateTime
                            label="Start date"
                            type="date"
                            format="MM-dd-yyyy"
                            optional
                            value={toDisplayDate(props.startDate)}
                            onValueSet={handleStart}
                        />
                    </div>
                    <div className="trad-filterbar__field trad-filterbar__field--date">
                        <DateTime
                            label="End date"
                            type="date"
                            format="MM-dd-yyyy"
                            optional
                            value={toDisplayDate(props.endDate)}
                            onValueSet={handleEnd}
                        />
                    </div>
                </div>
            </div>

            <div className="trad-filterbar__actions">
                <Button variant="primary" label="Apply" disabled={applyDisabled} onClicked={props.onApply} />
                <Button variant="secondary" label="Clear" disabled={props.busy} onClicked={props.onClear} />
            </div>
        </div>
    );
}
