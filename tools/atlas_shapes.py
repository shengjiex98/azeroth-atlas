# /// script
# requires-python = ">=3.11"
# dependencies = ["numpy", "pillow", "scikit-image", "scipy"]
# ///
"""Trace each zone's outline on the continent maps into tools/data/zone_shapes.json.

Usage: uv run tools/atlas_shapes.py [--preview DIR] [--compare DIR]

The continent art paints every zone as a tinted patch with dark border lines. Land is the saturated
part of the image. A watershed grown from the seed points stops at those borders, and the game's
zone rectangles limit where each label can grow. Seeds are percentages of the continent image.
Gilneas, Quel'Thalas, and the parchment frame have unassigned seeds.
"""

import argparse
import heapq
from itertools import count
import json
from pathlib import Path
import re

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from skimage.color import rgb2hsv, rgb2lab
from skimage.filters import gaussian, sobel
from skimage.measure import approximate_polygon, find_contours
from skimage.morphology import black_tophat, disk, remove_small_holes
from skimage.segmentation import find_boundaries

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "tools" / "data"
EXPORT = DATA / "forever_maps.json"
SEEDS = DATA / "zone_seeds.json"
OUT = DATA / "zone_shapes.json"
MAPS = ROOT / "lore" / "maps"
MIN_PIECE = 40  # pixels; smaller detached bits are river mouths and noise, not islands
RECT_MARGIN = 0.01  # fraction of the continent, to leave room for painted borders
MAP_SIZE = (1002, 668)


def rect_mask(rect, width, height):
    left, top, right, bottom = rect
    x = np.arange(width + 1) / width
    y = np.arange(height + 1) / height
    # Keep the whole pixel inside the margin so the contour can follow its edge.
    columns = (x[:-1] >= left - RECT_MARGIN) & (x[1:] <= right + RECT_MARGIN)
    rows = (y[:-1] >= top - RECT_MARGIN) & (y[1:] <= bottom + RECT_MARGIN)
    return rows[:, None] & columns


def constrained_watershed(elevation, markers, land, allowed):
    """Flood the lowest available barrier first, breaking ties in arrival order."""
    height, width = land.shape
    labels = markers.ravel().copy()
    elevation = elevation.ravel()
    land = land.ravel()
    allowed = [mask.ravel() for mask in allowed]
    arrival = count()
    queue = [(elevation[i], next(arrival), i) for i in np.flatnonzero(labels)]
    heapq.heapify(queue)
    while queue:
        level, _, i = heapq.heappop(queue)
        label = labels[i]
        y, x = divmod(i, width)
        for neighbor in (
            i - width if y else i,
            i - 1 if x else i,
            i + 1 if x + 1 < width else i,
            i + width if y + 1 < height else i,
        ):
            if labels[neighbor] == 0 and land[neighbor] and allowed[label - 1][neighbor]:
                labels[neighbor] = label
                heapq.heappush(queue, (max(level, elevation[neighbor]), next(arrival), neighbor))
    return labels.reshape(height, width)


def segment(image, seeds, zones):
    """Label image: 1..n for seeds["zones"] in order, n + 1 for unassigned regions, 0 for sea."""
    hsv = rgb2hsv(image)
    land = ndi.binary_opening(gaussian(hsv[..., 1], 1.2) > 0.58, disk(1))
    land = remove_small_holes(land, max_size=275)
    height, width = land.shape
    groups = [*seeds["zones"].items(), ("unassigned", seeds["unassigned"])]
    allowed = [rect_mask(zones[zone]["rect"], width, height) for zone in seeds["zones"]]
    allowed.append(np.ones(land.shape, bool))
    markers = np.zeros(land.shape, int)
    yy, xx = np.mgrid[:height, :width]
    for (label, (zone, points)), limits in zip(enumerate(groups, 1), allowed):
        for px, py in points:
            seed = ((xx - px / 100 * width) ** 2 + (yy - py / 100 * height) ** 2 <= 9) & land & limits
            if not seed.any():
                raise SystemExit(f"{zone}: seed ({px}, {py}) misses land in its allowed area")
            markers[seed] = label
    # The parchment frame is as saturated as land and touches it in places; flood it as unassigned.
    frame = np.zeros(land.shape, bool)
    frame[[0, -1]] = frame[:, [0, -1]] = True
    markers[frame & land] = len(groups)
    # Borders are thin dark lines (black top-hat); a color edge term separates zones the lines miss.
    lines = gaussian(black_tophat(gaussian(hsv[..., 2], 0.7), disk(5)), 1.2)
    lab = rgb2lab(gaussian(image, 1.5, channel_axis=-1))
    edges = (sobel(lab[..., 1]) + sobel(lab[..., 2])) / 40
    labels = constrained_watershed(lines + 0.5 * edges, markers, land, allowed)
    # Lakes and the map's lettering sit inside zones. Fill them from the nearest legal label.
    enclosed = ndi.binary_fill_holes((labels > 0) & (labels < len(groups))) & ~land
    nearest = np.full(land.shape, 40.0)
    for label, limits in enumerate(allowed, 1):
        distance = ndi.distance_transform_edt(labels != label)
        claim = enclosed & limits & (distance < nearest)
        labels[claim] = label
        nearest[claim] = distance[claim]
    return labels


