import { setRequestLocale, getTranslations } from "next-intl/server"
import { useTranslations } from "next-intl"
import { Mail, Phone, MapPin, Globe, Sparkles } from "lucide-react"
import { ContactForm } from "@/components/contact/contact-form"
import { TeamSection } from "@/components/contact/team-section"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { companyInfo } from "@/lib/data/company"

interface PageProps {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: PageProps) {
  const t = await getTranslations({ locale, namespace: "seo.contact" })
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("og_title"),
      description: t("og_description"),
    },
  }
}

export default function ContactPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale)
  const t = useTranslations("contact")

  return (
    <div className="container py-16 md:py-24">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mt-12">
        <TeamSection />
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px] max-w-5xl mx-auto">
        <div>
          <ContactForm />
        </div>
        <CompanyInfoCard />
      </div>
    </div>
  )
}

function CompanyInfoCard() {
  const t = useTranslations("contact.company")

  const items: Array<{
    key: string
    icon: typeof Mail
    label: string
    value: string
    href?: string
  }> = [
    {
      key: "email",
      icon: Mail,
      label: t("email_label"),
      value: companyInfo.email,
      href: `mailto:${companyInfo.email}`,
    },
    {
      key: "phone",
      icon: Phone,
      label: t("phone_label"),
      value: companyInfo.phone,
      href: `tel:${companyInfo.phoneHref}`,
    },
    {
      key: "location",
      icon: MapPin,
      label: t("location_label"),
      value: companyInfo.location,
      href: companyInfo.locationMapsUrl,
    },
    {
      key: "website",
      icon: Globe,
      label: t("website_label"),
      value: companyInfo.website,
      href: companyInfo.websiteUrl,
    },
  ]

  return (
    <Card className="h-fit">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{t("title")}</h2>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {companyInfo.stage}
          </Badge>
        </div>

        <ul className="mt-5 space-y-4">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.key} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </div>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.key === "location" || item.key === "website" ? "_blank" : undefined}
                      rel={item.key === "location" || item.key === "website" ? "noopener noreferrer" : undefined}
                      className="text-sm font-medium text-foreground hover:text-primary break-words"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <div className="text-sm font-medium text-foreground break-words">
                      {item.value}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
