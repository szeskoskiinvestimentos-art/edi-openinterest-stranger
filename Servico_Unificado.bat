@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"
title EDI Servico Unificado

if /i "%~1"=="--no-pause" (
  set "EDI_NO_PAUSE=1"
  shift
)
if /i "%~1"=="--once" (
  set "EDI_ONCE=1"
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
set "AUTO_B3_DIR=%~dp0..\\Auto_B3_System"
for %%I in ("%AUTO_B3_DIR%") do set "AUTO_B3_DIR=%%~fI"

if "%OPTIONS_RUN_TIMES%"=="" set "OPTIONS_RUN_TIMES=08:30,09:30,10:30,11:30,12:30,13:30,14:30,15:30,16:30,17:30"
if "%OPTIONS_RUN_WEEKDAYS_ONLY%"=="" set "OPTIONS_RUN_WEEKDAYS_ONLY=1"

set "ENABLE_AUTO_GIT_PUSH=false"

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
  call :SHOULD_RUN_OPTIONS
  if errorlevel 1 (
    echo Opcoes: fora da programacao ou ja executado. Pulando nesta inicializacao.
  ) else (
    echo === Atualizando Opcoes - Python ===
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
  )
) else (
  echo.
  echo AVISO: Python nao encontrado. Pulei Opcoes.
)

set "MARKET_ALREADY_RUNNING=0"
set "MARKET_PID="
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "$p=(Get-NetTCPConnection -State Listen -LocalPort %MARKET_SERVICE_PORT% -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess; if($p){$p}"`) do set "MARKET_PID=%%i"

powershell -NoProfile -Command "$x=Get-NetTCPConnection -State Listen -LocalPort %MARKET_SERVICE_PORT% -ErrorAction SilentlyContinue | Select-Object -First 1; if($x){exit 0}else{exit 1}" >nul 2>&1
if not errorlevel 1 set "MARKET_ALREADY_RUNNING=1"
if "%MARKET_ALREADY_RUNNING%"=="1" (
  powershell -NoProfile -Command "try { $r=Invoke-RestMethod -Method Get -Uri 'http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/health' -TimeoutSec 2; if($r -and $r.ok -eq $true){ exit 0 } exit 2 } catch { exit 2 }" >nul 2>&1
  if errorlevel 2 (
    if not "%MARKET_PID%"=="" (
      echo AVISO: Porta %MARKET_SERVICE_PORT% esta ocupada, mas o healthcheck falhou. Encerrando PID=%MARKET_PID%...
      taskkill /PID %MARKET_PID% /T /F >nul 2>&1
      timeout /t 1 >nul
    )
    set "MARKET_ALREADY_RUNNING=0"
  )
)
if "%MARKET_ALREADY_RUNNING%"=="0" (
  netstat -ano | findstr ":%MARKET_SERVICE_PORT%" | findstr /I "LISTENING OUVINDO" >nul 2>&1
  if not errorlevel 1 set "MARKET_ALREADY_RUNNING=1"
)

echo.
echo ===============================
echo  EDI - Servico Unificado
echo ===============================
echo Host: %MARKET_SERVICE_HOST%
echo Porta: %MARKET_SERVICE_PORT%
echo.

if "%MARKET_ALREADY_RUNNING%"=="1" (
  echo Market service ja esta rodando.
) else (
  echo Iniciando market:service em nova janela...
  set "MARKET_WINDOW_CMD=set MARKET_GIT_SYNC_ENABLED=%MARKET_GIT_SYNC_ENABLED%& set MARKET_GIT_SYNC_PUSH=%MARKET_GIT_SYNC_PUSH%& set MARKET_GIT_SYNC_BRANCH=%MARKET_GIT_SYNC_BRANCH%& set MARKET_SERVICE_HOST=%MARKET_SERVICE_HOST%& set MARKET_SERVICE_PORT=%MARKET_SERVICE_PORT%& set MARKET_INTERVAL_MINUTES=%MARKET_INTERVAL_MINUTES%& set INVESTING_PORTFOLIO_INTERVAL_MINUTES=%INVESTING_PORTFOLIO_INTERVAL_MINUTES%& set MARKET_UPDATE_MODE=%MARKET_UPDATE_MODE%& set MARKET_SCHEDULE_MODE=%MARKET_SCHEDULE_MODE%& set MARKET_RETENTION_DAYS=%MARKET_RETENTION_DAYS%& set OPTIONS_UNIFIED_DASHBOARD_DIR=%OPTIONS_UNIFIED_DASHBOARD_DIR%& cd /d ""%COTACOES_DIR%"" & if not exist node_modules\\.bin\\tsx.cmd npm ci --silent & npm run -s market:service"
  start "COTACOES market:service" cmd.exe /k "%MARKET_WINDOW_CMD%"
  timeout /t 2 >nul
)

echo.
call :WAIT_MARKET
if errorlevel 1 (
  echo AVISO: market:service nao respondeu em http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/health
  goto :AFTER_UPDATE
)
start "COTACOES monitor" powershell -NoProfile -NoExit -Command "$base='http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%'; while($true){ try { $h=Invoke-RestMethod -Method Get -Uri ($base+'/api/market/health') -TimeoutSec 2; $last=$null; if($h.state -and $h.state.last){$last=$h.state.last.finishedAt}; $run=($h.state -and $h.state.running); $next=$null; if($h.schedule){$next=$h.schedule.nextDueAt}; Write-Host ('['+(Get-Date).ToString('HH:mm:ss')+'] running='+$run+' last='+($last -as [string])+' next='+($next -as [string])); } catch { Write-Host ('['+(Get-Date).ToString('HH:mm:ss')+'] health ERROR'); } Start-Sleep -Seconds 5 }"
echo Disparando update (manual)...
powershell -NoProfile -Command "try { $u='http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/update'; $b=@{ reason='manual' } | ConvertTo-Json -Compress; Invoke-RestMethod -Method Post -Uri $u -ContentType 'application/json' -Body $b | Out-String | Write-Host } catch { Write-Host ('AVISO: ' + $_.Exception.Message) }"

:AFTER_UPDATE
if exist "%~dp0controle_de_dados.html" start "" "%~dp0controle_de_dados.html"
if exist "%COTACOES_DIR%\dashboard\index.html" start "" "%COTACOES_DIR%\dashboard\index.html"

echo.
echo Status: http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/status
echo Update: POST http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/update
echo.

if "%EDI_ONCE%"=="1" goto :END
if not "%PY_CMD%"=="" (
  if exist "%~dp0..\\Auto_B3_System\\automacao_dados.py" (
    goto :OPCOES_LOOP
  )
)

:END
if "%EDI_NO_PAUSE%"=="1" exit /b 0
pause

:WAIT_MARKET
setlocal
set "URL=http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/health"
powershell -NoProfile -Command "try { $u='%URL%'; $deadline=(Get-Date).AddSeconds(120); while((Get-Date) -lt $deadline){ try { $r=Invoke-RestMethod -Method Get -Uri $u -TimeoutSec 2; if($r -and $r.ok -eq $true){ exit 0 } } catch {} Start-Sleep -Seconds 1 } exit 1 } catch { exit 1 }"
endlocal & exit /b %errorlevel%

:OPCOES_LOOP
if "%OPCOES_INTERVAL_SECONDS%"=="" set "OPCOES_INTERVAL_SECONDS=900"
echo.
echo Mantendo rotinas de opcoes - Barchart - ativas a cada %OPCOES_INTERVAL_SECONDS%s. Feche esta janela para parar.
echo.
:OPCOES_LOOP_RUN
call :SHOULD_RUN_OPTIONS
if errorlevel 1 (
  rem skip
) else (
  pushd "%AUTO_B3_DIR%"
  %PY_CMD% automacao_dados.py
  %PY_CMD% config.py
  popd
  call :SYNC_UNIFIED_FROM_AUTO
  call :GIT_PUSH_UNIFIED
)
timeout /t %OPCOES_INTERVAL_SECONDS% /nobreak >nul
goto :OPCOES_LOOP_RUN

:GIT_PUSH_UNIFIED
setlocal
git add dashboard_unificado controle_de_dados.html >nul 2>&1
git diff --cached --quiet >nul 2>&1
if errorlevel 1 (
  for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "(Get-Date).ToString('yyyy-MM-dd HH:mm')"`) do set "TS=%%i"
  git commit -m "Atualiza dashboard_unificado (auto %TS%)" >nul 2>&1
  git push origin main >nul 2>&1
  if errorlevel 1 (
    git pull --no-rebase --no-edit -X ours origin main >nul 2>&1
    git push origin main >nul 2>&1
  )
)
endlocal & exit /b 0

