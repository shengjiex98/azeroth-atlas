local ADDON, ns = ...

local INDEX_VERSION = 2
local SIZE_LIMIT = 120 * 1024
local PREFIX = "RSJ1."
local ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
local concat, floor = table.concat, math.floor
-- A 12-bit lookup emits two characters at a time, including for large clipboard exports.
local base64Pairs = {}
for i = 0, 63 do
    for j = 0, 63 do
        base64Pairs[i * 64 + j] = ALPHABET:sub(i + 1, i + 1) .. ALPHABET:sub(j + 1, j + 1)
    end
end

function ns.journalCellKey(map, x, y)
    return ("%d:%d:%d"):format(map, math.min(19, floor(x / 50)), math.min(19, floor(y / 50)))
end

local function zoneAt(index, map)
    local zone = index.zones[map]
    if not zone then
        zone = { seconds = 0, kills = 0, quests = 0, deaths = 0 }
        index.zones[map] = zone
    end
    return zone
end

function ns.observeJournal(index, stamp, map, x, y, level)
    local zone = zoneAt(index, map)
    if not zone.first or stamp < zone.first then zone.first = stamp end
    if level then
        zone.min = math.min(zone.min or level, level)
        zone.max = math.max(zone.max or level, level)
    end
    if index.lastMap ~= map then
        index.visits[#index.visits + 1] = map .. ":" .. stamp
        index.lastMap = map
    end
    if x and y then
        local key = ns.journalCellKey(map, x, y)
        local first = index.firstSeen[key]
        if not first or stamp < first then index.firstSeen[key] = stamp end
        return zone, key
    end
    return zone
end

function ns.indexJournalEvent(index, kind, stamp, map, x, y, detail, level, backfilled)
    local zone, key
    if map then
        if stamp then
            zone, key = ns.observeJournal(index, stamp, map, x, y, level)
        else
            zone = zoneAt(index, map)
        end
    end
    if kind == "A" or kind == "Q" or kind == "D" or kind == "L" then
        if kind == "Q" then
            if detail then index.seenQuests[detail] = true end
            if zone then zone.quests = zone.quests + 1 end
        elseif kind == "D" and zone then
            zone.deaths = zone.deaths + 1
        end
        local line = concat({ kind, stamp or "", map or "", x or "", y or "", detail or "" }, "|")
        if kind == "Q" then line = line .. (backfilled and "|b" or "|") end
        index.milestones[#index.milestones + 1] = { line, stamp, backfilled and detail or nil, backfilled and map or nil }
    elseif kind == "S" and key and detail and detail ~= "" then
        local counts = index.labels[key]
        if not counts then
            counts = {}
            index.labels[key] = counts
        end
        counts[detail] = (counts[detail] or 0) + 1
    end
end

function ns.initSummaryIndex(journal)
    if journal.summaryIndex and journal.summaryIndex.version == INDEX_VERSION then return end
    local index = { version = INDEX_VERSION, zones = {}, visits = {}, firstSeen = {}, labels = {},
        milestones = {}, seenQuests = {} }
    local edges = {}
    for key, cell in pairs(journal.cells) do
        local map, cx, cy = key:match("^(%d+):(%d+):(%d+)$")
        if map then
            local zone = zoneAt(index, tonumber(map))
            zone.seconds = zone.seconds + cell.s
            zone.kills = zone.kills + cell.k
            if cx == "20" or cy == "20" then edges[#edges + 1] = key end
        end
    end
    -- Older journals rounded the outer edge into cell 20. Fold it into the last v1 square.
    for _, key in ipairs(edges) do
        local map, cx, cy = key:match("^(%d+):(%d+):(%d+)$")
        local target = ns.journalCellKey(tonumber(map), tonumber(cx) * 50, tonumber(cy) * 50)
        local cell, existing = journal.cells[key], journal.cells[target]
        if existing then
            for _, field in ipairs({ "s", "kx", "k", "qx", "ox" }) do
                existing[field] = existing[field] + cell[field]
            end
        else
            journal.cells[target] = cell
        end
        journal.cells[key] = nil
    end
    local level
    for _, event in ipairs(journal.events) do
        local kind, stamp, map, x, y, rest = event:match("^([A-Z])|([^|]*)|([^|]*)|([^|]*)|([^|]*)|?(.*)$")
        if kind then
            local detail
            if kind == "S" then
                detail = rest:gsub("[|\r\n]", "")
            elseif kind == "A" or kind == "Q" or kind == "D" or kind == "L" then
                detail = tonumber(rest:match("^[^|]*"))
            end
            if kind == "D" or kind == "L" then level = detail or level end
            ns.indexJournalEvent(index, kind, tonumber(stamp), tonumber(map), tonumber(x), tonumber(y),
                detail, level, kind == "Q" and stamp == "" and rest:match("|b$") ~= nil)
        end
    end
    journal.summaryIndex = index
end

local function base64url(input)
    local out = { PREFIX }
    local tail = #input % 3
    local last = #input - tail
    for i = 1, last, 3 do
        local a, b, c = input:byte(i, i + 2)
        out[#out + 1] = base64Pairs[a * 16 + floor(b / 16)] .. base64Pairs[b % 16 * 256 + c]
    end
    if tail > 0 then
        local a, b = input:byte(last + 1, last + tail)
        out[#out + 1] = base64Pairs[a * 16 + floor((b or 0) / 16)]
        if b then
            local third = b % 16 * 4 + 1
            out[#out + 1] = ALPHABET:sub(third, third)
        end
    end
    return concat(out)
end

local function field(value)
    if type(value) == "string" then return (value:gsub("[|\r\n]", "")) end
    if type(value) == "number" then return value end
    return ""
end

local function sortedKeys(values)
    local keys = {}
    for key in pairs(values) do keys[#keys + 1] = key end
    table.sort(keys)
    return keys
end

local function buildMilestonesAndRoute(index, backfill)
    local order = {}
    for i = 1, #index.milestones do order[i] = i end
    local function questLevel(id)
        local level = backfill[id]
        return type(level) == "number" and level or math.huge
    end
    table.sort(order, function(a, b)
        local left, right = index.milestones[a], index.milestones[b]
        if left[2] ~= right[2] then return (left[2] or -1) < (right[2] or -1) end
        if (left[3] ~= nil) ~= (right[3] ~= nil) then return left[3] ~= nil end
        if left[3] and right[3] then
            local leftLevel, rightLevel = questLevel(left[3]), questLevel(right[3])
            if leftLevel ~= rightLevel then return leftLevel < rightLevel end
            if left[3] ~= right[3] then return left[3] < right[3] end
        end
        return a < b
    end)

    local milestones, visits, accepts, previousMap = {}, {}, {}, nil
    for i, position in ipairs(order) do
        local entry = index.milestones[position]
        local line = entry[1]
        milestones[i] = line
        if line:sub(1, 2) == "A|" then accepts[#accepts + 1] = i end
        local map = entry[4]
        if map and map ~= previousMap then
            visits[#visits + 1] = map .. ":"
            previousMap = map
        end
    end
    local firstTimed = index.visits[1]
    if firstTimed and previousMap and firstTimed:match("^(%d+):") == tostring(previousMap) then
        visits[#visits] = nil
    end
    if firstTimed then visits[#visits + 1] = concat(index.visits, ",") end
    return milestones, "R|" .. concat(visits, ","), accepts
end

local function build(record, level)
    local journal = record.journal
    local index, info = journal.summaryIndex, record.info or {}
    local metadata = C_AddOns and C_AddOns.GetAddOnMetadata or GetAddOnMetadata
    local version = ns.U.get(metadata, ADDON, "Version") or "1.6.0"
    if level then level = math.max(level, info.level or 0) end
    local start = { concat({ "H", 1, field(info.name), field(info.realm), field(info.race), field(info.class),
        field(info.faction), field(level or info.level), time(), field(version) }, "|") }
    for _, map in ipairs(sortedKeys(index.zones)) do
        local z = index.zones[map]
        start[#start + 1] = concat({ "Z", map, z.first or "", z.seconds, z.quests, z.kills,
            z.deaths, z.min or "", z.max or "" }, "|")
    end
    local milestones, route, accepts = buildMilestonesAndRoute(index, journal.backfill or {})
    start[#start + 1] = route
    local open = {}
    for _, quest in ipairs(record.quests or {}) do
        local id = quest.questID
        if type(id) == "number" and id > 0 and id % 1 == 0 then open[id] = true end
    end
    if next(open) then start[#start + 1] = "O|" .. concat(sortedKeys(open), ",") end

    local cellLines, labelLines, lowActivity = {}, {}, {}
    local bytes = #concat(start, "\n")
    for _, line in ipairs(milestones) do bytes = bytes + #line + 1 end
    for _, key in ipairs(sortedKeys(journal.cells)) do
        local cell = journal.cells[key]
        local line = concat({ "C", (key:gsub(":", "|")), cell.s, cell.kx, cell.k, cell.qx,
            cell.ox, index.firstSeen[key] or "" }, "|")
        cellLines[#cellLines + 1] = line
        bytes = bytes + #line + 1
        if cell.s < 30 and cell.kx == 0 and cell.qx == 0 and cell.ox == 0 then
            lowActivity[#lowActivity + 1] = #cellLines
        end
    end
    local labelBytes = 0
    for _, key in ipairs(sortedKeys(index.labels)) do
        local best, highest
        for name, count in pairs(index.labels[key]) do
            if not highest or count > highest or (count == highest and name < best) then
                best, highest = name, count
            end
        end
        local line = "S|" .. key:gsub(":", "|") .. "|" .. field(best)
        labelLines[#labelLines + 1] = line
        labelBytes = labelBytes + #line + 1
    end

    local function transportSize(textBytes)
        return #PREFIX + math.ceil(textBytes * 4 / 3)
    end
    local droppedLabels, droppedAccepts, droppedCells = 0, 0, 0
    if transportSize(bytes + labelBytes) > SIZE_LIMIT then
        droppedLabels = #labelLines
        labelLines = {}
        while droppedAccepts < #accepts and transportSize(bytes) > SIZE_LIMIT do
            droppedAccepts = droppedAccepts + 1
            local i = accepts[droppedAccepts]
            bytes = bytes - #milestones[i] - 1
            milestones[i] = false
        end
        while droppedCells < #lowActivity and transportSize(bytes) > SIZE_LIMIT do
            droppedCells = droppedCells + 1
            local i = lowActivity[droppedCells]
            bytes = bytes - #cellLines[i] - 1
            cellLines[i] = false
        end
    end
    for _, line in ipairs(cellLines) do
        if line then start[#start + 1] = line end
    end
    for _, line in ipairs(labelLines) do start[#start + 1] = line end
    for _, line in ipairs(milestones) do
        if line then start[#start + 1] = line end
    end
    local transport = base64url(concat(start, "\n"))
    local notice
    if droppedLabels + droppedAccepts + droppedCells > 0 then
        notice = ("Summary omitted %d subzone labels, %d quest accepts, and %d low-activity cells.")
            :format(droppedLabels, droppedAccepts, droppedCells)
    end
    if #transport > SIZE_LIMIT then
        notice = (notice and notice .. " " or "") .. "Summary still exceeds 120 KB."
    end
    return transport, notice
end

function ns.saveSummary(level)
    local record = ns.record
    if not record or not record.journal then return end
    local ok, transport, notice = pcall(build, record, level)
    if ok then
        record.summary, record.summaryNotice, record.errors.summary = transport, notice, nil
        return transport
    end
    record.errors.summary = ns.U.get(tostring, transport) or "Journey summary failed to build"
end
