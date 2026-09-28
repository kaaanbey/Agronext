"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AppScreen } from "./app-screen"
import { HardwareScreen } from "./hardware-screen"
import { AIScreen } from "./ai-screen"
import { CloudScreen } from "./cloud-screen"
import type { ScreenLabels, ScreenVariant } from "./types"

interface ScreenRouterProps {
  variant: ScreenVariant
  labels: ScreenLabels
  /**
   * +1 → new screen slides in from the right (forward / next app)
   * -1 → new screen slides in from the left (backward / previous app)
   */
  direction?: number
}

const SLIDE_DISTANCE = 460
const SCREEN_WIDTH = 500
const SCREEN_HEIGHT = 680

const slideVariants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? SLIDE_DISTANCE : -SLIDE_DISTANCE,
    opacity: 0.4,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? -SLIDE_DISTANCE : SLIDE_DISTANCE,
    opacity: 0.4,
    scale: 0.96,
  }),
}

export function ScreenRouter({
  variant,
  labels,
  direction = 1,
}: ScreenRouterProps) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
    >
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={variant}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 280, damping: 32, mass: 0.7 },
            opacity: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
          }}
          className="absolute inset-0"
        >
          {variant === "hardware" && <HardwareScreen labels={labels} />}
          {variant === "ai" && <AIScreen labels={labels} />}
          {variant === "cloud" && <CloudScreen labels={labels} />}
          {variant === "app" && <AppScreen labels={labels} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
