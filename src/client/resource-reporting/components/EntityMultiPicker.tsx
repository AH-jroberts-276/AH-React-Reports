import React, { useEffect, useRef, useState } from 'react';

export interface EntityOption {
    sysId: string;
    name: string;
    email?: string;
}

interface Props<T extends EntityOption> {
    selected: T[];
    onSelectionChange: (items: T[]) => void;
    search: (term: string) => Promise<T[]>;
    placeholderEmpty: string;
    placeholderAdd: string;
    noResultsText: string;
    showEmail?: boolean;
}

// Reusable multi-select chip picker. Faithfully reproduces the original
// report's UserPicker / GroupPicker DOM (recovered from the source map):
//   .user-picker > .user-picker-input-area (removable .user-chip chips + a
//   .user-picker-input text field) and a .user-picker-dropdown of matches.
// Search is debounced (>= 2 chars) via the injected `search` function; the
// selected sys_id array is emitted up through onSelectionChange.
export function EntityMultiPicker<T extends EntityOption>({
    selected,
    onSelectionChange,
    search,
    placeholderEmpty,
    placeholderAdd,
    noResultsText,
    showEmail,
}: Props<T>) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<T[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const runSearch = async (searchTerm: string) => {
        if (searchTerm.length < 2) {
            setResults([]);
            setShowDropdown(false);
            return;
        }
        setLoading(true);
        try {
            const matches = await search(searchTerm);
            const selectedIds = new Set(selected.map(s => s.sysId));
            setResults(matches.filter(m => !selectedIds.has(m.sysId)));
            setShowDropdown(true);
        } catch (err) {
            console.error('Entity search failed:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (value: string) => {
        setQuery(value);
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            runSearch(value);
        }, 300);
    };

    const selectItem = (item: T) => {
        onSelectionChange([...selected, item]);
        setQuery('');
        setResults([]);
        setShowDropdown(false);
    };

    const removeItem = (sysId: string) => {
        onSelectionChange(selected.filter(s => s.sysId !== sysId));
    };

    return (
        <div className="user-picker" ref={containerRef}>
            <div className="user-picker-input-area">
                {selected.map(item => (
                    <span key={item.sysId} className="user-chip">
                        {item.name}
                        <button
                            className="user-chip-remove"
                            onClick={() => removeItem(item.sysId)}
                            type="button"
                            aria-label={`Remove ${item.name}`}
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    className="user-picker-input"
                    type="text"
                    value={query}
                    placeholder={selected.length === 0 ? placeholderEmpty : placeholderAdd}
                    onChange={e => handleInputChange(e.target.value)}
                    onFocus={() => {
                        if (results.length > 0) setShowDropdown(true);
                    }}
                />
            </div>
            {showDropdown && (
                <div className="user-picker-dropdown">
                    {loading && <div className="user-picker-item loading">Searching...</div>}
                    {!loading && results.length === 0 && query.length >= 2 && (
                        <div className="user-picker-item no-results">{noResultsText}</div>
                    )}
                    {results.map(item => (
                        <div
                            key={item.sysId}
                            className="user-picker-item"
                            onClick={() => selectItem(item)}
                        >
                            <span className="user-picker-item-name">{item.name}</span>
                            {showEmail && item.email && (
                                <span className="user-picker-item-email">{item.email}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
