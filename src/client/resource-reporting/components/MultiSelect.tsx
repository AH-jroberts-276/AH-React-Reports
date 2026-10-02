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
    onChange: (values: string[]) => void;
}

// Preloaded multi-select backed by the standard @servicenow/react-components
// TypeaheadMulti. Options are supplied up front and filtered client-side
// (search="contains"), so the full list shows on open. Works in terms of
// Option VALUE string[]s. Duplicated per-report by design — each report stays
// self-contained with no cross-report imports.
export function MultiSelect({ label, options, selected, disabled, addPlaceholder, onChange }: Props) {
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
            optional
            disabled={disabled}
            placeholder={addPlaceholder}
            onSelectedItemsSet={handleSelectedItemsSet}
        />
    );
}
