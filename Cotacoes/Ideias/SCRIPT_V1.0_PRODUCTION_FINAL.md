# 🌐 MÓDULO DE COLETA DE DADOS (SOURCE CONNECTED) — V1.0 PRODUCTION

**VERSÃO DE PRODUÇÃO** - Otimizado para uso diário em chat
CSV READY + ANTI-IGNORE + DATA SHEET + OPTIONS/GAMMA + CALENDÁRIO + EM FLOW + SECTOR ROTATION V2

* MACRO THEMES + NEWS/POLÍTICA + ROTAÇÃO SETORIAL V2.0 + MATRIZ WIN/WDO
* SENTIMENTO (NLP) + CALL/PUT WALL + MATRIZ REAÇÃO CALENDÁRIO  
* EM FLOW ANALYSIS + GLOBAL RATES DIVERGENCE + RISK ON/OFF DETECTOR
* TREASURY CURVE ANALYSIS (US) + CARRY TRADE MONITOR
* GLOSSÁRIO

**CHANGELOG V1.2 → V1.0:**
- ✅ Corrigido sistema de detecção de ativos (dual-key matching aprimorado)
- ✅ Confirmado cobertura de 17 ativos críticos (EWZ, FXI, XLK, XLF, XLE, Bund, Gilt, etc)
- 🆕 Novo: [EM_FLOW_ANALYSIS_MODULE] - Rastreia fluxo institucional para emergentes
- 🆕 Novo: [GLOBAL_RATES_DIVERGENCE_MODULE] - Analisa spreads de treasuries globais
- 🆕 Novo: [RISK_ON_OFF_DETECTOR] - Score quantitativo de regime de mercado
- 🆕 Novo: [US_TREASURY_CURVE_MODULE] - Análise de curva completa (TLT/IEF/SHY quando disponíveis)
- 🆕 Novo: [CARRY_TRADE_MONITOR] - Monitora AUD/USD, NZD/USD, USD/JPY
- 🆕 Aprimorado: [SECTOR_ROTATION_MODULE] V2.0 - Agora funcional com XLF/XLK/XLE/XLV/XLY
- 🆕 Aprimorado: [DAILY_VALIDATION_CHECKLIST] - Checklist explícito ao final
- 🆕 Aprimorado: [COVERAGE_CHECK] - Identifica ativos críticos ausentes
- 🔧 Simplificado: [DAILY_RUN_COMMAND] - Comando mais curto para uso diário

---

========================================================
0) COMANDO DIÁRIO SIMPLIFICADO (EXECUÇÃO IMEDIATA)
=====================================

[DAILY_RUN_COMMAND_V1.0]

**MODO RÁPIDO - Cole este comando diariamente:**

```
Data: {DD/MM/AAAA}
Anexos: ✅ CSV | ✅ DI | ✅ Dashboard | ✅ Calendário

Executar Script V1.0:
→ Gerar RESUMO EXECUTIVO + RELATÓRIO COMPLETO + DATA_SHEET + VALIDAÇÃO
→ Aplicar todos os módulos (EM Flow, Rates Divergence, Risk On/Off, Sector Rotation V2)
→ Marcar lacunas/conflitos se houver
```

**OU MODO DETALHADO (se precisar especificar algo):**

"Use o script V1.0 abaixo. Aplique [ATTACHMENTS_FIRST_POLICY]:

(1) Extraia primeiro tudo dos anexos (CSV + curva DI + dashboard gamma + calendário + textos).
(2) Aplique [CSV_EXHAUSTIVENESS_RULE] para garantir NENHUMA linha relevante ignorada.
(3) Aplique [COMMODITIES_MUST_APPEAR_RULE] para garantir TODAS commodities no relatório.
(4) Use curva DI para [DI_BUCKET_RULES] (Curto/Médio/Longo + Shape + Breadth).
(5) Use dashboard gamma para [OPTIONS_GAMMA_MODULE] + [OPTIONS_LEVELS_MODULE] (WDO).
(6) Use calendário para [ECONOMIC_DATA_MODULE] + [TRADE_REACTION_MATRIX_MODULE].
(7) Use notícias para [NEWS_POLITICAL_RISK_MODULE] + [SENTIMENT_NLP_MODULE].
(8) 🆕 Aplique [EM_FLOW_ANALYSIS_MODULE] usando EWZ, FXI, EEM do CSV.
(9) 🆕 Aplique [GLOBAL_RATES_DIVERGENCE_MODULE] usando US10Y, DE10Y, GB10Y, IT10Y.
(10) 🆕 Aplique [RISK_ON_OFF_DETECTOR] para score de regime.
(11) 🆕 Aplique [CARRY_TRADE_MONITOR] se AUD/USD, NZD/USD disponíveis.
(12) Aplique [SECTOR_ROTATION_MODULE_V2] usando XLF, XLK, XLE, XLV, XLY (agora funcionando!).
(13) Aplique [MACRO_THEME_MODULE], [IMPACT_MATRIX_WIN_WDO], [CORPORATE_FLOW_MODULE].
(14) Preencha [DATA_SHEET_NUMERICO] com valores exatos (para Telegram).
(15) Ao final, gere [DAILY_VALIDATION_CHECKLIST] explícito.

PROIBIDO usar números de preço/yield/spread/pontos no CORPO institucional
(exceto datas, horários, numeração de seções e códigos/tickers).
Entregar SOMENTE o relatório final (não repetir instruções)."

========================================================

1. POLÍTICA OPERACIONAL: ANEXOS (CSV+DI+DASHBOARD+CALENDÁRIO) → WEB → N/A
   ========================================================

[ATTACHMENTS_FIRST_POLICY]

1. PRIORIDADE ABSOLUTA:

   Ler e extrair dados dos ANEXOS:

   * CSV de Pré-Mercado (fonte primária para ativos)
   * Excel/print da curva DI (fonte primária para DI)
   * Dashboard de opções/gamma (fonte primária para WDO opções)
   * Calendário econômico em PDF/print/texto (fonte primária para agenda)
   * Outros briefs/textos colados (morning call, notícias, resumos macro/política)

2. FONTES:

* Se o ativo estiver no CSV, o CSV é fonte primária para esse ativo.
* Se o ativo estiver em print/texto (brief), o print/texto é fonte primária para os ativos nele contidos.
* Se houver arquivo de curva DI, ele é fonte primária para DI/DIc.
* Se houver calendário econômico anexado, ele é fonte primária para o [ECONOMIC_DATA_MODULE].
* Se houver bloco de notícias/manchetes anexado, ele é fonte primária para [NEWS_POLITICAL_RISK_MODULE] e [SENTIMENT_NLP_MODULE].
* Se houver dashboard de opções/gamma anexado, ele é fonte primária para [OPTIONS_GAMMA_MODULE] + [OPTIONS_LEVELS_MODULE].

3. CONVERSÃO DE NÚMEROS PARA SINAIS:

* Converter qualquer número visto no anexo em **SINAIS para o CORPO INSTITUCIONAL**:
  ↑ / ↓ / ≈ ; ALARGA/ESTREITA ; ABRE/FECHA ; STEEPEN/FLATTEN;
  "próximo"/"distante" (para níveis de opções); "alto/baixo/neutro" (para P/C etc.)
  mas **preservar internamente os valores numéricos** para uso exclusivo no **ANEXO A — DATA SHEET (NUMÉRICO)**.

* PROIBIDO reportar valores numéricos exatos de preço/yield/spread/pontos no CORPO institucional.

4. REGRA CSV (OBRIGATÓRIA):

[CSV_EXHAUSTIVENESS_RULE]

* Identificação por CÓDIGO/TICKER **e** NOME (ver [DUAL_KEY_MATCHING_RULE] aprimorado).
* Em duplicidade (DXY vs USDIDX; DJI vs YM; NDX vs NQ; WDO vs USDBRL spot etc.):

  * escolher PRIMÁRIO por (a) atualização, (b) liquidez, (c) instrumento principal
  * registrar os demais como FALLBACK (ver [CANONICAL_KEYS_RULE] + [CONTRACT_FAMILY_RULE]).
* Se Hora/Carimbo estiver vazio ou antigo: marcar SEM ATUALIZAÇÃO (não é erro).

🆕 **APRIMORAMENTO V1.0 - DUAL KEY MATCHING:**

[DUAL_KEY_MATCHING_RULE_V2]

Sistema de matching aprimorado para evitar falsos negativos:

**Nível 1 - Match Exato:**
- Ticker exato (ex: "EWZ" encontra linha com Symbol="EWZ")
- Nome exato (ex: "iShares MSCI Brazil ETF" encontra linha com Name contendo essa string)

**Nível 2 - Match Parcial (se Nível 1 falhar):**
- Ticker contido no Symbol (ex: buscar "MXN" encontra "USD/MXN - US Dollar Mexican Peso")
- Keywords do nome contidos no Name (ex: buscar "Brazil ETF" encontra "iShares MSCI Brazil ETF")

**Nível 3 - Match por Família (se Nível 1 e 2 falharem):**
- Contratos futuros da mesma família (ex: "DI" encontra "DIJc1", "DIJc2", etc)
- Instrumentos relacionados (ex: buscar "Bund" encontra "Germany 10-Year (DE10YT=RR)")

