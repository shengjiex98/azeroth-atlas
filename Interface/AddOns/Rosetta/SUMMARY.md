# Rosetta journey summary, format v1

The summary is the only contract between Rosetta (in game) and the Azeroth Atlas (a static site). Rosetta
keeps the full journal locally and writes this compact summary; the atlas builds its journey layer from it.

## Encoding

- Transport string: `RSJ1.` followed by base64url (RFC 4648 §5, no padding) of the UTF-8 text below.
  No compression in v1. URL-safe, so it can also travel in a link fragment (`#j=<string>`).
- Text: one record per line (`\n`), fields separated by `|`. A field never contains `|` or a newline
  (Rosetta strips them). An empty field means unknown.
- Coordinates: integers 0-1000 in the frame of the UiMap given in the record (same as the journal).
- Times: Unix epoch seconds.
- Decoders ignore unknown record types and extra trailing fields, so later versions can add both.

## Records

| Type | Fields after the type | Meaning |
|---|---|---|
| `H` | `1`, name, realm, race, class, faction, level, exportedAt, rosettaVersion | Header, first line, exactly once. `1` is the format version. |
| `Z` | map, firstVisit, seconds, quests, kills, deaths, minLevel, maxLevel | One per zone (UiMap) with any activity. |
| `C` | map, cx, cy, seconds, killXP, kills, questXP, otherXP, firstSeen | One journal cell: a 5% grid square, `cx`/`cy` 0-19. `firstSeen` may be empty for cells recorded before v1. |
| `Q` | t, map, x, y, questID, flags | A quest turned in. Flag `b`: backfilled from QuestieDB (no time; position is the finisher's spawn). |
| `D` | t, map, x, y, level | A death. |
| `L` | t, map, x, y, level | A level-up. |
| `S` | map, cx, cy, name | The most frequent subzone name recorded in that cell (a place label). |
| `R` | map:t, map:t, ... (one field, comma-separated pairs) | Zone visit sequence from the journal, consecutive repeats collapsed. `t` may be empty for backfilled visits. |

Order: `H` first; then `Z`, `R`, `C`, `S`; then `Q`, `D`, `L` by time. Backfilled `Q` lines (no time) come
before timed ones, ordered by quest level, then quest ID.

## Size

Target at most 60 KB for the transport string of a level-60 character. If a summary would exceed 120 KB,
drop `S` lines first, then `C` lines with fewer than 30 seconds and no XP, and report it.
