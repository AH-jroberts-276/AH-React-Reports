import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import html from '../../client/sla-breach/index.html'

export const sla_breach_dashboard_page = UiPage({
    $id: Now.ID['sla-breach-page'],
    endpoint: 'x_cahcs_react_rpt_sla_breach_dashboard.do',
    description: 'SLA Breach by Team — React UI page listing breached incident SLAs with the group assigned at the moment of breach.',
    html: html,
    direct: true,
})
