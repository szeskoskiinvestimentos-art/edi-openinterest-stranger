# ManualMaster — EDI Open Interest & Quant Analytics

Versão 1.0 • Data: 19/01/2026 • Plataforma: V1 Stranger Things / V3 Quant Lab

---

## Sumário
- Parte I — Estratégia Operacional e Playbook
- Parte II — Guia Didático (NTSL/ProfitChart) e Legendas
- Parte III — Modelo Técnico e Matemática dos Indicadores
- Parte IV — Dashboards (V1/V3): Leitura e Rotina Diária
- Parte V — Glossário do Market Maker
- Parte VI — Execução, Ambiente e Troubleshooting

---

## Parte I — Estratégia Operacional e Playbook

### 1. A Física do Mercado: Ímã vs. Repelente
Antes de olhar os números, entenda a força invisível que move o preço. O mercado vive em dois estados físicos opostos, definidos pelo **Sinal do Gamma**.

#### 🧲 Gamma Positivo: O Ímã (Estabilidade)
- **Onde ocorre:** Geralmente acima do Gamma Flip.
- **Ação do Dealer:** "Compra na Baixa, Vende na Alta" para se proteger.
- **Efeito no Preço:** O Dealer atua como um amortecedor. Se o preço cai, ele compra (freando a queda). Se sobe, ele vende (freando a alta).
- **Sensação:** O mercado parece "pesado", travado. Rompimentos falham. O preço tende a voltar para as Walls.
- **Estratégia:** Operar contra o movimento (Mean Reversion). Venda resistência, compre suporte.

#### 🚀 Gamma Negativo: O Repelente (Aceleração)
- **Onde ocorre:** Geralmente abaixo do Gamma Flip.
- **Ação do Dealer:** "Vende na Baixa, Compra na Alta" (Perseguição).
- **Efeito no Preço:** O Dealer joga gasolina no fogo. Se o preço cai, ele é obrigado a vender mais (acelerando a queda). Se sobe, ele precisa comprar correndo (Squeeze).
- **Sensação:** O mercado fica "liso". O preço foge dos níveis anteriores. Rompimentos são violentos e reais.
- **Estratégia:** Operar a favor do movimento (Trend Following). Nunca opere contra a tendência aqui.

---

### 2. Os 4 Quadrantes (Matriz de Decisão Completa)
Agora, cruzamos o "Clima" (Gamma) com a "Direção" (Delta) para saber exatamente o que fazer.

| Regime | Clima (Gamma) | Direção (Delta) | Ação do Dealer (Bastidores) | Sua Estratégia (Tela) |
| :--- | :--- | :--- | :--- | :--- |
| **1. O Tanque** | **(+) Positivo** (Ímã) | **(+) Positivo** (Bullish) | Vende na alta para travar. | **Buy the Dip.** Compre recuos, mas realize rápido nas resistências. Mercado sobe lento. |
| **2. O Piso** | **(+) Positivo** (Ímã) | **(-) Negativo** (Bearish) | Compra na baixa para travar. | **Sell the Rally.** Venda repiques, mas realize nos suportes. Mercado cai lento. |
| **3. O Foguete** | **(-) Negativo** (Repelente) | **(+) Positivo** (Bullish) | Compra na alta (Stop/Squeeze). | **Gamma Squeeze de Alta.** Compre o rompimento. Não venda topo! O preço vai esticar muito. |
| **4. A Cascata** | **(-) Negativo** (Repelente) | **(-) Negativo** (Bearish) | Vende na baixa (Stop/Crash). | **Crash de Baixa.** Venda a perda de suporte. Não compre fundo! É queda livre. |

---

### 3. Setups Operacionais (O Playbook)
Não improvise. Use um dos 4 setups validados:

#### SETUP A: A Muralha (Reversão Clássica)
- **Contexto:** Regime Gamma Positivo (Travado).
- **Gatilho:** Toque na **Call Wall (Azul)** ou **Put Wall (Vermelha)**.
- **Ação:** Reversão. Venda na Azul / Compra na Vermelha.
- **Alvo:** Retorno à média (Midwall ou Flip).

