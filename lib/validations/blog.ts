import { z } from "zod"

export const blogPostSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "slug must be kebab-case a-z0-9"),
  titleTr: z.string().min(3).max(200),
  titleEn: z.string().min(3).max(200),
  excerptTr: z.string().max(400).optional().nullable(),
  excerptEn: z.string().max(400).optional().nullable(),
  bodyTr: z.string().min(20),
  bodyEn: z.string().min(20),
  coverImage: z.string().url().optional().nullable(),
  published: z.boolean().default(false),
})

export type BlogPostInput = z.infer<typeof blogPostSchema>
