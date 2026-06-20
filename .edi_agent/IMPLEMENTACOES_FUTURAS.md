# IMPLEMENTACOES FUTURAS — EDI Market Guardian V0

> **Versao**: 2.0
> **Data**: 2026-06-20
> **Status**: **65 evolucoes concluidas (E1-E65)**, 0 pendentes no roadmap original
> **Backlog novo**: E66+ (Heston, Dupire, SVI, Rough Bergomi, Merton jumps, day-trade features)
> **E13 (Print→Logger)**: ✅ COMPLETO 2026-06-20 (commit `eba5f14f`) — 3 arquivos migrados

---

## ESTADO ATUAL (baseline 2026-06-20)

### Metricas atuais
- **102/102 testes passando** (validado em `py -3.13 tests/run_all.py`)
- **65 evolucoes implementadas** (E1-E65) — 100% do roadmap original
- **Calculator modular**: 6 submodules (mixin pattern) + 4 modelos matematicos (BS, SABR, Volga, IV Bisect)
- **5 dashboards** com tema Neon Terminal (HUB, WDO, WIN, MERCADO, CORR)
- **Pipeline Python unificado** (`scripts/orquestrador.py`)
- **Snapshot pre-run** automatico via `Servico_Unificado_SAFE.bat`
- **CI** com GitHub Actions + pre-commit hook
- **Node.js** (Cotacoes/): 5590 linhas TS, 4 sub-servicos, 0 TODOs

### Evolucoes E21-E25 (Fase A) — ✅ TODAS FEITAS
- **E21 SABR** ✅ — `src/calculator/iv_smile.py` (13 testes)
- **E22 Volga** ✅ — `src/calculator/volatility.py` (6 testes)
- **E23 Stress Testing** ✅ — `src/calculator/stress_test.py`
- **E24 Correlacao EWMA** ✅ — `src/calculator/correlation_ewma.py`
- **E25 IV Bisect** ✅ — `src/greeks.py` (5 testes)

### Estrutura
```
src/calculator/        # 6 submodules (mixin pattern)
├── __init__.py
├── core.py            # __init__, calculate_flips_and_walls, get_summary_metrics
├── flips.py           # FlipsMixin
├── greeks_exposure.py # GreeksExposureMixin
├── volatility.py      # VolatilityMixin
├── walls.py           # WallsMixin
└── fair_value.py      # FairValueMixin
src/greeks.py          # Black-Scholes engine (com broadcast fix E8/E17)
src/config.py          # Configuracoes (com 6 dead flags removidas E14)
src/tradingview_fetcher.py  # Spot prices TradingView
tests/                 # 30+ testes
dashboard_unificado/   # 6 dashboards (HUB, WDO, WIN, MERCADO, CORR, CONTROLE, CONTROLE_DADOS)
.edi_agent/            # Sistema de auto-aprendizado
```

### Modos automaticos ativos
1. **Auto-Aprendizado** → `learning/LEARNING_COMPLETE.md`
2. **Auto-Refatoracao** → `evolution/EVOLUTION_COMPLETE.md`
3. **Auto-Evolucao** → `MATH_REVIEW.md` + `EVOLUTION.md`
4. **Auto-Registro** → `CHECKPOINT.md` + `checkpoint_history/`
5. **Auto-Snapshot** → `scripts/hooks/pre_run_snapshot.py`

---

## FASE A: EVOLUCAO DOS MODELOS MATEMATICOS (E21-E25) — ✅ 100% COMPLETA

> **Auditoria 2026-06-20**: todas as 5 evolucoes desta fase estao **implementadas e testadas** (91/91 testes passam).

### E21: IV Smile Parametrico (SABR) ✅ FEITO
- **Embasamento**: Hoje, IV per-strike e interpolado linearmente entre strikes conhecidos. Para opcoes OTM/ITM muito distantes, o smile e extrapolado linearmente — pouco realista. O modelo **SABR** (Stochastic Alpha Beta Rho) e o padrao da industria para IV smile.
- **Formula**:
  - dF = α·F^β · dW₁
  - dα = ν·α · dW₂
  - com correlacao ρ entre W₁ e W₂
  - Aproximacao de Hagan: σ_implied(F, K, T, α, β, ρ, ν)
