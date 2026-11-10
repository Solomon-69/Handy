# Handy UI QA log (10 Nov 2026)

Harness: `src/dev/mockTauri.ts` (dev only, behind `import.meta.env.DEV && !__TAURI_INTERNALS__`),
imported first in `src/main.tsx` and `src/overlay/main.tsx`. Run `bunx vite --port 1420`,
open `/` (settings) or `/src/overlay/index.html` (bar). Console helpers: `__mockSettings`, `__emit(event, payload)`.

## Result
- Frontend crash at startup: NOT found. Settings app mounts and renders all 7 pages
  (General, Smart features, Appearance, History, Models, Advanced, About) with no console errors.
  So the blank dark installed window is not a JS crash; likely native window painting (WKWebView not painted).
- Bar (overlay): recording, transcribing, prompt-engineering, clean-up, chip all render, light and black glass.

## Checks (light / dark / black, DOM audit + screenshots)
- Pink in UI: none. Only the optional "Colour" accent swatch (a user choice) is pink.
- Square corners on cards/inputs/menus/buttons: none (only the plain text link "Change languages").
- Button text alignment: centred; nav items and select triggers are left-aligned by design.
- Font: Atkinson Hyperlegible Next loaded and applied.
- Smart features lists: Hands-free, Personal dictionary, Snippets, Styles per app, Command mode, Smart prompt mode.
- Wordless working animation visible (5 bars, spark for prompt).

## Problems found
1. Mock gap only: `plugin:app|version` returned null so What's New logged
   "Cannot read properties of null (reading 'trim')". Fixed in the mock. No app code change needed.
2. Screenshot tool sometimes captured a blank frame right after a bar state change (DOM was correct); re-shot with a 1 s wait.

Rounds: 2 (second pass clean). `bunx tsc --noEmit` and `bun run lint` clean.
Shots: QA/shots/ (settings-{light,dark,black}-*.jpg, bar-{clear,black}-*.jpg).
