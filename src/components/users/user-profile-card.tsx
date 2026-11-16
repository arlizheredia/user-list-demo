import { Building2, Mail } from 'lucide-react'
import { IconText } from '@/components/common/icon-text'
import { UserAvatar } from '@/components/common/user-avatar'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { User } from '@/lib/schemas'

/** Ficha resumida de un usuario: avatar, nombre, email y empresa. */
export function UserProfileCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-3">
        <UserAvatar name={user.name} size="lg" />
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle>
            <h2>{user.name}</h2>
          </CardTitle>
          <CardDescription className="flex flex-wrap gap-x-4 gap-y-1">
            <IconText icon={Mail}>{user.email}</IconText>
            <IconText icon={Building2}>{user.company.name}</IconText>
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  )
}
