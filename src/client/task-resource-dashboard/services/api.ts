// Data layer for the Task & Resource Assignment Dashboard.
//
// READ-ONLY: every request is a GET to the ServiceNow Table API
// (/api/now/table/...). There are no inserts, updates, or deletes, and no
// Scripted REST calls. All requests carry the session token via X-UserToken.

import {
    display,
    value,
    effectiveEntries,
    TASK_BASE_TABLE,
    TypeEntry,
} from '../utils/constants';

export interface Option {
    value: string;
    label: string;
}

export interface DashboardRow {
    id: string;
    type: string;
    kind: string;
    table: string;
    number: string;
    name: string;
    group: string;
    user: string;
    task: string;
    taskId: string;
    matchedVia: string;
    status: string;
    created: string;
    createdSort: string;
    startDate: string;
    endDate: string;
    startSort: string;
    endSort: string;
}

export interface Overflow {
    table: string;
    label: string;
    total: number;
}

export interface DashboardFilters {
    groupIds: string[];
    userIds: string[];
    memberIds: string[];
    typeIds: string[];
    statusLabels: string[];
    startDate: string;
    endDate: string;
}

interface StatusResolver {
    stateByName: Map<string, Map<string, string[]>>;
    raByLabel: Map<string, string[]>;
}

// deno-lint-ignore no-explicit-any
type Rec = Record<string, any>;

const RA_TABLE = 'sn_plng_att_core_resource_assignment';
const PAGE = 1000;
const HARD_CAP = 20000;
const CHUNK_SIZE = 100;

function gToken(): string {
    return (window as unknown as { g_ck: string }).g_ck;
}

// --- Core GET transport -----------------------------------------------------

async function tableGet(table: string, params: URLSearchParams): Promise<{ rows: Rec[]; total: number }> {
    const res = await fetch(`/api/now/table/${table}?${params.toString()}`, {
        method: 'GET',
        headers: { Accept: 'application/json', 'X-UserToken': gToken() },
    });
    if (!res.ok) {
        let message = `Request failed: ${res.status}`;
        try {
            const err = await res.json();
            message = err?.error?.message || message;
        } catch {
            /* ignore parse errors */
        }
        throw new Error(message);
    }
    const body = await res.json();
    const rows: Rec[] = body?.result || [];
    const header = res.headers.get('X-Total-Count');
    return { rows, total: header != null ? Number(header) : rows.length };
}

function baseParams(query: string, fields: string): URLSearchParams {
    const params = new URLSearchParams({
        sysparm_display_value: 'all',
        sysparm_exclude_reference_link: 'true',
        sysparm_fields: fields,
        sysparm_limit: String(PAGE),
    });
    if (query) params.set('sysparm_query', query);
    return params;
}

const joinQuery = (clauses: Array<string | false | null | undefined>): string =>
    clauses.filter(Boolean).join('^');

function joinCapped(set: Set<string>, max = 3): string {
    const arr = [...set].filter(Boolean);
    if (arr.length <= max) return arr.join(', ');
    return `${arr.slice(0, max).join(', ')} +${arr.length - max} more`;
}

// Chunk an id list, query each chunk with pagination, accumulate up to the cap.
async function tableGetChunked(
    table: string,
    staticClauses: string[],
    field: string,
    ids: string[],
    fields: string,
): Promise<{ rows: Rec[]; capped: boolean }> {
    const rows: Rec[] = [];
    let capped = false;
    for (let i = 0; i < ids.length && !capped; i += CHUNK_SIZE) {
        const chunk = ids.slice(i, i + CHUNK_SIZE);
        const query = joinQuery([...staticClauses, `${field}IN${chunk.join(',')}`, 'ORDERBYsys_id']);
        let offset = 0;
        for (;;) {
            const params = baseParams(query, fields);
            params.set('sysparm_offset', String(offset));
            const { rows: page } = await tableGet(table, params);
            rows.push(...page);
            if (rows.length >= HARD_CAP) {
                capped = true;
                break;
            }
            if (page.length < PAGE) break;
            offset += PAGE;
        }
    }
    if (rows.length > HARD_CAP) rows.length = HARD_CAP;
    return { rows, capped };
}

