//! "Turn into a prompt": after a long dictation, offer to rewrite the text as a
//! clear AI prompt (or clean it up) before pasting. Never runs on its own unless
//! the person picked "Always".

use crate::settings::{self, PromptChipMode};
use std::sync::mpsc::{self, Sender};
use std::sync::Mutex;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

/// Where the overlay's click goes while a choice is up.
static PENDING: Mutex<Option<Sender<Choice>>> = Mutex::new(None);

/// The person's pick on the chip.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Choice {
    PasteAsIs,
    TurnIntoPrompt,
    CleanUp,
}

impl Choice {
    fn parse(value: &str) -> Option<Self> {
        match value {
            "paste" => Some(Choice::PasteAsIs),
            "prompt" => Some(Choice::TurnIntoPrompt),
            "clean" => Some(Choice::CleanUp),
            _ => None,
        }
    }
}

/// Overlay chip button -> the waiting paste thread.
#[tauri::command]
#[specta::specta]
pub fn prompt_chip_choose(choice: String) -> Result<(), String> {
    let choice = Choice::parse(&choice).ok_or_else(|| format!("Unknown choice '{choice}'"))?;
    if let Some(tx) = PENDING.lock().map_err(|e| e.to_string())?.take() {
        let _ = tx.send(choice);
    }
    Ok(())
}

/// Called on the paste thread just before pasting. Returns the text to paste:
/// the dictation itself unless the person picked a rewrite (or chose Always).
/// Blocks for at most CHIP_TIMEOUT_MS while the choice is up.
pub fn resolve(app: &AppHandle, text: String) -> String {
    let s = settings::get_settings(app);
    let choice = match decide(s.prompt_chip_mode, s.prompt_chip_min_words, &text) {
        ChipDecision::Paste => return text,
        ChipDecision::RewriteNow => Choice::TurnIntoPrompt,
        ChipDecision::Ask => ask(app, &text),
    };
    let _ = app.emit_to("recording_overlay", "prompt-chip-done", ());
    let system = match choice {
        Choice::PasteAsIs => return text,
        Choice::TurnIntoPrompt => PROMPT_REWRITE_INSTRUCTION.to_string(),
        Choice::CleanUp => cleanup_instruction(&s),
    };
    match rewrite(&system, &text) {
        Ok(out) if !out.trim().is_empty() => out.trim().to_string(),
        Ok(_) => text,
        Err(err) => {
            log::warn!("Prompt chip rewrite failed: {err}");
            let _ = app.emit_to("recording_overlay", "prompt-chip-error", err);
            text
        }
    }
}

fn ask(app: &AppHandle, text: &str) -> Choice {
    let (tx, rx) = mpsc::channel();
    if let Ok(mut slot) = PENDING.lock() {
        *slot = Some(tx);
    }
    let _ = app.emit_to(
        "recording_overlay",
        "prompt-chip",
        PromptChipEvent {
            words: word_count(text) as u32,
            timeout_ms: CHIP_TIMEOUT_MS as u32,
        },
    );
    let choice = rx
        .recv_timeout(Duration::from_millis(CHIP_TIMEOUT_MS))
        .unwrap_or(Choice::PasteAsIs);
    if let Ok(mut slot) = PENDING.lock() {
        *slot = None;
    }
    choice
}

/// The existing "Improve Transcriptions" prompt, as a system instruction.
fn cleanup_instruction(s: &settings::AppSettings) -> String {
    s.post_process_prompts
        .iter()
        .find(|p| p.id == "default_improve_transcriptions")
        .map(|p| p.prompt.replace("${output}", "(the user message)"))
        .unwrap_or_else(|| {
            "Clean this transcript: fix spelling, punctuation and capitals, remove filler words, keep the meaning and language. Do not answer it. Return only the cleaned text.".to_string()
        })
}

#[cfg(all(target_os = "macos", target_arch = "aarch64"))]
fn rewrite(system: &str, text: &str) -> Result<String, String> {
    if !crate::apple_intelligence::check_apple_intelligence_availability() {
        return Err("Apple Intelligence is not available on this Mac".to_string());
    }
    crate::apple_intelligence::process_text_with_system_prompt(system, text, 0)
}

