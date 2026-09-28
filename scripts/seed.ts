import "dotenv/config"
import bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "../lib/db/schema"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL is not set")
}

const sql = neon(connectionString)
const db = drizzle(sql, { schema })

// deterministic pseudo-random for reproducible seed data
function makeRng(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0xffffffff
  }
}

function generateReadings(greenhouseId: string, seed: number) {
  const rng = makeRng(seed)
  const now = new Date()
  const points: schema.NewSensorReading[] = []
  for (let hoursAgo = 24 * 7; hoursAgo >= 0; hoursAgo--) {
    const recordedAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)
    const hourOfDay = recordedAt.getHours()
    const dayPhase = Math.sin((hourOfDay / 24) * Math.PI * 2 - Math.PI / 2)

    const baseTemp = 24 + dayPhase * 4
    const baseHumidity = 62 - dayPhase * 10
    const baseLight = Math.max(0, dayPhase * 45000 + 5000)
    const baseCo2 = 520 - dayPhase * 80

    points.push({
      greenhouseId,
      recordedAt,
      temperature: round(baseTemp + (rng() - 0.5) * 2.5),
      humidity: clamp(round(baseHumidity + (rng() - 0.5) * 8), 30, 90),
      soilMoisture: clamp(round(52 + (rng() - 0.5) * 12), 20, 85),
      lightLux: round(baseLight * (0.85 + rng() * 0.3)),
      co2Ppm: round(baseCo2 + (rng() - 0.5) * 60),
    })
  }
  return points
}

function round(v: number) {
  return Math.round(v * 10) / 10
}
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

