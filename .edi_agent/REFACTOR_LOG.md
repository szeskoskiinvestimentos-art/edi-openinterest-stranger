# REFACTOR_LOG.md - Auditoria de Navegação 7 Dashboards

> **Data**: 2026-06-19
> **Escopo**: Phase 4F — Mapear 7 dashboards, validar navegação, SEM mover arquivos

## 1. Dashboards Mapeados

| # | Nome | Caminho | Tamanho | Arquivos | Status |
|---|---|---|---|---|---|
| 1 | **HUB** | `dashboard_unificado/index.html` | 4.8 KB | 1 | ✅ Funcional |
| 2 | **WDO** | `dashboard_unificado/WDO/index.html` | 366 KB | 10 | ⚠️ Inconsistente |
| 3 | **WIN** | `dashboard_unificado/WIN/index.html` | 426 KB | 8 | ✅ Funcional |
| 4 | **MERCADO** | `Cotacoes/dashboard/MERCADO/index.html` | 27.8 MB | 118 | ✅ Funcional (TS) |
| 5 | **CORR** | `dashboard_unificado/correlation/index.html` | 130 KB | 28 | ✅ Em desenvolvimento |
| 6 | **CONTROLE** | `dashboard_unificado/controle/index.html` | 87 KB | 1 | ✅ Novo |
| 7 | **CONTROLE_DADOS** | `controle_de_dados.html` (raiz) | 88 KB | 1 | ✅ Funcional |

**Entry points**:
- `file:///C:/Projetos_Hermes/Edi_Market_Guardian_V0/index.html` (1.1 KB) — redirect para `dashboard_unificado/index.html`
- `file:///C:/Projetos_Hermes/Edi_Market_Guardian_V0/dashboard_unificado/index.html` — **HUB principal**

## 2. unified-nav.js Cobertura (6/6)

```
HUB      : OK
WDO      : OK
WIN      : OK
MERCADO  : OK
CORR     : OK
CONTROLE : OK
```

**Status**: ✅ `unified-nav.js` cobre todos os 6 dashboards. O `controle_de_dados.html` da raiz é uma página standalone (não no seletor).

## 3. Dependências (scripts + styles) — REVISADO

### WDO — ✅ Padronizado (audit inicial estava ERRADO)
- ✅ `../shared/unified-nav.js` (linha 709)
- ✅ `../shared/js/particles.js` (linha 707)
- ✅ `../shared/js/chart_data_utils.js` (linha 708)
- ✅ `../shared/main-shared.js` (linha 712)
- ⚠️ Path frágil: `../../Cotacoes/dashboard/MERCADO/assets/data/fed_watch_rates.js` (linha 701)

### WIN — ✅ Padronizado
- ✅ `../shared/unified-nav.js`
- ✅ `../shared/js/particles.js`
- ✅ `../shared/js/chart_data_utils.js`
- ❌ NÃO inclui `fed_watch_rates.js` (feature ausente)

### CORR — ✅ Padronizado
- ✅ `../shared/unified-nav.js`
- ✅ `../shared/js/particles.js`
- ⚠️ Path frágil: `../../Cotacoes/dashboard/MERCADO/assets/data/market_quotes.js`

### CONTROLE — ✅ Mínimo viável
- ✅ `../shared/unified-nav.js`
- ✅ `../shared/js/particles.js`
- ❌ Falta `chart_data_utils.js` (se for usar charts)

### MERCADO — ✅ TypeScript
- Standalone (não usa `shared/unified-nav.js`)

## 4. Problemas Identificados (REVISADO)

### 4.1 ~~CRÍTICO: WDO sem navegação~~ → **FALSO ALARME** ✅
- Audit inicial indicou que WDO/index.html não incluía `unified-nav.js`
- Re-checagem (grep completo): WDO **TEM** todos os scripts compartilhados (linhas 707-712)
- Problema não existe — WDO está padronizado

### 4.2 ~~MÉDIO: WDO sem particles/chart_data_utils~~ → **FALSO ALARME** ✅
- Mesmo motivo — WDO **TEM** particles.js e chart_data_utils.js
- Audit estava errado por pegar só os primeiros 6 matches

### 4.3 MÉDIO: Paths cruzados
- `../../Cotacoes/dashboard/MERCADO/assets/data/*` em WDO (linha 701) e CORR
- Acoplamento frágil entre `dashboard_unificado/` e `Cotacoes/`
- **Recomendação**: Mover para `dashboard_unificado/shared/data/` (cópia ou symlink)

