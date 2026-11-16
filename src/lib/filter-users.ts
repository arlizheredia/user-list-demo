import type { User } from './schemas'

/**
 * Normaliza un texto para comparaciones de búsqueda: minúsculas y sin tildes
 * ni diacríticos ("José" -> "jose").
 */
export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

/**
 * Filtra usuarios cuyo nombre contenga el texto buscado, sin distinguir
 * mayúsculas ni tildes. Una búsqueda vacía devuelve la lista completa.
 */
export function filterUsersByName(users: readonly User[], query: string): User[] {
  const needle = normalizeText(query)
  if (!needle) return [...users]
  return users.filter((user) => normalizeText(user.name).includes(needle))
}
