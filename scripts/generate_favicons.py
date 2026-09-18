#!/usr/bin/env python3
"""Generate the KrushiSetu favicon/PWA icon set from the master logo.

Inputs : /tmp/logo1254.bmp (32bpp top-down BMP dump of public/krushisetu-logo.png)
         /tmp/logo512.bmp  (512px sips-resized BMP, better downsample source)
Output : public/favicon-16.png, favicon-32.png, favicon-48.png, favicon.ico,
         apple-touch-icon.png (180), icon-192.png, icon-512.png, icon-maskable-512.png,
         site.webmanifest

Flattens the transparent logo onto the brand green (#1a5c38) for ICO and
apple-touch tiles; keeps true transparency for the small favicon PNGs.

Re-run after replacing the master logo:
  sips -s format bmp public/krushisetu-logo.png --out /tmp/logo1254.bmp
  sips -z 512 512 public/krushisetu-logo.png --out /tmp/logo512.png
  sips -s format bmp /tmp/logo512.png --out /tmp/logo512.bmp
  python3 scripts/generate_favicons.py
"""

import json
import struct
import zlib
from pathlib import Path

PUBLIC = Path(__file__).resolve().parent.parent / "public"

BRAND_GREEN = (0x1A, 0x5C, 0x38)  # primary-700, matches index.html theme-color
BRAND_GREEN_950 = (0x07, 0x1A, 0x10)  # primary-950, inner safe-zone disc


def read_bmp_topdown(path: str):
    """Return (width, height, rows) where rows[y][x] = (r, g, b, a), y=0 is top."""
    data = Path(path).read_bytes()
    w, h = struct.unpack("<ii", data[18:26])
    h = abs(h)
    bpp = struct.unpack("<H", data[28:30])[0]
    assert bpp == 32, f"expected 32bpp BMP, got {bpp}"
    off = struct.unpack("<I", data[10:14])[0]
    row_size = (w * 4 + 3) & ~3
    rows = []
    for y in range(h):
        base = off + y * row_size
        row = []
        for x in range(w):
            i = base + x * 4
            b, g, r, a = data[i], data[i + 1], data[i + 2], data[i + 3]
            row.append((r, g, b, a))
        rows.append(row)
    return w, h, rows


def resample(src, sw: int, sh: int, size: int):
    """Simple box-ish nearest-neighbour resample to a square `size`."""
    sx, sy = sw / size, sh / size
    out = []
    for y in range(size):
        f_y = min(int(y * sy), sh - 1)
        row = src[f_y]
        out_row = []
        for x in range(size):
            f_x = min(int(x * sx), sw - 1)
            out_row.append(row[f_x])
        out.append(out_row)
    return out


def flatten(rows, bg):
    """Composite alpha onto a solid bg colour -> opaque (r, g, b, 255) rows."""
    out = []
    for row in rows:
        out_row = []
        for r, g, b, a in row:
            na = a / 255.0
            out_row.append(
                (
                    int(round(r * na + bg[0] * (1 - na))),
                    int(round(g * na + bg[1] * (1 - na))),
                    int(round(b * na + bg[2] * (1 - na))),
                    255,
                )
            )
        out.append(out_row)
    return out


def write_png(path: Path, rows):
    """Minimal PNG writer: 8-bit RGBA, no interlace."""
    h = len(rows)
    w = len(rows[0])
    raw = b"".join(
        b"\x00" + bytes(v for px in row for v in px) for row in rows
    )

    def chunk(tag: bytes, payload: bytes) -> bytes:
        c = struct.pack(">I", len(payload)) + tag + payload
        return c + struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    idat = zlib.compress(raw, 9)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", idat)
        + chunk(b"IEND", b"")
    )
    path.write_bytes(png)


