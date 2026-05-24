export type TeamSide = "left" | "right";

export type PlayerDraft = {
  mode: "steam" | "no_steam";
  steamInput: string;
  steamID: string;
  flagCode: string;
  playerName: string;
  avatarUrl: string;
  resolving: boolean;
  error: string;
};

export const dashboardFieldLabelClassName =
  "mb-2 block text-[13px] font-bender-bold uppercase tracking-[0.08em] text-[#ffd166]";

export const dashboardInputClassName =
  "w-full rounded-xl border border-[#3a3f4b] bg-[#181c24] px-4 py-3 text-[15px] text-white outline-none transition placeholder:text-[#7481a1] focus:border-[#3a7bd5] focus:ring-2 focus:ring-[#3a7bd5]/25";

export const teamPanelClassName =
  "rounded-2xl border border-[#3a3f4b] bg-[#181c24]/45 p-4 md:p-5";
