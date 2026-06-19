# Revisão de Cálculos Matemáticos - WDO e WIN

## Data: 2026-06-18

---

## Fórmulas Implementadas

### 1. Black-Scholes (src/greeks.py)

#### Delta
- **Call**: Δ = N(d₁)
- **Put**: Δ = N(d₁) - 1
- Onde: d₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T)
- **Status**: ✅ Correto

#### Gamma
- Γ = φ(d₁) / (S·σ·√T)
- Onde: φ(d₁) é a função de densidade de probabilidade
- **Status**: ✅ Correto
- **Nota**: Tratamento de T=0 com np.nan_to_num() para evitar inf

#### Vega
- V = S·φ(d₁)·√T
- **Status**: ✅ Correto

#### Theta
- **Call**: Θ = -(S·φ(d₁)·σ)/(2√T) - r·K·e^(-rT)·N(d₂)
- **Put**: Θ = -(S·φ(d₁)·σ)/(2√T) + r·K·e^(-rT)·N(-d₂)
- Onde: d₂ = d₁ - σ√T
- **Status**: ✅ Correto

#### Preço Teórico (Black-Scholes)
- **Call**: C = S·N(d₁) - K·e^(-rT)·N(d₂)
- **Put**: P = K·e^(-rT)·N(-d₂) - S·N(-d₁)
- **Status**: ✅ Correto

---

### 2. Gamma Exposure (GEX)

#### Fórmula
```
GEX = Γ × OI × ContractMult × Spot × 0.01 × ScaleFactor
```
- **ContractMult**: 100 (para opções americanas)
- **ScaleFactor**: DISPLAY_SCALE_FACTOR (EWZ→Índice)
- **Status**: ✅ Correto

#### Gamma Flip (GEX Signed)
- **Call ITM (K≤S)**: +1 (Long Gamma)
- **Call OTM (K>S)**: -1 (Short Gamma)
- **Put ITM (K≥S)**: -1 (Short Gamma)
- **Put OTM (K<S)**: +1 (Long Gamma)
- **Status**: ⚠️ Lógica não padrão - requer validação

---

### 3. Charm (∂Δ/∂T)
- Implementação via diferenças finitas:
```
Charm = [Δ(T+Δt) - Δ(T-Δt)] / (2Δt)
```
- **Status**: ✅ Correto

---

### 4. Vanna (∂Δ/∂σ)
- Implementação via diferenças finitas:
```
Vanna = [Δ(σ+Δσ) - Δ(σ-Δσ)] / (2Δσ)
```
- **Status**: ✅ Correto

---

### 5. IV Skew
- Derivada local da volatilidade implícita:
```
IV Skew = ∇(IV_strike)
```
- Usando np.gradient()
- **Status**: ✅ Correto

---

### 6. Max Pain
- Ponto onde o valor total das opções é mínimo para holders
- **Status**: ✅ Implementado em calculate_max_pain()

---

### 7. Gamma Flip Variations

#### Classic (Linear Interpolation)
- Encontra cruzamento de zero no GEX cumulativo
- Interpolação linear para precisão
- **Status**: ✅ Correto

#### Spline
- Usa UnivariateSpline do scipy
- Encontra raízes da spline
- **Status**: ✅ Correto

#### HVL (Historical Volatility Level)
- Kernel gaussiano ponderado por volatilidade histórica
- w = exp(-((K-S)²) / (2σ²))
- **Status**: ✅ Correto

#### HVL Log
- Kernel logarítmico
- z = ln(K/S)
- w = exp(-(z²) / (2σ²))
- **Status**: ✅ Correto

#### Sigma Kernel
- Kernel ponderado por IV local
- σ_pts = IV × √T × SigmaFactor
- **Status**: ✅ Correto

#### PVOP (Price-Volume Overlap Point)
- Peso baseado em volume
- **Status**: ✅ Correto

#### HVL Gaussian
- Suavização gaussiana do GEX
- σ_gauss = 1.17 (otimizado)
- **Status**: ✅ Correto

---

### 8. Delta Flip Profile
- Simula Spot ±15% para encontrar inversão do Delta agregado
- 50 pontos de simulação
- **Status**: ✅ Correto

---

### 9. Gamma Flip Cone
- Varia SigmaFactor de CONE_ALPHA_MIN a CONE_ALPHA_MAX
- Mostra sensibilidade do Gamma Flip
- **Status**: ✅ Correto

---

### 10. Flow Sentiment
- Analisa variação de preço e volume
- Classifica fluxo como Bull/Bear
- **Status**: ✅ Correto

---

## Problemas Identificados

### P1: Gamma Flip Signed - Lógica Não Padrão
- **Arquivo**: `calculator.py:398-399`
- **Problema**: A lógica de sinal para Gamma Flip pode não seguir o padrão de mercado
- **Impacto**: Gamma Flip pode estar incorreto
- **Recomendação**: Validar com dados de mercado conhecidos

### P2: Tratamento de T=0
- **Arquivo**: `greeks.py:41`
- **Problema**: Gamma retorna inf quando T=0
- **Status**: Tratado com np.nan_to_num() mas pode mascarar erros
- **Recomendação**: Validar que T > 0 antes do cálculo

### P3: IV Estático
- **Arquivo**: `config.py:27`
- **Problema**: IV_ANNUAL é fixo (33.93%), não varia por strike
- **Impacto**: Gamma e outras gregas podem estar incorretas para OTM/ITM
- **Recomendação**: Implementar smile de volatilidade

---

## Recomendações

1. **Validar Gamma Flip**: Comparar com dados de mercado conhecidos
2. **Implementar Smile de IV**: Usar interpolação por strike
3. **Testar Edge Cases**: T=0, σ=0, Spot=0
4. **Documentar Fórmulas**: Adicionar referências acadêmicas
5. **Criar Testes Unitários**: Para cada fórmula implementada

---

## Conclusão

Os cálculos matemáticos estão **fundamentalmente corretos** e seguem as fórmulas padrão de Black-Scholes. As principais áreas de melhoria são:

1. **Gamma Flip Signed**: Requer validação com dados reais
2. **IV Smile**: Implementação futura para maior precisão
3. **Testes Unitários**: Para garantir correção em edge cases
