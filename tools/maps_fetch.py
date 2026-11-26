# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow"]
# ///
"""Fetch the Forever zone maps into lore/maps.

Usage: uv run tools/maps_fetch.py [--cache DIR]

The optional cache contains original CDN JPEGs named by area ID.
"""

import argparse
from io import BytesIO
import json
from pathlib import Path
import sys
from tempfile import NamedTemporaryFile
from urllib.error import HTTPError
from urllib.request import urlopen

from PIL import Image, ImageChops, ImageStat

ROOT = Path(__file__).resolve().parent.parent
EXPORT = ROOT / "tools" / "data" / "forever_maps.json"
MAPS = ROOT / "lore" / "maps"
CDN = "https://wow.zamimg.com/images/wow/classicplus/maps/enus/original/"
SIZE = (1002, 668)
AREA_IDS = {
    "1411": 14,     # Durotar
    "1412": 215,    # Mulgore
    "1413": 17,     # The Barrens
    "1416": 36,     # Alterac Mountains
    "1417": 45,     # Arathi Highlands
    "1418": 3,      # Badlands
    "1419": 4,      # Blasted Lands
    "1420": 85,     # Tirisfal Glades
    "1421": 130,    # Silverpine Forest
    "1422": 28,     # Western Plaguelands
    "1423": 139,    # Eastern Plaguelands
    "1424": 267,    # Hillsbrad Foothills
    "1425": 47,     # The Hinterlands
    "1426": 1,      # Dun Morogh
    "1427": 51,     # Searing Gorge
    "1428": 46,     # Burning Steppes
    "1429": 12,     # Elwynn Forest
    "1430": 41,     # Deadwind Pass
    "1431": 10,     # Duskwood
    "1432": 38,     # Loch Modan
    "1433": 44,     # Redridge Mountains
    "1434": 33,     # Stranglethorn Vale
    "1435": 8,      # Swamp of Sorrows
    "1436": 40,     # Westfall
    "1437": 11,     # Wetlands
    "1438": 141,    # Teldrassil
    "1439": 148,    # Darkshore
    "1440": 331,    # Ashenvale
    "1441": 400,    # Thousand Needles
    "1442": 406,    # Stonetalon Mountains
    "1443": 405,    # Desolace
    "1444": 357,    # Feralas
    "1445": 15,     # Dustwallow Marsh
    "1446": 440,    # Tanaris
    "1447": 16,     # Azshara
    "1448": 361,    # Felwood
    "1449": 490,    # Un'Goro Crater
    "1450": 493,    # Moonglade
    "1451": 1377,   # Silithus
    "1452": 618,    # Winterspring
    "1453": 1519,   # Stormwind City
    "1454": 1637,   # Orgrimmar
    "1455": 1537,   # Ironforge
    "1456": 1638,   # Thunder Bluff
    "1457": 1657,   # Darnassus
    "1458": 1497,   # Undercity
    "2482": 616,    # Mount Hyjal
    "2548": 16591,  # Riverglades
    "2652": 16651,  # Shen'dralas
}
FOREVER_ONLY = {"2482", "2548", "2652"}


def original(area, cache):
    name = f"{area}.jpg"
    if cache and (cache / name).is_file():
        return (cache / name).read_bytes()
    with urlopen(CDN + name, timeout=20) as response:
        return response.read()


def same_art(target, image):
    if not target.is_file():
        return False
    # A thumbnail comparison tolerates the previous JPEG encoding.
    size = (250, 167)
    try:
        with Image.open(target) as existing:
            if existing.size != SIZE:
                return False
            old = existing.convert("RGB").resize(size, Image.Resampling.LANCZOS)
    except OSError:
        return False
    new = image.resize(size, Image.Resampling.LANCZOS)
    return max(ImageStat.Stat(ImageChops.difference(old, new)).mean) < 2


def install(target, jpeg):
    with Image.open(BytesIO(jpeg)) as source:
        if source.format != "JPEG" or source.width < SIZE[0] or abs(source.width / source.height - 1.5) > 0.01:
            raise ValueError(f"unexpected map format or size ({source.format} {source.size})")
        image = source.convert("RGB").resize(SIZE, Image.Resampling.LANCZOS)
    if same_art(target, image):
        return "already matches"

    with NamedTemporaryFile(dir=target.parent, delete=False) as file:
        pending = Path(file.name)
        try:
            image.save(file, "JPEG", quality=92)
            file.close()
            pending.chmod(0o644)
            pending.replace(target)
        finally:
            pending.unlink(missing_ok=True)
    return "saved"


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--cache", type=Path, help="read available original JPEGs from this directory")
    args = parser.parse_args()
    zones = json.loads(EXPORT.read_text())["zones"]
    if AREA_IDS.keys() != zones.keys():
        raise SystemExit(f"Area ID table does not match the export: {sorted(AREA_IDS.keys() ^ zones.keys())}")

    failed = False
    for zone_id, area in AREA_IDS.items():
        name = f"{zone_id} {zones[zone_id]['name']} (area {area})"
        try:
            status = install(MAPS / f"{zone_id}.jpg", original(area, args.cache))
        except HTTPError as error:
            status = f"HTTP {error.code}"
            if zone_id not in FOREVER_ONLY or error.code not in (404, 410):
                failed = True
        except (OSError, ValueError) as error:
            status = str(error)
            failed = True
        print(f"{name}: {status}")
    return int(failed)


if __name__ == "__main__":
    sys.exit(main())
