import unittest

from tools.atlas_places import place_pin, update_places


class AtlasPlacesTest(unittest.TestCase):
    def setUp(self):
        self.profile = {
            "npcs": {"10": {"spawns": [
                {"uiMap": 101, "points": [[20.12, 30], [90, 90], [-1, -1]]},
                {"uiMap": 102, "points": [[10, 20], [11, 20], [12, 20]]},
            ]}},
            "objects": {"11": {"spawns": [{"uiMap": 101, "points": [[22, 31.6]]}]}},
            "instances": {"12": {"entrances": [[102, 50, 60], [101, 15.57, 29.99], [101, 17, 30]]}},
        }
        self.npc = {"type": "npc", "id": 10}
        self.object = {"type": "object", "id": 11}
        self.entrance = {"type": "entrance", "id": 12}

    def test_clusters_valid_spawns_on_the_place_map(self):
        record = {"anchors": [self.npc, self.object], "note": "Local guard and chest"}
        profiles = [self.profile, {**self.profile, "objects": {}}]
        self.assertEqual(place_pin(profiles, 101, "camp", record), (21.1, 30.8))

    def test_uses_first_instance_entrance_on_the_place_map(self):
        record = {"anchors": [self.entrance], "note": "Dungeon entrance"}
        self.assertEqual(place_pin([self.profile], 101, "dungeon", record), (15.6, 30.0))

    def test_requires_each_anchor_to_have_a_point_on_the_place_map(self):
        record = {"anchors": [self.npc, self.object], "note": "Local guard and chest"}
        with self.assertRaisesRegex(ValueError, r"Zone 102, place camp: object 11 .* has no valid spawn on UiMap 102"):
            place_pin([self.profile], 102, "camp", record)

    def test_rewrites_only_anchored_places_and_is_idempotent(self):
        world = """  zone(101, {
    places: [
      { id: 'camp', name: L('Camp', 'Camp'), text: L('A guard.', 'A guard.') },
      P('city', L('City', 'City'), 10, 20.0, L('A city.', 'A city.'))
    ],
  });
  zone(102, {
    places: [
      P('camp', L('Camp', 'Camp'), 5, 6, L('Another camp.', 'Another camp.'))
    ],
  });
"""
        pins = {101: {"camp": (21.1, 30.8)}}
        expected = world.replace(
            "{ id: 'camp', name: L('Camp', 'Camp'), text: L('A guard.', 'A guard.') }",
            "P('camp', L('Camp', 'Camp'), 21.1, 30.8, L('A guard.', 'A guard.'))",
        )
        self.assertEqual(update_places(world, pins), expected)
        self.assertEqual(update_places(expected, pins), expected)
