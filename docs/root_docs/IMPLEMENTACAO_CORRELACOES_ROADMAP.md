# Implementação — Correlation Matrix + Supergráficos (Roadmap por Fases)

Este documento organiza o plano do arquivo [PLANO_CORRELATION_MATRIX_DASHBOARD_UNIFICADO.md](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/PLANO_CORRELATION_MATRIX_DASHBOARD_UNIFICADO.md) e as referências visuais da pasta [Correlacoes/](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/Correlacoes/) em um roteiro de implementação incremental (anti-quebra), aproveitando o pipeline e os dados já existentes em `Cotacoes`.

## Objetivos

1) **Manter e evoluir** a matriz de correlação existente (20x20, ~1h) sem quebrar o dashboard.
2) Melhorar a **legibilidade**:
   - nomes amigáveis (catálogo do MERCADO)
   - tooltips com **nome do ativo + ajuda rápida de interpretação**
3) Adicionar, **abaixo da matriz**, uma lista/grade de **Supergráficos** (escopo separado da matriz):
   - cada Supergráfico abre uma página dedicada (idealmente em **popup window**) com um **grid de gráficos de linha** no estilo das capturas (TradingView), usando os dados já coletados.
4) Evoluir em fases: começar com **1 tema** (MVP) e depois replicar via configuração.

## Fontes e contratos atuais (já existentes)

### Dados

- Fonte primária: [market_quotes.json](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/Cotacoes/dashboard/MERCADO/assets/data/market_quotes.json)
  - `meta.generatedAt`, `meta.intervalMinutes`
  - `assets[]` com `symbol`, `name`, `category`, etc.
  - `series{[symbol]: [{t, price, changePct?}] }`
