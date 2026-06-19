# Skill: Regression Detector (LA3)

## Descrição
Detecta **quebras sutis** (regressões) comparando o comportamento do sistema antes e depois de uma mudança. Especialmente útil para mudanças em cálculos matemáticos ou navegação central.

## Quando Usar
- Após modificar `src/calculator.py`, `src/greeks.py`, `src/config.py`
- Após modificar `dashboard_unificado/shared/unified-nav.js` ou `main-shared.js`
- Após alterar `scripts/export_v1_data.py` ou `scripts/update_spot_prices.py`
- Antes de fazer `git commit` de mudanças grandes

## Princípios

1. **Golden values**: Manter valores conhecidos de cálculos em `tests/golden_values.json`.
2. **Comparação estrutural**: Outputs devem ser idênticos byte-a-byte (exceto timestamps).
3. **Diff semântico**: Diferenças em `spot_price`, `last_updated` são esperadas; diferenças em `gamma_flip`, `gex`, `charm` são suspeitas.
4. **Snapshot + diff**: Re-executar pipeline e comparar com snapshot anterior.

## Processo

### 1. Capturar baseline
```bash
# Antes da mudança
python scripts/hooks/pre_run_snapshot.py --label "pre-change-X"

# Guardar checksum do snapshot
Get-ChildItem .edi_agent\snapshots\snap-* -Recurse -File | 
  Get-FileHash | 
  Export-Csv .edi_agent\tests\baseline-X.csv
```

### 2. Aplicar mudança

### 3. Re-executar e capturar
```bash
# Após a mudança
python scripts/hooks/pre_run_snapshot.py --label "post-change-X"

# Comparar
Compare-Object 
  (Get-Content .edi_agent\snapshots\snap-pre-change\_META.json | ConvertFrom-Json).files
  (Get-Content .edi_agent\snapshots\snap-post-change\_META.json | ConvertFrom-Json).files
```

### 4. Diff de arquivos alterados
Para cada arquivo que mudou (esperado ou não), comparar:
- **Estrutura**: chaves/keys presentes
- **Valores numéricos** (em arquivos JSON/JS de dados): tolerar apenas `spot_price`, `last_updated`, `last_update`
- **Tamanhos**: variação > 20% é suspeita
- **Conteúdo HTML**: tags e classes devem ser preservadas

### 5. Classificar diff
| Tipo | Aceitar? |
|---|---|
| `spot_price` mudou (esperado) | ✅ |
| `last_updated` mudou (esperado) | ✅ |
| Novo strike adicionado (estrutura preservada) | ✅ |
| Strike removido sem motivo | ❌ ALERTA |
| `gamma_flip` mudou > 1% | ⚠️ INVESTIGAR |
| `gex` mudou > 5% | ⚠️ INVESTIGAR |
| Charm inverteu sinal | ❌ BLOQUEAR COMMIT |

## Sinais de Alerta Específicos do Projeto

### Em `src/calculator.py`
- `charm_*` mudou sinal → BUG (já corrigido em R10)
- `gex_flip` base trocado → BUG (já corrigido em R11)
- `0DTE` restrito a weekday==4 → BUG (já corrigido em R12)
- `SIGMA_FACTOR` mutado globalmente → BUG (já corrigido em R13)

### Em `dashboard_unificado/shared/unified-nav.js`
- 6 dashboards sumiram do seletor → BUG
- `guessCurrentDashboard` retornando `null` para página atual → BUG
- Links absolutos em vez de relativos → regressão de portabilidade

### Em `scripts/export_v1_data.py`
- Caminho `dashboard_v1/` (legado) ainda presente → lixo
- Falta escrita em `dashboard_unificado/WIN/assets/data/` → BUG (output perdido)
- `market_data.js` sem `window.marketData =` prefix → BUG (frontend quebra)

## Saída Esperada

```markdown
## Regression Report: [mudança X]

### Arquivos alterados pelo pipeline
- dashboard_unificado/WIN/assets/data/market_data.js (esperado: spot_price mudou)

### Arquivos alterados inesperadamente
- NENHUM ✅

### Valores com diff > tolerância
- NENHUM ✅

### Conclusão: PODE COMMITAR ✅

### Observação: spot_price WIN passou de 187.040 para 187.125 (Δ +0.045%)
```
