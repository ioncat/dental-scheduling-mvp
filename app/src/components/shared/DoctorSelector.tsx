import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useActiveDoctors } from '@/hooks/useStaff'

interface DoctorSelectorProps {
  value: string | undefined
  onValueChange: (value: string) => void
  placeholder?: string
  allowUnassigned?: boolean
}

export function DoctorSelector({
  value,
  onValueChange,
  placeholder = 'Select doctor',
  allowUnassigned = false,
}: DoctorSelectorProps) {
  const { data: doctors, isLoading } = useActiveDoctors()

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Loading...' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowUnassigned && (
          <SelectItem value="unassigned">Unassigned</SelectItem>
        )}
        {doctors?.map((doctor) => (
          <SelectItem key={doctor.id} value={doctor.id}>
            {doctor.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
