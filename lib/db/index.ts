import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

// DATABASE_URL yoksa modül açılışta hata vermez: böylece site (tanıtım sayfaları,
// /panel) veritabanı bağlanmadan da derlenir ve yayına çıkar. Bağlantı yalnız bir
// sorgu çalıştığında kurulur; adres yoksa o sorgu hata verir (blog boş görünür).
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn("DATABASE_URL tanımlı değil: blog, iletişim formu ve site girişi çalışmaz.")
}

const sql = neon(connectionString ?? "postgresql://tanimsiz:tanimsiz@localhost/tanimsiz")

export const db = drizzle(sql, { schema })

export { schema }
