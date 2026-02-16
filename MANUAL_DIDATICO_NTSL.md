# MANUAL DIDÁTICO - INDICADOR NTSL (PROFIT CHART)

**Versão:** 2.0 (Edição Edi Open Interest)
**Objetivo:** Guia rápido de leitura visual e operacional para traders.

---

## 1. INTRODUÇÃO

O indicador **NTSL Edi Open Interest** projeta no gráfico do ProfitChart os "raios-X" do mercado de opções. Ele revela onde os grandes players (Market Makers) estão posicionados, criando barreiras invisíveis de preço.

Não é necessário ser um matemático para lucrar com ele. Basta entender o "código de cores" e como o preço reage a cada linha.

---

## 2. AS PAREDES (WALLS) - ONDE O MERCADO PARA

### A. CALL WALL (Linha Azul Escura)
*   **O que é:** O teto de concreto do mercado. O strike com maior volume de apostas na alta.
*   **Leitura:** Resistência máxima.
*   **Ação:** Evite comprar rompimentos aqui. Procure vendas ou realize lucro de compras.

### B. PUT WALL (Linha Vermelha Escura)
*   **O que é:** O chão de concreto do mercado. O strike com maior volume de apostas na baixa/proteção.
*   **Leitura:** Suporte máximo.
*   **Ação:** Evite vender rompimentos aqui. Procure compras.

### C. EDI EFFECTIVE WALLS (Linhas Ciano/Azul Claro - `clAqua`) **[NOVO]**
*   **O que é:** O "Centro de Gravidade" das paredes.
    *   Diferente das Walls comuns que mostram apenas um preço (ex: 5400), as **Effective Walls** calculam a média ponderada do dinheiro. Se há muito volume no 5400 e no 5350, a Effective Wall aparecerá no meio (ex: 5375).
*   **Leitura:** É a "verdadeira" barreira técnica.
    *   **Edi Effective Call:** A resistência real ajustada pelo volume.
    *   **Edi Effective Put:** O suporte real ajustado pelo volume.
*   **Estratégia:** Muitas vezes o preço fura a Wall tradicional mas para exatamente na Effective Wall. Use-a para refinar suas entradas ("sniper entries").

---

## 3. OS FLIPS - ONDE O JOGO MUDA

### A. GAMMA FLIP (Linha Fúcsia - `clFuchsia`)
*   **Modelo:** Agora utiliza o algoritmo **HVL Gaussian** (Alta Volatilidade Suavizada), muito mais preciso e com menos ruído que o modelo clássico.
*   **O que é:** O fiel da balança.
    *   **Acima da Linha Fúcsia:** Mercado Estável. Tende a subir devagar ou ficar lateral. (Compre fundos, venda topos).
    *   **Abaixo da Linha Fúcsia:** Mercado Instável/Volátil. Tende a movimentos rápidos e violentos.
*   **Operacional:**
    *   Preço cruzou a Fúcsia e fez pullback nela? É o setup clássico de reversão de tendência.

---

## 4. RESUMO OPERACIONAL ("COLA" DO TRADER)

1.  **Preço na Linha Vermelha (Put Wall)?**
    *   Procure COMPRA. (O chão está logo ali).
2.  **Preço na Linha Azul (Call Wall)?**
    *   Procure VENDA. (O teto está logo ali).
3.  **Preço na Linha Ciano (Edi Effective)?**
    *   Atenção redobrada. É o ajuste fino da barreira. Se segurar, confirma a Wall.
4.  **Preço cruzou a Linha Fúcsia (Flip)?**
    *   Mudança de comportamento.
    *   Se cruzou para cima: Mercado acalma/estabiliza.
    *   Se cruzou para baixo: Mercado acelera/estressa.

---
*Bons trades! Lembre-se: O indicador mostra a PROBABILIDADE, não o futuro.*
