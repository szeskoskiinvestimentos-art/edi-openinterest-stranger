import { writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import type { ControleDeDadosSnapshot } from './controle-de-dados.ts'
import { fileExists } from '../io.ts'
import { spawnCapture } from './spawn.ts'

export async function writeControleDeDadosHtml(snapshot: ControleDeDadosSnapshot, baseDir: string) {
  const htmlPath = path.resolve(baseDir, 'controle_de_dados.html')
  const markerStart = '<script id="data" type="application/json">'
  const markerEnd = '</script>'
  const payload = JSON.stringify(snapshot)
  const fallbackHtml = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Controle de Dados</title></head><body><script id="data" type="application/json">${payload}</script><pre style="white-space:pre-wrap;font-family:ui-monospace,Consolas,monospace">controle_de_dados.html foi regenerado automaticamente.\nAbra o arquivo local: controle_de_dados.html</pre></body></html>`
  if (!(await fileExists(htmlPath))) {
    await writeFile(htmlPath, fallbackHtml, 'utf8')
    return true
  }
  const raw = await readFile(htmlPath, 'utf8')
  const i = raw.indexOf(markerStart)
  if (i < 0) {
    await writeFile(htmlPath, fallbackHtml, 'utf8')
    return true
  }
  const j = raw.indexOf(markerEnd, i + markerStart.length)
  if (j < 0) {
    await writeFile(htmlPath, fallbackHtml, 'utf8')
    return true
  }
  const next = raw.slice(0, i + markerStart.length) + payload + raw.slice(j)
  if (next === raw) return false
  await writeFile(htmlPath, next, 'utf8')
  return true
}

export async function injectControleDeDadosOptionsViaPython(workspaceRoot: string) {
  try {
    const pythonExe = process.platform === 'win32' ? 'py' : 'python3'
    const pythonArgs = process.platform === 'win32'
      ? ['-3', path.resolve(workspaceRoot, 'Cotacoes', 'tools', 'market', 'gerar_controle.py')]
      : [path.resolve(workspaceRoot, 'Cotacoes', 'tools', 'market', 'gerar_controle.py')]
    await spawnCapture(pythonExe, pythonArgs, { cwd: workspaceRoot, env: process.env })
  } catch {
    void 0
  }
}
