import { useState } from 'react'
import { useSearchPatients } from '@/hooks/usePatients'
import { Input } from '@/components/ui/input'

interface PatientSelectorProps {
  value: { id: string; full_name: string } | null
  onSelect: (patient: { id: string; full_name: string; phone: string }) => void
}

export function PatientSelector({ value, onSelect }: PatientSelectorProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const { data: patients } = useSearchPatients(query)

  return (
    <div className="relative">
      <Input
        placeholder="Search patient by name..."
        value={value ? value.full_name : query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => query.length >= 2 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />
      {open && patients && patients.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
          {patients.map((patient) => (
            <li
              key={patient.id}
              className="cursor-pointer rounded-sm px-3 py-2 text-sm hover:bg-accent"
              onMouseDown={() => {
                onSelect({ id: patient.id, full_name: patient.full_name, phone: patient.phone })
                setQuery('')
                setOpen(false)
              }}
            >
              <span className="font-medium">{patient.full_name}</span>
              <span className="ml-2 text-muted-foreground">{patient.phone}</span>
            </li>
          ))}
        </ul>
      )}
      {open && query.length >= 2 && patients?.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 text-sm text-muted-foreground shadow-md">
          No patients found
        </div>
      )}
    </div>
  )
}
