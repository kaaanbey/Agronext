import Image from "next/image"
import { notFound } from "next/navigation"
import { and, eq } from "drizzle-orm"
import { setRequestLocale, getTranslations } from "next-intl/server"
import { db } from "@/lib/db"
import { blogPosts } from "@/lib/db/schema"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { formatDate } from "@/lib/utils"

export const revalidate = 1800

interface PageProps {
  params: { locale: string; slug: string }
}

export default async function BlogPostPage({
  params: { locale, slug },
}: PageProps) {
  setRequestLocale(locale)
  const t = await getTranslations("blog")

  const post = await db.query.blogPosts.findFirst({
    where: and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)),
    with: { author: true },
  })

  if (!post) notFound()

  const title = locale === "tr" ? post.titleTr : post.titleEn
  const body = locale === "tr" ? post.bodyTr : post.bodyEn

  return (
    <article className="container py-16 md:py-24">
      <Button variant="ghost" size="sm" asChild className="mb-8">
        <Link href="/blog">
          <ArrowLeft className="h-4 w-4" />
          {t("backToList")}
        </Link>
      </Button>

      <div className="max-w-3xl">
        <div className="text-sm text-muted-foreground mb-3">
          {formatDate(post.createdAt, locale)}
          {post.author?.name ? ` · ${post.author.name}` : null}
        </div>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-balance">
          {title}
        </h1>

        {post.coverImage ? (
          <div className="aspect-[16/9] relative bg-muted overflow-hidden rounded-xl mt-8">
            <Image
              src={post.coverImage}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        <div className="prose prose-neutral dark:prose-invert max-w-none mt-10 text-base leading-relaxed">
          {body.split(/\n\n+/).map((para, idx) => (
            <p key={idx} className="mb-4 text-foreground/90">
              {para}
            </p>
          ))}
        </div>
      </div>
    </article>
  )
}
