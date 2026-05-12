import requests
import pandas as pd
import numpy as np
import datetime as dt
import os
import re
import time
import random
import sys
import subprocess
import shutil
from io import StringIO
from typing import Any, Optional
from dateutil.relativedelta import relativedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import undetected_chromedriver as uc
import glob
import warnings

try:
    RequestsDependencyWarning = getattr(requests, "RequestsDependencyWarning", None)
    if RequestsDependencyWarning is not None:
        warnings.filterwarnings("ignore", category=RequestsDependencyWarning)
except Exception:
    pass

# ============================================================
# CONFIGURAÇÃO GERAL
# ============================================================
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
OPCOES_ROOT_DIR = os.path.abspath(os.path.join(ROOT_DIR, ".."))
B3_SYSTEM_DIR = os.path.join(OPCOES_ROOT_DIR, "B3_System")

DEFAULT_CSV_DOLAR_DIR = os.path.join(ROOT_DIR, "CSV_Dolar")
DEFAULT_CSV_INDICE_DIR = os.path.join(ROOT_DIR, "CSV_Indice")
DEFAULT_ENV_FILE = os.path.join(ROOT_DIR, ".env.auto")

TARGET_CSV_DOLAR_DIR = os.path.join(B3_SYSTEM_DIR, "CSV_Dolar")
TARGET_CSV_INDICE_DIR = os.path.join(B3_SYSTEM_DIR, "CSV_Indice")
TARGET_ENV_FILE = os.path.join(B3_SYSTEM_DIR, ".env.auto")

CSV_DOLAR_DIR = TARGET_CSV_DOLAR_DIR if os.path.isdir(B3_SYSTEM_DIR) else DEFAULT_CSV_DOLAR_DIR
CSV_INDICE_DIR = TARGET_CSV_INDICE_DIR if os.path.isdir(B3_SYSTEM_DIR) else DEFAULT_CSV_INDICE_DIR
ENV_FILE = TARGET_ENV_FILE if os.path.isdir(B3_SYSTEM_DIR) else DEFAULT_ENV_FILE

FED_RATES_JSON_PATH = os.path.join(
    B3_SYSTEM_DIR,
    "Edi_OpenInterest - PY - Stranger - WDO",
    "data_input",
    "fed_rates.json",
)

FED_RATES_PUBLIC_JSON_PATHS = [
    os.path.join(B3_SYSTEM_DIR, "dashboard_unificado", "WDO", "assets", "data", "fed_rates.json"),
    os.path.join(
        B3_SYSTEM_DIR,
        "Edi_OpenInterest - PY - Stranger - Indice",
        "dashboard_unificado",
        "WDO",
        "assets",
        "data",
        "fed_rates.json",
    ),
]

# Garante que os diretórios existam
os.makedirs(CSV_DOLAR_DIR, exist_ok=True)
os.makedirs(CSV_INDICE_DIR, exist_ok=True)

# Mapeamento de códigos de meses para letras (Futuros)
MONTH_NUM_TO_LETTER = {
    1: 'F', 2: 'G', 3: 'H', 4: 'J', 5: 'K', 6: 'M',
    7: 'N', 8: 'Q', 9: 'U', 10: 'V', 11: 'X', 12: 'Z'
}

# Mapeamento reverso para suportar busca por letra
MONTH_LETTER_TO_NUM = {v: k for k, v in MONTH_NUM_TO_LETTER.items()}

def get_wdo_expiration(contract_symbol):
    """
    Calcula a data de vencimento do contrato de opções de WDO.
    Regra: 1º dia útil do mês de vencimento.
    Ex: XDJ26 (Apr 26) -> Vencimento em ~01/04/2026.
    """
    try:
        # Extrai código do mês e ano do símbolo (Ex: XDJ26 -> J26)
        import re
        match = re.search(r'([FGHJKMNQUVXZ])(\d{2})$', contract_symbol)
        if not match:
            return None
            
        month_code = match.group(1)
        year_short = match.group(2)
        
        month = MONTH_LETTER_TO_NUM.get(month_code)
        if month is None:
            return None
            
        year = 2000 + int(year_short)
        
        # Primeiro dia do mês
        expiry = dt.date(year, month, 1)
        
        # Ajuste para dia útil (simples: se for fim de semana, avança)
        while expiry.weekday() > 4: # 5=Sat, 6=Sun
            expiry += dt.timedelta(days=1)
            
        return expiry
    except Exception as e:
        print(f"Erro ao calcular vencimento para {contract_symbol}: {e}")
        return None

# Mapeamento de códigos de meses para abreviações (URLs Barchart)
MONTH_ABBRS = {
    'F': 'jan', 'G': 'feb', 'H': 'mar', 'J': 'apr', 'K': 'may', 'M': 'jun',
    'N': 'jul', 'Q': 'aug', 'U': 'sep', 'V': 'oct', 'X': 'nov', 'Z': 'dec'
}

def _wdo_contract_sort_key(symbol: str) -> tuple[int, int, str]:
    try:
        m = re.search(r"^XD([FGHJKMNQUVXZ])(\d{2})$", str(symbol or "").strip().upper())
        if not m:
            return (9999, 99, str(symbol or ""))
        month_code = m.group(1)
        year = 2000 + int(m.group(2))
        month_num = int(MONTH_LETTER_TO_NUM.get(month_code) or 99)
        return (year, month_num, m.group(0))
    except Exception:
        return (9999, 99, str(symbol or ""))

def discover_wdo_contract_symbols_from_page_source(page_source: str, seed_symbol: str = "") -> list[str]:
    try:
        raw = str(page_source or "")
        found = re.findall(r"/futures/quotes/(XD[FGHJKMNQUVXZ]\d{2})/", raw, flags=re.IGNORECASE)
        if not found:
            found = re.findall(r"\bXD[FGHJKMNQUVXZ]\d{2}\b", raw, flags=re.IGNORECASE)
        seed = str(seed_symbol or "").strip().upper()
        uniq: dict[str, bool] = {}
        for it in found:
            s = str(it or "").strip().upper()
            if re.match(r"^XD[FGHJKMNQUVXZ]\d{2}$", s):
                uniq[s] = True
        out = sorted(list(uniq.keys()), key=_wdo_contract_sort_key)
        if seed and seed in out:
            out = [seed] + [x for x in out if x != seed]
        return out
    except Exception:
        return []

def get_wdo_contracts():
    """
    Retorna os códigos dos contratos de Dólar Futuro (WDO) para o mês atual e próximo.
    Considera que o contrato vence no primeiro dia útil do mês.
    Portanto, no mês M, negocia-se o contrato M+1.
    
    Exemplo (Hoje = Março/2026):
        - Negociação Atual: Abril (J26) -> Símbolo Barchart: XDJ26
        - Próximo: Maio (K26) -> Símbolo Barchart: XDK26
    
    Retorna lista de dicionários com 'symbol', 'type' e 'url_suffix'.
    """
    def _parse_yyyy_mm(raw: str) -> Optional[tuple[int, int]]:
        try:
            s = str(raw or "").strip()
            if not s:
                return None
            m = re.match(r"^(\d{4})-(\d{2})$", s)
            if not m:
                return None
            yy = int(m.group(1))
            mm = int(m.group(2))
            if yy < 2000 or yy > 2099:
                return None
            if mm < 1 or mm > 12:
                return None
            return (yy, mm)
        except Exception:
            return None

    def _add_months(yy: int, mm: int, delta: int) -> tuple[int, int]:
        total = (yy * 12 + (mm - 1)) + int(delta)
        out_y = total // 12
        out_m = (total % 12) + 1
        return out_y, out_m

    def _month_span_inclusive(start: tuple[int, int], end: tuple[int, int]) -> int:
        sy, sm = start
        ey, em = end
        return (ey * 12 + (em - 1)) - (sy * 12 + (sm - 1)) + 1

    now = dt.datetime.now()
    start_year_full = int(now.year)
    start_month = int(now.month) + 1
    if start_month > 12:
        start_month = 1
        start_year_full += 1

    start = (start_year_full, start_month)

    try:
        months_ahead = int(os.getenv("WDO_CONTRACTS_MONTHS_AHEAD", "").strip() or "24")
    except Exception:
        months_ahead = 24
    months_ahead = max(1, min(months_ahead, 240))

    until = _parse_yyyy_mm(os.getenv("WDO_CONTRACTS_UNTIL_YYYY_MM", "").strip())

    if until:
        count = _month_span_inclusive(start, until)
    else:
        count = months_ahead

    try:
        max_months = int(os.getenv("WDO_CONTRACTS_MAX_MONTHS", "").strip() or "120")
    except Exception:
        max_months = 120
    max_months = max(1, min(max_months, 240))
    count = max(1, min(count, max_months))

    contracts = []
    for i in range(count):
        yy, mm = _add_months(start[0], start[1], i)
        code = MONTH_NUM_TO_LETTER[int(mm)]
        abbr = MONTH_ABBRS[code]
        y2 = int(yy) % 100
        symbol = f"XD{code}{y2:02d}"
        url_suffix = f"{abbr}-{y2:02d}"
        contract_type = "current" if i == 0 else "next" if i == 1 else f"next_{i}"
        contracts.append({"symbol": symbol, "type": contract_type, "url_suffix": url_suffix})

    return contracts

def get_ewz_contract():
    return {"symbol": "EWZ", "type": "etf"}

