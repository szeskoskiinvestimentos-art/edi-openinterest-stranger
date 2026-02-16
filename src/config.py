import datetime as dt
import os
from typing import Any, Callable, Optional, TypeVar
from dotenv import load_dotenv

# Carrega variáveis do arquivo .env se existir (Fallback)
load_dotenv()

# ==============================================================================
# ÁREA DE INPUT MANUAL DO USUÁRIO (Preencha aqui diariamente)
# ==============================================================================
# Instruções:
# 1. Altere os valores após o sinal de igual (=).
# 2. Mantenha os pontos decimais (ex: 38.49).
# 3. Textos devem ficar entre aspas (ex: "2026-02-13").
# ==============================================================================

# --- 1. Calibração de Escala (EWZ -> Índice) ---
# Use o fechamento do dia anterior para calcular a proporção correta
MANUAL_EWZ_REF_CLOSE   = 38.06      # Preço de fechamento do EWZ (USD)
MANUAL_INDEX_REF_CLOSE = 187040     # Preço de fechamento do Índice Futuro (Pontos)

# --- 2. Dados de Volatilidade e Vencimento (Fonte Externa) ---
# Copie estes dados da sua fonte de volatilidade (ex: Market Chameleon/IBKR)
MANUAL_EXPIRATION_DATE   = "2026-02-13"      # Data do Vencimento (YYYY-MM-DD)
MANUAL_EXPIRATION_LABEL  = "2026-02-13 (0 DTE)"  # Data e Dias para Vencimento (Texto livre)
MANUAL_ATM_IV_PCT        = 33.93                 # Volatilidade Implícita ATM (%)
MANUAL_HV_PCT            = 25.90                 # Volatilidade Histórica (%)
MANUAL_IV_RANK_PCT       = 27.01                 # IV Rank (%)

# --- 3. Parâmetros de Mercado (Taxas & Spot) ---
MANUAL_SPOT_PRICE        = 38.06     # Preço Spot Atual do EWZ (Se 0, tenta ler do CSV)
MANUAL_RISK_FREE_RATE    = 0.05      # Taxa Livre de Risco (EUA) - 5% = 0.05
MANUAL_TAXA_SELIC_PCT    = 15.00     # Selic (% a.a.) usada no índice
MANUAL_TAXA_FED_PCT      = 3.50      # Fed Funds (%) se necessário em cálculos externos
MANUAL_DIVIDEND_YIELD_BR = 2.61      # Dividend Yield médio BR (% a.a.)
MANUAL_IPCA_PCT          = 4.50      # IPCA anualizado (%) para análises macro

# ==============================================================================
# FIM DA ÁREA DE INPUT MANUAL - NÃO ALTERE ABAIXO DESTA LINHA
# ==============================================================================

T = TypeVar("T")
def get_val(manual_val: Any, env_key: str, default: T = None, cast: Optional[Callable[[str], T]] = None) -> T:
    env_val = os.getenv(env_key)
    if env_val is not None and env_val != "":
        try:
            if cast is None:
                if default is not None and not isinstance(default, str):
                    return type(default)(env_val)  # type: ignore
                return env_val  # type: ignore
            return cast(env_val)
        except:
            return default  # type: ignore
    if manual_val is not None and manual_val != "":
        return manual_val  # type: ignore
    return default  # type: ignore

# ==========================================
# CONFIGURAÇÕES CONSOLIDADAS
# ==========================================

# 1. Escala
SCALING_EWZ_REF_CLOSE: float = get_val(MANUAL_EWZ_REF_CLOSE, "SCALING_EWZ_REF_CLOSE", 0.0, cast=float)
SCALING_INDEX_REF_CLOSE: float = get_val(MANUAL_INDEX_REF_CLOSE, "SCALING_INDEX_REF_CLOSE", 0.0, cast=float)
EWZ_TO_INDEX_SCALE_ENABLED = True # Força ligado se houver valores manuais

def _compute_display_scale() -> float:
    direct_scale = os.getenv("DISPLAY_SCALE_FACTOR")
    if direct_scale is not None and direct_scale != "":
        try:
            return float(direct_scale)
        except:
            pass
    ewz = float(SCALING_EWZ_REF_CLOSE or 0.0)
    idx = float(SCALING_INDEX_REF_CLOSE or 0.0)
    if ewz > 0.0 and idx > 0.0:
        return idx / ewz
    return 1.0

DISPLAY_SCALE_FACTOR = _compute_display_scale()

