"use client"

import { useId, useState } from "react"
import { co2Kaydi } from "@/lib/content/saha-verisi"
import type { L } from "./util"

// NexAI bölümü ekran görüntüsü değil, kodla kurulmuş bir ürün arayüzüdür.
// Sorular sekme gibi çalışır (ARIA tablist). Konuşmalar örnektir; CO₂ sorusundaki
// mini grafik ise gerçek 25 Eylül kaydından çizilir.

type Answer = { q: string; a: string[]; source: string; chart?: boolean; chips?: string[] }

const copy: Record<L, { label: string; title: string; body: string; guard: string; note: string; header: string; status: string; placeholder: string; items: Answer[] }> = {
  tr: {
    label: "NexAI",
    title: "NexAI ile konuş.",
    body: "Web ve mobil uygulamadaki NexAI, seranla ilgili bir soruyu ölçüm geçmişi, karar kayıtları ve komut geçmişiyle birlikte yanıtlar. Her yanıtın hangi ölçüme dayandığını gösterir.",
    guard: "NexAI pompayı, fanı ya da ısıtıcıyı doğrudan çalıştıramaz. Önerisi, yerel AI kararlarıyla aynı sınır denetiminden geçer.",
    note: "Örnek konuşma.",
    header: "NexAI · Biber serası",
    status: "bağlı · son veri 14:05",
    placeholder: "Seran hakkında bir şey sor…",
    items: [
      {
        q: "Kuzey bölümünde sulama neden başladı?",
        a: [
          "Kuzey bölümde toprak nemi son 50 dakikada %46'dan %38'e indi. Bu hızla, bitki profilindeki %40 alt sınırın yarım saat içinde aşılacağı görülüyordu.",
          "Yerel model sulama önerdi. Denetim veri tazeliğini, süreyi ve pompanın son çalışmasından bu yana geçen zamanı onayladı. Sulama kanalı 14:02'de 20 saniye çalıştı.",
        ],
        chips: ["nem %46 → %38", "karar #0142", "20 sn"],
        source: "TerraNex · toprak nemi 13:12–14:02 · karar kaydı #0142",
      },
      {
        q: "Son 24 saatte CO₂ seviyesi nasıl değişti?",
        a: [
          "En belirgin değişim öğleden sonra oldu: CO₂ 13:42'de 1220 ppm iken 14:35'te 553 ppm'e indi. Düşüşün büyük kısmı ilk 15 dakikada gerçekleşti; bu hız, sera havasının dışarıyla hızla değiştiğine işaret ediyor.",
          "Bu aralığı fan ve kapı kayıtlarıyla yan yana görmek için Geçmiş sekmesini açabilirsin.",
        ],
        chart: true,
        source: "ClimaNex · NDIR CO₂ · 13:42–14:35",
      },
      {
        q: "Toprak nemi neden hedef değerin altında?",
        a: [
          "Son sulamadan bu yana 3 saat geçti ve sera sıcaklığı öğleden sonra 27 °C'nin üzerinde kaldı; buharlaşma arttı. Toprak nemi şu an %38, hedef aralığın alt sınırı %40.",
          "Bir sonraki karar döngüsünde sulama değerlendirilecek. Pompa son 24 saatte 4 kez çalıştı, toplam 80 saniye.",
        ],
        chips: ["%38 / hedef %40–60", "son sulama 3 sa önce"],
        source: "TerraNex · toprak nemi · ClimaNex · sıcaklık · komut geçmişi",
      },
    ],
  },
  en: {
    label: "NexAI",
    title: "Talk to NexAI.",
    body: "In the web and mobile app, NexAI answers questions about your greenhouse using measurement history, decision records and command history, and shows which readings each answer rests on.",
    guard: "NexAI cannot switch a pump, fan or heater directly. Its suggestions pass the same limit check as local AI decisions.",
    note: "Example conversation.",
    header: "NexAI · Pepper greenhouse",
    status: "connected · last data 14:05",
    placeholder: "Ask something about your greenhouse…",
    items: [
      {
        q: "Why did irrigation start in the north section?",
        a: [
          "In the north section soil moisture fell from 46 % to 38 % over the last 50 minutes. At that rate the 40 % floor in the plant profile would be crossed within half an hour.",
          "The local model proposed irrigation. The check confirmed data freshness, duration and time since the pump last ran. The irrigation channel ran for 20 seconds at 14:02.",
        ],
        chips: ["moisture 46 % → 38 %", "decision #0142", "20 s"],
        source: "TerraNex · soil moisture 13:12–14:02 · decision log #0142",
      },
      {
        q: "How did CO₂ change over the last 24 hours?",
        a: [
          "The clearest change came in the afternoon: CO₂ was 1220 ppm at 13:42 and 553 ppm at 14:35. Most of the drop happened within the first 15 minutes, which points to a fast air exchange with the outside.",
          "Open the History tab to see this window next to the fan and door records.",
        ],
        chart: true,
        source: "ClimaNex · NDIR CO₂ · 13:42–14:35",
      },
      {
        q: "Why is soil moisture below target?",
        a: [
          "Three hours have passed since the last irrigation and the greenhouse stayed above 27 °C through the afternoon, so evaporation rose. Soil moisture is 38 %; the lower bound of the target band is 40 %.",
          "Irrigation will be evaluated in the next decision cycle. The pump ran 4 times in the last 24 hours, 80 seconds in total.",
        ],
        chips: ["38 % / target 40–60 %", "last irrigation 3 h ago"],
        source: "TerraNex · soil moisture · ClimaNex · temperature · command history",
      },
    ],
  },
}

