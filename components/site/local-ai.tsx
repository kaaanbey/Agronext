import Image from "next/image"
import { pick, type L } from "./util"

// Yerel AI'yı "AI-powered" diye geçmek yerine bir kararın izini katman katman gösterir.
// Sağ sütundaki iz bir örnektir (başlıkta yazar); sınırlar ise firmware'deki gerçek
// değerlerdir: sulama en fazla 60 sn, gübre en fazla 30 sn, aynı anda tek pompa.

const copy = {
  tr: {
    label: "Yerel yapay zekâ",
    title: "Karar seranın içinde verilir.",
    body: "Model internetteki bir sunucuda değil, seradaki Arduino tabanlı birimde çalışır. Sensör akışını, son bir saatin eğilimini ve bitki profilini birlikte okur; ürettiği karar röleye gitmeden önce ayrı bir sınır denetiminden geçer.",
    traceHead: ["Katman", "Ne olur", "Örnek karar izi"],
    rows: [
      ["Sensör akışları", "ClimaNex ve TerraNex beş saniyede bir zaman damgalı ölçüm paketi gönderir.", "14:02:05 · toprak nemi %38,2 · 26,1 °C · %43 RH"],
      ["Bağlam katmanı", "Son 12 × 5 dk'lık pencere, eğilim, son sulama zamanı ve bitki profili bir araya getirilir.", "son 60 dk: nem −8 puan · son sulama 3 sa önce · biber, alt sınır %40"],
      ["Yerel AI", "GRU tabanlı zaman serisi modeli önümüzdeki 30 dakikadaki ihtiyacı değerlendirir.", "30 dk içinde sulama ihtiyacı: yüksek"],
      ["Karar", "Kanal ve süre önerilir. Her kanal için ayrı karar üretilir.", "sulama · 20 sn"],
      ["Güvenlik sınırları", "Veri tazeliği, en uzun çalışma süresi, aç/kapa aralığı ve manuel durdurma kontrol edilir. Uymayan karar kaydedilir, uygulanmaz.", "veri 5 sn ≤ 15 sn ✓ · 20 sn ≤ 60 sn ✓ · tek pompa ✓"],
      ["Aktüatör komutu", "Komut kimliği, kanal, süre ve geçerlilikle ilgili ESP32'ye gider. Süre dolunca kart pompayı kendisi kapatır.", "#0142 · TerraNex · GPIO25 · 20 sn"],
    ],
    model: "Model · GRU · girdi: sıcaklık, bağıl nem, toprak nemi, CO₂ · pencere 12 × 5 dk · ufuk 30 dk",
    whyTitle: "Neden yerel?",
    localPath: ["Sensör", "ESP32", "Yerel birim", "Röle"],
    cloudPath: ["Sensör", "ESP32", "Modem", "Sunucu", "Modem", "Röle"],
    localLabel: "AgroNext · karar yerel ağda",
    cloudLabel: "Bulut döngüsü · karar internetin öbür ucunda",
    net: "internet",
    greenhouse: "sera",
    facts: [
      ["Bağlantı kesilirse", "Ölçüm, kayıt, karar ve kontrol sürer. Uzak panel ve NexAI eşitlemeyi bekler; birikmiş kayıtlar bağlantı dönünce zaman sırasıyla aktarılır."],
      ["Gecikme", "Karar, ölçümün geldiği yerel ağdan çıkmaz. Komut ile röle arasında internet gidiş-dönüşü yoktur."],
      ["Eski komut", "Süresi geçmiş komut yeniden oynatılmaz. Bağlantı dönünce yeni karar güncel ölçümle verilir."],
    ],
    unoAlt: "Yerel karar biriminde kullanılan Arduino Uno Q kartı, USB hub'a bağlı",
    unoCap: "Yerel karar birimi · Arduino Uno Q",
  },
  en: {
    label: "Local AI",
    title: "The decision is made inside the greenhouse.",
    body: "The model runs on an Arduino-based unit in the greenhouse, not on a server on the internet. It reads the sensor stream, the last hour's trend and the plant profile together; its decision passes a separate limit check before it reaches a relay.",
    traceHead: ["Layer", "What happens", "Example decision trace"],
    rows: [
      ["Sensor streams", "ClimaNex and TerraNex send a timestamped measurement packet every five seconds.", "14:02:05 · soil moisture 38.2 % · 26.1 °C · 43 % RH"],
      ["Context layer", "A 12 × 5 min window, the trend, time of last irrigation and the plant profile are assembled.", "last 60 min: moisture −8 pts · last irrigation 3 h ago · pepper, floor 40 %"],
      ["Local AI", "A GRU time-series model evaluates the need over the next 30 minutes.", "irrigation need within 30 min: high"],
      ["Decision", "A channel and duration are proposed. Each channel gets its own decision.", "irrigation · 20 s"],
      ["Safety limits", "Data freshness, maximum run time, on/off interval and manual stop are checked. A failing decision is logged, not applied.", "data 5 s ≤ 15 s ✓ · 20 s ≤ 60 s ✓ · single pump ✓"],
      ["Actuator command", "The command goes to the right ESP32 with an ID, channel, duration and validity. When time is up the board switches the pump off itself.", "#0142 · TerraNex · GPIO25 · 20 s"],
    ],
    model: "Model · GRU · inputs: temperature, relative humidity, soil moisture, CO₂ · window 12 × 5 min · horizon 30 min",
    whyTitle: "Why local?",
    localPath: ["Sensor", "ESP32", "Local unit", "Relay"],
    cloudPath: ["Sensor", "ESP32", "Modem", "Server", "Modem", "Relay"],
    localLabel: "AgroNext · decision on the local network",
    cloudLabel: "Cloud loop · decision at the far end of the internet",
    net: "internet",
    greenhouse: "greenhouse",
    facts: [
      ["If the link drops", "Measurement, logging, decisions and control continue. The remote panel and NexAI wait for sync; buffered records are sent in time order when the link returns."],
      ["Latency", "The decision never leaves the local network the reading arrived on. There is no internet round trip between command and relay."],
      ["Stale commands", "An expired command is never replayed. When the link returns, a new decision is made on current readings."],
    ],
    unoAlt: "Arduino Uno Q board used as the local decision unit, connected to a USB hub",
    unoCap: "Local decision unit · Arduino Uno Q",
  },
}

