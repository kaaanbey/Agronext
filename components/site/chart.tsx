import type { Satir } from "@/lib/content/saha-verisi"

// Sunucuda üretilen SVG çizgi grafik. Kütüphane yok: veri birkaç yüz nokta,
// yol (path) dizesini burada kurmak yeterli ve sayfaya JS eklemiyor.
// Kayıtta boşluk varsa (ör. 19:16 → 19:40) çizgi orada kesilir; boşluğu
// düz bir çizgiyle "doldurmak" olmayan ölçümü varmış gibi gösterirdi.

type Props = {
  data: Satir[]
  field: 1 | 2 | 3
  width?: number
  height?: number
  unit: string
  label: string
  /** Dakika cinsinden; bundan uzun aralıkta çizgi kesilir. */
  gap?: number
  decimals?: number
  ticks?: number
  className?: string
}

const toMin = (t: string) => {
  const [h = 0, m = 0] = t.split(":").map(Number)
  return h * 60 + m
}

export function LineChart({ data, field, width = 640, height = 180, unit, label, gap = 6, decimals = 1, ticks = 4, className }: Props) {
  const pad = { l: 44, r: 12, t: 14, b: 26 }
  const xs = data.map((d) => toMin(d[0]))
  const ys = data.map((d) => d[field])
  const x0 = Math.min(...xs), x1 = Math.max(...xs)
  let y0 = Math.min(...ys), y1 = Math.max(...ys)
  const span = y1 - y0 || 1
  y0 -= span * 0.12
  y1 += span * 0.12
  const X = (m: number) => pad.l + ((m - x0) / (x1 - x0 || 1)) * (width - pad.l - pad.r)
  const Y = (v: number) => pad.t + (1 - (v - y0) / (y1 - y0)) * (height - pad.t - pad.b)

  let d = ""
  data.forEach((row, i) => {
    const m = xs[i]!
    const jump = i === 0 || m - xs[i - 1]! > gap
    d += `${jump ? "M" : "L"}${X(m).toFixed(1)} ${Y(row[field]).toFixed(1)}`
  })

  const yTicks = Array.from({ length: ticks }, (_, i) => y0 + ((y1 - y0) * (i + 0.5)) / ticks)
  const hourTicks: number[] = []
  for (let m = Math.ceil(x0 / 30) * 30; m <= x1; m += 30) hourTicks.push(m)
  const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
  const iMin = ys.indexOf(Math.min(...ys)), iMax = ys.indexOf(Math.max(...ys))

  return (
    <svg className={`s-chart ${className ?? ""}`} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label}: ${Math.min(...ys).toFixed(decimals)}–${Math.max(...ys).toFixed(decimals)} ${unit}, ${data[0]![0]}–${data[data.length - 1]![0]}`}>
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={width - pad.r} y1={Y(v)} y2={Y(v)} className="s-chart-grid" />
          <text x={pad.l - 8} y={Y(v) + 3.5} textAnchor="end" className="s-chart-tick">{v.toFixed(decimals)}</text>
        </g>
      ))}
      {hourTicks.map((m) => (
        <text key={m} x={X(m)} y={height - 7} textAnchor="middle" className="s-chart-tick">{fmt(m)}</text>
      ))}
      <path d={d} className="s-chart-line" pathLength={1} />
      {[iMin, iMax].map((i, k) => {
        const cx = X(xs[i]!), cy = Y(ys[i]!)
        const flip = cx > width * 0.75
        return (
          <g key={k} className="s-chart-mark">
            <circle cx={cx} cy={cy} r={3} />
            <text x={cx + (flip ? -8 : 8)} y={cy + (k === 0 ? 14 : -7)} textAnchor={flip ? "end" : "start"}>
              {ys[i]!.toFixed(decimals)} {unit}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
