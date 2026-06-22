@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ============================================
REM  EDI Service Wrapper - Pre-snapshot + Servico_Unificado
REM  Este wrapper protege o trabalho criando um snapshot
REM  dos arquivos regeneraveis ANTES de rodar o servico_unificado.
REM
REM  Uso: Servico_Unificado_SAFE.bat [argumentos originais]
REM        Servico_Unificado_SAFE.bat --once
REM        Servico_Unificado_SAFE.bat --no-pause
REM ============================================

set "EDI_ROOT=%~dp0"
cd /d "%EDI_ROOT%"

title EDI Servico Unificado (SAFE - com snapshot)

echo ============================================================
echo.
echo  [SAFE MODE + COLLECT-ONLY] Pre-run snapshot + Servico_Unificado
echo  Sem subir market:service — apenas pipeline Python de opcoes.
echo  Para reativar o servico, exporte MARKET_SCHEDULER_ENABLED=true
echo  ou remova o set abaixo.
echo ============================================================
echo.

REM Encontrar Python
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
  echo [ERRO] Python nao encontrado no PATH.
  exit /b 1
)

REM Coletar CSVs/JSONs sem subir servidor (regra do projeto: HTML estatico)
set "MARKET_SCHEDULER_ENABLED=false"

REM Criar snapshot
%PY_CMD% scripts\hooks\pre_run_snapshot.py create --label pre-run-safe 2>&1
if errorlevel 1 (
    echo.
    echo [AVISO] Falha ao criar snapshot. Continuando mesmo assim...
    echo         Para pular o snapshot, use Servico_Unificado.bat direto
    echo.
)

echo.
echo ============================================================
echo  Iniciando Servico_Unificado.bat com argumentos: %*
echo ============================================================
echo.

REM Repassar todos os argumentos
call Servico_Unificado.bat %*

set "EDI_EXIT=%errorlevel%"

echo.
echo ============================================================
echo  Servico_Unificado finalizado (exit=%EDI_EXIT%)
echo ============================================================
echo.

if not "%EDI_NO_PAUSE%"=="1" pause
exit /b %EDI_EXIT%
