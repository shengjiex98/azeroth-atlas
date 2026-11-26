local _, ns = ...

local notes = {}
ns.notes = notes

local checkedStore
local INTEGER_LIMIT = 2 ^ 53
local CHIP_PREFIX = "addon:Rosetta:"
local DATE_FORMAT = "%Y-%m-%d"
local MONEY_UNITS = { g = 10000, s = 100, c = 1 }
local CHIP_PUNCTUATION = { ["."] = true, [","] = true, [";"] = true, [")"] = true }

local function isText(value)
    return type(value) == "string" and not (issecretvalue and issecretvalue(value))
end

local function isFinite(value)
    return type(value) == "number" and not (issecretvalue and issecretvalue(value))
        and value > -math.huge and value < math.huge
end

local function isId(value)
    return isFinite(value) and value >= 1 and value < INTEGER_LIMIT and value % 1 == 0
end

local function newer(a, b)
    if a.updated ~= b.updated then return a.updated > b.updated end
    return a.id > b.id
end

local function findNote(store, id)
    for index, note in ipairs(store.list) do
        if note.id == id then return note, index end
    end
end

function notes.ensureStore()
    if type(RosettaDB) ~= "table" then RosettaDB = {} end
    local saved = RosettaDB.notes
    if checkedStore and saved == checkedStore then return saved end
    if type(saved) ~= "table" then saved = {} end
    local store = { list = {} }
    local seen, latest, maxId = {}, nil, 0
    if type(saved.list) == "table" then
        local indices = {}
        for index in pairs(saved.list) do
            if isId(index) then indices[#indices + 1] = index end
        end
        table.sort(indices)
        for _, index in ipairs(indices) do
            local entry = saved.list[index]
            if type(entry) == "table" and isId(entry.id) and not seen[entry.id] then
                local created = isFinite(entry.created) and entry.created or time()
                local note = {
                    id = entry.id,
                    text = isText(entry.text) and entry.text or "",
                    created = created,
                    updated = isFinite(entry.updated) and entry.updated or created,
                }
                store.list[#store.list + 1] = note
                seen[note.id] = true
                maxId = math.max(maxId, note.id)
                if not latest or newer(note, latest) then latest = note end
            end
        end
    end
    if isId(saved.selected) and seen[saved.selected] then
        store.selected = saved.selected
    elseif latest then
        store.selected = latest.id
    end
    store.nextId = isId(saved.nextId) and saved.nextId or 1
    if store.nextId <= maxId then store.nextId = maxId + 1 end
    if store.nextId == INTEGER_LIMIT then store.nextId = 1 end
    RosettaDB.notes, checkedStore = store, store
    return store
end

function notes.sortedList()
    local sorted = {}
    for index, note in ipairs(notes.ensureStore().list) do sorted[index] = note end
    table.sort(sorted, newer)
    return sorted
end

function notes.create()
    local store = notes.ensureStore()
    local id = store.nextId
    while findNote(store, id) do id = id + 1 end
    local now = time()
    local note = { id = id, text = "", created = now, updated = now }
    store.list[#store.list + 1] = note
    store.selected = id
    store.nextId = id + 1 < INTEGER_LIMIT and id + 1 or 1
    return note
end

function notes.delete(id)
    local store = notes.ensureStore()
    local _, index = findNote(store, id)
    if not index then return end
    table.remove(store.list, index)
    if store.selected == id then
        local latest = notes.sortedList()[1]
        store.selected = latest and latest.id
    end
end

local function isCopper(value)
    return isFinite(value) and value >= 0 and value < INTEGER_LIMIT and value % 1 == 0
end

function notes.parseMoney(token)
    if not isText(token) or token == "" then return end
    token = token:lower()
    local copper, offset, previousUnit = 0, 1, math.huge
    while offset <= #token do
        local digits, unit, nextOffset = token:match("^(%d+)([gsc])()", offset)
        if not digits then return end
        local amount, multiplier = tonumber(digits), MONEY_UNITS[unit]
        if multiplier >= previousUnit or (unit ~= "g" and amount > 99) then return end
        copper = copper + amount * multiplier
        offset, previousUnit = nextOffset, multiplier
    end
    if isCopper(copper) then return copper end
end

local function moneyDisplay(copper)
    local gold = math.floor(copper / MONEY_UNITS.g)
    local silver = math.floor(copper % MONEY_UNITS.g / MONEY_UNITS.s)
    local remainder = copper % MONEY_UNITS.s
    local parts = {}
    if gold > 0 then parts[#parts + 1] = ("%.0fg"):format(gold) end
    if silver > 0 then parts[#parts + 1] = silver .. "s" end
    if remainder > 0 or #parts == 0 then parts[#parts + 1] = remainder .. "c" end
    return table.concat(parts, " ")
end

function notes.moneyChip(copper)
    if not isCopper(copper) then return end
    return ("|cffffd100|H%smoney:%.0f|h%s|h|r"):format(CHIP_PREFIX, copper, moneyDisplay(copper))
end

function notes.dateChip(t)
    local day = t and date(DATE_FORMAT, t) or date(DATE_FORMAT)
    return ("|cff66bbff|H%sdate:%s|h%s|h|r"):format(CHIP_PREFIX, day, day)
end

local function chipForToken(token)
    if token:lower() == "@today" then return notes.dateChip() end
    local copper = notes.parseMoney(token)
    if copper then return notes.moneyChip(copper) end
end

local function maskLinks(text)
    if not text:find("|H", 1, true) then return text end
    local pieces, from, opening, inLabel = {}, 1, nil, false
    for pipes, tagOffset in text:gmatch("(|+)()") do
        if #pipes % 2 == 1 then
            local tag = text:sub(tagOffset, tagOffset)
            if tag == "H" then
                opening, inLabel = tagOffset - 1, false
            elseif tag == "h" and opening then
                if inLabel then
                    local stop = tagOffset + 1
                    -- Keep byte offsets and treat whitespace within links as part of one token.
                    pieces[#pieces + 1] = text:sub(from, opening - 1)
                    pieces[#pieces + 1] = string.rep("\0", stop - opening)
                    from, opening = stop, nil
                else
                    inLabel = true
                end
            end
        end
    end
    if from == 1 then return text end
    pieces[#pieces + 1] = text:sub(from)
    return table.concat(pieces)
end

function notes.expandText(text)
    local pieces, from = {}, 1
    for start, token, stop in maskLinks(text):gmatch("()(%S+)()") do
        if CHIP_PUNCTUATION[token:sub(-1)] then
            token, stop = token:sub(1, -2), stop - 1
        end
        local chip = chipForToken(token)
        if chip then
            pieces[#pieces + 1] = text:sub(from, start - 1)
            pieces[#pieces + 1] = chip
            from = stop
        end
    end
    if from == 1 then return text end
    pieces[#pieces + 1] = text:sub(from)
    return table.concat(pieces)
end

function notes.editChipAtCursor(text, cursor)
    if not isFinite(cursor) or cursor < 2 or cursor > #text or cursor % 1 ~= 0 then return end
    local delimiter = text:sub(cursor, cursor)
    local punctuation = CHIP_PUNCTUATION[delimiter]
    if not punctuation and delimiter ~= " " and delimiter ~= "\n" and delimiter ~= "\r" then return end
    if punctuation and text:sub(cursor + 1, cursor + 1):find("%S") then return end
    local stop = cursor - 1
    if delimiter == "\n" and text:sub(stop, stop) == "\r" then stop = stop - 1 end
    local start = stop
    while start > 0 and text:sub(start, start):find("%S") do start = start - 1 end
    local chip = chipForToken(text:sub(start + 1, stop))
    if not chip or maskLinks(text):sub(start + 1, cursor) ~= text:sub(start + 1, cursor) then return end
    -- GetCursorPosition is a zero-based byte offset into GetText, including UTF-8 and link escapes.
    -- Lua's inclusive end byte is the exclusive selection endpoint for HighlightText.
    return start, stop, chip
end

function notes.append(text)
    if not isText(text) or not text:find("%S") then return end
    text = notes.expandText(text)
    local store = notes.ensureStore()
    local note = findNote(store, store.selected) or notes.create()
    note.text = note.text == "" and text or note.text .. "\n" .. text
    note.updated = time()
    return note
end

function notes.title(text)
    for line in text:gmatch("[^\r\n]+") do
        -- Protect doubled pipes so a literal escape stays visible in the title.
        line = line:gsub("||", "\0")
            :gsub("|H[^|]*|h(.-)|h", "%1")
            :gsub("|c%x%x%x%x%x%x%x%x", "")
            :gsub("|cn[%w_]+:", "")
            :gsub("|r", "")
            :gsub("|T[^|]*|t", "")
            :gsub("|A[^|]*|a", "")
            :gsub("%z", "|")
        local title = line:match("^%s*(.-)%s*$")
        if title ~= "" then return title end
    end
    return "New note"
end

local frame, edit, editorScroll, listScroll, listContent, deleteButton, editingNote
local rows = {}
local ROW_HEIGHT = 22
local DELETE_POPUP = "ROSETTA_DELETE_NOTE"

local function displayTitle(note)
    return (notes.title(note.text):gsub("|", "||"))
end

local refreshEditor

local function makeRow(index)
    local row = CreateFrame("Button", nil, listContent)
    local y = -(index - 1) * ROW_HEIGHT
    row:SetPoint("TOPLEFT", 0, y)
    row:SetPoint("TOPRIGHT", 0, y)
    row:SetHeight(ROW_HEIGHT)
    row:SetHighlightTexture("Interface/QuestFrame/UI-QuestTitleHighlight", "ADD")
    local label = row:CreateFontString(nil, "ARTWORK", "GameFontHighlightSmall")
    label:SetPoint("LEFT", 5, 0)
    label:SetPoint("RIGHT", -5, 0)
    label:SetJustifyH("LEFT")
    label:SetWordWrap(false)
    label:SetMaxLines(1)
    row.label = label
    row:SetScript("OnClick", function(self)
        notes.ensureStore().selected = self.noteId
        refreshEditor()
    end)
    return row
end

local function refreshList()
    local selected = notes.ensureStore().selected
    local sorted = notes.sortedList()
    for index, note in ipairs(sorted) do
        local row = rows[index] or makeRow(index)
        rows[index] = row
        row.noteId = note.id
        row.label:SetText(displayTitle(note))
        if note.id == selected then row:LockHighlight() else row:UnlockHighlight() end
        row:Show()
    end
    for index = #sorted + 1, #rows do rows[index]:Hide() end
    listContent:SetHeight(math.max(1, #sorted * ROW_HEIGHT))
    deleteButton:SetEnabled(selected ~= nil)
end

refreshEditor = function(atEnd)
    local store = notes.ensureStore()
    editingNote = findNote(store, store.selected)
    local text = editingNote and editingNote.text or ""
    edit:SetText(text)
    edit:SetCursorPosition(atEnd and #text or 0)
    if not atEnd then editorScroll:SetVerticalScroll(0) end
    refreshList()
end

local replacingChip

local function expandEdit(text, previous)
    local cursor = ns.U.get(edit.GetCursorPosition, edit)
    local start, stop, chip = notes.editChipAtCursor(text, cursor)
    if not chip then return text end
    -- Match the unchanged prefix and suffix so deletions and pasted tokens do not trigger expansion.
    local replacedEnd = cursor + #previous - #text
    if replacedEnd < stop or previous:sub(1, stop) ~= text:sub(1, stop)
        or previous:sub(replacedEnd + 1) ~= text:sub(cursor + 1)
        or (replacedEnd >= cursor and previous:sub(stop + 1, cursor) == text:sub(stop + 1, cursor)) then
        return text
    end

    local expected = text:sub(1, start) .. chip .. text:sub(stop + 1)
    replacingChip = true
    if pcall(edit.HighlightText, edit, start, stop) then
        pcall(edit.Insert, edit, chip)
    end
    local actual = ns.U.get(edit.GetText, edit)
    if actual == expected then
        pcall(edit.SetCursorPosition, edit, start + #chip)
    else
        -- Preserve the typed text if the client rejects the link or selects a different span.
        if actual ~= text then pcall(edit.SetText, edit, text) end
        pcall(edit.SetCursorPosition, edit, cursor)
    end
    replacingChip = false
    return actual == expected and expected or text
end

local function saveEdit(userInput)
    if replacingChip then return end
    local text = ns.U.get(edit.GetText, edit)
    local previous = editingNote and editingNote.text or ""
    if type(text) ~= "string" or text == previous then return end
    if userInput then text = expandEdit(text, previous) end
    if not editingNote then editingNote = notes.create() end
    editingNote.text, editingNote.updated = text, time()
    refreshList()
end

local function hideLinkTooltip(self)
    if GameTooltip and ns.U.get(GameTooltip.IsOwned, GameTooltip, self) then
        pcall(GameTooltip.Hide, GameTooltip)
    end
end

local function isChipLink(link)
    return link:sub(1, #CHIP_PREFIX) == CHIP_PREFIX
end

local DAYS_BEFORE_MONTH = { 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365 }

local function calendarDay(value)
    local year, month, day = value:match("^(%d%d%d%d)%-(%d%d)%-(%d%d)$")
    if not year then return end
    year, month, day = tonumber(year), tonumber(month), tonumber(day)
    if year == 0 or month < 1 or month > 12 or day < 1 then return end
    local leap = year % 4 == 0 and (year % 100 ~= 0 or year % 400 == 0)
    local monthStart = DAYS_BEFORE_MONTH[month]
    local monthLength = DAYS_BEFORE_MONTH[month + 1] - monthStart
    if leap and month == 2 then monthLength = monthLength + 1 end
    if day > monthLength then return end
    if leap and month > 2 then monthStart = monthStart + 1 end
    year = year - 1
    return 365 * year + math.floor(year / 4) - math.floor(year / 100) + math.floor(year / 400) + monthStart + day
end

local function setLinkTooltip(link)
    if not isChipLink(link) then
        GameTooltip:SetHyperlink(link)
        return true
    end
    local kind, payload = link:match("^" .. CHIP_PREFIX .. "([^:]+):(.+)$")
    if kind == "money" then
        local copper = payload:match("^%d+$") and tonumber(payload)
        if not isCopper(copper) then return end
        GameTooltip:SetText(copper == 0 and "0c" or "Price")
        if not pcall(SetTooltipMoney, GameTooltip, copper, "STATIC") then
            GameTooltip:SetText(moneyDisplay(copper))
        end
        return true
    elseif kind == "date" then
        local day, today = calendarDay(payload), calendarDay(date(DATE_FORMAT))
        if not day or not today then return end
        local ago = today - day
        local span = ("%d day%s"):format(math.abs(ago), math.abs(ago) == 1 and "" or "s")
        GameTooltip:SetText(payload)
        GameTooltip:AddLine(ago == 0 and "Today" or (ago > 0 and span .. " ago" or "In " .. span))
        return true
    end
end

local function showLinkTooltip(self, link)
    if not GameTooltip or not isText(link) then return end
    if not pcall(GameTooltip.SetOwner, GameTooltip, self, "ANCHOR_CURSOR") then return end
    local ok, hasContent = pcall(setLinkTooltip, link)
    if ok and hasContent then
        pcall(GameTooltip.Show, GameTooltip)
    else
        hideLinkTooltip(self)
    end
end

local function clickLink(_, link, text, button)
    if isText(link) and not isChipLink(link) then pcall(SetItemRef, link, text, button) end
end

local function createWindow()
    frame = CreateFrame("Frame", "RosettaNotesFrame", UIParent, "BackdropTemplate")
    frame:SetSize(560, 380)
    local position = RosettaDB.notesPosition
    if type(position) == "table" and isFinite(position.x) and isFinite(position.y) then
        frame:SetPoint("CENTER", UIParent, "CENTER", position.x, position.y)
    else
        frame:SetPoint("CENTER")
    end
    frame:SetFrameStrata("DIALOG")
    frame:SetBackdrop({ bgFile = "Interface/Tooltips/UI-Tooltip-Background" })
    frame:SetBackdropColor(0.05, 0.05, 0.05, 0.95)
    frame:SetMovable(true)
    frame:SetClampedToScreen(true)
    frame:EnableMouse(true)
    frame:RegisterForDrag("LeftButton")
    frame:Hide()
    UISpecialFrames[#UISpecialFrames + 1] = frame:GetName()

    local moving
    local function finishDrag(self)
        if not moving then return end
        moving = false
        self:StopMovingOrSizing()
        -- The layout cache restores frames at login, before this window exists.
        local center = ns.U.pack(self.GetCenter, self)
        local origin = ns.U.pack(UIParent.GetCenter, UIParent)
        if center and isFinite(center[1]) and isFinite(center[2])
            and origin and isFinite(origin[1]) and isFinite(origin[2]) then
            RosettaDB.notesPosition = { x = center[1] - origin[1], y = center[2] - origin[2] }
        end
    end
    frame:SetScript("OnDragStart", function(self)
        self:StartMoving()
        moving = true
    end)
    frame:SetScript("OnDragStop", finishDrag)

    local title = frame:CreateFontString(nil, "ARTWORK", "GameFontHighlight")
    title:SetPoint("TOP", 0, -12)
    title:SetText("Rosetta Notes")

    local close = CreateFrame("Button", nil, frame, "UIPanelCloseButton")
    close:SetPoint("TOPRIGHT", -3, -3)
    close:SetScript("OnClick", function() frame:Hide() end)

    listScroll = CreateFrame("ScrollFrame", "RosettaNotesListScrollFrame", frame, "UIPanelScrollFrameTemplate")
    listScroll:SetPoint("TOPLEFT", 12, -36)
    listScroll:SetSize(130, 300)
    listContent = CreateFrame("Frame", nil, listScroll)
    listContent:SetSize(130, 1)
    listScroll:SetScrollChild(listContent)

    editorScroll = CreateFrame("ScrollFrame", "RosettaNotesEditorScrollFrame", frame, "UIPanelScrollFrameTemplate")
    editorScroll:SetPoint("TOPLEFT", 169, -36)
    editorScroll:SetPoint("BOTTOMRIGHT", -32, 12)
    editorScroll:EnableMouse(true)
    editorScroll:SetScript("OnMouseDown", function(_, button)
        if button == "LeftButton" then edit:SetFocus() end
    end)
    edit = CreateFrame("EditBox", nil, editorScroll)
    edit:SetMultiLine(true)
    edit:SetAutoFocus(false)
    edit:EnableMouse(true)
    edit:SetFontObject(ChatFontNormal)
    edit:SetMaxLetters(0)
    edit:SetWidth(359)
    edit:SetScript("OnEscapePressed", function() frame:Hide() end)
    edit:SetScript("OnTextChanged", function(_, userInput)
        if userInput then saveEdit(true) end
    end)
    edit:SetScript("OnCursorChanged", function(_, _, y, _, height)
        if not isFinite(y) or not isFinite(height) then return end
        local top = -y
        local offset, viewport = editorScroll:GetVerticalScroll(), editorScroll:GetHeight()
        local target = math.max(top + height - viewport, math.min(offset, top))
        if target ~= offset then
            editorScroll:SetVerticalScroll(math.max(0, math.min(target, editorScroll:GetVerticalScrollRange())))
        end
    end)
    editorScroll:SetScrollChild(edit)
    if pcall(edit.SetHyperlinksEnabled, edit, true) then
        pcall(edit.SetScript, edit, "OnHyperlinkEnter", showLinkTooltip)
        pcall(edit.SetScript, edit, "OnHyperlinkLeave", hideLinkTooltip)
        pcall(edit.SetScript, edit, "OnHyperlinkClick", clickLink)
    end
    frame:SetScript("OnHide", function(self)
        edit:ClearFocus()
        hideLinkTooltip(edit)
        finishDrag(self)
    end)

    local new = CreateFrame("Button", nil, frame, "UIPanelButtonTemplate")
    new:SetSize(70, 22)
    new:SetPoint("BOTTOMLEFT", 12, 12)
    new:SetText("New")
    new:SetScript("OnClick", function()
        notes.create()
        refreshEditor()
        listScroll:SetVerticalScroll(0)
        edit:SetFocus()
    end)

    StaticPopupDialogs[DELETE_POPUP] = {
        text = 'Delete "%s"?',
        button1 = "Delete",
        button2 = "Cancel",
        OnAccept = function(_, id)
            notes.delete(id)
            refreshEditor()
        end,
        timeout = 0,
        whileDead = true,
        hideOnEscape = true,
    }
    deleteButton = CreateFrame("Button", nil, frame, "UIPanelButtonTemplate")
    deleteButton:SetSize(70, 22)
    deleteButton:SetPoint("LEFT", new, "RIGHT", 8, 0)
    deleteButton:SetText("Delete")
    deleteButton:SetScript("OnClick", function()
        if editingNote then StaticPopup_Show(DELETE_POPUP, displayTitle(editingNote), nil, editingNote.id) end
    end)
end

local function noteCommand(msg)
    if msg ~= nil and not isText(msg) then return end
    local note = notes.append(msg)
    if note then
        print('|cff33ff99Rosetta|r Added a line to "' .. displayTitle(note) .. '".')
        if frame and frame:IsShown() then refreshEditor(true) end
    elseif frame and frame:IsShown() then
        frame:Hide()
    else
        notes.ensureStore()
        if not frame then createWindow() end
        frame:Show()
        refreshEditor()
    end
end

ns.noteCommand = noteCommand
SLASH_ROSETTANOTE1 = "/rn"
SlashCmdList.ROSETTANOTE = noteCommand

local function insertLink(link)
    if edit and frame:IsShown() and isText(link) and ns.U.get(edit.HasFocus, edit)
        and pcall(edit.Insert, edit, link) then
        -- Programmatic insertion may report userInput as false.
        saveEdit()
    end
end

if type(hooksecurefunc) == "function" then
    -- Some clients' legacy function calls the modern one.
    if type(ChatFrameUtil) == "table" and type(ChatFrameUtil.InsertLink) == "function" then
        pcall(hooksecurefunc, ChatFrameUtil, "InsertLink", insertLink)
    elseif type(ChatEdit_InsertLink) == "function" then
        pcall(hooksecurefunc, "ChatEdit_InsertLink", insertLink)
    end
end
