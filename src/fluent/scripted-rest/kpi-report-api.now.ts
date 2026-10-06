import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'

// Scripted REST API that backs the KPI Report UI page.
//
// Base path: /api/x_cahcs_react_rpt/kpi_report
// GET route:  /report-data  ->  /api/x_cahcs_react_rpt/kpi_report/report-data
//
// The namespace defaults to the application scope (x_cahcs_react_rpt). The
// route requires an authenticated session; a role gate inside the handler
// returns HTTP 403 + { error } JSON when the caller lacks access.
RestApi({
    $id: Now.ID['kpi-report-api'],
    name: 'KPI Review Report',
    serviceId: 'kpi_report',
    shortDescription: 'Random sampling of Incident and Catalog Task KPI rows per selected user.',
    produces: 'application/json',
    routes: [
        {
            $id: Now.ID['kpi-report-report-data'],
            name: 'getReportData',
            method: 'GET',
            path: '/report-data',
            script: Now.include('./kpi-report-api.server.js'),
            authentication: true,
            produces: 'application/json',
            shortDescription: 'Returns { rows, total } — up to 5 random Incident/Catalog Task KPI rows per matching user.',
            parameters: [
                { $id: Now.ID['kpi-param-group-sys-ids'], name: 'group_sys_ids' },
                { $id: Now.ID['kpi-param-user-sys-ids'], name: 'user_sys_ids' },
                { $id: Now.ID['kpi-param-start-date'], name: 'start_date' },
                { $id: Now.ID['kpi-param-end-date'], name: 'end_date' },
                { $id: Now.ID['kpi-param-limit-worknotes'], name: 'limit_work_notes_to_assignee' },
                { $id: Now.ID['kpi-param-record-refs'], name: 'record_refs' },
            ],
        },
    ],
})
