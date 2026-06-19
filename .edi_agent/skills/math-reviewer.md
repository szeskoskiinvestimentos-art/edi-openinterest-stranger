# Skill: Math Reviewer

## Descrição
Revisa cálculos e modelos matemáticos dos sistemas WDO e WIN.

## Modelos do Sistema

### WDO (Dólar - USD/BRL)
- Cálculos de opções
- Greeks (Delta, Gamma, Theta, Vega, Charm)
- Gamma Exposure
- Dealer Pressure
- Delta Flip Profile

### WIN (Índice Brasileiro)
- Cálculos de opções
- Mesmos indicadores do WDO
- Foco em EWZ (iShares MSCI Brazil ETF)

## Fontes de Dados

1. **Yahoo Finance**: Opções USD (UUP, USDU)
2. **Barchart**: Opções EWZ (índice)
3. **Dados internos**: market_data.js/json

## Verificações

### 1. Integridade dos Dados
```javascript
// Verificar se dados existem e são válidos
function validateData(data) {
  return data && Array.isArray(data) && data.length > 0;
}
```

### 2. Fórmulas Matemáticas
- **Delta**: ∂V/∂S
- **Gamma**: ∂²V/∂S²
- **Theta**: ∂V/∂t
- **Vega**: ∂V/∂σ
- **Charm**: ∂Δ/∂t

### 3. Consistência
- Verificar se calls e puts são balanceados
- Validar strikes e expirações
- Conferir volumes e OI

## Arquivos de Referência

- `src/calculator.py` - Cálculos principais
- `src/greeks.py` - Cálculos de Greeks
- `exports/` - Gráficos gerados
- `dashboard_unificado/WDO/` - Dashboard WDO
- `dashboard_unificado/WIN/` - Dashboard WIN