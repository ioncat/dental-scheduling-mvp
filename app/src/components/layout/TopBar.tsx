export function TopBar() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="flex h-14 items-center border-b px-6">
      <span className="text-sm text-muted-foreground">{today}</span>
    </header>
  )
}
