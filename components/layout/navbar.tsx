"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Menu, X } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { Link, usePathname } from "@/lib/i18n/routing"
import { Logo } from "./logo"
import { LocaleSwitcher } from "./locale-switcher"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function Navbar() {
  const t = useTranslations()
  const tNav = useTranslations("nav")
  const { data: session, status } = useSession()
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  const links = [
    { href: "/", label: tNav("home") },
    { href: "/pricing", label: tNav("pricing") },
    { href: "/about", label: tNav("about") },
    { href: "/blog", label: tNav("blog") },
    { href: "/contact", label: tNav("contact") },
  ]

  const initials = (session?.user?.name ?? session?.user?.email ?? "U")
    .split(" ")
    .map((x) => x[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => {
              const active =
                l.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(l.href)
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {l.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
          {status === "authenticated" && session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full ml-1">
                  <Avatar>
                    {session.user.image ? (
                      <AvatarImage src={session.user.image} alt="" />
                    ) : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{session.user.name ?? session.user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">{t("common.dashboard")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">{t("dashboard.nav.settings")}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  {t("common.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">{t("common.signIn")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">{t("common.getStarted")}</Link>
              </Button>
            </>
          )}
        </div>

        <button
          aria-label="Open menu"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-accent"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="md:hidden border-t">
          <nav className="container py-4 flex flex-col gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium py-2 text-muted-foreground hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-2 border-t">
              <LocaleSwitcher />
              <ThemeToggle />
            </div>
            {session?.user ? (
              <div className="flex flex-col gap-2 pt-2">
                <Button asChild size="sm">
                  <Link href="/dashboard">{t("common.dashboard")}</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  {t("common.signOut")}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth/login">{t("common.signIn")}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/register">{t("common.getStarted")}</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
