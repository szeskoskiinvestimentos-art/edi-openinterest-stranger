export function normalize(s: string) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function tokensOf(s: string) {
  const n = normalize(s)
  return n ? n.split(' ').filter(Boolean) : []
}
