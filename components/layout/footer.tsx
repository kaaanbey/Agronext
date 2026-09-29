import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/lib/i18n/routing"
import { LogoMark } from "./logo"
import { companyInfo } from "@/lib/data/company"

export function Footer() {
  const locale = useLocale()
  const t = useTranslations()
  const tr = locale === "tr"
  const d = (slug: string) => `/${locale}/${slug}`
  return (
    <footer className="s-footer">
      <div className="s-footer-main">
        <div className="s-footer-brand">
          <LogoMark />
          <p>{tr ? "Sensörden karara, karardan uygulamaya." : "From sensing to decision, from decision to action."}</p>
        </div>
        <nav aria-label={tr ? "Sistem" : "System"}>
          <h2>{tr ? "Sistem" : "System"}</h2>
          <a href={d("sistem")}>{tr ? "Mimari" : "Architecture"}</a>
          <a href={d("climanex")}>ClimaNex</a>
          <a href={d("terranex")}>TerraNex</a>
          <a href={d("yapay-zeka")}>{tr ? "Yerel yapay zekâ" : "Local AI"}</a>
          <a href={d("nexai")}>NexAI</a>
        </nav>
        <nav aria-label={tr ? "Proje" : "Project"}>
          <h2>{tr ? "Proje" : "Project"}</h2>
          <a href={d("sonuclar")}>{tr ? "Saha verisi" : "Field data"}</a>
          <a href={d("urun-ailesi")}>{tr ? "Ürünleşme" : "Product path"}</a>
          <Link href="/about">{t("nav.about")}</Link>
          <Link href="/blog">{t("nav.blog")}</Link>
          <Link href="/pricing">{tr ? "Pilot ve iş birliği" : "Pilots"}</Link>
          <a href="/panel">{tr ? "Sera paneli" : "Greenhouse panel"}</a>
        </nav>
        <div>
          <h2>{tr ? "İletişim" : "Contact"}</h2>
          <a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a>
          <Link href="/contact">{tr ? "İletişim formu" : "Contact form"}</Link>
          <a href={companyInfo.linkedin} rel="noopener noreferrer" target="_blank">LinkedIn</a>
          <span>{companyInfo.location}</span>
        </div>
      </div>
      <div className="s-footer-bottom">
        <span>© {new Date().getFullYear()} AgroNext · agronext.net</span>
        <div>
          <Link href="/privacy">{t("footer.privacy")}</Link>
          <Link href="/terms">{t("footer.terms")}</Link>
        </div>
      </div>
    </footer>
  )
}
