import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface IconTextProps {
  icon: LucideIcon
  children: ReactNode
}

/** Texto en línea precedido de un icono decorativo (oculto a lectores de pantalla). */
export function IconText({ icon: Icon, children }: IconTextProps) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon aria-hidden className="size-3.5 shrink-0" />
      {children}
    </span>
  )
}
