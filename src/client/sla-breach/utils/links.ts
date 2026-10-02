// Drill-down link builders for the SLA Breach by Team report.
// Duplicated per-report by design — each report stays self-contained.

// Active "Assignment Group" metric definition on incident. The Breaching group
// link opens this incident's assignment-group metric_instance history.
export const ASSIGNMENT_GROUP_METRIC = '39d43745c0a808ae0062603b77018b90'

export function buildIncidentLink(incidentId: string): string {
    return '/incident.do?sys_id=' + incidentId
}

export function buildBreachMetricLink(incidentId: string): string {
    return (
        '/metric_instance_list.do?sysparm_query=' +
        encodeURIComponent('definition=' + ASSIGNMENT_GROUP_METRIC + '^table=incident^id=' + incidentId + '^ORDERBYstart')
    )
}
