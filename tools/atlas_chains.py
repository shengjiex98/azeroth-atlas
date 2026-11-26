#!/usr/bin/env python3
"""Rank Forever quest-chain candidates for manual review."""

import argparse
import base64
from collections import Counter, defaultdict
import hashlib
import io
import json
from pathlib import Path
import subprocess
import tempfile
from urllib.request import urlopen
from zipfile import ZipFile

if __package__:
    from .sv_to_json import Parser
else:
    from sv_to_json import Parser


TOOLS = Path(__file__).resolve().parent
VERSION = "1.1.6"
UPSTREAM = "https://github.com/Questie/QuestieDB"
REVISION = "4377c981ac368d1593ec92788218e0a689a6a02b"
ARCHIVE = f"QuestieDB-{VERSION}-Forever.zip"
ARCHIVE_HASH = "4d3e043e3c8d28014ec6f5d4d894d476769e1be99d060a174e14ca46038ebe50"
EMULATOR = {
    "emulator/metadata.lua": "0c89680c0bd821ef91e68b14b561c653cf42d9f152e03bd259839363a4467e46",
    "emulator/client.lua": "2f1d22c7c37e4c3a44f509d63cfefd9cdc18601ab130fadb71915317c5a663fb",
    "generator/base64.lua": "6db1a29b619ec7bcde8a1d6bf2a83615fd7957823643ee076347a93fd8601a70",
    "generator/vendor/BlizzardCBOR.lua": "39478657eda606f34116d87226c4a94112ffc8b426912bb1c74ed43aaa16d5fa",
    "generator/vendor/LibDeflate.lua": "63b9ee13458535e2fce630c21f64d901d33c9e1a5762f1ba2813c413e1a72a1a",
}
FACTIONS = ("Alliance", "Horde")
CONTINENTS = {1414: "Kalimdor", 1415: "Eastern Kingdoms"}


def download(url, checksum):
    with urlopen(url, timeout=45) as response:
        data = response.read()
    if hashlib.sha256(data).hexdigest() != checksum:
        raise ValueError(f"QuestieDB checksum mismatch for {url}")
    return data


def questiedb():
    cache = TOOLS / ".cache"
    target = cache / f"questiedb-v{VERSION}"
    if target.is_dir():
        return target / "QuestieDB"
    cache.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(dir=cache) as directory:
        stage = Path(directory) / "release"
        data = download(f"{UPSTREAM}/releases/download/v{VERSION}/{ARCHIVE}", ARCHIVE_HASH)
        with ZipFile(io.BytesIO(data)) as release:
            release.extractall(stage)
        for path, checksum in EMULATOR.items():
            destination = stage / "QuestieDB" / path
            destination.parent.mkdir(parents=True, exist_ok=True)
            url = f"https://raw.githubusercontent.com/Questie/QuestieDB/{REVISION}/{path}"
            destination.write_bytes(download(url, checksum))
        try:
            stage.rename(target)
        except OSError:
            if not target.is_dir():
                raise
    return target / "QuestieDB"


def map_continents():
    bounds = json.loads((TOOLS / "data/ui_map_bounds.json").read_text(encoding="utf-8"))
    exported = json.loads((TOOLS / "data/forever_maps.json").read_text(encoding="utf-8"))
    legacy = {0: 1415, 1: 1414}
    maps = {int(ui): legacy[map_id] for ui, map_id in bounds["mapIds"].items()
            if map_id in legacy and ui != "947"}
    maps.update({int(ui): zone["continent"] for ui, zone in exported["zones"].items()
                 if zone.get("continent") in CONTINENTS})
    return maps


