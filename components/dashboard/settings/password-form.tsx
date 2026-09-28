"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validations/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface PasswordFormProps {
  canChangePassword: boolean
}

export function PasswordForm({ canChangePassword }: PasswordFormProps) {
  const t = useTranslations("dashboard.settings.password")
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  if (!canChangePassword) {
    return (
      <p className="text-sm text-muted-foreground">{t("oauthOnly")}</p>
    )
  }

  const onSubmit = async (data: ChangePasswordInput) => {
    setError(null)
    setSuccess(false)
    const res = await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const payload: { error?: { tr?: string } } = await res.json().catch(() => ({}))
      setError(payload.error?.tr ?? "Error")
      return
    }
    setSuccess(true)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">{t("current")}</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          {...register("currentPassword")}
        />
        {errors.currentPassword ? (
          <p className="text-xs text-destructive">
            {errors.currentPassword.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">{t("new")}</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          {...register("newPassword")}
        />
        {errors.newPassword ? (
          <p className="text-xs text-destructive">{errors.newPassword.message}</p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">{t("confirm")}</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-primary">{t("success")}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {t("save")}
      </Button>
    </form>
  )
}
