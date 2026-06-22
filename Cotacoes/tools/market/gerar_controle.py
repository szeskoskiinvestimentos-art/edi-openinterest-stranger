import json
import os
import re
import shutil
import sys
import time
import subprocess
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Optional, Set, Tuple, TypedDict, cast


class YahooMigrationReadinessTicker(TypedDict):
  ready: bool
  blockers: List[str]


class YahooMigrationReadinessDash(TypedDict):
  ready: bool
  blockers: List[str]
  by_ticker: Dict[str, YahooMigrationReadinessTicker]


def _abs(p: str) -> str:
  return os.path.abspath(p)


def _join(*parts: str) -> str:
  return _abs(os.path.join(*parts))


def _ensure_dir(p: str) -> None:
  os.makedirs(p, exist_ok=True)


def _safe_rmtree(p: str) -> bool:
  try:
    if os.path.isdir(p):
      shutil.rmtree(p)
    elif os.path.exists(p):
      os.remove(p)
    return True
  except Exception:
    return False


def _copy_file(src: str, dst: str) -> None:
  _ensure_dir(os.path.dirname(dst))
  shutil.copy2(src, dst)


def _cleanup_previous_backups(workspace_root: str, keep: int = 3) -> Dict[str, int]:
  try:
    keep_n = int(keep)
  except Exception:
    keep_n = 3
  keep_n = max(0, min(20, keep_n))

  prefix = "dashboard_unificado._previous_"
  candidates: List[str] = []
  try:
    for name in os.listdir(workspace_root):
      if not name.startswith(prefix):
        continue
      p = os.path.join(workspace_root, name)
      if os.path.isdir(p):
        candidates.append(p)
  except Exception:
    return {"candidates": 0, "deleted": 0}

  candidates.sort(key=lambda p: os.path.getmtime(p), reverse=True)
  deleted = 0
  for p in candidates[keep_n:]:
    if _safe_rmtree(p):
      deleted += 1
  return {"candidates": len(candidates), "deleted": deleted}


def _dir_stats(root: str, max_files: int = 20000) -> Dict[str, int]:
  files = 0
  total = 0
  try:
    for base, _dirs, names in os.walk(root):
      for name in names:
        files += 1
        if files > max_files:
          return {"files": files, "bytes": total, "truncated": 1}
        p = os.path.join(base, name)
        try:
          total += int(os.path.getsize(p))
        except Exception:
          continue
  except Exception:
    return {"files": files, "bytes": total, "truncated": 1}
  return {"files": files, "bytes": total, "truncated": 0}


def _iter_files(root: str) -> Iterable[tuple[str, str]]:
  for base, dirs, files in os.walk(root):
    dirs.sort()
    files.sort()
    for name in files:
      abs_path = os.path.join(base, name)
      rel = os.path.relpath(abs_path, root)
      yield rel, abs_path


def _copy_tree(src: str, dst: str, ignore_dirs: Set[str]) -> Dict[str, int]:
  copied = 0
  skipped = 0
  for rel, abs_src in _iter_files(src):
    parts = rel.split(os.sep)
    if any(p in ignore_dirs for p in parts):
      skipped += 1
      continue
    abs_dst = os.path.join(dst, rel)
    _copy_file(abs_src, abs_dst)
    copied += 1
  return {"copied": copied, "skipped": skipped}


def _write_text(p: str, text: str) -> None:
  _ensure_dir(os.path.dirname(p))
  with open(p, "w", encoding="utf-8", newline="\n") as f:
    f.write(text)


def _read_text(p: str) -> str:
  with open(p, "r", encoding="utf-8") as f:
    return f.read()


def _ticker_to_window_var_name(ticker: str) -> str:
  normalized = re.sub(r"[^a-z0-9]+", " ", str(ticker).lower()).strip()
  parts = normalized.split() if normalized else []
  suffix = "".join(s[:1].upper() + s[1:] for s in parts if s)
  return f"yahoo{suffix}OptionsData"


def _extract_yahoo_tickers_from_html(html_path: str, default: List[str]) -> List[str]:
  if not os.path.exists(html_path):
    return default
  try:
    html = _read_text(html_path)
  except Exception:
    return default

  m = re.search(r'data-yahoo-tickers\s*=\s*["\']([^"\']*)["\']', html, flags=re.IGNORECASE)
  if not m:
    return default

  raw = (m.group(1) or "").strip()
  if not raw:
    return default

  tickers = [t.strip() for t in raw.split(",")]
  tickers = [t for t in tickers if t]
  return tickers or default


def _is_yahoo_options_stub_js(p: str) -> bool:
  try:
    txt = _read_text(p)
  except Exception:
    return False
  return "OptionsData = null" in txt or "OptionsData=null" in txt


