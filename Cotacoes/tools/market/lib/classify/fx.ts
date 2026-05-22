export function isEmergingCurrency(ccy: string) {
  const em = new Set([
    'BRL',
    'MXN',
    'ZAR',
    'TRY',
    'RUB',
    'INR',
    'IDR',
    'CLP',
    'COP',
    'PEN',
    'ARS',
    'UYU',
    'PYG',
    'BOB',
    'CNY',
    'CNH',
    'KRW',
    'TWD',
    'THB',
    'MYR',
    'PHP',
    'HUF',
    'PLN',
    'CZK',
  ])
  return em.has(ccy.toUpperCase())
}

