import { useState } from 'react'
import { THEMES, getTheme, setTheme, type ThemeId } from '@/lib/theme'
import { getLayoutSettings, saveLayoutSettings, type LayoutSettings } from '@/lib/layout-settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, Upload, X } from 'lucide-react'

const MAX_IMAGE_WIDTH = 1920

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = () => {
      img.onload = () => {
        const scale = img.width > MAX_IMAGE_WIDTH ? MAX_IMAGE_WIDTH / img.width : 1
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function SystemSettings() {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(getTheme)
  const [layout, setLayout] = useState<LayoutSettings>(getLayoutSettings)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(true)

  function handleThemeSelect(id: ThemeId) {
    setTheme(id)
    setCurrentTheme(id)
  }

  function updateLayout(patch: Partial<LayoutSettings>) {
    setLayout((prev) => ({ ...prev, ...patch }))
    setSaved(false)
  }

  function handleSave() {
    saveLayoutSettings(layout)
    window.dispatchEvent(new CustomEvent('layout-settings-changed'))
    setSaved(true)
  }

  return (
    <div className="space-y-6">
      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose the visual theme for the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className={`relative flex flex-col items-start gap-1 rounded-lg border-2 p-4 text-left transition-colors ${
                  currentTheme === theme.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                {currentTheme === theme.id && (
                  <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                <span className="text-sm font-semibold">{theme.name}</span>
                <span className="text-xs text-muted-foreground">{theme.description}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Layout */}
      <Card>
        <CardHeader>
          <CardTitle>Layout</CardTitle>
          <CardDescription>Configure workspace appearance on large screens.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Mode */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Layout Mode</Label>
              <Select
                value={layout.mode}
                onValueChange={(v) => updateLayout({ mode: v as LayoutSettings['mode'] })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Width</SelectItem>
                  <SelectItem value="centered">Centered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Width */}
            <div className="space-y-2">
              <Label>Max Width</Label>
              <Select
                value={String(layout.maxWidth)}
                onValueChange={(v) => updateLayout({ maxWidth: Number(v) as LayoutSettings['maxWidth'] })}
                disabled={layout.mode === 'full'}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1400">1400 px</SelectItem>
                  <SelectItem value="1600">1600 px</SelectItem>
                  <SelectItem value="1800">1800 px</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={layout.rounded}
                onCheckedChange={(v) => updateLayout({ rounded: !!v })}
                disabled={layout.mode === 'full'}
              />
              <span className="text-sm">Rounded corners</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={layout.glass}
                onCheckedChange={(v) => updateLayout({ glass: !!v })}
                disabled={layout.mode === 'full'}
              />
              <span className="text-sm">Glass effect</span>
            </label>
          </div>

          {/* Background */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Background Type</Label>
              <Select
                value={layout.bgType}
                onValueChange={(v) => updateLayout({ bgType: v as LayoutSettings['bgType'] })}
                disabled={layout.mode === 'full'}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="color">Solid Color</SelectItem>
                  <SelectItem value="image">Image URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {layout.bgType === 'color' ? (
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={layout.bgColor.startsWith('#') ? layout.bgColor : '#dbe4ee'}
                    onChange={(e) => updateLayout({ bgColor: e.target.value })}
                    disabled={layout.mode === 'full'}
                    className="h-10 w-14 cursor-pointer rounded-md border border-input p-1"
                  />
                  <span className="text-sm text-muted-foreground">{layout.bgColor}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Background Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={layout.bgImage.startsWith('data:') ? '(uploaded file)' : layout.bgImage}
                    onChange={(e) => updateLayout({ bgImage: e.target.value })}
                    disabled={layout.mode === 'full' || layout.bgImage.startsWith('data:')}
                    placeholder="https://... or upload a file"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={layout.mode === 'full' || uploading}
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.onchange = async () => {
                        const file = input.files?.[0]
                        if (!file) return
                        setUploading(true)
                        try {
                          const dataUrl = await resizeImage(file)
                          updateLayout({ bgImage: dataUrl })
                        } catch {
                          // ignore invalid file
                        }
                        setUploading(false)
                      }
                      input.click()
                    }}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  {layout.bgImage && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={layout.mode === 'full'}
                      onClick={() => updateLayout({ bgImage: '' })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {layout.bgImage && (
                  <div className="mt-2 overflow-hidden rounded-md border">
                    <img
                      src={layout.bgImage}
                      alt="Background preview"
                      className="h-24 w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Save */}
          <Button onClick={handleSave} disabled={saved}>
            {saved ? 'Saved' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
