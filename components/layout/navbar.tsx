"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { Link, usePathname, useRouter } from "@/lib/i18n/routing"
import { Logo } from "./logo"

// İnce, sola yaslı üst menü. Ana sayfada bölüm çapalarına, diğer sayfalarda
// ana sayfanın aynı bölümlerine gider. Mobil menü tam ekran, büyük tipografili.

export function Navbar() {
  const locale = useLocale() as "tr" | "en"
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const home = `/${locale}`
  const tr = locale === "tr"

  const links: [string, string][] = tr
    ? [["sistem", "Sistem"], ["climanex", "ClimaNex"], ["terranex", "TerraNex"], ["yapay-zeka", "Yerel AI"], ["nexai", "NexAI"], ["saha", "Saha"]]
    : [["sistem", "System"], ["climanex", "ClimaNex"], ["terranex", "TerraNex"], ["yapay-zeka", "Local AI"], ["nexai", "NexAI"], ["saha", "Field"]]

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const other = tr ? "en" : "tr"
  const switchLocale = () => router.replace(pathname, { locale: other })

  return (
    <header className="s-nav" data-open={open}>
      <div className="s-nav-inner">
        <a href={home} className="s-nav-logo" aria-label="AgroNext"><Logo /></a>
        <nav className="s-nav-primary" aria-label={tr ? "Ana menü" : "Main navigation"}>
          {links.map(([id, label]) => <a href={`${home}#${id}`} key={id}>{label}</a>)}
        </nav>
        <div className="s-nav-actions">
          <a className="s-nav-panel" href="/panel">{tr ? "Sera paneli" : "Greenhouse panel"}<span aria-hidden="true">↗</span></a>
          <button type="button" className="s-nav-lang" onClick={switchLocale} aria-label={tr ? "Switch to English" : "Türkçeye geç"}>
            <span data-on={tr}>TR</span><span aria-hidden="true">/</span><span data-on={!tr}>EN</span>
          </button>
          {/* Giriş, sera paneline (Supabase oturumu) gider; sitenin eski dashboard'u kullanılmıyor. */}
          <a className="s-nav-sign" href="/panel">{t("common.signIn")}</a>
        </div>
        <button className="s-nav-toggle" type="button" aria-expanded={open} aria-controls="s-mobile-menu" onClick={() => setOpen(!open)}>
          <span className="s-visually-hidden">{open ? (tr ? "Menüyü kapat" : "Close menu") : (tr ? "Menüyü aç" : "Open menu")}</span>
          <span className="s-nav-burger" aria-hidden="true" />
        </button>
      </div>
      {open ? (
        <div className="s-mobile" id="s-mobile-menu">
          <nav aria-label={tr ? "Mobil menü" : "Mobile navigation"}>
            <ol className="s-mobile-main">
              {links.map(([id, label], i) => (
                <li key={id}><a href={`${home}#${id}`} onClick={() => setOpen(false)}><span>{String(i + 1).padStart(2, "0")}</span>{label}</a></li>
              ))}
            </ol>
            <div className="s-mobile-sub">
              <a href="/panel">{tr ? "Sera paneli" : "Greenhouse panel"} ↗</a>
              <Link href="/about" onClick={() => setOpen(false)}>{t("nav.about")}</Link>
              <Link href="/blog" onClick={() => setOpen(false)}>{t("nav.blog")}</Link>
              <Link href="/contact" onClick={() => setOpen(false)}>{t("nav.contact")}</Link>
              <a href="/panel">{t("common.signIn")}</a>
              <button type="button" onClick={() => { setOpen(false); switchLocale() }}>{tr ? "English" : "Türkçe"}</button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
