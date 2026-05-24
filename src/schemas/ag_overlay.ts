import z from "zod";

const agOverlayPlayerSchema = z.object({
  steamid: z.string(),
  ammo: z.number(),
  clip: z.number(),
  deaths: z.number(),
  frags: z.number(),
  health: z.number(),
  hev: z.number(),
  name: z.string(),
  team: z.string(),
  weapon: z.string(),
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export type AgOverlayPlayer = z.infer<typeof agOverlayPlayerSchema>;

const agOverlayServerDataSchema = z
  .object({
    effective_time: z.number(),
    hostname: z.string(),
    players: z.array(agOverlayPlayerSchema),
    timelimit: z.number(),
    map: z.string(),
  })
  .transform((data) => ({
    ...data,
    remaining_time: data.timelimit - data.effective_time,
  }));

export type AgOverlayServerData = z.infer<typeof agOverlayServerDataSchema>;

export const agOverlayResponseSchema = z.object({
  server_ip: z.string(),
  data: agOverlayServerDataSchema,
});

export type AgOverlayData = z.infer<typeof agOverlayResponseSchema>;
