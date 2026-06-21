# 01 — Catálogo Funcional dos Dashboards

> **Fonte:** Agente A (paralelo) · 2026-06-21 · read-only.
> **Stack geral:** HTML estático + Chart.js (CDN) + módulos JS locais.
> **Tema declarado:** "Stranger Things" (sinônimo de Neon Terminal).
> **NOTA**: Arquivo recriado após perda do original (~19:53).

---

## 1. HUB — `dashboard_unificado/index.html`

- **Title:** "EDI Market Guardin - Dashboard Unificado (Stranger Things)"
- **Tamanho:** 205 linhas / 8,3 KB (menor dashboard, papel de portal).
- **Seções (2):** `#links` (5 cards de atalho) · `#status` (4 cards de saúde dinâmicos).

### Cartões do grid "Atalhos"

| Destino | Ícone | Rótulo |
|---|---|---|
| `WDO/index.html` | 💱 WDO | Dólar Futuro |
| `WIN/index.html` | 📈 WIN | Índice Futuro |
| `../Cotacoes/dashboard/MERCADO/index.html` | 🧾 Cotações | MERCADO |
| `correlation/index.html` | 🧠 Correlação | SuperGraphics |
| `../controle_de_dados.html` | 🛰️ Controle | Alimentação de dados |

### Cartões do grid "Saúde" (dinâmicos via JS)

| ID | Métrica | Origem |
|---|---|---|
| `#last-update` | Última Atualização (hh:mm) | `localStorage['edi_last_update']` |
| `#tests-passing` | "43/43" Testes Passando | **hardcoded** |
| `#snapshots-count` | Snapshots Disponíveis | `fetch('../../.edi_agent/snapshots/')` + regex `snap-\d{8}-\d{6}` |
| `#next-slot` | Próximo Slot Pipeline | `SLOTS_BRT = ['04:00','07:00','12:00','18:00']` |

**Hardcoded:** `"43/43"` e labels dos cards. Dinâmico: os 4 cards de saúde via JS (`refreshHealth()` a cada 60s).

---

## 2. WDO — `dashboard_unificado/WDO/index.html` (REFERÊNCIA)

- **Title:** "EDI Market Guardin V1 - Dashboard Stranger Things"
- **Tamanho:** 906 linhas / 53,6 KB.
- **Seções (18+):** overview · tools · delta · gamma · volatility · skew · discovery · range-walls · fair-value · models-comparison · detailed-strikes · split-view · advanced · structure · greeks2 · greeks-cum · structure-v3 · risk · consolidated · youtube.

### Indicadores / calculadoras usados

- **Gregas:** Delta, Gamma, Vega, Theta, Vanna, Charm, R-Gamma (PVOP).
- **Volatilidade:** IV implícita, Skew (smile), Expected Move Cone, Gamma Flip Cone.
- **Estrutura:** OI por Strike/Vencimento, Most Actives, Gamma Flip, Call/Put Wall, Max Pain, Pin Risk, Range+Walls, Discovery (Strikes/Midwalls/Fibonacci).
- **Risco:** Dealer Pressure Index, Flow Sentiment, MM PnL Sim, Delta Flip Profile.
- **Modelos:** Black-Scholes, Heston, SVI, Dupire (comparação lado a lado).
- **Fair Value Table** com 3 cenários (Base / Otimista / Pessimista, ±20% IV).
- **FedWatch** (probabilidades implícitas FED).
- **Beta USD/BRL** via regressão: `USDBRL_projetado = USDBRL × (1 + α + β·Var%_Proxy)`.

### Módulos JS (ordem de carregamento)

1. `assets/data/market_data.js` (dados globais)
2. `../../Cotacoes/dashboard/MERCADO/assets/data/fed_watch_rates.js`
3. `assets/data/yahoo_usdu_options.js`, `yahoo_uup_options.js`, `yahoo_ewz_options.js`
4. `assets/js/particles.js`
5. `../shared/js/chart_data_utils.js`
6. `../shared/unified-nav.js`
7. `../shared/js/daytrade-tools.js`
8. `../shared/js/greeks-heatmap.js`
9. `../shared/js/split-view.js`
10. `assets/js/main.js` + `assets/js/charts.js`

**CDN:** Chart.js (jsdelivr) + three.js r128 (cdnjs).

### Controles interativos

`#assetSelect` · `#uupExpirySelect` · `#uupMinOiInput` · `#usduExpirySelect` · `#usduMinOiInput` · `#usdBetaProxySelect` · `#usdBetaExpirySelect` · `#usdBetaWindowSelect` (30/60/90/252d) · `#usdBetaMinOiInput` · `#usdBetaDownloadBtn` · `#oiExpiryMode`.

