import { setRequestLocale, getTranslations } from "next-intl/server"
import { Link } from "@/lib/i18n/routing"
import { RegisterForm } from "@/components/auth/register-form"

interface PageProps {
  params: { locale: string }
}

export default async function RegisterPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale)
  const t = await getTranslations("auth.register")

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <RegisterForm />

      <div className="mt-6 text-center text-sm text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link href="/auth/login" className="text-primary hover:underline">
          {t("login")}
        </Link>
      </div>
    </div>
  )
}
