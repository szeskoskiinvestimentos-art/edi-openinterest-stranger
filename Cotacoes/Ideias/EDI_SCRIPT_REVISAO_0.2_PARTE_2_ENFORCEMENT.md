# 🌐 EDI — SCRIPT MASTER REVISÃO 0.2 (PARTE 2 - ENFORCEMENT MODE)
**DATA_SHEET Obrigatório + Validação + Módulos Técnicos**

---

# ═══════════════════════════════════════════════════════════════
# SEÇÃO 15: ANEXO A — DATA_SHEET (OBRIGATÓRIO - NÚMEROS PERMITIDOS)
# ═══════════════════════════════════════════════════════════════

## [DATA_SHEET_MANDATORY_STRUCTURE]

### ⚠️ REGRA CRÍTICA:
**ESTA É A ÚNICA SEÇÃO ONDE NÚMEROS EXATOS SÃO PERMITIDOS**

O DATA_SHEET deve conter TODAS as tabelas abaixo, mesmo que com "N/A" nas células.

---

```markdown
# ANEXO A — DATA SHEET (NÚMEROS EXATOS)

**Data:** {DD/MM/AAAA}  
**Horário Dados:** {HH:MM BRT}  
**Fonte Primária:** {CSV / Web / Misto}  

---

## A1) GLOBAL

### Treasuries US

| Ativo      | Último  | Var (bps) | Yield (%) | Fonte       |
|------------|---------|-----------|-----------|-------------|
| US2Y       | {valor} | {±XX}     | {X.XXX%}  | {CSV/Web}   |
| US5Y       | {valor} | {±XX}     | {X.XXX%}  | {CSV/Web}   |
| US10Y      | {valor} | {±XX}     | {X.XXX%}  | {CSV/Web}   |
| US30Y      | {valor} | {±XX}     | {X.XXX%}  | {CSV/Web}   |

### Curva Shape

| Spread     | Valor (bps) | Movimento  | Interpretação           |
|------------|-------------|------------|-------------------------|
| 2s10s      | {XXX}       | {↑/↓/≈}    | {STEEPEN/FLATTEN/≈}     |
| 5s30s      | {XXX}       | {↑/↓/≈}    | {STEEPEN/FLATTEN/≈}     |

### Índices US

| Ativo      | Último    | Var (%)   | Var (pts) | Volume      |
|------------|-----------|-----------|-----------|-------------|
| ES/SPY     | {X,XXX.XX}| {±X.XX%}  | {±XX.XX}  | {XXX Mi}    |
| NQ/QQQ     | {X,XXX.XX}| {±X.XX%}  | {±XX.XX}  | {XXX Mi}    |
| DIA/YM     | {XX,XXX}  | {±X.XX%}  | {±XXX}    | {XXX Mi}    |

### FX Majors

| Par        | Último    | Var (%)   | Range Diário        |
|------------|-----------|-----------|---------------------|
| DXY        | {XXX.XX}  | {±X.XX%}  | {XXX.XX - XXX.XX}   |
| EUR/USD    | {X.XXXX}  | {±X.XX%}  | {X.XXXX - X.XXXX}   |
| USD/JPY    | {XXX.XX}  | {±X.XX%}  | {XXX.XX - XXX.XX}   |
| GBP/USD    | {X.XXXX}  | {±X.XX%}  | {X.XXXX - X.XXXX}   |

### Volatilidade

| Ativo      | Último    | Var (%)   | Percentil Histórico |
|------------|-----------|-----------|---------------------|
| VIX        | {XX.XX}   | {±X.XX%}  | {XX percentil}      |
| VVIX       | {XXX.XX}  | {±X.XX%}  | {N/A ou valor}      |
| MOVE       | {XXX.XX}  | {±X.XX%}  | {N/A ou valor}      |

---

## A2) COMMODITIES (+ IMPACTO BALANÇA BRASIL)

### Metais

| Commodity       | Último      | Var (%)   | Impacto Vale | Impacto Balança BR | Peso Export BR |
|-----------------|-------------|-----------|--------------|--------------------| ---------------|
| Minério SGX     | ${XXX.XX}   | {±X.XX%}  | {🔼/🔽/⏸️}   | {Positivo/Negativo/Neutro} | 8% total |
| Minério Dalian  | ¥{XXX.XX}   | {±X.XX%}  | -            | -                  | -              |
| Ouro            | ${X,XXX.XX} | {±X.XX%}  | -            | -                  | -              |
| Prata           | ${XX.XX}    | {±X.XX%}  | -            | -                  | -              |
| Cobre           | ${X.XX}     | {±X.XX%}  | -            | Indireto           | -              |

### Energia

| Commodity       | Último      | Var (%)   | Impacto Petrobras | Impacto Balança BR | Peso Export BR |
|-----------------|-------------|-----------|-------------------|--------------------|----------------|
| WTI             | ${XX.XX}    | {±X.XX%}  | {🔼/🔽/⏸️}        | {Misto/Positivo/Negativo} | 10% total (exp vs inf) |
| Brent           | ${XX.XX}    | {±X.XX%}  | {🔼/🔽/⏸️}        | {Misto/Positivo/Negativo} | -          |
| Gás Natural     | ${X.XX}     | {±X.XX%}  | -                 | -                  | -              |

### Agro (CRÍTICO BRASIL)

| Commodity       | Último      | Var (%)   | Impacto Balança BR | Peso Export BR | Observação         |
|-----------------|-------------|-----------|--------------------| ---------------|--------------------|
| Soja (ZS)       | ${X,XXX.XX} | {±X.XX%}  | {Positivo/Negativo/Neutro} | 11% total | Maior exportador   |
| Farelo (ZM)     | ${XXX.XX}   | {±X.XX%}  | {Positivo/Negativo/Neutro} | -         | Subproduto soja    |
| Milho (ZC)      | ${XXX.XX}   | {±X.XX%}  | {Positivo/Negativo/Neutro} | 5% total  | 2º exportador      |
| Café (KC)       | ${XXX.XX}   | {±X.XX%}  | {Positivo/Negativo/Neutro} | 3% total  | Maior exportador   |
| Açúcar (SB)     | ${XX.XX}    | {±X.XX%}  | {Positivo/Negativo/Neutro} | 3% total  | Maior exportador   |
| Boi (LE)        | ${XXX.XX}   | {±X.XX%}  | {Positivo/Negativo/Neutro} | 5% total  | Top 3 exportador   |
| Algodão (CT)    | ${XX.XX}    | {±X.XX%}  | {Positivo/Negativo/Neutro} | -         | -                  |

**Resumo Balança BR:** {Superavitária/Deficitária/Neutra} — Entrada USD: {Forte/Moderada/Fraca}

---

## A3) BRASIL

### Futuros B3

| Ativo      | Último    | Var (%)   | Var (pts) | Prêmio vs Spot  | Volume      |
|------------|-----------|-----------|-----------|-----------------|-------------|
| WDO        | {X,XXX.XX}| {±X.XX%}  | {±XX.XX}  | {+XX pts}       | {XXX mil}   |
| WIN        | {XXX,XXX} | {±X.XX%}  | {±X,XXX}  | {+XXX pts}      | {XXX mil}   |

### Spot Brasil

| Ativo      | Último    | Var (%)   | Observação                |
|------------|-----------|-----------|---------------------------|
| USD/BRL    | {X.XXXX}  | {±X.XX%}  | Spot comercial            |
| IBOV       | {XXX,XXX} | {±X.XX%}  | Índice spot               |

### ETFs Brasil

| Ativo      | Último    | Var (%)   | Spread vs IBOV | Interpretação           |
|------------|-----------|-----------|----------------|-------------------------|
| EWZ        | ${XX.XX}  | {±X.XX%}  | {±X.XX%}       | {Entrada/Saída/Neutro}  |
| EWZS       | ${XX.XX}  | {±X.XX%}  | -              | Small caps              |

### Curva DI Brasil (Detalhada)

| Bucket  | Contratos Principais | Taxa Média | Var (bps) | Range Vencimentos   |
|---------|----------------------|------------|-----------|---------------------|
| Curto   | {DI1F26, DI1F27...}  | {XX.XX%}   | {±XX}     | Até Dez/2027        |
| Médio   | {DI1F28, DI1F30...}  | {XX.XX%}   | {±XX}     | Jan/2028-Dez/2031   |
| Longo   | {DI1F32, DI1F35...}  | {XX.XX%}   | {±XX}     | Jan/2032+           |

**DI Âncora (Maior Volume):** {Código} — Taxa: {XX.XX%} — Var: {±XX bps}

**Shape:** {STEEPEN/FLATTEN/≈}  
**Tipo:** {Bear/Bull Steepener/Flattener/≈}  
**Breadth:** {ABERTURA AMPLA (>70%)/FECHAMENTO AMPLO (>70%)/MISTO (40-70%)/ESTÁVEL (<40%)}

### Risco Brasil

| Indicador          | Valor     | Var (bps) | Contexto Histórico      |
|--------------------|-----------|-----------|-------------------------|
| CDS Brasil 5Y      | {XXX}     | {±XX}     | {Baixo/Moderado/Elevado/Stress} |
| VXEWZ (Vol ETF)    | {XX.XX}   | {±X.XX%}  | {Alto/Médio/Baixo}      |
| Spread BR10Y-US10Y | {XXX}     | {±XX}     | Normal: 600-800 bps     |

### Top Gainers/Losers Brasil

**Top 3 Altas:**

| Ticker | Nome          | Último    | Var (%)   | Setor       | Peso IBOV |
|--------|---------------|-----------|-----------|-------------|-----------|
| {VALE3}| {Vale}        | {R$ XX.XX}| {+X.XX%}  | {Mineração} | ~11%      |
| {...}  | {...}         | {...}     | {...}     | {...}       | {...}     |
| {...}  | {...}         | {...}     | {...}     | {...}       | {...}     |

**Top 3 Baixas:**

| Ticker  | Nome          | Último    | Var (%)   | Setor     | Peso IBOV |
|---------|---------------|-----------|-----------|-----------|-----------|
| {PETR4} | {Petrobras}   | {R$ XX.XX}| {-X.XX%}  | {Energia} | ~13%      |
| {...}   | {...}         | {...}     | {...}     | {...}     | {...}     |
| {...}   | {...}         | {...}     | {...}     | {...}     | {...}     |

---

## A4) AGENDA ECONÔMICA (DETALHADA)

| Horário | País  | Evento                  | Anterior | Consenso | Importância | Impacto Provável        |
|---------|-------|-------------------------|----------|----------|-------------|-------------------------|
| {HH:MM} | {BR}  | {Nome do evento}        | {valor}  | {valor}  | {Alta/Média}| {WDO ↑/↓ | WIN ↑/↓}    |
| {HH:MM} | {US}  | {Nome do evento}        | {valor}  | {valor}  | {Alta/Média}| {Descrição breve}       |
| {HH:MM} | {...} | {...}                   | {...}    | {...}    | {...}       | {...}                   |

**Se não houver eventos:** Marcar "Agenda sem eventos críticos"

---

## A5) OPÇÕES/GAMMA WDO (MÉTRICAS EXATAS)

**Fonte:** {Dashboard PDF / Barchart / Web / N/A}

### Níveis Estruturais

| Nível             | Valor (pts) | Distância do Spot | Função                      |
|-------------------|-------------|-------------------|-----------------------------|
| Call Wall         | {X,XXX}     | {+XX pts / -XX pts} | Resistência estrutural    |
| Put Wall          | {X,XXX}     | {+XX pts / -XX pts} | Suporte estrutural        |
| Gamma Flip        | {X,XXX}     | {+XX pts / -XX pts} | Inversão de regime        |
| Spot Atual        | {X,XXX}     | 0                 | Referência                  |

### Métricas de Mercado

| Métrica              | Valor         | Interpretação                           |
|----------------------|---------------|-----------------------------------------|
| Regime Gamma         | {Positivo/Negativo/Misto} | {Volatilidade suprimida/amplificada} |
| Delta Agregado       | {±X,XXX}      | {Pressão vendedora/compradora}          |
| Net GEX OI           | {XXX Mi}      | Liquidez para absorção                  |
| IV Implícita Anual   | {XX.XX%}      | Volatilidade esperada                   |
| Movimento Diário Impl| {±XXX pts}    | Range estatístico                       |

### Zonas GEX (Top 5)

| Strike | GEX (Mi)  | Tipo        | Função            | Gravidade       |
|--------|-----------|-------------|-------------------|-----------------|
| {X,XXX}| {±XXX}    | {Resistência/Suporte} | {Descrição} | {Alta/Média/Baixa} |
| {X,XXX}| {±XXX}    | {...}       | {...}             | {...}           |
| {X,XXX}| {±XXX}    | {...}       | {...}             | {...}           |
| {X,XXX}| {±XXX}    | {...}       | {...}             | {...}           |
| {X,XXX}| {±XXX}    | {...}       | {...}             | {...}           |

**Range Esperado Hoje:** Mínimo: {X,XXX} | Máximo: {X,XXX} (baseado em IV)

---

## A5.1) OPÇÕES DOLFUT (B3) — TOP STRIKES

**Fonte:** {B3 / Bloomberg / N/A}

| Strike  | OI Calls | OI Puts  | Net OI   | Sentimento | Reação Esperada         |
|---------|----------|----------|----------|------------|-------------------------|
| {X,XXX} | {XX,XXX} | {X,XXX}  | {+XX,XXX}| Bullish    | Resistência se atingir  |
| {X,XXX} | {XX,XXX} | {XX,XXX} | {≈0}     | Neutro     | Zona de equilíbrio      |
| {X,XXX} | {X,XXX}  | {XX,XXX} | {-XX,XXX}| Bearish    | Suporte se atingir      |
| {...}   | {...}    | {...}    | {...}    | {...}      | {...}                   |

---

## A5.2) OPÇÕES EWZ (CME) — CONVERSÃO PARA INDFUT

**Fonte:** {CME / Yahoo Finance / N/A}

| Strike EWZ | Equiv. INDFUT | OI      | Tipo  | Sentimento           | Função                  |
|------------|---------------|---------|-------|----------------------|-------------------------|
| ${XX.XX}   | {XXX,XXX pts} | {X,XXX} | Call  | Bullish institucional| Call wall global        |
| ${XX.XX}   | {XXX,XXX pts} | {X,XXX} | Put   | Bearish/Hedge        | Put wall institucional  |
| {...}      | {...}         | {...}   | {...} | {...}                | {...}                   |

**Conversão:** Strike EWZ ($) × Taxa USD/BRL = Equivalente INDFUT (pts)

---

## A6) 🆕 CHINA PROXY (DEMANDA COMMODITIES BRASIL)

**Fonte:** {CSV / Web / N/A}

| Ativo      | Último    | Var (%)   | Correlação BR    | Sinal Demanda     | Observação          |
|------------|-----------|-----------|------------------|-------------------|---------------------|
| FXI        | ${XX.XX}  | {±X.XX%}  | Minério +0.75    | {Bullish/Bearish/Neutro} | Large Cap China |
| CSI300     | {X,XXX.XX}| {±X.XX%}  | Vale +0.70       | {Bullish/Bearish/Neutro} | A-shares onshore |
| ASHR       | ${XX.XX}  | {±X.XX%}  | -                | {Confirma FXI}    | CSI 300 listado US  |
| MCHI       | ${XX.XX}  | {±X.XX%}  | -                | {Broad China}     | iShares MSCI China  |
| HSI        | {XX,XXX.XX}| {±X.XX%} | -                | {Sentiment HK}    | Hang Seng           |
| USD/CNY    | {X.XXXX}  | {±X.XX%}  | Yuan {forte/fraco}| FX pressure      | Offshore CNH        |

**Interpretação:** China demand {forte/fraco/misto/N/A} → {Bullish/Bearish/Neutro} para commodities BR  
**Policy Context:** {Se houver stimulus PBoC/TSF/Property, mencionar | Senão: "Sem mudanças relevantes"}

---

## A7) EMERGENTES & CARRY TRADE

### FX Emergentes

| Par        | Último    | Var (%)   | Correlação USD/BRL | Early Warning       |
|------------|-----------|-----------|--------------------| --------------------|
| USD/MXN    | {XX.XXXX} | {±X.XX%}  | +0.82              | {EM contagion}      |
| USD/ZAR    | {XX.XXXX} | {±X.XX%}  | +0.78 (calibrador) | {Fluxo EM favorable/desfavorable} |
| USD/CLP    | {XXX.XX}  | {±X.XX%}  | +0.70              | {Chile cobre}       |
| USD/COP    | {X,XXX.XX}| {±X.XX%}  | +0.65              | {Colômbia petróleo} |

### Carry Trade

| Par        | Último    | Var (%)   | Correlação BRL  | Sinal Carry         |
|------------|-----------|-----------|-----------------|---------------------|
| AUD/JPY    | {XXX.XX}  | {±X.XX%}  | +0.65           | {Building/Unwinding}|
| NZD/JPY    | {XX.XX}   | {±X.XX%}  | +0.60           | {...}               |
| EUR/JPY    | {XXX.XX}  | {±X.XX%}  | +0.70 (risk-on) | {...}               |

**Interpretação Carry:** {Building (risk-on) / Unwinding (risk-off) / Neutro}

---

## A8) SETORIAIS US (ROTAÇÃO)

| Setor  | Ticker | Último    | Var (%)   | Ranking | Regime         |
|--------|--------|-----------|-----------|---------|----------------|
| {...}  | {XL?}  | ${XXX.XX} | {±X.XX%}  | {1º}    | {Liderando}    |
| {...}  | {XL?}  | ${XXX.XX} | {±X.XX%}  | {2º}    | {...}          |
| {...}  | {...}  | {...}     | {...}     | {...}   | {...}          |
| {...}  | {XL?}  | ${XXX.XX} | {±X.XX%}  | {11º}   | {Atrasado}     |

**Rotação:** {Cíclicos liderando (risk-on) / Defensivos liderando (risk-off) / Misto}

---

## A9) CRÉDITO GLOBAL

| Indicador          | Valor     | Var (bps) | Sinal              |
|--------------------|-----------|-----------|---------------------|
| US HY Spread (HYG-LQD) | {XXX} | {±XX}     | {Alargando/Estreitando} |
| EM Spread (EMB)    | {XXX}     | {±XX}     | {Alargando/Estreitando} |
| CDS US 5Y          | {XX}      | {±X}      | {...}               |

**Interpretação:** {Stress crédito / Melhora / Neutro} → {Impacto em BRL}

---

## A10) SAZONALIDADE BRASIL (CONTEXTO DO MÊS)

**Mês Atual:** {Nome do mês}

**Padrão Sazonal:**
- Agro: {Safra/Entressafra/Plantio} → {Impacto típico em commodities}
- Fiscal: {Eventos recorrentes: Copom, IPCA, etc}
- Clima: {La Niña/El Niño/Neutro} → {Impacto esperado}

**Eventos Recorrentes do Mês:**
- {Dia ~XX}: {Evento} (ex: IPCA)
- {Toda sexta}: Focus BC
- {Próximo Copom}: {Data se aplicável}

---

## [FIM DO DATA_SHEET]
```

