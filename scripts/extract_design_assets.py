from __future__ import annotations

import json
from collections import deque
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_ROOT = ROOT / "assets" / "extracted"
SOURCES = {
    "main": ROOT / "images" / "主界面4个页面图.png",
    "secondary": ROOT / "images" / "8个二级页面图.png",
}


@dataclass(frozen=True)
class AssetSpec:
    name: str
    source: str
    bbox: tuple[int, int, int, int]
    category: str
    transparent: bool = False
    background_mode: str = "white"
    threshold: int = 28
    border: int = 3
    trim: bool = False
    pad: int = 10
    max_size: int | None = None
    keep_largest_component: bool = False
    ellipse_mask: bool = False
    note: str = ""


def ensure_dirs() -> None:
    for folder in [
        OUTPUT_ROOT / "backgrounds" / "screens",
        OUTPUT_ROOT / "backgrounds" / "covers",
        OUTPUT_ROOT / "transparent-icons",
        OUTPUT_ROOT / "ui-elements",
        OUTPUT_ROOT / "app-icon",
        OUTPUT_ROOT / "previews",
    ]:
        folder.mkdir(parents=True, exist_ok=True)


def remove_edge_connected_background(
    image: Image.Image,
    *,
    mode: str,
    threshold: int,
    border: int,
) -> Image.Image:
    rgba = image.convert("RGBA")
    arr = np.array(rgba)
    rgb = arr[:, :, :3].astype(np.int16)
    alpha = arr[:, :, 3].copy()
    height, width = alpha.shape

    if mode == "none":
        similarity = np.zeros((height, width), dtype=bool)
    elif mode == "white":
        similarity = (
            (rgb[:, :, 0] >= 230)
            & (rgb[:, :, 1] >= 230)
            & (rgb[:, :, 2] >= 230)
        )
    else:
        border_pixels: list[np.ndarray] = []
        border = max(1, min(border, height // 2, width // 2))
        border_pixels.append(rgb[:border, :, :].reshape(-1, 3))
        border_pixels.append(rgb[-border:, :, :].reshape(-1, 3))
        border_pixels.append(rgb[:, :border, :].reshape(-1, 3))
        border_pixels.append(rgb[:, -border:, :].reshape(-1, 3))
        samples = np.concatenate(border_pixels, axis=0)
        bg_color = np.median(samples, axis=0)
        dist = np.sqrt(np.sum((rgb - bg_color) ** 2, axis=2))
        similarity = dist <= threshold

    visited = np.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        if visited[y, x] or not similarity[y, x]:
            continue
        visited[y, x] = True
        if x > 0:
            queue.append((x - 1, y))
        if x + 1 < width:
            queue.append((x + 1, y))
        if y > 0:
            queue.append((x, y - 1))
        if y + 1 < height:
            queue.append((x, y + 1))

    alpha[visited] = 0
    arr[:, :, 3] = alpha
    return Image.fromarray(arr)


def trim_alpha_bounds(image: Image.Image, pad: int = 0) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return rgba
    left = max(0, bbox[0] - pad)
    top = max(0, bbox[1] - pad)
    right = min(rgba.width, bbox[2] + pad)
    bottom = min(rgba.height, bbox[3] + pad)
    return rgba.crop((left, top, right, bottom))


def keep_largest_alpha_component(image: Image.Image, alpha_threshold: int = 8) -> Image.Image:
    rgba = image.convert("RGBA")
    arr = np.array(rgba)
    alpha = arr[:, :, 3]
    mask = alpha > alpha_threshold
    height, width = mask.shape
    visited = np.zeros((height, width), dtype=bool)
    largest: list[tuple[int, int]] = []

    for y in range(height):
        for x in range(width):
            if visited[y, x] or not mask[y, x]:
                continue
            stack = [(x, y)]
            component: list[tuple[int, int]] = []
            visited[y, x] = True

            while stack:
                cx, cy = stack.pop()
                component.append((cx, cy))
                for nx in range(max(0, cx - 1), min(width, cx + 2)):
                    for ny in range(max(0, cy - 1), min(height, cy + 2)):
                        if visited[ny, nx] or not mask[ny, nx]:
                            continue
                        visited[ny, nx] = True
                        stack.append((nx, ny))

            if len(component) > len(largest):
                largest = component

    if not largest:
        return rgba

    keep_mask = np.zeros((height, width), dtype=bool)
    for x, y in largest:
        keep_mask[y, x] = True
    arr[~keep_mask, 3] = 0
    return Image.fromarray(arr)


def apply_ellipse_alpha_mask(image: Image.Image, feather: float = 1.2) -> Image.Image:
    rgba = image.convert("RGBA")
    mask = Image.new("L", rgba.size, 0)
    draw = ImageDraw.Draw(mask)
    inset = 1
    draw.ellipse((inset, inset, rgba.width - inset, rgba.height - inset), fill=255)
    if feather:
        mask = mask.filter(ImageFilter.GaussianBlur(radius=feather))

    alpha = ImageChops.multiply(rgba.getchannel("A"), mask)
    rgba.putalpha(alpha)
    return rgba


def resize_to_max(image: Image.Image, max_size: int | None) -> Image.Image:
    if not max_size:
        return image
    width, height = image.size
    longest = max(width, height)
    if longest == max_size:
        return image
    scale = max_size / longest
    resized = image.resize(
        (max(1, round(width * scale)), max(1, round(height * scale))),
        Image.Resampling.LANCZOS,
    )
    return resized.filter(ImageFilter.UnsharpMask(radius=1.1, percent=125, threshold=3))


def centered_canvas(image: Image.Image, size: int, background=(0, 0, 0, 0)) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), background)
    x = (size - image.width) // 2
    y = (size - image.height) // 2
    canvas.alpha_composite(image, (x, y))
    return canvas