def read_journey(path, character=None):
    data = path.read_bytes()
    if data.lstrip().startswith(b"RSJ1."):
        encoded = data.strip()[5:]
        lines = base64.b64decode(encoded + b"=" * (-len(encoded) % 4), altchars=b"-_", validate=True)
        lines = lines.decode("utf-8").splitlines()
        if not lines or not lines[0].startswith("H|1|"):
            raise ValueError("Expected an RSJ1 v1 header")
        name = lines[0].split("|")[2]
        if character and not name.casefold().startswith(character.casefold()):
            raise ValueError(f"RSJ1 character {name!r} does not match {character!r}")
        records = (line.split("|") for line in lines[1:])
        return {int(row[5]) for row in records if row[0] == "Q" and len(row) > 5 and row[5]}, set()
    if not character:
        raise ValueError("SavedVariables require --character NAME_PREFIX")
    characters = Parser(data).file().get("RosettaDB", {}).get("characters", {})
    matches = [key for key in characters if key.casefold().startswith(character.casefold())]
    exact = [key for key in matches if key.split("-", 1)[0].casefold() == character.casefold()]
    matches = exact or matches
    if len(matches) != 1:
        raise ValueError(f"Expected one Rosetta character for {character!r}, found {', '.join(sorted(matches)) or 'none'}")
    record = characters[matches[0]]
    completed = set(record.get("completedQuests") or [])
    journal = record.get("journal") or {}
    completed.update(int(key) for key in (journal.get("backfill") or {}))
    for event in journal.get("events") or []:
        if len(event) > 5 and event[1] == "Q" and event[5]:
            completed.add(int(event[5]))
    return completed, {row["questID"] for row in record.get("quests") or [] if row.get("questID")}


def connects(successors, start, end):
    pending, seen = [start], set()
    while pending:
        node = pending.pop()
        if node == end:
            return True
        if node not in seen:
            seen.add(node)
            pending.extend(successors[node] - seen)
    return False


def restriction(quest):
    return quest.get("requiredClasses", 0), slot(quest.get("requiredSkill") or [], 1, 0)


def restriction_labels(quest, profile):
    classes, skill = restriction(quest)
    labels = []
    if classes:
        names = [key.replace("_", " ").title() for key, mask in profile["classKeys"].items()
                 if mask > 0 and mask.bit_count() == 1 and classes & mask]
        labels.append(f"{'/'.join(sorted(names)) or classes} (class)")
    if skill:
        skills = {value: key.replace("_", " ").title() for key, value in profile["professionKeys"].items()}
        labels.append(f"{skills.get(skill, skill)} (profession)")
    return labels


