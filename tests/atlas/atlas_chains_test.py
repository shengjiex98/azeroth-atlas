import base64
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from tools.atlas_chains import markdown, pick_labels, rank_chains, read_journey, read_picks, site_chains


def quest(quest_id, **fields):
    return {"id": quest_id, "name": {"enUS": f"Quest {quest_id}"}, "faction": "Both",
            "questLevel": 20, **fields}


def profile(quests, **data):
    return {"profile": "Alliance", "quests": quests, "npcs": {}, "objects": {}, "items": {},
            "npcRanks": {"ELITE": 1, "RARE_ELITE": 2, "BOSS": 3}, "partyAcceptFlag": 2, "raidFlag": 64,
            "periodicQuestFlags": 4096 | 32768 | 65536, "repeatableSpecialFlag": 1, "campingSort": -666,
            "classKeys": {"WARRIOR": 1, "PALADIN": 2}, "professionKeys": {"BLACKSMITHING": 164, "ALCHEMY": 171},
            **data}


class AtlasChainsTest(unittest.TestCase):
    def test_picks_are_unique_and_explained(self):
        picks = json.loads((Path(__file__).parents[2] / "tools/data/chain_picks.json").read_text())["picks"]
        self.assertEqual(len({pick["id"] for pick in picks}), len(picks))
        labels = read_picks()
        part_count = 0
        for pick in picks:
            self.assertNotEqual("firstQuest" in pick, "parts" in pick)
            parts = pick["parts"] if "parts" in pick else [pick["firstQuest"]]
            self.assertTrue(parts)
            for part in parts:
                self.assertIsInstance(part, int)
                self.assertEqual(labels[part], pick["id"])
            part_count += len(parts)
            self.assertTrue(pick["why"].strip())
        self.assertEqual(len(labels), part_count)

    def test_summary_reads_open_quests_and_ignores_accepts(self):
        lines = ["H|1|Lancet", "A|1||||8", "Q|2||||7|", "O|9,10"]
        encoded = base64.urlsafe_b64encode("\n".join(lines).encode()).decode().rstrip("=")
        with TemporaryDirectory() as directory:
            path = Path(directory) / "summary"
            path.write_text("RSJ1." + encoded)
            self.assertEqual(read_journey(path, "Lancet"), ({7}, {9, 10}))

    def test_table_names_the_pick_for_each_candidate_part(self):
        quests = [quest(5, nextQuestInChain=7), quest(7),
                  quest(10, nextQuestInChain=11), quest(11), quest(20)]
        chains = rank_chains([profile(quests)], {})
        labels = pick_labels([{"id": "story", "parts": [10, 20, 5]}])
        rows = list(markdown(chains, picks=labels))[2:]
        self.assertEqual(len(rows), 2)
        self.assertTrue(all(row.endswith("| story |") for row in rows))

    def test_site_merges_parts_in_story_order_with_each_chain_in_depth_order(self):
        quests = [
            quest(5, faction="Alliance", objectives={"1": [[10]]}),
            quest(7, preQuestSingle=[5]),
            quest(2, preQuestSingle=[7], questLevel=10),
            quest(8, preQuestSingle=[5], objectives={"1": [[11]]}),
            quest(20, nextQuestInChain=21, objectives={"1": [[10]]}),
            quest(21),
        ]
        standalone = quest(4, faction="Horde", questLevel=35, objectives={"1": [[12]]})
        npcs = {
            "10": {"rank": 1, "spawns": [{"uiMap": 101, "points": [[50, 50]], "dungeon": "Dungeon"}]},
            "11": {"rank": 2, "spawns": [{"uiMap": 102, "points": [[50, 50]]}]},
            "12": {"rank": 3, "spawns": [{"uiMap": 103, "points": [[50, 50]]}]},
        }
        profiles = [profile(quests, npcs=npcs), profile([standalone], npcs=npcs, profile="Horde")]
        candidates = rank_chains(profiles, {101: 1415, 102: 1415, 103: 1414}, min_quests=1)
        self.assertEqual(next([step["id"] for step in c["steps"]] for c in candidates
                              if c["firstQuest"]["id"] == 5), [5, 7, 2, 8])
        story = site_chains(candidates, [{"id": "story", "parts": [20, 4, 5]}])["story"]
        self.assertEqual([(step["id"], step["after"]) for step in story["steps"]],
                         [(20, []), (21, [20]), (4, []), (5, []), (7, [5]), (8, [5]), (2, [7])])
        self.assertEqual(story["zoneIds"], [101, 103, 102])
        self.assertEqual(story["levels"], [10, 35])
        self.assertEqual(story["faction"], "Both")
        self.assertEqual(story["signals"], {"steps": 7, "maps": 3, "continents": 2,
                                           "elite": 2, "rareElite": 1, "boss": 1, "dungeonSteps": 2})

    def test_site_rejects_a_part_that_is_neither_a_chain_start_nor_standalone(self):
        chains = rank_chains([profile([quest(5, nextQuestInChain=7), quest(7)])], {}, min_quests=1)
        for part in (7, 99):
            with self.subTest(part=part), self.assertRaisesRegex(ValueError, f"Pick story has unknown part {part}"):
                site_chains(chains, [{"id": "story", "parts": [5, part]}])

    def test_site_rejects_quests_claimed_by_two_picks(self):
        chains = rank_chains([profile([quest(5, nextQuestInChain=7), quest(7), quest(9)])], {}, min_quests=1)
        picks = [{"id": "first", "firstQuest": 5}, {"id": "second", "parts": [9, 5]}]
        with self.assertRaisesRegex(ValueError, "Quest 5 is claimed by picks first and second"):
            site_chains(chains, picks)

    def test_site_first_quest_pick_keeps_the_single_chain_format(self):
        first = quest(5, faction="Alliance", nextQuestInChain=7, name={"enUS": "First", "zhCN": "First localized"})
        chains = rank_chains([profile([first, quest(7, questLevel=25)])], {})
        legacy = site_chains(chains, [{"id": "story", "firstQuest": 5, "title": "Story"}])
        self.assertEqual(legacy, site_chains(chains, [{"id": "story", "parts": [5], "title": "Story"}]))
        self.assertEqual(legacy["story"], {
            "id": "story", "title": {"en": "Story", "zh": "First localized"}, "faction": "Alliance",
            "levels": [20, 25], "zoneIds": [],
            "signals": {"steps": 2, "maps": 0, "continents": 0, "elite": 0,
                        "rareElite": 0, "boss": 0, "dungeonSteps": 0},
            "steps": [
                {"id": 5, "questIds": [5], "after": [], "name": {"en": "First", "zh": "First localized"},
                 "giver": None, "goals": [], "turnIn": None},
                {"id": 7, "questIds": [7], "after": [5], "name": {"en": "Quest 7", "zh": "Quest 7"},
                 "giver": None, "goals": [], "turnIn": None},
            ],
        })

    def test_linear_chain_uses_prerequisite_and_next_links(self):
        chains = rank_chains([profile([quest(9), quest(5, nextQuestInChain=7),
                                       quest(7), quest(2, preQuestSingle=[7])])], {})
        self.assertEqual(len(chains), 1)
        self.assertEqual([(step["id"], step["requires"]) for step in chains[0]["steps"]],
                         [(5, []), (7, [5]), (2, [7])])

    def test_breadcrumb_is_optional_even_if_listed_as_prerequisite(self):
        chains = rank_chains([profile([quest(9, breadcrumbForQuestId=1, nextQuestInChain=1),
                                       quest(1, preQuestSingle=[9])])], {})
        breadcrumb, main = chains[0]["steps"]
        self.assertEqual(breadcrumb["id"], 9)
        self.assertEqual(main["requires"], [])
        self.assertEqual(main["quests"][0]["optionalPredecessors"], [9])

    def test_exclusive_alternatives_use_one_step(self):
        chains = rank_chains([profile([quest(1, exclusiveTo=[2]), quest(2),
                                       quest(3, preQuestSingle=[1, 2])])], {})
        first, last = chains[0]["steps"]
        self.assertEqual([row["id"] for row in first["quests"]], [1, 2])
        self.assertEqual(last["requires"], [1])

    def test_structurally_matching_faction_variants_share_a_step(self):
        name = {"enUS": "Parallel step"}
        quests = [quest(1, name=name, faction="Alliance"), quest(2, name=name, faction="Horde"),
                  quest(3, preQuestSingle=[1, 2])]
        chain, = rank_chains([profile(quests)], {})
        self.assertEqual(chain["signals"]["questCount"], 3)
        self.assertEqual(chain["signals"]["stepCount"], 2)
        self.assertEqual(chain["signals"]["faction"], "Both")

    def test_any_of_gate_is_an_entry_note_and_keeps_components_separate(self):
        quests = [quest(1, nextQuestInChain=2), quest(2, nextQuestInChain=10),
                  quest(3, nextQuestInChain=4), quest(4, childQuests=[10]),
                  quest(5, nextQuestInChain=6), quest(6, breadcrumbForQuestId=10),
                  quest(10, preQuestSingle=[2, 4, 6], exclusiveTo=[2], nextQuestInChain=11), quest(11)]
        chains = rank_chains([profile(quests)], {})
        self.assertEqual([c["firstQuest"]["id"] for c in chains], [1, 3, 5, 10])
        entry = chains[-1]["steps"][0]
        self.assertEqual(entry["entryRequiresAny"], [2, 4, 6])
        self.assertEqual(entry["after"], [])
        self.assertEqual(entry["requiresAny"], [])
        self.assertEqual(chains[-1]["steps"][1]["requires"], [10])

    def test_class_and_profession_quests_link_only_with_same_restriction(self):
        quests = [
            quest(1, nextQuestInChain=2), quest(2, childQuests=[10, 20]),
            quest(10, requiredClasses=1, preQuestSingle=[2], nextQuestInChain=11, exclusiveTo=[12]),
            quest(11, requiredClasses=1, nextQuestInChain=13),
            quest(12, requiredClasses=2, nextQuestInChain=13),
            quest(13, requiredClasses=2),
            quest(20, requiredSkill=[164, 1], nextQuestInChain=21),
            quest(21, requiredSkill=[164, 100], nextQuestInChain=22),
            quest(22, requiredSkill=[171, 100], nextQuestInChain=23),
            quest(23, requiredSkill=[171, 225]),
        ]
        chains = rank_chains([profile(quests)], {})
        self.assertEqual([(c["firstQuest"]["id"], c["signals"]["restrictions"]) for c in chains],
                         [(1, []), (10, ["Warrior (class)"]), (12, ["Paladin (class)"]),
                          (20, ["Blacksmithing (profession)"]), (22, ["Alchemy (profession)"])])
        self.assertTrue(all(c["signals"]["questCount"] == 2 for c in chains))
        self.assertIn("Warrior (class)", list(markdown(chains))[3])

    def test_camping_variants_do_not_merge_starter_zones(self):
        quests = [quest(1, nextQuestInChain=2), quest(2, nextQuestInChain=10),
                  quest(3, nextQuestInChain=4), quest(4, nextQuestInChain=11),
                  quest(10, zoneOrSort=-666, preQuestSingle=[2], exclusiveTo=[11], nextQuestInChain=12),
                  quest(11, zoneOrSort=-666, preQuestSingle=[4], nextQuestInChain=12),
                  quest(12, zoneOrSort=-666, preQuestSingle=[10, 11])]
        chains = rank_chains([profile(quests)], {})
        self.assertEqual([c["firstQuest"]["id"] for c in chains], [1, 3, 10])
        camping = chains[-1]["steps"][0]
        self.assertEqual([q["entryRequiresAny"] for q in camping["quests"]], [[2], [4]])

    def test_repeatable_and_periodic_quests_are_removed_before_grouping(self):
        quests = [quest(1, nextQuestInChain=2), quest(2, nextQuestInChain=3),
                  quest(3, specialFlags=1, nextQuestInChain=4),
                  quest(4, nextQuestInChain=5), quest(5, nextQuestInChain=6),
                  quest(6, questFlags=4096, nextQuestInChain=7),
                  quest(7, questFlags=32768, nextQuestInChain=8),
                  quest(8, questFlags=65536, nextQuestInChain=9),
                  quest(9, questFlags=2, nextQuestInChain=10), quest(10)]
        chains = rank_chains([profile(quests)], {})
        self.assertEqual([[s["id"] for s in c["steps"]] for c in chains], [[1, 2], [4, 5], [9, 10]])

    def test_all_prerequisites_in_group_join(self):
        quests = [quest(1), quest(2), quest(3, preQuestGroup=[1, -2]),
                  quest(4, preQuestSingle=[1, 2])]
        chain, = rank_chains([profile(quests)], {})
        self.assertEqual(chain["steps"][2]["requires"], [1, 2])
        self.assertEqual(chain["steps"][3]["requires"], [])
        self.assertEqual(chain["steps"][3]["quests"][0]["requiresAny"], [1, 2])

    def test_faction_corrections_keep_distinct_requirements(self):
        shared = quest(1, nextQuestInChain=2, nextQuestInChainByClass={"MAGE": 3})
        alliance = profile([shared, quest(2, faction="Alliance", preQuestSingle=[1]),
                            quest(3, faction="Alliance"), quest(4, preQuestSingle=[2])])
        horde = profile([quest(1, nextQuestInChain=5), quest(5, faction="Horde"),
                         quest(4, preQuestSingle=[5])], profile="Horde")
        chain, = rank_chains([alliance, horde], {})
        steps = {step["id"]: step for step in chain["steps"]}
        self.assertEqual(steps[3]["after"], [1])
        self.assertEqual(steps[4]["requires"], [])
        shared_turn_in, = steps[4]["quests"]
        self.assertEqual(shared_turn_in["requires"], [2])
        self.assertEqual(shared_turn_in["factionOverrides"]["Horde"]["requires"], [5])

    def test_cycle_retains_explicit_edges(self):
        quests = [quest(1, nextQuestInChain=2), quest(2, preQuestSingle=[1]),
                  quest(3, preQuestSingle=[2], nextQuestInChain=1)]
        chain, = rank_chains([profile(quests)], {})
        self.assertEqual([(step["id"], step["after"]) for step in chain["steps"]],
                         [(1, []), (2, [1]), (3, [2])])
        self.assertEqual(chain["edgeConflicts"], [{"from": 3, "to": 1, "kind": "next"}])

    def test_map_and_instance_signals_use_only_representative_points(self):
        quests = [quest(1, startedBy={"1": [10]}, questLevel=6, questFlags=2),
                  quest(2, preQuestSingle=[1], questLevel=20, questFlags=64, dungeon="Quest zone",
                        finishedBy={"2": [20]}, objectives={"1": [{"1": 12, "3": 0}, [13]], "3": [[30]]})]
        npcs = {
            "10": {"rank": 1, "spawns": [{"uiMap": 11, "points": [[9, 9], [10, 10]]},
                                         {"uiMap": 14, "points": [[2, 2]]}]},
            "11": {"rank": 2, "spawns": [{"uiMap": 12, "points": [[10, 10], [12, 10], [40, 40]]},
                                         {"uiMap": 14, "points": [[80, 80]], "dungeon": "Unused dungeon"}]},
            "12": {"rank": 3, "spawns": [{"uiMap": 222, "points": [[-1, -1]], "dungeon": "Dungeon",
                                         "entrances": [[11, 45, 51], [14, 90, 60]]}]},
        }
        objects = {"20": {"spawns": [{"uiMap": 13, "points": [[75, 75], [76, 75]]},
                                      {"uiMap": 14, "points": [[12, 13]]}]}}
        items = {"30": {"itemDrops": [31]}, "31": {"npcDrops": [11, 12], "itemDrops": [30]}}
        data = profile(quests, npcs=npcs, objects=objects, items=items)
        chain, = rank_chains([data], {11: 1415, 12: 1415, 13: 1415, 14: 1414})
        self.assertEqual(chain["signals"], {
            "questCount": 2, "stepCount": 2, "faction": "Both", "restrictions": [], "levelSpan": [6, 20],
            "maps": [11, 12, 13], "continents": [1415], "elite": 0, "rareElite": 1, "boss": 1,
            "dungeons": ["Dungeon"], "dungeonObjectives": 1, "dungeonSteps": 1,
            "partyAcceptSteps": 1, "raidSteps": 1,
        })
        npc, unknown, item = chain["steps"][1]["quests"][0]["objectives"]
        self.assertEqual(npc["point"], {"uiMap": 11, "x": 450, "y": 510, "entrance": True, "dungeon": "Dungeon"})
        self.assertIsNone(unknown["point"])
        self.assertEqual(item["point"], {"uiMap": 12, "x": 110, "y": 100})
        self.assertEqual(item["maps"], [12])

    def test_item_dropper_cap_cluster_membership_and_distinct_kills(self):
        quests = [quest(1, nextQuestInChain=2, objectives={"1": [[6], [6]], "3": [[31]]}),
                  quest(2, objectives={"3": [[30], [31]]})]
        npcs = {
            str(i): {"rank": 3 if i in {5, 6} else 1,
                     "spawns": [{"uiMap": 12, "points": [[10, 10], [11, 11]] if i == 1 else [[20 * i, 50]]}]}
            for i in range(1, 6)
        }
        npcs["6"] = {"rank": 3}
        items = {"30": {"npcDrops": [2, 3, 4, 5]}, "31": {"npcDrops": [1, 2, 5]}}
        chain, = rank_chains([profile(quests, npcs=npcs, items=items)], {})
        self.assertEqual(chain["signals"]["elite"], 1)
        self.assertEqual(chain["signals"]["boss"], 1)
        common, named = chain["steps"][1]["quests"][0]["objectives"]
        self.assertEqual(common["clusterDropperIds"], [])
        self.assertEqual(named["clusterDropperIds"], [1])

    def test_variants_do_not_increase_score_or_prevent_full_progress(self):
        npc = {"rank": 0, "spawns": [{"uiMap": 12, "points": [[50, 50]], "dungeon": "Dungeon"}]}
        first = quest(1, nextQuestInChain=3, questFlags=64, objectives={"1": [[10]]})
        last = quest(3)
        variant = quest(2, exclusiveTo=[1], nextQuestInChain=3, questFlags=64, objectives={"1": [[10]]})
        single, = rank_chains([profile([first, last], npcs={"10": npc})], {})
        chain, = rank_chains([profile([first, variant, last], npcs={"10": npc})], {}, ({2, 3}, {1}))
        self.assertEqual(chain["score"], single["score"])
        self.assertEqual(chain["signals"]["dungeonSteps"], 1)
        self.assertEqual(chain["signals"]["raidSteps"], 1)
        self.assertEqual(chain["signals"]["questCount"], 3)
        self.assertEqual(chain["done"], 2)
        self.assertEqual(chain["inLog"], 0)
        self.assertIn("| Yes | 2/2 | — |", list(markdown([chain], journey=True))[-1])

    def test_ranking_uses_score_and_touched_quests_first(self):
        quests = [quest(1, nextQuestInChain=2), quest(2), quest(10, nextQuestInChain=11),
                  quest(11, nextQuestInChain=12), quest(12)]
        data = [profile(quests)]
        self.assertEqual([c["firstQuest"]["id"] for c in rank_chains(data, {})], [10, 1])
        self.assertEqual([c["firstQuest"]["id"] for c in rank_chains(data, {}, (set(), {2}))], [1, 10])

    def test_rsj1_matches_distinct_completed_quests(self):
        header = "H|1|Lancet|Realm|Human|Warrior|Alliance|60|0|test"
        records = "\n".join([header, "Q|1|1411|100|200|7|", "Q||1411|100|200|7|b", "Z|1411||0|1|0|0||"])
        with TemporaryDirectory() as directory:
            path = Path(directory) / "summary.txt"
            payload = base64.urlsafe_b64encode(records.encode()).rstrip(b"=")
            path.write_bytes(b"RSJ1." + payload + b"\n")
            journey = read_journey(path, "lan")
        self.assertEqual(journey, ({7}, set()))
        chain, = rank_chains([profile([quest(6, nextQuestInChain=7), quest(7)])], {}, journey)
        self.assertTrue(chain["touched"])
        self.assertEqual(chain["done"], 1)
        self.assertIn("| Yes | 1/2 | — |", list(markdown([chain], journey=True))[-1])

    def test_saved_variables_include_log_and_journal(self):
        data = '''
RosettaDB = {characters = {
    ["Lancet-Realm"] = {completedQuests = {7}, quests = {{questID = 8}},
        journal = {events = {{1, "Q", 1411, 100, 200, 9}}, backfill = {[10] = false}}},
    ["Other-Realm"] = {completedQuests = {20}}
}}
'''
        with TemporaryDirectory() as directory:
            path = Path(directory) / "Rosetta.lua"
            path.write_text(data, encoding="utf-8")
            self.assertEqual(read_journey(path, "lan"), ({7, 9, 10}, {8}))
