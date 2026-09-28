import { Check, X, Droplet } from "lucide-react"
import { getTranslations } from "next-intl/server"

type Tone = "positive" | "negative" | "neutral" | "warn"

function classify(value: string): Tone {
  if (!value) return "negative"
  if (value === "—") return "neutral"
  const v = value.toLowerCase()
  if (
    v.startsWith("✓") ||
    v.includes("evet") ||
    v.includes("yes") ||
    v.includes("dahil") ||
    v.includes("included") ||
    v.includes("tam") ||
    v.includes("full") ||
    v.includes("modüler") ||
    v.includes("modular") ||
    v.includes("odak") ||
    v.includes("focus") ||
    v.includes("4 saat") ||
    v.includes("4 hours")
  ) {
    return "positive"
  }
  if (
    v.includes("kısıtlı") ||
    v.includes("limited") ||
    v.includes("haftalar") ||
    v.includes("weeks") ||
    v.includes("ekstra") ||
    v.includes("extra") ||
    v.includes("büyük") ||
    v.includes("enterprise") ||
    v.includes("emek")
  ) {
    return "warn"
  }
  return "neutral"
}

interface Cell {
  raw: string
  highlight?: boolean
}

function renderCell(cell: Cell) {
  const value = cell.raw
  if (value === "") {
    return <X className="mx-auto h-4 w-4 text-muted-foreground/50" />
  }
  if (value === "—") {
    return <span className="text-muted-foreground/60">—</span>
  }

  const tone = classify(value)
  const prefix =
    tone === "positive" ? (
      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
    ) : tone === "warn" ? null : null

  const toneClass = cell.highlight
    ? "text-primary font-semibold"
    : tone === "positive"
      ? "text-emerald-700"
      : tone === "warn"
        ? "text-amber-700"
        : "text-foreground/80"

  return (
    <span className={`inline-flex items-center gap-1.5 ${toneClass}`}>
      {prefix}
      {value}
    </span>
  )
}

export async function ComparisonTable({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "pricing.compare" })

  const rowKeys = [
    "cost",
    "ai",
    "setup",
    "solar",
    "mobile",
    "scale",
    "segment",
  ] as const

  const rows = rowKeys.map((key) => ({
    key,
    label: t(`rows.${key}.label`),
    agronext: t(`rows.${key}.agronext`),
    netafim: t(`rows.${key}.netafim`),
    priva: t(`rows.${key}.priva`),
    manual: t(`rows.${key}.manual`),
  }))

  return (
    <section className="relative bg-secondary/40">
      <div className="container py-20 md:py-28">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 text-4xl font-black leading-[1.1] tracking-tight text-foreground md:text-5xl">
            {t("title_a")}{" "}
            <span className="block font-serif italic font-normal text-accent2">
              {t("title_b")}
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("columns.criterion")}
                </th>
                <th className="bg-primary/[0.06] px-6 py-5 text-left">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                    <Droplet className="h-4 w-4 fill-primary/20" strokeWidth={2} />
                    {t("columns.agronext")}
                  </span>
                </th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-foreground/70">
                  {t("columns.netafim")}
                </th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-foreground/70">
                  {t("columns.priva")}
                </th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-foreground/70">
                  {t("columns.manual")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.key}
                  className={
                    i < rows.length - 1 ? "border-b border-border/60" : ""
                  }
                >
                  <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                    {row.label}
                  </td>
                  <td className="bg-primary/[0.04] px-6 py-4 text-sm">
                    {renderCell({ raw: row.agronext, highlight: true })}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {renderCell({ raw: row.netafim })}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {renderCell({ raw: row.priva })}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {renderCell({ raw: row.manual })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
