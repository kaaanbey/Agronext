import { setRequestLocale, getTranslations } from "next-intl/server"
import { useTranslations } from "next-intl"

interface PageProps {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: PageProps) {
  const t = await getTranslations({ locale, namespace: "legal.privacy" })
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function PrivacyPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale)
  const t = useTranslations("legal.privacy")

  return (
    <div className="container py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          {t("body")}
        </p>
      </div>
    </div>
  )
}