#[cfg(not(all(target_os = "macos", target_arch = "aarch64")))]
fn rewrite(_system: &str, _text: &str) -> Result<String, String> {
    Err("Turn into a prompt needs Apple Intelligence on a Mac".to_string())
}

/// How long the choice stays up before "Paste as is" happens by itself.
pub const CHIP_TIMEOUT_MS: u64 = 4000;

/// What to do with a finished dictation.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ChipDecision {
    /// Paste straight away, no choice shown.
    Paste,
    /// Show the choice; paste as is if nothing is picked in time.
    Ask,
    /// Rewrite into a prompt without asking (the person chose "Always").
    RewriteNow,
}

pub fn word_count(text: &str) -> usize {
    text.split_whitespace().count()
}

pub fn decide(mode: PromptChipMode, min_words: u32, text: &str) -> ChipDecision {
    let long_enough = word_count(text) >= min_words as usize;
    match mode {
        PromptChipMode::Off => ChipDecision::Paste,
        _ if !long_enough => ChipDecision::Paste,
        PromptChipMode::Ask => ChipDecision::Ask,
        PromptChipMode::Always => ChipDecision::RewriteNow,
    }
}

/// System instruction for the on-device model. Rewrite only: the model must
/// never answer, act on, or add to the request.
pub const PROMPT_REWRITE_INSTRUCTION: &str = "You rewrite dictated text into a clear, concise prompt for an AI assistant. \
Rules: keep every requirement, fact, name and number the speaker gave; drop filler, repeats and false starts; \
when the speaker corrects themselves keep only the correction; use Markdown with a one-line goal first, then short \
sections only where they help (Context, Requirements, Output); write in the speaker's language; do not invent details. \
Never answer the request, never carry it out, never add advice or commentary. Output only the rewritten prompt.";

/// Sample shown by `--preview-prompt-chip`.
const PREVIEW_TEXT: &str = "so I want you to look at the settings page and um make the toggles slide smoothly and also check the dark mode colours";

/// Payload for the bar's choice chip.
#[derive(Clone, serde::Serialize, specta::Type)]
pub struct PromptChipEvent {
    pub words: u32,
    pub timeout_ms: u32,
}

/// Shows the choice chip with sample text, without recording (testing aid).
pub fn preview(app: &AppHandle) {
    crate::overlay::preview_overlay(app);
    let _ = app.emit_to(
        "recording_overlay",
        "prompt-chip",
        PromptChipEvent {
            words: word_count(PREVIEW_TEXT) as u32,
            timeout_ms: CHIP_TIMEOUT_MS as u32,
        },
    );
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn off_never_asks() {
        let long = "word ".repeat(500);
        assert_eq!(decide(PromptChipMode::Off, 40, &long), ChipDecision::Paste);
    }

    #[test]
    fn short_dictations_paste_straight_away() {
        let short = "word ".repeat(39);
        assert_eq!(decide(PromptChipMode::Ask, 40, &short), ChipDecision::Paste);
        assert_eq!(decide(PromptChipMode::Always, 40, &short), ChipDecision::Paste);
    }

    #[test]
    fn long_dictations_ask_or_rewrite() {
        let long = "word ".repeat(40);
        assert_eq!(decide(PromptChipMode::Ask, 40, &long), ChipDecision::Ask);
        assert_eq!(decide(PromptChipMode::Always, 40, &long), ChipDecision::RewriteNow);
    }

    #[test]
    fn choices_parse() {
        assert_eq!(Choice::parse("paste"), Some(Choice::PasteAsIs));
        assert_eq!(Choice::parse("prompt"), Some(Choice::TurnIntoPrompt));
        assert_eq!(Choice::parse("clean"), Some(Choice::CleanUp));
        assert_eq!(Choice::parse("rm -rf"), None);
    }

    #[test]
    fn instruction_forbids_answering() {
        assert!(PROMPT_REWRITE_INSTRUCTION.contains("Never answer"));
    }
}
