## Objetivo

Implementar uma nova página no `dashboard_unificado` com uma **Correlation Matrix (Top 20, janela ~1h)**, acessível por um **card na home** `dashboard_unificado/index.html`, rodando via **HTTP local** (recomendado) e alimentada pelos dados já coletados do sistema (principalmente `market_quotes.json` do MERCADO).

## Escopo (MVP)

- Nova rota/página estática: `/dashboard_unificado/correlation/index.html`
- Heatmap/matriz **20x20** de correlações (Pearson) usando retornos percentuais em janela aproximada de **1 hora**.
- Critério inicial para “Top 20”: ativos com maior `abs(changePct)` no último ponto disponível (com lista crítica sempre priorizada se estiver disponível).
- A página deve mostrar:
  - timestamp do `market_quotes.meta.generatedAt`
  - janela efetiva usada (ex.: últimos 12 pontos de 5min => ~1h)
  - cobertura (quantos ativos tinham série suficiente para cálculo)

## Fora do escopo (por agora)

- Implementar “Hub Supergraphics” completo com todos os 13+ popups do documento.
- Integrar nova fonte programática “TradingView sem delay” para alimentar a matriz (TradingView embed é ótimo para visual, mas não entrega série numérica fácil para correlação).
- Back-end novo ou banco de dados para persistir correlações.

## Referência do documento “ProjetoGrafico” (o que vamos aproveitar)

- O documento define um conceito de “Playbook” com:
  - Risk-On vs Risk-Off Gauge
  - Correlation Matrix em heatmap
  - Várias telas de correlação por tema (VIX vs DXY, commodity currencies etc.)
- Para este MVP, vamos começar pela **Correlation Matrix** (seu pedido atual) e deixar o “Hub” para a próxima etapa.

## Arquitetura (como encaixa no sistema atual)

### Onde a UI vive e como é publicada

- Fonte “canônica” do dashboard unificado: `Auto_B3_System/dashboard_unificado/...`
- Publicação no root do projeto: `dashboard_unificado/...` via `gerar_controle.py` (pipeline stage → validate → swap/fallback).
- A home `dashboard_unificado/index.html` é gerada automaticamente no publish.

### Como a nova página deve ser adicionada (sem ser sobrescrita)

- Criar a página em `Auto_B3_System/dashboard_unificado/correlation/index.html`
- Ajustar `gerar_controle.py` para publicar essa pasta adicional em `dashboard_unificado/correlation/`
- Ajustar a geração da home para incluir um card/link “Correlation Matrix” apontando para `correlation/index.html`

## Fonte de dados e contrato

### Fonte principal (MVP)

- `Cotacoes/dashboard/MERCADO/assets/data/market_quotes.json`
  - contém `meta.generatedAt`
  - contém `assets[]` e `series{}` com pontos por ativo

### Estratégia de seleção “Top 20”

1. Para cada ativo com série válida, pegar o último ponto (mais recente).
2. Extrair `changePct` (quando disponível) e ordenar por `abs(changePct)` desc.
3. Garantir presença dos críticos se disponíveis: `USD/BRL`, `WDO`, `WIN`, `IBOV` (não forçar se não existirem na série).
4. Completar até 20 ativos.

### Janela e cálculo

- Janela alvo: ~1h.
- Implementação prática (robusta): usar os **últimos N pontos** de cada série (N padrão = 12 se o intervalo for 5min) e calcular retornos `r[i] = price[i]/price[i-1] - 1`.
- Correlacionar retornos via Pearson:
  - `corr(a,b) = cov(a,b) / (std(a) * std(b))`

## UI/UX (Correlation Matrix)

- Layout consistente com o dashboard unificado (tema escuro).
- Matriz renderizada como tabela/grade:
  - diagonal = 1.00
  - célula com cor por coeficiente:
    - verde forte ~ +1
    - branco ~ 0
    - vermelho forte ~ -1
  - tooltip no hover com par e valor
- Controles (MVP):
  - botão “Atualizar” (recarrega JSON e recomputa)
  - indicação de “janela” e “Top N”

## Passo a passo de implementação

1) UI (novo diretório)
- Criar:
  - `Auto_B3_System/dashboard_unificado/correlation/index.html`
  - `Auto_B3_System/dashboard_unificado/correlation/assets/css/style.css`
  - `Auto_B3_System/dashboard_unificado/correlation/assets/js/main.js`

2) Loader de dados
- Em `main.js`, buscar `../../Cotacoes/dashboard/MERCADO/assets/data/market_quotes.json` (via fetch).
- Tratar erro e exibir mensagem de falha com detalhes.

3) Algoritmo de correlação
- Implementar:
  - seleção de top 20
  - normalização de séries (últimos N pontos)
  - cálculo de retornos e correlação
  - render do heatmap

4) Publish / integração no pipeline
- Em `gerar_controle.py`:
  - publicar `Auto_B3_System/dashboard_unificado/correlation/` para `dashboard_unificado/correlation/`
  - incluir card “Correlation Matrix” na home gerada
  - opcional: validar presença mínima (index.html + main.js + style.css)

5) Validação
- Rodar:
  - `py -3 -m py_compile gerar_controle.py`
  - `py -3 gerar_controle.py` (garante publish completo)
- Verificar arquivos finais:
  - `dashboard_unificado/correlation/index.html`
  - `dashboard_unificado/index.html` com link/card novo

6) Iniciar a aplicação (modo local)
- Subir servidor estático na raiz do projeto:
  - `py -3 -m http.server 8080`
- Acessar:
  - `http://localhost:8080/dashboard_unificado/`
  - `http://localhost:8080/dashboard_unificado/correlation/`

## Critérios de aceite

- Home do `dashboard_unificado` mostra card para “Correlation Matrix” e o link abre a nova página.
- A nova página renderiza uma matriz 20x20 com valores numéricos coerentes (intervalo [-1, 1]).
- Em caso de falha no fetch/parsing, a página mostra erro claro e não quebra o restante do dashboard.
- Re-execuções do pipeline (Serviço Unificado) não apagam a página nova (porque ela está no `Auto_B3_System` e no publish).

## Riscos e mitigação

- Dados “ETF sem delay” (TradingView): para correlação numérica, embed não resolve; mitigação é evoluir o `market:service` para coletar série numérica adicional (futuro).
- Heterogeneidade das séries (gaps): mitigação é usar “últimos N pontos” e cortar pelo menor tamanho disponível.
- CORS/file://: mitigação é o modo recomendado via HTTP local.

## Próximos incrementos (após MVP)

- “Supergraphics Hub” completo (cards + popups para as telas do documento).
- Abas na página de correlação (ex.: “Risk-On/Risk-Off Gauge”, “VIX vs DXY”, “Commodity FX Correlation”).
- Curadoria de universo Top N por “categoria” (FX, índices, commodities, rates) em vez de só abs(changePct).

