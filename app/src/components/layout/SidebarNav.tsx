import { useState } from 'react'
import { Link, useMatchRoute, useRouter } from '@tanstack/react-router'
import { Calendar, Users, Clock, Settings, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/auth'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import type { StaffRole } from '@/hooks/useCurrentStaff'

const DEV_BYPASS_AUTH = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

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

  const [bypassNotice, setBypassNotice] = useState(false)

  async function handleLogout() {
    if (DEV_BYPASS_AUTH) {
      setBypassNotice(true)
      return
    }
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
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'shadow-sm'
            : 'cursor-pointer'
        )}
        style={isActive
          ? { background: 'hsl(var(--sidebar-primary))', color: 'hsl(var(--sidebar-primary-foreground))' }
          : { color: 'hsl(var(--sidebar-muted-foreground))' }
        }
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = 'hsl(201 50% 25%)'
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = 'transparent'
        }}
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </Link>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Main navigation */}
      <nav className="flex flex-col gap-1 px-3 pt-4">
        {mainNavItems.map((item) => renderLink(item))}
      </nav>

      {/* Bottom section: Settings, Account, User info, Logout */}
      <div className="mt-auto px-3 pb-4">
        <div className="mb-2" style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }} />
        <nav className="flex flex-col gap-1">
          {bottomNavItems
            .filter((item) => !item.roles || (role && item.roles.includes(role)))
            .map((item) => renderLink(item))}
        </nav>
        {bypassNotice && (
          <p className="mt-2 rounded-md bg-yellow-900/40 px-3 py-1.5 text-xs text-yellow-200">
            Sign out is disabled in dev bypass mode.
          </p>
        )}
        <div className="mt-3 flex items-center justify-between rounded-lg px-3 py-2"
          style={{ background: 'hsl(201 50% 15%)' }}>
          <span className="truncate text-sm font-medium"
            style={{ color: 'hsl(var(--sidebar-foreground))' }}>
            {staffName ?? ''}
          </span>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out"
            className="h-8 w-8 hover:bg-white/10"
            style={{ color: 'hsl(var(--sidebar-muted-foreground))' }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
