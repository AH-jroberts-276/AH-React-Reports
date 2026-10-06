import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import html from '../../client/kpi-report/index.html'

export const kpi_report_page = UiPage({
    $id: Now.ID['kpi-report-page'],
    endpoint: 'x_cahcs_react_rpt_kpi_report.do',
    description: 'KPI Review Report — random sampling of Incident and Catalog Task KPIs.',
    html: html,
    direct: true,
})
