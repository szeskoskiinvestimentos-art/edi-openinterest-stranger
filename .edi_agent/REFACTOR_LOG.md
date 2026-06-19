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

## 3. Dependências (scripts + styles)

### WDO — **INCONSISTENTE** ⚠️
- ❌ **NÃO inclui** `../shared/unified-nav.js` (mas está no seletor!)
- ❌ **NÃO inclui** `../shared/js/particles.js`
- ❌ **NÃO inclui** `../shared/js/chart_data_utils.js`
- ⚠️ Path frágil: `../../Cotacoes/dashboard/MERCADO/assets/data/fed_watch_rates.js` (acoplamento cruzado)

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

## 4. Problemas Identificados

### 4.1 CRÍTICO: WDO sem navegação
- `dashboard_unificado/WDO/index.html` **NÃO** inclui `../shared/unified-nav.js`
- Usuário não consegue trocar de dashboard a partir de WDO via Ctrl+K ou dropdown
- **Recomendação**: Adicionar `<script src="../shared/unified-nav.js"></script>` antes de `</body>`

### 4.2 MÉDIO: WDO sem particles/chart_data_utils
- Inconsistente com WIN/CORR/CONTROLE
- Falta tema visual "Stranger Things"
- **Recomendação**: Adicionar `<script src="../shared/js/particles.js"></script>` e chart_data_utils

### 4.3 MÉDIO: Paths cruzados
- `../../Cotacoes/dashboard/MERCADO/assets/data/*` em WDO e CORR
- Acoplamento frágil entre `dashboard_unificado/` e `Cotacoes/`
- **Recomendação**: Mover para `dashboard_unificado/shared/data/` (cópia ou symlink)

### 4.4 BAIXO: controle_de_dados.html não está no seletor
- Existe standalone, mas não no `unified-nav.js`
- **Recomendação**: Adicionar entrada CONTROLE_DADOS ou unificar com `dashboard_unificado/controle/`

### 4.5 BAIXO: MERCADO é o maior (27MB)
- 118 arquivos, 27.8 MB
- Maioria são blocos JS, data JSON, assets
- Pipeline TypeScript gera muito output
- **Não urgente** — funciona

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