function Path({ nodes, local, t }: { nodes: string[]; local: boolean; t: typeof copy.tr }) {
  // Basit düğüm-çizgi şeması; internet geçişleri kesik ve dalgalı işaretle gösterilir.
  const w = 560
  const step = (w - 80) / (nodes.length - 1)
  const netAfter = local ? [] : [2, 3]
  return (
    <svg viewBox={`0 0 ${w} 92`} className="s-path-svg" aria-hidden="true">
      {local ? <rect x="6.5" y="14.5" width={w - 13} height="64" className="p-zone" /> : null}
      {local ? <text x={w - 14} y="30" textAnchor="end" className="a-mono a-dim a-small">{t.greenhouse}</text> : null}
      {nodes.map((n, i) => {
        const x = 40 + i * step
        const next = 40 + (i + 1) * step
        return (
          <g key={i}>
            {i < nodes.length - 1 ? (
              netAfter.includes(i) ? (
                <g>
                  <line x1={x + 6} x2={next - 6} y1="52" y2="52" className="p-net" />
                  <text x={(x + next) / 2} y="42" textAnchor="middle" className="a-mono a-dim a-small">{t.net}</text>
                </g>
              ) : (
                <line x1={x + 6} x2={next - 6} y1="52" y2="52" className={local ? "p-link p-link-on" : "p-link"} />
              )
            ) : null}
            <circle cx={x} cy="52" r="5" className={local ? "p-node p-node-on" : "p-node"} />
            <text x={x} y="76" textAnchor="middle" className="a-mono p-label">{n}</text>
          </g>
        )
      })}
    </svg>
  )
}

export function LocalAI({ locale }: { locale: L }) {
  const t = pick(locale, copy)
  return (
    <section className="s-section s-dark s-ai" id="yapay-zeka" data-stage="3" aria-labelledby="ai-title">
      <div className="s-wrap">
        <header className="s-head s-head-split">
          <div>
            <p className="s-label">{t.label}</p>
            <h2 id="ai-title">{t.title}</h2>
          </div>
          <p className="s-head-body">{t.body}</p>
        </header>

        <div className="s-trace" data-reveal>
          <div className="s-trace-head" aria-hidden="true">
            {t.traceHead.map((h) => <span key={h}>{h}</span>)}
          </div>
          <ol>
            {t.rows.map(([layer, what, ex], i) => (
              <li key={layer} style={{ ["--i" as string]: i }}>
                <span className="s-trace-n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{layer}</h3>
                <p>{what}</p>
                <p className="s-trace-ex"><span className="s-visually-hidden">{t.traceHead[2]}: </span>{ex}</p>
              </li>
            ))}
          </ol>
          <p className="s-trace-model">{t.model}</p>
        </div>

        <div className="s-why">
          <div className="s-why-paths">
            <h3>{t.whyTitle}</h3>
            <figure>
              <figcaption>{t.localLabel}</figcaption>
              <Path nodes={t.localPath} local t={t} />
            </figure>
            <figure>
              <figcaption>{t.cloudLabel}</figcaption>
              <Path nodes={t.cloudPath} local={false} t={t} />
            </figure>
          </div>
          <dl className="s-why-facts">
            {t.facts.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          <figure className="s-uno">
            <Image src="/agronext/arduino-uno-q.png" alt={t.unoAlt} width={337} height={239} />
            <figcaption>{t.unoCap}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