:SHOULD_RUN_OPTIONS
setlocal
set "WDO_JSON=%~dp0dashboard_unificado\WDO\assets\data\market_data.json"
set "WIN_JSON=%~dp0dashboard_unificado\WIN\assets\data\market_data.json"
set "AUTO_WDO_JSON=%AUTO_B3_DIR%\dashboard_unificado\WDO\assets\data\market_data.json"
set "AUTO_WIN_JSON=%AUTO_B3_DIR%\dashboard_unificado\WIN\assets\data\market_data.json"
powershell -NoProfile -Command ^
  "$now=Get-Date; " ^
  "$times=($env:OPTIONS_RUN_TIMES -split ',') | ForEach-Object { $_.Trim() } | Where-Object { $_ }; " ^
  "$weekdaysOnly=($env:OPTIONS_RUN_WEEKDAYS_ONLY -eq '1' -or $env:OPTIONS_RUN_WEEKDAYS_ONLY -eq 'true'); " ^
  "if($weekdaysOnly -and ($now.DayOfWeek -eq 'Saturday' -or $now.DayOfWeek -eq 'Sunday')){ exit 1 }; " ^
  "function ParseDt($s){ if(-not $s){ return $null }; try { return [datetime]::Parse($s,[globalization.cultureinfo]::InvariantCulture) } catch { try { return [datetime]::Parse($s) } catch { return $null } } }; " ^
  "function ReadLast($p){ if(-not (Test-Path -LiteralPath $p)){ return $null }; try { $j=Get-Content -LiteralPath $p -Raw | ConvertFrom-Json; $v=$j.last_updated; if(-not $v -and $j.overview){ $v=$j.overview.last_update }; if(-not $v){ return $null }; return (ParseDt ([string]$v)) } catch { return $null } }; " ^
  "$lw=ReadLast('%WDO_JSON%'); $ln=ReadLast('%WIN_JSON%'); $aw=ReadLast('%AUTO_WDO_JSON%'); $an=ReadLast('%AUTO_WIN_JSON%'); " ^
  "$last=$lw; foreach($x in @($ln,$aw,$an)){ if($x -and ((-not $last) -or $x -gt $last)){ $last=$x } }; " ^
  "$today=$now.Date; " ^
  "$slots=@(); foreach($t in $times){ try { $ts=[TimeSpan]::Parse($t); $d=$today.Add($ts); if($d -le $now){ $slots += $d } } catch {} }; " ^
  "if(-not $slots -or $slots.Count -eq 0){ exit 1 }; " ^
  "$due=($slots | Sort-Object | Select-Object -Last 1); " ^
  "if($last -and $last.Date -eq $today -and $last -ge $due){ exit 1 } else { exit 0 }"
endlocal & exit /b %errorlevel%

:SYNC_UNIFIED_FROM_AUTO
setlocal
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