def radial_glow(size: int, inner: tuple[int, int, int, int], outer: tuple[int, int, int, int]) -> Image.Image:
    gradient = Image.new("RGBA", (size, size), outer)
    center = np.array([size / 2, size / 2])
    yy, xx = np.mgrid[0:size, 0:size]
    distance = np.sqrt(((np.dstack((xx, yy)) - center) ** 2).sum(axis=2))
    distance = np.clip(distance / (size / 2), 0, 1)
    inner_arr = np.array(inner, dtype=np.float32)
    outer_arr = np.array(outer, dtype=np.float32)
    mixed = inner_arr * (1 - distance[:, :, None]) + outer_arr * distance[:, :, None]
    return Image.fromarray(np.uint8(np.clip(mixed, 0, 255)))


def save_preview(items: list[tuple[str, Path]], name: str) -> None:
    if not items:
        return

    thumb_size = 220
    label_height = 44
    cols = 4
    rows = (len(items) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * thumb_size, rows * (thumb_size + label_height)), (247, 247, 250, 255))
    draw = ImageDraw.Draw(sheet)

    for idx, (label, path) in enumerate(items):
        col = idx % cols
        row = idx // cols
        x = col * thumb_size
        y = row * (thumb_size + label_height)
        tile = Image.new("RGBA", (thumb_size, thumb_size), (255, 255, 255, 255))

        if name in {"transparent-icons-sheet", "app-icon-sheet"}:
            checker = Image.new("RGBA", (thumb_size, thumb_size), (255, 255, 255, 255))
            checker_arr = np.array(checker)
            block = 14
            for cy in range(0, thumb_size, block):
                for cx in range(0, thumb_size, block):
                    if (cx // block + cy // block) % 2:
                        checker_arr[cy : cy + block, cx : cx + block, :3] = 230
            tile = Image.fromarray(checker_arr)

        image = Image.open(path).convert("RGBA")
        contained = ImageOps.contain(image, (thumb_size - 24, thumb_size - 24), Image.Resampling.LANCZOS)
        paste_x = x + (thumb_size - contained.width) // 2
        paste_y = y + (thumb_size - contained.height) // 2
        sheet.alpha_composite(tile, (x, y))
        sheet.alpha_composite(contained, (paste_x, paste_y))
        draw.text((x + 8, y + thumb_size + 6), label[:28], fill=(60, 54, 75, 255))

    preview_path = OUTPUT_ROOT / "previews" / f"{name}.png"
    sheet.save(preview_path)


def make_app_icons(extracted: dict[str, Path]) -> list[Path]:
    app_icon_dir = OUTPUT_ROOT / "app-icon"

    banner = Image.open(extracted["secondary_alarm_banner"]).convert("RGBA")
    banner = ImageOps.fit(banner, (1024, 1024), Image.Resampling.LANCZOS)
    banner = banner.filter(ImageFilter.GaussianBlur(radius=14))
    glow = radial_glow(1024, (252, 188, 220, 255), (87, 78, 173, 255))
    background = Image.blend(banner, glow, 0.42)

    mark = Image.open(extracted["app_mark_circle"]).convert("RGBA")
    mark = trim_alpha_bounds(mark, pad=18)
    mark = resize_to_max(mark, 640)

    shadow = Image.new("RGBA", mark.size, (0, 0, 0, 0))
    shadow_alpha = mark.getchannel("A").filter(ImageFilter.GaussianBlur(radius=16))
    shadow_arr = np.array(shadow)
    shadow_arr[:, :, 0] = 62
    shadow_arr[:, :, 1] = 31
    shadow_arr[:, :, 2] = 112
    shadow_arr[:, :, 3] = np.array(shadow_alpha) // 2
    shadow = Image.fromarray(shadow_arr)

    x = (1024 - mark.width) // 2
    y = (1024 - mark.height) // 2
    background.alpha_composite(shadow, (x, y + 18))
    background.alpha_composite(mark, (x, y))

    app_icon_path = app_icon_dir / "app-icon-1024.png"
    background.save(app_icon_path)

    foreground = centered_canvas(resize_to_max(mark, 720), 1024)
    foreground_path = app_icon_dir / "adaptive-icon-foreground.png"
    foreground.save(foreground_path)

    bg_only = Image.blend(
        radial_glow(1024, (252, 210, 227, 255), (109, 99, 201, 255)),
        background.filter(ImageFilter.GaussianBlur(radius=18)),
        0.55,
    )
    background_path = app_icon_dir / "adaptive-icon-background.png"
    bg_only.save(background_path)

    mono = Image.open(extracted["tab_sleep_active"]).convert("RGBA")
    mono = trim_alpha_bounds(mono, pad=10)
    mono_arr = np.array(mono)
    mono_arr[:, :, 0] = 255
    mono_arr[:, :, 1] = 255
    mono_arr[:, :, 2] = 255
    mono = Image.fromarray(mono_arr)
    mono = centered_canvas(resize_to_max(mono, 540), 1024)
    mono_path = app_icon_dir / "adaptive-icon-monochrome.png"
    mono.save(mono_path)

    return [app_icon_path, foreground_path, background_path, mono_path]


ASSETS: list[AssetSpec] = [
    AssetSpec("main_sleep_screen", "main", (3, 2, 409, 926), "backgrounds/screens", note="主界面-睡眠"),
    AssetSpec("main_focus_screen", "main", (429, 4, 833, 926), "backgrounds/screens", note="主界面-专注"),
    AssetSpec("main_breathe_screen", "main", (853, 4, 1258, 926), "backgrounds/screens", note="主界面-呼吸"),
    AssetSpec("main_meditate_screen", "main", (1278, 4, 1683, 926), "backgrounds/screens", note="主界面-冥想"),
    AssetSpec("sleep_timer_screen", "secondary", (218, 5, 483, 458), "backgrounds/screens", note="二级页-睡眠定时"),
    AssetSpec("wake_alarm_screen", "secondary", (493, 5, 762, 458), "backgrounds/screens", note="二级页-该起床了"),
    AssetSpec("focus_running_screen", "secondary", (774, 5, 1027, 458), "backgrounds/screens", note="二级页-专注中"),
    AssetSpec("focus_complete_screen", "secondary", (1040, 5, 1291, 458), "backgrounds/screens", note="二级页-专注完成"),
    AssetSpec("focus_sound_picker_screen", "secondary", (219, 473, 481, 908), "backgrounds/screens", note="二级页-背景音"),
    AssetSpec("breathe_complete_screen", "secondary", (494, 472, 761, 908), "backgrounds/screens", note="二级页-呼吸完成"),
    AssetSpec("meditate_complete_screen", "secondary", (773, 473, 1027, 908), "backgrounds/screens", note="二级页-冥想完成"),
    AssetSpec("settings_screen", "secondary", (1039, 473, 1291, 908), "backgrounds/screens", note="二级页-设置"),
    AssetSpec("sleep_cover_ocean_moon", "main", (34, 293, 191, 421), "backgrounds/covers", max_size=768),
    AssetSpec("sleep_cover_rain_window", "main", (218, 293, 381, 421), "backgrounds/covers", max_size=768),
    AssetSpec("sleep_cover_fireflies_forest", "main", (35, 499, 193, 621), "backgrounds/covers", max_size=768),
    AssetSpec("sleep_cover_cat_purr", "main", (219, 499, 382, 621), "backgrounds/covers", max_size=768),
    AssetSpec("focus_cover_pink_piano", "main", (454, 582, 550, 688), "backgrounds/covers", max_size=768),
    AssetSpec("focus_cover_aqua_waves", "main", (558, 582, 629, 688), "backgrounds/covers", max_size=768),
    AssetSpec("focus_cover_coffee", "main", (637, 582, 708, 688), "backgrounds/covers", max_size=768),
    AssetSpec("focus_cover_mist_forest", "main", (718, 582, 789, 688), "backgrounds/covers", max_size=768),
    AssetSpec("meditate_cover_quick_sleep", "main", (1308, 266, 1442, 403), "backgrounds/covers", max_size=768),
    AssetSpec("meditate_cover_exam_stress", "main", (1478, 266, 1613, 403), "backgrounds/covers", max_size=768),
    AssetSpec("meditate_cover_breath_practice", "main", (1308, 494, 1444, 633), "backgrounds/covers", max_size=768),
    AssetSpec("meditate_cover_body_scan", "main", (1478, 494, 1612, 633), "backgrounds/covers", max_size=768),
    AssetSpec("secondary_alarm_banner", "secondary", (546, 199, 733, 333), "backgrounds/covers", max_size=1024),
    AssetSpec("secondary_meditate_moon_banner", "secondary", (799, 569, 1000, 651), "backgrounds/covers", max_size=1024),
    AssetSpec("tab_sleep_active", "main", (23, 804, 83, 861), "transparent-icons", transparent=True, trim=True, max_size=512, keep_largest_component=True, note="底部Tab-睡眠激活"),
    AssetSpec("tab_focus_active", "main", (548, 806, 611, 861), "transparent-icons", transparent=True, trim=True, max_size=512, keep_largest_component=True, note="底部Tab-专注激活"),
    AssetSpec("tab_breathe_active", "main", (1064, 806, 1120, 861), "transparent-icons", transparent=True, trim=True, max_size=512, keep_largest_component=True, note="底部Tab-呼吸激活"),
    AssetSpec("tab_meditate_active", "main", (1581, 806, 1638, 861), "transparent-icons", transparent=True, trim=True, max_size=512, keep_largest_component=True, note="底部Tab-冥想激活"),
    AssetSpec("tab_sleep_outline", "main", (450, 806, 505, 861), "transparent-icons", transparent=True, trim=True, max_size=512, keep_largest_component=True, note="底部Tab-睡眠线框"),
    AssetSpec("tab_focus_outline", "main", (129, 806, 184, 861), "transparent-icons", transparent=True, trim=True, max_size=512, keep_largest_component=True, note="底部Tab-专注线框"),
    AssetSpec("tab_breathe_outline", "main", (222, 806, 278, 861), "transparent-icons", transparent=True, trim=True, max_size=512, keep_largest_component=True, note="底部Tab-呼吸线框"),
    AssetSpec("tab_meditate_outline", "main", (336, 806, 392, 861), "transparent-icons", transparent=True, trim=True, max_size=512, keep_largest_component=True, note="底部Tab-冥想线框"),
    AssetSpec("back_arrow_circle", "secondary", (224, 33, 268, 77), "transparent-icons", transparent=True, background_mode="edge", threshold=34, trim=True, max_size=512, keep_largest_component=True),
    AssetSpec("search_icon", "secondary", (244, 558, 263, 578), "transparent-icons", transparent=True, background_mode="edge", threshold=50, trim=True, max_size=512, keep_largest_component=True),
    AssetSpec("gear_icon", "main", (1186, 72, 1234, 119), "transparent-icons", transparent=True, background_mode="edge", threshold=35, trim=True, max_size=512, keep_largest_component=True),
    AssetSpec("plus_circle", "secondary", (413, 151, 444, 183), "transparent-icons", transparent=True, trim=True, max_size=512, keep_largest_component=True),
    AssetSpec("minus_circle", "secondary", (258, 151, 290, 183), "transparent-icons", transparent=True, trim=True, max_size=512, keep_largest_component=True),
    AssetSpec("music_note", "secondary", (696, 219, 724, 249), "transparent-icons", transparent=True, background_mode="edge", threshold=42, trim=True, max_size=512, keep_largest_component=True),
    AssetSpec("pause_circle", "main", (320, 715, 380, 778), "transparent-icons", transparent=True, background_mode="edge", threshold=42, trim=True, max_size=512, keep_largest_component=True, note="当前播放-暂停按钮"),
    AssetSpec("playing_equalizer_badge", "main", (340, 499, 378, 537), "transparent-icons", transparent=True, background_mode="none", trim=True, max_size=512, ellipse_mask=True, note="播放中-均衡器角标"),
    AssetSpec("focus_timer_clock_tiny", "main", (558, 390, 580, 413), "transparent-icons", transparent=True, background_mode="edge", threshold=38, trim=True, max_size=512, keep_largest_component=True, note="专注计时-小时钟"),
    AssetSpec("sleep_timer_music_row_icon", "secondary", (257, 327, 283, 352), "transparent-icons", transparent=True, background_mode="edge", threshold=42, trim=True, max_size=512, keep_largest_component=True, note="睡眠定时-音乐行图标"),
    AssetSpec("alarm_clock_icon", "secondary", (580, 213, 675, 309), "transparent-icons", transparent=True, background_mode="edge", threshold=42, trim=True, max_size=768, keep_largest_component=True),
    AssetSpec("focus_check_badge", "secondary", (1087, 82, 1188, 183), "transparent-icons", transparent=True, background_mode="edge", threshold=38, trim=True, max_size=768, keep_largest_component=True),
    AssetSpec("breathe_check_badge", "secondary", (543, 514, 715, 686), "transparent-icons", transparent=True, background_mode="edge", threshold=40, trim=True, max_size=768, keep_largest_component=True),
    AssetSpec("focus_mode_tile_icon", "secondary", (801, 268, 833, 298), "transparent-icons", transparent=True, background_mode="edge", threshold=36, trim=True, max_size=512, keep_largest_component=True, note="专注中-沉浸模式图标"),
    AssetSpec("focus_music_tile_icon", "secondary", (801, 310, 833, 340), "transparent-icons", transparent=True, background_mode="edge", threshold=36, trim=True, max_size=512, keep_largest_component=True, note="专注中-背景音图标"),
    AssetSpec("wave_icon_box_breath", "main", (907, 219, 981, 259), "transparent-icons", transparent=True, background_mode="edge", threshold=30, trim=True, max_size=512, keep_largest_component=True),
    AssetSpec("wave_icon_relax_breath", "main", (1028, 218, 1100, 260), "transparent-icons", transparent=True, background_mode="edge", threshold=30, trim=True, max_size=512, keep_largest_component=True),
    AssetSpec("wave_icon_balance_breath", "main", (1147, 218, 1217, 259), "transparent-icons", transparent=True, background_mode="edge", threshold=30, trim=True, max_size=512, keep_largest_component=True),
    AssetSpec("leaf_branch", "secondary", (1181, 508, 1283, 604), "transparent-icons", transparent=True, background_mode="edge", threshold=55, trim=True, max_size=768, keep_largest_component=True),
    AssetSpec("crystal", "secondary", (950, 724, 1014, 803), "transparent-icons", transparent=True, background_mode="edge", threshold=34, trim=True, max_size=768, keep_largest_component=True),
    AssetSpec("app_mark_circle", "secondary", (1064, 572, 1121, 631), "transparent-icons", transparent=True, background_mode="edge", threshold=36, trim=True, max_size=768, keep_largest_component=True, note="设置页App标识"),
    AssetSpec("settings_bell_icon", "secondary", (1060, 650, 1100, 690), "transparent-icons", transparent=True, background_mode="edge", threshold=45, trim=True, max_size=512, keep_largest_component=True, note="设置-通知提醒"),
    AssetSpec("settings_music_icon", "secondary", (1060, 692, 1100, 732), "transparent-icons", transparent=True, background_mode="edge", threshold=45, trim=True, max_size=512, keep_largest_component=True, note="设置-音频播放"),
    AssetSpec("settings_theme_icon", "secondary", (1060, 737, 1100, 777), "transparent-icons", transparent=True, background_mode="edge", threshold=45, trim=True, max_size=512, keep_largest_component=True, note="设置-外观主题"),
    AssetSpec("settings_privacy_icon", "secondary", (1060, 779, 1100, 819), "transparent-icons", transparent=True, background_mode="edge", threshold=45, trim=True, max_size=512, keep_largest_component=True, note="设置-数据与隐私"),
    AssetSpec("settings_info_icon", "secondary", (1060, 819, 1100, 859), "transparent-icons", transparent=True, background_mode="edge", threshold=45, trim=True, max_size=512, keep_largest_component=True, note="设置-关于应用"),
    AssetSpec("chevron_right", "secondary", (1245, 596, 1273, 623), "transparent-icons", transparent=True, background_mode="edge", threshold=48, trim=True, max_size=512, keep_largest_component=True, note="列表右箭头"),
    AssetSpec("focus_timer_card", "main", (449, 194, 803, 510), "ui-elements", max_size=1280),
    AssetSpec("focus_segment_control", "main", (499, 226, 757, 282), "ui-elements", max_size=1024),
    AssetSpec("breathe_orb", "main", (884, 366, 1174, 702), "ui-elements", max_size=1280),
    AssetSpec("focus_progress_ring", "secondary", (786, 92, 991, 308), "ui-elements", max_size=1024),
    AssetSpec("meditate_quote_card", "secondary", (791, 653, 1006, 733), "ui-elements", max_size=1024),
    AssetSpec("primary_button_large", "main", (1328, 735, 1595, 788), "ui-elements", max_size=1024),
    AssetSpec("chip_active_pink", "main", (35, 226, 97, 273), "ui-elements", max_size=512),
    AssetSpec("chip_idle_white", "main", (103, 226, 174, 273), "ui-elements", max_size=512),
    AssetSpec("search_bar_input", "secondary", (231, 548, 465, 590), "ui-elements", max_size=1024),
    AssetSpec("now_playing_bar", "main", (31, 708, 383, 789), "ui-elements", max_size=1280),
]


def main() -> None:
    ensure_dirs()
    images = {key: Image.open(path).convert("RGBA") for key, path in SOURCES.items()}
    manifest: list[dict[str, object]] = []
    outputs: dict[str, Path] = {}

    for spec in ASSETS:
        image = images[spec.source].crop(spec.bbox)

        if spec.transparent:
            image = remove_edge_connected_background(
                image,
                mode=spec.background_mode,
                threshold=spec.threshold,
                border=spec.border,
            )
            if spec.keep_largest_component:
                image = keep_largest_alpha_component(image)
            if spec.ellipse_mask:
                image = apply_ellipse_alpha_mask(image)
            if spec.trim:
                image = trim_alpha_bounds(image, pad=spec.pad)
        elif spec.trim:
            image = trim_alpha_bounds(image, pad=spec.pad)

        image = resize_to_max(image, spec.max_size)

        out_path = OUTPUT_ROOT / spec.category / f"{spec.name}.png"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        image.save(out_path)
        outputs[spec.name] = out_path

        item = asdict(spec)
        item["output"] = str(out_path.relative_to(ROOT))
        item["size"] = image.size
        manifest.append(item)

    app_icon_paths = make_app_icons(outputs)
    for path in app_icon_paths:
        manifest.append(
            {
                "name": path.stem,
                "category": "app-icon",
                "output": str(path.relative_to(ROOT)),
                "size": Image.open(path).size,
                "source": "generated",
                "bbox": None,
                "transparent": path.name != "app-icon-1024.png" and "background" not in path.name,
            }
        )

    save_preview(
        [(spec.name, outputs[spec.name]) for spec in ASSETS if spec.category == "transparent-icons"],
        "transparent-icons-sheet",
    )
    save_preview(
        [(spec.name, outputs[spec.name]) for spec in ASSETS if spec.category == "ui-elements"],
        "ui-elements-sheet",
    )
    save_preview([(path.stem, path) for path in app_icon_paths], "app-icon-sheet")

    manifest_path = OUTPUT_ROOT / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    readme_path = OUTPUT_ROOT / "README.md"
    readme_path.write_text(
        "\n".join(
            [
                "# Extracted Design Assets",
                "",
                "- `backgrounds/screens/`: 从两张原始设计拼图中裁出的完整页面背景参考图。",
                "- `backgrounds/covers/`: 卡片背景、横幅与可复用配图。",
                "- `transparent-icons/`: 已做边缘连通背景去除的透明 PNG 图标。",
                "- `ui-elements/`: 按钮、进度环、呼吸球、输入框等界面元素。",
                "- `app-icon/`: 为 Expo / React Native App 预备的 AppIcon 与 adaptive icon 素材。",
                "- `manifest.json`: 资产来源、裁切坐标、输出尺寸清单。",
                "",
                "这些素材由 `scripts/extract_design_assets.py` 生成，可重复执行。",
            ]
        ),
        encoding="utf-8",
    )

    print(f"Generated {len(manifest)} assets into {OUTPUT_ROOT}")


if __name__ == "__main__":
    main()
