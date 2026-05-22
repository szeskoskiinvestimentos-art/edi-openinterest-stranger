@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"
title EDI Servico Unificado

:PARSE_ARGS
if "%~1"=="" goto :PARSE_DONE
if /i "%~1"=="--no-pause" (
  set "EDI_NO_PAUSE=1"
  shift
  goto :PARSE_ARGS
)
if /i "%~1"=="--once" (
  set "EDI_ONCE=1"
  shift
  goto :PARSE_ARGS
)
shift
goto :PARSE_ARGS
:PARSE_DONE

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
if "%MARKET_YAHOO_ENABLED%"=="" set "MARKET_YAHOO_ENABLED=true"
if "%MARKET_YAHOO_MAX_SYMBOLS%"=="" set "MARKET_YAHOO_MAX_SYMBOLS=320"
if "%MARKET_YAHOO_TIMEOUT_MS%"=="" set "MARKET_YAHOO_TIMEOUT_MS=8000"
if "%INVESTING_PORTFOLIO_ENABLED%"=="" set "INVESTING_PORTFOLIO_ENABLED=true"
if "%INVESTING_CALENDAR_ENABLED%"=="" set "INVESTING_CALENDAR_ENABLED=true"
if "%INFOMONEY_DI_ENABLED%"=="" set "INFOMONEY_DI_ENABLED=true"

set "COTACOES_DIR=%~dp0Cotacoes"
if not exist "%COTACOES_DIR%\package.json" (
  echo ERRO: pasta Cotacoes nao encontrada em "%COTACOES_DIR%".
  goto :END
)
set "OPTIONS_UNIFIED_DASHBOARD_DIR=%~dp0dashboard_unificado"
set "AUTO_B3_DIR=%~dp0Auto_B3_System"
for %%I in ("%AUTO_B3_DIR%") do set "AUTO_B3_DIR=%%~fI"
set "LOCKS_DIR=%~dp0service_locks"
set "OPTIONS_LOCK_DIR=%LOCKS_DIR%\\options_run.lock"

if "%OPTIONS_RUN_TIMES%"=="" set "OPTIONS_RUN_TIMES=07:00,08:30,20:00"
if "%OPTIONS_RUN_WEEKDAYS_ONLY%"=="" set "OPTIONS_RUN_WEEKDAYS_ONLY=1"
if "%OPTIONS_LOCK_MAX_AGE_MINUTES%"=="" set "OPTIONS_LOCK_MAX_AGE_MINUTES=240"
if "%WDO_CANDIDATE_CONTRACT_MONTHS%"=="" set "WDO_CANDIDATE_CONTRACT_MONTHS=60"

set "ENABLE_AUTO_GIT_PUSH=true"
set "UNIFIED_GIT_PUSH_HANDLED=true"

if exist "%AUTO_B3_DIR%\\CSV_Indice\\*.csv" set "CSV_INDICE_DIR=%AUTO_B3_DIR%\\CSV_Indice"
if exist "%AUTO_B3_DIR%\\CSV_Dolar\\*.csv" set "CSV_DOLAR_DIR=%AUTO_B3_DIR%\\CSV_Dolar"

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


set "MARKET_ALREADY_RUNNING=0"
set "MARKET_PID="
set "MARKET_STARTED_HERE=0"
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
  set "MARKET_STARTED_HERE=1"
  start "" /b powershell -NoProfile -Command "$env:MARKET_GIT_SYNC_ENABLED='%MARKET_GIT_SYNC_ENABLED%'; $env:MARKET_GIT_SYNC_PUSH='%MARKET_GIT_SYNC_PUSH%'; $env:MARKET_GIT_SYNC_BRANCH='%MARKET_GIT_SYNC_BRANCH%'; $env:MARKET_SERVICE_HOST='%MARKET_SERVICE_HOST%'; $env:MARKET_SERVICE_PORT='%MARKET_SERVICE_PORT%'; $env:MARKET_INTERVAL_MINUTES='%MARKET_INTERVAL_MINUTES%'; $env:INVESTING_PORTFOLIO_INTERVAL_MINUTES='%INVESTING_PORTFOLIO_INTERVAL_MINUTES%'; $env:MARKET_UPDATE_MODE='%MARKET_UPDATE_MODE%'; $env:MARKET_SCHEDULE_MODE='%MARKET_SCHEDULE_MODE%'; $env:MARKET_SCHEDULER_ENABLED='%MARKET_SCHEDULER_ENABLED%'; $env:MARKET_RUN_ON_START='%MARKET_RUN_ON_START%'; $env:MARKET_RETENTION_DAYS='%MARKET_RETENTION_DAYS%'; $env:MARKET_YAHOO_ENABLED='%MARKET_YAHOO_ENABLED%'; $env:MARKET_YAHOO_MAX_SYMBOLS='%MARKET_YAHOO_MAX_SYMBOLS%'; $env:MARKET_YAHOO_TIMEOUT_MS='%MARKET_YAHOO_TIMEOUT_MS%'; $env:INVESTING_PORTFOLIO_ENABLED='%INVESTING_PORTFOLIO_ENABLED%'; $env:INVESTING_CALENDAR_ENABLED='%INVESTING_CALENDAR_ENABLED%'; $env:INFOMONEY_DI_ENABLED='%INFOMONEY_DI_ENABLED%'; $env:OPTIONS_UNIFIED_DASHBOARD_DIR='%OPTIONS_UNIFIED_DASHBOARD_DIR%'; Set-Location '%COTACOES_DIR%'; if (-not (Test-Path -LiteralPath 'node_modules\\.bin\\tsx.cmd')) { npm ci --silent }; npm run -s market:service"
  timeout /t 2 >nul
)

