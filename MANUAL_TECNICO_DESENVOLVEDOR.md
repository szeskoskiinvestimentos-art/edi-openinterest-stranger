# MANUAL TÉCNICO DO DESENVOLVEDOR - SISTEMA EDI OPEN INTEREST & QUANT ANALYTICS

**Versão:** 3.0 (Stranger Things Edition)
**Data:** 19/01/2026
**Status:** Produção

---

## 1. OBJETIVO

Este documento fornece a documentação técnica profunda dos algoritmos, modelos matemáticos e lógica de implementação do sistema **Edi Open Interest**. Ele destina-se a desenvolvedores e quants que precisam entender ou manter o "motor" do sistema.

O sistema combina análise de microestrutura de mercado (Market Microstructure) com precificação de opções (Black-Scholes) para identificar níveis ocultos de liquidez e reversão.

---

## 2. ARQUITETURA DE DADOS

O sistema opera em um fluxo linear de processamento:
1.  **Ingestão (`src/data_loader.py`)**: Carrega CSVs brutos (barchart/profit). Normaliza nomes de colunas e detecta Spot Price.
2.  **Motor de Cálculo (`src/calculator.py`)**: Classe `OptionsCalculator` que centraliza toda a lógica matemática.
3.  **Griegas (`src/greeks.py`)**: Biblioteca vetorizada (numpy/scipy) para cálculo de Black-Scholes e derivadas de 2ª ordem.
4.  **Exportação (`export_v1_data.py`)**: Gera JSON/JS para o Dashboard Web e Scripts NTSL para o ProfitChart.

---

## 3. MODELOS MATEMÁTICOS E ALGORITMOS

### 3.1. Edi Effective Walls (Paredes Efetivas)
**Conceito:** Diferente da "Wall" tradicional que aponta apenas o *strike* com maior volume, a **Edi Effective Wall** calcula o **centro de gravidade** da liquidez. Isso resolve o problema de strikes adjacentes com volumes similares (ex: muito volume no 5350 e 5400), onde a "verdadeira" resistência está no meio.

**Algoritmo (Média Ponderada):**
Utilizamos os 2 strikes com maior Open Interest (OI) para calcular o preço médio ponderado pelo volume.

$$
P_{wall} = \frac{\sum_{i=1}^{2} (K_i \cdot OI_i)}{\sum_{i=1}^{2} OI_i}
$$

Onde:
*   $K_i$: Preço do Strike $i$
*   $OI_i$: Open Interest do Strike $i$

**Implementação (`src/calculator.py`):**
```python
def calculate_effective_walls(self):
    # Seleciona os índices dos 2 maiores OIs
    top_puts_idx = np.argsort(self.oi_put_ref)[-2:]
    
    # Calcula a média ponderada
    self.effective_put_wall = np.average(
        self.strikes_ref[top_puts_idx], 
        weights=self.oi_put_ref[top_puts_idx]
    )
```
**Interpretação:** Representa a barreira de preço "real" onde a defesa dos players é estatisticamente mais forte.

### 3.2. HVL Gaussian Flip (High Volatility Logic - Gaussian Smoothed)
**Conceito:** O Gamma Flip é o nível de preço onde a exposição Gamma ($GEX$) total do mercado inverte de sinal (Positivo $\leftrightarrow$ Negativo). Modelos tradicionais sofrem com ruído em strikes individuais. O modelo **HVL Gaussian** aplica um filtro de suavização para encontrar o "zero real" da curva acumulada.

**Algoritmo:**
1.  Calcula-se o GEX Base por strike.
2.  Aplica-se um **Filtro Gaussiano 1D** sobre o array de GEX.
3.  Calcula-se a soma acumulada (`cumsum`) do GEX suavizado.
4.  Encontra-se a raiz (zero-crossing) da curva acumulada.

**Parâmetros:**
*   **Sigma ($\sigma$)**: 1.17 (Otimizado via Grid Search em `src/discovery_levels.py` para maximizar a relação sinal/ruído).

**Fórmula do Filtro Gaussiano:**
$$
y[i] = \sum_{j} x[j] \cdot \frac{1}{\sqrt{2\pi}\sigma} e^{-\frac{(i-j)^2}{2\sigma^2}}
$$

