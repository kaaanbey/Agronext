import Image from "next/image"
import { LineChart } from "./chart"
import { aksamKaydi, co2Kaydi } from "@/lib/content/saha-verisi"
import { pick, type L } from "./util"

// ClimaNex ve TerraNex aynı iskeleti paylaşmaz: biri fotoğraf solda + gerçek kayıt
// grafikleri, diğeri ters kompozisyon + elektronik yerleşim kesiti. Ortak olan yalnız
// "spec tablosu" dili; fotoğraftaki numaralı işaretler tablo satırlarıyla eşleşir.

type Row = { n?: number; m: string; part: string; bus: string; unit: string }

function SpecTable({ rows, head, caption }: { rows: Row[]; head: string[]; caption: string }) {
  return (
    <table className="s-spec">
      <caption className="s-visually-hidden">{caption}</caption>
      <thead>
        <tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.m + r.bus}>
            <th scope="row">{r.n ? <span className="s-pin">{r.n}</span> : <span className="s-pin s-pin-out" />}{r.m}</th>
            <td>{r.part}</td>
            <td className="s-mono">{r.bus}</td>
            <td className="s-mono">{r.unit}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Pin({ n, x, y }: { n: number; x: number; y: number }) {
  return <span className="s-photo-pin" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true">{n}</span>
}

const climaCopy = {
  tr: {
    label: "Modül 01 · İklim",
    lead: "ClimaNex sera içindeki sıcaklık, bağıl nem ve CO₂ seviyesini beş saniyede bir ölçer, her okumayı zaman damgasıyla paketleyip karar sistemine aktarır. Isıtıcı ve fan için iki bağımsız kontrol çıkışı taşır; ekranı güncel değerleri seranın içinde gösterir.",
    head: ["Ölçüm / çıkış", "Bileşen", "Arayüz", "Birim"],
    rows: [
      { n: 1, m: "Sıcaklık", part: "BME680", bus: "I²C 0x76", unit: "°C" },
      { n: 1, m: "Bağıl nem", part: "BME680", bus: "I²C 0x76", unit: "%RH" },
      { n: 2, m: "CO₂", part: "MH-Z14A NDIR", bus: "UART", unit: "ppm" },
      { n: 3, m: "Yerinde ekran", part: "1,8″ TFT", bus: "SPI", unit: "—" },
      { n: 4, m: "Isıtıcı", part: "5 V röle, düşük tetik", bus: "GPIO25", unit: "NO" },
      { n: 4, m: "Fan", part: "5 V röle, düşük tetik", bus: "GPIO26", unit: "NO" },
    ],
    caption: "ClimaNex bileşenleri",
    photoAlt: "ClimaNex breadboard prototipi: ESP32, mor BME680 kartı, altın renkli MH-Z14A CO₂ sensörü, ölçümleri gösteren TFT ekran, iki buton ve iki röle",
    photoCap: "ClimaNex, masa testi. Ekranda 26,5 °C · %69 · 1340 ppm · 1005,5 hPa.",
    logLabel: "Kayıttan",
    temp: "Sıcaklık", rh: "Bağıl nem", co2: "CO₂",
    evening: "22 Eyl 2026 · 19:10–22:45",
    co2When: "25 Eyl 2026 · 13:40–14:50",
    detail: "ClimaNex teknik sayfası",
  },
  en: {
    label: "Module 01 · Climate",
    lead: "ClimaNex measures temperature, relative humidity and CO₂ inside the greenhouse every five seconds, timestamps each reading and hands it to the decision system. It carries two independent control outputs, for a heater and a fan, and shows current values on its own display.",
    head: ["Reading / output", "Component", "Interface", "Unit"],
    rows: [
      { n: 1, m: "Temperature", part: "BME680", bus: "I²C 0x76", unit: "°C" },
      { n: 1, m: "Relative humidity", part: "BME680", bus: "I²C 0x76", unit: "%RH" },
      { n: 2, m: "CO₂", part: "MH-Z14A NDIR", bus: "UART", unit: "ppm" },
      { n: 3, m: "On-site display", part: "1.8″ TFT", bus: "SPI", unit: "—" },
      { n: 4, m: "Heater", part: "5 V relay, low trigger", bus: "GPIO25", unit: "NO" },
      { n: 4, m: "Fan", part: "5 V relay, low trigger", bus: "GPIO26", unit: "NO" },
    ],
    caption: "ClimaNex components",
    photoAlt: "ClimaNex breadboard prototype: ESP32, purple BME680 board, gold MH-Z14A CO₂ sensor, TFT screen showing readings, two buttons and two relays",
    photoCap: "ClimaNex, bench test. Screen: 26.5 °C · 69 % · 1340 ppm · 1005.5 hPa.",
    logLabel: "From the log",
    temp: "Temperature", rh: "Relative humidity", co2: "CO₂",
    evening: "22 Sep 2026 · 19:10–22:45",
    co2When: "25 Sep 2026 · 13:40–14:50",
    detail: "ClimaNex technical page",
  },
}

export function ClimaNex({ locale }: { locale: L }) {
  const t = pick(locale, climaCopy)
  return (
    <section className="s-section s-module s-clima" id="climanex" data-stage="1" aria-labelledby="clima-title">
      <div className="s-wrap s-module-grid">
        <figure className="s-module-photo" data-reveal>
          <div className="s-module-photo-frame s-ratio-clima">
            <Image src="/agronext/climanex-prototip.png" alt={t.photoAlt} fill sizes="(max-width: 900px) 100vw, 46vw" />
            <Pin n={1} x={22} y={32} />
            <Pin n={2} x={78} y={36} />
            <Pin n={3} x={38} y={55} />
            <Pin n={4} x={44} y={82} />
          </div>
          <figcaption>{t.photoCap}</figcaption>
        </figure>

        <div className="s-module-text">
          <p className="s-label">{t.label}</p>
          <h2 id="clima-title" className="s-product-name">ClimaNex</h2>
          <p className="s-module-lead">{t.lead}</p>
          <SpecTable rows={t.rows} head={t.head} caption={t.caption} />

          <div className="s-logs" data-reveal>
            <p className="s-label s-label-quiet">{t.logLabel}</p>
            <div className="s-log">
              <p><span>{t.temp}</span><span className="s-mono">{t.evening}</span></p>
              <LineChart data={aksamKaydi} field={1} unit="°C" label={t.temp} height={120} ticks={3} />
            </div>
            <div className="s-log">
              <p><span>{t.rh}</span><span className="s-mono">{t.evening}</span></p>
              <LineChart data={aksamKaydi} field={2} unit="%" label={t.rh} height={120} ticks={3} />
            </div>
            <div className="s-log">
              <p><span>{t.co2}</span><span className="s-mono">{t.co2When}</span></p>
              <LineChart data={co2Kaydi} field={3} unit="ppm" label={t.co2} height={120} ticks={3} decimals={0} gap={4} />
            </div>
          </div>
          <a className="s-link" href={`/${locale}/climanex`}>{t.detail}<span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
  )
}

const terraCopy = {
  tr: {
    label: "Modül 02 · Kök bölgesi",
    lead: "TerraNex bitkinin kök bölgesini okur: toprak nemi ve pH analog girişlerden, NPK değerleri RS485 / Modbus hattından gelir. Aynı kart sulama pompasını ve hazır besin çözeltisinin dozaj pompasını iki ayrı röleyle sürer; iki pompa asla aynı anda çalışmaz.",
    head: ["Ölçüm / çıkış", "Bileşen", "Arayüz", "Birim"],
    rows: [
      { n: 1, m: "Toprak nemi", part: "Kapasitif prob", bus: "ADC · GPIO34", unit: "% göreli" },
      { n: 2, m: "pH", part: "Analog arayüz + BNC elektrot", bus: "ADC · GPIO35", unit: "pH" },
      { n: 3, m: "NPK", part: "RS485 prob + MAX3485", bus: "Modbus RTU", unit: "mg/kg" },
      { n: 4, m: "Sulama pompası", part: "5 V röle, düşük tetik", bus: "GPIO25", unit: "NO" },
      { n: 4, m: "Gübre dozajı", part: "5 V röle, düşük tetik", bus: "GPIO26", unit: "NO" },
    ],
    caption: "TerraNex bileşenleri",
    photoAlt: "Serada biber fidelerinin dibinde toprağa yerleştirilmiş NPK probu, pH elektrodu ve kapasitif nem sensörü; kablolar TerraNex breadboard'una gidiyor",
    photoCap: "TerraNex probları toprakta: NPK, pH elektrodu, kapasitif nem.",
    schemAlt: "TerraNex elektronik yerleşimi: pH arayüz kartı ve 10k/10k gerilim bölücü, kapasitif nem sensörü, MAX3485 RS485 arayüzü ve NPK probu",
    schemCap: "Elektronik yerleşim, kesit. pH çıkışı bölücüyle 3,3 V'a indirilir; NPK hattı ESP32'ye doğrudan değil MAX3485 üzerinden bağlanır.",
    detail: "TerraNex teknik sayfası",
  },
  en: {
    label: "Module 02 · Root zone",
    lead: "TerraNex reads the root zone: soil moisture and pH arrive on analog inputs, NPK values over an RS485 / Modbus line. The same board drives the irrigation pump and the dosing pump for a prepared nutrient solution through two separate relays; the two pumps never run at the same time.",
    head: ["Reading / output", "Component", "Interface", "Unit"],
    rows: [
      { n: 1, m: "Soil moisture", part: "Capacitive probe", bus: "ADC · GPIO34", unit: "% relative" },
      { n: 2, m: "pH", part: "Analog interface + BNC electrode", bus: "ADC · GPIO35", unit: "pH" },
      { n: 3, m: "NPK", part: "RS485 probe + MAX3485", bus: "Modbus RTU", unit: "mg/kg" },
      { n: 4, m: "Irrigation pump", part: "5 V relay, low trigger", bus: "GPIO25", unit: "NO" },
      { n: 4, m: "Fertiliser dosing", part: "5 V relay, low trigger", bus: "GPIO26", unit: "NO" },
    ],
    caption: "TerraNex components",
    photoAlt: "NPK probe, pH electrode and capacitive moisture sensor in the soil at the base of pepper plants; cables run to the TerraNex breadboard",
    photoCap: "TerraNex probes in the soil: NPK, pH electrode, capacitive moisture.",
    schemAlt: "TerraNex electronic layout: pH interface board with 10k/10k divider, capacitive moisture sensor, MAX3485 RS485 interface and NPK probe",
    schemCap: "Electronic layout, detail. The pH output is divided down to 3.3 V; the NPK line connects through a MAX3485, never directly to the ESP32.",
    detail: "TerraNex technical page",
  },
}

export function TerraNex({ locale }: { locale: L }) {
  const t = pick(locale, terraCopy)
  return (
    <section className="s-section s-module s-terra" id="terranex" data-stage="1" aria-labelledby="terra-title">
      <div className="s-wrap s-module-grid s-module-grid-rev">
        <div className="s-module-text">
          <p className="s-label">{t.label}</p>
          <h2 id="terra-title" className="s-product-name">TerraNex</h2>
          <p className="s-module-lead">{t.lead}</p>
          <SpecTable rows={t.rows} head={t.head} caption={t.caption} />
          <figure className="s-schem-crop" data-reveal>
            <div className="s-schem-frame">
              <Image src="/agronext/terranex-sema.png" alt={t.schemAlt} fill sizes="(max-width: 900px) 100vw, 40vw" />
            </div>
            <figcaption>{t.schemCap}</figcaption>
          </figure>
          <a className="s-link" href={`/${locale}/terranex`}>{t.detail}<span aria-hidden="true">→</span></a>
        </div>

        <figure className="s-module-photo" data-reveal>
          <div className="s-module-photo-frame s-ratio-terra">
            <Image src="/agronext/sera-prototip.jpg" alt={t.photoAlt} fill sizes="(max-width: 900px) 100vw, 50vw" className="s-crop-terra" />
            <Pin n={1} x={60.6} y={41.3} />
            <Pin n={2} x={66} y={35.5} />
            <Pin n={3} x={38.6} y={49.3} />
            <Pin n={4} x={75} y={74} />
          </div>
          <figcaption>{t.photoCap}</figcaption>
        </figure>
      </div>
    </section>
  )
}
