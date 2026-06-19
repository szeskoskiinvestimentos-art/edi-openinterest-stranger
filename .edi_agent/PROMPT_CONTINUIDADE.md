# PROMPT DE CONTINUIDADE - EDI Market Guardian V0

> **Data de criação**: 2026-06-19
> **Última atualização**: 2026-06-19 (v1.2 - 28 evoluções, WIN scaling doc)
> **Versão do prompt**: 1.2

---

## COMO USAR ESTE ARQUIVO

Copie e cole este prompt completo ao iniciar uma nova sessão de trabalho com o projeto. O agente deve ler este arquivo e seguir todas as orientações.

---

## CONTEXTO DO PROJETO

O **EDI Market Guardian V0** é um sistema de análise de opções financeiras para o mercado brasileiro (B3), com foco em:
- **WDO** (opções do dólar - USD/BRL)
- **WIN** (opções do índice brasileiro - Ibovespa)
- **Dashboard unificado** com 6 telas de acesso (+ 1 legado)
- **Pipeline de dados** automatizado (Barchart → Python → Dashboards)
- **Cálculos matemáticos** (Black-Scholes, Greeks, Gamma Flip, Max Pain, etc.)

---

## MODELO DE CÁLCULO WIN (EWZ → Índice)

### Fator de Escala Diário
O fator de escala é recalculado diariamente conforme o cronograma de aquisição de dados da Barchart:

```
fator_escala = WIN_SCALING_INDEX_REF_CLOSE / WIN_SCALING_EWZ_REF_CLOSE
             = 170.560 / 33.88
             ≈ 5034 (varia diariamente)
```

### Fontes de Dados
| Componente | Fonte | Variável | Descrição |
|------------|-------|----------|-----------|
| **EWZ Spot** | Barchart | `WIN_SCALING_EWZ_REF_CLOSE` | Preço de fechamento do EWZ (USD) |
| **WIN Index** | TradingView (IND1!) | `WIN_SCALING_INDEX_REF_CLOSE` | Preço de ajuste do índice quando fecha na B3 |
| **Fator de Escala** | Cálculo | `DISPLAY_SCALE_FACTOR` | Razão entre os dois |

### Fluxo Diário
1. `automacao_dados.py` roda via Barchart automation
2. Busca preço spot do EWZ no Barchart
3. Busca preço de ajuste do IND1! no TradingView (quando fecha na B3)
4. Salva em `.env.auto`:
   - `WIN_SCALING_EWZ_REF_CLOSE=34.41`
   - `WIN_SCALING_INDEX_REF_CLOSE=169578`
5. `src/config.py` calcula: `DISPLAY_SCALE_FACTOR = 169578 / 34.41 ≈ 4928`
6. Strikes EWZ são multiplicados por este fator

### Por que Escalar?
- WIN é ~5000× maior que EWZ (170K pts vs $34 USD)
- Gamma, walls, max_pain precisam estar em escala WIN para o dashboard
- EWZ e WIN são correlacionados (~0.95), mas em magnitudes diferentes

### Proteção contra Double-Scaling
- Se `EWZ_TO_INDEX_SCALE_ENABLED=false` → fator = 1.0
- Se `DISPLAY_SCALE_FACTOR` está setado → usa direto
- Senão → calcula de `SCALING_*/WIN_SCALING_*`

### Nota sobre Strikes
Os strikes "não-naturais" (68800, 73715, etc.) são **comportamento correto por design**. São strikes EWZ multiplicados pelo fator de escala diário.

---

## REGRAS OBRIGATÓRIAS

### 1. Organização e Estrutura
- **Sempre** manter a estrutura de pastas organizada
- Arquivos órfãos devem ser identificados e removidos
- Código duplicado deve ser consolidado
- Modularizar sistemas complexos que unem funções demais

### 2. Navegação entre Telas
O projeto tem 6 dashboards principais (+ 1 legado):
```
file:///C:/Projetos_Hermes/Edi_Market_Guardian_V0/dashboard_unificado/index.html      → HUB principal
file:///C:/Projetos_Hermes/Edi_Market_Guardian_V0/dashboard_unificado/WDO/index.html   → WDO (opções dólar)
file:///C:/Projetos_Hermes/Edi_Market_Guardian_V0/dashboard_unificado/WIN/index.html   → WIN (opções índice)
file:///C:/Projetos_Hermes/Edi_Market_Guardian_V0/Cotacoes/dashboard/MERCADO/index.html → MERCADO (cotações)
file:///C:/Projetos_Hermes/Edi_Market_Guardian_V0/dashboard_unificado/correlation/index.html → CORR (correlações)
file:///C:/Projetos_Hermes/Edi_Market_Guardian_V0/dashboard_unificado/controle/index.html → CONTROLE (dados) ← PRINCIPAL
file:///C:/Projetos_Hermes/Edi_Market_Guardian_V0/controle_de_dados.html               → CONTROLE_DADOS (legado)
```
**Nota**: O nav sistema (`unified-nav.js`) lista 7 entradas. `CONTROLE_DADOS` é a versão legado mantida para compatibilidade.

