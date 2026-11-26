local _, ns = ...

local MAX_EVENTS, TRIM_EVENTS = 200000, 1000
local SAMPLE_INTERVAL, HEARTBEAT_INTERVAL, MAX_SAMPLE_SECONDS = 30, 120, 150
-- The ticker runs more often than SAMPLE_INTERVAL: a ticker at exactly 30 s can land a hair early and
-- skip a whole interval.
local TICK_SECONDS = 5
-- A move at the threshold can round slightly below it in map coordinates.
local MOVE_DISTANCE_SQUARED = 0.005 ^ 2 - 1e-12
local issecretvalue = issecretvalue
local sessionClock = GetTime or time
local journal
local lastMap, lastSubzone, onTaxi, inInstance, instanceName, difficultyName
local lastSample, lastXP, lastXPMax, lastXPLevel, announcedLevel
local inCombat, combatEndedAt, questTurnedInAt

local function value(expected, v)
    if type(v) == expected and not (issecretvalue and issecretvalue(v)) then return v end
    return nil
end

local function checked(ok, ...)
    if ok then return ... end
    local errors = ns.record.errors
    if not errors.journal then errors.journal = value("string", ...) or "Journal handler failed" end
end

local function guard(fn, ...)
    if fn then return checked(pcall(fn, ...)) end
end

local function nonnegative(v)
    v = value("number", v)
    if v and v >= 0 and v < math.huge then return v end
    return nil
end

local function now()
    return nonnegative(guard(sessionClock))
end

local function bestMap()
    return nonnegative(guard(C_Map and C_Map.GetBestMapForUnit, "player"))
end

local function coordinates(map)
    if not map then return end
    local pos = value("table", guard(C_Map and C_Map.GetPlayerMapPosition, map, "player"))
    if not pos then return end
    local x, y = guard(pos.GetXY, pos)
    x, y = nonnegative(x), nonnegative(y)
    if x and y and x <= 1 and y <= 1 then return x, y end
end

local function location()
    local map = bestMap()
    return map, coordinates(map)
end

local function coordinate(v)
    return math.floor(v * 1000 + 0.5)
end

local function trimEvents(events, milestones)
    local count = #events
    if count <= MAX_EVENTS then return end
    local excess = count - MAX_EVENTS
    local target = math.max(TRIM_EVENTS, excess)
    local positions = 0
    for i = 1, count do
        if events[i]:sub(1, 2) == "P|" then
            positions = positions + 1
            if positions == target then break end
        end
    end
    -- Only make room with milestones when removing positions cannot bring us under the cap.
    local other = positions < excess and target - positions or 0
    local kept, removedMilestones = 0, 0
    for i = 1, count do
        local event = events[i]
        local kind = event:sub(1, 1)
        if kind == "P" and positions > 0 then
            positions = positions - 1
        elseif kind ~= "P" and other > 0 then
            other = other - 1
            if kind == "A" or kind == "Q" or kind == "D" or kind == "L" then removedMilestones = removedMilestones + 1 end
        else
            kept = kept + 1
            events[kept] = event
        end
    end
    for i = kept + 1, count do events[i] = nil end
    if removedMilestones > 0 then
        local remaining = #milestones - removedMilestones
        for i = 1, remaining do milestones[i] = milestones[i + removedMilestones] end
        for i = remaining + 1, remaining + removedMilestones do milestones[i] = nil end
    end
end

local function playerLevel()
    local level = nonnegative(guard(UnitLevel, "player"))
    if announcedLevel and (not level or announcedLevel > level) then return announcedLevel end
    return level
end

