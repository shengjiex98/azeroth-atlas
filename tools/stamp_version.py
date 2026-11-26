#!/usr/bin/env python3
"""Stamp a deploy copy of lore/ with a version and versioned Atlas asset URLs."""

import argparse
from html import escape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import urlencode, urlsplit


class AtlasIndex(HTMLParser):
    def __init__(self, source, version):
        super().__init__()
        self.version = version
        self.line_starts = [0, *(match.end() for match in re.finditer("\n", source))]
        self.edits = []
        self.has_version = False
        self.head_end = None
        self.feed(source)
        self.close()
        if not self.has_version:
            if self.head_end is None:
                raise ValueError("Atlas index is missing its closing head tag")
            meta = f'<meta name="atlas-version" content="{escape(version)}">'
            self.edits.append((self.head_end, self.head_end, f"  {meta}\n"))

    def source_offset(self):
        line, column = self.getpos()
        return self.line_starts[line - 1] + column

    def handle_endtag(self, tag):
        if tag == "head":
            self.head_end = self.source_offset()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta" and (attrs.get("name") or "").lower() == "atlas-version":
            attrs["content"] = self.version
            self.has_version = True
        else:
            if tag == "script":
                key = "src"
            elif tag == "link" and "stylesheet" in (attrs.get("rel") or "").lower().split():
                key = "href"
            else:
                return
            url = urlsplit(attrs.get(key) or "")
            if url.scheme or url.netloc or not url.path:
                return
            query = [part for part in url.query.split("&") if part and part.partition("=")[0] != "v"]
            query.append(urlencode({"v": self.version}))
            attrs[key] = url._replace(query="&".join(query)).geturl()

        attributes = "".join(f' {key}="{escape(value)}"' if value is not None else f" {key}"
                             for key, value in attrs.items())
        start = self.source_offset()
        self.edits.append((start, start + len(self.get_starttag_text()), f"<{tag}{attributes}>"))


def stamp_version(lore, version):
    atlas = lore / "atlas"
    index = atlas / "index.html"
    source = index.read_text(encoding="utf-8")
    for start, end, replacement in sorted(AtlasIndex(source, version).edits, reverse=True):
        source = source[:start] + replacement + source[end:]
    index.write_text(source, encoding="utf-8")
    manifest = json.dumps({"version": version}, separators=(",", ":"))
    (atlas / "version.json").write_text(manifest + "\n", encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("lore", type=Path, help="path to the deploy copy of lore/")
    parser.add_argument("version", help="Git commit SHA to stamp")
    args = parser.parse_args()
    stamp_version(args.lore, args.version)
