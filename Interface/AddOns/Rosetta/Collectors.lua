local _, ns = ...
local U = ns.U
local get, pack, copy = U.get, U.pack, U.copy

-- Each collector rebuilds one section of the character record.
-- `events` mark the section dirty; `collect(prev)` returns the new section, or nil to keep `prev`
-- when the data is unavailable right now (bank closed, no profession window open).
-- `onLogout` sections are also rebuilt when the character logs out. Use it only for a section with no
-- refresh event: on a real logout (not /reload) bags, equipment, spells, skills, completed quests, money
-- and stats already read as empty or zero, and the rebuild would overwrite good data.
ns.collectors = {}
local function collector(name, events, collect, onLogout)
    ns.collectors[name] = { events = events, collect = collect, onLogout = onLogout }
end

local CI = C_Container or {}

-- Containers ------------------------------------------------------------------

local function containerIDs(first, last, extra)
    local ids, seen = {}, {}
    local function add(id)
        if id and not seen[id] then
            seen[id] = true
            ids[#ids + 1] = id
        end
    end
    for id = first, last do add(id) end
    -- `extra` can hold nil entries (constants missing on this client), so ipairs would stop early.
    for i = 1, table.maxn(extra or {}) do add(extra[i]) end
    return ids
end

local QUEST_ITEM_CLASS = Enum and Enum.ItemClass and Enum.ItemClass.Questitem or 12

local function questState(questID)
    local QL = C_QuestLog or {}
    local q = { id = questID }
    local L = _G.LibQuestieDB
    if L and L.Quest then
        q.name = get(L.Quest.name, questID)
        q.level = get(L.Quest.questLevel, questID)
    end
    q.name = q.name or get(QL.GetTitleForQuestID, questID)
    q.completed = get(QL.IsQuestFlaggedCompleted, questID)
    q.inLog = get(QL.GetLogIndexForQuestID, questID) ~= nil
    return q
end

---Links a quest item to the quests that start from it or use it, via Questie's database when it is loaded.
local function questLinks(itemID, startsQuestID)
    local L = _G.LibQuestieDB
    local starts = startsQuestID
    local related = {}
    if L and L.Item then
        starts = starts or get(L.Item.startQuest, itemID)
        -- QuestieDB uses 0 for "starts no quest".
        if starts == 0 then starts = nil end
        local ok, ids = pcall(L.Item.relatedQuests, itemID)
        if ok and type(ids) == "table" then
            for _, id in ipairs(ids) do related[#related + 1] = questState(id) end
        end
    end
    return {
        starts = starts and questState(starts) or nil,
        related = #related > 0 and related or nil,
    }
end

local function readContainer(bag)
    local numSlots = get(CI.GetContainerNumSlots or GetContainerNumSlots, bag) or 0
    if numSlots == 0 then return nil end
    local container = { id = bag, slots = numSlots, free = 0, items = {} }
    if bag > 0 and CI.ContainerIDToInventoryID then
        local invID = get(CI.ContainerIDToInventoryID, bag)
        container.link = invID and get(GetInventoryItemLink, "player", invID)
    end
    for slot = 1, numSlots do
        local ok, info = pcall(CI.GetContainerItemInfo, bag, slot)
        if ok and info and info.itemID then
            local item = U.itemRecord(info.hyperlink, info.itemID, info.stackCount)
            item.slot = slot
            item.bound = info.isBound
            item.noValue = info.hasNoValue
            local qok, q = pcall(CI.GetContainerItemQuestInfo, bag, slot)
            if qok and q and (q.isQuestItem or q.questID) then
                item.isQuestItem = q.isQuestItem
                item.startsQuestID = q.questID
                item.startsQuestActive = q.isActive
            end
            if item.classID == QUEST_ITEM_CLASS or item.isQuestItem or item.startsQuestID then
                item.quests = questLinks(info.itemID, item.startsQuestID)
            end
            container.items[#container.items + 1] = item
        else
            container.free = container.free + 1
        end
    end
    return container
end

local function readContainers(ids)
    local out = {}
    for _, bag in ipairs(ids) do
        local c = readContainer(bag)
        if c then out[#out + 1] = c end
    end
    return out
end

local NUM_BAGS = NUM_BAG_SLOTS or 4
-- Forever has the Retail reagent bag (container 5); Era has none, so this is nil there.
local REAGENT_BAG = Enum and Enum.BagIndex and Enum.BagIndex.ReagentBag

collector("bags", { "BAG_UPDATE_DELAYED" }, function()
    return readContainers(containerIDs(0, NUM_BAGS, { REAGENT_BAG, KEYRING_CONTAINER }))
end)

collector("bank", { "BANKFRAME_OPENED", "PLAYERBANKSLOTS_CHANGED", "PLAYERBANKBAGSLOTS_CHANGED", "BAG_UPDATE_DELAYED" }, function()
    if not ns.bankOpen then return nil end
    local tabs = {}
    if Enum and Enum.BagIndex then
        for i = 1, 9 do tabs[#tabs + 1] = Enum.BagIndex["CharacterBankTab_" .. i] end
    end
    local first = (REAGENT_BAG or NUM_BAGS) + 1
    local ids = containerIDs(first, first + (NUM_BANKBAGSLOTS or 0) - 1, tabs)
    table.insert(ids, 1, BANK_CONTAINER or -1)
    return readContainers(ids)
end)

-- Character -------------------------------------------------------------------

collector("info", {
    "PLAYER_XP_UPDATE", "PLAYER_LEVEL_UP", "PLAYER_MONEY", "UPDATE_EXHAUSTION", "PLAYER_UPDATE_RESTING",
    "ZONE_CHANGED", "ZONE_CHANGED_NEW_AREA", "PLAYER_GUILD_UPDATE", "HEARTHSTONE_BOUND", "CHARACTER_POINTS_CHANGED",
}, function()
    local class = pack(UnitClass, "player") or {}
    local race = pack(UnitRace, "player") or {}
    local guild = pack(GetGuildInfo, "player") or {}
    return {
        name = get(UnitName, "player"),
        realm = get(GetRealmName),
        level = get(UnitLevel, "player"),
        class = class[1], classFile = class[2], classID = class[3],
        race = race[1], raceFile = race[2],
        faction = get(UnitFactionGroup, "player"),
        sex = get(UnitSex, "player"),
        xp = get(UnitXP, "player"),
        xpMax = get(UnitXPMax, "player"),
        restedXP = get(GetXPExhaustion),
        resting = get(IsResting),
        money = get(GetMoney),
        zone = get(GetRealZoneText),
        subZone = get(GetSubZoneText),
        mapID = C_Map and get(C_Map.GetBestMapForUnit, "player"),
        hearth = get(GetBindLocation),
        guild = guild[1], guildRank = guild[2],
        unspentTalentPoints = get(UnitCharacterPoints, "player"),
    }
end)

collector("stats", {
    "UNIT_STATS", "UNIT_RESISTANCES", "UNIT_ATTACK_POWER", "UNIT_RANGED_ATTACK_POWER", "UNIT_DAMAGE",
    "UNIT_ATTACK_SPEED", "UNIT_MAXHEALTH", "UNIT_MAXPOWER", "PLAYER_EQUIPMENT_CHANGED", "PLAYER_LEVEL_UP",
    "COMBAT_RATING_UPDATE", "SPELL_POWER_CHANGED",
}, function()
    local s = { primary = {}, resistances = {}, spellCrit = {}, spellDamage = {} }
    for i, key in ipairs({ "strength", "agility", "stamina", "intellect", "spirit" }) do
        local r = pack(UnitStat, "player", i)
        if r then s.primary[key] = { base = r[1], total = r[2] } end
    end
    for i, key in ipairs({ "holy", "fire", "nature", "frost", "shadow", "arcane" }) do
        local r = pack(UnitResistance, "player", i)
        s.resistances[key] = r and r[2]
        s.spellCrit[key] = get(GetSpellCritChance, i + 1)
        s.spellDamage[key] = get(GetSpellBonusDamage, i + 1)
    end
    local armor = pack(UnitArmor, "player") or {}
    local ap = pack(UnitAttackPower, "player") or {}
    local rap = pack(UnitRangedAttackPower, "player") or {}
    local dmg = pack(UnitDamage, "player") or {}
    local speed = pack(UnitAttackSpeed, "player") or {}
    local regen = pack(GetManaRegen) or {}
    s.health = get(UnitHealthMax, "player")
    s.power = get(UnitPowerMax, "player")
    s.powerType = (pack(UnitPowerType, "player") or {})[2]
    s.armor = armor[2]
    s.attackPower = ap[1] and (ap[1] + (ap[2] or 0) + (ap[3] or 0))
    s.rangedAttackPower = rap[1] and (rap[1] + (rap[2] or 0) + (rap[3] or 0))
    s.mainHandDamage = { min = dmg[1], max = dmg[2], speed = speed[1] }
    s.offHandDamage = { min = dmg[3], max = dmg[4], speed = speed[2] }
    s.meleeCrit = get(GetCritChance)
    s.rangedCrit = get(GetRangedCritChance)
    s.meleeHit = get(GetHitModifier)
    s.spellHit = get(GetSpellHitModifier)
    s.healing = get(GetSpellBonusHealing)
    s.dodge = get(GetDodgeChance)
    s.parry = get(GetParryChance)
    s.block = get(GetBlockChance)
    s.manaRegen = { base = regen[1], casting = regen[2] }
    return s
end)

local SLOT_NAMES = {
    [0] = "AMMO", "HEAD", "NECK", "SHOULDER", "SHIRT", "CHEST", "WAIST", "LEGS", "FEET", "WRIST",
    "HANDS", "FINGER1", "FINGER2", "TRINKET1", "TRINKET2", "BACK", "MAINHAND", "OFFHAND", "RANGED", "TABARD",
}

collector("equipment", { "PLAYER_EQUIPMENT_CHANGED", "UPDATE_INVENTORY_DURABILITY", "UNIT_INVENTORY_CHANGED" }, function()
    local out = {}
    local GetItemStats = C_Item and C_Item.GetItemStats or GetItemStats
    for slot = 0, 19 do
        local link = get(GetInventoryItemLink, "player", slot)
        if link then
            local item = U.itemRecord(link, get(GetInventoryItemID, "player", slot))
            if item then
                item.slot = slot
                item.slotName = SLOT_NAMES[slot]
                local dur = pack(GetInventoryItemDurability, slot)
                if dur and dur[2] then item.durability = { cur = dur[1], max = dur[2] } end
                local ok, stats = pcall(GetItemStats, link)
                if ok then item.stats = copy(stats, 0) end
                out[SLOT_NAMES[slot]] = item
            end
        end
    end
    return out
end)

-- Talents and spells ----------------------------------------------------------

-- Forever has no GetNumTalentTabs/GetNumTalents, and GetNumSpecializationsForClassID reports 1 for a Mage,
-- so tabs are found by probing until one comes back empty. Era classes have 3 trees.
-- Forever's C_SpecializationInfo.GetTalentInfo rejects a query without a tier ("query.tier must be
-- specified"), so each tab is read cell by cell over its tier/column grid. Which field selects the tab
-- is not documented; QUERY_SHAPES are tried in order and the first that returns talents is used.
local MAX_TALENT_TABS = 5
local MAX_TIERS, MAX_COLUMNS = 10, 4

local SI = C_SpecializationInfo or {}

local QUERY_SHAPES = {
    specializationIndex = function(tab, tier, column) return { specializationIndex = tab, tier = tier, column = column } end,
    groupIndex = function(tab, tier, column) return { groupIndex = tab, tier = tier, column = column } end,
    both = function(tab, tier, column) return { specializationIndex = tab, groupIndex = 1, tier = tier, column = column } end,
    player = function(tab, tier, column)
        return { specializationIndex = tab, tier = tier, column = column, isInspect = false, target = "player" }
    end,
}
local SHAPE_ORDER = { "specializationIndex", "groupIndex", "both", "player" }

local function talentAt(shape, tab, tier, column)
    local ok, info = pcall(SI.GetTalentInfo, QUERY_SHAPES[shape](tab, tier, column))
    local talent = ok and copy(info, 1) or nil
    if talent and talent.name then return talent end
end

local function gridTalents(shape, tab)
    local list = {}
    for tier = 1, MAX_TIERS do
        for column = 1, MAX_COLUMNS do
            list[#list + 1] = talentAt(shape, tab, tier, column)
        end
    end
    return list
end

local function tabTalents(tab, shape)
    local list = {}
    if GetNumTalents and GetTalentInfo then
        for i = 1, get(GetNumTalents, tab) or 0 do
            local r = pack(GetTalentInfo, tab, i)
            if r and r[1] then
                list[#list + 1] = { name = r[1], tier = r[3], column = r[4], rank = r[5], maxRank = r[6] }
            end
        end
    elseif SI.GetTalentInfo and shape then
        list = gridTalents(shape, tab)
    end
    return list
end

-- The first query shape that finds any talent in the first tab.
local function findShape()
    if not SI.GetTalentInfo then return nil end
    for _, shape in ipairs(SHAPE_ORDER) do
        if #gridTalents(shape, 1) > 0 then return shape end
    end
end

-- GetSpecializationInfo(tab) returns the tree's name first and, per SpellActivationOverlay, the points
-- spent in it seventh. Kept raw as well, since the positions are not documented for Forever.
local function treeInfo(tab)
    local raw = pack(GetTalentTabInfo, tab) or pack(SI.GetSpecializationInfo or GetSpecializationInfo, tab)
    if not raw then return nil end
    local name
    for i = 1, raw.n or 0 do
        if type(raw[i]) == "string" then name = raw[i]; break end
    end
    if not name then return nil end
    local out = { name = name, raw = {} }
    for i = 1, raw.n or 0 do
        local v = raw[i]
        out.raw[i] = (type(v) == "table" or type(v) == "function" or type(v) == "userdata") and type(v) or v
    end
    if type(raw[7]) == "number" then out.pointsSpent = raw[7] end
    return out
end

collector("talents", { "CHARACTER_POINTS_CHANGED", "PLAYER_TALENT_UPDATE", "PLAYER_LEVEL_UP" }, function()
    local shape = not (GetNumTalents and GetTalentInfo) and findShape() or nil
    local tabs, spent, debug = {}, 0, nil
    for tab = 1, get(GetNumTalentTabs) or MAX_TALENT_TABS do
        local info = treeInfo(tab)
        local talents = tabTalents(tab, shape)
        if not info and #talents == 0 then break end
        -- If the client ignores the tab index, every probe returns the first tree again.
        if tab > 1 and talents[1] and tabs[1] and tabs[1].talents[1] and talents[1].name == tabs[1].talents[1].name then
            debug = { repeatedTab = tab }
            break
        end
        local t = { index = tab, name = info and info.name, talents = talents, pointsSpent = 0, raw = info and info.raw }
        for i, talent in ipairs(talents) do
            talent.index = i
            t.pointsSpent = t.pointsSpent + (talent.rank or 0)
        end
        if #talents == 0 and info and info.pointsSpent then t.pointsSpent = info.pointsSpent end
        spent = spent + t.pointsSpent
        tabs[tab] = t
    end
    local unspent = get(UnitCharacterPoints, "player")
    if not unspent and #tabs > 0 then
        -- Era grants one talent point per level from 10.
        unspent = math.max((get(UnitLevel, "player") or 0) - 9, 0) - spent
    end
    if not shape and SI.GetTalentInfo and not (GetNumTalents and GetTalentInfo) then
        -- Record what each query shape returns for the first row, and what the namespace offers.
        debug = debug or {}
        for _, name in ipairs(SHAPE_ORDER) do
            local cells = {}
            for column = 1, MAX_COLUMNS do
                local ok, r = pcall(SI.GetTalentInfo, QUERY_SHAPES[name](1, 1, column))
                cells[column] = ok and (r and (r.name or "table without name") or "nil") or tostring(r)
            end
            debug[name] = cells
        end
        local keys = {}
        for k in pairs(SI) do keys[#keys + 1] = tostring(k) end
        table.sort(keys)
        debug.functions = table.concat(keys, ",")
    end
    return { tabs = tabs, unspent = unspent, query = shape, debug = debug }
end)

collector("spells", { "SPELLS_CHANGED", "LEARNED_SPELL_IN_TAB" }, function()
    local out = {}
    local SB = C_SpellBook
    if SB and SB.GetNumSpellBookSkillLines then
        local bank = Enum.SpellBookSpellBank and Enum.SpellBookSpellBank.Player or 0
        for line = 1, get(SB.GetNumSpellBookSkillLines) or 0 do
            local ok, li = pcall(SB.GetSpellBookSkillLineInfo, line)
            if ok and li then
                for idx = li.itemIndexOffset + 1, li.itemIndexOffset + li.numSpellBookItems do
                    local iok, info = pcall(SB.GetSpellBookItemInfo, idx, bank)
                    if iok and info and info.spellID then
                        out[#out + 1] = {
                            tab = li.name, name = info.name, rank = info.subName ~= "" and info.subName or nil,
                            spellID = info.spellID, passive = info.isPassive,
                        }
                    end
                end
            end
        end
    elseif GetNumSpellTabs then
        for tab = 1, GetNumSpellTabs() do
            local r = pack(GetSpellTabInfo, tab) or {}
            for idx = (r[3] or 0) + 1, (r[3] or 0) + (r[4] or 0) do
                local n = pack(GetSpellBookItemName, idx, BOOKTYPE_SPELL or "spell") or {}
                local info = pack(GetSpellBookItemInfo, idx, BOOKTYPE_SPELL or "spell") or {}
                out[#out + 1] = { tab = r[1], name = n[1], rank = n[2], spellID = info[2] }
            end
        end
    end
    return out
end)

-- Skills and professions ------------------------------------------------------

collector("skills", { "SKILL_LINES_CHANGED", "CHAT_MSG_SKILL" }, function()
    local out, header = {}, nil
    local SI = C_SkillInfo
    local n = SI and get(SI.GetNumSkillLines) or get(GetNumSkillLines) or 0
    for i = 1, n do
        local s
        if SI and SI.GetSkillLineInfo then
            local ok, info = pcall(SI.GetSkillLineInfo, i)
            s = ok and copy(info, 0) or nil
        else
            local r = pack(GetSkillLineInfo, i)
            if r then s = { name = r[1], isHeader = r[2], rank = r[4], maxRank = r[7] } end
        end
        if s then
            if s.isHeader then
                header = s.name
            else
                s.category = header
                out[#out + 1] = s
            end
        end
    end
    return out
end)

local function readModernRecipes()
    local TS = C_TradeSkillUI
    if not (TS and TS.GetAllRecipeIDs) then return nil end
    local ok, ids = pcall(TS.GetAllRecipeIDs)
    if not ok or not ids or #ids == 0 then return nil end
    local binfo
    if TS.GetBaseProfessionInfo then
        local okb, info = pcall(TS.GetBaseProfessionInfo)
        binfo = okb and type(info) == "table" and info or nil
    end
    binfo = binfo or {}
    local name = binfo.professionName
        or get(TS.GetTradeSkillDisplayName, ids[1])
        or (pack(GetTradeSkillLine) or {})[1]
    local recipes = {}
    for _, id in ipairs(ids) do
        local rok, r = pcall(TS.GetRecipeInfo, id)
        if rok and r and r.learned then
            recipes[#recipes + 1] = {
                recipeID = id, name = r.name, difficulty = r.relativeDifficulty,
                numAvailable = r.numAvailable, link = get(TS.GetRecipeItemLink, id),
            }
        end
    end
    return name, { skill = binfo.skillLevel, maxSkill = binfo.maxSkillLevel, recipes = recipes }
end

local function readLegacyList(numFn, infoFn, linkFn, lineFn)
    if not numFn then return nil end
    local n = get(numFn) or 0
    if n == 0 then return nil end
    local line = pack(lineFn) or {}
    local recipes = {}
    for i = 1, n do
        local r = pack(infoFn, i) or {}
        -- Trade skills return (name, difficulty); crafts return (name, subtext, difficulty).
        local difficulty = r[2] == "header" and "header" or (r[3] and type(r[3]) == "string" and r[3]) or r[2]
        if r[1] and difficulty ~= "header" then
            recipes[#recipes + 1] = { name = r[1], difficulty = difficulty, link = get(linkFn, i) }
        end
    end
    return line[1], { skill = line[2], maxSkill = line[3], recipes = recipes }
end

collector("recipes", { "TRADE_SKILL_SHOW", "TRADE_SKILL_LIST_UPDATE", "TRADE_SKILL_UPDATE", "CRAFT_SHOW", "CRAFT_UPDATE" }, function(prev)
    local out = prev or {}
    local found = false
    local name, data = readModernRecipes()
    if not name then
        name, data = readLegacyList(GetNumTradeSkills, GetTradeSkillInfo, GetTradeSkillItemLink, GetTradeSkillLine)
    end
    if name and name ~= "UNKNOWN" then out[name] = data; found = true end
    local cname, cdata = readLegacyList(GetNumCrafts, GetCraftInfo, GetCraftItemLink, GetCraftDisplaySkillLine)
    if cname then out[cname] = cdata; found = true end
    return found and out or nil
end)

-- Quests and reputation -------------------------------------------------------

collector("quests", { "QUEST_LOG_UPDATE", "QUEST_ACCEPTED", "QUEST_REMOVED", "QUEST_TURNED_IN" }, function()
    local out, header = {}, nil
    local QL = C_QuestLog
    if QL and QL.GetNumQuestLogEntries and QL.GetInfo then
        for i = 1, get(QL.GetNumQuestLogEntries) or 0 do
            local ok, info = pcall(QL.GetInfo, i)
            if ok and info then
                if info.isHeader then
                    header = info.title
                else
                    local q = copy(info, 0)
                    q.category = header
                    q.isComplete = get(QL.IsComplete, info.questID)
                    local ook, obj = pcall(QL.GetQuestObjectives, info.questID)
                    q.objectives = ook and copy(obj, 1) or nil
                    out[#out + 1] = q
                end
            end
        end
    elseif GetNumQuestLogEntries then
        for i = 1, GetNumQuestLogEntries() do
            local r = pack(GetQuestLogTitle, i) or {}
            if r[4] then
                header = r[1]
            elseif r[1] then
                out[#out + 1] = { title = r[1], level = r[2], isComplete = r[6] == 1, questID = r[8], category = header }
            end
        end
    end
    return out
end)

collector("completedQuests", { "QUEST_TURNED_IN" }, function()
    local QL = C_QuestLog
    local ok, ids = pcall(QL and QL.GetAllCompletedQuestIDs or GetQuestsCompleted)
    if not ok or type(ids) ~= "table" then return nil end
    if #ids == 0 and next(ids) then
        -- GetQuestsCompleted returns a set keyed by quest ID.
        local list = {}
        for id in pairs(ids) do list[#list + 1] = id end
        ids = list
    end
    table.sort(ids)
    return ids
end)

collector("reputation", { "UPDATE_FACTION" }, function()
    local out, header = {}, nil
    local R = C_Reputation
    if R and R.GetNumFactions and R.GetFactionDataByIndex then
        for i = 1, get(R.GetNumFactions) or 0 do
            local ok, f = pcall(R.GetFactionDataByIndex, i)
            if ok and f then
                if f.isHeader and not f.isHeaderWithRep then
                    header = f.name
                else
                    local rec = copy(f, 0)
                    rec.category = header
                    out[#out + 1] = rec
                end
            end
        end
    elseif GetNumFactions then
        for i = 1, GetNumFactions() do
            local r = pack(GetFactionInfo, i) or {}
            if r[9] and not r[11] then
                header = r[1]
            elseif r[1] then
                out[#out + 1] = {
                    name = r[1], standingID = r[3], barMin = r[4], barMax = r[5], barValue = r[6],
                    atWar = r[7], factionID = r[14], category = header,
                }
            end
        end
    end
    return out
end)

-- RestedXP guide --------------------------------------------------------------

local ELEMENT_FIELDS = {
    "tag", "text", "rawtext", "textOnly", "questId", "id", "ids", "qty", "itemName", "items",
    "title", "zone", "x", "y", "profession",
}

collector("guide", {}, function()
    local AceAddon = LibStub and LibStub("AceAddon-3.0", true)
    local rxp = AceAddon and AceAddon:GetAddon("RXPGuides", true)
    local guide = rxp and rxp.currentGuide
    if not (guide and guide.steps) then return nil end
    local steps = {}
    for i, step in ipairs(guide.steps) do
        local s = copy(step, 0)
        s.index = i
        s.elements = {}
        for _, el in ipairs(step.elements or {}) do
            local e = {}
            for _, k in ipairs(ELEMENT_FIELDS) do
                local v = el[k]
                if type(v) == "table" then v = copy(v, 0) end
                if v ~= nil and (type(v) ~= "string" or v:find("%S")) then e[k] = v end
            end
            s.elements[#s.elements + 1] = e
        end
        steps[i] = s
    end
    return {
        name = guide.name,
        group = guide.group,
        next = guide.next,
        currentStep = RXPCData and RXPCData.currentStep,
        steps = steps,
    }
end, true)

-- Map geometry ---------------------------------------------------------------

-- Forever reshaped its continent maps and some zones, so the atlas takes zone placement from the
-- client: each zone's rectangle on its continent and its world corners. Rebuilt at login only.
local CONTINENTS = { 1415, 1414 }
local ZONE_TYPE = Enum and Enum.UIMapType and Enum.UIMapType.Zone or 3

local function worldCorner(mapID, u, v)
    if not (C_Map.GetWorldPosFromMapPos and CreateVector2D) then return nil end
    local ok, _, pos = pcall(C_Map.GetWorldPosFromMapPos, mapID, CreateVector2D(u, v))
    if not (ok and pos and pos.GetXY) then return nil end
    local x, y = pos:GetXY()
    if type(x) == "number" and type(y) == "number" then return { x, y } end
end

collector("maps", {}, function()
    if not (C_Map and C_Map.GetMapChildrenInfo and C_Map.GetMapRectOnMap) then return nil end
    local out = {}
    for _, continent in ipairs(CONTINENTS) do
        local ok, children = pcall(C_Map.GetMapChildrenInfo, continent, ZONE_TYPE, false)
        for _, child in ipairs(ok and children or {}) do
            local id = child.mapID
            local rok, left, right, top, bottom = pcall(C_Map.GetMapRectOnMap, id, continent)
            out[#out + 1] = {
                id = id,
                name = child.name,
                parent = child.parentMapID,
                continent = continent,
                rect = rok and type(left) == "number" and { left, top, right, bottom } or nil,
                -- Map position (0,0) is the top-left corner, (1,1) the bottom-right.
                topLeft = worldCorner(id, 0, 0),
                bottomRight = worldCorner(id, 1, 1),
            }
        end
    end
    if #out > 0 then return out end
end)
