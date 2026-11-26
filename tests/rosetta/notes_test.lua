local ADDON_PATH = "Interface/AddOns/Rosetta/"
local now = 1700000000
local localDay = "2026-11-26"
local report = print
local frames, hooks, messages, popup
local rejectHyperlinks = false
local secret = "secret text"

local function eq(actual, expected, label)
    if actual ~= expected then
        error(("%s: expected %s, got %s"):format(label, tostring(expected), tostring(actual)), 2)
    end
end

local frameMethods = {}
for _, method in ipairs({
    "RegisterEvent", "SetJustifyH", "SetJustifyV", "SetSpacing", "SetWordWrap", "SetMaxLines",
    "SetBackdrop", "SetBackdropColor", "SetClampedToScreen", "EnableMouse", "RegisterForDrag",
    "SetAutoFocus", "SetHighlightTexture", "SetFontObject", "StartMoving", "StopMovingOrSizing",
}) do
    frameMethods[method] = function() end
end

function frameMethods:SetScript(event, callback) self.scripts[event] = callback end
function frameMethods:SetSize(width, height) self.width, self.height = width, height end
function frameMethods:SetWidth(width) self.width = width end
function frameMethods:SetHeight(height) self.height = height end
function frameMethods:GetHeight() return self.height or 332 end
function frameMethods:SetPoint(...) self.point = { ... } end
function frameMethods:SetFrameStrata(strata) self.strata = strata end
function frameMethods:SetMovable(movable) self.movable = movable end
function frameMethods:GetName() return self.name end
function frameMethods:GetCenter() return self.x, self.y end
function frameMethods:SetScrollChild(child) self.child = child end
function frameMethods:SetVerticalScroll(offset) self.scroll = offset end
function frameMethods:GetVerticalScroll() return self.scroll or 0 end
function frameMethods:GetVerticalScrollRange() return 800 end
function frameMethods:SetMultiLine(multiline) self.multiline = multiline end
function frameMethods:SetMaxLetters(maxLetters) self.maxLetters = maxLetters end
function frameMethods:SetCursorPosition(cursor)
    self.cursor, self.highlightStart, self.highlightStop = cursor, nil, nil
end
function frameMethods:GetCursorPosition() return self.cursor or 0 end
function frameMethods:HighlightText(start, stop)
    self.highlightStart, self.highlightStop = start, stop
    self.lastHighlight = { start, stop }
end
function frameMethods:GetText() return self.text end
function frameMethods:SetText(text, userInput)
    self.text = text
    if self.scripts.OnTextChanged then self.scripts.OnTextChanged(self, userInput or false) end
