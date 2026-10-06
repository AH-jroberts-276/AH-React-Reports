# AGENTS.md — React Reports development guide

> **Read this file before creating or modifying anything in this app.**
> It defines the conventions every page in this application follows. New work
> must match these patterns so each report stays independent and consistent.
>
> Companion reference: [`docs/INSTALLED-COMPONENTS.md`](docs/INSTALLED-COMPONENTS.md)
> is the live inventory of what already exists (UI pages, APIs, ACLs,
> cross-scope grants, bundle URLs). Consult it to find example records; update
> it when you add a new report.

**Application:** React Reports · **Scope:** `x_cahcs_react_rpt`
**Scope sys_id:** `a721f92797a34b900d54d124a253af79`
**Fluent SDK:** 4.13.3 · This is a **configuration project** (no server modules).

---

## 1. What this app is

A collection of **read-only React reporting pages**. It creates no tables,
business rules, or data-modifying artifacts. All data access is HTTP `GET`:
reference pickers use the platform Table API; report data comes from per-report
scoped Scripted REST APIs that run **GlideRecord reads only**.

Existing reports (use any as a working template):

| Report | Client source | Reference quality |
|---|---|---|
| Resource Time Report | `src/client/resource-reporting/` | **Best template** — richest filter + data layer |
| Task & Resource Assignment Dashboard | `src/client/task-resource-dashboard/` | Table-API only (no Scripted REST) |
| SLA Breach by Team | `src/client/sla-breach/` | metric_instance history pattern |
| KPI Report | `src/client/kpi-report/` | random sampling + audit/journal/metric reads |

---

## 2. The golden rule: every page is a self-contained vertical slice

A report **must not** share code or records with any other report. Adding or
changing one report must never risk breaking another. Each report owns:

- its own React app folder `src/client/<report>/`,
- its own UI page `src/fluent/ui-pages/<report>.now.ts`,
- its own Scripted REST API `src/fluent/scripted-rest/<report>-api.now.ts` +
  `<report>-api.server.js` (only if it needs server-side data; the
  Task & Resource Dashboard uses the Table API alone).

The **only** shared files are the two security files, and they are
**append-only** — never edit another report's existing entries:

- `src/fluent/security/ui-page-acls.now.ts`
- `src/fluent/security/cross-scope-privileges.now.ts`

---

## 3. Source → record map

| Source path | Produces (table) |
|---|---|
| `src/fluent/ui-pages/*.now.ts` | `sys_ui_page` |
| `src/fluent/scripted-rest/*-api.now.ts` | `sys_ws_definition`, `sys_ws_operation`, `sys_ws_query_parameter` |
| `src/fluent/scripted-rest/*-api.server.js` | handler script on the operation |
| `src/fluent/security/ui-page-acls.now.ts` | `sys_security_acl` (+ `sys_security_acl_role`) |
| `src/fluent/security/cross-scope-privileges.now.ts` | `sys_scope_privilege` |
| `src/client/<report>/**` | `sys_ux_lib_asset` (compiled bundle, build artifact) |

---

## 4. Recipe: add a new report page

Pick a short kebab-case report slug (e.g. `kpi-report`). Use it consistently.
The quickest reliable path is to **copy `resource-reporting` and adapt it**.

### 4.1 React client — `src/client/<slug>/`

Create: `index.html`, `main.tsx`, `app.tsx`, `app.css`, `components/`,
`services/api.ts`, `utils/`.

- **`index.html`** — mirror an existing one. The bundle script **must** carry
  the cache-buster query param or users get stale JS after a redeploy:
  ```html
  <title><Report Name></title>
  <sdk:now-ux-globals></sdk:now-ux-globals>
  <script src="main.tsx?uxpcb=$[UxFrameworkScriptables.getFlushTimestamp()]" type="module"></script>
  ```
- **`main.tsx`** — mounts `<App/>` on `#root` (copy verbatim).
- **Reusable components** (`MultiSelect`, `ErrorBoundary`, `Pagination`) can be
  copied verbatim from `resource-reporting`. **Copy them into the new folder —
  do not import across report folders** (keep slices independent).
- **`services/api.ts`** — pickers hit the Table API; report data hits this
  report's Scripted REST endpoint. Always send `X-UserToken: window.g_ck` and
  `Accept: application/json`. Unwrap the `{ result: ... }` envelope and surface
  `{ error }` payloads as thrown errors (see `resource-reporting/services/api.ts`).

### 4.2 UI page — `src/fluent/ui-pages/<slug>.now.ts`

```ts
import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import html from '../../client/<slug>/index.html'

export const <slug>_page = UiPage({
    $id: Now.ID['<slug>-page'],
    endpoint: 'x_cahcs_react_rpt_<slug_with_underscores>.do',
    description: '<Report Name> — ...',
    html: html,
    direct: true,
})
```

### 4.3 Scripted REST (only if the report needs server-side data)

`src/fluent/scripted-rest/<slug>-api.now.ts` — `RestApi` with a `serviceId`
(underscored), one GET route `path: '/report-data'`, `authentication: true`,
and a `parameters` array. Script is included from the sibling `.server.js`.

