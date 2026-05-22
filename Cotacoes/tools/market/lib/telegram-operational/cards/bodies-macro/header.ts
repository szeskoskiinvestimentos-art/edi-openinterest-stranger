import { htmlShell } from '../../html.js'

export function macroShell(params: { title: string; subtitle: string; bodyHtml: string; height?: number }) {
  return htmlShell(params.title, params.subtitle, params.bodyHtml, params.height)
}
