import { useState, useEffect } from 'react'
import { currentTimeY, TIME_AXIS_WIDTH } from '@/lib/timeGrid'

interface CurrentTimeIndicatorProps {
  isToday: boolean
}

export default function CurrentTimeIndicator({ isToday }: CurrentTimeIndicatorProps) {
  const [y, setY] = useState(currentTimeY)

  useEffect(() => {
    if (!isToday) return
    const id = setInterval(() => setY(currentTimeY()), 60_000)
    return () => clearInterval(id)
  }, [isToday])

  if (!isToday || y < 0) return null

  return (
    <div
      className="pointer-events-none absolute z-[15] flex items-center"
      style={{ top: y, left: 0, right: 0 }}
    >
      {/* Red dot on the time axis edge */}
      <div
        className="h-3 w-3 shrink-0 rounded-full bg-red-500"
        style={{ marginLeft: TIME_AXIS_WIDTH - 6 }}
      />
      {/* Red line across all columns */}
      <div className="h-[2px] flex-1 bg-red-500" />
    </div>
  )
}
