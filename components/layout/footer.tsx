import { Mail, Phone, MapPin, Linkedin } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/lib/i18n/routing"
import { Logo } from "./logo"
import { companyInfo } from "@/lib/data/company"

export function Footer() {
  const t = useTranslations()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("common.tagline")}
            </p>
            <div className="flex gap-2">
              <a
                href={companyInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">{t("footer.product")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">{t("nav.home")}</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">{t("nav.pricing")}</Link></li>
              <li><Link href="/blog" className="hover:text-foreground">{t("nav.blog")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">{t("footer.company")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">{t("nav.about")}</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">{t("nav.contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">{t("footer.contact_heading")}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/80" />
                <a
                  href={`mailto:${companyInfo.email}`}
                  className="hover:text-foreground break-all"
                >
                  {companyInfo.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/80" />
                <a
                  href={`tel:${companyInfo.phoneHref}`}
                  className="hover:text-foreground"
                >
                  {companyInfo.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/80" />
                <span>{companyInfo.location}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 flex flex-col gap-3 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            © {year} AgroNext. {t("footer.rights")}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/privacy" className="hover:text-foreground">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              {t("footer.terms")}
            </Link>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground/80 italic">
          {t("footer.disclaimer")}
        </div>
      </div>
    </footer>
  )
}