def quest_graph(quests):
    links = defaultdict(set)
    # The Adventurer has one Camping variant per starter zone. An entry from a
    # starter zone unlocks Camping without making the starter arcs one component.
    available = {qid: {profile["profile"]: (*restriction(quest), quest.get("zoneOrSort") == profile["campingSort"])
                       for profile, quest in choices} for qid, choices in quests.items()}

    def group(qid, faction):
        return available.get(qid, {}).get(faction)

    entries = {}
    for qid, choices in quests.items():
        for profile, quest in choices:
            faction = profile["profile"]
            prerequisites = quest.get("preQuestSingle") or []
            if len(prerequisites) >= 3:
                entries[qid, faction] = sorted(set(prerequisites))
            elif group(qid, faction)[-1]:
                entries[qid, faction] = sorted({source for source in prerequisites
                                               if (source_group := group(source, faction)) and not source_group[-1]})

    def add(source, target, kind, faction):
        source_group = group(source, faction)
        if (source_group is not None and source_group == group(target, faction)
                and source not in entries.get((target, faction), ())):
            links[source, target, kind].add(faction)

    for quest_id, profiles in quests.items():
        for profile, row in profiles:
            faction = profile["profile"]
            add(quest_id, row.get("breadcrumbForQuestId"), "breadcrumb", faction)
            for source in row.get("breadcrumbs") or []:
                add(source, quest_id, "breadcrumb", faction)
            for source in row.get("preQuestSingle") or []:
                add(source, quest_id, "any", faction)
            if not row.get("preQuestSingle"):
                for source in row.get("preQuestGroup") or []:
                    add(abs(source), quest_id, "all", faction)
            add(row.get("parentQuest"), quest_id, "active", faction)
            class_links = row.get("nextQuestInChainByClass") or {}
            kind = "classNext" if class_links else "next"
            add(quest_id, row.get("nextQuestInChain"), kind, faction)
            for target in class_links.values():
                add(quest_id, target, kind, faction)
            for target in row.get("childQuests") or []:
                add(quest_id, target, "child", faction)

    accepted = {}
    for (source, target, kind), factions in links.items():
        if kind != "breadcrumb":
            factions = factions - links.get((source, target, "breadcrumb"), set())
        if factions:
            accepted[source, target, kind] = factions
    explicit = {(target, faction) for (_, target, kind), factions in accepted.items()
                if kind in {"all", "any", "active"} for faction in factions}
    directed = defaultdict(set)
    for (source, target, kind), factions in accepted.items():
        if kind in {"all", "any", "active", "breadcrumb"} or any((target, f) not in explicit for f in factions):
            directed[source].add(target)

    step_for = {quest_id: quest_id for quest_id in quests}
    members = {quest_id: {quest_id} for quest_id in quests}
    conflicts = []

    def merge(left, right, kind):
        first, second = sorted((step_for[left], step_for[right]))
        if first == second:
            return
        if any(connects(directed, a, b) or connects(directed, b, a)
               for a in members[first] for b in members[second]):
            conflicts.append((left, right, kind))
            return
        for quest_id in members.pop(second):
            members[first].add(quest_id)
            step_for[quest_id] = first

    for quest_id, profiles in sorted(quests.items()):
        for profile, row in profiles:
            faction = profile["profile"]
            for other in row.get("exclusiveTo") or []:
                if (group(quest_id, faction) in available.get(other, {}).values()
                        and other not in entries.get((quest_id, faction), ())
                        and quest_id not in entries.get((other, faction), ())):
                    merge(quest_id, other, "exclusiveTo")

    signatures = defaultdict(set)
    for source, target, kind in accepted:
        signatures[source].add(("out", kind, step_for[target]))
        signatures[target].add(("in", kind, step_for[source]))

    variants = defaultdict(list)
    for quest_id, profiles in sorted(quests.items()):
        row = profiles[0][1]
        name = row.get("name", {}).get("enUS", "").casefold()
        if not name or not signatures[quest_id]:
            continue
        # Parallel faction branches may have different IDs at every step.
        neighbors = frozenset((direction, kind, quests[neighbor][0][1].get("name", {}).get("enUS"),
                               quests[neighbor][0][1].get("questLevel"))
                              for direction, kind, neighbor in signatures[quest_id])
        key = (name, row.get("questLevel"), group(quest_id, profiles[0][0]["profile"]), neighbors)
        for other in variants[key]:
            candidate = quests[other][0][1]
            if {row["faction"], candidate["faction"]} == set(FACTIONS):
                merge(quest_id, other, "variant")
        variants[key].append(quest_id)

    # Keep explicit prerequisites ahead of weaker next-quest and child pointers when data cycles.
    priority = {"all": 0, "any": 0, "active": 1, "breadcrumb": 2, "next": 3, "classNext": 3, "child": 4}
    successors, adjacent = defaultdict(set), defaultdict(set)
    predecessors = defaultdict(lambda: defaultdict(set))
    for source, target, kind in sorted(accepted, key=lambda link: (priority[link[2]], *link)):
        first, second = step_for[source], step_for[target]
        if first == second:
            if source == target:
                conflicts.append((source, target, kind))
            continue
        adjacent[first].add(second)
        adjacent[second].add(first)
        if connects(successors, second, first):
            conflicts.append((source, target, kind))
            continue
        successors[first].add(second)
        for faction in accepted[source, target, kind]:
            predecessors[target, faction][kind].add(first)

    seen = set()
    for start in sorted(members):
        component = set()
        pending = [start]
        while pending:
            step = pending.pop()
            if step not in seen:
                seen.add(step)
                component.add(step)
                pending.extend(adjacent[step] - seen)
        if sum(len(members[step]) for step in component) < 2:
            continue
        ordered, required = [], {step: set() for step in component}
        for step in component:
            for successor in successors[step]:
                required[successor].add(step)
        remaining = component.copy()
        while remaining:
            step = min((step for step in remaining if not required[step] & remaining),
                       key=lambda step: (not all(quests[qid][0][1].get("breadcrumbForQuestId")
                                                 for qid in members[step]), step))
            remaining.remove(step)
            options = []
            for quest_id in sorted(members[step]):
                requirements = {}
                for profile, _ in quests[quest_id]:
                    faction = profile["profile"]
                    links_to = predecessors[quest_id, faction]
                    any_of = sorted(links_to["any"])
                    mandatory = links_to["all"] | set(any_of if len(any_of) == 1 else [])
                    if not mandatory and not any_of and not links_to["active"]:
                        any_of = sorted(links_to["next"] or links_to["child"])
                        mandatory = set(any_of) if len(any_of) == 1 else set()
                    requirements[faction] = {"requires": sorted(mandatory),
                                             "requiresAny": any_of if len(any_of) > 1 else [],
                                             "requiresActive": sorted(links_to["active"]),
                                             "optionalPredecessors": sorted(links_to["breadcrumb"]),
                                             "entryRequiresAny": entries.get((quest_id, faction), [])}
                options.append((quest_id, requirements))
            paths = [path for _, requirements in options for path in requirements.values()]
            common = {field: sorted(set.intersection(*(set(path[field]) for path in paths)))
                      for field in ("requires", "requiresActive", "optionalPredecessors")}
            for field in ("requiresAny", "entryRequiresAny"):
                common[field] = paths[0][field] if all(path[field] == paths[0][field] for path in paths) else []
            ordered.append({"id": step, **common, "after": sorted(required[step]), "quests": options})
        repairs = [{"from": source, "to": target, "kind": kind}
                   for source, target, kind in sorted(set(conflicts)) if step_for[source] in component]
        yield ordered, repairs


