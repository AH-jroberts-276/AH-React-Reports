// Scripted REST operation for the Resource Time Report "Resource Reporting" API.
//
// GET /api/x_cahcs_react_rpt/resource_reporting/report-data
//
// Reads query params (user_sys_ids, group_sys_ids, start_date, end_date,
// granularity). user_sys_ids and group_sys_ids are comma-separated lists;
// either or both may be omitted. Starting from the explicit user list, any
// active members of the supplied groups are UNIONed in; if the combined set is
// non-empty the aggregate/time_card queries are constrained to it. When BOTH
// params are empty, no user constraint is applied (all users). Pivots the
// resource aggregate (weekly/monthly) and time card tables into one row per
// (period, user). Returns { rows, total, truncated? }. Enforces a role gate and
// responds with HTTP 403 + { error } JSON when the caller lacks access.
;(function process(/* RESTAPIRequest */ request, /* RESTAPIResponse */ response) {
    var ROW_CAP = 10000
    var QUERY_LIMIT = 60000

    var MONTHS_LONG = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ]
    var MONTHS_SHORT = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]

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
        return (
            gs.hasRole('resource_user') ||
            gs.hasRole('sn_ppm_read') ||
            gs.hasRole('timecard_user') ||
            gs.hasRole('admin')
        )
    }

    function parseYmd(s) {
        var parts = String(s || '').split('-')
        return {
            y: parseInt(parts[0], 10) || 0,
            m: parseInt(parts[1], 10) || 0,
            d: parseInt(parts[2], 10) || 0,
        }
    }

    function weeklyLabel(ymd) {
        var p = parseYmd(ymd)
        if (!p.m) {
            return ymd
        }
        return 'Week of ' + MONTHS_SHORT[p.m - 1] + ' ' + p.d + ', ' + p.y
    }

    function monthlyLabel(ymd) {
        var p = parseYmd(ymd)
        if (!p.m) {
            return ymd
        }
        return MONTHS_LONG[p.m - 1] + ' ' + p.y
    }

    function firstOfMonth(ymd) {
        return String(ymd).substring(0, 7) + '-01'
    }

    function round2(n) {
        return Math.round(n * 100) / 100
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

    if (!hasAccess()) {
        response.setStatus(403)
        response.setBody({
            error: 'Access denied. Required role: resource_user, sn_ppm_read, or timecard_user.',
        })
        return
    }

    var userList = splitCsv(getParam('user_sys_ids'))
    var groupList = splitCsv(getParam('group_sys_ids'))
    var startDate = getParam('start_date')
    var endDate = getParam('end_date')
    var granularity = getParam('granularity') || 'weekly'
    var weekly = granularity !== 'monthly'

    // Build the combined user set: explicit users UNION active group members.
    var idSet = {}
    var combined = []
    function addId(id) {
        if (id && !idSet[id]) {
            idSet[id] = true
            combined.push(id)
        }
    }
    for (var i = 0; i < userList.length; i++) {
        addId(userList[i])
    }
    if (groupList.length) {
        var members = resolveGroupMembers(groupList)
        for (var j = 0; j < members.length; j++) {
            addId(members[j])
        }
    }

    // A filter was requested if either param was supplied. When requested but
    // the combined set is empty (e.g. empty groups), there is nothing to show.
    var filterRequested = userList.length > 0 || groupList.length > 0
    if (filterRequested && combined.length === 0) {
        response.setBody({ rows: [], total: 0 })
        return
    }

    var constrain = combined.length > 0
    var userSysIds = combined.join(',')

    var aggregateTable = weekly ? 'resource_aggregate_weekly' : 'resource_aggregate_monthly'
    var dateField = weekly ? 'week_starts_on' : 'month_starts_on'

    // key: userSysId + '|' + period(yyyy-MM-dd) -> accumulator row
    var rowMap = {}
    function getRow(userSysId, period) {
        var key = userSysId + '|' + period
        var row = rowMap[key]
        if (!row) {
            row = {
                period: period,
                userSysId: userSysId,
                userName: '',
                capacity: 0,
                availability: 0,
                allocated: 0,
                actual: 0,
                timeCardHours: 0,
            }
            rowMap[key] = row
        }
        return row
    }

    var agg = new GlideRecord(aggregateTable)
    if (constrain) {
        agg.addQuery('user', 'IN', userSysIds)
    }
    if (startDate) {
        agg.addQuery(dateField, '>=', startDate)
    }
    if (endDate) {
        agg.addQuery(dateField, '<=', endDate)
    }
    agg.addQuery('parent_category', 'IN', 'capacity,availability,allocated,actual')
    agg.orderBy(dateField)
    agg.setLimit(QUERY_LIMIT)
    agg.query()
    while (agg.next()) {
        var aUser = agg.getValue('user')
        var aPeriod = agg.getValue(dateField)
        if (!aUser || !aPeriod) {
            continue
        }
        var aRow = getRow(aUser, aPeriod)
        if (!aRow.userName) {
            aRow.userName = agg.getDisplayValue('user')
        }
        var cat = agg.getValue('parent_category')
        var hrs = parseFloat(agg.getValue('hours')) || 0
        if (cat === 'capacity') {
            aRow.capacity += hrs
        } else if (cat === 'availability') {
            aRow.availability += hrs
        } else if (cat === 'allocated') {
            aRow.allocated += hrs
        } else if (cat === 'actual') {
            aRow.actual += hrs
        }
    }

    var tc = new GlideRecord('time_card')
    if (constrain) {
        tc.addQuery('user', 'IN', userSysIds)
    }
    if (startDate) {
        tc.addQuery('week_starts_on', '>=', startDate)
    }
    if (endDate) {
        tc.addQuery('week_starts_on', '<=', endDate)
    }
    tc.orderBy('week_starts_on')
    tc.setLimit(QUERY_LIMIT)
    tc.query()
    while (tc.next()) {
        var tUser = tc.getValue('user')
        var week = tc.getValue('week_starts_on')
        if (!tUser || !week) {
            continue
        }
        var period = weekly ? week : firstOfMonth(week)
        var tRow = getRow(tUser, period)
        if (!tRow.userName) {
            tRow.userName = tc.getDisplayValue('user')
        }
        tRow.timeCardHours += parseFloat(tc.getValue('total')) || 0
    }

    var rows = []
    for (var key in rowMap) {
        if (!rowMap.hasOwnProperty(key)) {
            continue
        }
        var r = rowMap[key]
        var utilization = r.capacity > 0 ? Math.round((r.timeCardHours / r.capacity) * 1000) / 10 : 0
        rows.push({
            period: r.period,
            periodLabel: weekly ? weeklyLabel(r.period) : monthlyLabel(r.period),
            userSysId: r.userSysId,
            userName: r.userName,
            capacity: round2(r.capacity),
            availability: round2(r.availability),
            allocated: round2(r.allocated),
            actual: round2(r.actual),
            timeCardHours: round2(r.timeCardHours),
            utilization: utilization,
        })
    }

    rows.sort(function (a, b) {
        if (a.period < b.period) return -1
        if (a.period > b.period) return 1
        var an = (a.userName || '').toLowerCase()
        var bn = (b.userName || '').toLowerCase()
        if (an < bn) return -1
        if (an > bn) return 1
        return 0
    })

    var truncated = false
    if (rows.length > ROW_CAP) {
        rows = rows.slice(0, ROW_CAP)
        truncated = true
    }

    var body = { rows: rows, total: rows.length }
    if (truncated) {
        body.truncated = true
    }
    response.setBody(body)
})(request, response)
