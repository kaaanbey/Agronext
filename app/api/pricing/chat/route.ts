import { NextResponse } from "next/server"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { chatSchema } from "@/lib/validations/chat"

const DORMANT_REPLIES = {
  tr: "Bu özellik yakında aktif olacak.",
  en: "This feature will be available soon.",
}

const SYSTEM_PROMPT = `You are the AgroNext pricing assistant. AgroNext helps Turkish greenhouse operators digitize their greenhouses with IoT sensors and AI.

There are three plans:
- Starter: for small greenhouses (up to ~200m²), basic sensors and dashboard.
- Growth: for mid-size operations (up to ~1000m²), more sensors, AI insights, alerts.
- Enterprise: for large/commercial operations, unlimited sensors, custom integrations, dedicated support.

Help the user choose the best plan based on their greenhouse size, crop, and needs. Be concise and friendly. Respond in the same language as the user (Turkish or English).`

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json()
    const parsed = chatSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: { tr: "Geçersiz istek", en: "Invalid request" } },
        { status: 400 }
      )
    }

    const enabled = process.env.ENABLE_PRICING_AI === "true"
    const locale = req.headers.get("accept-language")?.startsWith("en")
      ? "en"
      : "tr"

    if (!enabled || !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ reply: DORMANT_REPLIES[locale] })
    }

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      system: SYSTEM_PROMPT,
      prompt: parsed.data.message,
    })

    return NextResponse.json({ reply: text })
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
