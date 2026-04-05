import { useState, useEffect, useCallback, Suspense } from 'react'
import { Outlet } from '@tanstack/react-router'
import { SidebarNav } from './SidebarNav'
import { TopBar } from './TopBar'
import { useCurrentStaff } from '@/hooks/useCurrentStaff'
import { getLayoutSettings, getActiveBg, type LayoutSettings } from '@/lib/layout-settings'

export function AppLayout() {
  const { staff, role, isLoading } = useCurrentStaff()
  const [layout, setLayout] = useState<LayoutSettings>(getLayoutSettings)

  // Listen for layout changes from SystemSettings
  const handleStorageUpdate = useCallback(() => {
    setLayout(getLayoutSettings())
  }, [])

  useEffect(() => {
    window.addEventListener('layout-settings-changed', handleStorageUpdate)
    return () => window.removeEventListener('layout-settings-changed', handleStorageUpdate)
  }, [handleStorageUpdate])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    )
  }

  const isCentered = layout.mode === 'centered'

  const bg = getActiveBg(layout)
  const outerStyle: React.CSSProperties = isCentered
    ? {
        background: layout.bgType === 'image' && bg
          ? `url(${bg}) center/cover fixed`
          : bg,
      }
    : {}

  const innerClasses = [
    'flex',
    isCentered ? 'h-[calc(100vh-2rem)]' : 'h-screen',
    isCentered && 'layout-centered',
    isCentered && layout.rounded && 'layout-rounded',
    isCentered && layout.glass && 'layout-glass',
  ].filter(Boolean).join(' ')

  const innerStyle: React.CSSProperties = isCentered
    ? { '--layout-max-w': `${layout.maxWidth}px` } as React.CSSProperties
    : {}

  return (
    <div className={isCentered ? 'layout-outer-bg' : ''} style={outerStyle}>
      <div className={innerClasses} style={innerStyle}>
        <aside className="flex w-60 shrink-0 flex-col"
          style={{ background: 'hsl(var(--sidebar-background))' }}>
          <div className="flex h-16 items-center gap-3 px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: 'hsl(var(--sidebar-accent))' }}>
              <span className="text-base font-bold" style={{ color: 'hsl(var(--sidebar-accent-foreground))' }}>D</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold" style={{ color: 'hsl(var(--sidebar-foreground))' }}>
                Dental Scheduling
              </span>
              <span className="text-[11px]" style={{ color: 'hsl(var(--sidebar-muted-foreground))' }}>
                Practice Manager
              </span>
            </div>
          </div>
          <SidebarNav role={role} staffName={staff?.full_name ?? null} />
        </aside>
        <div className={`flex flex-1 flex-col overflow-hidden${isCentered ? ' layout-content-area' : ''}`}>
          <TopBar practiceId={staff?.practice_id} />
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<div className="flex items-center justify-center py-12"><span className="text-muted-foreground">Loading...</span></div>}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}
