local _, ns = ...

local BATCH_SIZE, BATCH_MS = 25, 2
local pending, cursor, scheduled
local mappedLibrary, areaMaps

local function readAreaMaps(target, data)
    if type(data) == "table" then
        for area, map in pairs(data) do target[area] = map end
    elseif type(data) == "string" then
        -- The runtime support API can return deferred Lua tables. Read numeric pairs as data.
        for line in data:gmatch("[^\r\n]+") do
            local area, map = line:match("^%s*%[(%d+)%]%s*=%s*(%d+),")
            if area then target[tonumber(area)] = tonumber(map) end
        end
    end
end

local function mapsFor(library)
    if mappedLibrary == library then return areaMaps end
    local support = library.Support
    local zones = support and support.Get and support.Get("ZoneDB")
    if not (zones and zones.private) then return end
    local maps = {}
    readAreaMaps(maps, zones.private.areaIdToUiMapId)
    readAreaMaps(maps, zones.private.areaIdToUiMapIdOverride)
    if not next(maps) then return end
    mappedLibrary, areaMaps = library, maps
    return maps
end

local function percentage(value)
    return type(value) == "number" and value >= 0 and value <= 100
end

local function firstPoint(points, map, project)
    for _, point in ipairs(points) do
        local x, y = point[1], point[2]
        if percentage(x) and percentage(y) then
            if project then x, y = project(map, x, y) end
            if percentage(x) and percentage(y) then return { map, x / 100, y / 100 } end
        end
    end
end

local function findFinisher(library, maps, project, questID)
    local finishers = library.Quest.finishedBy(questID)
    if not finishers then return end
    local ownArea = ns.U.get(library.Quest.zoneOrSort, questID)
    if type(ownArea) ~= "number" or ownArea <= 0 then ownArea = nil end
    local ownMap = ownArea and maps[ownArea]
    local first, sameMap
    local entities = { library.Npc, library.Object }
    for kind = 1, 2 do
        local spawns = entities[kind] and entities[kind].spawns
        if spawns then
            for _, id in ipairs(finishers[kind] or {}) do
                local locations = spawns(id)
                if locations then
                    local areas = {}
                    for area in pairs(locations) do
                        if maps[area] and maps[area] > 0 then areas[#areas + 1] = area end
                    end
                    -- Spawn arrays are ordered, while AreaID keys have no database order.
                    table.sort(areas)
                    for _, area in ipairs(areas) do
                        local map = maps[area]
                        local point = firstPoint(locations[area], map, project)
                        if point then
                            if area == ownArea then return point end
                            if map == ownMap then sameMap = sameMap or point end
                            first = first or point
                        end
                    end
                end
            end
        end
    end
    return sameMap or first
end

local function backfillQuest(library, maps, project, journal, id)
    local point = findFinisher(library, maps, project, id)
    if not point then
        journal.backfill[id] = false
        return
    end
    local level = ns.U.get(library.Quest.questLevel, id)
    ns.addBackfilledQuest(id, point[1], point[2], point[3])
    journal.backfill[id] = type(level) == "number" and level > -math.huge and level < math.huge and level or true
end

local function runBatch()
    scheduled = false
    local record, library = ns.record, _G.LibQuestieDB
    local ok, maps = pcall(mapsFor, library)
    if not ok or not maps then return end
    -- The Forever provider projects its Era baseline when preparing the database.
    local forever = library.flavor and library.flavor.name == "Forever"
    local project = library.EraToForeverByUiMapId
    if forever then project = nil elseif not project then return end
    local journal = record.journal
    journal.backfill = journal.backfill or {}
    local start = debugprofilestop()
    for _ = 1, BATCH_SIZE do
        local id = pending[cursor]
        if id == nil then return end
        cursor = cursor + 1
        if not journal.summaryIndex.seenQuests[id] and journal.backfill[id] == nil then
            local success = pcall(backfillQuest, library, maps, project, journal, id)
            if not success then record.errors.backfill = "QuestieDB backfill failed for quest " .. id end
        end
        if debugprofilestop() - start >= BATCH_MS then break end
    end
    if pending[cursor] ~= nil then
        scheduled = true
        C_Timer.After(0, runBatch)
    end
end

function ns.scheduleQuestBackfill(ids)
    local library = _G.LibQuestieDB
    if not (ids and ids[1] and ns.record.journal and ns.record.journal.summaryIndex and library
        and library.Quest and library.Quest.finishedBy and C_Timer and C_Timer.After) then
        return
    end
    if pending ~= ids then pending, cursor = ids, 1 end
    if not scheduled and pending[cursor] ~= nil then
        scheduled = true
        C_Timer.After(0, runBatch)
    end
end
