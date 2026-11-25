"""Map frames: convert world coordinates into the frame of Forever's map images (lore/maps).

The images are Wowhead's Forever ("classicplus") maps, so coordinates the game reports (Rosetta) are
already in this frame. World coordinates (RestedXP guide text) go through the Classic Era map bounds in
data/ui_map_bounds.json, which match Forever for every zone checked except two: Forever's Redridge map is
shifted, and Stormwind is a different map, fitted from Rosetta guide exports (map% = slope * world + intercept).
"""

import json
from pathlib import Path

DATA = Path(__file__).parent / "data"
BOUNDS = json.loads((DATA / "ui_map_bounds.json").read_text())["maps"]
CLASSIC_X_SHIFT = {1433: -5.09}
FOREVER_FIT = {1453: (-0.05755382, 99.16063594, -0.08633045, -690.28360902)}
# The game's own bounds (tools/maps_export.py), when exported, replace the Classic bounds and the fixes.
_EXPORT = DATA / "forever_maps.json"
FOREVER_BOUNDS = {k: v["bounds"] for k, v in json.loads(_EXPORT.read_text())["zones"].items() if v.get("bounds")} \
    if _EXPORT.exists() else {}


def world_to_map(zone: int, wy: float, wx: float):
    """World coordinates (the guide's .goto order: y, then x) as [x%, y%] of the zone's Forever map."""
    if str(zone) in FOREVER_BOUNDS:
        min_x, min_y, max_x, max_y = FOREVER_BOUNDS[str(zone)]
        return [(max_y - wy) / (max_y - min_y) * 100, (max_x - wx) / (max_x - min_x) * 100]
    if zone in FOREVER_FIT:
        sx, ix, sy, iy = FOREVER_FIT[zone]
        return [sx * wy + ix, sy * wx + iy]
    b = BOUNDS.get(str(zone))
    if not b:
        return None
    min_x, min_y, max_x, max_y = b
    return [(max_y - wy) / (max_y - min_y) * 100 + CLASSIC_X_SHIFT.get(zone, 0), (max_x - wx) / (max_x - min_x) * 100]


def classic_to_map(zone: int, x: float, y: float):
    """A Classic map coordinate (e.g. from Wowhead Classic) in the Forever frame."""
    if zone in FOREVER_FIT and str(zone) in BOUNDS:
        min_x, min_y, max_x, max_y = BOUNDS[str(zone)]
        return world_to_map(zone, max_y - x / 100 * (max_y - min_y), max_x - y / 100 * (max_x - min_x))
    return [x + CLASSIC_X_SHIFT.get(zone, 0), y]
