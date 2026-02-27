import { TIME_AXIS_WIDTH } from '@/lib/timeGrid'

interface DoctorHeaderInfo {
  id: string
  name: string
  count: number
}

interface TimeGridHeaderProps {
  doctors: DoctorHeaderInfo[]
  hasUnassigned: boolean
  unassignedCount: number
}

export default function TimeGridHeader({ doctors, hasUnassigned, unassignedCount }: TimeGridHeaderProps) {
  return (
    <div className="flex border-b bg-card">
      {/* Corner spacer — matches TimeAxis width */}
      <div
        className="shrink-0 border-r"
        style={{ width: TIME_AXIS_WIDTH }}
      />

      {/* Unassigned column header */}
      {hasUnassigned && (
        <div className="flex min-w-[200px] items-center justify-between border-r bg-orange-50/30 px-3 py-2">
          <span className="text-sm font-semibold text-orange-700">Unassigned</span>
          <span className="rounded-full bg-orange-200 px-2 py-0.5 text-xs font-medium text-orange-800">
            {unassignedCount}
          </span>
        </div>
      )}

      {/* Doctor column headers */}
      {doctors.map((doc) => (
        <div
          key={doc.id}
          className="flex min-w-[220px] flex-1 items-center justify-between border-r px-3 py-2 last:border-r-0"
        >
          <span className="text-sm font-semibold">{doc.name}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {doc.count}
          </span>
        </div>
      ))}
    </div>
  )
}
