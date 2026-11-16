import { Skeleton } from '@/components/ui/skeleton'

interface LoadingListProps {
  /** Texto accesible que anuncian los lectores de pantalla. */
  label: string
  /** Número de filas de esqueleto a pintar. */
  rows?: number
}

/**
 * Marcador de carga con esqueletos. Usa `role="status"` para que las
 * tecnologías de asistencia anuncien la carga sin interrumpir.
 */
export function LoadingList({ label, rows = 5 }: LoadingListProps) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} aria-hidden className="flex items-center gap-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  )
}
