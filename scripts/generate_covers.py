#!/usr/bin/env python3
"""
用 gpt-image-2 (draw skill) 生成 9 張作品封面，replace 現有圖。
每張 medium 品質、portrait（1024x1536）、符合該案風格。
"""
from __future__ import annotations
import os, sys, subprocess, shutil
from pathlib import Path

# 強制 UTF-8 輸出（Windows cp950 預設不支援中文 emoji）
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr.encoding and sys.stderr.encoding.lower() != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8")

DRAW_SCRIPT = Path("C:/Users/User/.claude/skills/draw/draw.py")
OUTDIR = Path("C:/Users/User/Projects/INT_DESIGN_test/anbier-site/public/placeholder/covers")

# slug -> (中文名, 風格, prompt)
COVERS: dict[str, tuple[str, str, str]] = {
    "equilibrium": (
        "靜謐均衡",
        "現代 × 工業",
        "Photorealistic interior architecture magazine photo, "
        "modern industrial luxury residence living room in Taipei, "
        "exposed black steel beams overhead, polished concrete floor, "
        "walnut wood feature wall with vertical grain, deep charcoal sectional sofa with leather and bouclé textures, "
        "sculptural brass pendant light, large white travertine coffee table, single olive tree in concrete planter, "
        "floor-to-ceiling windows with linen sheers, late afternoon warm golden sunlight casting long soft shadows, "
        "eye-level wide-angle composition, Architectural Digest editorial aesthetic, sophisticated balanced atmosphere, "
        "no people, no text, no watermark, no signs"
    ),
    "pleasant": (
        "輕盈生活",
        "現代簡約",
        "Photorealistic interior architecture magazine photo, "
        "minimalist contemporary residence open-plan living and dining area in Taipei, "
        "light white oak engineered flooring throughout, smooth matte off-white plaster walls, "
        "low-profile cream linen sofa with thin steel frame, slim-frame oak coffee table, "
        "kitchen island with sintered stone countertop in pale grey, brushed steel pendant lights, "
        "large indoor ficus tree, abundant soft daylight from full-height windows with sheer curtains, "
        "very airy and breathable space, neutral palette, eye-level wide composition, editorial style, "
        "no people, no text, no watermark"
    ),
    "yihai": (
        "頤海複合居所",
        "工業 × 東方",
        "Photorealistic interior architecture magazine photo, "
        "modern industrial east-asian fusion residence, "
        "exposed board-formed concrete walls and ceiling with subtle imprint texture, "
        "vertical teak wood paneling on one wall, blackened steel mesh sliding partition with bronze frame, "
        "low platform with tatami-inspired modular seating in dark linen, "
        "single brass and rice-paper pendant fixture, traditional ink painting on stone wall, "
        "indirect cove lighting on ceiling, evening warm amber tone, "
        "sophisticated luxurious quietly powerful atmosphere, eye-level architectural composition, "
        "no people, no text, no watermark"
    ),
    "serenity": (
        "靜謐",
        "日式現代",
        "Photorealistic interior architecture magazine photo, "
        "japandi minimalist residence living room, "
        "natural travertine stone feature wall with subtle veining, "
        "light oak engineered wood floor, "
        "Japanese-style shoji washi paper sliding doors glowing softly with backlight, "
        "low-profile natural linen daybed, single ikebana arrangement on weathered wooden bench, "
        "paper lantern pendant fixture, raked sand garden visible through opening, "
        "morning soft diffused daylight, deeply tranquil and meditative quality, "
        "neutral earth tone palette beige sand cream, eye-level wide composition, editorial calm, "
        "no people, no text, no watermark"
    ),
    "lambency": (
        "微光",
        "現代輕奢",
        "Photorealistic interior architecture magazine photo, "
        "contemporary luxury residence living room at dusk, "
        "polished Calacatta gold marble feature wall with dramatic veining, "
        "smoked grey glass partition framed in champagne brushed bronze, "
        "deep emerald velvet sofa, sculptural white marble coffee table, "
        "brushed brass arc floor lamp, ceiling cove warm indirect lighting glowing softly, "
        "large reflective surfaces creating subtle highlights, "
        "sophisticated jewel-box atmosphere, golden-hour light through sheer linen curtains, "
        "editorial luxury aesthetic, eye-level wide composition, "
        "no people, no text, no watermark"
    ),
    "gathering": (
        "聚落",
        "現代 × 侘寂",
        "Photorealistic interior architecture magazine photo, "
        "wabi-sabi modern residence open kitchen and dining area, "
        "handmade rough natural-clay brick flooring, lime-washed plaster walls with imperfect texture, "
        "long solid live-edge oak dining table seating eight people, "
        "hand-thrown ceramic vases with single dried branches, "
        "woven rattan pendant lights cluster, exposed wooden beam ceiling, "
        "warm earthy palette beige terracotta umber, "
        "large arched window letting in warm late afternoon golden light, "
        "peaceful imperfect handcrafted family-oriented atmosphere, eye-level wide composition, "
        "no people, no text, no watermark"
    ),
    "aurora": (
        "極光居所",
        "現代北歐",
        "Photorealistic interior architecture magazine photo, "
        "scandinavian nordic residence living room, "
        "light white oak floor, smooth white plaster walls, "
        "large pale grey textured bouclé sectional sofa with sheepskin throw, "
        "white marble round coffee table, simple matte black floor lamp, "
        "sculptural ceramic vases, light wood low credenza, "
        "abundant soft Nordic morning daylight from full-height windows, "
        "indoor monstera and birch branches, calm minimalist hygge atmosphere, "
        "neutral cool palette with warm wood accents, eye-level wide composition, editorial, "
        "no people, no text, no watermark"
    ),
    "no2311": (
        "NO.2311",
        "工業現代（商業辦公）",
        "Photorealistic interior architecture magazine photo, "
        "modern industrial creative startup office space, "
        "exposed concrete board-formed walls and ceiling with original raw structure, "
        "OSB plywood feature wall accent, blackened steel mesh details, "
        "long communal bench desk with iron base and oak top, designer ergonomic chairs, "
        "large pendant industrial lights, glass-walled meeting room with frosted reeded texture, "
        "abundant natural daylight from large factory-style steel windows, lots of monstera and fiddle-leaf plants, "
        "professional yet relaxed creative atmosphere, eye-level wide composition, "
        "no people, no text, no watermark"
    ),
    "inner-peace": (
        "靜心",
        "現代禪意",
        "Photorealistic interior architecture magazine photo, "
        "zen modern Taiwanese residence master bedroom retreat, "
        "low platform Japanese-inspired bed frame in solid teak, natural dark teak engineered floor, "
        "black granite stone accent wall behind bed with subtle texture, "
        "raw linen and cotton bedding in soft cream and oat, "
        "single bonsai-style pruned tree by floor-to-ceiling window, "
        "paper-shade pendant fixture, indirect cove lighting, "
        "deep warm soothing palette, dawn light filtering through sheer linen drapes, "
        "deeply meditative tranquil atmosphere, eye-level wide composition, editorial, "
        "no people, no text, no watermark"
    ),
}

