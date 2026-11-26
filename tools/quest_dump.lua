-- Run from the extracted QuestieDB folder with its v1.1.6 emulator files installed.
local persona = arg[1] or "Alliance"
assert(persona == "Alliance" or persona == "Horde", "Expected Alliance or Horde")
local emulator = dofile("emulator/metadata.lua")
local client = dofile("emulator/client.lua")
local toc = "QuestieDB_Forever.toc"
local _, header = emulator.load(toc)
assert(header.Version == "1.1.6" and header["X-Flavor"] == "Forever", "Expected QuestieDB 1.1.6 Forever")
client.install({expansion = "Forever", faction = persona,
    raceName = persona == "Horde" and "Orc" or "Human",
    raceFile = persona == "Horde" and "Orc" or "Human",
    raceId = persona == "Horde" and 2 or 1})
local db = emulator.loadAddon(toc)

local function keys(row)
    local out = {}
    for key in pairs(row) do out[#out + 1] = key end
    table.sort(out)
    return out
end

local function quote(value)
    return '"' .. value:gsub('[%z\1-\31\\"]', function(ch)
        if ch == '"' or ch == '\\' then return '\\' .. ch end
        return ("\\u%04x"):format(ch:byte())
    end) .. '"'
end

local function json(value)
    local kind = type(value)
    if kind == "string" then return quote(value) end
    if kind == "number" then
        if value ~= value or math.abs(value) == math.huge then return "null" end
        return tostring(value)
    end
    if kind == "boolean" then return tostring(value) end
    local parts, sorted = {}, keys(value)
    local array = type(sorted[1]) == "number" and sorted[1] == 1 and sorted[#sorted] == #sorted
    for _, key in ipairs(sorted) do
        parts[#parts + 1] = (array and "" or quote(tostring(key)) .. ":") .. json(value[key])
    end
    if array then return "[" .. table.concat(parts, ",") .. "]" end
    return "{" .. table.concat(parts, ",") .. "}"
end

local function mergedMap(base, override)
    local map = {}
    for _, source in ipairs({base, override or {}}) do
        if type(source) == "string" then source = assert(loadstring(source))() end
        for key, value in pairs(source) do map[key] = value end
    end
    return map
end

local zones = assert(db.Support.Get("ZoneDB")).private
local areaToMap = mergedMap(zones.areaIdToUiMapId, zones.areaIdToUiMapIdOverride)
local parents = mergedMap(zones.subZoneToParentZone, zones.subZoneToParentZoneOverride)
local dungeonForArea, entrances = {}, {}
-- ZoneDB also uses the instance entrance mechanism for battlegrounds, transport and city portals.
local otherInstances = {[2257] = true, [2597] = true, [2917] = true, [2918] = true,
    [3277] = true, [3358] = true, [5733] = true, [5861] = true, [6298] = true, [6618] = true}
for _, area in ipairs(keys(zones.dungeons)) do
    local entry = zones.dungeons[area]
    entrances[area] = entry[4]
    if not otherInstances[area] then dungeonForArea[area] = entry[1] end
    for _, alias in ipairs(entry[2] or {}) do
        entrances[alias] = entrances[alias] or entry[4]
        if not otherInstances[area] then dungeonForArea[alias] = dungeonForArea[alias] or entry[1] end
    end
end

local function findArea(area, mapping)
    local seen = {}
    while area and not seen[area] do
        if mapping[area] ~= nil then return mapping[area] end
        seen[area], area = true, parents[area]
    end
end

local function mappedSpawns(spawns)
    local out = {}
    for _, area in ipairs(keys(spawns or {})) do
        local map = findArea(area, areaToMap)
        local points = spawns[area]
        local dungeon = findArea(area, dungeonForArea)
        local row = {area = area, uiMap = map, points = points, dungeon = dungeon, entrances = {}}
        local seenEntrance
        for _, point in ipairs(points) do
            if point[1] == -1 and point[2] == -1 then seenEntrance = true end
        end
        if seenEntrance then
            for _, entry in ipairs(findArea(area, entrances) or {}) do
                local entranceMap = findArea(entry[1], areaToMap)
                if entranceMap and entranceMap > 0 then
                    row.entrances[#row.entrances + 1] = {entranceMap, entry[2], entry[3]}
                end
            end
        end
        out[#out + 1] = row
    end
    return out
end

local function intersection(left, right)
    while left > 0 and right > 0 do
        if left % 2 == 1 and right % 2 == 1 then return true end
        left, right = math.floor(left / 2), math.floor(right / 2)
    end
    return false
end

local function factionFor(mask)
    local masks = db.Enum.factionRaceMasks
    local alliance, horde = intersection(mask, masks.Alliance), intersection(mask, masks.Horde)
    if alliance and not horde then return "Alliance" end
    if horde and not alliance then return "Horde" end
    return "Both"
end

local questFields = {"name", "questLevel", "requiredLevel", "requiredRaces", "requiredClasses",
    "zoneOrSort", "preQuestSingle", "preQuestGroup", "nextQuestInChain", "exclusiveTo",
    "breadcrumbForQuestId", "breadcrumbs", "parentQuest", "childQuests", "questFlags", "startedBy",
    "finishedBy", "objectives", "requiredSourceItems", "triggerEnd", "extraObjectives", "reputationReward"}

local function readFields(entity, id, fields)
    local values = entity.GetAll(id, fields)
    if not values then return end
    local row = {id = id}
    for index, field in ipairs(fields) do row[field] = values[index] end
    row.name = row.name and {enUS = row.name} or {}
    return row
end

local quests, npcs, objects, items = {}, {}, {}, {}
local npcIds, objectIds, itemIds = {}, {}, {}
local function addIds(ids, values)
    for _, id in ipairs(values or {}) do if id > 0 then ids[id] = true end end
end

local function giverIds(givers)
    givers = givers or {}
    addIds(npcIds, givers[1])
    addIds(objectIds, givers[2])
    addIds(itemIds, givers[3])
end

for _, id in ipairs(db.Quest.GetAllIds()) do
    local row = readFields(db.Quest, id, questFields)
    row.faction = factionFor(row.requiredRaces)
    row.dungeon = findArea(row.zoneOrSort, dungeonForArea)
    quests[#quests + 1] = row
    giverIds(row.startedBy)
    giverIds(row.finishedBy)
    local objectives = row.objectives or {}
    for group, ids in ipairs({npcIds, objectIds, itemIds}) do
        for _, objective in ipairs(objectives[group] or {}) do addIds(ids, {objective[1]}) end
    end
    for _, credit in ipairs(objectives[5] or {}) do
        addIds(npcIds, credit[1])
        addIds(npcIds, {credit[2]})
    end
    for _, spell in ipairs(objectives[6] or {}) do addIds(itemIds, {spell[3]}) end
    addIds(itemIds, row.requiredSourceItems)
    if row.triggerEnd then row.triggerEnd[2] = mappedSpawns(row.triggerEnd[2]) end
    for _, objective in ipairs(row.extraObjectives or {}) do
        if objective[1] then objective[1] = mappedSpawns(objective[1]) end
        local idsByType = {monster = npcIds, npc = npcIds, object = objectIds, item = itemIds}
        for _, ref in ipairs(objective[5] or {}) do
            if idsByType[ref[1]] then addIds(idsByType[ref[1]], {ref[2]}) end
        end
    end
end

-- In v1.1.6, only next-quest pointers depend on class. The pinned registry's
-- provenance identifies changed rows without re-decoding every quest for each class.
local nextQuestKey = db.Meta.Quest.keys.nextQuestInChain
local function correctedNextQuests()
    local corrected = {}
    for id, fields in pairs(db.Corrections.provenance.Quest or {}) do
        if fields[nextQuestKey] then corrected[id] = true end
    end
    return corrected
end

local classLinks, originalClass = {}, UnitClassBase
local warriorLinks = correctedNextQuests()
for _, class in ipairs({"DRUID", "HUNTER", "MAGE", "PALADIN", "PRIEST", "ROGUE", "SHAMAN", "WARLOCK"}) do
    UnitClassBase = function() return class end
    db.ApplyRegisteredCorrections(db.Corrections.OWNER)
    local corrected = correctedNextQuests()
    for _, quest in ipairs(quests) do
        if warriorLinks[quest.id] or corrected[quest.id] then
            local nextQuest = db.Quest.nextQuestInChain(quest.id)
            if nextQuest ~= quest.nextQuestInChain then
                local links = classLinks[quest.id] or {}
                classLinks[quest.id] = links
                links[class] = nextQuest
            end
        end
    end
end
UnitClassBase = originalClass
db.ApplyRegisteredCorrections(db.Corrections.OWNER)
for _, quest in ipairs(quests) do quest.nextQuestInChainByClass = classLinks[quest.id] end

local function readItem(id)
    local row = readFields(db.Item, id, {"name", "npcDrops", "objectDrops", "itemDrops"})
    if row then
        items[tostring(id)] = row
        addIds(npcIds, row.npcDrops)
        addIds(objectIds, row.objectDrops)
        for _, container in ipairs(row.itemDrops or {}) do
            if not itemIds[container] then
                itemIds[container] = true
                readItem(container)
            end
        end
    end
end
for _, id in ipairs(keys(itemIds)) do readItem(id) end

local function readSpawns(entity, ids, fields, out)
    for _, id in ipairs(keys(ids)) do
        local row = readFields(entity, id, fields)
        if row then
            row.spawns = mappedSpawns(row.spawns)
            row.dungeon = findArea(row.zoneID, dungeonForArea)
            out[tostring(id)] = row
        end
    end
end
readSpawns(db.Npc, npcIds, {"name", "rank", "minLevel", "maxLevel", "zoneID", "spawns"}, npcs)
readSpawns(db.Object, objectIds, {"name", "zoneID", "spawns"}, objects)

local function addChinese(datatype, rows)
    for _, row in pairs(rows) do
        if db.l10n.GetProvenance(datatype, row.id, "name") then
            row.name.zhCN = db[datatype].name(row.id)
        end
    end
end
db.l10n.SetLocale("zhCN")
addChinese("Quest", quests)
addChinese("Npc", npcs)
addChinese("Object", objects)
addChinese("Item", items)

local rewards = {}
for _, id in ipairs(db.Item.GetAllIds()) do
    for _, quest in ipairs(db.Item.questRewards(id) or {}) do
        local key = tostring(quest)
        rewards[key] = rewards[key] or {}
        rewards[key][#rewards[key] + 1] = id
    end
end

io.write(json({version = header.Version, profile = persona, quests = quests, npcs = npcs,
    objects = objects, items = items, rewardItemIds = rewards, npcRanks = db.Enum.npcRanks,
    partyAcceptFlag = db.Enum.questFlags.PARTY_ACCEPT, raidFlag = db.Enum.questFlags.RAID}), "\n")
