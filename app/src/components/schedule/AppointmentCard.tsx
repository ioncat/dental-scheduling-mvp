import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { AppointmentStatus } from '@/lib/database.types'

interface AppointmentCardProps {
  id: string
  patientName: string
  status: AppointmentStatus
  startTime: string
  endTime: string
  notes: string | null
  onClick: () => void
}

const statusStyles: Record<AppointmentStatus, string> = {
  scheduled: 'border-l-blue-500 bg-blue-50',
  unassigned: 'border-l-orange-500 bg-orange-50 animate-pulse',
  completed: 'border-l-green-500 bg-green-50 opacity-75',
  cancelled: 'border-l-gray-400 bg-gray-50 opacity-50 line-through',
}

const badgeVariant: Record<AppointmentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  scheduled: 'default',
  unassigned: 'destructive',
  completed: 'secondary',
  cancelled: 'outline',
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function AppointmentCard({ patientName, status, startTime, endTime, notes, onClick }: AppointmentCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-md border-l-4 px-3 py-2 text-left text-sm transition-shadow hover:shadow-md',
        statusStyles[status],
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{patientName}</span>
        <Badge variant={badgeVariant[status]} className="text-xs">
          {status}
        </Badge>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {formatTime(startTime)} – {formatTime(endTime)}
      </div>
      {notes && (
        <div className="mt-1 truncate text-xs text-muted-foreground">{notes}</div>
      )}
    </button>
  )
}
