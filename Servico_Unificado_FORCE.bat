@echo off
setlocal

cd /d "%~dp0"
title EDI Servico Unificado FORCE

rem Detect Python command
set "PY_CMD="
py -3 -c "import sys" >nul 2>&1
if not errorlevel 1 set "PY_CMD=py -3"
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
echo =====================================
echo.

%PY_CMD% scripts/orquestrador.py --force --no-pause

if errorlevel 1 (
  echo.
  echo ERRO: Orquestrador retornou erro.
)
