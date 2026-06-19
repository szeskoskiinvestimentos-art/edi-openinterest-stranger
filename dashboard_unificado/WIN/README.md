# Dashboard WIN — Opções do Índice (Ibovespa)

> Análise de opções financeiras WIN com Gamma Flip, Max Pain, Greeks Exposure e Fair Value.

## Acesso

- **Arquivo**: `dashboard_unificado/WIN/index.html`
- **Navegação**: Use o seletor dropdown ou `Ctrl+K` para QuickNav

## Funcionalidades

### Visão Geral
- Total de negócios, Open Interest, Gamma Exposure, Delta Position
- Resumo Executivo (Fair Value simulation)
- Open Interest por Vencimento
- Most Actives (Top OI e Volume)
- Volume & Volatilidade

### Essenciais
- Delta Acumulado (exposição direcional dos dealers)
- Gamma Exposure (sensibilidade ao movimento do preço)

### Estrutura
- Delta Agregado (visão consolidada)
- Open Interest por Strike
- Gamma Exposure (Call vs Put)

### Gregas de 2ª Ordem
- Vanna Exposure (Delta × IV)
- Charm Exposure (Delta × Tempo)
- Theta Exposure (decaimento temporal)
- Vega Exposure (sensibilidade à volatilidade)

### V3 Analysis
- Max Pain Curve (preço de máxima dor)
- Expected Move Cone (variação esperada 1σ)
- Gamma Flip Cone (incerteza via sigma_factor)
- Delta Flip Profile (simulação Spot ±15%)
- Flow Sentiment (análise Bull/Bear)
- Dealer Pressure Index
- MM PnL Simulation
- Fair Value Simulation

### Ferramentas
- Open Interest por Strike (Proxy via EWZ)

## Dados

O dashboard carrega automaticamente:
- `assets/data/market_data.js` — dados principais
- `assets/data/yahoo_ewz_options.js` — opções EWZ (proxy)

**⚠️ NÃO editar** manualmente estes arquivos — são regenerados pelo pipeline.

## Comandos Úteis

```bash
# Atualizar spot prices
python scripts/update_spot_prices.py --target WIN

# Pipeline completo
python main.py
```
