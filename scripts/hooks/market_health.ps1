# market_health.ps1 - Health check do market:service
# Retorna exit 0 se OK, 1 se DOWN
param(
    [string]$Url = "http://127.0.0.1:3433/api/market/health",
    [int]$TimeoutSec = 2
)
try {
    $r = Invoke-RestMethod -Method Get -Uri $Url -TimeoutSec $TimeoutSec
    if ($r -and $r.ok -eq $true) {
        exit 0
    }
    exit 1
} catch {
    exit 1
}
