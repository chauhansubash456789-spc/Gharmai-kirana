import { z } from "zod";

export const zoneSchema = z.object({
  name: z.string().min(2),
  charge: z.coerce.number().min(0),
  minOrderForFree: z.coerce.number().min(0),
});

export type ZoneInput = z.infer<typeof zoneSchema>;