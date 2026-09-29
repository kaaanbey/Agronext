import Image from "next/image"
import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { detailContent, detailSlugs, type DetailSlug, type SiteLocale } from "@/lib/content/agronext"
import { aksamKaydi, co2Kaydi } from "@/lib/content/saha-verisi"
import { LineChart } from "@/components/site/chart"
import { ScrollStage } from "@/components/site/scroll-stage"

// Teknik detay sayfası şablonu: çizim antedi gibi başlık bloğu, büyük görsel,
// spec tablosu, açıklama, şema ve önceki/sonraki gezinti.

type Props = { params: { locale: SiteLocale; slug: string } }

// Her sayfa akış şeridinde kendi aşamasını yakar (Sera → … → Sonuç).
const STAGE: Record<DetailSlug, string> = {
  sistem: "all", climanex: "1", terranex: "1", sonuclar: "2", "yapay-zeka": "3", nexai: "4", "urun-ailesi": "6",
}

function isDetailSlug(slug: string): slug is DetailSlug {
  return (detailSlugs as readonly string[]).includes(slug)
}

export function generateStaticParams() {
  return ["tr", "en"].flatMap((locale) => detailSlugs.map((slug) => ({ locale, slug })))
}

export function generateMetadata({ params: { locale, slug } }: Props) {
  if (!isDetailSlug(slug)) return {}
  const c = detailContent[slug]
  const loc = locale === "en" ? "en" : "tr"
  const title = c.title[loc] === c.kicker[loc] ? c.title[loc] : `${c.title[loc]} · ${c.kicker[loc]}`
  return {
    title,
    description: c.lead[loc],
    alternates: { canonical: `/${loc}/${slug}`, languages: { tr: `/tr/${slug}`, en: `/en/${slug}` } },
    openGraph: { title, description: c.lead[loc], images: [c.image.src], locale: loc === "tr" ? "tr_TR" : "en_US" },
  }
}

export default function DetailPage({ params: { locale, slug } }: Props) {
  if (!isDetailSlug(slug)) notFound()
  setRequestLocale(locale)
  const loc = locale === "en" ? "en" : "tr"
  const tr = loc === "tr"
  const d = detailContent[slug]
  const idx = detailSlugs.indexOf(slug)
  const prev = detailSlugs[idx - 1]
  const next = detailSlugs[idx + 1]
  const n = String(idx + 1).padStart(2, "0")
  const total = String(detailSlugs.length).padStart(2, "0")

  return (
    <article className="s-site s-doc" data-stage={STAGE[slug]}>
      <ScrollStage locale={loc} />
      <header className="s-wrap s-doc-head">
        <dl className="s-doc-block" aria-label={tr ? "Belge bilgisi" : "Document info"}>
          <div><dt>{tr ? "Belge" : "Document"}</dt><dd>AgroNext · {d.kicker[loc]}</dd></div>
          <div><dt>{tr ? "Sayfa" : "Sheet"}</dt><dd>{n} / {total}</dd></div>
          <div><dt>{tr ? "Kapsam" : "Scope"}</dt><dd>{tr ? "saha prototipi · ürün geliştirme" : "field prototype · product development"}</dd></div>
        </dl>
        <p className="s-label">{d.kicker[loc]}</p>
        <h1 className={d.title[loc].length < 14 ? "s-doc-title s-doc-title-product" : "s-doc-title"}>{d.title[loc]}</h1>
        <p className="s-doc-lead">{d.lead[loc]}</p>
      </header>

      <figure className={d.image.fit === "contain" ? "s-wrap s-doc-visual s-doc-visual-contain" : "s-doc-visual"}>
        <div className="s-doc-visual-frame" style={d.image.fit === "contain" ? undefined : { aspectRatio: `${d.image.w} / ${d.image.h}` }}>
          <Image src={d.image.src} alt={d.image.alt[loc]} width={d.image.w} height={d.image.h} priority sizes={d.image.fit === "contain" ? "340px" : "100vw"} />
        </div>
        <figcaption className="s-wrap">{d.image.caption[loc]}</figcaption>
      </figure>

      <div className="s-wrap s-doc-body">
        <table className="s-doc-specs">
          <caption className="s-label">{tr ? "Teknik özet" : "Technical summary"}</caption>
          <tbody>
            {d.specs.map((s) => (
              <tr key={s.k.tr}><th scope="row">{s.k[loc]}</th><td>{s.v[loc]}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="s-doc-text">
          {d.body.map((b, i) => (
            <section key={b.h.tr}>
              <span className="s-mono">{n}.{i + 1}</span>
              <h2>{b.h[loc]}</h2>
              <p>{b.p[loc]}</p>
            </section>
          ))}
        </div>
      </div>

      {d.charts ? (
        <section className="s-wrap s-doc-charts" data-reveal aria-label={tr ? "Kayıt kesitleri" : "Log excerpts"}>
          <div>
            <p className="s-doc-chart-title">{tr ? "Sıcaklık · 22 Eyl 2026, 19:10–22:45" : "Temperature · 22 Sep 2026, 19:10–22:45"}</p>
            <LineChart data={aksamKaydi} field={1} unit="°C" label={tr ? "Sıcaklık" : "Temperature"} />
          </div>
          <div>
            <p className="s-doc-chart-title">{tr ? "Bağıl nem · 22 Eyl 2026, 19:10–22:45" : "Relative humidity · 22 Sep 2026, 19:10–22:45"}</p>
            <LineChart data={aksamKaydi} field={2} unit="%" label={tr ? "Bağıl nem" : "Relative humidity"} className="s-chart-alt" />
          </div>
          <div>
            <p className="s-doc-chart-title">{tr ? "CO₂ · 25 Eyl 2026, 13:40–14:50" : "CO₂ · 25 Sep 2026, 13:40–14:50"}</p>
            <LineChart data={co2Kaydi} field={3} unit="ppm" label="CO₂" decimals={0} gap={4} />
          </div>
        </section>
      ) : null}

      {d.schematic ? (
        <figure className="s-wrap s-doc-schem" data-reveal>
          <a href={d.schematic.src} target="_blank" rel="noopener" className="s-doc-schem-frame" aria-label={`${d.schematic.alt[loc]} (${tr ? "tam boyut, yeni sekmede" : "full size, new tab"})`}>
            <Image src={d.schematic.src} alt={d.schematic.alt[loc]} width={d.schematic.w} height={d.schematic.h} sizes="(max-width: 1320px) 100vw, 1320px" />
          </a>
          <figcaption>{d.schematic.caption[loc]} · {tr ? "tam boyut için görsele tıklayın" : "click for full size"}</figcaption>
        </figure>
      ) : null}

      <nav className="s-wrap s-doc-nav" aria-label={tr ? "Diğer sayfalar" : "Other sheets"}>
        {prev ? (
          <a href={`/${loc}/${prev}`} className="s-doc-nav-prev"><span className="s-mono">← {String(idx).padStart(2, "0")}</span>{detailContent[prev].title[loc]}</a>
        ) : <a href={`/${loc}`} className="s-doc-nav-prev"><span className="s-mono">←</span>{tr ? "Ana sayfa" : "Home"}</a>}
        {next ? (
          <a href={`/${loc}/${next}`} className="s-doc-nav-next"><span className="s-mono">{String(idx + 2).padStart(2, "0")} →</span>{detailContent[next].title[loc]}</a>
        ) : <a href={`/${loc}/contact`} className="s-doc-nav-next"><span className="s-mono">→</span>{tr ? "Ekiple iletişime geç" : "Contact the team"}</a>}
      </nav>
    </article>
  )
}
