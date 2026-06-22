# market_get_pid.ps1 - Retorna PID do servico na porta (vazio se nada)
# Output: PID em stdout
param(
    [int]$Port = 3433
)
try {
    $p = (Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess
    if ($p) { Write-Output $p }
} catch {}
exit 0