// Paginated GET over a static query (no id chunking).
async function collectStaticRows(
    table: string,
    clauses: string[],
    fields: string,
): Promise<{ rows: Rec[]; capped: boolean }> {
    const query = joinQuery([...clauses, 'ORDERBYsys_id']);
    const rows: Rec[] = [];
    let capped = false;
    let offset = 0;
    for (;;) {
        const params = baseParams(query, fields);
        params.set('sysparm_offset', String(offset));
        const { rows: page } = await tableGet(table, params);
        rows.push(...page);
        if (rows.length >= HARD_CAP) {
            capped = true;
            break;
        }
        if (page.length < PAGE) break;
        offset += PAGE;
    }
    if (rows.length > HARD_CAP) rows.length = HARD_CAP;
    return { rows, capped };
}

const collectMemberScopedRows = (staticClauses: string[], userIds: string[], fields: string) =>
    tableGetChunked(RA_TABLE, staticClauses, 'user_resource', userIds, fields);

// --- Filter option loaders --------------------------------------------------

function toOptions(rows: Rec[], field: string): Option[] {
    const seen = new Set<string>();
    const out: Option[] = [];
    for (const r of rows) {
        const v = value(r[field]);
        if (!v || seen.has(v)) continue;
        seen.add(v);
        out.push({ value: v, label: display(r[field]) || v });
    }
    return out;
}

export async function fetchGroups(): Promise<Option[]> {
    const params = new URLSearchParams({
        sysparm_display_value: 'all',
        sysparm_exclude_reference_link: 'true',
        sysparm_fields: 'group',
        sysparm_query: 'role.nameINitil,pps_resource^group.active=true^ORDERBYgroup.name',
        sysparm_limit: '5000',
    });
    const { rows } = await tableGet('sys_group_has_role', params);
    return toOptions(rows, 'group');
}

export async function fetchGroupMembers(groupIds: string[]): Promise<Option[]> {
    if (!groupIds.length) return [];
    const params = new URLSearchParams({
        sysparm_display_value: 'all',
        sysparm_exclude_reference_link: 'true',
        sysparm_fields: 'user',
        sysparm_query: `groupIN${groupIds.join(',')}^user.active=true^ORDERBYuser.name`,
        sysparm_limit: '5000',
    });
    const { rows } = await tableGet('sys_user_grmember', params);
    return toOptions(rows, 'user');
}

export async function fetchStatusOptions(typeIds: string[]): Promise<Option[]> {
    const entries = effectiveEntries(typeIds);
    if (!entries.length) return [];

    const labels: string[] = [];
    const seen = new Set<string>();
    const add = (label: string) => {
        if (label && !seen.has(label)) {
            seen.add(label);
            labels.push(label);
        }
    };

    const taskEntries = entries.filter(e => e.kind !== 'ra');
    if (taskEntries.length) {
        const tables = Array.from(new Set([...taskEntries.map(e => e.table), TASK_BASE_TABLE]));
        const params = new URLSearchParams({
            sysparm_display_value: 'false',
            sysparm_exclude_reference_link: 'true',
            sysparm_fields: 'name,label,value,sequence',
            sysparm_query: `nameIN${tables.join(',')}^element=state^inactive=false^language=en^ORDERBYsequence`,
            sysparm_limit: '1000',
        });
        const { rows } = await tableGet('sys_choice', params);
        for (const r of rows) add(value(r.label));
    }

    const raEntries = entries.filter(e => e.kind === 'ra');
    for (const entry of raEntries) {
        const params = new URLSearchParams({
            sysparm_display_value: 'false',
            sysparm_exclude_reference_link: 'true',
            sysparm_fields: 'label',
            sysparm_query: `name=${entry.table}^element=resource_status^inactive=false^language=en`,
            sysparm_limit: '1000',
        });
        const { rows } = await tableGet('sys_choice', params);
        for (const r of rows) add(value(r.label));
    }

    return labels.map(label => ({ value: label, label }));
}

