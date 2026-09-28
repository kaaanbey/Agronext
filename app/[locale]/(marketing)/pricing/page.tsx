import { setRequestLocale, getTranslations } from "next-intl/server"
import { PricingCards } from "@/components/pricing/pricing-cards"
import { ComparisonTable } from "@/components/pricing/comparison-table"
import { PricingAIChat } from "@/components/pricing/pricing-ai-chat"
import { pricingPlans } from "@/lib/data/pricing"

interface PageProps {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: PageProps) {
  const t = await getTranslations({ locale, namespace: "seo.pricing" })
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("og_title"),
      description: t("og_description"),
    },
  }
}

export default async function PricingPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale)
  const t = await getTranslations("pricing")

  const plans = [...pricingPlans].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <>
      <section className="container py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <PricingCards plans={plans} />

        <div className="max-w-3xl mx-auto mt-16">
          <PricingAIChat />
        </div>
      </section>

      <ComparisonTable locale={locale} />
    </>
  )
}
