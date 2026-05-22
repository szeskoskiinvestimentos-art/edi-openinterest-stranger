import type { CsvRow } from '../types.js'
import { classifyAssetRules } from './classify/rules.js'

export function classifyAsset(row: CsvRow): { category: string; tags: string[] } {
  return classifyAssetRules(row)
}
