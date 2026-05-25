#!/usr/bin/env python3
"""
Image optimizer for besawsbeesauce.com
Compresses source images and creates mobile variants.

Usage:
  python scripts/optimize-images.py              # dry run (preview only)
  python scripts/optimize-images.py --apply      # process all images
  python scripts/optimize-images.py --apply public/logo.jpg   # specific file
"""

import os
import sys
import argparse
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install Pillow: pip install Pillow")
    sys.exit(1)

# Max width (px) by path pattern — height scales proportionally
SIZE_RULES = [
    ('logo.jpg',     600),
    ('products/',   1200),
    ('uploads/',    1200),
    ('bees.jpg',    1920),
]
DEFAULT_MAX_WIDTH = 1200
MOBILE_WIDTH      = 480
JPEG_QUALITY      = 82
MOBILE_QUALITY    = 75
SKIP_NAMES        = {'favicon-32x32.png', 'apple-touch-icon.png', 'favicon.ico'}

def max_width_for(rel: str) -> int:
    for pattern, w in SIZE_RULES:
        if pattern in rel:
            return w
    return DEFAULT_MAX_WIDTH

def fmt(n: int) -> str:
    return f"{n / 1024:.0f} KB"

def savings_pct(before: int, after: int) -> str:
    return f"{100*(1 - after/before):.0f}% smaller"

def optimize(src: Path, max_w: int, apply: bool) -> None:
    before = src.stat().st_size

    with Image.open(src) as img:
        orig_w, orig_h = img.size

        new_w = min(orig_w, max_w)
        new_h = round(orig_h * new_w / orig_w)

        print(f"\n  {src.name}  ({orig_w}×{orig_h}, {fmt(before)})")

        if not apply:
            mobile_w = min(MOBILE_WIDTH, new_w)
            mobile_h = round(new_h * mobile_w / new_w)
            action = f"resize {orig_w}→{new_w}px + recompress" if new_w < orig_w else "recompress only"
            print(f"    Would: {action}")
            print(f"    Mobile: {src.stem}-mobile{src.suffix} at {mobile_w}×{mobile_h}")
            return

        # Resize if needed
        resized = img.resize((new_w, new_h), Image.LANCZOS) if new_w < orig_w else img.copy()

        # Convert RGBA→RGB for JPEG
        if src.suffix.lower() in ('.jpg', '.jpeg') and resized.mode in ('RGBA', 'P'):
            resized = resized.convert('RGB')

        save_kw: dict = {}
        if src.suffix.lower() in ('.jpg', '.jpeg'):
            save_kw = {'quality': JPEG_QUALITY, 'optimize': True}
        elif src.suffix.lower() == '.png':
            save_kw = {'optimize': True}

        import tempfile, shutil
        with tempfile.NamedTemporaryFile(suffix=src.suffix, delete=False) as tmp:
            tmp_path = Path(tmp.name)
        resized.save(tmp_path, **save_kw)
        after = tmp_path.stat().st_size
        if after < before:
            shutil.move(str(tmp_path), str(src))
            print(f"    Saved:  {new_w}×{new_h}, {fmt(after)} ({savings_pct(before, after)})")
        else:
            tmp_path.unlink()
            print(f"    Skip:   already optimal ({fmt(before)}) — not overwriting")

        # Mobile variant
        mobile_w = min(MOBILE_WIDTH, new_w)
        mobile_h = round(new_h * mobile_w / new_w)
        mobile = resized.resize((mobile_w, mobile_h), Image.LANCZOS)
        mobile_path = src.with_name(f"{src.stem}-mobile{src.suffix}")
        mobile.save(mobile_path, **save_kw)
        print(f"    Mobile: {mobile_path.name} — {mobile_w}×{mobile_h}, {fmt(mobile_path.stat().st_size)}")

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true', help='Actually modify files (default: dry run)')
    ap.add_argument('paths', nargs='*', help='Specific files (default: all public/ images)')
    args = ap.parse_args()

    root = Path(__file__).parent.parent / 'public'

    if args.paths:
        images = [Path(p) for p in args.paths]
    else:
        images = sorted(
            p for ext in ('*.jpg', '*.jpeg', '*.png')
            for p in root.rglob(ext)
            if p.name not in SKIP_NAMES and '-mobile' not in p.stem
        )

    if not images:
        print("No images found.")
        return

    mode = "APPLYING" if args.apply else "DRY RUN — pass --apply to process"
    print(f"=== Image optimizer [{mode}] ===")

    for img_path in images:
        rel = str(img_path.relative_to(root))
        optimize(img_path, max_width_for(rel), args.apply)

    if not args.apply:
        print("\nRun with --apply to process images.")

if __name__ == '__main__':
    main()