def _ensure_yahoo_options_scripts(staging_dir: str) -> Tuple[List[str], List[str]]:
  wrapped: List[str] = []
  stubbed: List[str] = []

  wdo_html = os.path.join(staging_dir, "WDO", "index.html")
  win_html = os.path.join(staging_dir, "WIN", "index.html")
  wdo_tickers = _extract_yahoo_tickers_from_html(wdo_html, default=["USDU", "UUP", "EWZ"])
  win_tickers = _extract_yahoo_tickers_from_html(win_html, default=["EWZ"])

  def ensure_for_dashboard(dash: str, tickers: List[str]) -> None:
    for t in tickers:
      rel_js = os.path.join(dash, "assets", "data", f"yahoo_{str(t).lower()}_options.js")
      rel_json = os.path.join(dash, "assets", "data", f"yahoo_{str(t).lower()}_options.json")
      abs_js = os.path.join(staging_dir, rel_js)
      abs_json = os.path.join(staging_dir, rel_json)

      if os.path.exists(abs_js):
        try:
          if os.path.getsize(abs_js) > 0 and not _is_yahoo_options_stub_js(abs_js):
            continue
        except Exception:
          pass

      if os.path.exists(abs_json):
        try:
          if os.path.getsize(abs_json) > 0:
            with open(abs_json, "r", encoding="utf-8") as f:
              obj = json.load(f)
            if isinstance(obj, dict):
              var_name = _ticker_to_window_var_name(t)
              _write_text(abs_js, f"window.{var_name} = {json.dumps(obj, ensure_ascii=False)};\n")
              wrapped.append(rel_js)
              continue
        except Exception:
          pass

      var_name = _ticker_to_window_var_name(t)
      _write_text(abs_js, f"window.{var_name} = null;\n")
      stubbed.append(rel_js)

  ensure_for_dashboard("WDO", wdo_tickers)
  ensure_for_dashboard("WIN", win_tickers)
  return wrapped, stubbed


def _ensure_root_index(staging_dir: str, fallback_from_dir: Optional[str]) -> bool:
  index_path = os.path.join(staging_dir, "index.html")
  if os.path.exists(index_path):
    return False

  if fallback_from_dir:
    fallback = os.path.join(fallback_from_dir, "index.html")
    if os.path.exists(fallback):
      _copy_file(fallback, index_path)
      return True

  html = """<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dashboard Unificado</title>
  <style>
    body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:#0b1020;color:#e8ecff}
    .wrap{max-width:920px;margin:32px auto;padding:0 16px}
    .card{background:rgba(18,26,51,.92);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:16px}
    h1{margin:0 0 12px;font-size:20px}
    .links{display:flex;gap:10px;flex-wrap:wrap}
    a{display:inline-block;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);color:#e8ecff;text-decoration:none;background:rgba(255,255,255,.04);font-weight:800}
    a:hover{background:rgba(255,255,255,.08)}
    .muted{margin-top:12px;color:rgba(232,236,255,.72);font-size:13px}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>Dashboard Unificado</h1>
      <div class="links">
        <a href="WDO/index.html">WDO</a>
        <a href="WIN/index.html">WIN</a>
        <a href="correlation/index.html">Correlações</a>
        <a href="../Cotacoes/dashboard/MERCADO/index.html">Cotações</a>
        <a href="../controle_de_dados.html">Controle de Dados</a>
      </div>
      <div class="muted">Gerado automaticamente (fallback). Se você tiver um index.html mais completo, ele será preservado quando existir.</div>
    </div>
  </div>
</body>
</html>
"""
  _write_text(index_path, html)
  return True


def _inject_b3_usd_caches(b3_dashboard_dir: str, staging_dir: str) -> int:
  src_base = os.path.join(b3_dashboard_dir, "WDO", "assets", "data")
  dst_base = os.path.join(staging_dir, "WDO", "assets", "data")
  if not os.path.isdir(src_base):
    return 0
  files = [
    "yahoo_usdu_options.js",
    "yahoo_usdu_options.json",
    "yahoo_uup_options.js",
    "yahoo_uup_options.json",
  ]
  copied = 0
  for name in files:
    src = os.path.join(src_base, name)
    if not os.path.exists(src):
      continue
    dst = os.path.join(dst_base, name)
    _copy_file(src, dst)
    copied += 1
  return copied


