# 🌐 EDI — SCRIPT MASTER REVISÃO 0.1 (PARTE 2)
**Continuação: Módulos Globais + Opções + Templates + Validação**

---

# ═══════════════════════════════════════════════════════════════
# PARTE VI: MÓDULOS GLOBAIS AVANÇADOS
# ═══════════════════════════════════════════════════════════════

## [EM_FLOW_ANALYSIS_MODULE]

### 🌍 ANÁLISE DE FLUXO EMERGENTES

**Ativos Requeridos:**
- **CRÍTICOS:** EWZ, EEM, IBOV
- **COMPLEMENTARES:** FXI, VWO, EWZS

**Análise:**

**1. EWZ vs IBOV Divergence:**
```
EWZ ↑ forte + IBOV ↑ fraco:
→ Entrada estrangeiro via ETF → Bullish BRL

EWZ ↓ forte + IBOV ↓ fraco:
→ Saída estrangeiro → Bearish BRL

EWZ ↑ + IBOV ↓:
→ Raro — investigar (arb ou hedge)

EWZ ↓ + IBOV ↑:
→ Doméstico comprando, estrangeiro vendendo
```

**2. China (FXI) como Proxy:**
```
FXI ↑ + Commodities ↑:
→ Bullish para Brasil

FXI ↓:
→ Bearish commodities → Bearish BRL
```

**3. Broad EM (EEM):**
```
EEM ↑ forte:
→ Risk on amplo para EMs

EEM ↓ + EWZ resiliente:
→ Brasil descolando (positivo)

EEM ↑ + EWZ fraco:
→ Brasil underperformance (negativo)
```

**Sinais para WDO:**
```
EWZ ↓↓ + EEM ↓ + FXI ↓:
→ FUGA FORTE → WDO ↑↑

EWZ ↑↑ + EEM ↑ + FXI ↑:
→ ENTRADA FORTE → WDO ↓↓

EWZ ↓ mas IBOV ↑:
→ SAÍDA SELETIVA → WDO pode subir
```

**Output para CORPO:**
"Fluxo EM: {Entrada/Saída/Neutro}. EWZ {↑/↓/≈} vs IBOV {↑/↓/≈}, indicando {interpretação}. China (FXI) {↑/↓/≈} {suporta/pressiona} commodities."

---

## [GLOBAL_RATES_DIVERGENCE_MODULE]

### 📊 DIVERGÊNCIA DE TAXAS GLOBAIS

**Spreads Críticos:**

**1. US10Y - DE10Y (Fed vs ECB):**
```
Típico: 150-250 bps (US maior)

Alargando → USD forte vs EUR
Estreitando → USD fraco vs EUR
```

**2. DE10Y - IT10Y (Core vs Periférico):**
```
Típico: 100-200 bps (IT maior)

Alargando → Stress Europa → EUR fraco
Estreitando → Confiança → EUR forte
```

**3. US10Y - JP10Y (Carry USD/JPY):**
```
Típico: 300-400 bps (US maior)

Alto → Carry favorável → JPY fraco
Estreitando → Carry unwinding → JPY forte
```

**4. US10Y - BR10Y (Prêmio Brasil):**
```
Típico: 600-800 bps (BR maior)

Alargando → Risco Brasil ↑ → BRL fraco
Estreitando → Percepção melhorando → BRL suportado
```

**Sinais para WDO:**
```
US10Y ↑↑ isolado (spreads alargando):
→ USD MUITO FORTE → WDO ↑↑

Spreads estreitando vs EMs:
→ Fluxo para Brasil → WDO ↓

DE-IT alargando + US-DE alargando:
→ STRESS GLOBAL → USD safe haven → WDO ↑
```

---

## [RISK_ON_OFF_DETECTOR]

### 🎲 DETECTOR RISK ON/OFF (SCORE)

**Inputs (peso por categoria):**

**Categoria 1 - Equities (30%):**
```
SPY/ES:  ↑ = +1 | ↓ = -1
QQQ/NQ:  ↑ = +1 | ↓ = -1 (peso 1.2x se tech liderando)
EEM:     ↑ = +1 | ↓ = -1
```

**Categoria 2 - Volatilidade (20%):**
```
VIX:  ↓ = +1 | ↑ = -1
VVIX: ↓ = +0.5 | ↑ = -0.5
```

**Categoria 3 - Safe Havens (15%):**
```
TLT (Treasuries): ↓ = +1 | ↑ = -1 (contextual)
GLD (Gold):       ↓ = +1 | ↑ = -1
JPY (USD/JPY):    ↑ = +1 | ↓ = -1
```

**Categoria 4 - Setoriais (20%):**
```
Defensivos (XLU + XLP): ↓ = +1 | ↑ = -1
Cíclicos (XLY + XLI + XLE): ↑ = +1 | ↓ = -1
```

**Categoria 5 - Carry & EM FX (15%):**
```
AUD/USD: ↑ = +1 | ↓ = -1
EWZ:     ↑ = +1 | ↓ = -1
🆕 FXI:  ↑ = +0.5 | ↓ = -0.5
```

**Cálculo:**
```
Score = Σ(Contribuição × Peso)
Range: -10 (max risk off) a +10 (max risk on)
```

**Interpretação:**
```
Score > +5:   RISK ON FORTE → WDO ↓ (fluxo EMs)
Score +2 a +5: RISK ON MODERADO → WDO neutro/leve baixa
Score -2 a +2: NEUTRO/MISTO → WDO segue idiossincráticos
Score -2 a -5: RISK OFF MODERADO → WDO neutro/leve alta
Score < -5:   RISK OFF FORTE → WDO ↑ (fuga USD)
```