echo.
call :WAIT_MARKET
if errorlevel 1 (
  echo AVISO: market:service nao respondeu em http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/health
) else (
  echo Market service online.
)

call :START_EXIT_WATCHER

if not "%PY_CMD%"=="" (
  echo.
  rem Rodando Opcoes respeitando agendamento na primeira execucao
  echo === Atualizando Opcoes - Python em Paralelo ===
  if exist "%AUTO_B3_DIR%\automacao_dados.py" (
    call :SHOULD_RUN_OPTIONS
    if errorlevel 1 (
      echo Opcoes: nada pendente no horario de abertura - skip.
    ) else (
      call :RUN_OPTIONS_JOB
      if errorlevel 2 (
        echo Opcoes: ja em execucao - lock. Nao vou duplicar.
      )
    )
  ) else (
    start "OPCOES Legacy" powershell -NoProfile -Command "Set-Location '%AUTO_B3_DIR%'; & %PY_CMD% export_v1_data.py; & %PY_CMD% main.py; & %PY_CMD% '%~dp0gerar_controle.py'; Start-Sleep -Seconds 2"
  )
) else (
  echo.
  echo AVISO: Python nao encontrado. Pulei Opcoes.
)

:AFTER_UPDATE

echo.
echo Status: http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/status
echo Update: POST http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/update
echo.

if "%EDI_ONCE%"=="1" goto :END
if not "%PY_CMD%"=="" (
  if exist "%AUTO_B3_DIR%\\automacao_dados.py" (
    goto :OPCOES_LOOP
  )
)

:END
call :SHUTDOWN_MARKET_IF_STARTED
if "%EDI_NO_PAUSE%"=="1" exit /b 0
pause

:WAIT_MARKET
setlocal
set "URL=http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/health"
powershell -NoProfile -Command "try { $u='%URL%'; $deadline=(Get-Date).AddSeconds(120); while((Get-Date) -lt $deadline){ try { $r=Invoke-RestMethod -Method Get -Uri $u -TimeoutSec 2; if($r -and $r.ok -eq $true){ exit 0 } } catch {} Start-Sleep -Seconds 1 } exit 1 } catch { exit 1 }"
endlocal & exit /b %errorlevel%

:OPCOES_LOOP
if "%OPCOES_INTERVAL_SECONDS%"=="" set "OPCOES_INTERVAL_SECONDS=60"
echo.
echo Monitorando agenda de opcoes - Barchart - a cada %OPCOES_INTERVAL_SECONDS%s (só executa quando estiver pendente). Feche esta janela para parar.
echo.
:OPCOES_LOOP_RUN
call :SHOULD_RUN_OPTIONS
if errorlevel 1 (
  rem skip
) else (
  call :RUN_OPTIONS_JOB
  if errorlevel 2 (
    echo AVISO: Opcoes ja em execucao - lock. Pulando este ciclo.
  ) else (
    call :GIT_PUSH_UNIFIED
  )
)
timeout /t %OPCOES_INTERVAL_SECONDS% /nobreak >nul
goto :OPCOES_LOOP_RUN

