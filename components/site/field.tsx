import Image from "next/image"
import { LineChart } from "./chart"
import { aksamKaydi, olcumSayisi } from "@/lib/content/saha-verisi"
import { pick, type L } from "./util"

const copy = {
  tr: {
    label: "Saha",
    title: "Gerçek sera. Gerçek veri.",
    story: [
      "AgroNext bir laboratuvar tezgâhında değil, ",
      "10 m²",
      " büyüklüğünde gerçek bir biber serasında geliştiriliyor. Problar fidelerin dibinde, modüller sıraların arasında. Sistem bu serada ",
      "45 gün",
      " boyunca ölçüm topladı.",
    ],
    after: "Sağdaki eğriler ClimaNex'in kendi kaydından alınmıştır. Ölçümler iki dakikalık ortalamaya indirilmiş, başka hiçbir düzeltme yapılmamıştır. Kayıtta boşluk olan yerde çizgi de kesilir.",
    photoAlt: "Seradaki AgroNext kurulumunun etiketli fotoğrafı: NPK sensörü, toprak nemi sensörü, pH sensörü, sulama ve gübreleme hatları, BME680, NDIR CO₂ sensörü, TerraNex ve ClimaNex ESP32 kontrol birimleri, TFT ekran ve kullanıcı paneli",
    photoCap: "Kurulumun etiketli görünümü. Bileşen adları ekibin kendi saha fotoğrafından alınmıştır.",
    notes: [
      ["Örnekleme", "5 sn, iki modül"],
      ["Zaman damgası", "yerel birimin saati"],
      ["Eksik ölçüm", "boş yazılır, doldurulmaz"],
      ["Aktarım", "yerel hat + 60 sn'de bir TLS"],
    ],
    chartTitle: "22 Eylül 2026 akşamı, ClimaNex",
    chartMeta: `${olcumSayisi.aksam.toLocaleString("tr-TR")} ölçüm · 2 dk ortalama`,
    temp: "Sıcaklık", rh: "Bağıl nem",
    read: "19:40'tan sonra sıcaklık 27,4 °C'den 26 °C'ye inerken bağıl nem %65'ten %70'e çıkıyor. Karar sistemi tek bir değere değil, bu eğilime bakar.",
  },
  en: {
    label: "Field",
    title: "A real greenhouse. Real data.",
    story: [
      "AgroNext is developed not on a lab bench but in a real ",
      "10 m²",
      " pepper greenhouse. The probes sit at the base of the plants, the modules between the rows. The system collected measurements in this greenhouse for ",
      "45 days",
      ".",
    ],
    after: "The curves on the right come straight from ClimaNex's own log. Readings are reduced to two-minute averages and nothing else is changed. Where the log has a gap, the line breaks too.",
    photoAlt: "Annotated photo of the AgroNext setup in the greenhouse: NPK sensor, soil moisture sensor, pH sensor, irrigation and fertiliser lines, BME680, NDIR CO₂ sensor, TerraNex and ClimaNex ESP32 controllers, TFT display and user panel",
    photoCap: "Annotated view of the setup. Component names come from the team's own field photo.",
    notes: [
      ["Sampling", "5 s, both modules"],
      ["Timestamp", "local unit clock"],
      ["Missing reading", "left empty, never filled"],
      ["Transport", "local line + TLS every 60 s"],
    ],
    chartTitle: "Evening of 22 September 2026, ClimaNex",
    chartMeta: `${olcumSayisi.aksam.toLocaleString("en-US")} readings · 2 min average`,
    temp: "Temperature", rh: "Relative humidity",
    read: "After 19:40 temperature falls from 27.4 °C to 26 °C while relative humidity climbs from 65 % to 70 %. The decision system looks at this trend, not at a single value.",
  },
}

export function Field({ locale }: { locale: L }) {
  const t = pick(locale, copy)
  return (
    <section className="s-section s-field" id="saha" data-stage="2" aria-labelledby="field-title">
      <figure className="s-field-photo">
        <div className="s-field-frame">
          <Image src="/agronext/sera-etiketli.jpg" alt={t.photoAlt} fill sizes="100vw" />
        </div>
        <figcaption className="s-wrap">{t.photoCap}</figcaption>
      </figure>

      <div className="s-wrap s-field-grid">
        <div className="s-field-text">
          <p className="s-label">{t.label}</p>
          <h2 id="field-title">{t.title}</h2>
          <p className="s-field-story">
            {t.story[0]}<strong>{t.story[1]}</strong>{t.story[2]}<strong>{t.story[3]}</strong>{t.story[4]}
          </p>
          <p>{t.after}</p>
          <dl className="s-notes">
            {t.notes.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </div>

        <div className="s-field-charts" data-reveal>
          <div className="s-field-charthead">
            <p>{t.chartTitle}</p>
            <p className="s-mono">{t.chartMeta}</p>
          </div>
          <div className="s-field-series">
            <span className="s-series-label">{t.temp} · °C</span>
            <LineChart data={aksamKaydi} field={1} unit="°C" label={t.temp} width={760} height={210} />
          </div>
          <div className="s-field-series">
            <span className="s-series-label">{t.rh} · %</span>
            <LineChart data={aksamKaydi} field={2} unit="%" label={t.rh} width={760} height={210} className="s-chart-alt" />
          </div>
          <p className="s-field-read">{t.read}</p>
        </div>
      </div>
    </section>
  )
}
