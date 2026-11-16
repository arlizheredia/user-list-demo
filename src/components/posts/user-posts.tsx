import { useCallback } from 'react'
import { PenLine } from 'lucide-react'
import { AsyncContent } from '@/components/feedback/async-content'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserProfileCard } from '@/components/users/user-profile-card'
import { useAsync } from '@/hooks/use-async'
import { fetchUserPosts } from '@/lib/api'
import type { LocalPost, NewPostInput, User } from '@/lib/schemas'
import { NewPostForm } from './new-post-form'
import { PostList } from './post-list'

interface UserPostsProps {
  user: User
  /** Publicaciones creadas en esta sesión para este usuario. */
  localPosts: readonly LocalPost[]
  onCreatePost: (input: NewPostInput) => Promise<void>
}

/** Detalle de un usuario: su ficha, el formulario y sus publicaciones. */
export function UserPosts({ user, localPosts, onCreatePost }: UserPostsProps) {
  const fetchPosts = useCallback((signal: AbortSignal) => fetchUserPosts(user.id, signal), [user.id])
  const posts = useAsync(fetchPosts)

  return (
    <div className="flex flex-col gap-6">
      <UserProfileCard user={user} />

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="inline-flex items-center gap-2">
              <PenLine aria-hidden className="size-4" />
              Nueva publicación
            </h2>
          </CardTitle>
          <CardDescription>Se añadirá al principio de la lista.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* `key` reinicia el formulario (valores y errores) al cambiar de usuario. */}
          <NewPostForm key={user.id} onSubmit={onCreatePost} />
        </CardContent>
      </Card>

      <section aria-labelledby="posts-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="posts-heading" className="font-heading text-base font-medium">
            Publicaciones
          </h2>
          {posts.status === 'success' && (
            <Badge variant="secondary">{posts.data.length + localPosts.length}</Badge>
          )}
        </div>
        <AsyncContent
          state={posts}
          loadingLabel="Cargando publicaciones…"
          loadingRows={3}
          errorTitle="No se pudieron cargar las publicaciones"
        >
          {(remotePosts) => <PostList localPosts={localPosts} remotePosts={remotePosts} />}
        </AsyncContent>
      </section>
    </div>
  )
}