- Wrapper offline (para funcionar bem via file:// e via servidor): [market_quotes.js](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/Cotacoes/dashboard/MERCADO/assets/data/market_quotes.js)
  - `window.MARKET_QUOTES_DATA = {...}`

### Matriz de correlação (implementação atual)

- UI: [index.html](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/dashboard_unificado/correlation/index.html)
- Cálculo: [corr-math.js](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/dashboard_unificado/correlation/assets/js/corr-math.js)
- Render: [corr-ui.js](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/dashboard_unificado/correlation/assets/js/corr-ui.js)
- Orquestração (load→top20→render): [main.js](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/dashboard_unificado/correlation/assets/js/main.js)

### Pipeline de publish (fonte canônica)

O publish do `dashboard_unificado` é gerado por cópia da fonte canônica:
- `Auto_B3_System/dashboard_unificado` (preferencial) **ou** `B3_System/dashboard_unificado` (fallback) → `dashboard_unificado` via [gerar_controle.py](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/Cotacoes/tools/market/gerar_controle.py#L687-L942)

Importante: o script também tenta **preservar “extras”** do publish anterior (o que explica por que `dashboard_unificado/correlation` pode sobreviver mesmo não estando na fonte canônica). Para reduzir risco de divergência silenciosa, a fase 0 move o que for “produto” para a fonte canônica.

## Referências visuais (prints)

Usar como referência de layout/UX (grid e “super chart”), sem tentar clonar indicadores do TradingView na fase 1:
- [Captura de tela 2026-05-21 134818.png](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/Correlacoes/Captura%20de%20tela%202026-05-21%20134818.png) (hub “Supergraphics” com cards)
- [Captura de tela 2026-05-21 134823.png](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/Correlacoes/Captura%20de%20tela%202026-05-21%20134823.png) (hub “Supergraphics” com cards — close-up)
- [Captura de tela 2026-05-21 134828.png](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/Correlacoes/Captura%20de%20tela%202026-05-21%20134828.png) (hub “Supergraphics” com card “Playbook”)
- [Captura de tela 2026-05-21 134803.png](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/Correlacoes/Captura%20de%20tela%202026-05-21%20134803.png) (grid multi-charts equities)
- [Captura de tela 2026-05-21 134939.png](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/Correlacoes/Captura%20de%20tela%202026-05-21%20134939.png) (grid FX + “currency strength”)
- [Captura de tela 2026-05-21 134909.png](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/Correlacoes/Captura%20de%20tela%202026-05-21%20134909.png) (mosaico “B3 Overview”)
- [Captura de tela 2026-05-21 135023.png](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/Correlacoes/Captura%20de%20tela%202026-05-21%20135023.png) (mosaico “Gold / Commodities / Strength”)
- [Captura de tela 2026-05-21 135059.png](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/Correlacoes/Captura%20de%20tela%202026-05-21%20135059.png) (mosaico “HK / Global Overview”)
- [Captura de tela 2026-05-21 135127.png](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/Correlacoes/Captura%20de%20tela%202026-05-21%20135127.png) (overview com colunas e blocos)
- [Captura de tela 2026-05-21 135155.png](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/Correlacoes/Captura%20de%20tela%202026-05-21%20135155.png) (mosaico “Nasdaq / S&P500”)
- [Captura de tela 2026-05-21 135214.png](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/Correlacoes/Captura%20de%20tela%202026-05-21%20135214.png) (“super chart” com múltiplas linhas)

## Templates 1:1 (v1) — cópia visual dos prints

Nesta etapa, o objetivo é ter **todos os templates** (telas/grades) com layout e “vibe” muito próximos do que está na pasta `Correlacoes/` (tipografia, espaçamentos, grid, barras laterais, cards), mesmo que os gráficos inicialmente sejam apenas “linha/candles” simples e sem os mesmos indicadores do TradingView.

Regras para esta fase:
- Prioridade é **layout idêntico** (grid, proporções, painéis), não “indicadores idênticos”.
- Os templates devem ser **configuráveis** (via JSON) para, depois, trocarmos símbolo/conteúdo sem reescrever HTML.
- A entrega é incremental: primeiro “casca/estrutura” + placeholders; depois ligar dados e evoluir cada layout.

### Catálogo de templates (mapeamento)

1) Hub “Supergraphics” (cards)
- Referência: 134818 / 134823 / 134828
- Objetivo: página com grid de cards (2 linhas, 4 colunas) + card extra (“Playbook”).
- Rota sugerida: `/dashboard_unificado/correlation/supergraphics/index.html`
- Função: lista de entradas (American Stocks, B3 Futures, B3 Overview, Currencies, Gold, Hang Seng Index, Market Overview, Nasdaq/S&P500, Playbook).

2) Superchart (multi-linhas, normalizado)
- Referência: 135214
- Objetivo: um chart grande com várias linhas (comparação).
- Rota sugerida: `/dashboard_unificado/correlation/supergraphics/superchart/index.html`

3) Equities grid (EUA / mega caps)
- Referência: 134803
- Objetivo: grid 2x4 de charts (layout “tiles”), com labels por ativo.
- Rota sugerida: `/dashboard_unificado/correlation/supergraphics/american-stocks/index.html`

4) FX grid + painel “currency strength”
- Referência: 134939
- Objetivo: grid de FX (tiles) + painel comparativo/strength no canto inferior direito.
- Rota sugerida: `/dashboard_unificado/correlation/supergraphics/currencies/index.html`

5) B3 Overview (mosaico)
- Referência: 134909
- Objetivo: mosaico com coluna esquerda (mini-paineis/linhas) + área central + coluna direita (stack de charts).
- Rota sugerida: `/dashboard_unificado/correlation/supergraphics/b3-overview/index.html`

6) Gold / Commodities / Strength (mosaico)
- Referência: 135023
- Objetivo: mosaico com blocos de ouro + comparativos/strength.
- Rota sugerida: `/dashboard_unificado/correlation/supergraphics/gold/index.html`

7) HK / Global Overview (mosaico)
- Referência: 135059
- Objetivo: mosaico com sidebar esquerda (sectors) + colunas centrais (países/índices) + coluna direita (strength + correlações).
- Rota sugerida: `/dashboard_unificado/correlation/supergraphics/hk-global/index.html`

