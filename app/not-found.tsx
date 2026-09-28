import Link from "next/link"

export default function NotFound() {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center p-8 font-sans">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">404</h1>
          <p className="text-sm text-muted-foreground mb-4">Page not found</p>
          <Link href="/tr" className="text-sm underline">
            Ana sayfaya dön
          </Link>
        </div>
      </body>
    </html>
  )
}
