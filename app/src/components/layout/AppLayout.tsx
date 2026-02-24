import { Outlet } from '@tanstack/react-router'
import { SidebarNav } from './SidebarNav'
import { TopBar } from './TopBar'
import { useCurrentStaff } from '@/hooks/useCurrentStaff'

export function AppLayout() {
  const { staff, role, isLoading } = useCurrentStaff()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r bg-card">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-sm font-semibold">Dental Scheduling</span>
        </div>
        <SidebarNav role={role} staffName={staff?.full_name ?? null} />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
