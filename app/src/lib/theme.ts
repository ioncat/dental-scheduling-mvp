const STORAGE_KEY = 'app-theme'
const DEFAULT_THEME = 'dental-practice'

export const THEMES = [
  { id: 'dental-practice', name: 'Default', description: 'Fresh Blue + Smile Yellow' },
  { id: 'nature-distilled', name: 'Nature Distilled', description: 'Warm craft paper + Terracotta' },
  { id: 'eink-paper', name: 'E-Ink Paper', description: 'Clean minimal + Off-white' },
  { id: 'vintage-warm', name: 'Vintage Warm', description: 'Sepia analog + Muted teal' },
  { id: 'legacy', name: 'Legacy', description: 'Original black & white' },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

export function getTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && THEMES.some((t) => t.id === stored)) return stored as ThemeId
  } catch {
    // localStorage unavailable (private browsing)
  }
  return DEFAULT_THEME
}

export function setTheme(themeId: ThemeId) {
  document.documentElement.setAttribute('data-theme', themeId)
  try {
    localStorage.setItem(STORAGE_KEY, themeId)
  } catch {
    // localStorage unavailable
  }
}

/** Apply saved theme on app startup */
export function initTheme() {
  setTheme(getTheme())
}
