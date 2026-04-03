const STORAGE_KEY = 'app-layout'

export interface LayoutSettings {
  mode: 'full' | 'centered'
  maxWidth: 1400 | 1600 | 1800
  rounded: boolean
  glass: boolean
  bgType: 'color' | 'image'
  bgColor: string
  bgImage: string
}

const DEFAULTS: LayoutSettings = {
  mode: 'full',
  maxWidth: 1600,
  rounded: true,
  glass: false,
  bgType: 'color',
  bgColor: '#dbe4ee',
  bgImage: '',
}

/** Active background value based on current bgType */
export function getActiveBg(settings: LayoutSettings): string {
  return settings.bgType === 'image' && settings.bgImage
    ? settings.bgImage
    : settings.bgColor
}

export function getLayoutSettings(): LayoutSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Migrate from old bgValue format
      if ('bgValue' in parsed && !('bgColor' in parsed)) {
        parsed.bgColor = parsed.bgType === 'color' ? parsed.bgValue : DEFAULTS.bgColor
        parsed.bgImage = parsed.bgType === 'image' ? parsed.bgValue : ''
        delete parsed.bgValue
      }
      return { ...DEFAULTS, ...parsed }
    }
  } catch {
    // localStorage unavailable
  }
  return { ...DEFAULTS }
}

export function saveLayoutSettings(settings: LayoutSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // localStorage unavailable
  }
}