### 3. Restrições Críticas
- **PROIBIDO** alterar arquivos fora da pasta `C:\Projetos_Hermes\Edi_Market_Guardian_V0`
- **PROIBIDO** deletar arquivos sem confirmação (exceto órfãos identificados)
- **SEMPRE** rodar testes após mudanças: `python tests/run_all.py`
- **SEMPRE** registrar mudanças no evolution_log.md

### 4. Modos Automáticos Ativos
O projeto tem 5 modos automáticos que devem ser mantidos:

#### Auto-Aprendizado
- Registrar descobertas em `.edi_agent/workspace/auto_learning/`
- Documentar padrões identificados no código
- Salvar lições aprendidas com erros

#### Auto-Refatoração
- Detectar código duplicado e consolidar
- Identificar funções muito longas e sugerir split
- Melhorar legibilidade sem alterar comportamento

#### Auto-Evolução
- Detectar bugs automaticamente e implementar correções
- Identificar melhorias de performance
- Validar cálculos matemáticos contra referências

#### Auto-Registro
- Manter `SESSION_LOG.md` atualizado
- Criar checkpoints após cada fase importante
- Registrar todas as evoluções no `evolution_log.md`

#### Auto-Snapshot
- Usar `scripts/hooks/pre_run_snapshot.py` antes de executar automações
- Manter snapshots dos últimos 7 dias
- Restaurar snapshot se algo der errado

### 5. Estrutura de Registro
```
.edi_agent/
├── workspace/
│   ├── SESSION_LOG.md              # Log principal da sessão
│   ├── CURRENT_STATE.md            # Estado atual do projeto
│   ├── auto_evolution/
│   │   ├── evolution_log.md        # Log de todas as evoluções (E1, E2, ...)
│   │   └── pending.md              # Pendências restantes
│   ├── auto_learning/
│   │   ├── discoveries.md          # Descobertas
│   │   ├── patterns.md             # Padrões identificados
│   │   ├── lessons.md              # Lições aprendidas
│   │   └── metrics.md              # Métricas de qualidade
│   ├── skills/
│   │   └── INDEX.md                # Índice de skills
│   └── checkpoints/
│       └── checkpoint_*.md         # Checkpoints de sessão
├── CHECKPOINT.md                   # Último checkpoint consolidado
├── EVOLUTION.md                    # Evolução consolidada
├── PLAN.md                         # Plano de trabalho
└── README.md                       # Documentação do sistema
```

---

## FLUXO DE TRABALHO

### Ao Iniciar Nova Sessão
1. Ler `CHECKPOINT.md` para entender estado atual
2. Ler `evolution_log.md` para ver o que já foi feito
3. Ler `pending.md` para ver o que precisa ser feito
4. Rodar `python tests/run_all.py` para verificar estado dos testes

### Ao Executar Mudanças
1. Criar tarefa com `task create`
2. Implementar mudança
3. Rodar testes: `python tests/run_all.py`
4. Se testes passaram, marcar tarefa como done
5. Atualizar `evolution_log.md` com nova evolução (E29, E30, ...)
6. Atualizar `SESSION_LOG.md` com resumo

### Ao Finalizar Sessão
1. Atualizar `CURRENT_STATE.md`
2. Atualizar `CHECKPOINT.md`
3. Atualizar `pending.md` com próximas pendências
4. Verificar se todos os arquivos de registro estão atualizados

---

## ESTRUTURA DO PROJETO

