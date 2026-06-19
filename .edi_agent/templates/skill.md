# Template: Skill

> Use este template ao criar uma nova skill em `skills/`.

```markdown
# Skill: [Nome Curto]

## Descrição
[1-2 frases explicando o que a skill faz]

## Quando Usar
- [Situação 1]
- [Situação 2]
- [Situação 3]

## Princípios

1. **[Princípio 1]**: [Explicação]
2. **[Princípio 2]**: [Explicação]
3. **[Princípio 3]**: [Explicação]

## Processo

### 1. [Etapa 1]
[Descrição]

### 2. [Etapa 2]
[Descrição]

### 3. [Etapa 3]
[Descrição]

## Saída Esperada

```markdown
## [Template de output]
[estrutura esperada]
```

## Exemplos

### Exemplo 1: [Cenário]
[Input] → [Output]

### Exemplo 2: [Cenário]
[Input] → [Output]
```

## Notas
- [Nota adicional]
- [Limitação conhecida]
```

---

## Checklist de Criação

Ao criar uma skill, garantir:

- [ ] Arquivo criado em `.edi_agent/skills/<nome>.md`
- [ ] Seções: Descrição, Quando Usar, Princípios, Processo, Saída
- [ ] Adicionada entrada em `skills/INDEX.md`
- [ ] Registrada em `workspace/SESSION_LOG.md`
- [ ] Se for matemática, linkada em `evolution/MATH_REVIEW.md`
- [ ] Se for navegação, linkada em `dashboard_unificado/shared/SKILLS.md` (se existir)
