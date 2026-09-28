import { z } from "zod"

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(80),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
