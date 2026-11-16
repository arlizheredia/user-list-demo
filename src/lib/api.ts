/**
 * Cliente mínimo para la API pública de JSONPlaceholder.
 *
 * Todas las funciones:
 * - aceptan un `AbortSignal` para poder cancelar peticiones obsoletas
 *   (p. ej. al cambiar de usuario antes de que termine la carga anterior);
 * - validan la respuesta con zod, de forma que un cambio inesperado en la API
 *   se traduce en un error controlado y no en un fallo silencioso en la UI.
 */
import type { z } from 'zod'
import {
  postSchema,
  postsSchema,
  usersSchema,
  type NewPostInput,
  type Post,
  type User,
} from './schemas'

export const API_BASE_URL = 'https://jsonplaceholder.typicode.com'

/** Error de red/HTTP con un mensaje apto para mostrarse al usuario. */
export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Realiza la petición, comprueba el código HTTP y valida el cuerpo con el
 * esquema indicado. Centraliza el manejo de errores de todas las llamadas.
 */
async function request<T extends z.ZodType>(
  path: string,
  schema: T,
  init?: RequestInit,
): Promise<z.infer<T>> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init)
  } catch (error) {
    // Las cancelaciones no son errores "reales": se propagan tal cual para
    // que quien llama pueda ignorarlas.
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError('No se pudo conectar con el servidor. Comprueba tu conexión.')
  }

  if (!response.ok) {
    throw new ApiError(`El servidor respondió con un error (${response.status}).`, response.status)
  }

  const result = schema.safeParse(await response.json())
  if (!result.success) {
    throw new ApiError('La respuesta del servidor no tiene el formato esperado.')
  }
  return result.data
}

/** Obtiene el listado completo de usuarios. */
export function fetchUsers(signal?: AbortSignal): Promise<User[]> {
  return request('/users', usersSchema, { signal })
}

/** Obtiene las publicaciones de un usuario concreto. */
export function fetchUserPosts(userId: number, signal?: AbortSignal): Promise<Post[]> {
  return request(`/users/${userId}/posts`, postsSchema, { signal })
}

/**
 * Crea una publicación. JSONPlaceholder simula la escritura: responde 201 con
 * el recurso, pero no lo persiste (y siempre devuelve `id: 101`).
 */
export function createPost(userId: number, input: NewPostInput): Promise<Post> {
  return request('/posts', postSchema, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({ ...input, userId }),
  })
}
