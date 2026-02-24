import { Link, useMatchRoute, useRouter } from '@tanstack/react-router'
import { Calendar, Users, Clock, Settings, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/auth'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import type { StaffRole } from '@/hooks/useCurrentStaff'

interface SidebarNavProps {
  role: StaffRole | null
  staffName: string | null
}

const mainNavItems = [
  { to: '/schedule', label: 'Schedule', icon: Calendar, roles: null },
  { to: '/patients', label: 'Patients', icon: Users, roles: null },
  { to: '/availability', label: 'Availability', icon: Clock, roles: null },
] as const

const bottomNavItems = [
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] as StaffRole[] },
  { to: '/account', label: 'Account', icon: User, roles: null },
] as const

export function SidebarNav({ role, staffName }: SidebarNavProps) {
  const matchRoute = useMatchRoute()
  const router = useRouter()
  const queryClient = useQueryClient()

  async function handleLogout() {
    await signOut()
    queryClient.clear()
    router.navigate({ to: '/login' })
  }

  function renderLink(item: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
    const isActive = matchRoute({ to: item.to, fuzzy: true })
    return (
      <Link
        key={item.to}
        to={item.to}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </Link>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Main navigation */}
      <nav className="flex flex-col gap-1 p-3">
        {mainNavItems.map((item) => renderLink(item))}
      </nav>

      {/* Bottom section: Settings, Account, User info, Logout */}
      <div className="mt-auto border-t p-3">
        <nav className="flex flex-col gap-1">
          {bottomNavItems
            .filter((item) => !item.roles || (role && item.roles.includes(role)))
            .map((item) => renderLink(item))}
        </nav>
        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <span className="truncate text-sm font-medium">{staffName ?? ''}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
