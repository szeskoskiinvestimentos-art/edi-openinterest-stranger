# Plano de Correção e Auditoria do Sistema

Abaixo apresento o roteiro detalhado para atender aos pontos levantados na auditoria (`#problems_and_diagnostics`), focando na correção de erros de linter, reorganização do `dashboard.html`, aprimoramento do `index.html` e na correta decomposição da `Figura3`.

## 1. Correção de Erros e Linter (`run_notebook_headless.py`)
### Diagnóstico
- **Funções Duplicadas:** Funções como `greeks`, `compute_gamma_flip`, `inject_help` e `save_panel` estão definidas múltiplas vezes, causando confusão no interpretador e erros de linter.
- **Erro de Atributo (`dropna`):** O código tenta usar `.dropna()` em variáveis que podem ser `float` (escalares), gerando erro de tipo.
- **Variáveis Globais:** Cálculos críticos (Flip Lines, Walls) são feitos apenas na seção NTSL (final do script), ficando indisponíveis para os gráficos individuais gerados anteriormente.

### Ação
1.  **Remover Duplicatas:** Unificar as definições de funções. Manterei apenas uma versão robusta de cada função no topo do script ou em local apropriado.
2.  **Correção de Tipagem:** Refinar a verificação de `dropna` para garantir que só seja chamado em objetos pandas (Series/DataFrame).
3.  **Promoção de Variáveis:** Mover o bloco de cálculo de "Complex Elements" (Flip Lines, Call/Put Walls, Range High/Low) para **antes** da geração dos painéis individuais. Isso permitirá que *todos* os gráficos (Delta, Gamma, OI, etc.) herdem essas linhas de referência.

## 2. Decomposição Real da Figura 3
### Diagnóstico
- Atualmente, os "gráficos individuais" (`Delta_Agregado.html`, etc.) são gerados de forma simplificada, sem as linhas de contexto (Flips, Walls) que existem na Figura 3 completa.
- O usuário relatou "perda de informação na individualização".

### Ação
1.  **Injeção de Contexto:** Atualizar a função de geração dos painéis individuais para receber e plotar a lista de `shapes` completa (Flip Lines, Walls, Spot Line).
2.  **Padronização:** Garantir que `Delta_Agregado.html`, `Gamma_Exposure.html` e outros tenham exatamente a mesma riqueza visual da Figura 3 original, mas focados em sua métrica específica.

## 3. Reestruturação do `dashboard.html`
### Diagnóstico
- A ordem atual (NTSL -> Tabelas -> Gráficos) está invertida em relação ao solicitado.
- Faltam instruções de ajuda claras.

### Ação
- Alterar `build_dashboard_v2.py` para montar o HTML na seguinte ordem:
    1.  **Cabeçalho e Menu**
    2.  **Seção de Ajuda/Contexto** (Introdução ao Dashboard)
    3.  **Painéis Gráficos Interativos** (Principal foco)
    4.  **Tabelas Detalhadas**
    5.  **Indicador NTSL** (Rodapé técnico)

## 4. Reconstrução do `index.html`
### Diagnóstico
- O `index.html` atual está desorganizado e não linka o dashboard principal.

### Ação
- Criar uma rotina robusta de geração do `index.html` (dentro do `build_dashboard_v2.py` ou `run_all.py`) que:
    - Liste o **Dashboard Completo** com destaque.
    - Liste todos os relatórios/gráficos individuais categorizados.
    - Tenha um design limpo e responsivo.

## Resumo da Execução
1.  **Refatorar `run_notebook_headless.py`**: Limpeza de linter, unificação de funções e cálculo antecipado de linhas de referência.
2.  **Atualizar Geração de Gráficos**: Passar `common_shapes` (Flips/Walls) para todos os gráficos individuais.
3.  **Atualizar `build_dashboard_v2.py`**: Reordenar seções e incluir gerador de `index.html` aprimorado.
4.  **Validar**: Rodar o processo completo e verificar a integridade dos arquivos gerados.
