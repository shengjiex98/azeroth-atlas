-- Run with lua5.1 from the repository root. Checks the maps collector against a stub C_Map.
local function eq(actual, expected, label)
    if actual ~= expected then error(("%s: expected %s, got %s"):format(label, tostring(expected), tostring(actual)), 2) end
end

Enum = { UIMapType = { Zone = 3 }, BagIndex = {} }
local vector = { __index = { GetXY = function(v) return v.x, v.y end } }
function CreateVector2D(x, y) return setmetatable({ x = x, y = y }, vector) end
C_Map = {
    GetMapChildrenInfo = function(continent, mapType)
        eq(mapType, 3, "children type")
        if continent == 1415 then return { { mapID = 1426, name = "Dun Morogh", parentMapID = 1415 } } end
        if continent == 1414 then return { { mapID = 1439, name = "Darkshore", parentMapID = 1414 } } end
        return {}
    end,
    GetMapRectOnMap = function(id, continent)
        if id == 1439 then error("no rect") end
        return 0.40, 0.54, 0.48, 0.62
    end,
    GetWorldPosFromMapPos = function(id, pos)
        return 0, CreateVector2D(-4000 - pos.x * 1000, 1000 - pos.y * 800)
    end,
}

local ns = {}
for _, file in ipairs({ "Util.lua", "Collectors.lua" }) do
    assert(loadfile("Interface/AddOns/Rosetta/" .. file))("Rosetta", ns)
end
local maps = ns.collectors.maps.collect()
eq(#maps, 2, "zones found")
eq(maps[1].id, 1426, "first zone")
eq(maps[1].rect[1], 0.40, "rect left")
eq(maps[1].rect[2], 0.48, "rect top")
eq(maps[1].rect[3], 0.54, "rect right")
eq(maps[1].rect[4], 0.62, "rect bottom")
eq(maps[1].topLeft[1], -4000, "top-left x")
eq(maps[1].bottomRight[2], 200, "bottom-right y")
eq(maps[2].rect, nil, "failed rect lookup is skipped")
C_Map.GetMapChildrenInfo = nil
eq(ns.collectors.maps.collect(), nil, "no API, keep the previous export")
print("All Rosetta maps tests passed.")
