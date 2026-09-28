"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/lib/i18n/routing"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { locales, type Locale } from "@/lib/i18n/config"

const labels: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
}

export function LocaleSwitcher() {
  const current = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Globe className="h-4 w-4" />
          <span className="text-xs uppercase">{current}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            disabled={locale === current}
            onClick={() => router.replace(pathname, { locale })}
          >
            {labels[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
