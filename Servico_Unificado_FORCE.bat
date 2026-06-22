@echo off
REM ============================================================
REM  EDI - Servico Unificado FORCE (v5.0 - 2026-06-22)
REM
REM  v5.0: -File SEM aspas duplas em todos powershell calls
REM        (aspas causavam concatenacao de argumentos via cmd)
REM        - PROJECT_ROOT via %CD% (sem trailing backslash)
REM        - exit_watcher desabilitado em --force
REM        - timeout -> ping (GNU timeout nao funciona em cmd)
REM
REM  Cada chamada powershell delega para scripts .ps1 em
REM  scripts\hooks\ (market_health.ps1, market_health_wait.ps1, etc).
REM
REM  ATENCAO: Este .bat faz PUSH para GitHub (origin).
REM  Use somente se voce REALMENTE quer publicar.
REM
REM  Fluxo:
REM    1. Pre-checks (Python, cwd, env vars)
REM    2. CONFIRMACAO INTERATIVA (sim/s)
REM    3. Snapshot pre-run
REM    4. HEALTH CHECK do market:service
REM    5. Se DOWN: auto-start em background
REM    6. WAIT_MARKET (ate 120s) com output '.' a cada 5s
REM    7. Executa orquestrador com --force (output em tempo real + log)
REM    8. Shutdown graceful do market:service (se foi iniciado por este .bat)
REM    9. Resumo final
REM
REM  Pre-requisitos:
REM    - Python 3.13 (py -3.13) ou Python generico
REM    - working tree LIMPO (recomendado, nao obrigatorio)
REM    - scripts\hooks\market_*.ps1 existem
REM
REM ============================================================

setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"
title EDI Servico Unificado FORCE

REM ============================================================
REM 1. PRE-CHECKS
REM ============================================================

set "PY_CMD="
py -3 -c "import sys" >nul 2>&1
if not errorlevel 1 set "PY_CMD=py -3.13"
if "%PY_CMD%"=="" (
  python -c "import sys" >nul 2>&1
  if not errorlevel 1 set "PY_CMD=python"
)

if "%PY_CMD%"=="" (
  echo.
  echo ============================================================
  echo  ERRO CRITICO: Python nao encontrado
  echo ============================================================
  echo  Instale Python 3.13 ou ajuste o PATH.
  echo  Esperado: py -3.13 ou python
  echo ============================================================
  echo.
  pause
  exit /b 1
)

if not exist "scripts\orquestrador.py" (
  echo.
  echo ============================================================
  echo  ERRO CRITICO: orquestrador.py nao encontrado
  echo ============================================================
  echo  Diretorio atual: %CD%
  echo  Esperado: raiz do projeto Edi_market_guardian_v0
  echo ============================================================
  echo.
  pause
  exit /b 1
)

if not exist "scripts\hooks\market_health.ps1" (
  echo.
  echo ============================================================
  echo  ERRO CRITICO: scripts\hooks\market_health.ps1 nao encontrado
  echo ============================================================
  echo  Diretorio atual: %CD%
  echo  Faltam scripts de hooks do powershell.
  echo ============================================================
  echo.
  pause
  exit /b 1
)

REM Criar diretorio de logs
if not exist "runtime\logs" mkdir "runtime\logs" >nul 2>&1

REM Variaveis de ambiente
set "MARKET_SERVICE_HOST=127.0.0.1"
set "MARKET_SERVICE_PORT=3433"
set "COTACOES_DIR=%~dp0Cotacoes"
set "MARKET_GIT_SYNC_ENABLED=true"
set "MARKET_GIT_SYNC_PUSH=true"
set "MARKET_GIT_SYNC_BRANCH=main"
set "MARKET_UPDATE_MODE=once"
set "MARKET_SCHEDULE_MODE=interval"
set "MARKET_INTERVAL_MINUTES=5"
set "INVESTING_PORTFOLIO_INTERVAL_MINUTES=15"
set "MARKET_RETENTION_DAYS=5"
set "MARKET_YAHOO_ENABLED=true"
set "MARKET_YAHOO_MAX_SYMBOLS=320"
set "MARKET_YAHOO_TIMEOUT_MS=8000"
set "INVESTING_PORTFOLIO_ENABLED=true"
set "INVESTING_CALENDAR_ENABLED=true"
set "INFOMONEY_DI_ENABLED=true"
set "MARKET_SCHEDULER_ENABLED=true"
set "DOTENV_OVERRIDE=false"

