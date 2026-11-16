import { useState } from 'react'
import { UserList } from '@/components/users/user-list'
import type { User } from '@/lib/schemas'

/** Componente raíz: maqueta la página y guarda el usuario seleccionado. */
export default function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  return (
    <div className="min-h-svh bg-muted/40">
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[22rem_1fr] lg:items-start">
        <UserList selectedUserId={selectedUser?.id ?? null} onSelect={setSelectedUser} />
      </main>
    </div>
  )
}
