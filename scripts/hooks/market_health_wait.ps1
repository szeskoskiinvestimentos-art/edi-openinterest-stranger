# market_health_wait.ps1 - WAIT_MARKET: health check em loop ate UP
# Retorna exit 0 se OK antes do deadline, 1 se timeout
param(
    [string]$Url = "http://127.0.0.1:3433/api/market/health",
    [int]$TimeoutSec = 120,
    [int]$PollIntervalSec = 1
)
$deadline = (Get-Date).AddSeconds($TimeoutSec)
$waited = 0
while ((Get-Date) -lt $deadline) {
    try {
        $r = Invoke-RestMethod -Method Get -Uri $Url -TimeoutSec 2
        if ($r -and $r.ok -eq $true) {
            exit 0
        }
    } catch {}
    Start-Sleep -Seconds $PollIntervalSec
    $waited++
    if ($waited % 5 -eq 0) { [Console]::Write('.') }
}
exit 1
