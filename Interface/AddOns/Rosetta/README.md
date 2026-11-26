# Rosetta

Version 1.5.0

Exports the logged-in character's data to the account SavedVariables file
`WTF/Account/<account>/SavedVariables/Rosetta.lua`, under `RosettaDB.characters["<Name>-<Realm>"]`.

## Sections

| Section | Contents | Refreshed on |
| --- | --- | --- |
| `info` | level, XP, rested XP, money, zone, hearth, guild | XP, money, zone, rest events |
| `stats` | primary stats, armor, AP, crit, hit, spell power, resistances | stat and equipment events |
| `equipment` | equipped items with item stats and durability | equipment changes |
| `bags` | every bag slot; quest items list the quests they start or serve (via QuestieDB) | `BAG_UPDATE_DELAYED` |
| `bank` | bank slots | only while the bank is open |
| `talents` | talent tabs, ranks, unspent points | talent point changes |
| `spells` | spellbook | `SPELLS_CHANGED` |
| `skills` | professions, weapon skills, languages | skill changes |
| `recipes` | known recipes per profession | only while a profession window is open |
| `quests` | quest log with objectives | quest log events |
| `completedQuests` | sorted completed quest IDs | quest turn-in |
| `reputation` | factions and standing | `UPDATE_FACTION` |
| `guide` | current RestedXP guide steps and current step | login and logout |
| `journal` | recent character events, time and XP totals by map cell | gameplay events and position samples |
| `summary` | compact journey export for the Azeroth Atlas | `/rosetta export`, `/reload`, and logout |
| `maps` | each zone's rectangle on its continent map and its world corners (for the lore atlas) | login |
| `notes` | account-wide notes shared by all characters | edits and slash appends |

Each snapshot section is rebuilt only when one of its events fires, at most once per second (`DEBOUNCE_SECONDS` in `Core.lua`).
A section that fails stores its error in `errors.<section>`; `costMs.<section>` records the last rebuild time.

The journal records this character's activity while you play. It appends position,
travel, quest, level, death, and honorable kill events, retaining up to 200,000
entries. Trimming removes the oldest position samples first and removes older
milestones only when position samples cannot cover the overflow. Running totals
track time, quest XP, estimated kill XP and kills, and
other XP in each 5% map cell. The journal uses no combat log or other players' names.

The [v1 journey summary](SUMMARY.md) packages character details, zones, the route,
cells, subzone labels, and quest, death, and level-up milestones into an `RSJ1.`
copy string. It targets 60 KB for a level-60 character. Above 120 KB, Rosetta
reports the labels and low-activity cells it drops from the export.

With QuestieDB loaded, Rosetta looks up completed quests missing from the journal
in small batches. It caches finisher lookups and marks backfilled turn-ins with
`b` and an empty time. Journal status counts quests whose finisher could not be
located.

## Use

- Data reaches disk only on `/reload`, logout, or exit.
- `/rosetta` opens the info page (also under Options > AddOns > Rosetta): export status per section.
- `/rosetta snap` (or `/csnap`) rebuilds the snapshot sections and prints per-section cost and errors.
- `/rosetta export`, or the shortcut `/rx`, opens the selected copy string. A key can be bound under Key Bindings > AddOns > Rosetta. Ctrl+C (Cmd+C on a Mac) copies it and closes the window; paste it into the Azeroth Atlas.
- `/rosetta journal off` and `/rosetta journal on` pause and resume recording.
- `/rosetta journal status` (or `/rosetta journal`) shows the journal's event count, cell count, recording state, estimated SavedVariables size, and backfill skip count.
- Open the bank and each profession window once to capture `bank` and `recipes`.
- Read the file as JSON: `python3 tools/sv_to_json.py WTF/Account/<account>/SavedVariables/Rosetta.lua RosettaDB`.

To add a section, call `collector(name, events, collect, onLogout)` in `Collectors.lua`.
Set `onLogout` only for a section with no refresh event: on a real logout most game APIs already return empty values.

## Notes

Use `/rn` or `/rosetta note` to toggle the notes window. Add text after either
command to append a line to the selected note, creating one if needed. With the
editor focused, shift-click an item, spell, recipe, or quest to insert its link
at the cursor. Notes are stored in `RosettaDB.notes` in the account SavedVariables
file, so they follow all characters and sync with that file between computers.
