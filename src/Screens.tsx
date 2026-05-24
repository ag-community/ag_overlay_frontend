import { AnimatePresence } from "motion/react";
import { useSettings } from "~/state/dashboard";
import { StandbyScreen } from "./screens/Standby";
import { StartScreen } from "./screens/Start";
import { VersusScreen } from "./screens/Versus";
import { WinnerScreen } from "./screens/Winner";

export function Screens() {
  const [settings] = useSettings();
  const activeScreen = settings.activeScreen;
  const previous = settings.previousScreen;

  return (
    <div style={{ position: "relative" }}>
      <AnimatePresence mode="wait" initial={false}>
        {activeScreen === "start" && (
          <StartScreen key="start" from={previous} to="start" />
        )}
        {activeScreen === "standby" && (
          <StandbyScreen key="standby" from={previous} to="standby" />
        )}
        {activeScreen === "versus" && (
          <VersusScreen key="versus" from={previous} to="versus" />
        )}
        {activeScreen === "winner" && (
          <WinnerScreen key="winner" from={previous} to="winner" />
        )}
      </AnimatePresence>
    </div>
  );
}