# 2. Inputs de Mercado
SPOT = get_val(MANUAL_SPOT_PRICE, "SPOT", 0.0)
IV_ANNUAL = get_val(None, "IV_ANNUAL", 0.2568) # Mantém lógica original se não especificado
RISK_FREE = get_val(MANUAL_RISK_FREE_RATE, "RISK_FREE", 0.05)
DATAREF = dt.date.today()

# 3. Metadados EWZ (Visualização)
EWZ_EXPIRATION_LABEL = get_val(MANUAL_EXPIRATION_LABEL, "EWZ_EXPIRATION", "", cast=str)
EWZ_ATM_IV_PCT = get_val(MANUAL_ATM_IV_PCT, "EWZ_ATM_IV_PCT", 0.0)
EWZ_HV_PCT = get_val(MANUAL_HV_PCT, "EWZ_HV_PCT", 0.0)
EWZ_IV_RANK_PCT = get_val(MANUAL_IV_RANK_PCT, "EWZ_IV_RANK_PCT", 0.0)

# ==========================================
# PARÂMETROS TÉCNICOS (AVANÇADO)
# ==========================================
CONTRACT_MULT = int(os.getenv("CONTRACT_MULT", 50000))
HVL_ANNUAL = float(os.getenv("HVL_ANNUAL", 0.1265))
SIGMA_FACTOR = float(os.getenv("SIGMA_FACTOR", 1.0))

# Flags
USE_IMPLIED_VOL = os.getenv("USE_IMPLIED_VOL", "False").lower() == "true"
USE_CSV_SPOT = os.getenv("USE_CSV_SPOT", "False").lower() == "true"
USE_HVL_FLIP = os.getenv("USE_HVL_FLIP", "True").lower() == "true"

ATM_BAND_STEPS = 0.5

# NTSL / Macros de Índice (prioriza bloco manual, com fallback para .env)
TAXA_SELIC = get_val(MANUAL_TAXA_SELIC_PCT, "TAXA_SELIC", 15.0)
TAXA_FED = get_val(MANUAL_TAXA_FED_PCT, "TAXA_FED", 3.5)
DIVIDEND_YIELD_BR = get_val(MANUAL_DIVIDEND_YIELD_BR, "DIVIDEND_YIELD_BR", 2.61)
IPCA_PCT = get_val(MANUAL_IPCA_PCT, "IPCA_PCT", 4.5)

DPI_WEIGHTS = {'delta': 0.25, 'gamma': 0.25, 'charm': 0.25, 'vanna': 0.25}
DPI_WINDOW_STRIKES = 2

# Controle de Exportação
ENABLE_V1_EXPORTS = True
ENABLE_V3_HTML_EXPORT = True
ENABLE_PDF_EXPORT = True
ENABLE_AUTO_GIT_PUSH = os.getenv("ENABLE_AUTO_GIT_PUSH", "False").lower() == "true"

# Constantes
DT_DAILY = 1.0 / 252.0
DSIGMA = 0.01
EPSILON = 1e-6
MIN_T_EXPIRY = 0.0004    # Tempo mínimo de expiração (aprox 0.1 dia / 2h de pregão)
FIB_LEVELS = [0.236, 0.382, 0.618, 0.764]
SIM_SPOT_RANGE_LOWER = 0.85
SIM_SPOT_RANGE_UPPER = 1.15
SIM_STEPS = 50
CONE_ALPHA_MIN = 0.1
CONE_ALPHA_MAX = 3.0
CONE_ALPHA_STEPS = 30

# ==============================================================================
# EXECUÇÃO DIRETA (Permite rodar o sistema executando este arquivo)
# ==============================================================================
if __name__ == "__main__":
    import sys
    import subprocess
    
    # Determina o diretório raiz do projeto (sobe um nível a partir de src/)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    
    print(f"=== Iniciando Sistema via Config ===")
    print(f"Raiz do Projeto: {project_root}")
    
    # Define o script main.py
    main_script = os.path.join(project_root, "main.py")
    
    if os.path.exists(main_script):
        # Executa main.py no diretório raiz
        try:
            subprocess.run([sys.executable, "main.py"], cwd=project_root, check=True)
        except subprocess.CalledProcessError as e:
            print(f"Erro na execução: {e}")
        except KeyboardInterrupt:
            print("\nExecução interrompida pelo usuário.")
    else:
        print(f"ERRO: main.py não encontrado em {project_root}")
