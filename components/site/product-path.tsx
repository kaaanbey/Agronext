import Image from "next/image"
import { companyInfo } from "@/lib/data/company"
import { pick, type L } from "./util"

// Ürünleşme yolu, çizim antedi / revizyon tablosu estetiğinde tek bir şerit.
// Klasik "timeline" bileşeni değil: sütun genişlikleri içeriğe göre değişir,
// fotoğraf yalnız gerçekten görseli olan aşamalarda var.

const copy = {
  tr: {
    label: "Ürünleşme",
    title: "Breadboard'dan seraya kurulan ürüne.",
    now: "şu an",
    steps: [
      { h: "Saha prototipi", b: "İki modül breadboard üzerinde, gerçek serada çalışıyor.", img: "/agronext/modul-fotografi.jpg", alt: "Serada tahta üzerindeki iki breadboard prototipi ve dizüstü bilgisayar", pos: "50% 72%" },
      { h: "Sensör doğrulama", b: "Toprak nemi kuru/ıslak uçları, pH iki tampon çözelti, NDIR ısınma süresi." },
      { h: "Özel PCB", b: "TerraNex ve ClimaNex için taşıyıcı kart: ESP32 soketi, ölçüm, kontrol ve saha bağlantı bölgeleri.", img: "/agronext/pcb-ailesi.png", alt: "TerraNex ve ClimaNex taşıyıcı PCB yerleşimleri ve 3B kart önizlemeleri", pos: "78% 26%" },
      { h: "Muhafaza", b: "Neme ve toza kapalı kutu, prob kablo girişleri, ekran penceresi." },
      { h: "Pilot sera", b: "İkinci bir serada, önceden yazılmış yöntemle kurulum." },
      { h: "Ölçeklenebilir ürün", b: "Bölge başına modül, tekrarlanabilir kurulum, tek panel." },
    ],
  },
  en: {
    label: "Product path",
    title: "From breadboard to a product installed in the greenhouse.",
    now: "now",
    steps: [
      { h: "Field prototype", b: "Both modules on breadboards, running in a real greenhouse.", img: "/agronext/modul-fotografi.jpg", alt: "Two breadboard prototypes on a wooden plank in the greenhouse, next to a laptop", pos: "50% 72%" },
      { h: "Sensor validation", b: "Soil moisture dry/wet endpoints, two-buffer pH calibration, NDIR warm-up time." },
      { h: "Custom PCB", b: "Carrier boards for TerraNex and ClimaNex: ESP32 socket, measurement, control and field-connection zones.", img: "/agronext/pcb-ailesi.png", alt: "TerraNex and ClimaNex carrier PCB layouts and 3D board previews", pos: "78% 26%" },
      { h: "Enclosure", b: "Moisture- and dust-sealed box, probe cable glands, display window." },
      { h: "Pilot greenhouse", b: "Installation in a second greenhouse, with a method written in advance." },
      { h: "Scalable product", b: "One module set per zone, repeatable installation, one panel." },
    ],
  },
}

const CURRENT = 1

export function ProductPath({ locale }: { locale: L }) {
  const t = pick(locale, copy)
  return (
    <section className="s-section s-path" id="urunlesme" data-stage="6" aria-labelledby="path-title">
      <div className="s-wrap">
        <header className="s-head">
          <p className="s-label">{t.label}</p>
          <h2 id="path-title">{t.title}</h2>
        </header>
        <ol className="s-rev" data-reveal style={{ ["--progress" as string]: (CURRENT + 0.5) / t.steps.length }}>
          {t.steps.map((s, i) => (
            <li key={s.h} data-state={i < CURRENT ? "done" : i === CURRENT ? "now" : "next"} data-wide={s.img ? "true" : undefined}>
              <div className="s-rev-head">
                <span className="s-mono">{String(i + 1).padStart(2, "0")}</span>
                {i === CURRENT ? <span className="s-rev-now">{t.now}</span> : null}
              </div>
              {s.img ? (
                <div className="s-rev-img">
                  <Image src={s.img} alt={s.alt!} fill sizes="(max-width: 900px) 100vw, 26vw" style={{ objectPosition: s.pos }} />
                </div>
              ) : null}
              <h3>{s.h}</h3>
              <p>{s.b}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

const closing = {
  tr: {
    teknofest: "TEKNOFEST 2026 · Tarım Teknolojileri · Tam Otonom Sera Sistemleri finalisti",
    title: "Serasında denemek, birlikte geliştirmek ya da yalnız soru sormak isteyenlere açığız.",
    form: "İletişim formu",
    where: `${companyInfo.location}`,
  },
  en: {
    teknofest: "TEKNOFEST 2026 · Agricultural Technologies · Fully Autonomous Greenhouse Systems finalist",
    title: "Open to growers who want to trial it, partners who want to build with us, and anyone with a question.",
    form: "Contact form",
    where: "Gebze, Kocaeli, Türkiye",
  },
}

export function Closing({ locale }: { locale: L }) {
  const t = pick(locale, closing)
  return (
    <section className="s-section s-dark s-close" id="iletisim" data-stage="6" aria-labelledby="close-title">
      <div className="s-wrap">
        <p className="s-label">{t.teknofest}</p>
        <h2 id="close-title" className="s-close-title">{t.title}</h2>
        <div className="s-close-row">
          <a className="s-close-mail" href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a>
          <div className="s-close-links">
            <a className="s-link" href={`/${locale}/contact`}>{t.form}<span aria-hidden="true">→</span></a>
            <a className="s-link" href={companyInfo.linkedin} rel="noopener noreferrer" target="_blank">LinkedIn<span aria-hidden="true">↗</span></a>
            <span className="s-mono s-dim">{t.where}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