# ============================================================
# DRIVER SELENIUM
# ============================================================
def init_driver():
    """Inicia driver Chrome usando undetected-chromedriver para evitar bloqueios."""
    try:
        def is_winerror(err: Exception, code: int) -> bool:
            try:
                if isinstance(err, OSError) and getattr(err, "winerror", None) == code:
                    return True
            except Exception:
                pass
            return f"WinError {code}" in str(err)

        def is_uc_cache_not_empty_error(err: Exception) -> bool:
            t = str(err or "").lower()
            if is_winerror(err, 145) or ("directory not empty" in t):
                return ("undetected_chromedriver" in t) or ("chromedriver-win" in t)
            return False

        def cleanup_uc_driver_cache() -> None:
            appdata = os.getenv("APPDATA", "").strip()
            if not appdata:
                return
            undetected_dir = os.path.join(appdata, "undetected_chromedriver", "undetected")
            candidates = [
                os.path.join(undetected_dir, "chromedriver-win32"),
                os.path.join(undetected_dir, "chromedriver-win64"),
            ]

            def on_rm_error(func, path, _exc):
                try:
                    os.chmod(path, 0o777)
                except Exception:
                    pass
                try:
                    func(path)
                except Exception:
                    pass

            try:
                # Mata instâncias presas de chromedriver/chrome para liberar locks
                if os.name == "nt":
                    for proc in ("chromedriver.exe", "chrome.exe"):
                        try:
                            subprocess.run(["taskkill", "/IM", proc, "/F"], capture_output=True, timeout=5)
                        except Exception:
                            pass
            except Exception:
                pass

            for p in candidates:
                try:
                    if not os.path.exists(p):
                        continue
                    ts = time.strftime("%Y%m%d_%H%M%S")
                    parent = os.path.dirname(p)
                    base = os.path.basename(p)
                    renamed = os.path.join(parent, f"{base}_stale_{ts}")
                    try:
                        os.replace(p, renamed)
                    except Exception:
                        renamed = p
                    for i in range(10):
                        try:
                            shutil.rmtree(renamed, onerror=on_rm_error)
                            break
                        except Exception:
                            time.sleep(0.6 * (i + 1))
                except Exception:
                    continue

        def get_profile_base_dir() -> str:
            raw = os.getenv("AUTOMACAO_CHROME_PROFILE_DIR", "").strip()
            if raw:
                return os.path.abspath(raw)

            local_app_data = os.getenv("LOCALAPPDATA", "").strip()
            if local_app_data:
                return os.path.join(local_app_data, "EDI_Market_Guardian", "Automacao", "chrome_profile")

            user_profile = os.getenv("USERPROFILE", "").strip()
            if user_profile:
                return os.path.join(user_profile, "AppData", "Local", "EDI_Market_Guardian", "Automacao", "chrome_profile")

            return os.path.join(ROOT_DIR, "chrome_profile")

        def choose_profile_dir() -> str:
            base_dir = get_profile_base_dir()
            try:
                os.makedirs(base_dir, exist_ok=True)
            except Exception:
                pass

            singleton_lock = os.path.join(base_dir, "SingletonLock")
            singleton_socket = os.path.join(base_dir, "SingletonSocket")
            singleton_cookie = os.path.join(base_dir, "SingletonCookie")

            is_locked = any(os.path.exists(p) for p in [singleton_lock, singleton_socket, singleton_cookie])
            if not is_locked:
                return base_dir

            ts = time.strftime("%Y%m%d_%H%M%S")
            alt_dir = os.path.join(os.path.dirname(base_dir), f"chrome_profile_run_{ts}")
            os.makedirs(alt_dir, exist_ok=True)
            print(f"AVISO: Perfil do Chrome em uso (lock). Usando perfil alternativo: {alt_dir}")
            return alt_dir
        
        def make_fresh_profile_dir() -> str:
            base_dir = get_profile_base_dir()
            parent = os.path.dirname(base_dir) or base_dir
            ts = time.strftime("%Y%m%d_%H%M%S")
            fresh_dir = os.path.join(parent, f"chrome_profile_fresh_{ts}")
            os.makedirs(fresh_dir, exist_ok=True)
            return fresh_dir

        def env_truthy(name: str, default: bool = False) -> bool:
            raw = os.getenv(name, "").strip().lower()
            if not raw:
                return default
            return raw in {"1", "true", "yes", "y", "on"}

        def rm_tree_safe(p: str) -> None:
            if not p or not os.path.exists(p):
                return

            def on_rm_error(func, path, _exc):
                try:
                    os.chmod(path, 0o777)
                except Exception:
                    pass
                try:
                    func(path)
                except Exception:
                    pass

            try:
                shutil.rmtree(p, onerror=on_rm_error)
            except Exception:
                pass

        def cleanup_automation_chrome_profile() -> None:
            try:
                base_dir = get_profile_base_dir()
                parent = os.path.dirname(base_dir) or base_dir
                now_ts = time.time()

                prune_days = int(os.getenv("CHROME_PROFILE_PRUNE_DAYS", "14").strip() or "14")
                min_age_hours = int(os.getenv("CHROME_PROFILE_CACHE_MIN_AGE_HOURS", "12").strip() or "12")
                min_age_sec = max(0, min_age_hours) * 3600
                prune_before_ts = now_ts - max(1, prune_days) * 86400

                for name in os.listdir(parent):
                    if not (name.startswith("chrome_profile_run_") or name.startswith("chrome_profile_fresh_")):
                        continue
                    p = os.path.join(parent, name)
                    try:
                        st = os.stat(p)
                    except Exception:
                        continue
                    if st.st_mtime <= prune_before_ts:
                        rm_tree_safe(p)

                singleton_lock = os.path.join(base_dir, "SingletonLock")
                singleton_socket = os.path.join(base_dir, "SingletonSocket")
                singleton_cookie = os.path.join(base_dir, "SingletonCookie")
                is_locked = any(os.path.exists(p) for p in [singleton_lock, singleton_socket, singleton_cookie])
                if is_locked:
                    return

                if not env_truthy("AUTO_CLEAN_CHROME_PROFILE", True):
                    return

                targets = [
                    os.path.join(base_dir, "Default", "Cache"),
                    os.path.join(base_dir, "Default", "Code Cache"),
                    os.path.join(base_dir, "Default", "GPUCache"),
                    os.path.join(base_dir, "Default", "GrShaderCache"),
                    os.path.join(base_dir, "Default", "ShaderCache"),
                    os.path.join(base_dir, "Default", "Media Cache"),
                    os.path.join(base_dir, "Default", "Service Worker", "CacheStorage"),
                    os.path.join(base_dir, "Default", "Service Worker", "ScriptCache"),
                    os.path.join(base_dir, "Default", "Crashpad"),
                    os.path.join(base_dir, "Crashpad"),
                ]

                for p in targets:
                    try:
                        if not os.path.exists(p):
                            continue
                        st = os.stat(p)
                        if (now_ts - st.st_mtime) < min_age_sec:
                            continue
                        rm_tree_safe(p)
                    except Exception:
                        continue
            except Exception:
                return

        def check_windows_chrome_auto_update() -> None:
            if os.name != "nt":
                return
            if not env_truthy("CHECK_CHROME_AUTO_UPDATE", True):
                return
            try:
                res = subprocess.run(["sc", "query", "gupdate"], capture_output=True, text=True, timeout=8)
                txt = (res.stdout or res.stderr or "").lower()
                if "does not exist" in txt or "1060" in txt:
                    print("AVISO: Google Update (gupdate) não encontrado. Auto-update do Chrome pode estar desativado.")
                    return
                running = "state" in txt and "running" in txt
                res2 = subprocess.run(["sc", "query", "gupdatem"], capture_output=True, text=True, timeout=8)
                txt2 = (res2.stdout or res2.stderr or "").lower()
                running2 = "state" in txt2 and "running" in txt2
                if running or running2:
                    print("Chrome auto-update: serviço Google Update ativo.")
                else:
                    print("AVISO: Google Update instalado, mas não parece estar em execução agora. Atualização pode depender de tarefas agendadas.")
            except Exception:
                return

        def build_options(profile_dir: str):
            options = uc.ChromeOptions()
            # options.add_argument("--headless=new")  # Desativado pois Barchart bloqueia headless agressivamente
            options.add_argument("--disable-gpu")
            options.add_argument("--no-first-run")
            options.add_argument("--no-default-browser-check")
            options.add_argument("--disable-extensions")
            options.add_argument("--window-size=1920,1080")

            options.add_argument(f"--user-data-dir={profile_dir}")

            options.page_load_strategy = "eager"
            return options

        def env_int(name: str):
            raw = os.getenv(name, "").strip()
            if not raw:
                return None
            try:
                return int(raw)
            except Exception:
                return None

        def parse_major(version_text: str):
            m = re.search(r"(\d+)\.", str(version_text or ""))
            if not m:
                return None
            try:
                return int(m.group(1))
            except Exception:
                return None

        def detect_installed_chrome_major():
            try:
                chrome_path = None
                find = getattr(uc, "find_chrome_executable", None)
                if callable(find):
                    try:
                        chrome_path = find()
                    except Exception:
                        chrome_path = None

                if not chrome_path:
                    chrome_path = shutil.which("chrome") or shutil.which("chrome.exe")

                if not chrome_path:
                    candidates = [
                        os.path.join(os.getenv("PROGRAMFILES", ""), "Google", "Chrome", "Application", "chrome.exe"),
                        os.path.join(os.getenv("PROGRAMFILES(X86)", ""), "Google", "Chrome", "Application", "chrome.exe"),
                        os.path.join(os.getenv("LOCALAPPDATA", ""), "Google", "Chrome", "Application", "chrome.exe"),
                        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                    ]
                    for c in candidates:
                        if c and os.path.isfile(c):
                            chrome_path = c
                            break

                if not chrome_path:
                    return None

                if not isinstance(chrome_path, (str, os.PathLike)):
                    chrome_path = str(chrome_path)
                chrome_exec = str(os.fspath(chrome_path))
                res = subprocess.run([chrome_exec, "--version"], capture_output=True, text=True, timeout=10)
                out = (res.stdout or res.stderr or "").strip()
                return parse_major(out)
            except Exception:
                return None

        def parse_current_browser_major_from_error(err_text: str):
            m = re.search(r"Current browser version is (\d+)\.", str(err_text or ""))
            if not m:
                return None
            try:
                return int(m.group(1))
            except Exception:
                return None
        
        def parse_supported_driver_major_from_error(err_text: str):
            m = re.search(r"only supports Chrome version (\d+)", str(err_text or ""), flags=re.IGNORECASE)
            if not m:
                return None
            try:
                return int(m.group(1))
            except Exception:
                return None

        def is_driver_browser_version_mismatch_error(err_text: str) -> bool:
            t = str(err_text or "").lower()
            return ("only supports chrome version" in t) or ("current browser version is" in t)

        def try_winget_upgrade_chrome() -> bool:
            if os.getenv("AUTO_UPDATE_CHROME", "false").lower() != "true":
                return False
            winget = shutil.which("winget") or shutil.which("winget.exe")
            if not winget:
                return False
            try:
                print("AVISO: Tentando atualizar o Google Chrome via winget (AUTO_UPDATE_CHROME=true)...")
                res = subprocess.run(
                    [
                        winget,
                        "upgrade",
                        "--id",
                        "Google.Chrome",
                        "--silent",
                        "--accept-package-agreements",
                        "--accept-source-agreements",
                    ],
                    capture_output=True,
                    text=True,
                    timeout=240,
                )
                if res.returncode == 0:
                    print("Chrome atualizado via winget.")
                    return True
                out = (res.stderr or res.stdout or "").strip()
                if out:
                    print(f"AVISO: winget upgrade Chrome falhou: {out}")
                return False
            except Exception as e:
                print(f"AVISO: Falha ao executar winget upgrade Chrome: {e}")
                return False

        version_main = env_int("UC_CHROME_VERSION_MAIN")

        def start_uc_driver(vmain: int | None, profile_dir: str):
            print(f"Chrome profile dir: {profile_dir}")
            opts = build_options(profile_dir)
            kwargs: dict[str, Any] = {"options": opts}
            if vmain is not None:
                kwargs["version_main"] = vmain
            try:
                return uc.Chrome(**kwargs, use_subprocess=True)
            except TypeError:
                return uc.Chrome(**kwargs)

        def is_chrome_not_reachable_error(err_text: str) -> bool:
            t = str(err_text or "").lower()
            return (
                "cannot connect to chrome" in t
                or "chrome not reachable" in t
                or ("session not created" in t and "chrome" in t)
            )

        try:
            check_windows_chrome_auto_update()
        except Exception:
            pass
        try:
            cleanup_automation_chrome_profile()
        except Exception:
            pass

        tried: set[int | None] = set()
        candidates: list[int | None] = []
        detected = detect_installed_chrome_major()
        if detected is not None:
            candidates.append(detected)
        if version_main is not None and version_main != detected:
            candidates.append(version_main)
        candidates.append(None)

        driver = None
        last_err: Exception | None = None
        for cand in candidates:
            if cand in tried:
                continue
            tried.add(cand)
            try:
                try:
                    driver = start_uc_driver(cand, choose_profile_dir())
                    break
                except Exception as e:
                    last_err = e
                    if is_uc_cache_not_empty_error(e):
                        print("AVISO: Cache do undetected-chromedriver inconsistente. Limpando e tentando novamente...")
                        cleanup_uc_driver_cache()
                        try:
                            driver = start_uc_driver(cand, choose_profile_dir())
                            break
                        except Exception as e_retry:
                            last_err = e_retry
                    if is_chrome_not_reachable_error(str(e)):
                        fresh = make_fresh_profile_dir()
                        print(f"AVISO: Chrome não respondeu. Tentando perfil limpo: {fresh}")
                        driver = start_uc_driver(cand, fresh)
                        break
                    raise
            except Exception as e:
                last_err = e
                txt = str(e)
                if is_driver_browser_version_mismatch_error(txt):
                    supported = parse_supported_driver_major_from_error(txt)
                    cur_major = parse_current_browser_major_from_error(txt)
                    if supported is not None and cur_major is not None and supported > cur_major:
                        if try_winget_upgrade_chrome():
                            try:
                                detected_after = detect_installed_chrome_major()
                                if detected_after is not None:
                                    if detected_after not in tried:
                                        tried.add(detected_after)
                                        cleanup_uc_driver_cache()
                                        driver = start_uc_driver(detected_after, choose_profile_dir())
                                        break
                            except Exception as e_wu:
                                last_err = e_wu
                    cleanup_uc_driver_cache()
                cur_major = parse_current_browser_major_from_error(txt)
                if cur_major is not None and cur_major not in tried:
                    print(f"Falha ao iniciar (cand={cand}). Tentando version_main={cur_major}... ({e})")
                    tried.add(cur_major)
                    try:
                        try:
                            cleanup_uc_driver_cache()
                            driver = start_uc_driver(cur_major, choose_profile_dir())
                            break
                        except Exception as e2:
                            last_err = e2
                            if is_uc_cache_not_empty_error(e2):
                                print("AVISO: Cache do undetected-chromedriver inconsistente. Limpando e tentando novamente...")
                                cleanup_uc_driver_cache()
                                try:
                                    driver = start_uc_driver(cur_major, choose_profile_dir())
                                    break
                                except Exception as e2_retry:
                                    last_err = e2_retry
                            if is_chrome_not_reachable_error(str(e2)):
                                fresh = make_fresh_profile_dir()
                                print(f"AVISO: Chrome não respondeu. Tentando perfil limpo: {fresh}")
                                driver = start_uc_driver(cur_major, fresh)
                                break
                            raise
                    except Exception as e2:
                        last_err = e2
                        print(f"Falha ao iniciar com version_main={cur_major}. ({e2})")
                else:
                    print(f"Falha ao iniciar (cand={cand}). ({e})")

        if not driver:
            raise last_err or RuntimeError("Falha ao iniciar UC Driver.")
            
        driver.set_page_load_timeout(60)
        driver.maximize_window() # Maximiza para garantir renderização de elementos responsivos
        return driver
    except Exception as e:
        print(f"Erro ao iniciar UC Driver: {e}")
        return None

def check_driver_health(driver):
    """Verifica se o driver ainda está respondendo."""
    try:
        driver.title
        return True
    except:
        return False

def restart_driver_if_needed(driver):
    """Reinicia o driver se estiver morto."""
    if not driver or not check_driver_health(driver):
        print("Driver não está respondendo. Reiniciando...")
        try:
            if driver:
                driver.quit()
        except:
            pass
        return init_driver()
    return driver

