---
type: handoff
status: active
tags: [handy, overnight]
relatedTo: [HANDY-APP-PROMPT.md]
---
# Handy overnight run handoff (8 Nov 2026)

Brief: ~/Desktop/Stuff 3/CLAUDE/Claude Code/Apps/HANDY-APP-PROMPT.md. Branch `overnight-8-nov` (from `solomon`).
No Rust on this Mac, ~7 GB disk: compile + test only via GitHub Actions workflow `.github/workflows/solomon-build.yml` (runs on push to overnight-8-nov). bindings.ts edited by hand (specta only regenerates in debug builds).

Done (not yet compiled):
- Part 1: settings `overlay_horizontal` (screen/active_window/custom, default active_window), `overlay_offset_x`; `src-tauri/src/overlay_placement.rs` (pure geometry + tests), `src-tauri/src/active_window.rs` (macOS AX focused window + focused text box), `calculate_overlay_position` rewritten; Windows custom offset. CSS: wave padding removed, dot in 22px box mirroring the x button.
- Part 2 (backend + bar): `overlay_size`, `overlay_accent`, `overlay_opacity`; one command `change_appearance_setting(key,value)` + `apply_appearance_setting` with tests; overlay applies zoom/opacity/accent, listens to `appearance-changed`. CLI `--preview-overlay` / command `preview_recording_overlay` shows bar 4.5 s without mic.
- Part 4 glitch ROOT CAUSE: clipboard.rs restored the old clipboard 60 ms after Cmd+V; slow Electron apps read later and paste the OLD clipboard. Fix: no restore when clipboard_handling=copy_to_clipboard (Solomon's setting), else delay scaled 250 ms+len/20 (max 1.5 s). Tests added. Evidence: history.db shows no post-processing ever ran; option+shift+space not even registered.
- Part 3: audit in docs/wispr-feature-audit.md (from docs; Wispr showed no window, no sign-in). Top: snippets, command mode, paste-last shortcut, self-correction cleanup, per-app styles.

Left:
- `src-tauri/src/prompt_chip.rs` (referenced in lib.rs, `preview`), prompt chip UI + Apple Intelligence rewrite; settings `prompt_chip_mode` / `prompt_chip_min_words` exist.
- Settings UI Appearance section (src/components/settings, ThemeSelector move, live preview, smooth toggles).
- Wispr features (snippets, self-correction first).
- CI green, download artifact, codesign "Apple Development: solomond24@icloud.com (CCW242B7M5)", back up /Applications/Handy.app to ~/Applications/Handy-0.10.0-backup.app, install, `--preview-overlay` screenshot over Claude, measure.

## Update 20:15
- CI run 42511142583: test job green (362 passed incl. all new tests), macOS build green, installed to /Applications/Handy.app signed with Apple Development CCW242B7M5 (backup ~/Applications/Handy-0.10.0-backup.app). Settings file kept.
- Proof: docs/proof/bar-centred-8-nov.png, wave centre = pill centre (0 px), dot and x mirrored within 0.5 px.
- Active-window centring returns target=None until Accessibility is re-granted (new signature). Solomon must re-allow Handy in System Settings > Privacy > Accessibility.
- Windows build broke before this branch (missing SPIRV-Headers); CI fix via vcpkg pushed, result pending.
- Not done: dedicated keyboard shortcut for the prompt chip; Settings page not screenshotted live (opening the window would steal focus).
