import { memo } from 'react'
import { FileText } from 'lucide-react'
import { EmptyState } from '@/components/feedback/empty-state'
import { Badge } from '@/components/ui/badge'
import type { LocalPost, Post } from '@/lib/schemas'

interface PostListProps {
  /** Publicaciones creadas localmente (se muestran primero). */
  localPosts: readonly LocalPost[]
  /** Publicaciones obtenidas de la API. */
  remotePosts: readonly Post[]
}

/** Lista de publicaciones: primero las nuevas y después las del servidor. */
export function PostList({ localPosts, remotePosts }: PostListProps) {
  if (localPosts.length === 0 && remotePosts.length === 0) {
    return <EmptyState icon={FileText} title="Sin publicaciones" description="Este usuario aún no ha publicado nada." />
  }

  return (
    <ol aria-label="Publicaciones" className="flex flex-col gap-3">
      {localPosts.map((post) => (
        <PostItem key={post.localId} post={post} isNew />
      ))}
      {remotePosts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </ol>
  )
}

interface PostItemProps {
  post: Post
  isNew?: boolean
}

/**
 * Tarjeta de una publicación. Con `memo`, al añadir una publicación nueva solo
 * se renderiza la tarjeta nueva: las existentes conservan la misma referencia
 * de `post` y React las omite.
 */
const PostItem = memo(function PostItem({ post, isNew = false }: PostItemProps) {
  return (
    <li className="rounded-lg border bg-card p-4">
      <article className="flex flex-col gap-1.5">
        <header className="flex items-start justify-between gap-2">
          <h3 className="leading-snug font-medium first-letter:uppercase">{post.title}</h3>
          {isNew && <Badge>Nueva</Badge>}
        </header>
        <p className="text-sm whitespace-pre-line text-muted-foreground">{post.body}</p>
      </article>
    </li>
  )
})