def save_debug_info(driver, symbol):
    """Salva HTML e Screenshot para debug."""
    try:
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        
        # Salva Logs do Console
        try:
            logs = driver.get_log('browser')
            with open(f"debug_{symbol}_{timestamp}_console.txt", "w", encoding="utf-8") as f:
                for log in logs:
                    f.write(f"{log}\n")
            print(f"Logs de console salvos para {symbol}.")
        except Exception as e:
            print(f"Erro ao salvar logs de console: {e}")

        # Salva HTML
        html = driver.page_source
        with open(f"debug_{symbol}_{timestamp}.html", "w", encoding="utf-8") as f:
            f.write(html)
            
        # Salva Screenshot
        driver.save_screenshot(f"debug_{symbol}_{timestamp}.png")
        
        print(f"Debug info salvo para {symbol} (HTML, PNG e Console).")
    except Exception as e:
        print(f"Erro ao salvar debug info: {e}")

# ============================================================
# SCRAPING E PARSING
# ============================================================
def parse_html_table(html_content):
    """Parseia tabela HTML usando Pandas e normaliza colunas."""
    try:
        # Usa flavor='bs4' para robustez com html5lib
        # match="Strike" ajuda a filtrar tabelas irrelevantes
        try:
            dfs = pd.read_html(StringIO(html_content), match="Strike", flavor='bs4')
        except:
            # Fallback sem match se falhar
            dfs = pd.read_html(StringIO(html_content), flavor='bs4')
            
        if not dfs:
            return None
        
        # Procura a tabela certa (deve ter Strike e Delta ou Volatility)
        target_df = None
        for i, df in enumerate(dfs):
            # Limpa nomes das colunas (remove espaços e quebras de linha)
            df.columns = [str(c).strip() for c in df.columns]
            cols = [str(c).lower() for c in df.columns]
            
            # Critérios para identificar tabela de opções
            if 'strike' in cols or 'strike price' in cols:
                target_df = df
                print(f"Tabela {i} identificada como alvo ({len(df)} linhas).")
                break
        
        if target_df is None:
            # Se não achou pelos nomes exatos, tenta pegar a maior tabela (com mais linhas)
            print("Aviso: Tabela 'Strike' não encontrada explicitamente. Usando a maior tabela disponível.")
            target_df = max(dfs, key=len)
            
        if target_df is None or target_df.empty:
            return None

        # Normaliza nomes das colunas
        # Mapeamento Barchart HTML -> Nomes internos do CSV esperado
        rename_map = {
            'Strike': 'strikePrice',
            'Last': 'lastPrice',
            'IV': 'volatility',
            'Delta': 'delta',
            'Gamma': 'gamma',
            'Theta': 'theta',
            'Vega': 'vega',
            'Rho': 'rho',
            'Vol': 'volume',
            'Open Int': 'openInterest',
            'Type': 'symbolType',
            'Bid': 'bid',
            'Ask': 'ask',
            'Time': 'tradeTime'
        }
        
        # Limpa nomes das colunas (remove espaços e quebras de linha)
        target_df.columns = [str(c).strip() for c in target_df.columns]
        
        # Renomeia
        new_df = target_df.rename(columns=rename_map)
        
        # Preenche colunas faltantes com 0 ou vazio
        expected_cols = ['strikePrice', 'lastPrice', 'volatility', 'delta', 'gamma', 'theta', 'vega', 'openInterest', 'volume', 'bid', 'ask']
        for col in expected_cols:
            if col not in new_df.columns:
                new_df[col] = 0
                
        # Converte para lista de dicionários
        return new_df.to_dict('records')
        
    except Exception as e:
        print(f"Erro no parsing HTML: {e}")
        return None

def load_env_auto(path: str) -> dict[str, str]:
    try:
        if not path or not os.path.exists(path):
            return {}
        out: dict[str, str] = {}
        with open(path, "r", encoding="utf-8") as f:
            for raw in f:
                line = raw.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip()
                if not k:
                    continue
                out[k] = v
        return out
    except Exception:
        return {}

def _to_float_or_none(val: Any) -> Optional[float]:
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val) if np.isfinite(val) else None
    s = str(val).strip()
    if not s:
        return None
    if s in {"-", "—", "N/A", "n/a", "null", "None"}:
        return None
    s = s.replace(" ", "").replace("%", "").strip()
    if "," in s and "." in s:
        if s.rfind(",") > s.rfind("."):
            s = s.replace(".", "").replace(",", ".")
        else:
            s = s.replace(",", "")
    elif "," in s:
        if re.search(r",\d{3}(\D|$)", s):
            s = s.replace(",", "")
        else:
            s = s.replace(".", "").replace(",", ".")
    elif "." in s:
        if re.search(r"\.\d{3}(\D|$)", s):
            s = s.replace(".", "")
    s = re.sub(r"[^\d\.\-]", "", s)
    if s in {"", "-", ".", "-."}:
        return None
    try:
        out = float(s)
        return out if np.isfinite(out) else None
    except Exception:
        return None

def fetch_tradingview_data(driver, symbol):
    """
    Busca dados de fechamento no TradingView (DOL1! e IND1!).
    Retorna o valor do último fechamento.
    """
    def fetch_tradingview_last_from_scan(scan_ticker: str) -> tuple[Optional[float], Optional[str]]:
        try:
            import math
            url = "https://scanner.tradingview.com/global/scan"
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
                "Accept": "application/json, text/plain, */*",
                "Content-Type": "application/json",
                "Origin": "https://www.tradingview.com",
                "Referer": "https://www.tradingview.com/",
            }
            def request_scan(columns: list[str]) -> Optional[dict[str, Any]]:
                payload = {
                    "symbols": {"tickers": [scan_ticker], "query": {"types": []}},
                    "columns": columns,
                }
                resp = requests.post(url, json=payload, headers=headers, timeout=20)
                if resp.status_code != 200:
                    print(f"TradingView/Scan HTTP {resp.status_code} para {scan_ticker} (cols={columns})")
                    return None
                try:
                    return resp.json()
                except Exception as e:
                    print(f"TradingView/Scan JSON inválido para {scan_ticker}: {e}")
                    return None

            column_candidates = [
                ["close|1", "update_mode"],
                ["close|5", "update_mode"],
                ["close", "update_mode"],
                ["close"],
            ]

            for cols in column_candidates:
                body = request_scan(cols)
                if not body:
                    continue

                data = body.get("data") or []
                if not data:
                    continue

                d = data[0].get("d") or []
                if not d:
                    continue

                val = d[0] if len(d) >= 1 else None
                update_mode = d[1] if len(d) >= 2 and "update_mode" in cols else None

                if update_mode:
                    print(f"TradingView/Scan update_mode {scan_ticker}: {update_mode}")

                if val is None:
                    continue

                price = float(val)
                if not math.isfinite(price):
                    continue

                if cols and cols[0].startswith("close|"):
                    print(f"TradingView/Scan usando {cols[0]} para {scan_ticker}: {price}")
                return price, update_mode

            return None, None
        except Exception as e:
            print(f"TradingView/Scan erro para {scan_ticker}: {e}")
            return None, None

    # Ajusta símbolo para URL do TradingView Brasil
    tv_symbol = symbol
    scan_tickers: list[str] = []
    is_bmf_futures = False
    if "DOL1!" in symbol:
        tv_symbol = "BMFBOVESPA-DOL1!"
        scan_tickers = ["BMFBOVESPA:DOL1!"]
        is_bmf_futures = True
    elif "IND1!" in symbol:
        tv_symbol = "BMFBOVESPA-IND1!"
        scan_tickers = ["BMFBOVESPA:IND1!"]
        is_bmf_futures = True
    elif symbol.strip().upper() == "EWZ":
        scan_tickers = ["AMEX:EWZ", "NYSEARCA:EWZ"]
    elif ":" in symbol:
        scan_tickers = [symbol]

    scan_price: Optional[float] = None
    scan_update_mode: Optional[str] = None
    for scan_ticker in scan_tickers:
        price, update_mode = fetch_tradingview_last_from_scan(scan_ticker)
        if price is not None:
            scan_price = price
            scan_update_mode = update_mode
            if not is_bmf_futures:
                print(f"{symbol} (TradingView/Scan): {price}")
                return price
            break

    if is_bmf_futures and scan_price is not None and scan_update_mode:
        if "delayed" not in str(scan_update_mode).lower():
            print(f"{symbol} (TradingView/Scan): {scan_price}")
            return scan_price
        
    url = f"https://br.tradingview.com/symbols/{tv_symbol}/"
    print(f"Acessando TradingView: {symbol} ({url})...")
    
    try:
        if not driver:
            return None
        driver.get(url)
        time.sleep(3)
        
        # Seletores para o preço
        selectors = [
            ".js-symbol-last", 
            "span[class*='last-']",
            "div[class*='quote-ticker-in-headline'] div[class*='last-']",
            ".symbol-price",
            "span.tv-symbol-price-quote__value"
        ]
        
        price = None
        for sel in selectors:
            try:
                el = driver.find_element(By.CSS_SELECTOR, sel)
                price = _to_float_or_none(el.text)
                if price is not None:
                    break
            except:
                continue
                
        if price is not None:
            print(f"{symbol} (TradingView): {price}")
            return price
        else:
            print(f"Preço não encontrado no TradingView para {symbol}")
            # save_debug_info(driver, f"TV_{symbol}")
            return scan_price
            
    except Exception as e:
        print(f"Erro no TradingView {symbol}: {e}")
        return scan_price

def fetch_fed_rate_monitor_investing():
    url = "https://m.br.investing.com/central-banks/fed-rate-monitor"
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    try:
        resp = requests.get(url, headers=headers, timeout=30)
        if resp.status_code != 200:
            print(f"Fed Rate Monitor (Investing): HTTP {resp.status_code}")
            return None
        html = resp.text
    except Exception as e:
        print(f"Fed Rate Monitor (Investing): erro ao baixar HTML: {e}")
        return None

    updated_at = None
    m_updated = re.search(r"Atualizado:\s*([^<]+)<", html)
    if m_updated:
        updated_at = m_updated.group(1).strip()

    meetings = []
    parts = html.split('<div class="cardWrapper">')
    for part in parts[1:]:
        m_meeting = re.search(r"Reunião:\s*</span>\s*<i>\s*([^<]+)\s*</i>", part)
        if not m_meeting:
            continue
        meeting_at = m_meeting.group(1).strip()

        row_pairs = re.findall(
            r'<td class="left">\s*([0-9.,]+\s*-\s*[0-9.,]+)[\s\S]*?</td>\s*<td>\s*([0-9.,]+)%\s*</td>',
            part,
        )
        ranges = []
        for rng, pct in row_pairs:
            rng_norm = rng.replace(" ", "").replace(",", ".")
            pct_norm = pct.replace(".", "").replace(",", ".")
            try:
                prob = float(pct_norm)
            except Exception:
                continue
            ranges.append({"target_range": rng_norm, "probability_pct": prob})

        top = None
        if ranges:
            top = max(ranges, key=lambda x: x["probability_pct"])

        meetings.append(
            {
                "meeting_at": meeting_at,
                "ranges": ranges,
                "top_target_range": (top["target_range"] if top else None),
                "top_probability_pct": (top["probability_pct"] if top else None),
            }
        )

    if not meetings:
        print("Fed Rate Monitor (Investing): nenhuma reunião encontrada no HTML.")
        return None

    next_meeting = meetings[0]
    return {
        "source_url": url,
        "captured_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "updated_at": updated_at,
        "next_meeting_at": next_meeting.get("meeting_at"),
        "next_top_target_range": next_meeting.get("top_target_range"),
        "next_top_probability_pct": next_meeting.get("top_probability_pct"),
        "meetings": meetings,
    }

import json
import math

def get_barchart_tokens(driver):
    """Extrai CSRF Token e Cookies do driver Selenium."""
    try:
        # Garante que estamos no domínio barchart.com
        if "barchart.com" not in driver.current_url:
            print("Acessando Barchart para obter tokens...")
            try:
                driver.get("https://www.barchart.com/")
                # Warmup: aguarda carregar e rola um pouco
                time.sleep(5)
                driver.execute_script("window.scrollTo(0, 500);")
                time.sleep(2)
            except Exception:
                print("Timeout ou erro ao carregar página inicial. Tentando continuar...")
                driver.execute_script("window.stop();")
            
        csrf_token = driver.find_element(By.XPATH, "//meta[@name='csrf-token']").get_attribute("content")
        
        selenium_cookies = driver.get_cookies()
        session_cookies = {c['name']: c['value'] for c in selenium_cookies}
        
        return csrf_token, session_cookies
    except Exception as e:
        print(f"Erro ao extrair tokens: {e}")
        return None, None

