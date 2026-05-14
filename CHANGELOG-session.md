# Session Changelog

## 2026-05-12

- Regenerated design assets from `images/主界面4个页面图.png` and `images/8个二级页面图.png` into `assets/extracted/`.
- Added 12 additional transparent PNG icons, including playback controls, sound badges, settings icons, list chevron, and focus row icons.
- Updated `scripts/extract_design_assets.py` so transparent icons are generated with edge-connected background removal, optional ellipse masking, alpha trimming, manifest output, and preview sheets.
- Updated `constants/designAssets.ts` exports for the new reusable transparent icons.
- Confirmed Expo AppIcon assets exist under `assets/extracted/app-icon/` and `app.json` references the generated AppIcon/adaptive icon files.
- Verified `npm run typecheck`, `npm run lint`, manifest output existence, transparent icon alpha corners, and `app-icon-1024.png` size.

## 2026-05-13

- Fixed the sleep screen playback badge turning white after returning from the sleep playback page by replacing the badge PNG render with a native pink circular badge and white equalizer bars.
- Switched the custom tab bar icon renderer from `expo-image` to React Native `Image` for more stable local transparent PNG rendering during navigation.
- Reworked sleep cover loading after the Android return-path white-image bug: sleep cards, the dock thumbnail, and the sleep playback page now use React Native `Image` with stable local cover assets mapped by sound id/name instead of remote cover URLs.
- Changed the active sleep card border from layout-affecting `borderWidth` to an absolute overlay ring so playback state no longer changes image layout on return.
- Verified `npm run typecheck` and `npm run lint`.
- Added `scripts/generate_page_backgrounds.py` to generate reusable page background assets from `images/主界面4个页面图.png`.
- Generated four main Tab background images under `assets/generated/page-backgrounds/` for Sleep, Focus, Breathe, and Meditate.
- Updated `constants/designAssets.ts` and the four main Tab pages to use the generated 1:1 reference-style backgrounds.
- Verified `npm run typecheck` and `npm run lint`.

## 2026-05-14

- Added project README documentation covering feature scope, tech stack, setup, scripts, API source, audio state rules, Android configuration, Ubuntu 24.04 APK build path, configuration notes, and release checks.
