import React, { useCallback, useState } from 'react';
import { EntityMultiPicker } from './EntityMultiPicker';
import {
    searchUsers,
    searchGroups,
    ReportParams,
    UserOption,
    GroupOption,
} from '../services/api';

interface Props {
    loading: boolean;
    onGenerate: (params: ReportParams) => void;
}

type SearchMode = 'user' | 'group';

// Faithful rebuild of the original report's filter section (recovered from the
// source map). Uses native elements + token CSS: a "Search by" .toggle-btn
// group, a multi-select chip picker (UserPicker when user mode, GroupPicker
// when group mode), Start/End dates, Granularity and the Generate button.
export function FilterBar({ loading, onGenerate }: Props) {
    const [searchMode, setSearchMode] = useState<SearchMode>('user');
    const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<GroupOption[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [granularity, setGranularity] = useState<'weekly' | 'monthly'>('weekly');

    // Switching modes clears the other selection.
    const handleSearchModeChange = useCallback((mode: SearchMode) => {
        if (mode === 'user') {
            setSearchMode('user');
            setSelectedGroups([]);
        } else {
            setSearchMode('group');
            setSelectedUsers([]);
        }
    }, []);

    const handleGenerate = useCallback(() => {
        onGenerate({
            userSysIds: selectedUsers.map(u => u.sysId),
            groupSysIds: selectedGroups.map(g => g.sysId),
            startDate,
            endDate,
            granularity,
        });
    }, [selectedUsers, selectedGroups, startDate, endDate, granularity, onGenerate]);

    return (
        <div className="filters-container">
            <div className="filters-row">
                <div className="filter-field filter-field-wide">
                    <div className="filter-label-row">
                        <label className="filter-label">Search by</label>
                        <div className="search-mode-toggle">
                            <button
                                type="button"
                                className={`toggle-btn ${searchMode === 'user' ? 'active' : ''}`}
                                onClick={() => handleSearchModeChange('user')}
                            >
                                User
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn ${searchMode === 'group' ? 'active' : ''}`}
                                onClick={() => handleSearchModeChange('group')}
                            >
                                Assignment Group
                            </button>
                        </div>
                        <span className="filter-optional">(optional — leave blank for all users)</span>
                    </div>
                    {searchMode === 'user' ? (
                        <EntityMultiPicker<UserOption>
                            selected={selectedUsers}
                            onSelectionChange={setSelectedUsers}
                            search={searchUsers}
                            placeholderEmpty="Search users... (type 2+ characters)"
                            placeholderAdd="Add another user..."
                            noResultsText="No users found"
                            showEmail
                        />
                    ) : (
                        <EntityMultiPicker<GroupOption>
                            selected={selectedGroups}
                            onSelectionChange={setSelectedGroups}
                            search={searchGroups}
                            placeholderEmpty="Search groups... (type 2+ characters)"
                            placeholderAdd="Add another group..."
                            noResultsText="No groups found"
                        />
                    )}
                </div>
            </div>
            <div className="filters-row filters-row-secondary">
                <div className="filter-field">
                    <label className="filter-label">Start Date</label>
                    <input
                        className="sn-input"
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                </div>
                <div className="filter-field">
                    <label className="filter-label">End Date</label>
                    <input
                        className="sn-input"
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    />
                </div>
                <div className="filter-field">
                    <label className="filter-label">Granularity</label>
                    <select
                        className="sn-select"
                        value={granularity}
                        onChange={e => setGranularity(e.target.value === 'monthly' ? 'monthly' : 'weekly')}
                    >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                <div className="filter-field filter-action">
                    <button className="sn-button-primary" onClick={handleGenerate} disabled={loading}>
                        {loading ? 'Loading...' : 'Generate Report'}
                    </button>
                </div>
            </div>
        </div>
    );
}
