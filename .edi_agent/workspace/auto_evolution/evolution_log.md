# Log de Evolução - EDI Agent

## 2026-06-19

### E1: Atomic .env.auto write (CRÍTICO)
- **Arquivo**: automacao_dados.py
- **Mudança**: Write → .tmp → os.replace()
- **Risco**: Baixo
- **Status**: Implementado

### E2: Spot Price Validation (CRÍTICO)
- **Arquivo**: automacao_dados.py
- **Mudança**: Validação WDO 3000-10000, IND1! 50k-300k
- **Risco**: Baixo
- **Status**: Implementado

### E3: Decouple WDO/WIN (CRÍTICO)
- **Arquivo**: config.py
- **Mudança**: Ambos rodam independentemente
- **Risco**: Baixo
- **Status**: Implementado

### E4: Tight Loop Fix (CRÍTICO)
- **Arquivo**: servico_unificado.py
- **Mudança**: time.sleep(30) antes de continue
- **Risco**: Baixo
- **Status**: Implementado

### E5: math Import Fix (BAIXO)
- **Arquivo**: automacao_dados.py
- **Mudança**: import math movido para topo
- **Risco**: Nenhum
- **Status**: Implementado

### E6: Duplicate max_pain Init (BAIXO)
- **Arquivo**: calculator.py:227
- **Mudança**: Removida inicialização duplicada de self.max_pain
- **Risco**: Nenhum
- **Status**: Implementado

### E7: GEX Signed Documentation (MÉDIO)
- **Arquivo**: calculator.py:380-401
- **Mudança**: Comentários claros sobre convenção de sinal (não padrão, mas internamente consistente)
- **Risco**: Nenhum
- **Status**: Implementado

### E8: Greeks Broadcast Fix (CRÍTICO)
- **Arquivo**: greeks.py
- **Mudança**: Função _broadcast_to_k_shape() garante que S, T, r, sigma têm mesma forma que K
- **Problema**: S escalar + K array causava IndexError em calculate_vega/theta
- **Risco**: Baixo
- **Status**: Implementado

### E9: Gamma Flip Tests (MÉDIO)
- **Arquivo**: tests/test_gamma_flip.py (novo)
- **Mudança**: 3 testes: convenção de sinal, consistência gex_flip_base, 7 variações
- **Resultado**: 3/3 passando
- **Risco**: Nenhum
- **Status**: Implementado

### E10: IV Per-Strike Integration (CRÍTICO)
- **Arquivo**: calculator.py:313-352
- **Mudança**: Delta, Gamma, Charm, Vanna agora usam `iv_strike_ref` (per-strike) em vez de `sigma` (flat)
- **Fallback**: Se `iv_strike_ref` indisponível, usa flat IV
- **Impacto**: Greeks agora refletem IV Smile real, não IV constante
- **Risco**: Baixo
- **Status**: Implementado

### E11: IV Smile Tests (MÉDIO)
- **Arquivo**: tests/test_iv_smile.py (novo)
- **Mudança**: 3 testes: IV per-strike usado em Greeks, IV Smile produz GEX diferente, IV Skew computado
- **Resultado**: 3/3 passando
- **Risco**: Nenhum
- **Status**: Implementado

### E12: Calculator Core Coverage Tests (ALTO)
- **Arquivo**: tests/test_calculator_core.py (novo)
- **Mudança**: 9 testes cobrindo métodos críticos:
  - calculate_max_pain (básico + simétrico)
  - calculate_expected_moves (estrutura + simetria)
  - calculate_effective_walls
  - calculate_flow_sentiment
  - calculate_pinning_risk
  - calculate_flips_and_walls (integração)
  - _find_zero_cross
- **Resultado**: 9/9 passando
- **Status**: Implementado

### E13: Print→Logger Cleanup (MÉDIO)
- **Arquivo**: calculator.py
- **Mudança**: 8 chamadas print() substituídas por logger.error()
- **Linhas**: 435, 511, 516, 521, 526, 531, 536, 1135
- **Impacto**: Erros agora aparecem com timestamp e nível no log
- **Status**: Implementado

### E14: Dead Config Flags Removal (MÉDIO)
- **Arquivo**: config.py
- **Mudança**: 6 flags mortas removidas:
  - USE_IMPLIED_VOL (não referenciada)
  - EWZ_TO_INDEX_SCALE_ENABLED (não referenciada)
  - ATM_BAND_STEPS (não referenciada)
  - TAXA_FED + MANUAL_TAXA_FED_PCT (não referenciada)
  - IPCA_PCT + MANUAL_IPCA_PCT (não referenciada)
  - FIB_LEVELS (calculator.py hardcoda localmente)
- **Impacto**: Config mais limpa, menos confusão para desenvolvedores
- **Status**: Implementado

### E15: Dashboard Theme Normalization (ALTO)
- **Arquivos**: correlation/assets/css/style.css, controle/index.html
- **Mudança**: CORR e CONTROLE normalizados para tema Neon Terminal (WDO como referência)
- **Correções**:
  - CORR: Removidos overrides CSS (cores Tailwind → neon variables, fontes system → Orbitron/Share Tech Mono)
  - CORR: Brand name corrigido "GUARDIAN" → "GUARDIN"
  - CONTROLE: CSS inline substituído por variáveis do shared/styles.css
  - CONTROLE: Adicionados header e nav bar estruturais
  - CONTROLE: Cores status (ok/warn/bad) agora usam glow effects neon
- **Status**: Implementado

