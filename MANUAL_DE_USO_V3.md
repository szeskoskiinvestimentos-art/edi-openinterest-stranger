# Manual de Uso - Gamma Dashboard V3

Este documento serve como guia para utilização do **Gamma Dashboard V3**, uma ferramenta avançada de análise de fluxo de opções (Griegas, Open Interest, Flips e Walls) para o mercado financeiro.

---

## 1. Introdução

O Gamma Dashboard V3 processa dados brutos de opções (arquivos CSV) e aplica modelos matemáticos (Black-Scholes) para calcular a exposição dos *Market Makers* (Dealers). O objetivo é identificar níveis de suporte/resistência invisíveis e prever potenciais movimentos de mercado baseados no posicionamento institucional.

### O que a ferramenta entrega?
1.  **Dashboard Interativo (HTML)**: Um painel completo com gráficos de Delta, Gamma, Vanna, Charm, Vega e Open Interest.
2.  **Relatório PDF**: Um arquivo pronto para impressão ou distribuição com o resumo da análise.

---

## 2. Pré-requisitos

Antes de começar, certifique-se de que o ambiente está configurado (ver `README_V3.md` para instalação técnica):
*   Python instalado.
*   Bibliotecas instaladas (`python -m pip install -r requirements.txt`).
*   Navegadores do Playwright instalados (`python -m playwright install chromium`).

---

## 3. Fluxo de Trabalho Diário

Siga este roteiro a cada pregão para gerar o relatório atualizado.

### Passo 1: Obtenção dos Dados
Baixe os arquivos CSV de opções mais recentes (ex: do Barchart ou fonte similar).
*   **Local**: Salve os arquivos CSV na pasta raiz do projeto (onde está o `main.py`).
*   **Formato**: O sistema reconhece automaticamente arquivos com padrões de nome como `xdf...csv` ou `xdg...csv`.

### Passo 2: Configuração dos Inputs
Abra o arquivo `config/settings.py` em um editor de texto (Bloco de Notas, VS Code, etc.).
Você **DEVE** atualizar as variáveis abaixo com os dados do mercado atual:

```python
# ==========================================
# INPUTS DIÁRIOS (Atualize estes valores)
# ==========================================
SPOT = 5.40950          # Preço atual do ativo (ex: Dólar Futuro ou Spot)
IV_ANNUAL = 0.1318      # Volatilidade Implícita (13.18% = 0.1318)
DATAREF = dt.date.today() # Data de referência (geralmente não precisa mudar)
```

**Outros parâmetros importantes (se necessário ajustar):**
*   `RISK_FREE`: Taxa de juros livre de risco (Selic/DI).
*   `CONTRACT_MULT`: Multiplicador do contrato (padrão 50.000 para Dólar Cheio).

### Passo 3: Execução
Abra o terminal (Prompt de Comando ou PowerShell) na pasta do projeto e execute:

```bash
python main.py
```

O sistema irá:
1.  Ler os CSVs.
2.  Calcular todas as Griegas e níveis críticos.
3.  Gerar o arquivo `dashboard_v3.html`.
4.  Gerar o arquivo `dashboard_v3.pdf`.

### Passo 4: Análise
O sistema abrirá automaticamente o relatório no seu navegador. Você encontrará:

1.  **Resumo Executivo (Tabela)**:
    *   **Spot**: Preço atual.
    *   **Gamma Flip**: Nível onde o Gamma muda de positivo para negativo (zona de instabilidade).
    *   **Call Wall**: Maior concentração de Gamma positivo em Calls (Resistência forte).
    *   **Put Wall**: Maior concentração de Gamma positivo em Puts (Suporte forte).
    *   **Regime**: Indica se o mercado está em "Gamma Positivo" (baixa volatilidade/reversão à média) ou "Gamma Negativo" (alta volatilidade/tendência).

2.  **Gráficos (Menu Dropdown)**:
    *   **Delta Agregado**: Exposição direcional dos Dealers. Barras verdes = Dealers comprados (Long), Vermelhas = Vendidos (Short).
    *   **Gamma Exposure**: Potencial de aceleração do preço.
    *   **Open Interest (Call/Put)**: Contratos em aberto.
    *   **Charm/Vanna**: Efeitos de segunda ordem (passagem do tempo e mudança de volatilidade).

---

## 4. Solução de Problemas Comuns

**Erro: "Nenhum arquivo CSV encontrado"**
*   Verifique se você salvou os arquivos CSV na pasta correta (a mesma do `main.py`).
*   Verifique se o nome do arquivo segue o padrão esperado (`xdf...`, `xdg...`).

**Erro: "Spot Price seems wrong / Calculations exploded"**
*   Verifique se o valor do `SPOT` no `settings.py` está correto. Use ponto `.` para decimais, não vírgula `,`.
    *   Correto: `5.4095`
    *   Errado: `5,4095`

**Erro ao gerar PDF**
*   Se o script falhar na etapa final de PDF, verifique se o Playwright foi instalado corretamente (`python -m playwright install chromium`).
*   O relatório HTML continuará funcionando mesmo se o PDF falhar.

---

## 5. Dicas de Interpretação

*   **Gamma Flip**: Preço acima do Flip geralmente favorece baixa volatilidade. Preço abaixo do Flip favorece aceleração e alta volatilidade.
*   **Walls (Paredes)**: O mercado tende a respeitar a Call Wall como teto e a Put Wall como piso no curto prazo.
*   **Dealer Pressure**: Indicador proprietário que combina Delta, Gamma, Vanna e Charm. Valores positivos indicam pressão compradora por parte dos Dealers.

---
*Gerado por Gamma Dashboard V3 Team*
