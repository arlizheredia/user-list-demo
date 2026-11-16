import { useState } from 'react'
import { MousePointerClick, Users } from 'lucide-react'
import { EmptyState } from '@/components/feedback/empty-state'
import { UserPosts } from '@/components/posts/user-posts'
import { Card } from '@/components/ui/card'
import { UserList } from '@/components/users/user-list'
import { useLocalPosts } from '@/hooks/use-local-posts'
import type { User } from '@/lib/schemas'

/**
 * Componente raíz: maqueta la página y coordina el usuario seleccionado con
 * las publicaciones creadas en la sesión (ver `useLocalPosts`).
 */
export default function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { getPosts, createLocalPost } = useLocalPosts()

  return (
    <div className="min-h-svh bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-4">
          <Users aria-hidden className="size-5" />
          <h1 className="font-heading text-lg font-semibold">Directorio de usuarios</h1>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[22rem_1fr] lg:items-start">
        {/* `setSelectedUser` es estable, requisito para que las filas memoizadas no se rendericen de más. */}
        <UserList selectedUserId={selectedUser?.id ?? null} onSelect={setSelectedUser} />

        {selectedUser ? (
          <UserPosts
            user={selectedUser}
            localPosts={getPosts(selectedUser.id)}
            onCreatePost={(input) => createLocalPost(selectedUser.id, input)}
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
