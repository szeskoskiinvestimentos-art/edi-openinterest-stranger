# market_start.ps1 - Sobe market:service em background com env vars
# Retorna exit 0 sempre (service roda em janela separada)
param(
    [string]$CotacoesDir = "C:\Projetos_Hermes\Edi_Market_Guardian_V0\Cotacoes",
    [string]$ServiceHost = "127.0.0.1",
    [string]$ServicePort = "3433",
    [int]$IntervalMinutes = 5,
    [int]$InvestingPortfolioIntervalMinutes = 15,
    [string]$UpdateMode = "once",
    [string]$ScheduleMode = "interval",
    [string]$SchedulerEnabled = "true",
    [int]$RetentionDays = 5,
    [string]$YahooEnabled = "true",
    [string]$YahooMaxSymbols = "320",
    [string]$YahooTimeoutMs = "8000",
    [string]$InvestingPortfolioEnabled = "true",
    [string]$InvestingCalendarEnabled = "true",
    [string]$InfomoneyDiEnabled = "true",
    [string]$OptionsUnifiedDashboardDir = "C:\Projetos_Hermes\Edi_Market_Guardian_V0\dashboard_unificado",
    [string]$GitSyncEnabled = "true",
    [string]$GitSyncPush = "true",
    [string]$GitSyncBranch = "main",
    [string]$DotenvOverride = "false"
)
# Set env vars
$env:DOTENV_OVERRIDE = $DotenvOverride
$env:MARKET_GIT_SYNC_ENABLED = $GitSyncEnabled
$env:MARKET_GIT_SYNC_PUSH = $GitSyncPush
$env:MARKET_GIT_SYNC_BRANCH = $GitSyncBranch
$env:MARKET_SERVICE_HOST = $ServiceHost
$env:MARKET_SERVICE_PORT = $ServicePort
$env:MARKET_INTERVAL_MINUTES = [string]$IntervalMinutes
$env:INVESTING_PORTFOLIO_INTERVAL_MINUTES = [string]$InvestingPortfolioIntervalMinutes
$env:MARKET_UPDATE_MODE = $UpdateMode
$env:MARKET_SCHEDULE_MODE = $ScheduleMode
$env:MARKET_SCHEDULER_ENABLED = $SchedulerEnabled
$env:MARKET_RETENTION_DAYS = [string]$RetentionDays
$env:MARKET_YAHOO_ENABLED = $YahooEnabled
$env:MARKET_YAHOO_MAX_SYMBOLS = $YahooMaxSymbols
$env:MARKET_YAHOO_TIMEOUT_MS = $YahooTimeoutMs
$env:INVESTING_PORTFOLIO_ENABLED = $InvestingPortfolioEnabled
$env:INVESTING_CALENDAR_ENABLED = $InvestingCalendarEnabled
$env:INFOMONEY_DI_ENABLED = $InfomoneyDiEnabled
$env:OPTIONS_UNIFIED_DASHBOARD_DIR = $OptionsUnifiedDashboardDir

Set-Location $CotacoesDir

# Install deps if needed
if (-not (Test-Path -LiteralPath 'node_modules\.bin\tsx.cmd')) {
    npm ci --silent
}

# Run service
npm run -s market:service
