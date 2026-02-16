# MANUAL DE USO - SISTEMA EDI OPEN INTEREST (DASHBOARD V1 & V3)

**Versão:** 3.0
**Tema:** Stranger Things (V1) / Quant Lab (V3)
**Data:** 19/01/2026

---

## 1. VISÃO GERAL

O sistema **Edi Open Interest** é uma suíte de análise de fluxo de opções. Ele processa dados brutos do mercado (arquivos CSV) e gera visualizações avançadas sobre o posicionamento dos grandes players (Market Makers).

### Módulos Principais:
1.  **Dashboard V1 (Stranger Things):** Interface web moderna, com gráficos animados e foco em experiência visual. Ideal para uso em telas secundárias durante o pregão.
2.  **Dashboard V3 (PDF/HTML):** Relatório analítico estático, focado em impressão e leitura detalhada.
3.  **Indicador NTSL (ProfitChart):** Scripts gerados automaticamente para plotar os níveis diretamente no gráfico do Profit.

---

## 2. GUIA RÁPIDO (PASSO A PASSO)

### Passo 1: Preparar os Dados
1.  Baixe os arquivos CSV de opções (ex: Barchart, ProfitChart).
2.  Salve-os na pasta `data_input` dentro do diretório do projeto.
    *   *Dica: O sistema aceita múltiplos arquivos (ex: vencimento atual e próximo).*

### Passo 2: Configurar Parâmetros
Abra o arquivo `src/config.py` e ajuste as variáveis essenciais:
```python
SPOT = 5.4095      # Preço atual do ativo (Dólar)
IV_ANNUAL = 0.13   # Volatilidade Implícita (13%)
USE_CSV_SPOT = False # Se True, tenta ler o Spot do CSV. Se False, usa o valor acima.
```

### Passo 3: Gerar o Dashboard (V1 - Stranger Things)
Abra o terminal na pasta do projeto e execute:
```bash
python export_v1_data.py
```
*   **O que acontece:** O sistema lê os dados, calcula todos os modelos (incluindo HVL Gaussian e Edi Walls) e atualiza os arquivos em `dashboard_v1/assets/data/`.
*   **Como visualizar:** Abra o arquivo `dashboard_v1/index.html` no seu navegador (Chrome/Edge).

### Passo 4: Atualizar o ProfitChart (NTSL)
1.  Após rodar o passo 3, o sistema gera um arquivo de texto com o código atualizado.
2.  Local: `dashboard_v1/assets/data/ntsl_script.txt`.
3.  **Ação:** Copie todo o conteúdo desse arquivo e cole no Editor de Estratégias do ProfitChart. Compile e aplique no gráfico.

---

## 3. INTERPRETANDO O DASHBOARD V1

### A. Níveis Chave (Key Levels)
No topo do dashboard, você verá cards com os valores críticos:
*   **Gamma Flip:** O "divisor de águas" da volatilidade (Modelo HVL Gaussian).
*   **Call Wall:** O teto de volume.
*   **Put Wall:** O piso de volume.
*   **Edi Effective Call/Put:** (Novos!) Os centros de gravidade das paredes. Use estes valores para refinar seus suportes e resistências.
*   **Max Pain:** O preço de "dor máxima" para o vencimento.

### B. Gráficos Principais
1.  **Open Interest (Strike):** Onde estão as apostas? Barras verdes (Call) vs Vermelhas (Put).
2.  **Gamma Exposure:** Onde o mercado pode acelerar? Barras grandes indicam zonas de "imã" ou "freio".
3.  **Dealer Pressure (V3):** (Novo!) Gráfico de linha laranja neon. Mostra a pressão de compra/venda dos dealers em cada nível de preço.

---

## 4. RESOLUÇÃO DE PROBLEMAS

**P: O Dashboard está zerado ou mostrando "Loading..."**
R: Provavelmente o script `export_v1_data.py` não rodou corretamente ou não encontrou os CSVs. Verifique o terminal para erros.

**P: Os valores do ProfitChart não batem com o Dashboard.**
R: Certifique-se de que você copiou o **último** script gerado em `ntsl_script.txt`. Os cálculos mudam a cada rodada de dados.

**P: O Gamma Flip está muito longe do preço.**
R: Verifique se a Volatilidade Implícita (`IV_ANNUAL`) no `config.py` está condizente com a realidade. Volatilidade errada desloca o flip.

---
*Desenvolvido por Edi Open Interest Team.*
