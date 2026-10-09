import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    TypeaheadMulti,
    TypeaheadMultiSelectedItem,
    TypeaheadMultiSelectedItemsSet,
    TypeaheadMultiValueSet,
} from '@servicenow/react-components/TypeaheadMulti';
import { fetchManagerOptions } from '../services/api';

interface Props {
    label: string;
    selected: string[];
    disabled?: boolean;
    optional?: boolean;
    onChange: (values: string[]) => void;
}

// Manager picker. Unlike the group-scoped User field (a small, preloaded list),
// the manager candidate set is large (thousands of manager-level users), so this
// control searches the Table API server-side as the user types rather than
// preloading every option. It runs TypeaheadMulti in `search="managed"` mode
// (the component does no local filtering) and feeds it freshly fetched items on
// each debounced keystroke. A label map remembers the display label of every
// id we have seen so selected chips keep their names even after the search
// results that produced them scroll out of the current `items` list.
const DEBOUNCE_MS = 250;

export function ManagerSelect({ label, selected, disabled, optional = false, onChange }: Props) {
    const [term, setTerm] = useState('');
    const [items, setItems] = useState<TypeaheadMultiSelectedItem[]>([]);
    const [labels, setLabels] = useState<Record<string, string>>({});
    const reqSeq = useRef(0);

    const rememberLabels = useCallback((pairs: Array<{ id: string; label: string }>) => {
        setLabels(prev => {
            let changed = false;
            const next = { ...prev };
            for (const p of pairs) {
                if (p.id && next[p.id] !== p.label) {
                    next[p.id] = p.label;
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, []);

    // Debounced server-side search. A monotonically increasing sequence guards
    // against out-of-order responses overwriting newer results.
    useEffect(() => {
        const seq = ++reqSeq.current;
        const handle = setTimeout(() => {
            fetchManagerOptions(term)
                .then(opts => {
                    if (seq !== reqSeq.current) return;
                    setItems(opts.map(o => ({ id: o.value, label: o.label })));
                    rememberLabels(opts.map(o => ({ id: o.value, label: o.label })));
                })
                .catch(() => {
                    if (seq === reqSeq.current) setItems([]);
                });
        }, DEBOUNCE_MS);
        return () => clearTimeout(handle);
    }, [term, rememberLabels]);

    const selectedItems: TypeaheadMultiSelectedItem[] = selected.map(id => ({
        id,
        label: labels[id] || id,
    }));

    const handleValue = useCallback<TypeaheadMultiValueSet>(e => {
        setTerm(e.detail.payload.value || '');
    }, []);

    const handleSelectedItemsSet = useCallback<TypeaheadMultiSelectedItemsSet>(
        event => {
            const picked = event.detail.payload.value || [];
            rememberLabels(picked.map(i => ({ id: String(i.id), label: String(i.label) })));
            onChange(picked.map(i => String(i.id)));
        },
        [onChange, rememberLabels],
    );

    return (
        <TypeaheadMulti
            label={label}
            items={items}
            selectedItems={selectedItems}
            value={term}
            manageValue
            search="managed"
            disableAutoClose
            optional={optional}
            disabled={disabled}
            placeholder="Search managers…"
            onValueSet={handleValue}
            onSelectedItemsSet={handleSelectedItemsSet}
        />
    );
}