async function fetchStatusResolver(entries: TypeEntry[]): Promise<StatusResolver> {
    const stateByName = new Map<string, Map<string, string[]>>();
    const raByLabel = new Map<string, string[]>();

    const push = (map: Map<string, string[]>, label: string, val: string) => {
        if (!map.has(label)) map.set(label, []);
        map.get(label)!.push(val);
    };

    const taskEntries = entries.filter(e => e.kind !== 'ra');
    if (taskEntries.length) {
        const tables = Array.from(new Set([...taskEntries.map(e => e.table), TASK_BASE_TABLE]));
        const params = new URLSearchParams({
            sysparm_display_value: 'false',
            sysparm_exclude_reference_link: 'true',
            sysparm_fields: 'name,label,value',
            sysparm_query: `nameIN${tables.join(',')}^element=state^inactive=false^language=en`,
            sysparm_limit: '1000',
        });
        const { rows } = await tableGet('sys_choice', params);
        for (const r of rows) {
            const name = value(r.name);
            if (!stateByName.has(name)) stateByName.set(name, new Map());
            push(stateByName.get(name)!, value(r.label), value(r.value));
        }
    }

    const raEntries = entries.filter(e => e.kind === 'ra');
    for (const entry of raEntries) {
        const params = new URLSearchParams({
            sysparm_display_value: 'false',
            sysparm_exclude_reference_link: 'true',
            sysparm_fields: 'label,value',
            sysparm_query: `name=${entry.table}^element=resource_status^inactive=false^language=en`,
            sysparm_limit: '1000',
        });
        const { rows } = await tableGet('sys_choice', params);
        for (const r of rows) push(raByLabel, value(r.label), value(r.value));
    }

    return { stateByName, raByLabel };
}

// --- Criteria builders ------------------------------------------------------

function taskCriteriaClauses(filters: DashboardFilters): string[] {
    return [
        filters.groupIds?.length ? `assignment_groupIN${filters.groupIds.join(',')}` : '',
        filters.userIds?.length ? `assigned_toIN${filters.userIds.join(',')}` : '',
        filters.startDate ? `sys_created_on>=${filters.startDate} 00:00:00` : '',
        filters.endDate ? `sys_created_on<=${filters.endDate} 23:59:59` : '',
    ];
}

function raMatch(filters: DashboardFilters): { userIds: string[]; dateClauses: string[] } | null {
    const userIds = filters.userIds?.length
        ? filters.userIds
        : filters.groupIds?.length
          ? filters.memberIds || []
          : [];
    if (!userIds.length) return null;
    const dateClauses = [
        filters.endDate ? `start_date<=${filters.endDate}` : '',
        filters.startDate ? `end_date>=${filters.startDate}` : '',
    ];
    return { userIds, dateClauses };
}

// --- Per-entry fetchers -----------------------------------------------------

async function fetchTaskTable(
    entry: TypeEntry,
    filters: DashboardFilters,
    statusValues: string[] | null,
): Promise<{ rows: DashboardRow[]; overflow: Overflow | null }> {
    if (statusValues !== null && statusValues.length === 0) return { rows: [], overflow: null };

    const query = joinQuery([
        ...taskCriteriaClauses(filters),
        statusValues?.length ? `stateIN${statusValues.join(',')}` : '',
    ]);
    const { rows, total } = await tableGet(
        entry.table,
        baseParams(query, 'sys_id,number,short_description,assignment_group,assigned_to,state,sys_created_on'),
    );
    const mapped: DashboardRow[] = rows.map(r => ({
        id: value(r.sys_id),
        type: entry.label,
        kind: 'task',
        table: entry.table,
        number: display(r.number),
        name: display(r.short_description),
        group: display(r.assignment_group),
        user: display(r.assigned_to),
        task: '',
        taskId: '',
        matchedVia: 'Direct',
        status: display(r.state),
        created: display(r.sys_created_on),
        createdSort: value(r.sys_created_on),
        startDate: '',
        endDate: '',
        startSort: '',
        endSort: '',
    }));
    const overflow = total > PAGE ? { table: entry.table, label: entry.label, total } : null;
    return { rows: mapped, overflow };
}

