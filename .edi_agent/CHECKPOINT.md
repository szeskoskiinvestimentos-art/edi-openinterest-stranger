# Auto-Registro - Estado Atual do Projeto

> **Última atualização**: 2026-06-22 11:15 (Sessão Diagnóstico Coletas)
> **Próxima revisão**: após FORCE.bat validar (aguardando Owner)

---

## Estado do Sistema

### Arquitetura (ATUALIZADA 2026-06-22)
```
Edi_Market_Guardian_V0/
├── src/                       # calculator (E22-E78), greeks, config
├── tests/                     # 30+ testes
├── scripts/                   # orquestrador.py + hooks (CRLF-safe)
│   └── hooks/
│       ├── pre_run_snapshot.py
│       └── market_health.ps1  # NOVO (2026-06-22) - health check robusto
├── dashboard_unificado/       # 6 dashboards (WDO+WIN+CONTROLE+CORR+HUB+MERCADOS)
├── Cotacoes/                  # Serviço Node.js (porta 3433)
│   ├── tools/market/
│   │   ├── gerar_controle.py  # EVOLUIDO (E95b)
│   │   ├── investing-sync.ts
│   │   └── update-service/
├── Auto_B3_System/            # Barchart + TradingView (E97 quebrado)
├── .edi_agent/                # Auto-aprendizado
└── [arquivos raiz]            # .bat wrappers (CRLF forçado)
```

### Métricas (2026-06-22)
| Métrica | Valor |
|---------|-------|
| Evoluções implementadas | 30+ (até E97) |
| Testes passando | 322/325 (99.1%) |
| Commits hoje | 8 (28fbca79, e651aa69, eeed501f, 667ec25b, 73628fd8, a8ac7a71, 1d41a2c6, 7f005f01) |
| Bugs críticos corrigidos hoje | 5 (date.replace, node-sync, npm.exe, powershell, CRLF) |
| Bugs latentes | E97 (undetected_chromedriver Py3.12+), Barchart E97 |

---

## Fase 7: Diagnóstico Coletas + Fix FORCE.bat (2026-06-22)

### Contexto
Owner pediu: "ajustar o sistema para que eu possa usar ele. Teste as coletas de dados. Geração atualizada dos dashboard. Confiabilidade dos dados mostrados nos dashboards. Atualização dos dados mostrados. Travamos na primeira etapa ontem, onde não abriu os demais serviços para coletar informações só abriu o barchart e ainda só ewz e nem realizou as coletas."

### Investigação

#### CP-043: Pipeline de coleta funcional
- **market:service (porta 3433)**: UP, agendando a cada 15min via cron
- **market:once**: 100% OK (3min22s, 13/13 artefatos)
  - Yahoo: 245 quotes, 80 fallback
  - InfoMoney: 45 contratos DI
  - Investing: 36 eventos + portfolio CSV
- **market:addons**: 100% OK (10 addons + 2 PDFs)
- **Investing session**: viva (Login Data válido)
- **CSV PréMercado 22062026**: gerado (188KB, 08:16)
- **Git sync auto-commit**: `70a8d4ba` pushed
- **Achado crítico**: porta era 3033, mudou para 3433 (commit `db71bd4d`)

#### CP-044: Bug 1 - should_run() crash
- **Arquivo**: scripts/orquestrador.py:640
- **Causa**: `today = now.date()` retorna `date` (sem hora), mas código usava `date.replace(hour=..., minute=..., second=..., microsecond=...)`. `date.replace` só aceita 3 kwargs.
- **FIX**: `datetime.combine(today, dt_time(hour, minute, second, microsecond))`
- **Commit**: `28fbca79`
- **Reproduzido**: Servico_Unificado.bat 09:19:04 crash imediato

#### CP-045: Bug 2 - node-sync npm script inexistente
- **Arquivo**: scripts/orquestrador.py:_run_node_sync()
- **Causa**: Chamava `npm run -s investing-sync-runner run-once` que NÃO existe nos scripts do package.json. Scripts npm só têm `market:once`, `market:portfolio`, etc.
- **FIX**: Mapear `mode -> npm script` e usar `market:once` (e variantes)
- **Commit**: `e651aa69`
- **Impacto**: Investing/InfoMoney NUNCA rodaram durante FORCE (WinError 2 silencioso)

#### CP-046: Bug 3 - gerar_controle.py source orfao
- **Arquivo**: Cotacoes/tools/market/gerar_controle.py
- **Causa**: src_candidates priorizava `Auto_B3_System/dashboard_unificado/` (legacy orfao, sem index.html). O `dashboard_unificado/` canônico (commitado) tem WDO/index.html mas não estava em src_candidates.
- **FIX**: Adicionar `dashboard_unificado` como 3º candidato, com `_is_complete_source()` que exige WDO/index.html presente
- **Commit**: `e651aa69` (mesmo)
- **Resultado**: 61 arquivos copiados, swap atômico OK, 13/13 validate strict OK

#### CP-047: Bug 4 - Barchart E97 (latente)
- **Arquivo**: Auto_B3_System/automacao_dados.py (via undetected_chromedriver)
- **Causa**: undetected_chromedriver 3.5.5 quebrou em Py3.12+ (depende de distutils removido)
- **Workaround 1**: `pip install standard-distutils` → resolve import
- **Workaround 2**: Barchart API requer login Premier para options (sem login retorna só underlying)
- **Status**: NÃO CORRIGIDO — Owner precisa decidir entre:
  - A: Downgrade undetected-chromedriver==3.4.6
  - B: Venv Python 3.11
  - C: Login manual + profile persistente
  - D: API paga (Polygon/Tradier/CBOE)
  - E: Aceitar quebrado, usar Yahoo options (já cobre EWZ/USDU/UUP)