**Nuances:**
```
1. TLT ↑ + GLD ↑ + JPY ↑ simultâneo:
   → RISK OFF EXTREMO (sobrepõe score)

2. Defensivos liderando mas VIX baixo:
   → Falso sinal (ignorar defensivos)

3. AUD ↓ forte (>1%) isolado:
   → Carry unwinding (peso 2x)

4. 🆕 FXI ↓ forte (>2%) + commodities ↓:
   → China demand shock (peso 3x para Brasil)
```

---

## [CARRY_TRADE_MONITOR]

### 💱 MONITOR CARRY TRADE

**Pares Principais:**
```
USD/JPY (funding)
AUD/USD (target)
NZD/USD (target volátil)
USD/BRL (nosso alvo)
```

**Pares Sintéticos:**
```
AUD/JPY = AUD/USD × USD/JPY (key barometer)
NZD/JPY = NZD/USD × USD/JPY
```

**Análise:**

**Carry Unwinding Detection:**
```
AUD/JPY ↓ >1% intraday:
→ Unwinding forte → Risk off → WDO ↑

USD/JPY ↓ + AUD/USD ↓:
→ Duplo unwinding → Risk off severo

NZD > AUD (volatilidade):
→ Early warning
```

**Carry Build-up Detection:**
```
AUD/JPY ↑ steady:
→ Carry building → Risk on → WDO ↓

USD/JPY ↑ + yields US ↑:
→ Ambiente favorável carry
```

**Thresholds:**
```
AUD/JPY: >±1.0% intraday = movimento significativo
USD/JPY: >±0.8% intraday = movimento significativo
Correlação AUD/USD com USD/BRL: -0.6 a -0.8
```

**Sinais para WDO:**
```
AUD/JPY ↓↓ + VIX ↑:
→ Carry unwinding + risk off → WDO ↑↑

AUD/JPY ↑ + commodities ↑:
→ Risk on + commodity rally → WDO ↓

USD/JPY ↑ isolado (yields):
→ USD forte broad → WDO ↑
```

---

## [SECTOR_ROTATION_MODULE_V2]

### 🔄 ROTAÇÃO SETORIAL V2

**Setoriais Disponíveis:**
```
✅ XLF (Financials)
✅ XLK (Technology)
✅ XLE (Energy)
✅ XLV (Healthcare)
✅ XLY (Consumer Discretionary)
✅ XLP (Consumer Staples)
✅ XLU (Utilities)
✅ XLI (Industrials)
✅ XLB (Materials)
✅ XLC (Communication)
✅ XLRE (Real Estate)
```

**Análise (com 11 setores completos):**

**1. Ranking:**
```
Ordenar por performance:
1º: {XL?} ({variação})
2º: {XL?} ({variação})
...
11º: {XL?} ({variação})
```

**2. Classificação de Regime:**
```
RISK ON (cíclicos liderando):
├─ XLY + XLE + XLI no top 5 = Risk on forte
├─ XLK liderando forte (>+1%) = Growth-led
└─ XLB forte = Commodity/industrial cycle

RISK OFF (defensivos liderando):
├─ XLU + XLP + XLV no top 5 = Risk off
├─ XLRE resiliente = Flight to yield
└─ XLC defensivo (telecom pesado)

VALUE ROTATION:
├─ XLF liderando + XLK fraco = Value
├─ XLE liderando + XLK fraco = Energy/value
└─ XLB + XLI forte = Industrial cycle
```

**3. Contextualização:**
```
XLE ↑ forte: linkar com WTI/Brent → Petrobras
XLK ↑ forte: linkar com QQQ/NQ → Tech rally
XLF ↑ forte: linkar com yields → Bancos BR
XLB ↑ forte: linkar com Minério/Cobre → Vale
```

**Sinais para WDO:**
```
XLY + XLE + XLI liderando (risk on cíclico):
→ WDO ↓

XLU + XLP + XLV liderando (defensive shift):
→ WDO ↑

XLF forte + yields subindo:
→ USD forte → WDO ↑

XLB forte (materials):
→ Commodities rally → WDO ↓ (entrada USD Brasil)
```

---

# ═══════════════════════════════════════════════════════════════
# PARTE VII: OPÇÕES & GAMMA (WDO - FOCO PRIMÁRIO)
# ═══════════════════════════════════════════════════════════════

## [OPTIONS_GAMMA_MODULE]

### 🎲 MÓDULO OPÇÕES/GAMMA (WDO)

**Fonte:** Dashboard de opções/gamma (PDF/print) ou Barchart

**Análise (CORPO - sem números):**

**1. Regime de Gamma:**
```
SE Preço > Gamma Flip:
→ Gamma Positivo
→ Volatilidade SUPRIMIDA
→ Dealers vendem altas / compram quedas
→ Favorece reversão à média

SE Preço < Gamma Flip:
→ Gamma Negativo
→ Volatilidade AMPLIFICADA
→ Dealers compram altas / vendem quedas
→ Favorece rompimento/tendência
```

**2. Distância ao Flip:**
```
├─ Próximo (<50 pts): Zona crítica
├─ Médio (50-150 pts): Regime estável
└─ Longe (>150 pts): Regime consolidado
```

**3. Range Esperado:**
```
IV Anual → IV Diária (IV/√245)
Movimento implícito = Preço × IV Diária

├─ Estreito: <100 pts
├─ Médio: 100-200 pts
└─ Amplo: >200 pts
```

**4. Flow Call/Put:**
```
├─ Viés Calls: OI Calls > OI Puts
├─ Viés Puts: OI Puts > OI Calls
└─ Neutro: OI balanceado
```

**5. Call Wall / Put Wall:**
```
Call Wall (resistência):
├─ Acima do preço atual
├─ Strike com maior OI Calls
└─ Barreira estrutural

Put Wall (suporte):
├─ Abaixo do preço atual
├─ Strike com maior OI Puts
└─ Piso estrutural
```

**6. Zonas GEX (Gamma Exposure):**
```
Top 5 níveis de GEX:
├─ Resistências (acima do preço)
├─ Suportes (abaixo do preço)
└─ Classificar: gravidade/absorção/aceleração
```

