import { describe, it, expect, beforeEach } from 'vitest'
import { THEMES, getTheme, setTheme, initTheme } from './theme'

describe('THEMES', () => {
  it('contains at least 2 themes', () => {
    expect(THEMES.length).toBeGreaterThanOrEqual(2)
  })

  it('each theme has id, name, and description', () => {
    for (const theme of THEMES) {
      expect(theme.id).toBeTruthy()
      expect(theme.name).toBeTruthy()
      expect(theme.description).toBeTruthy()
    }
  })

  it('has dental-practice as default', () => {
    expect(THEMES.some((t) => t.id === 'dental-practice')).toBe(true)
  })
})

describe('getTheme', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns default theme when nothing stored', () => {
    expect(getTheme()).toBe('dental-practice')
  })

  it('returns stored theme if valid', () => {
    localStorage.setItem('app-theme', 'eink-paper')
    expect(getTheme()).toBe('eink-paper')
  })

  it('returns default theme if stored value is invalid', () => {
    localStorage.setItem('app-theme', 'nonexistent-theme')
    expect(getTheme()).toBe('dental-practice')
  })
})

describe('setTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('sets data-theme attribute on document', () => {
    setTheme('vintage-warm')
    expect(document.documentElement.getAttribute('data-theme')).toBe('vintage-warm')
  })

  it('persists theme to localStorage', () => {
    setTheme('nature-distilled')
    expect(localStorage.getItem('app-theme')).toBe('nature-distilled')
  })
})

describe('initTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('applies default theme when no saved preference', () => {
    initTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dental-practice')
  })

  it('applies saved theme preference', () => {
    localStorage.setItem('app-theme', 'legacy')
    initTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBe('legacy')
  })
})
