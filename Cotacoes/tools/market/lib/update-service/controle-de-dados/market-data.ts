import { readFile } from 'node:fs/promises'

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, { encoding: 'utf-8' })
  return JSON.parse(raw) as T
}

export async function tryReadMarketDataSummary(absJsonPath: string) {
  try {
    const raw = await readJsonFile<unknown>(absJsonPath)
    if (!raw || typeof raw !== 'object') return null
    const obj = raw as Record<string, unknown>

    const overviewRaw = obj.overview
    const overview = overviewRaw && typeof overviewRaw === 'object' ? (overviewRaw as Record<string, unknown>) : null

    const lastUpdatedRaw = obj.last_updated ?? overview?.last_update ?? obj.updatedAt
    const lastUpdated = lastUpdatedRaw !== undefined && lastUpdatedRaw !== null ? String(lastUpdatedRaw) : null

    const volumeRaw =
      overview && overview.volume_total !== undefined
        ? overview.volume_total
        : overview && overview.total_volume !== undefined
          ? overview.total_volume
          : overview && overview.total_trades !== undefined
            ? overview.total_trades
            : obj.volume_total !== undefined
              ? obj.volume_total
              : obj.total_volume !== undefined
                ? obj.total_volume
                : null

    const oiRaw =
      overview && overview.open_interest_total !== undefined
        ? overview.open_interest_total
        : overview && overview.oi_total !== undefined
          ? overview.oi_total
          : overview && overview.open_interest !== undefined
            ? overview.open_interest
            : obj.open_interest_total !== undefined
              ? obj.open_interest_total
              : null

    const volumeTotalRaw = volumeRaw !== null && volumeRaw !== undefined ? Number(volumeRaw) : null
    const oiTotalRaw = oiRaw !== null && oiRaw !== undefined ? Number(oiRaw) : null

    const volumeTotal = Number.isFinite(volumeTotalRaw ?? NaN) ? volumeTotalRaw : null
    const oiTotal = Number.isFinite(oiTotalRaw ?? NaN) ? oiTotalRaw : null
    return { lastUpdated, volumeTotal, oiTotal }
  } catch {
    return null
  }
}