- **Como fazer**:
  1. Criar `src/calculator/iv_smile.py` com classe `SABRModel`
  2. Implementar `implied_vol(F, K, T, alpha, beta, rho, nu)` (Hagan approximation)
  3. Calibrar α, β, ρ, ν com minimos quadrados a partir de `iv_strike_ref` real
  4. Adicionar testes em `tests/test_sabr.py`
  5. Integrar ao `OptionsCalculator.__init__` (substituir interpolacao linear)
- **Risco**: MEDIO (calibracao pode falhar em dados esparsos)
- **Esforco**: 4-6h

### E22: Volga (∂V/∂σ²) Implementacao Completa ✅ FEITO
- **Embasamento**: Volga mede a curvatura da grega Vega em relacao a volatilidade. Essencial para analise de risco de segunda ordem. Hoje esta apenas parcialmente implementado.
- **Formula**: Volga = S·φ(d1)·√T · (d1·d2)/σ
- **Como fazer**:
  1. Adicionar `calculate_volga()` em `src/calculator/volatility.py` (ou criar `volga.py` mixin)
  2. Implementar diferencas finitas como verificacao
  3. Adicionar testes em `tests/test_volga.py`
  4. Integrar no `get_summary_metrics()`
- **Risco**: BAIXO (formula fechada)
- **Esforco**: 1-2h

### E23: Stress Testing (Analise de Sensibilidade)
- **Embasamento**: O S2 do plano original. Permite simular cenarios "what-if" (+1σ spot, -2σ vol, time decay +1d) e gerar heatmap de P&L.
- **Como fazer**:
  1. Criar `src/calculator/stress_test.py` (mixin)
  2. Implementar `calculate_stress_scenarios()` com grid 5x5 (5 spot shifts × 5 vol shifts)
  3. Para cada cenario: recalcular GEX, Flip, Walls
  4. Adicionar UI no HUB ou criar `dashboard_unificado/stress/`
  5. Testes: `tests/test_stress.py`
- **Risco**: MEDIO (UI nova e o lado mais arriscado)
- **Esforco**: 3-4h

### E24: Correlacao Dinamica (EWMA) para `dashboard_unificado/correlation/`
- **Embasamento**: S4 do plano original. A correlacao atual e estatica. EWMA (Exponentially Weighted Moving Average) permite correlacao dinamica com decaimento temporal.
- **Formula**: ρ_t = λ·ρ_{t-1} + (1-λ)·r_t·r'_t
- **Como fazer**:
  1. Localizar implementacao atual em `correlation/index.html` ou JS
  2. Criar `src/calculator/correlation_ewma.py` (server-side) OU implementar em JS
  3. UI: input para λ (default 0.94)
  4. Testes: `tests/test_ewma.py`
- **Risco**: BAIXO (matematica bem conhecida)
- **Esforco**: 2-3h

### E25: Smile Dinamico a partir de Opcoes Reais ✅ FEITO
- **Embasamento**: Hoje, se `iv_strike_ref` nao esta disponivel, fallback para IV flat. Pode-se **calcular IV implicita via bisseccao** (ja ha codigo em `core.py:__init__`). Evoluir para usar a coluna `Last` (preco de mercado) de TODAS as opcoes.
- **Como fazer**:
  1. Ja existe `_implied_vol_bisect()` em `core.py`
  2. Refinar para tratamento robusto de edge cases (T<1d, ITM, low liquidity)
  3. Adicionar log quando IV calculada diverge do flat
  4. Testes: `tests/test_iv_bisect.py` com casos reais
- **Risco**: BAIXO
- **Esforco**: 1-2h

---

## FASE B: APRIMORAMENTO DO DASHBOARD MERCADO (E26-E30)

### E26: MERCADO — Cobertura de Testes
- **Embasamento**: MERCADO tem 80 arquivos JS (1.6MB) e zero testes. Mudancas podem quebrar silenciosamente.
- **Como fazer**:
  1. Criar `Cotacoes/dashboard/MERCADO/tests/` (estrutura espelhada)
  2. Adicionar tests para blocos criticos: `boot.js`, `core-kit.js`, `regime-conviction.js`
  3. Mockar `window.marketData` para isolar logica
  4. Integrar ao `tests/run_all.py`
- **Risco**: BAIXO
- **Esforco**: 3-4h

