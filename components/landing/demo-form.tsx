"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

type Status = "idle" | "submitting" | "success" | "error"

export function DemoForm() {
  const t = useTranslations("landing.demo.form")
  const [status, setStatus] = React.useState<Status>("idle")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("submitting")

    const form = event.currentTarget
    const fd = new FormData(form)
    const name = String(fd.get("name") ?? "").trim()
    const email = String(fd.get("email") ?? "").trim()
    const phone = String(fd.get("phone") ?? "").trim()
    const size = String(fd.get("size") ?? "").trim()
    const location = String(fd.get("location") ?? "").trim()
    const userMessage = String(fd.get("message") ?? "").trim()

    const message = [
      phone ? `Telefon: ${phone}` : null,
      size ? `Sera Büyüklüğü: ${size}` : null,
      location ? `Lokasyon: ${location}` : null,
      userMessage ? `\nMesaj:\n${userMessage}` : null,
    ]
      .filter(Boolean)
      .join("\n")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject: "Demo Talep",
          message: message.length >= 10 ? message : message + "\n(Demo talebi)",
        }),
      })
      if (!res.ok) throw new Error("request failed")
      setStatus("success")
      form.reset()
    } catch {
      setStatus("error")
    }
  }

  const inputClass =
    "w-full rounded-md border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-accent2 focus:outline-none focus:ring-2 focus:ring-accent2/30"

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="demo-name" className="text-xs font-medium text-white/70">
            {t("name")}
          </label>
          <input
            id="demo-name"
            name="name"
            required
            minLength={2}
            maxLength={80}
            placeholder={t("namePlaceholder")}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="demo-phone" className="text-xs font-medium text-white/70">
            {t("phone")}
          </label>
          <input
            id="demo-phone"
            name="phone"
            type="tel"
            placeholder={t("phonePlaceholder")}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="demo-email" className="text-xs font-medium text-white/70">
          {t("email")}
        </label>
        <input
          id="demo-email"
          name="email"
          type="email"
          required
          placeholder={t("emailPlaceholder")}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="demo-size" className="text-xs font-medium text-white/70">
          {t("size")}
        </label>
        <select
          id="demo-size"
          name="size"
          defaultValue=""
          className={`${inputClass} appearance-none`}
        >
          <option value="" disabled className="bg-marketing text-white">
            {t("sizePlaceholder")}
          </option>
          <option value="0-500" className="bg-marketing text-white">
            {t("sizeOptions.small")}
          </option>
          <option value="500-2000" className="bg-marketing text-white">
            {t("sizeOptions.medium")}
          </option>
          <option value="2000-10000" className="bg-marketing text-white">
            {t("sizeOptions.large")}
          </option>
          <option value="10000+" className="bg-marketing text-white">
            {t("sizeOptions.xlarge")}
          </option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="demo-location" className="text-xs font-medium text-white/70">
          {t("location")}
        </label>
        <input
          id="demo-location"
          name="location"
          placeholder={t("locationPlaceholder")}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="demo-message" className="text-xs font-medium text-white/70">
          {t("message")}
        </label>
        <textarea
          id="demo-message"
          name="message"
          rows={3}
          placeholder={t("messagePlaceholder")}
          className={`${inputClass} resize-none`}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting"}
        className="w-full bg-accent2 text-accent2-foreground hover:bg-accent2/90"
      >
        {status === "submitting" ? t("submitting") : t("submit")}
        <ArrowRight className="h-4 w-4" />
      </Button>

      {status === "success" ? (
        <p className="text-sm text-accent2">{t("success")}</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-red-400">{t("error")}</p>
      ) : null}
    </form>
  )
}
