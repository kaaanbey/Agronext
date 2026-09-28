import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { setRequestLocale, getTranslations } from "next-intl/server"
import { auth } from "@/lib/auth/config"
import { Link } from "@/lib/i18n/routing"
import { getGreenhouseReadings } from "@/lib/dashboard/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  params: { locale: string; id: string }
}

export default async function GreenhouseDetailPage({
  params: { locale, id },
}: PageProps) {
  setRequestLocale(locale)
  const session = await auth()
  if (!session?.user) return null

  const data = await getGreenhouseReadings(session.user.id, id, 100)
  if (!data) notFound()

  const t = await getTranslations("dashboard.greenhouse")
  const tOverview = await getTranslations("dashboard.overview")

  const fmt = (val: number | null | undefined, suffix = "") =>
    val == null ? "—" : `${val.toFixed(1)}${suffix}`

  return (
    <div className="space-y-6 max-w-6xl">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/greenhouse">
          <ArrowLeft className="h-4 w-4" />
          {t("backToList")}
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {data.greenhouse.name}
        </h1>
        {data.greenhouse.location ? (
          <p className="text-sm text-muted-foreground mt-1">
            {data.greenhouse.location}
          </p>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("historyTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {data.readings.length === 0 ? (
            <p className="px-6 text-sm text-muted-foreground">
              {tOverview("noData")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tOverview("table.time")}</TableHead>
                  <TableHead>{tOverview("table.temperature")}</TableHead>
                  <TableHead>{tOverview("table.humidity")}</TableHead>
                  <TableHead>{tOverview("table.soil")}</TableHead>
                  <TableHead>{tOverview("table.light")}</TableHead>
                  <TableHead>{tOverview("table.co2")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.readings.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(r.recordedAt, locale)}
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
