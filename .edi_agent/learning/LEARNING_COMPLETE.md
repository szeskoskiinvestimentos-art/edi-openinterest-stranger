# Registro Completo de Aprendizado - EDI Market Guardian

**Consolidação:** 2026-06-19
**Fontes:** LEARNING.md, LEARNING_LOG.md, discoveries.md

---

## Padrões Identificados no Projeto

### 1. Estrutura de Dashboards
- **Padrão**: Cada dashboard (WDO, WIN, Correlation, MERCADO) usa `assets/js/`, `assets/data/`, `assets/css/`
- **Componente compartilhado**: `dashboard_unificado/shared/` contém `styles.css` e `unified-nav.js`
- **Navegação**: Sistema unificado via `unified-nav.js` com seletor dropdown + painel lateral (Ctrl+K)

### 2. Convenções de Código JavaScript
- **Classe principal**: `EDIApp` em `main.js` para cada dashboard
- **Inicialização**: Método `init()` que configura navegação, scroll, contextos
- **Charts**: Biblioteca Chart.js via CDN
- **Partículas**: Efeito visual em `particles.js`

### 3. Estrutura de Dados
- **Dados de mercado**: `market_quotes.json` ou `market_quotes.js` em `Cotacoes/dashboard/MERCADO/assets/data/`
- **Dados de opções**: CSV em `CSV_Indice/` e `CSV_Dolar/`
- **Configuração**: `src/config.py` com parâmetros manuais e ambiente

### 4. Padrões de Navegação
- **URLs relativas**: Dashboards usam caminhos relativos (`../`, `../../`)
- **Mapeamento de rotas**: `unified-nav.js` mapeia valores (HUB, WDO, WIN, MERCADO, CORR, CONTROLE) para caminhos
- **Destinos**:
  - HUB → `dashboard_unificado/index.html`
  - WDO → `dashboard_unificado/WDO/index.html`
  - WIN → `dashboard_unificado/WIN/index.html`
  - MERCADO → `Cotacoes/dashboard/MERCADO/index.html`
  - CORR → `dashboard_unificado/correlation/index.html`
  - CONTROLE → `controle_de_dados.html`

### 5. Convenções de Estilo
- **Tema**: Stranger Things (neon vermelho, ciano, roxo)
- **Fontes**: Orbitron (títulos), Share Tech Mono (corpo)
- **Variáveis CSS**: Definidas em `shared/styles.css`
- **Cards**: Classe `.metric-card` para métricas

### 6. Pipeline de Dados
- TypeScript em `Cotacoes/tools/market/`
- Módulos em `lib/` com 30+ arquivos
- Sistema de atualização automatizado

### 7. Sistema de Opções
- Python em `src/`
- Cálculos de Greeks, Gamma, Charm
- Geração de gráficos e relatórios

---

## Lições Aprendidas

### L1: Nunca modifier shared/unified-nav.js sem testar todas as telas
- O nav é usado por TODOS os dashboards
- Mudanças afetam HUB, WDO, WIN, CORR, MERCADO, CONTROLE

### L2: Caminhos relativos são frágeis
- `Cotacoes/dashboard/MERCADO/index.html` usa `../../dashboard_unificado/shared/styles.css`
- Melhor usar caminhos absolutos ou variáveis de ambiente

### L3: Arquivos duplicados entre WDO e WIN
- `main.js` e `charts.js` são quase idênticos entre WDO e WIN
- Oportunidade de refatoração: criar componente compartilhado

### L4: Dados hardcoded nos HTMLs
- WDO e WIN têm dados de exemplo hardcoded
- Devem ser carregados dinamicamente de JSON/CSV

### L5: Sempre versionar antes de grandes mudanças
### L6: Manter logs organizados com política de retenção
### L7: Evitar cópias - usar links ou módulos compartilhados

---

## Erros Identificados

### 1. Duplicação Perigosa
- `B3_System/dashboard_unificado/` é cópia quase completa
- Pode causar bugs silenciosos se divergirem

### 2. Acúmulo de Logs
- 520+ arquivos em `Cotacoes/.edi-market-guardin/logs/`
- Precisa de limpeza periódica

### 3. Arquivos Órfãos
- `Modernizacao` e `ProjetoGrafico` sem extensão
- Pastas vazias não utilizadas

---

## Descobertas Críticas (discoveries.md)

### Descoberta 7: Problemas Críticos de Cálculo
- **Categoria**: Matemática
- **Descrição**: Charm com sinal invertido em calculator.py:326-332
- **Impacto**: CRÍTICO - Afeta Dealer Pressure Index
- **Status**: ✅ Corrigido

