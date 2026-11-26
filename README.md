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
