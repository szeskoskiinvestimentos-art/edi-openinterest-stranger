# Checkpoint Atual - Edi Market Guardian V0

## Status: AGUARDANDO VALIDAÇÃO DO OWNER

## Último Checkpoint: CP-049
- **Data/Hora**: 2026-06-22 12:10 (re-registro)
- **Título**: Auto-start + WAIT_MARKET (Opção A do legado)
- **Status**: CONCLUÍDO (aguardando validação Owner)

## Sessão 2026-06-22: Diagnóstico Coletas + Fix FORCE.bat

### Contexto
Owner pediu foco em:
- Teste das coletas de dados
- Geração atualizada dos dashboards
- Confiabilidade dos dados
- Atualização dos dados mostrados

Travamento anterior: ontem (21/06 22:05) só abriu Barchart no EWZ, não rodou outros serviços.

### Tarefas Concluídas

#### T1: Validar pipeline de coleta ✅
- market:service (porta 3433) - UP, cron 15min
- market:once - 13/13 artefatos em 3min22s
- market:addons - 10 addons + 2 PDFs
- Investing session - Login Data válido
- CSV PréMercado 22062026 - 188KB
- Git sync auto-commit - 70a8d4ba pushed

#### T2: Fix 5 bugs críticos ✅
- CP-043 (28fbca79): date.replace() → datetime.combine()
- CP-044 (e651aa69): node-sync npm script
- CP-045 (e651aa69): gerar_controle.py source orfao
- CP-046: Barchart E97 (NAO CORRIGIDO - latente)
- CP-048 (7f005f01): CRLF forçado em .bat

#### T3: Auto-start + WAIT_MARKET ✅
- CP-049: baseado no legado
- Service sobe em background se DOWN
- Health check em loop de 2s ate 60s
- Checkpoints visuais (ETAPA 1/4 a 4/4)

### Tarefas Pendentes

#### T4: Validar FORCE.bat com Owner ⏳
- 4 tentativas de FORCE (09:47, 10:22, 10:31, 10:41) - todas travaram em "foi inesperado"
- Causa raiz final: LF vs CRLF (cmd.exe Windows não aceita LF)
- Fix aplicado: unix2dos + .gitattributes
- **Aguardando Owner rodar FORCE.bat novamente**

#### T5: Decidir workaround Barchart E97
- A: Downgrade undetected-chromedriver==3.4.6
- B: Venv Python 3.11
- C: Login manual + profile persistente
- D: API paga (Polygon/Tradier/CBOE)
- E: Aceitar quebrado, usar Yahoo options

#### T6: Limpar working tree
- 4 untracked: dashboard_unificado/{WDO,WIN}/assets/data/yahoo_*_options.json
- Considerar adicionar ao .gitignore (outputs regeneraveis)

### Atualização 2026-06-22 11:50
- **HEAD atual**: `daab2897` (auto-commit do market:service às 14:48:01 UTC)
- Service continua UP na porta 3433
- Próxima coleta scheduled: 14:45 UTC (cron 15min)
- Working tree: 4 untracked (yahoo_*_options.json — outputs)
- Pendências inalteradas: aguardando FORCE.bat validar + decisão Barchart E97

### Atualização 2026-06-22 12:00 (re-registro)
- **HEAD atual**: `982449b8` (docs re-registro 11:50)
- Service UP, última coleta `2026-06-22T14:48:01Z`
- Estado ESTÁVEL — sem ação autônoma (Owner solicitou "pare")
- Pendências inalteradas

### Atualização 2026-06-22 12:04 (re-registro)
- **HEAD atual**: `1164a31b` (docs re-registro 12:00)
- Service UP, última coleta `2026-06-22T15:00:34Z` (auto-commit `de84daed`)
- Estado ESTÁVEL — sem ação autônoma
- Pendências inalteradas

### Atualização 2026-06-22 12:10 (re-registro)
- **HEAD atual**: `5edf2288` (docs re-registro 12:04)
- **Service**: DOWN! porta 3433 livre
- 24 node.exe rodando (outros projetos)
- Sem ação autônoma
- **Restart manual necessário** quando Owner pedir

### Arquivos em Análise
- `Servico_Unificado_FORCE.bat` (CRLF forçado em `7f005f01`)
- `scripts/orquestrador.py` (múltiplos fixes)
- `Cotacoes/tools/market/gerar_controle.py` (source fix)
- `scripts/hooks/market_health.ps1` (NOVO)
- `.gitattributes` (NOVO)

### Commits da Sessão (12 total)
1. `28fbca79` - fix should_run date.replace
2. `e651aa69` - fix node-sync + checkpoints
3. `eeed501f` - paths forward-slash + npm.exe
4. `667ec25b` - auto-start + WAIT_MARKET
5. `73628fd8` - market_health.ps1 standalone
6. `a8ac7a71` - remover aspas do -File
7. `1d41a2c6` - CRLF + .gitattributes (REVERTIDO)
8. `7f005f01` - CRLF forçado (FIX REAL)
9. `903f7fc1` - revert do 1d41a2c6
10. `3c61143` - recriar .gitattributes
11. `0b40d86b` - atualizar CHECKPOINT, REFACTOR_LOG
12. `daab2897` - auto-commit market:service 14:48:01

### Notas
- Sistema de modos automaticos funcionando (cron 15min)
- Service Node UP na porta 3433 (NAO 3033)
- Backup do projeto legado em C:\Projetos_Hermes\Edi_Market_Guardian_V0\Backup\Edi_Sistema_Unificado_X
- Critérios Edi_Revisao.txt §1 aplicados: Organização, sem duplicação, modularização
- Próximo passo: Owner valida FORCE.bat com CRLF
