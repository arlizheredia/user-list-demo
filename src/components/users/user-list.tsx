import { useDeferredValue, useMemo, useState } from 'react'
import { SearchX } from 'lucide-react'
import { AsyncContent } from '@/components/feedback/async-content'
import { EmptyState } from '@/components/feedback/empty-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAsync } from '@/hooks/use-async'
import { fetchUsers } from '@/lib/api'
import { createUserSearchIndex, searchUsers } from '@/lib/filter-users'
import type { User } from '@/lib/schemas'
import { UserListItem } from './user-list-item'
import { UserSearch } from './user-search'

interface UserListProps {
  selectedUserId: number | null
  onSelect: (user: User) => void
}

/**
 * Panel con el listado de usuarios: carga los datos, gestiona los estados de
 * carga/error y permite filtrar por nombre.
 */
export function UserList({ selectedUserId, onSelect }: UserListProps) {
  // `fetchUsers` es una función de módulo y por tanto estable entre renders.
  const users = useAsync(fetchUsers)
  const [query, setQuery] = useState('')
  // Con `useDeferredValue` el input responde de inmediato y el filtrado se
  // hace en un render de menor prioridad que React puede interrumpir.
  const deferredQuery = useDeferredValue(query)

  const data = users.status === 'success' ? users.data : null
  // El índice (nombres normalizados) se calcula una sola vez por carga.
  const searchIndex = useMemo(() => (data ? createUserSearchIndex(data) : null), [data])
  const visibleUsers = useMemo(
    () => (searchIndex ? searchUsers(searchIndex, deferredQuery) : []),
    [searchIndex, deferredQuery],
  )

  return (
    <Card className="lg:sticky lg:top-6">
      <CardHeader>
        <CardTitle>
          <h2>Usuarios</h2>
        </CardTitle>
        {data && (
          <CardAction>
            <Badge variant="secondary" aria-label={`${visibleUsers.length} de ${data.length} usuarios`}>
              {visibleUsers.length === data.length ? data.length : `${visibleUsers.length} / ${data.length}`}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <UserSearch value={query} onChange={setQuery} />
        <AsyncContent state={users} loadingLabel="Cargando usuarios…" errorTitle="No se pudieron cargar los usuarios">
          {() =>
            visibleUsers.length === 0 ? (
              <EmptyState icon={SearchX} title="Sin resultados" description="Ningún usuario coincide con la búsqueda." />
            ) : (
              <ul aria-label="Lista de usuarios" className="-mx-2 flex flex-col gap-0.5">
                {visibleUsers.map((user) => (
                  <UserListItem
                    key={user.id}
                    user={user}
                    selected={user.id === selectedUserId}
                    onSelect={onSelect}
                  />
                ))}
              </ul>
            )
          }
        </AsyncContent>
      </CardContent>
    </Card>
  )
}
