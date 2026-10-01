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
