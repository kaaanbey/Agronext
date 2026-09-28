import { and, desc, eq, gte, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { greenhouses, sensorReadings } from "@/lib/db/schema"

export async function getUserGreenhouses(userId: string) {
  return db.query.greenhouses.findMany({
    where: eq(greenhouses.userId, userId),
    orderBy: [desc(greenhouses.createdAt)],
  })
}

export async function getLatestReadings(userId: string, limit = 10) {
  const userGreenhouses = await db.query.greenhouses.findMany({
    where: eq(greenhouses.userId, userId),
    columns: { id: true, name: true },
  })
  const ids = userGreenhouses.map((g) => g.id)
  if (ids.length === 0)
    return { readings: [], greenhousesById: new Map<string, string>() }

  const rows = await db.query.sensorReadings.findMany({
    where: inArray(sensorReadings.greenhouseId, ids),
    orderBy: [desc(sensorReadings.recordedAt)],
    limit,
  })
  const greenhousesById = new Map(userGreenhouses.map((g) => [g.id, g.name]))
  return { readings: rows, greenhousesById }
}

export async function getWeeklyReadings(userId: string) {
  const userGreenhouses = await db.query.greenhouses.findMany({
    where: eq(greenhouses.userId, userId),
    columns: { id: true },
  })
  const ids = userGreenhouses.map((g) => g.id)
  if (ids.length === 0) return []

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  return db.query.sensorReadings.findMany({
    where: and(
      inArray(sensorReadings.greenhouseId, ids),
      gte(sensorReadings.recordedAt, sevenDaysAgo)
    ),
    orderBy: [sensorReadings.recordedAt],
  })
}

export async function getGreenhouseReadings(
  userId: string,
  greenhouseId: string,
  limit = 50
) {
  const gh = await db.query.greenhouses.findFirst({
    where: and(
      eq(greenhouses.id, greenhouseId),
      eq(greenhouses.userId, userId)
    ),
  })
  if (!gh) return null

  const readings = await db.query.sensorReadings.findMany({
    where: eq(sensorReadings.greenhouseId, greenhouseId),
    orderBy: [desc(sensorReadings.recordedAt)],
    limit,
  })
  return { greenhouse: gh, readings }
}
