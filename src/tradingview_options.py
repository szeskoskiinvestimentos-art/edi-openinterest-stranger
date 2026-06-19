import datetime as dt
import logging
import json
import time
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

_YF_AVAILABLE = False
try:
    import yfinance as yf
    _YF_AVAILABLE = True
except ImportError:
    pass

OPTIONS_TICKERS = ["EWZ", "UUP", "USDU"]
_YF_CACHE: Dict[str, Any] = {}
_YF_CACHE_TTL = 300  # 5 minutes


def _is_yf_cache_valid(key: str) -> bool:
    if key not in _YF_CACHE:
        return False
    return (time.time() - _YF_CACHE[key]["ts"]) < _YF_CACHE_TTL


def _fetch_yfinance_options(ticker: str) -> Optional[Dict[str, Any]]:
    cache_key = f"yf_opts:{ticker}"
    if _is_yf_cache_valid(cache_key):
        return _YF_CACHE[cache_key]["data"]

    if not _YF_AVAILABLE:
        logger.warning("yfinance not installed, cannot fetch options for %s", ticker)
        return None

    try:
        stock = yf.Ticker(ticker)
        spot = stock.info.get("regularMarketPrice") or stock.info.get("previousClose") or 0.0
        expirations = stock.options
        if not expirations:
            logger.warning("No options expirations for %s", ticker)
            return None

        by_expiry = {}
        all_strikes = set()

        for exp_str in expirations:
            try:
                chain = stock.option_chain(exp_str)
            except Exception as e:
                logger.warning("Failed to fetch chain for %s %s: %s", ticker, exp_str, e)
                continue

            calls = chain.calls
            puts = chain.puts

            strikes = sorted(set(calls["strike"].tolist() + puts["strike"].tolist()))
            all_strikes.update(strikes)

            call_oi = []
            put_oi = []
            call_vol = []
            put_vol = []
            call_iv = []
            put_iv = []

            for k in strikes:
                c_row = calls[calls["strike"] == k]
                p_row = puts[puts["strike"] == k]

                call_oi.append(int(c_row["openInterest"].iloc[0]) if not c_row.empty and len(c_row["openInterest"].dropna()) > 0 else 0)
                put_oi.append(int(p_row["openInterest"].iloc[0]) if not p_row.empty and len(p_row["openInterest"].dropna()) > 0 else 0)
                call_vol.append(int(c_row["volume"].iloc[0]) if not c_row.empty and len(c_row["volume"].dropna()) > 0 else 0)
                put_vol.append(int(p_row["volume"].iloc[0]) if not p_row.empty and len(p_row["volume"].dropna()) > 0 else 0)

                c_iv = c_row["impliedVolatility"].iloc[0] if not c_row.empty and len(c_row["impliedVolatility"].dropna()) > 0 else None
                p_iv = p_row["impliedVolatility"].iloc[0] if not p_row.empty and len(p_row["impliedVolatility"].dropna()) > 0 else None
                call_iv.append(c_iv)
                put_iv.append(p_iv)

            by_expiry[exp_str] = {
                "strikes": strikes,
                "call_oi": call_oi,
                "put_oi": put_oi,
                "call_volume": call_vol,
                "put_volume": put_vol,
                "call_iv": call_iv,
                "put_iv": put_iv,
                "calls_count": len(calls),
                "puts_count": len(puts),
            }

        result = {
            "source": "yahoo_finance",
            "ticker_used": ticker,
            "ticker_label": ticker,
            "captured_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
            "spot": float(spot) if spot else 0.0,
            "min_open_interest": 0,
            "expiries": list(by_expiry.keys()),
            "by_expiry": by_expiry,
        }

        _YF_CACHE[cache_key] = {"data": result, "ts": time.time()}
        return result

    except Exception as e:
        logger.error("Error fetching yfinance options for %s: %s", ticker, e)
        return None


