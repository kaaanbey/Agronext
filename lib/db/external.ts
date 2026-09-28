import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as externalSchema from "./external-schema"

/**
 * Read-only Drizzle client for the second site's PostgreSQL database.
 *
 * Usage:
 *   import { externalDb } from "@/lib/db/external"
 *   const rows = await externalDb.execute(sql`SELECT ... FROM ...`)
 *
 * Never call INSERT / UPDATE / DELETE through this client.
 *
 * The schema is defined in `lib/db/external-schema.ts`. Run
 * `npm run db:external:introspect` to inspect the available tables first.
 */
const connectionString = process.env.EXTERNAL_DATABASE_URL

if (!connectionString) {
  throw new Error(
    "EXTERNAL_DATABASE_URL is not set. Add it to your .env.local and Vercel environment variables."
  )
}

const externalSql = neon(connectionString)

export const externalDb = drizzle(externalSql, { schema: externalSchema })
export { externalSchema }
