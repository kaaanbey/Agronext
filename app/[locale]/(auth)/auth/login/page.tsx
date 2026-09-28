import { Suspense } from "react"
import { setRequestLocale, getTranslations } from "next-intl/server"
import { Link } from "@/lib/i18n/routing"
import { LoginForm } from "@/components/auth/login-form"

interface PageProps {
  params: { locale: string }
}

export default async function LoginPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale)
  const t = await getTranslations("auth.login")

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <div className="mt-6 text-center text-sm space-y-2">
        <div>
          <Link
            href="/auth/forgot-password"
            className="text-muted-foreground hover:text-foreground"
          >
            {t("forgot")}
          </Link>
        </div>
        <div className="text-muted-foreground">
          {t("noAccount")}{" "}
          <Link href="/auth/register" className="text-primary hover:underline">
            {t("register")}
          </Link>
        </div>
      </div>
    </div>
  )
}
