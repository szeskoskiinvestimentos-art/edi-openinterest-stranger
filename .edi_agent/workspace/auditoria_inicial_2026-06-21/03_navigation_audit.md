# 03 — Auditoria de Navegação Global (`unified-nav.js`)

> **Fonte:** Agente C (paralelo) · 2026-06-21 · read-only.
> **Arquivo central:** `dashboard_unificado/shared/unified-nav.js` (77 linhas, 3.207 bytes).
> **NOTA**: Arquivo recriado após perda do original (~19:53).

---

## 1. RESPOSTAS DIRETAS

| Pergunta | Resposta |
|---|---|
| **7 entradas declaradas existem?** | ❌ **NÃO.** O `map` interno tem apenas **6 entradas**: `HUB`, `WDO`, `WIN`, `MERCADO`, `CORR`, `CONTROLE`. Não existe entrada `CONTROLE_DADOS` (legado) citada nos docs. |
| **Cada um dos 7 dashboards carrega o nav?** | ❌ **NÃO.** Apenas 5 dos 7 carregam `unified-nav.js`. MERCADO usa implementação própria (`asset-switch-nav.js`). `dashboard_unificado/controle/` **foi criado em F2** (wrapper). |
| **Ordem é consistente?** | ⚠️ **Parcial.** 5 dropdowns seguem a mesma ordem (HUB → WDO → WIN → MERCADO → CORR → CONTROLE), mas **MERCADO se reposiciona** para o optgroup "Mercado" e **CORR** sobe para "Dashboards" no dropdown do próprio MERCADO. |
| **QuickNav (Ctrl+K) funciona em todos?** | ❌ **NÃO.** Só existe em **MERCADO**, via `quick-nav-drawer.js`. Demais dashboards não têm. |

---

## 2. Anatomia do `unified-nav.js`

```js
// 77 linhas, IIFE anônimo, 3 KB
function autoDiscoverDashboards(knownMap) { /* STUB — retorna knownMap */ }
function getRootBaseHref() { /* resolve base por URL pattern */ }
function guessCurrentDashboard() { /* infere HUB|WDO|WIN|CORR|MERCADO|CONTROLE */ }
function getTargetHref(baseRoot, val) {
  var map = {
    HUB:      'dashboard_unificado/index.html',
    WDO:      'dashboard_unificado/WDO/index.html',
    WIN:      'dashboard_unificado/WIN/index.html',
    MERCADO:  'Cotacoes/dashboard/MERCADO/index.html',
    CORR:     'dashboard_unificado/correlation/index.html',
    CONTROLE: 'controle_de_dados.html',
  };
  // Extensível via window.EDI_EXTRA_DASHBOARDS
}
```

### Observações críticas

- **É um handler de `<select>`, NÃO um componente de nav.** Não há HTML injection, não há render de barra.
- **NÃO exporta API.** 16+ páginas chamam `window.ediUnifiedNav.bind(...)` que **NÃO EXISTE** — falha silenciosa (try/catch).
- **QuickNav (Ctrl+K)? NÃO.** Não há keybinding algum.
- **Highlight de página ativa?** Apenas seta `sel.value = current` (não há feedback visual próprio).
- **Auto-discovery é stub:** a função declara 3 dirs e 2 sufixos mas o loop `for (i...)` está vazio; apenas retorna `knownMap`.
- **Extensão possível** via `window.EDI_EXTRA_DASHBOARDS` (mapa key→URL).

### Padrão de uso esperado por dashboard

```html
<select id="assetSelect" data-current-dashboard="HUB">...</select>
<script src=".../unified-nav.js"></script>
```

---

## 3. TABELA DE PRESENÇA/AUSÊNCIA

| # | Dashboard | Path | Existe? | Carrega `unified-nav.js` | QuickNav (Ctrl+K) | Select dropdown | Highlight ativo |
|---|---|---|:-:|:-:|:-:|:-:|:-:|
| 1 | **HUB** | `dashboard_unificado/index.html` | ✅ | ✅ linha 134 | ❌ | ✅ (inline style) | ❌ |
| 2 | **WDO** | `dashboard_unificado/WDO/index.html` | ✅ | ✅ linha 897 | ❌ | ✅ (inline style) | ❌ |
| 3 | **WIN** | `dashboard_unificado/WIN/index.html` | ✅ | ✅ linha 827 | ❌ | ✅ (inline style) | ❌ |
| 4 | **MERCADO** | `Cotacoes/dashboard/MERCADO/index.html` | ✅ | ❌ **usa próprio** `asset-switch-nav.js` | ✅ **próprio** `quick-nav-drawer.js` | ✅ (own impl) | ✅ **in-page via IO** |
| 5 | **CORR** | `dashboard_unificado/correlation/index.html` | ✅ | ✅ linha 81 | ❌ | ✅ (`class="navsel"`) | ❌ |
| 6 | **`dashboard_unificado/controle/index.html`** | **✅ CRIADO F2** | ✅ | ✅ (wrapper) | ❌ | ✅ | ❌ |
| 7 | **Controle de Dados (legado)** | `controle_de_dados.html` (raiz) | ✅ | ✅ linha 132 | ❌ | ✅ (sem optgroups) | ❌ |
| — | 16× Supergráficos | `dashboard_unificado/correlation/supergraphics/*/index.html` | ✅ | ✅ (todos) | ❌ | ✅ (`class="sg-link"`) | ❌ + chama API inexistente |

