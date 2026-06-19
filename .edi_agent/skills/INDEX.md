# Skills Index - EDI Agent

> **Versão consolidada** — Última atualização: 2026-06-19

## Skills de Refatoração e Organização

### 1. project-organizer
- **Arquivo**: `project-organizer.md`
- **Descrição**: Organiza estrutura de pastas, move órfãos, limpa resíduos.
- **Quando usar**: Desorganização, arquivos fora do lugar, duplicatas.

### 2. nav-optimizer
- **Arquivo**: `nav-optimizer.md`
- **Descrição**: Otimiza navegação entre telas (6 dashboards), verifica paths relativos, corrige links quebrados.
- **Quando usar**: Navegação inconsistente, links quebrados.

### 3. math-reviewer
- **Arquivo**: `math-reviewer.md`
- **Descrição**: Revisa cálculos Black-Scholes (WDO/WIN), valida fórmulas, identifica erros lógicos em Gregas, GEX, Charm, Vanna, Max Pain, etc.
- **Quando usar**: Dúvidas sobre precisão de cálculos financeiros.

### 4. code-refactorer
- **Arquivo**: `code-refactorer.md`
- **Descrição**: Refatora código de forma segura (extract function, rename, move, etc.) sem quebrar funcionalidade.
- **Quando usar**: Código pode ser simplificado, duplicação alta.

### 5. evolution-tracker
- **Arquivo**: `evolution-tracker.md`
- **Descrição**: Rastreia evolução e mudanças com checkpoints formais.
- **Quando usar**: Após grandes mudanças, para manter rastreabilidade.

### 6. auto_refactoring_workflow
- **Arquivo**: `auto_refactoring_workflow.md`
- **Descrição**: Workflow completo de auto-refatoração (4 fases: análise, preparação, execução, documentação).
- **Quando usar**: Refatorações complexas com risco.

### 7. project_organization
- **Arquivo**: `project_organization.md`
- **Descrição**: Skill detalhada para organização do projeto (análise → classificação → limpeza → reorganização → validação).
- **Quando usar**: Mesmo que project-organizer, mas com mais detalhes.

### 8. orchestration
- **Arquivo**: `orchestration.md`
- **Descrição**: Coordena múltiplas tarefas e subagentes em paralelo (fan-out/fan-in, pipeline, map-reduce).
- **Quando usar**: Tarefas complexas com dependências.

## Skills de Aprendizado (LA1–LA3)

### LA1: impact-analyzer
- **Arquivo**: `impact-analyzer.md`
- **Descrição**: Analisa impacto de mudanças em arquivos compartilhados. Identifica todos os consumidores afetados. Estima esforço de teste.
- **Quando usar**: Antes de modificar `shared/*`, `unified-nav.js`, `main-shared.js`, `src/calculator.py`, etc.

### LA2: priority-sorter
- **Arquivo**: `priority-sorter.md`
- **Descrição**: Classifica tarefas por risco × impacto. Sugere ordem de execução. Balanceia velocidade vs segurança.
- **Quando usar**: Ao iniciar uma sessão de refatoração, para definir o que atacar primeiro.

### LA3: regression-detector
- **Arquivo**: `regression-detector.md`
- **Descrição**: Compara comportamento antes/depois de mudanças. Identifica quebras sutis. Alerta sobre mudanças não intencionais.
- **Quando usar**: Após qualquer modificação em `src/calculator.py`, `src/greeks.py`, `unified-nav.js`, ou cálculos centrais.

## Como Criar Nova Skill

1. Criar arquivo `skills/<nome-skill>.md` com seções:
   - Descrição
   - Quando usar
   - Princípios / Regras
   - Processo passo a passo
   - Exemplos
2. Adicionar entrada neste `INDEX.md`
3. Registrar em `workspace/SESSION_LOG.md`

## Skills opencode Reais (Carregáveis)

Para skills carregáveis via ferramenta `skill` do opencode, ver diretório `templates/` e o arquivo `.edi_agent/templates/skill.md` para o template de empacotamento.
