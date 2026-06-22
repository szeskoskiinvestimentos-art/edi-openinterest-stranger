import warnings

warnings.filterwarnings(
    "ignore",
    message=r".*urllib3 .* doesn't match a supported version.*",
    category=Warning,
)

import requests
import pandas as pd
import datetime as dt
import os
import re
import time
import random
import sys
import tempfile
import shutil
from io import StringIO
from typing import Any, Optional
from dateutil.relativedelta import relativedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import undetected_chromedriver as uc


# ============================================================
# STAGE PROGRESS + SAFE NAVIGATION (E96 - 2026-06-21)
# ============================================================
_STAGE_COUNTER = {"n": 0}
_STAGE_LOCK = threading.Lock()
_STEP_RESULTS: dict[str, str] = {}  # chave -> "ok"/"fail"/"skip"

PAYWALL_KEYWORDS = (
    "subscribe to continue",
    "create an account",
    "sign in to continue",
    "log in to continue",
    "please log in",
    "access denied",
    "captcha",
    "are you a human",
    "rate limit",
    "too many requests",
)


def stage(label: str) -> None:
    """Print [ETAPA X/6] with counter for visible progress in CMD."""
    with _STAGE_LOCK:
        _STAGE_COUNTER["n"] += 1
        n = _STAGE_COUNTER["n"]
    sys.stdout.write(f"\n[ETAPA {n}] {label}\n")
    sys.stdout.flush()


def step_ok(key: str, msg: str = "") -> None:
    _STEP_RESULTS[key] = "ok"
    suffix = f" - {msg}" if msg else ""
    sys.stdout.write(f"  ✅ {key}{suffix}\n")
    sys.stdout.flush()


def step_fail(key: str, msg: str = "") -> None:
    _STEP_RESULTS[key] = "fail"
    suffix = f" - {msg}" if msg else ""
    sys.stdout.write(f"  ❌ {key}{suffix}\n")
    sys.stdout.flush()


def step_skip(key: str, msg: str = "") -> None:
    _STEP_RESULTS[key] = "skip"
    suffix = f" - {msg}" if msg else ""
    sys.stdout.write(f"  ⏭️ {key}{suffix}\n")
    sys.stdout.flush()


def _is_paywall(driver) -> bool:
    """Detect paywall/login/captcha pages that block scraping."""
    try:
        src = (driver.page_source or "").lower()
        return any(kw in src for kw in PAYWALL_KEYWORDS)
    except Exception:
        return False


def safe_driver_get(driver, url: str, timeout: int = 20, label: str = "") -> bool:
    """driver.get() with hard timeout via thread + paywall detection.
    Returns True if page loaded successfully, False on timeout/paywall/error.
    """
    result: dict[str, Any] = {"done": False, "err": None}

    def _go() -> None:
        try:
            driver.set_page_load_timeout(timeout)
            driver.get(url)
            result["done"] = True
        except Exception as e:  # noqa: BLE001
            result["err"] = e

    t = threading.Thread(target=_go, daemon=True)
    t.start()
    t.join(timeout=timeout + 5)
    if not result["done"]:
        prefix = f"{label}: " if label else ""
        sys.stdout.write(f"  ⏱️  {prefix}timeout após {timeout}s em {url[:80]}\n")
        sys.stdout.flush()
        try:
            driver.execute_script("window.stop();")
        except Exception:
            pass
        return False
    if _is_paywall(driver):
        prefix = f"{label}: " if label else ""
        sys.stdout.write(f"  🚧 {prefix}paywall/login wall detectado em {url[:80]}\n")
        sys.stdout.flush()
        return False
    return True

import glob
import math

# ============================================================
# CONFIGURAÇÃO GERAL
# ============================================================
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_DOLAR_DIR = os.path.join(ROOT_DIR, "CSV_Dolar")
CSV_INDICE_DIR = os.path.join(ROOT_DIR, "CSV_Indice")
ENV_FILE = os.path.join(ROOT_DIR, ".env.auto") # Arquivo gerado

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
    now = dt.datetime.now()
    current_month = now.month
    current_year = now.year % 100 # 26
    
    contracts = []
    months_ahead_raw = os.getenv("WDO_CANDIDATE_CONTRACT_MONTHS", "").strip()
    if not months_ahead_raw:
        months_ahead_raw = os.getenv("WDO_EXPECTED_CONTRACT_MONTHS", "").strip()
    try:
        months_ahead = int(months_ahead_raw) if months_ahead_raw else 60
    except Exception:
        months_ahead = 60
    months_ahead = max(1, min(120, months_ahead))
    
    # Gera contratos para os próximos N meses
    # Contrato de Dólar vence no 1º dia útil do mês.
    # Negociação do mês M é feita no contrato do mês M+1 (letra).
    # Ex: Em Março (3), negocia-se Abril (J), Maio (K), Junho (M), Julho (N).
    
    start_month = current_month + 1
    start_year = current_year
    
    for i in range(months_ahead):
        m = start_month + i
        y = start_year
        
        # Ajuste de ano (rollover)
        while m > 12:
            m -= 12
            y += 1
            
        code = MONTH_NUM_TO_LETTER[m]
        abbr = MONTH_ABBRS[code]
        symbol = f"XD{code}{y}" # Ex: XDJ26
        url_suffix = f"{abbr}-{y}" # Ex: apr-26
        
        contract_type = "current" if i == 0 else "next" if i == 1 else f"next_{i}"
        contracts.append({"symbol": symbol, "type": contract_type, "url_suffix": url_suffix})
    
    return contracts

def get_ewz_contract():
    return {"symbol": "EWZ", "type": "etf"}