async function fetchResourceAssignments(
    entry: TypeEntry,
    filters: DashboardFilters,
    statusValues: string[] | null,
): Promise<{ rows: DashboardRow[]; overflow: Overflow | null }> {
    const m = raMatch(filters);
    if (!m) return { rows: [], overflow: null };

    const staticClauses = [
        ...m.dateClauses,
        statusValues?.length ? `resource_statusIN${statusValues.join(',')}` : '',
    ];
    const { rows, capped } = await tableGetChunked(
        entry.table,
        staticClauses,
        'user_resource',
        m.userIds,
        'sys_id,number,short_description,group_resource,user_resource,task,resource_status,start_date,end_date,sys_created_on',
    );
    const mapped: DashboardRow[] = rows.map(r => ({
        id: value(r.sys_id),
        type: entry.label,
        kind: 'ra',
        table: entry.table,
        number: display(r.number),
        name: display(r.short_description),
        group: display(r.group_resource),
        user: display(r.user_resource),
        task: display(r.task),
        taskId: value(r.task),
        matchedVia: 'Resource assignment',
        status: display(r.resource_status),
        created: display(r.sys_created_on),
        createdSort: value(r.sys_created_on),
        startDate: display(r.start_date),
        endDate: display(r.end_date),
        startSort: value(r.start_date),
        endSort: value(r.end_date),
    }));
    const overflow = capped || rows.length > PAGE ? { table: entry.table, label: entry.label, total: rows.length } : null;
    return { rows: mapped, overflow };
}

interface AggMatch {
    viaTask: boolean;
    viaRa: boolean;
    viaManager: boolean;
    groups: Set<string>;
    users: Set<string>;
}

