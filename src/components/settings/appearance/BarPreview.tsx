import React from "react";

/** Swatch colours; keep in sync with :root[data-accent] in RecordingOverlay.css. */
export const ACCENT_COLORS: Record<string, string> = {
  default: "#2f6bff",
  pink: "#f28cbb",
  green: "#22a06b",
  orange: "#f97316",
  purple: "#8b5cf6",
  graphite: "#6b7280",
};

const SCALE: Record<string, number> = { compact: 0.92, regular: 1.15 };
const WAVE = [3, 6, 10, 15, 20, 15, 10, 6, 3];
/** Neutral app icons for the Dock; one uses the accent. */
const DOCK = Array.from({ length: 7 }, () => "#8e8e93");
/** Real size of the Dock icons (points) next to a 32pt-tall bar. */
const ICON = 58;

interface BarPreviewProps {
  sample: string;
  style: string;
  size: string;
  accent: string;
  /** "clear" or "black" glass. */
  glass: string;
  opacity: number;
  position: string;
  /** The chosen speech model can show words while you talk. */
  showsWords: boolean;
}

/** The recording bar at its real size (points); callers scale it with `zoom`. */
const Pill: React.FC<{
  color: string;
  scale: number;
  words: boolean;
  sample: string;
  opacity: number;
  black: boolean;
}> = ({ color, scale, words, sample, opacity, black }) => (
  <div
    style={{
      zoom: scale,
      opacity,
      width: words ? 260 : 150,
      background: black
        ? "rgba(10, 10, 12, 0.55)"
        : "color-mix(in srgb, var(--color-background) 14%, transparent)",
      backdropFilter: black ? "blur(18px) saturate(140%)" : "blur(4px)",
      borderColor: black ? "rgba(255, 255, 255, 0.1)" : undefined,
      boxShadow: black ? "inset 0 1px 0 rgba(255, 255, 255, 0.14)" : undefined,
      color: black ? "#fff" : undefined,
      transition:
        "width 460ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease, background-color 300ms ease",
    }}
    className="flex flex-col rounded-[22px] border border-line"
  >
    {words && (
      <p
        className={`font-transcript px-[14px] pt-[10px] text-left text-[13px] leading-snug ${black ? "text-white/85" : "text-text/80"}`}
      >
        {sample}
      </p>
    )}
    <div
      className="grid h-[32px] items-center px-[10px]"
      style={{ gridTemplateColumns: "minmax(22px,1fr) auto minmax(22px,1fr)" }}
    >
      <span className="flex w-[22px] justify-center justify-self-start">
        <span
          className="h-[7px] w-[7px] rounded-full"
          style={{ background: color }}
        />
      </span>
      <span className="flex h-[20px] items-center gap-[3px]">
        {WAVE.map((h, i) => (
          <i
            key={i}
            className="hp-bar block w-[4px] rounded-[2px]"
            style={{
              height: h,
              background: color,
              animation: `hp-wave 0.9s cubic-bezier(.3,1,.4,1) ${i * 70}ms infinite`,
            }}
          />
        ))}
      </span>
      <span
        className={`flex h-[22px] w-[22px] items-center justify-center justify-self-end rounded-full ${black ? "bg-white/12 text-white/70" : "bg-wash text-ink-2"}`}
      >
        <svg viewBox="0 0 16 16" width="9" height="9">
          <path
            d="M4 4 L12 12 M12 4 L4 12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </div>
  </div>
);

/** A real-size Dock with the bar sitting at its very bottom (or the menu bar with the bar below). */
const Edge: React.FC<{
  top: boolean;
  color: string;
  pill: React.ReactNode;
}> = ({ top, color, pill }) =>
  top ? (
    <div
      className="relative flex flex-col items-center"
      style={{ width: 1470, height: 120 }}
    >
      <div className="h-[28px] w-full bg-text/10" />
      <div style={{ marginTop: 6 }}>{pill}</div>
    </div>
  ) : (
    <div
      className="relative flex items-end justify-center"
      style={{ width: 1470, height: 120 }}
    >
      <div className="mb-[6px] flex items-end gap-[10px] rounded-[26px] border border-text/10 bg-text/10 px-[10px] py-[8px]">
        {DOCK.map((c, i) => (
          <span
            key={i}
            className="rounded-[11px]"
            style={{ width: ICON, height: ICON, background: c, opacity: 0.85 }}
          />
        ))}
      </div>
      <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2">
        {pill}
      </div>
    </div>
  );

/**
 * A small Mac screen, plus a zoomed-in strip of the Dock and the bar, so the
 * bar's real size and position are easy to judge. Words only show when the
 * chosen model can really show them live.
 */
export const BarPreview: React.FC<BarPreviewProps> = ({
  sample,
  style,
  size,
  accent,
  glass,
  opacity,
  position,
  showsWords,
}) => {
  const black = glass === "black";
  const accentColor = ACCENT_COLORS[accent] ?? ACCENT_COLORS.default;
  const color = black ? "#ffffff" : accentColor;
  const scale = SCALE[size] ?? 0.92;
  const words = style !== "none" && showsWords;
  const top = position === "top";
  const pill =
    style === "none" ? null : (
      <Pill
        color={color}
        scale={scale}
        words={words}
        sample={sample}
        opacity={opacity}
        black={black}
      />
    );
  const wallpaper = `radial-gradient(120% 90% at 20% 10%, color-mix(in srgb, ${accentColor} 38%, transparent) 0%, transparent 60%), radial-gradient(100% 80% at 90% 100%, color-mix(in srgb, ${accentColor} 22%, transparent) 0%, transparent 65%), var(--color-background)`;

  return (
    <div
      className="flex w-full max-w-[460px] flex-col items-center gap-3"
      aria-hidden="true"
    >
      <style>{`
        @keyframes hp-wave { 0%,100% { transform: scaleY(.45) } 50% { transform: scaleY(1) } }
        @media (prefers-reduced-motion: reduce) { .hp-bar { animation: none !important } }
      `}</style>
      {/* Zoomed in: the Dock and the bar at their real size */}
      <div className="w-full">
        <div
          className="relative h-[130px] w-full overflow-hidden rounded-[14px] border border-line"
          style={{ background: wallpaper, transition: "background 300ms ease" }}
        >
          <div
            className="absolute left-1/2"
            style={{
              transform: "translateX(-50%) scale(0.8)",
              ...(top
                ? { top: 0, transformOrigin: "top center" }
                : { bottom: 0, transformOrigin: "bottom center" }),
            }}
          >
            <Edge top={top} color={color} pill={pill} />
          </div>
        </div>
      </div>
    </div>
  );
};
