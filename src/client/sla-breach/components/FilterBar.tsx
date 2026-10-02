import React from 'react'
import { TypeaheadMulti } from '@servicenow/react-components/TypeaheadMulti'
import { DateTime } from '@servicenow/react-components/DateTime'
import { Button } from '@servicenow/react-components/Button'
import { Checkbox } from '@servicenow/react-components/Checkbox'
import { GroupOption } from '../services/api'

interface FilterBarProps {
    groups: GroupOption[]
    selectedGroups: GroupOption[]
    onGroupsSelected: (items: GroupOption[]) => void
    selectedBreaching: GroupOption[]
    onBreachingSelected: (items: GroupOption[]) => void
    slas: GroupOption[]
    selectedSlas: GroupOption[]
    onSlasSelected: (items: GroupOption[]) => void
    createdFrom: string
    createdTo: string
    onCreatedFrom: (value: string) => void
    onCreatedTo: (value: string) => void
    excludeGroup: boolean
    onExcludeGroup: (value: boolean) => void
    onApply: () => void
    loading: boolean
}

// State/server contract stays canonical yyyy-MM-dd; the field only DISPLAYS MM-dd-yyyy.
function isoToDisplay(iso: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
    return m ? `${m[2]}-${m[3]}-${m[1]}` : ''
}
function displayToIso(display: string): string {
    const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(display || '')
    return m ? `${m[3]}-${m[1]}-${m[2]}` : ''
}

function toOptions(items: unknown): GroupOption[] {
    return (Array.isArray(items) ? items : [])
        .filter((i: { id?: unknown }) => i && i.id != null)
        .map((i: { id: unknown; label?: unknown }) => ({ id: String(i.id), label: String(i.label ?? i.id) }))
}

// Set to true to re-enable the Breaching groups filter (all supporting logic
// remains wired up; this only controls whether the control is rendered).
const SHOW_BREACHING_FILTER = false

// TRD-style grouped filter layout. The searchable multi-selects sit in a
// labeled grid, the created-date range sits in a titled "Dates" section, and
// the Apply action plus exclude toggle live in a trailing actions area. This is
// purely a container/section reorganization — every control keeps its original
// props, placeholders, helperContent, and handlers.
export default function FilterBar(props: FilterBarProps) {
    const canApply = props.selectedGroups.length > 0 || props.selectedBreaching.length > 0
    return (
        <div className="sla-filterbar">
            <div className="sla-filterbar__grid">
                <div className="sla-filterbar__field">
                    <TypeaheadMulti
                        label="Assignment groups"
                        placeholder="Search and select one or more groups…"
                        search="contains"
                        disableAutoClose
                        items={props.groups}
                        selectedItems={props.selectedGroups}
                        helperContent="Incidents currently assigned to these groups. Active groups with the ITIL role."
                        onSelectedItemsSet={(e) => props.onGroupsSelected(toOptions(e.detail.payload.value))}
                    />
                </div>
                {SHOW_BREACHING_FILTER && (
                    <div className="sla-filterbar__field">
                        <TypeaheadMulti
                            label="Breaching groups"
                            placeholder="Search and select one or more groups…"
                            search="contains"
                            disableAutoClose
                            items={props.groups}
                            selectedItems={props.selectedBreaching}
                            helperContent="Group assigned at the moment of breach (from metric history)."
                            onSelectedItemsSet={(e) => props.onBreachingSelected(toOptions(e.detail.payload.value))}
                        />
                    </div>
                )}
                <div className="sla-filterbar__field">
                    <TypeaheadMulti
                        label="SLAs (optional)"
                        optional
                        placeholder="Any SLA — search and select…"
                        search="contains"
                        disableAutoClose
                        items={props.slas}
                        selectedItems={props.selectedSlas}
                        helperContent="Limit results to one or more SLA definitions."
                        onSelectedItemsSet={(e) => props.onSlasSelected(toOptions(e.detail.payload.value))}
                    />
                </div>
            </div>

            <div className="sla-filterbar__section">
                <span className="sla-filterbar__section-label">Dates</span>
                <div className="sla-filterbar__row">
                    <div className="sla-filterbar__field sla-filterbar__field--date">
                        <DateTime
                            label="Created from"
                            type="date"
                            format="MM-dd-yyyy"
                            optional
                            value={isoToDisplay(props.createdFrom)}
                            onValueSet={(e) => props.onCreatedFrom(displayToIso(e.detail.payload.value || ''))}
                        />
                    </div>
                    <div className="sla-filterbar__field sla-filterbar__field--date">
                        <DateTime
                            label="Created to"
                            type="date"
                            format="MM-dd-yyyy"
                            optional
                            value={isoToDisplay(props.createdTo)}
                            onValueSet={(e) => props.onCreatedTo(displayToIso(e.detail.payload.value || ''))}
                        />
                    </div>
                </div>
            </div>

            <div className="sla-filterbar__actions">
                <Button label="Apply" variant="primary" disabled={props.loading || !canApply} onClicked={props.onApply} />
                <Checkbox label="Exclude Groups' Breaches" checked={props.excludeGroup} onCheckedSet={(e) => props.onExcludeGroup(!!e.detail.payload.value)} />
            </div>
        </div>
    )
}
