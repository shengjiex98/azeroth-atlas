local _, ns = ...

local frame, edit

-- Mac clients copy with Cmd, which WoW reports as the meta key.
local function copyHint()
    local mac = IsMacClient and IsMacClient()
    return (mac and "Cmd+C" or "Ctrl+C") .. " copies and closes. Paste into the Azeroth Atlas."
end

local function isCopy(key)
    if key ~= "C" then return false end
    return (IsControlKeyDown and IsControlKeyDown()) or (IsMetaKeyDown and IsMetaKeyDown()) or false
end

local function create()
    frame = CreateFrame("Frame", "RosettaExportFrame", UIParent, "BackdropTemplate")
    frame:SetSize(480, 184)
    frame:SetPoint("CENTER")
    frame:SetFrameStrata("DIALOG")
    frame:SetBackdrop({ bgFile = "Interface/Tooltips/UI-Tooltip-Background" })
    frame:SetBackdropColor(0.05, 0.05, 0.05, 0.95)
    frame:SetMovable(true)
    frame:SetClampedToScreen(true)
    frame:EnableMouse(true)
    frame:RegisterForDrag("LeftButton")
    frame:SetScript("OnDragStart", frame.StartMoving)
    frame:SetScript("OnDragStop", frame.StopMovingOrSizing)
    frame:Hide()
    UISpecialFrames[#UISpecialFrames + 1] = frame:GetName()

    local hint = frame:CreateFontString(nil, "ARTWORK", "GameFontHighlight")
    hint:SetPoint("TOP", 0, -12)
    hint:SetText(copyHint())

    local scroll = CreateFrame("ScrollFrame", "RosettaExportScrollFrame", frame, "UIPanelScrollFrameTemplate")
    scroll:SetPoint("TOPLEFT", 12, -34)
    scroll:SetPoint("BOTTOMRIGHT", -32, 38)
    edit = CreateFrame("EditBox", nil, scroll)
    edit:SetMultiLine(true)
    edit:SetAutoFocus(false)
    edit:SetFontObject(ChatFontNormal)
    edit:SetSize(436, 112)
    edit:SetScript("OnEscapePressed", function() frame:Hide() end)
    -- Hiding inside the key handler would clear focus before the edit box copies, so wait a frame.
    edit:SetScript("OnKeyDown", function(_, key)
        if isCopy(key) then C_Timer.After(0, function() frame:Hide() end) end
    end)
    scroll:SetScrollChild(edit)
    frame:SetScript("OnHide", function()
        edit:ClearFocus()
        frame:StopMovingOrSizing()
    end)

    local close = CreateFrame("Button", nil, frame, "UIPanelButtonTemplate")
    close:SetSize(80, 22)
    close:SetPoint("BOTTOM", 0, 8)
    close:SetText("Close")
    close:SetScript("OnClick", function() frame:Hide() end)
end

function ns.showSummaryExport(transport)
    if not frame then create() end
    frame:Show()
    edit:SetText(transport)
    edit:SetFocus()
    edit:SetCursorPosition(0)
    edit:GetParent():SetVerticalScroll(0)
    edit:HighlightText()
end
