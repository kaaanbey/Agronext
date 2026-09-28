"use client"

import * as React from "react"
import { LayoutDashboard, Sprout, Newspaper, Settings, Menu, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/lib/i18n/routing"
import { Logo } from "./logo"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { UserRole } from "@/types/next-auth"

interface SidebarProps {
  role: UserRole
}

export function Sidebar({ role }: SidebarProps) {
  const t = useTranslations("dashboard.nav")
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const items = [
    { href: "/dashboard", label: t("overview"), icon: LayoutDashboard },
    { href: "/dashboard/greenhouse", label: t("greenhouse"), icon: Sprout },
    ...(role === "admin"
      ? [{ href: "/dashboard/blog", label: t("blog"), icon: Newspaper }]
      : []),
    { href: "/dashboard/settings", label: t("settings"), icon: Settings },
  ]

  const content = (
    <nav className="flex flex-col gap-1 p-4">
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col border-r w-60 h-screen sticky top-0 bg-background">
        <div className="h-16 px-4 flex items-center border-b">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>
        {content}
      </aside>

      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open sidebar"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-64 h-full bg-background border-r shadow-lg flex flex-col">
              <div className="h-16 px-4 flex items-center justify-between border-b">
                <Logo />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {content}
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
