export async function sendTelegramPhotos(params: {
  botToken: string
  chatId: string
  messageThreadId?: number | null
  items: Array<{ filename: string; caption: string; png: Buffer }>
}) {
  if (!params.botToken) return { ok: false as const, error: 'missing_bot_token' }
  if (!params.chatId) return { ok: false as const, error: 'missing_chat_id' }

  const out: Array<{ filename: string; ok: boolean; messageId?: number; error?: string }> = []
  for (const it of params.items) {
    const url = `https://api.telegram.org/bot${params.botToken}/sendPhoto`
    const form = new FormData()
    form.append('chat_id', params.chatId)
    if (typeof params.messageThreadId === 'number' && Number.isFinite(params.messageThreadId)) {
      form.append('message_thread_id', String(params.messageThreadId))
    }
    form.append('caption', it.caption)
    const photoBytes = new Uint8Array(it.png)
    form.append('photo', new Blob([photoBytes], { type: 'image/png' }), it.filename)
    try {
      const r = await fetch(url, { method: 'POST', body: form })
      const j = (await r.json()) as { ok?: boolean; result?: { message_id?: number }; description?: string }
      if (!j || !j.ok) {
        out.push({ filename: it.filename, ok: false, error: j && j.description ? String(j.description) : 'telegram_error' })
        continue
      }
      out.push({
        filename: it.filename,
        ok: true,
        messageId: j.result && typeof j.result.message_id === 'number' ? j.result.message_id : undefined,
      })
    } catch (e) {
      out.push({ filename: it.filename, ok: false, error: String(e instanceof Error ? e.message : e) })
    }
  }
  const okCount = out.filter(x => x.ok).length
  if (okCount === 0) {
    const firstError = out.find(x => !x.ok && x.error)?.error
    return { ok: false as const, error: firstError ? String(firstError) : 'telegram_send_failed', results: out }
  }
  return { ok: true as const, results: out }
}

function escapeTelegramHtml(s: string) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function trimTelegramText(s: string, maxLen = 3800) {
  const t = String(s || '').trim()
  if (!t) return ''
  if (t.length <= maxLen) return t
  return `${t.slice(0, Math.max(0, maxLen - 1)).trim()}…`
}

export async function sendTelegramMessages(params: {
  botToken: string
  chatId: string
  messageThreadId?: number | null
  items: Array<{ text: string; disablePreview?: boolean }>
}) {
  if (!params.botToken) return { ok: false as const, error: 'missing_bot_token' }
  if (!params.chatId) return { ok: false as const, error: 'missing_chat_id' }

  const out: Array<{ ok: boolean; messageId?: number; error?: string }> = []
  for (const it of params.items) {
    const url = `https://api.telegram.org/bot${params.botToken}/sendMessage`
    const body: Record<string, unknown> = {
      chat_id: params.chatId,
      text: escapeTelegramHtml(trimTelegramText(it.text)),
      parse_mode: 'HTML',
      disable_web_page_preview: it.disablePreview !== false,
    }
    if (typeof params.messageThreadId === 'number' && Number.isFinite(params.messageThreadId)) {
      body.message_thread_id = params.messageThreadId
    }
    try {
      const doSend = async () => {
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const j = (await r.json()) as {
          ok?: boolean
          result?: { message_id?: number }
          description?: string
          parameters?: { retry_after?: number }
        }
        return { r, j }
      }

      const first = await doSend()
      if (first.r.status === 429) {
        const retryAfter =
          first.j && first.j.parameters && typeof first.j.parameters.retry_after === 'number' ? first.j.parameters.retry_after : null
        const waitMs = retryAfter !== null && Number.isFinite(retryAfter) ? Math.max(250, Math.floor(retryAfter * 1000)) : 1500
        await new Promise(resolve => setTimeout(resolve, Math.min(20000, waitMs)))
        const second = await doSend()
        if (!second.j || !second.j.ok) {
          out.push({ ok: false, error: second.j && second.j.description ? String(second.j.description) : 'telegram_error' })
          continue
        }
        out.push({
          ok: true,
          messageId: second.j.result && typeof second.j.result.message_id === 'number' ? second.j.result.message_id : undefined,
        })
        continue
      }

      const j = first.j
      if (!j || !j.ok) {
        out.push({ ok: false, error: j && j.description ? String(j.description) : 'telegram_error' })
        continue
      }
      out.push({ ok: true, messageId: j.result && typeof j.result.message_id === 'number' ? j.result.message_id : undefined })
    } catch (e) {
      out.push({ ok: false, error: String(e instanceof Error ? e.message : e) })
    }
  }
  const okCount = out.filter(x => x.ok).length
  if (okCount === 0) {
    const firstError = out.find(x => !x.ok && x.error)?.error
    return { ok: false as const, error: firstError ? String(firstError) : 'telegram_send_failed', results: out }
  }
  return { ok: true as const, results: out }
}
