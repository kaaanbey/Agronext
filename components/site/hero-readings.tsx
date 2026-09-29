"use client"

import { useEffect, useState } from "react"
import { heroKaydi } from "@/lib/content/saha-verisi"

// Hero'daki ClimaNex değerleri canlı değil, gerçek bir kaydın tekrarıdır
// (25 Eyl 2026, 14:10–14:20, 5 sn'lik satırlar). Rastgele "titreşim" üretmek
// sahte veri olurdu; kaydı sırayla oynatmak hem hareketi hem gerçekliği korur.

const fmt = (v: number, locale: string, d = 1) => v.toLocaleString(locale === "tr" ? "tr-TR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d })

export function useReplay(stepMs = 1400) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(() => setI((n) => (n + 1) % heroKaydi.length), stepMs)
    return () => window.clearInterval(id)
  }, [stepMs])
  return heroKaydi[i] ?? heroKaydi[0]!
}

export function ClimaReadout({ locale, compact = false }: { locale: "tr" | "en"; compact?: boolean }) {
  const [t, temp, rh, co2] = useReplay()
  const tr = locale === "tr"
  return (
    <span className={compact ? "s-readout s-readout-compact" : "s-readout"}>
      <span className="s-readout-values">
        <span><b>{fmt(temp, locale)}</b> °C</span>
        <span><b>{fmt(rh, locale)}</b> %RH</span>
        <span><b>{co2}</b> ppm CO₂</span>
      </span>
      <span className="s-readout-time">
        {tr ? "kayıt" : "log"} 25.09.2026 · {t}
      </span>
    </span>
  )
}
