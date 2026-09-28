"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FadeInSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number
  as?: keyof React.JSX.IntrinsicElements
}

/**
 * Lightweight fade-in on intersection. Replaces framer-motion for the landing
 * page to cut ~30–40 KB of client JS and improve TTI. Honors
 * prefers-reduced-motion.
 */
export function FadeInSection({
  delay = 0,
  className,
  style,
  children,
  ...props
}: FadeInSectionProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true)
            io.disconnect()
            break
          }
        }
      },
      { rootMargin: "-60px 0px", threshold: 0.05 }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-500 ease-out motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        className
      )}
      style={{
        transitionDelay: shown ? `${delay * 1000}ms` : "0ms",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
