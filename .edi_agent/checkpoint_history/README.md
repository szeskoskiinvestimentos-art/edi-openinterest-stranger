# Checkpoint History - Edi Market Guardian V0

Sistema de registro de evolução para controle de versão interno.

## Propósito
- Manter registro de todas as tarefas realizadas
- Permitir retomada de trabalhos anteriores
- Criar pontos de controle para cada entrega
- Facilitar rollback e auditoria

## Estrutura
- `checkpoints.md` - Lista de todos os checkpoints
- `current_checkpoint.md` - Checkpoint atual
- `task_archive/` - Arquivo de tarefas concluídas

## Formato de Checkpoint
Cada checkpoint deve conter:
- **ID**: Identificador único (ex: CP-001)
- **Data/Hora**
- **Título**: Resumo da tarefa
- **Status**: em andamento, concluído, bloqueado
- **Arquivos Afetados**: lista de arquivos modificados
- **Descrição**: O que foi feito
- **Próximos Passos**: O que vem depois
- **Dependências**: Outras tarefas dependem desta
- **rollback_procedure**: Como reverter se necessário