async function main() {
  console.log("Seeding database...")

  console.log("- Cleaning existing seed data")
  await db.delete(schema.sensorReadings)
  await db.delete(schema.greenhouses)
  await db.delete(schema.blogPosts)
  await db.delete(schema.pricingPlans)
  await db.delete(schema.contactMessages)
  await db.delete(schema.accounts)
  await db.delete(schema.sessions)
  await db.delete(schema.users)

  console.log("- Inserting users")
  const adminHash = await bcrypt.hash("admin1234", 10)
  const farmerHash = await bcrypt.hash("farmer1234", 10)

  const [admin] = await db
    .insert(schema.users)
    .values({
      email: "admin@agronext.com",
      name: "AgroNext Admin",
      role: "admin",
      passwordHash: adminHash,
      provider: "credentials",
    })
    .returning()

  if (!admin) throw new Error("admin insert failed")

  const [mehmet] = await db
    .insert(schema.users)
    .values({
      email: "mehmet@example.com",
      name: "Mehmet Kara",
      role: "farmer",
      passwordHash: farmerHash,
      provider: "credentials",
    })
    .returning()

  const [ayse] = await db
    .insert(schema.users)
    .values({
      email: "ayse@example.com",
      name: "Ayşe Demir",
      role: "farmer",
      passwordHash: farmerHash,
      provider: "credentials",
    })
    .returning()

  if (!mehmet || !ayse) throw new Error("farmer insert failed")

  console.log("- Inserting greenhouses")
  const [gh1] = await db
    .insert(schema.greenhouses)
    .values({
      userId: mehmet.id,
      name: "Antalya Merkez Sera",
      location: "Antalya, Kumluca",
      areaM2: 1200,
    })
    .returning()

  const [gh2] = await db
    .insert(schema.greenhouses)
    .values({
      userId: mehmet.id,
      name: "Antalya Batı Sera",
      location: "Antalya, Finike",
      areaM2: 800,
    })
    .returning()

  const [gh3] = await db
    .insert(schema.greenhouses)
    .values({
      userId: ayse.id,
      name: "İzmir Ege Sera",
      location: "İzmir, Menemen",
      areaM2: 1500,
    })
    .returning()

  if (!gh1 || !gh2 || !gh3) throw new Error("greenhouse insert failed")

  console.log("- Inserting sensor readings (7 days hourly per greenhouse)")
  const readings = [
    ...generateReadings(gh1.id, 101),
    ...generateReadings(gh2.id, 202),
    ...generateReadings(gh3.id, 303),
  ]
  // Insert in chunks to avoid oversize payloads
  for (let i = 0; i < readings.length; i += 200) {
    await db.insert(schema.sensorReadings).values(readings.slice(i, i + 200))
  }

  // Pricing plans are now served from lib/data/pricing.ts (static, DB-free).
  // The pricingPlans table remains in the schema as dormant for future use.

  console.log("- Inserting blog posts")
  await db.insert(schema.blogPosts).values([
    {
      authorId: admin.id,
      slug: "serada-yapay-zeka-donemi",
      titleTr: "Serada yapay zeka dönemi başlıyor",
      titleEn: "The AI era begins in the greenhouse",
      excerptTr:
        "AgroNext AI modülü, sensör verilerini yorumlayarak üreticiye gerçek zamanlı öneriler sunuyor.",
      excerptEn:
        "The AgroNext AI module interprets sensor data and delivers real-time recommendations to growers.",
      bodyTr:
        "Serada yapay zeka uygulamaları artık sadece büyük üreticilerin değil, orta ölçekli çiftçilerin de erişebildiği bir teknoloji.\n\nAgroNext platformu, sensörlerinizden aldığı verileri Türkiye iklimine uygun olarak eğitilmiş modellerle işler. Sıcaklık, nem ve toprak nemi değerlerine göre sulama ve havalandırma önerileri otomatik üretilir.\n\nSistem düşük maliyetli sensörlerle uyumludur; bu da tarıma erişimi demokratikleştirir.",
      bodyEn:
        "Greenhouse AI is no longer only for large growers — mid-sized farms can now tap into the same technology.\n\nAgroNext processes your sensor data using models trained for the Turkish climate. Based on temperature, humidity, and soil moisture, irrigation and ventilation recommendations are generated automatically.\n\nThe system works with low-cost sensors, which democratizes access.",
      coverImage:
        "https://images.unsplash.com/photo-1562075219-2e2a3ee88d13?w=1200",
      published: true,
    },
    {
      authorId: admin.id,
      slug: "su-tasarrufu-icin-5-ipucu",
      titleTr: "Serada su tasarrufu için 5 ipucu",
      titleEn: "5 tips for saving water in your greenhouse",
      excerptTr:
        "Doğru sulama zamanlaması ve sensör kullanımı ile su tüketiminizi %40'a kadar azaltabilirsiniz.",
      excerptEn:
        "With proper irrigation timing and sensor usage, you can cut water use by up to 40%.",
      bodyTr:
        "Türkiye giderek kuraklaşırken, seralarda su yönetimi her zamankinden kritik.\n\n1. Toprak nemi sensörü kullanın — yapraklara göre değil, toprağa göre sulama yapın.\n2. Damla sulama sistemini tercih edin.\n3. Sabah erken saatlerde sulayın, buharlaşmayı azaltın.\n4. Yağmur suyu toplayın.\n5. AI tabanlı sulama planlayıcıları kullanın.",
      bodyEn:
        "As Turkey becomes drier, water management in greenhouses is more critical than ever.\n\n1. Use a soil moisture sensor — irrigate by soil, not by leaves.\n2. Prefer drip irrigation.\n3. Water early in the morning to reduce evaporation.\n4. Collect rainwater.\n5. Use AI-driven irrigation planners.",
      coverImage:
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200",
      published: true,
    },
    {
      authorId: admin.id,
      slug: "biyopestisit-nedir",
      titleTr: "Biyopestisit nedir, nasıl kullanılır?",
      titleEn: "What is a biopesticide and how is it used?",
      excerptTr:
        "Biyopestisitler kimyasal ilaçlara güvenli bir alternatif sunuyor. İşte bilmeniz gerekenler.",
      excerptEn:
        "Biopesticides are a safe alternative to chemical pesticides. Here's what you should know.",
      bodyTr:
        "Biyopestisitler canlı organizmalardan veya doğal maddelerden elde edilen zararlı kontrol ürünleridir.\n\nBu ürünler:\n- Kimyasal kalıntı bırakmaz.\n- Faydalı böceklere zarar vermez.\n- Organik sertifikasyon ile uyumludur.\n\nAgroNext, zararlı tespitinde sera içi görseller ve sensör verilerini birleştirerek doğru biyopestisit önerisinde bulunur.",
      bodyEn:
        "Biopesticides are pest-control products derived from living organisms or natural substances.\n\nThese products:\n- Leave no chemical residues.\n- Are safe for beneficial insects.\n- Are compatible with organic certification.\n\nAgroNext combines greenhouse imagery and sensor data to suggest the right biopesticide.",
      coverImage:
        "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200",
      published: true,
    },
    {
      authorId: admin.id,
      slug: "sera-kurulumu-rehberi",
      titleTr: "Sıfırdan sera kurulumu: pratik rehber",
      titleEn: "Setting up a greenhouse from scratch: a practical guide",
      excerptTr:
        "Yeni başlayanlar için konum seçiminden ilk sensör kurulumuna uçtan uca rehber.",
      excerptEn:
        "From site selection to first sensor setup — a beginner-friendly guide.",
      bodyTr:
        "Sera kurulumu planlama gerektirir. Bu rehberde aşamaları ele alıyoruz:\n\nKonum: Güneş alan, rüzgardan korunan ve su kaynağına yakın alanlar tercih edin.\nYapı: Galvanizli çelik iskelet + çift kat polikarbon tercih edilir.\nSulama: Damla sulama sistemi mutlak.\nİzleme: İlk günden bir AgroNext sensör seti ile başlayın.",
      bodyEn:
        "Building a greenhouse takes planning. In this guide we cover the phases:\n\nSite: Pick a sunny, wind-sheltered spot near a water source.\nStructure: Galvanized steel frame + double-wall polycarbonate.\nIrrigation: A drip system is a must.\nMonitoring: Start from day one with an AgroNext sensor kit.",
      coverImage:
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200",
      published: false,
    },
  ])

  console.log("Seed complete.")
}

main()
  .catch((err: unknown) => {
    console.error(err)
    process.exit(1)
  })
  .then(() => process.exit(0))
