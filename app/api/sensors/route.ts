import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { getLatestReadings } from "@/lib/dashboard/data"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: { tr: "Yetkisiz erişim.", en: "Unauthorized." } },
        { status: 401 }
      )
    }

    const url = new URL(req.url)
    const limitParam = url.searchParams.get("limit")
    const limit = Math.min(Math.max(Number(limitParam) || 10, 1), 100)

    const { readings, greenhousesById } = await getLatestReadings(
      session.user.id,
      limit
    )

    return NextResponse.json({
      data: readings.map((r) => ({
        ...r,
        greenhouseName: greenhousesById.get(r.greenhouseId) ?? null,
      })),
    })
  } catch {
    return NextResponse.json(
      { error: { tr: "Sunucu hatası.", en: "Server error." } },
      { status: 500 }
    )
  }
}
