import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase before importing auth
const mockGetUser = vi.fn()
const mockSignOut = vi.fn()
const mockFrom = vi.fn()

vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}))

function mockSupabaseChain(resolvedData: unknown) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: resolvedData }),
  }
  mockFrom.mockReturnValue(chain)
  return chain
}

async function loadAuth() {
  vi.resetModules()
  const mod = await import('./auth')
  return mod
}

describe('auth (normal mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_DEV_BYPASS_AUTH', 'false')
  })

  describe('getCurrentUser', () => {
    it('returns user when authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'doc@clinic.com' } },
      })

      const { getCurrentUser } = await loadAuth()
      const user = await getCurrentUser()
      expect(user).toEqual({ id: 'user-123', email: 'doc@clinic.com' })
      expect(mockGetUser).toHaveBeenCalledOnce()
    })

    it('returns null when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const { getCurrentUser } = await loadAuth()
      const user = await getCurrentUser()
      expect(user).toBeNull()
    })
  })

  describe('getCurrentStaff', () => {
    it('returns staff record for authenticated user', async () => {
      const staffRecord = { id: 'user-123', name: 'Dr. Smith', role: 'doctor', status: 'active' }

      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'doc@clinic.com' } },
      })
      const chain = mockSupabaseChain(staffRecord)

      const { getCurrentStaff } = await loadAuth()
      const staff = await getCurrentStaff()

      expect(staff).toEqual(staffRecord)
      expect(mockFrom).toHaveBeenCalledWith('staff')
      expect(chain.eq).toHaveBeenCalledWith('id', 'user-123')
    })

    it('returns null when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const { getCurrentStaff } = await loadAuth()
      const staff = await getCurrentStaff()

      expect(staff).toBeNull()
      expect(mockFrom).not.toHaveBeenCalled()
    })
  })

  describe('signOut', () => {
    it('calls supabase.auth.signOut', async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const { signOut } = await loadAuth()
      await signOut()
      expect(mockSignOut).toHaveBeenCalledOnce()
    })
  })
})

describe('auth (DEV_BYPASS_AUTH mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_DEV_BYPASS_AUTH', 'true')
  })

  it('getCurrentUser returns dev bypass user', async () => {
    const { getCurrentUser } = await loadAuth()
    const user = await getCurrentUser()

    expect(user).toEqual({ id: 'dev-bypass', email: 'dev@bypass.local' })
    expect(mockGetUser).not.toHaveBeenCalled()
  })

  it('getCurrentStaff queries first admin instead of auth user', async () => {
    const adminRecord = { id: 'admin-1', name: 'Admin', role: 'admin', status: 'active' }
    const chain = mockSupabaseChain(adminRecord)

    const { getCurrentStaff } = await loadAuth()
    const staff = await getCurrentStaff()

    expect(staff).toEqual(adminRecord)
    expect(chain.eq).toHaveBeenCalledWith('role', 'admin')
    expect(chain.eq).toHaveBeenCalledWith('status', 'active')
    expect(chain.limit).toHaveBeenCalledWith(1)
  })
})
