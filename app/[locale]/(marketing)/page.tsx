import { setRequestLocale } from "next-intl/server"
import { Hero } from "@/components/site/hero"
import { Architecture } from "@/components/site/architecture"
import { ClimaNex, TerraNex } from "@/components/site/modules"
import { Field } from "@/components/site/field"
import { LocalAI } from "@/components/site/local-ai"
import { NexAI } from "@/components/site/nexai"
import { Dashboard } from "@/components/site/dashboard"
import { Integration } from "@/components/site/integration"
import { Experiment } from "@/components/site/experiment"
import { ProductPath, Closing } from "@/components/site/product-path"
import { ScrollStage } from "@/components/site/scroll-stage"
import type { L } from "@/components/site/util"

// Bölüm sırası sistemin kendi akışını izler: Sera → Sensör → Veri → Yerel AI →
// Karar → Aktüatör → Sonuç. Üstteki akış şeridi (ScrollStage) bu sırayı gösterir.

export function generateMetadata({ params: { locale } }: { params: { locale: L } }) {
  const tr = locale === "tr"
  const title = tr ? "AgroNext · Sensörden karara, karardan uygulamaya" : "AgroNext · From sensing to decision, from decision to action"
  const description = tr
    ? "ClimaNex sera iklimini, TerraNex kök bölgesini ölçer; yerel yapay zekâ sulama, gübreleme, ısıtma ve havalandırma kararı üretir ve röle kanallarıyla seradaki ekipmana uygular."
    : "ClimaNex measures greenhouse climate and TerraNex the root zone; a local AI decides on irrigation, fertilising, heating and ventilation and applies it to greenhouse equipment through relay channels."
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/${locale}`, languages: { tr: "/tr", en: "/en" } },
    openGraph: { title, description, images: ["/agronext/sera-prototip.jpg"], locale: tr ? "tr_TR" : "en_US", type: "website" },
  }
}

export default function HomePage({ params: { locale } }: { params: { locale: L } }) {
  setRequestLocale(locale)
  return (
    <div className="s-site s-home">
      <ScrollStage locale={locale} />
      <Hero locale={locale} />
      <Architecture locale={locale} />
      <ClimaNex locale={locale} />
      <TerraNex locale={locale} />
      <Field locale={locale} />
      <LocalAI locale={locale} />
      <NexAI locale={locale} />
      <Dashboard locale={locale} />
      <Integration locale={locale} />
      <Experiment locale={locale} />
      <ProductPath locale={locale} />
      <Closing locale={locale} />
    </div>
  )
}
