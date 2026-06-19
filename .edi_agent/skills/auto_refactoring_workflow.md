# Skill: Auto-Refatoração do Projeto

## Propósito
Realizar refatorações automáticas e documentadas, mantendo integridade do sistema.

## Quando Usar
- Quando código está desorganizado ou difícil de manter
- Quando há muitas duplicações
- Quando estrutura não segue padrões
- Quando performance pode ser melhorada

## Processo de Refatoração

### Fase 1: Análise
1. **Identificar problema**: O que precisa ser refatorado?
2. **Mapear dependências**: O que mais usa esse código?
3. **Avaliar risco**: Quais impactos podem ocorrer?
4. **Planejar solução**: Como resolver sem quebrar?

### Fase 2: Preparação
1. **Criar checkpoint**: Registrar estado atual
2. **Fazer backup**: Copiar arquivos importantes
3. **Documentar**: Criar plano de refatoração
4. **Testar**: Verificar se tudo funciona antes

### Fase 3: Execução
1. **Implementar mudanças**: Fazer refatoração
2. **Testar imediatamente**: Verificar se funciona
3. **Corrigir erros**: Ajustar problemas encontrados
4. **Validar**: Confirmar que tudo está OK

### Fase 4: Documentação
1. **Registrar mudanças**: Atualizar checkpoint
2. **Documentar**: Criar registro no auto_refactoring
3. **Atualizar docs**: Modificar documentação se necessário
4. **Notificar**: Informar sobre mudanças feitas

## Tipos de Refatoração

### 1. Limpeza de Código
- Remover código morto
- Simplificar lógica complexa
- Melhorar nomes de variáveis
- Organizar imports

### 2. Consolidação
- Unir arquivos duplicados
- Criar funções utilitárias
- Centralizar configurações
- Padronizar estruturas

### 3. Reorganização
- Mover arquivos para pastas corretas
- Reestruturar projetos
- Criar módulos lógicos
- Separar responsabilidades

### 4. Otimização
- Melhorar performance
- Reduzir uso de memória
- Otimizar consultas
- Implementar cache

## Ferramentas Disponíveis
- **Edit**: Para modificar arquivos
- **Bash**: Para executar scripts de verificação
- **Read**: Para analisar código existente
- **Grep**: Para buscar referências
- **Glob**: Para encontrar arquivos

## Checkpoints de Refatoração
Cada refatoração deve criar:
1. **Checkpoint ID**: Identificador único
2. **Arquivos afetados**: Lista completa
3. **Descrição antes**: Estado anterior
4. **Descrição depois**: Novo estado
5. **Motivo**: Por que foi necessário
6. **Riscos**: Possíveis impactos
7. **Status**: Em andamento/concluído/revertido

## Regras de Segurança
1. **NUNCA** refatorar código crítico sem confirmação
2. **SEMPRE** testar após cada mudança
3. **SEMPRE** manter backup
4. **SEMPRE** documentar mudanças
5. **SEMPRE** verificar dependências

## Exemplo de Fluxo
```
1. Detectar problema: particles.js duplicado em 3 locais
2. Analisar: shared/js/ é carregado por todas as telas
3. Decisão: Remover cópias locais, usar shared
4. Executar: Remover WIN/assets/js/particles.js
5. Testar: Verificar se WIN carrega corretamente
6. Documentar: Criar checkpoint CP-003
```