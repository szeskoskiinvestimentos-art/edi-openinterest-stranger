# 🌐 EDI — SCRIPT MASTER REVISÃO 0.2 (ENFORCEMENT MODE)
**Sistema de Análise Pré-Mercado | Conformidade Estrutural Obrigatória**

---

## 📋 METADATA

```
Script: EDI — Sistema de Análise Pré-Mercado
Versão: REVISÃO 0.2 (Enforcement Mode)
Data: 02/02/2026
Status: ✅ PRONTO PARA USO DIÁRIO
Foco: WDO (USD/BRL) + WIN (IBOV) + Contexto Global
Modo: Template Rígido + Validação Contínua

CHANGELOG 0.1 → 0.2:
+ Template com estrutura OBRIGATÓRIA e não-negociável
+ Validação a cada etapa (checkpoints)
+ Placeholders explícitos que DEVEM ser preenchidos
+ Penalidades por desvio do template
+ Checklist de entrada mandatória
+ Enforcement de processamento de anexos
+ Dual-mode ESTRITO (separação física corpo/data)
+ Convicção OBRIGATÓRIA no título
+ Cenários SE-ENTÃO em formato fixo
```

---

## ⚠️ INSTRUÇÕES CRÍTICAS DE EXECUÇÃO

### 🔴 REGRAS INVIOLÁVEIS:

1. **ESTE NÃO É UM DOCUMENTO DE INSPIRAÇÃO**
   - É um PROTOCOLO TÉCNICO
   - Cada seção DEVE estar presente
   - Cada placeholder DEVE ser preenchido
   - NÃO criar seções fora do template
   - NÃO renomear seções
   - NÃO mudar ordem das seções

2. **ESTRUTURA É SAGRADA**
   - Seções numeradas (1, 2, 3...) = OBRIGATÓRIAS
   - Subseções (2.1, 2.2...) = OBRIGATÓRIAS
   - Formato markdown exato = OBRIGATÓRIO
   - Tabelas com colunas especificadas = OBRIGATÓRIAS

3. **PROCESSAMENTO DE DADOS**
   - SEMPRE processar anexos ANTES de web
   - NUNCA inventar números se não houver fonte
   - SEMPRE marcar N/A quando dado ausente
   - SEMPRE validar cada etapa

4. **DUAL-MODE É BINÁRIO**
   - CORPO = ZERO números de preço/yield/spread
   - DATA_SHEET = TODOS os números
   - NÃO há meio-termo

---

# ═══════════════════════════════════════════════════════════════
# SEÇÃO 0: CHECKLIST PRÉ-EXECUÇÃO (OBRIGATÓRIO)
# ═══════════════════════════════════════════════════════════════

## [PRE_EXECUTION_CHECKLIST]

**ANTES DE COMEÇAR O RELATÓRIO, PREENCHER:**

