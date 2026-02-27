import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type SetupState = 'form' | 'loading' | 'seeding' | 'success' | 'error'

export default function SetupPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<SetupState>('form')
  const [errorMsg, setErrorMsg] = useState('')

  const [clinicName, setClinicName] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [enableDemo, setEnableDemo] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const effectiveClinicName = enableDemo ? 'D-Spot' : clinicName.trim()
    if (!effectiveClinicName || !adminName.trim() || !adminEmail.trim()) return

    setState('loading')
    setErrorMsg('')

    // 1. Create practice + admin in DB
    const { data: bootstrapData, error: bootstrapError } = await supabase.rpc('bootstrap_practice', {
      p_clinic_name: effectiveClinicName,
      p_admin_name: adminName.trim(),
      p_admin_email: adminEmail.trim(),
    })

    if (bootstrapError) {
      setState('error')
      setErrorMsg(bootstrapError.message)
      return
    }

    // 2. Seed demo data if checkbox was checked
    if (enableDemo && bootstrapData?.practice_id) {
      setState('seeding')
      const { error: seedError } = await supabase.rpc('seed_demo_data', {
        p_practice_id: bootstrapData.practice_id,
      })
      if (seedError) {
        setErrorMsg(`Clinic created, but demo data failed: ${seedError.message}`)
        // Continue — practice is already set up
      }
    }

    // 3. Send magic link to admin email
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: adminEmail.trim(),
    })

    if (otpError) {
      setState('error')
      setErrorMsg(`Account created but magic link failed: ${otpError.message}. Go to /login and try again.`)
      return
    }

    setState('success')
  }

  // Listen for auth (when admin clicks magic link in another tab)
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') {
      navigate({ to: '/schedule' })
    }
  })

  if (state === 'success') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Card className="w-[460px]">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We sent a magic link to <strong>{adminEmail}</strong>.
              <br />
              Click the link to sign in as administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const loadingText = state === 'seeding' ? 'Populating demo data...' : 'Setting up...'

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Card className="w-[460px]">
        <CardHeader>
          <CardTitle>Welcome to Dental Scheduling</CardTitle>
          <CardDescription>
            Set up your clinic. You will become the system administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="clinicName">Clinic Name *</Label>
              <Input
                id="clinicName"
                placeholder="My Dental Clinic"
                value={enableDemo ? 'D-Spot' : clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                disabled={state === 'loading' || state === 'seeding' || enableDemo}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="adminName">Your Name *</Label>
              <Input
                id="adminName"
                placeholder="Dr. Smith"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                disabled={state === 'loading' || state === 'seeding'}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="adminEmail">Your Email *</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@clinic.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                disabled={state === 'loading' || state === 'seeding'}
              />
            </div>

            <div className="flex items-start gap-3 rounded-md border p-3">
              <Checkbox
                id="enableDemo"
                checked={enableDemo}
                onCheckedChange={(checked) => setEnableDemo(checked === true)}
                disabled={state === 'loading' || state === 'seeding'}
              />
              <div className="flex flex-col gap-1">
                <Label htmlFor="enableDemo" className="cursor-pointer font-medium">
                  Populate with demo data
                </Label>
                <p className="text-xs text-muted-foreground">
                  Creates sample staff, patients, and appointments for evaluation
                </p>
              </div>
            </div>

            {state === 'error' && (
              <p className="text-sm text-destructive">{errorMsg}</p>
            )}

            <Button
              type="submit"
              disabled={state === 'loading' || state === 'seeding' || (!enableDemo && !clinicName.trim()) || !adminName.trim() || !adminEmail.trim()}
            >
              {state === 'loading' || state === 'seeding' ? loadingText : 'Create Clinic & Send Magic Link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
