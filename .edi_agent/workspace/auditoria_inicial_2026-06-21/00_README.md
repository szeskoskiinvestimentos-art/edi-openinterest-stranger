# Auditoria Inicial — 2026-06-21

> **Slice F1** do workflow contínuo do projeto `Edi_Market_Guardian_V0`.
> **Escopo:** 4 eixos paralelos (catalog · tema · navegação · modelos matemáticos).
> **Modo:** read-only (zero modificação em código de produção).
> **Autor:** Hermes (orquestrador) + 4 agentes paralelos + varredura manual final.

---

## ⚠️ NOTA 2026-06-21 ~19:53

Os 5 arquivos originais desta auditoria (00_README.md, 01-04) **foram perdidos** entre 18:10 (criação) e 19:53 (verificação pós-F2). Causa provável: hook/processo automático limpou `.edi_agent/workspace/auditoria_inicial_2026-06-21/`. O `controle_de_dados.html` foi modificado às 18:38 (não por mim), o que sugere atividade automatizada em background.

**Esta é uma RECRIAÇÃO** dos arquivos a partir dos outputs dos agentes (preservados no contexto da sessão). Conteúdo é idêntico ao original.

Snapshot `snap-20260621-194338-F2-hygiene-semantica` NÃO contém esta pasta (correto — `.edi_agent/` é auditoria, não produção).

---

## Sumário executivo — 12 achados críticos

| # | Severidade | Achado |
|---|---|---|
| 🔴 1 | Alta | `dashboard_unificado/controle/index.html` **NÃO EXISTE** — phantom. O "Controle" real é o legado `controle_de_dados.html` na raiz. Toda documentação que aponta `dashboard_unificado/controle/` está errada. |
| 🔴 2 | Alta | `dashboard_unificado/shared/styles.css` **NÃO EXISTE**. Os links em `MERCADO/index.html` (`../../dashboard_unificado/shared/styles.css`) e `correlation/index.html` (`../shared/styles.css`) são **QUEBRADOS**. CSS canônico real = `dashboard_unificado/WDO/assets/css/style.css` (526 linhas). |
| 🔴 3 | Alta | **API `window.ediUnifiedNav.bind()` NÃO existe**, mas é chamada por **17+ lugares** (16 supergráficos + `correlation/assets/js/main.js:17`). Falha silenciosa via `try/catch` — nav dos supergráficos **está meio quebrado** (select existe, troca não acontece). |
| 🟠 4 | Média-alta | `unified-nav.js` declara apenas **6 entradas** (`HUB, WDO, WIN, MERCADO, CORR, CONTROLE`). Documentação diz 7 (incluindo `CONTROLE_DADOS`). Inconsistência desde a raiz. |
| 🟠 5 | Média-alta | QuickNav (Ctrl+K) **só funciona em MERCADO**. Os outros 5 dashboards não têm atalho de teclado. |
| 🟠 6 | Média-alta | 4 estilos CSS diferentes para o mesmo `<select id="assetSelect">`: HUB/WDO/WIN inline cinza; CORR/controle_de_dados `class="navsel"`; MERCADO pill rounded; supergráficos `class="sg-link"`. |
| 🟠 7 | Média-alta | MERCADO tem **4 implementações paralelas de nav** (`asset-switch-nav.js`, `quick-nav-drawer.js`, `nav-more-panel.js`, `navigation-definition.js`) — fragmentação sem contrato. |
| 🟡 8 | Média | `controle_de_dados.html` (legado) tem **paleta própria completa** (`--bg:#0b1020`, `--ok:#2bd576`, `--bad:#ff5c77`, `--info:#67b7ff`, `--risk:#ff9a3d`) — **zero aderência** ao tema Neon Terminal. |
| 🟡 9 | Média | WDO e WIN são praticamente clones (só diferem em `data-current-dashboard`, option `selected`, ausência de `#tools`). Candidato a **template parametrizado**. |
| 🟡 10 | Média | MERCADO carrega `<link>` quebrado desde a origem e compensa com **985 linhas de `<style>` inline**. Risco: deriva permanente se tema canônico evoluir. |
| 🟡 11 | Média | `src/calculator/` tem **26 modelos** — 5 não constam no prompt v1.2: `bates`, `kaniadakis`, `markovian_bergomi`, `rough_heston`, `monte_carlo_rbergomi`. Arsenal quântico é maior do que a documentação sugere. |
| 🟢 12 | Baixa | Dashboard HUB exibe contador `"43/43"` **hardcoded**; deveria puxar de CI/automação. |