### E16: Hardcoded Paths Fix (CRÍTICO)
- **Arquivos**: controle_de_dados.html, dashboard_unificado/controle/index.html, servico_unificado.py
- **Problema**: Caminhos absolutos de localização antiga (C:\Users\ednil\Downloads\Gamma\...) estavam embedded no JSON dos HTMLs
- **Mudança**:
  - servico_unificado.py: root_dir agora usa "AUTO_DETECT" em vez de str(cfg.root_dir)
  - controle/index.html: JavaScript detecta project root via page location
  - controle_de_dados.html: Mesma detecção dinâmica
- **Impacto**: Sistema agora é portável - funciona de qualquer localização
- **Status**: Implementado

### E17: BS Price Broadcast Fix (CRÍTICO)
- **Arquivo**: greeks.py:143-154
- **Problema**: bs_price() tinha o mesmo bug de broadcast que calculate_greeks() - S escalar + K array causava IndexError
- **Mudança**: Adicionado _broadcast_to_k_shape() para alinhar shapes antes do cálculo
- **Impacto**: MM PnL simulation agora funciona sem erros
- **Resultado**: 35/35 testes passando
- **Status**: Implementado

### E18: Calculator Module Split (ALTO)
- **Arquivo**: src/calculator/core.py (1272 linhas → 6 submodules)
- **Mudança**: Split em mixin pattern:
  - core.py (373 linhas): __init__, orchestrator, summary
  - flips.py (319 linhas): gamma flip, delta flip, flip cone, 7 variações
  - greeks_exposure.py (129 linhas): delta/gamma/charm/vanna accumulation
  - volatility.py (138 linhas): VRP, expected moves, pinning risk
  - walls.py (71 linhas): max pain, effective walls
  - fair_value.py (106 linhas): MM PnL, fair value scenario
- **Impacto**: Código mais modular, testável, legível
- **Resultado**: 26/26 testes passando
- **Status**: Implementado

### E19: Orphan Files Cleanup (MÉDIO)
- **Arquivos deletados**:
  - src/tradingview_options.py (243 linhas, zero referências)
  - scripts/gerar_controle.py (335 linhas, superseded por Cotacoes version)
  - scripts/verify_update.py (20 linhas, sem callers)
- **Cache limpo**: src/__pycache__/, src/calculator/__pycache__/
- **Dead function removida**: get_business_days() de utils.py
- **Status**: Implementado

### E20: Test Infrastructure (ALTO)
- **Arquivos criados**:
  - tests/conftest.py: fixtures compartilhados (synthetic_options_data, simple_calc, spot_100_strikes)
  - tests/test_charts.py: 2 testes (create_dashboard_figure retorna Figure, sem exceções)
  - tests/test_ntsl.py: 2 testes (generate_ntsl_script retorna string, contém keywords)
- **run_all.py atualizado**: 4 novos testes integrados
- **Resultado**: 30/30 testes passando
- **Status**: Implementado

---

## 2026-06-21 (Sessão Hermes + Owner paralelo)

### E96: `safe_rmtree` / `safe_remove` com guard `.edi_agent/.protected` (ALTO)
- **Autor**: Hermes (orquestrador) — 2026-06-21, ~20:30 BRT
- **Contexto**: Investigação F3 sobre rotinas `.bat` + F4.1 implementar proteções em `src/safe_ops.py` (já existente em E95).
- **Mudança**:
  - **`src/safe_ops.py`** (+~110 L):
    - Constante `SAFE_TO_PURGE_PREFIXES` (snapshots antigos podem ser purgados by design)
    - Função `_is_protected_target(path)` — detecta path sob `.edi_agent/` (mas não sob `.edi_agent/snapshots/`)
    - Função `safe_rmtree(path, logger)` — wrapper para `shutil.rmtree` com guard; **raise PermissionError** se alvo for protegido
    - Função `safe_remove(path, logger)` — wrapper para `os.remove` com mesmo guard
  - **`scripts/orquestrador.py`** (+9 L): 3 chamadas `shutil.rmtree` refatoradas para `_safe_rmtree` com fallback
  - **`Cotacoes/tools/market/gerar_controle.py`** (+11 L): `_safe_rmtree` local delega para novo helper
  - **`tests/test_safe_ops.py`** (NOVO, 138 L): 13 testes cobrindo proteção, purge allow, paths seguros, real delete, nonexistent, exception types
- **Comportamento**:
  - `safe_rmtree(".edi_agent/workspace/X.md")` → **PermissionError** ("BLOQUEADO")
  - `safe_rmtree(".edi_agent/snapshots/snap-2025-X")` → **executa** (purga by design)
  - `safe_rmtree("service_locks/options_run.lock")` → **executa** (não protegido)
- **Testes**: 13/13 PASSED (manual runner); 278/278 PASSED no `run_all.py` (264 originais + 14 novos)
- **Risco**: Baixo (mudanças cirúrgicas com fallback)
- **Status**: Implementado

### Notas da sessão (Hermes, 2026-06-21)

- **Owner paralelo via Mimo/Opencode**: reescreveu `Servico_Unificado.bat` e `Servico_Unificado_FORCE.bat` para v2.0 com "E95b-prevention: 3 camadas de defesa contra sobrescrita do dashboard". Commit `437ae614`.
- **F2/F3.1 arquivos NOVOS preservados**: `.edi_agent/.protected`, `auditoria_inicial_2026-06-21/*.md` (7), `dashboard_unificado/controle/index.html`, `dashboard_unificado/shared/styles.css`. Commitados via E95b-prevention.
- **F2/F3.1 modifications dos docs perdidos**: E74/E75 entries em `evolution_log.md`, CP-043/CP-044 em `CHECKPOINT.md`, etc. foram revertidas antes de commit. Owner pode re-aplicar se necessário.