8) Nasdaq / S&P500 (mosaico)
- Referência: 135155
- Objetivo: mosaico com SPX/NQ + VIX + superchart “mega caps” + DXY.
- Rota sugerida: `/dashboard_unificado/correlation/supergraphics/nasdaq-sp500/index.html`

9) Market Overview (overview com colunas e blocos)
- Referência: 135127
- Objetivo: página “painel principal” com múltiplos blocos e colunas (overview amplo).
- Rota sugerida: `/dashboard_unificado/correlation/supergraphics/market-overview/index.html`

10) Playbook
- Referência: card “Playbook” no hub (134828) + conceito do documento original.
- Objetivo: inicialmente uma página template com grid e placeholders, para depois receber os blocos do playbook (risk-on/off, correlações temáticas, etc.).
- Rota sugerida: `/dashboard_unificado/correlation/supergraphics/playbook/index.html`

## Princípios de implementação (anti-quebra)

- Single Source of Truth: UI “de produto” deve ficar na fonte canônica (`Auto_B3_System/dashboard_unificado/...` quando existir; fallback em `B3_System/dashboard_unificado/...`).
- Modularização:
  - **helpers “puros”** (cálculo/normalização) em arquivos separados, expostos via `window.*Helpers`.
  - arquivo `main.js` vira orquestrador (load + wiring + render) e deve falhar de forma “soft”.
- Fail-soft por módulo: erro em supergráfico não derruba a matriz; erro na matriz não derruba navegação.
- Paths sempre relativos; rodar via HTTP local (recomendado).
- Cache-busting nos scripts (padrão do sistema): `?v=${timestamp}`.

## Roadmap por fases

### Fase 0 — Consolidar “fonte canônica” e reduzir risco de overwrite

**Meta:** garantir que o que existe em `dashboard_unificado/correlation` não dependa de “preservação de extras”.

1) Criar `Auto_B3_System/dashboard_unificado/correlation/` com:
   - `index.html`
   - `assets/css/style.css`
   - `assets/js/{corr-math.js,corr-ui.js,main.js}` (ou manter nomes atuais)
2) Validar que o publish está copiando essa pasta:
   - executar o publish local e confirmar que `dashboard_unificado/correlation/` veio da fonte canônica.
3) Se necessário, endurecer validação em `gerar_controle.py`:
   - tratar `correlation/index.html` como “opcional recomendado” no começo, e só tornar “obrigatório” quando estiver estável.

**Critério de aceite:** rodar publish e a página de correlação continuar funcional, sem depender de “extras preserved”.

### Fase 1 — Evoluir a Matriz (manter a existente e melhorar legibilidade)

**Meta:** manter algoritmo e visual base, mas elevar UX e “nomenclatura humana”.

1) Resolver “nome amigável” via catálogo do MERCADO:
   - ao carregar `market_quotes`, montar `symbol→{name, category, exchange, tags}` a partir de `data.assets`.
   - manter `symbol` como label compacto, mas usar `name` no tooltip.
2) Tooltip por célula (ajuda de leitura):
   - mostrar: `Símbolo A — Nome A` vs `Símbolo B — Nome B`
   - valor da correlação + texto curto:
     - `+1`: andam juntos; `0`: pouco relacionamento; `-1`: se movem em sentidos opostos.
   - indicar janela efetiva (ex.: `~1h (12 pontos de 5min)`) e cobertura.
3) Tooltip por header (linha/coluna):
   - ao passar o mouse no ticker (header), mostrar `Nome + Categoria + Exchange`.
4) Ajustar o Top 20:
   - manter lógica atual por `abs(changePct)` e “críticos” (USD/BRL, WDO, WIN, IBOV).
   - adicionar metadados para exibir na UI: `lastChangePct`, `categoria`, `nome`, `pontos` (quantidade na série).
5) Testes manuais (comportamento):
   - sem `market_quotes.json` (simular falha de fetch), a UI deve mostrar erro claro e continuar navegável.
   - com dados incompletos (ativos sem N pontos), a cobertura deve refletir corte.

