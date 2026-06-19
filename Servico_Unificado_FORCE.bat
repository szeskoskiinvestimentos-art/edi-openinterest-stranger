@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"
title EDI Servico Unificado FORCE

:PARSE_ARGS
if "%~1"=="" goto :PARSE_DONE
if /i "%~1"=="--no-pause" (
  set "EDI_NO_PAUSE=1"
  shift
  goto :PARSE_ARGS
)
if /i "%~1"=="--git-dry-run" (
  set "EDI_GIT_DRY_RUN=1"
  shift
  goto :PARSE_ARGS
)
shift
goto :PARSE_ARGS
:PARSE_DONE
if "%EDI_NO_PAUSE%"=="" set "EDI_NO_PAUSE=1"

set "MARKET_GIT_SYNC_ENABLED=true"
set "MARKET_GIT_SYNC_PUSH=true"
if "%MARKET_GIT_SYNC_BRANCH%"=="" set "MARKET_GIT_SYNC_BRANCH=main"
if not "%EDI_ARTIFACTS_BRANCH%"=="" (
  set "MARKET_GIT_SYNC_ENABLED=false"
  set "MARKET_GIT_SYNC_PUSH=false"
)
if "%EDI_GIT_DRY_RUN%"=="1" (
  set "MARKET_GIT_SYNC_ENABLED=false"
  set "MARKET_GIT_SYNC_PUSH=false"
)

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
if "%MARKET_SCHEDULER_ENABLED%"=="" set "MARKET_SCHEDULER_ENABLED=false"
if "%DOTENV_OVERRIDE%"=="" set "DOTENV_OVERRIDE=false"

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
if "%OPTIONS_LOCK_MAX_AGE_MINUTES%"=="" set "OPTIONS_LOCK_MAX_AGE_MINUTES=240"
if "%WDO_CANDIDATE_CONTRACT_MONTHS%"=="" set "WDO_CANDIDATE_CONTRACT_MONTHS=60"

set "ENABLE_AUTO_GIT_PUSH=true"
set "UNIFIED_GIT_PUSH_HANDLED=true"

if exist "%AUTO_B3_DIR%\\CSV_Indice\\*.csv" set "CSV_INDICE_DIR=%AUTO_B3_DIR%\\CSV_Indice"
if exist "%AUTO_B3_DIR%\\CSV_Dolar\\*.csv" set "CSV_DOLAR_DIR=%AUTO_B3_DIR%\\CSV_Dolar"

if "%CSV_INDICE_DIR%"=="" (
  if exist "%~dp0CSV_Indice\\*.csv" set "CSV_INDICE_DIR=%~dp0CSV_Indice"
)

set "PY_CMD="
py -3 -c "import sys" >nul 2>&1
if not errorlevel 1 set "PY_CMD=py -3"
if "%PY_CMD%"=="" (
  python -c "import sys" >nul 2>&1
  if not errorlevel 1 set "PY_CMD=python"
)


set "MARKET_ALREADY_RUNNING=0"
powershell -NoProfile -Command "$p=(Get-NetTCPConnection -State Listen -LocalPort %MARKET_SERVICE_PORT% -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess; if($p){$p}" > "%TEMP%\edi_market_pid.txt" 2>nul
set "MARKET_PID="
for /f "usebackq delims=" %%i in ("%TEMP%\edi_market_pid.txt") do set "MARKET_PID=%%i"

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
echo =====================================
echo  EDI - Servico Unificado FORCE
echo =====================================
echo Host: %MARKET_SERVICE_HOST%
echo Porta: %MARKET_SERVICE_PORT%
echo.

