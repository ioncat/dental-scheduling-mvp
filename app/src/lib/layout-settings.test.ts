import { describe, it, expect, beforeEach } from 'vitest'
import {
  getActiveBg,
  getLayoutSettings,
  saveLayoutSettings,
  type LayoutSettings,
} from './layout-settings'

const DEFAULTS: LayoutSettings = {
  mode: 'full',
  maxWidth: 1600,
  rounded: true,
  glass: false,
  bgType: 'color',
  bgColor: '#dbe4ee',
  bgImage: '',
}

describe('getActiveBg', () => {
  it('returns bgColor when bgType is color', () => {
    expect(getActiveBg({ ...DEFAULTS, bgType: 'color', bgColor: '#fff' })).toBe('#fff')
  })

  it('returns bgImage when bgType is image and bgImage is set', () => {
    expect(getActiveBg({ ...DEFAULTS, bgType: 'image', bgImage: 'photo.jpg' })).toBe('photo.jpg')
  })

  it('falls back to bgColor when bgType is image but bgImage is empty', () => {
    expect(getActiveBg({ ...DEFAULTS, bgType: 'image', bgImage: '' })).toBe('#dbe4ee')
  })
})

describe('getLayoutSettings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns defaults when nothing stored', () => {
    expect(getLayoutSettings()).toEqual(DEFAULTS)
  })

  it('returns stored settings merged with defaults', () => {
    localStorage.setItem('app-layout', JSON.stringify({ mode: 'centered', glass: true }))
    const settings = getLayoutSettings()
    expect(settings.mode).toBe('centered')
    expect(settings.glass).toBe(true)
    expect(settings.maxWidth).toBe(1600) // default preserved
  })

  it('migrates old bgValue format (color)', () => {
    localStorage.setItem(
      'app-layout',
      JSON.stringify({ bgType: 'color', bgValue: '#ff0000' }),
    )
    const settings = getLayoutSettings()
    expect(settings.bgColor).toBe('#ff0000')
    expect(settings.bgImage).toBe('')
  })

  it('migrates old bgValue format (image)', () => {
    localStorage.setItem(
      'app-layout',
      JSON.stringify({ bgType: 'image', bgValue: 'wallpaper.jpg' }),
    )
    const settings = getLayoutSettings()
    expect(settings.bgImage).toBe('wallpaper.jpg')
    expect(settings.bgColor).toBe('#dbe4ee') // default
  })

  it('returns defaults on invalid JSON', () => {
    localStorage.setItem('app-layout', '{broken json')
    expect(getLayoutSettings()).toEqual(DEFAULTS)
  })
})

describe('saveLayoutSettings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists settings to localStorage', () => {
    const custom: LayoutSettings = { ...DEFAULTS, mode: 'centered', glass: true }
    saveLayoutSettings(custom)

    const raw = localStorage.getItem('app-layout')
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw!)).toEqual(custom)
  })

  it('roundtrips through get/save', () => {
    const custom: LayoutSettings = { ...DEFAULTS, maxWidth: 1800, rounded: false }
    saveLayoutSettings(custom)
    expect(getLayoutSettings()).toEqual(custom)
  })
})
