# MANUAL DIDÁTICO — DASHBOARD UNIFICADO WDO / WIN

Versão 1.0 • Data: 19/02/2026  
Plataforma: Dashboard V1 Stranger Things (WDO/WIN) + Dashboard Unificado Web

---

## SUMÁRIO

- [1. Propósito do Sistema](#1-propósito-do-sistema)
- [2. Arquitetura Geral WDO x WIN](#2-arquitetura-geral-wdo-x-win)
- [3. Visão Geral do Mercado (Cards Superiores)](#3-visão-geral-do-mercado-cards-superiores)
- [4. Simulação de Valor Justo (Fair Value)](#4-simulação-de-valor-justo-fair-value)
- [5. Delta Acumulado](#5-delta-acumulado)
- [6. Gamma Exposure (GEX)](#6-gamma-exposure-gex)
- [7. Volatilidade Implícita & Skew](#7-volatilidade-implícita--skew)
- [8. Níveis Chave de Mercado](#8-níveis-chave-de-mercado)
- [9. Gregas de 2ª Ordem e Blocos Avançados](#9-gregas-de-2ª-ordem-e-blocos-avançados)
- [10. Pin Risk e Tabela Detalhada](#10-pin-risk-e-tabela-detalhada)
- [11. Diferenças Práticas WDO x WIN na Operação](#11-diferenças-práticas-wdo-x-win-na-operação)
- [12. Fluxo Operacional Recomendado](#12-fluxo-operacional-recomendado)
- [13. Manual do Modelo Unificado (dashboard_unificado)](#13-manual-do-modelo-unificado-dashboard_unificado)
- [14. Conclusão](#14-conclusão)
- [15. Módulos Exclusivos do Dashboard V3 (não presentes no V1)](#15-módulos-exclusivos-do-dashboard-v3-não-presentes-no-v1)

---

## 1. PROPÓSITO DO SISTEMA

O **Dashboard EDI Market Guardin V1** foi desenhado para ser a “sala de controle” do trader de **Dólar Futuro (WDO)** e **Índice Futuro (WIN)**.  
Ele cumpre três funções principais:

- **Leitura estrutural do mercado de opções** (Open Interest, Gamma, Delta, Gregas de 2ª ordem);
- **Identificação de níveis chave de preço** (Gamma Flip, Call Wall, Put Wall, Effective Walls, Max Pain);
- **Suporte à tomada de decisão operacional**, em conjunto com o script NTSL no ProfitChart.

Este manual foca em:

- Explicar **o que cada bloco do dashboard significa na teoria**;
- Detalhar **como interpretar na prática**;
- Mostrar **como operacionalizar** as informações em WDO e WIN.

---

## 2. ARQUITETURA GERAL WDO x WIN

Embora os dashboards de WDO e WIN pareçam visualmente idênticos, existem diferenças importantes na **origem dos dados** e na **escala das métricas**.

### 2.1 WDO — Dólar Futuro

- Trabalha diretamente com o **contrato de dólar futuro** como subjacente.
- No `config.py`, você ajusta diariamente:
  - `SPOT` — último preço do WDO;
  - `IV_ANNUAL` — volatilidade implícita anual (decimal);
  - `HVL_ANNUAL` — volatilidade histórica anual;
  - `SIGMA_FACTOR` — fator de estresse das simulações;
  - Taxas macro (`TAXA_SELIC`, `TAXA_FED`) e `CONTRACT_MULT`.
- O WDO é mais sensível a notícias macro (juros, dólar global) e tende a ter **movimentos em pontos absolutos menores**, porém com impacto direto em contratos cambiais.

### 2.2 WIN — Índice Futuro (via EWZ)

- Usa como base o **EWZ (ETF de Brasil em NY)** para calibrar o índice:
  - `SCALING_EWZ_REF_CLOSE` e `SCALING_INDEX_REF_CLOSE` fazem a ponte EWZ → Índice;
  - `SPOT` usa o preço do EWZ;
  - `EWZ_ATM_IV_PCT`, `EWZ_HV_PCT`, `EWZ_IV_RANK_PCT` alimentam a área de contexto;
  - `EXPOSURE_INDEX_SCALE_ENABLED` controla a escala das exposições.
- O WIN reflete mais diretamente **fluxo de ações e risco Brasil**; costuma ter **gap maior** em eventos locais (política, corporativo).

### 2.3 O que isso muda para o trader

- A **lógica de leitura** (Gamma, Walls, Flips, Max Pain) é a mesma para WDO e WIN.
- O que muda é:
  - **Escala** dos preços e das exposições;
  - **Velocidade** e **estilo de movimento** (dólar pode “pular” em notícias externas; índice tende a reagir a fluxo de ações);
  - **Sensibilidade à volatilidade implícita** (no WIN, a IV vem do EWZ).

Na prática, você pode usar **o mesmo playbook** para ambos, mas sempre atento à natureza do ativo.

---

## 3. VISÃO GERAL DO MERCADO (CARDS SUPERIORES)

Seção: **VISÃO GERAL DO MERCADO**  
Elementos principais (cards grandes no topo):

1. **Total de Negócios (Total Trades)**  
2. **Open Interest Total (Volume Total)**  
3. **Gamma Exposure (GEX) Total**  
4. **Delta Position (Delta Líquido)**  

### 3.1 Total de Negócios

- **Teoria:** Quantidade de negociações registradas nas opções daquele vencimento.
- **Leitura:**
  - Número maior → maior atividade, mais liquidez e mais relevância dos níveis calculados.
  - Número baixo → estruturas podem ser menos “firmes” (walls mais fáceis de romper).
- **Operacional:**
  - Em dias de **baixo total de negócios**, reduza a confiança em walls muito estreitas.
  - Em dias de **alto total de negócios**, considere que o “mapa de liquidez” está mais robusto.

### 3.2 Open Interest Total

- **Teoria:** Quantidade total de contratos em aberto (não liquidados).
- **Leitura:**
  - Quanto maior o OI, maior a importância de walls e níveis de Gamma.
  - Em vencimentos distantes, o OI pode estar mais espalhado; perto do vencimento, concentra em poucos strikes.
- **Operacional:**
  - Use o OI Total como **“peso” do dia**:  
    - OI muito baixo → dia menos técnico, mais sujeito a ruído.  
    - OI alto → movimentos respeitam melhor Call/Put Wall e Max Pain.

### 3.3 Gamma Exposure (Total)

- **Teoria:** Soma da exposição de Gamma das posições dos dealers.
- **Leitura:**
  - Valor **positivo** (Gamma +) → regime mais estável, dealers amortecem o movimento.
  - Valor **negativo** (Gamma −) → regime instável, dealers amplificam o movimento.
- **Operacional:**
  - **Gamma +:** Prefira operações de **reversão à média** (venda resistência, compra suporte).  
  - **Gamma −:** Prefira operações de **tendência** (operar rompimentos com fluxo).

### 3.4 Delta Position (Total)

- **Teoria:** Delta líquido agregado (comprado ou vendido) dos dealers.
- **Leitura:**
  - Delta positivo → dealers mais comprados; podem vender futuro para se proteger.
  - Delta negativo → dealers mais vendidos; podem comprar futuro na alta.
- **Operacional:**
  - Use o Delta total como **viés direcional de fundo**:
    - Delta muito positivo + Gamma negativo → risco de **short squeeze**.
    - Delta muito negativo + Gamma negativo → risco de **crash / selloff**.

---

## 4. SIMULAÇÃO DE VALOR JUSTO (FAIR VALUE)

Seção: **Resumo Executivo — Simulação de Valor Justo**

### 4.1 O que é

- Tabela que mostra como o preço das principais opções mudaria em cenários de:
  - **Call Wall**;
  - **Put Wall**;
  - **Gamma Flip**;
  - **Movimentos de ±1% no subjacente**, etc.
- Utiliza modelos de precificação (Black-Scholes) com os parâmetros do `config.py`.

### 4.2 Como ler

- Colunas típicas: **Alvo (Spot)**, **Strike**, **Call (Hoje)**, **Call (Sim)**, **Var%**, **Put (Hoje)**, **Put (Sim)**, **Var%**.
- Cada linha é um cenário: “se o ativo for até tal nível, quanto a opção valoriza ou perde?”

### 4.3 Como operacionalizar

- Procure **linhas com VAR% muito alta** (por exemplo, +100%, +200%).  
  - Isso indica **assimetria**: pouco risco para grande potencial de ganho.
- Combine com o mapa de Gamma e Walls:
  - Se há **caminho livre** no GEX e OI até a Call Wall, e a simulação mostra grande valorização, você tem uma oportunidade de “Fair Value Arbitrage” (Setup D do ManualMaster).

Diferença WDO x WIN:

- Em WDO, o impacto de 1% no subjacente é mais direto.
- Em WIN, o cenário reflete a translação EWZ → Índice, então os ranges podem parecer maiores em pontos.

---

## 5. DELTA ACUMULADO

Seção: **DELTA ACUMULADO**

### 5.1 Teoria

- Soma do Delta das opções por strike, mostrando onde o mercado (via dealers) está mais exposto direcionalmente.
- Funciona como um “termômetro de viés”:  
  - Delta acumulado muito positivo em uma região → pressão compradora estrutural.  
  - Muito negativo → pressão vendedora estrutural.

### 5.2 Leitura prática

- Observe os **vales e picos** da curva:
  - Picos positivos → zonas de suporte “natural” para o preço do futuro.
  - Vales negativos → zonas de resistência ou “peso” vendedor.

### 5.3 Operacional

- Combine com o **Gamma Flip**:
  - Acima do Flip (Gamma +), zonas de Delta positivo tendem a segurar o preço (suportes).
  - Abaixo do Flip (Gamma −), zonas de Delta negativo podem acelerar quedas.

---

## 6. GAMMA EXPOSURE (GEX)

Seção: **GAMMA EXPOSURE**

### 6.1 Teoria

- Mostra a **exposição de Gamma por strike**, geralmente como barras positivas/negativas.
- Gamma é a “curvatura” do Delta — indica como o Delta muda quando o preço se move.

### 6.2 Leitura prática

- **Barras grandes positivas:**  
  - Regiões onde o dealer atua como **amortecedor** (compra baixa, vende alta).  
  - Preço tende a “travar” e ficar mais lento.
- **Barras grandes negativas:**  
  - Regiões de **aceleração** (dealer amplifica o movimento).  
  - Risco de squeezes e crashes.

### 6.3 Operacional

- Use o GEX para:
  - Definir zonas de **consolidação** (Gamma + forte) e **explosão** (Gamma − forte);
  - Ajustar tamanho de mão: mais conservador em Gamma −.

WDO x WIN:

- A lógica é idêntica; o que muda é a **densidade** das barras, ligada ao tipo de público e ao volume típico em cada mercado.

---

## 7. VOLATILIDADE IMPLÍCITA & SKEW

Seção: **VOLATILIDADE IMPLÍCITA & SKEW**

### 7.1 Teoria

- Volatilidade Implícita (IV) → expectativa de variação futura embutida nos preços das opções.
- Skew → formato da curva de IV ao longo dos strikes (sorriso, inclinação).

### 7.2 Leitura prática

- IV muito alta → mercado precificando movimentos mais bruscos; opções caras.
- IV muito baixa → mercado tranquilo; opções baratas.
- Skew acentuado para puts → medo de queda; para calls → medo de alta explosiva.

### 7.3 Operacional

- Evite comprar **volatilidade muito cara** sem motivo (eventos, notícias).
- Use IV Rank (no contexto do WIN/EWZ) para saber se a IV está em zona extrema (topo/fundo histórico).

---

## 8. NÍVEIS CHAVE DE MERCADO

Seção: **NÍVEIS CHAVE DE MERCADO**

Cards principais:

- **Gamma Flip**
- **Call Wall**
- **Put Wall**
- **Edi Effective Call**
- **Edi Effective Put**
- **Max Pain**

### 8.1 Gamma Flip

- **Teoria:** Ponto onde o sinal do Gamma agregado muda (de + para − ou vice-versa).  
- **Leitura:**  
  - Preço **acima** do Flip → regime mais estável.  
  - Preço **abaixo** do Flip → regime mais explosivo.
- **Operacional:**  
  - Use como **divisor de regime** para escolher entre estratégias de range ou tendência.

### 8.2 Call Wall / Put Wall

- **Teoria:** Strikes com maior concentração de OI em Calls (Call Wall) ou Puts (Put Wall).
- **Leitura:**  
  - Call Wall → “teto de aço”;  
  - Put Wall → “chão de concreto”.
- **Operacional:**
  - Use como alvos principais de movimento intradiário.
  - Rompimentos limpos de uma Wall costumam precisar de **fluxo forte** (volume + direção).

### 8.3 Edi Effective Call / Put

- **Teoria:** Versão “refinada” das walls, ponderando volumes importantes ao redor do strike principal.
- **Leitura:**  
  - Mostram o **centro de gravidade real** da defesa do dealer.
- **Operacional:**
  - Use as Effective Walls como pontos de **entrada precisa** e posicionamento de stop.

### 8.4 Max Pain

- **Teoria:** Preço onde o maior número de opções viraria pó no vencimento (dor máxima dos compradores).
- **Leitura:**  
  - Em semanas de vencimento, o preço tende a ser “puxado” em direção ao Max Pain.
- **Operacional:**
  - Use como referência de **tendência macro** perto do vencimento;  
  - Combine com fluxo e Gamma para avaliar se o “pinning” está acontecendo.

---

## 9. GREGAS DE 2ª ORDEM E BLOCOS AVANÇADOS

Seções: **Vanna, Charm, Theta, Vega**, **R-Gamma (PVOP)**, **Dealer Pressure Index**, **Flow Sentiment**, **MM PnL Simulation**.

### 9.1 Vanna, Charm, Theta, Vega

- **Vanna:** Sensibilidade do Delta à variação da IV.
- **Charm:** Sensibilidade do Delta à passagem do tempo.
- **Theta:** Perda de valor das opções com o tempo.
- **Vega:** Sensibilidade do preço da opção à IV.

**Operacional:**  

- Vanna alta em determinado strike → atenção a movimentos de volatilidade (reprecificação forte).  
- Charm forte próximo ao vencimento → mudanças rápidas de Delta, cuidado com reversões intradiárias.  
- Theta alto → boas zonas para estratégias que vendem tempo (mas com gestão de risco rigorosa).

### 9.2 R-Gamma (PVOP)

- **Teoria:** Gamma ajustado pelo fluxo direcional (Price × Volume × OI × Posição).
- **Leitura:**  
  - Mostra se o Gamma em determinado strike é **estabilizador** ou **desestabilizador**, levando em conta o fluxo real.
- **Operacional:**
  - Use o R-Gamma para refinar a leitura de quais strikes são realmente perigosos em dias de grande volume.

### 9.3 Dealer Pressure Index

- **Teoria:** Índice que resume a pressão de hedge dos dealers (quanto eles estão “sofrendo” e precisando ajustar).
- **Operacional:**
  - Valores extremos indicam **risco de movimentos forçados** pelo hedge (squeezes, reversões abruptas).

### 9.4 Flow Sentiment e MM PnL Simulation

- **Flow Sentiment:**  
  - Mostra o “humor” do fluxo de opções (mais compradas ou vendidas, em quais strikes).
- **MM PnL Simulation:**  
  - Estimativa do lucro/prejuízo dos Market Makers em vários cenários de preço.

**Operacional:**  

- Divergência entre fluxo e preço é um alerta (ex.: preço sobe, mas fluxo de calls esfria).  
- PnL muito negativo para o Market Maker → tendência de defesa de níveis que reduzam o prejuízo (movimento em direção ao Max Pain ou Walls).

---

## 10. PIN RISK E TABELA DETALHADA

### 10.1 Pin Risk

- **Teoria:** Risco de o preço “grudar” em determinado strike no vencimento, por concentração extrema de OI.
- **Operacional:**  
  - Em dias de vencimento, evite operar contra esse magnetismo em scalps muito agressivos.

### 10.2 Tabela Detalhada (Strike a Strike)

- Mostra, para cada strike:
  - Delta, Gamma, IV, volume de Calls e Puts, etc.
- **Uso principal:**  
  - Conferência fina de dados;  
  - Identificação de “anomalias” (strikes com IV muito fora da curva, OI desproporcional, etc.).

---

## 11. DIFERENÇAS PRÁTICAS WDO x WIN NA OPERAÇÃO

Embora o dashboard seja **simetricamente idêntico** para WDO e WIN, na prática você deve respeitar:

1. **Contexto macro dominante:**
   - WDO responde forte a dólar global, juros externos e fluxo cambial.
   - WIN responde mais ao índice de ações local e sentimento de risco Brasil.
2. **Escala de movimento:**
   - Movimentos de “1%” no WDO e no WIN têm impactos distintos em pontos e em R$ por contrato.
3. **Liquidez:**  
   - Em determinados vencimentos, WDO pode ter concentração diferente de OI em relação ao WIN; valide sempre os gráficos de OI.
4. **Sazonalidade:**  
   - Eventos como COPOM, Payroll, FOMC, vencimentos de índice e opções em B3 afetam de forma diferente cada ativo.

**Regra de ouro:**  
Use o mesmo **framework de leitura**, mas ajuste:

- tamanho de mão;
- alvos e stops (em pontos);
- agressividade na entrada (Gamma regime + contexto de notícias).

---

## 12. FLUXO OPERACIONAL RECOMENDADO

1. **Antes do pregão:**
   - Atualizar `config.py` com SPOT/IV/HVL (WDO) e parâmetros do EWZ/índice (WIN);
   - Rodar `python config.py` para gerar dashboards e PDFs;
   - Abrir o dashboard do ativo desejado (WDO ou WIN) e anotar:
     - Gamma Flip, Call/Put Wall, Effective Walls, Max Pain;
     - Regime (Gamma + ou Gamma −);
     - Cenários da Simulação de Valor Justo com maior assimetria.
2. **Durante o pregão:**
   - Acompanhar o preço em relação ao Gamma Flip e às Walls;
   - Usar o script NTSL no ProfitChart para executar entradas e saídas nos níveis marcados;
   - Validar rompimentos com:
     - Fluxo (Flow Sentiment),
     - R-Gamma,
     - Dealer Pressure.
3. **Pós-mercado:**
   - Revisar trades em função dos níveis do dia;
   - Ajustar parâmetros de IV/HV se necessário;
   - Atualizar o seu playbook pessoal.

---

## 13. MANUAL DO MODELO UNIFICADO (DASHBOARD_UNIFICADO)

O **modelo unificado** é a versão publicada na web que concentra, em uma única página, todas as leituras estruturais de WDO e WIN.  
Ele é acessado via GitHub Pages/Google Sites e oferece uma experiência de **leitura contínua**, da visão geral até os módulos avançados de V3.

Nesta seção, vamos percorrer **tela a tela, gráfico a gráfico**, explicando:

- o que cada bloco mostra;
- a interpretação prática;
- e como usar isso no seu dia a dia.

### 13.1 Cabeçalho, Seletor de Ativo e Navegação

- **Cabeçalho Neon (EDI MARKET GUARDIN V1)**  
  - Informa o nome do sistema e a edição (Stranger Things).  
  - Mostra também o **último horário de atualização** dos dados.

- **Seletor de Ativo (WDO / WIN)**  
  - Localizado à direita, no topo.  
  - No unificado, ele alterna entre:
    - `/dashboard_unificado/WDO/`
    - `/dashboard_unificado/WIN/`
  - **Uso:** escolha o ativo que você vai operar naquele momento. Todos os gráficos da página são recarregados com os dados daquele ativo.

- **Menu de Seções (Visão Geral, Essenciais, Estrutura, Gregas, V3, Risco, Consolidado, YouTube)**  
  - Atalhos para rolar a página até a seção desejada.  
  - Use como “sumário visual” durante o estudo pré-mercado.

---

### 13.2 Visão Geral do Mercado (Overview)

Bloco inicial, com cards de métricas e a tabela de **Simulação de Valor Justo**.

#### 13.2.1 Cards Superiores

1. **Total de Negócios**  
   - Quantidade total de negócios em opções daquele vencimento.  
   - Ajuda a medir a **liquidez** e “importância” do dia.

2. **Open Interest Total**  
   - Somatório de contratos em aberto (Calls + Puts).  
   - Quanto maior, mais relevantes as walls e os flips.

3. **Gamma Exposure Total**  
   - GEX agregado (podendo estar em trilhões, abreviado no card).  
   - Sinal (+/−) define o **regime de volatilidade**:
     - Gamma +: mercado mais estável (tendência a range).  
     - Gamma −: mercado mais explosivo (tendência a tendência forte).

4. **Delta Position Total**  
   - Delta líquido dos dealers.  
   - Direção estrutural (comprado/vendido) que, combinada com Gamma, revela risco de squeezes/crashes.

**Operacional:**  
Antes de descer para os gráficos, use os cards para responder:

- O dia está com **liquidez forte ou fraca**?  
- O **regime** é mais travado ou explosivo?  
- O viés de Delta favorece squeezes de alta ou de baixa?

#### 13.2.2 Simulação de Valor Justo (Fair Value)

- Tabela na parte direita/inferior da seção, preenchida dinamicamente.  
- Cada linha representa um **cenário de preço** (Call Wall, Put Wall, Gamma Flip, ±1%, etc.).  
- Colunas mostram:
  - Alvo (Spot), Strike;
  - Preço atual da call/put;
  - Preço simulado;
  - Variação em %.

**Como usar:**

- Procure cenários com **Var% muito alta** (ex.: > +100%) em regiões onde o mapa de Gamma/Wall permite o movimento.  
- Combine com os gráficos de **Expected Move** e **Gamma Flip Cone** na seção V3 para validar se aquele deslocamento é plausível no dia.

---

### 13.3 Seção ESSENCIAIS — Delta e Gamma

Inclui os gráficos:

- **Delta Acumulado** (`deltaChart`);  
- **Gamma Exposure** (`gammaChart`);  
- **Volatilidade & Skew** (`volatilityChart`).

#### 13.3.1 Delta Acumulado

- Linha que mostra a soma do Delta por strike.  
- Picos para cima: regiões com **viés comprador estrutural**;  
- Vales para baixo: regiões com **viés vendedor estrutural**.

**Uso prático:**

- Combine com o preço atual do futuro:  
  - Se o preço está entrando em uma zona de Delta muito positivo, espere **defesa de suporte**;  
  - Se se aproxima de Delta muito negativo, espere **defesa de resistência**.

#### 13.3.2 Gamma Exposure

- Barras por strike, com positiva/negativa.  
- Gamma + forte → “pântano”, preço trava.  
- Gamma − forte → “pista de corrida”, preço acelera.

**Uso prático:**

- Identificar **zonas de consolidação** (Gamma +) e **zonas de explosão** (Gamma −);  
- Ajustar agressividade dos trades e tamanho da mão.

#### 13.3.3 Volatilidade Implícita & Skew

- Linha/curva mostrando IV por strike (smile/skew).  
- Pode ser lida como “preço do medo” em cada região de preço.

**Uso prático:**

- Skew forte em puts → mercado precificando risco de queda.  
- Skew forte em calls → risco de alta explosiva.  
- Ajuda a escolher **estratégias de opções** (comprar/vender vol) e a calibrar expectativa de movimentação.

---

### 13.4 Seção ESTRUTURA — Exposição & Estrutura

Gráficos principais:

1. **Delta Agregado** (`deltaAgregadoChart`)  
2. **Open Interest por Strike** (`oiStrikeChart`)  
3. **Gamma Exposure (Call vs Put)** (`gexSplitChart`)

#### 13.4.1 Delta Agregado

- Versão mais estruturada do Delta, agregada por faixa de preço.  
- Foca no **viés macro** dos dealers.

#### 13.4.2 Open Interest por Strike

- Barras de OI por strike (Calls e Puts).  
- Mostra onde está o “dinheiro parado”.

**Uso prático:**

- Confirmar visualmente a importância de **Call Wall** e **Put Wall**;  
- Identificar strikes secundários com OI grande que podem servir de “quebra-molas”.

#### 13.4.3 Gamma Exposure (Call vs Put)

- Separa a contribuição de Gamma de Calls e de Puts.  
- Permite ver se uma região é dominada por **compras de call** ou **proteções em put**.

**Uso prático:**

- Em regiões onde Calls dominam o Gamma, rupturas de resistência podem gerar squeezes;  
- Onde Puts dominam, perdas de suporte podem acelerar quedas.

---

### 13.5 Seção NÍVEIS CHAVE

Na parte superior desta seção, você tem os cards:

- Gamma Flip, Call Wall, Put Wall, Edi Effective Call/Put, Max Pain.

**Uso prático (unificado):**

- Estes valores são **idênticos** aos do bloco “Níveis Chave” descrito na seção 8 do manual, mas agora integrados à navegação do dashboard unificado.  
- Use-os em conjunto com os gráficos imediatamente abaixo (Delta/OI/GEX) e com o bloco V3 (Max Pain Curve, Expected Move).

---

### 13.6 Seção GREGAS DE 2ª ORDEM

Gráficos:

- **Vanna Exposure** (`vannaChart`)  
- **Charm Exposure** (`charmChart`)  
- **Theta Exposure** (`thetaChart`)  
- **Vega Exposure** (`vegaChart`)

Cada gráfico mostra a exposição daquela grega por strike.

**Leitura e uso (resumo):**

- Vanna: cuidado em dias de grande mudança de IV (eventos macro).  
- Charm: atenção ao comportamento perto do vencimento (mudança rápida de Delta).  
- Theta: onde o “tempo está derretendo” mais forte — bom para quem vende prêmio, perigoso para quem compra prêmio.  
- Vega: onde o PnL é mais sensível à IV — importante para operações de volatilidade.

---

### 13.7 Seção GREGAS ACUMULADAS & R-GAMMA

Gráficos:

- **Charm Acumulado** (`charmCumChart`)  
- **Vanna Acumulado** (`vannaCumChart`)  
- **Theta Acumulado** (`thetaCumChart`)  
- **R-Gamma Exposure** (`rGammaChart`)  
- **R-Gamma Acumulado** (`rGammaCumChart`)

**Como ler:**

- As curvas acumuladas destacam **zonas de concentração** de efeito (tempo, vol, delta dinâmico).  
- R-Gamma ajusta Gamma pelo fluxo efetivo, mostrando se o dealer está estabilizando ou desestabilizando o preço em determinada região.

**Uso prático:**

- Use as curvas acumuladas para confirmar se uma região que já parece importante em Walls/GEX também é “pesada” do ponto de vista de tempo/vol.  
- R-Gamma extremo em uma região costuma anteceder movimentos violentos quando o preço entra naquele cluster.

---

### 13.8 Seção ANÁLISE ESTRUTURAL (V3)

Gráficos:

- **Max Pain Curve** (`maxPainChart`)  
- **Expected Move (Cone)** (`expectedMoveChart`)  
- **Gamma Flip Cone** (`gammaFlipConeChart`)  
- **Delta Flip Profile** (`deltaFlipProfileChart`)  
- **Flow Sentiment** (`flowSentimentChart`)  
- **Dealer Pressure Index** (`dealerPressureChart`)  
- **MM PnL Simulation** (`mmPnlChart`)  
- **Fair Value Simulation (tabela)** (`fair-value-container`)

**Interpretação geral:**

- Este bloco traz a “visão tática avançada” — como se fosse um laboratório de cenários.

**Pontos-chave:**

- **Max Pain Curve:** mostra onde está o vale de dor máxima; bom para cenários próximos ao vencimento.  
- **Expected Move:** delimita o range estatístico esperado; movimentos além disso são exceção.  
- **Gamma Flip Cone:** mostra como o Flip pode “andar” conforme a IV muda.  
- **Delta Flip Profile:** sensibilidade do ponto de equilíbrio direcional.  
- **Flow Sentiment:** confirma se o fluxo de opções está alinhado ao movimento do preço.  
- **Dealer Pressure Index & MM PnL:** medem o quanto o dealer está pressionado e onde gostaria que o preço fosse.

**Uso prático:**

- Combine com o plano do dia:  
  - Se o preço está perto do Expected Move superior **e** a pressão do dealer está extrema, fique atento a exaustões.  
  - Se o fluxo é bullish, mas o Max Pain está abaixo e o PnL do MM está muito negativo acima, cuidado com reversões.

---

### 13.9 Seção ANÁLISE DE RISCO

Gráfico:

- **Pin Risk** (`pinRiskChart`)

**Leitura:**

- Barras mostrando onde a concentração de OI pode “prender” o preço no vencimento.

**Uso prático:**

- Em dias próximos ao vencimento, evite entrar contra o “pinning” sugerido pelo gráfico;  
- Bom para scalps de convergência em torno dos strikes com maior pin risk.

---

### 13.10 Seção DADOS DETALHADOS & NTSL

Blocos:

- Tabela detalhada (`data-table`);  
- Botão de download do script NTSL (`ntsl_script.txt`);  
- Blocos de YouTube e Autor/Aviso Legal.

**Tabela Detalhada:**

- Mostra para cada strike: IV%, Delta, Gamma, Vol Call, Vol Put.  
- Use para:
  - conferir se o que aparece nos gráficos bate com os dados brutos;  
  - estudar anomalias (IV muito alta em strikes específicos, por exemplo).

**Script NTSL:**

- Link direto para baixar o último script gerado.  
- Fluxo padrão:
  - Rodar `python config.py`;  
  - Baixar `ntsl_script.txt`;  
  - Importar no ProfitChart → aplicar no gráfico.

**YouTube & Autor/Aviso Legal:**

- Links diretos para playlists de pré-mercado e material didático;  
- Bloco de aviso legal reforçando que o dashboard é ferramenta educacional/analítica, não recomendação.

---

## 14. CONCLUSÃO

O Dashboard EDI Market Guardin não é um “sinal de compra/venda”, mas um **sistema de leitura estrutural** do mercado de opções de WDO e WIN.  
Quando você entende:

- como Gamma e Delta moldam o comportamento dos dealers;
- como Walls, Flips e Max Pain organizam os níveis de preço;
- e como Vanna, Charm, Theta, Vega e fluxo complementam o quadro,

passa a enxergar o mercado não como “velas aleatórias”, mas como um **campo de forças** com regras claras.

Use este manual como referência diária:

- para revisar os conceitos;
- para planejar o dia antes do pregão;
- e para interpretar movimentos extremos com calma e método.

Bom uso do dashboard — e bons trades.

---

## 15. Módulos Exclusivos do Dashboard V3 (não presentes no V1)

O Dashboard V3 amplia a análise com módulos avançados que não estão no V1. Abaixo, um guia didático e operacional para cada componente adicional.

### 15.1 Fluxo e Pressão

- **Flow Sentiment**  
  - O que é: Termômetro do fluxo (bullish vs bearish) por strike/intervalo.  
  - Leitura: Divergências entre preço e fluxo antecipam reversões (sobe com fluxo caindo = alerta).  
  - Operacional: Confirmar rompimentos/tendências; evitar operar contra fluxo predominante.

- **Dealer Pressure**  
  - O que é: Índice de pressão de hedge dos dealers (quanto “sofrem” para ajustar).  
  - Leitura: Picos indicam zonas onde o dealer será forçado a agir (squeeze/reversão).  
  - Operacional: Em pressão extrema, reduzir mão e buscar operação a favor do movimento emergente.

- **Dealer Pressure Tabela**  
  - O que é: Detalhamento tabular dos componentes do índice.  
  - Operacional: Identificar strikes específicos com pressão crítica para definir triggers.

### 15.2 Vencimento e Hedge

- **Expiry Pressure**  
  - O que é: Pressão associada à proximidade do vencimento e concentração de OI.  
  - Leitura: Tendência a “pinagem” em strikes cheios.  
  - Operacional: Em semana de vencimento, preferir scalps de convergência; evitar brigar com o pinning.

- **Fluxo Hedge Tabela**  
  - O que é: Tabela de estimativa de hedge necessário (compras/vendas em futuro).  
  - Operacional: Antecipar janelas de defesa dos dealers; usar como filtro de timing.

### 15.3 Decomposições de GEX e Relações

- **GEX IV**  
  - O que é: Exposição Gamma ponderada por IV.  
  - Leitura: Regiões onde a combinação de Gamma e IV torna o mercado especialmente sensível.  
  - Operacional: Evitar contra-tendência em zonas de GEX IV extremo sem confirmação de fluxo.

- **GEX OI**  
  - O que é: Exposição Gamma ponderada por OI.  
  - Leitura: Sinaliza o “peso” estrutural do Gamma em função de contratos em aberto.  
  - Operacional: Priorizar paredes com alto GEX OI como principais suportes/resistências.

### 15.4 Cones e Perfis Avançados

- **Gamma Flip Cone**  
  - O que é: Cone de projeção do Gamma Flip sob diferentes cenários de IV/oi.  
  - Leitura: Largura do cone indica confiança no flip (estreito = estável).  
  - Operacional: Ajustar plano de rompimento/reversão conforme estabilidade do flip.

- **Delta Flip Profile**  
  - O que é: Perfil de sensibilidade do ponto em que o Delta zera.  
  - Leitura: Mostra “zonas de virada” direcional ao longo do preço.  
  - Operacional: Usar como linha de confirmação para reversões ou como alvo intermediário.

### 15.5 Sensibilidades e Skew

- **Skew Local**  
  - O que é: Medida local do skew (inclinação do sorriso) por janelas de strikes.  
  - Leitura: Destaca onde o mercado “compra medo” (puts/calls).  
  - Operacional: Ajustar operações de volatilidade; cuidado com exageros de skew (potencial mean reversion).

- **Vanna Sensitivity**  
  - O que é: Sensibilidade do Delta à variação de IV (aprofundada).  
  - Leitura: Onde mudanças na IV têm maior impacto na direção (Delta).  
  - Operacional: Em eventos de IV (FOMC/Payroll), operar a favor do lado indicado pela Vanna.

- **Vanna Sensitivity Tabela**  
  - O que é: Visual tabular da sensibilidade por strikes.  
  - Operacional: Escolher strikes-alvo para estratégias de opções focadas em volatilidade.

### 15.6 PVOP e R-Gamma

- **PVOP**  
  - O que é: Métrica de fluxo direcional (Price × Volume × OI × Posição).  
  - Leitura: Identifica onde o fluxo “puxa” o preço independentemente do Gamma puro.  
  - Operacional: Filtrar falsos sinais de GEX; confirmar regiões realmente ativas.

- **R-Gamma PVOP**  
  - O que é: Gamma ajustado pelo PVOP (fluxo).  
  - Leitura: Diz se o Gamma em um strike é **estabilizador** ou **desestabilizador** levando em conta o fluxo.  
  - Operacional: Priorizar defesas/rompimentos nos strikes com R-Gamma condizente com o cenário (ex.: desestabilizador em queda).

### 15.7 Estruturas e Overlays

- **Rails & Bounce**  
  - O que é: Visual de “trilhos” e pontos de bounce (reversão) com base em níveis estruturais.  
  - Leitura: Sugerem zonas de pullback técnico e retomada da tendência.  
  - Operacional: Útil para scalps e para posicionar stops/parciais com precisão.

- **Visão Completa Fig3**  
  - O que é: Composição de todos os componentes-chave da Figura 3 em um único gráfico.  
  - Leitura: Panorama consolidado; facilita o planejamento integrado.  
  - Operacional: Construir plano global do dia (níveis, regimes, cones, fluxo) em um único canvas.

### 15.8 Tabelas Complementares

- **Pin Risk Tabela**  
  - Complementa o gráfico de pin risk com valores exatos por strike.  
  - Operacional: Foco em strikes com provável “ímã” de preço no vencimento.

- **Gamma Flip Cone Tabela**  
  - Dados subjacentes do cone de flip; permite backtest diário de estabilidade.  
  - Operacional: Validar confiança do flip antes de montar estratégias baseadas nele.

---
