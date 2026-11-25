#!/usr/bin/env python3
"""Convert a WoW SavedVariables file to JSON.

Usage: sv_to_json.py FILE [VARIABLE]

Prints every top-level variable as one JSON object, or only VARIABLE if given.
Lua tables with keys 1..n become lists; other tables become objects with string keys.
"""

import json
import re
import sys

_NUMBER = re.compile(rb"-?(?:0x[0-9a-fA-F]+|(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?|inf|nan)")
_NAME = re.compile(rb"[A-Za-z_][A-Za-z0-9_]*")
_ESCAPES = {ord("n"): b"\n", ord("t"): b"\t", ord("r"): b"\r", ord("a"): b"\a", ord("b"): b"\b",
            ord("f"): b"\f", ord("v"): b"\v", ord("\\"): b"\\", ord('"'): b'"', ord("'"): b"'", ord("\n"): b"\n"}


class Parser:
    def __init__(self, data: bytes, encoding: str = "utf-8"):
        # "latin-1" maps every byte to one character, so binary strings (compressed addon data) survive
        # and can be recovered with str.encode("latin-1").
        self.s = data
        self.i = 0
        self.encoding = encoding

    def ws(self):
        s, n = self.s, len(self.s)
        while self.i < n:
            c = s[self.i]
            if c in b" \t\r\n,;":
                self.i += 1
            elif s.startswith(b"--", self.i):
                end = s.find(b"\n", self.i)
                self.i = n if end < 0 else end + 1
            else:
                break

    def string(self) -> str:
        quote = self.s[self.i]
        self.i += 1
        out = bytearray()
        s = self.s
        while True:
            c = s[self.i]
            if c == quote:
                self.i += 1
                return out.decode(self.encoding, errors="replace")
            if c == ord("\\"):
                nxt = s[self.i + 1]
                if nxt in _ESCAPES:
                    out += _ESCAPES[nxt]
                    self.i += 2
                elif chr(nxt).isdigit():
                    m = re.match(rb"\d{1,3}", s[self.i + 1:self.i + 4])
                    out.append(int(m.group()) & 0xFF)
                    self.i += 1 + len(m.group())
                else:
                    out.append(nxt)
                    self.i += 2
            else:
                out.append(c)
                self.i += 1

    def value(self):
        self.ws()
        c = self.s[self.i:self.i + 1]
        if c == b"{":
            return self.table()
        if c in (b'"', b"'"):
            return self.string()
        m = _NUMBER.match(self.s, self.i)
        if m:
            self.i = m.end()
            text = m.group().decode()
            if "inf" in text or "nan" in text:
                return float(text)
            return int(text, 0) if re.fullmatch(r"-?(0x[0-9a-fA-F]+|\d+)", text) else float(text)
        m = _NAME.match(self.s, self.i)
        if m:
            self.i = m.end()
            return {b"true": True, b"false": False, b"nil": None}[m.group()]
        raise ValueError(f"unexpected {self.s[self.i:self.i + 20]!r} at byte {self.i}")

    def table(self):
        self.i += 1
        result, auto = {}, 1
        while True:
            self.ws()
            if self.s[self.i:self.i + 1] == b"}":
                self.i += 1
                break
            if self.s[self.i:self.i + 1] == b"[":
                self.i += 1
                key = self.value()
                self.ws()
                self.i += 1  # ]
                self.ws()
                self.i += 1  # =
                result[key] = self.value()
            else:
                m = _NAME.match(self.s, self.i)
                after = m and self.s[m.end():].lstrip()[:1]
                if m and after == b"=" and not self.s[m.end():].lstrip().startswith(b"=="):
                    self.i = m.end()
                    self.ws()
                    self.i += 1
                    result[m.group().decode()] = self.value()
                else:
                    result[auto] = self.value()
                    auto += 1
        if result and all(isinstance(k, int) for k in result) and set(result) == set(range(1, len(result) + 1)):
            return [result[k] for k in range(1, len(result) + 1)]
        return {str(k): v for k, v in result.items()}

    def file(self) -> dict:
        out = {}
        while True:
            self.ws()
            if self.i >= len(self.s):
                return out
            m = _NAME.match(self.s, self.i)
            if not m:
                raise ValueError(f"expected variable name at byte {self.i}")
            self.i = m.end()
            self.ws()
            self.i += 1  # =
            out[m.group().decode()] = self.value()


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    with open(sys.argv[1], "rb") as f:
        data = Parser(f.read()).file()
    if len(sys.argv) > 2:
        data = data[sys.argv[2]]
    json.dump(data, sys.stdout, ensure_ascii=False, indent=1)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
