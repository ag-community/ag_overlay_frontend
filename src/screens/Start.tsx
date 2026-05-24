import { useSettings } from "~/state/dashboard";
import BlueTeamLogo from "~/static/images/teams/blue.png";
import RedTeamLogo from "~/static/images/teams/red.png";
import { getFlagUrl } from "~/utils/countries";
import { motion } from "framer-motion";
import { getAnimations, sectionVariants, type AnimTypes } from "~/animations";
import { Background } from "~/components/Background";

interface StartScreenProps {
  from?: string;
  to: string;
}

export function StartScreen({ from, to }: StartScreenProps) {
  const [settings] = useSettings();

  const anims: AnimTypes = getAnimations(to, from ?? "");
  const slideDirection: 1 | -1 = 1;

  const leftTeam = settings.leftTeamSettings;
  const rightTeam = settings.rightTeamSettings;
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
      <div className="start-root">
        <Background
          url={settings.backgroundUrl}
          color={settings.backgroundColor}
          opacity={settings.backgroundOpacity}
          blur={settings.backgroundBlur}
        />
        <div className="start-team start-team-left">
          <img src={leftLogo} className="start-team-logo" />
          <div className="start-team-name">{leftTeam.name}</div>
          <ul className="start-team-players">
            {leftTeam.players.map((player) => (
              <li className="start-player-item" key={player.id}>
                {player.flagCode && (
                  <img
                    src={getFlagUrl(player.flagCode)}
                    className="start-player-flag"
                  />
                )}
                <span>{player.playerName}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="start-center">
          <div className="start-title">{settings.round}</div>
          <div className="start-label">Semifinals</div>
        </div>

        <div className="start-team start-team-right">
          <img src={rightLogo} className="start-team-logo" />
          <div className="start-team-name">{rightTeam.name}</div>
          <ul className="start-team-players">
            {rightTeam.players.map((player) => (
              <li className="start-player-item" key={player.id}>
                {player.flagCode && (
                  <img
                    src={getFlagUrl(player.flagCode)}
                    className="start-player-flag"
                  />
                )}
                <span>{player.playerName}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