### E27: MERCADO — Code Splitting / Lazy Loading
- **Embasamento**: 80 arquivos JS carregam todos no boot, mesmo se nao usados. Causa TTI (Time To Interactive) alto.
- **Como fazer**:
  1. Auditar quais blocos sao essenciais no boot (overview, ticker, boot)
  2. Implementar dynamic import() para blocos nao-criticos
  3. Adicionar skeleton/spinner durante carregamento
  4. Medir TTI antes/depois (DevTools)
- **Risco**: MEDIO (pode quebrar se blocos tem dependencias nao declaradas)
- **Esforco**: 4-6h

### E28: MERCADO — Validacao de Schema dos .js/.json
- **Embasamento**: Existem 18 arquivos de dados (.js/.json) sem validacao. Se um campo mudar ou sumir, dashboard pode quebrar silenciosamente.
- **Como fazer**:
  1. Criar `Cotacoes/tools/market/lib/schema-validator.ts`
  2. Definir schemas JSON para cada data file (`market_quotes.schema.json`, etc)
  3. Validar em CI (workflow `cotacoes-validate.yml` ja existe)
  4. Mostrar badges de "dados validos" no HUB
- **Risco**: BAIXO
- **Esforco**: 2-3h

### E29: MERCADO — Service Worker para Offline
- **Embasamento**: Trader pode perder conexao durante pregao. Cache local permite visualizar ultimo estado.
- **Como fazer**:
  1. Criar `Cotacoes/dashboard/MERCADO/sw.js` (service worker)
  2. Estrategia: cache-first para data files, network-first para HTML
  3. Manifest.json para PWA install
  4. Indicador visual "offline mode"
- **Risco**: MEDIO (debugging de SW e dificil)
- **Esforco**: 3-4h

### E30: MERCADO — Refatoracao `core-kit.js` (59KB)
- **Embasamento**: `core-kit.js` e o maior arquivo (59KB), provavelmente contem multiplas responsabilidades.
- **Como fazer**:
  1. Auditar: listar todas as funcoes exportadas
  2. Identificar grupos de funcionalidade (ex: formatters, calculations, renderers)
  3. Split em 3-4 arquivos especializados
  4. Manter `core-kit.js` como re-export (backward compat)
- **Risco**: MEDIO
- **Esforco**: 3-4h

---

## FASE C: APRIMORAMENTO DOS OUTROS DASHBOARDS (E31-E34)

### E31: HUB — Dashboard de Saude do Sistema
- **Embasamento**: HUB tem 4.8KB, e so redirecionador. Pode ser expandido para mostrar status do pipeline.
- **Como fazer**:
  1. Adicionar cards de status: "Ultima atualizacao: HH:MM", "31/31 testes", "Proximo slot: 20:00"
  2. Conectar com `/api/health` (novo endpoint no `orquestrador.py`)
  3. Visual estilo Neon Terminal
- **Risco**: BAIXO
- **Esforco**: 2-3h

### E32: WDO/WIN — Unificacao de Charts Duplicados
- **Embasamento**: REFACTOR_LOG.md (4.6) — charts.js WDO (2222 linhas) e WIN (2010 linhas) sao 100% diferentes, mas fazem coisas similares. Oportunidade de refatorar para shared/charts.js.
- **Como fazer**:
  1. Extrair API comum: `renderGEX(chart, data)`, `renderDeltaFlip(chart, data)`, etc
  2. Criar `dashboard_unificado/shared/charts-core.js` com funcoes puras
  3. Refatorar WDO/charts.js e WIN/charts.js para usar shared
  4. Manter 100% compat (mesmos SVGs/canvases)
- **Risco**: ALTO (charts.js e UI critica, regressao = perda de funcionalidade)
- **Esforco**: 6-8h

### E33: CORR — Finalizar Implementacao
- **Embasamento**: CORR esta "em desenvolvimento" (REFACTOR_LOG). Falta integracao dos 14 supergraficos.
- **Como fazer**:
  1. Auditar quais 14 sub-paginas estao funcionais vs placeholder
  2. Priorizar 3-4 mais uteis (rolling-corr, superchart, market-overview, currency-strength)
  3. Implementar os demais como "coming soon"
  4. Adicionar testes E2E (Playwright)
- **Risco**: BAIXO-MEDIO
- **Esforco**: 4-6h

### E34: CONTROLE — Sincronizacao com Snapshot System
- **Embasamento**: CONTROLE mostra status dos dados. Pode se integrar ao `pre_run_snapshot.py` para mostrar "ultimo backup: HH:MM".
- **Como fazer**:
  1. Adicionar API `/api/snapshots` no `orquestrador.py` (lista + metadata)
  2. CONTROLE consome a API e mostra timeline
  3. Botao "Restaurar ultimo" com confirmacao
