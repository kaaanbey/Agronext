import { NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { blogPosts } from "@/lib/db/schema"
import { blogPostSchema } from "@/lib/validations/blog"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: { tr: "Yetkisiz.", en: "Unauthorized." } },
        { status: 403 }
      )
    }
    const data = await db.query.blogPosts.findMany({
      orderBy: [desc(blogPosts.updatedAt)],
    })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json(
      { error: { tr: "Sunucu hatası.", en: "Server error." } },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: { tr: "Yetkisiz.", en: "Unauthorized." } },
        { status: 403 }
      )
    }

    const body: unknown = await req.json()
    const parsed = blogPostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            tr: "Geçersiz veri.",
            en: "Invalid data.",
            fields: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      )
    }

    const existing = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.slug, parsed.data.slug),
    })
    if (existing) {
      return NextResponse.json(
        {
          error: {
            tr: "Bu slug kullanımda.",
            en: "This slug is already in use.",
          },
        },
        { status: 409 }
      )
    }

    const [row] = await db
      .insert(blogPosts)
      .values({
        authorId: session.user.id,
        slug: parsed.data.slug,
        titleTr: parsed.data.titleTr,
        titleEn: parsed.data.titleEn,
        excerptTr: parsed.data.excerptTr ?? null,
        excerptEn: parsed.data.excerptEn ?? null,
        bodyTr: parsed.data.bodyTr,
        bodyEn: parsed.data.bodyEn,
        coverImage: parsed.data.coverImage ?? null,
        published: parsed.data.published,
      })
      .returning()

    return NextResponse.json({ data: row })
  } catch {
    return NextResponse.json(
      { error: { tr: "Sunucu hatası.", en: "Server error." } },
      { status: 500 }
    )
  }
}
