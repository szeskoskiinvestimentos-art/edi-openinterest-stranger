# Manual de Leitura e Cálculo — Dashboard MERCADO

## Visão Geral

- Estrutura: página estática em `dashboard/MERCADO/index.html` que carrega dados e scripts e renderiza tudo via `assets/js/main.js`.
- Dados carregados em memória global:
  - `window.MARKET_QUOTES_DATA` → cotações, séries e cobertura.
  - `window.ECONOMIC_CALENDAR_DATA` → eventos do dia (captura automática + regras).
  - `window.OPTIONS_GAMMA_SUMMARY_DATA` → resumo WDO/WIN (gamma/níveis).
  - `window.WEB_NEWS_MODULE_DATA` → módulo de notícias (classificado/impacto).
- Renderização: o `main.js` lê os objetos acima, compõe sinais cruzados e preenche os blocos do dashboard.

## Pipeline de Dados

- Market Quotes (cotações):
  - Origem: CSV exportado do Investing (watchlist/portfolio).
  - Ferramenta: `tools/market/build-market-history.ts` (CLI).
  - Saída: `dashboard/MERCADO/assets/data/market_quotes.json` e `.js` (idênticos; o `.js` injeta em `window.MARKET_QUOTES_DATA`).
  - Retenção/incremento: preserva séries anteriores até `retentionDays`, adicionando o ponto da execução atual.
- Addons (opcionais, independentes do CSV):
  - Opções & Gamma: lê o dashboard unificado local de WDO/WIN e gera `options_gamma_summary.json/js`.
  - Web News Module: coleta as principais fontes e classifica impacto/robustez; gera `web_news_module.json/js`.
- Calendário Econômico (automático):
  - Ferramenta: `tools/market/investing-sync.ts` (Playwright) captura do widget do Investing, cruza com matriz e grava `economic_calendar.json/js`.
  - Fallback: se a captura do dia vier vazia, preserva o último calendário não-vazio (`INVESTING_CALENDAR_KEEP_LAST_ON_EMPTY=true`).
- Export do Dashboard: PDF opcional gerado pelo `build-market-history.ts` (headless navegador) na pasta `dashboard/MERCADO/exports/`.

## Atualização e Serviço Local

- Serviço HTTP opcional: `tools/market/update-service.ts` expõe endpoints:
  - `/api/options/summary` (WDO/WIN), `/api/news/financialjuice`, `/api/news/web/module`, entre outros.
  - O `main.js` tenta usar esses endpoints se disponíveis; caso contrário, consome os arquivos locais `.json/.js`.
- Agendamento: lógica de “próxima execução” e janelas de atualização é definida em `update-service.ts` (ex.: variável `nextDueAt` e afins).

## Blocos do Dashboard — Cálculos, Dados e Leitura

### 🎯 Resumo Operacional (agora)
- Dados: Regime & Convicção + Web News Module + Macro (DXY, EM, export basket, yields).
- Cálculo: combina três vieses (regime, notícias, macro) em um viés final por WDO/WIN, com “gauge”, confiança e plano tático.
- Leitura: se os vieses conflitam, o bloco troca para o viés “macro” e reduz confiança. Use os níveis do bloco de Opções.

### 🧠 Regime & Convicção
- Dados: concordância entre grupos (FX, commodities, índices, volatilidade) e cobertura.
- Cálculo: score agregado de regime (risk‑on/off) e convicção (cobertura/consistência).
- Leitura: trate convicção baixa como “neutro”; valide com “Por quê” (drivers) e os blocos de curva/FX.

### 🇨🇳 China Proxy + 🇧🇷 Brasil Produtor
- Dados: ETFs/índices China (FXI/CSI/HSI/MCHI/ASHR/KWEB) + commodities (Minério/Soja/Petróleo/Cobre) + Brasil (EWZ/IBOV/BRL).
- Cálculo: confluências e divergências entre China/commodities e Brasil.
- Leitura: export basket forte com BRL/índice confirmando tende a favorecer Brasil; divergências pedem cautela.

