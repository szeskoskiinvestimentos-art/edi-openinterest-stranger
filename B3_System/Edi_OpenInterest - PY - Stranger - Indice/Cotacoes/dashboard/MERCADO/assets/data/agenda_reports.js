window.AGENDA_REPORTS_SNIPPETS = {
    br: `# BRASIL — AGENDA & MATRIZ (OPERACIONAL)

## AGENDA (ALTA FREQUÊNCIA)
1. IPCA-15 — prévia do IPCA (por volta do dia 23–27, 9h00)
2. IBC-Br — “PIB do BC” (por volta do dia 15–18 do mês seguinte, 12h30)
3. Fluxo cambial semanal — Banco Central (quarta-feira, 12h30)
4. PMI e Índices de Confiança FGV — atividade futura (janelas ao longo do mês)
5. IPC-Fipe e IPC-S semanais — inflação de curto prazo

## MATRIZ (SE-ENTÃO) — BRASIL

### IPCA (IBGE) — Inflação Oficial
Divulgação: ~Dia 11 do mês, 9h00 | Impacto: ALTO

| Resultado | Interpretação Macro | WDO (Dólar) | WIN (Ibovespa) | Duração do Movimento |
|-----------|---------------------|-------------|----------------|----------------------|
| ACIMA do consenso | Inflação maior → BC mais hawkish → juros altos por mais tempo | COMPRA | VENDA | 5-30 min (pode estender) |
| NA LINHA do consenso | Sem surpresa → mercado já precificou | NEUTRO | NEUTRO | Ruído inicial, volta |
| ABAIXO do consenso | Inflação controlada → espaço para corte de juros | VENDA | COMPRA | 5-30 min (pode estender) |

### IPCA-15 (IBGE) — Prévia do IPCA
Divulgação: ~Dia 23-27 do mês, 9h00 | Impacto: MÉDIO-ALTO

| Resultado | Interpretação Macro | WDO (Dólar) | WIN (Ibovespa) | Duração do Movimento |
|-----------|---------------------|-------------|----------------|----------------------|
| ACIMA do consenso | Sinaliza IPCA cheio forte | COMPRA (moderada) | VENDA (moderada) | 3-15 min |
| NA LINHA do consenso | Neutro | NEUTRO | NEUTRO | Ruído |
| ABAIXO do consenso | IPCA cheio pode surpreender para baixo | VENDA (moderada) | COMPRA (moderada) | 3-15 min |

### Observações rápidas
- IPCA: olhar núcleos/serviços/difusão (pode mudar leitura do headline).
- IPCA-15: menos impacto que IPCA cheio, mas ancora expectativas.`,

    us: `# EUA — AGENDA & MATRIZ (OPERACIONAL)

## CONVERSAO ET->BRT
| ET | BRT (verão EUA) | BRT (inverno EUA) |
|------------|-------------------------|---------------------------|
| 6h00 | 7h00 | 8h00 |
| 8h15 | 9h15 | 10h15 |
| 8h30 | 9h30 | 10h30 |
| 9h00 | 10h00 | 11h00 |
| 9h15 | 10h15 | 11h15 |
| 9h45 | 10h45 | 11h45 |
| 10h00 | 11h00 | 12h00 |
| 10h30 | 11h30 | 12h30 |
| 14h00 | 15h00 | 16h00 |
| 14h30 | 15h30 | 16h30 |
| 16h00 | 17h00 | 18h00 |

## MATRIZ DE REACAO CRUZADA
| Cenário | Interpretação | Reação Dominante |
|---------|---------------|------------------|
| NFP forte + Wages fracos | Emprego sem pressão salarial | Moderadamente hawkish → DXY leve compra |
| NFP fraco + Wages fortes | Menos emprego mas inflação salarial | Confuso → esperar |
| CPI alto + Retail fraco | Inflação mas consumo caindo | Stagflation fears → Risk-off |
| CPI baixo + Retail forte | Consumo sem inflação | Goldilocks → S&P compra, DXY venda |
| ISM forte + Claims subindo | Atividade forte mas demissões | Aguardar clareza |
| GDP forte + PCE fraco | Crescimento sem inflação | Goldilocks → S&P compra forte |
| GDP fraco + PCE forte | Stagflation | Risk-off → S&P venda, DXY inicialmente compra |

### CPI (BLS) — Inflação (Headline/Core)
Divulgação: 8h30 ET | Impacto: ALTO

| Resultado | Interpretação Macro | WDO (Dólar) | WIN (Ibovespa) | Nota |
|-----------|---------------------|-------------|----------------|------|
| ACIMA do consenso | Fed mais hawkish (juros por mais tempo) | COMPRA | VENDA | DXY/US10Y tendem a subir; validar com VIX |
| NA LINHA do consenso | Sem surpresa → ruído inicial | NEUTRO | NEUTRO | Só operar se o preço confirmar |
| ABAIXO do consenso | Fed mais dovish (alívio) | VENDA | COMPRA | DXY/US10Y tendem a cair; pode virar risk-on |

### Payrolls (BLS) — NFP & Wages
Divulgação: 8h30 ET | Impacto: ALTO

| Resultado | Interpretação Macro | WDO (Dólar) | WIN (Ibovespa) | Nota |
|-----------|---------------------|-------------|----------------|------|
| NFP forte + Wages fortes | Hawkish forte (inflação salarial) | COMPRA | VENDA | Alto risco de whipsaw; evitar “chase” |
| NFP forte + Wages fracos | Hawkish moderado | COMPRA (leve) | NEUTRO | DXY tende a subir sem tanto stress |
| NFP fraco + Wages fortes | Confuso | NEUTRO | NEUTRO | Aguardar clareza; confirmar por DXY/US10Y |
| NFP fraco + Wages fracos | Dovish (alívio) | VENDA | COMPRA | DXY tende a cair; equities tendem a reagir bem |

### FOMC (Fed) — Decisão + Coletiva + Dot Plot
Divulgação: 14h00 ET (decisão) | Impacto: ALTO

| Resultado | Interpretação Macro | WDO (Dólar) | WIN (Ibovespa) | Nota |
|-----------|---------------------|-------------|----------------|------|
| Hawkish surprise | Aperto maior/mais longo | COMPRA | VENDA | DXY/US10Y ↑; cuidado com volatilidade |
| In line | Mercado já precificou | NEUTRO | NEUTRO | Foque nos níveis (VWAP/HI-LO) |
| Dovish surprise | Alívio/normalização | VENDA | COMPRA | DXY/US10Y ↓; pode melhorar apetite ao risco |

### PCE (BEA) — Inflação preferida do Fed
Divulgação: 8h30 ET | Impacto: ALTO

| Resultado | Interpretação Macro | WDO (Dólar) | WIN (Ibovespa) | Validar |
|-----------|---------------------|-------------|----------------|---------|
| ACIMA do consenso | Hawkish (juros por mais tempo) | COMPRA | VENDA | DXY • US10Y • VIX |
| NA LINHA do consenso | Sem surpresa | NEUTRO | NEUTRO | Preço/fluxo |
| ABAIXO do consenso | Dovish (alívio) | VENDA | COMPRA | DXY • US10Y • VIX |

### ISM — Atividade (Manufatura/Serviços)
Divulgação: 10h00 ET | Impacto: MÉDIO-ALTO

| Resultado | Interpretação Macro | WDO (Dólar) | WIN (Ibovespa) | Validar |
|-----------|---------------------|-------------|----------------|---------|
| ACIMA do consenso | Atividade forte (pode elevar yields) | COMPRA (leve) | COMPRA (se risk-on) | US10Y • SPX • HYG |
| NA LINHA do consenso | Neutro | NEUTRO | NEUTRO | Preço |
| ABAIXO do consenso | Desaceleração (pode virar risk-off) | COMPRA | VENDA | DXY • US10Y • VIX |

### Retail Sales (Census) — Consumo
Divulgação: 8h30 ET | Impacto: MÉDIO-ALTO

| Resultado | Interpretação Macro | WDO (Dólar) | WIN (Ibovespa) | Validar |
|-----------|---------------------|-------------|----------------|---------|
| ACIMA do consenso | Consumo forte (atividade) | DEPENDE (ver yields) | COMPRA (se risk-on) | US10Y • SPX |
| NA LINHA do consenso | Neutro | NEUTRO | NEUTRO | Preço |
| ABAIXO do consenso | Consumo fraco (risco) | COMPRA | VENDA | DXY • VIX |

## COMBINACOES PERIGOSAS
1. NFP + dado brasileiro no mesmo dia
2. CPI + PPI no mesmo período (pode ter ruído)
3. FOMC + Treasury Auction na mesma semana
4. Payroll sexta + FOMC quarta (semana muito volátil)
5. Dado importante + feriado prolongado`,

    cn: `# CHINA/HK — AGENDA & MATRIZ (OPERACIONAL)

## GATILHOS-CHAVE (TOP)
1. GDP (PIB)
2. Industrial Production (Produção Industrial)
3. Retail Sales (Vendas no Varejo)
4. NBS Manufacturing PMI (Oficial) / NBS Non-Manufacturing PMI
5. Caixin Manufacturing PMI / Caixin Services PMI
6. Trade Balance / Exports / Imports
7. TSF (Total Social Financing) / New Yuan Loans / M2
8. USD/CNY Fixing (PBoC) e sinais de intervenção (SAFE/PBoC)
9. Imobiliário (New Home Prices / Property Investment / Sales)

## MATRIZ (SE-ENTAO) — CHINA->BR (preencher)
| Evento China | Leitura | Commodities/BR | WDO | WIN | Nota |
|---|---|---|---|---|---|
| PMI (Oficial/Caixin) | ... | Minério/Cobre/Brent → termos de troca BR | ... | ... | ... |
| Exports/Imports | ... | China demand → commodities/EM | ... | ... | ... |
| TSF/M2/New Loans | ... | Liquidez China → risco global | ... | ... | ... |

## NOTAS (uso rápido)
- Use estes gatilhos como “âncoras” para mapear: China demand → commodities → EM → Brasil.
- Quando houver semana “pesada” (ex.: data dump China + FOMC), trate como regime de volatilidade mais alto.`,
};
