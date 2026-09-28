import "dotenv/config"
import { neon } from "@neondatabase/serverless"

type TableRow = { table_schema: string; table_name: string }
type ColumnRow = {
  table_schema: string
  table_name: string
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
}

async function main(): Promise<void> {
  const url = process.env.EXTERNAL_DATABASE_URL
  if (!url) {
    console.error("EXTERNAL_DATABASE_URL is not set in .env.local")
    process.exit(1)
  }

  const sql = neon(url)

  const tables = (await sql`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_type = 'BASE TABLE'
      AND table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name
  `) as unknown as TableRow[]

  if (tables.length === 0) {
    console.log("No user tables found in the external database.")
    return
  }

  console.log(`\nFound ${tables.length} table(s) in external database:\n`)

  for (const t of tables) {
    const columns = (await sql`
      SELECT table_schema, table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = ${t.table_schema} AND table_name = ${t.table_name}
      ORDER BY ordinal_position
    `) as unknown as ColumnRow[]

    console.log(`- ${t.table_schema}.${t.table_name}`)
    for (const c of columns) {
      const nullable = c.is_nullable === "YES" ? "NULL" : "NOT NULL"
      const def = c.column_default ? ` DEFAULT ${c.column_default}` : ""
      console.log(`    ${c.column_name}  ${c.data_type}  ${nullable}${def}`)
    }
    console.log("")
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
