import { setRequestLocale, getTranslations } from "next-intl/server"
import { Link } from "@/lib/i18n/routing"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

interface PageProps {
  params: { locale: string }
}

export default async function ForgotPasswordPage({
  params: { locale },
}: PageProps) {
  setRequestLocale(locale)
  const t = await getTranslations("auth.forgot")

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <ForgotPasswordForm />

      <div className="mt-6 text-center text-sm">
        <Link
          href="/auth/login"
          className="text-muted-foreground hover:text-foreground"
        >
          {t("backToLogin")}
        </Link>
      </div>
    </div>
  )
}
