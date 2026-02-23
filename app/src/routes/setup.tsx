import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type SetupState = 'form' | 'loading' | 'success' | 'error'

export default function SetupPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<SetupState>('form')
  const [errorMsg, setErrorMsg] = useState('')

  const [clinicName, setClinicName] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clinicName.trim() || !adminName.trim() || !adminEmail.trim()) return

    setState('loading')
    setErrorMsg('')

    // 1. Create practice + admin in DB
    const { error: bootstrapError } = await supabase.rpc('bootstrap_practice', {
      p_clinic_name: clinicName.trim(),
      p_admin_name: adminName.trim(),
      p_admin_email: adminEmail.trim(),
    })

    if (bootstrapError) {
      setState('error')
      setErrorMsg(bootstrapError.message)
      return
    }

    // 2. Send magic link to admin email
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
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                disabled={state === 'loading'}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="adminName">Your Name *</Label>
              <Input
                id="adminName"
                placeholder="Dr. Smith"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                disabled={state === 'loading'}
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
                disabled={state === 'loading'}
              />
            </div>

            {state === 'error' && (
              <p className="text-sm text-destructive">{errorMsg}</p>
            )}

            <Button
              type="submit"
              disabled={state === 'loading' || !clinicName.trim() || !adminName.trim() || !adminEmail.trim()}
            >
              {state === 'loading' ? 'Setting up...' : 'Create Clinic & Send Magic Link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
