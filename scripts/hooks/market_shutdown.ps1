# market_shutdown.ps1 - Shutdown graceful do market:service
# Retorna exit 0 sempre
param(
    [string]$Url = "http://127.0.0.1:3433/api/market/shutdown",
    [int]$WaitSec = 12
)
# Try graceful shutdown via API
try {
    Invoke-RestMethod -Method Post -Uri $Url -TimeoutSec 3 | Out-Null
} catch {}

# Wait for port to free
$deadline = (Get-Date).AddSeconds($WaitSec)
while ((Get-Date) -lt $deadline) {
    try {
        $x = Get-NetTCPConnection -State Listen -LocalPort 3433 -ErrorAction SilentlyContinue | Select-Object -First 1
        if (-not $x) { exit 0 }
    } catch {}
    Start-Sleep -Seconds 1
}
exit 0