def _preserve_extras_from_previous(source_dirs: List[str], staging_dir: str) -> int:
  wdo_html = os.path.join(staging_dir, "WDO", "index.html")
  win_html = os.path.join(staging_dir, "WIN", "index.html")
  wdo_tickers = _extract_yahoo_tickers_from_html(wdo_html, default=["USDU", "UUP", "EWZ"])
  win_tickers = _extract_yahoo_tickers_from_html(win_html, default=["EWZ"])

  extras: List[str] = []
  for t in wdo_tickers:
    name = f"yahoo_{str(t).lower()}_options"
    extras.append(os.path.join("WDO", "assets", "data", f"{name}.js"))
    extras.append(os.path.join("WDO", "assets", "data", f"{name}.json"))
  for t in win_tickers:
    name = f"yahoo_{str(t).lower()}_options"
    extras.append(os.path.join("WIN", "assets", "data", f"{name}.js"))
    extras.append(os.path.join("WIN", "assets", "data", f"{name}.json"))

  copied = 0
  for rel in extras:
    dst = os.path.join(staging_dir, rel)
    if os.path.exists(dst):
      continue
    for base in source_dirs:
      src = os.path.join(base, rel)
      if os.path.exists(src):
        _copy_file(src, dst)
        copied += 1
        break

  corr_dst = os.path.join(staging_dir, "correlation")
  if not os.path.exists(corr_dst):
    for base in source_dirs:
      corr_src = os.path.join(base, "correlation")
      if os.path.isdir(corr_src):
        copied_info = _copy_tree(corr_src, corr_dst, ignore_dirs=set())
        copied += int(copied_info.get("copied") or 0)
        break
  return copied


def _validate_staging(staging_dir: str) -> Tuple[List[str], List[str]]:
  required = [
    os.path.join("index.html"),
    os.path.join("WDO", "index.html"),
    os.path.join("WIN", "index.html"),
    os.path.join("WDO", "assets", "data", "market_data.js"),
    os.path.join("WDO", "assets", "data", "market_data.json"),
    os.path.join("WIN", "assets", "data", "market_data.js"),
    os.path.join("WIN", "assets", "data", "market_data.json"),
    os.path.join("WDO", "assets", "js", "main.js"),
    os.path.join("WIN", "assets", "js", "main.js"),
  ]

  wdo_html = os.path.join(staging_dir, "WDO", "index.html")
  win_html = os.path.join(staging_dir, "WIN", "index.html")
  wdo_tickers = _extract_yahoo_tickers_from_html(wdo_html, default=["USDU", "UUP", "EWZ"])
  win_tickers = _extract_yahoo_tickers_from_html(win_html, default=["EWZ"])

  optional: List[str] = []
  for t in wdo_tickers:
    name = f"yahoo_{str(t).lower()}_options"
    optional.append(os.path.join("WDO", "assets", "data", f"{name}.js"))
    optional.append(os.path.join("WDO", "assets", "data", f"{name}.json"))
  for t in win_tickers:
    name = f"yahoo_{str(t).lower()}_options"
    optional.append(os.path.join("WIN", "assets", "data", f"{name}.js"))
    optional.append(os.path.join("WIN", "assets", "data", f"{name}.json"))

  missing_required: List[str] = []
  missing_optional: List[str] = []

  for rel in required:
    p = os.path.join(staging_dir, rel)
    if not os.path.exists(p):
      missing_required.append(rel)
      continue
    try:
      if os.path.getsize(p) <= 0:
        missing_required.append(rel)
        continue
    except Exception:
      missing_required.append(rel)
      continue

  for rel in optional:
    p = os.path.join(staging_dir, rel)
    if not os.path.exists(p):
      missing_optional.append(rel)
      continue
    try:
      if os.path.getsize(p) <= 0:
        missing_optional.append(rel)
        continue
    except Exception:
      missing_optional.append(rel)
      continue
    if rel.endswith(".js") and _is_yahoo_options_stub_js(p):
      missing_optional.append(rel)
      continue

  return missing_required, missing_optional


def _validate_market_quotes_file(market_quotes_path: str) -> Tuple[bool, str]:
  if not os.path.exists(market_quotes_path):
    return False, "market_quotes.json ausente"
  try:
    if os.path.getsize(market_quotes_path) <= 0:
      return False, "market_quotes.json vazio"
  except Exception:
    return False, "market_quotes.json stat falhou"

  try:
    with open(market_quotes_path, "r", encoding="utf-8") as f:
      obj = json.load(f)
  except Exception as e:
    return False, f"market_quotes.json JSON inválido: {str(e)}"

  if not isinstance(obj, dict):
    return False, "market_quotes.json não é objeto"

  assets = obj.get("assets")
  series = obj.get("series")
  if not isinstance(assets, list):
    return False, "market_quotes.json: assets não é array"
  if not isinstance(series, dict):
    return False, "market_quotes.json: series não é objeto"

  gen = obj.get("generatedAt")
  if not gen:
    meta = obj.get("meta")
    if isinstance(meta, dict):
      gen = meta.get("generatedAt")
  if not gen:
    return False, "market_quotes.json: generatedAt/meta.generatedAt ausente"

  return True, "ok"


