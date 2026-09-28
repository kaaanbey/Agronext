"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import {
  profileUpdateSchema,
  type ProfileUpdateInput,
} from "@/lib/validations/profile"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function ProfileForm() {
  const t = useTranslations("dashboard.settings.profile")
  const { data: session, update } = useSession()
  const [success, setSuccess] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: { name: session?.user?.name ?? "" },
  })

  React.useEffect(() => {
    reset({ name: session?.user?.name ?? "" })
  }, [session, reset])

  const onSubmit = async (data: ProfileUpdateInput) => {
    setSuccess(false)
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      await update()
      setSuccess(true)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" {...register("name")} />
        {errors.name ? (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" type="email" value={session?.user?.email ?? ""} disabled />
        <p className="text-xs text-muted-foreground">{t("emailLocked")}</p>
      </div>

      {success ? (
        <p className="text-sm text-primary">{t("success")}</p>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {t("save")}
      </Button>
    </form>
  )
}