---

## 3. WIN — `dashboard_unificado/WIN/index.html`

- **Tamanho:** 836 linhas / 47,3 KB (clone do WDO com menos ferramentas externas).
- **Seções (17):** Mesmas do WDO menos `#tools` (FedWatch + UUP + USDU + Beta).

### Diferenças chave em relação ao WDO

- ❌ Sem FedWatch (sem `fed_watch_rates.js`)
- ❌ Sem UUP/USDU Beta — só o proxy **EWZ** via Yahoo
- ✅ Controles: `#ewzOptionsExpirySelect` + `#ewzOptionsMinOi`

Texto característico: *"Os valores são convertidos para a escala do WIN para facilitar leitura junto do SPOT."*

---

## 4. MERCADO — `Cotacoes/dashboard/MERCADO/index.html` (MAIS COMPLEXO)

- **Tamanho:** 1.915 linhas / 99 KB.
- **Seções (15+):** overview (com 11 sub-blocos operacionais) · intel · my-assets · flow-sentinel · commodities · metals · fx-carry · emerging · mercosul · brazil-market · alerts · all-assets · panorama · data-pack.

### Sub-blocos operacionais de #overview

`globalCoverageAudit` · `operationalCompass` · `operationalBriefing` · `zqCurveBriefing` (RISK ON/OFF) · `usTreasuryFuturesBriefing` · `usEquitiesOperationalBriefing` · `commoditiesOperationalBriefing` · `petrobrasGauge` · `petrobrasNews` · `btcOperationalBriefing` · `hk50OperationalBriefing` · `topMovers` · `overviewChart`.

### Módulos JS (76 scripts!)

- **Dados (9):** `market_quotes.js`, `zq_curve.js`, `economic_calendar.js`, `agenda_reports.js`, `options_gamma_summary.js`, `web_news_module.js`, `foreign_flow.js`, `petrobras_module.js` (+ versão `web_news_module-Edi.js`).
- **Core (5):** `market-utils.js`, `charts.js`, `instruments-catalog.js`, `rates-buckets(-helpers).js`, `operational-compass.js`, `us-operational-eua(-helpers).js`, `decision-core.js`.
- **Blocos (60+):** subdiretório `assets/js/blocks/` com módulos versionados (`?v=20260523_1`, etc.).

**Único dashboard com QuickNav completo** (drawer + Ctrl+K) — ver `03_navigation_audit.md`.

### Dados consumidos

`market_quotes.json` (~30+ ativos) · `zq_curve.json` · `economic_calendar.json` · `agenda_reports.js` · `options_gamma_summary.json` (e `-Edi.json`) · `foreign_flow.json` · `web_news_module.json` · `petrobras_module.json` · `us_tsy_futures.json` · `focus_summary.json` · `fed_watch_rates.json` + iframe `sslecal2.investing.com`.

---

## 5. Correlation — `dashboard_unificado/correlation/index.html`

- **Tamanho:** 90 linhas / 4,1 KB (dashboard minimalista).
- **Seções (2):** matriz principal (`.panel` com `#meta`, colorbar, `#pin`, `#matrix`, `#status`) · `#supergraphics` (grid `#supergraphicsCards`).

### ⚠️ Problema

Carrega `../shared/styles.css` que **NÃO EXISTIA** (até F2 — agora existe).

### Módulos JS (8)

`market_quotes.js` (compartilhado com MERCADO) · `particles.js` · `unified-nav.js` · `corr-math.js` · `corr-catalog.js` · `corr-ui.js` · `supergraphics_config.js` · `supergraphics-cards.js` + `main.js`.

### Indicadores

- Matriz de correlação de Pearson Top-20 ativos (janela ~1h).
- Cards "supergráficos" (templates 1:1).
- Botão "Atualizar" (`#btn-refresh`).

---

## 6. Controle — `dashboard_unificado/controle/index.html` ✅ CRIADO EM F2

> **Era phantom**, agora resolvido. Wrapper canônico em F2 (2026-06-21). Redireciona para `controle_de_dados.html` (legado) após 2s.

---

## 7. Controle (Legado) — `controle_de_dados.html`

- **Tamanho:** 784 linhas / 41 KB.
- **CSS:** 100% inline `<style>` (96 linhas, **paleta própria** indigo).
- **JS:** `particles.js` + `unified-nav.js` + IIFE inline (~500 linhas) + `<script type="application/json">` embutido.

### 14 cards dinâmicos

