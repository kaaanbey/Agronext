import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n.ts")

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Sera paneli: public/panel/index.html → agronext.net/panel
  async rewrites() {
    return [{ source: "/panel", destination: "/panel/index.html" }]
  },
  // Panel için sıkı güvenlik başlıkları (yalnız /panel; sitenin geri kalanı etkilenmez).
  // Panel veriyi tarayıcıdan doğrudan Supabase'den okur; izin verilen tek dış
  // bağlantı proje adresi, tek dış script kaynağı jsDelivr (SRI hash'li).
  // 'unsafe-inline' yok: panelde satır içi script/stil bulunmaz.
  async headers() {
    const SUPABASE = "uidjvztigoubyhmsmvog.supabase.co"
    const csp = [
      "default-src 'none'",
      "script-src 'self' https://cdn.jsdelivr.net",
      "style-src 'self'",
      `connect-src https://${SUPABASE} wss://${SUPABASE}`,
      "img-src 'self' data:",
      "base-uri 'none'",
      "form-action 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
    ].join("; ")
    const panelBasliklari = [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "X-Robots-Tag", value: "noindex" },
    ]
    return [
      { source: "/panel", headers: panelBasliklari },
      { source: "/panel/:path*", headers: panelBasliklari },
    ]
  },
}

export default withNextIntl(nextConfig)
