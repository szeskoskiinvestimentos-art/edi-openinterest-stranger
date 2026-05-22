export type PetrobrasModuleRow = {
  key: string
  label: string
  phase: 'pre' | 'regular' | 'any'
  symbol: string | null
  asOf: string | null
  value: number | null
  unit: '%' | 'score'
  capAbs: number
  weight: number
  contribution: number | null
  note: string
}

export type PetrobrasNewsTilt = {
  used: boolean
  matched: number
  score: number
  top: Array<{ title: string; url: string }>
}

