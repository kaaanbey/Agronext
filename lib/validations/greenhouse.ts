import { z } from "zod"

export const greenhouseSchema = z.object({
  name: z.string().min(2).max(80),
  location: z.string().max(120).optional().nullable(),
  areaM2: z
    .number()
    .positive()
    .max(1_000_000)
    .optional()
    .nullable(),
})

export type GreenhouseInput = z.infer<typeof greenhouseSchema>
