local ADDON_PATH = "Interface/AddOns/Rosetta/"
local now = 1700000000
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
function frameMethods:SetCursorPosition(cursor) self.cursor = cursor end
function frameMethods:GetText() return self.text end
function frameMethods:SetText(text, userInput)
    self.text = text
    if self.scripts.OnTextChanged then self.scripts.OnTextChanged(self, userInput or false) end
end
function frameMethods:Insert(text)
    self.insertions = (self.insertions or 0) + 1
    local cursor = self.cursor or 0
    self:SetText(self.text:sub(1, cursor) .. text .. self.text:sub(cursor + 1))
    self.cursor = cursor + #text
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
function GameTooltip:Show() self.shown = true end
function GameTooltip:Hide() self.owner, self.link, self.shown = nil, nil, false end

function StaticPopup_Show(which, title, _, data)
    popup = { which = which, title = title, data = data }
end
function time() return now end
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

SlashCmdList.ROSETTANOTE(link .. " Sells for 30s")
local store = RosettaDB.notes
local first = store.list[1]
eq(first.text, link .. " Sells for 30s", "append creates a note and preserves the link")
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
SlashCmdList.ROSETTA("  NoTe " .. link .. " Price CHECK ")
eq(first.text, link .. " Sells for 30s\n" .. link .. " Price CHECK ", "/rosetta preserves append text")
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
ChatFrameUtil.InsertLink(link)
eq(edit.insertions, 1, "closed editor ignores links")
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
