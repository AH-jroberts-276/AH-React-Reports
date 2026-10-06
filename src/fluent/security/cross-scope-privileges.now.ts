import '@servicenow/sdk/global'
import { CrossScopePrivilege } from '@servicenow/sdk/core'

// The Resource Reporting Scripted REST operation runs in this app's scope and
// reads several global (PPM / platform) tables server-side. Scoped apps are
// isolated by default, so these reads must be explicitly pre-authorized —
// otherwise the queries silently return no rows (which is exactly what caused
// "no data" when filtering by group). Declaring them here bakes the grants
// into the app source so they deploy to test/prod rather than relying on
// per-instance runtime auto-grants.

CrossScopePrivilege({
    $id: Now.ID['csp_read_grmember'],
    status: 'allowed',
    operation: 'read',
    targetName: 'sys_user_grmember',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['csp_read_user'],
    status: 'allowed',
    operation: 'read',
    targetName: 'sys_user',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['csp_read_time_card'],
    status: 'allowed',
    operation: 'read',
    targetName: 'time_card',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['csp_read_agg_weekly'],
    status: 'allowed',
    operation: 'read',
    targetName: 'resource_aggregate_weekly',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['csp_read_agg_monthly'],
    status: 'allowed',
    operation: 'read',
    targetName: 'resource_aggregate_monthly',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

// The "SLA Breach by Team" Scripted REST operation reads these global tables
// server-side (task_sla breached SLAs, metric_instance assignment-group history,
// incident, and sys_user_group for group-name resolution).
CrossScopePrivilege({
    $id: Now.ID['csp_read_task_sla'],
    status: 'allowed',
    operation: 'read',
    targetName: 'task_sla',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['csp_read_metric_instance'],
    status: 'allowed',
    operation: 'read',
    targetName: 'metric_instance',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['csp_read_incident'],
    status: 'allowed',
    operation: 'read',
    targetName: 'incident',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['csp_read_user_group'],
    status: 'allowed',
    operation: 'read',
    targetName: 'sys_user_group',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

// The "KPI Report" Scripted REST operation reads these global tables
// server-side (sc_task catalog tasks, sys_audit field-change history for the
// assignment/on-hold columns, and sys_journal_field for work notes).
CrossScopePrivilege({
    $id: Now.ID['csp_read_sc_task'],
    status: 'allowed',
    operation: 'read',
    targetName: 'sc_task',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['csp_read_sys_audit'],
    status: 'allowed',
    operation: 'read',
    targetName: 'sys_audit',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['csp_read_sys_journal'],
    status: 'allowed',
    operation: 'read',
    targetName: 'sys_journal_field',
    targetScope: 'global',
    targetType: 'sys_db_object',
})
