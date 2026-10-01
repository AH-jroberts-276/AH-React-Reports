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
