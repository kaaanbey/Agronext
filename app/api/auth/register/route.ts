import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { registerSchema } from "@/lib/validations/auth"

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            tr: "Geçersiz kayıt bilgileri.",
            en: "Invalid registration data.",
            fields: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data
    const normalizedEmail = email.toLowerCase()

    const existing = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    })
    if (existing) {
      return NextResponse.json(
        {
          error: {
            tr: "Bu e-posta zaten kullanılıyor.",
            en: "This email is already in use.",
          },
        },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await db.insert(users).values({
      name,
      email: normalizedEmail,
      passwordHash,
      provider: "credentials",
      role: "farmer",
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[api/auth/register]", err)

    const pgCode =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: unknown }).code)
        : err &&
            typeof err === "object" &&
            "cause" in err &&
            err.cause &&
            typeof err.cause === "object" &&
            "code" in err.cause
          ? String((err.cause as { code: unknown }).code)
          : undefined

    if (pgCode === "23505") {
      return NextResponse.json(
        {
          error: {
            tr: "Bu e-posta zaten kullanılıyor.",
            en: "This email is already in use.",
          },
        },
        { status: 409 }
      )
    }

    const msg =
      err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase()
    if (
      msg.includes("does not exist") ||
      msg.includes("relation") ||
      msg.includes("42p01")
    ) {
      return NextResponse.json(
        {
          error: {
            tr: "Veritabanı tabloları eksik. Neon’da migration (drizzle) çalıştırın.",
            en: "Database tables are missing. Run Drizzle migrations against Neon.",
          },
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: {
          tr: "Sunucu hatası.",
          en: "Server error.",
        },
      },
      { status: 500 }
    )
  }
}
