# Auto-Registro - Estado Atual do Projeto

> **Última atualização**: 2026-06-19 09:15 (Fim da Fase de Estabilização)
> **Próxima revisão**: após cada commit

---

## Estado do Sistema (Pós-Fase de Estabilização)

### Arquitetura (CONFIRMADA)
```
Edi_Market_Guardian_V0/
├── .edi_agent/                    # Sistema de auto-aprendizado
│   ├── snapshots/                 # NOVO - snapshots pre-run
│   ├── skills/                    # 11 skills (3 novas em 2026-06-19)
│   ├── templates/                 # NOVO - templates reutilizáveis
│   ├── tests/                     # NOVO - golden values
│   ├── evolution/                 # Histórico de evolução
│   ├── learning/                  # Aprendizados
│   ├── workspace/                 # Estado vivo
│   └── checkpoint_history/        # Histórico de checkpoints
├── dashboard_unificado/           # HUB central - 6 dashboards
│   ├── index.html                 # Painel principal
│   ├── shared/                    # CSS, JS compartilhados (4 files)
│   ├── WDO/                       # Opções dólar
│   ├── WIN/                       # Opções índice
│   ├── correlation/               # Matriz + supergraphics (14 páginas)
│   └── controle/                  # NOVO - Painel de controle
├── Cotacoes/                      # Sistema de Cotações (TypeScript)
│   ├── dashboard/MERCADO/         # Painel de mercado
│   └── tools/market/              # Pipeline TypeScript
├── src/                           # Motor Python (Black-Scholes)
├── Auto_B3_System/                # Automação Barchart (com Chrome)
├── docs/                          # Documentação
├── scripts/
│   ├── export_v1_data.py          # Gerador market_data
│   ├── update_spot_prices.py      # Atualizador spot (5min)
│   ├── gerar_controle.py
│   ├── publish-artifacts.ps1
│   ├── verify_update.py
│   └── hooks/                     # NOVO
│       ├── pre_run_snapshot.py    # Snapshot pre-execução
│       └── clean_chrome_profile.py # Limpeza Chrome
├── tests/                         # Testes Python
├── docs/                          # Documentação
├── exports/                       # Outputs gerados
└── *.bat / *.py                   # Wrappers de inicialização
```

### Dashboards Ativos (6)
| Dashboard | Caminho | Status |
|---|---|---|
| HUB | `dashboard_unificado/index.html` | ✅ Funcional |
| WDO | `dashboard_unificado/WDO/index.html` | ✅ Funcional |
| WIN | `dashboard_unificado/WIN/index.html` | ✅ Funcional |
| MERCADO | `Cotacoes/dashboard/MERCADO/index.html` | ✅ Funcional |
| CORR | `dashboard_unificado/correlation/index.html` | ✅ Funcional |
| CONTROLE | `dashboard_unificado/controle/index.html` | ✅ Funcional |
| CONTROLE_DADOS | `controle_de_dados.html` (raiz) | ✅ Funcional |

### Navegação
- **Sistema unificado**: `dashboard_unificado/shared/unified-nav.js`
- **Seletor dropdown**: Com `<optgroup>` em todas as 7 telas
- **Painel Ctrl+K**: Auto-inject em todas as telas
- **Status**: ✅ Robusto (detecta HUB mesmo em URL `/dashboard_unificado/`)

### CRÍTICO: Pipeline de Regeneração
**Arquivos regenerados pelo pipeline (NÃO EDITAR MANUALMENTE):**
- `dashboard_unificado/WIN/assets/data/market_data.{js,json}` — por `export_v1_data.py` + `update_spot_prices.py`
- `dashboard_unificado/WDO/assets/data/market_data.{js,json}` — por `update_spot_prices.py`
- `dashboard_unificado/WIN/assets/data/ntsl_script.txt` — por `export_v1_data.py`
- `controle_de_dados.html` — por `servico_unificado.py` + `gerar_controle.py`
- `Cotacoes/dashboard/MERCADO/assets/data/*.{js,json}` — por `Cotacoes/tools/market/*`
- `.edi_service_state.json` — por `servico_unificado.py`

**Solução implementada**: Use `Servico_Unificado_SAFE.bat` em vez de `Servico_Unificado.bat` para criar snapshot automático pré-execução. Snapshots em `.edi_agent/snapshots/snap-YYYYMMDD-HHMMSS/`.

---

## Tarefas Concluídas — Sessão 2026-06-19

### Fase CRÍTICA: Estabilização (Concluída 09:15)
- ✅ **CP-003**: 24 dias de trabalho acumulado **protegido** (commit 7d9fcca9, 284 arquivos)
- ✅ **CP-004**: Sistema de snapshot pre-run implementado (`scripts/hooks/pre_run_snapshot.py`)
- ✅ **CP-005**: Wrapper `Servico_Unificado_SAFE.bat` criado
- ✅ **CP-006**: `.edi_service_state.json` corrigido (path antigo → atual)
- ✅ **CP-007**: Chrome profile limpo (698 MB → 18 MB, **680 MB liberados**)
- ✅ **CP-008**: `__pycache__` da raiz removido
- ✅ **CP-009**: `.gitignore` reforçado (PDFs exports, Chrome profile, __pycache__)

### Fase: Documentação e Skills
- ✅ **CP-010**: `.edi_agent/README.md` consolidado (índice único)
- ✅ **CP-011**: `skills/INDEX.md` criado (índice de 11 skills)
- ✅ **CP-012**: 3 skills aprendidas criadas (impact-analyzer, priority-sorter, regression-detector)
- ✅ **CP-013**: Templates criados (`checkpoint.md`, `skill.md`, `evolution.md`)

---

## Arquivos Críticos (NÃO MODIFICAR SEM TESTE)

1. `dashboard_unificado/shared/unified-nav.js` — Navegação central
2. `dashboard_unificado/shared/main-shared.js` — Módulo compartilhado
3. `dashboard_unificado/shared/styles.css` — Estilos globais
4. `src/calculator.py` — Motor Black-Scholes
5. `src/greeks.py` — Cálculo de gregas
6. `src/config.py` — Configurações do backend
7. `scripts/export_v1_data.py` — Gerador de market_data
8. `scripts/update_spot_prices.py` — Spot price (5min)
9. `servico_unificado.py` — Daemon principal
10. `Cotacoes/tools/market/gerar_controle.py` — Gerador controle_de_dados.html

---

## Próximos Passos

Ver [`workspace/PLAN.md`](workspace/PLAN.md) para o plano ativo detalhado.

Imediato:
1. **Implementar IV Smile** (F4 do plano unificado) — melhorar precisão de gregas
2. **Validar Gamma Flip Signed** (P1 do MATH_REVIEW)
3. **Adicionar testes de regressão** (skill regression-detector)
4. **Limpar snapshots > 7 dias** automaticamente

Backlog:
- F1: Limpar snapshots Auto_B3_System
- F2: Criar shared/charts.js
- F3: Remover dados hardcoded