def fetch_barchart_quote_iv_context(driver, symbol: str, asset_type: str = "etfs-funds") -> tuple[dict[str, float], str, str]:
    try:
        if not driver or not symbol:
            return {}, "", ""

        csrf_token, cookies = get_barchart_tokens(driver)
        if not csrf_token or not cookies:
            return {}, "", ""

        api_url = "https://www.barchart.com/proxies/core-api/v1/quotes/get"
        referer = f"https://www.barchart.com/{asset_type}/quotes/{symbol}/overview"
        fields = ",".join(
            [
                "symbol",
                "impliedVolatility",
                "volatility",
                "impliedVolatilityAtm",
                "atmIv",
                "historicVolatility",
                "hv",
                "ivRank",
                "ivRank1y",
                "ivPercentile",
            ]
        )
        params = {"symbol": symbol, "fields": fields, "raw": "1"}
        headers = {
            "User-Agent": driver.execute_script("return navigator.userAgent;"),
            "Referer": referer,
            "X-Requested-With": "XMLHttpRequest",
            "Accept": "application/json, text/plain, */*",
            "X-CSRF-TOKEN": csrf_token,
        }

        resp = requests.get(api_url, params=params, cookies=cookies, headers=headers, timeout=20)
        if resp.status_code != 200:
            return {}, "", ""
        data = resp.json()
        payload = data.get("data")
        item = None
        if isinstance(payload, list) and payload:
            item = payload[0]
        elif isinstance(payload, dict):
            item = payload
        if not isinstance(item, dict):
            return {}, "", ""

        raw = item.get("raw") if isinstance(item.get("raw"), dict) else {}

        def _get(key: str):
            if isinstance(raw, dict) and key in raw:
                return raw.get(key)
            return item.get(key)

        iv = _to_float_or_none(_get("impliedVolatility"))
        if iv is None or iv <= 0:
            iv = _to_float_or_none(_get("volatility"))
        if iv is None or iv <= 0:
            iv = _to_float_or_none(_get("impliedVolatilityAtm"))
        if iv is None or iv <= 0:
            iv = _to_float_or_none(_get("atmIv"))

        hv = _to_float_or_none(_get("historicVolatility"))
        if hv is None or hv <= 0:
            hv = _to_float_or_none(_get("hv"))

        iv_rank = _to_float_or_none(_get("ivRank"))
        if iv_rank is None or iv_rank <= 0:
            iv_rank = _to_float_or_none(_get("ivRank1y"))
        if iv_rank is None or iv_rank <= 0:
            iv_rank = _to_float_or_none(_get("ivPercentile"))

        out: dict[str, float] = {}
        if iv is not None and iv > 0:
            out["iv_atm_pct"] = float(iv * 100.0) if iv <= 2.0 else float(iv)
        if hv is not None and hv > 0:
            out["hv_pct"] = float(hv * 100.0) if hv <= 2.0 else float(hv)
        if iv_rank is not None and iv_rank > 0:
            out["iv_rank_pct"] = float(iv_rank * 100.0) if iv_rank <= 2.0 else float(iv_rank)

        return out, "barchart_quote_api", referer
    except Exception:
        return {}, "", ""

def fetch_options_api(driver, symbol, expiration_date=None, asset_type='etfs-funds'):
    """Busca dados via API Híbrida (Selenium + Requests)."""
    print(f"Iniciando captura via API Híbrida para {symbol} ({asset_type})...")
    
    csrf_token, cookies = get_barchart_tokens(driver)
    if not csrf_token or not cookies:
        print("Falha ao obter tokens de autenticação.")
        return None

    # Configuração específica para Futuros vs Outros
    if asset_type == 'futures':
        # API para Futuros (Baseado em quotes/get)
        api_url = "https://www.barchart.com/proxies/core-api/v1/quotes/get"
        params = {
            "symbol": symbol,
            "list": "futures.options",
            "fields": "strike,lastPrice,volume,openInterest,optionType,symbol,expirationDate,impliedVolatility,volatility,iv,bid,ask,delta,gamma,vega,theta,moneyness",
            "meta": "field.shortName,field.description,field.type,lists.lastUpdate",
            "groupBy": "optionType",
            "orderBy": "strike",
            "orderDir": "asc",
            "raw": "1",
            "moneyness": "allRows",
            "futuresOptionsView": "merged"
        }
        headers = {
            "User-Agent": driver.execute_script("return navigator.userAgent;"),
            "Referer": f"https://www.barchart.com/futures/quotes/{symbol}/options",
            "X-Requested-With": "XMLHttpRequest",
            "Accept": "application/json, text/plain, */*",
            "X-CSRF-TOKEN": csrf_token
        }
    else:
        # API Padrão (ETFs/Stocks)
        api_url = "https://www.barchart.com/proxies/core-api/v1/options/get"
        params = {
            "symbol": symbol,
            "fields": "symbol,strikePrice,lastPrice,openInterest,volume,impliedVolatility,volatility,iv,expirationDate,type,bid,ask,delta,gamma,vega,theta,moneyness,bidPrice,askPrice,midpoint",
            "orderBy": "strikePrice",
            "orderDir": "asc",
            "meta": "field.shortName,field.type,field.description",
            "hasOptions": "true",
            "page": "1",
            "limit": "200",
            "raw": "1"
        }
        headers = {
            "User-Agent": driver.execute_script("return navigator.userAgent;"),
            "Referer": f"https://www.barchart.com/{asset_type}/quotes/{symbol}/options",
            "X-Requested-With": "XMLHttpRequest",
            "Accept": "application/json, text/plain, */*",
            "X-CSRF-TOKEN": csrf_token
        }

    all_data = []
    
    # Loop de Paginação (apenas para endpoint padrão, futuros retorna tudo ou agrupado)
    page = 1
    max_pages = 20
    retry_429: dict[int, int] = {}
    cooldown_s = 0.0
    
    while page <= max_pages:
        if asset_type != 'futures':
            print(f"Baixando página {page} da API...")
            params['page'] = str(page)
            
        response = None
        try:
            response = requests.get(api_url, params=params, cookies=cookies, headers=headers, timeout=30)

            if response.status_code == 429:
                attempt = int(retry_429.get(page, 0)) + 1
                retry_429[page] = attempt
                if attempt > 8:
                    print(f"Erro 429 (Too Many Requests) na página {page}. Máximo de tentativas excedido; seguindo com dados parciais.")
                    break
                retry_after = str(response.headers.get("Retry-After") or "").strip()
                try:
                    retry_after_s = float(retry_after)
                except Exception:
                    retry_after_s = 0.0
                wait_s = retry_after_s if retry_after_s > 0 else float(min(180.0, (20.0 * (2 ** (attempt - 1))) + random.uniform(5.0, 15.0)))
                cooldown_s = float(min(180.0, max(cooldown_s, wait_s)))
                print(f"Erro 429 (Too Many Requests) na página {page}. Aguardando {wait_s:.0f}s e tentando novamente...")
                time.sleep(wait_s)
                continue

            if response.status_code != 200:
                print(f"Erro na API: Status {response.status_code}")
                break
                
            data = response.json()
            
            # Tratamento diferente para Futuros (Dict com Groups) vs Padrão (List)
            if asset_type == 'futures':
                # Futuros retorna dict com chaves 'Call' e 'Put' (groupBy optionType)
                if 'data' in data and isinstance(data['data'], dict):
                    for group_key, items in data['data'].items():
                        if isinstance(items, list):
                            all_data.extend(items)
                elif 'data' in data and isinstance(data['data'], list):
                     all_data.extend(data['data'])
                
                # Futuros geralmente não paginam da mesma forma ou retornam tudo de uma vez
                break 
            else:
                # Padrão
                items = data.get('data', [])
                if not items:
                    print("Fim dos dados (lista vazia).")
                    break
                
                all_data.extend(items)
                total = data.get('total', 0)
                print(f"Recebidos {len(items)} itens. Total acumulado: {len(all_data)}/{total}")
                
                if len(all_data) >= total:
                    break
                page += 1
                delay = float(max(random.uniform(10.0, 18.0), cooldown_s))
                print(f"Aguardando {delay:.1f}s...")
                time.sleep(delay)
                cooldown_s = float(max(0.0, cooldown_s - 5.0))
                
        except Exception as e:
            print(f"Erro no request da API: {e}")
            break

    if not all_data:
        return None

    df = pd.DataFrame(all_data)
    
    # Normalização de Colunas
    def get_val(row, key, alt_key=None):
        val = None
        if 'raw' in row and isinstance(row['raw'], dict):
            val = row['raw'].get(key)
            if val is None and alt_key:
                val = row['raw'].get(alt_key)
        
        if val is None:
            val = row.get(key)
            if val is None and alt_key:
                val = row.get(alt_key)
        return val

    # Mapeamento de campos (Futures usa 'strike', Standard usa 'strikePrice')
    df['Strike'] = df.apply(lambda x: get_val(x, 'strikePrice', 'strike'), axis=1)
    df['Last'] = df.apply(lambda x: get_val(x, 'lastPrice'), axis=1)
    df['Open Int'] = df.apply(lambda x: get_val(x, 'openInterest'), axis=1)
    df['Vol'] = df.apply(lambda x: get_val(x, 'volume'), axis=1)

    def get_val_any(row, keys):
        for key in keys:
            val = get_val(row, key)
            if val is None:
                continue
            s = str(val).strip()
            if s in {"", "-", "—", "N/A", "n/a", "null", "None"}:
                continue
            return val
        return None

    df['IV'] = df.apply(
        lambda x: get_val_any(
            x,
            [
                'impliedVolatility',
                'impliedVolatilityPct',
                'impliedVolatilityMid',
                'volatility',
                'volatilityPct',
                'iv',
                'ivPct',
                'impliedVol',
                'implied_volatility',
            ],
        ),
        axis=1,
    )
    
    def extract_type(row):
        # Tenta pegar do campo 'optionType' ou 'type' ou inferir do simbolo
        otype = get_val(row, 'optionType') or get_val(row, 'type')
        if otype:
            return otype
        
        sym = row.get('symbol', '')
        if str(sym).endswith('C'): return 'Call'
        if str(sym).endswith('P'): return 'Put'
        return 'Unknown'

    df['Type'] = df.apply(extract_type, axis=1)
    
    # Expiration Date
    # Para futuros, pode não vir no dado. Se não vir, usamos a data passada.
    df['Expiration'] = df.apply(lambda x: get_val(x, 'expirationDate'), axis=1)
    
    if expiration_date:
        # Tenta converter para string YYYY-MM-DD
        if hasattr(expiration_date, 'strftime'):
            exp_str = expiration_date.strftime("%Y-%m-%d")
        else:
            exp_str = str(expiration_date)
            
        # Se a coluna Expiration estiver vazia ou nula, preenche
        df['Expiration'] = df['Expiration'].fillna(exp_str)
        # Para garantir, se a coluna não existir ou tiver valores vazios string
        if 'Expiration' in df.columns:
             df.loc[df['Expiration'].isna() | (df['Expiration'] == ''), 'Expiration'] = exp_str
    
    # Tratamento de IV (Implied Volatility)
    # Se vier 'N/A' ou None, converte para 0.0
    if 'IV' in df.columns:
        # Remove caracteres não numéricos exceto ponto (ex: '10.5%') se houver, e trata 'N/A'
        def clean_iv(val):
            if val is None: return 0.0
            s = str(val).strip().replace('%', '').strip()
            if s.upper() == 'N/A' or s == '': return 0.0
            if "," in s and "." in s:
                if s.rfind(",") > s.rfind("."):
                    s = s.replace(".", "").replace(",", ".")
                else:
                    s = s.replace(",", "")
            elif "," in s:
                if re.search(r",\d{3}$", s):
                    s = s.replace(",", "")
                else:
                    s = s.replace(".", "").replace(",", ".")
            elif "." in s:
                if re.search(r"\.\d{3}$", s):
                    s = s.replace(".", "")
            try:
                out = float(s)
                if out <= 0.0:
                    return 0.0
                if out <= 2.0:
                    return float(out * 100.0)
                if out > 500.0:
                    return float(out / 100.0)
                return float(out)
            except:
                return 0.0
        
        df['IV'] = df['IV'].apply(clean_iv)

    final_cols = ['Strike', 'Last', 'Open Int', 'Vol', 'Type', 'Expiration', 'IV', 'symbol']
    
    # Garante que todas as colunas existem
    for col in final_cols:
        if col not in df.columns:
            df[col] = None
            
    return df[final_cols].copy()