- **Risco**: BAIXO
- **Esforco**: 2-3h

---

## FASE D: ESTRUTURA & PROCESSO (E35-E40)

### E35: API REST no Orquestrador
- **Embasamento**: Hoje, dashboards acessam dados via `window.marketData` (carregado de .js). API REST permite acesso programatico.
- **Como fazer**:
  1. Adicionar Flask/FastAPI no `orquestrador.py` (porta 3433)
  2. Endpoints: `/api/health`, `/api/options/{symbol}`, `/api/snapshots`
  3. Auth basica (API key)
  4. Documentar em OpenAPI
- **Risco**: MEDIO (auth + seguranca)
- **Esforco**: 4-6h

### E36: Testes E2E com Playwright
- **Embasamento**: 31 testes unitarios nao cobrem fluxo de UI.
- **Como fazer**:
  1. Adicionar `@playwright/test` ao projeto
  2. Criar `tests/e2e/` com cenarios:
     - HUB → WDO: navegacao + render
     - WDO → market_data.js carrega
     - Snapshot/restore flow
  3. CI: rodar e2e em ubuntu-latest
- **Risco**: BAIXO
- **Esforco**: 4-6h

### E37: Auto-Pull de Snapshots no Inicio
- **Embasamento**: Ao abrir o dashboard, deveria carregar ultimo snapshot se dados estiverem stale.
- **Como fazer**:
  1. Script JS no HUB: `if (lastUpdate > 30min) { showRestorePrompt() }`
  2. Botao "Restaurar ultimo snapshot" → AJAX para `/api/snapshots/restore?latest=1`
  3. Adicionar metrica "data freshness" no HUB
- **Risco**: BAIXO
- **Esforco**: 1-2h

### E38: Logging Estruturado em JSON
- **Embasamento**: Logs em texto puro sao dificeis de parsear. JSON permite integracao com Datadog/CloudWatch.
- **Como fazer**:
  1. Substituir `logging.basicConfig` por `python-json-logger` ou similar
  2. Padronizar campos: timestamp, level, module, message, context
  3. Adicionar correlation_id para tracking cross-process
- **Risco**: BAIXO
- **Esforco**: 2-3h

### E39: Documentacao OpenAPI/Swagger
- **Embasamento**: Sem documentacao formal das APIs internas. Onboarding de novos devs e dificil.
- **Como fazer**:
  1. Adicionar docstrings no formato Google a todas as funcoes publicas
  2. Usar `sphinx` ou `mkdocs` para gerar docs
  3. Publicar em `docs/api/`
  4. CI: falha se docstrings faltam
- **Risco**: BAIXO
- **Esforco**: 4-6h

### E40: Migracao para Type Hints Completos
- **Embasamento**: `core.py` tem type hints parciais. Cobertura total permitiria mypy --strict.
- **Como fazer**:
  1. Adicionar `from __future__ import annotations` em todos os modulos
  2. Tipar `pd.DataFrame`, `np.ndarray[Any, np.dtype[np.float64]]` corretamente
  3. Adicionar mypy ao CI
  4. Corrigir erros gradualmente
- **Risco**: BAIXO
- **Esforco**: 6-8h

---

## FASE E: AUTOMACAO & PRODUTIVIDADE (E41-E44)

### E41: Auto-Update de Dependencias
- **Embasamento**: `requirements.txt` e `Cotacoes/package.json` ficam desatualizados.
- **Como fazer**:
  1. Adicionar Dependabot config (`.github/dependabot.yml`)
  2. Semanalmente, abre PR automatico com updates
  3. CI valida que testes ainda passam
- **Risco**: BAIXO
- **Esforco**: 1h

### E42: Snapshot Automatico Agendado
- **Embasamento**: Hoje snapshot so e criado manualmente. Idealmente, rodar 4x/dia antes dos slots do pipeline.
- **Como fazer**:
  1. Adicionar cron-like schedule em `orquestrador.py`:
     - `04:00, 07:00, 12:00, 18:00 BRT`
  2. Antes de cada slot, criar snapshot
  3. Manter apenas 10 mais recentes (ja tem auto-purge)
- **Risco**: BAIXO
- **Esforco**: 2-3h

