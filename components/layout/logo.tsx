import { cn } from "@/lib/utils"

// Logo işareti PNG yerine SVG olarak çizildi: her boyutta keskin, koyu zeminde de
// çalışıyor ve beyaz kutu bırakmıyor. Şekiller agronext-logo.png'deki işaretten
// (iki eğik yaprak + üçgen) ölçülerek alındı; renkler logodakiyle aynı.

interface LogoProps {
  className?: string
  showWordmark?: boolean
}

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <span className={cn("s-brand", className)}>
      <LogoMark />
      {showWordmark ? (
        <span className="s-brand-word" aria-hidden="true">
          <span className="s-brand-agro">AGRO</span>
          <span className="s-brand-next">NEXT</span>
        </span>
      ) : null}
    </span>
  )
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={cn("s-brand-mark", className)} viewBox="395 305 465 318" aria-hidden="true" focusable="false">
      <path fill="#1b5741" d="M402 617 L525 368 C545 330 580 314 615 314 C650 314 672 330 690 350 C660 345 640 360 628 385 L545 565 C530 598 500 617 455 617 Z" />
      <path fill="#2a956b" d="M560 617 L683 368 C703 330 738 314 773 314 C808 314 830 334 852 350 C818 345 798 360 786 385 L703 565 C688 598 658 617 613 617 Z" />
      <path fill="#8bc34a" d="M715 617 L772 512 C778 500 792 500 798 512 L852 617 Z" />
    </svg>
  )
}
