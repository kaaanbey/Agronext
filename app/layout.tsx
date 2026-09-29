import type { Metadata } from "next"
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import "./site.css"

// Üç aile, üç görev: Inter gövde metni, Inter Tight başlıklar,
// JetBrains Mono ölçüm değerleri / etiketler / teknik tablolar.
const inter = Inter({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-inter" })
const interTight = Inter_Tight({ subsets: ["latin", "latin-ext"], weight: ["500", "600", "700"], display: "swap", variable: "--font-display" })
const mono = JetBrains_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], display: "swap", variable: "--font-mono" })

export const metadata: Metadata = {
  title: {
    default: "AgroNext · Sensörden karara, karardan uygulamaya",
    template: "%s · AgroNext",
  },
  description:
    "AgroNext; ClimaNex ve TerraNex modülleriyle sera iklimini ve kök bölgesini ölçen, yerel yapay zekâ ile sulama, gübreleme, ısıtma ve havalandırma kararı üreten ve bu kararları sera ekipmanına uygulayan sera otomasyon sistemidir.",
  keywords: ["akıllı sera", "sera otomasyonu", "yerel yapay zekâ", "edge AI", "IoT", "ClimaNex", "TerraNex", "AgroNext"],
  metadataBase: new URL("https://agronext.net"),
  openGraph: {
    title: "AgroNext",
    description: "Sensörden karara, karardan uygulamaya. Sera için ölçüm, yerel yapay zekâ ve kontrol.",
    url: "https://agronext.net",
    siteName: "AgroNext",
    locale: "tr_TR",
    type: "website",
    images: ["/agronext/sera-prototip.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgroNext",
    description: "Sensörden karara, karardan uygulamaya.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className={`${inter.variable} ${interTight.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  )
}
