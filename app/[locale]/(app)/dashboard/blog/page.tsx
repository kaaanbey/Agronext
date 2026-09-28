import { redirect } from "next/navigation"
import { setRequestLocale, getTranslations } from "next-intl/server"
import { auth } from "@/lib/auth/config"
import { BlogAdmin } from "@/components/dashboard/blog/blog-admin"

interface PageProps {
  params: { locale: string }
}

export default async function BlogAdminPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale)
  const session = await auth()
  if (!session?.user) redirect(`/${locale}/auth/login`)
  if (session.user.role !== "admin") {
    const t = await getTranslations("dashboard.blog")
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold mb-2">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("onlyAdmin")}</p>
      </div>
    )
  }

  return <BlogAdmin />
}
