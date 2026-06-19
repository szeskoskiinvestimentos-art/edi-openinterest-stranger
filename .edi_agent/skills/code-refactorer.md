# Skill: Code Refactorer

## Descrição
Refatora código de forma segura e documentada.

## Princípios

1. **Não quebrar funcionalidade** - Manter comportamento existente
2. **Testar após cada mudança** - Verificar que tudo funciona
3. **Documentar decisões** - Registrar por que cada mudança foi feita
4. **Manter compatibilidade** - Não alterar interfaces públicas

## Processo

### 1. Análise
- Identificar code smells
- Verificar dependências
- Mapear impactos

### 2. Planejamento
- Criar lista de mudanças
- Estimar esforço
- Definir ordem de execução

### 3. Execução
- Fazer mudanças pequenas
- Testar cada mudança
- Commitar frequentemente

### 4. Verificação
- Rodar testes existentes
- Verificar linting
- Confirmar funcionalidade

## Padrões de Refatoração

### Extrair Função
```javascript
// Antes
function process() {
  // lógica longa
}

// Depois
function validate() { /* ... */ }
function transform() { /* ... */ }
function save() { /* ... */ }
function process() {
  validate();
  transform();
  save();
}
```

### Renomear Variável
```javascript
// Antes
const d = getData();

// Depois
const marketData = getData();
```

### Mover Código
```javascript
// Antes: código duplicado em vários arquivos

// Depois: função compartilhada em shared/utils.js
```