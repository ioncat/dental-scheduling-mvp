import { Link, useMatchRoute } from '@tanstack/react-router'
import { Calendar, Users, Clock, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StaffRole } from '@/hooks/useCurrentStaff'

interface SidebarNavProps {
  role: StaffRole | null
}

const navItems = [
  { to: '/schedule', label: 'Schedule', icon: Calendar, roles: null },
  { to: '/patients', label: 'Patients', icon: Users, roles: null },
  { to: '/availability', label: 'Availability', icon: Clock, roles: null },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] as StaffRole[] },
  { to: '/account', label: 'Account', icon: User, roles: null },
] as const

export function SidebarNav({ role }: SidebarNavProps) {
  const matchRoute = useMatchRoute()

  return (
    <nav className="flex flex-col gap-1 p-3">
      {navItems
        .filter((item) => !item.roles || (role && item.roles.includes(role)))
        .map((item) => {
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
        })}
    </nav>
  )
}
