## Dashboard - Cotações de Mercado (MVP)

Página estática no mesmo estilo do dashboard, organizada por categorias (commodities, metais, FX/carry e emergentes), com:
- tabela por categoria (clique no ativo para ver a série)
- gráfico por categoria (últimos 10 dias)
- sinal de “fluxo” (heurística)
- alertas locais (com toggle e notificação do navegador)

### Como abrir

Abra:
- `dashboard/MERCADO/index.html`
Se você abrir direto no navegador (file://), use o botão "↻ Dados" (ou F5) após atualizar o `market_quotes.js`.

### Como atualizar os dados (a partir do CSV exportado do Investing)

Coloque/atualize o CSV (export do Investing) e rode:

```bash
npx -y tsx tools/market/build-market-history.ts --csv "PréMercado_Watchlist_03102026.csv"
```

Ou via npm:

```bash
npm run market:update
```

Saídas:
- `dashboard/MERCADO/assets/data/market_quotes.json`
- `dashboard/MERCADO/assets/data/market_quotes.js`

Parâmetros úteis:

```bash
npx -y tsx tools/market/build-market-history.ts --csv "SEU_ARQUIVO.csv" --interval 30 --retentionDays 10
```
