import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCurrentStaff } from '@/hooks/useCurrentStaff'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorBanner } from '@/components/shared/ErrorBanner'

const roleBadgeColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  clinic_manager: 'bg-blue-100 text-blue-800',
  doctor: 'bg-green-100 text-green-800',
}

export default function AccountPage() {
  const { staff, role, isLoading, error } = useCurrentStaff()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <ErrorBanner message={error.message} />
  }

  if (!staff) {
    return <ErrorBanner message="Staff profile not found." />
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Account</h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow label="Name" value={staff.full_name} />
          <InfoRow label="Email" value={staff.email} />
          <InfoRow label="Phone" value={staff.phone_number ?? '—'} />
          <div className="flex gap-3">
            <span className="w-24 shrink-0 text-sm text-muted-foreground">Role</span>
            <Badge className={roleBadgeColors[role ?? ''] ?? ''} variant="secondary">
              {role}
            </Badge>
          </div>
          <InfoRow label="Status" value={staff.status} />
        </CardContent>
      </Card>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-24 shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}
