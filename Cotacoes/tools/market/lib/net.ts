async function fetchTextRaw(params: {
  url: string
  timeoutMs: number
  method: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: string
}) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), Math.max(250, params.timeoutMs))
  try {
    const r = await fetch(params.url, {
      method: params.method,
      headers: params.headers,
      body: params.body,
      signal: controller.signal,
    })
    const text = await r.text()
    if (!r.ok) {
      const head = String(text || '').trim().slice(0, 240)
      throw new Error(`HTTP ${r.status}${head ? ` • ${head}` : ''}`)
    }
    return text
  } finally {
    clearTimeout(t)
  }
}

export async function fetchRawWithTimeout(params: {
  url: string
  timeoutMs: number
  method: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: string
}) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), Math.max(250, params.timeoutMs))
  try {
    const r = await fetch(params.url, {
      method: params.method,
      headers: params.headers,
      body: params.body,
      signal: controller.signal,
    })
    const text = await r.text()
    const headers: Record<string, string> = {}
    let setCookie: string[] | null = null
    try {
      const h = r.headers as unknown as { getSetCookie?: () => string[] }
      if (typeof h.getSetCookie === 'function') setCookie = h.getSetCookie()
      r.headers.forEach((value, key) => {
        headers[String(key || '').toLowerCase()] = String(value || '')
      })
    } catch {
      void 0
    }
    if (!setCookie) {
      const sc = headers['set-cookie']
      if (typeof sc === 'string' && sc.trim()) setCookie = [sc.trim()]
    }
    return { status: r.status, ok: r.ok, text, headers, setCookie: setCookie || [] }
  } finally {
    clearTimeout(t)
  }
}

export async function fetchTextWithTimeout(url: string, timeoutMs: number, headers?: Record<string, string>) {
  return await fetchTextRaw({ url, timeoutMs, method: 'GET', headers })
}

export async function fetchJsonWithTimeout<T>(url: string, timeoutMs: number, headers?: Record<string, string>) {
  const raw = await fetchTextRaw({ url, timeoutMs, method: 'GET', headers })
  try {
    return JSON.parse(raw) as T
  } catch {
    throw new Error('JSON parse falhou')
  }
}

export async function fetchJsonPostWithTimeout<T>(
  url: string,
  timeoutMs: number,
  body: unknown,
  headers?: Record<string, string>,
) {
  const raw = await fetchTextRaw({
    url,
    timeoutMs,
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: JSON.stringify(body),
  })
  try {
    return JSON.parse(raw) as T
  } catch {
    throw new Error('JSON parse falhou')
  }
}