def run_one(slug: str, name_zh: str, style: str, prompt: str) -> Path | None:
    """生一張圖、回傳輸出路徑。"""
    print(f"\n=== [{slug}] {name_zh}（{style}）===")
    cmd = [
        "python", str(DRAW_SCRIPT), prompt,
        "--name", slug,
        "--quality", "medium",
        "--size", "1024x1536",  # portrait，跟作品集 4:5 卡片相近
        "--outdir", str(OUTDIR),
    ]
    print(f"  [生成中] medium quality, 1024x1536, ~30-60s...")
    sys.stdout.flush()
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        if result.returncode != 0:
            print(f"  [ERR] FAILED: {result.stderr[:500]}")
            return None
    except subprocess.TimeoutExpired:
        print(f"  [ERR] TIMEOUT (>180s)")
        return None

    # 找剛生出來的檔（draw.py 會輸出 <slug>_<timestamp>.png）
    matches = sorted(OUTDIR.glob(f"{slug}_*.png"))
    if not matches:
        print(f"  [ERR] no output file found")
        return None
    latest = matches[-1]

    # 重命名為乾淨檔名（覆蓋舊的）
    clean = OUTDIR / f"{slug}.png"
    if clean.exists():
        clean.unlink()
    latest.rename(clean)

    # 把同一 slug 其他 timestamped 殘餘清掉
    for old in OUTDIR.glob(f"{slug}_*.png"):
        old.unlink()

    print(f"  [OK] {clean.name} ({clean.stat().st_size // 1024} KB)")
    return clean

def main():
    OUTDIR.mkdir(parents=True, exist_ok=True)
    print(f"輸出資料夾：{OUTDIR}")
    print(f"共 {len(COVERS)} 張要生（medium 品質、portrait）")

    success, failed = [], []
    for slug, (zh, style, prompt) in COVERS.items():
        result = run_one(slug, zh, style, prompt)
        if result:
            success.append(slug)
        else:
            failed.append(slug)

    print(f"\n=== DONE ===")
    print(f"成功 {len(success)}: {success}")
    if failed:
        print(f"失敗 {len(failed)}: {failed}")
        sys.exit(1)

if __name__ == "__main__":
    main()