### Descoberta 8: Inconsistência HVL Flip
- **Categoria**: Matemática
- **Descrição**: Duas funções usam bases de GEX diferentes
- **Impacto**: CRÍTICO - Resultados inconsistentes
- **Status**: ✅ Corrigido

### Descoberta 9: Mutação de Estado Global
- **Categoria**: Código
- **Descrição**: calculator.py:786 muta settings.SIGMA_FACTOR globalmente
- **Impacto**: MODERADO - Risco em ambiente concorrente
- **Status**: ✅ Corrigido

### Descoberta 10: 0DTE Restrito a Sexta-feira
- **Categoria**: Lógica
- **Descrição**: Delta Flip Profile só considera 0DTE em sexta
- **Impacto**: MODERADO - Inconsistência para vencimentos 0DTE em outros dias
- **Status**: ✅ Corrigido

### Descoberta 11: vercel.json Causa Loop Infinito
- **Categoria**: Infraestrutura
- **Descrição**: Rewrite catch-all `/(.*)` serve index.html que redireciona
- **Impacto**: CRÍTICO - Nenhum dashboard acessível em produção
- **Status**: ✅ Corrigido

### Descoberta 12: particles.js Duplicado 3x
- **Categoria**: Organização
- **Descrição**: 3 cópias de particles.js
- **Impacto**: BAIXO - Manutenção difícil
- **Status**: ✅ Consolidado

### Descoberta 13: Select Dropdown Inconsistente
- **Categoria**: UI
- **Descrição**: CORR, CONTROLE e MERCADO usam <option> sem <optgroup>
- **Impacto**: MÉDIO - UX inconsistente
- **Status**: ✅ Corrigido

### Descoberta 14: Auto_B3_System É Ativo (não legado)
- **Categoria**: Estrutura
- **Descrição**: Auto_B3_System contém automação Barchart
- **Impacto**: ALTO - Não pode ser removido
- **Ação**: Manter, limpar snapshots duplicados

### Descoberta 15: B3_System É Cache de Dados
- **Categoria**: Estrutura
- **Descrição**: B3_System armazena artefatos gerados copiados para dashboard_unificado
- **Impacto**: MÉDIO - Referenciado por scripts
- **Ação**: Manter

### Descoberta 16: .edi_system É Duplicata
- **Categoria**: Organização
- **Descrição**: .edi_system é versão anterior de .edi_agent
- **Impacto**: BAIXO - Redundância
- **Status**: ✅ Removido

### Descoberta 17: Vega por Unidade vs por 1%
- **Categoria**: Matemática
- **Descrição**: Vega calculado por unidade (100%), convenção é por 1%
- **Impacto**: BAIXO - Consistente se documentado
- **Status**: ✅ Documentado

### Descoberta 18: package.json Raiz Vazio
- **Categoria**: Limpeza
- **Descrição**: package.json na raiz contém apenas `{}`
- **Impacto**: BAIXO - Resíduo
- **Status**: ✅ Removido

### Descoberta 19: Arquivos Candidatos a Remoção
- **Categoria**: Limpeza
- **Descrição**: dashboard_v1/, START_DASHBOARD_V1.bat, PDF PreMercado/, etc.
- **Impacto**: MÉDIO - Ocupam espaço
- **Status**: ✅ Removidos

---

## Padrões Matemáticos Identificados

### Black-Scholes (src/greeks.py)
- Delta, Gamma, Vega, Theta calculados vetorizadamente
- Fórmulas padrão do mercado financeiro

### Exposições (src/calculator.py)
- Gamma Exposure (GEX)
- Delta Exposure
- Charm Exposure
- Vanna Exposure
- Dealer Pressure Index

### Correlações (dashboard_unificado/correlation/)
- Matriz de correlação Top 20 ativos
- Janela temporal configurável (default 60min)
- Supergráficos para análise visual

---

## Status das Descobertas

| Descoberta | Status |
|------------|--------|
| D7: Charm sinal invertido | ✅ Corrigido |
| D8: HVL Flip inconsistência | ✅ Corrigido |
| D9: Mutação estado global | ✅ Corrigido |
| D10: 0DTE restrito a sexta | ✅ Corrigido |
| D11: vercel.json loop infinito | ✅ Corrigido |
| D12: particles.js duplicado | ✅ Consolidado |
| D13: Select dropdown inconsistente | ✅ Corrigido |
| D14: Auto_B3_System ativo | ✅ Mantido |
| D15: B3_System cache dados | ✅ Mantido |
| D16: .edi_system duplicata | ✅ Removido |
| D17: Vega convenção | ✅ Documentado |
| D18: package.json vazio | ✅ Removido |
| D19: Arquivos candidatos remoção | ✅ Removidos |