### E43: Dashboard de Metricas (Grafana-style)
- **Embasamento**: Metricas dispersas em logs. Um dashboard interno ajudaria debugging.
- **Como fazer**:
  1. Criar `/api/metrics` retornando JSON: tempo medio de calculo, numero de erros, etc
  2. Adicionar pagina em `dashboard_unificado/metrics/` consumindo API
  3. Graficos: latencia, throughput, error rate
- **Risco**: BAIXO
- **Esforco**: 3-4h

### E44: Skill: Auto-Discovery de Novas Telas
- **Embasamento**: Toda nova pagina precisa ser adicionada manualmente ao `unified-nav.js`. Pode ser auto.
- **Como fazer**:
  1. Skill no `unified-nav.js`: scan `dashboard_unificado/*/index.html` no boot
  2. Detectar automaticamente: titulo, icone (do primeiro emoji), categoria (path)
  3. Auto-add ao DASHBOARDS array
- **Risco**: BAIXO
- **Esforco**: 1-2h

---

## FASE F: MIGRACAO v3 → v1 (E45) ⭐

### E45: Migrar `dashboard_v3` → `dashboard_unificado` (WDO + WIN) — Eliminar dashboard_v3.html
- **Embasamento**: `dashboard_v3.html` e um relatorio standalone de **5.18 MB (WDO) + 5.26 MB (WIN)** gerado pelo sistema legado. Contem **31 secoes** de visualizacao Plotly para analise de opcoes. Porem o `dashboard_unificado/WDO/index.html` (v1) ja tem **27+ charts** equivalentes usando Chart.js. Falta apenas **3-4 secoes exclusivas** do v3 no v1. **Eliminar v3** e integrar seus exclusivos ao destino com tema Neon Terminal.

#### Arquivos do v3 (5.18 MB WDO + 5.26 MB WIN = ~10.4 MB)
- `Auto_B3_System/Edi_OpenInterest - PY - Stranger - WDO/dashboard_v3.html`
- `Auto_B3_System/Edi_OpenInterest - PY - Stranger - Indice - REV1/dashboard_v3.html`

#### Stack de graficos: Chart.js (manter estilo v1, mais leve)
- v3 usa Plotly 3.3.1 (5.18MB) — mais pesado
- v1 usa Chart.js (canvas) — mais leve
- Decisao: **manter Chart.js** no v1, portar 3 secoes do v3

#### Mapeamento v3 vs v1 (AMBOS WDO+WIN)

| # | Secao v3 | Existe no v1? | Acao |
|---|---|---|---|
| 1 | Resumo Executivo | SIM | Manter |
| 1.1 | Simulacao Fair Value | SIM | Manter |
| 2 | Tabela Detalhada (Fig 3) | SIM | Manter |
| **3** | **Comparativo de Modelos Flip/Delta** | **NAO** | **Migrar (NOVO)** |
| **4** | **Analise Detalhada de Estrutura** | **NAO** | **Migrar (NOVO)** |
| 5 | Codigo NTSL (ProfitChart) | Parcial | Adicionar bloco visual |
| 6-22 | 17 charts identicos (Delta, Gamma, Vanna, Charm, Theta, Vega, OI, R-Gamma) | SIM | Manter |
| **23** | **Strikes + Midwalls + Fibo** | **NAO** | **Migrar (NOVO)** |
| 24-31 | 8 charts identicos (Walls, Flow, Flip, Cone, Max Pain, MM, Expected) | SIM | Manter |

**Resultado**: 31 secoes no v3, **28 ja existem** no v1, **3 sao NOVAS** que precisam ser adicionadas.

#### Dados de origem (ja existem no OptionsCalculator)

| Chart v3 | Origem no v1 (ja calculado) |
|---|---|
| #3 Comparativo Flip/Delta | `calc.flip_variations` (7 modelos ja calculados) |
| #4 Analise Estrutura | `calc.strikes_ref`, `oi_call_ref`, `oi_put_ref`, `walls`, `range_low/high`, `regime` |
| #5 Codigo NTSL | `window.marketData.ntsl_script` (ja gerado pelo pipeline) |
| #23 Strikes + Midwalls + Fibo | `calc.fib_levels`, `calc.midwalls_strikes/call/put` (ja calculados) |

**Conclusao**: **Todos os dados JA EXISTEM**. So falta UI!

