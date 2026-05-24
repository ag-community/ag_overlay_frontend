import { produce } from "immer";
import { useSettings } from "~/state/dashboard";
import { useAGOverlay } from "~/state/ag_overlay";
import { cn } from "~/dashboard/utils/ui";
import { BankIcon, UserIcon } from "@phosphor-icons/react";
import SimpleBar from "simplebar-react";
import Card from "./Card";

export function ServerSelector() {
  const AGOverlayData = useAGOverlay();
  const [settings, setSettings] = useSettings();

  return (
    <Card title="Server Selector">
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-[#b6c2e2] md:text-[15px]">
          Pick the live game server the overlay should follow.
        </p>

        <div className="rounded-2xl border border-[#3a3f4b] bg-[#181c24]/45 p-2 md:p-3">
          <SimpleBar style={{ maxHeight: 380, width: "100%" }}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {AGOverlayData.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#3a3f4b] bg-[#181c24]/60 px-4 py-6 text-center text-[13px] text-[#7481a1] md:col-span-2">
                  No servers available yet. Check the AG websocket connection.
                </div>
              ) : (
                AGOverlayData.map((server) => {
                  const isSelected = settings.selectedServer === server.server_ip;

                  return (
                    <button
                      key={server.server_ip}
                      type="button"
                      className={cn(
                        "w-full cursor-pointer rounded-2xl border px-4 py-4 text-left transition",
                        isSelected
                          ? "border-[#3a7bd5] bg-[#3a7bd5]/18 shadow-[0_8px_24px_rgba(58,123,213,0.18)]"
                          : "border-[#3a3f4b] bg-[#202635] hover:border-[#3a7bd5]/60 hover:bg-[#202d46]",
                      )}
                      onClick={() =>
                        setSettings(
                          produce((settings) => {
                            settings.selectedServer = server.server_ip;
                          }),
                        )
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[15px] font-bender-bold text-white md:text-[16px]">
                            {server.data.hostname}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3a3f4b] bg-[#181c24] px-2.5 py-1 text-[11px] font-bender-bold uppercase tracking-[0.08em] text-[#ffd166]">
                              <BankIcon size={12} weight="bold" />
                              {server.data.map}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3a3f4b] bg-[#181c24] px-2.5 py-1 text-[11px] font-bender-bold uppercase tracking-[0.08em] text-[#b6c2e2]">
                              <UserIcon size={12} weight="bold" />
                              {server.data.players.length}
                            </span>
                          </div>
                          <div className="mt-3 truncate text-[12px] text-[#9aa6c3]">
                            {server.server_ip}
                          </div>
                        </div>

                        <div
                          className={cn(
                            "shrink-0 rounded-full px-3 py-1 text-[11px] font-bender-bold uppercase tracking-[0.12em]",
                            isSelected
                              ? "bg-[#ffd166] text-[#23293a]"
                              : "bg-[#181c24] text-[#b6c2e2]",
                          )}
                        >
                          {isSelected ? "Selected" : "Choose"}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </SimpleBar>
        </div>
      </div>
    </Card>
  );
}
