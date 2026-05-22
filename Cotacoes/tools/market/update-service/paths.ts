import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
export const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..', '..', '..')
export const WORKSPACE_ROOT = path.resolve(PROJECT_ROOT, '..')

export function resolveFromProject(p: string) {
  return path.isAbsolute(p) ? p : path.resolve(PROJECT_ROOT, p)
}

export function resolveFromBase(baseDir: string, p: string) {
  return path.isAbsolute(p) ? p : path.resolve(baseDir, p)
}

export function resolveFromWorkspace(p: string) {
  return path.isAbsolute(p) ? p : path.resolve(WORKSPACE_ROOT, p)
}

export function isOneDrivePath(p: string) {
  const s = path.resolve(String(p || ''))
  return /\\OneDrive(\\|$)/i.test(s) || /\/OneDrive(\/|$)/i.test(s)
}

export function isPathInside(baseDir: string, targetPath: string) {
  const base = path.resolve(baseDir)
  const target = path.resolve(targetPath)
  const normBase = process.platform === 'win32' ? base.toLowerCase() : base
  const normTarget = process.platform === 'win32' ? target.toLowerCase() : target
  const baseWithSep = normBase.endsWith(path.sep) ? normBase : normBase + path.sep
  return normTarget === normBase || normTarget.startsWith(baseWithSep)
}

export function requireInsideWorkspace(label: string, p: string) {
  const abs = path.resolve(p)
  if (isOneDrivePath(abs)) {
    throw new Error(`${label}_blocked_onedrive:${abs}`)
  }
  if (!isPathInside(WORKSPACE_ROOT, abs)) {
    throw new Error(`${label}_outside_workspace_root:${abs}`)
  }
  return abs
}

export function defaultAutomationDir() {
  return path.resolve(PROJECT_ROOT, '.edi-market-guardin')
}

