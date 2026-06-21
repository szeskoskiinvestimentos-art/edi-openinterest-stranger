# 04 — Inventário de Modelos Matemáticos

> **Fonte:** Varredura manual Hermes · 2026-06-21 · read-only.
> **Locais:** `C:\Projetos_Hermes\Edi_Market_Guardian_V0\src\calculator\` (26 .py) + `C:\Projetos_Hermes\Edi_Market_Guardian_V0\tests\` (24 .py).
> **NOTA**: Arquivo recriado após perda do original (~19:53).

---

## 1. Achado-chave

**`src/calculator/` contém 26 arquivos Python** — **5 modelos a mais que o prompt v1.2 declara.** Arsenal quântico real é maior do que a documentação sugere.

Modelos adicionados após a v1.2 (de 2026-06-19):
- `bates.py` (Bates = jump-diffusion + stochastic vol — extensão do Heston)
- `kaniadakis.py` (estatística Kaniadakis / não-extensiva)
- `markovian_bergomi.py` (aproximação Markoviana de rough vol)
- `rough_heston.py` (Heston com rough vol)
- `monte_carlo_rbergomi.py` (MC engine para rough Bergomi)

---

## 2. Inventário `src/calculator/` (26 arquivos)

| Arquivo | Tamanho | Última mod. | Modelo / Função | Teste |
|---|---:|---|---|---|
| `__init__.py` | 641 B | 19/06 13:22 | (init) | — |
| `bates.py` | 15.078 B | 21/06 09:08 | **Bates (jump-diffusion + stochastic vol)** | `test_bates.py` (11.998 B, 21/06 09:10) |
| `core.py` | 21.245 B | 21/06 16:17 | OptionsCalculator principal | `test_calculator_core.py` (11.134 B, 19/06 16:41) |
| `discovery.py` | 7.488 B | 20/06 20:17 | Auto-discovery (E44) | `test_discovery.py` (9.024 B, 20/06 20:19) |
| `dupire.py` | 7.472 B | 21/06 16:27 | **Dupire (local vol)** | `test_dupire.py` (7.517 B, 20/06 15:34) |
| `fair_value.py` | 5.601 B | 21/06 16:27 | Fair value scenarios | (consolidado em `test_calculator_core.py`) |
| `flips.py` | 15.781 B | 21/06 16:37 | Gamma flip / delta flip (7 variações) | `test_gamma_flip.py` (4.855 B, 19/06 10:37) |
| `greeks_exposure.py` | 7.227 B | 19/06 13:24 | GEX accumulation | (consolidado em `test_calculator_core.py`) |
| `heston.py` | 13.941 B | 21/06 16:27 | **Heston (stochastic vol)** | `test_heston.py` (9.554 B, 20/06 15:24) |
| `iv_smile.py` | 9.906 B | 20/06 19:01 | IV per-strike + bisect | `test_iv_smile.py` (6.156 B, 19/06 10:48) + `test_iv_bisect.py` (5.783 B, 19/06 21:05) |
| `kaniadakis.py` | 13.872 B | 21/06 12:02 | **Kaniadakis (estatística não-extensiva)** | `test_kaniadakis.py` (10.915 B, 21/06 12:03) |
| `kelly.py` | 4.894 B | 20/06 16:22 | Kelly Criterion | `test_kelly.py` (4.346 B, 20/06 16:22) |
| `kou.py` | 14.966 B | 20/06 19:01 | **Kou (double-exponential jumps)** | `test_kou.py` (11.295 B, 20/06 17:37) |
| `markovian_bergomi.py` | 10.488 B | 21/06 13:20 | **Markovian Bergomi (rough vol approx)** | `test_markovian_bergomi.py` (9.079 B, 21/06 13:16) |
| `merton.py` | 15.210 B | 20/06 19:01 | **Merton (jump-diffusion log-normal)** | `test_merton.py` (11.325 B, 20/06 17:37) |
| `monte_carlo_rbergomi.py` | 8.380 B | 21/06 13:35 | **MC engine para rough Bergomi** | `test_monte_carlo_rbergomi.py` (7.736 B, 21/06 13:38) |
| `position.py` | 5.067 B | 20/06 16:28 | Position P&L | `test_position.py` (3.876 B, 20/06 16:22) |
| `rough_bergomi.py` | 11.496 B | 20/06 17:59 | **Rough Bergomi (Bayer-Friz-Gatheral 2016)** | `test_rough_bergomi.py` (8.706 B, 20/06 18:01) |
| `rough_heston.py` | 13.530 B | 21/06 11:46 | **Rough Heston (stoch vol rough)** | **🔴 SEM TESTE dedicado** |
| `stress_test.py` | 9.828 B | 20/06 19:01 | Stress test (8 cenários) | (consolidado em `test_calculator_core.py`) |
| `svi.py` | 7.600 B | 20/06 19:01 | **SVI (no-arbitrage smile)** | (consolidado em `test_calculator_core.py`) |
| `veta.py` | 4.999 B | 20/06 16:28 | **Veta (∂V/∂t)** | (consolidado em `test_calculator_core.py`) |
| `volatility.py` | 12.181 B | 19/06 20:54 | VRP, expected moves, pinning | (consolidado em `test_calculator_core.py`) |
| `vwap.py` | 6.861 B | 20/06 17:19 | **VWAP intraday** | (consolidado em `test_calculator_core.py`) |
| `walls.py` | 4.039 B | 19/06 13:44 | Max Pain, effective walls | (consolidado em `test_calculator_core.py`) |

---

## 3. Inventário `tests/` (24 arquivos)

| Arquivo | Tamanho | Última mod. | Cobre |
|---|---:|---|---|
| `conftest.py` | 1.473 B | 19/06 12:37 | fixtures compartilhadas |
| `run_all.py` | 101.342 B | 21/06 12:04 | runner customizado (264 testes declarados) |
| `test_auto_discovery.py` | 4.204 B | 19/06 21:30 | E44 — auto-discovery |
| `test_bates.py` | 11.998 B | 21/06 09:10 | **Bates** |
| `test_calculator_core.py` | 11.134 B | 19/06 16:41 | core methods (volatility, walls, fair_value, svi, veta, vwap, stress_test, position, greeks_exposure, kelly) |
| `test_charts.py` | 3.083 B | 19/06 12:38 | Plotly charts |
| `test_dashboards.py` | 10.391 B | 20/06 20:47 | **Dashboards (E26)** |
| `test_discovery.py` | 9.024 B | 20/06 20:19 | E44 — auto-discovery |
| `test_dupire.py` | 7.517 B | 20/06 15:34 | **Dupire** |
| `test_gamma_flip.py` | 4.855 B | 19/06 10:37 | GEX + flip |
| `test_greeks.py` | 3.815 B | 12/05 15:45 | Greeks base |
| `test_heston.py` | 9.554 B | 20/06 15:24 | **Heston** |
| `test_hub_health.py` | 3.322 B | 19/06 21:11 | E31 — HUB health |
| `test_iv_bisect.py` | 5.783 B | 19/06 21:05 | E25 — IV bisect |
| `test_iv_smile.py` | 6.156 B | 19/06 10:48 | IV per-strike |
| `test_kaniadakis.py` | 10.915 B | 21/06 12:03 | **Kaniadakis** |
| `test_kelly.py` | 4.346 B | 20/06 16:22 | Kelly |
| `test_kou.py` | 11.295 B | 20/06 17:37 | **Kou** |
| `test_markovian_bergomi.py` | 9.079 B | 21/06 13:16 | **Markovian Bergomi** |
| `test_merton.py` | 11.325 B | 20/06 17:37 | **Merton** |
| `test_monte_carlo_rbergomi.py` | 7.736 B | 21/06 13:38 | **MC rBergomi** |
| `test_ntsl.py` | 3.065 B | 19/06 12:38 | NTSL generation |
| `test_position.py` | 3.876 B | 20/06 16:22 | Position P&L |
| `test_rough_bergomi.py` | 8.706 B | 20/06 18:01 | **Rough Bergomi** |
| ⚠️ `test_rough_heston.py` | — | — | **🔴 FALTANDO** |

> Total: **24 arquivos de teste**. Lista do `ls` mostra 23 nomes + `__init__.py` + `conftest.py` + `run_all.py` + `tests/js/`. Cobertura efetiva pode incluir sub-testes em arquivos consolidados (`test_calculator_core.py` cobre ~10 modelos). Total declarado: **264 testes**.

---

## 4. Tabela de cobertura (modelo × implementação × teste × uso)

| Modelo | Implementação | Teste dedicado | Uso nos dashboards |
|---|---|:-:|---|
| **Black-Scholes (BSM)** | `src/greeks.py` (implícita em core) | `test_greeks.py` | ✅ WDO, WIN, CORR (comps) |
| **Heston** | `src/calculator/heston.py` | ✅ `test_heston.py` | ✅ WDO, WIN |
| **SABR (Hagan)** | (provavelmente em `iv_smile.py` ou implícito) | ⚠️ parcial (em `test_iv_smile.py`) | ✅ WDO |
| **Merton** | `src/calculator/merton.py` | ✅ `test_merton.py` | (a confirmar via grep) |
| **Kou** | `src/calculator/kou.py` | ✅ `test_kou.py` | (a confirmar) |
| **Bates** | `src/calculator/bates.py` | ✅ `test_bates.py` | (a confirmar) |
| **Rough Bergomi** | `src/calculator/rough_bergomi.py` + `monte_carlo_rbergomi.py` | ✅ `test_rough_bergomi.py` + `test_monte_carlo_rbergomi.py` | (a confirmar) |
| **Markovian Bergomi** | `src/calculator/markovian_bergomi.py` | ✅ `test_markovian_bergomi.py` | (a confirmar) |
| **Rough Heston** | `src/calculator/rough_heston.py` | **🔴 FALTA `test_rough_heston.py`** | (a confirmar) |
| **Dupire** | `src/calculator/dupire.py` | ✅ `test_dupire.py` | ✅ WDO (model comparison) |
| **SVI** | `src/calculator/svi.py` | ⚠️ em `test_calculator_core.py` | ✅ WDO (model comparison) |
| **Kaniadakis** | `src/calculator/kaniadakis.py` | ✅ `test_kaniadakis.py` | ❌ não usado nos dashboards |
| **Volga (∂V/∂σ²)** | (provavelmente em `greeks.py` ou `core.py`) | ⚠️ em `test_calculator_core.py` | (a confirmar) |
| **Veta (∂V/∂t)** | `src/calculator/veta.py` | ⚠️ em `test_calculator_core.py` | (a confirmar) |
| **Gamma Exposure (GEX)** | `src/calculator/greeks_exposure.py` + `flips.py` | ✅ `test_gamma_flip.py` | ✅ WDO, WIN |
| **Max Pain / Walls / Pinning** | `src/calculator/walls.py` + `volatility.py` | ⚠️ em `test_calculator_core.py` | ✅ WDO, WIN |
| **Discovery (E44)** | `src/calculator/discovery.py` | ✅ `test_discovery.py` + `test_auto_discovery.py` | ✅ WDO, WIN |
| **VWAP intraday** | `src/calculator/vwap.py` | ⚠️ em `test_calculator_core.py` | (a confirmar — E68) |
| **Position P&L** | `src/calculator/position.py` | ✅ `test_position.py` | ✅ (E66) |
| **Kelly Criterion** | `src/calculator/kelly.py` | ✅ `test_kelly.py` | ✅ (E67) |
| **Fair Value** | `src/calculator/fair_value.py` | ⚠️ em `test_calculator_core.py` | ✅ WDO, WIN |
| **Stress Test** | `src/calculator/stress_test.py` | ⚠️ em `test_calculator_core.py` | ✅ WDO |
| **NTSL generation** | `src/ntsl.py` (não em calculator/) | ✅ `test_ntsl.py` | ✅ WDO, WIN (download button) |

---

## 5. Gaps identificados

| Gap | Severidade | Ação sugerida |
|---|---|---|
| **`rough_heston.py` SEM teste dedicado** | 🟠 Média-alta | Criar `test_rough_heston.py` seguindo padrão dos demais (F3.4) |
| **Kaniadakis implementado e testado mas não usado nos dashboards** | 🟡 Média | Documentar como modelo "experimental" ou integrar (backlog) |
| **SABR não tem arquivo dedicado** | 🟡 Média | Verificar se está em `iv_smile.py` ou se precisa ser extraído |
| **Cobertura de uso dos 26 modelos nos 7 dashboards não está mapeada** | 🟠 Média-alta | grep por nome de cada modelo nos HTMLs e emitir matriz de uso |
| **Validação contra referências externas não foi feita** | 🔴 Alta | Hull cap. 15 (BSM); Gatheral (vol smile); Bayer-Friz-Gatheral 2016 (rough Bergomi); Merton 1976; Kou 2002 |
| **Prompt v1.2 não cita 5 modelos novos** | 🟡 Média | Atualizar prompt v1.2 → v2.0 (F3.2) |

---

## 6. Observações

- **Cronologia:** Arquivos com timestamps `21/06/...` foram tocados HOJE (audit time). Provavelmente trabalho recente em Bates, Kaniadakis, Markovian Bergomi, Monte Carlo rBergomi, Rough Heston, Flips, Fair Value, Dupire, Heston, Core.
- **MC engine isolado:** `monte_carlo_rbergomi.py` é desacoplado de `rough_bergomi.py` — engine MC pode ser reutilizada para outros modelos rough.
- **Edi_Markert_Guardian_Rev0H (legacy/EDI_X)** não foi tocado nesta auditoria (escopo respeitado).
- **Faltam testes para ~6 modelos consolidados em `test_calculator_core.py`** — desejável拆分 por modelo para isolar regressões.

---

*Modo read-only · RECRIADO em 19:53 após perda do original.*