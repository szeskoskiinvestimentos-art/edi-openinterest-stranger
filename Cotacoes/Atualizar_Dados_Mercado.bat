@echo off
setlocal EnableExtensions EnableDelayedExpansion
if "%MARKET_DEBUG_BAT%"=="1" echo on
cd /d "%~dp0"
echo.
echo === ROTINA MERCADO (Investing -^> CSV -^> Dashboard) ===
echo.
echo - Esta janela precisa ficar aberta para o botao "Dados" acionar a atualizacao.
echo - Para parar, feche esta janela.
echo.
set "MARKET_GIT_SYNC_ENABLED=true"
set "MARKET_GIT_SYNC_PUSH=true"
set "MARKET_GIT_SYNC_BRANCH=main"
set "MARKET_UPDATE_MODE=once"
set "MARKET_SCHEDULE_MODE=interval"
set "MARKET_INTERVAL_MINUTES=5"
set "INVESTING_PORTFOLIO_INTERVAL_MINUTES=15"
set "MARKET_RETENTION_DAYS=5"
set "MARKET_SUBSYSTEMS="
set "MARKET_VALIDATE_BEFORE_GIT_SYNC=true"
set "MARKET_VALIDATE_STRICT=false"

set "MARKET_PORT=%MARKET_SERVICE_PORT%"
if "!MARKET_PORT!"=="" set "MARKET_PORT=3433"

set "NPM_CMD=%ProgramFiles%\nodejs\npm.cmd"
if exist "!NPM_CMD!" goto NPM_OK
set "NPM_CMD=%ProgramFiles(x86)%\nodejs\npm.cmd"
if exist "!NPM_CMD!" goto NPM_OK
for /f "delims=" %%F in ('where npm.cmd') do (
  set "NPM_CMD=%%F"
  goto NPM_OK
)
echo ERRO: nao encontrei npm (npm.cmd) no PATH.
echo - Instale o Node.js ou ajuste o PATH do servico/agendador.
echo.
pause
exit /b 1
:NPM_OK

echo Porta do market:service: !MARKET_PORT!
echo.
set "MARKET_ALREADY_RUNNING=0"
powershell -NoProfile -Command "$x=Get-NetTCPConnection -State Listen -LocalPort !MARKET_PORT! -ErrorAction SilentlyContinue | Select-Object -First 1; if($x){exit 0}else{exit 1}" >nul 2>&1
if not errorlevel 1 set "MARKET_ALREADY_RUNNING=1"
if "%MARKET_ALREADY_RUNNING%"=="0" (
  netstat -ano | findstr ":!MARKET_PORT!" | findstr /I "LISTENING OUVINDO" >nul 2>&1
  if not errorlevel 1 set "MARKET_ALREADY_RUNNING=1"
)
if "%MARKET_ALREADY_RUNNING%"=="1" (
  echo Aviso: http://127.0.0.1:!MARKET_PORT! ja esta em uso - market:service em outra janela.
  echo - Este .bat nao vai iniciar um segundo market:service.
  echo - Se precisar aplicar mudancas, encerre a outra janela e rode este .bat novamente.
  echo.
  goto END
)
if not exist "node_modules\.bin\tsx.cmd" (
  echo Instalando dependencias do market:service ^(npm ci^)...
  call "!NPM_CMD!" ci --silent
  if errorlevel 1 (
    echo ERRO: npm ci falhou.
    echo.
    pause
    exit /b 1
  )
)
call "!NPM_CMD!" run -s market:service
echo.
:END
pause
