"use client"

import { useEffect, useState } from "react"

// Sayfadaki tek istemci gözlemcisi. İki iş yapar:
// 1) [data-reveal] öğeleri görünür alana girince data-in="true" alır; CSS çizgi/grafik
//    çizimini ve hafif girişleri buna bağlar (animasyon yalnız transform/opacity/dashoffset).
// 2) [data-stage] bölümleri izlenir; üstteki akış şeridi (Sera → … → Sonuç) okurun
//    o an sistemin hangi aşamasını okuduğunu gösterir. Sitenin ana fikri bu zincir.

export const STAGES = {
  tr: ["Sera", "Sensör", "Veri", "Yerel AI", "Karar", "Aktüatör", "Sonuç"],
  en: ["Greenhouse", "Sensor", "Data", "Local AI", "Decision", "Actuator", "Outcome"],
} as const

export function ScrollStage({ locale }: { locale: "tr" | "en" }) {
  const [stage, setStage] = useState<number | "all" | null>(0)

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const revealables = document.querySelectorAll<HTMLElement>("[data-reveal]")
    let cleanupReveal: (() => void) | undefined
    if (reduce || !("IntersectionObserver" in window)) {
      revealables.forEach((el) => (el.dataset.in = "true"))
    } else {
      // JS yoksa her şey görünür kalır; gizleme yalnız bu işaret varken uygulanır.
      // Açılışta zaten ekranda olan öğeler animasyonsuz görünür (titreme olmasın).
      revealables.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.dataset.in = "true"
      })
      document.documentElement.dataset.motion = "on"
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              ;(e.target as HTMLElement).dataset.in = "true"
              io.unobserve(e.target)
            }
          }
        },
        { rootMargin: "0px 0px -18% 0px", threshold: 0.08 },
      )
      revealables.forEach((el) => { if (!el.dataset.in) io.observe(el) })
      cleanupReveal = () => io.disconnect()
    }

    // Aşama: ekranın üst üçte birindeki çizgiyi kesen bölüm aktiftir.
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-stage]"))
    const onScroll = () => {
      const line = window.innerHeight * 0.34
      let current: number | "all" | null = 0
      for (const s of sections) {
        const r = s.getBoundingClientRect()
        if (r.top <= line && r.bottom > line) {
          const v = s.dataset.stage!
          current = v === "all" ? "all" : v === "none" ? null : Number(v)
        }
      }
      setStage(current)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cleanupReveal?.()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  const labels = STAGES[locale]
  const visible = stage !== null
  const idx = stage === "all" ? labels.length - 1 : (stage ?? 0)
  return (
    <div className="s-rail" data-visible={visible} aria-hidden="true">
      <div className="s-rail-inner">
        <ol>
          {labels.map((l, i) => (
            <li key={l} data-on={stage === "all" || i === stage} data-past={stage !== "all" && stage !== null && i < stage}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {l}
            </li>
          ))}
        </ol>
        <span className="s-rail-now">
          {stage === "all" ? `01–07 · ${locale === "tr" ? "tüm döngü" : "full loop"}` : `${String(idx + 1).padStart(2, "0")} · ${labels[idx]}`}
        </span>
        <span className="s-rail-bar" style={{ transform: `scaleX(${stage === "all" ? 1 : (idx + 1) / labels.length})` }} />
      </div>
    </div>
  )
}
