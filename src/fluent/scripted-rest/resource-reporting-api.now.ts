import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'

// Scripted REST API that backs the Resource Time Report UI page.
//
// Base path: /api/x_cahcs_react_rpt/resource_reporting
// GET route:  /report-data  ->  /api/x_cahcs_react_rpt/resource_reporting/report-data
//
// The namespace defaults to the application scope (x_cahcs_react_rpt). The
// route requires an authenticated session; a role gate inside the handler
// returns HTTP 403 + { error } JSON when the caller lacks access.
RestApi({
    $id: Now.ID['resource-reporting-api'],
    name: 'Resource Reporting',
    serviceId: 'resource_reporting',
    shortDescription: 'Pivoted per-(period, user) resource report data for the Resource Time Report UI.',
    produces: 'application/json',
    routes: [
        {
            $id: Now.ID['resource-reporting-report-data'],
            name: 'getReportData',
            method: 'GET',
            path: '/report-data',
            script: Now.include('./resource-reporting-api.server.js'),
            authentication: true,
            produces: 'application/json',
            shortDescription: 'Returns { rows, total, truncated? } pivoted by (period, user) for the selected filters.',
            parameters: [
                { $id: Now.ID['rr-param-search-type'], name: 'search_type' },
                { $id: Now.ID['rr-param-search-id'], name: 'search_id' },
                { $id: Now.ID['rr-param-start-date'], name: 'start_date' },
                { $id: Now.ID['rr-param-end-date'], name: 'end_date' },
                { $id: Now.ID['rr-param-granularity'], name: 'granularity' },
            ],
        },
    ],
})
