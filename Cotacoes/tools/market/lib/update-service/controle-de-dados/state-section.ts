export function buildState(params: {
  logPath: string | null
  gitSyncStatus: string | null
  publish: { ok: boolean | null; error: string | null }
  optionsExitCode: number | null
  wdoLastUpdated: string | null
  winLastUpdated: string | null
}) {
  return {
    last_cotacoes_finished_iso: null as string | null,
    last_cotacoes_log_path: params.logPath,
    last_cotacoes_git_status: params.gitSyncStatus,
    last_publish_unified: params.publish.ok === null ? null : { ok: params.publish.ok, error: params.publish.error },
    last_options_exit_code: params.optionsExitCode,
    last_options_git_status: null as string | null,
    last_options_wdo_last_updated: params.wdoLastUpdated,
    last_options_win_last_updated: params.winLastUpdated,
  }
}
