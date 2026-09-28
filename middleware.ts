import { NextResponse, type NextRequest } from "next/server"
import createIntlMiddleware from "next-intl/middleware"
import { defaultLocale, localePrefix, locales } from "./lib/i18n/config"

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix,
})

const LOCALE_REGEX = /^\/(tr|en)(\/|$)/
const DASHBOARD_REGEX = /^\/(tr|en)\/dashboard(\/|$)/
const ADMIN_REGEX = /^\/(tr|en)\/dashboard\/blog(\/|$)/
const AUTH_PAGES_REGEX = /^\/(tr|en)\/auth\/(login|register|forgot-password)(\/|$)/

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Static and internal assets handled upstream via matcher

  const isDashboard = DASHBOARD_REGEX.test(pathname)
  const isAuthPage = AUTH_PAGES_REGEX.test(pathname)
  const isAdmin = ADMIN_REGEX.test(pathname)

  if (isDashboard || isAuthPage) {
    // Read auth token from cookie without importing server-only code (edge-safe).
    const cookieName = process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token"
    const sessionCookie =
      request.cookies.get(cookieName)?.value ??
      request.cookies.get("authjs.session-token")?.value ??
      request.cookies.get("__Secure-authjs.session-token")?.value

    const locale = pathname.match(LOCALE_REGEX)?.[1] ?? defaultLocale

    if (isDashboard && !sessionCookie) {
      const loginUrl = new URL(`/${locale}/auth/login`, request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (isAuthPage && sessionCookie) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
    }

    // Admin role check is deferred to the page/layout (requires DB lookup).
    if (isAdmin) {
      // page-level guard handles role check with auth()
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
}
