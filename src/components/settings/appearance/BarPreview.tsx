import React from "react";

/** Swatch colours; keep in sync with :root[data-accent] in RecordingOverlay.css. */
export const ACCENT_COLORS: Record<string, string> = {
  default: "var(--color-logo-primary)",
  pink: "#f28cbb",
  green: "#22a06b",
  orange: "#f97316",
  purple: "#8b5cf6",
  graphite: "#6b7280",
};

const SCALE: Record<string, number> = { compact: 0.92, regular: 1.15 };
const BARS = [0.3, 0.5, 0.75, 0.95, 1, 0.95, 0.75, 0.5, 0.3];
/** Neutral app icons for the little Dock; one uses the accent. */
const DOCK = ["#8e8e93", "#a1a1a6", "accent", "#7c7c82", "#b0b0b5", "#96969b", "#88888d"];

interface BarPreviewProps {
  sample: string;
  style: string;
  size: string;
  accent: string;
  opacity: number;
  position: string;
  /** The chosen speech model can show words while you talk. */
  showsWords: boolean;
}

/**
 * A small Mac screen (menu bar, wallpaper, Dock) with the recording bar where
 * it really appears, drawn with the same geometry as RecordingOverlay.css.
 * Words only show when the chosen model can really show them live.
 */
export const BarPreview: React.FC<BarPreviewProps> = ({
  sample,
  style,
  size,
  accent,
  opacity,
  position,
  showsWords,
}) => {
  const color = ACCENT_COLORS[accent] ?? ACCENT_COLORS.default;
  const scale = SCALE[size] ?? 0.92;
  const words = style === "live" && showsWords;
  const top = position === "top";

  return (
    <div
      className="relative mx-auto aspect-[16/10] w-full max-w-[460px] overflow-hidden rounded-[14px] border border-line"
      style={{
        background: `radial-gradient(120% 90% at 20% 10%, color-mix(in srgb, ${color} 38%, transparent) 0%, transparent 60%), radial-gradient(100% 80% at 90% 100%, color-mix(in srgb, ${color} 22%, transparent) 0%, transparent 65%), var(--color-background)`,
        transition: "background 300ms ease",
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes hp-wave { 0%,100% { transform: scaleY(.45) } 50% { transform: scaleY(1) } }
        @media (prefers-reduced-motion: reduce) { .hp-bar { animation: none !important } }
      `}</style>
      {/* Menu bar */}
      <div className="absolute inset-x-0 top-0 flex h-[14px] items-center gap-[6px] bg-text/10 px-[8px] backdrop-blur">
        <span className="h-[5px] w-[5px] rounded-full bg-text/50" />
        {[22, 16, 18, 14].map((w, i) => (
          <span key={i} className="h-[3px] rounded-full bg-text/30" style={{ width: w }} />
        ))}
        <span className="ml-auto h-[3px] w-[30px] rounded-full bg-text/30" />
      </div>
      {/* Dock */}
      <div className="absolute inset-x-0 bottom-[3px] flex justify-center">
        <div className="flex items-end gap-[3px] rounded-[6px] border border-text/10 bg-text/10 px-[4px] py-[3px] backdrop-blur">
          {DOCK.map((c, i) => (
            <span
              key={i}
              className="h-[13px] w-[13px] rounded-[3px]"
              style={{ background: c === "accent" ? color : c, opacity: 0.85 }}
            />
          ))}
        </div>
      </div>
      {style === "none" ? null : (
        <div
          className={`absolute inset-x-0 flex justify-center ${top ? "top-[16px]" : "bottom-[3px]"}`}
        >
          <div
            style={{
              // True to size: the preview screen is ~460px wide for a ~1470pt screen.
              zoom: scale * 0.34,
              opacity,
              width: words ? 260 : 150,
              transition: "width 460ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease",
              boxShadow: "0 8px 24px rgba(0,0,0,.28)",
            }}
            className="flex flex-col rounded-[22px] border border-line bg-background"
          >
            {words && (
              <p className="px-[14px] pt-[10px] text-left text-[13px] italic leading-snug text-text/80">
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
                  style={{ background: color, transition: "background 200ms ease" }}
                />
              </span>
              <span className="flex h-[20px] items-center gap-[3px]">
                {BARS.map((h, i) => (
                  <i
                    key={i}
                    className="hp-bar block w-[4px] rounded-[2px]"
                    style={{
                      height: 3 + h * 17,
                      background: color,
                      transition: "background 200ms ease",
                      animation: `hp-wave 0.9s cubic-bezier(.3,1,.4,1) ${i * 70}ms infinite`,
                    }}
                  />
                ))}
              </span>
              <span className="flex h-[22px] w-[22px] items-center justify-center justify-self-end rounded-full bg-wash text-ink-2">
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
        </div>
      )}
    </div>
  );
};
