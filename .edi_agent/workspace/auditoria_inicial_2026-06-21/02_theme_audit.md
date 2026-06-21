# 02 — Auditoria de Aderência ao Tema Neon Terminal

> **Fonte:** Agente B (paralelo) + varredura manual Hermes · 2026-06-21 · read-only.
> **Tema canônico declarado:** cores `#ff073a`, `#00f3ff`, `#ff00ff` (paleta Neon Terminal).
> **NOTA**: Arquivo recriado após perda do original (~19:53).

---

## 0. 🔴 Achado estrutural crítico (✅ MITIGADO EM F2)

O usuário declara o canônico em `dashboard_unificado/shared/styles.css`, mas **esse arquivo NÃO EXISTIA** até F2. **Em F2 foi criado** (espelho de WDO, 533 L = 526 + 7 header).

A pasta `dashboard_unificado/shared/css/` contém apenas:

- `daytrade-tools.css` (E80, paleta própria: `#00ff9c`, `#ff6b6b`, `#ffcc66`)
- `greeks-heatmap.css` (mesma paleta própria)

**A referência canônica é `dashboard_unificado/WDO/assets/css/style.css`** (526 linhas), que define o tema Neon Terminal completo. Em F2 também foi criado `dashboard_unificado/shared/styles.css` como espelho.

### Links quebrados (RESOLVIDOS em F2)

| Dashboard | href declarado | Status |
|---|---|---|
| MERCADO | `../../dashboard_unificado/shared/styles.css` | ✅ AGORA EXISTE (F2) |
| correlation | `../shared/styles.css` | ✅ AGORA EXISTE (F2) |

---

## 1. Tema canônico (extraído de `WDO/assets/css/style.css`)

### Variáveis CSS (declaradas no `:root`)

| Variável | Valor | Função |
|---|---|---|
| `--primary-neon` | `#ff073a` | vermelho neon (canônico) |
| `--secondary-neon` | `#00f3ff` | ciano neon (canônico) |
| `--accent-neon` | `#ff00ff` | magenta neon (canônico) |
| `--warning-neon` | `#ffff00` | amarelo |
| `--success-neon` | `#00ff00` | verde |
| `--dark-bg` | `#0a0a0a` | fundo principal |
| `--dark-secondary` | `#1a1a1a` | fundo secundário |
| `--text-primary` | `#ffffff` | texto principal |
| `--text-secondary` | `#b3b3b3` | texto secundário |
| `--glow-red / --glow-blue / --glow-purple` | rgba(255,7,58,.8) / rgba(0,243,255,.8) / rgba(255,0,255,.8) | box-shadows |

### Fontes

`'Orbitron'` (títulos), `'Share Tech Mono'` (corpo/numérico).

### Classes Neon Terminal principais (do WDO)

`.header`, `.container`, `.logo`, `.logo-text`, `.logo-subtitle`, `.nav`, `.nav-list`, `.nav-link`, `.main`, `.section`, `.section-header`, `.section-title`, `.section-glow`, `.metrics-grid`, `.metric-card`, `.metric-icon`, `.metric-value`, `.metric-label`, `.metric-change`, `.split-layout`, `.context-box`, `.chart-container`, `.code-container`, `.action-btn`, `.feedback-msg`, `.table-container`, `.data-table`, `.neon-table`, `.positive-val`, `.negative-val`, `.footer`.

---

## 2. Auditoria individual dos 7 dashboards

### 1️⃣ WDO — `dashboard_unificado/WDO/index.html`
- **Aderência:** 🟢 **ALTA** ✅ (REFERÊNCIA)
- **CSS usado:** `assets/css/style.css` (canônico)
- **Hardcoded divergente:** nenhum. 1 inline `color:#00f3ff` em `<pre id="ntsl-code-block">` (consistente).
- **Classes Neon presentes:** todas.

### 2️⃣ WIN — `dashboard_unificado/WIN/index.html`
- **Aderência:** 🟢 **ALTA** ✅
- **CSS usado:** `assets/css/style.css` (= WDO, mesmo arquivo).
- **Hardcoded divergente:** nenhum.
- **Classes Neon presentes:** todas.

### 3️⃣ HUB — `dashboard_unificado/index.html`
- **Aderência:** 🟢 **ALTA** ✅
- **CSS usado:** `WDO/assets/css/style.css` (link relativo — funciona).
- **Hardcoded divergente:** 1 ocorrência — `style="background:#141414;color:#e0e0e0;border:1px solid #333"` no `<select id="assetSelect">` (escala cinza neutra, não Neon).
- **Classes Neon presentes:** `.header`, `.container`, `.logo`, `.logo-text`, `.logo-subtitle`, `.nav`, `.nav-link`, `.section`, `.section-header`, `.section-title`, `.section-glow`, `.metrics-grid`, `.metric-card`, `.metric-icon`, `.metric-value`, `.metric-label`, `.context-box`, `.footer`.

