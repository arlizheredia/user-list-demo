/**
 * Utilidad para simular `fetch` en los tests.
 *
 * Cada ruta se asocia a un manejador que devuelve la respuesta. Así cada test
 * declara de forma explícita qué responde la "API" sin depender de la red.
 */
import { vi } from 'vitest'
import { API_BASE_URL } from '@/lib/api'

type Handler = (init?: RequestInit) => Response | Promise<Response>

/** Respuesta JSON con el código indicado. */
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Sustituye `fetch` por un doble que resuelve según `routes`
 * (clave: "MÉTODO /ruta"). Las rutas no declaradas fallan con 404.
 */
export function mockFetch(routes: Record<string, Handler>) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const method = (init?.method ?? 'GET').toUpperCase()
    const handler = routes[`${method} ${url.replace(API_BASE_URL, '')}`]
    return handler ? handler(init) : json({}, 404)
  })
}
