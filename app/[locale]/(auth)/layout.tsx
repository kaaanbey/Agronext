import { Link } from "@/lib/i18n/routing"
import { Logo } from "@/components/layout/logo"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="container h-16 flex items-center">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
