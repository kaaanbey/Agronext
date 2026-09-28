import type { Metadata } from "next"
import { Inter, Instrument_Serif } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
})

export const metadata: Metadata = {
  title: {
    default: "AgroNext — Türkiye'nin Akıllı Sera Platformu",
    template: "%s · AgroNext",
  },
  description:
    "GRU tabanlı yapay zekâ ile sera otomasyonu. Netafim'in onda biri fiyatında, Türkiye iklimine özel.",
  keywords: [
    "akıllı sera",
    "sera otomasyonu",
    "agritech",
    "yapay zeka tarım",
    "smart greenhouse",
    "Turkey agtech",
    "AgroNext",
  ],
  metadataBase: new URL(process.env.AUTH_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "AgroNext",
    description: "Türkiye seracıları için erişilebilir akıllı tarım.",
    url: "https://agronext.net",
    siteName: "AgroNext",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgroNext",
    description: "Akıllı sera, erişilebilir fiyat.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${inter.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
