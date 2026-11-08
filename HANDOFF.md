# Handy (Solomon's fork) — handoff for any coding agent

Tauri app (Rust backend `src-tauri/`, React/TypeScript frontend `src/`). Branch `overnight-8-nov`, remote Solomon-69/Handy. NOT an Xcode project: it builds with Cargo + Tauri. No Rust on Solomon's Mac, so builds run on GitHub Actions ("Solomon build"). Install the Mac result with `scripts/install-ci-build.sh <run-id>` (signs with "Apple Development: solomond24@icloud.com (CCW242B7M5)", backs up the old app, relaunches in background).

## Features added in this fork
- Recording bar: clear-glass look (one flat see-through colour, no gradient), shimmer label while working (no spinner), cancel cross in its own grid column, working bar only as wide as its label, sizes Compact 0.92x / Regular 1.15x, position top/bottom, horizontal screen/active window/custom, accent colour (`data-accent`, recolours every control), opacity, on/off switch.
- Settings > Appearance: zoomed-in preview only (Dock + bar), accent swatches (default swatch fixed blue), smooth toggles.
- Smart prompt mode (`prompt_chip.rs`, `prompt_detect.rs`): rule-based detection of AI prompts (50+ words, AI app frontmost); rewrites with Apple Intelligence into /prompt-skill sections (Goal/Steps/Rules/Context/Questions). Label "Prompt engineering…" is shown immediately for long dictations in AI apps (`predict_prompt`).
- Always-on self-correction (`smart_fix.rs`, `voice_edits.rs`): "X, no wait, Y" keeps Y; model only runs on strong cues (speed); filler words um/uh removed.
- Spoken punctuation, symbols and numbers (`spoken_format.rs`), "slash" only when a word follows.
- Paste reliability (`paste_guard.rs`, `clipboard.rs`): refocus the target app (waits up to 1.5 s) else keep text on clipboard; never paste twice.
- Shortcut false-release guard (`shortcut/tauri_impl.rs`) for 20–30 s dictations stopping early (cause unconfirmed).

## Rules from Solomon
Plain English reports; test before saying done; no second test copy of the app left running (it doubled pastes); never toggle Mac dark mode; free tools only; do not touch upstream PRs.

## Open items
Personal dictionary and per-app tone (Wispr Flow features) not built; Windows build fails (ignore); verify 20–30 s stop and paste reliability live.