---

## [OPTIONS_B3_TABLE]

### 📊 OPÇÕES DOLFUT (B3) - TOP STRIKES

**Objetivo:** Sentimento e reação esperada nos principais strikes locais.

```markdown
| Strike | OI Calls | OI Puts | Net OI | Sentimento      | Reação Esperada       |
|--------|----------|---------|--------|-----------------|------------------------|
| {val}  | {alto}   | {baixo} | +{X}   | Bullish         | Resistência se atingir |
| {val}  | {médio}  | {médio} | ≈0     | Neutro          | Zona de equilíbrio     |
| {val}  | {baixo}  | {alto}  | -{X}   | Bearish         | Suporte se atingir     |
```

**No CORPO:** Descrever apenas qualitativamente.  
**No DATA_SHEET (A5.1):** Tabela completa com números.

---

## [OPTIONS_CME_TABLE]

### 📊 OPÇÕES EWZ (CME) - CONVERSÃO PARA INDFUT

**Objetivo:** Detectar sentimento institucional global via CME e converter para equivalente índice.

**Fórmula de Conversão:**
```
Strike EWZ ($) × Taxa USD/BRL = Equivalente INDFUT (pts)
```

```markdown
| Strike EWZ | Equiv. INDFUT | OI   | Sentimento | Reação Esperada        |
|------------|---------------|------|------------|------------------------|
| ${val}     | {pts}         | Alto | Bullish    | Call wall institucional|
| ${val}     | {pts}         | Alto | Bearish    | Put wall institucional |
```

**Interpretação:**
- EWZ representa fluxo INSTITUCIONAL estrangeiro
- OI alto em calls EWZ = Aposta em Brasil alta
- OI alto em puts EWZ = Hedge ou aposta baixa
- Divergência EWZ vs B3 = Oportunidade arb ou sinal

**No CORPO:** Descrever apenas qualitativamente.  
**No DATA_SHEET (A5.2):** Tabela completa com números.

---

## [60_SECOND_CONTROL_PANEL]

### ⏱️ PAINEL DE CONTROLE (60 SEGUNDOS)

**Objetivo:** Sumário de alto impacto para absorção em 60 segundos.

```markdown
| Categoria          | Métrica         | Estado         | Implicação                |
|--------------------|-----------------|----------------|---------------------------|
| **Estrutura**      | Call Wall       | acima/próx/abx | Barreira dealers          |
|                    | Put Wall        | acima/próx/abx | Piso dealers              |
|                    | Gamma Flip      | acima/abx/próx | Ponto de virada           |
| **Volatilidade**   | Regime          | supr/ampl/mix  | Reversão vs rompimento    |
| **Global**         | DXY             | ↑/↓/≈          | Força USD                 |
|                    | US10Y           | ↑/↓/≈          | Juros EUA                 |
|                    | SPX/Nasdaq      | ↑/↓/≈          | Apetite risco             |
| **Stress**         | VIX             | ↑/↓/≈          | Risco global              |
| **🆕 China**       | FXI             | ↑/↓/≈          | Demanda commodities       |
| **Brasil**         | WDO             | ↑/↓/≈          | Direcional dólar          |
|                    | WIN             | ↑/↓/≈          | Direcional índice         |
|                    | DI Longo        | ABRE/FECHA/≈   | Risco fiscal/prêmio       |
|                    | VXEWZ/CDS       | ALARGA/EST/≈   | Stress BR                 |
|                    | **🆕 Commodities** | **↑/↓/≈**   | **Balança comercial**     |
```

---

# ═══════════════════════════════════════════════════════════════
# PARTE VIII: TEMPLATE DE SAÍDA (DUAL MODE)
# ═══════════════════════════════════════════════════════════════

## [OUTPUT_STRUCTURE]

### 📄 ESTRUTURA DE SAÍDA COMPLETA

O relatório DEVE ter **DOIS BLOCOS:**

**BLOCO A: CORPO INSTITUCIONAL (sem números de preço)**
- Resumo Executivo (no chat)
- Painel de Controle 60 Segundos
- Observed Facts (direcional qualitativo)
- Brasil (DI + Risco + Fluxo)
- **🆕 Brasil Produtor Commodities (balança)**
- **🆕 China Proxy (demanda)**
- Opções/Gamma (regime + walls + zonas)
- Sentimento NLP
- Agenda Econômica
- Tese Central + Cenários
- Legenda + Disclaimer

**BLOCO B: ANEXO A — DATA SHEET (números permitidos)**
- A1) Global
- A2) Commodities (🆕 + coluna Impacto Balança BR)
- A3) Brasil + Curva DI
- A4) Agenda
- A4.1) Matriz de Reação
- A5) Opções/Gamma WDO (métricas)
- A5.1) Strikes B3 (tabela numérica)
- A5.2) Strikes CME/EWZ (tabela numérica)
- **🆕 A6) China Proxy (FXI, CSI300, correlações)**
- A7-A11) Módulos Avançados (se executados)

---

## [RESUMO_EXECUTIVO_TEMPLATE]

### ⚡ RESUMO EXECUTIVO (NO CHAT)

