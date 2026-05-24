import { screenNames, type ScreenName } from "~/schemas/screens";
import { useAGOverlay } from "~/state/ag_overlay";
import { useSettings } from "~/state/dashboard";
import { useState } from "react";
import "simplebar/dist/simplebar.min.css";
import "./dashboard.css";
import Card from "./components/Card";
import { SceneSwitcher } from "./components/SceneSwitcher";
import { TournamentSettings } from "./components/TournamentSettings";
import { TeamPanel } from "./components/TeamPanel";
import { TeamPlayers } from "./components/TeamPlayers";
import { ScoringSection } from "./components/ScoringSection";
import { BackgroundSettings } from "./components/BackgroundSettings";
import { ServerSelector } from "./components/ServerSelector";
import { ConnectionSettings } from "./components/ConnectionSettings";
import { usePlayerDraft } from "./hooks/usePlayerDraft";
import { cn } from "~/dashboard/utils/ui";
import type { TeamSide } from "./components/constants";

const sidebarItems = [
  { label: "Dashboard", anchor: "dashboard" },
  { label: "Settings", anchor: "settings" },
];

export function Dashboard() {
  const AGOverlayData = useAGOverlay();
  const [settings, setSettings] = useSettings();
  const playerDraft = usePlayerDraft();

  const [selectedSection, setSelectedSection] = useState(
    sidebarItems[0]?.anchor ?? "",
  );
  const [selectedPlayerTeamTab, setSelectedPlayerTeamTab] =
    useState<TeamSide>("left");

  return (
    <div className="flex min-h-dvh flex-col bg-[#181c24] md:flex-row">
      <aside className="relative overflow-x-auto border-b border-[#3a3f4b] bg-[#23293a] px-3 py-3 md:min-h-dvh md:w-62 md:shrink-0 md:border-b-0 md:border-r md:px-4 md:py-5">
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
            <SceneSwitcher />

            <TournamentSettings />

            <Card title="Teams">
              <p className="text-[13px] text-[#b6c2e2] md:text-sm">
                Configure both sides and upload square team logos.
              </p>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <TeamPanel side="left" accent="#5bc0eb" label="Team A" />
                <TeamPanel side="right" accent="#ff595e" label="Team B" />
              </div>
            </Card>

            <Card title="Players">
              <p className="text-sm leading-6 text-[#b6c2e2] md:text-[15px]">
                Resolve Steam players automatically or switch to No Steam mode
                for manual entries with the default avatar.
              </p>

              <div className="grid grid-cols-2 gap-2 md:hidden">
                {([
                  { side: "left", teamName: settings.leftTeamSettings.name },
                  { side: "right", teamName: settings.rightTeamSettings.name },
                ] as const).map(({ side, teamName }) => (
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
                {([
                  { side: "left", accent: "#5bc0eb", teamName: settings.leftTeamSettings.name, players: settings.leftTeamSettings.players },
                  { side: "right", accent: "#ff595e", teamName: settings.rightTeamSettings.name, players: settings.rightTeamSettings.players },
                ] as const).map(({ side, accent, teamName, players }) => (
                  <TeamPlayers
                    key={side}
                    side={side}
                    accent={accent}
                    teamName={teamName}
                    players={players}
                    selectedTab={selectedPlayerTeamTab}
                    draft={playerDraft.getPlayerDraft(side)}
                    setPlayerDraft={playerDraft.setPlayerDraft}
                    setPlayerMode={playerDraft.setPlayerMode}
                    resolveSteamPlayer={playerDraft.resolveSteamPlayer}
                    addPlayer={playerDraft.addPlayer}
                    removePlayer={playerDraft.removePlayer}
                  />
                ))}
              </div>
            </Card>

            <ScoringSection />

            <BackgroundSettings />

            <ServerSelector />
          </>
        )}

        {selectedSection === "settings" && (
          <ConnectionSettings />
        )}
      </main>
    </div>
  );
}