### 🧲 Zona de Metais (Range do Índice)
- Dados: Minério (Dalian/Platts) e Cobre.
- Cálculo: (% Minério − % Cobre) ÷ 2 → % zona; projeta LOW/HIGH sobre o fechamento anterior do índice.
- Leitura: com metais divergindo, o índice tende a respeitar as pontas do range mais vezes do que esticar tendência.

### 🏦 Carry Trade (estado + evidências)
- Dados: diferencial BR vs US (proxy), DXY e pares-chave (AUD/JPY, USD/JPY).
- Cálculo: estado (building/unwinding/neutro) qualitativo, sem números explícitos (apenas evidências e rótulo).
- Leitura: carrego “entrando” normalmente favorece índice/FX pró‑risco; valide com curva e regime.

### 📉 Curva (Proxy) por Buckets
- Dados: DI (B3) quando disponível; yields globais como proxy quando DI não está cobrindo.
- Cálculo: separa curto/médio/longo e avalia nível/shape (steepen/flatten/estável).
- Leitura: curva abrindo + DXY firme costuma piorar emergentes; curva fechando + DXY mais fraco costuma aliviar.

### 🇧🇷 Renda Fixa Brasil & Fluxo
- Dados: ativos `category='rates'` relacionados ao Brasil e proxies (BRxYT=RR, BRNBxYT=RR, DAPc1..3, DI/DI1).
- Cálculo:
  - Unit: “yield” (bps sobre o último) para títulos/curvas; “price” para Tesouro Direto (preço/PU).
  - Bucketização: curto/médio/longo via ano do papel ou tenor explícito do símbolo (ex.: `BR10YT=RR` → 10 anos).
    - Regras: extrai o ano (2000–2100) do nome/símbolo; ou infere tenor via padrão `BR|US|BRNB(\d+)([Y|M])T=RR`.
  - Essenciais: BR 3M/1Y/2Y/5Y/10Y, IPCA+ (real), DAP 1–3; inclinação (10Y − 2Y).
- Leitura: yields subindo → saída/venda (negativo); yields caindo → entrada/compra (positivo). Use os “essenciais” como referência rápida.

### 🧨 Opções & Gamma (Resumo)
- Dados: dashboard local de WDO/WIN (spot, regime, gamma flip, walls, range, max pain).
- Cálculo: extrai níveis e compõe plano operacional com viés do Resumo (compra/venda/neutro).
- Leitura: trate “gamma flip” como inflexão; walls/range como áreas de magnetismo/stop; valide com tendência intraday.

### 🗞️ Notícias (FinancialJuice) e 🕸️ Web News Module
- Dados: headlines ao vivo e módulo classificado (impacto por WDO/WIN e confiança).
- Leitura: use notícias para explicar “Por quê”; não use como preço/nível. Ajuste confiança conforme robustez das fontes.

### 🗓️ Agenda & Matriz (SE–ENTÃO)
- Dados: itens manuais + captura automática do Investing; cruzamento com “matriz” por país/categoria.
- Cálculo:
  - Inclusão garantida (“must include”): Estoques de Petróleo Bruto (Crude Oil Inventories) sempre entra na lista.
  - Normalização: o texto do evento é normalizado (acento/encoding) antes da checagem para evitar perdas por diacríticos.
  - Filtros: país (BR/EUA/CHINA/HK/OUTRO), impacto (ALTO/MÉDIO/BAIXO/TODOS), ordenação por hora.
- Leitura: use as reações padrão (WDO/WIN) como heurística; ajuste com contexto (regime, gamma e web news).

### 📆 Calendário Econômico (Investing)
- Widget (iframe) opcional com lazy‑load; se bloqueado, use o link “Abrir Calendário do Investing”.
- A captura automática já transforma o widget em lista no módulo acima.