**Saída recomendada de modularização (sem alterar o algoritmo):**
- `corr-catalog.js` (novo): construir `symbolMetaMap` (apenas leitura de `data.assets`) e expor `window.CorrCatalog`.
- manter `corr-math.js` como “puro”.
- `corr-ui.js` recebe `symbolMetaMap` para tooltips.

**Critério de aceite:** matriz 20x20 funcionando como hoje, mas com tooltip rico e nomes amigáveis.

### Fase 2 — Infra de Supergráficos (estrutura, navegação e config)

**Meta:** criar “plataforma” de supergráficos e publicar **todos os templates 1:1** (casca visual) já na primeira entrega.

Decisões já alinhadas:
- Supergráficos são um **escopo à parte**: **não** abrem ao clicar numa célula da matriz.
- Eles ficam **abaixo da matriz** como lista/grade de cards.
- Ao clicar (ex.: “B3”), abre uma página dedicada com **grid** similar aos prints.
- Janela padrão: **~1h** (12×5m).

1) Definir contrato de “temas” (config):
   - arquivo recomendado: `correlation/assets/data/supergraphs.json`
   - estrutura sugerida:
     - `themes[]`: `{ id, title, subtitle, layout, charts[] }`
     - `layout`: `{ cols, rows, gap }`
     - `charts[]`: `{ title, symbols[], mode }`
       - `mode` inicial: `normalized_price` (linha normalizada) ou `returns` (retornos acumulados)
2) Adicionar seção “Supergráficos” abaixo da matriz:
   - `renderSupergraphsList(themes)` cria cards com “Abrir”
   - `window.open('supergraphs/?theme=B3', 'ediSupergraph', features...)`
3) Criar nova rota/página dedicada:
   - `/dashboard_unificado/correlation/supergraphs/index.html`
   - carrega:
     - `supergraphs-helpers.js` (normalização, merge temporal, escala)
     - `supergraphs-ui.js` (grid, headers, resizing)
     - `supergraphs-main.js` (load config + load data + render)
4) Padronizar carregamento de dados (reuso):
   - usar o mesmo “dual loader”:
     - se existir `window.MARKET_QUOTES_DATA` usa isso;
     - senão faz `fetch(market_quotes.json, cache: 'no-store')`.
5) Charting:
   - preferir o que já existe no stack do dashboard (Chart.js com fallback) para minimizar risco.
   - o MVP pode renderizar **linha simples** por símbolo (sem indicadores complexos).

6) Criar todas as páginas “template” (casca visual):
   - publicar rotas para cada template do bloco “Templates 1:1 (v1)”
   - cada rota deve carregar o mesmo runtime (loader + config) e apenas mudar o `templateId`/`themeId`

**Critério de aceite:** cards de supergráficos aparecem e abrem página dedicada; página renderiza um grid vazio “com estrutura”, mesmo antes de todos os temas estarem preenchidos.

### Fase 3 — MVP de 1 Tema (recomendado: “B3”)

**Meta:** fechar o ciclo completo “config→dados→render grid→popup”, com 1 tema inicial.

1) Escolher o primeiro tema:
   - recomendado: **B3** (porque já existe alta cobertura via `market_quotes` e é o exemplo citado).
2) Definir layout inspirado nos prints:
   - grid com 6–10 charts (dependendo de densidade dos símbolos).
   - cada chart com 2 a 6 séries (para não virar “espaguete”).
3) Escolher modo do MVP:
   - `normalized_price`:
     - para cada símbolo: normalizar preço para base 100 no início da janela
     - plota série temporal comparável (estilo “compare” do TradingView)
4) Interação mínima:
   - tooltip por linha mostrando `Símbolo — Nome` + último valor normalizado.
   - legenda compacta lateral (evitar ocupar topo de cada chart).
5) Degradação:
   - se 1 símbolo não tem série suficiente, o chart ainda renderiza com os demais; se nenhum, mostra placeholder.

