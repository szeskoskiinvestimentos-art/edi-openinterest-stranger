# market_run_force.ps1 - Executa orquestrador com output em tempo real + log
# Retorna exit code do orquestrador
param(
    [string]$ProjectRoot = "C:\Projetos_Hermes\Edi_Market_Guardian_V0",
    [string]$LogFile = "",
    [string]$PyCmd = "py -3.13"
)

# Remover aspas extras se houver (cmd as vezes injeta)
$ProjectRoot = $ProjectRoot.Trim('"', "'", ' ')
$LogFile = $LogFile.Trim('"', "'", ' ')
$PyCmd = $PyCmd.Trim('"', "'", ' ')

if (-not $LogFile) {
    $ts = Get-Date -Format 'yyyyMMdd_HHmmss'
    $LogFile = Join-Path $ProjectRoot "runtime\logs\force_${ts}.log"
}

# Remover trailing slash/backslash
$ProjectRoot = $ProjectRoot.TrimEnd('\', '/')

Set-Location $ProjectRoot

# Run orquestrador
# Importante: usar [Console]::OutputEncoding para evitar UnicodeDecodeError
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = 'utf-8'

# Capturar output como bytes e decodificar manualmente
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "cmd.exe"
$psi.Arguments = "/c `"$PyCmd` scripts\orquestrador.py --force --no-pause"
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true
$psi.WorkingDirectory = $ProjectRoot

$proc = [System.Diagnostics.Process]::Start($psi)
$stdout = $proc.StandardOutput.ReadToEnd()
$stderr = $proc.StandardError.ReadToEnd()
$proc.WaitForExit()
$ec = $proc.ExitCode

# Escrever output (stdout + stderr) em arquivo e console
# Substituir encoding problematico
$safeStdout = $stdout -replace '[^\x00-\x7F]', '?'
$safeStderr = $stderr -replace '[^\x00-\x7F]', '?'

# Tee para log
"EXIT CODE: $ec" | Out-File -FilePath $LogFile -Encoding UTF8
"=== STDOUT ===" | Out-File -FilePath $LogFile -Append -Encoding UTF8
$safeStdout | Out-File -FilePath $LogFile -Append -Encoding UTF8
"=== STDERR ===" | Out-File -FilePath $LogFile -Append -Encoding UTF8
$safeStderr | Out-File -FilePath $LogFile -Append -Encoding UTF8

# Output para console
Write-Output $safeStdout
if ($safeStderr) {
    Write-Output "=== STDERR ==="
    Write-Output $safeStderr
}
Write-Output "=== EXIT CODE: $ec ==="

exit $ec