def outline(mask, width, height, seeds):
    """SVG path in map percentages, plus a label anchor inside the largest piece."""
    mask = remove_small_holes(mask, max_size=MIN_PIECE)
    pieces, count = ndi.label(mask)
    sizes = ndi.sum(mask, pieces, range(1, count + 1))
    # Keep explicitly seeded islands even when the art paints them as just a few pixels.
    seeded = {pieces[round(y / 100 * height), round(x / 100 * width)] for x, y in seeds}
    keep = np.isin(pieces, [i for i, size in enumerate(sizes, 1) if size >= MIN_PIECE or i in seeded])
    smooth = gaussian(np.pad(keep, 2).astype(float), 1.0)
    rings = []
    for contour in find_contours(smooth, 0.5):
        contour = approximate_polygon(contour, tolerance=0.6)
        if len(contour) < 4:
            continue
        points = [f"{(x - 2 + .5) / width * 100:.2f} {(y - 2 + .5) / height * 100:.2f}" for y, x in contour[:-1]]
        rings.append("M" + "L".join(points) + "Z")
    largest = pieces == 1 + int(np.argmax(sizes))
    depth = ndi.distance_transform_edt(largest)
    y, x = np.unravel_index(np.argmax(depth), depth.shape)
    return "".join(rings), [round((x + .5) / width * 100, 2), round((y + .5) / height * 100, 2)]


def preview(image, labels, seeds, path):
    scale = 2
    big = np.kron(labels, np.ones((scale, scale), int))
    art = np.asarray(Image.fromarray((image * 255).astype(np.uint8)).resize(big.shape[::-1], Image.LANCZOS)).copy()
    hues = (np.random.default_rng(7).random((len(seeds["zones"]) + 2, 3)) * 255).astype(np.uint8)
    zone = (big > 0) & (big <= len(seeds["zones"]))
    art[zone] = (art[zone] * .45 + hues[big[zone]] * .55).astype(np.uint8)
    art[big == len(seeds["zones"]) + 1] //= 3
    art[find_boundaries(big, mode="inner")] = (255, 0, 255)
    picture = Image.fromarray(art)
    draw = ImageDraw.Draw(picture)
    for name, points in [*seeds["zones"].items(), *(("-", [p]) for p in seeds["unassigned"])]:
        for px, py in points:
            x, y = px / 100 * picture.width, py / 100 * picture.height
            draw.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(0, 255, 255))
            draw.text((x + 4, y - 6), name, fill=(255, 255, 255), stroke_width=2, stroke_fill=(0, 0, 0))
    picture.save(path)


def compare(continent, zone_id, zone, shape, output):
    """Draw the exported outline in the zone map's coordinate frame."""
    source = MAPS / f"{zone_id}.jpg"
    width, height = MAP_SIZE
    left, top, right, bottom = zone["rect"]
    box = (left * continent.width, top * continent.height, right * continent.width, bottom * continent.height)
    crop = continent.transform(MAP_SIZE, Image.Transform.EXTENT, box, Image.Resampling.BICUBIC)
    if shape:
        draw = ImageDraw.Draw(crop)
        for ring in shape["path"].split("Z")[:-1]:
            points = [
                ((float(x) / 100 - left) / (right - left) * width,
                 (float(y) / 100 - top) / (bottom - top) * height)
                for x, y in re.findall(r"[ML]([\d.-]+) ([\d.-]+)", ring)
            ]
            draw.line(points + points[:1], fill="black", width=5)
            draw.line(points + points[:1], fill="magenta", width=2)

    picture = Image.new("RGB", (2 * width, height + 24), "#221b12")
    draw = ImageDraw.Draw(picture)
    draw.text((8, 5), f"{zone_id} {zone['name']} | Wowhead zone map", fill="white")
    draw.text((width + 8, 5), "Continent crop | " + ("traced outline" if shape else "capital city"), fill="white")
    if source.exists():
        with Image.open(source) as local:
            picture.paste(local.convert("RGB").resize(MAP_SIZE, Image.Resampling.LANCZOS), (0, 24))
    else:
        draw.text((8, 40), "No local zone map available", fill="white")
    picture.paste(crop, (width, 24))
    picture.save(output / f"{zone_id}.png", compress_level=2)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--preview", type=Path, help="write an outline check image per continent here")
    parser.add_argument("--compare", type=Path, help="write side-by-side comparisons for every exported map here")
    args = parser.parse_args()
    zones = json.loads(EXPORT.read_text())["zones"]
    shapes = {}
    for continent_id, seeds in json.loads(SEEDS.read_text()).items():
        continent_zones = {zone: data for zone, data in zones.items() if str(data["continent"]) == continent_id}
        with Image.open(MAPS / f"{continent_id}.jpg") as source:
            continent = source.convert("RGB")
        image = np.asarray(continent).astype(float) / 255
        labels = segment(image, seeds, continent_zones)
        height, width = labels.shape
        if args.preview:
            args.preview.mkdir(parents=True, exist_ok=True)
            preview(image, labels, seeds, args.preview / f"shapes_{continent_id}.png")
        for label, zone in enumerate(seeds["zones"], 1):
            if not (labels == label).any():
                raise SystemExit(f"zone {zone}: no seed point lies on land")
            path, anchor = outline(labels == label, width, height, seeds["zones"][zone])
            if not path:
                raise SystemExit(f"zone {zone}: no outline survives tracing")
            shapes[zone] = {"path": path, "anchor": anchor}
        if args.compare:
            args.compare.mkdir(parents=True, exist_ok=True)
            for zone, data in continent_zones.items():
                compare(continent, zone, data, shapes.get(zone), args.compare)
    OUT.write_text(json.dumps(shapes, indent=0, sort_keys=True) + "\n")


if __name__ == "__main__":
    main()
