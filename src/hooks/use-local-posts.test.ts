import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { json, mockFetch } from '@/test/mock-fetch'
import { useLocalPosts } from './use-local-posts'

describe('useLocalPosts', () => {
  it('devuelve siempre la misma lista vacía para usuarios sin publicaciones', () => {
    const { result } = renderHook(() => useLocalPosts())
    expect(result.current.getPosts(1)).toBe(result.current.getPosts(2))
    expect(result.current.getPosts(1)).toEqual([])
  })

  it('añade las publicaciones al principio y separadas por usuario', async () => {
    mockFetch({ 'POST /posts': (init) => json({ id: 101, ...JSON.parse(String(init?.body)) }, 201) })
    const { result } = renderHook(() => useLocalPosts())

    await act(() => result.current.createLocalPost(1, { title: 'A', body: 'a' }))
    await act(() => result.current.createLocalPost(1, { title: 'B', body: 'b' }))

    const posts = result.current.getPosts(1)
    expect(posts.map((p) => p.title)).toEqual(['B', 'A'])
    // Aunque la API devuelve siempre id 101, cada una tiene su id local único.
    expect(new Set(posts.map((p) => p.localId)).size).toBe(2)
    expect(result.current.getPosts(2)).toEqual([])
  })

  it('propaga el error si la API falla, sin añadir nada', async () => {
    mockFetch({ 'POST /posts': () => json({}, 500) })
    const { result } = renderHook(() => useLocalPosts())

    await expect(result.current.createLocalPost(1, { title: 'A', body: 'a' })).rejects.toThrow('(500)')
    expect(result.current.getPosts(1)).toEqual([])
  })
})
