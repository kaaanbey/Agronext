import { pick, type L } from "./util"

// Sistem mimarisi. Masaüstünde elle çizilmiş SVG (veri akışı PDF'inin sadeleştirilmiş
// hâli), mobilde aynı içeriğin dikey HTML sürümü. HTML sürümü aynı zamanda erişilebilir
// metindir: masaüstünde görsel olarak gizlenir ama ekran okuyucu onu okur, SVG aria-hidden.

const copy = {
  tr: {
    label: "Sistem",
    title: "Ölçümden röleye tek bir kapalı döngü.",
    body: "İki sensör modülü, bir yerel karar birimi ve dört bağımsız kontrol kanalı. Her karar bir ölçüm paketine dayanır, her komut bir denetimden geçer, her uygulamanın etkisi bir sonraki ölçümde görülür.",
    cols: ["01 Algılama", "02 Veri", "03 Yerel AI", "04 Karar", "05 Uygulama"],
    clima: ["Sıcaklık", "Bağıl nem", "CO₂"],
    climaBus: ["BME680 · I²C", "BME680 · I²C", "NDIR · UART"],
    terra: ["Toprak nemi", "pH", "NPK"],
    terraBus: ["kapasitif · ADC", "analog · ADC", "RS485 · Modbus"],
    packet: "Ölçüm paketi",
    packetRows: ["cihaz · bölge", "zaman · sıra no", "değer · birim", "kalite bayrağı"],
    store: "Yerel veri deposu",
    storeSub: "geçmiş · işlem kaydı",
    profile: "Bitki profili",
    profileSub: "eşikler · hedef aralık",
    ai: "Yerel AI",
    aiSub: ["Arduino tabanlı birim", "iklim + kök bölgesi", "+ geçmiş eğilim"],
    decisions: ["Sulama", "Gübreleme", "Havalandırma", "Isıtma"],
    gate: "denetim",
    gateSub: "veri tazeliği · süre · aralık",
    outputs: ["Sulama pompası", "Dozaj pompası", "Fan", "Isıtıcı"],
    outputBus: ["TerraNex · GPIO25", "TerraNex · GPIO26", "ClimaNex · GPIO26", "ClimaNex · GPIO25"],
    feedback: "uygulamadan sonraki yeni ölçüm döngüyü yeniden başlatır",
    zone: "sera içi · internete bağlı olmadan çalışan alan",
    steps: [
      { n: "01", h: "Algılama", b: "ClimaNex: sıcaklık, bağıl nem (BME680, I²C) ve CO₂ (NDIR, UART). TerraNex: toprak nemi (ADC), pH (ADC) ve NPK (RS485 / Modbus RTU)." },
      { n: "02", h: "Veri", b: "Her ölçüm cihaz, bölge, zaman, birim ve kalite bilgisiyle paketlenir; geçmiş ölçümler ve bitki profiliyle birlikte yerel depoda tutulur." },
      { n: "03", h: "Yerel AI", b: "Arduino tabanlı yerel birimdeki model iklim, kök bölgesi ve geçmiş eğilimi birlikte değerlendirir." },
      { n: "04", h: "Karar", b: "Sulama, gübreleme, havalandırma ve ısıtma için ayrı karar üretilir; her karar veri tazeliği, süre ve aç/kapa aralığı sınırlarından geçer." },
      { n: "05", h: "Uygulama", b: "Onaylanan komut ilgili ESP32'ye gider: TerraNex sulama ve dozaj pompasını, ClimaNex fan ve ısıtıcıyı röle üzerinden sürer. Yeni ölçüm döngüyü yeniden başlatır." },
    ],
  },
  en: {
    label: "System",
    title: "One closed loop from measurement to relay.",
    body: "Two sensor modules, one local decision unit and four independent control channels. Every decision rests on a measurement packet, every command passes a check, and the effect of every action shows up in the next reading.",
    cols: ["01 Sensing", "02 Data", "03 Local AI", "04 Decision", "05 Action"],
    clima: ["Temperature", "Rel. humidity", "CO₂"],
    climaBus: ["BME680 · I²C", "BME680 · I²C", "NDIR · UART"],
    terra: ["Soil moisture", "pH", "NPK"],
    terraBus: ["capacitive · ADC", "analog · ADC", "RS485 · Modbus"],
    packet: "Measurement packet",
    packetRows: ["device · zone", "time · sequence", "value · unit", "quality flag"],
    store: "Local data store",
    storeSub: "history · action log",
    profile: "Plant profile",
    profileSub: "thresholds · target band",
    ai: "Local AI",
    aiSub: ["Arduino-based unit", "climate + root zone", "+ recent trend"],
    decisions: ["Irrigation", "Fertilising", "Ventilation", "Heating"],
    gate: "check",
    gateSub: "freshness · duration · interval",
    outputs: ["Irrigation pump", "Dosing pump", "Fan", "Heater"],
    outputBus: ["TerraNex · GPIO25", "TerraNex · GPIO26", "ClimaNex · GPIO26", "ClimaNex · GPIO25"],
    feedback: "the next reading after an action restarts the loop",
    zone: "inside the greenhouse · runs without internet",
    steps: [
      { n: "01", h: "Sensing", b: "ClimaNex: temperature, relative humidity (BME680, I²C) and CO₂ (NDIR, UART). TerraNex: soil moisture (ADC), pH (ADC) and NPK (RS485 / Modbus RTU)." },
      { n: "02", h: "Data", b: "Each reading is packaged with device, zone, time, unit and quality, and kept in a local store with history and the plant profile." },
      { n: "03", h: "Local AI", b: "The model on the Arduino-based local unit evaluates climate, root zone and recent trend together." },
      { n: "04", h: "Decision", b: "Separate decisions for irrigation, fertilising, ventilation and heating; each passes data-freshness, duration and on/off interval limits." },
      { n: "05", h: "Action", b: "The approved command goes to the right ESP32: TerraNex drives the irrigation and dosing pumps, ClimaNex the fan and heater, through relays. The next reading restarts the loop." },
    ],
  },
}

