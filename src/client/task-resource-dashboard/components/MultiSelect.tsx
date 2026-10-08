import React, { useCallback, useMemo } from 'react';
import {
    TypeaheadMulti,
    TypeaheadMultiSelectedItem,
    TypeaheadMultiSelectedItemsSet,
} from '@servicenow/react-components/TypeaheadMulti';
import { Option } from '../services/api';

interface Props {
    label: string;
    options: Option[];
    selected: string[];
    disabled?: boolean;
    addPlaceholder?: string;
    // Shows the "(optional)" label hint. Defaults to true; pass false for
    // required fields (e.g. Assignment group, Work type).
    optional?: boolean;
    onChange: (values: string[]) => void;
}

// Thin adapter exposing the same external prop API the FilterBar already used
// for its custom control, but rendering the standard @servicenow/react-components
// TypeaheadMulti underneath. All cascade/enable logic in app.tsx is unaffected
// because the parent still works in terms of Option VALUE string[]s.
export function MultiSelect({ label, options, selected, disabled, addPlaceholder, optional = true, onChange }: Props) {
    // options ({value,label}) -> TypeaheadMulti items ({id,label}).
    const items = useMemo<TypeaheadMultiSelectedItem[]>(
        () => options.map(o => ({ id: o.value, label: o.label })),
        [options],
    );

    // selectedItems are the items whose id is in the selected VALUE list.
    const selectedItems = useMemo<TypeaheadMultiSelectedItem[]>(
        () => items.filter(i => selected.includes(String(i.id))),
        [items, selected],
    );

    const handleSelectedItemsSet = useCallback<TypeaheadMultiSelectedItemsSet>(
        event => {
            const ids = (event.detail.payload.value || []).map(i => String(i.id));
            onChange(ids);
        },
        [onChange],
    );

    return (
        <TypeaheadMulti
            label={label}
            items={items}
            selectedItems={selectedItems}
            search="contains"
            disableAutoClose
            optional={optional}
            disabled={disabled}
            placeholder={addPlaceholder}
            onSelectedItemsSet={handleSelectedItemsSet}
        />
    );
}
