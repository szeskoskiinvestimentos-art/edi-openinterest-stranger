# EDI Market Guardian V0

> Painel de Análise de Opções B3 (WDO/WIN) com Correlações e Controles de Mercado

## Acesso Rápido

| Dashboard | Caminho | Descrição |
|-----------|---------|-----------|
| **HUB** | [dashboard_unificado/index.html](dashboard_unificado/index.html) | Painel principal com atalhos |
| **WDO** | [dashboard_unificado/WDO/index.html](dashboard_unificado/WDO/index.html) | Opções do dólar (USD/BRL) |
| **WIN** | [dashboard_unificado/WIN/index.html](dashboard_unificado/WIN/index.html) | Opções do índice (Ibovespa) |
| **MERCADO** | [Cotacoes/dashboard/MERCADO/index.html](Cotacoes/dashboard/MERCADO/index.html) | Cotações de mercado |
| **CORR** | [dashboard_unificado/correlation/index.html](dashboard_unificado/correlation/index.html) | Matriz de correlação |
| **CONTROLE_DADOS** | [controle_de_dados.html](controle_de_dados.html) | Versão legado (snapshot) |

## Como rodar

```bash
# Pipeline completo (Greeks + export)
python main.py

# Atualizar spot prices (TradingView + Yahoo, ~1s paralelo)
python scripts/update_spot_prices.py --target ALL

# Orquestrador (substitui .bat)
python scripts/orquestrador.py              # Modo daemon
python scripts/orquestrador.py --once       # Roda uma vez
python scripts/orquestrador.py --force      # FORCE mode

# Rodar suite de testes (211 testes)
python tests/run_all.py

# Snapshot (backup antes de executar)
python scripts/hooks/pre_run_snapshot.py create --label "nome"
python scripts/hooks/pre_run_snapshot.py list
python scripts/hooks/pre_run_snapshot.py restore
```

## CI / Testes

- **GitHub Actions**: `.github/workflows/tests.yml` roda `tests/run_all.py` em push/PR
- **Pre-commit**: `.pre-commit-config.yaml` roda antes de cada commit
- **Total de testes**: 211/211 passando
  - 9 originais (sintaxe, BS Greeks, T=0, charm, vega, 0DTE, gamma cone, navigation, safety)
  - 3 Gamma Flip (GEX sign, base consistency, 7 variações)
  - 3 IV Smile (per-strike, GEX diff, skew)
  - 9 Calculator Core (max_pain, expected_moves, walls, flow, pinning, etc)
  - 2 Charts (Plotly figure, sem exceções)
  - 2 NTSL (script retorna string, keywords)
  - 2 Regressão (E8 broadcast, E10 IV per-strike)
  - 6 Volga (E22) — ∂V/∂σ²
  - 6 IV Bisect (E25) — encontrar IV de preço
  - 5 HUB Health (E31)
  - 7 Stale Banner (E37)
  - 7 Snapshots Agendados (E42)
  - 7 Auto-Discovery (E44)
  - 12 SABR (E21) — Hagan approximation
  - 10 Structured Logging (E38)
  - 11 Stress Test (E23) — 8 cenários
  - 10 Heston (E52) — stochastic vol
  - 6 Dupire (E53) — local vol
  - 6 SVI (E54) — no-arbitrage smile
  - 7 Position P&L (E66)
  - 7 Kelly Criterion (E67)
  - 7 Veta (E22/E51) — ∂V/∂t
  - 8 Dashboards (E26) — ntsl copy, yahoo options
  - 16 VWAP (E68) — intraday
  - 14 Merton (E71) — log-normal jumps
  - 15 Kou (E72) — double-exponential jumps
  - 13 Rough Bergomi (E73) — frontier rough vol

## Estrutura

