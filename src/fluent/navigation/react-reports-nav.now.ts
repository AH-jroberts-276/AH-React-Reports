import '@servicenow/sdk/global'
import { ApplicationMenu, Record } from '@servicenow/sdk/core'

export const reactReportsMenu = ApplicationMenu({
    $id: Now.ID['react-reports-menu'],
    title: 'React Reports',
    hint: 'React-based reporting pages',
    description: 'Application menu for the React Reports suite.',
    active: true,
})

export const resourceReportingModule = Record({
    $id: Now.ID['resource-reporting-module'],
    table: 'sys_app_module',
    data: {
        title: 'Resource Reporting',
        application: reactReportsMenu,
        link_type: 'DIRECT',
        query: 'x_cahcs_react_rpt_resource_reporting.do',
        hint: 'Open the Resource Time Report',
        active: true,
        order: 100,
    },
})

export const taskResourceDashboardModule = Record({
    $id: Now.ID['task-resource-dashboard-module'],
    table: 'sys_app_module',
    data: {
        title: 'Task & Resource Assignment Dashboard',
        application: reactReportsMenu,
        link_type: 'DIRECT',
        query: 'x_cahcs_react_rpt_task_resource_dashboard.do',
        hint: 'Open the Task & Resource Assignment Dashboard',
        active: true,
        order: 200,
    },
})

export const slaBreachDashboardModule = Record({
    $id: Now.ID['sla-breach-dashboard-module'],
    table: 'sys_app_module',
    data: {
        title: 'SLA Breach by Team',
        application: reactReportsMenu,
        link_type: 'DIRECT',
        query: 'x_cahcs_react_rpt_sla_breach_dashboard.do',
        hint: 'Open the SLA Breach by Team dashboard',
        active: true,
        order: 300,
    },
})
