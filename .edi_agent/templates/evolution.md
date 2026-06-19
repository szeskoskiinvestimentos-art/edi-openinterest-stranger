# Template: Evolução / Descoberta

> Use este template ao registrar uma nova evolução ou descoberta em `evolution/EVOLUTION_COMPLETE.md`.

```markdown
## [YYYY-MM-DD] - [Título da Evolução]

### Contexto
[Por que essa evolução foi necessária]

### Mudança
[O que foi alterado em 1-2 parágrafos]

### Arquivos Afetados
| Arquivo | Tipo | Descrição |
|---|---|---|
| `path/file.py` | MODIFICADO | [O que mudou] |
| `path/file2.js` | NOVO | [O que faz] |

### Impacto
- **Positivo**: [Benefício]
- **Negativo**: [Trade-off]
- **Neutro**: [Observação]

### Validação
- [x] Teste manual executado
- [x] Snapshot pre-run criado
- [x] Diff pós-execução verificado
- [ ] Testes automatizados (pendente)

### Métricas (se aplicável)
| Métrica | Antes | Depois | Δ |
|---|---|---|---|
| Tempo de cálculo | X ms | Y ms | -Z% |
| Tamanho do profile | A MB | B MB | -C MB |
| Cobertura de testes | D% | E% | +F% |

### Rollback
Para reverter:
```bash
git revert <commit-hash>
```

### Lições Aprendidas
- [Lição 1]
- [Lição 2]
```

---

## Template: Descoberta (D)

```markdown
### D[N]: [Título Curto]

- **Data**: YYYY-MM-DD
- **Categoria**: Matemática | Lógica | Infraestrutura | UX | Organização
- **Severidade**: CRÍTICA | ALTA | MÉDIA | BAIXA
- **Status**: DETECTADA | EM ANÁLISE | CORRIGIDA | DOCUMENTAÇÃO

#### Descrição
[O que foi descoberto]

#### Impacto
[O que isso causa se não for tratado]

#### Recomendação
[Como corrigir]
```
