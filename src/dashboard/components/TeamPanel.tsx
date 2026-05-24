import { produce } from "immer";
import { useSettings } from "~/state/dashboard";
import { cn } from "~/dashboard/utils/ui";
import {
  dashboardFieldLabelClassName,
  dashboardInputClassName,
  teamPanelClassName,
  type TeamSide,
} from "./constants";

const teamModelPresets = ["blue", "red"] as const;

function isPresetTeamModel(model: string) {
  return teamModelPresets.includes(
    model.trim().toLowerCase() as (typeof teamModelPresets)[number],
  );
}

type TeamPanelProps = {
  side: TeamSide;
  accent: string;
  label: string;
};

export function TeamPanel({ side, accent, label }: TeamPanelProps) {
  const [settings, setSettings] = useSettings();

  const teamSettings =
    side === "left" ? settings.leftTeamSettings : settings.rightTeamSettings;
  const teamLogoUrl =
    side === "left" ? settings.leftTeamLogoUrl : settings.rightTeamLogoUrl;
  const modelIsPreset = isPresetTeamModel(teamSettings.model);

  const changeTeamModel = (value: string) => {
    setSettings(
      produce((settings) => {
        if (side === "left") settings.leftTeamSettings.model = value;
        else settings.rightTeamSettings.model = value;
      }),
    );
  };

  const changeTeamName = (value: string) => {
    setSettings(
      produce((settings) => {
        if (side === "left") settings.leftTeamSettings.name = value;
        else settings.rightTeamSettings.name = value;
      }),
    );
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload-logo", { method: "POST", body: form });
    const data = (await res.json()) as { url: string };
    setSettings(
      produce((settings) => {
        if (side === "left") settings.leftTeamLogoUrl = data.url;
        else settings.rightTeamLogoUrl = data.url;
      }),
    );
  };

  const removeLogo = () => {
    setSettings(
      produce((settings) => {
        if (side === "left") settings.leftTeamLogoUrl = "";
        else settings.rightTeamLogoUrl = "";
      }),
    );
  };

  return (
    <section className={teamPanelClassName}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="mt-1 text-lg font-bender-bold" style={{ color: accent }}>
            {label}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor={`${side}-team-name`} className={dashboardFieldLabelClassName}>
            Team Name
          </label>
          <input
            id={`${side}-team-name`}
            type="text"
            className={dashboardInputClassName}
            value={teamSettings.name}
            onChange={(e) => changeTeamName(e.target.value)}
            placeholder={side === "left" ? "Blue Phoenix" : "Red Horizon"}
          />
        </div>

        <div>
          <label className={dashboardFieldLabelClassName}>Model</label>
          <div className="mb-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              className={cn(
                "rounded-xl border px-3 py-2 text-[13px] font-bender-bold uppercase tracking-[0.08em] transition",
                teamSettings.model.trim().toLowerCase() === "blue"
                  ? "border-[#5bc0eb] bg-[#3a7bd5] text-white"
                  : "border-[#3a3f4b] bg-[#181c24] text-[#b6c2e2] hover:border-[#3a7bd5] hover:text-white",
              )}
              onClick={() => changeTeamModel("blue")}
            >
              Blue
            </button>
            <button
              type="button"
              className={cn(
                "rounded-xl border px-3 py-2 text-[13px] font-bender-bold uppercase tracking-[0.08em] transition",
                teamSettings.model.trim().toLowerCase() === "red"
                  ? "border-[#ff595e] bg-[#ff595e] text-white"
                  : "border-[#3a3f4b] bg-[#181c24] text-[#b6c2e2] hover:border-[#ff595e] hover:text-white",
              )}
              onClick={() => changeTeamModel("red")}
            >
              Red
            </button>
            <button
              type="button"
              className={cn(
                "rounded-xl border px-3 py-2 text-[13px] font-bender-bold uppercase tracking-[0.08em] transition",
                !modelIsPreset
                  ? "border-[#ffd166] bg-[#ffd166] text-[#23293a]"
                  : "border-[#3a3f4b] bg-[#181c24] text-[#b6c2e2] hover:border-[#ffd166] hover:text-white",
              )}
              onClick={() =>
                changeTeamModel(
                  modelIsPreset ? "" : teamSettings.model,
                )
              }
            >
              Other
            </button>
          </div>
          {!modelIsPreset && (
            <input
              type="text"
              className={dashboardInputClassName}
              value={teamSettings.model}
              onChange={(e) => changeTeamModel(e.target.value)}
              placeholder="Zombie"
            />
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className={dashboardFieldLabelClassName}>Logo</label>
            <span className="text-[11px] text-[#b6c2e2]">
              Square image, max 256x256px
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#3a3f4b] bg-[#181c24]">
              {teamLogoUrl ? (
                <img
                  src={teamLogoUrl}
                  alt={`${label} logo preview`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-center text-[11px] font-bender-bold uppercase tracking-[0.12em] text-[#7481a1]">
                  No Logo
                </span>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <input
                id={`${side}-team-logo`}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <label
                htmlFor={`${side}-team-logo`}
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#3a7bd5] px-4 py-3 text-center text-[13px] font-bender-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#2851a3]"
              >
                Upload Logo
              </label>
              {teamLogoUrl && (
                <button
                  type="button"
                  onClick={removeLogo}
                  className="inline-flex w-fit items-center justify-center rounded-xl bg-[#d32f2f] px-3 py-2 text-[12px] font-bender-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#b72828]"
                >
                  Delete Logo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
