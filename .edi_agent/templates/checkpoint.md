# Template: Checkpoint

> Use este template ao criar um novo checkpoint em `checkpoint_history/checkpoints.md`.

```markdown
## CP-XXX: [Título curto da tarefa]

- **Data/Hora**: YYYY-MM-DD HH:MM
- **Título**: [Descrição completa]
- **Status**: CONCLUÍDO | EM ANDAMENTO | BLOQUEADO | REVERTIDO
- **Prioridade**: ALTA | MÉDIA | BAIXA
- **Autor**: [EDI Agent | Usuário | Nome]

### Arquivos Afetados
- `caminho/arquivo1.py` (MODIFICADO | CRIADO | DELETADO)
- `caminho/arquivo2.js` (MODIFICADO | CRIADO | DELETADO)

### Descrição
[O que foi feito em 1-3 parágrafos]

### Antes vs Depois
**Antes**:
- [Estado anterior]

**Depois**:
- [Estado novo]

### Riscos Identificados
- [Risco 1]
- [Risco 2]

### Testes Realizados
- [x] Snapshot pre-run criado
- [x] Smoke test pós-execução
- [ ] Testes unitários (pendente)

### Métricas
- Linhas adicionadas: X
- Linhas removidas: Y
- Espaço recuperado: Z MB
- Arquivos modificados: N

### Próximos Passos
1. [Ação 1]
2. [Ação 2]

### Dependências
- Depende de: CP-XXX
- Desbloqueia: CP-XXX

### Rollback
Para reverter:
```bash
git checkout HEAD~1 -- caminho/arquivo
# ou
git revert <commit-hash>
```
```
