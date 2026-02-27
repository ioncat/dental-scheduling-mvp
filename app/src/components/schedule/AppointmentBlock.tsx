import { cn } from '@/lib/utils'
import type { AppointmentStatus } from '@/lib/database.types'
import { SLOT_HEIGHT_PX } from '@/lib/timeGrid'

interface AppointmentBlockProps {
  patientName: string
  status: AppointmentStatus
  startTime: string
  endTime: string
  notes: string | null
  top: number
  height: number
  onClick: () => void
}

const statusStyles: Record<AppointmentStatus, string> = {
  scheduled: 'border-l-blue-500 bg-blue-50 hover:bg-blue-100',
  unassigned: 'border-l-orange-500 bg-orange-50 animate-pulse hover:bg-orange-100',
  completed: 'border-l-green-500 bg-green-50 opacity-75 hover:opacity-90',
  cancelled: 'border-l-gray-400 bg-gray-50 opacity-50 line-through',
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function AppointmentBlock({
  patientName,
  status,
  startTime,
  endTime,
  notes,
  top,
  height,
  onClick,
}: AppointmentBlockProps) {
  const isCompact = height < SLOT_HEIGHT_PX

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'absolute left-1 right-1 z-[5] cursor-pointer overflow-hidden rounded border-l-4 px-2 text-left text-xs shadow-sm transition-shadow hover:shadow-md',
        statusStyles[status],
      )}
      style={{ top, height: Math.max(height, 24) }}
    >
      {isCompact ? (
        <span className="flex items-center gap-1 truncate py-0.5">
          <span className="font-medium">{patientName}</span>
          <span className="text-muted-foreground">{formatTime(startTime)}</span>
        </span>
      ) : (
        <>
          <div className="truncate pt-1 font-medium">{patientName}</div>
          <div className="text-muted-foreground">
            {formatTime(startTime)} – {formatTime(endTime)}
          </div>
          {notes && height >= SLOT_HEIGHT_PX * 1.5 && (
            <div className="truncate text-muted-foreground/70">{notes}</div>
          )}
        </>
      )}
    </button>
  )
}
