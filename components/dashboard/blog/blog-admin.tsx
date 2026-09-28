"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import type { BlogPost } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDateTime } from "@/lib/utils"
import { PostFormDialog } from "./post-form-dialog"

async function fetchPosts(): Promise<BlogPost[]> {
  const res = await fetch("/api/blog")
  if (!res.ok) throw new Error("Failed to fetch posts")
  const data: { data: BlogPost[] } = await res.json()
  return data.data.map((p) => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  }))
}

export function BlogAdmin() {
  const t = useTranslations("dashboard.blog")
  const locale = useLocale()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<BlogPost | null>(null)

  const queryClient = useQueryClient()
  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "blog-posts"],
    queryFn: fetchPosts,
  })

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (post: BlogPost) => {
    setEditing(post)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("confirmDelete"))) return
    const res = await fetch(`/api/blog/${id}`, { method: "DELETE" })
    if (res.ok) {
      await queryClient.invalidateQueries({ queryKey: ["admin", "blog-posts"] })
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t("newPost")}
        </Button>
      </div>

      <Card>
        <CardContent className="px-0">
          {isLoading ? (
            <p className="px-6 py-8 text-sm text-muted-foreground">Loading...</p>
          ) : posts.length === 0 ? (
            <p className="px-6 py-8 text-sm text-muted-foreground">
              {t("empty")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.title")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.updated")}</TableHead>
                  <TableHead className="text-right">
                    {t("table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => {
                  const title =
                    locale === "tr" ? post.titleTr : post.titleEn
                  return (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="font-medium">{title}</div>
                        <div className="text-xs text-muted-foreground">
                          /{post.slug}
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.published ? (
                          <Badge variant="success">
                            {t("status.published")}
                          </Badge>
                        ) : (
                          <Badge variant="outline">{t("status.draft")}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDateTime(post.updatedAt, locale)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(post)}
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(post.id)}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PostFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSaved={() => refetch()}
      />
    </div>
  )
}
