import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import {
  useStaff,
  useStaffMember,
  useActiveDoctors,
  useCreateStaff,
  useUpdateStaffRole,
  useUpdateStaffStatus,
} from './useStaff'

vi.mock('@/repositories/staff.repo', () => ({
  listStaff: vi.fn(),
  getStaff: vi.fn(),
  createStaff: vi.fn(),
  updateStaffRole: vi.fn(),
  updateStaffStatus: vi.fn(),
  listActiveDoctors: vi.fn(),
}))

import * as repo from '@/repositories/staff.repo'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockDoctor = {
  id: 'doc-1',
  practice_id: 'p-1',
  full_name: 'Dr. Smith',
  email: 'smith@clinic.com',
  role: 'doctor' as const,
  status: 'active' as const,
}

describe('useStaff', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches staff list', async () => {
    vi.mocked(repo.listStaff).mockResolvedValue({ data: [mockDoctor], error: null } as never)

    const { result } = renderHook(() => useStaff(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
  })

  it('passes filters to repository', async () => {
    vi.mocked(repo.listStaff).mockResolvedValue({ data: [], error: null } as never)
    const filters = { role: 'doctor' as const }

    renderHook(() => useStaff(filters), { wrapper: createWrapper() })

    await waitFor(() => expect(repo.listStaff).toHaveBeenCalledWith(filters))
  })
})

describe('useStaffMember', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches single staff member', async () => {
    vi.mocked(repo.getStaff).mockResolvedValue({ data: mockDoctor, error: null } as never)

    const { result } = renderHook(() => useStaffMember('doc-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockDoctor)
  })

  it('does not fetch when id is undefined', () => {
    const { result } = renderHook(() => useStaffMember(undefined), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useActiveDoctors', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches only active doctors', async () => {
    vi.mocked(repo.listActiveDoctors).mockResolvedValue({ data: [mockDoctor], error: null } as never)

    const { result } = renderHook(() => useActiveDoctors(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(repo.listActiveDoctors).toHaveBeenCalledOnce()
  })
})

describe('useCreateStaff', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates staff member', async () => {
    vi.mocked(repo.createStaff).mockResolvedValue({ data: mockDoctor, error: null } as never)

    const { result } = renderHook(() => useCreateStaff(), { wrapper: createWrapper() })

    result.current.mutate({
      practice_id: 'p-1',
      full_name: 'Dr. Smith',
      email: 'smith@clinic.com',
      role: 'doctor',
    } as never)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUpdateStaffRole', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates staff role', async () => {
    vi.mocked(repo.updateStaffRole).mockResolvedValue({ data: mockDoctor, error: null } as never)

    const { result } = renderHook(() => useUpdateStaffRole(), { wrapper: createWrapper() })

    result.current.mutate({ id: 'doc-1', role: 'admin' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(repo.updateStaffRole).toHaveBeenCalledWith('doc-1', 'admin')
  })
})

describe('useUpdateStaffStatus', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates staff status (deactivate)', async () => {
    vi.mocked(repo.updateStaffStatus).mockResolvedValue({
      data: { ...mockDoctor, status: 'inactive' },
      error: null,
    } as never)

    const { result } = renderHook(() => useUpdateStaffStatus(), { wrapper: createWrapper() })

    result.current.mutate({ id: 'doc-1', status: 'inactive' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(repo.updateStaffStatus).toHaveBeenCalledWith('doc-1', 'inactive')
  })
})
