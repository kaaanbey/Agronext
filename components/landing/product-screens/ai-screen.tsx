"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { BrainCircuit } from "lucide-react"
import { ScreenFrame } from "./screen-frame"
import type { ScreenLabels } from "./types"

// Layer node counts left → right
const LAYERS: ReadonlyArray<number> = [4, 6, 6, 3]

function NeuralNet() {
  // Build positions
  const width = 280
  const height = 110
  const padX = 16
  const padY = 8
  const colCount = LAYERS.length
  const colGap = (width - padX * 2) / (colCount - 1)

  const points = LAYERS.map((nodeCount, ci) => {
    const x = padX + ci * colGap
    const rowGap = (height - padY * 2) / Math.max(nodeCount - 1, 1)
    return Array.from({ length: nodeCount }, (_, ri) => ({
      x,
      y: padY + ri * rowGap,
    }))
  })

  const edges: Array<{ x1: number; y1: number; x2: number; y2: number; key: string }> = []
  for (let c = 0; c < points.length - 1; c++) {
    for (let i = 0; i < points[c]!.length; i++) {
      for (let j = 0; j < points[c + 1]!.length; j++) {
        const a = points[c]![i]!
        const b = points[c + 1]![j]!
        edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, key: `${c}-${i}-${j}` })
      }
    }
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="block w-full">
      {/* Edges */}
      {edges.map((e, i) => (
        <motion.line
          key={e.key}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          stroke="rgba(52,211,153,0.25)"
          strokeWidth="0.45"
          initial={{ opacity: 0.15 }}
          animate={{ opacity: [0.15, 0.55, 0.15] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            delay: (i % 9) * 0.08,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Nodes */}
      {points.flatMap((col, ci) =>
        col.map((p, ri) => (
          <motion.circle
            key={`${ci}-${ri}`}
            cx={p.x}
            cy={p.y}
            r={2.4}
            fill={ci === 0 ? "#0ea371" : ci === LAYERS.length - 1 ? "#34d399" : "#10b981"}
            initial={{ scale: 0.6, opacity: 0.7 }}
            animate={{ scale: [0.85, 1.1, 0.85], opacity: [0.7, 1, 0.7] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: ci * 0.18 + ri * 0.05,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: `${p.x}px ${p.y}px`, transformBox: "fill-box" }}
          />
        ))
      )}
    </svg>
  )
}

function AccuracySpark() {
  // Smooth accuracy curve climbing to ~0.94
  const path =
    "M 0 28 C 12 26 22 22 36 18 S 60 8 80 7 110 5 140 4"
  return (
    <svg viewBox="0 0 140 32" className="h-8 w-full">
      <defs>
        <linearGradient id="acc-spark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.0" />
          <stop offset="50%" stopColor="#34d399" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
        </linearGradient>
      </defs>
      <motion.path
        d={path}
        fill="none"
        stroke="url(#acc-spark)"
        strokeWidth="1.6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

function EpochsCounter() {
  const [n, setN] = React.useState(0)
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mq.matches) {
      setN(420)
      return
    }
    let raf = 0
    const start = performance.now()
    const target = 420
    const dur = 1500
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return <span className="font-mono">{n}</span>
}

export function AIScreen({ labels }: { labels: ScreenLabels }) {
  return (
    <ScreenFrame
      greeting={labels.greeting}
      user={labels.user}
      live={labels.live}
      Icon={BrainCircuit}
    >
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-primary/80">
          {labels.aiTitle}
        </div>
        <div className="text-base font-semibold text-white">{labels.aiSubtitle}</div>
      </div>

      <div className="mt-4 rounded-xl border border-primary/15 bg-primary/[0.05] p-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="uppercase tracking-[0.15em] text-white/45">
            {labels.aiLayersLabel}
          </span>
          <span className="font-mono text-white/70">
            {LAYERS.join(" · ")}
          </span>
        </div>
        <div className="mt-2.5">
          <NeuralNet />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-primary/[0.08] p-3.5">
          <div className="text-xs text-white/50">{labels.aiAccuracyLabel}</div>
          <div className="mt-1 text-2xl font-bold text-accent2">94.2%</div>
          <AccuracySpark />
        </div>
        <div className="rounded-lg bg-primary/[0.08] p-3.5">
          <div className="text-xs text-white/50">{labels.aiEpochsLabel}</div>
          <div className="mt-1 text-2xl font-bold text-white">
            <EpochsCounter />
          </div>
          <div className="mt-1.5 text-xs text-white/40">GRU · Adam</div>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-primary/[0.06] p-3.5">
        <div className="mb-2 text-xs uppercase tracking-[0.15em] text-white/45">
          {labels.aiConfusionLabel}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            [92, 5, 3],
            [4, 95, 1],
            [2, 3, 95],
          ]
            .flat()
            .map((v, i) => {
              const intensity = v / 100
              return (
                <div
                  key={i}
                  className="flex h-9 items-center justify-center rounded text-xs font-semibold text-white"
                  style={{
                    backgroundColor: `rgba(52,211,153,${0.12 + intensity * 0.7})`,
                  }}
                >
                  {v}
                </div>
              )
            })}
        </div>
      </div>
    </ScreenFrame>
  )
}
