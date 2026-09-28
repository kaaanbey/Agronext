"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Activity, Smartphone } from "lucide-react"
import { ScreenFrame } from "./screen-frame"
import type { ScreenLabels } from "./types"

const BAR_WEIGHTS = [60, 75, 80, 70, 90, 85, 95]

function HeartbeatBar() {
  const [tick, setTick] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mq.matches) return
    const beat = () => {
      if (cancelled) return
      setTick((n) => n + 1)
      setTimeout(beat, 1300 + Math.random() * 200)
    }
    const id = setTimeout(beat, 700)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [])

  return (
    <div className="mt-3 flex h-3 gap-1.5">
      {BAR_WEIGHTS.map((w, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-full"
          animate={
            tick > 0
              ? {
                  scaleY: [1, 1.4, 1, 1.15, 1],
                  backgroundColor: [
                    "rgba(52,211,153,0.70)",
                    "rgba(52,211,153,1.00)",
                    "rgba(52,211,153,0.70)",
                  ],
                  boxShadow: [
                    "0 0 0px rgba(52,211,153,0)",
                    `0 0 8px rgba(52,211,153,${(w / 100) * 0.65})`,
                    "0 0 0px rgba(52,211,153,0)",
                  ],
                }
              : {}
          }
          transition={{
            duration: 0.55,
            delay: i * 0.045,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            backgroundColor: "rgba(52,211,153,0.70)",
            opacity: w / 100,
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  )
}

export function AppScreen({ labels }: { labels: ScreenLabels }) {
  return (
    <ScreenFrame
      greeting={labels.greeting}
      user={labels.user}
      live={labels.live}
      Icon={Smartphone}
    >
      <div className="rounded-xl border border-accent2/30 bg-accent2/5 p-4">
        <p className="text-sm leading-relaxed text-white/85">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-accent2 align-middle" />
          {labels.alert}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {(
          [
            { v: "72", u: "%", tone: "text-white", label: labels.humidity },
            { v: "24", u: "°c", tone: "text-white", label: labels.temperature },
            { v: "38", u: "%", tone: "text-amber-400", label: labels.soil },
            { v: "41", u: "%", tone: "text-accent2", label: labels.savings },
          ] as const
        ).map((m, idx) => (
          <div key={idx} className="rounded-lg bg-primary/[0.08] p-3.5">
            <div className="text-xs text-white/50">{m.label}</div>
            <div className={`mt-1 text-2xl font-bold ${m.tone}`}>
              {m.v}
              <span className="ml-1 text-sm text-white/50">{m.u}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-primary/[0.08] p-3.5">
        <div className="flex items-center justify-between">
          <div className="text-xs text-white/50">{labels.weeklyTitle}</div>
          <Activity className="h-4 w-4 text-accent2" strokeWidth={2.5} />
        </div>
        <HeartbeatBar />
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-primary/10 bg-primary/[0.05] p-3.5">
        <div>
          <div className="text-xs text-white/50">{labels.model}</div>
          <div className="text-sm font-semibold">{labels.accuracyLabel}</div>
          <div className="text-2xl font-bold text-accent2">94.2%</div>
        </div>
        <button
          type="button"
          className="rounded-md bg-accent2 px-3.5 py-2 text-sm font-semibold text-accent2-foreground shadow-sm"
        >
          ✓ {labels.cta}
        </button>
      </div>
    </ScreenFrame>
  )
}
