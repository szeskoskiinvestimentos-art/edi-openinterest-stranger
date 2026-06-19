# Plano Unificado de Execução - EDI Market Guardian V0

**Consolidação:** 2026-06-19
**Fontes:** PLAN.md, PLANO_EXECUCAO.md, execution_plan.md, execution_plan_v2.md

---

## Fase 1: Mapeamento e Diagnóstico ✅ CONCLUÍDA (2026-06-18)

| ID | Tarefa | Status | Fonte |
|----|--------|--------|-------|
| CP-001 | Mapeamento completo da estrutura | ✅ | execution_plan |
| CP-002 | Criação de modos automáticos | ✅ | execution_plan |
| Identificação de 350+ arquivos | ✅ | execution_plan |
| Mapeamento de rotas de navegação | ✅ | execution_plan |
| Identificação de duplicados e órfãos | ✅ | execution_plan |
| Identificação de 27 arquivos na raiz | ✅ | execution_plan_v2 |
| Verificação de diretórios existentes | ✅ | execution_plan_v2 |
| Identificação de hardcoded paths | ✅ | execution_plan_v2 |
| Identificação de 12+ arquivos órfãos | ✅ | PLANO_EXECUCAO |
| Identificação de Three.js não utilizado | ✅ | PLANO_EXECUCAO |
| Identificação de 5 JSONs duplicados | ✅ | PLANO_EXECUCAO |
| Identificação de código 100% duplicado | ✅ | PLANO_EXECUCAO |
| Identificação de dependência cruzada frágil | ✅ | PLANO_EXECUCAO |
| Identificação de inconsistência tabela HTML/JS | ✅ | PLANO_EXECUCAO |

---

## Fase 2: Correções Críticas ✅ CONCLUÍDA (2026-06-18)

| ID | Tarefa | Status | Fonte |
|----|--------|--------|-------|
| T1.1 | Corrigir vercel.json loop infinito | ✅ | PLAN, REFACTOR_LOG (R9) |
| T1.2 | Corrigir Charm sinal invertido | ✅ | PLAN, REFACTOR_LOG (R10) |
| T1.3 | Corrigir HVL Flip inconsistência | ✅ | PLAN, REFACTOR_LOG (R11) |
| T1.4 | Corrigir 0DTE restrito a sexta | ✅ | PLAN, REFACTOR_LOG (R12) |
| T1.5 | Corrigir mutação estado global | ✅ | PLAN, REFACTOR_LOG (R13) |

### Mudanças em Cálculos

| Arquivo | Linha | Mudança | Impacto |
|---------|-------|---------|---------|
| src/calculator.py | 326-332 | Charm: inverter sinal para -dDelta/dT | CRÍTICO |
| src/calculator.py | 416 | HVL Flip: usar gex_flip_base | CRÍTICO |
| src/calculator.py | 728 | 0DTE: remover restrição weekday==4 | MODERADO |
| src/calculator.py | 786 | Gamma Cone: usar alpha diretamente | MODERADO |
| src/greeks.py | 93 | Vega: documentar convenção por unidade | BAIXO |

---

## Fase 3: Limpeza e Remoção de Resíduos ✅ CONCLUÍDA (2026-06-18)

### Arquivos Removidos

| Arquivo/Pasta | Motivo | Fonte |
|---------------|--------|-------|
| dashboard_v1/ | Legado, substituído por dashboard_unificado | PLAN, execution_plan |
| START_DASHBOARD_V1.bat | Launcher do dashboard_v1 | PLAN |
| setup_repo.ps1 | Setup inicial obsoleto | PLAN |
| package.json (raiz) | Vazio `{}` | PLAN |
| package-lock.json (raiz) | Resíduo | PLAN |
| USDBRL_AnaliseDeOpcoes - Rev4.ipynb | Notebook antigo | PLAN |
| PDF PreMercado/ | PDFs de data específica | PLAN |
| scripts/start_server.py | Servidor trivial não referenciado | PLAN |
| tests/static_check.ps1 | Caminho hardcoded obsoleto | PLAN |
| .edi_system/ | Duplicata de .edi_agent | PLAN |
| patch.py | Sobrescrevia gerar_controle.py | PLANO_EXECUCAO |
| patch_gerar_controle.py | Sobrescrevia write_controle_de_dados_html | PLANO_EXECUCAO |
| patch_bats.py | Patchava Servico_Unificado_FORCE.bat | PLANO_EXECUCAO |
| atualizar_controle.py | Stub quebrado sem imports | PLANO_EXECUCAO |
| dashboard_v3.html | Output antigo | PLANO_EXECUCAO |
| dashboard_v3.pdf | PDF do output antigo | PLANO_EXECUCAO |
| update_notebook_modes_final.py | Script legado | PLANO_EXECUCAO |
| update_notebook_modes_v2.py | Script legado | PLANO_EXECUCAO |
| update_notebook_sentiment.py | Script legado | PLANO_EXECUCAO |
| update_fig3_export.py | Script legado | PLANO_EXECUCAO |
| update_headless_script.py | Script legado | PLANO_EXECUCAO |
| update_index_link.py | Script legado | PLANO_EXECUCAO |

