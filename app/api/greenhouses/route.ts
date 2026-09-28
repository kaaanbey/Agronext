import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { greenhouses } from "@/lib/db/schema"
import { greenhouseSchema } from "@/lib/validations/greenhouse"
import { getUserGreenhouses } from "@/lib/dashboard/data"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { tr: "Yetkisiz erişim.", en: "Unauthorized." } },
        { status: 401 }
      )
    }
    const data = await getUserGreenhouses(session.user.id)
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
    if (!session?.user) {
      return NextResponse.json(
        { error: { tr: "Yetkisiz erişim.", en: "Unauthorized." } },
        { status: 401 }
      )
    }

    const body: unknown = await req.json()
    const parsed = greenhouseSchema.safeParse(body)
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

    const [row] = await db
      .insert(greenhouses)
      .values({
        userId: session.user.id,
        name: parsed.data.name,
        location: parsed.data.location ?? null,
        areaM2: parsed.data.areaM2 ?? null,
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
