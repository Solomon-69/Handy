import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Snippet } from "@/bindings";
import { useSettings } from "@/hooks/useSettings";
import { SettingsGroup } from "../../ui/SettingsGroup";
import { SettingContainer } from "../../ui/SettingContainer";

/** Spoken corrections toggle plus a small editor for snippets. */
export const SnippetsSettings: React.FC = () => {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettings();
  const [rows, setRows] = useState<Snippet[]>([]);

  useEffect(() => {
    setRows(settings?.snippets ?? []);
  }, [settings?.snippets]);

  if (!settings) return null;
  const b = "settings.snippets";

  const save = (next: Snippet[]) => updateSetting("snippets", next);
  const edit = (i: number, patch: Partial<Snippet>) =>
    setRows((prev) => prev.map((r, k) => (k === i ? { ...r, ...patch } : r)));

  const field =
    "min-h-[30px] rounded-[8px] bg-wash px-2 text-xs outline-none focus:outline-none";

  return (
    <SettingsGroup title={t(`${b}.title`)}>
      <SettingContainer
        title={t(`${b}.list.title`)}
        description={t(`${b}.list.description`)}
        descriptionMode="inline"
        grouped={true}
        layout="stacked"
      >
        <div className="flex w-full flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={`${field} w-36`}
                placeholder={t(`${b}.trigger`)}
                value={row.trigger}
                onChange={(e) => edit(i, { trigger: e.target.value })}
                onBlur={() => save(rows)}
              />
              <input
                className={`${field} flex-1`}
                placeholder={t(`${b}.text`)}
                value={row.text}
                onChange={(e) => edit(i, { text: e.target.value })}
                onBlur={() => save(rows)}
              />
              <button
                type="button"
                aria-label={t(`${b}.remove`)}
                title={t(`${b}.remove`)}
                onClick={() => {
                  const next = rows.filter((_, k) => k !== i);
                  setRows(next);
                  save(next);
                }}
                className="h-[30px] w-[30px] rounded-[8px] text-center text-ink-2 hover:bg-wash active:scale-[0.97] outline-none focus:outline-none"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, { trigger: "", text: "" }])}
            className="self-start min-h-[30px] px-3 rounded-[8px] bg-wash text-xs font-medium text-center hover:bg-line active:scale-[0.97] outline-none focus:outline-none"
          >
            {t(`${b}.add`)}
          </button>
        </div>
      </SettingContainer>
    </SettingsGroup>
  );
};