**Registro de Detecção:**
Ao processar CSV, a IA deve internamente registrar:
```
Ativo solicitado: EWZ
Match encontrado: Nível 1 - Exato
Linha CSV: "iShares MSCI Brazil ETF","EWZ","NYSE",...
Status: ✅ ENCONTRADO
```

Se não encontrar após 3 níveis:
```
Ativo solicitado: XYZ123
Match encontrado: NENHUM
Status: ❌ AUSENTE (marcar em COVERAGE_CHECK)
```

5. CALENDÁRIO ECONÔMICO:

* Se houver **calendário econômico em PDF/print/texto**, ele é **fonte principal** do [ECONOMIC_DATA_MODULE] e da tabela `A4) AGENDA` + [TRADE_REACTION_MATRIX_MODULE].
* Web só é usada como backup se:

  * não houver calendário anexado, OU
  * houver dúvida de leitura (ex.: campo ilegível).

6. WEB COMO COMPLEMENTO:

* Se item CRÍTICO do [OBSERVED_FACTS] não estiver em anexos, buscar na web só para preencher a lacuna.
* Não substituir dado de anexo por web, exceto se anexo estiver SEM ATUALIZAÇÃO e o item for CRÍTICO (registrar CONFLITO/SEM ATUALIZAÇÃO).
* Aplicar sempre [NO_NUMERIC_COPY_FROM_WEB].

7. SE AINDA ASSIM NÃO ENCONTRAR:

* Marcar "N/A" ou "SEM ATUALIZAÇÃO" no campo relevante.
* Registrar ausência em [COVERAGE_CHECK].
* Não inventar ou inferir valores.

========================================================

2. REGRAS CRÍTICAS E MÓDULOS DE ANÁLISE
   ========================================================

[COMMODITIES_MUST_APPEAR_RULE]

**OBRIGATÓRIO:** Todas as commodities presentes no CSV **devem aparecer no relatório**.

Lista de verificação (checar presença no CSV e garantir inclusão):
- Minério de Ferro (TIO / SM58F)
- WTI / Brent (petróleo)
- Ouro / Prata / Cobre
- Soja / Farelo / Milho
- Açúcar / Algodão / Laranja / Boi / Café

Se commodity estiver no CSV mas não aparecer no relatório = FALHA CRÍTICA.

---

[DI_BUCKET_RULES]

Processamento da curva DI (fonte: arquivo .xlsx da Profit Pro ou similar):

**Buckets:**
- DI Curto: Até Dez/2027
- DI Médio: Jan/2028 até Dez/2031  
- DI Longo: Jan/2032 em diante
- DI Âncora: Contrato de vencimento mais longo (identificar código, ex: DI1F35)

**Cálculos:**
- Nível médio de cada bucket (média aritmética dos contratos)
- Variação média em bps
- Shape: STEEPEN (longo sobe mais que curto) / FLATTEN (curto sobe mais que longo) / ≈ (paralelo)
- Tipo: Bear Steepener (todos sobem, longo mais) / Bull Steepener (todos caem, curto mais) / Bear Flattener / Bull Flattener
- Breadth: ABERTURA AMPLA (maioria abrindo) / FECHAMENTO AMPLO (maioria fechando) / MISTO / ESTÁVEL

**Output Qualitativo (para corpo do relatório):**
"Curva DI em {STEEPEN/FLATTEN}, com {breadth}. Movimento caracteriza {tipo de steepener/flattener}."

**Output Numérico (para DATA_SHEET):**
Tabela com níveis e variações por bucket.

---

🆕 [US_TREASURY_CURVE_MODULE]

**NOVO MÓDULO V1.0** - Análise de curva de treasuries dos EUA

**Fonte:** CSV (se disponíveis TLT, IEF, SHY) ou web search para US2Y, US5Y, US10Y, US30Y

**Análise:**
1. **Nível da Curva:** Yields em cada ponto (2Y, 5Y, 10Y, 30Y)
2. **Slope Crítico:** Spread 10Y-2Y (positivo=normal, negativo=inversão)
3. **Shape:** STEEPEN / FLATTEN / ≈
4. **Tipo:** Bear/Bull Steepener/Flattener (igual lógica DI)
5. **Comparação com DI:** Identificar divergência Brasil vs EUA

**Sinais para WDO:**
- US Treasury STEEPENING (yields subindo, longo mais) → USD forte → WDO sobe
- US Treasury FLATTENING (yields caindo, curto mais) → Ambíguo (depende do driver)
- Inversão 10Y-2Y crescente → recessão → risk off → USD pode fortalecer

**Output para Corpo:**
"Curva US em {shape}, com 10Y-2Y em {positivo/negativo/neutro}. {Interpretação curta}."

**Output para DATA_SHEET:**
| Ponto | Yield | Var (bps) | Fonte |
|-------|-------|-----------|-------|
| 2Y    | X.XX% | +XX       | CSV/Web |
| 10Y   | X.XX% | +XX       | CSV/Web |
| 30Y   | X.XX% | +XX       | CSV/Web |
| 10Y-2Y Spread | XX bps | +X | Calc |

---

# SCRIPT V1.0 - PARTE 2: NOVOS MÓDULOS

========================================================
🆕 NOVOS MÓDULOS V1.0 (FOCO EM USD/BRL TRADING)
========================================================

[EM_FLOW_ANALYSIS_MODULE]

**NOVO - Análise de Fluxo Institucional para Emergentes**

**Objetivo:** Detectar fluxo de capital estrangeiro para/de mercados emergentes (foco Brasil)

**Ativos Requeridos (do CSV):**
- EWZ (iShares MSCI Brazil ETF) - CRÍTICO
- FXI (iShares China Large-Cap ETF)
- EEM (iShares MSCI Emerging Markets ETF)
- VWO (Vanguard FTSE EM ETF) - opcional

**Análise:**

1. **EWZ vs IBOV Divergence:**
   - EWZ ↑ forte + IBOV ↑ fraco = Entrada de estrangeiro via ETF (bullish BRL)
   - EWZ ↓ forte + IBOV ↓ fraco = Saída de estrangeiro (bearish BRL)
   - EWZ ↑ + IBOV ↓ = Raro, investigar (possível arb ou posicionamento tático)
   - EWZ ↓ + IBOV ↑ = Doméstico comprando, estrangeiro vendendo (neutro/bearish BRL)

2. **EWZ vs WDO Correlation:**
   - Correlação típica: -0.6 (EWZ sobe → WDO cai)
   - Quebra de correlação = sinal importante

3. **China (FXI) como Proxy:**
   - China forte (FXI ↑) + commodities ↑ → geralmente bullish para Brasil
   - China fraca (FXI ↓) → bearish para commodities → bearish BRL

4. **Broad EM (EEM) como Contexto:**
   - EEM ↑ forte = risk on amplo para EMs
   - EEM ↓ + EWZ resiliente = Brasil descolando (positivo)
   - EEM ↑ + EWZ fraco = Brasil underperformance (negativo)

**Sinais para WDO:**
- EWZ ↓↓ + EEM ↓ + FXI ↓ = **Fuga forte de EMs** → WDO tende a subir
- EWZ ↑↑ + EEM ↑ + FXI ↑ = **Entrada forte em EMs** → WDO tende a cair
- EWZ ↓ mas IBOV ↑ = **Saída seletiva** → atenção, pode pressionar WDO

**Output para Corpo:**
"Fluxo EM: {Entrada/Saída/Neutro}. EWZ {↑/↓/≈} vs IBOV {↑/↓/≈}, indicando {interpretação}. China (FXI) {↑/↓/≈} {suporta/pressiona} tema commodities."

**Output para DATA_SHEET:**
| ETF EM | Var (%) | vs Benchmark | Interpretação |
|--------|---------|--------------|---------------|
| EWZ    | +X.XX%  | vs IBOV +Y.YY% | Entrada/Saída/Neutro |
| FXI    | +X.XX%  | vs HSI +Y.YY%  | {contexto} |
| EEM    | +X.XX%  | Broad EM       | {contexto} |

---

[GLOBAL_RATES_DIVERGENCE_MODULE]

**NOVO - Divergência de Taxas Globais**

**Objetivo:** Identificar divergências de política monetária que afetam fluxos de FX

**Ativos Requeridos (do CSV):**
- US10Y (US 10-Year Treasury)
- DE10Y (Germany 10-Year / Bund) - ✅ DISPONÍVEL
- GB10Y (UK 10-Year / Gilt) - ✅ DISPONÍVEL  
- IT10Y (Italy 10-Year / BTP) - ✅ DISPONÍVEL
- JP10Y (Japan 10-Year) - ✅ DISPONÍVEL
- BR10Y (Brazil 10-Year) - verificar disponibilidade
- AU10Y (Australia 10-Year) - adicionar

**Spreads Críticos:**

1. **US10Y - DE10Y (Fed vs ECB):**
   - Spread alargando → USD forte vs EUR
   - Spread estreitando → USD fraco vs EUR
   - Típico: 150-250 bps (positivo = US maior)

2. **DE10Y - IT10Y (Core vs Periférico Europa):**
   - Spread alargando → Stress na Europa → EUR fraco
   - Spread estreitando → Confiança voltando → EUR forte
   - Típico: 100-200 bps

3. **US10Y - JP10Y (Carry Trade USD/JPY):**
   - Spread alto → Carry trade favorável → JPY fraco
   - Spread estreitando → Carry unwinding → JPY forte
   - Típico: 300-400 bps

