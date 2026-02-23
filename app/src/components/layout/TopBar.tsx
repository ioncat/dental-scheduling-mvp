import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth'
import { useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'

interface TopBarProps {
  staffName: string | null
}

export function TopBar({ staffName }: TopBarProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  async function handleLogout() {
    await signOut()
    queryClient.clear()
    router.navigate({ to: '/login' })
  }

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <span className="text-sm text-muted-foreground">{today}</span>
      <div className="flex items-center gap-3">
        {staffName && (
          <span className="text-sm font-medium">{staffName}</span>
        )}
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
