# Auto Evolution - EDI Agent

Sistema de evolução autônoma do agente.

## Como Funciona
1. Detecta problemas automaticamente
2. Implementa correções quando seguro
3. Registra mudanças em evolution_log.md
4. Mantém histórico de versões

## Regras de Autonomia
- ✅ Pode: Corrigir bugs, limpar código, adicionar validações
- ✅ Pode: Criar testes, atualizar documentação
- ⚠️ Cuidado: Refatorar estrutura (verificar impacto)
- ❌ Não: Deletar arquivos sem confirmação
- ❌ Não: Mudar interfaces públicas
- ❌ Não: Alterar configurações de produção