4. **US10Y - BR10Y (Prêmio Brasil):**
   - Spread alto → Risco Brasil elevado
   - Spread estreitando → Melhora percepção
   - Típico: 600-800 bps (mais volátil)

5. **US10Y - AU10Y (Carry AUD/USD):**
   - Spread negativo (AU > US) → AUD forte
   - Spread positivo → AUD fraco

**Análise de Movimento:**
- Spread movendo por US subindo → USD forte (tightening Fed)
- Spread movendo por DE caindo → EUR fraco (dovish ECB)
- Movimento simultâneo (paralelo) → flight to quality ou risk on global

**Sinais para WDO:**
- US10Y ↑↑ isolado (spreads alargando vs todos) → **USD muito forte** → WDO sobe forte
- Spreads estreitando vs EMs (BR10Y caindo) → Fluxo para Brasil → WDO cai
- DE-IT alargando + US-DE alargando → **Stress global** → USD safe haven → WDO sobe

**Output para Corpo:**
"Spreads de taxas: US-DE em {alargamento/estreitamento}, sinalizando {interpretação}. Prêmio Brasil (US-BR) {↑/↓/≈}."

**Output para DATA_SHEET:**
| Spread | Nível (bps) | Var (bps) | Interpretação |
|--------|-------------|-----------|---------------|
| US10Y - DE10Y | XXX | +YY | Fed vs ECB divergence |
| DE10Y - IT10Y | XXX | +YY | Euro periph risk |
| US10Y - JP10Y | XXX | +YY | JPY carry |
| US10Y - BR10Y | XXX | +YY | Brazil premium |

---

[RISK_ON_OFF_DETECTOR]

**NOVO - Detector Quantitativo de Regime de Mercado**

**Objetivo:** Scoring objetivo de risk on/off para auxiliar decisão em WDO

**Inputs (todos do CSV quando disponíveis):**

**Categoria 1 - Equities (peso 30%):**
- SPY / ES (S&P 500): ↑ = +1 | ↓ = -1
- QQQ / NQ (Nasdaq): ↑ = +1 | ↓ = -1 (peso 1.2x se tech liderando)
- EEM (Emergentes): ↑ = +1 | ↓ = -1

**Categoria 2 - Volatilidade (peso 20%):**
- VIX: ↓ = +1 | ↑ = -1
- VVIX: ↓ = +0.5 | ↑ = -0.5

**Categoria 3 - Safe Havens (peso 15%):**
- TLT (Treasuries): ↓ = +1 | ↑ = -1 (ambíguo, contextual)
- GLD (Gold): ↓ = +1 | ↑ = -1 (geralmente)
- JPY: ↓ vs USD = +1 | ↑ vs USD = -1

**Categoria 4 - Setoriais (peso 20%):**
- Defensivos (XLU + XLP): ↓ = +1 | ↑ = -1
- Cíclicos (XLY + XLI + XLE): ↑ = +1 | ↓ = -1

**Categoria 5 - Carry & EM FX (peso 15%):**
- AUD/USD: ↑ = +1 | ↓ = -1
- EWZ: ↑ = +1 | ↓ = -1

**Cálculo do Score:**
```
Score = Σ(Categoria_i × Peso_i)
Range: -10 (max risk off) a +10 (max risk on)
```

**Interpretação:**
- Score > +5: **RISK ON FORTE** → WDO tende a cair (fluxo para EMs, USD fraco)
- Score +2 a +5: **RISK ON MODERADO** → WDO neutro/leve baixa
- Score -2 a +2: **NEUTRO/MISTO** → WDO segue fatores idiossincráticos
- Score -2 a -5: **RISK OFF MODERADO** → WDO neutro/leve alta
- Score < -5: **RISK OFF FORTE** → WDO tende a subir (fuga para USD)

**Nuances Importantes:**
1. Se TLT ↑ + GLD ↑ + JPY ↑ simultaneamente = **Risk off extremo** (sobrepõe score)
2. Se Defensivos lideram mas VIX baixo = falso sinal (ignorar defensivos)
3. Se AUD ↓ forte (>1%) isolado = carry unwinding específico (peso 2x)

**Output para Corpo:**
"Regime: {RISK ON FORTE / MODERADO / NEUTRO / RISK OFF MODERADO / FORTE} (Score: {X.X}/10). {Principais drivers}."

**Output para DATA_SHEET:**
| Categoria | Contribuição | Detalhe |
|-----------|--------------|---------|
| Equities  | +X.X         | SPY ↑, NQ ↑, EEM ↑ |
| Vol       | +X.X         | VIX ↓ |
| Safe Havens | -X.X       | TLT ↑ (ambíguo) |
| Setoriais | +X.X         | Cíclicos > Defensivos |
| Carry/EM  | +X.X         | AUD ↑, EWZ ↑ |
| **SCORE TOTAL** | **+X.X** | **RISK ON MODERADO** |

---

[CARRY_TRADE_MONITOR]

**NOVO - Monitor de Carry Trade**

**Objetivo:** Identificar movimentos de carry trade que precedem volatilidade em EMs

**Pares Principais (do CSV):**
- USD/JPY (principal carry funding currency)
- AUD/USD (principal carry target)
- NZD/USD (carry target volátil)
- USD/BRL (nosso alvo - WDO)

**Pares Sintéticos (calcular se disponível):**
- AUD/JPY = AUD/USD × USD/JPY (key barometer)
- NZD/JPY = NZD/USD × USD/JPY

**Análise:**

1. **Carry Unwinding Detection:**
   - AUD/JPY caindo >1% intraday = unwinding forte → risk off → WDO sobe
   - USD/JPY caindo + AUD/USD caindo = duplo unwinding → risk off severo
   - NZD mais volátil que AUD = primeiro a reagir (early warning)

2. **Carry Build-up Detection:**
   - AUD/JPY subindo steady = carry building → risk on → WDO cai
   - USD/JPY subindo + yields US subindo = ambiente favorável carry

3. **Divergências:**
   - AUD/USD ↑ mas USD/JPY ↓ = força AUD pura (commodities?) → investigar
   - USD/JPY ↑ mas AUD/USD ↓ = fraqueza AUD isolada → commodities fracos?

**Thresholds de Alerta:**
- AUD/JPY: >±1.0% intraday = movimento significativo
- USD/JPY: >±0.8% intraday = movimento significativo
- Correlação AUD/USD com USD/BRL: típica -0.6 a -0.8

**Sinais para WDO:**
- AUD/JPY ↓↓ + VIX ↑ = **Carry unwinding + risk off** → WDO ↑↑ (forte)
- AUD/JPY ↑ + commodities ↑ = **Risk on + commodity rally** → WDO ↓
- USD/JPY ↑ isolado (yields US subindo) = USD forte broad → WDO ↑

**Output para Corpo:**
"Carry trade: {Building/Unwinding/Neutro}. AUD/JPY {↑/↓/≈}, indicando {interpretação}. USD/JPY {↑/↓/≈} por {yields/risk sentiment}."

**Output para DATA_SHEET:**
| Par | Var (%) | Nível | Sinal |
|-----|---------|-------|-------|
| USD/JPY | +X.XX% | XXX.XX | {interpretação} |
| AUD/USD | +X.XX% | 0.XXXX | {interpretação} |
| NZD/USD | +X.XX% | 0.XXXX | {early warning} |
| AUD/JPY* | +X.XX% | XX.XX | **{Carry status}** |

*calculado: AUD/USD × USD/JPY

---

[SECTOR_ROTATION_MODULE_V2]

**APRIMORADO V1.0 - Agora Funcional!**

**Ativos Confirmados no CSV:**
- ✅ XLF (Financials)
- ✅ XLK (Technology)
- ✅ XLE (Energy)
- ✅ XLV (Healthcare)
- ✅ XLY (Consumer Discretionary)

**Ativos Ainda Faltando (adicionar se possível):**
- ⏳ XLU (Utilities) - PRIORITÁRIO
- ⏳ XLP (Consumer Staples) - PRIORITÁRIO
- ⏳ XLI (Industrials)
- ⏳ XLC (Communication Services)
- ⏳ XLB (Materials)
- ⏳ XLRE (Real Estate)

**Análise (com 5 setores disponíveis):**

1. **Ranking Intraday:**
   Ordenar os 5 setores por performance (do melhor para pior):
   - Líder: {XL?} (+X.XX%)
   - 2º: {XL?} (+X.XX%)
   - ...
   - Pior: {XL?} (-X.XX%)

2. **Classificação de Regime:**
   
   **RISK ON (cíclicos liderando):**
   - XLY (Consumer Disc) no top 2 + XLE no top 3 = Risk On
   - XLK (Tech) liderando forte (>+1%) = Growth-led risk on
   
   **RISK OFF (defensivos liderando):**
   - XLV (Healthcare) no top 2 = Moderado risk off
   - (Nota: sem XLU/XLP, análise defensiva parcial)
   
   **ROTAÇÃO PARA VALUE:**
   - XLF (Financials) liderando + XLK fraco = Value rotation
   - XLE liderando + XLK fraco = Commodity/value play

3. **Contextualização:**
   - XLE ↑ forte: linkar com WTI/Brent do CSV
   - XLK ↑ forte: linkar com QQQ/NQ (se disponível)
   - XLF ↑ forte: linkar com yields (se subindo, bancos beneficiados)