#### SETUP B: O Sniper (Effective Wall)
- **Contexto:** Rompimento falso do strike cheio (ex: 5500) mas defesa na média ponderada.
- **Gatilho:** Preço fura a Wall tradicional mas para na **Effective Wall (Ciano)**.
- **Ação:** Entrada na linha Ciano. É o ponto de "stop" dos amadores e "entrada" dos profissionais.
- **Stop:** Curto, logo atrás da Effective Wall.

#### SETUP C: A Virada de Mão (Flip Breakout)
- **Contexto:** Mudança de Regime (de Calmaria para Caos).
- **Gatilho:** Rompimento do **Gamma Flip (Fúcsia)** com Pullback (Reteste).
- **Ação:**
  - Cruzou pra baixo: Venda no reteste da Fúcsia (agora resistência).
  - Cruzou pra cima: Compra no reteste da Fúcsia (agora suporte).
- **Alvo:** Próxima Wall principal.

#### SETUP D: Fair Value Arbitrage (V3 Exclusivo)
- **Ferramenta:** Tabela de Simulação do Dashboard Web.
- **Lógica:** O sistema projeta: "Se o preço for até a Call Wall hoje, esta opção valoriza +150%".
- **Ação:** Se o gráfico mostra caminho livre (vazio de GEX), monte a posição visando a assimetria matemática calculada.

### 4. Regimes Especiais (Situações de Exceção)
Além da matriz padrão, existem momentos onde o Tempo e a Volatilidade dominam o Preço.

#### 🌪️ Vanna Flow (Pós-Evento)
- **Quando:** Logo após notícias bombásticas (Payroll, CPI, FOMC) onde a Volatilidade Implícita (IV) colapsa rapidamente.
- **Efeito:** A queda da IV obriga os Dealers a recomprar hedges, empurrando o mercado para cima mesmo sem notícias positivas.
- **Sinal:** Mercado sobe em linha reta enquanto o VIX cai.

#### ⚓ Pinning (O Buraco Negro)
- **Quando:** Dias de vencimento de opções (Opções sobre Ações na 3ª sexta, ou final de mês).
- **Efeito:** O preço fica preso magneticamente no Strike com maior Open Interest (geralmente Max Pain) para matar o prêmio das opções.
- **Ação:** Não opere tendência. O mercado vai e volta para o mesmo número o dia todo.

---

## Parte II — Guia Didático (NTSL/ProfitChart) e Legendas

