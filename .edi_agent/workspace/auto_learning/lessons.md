# Lições Aprendidas - EDI Agent

## 2026-06-19

### L1: Nunca sobrescrever overview.spot_price com preço proxy
- O top-level spot_price é EWZ (proxy)
- overview.spot_price é o índice real
- Ao atualizar, preservar overview.spot_price

### L2: PowerShell encoding no Windows
- Windows usa cp1252 por padrão
- Emojis causam UnicodeEncodeError
- Usar ASCII em outputs de script

### L3: TradingView API muda frequentemente
- Formato de símbolos muda entre versões
- Sempre ter fallback (Yahoo Finance)
- Cache de 60s evita rate limit

### L4: subprocess.check=True é perigoso
- Se WDO falha, WIN nunca roda
- Sempre capturar exit codes independentemente

### L5: Atomic writes em produção
- Qualquer arquivo escrito deve ser .tmp → replace
- Evita corrupção se processo morrer no meio