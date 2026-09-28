/**
 * External read-only database schema.
 *
 * This file intentionally starts empty — the external database belongs to a
 * second site and its tables are not known yet.
 *
 * Workflow:
 *   1. Set `EXTERNAL_DATABASE_URL` in `.env.local` (and Vercel env vars).
 *   2. Run `npm run db:external:introspect` to print the list of tables and
 *      their columns from `information_schema`.
 *   3. Add `pgTable(...)` definitions below for the tables you need to read.
 *
 * IMPORTANT: This schema is used by `externalDb` for READ-ONLY access.
 * Never perform INSERT / UPDATE / DELETE through `externalDb`.
 *
 * Example (fill in real column types after introspection):
 *
 * import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
 *
 * export const profiles = pgTable("profiles", {
 *   id: text("id").primaryKey(),
 *   email: text("email"),
 *   createdAt: timestamp("created_at", { withTimezone: true }),
 * })
 */

export {}