local function saveEvent(fields, level, backfilled)
    local events, index = journal.events, journal.summaryIndex
    events[#events + 1] = table.concat(fields, "|")
    ns.indexJournalEvent(index, fields[1], tonumber(fields[2]), tonumber(fields[3]), tonumber(fields[4]),
        tonumber(fields[5]), fields[6] ~= "" and fields[6] or nil, level, backfilled)
    trimEvents(events, index.milestones)
end

local function appendAt(kind, map, x, y, ...)
    local fields = { kind, time(), map or "", x and coordinate(x) or "", y and coordinate(y) or "" }
    for i = 1, select("#", ...) do
        local extra = select(i, ...)
        local text = value("string", extra)
        fields[5 + i] = text and text:gsub("[|\r\n]", "") or nonnegative(extra) or ""
    end
    saveEvent(fields, playerLevel())
end

local function append(kind, ...)
    local map, x, y = location()
    appendAt(kind, map, x, y, ...)
end

local function cellAt(key)
    local cell = journal.cells[key]
    if not cell then
        cell = { s = 0, kx = 0, k = 0, qx = 0, ox = 0 }
        journal.cells[key] = cell
    end
    return cell
end

local function updateMap(map, x, y)
    if not map or map == lastMap then return end
    if lastMap then
        local info = value("table", guard(C_Map and C_Map.GetMapInfo, map))
        appendAt("Z", map, x, y, info and info.name)
    end
    lastMap = map
end

local function readInstance()
    local name, _, _, difficulty = guard(GetInstanceInfo)
    return value("string", name), value("string", difficulty)
end

local function updateInstance(map, x, y)
    local inside = value("boolean", guard(IsInInstance))
    if inside == nil or inside == inInstance then return end
    -- After leaving, GetInstanceInfo describes the destination.
    if inside then instanceName, difficultyName = readInstance() end
    appendAt("I", map, x, y, inside and "in" or "out", instanceName, difficultyName)
    inInstance = inside
    if not inside then instanceName, difficultyName = nil, nil end
end

local function zoneChanged(event)
    local map, x, y = location()
    updateMap(map, x, y)
    if event ~= "PLAYER_ENTERING_WORLD" then
        local subzone = value("string", guard(GetSubZoneText))
        if subzone and subzone ~= lastSubzone then
            if lastSubzone then appendAt("S", map, x, y, subzone) end
            lastSubzone = subzone
        end
    end
    if event == "PLAYER_ENTERING_WORLD" or event == "ZONE_CHANGED_NEW_AREA" then
        updateInstance(map, x, y)
    end
end

local function updateTaxi(map, x, y)
    local taxi = value("boolean", guard(UnitOnTaxi, "player"))
    if taxi ~= nil and taxi ~= onTaxi then
        appendAt("T", map, x, y, taxi and "start" or "end")
        onTaxi = taxi
    end
end

local function sample()
    local map, x, y = location()
    updateTaxi(map, x, y)
    updateMap(map, x, y)
    if onTaxi or not x then return end
    local sampledAt = now()
    if not sampledAt then return end
    local elapsed = lastSample and sampledAt - lastSample.at or 0
    if lastSample then
        if elapsed < SAMPLE_INTERVAL then return end
        if map == lastSample.map and elapsed < HEARTBEAT_INTERVAL then
            local dx, dy = x - lastSample.x, y - lastSample.y
            if dx * dx + dy * dy < MOVE_DISTANCE_SQUARED then return end
        end
    end
    local flags = (value("boolean", guard(UnitAffectingCombat, "player")) and "c" or "")
        .. (value("boolean", guard(IsMounted)) and "m" or "")
        .. (value("boolean", guard(IsResting)) and "r" or "")
        .. (value("boolean", guard(UnitIsDeadOrGhost, "player")) and "d" or "")
        .. (value("boolean", guard(UnitIsAFK, "player")) and "a" or "")
    appendAt("P", map, x, y, flags)
    local cell = cellAt(ns.journalCellKey(map, coordinate(x), coordinate(y)))
    local seconds = math.min(elapsed, MAX_SAMPLE_SECONDS)
    cell.s = cell.s + seconds
    local zone = journal.summaryIndex.zones[map]
    zone.seconds = zone.seconds + seconds
    lastSample = { at = sampledAt, map = map, x = x, y = y }
end

local function readXP()
    local xp = nonnegative(guard(UnitXP, "player"))
    local maxXP = nonnegative(guard(UnitXPMax, "player"))
    if xp and maxXP and xp > maxXP then xp = nil end
    return xp, maxXP, playerLevel()
end

local function xpChanged(unit)
    if value("string", unit) and unit ~= "player" then return end
    local xp, maxXP, level = readXP()
    local previousXP, previousMax, previousLevel = lastXP, lastXPMax, lastXPLevel
    if previousLevel and (not level or level < previousLevel) then level = previousLevel end
    local leveled = previousLevel and level > previousLevel
    -- PLAYER_LEVEL_UP can announce the level before the XP APIs expose the new bar.
    if leveled and xp == previousXP and maxXP == previousMax then return end
    lastXP, lastXPMax, lastXPLevel = xp, maxXP, level
    if not (xp and previousXP) then return end
    local delta = xp - previousXP
    if leveled then
        if level ~= previousLevel + 1 or not previousMax then return end
        delta = delta + previousMax
    elseif delta < 0 and previousMax and maxXP and maxXP > previousMax then
        -- The new bar can arrive before either level signal, so treat later signals as confirmation.
        lastXPLevel = previousLevel and previousLevel + 1 or level
        delta = delta + previousMax
    end
    local xpLimit = previousMax or maxXP
    if delta <= 0 or not xpLimit or delta > xpLimit then return end
    local map, x, y = location()
    if not x then return end
    local zone, key = ns.observeJournal(journal.summaryIndex, time(), map, coordinate(x), coordinate(y), lastXPLevel)
    local cell = cellAt(key)
    local at = now()
    if at and questTurnedInAt and at - questTurnedInAt <= 2 then
        cell.qx = cell.qx + delta
    elseif inCombat or value("boolean", guard(UnitAffectingCombat, "player"))
        or (at and combatEndedAt and at - combatEndedAt <= 5) then
        cell.kx = cell.kx + delta
        cell.k = cell.k + 1
        zone.kills = zone.kills + 1
    else
        cell.ox = cell.ox + delta
    end
end

local handlers = {
    QUEST_ACCEPTED = function(questID, legacyQuestID) append("A", nonnegative(legacyQuestID) or nonnegative(questID)) end,
    QUEST_TURNED_IN = function(questID, xpReward)
        questTurnedInAt = now()
        append("Q", nonnegative(questID), nonnegative(xpReward))
    end,
    PLAYER_LEVEL_UP = function(level)
        announcedLevel = nonnegative(level)
        append("L", announcedLevel)
    end,
    PLAYER_DEAD = function() append("D", playerLevel()) end,
    PLAYER_PVP_KILLS_CHANGED = function() append("V", nonnegative(guard(GetPVPLifetimeStats))) end,
    PLAYER_CONTROL_LOST = function() updateTaxi(location()) end,
    PLAYER_CONTROL_GAINED = function() updateTaxi(location()) end,
    PLAYER_XP_UPDATE = xpChanged,
    PLAYER_REGEN_DISABLED = function() inCombat = true end,
    PLAYER_REGEN_ENABLED = function() inCombat, combatEndedAt = false, now() end,
}

local function runEvent(event, ...)
    if event == "PLAYER_ENTERING_WORLD" and lastXP == nil then lastXP, lastXPMax, lastXPLevel = readXP() end
    if handlers[event] then
        handlers[event](...)
    else
        zoneChanged(event)
    end
end

local function resetTracking()
    lastSample, questTurnedInAt, combatEndedAt, announcedLevel = nil, nil, nil, nil
    lastXP, lastXPMax, lastXPLevel = readXP()
    lastMap = bestMap()
    lastSubzone = value("string", guard(GetSubZoneText))
    inCombat = value("boolean", guard(UnitAffectingCombat, "player"))
end

local function init()
    local record = ns.record
    record.journal = record.journal or { v = 1, enabled = true, events = {}, cells = {} }
    journal = record.journal
    ns.initSummaryIndex(journal)
    trimEvents(journal.events, journal.summaryIndex.milestones)
    onTaxi, inInstance = false, false
    if journal.enabled then
        resetTracking()
        -- Name the place the character logs in at, which no subzone change would otherwise record.
        if lastSubzone and lastSubzone ~= "" then append("S", lastSubzone) end
    end
    guard(C_Timer and C_Timer.NewTicker, TICK_SECONDS, function()
        if journal.enabled then guard(sample) end
    end)
end

function ns.initJournal()
    guard(init)
end

function ns.addBackfilledQuest(questID, map, x, y)
    saveEvent({ "Q", "", map, coordinate(x), coordinate(y), questID, "b" }, nil, true)
end

local frame = CreateFrame("Frame")
frame:SetScript("OnEvent", function(_, event, ...)
    if journal and journal.enabled then guard(runEvent, event, ...) end
end)
for event in pairs(handlers) do pcall(frame.RegisterEvent, frame, event) end
for _, event in ipairs({ "PLAYER_ENTERING_WORLD", "ZONE_CHANGED", "ZONE_CHANGED_INDOORS", "ZONE_CHANGED_NEW_AREA" }) do
    pcall(frame.RegisterEvent, frame, event)
end

local function estimatedBytes(data)
    local bytes = 0
    for key, value in pairs(data) do
        -- Allow 16 bytes per entry for indentation, delimiters, and a typical numeric key or scalar.
        bytes = bytes + 16
        if type(key) == "string" then bytes = bytes + #key end
        if type(value) == "string" then
            bytes = bytes + #value
        elseif type(value) == "table" then
            bytes = bytes + estimatedBytes(value)
        end
    end
    return bytes
end

function ns.journalStatus()
    if not journal then return "Character data is still loading." end
    local cells, skipped = 0, 0
    for _ in pairs(journal.cells) do cells = cells + 1 end
    for _, result in pairs(journal.backfill or {}) do
        if result == false then skipped = skipped + 1 end
    end
    local kb = estimatedBytes(journal) / 1024
    local size = kb >= 1024 and ("%.2f MB"):format(kb / 1024) or ("%.1f KB"):format(kb)
    local status = ("%d events, %d cells, recording %s, estimated SavedVariables %s, backfill skipped %d")
        :format(#journal.events, cells, journal.enabled and "enabled" or "disabled", size, skipped)
    return ns.record.summaryNotice and status .. ". " .. ns.record.summaryNotice or status
end

local function command(action)
    if action == "off" then
        if journal then journal.enabled = false end
    elseif action == "on" then
        if journal and not journal.enabled then
            -- Resume from current state so XP and time while disabled are excluded.
            resetTracking()
            onTaxi = value("boolean", guard(UnitOnTaxi, "player")) or false
            inInstance = value("boolean", guard(IsInInstance)) or false
            instanceName, difficultyName = nil, nil
            if inInstance then instanceName, difficultyName = readInstance() end
            journal.enabled = true
        end
    elseif action ~= "status" then
        print("|cff33ff99Rosetta|r Use /rosetta journal off, on, or status.")
        return
    end
    print("|cff33ff99Rosetta|r Journal " .. ns.journalStatus())
end

function ns.journalCommand(action)
    if ns.record then
        guard(command, action)
    else
        print("|cff33ff99Rosetta|r " .. ns.journalStatus())
    end
end
