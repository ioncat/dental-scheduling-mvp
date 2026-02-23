import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type LoginState = 'idle' | 'loading' | 'success' | 'error'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<LoginState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setState('loading')
    setErrorMsg('')

    const { error } = await supabase.auth.signInWithOtp({ email })

    if (error) {
      setState('error')
      setErrorMsg(error.message)
    } else {
      setState('success')
    }
  }

  // Listen for auth state change (when user clicks magic link)
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') {
      router.navigate({ to: '/schedule' })
    }
  })

  if (state === 'success') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We sent a magic link to <strong>{email}</strong>. Click the link to sign in.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Dental Scheduling</CardTitle>
          <CardDescription>Sign in with your email to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={state === 'loading'}
              />
            </div>
            {state === 'error' && (
              <p className="text-sm text-destructive">{errorMsg}</p>
            )}
            <Button type="submit" disabled={state === 'loading' || !email.trim()}>
              {state === 'loading' ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