**Critério de aceite:** tema B3 abre em popup e renderiza grid de linhas com base ~1h, usando nomes amigáveis.

### Fase 4 — Evoluções (após MVP)

1) Rolling correlation (supergráfico “de correlação”, não só preço):
   - `mode = rolling_corr` com:
     - `baseSymbol`
     - `compareSymbols[]`
     - `windowPoints` (ex.: 12 para ~1h)
   - plota linha de correlação ao longo do tempo para cada par `(base, compare)`.
2) Hub/overview (similar a “overview plataforma” dos prints):
   - página “hub” com colunas por tema e mini-cards; cada mini-card abre supergráfico específico.
3) Curadoria por categoria:
   - usar `assets[].category` para sugerir temas e validar cobertura.
4) Qualidade do universo:
   - detectar gaps e informar “qualidade de série” no topo do supergráfico.

## Checklist operacional (por fase)

### Checklist de publish

1) Implementar na fonte canônica: `Auto_B3_System/dashboard_unificado/...`
2) Rodar publish e validar artefatos:
   - `dashboard_unificado/correlation/index.html`
   - `dashboard_unificado/correlation/supergraphs/index.html` (quando existir)
3) Subir servidor local:
   - `py -3 -m http.server 8080`
4) Validar URLs:
   - `http://localhost:8080/dashboard_unificado/correlation/`
   - `http://localhost:8080/dashboard_unificado/correlation/supergraphs/?theme=B3` (quando existir)

### Checklist de UX (matriz)

- Tooltip por célula inclui: nomes, valor, interpretação curta.
- Headers mostram nome/categoria no hover.
- Cobertura e janela efetiva visíveis.
- Erro de dados não quebra a página (fail-soft).

## Riscos e mitigação

- **Divergência de fonte** (Auto_B3_System vs dashboard_unificado): mitigação é Fase 0.
- **Cobertura desigual por ativo** (gaps / séries curtas): mitigação é cortar pelos últimos N pontos e mostrar cobertura.
- **Performance em grids grandes**: mitigação é paginar temas e limitar séries por chart.

## Próximo passo sugerido (para você implementar em sequência)

1) Fazer/confirmar a Fase 0 (garantir `correlation/` na fonte canônica: `Auto_B3_System/dashboard_unificado/` ou `B3_System/dashboard_unificado/`) e confirmar publish.
2) Fase 1 (catálogo + tooltips “humanos”).
3) Fase 2 (estrutura de supergráficos + config + rota).
4) Fase 3 (tema B3) e só depois replicar temas.

---

## Registro de desenvolvimento (controle)

### 2026-05-25 — Bootstrap inicial (Fases 0/1/2)

- Criada/Consolidada fonte canônica da correlação em [B3_System/dashboard_unificado/correlation/](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/B3_System/dashboard_unificado/correlation/), eliminando dependência do mecanismo “extras preserved” no publish.
- Publish ajustado para aceitar fonte canônica em `Auto_B3_System` (preferencial) **ou** `B3_System` (fallback) via `gerar_controle.py`.
- Atualizada a matriz para usar catálogo do MERCADO via `data.assets`:
  - novo helper: [corr-catalog.js](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/B3_System/dashboard_unificado/correlation/assets/js/corr-catalog.js)
  - tooltips ricos em célula e headers com `símbolo + nome/categoria/exchange` e hint de interpretação do coeficiente.
- Adicionada seção “Supergráficos” abaixo da matriz (lista de cards com popup):
  - renderer: [supergraphics-cards.js](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/B3_System/dashboard_unificado/correlation/assets/js/supergraphics-cards.js)
  - layout base de cards inspirado no hub dos prints.
