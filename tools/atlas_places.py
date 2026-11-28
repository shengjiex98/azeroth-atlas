#!/usr/bin/env python3
"""Update atlas place pins from QuestieDB Forever spawns and entrances."""

import argparse
from collections import defaultdict
import json
import re
import subprocess

if __package__:
    from .atlas_chains import FACTIONS, TOOLS, questiedb, representative, spawn_locations
else:
    from atlas_chains import FACTIONS, TOOLS, questiedb, representative, spawn_locations


ANCHORS = TOOLS / "data/place_anchors.json"
WORLD = TOOLS.parent / "lore/atlas/data/world.js"
TABLES = {"npc": "npcs", "object": "objects", "entrance": "instances"}

ZONE = re.compile(r"(?ms)^  zone\((\d+), .*?^  \}\);$")
PLACES = re.compile(r"(?ms)^    places: \[\n(?P<entries>.*?)^    \],?$")
JS_STRING = r"(?:'(?:\\.|[^'\\\n])*'|\"(?:\\.|[^\"\\\n])*\")"
NAME = rf"L\({JS_STRING}, {JS_STRING}\)"
PLACE = re.compile(
    rf"^      (?:\{{ id: '(?P<object_id>[\w-]+)', name: (?P<name>{NAME}), "
    rf"text: (?P<text>L\(.*\)) \}}(?=,?$)"
    rf"|P\('(?P<call_id>[\w-]+)', {NAME}, (?P<point>\d+(?:\.\d+)?, \d+(?:\.\d+)?), L\()",
    re.MULTILINE,
)


def place_pin(profiles, zone, place, record):
    locations = defaultdict(list)
    for anchor in record["anchors"]:
        kind, entity_id = anchor["type"], anchor["id"]
        if kind not in TABLES:
            raise ValueError(f"Zone {zone}, place {place}: unknown anchor type {kind!r}")
        entities = [profile[TABLES[kind]].get(str(entity_id), {}) for profile in profiles]
        source = kind, entity_id
        if kind == "entrance":
            # Use the first listed entrance on this map when the instance has several.
            rows = [(source, {"entrances": [point for point in entity.get("entrances", ())
                                           if point[0] == zone][:1]}) for entity in entities]
            _, maps = spawn_locations(rows)
        else:
            rows = [(source, spawn) for entity in entities for spawn in entity.get("spawns", ())]
            maps, _ = spawn_locations(rows)
        points = maps.get(zone)
        if not points:
            location = "entrance" if kind == "entrance" else "spawn"
            raise ValueError(f"Zone {zone}, place {place}: {kind} {entity_id} ({record['note']}) "
                             f"has no valid {location} on UiMap {zone}")
        for point, origins in points.items():
            # Count a spawn shared by both faction profiles once per anchor.
            locations[point].append(origins[0])

    if not locations:
        raise ValueError(f"Zone {zone}, place {place}: no anchors listed")
    pin, _ = representative({zone: locations})
    return pin["x"] / 10, pin["y"] / 10


def update_places(world, pins):
    remaining = {(zone, place) for zone, places in pins.items() for place in places}

    def update_zone(section):
        zone = int(section[1])
        zone_pins = pins.get(zone)
        places = PLACES.search(section[0]) if zone_pins else None
        if not places:
            return section[0]

        def replace(match):
            place = match["object_id"] or match["call_id"]
            if place not in zone_pins:
                return match[0]
            if (zone, place) not in remaining:
                raise ValueError(f"Zone {zone}, place {place}: multiple world.js entries")
            remaining.remove((zone, place))
            x, y = zone_pins[place]
            point = f"{x:.1f}, {y:.1f}"
            if match["object_id"]:
                return f"      P('{place}', {match['name']}, {point}, {match['text']})"
            start, end = (index - match.start() for index in match.span("point"))
            return match[0][:start] + point + match[0][end:]

        start, end = places.span("entries")
        return section[0][:start] + PLACE.sub(replace, places["entries"]) + section[0][end:]

    updated = ZONE.sub(update_zone, world)
    if remaining:
        missing = ", ".join(f"{zone}/{place}" for zone, place in sorted(remaining))
        raise ValueError(f"Could not find place entries in world.js: {missing}")
    return updated


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    try:
        anchors = json.loads(ANCHORS.read_text(encoding="utf-8"))
        db = questiedb()
        profiles = [json.loads(subprocess.check_output(["lua5.1", TOOLS / "quest_dump.lua", faction, "--places"], cwd=db))
                    for faction in FACTIONS]
        pins = {int(zone): {place: place_pin(profiles, int(zone), place, record)
                            for place, record in places.items()} for zone, places in anchors.items()}
        world = WORLD.read_text(encoding="utf-8")
        updated = update_places(world, pins)
        if updated != world:
            WORLD.write_text(updated, encoding="utf-8")
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        parser.exit(1, f"atlas_places: {error}\n")


if __name__ == "__main__":
    main()
