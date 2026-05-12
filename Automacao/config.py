import os
import sys
import shutil
import subprocess
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_AUTO_FILE = os.path.join(ROOT_DIR, ".env.auto")

# Carrega variáveis do .env.auto para o ambiente, se existir
if os.path.exists(ENV_AUTO_FILE):
    print(f"Carregando configurações de {ENV_AUTO_FILE}...")
    with open(ENV_AUTO_FILE, "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ[key.strip()] = value.strip()
            print(f"  [ENV] {key.strip()} = {value.strip()}")

# PREENCHIMENTO DIÁRIO (USO NORMAL)
# - WDO: ajuste diário no bloco WDO abaixo (SPOT, IV_ANNUAL, RISK_FREE, HVL_ANNUAL, SIGMA_FACTOR).
# - WIN: normalmente deixe SPOT, IV_ANNUAL, HVL_ANNUAL, SIGMA_FACTOR vazios para usar o src/config.py do Índice.
#   Use DISPLAY_SCALE_FACTOR apenas se quiser forçar uma escala manual; caso contrário, a escala vem do MANUAL_EWZ_REF_CLOSE / MANUAL_INDEX_REF_CLOSE do Índice.
# - TAXA_SELIC, TAXA_FED, DIVIDEND_YIELD_BR, IPCA_PCT e CONTRACT_MULT podem ser ajustados aqui para contexto macro.
#
# CAMPOS AVANÇADOS (MEXER APENAS SE PRECISAR)
# - USE_IMPLIED_VOL, USE_CSV_SPOT, USE_HVL_FLIP: controle fino de estratégia do modelo; deixe como está se não tiver motivo forte.
# - ENABLE_AUTO_GIT_PUSH: se "True", após rodar este config.py o dashboard_unificado é comitado e enviado para o Git (apenas se ROOT_DIR for um repositório git).

PROJECTS = {
    "WDO": os.path.join(ROOT_DIR, "Edi_OpenInterest - PY - Stranger - WDO"),
    "WIN": os.path.join(ROOT_DIR, "Edi_OpenInterest - PY - Stranger - Indice"),
}

ASSET_DEFAULTS = {
    # WDO: Dólar futuro/ativos relacionados. Preencha valores diários conforme sua análise.
    "WDO": {
        # Preço Spot atual do subjacente (ex.: último preço do contrato).
        "SPOT": os.environ.get("WDO_SPOT", "5137.00"),
        # Volatilidade implícita anual (ATM) em formato decimal (ex.: 11.08% = 0.1108).
        "IV_ANNUAL": os.environ.get("WDO_IV_ANNUAL", "0.1261"),
        # Taxa livre de risco anualizada (ex.: 5% = 0.05).
        "RISK_FREE": "0.05",
        # Volatilidade histórica anual (decimal). Usada em análises e flips quando habilitado.
        "HVL_ANNUAL": "0.1257",
        # Fator multiplicador para sigma nas simulações (1.0 mantém padrão).
        "SIGMA_FACTOR": "1.0",
        # Se True, prioriza IV em cálculos específicos; se False, segue configuração padrão do projeto.
        "USE_IMPLIED_VOL": "False",
        # Se True, tenta obter Spot a partir dos CSVs carregados.
        "USE_CSV_SPOT": "False",
        # Se True, usa HVL para identificar Flip Points (estratégia alternativa).
        "USE_HVL_FLIP": "True",
        # Taxa Selic anual (% como decimal) para macros/indicadores.
        "TAXA_SELIC": "15.0",
        # Taxa Fed Funds anual (% como decimal) se for usada em análise externa.
        "TAXA_FED": "3.5",
        # Multiplicador do contrato (tamanho do lote/contrato).
        "CONTRACT_MULT": "50000",
        # Desabilita o push automático do WDO; o envio será feito apenas pelo unificado.
        "ENABLE_AUTO_GIT_PUSH": "False",
    },
    # WIN: Índice (escalado a partir de EWZ ou ajustado manualmente). Preencha conforme o dia.
    "WIN": {
        # Calibração diária de escala EWZ -> Índice (fechamentos de referência do dia anterior).
        "SCALING_EWZ_REF_CLOSE": os.environ.get("WIN_SCALING_EWZ_REF_CLOSE", "39.10"),   # Fechamento de EWZ (D-1) para definir a proporção EWZ/WIN.
        "SCALING_INDEX_REF_CLOSE": os.environ.get("WIN_SCALING_INDEX_REF_CLOSE", "194215"),  # Fechamento do índice futuro (D-1) na mesma data de referência.
        
        "SPOT": os.environ.get("WIN_SPOT", "39.00"), # Preço atual do EWZ usado nos cálculos de opções (ex.: último preço / aftermarket).

        # Volatilidade implícita anual do EWZ em formato decimal (33.93% = 0.3393).
        # Informe sempre em porcentagem na linha EWZ_ATM_IV_PCT; a conversão para decimal é automática no src/config.py.
        "EWZ_EXPIRATION": "2026-02-27 (0 DTE)", # Rótulo/Data de vencimento para exibição (pode incluir DTE).
        "EWZ_ATM_IV_PCT": "38.07",  # IV ATM (%) para exibição na área de contexto.
        "EWZ_HV_PCT": "26.75", # Volatilidade histórica (%) do EWZ para exibição.
        "EWZ_IV_RANK_PCT": "25.77", # IV Rank (%) para exibição (nível relativo da IV).
        "TAXA_SELIC": "15.0", # Taxa Selic anual (% como decimal) usada nos macros do índice.
        "TAXA_FED": "3.5", # Taxa Fed Funds anual (% como decimal) se usada em análises externas.
        "DIVIDEND_YIELD_BR": "2.61",  # Dividend Yield BR anual (% como decimal) para contexto macro.
        "IPCA_PCT": "4.5",  # IPCA anual (% como decimal) para contexto macro.
        # Multiplicador do contrato de índice (ajusta valores em R$).
        "CONTRACT_MULT": "50000",
        # Volatilidade histórica anual (decimal) usada em métricas avançadas.
        # Informe sempre em porcentagem na linha EWZ_HV_PCT; a conversão para decimal é automática no src/config.py.
        # Fator multiplicador para sigma nas simulações de Fair Value.
        "SIGMA_FACTOR": "1.0",
        # Flags avançadas: deixe vazio para seguir configuração interna do projeto.
        "USE_IMPLIED_VOL": "",
        "USE_CSV_SPOT": "",
        "USE_HVL_FLIP": "",
        "EXPOSURE_INDEX_SCALE_ENABLED": "True",
        # Fator de escala direto (opcional). Se não vazio, sobrescreve a escala automática EWZ->Índice.
        "DISPLAY_SCALE_FACTOR": "",
        # Habilita envio automático do dashboard_unificado ao Git quando rodar config.py.
        "ENABLE_AUTO_GIT_PUSH": "False",
         # Taxa livre de risco anual (EUA) usada em Black-Scholes.
        "RISK_FREE": "0.05",
    },
}

def build_env(asset: str) -> dict:
    base = dict(os.environ)
    overrides = {}
    for k, v in ASSET_DEFAULTS[asset].items():
        env_key = f"{asset}_{k}"
        val = os.getenv(env_key, None)
        if val is not None and val != "":
            overrides[k] = val
            continue
        if isinstance(v, str) and v == "":
            continue
        overrides[k] = v
    if os.getenv("ENABLE_AUTO_GIT_PUSH"):
        overrides["ENABLE_AUTO_GIT_PUSH"] = os.getenv("ENABLE_AUTO_GIT_PUSH")
    base.update(overrides)
    base.setdefault("CSV_DOLAR_DIR", os.path.join(ROOT_DIR, "CSV_Dolar"))
    base.setdefault("CSV_INDICE_DIR", os.path.join(ROOT_DIR, "CSV_Indice"))
    return base

def run_asset(asset: str):
    project_dir = PROJECTS[asset]
    script = os.path.join(project_dir, "main.py")
    env = build_env(asset)
    subprocess.run([sys.executable, script], cwd=project_dir, check=True, env=env)

def copy_pdfs_to_root():
    src_wdo = os.path.join(PROJECTS["WDO"], "dashboard_v3.pdf")
    src_win = os.path.join(PROJECTS["WIN"], "dashboard_v3.pdf")
    dst_wdo = os.path.join(ROOT_DIR, "opcoesWDO.pdf")
    dst_win = os.path.join(ROOT_DIR, "opcoesWIN.pdf")
    if os.path.exists(src_wdo):
        shutil.copy2(src_wdo, dst_wdo)
    if os.path.exists(src_win):
        shutil.copy2(src_win, dst_win)

def update_unified_dashboard():
    # O B3_System/dashboard_unificado agora é a fonte principal do frontend.
    # Vamos apenas copiá-lo para dentro do repositório do Índice (WIN) para o git push.
    local_unified = os.path.join(ROOT_DIR, "dashboard_unificado")
    target_root = os.path.join(PROJECTS["WIN"], "dashboard_unificado")
    
    if os.path.isdir(local_unified):
        os.makedirs(target_root, exist_ok=True)
        if os.path.exists(target_root):
            shutil.rmtree(target_root)
        shutil.copytree(local_unified, target_root)

def auto_git_update_unified():
    if os.getenv("ENABLE_AUTO_GIT_PUSH", "False").lower() != "true":
        return
    try:
        import runpy

        b3_config = os.path.join(os.path.dirname(ROOT_DIR), "B3_System", "config.py")
        if os.path.isfile(b3_config):
            mod = runpy.run_path(b3_config)
            fn = mod.get("auto_git_update_unified")
            if callable(fn):
                fn()
                return
        print("GIT_SYNC status=failed • target=dashboard_unificado")
    except Exception:
        pass

def run_both():
    run_asset("WDO")
    run_asset("WIN")
    copy_pdfs_to_root()
    update_unified_dashboard()
    auto_git_update_unified()

if __name__ == "__main__":
    run_both()
