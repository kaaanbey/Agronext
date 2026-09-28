"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  BrainCircuit,
  Cloud,
  Cpu,
  Smartphone,
  type LucideIcon,
} from "lucide-react"
import { FadeInSection } from "@/components/landing/motion-section"
import { ScreenRouter } from "@/components/landing/product-screens/screen-router"
import type {
  ScreenLabels,
  ScreenVariant,
} from "@/components/landing/product-screens/types"

export interface ProductLayer {
  key: ScreenVariant
  num: string
  title: string
  short: string
  detail: string
}

interface ProductShowcaseProps {
  eyebrow: string
  titleA: string
  titleB: string
  description: string
  liveLabel: string
  layers: ProductLayer[]
  phoneLabels: ScreenLabels
}

const iconMap: Record<ScreenVariant, LucideIcon> = {
  hardware: Cpu,
  ai: BrainCircuit,
  cloud: Cloud,
  app: Smartphone,
}

export function ProductShowcase({
  eyebrow,
  titleA,
  titleB,
  description,
  liveLabel,
  layers,
  phoneLabels,
}: ProductShowcaseProps) {
  const [activeKey, setActiveKey] = React.useState<ScreenVariant>(
    layers[0]?.key ?? "hardware"
  )
  const [direction, setDirection] = React.useState(1)

  const selectLayer = React.useCallback(
    (key: ScreenVariant) => {
      if (key === activeKey) return
      const order = layers.map((l) => l.key)
      const oldIdx = order.indexOf(activeKey)
      const newIdx = order.indexOf(key)
      setDirection(newIdx > oldIdx ? 1 : -1)
      setActiveKey(key)
    },
    [activeKey, layers]
  )

  return (
    <section className="relative bg-background">
      <div className="container relative py-20 md:py-28">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.08fr]">
          <FadeInSection>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-black leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {titleA}{" "}
              <span className="block font-serif italic font-normal text-accent2">
                {titleB}
              </span>
            </h2>
            <p className="mt-6 max-w-lg text-sm text-muted-foreground md:text-base">
              {description}
            </p>

            <div
              className="mt-10 space-y-3"
              role="tablist"
              aria-label="Product layers"
            >
              {layers.map((layer, i) => {
                const Icon = iconMap[layer.key]
                const isActive = layer.key === activeKey
                return (
                  <FadeInSection key={layer.key} delay={i * 0.06}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => selectLayer(layer.key)}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault()
                          selectLayer(layer.key)
                        }
                      }}
                      className={`group flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all md:p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                        isActive
                          ? "border-primary/40 bg-primary/[0.06] shadow-sm"
                          : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-mono text-xs transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {layer.num}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start gap-2">
                          <Icon
                            className={`h-4 w-4 ${
                              isActive ? "text-primary" : "text-muted-foreground"
                            }`}
                            strokeWidth={1.5}
                          />
                          <span className="min-w-0 flex-1 text-sm font-semibold leading-tight text-foreground md:text-base">
                            {layer.title}
                          </span>
                          {isActive ? (
                            <motion.span
                              layoutId="active-layer-pill"
                              className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary"
                              transition={{ type: "spring", stiffness: 320, damping: 28 }}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {liveLabel}
                            </motion.span>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground md:text-sm">
                          {layer.short}
                        </span>
                        {isActive ? (
                          <motion.span
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.25 }}
                            className="mt-3 block overflow-hidden text-xs leading-relaxed text-foreground/75 md:text-sm"
                          >
                            {layer.detail}
                          </motion.span>
                        ) : null}
                      </span>
                    </button>
                  </FadeInSection>
                )
              })}
            </div>
          </FadeInSection>

          <FadeInSection delay={0.15}>
            <div className="relative mx-auto w-fit lg:scale-105">
              {/* Floating badge */}
              <div className="absolute -right-3 -top-3 z-10 rounded-md bg-accent2 px-3 py-1.5 text-xs font-semibold text-accent2-foreground shadow-lg">
                {phoneLabels.badge}
              </div>
              {/* 2D snippet card */}
              <div className="overflow-hidden rounded-[2rem] border border-border bg-card p-3 shadow-xl lg:p-4">
                <ScreenRouter
                  variant={activeKey}
                  labels={phoneLabels}
                  direction={direction}
                />
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  )
}
