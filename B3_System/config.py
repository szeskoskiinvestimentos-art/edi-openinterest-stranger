import os
import re
import sys
import shutil
import subprocess
import time
import stat
import inspect
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

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

def _load_env_kv_file(path: str) -> bool:
    if not os.path.isfile(path):
        return False
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                raw = line.strip()
                if not raw or raw.startswith("#") or "=" not in raw:
                    continue
                key, value = raw.split("=", 1)
                key = key.strip()
                value = value.strip()
                if not key or value == "":
                    continue
                os.environ[key] = value
        return True
    except Exception as e:
        print(f"AVISO: Falha ao carregar variáveis de '{path}': {e}")
        return False

def _pick_latest_file(paths: list[str]) -> str | None:
    existing = [p for p in paths if os.path.isfile(p)]
    if not existing:
        return None
    return max(existing, key=lambda p: os.path.getmtime(p))

def load_env_auto() -> str | None:
    candidates = [
        os.path.join(ROOT_DIR, ".env.auto"),
        os.path.join(os.path.dirname(ROOT_DIR), "Automacao", ".env.auto"),
    ]
    path = _pick_latest_file(candidates)
    if path and _load_env_kv_file(path):
        return path
    return None

def _latest_csv_mtime_date(directory: str):
    try:
        latest_mtime = None
        for root, _, files in os.walk(directory):
            for name in files:
                if not name.lower().endswith(".csv"):
                    continue
                p = os.path.join(root, name)
                try:
                    m = os.path.getmtime(p)
                except Exception:
                    continue
                if latest_mtime is None or m > latest_mtime:
                    latest_mtime = m
        if latest_mtime is None:
            return None
        return datetime.fromtimestamp(latest_mtime).date()
    except Exception:
        return None

def _file_mtime_date(path: str):
    try:
        return datetime.fromtimestamp(os.path.getmtime(path)).date()
    except Exception:
        return None

def maybe_run_automation():
    if os.getenv("AUTO_DATA_FETCH", "true").lower() != "true":
        load_env_auto()
        return

    automacao_dir = os.path.join(os.path.dirname(ROOT_DIR), "Automacao")
    automacao_script = os.path.join(automacao_dir, "automacao_dados.py")
    if not os.path.isfile(automacao_script):
        load_env_auto()
        return

    print("\n=== Automação de Dados (Automacao) ===")
    try:
        env = dict(os.environ)
        env["AUTO_START_B3_SYSTEM"] = "false"
        res = subprocess.run([sys.executable, automacao_script], cwd=automacao_dir, env=env)
        if res.returncode != 0:
            print(f"AVISO: Automação retornou código {res.returncode}. Seguindo com dados existentes.")
    except Exception as e:
        print(f"AVISO: Falha ao executar automação: {e}")
    load_env_auto()

def _safe_rmtree(path: str, retries: int = 5) -> bool:
    if not os.path.exists(path):
        return True

    rmtree_sig = inspect.signature(shutil.rmtree)
    kwargs = {}

    if "onexc" in rmtree_sig.parameters:
        def _onexc(func, p, exc):
            try:
                os.chmod(p, stat.S_IWRITE)
            except Exception:
                pass
            try:
                func(p)
            except Exception:
                raise exc
        kwargs["onexc"] = _onexc
    else:
        def _onerror(func, p, exc_info):
            try:
                os.chmod(p, stat.S_IWRITE)
            except Exception:
                pass
            try:
                func(p)
            except Exception:
                pass
        kwargs["onerror"] = _onerror

    last_exc = None
    for attempt in range(retries):
        try:
            shutil.rmtree(path, **kwargs)
            return True
        except (PermissionError, OSError) as e:
            last_exc = e
            if attempt < retries - 1:
                time.sleep(0.25 * (attempt + 1))
                continue
            print(f"AVISO: Não foi possível remover '{path}': {e}")
            return False

    if last_exc is not None:
        print(f"AVISO: Não foi possível remover '{path}': {last_exc}")
    return False

