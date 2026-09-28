import { createSharedPathnamesNavigation } from "next-intl/navigation"
import { defineRouting } from "next-intl/routing"
import { defaultLocale, localePrefix, locales } from "./config"

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
})

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales, localePrefix })