```markdown
## ⚡ PRÉ-MERCADO {DATA} — RESUMO EXECUTIVO

### 🇧🇷 BRASIL (FOCO PRINCIPAL)

**WDO (USD/BRL):**
• Spot: {direção}
• Futuro: {direção}
• Driver principal: "{tema curto}"

**WIN (IBOV):**
• IBOV: {direção}
• WIN futuro: {direção}
• Driver: "{tema curto}"

**DI CURVA:**
• Shape: {STEEPEN/FLATTEN} ({Bear/Bull})
• Longo: {ABRE/FECHA}
• Contexto: "{1 frase}"

**FLUXO:**
• EWZ vs IBOV → {Entrada/Saída/Neutro}

**RISCO BRASIL:**
• CDS/VXEWZ: {ALARGA/ESTREITA/↑/↓}
• Sinal: {Risco ↑/↓/≈}

**🆕 BRASIL PRODUTOR:**
• Commodities: {Fortes/Fracas/Mistas}
• Balança: {Superavitária/Deficitária/Neutra}
• Impacto BRL: {Suporte/Pressão/Neutro}

### 🌎 CONTEXTO GLOBAL

**DRIVERS WDO:**
1. {Driver 1}
2. {Driver 2}
3. {Driver 3}

**🆕 CHINA DEMAND:**
• FXI: {↑/↓/≈} → {Bullish/Bearish/Neutro} commodities BR

**REGIME:**
• Risk On/Off: {STATUS} (Score: qualitativo)
• Setoriais: {Cíclicos/Defensivos} liderando

**AGENDA:**
• {HH:MM} BRT - {Evento crítico Brasil}
• {HH:MM} BRT - {Evento crítico EUA}

### 📊 OPÇÕES WDO

**Regime Gamma:** {Positivo/Negativo}
**Range Esperado:** {Estreito/Médio/Amplo}
**Níveis Críticos:** Ver DATA_SHEET

---
📎 **RELATÓRIO COMPLETO + DATA_SHEET em anexo**
```

---

## [REPORT_INSTITUTIONAL_BODY_ENHANCED]

### 📋 RELATÓRIO INSTITUCIONAL (CORPO COMPLETO - REVISÃO 0.1)

