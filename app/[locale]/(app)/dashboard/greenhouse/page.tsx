import { MapPin, Sprout, Calendar } from "lucide-react"
import { setRequestLocale, getTranslations } from "next-intl/server"
import { auth } from "@/lib/auth/config"
import { Link } from "@/lib/i18n/routing"
import { getUserGreenhouses } from "@/lib/dashboard/data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

interface PageProps {
  params: { locale: string }
}

export default async function GreenhouseListPage({
  params: { locale },
}: PageProps) {
  setRequestLocale(locale)
  const session = await auth()
  if (!session?.user) return null

  const t = await getTranslations("dashboard.greenhouse")
  const rows = await getUserGreenhouses(session.user.id)

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {t("title")}
        </h1>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Sprout className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((g) => (
            <Card key={g.id}>
              <CardContent className="pt-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">{g.name}</h3>
                  <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <Sprout className="h-4 w-4" />
                  </div>
                </div>

                <dl className="space-y-2 text-sm flex-1">
                  {g.location ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{g.location}</span>
                    </div>
                  ) : null}
                  {g.areaM2 ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-mono text-xs w-3.5">㎡</span>
                      <span>{g.areaM2} m²</span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(g.createdAt, locale)}</span>
                  </div>
                </dl>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                >
                  <Link href={`/dashboard/greenhouse/${g.id}`}>
                    {t("viewReadings")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