async function fetchAggregate(
    entry: TypeEntry,
    filters: DashboardFilters,
    statusValues: string[] | null,
): Promise<{ rows: DashboardRow[]; overflow: Overflow | null }> {
    const cfg = entry.aggregate!;
    const matches = new Map<string, AggMatch>();
    const ensure = (id: string): AggMatch => {
        let m = matches.get(id);
        if (!m) {
            m = { viaTask: false, viaRa: false, viaManager: false, groups: new Set(), users: new Set() };
            matches.set(id, m);
        }
        return m;
    };
    let capped = false;

    // (1) Child tasks matching the task criteria roll up to their parent.
    const child = await collectStaticRows(
        cfg.childTable,
        taskCriteriaClauses(filters),
        `sys_id,${cfg.childParentFields.join(',')},assignment_group,assigned_to`,
    );
    capped = capped || child.capped;
    for (const row of child.rows) {
        let pid = '';
        for (const pf of cfg.childParentFields) {
            const v = value(row[pf]);
            if (v) {
                pid = v;
                break;
            }
        }
        if (!pid) continue;
        const m = ensure(pid);
        m.viaTask = true;
        const g = display(row.assignment_group);
        if (g) m.groups.add(g);
        const u = display(row.assigned_to);
        if (u) m.users.add(u);
    }

    // (2) Resource assignments scoped to matched users.
    const rm = raMatch(filters);
    if (rm) {
        const ra = await collectMemberScopedRows(
            [...rm.dateClauses, cfg.raClassFilter],
            rm.userIds,
            `sys_id,${cfg.raIdFields.join(',')},group_resource,user_resource`,
        );
        capped = capped || ra.capped;
        for (const row of ra.rows) {
            for (const idf of cfg.raIdFields) {
                const v = value(row[idf]);
                if (!v) continue;
                const m = ensure(v);
                m.viaRa = true;
                const g = display(row.group_resource);
                if (g) m.groups.add(g);
                const u = display(row.user_resource);
                if (u) m.users.add(u);
            }
        }

        // (3) Records whose manager field matches a selected user.
        if (cfg.managerField) {
            const mgr = await tableGetChunked(
                entry.table,
                [],
                cfg.managerField,
                rm.userIds,
                `sys_id,${cfg.managerField}`,
            );
            capped = capped || mgr.capped;
            for (const row of mgr.rows) {
                const id = value(row.sys_id);
                if (!id) continue;
                const m = ensure(id);
                m.viaManager = true;
                const mg = display(row[cfg.managerField]);
                if (mg) m.users.add(mg);
            }
        }
    }

    const distinct = matches.size;
    const ids = [...matches.keys()].slice(0, PAGE);
    const { rows, capped: fetchCapped } = await tableGetChunked(
        entry.table,
        [statusValues?.length ? `stateIN${statusValues.join(',')}` : ''],
        'sys_id',
        ids,
        `sys_id,number,short_description,assignment_group,assigned_to,state,sys_created_on,${cfg.startField},${cfg.endField}`,
    );
    capped = capped || fetchCapped;

    const mapped: DashboardRow[] = rows.map(r => {
        const id = value(r.sys_id);
        const m = matches.get(id);
        const groups = m ? m.groups : new Set<string>();
        const users = m ? m.users : new Set<string>();
        const matchedVia = [
            m?.viaTask && 'Child task',
            m?.viaRa && 'Resource assignment',
            m?.viaManager && cfg.managerLabel,
        ]
            .filter(Boolean)
            .join(' & ');
        return {
            id,
            type: entry.label,
            kind: entry.kind,
            table: entry.table,
            number: display(r.number),
            name: display(r.short_description),
            group: display(r.assignment_group) || joinCapped(groups),
            user: display(r.assigned_to) || joinCapped(users),
            task: '',
            taskId: '',
            matchedVia,
            status: display(r.state),
            created: display(r.sys_created_on),
            createdSort: value(r.sys_created_on),
            startDate: display(r[cfg.startField]),
            endDate: display(r[cfg.endField]),
            startSort: value(r[cfg.startField]),
            endSort: value(r[cfg.endField]),
        };
    });
    const overflow = capped || distinct > PAGE ? { table: entry.table, label: entry.label, total: distinct } : null;
    return { rows: mapped, overflow };
}

// --- Orchestration ----------------------------------------------------------

export async function fetchDashboardRows(
    filters: DashboardFilters,
): Promise<{ rows: DashboardRow[]; overflows: Overflow[] }> {
    const entries = effectiveEntries(filters.typeIds);
    const labels = filters.statusLabels?.length ? filters.statusLabels : null;
    const resolver = labels ? await fetchStatusResolver(entries) : null;

    const results = await Promise.all(
        entries.map(entry => {
            let statusValues: string[] | null = null;
            if (labels && resolver) {
                const vals: string[] = [];
                if (entry.kind === 'ra') {
                    for (const label of labels) {
                        const vs = resolver.raByLabel.get(label);
                        if (vs) vals.push(...vs);
                    }
                } else {
                    const map =
                        resolver.stateByName.get(entry.table) || resolver.stateByName.get(TASK_BASE_TABLE);
                    if (map) {
                        for (const label of labels) {
                            const vs = map.get(label);
                            if (vs) vals.push(...vs);
                        }
                    }
                }
                statusValues = Array.from(new Set(vals));
            }

            if (entry.kind === 'ra') return fetchResourceAssignments(entry, filters, statusValues);
            if (entry.aggregate) return fetchAggregate(entry, filters, statusValues);
            return fetchTaskTable(entry, filters, statusValues);
        }),
    );

    return {
        rows: results.flatMap(r => r.rows),
        overflows: results.map(r => r.overflow).filter((o): o is Overflow => o !== null),
    };
}
