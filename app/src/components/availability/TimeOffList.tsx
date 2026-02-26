import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import { useTimeOff, useCreateTimeOff, useDeleteTimeOff } from '@/hooks/useAvailability'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { TimeOffType } from '@/lib/database.types'

const typeColors: Record<TimeOffType, string> = {
  vacation: 'bg-blue-100 text-blue-800',
  sick: 'bg-red-100 text-red-800',
  blocked: 'bg-gray-100 text-gray-800',
}

interface TimeOffListProps {
  staffId: string
  canEdit: boolean
}

export function TimeOffList({ staffId, canEdit }: TimeOffListProps) {
  const { data: timeOff, isLoading } = useTimeOff(staffId)
  const createTimeOff = useCreateTimeOff()
  const deleteTimeOff = useDeleteTimeOff()

  const [adding, setAdding] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [type, setType] = useState<TimeOffType>('vacation')

  async function handleAdd() {
    if (!startDate || !endDate) return
    await createTimeOff.mutateAsync({
      staff_id: staffId,
      start_datetime: `${startDate}T00:00:00Z`,
      end_datetime: `${endDate}T23:59:59Z`,
      type,
    })
    setAdding(false)
    setStartDate('')
    setEndDate('')
    setType('vacation')
  }

  async function handleDelete(id: string) {
    await deleteTimeOff.mutateAsync({ id, staffId })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Time Off</CardTitle>
        {canEdit && (
          <Button variant="ghost" size="sm" onClick={() => setAdding(!adding)}>
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-3">
            {adding && (
              <div className="space-y-3 rounded-md border p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Start Date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>End Date</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as TimeOffType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacation">Vacation</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAdd} disabled={createTimeOff.isPending || !startDate || !endDate}>
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {(!timeOff || timeOff.length === 0) && !adding && (
              <p className="py-4 text-center text-sm text-muted-foreground">No time off scheduled.</p>
            )}

            {timeOff?.map((entry) => {
              const start = new Date(entry.start_datetime)
              const end = new Date(entry.end_datetime)
              return (
                <div key={entry.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-1">
                    <div className="text-sm">
                      {start.toLocaleDateString()} — {end.toLocaleDateString()}
                    </div>
                    <Badge className={typeColors[entry.type as TimeOffType]} variant="secondary">
                      {entry.type}
                    </Badge>
                  </div>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
