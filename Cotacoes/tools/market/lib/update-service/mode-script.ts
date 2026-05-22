export function scriptForMode(mode: string) {
  if (mode === 'calendar') return 'market:calendar'
  if (mode === 'portfolio') return 'market:portfolio'
  if (mode === 'di') return 'market:di'
  if (mode === 'all') return 'market:all'
  return 'market:once'
}
