import datetime as dt
import os
from dotenv import load_dotenv

# Carrega variáveis do arquivo .env se existir
load_dotenv()

# ==========================================
# INPUTS DIÁRIOS (Atualize estes valores ou use .env)
# ==========================================
SPOT = float(os.getenv("SPOT", 5396.00))          # Preço do ativo subjacente (Spot)
IV_ANNUAL = float(os.getenv("IV_ANNUAL", 0.1071)) # Volatilidade Implícita Anual
DATAREF = dt.date.today() # Data de referência (padrão: hoje)

# ==========================================
# PARÂMETROS DO MODELO
# ==========================================
CONTRACT_MULT = int(os.getenv("CONTRACT_MULT", 50000))   # Multiplicador do contrato
RISK_FREE = float(os.getenv("RISK_FREE", 0.05))          # Taxa livre de risco
HVL_ANNUAL = float(os.getenv("HVL_ANNUAL", 0.1272))      # Volatilidade Histórica (se usada)
SIGMA_FACTOR = float(os.getenv("SIGMA_FACTOR", 1.0))     # Fator Sigma

# Flags de Controle
USE_IMPLIED_VOL = os.getenv("USE_IMPLIED_VOL", "False").lower() == "true"
USE_CSV_SPOT = os.getenv("USE_CSV_SPOT", "False").lower() == "true"    # Se True, tenta ler o Spot do CSV
USE_HVL_FLIP = os.getenv("USE_HVL_FLIP", "True").lower() == "true"     # Usar Vol Histórica para Flip Points

# Configurações de Faixa ATM
ATM_BAND_STEPS = 0.5

# Pesos para o Indicador DPI
DPI_WEIGHTS = {
    'delta': 0.25, 
    'gamma': 0.25, 
    'charm': 0.25, 
    'vanna': 0.25
}
DPI_WINDOW_STRIKES = 2

# Inputs Externos (Manuais) - Opcional
EXTERNAL_PUT_OI_TOTAL = None
EXTERNAL_CALL_OI_TOTAL = None
EXTERNAL_PUT_PREM_TOTAL = None
EXTERNAL_CALL_PREM_TOTAL = None

# Configurações de Visualização
TOP_N_CONTRACTS = 5

# ==========================================
# CONSTANTES MATEMÁTICAS E DE SIMULAÇÃO
# ==========================================
DT_DAILY = 1.0 / 252.0  # Passo de tempo diário anualizado
DSIGMA = 0.01           # Variação de volatilidade para Vanna/Vega
EPSILON = 1e-6          # Valor pequeno para evitar divisão por zero
MIN_T_EXPIRY = 0.004    # Tempo mínimo de expiração (aprox 1 dia)

# Níveis de Fibonacci
FIB_LEVELS = [0.236, 0.382, 0.618, 0.764]

# Parâmetros de Simulação
SIM_SPOT_RANGE_LOWER = 0.85
SIM_SPOT_RANGE_UPPER = 1.15
SIM_STEPS = 50

# Parâmetros do Cone de Gamma Flip
CONE_ALPHA_MIN = 0.1
CONE_ALPHA_MAX = 3.0
CONE_ALPHA_STEPS = 30