def _fetch_yahoo_rest_options(ticker: str) -> Optional[Dict[str, Any]]:
    """Fallback: fetch options via Yahoo Finance v7/options REST API without yfinance."""
    import requests as _rq

    cache_key = f"yahoo_rest:{ticker}"
    if _is_yf_cache_valid(cache_key):
        return _YF_CACHE[cache_key]["data"]

    try:
        quote_url = f"https://query1.finance.yahoo.com/v7/finance/quote?symbols={ticker}"
        headers = {"User-Agent": "Mozilla/5.0"}
        q_resp = _rq.get(quote_url, headers=headers, timeout=15)
        q_resp.raise_for_status()
        q_data = q_resp.json().get("quoteResponse", {}).get("result", [])
        spot = q_data[0].get("regularMarketPrice", 0.0) if q_data else 0.0

        chain_url = f"https://query2.finance.yahoo.com/v7/finance/options/{ticker}"
        c_resp = _rq.get(chain_url, headers=headers, timeout=15)
        c_resp.raise_for_status()
        c_body = c_resp.json().get("optionChain", {}).get("result", [])
        if not c_body:
            return None

        expirations = c_body[0].get("expirationDates", [])
        all_strikes_set = set()
        by_expiry = {}

        for ts in expirations:
            exp_date = dt.datetime.fromtimestamp(ts, tz=dt.timezone.utc).strftime("%Y-%m-%d")
            exp_url = f"https://query2.finance.yahoo.com/v7/finance/options/{ticker}?date={ts}"
            try:
                e_resp = _rq.get(exp_url, headers=headers, timeout=15)
                e_resp.raise_for_status()
                e_body = e_resp.json().get("optionChain", {}).get("result", [])
                if not e_body:
                    continue
                opts = e_body[0].get("options", [{}])[0]
                calls_raw = opts.get("calls", [])
                puts_raw = opts.get("puts", [])
            except Exception:
                continue

            strikes = sorted(set(o["strike"] for o in calls_raw + puts_raw))
            all_strikes_set.update(strikes)

            c_map = {o["strike"]: o for o in calls_raw}
            p_map = {o["strike"]: o for o in puts_raw}

            call_oi = [c_map.get(k, {}).get("openInterest", 0) or 0 for k in strikes]
            put_oi = [p_map.get(k, {}).get("openInterest", 0) or 0 for k in strikes]
            call_vol = [c_map.get(k, {}).get("volume", 0) or 0 for k in strikes]
            put_vol = [p_map.get(k, {}).get("volume", 0) or 0 for k in strikes]
            call_iv = [c_map.get(k, {}).get("impliedVolatility") for k in strikes]
            put_iv = [p_map.get(k, {}).get("impliedVolatility") for k in strikes]

            by_expiry[exp_date] = {
                "strikes": strikes,
                "call_oi": call_oi,
                "put_oi": put_oi,
                "call_volume": call_vol,
                "put_volume": put_vol,
                "call_iv": call_iv,
                "put_iv": put_iv,
                "calls_count": len(calls_raw),
                "puts_count": len(puts_raw),
            }

        result = {
            "source": "yahoo_finance",
            "ticker_used": ticker,
            "ticker_label": ticker,
            "captured_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
            "spot": float(spot) if spot else 0.0,
            "min_open_interest": 0,
            "expiries": list(by_expiry.keys()),
            "by_expiry": by_expiry,
        }

        _YF_CACHE[cache_key] = {"data": result, "ts": time.time()}
        return result

    except Exception as e:
        logger.error("Yahoo REST fallback failed for %s: %s", ticker, e)
        return None


def fetch_options_for_ticker(ticker: str) -> Optional[Dict[str, Any]]:
    """Fetch options chain for a single ticker. Tries yfinance first, then Yahoo REST."""
    if _YF_AVAILABLE:
        data = _fetch_yfinance_options(ticker)
        if data:
            return data
    return _fetch_yahoo_rest_options(ticker)


def fetch_all_options() -> Dict[str, Dict[str, Any]]:
    """Fetch options chains for all configured tickers."""
    results = {}
    for ticker in OPTIONS_TICKERS:
        data = fetch_options_for_ticker(ticker)
        if data:
            results[ticker] = data
        else:
            logger.warning("Failed to fetch options for %s", ticker)
    return results


def write_options_js(data: Dict[str, Any], output_path: str) -> None:
    """Write options data as a window.* JS variable (matching existing project format)."""
    var_name = f"window.yahoo{data['ticker_used'].lower()}OptionsData"
    js_content = f"{var_name}={json.dumps(data, ensure_ascii=False)};\n"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(js_content)
    logger.info("Options data written to %s", output_path)


if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO)

    tickers = sys.argv[1:] if len(sys.argv) > 1 else OPTIONS_TICKERS
    for ticker in tickers:
        print(f"\n--- {ticker} ---")
        data = fetch_options_for_ticker(ticker)
        if data:
            print(f"  Spot: {data['spot']}")
            print(f"  Expiries: {len(data['expiries'])}")
            for exp in data["expiries"][:3]:
                info = data["by_expiry"].get(exp, {})
                print(f"    {exp}: {len(info.get('strikes', []))} strikes")
        else:
            print("  No data")
