from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

try:
    import cv2
except ImportError:  # pragma: no cover - only used on machines without OpenCV.
    cv2 = None


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "images" / "主界面4个页面图.png"
OUT = ROOT / "assets" / "generated" / "page-backgrounds"

PAGES = {
    "sleep": (3, 2, 409, 926),
    "focus": (429, 4, 833, 926),
    "breathe": (853, 4, 1258, 926),
    "meditate": (1278, 4, 1683, 926),
}


def vertical_gradient(size: tuple[int, int], stops: list[tuple[float, tuple[int, int, int]]]) -> Image.Image:
    width, height = size
    image = Image.new("RGBA", size)
    draw = ImageDraw.Draw(image)
    stops = sorted(stops, key=lambda item: item[0])

    for y in range(height):
        t = y / max(1, height - 1)
        left = stops[0]
        right = stops[-1]
        for idx in range(len(stops) - 1):
            if stops[idx][0] <= t <= stops[idx + 1][0]:
                left = stops[idx]
                right = stops[idx + 1]
                break

        span = max(0.001, right[0] - left[0])
        local = (t - left[0]) / span
        color = tuple(
            round(left[1][channel] * (1 - local) + right[1][channel] * local)
            for channel in range(3)
        )
        draw.line((0, y, width, y), fill=(*color, 255))

    return image


def soft_patch(image: Image.Image, bbox: tuple[int, int, int, int], radius: int = 14) -> None:
    crop = image.crop(bbox).filter(ImageFilter.GaussianBlur(radius=radius))
    image.paste(crop, bbox)


def feather_patch(
    image: Image.Image,
    patch: Image.Image,
    bbox: tuple[int, int, int, int],
    feather: int = 18,
) -> None:
    width = bbox[2] - bbox[0]
    height = bbox[3] - bbox[1]
    patch = patch.resize((width, height), Image.Resampling.BICUBIC).convert("RGBA")
    image.paste(patch, bbox)


def rounded_rect_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


def fit_phone_background(image: Image.Image, target=(1080, 2460)) -> Image.Image:
    return image.resize(target, Image.Resampling.LANCZOS)


def inpaint_rects(image: Image.Image, rects: list[tuple[int, int, int, int]], radius: int = 7) -> Image.Image:
    rgba = image.convert("RGBA")
    if cv2 is None:
        fallback = rgba.copy()
        blurred = fallback.filter(ImageFilter.GaussianBlur(radius=max(12, radius * 3)))
        for rect in rects:
            fallback.paste(blurred.crop(rect), rect)
        return fallback

    rgb = np.array(rgba.convert("RGB"))
    mask = np.zeros(rgb.shape[:2], dtype=np.uint8)
    for left, top, right, bottom in rects:
        mask[top:bottom, left:right] = 255
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    fixed = cv2.inpaint(bgr, mask, radius, cv2.INPAINT_TELEA)
    fixed_rgb = cv2.cvtColor(fixed, cv2.COLOR_BGR2RGB)
    return Image.fromarray(fixed_rgb).convert("RGBA")


def sleep_background(page: Image.Image) -> Image.Image:
    width, height = page.size
    base = vertical_gradient(
        (width, height),
        [
            (0.0, (24, 20, 80)),
            (0.14, (52, 38, 126)),
            (0.27, (114, 71, 158)),
            (0.44, (240, 169, 213)),
            (1.0, (252, 235, 243)),
        ],
    )

    draw = ImageDraw.Draw(base)
    for x, y, r in [
        (52, 92, 2),
        (128, 58, 2),
        (226, 64, 2),
        (342, 54, 2),
        (150, 112, 1),
        (260, 112, 2),
        (304, 168, 1),
        (68, 36, 1),
    ]:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(255, 242, 255, 230))
    draw.ellipse((285, 52, 356, 123), fill=(255, 225, 158, 255))
    draw.ellipse((256, 39, 329, 111), fill=(55, 40, 130, 255))

    clouds = inpaint_rects(
        page.crop((0, 128, width, 234)),
        [(24, 0, 210, 42)],
        radius=7,
    ).filter(ImageFilter.GaussianBlur(radius=1.4))
    cloud_mask = Image.new("L", clouds.size, 210)
    base.paste(clouds, (0, 128), cloud_mask)

    fade = Image.new("RGBA", (width, 128), (0, 0, 0, 0))
    fade_draw = ImageDraw.Draw(fade)
    for y in range(128):
        alpha = round(255 * (y / 127))
        fade_draw.line((0, y, width, y), fill=(252, 235, 243, alpha))
    base.alpha_composite(fade, (0, 164))

    fade = Image.new("RGBA", (width, 120), (0, 0, 0, 0))
    draw = ImageDraw.Draw(fade)
    for y in range(120):
        alpha = round(255 * (y / 119))
        draw.line((0, y, width, y), fill=(252, 235, 243, alpha))
    base.alpha_composite(fade, (0, 170))
    return base


