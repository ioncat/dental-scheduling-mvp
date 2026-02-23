import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import {
  useAvailability,
  useCreateAvailability,
  useUpdateAvailability,
  useDeleteAvailability,
} from '@/hooks/useAvailability'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { Availability } from '@/lib/database.types'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface WeeklyAvailabilityEditorProps {
  staffId: string
  canEdit: boolean
}

export function WeeklyAvailabilityEditor({ staffId, canEdit }: WeeklyAvailabilityEditorProps) {
  const { data: slots, isLoading } = useAvailability(staffId)
  const createSlot = useCreateAvailability()
  const updateSlot = useUpdateAvailability()
  const deleteSlot = useDeleteAvailability()

  const [addingDay, setAddingDay] = useState<number | null>(null)
  const [newStart, setNewStart] = useState('09:00')
  const [newEnd, setNewEnd] = useState('17:00')

  async function handleAdd(weekday: number) {
    await createSlot.mutateAsync({
      staff_id: staffId,
      weekday,
      start_time: newStart,
      end_time: newEnd,
    })
    setAddingDay(null)
    setNewStart('09:00')
    setNewEnd('17:00')
  }

  async function handleUpdate(slot: Availability, field: 'start_time' | 'end_time', value: string) {
    await updateSlot.mutateAsync({
      id: slot.id,
      staffId,
      [field]: value,
    })
  }

  async function handleDelete(slotId: string) {
    await deleteSlot.mutateAsync({ id: slotId, staffId })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <LoadingSpinner />
      </div>
    )
  }

  // Group slots by weekday
  const byDay = new Map<number, Availability[]>()
  for (let d = 0; d < 7; d++) byDay.set(d, [])
  for (const slot of slots ?? []) {
    byDay.get(slot.weekday)?.push(slot)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {WEEKDAYS.map((name, day) => {
          const daySlots = byDay.get(day) ?? []
          return (
            <div key={day} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{name}</span>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAddingDay(addingDay === day ? null : day)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                )}
              </div>

              {daySlots.length === 0 && addingDay !== day && (
                <p className="mt-1 text-xs text-muted-foreground">No availability set</p>
              )}

              {daySlots.map((slot) => (
                <div key={slot.id} className="mt-2 flex items-center gap-2">
                  <Input
                    type="time"
                    value={slot.start_time}
                    onChange={(e) => handleUpdate(slot, 'start_time', e.target.value)}
                    className="w-28"
                    disabled={!canEdit}
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    type="time"
                    value={slot.end_time}
                    onChange={(e) => handleUpdate(slot, 'end_time', e.target.value)}
                    className="w-28"
                    disabled={!canEdit}
                  />
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(slot.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}

              {addingDay === day && (
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    type="time"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-28"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    type="time"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-28"
                  />
                  <Button size="sm" onClick={() => handleAdd(day)} disabled={createSlot.isPending}>
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setAddingDay(null)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
