import { cn } from '@/lib/utils'
import type { TimeSlot } from '@/lib/slotUtils'

interface AvailableSlotsListProps {
  slots: TimeSlot[]
  selectedSlot: TimeSlot | null
  onSlotSelect: (slot: TimeSlot) => void
  isLoading: boolean
  emptyMessage: string
}

export function AvailableSlotsList({
  slots,
  selectedSlot,
  onSlotSelect,
  isLoading,
  emptyMessage,
}: AvailableSlotsListProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-muted-foreground">Available Times</h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : slots.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="flex max-h-[340px] flex-col gap-1.5 overflow-y-auto pr-1">
          {slots.map((slot) => (
            <button
              key={slot.label}
              type="button"
              onClick={() => onSlotSelect(slot)}
              className={cn(
                'rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                selectedSlot?.startIso === slot.startIso
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {slot.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
