import { pick, type L } from "./util"

// Mevcut ekipmana bağlantı: breadboard şemalarındaki gerçek parça listesinden
// (2N3904, 1 kΩ, CW-020 röle, NO kontak, sigorta, flyback diyot) çizilmiş hat şeması.

const copy = {
  tr: {
    label: "Entegrasyon",
    title: "Serada zaten olan ekipmanı sürer.",
    body: "AgroNext pompanın, fanın ya da ısıtıcının yerini almaz; onları açıp kapatan anahtarı üstlenir. Her kontrol kanalı bir transistör sürücü ve 5 V röle üzerinden kuru kontak verir. Küçük DC pompalar doğrudan, şebeke gerilimli fan ve ısıtıcılar seradaki mevcut kontaktör ya da cihazın kendi kontrol girişi üzerinden sürülür.",
    labels: {
      esp: ["ESP32", "GPIO25 · GPIO26"],
      r: "1 kΩ",
      q: "2N3904",
      coil: ["röle bobini", "5 V · düşük tetik"],
      contact: ["COM → NO", "kuru kontak"],
      fuse: "sigorta",
      pump: ["DC pompa", "sulama · dozaj"],
      diode: "flyback diyot",
      k: ["kontaktör / kontrol girişi", "mevcut pano"],
      load: ["fan · ısıtıcı", "şebeke gerilimi"],
    },
    specs: [
      ["Kanal", "4 bağımsız çıkış · TerraNex 2, ClimaNex 2"],
      ["Röle", "CW-020 · 5 V bobin · düşük tetik"],
      ["Sürücü", "2N3904 · 1 kΩ baz direnci"],
      ["Kontak", "NO kullanılır, NC boş · röle bırakınca ekipman kapalı"],
      ["Koruma", "hat sigortası · DC pompada flyback diyot"],
      ["Süre sınırı", "sulama ≤ 60 sn · gübre ≤ 30 sn · kart üzerindeki bağımsız zamanlayıcı"],
      ["Sonraki kanal", "motorlu pencere · ayrı sürücü, yön kontrolü, limit anahtarları"],
    ],
  },
  en: {
    label: "Integration",
    title: "It drives the equipment the greenhouse already has.",
    body: "AgroNext does not replace the pump, fan or heater; it takes over the switch that turns them on and off. Each control channel provides a dry contact through a transistor driver and a 5 V relay. Small DC pumps are driven directly; mains fans and heaters through the greenhouse's existing contactor or the device's own control input.",
    labels: {
      esp: ["ESP32", "GPIO25 · GPIO26"],
      r: "1 kΩ",
      q: "2N3904",
      coil: ["relay coil", "5 V · low trigger"],
      contact: ["COM → NO", "dry contact"],
      fuse: "fuse",
      pump: ["DC pump", "irrigation · dosing"],
      diode: "flyback diode",
      k: ["contactor / control input", "existing panel"],
      load: ["fan · heater", "mains voltage"],
    },
    specs: [
      ["Channels", "4 independent outputs · TerraNex 2, ClimaNex 2"],
      ["Relay", "CW-020 · 5 V coil · low trigger"],
      ["Driver", "2N3904 · 1 kΩ base resistor"],
      ["Contact", "NO used, NC left open · equipment off when relay releases"],
      ["Protection", "line fuse · flyback diode on DC pumps"],
      ["Time limit", "irrigation ≤ 60 s · fertiliser ≤ 30 s · independent on-board timer"],
      ["Next channel", "motorised vent · separate driver, direction control, limit switches"],
    ],
  },
}