def fetch_options_data(driver, symbol, expiration, asset_type, custom_url=None):
    """Wrapper para manter compatibilidade, agora usando API."""
    # Adaptação temporária para retornar formato esperado pelo process_and_save_csv
    df = fetch_options_api(driver, symbol, expiration, asset_type)
    if df is not None and not df.empty:
        # Converte de volta para lista de dicts com chaves esperadas pelo process_and_save_csv
        # O process_and_save_csv espera: strikePrice, lastPrice, volatility, delta, etc.
        # O fetch_options_api já normalizou para: Strike, Last, IV, etc.
        # Vamos reverter ou adaptar para o que o parser original esperava, ou retornar o DF e torcer para o código downstream ter mudado (mas não mudou neste arquivo).
        # Melhor estratégia: retornar dict 'data' com chaves mapeadas para o que o processador atual espera.
        records = []
        for _, row in df.iterrows():
            records.append({
                'strikePrice': row['Strike'],
                'lastPrice': row['Last'],
                'volatility': row['IV'],
                'openInterest': row['Open Int'],
                'volume': row['Vol'],
                'symbolType': row['Type'],
                'expirationDate': row['Expiration'],
                # Campos que a API talvez não trouxe ou não normalizamos, mas o parser antigo usava:
                'bid': 0, 'ask': 0, 'delta': 0, 'gamma': 0, 'vega': 0, 'theta': 0
            })
        return {"data": records, "meta": {}}
    return None

def fetch_quote_data(driver, symbol):
    """Busca dados de cotação (Last Price) via Scraping."""
    try:
        selectors = [
            "span.last-change", 
            "div.last-change", 
            "span[data-ng-bind='lastPrice']",
            ".symbol-price .price"
        ]
        
        last_val = None
        for sel in selectors:
            try:
                el = driver.find_element(By.CSS_SELECTOR, sel)
                txt = el.text.strip().replace(',', '')
                if txt and txt != "N/A":
                    last_val = float(txt)
                    break
            except:
                continue
        
        if last_val is not None:
            return {"last": last_val}
            
    except Exception as e:
        print(f"Erro ao extrair Quote HTML para {symbol}: {e}")
        
    return None

def _utc_now_iso() -> str:
    try:
        return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    except Exception:
        return ""

def extract_barchart_iv_context(page_source: str) -> tuple[dict[str, float], str]:
    if not page_source:
        return {}, ""

    raw = str(page_source)
    txt = re.sub(r"<[^>]+>", " ", raw)
    txt = re.sub(r"\s+", " ", txt).strip()

    def _find_pct_label(label: str) -> float:
        m = re.search(
            rf"{re.escape(label)}\s*(?::)?\s*([0-9\.,]+)\s*%",
            txt,
            flags=re.IGNORECASE,
        )
        return _parse_float(m.group(1)) if m else 0.0

    def _find_pct_any(labels: list[str]) -> float:
        for label in labels:
            val = _find_pct_label(label)
            if val > 0.0:
                return val
        return 0.0

    out = {
        "iv_atm_pct": _find_pct_any(["Implied Volatility (ATM)", "Implied Volatility ATM"]),
        "hv_pct": _find_pct_any(["Historic Volatility", "Historical Volatility"]),
        "iv_rank_pct": _find_pct_any(["IV Rank", "IVRank"]),
    }
    out = {k: v for k, v in out.items() if v > 0.0}
    if out:
        return out, "barchart_html_label"

    def _find_json_num(keys: list[str]) -> float:
        for key in keys:
            m = re.search(rf"\"{re.escape(key)}\"\s*:\s*([0-9]+(?:\.[0-9]+)?)", raw, flags=re.IGNORECASE)
            if not m:
                continue
            val = _parse_float(m.group(1))
            if val > 0.0:
                return val
        return 0.0

    iv_rank = _find_json_num(["ivRank", "iv_rank", "iv_rank_pct"])
    iv_atm = _find_json_num(["ivAtm", "iv_atm", "impliedVolatilityAtm", "iv_atm_pct", "atmIv"])
    hv = _find_json_num(["historicVolatility", "hv", "hv_pct"])

    out2 = {}
    if iv_rank > 0:
        out2["iv_rank_pct"] = iv_rank
    if iv_atm > 0:
        out2["iv_atm_pct"] = iv_atm
    if hv > 0:
        out2["hv_pct"] = hv
    if out2:
        return out2, "barchart_json_blob"

    return {}, ""

def _normalize_wdo_spot(val: Any) -> Optional[float]:
    spot = _to_float_or_none(val)
    if spot is None:
        return None
    if spot > 0.0 and spot < 100.0:
        spot *= 1000.0
    return spot if spot > 0.0 else None

def _normalize_pct_value(val: Any) -> float:
    v = _to_float_or_none(val)
    if v is None or v <= 0.0:
        return 0.0
    if v <= 2.0:
        return float(v * 100.0)
    if v > 500.0:
        return float(v / 100.0)
    return float(v)

def fetch_barchart_futures_last(driver, contract_symbol: str) -> Optional[float]:
    try:
        if not driver or not contract_symbol:
            return None
        url = f"https://www.barchart.com/futures/quotes/{contract_symbol}/overview"
        driver.get(url)
        time.sleep(2)
        quote = fetch_quote_data(driver, contract_symbol)
        if not quote:
            return None
        return _normalize_wdo_spot(quote.get("last"))
    except Exception as e:
        print(f"Erro ao obter Last do Barchart para {contract_symbol}: {e}")
        return None

def cleanup_expired_files(directory):
    """Remove arquivos CSV com data de vencimento anterior a hoje."""
    try:
        today = dt.date.today()
        files = glob.glob(os.path.join(directory, "*_options_exp-*.csv"))
        
        count = 0
        for f in files:
            try:
                # Extrai a data de expiração do nome do arquivo
                # Formato esperado: ...exp-YYYY-MM-DD...
                basename = os.path.basename(f)
                parts = basename.split("exp-")
                if len(parts) > 1:
                    date_part = parts[1].split("_")[0].split(".")[0] # Pega YYYY-MM-DD
                    exp_date = dt.datetime.strptime(date_part, "%Y-%m-%d").date()
                    
                    if exp_date < today:
                        os.remove(f)
                        print(f"Arquivo vencido removido: {basename}")
                        count += 1
            except Exception as e:
                # Ignora arquivos que não seguem o padrão ou erros de data
                continue
                
        if count > 0:
            print(f"Limpeza concluída: {count} arquivos vencidos removidos de {directory}.")
    except Exception as e:
        print(f"Erro na limpeza de arquivos vencidos em {directory}: {e}")

def _safe_unlink(path: str, retries: int = 5) -> bool:
    last_exc = None
    for attempt in range(retries):
        try:
            os.remove(path)
            return True
        except FileNotFoundError:
            return True
        except PermissionError as e:
            last_exc = e
            time.sleep(0.25 * (attempt + 1))
        except OSError as e:
            last_exc = e
            time.sleep(0.25 * (attempt + 1))
    if last_exc:
        print(f"AVISO: Não foi possível remover '{path}': {last_exc}")
    return False

def purge_csv_dir(directory: str):
    removed = 0
    failed = 0
    try:
        for root, _, files in os.walk(directory):
            for name in files:
                if not name.lower().endswith(".csv"):
                    continue
                p = os.path.join(root, name)
                if _safe_unlink(p):
                    removed += 1
                else:
                    failed += 1
    except Exception as e:
        print(f"AVISO: Falha ao limpar CSVs em '{directory}': {e}")
        return

    if removed or failed:
        print(f"Limpeza CSV ({directory}): removidos={removed}, falhas={failed}")

def purge_csv_older_than(directory: str, min_mtime: float):
    removed = 0
    failed = 0
    try:
        for root, _, files in os.walk(directory):
            for name in files:
                if not name.lower().endswith(".csv"):
                    continue
                p = os.path.join(root, name)
                try:
                    if os.path.getmtime(p) >= min_mtime:
                        continue
                except Exception:
                    continue
                if _safe_unlink(p):
                    removed += 1
                else:
                    failed += 1
    except Exception as e:
        print(f"AVISO: Falha ao limpar CSVs antigos em '{directory}': {e}")
        return

    if removed or failed:
        print(f"Limpeza CSV antigos ({directory}): removidos={removed}, falhas={failed}")

def _parse_meeting_date(meeting_at: str):
    if not meeting_at:
        return None
    s = str(meeting_at).strip()
    if not s:
        return None

    m_dot = re.search(r"(\d{1,2})\.(\d{1,2})\.(\d{4})", s)
    if m_dot:
        try:
            return dt.date(int(m_dot.group(3)), int(m_dot.group(2)), int(m_dot.group(1)))
        except Exception:
            return None

    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d"):
        try:
            return dt.datetime.strptime(s, fmt).date()
        except Exception:
            pass

    month_map = {
        "jan": 1, "janeiro": 1,
        "fev": 2, "fevereiro": 2,
        "mar": 3, "março": 3, "marco": 3,
        "abr": 4, "abril": 4,
        "mai": 5, "maio": 5,
        "jun": 6, "junho": 6,
        "jul": 7, "julho": 7,
        "ago": 8, "agosto": 8,
        "set": 9, "setembro": 9, "sep": 9,
        "out": 10, "outubro": 10, "oct": 10,
        "nov": 11, "novembro": 11,
        "dez": 12, "dezembro": 12, "dec": 12,
        "feb": 2, "apr": 4, "may": 5, "aug": 8,
    }

    m = re.search(r"(\d{1,2})\s*(?:de\s*)?([A-Za-zçÇ]+)\s*(?:de\s*)?(\d{4})", s, flags=re.IGNORECASE)
    if m:
        day = int(m.group(1))
        mon = m.group(2).lower().strip(".")
        year = int(m.group(3))
        mon_num = month_map.get(mon[:3], month_map.get(mon))
        if mon_num:
            try:
                return dt.date(year, mon_num, day)
            except Exception:
                return None

    m2 = re.search(r"([A-Za-zçÇ]+)\s+(\d{1,2}),?\s+(\d{4})", s, flags=re.IGNORECASE)
    if m2:
        mon = m2.group(1).lower().strip(".")
        day = int(m2.group(2))
        year = int(m2.group(3))
        mon_num = month_map.get(mon[:3], month_map.get(mon))
        if mon_num:
            try:
                return dt.date(year, mon_num, day)
            except Exception:
                return None

    return None

def update_fed_rates_json_from_monitor(fed_monitor: dict):
    if not fed_monitor:
        return
    if not os.path.isdir(B3_SYSTEM_DIR):
        return

    today = dt.date.today()
    meetings = []
    for m in fed_monitor.get("meetings") or []:
        meeting_at = m.get("meeting_at")
        meet_date = _parse_meeting_date(meeting_at)
        if meet_date is None:
            continue
        days_remaining = max((meet_date - today).days, 0)
        top_rng = m.get("top_target_range")
        probs = {}
        ranges = m.get("ranges")
        if isinstance(ranges, list) and ranges:
            for r in ranges:
                if not isinstance(r, dict):
                    continue
                rng = r.get("target_range")
                pct = r.get("probability_pct")
                if not isinstance(rng, str) or rng.strip() == "":
                    continue
                try:
                    if pct is None:
                        continue
                    if isinstance(pct, str):
                        pct_norm = pct.strip().replace("%", "")
                        pct_norm = pct_norm.replace(".", "").replace(",", ".")
                        probs[rng.strip()] = float(pct_norm)
                    else:
                        probs[rng.strip()] = float(pct)
                except Exception:
                    continue
        if not probs and top_rng and m.get("top_probability_pct") is not None:
            try:
                top_pct = m.get("top_probability_pct")
                if top_pct is not None:
                    if isinstance(top_pct, str):
                        top_pct_norm = top_pct.strip().replace("%", "")
                        top_pct_norm = top_pct_norm.replace(".", "").replace(",", ".")
                        probs[str(top_rng)] = float(top_pct_norm)
                    else:
                        probs[str(top_rng)] = float(top_pct)
            except Exception:
                pass
        meetings.append(
            {
                "date": meet_date.strftime("%Y-%m-%d"),
                "days_remaining": days_remaining,
                "current_rate": (str(top_rng) if top_rng else ""),
                "probs": probs,
            }
        )

    if not meetings:
        return

    payload = {
        "source": "Investing Fed Rate Monitor",
        "last_update": today.strftime("%Y-%m-%d"),
        "meetings": meetings,
    }

    try:
        import json
        written = []
        targets = [FED_RATES_JSON_PATH] + list(FED_RATES_PUBLIC_JSON_PATHS)
        for target in targets:
            try:
                os.makedirs(os.path.dirname(target), exist_ok=True)
                with open(target, "w", encoding="utf-8") as f:
                    json.dump(payload, f, ensure_ascii=False, indent=2)
                written.append(target)
            except Exception:
                continue
        if written:
            for p in written:
                print(f"Fed rates atualizado: {p}")
    except Exception as e:
        print(f"AVISO: Falha ao atualizar fed_rates.json: {e}")

def _parse_float(value: Any) -> float:
    if value is None:
        return 0.0
    if isinstance(value, (int, float)):
        try:
            return float(value)
        except Exception:
            return 0.0
    s = str(value).strip()
    if s in {"", "-", "—", "N/A", "n/a", "null", "None"}:
        return 0.0
    s = s.replace("%", "").strip()
    if "," in s and "." in s:
        if s.rfind(",") > s.rfind("."):
            s = s.replace(".", "").replace(",", ".")
        else:
            s = s.replace(",", "")
    elif "," in s:
        if re.search(r",\d{3}$", s):
            s = s.replace(",", "")
        else:
            s = s.replace(".", "").replace(",", ".")
    elif "." in s:
        if re.search(r"\.\d{3}$", s):
            s = s.replace(".", "")
    s = re.sub(r"[^\d\.\-]", "", s)
    if s in {"", "-", ".", "-."}:
        return 0.0
    try:
        return float(s)
    except Exception:
        return 0.0