def _parse_bool_env(name: str, default: bool = False) -> bool:
  raw = os.getenv(name, "")
  if raw is None:
    return default
  s = str(raw).strip().lower()
  if not s:
    return default
  return s in ("1", "true", "yes", "y", "on")


def _truncate_text(s: str, max_len: int = 4000) -> str:
  t = str(s or "").strip()
  if len(t) <= max_len:
    return t
  return t[:max_len] + "...(truncated)"


def _run_node_market_validate_strict(workspace_root: str) -> Tuple[Optional[bool], str]:
  cotacoes_dir = os.path.join(workspace_root, "Cotacoes")
  if not os.path.isdir(cotacoes_dir):
    return None, "cotacoes_dir_missing"
  npm_exe = shutil.which("npm") or shutil.which("npm.cmd") or shutil.which("npm.exe")
  if not npm_exe:
    return None, "npm_not_found"
  cmd = [npm_exe, "-C", cotacoes_dir, "run", "-s", "market:validate:strict"]
  try:
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=180)
  except subprocess.TimeoutExpired:
    return False, "timeout"
  except Exception as e:
    return False, f"error: {type(e).__name__}"

  combined = (res.stdout or "") + ("\n" if (res.stdout and res.stderr) else "") + (res.stderr or "")
  out = _truncate_text(combined)
  return (res.returncode == 0), out


def _parse_dt_maybe(s: str) -> Optional[datetime]:
  raw = str(s or "").strip()
  if not raw:
    return None
  try:
    if raw.endswith("Z"):
      dt = datetime.fromisoformat(raw[:-1])
      return dt.replace(tzinfo=timezone.utc)
    dt = datetime.fromisoformat(raw)
    if dt.tzinfo is None:
      return dt
    return dt.astimezone(timezone.utc)
  except Exception:
    pass
  for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M"):
    try:
      return datetime.strptime(raw, fmt)
    except Exception:
      continue
  return None


def _validate_market_data_file(market_data_path: str, label: str, stale_hours: int = 48) -> List[str]:
  warnings: List[str] = []
  if not os.path.exists(market_data_path):
    warnings.append(f"{label}: market_data.json ausente")
    return warnings
  try:
    if os.path.getsize(market_data_path) <= 0:
      warnings.append(f"{label}: market_data.json vazio")
      return warnings
  except Exception:
    warnings.append(f"{label}: market_data.json stat falhou")
    return warnings

  try:
    with open(market_data_path, "r", encoding="utf-8") as f:
      obj = json.load(f)
  except Exception as e:
    warnings.append(f"{label}: market_data.json JSON inválido: {str(e)}")
    return warnings

  if not isinstance(obj, dict):
    warnings.append(f"{label}: market_data.json não é objeto")
    return warnings

  overview = obj.get("overview")
  if not isinstance(overview, dict):
    warnings.append(f"{label}: overview ausente/invalid")
    overview = {}

  spot = obj.get("spot_price")
  if not isinstance(spot, (int, float)):
    spot = overview.get("spot_price")
  if not isinstance(spot, (int, float)):
    warnings.append(f"{label}: spot_price ausente/invalid")

  raw_dt = (
    overview.get("last_update")
    or obj.get("last_updated")
    or obj.get("last_update")
  )
  dt = _parse_dt_maybe(str(raw_dt or ""))
  if not dt:
    warnings.append(f"{label}: last_update ausente/invalid")
    return warnings

  now_utc = datetime.now(timezone.utc)
  if dt.tzinfo is None:
    age_hours = (datetime.now() - dt).total_seconds() / 3600.0
  else:
    age_hours = (now_utc - dt.astimezone(timezone.utc)).total_seconds() / 3600.0
  if age_hours > float(stale_hours):
    warnings.append(f"{label}: market_data stale ({age_hours:.1f}h)")
  return warnings


def _load_json_object_maybe(p: str) -> Optional[Dict]:
  if not os.path.exists(p):
    return None
  try:
    if os.path.getsize(p) <= 0:
      return None
  except Exception:
    return None
  try:
    with open(p, "r", encoding="utf-8") as f:
      obj = json.load(f)
    return obj if isinstance(obj, dict) else None
  except Exception:
    return None


