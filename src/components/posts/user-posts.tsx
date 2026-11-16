import { useCallback } from 'react'
import { Building2, Mail, PenLine } from 'lucide-react'
import { ErrorState } from '@/components/feedback/error-state'
import { LoadingList } from '@/components/feedback/loading-list'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAsync } from '@/hooks/use-async'
import { fetchUserPosts } from '@/lib/api'
import { getInitials } from '@/lib/format'
import type { NewPostInput, User } from '@/lib/schemas'
import { NewPostForm } from './new-post-form'
import { PostList, type LocalPost } from './post-list'

interface UserPostsProps {
  user: User
  /** Publicaciones creadas en esta sesión para este usuario. */
  localPosts: LocalPost[]
  onCreatePost: (input: NewPostInput) => Promise<void>
}

/** Detalle de un usuario: sus datos, el formulario y sus publicaciones. */
export function UserPosts({ user, localPosts, onCreatePost }: UserPostsProps) {
  const fetchPosts = useCallback((signal: AbortSignal) => fetchUserPosts(user.id, signal), [user.id])
  const posts = useAsync(fetchPosts)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle>
              <h2>{user.name}</h2>
            </CardTitle>
            <CardDescription className="flex flex-wrap gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1">
                <Mail aria-hidden className="size-3.5" />
                {user.email}
              </span>
              <span className="inline-flex items-center gap-1">
                <Building2 aria-hidden className="size-3.5" />
                {user.company.name}
              </span>
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

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
        {posts.status === 'loading' && <LoadingList label="Cargando publicaciones…" rows={3} />}
        {posts.status === 'error' && (
          <ErrorState title="No se pudieron cargar las publicaciones" error={posts.error} onRetry={posts.retry} />
        )}
        {posts.status === 'success' && <PostList localPosts={localPosts} remotePosts={posts.data} />}
      </section>
    </div>
  )
}
