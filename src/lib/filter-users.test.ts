import { describe, expect, it } from 'vitest'
import { users } from '@/test/fixtures'
import { createUserSearchIndex, filterUsersByName, searchUsers } from './filter-users'

describe('filterUsersByName', () => {
  it('devuelve todos los usuarios si la búsqueda está vacía o solo tiene espacios', () => {
    expect(filterUsersByName(users, '')).toHaveLength(users.length)
    expect(filterUsersByName(users, '   ')).toHaveLength(users.length)
  })

  it('no distingue mayúsculas ni coincidencias parciales', () => {
    expect(filterUsersByName(users, 'GRAH').map((u) => u.id)).toEqual([1])
  })

  it('ignora tildes tanto en la búsqueda como en el nombre', () => {
    expect(filterUsersByName(users, 'jose perez').map((u) => u.id)).toEqual([3])
    expect(filterUsersByName(users, 'Ervín').map((u) => u.id)).toEqual([2])
  })

  it('devuelve una lista vacía si nadie coincide', () => {
    expect(filterUsersByName(users, 'zzz')).toEqual([])
  })
})

describe('searchUsers con índice', () => {
  it('con búsqueda vacía devuelve la misma lista, sin copiarla', () => {
    const index = createUserSearchIndex(users)
    expect(searchUsers(index, '')).toBe(users)
  })

  it('normaliza los nombres una sola vez al crear el índice', () => {
    const index = createUserSearchIndex(users)
    expect(index.normalizedNames).toEqual(['leanne graham', 'ervin howell', 'jose perez'])
    expect(searchUsers(index, 'PÉREZ').map((u) => u.id)).toEqual([3])
  })
})
