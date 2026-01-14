# Script de Configuração Inicial do Repositório Git
# Execute este script APÓS instalar o Git for Windows.

Write-Host "=== Configuração Automática do Repositório Git ===" -ForegroundColor Cyan

# 1. Verifica se o Git está instalado
try {
    git --version | Out-Null
} catch {
    Write-Host "ERRO: O Git não foi encontrado." -ForegroundColor Red
    Write-Host "Por favor, instale o Git e reinicie o terminal antes de rodar este script." -ForegroundColor Yellow
    exit
}

# 2. Inicializa o repositório
if (-not (Test-Path ".git")) {
    Write-Host "Inicializando repositório Git..."
    git init
} else {
    Write-Host "Repositório Git já inicializado." -ForegroundColor Yellow
}

# 3. Configura o Remote (Origem)
$remoteUrl = "https://github.com/szeskoskiinvestimentos-art/edi-openinterest-stranger.git"
$currentRemote = git remote get-url origin 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "Adicionando remoto 'origin': $remoteUrl"
    git remote add origin $remoteUrl
} elseif ($currentRemote -ne $remoteUrl) {
    Write-Host "Atualizando remoto 'origin' para: $remoteUrl"
    git remote set-url origin $remoteUrl
} else {
    Write-Host "Remoto 'origin' já configurado corretamente." -ForegroundColor Green
}

# 4. Garante Branch Main
git branch -M main

# 5. Primeiro Commit e Push (se houver arquivos)
$status = git status --porcelain
if ($status) {
    Write-Host "Arquivos detectados. Preparando primeiro envio..."
    git add .
    git commit -m "Setup inicial: Estrutura do projeto e dashboards"
    
    Write-Host "Enviando para o GitHub..."
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCESSO! Projeto enviado para o GitHub." -ForegroundColor Green
    } else {
        Write-Host "AVISO: Ocorreu um erro no push. Verifique se você tem permissão no repositório." -ForegroundColor Red
    }
} else {
    Write-Host "Nada para commitar (diretório limpo)." -ForegroundColor Yellow
}

Write-Host "=== Configuração Concluída ===" -ForegroundColor Cyan
Write-Host "Agora o main.py fará o envio automático das atualizações." -ForegroundColor Cyan
