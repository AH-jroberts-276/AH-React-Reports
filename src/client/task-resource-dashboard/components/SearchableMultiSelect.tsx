import React, { useCallback, useMemo } from 'react';
import { Select, SelectSelectedItemSet, SelectSearchTermSet } from '@servicenow/react-components/Select';
import { Button } from '@servicenow/react-components/Button';
import { Option } from '../services/api';

interface Props {
    label: string;
    addPlaceholder?: string;
    options: Option[];
    selected: string[];
    disabled?: boolean;
    onChange: (next: string[]) => void;
}

// A searchable multi-select built from a now-select "add" control plus a list
// of removable chip Buttons below it. The now-select is run in managed mode so
// it stays an "add" affordance (it never retains a selected value).
export function SearchableMultiSelect({ label, addPlaceholder, options, selected, disabled, onChange }: Props) {
    const labelFor = useCallback(
        (v: string) => options.find(o => o.value === v)?.label || v,
        [options],
    );

    const items = useMemo(
        () => options.filter(o => !selected.includes(o.value)).map(o => ({ id: o.value, label: o.label })),
        [options, selected],
    );

    const addLabel = addPlaceholder || `Search & add ${label.toLowerCase()}…`;

    const handleSelected = useCallback<SelectSelectedItemSet>(
        event => {
            const v = String(event.detail.payload.value);
            if (v && !selected.includes(v)) onChange([...selected, v]);
        },
        [selected, onChange],
    );

    // Managed search: filtering is handled internally via search="contains".
    const handleSearch = useCallback<SelectSearchTermSet>(() => {}, []);

    return (
        <div className="trad-ms">
            <label className="trad-field-label">{label}</label>
            <Select
                className="trad-ms__select"
                items={items}
                selectedItem=""
                manageSelectedItem
                search="contains"
                disabled={disabled}
                onSelectedItemSet={handleSelected}
                onSearchTermSet={handleSearch}
                configAria={{ trigger: { 'aria-label': addLabel } }}
            />
            {selected.length > 0 && (
                <div className="trad-ms__chips">
                    {selected.map(v => {
                        const chipLabel = labelFor(v);
                        return (
                            <Button
                                key={v}
                                className="trad-ms__chip"
                                variant="secondary"
                                size="sm"
                                label={chipLabel}
                                icon="close-outline"
                                configAria={{ 'aria-label': `Remove ${chipLabel}` }}
                                onClicked={() => onChange(selected.filter(x => x !== v))}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