**Estatísticas:**
- 63 arquivos HTML carregam `unified-nav.js`
- 66 arquivos HTML têm `<select id="assetSelect">`
- **Diferença de 3:** MERCADO (1) + 2 outliers que têm o select sem o script (a confirmar)

---

## 4. INCONSISTÊNCIAS IDENTIFICADAS

### 4.1 Estruturais

| Item | Estado |
|---|---|
| **7ª entrada** (`CONTROLE_DADOS` legado) | ❌ Ausente no `map`. Docs declaram 7 mas código tem 6. |
| **Path `dashboard_unificado/controle/`** | ✅ **Resolvido em F2** (wrapper criado). |
| **API `window.ediUnifiedNav.bind`** | ❌ **NÃO implementada** mas chamada por 17+ lugares (16 supergráficos + `correlation/assets/js/main.js:17`). Falha silenciosa via try/catch. |
| **QuickNav (Ctrl+K)** | ❌ Só MERCADO tem. Demais 6 dashboards não. |
| **Highlight ativo** | ❌ Apenas o `data-current-dashboard` define `<option selected>`. Nenhum JS destaca visualmente. MERCADO tem IntersectionObserver só para sub-seções in-page. |

### 4.2 Ordem/Layout

| Dashboard | Ordem no `<select>` | Optgroups | Comentário |
|---|---|---|---|
| HUB, WDO, WIN, CORR, controle_de_dados | HUB→WDO→WIN→MERCADO→CORR→CONTROLE | `Dashboards` (HUB/WDO/WIN) + `Mercado` (MERCADO/CORR/CONTROLE) | Consistente entre si |
| **MERCADO** | HUB→WDO→WIN→**CORR→CONTROLE**→**MERCADO** | `Dashboards` + `Mercado` (com **MERCADO sozinho**) | **MERCADO pula para o final e troca CORR/CONTROLE de grupo** |
| Supergráficos (16) | HUB→WDO→WIN→MERCADO→CORR→CONTROLE | Sem optgroups (flat) | Igual ao controle_de_dados |

### 4.3 Estilização (4 estilos para o mesmo componente!)

- **HUB/WDO/WIN:** `style="background:#141414;color:#e0e0e0;border:1px solid #333;padding:6px 10px;border-radius:4px;font-weight:700"` (inline).
- **CORR/controle_de_dados:** `class="navsel"` (estilo external, em `styles.css`).
- **MERCADO:** `border-radius:999px;font-weight:900;letter-spacing:1px` (botão pílula).
- **Supergráficos:** `class="sg-link"` (estilo próprio dos templates).

### 4.4 Implementação duplicada (MERCADO)

MERCADO tem 4 arquivos paralelos que duplicam/extram funcionalidades:
- `assets/js/blocks/asset-switch-nav.js` (43 linhas) — fork do `unified-nav.js` com prodBase hardcoded
- `assets/js/blocks/quick-nav-drawer.js` (139 linhas) — Ctrl+K
- `assets/js/blocks/nav-more-panel.js` — painel "More"
- `assets/js/blocks/navigation-definition.js` — renderiza top+groups

→ **Dois sistemas de nav coexistindo sem contrato entre eles.**

---

## 5. SPEC DE PADRONIZAÇÃO PROPOSTA — `EDI.NAV` v2

### Recomendação: **1 spec, 1 implementação forçada**

Escolho **forçada** (não N implementações) porque:
1. Há 4 estilos divergentes para o mesmo `<select>`.
2. 17+ páginas chamam API que não existe.
3. 1 dashboard tem feature (QuickNav) que 6 não têm.
4. Contagem de entradas não bate com documentação.

### Spec: `EDI.NAV` v2

