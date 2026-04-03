import { useState, useEffect } from 'react'
import { usePractice } from '@/hooks/usePractice'

interface TopBarProps {
  practiceId?: string
}

function useCurrentTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function TopBar({ practiceId }: TopBarProps) {
  const { data: practice } = usePractice(practiceId)
  const now = useCurrentTime()

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <header className="flex h-16 items-center border-b border-border bg-card px-6">
      {practice?.show_on_main && (
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">{practice.clinic_name}</span>
          {practice.slogan && (
            <span className="text-xs text-muted-foreground italic">{practice.slogan}</span>
          )}
        </div>
      )}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{dateStr}</span>
        <span className="text-sm font-medium text-foreground">{timeStr}</span>
      </div>
    </header>
  )
}