function MiniCo2() {
  const w = 300, h = 70
  const ys = co2Kaydi.map((r) => r[3])
  const y0 = Math.min(...ys), y1 = Math.max(...ys)
  const d = co2Kaydi.map((r, i) => `${i ? "L" : "M"}${((i / (co2Kaydi.length - 1)) * (w - 8) + 4).toFixed(1)} ${(6 + (1 - (r[3] - y0) / (y1 - y0)) * (h - 12)).toFixed(1)}`).join("")
  return (
    <figure className="s-chat-chart">
      <svg viewBox={`0 0 ${w} ${h}`} aria-hidden="true"><path d={d} /></svg>
      <figcaption><span>{Math.round(y1)} ppm</span><span>{Math.round(y0)} ppm</span></figcaption>
    </figure>
  )
}

export function NexAI({ locale }: { locale: L }) {
  const t = copy[locale] ?? copy.tr
  const [active, setActive] = useState(0)
  const id = useId()
  const item = t.items[active] ?? t.items[0]!

  return (
    <section className="s-section s-nexai" id="nexai" data-stage="4" aria-labelledby="nexai-title">
      <div className="s-wrap s-nexai-grid">
        <div className="s-nexai-text">
          <p className="s-label">{t.label}</p>
          <h2 id="nexai-title">{t.title}</h2>
          <p>{t.body}</p>
          <div role="tablist" aria-label={t.title} className="s-questions">
            {t.items.map((it, i) => (
              <button
                key={it.q}
                role="tab"
                type="button"
                id={`${id}-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`${id}-panel`}
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); setActive((active + 1) % t.items.length) }
                  if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); setActive((active + t.items.length - 1) % t.items.length) }
                }}
              >
                <span className="s-q-n">{String(i + 1).padStart(2, "0")}</span>
                {it.q}
              </button>
            ))}
          </div>
          <p className="s-guard">{t.guard}</p>
        </div>

        <div className="s-chat" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`}>
          <div className="s-chat-bar">
            <span className="s-chat-mark" aria-hidden="true" />
            <span className="s-chat-name">{t.header}</span>
            <span className="s-chat-status">{t.status}</span>
          </div>
          <div className="s-chat-body" key={active}>
            <p className="s-msg-user">{item.q}</p>
            <div className="s-msg-ai">
              <span className="s-msg-who">NexAI</span>
              {item.a.map((p) => <p key={p}>{p}</p>)}
              {item.chart ? <MiniCo2 /> : null}
              {item.chips ? <ul className="s-chips">{item.chips.map((c) => <li key={c}>{c}</li>)}</ul> : null}
              <p className="s-msg-source">{item.source}</p>
            </div>
          </div>
          <div className="s-chat-input" aria-hidden="true">
            <span>{t.placeholder}</span>
            <span className="s-chat-send">↵</span>
          </div>
          <p className="s-chat-note">{t.note}</p>
        </div>
      </div>
    </section>
  )
}