```markdown
## TÍTULO

EDI — Relatório Estratégico Pré-Mercado | REVISÃO 0.1  
Integração Macro, Cross-Asset, Curva DI, Brasil Produtor, China Demand, Opções/Gamma e Cenários  
Ativos: WDO (USD/BRL Futuro) | WIN (Mini Ibovespa Futuro)  

**Data:** {DD/MM/AAAA}  
**Horário:** {HH:MM BRT}  
**Janela:** {início do pré / perto da abertura}  
**Convicção:** {ALTA/MÉDIA/BAIXA}  

---

## 1) PAINEL DE CONTROLE (60 SEGUNDOS)

[Inserir tabela do [60_SECOND_CONTROL_PANEL]]

---

## 2) FATOS OBSERVADOS (DIRECIONAL QUALITATIVO)

### 2.1) Global Core
- US10Y (yield): {↑/↓/≈}
- US2Y (yield): {↑/↓/≈}
- Curva 2s10s: {STEEPEN/FLATTEN/≈}
- DXY: {↑/↓/≈}
- ES/SPY: {↑/↓/≈}
- NQ/QQQ: {↑/↓/≈}
- VIX: {↑/↓/≈}
- MOVE: {↑/↓/≈}

### 2.2) Emergentes
- EEM: {↑/↓/≈}
- EM crédito (USD): {ALARGA/ESTREITA/≈}
- USD/MXN: {↑/↓/≈}
- USD/ZAR: {↑/↓/≈} → [uso interno, não mencionar no corpo final]

### 🆕 2.3) China (Demanda Commodities BR)
- FXI (China Large Cap): {↑/↓/≈}
- CSI300 (A-shares): {↑/↓/≈}
- HSI (Hong Kong): {↑/↓/≈}
- Sinal para commodities BR: {Bullish/Bearish/Neutro}

### 2.4) Brasil
- EWZ: {↑/↓/≈}
- EWZS: {↑/↓/≈}
- WDO/USD/BRL: {↑/↓/≈}
- WIN/IBOV: {↑/↓/≈}
- DI Curva: {shape + breadth + tipo}
- Risco BR (CDS/VXEWZ): {ALARGA/ESTREITA/↑/↓}

### 2.5) Headlines Dominantes
- {Driver 1} → {impacto provável WDO/WIN}
- {Driver 2} → {impacto provável WDO/WIN}
- {Driver 3} → {impacto provável WDO/WIN}

---

## 3) AUDITORIA DE DADOS (INTEGRIDADE)

**Fontes processadas:** {CSV / DI / Opções / Calendário / Notícias / Web}  
**Críticos faltantes:** {nenhum ou listar}  
**🆕 China proxies:** {FXI / CSI300 / HSI - status}  
**Conflitos centrais:** {nenhum ou listar}  
**Fallbacks usados:** {nenhum ou listar}  

---

## 🆕 4) BRASIL COMO PRODUTOR DE COMMODITIES

### 4.1) Panorama Commodities Brasil

**Agronegócio (32% exportações BR):**
• Soja: {↑/↓/≈} → Balança: {positivo/negativo}  
• Milho: {↑/↓/≈} → Balança: {positivo/negativo}  
• Boi: {↑/↓/≈} → Balança: {positivo/negativo}  
• Café: {↑/↓/≈} → Balança: {positivo/negativo}  
• Açúcar: {↑/↓/≈} → Balança: {positivo/negativo}  

**Mineração (15% exportações BR):**
• Minério Ferro: {↑/↓/≈} → VALE: {pressão/suporte} → Balança: {positivo/negativo}  

**Energia (10% exportações BR):**
• Petróleo: {↑/↓/≈} → Petrobras: {beneficiada/pressionada}  
• Duplo efeito: Export (+) vs Inflação doméstica (-)  

### 4.2) Impacto Integrado

**Balança Comercial:** {Superavitária/Deficitária/Neutra}  
**Entrada USD estimada:** {Forte/Moderada/Fraca}  
**Impacto BRL:** {Suporte forte/Suporte/Neutro/Pressão/Pressão forte}  
**Impacto IBOV:** {Depende rotação setorial / Bullish exportadores / Bearish peso commodities}  

**Correlação China:**
• FXI × Commodities BR: {Alinhado/Divergindo}  
• Demanda China: {Forte/Fraca/Mista}  

**🆕 Contexto Sazonal:** {Se relevante: mencionar padrão do mês}

---

## 5) COMMODITIES (DESTAQUE — IMPACTO BRASIL)

[Inserir todas as commodities do CSV com sinais + impacto Brasil + impacto balança]

• Minério (SGX): {↑/↓/≈} → Impacto Vale: 🔼/🔽/⏸️ → Balança: {+/-}  
• Minério (Dalian): {↑/↓/≈}  
• WTI: {↑/↓/≈}  
• Brent: {↑/↓/≈}  
• Ouro: {↑/↓/≈}  
• Cobre: {↑/↓/≈}  
• Soja: {↑/↓/≈} → Balança: {+/-}  
• Milho: {↑/↓/≈} → Balança: {+/-}  
• Café: {↑/↓/≈} → Balança: {+/-}  
• Açúcar: {↑/↓/≈} → Balança: {+/-}  
• Boi: {↑/↓/≈} → Balança: {+/-}  

[Adicionar demais commodities presentes no CSV]

**Leitura Geral:** "{Commodities fortes/fracas/mistas}. Driver principal: {China/USD/clima/geopolítica}. Impacto líquido balança Brasil: {positivo/negativo/neutro}."

---

## 6) REGIME GLOBAL (RISK-ON / RISK-OFF)

**Sentimento:** {Risk-On / Risk-Off / Cautela / Transição}  
**Motor do regime:** {Juros/Crédito/Commodities/Política/Evento/China}  
**Coerência:** {Alta/Média/Baixa}  
**Score Risk On/Off:** {Qualitativo: forte/moderado/fraco}  

**Leitura:** {2–4 linhas explicando o regime e drivers}

Se [WEB_NEWS_MODULE] foi ativado, incluir as 3 frases padrão aqui.

---

## 7) BRASIL (ÂNCORA: DI + RISCO + FLUXO)

### 7.1) Curva DI

**Curto:** {ABRE/FECHA/≈}  
**Médio:** {ABRE/FECHA/≈}  
**Longo:** {ABRE/FECHA/≈}  
**Shape:** {STEEPEN/FLATTEN/≈}  
**Tipo:** {Bear/Bull Steepener/Flattener/≈}  
**Breadth:** {ABERTURA AMPLA/FECHAMENTO AMPLO/MISTO/ESTÁVEL}  

**Leitura:** {3–6 linhas conectando DI com WDO/WIN e commodities}

### 7.2) Risco BR

**CDS BR / VXEWZ:** {ALARGA/ESTREITA/↑/↓/≈}  
**Spread BR10Y-US10Y:** {ALARGA/ESTREITA}  
**Leitura:** {2–4 linhas}

### 7.3) Fluxo

**EWZ vs IBOV:** {Entrada/Saída/Neutro}  
**Interpretação:** {2–3 linhas}

---

## 8) OPÇÕES / GAMMA (WDO) — MECÂNICA DO MERCADO

**Regime Gamma:** {Positivo/Negativo/Misto}  
**Distância ao Flip:** {Próximo/Médio/Longe}  
**Call Wall (resistência):** {Acima/Próximo/Abaixo do preço atual}  
**Put Wall (suporte):** {Acima/Próximo/Abaixo do preço atual}  
**Range esperado:** {Estreito/Médio/Amplo}  
**Zonas GEX:** {descrição qualitativa - absorção/gravidade/aceleração}  

**Leitura tática:** {2–4 linhas sobre implicações operacionais}

---

## 9) SENTIMENTO (PLN) — QUALITATIVO

**Classificação Geral:** {Muito Pessimista / Pessimista / Neutro / Otimista / Muito Otimista}  

**Bullish (Top 3):**
1. {fator}
2. {fator}
3. {fator}

**Bearish (Top 3):**
1. {fator}
2. {fator}
3. {fator}

**Impacto na abertura:** {2–3 linhas}

---

## 10) AGENDA ECONÔMICA (BRT)

**Top 3 eventos do dia:**
- {HH:MM} BRT — {Evento} — {Importância: Alta/Média} — Est: {valor qualitativo}
- {HH:MM} BRT — {Evento} — {Importância: Alta/Média} — Est: {valor qualitativo}
- {HH:MM} BRT — {Evento} — {Importância: Alta/Média} — Est: {valor qualitativo}

**Matriz de reação (curto prazo):** Ver ANEXO A4.1 (detalhada)

---

## 11) TESE CENTRAL + CENÁRIOS (SE–ENTÃO)

### 11.1) TESE CENTRAL DO DIA

{Narrativa integrada e acionável - sem números - conectando:
- Contexto global (DXY, yields, equity)
- 🆕 China demand (FXI, CSI300, commodities)
- Risco Brasil (DI, CDS, fluxo EWZ)
- 🆕 Brasil produtor (balança comercial, commodities)
- Opções/Gamma (regime, walls, range)
- Sentimento (manchetes, PLN)

Objetivo: explicar "o que o mercado está precificando hoje"}

### 11.2) CONFLUÊNCIAS E DIVERGÊNCIAS

**Confluências:** {Onde sinais se alinham}

**Divergências:** {Onde sinais se contradizem}

### 11.3) CENÁRIOS OPERACIONAIS (ABERTURA)

**Cenário 1 (WDO Altista — BRL Enfraquece):**
- **SE:** {condição macro/China/fluxo/DI/commodities/opções sem números}
- **ENTÃO:** {viés e cautelas sem números}
- **Confirmação:** {gatilho qualitativo}
- **Invalidação:** {gatilho qualitativo}

**Cenário 2 (WDO Baixista — BRL Fortalece):**
- **SE:** {condição incluindo commodities BR + China}
- **ENTÃO:** {viés}
- **Confirmação:** {gatilho}
- **Invalidação:** {gatilho}

**Cenário 3 (Range/Lateral):**
- **SE:** {condição}
- **ENTÃO:** {viés}

**[Repetir estrutura para WIN se necessário, incluindo peso commodities IBOV]**

---

## 12) TABELA RESUMO NÍVEIS-CHAVE (SEM NÚMEROS NO CORPO)

```markdown
| Métrica                   | Nível         | Importância                |
|---------------------------|---------------|----------------------------|
| Máxima diária projetada   | (ver ANEXO A) | Limite superior estatístico|
| Call Wall                 | (ver ANEXO A) | Resistência estrutural     |
| Resistência GEX #1        | (ver ANEXO A) | Gravidade de preço         |
| Preço referência (WDO)    | (ver ANEXO A) | Referência atual           |
| Suporte GEX #1            | (ver ANEXO A) | Gravidade de preço         |
| Put Wall                  | (ver ANEXO A) | Suporte estrutural         |
| Mínima diária projetada   | (ver ANEXO A) | Limite inferior estatístico|
```

---

## 13) LEGENDA DE TERMOS TÉCNICOS

**WDO / DOLFUT:** Dólar Futuro na B3 (USD/BRL futuro)  
**WIN:** Mini Ibovespa Futuro na B3  
**DI:** Contratos de juros (curva de juros BR)  
**ABRE/FECHA (DI):** ABRE = juros sobem; FECHA = juros caem  
**STEEPEN/FLATTEN:** Curva inclina (longos sobem mais) / achata  
**VIX:** Proxy de estresse de volatilidade EUA  
**DXY:** Índice do dólar (força do USD)  
**FXI:** iShares China Large-Cap (proxy demanda China)  
**GEX (Gamma Exposure):** Exposição gamma agregada; influencia força dealers  
**Gamma Flip:** Nível onde regime muda (positivo vs negativo)  
**Gamma Positivo:** Dealers vendem altas/compram quedas → vol suprimida  
**Gamma Negativo:** Dealers compram altas/vendem quedas → vol amplificada  
**Call Wall / Put Wall:** Strikes com concentração que atuam como barreiras  
**OI (Open Interest):** Posições em aberto  
**IV:** Volatilidade implícita  
**EWZ/EWZS:** ETFs de Brasil (large/small); proxy fluxo estrangeiro  
**VXEWZ/VXBR:** Volatilidade implícita/risco Brasil  
**Risk-on / Risk-off:** Apetite a risco vs fuga para segurança  
**CDS:** Credit Default Swap (proteção contra default)  
**Spread:** Diferença entre dois instrumentos  
**🆕 Balança Comercial:** Export - Import (superávit = entrada USD)  
**🆕 TSF (Total Social Financing):** Crédito agregado China  

---

## 14) DISCLAIMER + AUTOR (OBRIGATÓRIO)

**Autor:** Ednilson Szeskoski dos Santos  
**Formação:** Engenheiro Eletricista e Engenheiro de Segurança do Trabalho  
**Atividade:** Trader, Programador (hobby) | Desenvolvedor de Estratégias  

Proibida a reprodução ou uso comercial sem autorização expressa do autor.

---

**Obrigado por ler este relatório!**  
Não deixe de evoluir jamais! Deus te abençoe e proteja seus trades, seu patrimônio e sua família.  
Confirme os dados, relatório gerado com apoio de IA, pode conter erros.

---

## METADADOS PARA PROCESSAMENTO DOWNSTREAM (NotebookLM / Telegram)

**[Este bloco é para extração; manter bem estruturado]**

**DATA_PACK_SUMMARY:**
- Data do relatório: {DD/MM/AAAA}
- Carimbo de dados: {HH:MM BRT}
- Convicção do sistema: {ALTA/MÉDIA/BAIXA}
- Fontes críticas: CSV={OK/N/A} | DI={OK/N/A} | Opções={OK/N/A} | Calendário={OK/N/A} | Web={ON/OFF}
- 🆕 China proxies: FXI={OK/N/A} | CSI300={OK/N/A}

**VIÉS_CONSOLIDADO:**
- WIN_30_90m: {altista/baixista/neutro}
- WIN_DIA: {altista/baixista/neutro}
- WDO_30_90m: {altista/baixista/neutro}
- WDO_DIA: {altista/baixista/neutro}
- SENTIMENTO: {Risk-On/Risk-Off/Misto/Cautela}
- DRIVER_DOMINANTE: {texto curto}
- 🆕 CHINA_DEMAND: {forte/fraco/neutro}
- 🆕 BALANÇA_BR: {superavitária/deficitária/neutra}

**DRIVER_OCULTO_ZAR (NÃO exibir no corpo institucional):**
- USD/ZAR: {↑/↓/≈/N/A}
- LEITURA: {Fluxo favorável em Pares Emergentes sustenta o Real / Pressão em Pares Emergentes contamina o BRL / Viés baseado em DXY e Risco BR}

**NÍVEIS_CRÍTICOS_WDO (para NotebookLM):**
- GAMMA_FLIP: {valor ou N/A}
- CALL_WALL: {valor ou N/A}
- PUT_WALL: {valor ou N/A}
- TOP_GEX_1: {valor ou N/A}
- TOP_GEX_2: {valor ou N/A}

**AGENDA_TOP3_BRT:**
- {HH:MM} | {Evento} | {Importância}
- {HH:MM} | {Evento} | {Importância}
- {HH:MM} | {Evento} | {Importância}

**🆕 COMMODITIES_BRASIL_KEY:**
- Soja: {↑/↓/≈} | Minério: {↑/↓/≈} | Petróleo: {↑/↓/≈}
- Impacto Balança: {positivo/negativo/neutro}

---

## [FIM DO CORPO INSTITUCIONAL]
```

