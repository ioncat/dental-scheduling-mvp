import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import {
  usePatients,
  usePatient,
  useSearchPatients,
  useCreatePatient,
  useArchivePatient,
  useRestorePatient,
} from './usePatients'

vi.mock('@/repositories/patients.repo', () => ({
  listPatients: vi.fn(),
  getPatient: vi.fn(),
  createPatient: vi.fn(),
  updatePatient: vi.fn(),
  archivePatient: vi.fn(),
  restorePatient: vi.fn(),
  searchPatients: vi.fn(),
}))

import * as repo from '@/repositories/patients.repo'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockPatient = {
  id: 'pat-1',
  practice_id: 'p-1',
  full_name: 'John Doe',
  phone: '+1234567890',
  email: 'john@test.com',
  messenger: null,
  messenger_type: null,
  notes: null,
  archived_at: null,
  created_at: '2026-04-01T00:00:00Z',
}

describe('usePatients', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches active patients', async () => {
    vi.mocked(repo.listPatients).mockResolvedValue({ data: [mockPatient], error: null } as never)

    const { result } = renderHook(() => usePatients(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(repo.listPatients).toHaveBeenCalledWith(false)
  })

  it('fetches including archived when flag is true', async () => {
    vi.mocked(repo.listPatients).mockResolvedValue({ data: [mockPatient], error: null } as never)

    const { result } = renderHook(() => usePatients(true), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(repo.listPatients).toHaveBeenCalledWith(true)
  })
})

describe('usePatient', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches single patient by id', async () => {
    vi.mocked(repo.getPatient).mockResolvedValue({ data: mockPatient, error: null } as never)

    const { result } = renderHook(() => usePatient('pat-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockPatient)
  })

  it('does not fetch when id is undefined', () => {
    const { result } = renderHook(() => usePatient(undefined), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useSearchPatients', () => {
  beforeEach(() => vi.clearAllMocks())

  it('searches when query is >= 2 chars', async () => {
    vi.mocked(repo.searchPatients).mockResolvedValue({ data: [mockPatient], error: null } as never)

    const { result } = renderHook(() => useSearchPatients('Jo'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(repo.searchPatients).toHaveBeenCalledWith('Jo')
  })

  it('does not search when query is < 2 chars', () => {
    const { result } = renderHook(() => useSearchPatients('J'), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreatePatient', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates patient', async () => {
    vi.mocked(repo.createPatient).mockResolvedValue({ data: mockPatient, error: null } as never)

    const { result } = renderHook(() => useCreatePatient(), { wrapper: createWrapper() })

    result.current.mutate({
      practice_id: 'p-1',
      full_name: 'John Doe',
      phone: '+1234567890',
    } as never)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(repo.createPatient).toHaveBeenCalledOnce()
  })
})

describe('useArchivePatient', () => {
  beforeEach(() => vi.clearAllMocks())

  it('archives patient by id', async () => {
    vi.mocked(repo.archivePatient).mockResolvedValue({ data: mockPatient, error: null } as never)

    const { result } = renderHook(() => useArchivePatient(), { wrapper: createWrapper() })

    result.current.mutate('pat-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(repo.archivePatient).toHaveBeenCalledWith('pat-1')
  })
})

describe('useRestorePatient', () => {
  beforeEach(() => vi.clearAllMocks())

  it('restores archived patient', async () => {
    vi.mocked(repo.restorePatient).mockResolvedValue({ data: mockPatient, error: null } as never)

    const { result } = renderHook(() => useRestorePatient(), { wrapper: createWrapper() })

    result.current.mutate('pat-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(repo.restorePatient).toHaveBeenCalledWith('pat-1')
  })
})