def _safe_copytree(src: str, dst: str) -> bool:
    copy_sig = inspect.signature(shutil.copytree)
    supports_dirs_exist_ok = "dirs_exist_ok" in copy_sig.parameters

    try:
        if os.path.exists(dst):
            removed = _safe_rmtree(dst)
            if removed:
                shutil.copytree(src, dst)
                return True
            if supports_dirs_exist_ok:
                shutil.copytree(src, dst, dirs_exist_ok=True)
                return True
            return False

        shutil.copytree(src, dst)
        return True
    except Exception as e:
        print(f"AVISO: Falha ao copiar '{src}' -> '{dst}': {e}")
        return False

ASSET_DEFAULTS = {
    # WDO: Dólar futuro/ativos relacionados. Preencha valores diários conforme sua análise.
    "WDO": {
        # Preço Spot atual do subjacente (ex.: último preço do contrato).
        "SPOT": "5199.00",
        # Volatilidade implícita anual (ATM) em formato decimal (ex.: 11.08% = 0.1108).
        "IV_ANNUAL": "0.1182",
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
        "SCALING_EWZ_REF_CLOSE": "37.10",   # Fechamento de EWZ (D-1) para definir a proporção EWZ/WIN.
        "SCALING_INDEX_REF_CLOSE": "183750",  # Fechamento do índice futuro (D-1) na mesma data de referência.
        
        "SPOT": "37.47", # Preço atual do EWZ usado nos cálculos de opções (ex.: último preço / aftermarket).

        # Volatilidade implícita anual do EWZ em formato decimal (33.93% = 0.3393).
        # Informe sempre em porcentagem na linha EWZ_ATM_IV_PCT; a conversão para decimal é automática no src/config.py.
        "EWZ_EXPIRATION": "2026-03-13 (3 DTE)", # Rótulo/Data de vencimento para exibição (pode incluir DTE).
        "EWZ_ATM_IV_PCT": "53.72",  # IV ATM (%) para exibição na área de contexto.
        "EWZ_HV_PCT": "29.98", # Volatilidade histórica (%) do EWZ para exibição.
        "EWZ_IV_RANK_PCT": "39.93", # IV Rank (%) para exibição (nível relativo da IV).
        "EWZ_IV_CONTEXT_SOURCE_URL": "",
        "EWZ_IV_CONTEXT_CAPTURED_AT_UTC": "",
        "EWZ_IV_CONTEXT_METHOD": "",
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
        "ENABLE_AUTO_GIT_PUSH": "True",
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


def _env_int(name: str, default: int) -> int:
    raw = str(os.getenv(name, "") or "").strip()
    if not raw:
        return default
    try:
        return int(raw)
    except Exception:
        return default


def prune_csv_retention(days: int | None = None) -> int:
    keep_days = max(1, int(days if days is not None else _env_int("CSV_RETENTION_DAYS", 4)))
    cutoff_ts = time.time() - keep_days * 86400
    dirs = []
    try:
        dirs.append(str(os.getenv("CSV_DOLAR_DIR") or "").strip())
        dirs.append(str(os.getenv("CSV_INDICE_DIR") or "").strip())
    except Exception:
        pass
    dirs.append(os.path.join(ROOT_DIR, "CSV_Dolar"))
    dirs.append(os.path.join(ROOT_DIR, "CSV_Indice"))

    removed = 0
    seen = set()
    for d in dirs:
        if not d:
            continue
        try:
            d = os.path.abspath(d)
        except Exception:
            continue
        if d in seen:
            continue
        seen.add(d)
        if not os.path.isdir(d):
            continue
        for root, _, files in os.walk(d):
            for name in files:
                if not name.lower().endswith(".csv"):
                    continue
                p = os.path.join(root, name)
                try:
                    if os.path.getmtime(p) > cutoff_ts:
                        continue
                    os.remove(p)
                    removed += 1
                except Exception:
                    continue
    return removed

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
        _safe_copytree(local_unified, target_root)

    cotacoes_src = os.path.join(os.path.dirname(ROOT_DIR), "Cotacoes", "dashboard")
    cotacoes_dst = os.path.join(PROJECTS["WIN"], "Cotacoes", "dashboard")
    if os.path.isdir(cotacoes_src):
        os.makedirs(os.path.dirname(cotacoes_dst), exist_ok=True)
        _safe_copytree(cotacoes_src, cotacoes_dst)

def auto_git_update_unified():
    enabled_flag = os.getenv(
        "ENABLE_AUTO_GIT_PUSH",
        str(ASSET_DEFAULTS.get("WIN", {}).get("ENABLE_AUTO_GIT_PUSH", "False")),
    )
    if str(enabled_flag).lower() != "true":
        print("\n=== Git: dashboard_unificado ===")
        print("Git push desabilitado (ENABLE_AUTO_GIT_PUSH != true).")
        print("GIT_SYNC status=disabled • target=dashboard_unificado")
        return {"enabled": False, "status": "disabled"}
    try:
        repo_dir = PROJECTS["WIN"]
        print("\n=== Git: dashboard_unificado ===")
        def _git(args: list[str], check: bool = True, capture: bool = False):
            return subprocess.run(
                ["git", *args],
                cwd=repo_dir,
                check=check,
                capture_output=capture,
                text=True,
            )

        def _remote_repo_id(url: str) -> str:
            u = (url or "").strip()
            if not u:
                return ""
            m = re.search(r"github\.com[:/](?P<id>[^/\s]+/[^/\s]+?)(?:\.git)?$", u, flags=re.IGNORECASE)
            if not m:
                return ""
            return (m.group("id") or "").strip().lower()

        remote_name = (os.getenv("GIT_REMOTE", "") or "origin").strip() or "origin"
        expected_remote_url = (os.getenv("GIT_REMOTE_URL", "") or "https://github.com/szeskoskiinvestimentos-art/edi-openinterest-stranger.git").strip()

        if _git(["rev-parse", "--is-inside-work-tree"], check=False, capture=True).stdout.strip().lower() != "true":
            print("Git: repositório inválido. Pulei o envio.")
            print("GIT_SYNC status=repo_invalid • target=dashboard_unificado")
            return {"enabled": True, "status": "repo_invalid"}

        remote_get = _git(["remote", "get-url", remote_name], check=False, capture=True)
        remote_url = (remote_get.stdout or "").strip() if remote_get.returncode == 0 else ""
        if not remote_url and expected_remote_url:
            add_remote = _git(["remote", "add", remote_name, expected_remote_url], check=False, capture=True)
            if add_remote.returncode == 0:
                remote_url = expected_remote_url
        if expected_remote_url:
            got_id = _remote_repo_id(remote_url)
            exp_id = _remote_repo_id(expected_remote_url)
            if exp_id and got_id and exp_id != got_id:
                print(f"Git: remoto '{remote_name}' aponta para '{remote_url}', esperado '{expected_remote_url}'.")
                print("Git: ajuste o remoto ou defina GIT_REMOTE_URL para o endereço correto.")
                print("GIT_SYNC status=remote_mismatch • target=dashboard_unificado")
                return {"enabled": True, "status": "remote_mismatch"}

        staged_before = _git(["diff", "--cached", "--name-only"], check=False, capture=True)
        if staged_before.returncode == 0 and staged_before.stdout.strip():
            print("Git: há mudanças já staged no index; para segurança, não vou misturar commits.")
            print("GIT_SYNC status=index_dirty • target=dashboard_unificado")
            return {"enabled": True, "status": "index_dirty"}

        paths_to_add: list[str] = []
        for p in [
            "dashboard_unificado",
            "dashboard_v1",
            "dashboard_v3.html",
            "dashboard_v3.pdf",
            ".nojekyll",
            "index.html",
            os.path.join("Cotacoes", "dashboard"),
        ]:
            if os.path.exists(os.path.join(repo_dir, p)):
                paths_to_add.append(p)

        if not paths_to_add:
            print("Git: nada para adicionar (paths ausentes).")
            print("GIT_SYNC status=no_targets • target=dashboard_unificado")
            return {"enabled": True, "status": "no_targets"}

        _git(["add", "--", *paths_to_add], check=True, capture=False)
        staged = _git(["diff", "--cached", "--name-only"], check=False, capture=True)
        if staged.returncode != 0:
            print("Git push FALHOU: git diff --cached falhou.")
            print("GIT_SYNC status=failed • target=dashboard_unificado")
            return {"enabled": True, "status": "failed"}
        if not staged.stdout.strip():
            print("Git: nenhuma alteração para enviar.")
            print("GIT_SYNC status=no_changes • target=dashboard_unificado")
            return {"enabled": True, "status": "no_changes"}

        ts = datetime.now().strftime("%Y-%m-%d %H:%M")
        msg = os.getenv("GIT_COMMIT_MESSAGE", f"Atualiza dashboard_unificado ({ts})")
        commit = _git(["commit", "-m", msg], check=False, capture=True)
        if commit.returncode != 0:
            out = f"{commit.stdout}\n{commit.stderr}".strip()
            if re.search(r"nothing to commit", out, flags=re.IGNORECASE):
                print("Git: nenhuma alteração para enviar.")
                print("GIT_SYNC status=no_changes • target=dashboard_unificado")
                return {"enabled": True, "status": "no_changes"}
            print(f"Git push FALHOU: git commit falhou.\n{out}")
            print("GIT_SYNC status=failed • target=dashboard_unificado")
            return {"enabled": True, "status": "failed"}

        branch = (os.getenv("GIT_BRANCH", "") or "").strip()
        if not branch:
            cur = _git(["rev-parse", "--abbrev-ref", "HEAD"], check=False, capture=True)
            branch = (cur.stdout or "").strip() or "main"

        push_args = ["push", remote_name, branch] if branch else ["push", remote_name, "HEAD"]
        push = _git(push_args, check=False, capture=True)
        if push.returncode != 0:
            out = (push.stderr or push.stdout or "").strip()
            if re.search(r"auth|authentication|permission denied|forbidden|token|credentials", out, flags=re.IGNORECASE):
                print(f"Git push FALHOU: autenticação/permissão.\n{out}")
                print("GIT_SYNC status=auth_failed • target=dashboard_unificado")
                return {"enabled": True, "status": "auth_failed"}
            retriable = bool(re.search(r"non-fast-forward|fetch first|rejected", out, flags=re.IGNORECASE))
            if retriable:
                pull = _git(["pull", "--no-rebase", "--no-edit", "-X", "ours", remote_name, branch], check=False, capture=True)
                if pull.returncode != 0:
                    out2 = (pull.stderr or pull.stdout or "").strip()
                    print(f"Git push FALHOU: git pull falhou.\n{out2}")
                    print("GIT_SYNC status=failed • target=dashboard_unificado")
                    return {"enabled": True, "status": "failed"}
                push2 = _git(push_args, check=False, capture=True)
                if push2.returncode != 0:
                    out3 = (push2.stderr or push2.stdout or "").strip()
                    print(f"Git push FALHOU: git push (retry) falhou.\n{out3}")
                    print("GIT_SYNC status=failed • target=dashboard_unificado")
                    return {"enabled": True, "status": "failed"}
            else:
                raise subprocess.CalledProcessError(push.returncode, ["git", "push"], output=push.stdout, stderr=push.stderr)
        print("Git push OK.")
        print("GIT_SYNC status=pushed • target=dashboard_unificado")
        return {"enabled": True, "status": "pushed"}
    except FileNotFoundError:
        print("Git: comando não encontrado. Pulei o envio.")
        print("GIT_SYNC status=git_not_found • target=dashboard_unificado")
        return {"enabled": True, "status": "git_not_found"}
    except subprocess.CalledProcessError as e:
        print(f"Git push FALHOU: {e}")
        print("GIT_SYNC status=failed • target=dashboard_unificado")
        return {"enabled": True, "status": "failed"}
    except Exception as e:
        print(f"Git push FALHOU (erro inesperado): {e}")
        print("GIT_SYNC status=failed • target=dashboard_unificado")
        return {"enabled": True, "status": "failed"}


def run_both():
    maybe_run_automation()
    try:
        removed = prune_csv_retention()
        if removed:
            print(f"CSV retention: removidos {removed} arquivos antigos (>{os.getenv('CSV_RETENTION_DAYS','4')} dias).")
    except Exception:
        pass
    run_asset("WDO")
    run_asset("WIN")
    copy_pdfs_to_root()
    update_unified_dashboard()
    auto_git_update_unified()

if __name__ == "__main__":
    run_both()
