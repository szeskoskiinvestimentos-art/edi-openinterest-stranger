import json
import os
import shutil
import sys
import time
from typing import Dict, Iterable, List, Optional, Set, Tuple


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
  extras = [
    os.path.join("WDO", "assets", "data", "yahoo_ewz_options.js"),
    os.path.join("WDO", "assets", "data", "yahoo_ewz_options.json"),
    os.path.join("WIN", "assets", "data", "yahoo_ewz_options.js"),
    os.path.join("WIN", "assets", "data", "yahoo_ewz_options.json"),
  ]

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


def _validate_staging(staging_dir: str) -> List[str]:
  required = [
    os.path.join("index.html"),
    os.path.join("WDO", "index.html"),
    os.path.join("WIN", "index.html"),
    os.path.join("WDO", "assets", "data", "market_data.js"),
    os.path.join("WDO", "assets", "data", "market_data.json"),
    os.path.join("WDO", "assets", "data", "yahoo_usdu_options.js"),
    os.path.join("WDO", "assets", "data", "yahoo_usdu_options.json"),
    os.path.join("WDO", "assets", "data", "yahoo_uup_options.js"),
    os.path.join("WDO", "assets", "data", "yahoo_uup_options.json"),
    os.path.join("WDO", "assets", "data", "yahoo_ewz_options.js"),
    os.path.join("WDO", "assets", "data", "yahoo_ewz_options.json"),
    os.path.join("WIN", "assets", "data", "market_data.js"),
    os.path.join("WIN", "assets", "data", "market_data.json"),
    os.path.join("WIN", "assets", "data", "yahoo_ewz_options.js"),
    os.path.join("WIN", "assets", "data", "yahoo_ewz_options.json"),
    os.path.join("WDO", "assets", "js", "main.js"),
    os.path.join("WIN", "assets", "js", "main.js"),
  ]
  missing: List[str] = []
  for rel in required:
    p = os.path.join(staging_dir, rel)
    if not os.path.exists(p):
      missing.append(rel)
      continue
    try:
      if os.path.getsize(p) <= 0:
        missing.append(rel)
        continue
    except Exception:
      missing.append(rel)
      continue
  return missing


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


def main() -> int:
  workspace_root = _join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..")
  src = _join(workspace_root, "Auto_B3_System", "dashboard_unificado")
  b3 = _join(workspace_root, "B3_System", "dashboard_unificado")
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
    sys.stdout.write(json.dumps(summary, ensure_ascii=False))
    return 2

  _safe_rmtree(staging)
  _ensure_dir(staging)

  ignore_dirs: Set[str] = {".git", "node_modules", ".vercel", "__pycache__"}
  copied_info = _copy_tree(src, staging, ignore_dirs=ignore_dirs)
  summary["copied"] = copied_info["copied"]
  summary["skipped"] = copied_info["skipped"]

  summary["root_index_written"] = _ensure_root_index(staging, fallback_from_dir=dst)
  if os.path.isdir(b3):
    summary["b3_usd_caches_injected"] = _inject_b3_usd_caches(b3, staging)

  preserve_sources: List[str] = []
  if os.path.isdir(dst):
    preserve_sources.append(dst)
  if os.path.isdir(prev_hint):
    preserve_sources.append(prev_hint)
  if preserve_sources:
    summary["extras_preserved"] = _preserve_extras_from_previous(preserve_sources, staging)

  missing = _validate_staging(staging)
  summary["checked"] = len(missing)
  if missing:
    summary["error"] = "validate_failed"
    summary["missing"] = missing
    sys.stderr.write("ERRO: publish abortado (staging invalido)\n")
    for m in missing:
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