def write_ico(path: Path, entries):
    """ICO with PNG-compressed entries. entries = [(size, rgba_rows), ...]"""
    header = struct.pack("<HHH", 0, 1, len(entries))
    dir_size = 6 + 16 * len(entries)
    dir_bytes = b""
    data_bytes = b""
    offset = dir_size
    for size, rows in entries:
        raw = b"".join(b"\x00" + bytes(v for px in row for v in px) for row in rows)
        idat = zlib.compress(raw, 9)
        ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)

        def chunk(tag: bytes, payload: bytes) -> bytes:
            c = struct.pack(">I", len(payload)) + tag + payload
            return c + struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF)

        png = (
            b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", ihdr)
            + chunk(b"IDAT", idat)
            + chunk(b"IEND", b"")
        )
        dir_bytes += struct.pack(
            "<BBBBHHII",
            size % 256,
            size % 256,
            0,
            0,
            1,
            32,
            len(png),
            offset,
        )
        data_bytes += png
        offset += len(png)
    path.write_bytes(header + dir_bytes + data_bytes)


def maskable(rows, size: int):
    """Maskable-safe variant: logo at 70% inside a full-bleed brand-green disc
    on primary-950, so Android's circular mask never crops the artwork."""
    inner = resample(rows, len(rows[0]), len(rows), int(size * 0.70) & ~1)
    pad = (size - len(inner)) // 2
    cx = cy = size / 2
    r2 = (size * 0.48) ** 2
    out = []
    for y in range(size):
        row = []
        for x in range(size):
            d2 = (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2
            if d2 <= r2:
                bg = BRAND_GREEN
            else:
                bg = BRAND_GREEN_950
            iy, ix = y - pad, x - pad
            if 0 <= iy < len(inner) and 0 <= ix < len(inner):
                r, g, b, a = inner[iy][ix]
                na = a / 255.0
                row.append(
                    (
                        int(round(r * na + bg[0] * (1 - na))),
                        int(round(g * na + bg[1] * (1 - na))),
                        int(round(b * na + bg[2] * (1 - na))),
                        255,
                    )
                )
            else:
                row.append((bg[0], bg[1], bg[2], 255))
        out.append(row)
    return out


def main() -> None:
    sw, sh, src = read_bmp_topdown("/tmp/logo1254.bmp")
    _, _, src512 = read_bmp_topdown("/tmp/logo512.bmp")
    print(f"source {sw}x{sh}")

    # Small favicons: keep transparency, flatten the near-black fringe by
    # compositing only where alpha > 0 (transparent stays transparent).
    for size in (16, 32, 48):
        rows = resample(src, sw, sh, size)
        write_png(PUBLIC / f"favicon-{size}.png", rows)
        print(f"favicon-{size}.png")

    # ICO: opaque entries on brand green for crisp rendering everywhere.
    ico_entries = []
    for size in (16, 32, 48):
        ico_entries.append((size, flatten(resample(src, sw, sh, size), BRAND_GREEN)))
    write_ico(PUBLIC / "favicon.ico", ico_entries)
    print("favicon.ico (16/32/48)")

    # Apple touch: iOS flattens to opaque; use the 512 downsample for quality.
    apple = flatten(resample(src512, 512, 512, 180), BRAND_GREEN)
    write_png(PUBLIC / "apple-touch-icon.png", apple)
    print("apple-touch-icon.png (180)")

    # PWA icons.
    write_png(PUBLIC / "icon-192.png", flatten(resample(src512, 512, 512, 192), BRAND_GREEN))
    write_png(PUBLIC / "icon-512.png", flatten(src512, BRAND_GREEN))
    write_png(PUBLIC / "icon-maskable-512.png", maskable(src512, 512))
    print("icon-192.png / icon-512.png / icon-maskable-512.png")

    manifest = {
        "name": "KrushiSetu — Digital Agriculture. Transparent Procurement.",
        "short_name": "KrushiSetu",
        "description": "Digital bridge between farmers and transparent procurement: AI crop health, digital weighing, RFID tracking and government schemes.",
        "start_url": "/",
        "scope": "/",
        "display": "standalone",
        "background_color": "#071a10",
        "theme_color": "#1a5c38",
        "lang": "en",
        "dir": "ltr",
        "categories": ["government", "business", "productivity"],
        "icons": [
            {"src": "/favicon-32.png", "sizes": "32x32", "type": "image/png"},
            {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
            {"src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    (PUBLIC / "site.webmanifest").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    print("site.webmanifest")

    # Drop the interim 256px file superseded by the full set.
    old = PUBLIC / "krushisetu-logo-256.png"
    if old.exists():
        old.unlink()
        print("removed krushisetu-logo-256.png")


if __name__ == "__main__":
    main()
