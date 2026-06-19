export type ControleDeDadosSnapshot = {
  generated_at: string
  root_dir: string
  state: {
    last_cotacoes_finished_iso?: string | null
    last_cotacoes_log_path?: string | null
    last_cotacoes_git_status?: string | null
    last_publish_unified?: { ok?: boolean; swapped?: boolean; fallback_in_place?: boolean; error?: string | null } | null
    last_options_exit_code?: number | null
    last_options_git_status?: string | null
    last_options_wdo_last_updated?: string | null
    last_options_win_last_updated?: string | null
  }
  cotacoes?: {
    market_status?: unknown
    last_log_hint?: string | null
    log_tail?: string[] | null
    data_files?: {
      base_dir?: string | null
      dir?: string | null
      newest_mtime?: number | null
      newest_mtime_fmt?: string | null
      files?: Array<{
        name: string
        path: string
        exists: boolean
        size?: number | null
        mtime?: number | null
        mtime_fmt?: string | null
      }>
    } | null
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
    last_log_hint?: string | null
    wdo_expected_contracts?: string[]
    csv_dolar?: {
      dir?: string | null
      files_total?: number | null
      latest_by_prefix?: Record<string, { name: string; size?: number | null; mtime?: number | null; mtime_fmt?: string | null }>
      missing_prefixes?: string[]
    } | null
    csv_indice?: {
      dir?: string | null
      files_total?: number | null
      files_recent?: Array<{ name: string; path: string; size?: number | null; mtime?: number | null; mtime_fmt?: string | null }>
    } | null
    dashboard_unificado?: {
      wdo_last_updated?: string | null
      win_last_updated?: string | null
      wdo_volume_total?: number | null
      win_volume_total?: number | null
      wdo_open_interest_total?: number | null
      win_open_interest_total?: number | null
    }
  }
  logs?: {
    options_recent?: Array<{ name: string; path: string; mtime?: number | null; mtime_fmt?: string | null }>
    cotacoes_recent?: Array<{ name: string; path: string; mtime?: number | null; mtime_fmt?: string | null }>
  } | null
  market_quotes?: { path?: string | null; mtime?: number | null; mtime_fmt?: string | null; meta?: any } | null
  yahoo_audit?: {
    path?: string | null
    mtime?: number | null
    mtime_fmt?: string | null
    generatedAt?: string | null
    missing?: any[]
    compareCritical?: any[]
    compareTop?: any[]
  } | null
  zq_curve?: {
    exists?: boolean
    path?: string | null
    mtime?: number | null
    mtime_fmt?: string | null
    contractCount?: number | null
    slopePct?: number | null
    riskMode?: string | null
    items?: any[]
  } | null
  foreign_flow?: {
    exists?: boolean
    path?: string | null
    mtime?: number | null
    mtime_fmt?: string | null
    generatedAt?: string | null
    provider?: string | null
    source?: any
    latest?: any
  } | null
  tradingview?: {
    exists?: boolean
    path?: string | null
    mtime?: number | null
    mtime_fmt?: string | null
    last_collected_at_utc?: string | null
    last_slot_iso?: string | null
    wdo_spot?: number | null
    win_scaling_index_ref_close?: number | null
    win_scaling_ewz_ref_close?: number | null
  } | null
  sina?: { present?: boolean; last?: any } | null
}

export type LogSignal = { status: 'ok' | 'fail' | 'skip' | 'warn' | 'unknown'; detail?: string | null }
