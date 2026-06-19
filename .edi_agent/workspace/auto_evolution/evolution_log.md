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