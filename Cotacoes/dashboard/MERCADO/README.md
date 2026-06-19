# Dashboard MERCADO — Cotações de Mercado

> Dashboard completo de cotações com panomarama de mercado, fluxo estrangeiro, curva de juros e alertas.

## Acesso

- **Arquivo**: `Cotacoes/dashboard/MERCADO/index.html`
- **Navegação**: Use o seletor dropdown ou `Ctrl+K` para QuickNav

## Funcionalidades

### Visão Geral
- Ativos monitorados, Maior Alta/Queda, Sinal de Fluxo
- Ticker global (scroll animation)
- Qualidade do feed (drivers críticos)
- Resumo operacional (WIN, WDO, Commodities, Criptos)

### Seções
- **Operacional EUA**: US30, Nasdaq, S&P 500
- **Commodities**: Ouro, Petróleo
- **Petrobras**: Velocímetro híbrido
- **BTC**: Bitcoin operacional
- **HK50**: Hang Seng
- **Top Movers**: Rotação por classe

### Dados
- `assets/data/market_quotes.js` — cotações em tempo real
- `assets/data/foreign_flow.js` — fluxo estrangeiro
- `assets/data/zq_curve.js` — curva de juros EUA
- `assets/data/economic_calendar.js` — calendário econômico

## Como Atualizar

```bash
# Via TypeScript (recomendado)
npx -y tsx tools/market/build-market-history.ts --csv "watchlist.csv"

# Via npm
npm run market:update
```

### Parâmetros
```bash
npx -y tsx tools/market/build-market-history.ts \
  --csv "watchlist.csv" \
  --interval 30 \
  --retentionDays 10
```

## Notas

- Se abrir via `file://`, use o botão "↻ Dados" após atualizar `market_quotes.js`
- Dados do Investing (portfolio, calendário, DI) ficam em `market_quotes.json`