### 4️⃣ correlation — `dashboard_unificado/correlation/index.html`
- **Aderência:** 🟠 **MÉDIA/BAIXA** ⚠️ (melhorando pós-F2 — link agora funciona)
- **CSS usado:**
  - `assets/css/style.css` (153 linhas, **sem bloco `:root`** — usa `var(--primary-neon)` etc. mas não as define)
  - `../shared/styles.css` → **FUNCIONA AGORA** (criado em F2) mas ainda falta `:root` em `correlation/assets/css/style.css`
  - `assets/css/supergraphics.css` (393 linhas, **paleta totalmente própria**: `--sg-bg:#05060b`, `--sg-blue:rgba(37,99,235,0.92)`)
- **Runtime (pós-F2):** variáveis CSS definidas em `shared/styles.css` carregam. Mas o `correlation/assets/css/style.css` próprio NÃO tem `:root`, então precisa do shared pra resolver vars.
- **Hardcoded divergente em `style.css`:** `rgba(59,130,246,0.70)` (azul Tailwind blue-500), `rgba(34,197,94,0.24)` (verde Tailwind green-500), `rgba(239,68,68,0.16)` (vermelho Tailwind red-500), `rgba(2,6,23,0.85)` (dark navy — ≠ `--dark-bg: #0a0a0a`).

### 5️⃣ controle — `dashboard_unificado/controle/index.html` ✅ CRIADO EM F2
- **Aderência:** 🟢 **ALTA** ✅ (criado em F2, carrega `../shared/styles.css`)
- **CSS usado:** `../shared/styles.css` (canônico, criado em F2)
- **Hardcoded divergente:** apenas pequeno bloco `<style>` inline para `.redirect-box` (cosmético, não conflita).
- **Classes Neon presentes:** todas.

### 6️⃣ MERCADO — `Cotacoes/dashboard/MERCADO/index.html`
- **Aderência:** 🟠 **MÉDIA** ⚠️ (link funciona pós-F2, mas inline ainda diverge)
- **CSS usado:**
  - `<link href="../../dashboard_unificado/shared/styles.css">` → **FUNCIONA AGORA** (criado em F2)
  - Bloco `<style>` inline gigante (985 linhas) com todas as regras próprias
- **Hardcoded divergente em inline `<style>`:** a paleta Neon aparece **dispersa em rgba()** (sem usar vars):
  - `rgba(0,255,160,.95)` ≈ verde (≠ `#00ff00` exato) — usado ≥ 11×
  - `rgba(255,60,80,.95)` ≈ vermelho (≠ `#ff073a`) — usado ≥ 11×
  - `rgba(255,210,74,.95)` ≈ amarelo (≠ `#ffff00`) — usado ≥ 6×
  - `rgba(0,243,255,.95)` ✅ consistente
  - `rgba(255,7,58,.95)` ✅ consistente
  - `rgba(255,0,255,.95)` ✅ consistente
  - `rgba(0,255,0,.95)` (≠ `#00ff00` exato) — `.edi-pill--status-ok`
  - `rgba(255,255,255,.X)` neutro — ≥ 30×
  - `#141414`, `#e0e0e0`, `#333`, `#1b1b1b`, `#f2f2f2` — ≥ 8×

### 7️⃣ controle_de_dados.html (legado, raiz)
- **Aderência:** 🔴 **BAIXA** ❌
- **CSS usado:** bloco `<style>` inline 96 linhas, **nenhum arquivo externo**.
- **Hardcoded divergente — paleta própria completa:**
  - `--bg: #0b1020` (indigo escuro, ≠ `#0a0a0a`)
  - `--card: #121a33` (indigo)
  - `--muted: #99a3c2`
  - `--text: #e8ecff`
  - `--ok: #2bd576` (verde-jade, ≠ `#00ff00`)
  - `--warn: #ffcc66`
  - `--bad: #ff5c77` (rosa-coral, ≠ `#ff073a`)
  - `--info: #67b7ff` (azul claro, ≠ `#00f3ff`)
  - `--risk: #ff9a3d` (laranja — cor que não existe no tema canônico)
  - `background: linear-gradient(180deg, #0b1020, #050713 70%)`
