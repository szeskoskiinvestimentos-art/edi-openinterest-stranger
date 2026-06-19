# Skill: Orquestração e Agilidade

## Propósito
Coordenar múltiplas tarefas e agentes de forma eficiente, maximizando produtividade.

## Quando Usar
- Quando há múltiplas tarefas paralelas
- Quando tarefas dependem umas das outras
- Quando precisa coordenar trabalho em equipe
- Quando quer otimizar tempo de execução

## Princípios de Orquestração

### 1. Paralelismo
- Executar tarefas independentes simultaneamente
- Usar subagentes para trabalho paralelo
- Evitar bloqueios desnecessários
- Maximizar uso de recursos

### 2. Sequenciamento
- Identificar dependências entre tarefas
- Executar tarefas na ordem correta
- Evitar gargalos
- Otimizar fluxo de trabalho

### 3. Priorização
- Tarefas críticas primeiro
- Dependências antes de dependentes
- Urgente sobre importante
- Complexo sobre simples

## Ferramentas de Orquestração

### 1. Task Tool
- Criar tarefas: `task({operation: "create", summary: "..."})`
- Iniciar: `task({operation: "start", id: "T1"})`
- Completar: `task({operation: "done", id: "T1"})`
- Bloquear: `task({operation: "block", id: "T1", event_summary: "..."})`

### 2. Actor Tool
- Subagentes paralelos: `actor({operation: "spawn", ...})`
- Executar trabalho: `actor({operation: "run", ...})`
- Esperar conclusão: `actor({operation: "wait", actor_id: "..."})`
- Enviar mensagens: `actor({operation: "send", ...})`

### 3. Workflow Tool
- Workflows complexos: `workflow({operation: "run", ...})`
- Esperar conclusão: `workflow({operation: "wait", run_id: "..."})`
- Cancelar: `workflow({operation: "cancel", run_id: "..."})`

## Padrões de Orquestração

### Padrão 1: Fan-Out/Fan-In
```
1. Criar múltiplas tarefas paralelas
2. Executar subagentes para cada tarefa
3. Esperar conclusão de todos
4. Combinar resultados
```

### Padrão 2: Pipeline
```
1. Tarefa 1: Análise
2. Tarefa 2: Planejamento (depende de 1)
3. Tarefa 3: Execução (depende de 2)
4. Tarefa 4: Validação (depende de 3)
```

### Padrão 3: Map-Reduce
```
1. Mapear trabalho em unidades pequenas
2. Executar cada unidade em paralelo
3. Reduzir resultados em output final
```

## Gestão de Estado

### 1. Checkpoints
- Criar checkpoint antes de iniciar
- Atualizar checkpoint durante execução
- Finalizar checkpoint ao concluir
- Usar para rollback se necessário

### 2. Progresso
- Reportar progresso regularmente
- Usar task status para acompanhamento
- Documentar bloqueios e soluções
- Manter histórico completo

### 3. Comunicação
- Enviar updates para tarefas
- Notificar conclusão de etapas
- Alertar sobre problemas
- Manter contexto atualizado

## Otimização de Performance

### 1. Paralelismo
- Usar subagentes para I/O paralelo
- Executar cálculos independentes simultaneamente
- Evitar wait desnecessário
- Monitorar uso de recursos

### 2. Cache
- Cache de resultados intermediários
- Reutilizar cálculos重复
- Evitar trabalho重复
- Invalidar cache quando necessário

### 3. Batch
- Agrupar operações similares
- Executar em lote quando possível
- Reduzir overhead de comunicação
- Otimizar uso de memória

## Exemplo de Orquestração

### Tarefa: Limpeza de Projeto
```
1. Criar tarefa T2: Limpeza
2. Criar subtarefas:
   - T2.1: Remover dashboard_v1
   - T2.2: Limpar chrome_profiles
   - T2.3: Mover Base Teorica
3. Executar T2.1, T2.2, T2.3 em paralelo
4. Esperar conclusão de todas
5. Validar resultados
6. Atualizar checkpoint
```

## Regras Importantes
1. **SEMPRE** criar tarefas antes de executar
2. **SEMPRE** usar subagentes para trabalho paralelo
3. **SEMPRE** reportar progresso
4. **SEMPRE** documentar decisões
5. **SEMPRE** validar antes de finalizar