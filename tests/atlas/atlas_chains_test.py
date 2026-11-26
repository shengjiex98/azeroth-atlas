import base64
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from tools.atlas_chains import markdown, rank_chains, read_journey


def quest(quest_id, **fields):
    return {"id": quest_id, "name": {"enUS": f"Quest {quest_id}"}, "faction": "Both",
            "questLevel": 20, **fields}


def profile(quests, **data):
    return {"profile": "Alliance", "quests": quests, "npcs": {}, "objects": {}, "items": {},
            "npcRanks": {"ELITE": 1, "RARE_ELITE": 2, "BOSS": 3}, "partyAcceptFlag": 2, "raidFlag": 64,
            **data}


class AtlasChainsTest(unittest.TestCase):
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

    def test_structurally_matching_faction_and_class_variants(self):
        for restriction in ({"faction": "Alliance"}, {"requiredClasses": 1}):
            with self.subTest(restriction=restriction):
                other = {"faction": "Horde"} if "faction" in restriction else {"requiredClasses": 2}
                name = {"enUS": "Parallel step"}
                quests = [quest(1, name=name, **restriction), quest(2, name=name, **other),
                          quest(3, preQuestSingle=[1, 2])]
                chain, = rank_chains([profile(quests)], {})
                self.assertEqual(chain["signals"]["questCount"], 3)
                self.assertEqual(chain["signals"]["stepCount"], 2)
                self.assertEqual(chain["signals"]["faction"], "Both")

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

    def test_signals_and_cluster_center_from_all_spawn_maps(self):
        quests = [quest(1, startedBy={"1": [10]}, questLevel=6, questFlags=2),
                  quest(2, preQuestSingle=[1], questLevel=20, questFlags=64,
                        finishedBy={"2": [20]}, objectives={"1": [{"1": 12, "3": 0}], "3": [[30]]})]
        npcs = {
            "10": {"rank": 1, "spawns": [{"uiMap": 11, "points": [[9, 9]]}]},
            "11": {"rank": 2, "spawns": [{"uiMap": 12, "points": [[10, 10], [12, 10], [40, 40]]},
                                          {"uiMap": 13, "points": [[80, 80]]}]},
            "12": {"rank": 3, "spawns": [{"uiMap": 222, "points": [[-1, -1]], "dungeon": "Dungeon",
                                          "entrances": [[11, 45, 51]]}]},
        }
        objects = {"20": {"spawns": [{"uiMap": 13, "points": [[75, 75]]}]}}
        items = {"30": {"itemDrops": [31]}, "31": {"npcDrops": [11, 12], "itemDrops": [30]}}
        data = profile(quests, npcs=npcs, objects=objects, items=items)
        chain, = rank_chains([data], {11: 1414, 12: 1415, 13: 1415})
        self.assertEqual(chain["signals"], {
            "questCount": 2, "stepCount": 2, "faction": "Both", "levelSpan": [6, 20],
            "maps": [11, 12, 13], "continents": [1414, 1415], "elite": 0, "rareElite": 1, "boss": 1,
            "dungeons": ["Dungeon"], "dungeonObjectives": 2, "partyAcceptQuests": 1, "raidQuests": 1,
        })
        npc, item = chain["steps"][1]["quests"][0]["objectives"]
        self.assertEqual(npc["point"], {"uiMap": 11, "x": 450, "y": 510, "entrance": True})
        self.assertEqual(item["point"], {"uiMap": 12, "x": 110, "y": 100})
        self.assertEqual(item["maps"], [11, 12, 13])

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
        self.assertIn("| Yes | 1/2 |", list(markdown([chain], journey=True))[-1])

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
