import { useWebSocket } from "partysocket/react";
import {
  createContext,
  use,
  useCallback,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  dashboardMessageSchema,
  type DashboardMessage,
  type DashboardSettings,
  settingsSchema,
} from "~/schemas/settings";

export const DashboardContext = createContext<
  | [
      DashboardSettings,
      Dispatch<SetStateAction<DashboardSettings>>,
      { wsStatus: string },
    ]
  | null
>(null);

export function DashboardSettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const ws = useWebSocket("ws://localhost:7270/ws", null, {
    onOpen() {
      console.log("Connected to the dashboard websocket server");
    },

    onClose() {
      console.log("Disconnected from the dashboard websocket server");
    },

    onMessage(e) {
      const { success, data, error } = dashboardMessageSchema.safeParse(
        JSON.parse(e.data),
      );

      if (success) {
        if (
          data.type === "HELLO" &&
          typeof GIT_COMMIT !== "undefined" &&
          GIT_COMMIT !== data.gitCommit
        ) {
          console.warn("Version mismatch detected! reloading client...");
          window.location.reload();
        }

        if (data.type === "SETTINGS") {
          _setSettings(data.settings);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.settings));
        }
      } else {
        console.error(
          "Error on parsing settings received from websocket server: ",
          error.message,
        );
      }
    },

    onError(e) {
      console.error(
        "Error on trying to connect to the dashboard websocket server:",
        e,
      );
    },
  });

  const STORAGE_KEY = "ag-dashboard-settings";

  const defaultSettings: DashboardSettings = {
    websocketURL: "ws://38.253.133.26:22667",
    selectedServer: "",
    activeScreen: "start",
    round: "Round 1",
    tournamentName: "Tournament name",
    backgroundUrl: "",
    backgroundColor: "#000000",
    backgroundOpacity: 100,
    backgroundBlur: 0,
    bestOfPoints: 3,
    leftTeamSettings: {
      name: "Left Team",
      model: "blue",
      points: 0,
      players: [],
    },
    rightTeamSettings: {
      name: "Right Team",
      model: "red",
      points: 0,
      players: [],
    },
    leftTeamLogoUrl: "",
    rightTeamLogoUrl: "",
  };

  const saved =
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  const initialSettings: DashboardSettings = (() => {
    if (!saved) return defaultSettings;
    try {
      const parsed = settingsSchema.parse(JSON.parse(saved));
      return parsed;
    } catch {
      return defaultSettings;
    }
  })();

  const wsStatus =
    ws.readyState === 0
      ? "connecting"
      : ws.readyState === 1
        ? "open"
        : ws.readyState === 2
          ? "closing"
          : "closed";

  const [settings, _setSettings] = useState<DashboardSettings>(initialSettings);

  const setSettings = useCallback(
    (update: SetStateAction<DashboardSettings>) => {
      _setSettings((currentSettings) => {
        const nextState =
          typeof update === "function" ? update(currentSettings) : update;
        const message: DashboardMessage = {
          type: "SETTINGS",
          settings: nextState,
        };
        ws.send(JSON.stringify(message));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        return nextState;
      });
    },
    [ws],
  );

  return (
    <DashboardContext value={[settings, setSettings, { wsStatus }]}>
      {children}
    </DashboardContext>
  );
}

export function useSettings() {
  const context = use(DashboardContext);
  if (!context)
    throw new Error("useSettings must only be used within a DashboardProvider");
  return context;
}
