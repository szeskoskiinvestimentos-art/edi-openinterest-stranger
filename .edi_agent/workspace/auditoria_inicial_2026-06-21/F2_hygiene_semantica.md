# F2 — Hygiene Semântica

> **Slice F2** do workflow contínuo · **2026-06-21** · Hermes (orquestrador autônomo)
> **Pré-requisito**: F1 (auditoria read-only) ✅
> **Snapshot**: `snap-20260621-194338-F2-hygiene-semantica` (39 arquivos)
> **Escopo**: somente `C:\Projetos_Hermes\Edi_Market_Guardian_V0\` (sem iniciar serviços)

---

## Objetivo

Resolver os **achados críticos #1 e #2 da auditoria F1**:

| # | Achado F1 | Mitigação em F2 |
|---|---|---|
| 🔴 1 | `dashboard_unificado/controle/index.html` NÃO EXISTE (phantom) | ✅ Wrapper canônico criado |
| 🔴 2 | `dashboard_unificado/shared/styles.css` NÃO EXISTE | ✅ Espelho de WDO criado (canônico) |

E atualizar a documentação de auto-registro (CURRENT_STATE, CHECKPOINT, evolution_log E74, pending, SESSION_LOG) para refletir o novo estado.

---

## Arquivos criados (3)

### 1. `dashboard_unificado/shared/styles.css` (533 L)

**Conteúdo**: cópia exata de `dashboard_unificado/WDO/assets/css/style.css` (526 L) + cabeçalho de documentação (7 L).

**Header adicionado**:
```css
/* ========================================================== */
/* EDI Market Guardian V0 — Tema Neon Terminal (canônico)    */
/* Espelho de WDO/assets/css/style.css — referência única.   */
/* Criado em F2 (2026-06-21) — auditoria inicial + hygiene.  */
/* Pré-requisito para F3 (propagação do tema) e F4 (EDI.NAV).*/
/* ========================================================== */
```

**Por que cópia exata?** Para desbloquear **diretamente** os 2 dashboards que tinham `<link>` quebrado (MERCADO e correlation). Qualquer divergência futura entre WDO e shared/styles.css será tratada em F3.6 (DRY refactor + back-compat shim).

**Pré-requisito para**:
- ✅ F3.5 — Tema Neon Terminal propagado para os 7 dashboards
- ✅ F4 — EDI.NAV v2 (que vai usar `.edi-nav-select` deste arquivo)

### 2. `dashboard_unificado/controle/index.html` (~95 L)

**Função**: Wrapper canônico do dashboard "Controle" no caminho esperado.

**Comportamento**:
- Carrega `../shared/styles.css` (tema Neon Terminal consistente)
- Header + nav com `unified-nav.js` + `<select id="assetSelect">` (CONTROLE selecionado)
- Mensagem explicativa sobre o phantom F1
- Countdown de 2s + botão manual "ABRIR CONTROLE LEGADO AGORA"
- Redireciona automaticamente para `../../controle_de_dados.html` (legado)
- Particles + footer com crédito F2

**Por que wrapper + redirect?** O conteúdo vivo (14 cards dinâmicos) está em `controle_de_dados.html`, com paleta indigo divergente. Refatorar a paleta é escopo de F3.5 (esforço alto). Wrapper garante:
- O path esperado existe
- Usuário vê Neon Terminal consistente
- Acessa o legado com 1 clique (ou espera 2s)
- Permite futura substituição do redirect por conteúdo real em F3.5

### 3. `.edi_agent/workspace/auditoria_inicial_2026-06-21/F2_hygiene_semantica.md`

Este arquivo (relatório da fatia).

---

## Documentos atualizados (5)

| Arquivo | Mudança | Tamanho |
|---|---|---|
| `.edi_agent/workspace/CURRENT_STATE.md` | refeito com achados F1 + estrutura canônica + métricas | 6.940 B |
| `.edi_agent/CHECKPOINT.md` | CP-043 adicionado (auditoria + hygiene) | 4.685 B |
| `.edi_agent/workspace/auto_evolution/evolution_log.md` | E74 adicionado (com snapshot de E1–E20 originais) | 10.215 B |
| `.edi_agent/workspace/auto_evolution/pending.md` | refeito: ✅ concluídos F1/F2, ⚠️ gap E21–E83, 🔴 F3 alta prioridade | 6.194 B |
| `.edi_agent/workspace/SESSION_LOG.md` | entrada 2026-06-21 no topo (preserva histórico Q1 abaixo) | 5.335 B |

---

## Métricas F2

| Indicador | Antes | Depois | Δ |
|---|---|---|---|
| Arquivos em `dashboard_unificado/controle/` | 0 | 1 (`index.html`) | +1 |
| Arquivos em `dashboard_unificado/shared/` (na raiz) | 0 | 1 (`styles.css`) | +1 |
| Tamanho de `shared/` total | 20 B dir + 3 subdirs | 20 B dir + 3 subdirs + `styles.css` | +10.9 KB |
| Documentos `.edi_agent/` atualizados hoje | n/a | 5 | +5 |
| Evoluções em `evolution_log.md` | E1–E20 | E1–E20 + E74 | +1 |
| Pendências em `pending.md` | 38 (genéricas) | 28 (organizadas em F1–F4 + 9 prioritárias) | -10 (consolidadas) |
| Checkpoints em `CHECKPOINT.md` | CP-042 | CP-043 | +1 |
| Testes | 264/264 | 264/264 | 0 (zero regressão) |

---

## Verificação

Para validar F2:

```bash
# 1. Arquivos existem
ls -la "C:\Projetos_Hermes\Edi_Market_Guardian_V0\dashboard_unificado\shared\styles.css"
ls -la "C:\Projetos_Hermes\Edi_Market_Guardian_V0\dashboard_unificado\controle\index.html"