### 🧩 Setor Rotation (Heatmap)
- Dados: SPDRs setoriais (XLF/XLK/XLE/XLV/XLY/XLP/XLU/XLI/XLB/XLC/XLRE).
- Leitura: defensivos liderando → risk‑off; cíclicos liderando → risk‑on. Use como confirmação do regime.

### ⭐ Watchlist
- Dados: favoritos locais no navegador; gráfico por seleção e tabela agrupada.
- Leitura: foco operacional nos ativos marcados; clique para abrir a série.

### 🛡️ Sentinela de Fluxo (FX)
- Dados: blocos FX (Risco: NZD/AUD/CAD/RUB • Proteção: JPY/CHF/USD/SEK + DXY) + Petróleo.
- Cálculo: scores por bloco + sinal consolidado/termômetro; alertas locais opcionais.
- Leitura: use no pré‑mercado para orientar o viés inicial; confirme com índice/BRL e curva.

### Tabelas por Categoria, Panorama e Data Pack
- Tabelas: por classe (commodities/metais/FX/emergentes/etc.), com mini‑gráfico e filtros.
- Panorama: cards com Último/Var%/Hora e opção de “Congelar” snapshot.
- Data Pack: auditoria de presença/carimbo e itens críticos (DI, BRL, índices, calendário).

## Como Rodar e Atualizar

- Atualizar cotações a partir do CSV:
  - `npm run market:update` (usa o CSV padrão da pasta do projeto; parâmetros em `package.json`).
  - Ou: `npx -y tsx tools/market/build-market-history.ts --csv "SEU_ARQUIVO.csv" --interval 30 --retentionDays 10`.
- Gerar apenas addons (Gamma + Web News + PDF):
  - `npm run market:addons`
- Calendário automático (modo único ou daemon):
  - `npm run market:calendar` ou `npm run market:daemon` (ver modos em `tools/market/investing-sync.ts`).
- Serviço local (endpoints HTTP para o dashboard):
  - `npm run market:service`

## Interpretação — Diretrizes Práticas

- Comece pelo Regime & Convicção e confirme no “Por quê” (drivers).
- Conflitos: se Regime conflita com Notícias, use Macro (DXY/EM/export/yields) para resolver o viés.
- Curva: combine shape e DXY para calibrar risco (emergentes tendem a seguir esses dois).
- Gamma: níveis fazem diferença; trate flip/walls como áreas de reversão/congestão e ajuste stops.
- Agenda: priorize eventos de alto impacto e petróleo (sempre incluído), ajustando o plano conforme reação.

## Variáveis de Ambiente e Segurança

- Segredos (tokens/chaves) nunca devem aparecer no código; mantenha no `.env` local e não versionado.
- Documente variáveis necessárias em um `.env.example` sem valores reais (ex.: chaves de serviços de notícias).
- O dashboard funciona offline com os arquivos locais `.json/.js`; o serviço HTTP é opcional.

## Solução de Problemas

- Cards vazios:
  - Verifique `dashboard/MERCADO/assets/data/market_quotes.js` e cobertura (`meta.coverage`).
  - Rode `npm run market:update` e clique “↻ Dados” no dashboard.
- Agenda faltando “Estoques de Petróleo Bruto”:
  - Normalização aplicada no texto dos eventos → item passa a ser incluído mesmo com acento/encoding diferente.
- Widget do Investing bloqueado:
  - Abra o link em nova aba; a lista automática no módulo Agenda segue funcionando via captura/arquivo.

## Referências Rápidas (Caminhos)

- Dashboard estático: `dashboard/MERCADO/index.html`
- Scripts principais: `dashboard/MERCADO/assets/js/main.js` e `assets/js/charts.js`
- Pacote de dados: `dashboard/MERCADO/assets/data/*.json` e `*.js`
- Ferramentas de geração: `tools/market/build-market-history.ts`, `tools/market/investing-sync.ts`, `tools/market/update-service.ts`

