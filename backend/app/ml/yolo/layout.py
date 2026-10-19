"""Layout detection for CVs.

YOLO classes: header, photo, table, section-title, skills-block, signature, logo.
Use: drop photo/logo/signature noise and order multi-column reading flow.

Weights are optional (YOLO_WEIGHTS_PATH). Without them (or without ultralytics) we fall back to a
PyMuPDF block heuristic: split blocks into columns by x-position and read column by column."""
from functools import lru_cache
from typing import Any

from app.core.config import get_settings

NOISE = {"photo", "logo", "signature"}


@lru_cache
def _model() -> Any | None:
    path = get_settings().yolo_weights_path
    if not path:
        return None
    try:
        from ultralytics import YOLO
        return YOLO(path)
    except Exception:
        return None


def detect(page) -> list[dict]:
    """Returns [{label, bbox:(x0,y0,x1,y1) in PDF points}] or [] when YOLO is unavailable."""
    m = _model()
    if m is None:
        return []
    import io

    from PIL import Image
    scale = 150 / 72
    pix = page.get_pixmap(dpi=150)
    res = m.predict(Image.open(io.BytesIO(pix.tobytes("png"))), verbose=False)[0]
    out = []
    for b in res.boxes:
        x0, y0, x1, y1 = (float(v) / scale for v in b.xyxy[0].tolist())
        out.append({"label": res.names[int(b.cls)], "bbox": (x0, y0, x1, y1)})
    return out


def _inside(block, box, tol=0.6) -> bool:
    bx0, by0, bx1, by1 = block[:4]
    x0, y0, x1, y1 = box
    ix = max(0, min(bx1, x1) - max(bx0, x0))
    iy = max(0, min(by1, y1) - max(by0, y0))
    area = max(1e-6, (bx1 - bx0) * (by1 - by0))
    return ix * iy / area >= tol


def order_blocks(blocks: list[tuple], page_width: float) -> list[tuple]:
    """Heuristic multi-column ordering: if blocks cluster left/right of the page centre, read left then right."""
    if not blocks:
        return blocks
    mid = page_width / 2
    left = [b for b in blocks if b[2] <= mid * 1.1]            # right edge before centre
    right = [b for b in blocks if b[0] >= mid * 0.9]           # left edge after centre
    full = [b for b in blocks if b not in left and b not in right]
    if len(left) >= 3 and len(right) >= 3:
        key = lambda b: (round(b[1], 0), b[0])
        top = sorted([b for b in full if b[1] < min(x[1] for x in left + right)], key=key)
        rest = sorted([b for b in full if b not in top], key=key)
        return top + sorted(left, key=key) + sorted(right, key=key) + rest
    return sorted(blocks, key=lambda b: (round(b[1], 0), b[0]))


def ordered_page_text(page) -> str:
    noise = [d["bbox"] for d in detect(page) if d["label"] in NOISE]
    blocks = [b for b in page.get_text("blocks") if b[6] == 0 and b[4].strip()]
    blocks = [b for b in blocks if not any(_inside(b, n) for n in noise)]
    return "\n".join(b[4].strip() for b in order_blocks(blocks, page.rect.width))
