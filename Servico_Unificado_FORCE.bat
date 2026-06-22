@echo off
REM ============================================================
REM  EDI - Servico Unificado FORCE (v2.0 - 2026-06-21)
REM
REM  ATENCAO: Este .bat faz PUSH para GitHub (origin).
REM  Use somente se voce REALMENTE quer publicar.
REM
REM  O que faz (vs Servico_Unificado.bat):
REM    1. Pre-checks (Python, cwd, working tree)
REM    2. CONFIRMACAO INTERATIVA (yes/no)
REM    3. Snapshot pre-run (recuperavel)
REM    4. Roda orquestrador com --force:
REM       - Bypass cooldown do market:service
REM       - Run options pipeline (gerar_controle.py + _copy_to_dashboard)
REM       - git full_sync: add + commit + PUSH para origin
REM       - Shutdown do market:service
REM    5. Resumo final + log em arquivo
REM
REM  RISCOS (E95b-prevention 2026-06-21):
REM    - Se working tree dirty: git add + commit + push de TUDO
REM    - Se Chrome/login expirado: travamento, --force nao protege
REM    - gerar_controle.py: PROTEGIDO (3 camadas), mas evita confusao
REM
REM  Uso:
REM    Servico_Unificado_FORCE.bat
REM    (responda 'sim' ou 's' para confirmar o push)
REM
REM  Pre-requisitos:
REM    - Python 3.13 (py -3.13) ou Python generico
REM    - working tree LIMPO (recomendado, nao obrigatorio)
REM    - Chrome com login Investing valido (se portfolio habilitado)
REM
REM  Para evitar este .bat, use Servico_Unificado_SAFE.bat
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

REM Criar diretorio de logs
if not exist "runtime\logs" mkdir "runtime\logs" >nul 2>&1

REM ============================================================
REM 2. CONFIRMACAO INTERATIVA
REM ============================================================
echo ============================================================
echo  ATENCAO: --force faz PUSH para GitHub (origin)
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

REM Contar arquivos untracked (podem ser runtime/, nao commitados)
set "UNTRACKED_COUNT=0"
for /f %%i in ('git status --short 2^>nul ^| findstr /R "^??" ^| find /v /c ""') do set "UNTRACKED_COUNT=%%i"
if %UNTRACKED_COUNT% gtr 0 (
  echo  ^>^>^> %UNTRACKED_COUNT% arquivos untracked (nao serao comitados, apenas mostrados)
  echo.
)

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
REM 3. SNAPSHOT PRE-RUN
REM ============================================================
echo.
echo ============================================================
echo  SNAPSHOT PRE-RUN (recuperavel se algo der errado)
echo ============================================================
if exist "scripts\hooks\pre_run_snapshot.py" (
  %PY_CMD% scripts\hooks\pre_run_snapshot.py --label pre-force
) else (
  echo  AVISO: pre_run_snapshot.py nao encontrado, pulando snapshot
)
echo.

REM ============================================================
REM 4. EXECUTAR ORQUESTRADOR --force
REM ============================================================

echo ============================================================
echo  EDI - Servico Unificado FORCE
echo  ATENCAO: vai fazer PUSH para origin
echo ============================================================
echo.

REM Coletar dados sem subir servidor (regra do projeto: HTML estatico)
set "MARKET_SCHEDULER_ENABLED=false"

REM Executar com log em arquivo
for /f "delims=" %%I in ('powershell -NoProfile -Command "Get-Date -Format 'yyyyMMdd_HHmmss'" 2^>nul') do set "TS=%%I"
if "%TS%"=="" set "TS=backup"
set "LOGFILE=runtime\logs\force_%TS%.log"

%PY_CMD% scripts\orquestrador.py --force --no-pause 2>&1 | tee "%LOGFILE%"
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
  echo    - Se push falhou, o commit local foi feito. Verifique: git log --oneline -3
  echo    - Para retomar: git push origin main
  echo    - Para cancelar push: git reset --soft HEAD~1
)

endlocal
exit /b %RC%
