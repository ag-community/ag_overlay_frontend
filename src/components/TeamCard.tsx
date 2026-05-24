import type {
  AgOverlayPlayer,
  AgOverlayServerData,
} from "~/schemas/ag_overlay";
import { PlayerCard } from "./PlayerCard";
import { WeaponCard } from "./WeaponCard";
import { useSettings } from "~/state/dashboard";

type Props = {
  server: AgOverlayServerData;
  side: "left" | "right";
};

export function TeamCard({ server, side }: Props) {
  const [settings] = useSettings();

  let players: AgOverlayPlayer[] = [];
  if (side === "left") {
    players = server.players.filter(
      (player) =>
        player.team.toLowerCase() ===
        settings.leftTeamSettings.model.toLowerCase(),
    );
  } else if (side === "right") {
    players = server.players.filter(
      (player) =>
        player.team.toLowerCase() ===
        settings.rightTeamSettings.model.toLowerCase(),
    );
  }

  return (
    <div className={`${side}-team`}>
      {players.map((player) => (
        <div className="player-weapon-pair" key={player.name}>
          <PlayerCard player={player} side={side} />
          <WeaponCard player={player} side={side} />
        </div>
      ))}
    </div>
  );
}
