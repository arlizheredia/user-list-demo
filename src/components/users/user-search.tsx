import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface UserSearchProps {
  value: string
  onChange: (value: string) => void
}

/** Campo de búsqueda por nombre con icono y etiqueta accesible. */
export function UserSearch({ value, onChange }: UserSearchProps) {
  return (
    <div className="relative">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        aria-label="Buscar usuarios por nombre"
        placeholder="Buscar por nombre…"
        autoComplete="off"
        className="pl-8"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
