import { produce } from "immer";
import { useSettings } from "~/state/dashboard";
import { cn } from "~/dashboard/utils/ui";
import { dashboardFieldLabelClassName, dashboardInputClassName } from "./constants";
import Card from "./Card";

export function ConnectionSettings() {
  const [settings, setSettings] = useSettings();

  const changeWebsocketURL = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(
      produce((settings) => {
        settings.websocketURL = e.target.value;
      }),
    );
  };

  return (
    <Card title="Connection Settings">
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-[#b6c2e2] md:text-[15px]">
          This is the WebSocket URL for the AG backend service that provides the live server data used by the overlay.
        </p>

        <div className="rounded-2xl border border-[#3a3f4b] bg-[#181c24]/45 p-4">
          <label htmlFor="connection-websocket-url" className={dashboardFieldLabelClassName}>
            WebSocket URL
          </label>
          <input
            id="connection-websocket-url"
            type="text"
            className={cn(dashboardInputClassName, "max-w-none text-[14px] md:text-[15px]")}
            placeholder="ws://127.0.0.1:8080"
            value={settings.websocketURL}
            onChange={changeWebsocketURL}
          />
          <p className="mt-3 text-[12px] leading-5 text-[#b6c2e2] md:text-[13px]">
            Point this to the websocket service that exposes the AG match and player feed.
          </p>
        </div>
      </div>
    </Card>
  );
}
