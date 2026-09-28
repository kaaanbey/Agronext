import { Check, X } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Competitor = {
  key: string
  name: string
  price: string
  localAI: boolean
  turkeyData: boolean
  mobile: boolean
  subscription: boolean
  isUs?: boolean
}

const COMPETITORS: Competitor[] = [
  {
    key: "netafim",
    name: "Netafim",
    price: "~$100K+",
    localAI: false,
    turkeyData: false,
    mobile: true,
    subscription: false,
  },
  {
    key: "priva",
    name: "Priva",
    price: "~$80K+",
    localAI: false,
    turkeyData: false,
    mobile: true,
    subscription: false,
  },
  {
    key: "growlink",
    name: "Growlink",
    price: "~$30K+",
    localAI: false,
    turkeyData: false,
    mobile: true,
    subscription: true,
  },
  {
    key: "agronext",
    name: "AgroNext",
    price: "", // filled from i18n
    localAI: true,
    turkeyData: true,
    mobile: true,
    subscription: true,
    isUs: true,
  },
]

type FeatureKey = "price" | "localAI" | "turkeyData" | "mobile" | "subscription"

const FEATURES: FeatureKey[] = [
  "price",
  "localAI",
  "turkeyData",
  "mobile",
  "subscription",
]

export function CompetitorTable() {
  const t = useTranslations("landing.compare")

  const ourPrice = t("ourPrice")

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[32%]">{t("feature_col")}</TableHead>
            {COMPETITORS.map((c) => (
              <TableHead
                key={c.key}
                className={cn(
                  "text-center",
                  c.isUs && "bg-primary/5 text-primary"
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={cn(
                      "font-semibold normal-case tracking-normal text-sm",
                      c.isUs ? "text-primary" : "text-foreground"
                    )}
                  >
                    {c.name}
                  </span>
                  {c.isUs ? (
                    <Badge className="h-5 px-1.5 text-[10px] uppercase tracking-wide">
                      {t("us_badge")}
                    </Badge>
                  ) : null}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {FEATURES.map((feature) => (
            <TableRow key={feature}>
              <TableCell className="font-medium text-foreground">
                {t(`features.${feature}` as "features.price")}
              </TableCell>
              {COMPETITORS.map((c) => {
                const value = feature === "price" ? (c.isUs ? ourPrice : c.price) : c[feature]
                const isBool = typeof value === "boolean"
                return (
                  <TableCell
                    key={c.key}
                    className={cn(
                      "text-center",
                      c.isUs && "bg-primary/5 ring-1 ring-inset ring-primary/20"
                    )}
                  >
                    {isBool ? (
                      value ? (
                        <Check
                          className={cn(
                            "mx-auto h-4 w-4",
                            c.isUs ? "text-primary" : "text-primary/70"
                          )}
                        />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/60" />
                      )
                    ) : (
                      <span
                        className={cn(
                          "text-sm font-medium",
                          c.isUs ? "text-primary" : "text-foreground"
                        )}
                      >
                        {value as string}
                      </span>
                    )}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