- **Fontes:** `'Orbitron'` no h1 (consistente), mas `body` usa `ui-sans-serif, system-ui, ...` (NÃO `'Share Tech Mono'`).
- **Classes Neon presentes:** **nenhuma**. Usa `.card`, `.badge`, `.dot`, `.navsel`, `.navlink`, `.k`, `.v` próprios.

---

## 3. TABELA DE GAPS (pós-F2)

| # | Dashboard | Aderência | CSS efetivamente carregado | Hardcoded divergente | Neon presentes | Neon ausentes | Gap principal |
|---|---|---|---|---|---|---|---|
| 1 | WDO | 🟢 ALTA | `assets/css/style.css` (canônico) | nenhum | todas | — | nenhum |
| 2 | WIN | 🟢 ALTA | `assets/css/style.css` (= WDO) | nenhum | todas | — | nenhum |
| 3 | HUB | 🟢 ALTA | `WDO/assets/css/style.css` | `#141414/#e0e0e0/#333` no `<select>` | header, logo, nav, section, metric-* | (não aplicáveis) | inline style do seletor |
| 4 | correlation | 🟠 MÉDIA/BAIXA | `assets/css/style.css` + `supergraphics.css` + `../shared/styles.css` (F2 ✅) | rgba Tailwind + dark navy | header, logo, nav (parcial) | section-title/glow, metric-card, neon-table | `correlation/assets/css/style.css` sem `:root` |
| 5 | controle | 🟢 ALTA | `../shared/styles.css` (F2 ✅) | (cosmético redirect-box) | todas | — | nenhum |
| 6 | MERCADO | 🟠 MÉDIA | `../../dashboard_unificado/shared/styles.css` (F2 ✅) + `<style>` inline 985 L | rgba próprios + ~30× `rgba(255,255,255,.X)` | header, logo, section, metric-card/value/label | neon-table, data-table, code-container, action-btn | 985 L inline (refator F3.7) |
| 7 | controle_de_dados.html | 🔴 BAIXA | inline (96 L) | paleta própria completa | **nenhuma** | **todas** | tema próprio indigo; refatoração total (F3.8) |

---

## 4. Ordem recomendada de propagação (atualizada pós-F2)

| Passo | Dashboard | Ação | Esforço | Status |
|---|---|---|---|---|
| **0** | (raiz) | Criar `shared/styles.css` como espelho de WDO | baixo | ✅ FEITO em F2 |
| **1** | HUB | Remover `style="background:#141414;..."` do `<select id="assetSelect">`; criar `.navsel` reaproveitando variáveis do tema. | muito baixo | ⏸️ F3.5 |
| **2** | correlation | (a) adicionar `:root` em `correlation/assets/css/style.css` (ou fundir com shared); (b) substituir rgba Tailwind por vars; (c) decidir destino de `supergraphics.css`. | médio | ⏸️ F3.5 |
| **3** | MERCADO | (a) **mover `<style>` inline de 985 linhas para arquivo externo** (`Cotacoes/dashboard/MERCADO/assets/css/style.css`); (b) normalizar rgba → vars. | alto (985 linhas) | ⏸️ F3.7 |
| **4** | controle_de_dados.html (legado) | (a) carregar `WDO/assets/css/style.css` (ou shared/styles.css); (b) **remover bloco `<style>` inline**; (c) substituir `.card/.badge/.dot/.navsel/.navlink` por `.metric-card/.action-btn/.section-title/.footer`; (d) trocar `--ok/--bad/--info/--risk` por Neon; (e) mudar `body font-family` para `'Share Tech Mono'`. | alto | ⏸️ F3.8 |
| **5** | WDO / WIN | Opcional: extrair `assets/css/style.css` para `shared/styles.css` (DRY) e fazer os dois apontarem para lá. Hoje estão duplicados. | baixo | ⏸️ F3.6 |

---

## 5. Observações adicionais

- **Drift de paleta no `shared/`:** `daytrade-tools.css` e `greeks-heatmap.css` (E80) usam `#00ff9c / #ff6b6b / #ffcc66` — **diferentes das vars Neon canônicas**. Devem ser alinhados futuramente, mas como estão isolados em widgets de canto, o impacto visual é baixo.
- **WDO e WIN são virtualmente idênticos** (só diferem em `data-current-dashboard`, option `selected`, ausência da section `#tools` no WIN). Candidato natural a template parametrizado.
- **`controle_de_dados.html`** (legado) tem **0 (zero)** referências às cores canônicas e **0 (zero)** classes Neon — divergência total.

---

*Modo read-only · RECRIADO em 19:53 após perda do original.*