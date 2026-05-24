import { produce } from "immer";
import { useSettings } from "~/state/dashboard";
import {
  dashboardFieldLabelClassName,
  dashboardInputClassName,
} from "./constants";
import Card from "./Card";

export function TournamentSettings() {
  const [settings, setSettings] = useSettings();

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

  return (
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
          <label htmlFor="round-name" className={dashboardFieldLabelClassName}>
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
  );
}
