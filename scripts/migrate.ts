// Vercel build'inde, `next build`'den önce çalışır (vercel.json → buildCommand).
// drizzle/ klasöründeki migration'lardan henüz uygulanmamış olanları veritabanına
// uygular; uygulanmış olanları atlar (drizzle kendi tablosunda iz tutar). Bu yüzden
// her deploy'da güvenle çalışır, var olan veriye dokunmaz.
// DATABASE_URL yoksa (ör. veritabanı bağlanmamış bir önizleme) sessizce geçer.
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { migrate } from "drizzle-orm/neon-http/migrator"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.log("[migrate] DATABASE_URL yok, atlandı.")
    return
  }
  await migrate(drizzle(neon(url)), { migrationsFolder: "./drizzle" })
  console.log("[migrate] veritabanı güncel.")
}

main().catch((err) => {
  console.error("[migrate] başarısız:", err)
  process.exit(1)
})
