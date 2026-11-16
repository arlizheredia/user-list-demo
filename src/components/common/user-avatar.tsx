import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/format'

interface UserAvatarProps {
  name: string
  size?: 'sm' | 'default' | 'lg'
}

/** Avatar circular con las iniciales del nombre (la API no ofrece fotos). */
export function UserAvatar({ name, size = 'default' }: UserAvatarProps) {
  return (
    <Avatar size={size}>
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  )
}
