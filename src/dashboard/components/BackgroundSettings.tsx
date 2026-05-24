import { produce } from "immer";
import { useSettings } from "~/state/dashboard";
import { cn } from "~/dashboard/utils/ui";
import { dashboardFieldLabelClassName } from "./constants";
import Card from "./Card";

export function BackgroundSettings() {
  const [settings, setSettings] = useSettings();

  const hasBackgroundMedia = settings.backgroundUrl.trim().length > 0;
  const backgroundIsVideo = /\.(webm|mp4)(\?|$)/i.test(settings.backgroundUrl);

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload-background", {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as { url: string };
    setSettings(
      produce((settings) => {
        settings.backgroundUrl = data.url;
      }),
    );
  };

  const removeBackground = () => {
    setSettings(
      produce((settings) => {
        settings.backgroundUrl = "";
      }),
    );
  };

  const changeBackgroundColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(
      produce((settings) => {
        settings.backgroundColor = e.target.value;
      }),
    );
  };

  const changeBackgroundOpacity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(
      produce((settings) => {
        settings.backgroundOpacity = Number(e.target.value);
      }),
    );
  };

  const changeBackgroundBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(
      produce((settings) => {
        settings.backgroundBlur = Number(e.target.value);
      }),
    );
  };

  return (
    <Card title="Background">
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-[#b6c2e2] md:text-[15px]">
          Use a solid color by itself, or upload an image or video to unlock blur and opacity controls.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(290px,0.9fr)]">
          <section className="rounded-2xl border border-[#3a3f4b] bg-[#181c24]/45 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-[12px] font-bender-bold uppercase tracking-[0.18em] text-[#b6c2e2]">
                  Preview
                </div>
                <div className="mt-1 text-xl font-bender-bold text-white md:text-[32px]">
                  Background Output
                </div>
              </div>
              <div
                className={cn(
                  "rounded-full border text-center px-3 py-1 text-[12px] font-bender-bold uppercase tracking-[0.14em]",
                  hasBackgroundMedia
                    ? "border-[#3a7bd5]/35 bg-[#3a7bd5]/12 text-[#ffd166]"
                    : "border-[#ffd166]/35 bg-[#ffd166]/12 text-[#ffd166]",
                )}
              >
                {hasBackgroundMedia ? "Media Active" : "Color Only"}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#3a3f4b] bg-[#181c24] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div
                className="relative aspect-video w-full overflow-hidden"
                style={{
                  backgroundColor: hasBackgroundMedia ? undefined : settings.backgroundColor,
                }}
              >
                {hasBackgroundMedia && (
                  <div
                    className="absolute inset-0"
                    style={{
                      opacity: settings.backgroundOpacity / 100,
                      filter: `blur(${settings.backgroundBlur}px)`,
                    }}
                  >
                    {backgroundIsVideo ? (
                      <video
                        src={settings.backgroundUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={settings.backgroundUrl}
                        alt="Background preview"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 text-[12px] leading-5 text-[#b6c2e2] md:text-[13px]">
              For best quality, upload media at the same resolution as your stream output.
            </div>
          </section>

          <section className="rounded-2xl border border-[#3a3f4b] bg-[#181c24]/45 p-4">
            <div className="space-y-4">
              <div>
                <label className={dashboardFieldLabelClassName}>Color</label>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-3 transition",
                    hasBackgroundMedia
                      ? "border-[#303647] bg-[#181c24]/60 opacity-45"
                      : "border-[#3a3f4b] bg-[#181c24]",
                  )}
                >
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={changeBackgroundColor}
                    disabled={hasBackgroundMedia}
                    className={cn(
                      "h-11 w-11 rounded-lg border-0 bg-transparent p-0",
                      hasBackgroundMedia ? "cursor-not-allowed" : "cursor-pointer",
                    )}
                  />
                  <div className="min-w-0">
                    <div className="text-[12px] font-bender-bold uppercase tracking-[0.16em] text-[#b6c2e2]">
                      Fill Color
                    </div>
                    <div className="mt-1 font-mono text-[14px] text-white">
                      {settings.backgroundColor}
                    </div>
                    <div className="mt-1 text-[12px] leading-4 text-[#b6c2e2]">
                      {hasBackgroundMedia
                        ? "Disabled while media is active."
                        : "Used only when no media is uploaded."}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className={dashboardFieldLabelClassName}>Media</label>
                  <span className="text-[12px] text-[#b6c2e2]">Image or video</span>
                </div>

                <div className="rounded-2xl border border-[#3a3f4b] bg-[#202635] p-3">
                  <input
                    id="background-media"
                    type="file"
                    accept="image/*,video/webm,video/mp4"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col gap-3">
                    <p className="text-[13px] leading-6 text-[#b6c2e2]">
                      Upload an image or looping video. It will use the same full-screen crop behavior as the live overlay.
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <label
                        htmlFor="background-media"
                        className="inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center rounded-xl bg-[#3a7bd5] px-4 py-2.5 text-center text-[13px] font-bender-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#2851a3]"
                      >
                        Upload Media
                      </label>
                      <button
                        type="button"
                        onClick={removeBackground}
                        disabled={!hasBackgroundMedia}
                        className={cn(
                          "inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2.5 text-center text-[13px] font-bender-bold uppercase tracking-[0.08em] transition",
                          hasBackgroundMedia
                            ? "bg-[#d32f2f] text-white hover:bg-[#b72828]"
                            : "cursor-default bg-[#2a3143] text-[#68748f]",
                        )}
                      >
                        Remove Media
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div
                  className={cn(
                    "rounded-2xl border p-3 transition",
                    hasBackgroundMedia
                      ? "border-[#3a3f4b] bg-[#181c24]"
                      : "border-[#303647] bg-[#181c24]/50 opacity-50",
                  )}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label className="text-[14px] font-bender-bold uppercase tracking-[0.08em] text-[#ffd166]">
                      Opacity
                    </label>
                    <span className="text-[13px] text-white">{settings.backgroundOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={settings.backgroundOpacity}
                    onChange={changeBackgroundOpacity}
                    disabled={!hasBackgroundMedia}
                    className="w-full accent-[#3a7bd5]"
                  />
                </div>

                <div
                  className={cn(
                    "rounded-2xl border p-3 transition",
                    hasBackgroundMedia
                      ? "border-[#3a3f4b] bg-[#181c24]"
                      : "border-[#303647] bg-[#181c24]/50 opacity-50",
                  )}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label className="text-[14px] font-bender-bold uppercase tracking-[0.08em] text-[#ffd166]">
                      Blur
                    </label>
                    <span className="text-[13px] text-white">{settings.backgroundBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={settings.backgroundBlur}
                    onChange={changeBackgroundBlur}
                    disabled={!hasBackgroundMedia}
                    className="w-full accent-[#3a7bd5]"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Card>
  );
}
