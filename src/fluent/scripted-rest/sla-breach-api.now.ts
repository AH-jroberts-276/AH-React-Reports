import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'

// Scripted REST API that backs the "SLA Breach by Team" UI page.
//
// Base path: /api/x_cahcs_react_rpt/sla_breach_by_team
// GET route:  /breaches  ->  /api/x_cahcs_react_rpt/sla_breach_by_team/breaches
//
// Strictly read-only: the handler reconstructs the group assigned at the moment
// of each SLA breach from metric_instance history (read-only GlideRecord
// queries only). The namespace defaults to the application scope
// (x_cahcs_react_rpt) and the route requires an authenticated session.
RestApi({
    $id: Now.ID['sla-breach-api'],
    name: 'SLA Breach by Team',
    serviceId: 'sla_breach_by_team',
    shortDescription: 'Breached incident SLAs with the group assigned at the moment of breach (read-only).',
    produces: 'application/json',
    routes: [
        {
            $id: Now.ID['sla-breach-breaches'],
            name: 'getBreaches',
            method: 'GET',
            path: '/breaches',
            script: Now.include('./sla-breach-api.server.js'),
            authentication: true,
            produces: 'application/json',
            shortDescription: 'Returns breached incident SLAs filtered by assignment/breaching group, paginated and sorted server-side.',
            parameters: [
                { $id: Now.ID['sb-param-group'], name: 'group' },
                { $id: Now.ID['sb-param-breaching'], name: 'breaching' },
                { $id: Now.ID['sb-param-sla'], name: 'sla' },
                { $id: Now.ID['sb-param-created-from'], name: 'created_from' },
                { $id: Now.ID['sb-param-created-to'], name: 'created_to' },
                { $id: Now.ID['sb-param-limit'], name: 'limit' },
                { $id: Now.ID['sb-param-offset'], name: 'offset' },
                { $id: Now.ID['sb-param-order-by'], name: 'order_by' },
                { $id: Now.ID['sb-param-order-dir'], name: 'order_dir' },
                { $id: Now.ID['sb-param-exclude'], name: 'exclude' },
            ],
        },
    ],
})
