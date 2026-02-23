import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')

  async function handleLogin() {
    await supabase.auth.signInWithOtp({ email })
    alert('Magic link sent')
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button onClick={handleLogin}>Send Magic Link</button>
    </div>
  )
}