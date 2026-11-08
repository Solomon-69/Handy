//! "Turn into a prompt": after a long dictation, offer to rewrite the text as a
//! clear AI prompt (or clean it up) before pasting. Never runs on its own unless
//! the person picked "Always".

use crate::settings::PromptChipMode;
use tauri::{AppHandle, Emitter};

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
    fn instruction_forbids_answering() {
        assert!(PROMPT_REWRITE_INSTRUCTION.contains("Never answer"));
    }
}
