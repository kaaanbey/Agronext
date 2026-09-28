"use client"

import * as React from "react"
import { useTranslations, useLocale } from "next-intl"
import { Check, X } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import type { StaticPricingPlan } from "@/lib/data/pricing"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PricingToggle } from "./pricing-toggle"
import { FadeInSection } from "@/components/landing/motion-section"

interface PricingCardsProps {
  plans: StaticPricingPlan[]
}

function formatPrice(amount: number, locale: string) {
  if (amount === 0) return null
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
    style: "currency",
    currency: locale === "tr" ? "TRY" : "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function PricingCards({ plans }: PricingCardsProps) {
  const [yearly, setYearly] = React.useState(false)
  const t = useTranslations("pricing")
  const locale = useLocale()

  return (
    <>
      <PricingToggle yearly={yearly} onChange={setYearly} />

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan, i) => {
          const price = yearly ? plan.priceYearly : plan.priceMonthly
          const suffix = yearly ? t("perYear") : t("perMonth")
          const priceLabel = price !== null ? formatPrice(price, locale) : null
          const isContact = price === null
          const name = t(`plans.${plan.nameKey}.name` as "plans.starter.name")
          const description = t(
            `plans.${plan.descriptionKey}.description` as "plans.starter.description"
          )
          const tagline = t(
            `plans.${plan.nameKey}.tagline` as "plans.starter.tagline"
          )
          const ctaLabel = t(
            `cta.${plan.ctaKey}` as "cta.demo"
          )

          return (
            <FadeInSection key={plan.id} delay={i * 0.08}>
              <Card
                className={cn(
                  "h-full relative",
                  plan.highlighted && "border-primary shadow-md ring-1 ring-primary/30"
                )}
              >
                {plan.highlighted ? (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {t("popular")}
                  </Badge>
                ) : null}
                <CardContent className="pt-8 flex flex-col h-full">
                  <h3 className="text-lg font-semibold">{name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 min-h-[2.5rem]">
                    {tagline || description}
                  </p>

                  <div className="mt-6 mb-6">
                    {isContact ? (
                      <div>
                        <div className="text-2xl font-semibold tracking-tight">
                          {t("contactForPrice")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {t("contactForPriceHint")}
                        </div>
                      </div>
                    ) : priceLabel ? (
                      <div>
                        <span className="text-4xl font-semibold tracking-tight">
                          {priceLabel}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">
                          {suffix}
                        </span>
                      </div>
                    ) : (
                      <div className="text-4xl font-semibold tracking-tight">
                        {t("free")}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((feature, idx) => {
                      const label =
                        locale === "tr" ? feature.tr : feature.en
                      return (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                        >
                          {feature.included ? (
                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <span
                            className={cn(
                              !feature.included && "text-muted-foreground"
                            )}
                          >
                            {label}
                          </span>
                        </li>
                      )
                    })}
                  </ul>

                  <Button
                    asChild
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full"
                  >
                    <Link href="/contact">{ctaLabel}</Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeInSection>
          )
        })}
      </div>
    </>
  )
}
