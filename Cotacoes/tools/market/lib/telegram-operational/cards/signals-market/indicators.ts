import type { CardsMarketAccess } from '../signals-types.js'

export function computeBrazilRatesAndRisk(params: { access: CardsMarketAccess }) {
  const { pull } = params.access

  const diShort = pull(['DI1F27', 'DI1N27', 'DI1F26', 'DI1F25', 'DDIc5', 'DDIc6'])
  const diLong = pull(['DI1F35', 'DI1F33', 'DI1F32', 'DI1F31', 'DDIc6'])
  const diShape =
    diShort.a !== 'n/d' && diLong.a !== 'n/d'
      ? diShort.a === '↑' && diLong.a === '↓'
        ? 'FLATTEN'
        : diShort.a === '↓' && diLong.a === '↑'
          ? 'STEEPEN'
          : '≈'
      : 'n/d'

  const brRisk = pull(['BRGV5YUSAC=R'])
  const vxewz = pull(['.VXEWZ'])

  return { diShort, diLong, diShape, brRisk, vxewz }
}

export function computeGlobalMoves(params: { access: CardsMarketAccess }) {
  const { sym, symRx, pullKey } = params.access

  const vixKey = sym(['VIX', '.VIX', '.VIX9D']) || symRx([/\bVIX\b/i, /\bVolatility\b/i, /\bVolatilidade\b/i])
  const vixMove = pullKey(vixKey)
  const vixA = vixMove.a

  const dxyKey = sym(['.DXY', 'DXY', 'DX']) || symRx([/\bIndi[cç]e D[oó]lar\b/i, /\bUS Dollar Index\b/i])
  const dxyMove = pullKey(dxyKey)
  const dxyA = dxyMove.a

  const us10yKey =
    sym(['US10YT=RR', 'TNc2=']) ||
    symRx([/\bUnited States 10-Year\b/i, /\bEUA\b\s+a\s+10\s+anos\b/i, /\bEstados Unidos\b.*\b10\b.*anos\b/i])
  const us10y = pullKey(us10yKey)
  const us10yA = us10y.a

  const chinaA50Key = sym(['CHINA50']) || symRx([/\bChina A50\b/i])
  const chinaA50 = pullKey(chinaA50Key)
  const chinaA50A = chinaA50.a

  const oreKey = sym(['TIOc1', 'SM58Fc1']) || symRx([/\bmin[eé]rio\b/i, /\biron ore\b/i])
  const ore = pullKey(oreKey)
  const oreA = ore.a

  const dalianOreKey = sym(['DCE_I0'])
  const dalianOre = pullKey(dalianOreKey)
  const dalianOreA = dalianOre.a

  const brentKey = sym(['LCO', 'BRN']) || symRx([/\bbrent\b/i])
  const brent = pullKey(brentKey)
  const brentA = brent.a

  const copperKey = sym(['HG']) || symRx([/\bcobre\b/i, /\bcopper\b/i])
  const copper = pullKey(copperKey)
  const copperA = copper.a

  const sojaKey = sym(['ZS']) || symRx([/\bsoja\b/i, /\bsoy\b/i])
  const soja = pullKey(sojaKey)
  const sojaA = soja.a

  return {
    vixMove,
    vixA,
    dxyMove,
    dxyA,
    us10y,
    us10yA,
    chinaA50,
    chinaA50A,
    ore,
    oreA,
    dalianOre,
    dalianOreA,
    brent,
    brentA,
    copper,
    copperA,
    soja,
    sojaA,
  }
}