### 1. Instalação e Atualização
1.  Gere o script diário: `python export_v1_data.py`
2.  Copie o conteúdo de [`ntsl_script.txt`](file:///c:/Users/ednil/Downloads/Gamma/Edi_OpenInterest%20-%20PY%20-%20Stranger/dashboard_v1/assets/data/ntsl_script.txt).
3.  No ProfitChart: Editor de Estratégias → Novo → Colar → Salvar como "Edi_NTSL".
4.  Inserir no Gráfico (Botão Direito → Inserir Indicador → Edi_NTSL).

### 2. Legenda Visual Definitiva
| Linha/Cor | Nome Técnico | Significado Operacional |
| :--- | :--- | :--- |
| **🔵 Azul Escuro** | Call Wall | **Teto de Aço.** Resistência máxima do dia. |
| **🔴 Vermelho Escuro** | Put Wall | **Chão de Concreto.** Suporte máximo do dia. |
| **💠 Ciano (Aqua)** | Edi Effective | **Centro de Gravidade.** Ajuste fino da Wall (Média Ponderada). |
| **🟣 Fúcsia (Tracejado)** | Gamma Flip | **Fronteira do Caos.** Divisor de regimes (+/-). |
| **🟡 Amarelo** | Delta Flip | **Defesa Direcional.** Dealers zeram delta aqui. |
| **🟣 Roxo Sólido** | Max Pain | **O Ímã.** Atrai o preço no vencimento/sexta-feira. |
| **⚪ Creme/Pontilhado** | Midwalls | **Quebra-molas.** Parciais e respiros do preço. |
| **🏳️ Branco (Pontilhado)** | Expected Move | **Exaustão.** Limite estatístico (1 desvio padrão). |

### 3. Toggles e Configurações NTSL (ProfitChart)
Nas propriedades do indicador no ProfitChart, você controla o que vê:

| Parâmetro | Função | Padrão |
| :--- | :--- | :--- |
| `ExibirWalls` | Mostra Call/Put Wall (Linhas Azul/Vermelha tracejadas). | `true` |
| `ExibirFlips` | Mostra Gamma Flip (Fúcsia) e Delta Flip (Amarelo). | `true` |
| `ExibirEffectiveWalls` | Mostra as Effective Walls (Ciano - Média Ponderada). | `true` |
| `ExibirMaxPain` | Mostra a linha do Max Pain (Roxo Sólido). | `true` |
| `ExibirRange` | Mostra máximas e mínimas projetadas (Verde/Vermelho pontilhado). | `true` |
| `ExibirExpMoves` | Mostra o cone de desvio padrão (Branco pontilhado). | `true` |
| `MostrarPLUS` | . | `true` |
| `MostrarPLUS2` |. | `true` |
| `ExibirMelhoresPontos` | Níveis de Borboleta baseados em Taxa Selic/Fed (Requer config). | `false` |
| `ModeloFlip` | Algoritmo do Flip (7 = HVL Gaussian, o padrão recomendado). | `7` |

---

## Parte III — Modelo Técnico e Matemática dos Indicadores

### 1. Pipeline de Dados e Módulos
- **Ingestão (`src/data_loader.py`):** Normaliza CSVs, detecta Spot, trata múltiplos vencimentos.
- **Motor (`src/calculator.py`):** Agrega OI, calcula GEX e aplica modelos de Flip.
- **Gregas (`src/greeks.py`):** Black-Scholes vetorial (numpy). Calcula Delta, Gamma, Vega, Vanna, Charm.
- **NTSL (`src/ntsl.py`):** Gera o código Pascal para o ProfitChart com lógica anti-colisão de textos.

### 2. Algoritmos Chave
- **Gamma Flip (HVL Gaussian):**
  - Suavização: `gaussian_filter1d(GEX, sigma=1.17)`
  - Flip: Raiz (zero-crossing) da soma acumulada (`cumsum`).
  - *Por que Gaussian?* Elimina ruído de strikes pequenos que causariam flips falsos.
- **Gamma Exposure (GEX):**
  - $GEX = Spot \times Gamma \times OI \times 100$
  - Mede o valor em dólares que o Dealer precisa ajustar por ponto de movimento.
- **Dealer Pressure Index (V3):**
  - Integra Delta e Gamma para estimar a pressão de compra/venda líquida em cada nível de preço.
  - Valores extremos indicam risco iminente de *Squeeze* ou Reversão.
- **R-Gamma (PVOP):**
  - Gamma ajustado pelo volume de agressão (Put-Call Volume Profile).
  - Filtra se o Gamma naquele nível é "Real" (tem fluxo) ou apenas posicionamento passivo.

---

## Parte IV — Dashboards (V1/V3): Leitura e Rotina Diária

### 1. Guia de Leitura dos Gráficos (V1 & V3)

#### 📊 Essenciais (Direcional)
- **Delta Acumulado:** A soma de todo o Delta do mercado.
  - *Como Ler:* Se a linha sobe, os Dealers estão ficando "Long" (precisam vender). Se desce, estão "Short" (precisam comprar).
- **Gamma Exposure (Net):** O combustível do movimento.
  - *Como Ler:* Barras grandes indicam onde a briga será feia. Barras pequenas são zonas de vácuo (preço corre rápido).

#### 🌪️ Estruturais (V3 Exclusivos)
- **Gamma Flip Cone:** Mostra onde o Flip estaria com diferentes volatilidades.
  - *Uso:* Se o cone está estreito, o Flip é confiável. Se abre muito, o Flip é instável.
- **Flow Sentiment:** O "humor" do fluxo de opções.
  - *Uso:* Divergência! Se o preço sobe mas o Flow cai, cuidado com a bull trap.
- **MM PnL Simulation:** Quanto o Market Maker está ganhando/perdendo.
  - *Uso:* Se o MM está perdendo muito (PnL negativo fundo), ele vai forçar o preço para o Max Pain.

#### ⚡ Gregas de 2ª Ordem (O "Zoom" do Mercado)
- **Vanna:** Efeito da Volatilidade no Delta. Importante em dias de FOMC/Payroll.
- **Charm:** Efeito do Tempo no Delta. Importante na abertura e fechamento (09:30 e 16:00).
- **Theta:** O decaimento do tempo. Mostra onde as opções estão "derretendo" mais rápido.

### 2. Checklist Profissional (Imprima e Cole)

#### 🕗 Pré-Market (08:30 - 08:55)
- [ ] Abrir Dashboard Web (V1 ou V3).
- [ ] Conferir data dos CSVs em `data_input/`.
- [ ] Anotar níveis chave: **Put Wall**, **Call Wall**, **Gamma Flip**.
- [ ] Definir **Cenário Base**: Range (Gamma +) ou Tendência (Gamma -)?

#### 🕘 Abertura (09:00 - 10:00)
- [ ] **Onde abriu?**
  - Acima do Flip: Viés comprador/travado.
  - Abaixo do Flip: Viés vendedor/acelerado.
- [ ] Não operar nos primeiros 5 min (spread alto).

#### 🕚 Intraday (Execução)
- [ ] Preço tocou na Wall? -> **Setup A**.
- [ ] Furou Wall mas parou na Effective? -> **Setup B**.
- [ ] Rompeu Flip com pullback? -> **Setup C**.
- [ ] Usar Midwalls para parciais (não alongar demais em range).

#### 🕔 Pós-Market
- [ ] As Walls seguraram? O Flip funcionou?
- [ ] Ajustar `IV_ANNUAL` em `config.py` se os níveis ficaram muito distantes da realidade.

---

## Parte V — Glossário do Market Maker (Termos de Guerra)

- **Spot:** Preço atual do ativo (Dólar/Índice).
- **Strike:** Preço de exercício da opção.
- **HVL Gaussian:** Modelo de Flip suavizado (padrão do sistema).
- **0DTE:** Opções que vencem hoje. Causam "Gamma Risk" explosivo no final do dia.
- **Pinning (Ancoragem):** Preço "gruda" em um strike (geralmente Max Pain ou Wall) para matar opções OTM. Comum às 16h-17h.
- **Gamma Squeeze:** Movimento vertical onde o Dealer é forçado a comprar na alta (alimentando a alta) por falta de hedge.
- **Vanna/Charm:** Efeitos de segunda ordem. Vanna move o mercado quando a Volatilidade cai (pós-evento). Charm move o mercado na abertura/fechamento (efeito tempo).

---

## Parte VI — Execução e Troubleshooting
- Execução:
  - V1: `python export_v1_data.py` → abrir V1 → copiar NTSL
  - V3: `python main.py` → abrir HTML/PDF
- Problemas Comuns:
  - "Nenhum CSV": ver `data_input/` e padrão de nomes
  - Flip distante: revisar `IV_ANNUAL`
  - NTSL divergente: garantir que copiou o último `ntsl_script.txt`
- Boas Práticas:
  - Manter `.env` para segredos; documentar em `.env.example`
  - Não commitar `.env` nem dados sensíveis

---

## Referências e Códigos
- Motor: [`calculator.py`](file:///c:/Users/ednil/Downloads/Gamma/Edi_OpenInterest%20-%20PY%20-%20Stranger/src/calculator.py)
- NTSL: [`ntsl.py`](file:///c:/Users/ednil/Downloads/Gamma/Edi_OpenInterest%20-%20PY%20-%20Stranger/src/ntsl.py)
- Exportador: [`export_v1_data.py`](file:///c:/Users/ednil/Downloads/Gamma/Edi_OpenInterest%20-%20PY%20-%20Stranger/export_v1_data.py)
- Frontend V1: [`charts.js`](file:///c:/Users/ednil/Downloads/Gamma/Edi_OpenInterest%20-%20PY%20-%20Stranger/dashboard_v1/assets/js/charts.js)

---

## Nota Final
Este ManualMaster consolida o conteúdo do Manual Integrado, dos manuais técnico/didático e dos dashboards V1/V3, com ênfase em praticidade e rigor matemático para orientar leitura e execução no ProfitChart.