end
function frameMethods:Insert(text)
    self.insertions = (self.insertions or 0) + 1
    local start = self.highlightStart or self:GetCursorPosition()
    local stop = self.highlightStop or start
    self:SetCursorPosition(start + #text)
    self:SetText(self.text:sub(1, start) .. text .. self.text:sub(stop + 1), self.insertIsUserInput)
end
function frameMethods:SetFocus() self.focus = true end
function frameMethods:ClearFocus() self.focus = false end
function frameMethods:HasFocus() return self.focus end
function frameMethods:SetEnabled(enabled) self.enabled = enabled end
function frameMethods:LockHighlight() self.highlighted = true end
function frameMethods:UnlockHighlight() self.highlighted = false end
function frameMethods:Show() self.shown = true end
function frameMethods:IsShown() return self.shown end
function frameMethods:Hide()
    self.shown = false
    if self.scripts.OnHide then self.scripts.OnHide(self) end
end
function frameMethods:SetHyperlinksEnabled(enabled)
    if rejectHyperlinks then error("unsupported") end
    self.hyperlinks = enabled
end
function frameMethods:CreateFontString()
    self.label = setmetatable({ scripts = {} }, { __index = frameMethods })
    return self.label
end

function CreateFrame(kind, name, parent)
    local frame = setmetatable({
        kind = kind, name = name, parent = parent, shown = true, scripts = {},
    }, { __index = frameMethods })
    frames[#frames + 1] = frame
    return frame
end

UIParent = { GetCenter = function() return 600, 400 end }
GameTooltip = {}
function GameTooltip:SetOwner(owner) self.owner = owner end
function GameTooltip:IsOwned(owner) return self.owner == owner end
function GameTooltip:SetHyperlink(link)
    if link == "invalid" then error("unknown hyperlink") end
    self.link = link
end
function GameTooltip:SetText(text) self.text, self.line, self.money = text, nil, nil end
function GameTooltip:AddLine(line) self.line = line end
function GameTooltip:Show() self.shown = true end
function GameTooltip:Hide() self.owner, self.link, self.shown = nil, nil, false end

function StaticPopup_Show(which, title, _, data)
    popup = { which = which, title = title, data = data }
end
function time() return now end
function date(format, timestamp)
    eq(format, "%Y-%m-%d", "local date format")
    if timestamp then
        eq(timestamp, now, "explicit date timestamp")
        return "2023-11-14"
    end
    return localDay
end
function issecretvalue(value) return value == secret end
function strtrim(text) return text:match("^%s*(.-)%s*$") end
function print(message) messages[#messages + 1] = message end

local function secureHook(target, method, callback)
    if type(target) == "string" then
        target, method, callback = _G, target, method
    end
    hooks[#hooks + 1] = method
    local original = target[method]
    target[method] = function(...)
        local result = original(...)
        callback(...)
        return result
    end
end

local function loadAddon(linkAPI)
    frames, hooks, messages, popup = {}, {}, {}, nil
    SlashCmdList, UISpecialFrames, StaticPopupDialogs = {}, {}, {}
    hooksecurefunc = secureHook
    ChatFrameUtil, ChatEdit_InsertLink = nil, nil
    if linkAPI == "modern" then
        ChatFrameUtil = { InsertLink = function() return false end }
        ChatEdit_InsertLink = function(link) return ChatFrameUtil.InsertLink(link) end
    elseif linkAPI == "legacy" then
        ChatFrameUtil = {}
        ChatEdit_InsertLink = function() return false end
    end
    local ns = {}
    for line in io.lines(ADDON_PATH .. "Rosetta.toc") do
        local file = line:match("^(%S+%.lua)%s*$")
        if file then assert(loadfile(ADDON_PATH .. file))("Rosetta", ns) end
    end
    return ns.notes
end

local function findFrame(name)
    for _, frame in ipairs(frames) do
        if frame.name == name or frame.kind == name or frame.text == name then return frame end
    end
end

local link = "|cff1eff00|Hitem:2589:0:0|h[Linen Cloth]|h|r"
local notes = loadAddon("modern")
eq(RosettaDB, nil, "load defers note storage")
eq(findFrame("RosettaNotesFrame"), nil, "load defers window creation")
eq(SLASH_ROSETTANOTE1, "/rn", "slash registration")
eq(notes.title("\n \r\n" .. link .. "\n30s"), "[Linen Cloth]", "link title")
eq(notes.title("|cFFFF0000Red|r |cnGREEN_FONT_COLOR:Green|r"), "Red Green", "color codes")
eq(notes.title("||r is literal"), "|r is literal", "escaped pipe")
eq(notes.title("\n\t\n|A:icon:1:1|a|cFFFFFFFF|r"), "New note", "empty visible title")
eq(notes.title(""), "New note", "empty note title")
report("PASS lazy load and titles")

local validPrices = { ["5c"] = 5, ["30s"] = 3000, ["1g"] = 10000, ["1g20s"] = 12000,
    ["2g5c"] = 20005, ["1G20S5C"] = 12005, ["2s5c"] = 205, ["0g00s0c"] = 0, ["99s99c"] = 9999 }
for token, copper in pairs(validPrices) do eq(notes.parseMoney(token), copper, token .. " parsed") end
for _, token in ipairs({ "", "5sec", "x30s", "30s,", "150s", "100c", "1s100c", "1s2g", "1g2g",
    "5c20s", "1g20s5c5c", "1g20", "5", "g", "1g 20s", "-5c", "1.5g", "900719925474g9s92c" }) do
    eq(notes.parseMoney(token), nil, token .. " rejected")
end

local function money(copper, display)
    return "|cffffd100|Haddon:Rosetta:money:" .. copper .. "|h" .. display .. "|h|r"
end
local function dayChip(day)
    return "|cff66bbff|Haddon:Rosetta:date:" .. day .. "|h" .. day .. "|h|r"
end

eq(notes.moneyChip(12005), money(12005, "1g 20s 5c"), "money chip format")
eq(notes.moneyChip(20005), money(20005, "2g 5c"), "zero units omitted")
eq(notes.moneyChip(0), money(0, "0c"), "zero price chip")
eq(notes.moneyChip(9007199254740991), money("9007199254740991", "900719925474g 9s 91c"), "large payload stays exact")
eq(notes.dateChip(now), dayChip("2023-11-14"), "date chip from timestamp")
eq(notes.dateChip(), dayChip(localDay), "date chip from stubbed local date")

local protected = "|cff1eff00|Hitem:2589:0:0|h[Linen 30s @today ||h 5c roll]|h|r"
local mixed = protected .. " 5c. 30S, 1g; 2g5c)\n@TODAY 1g20s5c"
local expanded = protected .. " " .. money(5, "5c") .. ". " .. money(3000, "30s") .. ", "
    .. money(10000, "1g") .. "; " .. money(20005, "2g 5c") .. ")\n" .. dayChip(localDay) .. " "
    .. money(12005, "1g 20s 5c")
eq(notes.expandText(mixed), expanded, "punctuation, case, end token and protected links")
local invalid = "x30s 5sec (30s) 30s! 30s,cost 150s @yesterday x@today " .. protected .. "30s"
eq(notes.expandText(invalid), invalid, "attached characters and unsupported tokens stay literal")
localDay = "2026-11-27"
eq(notes.expandText(expanded), expanded, "existing chips are unchanged on a later date")
localDay = "2026-11-26"

local prefix = "Café " .. protected .. "\n"
local start, stop, chip = notes.editChipAtCursor(prefix .. "30s, rest", #prefix + 4)
eq(start, #prefix, "selection start counts UTF-8 bytes and link escapes")
eq(stop, #prefix + 3, "selection excludes trailing punctuation")
eq(chip, money(3000, "30s"), "detected price chip")
start, stop, chip = notes.editChipAtCursor("@ToDaY\nnext", 7)
eq(start, 0, "first token starts at byte offset zero")
eq(stop, 6, "selection excludes newline")
eq(chip, dayChip(localDay), "detected local date chip")
start, stop = notes.editChipAtCursor("30s\r\n", 5)
eq(start, 0, "CRLF token start")
eq(stop, 3, "selection excludes both newline bytes")
eq(notes.editChipAtCursor(protected, protected:find("30s ", 1, true) + 3), nil, "delimiter inside a link ignored")
eq(notes.editChipAtCursor("30s", 3), nil, "editor waits for delimiter")
eq(notes.editChipAtCursor("30s,extra", 4), nil, "punctuation in the middle of a token ignored")
report("PASS chip syntax, formats, expansion and byte spans")

SlashCmdList.ROSETTANOTE(link .. " Sells for 30s")
local store = RosettaDB.notes
local first = store.list[1]
local firstLine = link .. " Sells for " .. money(3000, "30s")
eq(first.text, firstLine, "append creates a note with a chip at the end and preserves the item link")
eq(store.selected, first.id, "new note selected")
eq(first.created, now, "creation timestamp")
eq(#messages, 1, "one confirmation")
assert(messages[1]:find('"[Linen Cloth] Sells for 30s"', 1, true), "confirmation names the note")
eq(findFrame("RosettaNotesFrame"), nil, "append defers window creation")

now = now + 1
local second = notes.create()
notes.append("Second")
store.selected = first.id
now = now + 1
SlashCmdList.ROSETTA("  NoTe " .. link .. " Price CHECK @TODAY ")
eq(first.text, firstLine .. "\n" .. link .. " Price CHECK " .. dayChip(localDay) .. " ",
    "/rosetta expands the date and preserves append text")
eq(first.updated, now, "append updates timestamp")
eq(second.text, "Second", "append edits the selected note")
eq(notes.sortedList()[1], first, "most recently updated note first")
eq(store.list[1], first, "sorting preserves stored order")
notes.delete(second.id)
eq(store.selected, first.id, "deleting another note preserves selection")
local fallback = notes.create()
store.selected = first.id
notes.delete(first.id)
eq(store.selected, fallback.id, "deleting selected note selects the newest remaining")
notes.delete(fallback.id)
eq(store.selected, nil, "deleting last note clears selection")
report("PASS slash append, sorting and deletion")

RosettaDB = { notes = true, characters = { Test = {} } }
eq(#notes.ensureStore().list, 0, "non-table store recovered")
assert(RosettaDB.characters.Test, "unrelated SavedVariables preserved")
RosettaDB.notes = { list = "not a list", selected = 5 }
eq(notes.ensureStore().selected, nil, "invalid list and selection recovered")
RosettaDB.notes = {
    selected = 999, nextId = 2,
    list = {
        [1] = { id = 7, text = "Keep me", created = now - 2, updated = now - 1 },
        [3] = "invalid row",
        [5] = { id = 7, text = "duplicate" },
        [8] = { id = 9, text = false, created = "invalid", updated = math.huge },
        [10] = { id = 3.5, text = "invalid ID" },
    },
}
store = notes.ensureStore()
eq(#store.list, 2, "keeps recoverable rows across holes")
eq(store.list[1].text, "Keep me", "keeps the first entry with a duplicate ID")
eq(store.list[2].text, "", "recovers a missing text field")
eq(store.list[2].updated, now, "recovers invalid timestamps")
eq(store.selected, 9, "repairs stale selection")
eq(notes.create().id, 10, "repaired ID counter does not collide")
report("PASS malformed SavedVariables recovery")

RosettaDB.notes = nil
SlashCmdList.ROSETTA("NOTE")
local window = assert(findFrame("RosettaNotesFrame"))
local edit = assert(findFrame("EditBox"))
local scroll = assert(findFrame("RosettaNotesEditorScrollFrame"))
assert(window.shown and window.movable and edit.multiline, "notes window opens")
eq(window.strata, "DIALOG", "dialog strata")
eq(UISpecialFrames[1], window.name, "Escape registration")
eq(edit.maxLetters, 0, "no letter limit")
eq(findFrame("Delete").enabled, false, "delete disabled for an empty list")
scroll.scripts.OnMouseDown(scroll, "LeftButton")
assert(edit.focus, "clicking below text focuses editor")
edit:SetText("AB", true)
store = RosettaDB.notes
first = store.list[1]
eq(first.text, "AB", "typing in the empty editor creates a note")
now = now + 1
edit:SetText("ABC")
eq(first.text, "AB", "programmatic text changes do not save")
edit:SetText("ABC", true)
eq(first.updated, now, "user edit updates timestamp")

eq(table.concat(hooks, ","), "InsertLink", "prefers one modern hook")
edit:SetCursorPosition(1)
ChatEdit_InsertLink(link)
eq(edit.insertions, 1, "wrapper inserts exactly once")
eq(first.text, "A" .. link .. "BC", "programmatic insertion saves at cursor")
edit:ClearFocus()
ChatFrameUtil.InsertLink(link)
eq(edit.insertions, 1, "unfocused editor ignores links")
edit:SetFocus()
ChatFrameUtil.InsertLink(secret)
eq(edit.insertions, 1, "secret link ignored")

assert(edit.hyperlinks, "optional hyperlink support enabled")
edit.scripts.OnHyperlinkEnter(edit, "item:2589")
eq(GameTooltip.link, "item:2589", "hover shows hyperlink tooltip")
assert(GameTooltip.shown, "hover shows the tooltip frame")
edit.scripts.OnHyperlinkLeave(edit)
eq(GameTooltip.link, nil, "leaving hides hyperlink tooltip")
edit.scripts.OnHyperlinkEnter(edit, "invalid")
eq(GameTooltip.owner, nil, "bad hyperlink skips tooltip")

local moneyLink = "addon:Rosetta:money:12005"
edit.scripts.OnHyperlinkEnter(edit, moneyLink)
eq(GameTooltip.text, "1g 20s 5c", "money tooltip falls back to the display")
assert(GameTooltip.shown, "fallback tooltip is shown")
function SetTooltipMoney(tooltip, copper, style)
    eq(style, "STATIC", "native money tooltip style")
    tooltip.money = copper
end
edit.scripts.OnHyperlinkEnter(edit, moneyLink)
eq(GameTooltip.money, 12005, "native tooltip receives copper")
function SetTooltipMoney() error("money tooltip unavailable") end
edit.scripts.OnHyperlinkEnter(edit, "addon:Rosetta:money:0")
eq(GameTooltip.text, "0c", "unavailable native tooltip keeps zero visible")
edit.scripts.OnHyperlinkEnter(edit, "addon:Rosetta:date:" .. localDay)
eq(GameTooltip.text, localDay, "date tooltip displays the stored day")
eq(GameTooltip.line, "Today", "today tooltip")
localDay = "2024-03-01"
edit.scripts.OnHyperlinkEnter(edit, "addon:Rosetta:date:2024-02-29")
eq(GameTooltip.line, "1 day ago", "day count across leap day")
edit.scripts.OnHyperlinkEnter(edit, "addon:Rosetta:date:2024-02-28")
eq(GameTooltip.line, "2 days ago", "plural day count")
localDay = "2026-11-26"

local clicked
function SetItemRef(linkData) clicked = linkData end
edit.scripts.OnHyperlinkClick(edit, moneyLink, "1g 20s 5c", "LeftButton")
eq(clicked, nil, "clicking a chip skips SetItemRef")
edit.scripts.OnHyperlinkClick(edit, "item:2589", "[Linen Cloth]", "LeftButton")
eq(clicked, "item:2589", "ordinary links use SetItemRef")

edit.insertIsUserInput = true
edit:SetCursorPosition(#prefix + 3)
edit:SetText(prefix .. "30s continued", true)
local beforeInsert = edit.insertions
edit:SetCursorPosition(#prefix + 4)
edit:SetText(prefix .. "30s, continued", true)
local price = money(3000, "30s")
eq(first.text, prefix .. price .. ", continued", "editor saves only the token replacement")
eq(edit.lastHighlight[1], #prefix, "selection begins after multibyte text and a link")
eq(edit.lastHighlight[2], #prefix + 3, "selection stops before the delimiter")
eq(edit.cursor, #prefix + #price, "cursor follows the inserted chip")
eq(edit.insertions, beforeInsert + 1, "nested text change inserts once")

edit:SetCursorPosition(6)
edit:SetText("@todayZZ", true)
edit:SetCursorPosition(7)
edit:SetText("@today\n", true)
eq(first.text, dayChip(localDay) .. "\n", "newline inserts date chip while replacing a selection")
edit:SetCursorPosition(5)
edit:SetText("30s  x", true)
edit:SetCursorPosition(4)
edit:SetText("30s x", true)
eq(first.text, "30s x", "deleting next to an existing space does not expand")

edit:SetCursorPosition(9)
edit:SetText("Price 30s", true)
local highlight = edit.HighlightText
function edit:HighlightText(start, stop) highlight(self, start - 1, stop) end
edit:SetCursorPosition(10)
edit:SetText("Price 30s ", true)
eq(edit.text, "Price 30s ", "client selection mismatch restores the typed text")
eq(first.text, edit.text, "client selection mismatch saves the typed text")
eq(edit.cursor, 10, "client selection mismatch restores the cursor")
edit.HighlightText, edit.insertIsUserInput = nil, nil
report("PASS chip tooltips, clicks, editor replacement and fallback")

local count = #messages
SlashCmdList.ROSETTANOTE("Visible Append")
eq(edit.text, first.text, "append refreshes the open editor")
eq(#messages, count + 1, "append while open prints one confirmation")
findFrame("New").scripts.OnClick()
eq(edit.text, "", "new note clears the editor")
local newId = store.selected
findFrame("Delete").scripts.OnClick()
eq(#store.list, 2, "delete waits for confirmation")
eq(popup.data, newId, "the prompt captures the note ID")
local list = findFrame("RosettaNotesListScrollFrame").child
for _, row in ipairs(frames) do
    if row.parent == list and row.noteId == first.id then
        row.scripts.OnClick(row)
        assert(row.highlighted, "clicked note is highlighted")
    end
end
StaticPopupDialogs[popup.which].OnAccept(nil, popup.data)
eq(#store.list, 1, "confirmation deletes the original note")
eq(store.selected, first.id, "confirmation preserves a different selection")
eq(edit.text, first.text, "confirmed deletion refreshes editor")

window.scripts.OnDragStart(window)
window.x, window.y = 640, 430
window.scripts.OnDragStop(window)
edit.scripts.OnEscapePressed()
assert(not window.shown and not edit.focus, "Escape closes the window and clears focus")
local beforeCloseLink = edit.insertions
ChatFrameUtil.InsertLink(link)
eq(edit.insertions, beforeCloseLink, "closed editor ignores links")
report("PASS editor, modern link hook, tooltip, selection and confirmation")

rejectHyperlinks = true
notes = loadAddon("legacy")
SlashCmdList.ROSETTANOTE("")
window = findFrame("RosettaNotesFrame")
edit = findFrame("EditBox")
eq(window.point[4], 40, "restored X offset")
eq(window.point[5], 30, "restored Y offset")
eq(edit.scripts.OnHyperlinkEnter, nil, "unsupported hyperlink API is skipped")
eq(table.concat(hooks, ","), "ChatEdit_InsertLink", "legacy hook fallback")
edit:SetFocus()
local quest = "|Hquest:33:1|h[Wolves Across the Border]|h"
ChatEdit_InsertLink(quest)
eq(edit.insertions, 1, "legacy path inserts once")
eq(edit.text, quest .. first.text, "legacy hook preserves non-item links")
SlashCmdList.ROSETTA("note  ")
assert(not window.shown, "either command can close the window")
loadAddon()
eq(#hooks, 0, "missing link APIs are harmless")
report("PASS position restoration, legacy link hook and optional APIs")
report("All Rosetta notes tests passed.")
