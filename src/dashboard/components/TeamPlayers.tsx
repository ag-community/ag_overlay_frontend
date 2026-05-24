import type { Player } from "~/schemas/settings";
import { cn } from "~/dashboard/utils/ui";
import { ALPHA2_COUNTRY_LIST, getFlagUrl } from "~/utils/countries";
import steamUserAvatar from "../assets/steam_user.png";
import {
  dashboardFieldLabelClassName,
  dashboardInputClassName,
  teamPanelClassName,
  type TeamSide,
} from "./constants";
import type { PlayerDraft } from "./constants";

function getStoredPlayerAvatar(player: Player) {
  if (player.source === "no_steam") {
    return steamUserAvatar;
  }
  return player.avatarUrl || steamUserAvatar;
}

type TeamPlayersProps = {
  side: TeamSide;
  accent: string;
  teamName: string;
  players: Player[];
  selectedTab: TeamSide;
  draft: PlayerDraft;
  setPlayerDraft: (side: TeamSide, update: PlayerDraft | ((current: PlayerDraft) => PlayerDraft)) => void;
  setPlayerMode: (side: TeamSide, mode: "steam" | "no_steam") => void;
  resolveSteamPlayer: (side: TeamSide) => Promise<void>;
  addPlayer: (side: TeamSide) => void;
  removePlayer: (side: TeamSide, playerId: string) => void;
};

export function TeamPlayers({ side, accent, teamName, players, selectedTab, draft, setPlayerDraft, setPlayerMode, resolveSteamPlayer, addPlayer, removePlayer }: TeamPlayersProps) {

  return (
    <section
      className={cn(
        teamPanelClassName,
        side !== selectedTab && "hidden md:block",
      )}
    >
      <div className="mb-4">
        <div className="text-lg font-bender-bold" style={{ color: accent }}>
          {teamName}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className={dashboardFieldLabelClassName}>Player Type</label>
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
              <label htmlFor={`${side}-steam-input`} className={dashboardFieldLabelClassName}>
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
                Accepts SteamID, SteamID3, SteamID64, vanity names, and full Steam profile URLs.
              </p>
            </div>
          ) : (
            <div className="flex h-full flex-col justify-center text-[13px] leading-6 text-[#b6c2e2]">
              <div className="text-[11px] font-bender-bold uppercase tracking-[0.16em] text-[#ffd166]">
                Manual Entry
              </div>
              <p className="mt-2">
                Use this mode for non-Steam players. The entry will use the default local avatar and a `NO_STEAM` identifier.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#3a3f4b] bg-[#202635] p-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="mx-auto flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#3a3f4b] bg-[#181c24] sm:mx-0">
              <img
                src={draft.mode === "no_steam" ? steamUserAvatar : draft.avatarUrl || steamUserAvatar}
                alt="Player avatar preview"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div>
                <label htmlFor={`${side}-player-name`} className={dashboardFieldLabelClassName}>
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
                <label htmlFor={`${side}-player-flag`} className={dashboardFieldLabelClassName}>
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
                  {Object.entries(ALPHA2_COUNTRY_LIST).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[12px] leading-5 text-[#b6c2e2]">
                  Steam players auto-fill this when possible. You can still change it manually.
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
                        className="h-4 w-5 shrink-0 rounded-xs object-cover"
                      />
                    )}
                  </div>
                  <div className="mt-1 text-[12px] text-[#9aa6c3]">
                    {player.source === "steam" ? "Steam player" : "No Steam player"}
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
  );
}
