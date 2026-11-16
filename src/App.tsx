import { useState } from 'react'
import { MousePointerClick, Users } from 'lucide-react'
import { EmptyState } from '@/components/feedback/empty-state'
import type { LocalPost } from '@/components/posts/post-list'
import { UserPosts } from '@/components/posts/user-posts'
import { Card } from '@/components/ui/card'
import { UserList } from '@/components/users/user-list'
import { createPost } from '@/lib/api'
import type { NewPostInput, User } from '@/lib/schemas'

/**
 * Componente raíz. Mantiene dos piezas de estado:
 * - el usuario seleccionado;
 * - las publicaciones creadas en la sesión, agrupadas por usuario. Viven aquí
 *   (y no dentro del panel de detalle) para que no se pierdan al cambiar de
 *   usuario y volver, ya que la API no las persiste.
 */
export default function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [localPosts, setLocalPosts] = useState<Record<number, LocalPost[]>>({})

  async function handleCreatePost(user: User, input: NewPostInput) {
    const created = await createPost(user.id, input)
    const post: LocalPost = { ...created, localId: crypto.randomUUID() }
    setLocalPosts((prev) => ({ ...prev, [user.id]: [post, ...(prev[user.id] ?? [])] }))
  }

  return (
    <div className="min-h-svh bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-4">
          <Users aria-hidden className="size-5" />
          <h1 className="font-heading text-lg font-semibold">Directorio de usuarios</h1>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[22rem_1fr] lg:items-start">
        <UserList selectedUserId={selectedUser?.id ?? null} onSelect={setSelectedUser} />

        {selectedUser ? (
          <UserPosts
            user={selectedUser}
            localPosts={localPosts[selectedUser.id] ?? []}
            onCreatePost={(input) => handleCreatePost(selectedUser, input)}
          />
        ) : (
          <Card>
            <EmptyState
              icon={MousePointerClick}
              title="Selecciona un usuario"
              description="Elige un usuario de la lista para ver sus publicaciones y crear una nueva."
            />
          </Card>
        )}
      </main>
    </div>
  )
}
