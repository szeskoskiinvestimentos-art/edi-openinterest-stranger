# EDI Agent - Sistema de Auto-Aprendizado e Auto-Refatoração

> **Versão 3.0** — Consolidado em 2026-06-19 após 24 dias de trabalho acumulado.

Este diretório contém o sistema de **auto-aprendizado, auto-refatoração, auto-evolução e auto-registro** do projeto EDI Market Guardian.

## Índice Rápido

| O que você procura | Onde está |
|---|---|
| Estado atual do projeto (vivo) | [`workspace/CURRENT_STATE.md`](workspace/CURRENT_STATE.md) |
| Último checkpoint consolidado | [`CHECKPOINT.md`](CHECKPOINT.md) |
| Histórico completo de checkpoints | [`checkpoint_history/checkpoints.md`](checkpoint_history/checkpoints.md) |
| Plano de execução ativo | [`workspace/PLAN.md`](workspace/PLAN.md) |
| Plano unificado (histórico completo) | [`PLAN_UNIFIED.md`](PLAN_UNIFIED.md) |
| Evolução consolidada | [`evolution/EVOLUTION_COMPLETE.md`](evolution/EVOLUTION_COMPLETE.md) |
| Problemas matemáticos detectados | [`evolution/MATH_REVIEW.md`](evolution/MATH_REVIEW.md) |
| Aprendizado consolidado | [`learning/LEARNING_COMPLETE.md`](learning/LEARNING_COMPLETE.md) |
| Índice de skills | [`skills/INDEX.md`](skills/INDEX.md) |
| Log de sessão atual | [`workspace/SESSION_LOG.md`](workspace/SESSION_LOG.md) |
| Snapshots automáticos (pre-run) | [`snapshots/`](snapshots/) |

## Estrutura

```
.edi_agent/
├── README.md                       # Este arquivo
├── CHECKPOINT.md                   # Estado atual (resumo executivo)
├── PLAN_UNIFIED.md                 # Plano unificado (histórico de fases)
├── evolution/
│   ├── EVOLUTION_COMPLETE.md       # Histórico de evolução
│   ├── MATH_REVIEW.md              # Revisão matemática
│   └── README.md                   # Legado (apontador)
├── learning/
│   ├── LEARNING_COMPLETE.md        # Aprendizados consolidados
│   └── README.md                   # Legado (apontador)
├── checkpoint_history/             # Histórico detalhado de checkpoints
│   ├── checkpoints.md
│   ├── current_checkpoint.md
│   └── README.md
├── skills/                         # Skills e workflows do agente
│   ├── INDEX.md                    # Índice consolidado de skills
│   ├── auto_refactoring_workflow.md
│   ├── code-refactorer.md
│   ├── evolution-tracker.md
│   ├── math-reviewer.md
│   ├── nav-optimizer.md
│   ├── orchestration.md
│   ├── project-organizer.md
│   ├── project_organization.md
│   ├── impact-analyzer.md          # (Nova em 2026-06-19)
│   ├── priority-sorter.md          # (Nova em 2026-06-19)
│   └── regression-detector.md      # (Nova em 2026-06-19)
├── workspace/                      # Estado vivo e sessão
│   ├── CURRENT_STATE.md            # Estado detalhado
│   ├── SESSION_LOG.md              # Log da sessão atual
│   ├── PLAN.md                     # Plano ativo
│   └── README.md
├── snapshots/                      # Snapshots automáticos pré-execução
│   ├── snap-YYYYMMDD-HHMMSS-*      # Cada execução cria um
│   └── _template/                  # Estrutura de referência
└── templates/                      # Templates reutilizáveis
    ├── checkpoint.md
    ├── skill.md
    └── evolution.md
```

## Modos Ativos

### 1. Auto-Aprendizado
- **O que faz**: Registra padrões, convenções, soluções e descobertas.
- **Quando**: Contínuo — toda descoberta relevante é registrada.
- **Registro**: `learning/LEARNING_COMPLETE.md`

### 2. Auto-Refatoração
- **O que faz**: Identifica código duplicado, oportunidades de otimização, refatora com segurança.
- **Quando**: A cada inspeção ou solicitação de melhoria.
- **Registro**: `evolution/EVOLUTION_COMPLETE.md`
- **Skills**: `skills/code-refactorer.md`, `skills/auto_refactoring_workflow.md`

### 3. Auto-Evolução
- **O que faz**: Detecta problemas lógicos/matemáticos, propõe e implementa melhorias autônomas.
- **Quando**: Quando identifica problema crítico ou oportunidade.
- **Registro**: `evolution/MATH_REVIEW.md`, `evolution/EVOLUTION_COMPLETE.md`
- **Skills**: `skills/math-reviewer.md`, `skills/evolution-tracker.md`

### 4. Auto-Registro (Checkpoint)
- **O que faz**: Mantém checkpoints do estado para retomada em caso de falhas.
- **Quando**: Antes e depois de cada grande mudança.
- **Registro**: `CHECKPOINT.md`, `checkpoint_history/`

### 5. Auto-Snapshot (NOVO em 2026-06-19)
- **O que faz**: Cria snapshot automático de arquivos regeneráveis **antes** de cada execução do pipeline.
- **Resolve**: O problema CRÍTICO do "voltar para versões antigas" — o pipeline sobrescreve `market_data.js`, `ntsl_script.txt`, `controle_de_dados.html`, etc.
- **Como usar**: `Servico_Unificado_SAFE.bat` em vez de `Servico_Unificado.bat`.
- **Snapshot manual**: `python scripts/hooks/pre_run_snapshot.py`
- **Listar/restaurar**: `python scripts/hooks/pre_run_snapshot.py list|restore`

## Arquivos Críticos (NÃO MODIFICAR SEM TESTE)

1. `dashboard_unificado/shared/unified-nav.js` — Navegação central de 6 dashboards
2. `dashboard_unificado/shared/main-shared.js` — Módulo compartilhado (EDIApp)
3. `dashboard_unificado/shared/styles.css` — Estilos globais
4. `src/calculator.py` — Motor de cálculos Black-Scholes
5. `src/greeks.py` — Cálculo de gregas vetorizadas
6. `src/config.py` — Configurações do backend
7. `scripts/export_v1_data.py` — Gerador de `market_data.{js,json}`
8. `scripts/update_spot_prices.py` — Atualizador de spot price (5min)
9. `servico_unificado.py` — Daemon principal
10. `Cotacoes/tools/market/gerar_controle.py` — Gerador de `controle_de_dados.html`

## Decisões de Arquitetura

- **Acesso via `file://`**: O projeto é local. Dados são exportados como `.js` (window globals) para evitar CORS.
- **Pipeline dual**: Python (WDO/WIN) + TypeScript (Cotacoes/MERCADO) coexistem.
- **Snapshot pre-run**: TODA execução de pipeline passa pelo wrapper `Servico_Unificado_SAFE.bat`.
- **Chrome profile**: Pasta `Auto_B3_System/chrome_profile/` é usada para Playwright/scraping com login. Cache regenerável é deletado periodicamente por `scripts/hooks/clean_chrome_profile.py`.

## Próximas Ações Sugeridas

Ver [`workspace/CURRENT_STATE.md`](workspace/CURRENT_STATE.md) e [`workspace/PLAN.md`](workspace/PLAN.md).
