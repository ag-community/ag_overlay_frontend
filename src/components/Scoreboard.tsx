import type { AgOverlayServerData } from "~/schemas/ag_overlay";
import { useSettings } from "~/state/dashboard";

type Props = {
  server: AgOverlayServerData;
};

export function Scoreboard({ server }: Props) {
  const [settings] = useSettings();

  const leftPlayers = server.players.filter(
    (player) =>
      player.team.toLowerCase() ===
      settings.leftTeamSettings.model.toLowerCase(),
  );
  const rightPlayers = server.players.filter(
    (player) =>
      player.team.toLowerCase() ===
      settings.rightTeamSettings.model.toLowerCase(),
  );

  const maxPoints = Math.ceil(settings.bestOfPoints / 2);

  return (
    <div className="scoreboard-container">
      <div className="scoreboard-team scoreboard-team-left">
        <span className="scoreboard-team-name">
          {settings.leftTeamSettings.name}
        </span>
        <span className="scoreboard-team-score">
          {leftPlayers.map((player) => player.frags).reduce((a, b) => a + b, 0)}
        </span>
        <div className="team-points-bar team-points-bar-left">
          {Array.from({ length: maxPoints }).map((_, i) => (
            <div
              key={i}
              className={
                "team-point-box team-point-box-left" +
                (i < settings.leftTeamSettings.points ? " active" : "")
              }
            />
          ))}
        </div>
      </div>
      <div className="scoreboard-timer">
        {formatTime(server.remaining_time)}
      </div>
      <div className="scoreboard-team scoreboard-team-right">
        <span className="scoreboard-team-name">
          {settings.rightTeamSettings.name}
        </span>
        <span className="scoreboard-team-score">
          {rightPlayers
            .map((player) => player.frags)
            .reduce((a, b) => a + b, 0)}
        </span>
        <div className="team-points-bar team-points-bar-right">
          {Array.from({ length: maxPoints }).map((_, i) => (
            <div
              key={i}
              className={
                "team-point-box team-point-box-right" +
                (i < settings.rightTeamSettings.points ? " active" : "")
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const min = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(clamped % 60)
    .toString()
    .padStart(2, "0");
  return `${min}:${secs}`;
}
