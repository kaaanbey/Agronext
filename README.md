# AgroNext

Küçük ve orta ölçekli sera çiftçileri için uçtan uca akıllı sera yönetim platformu. Landing, pricing, blog, iletişim, auth flow ve korumalı dashboard tek bir Next.js 14 uygulamasında.

## Teknoloji

- **Framework**: Next.js 14 (App Router) + TypeScript strict
- **DB**: PostgreSQL (Neon serverless) + Drizzle ORM
- **Auth**: NextAuth.js v5 (Email/Şifre + Google OAuth)
- **i18n**: next-intl (TR varsayılan, EN)
- **Stil**: Tailwind CSS v3 + Radix UI primitives + next-themes
- **State**: Zustand (client) + TanStack Query (server state)
- **Form**: react-hook-form + Zod
- **AI**: Vercel AI SDK + Anthropic Claude (uyur durumda — `ENABLE_PRICING_AI=true` ile açılır)
- **Chart**: Recharts
- **Motion**: Framer Motion

## Hızlı Başlangıç

### 1. Bağımlılıkları kur

```bash
npm install
```

### 2. Ortam değişkenleri

```bash
cp .env.example .env.local
```

Gerekli değerleri doldurun:

```env
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
AUTH_SECRET="$(openssl rand -base64 32)"
AUTH_URL="http://localhost:3000"
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
ANTHROPIC_API_KEY=""
ENABLE_PRICING_AI="false"
```

### 3. Veritabanı migrationları

```bash
npm run db:push    # şemayı Neon'a uygular
npm run db:seed    # admin + farmer + seralar + 7 günlük sensör verisi + blog + fiyat planları
```

Seed sonrası test hesapları:

- Admin: `admin@agronext.com` / `admin1234`
- Farmer: `mehmet@example.com` / `farmer1234`
- Farmer: `ayse@example.com` / `farmer1234`

### 4. Çalıştır

```bash
npm run dev
```

`http://localhost:3000` → otomatik olarak `/tr` varsayılan locale'ine yönlenir.

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Production sunucusu |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript strict kontrol |
| `npm run db:generate` | Yeni migration üret |
| `npm run db:push` | Şemayı Neon'a uygula |
| `npm run db:studio` | Drizzle Studio |
| `npm run db:seed` | Seed scripti |

## Google OAuth kurulumu

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth Client ID** → **Web application**.
2. Authorized JavaScript origins:
   - `http://localhost:3000`
   - Production domain
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - Production domain: `https://<your-domain>/api/auth/callback/google`
4. Elde edilen Client ID ve Client Secret değerlerini `AUTH_GOOGLE_ID` ve `AUTH_GOOGLE_SECRET` olarak tanımlayın.

## AI Chat (uyur durumda)

`/pricing` sayfasında sağ altta bulunan floating chat butonu, demo modunda (`ENABLE_PRICING_AI=false`) her kullanıcı mesajına "Bu özellik yakında aktif olacak." cevabını döndürür. Backend entegrasyonu için altyapı hazır:

- `app/api/pricing/chat/route.ts`
- `components/pricing/ai-chat-drawer.tsx`

Gerçek AI'ı devreye almak için:

1. `ANTHROPIC_API_KEY` doldurulur.
2. `ENABLE_PRICING_AI=true` yapılır.
3. `route.ts` içindeki yorum satırı haline getirilmiş `generateText` çağrısı açılır.

## Proje Yapısı

```
agronext/
├── app/
│   ├── [locale]/
│   │   ├── (marketing)/      # /, /pricing, /about, /blog, /contact
│   │   ├── (auth)/auth/      # /auth/login, /register, /forgot-password
│   │   └── (app)/dashboard/  # korumalı dashboard
│   └── api/                  # auth, blog, contact, greenhouses, sensors, users, pricing/chat
├── components/
│   ├── ui/                   # Button, Card, Input, Dialog, Drawer, ...
│   ├── layout/               # Navbar, Footer, Sidebar, Topbar, LocaleSwitcher
│   ├── landing/, pricing/, contact/, auth/, dashboard/
├── lib/
│   ├── db/                   # Drizzle schema + Neon client
│   ├── auth/                 # NextAuth config
│   ├── validations/          # Zod şemalar (auth, blog, contact, greenhouse, profile, chat)
│   ├── i18n/                 # locale config + routing
│   └── dashboard/data.ts     # dashboard sorguları
├── messages/                 # tr.json, en.json
├── drizzle/                  # migration SQL
├── scripts/seed.ts
├── middleware.ts             # next-intl + auth guard
└── types/next-auth.d.ts      # Session augmentation
```

## Roller

| Rol | Yetkiler |
|-----|----------|
| `admin` | Dashboard + `/dashboard/blog` (post CRUD) |
| `farmer` | Dashboard (kendi seraları + sensör verisi + ayarlar) |
| `viewer` | Okuma odaklı erişim (ileride) |

## i18n

URL prefix'i zorunlu: `/tr/...`, `/en/...`. Tüm UI string'leri `messages/tr.json` ve `messages/en.json` dosyalarından okunur — hiçbir hardcode metin yoktur. Yeni locale eklemek için `lib/i18n/config.ts` içindeki `locales` dizisine ekleyin ve karşılık gelen JSON dosyasını oluşturun.

## Lisans

Özel — © AgroNext