- Publicados templates 1:1 (casca visual) em `/correlation/supergraphics/`:
  - hub: [supergraphics/index.html](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/B3_System/dashboard_unificado/correlation/supergraphics/index.html)
  - templates: `american-stocks`, `b3-futures`, `b3-overview`, `currencies`, `gold`, `hk-global`, `market-overview`, `nasdaq-sp500`, `playbook`, `superchart`
  - CSS/JS compartilhados: [supergraphics.css](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/B3_System/dashboard_unificado/correlation/assets/css/supergraphics.css), [supergraphics-hub.js](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/B3_System/dashboard_unificado/correlation/assets/js/supergraphics-hub.js), [supergraphics-template.js](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/B3_System/dashboard_unificado/correlation/assets/js/supergraphics-template.js)
- Ajuste visual dos templates “mosaico” (aproximação do layout dos prints):
  - `b3-overview`, `hk-global` e `nasdaq-sp500` agora renderizam com colunas (stack + mid grid) em vez de tiles uniformes.
  - CSS atualizado para layouts: [supergraphics.css](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/Auto_B3_System/dashboard_unificado/correlation/assets/css/supergraphics.css)
- Publish executado e validado após ajustes:
  - `py -3 Cotacoes/tools/market/gerar_controle.py` (ok)
  - Validação em HTTP local:
    - `/dashboard_unificado/correlation/`
    - `/dashboard_unificado/correlation/supergraphics/`
    - `/dashboard_unificado/correlation/supergraphics/b3-overview/`
- Configuração centralizada (single source) para cards/hub:
  - [supergraphics_config.js](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/B3_System/dashboard_unificado/correlation/assets/data/supergraphics_config.js) define a lista de templates (id/título/descrição/rota).
  - Cards da matriz e o hub passam a renderizar a partir desse config (elimina duplicação).
- Configuração centralizada (single source) para layouts dos templates:
  - [supergraphics_templates.json](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/B3_System/dashboard_unificado/correlation/assets/data/supergraphics_templates.json) define layout/tiles por template (grid simples e mosaico).
  - Loader resiliente em [supergraphics-template.js](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/B3_System/dashboard_unificado/correlation/assets/js/supergraphics-template.js) tenta múltiplos caminhos e faz fallback seguro.
