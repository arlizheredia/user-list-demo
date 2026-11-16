import type { ReactNode } from 'react'
import type { AsyncResult } from '@/hooks/use-async'
import { ErrorState } from './error-state'
import { LoadingList } from './loading-list'

interface AsyncContentProps<T> {
  /** Resultado de `useAsync`. */
  state: AsyncResult<T>
  /** Texto accesible mientras carga. */
  loadingLabel: string
  /** Filas de esqueleto a mostrar mientras carga. */
  loadingRows?: number
  /** Título del mensaje de error. */
  errorTitle: string
  /** Contenido a pintar cuando los datos están disponibles. */
  children: (data: T) => ReactNode
}

/**
 * Pinta el estado de una petición: esqueletos mientras carga, error con
 * reintento si falla y, si va bien, el contenido de `children(data)`.
 *
 * Centraliza en un único sitio el patrón carga/error/éxito para que todas las
 * vistas lo resuelvan igual (mismos mensajes, misma accesibilidad).
 */
export function AsyncContent<T>({
  state,
  loadingLabel,
  loadingRows,
  errorTitle,
  children,
}: AsyncContentProps<T>) {
  switch (state.status) {
    case 'loading':
      return <LoadingList label={loadingLabel} rows={loadingRows} />
    case 'error':
      return <ErrorState title={errorTitle} error={state.error} onRetry={state.retry} />
    case 'success':
      return children(state.data)
  }
}