---

# ═══════════════════════════════════════════════════════════════
# PARTE IX: VALIDAÇÃO & FECHAMENTO
# ═══════════════════════════════════════════════════════════════

## [DAILY_VALIDATION_CHECKLIST]

### ✅ VALIDAÇÃO DO PROCESSAMENTO DIÁRIO

```markdown
---

## ✓ VALIDAÇÃO DO PROCESSAMENTO DIÁRIO

**Data:** {DD/MM/AAAA}  
**Horário de Processamento:** {HH:MM BRT}  

### 📊 CSV WATCHLIST:
→ Total de ativos processados: {X}  
→ Commodities identificadas: {Y} / {14 esperados}  
   └─ Lista: {Minério, WTI, Brent, Ouro, Prata, Cobre, Soja, Farelo, Milho, Açúcar, Algodão, Laranja, Boi, Café}  
→ Ativos sem atualização: {Z}  
   └─ Detalhe: {listar tickers se >0}  

### 📈 CURVA DI (arquivo .xlsx):
→ Status: {✅ PROCESSADO / ⚠️ PARCIAL / ❌ INDISPONÍVEL}  
→ Buckets processados: Curto / Médio / Longo  
→ Variações: Curto={X bps} | Médio={Y bps} | Longo={Z bps}  
→ Shape identificado: {STEEPEN / FLATTEN / ≈}  
→ Tipo: {Bear/Bull Steepener/Flattener / N/A}  
→ Breadth: {AMPLA / MISTA / ESTÁVEL}  
→ DI Âncora: {código do contrato, ex: DI1F35}  

### 🎲 DASHBOARD GAMMA (PDF):
→ Status: {✅ PROCESSADO / ❌ INDISPONÍVEL}  
→ Ativo analisado: WDO  
→ Regime: {Gamma Positivo / Negativo}  
→ GEX: {Alto / Médio / Baixo}  
→ Range esperado: qualitativo  

### 📅 CALENDÁRIO ECONÔMICO (PDF):
→ Status: {✅ PROCESSADO / ❌ INDISPONÍVEL / 🔍 WEB BACKUP}  
→ Eventos listados: {N}  
→ Críticos (Alta importância): {N_críticos}  
   └─ Detalhe: {listar eventos críticos com horário BRT}  
→ Fonte: {Anexo PDF / Web Search}  

### 🌐 WEB SEARCH (complemento):
→ Status: {✅ ATIVO / ❌ NÃO USADO}  
→ Buscas realizadas: {N}  
→ Tópicos: {listar se >0}  
   └─ Notícias macro: {OK/N/A}  
   └─ Calendário: {OK/N/A}  
   └─ Dados críticos: {OK/N/A}  
   └─ 🆕 China específico: {OK/N/A}  

### 🆕 MÓDULOS BRASIL AVANÇADOS:
→ Brasil Produtor Commodities: {✅ ATIVO / ⚠️ PARCIAL / ❌ SKIP}  
   └─ Commodities analisadas: {Soja, Minério, Petróleo, Boi, Café, Açúcar}  
   └─ Impacto balança calculado: {SIM/NÃO}  
→ Sazonalidade: {✅ CONTEXTUALIZADO / ❌ SKIP}  
   └─ Padrão do mês identificado: {SIM/NÃO}  

### 🆕 MÓDULOS CHINA:
→ China Proxy: {✅ ATIVO / ⚠️ PARCIAL / ❌ SKIP}  
   └─ Ativos usados: {FXI, CSI300, HSI, etc}  
   └─ Correlação com commodities BR calculada: {SIM/NÃO}  

### 🆕 MÓDULOS GLOBAIS AVANÇADOS:
→ EM Flow Analysis: {✅ ATIVO / ⚠️ PARCIAL / ❌ SKIP}  
→ Global Rates Divergence: {✅ ATIVO / ⚠️ PARCIAL / ❌ SKIP}  
→ Risk On/Off Detector: {✅ ATIVO / ❌ SKIP}  
   └─ Score: {X.X / 10} → {RISK ON/OFF status}  
→ Carry Trade Monitor: {✅ ATIVO / ⚠️ PARCIAL / ❌ SKIP}  
→ Sector Rotation V2: {✅ ATIVO / ⚠️ PARCIAL / ❌ SKIP}  
   └─ Setores processados: {11/11 completo}  

### ⚠️ LACUNAS / CONFLITOS:
→ Status: {✅ NENHUM / ⚠️ {N} ITENS}  
→ Detalhe:  
   {listar cada lacuna ou conflito identificado}  

### 📊 STATUS GERAL:
→ {✅ PROCESSAMENTO COMPLETO / ⚠️ PROCESSAMENTO PARCIAL / ❌ FALHAS CRÍTICAS}  
→ Qualidade dos dados: {ALTA / MÉDIA / BAIXA}  
→ Confiabilidade do relatório: {ALTA / MÉDIA / BAIXA}  

---
```

