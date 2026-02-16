import os
import sys
import shutil
import subprocess
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

PROJECTS = {
    "WDO": os.path.join(ROOT_DIR, "Edi_OpenInterest - PY - Stranger - WDO"),
    "WIN": os.path.join(ROOT_DIR, "Edi_OpenInterest - PY - Stranger - Indice"),
}

ASSET_DEFAULTS = {
    # WDO: Dólar futuro/ativos relacionados. Preencha valores diários conforme sua análise.
    "WDO": {
        # Preço Spot atual do subjacente (ex.: último preço do contrato).
        "SPOT": "5228.50",
        # Volatilidade implícita anual (ATM) em formato decimal (ex.: 11.08% = 0.1108).
        "IV_ANNUAL": "0.1108",
        # Taxa livre de risco anualizada (ex.: 5% = 0.05).
        "RISK_FREE": "0.05",
        # Volatilidade histórica anual (decimal). Usada em análises e flips quando habilitado.
        "HVL_ANNUAL": "0.1265",
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
    },
    # WIN: Índice (escalado a partir de EWZ ou ajustado manualmente). Preencha conforme o dia.
    "WIN": {
        # Fator de escala direto (opcional). Se não vazio, sobrescreve a escala automática.
        "DISPLAY_SCALE_FACTOR": "",
        # Spot (override opcional). Se vazio, o sistema usa o valor do projeto Índice.
        "SPOT": "",
        # IV anual (decimal). Se vazio, usa configuração interna do projeto.
        "IV_ANNUAL": "",
        # Taxa livre de risco anualizada. Se vazio, usa configuração interna.
        "RISK_FREE": "",
        # Rótulo/Data de vencimento (string livre ou YYYY-MM-DD) para exibição.
        "EWZ_EXPIRATION": "",
        # IV ATM (%) para exibição (texto/percentual). Use como referência visual.
        "EWZ_ATM_IV_PCT": "0.0",
        # Volatilidade histórica (%) para exibição (texto/percentual).
        "EWZ_HV_PCT": "0.0",
        # IV Rank (%) para exibição (texto/percentual).
        "EWZ_IV_RANK_PCT": "0.0",
        # Taxa Selic anual (% como decimal) usada em macros do índice.
        "TAXA_SELIC": "15.0",
        # Taxa Fed Funds anual (% como decimal) se necessária.
        "TAXA_FED": "3.5",
        # Dividend Yield BR anual (% como decimal) para contexto macro.
        "DIVIDEND_YIELD_BR": "2.61",
        # IPCA anual (% como decimal) para contexto macro.
        "IPCA_PCT": "4.5",
        # Multiplicador do contrato índice.
        "CONTRACT_MULT": "50000",
        # Volatilidade histórica anual (decimal). Se vazio, usa configuração interna.
        "HVL_ANNUAL": "",
        # Fator multiplicador para sigma nas simulações. Se vazio, usa configuração interna.
        "SIGMA_FACTOR": "",
        # Flags de cálculo/leitura: se vazias, seguem configuração interna do projeto.
        "USE_IMPLIED_VOL": "",
        "USE_CSV_SPOT": "",
        "USE_HVL_FLIP": "",
        # Habilita envio automático do dashboard_unificado ao Git quando rodar config.py.
        "ENABLE_AUTO_GIT_PUSH": "True",
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
    target_root = os.path.join(ROOT_DIR, "dashboard_unificado")
    wdo_target = os.path.join(target_root, "WDO")
    win_target = os.path.join(target_root, "WIN")
    os.makedirs(target_root, exist_ok=True)
    os.makedirs(wdo_target, exist_ok=True)
    os.makedirs(win_target, exist_ok=True)
    wdo_src = os.path.join(PROJECTS["WDO"], "dashboard_v1")
    win_src = os.path.join(PROJECTS["WIN"], "dashboard_v1")
    for name, src, dst in [("WDO", wdo_src, wdo_target), ("WIN", win_src, win_target)]:
        if os.path.isdir(src):
            for item in os.listdir(src):
                s = os.path.join(src, item)
                d = os.path.join(dst, item)
                if os.path.isdir(s):
                    if os.path.exists(d):
                        shutil.rmtree(d)
                    shutil.copytree(s, d)
                else:
                    shutil.copy2(s, d)

def auto_git_update_unified():
    if os.getenv("ENABLE_AUTO_GIT_PUSH", "True").lower() != "true":
        return
    try:
        subprocess.run(["git", "add", "dashboard_unificado"], cwd=ROOT_DIR, check=True)
        ts = datetime.now().strftime("%Y-%m-%d %H:%M")
        msg = os.getenv("GIT_COMMIT_MESSAGE", f"Atualiza dashboard_unificado ({ts})")
        subprocess.run(["git", "commit", "-m", msg], cwd=ROOT_DIR, check=True)
        subprocess.run(["git", "push"], cwd=ROOT_DIR, check=True)
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