if "%MARKET_ALREADY_RUNNING%"=="1" (
  powershell -NoProfile -Command "try { $u='http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/status'; $r=Invoke-RestMethod -Method Get -Uri $u -TimeoutSec 2; $s=$null; if($r -and $r.state -and $r.state.last -and $r.state.last.summary){ $s=$r.state.last.summary }; if($s -and (($s.portfolio -and $s.portfolio.enabled -eq $false) -or ($s.di -and $s.di.enabled -eq $false) -or ($s.calendar -and $s.calendar.enabled -eq $false))){ exit 2 } exit 0 } catch { exit 0 }" >nul 2>&1
  if errorlevel 2 (
    echo AVISO: market:service esta rodando, mas esta com modulos de download desativados. Reiniciando para aplicar variaveis...
    call :SHUTDOWN_MARKET_FORCE
    set "MARKET_ALREADY_RUNNING=0"
    timeout /t 1 >nul
  )
)

if "%MARKET_ALREADY_RUNNING%"=="0" (
  echo Market service nao esta rodando. Iniciando em nova janela...
  start "" /b powershell -NoProfile -Command "$env:DOTENV_OVERRIDE='%DOTENV_OVERRIDE%'; $env:MARKET_GIT_SYNC_ENABLED='%MARKET_GIT_SYNC_ENABLED%'; $env:MARKET_GIT_SYNC_PUSH='%MARKET_GIT_SYNC_PUSH%'; $env:MARKET_GIT_SYNC_BRANCH='%MARKET_GIT_SYNC_BRANCH%'; $env:MARKET_SERVICE_HOST='%MARKET_SERVICE_HOST%'; $env:MARKET_SERVICE_PORT='%MARKET_SERVICE_PORT%'; $env:MARKET_INTERVAL_MINUTES='%MARKET_INTERVAL_MINUTES%'; $env:INVESTING_PORTFOLIO_INTERVAL_MINUTES='%INVESTING_PORTFOLIO_INTERVAL_MINUTES%'; $env:MARKET_UPDATE_MODE='%MARKET_UPDATE_MODE%'; $env:MARKET_SCHEDULE_MODE='%MARKET_SCHEDULE_MODE%'; $env:MARKET_SCHEDULER_ENABLED='%MARKET_SCHEDULER_ENABLED%'; $env:MARKET_RUN_ON_START='%MARKET_RUN_ON_START%'; $env:MARKET_RETENTION_DAYS='%MARKET_RETENTION_DAYS%'; $env:MARKET_YAHOO_ENABLED='%MARKET_YAHOO_ENABLED%'; $env:MARKET_YAHOO_MAX_SYMBOLS='%MARKET_YAHOO_MAX_SYMBOLS%'; $env:MARKET_YAHOO_TIMEOUT_MS='%MARKET_YAHOO_TIMEOUT_MS%'; $env:INVESTING_PORTFOLIO_ENABLED='%INVESTING_PORTFOLIO_ENABLED%'; $env:INVESTING_CALENDAR_ENABLED='%INVESTING_CALENDAR_ENABLED%'; $env:INFOMONEY_DI_ENABLED='%INFOMONEY_DI_ENABLED%'; $env:OPTIONS_UNIFIED_DASHBOARD_DIR='%OPTIONS_UNIFIED_DASHBOARD_DIR%'; Set-Location '%COTACOES_DIR%'; if (-not (Test-Path -LiteralPath 'node_modules\\.bin\\tsx.cmd')) { npm ci --silent }; npm run -s market:service"
  timeout /t 3 >nul
)

echo.
call :WAIT_MARKET
if errorlevel 1 (
  echo ERRO: market:service nao respondeu em http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/health
  goto :END
)

call :START_EXIT_WATCHER

