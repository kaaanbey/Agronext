import { eq } from "drizzle-orm"
import { setRequestLocale, getTranslations } from "next-intl/server"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ProfileForm } from "@/components/dashboard/settings/profile-form"
import { PasswordForm } from "@/components/dashboard/settings/password-form"

interface PageProps {
  params: { locale: string }
}

export default async function SettingsPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale)
  const session = await auth()
  if (!session?.user) return null

  const t = await getTranslations("dashboard.settings")

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { passwordHash: true },
  })
  const canChangePassword = Boolean(user?.passwordHash)

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
        {t("title")}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("profile.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("password.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm canChangePassword={canChangePassword} />
        </CardContent>
      </Card>
    </div>
  )
}