REM ============================================================
REM 2. CONFIRMACAO INTERATIVA
REM ============================================================

echo ============================================================
echo  ATENCAO: FORCE faz PUSH para GitHub (origin)
echo ============================================================
echo.

set "DIRTY_COUNT=0"
for /f %%i in ('powershell -NoProfile -ExecutionPolicy Bypass -File scripts\hooks\git_dirty_count.ps1') do set "DIRTY_COUNT=%%i"

echo  Working tree status:
if %DIRTY_COUNT% gtr 0 (
  git status --short 2>nul
  echo.
  echo  ^>^>^> %DIRTY_COUNT% arquivos serao commitados e pushed ^<^<^<
) else (
  echo  (limpo, sem mudancas)
)
echo.

set /p "CONFIRM=Digite 'sim' ou 's' para CONFIRMAR o FORCE: "
if /i not "%CONFIRM%"=="sim" if /i not "%CONFIRM%"=="s" (
  echo.
  echo  FORCE CANCELADO. Nada foi feito.
  echo  Para rodar sem push, use Servico_Unificado.bat --once
  echo.
  pause
  exit /b 0
)

echo.
echo  Confirmado. Iniciando FORCE em 3 segundos...
ping -n 4 127.0.0.1 >nul

REM ============================================================
REM 3. SNAPSHOT PRE-RUN
REM ============================================================

echo.
echo ============================================================
echo  SNAPSHOT PRE-RUN (recuperavel se algo der errado)
echo ============================================================
if exist "scripts\hooks\pre_run_snapshot.py" (
  %PY_CMD% "scripts\hooks\pre_run_snapshot.py" create --label pre-force 2>&1
) else (
  echo  AVISO: pre_run_snapshot.py nao encontrado, pulando snapshot
)
echo.

REM ============================================================
REM 4. HEALTH CHECK + AUTO-START DO MARKET:SERVICE
REM ============================================================

echo.
echo ============================================================
echo  MARKET SERVICE CHECK
echo ============================================================

set "MARKET_ALREADY_RUNNING=0"
set "MARKET_STARTED_HERE=0"

REM Detectar PID na porta usando .ps1 (sem powershell inline)
set "MARKET_PID="
for /f "usebackq delims=" %%i in (`powershell -NoProfile -ExecutionPolicy Bypass -File scripts\hooks\market_get_pid.ps1 -Port %MARKET_SERVICE_PORT%`) do set "MARKET_PID=%%i"
if not "%MARKET_PID%"=="" set "MARKET_ALREADY_RUNNING=1"

REM Se porta ocupada, verificar health
if "%MARKET_ALREADY_RUNNING%"=="1" (
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts\hooks\market_health.ps1 -Url "http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/health" >nul 2>&1
  if errorlevel 1 (
    if not "%MARKET_PID%"=="" (
      echo  AVISO: Porta %MARKET_SERVICE_PORT% ocupada, mas healthcheck falhou. Encerrando PID=%MARKET_PID%...
      taskkill /PID %MARKET_PID% /T /F >nul 2>&1
      ping -n 2 127.0.0.1 >nul
    )
    set "MARKET_ALREADY_RUNNING=0"
  )
)

