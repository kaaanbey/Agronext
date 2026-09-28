"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts"
import { useTranslations, useLocale } from "next-intl"

export interface ChartPoint {
  t: number // timestamp ms
  temperature: number | null
  humidity: number | null
}

export function SensorChart({ data }: { data: ChartPoint[] }) {
  const t = useTranslations("dashboard.overview")
  const locale = useLocale()

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
        {t("noData")}
      </div>
    )
  }

  const formatter = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
  })

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis
            dataKey="t"
            tickFormatter={(v) => formatter.format(new Date(v))}
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            minTickGap={40}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: 12,
            }}
            labelFormatter={(v) => formatter.format(new Date(Number(v)))}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="temperature"
            name={t("temperatureLabel")}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="humidity"
            name={t("humidityLabel")}
            stroke="hsl(var(--earth))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
