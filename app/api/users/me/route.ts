import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { profileUpdateSchema } from "@/lib/validations/profile"
import { changePasswordSchema } from "@/lib/validations/auth"

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { tr: "Yetkisiz.", en: "Unauthorized." } },
        { status: 401 }
      )
    }

    const body: unknown = await req.json()
    const parsed = profileUpdateSchema.safeParse(body)
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

    await db
      .update(users)
      .set({ name: parsed.data.name })
      .where(eq(users.id, session.user.id))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: { tr: "Sunucu hatası.", en: "Server error." } },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { tr: "Yetkisiz.", en: "Unauthorized." } },
        { status: 401 }
      )
    }

    const body: unknown = await req.json()
    const parsed = changePasswordSchema.safeParse(body)
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

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    })
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        {
          error: {
            tr: "Bu hesap için şifre değiştirme uygulanmıyor.",
            en: "Password change is not applicable for this account.",
          },
        },
        { status: 400 }
      )
    }

    const matches = await bcrypt.compare(
      parsed.data.currentPassword,
      user.passwordHash
    )
    if (!matches) {
      return NextResponse.json(
        {
          error: {
            tr: "Mevcut şifre hatalı.",
            en: "Current password is incorrect.",
          },
        },
        { status: 400 }
      )
    }

    const newHash = await bcrypt.hash(parsed.data.newPassword, 10)
    await db
      .update(users)
      .set({ passwordHash: newHash })
      .where(eq(users.id, session.user.id))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: { tr: "Sunucu hatası.", en: "Server error." } },
      { status: 500 }
    )
  }
}
