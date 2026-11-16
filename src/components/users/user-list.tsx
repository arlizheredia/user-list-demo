import { useDeferredValue, useState } from 'react'
import { SearchX } from 'lucide-react'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { LoadingList } from '@/components/feedback/loading-list'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAsync } from '@/hooks/use-async'
import { fetchUsers } from '@/lib/api'
import { filterUsersByName } from '@/lib/filter-users'
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
  // Con `useDeferredValue` el input responde de inmediato aunque filtrar
  // una lista grande fuese costoso; aquí es barato, pero escala bien.
  const deferredQuery = useDeferredValue(query)

  return (
    <Card className="lg:sticky lg:top-6">
      <CardHeader>
        <CardTitle>
          <h2>Usuarios</h2>
        </CardTitle>
        {users.status === 'success' && (
          <CardAction>
            <Badge variant="secondary">{users.data.length}</Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <UserSearch value={query} onChange={setQuery} />
        {users.status === 'loading' && <LoadingList label="Cargando usuarios…" />}
        {users.status === 'error' && (
          <ErrorState title="No se pudieron cargar los usuarios" error={users.error} onRetry={users.retry} />
        )}
        {users.status === 'success' && (
          <FilteredUsers
            users={filterUsersByName(users.data, deferredQuery)}
            selectedUserId={selectedUserId}
            onSelect={onSelect}
          />
        )}
      </CardContent>
    </Card>
  )
}

interface FilteredUsersProps extends UserListProps {
  users: User[]
}

function FilteredUsers({ users, selectedUserId, onSelect }: FilteredUsersProps) {
  if (users.length === 0) {
    return <EmptyState icon={SearchX} title="Sin resultados" description="Ningún usuario coincide con la búsqueda." />
  }
  return (
    <ul aria-label="Lista de usuarios" className="-mx-2 flex flex-col gap-0.5">
      {users.map((user) => (
        <UserListItem key={user.id} user={user} selected={user.id === selectedUserId} onSelect={onSelect} />
      ))}
    </ul>
  )
}
