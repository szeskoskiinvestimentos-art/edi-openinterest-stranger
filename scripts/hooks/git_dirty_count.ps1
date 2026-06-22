# git_dirty_count.ps1 - Retorna numero de arquivos modificados (para .bat)
$count = (git status --short 2>&1).Count
Write-Output $count
exit 0
