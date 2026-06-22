# market_run_force.ps1 - Executa orquestrador com output em tempo real + log
# Retorna exit code do orquestrador
param(
    [string]$ProjectRoot = "C:\Projetos_Hermes\Edi_Market_Guardian_V0",
    [string]$LogFile = "",
    [string]$PyCmd = "py -3.13"
)
if (-not $LogFile) {
    $ts = Get-Date -Format 'yyyyMMdd_HHmmss'
    $LogFile = Join-Path $ProjectRoot "runtime\logs\force_${ts}.log"
}

Set-Location $ProjectRoot

# Run orquestrador and tee to log
$output = cmd /c "$PyCmd scripts\orquestrador.py --force --no-pause" 2>&1
$ec = $LASTEXITCODE
$output | Tee-Object -FilePath $LogFile | Out-Host
exit $ec
