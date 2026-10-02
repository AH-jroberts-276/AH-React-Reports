/**
 * Scripted REST handler for "SLA Breach by Team" — legacy inlined server script
 * (this app is a configuration project, which does not support server modules,
 * so the logic is included verbatim via Now.include()).
 *
 * Filters (at least one of group / breaching is required):
 *   group      comma-separated sys_ids — incident's CURRENT assignment group(s)
 *   breaching  comma-separated sys_ids — group assigned AT THE MOMENT OF BREACH
 *   sla        comma-separated contract_sla sys_ids (optional)
 *   created_from / created_to  yyyy-MM-dd (optional)
 *   limit (default 50, max 500), offset (default 0)
 *   order_by (number|short_description|sla|planned_end_time, default number)
 *   order_dir (asc|desc, default desc)
 *   exclude    'true' to drop rows whose breaching group is one of the selected `group`s
 *
 * Each row includes the breaching group (from metric_instance history) and an
 * `inherited` flag (true when the breaching group != the incident's current group).
 */
(function process(request, response) {
    var ASSIGNMENT_GROUP_METRIC = '39d43745c0a808ae0062603b77018b90';
    var DEFAULT_LIMIT = 50;
    var MAX_LIMIT = 500;
    // Maximum number of matching records the dashboard will render. If the
    // filters match more than this, the UI asks the user to narrow further.
    // Change this single value to raise/lower the cap.
    var MAX_RESULTS = 2000;
    var SORT_FIELDS = {
        number: 'task.number',
        short_description: 'task.short_description',
        sla: 'sla',
        planned_end_time: 'planned_end_time'
    };

    function readParam(value) {
        if (value === undefined || value === null) {
            return '';
        }
        if (Array.isArray(value)) {
            return value.length ? String(value[0]) : '';
        }
        return String(value);
    }

    function readList(value) {
        if (value === undefined || value === null) {
            return [];
        }
        var s = Array.isArray(value) ? value.join(',') : String(value);
        var parts = s.split(',');
        var out = [];
        for (var i = 0; i < parts.length; i++) {
            var t = parts[i].trim();
            if (t) {
                out.push(t);
            }
        }
        return out;
    }

    function toMs(dateTime) {
        return new GlideDateTime(dateTime).getNumericValue();
    }

    function resolveGroupName(groupId) {
        var gr = new GlideRecord('sys_user_group');
        if (gr.get(groupId)) {
            return gr.getValue('name') || '';
        }
        return '';
    }

    // Group assigned to the incident at the instant the SLA breached.
    function groupAtBreach(incidentId, breach) {
        var mi = new GlideRecord('metric_instance');
        mi.addQuery('definition', ASSIGNMENT_GROUP_METRIC);
        mi.addQuery('table', 'incident');
        mi.addQuery('id', incidentId);
        mi.orderBy('start');
        mi.query();
        var b = toMs(breach);
        while (mi.next()) {
            var s = mi.getValue('start');
            if (!s || b < toMs(s)) {
                continue;
            }
            var e = mi.getValue('end');
            if (!e || b < toMs(e)) {
                return { id: mi.getValue('field_value') || '', name: mi.getValue('value') || '' };
            }
        }
        return { id: '', name: '' };
    }

    // Build an in-memory map incidentId -> [{ s, e, id, name }] of the assignment
    // windows for the given group ids, from a SINGLE metric query. `s`/`e` are
    // millisecond bounds (e === null means still assigned). Lets the scan resolve
    // the breaching group per row without a query each time.
    function buildWindows(groupIds) {
        var map = {};
        var mi = new GlideRecord('metric_instance');
        mi.addQuery('definition', ASSIGNMENT_GROUP_METRIC);
        mi.addQuery('table', 'incident');
        mi.addQuery('field_value', 'IN', groupIds.join(','));
        mi.orderBy('start');
        mi.query();
        while (mi.next()) {
            var inc = mi.getValue('id');
            var s = mi.getValue('start');
            if (!inc || !s) {
                continue;
            }
            var e = mi.getValue('end');
            if (!map[inc]) {
                map[inc] = [];
            }
            map[inc].push({
                s: toMs(s),
                e: e ? toMs(e) : null,
                id: mi.getValue('field_value') || '',
                name: mi.getValue('value') || ''
            });
        }
        return map;
    }

    // Window (from a buildWindows map) whose [s, e) interval contains breachMs.
    function windowAt(map, incidentId, breachMs) {
        var w = map[incidentId];
        if (!w) {
            return null;
        }
        for (var i = 0; i < w.length; i++) {
            if (breachMs < w[i].s) {
                continue;
            }
            if (w[i].e === null || breachMs < w[i].e) {
                return w[i];
            }
        }
        return null;
    }

    var params = request.queryParams || {};
    var groups = readList(params.group);
    var breaching = readList(params.breaching);
    var slas = readList(params.sla);
    var createdFrom = readParam(params.created_from);
    var createdTo = readParam(params.created_to);
    var exclude = readParam(params.exclude) === 'true';

    var limit = parseInt(readParam(params.limit), 10);
    if (isNaN(limit) || limit <= 0) {
        limit = DEFAULT_LIMIT;
    }
    if (limit > MAX_LIMIT) {
        limit = MAX_LIMIT;
    }
    var offset = parseInt(readParam(params.offset), 10);
    if (isNaN(offset) || offset < 0) {
        offset = 0;
    }
    var orderBy = readParam(params.order_by);
    if (!SORT_FIELDS[orderBy]) {
        orderBy = 'number';
    }
    var orderDir = readParam(params.order_dir) === 'asc' ? 'asc' : 'desc';

    if (groups.length === 0 && breaching.length === 0) {
        response.setStatus(400);
        response.setBody({ error: 'Provide at least one assignment group or breaching group.' });
        return;
    }

    var assignmentSet = {};
    for (var ai = 0; ai < groups.length; ai++) {
        assignmentSet[groups[ai]] = true;
    }
    var breachingSet = {};
    for (var bi = 0; bi < breaching.length; bi++) {
        breachingSet[breaching[bi]] = true;
    }

    // Heading label reflecting the primary filter.
    var groupName;
    if (groups.length) {
        groupName = groups.length === 1 ? resolveGroupName(groups[0]) : groups.length + ' groups';
    } else {
        groupName = breaching.length === 1 ? resolveGroupName(breaching[0]) : breaching.length + ' groups';
    }

    var baseQuery = 'has_breached=true^task.sys_class_name=incident';
    if (groups.length) {
        baseQuery += '^task.assignment_groupIN' + groups.join(',');
    }
    if (slas.length) {
        baseQuery += '^slaIN' + slas.join(',');
    }
    if (createdFrom) {
        baseQuery += '^task.sys_created_on>=' + createdFrom + ' 00:00:00';
    }
    if (createdTo) {
        baseQuery += '^task.sys_created_on<=' + createdTo + ' 23:59:59';
    }

    // Precompute breaching-group assignment windows (a SINGLE metric query) so
    // the scan can test/display the breaching group in memory — no per-row query.
    var breachingWindows = null;
    if (breaching.length) {
        breachingWindows = buildWindows(breaching);
        var bIncIds = Object.keys(breachingWindows);
        if (bIncIds.length === 0) {
            response.setBody({
                group: groups.join(','), groupName: groupName, total: 0, offset: offset,
                limit: limit, orderBy: orderBy, orderDir: orderDir, shown: 0, rows: [],
                capped: false, maxResults: MAX_RESULTS,
                note: 'No breached incident SLAs match the selected breaching group(s).'
            });
            return;
        }
        // When there is no current-group filter, bound the scan to those incidents.
        if (groups.length === 0) {
            baseQuery += '^taskIN' + bIncIds.join(',');
        }
    }
    // For exclude WITHOUT a breaching filter, precompute assignment-group windows
    // so the exclude predicate is an in-memory lookup during the scan.
    var assignWindows = exclude && !breaching.length ? buildWindows(groups) : null;

    var orderClause = (orderDir === 'asc' ? '^ORDERBY' : '^ORDERBYDESC') + SORT_FIELDS[orderBy];

    function buildRow(gr, gab) {
        var currentAg = gr.getValue('task.assignment_group') || '';
        return {
            sys_id: gr.getValue('sys_id'),
            number: gr.getDisplayValue('task.number') || '',
            incident_id: gr.getValue('task'),
            assignment_group: gr.getDisplayValue('task.assignment_group') || '',
            short_description: gr.getDisplayValue('task.short_description') || '',
            sla: gr.getDisplayValue('sla') || '',
            sla_id: gr.getValue('sla'),
            planned_end_time: gr.getDisplayValue('planned_end_time') || '',
            assigned_group_at_breach: gab.name,
            inherited: !!gab.id && gab.id !== currentAg
        };
    }

    var total = 0;
    var rows = [];
    var needScan = exclude || breaching.length > 0;

    if (!needScan) {
        // Fast path: DB count + windowed page; breaching group resolved per page.
        var countGr = new GlideRecord('task_sla');
        countGr.addEncodedQuery(baseQuery);
        countGr.query();
        total = countGr.getRowCount();

        // Render up to MAX_RESULTS records; never return rows beyond the cap.
        var lastRow = Math.min(offset + limit, MAX_RESULTS);
        if (offset < lastRow) {
            var pageGr = new GlideRecord('task_sla');
            pageGr.addEncodedQuery(baseQuery + orderClause);
            pageGr.chooseWindow(offset, lastRow);
            pageGr.query();
            while (pageGr.next()) {
                var incId = pageGr.getValue('task');
                var breach = pageGr.getValue('planned_end_time');
                var gab = breach && incId ? groupAtBreach(incId, breach) : { id: '', name: '' };
                rows.push(buildRow(pageGr, gab));
            }
        }
    } else {
        // Scan the ordered set, applying breaching/exclude predicates via the
        // precomputed windows maps (no per-row metric query). The full breaching
        // group is resolved (via groupAtBreach) only for the rows on this page.
        var scan = new GlideRecord('task_sla');
        scan.addEncodedQuery(baseQuery + orderClause);
        scan.query();
        while (scan.next()) {
            var sIncId = scan.getValue('task');
            var sBreach = scan.getValue('planned_end_time');
            var bMs = sBreach ? toMs(sBreach) : 0;

            var hit = null; // breaching-group window match (when breaching filter is on)
            if (breaching.length) {
                hit = sBreach && sIncId ? windowAt(breachingWindows, sIncId, bMs) : null;
                if (!hit) {
                    continue; // not breached under a selected breaching group
                }
                if (exclude && assignmentSet[hit.id]) {
                    continue; // also excluded (breached under a selected assignment group)
                }
            } else if (exclude) {
                var aw = sBreach && sIncId ? windowAt(assignWindows, sIncId, bMs) : null;
                if (aw && assignmentSet[aw.id]) {
                    continue; // breached under a selected assignment group
                }
            }

            if (total < MAX_RESULTS && total >= offset && rows.length < limit) {
                var gab = hit ? { id: hit.id, name: hit.name } : groupAtBreach(sIncId, sBreach);
                rows.push(buildRow(scan, gab));
            }
            total++;
        }
    }

    var body = {
        group: groups.join(','),
        groupName: groupName,
        total: total,
        offset: offset,
        limit: limit,
        orderBy: orderBy,
        orderDir: orderDir,
        shown: rows.length,
        rows: rows,
        capped: total > MAX_RESULTS,
        maxResults: MAX_RESULTS,
        displayTotal: total > MAX_RESULTS ? MAX_RESULTS : total
    };
    if (total === 0) {
        body.note = 'No breached incident SLAs match the selected filters.';
    }
    response.setBody(body);
})(request, response);
