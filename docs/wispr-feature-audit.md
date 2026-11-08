# Wispr Flow feature audit (clean room)

Date: 2026-11-08. Target studied: Wispr Flow 1.6.1400 (macOS).

## Method and limits

- Clean room. Only outside sources: the app's Info.plist, top-level bundle file names, and public web pages. No code, text or images were copied. All descriptions below are in our own words.
- Screenshots: not taken. `open -g -a "Wispr Flow"` started but the app showed no on-screen window within about 2 minutes (likely a sign-in or startup state; we did not sign in). The app was quit after. So every row below is "from docs".
- Info.plist facts: Electron app, URL scheme `wispr-flow`, mic and system-audio permission strings (the audio one mentions meeting notes), Apple Events permission string (mentions "computer use" in other apps), Bluetooth permission. Bundle holds 60+ language folders, a `fasttext` folder (suggests local language detection), a `swift-helper-app-dist` folder (native helper for key and text handling), and a `migrations` folder (local database).
- Pages opened: https://wisprflow.ai , https://docs.wisprflow.ai , https://docs.wisprflow.ai/articles/4816967992-how-to-use-command-mode , https://docs.wisprflow.ai/articles/5096240724-navigating-the-wispr-flow-app-desktop-ios-and-android , https://cdn.jsdelivr.net/npm/@agent-native/core@0.124.6/corpus/templates/clips/desktop/design-refs/wispr-ux.md (third-party UX note, unofficial). WebSearch run 5 times (command mode, styles, hands-free, stats, snippets/dictionary/whisper). Search hits not opened (secondary): fritz.ai, tldv.io, letterly.app review pages.
- Confidence: official help pages are thin on Styles, Snippets, Whisper Mode, stats. Those rows lean on third-party notes and are marked "unverified".
- Handy side: read from `src/components/settings/*` file names and field names in `src-tauri/src/settings.rs`.

## Handy today (quick inventory)

- Hold or toggle shortcut (`shortcut_activation`, `hold_threshold_ms`), several bindings.
- Custom words with fuzzy threshold (`custom_words`, `word_correction_threshold`).
- Filler word removal with custom list (`filler_word_removal_enabled`, `custom_filler_words`).
- History with copy, star, delete, retention (`history_limit`, `recording_retention_period`).
- Post-processing with an LLM: several prompts (`post_process_prompts`), providers, API keys, structured output; an Apple Intelligence module exists in `src-tauri/src/apple_intelligence.rs`.
- Auto submit (`auto_submit`, `auto_submit_key`), paste method, clipboard handling, trailing space.
- Language: selected language, spoken languages, language detection mode, translate to English, Chinese script.
- Overlay: top or bottom position, style Minimal / Live / None.
- Mic: device, channel, always-on, clamshell mic, mute while recording, AirPods mode, VAD, long-form chunking.
- Other: sound themes, theme, autostart, tray icon, update checks, onboarding flag.
- Not found by grep: snippets, command mode, usage stats, per-app styles, paste-last shortcut.

## Feature table

Priority: 1 high, 3 low. "Offline" = free and offline possible.

