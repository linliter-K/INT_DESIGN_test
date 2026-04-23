#!/usr/bin/env python3
"""批次替換 placeholder 圖片為 Pexels 免版權高解析度圖。"""
from __future__ import annotations
import re, os, sys, shutil, urllib.request, urllib.parse
from pathlib import Path

ROOT = Path("C:/Users/User/Projects/INT_DESIGN_test")
PLACEHOLDER = ROOT / "anbier-site" / "public" / "placeholder"
SCRAPE_DIR = ROOT / ".firecrawl"

# slug -> (Pexels search markdown filename, gallery count, root cover filename)
PROJECTS = {
    "equilibrium":  ("pexels.com-search-industrial%20modern%20interior.md", 15, "residence_41051206052025.jpg"),
    "pleasant":     ("pexels.com-search-minimalist%20living%20room.md",      9, "residence_04421707052025.jpg"),
    "yihai":        ("pexels.com-search-industrial%20loft.md",               26, "residence_03281122042025.jpg"),
    "serenity":     ("pexels.com-search-japandi%20interior.md",              17, "residence_52571007052025.jpg"),
    "lambency":     ("pexels.com-search-luxury%20modern%20interior.md",     12, "residence_18351105052025.jpg"),
    "gathering":    ("pexels.com-search-wabi%20sabi%20interior.md",         12, "residence_13041728042025.jpg"),
    "aurora":       ("pexels.com-search-scandinavian%20living.md",          10, "residence_19451111082023.jpg"),
    "no2311":       ("pexels.com-search-modern%20office%20interior.md",     11, "residence_38471107092023.jpg"),
    "inner-peace":  ("pexels.com-search-zen%20interior.md",                  16, "residence_04401315062022.jpg"),
}

# Regex to pull compressed Pexels image URLs out of markdown
IMG_RE = re.compile(r'https://images\.pexels\.com/photos/(\d+)/[^)\s"\']+?\.jpe?g\?[^)\s"\']+')

def extract_urls(md_path: Path) -> list[str]:
    """Extract UNIQUE photo URLs from Pexels search markdown, keeping one URL per photo ID."""
    text = md_path.read_text(encoding="utf-8", errors="ignore")
    seen_ids: set[str] = set()
    urls: list[str] = []
    for m in IMG_RE.finditer(text):
        url = m.group(0)
        photo_id = m.group(1)
        if photo_id in seen_ids:
            continue
        seen_ids.add(photo_id)
        # Rewrite to high quality: 1920px wide, auto compression
        # Base URL is up to .jpeg/.jpg, query after
        base = url.split("?")[0]
        high_q = f"{base}?auto=compress&cs=tinysrgb&dpr=2&w=1920"
        urls.append(high_q)
    return urls

def download(url: str, out: Path) -> bool:
    """Download URL to out path; returns True on success."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
        if len(data) < 5000:  # likely an error page / placeholder
            return False
        out.write_bytes(data)
        return True
    except Exception as e:
        print(f"  [ERR] {out.name}: {e}")
        return False

def process_project(slug: str, scrape_file: str, count: int, cover_name: str):
    md = SCRAPE_DIR / scrape_file
    if not md.exists():
        print(f"[SKIP] {slug}: scrape file not found: {md}")
        return

    urls = extract_urls(md)
    print(f"\n=== {slug} ({count} needed + 1 cover, {len(urls)} URLs available) ===")

    if len(urls) < count + 1:
        print(f"  [WARN] only {len(urls)} URLs for {slug}, need {count+1}")

    # Clean old gallery folder
    gallery_dir = PLACEHOLDER / slug
    if gallery_dir.exists():
        for f in gallery_dir.iterdir():
            if f.is_file():
                f.unlink()
    gallery_dir.mkdir(parents=True, exist_ok=True)

    # Download cover (first URL) to root
    cover_path = PLACEHOLDER / cover_name
    cover_url = urls[0]
    if download(cover_url, cover_path):
        print(f"  cover -> {cover_name}")
    else:
        print(f"  [ERR] cover failed")

    # Download gallery — use URLs 1..count (or wrap around if not enough)
    successes = 0
    i = 1
    url_idx = 1
    while successes < count and url_idx < len(urls):
        out = gallery_dir / f"{successes+1:02d}.jpg"
        if download(urls[url_idx], out):
            successes += 1
        url_idx += 1
    print(f"  gallery: {successes}/{count} downloaded")

def main():
    if not SCRAPE_DIR.exists():
        print(f"[FATAL] scrape dir missing: {SCRAPE_DIR}")
        sys.exit(1)
    for slug, (file, count, cover) in PROJECTS.items():
        process_project(slug, file, count, cover)
    print("\n=== DONE ===")

if __name__ == "__main__":
    main()
