import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server"
import { Providers } from "@/components/providers"
import { locales, type Locale } from "@/lib/i18n/config"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}) {
  if (!locales.includes(locale as Locale)) return {}
  const t = await getTranslations({ locale, namespace: "seo.default" })
  return {
    title: {
      default: t("title"),
      template: "%s · AgroNext",
    },
    description: t("description"),
    openGraph: {
      title: t("og_title"),
      description: t("og_description"),
      locale: locale === "tr" ? "tr_TR" : "en_US",
    },
  }
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  if (!locales.includes(locale as Locale)) notFound()

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>{children}</Providers>
    </NextIntlClientProvider>
  )
}