def _infer_market_data_requirements(market_data_obj: Optional[Dict]) -> Dict[str, bool]:
  req = {"oi": True, "volume": True, "iv": True, "expiries": True, "strikes": True}
  if not market_data_obj or not isinstance(market_data_obj, dict):
    return req

  detailed = market_data_obj.get("detailed_data")
  if isinstance(detailed, list) and detailed:
    has_volume = False
    has_iv = False
    for row in detailed[:50]:
      if not isinstance(row, dict):
        continue
      if isinstance(row.get("volume"), (int, float)):
        has_volume = True
      if isinstance(row.get("iv"), (int, float)):
        has_iv = True
      if has_volume and has_iv:
        break
    req["volume"] = has_volume
    req["iv"] = has_iv
  return req


def _summarize_yahoo_options_coverage(staging_dir: str) -> List[Dict]:
  out: List[Dict] = []

  wdo_html = os.path.join(staging_dir, "WDO", "index.html")
  win_html = os.path.join(staging_dir, "WIN", "index.html")
  wdo_tickers = _extract_yahoo_tickers_from_html(wdo_html, default=["USDU", "UUP", "EWZ"])
  win_tickers = _extract_yahoo_tickers_from_html(win_html, default=["EWZ"])

  wdo_market = _load_json_object_maybe(os.path.join(staging_dir, "WDO", "assets", "data", "market_data.json"))
  win_market = _load_json_object_maybe(os.path.join(staging_dir, "WIN", "assets", "data", "market_data.json"))
  req_wdo = _infer_market_data_requirements(wdo_market)
  req_win = _infer_market_data_requirements(win_market)

  def _safe_number(v: object) -> Optional[float]:
    try:
      if isinstance(v, bool):
        return None
      if isinstance(v, (int, float)):
        return float(v)
      return None
    except Exception:
      return None

  def _spot_hint_from_market_data(market_data_obj: Optional[Dict]) -> Optional[float]:
    if not isinstance(market_data_obj, dict):
      return None
    spot = _safe_number(market_data_obj.get("spot_price"))
    if spot is None:
      ov = market_data_obj.get("overview")
      if isinstance(ov, dict):
        spot = _safe_number(ov.get("spot_price"))
    return spot

  wdo_spot_hint = _spot_hint_from_market_data(wdo_market)
  win_spot_hint = _spot_hint_from_market_data(win_market)

  def summarize_one(dash: str, ticker: str, req: Dict[str, bool]) -> Dict:
    base = os.path.join(staging_dir, dash, "assets", "data")
    p_json = os.path.join(base, f"yahoo_{str(ticker).lower()}_options.json")
    obj = _load_json_object_maybe(p_json)

    caps = {"oi": False, "volume": False, "iv": False, "expiries": False, "strikes": False}
    notes: List[str] = []
    if not obj:
      notes.append("cache_json_missing")
      return {"dashboard": dash, "ticker": ticker, "path": os.path.relpath(p_json, staging_dir), "caps": caps, "requires": req, "missing": [k for k, v in req.items() if v], "notes": notes}

    expiries = obj.get("expiries")
    caps["expiries"] = isinstance(expiries, list) and len(expiries) > 0

    by_expiry = obj.get("by_expiry")
    if isinstance(by_expiry, dict) and by_expiry:
      for _k, entry in list(by_expiry.items())[:3]:
        if not isinstance(entry, dict):
          continue
        strikes = entry.get("strikes")
        if isinstance(strikes, list) and len(strikes) > 0:
          caps["strikes"] = True
        has_oi = isinstance(entry.get("call_oi"), list) or isinstance(entry.get("put_oi"), list)
        if has_oi:
          caps["oi"] = True
        has_vol = isinstance(entry.get("call_volume"), list) or isinstance(entry.get("put_volume"), list) or isinstance(entry.get("call_vol"), list) or isinstance(entry.get("put_vol"), list)
        if has_vol:
          caps["volume"] = True
        has_iv = isinstance(entry.get("call_iv"), list) or isinstance(entry.get("put_iv"), list) or isinstance(entry.get("iv"), list) or isinstance(entry.get("iv_values"), list)
        if has_iv:
          caps["iv"] = True
        if all(caps.values()):
          break
    else:
      notes.append("by_expiry_missing_or_empty")

    missing = [k for k, v in req.items() if v and not caps.get(k)]
    if missing:
      notes.append("missing_required_caps")

    yahoo_spot = _safe_number(obj.get("spot"))
    spot_hint = wdo_spot_hint if dash == "WDO" else win_spot_hint if dash == "WIN" else None
    spot_compare = None
    if yahoo_spot is not None and spot_hint is not None:
      if 1.0 <= yahoo_spot <= 1000.0 and 1.0 <= spot_hint <= 1000.0:
        denom = yahoo_spot if yahoo_spot else None
        if denom:
          rel = (spot_hint - yahoo_spot) / denom
          spot_compare = {
            "market_data_spot": spot_hint,
            "yahoo_spot": yahoo_spot,
            "rel_diff": rel,
          }
          if abs(rel) > 0.10:
            notes.append("spot_divergence_gt_10pct")

    return {
      "dashboard": dash,
      "ticker": ticker,
      "path": os.path.relpath(p_json, staging_dir),
      "source": obj.get("source"),
      "captured_at_utc": obj.get("captured_at_utc") or obj.get("capturedAtUtc") or (obj.get("meta") or {}).get("capturedAtUtc"),
      "spot_compare": spot_compare,
      "caps": caps,
      "requires": req,
      "missing": missing,
      "notes": notes,
    }

  for t in wdo_tickers:
    out.append(summarize_one("WDO", t, req=req_wdo))
  for t in win_tickers:
    out.append(summarize_one("WIN", t, req=req_win))
  return out


