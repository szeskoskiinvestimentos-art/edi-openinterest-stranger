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
set "OPTIONS_UNIFIED_DASHBOARD_DIR=%~dp0dashboard_unificado"

set "ENABLE_AUTO_GIT_PUSH=true"

if "%CSV_INDICE_DIR%"=="" (
  if exist "%~dp0CSV_Indice\\*.csv" set "CSV_INDICE_DIR=%~dp0CSV_Indice"
)
if "%CSV_INDICE_DIR%"=="" (
  if exist "%USERPROFILE%\\OneDrive - 12s1y\\Edi_Sistamas\\Sistema\\B3_System\\CSV_Indice\\*.csv" set "CSV_INDICE_DIR=%USERPROFILE%\\OneDrive - 12s1y\\Edi_Sistamas\\Sistema\\B3_System\\CSV_Indice"
)
if "%CSV_INDICE_DIR%"=="" (
  if exist "%USERPROFILE%\\OneDrive\\Edi_Sistamas\\Sistema\\B3_System\\CSV_Indice\\*.csv" set "CSV_INDICE_DIR=%USERPROFILE%\\OneDrive\\Edi_Sistamas\\Sistema\\B3_System\\CSV_Indice"
)
if "%CSV_INDICE_DIR%"=="" (
  if exist "%USERPROFILE%\\OneDrive - 12s1y (1)\\Edi_Sistamas\\Sistema\\B3_System\\CSV_Indice\\*.csv" set "CSV_INDICE_DIR=%USERPROFILE%\\OneDrive - 12s1y (1)\\Edi_Sistamas\\Sistema\\B3_System\\CSV_Indice"
)

set "PY_CMD="
py -3 -c "import sys" >nul 2>&1
if not errorlevel 1 set "PY_CMD=py -3"
if "%PY_CMD%"=="" (
  python -c "import sys" >nul 2>&1
  if not errorlevel 1 set "PY_CMD=python"
)

if not "%PY_CMD%"=="" (
  echo.
  echo === Atualizando Opcoes - Python ===
  set "AUTO_B3_DIR=%~dp0..\\Auto_B3_System"
  if exist "%AUTO_B3_DIR%\\automacao_dados.py" (
    echo Rodando coleta Barchart - Auto_B3_System...
    pushd "%AUTO_B3_DIR%"
    %PY_CMD% automacao_dados.py
    if errorlevel 1 echo AVISO: automacao_dados.py falhou.
    %PY_CMD% config.py
    if errorlevel 1 echo AVISO: config.py - Auto_B3_System falhou.
    popd
    call :SYNC_UNIFIED_FROM_AUTO
  ) else (
    %PY_CMD% export_v1_data.py
    if errorlevel 1 echo AVISO: export_v1_data.py falhou.
    %PY_CMD% main.py
    if errorlevel 1 echo AVISO: main.py falhou.
  )
) else (
  echo.
  echo AVISO: Python nao encontrado. Pulei Opcoes.
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
  start "COTACOES market:service" /D "%COTACOES_DIR%" "%ComSpec%" /k "set MARKET_GIT_SYNC_ENABLED=%MARKET_GIT_SYNC_ENABLED%^& set MARKET_GIT_SYNC_PUSH=%MARKET_GIT_SYNC_PUSH%^& set MARKET_GIT_SYNC_BRANCH=%MARKET_GIT_SYNC_BRANCH%^& set MARKET_SERVICE_HOST=%MARKET_SERVICE_HOST%^& set MARKET_SERVICE_PORT=%MARKET_SERVICE_PORT%^& set MARKET_INTERVAL_MINUTES=%MARKET_INTERVAL_MINUTES%^& set INVESTING_PORTFOLIO_INTERVAL_MINUTES=%INVESTING_PORTFOLIO_INTERVAL_MINUTES%^& set MARKET_UPDATE_MODE=%MARKET_UPDATE_MODE%^& set MARKET_SCHEDULE_MODE=%MARKET_SCHEDULE_MODE%^& set MARKET_RETENTION_DAYS=%MARKET_RETENTION_DAYS%^& set OPTIONS_UNIFIED_DASHBOARD_DIR=%OPTIONS_UNIFIED_DASHBOARD_DIR%^& if not exist node_modules\\.bin\\tsx.cmd (npm ci --silent)^& npm run -s market:service"
  timeout /t 3 >nul
)

echo.
call :WAIT_MARKET
if errorlevel 1 (
  echo ERRO: market:service nao respondeu em http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/health
  goto :END
)

echo Forcando update (bypass cooldown)...
powershell -NoProfile -Command "try { $u='http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/update'; $b=@{ reason='schedule' } | ConvertTo-Json -Compress; Invoke-RestMethod -Method Post -Uri $u -ContentType 'application/json' -Body $b | Out-String | Write-Host } catch { Write-Host ('ERRO: ' + $_.Exception.Message); exit 1 }"

echo.
echo Status: http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/status
echo.

if exist "%~dp0controle_de_dados.html" start "" "%~dp0controle_de_dados.html"

:END
if "%EDI_NO_PAUSE%"=="1" exit /b 0
pause

:WAIT_MARKET
setlocal
set "URL=http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/health"
powershell -NoProfile -Command "try { $u='%URL%'; $deadline=(Get-Date).AddSeconds(120); while((Get-Date) -lt $deadline){ try { $r=Invoke-RestMethod -Method Get -Uri $u -TimeoutSec 2; if($r -and $r.ok -eq $true){ exit 0 } } catch {} Start-Sleep -Seconds 1 } exit 1 } catch { exit 1 }"
endlocal & exit /b %errorlevel%

:SYNC_UNIFIED_FROM_AUTO
setlocal
set "AUTO_B3_DIR=%~dp0..\\Auto_B3_System"
set "SRC_WDO=%AUTO_B3_DIR%\\dashboard_unificado\\WDO\\assets\\data"
set "SRC_WIN=%AUTO_B3_DIR%\\dashboard_unificado\\WIN\\assets\\data"
set "DST_WDO=%~dp0dashboard_unificado\\WDO\\assets\\data"
set "DST_WIN=%~dp0dashboard_unificado\\WIN\\assets\\data"
if exist "%SRC_WDO%\\market_data.js" (
  if not exist "%DST_WDO%" mkdir "%DST_WDO%" >nul 2>&1
  copy /Y "%SRC_WDO%\\market_data.js" "%DST_WDO%\\market_data.js" >nul 2>&1
)
if exist "%SRC_WDO%\\market_data.json" (
  if not exist "%DST_WDO%" mkdir "%DST_WDO%" >nul 2>&1
  copy /Y "%SRC_WDO%\\market_data.json" "%DST_WDO%\\market_data.json" >nul 2>&1
)
if exist "%SRC_WIN%\\market_data.js" (
  if not exist "%DST_WIN%" mkdir "%DST_WIN%" >nul 2>&1
  copy /Y "%SRC_WIN%\\market_data.js" "%DST_WIN%\\market_data.js" >nul 2>&1
)
if exist "%SRC_WIN%\\market_data.json" (
  if not exist "%DST_WIN%" mkdir "%DST_WIN%" >nul 2>&1
  copy /Y "%SRC_WIN%\\market_data.json" "%DST_WIN%\\market_data.json" >nul 2>&1
)
endlocal & exit /b 0
