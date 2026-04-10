import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LoadingSpinner } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('applies animate-spin class', () => {
    const { container } = render(<LoadingSpinner />)
    const svg = container.querySelector('svg')!
    expect(svg.className.baseVal || svg.getAttribute('class')).toContain('animate-spin')
  })

  it('accepts custom className', () => {
    const { container } = render(<LoadingSpinner className="text-red-500" />)
    const svg = container.querySelector('svg')!
    const classes = svg.className.baseVal || svg.getAttribute('class') || ''
    expect(classes).toContain('text-red-500')
  })
})
