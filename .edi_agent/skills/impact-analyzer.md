# Skill: Impact Analyzer (LA1)

## Descrição
Avalia o **impacto** de uma mudança proposta em arquivos compartilhados do projeto EDI Market Guardian. Identifica todos os consumidores afetados (quem importa / usa o arquivo), estima o esforço de teste necessário, e classifica o risco da mudança.

## Quando Usar
- Antes de modificar qualquer arquivo em `dashboard_unificado/shared/*` (usado por TODAS as telas)
- Antes de modificar `src/calculator.py`, `src/greeks.py`, `src/config.py` (afeta todos os cálculos)
- Antes de modificar `unified-nav.js` (6 dashboards dependem)
- Antes de renomear/mover funções públicas

## Princípios

1. **Rastreabilidade reversa**: Para cada mudança proposta, encontrar TODOS os consumidores.
2. **Classificação de risco**: `BAIXO` (isolado), `MÉDIO` (1-3 consumidores), `ALTO` (4+ consumidores ou shared).
3. **Cobertura de teste**: Estimar % do código que precisa ser revalidado.

## Processo

### 1. Identificar arquivo(s) a modificar
- Listar paths completos
- Verificar se é arquivo compartilhado

### 2. Buscar referências
```bash
# Quem importa este módulo?
grep -r "from src.calculator" --include="*.py" .
grep -r "shared/unified-nav" --include="*.html" .
grep -r "EDIApp" --include="*.js" .
```

### 3. Classificar consumidores
- **Diretos**: Importam/usam o símbolo alterado
- **Indiretos**: Dependem de consumidores diretos
- **Downstream**: HTMLs/dashboards que renderizam dados afetados

### 4. Estimar esforço de teste
| # Consumidores | Esforço | Status |
|---|---|---|
| 1 | < 5 min | Seguro |
| 2-3 | 5-30 min | Validar manualmente |
| 4+ | 30-120 min | Requer run completo de testes |
| Shared (todos) | 2-4h | Requer snapshot pre + run de validação |

### 5. Recomendar estratégia
- **Mudança trivial + baixo impacto** → aplicar direto
- **Mudança com regressão potencial** → criar checkpoint antes
- **Mudança breaking** → deprecação gradual + flag de compatibilidade

## Saída Esperada

```markdown
## Análise de Impacto: [arquivo]

### Consumidores diretos
- `path1:linha` — usa X
- `path2:linha` — usa Y

### Consumidores indiretos
- `path3:linha` — depende de path1

### Classificação: MÉDIO (3 consumidores)

### Esforço estimado: 15 min (3 testes manuais)

### Recomendação: Aplicar com checkpoint pre-mudança
```