```js
// /dashboard_unificado/shared/edi-nav.js  (substitui unified-nav.js)
window.EDI = window.EDI || {};
window.EDI.NAV = (function () {
  // 1. FONTE ÚNICA DE VERDADE — 7 entradas
  const DASHBOARDS = Object.freeze({
    HUB:            { label: 'Dashboard Unificado', href: 'dashboard_unificado/index.html',            group: 'core'  },
    WDO:            { label: 'WDO',                  href: 'dashboard_unificado/WDO/index.html',         group: 'core'  },
    WIN:            { label: 'WIN',                  href: 'dashboard_unificado/WIN/index.html',         group: 'core'  },
    MERCADO:        { label: 'Cotações (MERCADO)',   href: 'Cotacoes/dashboard/MERCADO/index.html',     group: 'data'  },
    CORR:           { label: 'Correlações',          href: 'dashboard_unificado/correlation/index.html', group: 'data'  },
    CONTROLE:       { label: 'Controle',             href: 'controle_de_dados.html',                     group: 'ops'   },
    CONTROLE_DADOS: { label: 'Controle de Dados (legado)', href: 'controle_de_dados.html',              group: 'ops', legacy: true },
  });

  // 2. API pública
  function bind(selectEl, { enableQuickNav = true, highlight = true } = {}) { /* ... */ }
  function getMap()      { return DASHBOARDS; }
  function getCurrent()  { /* data-current-dashboard || URL guess */ }
  function navigate(key) { /* location.href = resolve(key) */ }
  function resolve(key)  { /* baseRoot + DASHBOARDS[key].href */ }

  // 3. QuickNav (Ctrl+K) — portado de MERCADO
  // 4. Highlight via IntersectionObserver — portado de MERCADO
  // 5. Auto-render do <select> se ausente (opt-in via data-auto-nav)

  return { DASHBOARDS, bind, getMap, getCurrent, navigate, resolve };
})();
```

### Contrato de uso por dashboard (idêntico em todos)

```html
<!-- 1. Inclui o script (path relativo a si) -->
<script src=".../shared/edi-nav.js"></script>

<!-- 2. Chama bind() — ÚNICO ponto de integração -->
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const sel = document.getElementById('assetSelect');
    if (sel) window.EDI.NAV.bind(sel, { enableQuickNav: true });
  });
</script>
```

### CSS único (substitui 4 variações)

```css
/* /dashboard_unificado/shared/css/edi-nav.css */
.edi-nav-select { background:#141414; color:#e0e0e0; border:1px solid #333;
  padding:8px 12px; border-radius:999px; font-weight:700; font-family:'Orbitron',sans-serif; }
```

### Plano de migração (zero-downtime)

| Fase | Ação |
|---|---|
| **F1 — Refactor não-destrutivo** | Renomear `unified-nav.js` → `edi-nav.js` com nova API + back-compat (`unified-nav.js` shim chama `EDI.NAV.bind`); adicionar `CONTROLE_DADOS` ao map; expor `window.EDI.NAV.bind`. **Cobre 100% das 63 páginas sem editar HTML.** |
| **F2 — CSS único** | Criar `edi-nav.css`; opcionalmente trocar `class="edi-nav-select"` em cada página (script pode auto-aplicar). |
| **F3 — Unificar MERCADO** | Deletar `Cotacoes/.../asset-switch-nav.js`, `quick-nav-drawer.js`, `nav-more-panel.js`, `navigation-definition.js`. Apontar MERCADO para `edi-nav.js`. |
| **F4 — Remover fork das 16 supergráficas** | Apagar o bloco `try { window.ediUnifiedNav.bind(...) } catch {}` (passa a ser no-op legada). |
| **F5 — Atualizar docs** | README/PROMPT passam de "6+1 legado" para "7 entradas: `HUB,WDO,WIN,MERCADO,CORR,CONTROLE,CONTROLE_DADOS`". |

### Definition of Done

- [ ] `getMap()` retorna exatamente 7 entradas.
- [ ] 100% dos 66 dropdowns com `id="assetSelect"` são bindados (sem try/catch silencioso).
- [ ] Ctrl+K abre QuickNav em **todos** os dashboards (não só MERCADO).
- [ ] Section ativa é destacada visualmente em todos (não só MERCADO).
- [ ] 1 arquivo CSS, 1 fonte JS, 1 spec.
- [ ] Teste: clicar numa `<option>` em qualquer página troca para a URL correta resolvida a partir da base.

---

## 6. ARQUIVOS CITADOS

| Caminho | Função |
|---|---|
| `dashboard_unificado/shared/unified-nav.js` | Nav handler central (6 entradas, sem QuickNav, sem API exportada) |
| `Cotacoes/dashboard/MERCADO/assets/js/blocks/asset-switch-nav.js` | Fork do handler p/ MERCADO (com prodBase) |
| `Cotacoes/dashboard/MERCADO/assets/js/blocks/quick-nav-drawer.js` | Única implementação de QuickNav (Ctrl+K) + IntersectionObserver |
| `Cotacoes/dashboard/MERCADO/assets/js/blocks/navigation-definition.js` | Renderiza `NAVIGATION_DEFINITION` (13 sub-seções in-page) |
| `Cotacoes/dashboard/MERCADO/assets/js/blocks/nav-more-panel.js` | Painel "More" |
| `dashboard_unificado/correlation/assets/js/main.js:17` | Tenta chamar API inexistente |
| 16× `dashboard_unificado/correlation/supergraphics/*/index.html` | Mesma chamada quebrada |
| `README.md:135`, `Edi_Revisao.txt:88/214/307` | Docs declaram "7 dashboards" |

---

*Modo read-only · RECRIADO em 19:53 após perda do original.*