def item_sources(item_id, items):
    pending, seen, sources = [item_id], set(), set()
    while pending:
        item_id = pending.pop()
        if item_id in seen:
            continue
        seen.add(item_id)
        item = items.get(str(item_id), {})
        sources.update(("npc", npc) for npc in item.get("npcDrops") or [])
        sources.update(("object", obj) for obj in item.get("objectDrops") or [])
        pending.extend(item.get("itemDrops") or [])
    return sources


def spawn_locations(rows):
    points = defaultdict(lambda: defaultdict(list))
    entrances = defaultdict(lambda: defaultdict(list))
    for source, row in rows:
        origin = (source, row.get("dungeon"))
        ui = row.get("uiMap")
        if ui:
            for x, y, *_ in row["points"]:
                if x is not None and y is not None and 0 <= x <= 100 and 0 <= y <= 100:
                    points[ui][x, y].append(origin)
        for ui, x, y in row.get("entrances", []):
            if 0 <= x <= 100 and 0 <= y <= 100:
                entrances[ui][x, y].append(origin)
    return points, entrances


def representative(maps, entrance=False):
    if not maps:
        return None, set()

    def weights(points):
        return {point: 1 if entrance else len(origins) for point, origins in points.items()}

    ui = min(maps, key=lambda key: (-sum(weights(maps[key]).values()), key))
    counts = weights(maps[ui])
    cells = defaultdict(set)
    for x, y in counts:
        cells[x // 5, y // 5].add((x, y))
    largest, size = [], 0
    for start in sorted(counts):
        cell = cells[start[0] // 5, start[1] // 5]
        if start not in cell:
            continue
        cell.remove(start)
        cluster = [start]
        for x, y in cluster:
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    cell = cells[x // 5 + dx, y // 5 + dy]
                    near = {p for p in cell if (x - p[0]) ** 2 + (y - p[1]) ** 2 <= 25}
                    cluster.extend(sorted(near))
                    cell.difference_update(near)
        count = sum(counts[point] for point in cluster)
        if count > size:
            largest, size = cluster, count
    x, y = (sum(point[axis] * counts[point] for point in largest) / size for axis in range(2))
    pin = {"uiMap": ui, "x": int(x * 10 + 0.5), "y": int(y * 10 + 0.5)}
    if entrance:
        pin["entrance"] = True

    # Classify the pin using the closest spawn in the winning cluster.
    closest = min(largest, key=lambda point: ((x - point[0]) ** 2 + (y - point[1]) ** 2, point))
    dungeons = Counter(dungeon or "" for _, dungeon in maps[ui][closest])
    dungeon = min(dungeons, key=lambda name: (-dungeons[name], name))
    if dungeon:
        pin["dungeon"] = dungeon
    sources = {source for point in largest for source, _ in maps[ui][point] if source}
    return pin, sources


def quest_locations(quest, profile):
    entities = {"npc": profile["npcs"], "object": profile["objects"], "item": profile["items"]}

    def locate(kind, entity_id, sources=(), extra=()):
        entity = entities.get(kind, {}).get(str(entity_id), {})
        sources = set(sources)
        if kind == "item":
            sources.update(item_sources(entity_id, profile["items"]))
        if kind in {"npc", "object"}:
            sources.add((kind, entity_id))
        rows = ([(None, row) for row in extra] if extra else
                [((kind, eid), row) for kind, eid in sorted(sources)
                 for row in entities[kind].get(str(eid), {}).get("spawns") or []])
        points, entrances = spawn_locations(rows)
        pin, cluster_sources = representative(points) if points else representative(entrances, entrance=True)
        row = {"kind": kind, "id": entity_id, "name": entity.get("name", {}), "point": pin,
               "maps": [pin["uiMap"]] if pin else [],
               "dungeons": [pin["dungeon"]] if pin and "dungeon" in pin else [],
               "sources": [{"kind": kind, "id": eid} for kind, eid in sorted(sources)]}
        if kind == "item":
            droppers = {source for source in sources if source[0] == "npc"}
            row["clusterDropperIds"] = sorted(eid for _, eid in cluster_sources & droppers) if len(droppers) <= 3 else []
        return row

    def givers(field):
        groups = quest.get(field) or {}
        return [locate(kind, entity_id) for group, kind in enumerate(("npc", "object", "item"), 1)
                for entity_id in slot(groups, group, [])]

    objectives = quest.get("objectives") or {}
    locations = [locate(kind, slot(row, 1, 0)) for group, kind in enumerate(("npc", "object", "item"), 1)
                 for row in slot(objectives, group, [])]
    reputation = slot(objectives, 4, [])
    if reputation:
        target = locate("reputation", reputation[0])
        target["value"] = reputation[1]
        locations.append(target)
    for index, row in enumerate(slot(objectives, 5, [])):
        ids = set(slot(row, 1, [])) or {slot(row, 2, 0)}
        target = locate("killCredit", index + 1, (("npc", i) for i in ids if i))
        target["description"] = slot(row, 3, "")
        locations.append(target)
    for row in slot(objectives, 6, []):
        item = slot(row, 3, 0)
        sources = item_sources(item, profile["items"]) if item else ()
        target = locate("spell", slot(row, 1, 0), sources)
        target["description"] = slot(row, 2, "")
        locations.append(target)
    trigger = quest.get("triggerEnd")
    if trigger:
        target = locate("trigger", 1, extra=slot(trigger, 2, []))
        target["description"] = slot(trigger, 1, "")
        locations.append(target)
    for index, row in enumerate(quest.get("extraObjectives") or []):
        sources = set()
        for kind, entity_id in slot(row, 5, []):
            if kind == "item":
                sources.update(item_sources(entity_id, profile["items"]))
            elif kind in {"monster", "npc", "object"}:
                sources.add(("npc" if kind == "monster" else kind, entity_id))
        target = locate("extra", index + 1, sources, slot(row, 1, []))
        target["description"] = slot(row, 3, "")
        locations.append(target)
    return {"givers": givers("startedBy"), "objectives": locations, "turnIns": givers("finishedBy")}


def slot(row, index, default):
    return row.get(str(index), default) if isinstance(row, dict) else row[index - 1] if index <= len(row) else default


def score(signals):
    return (3 * signals["stepCount"] + min(10, len(signals["maps"])) + 3 * max(0, len(signals["continents"]) - 1)
            + min(10, signals["elite"] + 2 * signals["rareElite"] + 3 * signals["boss"])
            + min(10, 2 * signals["dungeonSteps"] + signals["raidSteps"]))


def rank_chains(profiles, continents, journey=None):
    choices = defaultdict(list)
    for profile in profiles:
        for row in profile["quests"]:
            if (row.get("specialFlags", 0) & profile["repeatableSpecialFlag"]
                    or row.get("questFlags", 0) & profile["periodicQuestFlags"]):
                continue
            if row["faction"] in (profile["profile"], "Both") or len(profiles) == 1:
                choices[row["id"]].append((profile, row))
    completed, active = journey or (set(), set())
    chains = []
    for steps, conflicts in quest_graph(choices):
        factions, restrictions, maps, dungeons, levels = set(), set(), set(), set(), []
        ranks, dungeon_targets, dungeon_steps, raid_steps, party_steps = {}, set(), set(), set(), set()
        done = in_log = quest_count = 0
        for step in steps:
            options = step["quests"]
            ids = {quest_id for quest_id, _ in options}
            quest_count += len(ids)
            if ids & completed:
                done += 1
            elif ids & active:
                in_log += 1
            step["quests"] = []
            for quest_id, requirements in options:
                for index, (profile, quest) in enumerate(choices[quest_id]):
                    locations = quest_locations(quest, profile)
                    view = {**quest, **locations, **requirements[profile["profile"]],
                            "rewardItemIds": profile.get("rewardItemIds", {}).get(str(quest_id), [])}
                    if index == 0:
                        primary = view
                        option = view.copy()
                        step["quests"].append(option)
                    elif view != primary:
                        option.setdefault("factionOverrides", {})[profile["profile"]] = view
                    factions.add(quest["faction"])
                    restrictions.update(restriction_labels(quest, profile))
                    if quest.get("questLevel", 0) > 0:
                        levels.append(quest["questLevel"])
                    if quest.get("questFlags", 0) & profile["raidFlag"]:
                        raid_steps.add(step["id"])
                    if quest.get("questFlags", 0) & profile["partyAcceptFlag"]:
                        party_steps.add(step["id"])
                    for role, entries in locations.items():
                        for row in entries:
                            point = row["point"]
                            if point:
                                maps.add(point["uiMap"])
                                if "dungeon" in point:
                                    dungeons.add(point["dungeon"])
                                    if role == "objectives":
                                        dungeon_steps.add(step["id"])
                                        dungeon_targets.add((quest_id, row["kind"], row["id"]))
                    for row in locations["objectives"]:
                        if row["kind"] in {"npc", "killCredit"}:
                            npc_ids = [source["id"] for source in row["sources"] if source["kind"] == "npc"]
                        else:
                            npc_ids = row.get("clusterDropperIds", [])
                        for npc_id in npc_ids:
                            rank = profile["npcs"].get(str(npc_id), {}).get("rank")
                            if rank is not None:
                                ranks[npc_id] = rank
        counts = Counter(ranks.values())
        rank_codes = profiles[0]["npcRanks"]
        restricted = factions - {"Both"}
        signals = {"questCount": quest_count, "stepCount": len(steps), "faction": next(iter(restricted))
                   if len(restricted) == 1 else "Both",
                   "restrictions": sorted(restrictions),
                   "levelSpan": [min(levels), max(levels)] if levels else None,
                   "maps": sorted(maps), "continents": sorted({continents[ui] for ui in maps if ui in continents}),
                   "elite": counts[rank_codes["ELITE"]], "rareElite": counts[rank_codes["RARE_ELITE"]],
                   "boss": counts[rank_codes["BOSS"]], "dungeonObjectives": len(dungeon_targets),
                   "dungeons": sorted(dungeons), "dungeonSteps": len(dungeon_steps),
                   "partyAcceptSteps": len(party_steps), "raidSteps": len(raid_steps)}
        first = steps[0]["quests"][0]
        chains.append({"firstQuest": {"id": first["id"], "name": first.get("name", {})}, "steps": steps,
                       "signals": signals, "edgeConflicts": conflicts, "score": score(signals),
                       "touched": bool(done or in_log), "done": done, "inLog": in_log})
    chains.sort(key=lambda chain: (not chain["touched"], -chain["score"], chain["firstQuest"]["id"]))
    for rank, chain in enumerate(chains, 1):
        chain["rank"] = rank
    return chains


def markdown(chains, journey=False):
    yield ("| Rank | First quest | Faction | Restriction | Steps | Quests | Level | Maps | Continents | "
           "Elite / Rare elite / Boss | Dungeon steps | Touched | Done / Total |")
    yield "| ---: | --- | --- | --- | ---: | ---: | --- | ---: | --- | --- | ---: | --- | --- |"
    for chain in chains:
        signals, first = chain["signals"], chain["firstQuest"]
        title = first["name"].get("enUS", "Unknown quest").replace("|", r"\|").replace("\n", " ")
        level = "–".join(map(str, signals["levelSpan"])) if signals["levelSpan"] else "—"
        continents = ", ".join(CONTINENTS[ui] for ui in signals["continents"]) or "—"
        ranks = " / ".join(str(signals[key]) for key in ("elite", "rareElite", "boss"))
        touched = ("Yes" if chain["touched"] else "No") if journey else "—"
        progress = f'{chain["done"]}/{signals["stepCount"]}' if journey else "—"
        restriction = ", ".join(signals["restrictions"]) or "—"
        yield (f'| {chain["rank"]} | {title} ({first["id"]}) | {signals["faction"]} | {restriction} | '
               f'{signals["stepCount"]} | {signals["questCount"]} | {level} | {len(signals["maps"])} | '
               f'{continents} | {ranks} | {signals["dungeonSteps"]} | '
               f'{touched} | {progress} |')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--journey", type=Path, metavar="FILE", help="RSJ1 summary or Rosetta SavedVariables")
    parser.add_argument("--character", metavar="NAME_PREFIX", help="character to select in SavedVariables")
    parser.add_argument("--json", type=Path, metavar="FILE", help="write the complete candidate chains")
    args = parser.parse_args()
    if args.character and not args.journey:
        parser.error("--character requires --journey")
    try:
        journey = read_journey(args.journey, args.character) if args.journey else None
        db = questiedb()
        profiles = [json.loads(subprocess.check_output(["lua5.1", TOOLS / "quest_dump.lua", faction], cwd=db))
                    for faction in FACTIONS]
        chains = rank_chains(profiles, map_continents(), journey)
        if args.json:
            with args.json.open("w", encoding="utf-8") as output:
                json.dump({"questieDB": VERSION, "chains": chains}, output, ensure_ascii=False, separators=(",", ":"))
                output.write("\n")
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        parser.exit(1, f"atlas_chains: {error}\n")
    for line in markdown(chains, args.journey is not None):
        print(line)


if __name__ == "__main__":
    main()
