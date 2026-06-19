# Skill: Project Organizer

## Descrição
Organiza e limpa a estrutura do projeto Edi Market Guardian.

## Regras

1. **Mapear antes de agir** - Sempre analisar a estrutura atual
2. **Documentar mudanças** - Registrar cada ação no EVOLUTION_LOG.md
3. **Preservar dados** - Nunca deletar sem backup
4. **Verificar dependências** - Assegurar que arquivos não são referenciados

## Fluxo de Trabalho

### 1. Análise
- Listar todos os arquivos e pastas
- Identificar duplicatas e órfãos
- Verificar tamanhos e datas

### 2. Planejamento
- Criar lista de ações
- Priorizar por impacto
- Estimar riscos

### 3. Execução
- Executar limpezas seguras primeiro
- Depois migrações
- Por último, otimizações

### 4. Verificação
- Testar funcionalidades críticas
- Verificar links de navegação
- Confirmar integridade

## Comandos Úteis

```powershell
# Listar arquivos por tamanho
Get-ChildItem -Recurse | Sort-Object Length -Descending | Select-Object FullName, @{N='MB';E={[math]::Round($_.Length/1MB,2)}} | Select-Object -First 20

# Encontrar arquivos duplicados (por hash)
Get-ChildItem -Recurse -File | Get-FileHash | Group-Object Hash | Where-Object {$_.Count -gt 1} | ForEach-Object { $_.Group | Select-Object FullName }
```