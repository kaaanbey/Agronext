"use client"

import { useTranslations } from "next-intl"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PricingToggleProps {
  yearly: boolean
  onChange: (yearly: boolean) => void
}

export function PricingToggle({ yearly, onChange }: PricingToggleProps) {
  const t = useTranslations("pricing")

  return (
    <div className="flex items-center justify-center gap-3 mb-12">
      <span
        className={cn(
          "text-sm font-medium",
          !yearly ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {t("monthly")}
      </span>
      <Switch
        checked={yearly}
        onCheckedChange={onChange}
        aria-label="Toggle monthly/yearly pricing"
      />
      <span
        className={cn(
          "text-sm font-medium",
          yearly ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {t("yearly")}
      </span>
      <Badge variant="success" className="ml-1">
        {t("yearlyBadge")}
      </Badge>
    </div>
  )
}
