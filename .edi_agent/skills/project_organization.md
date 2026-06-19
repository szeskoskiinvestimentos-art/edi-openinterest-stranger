# Skill: Organização do Projeto Edi Market Guardian V0

## Propósito
Automatizar e padronizar a organização do projeto, incluindo limpeza, reorganização e manutenção.

## Quando Usar
- Quando arquivos estão desorganizados ou duplicados
- Quando há muitos arquivos órfãos ou legados
- Quando a estrutura de pastas não está padronizada
- Quando documentação está dispersa

## Processo Passo a Passo

### 1. Análise Inicial
1. Listar todos os arquivos e pastas
2. Identificar arquivos por tipo (HTML, JS, CSS, Python, etc.)
3. Marcar arquivos como: ATIVO, LEGADO, DADO, OUTPUT, CONFIG
4. Identificar duplicatas e órfãos

### 2. Classificação
- **ATIVO**: Usado pelo sistema atual
- **LEGADO**: Substituído por versão mais nova
- **DADO**: Dados gerados ou importados
- **OUTPUT**: Arquivos gerados por processamento
- **CONFIG**: Configurações do sistema

### 3. Ações de Limpeza
1. **Remover legados**: Arquivos completamente substituídos
2. **Consolidar duplicatas**: Manter apenas uma cópia
3. **Mover outputs**: Arquivos gerados para pasta específica
4. **Organizar configs**: Agrupar arquivos de configuração

### 4. Reorganização de Pastas
1. **Criar estrutura padrão**:
   ```
   src/          - Código fonte Python
   dashboard/    - Dashboards HTML/JS/CSS
   docs/         - Documentação
   scripts/      - Scripts de automação
   tests/        - Testes
   exports/      - Saídas geradas
   configs/      - Configurações
   ```
2. **Mover arquivos** para pastas corretas
3. **Atualizar referências** em scripts e navegação
4. **Verificar links** entre telas

### 5. Validação
1. Testar todas as rotas de navegação
2. Verificar se scripts funcionam
3. Confirmar que configs estão corretas
4. Documentar mudanças feitas

## Regras Importantes
- **NUNCA remover** arquivos sem verificar dependências
- **SEMPRE fazer backup** antes de grandes mudanças
- **REGISTRAR** todas as alterações no checkpoint
- **TESTAR** navegação após cada mudança

## Checklist de Organização
- [ ] Arquivos legados removidos
- [ ] Duplicatas consolidadas
- [ ] Estrutura de pastas padronizada
- [ ] Navegação verificada
- [ ] Documentação atualizada
- [ ] Checkpoint criado