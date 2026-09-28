import { Sprout, Thermometer, Droplets, Waves } from "lucide-react"
import { setRequestLocale, getTranslations } from "next-intl/server"
import { auth } from "@/lib/auth/config"
import {
  getLatestReadings,
  getUserGreenhouses,
  getWeeklyReadings,
} from "@/lib/dashboard/data"
import { StatCard } from "@/components/dashboard/stat-card"
import {
  SensorChart,
  type ChartPoint,
} from "@/components/dashboard/sensor-chart"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDateTime } from "@/lib/utils"

interface PageProps {
  params: { locale: string }
}

export default async function DashboardPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale)
  const session = await auth()
  if (!session?.user) return null

  const t = await getTranslations("dashboard.overview")

  const [userGreenhouses, { readings, greenhousesById }, weekly] =
    await Promise.all([
      getUserGreenhouses(session.user.id),
      getLatestReadings(session.user.id, 10),
      getWeeklyReadings(session.user.id),
    ])

  const latest = readings[0]

  const chartData: ChartPoint[] = weekly.map((r) => ({
    t: r.recordedAt.getTime(),
    temperature: r.temperature,
    humidity: r.humidity,
  }))

  const fmt = (val: number | null | undefined, suffix = "") =>
    val == null ? "—" : `${val.toFixed(1)}${suffix}`

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("welcome")}, {session.user.name ?? session.user.email}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Sprout}
          label={t("stats.activeGreenhouses")}
          value={String(userGreenhouses.length)}
        />
        <StatCard
          icon={Thermometer}
          label={t("stats.temperature")}
          value={fmt(latest?.temperature, "°C")}
        />
        <StatCard
          icon={Droplets}
          label={t("stats.humidity")}
          value={fmt(latest?.humidity, "%")}
        />
        <StatCard
          icon={Waves}
          label={t("stats.soilMoisture")}
          value={fmt(latest?.soilMoisture, "%")}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("chartTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <SensorChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("recentReadings")}</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {readings.length === 0 ? (
            <p className="px-6 text-sm text-muted-foreground">{t("noData")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.greenhouse")}</TableHead>
                  <TableHead>{t("table.temperature")}</TableHead>
                  <TableHead>{t("table.humidity")}</TableHead>
                  <TableHead>{t("table.soil")}</TableHead>
                  <TableHead>{t("table.light")}</TableHead>
                  <TableHead>{t("table.co2")}</TableHead>
                  <TableHead>{t("table.time")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readings.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {greenhousesById.get(r.greenhouseId) ?? "—"}
                    </TableCell>
                    <TableCell>{fmt(r.temperature, "°C")}</TableCell>
                    <TableCell>{fmt(r.humidity, "%")}</TableCell>
                    <TableCell>{fmt(r.soilMoisture, "%")}</TableCell>
                    <TableCell>
                      {r.lightLux == null ? "—" : `${Math.round(r.lightLux)} lx`}
                    </TableCell>
                    <TableCell>
                      {r.co2Ppm == null ? "—" : `${Math.round(r.co2Ppm)} ppm`}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(r.recordedAt, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
