@echo off
REM ============================================================
REM  EDI - Servico Unificado (v2.0 - 2026-06-21)
REM
REM  O que faz:
REM    1. Pre-checks (Python, cwd, working tree)
REM    2. Snapshot pre-run (recuperavel se algo der errado)
REM    3. Roda scripts/orquestrador.py com argumentos
REM
REM  Diferenca vs outros .bat:
REM    - Servico_Unificado.bat       <- ESTE (padrao, sem force)
REM    - Servico_Unificado_FORCE.bat <- faz push para GitHub
REM    - Servico_Unificado_SAFE.bat  <- wrapper deste + log em arquivo
REM
REM  Uso:
REM    Servico_Unificado.bat --once             (executa uma vez)
REM    Servico_Unificado.bat --no-pause         (sem pause no final)
REM    Servico_Unificado.bat --git-dry-run      (mostra status git, NAO modifica nada)
REM
REM  Argumentos reconhecidos: --once, --no-pause, --git-dry-run
REM  Combine quantos quiser (ate 3 primeiros argumentos)
REM
REM  Pre-requisitos:
REM    - Python 3.13 (py -3.13) ou Python generico
REM    - Estar no diretorio raiz do projeto (cd /d %~dp0 ja faz isso)
REM
REM  Seguranca (E95b-prevention 2026-06-21):
REM    - Snapshot pre-run SEMPRE executado (recuperavel)
REM    - Working tree dirty MOSTRADO (avisar, nao bloquear)
REM    - Sem --force: NAO faz push para GitHub
REM    - Log salvo em runtime/servico_<TIMESTAMP>.log
REM ============================================================

setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"
title EDI Servico Unificado

REM ============================================================
REM 1. PRE-CHECKS
REM ============================================================

REM 1a. Verificar Python
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

REM 1b. Verificar que estamos no diretorio correto do projeto
if not exist "scripts\orquestrador.py" (
  echo.
  echo ============================================================
  echo  ERRO CRITICO: orquestrador.py nao encontrado
  echo ============================================================
  echo  Diretorio atual: %CD%
  echo  Esperado: raiz do projeto Edi_market_guardian_v0
  echo  com scripts\orquestrador.py presente
  echo ============================================================
  echo.
  pause
  exit /b 1
)

REM 1c. Verificar working tree (informativo, nao bloqueia)
echo ============================================================
echo  PRE-CHECKS
echo ============================================================
git status --short 2>nul | findstr /R "^[ MAD]" >nul
if not errorlevel 1 (
  echo  AVISO: working tree tem mudancas:
  git status --short 2>nul
  echo  Recomendado: commitar antes de rodar pipeline
  echo.
)

REM 1d. Criar diretorio de logs
if not exist "runtime\logs" mkdir "runtime\logs" >nul 2>&1

REM ============================================================
REM 2. PARSE ARGUMENTOS (ate 3 primeiros)
REM ============================================================

set "ARGS="
if /i "%~1"=="--once" set "ARGS=%ARGS% --once"
if /i "%~1"=="--no-pause" set "ARGS=%ARGS% --no-pause"
if /i "%~1"=="--git-dry-run" set "ARGS=%ARGS% --git-dry-run"
if /i "%~2"=="--once" set "ARGS=%ARGS% --once"
if /i "%~2"=="--no-pause" set "ARGS=%ARGS% --no-pause"
if /i "%~2"=="--git-dry-run" set "ARGS=%ARGS% --git-dry-run"
if /i "%~3"=="--once" set "ARGS=%ARGS% --once"
if /i "%~3"=="--no-pause" set "ARGS=%ARGS% --no-pause"
if /i "%~3"=="--git-dry-run" set "ARGS=%ARGS% --git-dry-run"

REM ============================================================
REM 3. SNAPSHOT PRE-RUN (E95b-prevention 2026-06-21)
REM ============================================================
echo.
echo ============================================================
echo  SNAPSHOT PRE-RUN
echo ============================================================
if exist "scripts\hooks\pre_run_snapshot.py" (
  %PY_CMD% scripts\hooks\pre_run_snapshot.py create --label pre-run 2>&1
  if errorlevel 1 (
    echo  AVISO: snapshot retornou aviso, mas continuando...
  )
) else (
  echo  AVISO: pre_run_snapshot.py nao encontrado, pulando snapshot
)
echo.

REM ============================================================
REM 4. EXECUTAR ORQUESTRADOR
REM ============================================================

echo ============================================================
echo  EDI - Servico Unificado
echo  (Python Orquestrador)
echo  Modo: COLLECT-ONLY (sem market:service)
echo  Para reativar: set MARKET_SCHEDULER_ENABLED=true
echo  Argumentos:%ARGS%
echo ============================================================
echo.

REM Coletar dados sem subir servidor (regra do projeto: HTML estatico)
set "MARKET_SCHEDULER_ENABLED=false"

REM Executar com log em arquivo
for /f "delims=" %%I in ('powershell -NoProfile -Command "Get-Date -Format 'yyyyMMdd_HHmmss'" 2^>nul') do set "TS=%%I"
if "%TS%"=="" set "TS=backup"
set "LOGFILE=runtime\logs\servico_%TS%.log"

%PY_CMD% scripts\orquestrador.py%ARGS% > "%LOGFILE%" 2>&1
type "%LOGFILE%"
set "RC=%errorlevel%"

REM ============================================================
REM 5. RESUMO FINAL
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
  echo    - Para investigar: Servico_Unificado.bat --git-dry-run
  echo    - Para snapshot manual: python scripts\hooks\pre_run_snapshot.py
)

if not "%ARGS%"=="%ARGS:--no-pause=%" goto :END
pause
:END
endlocal
exit /b %RC%
