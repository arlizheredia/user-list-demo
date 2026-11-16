import { useEffect, useState } from 'react'

/** Estado de una operación asíncrona como unión discriminada. */
export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T }

/** Función que obtiene datos y admite cancelación. */
export type Fetcher<T> = (signal: AbortSignal) => Promise<T>

/** Resultado ya resuelto, asociado a la petición que lo produjo. */
interface Settled<T> {
  fetcher: Fetcher<T>
  attempt: number
  result: Exclude<AsyncState<T>, { status: 'loading' }>
}

/**
 * Ejecuta `fetcher` al montar y cada vez que cambia su identidad, y expone el
 * estado de la petición (`loading` / `error` / `success`) junto a `retry`.
 *
 * Decisiones de diseño:
 * - El estado "cargando" se *deriva*: si el último resultado guardado no
 *   pertenece al `fetcher`/intento actual, estamos cargando. Así evitamos
 *   llamar a `setState` de forma síncrona dentro del efecto y nunca se
 *   muestran datos de una petición anterior (p. ej. de otro usuario).
 * - Cada ejecución crea un `AbortController`; al cambiar de `fetcher` o
 *   desmontar se cancela la petición en curso y se descarta su resultado,
 *   evitando condiciones de carrera.
 *
 * Importante: `fetcher` debe ser estable (`useCallback`) para no relanzar la
 * petición en cada render.
 */
export function useAsync<T>(fetcher: Fetcher<T>): AsyncState<T> & { retry: () => void } {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled<T> | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetcher(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) {
          setSettled({ fetcher, attempt, result: { status: 'success', data } })
        }
      },
      (error: unknown) => {
        if (controller.signal.aborted) return
        const normalized = error instanceof Error ? error : new Error(String(error))
        setSettled({ fetcher, attempt, result: { status: 'error', error: normalized } })
      },
    )

    return () => controller.abort()
  }, [fetcher, attempt])

  const isCurrent = settled?.fetcher === fetcher && settled.attempt === attempt
  const state: AsyncState<T> = isCurrent ? settled.result : { status: 'loading' }

  return { ...state, retry: () => setAttempt((n) => n + 1) }
}
