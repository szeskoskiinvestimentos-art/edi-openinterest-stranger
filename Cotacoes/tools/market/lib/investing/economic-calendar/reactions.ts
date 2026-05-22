export function impactFromImportance(n: number): 'ALTO' | 'MÉDIO' | 'BAIXO' {
  if (n >= 3) return 'ALTO'
  if (n === 2) return 'MÉDIO'
  return 'BAIXO'
}

export function buildMacroReactions(currency: string, eventName: string) {
  const cur = String(currency || '').toUpperCase()
  const name = String(eventName || '').toLowerCase()

  const isInflation = /\b(ipca|cpi|pce|ppi|infla)\b/i.test(name)
  const isRates = /\b(copom|selic|rate decision|decis[aã]o de juros|banco central|fed|fomc)\b/i.test(name)
  const isJobs = /\b(payroll|desemprego|jobless|employment|seguro-?desemprego)\b/i.test(name)
  const isActivity = /\b(pib|gdp|pmi|industrial|produ[cç][aã]o|vendas|retail|housing|constru[cç][aã]o)\b/i.test(name)
  const isChina = /\bchina\b/i.test(name) || cur === 'CNY' || cur === 'CNH' || cur === 'HKD'

  const wdoTemplate = (upLabel: string, downLabel: string) => `Se ${upLabel}: ↑ | Se ${downLabel}: ↓`
  const winTemplate = (upLabel: string, downLabel: string) => `Se ${upLabel}: ↓ | Se ${downLabel}: ↑`

  if (isChina) {
    return {
      wdo: wdoTemplate('forte', 'fraco'),
      win: `Se forte: ↑ | Se fraco: ↓`,
    }
  }

  if (cur === 'BRL') {
    if (isInflation || isRates) {
      return {
        wdo: wdoTemplate('acima do consenso', 'abaixo do consenso'),
        win: winTemplate('acima do consenso', 'abaixo do consenso'),
      }
    }
    if (isActivity) {
      return {
        wdo: `Se fraco: ↑ | Se forte: ↓`,
        win: `Se forte: ↑ | Se fraco: ↓`,
      }
    }
    return {
      wdo: wdoTemplate('pior que o esperado', 'melhor que o esperado'),
      win: `Se melhor: ↑ | Se pior: ↓`,
    }
  }

  if (cur === 'USD') {
    if (isInflation || isRates || isJobs || isActivity) {
      return {
        wdo: wdoTemplate('forte/hawkish', 'fraco/dovish'),
        win: `Se forte/hawkish: ↓ | Se fraco/dovish: ↑`,
      }
    }
    return {
      wdo: wdoTemplate('surpresa positiva (USD forte)', 'surpresa negativa (USD fraco)'),
      win: `Se USD forte: ↓ | Se USD fraco: ↑`,
    }
  }

  if (isInflation || isRates || isJobs || isActivity) {
    return {
      wdo: wdoTemplate('forte', 'fraco'),
      win: `Se forte: ↓ | Se fraco: ↑`,
    }
  }

  return {
    wdo: wdoTemplate('surpresa positiva', 'surpresa negativa'),
    win: `Se positivo: ↓ | Se negativo: ↑`,
  }
}

