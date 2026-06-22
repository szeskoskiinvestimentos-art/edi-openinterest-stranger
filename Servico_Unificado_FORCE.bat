@echo off
REM ============================================================
REM  EDI - Servico Unificado FORCE (v3.0 - 2026-06-22)
REM
REM  Reescrito com logica robusta do backup original, adaptado
REM  para o sistema atual (porta 3433, orquestrador.py).
REM
REM  ATENCAO: Este .bat faz PUSH para GitHub (origin).
REM  Use somente se voce REALMENTE quer publicar.
REM
REM  O que faz (vs Servico_Unificado.bat):
REM    1. Pre-checks (Python, cwd, env vars)
REM    2. CONFIRMACAO INTERATIVA (yes/no)
REM    3. Health check robusto do market:service
REM    4. Inicia market:service se necessario
REM    5. Snapshot pre-run (recuperavel)
REM    6. Roda orquestrador com --force
REM    7. Git full_sync: add + commit + PUSH para origin
REM    8. Shutdown do market:service
REM    9. Resumo final + log em arquivo
REM
REM  Uso:
REM    Servico_Unificado_FORCE.bat
REM    (responda 'sim' ou 's' para confirmar o push)
REM
REM  Pre-requisitos:
REM    - Python 3.13 (py -3.13) ou Python generico
REM    - working tree LIMPO (recomendado, nao obrigatorio)
REM    - Chrome com login Investing valido (se portfolio habilitado)
REM ============================================================

setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"
title EDI Servico Unificado FORCE

REM ============================================================
REM 1. CONFIGURACAO DE ENV VARS (defaults do sistema)
REM ============================================================

if "%MARKET_SERVICE_HOST%"=="" set "MARKET_SERVICE_HOST=127.0.0.1"
if "%MARKET_SERVICE_PORT%"=="" set "MARKET_SERVICE_PORT=3433"
if "%MARKET_INTERVAL_MINUTES%"=="" set "MARKET_INTERVAL_MINUTES=5"
if "%INVESTING_PORTFOLIO_INTERVAL_MINUTES%"=="" set "INVESTING_PORTFOLIO_INTERVAL_MINUTES=15"
if "%MARKET_UPDATE_MODE%"=="" set "MARKET_UPDATE_MODE=once"
if "%MARKET_SCHEDULE_MODE%"=="" set "MARKET_SCHEDULE_MODE=interval"
if "%MARKET_RETENTION_DAYS%"=="" set "MARKET_RETENTION_DAYS=5"
if "%MARKET_YAHOO_ENABLED%"=="" set "MARKET_YAHOO_ENABLED=true"
if "%MARKET_YAHOO_MAX_SYMBOLS%"=="" set "MARKET_YAHOO_MAX_SYMBOLS=320"
if "%MARKET_YAHOO_TIMEOUT_MS%"=="" set "MARKET_YAHOO_TIMEOUT_MS=8000"
if "%INVESTING_PORTFOLIO_ENABLED%"=="" set "INVESTING_PORTFOLIO_ENABLED=true"
if "%INVESTING_CALENDAR_ENABLED%"=="" set "INVESTING_CALENDAR_ENABLED=true"
if "%INFOMONEY_DI_ENABLED%"=="" set "INFOMONEY_DI_ENABLED=true"
if "%DOTENV_OVERRIDE%"=="" set "DOTENV_OVERRIDE=false"

set "COTACOES_DIR=%~dp0Cotacoes"
set "AUTO_B3_DIR=%~dp0Auto_B3_System"
for %%I in ("%AUTO_B3_DIR%") do set "AUTO_B3_DIR=%%~fI"
set "OPTIONS_UNIFIED_DASHBOARD_DIR=%~dp0dashboard_unificado"
set "LOCKS_DIR=%~dp0service_locks"
set "OPTIONS_LOCK_DIR=%LOCKS_DIR%\options_run.lock"

