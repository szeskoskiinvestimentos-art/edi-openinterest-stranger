@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"
title EDI Servico Unificado FORCE

if /i "%~1"=="--no-pause" (
  set "EDI_NO_PAUSE=1"
  shift
)

set "MARKET_GIT_SYNC_ENABLED=true"
set "MARKET_GIT_SYNC_PUSH=true"
if "%MARKET_GIT_SYNC_BRANCH%"=="" set "MARKET_GIT_SYNC_BRANCH=main"

if "%MARKET_SERVICE_HOST%"=="" set "MARKET_SERVICE_HOST=127.0.0.1"
if "%MARKET_SERVICE_PORT%"=="" set "MARKET_SERVICE_PORT=3033"

if "%MARKET_INTERVAL_MINUTES%"=="" set "MARKET_INTERVAL_MINUTES=5"
if "%INVESTING_PORTFOLIO_INTERVAL_MINUTES%"=="" set "INVESTING_PORTFOLIO_INTERVAL_MINUTES=15"
if "%MARKET_UPDATE_MODE%"=="" set "MARKET_UPDATE_MODE=once"
if "%MARKET_SCHEDULE_MODE%"=="" set "MARKET_SCHEDULE_MODE=interval"
if "%MARKET_RETENTION_DAYS%"=="" set "MARKET_RETENTION_DAYS=5"

set "COTACOES_DIR=%~dp0Cotacoes"
if not exist "%COTACOES_DIR%\package.json" (
  echo ERRO: pasta Cotacoes nao encontrada em "%COTACOES_DIR%".
  goto :END
)

set "MARKET_ALREADY_RUNNING=0"
powershell -NoProfile -Command "$x=Get-NetTCPConnection -State Listen -LocalPort %MARKET_SERVICE_PORT% -ErrorAction SilentlyContinue | Select-Object -First 1; if($x){exit 0}else{exit 1}" >nul 2>&1
if not errorlevel 1 set "MARKET_ALREADY_RUNNING=1"
if "%MARKET_ALREADY_RUNNING%"=="0" (
  netstat -ano | findstr ":%MARKET_SERVICE_PORT%" | findstr /I "LISTENING OUVINDO" >nul 2>&1
  if not errorlevel 1 set "MARKET_ALREADY_RUNNING=1"
)

echo.
echo =====================================
echo  EDI - Servico Unificado FORCE
echo =====================================
echo Host: %MARKET_SERVICE_HOST%
echo Porta: %MARKET_SERVICE_PORT%
echo.

if "%MARKET_ALREADY_RUNNING%"=="0" (
  echo Market service nao esta rodando. Iniciando em nova janela...
  start "COTACOES market:service" /D "%COTACOES_DIR%" "%ComSpec%" /k "set MARKET_GIT_SYNC_ENABLED=%MARKET_GIT_SYNC_ENABLED%^& set MARKET_GIT_SYNC_PUSH=%MARKET_GIT_SYNC_PUSH%^& set MARKET_GIT_SYNC_BRANCH=%MARKET_GIT_SYNC_BRANCH%^& set MARKET_SERVICE_HOST=%MARKET_SERVICE_HOST%^& set MARKET_SERVICE_PORT=%MARKET_SERVICE_PORT%^& set MARKET_INTERVAL_MINUTES=%MARKET_INTERVAL_MINUTES%^& set INVESTING_PORTFOLIO_INTERVAL_MINUTES=%INVESTING_PORTFOLIO_INTERVAL_MINUTES%^& set MARKET_UPDATE_MODE=%MARKET_UPDATE_MODE%^& set MARKET_SCHEDULE_MODE=%MARKET_SCHEDULE_MODE%^& set MARKET_RETENTION_DAYS=%MARKET_RETENTION_DAYS%^& if not exist node_modules\\.bin\\tsx.cmd (npm ci --silent)^& npm run -s market:service"
  timeout /t 3 >nul
)

echo Forcando update (bypass cooldown)...
powershell -NoProfile -Command "try { $u='http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/update'; $b='{\"\"reason\"\":\"\"schedule\"\"}'; Invoke-RestMethod -Method Post -Uri $u -ContentType 'application/json' -Body $b | Out-String | Write-Host } catch { Write-Host ('ERRO: ' + $_.Exception.Message); exit 1 }"

echo.
echo Status: http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/status
echo.

if exist "%~dp0controle_de_dados.html" start "" "%~dp0controle_de_dados.html"

:END
if "%EDI_NO_PAUSE%"=="1" exit /b 0
pause