echo Forcando update (bypass cooldown)...
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "(Get-Date).ToUniversalTime().ToString('o')"`) do set "MARKET_FORCE_REQUESTED_AT_UTC=%%i"
powershell -NoProfile -Command "try { $u='http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/update'; $b=@{ reason='force' } | ConvertTo-Json -Compress; Invoke-RestMethod -Method Post -Uri $u -ContentType 'application/json' -Body $b | Out-String | Write-Host } catch { $m=$_.Exception.Message; if($m -match '409'){ Write-Host 'AVISO: update ja esta em andamento (409).'; exit 0 } Write-Host ('ERRO: ' + $m); exit 1 }"

echo.
echo Status: http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/status
echo.

if not "%PY_CMD%"=="" (
  echo.
  echo === Atualizando Opcoes - Python 1x ===
  call :RUN_OPTIONS_JOB_FORCE
) else (
  echo.
  echo AVISO: Python nao encontrado. Pulei Opcoes.
)

echo.
call :WAIT_MARKET_UPDATE
if errorlevel 1 (
  echo AVISO: timeout aguardando final da atualizacao de cotacoes.
)

call :GIT_PUSH_UNIFIED
set "UNIFIED_GIT_RC=%errorlevel%"
call :SHUTDOWN_MARKET_FORCE
if not "%UNIFIED_GIT_RC%"=="0" exit /b %UNIFIED_GIT_RC%

:END
if "%EDI_NO_PAUSE%"=="1" exit /b 0
pause

:WAIT_MARKET
setlocal
set "URL=http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/health"
powershell -NoProfile -Command "try { $u='%URL%'; $deadline=(Get-Date).AddSeconds(120); while((Get-Date) -lt $deadline){ try { $r=Invoke-RestMethod -Method Get -Uri $u -TimeoutSec 2; if($r -and $r.ok -eq $true){ exit 0 } } catch {} Start-Sleep -Seconds 1 } exit 1 } catch { exit 1 }"
endlocal & exit /b %errorlevel%

:WAIT_MARKET_UPDATE
setlocal
set "URL=http://%MARKET_SERVICE_HOST%:%MARKET_SERVICE_PORT%/api/market/status"
powershell -NoProfile -Command "try { $u='%URL%'; $needGit=($env:MARKET_GIT_SYNC_ENABLED -eq 'true' -or $env:MARKET_GIT_SYNC_ENABLED -eq '1'); $dry=($env:EDI_GIT_DRY_RUN -eq '1' -or $env:EDI_GIT_DRY_RUN -eq 'true'); $start=Get-Date; $req=$null; try { $req=[DateTime]::Parse([string]$env:MARKET_FORCE_REQUESTED_AT_UTC) } catch { $req=$null }; if(-not $req){ $req=$start }; $reqUtc=$req.ToUniversalTime().AddSeconds(-15); $deadline=$start.AddMinutes(15); while((Get-Date) -lt $deadline){ try { $r=Invoke-RestMethod -Method Get -Uri $u -TimeoutSec 2 } catch { $r=$null }; if($r -and $r.ok -eq $true -and $r.state){ if($r.state.running -eq $true){ Start-Sleep -Seconds 2; continue }; $last=$r.state.last; if($last){ $reason=[string]$last.reason; if(-not $reason -or $reason -eq 'force'){ $ref=$null; if($last.startedAt){ try { $ref=[DateTime]::Parse([string]$last.startedAt) } catch { $ref=$null } }; if((-not $ref) -and $last.finishedAt){ try { $ref=[DateTime]::Parse([string]$last.finishedAt) } catch { $ref=$null } }; if($ref -and $ref.ToUniversalTime() -ge $reqUtc){ if($dry -or -not $needGit){ exit 0 }; $lp=[string]$last.logPath; if($lp -and (Test-Path -LiteralPath $lp)){ $tail=Get-Content -LiteralPath $lp -Tail 250 -ErrorAction SilentlyContinue; if($tail -match '^GIT_SYNC status='){ exit 0 } } } } } }; Start-Sleep -Seconds 2 }; exit 1 } catch { exit 1 }"
endlocal & exit /b %errorlevel%

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

:GIT_PUSH_UNIFIED
setlocal
if /i not "%EDI_GIT_PUSH_ENABLED%"=="1" (
  endlocal & exit /b 0
)
set "TARGET_BRANCH=%MARKET_GIT_SYNC_BRANCH%"
if "%TARGET_BRANCH%"=="" set "TARGET_BRANCH=main"
if not "%EDI_ARTIFACTS_BRANCH%"=="" set "TARGET_BRANCH=%EDI_ARTIFACTS_BRANCH%"

echo.
echo === GIT PUSH (unificado) ===
echo Branch alvo: %TARGET_BRANCH%

set "CUR_BRANCH="
for /f "usebackq delims=" %%i in (`git rev-parse --abbrev-ref HEAD 2^>nul`) do set "CUR_BRANCH=%%i"

if "%EDI_GIT_DRY_RUN%"=="1" (
  echo.
  echo === GIT DRY-RUN ===
  echo Branch atual: %CUR_BRANCH%
  echo Branch alvo:  %TARGET_BRANCH%
  echo.
  git status --porcelain -- dashboard_unificado B3_System\dashboard_unificado controle_de_dados.html Cotacoes\dashboard\index.html Cotacoes\dashboard\MERCADO\index.html Cotacoes\dashboard\MERCADO\assets\js Cotacoes\dashboard\MERCADO\assets\data Cotacoes\dashboard\MERCADO\exports Cotacoes\tools\market Cotacoes\package.json
  echo.
  git diff --stat -- dashboard_unificado B3_System\dashboard_unificado controle_de_dados.html Cotacoes\dashboard\index.html Cotacoes\dashboard\MERCADO\index.html Cotacoes\dashboard\MERCADO\assets\js Cotacoes\dashboard\MERCADO\assets\data Cotacoes\dashboard\MERCADO\exports Cotacoes\tools\market Cotacoes\package.json
  echo.
  endlocal & exit /b 0
)

if "%CUR_BRANCH%"=="" (
  echo AVISO: Git indisponivel (fora de um repo?). Pulando commit/push.
  endlocal & exit /b 0
)

if /i not "%CUR_BRANCH%"=="%TARGET_BRANCH%" (
  echo ERRO: Branch atual (%CUR_BRANCH%) difere do branch alvo (%TARGET_BRANCH%). Nao farei checkout automatico.
  echo Dica: troque manualmente para %TARGET_BRANCH% e rode novamente.
  endlocal & exit /b 1
)

git fetch origin %TARGET_BRANCH% >nul 2>&1
set "AHEAD=0"
set "BEHIND=0"
for /f "tokens=1,2" %%a in ('git rev-list --left-right --count HEAD...origin/%TARGET_BRANCH% 2^>nul') do (
  set "AHEAD=%%a"
  set "BEHIND=%%b"
)
if not "%BEHIND%"=="0" (
  echo ERRO: Branch local esta %BEHIND% commit(s) atras de origin/%TARGET_BRANCH%. Abortando push para evitar regressao.
  endlocal & exit /b 1
)

if "%EDI_GIT_VALIDATE_STRICT%"=="" set "EDI_GIT_VALIDATE_STRICT=1"
if "%EDI_GIT_VALIDATE_STRICT%"=="1" (
  where npm >nul 2>&1
  if not errorlevel 1 (
    npm -C "%~dp0Cotacoes" run -s market:validate:strict
    if errorlevel 1 (
      echo ERRO: market:validate:strict falhou. Abortando commit/push.
      if not "%CUR_BRANCH%"=="" if /i not "%CUR_BRANCH%"=="%TARGET_BRANCH%" git checkout %CUR_BRANCH% >nul 2>&1
      endlocal & exit /b 1
    )
  )
)

git add dashboard_unificado B3_System\dashboard_unificado controle_de_dados.html Cotacoes\dashboard\index.html Cotacoes\dashboard\MERCADO\index.html Cotacoes\dashboard\MERCADO\assets\js Cotacoes\dashboard\MERCADO\assets\data Cotacoes\dashboard\MERCADO\exports Cotacoes\tools\market Cotacoes\package.json >nul 2>&1
set "GIT_RC=0"
git diff --cached --quiet >nul 2>&1
if errorlevel 1 (
  for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "(Get-Date).ToString('yyyy-MM-dd HH:mm')"`) do set "TS=%%i"
  git commit -m "Atualiza dashboard_unificado (auto %TS%)" >nul 2>&1
  if errorlevel 1 (
    echo ERRO: falha ao criar commit (git commit).
    set "GIT_RC=1"
  ) else (
    for /f "usebackq delims=" %%i in (`git rev-parse --short HEAD 2^>nul`) do set "NEW_SHA=%%i"
    if not "%NEW_SHA%"=="" echo Commit criado: %NEW_SHA%
    powershell -NoProfile -Command "$env:GIT_TERMINAL_PROMPT='0'; $env:GCM_INTERACTIVE='Never'; $p=Start-Process git -ArgumentList @('push','origin','%TARGET_BRANCH%') -NoNewWindow -PassThru; if(-not $p.WaitForExit(180000)){ try{$p.Kill()}catch{}; exit 2 }; exit $p.ExitCode" >nul 2>&1
    if errorlevel 1 (
      echo ERRO: falha no push (git push origin %TARGET_BRANCH%). Nao farei pull automatico.
    )
    if errorlevel 1 (
      echo ERRO: falha no push (git push origin %TARGET_BRANCH%).
      set "GIT_RC=1"
    ) else (
      echo Push OK: origin/%TARGET_BRANCH%
    )
  )
 ) else (
  echo Nada para commitar/push (unificado).
)
endlocal & exit /b %GIT_RC%