const ROWS = [150, 230, 320, 400]

export function Architecture({ locale }: { locale: L }) {
  const t = pick(locale, copy)
  return (
    <section className="s-section s-dark s-arch" id="sistem" data-stage="all" aria-labelledby="arch-title">
      <div className="s-wrap">
        <header className="s-head s-head-split">
          <div>
            <p className="s-label">{t.label}</p>
            <h2 id="arch-title">{t.title}</h2>
          </div>
          <p className="s-head-body">{t.body}</p>
        </header>

        <div className="s-arch-canvas" data-reveal>
          <svg viewBox="0 0 1240 600" className="s-arch-svg" aria-hidden="true">
            {/* bölge: sera içi */}
            <rect x="0.5" y="44.5" width="1239" height="530" className="a-zone" />
            <text x="1228" y="566" textAnchor="end" className="a-mono a-dim">{t.zone}</text>

            {t.cols.map((c, i) => (
              <text key={c} x={[0, 300, 570, 820, 1060][i] ?? 0} y="24" className="a-mono a-col">{c}</text>
            ))}

            {/* 01 ClimaNex */}
            <g className="a-block" style={{ ["--d" as string]: "0s" }}>
              <rect x="16" y="64" width="234" height="176" />
              <text x="32" y="94" className="a-h">ClimaNex</text>
              {t.clima.map((m, i) => (
                <g key={m}>
                  <line x1="32" x2="234" y1={116 + i * 38} y2={116 + i * 38} className="a-rule" />
                  <text x="32" y={138 + i * 38} className="a-t">{m}</text>
                  <text x="234" y={138 + i * 38} textAnchor="end" className="a-mono a-dim">{t.climaBus[i]}</text>
                </g>
              ))}
            </g>
            {/* 01 TerraNex */}
            <g className="a-block">
              <rect x="16" y="300" width="234" height="176" />
              <text x="32" y="330" className="a-h">TerraNex</text>
              {t.terra.map((m, i) => (
                <g key={m}>
                  <line x1="32" x2="234" y1={352 + i * 38} y2={352 + i * 38} className="a-rule" />
                  <text x="32" y={374 + i * 38} className="a-t">{m}</text>
                  <text x="234" y={374 + i * 38} textAnchor="end" className="a-mono a-dim">{t.terraBus[i]}</text>
                </g>
              ))}
            </g>

            {/* 01 → 02 */}
            <path d="M250 152 H275 V262 H300" className="a-flow" pathLength={1} style={{ ["--d" as string]: ".1s" }} />
            <path d="M250 388 H275 V262" className="a-flow" pathLength={1} style={{ ["--d" as string]: ".1s" }} />
            <text x="268" y="280" textAnchor="end" className="a-mono a-dim a-small">ESP32</text>

            {/* 02 paket */}
            <g className="a-block">
              <rect x="300" y="170" width="220" height="184" />
              <text x="316" y="198" className="a-h a-h-s">{t.packet}</text>
              {t.packetRows.map((r, i) => (
                <g key={r}>
                  <rect x="316" y={214 + i * 32} width="188" height="24" className="a-cell" />
                  <text x="326" y={230 + i * 32} className="a-mono">{r}</text>
                </g>
              ))}
            </g>
            <g className="a-block">
              <rect x="300" y="400" width="220" height="56" />
              <text x="316" y="424" className="a-t">{t.store}</text>
              <text x="316" y="444" className="a-mono a-dim">{t.storeSub}</text>
            </g>
            <g className="a-block">
              <rect x="300" y="470" width="220" height="56" />
              <text x="316" y="494" className="a-t">{t.profile}</text>
              <text x="316" y="514" className="a-mono a-dim">{t.profileSub}</text>
            </g>
            <path d="M410 354 V400" className="a-flow a-flow-dim" pathLength={1} style={{ ["--d" as string]: ".3s" }} />

            {/* 02 → 03 */}
            <path d="M520 262 H570" className="a-flow" pathLength={1} style={{ ["--d" as string]: ".35s" }} />
            <path d="M520 428 H545 V312 H570" className="a-flow a-flow-dim" pathLength={1} style={{ ["--d" as string]: ".4s" }} />
            <path d="M520 498 H552 V330 H570" className="a-flow a-flow-dim" pathLength={1} style={{ ["--d" as string]: ".45s" }} />

            {/* 03 yerel AI */}
            <g className="a-block a-core">
              <rect x="570" y="190" width="200" height="170" />
              <text x="590" y="236" className="a-core-h">{t.ai}</text>
              {t.aiSub.map((s, i) => (
                <text key={s} x="590" y={272 + i * 22} className="a-mono">{s}</text>
              ))}
            </g>

            {/* 03 → 04 */}
            {ROWS.map((y, i) => (
              <path key={y} d={`M770 275 H795 V${y + 22} H820`} className="a-flow" pathLength={1} style={{ ["--d" as string]: `${0.6 + i * 0.06}s` }} />
            ))}
            {t.decisions.map((d, i) => (
              <g key={d} className="a-block">
                <rect x="820" y={ROWS[i]!} width="170" height="44" />
                <text x="836" y={ROWS[i]! + 27} className="a-t">{d}</text>
              </g>
            ))}

            {/* denetim kapısı */}
            <g className="a-gate">
              <rect x="1008" y="132" width="16" height="330" />
              <text x="1016" y="120" textAnchor="middle" className="a-mono a-col">{t.gate}</text>
              <text x="1016" y="484" textAnchor="middle" className="a-mono a-dim a-small">{t.gateSub}</text>
            </g>

            {/* 04 → 05 */}
            {ROWS.map((y, i) => (
              <path key={y} d={`M990 ${y + 22} H1060`} className="a-flow" pathLength={1} style={{ ["--d" as string]: `${0.9 + i * 0.06}s` }} />
            ))}
            {t.outputs.map((o, i) => (
              <g key={o} className="a-block a-out">
                <rect x="1060" y={ROWS[i]!} width="164" height="44" />
                <text x="1074" y={ROWS[i]! + 19} className="a-t">{o}</text>
                <text x="1074" y={ROWS[i]! + 35} className="a-mono a-dim a-small">{t.outputBus[i]}</text>
              </g>
            ))}

            {/* geri besleme */}
            <path d="M1142 444 V548 H124 V476" className="a-flow a-feedback" pathLength={1} style={{ ["--d" as string]: "1.3s" }} />
            <text x="640" y="540" textAnchor="middle" className="a-mono a-dim">{t.feedback}</text>
          </svg>

          <ol className="s-arch-steps">
            {t.steps.map((s) => (
              <li key={s.n}>
                <span className="s-arch-n">{s.n}</span>
                <div>
                  <h3>{s.h}</h3>
                  <p>{s.b}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
