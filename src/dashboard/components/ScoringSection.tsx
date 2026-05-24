import { produce } from "immer";
import { useSettings } from "~/state/dashboard";
import Card from "./Card";

export function ScoringSection() {
  const [settings, setSettings] = useSettings();

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

  const sectionClass =
    "mx-auto flex w-full max-w-72 flex-col items-center rounded-2xl border border-[#3a3f4b] bg-[#181c24]/45 p-4 text-center md:mx-0 md:max-w-none";

  return (
    <Card title="Scoring">
      <div className="flex flex-col gap-3">
        <p className="text-[13px] text-[#b6c2e2] md:text-sm">
          Manage the series length and update each team score live.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <section className={sectionClass}>
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

          <section className={sectionClass}>
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

          <section className={sectionClass}>
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
  );
}