| Card | Conteúdo | Origem |
|---|---|---|
| Resumo | badges Opções/git, WDO/WIN last_updated, Yahoo cobertura, Saúde Yahoo | `data.options`, `data.state`, `data.market_quotes` |
| Opções • WDO (Barchart CSV_Dolar) | dir, arquivos, contratos faltando, tabela Contrato/Vencimento/mtime | `data.options.csv_dolar` |
| Opções • Índice (Barchart CSV_Indice) | tabela 12 mais recentes por vencimento | `data.options.csv_indice.files_recent` |
| Dashboard Unificado (saídas) | badge Publish OK/FAIL/SWAP/FALLBACK + timestamps | `data.options.dashboard_unificado` |
| Cotações (market:service) | badge running/last_finished + tabela | `data.cotacoes.market_status` |
| Investing + InfoMoney | badges portfolio/calendário/DI com staleness | `data.market_quotes.meta` |
| Yahoo (sem navegador) • Cobertura | badge + health score 0-100 + tabela | `data.market_quotes.meta.yahooCoverage` |
| Aderência • Investing x Yahoo | tabela 18 críticos + 18 top divergências | `data.yahoo_audit.compareCritical/compareTop` |
| Curva de Juros EUA (Fed Funds • ZQ) | badge RISK_ON/RISK_OFF + slope + tabela vértices | `data.zq_curve.items` |
| Fluxo estrangeiro | badge exist + idade | `data.foreign_flow` |
| TradingView (fechamentos) | badge idade + AUTO_BARCHART_LAST_SLOT_ISO + WDO_SPOT + WIN_SCALING_* | `data.tradingview` |
| Sina (minério DCE_I0) | badge presente + preço/var | `data.sina` |
| Yahoo Auditoria (faltantes) | badge Audit missing + tabela Asset/Categoria/Yahoo/Motivo | `data.yahoo_audit.missing` |
| Logs recentes | tabela opções + cotações | `data.logs.options_recent`, `data.logs.cotacoes_recent` |

**Saúde Yahoo:** `scoreCoverage*0.75 + scoreStale*0.25` (0-100).
**Aderência thresholds:** |Δpreço%| ≤ 0.20 ok / ≤ 0.70 warn / ≤ 1.50 risk / > 1.50 bad.
**ZQ:** `Juro Implícito (%) = 100 - Preço`; classificação RISK_OFF/RISK_ON.

---

## Tabela Resumo Consolidada

| # | Dashboard | Path | Tam | Seções | Hardcoded? | QuickNav | Filtro Ativo | Data/Expiry Selector |
|---|---|---|---|---|---|---|---|---|
| 1 | **HUB** | `dashboard_unificado/index.html` | 8 KB / 205 L | 2 | Sim (`43/43`) | Sim (`assetSelect`) | Não | Não |
| 2 | **WDO** | `dashboard_unificado/WDO/index.html` | 54 KB / 906 L | 18+ | Sim (`+12.5%/+8.3%/-2.1%/0.0%`) | Sim | Não | Sim (uup/usdu/beta expiry) |
| 3 | **WIN** | `dashboard_unificado/WIN/index.html` | 47 KB / 836 L | 17 | Sim (idem WDO) | Sim | Não | Sim (ewz expiry) |
| 4 | **MERCADO** | `Cotacoes/dashboard/MERCADO/index.html` | 99 KB / 1915 L | 15+ | Não (99% dinâmico) | **Sim completo (drawer + Ctrl+K)** | Sim (watchlist ★) | Não (calendário via iframe) |
| 5 | **Correlation** | `dashboard_unificado/correlation/index.html` | 4 KB / 90 L | 2 | Não | Sim (`assetSelect`) | Não | Não |
| 6 | **Controle** | `dashboard_unificado/controle/index.html` | 5 KB / ~95 L | 1 + redirect | Não (dinâmico) | Sim | Não | Não |
| 7 | **Controle (Legado)** | `controle_de_dados.html` | 41 KB / 784 L | 14 cards | Não (tudo derivado do JSON embutido) | Sim | Não | Não |

---

## Stack transversal

- **CDN externa comum:** Chart.js (`cdn.jsdelivr`), three.js r128 (`cdnjs`), Google Fonts (Orbitron + Share Tech Mono).
- **Módulo `unified-nav.js`** presente em 6/7 dashboards.
- **Módulo `particles.js`** presente em 6/7.
- **Tema visual:** todos usam o estilo "Neon Terminal" / "Stranger Things" — mas com aderência variável (ver `02_theme_audit.md`).
- **Cache-busting agressivo apenas no MERCADO:** todos os 60+ blocos de `assets/js/blocks/` carregam com `?v=20260523_1` ou `?v=20260528_1`.

---

*Modo read-only · RECRIADO em 19:53 após perda do original.*