// Shared constants, type registry, columns, and field helpers for the
// Task & Resource Assignment Dashboard. All pure (no I/O).

export const TASK_BASE_TABLE = 'task';
export const RA_STATUS_FIELD = 'resource_status';

// ServiceNow Table API (sysparm_display_value=all) returns each field as either
// a plain string or a { display_value, value } object. These helpers normalize.
export const display = (f: unknown): string =>
    typeof f === 'string' ? f : ((f as { display_value?: string } | null)?.display_value || '');
export const value = (f: unknown): string =>
    typeof f === 'string' ? f : ((f as { value?: string } | null)?.value || '');
export const choiceLabel = (f: unknown): string => display(f) || value(f);

export type EntryKind = 'task' | 'ra' | 'project' | 'demand';

export interface AggregateConfig {
    childTable: string;
    childParentFields: string[];
    raClassFilter: string;
    raIdFields: string[];
    managerField?: string;
    managerLabel?: string;
    startField: string;
    endField: string;
}

export interface TypeEntry {
    id: string;
    label: string;
    table: string;
    kind: EntryKind;
    aggregate?: AggregateConfig;
}

export const TYPE_REGISTRY: TypeEntry[] = [
    { id: 'incident', label: 'Incident', table: 'incident', kind: 'task' },
    { id: 'sc_task', label: 'Catalog Task', table: 'sc_task', kind: 'task' },
    { id: 'pm_project_task', label: 'Project Task', table: 'pm_project_task', kind: 'task' },
    { id: 'dmn_demand_task', label: 'Demand Task', table: 'dmn_demand_task', kind: 'task' },
    { id: 'x_cahcs_ehr_idea_ehr_idea', label: 'EHR Idea', table: 'x_cahcs_ehr_idea_ehr_idea', kind: 'task' },
    {
        id: 'sn_plng_att_core_resource_assignment',
        label: 'Resource Assignment',
        table: 'sn_plng_att_core_resource_assignment',
        kind: 'ra',
    },
    {
        id: 'pm_project',
        label: 'Project',
        table: 'pm_project',
        kind: 'project',
        aggregate: {
            childTable: 'pm_project_task',
            childParentFields: ['project', 'top_task'],
            raClassFilter: 'top_task.sys_class_name=pm_project',
            raIdFields: ['top_task'],
            managerField: 'project_manager',
            managerLabel: 'Project Manager',
            startField: 'start_date',
            endField: 'end_date',
        },
    },
    {
        id: 'dmn_demand',
        label: 'Demand',
        table: 'dmn_demand',
        kind: 'demand',
        aggregate: {
            childTable: 'dmn_demand_task',
            childParentFields: ['parent'],
            raClassFilter: 'task.sys_class_nameINdmn_demand,dmn_demand_task',
            raIdFields: ['task', 'task.parent'],
            managerField: 'demand_manager',
            managerLabel: 'Demand manager',
            startField: 'start_date',
            endField: 'due_date',
        },
    },
];

export const effectiveEntries = (typeIds: string[]): TypeEntry[] =>
    TYPE_REGISTRY.filter(e => typeIds.includes(e.id));

export type ColumnKey =
    | 'type'
    | 'number'
    | 'name'
    | 'group'
    | 'user'
    | 'matchedVia'
    | 'task'
    | 'status'
    | 'created'
    | 'startDate'
    | 'endDate';

export interface Column {
    key: ColumnKey;
    label: string;
}

export const COLUMNS: Column[] = [
    { key: 'type', label: 'Work type' },
    { key: 'number', label: 'Number' },
    { key: 'name', label: 'Name / Short description' },
    { key: 'group', label: 'Assignment Group' },
    { key: 'user', label: 'User' },
    { key: 'matchedVia', label: 'Matched via' },
    { key: 'task', label: 'Task' },
    { key: 'status', label: 'Status / State' },
    { key: 'created', label: 'Created' },
    { key: 'startDate', label: 'Start date' },
    { key: 'endDate', label: 'End date' },
];

export const PAGE_SIZE_ITEMS = [10, 20, 50, 100].map(n => ({ id: String(n), label: String(n) }));
export const DEFAULT_PAGE_SIZE = 20;

// Maps a sortable column key to the hidden *Sort field used for date ordering.
export const DATE_SORT_FIELD: Record<string, string> = {
    created: 'createdSort',
    startDate: 'startSort',
    endDate: 'endSort',
};