**⚠️ VALIDAÇÃO DATA_SHEET:**
- [ ] Todas as seções A1-A10 presentes
- [ ] Todas as tabelas preenchidas (ou marcadas N/A)
- [ ] Todos os números com fonte identificada
- [ ] Nenhum número do DATA_SHEET apareceu no CORPO
- [ ] Formato de tabelas markdown correto

---

# ═══════════════════════════════════════════════════════════════
# SEÇÃO 16: VALIDAÇÃO FINAL OBRIGATÓRIA
# ═══════════════════════════════════════════════════════════════

## [MANDATORY_FINAL_VALIDATION]

```markdown
# ✓ VALIDAÇÃO FINAL DO RELATÓRIO

**Data:** {DD/MM/AAAA}  
**Horário Conclusão:** {HH:MM BRT}  
**Tempo de Processamento:** {X minutos}  

---

## CHECKLIST DE COMPLETUDE (OBRIGATÓRIO)

### Estrutura:
- [ ] 14 seções do CORPO presentes e na ordem correta
- [ ] DATA_SHEET completo (A1-A10)
- [ ] Todos os checkpoints (1-12) passados
- [ ] Convicção declarada no título
- [ ] Metadados para NotebookLM presentes

### Qualidade de Dados:
- [ ] CSV processado: {SIM/NÃO} → Ativos: {N}
- [ ] DI processado: {SIM/NÃO} → Contratos: {N}
- [ ] Gamma processado: {SIM/NÃO}
- [ ] Agenda processada: {SIM/NÃO}
- [ ] Web search usado: {SIM/NÃO}

### Cobertura Crítica:

**TIER 1 - Brasil Core:**
- [ ] WDO: {OK/PROXY/AUSENTE}
- [ ] WIN: {OK/PROXY/AUSENTE}
- [ ] DI Curva: {COMPLETA/PARCIAL/AUSENTE}
- [ ] EWZ: {OK/PROXY/AUSENTE}
- [ ] CDS/VXEWZ: {OK/AUSENTE}

**TIER 1.5 - China (Crítico):**
- [ ] FXI: {OK/AUSENTE}
- [ ] CSI300: {OK/AUSENTE}
- [ ] Pelo menos 1 China proxy: {OK/FALHA}

**Commodities Brasil:**
- [ ] Minério: {OK/AUSENTE}
- [ ] Soja: {OK/AUSENTE}
- [ ] Petróleo: {OK/AUSENTE}
- [ ] Boi: {OK/AUSENTE}
- [ ] Café: {OK/AUSENTE}

### Anti-Alucinação:
- [ ] CORPO sem números de preço/yield: {PASS/FAIL}
- [ ] Apenas direções (↑/↓/≈): {PASS/FAIL}
- [ ] Todos os números no DATA_SHEET: {PASS/FAIL}
- [ ] N/A usado quando sem dado: {PASS/FAIL}

### Template:
- [ ] Nenhuma seção extra criada: {PASS/FAIL}
- [ ] Ordem mantida: {PASS/FAIL}
- [ ] Formato markdown correto: {PASS/FAIL}

---

## RESUMO DE LACUNAS

**Críticos Faltando:** {N} → {listar ou "nenhum"}  
**China Proxies:** {FXI: status | CSI300: status}  
**Commodities BR:** {listar ausentes ou "completo"}  
**Fallbacks Usados:** {listar ou "nenhum"}  

---

## CONVICÇÃO FINAL

**Convicção:** {ALTA / MÉDIA / BAIXA}

**Justificativa:**
{2-4 linhas explicando por que ALTA/MÉDIA/BAIXA baseado em:
- Cobertura de dados
- Presença de China proxies
- Commodities BR completas
- Qualidade de fontes
- Conflitos identificados}

---

## SCORE DE CONFORMIDADE

**Estrutura:** {100% / X%} → {Todas seções presentes / Faltam: X}  
**Dados:** {ALTA / MÉDIA / BAIXA}  
**Anti-Alucinação:** {PASS / FAIL}  
**Template:** {PASS / FAIL}  

**NOTA FINAL:** {A+ / A / B / C / F}

---

## PRÓXIMOS PASSOS RECOMENDADOS

1. {Ação 1 se houver lacuna}
2. {Ação 2 se houver lacuna}
3. {Ou: "Relatório completo, pronto para uso operacional"}

---

**Validado por:** EDI Script REVISÃO 0.2 (Enforcement Mode)  
**Assinatura Digital:** EDI-VALID-{AAAAMMDD}-{CONVICÇÃO}
```