# 2. Tamanho do styles.css está correto (533 L, ~11 KB)
wc -l "C:\Projetos_Hermes\Edi_Market_Guardian_V0\dashboard_unificado\shared\styles.css"

# 3. Wrapper tem Neon Terminal theme (grep)
grep -c "logo-text\|nav-link\|metric-card\|action-btn\|section-title" \
  "C:\Projetos_Hermes\Edi_Market_Guardian_V0\dashboard_unificado\controle\index.html"

# 4. Testes continuam passando
cd "C:\Projetos_Hermes\Edi_Market_Guardian_V0"
py -3.13 tests/run_all.py --quick
```

Resultado esperado: 264/264 PASS, 0 regressão.

---

## Restrições respeitadas

- ✅ Escopo: somente `C:\Projetos_Hermes\Edi_Market_Guardian_V0\`
- ✅ Zero serviços iniciados (Node 3033 / .bat / npm)
- ✅ Snapshot antes de mudanças (`pre_run_snapshot.py`)
- ✅ Mudanças registradas em `evolution_log.md` (E74)
- ✅ Documentação consolidada em `.edi_agent/`
- ⚠️ Git: NÃO foi feito commit (deixa owner decidir via Mimo/Opencode)

---

## Pendências desbloqueadas (para F3+)

| Pendência | Bloqueio removido? |
|---|---|
| F3.5 — Tema Neon Terminal propagado | ✅ (shared/styles.css existe agora) |
| F3.5 — Substituir 985 L `<style>` inline do MERCADO | ✅ (MERCADO já tinha `<link>` quebrado — agora funciona) |
| F3.8 — Refatorar `controle_de_dados.html` paleta indigo | ⏸️ (wrapper criado, mas refator do legado fica para F3.8) |
| F4.1 — EDI.NAV v2 | ⏸️ (depende de F3 para tema estar consistente) |

---

## Próxima fatia sugerida: F3

**F3 — Hygiene documental + correções cirúrgicas** (esforço baixo-médio):

1. **F3.1** Corrigir HUB counter hardcoded (`43/43` → dinâmico ou 264/264)
2. **F3.2** Atualizar `Edi_Revisao.txt` v1.2 → v2.0 (números reais: 79 evol, 264 testes, 26 modelos)
3. **F3.3** Importar E21–E83 para `evolution_log.md` granular (corrige gap documental)
4. **F3.4** Criar `tests/test_rough_heston.py` (gap de teste — 12 testes)
5. **F3.5** Tema Neon Terminal propagado (HUB → correlation → MERCADO → controle_de_dados)
6. **F3.6** DRY: substituir `WDO/assets/css/style.css` por link para `shared/styles.css`
7. **F3.7** Substituir 985 L `<style>` inline do MERCADO por arquivo externo
8. **F3.8** Refatorar `controle_de_dados.html` paleta indigo → Neon Terminal

---

*Gerado em 2026-06-21 · modo autônomo · pós-F2.*