### 4.4 RESOLVIDO: controle_de_dados.html não estava no seletor
- Adicionado `CONTROLE_DADOS` ao `unified-nav.js` (Phase 4E)
- Path: `controle_de_dados.html` (na raiz)
- Ícone: 🗂️

### 4.5 BAIXO: MERCADO é o maior (27.8 MB)
- 118 arquivos, 27.8 MB
- Pipeline TypeScript gera muito output
- **Não urgente** — funciona

### 4.6 BAIXO: charts.js WDO vs WIN NÃO é duplicação simples
- SHA256 diferentes, linhas diferentes (WDO: 2222, WIN: 2010)
- Ambos fazem coisas similares mas com implementações diferentes
- Consolidação exigiria refatoração profunda (>2h)
- **Recomendação**: Manter separados. Oportunidade futura: extrair utilitários comuns.

### 4.7 ✅ RESOLVIDO (Phase 4C): servico_unificado.py era DEAD CODE
- **Arquivo**: `servico_unificado.py` (100KB, 2141 linhas) na raiz
- **Status**: Dead code — NUNCA foi commitado no git, NÃO é referenciado por nenhum BAT
- **BATs na verdade chamam**: `scripts/orquestrador.py` (986 linhas)
- **Ação**: Movido para `archive/servico_unificado_legacy_2141linhas.py.bak`
- **Decisão de produto**: a sessão paralela já tinha reescrito o daemon em Python limpo
- **Resultado**: 100KB de código morto removido do working tree

## 5. Recomendações (NÃO aplicadas)

| Prioridade | Recomendação | Esforço | Risco |
|---|---|---|---|
| Alta | Adicionar `unified-nav.js` em WDO | ~~5 min~~ | ~~Baixo~~ (FALSO ALARME) |
| Média | Adicionar particles + chart_data_utils em WDO | ~~5 min~~ | ~~Baixo~~ (FALSO ALARME) |
| Média | Mover data compartilhada para `shared/data/` | 30 min | Médio |
| Baixa | Adicionar `controle_de_dados.html` ao seletor | ~~5 min~~ | ~~Baixo~~ (FEITO em 4E) |
| Baixa | Documentar caminhos esperados em `NAVIGATION.md` | 15 min | Zero |

## 6. Resumo das Fases 4 (até agora)

| Fase | Status | Resultado |
|---|---|---|
| 4A | ✅ | 14 evoluções E1-E14 comitadas |
| 4B | ✅ | 15 testes órfãos integrados (24/24 PASS) |
| 4C | ✅ | `servico_unificado.py` morto removido (100KB liberados) |
| 4D | ✅ | `src/calculator.py` → `src/calculator/` package com shim |
| 4E | ✅ | `CONTROLE_DADOS` adicionado ao seletor; audit corrigido |
| 4F | ✅ | Mapeamento completo em REFACTOR_LOG.md |
| 4G | ✅ | MATH_REVIEW.md atualizado com E7/E8/E10 + 2 testes regressão |
| 4H | ⏳ | CI/Pre-commit (próximo) |
| 4I | ✅ | **Sessão 2026-06-22**: 8 commits, 5 bugs corrigidos (CP-043 a CP-049) |
| 4J | ✅ | **Re-registro 11:50**: HEAD `daab2897` (auto-commit market:service 14:48:01), service continua UP |
| 4K | ✅ | **Re-registro 12:00**: HEAD `982449b8` (estado estável, aguardando Owner validar FORCE.bat) |

## 5. Recomendações (NÃO aplicadas)

| Prioridade | Recomendação | Esforço | Risco |
|---|---|---|---|
| Alta | Adicionar `unified-nav.js` em WDO | 5 min | Baixo |
| Média | Adicionar particles + chart_data_utils em WDO | 5 min | Baixo |
| Média | Mover data compartilhada para `shared/data/` | 30 min | Médio |
| Baixa | Adicionar `controle_de_dados.html` ao seletor | 5 min | Baixo |
| Baixa | Documentar caminhos esperados em `NAVIGATION.md` | 15 min | Zero |

## 6. Próxima Ação

Aplicar **4E** (consolidar charts.js WDO/WIN) primeiro — addresses duplicação JS de maior impacto. Depois retornar para aplicar 5.1 e 5.2 acima (correções de navegação).