:RUN_OPTIONS_JOB_FORCE
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
  "$maxAge=[int]0; try { $maxAge=[int]($env:OPTIONS_LOCK_MAX_AGE_MINUTES) } catch { $maxAge=240 };" ^
  "$pidFile=(Join-Path $lock 'pid.txt');" ^
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
  "try { New-Item -ItemType Directory -Path $lock -ErrorAction Stop | Out-Null } catch { Write-Host 'AVISO: Opcoes ja em execucao (lock).'; exit 2 };" ^
  "try { Set-Content -LiteralPath $pidFile -Value ([string]$PID) -Encoding ascii -Force } catch { };" ^
  "try {" ^
  "  try { Remove-Item -Recurse -Force -ErrorAction SilentlyContinue (Join-Path $env:APPDATA 'undetected_chromedriver') } catch { };" ^
  "  Set-Location '%AUTO_B3_DIR%';" ^
  "  & %PY_CMD% automacao_dados.py;" ^
  "  & %PY_CMD% config.py;" ^
  "  & %PY_CMD% '%~dp0Cotacoes\tools\market\gerar_controle.py';" ^
  "  $srcDash=Join-Path '%AUTO_B3_DIR%' 'dashboard_unificado';" ^
  "  $dstDash=Join-Path '%~dp0' 'dashboard_unificado';" ^
  "  foreach($k in @('WIN','WDO')){" ^
  "    $sData=Join-Path (Join-Path $srcDash $k) 'assets\\data';" ^
  "    $dData=Join-Path (Join-Path $dstDash $k) 'assets\\data';" ^
  "    if(-not (Test-Path -LiteralPath $sData)){ continue };" ^
  "    try { New-Item -ItemType Directory -Force -Path $dData | Out-Null } catch { };" ^
  "    try { & robocopy $sData $dData market_data.json market_data.js ntsl_script.txt /FFT /R:2 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null } catch { };" ^
  "  };" ^
  "  Start-Sleep -Seconds 1;" ^
  "} finally { Remove-Item -LiteralPath $lock -Recurse -Force -ErrorAction SilentlyContinue }"
endlocal & exit /b %errorlevel%

:SHUTDOWN_MARKET_FORCE
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
