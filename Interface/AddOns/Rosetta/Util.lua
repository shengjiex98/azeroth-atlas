local _, ns = ...

local issecretvalue = issecretvalue
local type, pcall, select = type, pcall, select

local U = {}
ns.U = U

local function isSecret(v)
    return issecretvalue ~= nil and issecretvalue(v)
end

local function usable(v)
    local t = type(v)
    return (t == "string" or t == "number" or t == "boolean") and not isSecret(v)
end

local function packResults(ok, ...)
    if not ok then return nil end
    local n = select("#", ...)
    local out = { n = n }
    for i = 1, n do
        local v = select(i, ...)
        if usable(v) then out[i] = v end
    end
    return out
end

---Calls fn and returns its first result, or nil if fn is missing, errors, or returns a secret value.
function U.get(fn, ...)
    if not fn then return nil end
    local ok, v = pcall(fn, ...)
    if ok and usable(v) then return v end
    return nil
end

---Calls fn and returns all results as an array, or nil if fn is missing or errors.
---Secret and non-scalar results become nil holes; `n` stays the true result count.
function U.pack(fn, ...)
    if not fn then return nil end
    return packResults(pcall(fn, ...))
end

---Copies scalar fields of a table. Nested tables are copied up to `depth` levels.
---Functions, userdata, frames, and secret values are skipped so the result is safe to save.
function U.copy(t, depth)
    if type(t) ~= "table" then return nil end
    depth = depth or 1
    local out = {}
    for k, v in pairs(t) do
        if usable(k) then
            if usable(v) then
                out[k] = v
            elseif type(v) == "table" and depth > 0 and not v.GetObjectType then
                out[k] = U.copy(v, depth - 1)
            end
        end
    end
    return out
end

---Static item data does not change during a session, so it is looked up once per item ID.
local itemCache = {}

---Returns static details for an item. Values from GetItemInfo can be nil until the client caches the item.
function U.itemStatic(itemID)
    local c = itemCache[itemID]
    if c and c.complete then return c end
    c = c or {}
    local GetItemInfoInstant = C_Item and C_Item.GetItemInfoInstant or GetItemInfoInstant
    local inst = U.pack(GetItemInfoInstant, itemID)
    if inst then
        c.itemType, c.itemSubType, c.equipLoc = inst[2], inst[3], inst[4]
        c.classID, c.subClassID = inst[6], inst[7]
    end
    local GetItemInfo = C_Item and C_Item.GetItemInfo or GetItemInfo
    local info = U.pack(GetItemInfo, itemID)
    if info and info[1] then
        c.name, c.quality, c.itemLevel, c.reqLevel = info[1], info[3], info[4], info[5]
        c.maxStack, c.sellPrice, c.bindType = info[8], info[11], info[14]
        c.complete = true
    end
    itemCache[itemID] = c
    return c
end

---Builds a saved record for an item link, merging cached static data.
function U.itemRecord(link, itemID, count)
    if not itemID and link then
        itemID = tonumber(link:match("item:(%d+)"))
    end
    if not itemID then return nil end
    local s = U.itemStatic(itemID)
    return {
        id = itemID,
        link = link,
        count = count,
        name = s.name or (link and link:match("%[(.-)%]")),
        quality = s.quality,
        itemLevel = s.itemLevel,
        reqLevel = s.reqLevel,
        itemType = s.itemType,
        itemSubType = s.itemSubType,
        classID = s.classID,
        subClassID = s.subClassID,
        equipLoc = s.equipLoc ~= "" and s.equipLoc or nil,
        sellPrice = s.sellPrice,
        bindType = s.bindType,
        maxStack = s.maxStack,
    }
end

local function nonEmpty(v)
    return type(v) == "string" and v ~= "" and v or nil
end

---Returns this character's key in `db.characters`, "<Name>-<NormalizedRealm>".
---Some clients report an empty realm name for a whole session, which would give the
---same character a different key on each computer. The GUID is the same everywhere,
---so each realm-derived key is remembered under it and reused when the realm is missing.
function U.characterKey(db)
    local name = U.get(UnitName, "player") or "?"
    local guid = nonEmpty(U.get(UnitGUID, "player"))
    local realm = nonEmpty(U.get(GetNormalizedRealmName)) or nonEmpty(U.get(GetRealmName))
    db.keyByGUID = db.keyByGUID or {}
    db.characters = db.characters or {}
    local key
    if realm then
        key = name .. "-" .. realm:gsub("%s", "")
    elseif guid and db.keyByGUID[guid] then
        key = db.keyByGUID[guid]
    else
        -- No GUID mapping yet: use the one stored character with this name, if exactly one.
        for k in pairs(db.characters) do
            if k:sub(1, #name + 1) == name .. "-" and #k > #name + 1 then
                if key then key = nil; break end
                key = k
            end
        end
        key = key or (name .. "-" .. (guid or "unknown"))
    end
    if guid then db.keyByGUID[guid] = key end
    -- Entries written while the realm was missing.
    db.characters[name .. "-"] = nil
    return key
end
