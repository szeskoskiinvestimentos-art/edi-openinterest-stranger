# market_exit_watcher.ps1 - Watch parent process, shutdown service se morrer
# Roda em background, monitora PID pai, se pai morrer chama shutdown e mata o servico
param(
    [string]$ServiceHost = "127.0.0.1",
    [int]$ServicePort = 3433
)
try {
    # Get parent PID
    $parent = (Get-CimInstance Win32_Process -Filter "ProcessId=$PID").ParentProcessId
    $url = "http://${ServiceHost}:${ServicePort}/api/market/shutdown"

    # Wait while parent alive
    while (Get-Process -Id $parent -ErrorAction SilentlyContinue) {
        Start-Sleep -Seconds 1
    }

    # Parent died: shutdown
    try {
        Invoke-RestMethod -Method Post -Uri $url -TimeoutSec 3 | Out-Null
    } catch {}

    # Force kill if still listening
    try {
        $x = Get-NetTCPConnection -State Listen -LocalPort $ServicePort -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($x) {
            Stop-Process -Id $x.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    } catch {}
} catch {}
exit 0