#### Como Fazer (Passo a Passo)

**E45.1 — Confirmar mapeamento (auditar WIN v3)**
1. Abrir `Edi_OpenInterest - PY - Stranger - Indice - REV1/dashboard_v3.html`
2. Listar 31 secoes (assumir simetria com WDO)
3. Confirmar que 3 charts exclusivos sao identicos em WIN e WDO
4. Documentar diferencas

**E45.2 — Adicionar 4 secoes ao WDO v1 (Chart.js + tema Neon)**
- Adicionar HTML das 4 secoes em `dashboard_unificado/WDO/index.html`
- Criar funcoes JS em `WDO/assets/js/charts.js` para popular tabelas
- Estilo Neon Terminal: cores `#ff073a` `#00f3ff` `#ff00ff`, fontes Orbitron/Share Tech Mono

**E45.3 — Replicar para WIN**
- Copiar 4 secoes de WDO/index.html → WIN/index.html
- Ajustar IDs (WDO usa `uupOiChart`, WIN usa `ewzOptionsOiChart`)
- Testar ambos os dashboards
- Se duplicacao ≥200 linhas, extrair para `dashboard_unificado/shared/wdo_win_extras.js`

**E45.4 — Remover geracao do v3**
1. Identificar onde v3 e gerado:
   - `Auto_B3_System/Edi_OpenInterest - PY - Stranger - WDO/main.py`
   - `Auto_B3_System/Edi_OpenInterest - PY - Stranger - WDO/update_fig3_export.py`
   - Análogos WIN em `Indice - REV1/`
2. Comentar/desativar geracao (manter por 30 dias, depois remover)
3. Mover `dashboard_v3.html` e `dashboard_v3.pdf` para `archive/`
4. Documentar em commit

**E45.5 — Atualizar `export_v1_data.py`**
- Garantir que `market_data.js` expoe:
  - `flip_variations` (ja tem)
  - `fib_levels` (ja tem)
  - `midwalls_strikes/call/put` (ja tem)
  - `ntsl_script` (ja tem)
- **Nada precisa mudar** — apenas UI

#### Risco
- **MEDIO** — UI changes, mas 100% backward-compat (apenas adiciona)
- Mitigacao: testes E2E (Playwright) cobrem nova navegacao

#### Esforco
- E45.1 (auditar WIN): 30 min
- E45.2 (HTML+JS WDO): 4h
- E45.3 (replicar WIN): 2h
- E45.4 (remover v3): 1h
- E45.5 (verificar export): 30 min
- **Total**: ~8h

#### Metricas de Sucesso
- 4 novas secoes visiveis em WDO e WIN
- Tema Neon Terminal aplicado
- `dashboard_v3.html` removido do pipeline
- ~10.4 MB liberados (5.18 WDO + 5.26 WIN)
- 0 geracao automatica de v3 apos essa evolucao
- 30+ testes E2E (Playwright) passando

---

## BACKLOG (E46-E65)

### Dashboard improvements
- **E46**: HUB - Adicionar gráfico de "última semana" (spot + GEX flip)
- **E47**: WDO - Adicionar tooltips em todos os charts (hover details)
- **E48**: WIN - Adicionar comparação WDO vs WIN (split-view)
- **E49**: CORR - Adicionar "Top 10 pares correlacionados" como widget no HUB
- **E50**: CONTROLE - Auto-save de configurações (JSON em localStorage)

### Mathematics
- **E51**: Greeks de 2a ordem (Volga, Veta) - completar
- **E52**: Modelo de Heston (volatilidade estocástica)
- **E53**: Local Volatility (Dupire)
- **E54**: Volatility Surface fitting (SVI - stochastic volatility inspired)

### Pipeline / Data
- **E55**: Cache inteligente de CSVs (mtime-based invalidation)
- **E56**: Data warehouse SQLite (em vez de JSON files)
- **E57**: Auto-discovery de novos símbolos (sem hardcode)
- **E58**: Backup automático para cloud (S3/GCS)

### UX / Performance
- **E59**: Code splitting no HUB (lazy load de dashboards pesados)
- **E60**: Service Worker unificado (todos dashboards funcionam offline)
- **E61**: Tema dark/light toggle (com persistência)
- **E62**: Mobile-first responsive design (atualmente desktop-only)

