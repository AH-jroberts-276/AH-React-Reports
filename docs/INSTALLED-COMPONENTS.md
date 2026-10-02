# React Reports — Installed Components

**Application:** React Reports
**Scope:** `x_cahcs_react_rpt`
**Scope sys_id:** `a721f92797a34b900d54d124a253af79`
**Instance:** https://advocatedev.service-now.com
**Generated:** October 2026

> This application is **read-only reporting**. It creates no tables, business
> rules, or data-modifying artifacts. The two Scripted REST handlers contain
> only GlideRecord read operations; all client data access is HTTP GET.

To see everything owned by this app in one place:
[All application files (sys_metadata) for this scope](https://advocatedev.service-now.com/sys_metadata_list.do?sysparm_query=sys_scope%3Da721f92797a34b900d54d124a253af79)

---

## Application

| Component | Table | sys_id | Link |
|---|---|---|---|
| React Reports | `sys_app` | `a721f92797a34b900d54d124a253af79` | [open](https://advocatedev.service-now.com/sys_app.do?sys_id=a721f92797a34b900d54d124a253af79) |

---

## UI Pages (`sys_ui_page`) — the three reports

| Report | sys_id | Record | Open page |
|---|---|---|---|
| Resource Reporting | `81afa6e41e2f445e8ed38d83c3a2974f` | [edit](https://advocatedev.service-now.com/sys_ui_page.do?sys_id=81afa6e41e2f445e8ed38d83c3a2974f) | [open](https://advocatedev.service-now.com/x_cahcs_react_rpt_resource_reporting.do) |
| Task & Resource Assignment Dashboard | `fa31ab53adf74e42a818b1a8a93090a1` | [edit](https://advocatedev.service-now.com/sys_ui_page.do?sys_id=fa31ab53adf74e42a818b1a8a93090a1) | [open](https://advocatedev.service-now.com/x_cahcs_react_rpt_task_resource_dashboard.do) |
| SLA Breach by Team | `10a87eedcc9f4da2a986b937c89a3cec` | [edit](https://advocatedev.service-now.com/sys_ui_page.do?sys_id=10a87eedcc9f4da2a986b937c89a3cec) | [open](https://advocatedev.service-now.com/x_cahcs_react_rpt_sla_breach_dashboard.do) |

Source: `src/client/<report>/` · UI page definitions: `src/fluent/ui-pages/`

---

## Scripted REST — Web Service Definitions (`sys_ws_definition`)

| Service | Base URI | sys_id | Link |
|---|---|---|---|
| Resource Reporting | `/api/x_cahcs_react_rpt/resource_reporting` | `aa987e8109cd4e94a80e7c67a1f60522` | [open](https://advocatedev.service-now.com/sys_ws_definition.do?sys_id=aa987e8109cd4e94a80e7c67a1f60522) |
| SLA Breach by Team | `/api/x_cahcs_react_rpt/sla_breach_by_team` | `cb446321c04f426392c1852ded53b57b` | [open](https://advocatedev.service-now.com/sys_ws_definition.do?sys_id=cb446321c04f426392c1852ded53b57b) |

## Scripted REST — Operations (`sys_ws_operation`)

| Operation | Method · Path | sys_id | Link |
|---|---|---|---|
| getReportData | GET `/report-data` | `ec6c6ed38cd442b1bb8b876fac9dac7b` | [open](https://advocatedev.service-now.com/sys_ws_operation.do?sys_id=ec6c6ed38cd442b1bb8b876fac9dac7b) |
| getBreaches | GET `/breaches` | `a9252dd3638e411da813890c265d9482` | [open](https://advocatedev.service-now.com/sys_ws_operation.do?sys_id=a9252dd3638e411da813890c265d9482) |

Source: `src/fluent/scripted-rest/` (`*-api.now.ts` + `*-api.server.js`).
Query parameters (`sys_ws_query_parameter`) are child records of each operation
— open the operation and see its **Query Parameters** related list.

- **getReportData** params: `user_sys_ids`, `group_sys_ids`, `start_date`, `end_date`, `granularity`
- **getBreaches** params: `group`, `breaching`, `sla`, `created_from`, `created_to`, `limit`, `offset`, `order_by`, `order_dir`, `exclude`

---

## Navigation

| Component | Table | sys_id | Link |
|---|---|---|---|
| React Reports (application menu) | `sys_app_application` | `3330affa77724bc5a869d82a724299e9` | [open](https://advocatedev.service-now.com/sys_app_application.do?sys_id=3330affa77724bc5a869d82a724299e9) |
| Resource Reporting (module) | `sys_app_module` | `784920e4f0294225bd7a7a1cdeadcf28` | [open](https://advocatedev.service-now.com/sys_app_module.do?sys_id=784920e4f0294225bd7a7a1cdeadcf28) |
| Task & Resource Assignment Dashboard (module) | `sys_app_module` | `7c9a181db18e4071b4f1280b195d3ff6` | [open](https://advocatedev.service-now.com/sys_app_module.do?sys_id=7c9a181db18e4071b4f1280b195d3ff6) |
| SLA Breach by Team (module) | `sys_app_module` | `17b8ebd665364a6abecd676c94ae68f3` | [open](https://advocatedev.service-now.com/sys_app_module.do?sys_id=17b8ebd665364a6abecd676c94ae68f3) |

Source: `src/fluent/navigation/react-reports-nav.now.ts`

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

> Note: additional table-read grants (e.g. `metric_instance`) and a few
> auto-generated **scriptable** `execute` privileges (`RESTAPIRequest`,
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

These are build artifacts (not hand-edited); the source of truth is the
`src/client/` TypeScript/React code.

---

## Source → Record map

| Source path | Produces (table) |
|---|---|
| `src/fluent/ui-pages/*.now.ts` | `sys_ui_page` |
| `src/fluent/scripted-rest/*-api.now.ts` | `sys_ws_definition`, `sys_ws_operation`, `sys_ws_query_parameter` |
| `src/fluent/scripted-rest/*-api.server.js` | handler script on the operation |
| `src/fluent/navigation/react-reports-nav.now.ts` | `sys_app_application`, `sys_app_module` |
| `src/fluent/security/cross-scope-privileges.now.ts` | `sys_scope_privilege` |
| `src/client/<report>/**` | `sys_ux_lib_asset` (compiled bundle) |
