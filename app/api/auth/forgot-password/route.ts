import { NextResponse } from "next/server"
import { forgotPasswordSchema } from "@/lib/validations/auth"

// Stub: password reset email flow. Real implementation would:
// 1) Generate a one-time token, persist in verification_tokens with expiry.
// 2) Send email via provider (Resend/Postmark/SES).
// 3) Expose /api/auth/reset-password endpoint to consume token.
export async function POST(req: Request) {
  try {
    const body: unknown = await req.json()
    const parsed = forgotPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            tr: "Geçersiz e-posta.",
            en: "Invalid email.",
          },
        },
        { status: 400 }
      )
    }
    return NextResponse.json({ ok: true })
  } catch {
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
