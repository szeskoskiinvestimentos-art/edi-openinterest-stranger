import requests
import time
import datetime as dt
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

_CACHE: Dict[str, Any] = {}
_CACHE_TTL = 60  # seconds

SYMBOLS_CONFIG = {
    "WIN": {"ticker": "BMFBOVESPA:WIN1!", "aliases": ["BMFBOVESPA:WINM2026", "BMFBOVESPA:WINJ26"], "source": "tradingview"},
    "WDO": {"ticker": "BMFBOVESPA:WDO1!", "aliases": ["BMFBOVESPA:WDOM2026", "BMFBOVESPA:WDOJ26"], "source": "tradingview"},
    "EWZ": {"ticker": "EWZ", "source": "yahoo"},
    "UUP": {"ticker": "UUP", "source": "yahoo"},
    "USDU": {"ticker": "USDU", "source": "yahoo"},
}

YAHOO_QUOTE_URL = "https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"

SCAN_COLUMNS_CANDIDATES: List[List[str]] = [
    ["close|1", "update_mode"],
    ["close|5", "update_mode"],
    ["close"],
]

SCANNER_URL = "https://scanner.tradingview.com/global/scan"


def _is_cache_valid(key: str) -> bool:
    if key not in _CACHE:
        return False
    entry = _CACHE[key]
    elapsed = time.time() - entry["ts"]
    return elapsed < _CACHE_TTL


def _set_cache(key: str, value: Any) -> None:
    _CACHE[key] = {"data": value, "ts": time.time()}


def _get_cache(key: str) -> Optional[Any]:
    if _is_cache_valid(key):
        return _CACHE[key]["data"]
    return None


def _scan_ticker(ticker: str, aliases: List[str], max_retries: int = 3) -> Optional[Dict[str, Any]]:
    cache_key = f"scan:{ticker}"
    cached = _get_cache(cache_key)
    if cached is not None:
        return cached

    headers = {
        "User-Agent": "Mozilla/5.0",
        "Origin": "https://www.tradingview.com",
        "Referer": "https://www.tradingview.com/",
        "Content-Type": "application/json",
    }

    tickers_to_try = [ticker] + aliases

    for t in tickers_to_try:
        for cols in SCAN_COLUMNS_CANDIDATES:
            payload = {
                "symbols": {"tickers": [t], "query": {"types": []}},
                "columns": cols,
            }

            last_err = None
            for attempt in range(max_retries):
                try:
                    resp = requests.post(SCANNER_URL, json=payload, headers=headers, timeout=15)
                    if resp.status_code == 429:
                        wait = 2 ** (attempt + 1)
                        logger.warning("TradingView rate limit on %s, waiting %ds", t, wait)
                        time.sleep(wait)
                        continue
                    resp.raise_for_status()
                    body = resp.json()
                    data = body.get("data", [])
                    if not data or not data[0].get("d"):
                        break
                    vals = data[0]["d"]
                    price_val = vals[0] if vals else None
                    price = None
                    if isinstance(price_val, (int, float)) and price_val > 0:
                        price = float(price_val)
                    elif price_val is not None:
                        try:
                            p = float(price_val)
                            if p > 0:
                                price = p
                        except (TypeError, ValueError):
                            pass
                    if price is None or price <= 0:
                        break
                    change_pct = 0.0
                    if len(vals) > 1 and isinstance(vals[1], (int, float)):
                        change_pct = float(vals[1])
                    result = {
                        "price": price,
                        "change_pct": change_pct,
                        "used_ticker": t,
                        "used_columns": cols,
                    }
                    _set_cache(cache_key, result)
                    return result
                except requests.RequestException as e:
                    last_err = e
                    wait = 2 ** (attempt + 1)
                    logger.warning("Request error for %s (attempt %d): %s", t, attempt + 1, e)
                    if attempt < max_retries - 1:
                        time.sleep(wait)
            if last_err:
                logger.error("All retries exhausted for %s: %s", t, last_err)

    return None


def _fetch_yahoo_quote(ticker: str, max_retries: int = 3) -> Optional[Dict[str, Any]]:
    """Fetch spot price from Yahoo Finance API."""
    cache_key = f"yahoo:{ticker}"
    cached = _get_cache(cache_key)
    if cached is not None:
        return cached

    url = YAHOO_QUOTE_URL.format(ticker=ticker)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    }
    params = {"interval": "1d", "range": "1d"}

    last_err = None
    for attempt in range(max_retries):
        try:
            resp = requests.get(url, headers=headers, params=params, timeout=15)
            if resp.status_code == 429:
                wait = 2 ** (attempt + 1)
                logger.warning("Yahoo rate limit on %s, waiting %ds", ticker, wait)
                time.sleep(wait)
                continue
            resp.raise_for_status()
            body = resp.json()
            result = body.get("chart", {}).get("result", [])
            if not result:
                return None
            meta = result[0].get("meta", {})
            price = meta.get("regularMarketPrice")
            prev_close = meta.get("chartPreviousClose") or meta.get("previousClose")
            if price is None:
                return None
            change_pct = 0.0
            if prev_close and prev_close > 0:
                change_pct = ((price - prev_close) / prev_close) * 100
            data = {
                "price": float(price),
                "change_pct": round(change_pct, 2),
            }
            _set_cache(cache_key, data)
            return data
        except requests.RequestException as e:
            last_err = e
            wait = 2 ** (attempt + 1)
            logger.warning("Yahoo request error for %s (attempt %d): %s", ticker, attempt + 1, e)
            if attempt < max_retries - 1:
                time.sleep(wait)

    logger.error("Yahoo retries exhausted for %s: %s", ticker, last_err)
    return None


def fetch_spot_prices() -> Dict[str, Dict[str, Any]]:
    """Fetch real-time spot prices from TradingView (Brazil) and Yahoo Finance (US)."""
    results = {}
    now = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")

    for alias, cfg in SYMBOLS_CONFIG.items():
        source = cfg.get("source", "tradingview")
        data = None

        if source == "tradingview":
            data = _scan_ticker(cfg["ticker"], cfg.get("aliases", []))
            if data and data.get("price") is not None:
                results[alias] = {
                    "price": data["price"],
                    "change_pct": data.get("change_pct", 0.0),
                    "source": "tradingview",
                    "timestamp": now,
                    "used_ticker": data.get("used_ticker"),
                }
                continue
        elif source == "yahoo":
            data = _fetch_yahoo_quote(cfg["ticker"])
            if data and data.get("price") is not None:
                results[alias] = {
                    "price": data["price"],
                    "change_pct": data.get("change_pct", 0.0),
                    "source": "yahoo",
                    "timestamp": now,
                }
                continue

        results[alias] = {
            "price": 0.0,
            "change_pct": 0.0,
            "source": source,
            "timestamp": now,
            "error": "fetch_failed",
        }

    return results


if __name__ == "__main__":
    import json
    logging.basicConfig(level=logging.INFO)
    prices = fetch_spot_prices()
    print(json.dumps(prices, indent=2))
