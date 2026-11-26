# Azeroth Atlas

The Azeroth Atlas is a map-first lore companion for World of Warcraft. Explore
continents, zones, and their stories, then overlay your character's journey from
WoW: Forever. [Open the Azeroth Atlas](https://shengjiex98.github.io/azeroth-atlas/).

## Load your journey

1. Copy the `Rosetta` folder from this repository into your WoW: Forever client's
   `Interface/AddOns/` folder. The installed addon should be at
   `Interface/AddOns/Rosetta/`.
2. Play with Rosetta enabled. When you want to see your journey, run
   `/rosetta export` in game and press Ctrl+C (Cmd+C on a Mac) to copy the full `RSJ1.` summary.
3. Open the atlas, choose **Your journey**, paste the summary, and select **Load**.
   If a journey is already loaded, choose **Load another summary** in the journey
   card. You can also open
   `https://shengjiex98.github.io/azeroth-atlas/atlas/#/ek?j=<string>` with the
   full summary in place of `<string>`.

The atlas builds the journey and stores the summary in your browser. Use the
character picker to switch journeys or **Remove** to delete the selected summary.

## Rosetta commands

| Command | What it does |
| --- | --- |
| `/rosetta` | Opens the addon info page and shows export status. |
| `/rosetta snap` or `/csnap` | Rebuilds the character snapshot and prints timing and errors. |
| `/rosetta export` or `/rx` | Opens the journey summary for copying (or bind a key under Key Bindings > AddOns > Rosetta); Ctrl+C (Cmd+C on a Mac) copies it and closes the window. |
| `/rosetta journal off` or `/rosetta journal on` | Pauses or resumes journey recording. |
| `/rosetta journal status` or `/rosetta journal` | Shows the journal status. |

For details on SavedVariables, backfill, and snapshot sections, see the
[Rosetta README](Interface/AddOns/Rosetta/README.md).

## Develop locally

Open `lore/index.html` in a browser. The site has no build step. From the
repository root, run these checks with Node.js and Lua 5.1 installed.

```sh
set -e
node tests/atlas/journey_test.mjs
for file in lore/atlas/*.js; do node --check "$file"; done
for file in tests/rosetta/*_test.lua; do lua5.1 "$file"; done
luac5.1 -p Interface/AddOns/Rosetta/*.lua
```

Regenerate the map geometry from the bundled data with Python 3.

```sh
python3 tools/atlas_geo.py > lore/atlas/data/geo.js
```

To retrace the zone outlines, run `uv run tools/atlas_shapes.py` before
regenerating the geometry.

## Quest chain candidates

Run the offline ranking with Python 3.11+ and Lua 5.1.

```sh
python3 tools/atlas_chains.py --json tools/.cache/candidates.json
python3 tools/atlas_chains.py --journey /path/to/Rosetta.lua --character Lancet
```

The first run downloads QuestieDB v1.1.6 Forever and its matching emulator into
`tools/.cache/`. Later runs use that cache. The table goes to stdout. For a
saved `RSJ1.` summary, pass its file to `--journey`. Summaries contain completed
quests. SavedVariables also include the active quest log. Touched chains sort
first. Any completed variant finishes its step, and progress counts finished
steps out of all steps in the chain.

Repeatable and periodic quests are excluded. Links stay within the same class
mask and profession. Class and profession candidates are labeled in the table.
A prerequisite list of three or more alternatives becomes an entry note in JSON.
Starter-zone prerequisites for Camping also become entry notes, so Camping
variants leave the starter chains separate.

The score gives three points per step, one per UiMap (up to ten), and three
per continent beyond the first. Elite, rare-elite and boss objective NPCs earn
one, two and three points respectively (up to ten combined). It counts distinct
kill targets and counts item droppers only when there are at most three and
their spawns belong to the representative cluster. Steps with an instance
objective earn two points, and raid-flagged steps earn one (up to ten combined).
Ties use the first quest ID.

Chains picked for the atlas are listed in `tools/data/chain_picks.json`, keyed by
first quest, with the reason for each pick. The table's Pick column names them.

Only representative points contribute maps, continents and instance locations.
Points use Forever UiMaps and integer coordinates from 0 to 1000. The tool
chooses the map with the most spawns, then the centroid of the largest cluster
formed by spawns within five percentage points of each other. An instance
entrance can stand in for an unmappable interior marker and is labeled in JSON.
The JSON also includes party-accept flags, reward item IDs, prerequisite
alternatives and optional breadcrumbs. QuestieDB supplies no reward item
quality or group-size field.

## Repository layout

- `lore/` contains the static site, map images, illustrations, and
  [design notes](lore/DESIGN.md).
- `Interface/AddOns/Rosetta/` contains the addon and the canonical
  [journey summary format](Interface/AddOns/Rosetta/SUMMARY.md).
- `tests/` contains the Node.js atlas tests and Lua addon tests.
- `tools/` contains map data, geometry scripts, and SavedVariables utilities.

## License

The project's code and documentation use the [MIT License](LICENSE). World of
Warcraft maps, icons, and artwork in `lore/maps/` and `lore/img/` belong to
Blizzard Entertainment and are excluded from the MIT license. This is an
unofficial fan project.
