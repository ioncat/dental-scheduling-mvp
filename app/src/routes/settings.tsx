import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useCurrentStaff } from '@/hooks/useCurrentStaff'
import { PracticeSettingsForm } from '@/components/settings/PracticeSettingsForm'
import { StaffTable } from '@/components/settings/StaffTable'
import { InviteStaffModal } from '@/components/settings/InviteStaffModal'

export default function SettingsPage() {
  const { staff } = useCurrentStaff()
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Tabs defaultValue="practice">
        <TabsList>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="practice" className="mt-4">
          {staff?.practice_id && (
            <PracticeSettingsForm practiceId={staff.practice_id} />
          )}
        </TabsContent>

        <TabsContent value="staff" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Invite Staff
            </Button>
          </div>
          <StaffTable />
          <InviteStaffModal
            open={inviteOpen}
            onOpenChange={setInviteOpen}
            practiceId={staff?.practice_id}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