**Sinais para WDO:**
- XLY + XLE liderando (risk on cíclico) → geralmente WDO ↓
- XLV liderando + XLY fraco (defensive shift) → geralmente WDO ↑
- XLF forte + yields subindo → USD forte → WDO ↑
- XLK > +1% isolado → tech rally → pode ser WDO ↓ (risk on) ou neutro

**Output para Corpo:**
"Rotação setorial: {Liderança: setor}. Regime caracteriza {RISK ON / RISK OFF / VALUE ROTATION / GROWTH}. {Contexto adicional}."

**Output para DATA_SHEET:**
| Setor | Ticker | Var (%) | Rank | Categoria |
|-------|--------|---------|------|-----------|
| {Nome} | XL? | +X.XX% | 1º | Cíclico/Defensivo/Growth |
| {Nome} | XL? | +X.XX% | 2º | ... |
| ... | ... | ... | ... | ... |

**Interpretação final:**
"{Regime detectado} sugere {bias para WDO}."

---


========================================================
CONTINUAÇÃO DOS MÓDULOS ORIGINAIS (mantidos do V1.2)
========================================================

[MACRO_THEME_MODULE]
[NEWS_POLITICAL_RISK_MODULE]
[SENTIMENT_NLP_MODULE]
[OPTIONS_GAMMA_MODULE]
[OPTIONS_LEVELS_MODULE]
[ECONOMIC_DATA_MODULE]
[TRADE_REACTION_MATRIX_MODULE]
[IMPACT_MATRIX_WIN_WDO]
[CORPORATE_FLOW_MODULE]
[GLOSSARY_MODULE]

**NOTA:** Todos os módulos listados acima mantêm a especificação original do script V1.2.
Por brevidade, não estão replicados aqui, mas devem ser considerados ATIVOS e funcionais.
Consulte o script V1.2 original (linhas 600-1200) para detalhes completos destes módulos.

========================================================
🆕 VALIDAÇÃO E CHECKLIST FINAL (NOVO V1.0)
========================================================

[DAILY_VALIDATION_CHECKLIST]

**OBRIGATÓRIO** - Incluir ao final de CADA relatório:

```markdown
---

## ✓ VALIDAÇÃO DO PROCESSAMENTO DIÁRIO

**Data:** {DD/MM/AAAA}
**Horário de Processamento:** {HH:MM BRT}

### 📊 CSV WATCHLIST:
→ Total de ativos processados: {X}
→ Commodities identificadas: {Y} / {Y esperados}
   └─ Lista: {Minério, WTI, Brent, Ouro, Prata, Cobre, Soja, Farelo, Milho, Açúcar, Algodão, Laranja, Boi, Café}
→ Ativos sem atualização: {Z}
   └─ Detalhe: {listar tickers se >0}

### 📈 CURVA DI (arquivo .xlsx):
→ Status: {✅ PROCESSADO / ⚠️ PARCIAL / ❌ INDISPONÍVEL}
→ Buckets processados: {Curto / Médio / Longo}
→ Variações: Curto={X bps} | Médio={Y bps} | Longo={Z bps}
→ Shape identificado: {STEEPEN / FLATTEN / ≈}
→ Tipo: {Bear/Bull Steepener/Flattener / N/A}
→ Breadth: {AMPLA / MISTA / CONCENTRADA / ESTÁVEL}
→ DI Âncora: {código do contrato, ex: DI1F35}

### 🎲 DASHBOARD GAMMA (PDF):
→ Status: {✅ PROCESSADO / ❌ INDISPONÍVEL}
→ Ativo analisado: WDO
→ Spot: {valor} pts
→ Gamma Flip: {valor} pts (distância: {X} pts)
→ Regime: {Gamma Positivo / Negativo}
→ GEX: {Alto / Médio / Baixo}
→ Range esperado: {low}–{high} pts

### 📅 CALENDÁRIO ECONÔMICO (PDF):
→ Status: {✅ PROCESSADO / ❌ INDISPONÍVEL / 🔍 WEB BACKUP}
→ Eventos listados: {N}
→ Críticos (Alta importância): {N_críticos}
   └─ Detalhe: {listar eventos críticos com horário}
→ Fonte: {Anexo PDF / Web Search}

### 🆕 NOVOS MÓDULOS V1.0:
→ EM Flow Analysis: {✅ ATIVO / ⚠️ PARCIAL / ❌ SKIP}
   └─ Ativos usados: {EWZ, FXI, EEM disponíveis no CSV}
→ Global Rates Divergence: {✅ ATIVO / ⚠️ PARCIAL / ❌ SKIP}
   └─ Spreads calculados: {US-DE, DE-IT, US-JP, US-BR}
→ Risk On/Off Detector: {✅ ATIVO / ❌ SKIP}
   └─ Score: {X.X / 10} → {RISK ON/OFF status}
→ Carry Trade Monitor: {✅ ATIVO / ⚠️ PARCIAL / ❌ SKIP}
   └─ Pares monitorados: {USD/JPY, AUD/USD, NZD/USD}
→ Sector Rotation V2: {✅ ATIVO / ⚠️ PARCIAL / ❌ SKIP}
   └─ Setores processados: {5/11 setores} (XLF, XLK, XLE, XLV, XLY)
→ US Treasury Curve: {✅ ATIVO / ⚠️ PARCIAL / ❌ SKIP}
   └─ Pontos da curva: {2Y, 10Y, 30Y} | Slope 10Y-2Y: {X bps}

### 🌐 WEB SEARCH (complemento):
→ Buscas realizadas: {N}
→ Tópicos: {listar se >0}

### ⚠️ LACUNAS / CONFLITOS:
→ Status: {✅ NENHUM / ⚠️ {N} ITENS}
→ Detalhe:
   {listar cada lacuna ou conflito identificado}
   {ex: "US10Y - dado do CSV diverge de web em X bps"}
   {ex: "TLT não disponível no CSV, US Treasury Curve parcial"}

### 📊 STATUS GERAL:
→ {✅ PROCESSAMENTO COMPLETO / ⚠️ PROCESSAMENTO PARCIAL / ❌ FALHAS CRÍTICAS}
→ Qualidade dos dados: {ALTA / MÉDIA / BAIXA}
→ Confiabilidade do relatório: {ALTA / MÉDIA / BAIXA}
```

---

[COVERAGE_CHECK]

**Monitorar ativos críticos** - Identificar ausências que impactam análise:

**TIER 1 - CRÍTICO PARA WDO:**
- [ ] WDO (futuro USD/BRL)
- [ ] WIN (futuro IBOV)
- [ ] IBOV (índice)
- [ ] USD/BRL spot
- [ ] DXY (Dollar Index)
- [ ] ES / SPY (S&P 500)
- [ ] VIX
- [ ] US10Y
- [ ] DI Curva (arquivo)

**TIER 2 - IMPORTANTE:**
- [ ] EWZ (Brasil ETF - fluxo institucional)
- [ ] XLF, XLK, XLE, XLV, XLY (setoriais para rotação)
- [ ] Brent / WTI (petróleo)
- [ ] Minério de Ferro
- [ ] USD/MXN (México - proxy LatAm)
- [ ] FXI (China)
- [ ] EEM (MSCI EM)

**TIER 3 - DESEJÁVEL:**
- [ ] AUD/USD (carry trade)
- [ ] TLT (Treasury longo - fluxo)
- [ ] QQQ (Nasdaq - tech)
- [ ] DE10Y (Bund - divergência Fed/ECB)
- [ ] HYG/LQD (crédito)
- [ ] GLD (ouro - fluxo institucional)

Se algum ativo TIER 1 estiver ausente → ⚠️ **ALERTA CRÍTICO**
Se >3 ativos TIER 2 ausentes → ⚠️ **ANÁLISE COMPROMETIDA**
Se >5 ativos TIER 3 ausentes → 🔧 **RECOMENDADO ADICIONAR**

**Action Items:**
```markdown
AUSENTES CRÍTICOS (adicionar urgente):
- {listar se houver}

AUSENTES IMPORTANTES (adicionar esta semana):
- {listar se houver}

AUSENTES DESEJÁVEIS (adicionar quando possível):
- {listar se houver}
```

========================================================
FORMATO DE SAÍDA FINAL (DUAL-MODE)
========================================================

[OUTPUT_FORMAT_V1.0]

O relatório DEVE ser entregue em **DOIS FORMATOS**:

### 1) RESUMO EXECUTIVO (no chat - resposta direta)

Estrutura curta para leitura rápida:

