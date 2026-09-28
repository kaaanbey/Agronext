import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { contactMessages } from "@/lib/db/schema"
import { contactSchema } from "@/lib/validations/contact"

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json()
    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            tr: "Formdaki bilgiler geçersiz.",
            en: "The form contains invalid data.",
            fields: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      )
    }

    await db.insert(contactMessages).values(parsed.data)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      {
        error: {
          tr: "Sunucu hatası. Lütfen daha sonra tekrar deneyin.",
          en: "Server error. Please try again later.",
        },
      },
      { status: 500 }
    )
  }
}
