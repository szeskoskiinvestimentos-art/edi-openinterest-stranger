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

echo.
echo ============================================================
echo  [SAFE MODE] Pre-run snapshot iniciando...
echo ============================================================
echo.

REM Encontrar Python
where python >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado no PATH.
    exit /b 1
)

REM Criar snapshot
python scripts\hooks\pre_run_snapshot.py --label pre-run
if errorlevel 1 (
    echo.
    echo [AVISO] Falha ao criar snapshot. Continuando mesmo assim...
    echo         Para pular o snapshot, use Servico_Unificado_FORCE.bat
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
