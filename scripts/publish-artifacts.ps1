param(
  [string]$Branch = $env:EDI_PUBLISH_BRANCH,
  [string]$Remote = $env:EDI_PUBLISH_REMOTE,
  [switch]$Run
)

$ErrorActionPreference = 'Stop'
try { $PSNativeCommandUseErrorActionPreference = $false } catch {}

function Run-Git([string[]]$ArgList, [switch]$AllowNonZero) {
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'SilentlyContinue'
  $out = & git @ArgList 2>&1
  $ErrorActionPreference = $prev
  $rc = $LASTEXITCODE
  $txt = ($out | ForEach-Object { [string]$_ }) -join "`n"
  if (-not $AllowNonZero -and $rc -ne 0) {
    throw ("git " + ($ArgList -join ' ') + " falhou (exitCode=$rc)`n" + $txt)
  }
  return @{ rc = $rc; out = $txt }
}

function Resolve-WorkspaceRoot {
  $here = Split-Path -Parent $PSCommandPath
  return (Resolve-Path (Join-Path $here '..')).Path
}

function Ensure-Dir([string]$p) {
  if (-not (Test-Path -LiteralPath $p)) {
    New-Item -ItemType Directory -Force -Path $p | Out-Null
  }
}

function Copy-ArtifactPath([string]$src, [string]$dst) {
  if (-not (Test-Path -LiteralPath $src)) { return }
  if (Test-Path -LiteralPath $dst) { Remove-Item -LiteralPath $dst -Recurse -Force }
  $parent = Split-Path -Parent $dst
  Ensure-Dir $parent
  Copy-Item -LiteralPath $src -Destination $dst -Recurse -Force
}

if ([string]::IsNullOrWhiteSpace($Branch)) { $Branch = 'edi-artifacts' }
if ([string]::IsNullOrWhiteSpace($Remote)) { $Remote = 'origin' }

$root = Resolve-WorkspaceRoot
Set-Location $root

$inside = Run-Git -ArgList @('rev-parse', '--is-inside-work-tree') -AllowNonZero
if ($inside.rc -ne 0) { throw "Diretorio nao e um repositorio Git: $root" }

$worktreesBase = Join-Path $root '.edi-worktrees'
$publishDir = Join-Path $worktreesBase 'publish'

Ensure-Dir $worktreesBase

Run-Git -ArgList @('fetch', $Remote) | Out-Null

if (Test-Path -LiteralPath $publishDir) {
  try { Run-Git -ArgList @('worktree', 'remove', '--force', $publishDir) -AllowNonZero | Out-Null } catch {}
  if (Test-Path -LiteralPath $publishDir) { Remove-Item -LiteralPath $publishDir -Recurse -Force }
}

$hasRemoteBranch = $false
$remoteCheck = Run-Git -ArgList @('ls-remote', '--heads', $Remote, $Branch) -AllowNonZero
if ($remoteCheck.rc -eq 0 -and -not [string]::IsNullOrWhiteSpace($remoteCheck.out)) { $hasRemoteBranch = $true }

$hasLocalBranch = $false
$localCheck = Run-Git -ArgList @('show-ref', '--verify', "refs/heads/$Branch") -AllowNonZero
if ($localCheck.rc -eq 0) { $hasLocalBranch = $true }

if ($hasRemoteBranch -or $hasLocalBranch) {
  Run-Git -ArgList @('worktree', 'add', $publishDir, $Branch) | Out-Null
} else {
  Run-Git -ArgList @('worktree', 'add', '-b', $Branch, $publishDir, "$Remote/main") | Out-Null
}

try {
  Set-Location $publishDir

  Run-Git -ArgList @('rm', '-r', '--quiet', '--ignore-unmatch', '.') -AllowNonZero | Out-Null

  $artifacts = @(
    @{ src = (Join-Path $root 'dashboard_unificado'); dst = (Join-Path $publishDir 'dashboard_unificado') },
    @{ src = (Join-Path $root 'controle_de_dados.html'); dst = (Join-Path $publishDir 'controle_de_dados.html') },
    @{ src = (Join-Path $root 'Cotacoes\dashboard'); dst = (Join-Path $publishDir 'Cotacoes\dashboard') }
  )

  foreach ($a in $artifacts) { Copy-ArtifactPath $a.src $a.dst }

  Run-Git -ArgList @('add', '-A') | Out-Null
  $diff = Run-Git -ArgList @('diff', '--cached', '--quiet') -AllowNonZero
  if ($diff.rc -eq 0) {
    Write-Host "Nada para publicar em $Branch."
    return
  }

  $ts = (Get-Date).ToString('yyyy-MM-dd HH:mm')
  Run-Git -ArgList @('commit', '-m', "Publica artefatos (${ts})") | Out-Null

  if (-not $Run) {
    Write-Host "Commit criado no worktree de publicacao."
    Write-Host "Para efetivar o push: execute novamente com -Run"
    return
  }

  Run-Git -ArgList @('push', $Remote, $Branch) | Out-Null
  Write-Host "Push OK: $Remote/$Branch"
} finally {
  Set-Location $root
  try { Run-Git -ArgList @('worktree', 'remove', '--force', $publishDir) -AllowNonZero | Out-Null } catch {}
}
