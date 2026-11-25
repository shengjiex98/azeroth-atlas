# /// script
# requires-python = ">=3.11"
# dependencies = ["numpy", "pillow", "scikit-image", "scipy"]
# ///
"""Trace each zone's outline on the continent maps into tools/data/zone_shapes.json.

Usage: uv run tools/atlas_shapes.py [--preview DIR]

The continent art paints every zone as a tinted patch with dark border lines. Land is the saturated
part of the image; a watershed grown from the seed points in tools/data/zone_seeds.json stops at the
borders. Seeds are percentages of the continent image. Painted regions the game doesn't treat as a
zone (Gilneas, Quel'Thalas, Hyjal) get an "unassigned" seed so their neighbors don't flood them.
After moving a seed, check the outlines with --preview, which writes one PNG per continent.
"""

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from skimage.color import rgb2hsv, rgb2lab
from skimage.filters import gaussian, sobel
from skimage.measure import approximate_polygon, find_contours
from skimage.morphology import black_tophat, disk, remove_small_holes
from skimage.segmentation import expand_labels, find_boundaries, watershed

ROOT = Path(__file__).resolve().parent.parent
SEEDS = ROOT / "tools" / "data" / "zone_seeds.json"
OUT = ROOT / "tools" / "data" / "zone_shapes.json"
MAPS = ROOT / "lore" / "maps"
MIN_PIECE = 40  # pixels; smaller detached bits are river mouths and noise, not islands


def segment(image, seeds):
    """Label image: 1..n for seeds["zones"] in order, n + 1 for unassigned regions, 0 for sea."""
    hsv = rgb2hsv(image)
    land = ndi.binary_opening(gaussian(hsv[..., 1], 1.2) > 0.5, disk(1))
    height, width = land.shape
    groups = list(seeds["zones"].values()) + [seeds["unassigned"]]
    markers = np.zeros(land.shape, int)
    yy, xx = np.mgrid[:height, :width]
    for label, points in enumerate(groups, 1):
        for px, py in points:
            markers[((xx - px / 100 * width) ** 2 + (yy - py / 100 * height) ** 2 <= 9) & land] = label
    # The parchment frame is as saturated as land and touches it in places; flood it as unassigned.
    frame = np.zeros(land.shape, bool)
    frame[[0, -1]] = frame[:, [0, -1]] = True
    markers[frame & land] = len(groups)
    # Borders are thin dark lines (black top-hat); a color edge term separates zones the lines miss.
    lines = gaussian(black_tophat(gaussian(hsv[..., 2], 0.7), disk(5)), 1.2)
    lab = rgb2lab(gaussian(image, 1.5, channel_axis=-1))
    edges = (sobel(lab[..., 1]) + sobel(lab[..., 2])) / 40
    labels = watershed(lines + 0.5 * edges, markers, mask=land)
    # Lakes and the map's lettering sit inside zones: give them to the nearest zone.
    zones = (labels > 0) & (labels < len(groups))
    enclosed = ndi.binary_fill_holes(zones) & ~land
    grown = expand_labels(labels, distance=40)
    labels[enclosed] = grown[enclosed]
    return labels


def outline(mask, width, height):
    """SVG path (even-odd rings) in percentages of the map, and a label anchor deep inside the largest piece.

    Only specks are filled: a zone can wrap around another region, as Felwood does around Hyjal.
    """
    mask = remove_small_holes(mask, max_size=MIN_PIECE)
    pieces, count = ndi.label(mask)
    sizes = ndi.sum(mask, pieces, range(1, count + 1))
    keep = np.isin(pieces, [i + 1 for i, size in enumerate(sizes) if size >= MIN_PIECE])
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


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--preview", type=Path, help="write an outline check image per continent here")
    args = parser.parse_args()
    shapes = {}
    for continent, seeds in json.loads(SEEDS.read_text()).items():
        image = np.asarray(Image.open(MAPS / f"{continent}.jpg").convert("RGB")).astype(float) / 255
        labels = segment(image, seeds)
        height, width = labels.shape
        if args.preview:
            args.preview.mkdir(parents=True, exist_ok=True)
            preview(image, labels, seeds, args.preview / f"shapes_{continent}.png")
        for label, zone in enumerate(seeds["zones"], 1):
            if not (labels == label).any():
                raise SystemExit(f"zone {zone}: no seed point lies on land")
            path, anchor = outline(labels == label, width, height)
            shapes[zone] = {"path": path, "anchor": anchor}
    OUT.write_text(json.dumps(shapes, indent=0, sort_keys=True) + "\n")


if __name__ == "__main__":
    main()