# ============================================================
# DRIVER SELENIUM
# ============================================================
def _safe_int(value):
    try:
        return int(value)
    except Exception:
        return None

def _detect_windows_browser_major_versions():
    try:
        import winreg
    except Exception:
        return {}

    keys = [
        (winreg.HKEY_CURRENT_USER, r"Software\Google\Chrome\BLBeacon", "chrome"),
        (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Google\Chrome\BLBeacon", "chrome"),
        (winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Edge\BLBeacon", "msedge"),
        (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Edge\BLBeacon", "msedge"),
    ]

    out = {}
    for hive, path, name in keys:
        try:
            with winreg.OpenKey(hive, path) as k:
                v, _t = winreg.QueryValueEx(k, "version")
                s = str(v or "").strip()
                major = _safe_int(s.split(".", 1)[0]) if s else None
                if major:
                    out[name] = major
        except Exception:
            continue
    return out

def _resolve_uc_version_main():
    raw = os.getenv("UC_VERSION_MAIN", "").strip()
    if raw:
        v = _safe_int(raw)
        if v:
            return v
    detected = _detect_windows_browser_major_versions()
    if detected.get("chrome"):
        return detected["chrome"]
    if detected.get("msedge"):
        return detected["msedge"]
    return None

def _print_python_http_stack_health_once():
    if os.getenv("AUTO_B3_HTTP_STACK_DIAG", "").strip().lower() == "false":
        return
    try:
        import warnings as _warnings
        _warnings.filterwarnings(
            "ignore",
            message=r"urllib3 .* doesn't match a supported version",
            category=Warning,
        )
        import requests as _rq
        import urllib3 as _u3
        try:
            import charset_normalizer as _cn
            cn_v = getattr(_cn, "__version__", None)
        except Exception:
            cn_v = None
        try:
            import chardet as _cd
            cd_v = getattr(_cd, "__version__", None)
        except Exception:
            cd_v = None
        print(f"HTTP Stack: requests={getattr(_rq,'__version__',None)} urllib3={getattr(_u3,'__version__',None)} charset_normalizer={cn_v} chardet={cd_v}")
        if cd_v and cd_v.startswith("7."):
            print("AVISO: chardet está em versão atípica. Recomendo reinstalar requests/urllib3/charset_normalizer/chardet em um venv para evitar falhas intermitentes.")
    except Exception:
        return

def _build_uc_options():
    options = uc.ChromeOptions()
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")

    profile_dir = tempfile.mkdtemp(prefix="edi_uc_profile_")
    options.add_argument(f"--user-data-dir={profile_dir}")

    options.page_load_strategy = 'eager'
    return options

def _build_chrome_options():
    options = webdriver.ChromeOptions()
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    profile_dir = tempfile.mkdtemp(prefix="edi_chrome_profile_")
    options.add_argument(f"--user-data-dir={profile_dir}")
    return options

def init_driver():
    """Inicia driver Chrome usando undetected-chromedriver para evitar bloqueios."""
    try:
        _print_python_http_stack_health_once()

        if os.getenv("AUTO_B3_UC_ENABLED", "true").strip().lower() in ("0", "false", "no", "off"):
            raise RuntimeError("UC Driver desabilitado por AUTO_B3_UC_ENABLED")

        options = _build_uc_options()
        vmain = _resolve_uc_version_main()
        if vmain:
            try:
                print(f"Iniciando UC Driver com version_main={vmain}...")
                driver = uc.Chrome(options=options, version_main=vmain)
            except Exception as e:
                print(f"Falha ao iniciar UC com version_main={vmain}: {e}")
                print("Tentando UC Driver em modo autodetect...")
                driver = uc.Chrome(options=options)
        else:
            print("UC Driver: não foi possível detectar versão do Chrome/Edge. Tentando autodetect...")
            driver = uc.Chrome(options=options)
            
        driver.set_page_load_timeout(60)
        driver.maximize_window() # Maximiza para garantir renderização de elementos responsivos
        return driver
    except Exception as e:
        print(f"Erro ao iniciar UC Driver: {e}")
        try:
            driver = webdriver.Chrome(options=_build_chrome_options())
            driver.set_page_load_timeout(60)
            driver.maximize_window()
            print("Driver alternativo iniciado (selenium).")
            return driver
        except Exception as e2:
            print(f"Erro ao iniciar driver alternativo: {e2}")
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

def _parse_percent_value(value: Any) -> Optional[float]:
    if value is None:
        return None
    s = str(value).strip()
    if not s:
        return None
    s = s.replace("\u00a0", " ")
    s = s.replace("%", "").strip()
    s = s.replace(".", "").replace(",", ".") if re.search(r"\d+\.\d+,\d+", s) else s.replace(",", ".")
    m = re.search(r"(-?\d+(?:\.\d+)?)", s)
    if not m:
        return None
    try:
        v = float(m.group(1))
        if not math.isfinite(v):
            return None
        return v
    except Exception:
        return None

def extract_barchart_implied_volatility_pct(text: Any) -> Optional[float]:
    if not text:
        return None
    t = str(text)
    patterns = [
        r"Implied\s+Volatility\s*:?\s*([0-9]+(?:[.,][0-9]+)?)\s*%?",
        r"Implied\s+Vol\s*:?\s*([0-9]+(?:[.,][0-9]+)?)\s*%?",
        r"\bIV\s*:?\s*([0-9]+(?:[.,][0-9]+)?)\s*%?",
    ]
    for pat in patterns:
        m = re.search(pat, t, flags=re.IGNORECASE)
        if not m:
            continue
        v = _parse_percent_value(m.group(1))
        if v is not None:
            return v
    return None

def _walk_json_for_first_number(obj: Any, key_hints: list[str], max_depth: int = 8) -> Optional[float]:
    if max_depth <= 0:
        return None
    if isinstance(obj, dict):
        for k, v in obj.items():
            ks = str(k).lower()
            if any(h in ks for h in key_hints):
                n = _parse_percent_value(v)
                if n is not None:
                    return n
        for v in obj.values():
            n = _walk_json_for_first_number(v, key_hints, max_depth=max_depth - 1)
            if n is not None:
                return n
        return None
    if isinstance(obj, list):
        for it in obj[:100]:
            n = _walk_json_for_first_number(it, key_hints, max_depth=max_depth - 1)
            if n is not None:
                return n
        return None
    return None

def fetch_barchart_futures_contract_iv_pct_via_api(driver, symbol: str) -> Optional[float]:
    csrf_token, cookies = get_barchart_tokens(driver)
    if not csrf_token or not cookies:
        return None
    api_url = "https://www.barchart.com/proxies/core-api/v1/quotes/get"
    candidates = [
        {"list": "futures.quote", "fields": "impliedVolatility,iv,volatility,shortName,lastPrice"},
        {"list": "futures.quotes", "fields": "impliedVolatility,iv,volatility,shortName,lastPrice"},
        {"list": "futures", "fields": "impliedVolatility,iv,volatility,shortName,lastPrice"},
        {"list": "futures.options", "fields": "impliedVolatility,iv,volatility,shortName,lastPrice"},
    ]
    headers = {
        "User-Agent": driver.execute_script("return navigator.userAgent;"),
        "Referer": f"https://www.barchart.com/futures/quotes/{symbol}/volatility",
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json, text/plain, */*",
        "X-CSRF-TOKEN": csrf_token,
    }
    hints = ["impliedvolatility", "implied_volatility", "iv", "volatility"]
    for c in candidates:
        try:
            params = {
                "symbol": symbol,
                "raw": "1",
                "meta": "field.shortName,field.description,field.type,lists.lastUpdate",
            }
            params.update(c)
            resp = requests.get(api_url, params=params, cookies=cookies, headers=headers, timeout=25)
            if resp.status_code != 200:
                continue
            body = resp.json()
            val = _walk_json_for_first_number(body, hints, max_depth=10)
            if val is None:
                continue
            if 0 < val <= 1:
                val = val * 100.0
            if val > 0:
                print(f"{symbol} Implied Volatility (Barchart/API): {val}% (list={c.get('list')})")
                return val
        except Exception:
            continue
    return None

def fetch_barchart_futures_contract_iv_pct(driver, symbol: str) -> Optional[float]:
    try:
        api_iv = fetch_barchart_futures_contract_iv_pct_via_api(driver, symbol)
        if api_iv is not None and api_iv > 0:
            return api_iv
    except Exception:
        pass

    urls = [
        f"https://www.barchart.com/futures/quotes/{symbol}/volatility",
        f"https://www.barchart.com/futures/quotes/{symbol}/overview",
        f"https://www.barchart.com/futures/quotes/{symbol}",
        f"https://www.barchart.com/futures/quotes/{symbol}/options",
    ]

    for url in urls:
        try:
            driver = restart_driver_if_needed(driver)
            if not driver:
                return None

            driver.get(url)
            time.sleep(2)

            try:
                WebDriverWait(driver, 10).until(
                    lambda d: "Implied Volatility" in (d.page_source or "")
                )
            except Exception:
                pass

            texts: list[str] = []
            try:
                els = driver.find_elements(By.XPATH, "//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'implied volatility')]")
                for el in els[:15]:
                    try:
                        tx = el.text
                        if tx:
                            texts.append(tx)
                    except Exception:
                        continue
            except Exception:
                pass

            haystack = "\n".join(texts) if texts else (driver.page_source or "")
            iv_pct = extract_barchart_implied_volatility_pct(haystack)
            if iv_pct is not None and iv_pct > 0:
                print(f"{symbol} Implied Volatility (Barchart): {iv_pct}% ({url})")
                return iv_pct
        except Exception:
            continue

    try:
        save_debug_info(driver, symbol)
    except Exception:
        pass
    return None

def fetch_tradingview_data(driver, symbol):
    """
    Busca dados de fechamento no TradingView (DOL1! e IND1!).
    Retorna o valor do último fechamento.
    """
    def fetch_tradingview_last_from_scan(scan_ticker):
        try:
            url = "https://scanner.tradingview.com/global/scan"
            payload = {
                "symbols": {"tickers": [scan_ticker], "query": {"types": []}},
                "columns": ["close"],
            }
            resp = requests.post(url, json=payload, timeout=20)
            if resp.status_code != 200:
                return None

            body = resp.json()
            data = body.get("data") or []
            if not data:
                return None

            d = data[0].get("d") or []
            if not d:
                return None

            val = d[0]
            if val is None:
                return None

            price = float(val)
            if not math.isfinite(price):
                return None
            return price
        except Exception:
            return None

    # Ajusta símbolo para URL do TradingView Brasil
    tv_symbol = symbol
    scan_ticker = None
    if "DOL1!" in symbol:
        tv_symbol = "BMFBOVESPA-DOL1!"
        scan_ticker = "BMFBOVESPA:DOL1!"
    elif "IND1!" in symbol:
        tv_symbol = "BMFBOVESPA-IND1!"
        scan_ticker = "BMFBOVESPA:IND1!"

    if scan_ticker:
        price = fetch_tradingview_last_from_scan(scan_ticker)
        if price:
            print(f"{symbol} (TradingView/Scan): {price}")
            return price
        
    url = f"https://br.tradingview.com/symbols/{tv_symbol}/"
    print(f"Acessando TradingView: {symbol} ({url})...")
    
    try:
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
                txt = el.text.strip().replace('.', '').replace(',', '.') # TV BR usa vírgula decimal
                if txt:
                    price = float(txt)
                    break
            except:
                continue
                
        if price:
            print(f"{symbol} (TradingView): {price}")
            return price
        else:
            print(f"Preço não encontrado no TradingView para {symbol}")
            # save_debug_info(driver, f"TV_{symbol}")
            return 0.0
            
    except Exception as e:
        print(f"Erro no TradingView {symbol}: {e}")
        return 0.0

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
            return {
                "ok": False,
                "source_url": url,
                "captured_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
                "http_status": int(resp.status_code),
                "error": f"http_{resp.status_code}",
            }
        html = resp.text
    except Exception as e:
        print(f"Fed Rate Monitor (Investing): erro ao baixar HTML: {e}")
        return {
            "ok": False,
            "source_url": url,
            "captured_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
            "http_status": "",
            "error": str(e),
        }

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
                "top_target_range": (top["target_range"] if top else None),
                "top_probability_pct": (top["probability_pct"] if top else None),
            }
        )

    if not meetings:
        print("Fed Rate Monitor (Investing): nenhuma reunião encontrada no HTML.")
        return {
            "ok": False,
            "source_url": url,
            "captured_at_utc": dt.datetime.utcnow().isoformat(timespec="seconds") + "Z",
            "http_status": 200,
            "error": "empty_html",
        }

    next_meeting = meetings[0]
    return {
        "ok": True,
        "source_url": url,
        "captured_at_utc": dt.datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "updated_at": updated_at,
        "next_meeting_at": next_meeting.get("meeting_at"),
        "next_top_target_range": next_meeting.get("top_target_range"),
        "next_top_probability_pct": next_meeting.get("top_probability_pct"),
        "meetings": meetings,
    }

import json
_barchart_token_cache = {"csrf_token": None, "cookies": None, "timestamp": 0.0}

def get_barchart_tokens(driver):
    """Extrai CSRF Token e Cookies do driver Selenium. Cacheia por 30 minutos."""
    cache_ttl = 1800
    now = time.time()
    if (_barchart_token_cache["csrf_token"]
            and _barchart_token_cache["cookies"]
            and (now - _barchart_token_cache["timestamp"]) < cache_ttl):
        print("Tokens Barchart: usando cache valido.")
        return _barchart_token_cache["csrf_token"], _barchart_token_cache["cookies"]

    try:
        if "barchart.com" not in driver.current_url:
            print("Acessando Barchart para obter tokens...")
            try:
                driver.get("https://www.barchart.com/")
                time.sleep(5)
                driver.execute_script("window.scrollTo(0, 500);")
                time.sleep(2)
            except Exception:
                print("Timeout ou erro ao carregar pagina inicial. Tentando continuar...")
                driver.execute_script("window.stop();")
            
        csrf_token = driver.find_element(By.XPATH, "//meta[@name='csrf-token']").get_attribute("content")
        
        selenium_cookies = driver.get_cookies()
        session_cookies = {c['name']: c['value'] for c in selenium_cookies}

        _barchart_token_cache["csrf_token"] = csrf_token
        _barchart_token_cache["cookies"] = session_cookies
        _barchart_token_cache["timestamp"] = now
        
        return csrf_token, session_cookies
    except Exception as e:
        print(f"Erro ao extrair tokens: {e}")
        return None, None

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
            "fields": "strike,lastPrice,volume,openInterest,optionType,symbol,expirationDate,impliedVolatility",
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
            "fields": "symbol,strikePrice,lastPrice,openInterest,volume,impliedVolatility,expirationDate,type",
            "orderBy": "strikePrice",
            "orderDir": "asc",
            "meta": "field.shortName,field.type,field.description",
            "hasOptions": "true",
            "page": "1",
            "limit": "200",
            "raw": "1"
        }
        if expiration_date:
            exp_str = expiration_date.strftime("%Y-%m-%d") if hasattr(expiration_date, "strftime") else str(expiration_date)
            params["expirationDate"] = exp_str
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
    max_pages = 80
    
    while page <= max_pages:
        if asset_type != 'futures':
            print(f"Baixando página {page} da API...")
            params['page'] = str(page)
            
        response = None
        try:
            response = requests.get(api_url, params=params, cookies=cookies, headers=headers)
            
            if response.status_code != 200:
                print(f"Erro na API: Status {response.status_code}")
                if response.status_code == 429:
                    raise Exception("Status 429 Too Many Requests")
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
                total = data.get('total', None)
                if isinstance(total, (int, float)) and total and total > 0:
                    total_i = int(total)
                    print(f"Recebidos {len(items)} itens. Total acumulado: {len(all_data)}/{total_i}")
                    if len(all_data) >= total_i:
                        break
                else:
                    print(f"Recebidos {len(items)} itens. Total acumulado: {len(all_data)}")
                page += 1
                # Aumentando delay para evitar erro 429 (Too Many Requests)
                # Delay maior e variável
                delay = random.uniform(8.0, 15.0)
                print(f"Aguardando {delay:.1f}s...")
                time.sleep(delay)
                
        except Exception as e:
            print(f"Erro no request da API: {e}")
            is_429 = False
            
            if response and response.status_code == 429:
                is_429 = True
            
            if is_429:
                 print("Erro 429 (Too Many Requests). Aguardando 60s antes de tentar novamente a página...")
                 time.sleep(60)
                 continue # Tenta a mesma página novamente (page não foi incrementado)
            
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
    df['IV'] = df.apply(lambda x: get_val(x, 'impliedVolatility'), axis=1)
    
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
            s = str(val).replace('%', '').strip()
            if s.upper() == 'N/A' or s == '': return 0.0
            try:
                return float(s)
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

def _parse_expiry_from_filename(basename: str):
    try:
        m = re.search(r"_options_exp-(\d{4}-\d{2}-\d{2})", basename)
        if not m:
            return None
        return dt.datetime.strptime(m.group(1), "%Y-%m-%d").date()
    except Exception:
        return None

def _parse_prefix_from_filename(basename: str):
    try:
        if "_options_" not in basename:
            return None
        return basename.split("_options_", 1)[0]
    except Exception:
        return None

def cleanup_invalid_or_stale_files(directory, allowed_prefixes=None):
    try:
        files = glob.glob(os.path.join(directory, "*_options_exp-*.csv"))
        removed = 0
        for f in files:
            try:
                basename = os.path.basename(f)
                if "_intraday-" in basename:
                    os.remove(f)
                    removed += 1
                    continue
                prefix = _parse_prefix_from_filename(basename)
                exp = _parse_expiry_from_filename(basename)
                if exp is None:
                    os.remove(f)
                    removed += 1
                    continue
                if prefix and prefix.lower().startswith("wdo_"):
                    os.remove(f)
                    removed += 1
                    continue
                if allowed_prefixes is not None and prefix and prefix not in allowed_prefixes:
                    os.remove(f)
                    removed += 1
                    continue
            except Exception:
                continue
        if removed:
            print(f"Limpeza concluída: {removed} arquivos inválidos/stale removidos de {directory}.")
    except Exception as e:
        print(f"Erro na limpeza de arquivos inválidos/stale em {directory}: {e}")

def delete_symbol_csvs(output_dir: str, symbol: str):
    try:
        patt = os.path.join(output_dir, f"{symbol}_options_exp-*.csv")
        matches = glob.glob(patt)
        for f in matches:
            try:
                os.remove(f)
            except Exception:
                continue
    except Exception:
        return

def delete_symbol_expiry_csv(output_dir: str, symbol: str, expiry_iso: str):
    try:
        fn = os.path.join(output_dir, f"{symbol}_options_exp-{expiry_iso}.csv")
        if os.path.exists(fn):
            try:
                os.remove(fn)
            except Exception:
                pass
    except Exception:
        return

def list_option_expirations_from_dom(driver):
    try:
        time.sleep(2)
        selects = driver.find_elements(By.TAG_NAME, "select")
        best = None
        best_count = 0
        for sel in selects:
            try:
                opts = sel.find_elements(By.TAG_NAME, "option")
                hits = 0
                for o in opts:
                    t = (o.get_attribute("value") or "") + " " + (o.text or "")
                    if re.search(r"20\d{2}-\d{2}-\d{2}", t):
                        hits += 1
                if hits > best_count:
                    best_count = hits
                    best = sel
            except Exception:
                continue
        if not best or best_count == 0:
            return []
        opts = best.find_elements(By.TAG_NAME, "option")
        out = []
        for o in opts:
            val = o.get_attribute("value") or ""
            txt = o.text or ""
            raw = (val + " " + txt).strip()
            m = re.search(r"(20\d{2}-\d{2}-\d{2})", raw)
            if not m:
                continue
            iso = m.group(1)
            kind = None
            if "(w)" in txt.lower():
                kind = "w"
            if "(m)" in txt.lower():
                kind = "m"
            out.append({"iso": iso, "kind": kind, "label": txt.strip()})
        uniq = {}
        for it in out:
            k = it.get("iso")
            if not k:
                continue
            if k not in uniq:
                uniq[k] = it
        arr = list(uniq.values())
        arr.sort(key=lambda x: x.get("iso") or "")
        return arr
    except Exception:
        return []

def _parse_iso_date(s: str):
    try:
        return dt.datetime.strptime(s, "%Y-%m-%d").date()
    except Exception:
        return None

def _months_ahead(today: dt.date, d: dt.date):
    try:
        return (d.year - today.year) * 12 + (d.month - today.month)
    except Exception:
        return None

def _years_ahead(today: dt.date, d: dt.date):
    try:
        return d.year - today.year
    except Exception:
        return None

def select_ewz_expirations(expirations, policy: str):
    today = dt.date.today()
    policy = (policy or "all").strip().lower()
    if policy in ("all", "todos", "full"):
        return [x["iso"] for x in expirations if x.get("iso")]

    if policy not in ("curve", "curva"):
        return [x["iso"] for x in expirations if x.get("iso")]

    def _int_env(name: str, default: int):
        try:
            raw = os.getenv(name, "").strip()
            return int(raw) if raw else default
        except Exception:
            return default

    weekly_days = _int_env("EWZ_CURVE_WEEKLY_DAYS", 56)
    monthly_months = _int_env("EWZ_CURVE_MONTHLY_MONTHS", 12)
    annual_years = _int_env("EWZ_CURVE_ANNUAL_YEARS", 5)

    selected = []
    for it in expirations:
        iso = it.get("iso")
        if not iso:
            continue
        d = _parse_iso_date(iso)
        if not d:
            continue
        if d < today:
            continue
        kind = it.get("kind")
        days = (d - today).days
        mon = _months_ahead(today, d)
        yrs = _years_ahead(today, d)

        if kind == "w":
            if weekly_days <= 0 or days <= weekly_days:
                selected.append(iso)
            continue
        if kind == "m":
            if mon is not None and (monthly_months <= 0 or mon <= monthly_months):
                selected.append(iso)
            continue

        if yrs is not None and (annual_years <= 0 or yrs <= annual_years):
            selected.append(iso)

    return selected

def collect_ewz_by_expiration(driver, max_expirations=None, max_days_ahead=None):
    ewz = get_ewz_contract()
    ewz_url = f"https://www.barchart.com/etfs-funds/quotes/{ewz['symbol']}/options?view=stacked&moneyness=allRows"
    driver.get(ewz_url)
    time.sleep(3)

    expirations = list_option_expirations_from_dom(driver)
    if not expirations:
        return 0

    policy = os.getenv("EWZ_DEPTH_POLICY", "").strip() or "all"
    selected = select_ewz_expirations(expirations, policy)
    print(f"EWZ vencimentos: encontrados={len(expirations)} selecionados={len(selected)} policy={policy}")

    today = dt.date.today()
    if max_days_ahead is None:
        try:
            max_days_ahead = int(os.getenv("EWZ_MAX_DAYS_AHEAD", "").strip() or "0")
        except Exception:
            max_days_ahead = 0
    if max_days_ahead and max_days_ahead > 0:
        filtered = []
        for iso in selected:
            d = _parse_iso_date(iso)
            if not d:
                continue
            if d < today:
                continue
            if (d - today).days <= max_days_ahead:
                filtered.append(iso)
        selected = filtered

    if max_expirations is None:
        try:
            max_expirations = int(os.getenv("EWZ_MAX_EXPIRATIONS", "").strip() or "0")
        except Exception:
            max_expirations = 0
    if max_expirations and max_expirations > 0:
        selected = selected[:max_expirations]

    saved = 0
    for iso in selected:
        data_ewz = fetch_options_data(driver, ewz["symbol"], iso, "etf", custom_url=ewz_url)
        if data_ewz:
            if isinstance(data_ewz.get("meta"), dict):
                data_ewz["meta"]["target_expiry"] = iso
            process_and_save_csv(data_ewz, ewz["symbol"], CSV_INDICE_DIR, "EWZ")
            saved += 1
        else:
            delete_symbol_expiry_csv(CSV_INDICE_DIR, "EWZ", iso)
        time.sleep(random.uniform(1.0, 2.5))
    return saved

def process_and_save_csv(data_json, symbol, output_dir, file_prefix_or_symbol):
    """
    Processa dados e salva CSV.
    Nome do arquivo será: {SYMBOL}_options_exp-{YYYY-MM-DD}.csv
    Isso garante que arquivos novos substituam os antigos do mesmo vencimento.
    """
    if data_json is None or "data" not in data_json:
        return None, None, False
        
    rows = []
    max_iv = 0.0
    
    # Se expiration_filter for definido, usa-o para filtrar e para nome do arquivo
    target_expiry_str = None
    if isinstance(data_json.get("meta"), dict) and "target_expiry" in data_json["meta"]:
        target_expiry_str = data_json["meta"]["target_expiry"]
    
    expiry_str_found = ""
    
    # Data de hoje para o nome do arquivo
    today = dt.date.today()
    today_str = today.strftime("%m-%d-%Y")
    
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
        iv_raw = str(raw.get("volatility", "0")).replace('%','').strip()
        try:
            iv_val = float(iv_raw) if iv_raw and iv_raw != '-' else 0.0
        except: iv_val = 0.0
        
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
        return None, None, False
        
    df = pd.DataFrame(rows)
    has_trades = True
    
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
    
    return max_iv, file_expiry, has_trades

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

def cleanup_old_temp_profiles():
    """Remove perfis temporarios do Chrome/UC com mais de 24 horas."""
    try:
        temp_dir = tempfile.gettempdir()
        now = time.time()
        max_age = 86400
        cleaned = 0
        for pattern in ("edi_uc_profile_*", "edi_chrome_profile_*"):
            for d in glob.glob(os.path.join(temp_dir, pattern)):
                try:
                    if os.path.isdir(d) and (now - os.path.getmtime(d)) > max_age:
                        shutil.rmtree(d, ignore_errors=True)
                        cleaned += 1
                except Exception:
                    continue
        if cleaned > 0:
            print(f"Limpeza de perfis temporarios: {cleaned} perfis antigos removidos.")
    except Exception as e:
        print(f"Aviso: falha na limpeza de perfis temporarios: {e}")

# ============================================================
# MAIN
# ============================================================
def main():
    print("=== AUTO B3 SYSTEM - BARCHART DATA COLLECTOR ===")

    cleanup_old_temp_profiles()
    cleanup_debug_files()
    cleanup_expired_files(CSV_DOLAR_DIR)
    cleanup_expired_files(CSV_INDICE_DIR)
    cleanup_invalid_or_stale_files(CSV_DOLAR_DIR)
    cleanup_invalid_or_stale_files(CSV_INDICE_DIR)
    
    driver = init_driver()
    if not driver:
        print("FALHA CRÍTICA: Não foi possível iniciar o driver do navegador.")
        return

    try:
        env_data: dict[str, Any] = {
            "WDO_SPOT": 0.0,
            "WIN_SPOT": 0.0,      # EWZ Spot (usado como referência para opções)
            "WDO_IV_ANNUAL": 0.0,
            "WIN_SCALING_EWZ_REF_CLOSE": 0.0,
            "WIN_SCALING_INDEX_REF_CLOSE": 0.0 # Índice Spot (IND1!)
        }
        env_data["AUTO_BARCHART_LAST_SLOT_ISO"] = dt.datetime.now().replace(microsecond=0).isoformat()
        env_data["AUTO_BARCHART_LAST_COLLECTED_AT_UTC"] = dt.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
        env_data["US_FEDWATCH_CME_TOOL_URL"] = "https://www.cmegroup.com/pt/markets/interest-rates/cme-fedwatch-tool.html"

        # ------------------------------------------------------------------
        # 1. FECHAMENTOS (TRADINGVIEW)
        # ------------------------------------------------------------------
        stage("TradingView fechamentos (DOL1!, IND1!) + Fed Rate Monitor")

        wdo_close = None
        try:
            wdo_close = fetch_tradingview_data(driver, "DOL1!")
            if wdo_close:
                if not (3000 <= wdo_close <= 10000):
                    print(f"AVISO: WDO_SPOT={wdo_close} fora do range esperado (3000-10000 USD/BRL)")
                env_data["WDO_SPOT"] = wdo_close
                step_ok("tv_dol1", f"{wdo_close}")
            else:
                step_fail("tv_dol1", "sem dados")
        except Exception as e:
            step_fail("tv_dol1", str(e)[:60])

        win_close = None
        try:
            win_close = fetch_tradingview_data(driver, "IND1!")
            if win_close:
                if not (50000 <= win_close <= 300000):
                    print(f"AVISO: IND1!={win_close} fora do range esperado (50000-300000 Ibovespa)")
                env_data["WIN_SCALING_INDEX_REF_CLOSE"] = int(win_close)
                step_ok("tv_ind1", f"{win_close}")
            else:
                step_fail("tv_ind1", "sem dados")
        except Exception as e:
            step_fail("tv_ind1", str(e)[:60])

        try:
            fed_monitor = fetch_fed_rate_monitor_investing()
            ok = bool(fed_monitor and fed_monitor.get("ok") is True)
            env_data["US_FED_RATE_MONITOR_OK"] = "true" if ok else "false"
            status = "ok" if ok else "fail"
            if fed_monitor and str(fed_monitor.get("http_status") or "") == "403":
                status = "blocked"
                print("AVISO: Fed Rate Monitor bloqueado (HTTP 403).")
            env_data["US_FED_RATE_MONITOR_STATUS"] = status
            if fed_monitor:
                env_data["US_FED_RATE_MONITOR_SOURCE_URL"] = fed_monitor.get("source_url") or ""
                env_data["US_FED_RATE_MONITOR_CAPTURED_AT_UTC"] = fed_monitor.get("captured_at_utc") or ""
                env_data["US_FED_RATE_MONITOR_HTTP_STATUS"] = fed_monitor.get("http_status") or ""
                env_data["US_FED_RATE_MONITOR_ERROR"] = ("" if ok else (fed_monitor.get("error") or "unavailable"))
            if ok:
                env_data["US_FED_RATE_MONITOR_UPDATED_AT"] = fed_monitor.get("updated_at") or ""
                env_data["US_FED_RATE_MONITOR_NEXT_MEETING_AT"] = fed_monitor.get("next_meeting_at") or ""
                env_data["US_FED_RATE_MONITOR_NEXT_TARGET_RANGE"] = fed_monitor.get("next_top_target_range") or ""
                prob = fed_monitor.get("next_top_probability_pct")
                env_data["US_FED_RATE_MONITOR_NEXT_TARGET_PROB_PCT"] = (f"{float(prob):.1f}" if prob is not None else "")
            step_ok("fed_monitor", status) if ok else step_fail("fed_monitor", status)
        except Exception as e:
            step_fail("fed_monitor", str(e)[:60])

        # ------------------------------------------------------------------
        # 2. EWZ (ETF)
        # ------------------------------------------------------------------
        stage(f"Barchart EWZ (Barchart/TradingView fallback)")

        driver = restart_driver_if_needed(driver)
        if not driver:
            step_fail("ewz_driver", "não disponível")
            return

        ewz = get_ewz_contract()

        try:
            ok = safe_driver_get(
                driver,
                f"https://www.barchart.com/etfs-funds/quotes/{ewz['symbol']}/overview",
                timeout=20,
                label=f"ewz_overview({ewz['symbol']})",
            )
            if ok:
                time.sleep(2)
                quote_ewz = fetch_quote_data(driver, ewz["symbol"])
                spot_val = 0.0
                if quote_ewz:
                    spot_val = quote_ewz["last"]
                    print(f"EWZ Spot (Barchart): {spot_val}")
                else:
                    spot_val = fetch_tradingview_data(driver, "EWZ") or 0.0
                    print(f"EWZ Spot (TradingView fallback): {spot_val}")
                env_data["WIN_SPOT"] = spot_val
                env_data["WIN_SCALING_EWZ_REF_CLOSE"] = spot_val
                step_ok("ewz_spot", f"{spot_val}")
            else:
                # Fallback total: TradingView
                spot_val = fetch_tradingview_data(driver, "EWZ") or 0.0
                env_data["WIN_SPOT"] = spot_val
                env_data["WIN_SCALING_EWZ_REF_CLOSE"] = spot_val
                step_fail("ewz_spot_barchart", "paywall/timeout → fallback TV")
                step_ok("ewz_spot_tv_fallback", f"{spot_val}")
        except Exception as e:
            step_fail("ewz_spot", str(e)[:60])
            driver = restart_driver_if_needed(driver)

        if driver:
            try:
                max_exp = None
                try:
                    raw = os.getenv("EWZ_MAX_EXPIRATIONS", "").strip()
                    max_exp = int(raw) if raw else None
                except Exception:
                    max_exp = None
                saved = collect_ewz_by_expiration(driver, max_expirations=max_exp)
                if saved > 0:
                    step_ok("ewz_options", f"{saved} CSVs")
                else:
                    step_fail("ewz_options", "0 CSVs salvos")
            except Exception as e:
                step_fail("ewz_options", str(e)[:60])
                driver = restart_driver_if_needed(driver)
        else:
            step_skip("ewz_options", "driver indisponível")

        # ------------------------------------------------------------------
        # 3. WDO (FUTUROS) - PARALLEL BATCH
        # ------------------------------------------------------------------
        stage("Barchart WDO contratos (batch paralelo)")

        wdo_contracts = get_wdo_contracts()
        print(f"  Encontrados {len(wdo_contracts)} contratos WDO. Processando em paralelo (max_workers=3)...")

        max_iv_wdo = 0.0
        active_wdo_symbols: list[str] = []
        candidate_prefixes = {c.get("symbol") for c in wdo_contracts if c.get("symbol")}

        def _process_wdo_contract(contract: dict) -> tuple[str, bool, float, bool]:
            symbol = contract["symbol"]
            url_suffix = contract["url_suffix"]
            print(f"  -> [start] {symbol} (URL Suffix: {url_suffix})")
            try:
                wdo_expiry = get_wdo_expiration(symbol)
                data_json = fetch_options_data(driver, symbol, wdo_expiry, "futures")
                if data_json:
                    if wdo_expiry:
                        data_json["meta"]["target_expiry"] = wdo_expiry.strftime("%Y-%m-%d")
                    iv, _, has_trades = process_and_save_csv(data_json, symbol, CSV_DOLAR_DIR, symbol)
                    print(f"  ✅ [done] {symbol} iv={iv} has_trades={has_trades}")
                    return symbol, True, iv or 0.0, has_trades
                else:
                    print(f"  ❌ [done] {symbol} sem dados")
                    delete_symbol_csvs(CSV_DOLAR_DIR, symbol)
                    return symbol, False, 0.0, False
            except Exception as e:
                print(f"  ❌ [error] {symbol}: {str(e)[:80]}")
                return symbol, False, 0.0, False

        if wdo_contracts:
            try:
                with ThreadPoolExecutor(max_workers=3) as executor:
                    futures = {executor.submit(_process_wdo_contract, c): c for c in wdo_contracts}
                    for fut in as_completed(futures, timeout=300):
                        try:
                            symbol, ok, iv, has_trades = fut.result(timeout=10)
                            if iv and iv > max_iv_wdo:
                                max_iv_wdo = iv
                            if has_trades:
                                active_wdo_symbols.append(symbol)
                        except Exception as e:
                            print(f"  ❌ future error: {str(e)[:80]}")
            except Exception as e:
                step_fail("wdo_batch", str(e)[:80])
        else:
            step_skip("wdo_batch", "sem contratos")

        active_wdo_symbols = sorted(list({s.strip().upper(): True for s in active_wdo_symbols}.keys()))
        if active_wdo_symbols:
            env_data["WDO_AVAILABLE_CONTRACTS"] = ",".join(active_wdo_symbols)
            env_data["WDO_ACTIVE_CONTRACTS_COUNT"] = len(active_wdo_symbols)
        env_data["WDO_CANDIDATE_CONTRACT_MONTHS"] = os.getenv("WDO_CANDIDATE_CONTRACT_MONTHS", os.getenv("WDO_EXPECTED_CONTRACT_MONTHS", "60")) or "60"
        cleanup_invalid_or_stale_files(CSV_DOLAR_DIR, allowed_prefixes=candidate_prefixes)

        current_contract_symbol = None
        for c in wdo_contracts:
            if c.get("type") == "current" and c.get("symbol"):
                current_contract_symbol = str(c["symbol"]).strip().upper()
                break
        if not current_contract_symbol and wdo_contracts:
            current_contract_symbol = str(wdo_contracts[0].get("symbol") or "").strip().upper() or None

        contract_iv_pct = None
        if current_contract_symbol:
            contract_iv_pct = fetch_barchart_futures_contract_iv_pct(driver, current_contract_symbol)

        wdo_iv_raw = contract_iv_pct if (contract_iv_pct is not None and contract_iv_pct > 0) else max_iv_wdo

        if wdo_iv_raw > 1:
            wdo_iv_raw = wdo_iv_raw / 100.0
        env_data["WDO_IV_ANNUAL"] = round(wdo_iv_raw, 4)

        # ------------------------------------------------------------------
        # FINALIZAÇÃO
        # ------------------------------------------------------------------
        print("\nGerando arquivo .env.auto...")
        tmp_file = ENV_FILE + ".tmp"
        try:
            with open(tmp_file, "w") as f:
                for key, value in env_data.items():
                    f.write(f"{key}={value}\n")
            os.replace(tmp_file, ENV_FILE)
        except Exception:
            if os.path.exists(tmp_file):
                try:
                    os.remove(tmp_file)
                except OSError:
                    pass
            raise
        
        print("\nProcesso concluído com sucesso!")
        print("Valores capturados:")
        for k, v in env_data.items():
            print(f"  {k}: {v}")

        # RESUMO FINAL (E96 - 2026-06-21)
        ok_count = sum(1 for v in _STEP_RESULTS.values() if v == "ok")
        fail_count = sum(1 for v in _STEP_RESULTS.values() if v == "fail")
        skip_count = sum(1 for v in _STEP_RESULTS.values() if v == "skip")
        total = len(_STEP_RESULTS)
        sys.stdout.write("\n" + "=" * 60 + "\n")
        sys.stdout.write("RESUMO FINAL DA COLETA\n")
        sys.stdout.write("=" * 60 + "\n")
        for k, v in _STEP_RESULTS.items():
            icon = {"ok": "✅", "fail": "❌", "skip": "⏭️"}.get(v, "?")
            sys.stdout.write(f"  {icon} {k}: {v}\n")
        sys.stdout.write(f"\nTotal: {ok_count}/{total} OK · {fail_count} fail · {skip_count} skip\n")
        sys.stdout.write("=" * 60 + "\n")
        sys.stdout.flush()

    except Exception as e:
        print(f"ERRO FATAL NA EXECUÇÃO: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if driver:
            print("Fechando navegador...")
            driver.quit()

if __name__ == "__main__":
    main()
