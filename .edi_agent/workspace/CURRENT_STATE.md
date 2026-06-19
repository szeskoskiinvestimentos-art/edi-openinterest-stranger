# Estado Atual do Projeto

> **Última atualização**: 2026-06-19 09:15
> **Versão do agente**: 3.0 (consolidado)

## Estrutura do Projeto
```
Edi_Market_Guardian_V0/
├── .edi_agent/                    # Sistema auto-aprendizado (v3.0)
│   ├── README.md                   # Índice principal
│   ├── CHECKPOINT.md               # Estado resumido
│   ├── PLAN_UNIFIED.md             # Plano histórico
│   ├── snapshots/                  # NOVO - snapshots pre-run
│   ├── skills/                     # 11 skills (3 novas)
│   │   ├── INDEX.md                # NOVO - índice consolidado
│   │   ├── impact-analyzer.md      # NOVO (LA1)
│   │   ├── priority-sorter.md      # NOVO (LA2)
│   │   └── regression-detector.md  # NOVO (LA3)
│   ├── templates/                  # NOVO - templates
│   ├── tests/                      # NOVO - golden values
│   ├── evolution/                  # EVOLUTION_COMPLETE, MATH_REVIEW
│   ├── learning/                   # LEARNING_COMPLETE
│   ├── workspace/                  # Estado vivo
│   └── checkpoint_history/         # Histórico
├── dashboard_unificado/            # HUB central
│   ├── index.html                  # HUB
│   ├── shared/                     # 4 arquivos compartilhados
│   │   ├── styles.css
│   │   ├── unified-nav.js
│   │   ├── main-shared.js
│   │   └── js/ (particles, chart_data_utils)
│   ├── WDO/                        # Opções dólar
│   ├── WIN/                        # Opções índice
│   ├── correlation/                # NOVO - 14 supergraphics
│   └── controle/                   # NOVO - Painel de controle
├── Cotacoes/                       # Sistema Cotações (TypeScript)
│   ├── dashboard/MERCADO/
│   └── tools/market/
├── src/                            # Motor Python (Black-Scholes)
├── Auto_B3_System/                 # Barchart + Chrome (698→18 MB)
├── docs/
├── scripts/
│   ├── export_v1_data.py
│   ├── update_spot_prices.py
│   ├── gerar_controle.py
│   ├── publish-artifacts.ps1
│   ├── verify_update.py
│   └── hooks/                      # NOVO
│       ├── pre_run_snapshot.py     # NOVO
│       └── clean_chrome_profile.py # NOVO
└── tests/                          # Testes Python
```

## Sistemas Ativos

### 🔄 Pipeline de Dados
- **Status**: ✅ Funcional com proteção pre-run
- **Wrapper seguro**: `Servico_Unificado_SAFE.bat` (cria snapshot antes)
- **Snapshots**: 39 arquivos protegidos em `.edi_agent/snapshots/snap-20260619-090920-baseline-pre-cleanup/`
- **Pipeline completo**: 4 slots diários (06:00, 07:00, 08:30, 20:00)
- **Spot price update**: A cada 5min durante pregão

### 📊 Dashboards
- **HUB** (`dashboard_unificado/index.html`) — ✅ Funcional
- **WDO** — ✅ Funcional (market_data de 2026-06-17)
- **WIN** — ✅ Funcional (market_data de 2026-06-17)
- **MERCADO** (Cotacoes) — ✅ Funcional
- **CORR** (correlation) — ✅ Funcional (14 supergraphics)
- **CONTROLE** (`dashboard_unificado/controle/`) — ✅ NOVO
- **controle_de_dados.html** (raiz) — ✅ Funcional

### 🔐 Chrome Profile
- **Localização**: `Auto_B3_System/chrome_profile/`
- **Tamanho**: 698 MB → **18 MB** (limpo em 2026-06-19)
- **Preservado**: Login Data, Preferences, Secure Preferences, Web Data, History
- **Script de limpeza**: `scripts/hooks/clean_chrome_profile.py`

## Como Usar

### Atualizar spot prices agora:
```bash
python scripts/update_spot_prices.py --target ALL
```

### Rodar pipeline com proteção:
```bash
# USA SNAPSHOT PRÉ-EXECUÇÃO (recomendado)
Servico_Unificado_SAFE.bat --once

# SEM proteção (cuidado: sobrescreve sem backup)
Servico_Unificado.bat --once
```

### Restaurar snapshot se algo der errado:
```bash
python scripts/hooks/pre_run_snapshot.py list
python scripts/hooks/pre_run_snapshot.py restore
```

### Limpar Chrome profile periodicamente:
```bash
python scripts/hooks/clean_chrome_profile.py
```

## Pendências

1. **Smile de Volatilidade** (E3/P3) — IV estática em 33.93%
2. **Validar Gamma Flip Signed** (P1) — não padrão de mercado
3. **Testes de regressão** (skill LA3) — golden values + diff
4. **Vanna/Volga de 2ª ordem** (S2) — melhorar modelo
5. **Auto-purge de snapshots > 7 dias** (F2 do plano)

## Métricas da Sessão 2026-06-19

| Métrica | Valor |
|---|---|
| Trabalho protegido (commit 7d9fcca9) | 284 arquivos, 39.3K inserções |
| Espaço recuperado (Chrome) | 680 MB |
| Snapshots criados | 1 baseline (39 arquivos) |
| Skills criadas | 3 (LA1, LA2, LA3) |
| Templates criados | 3 (checkpoint, skill, evolution) |
| Arquivos corrigidos | 1 (.edi_service_state.json) |
| .gitignore regras adicionadas | ~37 |
| **Bugs críticos encontrados pelos testes** | **3** (SyntaxError, R12, golden values) |
| **Bugs críticos corrigidos** | **3** (calculator.py:807, :964, golden_values.json) |
| Test runner criado | `tests/run_all.py` (9 testes) |
| Testes passando | **9/9 (100%)** |
