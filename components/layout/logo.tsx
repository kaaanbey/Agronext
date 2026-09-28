import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showWordmark?: boolean
}

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark className="h-8 w-8" />
      {showWordmark ? (
        <span className="font-extrabold tracking-tight text-lg">
          Agro<span className="text-primary">Next</span>
        </span>
      ) : null}
    </div>
  )
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-8", className)}
    >
      <rect width="40" height="40" rx="10" className="fill-primary" />
      <path
        d="M20 30 C20 30 10 24 10 16 C10 11 14.5 8 20 8 C25.5 8 30 11 30 16 C30 24 20 30 20 30Z"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
      />
      <line
        x1="20"
        y1="30"
        x2="20"
        y2="14"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="20"
        y1="20"
        x2="15"
        y2="16"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="20"
        y1="17"
        x2="25"
        y2="13.5"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="20" cy="14" r="1.5" fill="white" />
      <circle cx="15" cy="16" r="1.2" fill="white" opacity="0.7" />
      <circle cx="25" cy="13.5" r="1.2" fill="white" opacity="0.7" />
    </svg>
  )
}
