import z from "zod";
import { screenNameSchema } from "./screens";

export const playerSourceSchema = z.enum(["steam", "no_steam"]);
export type PlayerSource = z.infer<typeof playerSourceSchema>;

const rawPlayerSchema = z.object({
  id: z.string().optional(),
  source: playerSourceSchema.optional(),
  steamID: z.string(),
  flagCode: z.string().optional(),
  playerName: z.string(),
  avatarUrl: z.string().optional(),
});

export const playerSchema = rawPlayerSchema.transform((player) => ({
  id: player.id ?? crypto.randomUUID(),
  source:
    player.source ??
    (player.steamID.trim().toUpperCase() === "NO_STEAM" ? "no_steam" : "steam"),
  steamID: player.steamID,
  flagCode: player.flagCode,
  playerName: player.playerName,
  avatarUrl: player.avatarUrl ?? "",
}));

export type Player = z.infer<typeof playerSchema>;

export const teamSettingsSchema = z.object({
  name: z.string(),
  model: z.string(),
  points: z.number().min(0),
  players: z.array(playerSchema),
});
export type TeamSettings = z.infer<typeof teamSettingsSchema>;

export const settingsSchema = z.object({
  websocketURL: z.string(),
  selectedServer: z.string().optional(),
  activeScreen: screenNameSchema,
  previousScreen: screenNameSchema.optional(),
  bestOfPoints: z.number().min(1).max(15),
  round: z.string(),
  tournamentName: z.string(),
  backgroundUrl: z.string(),
  backgroundColor: z.string(),
  backgroundOpacity: z.number().min(0).max(100),
  backgroundBlur: z.number().min(0).max(50),
  leftTeamSettings: teamSettingsSchema,
  rightTeamSettings: teamSettingsSchema,
  leftTeamLogoUrl: z.string(),
  rightTeamLogoUrl: z.string(),
});

export type DashboardSettings = z.infer<typeof settingsSchema>;

export const dashboardMessageSchema = z
  .object({
    type: z.literal("SETTINGS"),
    settings: settingsSchema,
  })
  .or(
    z.object({
      type: z.literal("HELLO"),
      gitCommit: z.string().optional(),
    }),
  );

export type DashboardMessage = z.infer<typeof dashboardMessageSchema>;
