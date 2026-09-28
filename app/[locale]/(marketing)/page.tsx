import {
  ArrowRight,
  Cloud,
  Smartphone,
  Droplets,
  DollarSign,
  Layers,
  Activity,
  Brain,
  Mail,
  Linkedin,
  Twitter,
  Instagram,
  ChevronRight,
} from "lucide-react"
import { setRequestLocale, getTranslations } from "next-intl/server"
import { useTranslations } from "next-intl"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FadeInSection } from "@/components/landing/motion-section"
import { DemoForm } from "@/components/landing/demo-form"
import { CompetitorTable } from "@/components/landing/competitor-table"
import { StatsPanel } from "@/components/landing/stats-panel"
import {
  ProductShowcase,
  type ProductLayer,
} from "@/components/landing/product-showcase"
import { companyInfo } from "@/lib/data/company"

interface PageProps {
  params: { locale: string }
}

type QuarterStatus = "active" | "upcoming" | "future"

export async function generateMetadata({ params: { locale } }: PageProps) {
  const t = await getTranslations({ locale, namespace: "seo.home" })
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("og_title"),
      description: t("og_description"),
    },
  }
}

export default function LandingPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale)
  const t = useTranslations("landing")

  const stats = [
    {
      key: "accuracy" as const,
      value: t("stats.accuracy_value"),
      label: t("stats.accuracy_label"),
      sub: t("stats.accuracy_sub"),
    },
    {
      key: "speed" as const,
      value: t("stats.speed_value"),
      label: t("stats.speed_label"),
      sub: t("stats.speed_sub"),
    },
    {
      key: "water" as const,
      value: t("stats.water_value"),
      label: t("stats.water_label"),
      sub: t("stats.water_sub"),
    },
  ]

  const problemCards = [
    {
      icon: Droplets,
      tone: "text-primary",
      valueTone: "text-primary",
      value: t("problem.cards.water.value"),
      label: t("problem.cards.water.label"),
      description: t("problem.cards.water.description"),
    },
    {
      icon: DollarSign,
      tone: "text-amber-600",
      valueTone: "text-amber-600",
      value: t("problem.cards.cost.value"),
      label: t("problem.cards.cost.label"),
      description: t("problem.cards.cost.description"),
    },
    {
      icon: Layers,
      tone: "text-indigo-600",
      valueTone: "text-indigo-600",
      value: t("problem.cards.market.value"),
      label: t("problem.cards.market.label"),
      description: t("problem.cards.market.description"),
    },
  ]

  const productLayers: ProductLayer[] = [
    {
      key: "hardware",
      num: "01",
      title: t("product.layers.hardware.title"),
      short: t("product.layers.hardware.short"),
      detail: t("product.layers.hardware.detail"),
    },
    {
      key: "ai",
      num: "02",
      title: t("product.layers.ai.title"),
      short: t("product.layers.ai.short"),
      detail: t("product.layers.ai.detail"),
    },
    {
      key: "cloud",
      num: "03",
      title: t("product.layers.cloud.title"),
      short: t("product.layers.cloud.short"),
      detail: t("product.layers.cloud.detail"),
    },
    {
      key: "app",
      num: "04",
      title: t("product.layers.app.title"),
      short: t("product.layers.app.short"),
      detail: t("product.layers.app.detail"),
    },
  ]

  const phoneLabels = {
    badge: t("product.phone.badge"),
    greeting: t("product.phone.greeting"),
    user: t("product.phone.user"),
    live: t("product.phone.live"),
    alert: t("product.phone.alert"),
    humidity: t("product.phone.humidity"),
    temperature: t("product.phone.temperature"),
    soil: t("product.phone.soil"),
    savings: t("product.phone.savings"),
    weeklyTitle: t("product.phone.weeklyTitle"),
    model: t("product.phone.model"),
    accuracyLabel: t("product.phone.accuracyLabel"),
    cta: t("product.phone.cta"),
    hardwareTitle: t("product.phone.hardware.title"),
    hardwareSubtitle: t("product.phone.hardware.subtitle"),
    hardwareSensorsLabel: t("product.phone.hardware.sensorsLabel"),
    hardwareSensors: t.raw("product.phone.hardware.sensors") as Array<{
      name: string
      status: string
    }>,
    hardwareBatteryLabel: t("product.phone.hardware.batteryLabel"),
    hardwareRadioLabel: t("product.phone.hardware.radioLabel"),
    hardwareSolarLabel: t("product.phone.hardware.solarLabel"),
    aiTitle: t("product.phone.ai.title"),
    aiSubtitle: t("product.phone.ai.subtitle"),
    aiLayersLabel: t("product.phone.ai.layersLabel"),
    aiEpochsLabel: t("product.phone.ai.epochsLabel"),
    aiAccuracyLabel: t("product.phone.ai.accuracyLabel"),
    aiConfusionLabel: t("product.phone.ai.confusionLabel"),
    cloudTitle: t("product.phone.cloud.title"),
    cloudSubtitle: t("product.phone.cloud.subtitle"),
    cloudSourcesLabel: t("product.phone.cloud.sourcesLabel"),
    cloudSources: t.raw("product.phone.cloud.sources") as string[],
    cloudEndpoint: t("product.phone.cloud.endpoint"),
    cloudLatencyLabel: t("product.phone.cloud.latencyLabel"),
    cloudDbLabel: t("product.phone.cloud.dbLabel"),
    cloudUptimeLabel: t("product.phone.cloud.uptimeLabel"),
  }

  const techIcons = [Activity, Brain, Cloud, Smartphone] as const
  const techLayers = (["one", "two", "three", "four"] as const).map((key, i) => ({
    key,
    icon: techIcons[i]!,
    num: String(i + 1).padStart(2, "0"),
    title: t(`tech.layers.${key}.title`),
    subtitle: t(`tech.layers.${key}.subtitle`),
    description: t(`tech.layers.${key}.description`),
    tags: t.raw(`tech.layers.${key}.tags`) as string[],
  }))

  const partnerItems: Array<{ key: string; label: string; soon?: boolean }> = [
    { key: "gtu", label: t("partners.items.gtu") },
    { key: "teknofest", label: t("partners.items.teknofest"), soon: true },
    { key: "pilots", label: t("partners.items.pilots"), soon: true },
  ]

  const quarters = (["q1", "q2", "q3", "q4"] as const).map((q, i) => ({
    key: q,
    label: t(`roadmap.quarters.${q}.label`),
    title: t(`roadmap.quarters.${q}.title`),
    items: t.raw(`roadmap.quarters.${q}.items`) as string[],
    status: (i === 0 ? "active" : i < 3 ? "upcoming" : "future") as QuarterStatus,
    statusLabel: t(
      `roadmap.status_${i === 0 ? "active" : i < 3 ? "upcoming" : "future"}` as
        | "roadmap.status_active"
        | "roadmap.status_upcoming"
        | "roadmap.status_future"
    ),
  }))

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-background text-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(45,106,79,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(45,106,79,0.9) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 35%, black 55%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 35%, black 55%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(82,183,136,0.22), transparent 70%)",
          }}
        />

        <div className="container relative flex flex-col items-center py-24 pb-40 text-center md:py-32 md:pb-56">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary/90 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {t("hero.badge")}
          </span>

          <h1 className="mt-8 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-balance md:text-6xl lg:text-7xl">
            {t("hero.title_start")}{" "}
            <span className="font-serif italic font-normal text-accent2">
              {t("hero.title_italic")}
            </span>{" "}
            {t("hero.title_middle")}{" "}
            <span className="font-black text-accent2">
              {t("hero.title_highlight")}
            </span>{" "}
            {t("hero.title_end")}
          </h1>

          <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            {t("hero.subtitle")}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
            >
              <Link href="#demo">
                {t("hero.cta_demo")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-border bg-card/60 text-foreground backdrop-blur hover:bg-card"
            >
              <Link href="#how-it-works">{t("hero.cta_how")} →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats + partners — premium grouped band */}
      <section className="relative -mt-24 border-b border-border/40 bg-[#F4F6F2] dark:bg-background md:-mt-32">
        {/* subtle grid only within this band */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(45,106,79,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(45,106,79,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 25%, black 80%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 25%, black 80%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent dark:from-background"
        />

        <div className="container relative py-10 pb-14 md:py-12 md:pb-16">
          <FadeInSection>
            <StatsPanel stats={stats} />
          </FadeInSection>

          <FadeInSection delay={0.1} className="mt-12 text-center md:mt-14">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/80">
              <span aria-hidden className="h-px w-8 bg-border" />
              {t("partners.section_title")}
              <span aria-hidden className="h-px w-8 bg-border" />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 md:gap-3">
              {partnerItems.map((p) => (
                <div
                  key={p.key}
                  className="group inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3.5 py-1.5 text-sm font-medium text-foreground/80 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white hover:shadow-md dark:bg-card/80 dark:hover:bg-card"
                >
                  <span
                    aria-hidden
                    className="relative flex h-1.5 w-1.5 items-center justify-center"
                  >
                    {!p.soon ? (
                      <>
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                      </>
                    ) : (
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                    )}
                  </span>
                  <span>{p.label}</span>
                  {p.soon ? (
                    <span className="inline-flex items-center rounded-full bg-zinc-900 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wider text-white dark:bg-zinc-100 dark:text-zinc-900">
                      {t("partners.coming_soon")}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Problem */}
      <section className="relative bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(45,106,79,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(45,106,79,0.9) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 20% 30%, black 45%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 20% 30%, black 45%, transparent 100%)",
          }}
        />

        <div className="container relative py-20 md:py-28">
          <FadeInSection>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t("problem.eyebrow")}
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {t("problem.title_a")}{" "}
              <span className="block font-serif text-5xl italic font-normal text-accent2 md:text-6xl lg:text-7xl">
                {t("problem.title_b")}
              </span>
            </h2>
            <p className="mt-6 max-w-xl text-sm text-muted-foreground md:text-base">
              {t("problem.description")}
            </p>
          </FadeInSection>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {problemCards.map((c, i) => {
              const Icon = c.icon
              return (
                <FadeInSection key={c.label} delay={i * 0.08}>
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md md:p-8">
                    <div className={`${c.tone} mb-4`}>
                      <Icon className="h-7 w-7" strokeWidth={1.5} />
                    </div>
                    <div
                      className={`text-5xl font-black tracking-tight ${c.valueTone} md:text-6xl`}
                    >
                      {c.value}
                    </div>
                    <div className="mt-4 text-sm font-semibold text-foreground">
                      {c.label}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground md:text-sm">
                      {c.description}
                    </p>
                  </div>
                </FadeInSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* Product */}
      <ProductShowcase
        eyebrow={t("product.eyebrow")}
        titleA={t("product.title_a")}
        titleB={t("product.title_b")}
        description={t("product.description")}
        liveLabel={t("product.live_pill")}
        layers={productLayers}
        phoneLabels={phoneLabels}
      />

      {/* How it works — 4-layer tech architecture */}
      <section
        id="how-it-works"
        className="relative scroll-mt-24 bg-secondary/40"
      >
        <div className="container relative py-20 md:py-28">
          <FadeInSection className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t("tech.eyebrow")}
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-foreground md:text-5xl">
              {t("tech.section_title")}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground md:text-base">
              {t("tech.section_sub")}
            </p>
          </FadeInSection>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {techLayers.map((layer, i) => {
              const Icon = layer.icon
              return (
                <FadeInSection key={layer.key} delay={i * 0.08}>
                  <div className="relative h-full">
                    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold tracking-wider text-muted-foreground">
                          {layer.num}
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                      </div>
                      <h3 className="mt-5 text-lg font-semibold text-foreground">
                        {layer.title}
                      </h3>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-primary">
                        {layer.subtitle}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {layer.description}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-1.5">
                        {layer.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[10px] uppercase tracking-wide"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {i < techLayers.length - 1 ? (
                      <ChevronRight
                        aria-hidden
                        className="absolute -right-4 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-muted-foreground/40 lg:block"
                      />
                    ) : null}
                  </div>
                </FadeInSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* Competitor comparison */}
      <section className="relative bg-background">
        <div className="container relative py-20 md:py-28">
          <FadeInSection className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t("compare.eyebrow")}
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-foreground md:text-5xl">
              {t("compare.section_title")}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground md:text-base">
              {t("compare.section_sub")}
            </p>
          </FadeInSection>

          <FadeInSection delay={0.1} className="mt-12">
            <CompetitorTable />
          </FadeInSection>
        </div>
      </section>

      {/* Roadmap */}
      <section className="relative bg-secondary/40">
        <div className="container relative py-20 md:py-28">
          <FadeInSection>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t("roadmap.eyebrow")}
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-foreground md:text-5xl">
              {t("roadmap.title_a")}{" "}
              <span className="block font-serif italic font-normal text-accent2">
                {t("roadmap.title_b")}
              </span>
            </h2>
          </FadeInSection>

          <div className="mt-16">
            <div className="relative">
              <div
                aria-hidden
                className="absolute left-0 right-0 top-2 h-px bg-border"
              />
              <div
                aria-hidden
                className="absolute left-0 top-2 h-px bg-gradient-to-r from-primary to-primary/0"
                style={{ width: "25%" }}
              />
              <div className="grid gap-10 md:grid-cols-4">
                {quarters.map((q) => (
                  <div key={q.key} className="relative pt-6">
                    <span
                      aria-hidden
                      className={`absolute left-0 top-0 h-4 w-4 rounded-full border-2 ${
                        q.status === "active"
                          ? "border-primary bg-primary shadow-[0_0_14px_hsl(var(--primary)/0.6)] animate-pulse"
                          : q.status === "upcoming"
                            ? "border-primary/50 bg-background"
                            : "border-border bg-muted"
                      }`}
                    />
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        {q.label}
                      </div>
                      <Badge
                        variant={q.status === "active" ? "default" : "secondary"}
                        className={`h-4 px-1.5 text-[9px] uppercase tracking-wide ${
                          q.status === "future" ? "opacity-60" : ""
                        }`}
                      >
                        {q.statusLabel}
                      </Badge>
                    </div>
                    <div
                      className={`mt-2 text-base font-semibold ${
                        q.status === "future"
                          ? "text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {q.title}
                    </div>
                    <ul
                      className={`mt-3 space-y-1.5 text-xs md:text-sm ${
                        q.status === "future"
                          ? "text-muted-foreground/60"
                          : "text-muted-foreground"
                      }`}
                    >
                      {q.items.map((it) => (
                        <li key={it}>→ {it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo / Contact — full-bleed dark band with top & bottom gradient fades */}
      <section
        id="demo"
        className="relative w-full scroll-mt-24 overflow-hidden bg-marketing text-white"
      >
        {/* Top fade into background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-32 bg-gradient-to-b from-background via-background/70 to-transparent"
        />
        {/* Bottom fade into background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-t from-background via-background/70 to-transparent"
        />
        {/* Soft radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(52,211,153,0.14), transparent 70%)",
          }}
        />
        {/* Faint grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)",
          }}
        />

        <div className="container relative z-[2] py-24 md:py-32 lg:py-40">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
              <FadeInSection>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent2">
                  {t("demo.eyebrow")}
                </p>
                <h2 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
                  {t("demo.title_a")}{" "}
                  <span className="block font-serif italic font-normal text-accent2">
                    {t("demo.title_b")}
                  </span>
                </h2>
                <p className="mt-6 max-w-md text-sm text-white/70 md:text-base">
                  {t("demo.description")}
                </p>

                <a
                  href={`mailto:${t("demo.email")}`}
                  className="mt-10 inline-flex items-center gap-3 text-sm text-white/80 transition-colors hover:text-accent2"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                    <Mail className="h-4 w-4 text-accent2" strokeWidth={1.5} />
                  </span>
                  {t("demo.email")}
                </a>

                <div className="mt-8 flex gap-2">
                  {[
                    {
                      href: companyInfo.linkedin,
                      Icon: Linkedin,
                      label: "LinkedIn",
                    },
                    { href: "https://x.com", Icon: Twitter, label: "X" },
                    {
                      href: "https://instagram.com",
                      Icon: Instagram,
                      label: "Instagram",
                    },
                  ].map(({ href, Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-primary/15 bg-primary/[0.06] text-white/70 transition-colors hover:border-accent2/40 hover:text-accent2"
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </a>
                  ))}
                </div>
              </FadeInSection>

              <FadeInSection delay={0.1}>
                <div className="rounded-2xl border border-primary/15 bg-primary/[0.05] p-6 backdrop-blur md:p-8">
                  <DemoForm />
                </div>
              </FadeInSection>
            </div>
        </div>
      </section>
    </>
  )
}
