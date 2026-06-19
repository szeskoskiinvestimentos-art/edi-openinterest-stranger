# Skill: Evolution Tracker

## Descrição
Rastreia evolução e mudanças no projeto.

## Estrutura de Registro

### 1. Checkpoints
- Data e hora
- Status do projeto
- Tarefas concluídas
- Problemas encontrados

### 2. Mudanças
- Arquivos modificados
- Funcionalidades adicionadas
- Bugs corrigidos
- Otimizações realizadas

### 3. Métricas
- Tamanho do projeto
- Número de arquivos
- Cobertura de testes
- Performance

## Formato de Registro

```markdown
## [DATA] - TÍTULO

### Status
- Concluído: [ ] / [x]
- Prioridade: Alta / Média / Baixa

### Mudanças
- Arquivo 1: descrição
- Arquivo 2: descrição

### Notas
- Observações importantes
```

## Arquivos de Controle

- `.edi_agent/evolution/EVOLUTION_LOG.md`
- `.edi_agent/evolution/IDEAS.md`
- `.edi_agent/evolution/IMPLEMENTED.md`

## Automação

### Checkpoints Automáticos
1. Após cada tarefa concluída
2. Antes de grandes mudanças
3. Diariamente (se houver atividade)

### Validações
1. Verificar integridade dos arquivos
2. Testar funcionalidades críticas
3. Confirmar links de navegação