```markdown
### ✓ CHECKLIST DE ENTRADA

**Data de Execução:** {DD/MM/AAAA}  
**Horário Início:** {HH:MM BRT}  

**Anexos Recebidos:**
- [ ] CSV Pré-Mercado (.csv) → {SIM/NÃO} → Se SIM: {nome do arquivo}
- [ ] Curva DI Brasil (.xlsx) → {SIM/NÃO} → Se SIM: {nome do arquivo}
- [ ] Dashboard Gamma WDO (PDF) → {SIM/NÃO} → Se SIM: {nome do arquivo}
- [ ] Calendário Econômico (PDF/texto) → {SIM/NÃO} → Se SIM: {fonte}
- [ ] Briefs/Notícias Colados → {SIM/NÃO} → Quantidade: {N}

**Processamento de Anexos:**
- [ ] CSV processado → Ativos identificados: {N}
- [ ] DI processado → Contratos lidos: {N}
- [ ] Gamma processado → Níveis extraídos: {SIM/NÃO}
- [ ] Calendário processado → Eventos listados: {N}

**Ativos Críticos Identificados (TIER 1):**
- [ ] WDO: {PRESENTE/AUSENTE/PROXY}
- [ ] WIN: {PRESENTE/AUSENTE/PROXY}
- [ ] USD/BRL: {PRESENTE/AUSENTE}
- [ ] IBOV: {PRESENTE/AUSENTE}
- [ ] DI Curva: {COMPLETA/PARCIAL/AUSENTE}
- [ ] EWZ: {PRESENTE/AUSENTE/PROXY}
- [ ] CDS Brasil ou VXEWZ: {PRESENTE/AUSENTE}

**Ativos China (TIER 1.5) - CRÍTICO BRASIL:**
- [ ] FXI: {PRESENTE/AUSENTE}
- [ ] CSI300: {PRESENTE/AUSENTE}
- [ ] HSI (fallback): {PRESENTE/AUSENTE}

**Commodities Brasil (CRÍTICAS):**
- [ ] Minério Ferro (TIO/SM58F): {PRESENTE/AUSENTE}
- [ ] Soja (ZS): {PRESENTE/AUSENTE}
- [ ] Petróleo (CL/BZ): {PRESENTE/AUSENTE}
- [ ] Boi (LE): {PRESENTE/AUSENTE}
- [ ] Café (KC): {PRESENTE/AUSENTE}

**Web Search:**
- [ ] Necessário: {SIM/NÃO}
- [ ] Executado: {SIM/NÃO}
- [ ] Tópicos buscados: {listar ou N/A}

**Convicção Preliminar:**
- Críticos faltando: {N}
- China proxies: {OK/FALTANDO}
- Commodities BR: {OK/PARCIAL/FALTANDO}
- Convicção estimada: {ALTA/MÉDIA/BAIXA}

---

**SE ALGUM ITEM CRÍTICO FALTAR:**
→ Marcar claramente no relatório
→ Reduzir convicção conforme [CONVICTION_RULES]
→ Documentar em VALIDAÇÃO final
```

**⚠️ CHECKPOINT 0:** Checklist completo? {SIM/NÃO}  
**Se NÃO → PARAR e completar checklist**

---

# ═══════════════════════════════════════════════════════════════
# SEÇÃO 1: TEMPLATE INSTITUCIONAL OBRIGATÓRIO
# ═══════════════════════════════════════════════════════════════

## [INSTITUTIONAL_REPORT_TEMPLATE]

### 📄 ESTRUTURA FIXA DO RELATÓRIO

**O relatório DEVE seguir EXATAMENTE esta ordem e estrutura:**

