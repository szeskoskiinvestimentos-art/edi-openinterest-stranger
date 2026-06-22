# market_status_check.ps1 - Verifica se modulos estao habilitados
# Retorna exit 2 se portfolio/di/calendar desabilitados, 0 se OK, 1 se DOWN
param(
    [string]$Url = "http://127.0.0.1:3433/api/market/status"
)
try {
    $r = Invoke-RestMethod -Method Get -Uri $Url -TimeoutSec 2
    $s = $null
    if ($r -and $r.state -and $r.state.last -and $r.state.last.summary) {
        $s = $r.state.last.summary
    }
    if ($s) {
        if (($s.portfolio -and $s.portfolio.enabled -eq $false) -or
            ($s.di -and $s.di.enabled -eq $false) -or
            ($s.calendar -and $s.calendar.enabled -eq $false)) {
            exit 2
        }
    }
    exit 0
} catch {
    exit 0
}