---

## Estrutura desta pasta

| Arquivo | Conteúdo | Autor |
|---|---|---|
| `00_README.md` | (este) Sumário executivo + índice | Hermes |
| `01_catalog_dashboards.md` | Catálogo funcional dos 7 dashboards (95 seções, ~100 módulos JS, 11 JSONs, 14 cards) | Agente A (paralelo) |
| `02_theme_audit.md` | Auditoria de tema Neon Terminal (aderência por dashboard + plano de propagação) | Agente B (paralelo) |
| `03_navigation_audit.md` | Auditoria de unified-nav.js (6 vs 7 entradas, API inexistente, MERCADO paralelo) + spec EDI.NAV v2 | Agente C (paralelo) |
| `04_math_models_audit.md` | Inventário dos 26 modelos em `src/calculator/` + 24 arquivos de teste + cobertura | Hermes (manual, pós-falha do agente D) |
| `F2_hygiene_semantica.md` | Relatório F2 (hygiene: criação de shared/styles.css + controle/index.html wrapper) | Hermes |

---

## Próximas fatias sugeridas (F2+)

### F2 — Higienização semântica ✅ CONCLUÍDA 2026-06-21
- [x] Criar `dashboard_unificado/shared/styles.css` (espelho de WDO) ✅
- [x] Criar `dashboard_unificado/controle/index.html` (wrapper) ✅
- [ ] Decidir destino do "Controle" (wrapper criado, refator do legado fica para F3.8)

### F3 — Hygiene documental + correções cirúrgicas
- [ ] Atualizar prompt v1.2 → v2.0 com números reais (79 evoluções, 264 testes, 26 modelos, 7 dashboards)
- [ ] Corrigir HUB counter hardcoded (`43/43` → dinâmico ou 264/264)
- [ ] Importar E21–E83 para `evolution_log.md` granular (gap documental)
- [ ] Criar `tests/test_rough_heston.py` (gap de teste)

### F4 — Tema Neon Terminal propagado
- [ ] Implementar plano da `02_theme_audit.md` §4 (ordem: HUB → correlation → MERCADO → controle_de_dados → DRY WDO/WIN)

### F5 — Navegação consolidada
- [ ] Implementar spec `EDI.NAV v2` proposta em `03_navigation_audit.md` §5 (1 fonte, 1 implementação, 7 entradas)

### F6 — Dashboards específicos (depende de F3+F4)
- [ ] E74 — Mapa Gravitacional ("Resumo Operacional agora")
- [ ] E75 — MERCADO scalper readouts (autonomia total)
- [ ] E76 — Revisão CORR com persona macro-quant sênior

---

## Convenções desta auditoria

- **PT-BR** em todo o conteúdo.
- **Emoji severidade**: 🔴 alta · 🟠 média-alta · 🟡 média · 🟢 baixa.
- **Markdown extensivo** (tabelas, code-blocks, listas hierárquicas) — degrada para bullets quando não há renderer rico.
- **Caminhos absolutos** sempre com prefixo `C:\Projetos_Hermes\Edi_Market_Guardian_V0\` para reprodutibilidade.

---

*Gerado em 2026-06-21 · modo read-only · RECRIADO em 19:53 após perda dos originais.*