import { produce } from "immer";
import { screenNames, type ScreenName } from "~/schemas/screens";
import type { Player, PlayerSource } from "~/schemas/settings";
import { useAGOverlay } from "~/state/ag_overlay";
import { useSettings } from "~/state/dashboard";
import { useState } from "react";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import "./dashboard.css";
import { ALPHA2_COUNTRY_LIST, getFlagUrl } from "~/utils/countries";
import Card from "./components/Card";
import steamUserAvatar from "./assets/steam_user.png";
import {
  BankIcon,
  CaretDownIcon,
  FlagPennantIcon,
  HourglassIcon,
  ListIcon,
  SwordIcon,
  TrophyIcon,
  UserIcon,
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

type TeamSide = "left" | "right";

type PlayerDraft = {
  mode: PlayerSource;
  steamInput: string;
  steamID: string;
  flagCode: string;
  playerName: string;
  avatarUrl: string;
  resolving: boolean;
  error: string;
};

function createPlayerDraft(mode: PlayerSource = "steam"): PlayerDraft {
  return {
    mode,
    steamInput: mode === "no_steam" ? "NO_STEAM" : "",
    steamID: mode === "no_steam" ? "NO_STEAM" : "",
    flagCode: "",
    playerName: "",
    avatarUrl: mode === "no_steam" ? steamUserAvatar : "",
    resolving: false,
    error: "",
  };
}

function isPresetTeamModel(model: string) {
  return teamModelPresets.includes(
    model.trim().toLowerCase() as (typeof teamModelPresets)[number],
  );
}

function getStoredPlayerAvatar(player: Player) {
  if (player.source === "no_steam") {
    return steamUserAvatar;
  }

  return player.avatarUrl || steamUserAvatar;
}

export function Dashboard() {
  const AGOverlayData = useAGOverlay();
  const [settings, setSettings] = useSettings();

  const [selectedSection, setSelectedSection] = useState(
    sidebarItems[0]?.anchor ?? "",
  );
  const [selectedPlayerTeamTab, setSelectedPlayerTeamTab] =
    useState<TeamSide>("left");

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

  const [newLeftPlayer, setNewLeftPlayer] = useState<PlayerDraft>(() =>
    createPlayerDraft(),
  );
  const [newRightPlayer, setNewRightPlayer] = useState<PlayerDraft>(() =>
    createPlayerDraft(),
  );

  const leftModelIsPreset = isPresetTeamModel(settings.leftTeamSettings.model);
  const rightModelIsPreset = isPresetTeamModel(
    settings.rightTeamSettings.model,
  );
  const hasBackgroundMedia = settings.backgroundUrl.trim().length > 0;
  const backgroundIsVideo = /\.(webm|mp4)(\?|$)/i.test(settings.backgroundUrl);

  const setPlayerDraft = (
    side: TeamSide,
    update: PlayerDraft | ((current: PlayerDraft) => PlayerDraft),
  ) => {
    const setter = side === "left" ? setNewLeftPlayer : setNewRightPlayer;
    setter((current) =>
      typeof update === "function" ? update(current) : update,
    );
  };

  const getPlayerDraft = (side: TeamSide) =>
    side === "left" ? newLeftPlayer : newRightPlayer;

  const setPlayerMode = (side: TeamSide, mode: PlayerSource) => {
    setPlayerDraft(side, createPlayerDraft(mode));
  };

  const resolveSteamPlayer = async (side: TeamSide) => {
    const draft = getPlayerDraft(side);
    const query = draft.steamInput.trim();

    if (!query) {
      setPlayerDraft(side, (current) => ({
        ...current,
        error: "Paste a Steam profile or ID first.",
      }));
      return;
    }

    setPlayerDraft(side, (current) => ({
      ...current,
      resolving: true,
      error: "",
    }));

    try {
      const res = await fetch(
        `/api/steam-profile/resolve?q=${encodeURIComponent(query)}`,
      );
      const payload = (await res.json()) as
        | {
            steamID?: string;
            playerName?: string;
            avatarUrl?: string;
            flagCode?: string;
            error?: string;
          }
        | undefined;

      if (!res.ok || !payload?.steamID || !payload.playerName) {
        throw new Error(payload?.error || "Could not resolve Steam profile.");
      }

      setPlayerDraft(side, (current) => ({
        ...current,
        steamID: payload.steamID!,
        playerName: payload.playerName!,
        avatarUrl: payload.avatarUrl || steamUserAvatar,
        flagCode: payload.flagCode || "",
        resolving: false,
        error: "",
      }));
    } catch (error) {
      setPlayerDraft(side, (current) => ({
        ...current,
        steamID: "",
        avatarUrl: "",
        resolving: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not resolve Steam profile.",
      }));
    }
  };

  const addPlayer = (side: TeamSide) => {
    const draft = getPlayerDraft(side);
    const isSteam = draft.mode === "steam";

    if (draft.playerName.trim() === "") {
      setPlayerDraft(side, (current) => ({
        ...current,
        error: "Player name is required.",
      }));
      return;
    }

    if (isSteam && draft.steamID.trim() === "") {
      setPlayerDraft(side, (current) => ({
        ...current,
        error: "Resolve the Steam player before adding it.",
      }));
      return;
    }

    const player: Player = {
      id: crypto.randomUUID(),
      source: draft.mode,
      steamID: isSteam ? draft.steamID : "NO_STEAM",
      flagCode: draft.flagCode || undefined,
      playerName: draft.playerName.trim(),
      avatarUrl: isSteam ? draft.avatarUrl : steamUserAvatar,
    };

    setSettings(
      produce((settings) => {
        const team =
          side === "left"
            ? settings.leftTeamSettings.players
            : settings.rightTeamSettings.players;
        team.push(player);
      }),
    );

    setPlayerDraft(side, createPlayerDraft(draft.mode));
  };

  const removePlayer = (side: TeamSide, playerId: string) => {
    setSettings(
      produce((settings) => {
        if (side === "left") {
          settings.leftTeamSettings.players =
            settings.leftTeamSettings.players.filter((p) => p.id !== playerId);
        } else {
          settings.rightTeamSettings.players =
            settings.rightTeamSettings.players.filter((p) => p.id !== playerId);
        }
      }),
    );
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#181c24] md:flex-row">
      <aside className="relative overflow-x-auto border-b border-[#3a3f4b] bg-[#23293a] px-3 py-3 md:min-h-dvh md:w-[248px] md:shrink-0 md:border-b-0 md:border-r md:px-4 md:py-5">
        <div className="flex min-w-max items-center gap-2 md:min-w-0 md:flex-col md:items-stretch">
          <div className="hidden px-3 pb-3 md:block">
            <div className="text-[11px] font-bender-bold uppercase tracking-[0.18em] text-[#b6c2e2]">
              Dashboard
            </div>
            <div className="mt-1 text-[24px] font-bender-bold text-white">
              Controls
            </div>
          </div>

          {sidebarItems.map((item) => (
            <button
              key={item.anchor}
              className={cn(
                "inline-flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border px-4 py-3 text-center text-[13px] font-bender-bold uppercase tracking-[0.08em] transition md:w-full md:justify-start md:text-left",
                selectedSection === item.anchor
                  ? "border-[#3a7bd5] bg-[#3a7bd5] text-white shadow-[0_10px_24px_rgba(58,123,213,0.22)]"
                  : "border-[#3a3f4b] bg-[#181c24]/70 text-[#b6c2e2] hover:border-[#3a7bd5]/70 hover:bg-[#202d46] hover:text-white",
              )}
              onClick={() => setSelectedSection(item.anchor)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </aside>
      <main className="flex flex-1 flex-col items-center gap-6 px-4 py-4 md:px-6 md:py-8">
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

            <Card title="Players">
              <p className="text-sm leading-6 text-[#b6c2e2] md:text-[15px]">
                Resolve Steam players automatically or switch to No Steam mode
                for manual entries with the default avatar.
              </p>

              <div className="grid grid-cols-2 gap-2 md:hidden">
                {(
                  [
                    {
                      side: "left",
                      teamName: settings.leftTeamSettings.name,
                    },
                    {
                      side: "right",
                      teamName: settings.rightTeamSettings.name,
                    },
                  ] as const
                ).map(({ side, teamName }) => (
                  <button
                    key={side}
                    type="button"
                    className={cn(
                      "rounded-xl border px-3 py-3 text-[13px] font-bender-bold uppercase tracking-[0.08em] transition",
                      selectedPlayerTeamTab === side
                        ? "border-[#3a7bd5] bg-[#3a7bd5] text-white"
                        : "border-[#3a3f4b] bg-[#181c24] text-[#b6c2e2]",
                    )}
                    onClick={() => setSelectedPlayerTeamTab(side)}
                  >
                    {teamName}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {(
                  [
                    {
                      side: "left",
                      accent: "#5bc0eb",
                      draft: newLeftPlayer,
                      teamName: settings.leftTeamSettings.name,
                      players: settings.leftTeamSettings.players,
                    },
                    {
                      side: "right",
                      accent: "#ff595e",
                      draft: newRightPlayer,
                      teamName: settings.rightTeamSettings.name,
                      players: settings.rightTeamSettings.players,
                    },
                  ] as const
                ).map(({ side, accent, draft, teamName, players }) => (
                  <section
                    key={side}
                    className={cn(
                      teamPanelClassName,
                      side !== selectedPlayerTeamTab && "hidden md:block",
                    )}
                  >
                    <div className="mb-4">
                      <div
                        className="text-lg font-bender-bold"
                        style={{ color: accent }}
                      >
                        {teamName}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={dashboardFieldLabelClassName}>
                          Player Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            className={cn(
                              "rounded-xl border px-3 py-2 text-[13px] font-bender-bold uppercase tracking-[0.08em] transition",
                              draft.mode === "steam"
                                ? "border-[#3a7bd5] bg-[#3a7bd5] text-white"
                                : "border-[#3a3f4b] bg-[#181c24] text-[#b6c2e2] hover:border-[#3a7bd5] hover:text-white",
                            )}
                            onClick={() => setPlayerMode(side, "steam")}
                          >
                            Steam Player
                          </button>
                          <button
                            type="button"
                            className={cn(
                              "rounded-xl border px-3 py-2 text-[13px] font-bender-bold uppercase tracking-[0.08em] transition",
                              draft.mode === "no_steam"
                                ? "border-[#ffd166] bg-[#ffd166] text-[#23293a]"
                                : "border-[#3a3f4b] bg-[#181c24] text-[#b6c2e2] hover:border-[#ffd166] hover:text-white",
                            )}
                            onClick={() => setPlayerMode(side, "no_steam")}
                          >
                            No Steam
                          </button>
                        </div>
                      </div>

                      <div className="min-h-40 rounded-2xl border border-[#3a3f4b] bg-[#202635] p-3">
                        {draft.mode === "steam" ? (
                          <div>
                            <label
                              htmlFor={`${side}-steam-input`}
                              className={dashboardFieldLabelClassName}
                            >
                              Steam Profile
                            </label>
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <input
                                id={`${side}-steam-input`}
                                type="text"
                                className={dashboardInputClassName}
                                placeholder="SteamID, SteamID64, vanity URL, or profile link"
                                value={draft.steamInput}
                                onChange={(e) =>
                                  setPlayerDraft(side, (current) => ({
                                    ...current,
                                    steamInput: e.target.value,
                                    steamID: "",
                                    flagCode: "",
                                    playerName: "",
                                    avatarUrl: "",
                                    error: "",
                                  }))
                                }
                                onBlur={() => {
                                  if (
                                    draft.mode === "steam" &&
                                    draft.steamInput.trim() &&
                                    !draft.steamID &&
                                    !draft.resolving
                                  ) {
                                    void resolveSteamPlayer(side);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    void resolveSteamPlayer(side);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => void resolveSteamPlayer(side)}
                                disabled={draft.resolving}
                                className={cn(
                                  "inline-flex min-h-12 items-center justify-center rounded-xl px-4 py-2.5 text-[13px] font-bender-bold uppercase tracking-[0.08em] transition sm:min-w-32",
                                  draft.resolving
                                    ? "cursor-wait bg-[#2a3143] text-[#9aa6c3]"
                                    : "bg-[#3a7bd5] text-white hover:bg-[#2851a3]",
                                )}
                              >
                                {draft.resolving ? "Resolving..." : "Resolve"}
                              </button>
                            </div>
                            <p className="mt-2 text-[12px] leading-5 text-[#b6c2e2]">
                              Accepts SteamID, SteamID3, SteamID64, vanity
                              names, and full Steam profile URLs.
                            </p>
                          </div>
                        ) : (
                          <div className="flex h-full flex-col justify-center text-[13px] leading-6 text-[#b6c2e2]">
                            <div className="text-[11px] font-bender-bold uppercase tracking-[0.16em] text-[#ffd166]">
                              Manual Entry
                            </div>
                            <p className="mt-2">
                              Use this mode for non-Steam players. The entry
                              will use the default local avatar and a `NO_STEAM`
                              identifier.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-[#3a3f4b] bg-[#202635] p-3">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                          <div className="mx-auto flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#3a3f4b] bg-[#181c24] sm:mx-0">
                            <img
                              src={
                                draft.mode === "no_steam"
                                  ? steamUserAvatar
                                  : draft.avatarUrl || steamUserAvatar
                              }
                              alt="Player avatar preview"
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col gap-4">
                            <div>
                              <label
                                htmlFor={`${side}-player-name`}
                                className={dashboardFieldLabelClassName}
                              >
                                Nick
                              </label>
                              <input
                                id={`${side}-player-name`}
                                type="text"
                                className={dashboardInputClassName}
                                placeholder="Player nickname"
                                value={draft.playerName}
                                onChange={(e) =>
                                  setPlayerDraft(side, (current) => ({
                                    ...current,
                                    playerName: e.target.value,
                                    error: "",
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addPlayer(side);
                                  }
                                }}
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`${side}-player-flag`}
                                className={dashboardFieldLabelClassName}
                              >
                                Flag
                              </label>
                              <select
                                id={`${side}-player-flag`}
                                className={dashboardInputClassName}
                                value={draft.flagCode}
                                onChange={(e) =>
                                  setPlayerDraft(side, (current) => ({
                                    ...current,
                                    flagCode: e.target.value,
                                  }))
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
                              <p className="mt-2 text-[12px] leading-5 text-[#b6c2e2]">
                                Steam players auto-fill this when possible. You
                                can still change it manually.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {draft.error && (
                        <div className="rounded-xl border border-[#d32f2f]/40 bg-[#d32f2f]/10 px-3 py-2 text-[12px] leading-5 text-[#ff8e8e]">
                          {draft.error}
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => addPlayer(side)}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3a7bd5] px-4 py-2.5 text-[13px] font-bender-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#2851a3]"
                        >
                          Add Player
                        </button>
                      </div>

                      <div className="space-y-3">
                        {players.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-[#3a3f4b] bg-[#181c24]/60 px-4 py-5 text-center text-[13px] text-[#7481a1]">
                            No players added yet.
                          </div>
                        ) : (
                          players.map((player) => (
                            <div
                              key={player.id}
                              className="flex items-center gap-3 rounded-2xl border border-[#3a3f4b] bg-[#181c24]/70 px-3 py-3"
                            >
                              <img
                                src={getStoredPlayerAvatar(player)}
                                alt={player.playerName}
                                className="h-12 w-12 shrink-0 rounded-xl object-cover"
                              />

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="truncate text-[15px] text-white">
                                    {player.playerName}
                                  </span>
                                  {player.flagCode && (
                                    <img
                                      src={getFlagUrl(player.flagCode)}
                                      alt={player.flagCode}
                                      className="h-4 w-5 shrink-0 rounded-[2px] object-cover"
                                    />
                                  )}
                                </div>
                                <div className="mt-1 text-[12px] text-[#9aa6c3]">
                                  {player.source === "steam"
                                    ? "Steam player"
                                    : "No Steam player"}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => removePlayer(side, player.id)}
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d32f2f] text-[18px] font-bender-bold text-white transition hover:bg-[#b72828]"
                                title="Remove player"
                              >
                                ×
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </section>
                ))}
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
              <div className="flex flex-col gap-4">
                <p className="text-sm leading-6 text-[#b6c2e2] md:text-[15px]">
                  Pick the live game server the overlay should follow.
                </p>

                <div className="rounded-2xl border border-[#3a3f4b] bg-[#181c24]/45 p-2 md:p-3">
                  <SimpleBar style={{ maxHeight: 380, width: "100%" }}>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {AGOverlayData.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#3a3f4b] bg-[#181c24]/60 px-4 py-6 text-center text-[13px] text-[#7481a1] md:col-span-2">
                          No servers available yet. Check the AG websocket
                          connection.
                        </div>
                      ) : (
                        AGOverlayData.map((server) => {
                          const isSelected =
                            settings.selectedServer === server.server_ip;

                          return (
                            <button
                              key={server.server_ip}
                              type="button"
                              className={cn(
                                "w-full cursor-pointer rounded-2xl border px-4 py-4 text-left transition",
                                isSelected
                                  ? "border-[#3a7bd5] bg-[#3a7bd5]/18 shadow-[0_8px_24px_rgba(58,123,213,0.18)]"
                                  : "border-[#3a3f4b] bg-[#202635] hover:border-[#3a7bd5]/60 hover:bg-[#202d46]",
                              )}
                              onClick={() =>
                                setSettings(
                                  produce((settings) => {
                                    settings.selectedServer = server.server_ip;
                                  }),
                                )
                              }
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-[15px] font-bender-bold text-white md:text-[16px]">
                                    {server.data.hostname}
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3a3f4b] bg-[#181c24] px-2.5 py-1 text-[11px] font-bender-bold uppercase tracking-[0.08em] text-[#ffd166]">
                                      <BankIcon size={12} weight="bold" />
                                      {server.data.map}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3a3f4b] bg-[#181c24] px-2.5 py-1 text-[11px] font-bender-bold uppercase tracking-[0.08em] text-[#b6c2e2]">
                                      <UserIcon size={12} weight="bold" />
                                      {server.data.players.length}
                                    </span>
                                  </div>
                                  <div className="mt-3 truncate text-[12px] text-[#9aa6c3]">
                                    {server.server_ip}
                                  </div>
                                </div>

                                <div
                                  className={cn(
                                    "shrink-0 rounded-full px-3 py-1 text-[11px] font-bender-bold uppercase tracking-[0.12em]",
                                    isSelected
                                      ? "bg-[#ffd166] text-[#23293a]"
                                      : "bg-[#181c24] text-[#b6c2e2]",
                                  )}
                                >
                                  {isSelected ? "Selected" : "Choose"}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </SimpleBar>
                </div>
              </div>
            </Card>
          </>
        )}

        {selectedSection === "settings" && (
          <Card title="Connection Settings">
            <div className="flex flex-col gap-4">
              <p className="text-sm leading-6 text-[#b6c2e2] md:text-[15px]">
                This is the WebSocket URL for the AG backend service that
                provides the live server data used by the overlay.
              </p>

              <div className="rounded-2xl border border-[#3a3f4b] bg-[#181c24]/45 p-4">
                <label
                  htmlFor="connection-websocket-url"
                  className={dashboardFieldLabelClassName}
                >
                  WebSocket URL
                </label>
                <input
                  id="connection-websocket-url"
                  type="text"
                  className={cn(
                    dashboardInputClassName,
                    "max-w-none text-[14px] md:text-[15px]",
                  )}
                  placeholder="ws://127.0.0.1:8080"
                  value={settings.websocketURL}
                  onChange={changeWebsocketURL}
                />
                <p className="mt-3 text-[12px] leading-5 text-[#b6c2e2] md:text-[13px]">
                  Point this to the websocket service that exposes the AG match
                  and player feed.
                </p>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
