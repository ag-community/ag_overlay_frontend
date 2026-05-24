import z from "zod";

export const overviewLayerSchema = z.object({
  image: z.string(),
  height: z.number(),
});

export const overviewDataSchema = z.object({
  zoom: z.number(),
  origin: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  rotated: z.number(),
  imageWidth: z.number(),
  imageHeight: z.number(),
  layers: z.array(overviewLayerSchema),
});

export type OverviewData = z.infer<typeof overviewDataSchema>;