```
Edi_Market_Guardian_V0/
├── src/                          # Código Python
│   ├── calculator/               # Motor de cálculo (6 submodules)
│   │   ├── core.py               # OptionsCalculator principal
│   │   ├── flips.py              # Gamma flip, delta flip, 7 variações
│   │   ├── greeks_exposure.py    # Acumulação de Greeks
│   │   ├── volatility.py         # VRP, expected moves, pinning
│   │   ├── walls.py              # Max pain, effective walls
│   │   └── fair_value.py         # MM PnL, fair value
│   ├── greeks.py                 # Engine Black-Scholes
│   ├── config.py                 # Configuração
│   ├── data_loader.py            # Loading de CSVs
│   ├── ntsl.py                   # Geração de scripts NTSL
│   ├── charts.py                 # Gráficos Plotly
│   ├── tables.py                 # Tabelas Plotly
│   ├── tradingview_fetcher.py    # Captura spot prices (paralelo)
│   ├── utils.py                  # Utilitários
│   └── utils_fmt.py              # Formatação brasileira
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
│   │   ├── charts-shared.js      # BaseCharts (WDO/WIN)
│   │   └── js/                   # Particles, ChartDataUtils
│   ├── WDO/                      # Dashboard WDO
│   ├── WIN/                      # Dashboard WIN
│   ├── correlation/              # Dashboard CORR
│   └── controle/                 # Dashboard CONTROLE
├── controle_de_dados.html        # Dashboard CONTROLE_DADOS (legado)
├── Cotacoes/                     # Serviço Node.js
├── Auto_B3_System/               # Automação Barchart
├── docs/                         # Documentação
├── .edi_agent/                   # Sistema de auto-aprendizado
│   ├── workspace/                # Registro persistente
│   │   ├── auto_evolution/       # Log de evoluções (E1-E28)
│   │   └── auto_learning/        # Aprendizados
│   └── skills/                   # Habilidades
├── Servico_Unificado.bat         # Wrapper Python
├── Servico_Unificado_FORCE.bat   # Wrapper FORCE
├── Servico_Unificado_SAFE.bat    # Wrapper SAFE
├── COMANDOS.txt                  # Manual de comandos
└── requirements.txt              # Dependências Python
```

---

## COMANDOS ESSENCIAIS

```bash
# Rodar suite de testes (30 testes)
python tests/run_all.py

# Atualizar spot prices (paralelo, ~1s)
python scripts/update_spot_prices.py --target ALL

# Pipeline completo (Greeks + export)
python main.py

# Orquestrador (substitui .bat)
python scripts/orquestrador.py              # Modo daemon
python scripts/orquestrador.py --once       # Roda uma vez
python scripts/orquestrador.py --force      # FORCE mode

# Snapshot
python scripts/hooks/pre_run_snapshot.py create --label "nome"
python scripts/hooks/pre_run_snapshot.py list
python scripts/hooks/pre_run_snapshot.py restore
```

---

## PRIORIDADES ATUAIS

### Prioridade ALTA
- [x] ~~Paralelizar WDO + EWZ scraping~~ ✅ (E21)
- [x] ~~Commit das mudanças pendentes~~ ✅

### Prioridade MÉDIA
- [x] ~~Documentar APIs internas (docstrings)~~ ✅ (E22)
- [x] ~~Atualizar READMEs~~ ✅ (E23)

### Prioridade BAIXA
- [x] ~~Otimizar performance do calculator~~ ✅ (E24, ~25% mais rápido)
- [x] ~~Adicionar type hints completos~~ ✅ (E25)

---

## HISTÓRICO DE EVOLUÇÕES (E1-E28)

| ID | Descrição | Status |
|----|-----------|--------|
| E1-E5 | Pipeline & Dados | ✅ |
| E6-E8, E17 | Código & Bug Fixes | ✅ |
| E9-E12, E20 | Testes | ✅ |
| E10 | Matemática IV | ✅ |
| E13-E14, E18-E19 | Limpeza | ✅ |
| E15-E16 | UI & Navegação | ✅ |
| E21 | Scraping Paralelo (~93% mais rápido) | ✅ |
| E22 | Docstrings para APIs internas | ✅ |
| E23 | Atualização dos READMEs | ✅ |
| E24 | Otimização do calculator (~25% mais rápido) | ✅ |
| E25 | Type hints completos | ✅ |
| E26 | Fix WIN spot_price upstream | ✅ |
| E27 | Fix ewz_meta.expiration stale | ✅ |
| E28 | Shared BaseCharts WDO/WIN (70% redução) | ✅ |

**Total: 28 evoluções implementadas, 30/30 testes passando**

---

## NOTAS IMPORTANTES

1. **Tema Visual**: Todos os dashboards usam tema "Neon Terminal" (cores: #ff073a, #00f3ff, #ff00ff)
2. **Navegação**: Select dropdown + QuickNav panel (Ctrl+K) - 7 entradas no nav (6 principais + 1 legado)
3. **Caminhos**: Sistema usa AUTO_DETECT para portabilidade
4. **Testes**: 30 testes cobrindo calculator, greeks, IV, flip, charts, ntsl
5. **Modular**: Calculator split em 6 submodules (mixin pattern)
6. **Legado**: `controle_de_dados.html` é a versão antiga do CONTROLE - manter para compatibilidade
7. **WIN Scaling**: Fator de escala recalculado diariamente (EWZ → WIN). Strikes "não-naturais" são correto por design.
8. **Shared Charts**: `shared/charts-shared.js` contém BaseCharts (1570 linhas). WDO/WIN extendem esta classe.
9. **Performance**: Scraping paralelo (~1s vs ~15s), calculator otimizado (~72ms vs ~96ms)

---

*Este prompt deve ser usado como ponto de partida para cada nova sessão de trabalho.*