```
Edi_Market_Guardian_V0/
├── src/                          # Código Python
│   ├── calculator/               # Motor de cálculo (19 submodules)
│   │   ├── core.py               # OptionsCalculator principal
│   │   ├── flips.py              # Gamma flip, 7 variações
│   │   ├── greeks_exposure.py    # Acumulação de Greeks
│   │   ├── volatility.py         # VRP, expected moves, pinning, Volga
│   │   ├── walls.py              # Max pain, effective walls
│   │   ├── fair_value.py         # MM PnL, fair value
│   │   ├── iv_smile.py           # IV per-strike (E10)
│   │   ├── stress_test.py        # 8 cenários (E23)
│   │   ├── heston.py             # Heston 1993 (E52) ← NOVO
│   │   ├── dupire.py             # Dupire local vol (E53) ← NOVO
│   │   ├── svi.py                # SVI Gatheral 2004 (E54) ← NOVO
│   │   ├── veta.py               # Veta ∂V/∂t (E22/E51) ← NOVO
│   │   ├── merton.py             # Merton 1976 jumps (E71) ← NOVO
│   │   ├── kou.py                # Kou 2002 asym jumps (E72) ← NOVO
│   │   ├── rough_bergomi.py      # rBergomi 2016 (E73) ← NOVO
│   │   ├── vwap.py               # VWAP intraday (E68) ← NOVO
│   │   ├── position.py           # Position P&L (E66) ← NOVO
│   │   └── kelly.py              # Kelly Criterion (E67) ← NOVO
│   ├── greeks.py                 # Engine Black-Scholes (vetorizado)
│   ├── config.py                 # Configuração
│   ├── data_loader.py            # Loading de CSVs
│   ├── ntsl.py                   # Geração de scripts NTSL
│   ├── charts.py                 # Gráficos Plotly
│   ├── tables.py                 # Tabelas Plotly
│   ├── tradingview_fetcher.py    # Captura spot prices (paralelo)
│   └── utils.py                  # Utilitários
├── tests/                        # Suite de testes (211 testes, 30+ arquivos)
│   ├── conftest.py               # Fixtures compartilhados
│   ├── run_all.py                # Runner principal
│   ├── test_greeks.py            # Testes Greeks
│   ├── test_gamma_flip.py        # Testes GEX + flip
│   ├── test_iv_smile.py          # Testes IV per-strike
│   ├── test_calculator_core.py   # Testes core methods
│   ├── test_charts.py            # Testes Plotly
│   ├── test_ntsl.py              # Testes NTSL
│   ├── test_heston.py            # Heston stochastic vol (E52)
│   ├── test_dupire.py            # Dupire local vol (E53)
│   ├── test_svi.py               # SVI Gatheral (E54)
│   ├── test_veta.py              # Veta ∂V/∂t (E22/E51)
│   ├── test_merton.py            # Merton jumps (E71)
│   ├── test_kou.py               # Kou double-exponential (E72)
│   ├── test_rough_bergomi.py     # rBergomi (E73)
│   ├── test_vwap.py              # VWAP intraday (E68)
│   ├── test_position.py          # Position P&L (E66)
│   ├── test_kelly.py             # Kelly Criterion (E67)
│   ├── test_dashboards.py        # Dashboard validation (E26)
│   └── ...                       # 211 testes em 30+ arquivos
├── scripts/                      # Automação
│   ├── orquestrador.py           # Orquestrador Python (1128 linhas)
│   ├── update_spot_prices.py     # Atualização spot prices
│   ├── export_v1_data.py         # Pipeline de exportação
│   └── hooks/
│       ├── pre_run_snapshot.py   # Sistema de snapshot
│       └── clean_chrome_profile.py
├── dashboard_unificado/          # Dashboards HTML
│   ├── shared/                   # CSS + JS compartilhados
│   │   ├── styles.css            # Tema Neon Terminal
│   │   ├── unified-nav.js        # Navegação global (7 dashboards)
│   │   ├── main-shared.js        # Módulo compartilhado
│   │   └── js/                   # Particles, ChartDataUtils
│   ├── WDO/                      # Dashboard WDO
│   ├── WIN/                      # Dashboard WIN
│   ├── correlation/              # Dashboard CORR
│   └── controle/                 # Dashboard CONTROLE
├── Cotacoes/                     # Serviço Node.js + dashboard MERCADO
├── Auto_B3_System/               # Automação Barchart
├── docs/                         # Documentação
├── .edi_agent/                   # Sistema de auto-aprendizado
│   ├── workspace/                # Registro persistente
│   │   ├── auto_evolution/       # Log de evoluções (E1-E65)
│   │   └── auto_learning/        # Aprendizados
│   └── skills/                   # Skills do agente
├── Servico_Unificado.bat         # Wrapper Python
├── Servico_Unificado_FORCE.bat   # Wrapper FORCE
├── Servico_Unificado_SAFE.bat    # Wrapper SAFE (snapshot)
├── COMANDOS.txt                  # Manual de comandos
└── requirements.txt              # Dependências Python
```

## Evoluções (E1-E73 — arsenal matemático de nível institucional)

