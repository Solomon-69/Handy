import React from "react";

/** Swatch colours; keep in sync with :root[data-accent] in RecordingOverlay.css. */
export const ACCENT_COLORS: Record<string, string> = {
  default: "var(--color-logo-primary)",
  blue: "#3b82f6",
  green: "#22a06b",
  orange: "#f97316",
  purple: "#8b5cf6",
  graphite: "#6b7280",
};

const SCALE: Record<string, number> = { small: 0.85, medium: 1, large: 1.2 };
const BARS = [0.25, 0.45, 0.7, 0.9, 1, 0.9, 0.7, 0.45, 0.25];

interface BarPreviewProps {
  style: string;
  size: string;
  accent: string;
  opacity: number;
  position: string;
}

/**
 * A live copy of the recording bar (dot | waveform | cancel), drawn with the
 * same geometry as RecordingOverlay.css so Settings shows what you will get.
 */
export const BarPreview: React.FC<BarPreviewProps> = ({
  style,
  size,
  accent,
  opacity,
  position,
}) => {
  const color = ACCENT_COLORS[accent] ?? ACCENT_COLORS.default;
  const scale = SCALE[size] ?? 1;
  const live = style === "live";

  return (
    <div
      className={`relative flex h-[132px] w-full max-w-[460px] justify-center rounded-[12px] bg-wash/60 overflow-hidden ${
        position === "top" ? "items-start pt-3" : "items-end pb-3"
      }`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes hp-wave { 0%,100% { transform: scaleY(.55) } 50% { transform: scaleY(1) } }
        @media (prefers-reduced-motion: reduce) { .hp-bar { animation: none !important } }
      `}</style>
      {style === "none" ? (
        // eslint-disable-next-line i18next/no-literal-string
        <span className="self-center text-xs text-ink-3">-</span>
      ) : (
        <div
          style={{
            zoom: scale,
            opacity,
            width: live ? 260 : 172,
            transition:
              "width 460ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease",
          }}
          className="flex flex-col rounded-[22px] border border-line bg-background"
        >
          {live && (
            <p className="px-[14px] pt-[10px] text-[13px] italic leading-snug text-text/80 text-left">
              {/* eslint-disable-next-line i18next/no-literal-string */}
              Hello, this is how your words appear
            </p>
          )}
          <div
            className="grid h-[40px] items-center px-[10px]"
            style={{ gridTemplateColumns: "minmax(22px,1fr) auto minmax(22px,1fr)" }}
          >
            <span className="flex w-[22px] justify-center justify-self-start">
              <span
                className="h-[7px] w-[7px] rounded-full"
                style={{ background: color, transition: "background 200ms ease" }}
              />
            </span>
            <span className="flex h-[18px] items-center gap-[3px]">
              {BARS.map((h, i) => (
                <i
                  key={i}
                  className="hp-bar block w-[4px] rounded-[2px]"
                  style={{
                    height: 3 + h * 15,
                    background: color,
                    transition: "background 200ms ease",
                    animation: `hp-wave 1.2s ease-in-out ${i * 90}ms infinite`,
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
      )}
    </div>
  );
};