def focus_background(page: Image.Image) -> Image.Image:
    width, height = page.size
    base = page.filter(ImageFilter.GaussianBlur(radius=18))
    wash = vertical_gradient(
        (width, height),
        [
            (0.0, (213, 247, 237)),
            (0.32, (229, 252, 245)),
            (0.74, (241, 255, 251)),
            (1.0, (255, 255, 255)),
        ],
    )
    base = Image.blend(wash, base, 0.32)

    soft = base.filter(ImageFilter.GaussianBlur(radius=22))
    for box in [
        (0, 0, width, 42),
        (20, 54, 190, 158),
        (18, 188, width - 18, 524),
        (16, 548, width - 16, 764),
        (0, 794, width, height),
    ]:
        base.paste(soft.crop(box), box)
    return base


def breathe_background(page: Image.Image) -> Image.Image:
    width, height = page.size
    base = page.filter(ImageFilter.GaussianBlur(radius=20))
    wash = vertical_gradient(
        (width, height),
        [
            (0.0, (251, 247, 255)),
            (0.26, (252, 250, 255)),
            (0.62, (255, 251, 254)),
            (1.0, (255, 255, 255)),
        ],
    )
    base = Image.blend(wash, base, 0.28)
    soft = base.filter(ImageFilter.GaussianBlur(radius=26))
    for box in [
        (0, 0, width, 42),
        (18, 58, 186, 156),
        (20, 186, width - 20, 344),
        (20, 710, width - 20, 790),
        (0, 796, width, height),
    ]:
        base.paste(soft.crop(box), box)
    return base


def meditate_background(page: Image.Image) -> Image.Image:
    width, height = page.size
    base = vertical_gradient(
        (width, height),
        [
            (0.0, (246, 214, 203)),
            (0.30, (252, 232, 219)),
            (0.66, (252, 241, 229)),
            (1.0, (248, 237, 224)),
        ],
    )
    hero = inpaint_rects(
        page.crop((0, 0, width, 260)),
        [
            (18, 0, width - 18, 42),
            (18, 58, 210, 160),
        ],
        radius=9,
    )
    base.paste(hero, (0, 0))
    blur = base.filter(ImageFilter.GaussianBlur(radius=18))
    for box in [
        (18, 260, width - 18, 716),
        (0, 800, width, height),
    ]:
        base.paste(blur.crop(box), box)

    fade = Image.new("RGBA", (width, 140), (0, 0, 0, 0))
    draw = ImageDraw.Draw(fade)
    for y in range(140):
        alpha = round(255 * (y / 139))
        draw.line((0, y, width, y), fill=(248, 237, 224, alpha))
    base.alpha_composite(fade, (0, 150))
    return base


BUILDERS = {
    "sleep": sleep_background,
    "focus": focus_background,
    "breathe": breathe_background,
    "meditate": meditate_background,
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE).convert("RGBA")

    for name, box in PAGES.items():
        page = source.crop(box)
        background = BUILDERS[name](page)
        background.save(OUT / f"{name}-background.png")
        fit_phone_background(background).save(OUT / f"{name}-background@phone.png")

    print(f"Generated page backgrounds in {OUT}")


if __name__ == "__main__":
    main()
