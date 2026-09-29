import { getImageProps } from "next/image"
import { ClimaReadout } from "./hero-readings"
import { pick, type L } from "./util"

const copy = {
  tr: {
    kicker: "AgroNext · sera otomasyon sistemi",
    title: ["Sensörden karara,", "karardan uygulamaya."],
    body: "ClimaNex seranın havasını, TerraNex kök bölgesini ölçer. Seradaki yerel yapay zekâ bu ölçümlerden sulama, gübreleme, ısıtma ve havalandırma kararı üretir; karar denetimden geçtikten sonra röle kanallarıyla pompaya, fana ve ısıtıcıya uygulanır.",
    system: "Sistem nasıl çalışır",
    panel: "Canlı sera paneli",
    alt: "Biber serasında, toprağa yerleştirilmiş sensörler, iki breadboard üzerindeki ClimaNex ve TerraNex prototipleri, sulama hattı ve panelin açık olduğu dizüstü bilgisayar",
    caption: "Saha kurulumu, biber serası. Solda TerraNex, ortada ClimaNex, sağda panel.",
    replay: "Etiketlerdeki değerler gerçek bir ClimaNex kaydının tekrarıdır.",
    clima: "ClimaNex · iklim",
    terra: "TerraNex · kök bölgesi",
    terraBody: "toprak nemi · pH · NPK",
    act: "Uygulama · sulama ve gübre hattı",
    actBody: "röle kanalı · GPIO25 / GPIO26",
  },
  en: {
    kicker: "AgroNext · greenhouse automation system",
    title: ["Sensing to decision,", "decision to action."],
    body: "ClimaNex measures the greenhouse air, TerraNex the root zone. A local AI inside the greenhouse turns these readings into irrigation, fertilisation, heating and ventilation decisions; once a decision passes the safety check, relay channels apply it to pumps, fans and heaters.",
    system: "How the system works",
    panel: "Live greenhouse panel",
    alt: "Pepper greenhouse with sensors in the soil, ClimaNex and TerraNex prototypes on two breadboards, the irrigation line and a laptop showing the panel",
    caption: "Field setup, pepper greenhouse. TerraNex on the left, ClimaNex in the middle, panel on the right.",
    replay: "Tag values replay a real ClimaNex log.",
    clima: "ClimaNex · climate",
    terra: "TerraNex · root zone",
    terraBody: "soil moisture · pH · NPK",
    act: "Actuation · irrigation and fertiliser line",
    actBody: "relay channel · GPIO25 / GPIO26",
  },
}

// Etiket konumları fotoğrafın kendi koordinatlarıdır (%). Çerçeve fotoğrafla aynı
// en-boy oranında tutulur, böylece etiket her ekran genişliğinde aynı donanımı gösterir.
function Tag({ x, y, lift, align = "left", children }: { x: number; y: number; lift: number; align?: "left" | "right"; children: React.ReactNode }) {
  return (
    <div className="s-tag" data-align={align} style={{ left: `${x}%`, top: `${y}%`, ["--lift" as string]: `${lift}px` }}>
      <span className="s-tag-dot" />
      <span className="s-tag-line" />
      <span className="s-tag-box">{children}</span>
    </div>
  )
}

export function Hero({ locale }: { locale: L }) {
  const t = pick(locale, copy)
  const common = { alt: t.alt, sizes: "100vw" }
  const { props: { srcSet: wide } } = getImageProps({ ...common, src: "/agronext/sera-prototip.jpg", width: 2200, height: 1012, quality: 80, priority: true })
  const { props: { srcSet: tall, ...img } } = getImageProps({ ...common, src: "/agronext/modul-fotografi.jpg", width: 1125, height: 1500, quality: 75, priority: true })

  return (
    <section className="s-hero" data-stage="0" aria-labelledby="hero-title">
      <div className="s-wrap s-hero-head">
        <p className="s-kicker">{t.kicker}</p>
        <h1 id="hero-title" className="s-display">
          <span>{t.title[0]}</span> <span>{t.title[1]}</span>
        </h1>
        <div className="s-hero-aside">
          <p>{t.body}</p>
          <div className="s-hero-links">
            <a href="#sistem" className="s-link-primary">{t.system}<span aria-hidden="true">↓</span></a>
            <a href="/panel" className="s-link">{t.panel}<span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </div>

      <figure className="s-hero-figure">
        <div className="s-hero-frame">
          <picture>
            <source media="(min-width: 760px)" srcSet={wide} />
            <source media="(max-width: 759px)" srcSet={tall} />
            <img {...img} alt={t.alt} className="s-hero-img" />
          </picture>
          <div className="s-hero-tags" aria-hidden="true">
            <Tag x={60} y={62} lift={190}>
              <span className="s-tag-title">{t.clima}</span>
              <ClimaReadout locale={locale} />
            </Tag>
            <Tag x={19.5} y={48} lift={170}>
              <span className="s-tag-title">{t.terra}</span>
              <span className="s-tag-sub">{t.terraBody}</span>
            </Tag>
            <Tag x={50} y={56} lift={90} align="right">
              <span className="s-tag-title">{t.act}</span>
              <span className="s-tag-sub">{t.actBody}</span>
            </Tag>
          </div>
        </div>
        <div className="s-wrap s-hero-under">
          <div className="s-hero-mobile-readout">
            <span className="s-tag-title">{t.clima}</span>
            <ClimaReadout locale={locale} />
          </div>
          <figcaption>{t.caption}</figcaption>
          <p className="s-note">{t.replay}</p>
        </div>
      </figure>
    </section>
  )
}
