import type { WebNewsItem } from './types.js'
import { hostnameOf } from './text.js'

export function classifyWebNewsItem(rawTitle: string, url: string) {
  const t = String(rawTitle || '').toLowerCase()

  const isBrazil = /\bbrazil\b|\bbrasil\b|\blula\b|\bhaddad\b|\bcongress\b|\bcongresso\b|\bfiscal\b|\bcopom\b|\bbcb\b|\bbanco central\b/.test(t)
  const isCommod =
    /\boil\b|\bbrent\b|\bwti\b|\bgas\b|\bopec\b|\biron ore\b|\bmin[eé]rio\b|\bsteel\b|\bsoy\b|\bsoybean\b|\bmilho\b|\bcorn\b|\bcaf[eé]\b|\bcoffee\b|\ba[cç][uú]car\b|\bsugar\b/.test(
      t,
    )

  const bucket: WebNewsItem['bucket'] = isBrazil ? 'BRASIL' : isCommod ? 'COMMODITIES' : 'GLOBAL'

  const driver =
    /\bfed\b|\bpowell\b|\binflation\b|\bcpi\b|\bppi\b|\btreasury\b|\byield\b|\brates?\b|\bjobs\b|\bnfp\b/.test(t)
      ? 'Juros EUA'
      : /\bdollar\b|\bdxy\b|\busd\b|\bgreenback\b/.test(t)
        ? 'Dólar'
        : /\bcredit\b|\bspread\b|\bdefaults?\b|\bbank\b|\bliquidity\b|\bstress\b/.test(t)
          ? 'Crédito/Stress'
          : /\bopec\b|\boil\b|\bbrent\b|\bwti\b|\bgas\b/.test(t)
            ? 'Energia'
            : /\biron ore\b|\bsteel\b|\bchina\b|\bproperty\b|\bdeveloper\b|\bp(b|)oc\b/.test(t)
              ? 'China/Minério'
              : /\bsoy\b|\bsoybean\b|\bcorn\b|\bmilho\b|\bcoffee\b|\bcaf[eé]\b|\bsugar\b|\ba[cç][uú]car\b/.test(t)
                ? 'Agro'
                : isBrazil
                  ? 'Brasil (Fiscal/BC)'
                  : /\bwar\b|\bsanctions\b|\bgeopolitics\b|\btariffs?\b|\belection\b/.test(t)
                    ? 'Geopolítica'
                    : 'Macro (Outros)'

  const hawkish = /\bhawkish\b|\bsticky inflation\b|\bhigher for longer\b|\brate hikes?\b|\binflation rises\b|\byields? rise\b/.test(t)
  const dovish = /\bdovish\b|\brates? cuts?\b|\binflation cools\b|\byields? fall\b/.test(t)
  const riskOff = /\brisk[- ]off\b|\bstress\b|\brecession\b|\bsell[- ]off\b|\bpanic\b/.test(t)
  const riskOn = /\brisk[- ]on\b|\brally\b|\bsoft landing\b|\brelief\b/.test(t)
  const brFiscalBad = /\bfiscal\b|\bdebt\b|\bdeficit\b|\bspending\b|\brisk\b/.test(t) && isBrazil
  const brFiscalGood = /\breform\b|\bapproval\b|\bconvergence\b/.test(t) && isBrazil
  const chinaBad = /\bchina\b/.test(t) && (/\bslump\b|\bweak\b|\bcrisis\b|\bproperty\b|\bdefaults?\b/.test(t) || /\bdown\b|\bfall\b/.test(t))
  const chinaGood = /\bchina\b/.test(t) && (/\bstimulus\b|\brebound\b|\bstrong\b|\bup\b|\brise\b/.test(t))

  let wdo: WebNewsItem['impact']['wdo'] = '≈'
  let win: WebNewsItem['impact']['win'] = '≈'

  if (riskOff || hawkish) {
    wdo = '↑'
    win = '↓'
  } else if (riskOn || dovish) {
    wdo = '↓'
    win = '↑'
  }
  if (brFiscalBad) {
    wdo = '↑'
    win = '↓'
  } else if (brFiscalGood) {
    wdo = '↓'
    win = win === '↓' ? '≈' : '↑'
  }
  if (chinaBad) {
    wdo = '↑'
    win = win === '↑' ? '≈' : '↓'
  } else if (chinaGood) {
    wdo = '↓'
    win = win === '↓' ? '≈' : '↑'
  }

  const confidence: WebNewsItem['confidence'] = hostnameOf(url) && rawTitle && rawTitle.length >= 18 ? 'média' : 'baixa'

  return { bucket, driver, impact: { wdo, win }, confidence }
}