`src/fluent/scripted-rest/<slug>-api.server.js` — **inline ES5-style**
`;(function process(request, response) { ... })(request, response)`.
This is a configuration project, so **server modules are not supported** — the
handler logic is included verbatim via `Now.include('./<slug>-api.server.js')`.
Rules for the handler:

- Start with a **role gate**; on failure `response.setStatus(403)` and
  `response.setBody({ error: '...' })` then return. Keep it consistent with the
  page ACL roles.
- Read-only `GlideRecord` only. Parse CSV params defensively (see the
  `splitCsv` / `readList` helpers in the existing handlers).
- Return a JSON object (e.g. `{ rows, total }`).

### 4.4 Page ACL (append to `ui-page-acls.now.ts`)

```ts
export const <slug>_page_acl = Acl({
    $id: Now.ID['acl-ui-<slug>'],
    type: 'ui_page',
    name: 'x_cahcs_react_rpt_<slug_with_underscores>', // endpoint WITHOUT the trailing .do
    operation: 'read',
    roles: ['itil'], // match the Scripted REST role gate
    adminOverrides: true,
    description: '...',
})
```

### 4.5 Cross-scope privileges (append to `cross-scope-privileges.now.ts`)

A scoped app is isolated by default. **Any global table the server handler reads
must be granted here, or the query silently returns zero rows** (this is the
most common "no data" bug). One `CrossScopePrivilege` per table:

```ts
CrossScopePrivilege({
    $id: Now.ID['csp_read_<table>'],
    status: 'allowed',
    operation: 'read',
    targetName: '<table>',
    targetScope: 'global',
    targetType: 'sys_db_object',
})
```

Already granted (reuse, don't re-declare): `incident`, `sc_task`, `task_sla`,
`metric_instance`, `sys_audit`, `sys_journal_field`, `sys_user`,
`sys_user_group`, `sys_user_grmember`, `time_card`,
`resource_aggregate_weekly`, `resource_aggregate_monthly`.

---

## 5. Hard rules & conventions

- **Do NOT edit `src/fluent/generated/keys.ts`.** It is SDK-generated. New
  `Now.ID['...']` keys register automatically on the next build. Just use a new,
  unique, descriptive key string.
- **No application-navigator menu/modules.** Each report is reached directly by
  its `<endpoint>.do` URL. Do not add navigation records.
- **`$id` / naming conventions:** `<slug>-page`, `acl-ui-<slug>`, `<slug>-api`,
  `<slug>-report-data`, param ids like `<prefix>-param-<name>`,
  `csp_read_<table>`. Endpoint and `serviceId` use underscores
  (`x_cahcs_react_rpt_<slug>`, `<slug_underscored>`).
- **UI = ServiceNow Horizon.** Build with `@servicenow/react-components`
  (`Button`, `Select`, `DateTime`, `Loader`, `Alert`, …). Where a raw HTML
  element is unavoidable (e.g. the results `<table>`), reset browser default
  margins/padding/borders and style with `--now-*` design tokens (the existing
  reports expose them through `--rr-*` aliases in `app.css`). Never hardcode
  colors/spacing.
- **Dependencies:** if you touch `package.json`, preserve all existing content
  and pin **exact** semver (no `^`, `~`, or `latest`).
- **Keep the inventory in sync (required).** Any change that adds or modifies a
  UI page, Scripted REST API/operation/parameter, ACL, cross-scope grant, or
  React bundle **must** update [`docs/INSTALLED-COMPONENTS.md`](docs/INSTALLED-COMPONENTS.md)
  in the same change — add/adjust the relevant table rows (with the record
  `sys_id`s and links) and the report count in the headings. Treat the doc as
  part of "done": a change that leaves it stale is incomplete.

---

## 6. Validation workflow (always, in order)

1. `run_diagnostics` on each new/edited `.now.ts` / `.tsx` / `.ts` file.
2. `build` — resolve every error; fix cross-file references you broke.
3. `install`.
4. `ui_diagnostics` on the new page (`/x_cahcs_react_rpt_<slug>.do`) — because a
   `sys_ui_page` and its bundle changed. Confirm HTTP 200, the
   `.../<slug>/main.jsdbx` bundle loads, the first picker API call returns 200,
   and there are no uncaught JS errors. (The shared framework deprecation
   *warnings* are expected noise.)
5. Update `docs/INSTALLED-COMPONENTS.md` with the new page/API/ACL/grants.

---

## 7. Common gotchas

- **Blank data / empty pickers in a scoped read** → a missing
  `CrossScopePrivilege` (§4.5). Check this first.
- **Stale JS after redeploy** → missing `?uxpcb=...` on the `index.html` script.
- **ACL `name` mismatch** → it is the endpoint **without** `.do`, not the
  `sys_ui_page` name field.
- **Importing a component from another report's folder** → breaks the
  independence rule; copy it into your slice instead.
- **Reaching for a server module** → unsupported here; keep handler logic inline
  in the `.server.js` included via `Now.include()`.