def main() -> int:
  workspace_root = _join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..")
  # Ordem de preferencia de fonte:
  #   1. Auto_B3_System/dashboard_unificado  (legacy publish source, se voltar a ser populado)
  #   2. B3_System/dashboard_unificado       (outro nome legacy)
  #   3. dashboard_unificado                 (canonica commitada no git - fonte real desde 2026-06-22)
  # Criterio de selecao: candidato deve ter WDO/index.html (estrutura completa).
  # Sem isso, e um diretorio orfao (so tem assets/) e deve ser pulado.
  def _is_complete_source(p: str) -> bool:
    if not os.path.isdir(p):
      return False
    if not os.path.isdir(os.path.join(p, "WDO")):
      return False
    if not os.path.isfile(os.path.join(p, "WDO", "index.html")):
      return False
    return True
  src_candidates = [
    _join(workspace_root, "Auto_B3_System", "dashboard_unificado"),
    _join(workspace_root, "B3_System", "dashboard_unificado"),
    _join(workspace_root, "dashboard_unificado"),
  ]
  src = next((p for p in src_candidates if _is_complete_source(p)), src_candidates[2])
  dst = _join(workspace_root, "dashboard_unificado")
  staging = _join(workspace_root, "dashboard_unificado._staging")
  prev_hint = _join(workspace_root, "dashboard_unificado._previous")
  market_quotes = _join(workspace_root, "Cotacoes", "dashboard", "MERCADO", "assets", "data", "market_quotes.json")

  started_ms = int(time.time() * 1000)
  summary: Dict = {
    "ok": False,
    "source": src,
    "destination": dst,
    "previous_hint": prev_hint,
    "checked": 0,
    "copied": 0,
    "skipped": 0,
    "root_index_written": False,
    "b3_usd_caches_injected": 0,
    "extras_preserved": 0,
    "market_quotes_ok": False,
    "swapped": False,
    "fallback_in_place": False,
    "previous": None,
    "started_ms": started_ms,
  }

  if not os.path.isdir(src):
    summary["error"] = "source_missing"
    sys.stderr.write(f"ERRO: fonte nao encontrada: {src}\n")
    sys.stderr.write("Dica: esperado em um destes caminhos:\n")
    for p in src_candidates:
      sys.stderr.write(f"- {p}\n")
    sys.stdout.write(json.dumps(summary, ensure_ascii=False))
    return 2

  # EDI safety check (E95b-prevention 2026-06-21): fonte stale?
  try:
    src_mtime = datetime.fromtimestamp(os.path.getmtime(src))
    age_days = (datetime.now() - src_mtime).days
    if age_days > 30:
      summary["error"] = "source_stale"
      summary["source_age_days"] = age_days
      sys.stderr.write(f"ERRO: fonte stale ({age_days} dias, modified={src_mtime.isoformat()}). Abortando para nao sobrescrever dashboard_unificado/.\n")
      sys.stderr.write("Dica: fonte foi renomeada/movida. Verifique antes de continuar.\n")
      sys.stdout.write(json.dumps(summary, ensure_ascii=False))
      return 4
  except OSError as e:
    sys.stderr.write(f"WARN: nao foi possivel checar idade da fonte: {e}\n")

  # EDI safety check (E95b-prevention 2026-06-21): working tree dirty em dashboard_unificado/?
  try:
    r = subprocess.run(
      ["git", "status", "--porcelain", "dashboard_unificado/"],
      cwd=workspace_root, capture_output=True, text=True, timeout=5,
    )
    if r.stdout.strip():
      summary["error"] = "working_tree_dirty"
      summary["dirty_files"] = r.stdout.strip().splitlines()[:10]
      sys.stderr.write("ERRO: working tree dirty em dashboard_unificado/. Committar antes de gerar.\n")
      for line in r.stdout.strip().splitlines()[:10]:
        sys.stderr.write(f"  {line}\n")
      sys.stdout.write(json.dumps(summary, ensure_ascii=False))
      return 5
  except (subprocess.TimeoutExpired, FileNotFoundError) as e:
    sys.stderr.write(f"WARN: nao foi possivel checar git status: {e}\n")

  _safe_rmtree(staging)
  _ensure_dir(staging)

  ignore_dirs: Set[str] = {".git", "node_modules", ".vercel", "__pycache__"}
  copied_info = _copy_tree(src, staging, ignore_dirs=ignore_dirs)
  summary["copied"] = copied_info["copied"]
  summary["skipped"] = copied_info["skipped"]

  summary["root_index_written"] = _ensure_root_index(staging, fallback_from_dir=dst)

  preserve_sources: List[str] = []
  if os.path.isdir(dst):
    preserve_sources.append(dst)
  if os.path.isdir(prev_hint):
    preserve_sources.append(prev_hint)
  if preserve_sources:
    summary["extras_preserved"] = _preserve_extras_from_previous(preserve_sources, staging)

  yahoo_wrapped, yahoo_stubbed = _ensure_yahoo_options_scripts(staging)
  if yahoo_wrapped:
    summary["yahoo_wrapped"] = yahoo_wrapped
  if yahoo_stubbed:
    summary["yahoo_stubbed"] = yahoo_stubbed

  missing_required, missing_optional = _validate_staging(staging)
  summary["checked"] = len(missing_required) + len(missing_optional)
  if missing_optional:
    summary["warnings"] = missing_optional
  if missing_required:
    summary["error"] = "validate_failed"
    summary["missing"] = missing_required
    sys.stderr.write("ERRO: publish abortado (staging invalido)\n")
    for m in missing_required:
      sys.stderr.write(f"- faltando: {m}\n")
    sys.stdout.write(json.dumps(summary, ensure_ascii=False))
    _safe_rmtree(staging)
    return 3

  mq_ok, mq_detail = _validate_market_quotes_file(market_quotes)
  summary["market_quotes_ok"] = bool(mq_ok)
  if not mq_ok:
    summary["error"] = "market_quotes_invalid"
    summary["market_quotes_detail"] = mq_detail
    sys.stderr.write("ERRO: publish abortado (market_quotes inválido)\n")
    sys.stderr.write(f"- {mq_detail}\n")
    sys.stdout.write(json.dumps(summary, ensure_ascii=False))
    _safe_rmtree(staging)
    return 3

  strict_node_validate = _parse_bool_env("EDI_PUBLISH_STRICT_NODE_VALIDATE", default=False)
  node_ok, node_detail = _run_node_market_validate_strict(workspace_root)
  summary["market_validate_strict_ok"] = node_ok
  if node_detail:
    summary["market_validate_strict_detail"] = node_detail

  if strict_node_validate:
    if node_ok is False:
      summary["error"] = "market_validate_strict_failed"
      sys.stderr.write("ERRO: publish abortado (market:validate:strict falhou)\n")
      if node_detail:
        sys.stderr.write(_truncate_text(node_detail, 2000) + "\n")
      sys.stdout.write(json.dumps(summary, ensure_ascii=False))
      _safe_rmtree(staging)
      return 3
    if node_ok is None:
      summary["error"] = "market_validate_strict_unavailable"
      sys.stderr.write("ERRO: publish abortado (market:validate:strict indisponível)\n")
      sys.stdout.write(json.dumps(summary, ensure_ascii=False))
      _safe_rmtree(staging)
      return 3
  else:
    if node_ok is False:
      current = summary.get("warnings")
      msg = "market:validate:strict falhou (não bloqueante; habilite EDI_PUBLISH_STRICT_NODE_VALIDATE=1 para bloquear)"
      if isinstance(current, list):
        current.append(msg)
        summary["warnings"] = current
      else:
        summary["warnings"] = [msg]
    if node_ok is None:
      current = summary.get("warnings")
      msg = "market:validate:strict indisponível (npm/Cotacoes ausente) — pulando validação"
      if isinstance(current, list):
        current.append(msg)
        summary["warnings"] = current
      else:
        summary["warnings"] = [msg]

  md_warnings: List[str] = []
  md_warnings.extend(_validate_market_data_file(os.path.join(staging, "WDO", "assets", "data", "market_data.json"), "WDO"))
  md_warnings.extend(_validate_market_data_file(os.path.join(staging, "WIN", "assets", "data", "market_data.json"), "WIN"))
  if md_warnings:
    summary["market_data_warnings"] = md_warnings
    current = summary.get("warnings")
    if isinstance(current, list):
      seen = set(str(x) for x in current)
      for w in md_warnings:
        if w not in seen:
          current.append(w)
          seen.add(w)
      summary["warnings"] = current
    else:
      summary["warnings"] = md_warnings

  yahoo_coverage = _summarize_yahoo_options_coverage(staging)
  if yahoo_coverage:
    summary["yahoo_options_coverage"] = yahoo_coverage
    missing_any = []
    for row in yahoo_coverage:
      if isinstance(row, dict) and row.get("missing"):
        missing_any.append(row)
    if missing_any:
      summary["yahoo_options_coverage_missing"] = len(missing_any)

    missing_map: Dict[str, Dict[str, List[str]]] = {}
    for row in yahoo_coverage:
      if not isinstance(row, dict):
        continue
      dash = str(row.get("dashboard") or "")
      ticker = str(row.get("ticker") or "")
      missing = row.get("missing")
      if not dash or not ticker or not isinstance(missing, list) or not missing:
        continue
      if dash not in missing_map:
        missing_map[dash] = {}
      for m in missing:
        missing_map[dash].setdefault(str(m), []).append(ticker)

    coverage_warnings: List[str] = []
    for dash, by_missing in missing_map.items():
      parts = []
      for m, tickers in by_missing.items():
        uniq = sorted(set(tickers))
        parts.append(f"{m}({','.join(uniq)})")
      if parts:
        coverage_warnings.append(f"Yahoo coverage: {dash} missing " + " ".join(parts))

    if coverage_warnings:
      summary["yahoo_options_coverage_warnings"] = coverage_warnings
      current = summary.get("warnings")
      if isinstance(current, list):
        seen = set(str(x) for x in current)
        for w in coverage_warnings:
          if w not in seen:
            current.append(w)
            seen.add(w)
        summary["warnings"] = current
      else:
        summary["warnings"] = coverage_warnings

    readiness_by_dash: Dict[str, YahooMigrationReadinessDash] = {}
    for row in yahoo_coverage:
      if not isinstance(row, dict):
        continue
      dash = str(row.get("dashboard") or "")
      ticker = str(row.get("ticker") or "")
      if not dash or not ticker:
        continue
      missing = row.get("missing")
      notes = row.get("notes")
      blockers: List[str] = []
      if isinstance(missing, list) and missing:
        blockers.extend([f"missing:{str(x)}" for x in missing])
      if isinstance(notes, list):
        for n in notes:
          if str(n) == "spot_divergence_gt_10pct":
            blockers.append("spot_divergence_gt_10pct")

      dash_entry = readiness_by_dash.get(dash)
      if not dash_entry:
        dash_entry = cast(YahooMigrationReadinessDash, {"ready": True, "blockers": [], "by_ticker": {}})
        readiness_by_dash[dash] = dash_entry

      dash_entry["by_ticker"][ticker] = {"ready": not blockers, "blockers": blockers}

      if blockers:
        dash_entry["ready"] = False
        dash_entry["blockers"].extend([f"{ticker}:{b}" for b in blockers])

    if readiness_by_dash:
      for dash, v in readiness_by_dash.items():
        v["blockers"] = sorted(set(v["blockers"]))
      summary["yahoo_migration_readiness"] = readiness_by_dash
      summary["yahoo_migration_ready"] = all(
        isinstance(v, dict) and v.get("ready") is True for v in readiness_by_dash.values()
      )

  prev_base = _join(workspace_root, "dashboard_unificado._previous")
  prev = prev_base
  if os.path.exists(prev):
    if not _safe_rmtree(prev):
      prev = f"{prev_base}_{time.strftime('%Y%m%d_%H%M%S')}"
      _safe_rmtree(prev)

  summary["previous"] = prev

  try:
    if os.path.exists(dst):
      os.replace(dst, prev)
    os.replace(staging, dst)
    summary["swapped"] = True
    summary["ok"] = True
    summary["previous_retention"] = _cleanup_previous_backups(workspace_root, keep=3)
    summary["dashboard_unificado_stats"] = _dir_stats(dst)
    sys.stdout.write(json.dumps(summary, ensure_ascii=False))
    return 0
  except Exception:
    summary["fallback_in_place"] = True
    summary["swapped"] = False
    try:
      _ensure_dir(dst)
      copied2 = _copy_tree(staging, dst, ignore_dirs=set())
      summary["copied"] = int(summary.get("copied") or 0) + int(copied2.get("copied") or 0)
      summary["ok"] = True
      sys.stdout.write(json.dumps(summary, ensure_ascii=False))
      return 0
    except Exception:
      summary["error"] = "fallback_copy_failed"
      sys.stdout.write(json.dumps(summary, ensure_ascii=False))
      return 4
    finally:
      _safe_rmtree(staging)


if __name__ == "__main__":
  raise SystemExit(main())
