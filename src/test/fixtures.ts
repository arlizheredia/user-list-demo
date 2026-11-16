/** Datos de prueba compartidos por los tests (subconjunto realista de la API). */
import type { Post, User } from '@/lib/schemas'

export const users: User[] = [
  {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'Sincere@april.biz',
    company: { name: 'Romaguera-Crona' },
  },
  {
    id: 2,
    name: 'Ervin Howell',
    username: 'Antonette',
    email: 'Shanna@melissa.tv',
    company: { name: 'Deckow-Crist' },
  },
  {
    id: 3,
    name: 'José Pérez',
    username: 'jperez',
    email: 'jose@example.com',
    company: { name: 'Acme' },
  },
]

export const postsOfUser1: Post[] = [
  { id: 1, userId: 1, title: 'Primera publicación', body: 'Contenido de la primera.' },
  { id: 2, userId: 1, title: 'Segunda publicación', body: 'Contenido de la segunda.' },
]
