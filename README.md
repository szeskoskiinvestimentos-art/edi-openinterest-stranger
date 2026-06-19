# EDI Market Guardian V0

> Painel de Análise de Opções B3 (WDO/WIN) com Correlações e Controles de Mercado

## Acesso Rápido

- **Hub principal**: [dashboard_unificado/index.html](dashboard_unificado/index.html) (`file:///C:/Projetos_Hermes/Edi_Market_Guardian_V0/dashboard_unificado/index.html`)
- **WDO (opções dólar)**: [dashboard_unificado/WDO/index.html](dashboard_unificado/WDO/index.html)
- **WIN (opções índice)**: [dashboard_unificado/WIN/index.html](dashboard_unificado/WIN/index.html)
- **Mercado (cotações)**: [Cotacoes/dashboard/MERCADO/index.html](Cotacoes/dashboard/MERCADO/index.html)
- **Correlações**: [dashboard_unificado/correlation/index.html](dashboard_unificado/correlation/index.html)
- **Controle (novo)**: [dashboard_unificado/controle/index.html](dashboard_unificado/controle/index.html)
- **Controle de dados (legado)**: [controle_de_dados.html](controle_de_dados.html)

## Como rodar

```bash
# Pipeline protegido (cria snapshot antes)
Servico_Unificado_SAFE.bat --once

# Atualizar spot prices (TradingView)
python scripts/update_spot_prices.py --target ALL

# Rodar suite de testes
python tests/run_all.py

# Limpar Chrome profile periodicamente
python scripts/hooks/clean_chrome_profile.py
```

## CI / Testes

- **GitHub Actions**: `.github/workflows/tests.yml` roda `tests/run_all.py` em push/PR
- **Pre-commit**: `.pre-commit-config.yaml` roda `--quick` antes de cada commit
- **Total de testes**: 26/26 passando
  - 9 originais (sintaxe, BS Greeks, T=0, charm, vega, 0DTE, gamma cone, navigation, safety)
  - 6 integrados (IV Smile, GEX Signed — validados por E7/E10)
  - 9 calculator core (max_pain, expected_moves, walls, flow, pinning, etc)
  - 2 regressão (E8 broadcast, E10 IV per-strike)

## Estrutura

```
Edi_Market_Guardian_V0/
├── dashboard_unificado/    # 7 dashboards
│   ├── shared/             # CSS, JS, unified-nav
│   ├── WDO/                # Opções dólar
│   ├── WIN/                # Opções índice
│   ├── correlation/        # Matriz de correlação
│   └── controle/           # Painel de controle
├── Cotacoes/               # TypeScript pipeline + dashboard MERCADO
├── src/                    # Python: Black-Scholes
│   ├── calculator/         # OptionsCalculator (modular)
│   ├── greeks.py           # GreeksEngine
│   ├── config.py           # Configurações
│   └── ...
├── Auto_B3_System/         # Barchart + Chrome scraping
├── scripts/
│   ├── hooks/              # pre_run_snapshot, clean_chrome_profile
│   ├── orquestrador.py     # Daemon principal
│   ├── export_v1_data.py   # Gerador market_data
│   └── ...
├── tests/                  # 26 testes + run_all.py
├── docs/                   # Documentação
└── .edi_agent/             # Sistema de auto-aprendizado
    ├── skills/             # 11 skills
    ├── templates/          # 3 templates
    ├── snapshots/          # Auto-snapshots pre-run
    ├── tests/              # Golden values
    ├── workspace/          # Estado vivo
    └── evolution/          # Histórico de evoluções
```

## Documentação

- **[.edi_agent/README.md](.edi_agent/README.md)** — Índice do sistema de auto-aprendizado
- **[.edi_agent/CHECKPOINT.md](.edi_agent/CHECKPOINT.md)** — Estado atual
- **[.edi_agent/REFACTOR_LOG.md](.edi_agent/REFACTOR_LOG.md)** — Auditoria de navegação
- **[.edi_agent/MATH_REVIEW.md](.edi_agent/MATH_REVIEW.md)** — Modelos matemáticos
- **[.edi_agent/EVOLUTION.md](.edi_agent/EVOLUTION.md)** — Evoluções (E1-E14)
- **[.edi_agent/workspace/SESSION_LOG.md](.edi_agent/workspace/SESSION_LOG.md)** — Log de sessões
- **[.edi_agent/PLAN_UNIFIED.md](.edi_agent/PLAN_UNIFIED.md)** — Plano unificado

## Critico

- **NÃO editar** manualmente arquivos em `dashboard_unificado/*/assets/data/market_data.*` — são regenerados pelo pipeline
- Use `Servico_Unificado_SAFE.bat` (cria snapshot antes)
- Se algo der errado: `python scripts/hooks/pre_run_snapshot.py restore`