```markdown
## ⚡ PRÉ-MERCADO {DD/MM/AAAA} — RESUMO EXECUTIVO

**🎯 SINAIS PRINCIPAIS:**
• WDO: {↑/↓/≈} | WIN: {↑/↓/≈} | IBOV: {↑/↓/≈}
• DI Curva: {STEEPEN/FLATTEN} ({Bear/Bull})
• USD/BRL spot: {↑/↓/≈}
• Regime: {RISK ON/OFF} (Score: {X}/10)

**🎲 OPÇÕES/GAMMA (WDO):**
• Spot: {valor} pts | Flip: {próximo/médio/longe} ({X} pts)
• Regime Gamma: {Positivo/Negativo}
• Range: {low}–{high}
• Walls: Call {strike} | Put {strike}

**🔥 DRIVERS DO DIA:**
1. {Driver macro - ex: "Fed mantém hawkish, yields US sobem"}
2. {Driver Brasil - ex: "Fiscal doméstico pressiona DI longo"}
3. {Driver externo - ex: "China estável, commodities resilientes"}

**📅 AGENDA CRÍTICA (BRT):**
• {HH:MM} - {País} - {Evento} (⚠ Alta importância)

**💱 FLUXO EM:**
• EWZ {↑/↓/≈} vs IBOV {↑/↓/≈} → {Entrada/Saída/Neutro}

**🌐 TAXAS GLOBAIS:**
• US-DE spread: {alargando/estreitando}
• Prêmio BR: {↑/↓/≈}

**📊 ROTAÇÃO SETORIAL:**
• Liderança: {XL?} ({setor})
• Regime: {Cíclico/Defensivo/Misto}

**💰 CARRY TRADE:**
• Status: {Building/Unwinding/Neutro}

---
📎 **RELATÓRIO COMPLETO + DATA_SHEET disponível em anexo**
```

### 2) RELATÓRIO INSTITUCIONAL COMPLETO (arquivo)

Estrutura completa conforme template original do V1.2, incluindo:
- Todas as seções detalhadas
- Análise de cada módulo
- DATA_SHEET numérico (ANEXO A)
- Validação completa
- Glossário (se relevante)

**IMPORTANTE:**
- CORPO: apenas sinais qualitativos (↑/↓/≈, STEEPEN, ALARGA, etc)
- DATA_SHEET: todos os valores numéricos

========================================================

## 📋 DATA_SHEET STRUCTURE (ANEXO A)

[DATA_SHEET_NUMERICO]

**INCLUIR AS SEGUINTES TABELAS (com valores exatos):**

### A1) US & GLOBAL
{tabela conforme V1.2 - incluir todos os ativos do CSV}

### A2) COMMODITIES
{tabela conforme V1.2 - TODAS as commodities do CSV}

### A3) BRASIL
{tabela conforme V1.2 + curva DI expandida}

### A4) AGENDA (BRT)
{calendário econômico do dia}

### A4.1) MATRIZ DE REAÇÃO
{se houver eventos já ocorridos, preencher reação real}

### A5) OPÇÕES / GAMMA — INSUMO NUMÉRICO (WDO)
{métricas do dashboard}

### A5.1) NÍVEIS ESTRUTURAIS
{Call/Put walls, GEX tops}

🆕 ### A6) EM FLOW ANALYSIS (NOVO V1.0)
| ETF | Var (%) | Benchmark | Var Bench (%) | Divergência | Interpretação |
|-----|---------|-----------|---------------|-------------|---------------|
| EWZ | {X.XX%} | IBOV      | {Y.YY%}       | {spread}    | {Entrada/Saída/Neutro} |
| FXI | {X.XX%} | HSI       | {Y.YY%}       | {spread}    | {contexto} |
| EEM | {X.XX%} | -         | -             | -           | {contexto} |

🆕 ### A7) GLOBAL RATES DIVERGENCE (NOVO V1.0)
| Spread       | Nível (bps) | Var (bps) | Direção | Interpretação |
|--------------|-------------|-----------|---------|---------------|
| US10Y-DE10Y  | {XXX}       | {+/-YY}   | {⬆⬇≈}   | {Fed vs ECB} |
| DE10Y-IT10Y  | {XXX}       | {+/-YY}   | {⬆⬇≈}   | {Euro periph risk} |
| US10Y-JP10Y  | {XXX}       | {+/-YY}   | {⬆⬇≈}   | {JPY carry} |
| US10Y-BR10Y  | {XXX}       | {+/-YY}   | {⬆⬇≈}   | {Brazil premium} |

🆕 ### A8) RISK ON/OFF SCORE (NOVO V1.0)
| Categoria     | Contribuição | Detalhamento |
|---------------|--------------|--------------|
| Equities      | {+X.X}       | {SPY ↑, QQQ ↑, EEM ↑} |
| Volatilidade  | {+X.X}       | {VIX ↓} |
| Safe Havens   | {-X.X}       | {TLT ↑, GLD ↑, JPY ↑} |
| Setoriais     | {+X.X}       | {Cíclicos > Defensivos} |
| Carry/EM      | {+X.X}       | {AUD ↑, EWZ ↑} |
| **SCORE**     | **{±X.X/10}** | **{RISK ON/OFF STATUS}** |

🆕 ### A9) CARRY TRADE MONITOR (NOVO V1.0)
| Par       | Var (%) | Nível   | Status | Interpretação |
|-----------|---------|---------|--------|---------------|
| USD/JPY   | {±X.XX%} | {XXX.XX} | {↑↓≈} | {contexto} |
| AUD/USD   | {±X.XX%} | {0.XXXX} | {↑↓≈} | {contexto} |
| NZD/USD   | {±X.XX%} | {0.XXXX} | {↑↓≈} | {early warning} |
| AUD/JPY*  | {±X.XX%} | {XX.XX}  | {⚠🆗} | **{Carry Building/Unwinding}** |

*calculado

🆕 ### A10) SECTOR ROTATION DETAIL (NOVO V1.0)
| Setor                  | Ticker | Var (%) | Rank | Categoria  | vs SPY |
|------------------------|--------|---------|------|------------|--------|
| {Nome}                 | XL?    | {±X.XX%} | 1º   | {Cíc/Def/Tech} | {+/-X.XX%} |
| ...                    | ...    | ...     | ...  | ...        | ...    |

Interpretação: "{Regime detectado} → {bias para WDO}"

========================================================
FIM DO SCRIPT V1.0 PRODUCTION
========================================================

**RESUMO DAS MUDANÇAS V1.2 → V1.0:**

✅ CORRIGIDO: Sistema de detecção de ativos (dual-key matching aprimorado)
✅ CONFIRMADO: 17 ativos críticos já presentes no CSV  
🆕 ADICIONADO: 5 novos módulos especializados
🆕 ADICIONADO: Validação explícita ao final
🆕 ADICIONADO: Coverage check para identificar gaps
🆕 APRIMORADO: Sector Rotation agora funcional
🆕 SIMPLIFICADO: Comando diário mais curto

**PRÓXIMOS PASSOS RECOMENDADOS:**

1. Adicionar ao CSV (PRIORITÁRIO):
   - QQQ, TLT, DIA, AUD/USD, GLD, XLU, XLP

2. Testar script V1.0 com próximo pré-mercado

3. Ajustar thresholds dos módulos conforme feedback operacional

4. Considerar adicionar módulos futuros:
   - Análise de order flow (se dados disponíveis)
   - Correlação histórica rolling (benchmark)
   - Alertas automáticos (níveis técnicos)

---

**Versão:** 1.0 Production
**Data de Criação:** 23/01/2026
**Última Atualização:** 23/01/2026
**Status:** ✅ PRONTO PARA USO

# 🌐 MÓDULO DE COLETA DE DADOS (SOURCE CONNECTED) — V1.0 FINAL

**VERSÃO DE PRODUÇÃO FINAL** - Otimizado para WDO + Mercado Brasileiro
CSV READY + ANTI-IGNORE + DATA SHEET + OPTIONS/GAMMA + CALENDÁRIO + MÓDULOS AVANÇADOS

**FOCO OPERACIONAL:**
- 🎯 **Primário:** USD/BRL (WDO)
- 🎯 **Secundário:** Ações Brasileiras + WIN (IBOV futuro)
- 🌎 **Contexto:** Mercado global para leitura de fluxos

---

## 📋 CHANGELOG V1.2 → V1.0 FINAL

**CORREÇÕES CRÍTICAS:**
- ✅ **Sistema de detecção aprimorado** - Agora lida com nomes duplicados (ex: "USD/MXN - US Dollar Mexican Peso")
- ✅ **Tratamento de caracteres especiais** - Remove ®, ™, –, — antes de matching
- ✅ **Fuzzy matching** - Encontra ativos mesmo com variações no nome
- ✅ **Priorização Brasil** - Ações brasileiras e ADRs têm prioridade na análise

**NOVOS MÓDULOS:**
- 🆕 **[BRAZIL_FOCUS_MODULE]** - Análise aprofundada do mercado brasileiro
- 🆕 **[ADR_VS_LOCAL_MODULE]** - Divergência ADRs vs ações locais (arbitragem)
- 🆕 **[IBOV_WIN_ANALYSIS]** - Análise específica do WIN (IBOV futuro)
- 🆕 **[BR_CREDIT_RISK_MODULE]** - Risco de crédito Brasil (CDS + spread)
- 🆕 **[COMMODITIES_BRAZIL_MODULE]** - Commodities com foco em Brasil (minério, soja)

**APRIMORAMENTOS:**
- 🔧 **Validação brasileira** - Checklist específico para ativos BR
- 🔧 **Ordem de prioridade** - WDO → WIN → IBOV → Ações BR → Global
- 🔧 **Detecção de fallback** - Se WDOc1 ausente, usa USD/BRL spot como proxy

---

========================================================
0) COMANDO DIÁRIO SIMPLIFICADO
========================================================

[DAILY_RUN_COMMAND_FINAL]

**COMANDO PADRÃO (copie diariamente):**