---

## [BRAZIL_VALIDATION_CHECKLIST]

### 🇧🇷 VALIDAÇÃO ESPECÍFICA — MERCADO BRASILEIRO

```markdown
---

## 🇧🇷 VALIDAÇÃO ESPECÍFICA — MERCADO BRASILEIRO

**ATIVOS PRIMÁRIOS (operação):**
→ WDO (futuro USD/BRL): {✅ PROCESSADO / ⚠️ PROXY (USD/BRL spot) / ❌ AUSENTE}  
→ WIN (futuro IBOV): {✅ PROCESSADO / ⚠️ PROXY (IBOV spot) / ❌ AUSENTE}  
→ IBOV (índice): {✅ PROCESSADO / ❌ AUSENTE}  

**DRIVERS BRASIL:**
→ DI Curva: {✅ COMPLETO / ⚠️ PARCIAL / ❌ AUSENTE}  
→ CDS Brasil 5Y: {✅ PROCESSADO / ⚠️ PROXY (VXEWZ) / ❌ AUSENTE}  
→ EWZ (fluxo estrangeiro): {✅ PROCESSADO / ⚠️ PROXY (EEM) / ❌ AUSENTE}  

**🆕 BRASIL PRODUTOR:**
→ Commodities Brasil analisadas: {✅ COMPLETO / ⚠️ PARCIAL}  
   └─ Minério: {✅/❌} | Soja: {✅/❌} | Petróleo: {✅/❌}  
   └─ Boi: {✅/❌} | Café: {✅/❌} | Açúcar: {✅/❌}  
→ Impacto balança comercial: {✅ CALCULADO / ❌ NÃO CALCULADO}  

**🆕 CHINA DEMAND:**
→ FXI: {✅ PROCESSADO / ❌ AUSENTE}  
→ CSI300: {✅ PROCESSADO / ❌ AUSENTE}  
→ Correlação China × BR: {✅ CALCULADA / ❌ NÃO CALCULADA}  

**STATUS GERAL BRASIL:**
→ {✅ ANÁLISE COMPLETA / ⚠️ DADOS PARCIAIS / ❌ DADOS INSUFICIENTES}  
→ Qualidade para operar WDO: {ALTA / MÉDIA / BAIXA}  
→ Qualidade para operar WIN: {ALTA / MÉDIA / BAIXA}  

---
```

