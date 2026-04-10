import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SidebarNav } from './SidebarNav'

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string; [key: string]: unknown }) => (
    <a href={to} data-testid={`link-${to}`} {...props}>{children}</a>
  ),
  useMatchRoute: () => (opts: { to: string }) => opts.to === '/schedule',
  useRouter: () => ({ navigate: vi.fn() }),
}))

// Mock TanStack Query
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ clear: vi.fn() }),
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}))

describe('SidebarNav', () => {
  it('renders main nav items for any role', () => {
    render(<SidebarNav role="doctor" staffName="Dr. Smith" />)

    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(screen.getByText('Patients')).toBeInTheDocument()
    expect(screen.getByText('Availability')).toBeInTheDocument()
    expect(screen.getByText('Account')).toBeInTheDocument()
  })

  it('shows Settings link for admin role', () => {
    render(<SidebarNav role="admin" staffName="Admin User" />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('hides Settings link for doctor role', () => {
    render(<SidebarNav role="doctor" staffName="Dr. Smith" />)
    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  })

  it('hides Settings link for clinic_manager role', () => {
    render(<SidebarNav role="clinic_manager" staffName="Manager" />)
    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  })

  it('displays staff name', () => {
    render(<SidebarNav role="doctor" staffName="Dr. Smith" />)
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument()
  })

  it('renders sign out button', () => {
    render(<SidebarNav role="admin" staffName="Admin" />)
    expect(screen.getByTitle('Sign out')).toBeInTheDocument()
  })
})
