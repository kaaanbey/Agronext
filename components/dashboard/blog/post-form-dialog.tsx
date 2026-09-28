"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { blogPostSchema, type BlogPostInput } from "@/lib/validations/blog"
import type { BlogPost } from "@/lib/db/schema"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { slugify } from "@/lib/utils"

interface PostFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: BlogPost | null
  onSaved: () => void
}

export function PostFormDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
}: PostFormDialogProps) {
  const t = useTranslations("dashboard.blog")
  const tCommon = useTranslations("common")
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const defaultValues: BlogPostInput = React.useMemo(
    () => ({
      slug: initial?.slug ?? "",
      titleTr: initial?.titleTr ?? "",
      titleEn: initial?.titleEn ?? "",
      excerptTr: initial?.excerptTr ?? "",
      excerptEn: initial?.excerptEn ?? "",
      bodyTr: initial?.bodyTr ?? "",
      bodyEn: initial?.bodyEn ?? "",
      coverImage: initial?.coverImage ?? "",
      published: initial?.published ?? false,
    }),
    [initial]
  )

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BlogPostInput>({
    resolver: zodResolver(blogPostSchema),
    defaultValues,
  })

  React.useEffect(() => {
    reset(defaultValues)
    setSubmitError(null)
  }, [reset, defaultValues, open])

  const published = watch("published")
  const titleTr = watch("titleTr")
  const slugValue = watch("slug")

  React.useEffect(() => {
    if (!initial && !slugValue && titleTr) {
      setValue("slug", slugify(titleTr))
    }
  }, [titleTr, slugValue, initial, setValue])

  const onSubmit = async (values: BlogPostInput) => {
    setSubmitError(null)
    const payload = {
      ...values,
      coverImage: values.coverImage?.trim() ? values.coverImage : null,
      excerptTr: values.excerptTr?.trim() ? values.excerptTr : null,
      excerptEn: values.excerptEn?.trim() ? values.excerptEn : null,
    }
    const url = initial ? `/api/blog/${initial.id}` : "/api/blog"
    const method = initial ? "PATCH" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data: { error?: { tr?: string } } = await res.json().catch(() => ({}))
      setSubmitError(data.error?.tr ?? "Error")
      return
    }
    onSaved()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initial ? t("editPost") : t("newPost")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="slug">{t("form.slug")}</Label>
              <Input id="slug" {...register("slug")} />
              {errors.slug ? (
                <p className="text-xs text-destructive">{errors.slug.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coverImage">{t("form.coverImage")}</Label>
              <Input id="coverImage" {...register("coverImage")} />
              {errors.coverImage ? (
                <p className="text-xs text-destructive">
                  {errors.coverImage.message}
                </p>
              ) : null}
            </div>
          </div>

          <Tabs defaultValue="tr">
            <TabsList>
              <TabsTrigger value="tr">TR</TabsTrigger>
              <TabsTrigger value="en">EN</TabsTrigger>
            </TabsList>
            <TabsContent value="tr" className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="titleTr">{t("form.titleTr")}</Label>
                <Input id="titleTr" {...register("titleTr")} />
                {errors.titleTr ? (
                  <p className="text-xs text-destructive">
                    {errors.titleTr.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="excerptTr">{t("form.excerptTr")}</Label>
                <Textarea id="excerptTr" rows={2} {...register("excerptTr")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bodyTr">{t("form.bodyTr")}</Label>
                <Textarea id="bodyTr" rows={8} {...register("bodyTr")} />
                {errors.bodyTr ? (
                  <p className="text-xs text-destructive">
                    {errors.bodyTr.message}
                  </p>
                ) : null}
              </div>
            </TabsContent>
            <TabsContent value="en" className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="titleEn">{t("form.titleEn")}</Label>
                <Input id="titleEn" {...register("titleEn")} />
                {errors.titleEn ? (
                  <p className="text-xs text-destructive">
                    {errors.titleEn.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="excerptEn">{t("form.excerptEn")}</Label>
                <Textarea id="excerptEn" rows={2} {...register("excerptEn")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bodyEn">{t("form.bodyEn")}</Label>
                <Textarea id="bodyEn" rows={8} {...register("bodyEn")} />
                {errors.bodyEn ? (
                  <p className="text-xs text-destructive">
                    {errors.bodyEn.message}
                  </p>
                ) : null}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-3">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={(v) => setValue("published", v)}
              />
              <Label htmlFor="published">{t("form.published")}</Label>
            </div>
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {tCommon("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