REM Se ainda nao UP, iniciar em background
if "%MARKET_ALREADY_RUNNING%"=="0" (
  echo  Iniciando market:service em background...
  set "MARKET_STARTED_HERE=1"
  start "market-service" /b powershell -NoProfile -ExecutionPolicy Bypass -File scripts\hooks\market_start.ps1 ^
    -CotacoesDir "%COTACOES_DIR%" ^
    -ServiceHost "%MARKET_SERVICE_HOST%" ^
    -ServicePort "%MARKET_SERVICE_PORT%" ^
    -IntervalMinutes %MARKET_INTERVAL_MINUTES% ^
    -InvestingPortfolioIntervalMinutes %INVESTING_PORTFOLIO_INTERVAL_MINUTES% ^
    -UpdateMode "%MARKET_UPDATE_MODE%" ^
    -ScheduleMode "%MARKET_SCHEDULE_MODE%" ^
    -SchedulerEnabled "%MARKET_SCHEDULER_ENABLED%" ^
    -RetentionDays %MARKET_RETENTION_DAYS% ^
    -YahooEnabled "%MARKET_YAHOO_ENABLED%" ^
    -YahooMaxSymbols "%MARKET_YAHOO_MAX_SYMBOLS%" ^
    -YahooTimeoutMs "%MARKET_YAHOO_TIMEOUT_MS%" ^
    -InvestingPortfolioEnabled "%INVESTING_PORTFOLIO_ENABLED%" ^
    -InvestingCalendarEnabled "%INVESTING_CALENDAR_ENABLED%" ^
    -InfomoneyDiEnabled "%INFOMONEY_DI_ENABLED%" ^
    -OptionsUnifiedDashboardDir "%~dp0dashboard_unificado" ^
    -GitSyncEnabled "%MARKET_GIT_SYNC_ENABLED%" ^
    -GitSyncPush "%MARKET_GIT_SYNC_PUSH%" ^
    -GitSyncBranch "%MARKET_GIT_SYNC_BRANCH%" ^
    -DotenvOverride "%DOTENV_OVERRIDE%"
  ping -n 4 127.0.0.1 >nul
)

REM ============================================================
REM 5. WAIT_MARKET (ate 120s)
REM ============================================================

echo.
echo  Aguardando market:service em http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT% ...
echo  (output '.' a cada 5s, ate 120s)
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\hooks\market_health_wait.ps1 ^
  -Url "http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/health" ^
  -TimeoutSec 120 ^
  -PollIntervalSec 1
if errorlevel 1 (
  echo.
  echo  AVISO: market:service nao respondeu em 120s.
  echo  Continuando mesmo assim...
) else (
  echo  OK!
)
echo.

REM ============================================================
REM 6. EXECUTAR ORQUESTRADOR --force
REM ============================================================

echo.
echo ============================================================
echo  EXECUTANDO ORQUESTRADOR --force
echo  ATENCAO: vai fazer PUSH para origin
echo ============================================================
set "PROJECT_ROOT=%CD%"
REM Remover backslash final se houver (CD pode incluir)
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

REM Executar com log em arquivo + output EM TEMPO REAL
for /f "delims=" %%I in ('powershell -NoProfile -Command "Get-Date -Format 'yyyyMMdd_HHmmss'" 2^>nul') do set "TS=%%I"
if "%TS%"=="" set "TS=backup"
set "LOGFILE=runtime\logs\force_%TS%.log"

echo.
echo  Executando orquestrador - acompanhe o progresso abaixo:
echo  (Log completo salvo em: %LOGFILE%)
echo.

set "RC=1"
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\hooks\market_run_force.ps1 ^
  -ProjectRoot "%PROJECT_ROOT%" ^
  -LogFile "%LOGFILE%" ^
  -PyCmd "%PY_CMD%"
set "RC=%errorlevel%"

REM ============================================================
REM 7. RESUMO FINAL
REM ============================================================

echo.
echo ============================================================
echo  RESUMO
echo ============================================================
echo  Exit code: %RC%
echo  Log salvo em: %LOGFILE%
echo.

if %RC% neq 0 (
  echo  AVISO: Orquestrador retornou codigo %RC%
  echo  Sugestoes:
  echo    - Verifique %LOGFILE% para detalhes
  echo    - Se push falhou, o commit local foi feito. Verifique: git log --oneline -3
  echo    - Para retomar: git push origin main
  echo    - Para cancelar push: git reset --soft HEAD~1
)

REM Shutdown market service se foi iniciado por este .bat
if "%MARKET_STARTED_HERE%"=="1" (
  echo.
  echo  Encerrando market:service (graceful)...
  call :SHUTDOWN_MARKET_FORCE
)

endlocal
exit /b %RC%

REM ============================================================
REM  FUNCOES
REM ============================================================

:SHUTDOWN_MARKET_FORCE
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\hooks\market_shutdown.ps1 ^
  -Url "http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/shutdown" ^
  -WaitSec 12
set "KPID="
for /f "usebackq delims=" %%i in (`powershell -NoProfile -ExecutionPolicy Bypass -File scripts\hooks\market_get_pid.ps1 -Port %MARKET_SERVICE_PORT%`) do set "KPID=%%i"
if not "%KPID%"=="" taskkill /PID %KPID% /T /F >nul 2>&1
endlocal & exit /b 0
