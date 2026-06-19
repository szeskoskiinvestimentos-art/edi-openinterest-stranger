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
| **CONTROLE** | [dashboard_unificado/controle/index.html](dashboard_unificado/controle/index.html) | Painel de controle |
| **CONTROLE_DADOS** | [controle_de_dados.html](controle_de_dados.html) | Versão legado |

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

# Rodar suite de testes (30 testes)
python tests/run_all.py

# Snapshot (backup antes de executar)
python scripts/hooks/pre_run_snapshot.py create --label "nome"
python scripts/hooks/pre_run_snapshot.py list
python scripts/hooks/pre_run_snapshot.py restore
```

## CI / Testes

- **GitHub Actions**: `.github/workflows/tests.yml` roda `tests/run_all.py` em push/PR
- **Pre-commit**: `.pre-commit-config.yaml` roda antes de cada commit
- **Total de testes**: 30/30 passando
  - 9 originais (sintaxe, BS Greeks, T=0, charm, vega, 0DTE, gamma cone, navigation, safety)
  - 3 Gamma Flip (GEX sign, base consistency, 7 variações)
  - 3 IV Smile (per-strike, GEX diff, skew)
  - 9 Calculator Core (max_pain, expected_moves, walls, flow, pinning, etc)
  - 2 Charts (Plotly figure, sem exceções)
  - 2 NTSL (script retorna string, keywords)
  - 2 Regressão (E8 broadcast, E10 IV per-strike)

## Estrutura

```
Edi_Market_Guardian_V0/
├── src/                          # Código Python
│   ├── calculator/               # Motor de cálculo (6 submodules mixin)
│   │   ├── core.py               # OptionsCalculator principal
│   │   ├── flips.py              # Gamma flip, 7 variações
│   │   ├── greeks_exposure.py    # Acumulação de Greeks
│   │   ├── volatility.py         # VRP, expected moves, pinning
│   │   ├── walls.py              # Max pain, effective walls
│   │   └── fair_value.py         # MM PnL, fair value
│   ├── greeks.py                 # Engine Black-Scholes (vetorizado)
│   ├── config.py                 # Configuração
│   ├── data_loader.py            # Loading de CSVs
│   ├── ntsl.py                   # Geração de scripts NTSL
│   ├── charts.py                 # Gráficos Plotly
│   ├── tables.py                 # Tabelas Plotly
│   ├── tradingview_fetcher.py    # Captura spot prices (paralelo)
│   └── utils.py                  # Utilitários
├── tests/                        # Suite de testes (30 testes)
│   ├── conftest.py               # Fixtures compartilhados
│   ├── run_all.py                # Runner principal
│   ├── test_greeks.py            # Testes Greeks
│   ├── test_gamma_flip.py        # Testes GEX + flip
│   ├── test_iv_smile.py          # Testes IV per-strike
│   ├── test_calculator_core.py   # Testes core methods
│   ├── test_charts.py            # Testes Plotly
│   └── test_ntsl.py              # Testes NTSL
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
│   │   ├── auto_evolution/       # Log de evoluções (E1-E22)
│   │   └── auto_learning/        # Aprendizados
│   └── skills/                   # Skills do agente
├── Servico_Unificado.bat         # Wrapper Python
├── Servico_Unificado_FORCE.bat   # Wrapper FORCE
├── Servico_Unificado_SAFE.bat    # Wrapper SAFE (snapshot)
├── COMANDOS.txt                  # Manual de comandos
└── requirements.txt              # Dependências Python
```

## Evoluções (E1-E22)

| ID | Categoria | Descrição |
|----|-----------|-----------|
| E1-E5 | Pipeline & Dados | Atomic write, spot validation, decouple WDO/WIN, tight loop fix |
| E6-E8, E17 | Código & Bug Fixes | Greeks broadcast fix, BS price broadcast fix |
| E9-E12, E20 | Testes | Gamma flip, IV smile, calculator core, charts, NTSL |
| E10 | Matemática IV | IV per-strike integration (Delta/Gamma usam IV real) |
| E13-E14, E18-E19 | Limpeza | Print→Logger, dead flags, calculator split, orphan cleanup |
| E15-E16 | UI & Navegação | Dashboard normalization, AUTO_DETECT paths |
| E21 | Performance | Scraping paralelo (ThreadPoolExecutor, ~93% mais rápido) |
| E22 | Documentação | Docstrings para APIs internas |

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
