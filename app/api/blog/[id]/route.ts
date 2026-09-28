import { NextResponse } from "next/server"
import { and, eq, ne } from "drizzle-orm"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { blogPosts } from "@/lib/db/schema"
import { blogPostSchema } from "@/lib/validations/blog"

interface Params {
  params: { id: string }
}

export async function PATCH(req: Request, { params }: Params) {
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

    const slugClash = await db.query.blogPosts.findFirst({
      where: and(eq(blogPosts.slug, parsed.data.slug), ne(blogPosts.id, params.id)),
    })
    if (slugClash) {
      return NextResponse.json(
        {
          error: {
            tr: "Bu slug başka bir yazıda kullanılıyor.",
            en: "This slug is used by another post.",
          },
        },
        { status: 409 }
      )
    }

    const [row] = await db
      .update(blogPosts)
      .set({
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
      .where(eq(blogPosts.id, params.id))
      .returning()

    if (!row) {
      return NextResponse.json(
        { error: { tr: "Bulunamadı.", en: "Not found." } },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: row })
  } catch {
    return NextResponse.json(
      { error: { tr: "Sunucu hatası.", en: "Server error." } },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: { tr: "Yetkisiz.", en: "Unauthorized." } },
        { status: 403 }
      )
    }

    await db.delete(blogPosts).where(eq(blogPosts.id, params.id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: { tr: "Sunucu hatası.", en: "Server error." } },
      { status: 500 }
    )
  }
}
