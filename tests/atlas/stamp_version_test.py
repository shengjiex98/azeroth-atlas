import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from tools.stamp_version import stamp_version


INDEX = """<!doctype html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Marcellus&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="icon.png">
  <script src="//example.org/external.js"></script>
  <script src="data/world.js?lang=en#data" defer></script>
  <script src="app.js" defer></script>
  <!-- <script src="example.js"></script> -->
</head>
<body></body>
</html>
"""
VERSION = "a" * 40


class StampVersionTest(unittest.TestCase):
    def setUp(self):
        directory = TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.lore = Path(directory.name)
        atlas = self.lore / "atlas"
        atlas.mkdir()
        self.index = atlas / "index.html"
        self.index.write_text(INDEX, encoding="utf-8")
        self.manifest = atlas / "version.json"

    def test_stamps_meta_and_manifest(self):
        stamp_version(self.lore, VERSION)
        html = self.index.read_text(encoding="utf-8")
        self.assertIn(f'<meta name="atlas-version" content="{VERSION}">\n</head>', html)
        self.assertEqual(json.loads(self.manifest.read_text(encoding="utf-8")), {"version": VERSION})

    def test_versions_only_local_scripts_and_stylesheets(self):
        stamp_version(self.lore, VERSION)
        html = self.index.read_text(encoding="utf-8")
        self.assertIn(f'href="styles.css?v={VERSION}"', html)
        self.assertIn(f'src="data/world.js?lang=en&amp;v={VERSION}#data" defer', html)
        self.assertIn(f'src="app.js?v={VERSION}" defer', html)
        self.assertEqual(html.count(f"v={VERSION}"), 3)
        self.assertIn('href="https://fonts.googleapis.com/css2?family=Marcellus&amp;display=swap"', html)
        self.assertIn('href="icon.png"', html)
        self.assertIn('src="//example.org/external.js"', html)
        self.assertIn('<!-- <script src="example.js"></script> -->', html)

    def test_restamping_is_idempotent_and_replaces_the_previous_version(self):
        stamp_version(self.lore, VERSION)
        first = self.index.read_bytes(), self.manifest.read_bytes()
        stamp_version(self.lore, VERSION)
        self.assertEqual((self.index.read_bytes(), self.manifest.read_bytes()), first)

        next_version = "b" * 40
        stamp_version(self.lore, next_version)
        self.assertEqual(self.index.read_bytes(), first[0].replace(VERSION.encode(), next_version.encode()))
        self.assertEqual(self.manifest.read_bytes(), first[1].replace(VERSION.encode(), next_version.encode()))
