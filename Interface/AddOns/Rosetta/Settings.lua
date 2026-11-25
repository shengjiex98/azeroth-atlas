-- Info-only page under Options > AddOns > Rosetta. Rebuilt each time it is shown.
local ADDON, ns = ...

local GOLD, GREY, RED, GREEN = "|cffffd100", "|cff9d9d9d", "|cffff5555", "|cff33ff99"

-- Sections that only refresh while a particular window is open.
local SECTION_HINTS = {
    bank = "open the bank to refresh",
    recipes = "open each profession window to refresh",
}

local function when(t)
    return t and date("%Y-%m-%d %H:%M", t) or "never"
end

local function metadata(field)
    local get = C_AddOns and C_AddOns.GetAddOnMetadata or GetAddOnMetadata
    return get and get(ADDON, field)
end

local function characterLines(add)
    local record = ns.record
    add(GOLD .. "This character|r")
    if not record then
        add(GREY .. "Not loaded yet.|r")
        return
    end
    add(("Saved as %s, logged in %s."):format(ns.charKey or "?", when(record.lastLogin)))
    local names = {}
    for name in pairs(ns.collectors or {}) do names[#names + 1] = name end
    table.sort(names)
    for _, name in ipairs(names) do
        local err = record.errors and record.errors[name]
        local updated = record.updated and record.updated[name]
        local line = ("  %s: %s"):format(name, updated and when(updated) or GREY .. "not exported|r")
        if err then
            line = line .. "  " .. RED .. "error: " .. err .. "|r"
        elseif SECTION_HINTS[name] then
            line = line .. "  " .. GREY .. "(" .. SECTION_HINTS[name] .. ")|r"
        end
        add(line)
    end
    local journal = "  journal: " .. (ns.journalStatus and ns.journalStatus() or "not loaded")
    if record.errors.journal then journal = journal .. "  " .. RED .. "error: " .. record.errors.journal .. "|r" end
    add(journal)
end

local function text()
    local out = {}
    local function add(s) out[#out + 1] = s or "" end
    add(GOLD .. "Rosetta|r " .. (metadata("Version") or ""))
    add("The bridge between World of Warcraft and tools outside the game. It exports this character's data for AI tools to read.")
    add()
    characterLines(add)
    add()
    add(GOLD .. "Commands|r")
    add("/rosetta opens this page. /rosetta snap or /csnap rebuilds the snapshot sections.")
    add("/rosetta journal off, on, or status controls the journal and shows its status.")
    add(GREY .. "Exported data reaches disk on /reload, logout or exit.|r")
    return table.concat(out, "\n")
end

local panel = CreateFrame("Frame")
panel.name = "Rosetta"
local label = panel:CreateFontString(nil, "ARTWORK", "GameFontHighlight")
label:SetPoint("TOPLEFT", 16, -16)
label:SetPoint("RIGHT", panel, "RIGHT", -16, 0)
label:SetJustifyH("LEFT")
label:SetJustifyV("TOP")
label:SetSpacing(3)
panel:SetScript("OnShow", function()
    local ok, result = pcall(text)
    label:SetText(ok and result or (RED .. "Rosetta settings error: " .. tostring(result) .. "|r"))
end)

local category
if Settings and Settings.RegisterCanvasLayoutCategory then
    category = Settings.RegisterCanvasLayoutCategory(panel, "Rosetta")
    Settings.RegisterAddOnCategory(category)
elseif InterfaceOptions_AddCategory then
    InterfaceOptions_AddCategory(panel)
end

function ns.openSettings()
    if category and Settings.OpenToCategory then
        Settings.OpenToCategory(category:GetID())
    elseif InterfaceOptionsFrame_OpenToCategory then
        InterfaceOptionsFrame_OpenToCategory(panel)
    else
        print(GREEN .. "Rosetta|r " .. text())
    end
end
