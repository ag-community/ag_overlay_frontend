import { useQuery } from "@tanstack/react-query";
import { CrosshairIcon, ShieldIcon, SkullIcon } from "@phosphor-icons/react";
import { getAvatarUrl } from "~/adapters/steam";
import type { AgOverlayPlayer } from "~/schemas/ag_overlay";
import { PlayerAvatar } from "./PlayerAvatar";
import clsx from "clsx";

type Props = {
  player: AgOverlayPlayer;
  side: "left" | "right";
};

export function PlayerCard({ player, side }: Props) {
  const healthPercent = Math.max(0, Math.min(100, player.health));

  const { data } = useQuery({
    queryKey: ["steam-avatar", player.steamid],
    queryFn: () => getAvatarUrl(player.steamid),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className={clsx("player-card", `player-card-${side}`)}>
      <div
        className={clsx(
          "player-card-health-bar",
          `player-card-health-bar-${side}`,
        )}
        style={{ height: `${healthPercent}%` }}
      />
      <div className="player-card-content">
        {data?.avatarFull && <PlayerAvatar url={data.avatarFull} />}
        <div className="player-hev">
          {player.hev}
          <ShieldIcon />
        </div>
        <div className="player-name">{player.name} </div>
        <div className="player-stats">
          {player.frags} <CrosshairIcon /> {player.deaths} <SkullIcon />
        </div>
      </div>
    </div>
  );
}
