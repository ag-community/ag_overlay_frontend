import { produce } from "immer";
import { screenNames, type ScreenName } from "~/schemas/screens";
import { useAGOverlay } from "~/state/ag_overlay";
import { useSettings } from "~/state/dashboard";
import { useState, type JSX } from "react";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import "./dashboard.css";
import { ALPHA2_COUNTRY_LIST, getFlagUrl } from "~/utils/countries";
import Card from "./components/Card";
import {
  CaretDownIcon,
  FlagPennantIcon,
  HourglassIcon,
  ListIcon,
  MapPinIcon,
  SwordIcon,
  TrophyIcon,
} from "@phosphor-icons/react";
import { cn } from "~/dashboard/utils/ui";

const sidebarItems = [
  { label: "Dashboard", anchor: "dashboard" },
  { label: "Settings", anchor: "settings" },
];

const teamModelPresets = ["blue", "red"] as const;

const dashboardFieldLabelClassName =
  "mb-2 block text-[13px] font-bender-bold uppercase tracking-[0.08em] text-[#ffd166]";

const dashboardInputClassName =
  "w-full rounded-xl border border-[#3a3f4b] bg-[#181c24] px-4 py-3 text-[15px] text-white outline-none transition placeholder:text-[#7481a1] focus:border-[#3a7bd5] focus:ring-2 focus:ring-[#3a7bd5]/25";

const teamPanelClassName =
  "rounded-2xl border border-[#3a3f4b] bg-[#181c24]/45 p-4 md:p-5";

function isPresetTeamModel(model: string) {
  return teamModelPresets.includes(
    model.trim().toLowerCase() as (typeof teamModelPresets)[number],
  );
}

