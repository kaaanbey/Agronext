import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/config"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"

interface AppLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default async function AppLayout({
  children,
  params: { locale },
}: AppLayoutProps) {
  const session = await auth()
  if (!session?.user) {
    redirect(`/${locale}/auth/login`)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.user.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