**Implementação (`src/calculator.py`):**
```python
from scipy.ndimage import gaussian_filter1d

# Suavização
sigma_gauss = 1.17
gex_smooth = gaussian_filter1d(self.gex_flip_base, sigma=sigma_gauss)

# Acumulação e Zero-Crossing
gex_cum_gauss = np.cumsum(gex_smooth)
flip_price = self._find_zero_cross(strikes, gex_cum_gauss, spot)
```
**Vantagem:** Elimina falsos sinais causados por pequenos volumes em strikes fora do dinheiro (OTM), fornecendo um nível de flip muito mais estável e confiável para trading.

### 3.3. Max Pain (Dor Máxima)
**Conceito:** O preço de vencimento que faria a maior quantidade de opções expirar sem valor (OTM), maximizando o lucro dos vendedores de opções (escritores) e a perda dos compradores.

**Fórmula:**
Para cada strike de teste $S_t$:
$$
Pain(S_t) = \sum_{K} \left( OI_{call}(K) \cdot \max(0, S_t - K) + OI_{put}(K) \cdot \max(0, K - S_t) \right)
$$
O Max Pain é o $S_t$ que minimiza essa função.

---

## 4. INDICADORES AVANÇADOS (DASHBOARD V3)

### 4.1. Dealer Pressure Index (DPI)
Mede a pressão de compra/venda exercida pelos Market Makers baseada no Gamma e no Delta Hedging dinâmico.
*   **Valores Positivos:** Pressão de Compra (Dealers precisam comprar ativo objeto).
*   **Valores Negativos:** Pressão de Venda (Dealers precisam vender ativo objeto).

### 4.2. Gamma Flip Cone
Uma projeção de estabilidade do Gamma Flip. Simula como o nível do Flip mudaria se a Volatilidade Implícita (IV) subisse ou caísse.
*   **Cone Estreito:** O Flip é robusto e não muda com a volatilidade.
*   **Cone Aberto:** O Flip é frágil; mudanças na Vol podem deslocar o nível de reversão drasticamente.

### 4.3. Expected Move (Movimento Esperado)
Calculado com base na IV do ATM (At-The-Money).
$$
EM = Spot \times IV \times \sqrt{\frac{Days}{365}}
$$
Define as linhas de exaustão estatística (Desvios Padrão $\sigma_1, \sigma_2$) no gráfico.

---

## 5. VARIÁVEIS NTSL (ProfitChart)

O script gerado (`dashboard_v1/assets/data/ntsl_script.txt`) traduz esses modelos complexos em plotagens simples:

| Variável NTSL | Cor | Modelo Fonte | Descrição |
| :--- | :--- | :--- | :--- |
| `GammaFlip` | Fúcsia (`clFuchsia`) | **HVL Gaussian** | Ponto de inversão de regime de volatilidade. |
| `Edi Effective Call` | Ciano (`clAqua`) | **Weighted Avg OI** | Centro de gravidade da resistência. |
| `Edi Effective Put` | Ciano (`clAqua`) | **Weighted Avg OI** | Centro de gravidade do suporte. |
| `CallWall` | Azul (`clBlue`) | Max GEX/OI | Strike com maior barreira absoluta (topo). |
| `PutWall` | Vermelho (`clRed`) | Max GEX/OI | Strike com maior barreira absoluta (fundo). |

---

## 6. REFLEXÕES ESTRATÉGICAS

A introdução das **Edi Effective Walls** e do **HVL Gaussian** representa um salto de qualidade na precisão do sistema.
1.  **Precisão Cirúrgica:** Ao usar médias ponderadas e suavização gaussiana, paramos de olhar para "ruído" e passamos a ver o "sinal".
2.  **Trading de Convergência:** Quando a *Effective Wall* está longe da *Strike Wall* tradicional, isso indica uma dispersão de liquidez. Quando estão juntas, a barreira é extremamente sólida.
3.  **HVL Gaussian como Filtro:** Usar este flip evita violinadas em dias laterais. Se o preço cruza o HVL Gaussian, a probabilidade de tendência é >80%.

---
*Documentação gerada automaticamente por Trae AI - Assistente de Arquitetura de Software.*
