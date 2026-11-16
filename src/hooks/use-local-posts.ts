import { useCallback, useState } from 'react'
import { createPost } from '@/lib/api'
import type { LocalPost, NewPostInput } from '@/lib/schemas'

/**
 * Lista vacía compartida (y congelada). Devolver siempre la misma referencia
 * para los usuarios sin publicaciones evita crear un array nuevo en cada
 * render, que además invalidaría cualquier memoización aguas abajo.
 */
const NO_POSTS: readonly LocalPost[] = Object.freeze([])

/**
 * Publicaciones creadas durante la sesión, agrupadas por usuario.
 *
 * La API no persiste los datos, así que se guardan aquí para que no se pierdan
 * al cambiar de usuario y volver. Se usa un `Map` porque las claves son ids
 * numéricos y las altas son frecuentes; cada alta crea un `Map` nuevo
 * (inmutabilidad) pero reutiliza los arrays de los demás usuarios.
 */
export function useLocalPosts() {
  const [postsByUser, setPostsByUser] = useState<ReadonlyMap<number, readonly LocalPost[]>>(() => new Map())

  /** Publicaciones locales de un usuario (la misma lista vacía si no tiene). */
  const getPosts = useCallback((userId: number) => postsByUser.get(userId) ?? NO_POSTS, [postsByUser])

  /**
   * Envía la publicación a la API y, si responde bien, la añade al principio.
   * Si falla, el error se propaga para que el formulario lo muestre.
   */
  const createLocalPost = useCallback(async (userId: number, input: NewPostInput) => {
    const created = await createPost(userId, input)
    const post: LocalPost = { ...created, localId: crypto.randomUUID() }
    setPostsByUser((prev) => new Map(prev).set(userId, [post, ...(prev.get(userId) ?? NO_POSTS)]))
  }, [])

  return { getPosts, createLocalPost }
}
