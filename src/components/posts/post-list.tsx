import { FileText } from 'lucide-react'
import { EmptyState } from '@/components/feedback/empty-state'
import { Badge } from '@/components/ui/badge'
import type { Post } from '@/lib/schemas'

/**
 * Publicación creada en esta sesión. JSONPlaceholder devuelve siempre el
 * mismo `id` (101), así que añadimos un identificador local para usarlo como
 * `key` de React y distinguirlas de las que vienen del servidor.
 */
export interface LocalPost extends Post {
  localId: string
}

interface PostListProps {
  /** Publicaciones creadas localmente (se muestran primero). */
  localPosts: LocalPost[]
  /** Publicaciones obtenidas de la API. */
  remotePosts: Post[]
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

function PostItem({ post, isNew = false }: { post: Post; isNew?: boolean }) {
  return (
    <li className="rounded-lg border bg-card p-4">
      <article className="flex flex-col gap-1.5">
        <header className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-snug first-letter:uppercase">{post.title}</h3>
          {isNew && <Badge>Nueva</Badge>}
        </header>
        <p className="whitespace-pre-line text-sm text-muted-foreground">{post.body}</p>
      </article>
    </li>
  )
}
