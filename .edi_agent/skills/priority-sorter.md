# Skill: Priority Sorter (LA2)

## Descrição
Classifica tarefas de refatoração/evolução por uma matriz **Risco × Impacto** e sugere a **ordem ótima de execução**, balanceando velocidade de entrega contra segurança de não introduzir regressões.

## Quando Usar
- Ao iniciar uma sessão de refatoração grande (múltiplas tarefas)
- Quando há uma lista de melhorias candidatas em `EVOLUTION.md` ou backlog
- Quando precisa decidir "o que fazer primeiro"

## Princípios

1. **Crítico primeiro**: Bugs que afetam usuários reais > melhorias cosméticas.
2. **Dependências antes**: Tarefa que destrava outras vem antes.
3. **Baixo risco antes**: Quick wins para ganhar momentum.
4. **Alto impacto + baixo risco** = prioridade máxima.

## Matriz de Decisão

| Risco \ Impacto | Baixo | Médio | Alto |
|---|---|---|---|
| **Baixo** | Quick win | Top priority | Top priority |
| **Médio** | Backlog | Fazer 2º | Fazer 1º (com cuidado) |
| **Alto** | Adiar | Validar antes | Validar + checkpoint + run completo |

## Processo

### 1. Listar tarefas candidatas
- Bugs detectados em `EVOLUTION.md`
- Melhorias sugeridas em `EVOLUTION.md` (seção S*)
- Dívida técnica em `LEARNING_COMPLETE.md`
- Itens pendentes de `CHECKPOINT.md`

### 2. Para cada tarefa, estimar:
- **Impacto** (1-3): Quantos usuários/arquivos são afetados?
- **Risco** (1-3): Qual a chance de introduzir regressão?
- **Esforço** (1-3): Horas de trabalho
- **Dependências**: Bloqueia outras tarefas?

### 3. Calcular score
```
score = impacto * 2 - risco - (esforço * 0.5) + bonus_dependência
```
- `bonus_dependência` = +1 se desbloqueia outras, -1 se depende de outras

### 4. Ordenar por score desc

### 5. Aplicar em sequência
- Antes de cada: criar checkpoint
- Depois de cada: rodar smoke test
- Acumular commits granulares (não 1 mega-commit)

## Exemplo

| Tarefa | Impacto | Risco | Esforço | Dep | Score | Ordem |
|---|---|---|---|---|---|---|
| Corrigir path .edi_service_state.json | 3 (todos) | 1 (trivial) | 1 (5min) | desbloqueia | 3*2-1-0.5+1 = 5.5 | 1º |
| Adicionar smile de volatilidade | 2 | 3 (math crítico) | 3 (4h) | bloqueada | 4-3-1.5-1 = -1.5 | 5º |
| Consolidar docs .edi_agent | 2 | 1 | 1 | nenhuma | 4-1-0.5+0 = 2.5 | 2º |
| Implementar 3 skills aprendidas | 1 | 1 | 1 | nenhuma | 2-1-0.5+0 = 0.5 | 4º |
| Limpar Chrome profile | 3 (espaço) | 2 (perda de logins?) | 1 | nenhuma | 6-2-0.5+0 = 3.5 | 3º |

## Saída Esperada

```markdown
## Ordem de execução recomendada

1. **CRÍTICO** (fazer agora): Corrigir path .edi_service_state.json
2. **Quick win** (fazer hoje): Consolidar docs .edi_agent
3. **Espaço/Performance** (fazer hoje): Limpar Chrome profile
4. **Cosmético** (backlog): Implementar 3 skills
5. **Pesado** (validar antes): Smile de volatilidade
```
