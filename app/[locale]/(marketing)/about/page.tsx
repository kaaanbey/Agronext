import { setRequestLocale, getTranslations } from "next-intl/server"
import { useTranslations } from "next-intl"
import { AlertTriangle, TrendingDown, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { FadeInSection } from "@/components/landing/motion-section"
import { TeamSection } from "@/components/contact/team-section"

interface PageProps {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: PageProps) {
  const t = await getTranslations({ locale, namespace: "seo.about" })
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("og_title"),
      description: t("og_description"),
    },
  }
}

export default function AboutPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale)
  const t = useTranslations("about")

  const problemItems = [
    {
      key: "one",
      icon: AlertTriangle,
      stat: t("mission.problem.items.one.stat"),
      label: t("mission.problem.items.one.label"),
    },
    {
      key: "two",
      icon: TrendingDown,
      stat: t("mission.problem.items.two.stat"),
      label: t("mission.problem.items.two.label"),
    },
  ]

  const storyParagraphs: string[] = t.raw("story.paragraphs") as string[]

  return (
    <div className="container py-16 md:py-24">
      <FadeInSection className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
      </FadeInSection>

      <section className="mt-20">
        <FadeInSection className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {t("mission.title")}
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {t("mission.lead")}
          </p>
        </FadeInSection>

        <div className="mt-12 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <FadeInSection>
            <Card className="h-full">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-earth mb-4">
                  {t("mission.problem.title")}
                </h3>
                <div className="space-y-4">
                  {problemItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.key}
                        className="flex items-start gap-3 rounded-md bg-muted/40 p-4"
                      >
                        <div className="h-9 w-9 shrink-0 rounded-md bg-destructive/10 text-destructive flex items-center justify-center">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xl font-semibold tracking-tight">
                            {item.stat}
                          </div>
                          <div className="text-sm text-muted-foreground mt-0.5">
                            {item.label}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </FadeInSection>
          <FadeInSection delay={0.1}>
            <Card className="h-full border-primary/40 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-9 w-9 rounded-md bg-primary/15 text-primary flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-semibold text-earth">
                    {t("mission.solution.title")}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t("mission.solution.body")}
                </p>
              </CardContent>
            </Card>
          </FadeInSection>
        </div>
      </section>

      <section className="mt-24">
        <FadeInSection className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center">
            {t("story.title")}
          </h2>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-foreground/90">
            {storyParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </FadeInSection>
      </section>

      <section className="mt-24">
        <TeamSection />
      </section>
    </div>
  )
}
