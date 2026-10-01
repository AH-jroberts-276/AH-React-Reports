import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import html from '../../client/resource-reporting/index.html'

export const resource_reporting_page = UiPage({
    $id: Now.ID['resource-reporting-page'],
    endpoint: 'x_cahcs_react_rpt_resource_reporting.do',
    description: 'Resource Time Report — React UI page for resource aggregates and time card totals.',
    html: html,
    direct: true,
})
