import type { PetrobrasResolvedSymbols } from './symbols.js'

export function buildMissingCorrelated(s: PetrobrasResolvedSymbols) {
  const missing: Array<{ label: string; patterns: string[] }> = []
  const addMissing = (label: string, patterns: string[]) => {
    missing.push({ label, patterns })
  }

  if (!s.symPETR4 && !s.symPETR3) addMissing('PETR4 / PETR3 (B3)', ['PETR4', 'PETR3', 'PETR4.SA', 'PETR3.SA'])
  if (!s.symPBR) addMissing('PBR (ADR)', ['PBR'])
  if (!s.symPBRA) addMissing('PBRA (ADR)', ['PBRA'])
  if (!s.symBrent) addMissing('Brent', ['BRN', 'LCO', 'BZ=F', 'UKOIL', 'Brent'])
  if (!s.symWti) addMissing('WTI', ['CL=F', 'USOIL', 'WTI'])
  if (!s.symUSO) addMissing('USO (WTI ETF)', ['USO'])
  if (!s.symXLE) addMissing('XLE (Energy ETF)', ['XLE'])
  if (!s.symXOP) addMissing('XOP (E&P ETF)', ['XOP'])
  if (!s.symOIH) addMissing('OIH (Oil Services ETF)', ['OIH'])
  if (!s.symRBOB) addMissing('Gasolina / RBOB (futuros)', ['RB=F', 'RBc1', 'LRBc1', 'GPR', 'RBOB', 'Gasolina', 'Gasoline'])
  if (!s.symHO) addMissing('Diesel / ULSD / Gas Oil (futuros)', ['HO=F', 'LGOc1', 'LHOc1', 'ULSD', 'Heating Oil', 'Gas Oil', 'Gasoil', 'Diesel'])
  if (!s.symUSDBRL) addMissing('USD/BRL', ['USD/BRL'])
  if (!s.symIBOV) addMissing('Ibovespa', ['.BVSP', 'IBOV', 'Ibovespa'])
  if (!s.symIBRX) addMissing('IBRX (Índice Brasil 100)', ['.IBRX', 'IBRX', 'Índice Brasil 100', 'Indice Brasil 100'])
  if (!s.symBR20) addMissing('BR20 (Índice Brasil 20)', ['.BR20', '.BR20T', 'BR20', 'Brasil 20'])
  if (!s.symBOVA11) addMissing('BOVA11 (ETF B3)', ['BOVA11', 'BOVA11.SA'])
  if (!s.symWIN) addMissing('Mini índice (WIN / Ibovespa Futuro)', ['WIN', 'WINc1', 'Mini Ibovespa', 'Ibovespa Futuros', 'mini índice', 'mini indice'])
  if (!s.symWDO) addMissing('WDO (mini dólar)', ['WDO', 'mini dólar', 'mini dolar'])
  if (!s.symEWZ) addMissing('EWZ / EWZS (ETFs Brasil)', ['EWZ', 'EWZS', 'EWZS.O'])
  if (!s.symDXY) addMissing('DXY', ['.DXY', 'DXY'])
  if (!s.symUSDMXN) addMissing('USD/MXN', ['USD/MXN'])
  if (!s.symUSDZAR) addMissing('USD/ZAR', ['USD/ZAR'])
  if (!s.symUSDCLP) addMissing('USD/CLP', ['USD/CLP'])
  if (!s.symUSDTRY) addMissing('USD/TRY', ['USD/TRY'])
  if (!s.symBR10Y) addMissing('BR10YT=RR (Brasil 10Y)', ['BR10YT=RR'])
  if (!s.symBR2Y) addMissing('BR2YT=RR (Brasil 2Y)', ['BR2YT=RR'])
  if (!s.symUS10BR10) addMissing('US10BR10=RR (Spread BR10Y vs US10Y)', ['US10BR10=RR'])
  if (!s.symBRCDS5Y) addMissing('BRGV5YUSAC=R (Brasil CDS 5Y)', ['BRGV5YUSAC=R'])
  if (!s.symVXBR) addMissing('.VXBR (Ibovespa VIX)', ['.VXBR', 'VXBR'])
  if (!s.symVIX) addMissing('VIX (EUA)', ['VIX', '.VIX'])
  if (!s.symOVX) addMissing('OVX (Oil VIX)', ['.OVX', 'OVX'])
  if (!s.majorsPresent.length) addMissing('Majors Oil', ['XOM', 'CVX', 'SHEL', 'BP', 'TTE', 'EQNR', 'COP', 'OXY'])

  return missing
}