---

# ═══════════════════════════════════════════════════════════════
# MÓDULOS TÉCNICOS (REFERÊNCIA - NÃO APARECEM NO RELATÓRIO)
# ═══════════════════════════════════════════════════════════════

## [BRASIL_PRODUTOR_QUICK_REF]

**Pesos Exportação:**
- Agro: 32% (Soja 11%, Milho 5%, Boi 5%, Café 3%, Açúcar 3%)
- Mineração: 15% (Ferro 8%)
- Energia: 10% (Petróleo - duplo efeito)

**Correlações China:**
- FXI × Minério: +0.75
- FXI × Soja: +0.60
- CSI300 × VALE: +0.70

**Cenários Rápidos:**
- Commodities ↑↑ + China ↑ = WDO ↓↓ (balança superavit)
- Commodities ↓↓ + China ↓ = WDO ↑↑ (balança deficit)
- Petróleo ↑ isolado = Misto (export+ mas inf+)

---

## [CONVICTION_RULES_QUICK]

| Situação | Convicção |
|----------|-----------|
| 0 críticos faltando, 0 conflitos, China OK | ALTA |
| 1 crítico faltando OU China parcial | MÉDIA |
| 2+ críticos faltando OU China ausente | BAIXA |
| 3+ críticos faltando | BAIXA |

