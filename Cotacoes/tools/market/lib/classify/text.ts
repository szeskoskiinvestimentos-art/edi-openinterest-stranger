export function normalizeText(s: string) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function includesAny(haystack: string, needles: string[]) {
  const h = normalizeText(haystack)
  return needles.some(n => h.includes(normalizeText(n)))
}