```markdown
# EDI — Relatório Estratégico Pré-Mercado | REVISÃO 0.2

**Data:** {DD/MM/AAAA}  
**Horário:** {HH:MM BRT}  
**Janela:** {Pré-abertura / Início do dia / Outro}  
**Convicção:** {ALTA / MÉDIA / BAIXA}  

---

## 1) ⏱️ PAINEL DE CONTROLE (60 SEGUNDOS)

| Categoria          | Métrica         | Estado         | Implicação                |
|--------------------|-----------------|----------------|---------------------------|
| **Estrutura**      | Call Wall       | {acima/próx/abx} | {texto curto}           |
|                    | Put Wall        | {acima/próx/abx} | {texto curto}           |
|                    | Gamma Flip      | {acima/abx/próx} | {texto curto}           |
| **Volatilidade**   | Regime          | {supr/ampl/mix}  | {texto curto}           |
| **Global**         | DXY             | {↑/↓/≈}          | {texto curto}           |
|                    | US10Y           | {↑/↓/≈}          | {texto curto}           |
|                    | SPX/Nasdaq      | {↑/↓/≈}          | {texto curto}           |
| **Stress**         | VIX             | {↑/↓/≈}          | {texto curto}           |
| **🆕 China**       | FXI             | {↑/↓/≈/N/A}      | {texto curto}           |
| **Brasil**         | WDO             | {↑/↓/≈}          | {texto curto}           |
|                    | WIN             | {↑/↓/≈}          | {texto curto}           |
|                    | DI Longo        | {ABRE/FECHA/≈}   | {texto curto}           |
|                    | VXEWZ/CDS       | {ALARGA/EST/≈}   | {texto curto}           |
|                    | **Commodities** | {↑/↓/≈/MISTO}    | {Balança: +/-/neutro}   |

**⚠️ CHECKPOINT 1:** Painel preenchido? {SIM/NÃO}

---

## 2) 📊 FATOS OBSERVADOS (DIRECIONAL QUALITATIVO)

### 2.1) Global Core

**Treasuries:**
- US10Y (yield): {↑/↓/≈}
- US2Y (yield): {↑/↓/≈}
- Curva 2s10s: {STEEPEN/FLATTEN/≈}

**DXY (Dollar Index):**
- Direção: {↑/↓/≈}
- Contexto: {1-2 frases sobre força USD}

**Equities:**
- ES/SPY: {↑/↓/≈}
- NQ/QQQ: {↑/↓/≈}
- Rotação setorial: {descrição breve}

**Volatilidade:**
- VIX: {↑/↓/≈}
- MOVE: {↑/↓/≈}

### 2.2) Emergentes

- EEM: {↑/↓/≈}
- EM crédito (spread USD): {ALARGA/ESTREITA/≈}
- USD/MXN: {↑/↓/≈}
- USD/ZAR (uso interno): {↑/↓/≈}

### 2.3) 🆕 China (Demanda Commodities BR)

- FXI (China Large Cap): {↑/↓/≈/N/A}
- CSI300 (A-shares): {↑/↓/≈/N/A}
- HSI (Hong Kong): {↑/↓/≈/N/A}
- Sinal para commodities BR: {Bullish/Bearish/Neutro/N/A}
- Policy context: {Mencionar se houver stimulus/crédito/property}

### 2.4) Brasil

- EWZ: {↑/↓/≈}
- EWZS: {↑/↓/≈}
- WDO/USD/BRL: {↑/↓/≈}
- WIN/IBOV: {↑/↓/≈}
- DI Curva: {STEEPEN/FLATTEN/≈} | Breadth: {AMPLA/MISTA/ESTÁVEL}
- Risco BR (CDS/VXEWZ): {ALARGA/ESTREITA/↑/↓/≈}

### 2.5) Headlines Dominantes

1. {Driver 1}: {Impacto provável WDO/WIN em 1 frase}
2. {Driver 2}: {Impacto provável WDO/WIN em 1 frase}
3. {Driver 3}: {Impacto provável WDO/WIN em 1 frase}

**⚠️ CHECKPOINT 2:** Fatos Observados completo? {SIM/NÃO}

---

## 3) 🔍 AUDITORIA DE DADOS (INTEGRIDADE)

**Fontes processadas:** {CSV / DI / Opções / Calendário / Notícias / Web}  
**Críticos faltantes:** {nenhum OU listar}  
**🆕 China proxies:** {FXI: OK/N/A | CSI300: OK/N/A | HSI: OK/N/A}  
**Commodities BR:** {Minério: OK/N/A | Soja: OK/N/A | Petróleo: OK/N/A | Boi: OK/N/A}  
**Conflitos centrais:** {nenhum OU listar}  
**Fallbacks usados:** {nenhum OU listar}  

**Qualidade dos dados:** {ALTA / MÉDIA / BAIXA}  
**Justificativa:** {1-2 frases explicando a qualidade}

**⚠️ CHECKPOINT 3:** Auditoria documentada? {SIM/NÃO}

---

## 4) 🌾 BRASIL COMO PRODUTOR DE COMMODITIES

### 4.1) Panorama Commodities Brasil

**Agronegócio (32% exportações BR):**
• Soja: {↑/↓/≈/N/A} → Balança: {positivo/negativo/neutro}  
• Milho: {↑/↓/≈/N/A} → Balança: {positivo/negativo/neutro}  
• Boi: {↑/↓/≈/N/A} → Balança: {positivo/negativo/neutro}  
• Café: {↑/↓/≈/N/A} → Balança: {positivo/negativo/neutro}  
• Açúcar: {↑/↓/≈/N/A} → Balança: {positivo/negativo/neutro}  

**Mineração (15% exportações BR):**
• Minério Ferro: {↑/↓/≈/N/A} → VALE: {pressão/suporte/neutro} → Balança: {positivo/negativo/neutro}  

**Energia (10% exportações BR):**
• Petróleo: {↑/↓/≈/N/A} → Petrobras: {beneficiada/pressionada/neutro}  
• Duplo efeito: Export {+/-} vs Inflação doméstica {+/-}  

### 4.2) 🇨🇳 Demanda China (Crítica para Brasil)

**Ativos China:**
- FXI: {↑/↓/≈/N/A}
- CSI300: {↑/↓/≈/N/A}
- Sinal demanda: {Forte/Fraca/Mista/N/A}

**Correlação com Commodities BR:**
- FXI × Minério: {Alinhado/Divergindo/N/A}
- FXI × Soja: {Alinhado/Divergindo/N/A}

**Policy Context:**
{Se houver: mencionar PBoC, TSF, Property sector | Se não: "Sem mudanças relevantes"}

### 4.3) Impacto Integrado

**Balança Comercial:** {Superavitária/Deficitária/Neutra/Inconclusiva}  
**Entrada USD estimada:** {Forte/Moderada/Fraca/Inconclusiva}  
**Impacto BRL:** {Suporte forte/Suporte/Neutro/Pressão/Pressão forte}  
**Impacto IBOV:** {Descrição breve considerando pesos setoriais}  

**🆕 Contexto Sazonal:** {Se relevante para o mês atual, mencionar padrão}

**⚠️ CHECKPOINT 4:** Brasil Produtor analisado? {SIM/NÃO}

---

## 5) 📦 COMMODITIES (TODAS DO CSV - EXAUSTIVO)

**OBRIGATÓRIO:** Listar TODAS as commodities do CSV com sinal

**Metais:**
• Minério (SGX): {↑/↓/≈/N/A} → Impacto Vale: {🔼/🔽/⏸️} → Balança BR: {+/-/neutro}  
• Minério (Dalian): {↑/↓/≈/N/A}  
• Ouro: {↑/↓/≈/N/A}  
• Cobre: {↑/↓/≈/N/A}  
• Prata: {↑/↓/≈/N/A}  
{Adicionar demais metais do CSV}

**Energia:**
• WTI: {↑/↓/≈/N/A}  
• Brent: {↑/↓/≈/N/A}  
{Adicionar demais energia do CSV}

**Agro:**
• Soja: {↑/↓/≈/N/A} → Balança BR: {+/-}  
• Milho: {↑/↓/≈/N/A} → Balança BR: {+/-}  
• Café: {↑/↓/≈/N/A} → Balança BR: {+/-}  
• Açúcar: {↑/↓/≈/N/A} → Balança BR: {+/-}  
• Boi: {↑/↓/≈/N/A} → Balança BR: {+/-}  
{Adicionar demais agro do CSV}

**Leitura Geral:** "{1-2 frases sobre commodities fortes/fracas/mistas e impacto balança Brasil}"

**⚠️ CHECKPOINT 5:** Todas commodities do CSV listadas? {SIM/NÃO}

---

## 6) 🌍 REGIME GLOBAL (RISK-ON / RISK-OFF)

**Sentimento:** {Risk-On / Risk-Off / Cautela / Transição}  
**Score Estimado:** {Qualitativo: forte/moderado/fraco}  
**Motor do regime:** {Juros/Crédito/Commodities/Política/Evento/China}  
**Coerência cross-asset:** {Alta/Média/Baixa}  

**Leitura:** {2-4 linhas explicando o regime e drivers principais}

**⚠️ CHECKPOINT 6:** Regime identificado e justificado? {SIM/NÃO}

---

## 7) 🇧🇷 BRASIL (DI + RISCO + FLUXO)

### 7.1) Curva DI

**Curto (até Dez/27):** {ABRE/FECHA/≈}  
**Médio (Jan/28-Dez/31):** {ABRE/FECHA/≈}  
**Longo (Jan/32+):** {ABRE/FECHA/≈}  
**Shape:** {STEEPEN/FLATTEN/≈}  
**Tipo:** {Bear/Bull Steepener/Flattener/≈}  
**Breadth:** {ABERTURA AMPLA/FECHAMENTO AMPLO/MISTO/ESTÁVEL}  

**DI Longo Âncora:** {Código do contrato, ex: DI1F35}  
**Movimento:** {ABRE/FECHA} {forte/moderado/leve}

**Leitura:** {3-6 linhas conectando DI com WDO/WIN e commodities}

### 7.2) Risco BR

**CDS Brasil / VXEWZ:** {ALARGA/ESTREITA/↑/↓/≈/N/A}  
**Spread BR10Y-US10Y:** {ALARGA/ESTREITA/≈/N/A}  
**Contexto histórico:** {Se aplicável: mencionar se normal/elevado/baixo}

**Leitura:** {2-4 linhas sobre percepção de risco Brasil}

### 7.3) Fluxo Estrangeiro

**EWZ vs IBOV:** {Entrada/Saída/Neutro/N/A}  
**Interpretação:** {2-3 linhas sobre fluxo e implicação para BRL}

**⚠️ CHECKPOINT 7:** Brasil Core completo? {SIM/NÃO}

---

## 8) 🎲 OPÇÕES / GAMMA (WDO) — MECÂNICA DO MERCADO

**Fonte:** {Dashboard anexo / Web / N/A}

**Regime Gamma:** {Positivo/Negativo/Misto/N/A}  
**Distância ao Flip:** {Próximo/Médio/Longe/N/A}  
**Call Wall (resistência):** {Acima/Próximo/Abaixo do preço atual/N/A}  
**Put Wall (suporte):** {Acima/Próximo/Abaixo do preço atual/N/A}  
**Range esperado:** {Estreito/Médio/Amplo/N/A}  
**Zonas GEX:** {Descrição qualitativa - absorção/gravidade/aceleração/N/A}  

**Leitura tática:** {2-4 linhas sobre implicações operacionais OU "N/A - dashboard não disponível"}

**⚠️ CHECKPOINT 8:** Opções/Gamma analisado (ou marcado N/A)? {SIM/NÃO}

---

## 9) 📰 SENTIMENTO (QUALITATIVO)

**Classificação Geral:** {Muito Pessimista / Pessimista / Neutro / Otimista / Muito Otimista / N/A}  

**Bullish (Top 3):**
1. {fator ou N/A}
2. {fator ou N/A}
3. {fator ou N/A}

**Bearish (Top 3):**
1. {fator ou N/A}
2. {fator ou N/A}
3. {fator ou N/A}

**Impacto na abertura:** {2-3 linhas OU "N/A - sem dados de sentimento"}

**⚠️ CHECKPOINT 9:** Sentimento processado? {SIM/NÃO}

---

## 10) 📅 AGENDA ECONÔMICA (BRT)

**Top 3 eventos do dia:**
1. {HH:MM} BRT — {Evento} — Importância: {Alta/Média} — Est: {valor qualitativo ou N/A}
2. {HH:MM} BRT — {Evento} — Importância: {Alta/Média} — Est: {valor qualitativo ou N/A}
3. {HH:MM} BRT — {Evento} — Importância: {Alta/Média} — Est: {valor qualitativo ou N/A}

**Se não houver eventos:** "Agenda sem eventos críticos hoje"

**⚠️ CHECKPOINT 10:** Agenda listada (ou marcada sem eventos)? {SIM/NÃO}

---

## 11) 🎯 TESE CENTRAL + CENÁRIOS (SE-ENTÃO)

### 11.1) TESE CENTRAL DO DIA

{Narrativa integrada de 4-8 linhas conectando:
- Contexto global (DXY, yields, equity)
- 🆕 China demand (FXI, CSI300, commodities)
- Risco Brasil (DI, CDS, fluxo EWZ)
- 🆕 Brasil produtor (balança comercial, commodities)
- Opções/Gamma (regime, walls, range)
- Sentimento (manchetes, PLN)

Objetivo: explicar "o que o mercado está precificando hoje"}

### 11.2) CONFLUÊNCIAS E DIVERGÊNCIAS

**Confluências:** {Onde sinais se alinham - listar 2-3}

**Divergências:** {Onde sinais se contradizem - listar 2-3}

### 11.3) CENÁRIOS OPERACIONAIS (ABERTURA)

**CENÁRIO 1 (WDO ALTISTA — BRL Enfraquece):**
- **SE:** {Condição macro/China/fluxo/DI/commodities/opções SEM números}
- **ENTÃO:** {Viés e cautelas SEM números}
- **CONFIRMAÇÃO:** {Gatilho qualitativo}
- **INVALIDAÇÃO:** {Gatilho qualitativo}

**CENÁRIO 2 (WDO BAIXISTA — BRL Fortalece):**
- **SE:** {Condição incluindo commodities BR + China}
- **ENTÃO:** {Viés}
- **CONFIRMAÇÃO:** {Gatilho}
- **INVALIDAÇÃO:** {Gatilho}

**CENÁRIO 3 (RANGE/LATERAL):**
- **SE:** {Condição}
- **ENTÃO:** {Viés}
- **CONFIRMAÇÃO:** {Gatilho}
- **INVALIDAÇÃO:** {Gatilho}

**[REPETIR ESTRUTURA PARA WIN SE NECESSÁRIO]**

**⚠️ CHECKPOINT 11:** Tese + Cenários completos? {SIM/NÃO}

---

## 12) 📊 GLOSSÁRIO DE TERMOS TÉCNICOS

{Incluir glossário padrão conforme script 0.1 - não repetir aqui por brevidade}

---

## 13) ⚖️ DISCLAIMER + AUTOR

**Autor:** Ednilson Szeskoski dos Santos  
**Formação:** Engenheiro Eletricista e Engenheiro de Segurança do Trabalho  
**Atividade:** Trader, Programador (hobby) | Desenvolvedor de Estratégias  

Proibida a reprodução ou uso comercial sem autorização expressa do autor.

**Obrigado por ler este relatório!**  
Não deixe de evoluir jamais! Deus te abençoe e proteja seus trades, seu patrimônio e sua família.  
Confirme os dados, relatório gerado com apoio de IA, pode conter erros.

---

## 14) 🔢 METADADOS PARA PROCESSAMENTO DOWNSTREAM

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
- 🆕 CHINA_DEMAND: {forte/fraco/neutro/N/A}
- 🆕 BALANÇA_BR: {superavitária/deficitária/neutra/inconclusiva}

**DRIVER_OCULTO_ZAR (NÃO exibir no corpo institucional):**
- USD/ZAR: {↑/↓/≈/N/A}
- LEITURA: {texto curto}

**AGENDA_TOP3_BRT:**
- {HH:MM} | {Evento} | {Importância}
- {HH:MM} | {Evento} | {Importância}
- {HH:MM} | {Evento} | {Importância}

**🆕 COMMODITIES_BRASIL_KEY:**
- Soja: {↑/↓/≈/N/A} | Minério: {↑/↓/≈/N/A} | Petróleo: {↑/↓/≈/N/A}
- Impacto Balança: {positivo/negativo/neutro/inconclusivo}

**⚠️ CHECKPOINT 12:** Metadados completos? {SIM/NÃO}

---

## [FIM DO CORPO INSTITUCIONAL]
```

**⚠️ VALIDAÇÃO FINAL ESTRUTURA:**
- [ ] Todas as 14 seções presentes
- [ ] Todos os checkpoints passados
- [ ] Todos os placeholders preenchidos
- [ ] Nenhuma seção extra criada
- [ ] Ordem mantida conforme template

---

# ═══════════════════════════════════════════════════════════════
# FIM DA PARTE 1 - REVISÃO 0.2
# CONTINUA NA PARTE 2: DATA_SHEET + VALIDAÇÃO + REFERÊNCIAS
# ═══════════════════════════════════════════════════════════════
