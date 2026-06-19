"""
Lightweight spot price updater — fetches real-time prices from TradingView
and updates market_data.js / market_data.json WITHOUT re-running the full
calculator pipeline.

Usage:
    python scripts/update_spot_prices.py --target WIN
    python scripts/update_spot_prices.py --target WDO
    python scripts/update_spot_prices.py --target ALL
"""

import argparse
import json
import os
import re
import sys
import datetime as dt
from pathlib import Path

sys.path.append(os.getcwd())

try:
    from src.tradingview_fetcher import fetch_spot_prices
except ImportError as e:
    print(f"Erro ao importar módulos: {e}")
    print("Certifique-se de executar este script da raiz do projeto.")
    sys.exit(1)


ROOT_DIR = Path(os.getcwd())
WIN_DATA = ROOT_DIR / "dashboard_unificado" / "WIN" / "assets" / "data"
WDO_DATA = ROOT_DIR / "dashboard_unificado" / "WDO" / "assets" / "data"

JS_PATTERN = re.compile(r"(?:^//.*\n)*window\.marketData\s*=\s*", re.MULTILINE)
EWZ_TO_INDEX_FALLBACK = 187040.0 / 38.06


def _read_js_market_data(path: Path) -> dict | None:
    raw = path.read_text(encoding="utf-8", errors="replace")
    m = JS_PATTERN.match(raw)
    if not m:
        return None
    json_str = raw[m.end():].rstrip().rstrip(";").strip()
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return None


def _write_js_market_data(path: Path, data: dict) -> None:
    payload = json.dumps(data, ensure_ascii=False, indent=4)
    path.write_text(f"window.marketData = {payload};\n", encoding="utf-8")


def _write_json_market_data(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=4), encoding="utf-8")


def _now_str() -> str:
    return dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def _now_iso() -> str:
    return dt.datetime.now().replace(microsecond=0).isoformat()


def update_target(target: str, prices: dict) -> bool:
    if target == "WIN":
        data_dir = WIN_DATA
        tv_key = "EWZ"
        scale_enabled = True
    elif target == "WDO":
        data_dir = WDO_DATA
        tv_key = "WDO"
        scale_enabled = False
    else:
        return False

    js_path = data_dir / "market_data.js"
    json_path = data_dir / "market_data.json"

    if not js_path.exists():
        print(f"  AVISO: {js_path} nao existe, pulando {target}.")
        return False

    price_info = prices.get(tv_key, {})
    spot_price = price_info.get("price", 0.0)
    if not spot_price or spot_price <= 0:
        print(f"  AVISO: preco invalido para {tv_key}: {spot_price}, pulando {target}.")
        return False

    data = _read_js_market_data(js_path)
    if data is None:
        print(f"  ERRO: nao conseguiu parsear {js_path}, pulando {target}.")
        return False

    now_str = _now_str()
    data["last_updated"] = now_str
    data["spot_price"] = spot_price

    overview = data.get("overview")
    if isinstance(overview, dict):
        if target == "WDO":
            overview["spot_price"] = spot_price
        elif target == "WIN":
            current_index = overview.get("spot_price", 0.0)
            if current_index > 1000:
                pass
            else:
                overview["spot_price"] = spot_price * EWZ_TO_INDEX_FALLBACK
        overview["last_update"] = _now_iso()

    if scale_enabled:
        index_spot = data.get("overview", {}).get("spot_price", 0.0)
        ewz_spot = spot_price
        if ewz_spot > 0 and index_spot > 0:
            scale_factor = index_spot / ewz_spot
            if "scale_diagnostics" not in data:
                data["scale_diagnostics"] = {}
            data["scale_diagnostics"]["display_scale_factor"] = scale_factor
            data["scale_diagnostics"]["ewz_spot"] = ewz_spot
            data["scale_diagnostics"]["index_spot"] = index_spot
            data["scale_diagnostics"]["updated_at"] = now_str
    elif not scale_enabled and "scale_diagnostics" in data:
        data["scale_diagnostics"]["updated_at"] = now_str

    _write_js_market_data(js_path, data)

    if json_path.exists():
        json_data = data.copy()
        _write_json_market_data(json_path, json_data)

    print(f"  {target}: spot_price={spot_price} ({tv_key}) -> {js_path.name}")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="Update spot prices from TradingView")
    parser.add_argument("--target", choices=["WIN", "WDO", "ALL"], default="ALL")
    args = parser.parse_args()

    print(f"[{_now_str()}] Buscando preços spot no TradingView...")
    prices = fetch_spot_prices()

    for alias in ("EWZ", "WIN", "WDO"):
        info = prices.get(alias, {})
        price = info.get("price", 0.0)
        chg = info.get("change_pct", 0.0)
        print(f"  {alias}: {price:.2f} ({chg:+.2f}%)")

    targets = ["WIN", "WDO"] if args.target == "ALL" else [args.target]
    updated = 0
    for t in targets:
        if update_target(t, prices):
            updated += 1

    print(f"[{_now_str()}] Concluído. {updated}/{len(targets)} targets atualizados.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
