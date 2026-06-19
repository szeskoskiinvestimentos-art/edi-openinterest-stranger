# Descobertas - EDI Agent

## 2026-06-19

### D1: TradingView Scanner API
- Endpoint: scanner.tradingview.com/global/scan
- Símbolos B3: BMFBOVESPA:WIN1!, BMFBOVESPA:WDO1!
- US ETFs: Não funcionam via Scanner, usar Yahoo Finance
- Headers necessários: Origin, Referer

### D2: Estrutura market_data.js
- Formato: window.marketData = {JSON};
- Início pode ter comentários //
- spot_price top-level = preço proxy (EWZ)
- overview.spot_price = preço real do ativo

### D3: Pipeline de dados
- Barchart (Selenium) → CSV → Python → JS → Dashboard
- .env.auto é o elo frágil (write não-atômico)
- Dois paths de cópia: config.py e .bat robocopy

### D4: Configuração Barchart
- Necessita Selenium com undetected_chromedriver
- CSRF tokens expiram, precisam de cache
- Rate limit: HTTP 429 com backoff 60s