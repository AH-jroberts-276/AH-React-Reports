// Scripted REST handler for the "KPI Report" — legacy inlined server script
// (this app is a configuration project, which does not support server modules,
// so the logic is included verbatim via Now.include()).
//
// GET /api/x_cahcs_react_rpt/kpi_report/report-data
//
// Reads query params (group_sys_ids, user_sys_ids, start_date, end_date,
// limit_work_notes_to_assignee, record_refs).
// group_sys_ids and user_sys_ids are comma-separated lists. Explicit users
// take precedence: when user_sys_ids is non-empty the sample is drawn for
// exactly those users; otherwise the active members of group_sys_ids are used.
// When BOTH are empty, returns { rows: [], total: 0 }.
//
// For each resolved user, samples up to 5 RANDOM records across incident +
// sc_task where assigned_to = that user and sys_created_on is within the
// optional date range, and derives KPI columns (assignment within 24h,
// ever-placed-on-hold, all work notes on the record, resolution). Enforces a
// role gate and responds with HTTP 403 + { error } JSON when the caller lacks
// access.
;(function process(/* RESTAPIRequest */ request, /* RESTAPIResponse */ response) {
    var CANDIDATE_LIMIT = 5000
    var SAMPLE_PER_USER = 5
    var DAY_MS = 24 * 60 * 60 * 1000
    var ASSIGNMENT_GROUP_METRIC = '39d43745c0a808ae0062603b77018b90'
    var ON_HOLD = '3'

    function getParam(name) {
        var qp = request.queryParams || {}
        var v = qp[name]
        if (v === null || v === undefined) {
            return ''
        }
        if (v instanceof Array) {
            return v.length ? String(v[0]) : ''
        }
        return String(v)
    }

    function splitCsv(s) {
        var out = []
        var parts = String(s || '').split(',')
        for (var i = 0; i < parts.length; i++) {
            var t = parts[i].trim()
            if (t) {
                out.push(t)
            }
        }
        return out
    }

    function hasAccess() {
        return gs.hasRole('itil') || gs.hasRole('admin')
    }

    function toMs(dt) {
        return new GlideDateTime(dt).getNumericValue()
    }

    // Resolve the active members of one or more groups into an array of unique
    // user sys_ids.
    function resolveGroupMembers(groupSysIds) {
        var userIds = []
        var seen = {}
        if (!groupSysIds.length) {
            return userIds
        }
        var gr = new GlideRecord('sys_user_grmember')
        gr.addQuery('group', 'IN', groupSysIds.join(','))
        gr.addQuery('user.active', true)
        gr.query()
        while (gr.next()) {
            var userId = gr.getValue('user')
            if (userId && !seen[userId]) {
                seen[userId] = true
                userIds.push(userId)
            }
        }
        return userIds
    }

    // Fisher-Yates shuffle in place.
    function shuffle(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1))
            var tmp = arr[i]
            arr[i] = arr[j]
            arr[j] = tmp
        }
        return arr
    }

    // Earliest time the record was assigned to `groupId`, in ms.
    // Returns null when no assignment event is found.
    function incidentAssignMs(incidentId, groupId) {
        var mi = new GlideRecord('metric_instance')
        mi.addQuery('definition', ASSIGNMENT_GROUP_METRIC)
        mi.addQuery('table', 'incident')
        mi.addQuery('id', incidentId)
        mi.addQuery('field_value', groupId)
        mi.orderBy('start')
        mi.setLimit(1)
        mi.query()
        if (mi.next()) {
            return toMs(mi.getValue('start'))
        }
        return null
    }

    function taskAssignMs(taskId, groupId) {
        var au = new GlideRecord('sys_audit')
        au.addQuery('tablename', 'sc_task')
        au.addQuery('documentkey', taskId)
        au.addQuery('fieldname', 'assignment_group')
        au.addQuery('newvalue', groupId)
        au.orderBy('sys_created_on')
        au.setLimit(1)
        au.query()
        if (au.next()) {
            return toMs(au.getValue('sys_created_on'))
        }
        return null
    }

    // Collect candidate record ids for one user from the given table within the
    // optional date range.
    function collectCandidates(table, userId, startDate, endDate) {
        var out = []
        var gr = new GlideRecord(table)
        gr.addQuery('assigned_to', userId)
        if (startDate) {
            gr.addQuery('sys_created_on', '>=', startDate + ' 00:00:00')
        }
        if (endDate) {
            gr.addQuery('sys_created_on', '<=', endDate + ' 23:59:59')
        }
        gr.setLimit(CANDIDATE_LIMIT)
        gr.query()
        while (gr.next()) {
            out.push({ table: table, id: gr.getValue('sys_id') })
        }
        return out
    }

    // Was the incident EVER placed On Hold?
    function incidentEverOnHold(gr, incidentId) {
        if (gr.getValue('incident_state') === ON_HOLD) {
            return 'Yes'
        }
        var au = new GlideRecord('sys_audit')
        au.addQuery('tablename', 'incident')
        au.addQuery('documentkey', incidentId)
        au.addQuery('fieldname', 'IN', 'incident_state,state')
        au.addQuery('newvalue', ON_HOLD)
        au.setLimit(1)
        au.query()
        if (au.next()) {
            return 'Yes'
        }
        return 'No'
    }

    // All work notes on the record, in chronological order. Each note carries
    // its own author (the user who entered it), not just the current assignee.
    // The stored author is the user_name (sys_created_by); translate it to the
    // user's display name (sys_user.name), caching lookups by user_name.
    var authorNameCache = {}
    function authorDisplayName(userName) {
        if (!userName) {
            return ''
        }
        if (authorNameCache.hasOwnProperty(userName)) {
            return authorNameCache[userName]
        }
        var name = userName
        var u = new GlideRecord('sys_user')
        u.addQuery('user_name', userName)
        u.setLimit(1)
        u.query()
        if (u.next()) {
            name = u.getValue('name') || userName
        }
        authorNameCache[userName] = name
        return name
    }

    // Resolve the user_name (sys_user.user_name) for a sys_user sys_id, cached.
    // Used to constrain work notes to the current assignee.
    var userNameCache = {}
    function resolveUserName(userSysId) {
        if (!userSysId) {
            return ''
        }
        if (userNameCache.hasOwnProperty(userSysId)) {
            return userNameCache[userSysId]
        }
        var name = ''
        var u = new GlideRecord('sys_user')
        if (u.get(userSysId)) {
            name = u.getValue('user_name') || ''
        }
        userNameCache[userSysId] = name
        return name
    }

    function collectWorkNotes(recordSysId, assigneeUserName) {
        var notes = []
        if (!recordSysId) {
            return notes
        }
        var jf = new GlideRecord('sys_journal_field')
        jf.addQuery('element_id', recordSysId)
        jf.addQuery('element', 'work_notes')
        if (assigneeUserName) {
            jf.addQuery('sys_created_by', assigneeUserName)
        }
        jf.orderBy('sys_created_on')
        jf.setLimit(200)
        jf.query()
        while (jf.next()) {
            notes.push({
                value: jf.getValue('value'),
                createdOn: jf.getDisplayValue('sys_created_on'),
                author: authorDisplayName(jf.getValue('sys_created_by')),
            })
        }
        return notes
    }

    if (!hasAccess()) {
        response.setStatus(403)
        response.setBody({ error: 'Access denied. Required role: itil.' })
        return
    }

    var groupList = splitCsv(getParam('group_sys_ids'))
    var userList = splitCsv(getParam('user_sys_ids'))
    var startDate = getParam('start_date')
    var endDate = getParam('end_date')
    var limitWorkNotesToAssignee = getParam('limit_work_notes_to_assignee') === 'true'

    // Group membership set for the assignment-column test.
    var groupSet = {}
    for (var gi = 0; gi < groupList.length; gi++) {
        groupSet[groupList[gi]] = true
    }
    var hasGroupFilter = groupList.length > 0

    // Refresh path: when explicit record refs ("table:sys_id,...") are supplied,
    // rebuild rows for exactly those records instead of drawing a new random
    // sample. This lets the client re-pull the current data set after toggling
    // the "Limit Work Notes to Assigned to" option. The group filter is still
    // honored (via groupSet) so the Assignment column is unchanged.
    var recordRefs = splitCsv(getParam('record_refs'))
    if (recordRefs.length) {
        var refRows = []
        for (var rr = 0; rr < recordRefs.length; rr++) {
            var ref = recordRefs[rr]
            var sep = ref.indexOf(':')
            if (sep < 0) {
                continue
            }
            var refTable = ref.substring(0, sep)
            var refId = ref.substring(sep + 1)
            if (refTable !== 'incident' && refTable !== 'sc_task') {
                continue
            }
            var refRec = new GlideRecord(refTable)
            if (refRec.get(refId)) {
                refRows.push(buildRow(refRec, refTable, refRec.getValue('assigned_to')))
            }
        }
        response.setBody({ rows: refRows, total: refRows.length })
        return
    }

    // Resolve the user set. Explicit users take precedence; otherwise fall back
    // to the active members of the selected groups.
    var users = []
    var seenUser = {}
    function addUser(id) {
        if (id && !seenUser[id]) {
            seenUser[id] = true
            users.push(id)
        }
    }
    if (userList.length) {
        for (var ui = 0; ui < userList.length; ui++) {
            addUser(userList[ui])
        }
    } else if (groupList.length) {
        var members = resolveGroupMembers(groupList)
        for (var mi2 = 0; mi2 < members.length; mi2++) {
            addUser(members[mi2])
        }
    }

    // Nothing requested, or the requested filter resolved to no users.
    if (users.length === 0) {
        response.setBody({ rows: [], total: 0 })
        return
    }

    function buildRow(gr, table, userSysId) {
        var recordSysId = gr.getValue('sys_id')
        var isIncident = table === 'incident'
        var createdMs = toMs(gr.getValue('sys_created_on'))
        var threshold = createdMs + DAY_MS

        // ----- assignment (assigned to a filtered group within 24h) -----
        var currentAg = gr.getValue('assignment_group')
        var assignment
        if (!currentAg) {
            assignment = 'No'
        } else if (hasGroupFilter && !groupSet[currentAg]) {
            // The record's CURRENT assignment group is not one of the filtered
            // groups.
            assignment = 'No'
        } else {
            var assignMs = isIncident
                ? incidentAssignMs(recordSysId, currentAg)
                : taskAssignMs(recordSysId, currentAg)
            if (assignMs === null) {
                // No explicit assignment event — treat as assigned at creation.
                assignMs = createdMs
            }
            assignment = assignMs <= threshold ? 'Yes' : 'No'
        }

        // ----- placedOnHold -----
        var placedOnHold
        if (!isIncident) {
            placedOnHold = 'N/A'
        } else {
            placedOnHold = incidentEverOnHold(gr, recordSysId)
        }

        return {
            sysId: recordSysId,
            table: table,
            type: isIncident ? 'Incident' : 'Catalog Task',
            number: gr.getDisplayValue('number'),
            userSysId: userSysId,
            userName: gr.getDisplayValue('assigned_to'),
            assignmentGroup: gr.getDisplayValue('assignment_group'),
            createdOn: gr.getDisplayValue('sys_created_on'),
            assignment: assignment,
            placedOnHold: placedOnHold,
            workNotes: collectWorkNotes(
                recordSysId,
                limitWorkNotesToAssignee ? resolveUserName(gr.getValue('assigned_to')) : ''
            ),
            resolution: gr.getValue('close_notes'),
        }
    }

    var rows = []
    for (var u = 0; u < users.length; u++) {
        var userSysId = users[u]

        var candidates = []
        var incCandidates = collectCandidates('incident', userSysId, startDate, endDate)
        for (var ci = 0; ci < incCandidates.length; ci++) {
            candidates.push(incCandidates[ci])
        }
        var scCandidates = collectCandidates('sc_task', userSysId, startDate, endDate)
        for (var cj = 0; cj < scCandidates.length; cj++) {
            candidates.push(scCandidates[cj])
        }

        if (!candidates.length) {
            continue
        }

        shuffle(candidates)
        var take = candidates.length < SAMPLE_PER_USER ? candidates.length : SAMPLE_PER_USER
        for (var k = 0; k < take; k++) {
            var pick = candidates[k]
            var rec = new GlideRecord(pick.table)
            if (rec.get(pick.id)) {
                rows.push(buildRow(rec, pick.table, userSysId))
            }
        }
    }

    response.setBody({ rows: rows, total: rows.length })
})(request, response)
