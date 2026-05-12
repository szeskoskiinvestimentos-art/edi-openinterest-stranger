@echo off
setlocal EnableExtensions

cd /d "%~dp0"
title EDI Service (Opcoes + Cotacoes)

set "AUTO_UPDATE_CHROME=true"
set "ENABLE_AUTO_GIT_PUSH=true"

if /i "%~1"=="--no-pause" (
  set "EDI_NO_PAUSE=1"
  shift
)

if /i "%~1"=="--copy-only" goto :END
if /i "%~1"=="--copy-only-verbose" (
  set "COPY_DEBUG=1"
  set "COPY_ONLY=1"
  goto :END
)

where py >nul 2>&1
if not errorlevel 1 (
  py -3 servico_unificado.py %* || goto :ABORT
  py -3 "B3_System\Edi_OpenInterest - PY - Stranger - WDO\yahoo_uup_options_export.py" || goto :ABORT
  py -3 "B3_System\Edi_OpenInterest - PY - Stranger - WDO\yahoo_uup_options_export.py" --proxy USDU || goto :ABORT
  py -3 "B3_System\Edi_OpenInterest - PY - Stranger - WDO\yahoo_uup_options_export.py" --target WIN || goto :ABORT
  py -3 "B3_System\config.py" || goto :ABORT
  goto :END
)

where python >nul 2>&1
if not errorlevel 1 ( 
  python servico_unificado.py %* || goto :ABORT
  python "B3_System\Edi_OpenInterest - PY - Stranger - WDO\yahoo_uup_options_export.py" || goto :ABORT
  python "B3_System\Edi_OpenInterest - PY - Stranger - WDO\yahoo_uup_options_export.py" --proxy USDU || goto :ABORT
  python "B3_System\Edi_OpenInterest - PY - Stranger - WDO\yahoo_uup_options_export.py" --target WIN || goto :ABORT
  python "B3_System\config.py" || goto :ABORT
  goto :END
)

echo ERRO: Python nao encontrado (comandos py/python).
goto :END

:ABORT
echo Execucao interrompida (erro ou Ctrl+C). Pulando atualizacao do MERCADO.
call :COPY_PDFS
exit /b 1

