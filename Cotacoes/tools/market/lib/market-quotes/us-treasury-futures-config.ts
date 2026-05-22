export const DEFAULT_US_TSY_FUTURES_ROOTS = 'ZT=F,ZF=F,ZN=F,ZB=F,UB=F'

export const DEFAULT_US_TSY_FUTURES_EXTRAS =
  '^IRX,^FVX,^TNX,^TYX,SHY,IEI,IEF,TLH,TLT,SPTL,GOVT,VGSH,VGIT,VGLT,BIL,SGOV,TBIL,SHV,USFR,TFLO,FLOT,TIP,SCHP,VTIP,STIP,LTPZ,LQD,HYG,JNK,SHYG,IGSB'

export const tenorByRoot: Record<string, string> = {
  'ZT=F': '2Y',
  'ZF=F': '5Y',
  'ZN=F': '10Y',
  'ZB=F': '30Y',
  'UB=F': 'ULTRA',
}

export const extraLabelBySymbol: Record<string, string> = {
  '^IRX': 'T-Bill 13W (yield)',
  '^FVX': 'US 5Y (yield)',
  '^TNX': 'US 10Y (yield)',
  '^TYX': 'US 30Y (yield)',
  SHY: 'SHY (1–3Y ETF)',
  IEI: 'IEI (3–7Y ETF)',
  IEF: 'IEF (7–10Y ETF)',
  TLH: 'TLH (10–20Y ETF)',
  TLT: 'TLT (20Y+ ETF)',
  SPTL: 'SPTL (Long Treasury ETF)',
  GOVT: 'GOVT (US Treasury ETF)',
  VGSH: 'VGSH (Short Treasury ETF)',
  VGIT: 'VGIT (Interm Treasury ETF)',
  VGLT: 'VGLT (Long Treasury ETF)',
  BIL: 'BIL (1–3M T-Bill ETF)',
  SGOV: 'SGOV (0–3M T-Bill ETF)',
  TBIL: 'TBIL (T-Bill ETF)',
  SHV: 'SHV (Short T-Bill ETF)',
  USFR: 'USFR (Floating Rate Treasury ETF)',
  TFLO: 'TFLO (Floating Rate Treasury ETF)',
  FLOT: 'FLOT (Floating Rate Notes ETF)',
  TIP: 'TIP (TIPS ETF)',
  SCHP: 'SCHP (TIPS ETF)',
  VTIP: 'VTIP (Short TIPS ETF)',
  STIP: 'STIP (0–5Y TIPS ETF)',
  LTPZ: 'LTPZ (Long TIPS ETF)',
  LQD: 'LQD (Crédito IG ETF)',
  HYG: 'HYG (Crédito HY ETF)',
  JNK: 'JNK (Crédito HY ETF)',
  SHYG: 'SHYG (Crédito HY curto ETF)',
  IGSB: 'IGSB (Crédito IG curto ETF)',
}

