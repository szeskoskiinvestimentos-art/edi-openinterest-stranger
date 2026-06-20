@echo off
setlocal

cd /d "%~dp0"
title EDI Servico Unificado FORCE

rem Detect Python command
set "PY_CMD="
py -3 -c "import sys" >nul 2>&1
if not errorlevel 1 set "PY_CMD=py -3.13"
if "%PY_CMD%"=="" (
  python -c "import sys" >nul 2>&1
  if not errorlevel 1 set "PY_CMD=python"
)

if "%PY_CMD%"=="" (
  echo ERRO: Python nao encontrado.
  pause
  exit /b 1
)

echo.
echo =====================================
echo  EDI - Servico Unificado FORCE
echo  (Python Orquestrador)
echo  Modo: COLLECT-ONLY FORCE (sem market:service)
echo  Para reativar: set MARKET_SCHEDULER_ENABLED=true
echo =====================================
echo.

REM Coletar dados sem subir servidor (regra do projeto: HTML estatico)
set "MARKET_SCHEDULER_ENABLED=false"

%PY_CMD% scripts/orquestrador.py --force --no-pause

if errorlevel 1 (
  echo.
  echo ERRO: Orquestrador retornou erro.
)
