import datetime as dt
import os
from dotenv import load_dotenv

# Carrega variáveis do arquivo .env se existir
load_dotenv()

print(f"DEBUG: SPOT from env: {os.getenv('SPOT')}")

# ==========================================
# INPUTS DIÁRIOS (Atualize estes valores ou use .env)
# ==========================================
SPOT = float(os.getenv("SPOT", 187915))          # Preço do ativo subjacente (Spot)
print(f"DEBUG: SPOT parsed: {SPOT}")
# ...rest of file (I need to read it first to append correctly, or just use SearchReplace)
