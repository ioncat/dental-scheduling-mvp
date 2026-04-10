import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useAppointments, useAppointment, useCreateAppointment, useUpdateAppointment } from './useAppointments'

// Mock the repository
vi.mock('@/repositories/appointments.repo', () => ({
  listAppointments: vi.fn(),
  getAppointment: vi.fn(),
  createAppointment: vi.fn(),
  updateAppointment: vi.fn(),
}))

import * as repo from '@/repositories/appointments.repo'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockAppointment = {
  id: 'apt-1',
  practice_id: 'p-1',
  patient_id: 'pat-1',
  doctor_id: 'doc-1',
  start_time: '2026-04-10T10:00:00Z',
  end_time: '2026-04-10T11:00:00Z',
  status: 'scheduled' as const,
  notes: null,
  patient: { id: 'pat-1', full_name: 'John Doe', phone: '+1234' },
  doctor: { id: 'doc-1', full_name: 'Dr. Smith' },
}

describe('useAppointments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches appointments list', async () => {
    vi.mocked(repo.listAppointments).mockResolvedValue({
      data: [mockAppointment],
      error: null,
    } as never)

    const { result } = renderHook(() => useAppointments({ date: '2026-04-10' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].id).toBe('apt-1')
    expect(repo.listAppointments).toHaveBeenCalledWith({ date: '2026-04-10' })
  })

  it('throws on error', async () => {
    vi.mocked(repo.listAppointments).mockResolvedValue({
      data: null,
      error: { message: 'DB error' },
    } as never)

    const { result } = renderHook(() => useAppointments(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeTruthy()
  })
})

describe('useAppointment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches single appointment by id', async () => {
    vi.mocked(repo.getAppointment).mockResolvedValue({
      data: mockAppointment,
      error: null,
    } as never)

    const { result } = renderHook(() => useAppointment('apt-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.id).toBe('apt-1')
    expect(repo.getAppointment).toHaveBeenCalledWith('apt-1')
  })

  it('does not fetch when id is undefined', () => {
    const { result } = renderHook(() => useAppointment(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(repo.getAppointment).not.toHaveBeenCalled()
  })
})

describe('useCreateAppointment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates appointment and returns data', async () => {
    vi.mocked(repo.createAppointment).mockResolvedValue({
      data: mockAppointment,
      error: null,
    } as never)

    const { result } = renderHook(() => useCreateAppointment(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      practice_id: 'p-1',
      patient_id: 'pat-1',
      doctor_id: 'doc-1',
      start_time: '2026-04-10T10:00:00Z',
      end_time: '2026-04-10T11:00:00Z',
      status: 'scheduled',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(repo.createAppointment).toHaveBeenCalledOnce()
  })
})

describe('useUpdateAppointment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates appointment status', async () => {
    vi.mocked(repo.updateAppointment).mockResolvedValue({
      data: { ...mockAppointment, status: 'completed' },
      error: null,
    } as never)

    const { result } = renderHook(() => useUpdateAppointment(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ id: 'apt-1', status: 'completed' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(repo.updateAppointment).toHaveBeenCalledWith('apt-1', { status: 'completed' })
  })
})