```
Data: {DD/MM/AAAA}
Anexos: ✅ CSV | ✅ DI | ✅ Dashboard | ✅ Calendário

Executar Script V1.0 FINAL (foco: WDO + Brasil)
```

O script automaticamente:
1. Processa CSV (222 ativos)
2. Analisa curva DI Brasil
3. Processa dashboard gamma (WDO)
4. Lê calendário econômico
5. Aplica TODOS os módulos (incluindo novos módulos Brasil)
6. Gera: RESUMO EXECUTIVO + RELATÓRIO COMPLETO + DATA_SHEET + VALIDAÇÃO

---

========================================================
1) SISTEMA DE DETECÇÃO APRIMORADO
========================================================

[ADVANCED_ASSET_DETECTION_SYSTEM]

**PROBLEMA RESOLVIDO:**
- ❌ ANTES: "USD/MXN" não encontrava "USD/MXN - US Dollar Mexican Peso"
- ✅ AGORA: Sistema multicamada com normalização

**PIPELINE DE DETECÇÃO (4 NÍVEIS):**

**Nível 0 - Normalização:**
```python
def normalize(text):
    # Remove caracteres especiais
    text = text.replace('®', '').replace('™', '').replace('©', '')
    text = text.replace('–', '-').replace('—', '-')
    # Remove espaços extras
    text = ' '.join(text.split())
    return text.upper()
```

**Nível 1 - Match Exato (ticker):**
```
Procurar: "WDO"
Encontrar: Symbol == "WDO" ou Symbol == "WDOc1"
```

**Nível 2 - Match Parcial (ticker in symbol):**
```
Procurar: "USD/BRL"
Encontrar: "USD/BRL" in "USD/BRL - US Dollar Brazil Real"
Ou: "USDBRL" in "USD/BRL Mini Futures"
```

**Nível 3 - Match por Nome (keywords):**
```
Procurar: "Brazil ETF"
Encontrar: "Brazil" AND "ETF" in Name
Ex: "iShares MSCI Brazil ETF"
```

**Nível 4 - Fuzzy Match (família de contratos):**
```
Procurar: "DI"
Encontrar: DIJc1, DIJc2, DI1F25, DI1F26, etc
Selecionar: Primeiro vencimento (DI1c1) como primário
```

**REGRAS ESPECIAIS PARA BRASIL:**

1. **WDO/WIN:**
   - Buscar: WDOc1, WDOc2, WDOc3 (usar c1 como primário)
   - Fallback: USD/BRL spot se WDO ausente
   - WIN: WINc1, WINc2, WINc3 (usar c1)
   - Fallback: ES/SPY + correlação histórica

2. **Ações Brasileiras:**
   - Prioridade: ADRs (EUA) > Ações locais (.SA)
   - Exemplo: VALE → buscar VALE.K (NYSE) primeiro, depois VALE3.SA
   - Se ambos presentes → usar ADR para análise, marcar divergência

3. **DI Curva:**
   - Extrair TODOS os contratos DI (DIJc1-20)
   - Bucketizar: Curto (<2028) | Médio (2028-2031) | Longo (2032+)
   - Identificar âncora (maior volume ou Jan/2035)

4. **Commodities Brasil:**
   - Minério: TIOc1, SM58Fc1, 3047.HK (ETF China)
   - Soja: ZSc1, ZMc1 (farelo)
   - Milho: ZCc1, CCMc1, CORN11.SA
   - Priorizar: contratos CME/CBOT > B3 (mais líquidos)

---

========================================================
2) MÓDULOS BRASILEIROS (NOVOS)
========================================================

[BRAZIL_FOCUS_MODULE]

**OBJETIVO:** Análise aprofundada do mercado brasileiro para suportar operações em ações BR

**ESTRUTURA:**

### 2.1) PANORAMA BRASIL

**Sinais Principais:**
- IBOV: {↑/↓/≈}
- WIN (futuro): {↑/↓/≈} | Prêmio vs spot: {pts}
- USD/BRL spot: {↑/↓/≈}
- WDO (futuro): {↑/↓/≈} | Prêmio vs spot: {pts}
- DI Longo: {ABRE/FECHA} ({STEEPEN/FLATTEN})
- CDS BR 5Y: {ALARGA/ESTREITA}

**Interpretação:**
"{Leitura qualitativa do cenário Brasil}"

### 2.2) TOP GAINERS / LOSERS (ADRs Brasil)

**Top 5 Altas:**
| Ticker | Nome | Var (%) | Setor |
|--------|------|---------|-------|
| {…} | {…} | {+X.X%} | {…} |

**Top 5 Baixas:**
| Ticker | Nome | Var (%) | Setor |
|--------|------|---------|-------|
| {…} | {…} | {-X.X%} | {…} |

**Padrão Setorial:**
"{Análise: setores liderando/perdendo, se há tema comum}"

### 2.3) FLUXO ESTRANGEIRO (EWZ)

**EWZ vs IBOV:**
- EWZ: {+X.X%}
- IBOV: {+X.X%}
- Spread: {X.X pp}

**Interpretação:**
- Se EWZ > IBOV → Entrada de estrangeiros
- Se EWZ < IBOV → Saída de estrangeiros / Doméstico comprando
- Se EWZ ≈ IBOV → Neutro

**Contexto:** "{Explicação do movimento}"

### 2.4) VOLATILIDADE BRASIL

- VXEWZ (vol EWZ): {X.XX} ({↑/↓/≈})
- VXBR (se disponível): {X.XX} ({↑/↓/≈})
- Contexto: "{Alto/Médio/Baixo stress no Brasil}"

---

[ADR_VS_LOCAL_MODULE]

**OBJETIVO:** Detectar arbitragem ADR vs ação local (oportunidade ou sinal)

**PARES A MONITORAR:**

| ADR (EUA) | Ação Local (BR) | Spread ADR-Local | Sinal |
|-----------|-----------------|------------------|-------|
| VALE (NYSE) | VALE3.SA | {X.X%} | {Arb opp / Normal / Fechando} |
| PBR (NYSE) | PETR4.SA | {X.X%} | {…} |
| ITUB (NYSE) | ITUB4.SA | {X.X%} | {…} |
| BBD (NYSE) | BBDC4.SA | {X.X%} | {…} |
| NU (NYSE) | (não tem local) | N/A | - |

**Interpretação:**
- Spread alargando → Arbitragem se abrindo
- Spread estreitando → Convergência
- ADR forte + Local fraco → Fuga via ADR (bearish BRL)
- ADR fraco + Local forte → Entrada via local (bullish BRL)

**NOTA:** Se dados locais (.SA) não disponíveis, marcar "N/A - apenas ADR".

---

[IBOV_WIN_ANALYSIS]

**OBJETIVO:** Análise específica do WIN (futuro de IBOV) para operações secundárias

**DADOS:**

**WIN (futuro):**
- Último: {valor} pts
- Var: {+/-X pts} ({+/-X.X%})
- IBOV spot: {valor} pts
- Var IBOV: {+/-X pts} ({+/-X.X%})
- Prêmio WIN: {X pts} ({X.X%})

**CONTEXTO:**
- Prêmio normal: 50-150 pts (depende do vencimento)
- Prêmio alto (>200 pts) → Contango forte (juros altos)
- Prêmio baixo (<50 pts) → Backwardation (expectativa de queda de juros)

**ANÁLISE TÉCNICA (se dados disponíveis):**
- Range intraday: {low} - {high}
- Distância da máxima: {X pts}
- Distância da mínima: {X pts}

**CORRELAÇÃO COM WDO:**
- WIN e WDO geralmente: Correlação +0.6 a +0.8 (ambos sobem/caem juntos)
- Hoje: {Alinhados / Divergindo}
- Se divergindo: "{possível explicação}"

**SINAIS PARA WIN:**
- IBOV ↑ + DXY ↓ + Commodities ↑ → WIN tende ↑
- IBOV ↓ + DXY ↑ + Risk off → WIN tende ↓
- IBOV ↑ + WDO ↑ (ambos) → Risk on doméstico forte

---

[BR_CREDIT_RISK_MODULE]

**OBJETIVO:** Monitorar risco de crédito Brasil (impacta WDO e ações BR)

**INDICADORES:**

1. **CDS Brasil (5Y):**
   - Nível: {X bps}
   - Var: {+/-Y bps}
   - Direção: {ALARGA / ESTREITA / ≈}

2. **Spread BR10Y - US10Y:**
   - Spread: {X bps}
   - Var: {+/-Y bps}
   - Histórico: Normal = 600-800 bps

3. **DI Longo (âncora):**
   - Taxa: {X.XX%}
   - Var: {+/-Y bps}
   - Sinal: {ABRE / FECHA}

**MATRIZ DE RISCO BRASIL:**

| CDS BR | Spread BR-US | DI Longo | Sinal Combinado |
|--------|--------------|----------|-----------------|
| {↑↓≈} | {↑↓≈} | {ABRE/FECHA} | {RISCO ↑ / RISCO ↓ / NEUTRO} |

**Interpretação:**
- 3 indicadores piorando → Risco Brasil ↑ (bearish BRL, bearish ações)
- 3 indicadores melhorando → Risco Brasil ↓ (bullish BRL, bullish ações)
- Misto → Analisar qual é dominante

**Contexto:** "{Explicação do movimento de risco}"

---

[COMMODITIES_BRAZIL_MODULE]

