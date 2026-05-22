export type ControleDeDadosSnapshot = {
  generated_at: string
  root_dir: string
  state: {
    last_cotacoes_finished_iso?: string | null
    last_cotacoes_log_path?: string | null
    last_cotacoes_git_status?: string | null
    last_options_wdo_last_updated?: string | null
    last_options_win_last_updated?: string | null
  }
  cotacoes?: {
    market_status?: unknown
    last_log_hint?: string | null
    log_tail?: string[] | null
    downloads?: {
      yahoo?: { status: 'ok' | 'fail' | 'skip' | 'warn' | 'unknown'; detail?: string | null }
      portfolio?: { status: 'ok' | 'fail' | 'skip' | 'warn' | 'unknown'; detail?: string | null }
      di?: { status: 'ok' | 'fail' | 'skip' | 'warn' | 'unknown'; detail?: string | null }
      calendar?: { status: 'ok' | 'fail' | 'skip' | 'warn' | 'unknown'; detail?: string | null }
      pdf?: { status: 'ok' | 'fail' | 'skip' | 'warn' | 'unknown'; detail?: string | null }
      tradingview?: { status: 'ok' | 'fail' | 'skip' | 'warn' | 'unknown'; detail?: string | null }
      git_sync?: { status: 'ok' | 'fail' | 'skip' | 'warn' | 'unknown'; detail?: string | null }
    } | null
  }
  options?: {
    dashboard_unificado?: {
      wdo_last_updated?: string | null
      win_last_updated?: string | null
      wdo_volume_total?: number | null
      win_volume_total?: number | null
      wdo_open_interest_total?: number | null
      win_open_interest_total?: number | null
    }
  }
}

export type LogSignal = { status: 'ok' | 'fail' | 'skip' | 'warn' | 'unknown'; detail?: string | null }
