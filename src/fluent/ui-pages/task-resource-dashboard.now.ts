import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import html from '../../client/task-resource-dashboard/index.html'

export const task_resource_dashboard_page = UiPage({
    $id: Now.ID['task-resource-dashboard-page'],
    endpoint: 'x_cahcs_react_rpt_task_resource_dashboard.do',
    description:
        'Task & Resource Assignment Dashboard — read-only React UI page unifying tasks and resource assignments.',
    html: html,
    direct: true,
})
