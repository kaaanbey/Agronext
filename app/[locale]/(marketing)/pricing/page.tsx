import { setRequestLocale } from "next-intl/server"

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const tr = locale === "tr"
  return {
    title: tr ? "Pilot ve iş birliği" : "Pilots and collaboration",
    description: tr ? "AgroNext'i kendi seranızda denemek için pilot süreci." : "The pilot process for trying AgroNext in your own greenhouse.",
  }
}

export default function PricingPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale)
  const tr = locale === "tr"
  const steps = tr
    ? [
        ["Serayı tanımak", "Alan, ürün, sulama düzeni ve mevcut ekipman (pompa, fan, ısıtıcı, pano) birlikte çıkarılır."],
        ["Kapsamı yazmak", "Hangi ölçümlerin alınacağı, hangi kanalların AgroNext'e bağlanacağı ve güvenlik sınırları belirlenir."],
        ["Yöntemi önceden yazmak", "Karşılaştırma dönemi, ölçülecek büyüklükler ve başarı ölçütü kurulumdan önce yazılır."],
        ["Kurulum ve izleme", "Modüller kurulur, panel erişimi açılır; ilk haftalar birlikte izlenir."],
      ]
    : [
        ["Understand the greenhouse", "Area, crop, irrigation routine and existing equipment (pump, fan, heater, panel) are mapped together."],
        ["Write the scope", "Which readings to take, which channels to connect to AgroNext, and the safety limits are defined."],
        ["Write the method first", "The comparison period, the quantities to measure and the success criterion are written before installation."],
        ["Install and observe", "Modules are installed, panel access is opened; the first weeks are observed together."],
      ]
  return (
    <div className="s-site s-info">
      <header className="s-wrap s-info-head">
        <p className="s-label">{tr ? "Pilot ve iş birliği" : "Pilots and collaboration"}</p>
        <h1 className="s-doc-title">{tr ? "Kendi seranızda deneyin." : "Try it in your own greenhouse."}</h1>
        <p className="s-doc-lead">
          {tr
            ? "AgroNext ürünleşme aşamasında; paket fiyatı henüz yayımlanmadı. Pilot kurulumlar seraya göre birlikte planlanıyor."
            : "AgroNext is in productisation; package pricing has not been published yet. Pilot installations are planned together, greenhouse by greenhouse."}
        </p>
      </header>
      <ol className="s-wrap s-pilot">
        {steps.map(([h, b], i) => (
          <li key={h}>
            <span className="s-mono">{String(i + 1).padStart(2, "0")}</span>
            <h2>{h}</h2>
            <p>{b}</p>
          </li>
        ))}
      </ol>
      <div className="s-wrap s-info-cta">
        <a className="s-link-primary" href={`/${locale}/contact`}>{tr ? "Pilot için iletişime geç" : "Get in touch about a pilot"}<span aria-hidden="true">→</span></a>
      </div>
    </div>
  )
}
