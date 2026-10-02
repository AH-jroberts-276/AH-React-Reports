import React, { useCallback, useRef, useState } from 'react';
import {
    TypeaheadMulti,
    TypeaheadMultiSelectedItem,
} from '@servicenow/react-components/TypeaheadMulti';
import { DateTime } from '@servicenow/react-components/DateTime';
import { Select } from '@servicenow/react-components/Select';
import { Button } from '@servicenow/react-components/Button';
import { searchUsers, searchGroups, ReportParams } from '../services/api';

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

interface AsyncPickerProps {
    label: string;
    placeholder: string;
    helperContent: string;
    selectedItems: TypeaheadMultiSelectedItem[];
    onSelectedItemsSet: (items: TypeaheadMultiSelectedItem[]) => void;
    search: (term: string) => Promise<{ sysId: string; name: string }[]>;
}

// A managed/async TypeaheadMulti backed by a Table API search function. The
// users and groups tables are large, so nothing is preloaded: as the user
// types we debounce (300ms), require >= 2 chars, then feed matches into
// `items`. `search="managed"` disables the component's own filtering so our
// fetched list is shown verbatim. Selections flow up as {id,label} chips.
function AsyncTypeaheadMulti({
    label,
    placeholder,
    helperContent,
    selectedItems,
    onSelectedItemsSet,
    search,
}: AsyncPickerProps) {
    const [items, setItems] = useState<TypeaheadMultiSelectedItem[]>([]);
    const [value, setValue] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const runSearch = useCallback(
        (term: string) => {
            if (term.trim().length < 2) {
                setItems([]);
                return;
            }
            search(term.trim())
                .then(results => setItems(results.map(r => ({ id: r.sysId, label: r.name }))))
                .catch(() => setItems([]));
        },
        [search]
    );

    const handleValueSet = useCallback(
        (term: string) => {
            setValue(term);
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => runSearch(term), 300);
        },
        [runSearch]
    );

    return (
        <TypeaheadMulti
            label={label}
            placeholder={placeholder}
            helperContent={helperContent}
            search="managed"
            optional
            disableAutoClose
            items={items}
            selectedItems={selectedItems}
            value={value}
            manageValue
            onValueSet={e => handleValueSet(e.detail.payload.value || '')}
            onSelectedItemsSet={e => {
                onSelectedItemsSet(e.detail.payload.value);
                setValue('');
                setItems([]);
            }}
        />
    );
}

const GRANULARITY_ITEMS = [
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
];

// TRD-style grouped filter card. Assignment groups and Users are shown
// SIMULTANEOUSLY (no toggle); fetchReport unions explicit users with the
// selected groups' active members server-side, so both can be supplied at once.
export function FilterBar({ loading, onGenerate }: Props) {
    const [selectedGroups, setSelectedGroups] = useState<TypeaheadMultiSelectedItem[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<TypeaheadMultiSelectedItem[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [granularity, setGranularity] = useState<'weekly' | 'monthly'>('weekly');

    const handleGenerate = useCallback(() => {
        onGenerate({
            userSysIds: selectedUsers.map(u => String(u.id)),
            groupSysIds: selectedGroups.map(g => String(g.id)),
            startDate,
            endDate,
            granularity,
        });
    }, [selectedUsers, selectedGroups, startDate, endDate, granularity, onGenerate]);

    return (
        <div className="rr-filter-card">
            <div className="rr-filterbar">
                <div className="rr-filterbar__grid">
                    <div className="rr-filterbar__field">
                        <AsyncTypeaheadMulti
                            label="Assignment groups"
                            placeholder="Search and select one or more groups…"
                            helperContent="Type at least 2 characters to search active groups."
                            selectedItems={selectedGroups}
                            onSelectedItemsSet={setSelectedGroups}
                            search={searchGroups}
                        />
                    </div>
                    <div className="rr-filterbar__field">
                        <AsyncTypeaheadMulti
                            label="Users"
                            placeholder="Search and select one or more users…"
                            helperContent="Type at least 2 characters to search active users."
                            selectedItems={selectedUsers}
                            onSelectedItemsSet={setSelectedUsers}
                            search={searchUsers}
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
                    <div className="rr-filterbar__field rr-filterbar__field--date">
                        <Select
                            label="Granularity"
                            items={GRANULARITY_ITEMS}
                            selectedItem={granularity}
                            onSelectedItemSet={e =>
                                setGranularity(e.detail.payload.value === 'monthly' ? 'monthly' : 'weekly')
                            }
                        />
                    </div>
                    <div className="rr-filterbar__actions">
                        <Button
                            label="Generate Report"
                            variant="primary"
                            disabled={loading}
                            onClicked={handleGenerate}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
