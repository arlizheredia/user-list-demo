import type { User } from './schemas'

/**
 * Normaliza un texto para comparaciones de búsqueda: minúsculas y sin tildes
 * ni diacríticos ("José" -> "jose").
 */
export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

/**
 * Índice de búsqueda: los nombres ya normalizados, en el mismo orden que
 * `users`. Se construye una vez por cada carga de datos, de modo que cada
 * pulsación en el buscador solo hace `includes` sobre cadenas ya preparadas en
 * lugar de volver a normalizar todos los nombres.
 */
export interface UserSearchIndex {
  readonly users: readonly User[]
  readonly normalizedNames: readonly string[]
}

/** Construye el índice de búsqueda de una lista de usuarios. */
export function createUserSearchIndex(users: readonly User[]): UserSearchIndex {
  return { users, normalizedNames: users.map((user) => normalizeText(user.name)) }
}

/**
 * Devuelve los usuarios cuyo nombre contiene el texto buscado, sin distinguir
 * mayúsculas ni tildes. Con una búsqueda vacía devuelve la **misma** lista (sin
 * copiarla), lo que ahorra memoria y mantiene estable la referencia.
 */
export function searchUsers(index: UserSearchIndex, query: string): readonly User[] {
  const needle = normalizeText(query)
  if (!needle) return index.users
  return index.users.filter((_, position) => index.normalizedNames[position]!.includes(needle))
}

/** Atajo para búsquedas puntuales sin reutilizar el índice. */
export function filterUsersByName(users: readonly User[], query: string): readonly User[] {
  return searchUsers(createUserSearchIndex(users), query)
}
