import { z } from "zod"

export const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  subject: z.string().min(3).max(120),
  message: z.string().min(10).max(2000),
})

export type ContactInput = z.infer<typeof contactSchema>
