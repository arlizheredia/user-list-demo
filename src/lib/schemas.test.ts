import { describe, expect, it } from 'vitest'
import { newPostSchema, TITLE_MAX_LENGTH } from './schemas'

describe('newPostSchema', () => {
  it('acepta un título y texto válidos y recorta espacios', () => {
    const result = newPostSchema.safeParse({ title: '  Hola  ', body: ' Mundo ' })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ title: 'Hola', body: 'Mundo' })
  })

  it('exige título y texto (los espacios cuentan como vacío)', () => {
    const result = newPostSchema.safeParse({ title: '   ', body: '' })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((issue) => issue.message)
    expect(messages).toEqual(['El título es obligatorio.', 'El texto es obligatorio.'])
  })

  it('rechaza títulos demasiado largos', () => {
    const result = newPostSchema.safeParse({ title: 'a'.repeat(TITLE_MAX_LENGTH + 1), body: 'ok' })
    expect(result.success).toBe(false)
  })
})