#### CP-048: Bug 5 - FORCE.bat "foi inesperado neste momento"
- **Sintoma**: FORCE travou 4 vezes (09:47, 10:22, 10:31, 10:41)
- **Causa raiz (FINAL)**: cmd.exe do Windows NÃO aceita line endings LF (Unix). patch tool grava LF.
- **FIX**: unix2dos aplicado em Servico_Unificado*.bat (forçou CRLF)
- **Commits**: `73628fd8` (market_health.ps1), `a8ac7a71` (remove aspas), `1d41a2c6` (revertido), `7f005f01` (CRLF final)
- **Tentativas falhadas antes do fix real**:
  1. path com \ → cmd interpretou mal
  2. powershell inline com `if(...)` → $r expandido como variavel
  3. aspas em powershell -File → cmd passou aspas literais
  4. powershell direto → tudo OK isolado, mas .bat LF quebrava
  5. **CRLF** → finalmente funcionou

### Melhorias aplicadas (Opção A do legado)

#### CP-049: Auto-start + WAIT_MARKET (legado)
- **Arquivo**: Servico_Unificado_FORCE.bat
- **Adicionado**:
  - WAIT_MARKET: health check em loop de 2s ate 60s
  - AUTO-START: se service DOWN, sobe em background com `start /b cmd /c ... npm run market:service`
- **Checkpoints visuais**: ETAPA 1/4 a 4/4 com nome + tempo esperado
- **Commit**: `667ec25b`
- **Commit adicional**: `e651aa69` (ETAPAs no orquestrador)
- **Critérios Edi_Revisao.txt §1**: ✅ Organização, sem duplicação, modularização

### Implementações da sessão
- **scripts/hooks/market_health.ps1**: PowerShell standalone parametrizado (Url, TimeoutSec)
- **scripts/orquestrador.py: `_resolve_npm_exe()`**: retorna caminho absoluto do npm.cmd

### Estado FINAL 2026-06-22 11:15
- **HEAD**: `7f005f01` (CRLF forçado)
- **Working tree**: 4 untracked (yahoo_*_options.json — outputs regenerados)
- **Service**: UP na porta 3433
- **Próxima coleta scheduled**: 14:30 UTC
- **Próximo passo**: Owner validar FORCE.bat com CRLF aplicado

### Atualização 2026-06-22 11:50 (re-registro)
- **HEAD atual**: `daab2897` (auto-commit do market:service às 14:48:01 UTC)
- **Service continua UP**, agendando coletas a cada 15min via cron
- **Pendências inalteradas**: aguardar validação Owner do FORCE.bat (CRLF)
- **Decisão Owner pendente**: Barchart E97 workaround (A/B/C/D/E)
- **Working tree**: 4 untracked (yahoo_*_options.json — outputs regenerados, NAO comitados)

### Atualização 2026-06-22 12:00 (re-registro Owner pediu novamente)
- **HEAD atual**: `982449b8` (docs re-registro 11:50)
- **Service**: UP, última coleta `2026-06-22T14:48:01Z` (auto-commit `daab2897`)
- **Working tree**: 4 untracked (yahoo_*_options.json — outputs regenerados)
- **Estado**: ESTÁVEL — sem ação autônoma (Owner solicitou "pare" depois "atualize registros")
- **Pendências**: inalteradas — aguarda validação FORCE.bat (CRLF) + decisão Barchart E97

### Atualização 2026-06-22 12:04 (re-registro Owner pediu novamente)
- **HEAD atual**: `1164a31b` (docs re-registro 12:00)
- **Service**: UP, última coleta `2026-06-22T15:00:34Z` (auto-commit `de84daed` 15:00 UTC)
- **Working tree**: 4 untracked (yahoo_*_options.json — outputs)
- **Estado**: ESTÁVEL — sem ação autônoma
- **Pendências**: inalteradas (FORCE.bat validar + Barchart E97)
- **Próximo checkpoint**: apenas quando Owner enviar nova ação substantiva

### Atualização 2026-06-22 12:10 (re-registro Owner pediu novamente)
- **HEAD atual**: `5edf2288` (docs re-registro 12:04)
- **Service**: DOWN! porta 3433 livre, sem resposta em `/api/market/health`
- **Causa provável**: cron tentou reiniciar após auto-commit `de84daed` 15:00:34, mas serviço anterior não liberou limpo
- **24 node.exe** rodando (provavelmente outros projetos, não o nosso)
- **Working tree**: 4 untracked (yahoo_*_options.json — outputs)
- **Estado**: SERVICE DOWN — sem ação autônoma (Owner ainda não pediu restart)
- **Pendências**: inalteradas + **restart manual do service** agora necessário
- **Próximo checkpoint**: Owner pedir restart ou nova ação

### Pendências para próxima sessão
- [ ] Owner validar FORCE.bat (resolveu "foi inesperado"?)
- [ ] Decidir workaround Barchart E97 (A/B/C/D/E)
- [ ] Limpar working tree (4 untracked yahoo options)
- [ ] Validar end-to-end do FORCE completo (após CRLF)
- [ ] Considerar adicionar `yahoo_*_options.{js,json}` ao .gitignore (são outputs)
- [ ] Avaliar se FORCE deve matar o service no final (atualmente sim via `self.market.shutdown()`)

---

## Histórico recente
| Data | Sessão | Foco |
|------|--------|------|
| 2026-06-19 | Refatoração completa | Modularização calculator |
| 2026-06-19 | Q1 Quick Wins | 6 evoluções, 38 testes |
| 2026-06-20 | (sem atividade) | - |
| 2026-06-21 | Autonomous "Continue" x5 | 9 features, 322/325 testes |
| **2026-06-22** | **Diagnóstico coletas + fix FORCE** | **8 commits, 5 bugs corrigidos** |