- Renderização inicial de “linhas” (sparkline) sem dependências externas (Canvas 2D), usando `market_quotes`:
  - renderer: [supergraphics-render.js](file:///c:/Users/ednil/Downloads/Gamma/Edi_Sistema_Unificado/B3_System/dashboard_unificado/correlation/assets/js/supergraphics-render.js)
  - `supergraphics-template.js` agora:
    - injeta o renderer sob demanda
    - tenta carregar `market_quotes.js` (offline) e, se necessário, faz fetch do `market_quotes.json` (HTTP local)
    - desenha linhas normalizadas (base 100) por tile quando encontra série compatível.
  - Templates adicionais (dedicados a supercharts multi-linhas):
    - `/correlation/supergraphics/currency-strength/`
    - `/correlation/supergraphics/superchart-mega-caps/`
- UX dos tiles evoluída:
  - tiles sem série suficiente recebem estado visual de “missing” (outline discreto) para facilitar diagnóstico.
  - templates multi-linhas exibem legenda inferior com cor por série + último valor normalizado.
- Dados (sem simulação):
  - removido fallback de tiles “fictícios” quando um template não existe; páginas mostram aviso “Template não configurado” e continuam usando exclusivamente `market_quotes` (dados reais do sistema de cotações).
- Navegação interna dos templates:
  - tiles podem ter `open` no config e ficam clicáveis (ex.: “Currency Strength” abre o template dedicado; “Mega Caps” abre o superchart dedicado).
  - `currencies` ganhou tile multi-linhas (symbols[]) direto no grid, mantendo link para a página dedicada.
- Compatibilização com o universo real do `market_quotes`:
  - aliases adicionados no resolver (ex.: `DXY→USDX`, `QQQ→QQQ.O`, `DOL→WDOc1`, `IND→WINc1`, `IBOV→.BVSP`).
  - aliases adicionais para cobertura real: `TLT→TLT.O`, `SHY→SHY.O`, `VALE→VALE.K`.
- Rolling correlation (pós-v1, opcional):
  - template dedicado `rolling-corr` calcula correlação móvel em retornos (Pearson) na janela ~1h, usando somente dados reais do `market_quotes`.
  - `american-stocks` e `superchart-mega-caps` passaram a usar proxies com ETFs (SPY/QQQ/DIA/IWM + setores) para garantir cobertura com dados existentes.
- Meta informativa nos templates:
  - topbar agora exibe `generatedAt` + janela/intervalo (diagnóstico rápido de atualização).
- Diagnóstico de cobertura (dados reais):
  - topbar dos templates exibe `cobertura=ok/total • missing=... • séries=...` calculado a partir do render (sem simulação), facilitando validar rapidamente se o `market_quotes` cobre o template.
- Cobertura nos cards (hub + seção da matriz):
  - cards agora exibem badge `ok/total` por template, calculado a partir do `supergraphics_templates.json` + `market_quotes` (sem desenhar gráfico e sem dados simulados).
  - cards são ordenados automaticamente por pior cobertura primeiro (facilita atacar gaps de símbolo/alias).
- Consolidação final da fonte canônica:
  - a pasta `correlation/` (incluindo todos os templates dedicados) foi copiada para `Auto_B3_System/dashboard_unificado/correlation/` para o publish não depender de “extras preserved”.
- Ajuste de conteúdo com dados reais:
  - templates com baixa cobertura (“Gold”, “Market Overview”, “Playbook”, blocos conceituais do “B3 Overview”) foram mapeados para símbolos reais do `market_quotes` via `symbols[]` e/ou troca de `title`.
- Multi-linhas em mosaicos (mosaic3col):
  - tiles agora podem declarar `symbols[]` no config e renderizam multi-linhas mesmo dentro de layouts em colunas (não apenas no grid simples).
  - `nasdaq-sp500` ganhou “Sector Rotation” multi-linhas (XL*) com link para página dedicada.
  - novo template dedicado: `/correlation/supergraphics/superchart-sectors/`
- Padronização de cache-buster:
  - páginas de templates e hub atualizadas para `?v=20260525_10` (evita “stale cache” durante evolução rápida).
- Escalas por tile (botão direito):
  - menu de contexto no botão direito do mouse permite alternar entre: Normalizada (base 100), Variação (%), e Preço (valor).
  - preferência persiste por tile/template via `localStorage` e re-renderiza sem recarregar a página.
- Escalas (atalhos operacionais):
  - no menu de contexto: “Aplicar a todos (neste template)” define a escala padrão do template e remove overrides por tile.
  - no menu de contexto: “Limpar preferências (neste template)” volta tudo para Normalizada base 100.
- Hover “crosshair” + tooltip:
  - ao mover o mouse sobre o tile, exibe crosshair vertical e tooltip com valores do ponto mais próximo (até 8 séries) e horário.
  - mantém implementação leve (Canvas 2D) e não depende de libs externas.
- Régua e último valor no gráfico:
  - cada tile desenha uma régua simples no lado direito (mín/médio/máx) na escala atual (norm/%/preço).
  - cada série exibe um “last label” no lado direito com o último valor na escala selecionada.
  - para tiles de série única em escala Normalizada/Preço, o “last label” também exibe a variação % do último candle (vs ponto anterior).

### Pendências imediatas (próxima passada)

- ✅ Publish e validação (v1):
  - `py -3 Cotacoes/tools/market/gerar_controle.py` (ok)
  - `http://localhost:8080/dashboard_unificado/correlation/index.html`
  - `http://localhost:8080/dashboard_unificado/correlation/supergraphics/index.html`
- ✅ Navegação unificada:
  - `shared/unified-nav.js` criado na fonte canônica e publicado, removendo 404/abort nas telas com seletor de dashboard.
- Futuras evoluções (pós-v1, opcionais):
  - rolling correlation e supercharts avançados (Fase 4).
  - refino de auto-scale em multi-linhas (por série vs conjunto).
  - curadoria contínua do universo de símbolos (melhorar `ok/total` por template conforme feed real).
