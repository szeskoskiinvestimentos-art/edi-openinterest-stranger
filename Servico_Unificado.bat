@echo off
setlocal

cd /d "%~dp0"
title EDI Servico Unificado

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

rem Parse arguments
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

echo.
echo ===============================
echo  EDI - Servico Unificado
echo  (Python Orquestrador)
echo ===============================
echo.

%PY_CMD% scripts/orquestrador.py%ARGS%

if errorlevel 1 (
  echo.
  echo AVISO: Orquestrador retornou erro.
)

if not "%ARGS%"=="%ARGS:--no-pause=%" goto :END
pause
:END
