#!/usr/bin/env python3
"""Save the game's own map geometry from Rosetta's `maps` section.

Usage: maps_export.py ROSETTA_LUA > tools/data/forever_maps.json

Writes, per zone UiMapID: name, continent, rect (left, top, right, bottom as fractions of the continent
map) and bounds in the same order as ui_map_bounds.json (minX, minY, maxX, maxY world yards).
tools/frames.py and tools/atlas_geo.py prefer this file over the Classic bounds when it exists.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from sv_to_json import Parser  # noqa: E402


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    db = Parser(Path(sys.argv[1]).read_bytes()).file()["RosettaDB"]
    zones = {}
    for rec in (db.get("characters") or {}).values():
        for z in rec.get("maps") or []:
            tl, br = z.get("topLeft"), z.get("bottomRight")
            entry = {"name": z.get("name"), "continent": z.get("continent"), "rect": z.get("rect")}
            if tl and br:
                # GetWorldPosFromMapPos returns world (x, y) with x pointing north; the map's top-left
                # corner is the north-west extreme, so it holds max x and max y.
                entry["bounds"] = [br[0], br[1], tl[0], tl[1]]
            zones[str(z["id"])] = entry
    json.dump({"_source": "Rosetta maps export (C_Map in the WoW: Forever client).", "zones": zones},
              sys.stdout, indent=1, sort_keys=True)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
