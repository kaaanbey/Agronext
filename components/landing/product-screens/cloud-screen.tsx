"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Cloud, Database, Globe } from "lucide-react"
import { ScreenFrame } from "./screen-frame"
import type { ScreenLabels } from "./types"

function DataFlow({ sources }: { sources: ReadonlyArray<string> }) {
  // SVG layout: sources column → API node → DB node, with animated dashed paths
  const W = 300
  const H = 120
  const sourceX = 40
  const apiX = 158
  const dbX = 268
  const apiY = H / 2
  const dbY = H / 2
  const rows = sources.slice(0, 3)
  const ys = rows.map((_, i) => 24 + i * 36)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
      <defs>
        <linearGradient id="flow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.05" />
          <stop offset="50%" stopColor="#34d399" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Sources → API curves */}
      {rows.map((_, i) => {
        const y = ys[i]!
        const d = `M ${sourceX + 18} ${y} C ${sourceX + 60} ${y}, ${apiX - 40} ${apiY}, ${apiX - 14} ${apiY}`
        return (
          <g key={i}>
            <path d={d} stroke="rgba(52,211,153,0.18)" strokeWidth="0.8" fill="none" />
            <motion.path
              d={d}
              stroke="url(#flow)"
              strokeWidth="1.2"
              fill="none"
              strokeDasharray="3 5"
              animate={{ strokeDashoffset: [0, -32] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.18,
              }}
            />
          </g>
        )
      })}

      {/* API → DB curve */}
      <path
        d={`M ${apiX + 14} ${apiY} C ${apiX + 50} ${apiY}, ${dbX - 60} ${dbY}, ${dbX - 16} ${dbY}`}
        stroke="rgba(52,211,153,0.18)"
        strokeWidth="0.8"
        fill="none"
      />
      <motion.path
        d={`M ${apiX + 14} ${apiY} C ${apiX + 50} ${apiY}, ${dbX - 60} ${dbY}, ${dbX - 16} ${dbY}`}
        stroke="url(#flow)"
        strokeWidth="1.4"
        fill="none"
        strokeDasharray="3 5"
        animate={{ strokeDashoffset: [0, -32] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      />

      {/* Source pills */}
      {rows.map((label, i) => {
        const y = ys[i]!
        return (
          <g key={`s-${i}`}>
            <rect
              x={sourceX - 18}
              y={y - 7}
              width={36}
              height={14}
              rx={7}
              fill="rgba(52,211,153,0.10)"
              stroke="rgba(52,211,153,0.45)"
              strokeWidth="0.4"
            />
            <text
              x={sourceX}
              y={y + 3}
              textAnchor="middle"
              fontSize="6.5"
              fontFamily="ui-monospace, monospace"
              fill="#86efac"
            >
              {label}
            </text>
          </g>
        )
      })}

      {/* API node */}
      <g>
        <circle
          cx={apiX}
          cy={apiY}
          r={14}
          fill="rgba(52,211,153,0.12)"
          stroke="rgba(52,211,153,0.6)"
          strokeWidth="0.6"
        />
        <text
          x={apiX}
          y={apiY + 2}
          textAnchor="middle"
          fontSize="6.5"
          fontFamily="ui-monospace, monospace"
          fill="#a7f3d0"
        >
          API
        </text>
      </g>

      {/* DB node */}
      <g>
        <rect
          x={dbX - 16}
          y={dbY - 12}
          width={32}
          height={24}
          rx={5}
          fill="rgba(52,211,153,0.10)"
          stroke="rgba(52,211,153,0.55)"
          strokeWidth="0.5"
        />
        <text
          x={dbX}
          y={dbY + 2}
          textAnchor="middle"
          fontSize="6"
          fontFamily="ui-monospace, monospace"
          fill="#a7f3d0"
        >
          Neon
        </text>
      </g>
    </svg>
  )
}

export function CloudScreen({ labels }: { labels: ScreenLabels }) {
  return (
    <ScreenFrame
      greeting={labels.greeting}
      user={labels.user}
      live={labels.live}
      Icon={Cloud}
    >
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-primary/80">
          {labels.cloudTitle}
        </div>
        <div className="text-base font-semibold text-white">
          {labels.cloudSubtitle}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-primary/15 bg-primary/[0.05] p-3.5">
        <div className="mb-1.5 text-xs uppercase tracking-[0.15em] text-white/45">
          {labels.cloudSourcesLabel}
        </div>
        <DataFlow sources={labels.cloudSources} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-md bg-primary/[0.06] p-2.5 text-center">
          <Globe className="mx-auto h-4 w-4 text-accent2" strokeWidth={2} />
          <div className="mt-1.5 text-[10px] text-white/45">
            {labels.cloudLatencyLabel}
          </div>
          <div className="text-sm font-semibold text-white">38 ms</div>
        </div>
        <div className="rounded-md bg-primary/[0.06] p-2.5 text-center">
          <Database className="mx-auto h-4 w-4 text-primary" strokeWidth={2} />
          <div className="mt-1.5 text-[10px] text-white/45">{labels.cloudDbLabel}</div>
          <div className="text-sm font-semibold text-white">Neon</div>
        </div>
        <div className="rounded-md bg-primary/[0.06] p-2.5 text-center">
          <span className="mx-auto block h-2.5 w-2.5 rounded-full bg-accent2 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
          <div className="mt-2 text-[10px] text-white/45">
            {labels.cloudUptimeLabel}
          </div>
          <div className="text-sm font-semibold text-white">99.9%</div>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        {[
          { m: "GET", p: "/api/sensors", c: "200" },
          { m: "POST", p: "/api/predict", c: "200" },
          { m: "GET", p: labels.cloudEndpoint, c: "200" },
        ].map((row, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-md bg-primary/[0.05] px-3 py-2 font-mono text-xs text-white/80"
          >
            <div className="flex items-center gap-2">
              <span className="rounded bg-accent2/15 px-1.5 text-[10px] font-bold text-accent2">
                {row.m}
              </span>
              <span className="truncate">{row.p}</span>
            </div>
            <span className="text-accent2">{row.c}</span>
          </div>
        ))}
      </div>
    </ScreenFrame>
  )
}