| Faixa | Categoria | Descrição |
|-------|-----------|-----------|
| E1-E5 | Pipeline & Dados | Atomic write, spot validation, decouple WDO/WIN, tight loop fix |
| E6-E8, E17 | Código & Bug Fixes | Greeks broadcast fix, BS price broadcast fix |
| E9-E12, E20 | Testes | Gamma flip, IV smile, calculator core, charts, NTSL |
| E10 | Matemática IV | IV per-strike integration (Delta/Gamma usam IV real) |
| E13-E14, E18-E19 | Limpeza | Print→Logger, dead flags, calculator split, orphan cleanup |
| E15-E16 | UI & Navegação | Dashboard normalization, AUTO_DETECT paths |
| E21 | Performance/Modelo | Scraping paralelo + SABR (Hagan approximation) |
| E22/E51 | Modelo Matemático | Volga (∂V/∂σ²) + Veta (∂V/∂t) + cross-check FD |
| E23 | Análise | Stress Testing (heatmap 5×5 spot×vol) |
| E24 | Análise | Correlação EWMA (dinâmica com λ) |
| E25 | Matemática IV | IV Bisect robusto (encontrar IV de preço de mercado) |
| E26-E30 | Cotacoes/ | MERCADO tests, code splitting, schema validator, Service Worker |
| E31 | Dashboard | HUB health dashboard |
| E32-E33 | Dashboard | Charts unificados WDO/WIN + CORR finalizar |
| E35-E36 | Infra | API REST no orquestrador + Playwright E2E |
| E37-E38 | Infra | Auto-pull snapshots + Logging JSON estruturado |
| E39-E40 | Qualidade | OpenAPI/Swagger + Type hints completos |
| E41-E42 | DevOps | Dependabot + Snapshot agendado (4x/dia) |
| E44 | Auto-aprendizado | Skill auto-discovery de telas |
| E45 | Migração BIG | v3→v1 (10.4 MB → Chart.js) [backlog] |
| E46-E49 | Dashboard | HUB gráfico semanal, tooltips, split-view WDO/WIN, top 10 pares |
| E52 | Stoch vol | Heston 1993 (mean reversion, vol-of-vol) |
| E53 | Local vol | Dupire 1994 (smile determinístico) |
| E54 | Smile param | SVI Gatheral 2004 (no-arbitrage guarantee) |
| E55-E58 | Performance | Cache CSVs mtime-based, Data warehouse SQLite |
| E59-E62 | UX | Code splitting HUB, Service Worker, dark/light toggle, mobile-first |
| E63-E65 | DevOps | Docker Compose, CI matrix expandido, Release automation |
| E66 | Operacional | Position P&L (R/R, breakeven, multiplier B3) |
| E67 | Operacional | Kelly Criterion (FULL/HALF/QUARTER/TENTH) |
| E68 | Day trade | VWAP intraday (±1σ/2σ, anchored, cross signal) |
| E71 | Jump-diff | Merton 1976 (log-normal jumps, eventos discretos) |
| E72 | Jump-diff | Kou 2002 (double-exponential, assimetria up/down) |
| E73 | Frontier | Rough Bergomi (Bayer-Friz-Gatheral 2016, H<0.5) |

### Resumo executivo Fase B (E52-E73)

22 evoluções em uma única sessão (2026-06-20) elevaram o projeto para **nível institucional**:
- **10 modelos matemáticos** (5 difusivos/stoch, 2 jump-diff, 1 rough, 2 operacionais)
- **+109 testes** (102→211, +107% de cobertura)
- **30+ commits** com bugfixes integrados (drift compensation Merton, COS method rBergomi)

## Documentação

- **[.edi_agent/README.md](.edi_agent/README.md)** — Índice do sistema de auto-aprendizado
- **[.edi_agent/CHECKPOINT.md](.edi_agent/CHECKPOINT.md)** — Estado atual
- **[.edi_agent/PROMPT_CONTINUIDADE.md](.edi_agent/PROMPT_CONTINUIDADE.md)** — Prompt para nova sessão
- **[.edi_agent/MATH_REVIEW.md](.edi_agent/MATH_REVIEW.md)** — Modelos matemáticos
- **[.edi_agent/workspace/SESSION_LOG.md](.edi_agent/workspace/SESSION_LOG.md)** — Log de sessões

## Crítico

- **NÃO editar** manualmente arquivos em `dashboard_unificado/*/assets/data/market_data.*` — são regenerados pelo pipeline
- Use `Servico_Unificado_SAFE.bat` para criar snapshot antes de executar
- Se algo der errado: `python scripts/hooks/pre_run_snapshot.py restore`

---

**Autor**: Ednilson Szeskoski dos Santos
**Licença**: Uso educacional e pessoal
