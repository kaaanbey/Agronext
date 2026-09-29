import { pick, type L } from "./util"

// Deney düzeni. Sonuç rakamı yok: karşılaştırma ham veri ve yöntemle birlikte
// yayımlanmadan sitede sayı gösterilmez. Bu bölüm neyin, nasıl ölçüldüğünü anlatır.

const copy = {
  tr: {
    label: "Deney",
    title: "Aynı sera, iki kontrol biçimi.",
    body: "Üç gün sulama elle, alışılmış düzende yapılır; sonraki üç gün kararları AgroNext verir. Ölçüm iki dönemde de aynı sensörlerle sürer; değişen yalnız kararın kimden geldiğidir.",
    yes: "ölçülür",
    manual: "Manuel kontrol",
    agro: "AgroNext kontrolü",
    day: "Gün",
    measured: "Her iki dönemde ölçülen",
    rows: ["Verilen su miktarı", "Toprak nemi eğrisi", "Sulama sayısı ve saati", "Sıcaklık · nem · CO₂", "Bitki gözlemi"],
    method: [
      ["Karşılaştırma", "ardışık iki dönem, aynı parsel"],
      ["Kayda alınan", "hava durumu ve başlangıç nemi"],
      ["Yayın", "sonuçlar ham ölçüm ve yöntemle birlikte"],
    ],
  },
  en: {
    label: "Experiment",
    title: "Same greenhouse, two ways of control.",
    body: "For three days irrigation is done by hand, on the usual routine; for the next three days AgroNext makes the decisions. The same sensors keep measuring through both periods; the only change is where the decision comes from.",
    yes: "measured",
    manual: "Manual control",
    agro: "AgroNext control",
    day: "Day",
    measured: "Measured in both periods",
    rows: ["Water applied", "Soil moisture curve", "Irrigation count and time", "Temperature · humidity · CO₂", "Plant observation"],
    method: [
      ["Comparison", "two consecutive periods, same plot"],
      ["Also recorded", "weather and starting moisture"],
      ["Publication", "results with raw measurements and method"],
    ],
  },
}

export function Experiment({ locale }: { locale: L }) {
  const t = pick(locale, copy)
  const days = [1, 2, 3, 4, 5, 6]
  return (
    <section className="s-section s-exp" id="deney" data-stage="6" aria-labelledby="exp-title">
      <div className="s-wrap s-exp-grid">
        <div className="s-exp-text">
          <p className="s-label">{t.label}</p>
          <h2 id="exp-title">{t.title}</h2>
          <p>{t.body}</p>
          <dl className="s-notes">
            {t.method.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>

        <div className="s-protocol" data-reveal>
          <table>
            <caption className="s-visually-hidden">{t.title}</caption>
            <thead>
              <tr className="s-protocol-phase">
                <th scope="col"><span className="s-visually-hidden">{t.measured}</span></th>
                <th colSpan={3} scope="colgroup" className="is-manual">{t.manual}</th>
                <th colSpan={3} scope="colgroup" className="is-agro">{t.agro}</th>
              </tr>
              <tr className="s-protocol-days">
                <th scope="col" className="s-protocol-rowhead">{t.measured}</th>
                {days.map((d) => (
                  <th key={d} scope="col" className={d <= 3 ? "is-manual" : "is-agro"}><span className="s-day-word">{t.day} </span>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.rows.map((r, i) => (
                <tr key={r}>
                  <th scope="row">{r}</th>
                  {days.map((d) => (
                    <td key={d} className={d <= 3 ? "is-manual" : "is-agro"} style={{ ["--i" as string]: i * 6 + d }}>
                      <span className="s-protocol-dot" aria-hidden="true" /><span className="s-visually-hidden">{t.yes}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
