"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Cpu, Radio, Sun, BatteryFull } from "lucide-react"
import { ScreenFrame } from "./screen-frame"
import type { ScreenLabels } from "./types"

// 6 sensor positions inside the greenhouse map (percent-based on the SVG viewBox 0–100)
const SENSORS: ReadonlyArray<{ x: number; y: number; rate: number }> = [
  { x: 18, y: 28, rate: 1.6 },
  { x: 48, y: 22, rate: 2.2 },
  { x: 78, y: 30, rate: 1.9 },
  { x: 24, y: 70, rate: 2.5 },
  { x: 54, y: 78, rate: 1.7 },
  { x: 82, y: 68, rate: 2.0 },
]

export function HardwareScreen({ labels }: { labels: ScreenLabels }) {
  return (
    <ScreenFrame
      greeting={labels.greeting}
      user={labels.user}
      live={labels.live}
      Icon={Cpu}
    >
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-primary/80">
          {labels.hardwareTitle}
        </div>
        <div className="text-base font-semibold text-white">
          {labels.hardwareSubtitle}
        </div>
      </div>

      {/* Greenhouse top-down map */}
      <div className="mt-4 relative rounded-xl border border-primary/15 bg-primary/[0.05] p-3">
        <svg viewBox="0 0 100 56" className="block w-full">
          {/* perimeter */}
          <rect
            x="2"
            y="2"
            width="96"
            height="52"
            rx="3"
            fill="rgba(52,211,153,0.06)"
            stroke="rgba(52,211,153,0.35)"
            strokeWidth="0.5"
          />
          {/* center walkway */}
          <line
            x1="2"
            y1="28"
            x2="98"
            y2="28"
            stroke="rgba(52,211,153,0.18)"
            strokeWidth="0.4"
            strokeDasharray="1.2 1.4"
          />
          {/* plant rows */}
          {[10, 18, 38, 46].map((y) => (
            <line
              key={y}
              x1="6"
              y1={y}
              x2="94"
              y2={y}
              stroke="rgba(52,211,153,0.12)"
              strokeWidth="0.35"
            />
          ))}

          {/* sensors */}
          {SENSORS.map((s, i) => {
            const cx = (s.x / 100) * 96 + 2
            const cy = (s.y / 100) * 56
            return (
              <g key={i}>
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={1.5}
                  fill="rgba(52,211,153,0.35)"
                  animate={{ r: [1.5, 4.5], opacity: [0.55, 0] }}
                  transition={{
                    duration: s.rate,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: i * 0.25,
                  }}
                />
                <circle cx={cx} cy={cy} r={1.1} fill="#34d399" />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Sensors list */}
      <div className="mt-4">
        <div className="mb-2 text-xs uppercase tracking-[0.18em] text-white/45">
          {labels.hardwareSensorsLabel}
        </div>
        <div className="space-y-2">
          {labels.hardwareSensors.slice(0, 3).map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md bg-primary/[0.06] px-3 py-2"
            >
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-accent2 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                <span className="text-sm font-medium text-white/85">
                  {s.name}
                </span>
              </div>
              <span className="font-mono text-xs text-white/55">
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Power + radio strip */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-md bg-primary/[0.06] p-2.5 text-center">
          <Sun className="mx-auto h-4 w-4 text-amber-300" strokeWidth={2} />
          <div className="mt-1.5 text-[10px] text-white/45">
            {labels.hardwareSolarLabel}
          </div>
          <div className="text-sm font-semibold text-white">6W</div>
        </div>
        <div className="rounded-md bg-primary/[0.06] p-2.5 text-center">
          <BatteryFull
            className="mx-auto h-4 w-4 text-accent2"
            strokeWidth={2}
          />
          <div className="mt-1.5 text-[10px] text-white/45">
            {labels.hardwareBatteryLabel}
          </div>
          <div className="text-sm font-semibold text-white">94%</div>
        </div>
        <div className="rounded-md bg-primary/[0.06] p-2.5 text-center">
          <Radio
            className="mx-auto h-4 w-4 text-primary"
            strokeWidth={2}
          />
          <div className="mt-1.5 text-[10px] text-white/45">
            {labels.hardwareRadioLabel}
          </div>
          <div className="text-sm font-semibold text-white">-73 dBm</div>
        </div>
      </div>
    </ScreenFrame>
  )
}
