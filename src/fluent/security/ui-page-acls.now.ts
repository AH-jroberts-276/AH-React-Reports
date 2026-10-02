import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'

// Page-level access control for the three report UI pages.
//
// Each rendered page (/<endpoint>.do) is restricted to users with the platform
// `itil` role via a `ui_page` read ACL. For a scoped UI page the ACL `name` is
// the page's endpoint WITHOUT the trailing `.do` (the full scope-prefixed URL
// token) — not the sys_ui_page `name` field. Admins retain access through
// adminOverrides. The Scripted REST data APIs enforce their own role gate
// separately, so this only governs who can load the pages themselves.

export const resource_reporting_page_acl = Acl({
    $id: Now.ID['acl-ui-resource-reporting'],
    type: 'ui_page',
    name: 'x_cahcs_react_rpt_resource_reporting',
    operation: 'read',
    roles: ['resource_manager', 'resource_user', 'sn_ppm_read'],
    adminOverrides: true,
    description: 'Restrict the Resource Time Report UI page to resource/PPM roles.',
})

export const task_resource_dashboard_page_acl = Acl({
    $id: Now.ID['acl-ui-task-resource-dashboard'],
    type: 'ui_page',
    name: 'x_cahcs_react_rpt_task_resource_dashboard',
    operation: 'read',
    roles: ['itil'],
    adminOverrides: true,
    description: 'Restrict the Task & Resource Assignment Dashboard UI page to users with the itil role.',
})

export const sla_breach_dashboard_page_acl = Acl({
    $id: Now.ID['acl-ui-sla-breach-dashboard'],
    type: 'ui_page',
    name: 'x_cahcs_react_rpt_sla_breach_dashboard',
    operation: 'read',
    roles: ['itil'],
    adminOverrides: true,
    description: 'Restrict the SLA Breach by Team UI page to users with the itil role.',
})
