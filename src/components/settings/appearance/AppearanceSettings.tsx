import React from "react";
import { useTranslation } from "react-i18next";
import { commands } from "@/bindings";
import { useSettings } from "@/hooks/useSettings";
import { useModelStore } from "@/stores/modelStore";
import { SettingsGroup } from "../../ui/SettingsGroup";
import { SettingContainer } from "../../ui/SettingContainer";
import { ThemeSelector } from "../ThemeSelector";
import { SegmentedControl } from "./SegmentedControl";
import { ToggleSwitch } from "../../ui/ToggleSwitch";
import { BarPreview, ACCENT_COLORS } from "./BarPreview";

const ACCENTS = Object.keys(ACCENT_COLORS);

export const AppearanceSettings: React.FC = () => {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettings();
  const showsWords = useModelStore(
    (m) => m.models.find((x) => x.id === m.currentModel)?.supports_streaming ?? false,
  );
  if (!settings) return null;

  const style = settings.overlay_style ?? "live";
  const size = settings.overlay_size ?? "compact";
  const position = settings.overlay_position ?? "bottom";
  const horizontal = settings.overlay_horizontal ?? "screen";
  const offset = settings.overlay_offset_x ?? 0;
  const accent = settings.overlay_accent ?? "default";
  const opacity = settings.overlay_opacity ?? 1;
  const chipMode = settings.prompt_chip_mode ?? "smart";
  const minWords = settings.prompt_chip_min_words ?? 40;

  const seg = (base: string, values: string[]) =>
    values.map((value) => ({ value, label: t(`${base}.${value}`) }));
  const a = "settings.appearance";

  return (
    <SettingsGroup title={t(`${a}.title`)}>
      <div className="px-4 py-4 flex flex-col items-center gap-3 border-b border-line">
        <BarPreview
          sample={t(`${a}.sample`)}
          style={style}
          size={size}
          accent={accent}
          opacity={opacity}
          position={position}
          showsWords={showsWords}
        />
        <button
          type="button"
          onClick={() => commands.previewRecordingOverlay()}
          className="min-h-[32px] px-3 rounded-[8px] text-xs font-medium text-center bg-wash hover:bg-line transition-transform duration-150 active:scale-[0.97] outline-none focus:outline-none"
        >
          {t(`${a}.showOnScreen`)}
        </button>
      </div>
      <ThemeSelector descriptionMode="tooltip" grouped={true} />
      <ToggleSwitch
        checked={style !== "none"}
        onChange={(on) => updateSetting("overlay_style", (on ? "live" : "none") as typeof style)}
        label={t(`${a}.barStyle.title`)}
        description={t(`${a}.barStyle.description`)}
        descriptionMode="tooltip"
        grouped={true}
      />
      <SettingContainer
        title={t(`${a}.size.title`)}
        description={t(`${a}.size.description`)}
        descriptionMode="tooltip"
        grouped={true}
      >
        <SegmentedControl
          ariaLabel={t(`${a}.size.title`)}
          options={seg(`${a}.size`, ["compact", "regular"])}
          value={size}
          onChange={(v) => updateSetting("overlay_size", v as typeof size)}
        />
      </SettingContainer>
      <SettingContainer
        title={t(`${a}.position.title`)}
        description={t(`${a}.position.description`)}
        descriptionMode="tooltip"
        grouped={true}
      >
        <SegmentedControl
          ariaLabel={t(`${a}.position.title`)}
          options={seg(`${a}.position`, ["top", "bottom"])}
          value={position}
          onChange={(v) => updateSetting("overlay_position", v as typeof position)}
        />
      </SettingContainer>
      <SettingContainer
        title={t(`${a}.horizontal.title`)}
        description={t(`${a}.horizontal.description`)}
        descriptionMode="tooltip"
        grouped={true}
      >
        <SegmentedControl
          ariaLabel={t(`${a}.horizontal.title`)}
          options={seg(`${a}.horizontal`, ["screen", "active_window", "custom"])}
          value={horizontal}
          onChange={(v) =>
            updateSetting("overlay_horizontal", v as typeof horizontal)
          }
        />
      </SettingContainer>
      {horizontal === "custom" && (
        <SettingContainer
          title={t(`${a}.offset.title`)}
          description={t(`${a}.offset.description`)}
          descriptionMode="tooltip"
          grouped={true}
        >
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={-600}
              max={600}
              step={1}
              defaultValue={offset}
              aria-label={t(`${a}.offset.title`)}
              onChange={(e) =>
                updateSetting("overlay_offset_x", Number(e.target.value))
              }
              className="w-40 accent-logo-primary"
            />
            <span className="w-12 text-right text-xs tabular-nums text-ink-2">
              {Math.round(offset)}
            </span>
          </div>
        </SettingContainer>
      )}
      <SettingContainer
        title={t(`${a}.accent.title`)}
        description={t(`${a}.accent.description`)}
        descriptionMode="tooltip"
        grouped={true}
      >
        <div role="radiogroup" className="flex items-center gap-2">
          {ACCENTS.map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={accent === id}
              aria-label={t(`${a}.accent.${id}`)}
              title={t(`${a}.accent.${id}`)}
              onClick={() => updateSetting("overlay_accent", id)}
              className="h-6 w-6 rounded-full outline-none focus:outline-none transition-transform duration-200 ease-out hover:scale-110 active:scale-[0.97]"
              style={{
                background: ACCENT_COLORS[id],
                boxShadow:
                  accent === id
                    ? `0 0 0 2px var(--color-background), 0 0 0 4px ${ACCENT_COLORS[id]}`
                    : "none",
              }}
            />
          ))}
        </div>
      </SettingContainer>
      <SettingContainer
        title={t(`${a}.opacity.title`)}
        description={t(`${a}.opacity.description`)}
        descriptionMode="tooltip"
        grouped={true}
      >
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={40}
            max={100}
            step={5}
            defaultValue={Math.round(opacity * 100)}
            aria-label={t(`${a}.opacity.title`)}
            onChange={(e) =>
              updateSetting("overlay_opacity", Number(e.target.value) / 100)
            }
            className="w-40 accent-logo-primary"
          />
          <span className="w-12 text-right text-xs tabular-nums text-ink-2">
            {Math.round(opacity * 100)}%
          </span>
        </div>
      </SettingContainer>
      <SettingContainer
        title={t(`${a}.promptChip.title`)}
        description={t(`${a}.promptChip.description`)}
        descriptionMode="tooltip"
        grouped={true}
      >
        <SegmentedControl
          ariaLabel={t(`${a}.promptChip.title`)}
          options={seg(`${a}.promptChip`, ["off", "smart", "ask", "always"])}
          value={chipMode}
          onChange={(v) => updateSetting("prompt_chip_mode", v as typeof chipMode)}
        />
      </SettingContainer>
      {(chipMode === "ask" || chipMode === "always") && (
        <SettingContainer
          title={t(`${a}.promptChip.minWords`)}
          description={t(`${a}.promptChip.description`)}
          descriptionMode="tooltip"
          grouped={true}
        >
          <input
            type="number"
            min={5}
            max={2000}
            defaultValue={minWords}
            aria-label={t(`${a}.promptChip.minWords`)}
            onBlur={(e) =>
              updateSetting("prompt_chip_min_words", Number(e.target.value) || 40)
            }
            className="w-20 rounded-[8px] bg-wash px-2 py-1 text-center text-xs outline-none focus:outline-none"
          />
        </SettingContainer>
      )}
    </SettingsGroup>
  );
};
