import { AlertCircle } from 'lucide-react'

interface UnassignedAlertProps {
  count: number
}

export function UnassignedAlert({ count }: UnassignedAlertProps) {
  if (count === 0) return null

  return (
    <div className="flex items-center gap-2 rounded-md border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-800">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>
        <strong>{count}</strong> unassigned appointment{count > 1 ? 's' : ''} — assign a doctor to resolve.
      </span>
    </div>
  )
}