if "%OPTIONS_LOCK_MAX_AGE_MINUTES%"=="" set "OPTIONS_LOCK_MAX_AGE_MINUTES=240"

REM FORCE: sem scheduler, sem git sync padrao (orquestrador cuida)
set "MARKET_SCHEDULER_ENABLED=false"
set "MARKET_GIT_SYNC_ENABLED=false"
set "MARKET_GIT_SYNC_PUSH=false"

REM ============================================================
REM 2. PRE-CHECKS
REM ============================================================

REM 2a. Verificar Python
set "PY_CMD="
py -3 -c "import sys" >nul 2>&1
if not errorlevel 1 set "PY_CMD=py -3.13"
if "%PY_CMD%"=="" (
  py -3 -c "import sys" >nul 2>&1
  if not errorlevel 1 set "PY_CMD=py -3"
)
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

REM 2b. Verificar orquestrador
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

REM 2c. Verificar Cotacoes
if not exist "%COTACOES_DIR%\package.json" (
  echo.
  echo ============================================================
  echo  ERRO: pasta Cotacoes nao encontrada em "%COTACOES_DIR%"
  echo ============================================================
  echo.
  pause
  exit /b 1
)

REM 2d. Criar diretorios necessarios
if not exist "runtime\logs" mkdir "runtime\logs" >nul 2>&1
if not exist "%LOCKS_DIR%" mkdir "%LOCKS_DIR%" >nul 2>&1

REM ============================================================
REM 3. CONFIRMACAO INTERATIVA
REM ============================================================

echo ============================================================
echo  ATENCAO: FORCE faz PUSH para GitHub (origin)
echo ============================================================
echo.

REM Contar arquivos dirty
set "DIRTY_COUNT=0"
for /f %%i in ('git status --short 2^>nul ^| find /v /c ""') do set "DIRTY_COUNT=%%i"

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
timeout /t 3 /nobreak >nul

REM ============================================================
REM 4. HEALTH CHECK ROBUSTO DO MARKET:SERVICE
REM ============================================================

echo.
echo ============================================================
echo  MARKET SERVICE CHECK
echo ============================================================

set "MARKET_ALREADY_RUNNING=0"
set "MARKET_PID="