---

## [SIGNAL_VOCABULARY_QUICK]

- Preço: ↑/↓/≈
- Crédito: ALARGA/ESTREITA
- Taxas: ABRE/FECHA
- Curva: STEEPEN/FLATTEN
- Breadth: AMPLA/MISTA/ESTÁVEL

---

## [PROCESSING_ORDER_STRICT]

```
1. Ler TODOS os anexos
2. Processar CSV (normalizar, detectar, priorizar)
3. Processar DI (.xlsx)
4. Processar Gamma (PDF)
5. Processar Calendário
6. Web search (SE necessário E autorizado)
7. Preencher CORPO (qualitativo)
8. Preencher DATA_SHEET (números)
9. Validar
10. Entregar
```

---

# ═══════════════════════════════════════════════════════════════
# ENFORCEMENT PENALTIES (SISTEMA DE PENALIDADES)
# ═══════════════════════════════════════════════════════════════

## [VIOLATION_SYSTEM]

**Se o LLM violar o protocolo, aplicar:**

### 🔴 VIOLAÇÕES CRÍTICAS (FALHA AUTOMÁTICA):
- Criar seções fora do template → **REJECT REPORT**
- Números no CORPO institucional → **REJECT REPORT**
- Não processar anexos quando disponíveis → **REJECT REPORT**
- Convicção ausente → **REJECT REPORT**
- DATA_SHEET ausente → **REJECT REPORT**

### 🟡 VIOLAÇÕES MÉDIAS (REDUZIR NOTA):
- Seção fora de ordem → **Nota B**
- Placeholder não preenchido → **Nota B**
- Validação incompleta → **Nota B**

### 🟢 VIOLAÇÕES LEVES (ACEITAR COM RESSALVA):
- Formatação markdown incorreta → **Nota A-**
- N/A usado excessivamente (>30% dos dados) → **Nota A-**

---

# ═══════════════════════════════════════════════════════════════
# FIM DA PARTE 2 - REVISÃO 0.2
# CONTINUA NA PARTE 3: GUIA DE USO + TROUBLESHOOTING
# ═══════════════════════════════════════════════════════════════
