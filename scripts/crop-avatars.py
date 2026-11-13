"""
Cuts the 3x3 sheet of Canarian avatars into nine round WebP images in public/avatars/.

    python3 scripts/crop-avatars.py logo/avatares.webp

Reads the sheet row by row in the same order as AVATARS in src/lib/avatars.ts. The circles do
not sit on an even grid (the sheet has paper margins), so their centres are measured on the
1536x1024 original and scaled to the actual size. Each one is cut as a circle just inside its
brown border and saved at 256x256 with a transparent outside, so it works on light and dark.
Needs Pillow (pip install pillow).
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

ORDER = ["pintadera", "papas", "millo", "vieja", "sombrero", "platano", "naife", "lagarto", "cabra"]
SIZE = 256

sheet = Image.open(sys.argv[1]).convert("RGBA")
width, height = sheet.size
sx, sy = width / 1536, height / 1024
COLUMNS = [380, 768, 1157]
ROWS = [180, 510, 838]
radius = 150 * min(sx, sy)
out = Path("public/avatars")
out.mkdir(parents=True, exist_ok=True)

mask = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(mask).ellipse((0, 0, SIZE - 1, SIZE - 1), fill=255)

for index, name in enumerate(ORDER):
    row, col = divmod(index, 3)
    cx, cy = COLUMNS[col] * sx, ROWS[row] * sy
    box = (int(cx - radius), int(cy - radius), int(cx + radius), int(cy + radius))
    tile = sheet.crop(box).resize((SIZE, SIZE), Image.LANCZOS)
    tile.putalpha(mask)
    tile.save(out / f"{name}.webp", quality=82, method=6)
    print("✓", name)