---

## [COVERAGE_CHECK_V2]

### 📋 CHECKLIST DE COBERTURA EXPANDIDO

```markdown
---

## 📋 COVERAGE CHECK — ATIVOS CRÍTICOS

**TIER 1 - OBRIGATÓRIO (falha = relatório incompleto):**
- [ ] WDO ou USD/BRL spot
- [ ] WIN ou IBOV
- [ ] DI Curva (arquivo) ou DDI
- [ ] CDS Brasil ou VXEWZ
- [ ] EWZ

**🆕 TIER 1.5 - CHINA (crítico para Brasil commodities):**
- [ ] FXI ou CSI300 (pelo menos 1)
- [ ] Minério Ferro (TIO ou SM58F)

**TIER 2 - IMPORTANTE (ausência = alertar):**
- [ ] DXY
- [ ] ES ou SPY
- [ ] VIX
- [ ] US10Y
- [ ] Soja (ZS)
- [ ] Petróleo (WTI ou Brent)

**TIER 3 - DESEJÁVEL (ausência = notar):**
- [ ] US2Y
- [ ] Curva 2s10s
- [ ] AUD/USD (carry)
- [ ] USD/MXN (EM proxy)
- [ ] USD/ZAR (EM proxy oculto)
- [ ] Setoriais XL*

**RESUMO:**
- Críticos faltando (TIER 1): {N}
- 🆕 China proxies faltando (TIER 1.5): {N}
- Importantes faltando (TIER 2): {N}
- Desejáveis faltando (TIER 3): {N}

**AÇÃO RECOMENDADA:**
{Se 0 críticos + 0 China → "Nenhuma, prosseguir"}
{Se 1-2 críticos OU China ausente → "Alertar usuário, reduzir convicção"}
{Se 3+ críticos → "Alerta severo, considerar adiar relatório"}

---
```

---

## [FINAL_SANITY_GATE_V2]

### 🔍 GATE FINAL EXPANDIDO (ANTES DE ENTREGAR)

**Checklist pré-entrega:**

1. **CORPO sem números proibidos?**
   - [ ] Varri todo o corpo institucional
   - [ ] Removi preços, yields, spreads, bps, pontos exatos
   - [ ] Mantive apenas datas, horários, tickers, seções, pesos %

2. **DATA_SHEET completo?**
   - [ ] Anexo A1 (Global) preenchido
   - [ ] Anexo A2 (Commodities + 🆕 Impacto Balança BR) preenchido
   - [ ] Anexo A3 (Brasil + DI) preenchido
   - [ ] Anexo A4 (Agenda) preenchido
   - [ ] Anexo A5 (Opções WDO) preenchido
   - [ ] 🆕 Anexo A6 (China Proxy) preenchido

3. **CSV Exaustivo?**
   - [ ] Todo ativo com ticker válido gerou sinal
   - [ ] Commodities obrigatórias aparecem (14 total)
   - [ ] 🆕 China proxies aparecem (FXI, CSI300)

4. **🆕 Brasil Produtor completo?**
   - [ ] Commodities BR analisadas (soja, minério, petróleo, boi, café, açúcar)
   - [ ] Impacto balança comercial calculado
   - [ ] Correlação com China mencionada

5. **🆕 China Demand analisado?**
   - [ ] FXI e/ou CSI300 processados
   - [ ] Correlação com commodities BR mencionada
   - [ ] Impacto em WDO/WIN explicado

6. **Seções mínimas presentes?**
   - [ ] TÍTULO
   - [ ] PAINEL 60 SEGUNDOS
   - [ ] FATOS OBSERVADOS
   - [ ] 🆕 BRASIL PRODUTOR
   - [ ] BRASIL (DI + Risco + Fluxo)
   - [ ] OPÇÕES/GAMMA WDO
   - [ ] TESE CENTRAL
   - [ ] CENÁRIOS SE-ENTÃO
   - [ ] VALIDAÇÃO
   - [ ] GLOSSÁRIO
   - [ ] DISCLAIMER/AUTOR
   - [ ] METADADOS
   - [ ] DATA_SHEET completo

7. **Convicção declarada?**
   - [ ] ALTA/MÉDIA/BAIXA presente no título
   - [ ] Justificativa clara
   - [ ] 🆕 Reduzida se China proxies ausentes

8. **Entrega limpa?**
   - [ ] A partir de "## TÍTULO"
   - [ ] Não repetir instruções
   - [ ] Formatação consistente

---

**SE TODOS OS ITENS OK:** ✅ PROSSEGUIR COM ENTREGA

**SE ALGUM ITEM FALHOU:** ⚠️ CORRIGIR ANTES DE ENTREGAR

---

# ═══════════════════════════════════════════════════════════════
# FIM DA PARTE 2 — CONTINUA NA PARTE 3
# ═══════════════════════════════════════════════════════════════