### Limpeza de Logs e Cache (~675 arquivos)

| Pasta | Arquivos Removidos |
|-------|-------------------|
| Cotacoes/.edi-market-guardin/logs/ | 520+ arquivos |
| service_logs/ | 89 arquivos |
| Auto_B3_System/Debug/ | 64 arquivos |
| Auto_B3_System Chrome profiles quebrados | Vários |

### .gitignore Atualizado
- Adicionadas regras para logs, service_logs, Debug, exports

**Espaço recuperado:** ~60 MB

---

## Fase 4: Consolidação de Código Compartilhado ✅ CONCLUÍDA (2026-06-18)

| ID | Tarefa | Status | Fonte |
|----|--------|--------|-------|
| T2 | Consolidar particles.js (3 cópias → 1 shared) | ✅ | PLAN, REFACTOR_LOG (R14) |
| T3 | Adicionar optgroup nos selects (CORR, CONTROLE, MERCADO) | ✅ | PLAN, REFACTOR_LOG (R15) |
| T4 | Remover arquivos legados | ✅ | PLAN |

### particles.js
- **Mantido:** shared/js/particles.js
- **Removido:** WDO/assets/js/particles.js, WIN/assets/js/particles.js
- **Atualizado:** Referências em 4 HTMLs (WIN, controle, correlation, controle_de_dados)

---

## Fase 5: Otimização e Documentação ✅ CONCLUÍDA (2026-06-18)

| ID | Tarefa | Status | Fonte |
|----|--------|--------|-------|
| T5 | Documentar Vega, melhorar guessCurrentDashboard() | ✅ | PLAN, REFACTOR_LOG (R17, R18) |

---

## Fase 6: Limpeza Profunda ✅ CONCLUÍDA (2026-06-18)

| ID | Tarefa | Status | Fonte |
|----|--------|--------|-------|
| T6 | Limpar arquivos órfãos e resíduos | ✅ | EVOLUTION_LOG |
| Remover pasta vazia Cotacoes/dashboard/WDO/ | ✅ | EVOLUTION_LOG |
| Remover pasta vazia Auto_B3_System/.../components/ | ✅ | EVOLUTION_LOG |
| Remover arquivo teste test_barchart.png | ✅ | EVOLUTION_LOG |
| Remover arquivos debug soltos | ✅ | EVOLUTION_LOG |
| Remover arquivo sem extensão Modernização | ✅ | EVOLUTION_LOG |
| Remover arquivo sem extensão ProjetoGrafico | ✅ | EVOLUTION_LOG |

---

## Fase 7: Testes ⏳ PENDENTE

| ID | Tarefa | Prioridade |
|----|--------|-----------|
| T6 | Testar navegação em 6 telas | Alta |
| T7 | Testar cálculos de gregas | Alta |
| T8 | Testar deploy Vercel | Média |

---

## Fase 8: Oportunidades Futuras

| ID | Oportunidade | Prioridade |
|----|-------------|-----------|
| F1 | Limpar snapshots Auto_B3_System | Média |
| F2 | Criar shared/charts.js | Média |
| F3 | Remover dados hardcoded | Baixa |
| F4 | Implementar lazy loading | Baixa |
| F5 | Smile de Volatilidade (SABR/SVI) | Baixa |
| F6 | Greeks de segunda ordem (Vanna, Volga) | Baixa |
| F7 | Análise de sensibilidade/stress testing | Baixa |
| F8 | Correlação dinâmica (EWMA) | Baixa |
| F9 | Dealer Flow Analysis expandido | Baixa |

---

## Estatísticas

- **Fases concluídas:** 6 de 8
- **Tarefas concluídas:** 30+
- **Arquivos modificados:** 10+
- **Arquivos removidos:** 680+
- **Espaço recuperado:** ~60 MB
- **Problemas críticos corrigidos:** 5

---

## Riscos Identificados

| Risco | Nível | Status |
|-------|-------|--------|
| Dados sensíveis expostos no Git | CRÍTICO | Verificar .gitignore |
| Dashboard_v1 dependências ocultas | ALTO | Removido |
| Chrome profiles dados importantes | MÉDIO | Profiles quebrados removidos |
| PDFs necessários para referência | BAIXO | PDF PreMercado removido |