:COPY_PDFS
set "DEST=C:\Users\ednil\OneDrive - 12s1y\Edi_Sistamas\Opcoes\PDF PreMercado"
if not exist "%DEST%" mkdir "%DEST%"
if "%COPY_DEBUG%"=="1" (
  echo DEST=%DEST%
)
set "SRC_WDO=C:\Users\ednil\OneDrive - 12s1y\Edi_Sistamas\Opcoes\B3_System\opcoesWDO.pdf"
set "SRC_WIN=C:\Users\ednil\OneDrive - 12s1y\Edi_Sistamas\Opcoes\B3_System\opcoesWIN.pdf"
if "%COPY_DEBUG%"=="1" (
  echo SRC_WDO=%SRC_WDO%
  echo SRC_WIN=%SRC_WIN%
)
if exist "%SRC_WDO%" (
  if "%COPY_DEBUG%"=="1" (copy /Y "%SRC_WDO%" "%DEST%\opcoesWDO.pdf") else (copy /Y "%SRC_WDO%" "%DEST%\opcoesWDO.pdf" >nul)
)
if exist "%SRC_WIN%" (
  if "%COPY_DEBUG%"=="1" (copy /Y "%SRC_WIN%" "%DEST%\opcoesWIN.pdf") else (copy /Y "%SRC_WIN%" "%DEST%\opcoesWIN.pdf" >nul)
)
set "SRC_MERCADO=C:\Users\ednil\OneDrive - 12s1y\Edi_Sistamas\Opcoes\Cotacoes\dashboard\MERCADO\exports\pdf"
if "%COPY_DEBUG%"=="1" (
  echo SRC_MERCADO=%SRC_MERCADO%
)
if exist "%SRC_MERCADO%" (
  if "%COPY_DEBUG%"=="1" (robocopy "%SRC_MERCADO%" "%DEST%\MERCADO_exports_pdf" /E) else (robocopy "%SRC_MERCADO%" "%DEST%\MERCADO_exports_pdf" /E /NFL /NDL /NP /NJH /NJS >nul)
)
set "MERCADO_EXPORTS=C:\Users\ednil\OneDrive - 12s1y\Edi_Sistamas\Opcoes\Cotacoes\dashboard\MERCADO\exports"
set "LATEST_MERCADO_PDF="
for /f "delims=" %%P in ('dir /s /b /a:-d /o:-d "%MERCADO_EXPORTS%\MERCADO_2*.pdf" 2^>nul') do (
  set "LATEST_MERCADO_PDF=%%P"
  goto :END_MERCADO_PDF
)
:END_MERCADO_PDF
if defined LATEST_MERCADO_PDF if exist "%LATEST_MERCADO_PDF%" (
  if "%COPY_DEBUG%"=="1" echo LATEST_MERCADO_PDF=%LATEST_MERCADO_PDF%
  if "%COPY_DEBUG%"=="1" (copy /Y "%LATEST_MERCADO_PDF%" "%DEST%\") else (copy /Y "%LATEST_MERCADO_PDF%" "%DEST%\" >nul)
)
set "LATEST_MERCADO_LITE_PDF="
for /f "delims=" %%P in ('dir /s /b /a:-d /o:-d "%MERCADO_EXPORTS%\MERCADO_LITE_*.pdf" 2^>nul') do (
  set "LATEST_MERCADO_LITE_PDF=%%P"
  goto :END_MERCADO_LITE_PDF
)
:END_MERCADO_LITE_PDF
if defined LATEST_MERCADO_LITE_PDF if exist "%LATEST_MERCADO_LITE_PDF%" (
  if "%COPY_DEBUG%"=="1" echo LATEST_MERCADO_LITE_PDF=%LATEST_MERCADO_LITE_PDF%
  if "%COPY_DEBUG%"=="1" (copy /Y "%LATEST_MERCADO_LITE_PDF%" "%DEST%\") else (copy /Y "%LATEST_MERCADO_LITE_PDF%" "%DEST%\" >nul)
)
set "LOCAL_PDF_PREMERCADO=%~dp0PDF PreMercado"
set "LATEST_WDO_V1_LITE_PDF="
for /f "delims=" %%P in ('dir /s /b /a:-d /o:-d "%MERCADO_EXPORTS%\WDO_V1_LITE_*.pdf" 2^>nul') do (
  set "LATEST_WDO_V1_LITE_PDF=%%P"
  goto :END_WDO_V1_LITE_PDF
)
for /f "delims=" %%P in ('dir /b /a:-d /o:-d "%LOCAL_PDF_PREMERCADO%\WDO_V1_LITE_*.pdf" 2^>nul') do (
  set "LATEST_WDO_V1_LITE_PDF=%LOCAL_PDF_PREMERCADO%\%%P"
  goto :END_WDO_V1_LITE_PDF
)
:END_WDO_V1_LITE_PDF
if defined LATEST_WDO_V1_LITE_PDF if exist "%LATEST_WDO_V1_LITE_PDF%" (
  if "%COPY_DEBUG%"=="1" echo LATEST_WDO_V1_LITE_PDF=%LATEST_WDO_V1_LITE_PDF%
  if "%COPY_DEBUG%"=="1" (copy /Y "%LATEST_WDO_V1_LITE_PDF%" "%DEST%\") else (copy /Y "%LATEST_WDO_V1_LITE_PDF%" "%DEST%\" >nul)
)
set "LATEST_WIN_V1_LITE_PDF="
for /f "delims=" %%P in ('dir /s /b /a:-d /o:-d "%MERCADO_EXPORTS%\WIN_V1_LITE_*.pdf" 2^>nul') do (
  set "LATEST_WIN_V1_LITE_PDF=%%P"
  goto :END_WIN_V1_LITE_PDF
)
for /f "delims=" %%P in ('dir /b /a:-d /o:-d "%LOCAL_PDF_PREMERCADO%\WIN_V1_LITE_*.pdf" 2^>nul') do (
  set "LATEST_WIN_V1_LITE_PDF=%LOCAL_PDF_PREMERCADO%\%%P"
  goto :END_WIN_V1_LITE_PDF
)
:END_WIN_V1_LITE_PDF
if defined LATEST_WIN_V1_LITE_PDF if exist "%LATEST_WIN_V1_LITE_PDF%" (
  if "%COPY_DEBUG%"=="1" echo LATEST_WIN_V1_LITE_PDF=%LATEST_WIN_V1_LITE_PDF%
  if "%COPY_DEBUG%"=="1" (copy /Y "%LATEST_WIN_V1_LITE_PDF%" "%DEST%\") else (copy /Y "%LATEST_WIN_V1_LITE_PDF%" "%DEST%\" >nul)
)
rem Copiar o último CSV da carteira (Investing)
set "CSV_DIR=%INVESTING_DOWNLOAD_DIR%"
if "%CSV_DIR%"=="" set "CSV_DIR=C:\Users\ednil\OneDrive - 12s1y\Edi_Sistamas\Opcoes\Cotacoes\.edi-market-guardin\downloads"
if "%COPY_DEBUG%"=="1" (
  echo CSV_DIR=%CSV_DIR%
)
set "LATEST_CSV="
for /f "delims=" %%F in ('dir /b /a:-d /o:-d "%CSV_DIR%\*.csv" 2^>nul') do (
  set "LATEST_CSV=%CSV_DIR%\%%F"
  goto :END_CSV_COPY
)
:END_CSV_COPY
if defined LATEST_CSV if exist "%LATEST_CSV%" (
  if "%COPY_DEBUG%"=="1" echo LATEST_CSV=%LATEST_CSV%
  if "%COPY_DEBUG%"=="1" (copy /Y "%LATEST_CSV%" "%DEST%\") else (copy /Y "%LATEST_CSV%" "%DEST%\" >nul)
)
rem Copiar o CSV para a raiz do projeto Cotacoes (para alimentar market:update)
set "COTACOES_DIR=C:\Users\ednil\OneDrive - 12s1y\Edi_Sistamas\Opcoes\Cotacoes"
if not exist "%COTACOES_DIR%" set "COTACOES_DIR=%~dp0Cotacoes"
if defined LATEST_CSV if exist "%LATEST_CSV%" (
  if "%COPY_DEBUG%"=="1" echo COTACOES_DIR=%COTACOES_DIR%
  if exist "%COTACOES_DIR%" (
    if "%COPY_DEBUG%"=="1" (copy /Y "%LATEST_CSV%" "%COTACOES_DIR%\") else (copy /Y "%LATEST_CSV%" "%COTACOES_DIR%\" >nul)
  )
)
exit /b 0

:UPDATE_MERCADO
rem Executar pipeline MERCADO (npm scripts)
where npm >nul 2>&1
if not errorlevel 1 (
  pushd "%COTACOES_DIR%" >nul
  if "%COPY_DEBUG%"=="1" (
    call npm run market:update
    call npm run market:addons
  ) else (
    call npm run market:update >nul 2>nul
    call npm run market:addons >nul 2>nul
  )
  popd >nul
)
exit /b 0

:END
call :COPY_PDFS
if "%COPY_ONLY%"=="1" exit /b 0
call :UPDATE_MERCADO
if "%EDI_NO_PAUSE%"=="1" exit /b 0
pause