| Feature | What it does | Screenshot | Handy has it | Free + offline possible? | Priority |
|---|---|---|---|---|---|
| Command Mode | Hold a separate shortcut, speak an instruction ("shorten this", "make it polite"); the app sends selected text plus the instruction to a language model and replaces the selection. Needs existing text or selection. Cancel with Esc. Off by default, under an Experimental page. | from docs | no | yes: Apple Intelligence on-device model, or a local model; speech part uses the existing local model | 1 |
| Per-app styles / tones | User picks a writing style per app group (chat, work chat, email, other), from formal to very casual. English only at launch. Cleanup strength has several levels (unverified). | from docs | partly (one global post-process prompt; no per-app) | yes: map frontmost app bundle id to a saved prompt, run on-device model or local rules | 1 |
| Personal dictionary | Manual words and replacements; also auto-learns when the user edits a wrong word after paste (auto-add toggle). Team plan can share it. | from docs | partly (custom words list with fuzzy match; no replacement pairs, no auto-learn) | yes: pure local rules; auto-learn needs reading the edited text, doable with Accessibility API | 2 |
| Snippets | Say a short trigger, the app inserts a saved block of text (link, address, bio, sign-off). | from docs | no | yes: local text match after transcription, no model | 1 |
| Auto-format lists and numbers | Spoken sequences become numbered lists; "new line", "new paragraph" work; numbers and spoken punctuation names become symbols. | from docs | no | yes: local rules for "new line", "new paragraph", number words; lists via on-device model or simple rules | 2 |
| Filler removal | Removes "um", "uh" and similar. | from docs | yes (toggle plus custom list) | yes: already local | 3 |
| Self-corrections ("no, I mean") | Keeps the final intent when the speaker changes their mind mid-sentence. Marketed as Backtrack. | from docs | no | partly: simple local rules for cue phrases ("no I mean", "sorry", "scratch that"); better with on-device model | 1 |
| Whisper mode | Tuned for very quiet speech in shared rooms; reported as a Pro item. Menu path not found. | from docs (unverified) | no | yes: input gain boost plus lower VAD threshold before the local model | 3 |
| History | Searchable list grouped by date; hover shows copy and flag; entries can be retried (mobile). | from docs | partly (copy, star, delete, retention; check for search and date groups) | yes: local database | 3 |
| Paste last dictation | Global shortcut re-pastes the latest result. | from docs (third-party list) | no | yes: store last text, paste via existing paste path | 1 |
| Hands-free toggle mode | Double-press the dictation key (or key plus Space) to lock recording on; press again or click stop to end. Recording warns near 19 min and stops at 20 min. | from docs | partly (toggle activation exists as a setting; no double-press lock from the hold key) | yes: local timing logic | 2 |
| View raw vs cleaned diff | A shortcut shows raw text next to cleaned text so the user can check edits. | from docs (unofficial) | no | yes: keep both strings in history | 3 |
| Floating flow bar | Small dark pill at the bottom centre; grows while listening with bars moving to voice level; no spinner on processing; can dock to a side edge and turn vertical; position saved; can be hidden. See look and feel notes. | from docs | partly (top/bottom, Minimal/Live/None) | yes: UI only | 2 |
| Usage stats | Home page shows word count, shortcut hint and statistics (details like WPM and streak not confirmed in docs). Weekly words card ties to the plan. | from docs | no | yes: count words in local history, compute WPM from recording length, streak from dates; nothing leaves the Mac | 2 |
| Multi-language switching | "My languages" picker (2 to 3 recommended) plus auto-detect across 100+ languages; language can be picked from the bar. | from docs | yes (spoken languages, detection mode, selector) | yes: already local; quick switch from overlay is the gap | 2 |
| Custom shortcuts and mouse buttons | Up to 4 bindings per action, up to 3 keys, mouse buttons allowed, one cancel binding. | from docs | partly (bindings exist; mouse buttons and multi-binding not confirmed) | yes | 3 |
| Code-aware mode | In IDEs: file name tagging, camelCase / snake_case, command-line formatting. | from docs (unofficial) | no | partly: local rules per bundle id | 3 |
| Context-aware text insertion | Capitalisation and spacing follow the cursor context; trailing period dropped in chat apps. | from docs (unofficial) | partly (trailing space option) | yes: Accessibility API to read the character before the cursor | 2 |
| Meetings / notetaker | Records system audio for meeting notes (plan and policy dependent). | from docs | no | partly: system audio capture needs permission; summary via on-device model | 3 |
| Search / draft by voice in Command Mode | Spoken search opens a web search; draft replies; app building results open in the browser. | from docs | no | partly: web search link is free; drafting via on-device model | 3 |
| Onboarding | About 8 steps (unofficial): sign in, grant mic and accessibility, mic test with a level meter, set shortcut, pick profile and language, practice in a fake mail/notes sandbox, before/after demo, land on Home. | from docs (unofficial) | partly (onboarding flag exists; our flow has no sandbox practice) | yes: no sign-in needed | 2 |
| Settings layout | Sidebar: Home, Meetings, Settings, Help. Settings: General (shortcuts, mic, languages, theme), System (launch at login, bar visibility, notifications, dock icon), Account, Plans and Billing, Data and Privacy, Experimental. | from docs | yes (we have our own sections) | yes | 3 |
| Data and privacy controls | Export data, transcript auto-delete (mobile), storage page. | from docs | partly (retention period exists) | yes: all local | 3 |
| Mobile keyboard / bubble | iPhone keyboard and Android bubble that dictate in any app. | from docs | no | out of scope for Tauri desktop | 3 |

## Recommended build order (top 5)

1. Snippets: after transcription, match a spoken trigger (exact or fuzzy) to a saved text and insert it. Pure local string work, no model, works on any Mac.
2. Command Mode: second shortcut; read selected text through Accessibility (fallback: copy); transcribe the spoken instruction locally; run the rewrite with the Apple Intelligence on-device model (existing module in `apple_intelligence.rs`); paste the result over the selection. Fall back to a local model on Macs without it.
3. Paste last dictation shortcut: keep the last result in memory and paste it with the existing paste code. Small effort, high daily value.
4. Self-correction cleanup: local rule pass for cue phrases ("no I mean", "scratch that", "sorry") that keeps only the final part; optional on-device model pass for harder cases. Sits next to the existing filler removal.
5. Per-app styles: choose a saved post-process prompt by frontmost app bundle id (chat, email, code, other) and run it with the on-device model or local rules; no cloud key needed.

Next in line: usage stats from local history, auto-learn dictionary, double-press hands-free lock, list and number formatting rules.

## Look and feel notes

The dictation bar is a small dark capsule near the bottom centre of the screen. At rest it can shrink to a tiny bubble or hide entirely. While listening it grows slightly and shows thin white vertical bars that rise and fall with voice level, like a level meter rather than a round waveform. A short chime marks the start. After release the bars stop, there is no spinner, and the pasted text itself is the sign that it worked. It can be dragged to a side edge, where it turns vertical, and its place is remembered. Esc cancels. Exact pixel size was not measured because no screenshot was possible.

The main window is a plain two-column layout: a narrow sidebar (Home, Meetings, then Settings and Help at the bottom) and a content area. Home leads with a greeting, a word count, the shortcut and a few statistics, then a searchable history grouped by date; hovering a row shows copy and flag. Settings is a short list of pages (General, System, Account, plans, Data and Privacy, Experimental). Light and dark themes only; no automatic option yet. The tone is calm and sparse, with few controls per page. Handy could keep its own look and borrow only the ideas: statistics on the home page, history grouped by date with hover actions, and a vertical bar when docked to the side.

## Licence note

Nothing here was taken from the app's code or assets. Ideas such as snippets, dictionaries and voice rewriting are common features in many dictation tools.
