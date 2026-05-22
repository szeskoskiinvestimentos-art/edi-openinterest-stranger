import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { escapeHtml } from '../html.js'
import { readTextPrefer } from '../io.js'
import { extractChinaKeyIndicators, extractEtToBrtHint, extractNumberedLines, extractTableConflitos } from '../text-extract.js'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..', '..', '..')

export async function buildIdeasSupplementHtml() {
  const ideasDir = path.resolve(PROJECT_ROOT, 'Ideias')
  const [ideasBr, ideasUs, ideasCn] = await Promise.all([
    readTextPrefer([path.join(ideasDir, 'Relatorios Brasil (padrao).txt'), path.join(ideasDir, 'Relatorios Brasil.txt')]),
    readTextPrefer([path.join(ideasDir, 'Relatorios USA (padrao).txt'), path.join(ideasDir, 'Relatorios USA.txt')]),
    readTextPrefer([path.join(ideasDir, 'Relatorios CNY (padrao).txt'), path.join(ideasDir, 'Relatorios CNY,txt')]),
  ])

  const brAgendaPadrao = extractNumberedLines(ideasBr, /^##\s*AGENDA \(ALTA FREQUÊNCIA\)/i, 5)
  const brAgenda = brAgendaPadrao.length ? brAgendaPadrao : extractNumberedLines(ideasBr, /^###\s*Resumo dos mais/i, 5)
  const usEtBrt = extractEtToBrtHint(ideasUs)
  const usMatrix = extractTableConflitos(ideasUs, 4)
  const cnKeyPadrao = extractNumberedLines(ideasCn, /^##\s*GATILHOS-CHAVE\b/i, 8)
  const cnKey = cnKeyPadrao.length ? cnKeyPadrao : extractChinaKeyIndicators(ideasCn, 6)

  return brAgenda.length || usEtBrt || usMatrix.length || cnKey.length
    ? `<div class="grid">
        <div class="box">
          <div class="h">SE–ENTÃO — referências (não é agenda do dia)</div>
          <div class="cols">
            <div class="box">
              <div class="h" style="margin:0 0 8px 0;">Brasil (alta frequência)</div>
              <ul class="list small">${brAgenda.length ? brAgenda.map(x => `<li><span class="muted">${escapeHtml(x)}</span></li>`).join('') : '<li><span class="muted">n/d</span></li>'}</ul>
            </div>
            <div class="box">
              <div class="h" style="margin:0 0 8px 0;">EUA (macro)</div>
              <div class="small muted" style="margin-bottom:8px;">${escapeHtml(usEtBrt || 'ET→BRT n/d')}</div>
              <ul class="list small">${usMatrix.length ? usMatrix.map(x => `<li><span class="muted">${escapeHtml(x)}</span></li>`).join('') : '<li><span class="muted">Matriz n/d</span></li>'}</ul>
            </div>
          </div>
        </div>
        <div class="box">
          <div class="h">China/HK (principais gatilhos)</div>
          <ul class="list small">${cnKey.length ? cnKey.map(x => `<li><span class="muted">${escapeHtml(x)}</span></li>`).join('') : '<li><span class="muted">n/d</span></li>'}</ul>
        </div>
      </div>`
    : ''
}