export function Dashboard() {
  const AGOverlayData = useAGOverlay();
  const [settings, setSettings] = useSettings();

  const [selectedSection, setSelectedSection] = useState(
    sidebarItems[0]?.anchor ?? "",
  );

  const setSelectedScreen = (screen: ScreenName) =>
    setSettings(
      produce((settings) => {
        settings.activeScreen = screen;
        settings.previousScreen = settings.activeScreen;
      }),
    );

  const changeBestOf = (delta: number) => {
    setSettings(
      produce((settings) => {
        const next = settings.bestOfPoints + delta;
        if (next >= 1 && next <= 15) {
          settings.bestOfPoints = next;
          const maxPoints = Math.ceil(next / 2);
          if (settings.leftTeamSettings.points > maxPoints)
            settings.leftTeamSettings.points = maxPoints;
          if (settings.rightTeamSettings.points > maxPoints)
            settings.rightTeamSettings.points = maxPoints;
        }
      }),
    );
  };

  const changeLeftPoints = (delta: number) => {
    setSettings(
      produce((settings) => {
        const next = settings.leftTeamSettings.points + delta;
        if (next >= 0 && next <= Math.ceil(settings.bestOfPoints / 2))
          settings.leftTeamSettings.points = next;
      }),
    );
  };

  const changeRightPoints = (delta: number) => {
    setSettings(
      produce((settings) => {
        const next = settings.rightTeamSettings.points + delta;
        if (next >= 0 && next <= Math.ceil(settings.bestOfPoints / 2))
          settings.rightTeamSettings.points = next;
      }),
    );
  };

  const changeRound = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(
      produce((settings) => {
        settings.round = e.target.value;
      }),
    );
  };

  const changeTournamentName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(
      produce((settings) => {
        settings.tournamentName = e.target.value;
      }),
    );
  };

  const handleBackgroundUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload-background", {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as { url: string };
    setSettings(
      produce((settings) => {
        settings.backgroundUrl = data.url;
      }),
    );
  };

  const removeBackground = () => {
    setSettings(
      produce((settings) => {
        settings.backgroundUrl = "";
      }),
    );
  };

  const changeBackgroundColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(
      produce((settings) => {
        settings.backgroundColor = e.target.value;
      }),
    );
  };

  const changeBackgroundOpacity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(
      produce((settings) => {
        settings.backgroundOpacity = Number(e.target.value);
      }),
    );
  };

  const changeBackgroundBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(
      produce((settings) => {
        settings.backgroundBlur = Number(e.target.value);
      }),
    );
  };

  const handleLogoUpload = async (
    side: "left" | "right",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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

  const removeLogo = (side: "left" | "right") => {
    setSettings(
      produce((settings) => {
        if (side === "left") settings.leftTeamLogoUrl = "";
        else settings.rightTeamLogoUrl = "";
      }),
    );
  };

  const changeTeamModel = (side: "left" | "right", value: string) => {
    setSettings(
      produce((settings) => {
        if (side === "left") settings.leftTeamSettings.model = value;
        else settings.rightTeamSettings.model = value;
      }),
    );
  };

  const changeTeamName = (side: "left" | "right", value: string) => {
    setSettings(
      produce((settings) => {
        if (side === "left") settings.leftTeamSettings.name = value;
        else settings.rightTeamSettings.name = value;
      }),
    );
  };

  const changeWebsocketURL = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(
      produce((settings) => {
        settings.websocketURL = e.target.value;
      }),
    );
  };

  const [newLeftPlayer, setNewLeftPlayer] = useState({
    steamID: "",
    flagCode: "",
    playerName: "",
  });
  const [newRightPlayer, setNewRightPlayer] = useState({
    steamID: "",
    flagCode: "",
    playerName: "",
  });

  const leftModelIsPreset = isPresetTeamModel(settings.leftTeamSettings.model);
  const rightModelIsPreset = isPresetTeamModel(
    settings.rightTeamSettings.model,
  );
  const hasBackgroundMedia = settings.backgroundUrl.trim().length > 0;
  const backgroundIsVideo = /\.(webm|mp4)(\?|$)/i.test(settings.backgroundUrl);

  const addLeftPlayer = () => {
    if (
      newLeftPlayer.steamID.trim() === "" ||
      newLeftPlayer.playerName.trim() === ""
    )
      return;
    setSettings(
      produce((settings) => {
        settings.leftTeamSettings.players.push({
          steamID: newLeftPlayer.steamID,
          flagCode: newLeftPlayer.flagCode || undefined,
          playerName: newLeftPlayer.playerName,
        });
      }),
    );
    setNewLeftPlayer({ steamID: "", flagCode: "", playerName: "" });
  };

  const addRightPlayer = () => {
    if (
      newRightPlayer.steamID.trim() === "" ||
      newRightPlayer.playerName.trim() === ""
    )
      return;
    setSettings(
      produce((settings) => {
        settings.rightTeamSettings.players.push({
          steamID: newRightPlayer.steamID,
          flagCode: newRightPlayer.flagCode || undefined,
          playerName: newRightPlayer.playerName,
        });
      }),
    );
    setNewRightPlayer({ steamID: "", flagCode: "", playerName: "" });
  };

  const removePlayer = (side: "left" | "right", steamID: string) => {
    setSettings(
      produce((settings) => {
        if (side === "left") {
          settings.leftTeamSettings.players =
            settings.leftTeamSettings.players.filter(
              (p) => p.steamID !== steamID,
            );
        } else {
          settings.rightTeamSettings.players =
            settings.rightTeamSettings.players.filter(
              (p) => p.steamID !== steamID,
            );
        }
      }),
    );
  };

  return (
    <div className="dashboard-root">
      <aside className="dashboard-sidebar">
        {sidebarItems.map((item) => (
          <button
            key={item.anchor}
            className={`sidebar-btn${selectedSection === item.anchor ? " active" : ""}`}
            onClick={() => setSelectedSection(item.anchor)}
          >
            {item.label}
          </button>
        ))}
      </aside>
      <main className="dashboard-main">
        {selectedSection === "dashboard" && (
          <>
            <Card title="Scene Switcher">
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="md:hidden">
                  <div className="relative">
                    <select
                      value={settings.activeScreen}
                      onChange={(e) =>
                        setSelectedScreen(e.target.value as ScreenName)
                      }
                      className="w-full appearance-none rounded-xl border border-[#3a7bd5]/45 bg-[#181c24] px-4 py-3 pr-12 text-[14px] font-bender-bold uppercase tracking-[0.06em] text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] outline-none transition focus:border-[#ffd166] focus:ring-2 focus:ring-[#3a7bd5]/35 cursor-pointer"
                    >
                      {screenNames.map((scene) => (
                        <option key={scene} value={scene}>
                          {scene}
                        </option>
                      ))}
                    </select>
                    <CaretDownIcon
                      size={20}
                      weight="bold"
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#ffd166]"
                    />
                  </div>
                </div>

                <div className="hidden flex-wrap gap-2 md:flex">
                  {screenNames.map((scene) => (
                    <button
                      key={scene}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg bg-[#3a7bd5] px-4 py-2 text-[13px] uppercase text-white transition-all hover:bg-[#2a6bc5] hover:text-gray-200",
                        "font-bender-bold shadow-[0_8px_18px_rgba(42,107,197,0.18)] cursor-pointer",
                        settings.activeScreen === scene &&
                          "bg-[#ffd166] text-[#23293a] shadow-[0_8px_18px_rgba(255,209,102,0.2)] hover:bg-[#ffd166] hover:text-[#23293a]",
                      )}
                      onClick={() => setSelectedScreen(scene)}
                    >
                      {scene === "start" && (
                        <FlagPennantIcon size={18} weight="bold" />
                      )}
                      {scene === "standby" && (
                        <HourglassIcon size={18} weight="bold" />
                      )}
                      {scene === "versus" && (
                        <SwordIcon size={18} weight="bold" />
                      )}
                      {scene === "mappool" && (
                        <ListIcon size={18} weight="bold" />
                      )}
                      {scene === "winner" && (
                        <TrophyIcon size={18} weight="bold" />
                      )}
                      {scene}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Tournament Settings">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="tournament-name"
                    className={dashboardFieldLabelClassName}
                  >
                    Tournament Name
                  </label>
                  <input
                    id="tournament-name"
                    type="text"
                    className={dashboardInputClassName}
                    value={settings.tournamentName}
                    onChange={changeTournamentName}
                    placeholder="Adrenaline Gamer Open"
                  />
                </div>
                <div>
                  <label
                    htmlFor="round-name"
                    className={dashboardFieldLabelClassName}
                  >
                    Round Name
                  </label>
                  <input
                    id="round-name"
                    type="text"
                    className={dashboardInputClassName}
                    value={settings.round}
                    onChange={changeRound}
                    placeholder="Semifinal"
                  />
                </div>
              </div>
            </Card>

            <Card title="Teams">
              <p className="text-[13px] text-[#b6c2e2] md:text-sm">
                Configure both sides and upload square team logos.
              </p>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <section className={teamPanelClassName}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="mt-1 text-lg font-bender-bold text-[#5bc0eb]">
                        Team A
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="left-team-name"
                        className={dashboardFieldLabelClassName}
                      >
                        Team Name
                      </label>
                      <input
                        id="left-team-name"
                        type="text"
                        className={dashboardInputClassName}
                        value={settings.leftTeamSettings.name}
                        onChange={(e) => changeTeamName("left", e.target.value)}
                        placeholder="Blue Phoenix"
                      />
                    </div>

                    <div>
                      <label className={dashboardFieldLabelClassName}>
                        Model
                      </label>
                      <div className="mb-3 grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          className={cn(
                            "rounded-xl border px-3 py-2 text-[13px] font-bender-bold uppercase tracking-[0.08em] transition",
                            settings.leftTeamSettings.model
                              .trim()
                              .toLowerCase() === "blue"
                              ? "border-[#5bc0eb] bg-[#3a7bd5] text-white"
                              : "border-[#3a3f4b] bg-[#181c24] text-[#b6c2e2] hover:border-[#3a7bd5] hover:text-white",
                          )}
                          onClick={() => changeTeamModel("left", "blue")}
                        >
                          Blue
                        </button>
                        <button
                          type="button"
                          className={cn(
                            "rounded-xl border px-3 py-2 text-[13px] font-bender-bold uppercase tracking-[0.08em] transition",
                            settings.leftTeamSettings.model
                              .trim()
                              .toLowerCase() === "red"
                              ? "border-[#ff595e] bg-[#ff595e] text-white"
                              : "border-[#3a3f4b] bg-[#181c24] text-[#b6c2e2] hover:border-[#ff595e] hover:text-white",
                          )}
                          onClick={() => changeTeamModel("left", "red")}
                        >
                          Red
                        </button>
                        <button
                          type="button"
                          className={cn(
                            "rounded-xl border px-3 py-2 text-[13px] font-bender-bold uppercase tracking-[0.08em] transition",
                            !leftModelIsPreset
                              ? "border-[#ffd166] bg-[#ffd166] text-[#23293a]"
                              : "border-[#3a3f4b] bg-[#181c24] text-[#b6c2e2] hover:border-[#ffd166] hover:text-white",
                          )}
                          onClick={() =>
                            changeTeamModel(
                              "left",
                              leftModelIsPreset
                                ? ""
                                : settings.leftTeamSettings.model,
                            )
                          }
                        >
                          Other
                        </button>
                      </div>
                      {!leftModelIsPreset && (
                        <input
                          type="text"
                          className={dashboardInputClassName}
                          value={settings.leftTeamSettings.model}
                          onChange={(e) =>
                            changeTeamModel("left", e.target.value)
                          }
                          placeholder="Zombie"
                        />
                      )}
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <label className={dashboardFieldLabelClassName}>
                          Logo
                        </label>
                        <span className="text-[11px] text-[#b6c2e2]">
                          Square image, max 256x256px
                        </span>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#3a3f4b] bg-[#181c24]">
                          {settings.leftTeamLogoUrl ? (
                            <img
                              src={settings.leftTeamLogoUrl}
                              alt="Team A logo preview"
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
                            id="left-team-logo"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleLogoUpload("left", e)}
                            className="hidden"
                          />
                          <label
                            htmlFor="left-team-logo"
                            className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#3a7bd5] px-4 py-3 text-center text-[13px] font-bender-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#2851a3]"
                          >
                            Upload Logo
                          </label>
                          {settings.leftTeamLogoUrl && (
                            <button
                              type="button"
                              onClick={() => removeLogo("left")}
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

                <section className={teamPanelClassName}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="mt-1 text-lg font-bender-bold text-[#ff595e]">
                        Team B
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="right-team-name"
                        className={dashboardFieldLabelClassName}
                      >
                        Team Name
                      </label>
                      <input
                        id="right-team-name"
                        type="text"
                        className={dashboardInputClassName}
                        value={settings.rightTeamSettings.name}
                        onChange={(e) =>
                          changeTeamName("right", e.target.value)
                        }
                        placeholder="Red Horizon"
                      />
                    </div>

                    <div>
                      <label className={dashboardFieldLabelClassName}>
                        Model
                      </label>
                      <div className="mb-3 grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          className={cn(
                            "rounded-xl border px-3 py-2 text-[13px] font-bender-bold uppercase tracking-[0.08em] transition",
                            settings.rightTeamSettings.model
                              .trim()
                              .toLowerCase() === "blue"
                              ? "border-[#5bc0eb] bg-[#3a7bd5] text-white"
                              : "border-[#3a3f4b] bg-[#181c24] text-[#b6c2e2] hover:border-[#3a7bd5] hover:text-white",
                          )}
                          onClick={() => changeTeamModel("right", "blue")}
                        >
                          Blue
                        </button>
                        <button
                          type="button"
                          className={cn(
                            "rounded-xl border px-3 py-2 text-[13px] font-bender-bold uppercase tracking-[0.08em] transition",
                            settings.rightTeamSettings.model
                              .trim()
                              .toLowerCase() === "red"
                              ? "border-[#ff595e] bg-[#ff595e] text-white"
                              : "border-[#3a3f4b] bg-[#181c24] text-[#b6c2e2] hover:border-[#ff595e] hover:text-white",
                          )}
                          onClick={() => changeTeamModel("right", "red")}
                        >
                          Red
                        </button>
                        <button
                          type="button"
                          className={cn(
                            "rounded-xl border px-3 py-2 text-[13px] font-bender-bold uppercase tracking-[0.08em] transition",
                            !rightModelIsPreset
                              ? "border-[#ffd166] bg-[#ffd166] text-[#23293a]"
                              : "border-[#3a3f4b] bg-[#181c24] text-[#b6c2e2] hover:border-[#ffd166] hover:text-white",
                          )}
                          onClick={() =>
                            changeTeamModel(
                              "right",
                              rightModelIsPreset
                                ? ""
                                : settings.rightTeamSettings.model,
                            )
                          }
                        >
                          Other
                        </button>
                      </div>
                      {!rightModelIsPreset && (
                        <input
                          type="text"
                          className={dashboardInputClassName}
                          value={settings.rightTeamSettings.model}
                          onChange={(e) =>
                            changeTeamModel("right", e.target.value)
                          }
                          placeholder="Helmet"
                        />
                      )}
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <label className={dashboardFieldLabelClassName}>
                          Logo
                        </label>
                        <span className="text-[11px] text-[#b6c2e2]">
                          Square image, max 256x256px
                        </span>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#3a3f4b] bg-[#181c24]">
                          {settings.rightTeamLogoUrl ? (
                            <img
                              src={settings.rightTeamLogoUrl}
                              alt="Team B logo preview"
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
                            id="right-team-logo"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleLogoUpload("right", e)}
                            className="hidden"
                          />
                          <label
                            htmlFor="right-team-logo"
                            className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#3a7bd5] px-4 py-3 text-center text-[13px] font-bender-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#2851a3]"
                          >
                            Upload Logo
                          </label>
                          {settings.rightTeamLogoUrl && (
                            <button
                              type="button"
                              onClick={() => removeLogo("right")}
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
              </div>
            </Card>

            <Card title="Scoring">
              <div className="flex flex-col gap-3">
                <p className="text-[13px] text-[#b6c2e2] md:text-sm">
                  Manage the series length and update each team score live.
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <section className="mx-auto flex w-full max-w-72 flex-col items-center rounded-2xl border border-[#3a3f4b] bg-[#181c24]/45 p-4 text-center md:mx-0 md:max-w-none">
                    <div className="mb-1 text-[11px] font-bender-bold uppercase tracking-[0.18em] text-[#b6c2e2]">
                      Series
                    </div>
                    <div className="mb-4 text-lg font-bender-bold text-[#ffd166]">
                      Best Of
                    </div>
                    <div className="flex items-center justify-center gap-5">
                      <button
                        type="button"
                        onClick={() => changeBestOf(-1)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#3a7bd5] text-xl font-bender-bold text-white transition hover:bg-[#2851a3]"
                      >
                        -
                      </button>
                      <div className="min-w-10 text-center text-[28px] font-bender-bold text-white">
                        {settings.bestOfPoints}
                      </div>
                      <button
                        type="button"
                        onClick={() => changeBestOf(1)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#3a7bd5] text-xl font-bender-bold text-white transition hover:bg-[#2851a3]"
                      >
                        +
                      </button>
                    </div>
                    <div className="mt-4 text-[11px] leading-4 text-[#b6c2e2]">
                      First to {Math.ceil(settings.bestOfPoints / 2)} map wins
                    </div>
                  </section>

                  <section className="mx-auto flex w-full max-w-72 flex-col items-center rounded-2xl border border-[#3a3f4b] bg-[#181c24]/45 p-4 text-center md:mx-0 md:max-w-none">
                    <div className="mb-1 text-[11px] font-bender-bold uppercase tracking-[0.18em] text-[#b6c2e2]">
                      Team A
                    </div>
                    <div className="mb-4 text-lg font-bender-bold text-[#5bc0eb]">
                      {settings.leftTeamSettings.name}
                    </div>
                    <div className="flex items-center justify-center gap-5">
                      <button
                        type="button"
                        onClick={() => changeLeftPoints(-1)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#3a7bd5] text-xl font-bender-bold text-white transition hover:bg-[#2851a3]"
                      >
                        -
                      </button>
                      <div className="min-w-10 text-center text-[28px] font-bender-bold text-white">
                        {settings.leftTeamSettings.points}
                      </div>
                      <button
                        type="button"
                        onClick={() => changeLeftPoints(1)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#3a7bd5] text-xl font-bender-bold text-white transition hover:bg-[#2851a3]"
                      >
                        +
                      </button>
                    </div>
                    <div className="mt-4 text-[11px] leading-4 text-[#b6c2e2]">
                      Max {Math.ceil(settings.bestOfPoints / 2)} points
                    </div>
                  </section>

                  <section className="mx-auto flex w-full max-w-72 flex-col items-center rounded-2xl border border-[#3a3f4b] bg-[#181c24]/45 p-4 text-center md:mx-0 md:max-w-none">
                    <div className="mb-1 text-[11px] font-bender-bold uppercase tracking-[0.18em] text-[#b6c2e2]">
                      Team B
                    </div>
                    <div className="mb-4 text-lg font-bender-bold text-[#ff595e]">
                      {settings.rightTeamSettings.name}
                    </div>
                    <div className="flex items-center justify-center gap-5">
                      <button
                        type="button"
                        onClick={() => changeRightPoints(-1)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#3a7bd5] text-xl font-bender-bold text-white transition hover:bg-[#2851a3]"
                      >
                        -
                      </button>
                      <div className="min-w-10 text-center text-[28px] font-bender-bold text-white">
                        {settings.rightTeamSettings.points}
                      </div>
                      <button
                        type="button"
                        onClick={() => changeRightPoints(1)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#3a7bd5] text-xl font-bender-bold text-white transition hover:bg-[#2851a3]"
                      >
                        +
                      </button>
                    </div>
                    <div className="mt-4 text-[11px] leading-4 text-[#b6c2e2]">
                      Max {Math.ceil(settings.bestOfPoints / 2)} points
                    </div>
                  </section>
                </div>
              </div>
            </Card>

            <Card title="Background">
              <div className="flex flex-col gap-4">
                <p className="text-sm leading-6 text-[#b6c2e2] md:text-[15px]">
                  Use a solid color by itself, or upload an image or video to
                  unlock blur and opacity controls.
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(290px,0.9fr)]">
                  <section className="rounded-2xl border border-[#3a3f4b] bg-[#181c24]/45 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[12px] font-bender-bold uppercase tracking-[0.18em] text-[#b6c2e2]">
                          Preview
                        </div>
                        <div className="mt-1 text-xl font-bender-bold text-white md:text-[32px]">
                          Background Output
                        </div>
                      </div>
                      <div
                        className={cn(
                          "rounded-full border text-center px-3 py-1 text-[12px] font-bender-bold uppercase tracking-[0.14em]",
                          hasBackgroundMedia
                            ? "border-[#3a7bd5]/35 bg-[#3a7bd5]/12 text-[#ffd166]"
                            : "border-[#ffd166]/35 bg-[#ffd166]/12 text-[#ffd166]",
                        )}
                      >
                        {hasBackgroundMedia ? "Media Active" : "Color Only"}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-[#3a3f4b] bg-[#181c24] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                      <div
                        className="relative aspect-video w-full overflow-hidden"
                        style={{
                          backgroundColor: hasBackgroundMedia
                            ? undefined
                            : settings.backgroundColor,
                        }}
                      >
                        {hasBackgroundMedia && (
                          <div
                            className="absolute inset-0"
                            style={{
                              opacity: settings.backgroundOpacity / 100,
                              filter: `blur(${settings.backgroundBlur}px)`,
                            }}
                          >
                            {backgroundIsVideo ? (
                              <video
                                src={settings.backgroundUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <img
                                src={settings.backgroundUrl}
                                alt="Background preview"
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 text-[12px] leading-5 text-[#b6c2e2] md:text-[13px]">
                      For best quality, upload media at the same resolution as
                      your stream output.
                    </div>
                  </section>

                  <section className="rounded-2xl border border-[#3a3f4b] bg-[#181c24]/45 p-4">
                    <div className="space-y-4">
                      <div>
                        <label className={dashboardFieldLabelClassName}>
                          Color
                        </label>
                        <div
                          className={cn(
                            "flex items-center gap-3 rounded-2xl border p-3 transition",
                            hasBackgroundMedia
                              ? "border-[#303647] bg-[#181c24]/60 opacity-45"
                              : "border-[#3a3f4b] bg-[#181c24]",
                          )}
                        >
                          <input
                            type="color"
                            value={settings.backgroundColor}
                            onChange={changeBackgroundColor}
                            disabled={hasBackgroundMedia}
                            className={cn(
                              "h-11 w-11 rounded-lg border-0 bg-transparent p-0",
                              hasBackgroundMedia
                                ? "cursor-not-allowed"
                                : "cursor-pointer",
                            )}
                          />
                          <div className="min-w-0">
                            <div className="text-[12px] font-bender-bold uppercase tracking-[0.16em] text-[#b6c2e2]">
                              Fill Color
                            </div>
                            <div className="mt-1 font-mono text-[14px] text-white">
                              {settings.backgroundColor}
                            </div>
                            <div className="mt-1 text-[12px] leading-4 text-[#b6c2e2]">
                              {hasBackgroundMedia
                                ? "Disabled while media is active."
                                : "Used only when no media is uploaded."}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label className={dashboardFieldLabelClassName}>
                            Media
                          </label>
                          <span className="text-[12px] text-[#b6c2e2]">
                            Image or video
                          </span>
                        </div>

                        <div className="rounded-2xl border border-[#3a3f4b] bg-[#202635] p-3">
                          <input
                            id="background-media"
                            type="file"
                            accept="image/*,video/webm,video/mp4"
                            onChange={handleBackgroundUpload}
                            className="hidden"
                          />
                          <div className="flex flex-col gap-3">
                            <p className="text-[13px] leading-6 text-[#b6c2e2]">
                              Upload an image or looping video. It will use the
                              same full-screen crop behavior as the live
                              overlay.
                            </p>
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <label
                                htmlFor="background-media"
                                className="inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center rounded-xl bg-[#3a7bd5] px-4 py-2.5 text-center text-[13px] font-bender-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#2851a3]"
                              >
                                Upload Media
                              </label>
                              <button
                                type="button"
                                onClick={removeBackground}
                                disabled={!hasBackgroundMedia}
                                className={cn(
                                  "inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2.5 text-center text-[13px] font-bender-bold uppercase tracking-[0.08em] transition",
                                  hasBackgroundMedia
                                    ? "bg-[#d32f2f] text-white hover:bg-[#b72828]"
                                    : "cursor-default bg-[#2a3143] text-[#68748f]",
                                )}
                              >
                                Remove Media
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div
                          className={cn(
                            "rounded-2xl border p-3 transition",
                            hasBackgroundMedia
                              ? "border-[#3a3f4b] bg-[#181c24]"
                              : "border-[#303647] bg-[#181c24]/50 opacity-50",
                          )}
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <label className="text-[14px] font-bender-bold uppercase tracking-[0.08em] text-[#ffd166]">
                              Opacity
                            </label>
                            <span className="text-[13px] text-white">
                              {settings.backgroundOpacity}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={settings.backgroundOpacity}
                            onChange={changeBackgroundOpacity}
                            disabled={!hasBackgroundMedia}
                            className="w-full accent-[#3a7bd5]"
                          />
                        </div>

                        <div
                          className={cn(
                            "rounded-2xl border p-3 transition",
                            hasBackgroundMedia
                              ? "border-[#3a3f4b] bg-[#181c24]"
                              : "border-[#303647] bg-[#181c24]/50 opacity-50",
                          )}
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <label className="text-[14px] font-bender-bold uppercase tracking-[0.08em] text-[#ffd166]">
                              Blur
                            </label>
                            <span className="text-[13px] text-white">
                              {settings.backgroundBlur}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={50}
                            value={settings.backgroundBlur}
                            onChange={changeBackgroundBlur}
                            disabled={!hasBackgroundMedia}
                            className="w-full accent-[#3a7bd5]"
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </Card>

            <Card title="Server Selector">
              <div className="dashboard-card-content flex-wrap">
                <SimpleBar style={{ maxHeight: 240, width: "100%" }}>
                  {AGOverlayData.map((server) => (
                    <button
                      key={server.server_ip}
                      className={`dashboard-action-btn ${settings.selectedServer === server.server_ip ? "active" : ""}`}
                      onClick={() =>
                        setSettings(
                          produce((settings) => {
                            settings.selectedServer = server.server_ip;
                          }),
                        )
                      }
                    >
                      {server.data.hostname} ({server.data.map}) -{" "}
                      {server.data.players.length} players
                    </button>
                  ))}
                </SimpleBar>
              </div>
            </Card>

            <Card title="Players">
              {/* <div className="dashboard-card-content flex-wrap players-section">
                <div className="team-players">
                  <div className="dashboard-label" style={{ color: "#5bc0eb" }}>
                    Left Side
                  </div>
                  <div className="add-player-row">
                    <input
                      type="text"
                      className="dashboard-input"
                      placeholder="SteamID"
                      value={newLeftPlayer.steamID}
                      onChange={(e) =>
                        setNewLeftPlayer({
                          ...newLeftPlayer,
                          steamID: e.target.value,
                        })
                      }
                    />
                    <select
                      className="dashboard-input"
                      value={newLeftPlayer.flagCode}
                      onChange={(e) =>
                        setNewLeftPlayer({
                          ...newLeftPlayer,
                          flagCode: e.target.value,
                        })
                      }
                    >
                      <option value="">No flag</option>
                      {Object.entries(ALPHA2_COUNTRY_LIST).map(
                        ([code, name]) => (
                          <option key={code} value={code}>
                            {name}
                          </option>
                        ),
                      )}
                    </select>
                    <input
                      type="text"
                      className="dashboard-input"
                      placeholder="Player Name"
                      value={newLeftPlayer.playerName}
                      onChange={(e) =>
                        setNewLeftPlayer({
                          ...newLeftPlayer,
                          playerName: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addLeftPlayer();
                      }}
                    />
                    <button
                      className="dashboard-action-btn small"
                      onClick={addLeftPlayer}
                    >
                      Add
                    </button>
                  </div>
                  <ul className="players-list">
                    {settings.leftTeamSettings.players.map((p) => (
                      <li key={p.steamID} className="player-item">
                        <div className="player-info">
                          {p.flagCode && (
                            <img
                              src={getFlagUrl(p.flagCode)}
                              className="player-flag"
                              width={22}
                              height={16}
                              alt={p.flagCode}
                            />
                          )}
                          <span>
                            {p.playerName}{" "}
                            {p.flagCode
                              ? `(${ALPHA2_COUNTRY_LIST[p.flagCode]})`
                              : ""}{" "}
                            [{p.steamID}]
                          </span>
                        </div>
                        <button
                          className="dashboard-action-btn small remove-btn"
                          onClick={() => removePlayer("left", p.steamID)}
                          title="Remove"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="team-players">
                  <div className="dashboard-label" style={{ color: "#ff595e" }}>
                    Right Side
                  </div>
                  <div className="add-player-row">
                    <input
                      type="text"
                      className="dashboard-input"
                      placeholder="SteamID"
                      value={newRightPlayer.steamID}
                      onChange={(e) =>
                        setNewRightPlayer({
                          ...newRightPlayer,
                          steamID: e.target.value,
                        })
                      }
                    />
                    <select
                      className="dashboard-input"
                      value={newRightPlayer.flagCode}
                      onChange={(e) =>
                        setNewRightPlayer({
                          ...newRightPlayer,
                          flagCode: e.target.value,
                        })
                      }
                    >
                      <option value="">No flag</option>
                      {Object.entries(ALPHA2_COUNTRY_LIST).map(
                        ([code, name]) => (
                          <option key={code} value={code}>
                            {name}
                          </option>
                        ),
                      )}
                    </select>
                    <input
                      type="text"
                      className="dashboard-input"
                      placeholder="Player Name"
                      value={newRightPlayer.playerName}
                      onChange={(e) =>
                        setNewRightPlayer({
                          ...newRightPlayer,
                          playerName: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addRightPlayer();
                      }}
                    />
                    <button
                      className="dashboard-action-btn small"
                      onClick={addRightPlayer}
                    >
                      Add
                    </button>
                  </div>
                  <ul className="players-list">
                    {settings.rightTeamSettings.players.map((p) => (
                      <li key={p.steamID} className="player-item">
                        {p.flagCode && (
                          <img
                            src={getFlagUrl(p.flagCode)}
                            className="player-flag"
                            width={22}
                            height={16}
                          />
                        )}
                        <span>
                          {p.playerName}{" "}
                          {p.flagCode
                            ? `(${ALPHA2_COUNTRY_LIST[p.flagCode]})`
                            : ""}{" "}
                          [{p.steamID}]
                        </span>
                        <button
                          className="dashboard-action-btn small remove-btn"
                          onClick={() => removePlayer("right", p.steamID)}
                          title="Remove"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div> */}
            </Card>
          </>
        )}

        {selectedSection === "settings" && (
          <Card title="Connection Settings">
            {/* <div className="dashboard-card-content">
              <div>
                <div className="dashboard-label">WebSocket URL</div>
                <input
                  type="text"
                  className="dashboard-input"
                  value={settings.websocketURL}
                  onChange={changeWebsocketURL}
                />
              </div>
            </div> */}
          </Card>
        )}
      </main>
    </div>
  );
}
