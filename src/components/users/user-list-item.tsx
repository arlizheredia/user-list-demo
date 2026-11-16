import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/format'
import type { User } from '@/lib/schemas'
import { cn } from '@/lib/utils'

interface UserListItemProps {
  user: User
  selected: boolean
  onSelect: (user: User) => void
}

/** Fila seleccionable de la lista de usuarios. */
export function UserListItem({ user, selected, onSelect }: UserListItemProps) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect(user)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors',
          'hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
          selected && 'bg-muted',
        )}
      >
        <Avatar>
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{user.name}</span>
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
        </span>
      </button>
    </li>
  )
}
