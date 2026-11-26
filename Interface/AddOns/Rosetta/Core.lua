local ADDON, ns = ...

local DB_VERSION = 1
-- Bursty events (BAG_UPDATE_DELAYED, QUEST_LOG_UPDATE in combat) collapse into one rebuild per section.
local DEBOUNCE_SECONDS = 1.0

local frame = CreateFrame("Frame")
local eventSections = {}
local dirty = {}
local flushScheduled = false
local record, announcedLevel

local function runCollector(name)
    local c = ns.collectors[name]
    local start = debugprofilestop()
    local ok, result = pcall(c.collect, record[name])
    if ok then
        record.errors[name] = nil
        if result ~= nil then
            record[name] = result
            record.updated[name] = time()
        end
    else
        record.errors[name] = tostring(result)
    end
    record.costMs[name] = math.floor((debugprofilestop() - start) * 100 + 0.5) / 100
    if name == "completedQuests" then ns.scheduleQuestBackfill(record.completedQuests) end
end

local function flush()
    flushScheduled = false
    if not record then return end
    for name in pairs(dirty) do
        dirty[name] = nil
        runCollector(name)
    end
end

local function markDirty(name)
    dirty[name] = true
    if not flushScheduled then
        flushScheduled = true
        C_Timer.After(DEBOUNCE_SECONDS, flush)
    end
end

local function initRecord()
    RosettaDB = RosettaDB or {}
    local db = RosettaDB
    db.version = DB_VERSION
    db.characters = db.characters or {}
    local key = ns.U.characterKey(db)
    record = db.characters[key] or {}
    db.characters[key] = record
    record.updated = record.updated or {}
    record.errors = {}
    record.costMs = {}
    record.lastLogin = time()
    ns.record, ns.charKey = record, key
    -- Left behind by the RestedXP language bridge, removed in 1.2.0.
    db.rxpSync, db.rxpSyncError = nil, nil
end

frame:SetScript("OnEvent", function(_, event, arg1)
    if event == "PLAYER_LOGIN" then
        initRecord()
        ns.initJournal()
        -- Seed the header if the session ends before the regular collectors run.
        if not record.info then runCollector("info") end
        for name in pairs(ns.collectors) do markDirty(name) end
        return
    elseif event == "PLAYER_LOGOUT" then
        if not record then return end
        -- Pending rebuilds would read the torn-down state of a real logout; event-driven sections are at
        -- most DEBOUNCE_SECONDS old, so keep what they hold.
        wipe(dirty)
        for name, c in pairs(ns.collectors) do
            if c.onLogout then dirty[name] = true end
        end
        flush()
        -- ReloadUI also follows the logout save path.
        ns.saveSummary(announcedLevel)
        return
    elseif event == "ADDON_LOADED" then
        if record and _G.LibQuestieDB and arg1 == (_G.LibQuestieDB.addonName or "QuestieDB") then
            ns.scheduleQuestBackfill(record.completedQuests)
        end
        return
    elseif event == "BANKFRAME_OPENED" then
        ns.bankOpen = true
    elseif event == "BANKFRAME_CLOSED" then
        ns.bankOpen = false
        return
    end
    if event:sub(1, 5) == "UNIT_" and arg1 ~= "player" then return end
    if not record then return end
    if event == "PLAYER_LEVEL_UP" and type(arg1) == "number" and not (issecretvalue and issecretvalue(arg1))
        and arg1 > 0 and arg1 < math.huge then
        announcedLevel = arg1
    end
    for _, name in ipairs(eventSections[event] or {}) do markDirty(name) end
    if event == "BANKFRAME_OPENED" then
        -- Bank contents are readable only while the bank is open; read before the player can close it.
        dirty.bank = nil
        runCollector("bank")
    end
end)

for name, c in pairs(ns.collectors) do
    for _, event in ipairs(c.events) do
        if not eventSections[event] then
            -- Unknown event names raise errors on this client; skip events Forever does not have.
            if pcall(frame.RegisterEvent, frame, event) then eventSections[event] = {} end
        end
        if eventSections[event] then table.insert(eventSections[event], name) end
    end
end
frame:RegisterEvent("PLAYER_LOGIN")
frame:RegisterEvent("PLAYER_LOGOUT")
frame:RegisterEvent("ADDON_LOADED")
pcall(frame.RegisterEvent, frame, "BANKFRAME_CLOSED")
if not eventSections.BANKFRAME_OPENED then pcall(frame.RegisterEvent, frame, "BANKFRAME_OPENED") end

local function snapshot()
    if not record then return end
    for name in pairs(ns.collectors) do dirty[name] = true end
    flush()
    local names, errors = {}, {}
    for name in pairs(ns.collectors) do
        names[#names + 1] = string.format("%s %.1fms", name, record.costMs[name] or 0)
        if record.errors[name] then errors[#errors + 1] = name .. ": " .. record.errors[name] end
    end
    table.sort(names)
    print("|cff33ff99Rosetta|r updated: " .. table.concat(names, ", "))
    for _, e in ipairs(errors) do print("|cffff5555Rosetta error|r " .. e) end
    print("|cff33ff99Rosetta|r /reload or log out to write the data to disk.")
end

local function export()
    if not record then
        print("|cff33ff99Rosetta|r Character data is still loading.")
        return
    end
    runCollector("info")
    local transport = ns.saveSummary(announcedLevel)
    if transport then
        ns.showSummaryExport(transport)
        if record.summaryNotice then print("|cff33ff99Rosetta|r " .. record.summaryNotice) end
    else
        print("|cffff5555Rosetta error|r Journey summary failed to build.")
    end
end

SLASH_ROSETTA1 = "/rosetta"
SlashCmdList.ROSETTA = function(msg)
    if issecretvalue and issecretvalue(msg) then return end
    local command, args = (msg or ""):match("^%s*(%S+)%s?(.*)$")
    if command and command:lower() == "note" and ns.noteCommand then return ns.noteCommand(args) end
    msg = strtrim(msg or ""):lower()
    if msg == "snap" then return snapshot() end
    if msg == "export" then return export() end
    local journalCommand = msg:match("^journal%s+(.+)$")
    if (msg == "journal" or journalCommand) and ns.journalCommand then return ns.journalCommand(journalCommand or "status") end
    if ns.openSettings then ns.openSettings() end
end
SLASH_ROSETTASNAP1 = "/csnap"
SlashCmdList.ROSETTASNAP = snapshot

SLASH_ROSETTAEXPORT1 = "/rx"
SlashCmdList.ROSETTAEXPORT = export

-- Bindings.xml calls this global; the key is unbound until the player sets one.
BINDING_HEADER_ROSETTA = "Rosetta"
BINDING_NAME_ROSETTA_EXPORT = "Export journey summary"
function RosettaExport() export() end
