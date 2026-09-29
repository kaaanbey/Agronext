import Image from "next/image"
import { pick, type L } from "./util"

const copy = {
  tr: {
    label: "Sera paneli",
    title: "Ne oluyor, neden oluyor, ne yapıldı.",
    steps: [
      ["Gözle", "Her ölçüm son değeri, altı saatlik eğilimi ve ne kadar eski olduğuyla birlikte görünür. Geciken sensör sarıya döner, gelmeyen değer boş kalır."],
      ["Anla", "AI Karar Özeti son kararı ve gerekçesini verir; NexAI aynı ekranda soruları ölçüme dayanarak yanıtlar."],
      ["Uygula", "Uyarılar ve karar geçmişi, hangi komutun ne zaman ve hangi ölçüme dayanarak verildiğini gösterir."],
    ],
    access: "Panel girişlidir. Her kullanıcı yalnız kendi serasını görür; yetki veritabanında, satır düzeyinde denetlenir.",
    cta: "Sera paneline git",
    alt: "AgroNext sera panelinin genel bakış ekranı: soldaki menü, hava sıcaklığı, bağıl nem, CO₂, gaz direnci ve hava basıncı kartları ile küçük eğilim grafikleri, sağda AI Karar Özeti ve NexAI sohbet alanı",
    cap: "Sera paneli v3, genel bakış.",
  },
  en: {
    label: "Greenhouse panel",
    title: "What is happening, why, and what was done.",
    steps: [
      ["Observe", "Every reading shows its latest value, a six-hour trend and how old it is. A late sensor turns amber; a missing value stays empty."],
      ["Understand", "The AI Decision Summary gives the latest decision and its reason; NexAI answers questions on the same screen, citing readings."],
      ["Act", "Alerts and decision history show which command was issued, when, and on which reading it was based."],
    ],
    access: "The panel requires sign-in. Each user sees only their own greenhouse; access is enforced in the database, row by row.",
    cta: "Open the greenhouse panel",
    alt: "Overview screen of the AgroNext greenhouse panel: navigation on the left, cards for air temperature, relative humidity, CO₂, gas resistance and air pressure with small trend charts, AI Decision Summary and NexAI chat on the right",
    cap: "Greenhouse panel v3, overview (Turkish UI).",
  },
}

// İşaret konumları ekran görüntüsünün kendi koordinatlarıdır (%):
// 1 canlı ölçüm kartları, 2 AI Karar Özeti, 3 uyarılar.
const PINS = [
  { n: 1, x: 45, y: 42 },
  { n: 2, x: 92, y: 14 },
  { n: 3, x: 45, y: 88 },
]

export function Dashboard({ locale }: { locale: L }) {
  const t = pick(locale, copy)
  return (
    <section className="s-section s-dash" id="panel" data-stage="4" aria-labelledby="dash-title">
      <div className="s-wrap s-dash-grid">
        <div className="s-dash-text">
          <p className="s-label">{t.label}</p>
          <h2 id="dash-title">{t.title}</h2>
          <ol className="s-dash-steps">
            {t.steps.map(([h, b], i) => (
              <li key={h}>
                <span className="s-photo-pin s-photo-pin-static" aria-hidden="true">{i + 1}</span>
                <div><h3>{h}</h3><p>{b}</p></div>
              </li>
            ))}
          </ol>
          <p className="s-note">{t.access}</p>
          <a className="s-link-primary" href="/panel">{t.cta}<span aria-hidden="true">↗</span></a>
        </div>
        <figure className="s-dash-shot" data-reveal>
          <div className="s-dash-frame">
            <Image src="/agronext/panel-genel-bakis.png" alt={t.alt} fill sizes="(max-width: 900px) 100vw, 72vw" />
            {PINS.map((p) => (
              <span key={p.n} className="s-photo-pin" style={{ left: `${p.x}%`, top: `${p.y}%` }} aria-hidden="true">{p.n}</span>
            ))}
          </div>
          <figcaption>{t.cap}</figcaption>
        </figure>
      </div>
    </section>
  )
}