### DevOps
- **E63**: Docker Compose (orquestrador + python + ts + chrome)
- **E64**: CI Matrix expandido (Python 3.10, 3.11, 3.12 + Node 18, 20, 22)
- **E65**: Release automation (auto-tag + changelog)

---

## PRIORIZACAO

### Q1 (proximas 2 semanas) - Quick wins
| ID | Descricao | Esforco | Risco |
|---|---|---|---|
| E22 | Volga (∂V/∂σ²) completa | 1-2h | Baixo |
| E25 | Smile dinamico via bisseccao | 1-2h | Baixo |
| E31 | HUB dashboard de saude | 2-3h | Baixo |
| E37 | Auto-pull snapshots no inicio | 1-2h | Baixo |
| E42 | Snapshot automatico agendado | 2-3h | Baixo |
| E44 | Skill auto-discovery de telas | 1-2h | Baixo |
| **Total Q1** | | **8-13h** | |

### Q2 (1-2 meses) - Foundation
| ID | Descricao | Esforco | Risco |
|---|---|---|---|
| E21 | IV Smile SABR | 4-6h | Medio |
| E23 | Stress Testing | 3-4h | Medio |
| E26 | MERCADO tests | 3-4h | Baixo |
| E35 | API REST no orquestrador | 4-6h | Medio |
| E36 | Testes E2E com Playwright | 4-6h | Baixo |
| E38 | Logging JSON estruturado | 2-3h | Baixo |
| E45 | Migrar v3 → v1 (WDO+WIN) | 8h | Medio |
| **Total Q2** | | **28-37h** | |

### Q3 (3-6 meses) - Optimization
| ID | Descricao | Esforco | Risco |
|---|---|---|---|
| E24 | Correlacao EWMA | 2-3h | Baixo |
| E27 | Code splitting MERCADO | 4-6h | Medio |
| E28 | Schema validator MERCADO | 2-3h | Baixo |
| E30 | Refatorar core-kit.js | 3-4h | Medio |
| E32 | Charts unificados WDO/WIN | 6-8h | Alto |
| E33 | Finalizar CORR | 4-6h | Baixo-Medio |
| E34 | CONTROLE sync snapshots | 2-3h | Baixo |
| E39 | OpenAPI/Swagger | 4-6h | Baixo |
| E40 | Type hints completos | 6-8h | Baixo |
| E41 | Dependabot | 1h | Baixo |
| E43 | Metrics dashboard | 3-4h | Baixo |
| E29 | Service Worker MERCADO | 3-4h | Medio |
| **Total Q3** | | **40-55h** | |

### Backlog (Q4+) - Nice to have
- E46-E50, E51-E54, E55-E58, E59-E65 (~20 melhorias diversas)

---

## METRICAS-ALVO (12 meses)

| Metrica | Hoje | Meta |
|---|---|---|
| Testes passando | 31 | 60+ |
| Cobertura (calculator) | ~60% | 90% |
| Cobertura (MERCADO JS) | 0% | 50% |
| Cobertura (WDO/WIN JS) | 0% | 50% |
| Dashboard TTI | ~5s | <2s |
| Snapshots/dia | 1 manual | 4 automaticos |
| Dead code | 0KB | 0KB |
| Type hints coverage | 30% | 95% |
| Documentacao | 70% | 95% |
| Tamanho do projeto | ~50MB | ~40MB (apos E45) |

---

## NOTAS

1. Cada evolucao deve ser implementada com:
   - Branch dedicado (`feat/E21-sabr-iv-smile`)
   - Testes de regressao (≥1 teste por evolucao)
   - Documentacao em `.edi_agent/EVOLUTION.md` e/ou `MATH_REVIEW.md`
   - Commit semantico (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`)
   - Run all tests: `python tests/run_all.py` (deve passar 100%)

2. Antes de implementar Q2/Q3, criar **branch** e **PR review** com o usuario.

3. Para evolucoes de UI (B, C, F), fazer **screenshot antes/depois** para documentar.

4. Para evolucoes matematicas (A), publicar **derivacao matematica** em `MATH_REVIEW.md` antes de codificar.

5. Em caso de duvida entre escopo e velocidade: **escolha escopo**, faca um MVP, itere.

---

## CHANGELOG

- **2026-06-19 v1.0**: Criacao do documento. 45 evolucoes (E21-E65) em 6 fases. Baseado em auditoria completa do projeto.

---

*Este documento e vivo. Adicionar E66+ conforme implementacoes.*
