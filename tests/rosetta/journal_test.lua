local ADDON_PATH = "Interface/AddOns/Rosetta/"
local EPOCH = 1700000000
local elapsed = 0
local frames, timers, afters, messages
local report = print
local secret = "secret text"
local state = {
    map = 101, x = 0.493, y = 0.25, subzone = "Road", taxi = false,
    inside = false, xp = 100, xpMax = 1000, level = 10, hk = 7,
}

local function eq(actual, expected, label)
    if actual ~= expected then
        error(("%s: expected %s, got %s"):format(label, tostring(expected), tostring(actual)), 2)
    end
end

function CreateFrame(kind, name, parent)
    local frame = { kind = kind, name = name, parent = parent, events = {}, scripts = {}, shown = true }
    function frame:RegisterEvent(event)
        if event == "PLAYER_PVP_KILLS_CHANGED" and state.noHKEvent then error("unknown event") end
        assert(event ~= "COMBAT_LOG_EVENT_UNFILTERED", "journal must not use combat log events")
        self.events[event] = true
    end
    function frame:SetScript(script, callback)
        self.scripts[script] = callback
    end
    function frame:CreateFontString()
        local label = {}
        function label:SetPoint() end
        function label:SetJustifyH() end
        function label:SetJustifyV() end
        function label:SetSpacing() end
        function label:SetText(text)
            self.text = text
            state.settingsText = text
        end
        self.label = label
        return label
    end
    for _, method in ipairs({ "SetSize", "SetPoint", "SetFrameStrata", "SetBackdrop", "SetBackdropColor",
        "SetClampedToScreen", "EnableMouse", "RegisterForDrag", "SetAutoFocus", "SetFontObject",
        "SetScrollChild", "StartMoving", "StopMovingOrSizing", "SetCursorPosition", "SetVerticalScroll" }) do
        frame[method] = function() end
    end
    function frame:SetMovable(movable) self.movable = movable end
    function frame:GetName() return self.name end
    function frame:GetParent() return self.parent end
    function frame:Show() self.shown = true end
    function frame:Hide()
        self.shown = false
        if self.scripts.OnHide then self.scripts.OnHide(self) end
    end
    function frame:SetMultiLine(multiline) self.multiline = multiline end
    function frame:SetText(text) self.text = text end
    function frame:SetFocus() self.focus = true end
    function frame:ClearFocus() self.focus = false end
    function frame:HighlightText() self.highlighted = self.text end
    frames[#frames + 1] = frame
    return frame
end

local function fire(event, ...)
    for _, frame in ipairs(frames) do
        if frame.events[event] then frame.scripts.OnEvent(frame, event, ...) end
    end
end

C_Timer = {
    After = function(delay, callback)
        afters[#afters + 1] = { due = elapsed + delay, callback = callback }
    end,
    NewTicker = function(delay, callback)
        eq(delay, 5, "ticker interval")
        timers[#timers + 1] = callback
    end,
}

local function advance(seconds)
    elapsed = elapsed + seconds
    local pending = afters
    afters = {}
    for _, timer in ipairs(pending) do
        if timer.due <= elapsed then
            timer.callback()
        else
            afters[#afters + 1] = timer
        end
    end
end

local function tick(seconds)
    advance(seconds or 30)
    for _, callback in ipairs(timers) do callback() end
end

C_Map = {
    GetBestMapForUnit = function(unit)
        eq(unit, "player", "map unit")
        return state.map
    end,
    GetPlayerMapPosition = function(map, unit)
        eq(map, state.map, "position map")
        eq(unit, "player", "position unit")
        if state.x == nil then return nil end
        return { GetXY = function() return state.x, state.y end }
    end,
    GetMapInfo = function(map) return { name = "Map|" .. map } end,
}
C_QuestLog = {
    GetNumQuestLogEntries = function() return 0 end,
    GetInfo = function() error("no quest log rows") end,
    GetAllCompletedQuestIDs = function() return {} end,
}
local mapAPI = C_Map
local newTicker = C_Timer.NewTicker

function time() return EPOCH + math.floor(elapsed) end
function GetTime() return elapsed end
date = os.date
function issecretvalue(v) return v == secret end
function debugprofilestop() return 0 end
function UnitName() return "Tester" end
function GetRealmName() return state.realm end
function GetNormalizedRealmName() return "TestRealm" end
function UnitRace() return "Dwarf", "Dwarf" end
function UnitClass() return "Hunter", "HUNTER", 3 end
function UnitFactionGroup() return "Alliance" end
function UnitLevel() return state.level end
function UnitXP() return state.xp end
function UnitXPMax() return state.xpMax end
function UnitAffectingCombat() return state.combat or false end
function IsMounted() return state.flags or false end
function IsResting() return state.flags or false end
function UnitIsDeadOrGhost() return state.flags or false end
function UnitIsAFK() return state.flags or false end
function UnitOnTaxi() return state.taxi end
function GetSubZoneText() return state.subzone end
function IsInInstance() return state.inside end
function GetInstanceInfo() return "Test|Instance", "party", 1, "Normal" end
function GetPVPLifetimeStats() return state.hk, 0 end
function strtrim(s) return s:match("^%s*(.-)%s*$") end
function wipe(t) for k in pairs(t) do t[k] = nil end end
function print(msg) messages[#messages + 1] = msg end

local function loadAddon()
    frames, timers, afters, messages, SlashCmdList = {}, {}, {}, {}, {}
    UISpecialFrames = {}
    local ns = {}
    for line in io.lines(ADDON_PATH .. "Rosetta.toc") do
        local file = line:match("^(%S+%.lua)%s*$")
        if file then assert(loadfile(ADDON_PATH .. file))("Rosetta", ns) end
    end
    return ns
end

local ns = loadAddon()
fire("QUEST_ACCEPTED", 1)
eq(ns.record, nil, "record before login")
fire("PLAYER_LOGIN")
fire("PLAYER_ENTERING_WORLD")
local journal = ns.record.journal
local events, cells = journal.events, journal.cells
eq(RosettaDB.characters["Tester-TestRealm"].journal, journal, "saved character journal")
eq(journal.v, 1, "journal version")
eq(journal.enabled, true, "enabled by default")
eq(#events, 1, "only the login subzone before play")
eq(events[1]:sub(1, 2), "S|", "login subzone event")
-- Later counts are per scenario; set the login event aside.
table.remove(events, 1)
eq(#timers, 1, "ticker count")

local function lastEvent(kind, fields)
    eq(events[#events], kind .. "|" .. time() .. "|" .. fields, kind .. " event")
end

state.flags, state.combat = true, true
tick()
lastEvent("P", "101|493|250|cmrda")
eq(cells["101:9:5"].s, 0, "first sample elapsed")
state.flags, state.combat = false, false
state.x = 0.497
tick()
eq(#events, 1, "movement below threshold")
state.x = 0.498
tick()
lastEvent("P", "101|498|250|")
eq(cells["101:9:5"].s, 60, "elapsed between samples")
for _ = 1, 3 do tick() end
eq(#events, 2, "still below heartbeat")
tick()
lastEvent("P", "101|498|250|")
eq(cells["101:9:5"].s, 180, "heartbeat elapsed")
report("PASS position sampling, flags, heartbeat and cell time")

state.subzone = "North|Road"
fire("ZONE_CHANGED_INDOORS")
lastEvent("S", "101|498|250|NorthRoad")
fire("ZONE_CHANGED")
eq(#events, 4, "no duplicate subzone")
state.map = 102
fire("ZONE_CHANGED_NEW_AREA")
lastEvent("Z", "102|498|250|Map102")
tick()
lastEvent("P", "102|498|250|")
eq(cells["102:9:5"].s, 30, "first sample on new map")
state.taxi = true
fire("PLAYER_CONTROL_LOST")
lastEvent("T", "102|498|250|start")
state.x = 0.6
tick(180)
eq(#events, 7, "no taxi position sample")
state.taxi = false
fire("PLAYER_CONTROL_GAINED")
lastEvent("T", "102|600|250|end")
tick()
lastEvent("P", "102|600|250|")
local cell = cells["102:12:5"]
eq(cell.s, 150, "elapsed capped after taxi")
state.taxi = true
tick()
lastEvent("T", "102|600|250|start")
state.taxi = false
tick()
lastEvent("T", "102|600|250|end")
state.map, state.x, state.inside = 103, nil, true
fire("PLAYER_ENTERING_WORLD")
lastEvent("I", "103|||in|TestInstance|Normal")
fire("ZONE_CHANGED_NEW_AREA")
eq(#events, 13, "no duplicate instance entry")
tick()
eq(#events, 13, "no position sample when coordinates are unavailable")
state.map, state.x, state.inside = 102, 0.6, false
fire("ZONE_CHANGED_NEW_AREA")
lastEvent("I", "102|600|250|out|TestInstance|Normal")
state.map = 104
tick()
eq(events[#events - 1], "Z|" .. time() .. "|104|600|250|Map104", "map change without a zone event")
state.map = 102
fire("ZONE_CHANGED")
report("PASS subzones, map transitions, taxis and instances")

local function xp(newXP, unit)
    state.xp = newXP
    fire("PLAYER_XP_UPDATE", unit)
end

fire("QUEST_ACCEPTED", 42)
lastEvent("A", "102|600|250|42")
fire("QUEST_ACCEPTED", 1, 43)
lastEvent("A", "102|600|250|43")
fire("PLAYER_REGEN_DISABLED")
fire("QUEST_TURNED_IN", 42, 150, 10000)
lastEvent("Q", "102|600|250|42|150")
advance(2)
xp(250, "player")
eq(cell.qx, 150, "quest XP takes precedence over combat")
advance(0.1)
xp(290)
eq(cell.kx, 40, "combat XP")
eq(cell.k, 1, "combat kill")
fire("PLAYER_REGEN_ENABLED")
advance(5)
xp(305)
eq(cell.kx, 55, "combat grace XP")
eq(cell.k, 2, "combat grace kill")
advance(0.1)
xp(330)
eq(cell.ox, 25, "XP outside combat")
xp(350, "pet")
eq(cell.ox, 25, "ignore non-player XP update")
xp(350, "player")
eq(cell.ox, 45, "non-player XP update does not reset baseline")
xp(950)
fire("PLAYER_LEVEL_UP", 11)
lastEvent("L", "102|600|250|11")
xp(950)
eq(cell.ox, 645, "early level signal with unchanged XP APIs")
state.xpMax, state.level = 1500, 11
xp(30)
eq(cell.ox, 725, "rollover uses previous level's XP max")
xp(1450)
state.xpMax = 2000
xp(20)
eq(cell.ox, 2215, "rollover when the new XP bar arrives first")
state.level = 12
fire("PLAYER_LEVEL_UP", 12)
xp(30)
eq(cell.ox, 2225, "level signal after rollover is not counted again")
xp(20)
eq(cell.ox, 2225, "ignore negative same-level XP change")
xp(50000)
eq(cell.ox, 2225, "ignore huge XP")
xp(40)
fire("PLAYER_DEAD")
lastEvent("D", "102|600|250|12")
fire("PLAYER_PVP_KILLS_CHANGED")
lastEvent("V", "102|600|250|7")
local zone = journal.summaryIndex.zones[102]
eq(zone.quests, 1, "live zone quests")
eq(zone.kills, 2, "live zone kills")
eq(zone.deaths, 1, "live zone deaths")
eq(zone.min, 10, "live zone minimum level")
eq(zone.max, 12, "live zone maximum level")
report("PASS quest, combat, other and level-up XP, death and honorable kills")

local function slash(command)
    local before = #messages
    SlashCmdList.ROSETTA("journal " .. command)
    eq(#messages, before + 1, "one chat line for " .. command)
    return messages[#messages]
end

local beforePause = #events
local beforeSeconds = cell.s
assert(slash("off"):find("recording disabled", 1, true))
eq(journal.enabled, false, "off flag")
tick(300)
xp(200)
fire("QUEST_ACCEPTED", 82)
fire("PLAYER_DEAD")
eq(#events, beforePause, "disabled events")
eq(cell.s, beforeSeconds, "disabled cell time")
eq(cell.ox, 2225, "disabled XP")
assert(slash("ON"):find("recording enabled", 1, true))
tick()
lastEvent("P", "102|600|250|")
eq(cell.s, beforeSeconds, "resume excludes disabled time")
xp(215)
eq(cell.ox, 2240, "resume excludes disabled XP")
local cellCount = 0
for _ in pairs(cells) do cellCount = cellCount + 1 end
local status = ("%d events, %d cells, recording enabled"):format(#events, cellCount)
assert(slash("status"):find(status, 1, true))
for _, frame in ipairs(frames) do
    if frame.name == "Rosetta" then frame.scripts.OnShow() end
end
assert(state.settingsText:find("journal: " .. status, 1, true))
report("PASS journal off, on, status and Settings")

local realTime = time
function time() error("first journal failure") end
local beforeFailure = #events
fire("PLAYER_DEAD")
eq(#events, beforeFailure, "failed event append")
local firstError = ns.record.errors.journal
assert(firstError and firstError:find("first journal failure", 1, true))
time = realTime
function GetSubZoneText() error("second journal failure") end
fire("ZONE_CHANGED")
eq(ns.record.errors.journal, firstError, "only first error is retained")
function GetSubZoneText() return state.subzone end
state.x = secret
fire("QUEST_ACCEPTED", secret)
lastEvent("A", "102|||")
state.x = 0.6
local readHK = GetPVPLifetimeStats
GetPVPLifetimeStats = nil
fire("PLAYER_PVP_KILLS_CHANGED")
lastEvent("V", "102|600|250|")
GetPVPLifetimeStats = readHK
report("PASS guarded handler failures, secret values and missing API")

local function protected(events)
    local keep = {}
    for _, event in ipairs(events) do
        if event:sub(1, 2) ~= "P|" then keep[#keep + 1] = event end
    end
    return table.concat(keep, "\n")
end

local oldProtected = protected(events)
local positions = 0
for _, event in ipairs(events) do
    if event:sub(1, 2) == "P|" then positions = positions + 1 end
end
for i = 1, 200000 - #events do
    events[#events + 1] = ("P|%d|102|600|250|"):format(EPOCH + i)
end
eq(#events, 200000, "full event cap")
fire("QUEST_ACCEPTED", 567)
eq(#events, 199001, "event cap trims by chunk")
lastEvent("A", "102|600|250|567")
eq(protected(events), oldProtected .. "\n" .. events[#events], "trimming keeps all milestones in order")
for _, event in ipairs(events) do
    if event:sub(1, 2) == "P|" then
        eq(event, ("P|%d|102|600|250|"):format(EPOCH + 1001 - positions), "oldest remaining position")
        break
    end
end
eq(journal.cells["102:12:5"], cell, "trimming retains cell totals")
state.map, state.x, state.xp = nil, nil, nil
fire("PLAYER_LOGOUT")
eq(ns.record.journal, journal, "logout preserves the journal table")
assert(ns.record.summary:match("^RSJ1%."), "logout makes a summary")
eq(#events, 199001, "logout preserves journal events")
eq(cell.ox, 2240, "logout preserves cell XP")
slash("off")
fire("PLAYER_LOGOUT")
state.map, state.x, state.xp = 102, 0.6, 215
state.noHKEvent = true
ns = loadAddon()
local savedIndex = journal.summaryIndex
fire("PLAYER_LOGIN")
eq(ns.record.journal, journal, "reload preserves journal")
eq(journal.summaryIndex, savedIndex, "reload reuses the summary index")
eq(journal.enabled, false, "reload preserves disabled state")
slash("on")
fire("PLAYER_PVP_KILLS_CHANGED")
eq(#events, 199001, "unsupported PvP event is skipped")
eq(ns.record.errors.journal, nil, "unsupported PvP event is silent")
report("PASS 200000-event cap, position-first trimming, logout persistence and unsupported PvP event")

C_Map, C_Timer.NewTicker, GetTime = nil, nil, nil
ns = loadAddon()
fire("PLAYER_LOGIN")
eq(#timers, 0, "missing position ticker")
fire("QUEST_TURNED_IN", 45, 0)
lastEvent("Q", "|||45|0")
eq(ns.record.errors.journal, nil, "missing APIs are silent")
report("PASS recording with no map API, ticker or monotonic clock")

local function decode(transport)
    eq(transport:sub(1, 5), "RSJ1.", "transport prefix")
    local alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
    local bytes, remaining, bits = {}, 0, 0
    for character in transport:sub(6):gmatch(".") do
        local value = assert(alphabet:find(character, 1, true), "invalid base64url character") - 1
        remaining = remaining * 64 + value
        bits = bits + 6
        if bits >= 8 then
            bits = bits - 8
            local scale = 2 ^ bits
            bytes[#bytes + 1] = string.char(math.floor(remaining / scale))
            remaining = remaining % scale
        end
    end
    eq(remaining, 0, "base64url tail")
    return table.concat(bytes)
end

local function cell(seconds, killXP, kills, questXP, otherXP)
    return { s = seconds, kx = killXP or 0, k = kills or 0, qx = questXP or 0, ox = otherXP or 0 }
end

local function loginWith(events, cells)
    local fixture = { v = 1, enabled = false, events = events, cells = cells, summaryIndex = { version = 1 } }
    RosettaDB = { characters = { ["Tester-TestRealm"] = { journal = fixture } } }
    ns = loadAddon()
    fire("PLAYER_LOGIN")
    return fixture
end

C_Map, C_Timer.NewTicker, GetTime = mapAPI, newTicker, function() return elapsed end
state.map, state.x, state.y, state.level, state.realm = 1426, 1, 0.05, 7, "Re|alm\r\n"
elapsed = 40
journal = loginWith({
    "S|1700000000|1426|1000|50|Nørth\r\n Road",
    "P|1700000001|1426|975|50|",
    "S|1700000002|1426|990|50|A Road",
    "S|1700000003|1426|990|50|Nørth Road",
    "Q|1700000010|1426|975|50|42|8",
    "L|1700000030|1426|975|50|7",
    "D|1700000020|1426|975|50|6",
    "A|1700000015|1426|975|50|44",
}, {
    ["1426:19:1"] = cell(25, 50, 2, 8, 1),
    ["1426:20:1"] = cell(5, 10, 1),
    ["1426:8:9"] = cell(3),
})

ns.record.quests = { { questID = 44 }, { questID = 43 }, { questID = 44 } }
fire("PLAYER_LOGOUT")
local transport = ns.record.summary
local decoded = table.concat({
    "H|1|Tester|Realm|Dwarf|Hunter|Alliance|7|1700000040|1.6.0",
    "Z|1426|1700000000|33|1|3|1|6|7",
    "R|1426:1700000000",
    "O|43,44",
    "C|1426|19|1|30|60|3|8|1|1700000000",
    "C|1426|8|9|3|0|0|0|0|",
    "S|1426|19|1|Nørth Road",
    "Q|1700000010|1426|975|50|42|",
    "A|1700000015|1426|975|50|44",
    "D|1700000020|1426|975|50|6",
    "L|1700000030|1426|975|50|7",
}, "\n")
eq(decode(transport), decoded, "decoded v1 fixture")
eq(journal.cells["1426:20:1"], nil, "legacy edge cell folded into square 19")
report("PASS v1 summary, UTF-8, field cleanup, migration, and ordering")
report("Fixture transport " .. transport)
report("Decoded fixture\n" .. decoded)

local log = { 44, 43 }
C_QuestLog.GetNumQuestLogEntries = function() return #log end
C_QuestLog.GetInfo = function(index) return { questID = log[index] } end
ns.record.quests = {}
ns.record.summary = nil
SlashCmdList.ROSETTA("export")
local exportFrame, edit, close
for _, frame in ipairs(frames) do
    if frame.name == "RosettaExportFrame" then exportFrame = frame end
    if frame.kind == "EditBox" then edit = frame end
    if frame.kind == "Button" then close = frame end
end
eq(ns.record.summary, transport, "export saves the summary")
assert(exportFrame.movable and exportFrame.shown and edit.multiline and edit.focus)
eq(UISpecialFrames[1], exportFrame.name, "frame closes with Escape when EditBox loses focus")
eq(exportFrame.label.text, "Ctrl+C copies and closes. Paste into the Azeroth Atlas.", "copy hint")
eq(edit.text, transport, "copy text")
eq(edit.highlighted, transport, "copy selection")
edit.scripts.OnEscapePressed(edit)
assert(not exportFrame.shown and not edit.focus)
SlashCmdList.ROSETTA("export")
eq(close.text, "Close", "close label")
close.scripts.OnClick(close)
assert(not exportFrame.shown)
SlashCmdList.ROSETTA("export")
edit.scripts.OnKeyDown(edit, "C")
advance(0)
assert(exportFrame.shown, "plain C does not close")
for _, modifier in ipairs({ "IsControlKeyDown", "IsMetaKeyDown" }) do
    SlashCmdList.ROSETTA("export")
    _G[modifier] = function() return true end
    edit.scripts.OnKeyDown(edit, "C")
    assert(exportFrame.shown, modifier .. ": copy happens before the frame closes")
    advance(0)
    assert(not exportFrame.shown, modifier .. ": copy closes the frame")
    _G[modifier] = nil
end
SlashCmdList.ROSETTAEXPORT("")
assert(exportFrame.shown, "/rx opens the export")
exportFrame:Hide()
eq(SLASH_ROSETTAEXPORT1, "/rx", "export shortcut")
RosettaExport()
assert(exportFrame.shown, "key binding opens the export")
exportFrame:Hide()
log = {}
SlashCmdList.ROSETTAEXPORT("")
assert(not decode(ns.record.summary):find("\nO|", 1, true), "empty log omitted even before collector debounce")
exportFrame:Hide()
report("PASS export saves, selects, and closes, including on copy; /rx and the key binding open it")

local labels = journal.summaryIndex.labels
local counts = labels["1426:19:1"]
labels["1426:19:1"] = { [string.rep("Long Label ", 10000)] = 1 }
local labelsOnly = ns.saveSummary()
assert(decode(labelsOnly):find("C|1426|8|9|3|0|0|0|0|", 1, true), "cold cells kept when dropping labels is enough")
assert(ns.record.summaryNotice:match("1 subzone labels, 0 quest accepts, and 0 low%-activity cells"), "label-only pruning reported")
labels["1426:19:1"] = counts

local completed = { 42, 18, 19, 20 }
for id = 100, 129 do completed[#completed + 1] = id end
C_QuestLog.GetAllCompletedQuestIDs = function() return { unpack(completed) } end
fire("QUEST_TURNED_IN", 42, 0)
advance(1)
eq(#journal.events, 8, "no backfill when QuestieDB is absent")

local lookedUp, projected = {}, 0
LibQuestieDB = {
    Quest = {
        finishedBy = function(id)
            lookedUp[id] = (lookedUp[id] or 0) + 1
            if id == 18 then return { { 1 }, { 1 } } end
            if id == 19 then return { { 2 } } end
            if id == 20 or id == 21 then return { [2] = { 1 } } end
            return { { 3 } }
        end,
        zoneOrSort = function(id) return id == 18 and 44 or -1 end,
        questLevel = function(id) return id == 19 and 12 or 5 end,
    },
    Npc = { spawns = function(id)
        if id == 1 then return { [1] = { { 21, 78 } } } end
        if id == 2 then return { [1] = { { 0, 100 } }, [44] = { { 34, 45 } } } end
        return { [44] = { { -1, -1 } }, [88] = { { 20, 20 } } }
    end },
    Object = { spawns = function() return { [44] = { { -1, -1 }, { 30, 45 }, { 90, 95 } } } end },
    Support = { Get = function(module)
        eq(module, "ZoneDB", "QuestieDB map module")
        return { private = {
            areaIdToUiMapId = "return {\n [1] = 1426, -- Dun Morogh\n [44] = 1433,\n [88] = 1429,\n}",
            areaIdToUiMapIdOverride = "error('deferred maps must stay data')\n [88] = 0, -- suppressed",
        } }
    end },
    EraToForeverByUiMapId = function(map, x, y)
        projected = projected + 1
        return map == 1433 and x - 5 or x, y
    end,
}
fire("ADDON_LOADED", "QuestieDB")
advance(0)
eq(lookedUp[42], nil, "already journaled quest skipped")
eq(lookedUp[129], nil, "backfill yields after a batch")
advance(0)
eq(lookedUp[129], 1, "backfill resumes on a later frame")
eq(journal.events[9], "Q||1433|250|450|18|b", "preferred object finisher and Era projection")
eq(journal.events[10], "Q||1426|0|1000|19|b", "fallback first spawn accepts map edges")
eq(journal.events[11], "Q||1433|250|450|20|b", "object finisher")
assert(ns.journalStatus():find("backfill skipped 30", 1, true))

local backfilled = decode(ns.saveSummary())
assert(backfilled:find("Z|1433||0|2|0|0||", 1, true), "unknown first visit for backfilled-only zone")
assert(backfilled:find("R|1433:,1426:1700000000", 1, true), "estimated visits precede the recorded route")
assert(backfilled:find(table.concat({
    "Q||1433|250|450|18|b",
    "Q||1433|250|450|20|b",
    "Q||1426|0|1000|19|b",
    "Q|1700000010|1426|975|50|42|",
    "A|1700000015|1426|975|50|44",
}, "\n"), 1, true), "backfilled quests sorted by quest level and ID")

local beforeProjection = projected
LibQuestieDB.flavor = { name = "Forever" }
completed[#completed + 1] = 21
ns = loadAddon()
fire("PLAYER_LOGIN")
advance(1)
advance(0)
advance(0)
eq(journal.events[12], "Q||1433|300|450|21|b", "native Forever coordinates stay in the supplied frame")
eq(projected, beforeProjection, "no second projection")
for id, count in pairs(lookedUp) do eq(count, 1, "cached lookup " .. id) end
eq(lookedUp[21], 1, "new completed quest backfilled")
report("PASS batched QuestieDB backfill, caching, ordering, and coordinate frames")

LibQuestieDB = nil
local cap = { "Q|1700000000|1426|975|50|42|8", "P|1700000000|1426|975|50|" }
for i = 3, 200000 do cap[i] = "A|1700000000|1426|975|50|12" end
journal = loginWith(cap, {})
slash("on")
fire("QUEST_ACCEPTED", 12)
eq(#cap, 200000, "one position is sufficient for the cap")
eq(cap[1]:sub(1, 2), "Q|", "oldest milestone kept while a position can be dropped")
fire("QUEST_ACCEPTED", 13)
eq(#cap, 199001, "milestone fallback creates room when the journal has no positions")
eq(cap[1]:sub(1, 2), "A|", "oldest milestone trimmed as last resort")
assert(not decode(ns.saveSummary()):find("\nQ|", 1, true), "evicted milestone omitted from summary")
report("PASS cap fallback trims the oldest milestones only after exhausting positions")

local longEvents, longCells = {}, {}
local zoneCount, samples = 20, 199200
for i = 1, samples do
    local map = 1411 + math.floor((i - 1) / 1000) % zoneCount
    local x, y = i % 20 * 50, i % 3 * 50
    longCells[("%d:%d:%d"):format(map, x / 50, y / 50)] = cell(170, 20, 1)
    longEvents[i] = ("P|%d|%d|%d|%d|"):format(EPOCH + i * 30, map, x, y)
end
for i = samples + 1, 200000 do
    longEvents[i] = ("Q|%d|1411|350|250|%d|100"):format(EPOCH + i * 30, i - samples)
end
state.level = 60
journal = loginWith(longEvents, longCells)
collectgarbage("collect")
local start = os.clock()
local longTransport = ns.saveSummary()
local ms = (os.clock() - start) * 1000
assert(longTransport and ms < 250, ("200,000-event build took %.1f ms"):format(ms))
report(("200,000-event build took %.2f ms, transport %.1f KB"):format(ms, #longTransport / 1024))
report(ns.journalStatus())

local accepts = {}
for id = 1, 5000 do accepts[id] = ("A|%d|1426|975|50|%d"):format(EPOCH + id, id) end
local acceptBudget = loginWith(accepts, { ["1426:8:9"] = cell(3) })
local acceptTransport = ns.saveSummary()
local acceptText = decode(acceptTransport)
assert(#acceptTransport <= 120 * 1024, "accepts can be pruned to fit")
assert(acceptText:find("C|1426|8|9|3|0|0|0|0|", 1, true), "cold cells kept when dropping accepts is enough")
assert(not acceptText:find("A|1700000001|", 1, true), "oldest accept dropped first")
assert(acceptText:find("A|1700005000|1426|975|50|5000", 1, true), "the newest accept survives")
assert(ns.record.summaryNotice:match("[1-9]%d* quest accepts, and 0 low%-activity cells"), "accept-only pruning reported")
assert(#acceptBudget.events == 5000, "pruning leaves the journal intact")

local coldCells = {}
for map = 1501, 1515 do
    for cx = 0, 19 do
        for cy = 0, 19 do
            coldCells[("%d:%d:%d"):format(map, cx, cy)] = cell(29)
        end
    end
end
coldCells["1426:0:0"] = cell(30)
coldCells["1426:0:1"] = cell(29, 0, 0, 1)
local budgetEvents = {
    "S|1700000000|1426|0|0|North Road",
    "Q|1700000001|1426|0|0|42|8",
    "A|1700000002|1426|0|0|44",
}
journal = loginWith(budgetEvents, coldCells)
-- Cell and zone lines together need more than 120 KB.
local budgetTransport = ns.saveSummary()
assert(#budgetTransport <= 120 * 1024, "transport under hard pruning threshold when possible")
local budgetText = decode(budgetTransport)
assert(not budgetText:find("\nS|", 1, true), "labels dropped before low-activity cells")
assert(not budgetText:find("\nA|", 1, true), "accepts dropped before low-activity cells")
assert(budgetText:find("C|1426|0|0|30|0|0|0|0|1700000000", 1, true), "30-second cell retained")
assert(budgetText:find("C|1426|0|1|29|0|0|1|0|", 1, true), "XP cell retained")
assert(budgetText:find("Q|1700000001|1426|0|0|42|", 1, true), "quest milestone retained")
assert(ns.record.summaryNotice:match("1 subzone labels, 1 quest accepts, and [1-9]%d* low%-activity cells"), "pruning reported")
for _, data in pairs(coldCells) do data.s = 30 end
assert(#ns.saveSummary() > 120 * 1024, "required data can exceed the pruning threshold")
assert(ns.record.summaryNotice:find("still exceeds 120 KB", 1, true))
report("PASS size budget drops labels, then accepts, then low-activity cells, and reports a remaining oversize export")
report("All Rosetta journal tests passed.")
