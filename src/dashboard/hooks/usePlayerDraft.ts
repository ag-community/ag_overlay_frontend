import { useState } from "react";
import type { Player } from "~/schemas/settings";
import type { TeamSide, PlayerDraft } from "../components/constants";
import { produce } from "immer";
import { useSettings } from "~/state/dashboard";
import steamUserAvatar from "../assets/steam_user.png";

function createPlayerDraft(mode: "steam" | "no_steam" = "steam"): PlayerDraft {
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

export function usePlayerDraft() {
  const [newLeftPlayer, setNewLeftPlayer] = useState<PlayerDraft>(() =>
    createPlayerDraft(),
  );
  const [newRightPlayer, setNewRightPlayer] = useState<PlayerDraft>(() =>
    createPlayerDraft(),
  );
  const [, setSettings] = useSettings();

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

  const setPlayerMode = (side: TeamSide, mode: "steam" | "no_steam") => {
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

  return {
    newLeftPlayer,
    newRightPlayer,
    setPlayerDraft,
    getPlayerDraft,
    setPlayerMode,
    resolveSteamPlayer,
    addPlayer,
    removePlayer,
  };
}
