import Image from "next/image"
import { desc, eq } from "drizzle-orm"
import { setRequestLocale, getTranslations } from "next-intl/server"
import { db } from "@/lib/db"
import { blogPosts } from "@/lib/db/schema"
import { Link } from "@/lib/i18n/routing"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

export const revalidate = 1800

interface PageProps {
  params: { locale: string }
}

export default async function BlogPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale)
  const t = await getTranslations("blog")

  const posts = await db.query.blogPosts.findMany({
    where: eq(blogPosts.published, true),
    orderBy: [desc(blogPosts.createdAt)],
    with: { author: true },
  })

  return (
    <div className="container py-16 md:py-24">
      <div className="max-w-2xl mb-12">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const title = locale === "tr" ? post.titleTr : post.titleEn
            const excerpt =
              locale === "tr" ? post.excerptTr : post.excerptEn
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                  {post.coverImage ? (
                    <div className="aspect-[16/9] relative bg-muted overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-primary/5" />
                  )}
                  <CardContent className="pt-6">
                    <div className="text-xs text-muted-foreground mb-2">
                      {formatDate(post.createdAt, locale)}
                      {post.author?.name ? ` · ${post.author.name}` : null}
                    </div>
                    <h2 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {title}
                    </h2>
                    {excerpt ? (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {excerpt}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
