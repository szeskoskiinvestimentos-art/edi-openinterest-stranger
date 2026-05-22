export function normalizeDiscordChannelId(raw: string) {
  const s = String(raw || '').trim()
  if (!s) return ''
  if (/^\d{17,20}$/.test(s)) return s
  const matches = s.match(/\d{17,20}/g)
  if (!matches || !matches.length) return ''
  return matches[matches.length - 1]
}