REM Detectar PID na porta
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "$p=(Get-NetTCPConnection -State Listen -LocalPort %MARKET_SERVICE_PORT% -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess; if($p){$p}"`) do set "MARKET_PID=%%i"

REM Verificar se porta esta listening
powershell -NoProfile -Command "$x=Get-NetTCPConnection -State Listen -LocalPort %MARKET_SERVICE_PORT% -ErrorAction SilentlyContinue | Select-Object -First 1; if($x){exit 0}else{exit 1}" >nul 2>&1
if not errorlevel 1 set "MARKET_ALREADY_RUNNING=1"

REM Se porta ocupada, verificar health
if "%MARKET_ALREADY_RUNNING%"=="1" (
  powershell -NoProfile -Command "try { $r=Invoke-RestMethod -Method Get -Uri 'http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/health' -TimeoutSec 2; if($r -and $r.ok -eq $true){ exit 0 } exit 2 } catch { exit 2 }" >nul 2>&1
  if errorlevel 2 (
    if not "%MARKET_PID%"=="" (
      echo  AVISO: Porta %MARKET_SERVICE_PORT% ocupada, mas healthcheck falhou. Encerrando PID=%MARKET_PID%...
      taskkill /PID %MARKET_PID% /T /F >nul 2>&1
      timeout /t 1 >nul
    )
    set "MARKET_ALREADY_RUNNING=0"
  )
)

REM Verificacao adicional via netstat
if "%MARKET_ALREADY_RUNNING%"=="0" (
  netstat -ano | findstr ":%MARKET_SERVICE_PORT%" | findstr /I "LISTENING OUVINDO" >nul 2>&1
  if not errorlevel 1 set "MARKET_ALREADY_RUNNING=1"
)

REM ============================================================
REM 5. INICIAR MARKET:SERVICE (se necessario)
REM ============================================================

if "%MARKET_ALREADY_RUNNING%"=="1" (
  echo  Market service ja esta rodando.

  REM Verificar se modulos estao habilitados
  powershell -NoProfile -Command "try { $u='http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/status'; $r=Invoke-RestMethod -Method Get -Uri $u -TimeoutSec 2; $s=$null; if($r -and $r.state -and $r.state.last -and $r.state.last.summary){ $s=$r.state.last.summary }; if($s -and (($s.portfolio -and $s.portfolio.enabled -eq $false) -or ($s.di -and $s.di.enabled -eq $false) -or ($s.calendar -and $s.calendar.enabled -eq $false))){ exit 2 } exit 0 } catch { exit 0 }" >nul 2>&1
  if errorlevel 2 (
    echo  AVISO: market:service com modulos desativados. Reiniciando...
    call :SHUTDOWN_MARKET_FORCE
    set "MARKET_ALREADY_RUNNING=0"
    timeout /t 1 >nul
  )
)

if "%MARKET_ALREADY_RUNNING%"=="0" (
  echo  Iniciando market:service em background...
  set "MARKET_STARTED_HERE=1"
  start "" /b powershell -NoProfile -Command "$env:DOTENV_OVERRIDE='%DOTENV_OVERRIDE%'; $env:MARKET_GIT_SYNC_ENABLED='%MARKET_GIT_SYNC_ENABLED%'; $env:MARKET_GIT_SYNC_PUSH='%MARKET_GIT_SYNC_PUSH%'; $env:MARKET_SERVICE_HOST='%MARKET_SERVICE_HOST%'; $env:MARKET_SERVICE_PORT='%MARKET_SERVICE_PORT%'; $env:MARKET_INTERVAL_MINUTES='%MARKET_INTERVAL_MINUTES%'; $env:INVESTING_PORTFOLIO_INTERVAL_MINUTES='%INVESTING_PORTFOLIO_INTERVAL_MINUTES%'; $env:MARKET_UPDATE_MODE='%MARKET_UPDATE_MODE%'; $env:MARKET_SCHEDULE_MODE='%MARKET_SCHEDULE_MODE%'; $env:MARKET_SCHEDULER_ENABLED='%MARKET_SCHEDULER_ENABLED%'; $env:MARKET_RETENTION_DAYS='%MARKET_RETENTION_DAYS%'; $env:MARKET_YAHOO_ENABLED='%MARKET_YAHOO_ENABLED%'; $env:MARKET_YAHOO_MAX_SYMBOLS='%MARKET_YAHOO_MAX_SYMBOLS%'; $env:MARKET_YAHOO_TIMEOUT_MS='%MARKET_YAHOO_TIMEOUT_MS%'; $env:INVESTING_PORTFOLIO_ENABLED='%INVESTING_PORTFOLIO_ENABLED%'; $env:INVESTING_CALENDAR_ENABLED='%INVESTING_CALENDAR_ENABLED%'; $env:INFOMONEY_DI_ENABLED='%INFOMONEY_DI_ENABLED%'; $env:OPTIONS_UNIFIED_DASHBOARD_DIR='%OPTIONS_UNIFIED_DASHBOARD_DIR%'; Set-Location '%COTACOES_DIR%'; if (-not (Test-Path -LiteralPath 'node_modules\.bin\tsx.cmd')) { npm ci --silent }; npm run -s market:service"
  timeout /t 3 >nul
)

REM Aguardar market:service ficar UP
echo.
call :WAIT_MARKET
if errorlevel 1 (
  echo  ERRO: market:service nao respondeu em 120s.
  echo  O BLOCO 1 (POST /api/market/update) provavelmente falhara.
) else (
  echo  Market service online.
)
echo.

REM ============================================================
REM 6. EXIT WATCHER (cleanup se .bat morrer)
REM ============================================================

call :START_EXIT_WATCHER

REM ============================================================
REM 7. SNAPSHOT PRE-RUN
REM ============================================================

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
REM 8. EXECUTAR ORQUESTRADOR --force
REM ============================================================

echo ============================================================
echo  EXECUTANDO ORQUESTRADOR --force
echo  ATENCAO: vai fazer PUSH para origin
echo ============================================================
echo.

REM Executar com log em arquivo
for /f "delims=" %%I in ('powershell -NoProfile -Command "Get-Date -Format 'yyyyMMdd_HHmmss'" 2^>nul') do set "TS=%%I"
if "%TS%"=="" set "TS=backup"
set "LOGFILE=runtime\logs\force_%TS%.log"

%PY_CMD% "scripts\orquestrador.py" --force --no-pause > "%LOGFILE%" 2>&1
set "RC=%errorlevel%"

REM Mostrar o log
echo.
echo ============================================================
echo  LOG DO FORCE (com timestamps)
echo ============================================================
type "%LOGFILE%"
echo ============================================================

REM ============================================================
REM 9. RESUMO FINAL
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
  call :SHUTDOWN_MARKET_FORCE
)

endlocal
exit /b %RC%

REM ============================================================
REM  FUNCOES
REM ============================================================

:WAIT_MARKET
setlocal
set "WAIT_URL=http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/health"
powershell -NoProfile -Command "try { $u='%WAIT_URL%'; $deadline=(Get-Date).AddSeconds(120); while((Get-Date) -lt $deadline){ try { $r=Invoke-RestMethod -Method Get -Uri $u -TimeoutSec 2; if($r -and $r.ok -eq $true){ exit 0 } } catch {} Start-Sleep -Seconds 1 } exit 1 } catch { exit 1 }"
endlocal & exit /b %errorlevel%

:SHUTDOWN_MARKET_FORCE
setlocal
set "SHUT_URL=http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/shutdown"
powershell -NoProfile -Command ^
  "try { Invoke-RestMethod -Method Post -Uri '%SHUT_URL%' -TimeoutSec 3 | Out-Null } catch { };" ^
  "$deadline=(Get-Date).AddSeconds(12);" ^
  "while((Get-Date) -lt $deadline){" ^
  "  try { $x=Get-NetTCPConnection -State Listen -LocalPort %MARKET_SERVICE_PORT% -ErrorAction SilentlyContinue | Select-Object -First 1; if(-not $x){ exit 0 } } catch { };" ^
  "  Start-Sleep -Seconds 1;" ^
  "}" ^
  "exit 0"
set "KPID="
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "$p=(Get-NetTCPConnection -State Listen -LocalPort %MARKET_SERVICE_PORT% -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess; if($p){$p}"`) do set "KPID=%%i"
if not "%KPID%"=="" taskkill /PID %KPID% /T /F >nul 2>&1
endlocal & exit /b 0

:START_EXIT_WATCHER
if "%EDI_EXIT_WATCHER_STARTED%"=="1" exit /b 0
set "EDI_EXIT_WATCHER_STARTED=1"
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "try { $parent=(Get-CimInstance Win32_Process -Filter \"ProcessId=$PID\").ParentProcessId; $h='%MARKET_SERVICE_HOST%'; $p=%MARKET_SERVICE_PORT%;; $url=('http://' + $h + ':' + $p + '/api/market/shutdown'); while(Get-Process -Id $parent -ErrorAction SilentlyContinue){ Start-Sleep -Seconds 1 }; try { Invoke-RestMethod -Method Post -Uri $url -TimeoutSec 3 | Out-Null } catch { }; try { $x=Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue | Select-Object -First 1; if($x){ Stop-Process -Id $x.OwningProcess -Force -ErrorAction SilentlyContinue } } catch { } } catch { }"
exit /b 0
