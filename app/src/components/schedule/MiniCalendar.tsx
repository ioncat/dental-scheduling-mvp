import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MiniCalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

interface DayCell {
  date: Date
  day: number
  inMonth: boolean
  isToday: boolean
  isSelected: boolean
}

export function MiniCalendar({ selectedDate, onDateSelect }: MiniCalendarProps) {
  const [displayMonth, setDisplayMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  )

  const today = useMemo(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }, [])

  const cells = useMemo<DayCell[]>(() => {
    const year = displayMonth.getFullYear()
    const month = displayMonth.getMonth()

    // First day of month — adjust to Monday-start (0=Mon..6=Sun)
    const firstDay = new Date(year, month, 1)
    let startDow = firstDay.getDay() - 1 // -1=Sun → becomes 6
    if (startDow < 0) startDow = 6

    // Last day of month
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const result: DayCell[] = []

    // Previous month padding
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i)
      result.push({
        date: d,
        day: d.getDate(),
        inMonth: false,
        isToday: false,
        isSelected: false,
      })
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day)
      result.push({
        date: d,
        day,
        inMonth: true,
        isToday: d.getTime() === today.getTime(),
        isSelected:
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate(),
      })
    }

    // Next month padding (fill to 42 cells = 6 rows)
    while (result.length < 42) {
      const d = new Date(year, month + 1, result.length - startDow - daysInMonth + 1)
      result.push({
        date: d,
        day: d.getDate(),
        inMonth: false,
        isToday: false,
        isSelected: false,
      })
    }

    return result
  }, [displayMonth, selectedDate, today])

  function goToPrevMonth() {
    setDisplayMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  function goToNextMonth() {
    setDisplayMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const monthLabel = displayMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col gap-2">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">{monthLabel}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center">
        {WEEKDAYS.map((wd) => (
          <span key={wd} className="text-xs font-medium text-muted-foreground py-1">
            {wd}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => cell.inMonth && onDateSelect(cell.date)}
            disabled={!cell.inMonth}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors mx-auto',
              cell.isSelected && 'bg-primary text-primary-foreground font-semibold',
              cell.isToday && !cell.isSelected && 'border border-primary text-primary font-semibold',
              !cell.inMonth && 'text-muted-foreground/30 cursor-default',
              cell.inMonth && !cell.isSelected && !cell.isToday && 'hover:bg-accent cursor-pointer',
            )}
          >
            {cell.day}
          </button>
        ))}
      </div>
    </div>
  )
}
