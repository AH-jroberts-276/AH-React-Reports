# React Reports — Installed Components

**Application:** React Reports
**Scope:** `x_cahcs_react_rpt`
**Scope sys_id:** `a721f92797a34b900d54d124a253af79`
**Instance:** https://advocatedev.service-now.com
**Generated:** October 2026

> This application is **read-only reporting**. It creates no tables, business
> rules, or data-modifying artifacts. The three Scripted REST handlers contain
> only GlideRecord read operations; all client data access is HTTP GET.

To see everything owned by this app in one place:
[All application files (sys_metadata) for this scope](https://advocatedev.service-now.com/sys_metadata_list.do?sysparm_query=sys_scope%3Da721f92797a34b900d54d124a253af79)

---

## Application

| Component | Table | sys_id | Link |
|---|---|---|---|
| React Reports | `sys_app` | `a721f92797a34b900d54d124a253af79` | [open](https://advocatedev.service-now.com/sys_app.do?sys_id=a721f92797a34b900d54d124a253af79) |

---

## UI Pages (`sys_ui_page`) — the four reports

| Report | sys_id | Record | Open page |
|---|---|---|---|
| Resource Reporting | `81afa6e41e2f445e8ed38d83c3a2974f` | [edit](https://advocatedev.service-now.com/sys_ui_page.do?sys_id=81afa6e41e2f445e8ed38d83c3a2974f) | [open](https://advocatedev.service-now.com/x_cahcs_react_rpt_resource_reporting.do) |
| Task & Resource Assignment Dashboard | `fa31ab53adf74e42a818b1a8a93090a1` | [edit](https://advocatedev.service-now.com/sys_ui_page.do?sys_id=fa31ab53adf74e42a818b1a8a93090a1) | [open](https://advocatedev.service-now.com/x_cahcs_react_rpt_task_resource_dashboard.do) |
| SLA Breach by Team | `10a87eedcc9f4da2a986b937c89a3cec` | [edit](https://advocatedev.service-now.com/sys_ui_page.do?sys_id=10a87eedcc9f4da2a986b937c89a3cec) | [open](https://advocatedev.service-now.com/x_cahcs_react_rpt_sla_breach_dashboard.do) |
| KPI Review Report | `65ca19ad23ce47d894d39fb1053cc554` | [edit](https://advocatedev.service-now.com/sys_ui_page.do?sys_id=65ca19ad23ce47d894d39fb1053cc554) | [open](https://advocatedev.service-now.com/x_cahcs_react_rpt_kpi_report.do) |

Source: `src/client/<report>/` · UI page definitions: `src/fluent/ui-pages/`

---

## Scripted REST — Web Service Definitions (`sys_ws_definition`)

| Service | Base URI | sys_id | Link |
|---|---|---|---|
| Resource Reporting | `/api/x_cahcs_react_rpt/resource_reporting` | `aa987e8109cd4e94a80e7c67a1f60522` | [open](https://advocatedev.service-now.com/sys_ws_definition.do?sys_id=aa987e8109cd4e94a80e7c67a1f60522) |
| SLA Breach by Team | `/api/x_cahcs_react_rpt/sla_breach_by_team` | `cb446321c04f426392c1852ded53b57b` | [open](https://advocatedev.service-now.com/sys_ws_definition.do?sys_id=cb446321c04f426392c1852ded53b57b) |
| KPI Review Report | `/api/x_cahcs_react_rpt/kpi_report` | `6212025bfb7f44edb0a2d8f368015638` | [open](https://advocatedev.service-now.com/sys_ws_definition.do?sys_id=6212025bfb7f44edb0a2d8f368015638) |

## Scripted REST — Operations (`sys_ws_operation`)

| Operation | Method · Path | sys_id | Link |
|---|---|---|---|
| getReportData (Resource Reporting) | GET `/report-data` | `ec6c6ed38cd442b1bb8b876fac9dac7b` | [open](https://advocatedev.service-now.com/sys_ws_operation.do?sys_id=ec6c6ed38cd442b1bb8b876fac9dac7b) |
| getBreaches | GET `/breaches` | `a9252dd3638e411da813890c265d9482` | [open](https://advocatedev.service-now.com/sys_ws_operation.do?sys_id=a9252dd3638e411da813890c265d9482) |
| getReportData (KPI Review Report) | GET `/report-data` | `8d2f8ae4244c4e018ad35bebec9b7775` | [open](https://advocatedev.service-now.com/sys_ws_operation.do?sys_id=8d2f8ae4244c4e018ad35bebec9b7775) |

Source: `src/fluent/scripted-rest/` (`*-api.now.ts` + `*-api.server.js`).
Query parameters (`sys_ws_query_parameter`) are child records of each operation
— open the operation and see its **Query Parameters** related list.

- **getReportData** (Resource Reporting) params: `user_sys_ids`, `group_sys_ids`, `start_date`, `end_date`, `granularity`
- **getBreaches** params: `group`, `breaching`, `sla`, `created_from`, `created_to`, `limit`, `offset`, `order_by`, `order_dir`, `exclude`
- **getReportData** (KPI Review Report) params: `group_sys_ids`, `user_sys_ids`, `start_date`, `end_date`, `limit_work_notes_to_assignee`, `record_refs`

---

## Navigation

This application does **not** define an application-navigator menu or modules.
Each report is reached directly by its page URL (see **UI Pages** above).

---

## Access Control — Page ACLs (`sys_security_acl`)

Each report's rendered UI page is gated by a `ui_page` **read** ACL
(`decision_type = allow`, `admin_overrides = true`, so admins always retain
access). For a scoped UI page the ACL `name` is the page's endpoint **without**
the trailing `.do`. Allowed roles are stored as child `sys_security_acl_role`
records.

| Page (ACL name) | Allowed roles | sys_id | Link |
|---|---|---|---|
| `x_cahcs_react_rpt_resource_reporting` | `resource_manager`, `resource_user`, `sn_ppm_read` | `79c5ca0a8687438088a699514a94fa29` | [open](https://advocatedev.service-now.com/sys_security_acl.do?sys_id=79c5ca0a8687438088a699514a94fa29) |
| `x_cahcs_react_rpt_task_resource_dashboard` | `itil` | `1277e0dc4e524b6a86544259ff6ba934` | [open](https://advocatedev.service-now.com/sys_security_acl.do?sys_id=1277e0dc4e524b6a86544259ff6ba934) |
| `x_cahcs_react_rpt_sla_breach_dashboard` | `itil` | `c41e89d0bbef44ba8bf6a1a1049d9a07` | [open](https://advocatedev.service-now.com/sys_security_acl.do?sys_id=c41e89d0bbef44ba8bf6a1a1049d9a07) |
| `x_cahcs_react_rpt_kpi_report` | `itil` | `32ba6f1aaf794a1a906a0bf8ee30674e` | [open](https://advocatedev.service-now.com/sys_security_acl.do?sys_id=32ba6f1aaf794a1a906a0bf8ee30674e) |

Source: `src/fluent/security/ui-page-acls.now.ts`

> The Resource Time Report's Scripted REST data API (`getReportData`) enforces a
> matching server-side role gate (`resource_manager`, `resource_user`,
> `sn_ppm_read`, `admin`), so page access and data access stay consistent.

---

## Cross-Scope Privileges (`sys_scope_privilege`)

All entries have `status = allowed`.
[View all for this app](https://advocatedev.service-now.com/sys_scope_privilege_list.do?sysparm_query=sys_scope%3Da721f92797a34b900d54d124a253af79)

### Table reads (declared in `src/fluent/security/cross-scope-privileges.now.ts`)

| Target table | Operation | sys_id | Link |
|---|---|---|---|
| `task_sla` | read | `3a55f90f12c041d5acebed24c6107075` | [open](https://advocatedev.service-now.com/sys_scope_privilege.do?sys_id=3a55f90f12c041d5acebed24c6107075) |
| `incident` | read | `4e91e24a3961468ca3ad77a3d23100cb` | [open](https://advocatedev.service-now.com/sys_scope_privilege.do?sys_id=4e91e24a3961468ca3ad77a3d23100cb) |
| `sys_user_group` | read | `9e119e63872f8f901e7cebdd3fbb358f` | [open](https://advocatedev.service-now.com/sys_scope_privilege.do?sys_id=9e119e63872f8f901e7cebdd3fbb358f) |
| `sys_user_grmember` | read | `9fb05623872f8f901e7cebdd3fbb35a5` | [open](https://advocatedev.service-now.com/sys_scope_privilege.do?sys_id=9fb05623872f8f901e7cebdd3fbb35a5) |
| `time_card` | read | `9fb05623872f8f901e7cebdd3fbb35cb` | [open](https://advocatedev.service-now.com/sys_scope_privilege.do?sys_id=9fb05623872f8f901e7cebdd3fbb35cb) |
| `resource_aggregate_weekly` | read | `17b05623872f8f901e7cebdd3fbb35ab` | [open](https://advocatedev.service-now.com/sys_scope_privilege.do?sys_id=17b05623872f8f901e7cebdd3fbb35ab) |
| `resource_aggregate_monthly` | read | `6711de63872f8f901e7cebdd3fbb35ba` | [open](https://advocatedev.service-now.com/sys_scope_privilege.do?sys_id=6711de63872f8f901e7cebdd3fbb35ba) |
| `metric_instance` | read | `c52f64bc122f4077844d9e73a4528d0b` | [open](https://advocatedev.service-now.com/sys_scope_privilege.do?sys_id=c52f64bc122f4077844d9e73a4528d0b) |
| `sc_task` | read | `cd00010113fe4328a17b585d7ef31455` | [open](https://advocatedev.service-now.com/sys_scope_privilege.do?sys_id=cd00010113fe4328a17b585d7ef31455) |
| `sys_audit` | read | `3afe4ab75d1540ee95c90b21440e06a2` | [open](https://advocatedev.service-now.com/sys_scope_privilege.do?sys_id=3afe4ab75d1540ee95c90b21440e06a2) |
| `sys_journal_field` | read | `e1e06c1f0b054abfbe58390ef4a2e73f` | [open](https://advocatedev.service-now.com/sys_scope_privilege.do?sys_id=e1e06c1f0b054abfbe58390ef4a2e73f) |

> Note: a few auto-generated **scriptable** `execute` privileges (`RESTAPIRequest`,
> `ScriptableServiceResultBuilder.setBody`, `Glide API: user roles and groups`)
> were added by the SDK to support the Scripted REST runtime. See the
> "View all" link above for the complete, current set.

---

## React bundles

Each report's compiled React bundle is generated at **build time** from
`src/client/<report>/` and stored as a `sys_ux_lib_asset` record, served at:

- `/uxasset/externals/x_cahcs_react_rpt/resource-reporting/main.jsdbx`
- `/uxasset/externals/x_cahcs_react_rpt/task-resource-dashboard/main.jsdbx`
- `/uxasset/externals/x_cahcs_react_rpt/sla-breach/main.jsdbx`
- `/uxasset/externals/x_cahcs_react_rpt/kpi-report/main.jsdbx`

These are build artifacts (not hand-edited); the source of truth is the
`src/client/` TypeScript/React code.

---

## Source → Record map

| Source path | Produces (table) |
|---|---|
| `src/fluent/ui-pages/*.now.ts` | `sys_ui_page` |
| `src/fluent/scripted-rest/*-api.now.ts` | `sys_ws_definition`, `sys_ws_operation`, `sys_ws_query_parameter` |
| `src/fluent/scripted-rest/*-api.server.js` | handler script on the operation |
| `src/fluent/security/ui-page-acls.now.ts` | `sys_security_acl` (+ `sys_security_acl_role`) |
| `src/fluent/security/cross-scope-privileges.now.ts` | `sys_scope_privilege` |
| `src/client/<report>/**` | `sys_ux_lib_asset` (compiled bundle) |
