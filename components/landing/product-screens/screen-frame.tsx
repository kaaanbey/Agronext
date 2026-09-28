"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"

interface ScreenFrameProps {
  greeting: string
  user: string
  live: string
  Icon: LucideIcon
  children: React.ReactNode
}

/**
 * Shared shell for every product screen. Header strip + body container.
 */
export function ScreenFrame({
  greeting,
  user,
  live,
  Icon,
  children,
}: ScreenFrameProps) {
  return (
    <div
      style={{ width: 500, height: 680 }}
      className="relative flex flex-col rounded-[1.8rem] border border-white/5 bg-[#0a1410] p-6 text-white shadow-[inset_0_0_60px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-white/50">{greeting}</div>
          <div className="text-xl font-bold">
            {user} <span className="text-yellow-400">👋</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent2/10 px-2.5 py-1 text-xs font-medium text-accent2">
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          {live}
        </span>
      </div>
      <div className="mt-4 flex-1">{children}</div>
      {/* Bottom home-indicator pill */}
      <div className="mt-3 flex justify-center">
        <span
          aria-hidden
          className="h-1 w-24 rounded-full bg-white/15"
        />
      </div>
    </div>
  )
}