:GIT_PUSH_UNIFIED
setlocal
git add dashboard_unificado B3_System\dashboard_unificado controle_de_dados.html Cotacoes\dashboard\index.html Cotacoes\dashboard\MERCADO\index.html Cotacoes\dashboard\MERCADO\assets\js Cotacoes\dashboard\MERCADO\assets\data Cotacoes\dashboard\MERCADO\exports >nul 2>&1
git diff --cached --quiet >nul 2>&1
if errorlevel 1 (
  for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "(Get-Date).ToString('yyyy-MM-dd HH:mm')"`) do set "TS=%%i"
  git commit -m "Atualiza dashboard_unificado (auto %TS%)" >nul 2>&1
  powershell -NoProfile -Command "$env:GIT_TERMINAL_PROMPT='0'; $env:GCM_INTERACTIVE='Never'; $p=Start-Process git -ArgumentList @('push','origin','main') -NoNewWindow -PassThru; if(-not $p.WaitForExit(180000)){ try{$p.Kill()}catch{}; exit 2 }; exit $p.ExitCode" >nul 2>&1
  if errorlevel 1 (
    powershell -NoProfile -Command "$env:GIT_TERMINAL_PROMPT='0'; $env:GCM_INTERACTIVE='Never'; $p=Start-Process git -ArgumentList @('pull','--no-rebase','--no-edit','-X','ours','origin','main') -NoNewWindow -PassThru; if(-not $p.WaitForExit(180000)){ try{$p.Kill()}catch{}; exit 2 }; exit $p.ExitCode" >nul 2>&1
    powershell -NoProfile -Command "$env:GIT_TERMINAL_PROMPT='0'; $env:GCM_INTERACTIVE='Never'; $p=Start-Process git -ArgumentList @('push','origin','main') -NoNewWindow -PassThru; if(-not $p.WaitForExit(180000)){ try{$p.Kill()}catch{}; exit 2 }; exit $p.ExitCode" >nul 2>&1
  )
)
endlocal & exit /b 0

:SHUTDOWN_MARKET_IF_STARTED
setlocal
set "URL=http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/shutdown"
powershell -NoProfile -Command ^
  "try { Invoke-RestMethod -Method Post -Uri '%URL%' -TimeoutSec 3 | Out-Null } catch { };" ^
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
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "try { $parent=(Get-CimInstance Win32_Process -Filter \"ProcessId=$PID\").ParentProcessId; $h='%MARKET_SERVICE_HOST%'; $p=%MARKET_SERVICE_PORT%; $url=('http://' + $h + ':' + $p + '/api/market/shutdown'); while(Get-Process -Id $parent -ErrorAction SilentlyContinue){ Start-Sleep -Seconds 1 }; try { Invoke-RestMethod -Method Post -Uri $url -TimeoutSec 3 | Out-Null } catch { }; try { $x=Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue | Select-Object -First 1; if($x){ Stop-Process -Id $x.OwningProcess -Force -ErrorAction SilentlyContinue } } catch { } } catch { }"
exit /b 0

:ACQUIRE_OPTIONS_LOCK
setlocal
if not exist "%LOCKS_DIR%" mkdir "%LOCKS_DIR%" >nul 2>&1
mkdir "%OPTIONS_LOCK_DIR%" >nul 2>&1
if errorlevel 1 (
  endlocal & exit /b 1
)
endlocal & exit /b 0

:RELEASE_OPTIONS_LOCK
setlocal
rmdir "%OPTIONS_LOCK_DIR%" >nul 2>&1
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
  "function ParseDt($s){ if(-not $s){ return $null }; $raw=[string]$s; $raw=$raw.Trim(); if(-not $raw){ return $null }; " ^
  "  if($raw -match '^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$'){ try { return [datetime]::ParseExact($raw,'yyyy-MM-dd HH:mm:ss',[globalization.cultureinfo]::InvariantCulture) } catch { } } " ^
  "  try { return [datetime]::Parse($raw,[globalization.cultureinfo]::InvariantCulture) } catch { try { return [datetime]::Parse($raw) } catch { return $null } } }; " ^
  "function ReadJsonLast($p){ if(-not (Test-Path -LiteralPath $p)){ return $null }; " ^
  "  try { $j=Get-Content -LiteralPath $p -Raw | ConvertFrom-Json; $v=$null; " ^
  "    if($j -and $j.last_updated){ $v=$j.last_updated } " ^
  "    if((-not $v) -and $j -and $j.overview -and $j.overview.last_update){ $v=$j.overview.last_update } " ^
  "    $dt=ParseDt $v; if($dt){ return $dt } " ^
  "  } catch { } return $null }; " ^
  "function ReadMTime($p){ if(-not (Test-Path -LiteralPath $p)){ return $null }; try { return (Get-Item -LiteralPath $p).LastWriteTime } catch { return $null } }; " ^
  "$lw=ReadJsonLast('%WDO_JSON%'); if(-not $lw){ $lw=ReadMTime('%WDO_JSON%') }; " ^
  "$ln=ReadJsonLast('%WIN_JSON%'); if(-not $ln){ $ln=ReadMTime('%WIN_JSON%') }; " ^
  "$aw=ReadJsonLast('%AUTO_WDO_JSON%'); if(-not $aw){ $aw=ReadMTime('%AUTO_WDO_JSON%') }; " ^
  "$an=ReadJsonLast('%AUTO_WIN_JSON%'); if(-not $an){ $an=ReadMTime('%AUTO_WIN_JSON%') }; " ^
  "$last=$lw; foreach($x in @($ln,$aw,$an)){ if($x -and ((-not $last) -or $x -gt $last)){ $last=$x } }; " ^
  "$today=$now.Date; " ^
  "if((-not $last) -or ($last.Date -ne $today)){ exit 0 }; " ^
  "$slots=@(); foreach($t in $times){ try { $ts=[TimeSpan]::Parse($t); $d=$today.Add($ts); if($d -le $now){ $slots += $d } } catch {} }; " ^
  "if(-not $slots -or $slots.Count -eq 0){ exit 1 }; " ^
  "$due=($slots | Sort-Object | Select-Object -Last 1); " ^
  "if($last -and $last.Date -eq $today -and $last -ge $due){ exit 1 } else { exit 0 }"
endlocal & exit /b %errorlevel%

:RUN_OPTIONS_JOB
setlocal
if "%PY_CMD%"=="" (
  endlocal & exit /b 1
)
if not exist "%AUTO_B3_DIR%\automacao_dados.py" (
  endlocal & exit /b 1
)
powershell -NoProfile -Command ^
  "$lock='%OPTIONS_LOCK_DIR%'; $lockDir=(Split-Path -Parent $lock);" ^
  "New-Item -ItemType Directory -Force -Path $lockDir | Out-Null;" ^
  "$pidFile=(Join-Path $lock 'pid.txt');" ^
  "$maxAge=[int]0; try { $maxAge=[int]($env:OPTIONS_LOCK_MAX_AGE_MINUTES) } catch { $maxAge=240 };" ^
  "if(Test-Path -LiteralPath $lock){" ^
  "  $stale=$false;" ^
  "  if(Test-Path -LiteralPath $pidFile){" ^
  "    try { $pid=[int]((Get-Content -LiteralPath $pidFile -TotalCount 1) -as [string]); $p=Get-Process -Id $pid -ErrorAction SilentlyContinue; if(-not $p){ $stale=$true } } catch { $stale=$true }" ^
  "  }" ^
  "  if(-not $stale){" ^
  "    try { $age=(New-TimeSpan -Start (Get-Item -LiteralPath $lock).LastWriteTime -End (Get-Date)).TotalMinutes } catch { $age=0 };" ^
  "    if($maxAge -gt 0 -and $age -gt $maxAge){ $stale=$true }" ^
  "  }" ^
  "  if($stale){ try { Remove-Item -LiteralPath $lock -Recurse -Force -ErrorAction SilentlyContinue } catch { } }" ^
  "};" ^
  "try { New-Item -ItemType Directory -Path $lock -ErrorAction Stop | Out-Null } catch { exit 2 };" ^
  "try { Set-Content -LiteralPath $pidFile -Value ([string]$PID) -Encoding ascii -Force } catch { };" ^
  "try {" ^
  "  try { Remove-Item -Recurse -Force -ErrorAction SilentlyContinue (Join-Path $env:APPDATA 'undetected_chromedriver') } catch { };" ^
  "  Set-Location '%AUTO_B3_DIR%';" ^
  "  & %PY_CMD% automacao_dados.py;" ^
  "  & %PY_CMD% config.py;" ^
  "  & %PY_CMD% '%~dp0gerar_controle.py';" ^
  "  Start-Sleep -Seconds 1;" ^
  "} finally { Remove-Item -LiteralPath $lock -Recurse -Force -ErrorAction SilentlyContinue }"
endlocal & exit /b %errorlevel%