def _compute_representative_iv(df: pd.DataFrame, underlying_spot: float) -> float:
    if df is None or df.empty:
        return 0.0
    if "IV" not in df.columns or "Strike" not in df.columns:
        return 0.0

    def _weighted_median(values, weights) -> float:
        v = np.asarray(values, dtype=float)
        w = np.asarray(weights, dtype=float)
        ok = np.isfinite(v) & np.isfinite(w) & (w > 0.0)
        if not bool(ok.any()):
            return 0.0
        v2 = v[ok]
        w2 = w[ok]
        order = np.argsort(v2)
        v_sorted = v2[order]
        w_sorted = w2[order]
        cutoff = float(w_sorted.sum()) * 0.5
        idx = int(np.searchsorted(np.cumsum(w_sorted), cutoff, side="left"))
        if idx < 0:
            idx = 0
        if idx >= len(v_sorted):
            idx = len(v_sorted) - 1
        return float(v_sorted[idx])

    spot = float(underlying_spot or 0.0)
    if spot > 0.0 and spot < 100.0:
        spot *= 1000.0

    tmp = df[["Strike", "IV"]].copy()
    tmp["Strike"] = pd.to_numeric(tmp["Strike"], errors="coerce")
    tmp["IV"] = pd.to_numeric(tmp["IV"], errors="coerce")
    oi_col = None
    for c in ("Open Int", "Open Interest", "openInterest"):
        if c in df.columns:
            oi_col = c
            break
    if oi_col:
        tmp["OI"] = pd.to_numeric(df[oi_col], errors="coerce")
    else:
        tmp["OI"] = 0.0
    if "Moneyness" in df.columns:
        tmp["Moneyness"] = pd.Series(df["Moneyness"]).apply(_parse_float)
    else:
        tmp["Moneyness"] = 0.0

    valid = pd.notna(tmp["Strike"]) & pd.notna(tmp["IV"]) & (tmp["IV"] > 0)
    tmp = tmp.loc[valid].copy()
    if tmp.empty:
        return 0.0

    m = np.asarray(tmp["Moneyness"], dtype=float)
    has_moneyness = bool((np.abs(m) > 0.0001).sum() >= max(10, int(0.1 * len(tmp))))
    if has_moneyness:
        sel = tmp[np.abs(m) <= 2.5]
        if len(sel) >= 5:
            oi_sum = float(np.nansum(np.asarray(sel["OI"], dtype=float)))
            if oi_sum > 0.0:
                return _weighted_median(sel["IV"], sel["OI"])
            return float(np.nanmedian(np.asarray(sel["IV"], dtype=float)))

    if spot > 0.0:
        strike_arr = np.asarray(tmp["Strike"], dtype=float)
        dist_pct = np.abs(strike_arr - spot) / spot * 100.0
        sel = tmp[dist_pct <= 2.5]
        if len(sel) >= 5:
            oi_sum = float(np.nansum(np.asarray(sel["OI"], dtype=float)))
            if oi_sum > 0.0:
                return _weighted_median(sel["IV"], sel["OI"])
            return float(np.nanmedian(np.asarray(sel["IV"], dtype=float)))
        nearest = tmp.assign(_dist=np.abs(strike_arr - spot)).sort_values("_dist").head(5)
        if not nearest.empty:
            oi_sum = float(np.nansum(np.asarray(nearest["OI"], dtype=float)))
            if oi_sum > 0.0:
                return _weighted_median(nearest["IV"], nearest["OI"])
            return float(np.nanmedian(np.asarray(nearest["IV"], dtype=float)))

    return float(np.nanmedian(np.asarray(tmp["IV"], dtype=float)))

def process_and_save_csv(
    data_json,
    symbol,
    output_dir,
    file_prefix_or_symbol,
    underlying_spot: float = 0.0,
    fallback_iv_pct: float = 0.0,
):
    """
    Processa dados e salva CSV.
    Nome do arquivo será: {SYMBOL}_options_exp-{YYYY-MM-DD}.csv
    Isso garante que arquivos novos substituam os antigos do mesmo vencimento.
    """
    if data_json is None or "data" not in data_json:
        return None, None
        
    rows = []
    max_iv = 0.0
    iv_total = 0
    iv_missing = 0
    
    # Se expiration_filter for definido, usa-o para filtrar e para nome do arquivo
    target_expiry_str = None
    if isinstance(data_json.get("meta"), dict) and "target_expiry" in data_json["meta"]:
        target_expiry_str = data_json["meta"]["target_expiry"]
    
    expiry_str_found = ""
    
    # Data de hoje para o nome do arquivo
    today = dt.date.today()
    today_str = today.strftime("%m-%d-%Y")

    def _normalize_iv_pct(val: float) -> float:
        try:
            v = float(val or 0.0)
        except Exception:
            return 0.0
        if v <= 0.0:
            return 0.0
        if v <= 2.0:
            return float(v * 100.0)
        if v > 500.0:
            return float(v / 100.0)
        return float(v)
    
    for item in data_json["data"]:
        # O parse_html_table retorna dicts planos, não aninhados em 'raw'
        # Mas vamos checar se é raw ou direto
        raw = item # Assumindo direto do parse_html_table
        
        # Extração e Tratamento de Valores
        try:
            strike = float(str(raw.get("strikePrice", 0)).replace(',',''))
        except: strike = 0
        
        try:
            last = float(str(raw.get("lastPrice", 0)).replace(',',''))
        except: last = 0
        
        # Volatility vem como string '15.50%' às vezes
        iv_total += 1
        iv_val = _parse_float(raw.get("volatility", None))
        if iv_val <= 0:
            iv_val = _parse_float(raw.get("impliedVolatility", None))
        if iv_val <= 0:
            iv_val = _parse_float(raw.get("implied_volatility", None))
        if iv_val <= 0:
            iv_val = _parse_float(raw.get("iv", None))
        iv_val = _normalize_iv_pct(iv_val)
        if iv_val <= 0:
            iv_missing += 1
        
        # Mantém controle do Max IV
        if iv_val > max_iv:
            max_iv = iv_val
            
        # Option Type
        # Barchart HTML muitas vezes não tem coluna explícita 'Type' na visualização 'merged' ou 'stacked'
        # Precisamos deduzir ou confiar que está lá.
        # Se não tiver, pode ser problemático.
        # Na view 'futuresOptionsView=merged', Calls e Puts estão na mesma linha?
        # Não, merged geralmente lista todos.
        # Vamos tentar pegar 'symbolType' se existir, ou 'type'.
        opt_type = raw.get("symbolType", "")
        if not opt_type:
            # Tenta inferir pelo nome do contrato se disponível, senão deixa vazio
            opt_type = "Call" if "Call" in str(raw) else "Put" # Simplificação perigosa
            # Melhor deixar vazio se não souber
            
        # Filtro de expiração se solicitado
        row_expiry = raw.get("expirationDate", "")
        if target_expiry_str and row_expiry != target_expiry_str:
            continue
            
        row = {
            "Strike": strike,
            "OptionType": opt_type, 
            "Open Int": str(raw.get("openInterest", 0)).replace(',',''),
            "Volume": str(raw.get("volume", 0)).replace(',',''),
            "Bid": str(raw.get("bid", 0)).replace(',',''),
            "Ask": str(raw.get("ask", 0)).replace(',',''),
            "Last": last,
            "IV": iv_val, 
            "Delta": raw.get("delta", 0),
            "Gamma": raw.get("gamma", 0),
            "Vega": raw.get("vega", 0),
            "Theta": raw.get("theta", 0),
            "Moneyness": raw.get("moneyness", 0),
            "Expiry": row_expiry 
        }
        rows.append(row)
        
        if not expiry_str_found and row["Expiry"]:
            expiry_str_found = row["Expiry"]

    if not rows:
        return None, None
        
    df = pd.DataFrame(rows)
    try:
        fallback_iv = float(fallback_iv_pct or 0.0)
    except Exception:
        fallback_iv = 0.0
    if iv_total > 0 and iv_missing == iv_total and fallback_iv > 0.0:
        df["IV"] = fallback_iv
        max_iv = float(max(max_iv, fallback_iv))
        iv_missing = 0
    elif fallback_iv > 0.0:
        try:
            iv_series_raw = pd.to_numeric(df["IV"], errors="coerce")
            iv_series = pd.Series(iv_series_raw, index=df.index, dtype="float64").fillna(0.0)
            df.loc[iv_series <= 0.0, "IV"] = fallback_iv
        except Exception:
            pass
    iv_repr = _compute_representative_iv(df, underlying_spot)
    if (iv_repr is None or float(iv_repr) <= 0.0) and max_iv > 0:
        iv_repr = float(max_iv)
    
    # Formata expiry para nome do arquivo (YYYY-MM-DD se possível)
    # Usa o target se tiver, senão o encontrado
    final_expiry_str = target_expiry_str if target_expiry_str else expiry_str_found
    
    file_expiry = "unknown"
    if final_expiry_str:
        try:
            # Tenta converter formatos comuns
            if "/" in final_expiry_str:
                dt_exp = dt.datetime.strptime(final_expiry_str, "%m/%d/%y")
                file_expiry = dt_exp.strftime("%Y-%m-%d")
            elif "-" in final_expiry_str:
                file_expiry = final_expiry_str
        except:
            file_expiry = final_expiry_str
            
    filename = f"{file_prefix_or_symbol}_options_exp-{file_expiry}.csv"
    path = os.path.join(output_dir, filename)
    
    # Salva
    df.to_csv(path, index=False)
    print(f"CSV Salvo/Atualizado: {path}")
    if iv_total > 0 and iv_missing == iv_total:
        print(f"AVISO: IV ausente/zerada em 100% das linhas para {file_prefix_or_symbol} exp {file_expiry}. A curva de IV usará fallback.")
    
    return iv_repr, file_expiry

def cleanup_debug_files():
    """Move arquivos de debug para a pasta Debug."""
    try:
        debug_dir = os.path.join(ROOT_DIR, "Debug")
        if not os.path.exists(debug_dir):
            os.makedirs(debug_dir)
            
        import glob
        import shutil
        
        # Padrões de arquivos de debug
        patterns = ["debug_*.html", "debug_*.png", "debug_*.txt"]
        
        for pattern in patterns:
            for file_path in glob.glob(os.path.join(ROOT_DIR, pattern)):
                try:
                    shutil.move(file_path, os.path.join(debug_dir, os.path.basename(file_path)))
                except Exception as e:
                    print(f"Erro ao mover {file_path}: {e}")
                    
        print("Arquivos de debug organizados na pasta 'Debug'.")
    except Exception as e:
        print(f"Erro na limpeza de debug: {e}")

