import { produce } from "immer";
import { screenNames, type ScreenName } from "~/schemas/screens";
import { useSettings } from "~/state/dashboard";
import {
  FlagPennantIcon,
  HourglassIcon,
  SwordIcon,
  ListIcon,
  TrophyIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";
import { cn } from "~/dashboard/utils/ui";
import Card from "./Card";

export function SceneSwitcher() {
  const [settings, setSettings] = useSettings();

  const setSelectedScreen = (screen: ScreenName) =>
    setSettings(
      produce((settings) => {
        settings.activeScreen = screen;
        settings.previousScreen = settings.activeScreen;
      }),
    );

  return (
    <Card title="Scene Switcher">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="md:hidden">
          <div className="relative">
            <select
              value={settings.activeScreen}
              onChange={(e) =>
                setSelectedScreen(e.target.value as ScreenName)
              }
              className="w-full appearance-none rounded-xl border border-[#3a7bd5]/45 bg-[#181c24] px-4 py-3 pr-12 text-[14px] font-bender-bold uppercase tracking-[0.06em] text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] outline-none transition focus:border-[#ffd166] focus:ring-2 focus:ring-[#3a7bd5]/35 cursor-pointer"
            >
              {screenNames.map((scene) => (
                <option key={scene} value={scene}>
                  {scene}
                </option>
              ))}
            </select>
            <CaretDownIcon
              size={20}
              weight="bold"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#ffd166]"
            />
          </div>
        </div>

        <div className="hidden flex-wrap gap-2 md:flex">
          {screenNames.map((scene) => (
            <button
              key={scene}
              className={cn(
                "flex items-center gap-1.5 rounded-lg bg-[#3a7bd5] px-4 py-2 text-[13px] uppercase text-white transition-all hover:bg-[#2a6bc5] hover:text-gray-200",
                "font-bender-bold shadow-[0_8px_18px_rgba(42,107,197,0.18)] cursor-pointer",
                settings.activeScreen === scene &&
                  "bg-[#ffd166] text-[#23293a] shadow-[0_8px_18px_rgba(255,209,102,0.2)] hover:bg-[#ffd166] hover:text-[#23293a]",
              )}
              onClick={() => setSelectedScreen(scene)}
            >
              {scene === "start" && <FlagPennantIcon size={18} weight="bold" />}
              {scene === "standby" && <HourglassIcon size={18} weight="bold" />}
              {scene === "versus" && <SwordIcon size={18} weight="bold" />}
              {scene === "mappool" && <ListIcon size={18} weight="bold" />}
              {scene === "winner" && <TrophyIcon size={18} weight="bold" />}
              {scene}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
