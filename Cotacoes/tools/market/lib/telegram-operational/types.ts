export type TelegramCardKey = 'macro_a' | 'macro_b' | 'panel' | 'deep_dive' | 'mercosul_fx'

export type TelegramCard = {
  key: TelegramCardKey
  filename: string
  caption: string
  html: string
}
