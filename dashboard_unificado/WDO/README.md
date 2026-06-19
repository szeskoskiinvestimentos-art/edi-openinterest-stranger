# Dashboard WDO — Opções do Dólar (USD/BRL)

> Análise de opções financeiras WDO com Gamma Flip, Max Pain, Greeks Exposure e Fair Value.

## Acesso

- **Arquivo**: `dashboard_unificado/WDO/index.html`
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
- FedWatch (juros EUA)
- Opções de Dólar (UUP/USDU via Yahoo)
- Mapeamento Proxy → USD/BRL

## Dados

O dashboard carrega automaticamente:
- `assets/data/market_data.js` — dados principais
- `assets/data/yahoo_*.js` — opções UUP, USDU, EWZ
- `../../Cotacoes/dashboard/MERCADO/assets/data/fed_watch_rates.js` — FedWatch

**⚠️ NÃO editar** manualmente estes arquivos — são regenerados pelo pipeline.

## Comandos Úteis

```bash
# Atualizar spot prices
python scripts/update_spot_prices.py --target WDO

# Pipeline completo
python main.py
```