# ============================================================
# MAIN
# ============================================================
def main():
    print("=== AUTO B3 SYSTEM - BARCHART DATA COLLECTOR ===")
    
    run_started_at = time.time()
    should_run_b3_system = False
    schedule_slot_iso = os.getenv("EDI_SCHEDULE_SLOT_ISO", "").strip()
    def _today_start_ts():
        now = dt.datetime.now()
        start = dt.datetime(now.year, now.month, now.day, 0, 0, 0)
        return start.timestamp()
    def _count_today_csv(dir_path: str) -> int:
        try:
            ts = _today_start_ts()
            n = 0
            if os.path.isdir(dir_path):
                for entry in os.scandir(dir_path):
                    if entry.is_file() and entry.name.lower().endswith(".csv"):
                        if entry.stat().st_mtime >= ts:
                            n += 1
            return n
        except Exception:
            return 0
    def _has_today_data() -> bool:
        try:
            d_count = _count_today_csv(CSV_DOLAR_DIR)
            i_count = _count_today_csv(CSV_INDICE_DIR)
            min_d = int(os.getenv("CSV_DOLAR_MIN_TODAY", "8"))
            min_i = int(os.getenv("CSV_INDICE_MIN_TODAY", "2"))
            return d_count >= min_d and i_count >= min_i
        except Exception:
            return False
    auto_force = os.getenv("AUTO_FORCE_COLLECT", "").strip().lower() == "true"
    skip_if_today = os.getenv("SKIP_IF_TODAY_PRESENT", "true").strip().lower() == "true"
    existing_env = load_env_auto(ENV_FILE)
    existing_env_local = load_env_auto(DEFAULT_ENV_FILE) if ENV_FILE != DEFAULT_ENV_FILE else {}
    existing_all = {**existing_env_local, **existing_env}
    last_slot_iso = str(existing_all.get("AUTO_BARCHART_LAST_SLOT_ISO") or "").strip()
    last_collected_at_utc = str(existing_all.get("AUTO_BARCHART_LAST_COLLECTED_AT_UTC") or "").strip()

    def _collected_recently(min_minutes: int) -> bool:
        try:
            raw = (last_collected_at_utc or "").strip()
            if not raw:
                return False
            raw = raw.replace("Z", "+00:00")
            last_dt = dt.datetime.fromisoformat(raw)
            if last_dt.tzinfo is None:
                return False
            now_utc = dt.datetime.now(dt.timezone.utc)
            delta = now_utc - last_dt.astimezone(dt.timezone.utc)
            return delta.total_seconds() >= 0 and delta.total_seconds() < float(min_minutes) * 60.0
        except Exception:
            return False

    should_skip_today = False
    if skip_if_today and (not auto_force) and _has_today_data():
        if schedule_slot_iso:
            should_skip_today = last_slot_iso == schedule_slot_iso
        else:
            min_refresh = int(os.getenv("AUTO_MIN_REFRESH_MINUTES", "30") or "30")
            should_skip_today = _collected_recently(min_refresh)

    if should_skip_today:
        print("Dados de hoje já presentes. Pulando coleta.")
        if (
            os.getenv("AUTO_START_B3_SYSTEM", "true").lower() == "true"
            and os.path.isdir(B3_SYSTEM_DIR)
            and os.path.isfile(os.path.join(B3_SYSTEM_DIR, "config.py"))
        ):
            try:
                env = dict(os.environ)
                env["AUTO_DATA_FETCH"] = "false"
                subprocess.run([sys.executable, os.path.join(B3_SYSTEM_DIR, "config.py")], cwd=B3_SYSTEM_DIR, env=env)
            except Exception:
                pass
        return

    # Limpeza inicial de debug e limpeza de CSVs antigos (após a coleta, manter apenas os mais novos)
    cleanup_debug_files()
    cleanup_expired_files(CSV_DOLAR_DIR)
    cleanup_expired_files(CSV_INDICE_DIR)
    
    driver = init_driver()
    if not driver:
        print("FALHA CRÍTICA: Não foi possível iniciar o driver do navegador.")
        try:
            import sys as _sys
            _sys.exit(2)
        except SystemExit:
            return

    try:
        existing_env = load_env_auto(ENV_FILE)
        existing_env_local = load_env_auto(DEFAULT_ENV_FILE) if ENV_FILE != DEFAULT_ENV_FILE else {}
        existing_all = {**existing_env_local, **existing_env}

        env_data: dict[str, Any] = {
            "WDO_SPOT": _to_float_or_none(existing_all.get("WDO_SPOT")) or 0.0,
            "WIN_SPOT": _to_float_or_none(existing_all.get("WIN_SPOT")) or 0.0,
            "WDO_IV_ANNUAL": _to_float_or_none(existing_all.get("WDO_IV_ANNUAL")) or 0.0,
            "WIN_SCALING_EWZ_REF_CLOSE": _to_float_or_none(existing_all.get("WIN_SCALING_EWZ_REF_CLOSE")) or 0.0,
            "WIN_SCALING_INDEX_REF_CLOSE": int(_to_float_or_none(existing_all.get("WIN_SCALING_INDEX_REF_CLOSE")) or 0.0),
            "WIN_EWZ_IV_RANK_PCT": _normalize_pct_value(existing_all.get("WIN_EWZ_IV_RANK_PCT")) or 0.0,
            "WIN_EWZ_ATM_IV_PCT": _normalize_pct_value(existing_all.get("WIN_EWZ_ATM_IV_PCT")) or 0.0,
            "WIN_EWZ_HV_PCT": _normalize_pct_value(existing_all.get("WIN_EWZ_HV_PCT")) or 0.0,
            "WIN_EWZ_IV_CONTEXT_SOURCE_URL": str(existing_all.get("WIN_EWZ_IV_CONTEXT_SOURCE_URL") or "").strip(),
            "WIN_EWZ_IV_CONTEXT_CAPTURED_AT_UTC": str(existing_all.get("WIN_EWZ_IV_CONTEXT_CAPTURED_AT_UTC") or "").strip(),
            "WIN_EWZ_IV_CONTEXT_METHOD": str(existing_all.get("WIN_EWZ_IV_CONTEXT_METHOD") or "").strip(),
        }
        env_data["AUTO_BARCHART_LAST_SLOT_ISO"] = schedule_slot_iso or ""
        env_data["AUTO_BARCHART_LAST_COLLECTED_AT_UTC"] = _utc_now_iso()
        env_data["US_FEDWATCH_CME_TOOL_URL"] = "https://www.cmegroup.com/pt/markets/interest-rates/cme-fedwatch-tool.html"

        # ------------------------------------------------------------------
        # 1. FECHAMENTOS (TRADINGVIEW)
        # ------------------------------------------------------------------
        print("\n[1/3] Coletando Fechamentos de Mercado...")
        
        # Dólar Futuro (DOL1!)
        wdo_close = fetch_tradingview_data(driver, "DOL1!")
        if wdo_close is not None:
            env_data["WDO_SPOT"] = wdo_close

        # Índice Futuro (IND1!) -> WIN_SCALING_INDEX_REF_CLOSE
        # Note: WIN_SPOT no config refere-se ao preço atual do EWZ para cálculo de moneyness em USD.
        # Armazenamos IND1! em variável separada para Scaling.
        win_close = fetch_tradingview_data(driver, "IND1!")
        if win_close is not None:
            env_data["WIN_SCALING_INDEX_REF_CLOSE"] = int(win_close)

        fed_monitor = fetch_fed_rate_monitor_investing()
        if fed_monitor:
            env_data["US_FED_RATE_MONITOR_SOURCE_URL"] = fed_monitor.get("source_url") or ""
            env_data["US_FED_RATE_MONITOR_CAPTURED_AT_UTC"] = fed_monitor.get("captured_at_utc") or ""
            env_data["US_FED_RATE_MONITOR_UPDATED_AT"] = fed_monitor.get("updated_at") or ""
            env_data["US_FED_RATE_MONITOR_NEXT_MEETING_AT"] = fed_monitor.get("next_meeting_at") or ""
            env_data["US_FED_RATE_MONITOR_NEXT_TARGET_RANGE"] = fed_monitor.get("next_top_target_range") or ""
            prob = fed_monitor.get("next_top_probability_pct")
            env_data["US_FED_RATE_MONITOR_NEXT_TARGET_PROB_PCT"] = (f"{float(prob):.1f}" if prob is not None else "")
            update_fed_rates_json_from_monitor(fed_monitor)

        # ------------------------------------------------------------------
        # 2. EWZ (ETF)
        # ------------------------------------------------------------------
        driver = restart_driver_if_needed(driver)
        if not driver:
            print("ERRO: Driver não disponível para EWZ.")
            return

        ewz = get_ewz_contract()
        print(f"\n[2/3] Processando {ewz['symbol']} (EWZ)...")
        ewz_ctx: dict[str, float] = {}
        ewz_ctx_method = ""
        ewz_ctx_source_url = f"https://www.barchart.com/etfs-funds/quotes/{ewz['symbol']}/overview"
        ewz_ctx_captured_at = ""
        
        # Tenta obter Spot Price
        try:
            driver.get(ewz_ctx_source_url)
            time.sleep(2)
            ewz_ctx_captured_at = _utc_now_iso()
            for _ in range(10):
                ewz_ctx, ewz_ctx_method = extract_barchart_iv_context(driver.page_source)
                if ewz_ctx:
                    break
                time.sleep(1)
            if not ewz_ctx or not ewz_ctx.get("iv_rank_pct") or not ewz_ctx.get("iv_atm_pct") or not ewz_ctx.get("hv_pct"):
                api_ctx, api_method, api_source = fetch_barchart_quote_iv_context(driver, ewz["symbol"], "etfs-funds")
                if api_ctx:
                    for k, v in api_ctx.items():
                        if k not in ewz_ctx or not ewz_ctx.get(k):
                            ewz_ctx[k] = v
                    if api_method:
                        ewz_ctx_method = api_method
                    if api_source:
                        ewz_ctx_source_url = api_source

            if ewz_ctx.get("iv_rank_pct"):
                env_data["WIN_EWZ_IV_RANK_PCT"] = round(_normalize_pct_value(ewz_ctx["iv_rank_pct"]), 2)
            if ewz_ctx.get("iv_atm_pct"):
                env_data["WIN_EWZ_ATM_IV_PCT"] = round(_normalize_pct_value(ewz_ctx["iv_atm_pct"]), 2)
            if ewz_ctx.get("hv_pct"):
                env_data["WIN_EWZ_HV_PCT"] = round(_normalize_pct_value(ewz_ctx["hv_pct"]), 2)
            env_data["WIN_EWZ_IV_CONTEXT_SOURCE_URL"] = ewz_ctx_source_url
            if ewz_ctx_captured_at:
                env_data["WIN_EWZ_IV_CONTEXT_CAPTURED_AT_UTC"] = ewz_ctx_captured_at
            if ewz_ctx_method:
                env_data["WIN_EWZ_IV_CONTEXT_METHOD"] = ewz_ctx_method

            quote_ewz = fetch_quote_data(driver, ewz["symbol"])
            
            spot_val = None
            if quote_ewz:
                spot_val = _to_float_or_none(quote_ewz.get("last"))
                print(f"EWZ Spot (Barchart): {spot_val}")
            else:
                spot_val = fetch_tradingview_data(driver, "EWZ")
                print(f"EWZ Spot (TradingView): {spot_val}")
            
            if spot_val is not None:
                env_data["WIN_SPOT"] = spot_val
                env_data["WIN_SCALING_EWZ_REF_CLOSE"] = spot_val
            
        except Exception as e:
            print(f"Erro ao obter Spot EWZ: {e}")
            driver = restart_driver_if_needed(driver)

        # Coleta Opções EWZ
        if driver:
            try:
                ewz_url = f"https://www.barchart.com/etfs-funds/quotes/{ewz['symbol']}/options?view=stacked&moneyness=allRows"
                try:
                    driver.get(ewz_url)
                    opt_ctx_captured_at = _utc_now_iso()
                    opt_ctx: dict[str, float] = {}
                    opt_ctx_method = ""
                    for _ in range(10):
                        opt_ctx, opt_ctx_method = extract_barchart_iv_context(driver.page_source)
                        if opt_ctx:
                            break
                        time.sleep(1)

                    if opt_ctx:
                        for k, v in opt_ctx.items():
                            if k not in ewz_ctx or not ewz_ctx.get(k):
                                ewz_ctx[k] = v
                        if opt_ctx_method:
                            ewz_ctx_method = opt_ctx_method

                        if ewz_ctx.get("iv_rank_pct"):
                            env_data["WIN_EWZ_IV_RANK_PCT"] = round(_normalize_pct_value(ewz_ctx["iv_rank_pct"]), 2)
                        if ewz_ctx.get("iv_atm_pct"):
                            env_data["WIN_EWZ_ATM_IV_PCT"] = round(_normalize_pct_value(ewz_ctx["iv_atm_pct"]), 2)
                        if ewz_ctx.get("hv_pct"):
                            env_data["WIN_EWZ_HV_PCT"] = round(_normalize_pct_value(ewz_ctx["hv_pct"]), 2)
                        env_data["WIN_EWZ_IV_CONTEXT_SOURCE_URL"] = ewz_url
                        if opt_ctx_captured_at:
                            env_data["WIN_EWZ_IV_CONTEXT_CAPTURED_AT_UTC"] = opt_ctx_captured_at
                        if ewz_ctx_method:
                            env_data["WIN_EWZ_IV_CONTEXT_METHOD"] = ewz_ctx_method
                except Exception as e:
                    print(f"AVISO: Falha ao capturar IV Rank/ATM/HV do EWZ: {e}")

                data_ewz = fetch_options_data(driver, ewz["symbol"], None, "etfs-funds", custom_url=ewz_url)
                
                if data_ewz:
                    # EWZ retorna todas as opções misturadas. 
                    # Vamos separar por vencimento para salvar os 4 primeiros (mais próximos).
                    
                    # 1. Agrupar por data de vencimento
                    expirations = {}
                    if "data" in data_ewz:
                        for item in data_ewz["data"]:
                            exp = item.get("expirationDate")
                            if not exp: continue
                            
                            if exp not in expirations:
                                expirations[exp] = []
                            expirations[exp].append(item)
                    
                    # 2. Ordenar datas
                    def parse_date(d_str):
                        try:
                            return dt.datetime.strptime(d_str, "%Y-%m-%d")
                        except:
                            try:
                                return dt.datetime.strptime(d_str, "%m/%d/%y")
                            except:
                                return dt.datetime.max
                                
                    sorted_exps = sorted(expirations.keys(), key=parse_date)
                    
                    # 3. Pegar TODOS os vencimentos e salvar
                    print(f"Encontrados {len(sorted_exps)} vencimentos para EWZ. Processando todos...")
                    try:
                        ewz_spot_for_iv = float(env_data.get("WIN_SPOT") or 0.0)
                    except Exception:
                        ewz_spot_for_iv = 0.0

                    if float(_to_float_or_none(env_data.get("WIN_EWZ_ATM_IV_PCT")) or 0.0) <= 0.0 and ewz_spot_for_iv > 0.0 and sorted_exps:
                        try:
                            exp0 = sorted_exps[0]
                            items0 = expirations.get(exp0) or []
                            iv_candidates: list[tuple[float, float]] = []
                            for it in items0:
                                strike_val = _parse_float(it.get("strikePrice", it.get("strike", 0.0)))
                                if strike_val <= 0.0:
                                    continue
                                iv_val = _parse_float(
                                    it.get(
                                        "volatility",
                                        it.get(
                                            "impliedVolatility",
                                            it.get("iv", it.get("implied_volatility", 0.0)),
                                        ),
                                    )
                                )
                                if iv_val <= 0.0:
                                    continue
                                if iv_val <= 2.0:
                                    iv_val = float(iv_val * 100.0)
                                elif iv_val > 500.0:
                                    iv_val = float(iv_val / 100.0)
                                dist = abs(strike_val - ewz_spot_for_iv) / ewz_spot_for_iv
                                iv_candidates.append((dist, float(iv_val)))
                            iv_candidates.sort(key=lambda x: x[0])
                            sel = [v for _, v in iv_candidates[:20] if v > 0.0]
                            if sel:
                                ewz_atm_iv_pct = float(pd.Series(sel).median())
                                env_data["WIN_EWZ_ATM_IV_PCT"] = round(ewz_atm_iv_pct, 2)
                                prev_method = str(env_data.get("WIN_EWZ_IV_CONTEXT_METHOD") or "").strip()
                                env_data["WIN_EWZ_IV_CONTEXT_METHOD"] = (
                                    f"{prev_method}+options_chain_atm_calc" if prev_method else "options_chain_atm_calc"
                                )
                        except Exception:
                            pass
                    try:
                        ewz_fallback_iv_pct = float(ewz_ctx.get("iv_atm_pct") or env_data.get("WIN_EWZ_ATM_IV_PCT") or 0.0)
                    except Exception:
                        ewz_fallback_iv_pct = 0.0
                    if ewz_fallback_iv_pct <= 0.0:
                        try:
                            ewz_fallback_iv_pct = float(ewz_ctx.get("hv_pct") or env_data.get("WIN_EWZ_HV_PCT") or 0.0)
                        except Exception:
                            ewz_fallback_iv_pct = 0.0
                    
                    for i, exp_date in enumerate(sorted_exps):
                        items = expirations[exp_date]
                        
                        # Cria estrutura compatível com process_and_save_csv
                        subset_data = {
                            "data": items,
                            "meta": {"target_expiry": exp_date}
                        }
                        
                        # Nome do arquivo: EWZ_options_exp-{date}.csv
                        # O process_and_save_csv usa o prefixo e o meta['target_expiry'] para montar o nome
                        # Vamos passar "EWZ" como prefixo
                        
                        process_and_save_csv(
                            subset_data,
                            ewz["symbol"],
                            CSV_INDICE_DIR,
                            "EWZ",
                            underlying_spot=float(env_data.get("WIN_SPOT") or 0.0),
                            fallback_iv_pct=ewz_fallback_iv_pct,
                        )
                        
                else:
                    print(f"ERRO: Falha ao obter opções de {ewz['symbol']}")
            except Exception as e:
                print(f"Erro ao obter opções de EWZ: {e}")
                driver = restart_driver_if_needed(driver)
        else:
             print("Driver não disponível. Pulando Opções EWZ.")

        if (
            not str(env_data.get("WIN_EWZ_IV_CONTEXT_METHOD") or "").strip()
            and (
                float(_to_float_or_none(env_data.get("WIN_EWZ_IV_RANK_PCT")) or 0.0) > 0.0
                or float(_to_float_or_none(env_data.get("WIN_EWZ_ATM_IV_PCT")) or 0.0) > 0.0
                or float(_to_float_or_none(env_data.get("WIN_EWZ_HV_PCT")) or 0.0) > 0.0
            )
        ):
            env_data["WIN_EWZ_IV_CONTEXT_METHOD"] = "env_cache"

        # ------------------------------------------------------------------
        # 3. WDO (FUTUROS)
        # ------------------------------------------------------------------
        print(f"\n[3/3] Processando Dólar Futuro (WDO)...")
        wdo_contracts = get_wdo_contracts()
        print(f"Encontrados {len(wdo_contracts)} contratos de WDO para verificar.")

        if wdo_contracts:
            driver = restart_driver_if_needed(driver)
            seed_symbol = wdo_contracts[0].get("symbol") or ""
            wdo_live = fetch_barchart_futures_last(driver, seed_symbol)
            discovered = discover_wdo_contract_symbols_from_page_source(getattr(driver, "page_source", "") or "", seed_symbol=seed_symbol)
            generated_syms = [str(c.get("symbol") or "").strip().upper() for c in (wdo_contracts or [])]
            generated_syms = [s for s in generated_syms if re.match(r"^XD[FGHJKMNQUVXZ]\d{2}$", s)]

            symbols = list(generated_syms)
            if discovered:
                disc = [str(s or "").strip().upper() for s in (discovered or [])]
                disc = [s for s in disc if re.match(r"^XD[FGHJKMNQUVXZ]\d{2}$", s)]
                if len(disc) >= max(6, len(symbols)):
                    symbols = list(disc)
                elif disc:
                    uniq: dict[str, bool] = {}
                    for s in (symbols + disc):
                        uniq[s] = True
                    symbols = sorted(list(uniq.keys()), key=_wdo_contract_sort_key)
                    if seed_symbol and seed_symbol in symbols:
                        symbols = [seed_symbol] + [x for x in symbols if x != seed_symbol]

            env_data["WDO_AVAILABLE_CONTRACTS"] = ",".join(symbols)
            env_data["WDO_AVAILABLE_CONTRACTS_CAPTURED_AT_UTC"] = _utc_now_iso()

            built: list[dict[str, str]] = []
            for i, sym in enumerate(symbols):
                m = re.search(r"^XD([FGHJKMNQUVXZ])(\d{2})$", str(sym or "").strip().upper())
                if m:
                    month_code = m.group(1)
                    y = int(m.group(2))
                    abbr = MONTH_ABBRS.get(month_code) or ""
                    url_suffix = f"{abbr}-{y:02d}" if abbr else ""
                else:
                    url_suffix = ""
                contract_type = "current" if i == 0 else "next" if i == 1 else f"next_{i}"
                built.append({"symbol": str(sym), "type": contract_type, "url_suffix": url_suffix})
            wdo_contracts = built

            first_symbol = wdo_contracts[0].get("symbol") or seed_symbol
            if first_symbol and str(first_symbol) != str(seed_symbol):
                wdo_live = fetch_barchart_futures_last(driver, first_symbol)
            if wdo_live is not None:
                env_data["WDO_SPOT"] = wdo_live
                print(f"WDO Spot (Barchart - Last): {wdo_live}")

            try:
                wdo_base_iv = float(env_data.get("WDO_IV_ANNUAL") or 0.0)
            except Exception:
                wdo_base_iv = 0.0
            if wdo_base_iv <= 0.0:
                wdo_ctx, wdo_ctx_method, wdo_ctx_url = fetch_barchart_quote_iv_context(
                    driver, first_symbol or "", asset_type="futures"
                )
                if wdo_ctx.get("iv_atm_pct"):
                    try:
                        env_data["WDO_IV_ANNUAL"] = round(float(wdo_ctx["iv_atm_pct"]) / 100.0, 4)
                        env_data["WDO_IV_CONTEXT_SOURCE_URL"] = wdo_ctx_url
                        env_data["WDO_IV_CONTEXT_CAPTURED_AT_UTC"] = _utc_now_iso()
                        if wdo_ctx_method:
                            env_data["WDO_IV_CONTEXT_METHOD"] = wdo_ctx_method
                    except Exception:
                        pass
            try:
                wdo_base_iv = float(env_data.get("WDO_IV_ANNUAL") or 0.0)
            except Exception:
                wdo_base_iv = 0.0
            if wdo_base_iv <= 0.0:
                env_data["WDO_IV_ANNUAL"] = 0.12
                if not str(env_data.get("WDO_IV_CONTEXT_METHOD") or "").strip():
                    env_data["WDO_IV_CONTEXT_METHOD"] = "default_static"
        
        wdo_iv_refs: list[float] = []
        
        for i, contract in enumerate(wdo_contracts):
            symbol = contract["symbol"]
            url_suffix = contract["url_suffix"]
            
            print(f"  -> Contrato {i+1}: {symbol} (URL Suffix: {url_suffix})")
            
            # Calcula expiração para preencher no CSV se a API não trouxer
            wdo_expiry = get_wdo_expiration(symbol)
            
            # Chama API Híbrida
            data_json = fetch_options_data(driver, symbol, wdo_expiry, "futures")
            
            if data_json:
                # Salva CSV
                # O nome do arquivo será: {SYMBOL}_options_exp-{date}.csv
                # Passamos o symbol (ex: XDJ26) como prefixo
                
                # Injeta target_expiry no meta para garantir nome correto do arquivo
                if wdo_expiry:
                     data_json["meta"]["target_expiry"] = wdo_expiry.strftime("%Y-%m-%d")

                try:
                    wdo_fallback_base = float(env_data.get("WDO_IV_ANNUAL") or 0.0)
                except Exception:
                    wdo_fallback_base = 0.0
                wdo_fallback_iv_pct = float(wdo_fallback_base * 100.0) if 0.0 < wdo_fallback_base <= 2.0 else float(wdo_fallback_base)
                iv_ref, _ = process_and_save_csv(
                    data_json,
                    symbol,
                    CSV_DOLAR_DIR,
                    symbol,
                    underlying_spot=float(env_data.get("WDO_SPOT") or 0.0),
                    fallback_iv_pct=wdo_fallback_iv_pct,
                )
                if iv_ref and float(iv_ref) > 0.0:
                    wdo_iv_refs.append(float(iv_ref))
            else:
                print(f"    Sem dados para {symbol}.")
                # Se falhar 3 seguidos, provavelmente não tem mais contratos liquidos
                # Mas vamos deixar tentar todos os 12 pois as vezes tem buracos

        wdo_iv_final = float(pd.Series(wdo_iv_refs).median()) if wdo_iv_refs else 0.0
        if wdo_iv_final > 1.0:
            wdo_iv_final = wdo_iv_final / 100.0
        env_data["WDO_IV_ANNUAL"] = round(wdo_iv_final, 4)

        # ------------------------------------------------------------------
        # FINALIZAÇÃO
        # ------------------------------------------------------------------
        print("\nGerando arquivo .env.auto...")
        with open(ENV_FILE, "w") as f:
            for key, value in env_data.items():
                if value is None:
                    continue
                if isinstance(value, (int, float)) and float(value) == 0.0:
                    continue
                v = str(value).strip()
                if v in {"", "0", "0.0", "0.00"}:
                    continue
                f.write(f"{key}={v}\n")

        if ENV_FILE != DEFAULT_ENV_FILE:
            try:
                with open(DEFAULT_ENV_FILE, "w") as f:
                    for key, value in env_data.items():
                        if value is None:
                            continue
                        if isinstance(value, (int, float)) and float(value) == 0.0:
                            continue
                        v = str(value).strip()
                        if v in {"", "0", "0.0", "0.00"}:
                            continue
                        f.write(f"{key}={v}\n")
            except Exception as e:
                print(f"AVISO: Falha ao espelhar .env.auto local: {e}")

        purge_csv_older_than(CSV_DOLAR_DIR, run_started_at)
        purge_csv_older_than(CSV_INDICE_DIR, run_started_at)
        
        print("Processo concluído com sucesso!")
        print("Valores capturados:")
        for k, v in env_data.items():
            print(f"  {k}: {v}")

        if (
            os.getenv("AUTO_START_B3_SYSTEM", "true").lower() == "true"
            and os.path.isdir(B3_SYSTEM_DIR)
            and os.path.isfile(os.path.join(B3_SYSTEM_DIR, "config.py"))
        ):
            should_run_b3_system = True

    except Exception as e:
        print(f"ERRO FATAL NA EXECUÇÃO: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if driver:
            print("Fechando navegador...")
            driver.quit()

    if should_run_b3_system:
        print("\n=== Iniciando Sistema de Cálculo (B3_System) ===")
        try:
            env = dict(os.environ)
            env["AUTO_DATA_FETCH"] = "false"
            res = subprocess.run([sys.executable, os.path.join(B3_SYSTEM_DIR, "config.py")], cwd=B3_SYSTEM_DIR, env=env)
            if res.returncode != 0:
                print(f"AVISO: B3_System retornou código {res.returncode}.")
        except Exception as e:
            print(f"AVISO: Falha ao iniciar B3_System: {e}")

if __name__ == "__main__":
    main()