**OBJETIVO:** Commodities críticas para Brasil (minério, soja, petróleo)

**MINÉRIO DE FERRO:**
- TIO (SGX): {$X/t} ({↑↓≈})
- SM58F (Dalian 58%): {¥X/t} ({↑↓≈})
- ETF China (3047.HK): {↑↓≈}
- **Sinal para Brasil:** {Positivo / Negativo / Neutro}
- **Impacto:** VALE, CSN, minério forte → IBOV ↑, BRL ↑

**PETRÓLEO:**
- WTI: {$X/bbl} ({↑↓≈})
- Brent: {$X/bbl} ({↑↓≈})
- **Sinal para Brasil:** {Positivo / Negativo / Neutro}
- **Impacto:** Petrobras (PBR), petróleo forte → misto (exportador, mas inflação)

**SOJA:**
- Soja (ZS): {¢X/bu} ({↑↓≈})
- Farelo (ZM): {$X/ton} ({↑↓≈})
- Milho (ZC): {¢X/bu} ({↑↓≈})
- **Sinal para Brasil:** {Positivo / Negativo / Neutro}
- **Impacto:** Agro (soja forte → BRL ↑, interior forte)

**CONTEXTO GERAL:**
"{Leitura do conjunto: commodities fortes/fracas, impacto no Brasil}"

---

========================================================
3) PRIORIZAÇÃO E ORDEM DE ANÁLISE
========================================================

[ANALYSIS_PRIORITY_ORDER]

**ORDEM DE PROCESSAMENTO (top-down):**

1. **TIER 0 - PRÉ-ANÁLISE (rápido):**
   - Ler CSV completo
   - Identificar ativos críticos presentes/ausentes
   - Ler curva DI
   - Ler dashboard gamma (WDO)
   - Ler calendário

2. **TIER 1 - BRASIL (CORE):**
   - WDO (USD/BRL futuro) ← PRIMÁRIO
   - WIN (IBOV futuro) ← SECUNDÁRIO
   - IBOV (índice)
   - USD/BRL spot
   - DI Curva (Curto/Médio/Longo)
   - CDS Brasil
   - Spread BR10Y-US10Y

3. **TIER 2 - AÇÕES BRASILEIRAS:**
   - ADRs (VALE, PBR, ITUB, BBD, NU, etc)
   - EWZ (fluxo estrangeiro)
   - Ações locais (.SA) se disponíveis
   - Setores: Bancos, Commodities, Consumo

4. **TIER 3 - DRIVERS GLOBAIS (para WDO):**
   - DXY (Dollar Index)
   - ES/SPY (S&P 500)
   - VIX (volatilidade)
   - US10Y (treasury)
   - Carry trade (AUD/USD, USD/JPY)

5. **TIER 4 - CONTEXTO INTERNACIONAL:**
   - Europa (Bund, Stoxx)
   - Ásia (Nikkei, China)
   - EMs (EEM, FXI)
   - Commodities globais

6. **TIER 5 - REFINAMENTO:**
   - Rotação setorial
   - Risk on/off score
   - Divergências de taxa
   - Sentimento

**REGRA DE OURO:**
Se tempo/espaço limitado → priorizar TIER 1 e TIER 2 (Brasil).
TIER 3-5 são contexto, não podem substituir análise Brasil.

---

========================================================
4) VALIDAÇÃO BRASILEIRA ESPECÍFICA
========================================================

[BRAZIL_VALIDATION_CHECKLIST]

**Incluir ao final do relatório (após validação geral):**

```markdown
### 🇧🇷 VALIDAÇÃO ESPECÍFICA - MERCADO BRASILEIRO

**ATIVOS PRIMÁRIOS (operação):**
→ WDO (futuro USD/BRL): {✅ PROCESSADO / ❌ AUSENTE}
   └─ Valor: {X} pts | Var: {+/-Y pts}
→ WIN (futuro IBOV): {✅ PROCESSADO / ❌ AUSENTE}
   └─ Valor: {X} pts | Var: {+/-Y pts}
→ IBOV (índice): {✅ PROCESSADO / ❌ AUSENTE}
   └─ Valor: {X} pts | Var: {+/-Y%}

**DRIVERS BRASIL:**
→ DI Curva: {✅ COMPLETO / ⚠️ PARCIAL / ❌ AUSENTE}
   └─ Shape: {STEEPEN/FLATTEN} | Breadth: {AMPLA/MISTA}
→ CDS Brasil 5Y: {✅ PROCESSADO / ❌ AUSENTE}
   └─ Nível: {X bps} | Var: {+/-Y bps}
→ EWZ (fluxo estrangeiro): {✅ PROCESSADO / ❌ AUSENTE}
   └─ Var: {+/-X%} | vs IBOV: {spread}

**AÇÕES BRASILEIRAS:**
→ ADRs processados: {N}
   └─ Top: {listar 3 principais: VALE, PBR, ITUB}
→ Commodities Brasil: {✅ COMPLETO / ⚠️ PARCIAL}
   └─ Minério: {✅/❌} | Soja: {✅/❌} | Petróleo: {✅/❌}

**STATUS GERAL BRASIL:**
→ {✅ ANÁLISE COMPLETA / ⚠️ DADOS PARCIAIS / ❌ DADOS INSUFICIENTES}
→ Qualidade para operar WDO: {ALTA / MÉDIA / BAIXA}
→ Qualidade para operar WIN: {ALTA / MÉDIA / BAIXA}
→ Qualidade para operar Ações BR: {ALTA / MÉDIA / BAIXA}
```

---

========================================================
5) TEMPLATE DE SAÍDA OTIMIZADO
========================================================

[OUTPUT_TEMPLATE_FINAL]

### RESUMO EXECUTIVO (no chat):

```markdown
## ⚡ PRÉ-MERCADO {DATA} — RESUMO EXECUTIVO

### 🇧🇷 BRASIL (FOCO PRINCIPAL)

**WDO (USD/BRL):**
• Spot: {X.XX} ({↑/↓/≈})
• Futuro: {X.XX} pts ({↑/↓/≈})
• Driver principal: "{tema}"

**WIN (IBOV):**
• IBOV: {X}pts ({↑/↓/≈})
• WIN futuro: {X}pts ({↑/↓/≈})
• Driver: "{tema}"

**DI CURVA:**
• Shape: {STEEPEN/FLATTEN} ({Bear/Bull})
• Longo: {ABRE/FECHA} {X bps}
• Contexto: "{1 frase}"

**FLUXO:**
• EWZ: {+/-X%} vs IBOV {+/-X%} → {Entrada/Saída/Neutro}

**RISCO BRASIL:**
• CDS 5Y: {X bps} ({↑/↓})
• Spread BR-US: {X bps}
• Sinal: {Risco ↑/↓/≈}

### 🌎 CONTEXTO GLOBAL

**DRIVERS WDO:**
1. {Driver 1 - ex: "DXY forte, yields US subindo"}
2. {Driver 2 - ex: "Carry trade unwinding (AUD/JPY ↓)"}
3. {Driver 3 - ex: "Commodities mistas"}

**REGIME:**
• Risk On/Off: {Score X/10} → {STATUS}
• Setoriais: {Cíclicos/Defensivos} liderando

**AGENDA:**
• {HH:MM} - {Evento crítico Brasil}
• {HH:MM} - {Evento crítico EUA}

### 📊 AÇÕES BRASILEIRAS (SECUNDÁRIO)

**Top Gainers:**
• {Ticker}: {+X%} ({setor})
• {Ticker}: {+X%} ({setor})

**Top Losers:**
• {Ticker}: {-X%} ({setor})
• {Ticker}: {-X%} ({setor})

---
📎 **RELATÓRIO COMPLETO + DATA_SHEET em anexo**
```

---

========================================================
6) FALLBACKS E TRATAMENTO DE AUSÊNCIAS
========================================================

[FALLBACK_RULES_BRAZIL]

**Se WDO ausente:**
1. Usar USD/BRL spot como proxy
2. Calcular "WDO implícito" = USD/BRL spot + prêmio típico (50-100 pts)
3. Marcar: "⚠️ WDO indisponível, usando USD/BRL spot + prêmio estimado"

**Se WIN ausente:**
1. Usar IBOV spot
2. Calcular "WIN implícito" = IBOV + prêmio típico (100-150 pts)
3. Marcar: "⚠️ WIN indisponível, usando IBOV spot + prêmio estimado"

**Se DI Curva indisponível:**
1. Usar DDI (futuros) como proxy
2. Se DDI também ausente, buscar DI1F25, DI1F27, DI1F35 individualmente
3. Marcar: "⚠️ Curva DI parcial, usando contratos individuais"

**Se EWZ ausente:**
1. Usar EEM (EM broad) como proxy de fluxo EM
2. Calcular divergência EEM vs IBOV
3. Marcar: "⚠️ EWZ indisponível, usando EEM como proxy"

**Se CDS Brasil ausente:**
1. Usar spread BR10Y-US10Y como proxy de risco
2. Usar DI Longo como proxy secundário
3. Marcar: "⚠️ CDS Brasil indisponível, usando spread BR-US"

**Se Commodities Brasil ausentes:**
1. Minério: usar índice China (CSI300) como proxy
2. Soja: usar broad agriculture index
3. Petróleo: sempre deve ter (crítico)

---