export function Integration({ locale }: { locale: L }) {
  const t = pick(locale, copy)
  const l = t.labels
  return (
    <section className="s-section s-dark s-integ" id="entegrasyon" data-stage="5" aria-labelledby="integ-title">
      <div className="s-wrap">
        <header className="s-head s-head-split">
          <div>
            <p className="s-label">{t.label}</p>
            <h2 id="integ-title">{t.title}</h2>
          </div>
          <p className="s-head-body">{t.body}</p>
        </header>

        <div className="s-integ-drawing" data-reveal>
          <svg viewBox="0 0 1180 300" className="s-integ-svg" role="img" aria-label={`${l.esp[0]} → ${l.r} → ${l.q} → ${l.coil[0]} → ${l.contact[0]} → ${l.pump[0]} / ${l.k[0]} → ${l.load[0]}`}>
            {/* ESP32 */}
            <rect x="20" y="118" width="130" height="64" className="w-box" />
            <text x="36" y="146" className="w-h">{l.esp[0]}</text>
            <text x="36" y="166" className="a-mono a-dim a-small">{l.esp[1]}</text>
            <path d="M150 150 H200" className="w-wire a-flow" pathLength={1} />
            {/* direnç */}
            <path d="M200 150 l6 -10 l10 20 l10 -20 l10 20 l10 -20 l4 10" className="w-sym" />
            <text x="225" y="182" textAnchor="middle" className="a-mono a-dim">{l.r}</text>
            <path d="M250 150 H292" className="w-wire a-flow" pathLength={1} style={{ ["--d" as string]: ".1s" }} />
            {/* transistör */}
            <circle cx="316" cy="150" r="24" className="w-sym" />
            <path d="M306 136 V164 M292 150 H306 M306 144 L326 132 M306 156 L326 168" className="w-sym" />
            <text x="316" y="198" textAnchor="middle" className="a-mono a-dim">{l.q}</text>
            <path d="M340 150 H380" className="w-wire a-flow" pathLength={1} style={{ ["--d" as string]: ".2s" }} />
            {/* röle bobini */}
            <rect x="380" y="124" width="64" height="52" className="w-sym" />
            <path d="M380 176 L444 124" className="w-sym" />
            <text x="412" y="200" textAnchor="middle" className="a-mono a-dim">{l.coil[0]}</text>
            <text x="412" y="216" textAnchor="middle" className="a-mono a-dim a-small">{l.coil[1]}</text>
            {/* mekanik bağlantı */}
            <path d="M444 150 H496" className="w-mech" />
            {/* kontak */}
            <circle cx="504" cy="150" r="4" className="w-dot" />
            <circle cx="566" cy="150" r="4" className="w-dot" />
            <path d="M504 150 L560 128" className="w-sym w-lever" />
            <text x="535" y="182" textAnchor="middle" className="a-mono a-dim">{l.contact[0]}</text>
            <text x="535" y="198" textAnchor="middle" className="a-mono a-dim a-small">{l.contact[1]}</text>
            <path d="M570 150 H620" className="w-wire a-flow" pathLength={1} style={{ ["--d" as string]: ".3s" }} />

            {/* kol A: DC pompa */}
            <path d="M620 150 V70 H672" className="w-wire a-flow" pathLength={1} style={{ ["--d" as string]: ".4s" }} />
            <rect x="672" y="60" width="52" height="20" className="w-sym" />
            <path d="M672 70 H724" className="w-sym" />
            <text x="698" y="48" textAnchor="middle" className="a-mono a-dim a-small">{l.fuse}</text>
            <path d="M724 70 H790" className="w-wire a-flow" pathLength={1} style={{ ["--d" as string]: ".5s" }} />
            <circle cx="814" cy="70" r="24" className="w-sym w-load" />
            <text x="814" y="76" textAnchor="middle" className="w-m">M</text>
            <path d="M790 30 H838 M814 30 V46 M814 94 V110 M790 110 H838" className="w-sym w-thin" />
            <path d="M806 22 L822 22 L814 34 Z" className="w-sym w-thin" />
            <text x="850" y="26" className="a-mono a-dim a-small">{l.diode}</text>
            <text x="858" y="66" className="w-h">{l.pump[0]}</text>
            <text x="858" y="86" className="a-mono a-dim a-small">{l.pump[1]}</text>

            {/* kol B: kontaktör → şebeke yükü */}
            <path d="M620 150 V240 H680" className="w-wire a-flow" pathLength={1} style={{ ["--d" as string]: ".45s" }} />
            <rect x="680" y="214" width="92" height="52" className="w-sym" />
            <text x="726" y="246" textAnchor="middle" className="w-m">K</text>
            <text x="726" y="286" textAnchor="middle" className="a-mono a-dim a-small">{l.k[0]}</text>
            <path d="M772 240 H846" className="w-wire w-mains a-flow" pathLength={1} style={{ ["--d" as string]: ".6s" }} />
            <rect x="846" y="212" width="170" height="56" className="w-box w-load" />
            <text x="862" y="236" className="w-h">{l.load[0]}</text>
            <text x="862" y="256" className="a-mono a-dim a-small">{l.load[1]}</text>
            <text x="1030" y="244" className="a-mono a-dim a-small">{l.k[1]}</text>
          </svg>
        </div>

        <dl className="s-integ-specs">
          {t.specs.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </div>
    </section>
  )
}
