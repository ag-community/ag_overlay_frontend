import { getAnimations, sectionVariants, type AnimTypes } from "~/animations";
import { motion } from "framer-motion";
import { useSettings } from "~/state/dashboard";
import BlueTeamLogo from "~/static/images/teams/blue.png";
import RedTeamLogo from "~/static/images/teams/red.png";
import { getFlagUrl } from "~/utils/countries";
import { Background } from "~/components/Background";

interface WinnerScreenProps {
  from?: string;
  to: string;
}

export function WinnerScreen({ from, to }: WinnerScreenProps) {
  const [settings] = useSettings();

  const anims: AnimTypes = getAnimations(to, from ?? "");
  const slideDirection: 1 | -1 = 1;

  const maxPoints = Math.ceil(settings.bestOfPoints / 2);
  const leftPoints = settings.leftTeamSettings.points;
  const rightPoints = settings.rightTeamSettings.points;

  const finished = leftPoints >= maxPoints || rightPoints >= maxPoints;

  const leftTeamPlayers = settings.leftTeamSettings.players;
  const rightTeamPlayers = settings.rightTeamSettings.players;

  let result: "left" | "right" | "draw" = "left";
  if (
    leftPoints >= maxPoints &&
    rightPoints >= maxPoints &&
    leftPoints === rightPoints
  ) {
    result = "draw";
  } else if (rightPoints >= maxPoints && rightPoints > leftPoints) {
    result = "right";
  } else if (leftPoints >= maxPoints && leftPoints > rightPoints) {
    result = "left";
  }

  const teamColor = result === "left" ? "blue" : "red";
  const teamName =
    result === "left"
      ? settings.leftTeamSettings.name
      : settings.rightTeamSettings.name;
  const leftLogo = settings.leftTeamLogoUrl || BlueTeamLogo;
  const rightLogo = settings.rightTeamLogoUrl || RedTeamLogo;

  return (
    <motion.div
      key={`main-${to}`}
      {...(anims.main === "slide"
        ? sectionVariants.main.slide(slideDirection)
        : anims.main === "fade"
          ? sectionVariants.main.fade
          : sectionVariants.main.none)}
    >
      <div className="winner-root">
        <Background
          url={settings.backgroundUrl}
          color={settings.backgroundColor}
          opacity={settings.backgroundOpacity}
          blur={settings.backgroundBlur}
        />
        {finished && result !== "draw" && (
          <div className="winner-image-container">
            <img
              src={result === "left" ? leftLogo : rightLogo}
              className="winner-side-image"
            />
          </div>
        )}
        <div className="winner-content">
          <div className="winner-title">{settings.round}</div>
          {!finished ? (
            <div className="winner-label winner-inprogress">
              Match in progress...
            </div>
          ) : (
            <>
              <div className="winner-label">
                {result === "draw" ? "DRAW" : "WINNER"}
              </div>
              {result !== "draw" && (
                <div className="winner-team-row">
                  <span className={`winner-team-tag ${teamColor}`}>
                    TEAM {teamColor.toUpperCase()}
                  </span>
                  <span className="winner-team-name">{teamName}</span>
                </div>
              )}
              <ul className="winner-players">
                {(result === "left" ? leftTeamPlayers : rightTeamPlayers).map(
                  (player) => (
                    <li className="winner-player-item" key={player.playerName}>
                      {player.flagCode && (
                        <img
                          src={getFlagUrl(player.flagCode)}
                          className="winner-player-flag"
                        />
                      )}
                      <span>{player.playerName}</span>
                    </li>
                  ),
                )}
              </ul>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