========================================================
7) GLOSSÁRIO BRASIL
========================================================

[GLOSSARY_BRAZIL]

**Termos específicos do mercado brasileiro:**

- **WDO:** Dólar mini (contrato futuro de USD/BRL na B3)
- **WIN:** Mini índice (contrato futuro de IBOV na B3)
- **DI:** Depósito Interbancário (taxa de juros de curto prazo)
- **DIc / DI1:** Contratos futuros de DI (referência de juros futuros)
- **DDI:** DI contínuo consolidado
- **DAP:** DI x IPCA (spread real)
- **SELIC:** Taxa básica de juros do Brasil (meta do Copom)
- **COPOM:** Comitê de Política Monetária do Banco Central
- **B3:** Bolsa brasileira (antiga BM&F Bovespa)
- **IBOV / IBOVESPA:** Índice principal da bolsa brasileira
- **IBRA:** Índice amplo (Brasil)
- **ADR:** American Depositary Receipt (ação brasileira listada nos EUA)
- **VXEWZ:** Volatilidade implícita do EWZ (proxy de stress Brasil)
- **EWZ:** iShares Brazil ETF (fluxo institucional estrangeiro)
- **Prêmio futuro:** Diferença entre futuro e spot (reflete juros + expectativa)

---

========================================================
FIM DO SCRIPT V1.0 FINAL
========================================================

**MUDANÇAS FINAIS (últimas melhorias):**

✅ Sistema de detecção robusto (4 níveis + normalização)
✅ Foco em Brasil (WDO + WIN + Ações BR)
✅ 5 novos módulos brasileiros
✅ Ordem de prioridade clara (Brasil primeiro)
✅ Fallbacks inteligentes (sempre tem saída)
✅ Validação brasileira específica
✅ Glossário Brasil incluído

**ATIVOS ESSENCIAIS PARA FUNCIONAMENTO PLENO:**
- ✅ WDO ou USD/BRL spot
- ✅ WIN ou IBOV
- ✅ DI Curva (arquivo) ou DDI
- ✅ EWZ
- ⚠️ CDS Brasil (desejável, tem fallback)
- ⚠️ Commodities (desejável, tem fallback)

**PRÓXIMOS PASSOS:**
1. Testar com dados reais
2. Ajustar thresholds conforme necessário
3. Adicionar alertas específicos para Brasil

---

**Versão:** 1.0 FINAL
**Data:** 23/01/2026
**Status:** ✅ PRONTO PARA PRODUÇÃO


========================================================
📚 GUIA RÁPIDO DE USO
========================================================

## PARA O OPERADOR

### 1️⃣ PREPARAÇÃO DIÁRIA (2 minutos)

**Arquivos necessários:**
- ✅ CSV atualizado (seu watchlist com 222 ativos)
- ✅ Arquivo curva DI (.xlsx do Profit Pro)
- ✅ Dashboard Gamma WDO (PDF)
- ✅ Calendário econômico do dia (PDF/imagem)

### 2️⃣ EXECUÇÃO (copie e cole no chat)

```
Data: 23/01/2026
Anexos: ✅ CSV | ✅ DI | ✅ Dashboard | ✅ Calendário

Executar Script V1.0 FINAL (foco: WDO + Brasil)
```

### 3️⃣ LEITURA DO RELATÓRIO (5 minutos)

**Ordem de leitura recomendada:**

1. **RESUMO EXECUTIVO** (no chat - 1 min)
   - WDO: direção + driver principal
   - WIN: direção + contexto IBOV
   - DI: shape + interpretação
   - Fluxo: EWZ vs IBOV
   - Risco Brasil: CDS + spread

2. **BRASIL FOCUS** (relatório completo - 2 min)
   - Top gainers/losers (se for operar ações)
   - ADR vs Local (oportunidades de arb)
   - Commodities Brasil (minério, soja, petróleo)

3. **CONTEXTO GLOBAL** (relatório completo - 2 min)
   - Drivers globais para WDO
   - Carry trade (AUD/JPY)
   - Risk on/off score
   - Rotação setorial

4. **CHECKLIST** (validação - 30 seg)
   - Verificar se todos os dados críticos foram processados
   - Confirmar qualidade: ALTA/MÉDIA/BAIXA

### 4️⃣ TOMADA DE DECISÃO

**Para WDO:**
- ✅ Olhar: Driver principal + Risk score + Carry trade + DXY
- ✅ Confirmar: DI Curva + CDS + Commodities Brasil
- ✅ Validar: Fluxo EWZ + Sentimento

**Para WIN:**
- ✅ Olhar: IBOV + Setoriais + Fluxo EWZ
- ✅ Confirmar: Commodities (minério principalmente)
- ✅ Validar: Correlação com WDO

**Para Ações BR:**
- ✅ Olhar: Top gainers/losers + setor específico
- ✅ Confirmar: ADR vs Local (se há arb)
- ✅ Validar: Tema macro (risk on/off)

---

========================================================
🔧 TROUBLESHOOTING
========================================================

### ❌ PROBLEMA: "WDO não encontrado no CSV"

**Soluções:**
1. Verificar se CSV tem "WDO" ou "WDOc1" ou "USD/BRL Mini"
2. Se ausente, script usará USD/BRL spot + prêmio estimado
3. Adicionar WDOc1 ao seu provedor de dados

### ❌ PROBLEMA: "Curva DI indisponível"

**Soluções:**
1. Verificar se arquivo .xlsx foi anexado corretamente
2. Script tentará usar DDI como fallback
3. Se DDI ausente, buscará contratos individuais (DI1F25, etc)

### ❌ PROBLEMA: "Muitos ativos sem atualização"

**Soluções:**
1. Normal antes da abertura do mercado
2. Verificar horário do CSV (deve ser pré-mercado)
3. Script marcará "SEM ATUALIZAÇÃO" mas continuará

### ❌ PROBLEMA: "Commodities Brasil faltando"

**Soluções:**
1. Adicionar tickers: TIOc1 (minério), ZSc1 (soja)
2. Script usará proxies (CSI300 para minério, broad agro para soja)
3. Petróleo (WTI/Brent) é crítico - deve estar sempre

### ❌ PROBLEMA: "EWZ ausente"

**Soluções:**
1. Confirmar que CSV tem "EWZ" (iShares MSCI Brazil ETF)
2. Script usará EEM como proxy de fluxo EM
3. EWZ é CRÍTICO - adicionar ao provedor

---

========================================================
📊 INTERPRETAÇÃO RÁPIDA
========================================================

### SINAIS PARA WDO:

**🟢 WDO TENDE A CAIR (BRL se fortalece):**
- ✅ Risk on forte (score > +5)
- ✅ DXY caindo
- ✅ Commodities subindo (minério, soja, petróleo)
- ✅ Carry trade building (AUD/JPY subindo)
- ✅ EWZ > IBOV (entrada estrangeiro)
- ✅ CDS Brasil estreitando
- ✅ DI Longo fechando

**🔴 WDO TENDE A SUBIR (BRL se enfraquece):**
- ✅ Risk off forte (score < -5)
- ✅ DXY subindo
- ✅ Commodities caindo
- ✅ Carry unwinding (AUD/JPY caindo rápido)
- ✅ EWZ < IBOV (saída estrangeiro)
- ✅ CDS Brasil alargando
- ✅ DI Longo abrindo (risco fiscal)

**⚪ WDO NEUTRO/MISTO:**
- Score entre -2 e +2
- Drivers conflitantes
- Aguardar definição

### SINAIS PARA WIN:

**🟢 WIN TENDE A SUBIR:**
- ✅ IBOV subindo
- ✅ Minério forte (VALE)
- ✅ Petróleo forte (Petrobras)
- ✅ Bancos (XLF) fortes
- ✅ EWZ > IBOV (entrada estrangeiro)
- ✅ Setoriais cíclicos liderando

**🔴 WIN TENDE A CAIR:**
- ✅ IBOV caindo
- ✅ Commodities fracas
- ✅ Risk off global
- ✅ EWZ < IBOV (saída estrangeiro)
- ✅ Defensivos liderando

---

========================================================
📈 CHECKLIST PRÉ-OPERAÇÃO
========================================================

**Antes de entrar em qualquer operação, confirme:**

### WDO:
- [ ] Li o driver principal do dia
- [ ] Verifiquei risk on/off score
- [ ] Confirmei direção do carry trade
- [ ] Olhei DI Curva (shape + breadth)
- [ ] Chequei fluxo EWZ vs IBOV
- [ ] Vi agenda econômica (eventos críticos)
- [ ] Confirmei qualidade dos dados: ALTA

### WIN:
- [ ] Vi direção do IBOV
- [ ] Confirmei commodities (minério principalmente)
- [ ] Verifiquei setoriais (cíclicos vs defensivos)
- [ ] Olhei fluxo EWZ
- [ ] Chequei correlação WIN/WDO (devem andar juntos)
- [ ] Confirmei qualidade dos dados: ALTA

### AÇÕES BR:
- [ ] Identifiquei top gainers/losers do setor
- [ ] Verifiquei se há tema setorial
- [ ] Olhei ADR vs Local (arb?)
- [ ] Confirmei fluxo EWZ (estrangeiro entrando/saindo?)
- [ ] Verifiquei risk on/off geral

---

FIM DA INTEGRAÇÃO E GUIA

