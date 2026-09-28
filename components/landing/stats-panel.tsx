 "use client"

import * as React from "react"
import { Target, Zap, Droplets, TrendingUp } from "lucide-react"
import { useTranslations } from "next-intl"

type Stat = {
  key: "accuracy" | "speed" | "water"
  value: string
  label: string
  sub: string
}

const iconMap: Record<Stat["key"], typeof Target> = {
  accuracy: Target,
  speed: Zap,
  water: Droplets,
}

const sparkPaths: Record<Stat["key"], string> = {
  // rising accuracy curve
  accuracy: "M2 20 L12 16 L22 11 L32 8 L42 5 L52 3",
  // zig-zag live pulse
  speed: "M2 12 L8 12 L11 5 L14 19 L17 4 L20 20 L23 12 L52 12",
  // water wave
  water: "M2 12 Q9 4 16 12 T30 12 T44 12 T58 12",
}

type ParsedValue = {
  token: string
  target: number
  decimals: number
  separator: "." | ","
}

function parseValue(raw: string): ParsedValue | null {
  const match = raw.match(/-?\d+(?:[.,]\d+)?/)
  if (!match) return null

  const token = match[0]
  const separator: "." | "," = token.includes(",") ? "," : "."
  const decimals = token.includes(".") || token.includes(",")
    ? token.split(/[.,]/)[1]?.length ?? 0
    : 0
  const target = Number(token.replace(",", "."))

  if (!Number.isFinite(target)) return null

  return { token, target, decimals, separator }
}

function formatValue(value: number, decimals: number, separator: "." | ",") {
  const fixed = value.toFixed(decimals)
  return separator === "," ? fixed.replace(".", ",") : fixed
}

function AnimatedStatValue({
  value,
  delayMs,
}: {
  value: string
  delayMs: number
}) {
  const [display, setDisplay] = React.useState(value)

  React.useEffect(() => {
    const parsed = parseValue(value)
    if (!parsed) {
      setDisplay(value)
      return
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (reduceMotion) {
      setDisplay(value)
      return
    }

    let raf = 0
    let start = 0
    let timeoutId = 0
    const duration = 1400

    const tick = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = parsed.target * eased
      const animated = value.replace(
        parsed.token,
        formatValue(current, parsed.decimals, parsed.separator)
      )
      setDisplay(animated)

      if (progress < 1) {
        raf = window.requestAnimationFrame(tick)
      }
    }

    timeoutId = window.setTimeout(() => {
      raf = window.requestAnimationFrame(tick)
    }, delayMs)

    return () => {
      window.clearTimeout(timeoutId)
      window.cancelAnimationFrame(raf)
    }
  }, [delayMs, value])

  return <>{display}</>
}

export function StatsPanel({ stats }: { stats: Stat[] }) {
  const t = useTranslations("landing.stats")

  return (
    <div className="relative mx-auto w-full max-w-[76rem]">
      {/* soft colored glow behind card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-4 -inset-y-6 -z-10 rounded-[2.2rem] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.18),transparent_65%)] blur-xl"
      />

      <div className="stats-panel relative rounded-[1.75rem] shadow-[0_30px_80px_-30px_rgba(15,55,35,0.25),0_1px_0_rgba(15,23,42,0.04)]">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-white/90 backdrop-blur-xl dark:bg-card/95">
          {/* faint internal grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(45,106,79,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(45,106,79,0.8) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage:
                "radial-gradient(ellipse 70% 100% at 50% 50%, black 45%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 70% 100% at 50% 50%, black 45%, transparent 100%)",
            }}
          />

          {/* LIVE pill */}
          <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-primary backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            {t("live_badge")}
          </div>

          <div className="grid grid-cols-1 divide-y divide-border/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((s, i) => {
              const Icon = iconMap[s.key]
              return (
                <div
                  key={s.key}
                  className="agn-stat-item agn-stat-card group relative overflow-hidden px-6 pt-12 pb-8 sm:px-7"
                  style={{ ["--agn-delay" as string]: `${i * 120}ms` }}
                >
                  {/* top row: icon + sparkline */}
                  <div className="relative z-[1] mb-6 flex items-center justify-between">
                    <div className="relative">
                      <div
                        aria-hidden
                        className="absolute inset-0 -z-10 rounded-xl bg-primary/20 blur-md"
                      />
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </div>
                    </div>

                    <div className="relative">
                      <svg
                        viewBox="0 0 60 24"
                        width="96"
                        height="36"
                        aria-hidden
                        className="text-primary/70"
                      >
                        <defs>
                          <linearGradient
                            id={`spark-${s.key}`}
                            x1="0"
                            x2="1"
                            y1="0"
                            y2="0"
                          >
                            <stop
                              offset="0%"
                              stopColor="currentColor"
                              stopOpacity="0.15"
                            />
                            <stop
                              offset="100%"
                              stopColor="currentColor"
                              stopOpacity="1"
                            />
                          </linearGradient>
                        </defs>
                        <path
                          d={sparkPaths[s.key]}
                          fill="none"
                          stroke={`url(#spark-${s.key})`}
                          strokeWidth="2.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="agn-spark agn-spark-draw"
                          style={{ animationDelay: `${i * 120}ms` }}
                        />
                        <path
                          d={sparkPaths[s.key]}
                          fill="none"
                          stroke={`url(#spark-${s.key})`}
                          strokeWidth="2.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="agn-spark agn-spark-flow"
                          style={{ animationDelay: `${i * 120}ms` }}
                        />
                      </svg>
                    </div>
                  </div>

                  {/* big number (gradient) */}
                  <div className="relative z-[1] flex items-baseline gap-2">
                    <div className="agn-value bg-gradient-to-b from-primary to-primary/70 bg-clip-text text-4xl font-black leading-none tracking-tight text-transparent sm:text-5xl">
                      <AnimatedStatValue value={s.value} delayMs={i * 140} />
                    </div>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      <TrendingUp className="h-2.5 w-2.5" strokeWidth={2.5} />
                      {t(`${s.key}_delta`)}
                    </span>
                  </div>

                  <div className="relative z-[1] mt-3 text-sm font-bold leading-snug text-foreground">
                    {s.label}
                  </div>
                  <div className="relative z-[1] mt-1 max-w-[15rem] text-xs leading-relaxed text-muted-foreground">
                    {s.sub}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
