import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBanner } from './ErrorBanner'

describe('ErrorBanner', () => {
  it('renders error message', () => {
    render(<ErrorBanner message="Something failed" />)
    expect(screen.getByText('Something failed')).toBeInTheDocument()
  })

  it('has destructive styling', () => {
    const { container } = render(<ErrorBanner message="Error" />)
    const banner = container.firstElementChild as HTMLElement
    expect(banner.className).toContain('destructive')
  })
})
