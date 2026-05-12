import json
import io
import os
import re
import shutil
import socket
import subprocess
import sys
import time
import threading
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any, cast


SCHEDULE_TIMES = ("06:00", "07:00", "08:30", "20:00")
STATE_FILE_NAME = ".edi_service_state.json"
LOGS_DIR_NAME = "service_logs"


@dataclass(frozen=True)
class ServiceConfig:
    root_dir: Path
    cotacoes_bat: Path
    options_runner: Path
    logs_dir: Path
    state_path: Path
    market_host: str = "127.0.0.1"
    market_port: int = 3033


def now_local() -> datetime:
    return datetime.now()


def is_weekday(d: date) -> bool:
    return d.weekday() < 5


def parse_hhmm(hhmm: str) -> tuple[int, int]:
    parts = hhmm.strip().split(":")
    if len(parts) != 2:
        raise ValueError(f"Hora inválida: {hhmm}")
    return int(parts[0]), int(parts[1])


def scheduled_slots_for_day(day: date) -> list[datetime]:
    out: list[datetime] = []
    for t in SCHEDULE_TIMES:
        hh, mm = parse_hhmm(t)
        out.append(datetime(day.year, day.month, day.day, hh, mm, 0))
    return out


def next_future_slot(ts: datetime) -> datetime:
    base_day = ts.date()
    for i in range(0, 14):
        d = base_day + timedelta(days=i)
        if not is_weekday(d):
            continue
        for slot in scheduled_slots_for_day(d):
            if slot > ts:
                return slot
    return ts + timedelta(hours=6)


def latest_due_slot(ts: datetime, last_run_slot: datetime) -> datetime | None:
    d = ts.date()
    if not is_weekday(d):
        return None
    due = [s for s in scheduled_slots_for_day(d) if s <= ts and s > last_run_slot]
    return max(due) if due else None


def latest_scheduled_slot_at_or_before(ts: datetime) -> datetime | None:
    d = ts.date()
    if not is_weekday(d):
        return None
    slots = [s for s in scheduled_slots_for_day(d) if s <= ts]
    return max(slots) if slots else None


def read_env_kv_file(path: Path) -> dict[str, str]:
    try:
        if not path.exists():
            return {}
        raw = path.read_text(encoding="utf-8", errors="replace")
        out: dict[str, str] = {}
        for line in raw.splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip()
            if k:
                out[k] = v
        return out
    except Exception:
        return {}


def resolve_barchart_env_path(cfg: ServiceConfig) -> Path | None:
    candidates = [
        cfg.root_dir / "B3_System" / ".env.auto",
        cfg.root_dir / "Automacao" / ".env.auto",
        cfg.root_dir / "automacao" / ".env.auto",
    ]
    for p in candidates:
        try:
            if p.exists():
                return p
        except Exception:
            continue
    return None


def get_barchart_last_slot_iso(cfg: ServiceConfig) -> str:
    p = resolve_barchart_env_path(cfg)
    if not p:
        return ""
    env = read_env_kv_file(p)
    return str(env.get("AUTO_BARCHART_LAST_SLOT_ISO") or "").strip()


def is_port_open(host: str, port: int, timeout_sec: float = 0.6) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout_sec):
            return True
    except OSError:
        return False


def load_state(path: Path) -> dict:
    if not path.exists():
        return {
            "last_run_scheduled_iso": None,
            "last_options_finished_iso": None,
            "last_options_exit_code": None,
            "last_options_log_path": None,
            "last_options_git_status": None,
            "last_cotacoes_finished_iso": None,
            "last_cotacoes_log_path": None,
            "last_cotacoes_git_status": None,
            "last_options_wdo_last_updated": None,
            "last_options_win_last_updated": None,
            "last_barchart_force_attempt_iso": None,
        }
    try:
        raw = path.read_text(encoding="utf-8", errors="replace")
        obj = json.loads(raw)
        if not isinstance(obj, dict):
            return {"last_run_scheduled_iso": None}
        out = {
            "last_run_scheduled_iso": str(obj.get("last_run_scheduled_iso")) if obj.get("last_run_scheduled_iso") else None,
            "last_options_finished_iso": str(obj.get("last_options_finished_iso")) if obj.get("last_options_finished_iso") else None,
            "last_options_exit_code": obj.get("last_options_exit_code"),
            "last_options_log_path": str(obj.get("last_options_log_path")) if obj.get("last_options_log_path") else None,
            "last_options_git_status": str(obj.get("last_options_git_status")) if obj.get("last_options_git_status") else None,
            "last_cotacoes_finished_iso": str(obj.get("last_cotacoes_finished_iso")) if obj.get("last_cotacoes_finished_iso") else None,
            "last_cotacoes_log_path": str(obj.get("last_cotacoes_log_path")) if obj.get("last_cotacoes_log_path") else None,
            "last_cotacoes_git_status": str(obj.get("last_cotacoes_git_status")) if obj.get("last_cotacoes_git_status") else None,
            "last_options_wdo_last_updated": str(obj.get("last_options_wdo_last_updated"))
            if obj.get("last_options_wdo_last_updated")
            else None,
            "last_options_win_last_updated": str(obj.get("last_options_win_last_updated"))
            if obj.get("last_options_win_last_updated")
            else None,
        }
        try:
            out["last_options_exit_code"] = int(out["last_options_exit_code"]) if out["last_options_exit_code"] is not None else None
        except Exception:
            out["last_options_exit_code"] = None
        return out
    except Exception:
        return {
            "last_run_scheduled_iso": None,
            "last_options_finished_iso": None,
            "last_options_exit_code": None,
            "last_options_log_path": None,
            "last_options_git_status": None,
            "last_cotacoes_finished_iso": None,
            "last_cotacoes_log_path": None,
            "last_cotacoes_git_status": None,
            "last_options_wdo_last_updated": None,
            "last_options_win_last_updated": None,
        }


def save_state(path: Path, state: dict) -> None:
    data = {
        "last_run_scheduled_iso": state.get("last_run_scheduled_iso"),
        "last_options_finished_iso": state.get("last_options_finished_iso"),
        "last_options_exit_code": state.get("last_options_exit_code"),
        "last_options_log_path": state.get("last_options_log_path"),
        "last_options_git_status": state.get("last_options_git_status"),
        "last_cotacoes_finished_iso": state.get("last_cotacoes_finished_iso"),
        "last_cotacoes_log_path": state.get("last_cotacoes_log_path"),
        "last_cotacoes_git_status": state.get("last_cotacoes_git_status"),
        "last_options_wdo_last_updated": state.get("last_options_wdo_last_updated"),
        "last_options_win_last_updated": state.get("last_options_win_last_updated"),
    }
    path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")


def safe_stdout_write(text: str) -> None:
    try:
        sys.stdout.write(text)
    except UnicodeEncodeError:
        enc = getattr(sys.stdout, "encoding", None) or "utf-8"
        data = text.encode(enc, errors="replace")
        buf = getattr(sys.stdout, "buffer", None)
        if buf is not None:
            buf.write(data)
        else:
            sys.stdout.write(data.decode(enc, errors="replace"))
    try:
        sys.stdout.flush()
    except Exception:
        pass


def log(msg: str) -> None:
    ts = now_local().strftime("%Y-%m-%d %H:%M:%S")
    fmt = os.getenv("LOG_FORMAT", "").strip().lower()
    if fmt == "json":
        try:
            safe_stdout_write(json.dumps({"ts": ts, "level": "info", "msg": msg}, ensure_ascii=False) + "\n")
            return
        except Exception:
            pass
    safe_stdout_write(f"[{ts}] {msg}\n")


def escape_html(s: object) -> str:
    t = str(s if s is not None else "")
    return (
        t.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#39;")
    )


def fmt_dt(ts: float | None) -> str:
    if ts is None:
        return "-"
    try:
        return datetime.fromtimestamp(float(ts)).strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return "-"


def list_recent_files(dir_path: Path, pattern: str, limit: int = 10) -> list[Path]:
    try:
        if not dir_path.exists():
            return []
        items = [p for p in dir_path.glob(pattern) if p.is_file()]
        items.sort(key=lambda p: p.stat().st_mtime, reverse=True)
        return items[: max(1, int(limit or 10))]
    except Exception:
        return []


def env_int(name: str, default: int) -> int:
    raw = os.getenv(name, "").strip()
    if not raw:
        return default
    try:
        return int(raw)
    except Exception:
        return default


def env_truthy(name: str, default: bool) -> bool:
    raw = os.getenv(name, "").strip().lower()
    if not raw:
        return default
    return raw in {"1", "true", "yes", "y", "on"}


def prune_service_logs(cfg: ServiceConfig, state: dict) -> int:
    if not env_truthy("AUTO_PRUNE_SERVICE_LOGS", True):
        return 0
    retention_days = max(1, env_int("SERVICE_LOGS_RETENTION_DAYS", 10))
    cutoff_ts = time.time() - retention_days * 86400

    keep: set[str] = set()
    try:
        for k, v in (state or {}).items():
            if not (isinstance(k, str) and k.endswith("_log_path")):
                continue
            if isinstance(v, str) and v:
                try:
                    keep.add(str(Path(v).resolve()))
                except Exception:
                    keep.add(v)
    except Exception:
        pass

    removed = 0
    try:
        logs_dir = cfg.logs_dir
        if not logs_dir.exists():
            return 0
        for p in logs_dir.glob("*.log"):
            try:
                if not p.is_file():
                    continue
                rp = str(p.resolve())
                if rp in keep:
                    continue
                if p.stat().st_mtime > cutoff_ts:
                    continue
                p.unlink(missing_ok=True)
                removed += 1
            except Exception:
                continue
    except Exception:
        return removed
    return removed


def prune_pycache(root_dir: Path) -> int:
    if not env_truthy("AUTO_CLEAN_PYCACHE", True):
        return 0
    retention_days = max(0, env_int("PYCACHE_RETENTION_DAYS", 0))
    cutoff_ts = time.time() - retention_days * 86400

    skip_names = {
        ".git",
        ".venv",
        "venv",
        "node_modules",
        "dist",
        "build",
    }

    removed = 0
    try:
        for base, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in skip_names]
            if "__pycache__" in dirs:
                p = Path(base) / "__pycache__"
                try:
                    if retention_days > 0 and p.exists() and p.is_dir():
                        if p.stat().st_mtime > cutoff_ts:
                            continue
                    shutil.rmtree(p, ignore_errors=True)
                    removed += 1
                except Exception:
                    pass
            for name in files:
                if not (name.endswith(".pyc") or name.endswith(".pyo")):
                    continue
                fp = Path(base) / name
                try:
                    if retention_days > 0 and fp.exists() and fp.is_file():
                        if fp.stat().st_mtime > cutoff_ts:
                            continue
                    fp.unlink(missing_ok=True)
                except Exception:
                    continue
    except Exception:
        return removed
    return removed


def get_expected_wdo_symbols(count: int = 12) -> list[str]:
    month_num_to_letter = {
        1: "F",
        2: "G",
        3: "H",
        4: "J",
        5: "K",
        6: "M",
        7: "N",
        8: "Q",
        9: "U",
        10: "V",
        11: "X",
        12: "Z",
    }
    now = now_local()
    start_month = now.month + 1
    year_short = now.year % 100
    out: list[str] = []
    for i in range(max(1, int(count or 12))):
        m = start_month + i
        y = year_short
        while m > 12:
            m -= 12
            y += 1
        code = month_num_to_letter.get(int(m))
        if not code:
            continue
        out.append(f"XD{code}{y:02d}")
    return out


def _wdo_contract_sort_key(symbol: str) -> tuple[int, int, str]:
    try:
        m = re.search(r"^XD([FGHJKMNQUVXZ])(\d{2})$", str(symbol or "").strip().upper())
        if not m:
            return (9999, 99, str(symbol or ""))
        month_letter_to_num = {
            "F": 1,
            "G": 2,
            "H": 3,
            "J": 4,
            "K": 5,
            "M": 6,
            "N": 7,
            "Q": 8,
            "U": 9,
            "V": 10,
            "X": 11,
            "Z": 12,
        }
        year = 2000 + int(m.group(2))
        month = int(month_letter_to_num.get(m.group(1)) or 99)
        return (year, month, m.group(0))
    except Exception:
        return (9999, 99, str(symbol or ""))


def _parse_wdo_available_contracts_from_env(env: dict[str, str]) -> list[str]:
    raw = str(env.get("WDO_AVAILABLE_CONTRACTS") or "").strip()
    if not raw:
        return []
    parts = re.split(r"[,\s;|]+", raw)
    uniq: dict[str, bool] = {}
    for p in parts:
        s = str(p or "").strip().upper()
        if re.match(r"^XD[FGHJKMNQUVXZ]\d{2}$", s):
            uniq[s] = True
    return sorted(list(uniq.keys()), key=_wdo_contract_sort_key)


def _extract_wdo_prefixes_from_csv_dir(dir_path: Path) -> list[str]:
    try:
        if not dir_path.exists():
            return []
        uniq: dict[str, bool] = {}
        for p in dir_path.glob("XD*_options_exp-*.csv"):
            m = re.match(r"^(XD[FGHJKMNQUVXZ]\d{2})_options_exp-", p.name.strip(), flags=re.IGNORECASE)
            if not m:
                continue
            uniq[str(m.group(1)).strip().upper()] = True
        return sorted(list(uniq.keys()), key=_wdo_contract_sort_key)
    except Exception:
        return []


def get_expected_wdo_symbols_for_cfg(cfg: ServiceConfig, count: int = 12) -> list[str]:
    env_path = resolve_barchart_env_path(cfg)
    if env_path:
        env = read_env_kv_file(env_path)
        from_env = _parse_wdo_available_contracts_from_env(env)
        if from_env:
            return from_env

    from_dir = _extract_wdo_prefixes_from_csv_dir(cfg.root_dir / "B3_System" / "CSV_Dolar")
    if from_dir:
        near = get_expected_wdo_symbols(max(1, min(4, int(count or 12))))
        out = list(near)
        for s in from_dir:
            if s not in out:
                out.append(s)
        return out

    return get_expected_wdo_symbols(count)


def summarize_csv_dir(dir_path: Path, prefixes: list[str]) -> dict:
    files: list[dict] = []
    latest_by_prefix: dict[str, dict] = {}
    try:
        if dir_path.exists():
            for p in dir_path.glob("*.csv"):
                try:
                    st = p.stat()
                except Exception:
                    continue
                item = {
                    "name": p.name,
                    "path": str(p),
                    "mtime": st.st_mtime,
                    "mtime_fmt": fmt_dt(st.st_mtime),
                    "size": int(st.st_size or 0),
                }
                files.append(item)
                for pref in prefixes:
                    if p.name.upper().startswith(pref.upper()):
                        prev = latest_by_prefix.get(pref)
                        if not prev or float(item["mtime"]) > float(prev.get("mtime") or 0):
                            latest_by_prefix[pref] = item
                        break
    except Exception:
        files = []
        latest_by_prefix = {}
    files.sort(key=lambda x: float(x.get("mtime") or 0), reverse=True)
    missing = [p for p in prefixes if p not in latest_by_prefix]
    return {
        "dir": str(dir_path),
        "files_total": len(files),
        "files_recent": files[:25],
        "latest_by_prefix": latest_by_prefix,
        "missing_prefixes": missing,
    }


def summarize_cotacoes_data_files(cfg: ServiceConfig) -> dict:
    base = cfg.root_dir / "Cotacoes" / "dashboard" / "MERCADO" / "assets" / "data"
    names = [
        "market_quotes.json",
        "economic_calendar.json",
        "agenda_reports.js",
        "zq_curve.json",
    ]
    out_items: list[dict] = []
    for n in names:
        p = base / n
        if not p.exists():
            out_items.append({"name": n, "exists": False})
            continue
        try:
            st = p.stat()
            out_items.append(
                {
                    "name": n,
                    "exists": True,
                    "path": str(p),
                    "mtime": st.st_mtime,
                    "mtime_fmt": fmt_dt(st.st_mtime),
                    "size": int(st.st_size or 0),
                }
            )
        except Exception:
            out_items.append({"name": n, "exists": True, "path": str(p)})
    newest = max([float(i.get("mtime") or 0) for i in out_items if i.get("exists")], default=0.0)
    return {"dir": str(base), "files": out_items, "newest_mtime": newest, "newest_mtime_fmt": fmt_dt(newest) if newest else "-"}


def summarize_market_quotes_file(cfg: ServiceConfig) -> dict:
    p = cfg.root_dir / "Cotacoes" / "dashboard" / "MERCADO" / "assets" / "data" / "market_quotes.json"
    if not p.exists():
        return {"exists": False, "path": str(p)}
    try:
        st = p.stat()
        try:
            obj = json.loads(p.read_text(encoding="utf-8", errors="replace"))
        except Exception as e:
            return {
                "exists": True,
                "path": str(p),
                "mtime": st.st_mtime,
                "mtime_fmt": fmt_dt(st.st_mtime),
                "size": int(st.st_size or 0),
                "error": f"json_parse_failed: {e}",
            }
        meta_raw = obj.get("meta") if isinstance(obj, dict) else None
        meta = meta_raw if isinstance(meta_raw, dict) else {}
        return {
            "exists": True,
            "path": str(p),
            "mtime": st.st_mtime,
            "mtime_fmt": fmt_dt(st.st_mtime),
            "size": int(st.st_size or 0),
            "meta": {
                "generatedAt": meta.get("generatedAt"),
                "source": meta.get("source"),
                "intervalMinutes": meta.get("intervalMinutes"),
                "retentionDays": meta.get("retentionDays"),
                "portfolioUpdatedAt": meta.get("portfolioUpdatedAt"),
                "diUpdatedAt": meta.get("diUpdatedAt"),
                "yahooUpdatedAt": meta.get("yahooUpdatedAt"),
                "yahooCoverage": meta.get("yahooCoverage"),
            },
        }
    except Exception as e:
        return {"exists": True, "path": str(p), "error": str(e)}


def summarize_market_yahoo_audit_file(cfg: ServiceConfig) -> dict:
    p = cfg.root_dir / "Cotacoes" / "dashboard" / "MERCADO" / "assets" / "data" / "market_yahoo_audit.json"
    if not p.exists():
        return {"exists": False, "path": str(p)}
    try:
        st = p.stat()
        try:
            obj = json.loads(p.read_text(encoding="utf-8", errors="replace"))
        except Exception as e:
            return {
                "exists": True,
                "path": str(p),
                "mtime": st.st_mtime,
                "mtime_fmt": fmt_dt(st.st_mtime),
                "size": int(st.st_size or 0),
                "error": f"json_parse_failed: {e}",
            }
        items = obj.get("items") if isinstance(obj, dict) else None
        missing = []
        if isinstance(items, list):
            for it in items:
                if isinstance(it, dict) and it.get("status") == "missing":
                    missing.append(
                        {
                            "assetSymbol": it.get("assetSymbol"),
                            "category": it.get("category"),
                            "yahooSymbol": it.get("yahooSymbol"),
                            "reason": it.get("reason"),
                        }
                    )
        return {
            "exists": True,
            "path": str(p),
            "mtime": st.st_mtime,
            "mtime_fmt": fmt_dt(st.st_mtime),
            "size": int(st.st_size or 0),
            "generatedAt": obj.get("generatedAt") if isinstance(obj, dict) else None,
            "attemptedAssets": obj.get("attemptedAssets") if isinstance(obj, dict) else None,
            "updatedAssets": obj.get("updatedAssets") if isinstance(obj, dict) else None,
            "missingAssets": obj.get("missingAssets") if isinstance(obj, dict) else None,
            "uniqueYahooSymbols": obj.get("uniqueYahooSymbols") if isinstance(obj, dict) else None,
            "returnedYahooSymbols": obj.get("returnedYahooSymbols") if isinstance(obj, dict) else None,
            "missing": missing[:400],
        }
    except Exception as e:
        return {"exists": True, "path": str(p), "error": str(e)}


def summarize_zq_curve_file(cfg: ServiceConfig) -> dict:
    p = cfg.root_dir / "Cotacoes" / "dashboard" / "MERCADO" / "assets" / "data" / "zq_curve.json"
    if not p.exists():
        return {"exists": False, "path": str(p)}
    try:
        st = p.stat()
        try:
            obj = json.loads(p.read_text(encoding="utf-8", errors="replace"))
        except Exception as e:
            return {
                "exists": True,
                "path": str(p),
                "mtime": st.st_mtime,
                "mtime_fmt": fmt_dt(st.st_mtime),
                "size": int(st.st_size or 0),
                "error": f"json_parse_failed: {e}",
            }
        items = obj.get("items") if isinstance(obj, dict) else None
        out_items = items if isinstance(items, list) else []
        return {
            "exists": True,
            "path": str(p),
            "mtime": st.st_mtime,
            "mtime_fmt": fmt_dt(st.st_mtime),
            "size": int(st.st_size or 0),
            "generatedAt": obj.get("generatedAt") if isinstance(obj, dict) else None,
            "rootSymbol": obj.get("rootSymbol") if isinstance(obj, dict) else None,
            "riskMode": obj.get("riskMode") if isinstance(obj, dict) else None,
            "slopePct": obj.get("slopePct") if isinstance(obj, dict) else None,
            "contractCount": obj.get("contractCount") if isinstance(obj, dict) else None,
            "items": out_items,
        }
    except Exception as e:
        return {"exists": True, "path": str(p), "error": str(e)}


def summarize_foreign_flow_file(cfg: ServiceConfig) -> dict:
    p = cfg.root_dir / "Cotacoes" / "dashboard" / "MERCADO" / "assets" / "data" / "foreign_flow.json"
    if not p.exists():
        return {"exists": False, "path": str(p)}
    try:
        st = p.stat()
        try:
            obj = json.loads(p.read_text(encoding="utf-8", errors="replace"))
        except Exception as e:
            return {
                "exists": True,
                "path": str(p),
                "mtime": st.st_mtime,
                "mtime_fmt": fmt_dt(st.st_mtime),
                "size": int(st.st_size or 0),
                "error": f"json_parse_failed: {e}",
            }
        src = obj.get("source") if isinstance(obj, dict) else None
        source = src if isinstance(src, dict) else {}
        latest = obj.get("latest") if isinstance(obj, dict) else None
        latest_obj = latest if isinstance(latest, dict) else {}
        return {
            "exists": True,
            "path": str(p),
            "mtime": st.st_mtime,
            "mtime_fmt": fmt_dt(st.st_mtime),
            "size": int(st.st_size or 0),
            "generatedAt": obj.get("generatedAt") if isinstance(obj, dict) else None,
            "latest": {
                "date": latest_obj.get("date"),
                "foreigners": latest_obj.get("foreigners"),
            },
            "source": {
                "url": source.get("url"),
                "updatedAt": source.get("updatedAt"),
                "updatedAtText": source.get("updatedAtText"),
            },
        }
    except Exception as e:
        return {"exists": True, "path": str(p), "error": str(e)}


def _parse_simple_env_file(p: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    try:
        raw = p.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return out
    for line in raw.splitlines():
        s = line.strip()
        if not s or s.startswith("#") or "=" not in s:
            continue
        k, v = s.split("=", 1)
        kk = k.strip()
        vv = v.strip()
        if kk:
            out[kk] = vv
    return out


def summarize_tradingview_env(cfg: ServiceConfig) -> dict:
    p = cfg.root_dir / "Automacao" / ".env.auto"
    if not p.exists():
        return {"exists": False, "path": str(p)}
    try:
        st = p.stat()
        envd = _parse_simple_env_file(p)
        return {
            "exists": True,
            "path": str(p),
            "mtime": st.st_mtime,
            "mtime_fmt": fmt_dt(st.st_mtime),
            "size": int(st.st_size or 0),
            "last_collected_at_utc": envd.get("AUTO_BARCHART_LAST_COLLECTED_AT_UTC") or None,
            "last_slot_iso": envd.get("AUTO_BARCHART_LAST_SLOT_ISO") or None,
            "wdo_spot": envd.get("WDO_SPOT") or None,
            "win_scaling_index_ref_close": envd.get("WIN_SCALING_INDEX_REF_CLOSE") or None,
            "win_scaling_ewz_ref_close": envd.get("WIN_SCALING_EWZ_REF_CLOSE") or None,
        }
    except Exception as e:
        return {"exists": True, "path": str(p), "error": str(e)}


def summarize_sina_dce_i0(cfg: ServiceConfig) -> dict:
    p = cfg.root_dir / "Cotacoes" / "dashboard" / "MERCADO" / "assets" / "data" / "market_quotes.json"
    if not p.exists():
        return {"exists": False, "path": str(p)}
    try:
        obj = json.loads(p.read_text(encoding="utf-8", errors="replace"))
        if not isinstance(obj, dict):
            return {"exists": True, "path": str(p), "error": "invalid_market_quotes_json"}
        series = obj.get("series")
        if not isinstance(series, dict):
            return {"exists": True, "path": str(p), "error": "missing_series"}
        sym = "DCE_I0"
        rows = series.get(sym)
        if not isinstance(rows, list) or not rows:
            return {"exists": True, "path": str(p), "symbol": sym, "present": False}
        last = rows[-1] if isinstance(rows[-1], dict) else None
        if not isinstance(last, dict):
            return {"exists": True, "path": str(p), "symbol": sym, "present": True, "error": "invalid_last_point"}
        return {
            "exists": True,
            "path": str(p),
            "symbol": sym,
            "present": True,
            "last": {
                "t": last.get("t"),
                "asOf": last.get("asOf"),
                "price": last.get("price"),
                "change": last.get("change"),
                "changePct": last.get("changePct"),
                "source": last.get("source"),
            },
        }
    except Exception as e:
        return {"exists": True, "path": str(p), "error": str(e)}

def parse_last_error_hint_from_text(text: str) -> str | None:
    if not text:
        return None
    candidates: list[str] = []
    for raw in text.splitlines():
        s = raw.strip()
        if not s:
            continue
        if "FALHA CRÍTICA" in s or s.startswith("ERRO") or "Erro ao iniciar UC Driver" in s:
            candidates.append(s)
        if "Falha ao exportar CSV" in s:
            candidates.append(s)
        if "GIT_SYNC error" in s:
            candidates.append(s)
    return candidates[-1] if candidates else None


def build_controle_de_dados_payload(cfg: ServiceConfig, state: dict) -> dict:
    now = now_local()
    payload: dict = {
        "generated_at": now.isoformat(timespec="seconds"),
        "root_dir": str(cfg.root_dir),
        "state": dict(state),
    }

    wdo_expected = get_expected_wdo_symbols_for_cfg(cfg, 12)
    win_expected: list[str] = []
    payload["options"] = {
        "wdo_expected_contracts": wdo_expected,
        "win_expected_contracts": win_expected,
        "csv_dolar": summarize_csv_dir(cfg.root_dir / "B3_System" / "CSV_Dolar", wdo_expected),
        "csv_indice": summarize_csv_dir(cfg.root_dir / "B3_System" / "CSV_Indice", ["EWZ"]),
        "dashboard_unificado": summarize_options_dashboard_market_data(cfg),
    }

    opt_log_path = state.get("last_options_log_path")
    opt_hint = None
    if isinstance(opt_log_path, str) and opt_log_path:
        p = Path(opt_log_path)
        if p.exists():
            opt_hint = parse_last_error_hint_from_text(read_tail_text(p))
    payload["options"]["last_log_hint"] = opt_hint

    payload["cotacoes"] = {
        "market_status": summarize_cotacoes_from_status(cfg),
        "data_files": summarize_cotacoes_data_files(cfg),
    }
    cot_log_path = state.get("last_cotacoes_log_path")
    cot_hint = None
    if isinstance(cot_log_path, str) and cot_log_path:
        p = Path(cot_log_path)
        if p.exists():
            cot_hint = parse_last_error_hint_from_text(read_tail_text(p))
    cast(dict[str, Any], payload["cotacoes"])["last_log_hint"] = cot_hint

    payload["market_quotes"] = summarize_market_quotes_file(cfg)
    payload["yahoo_audit"] = summarize_market_yahoo_audit_file(cfg)
    payload["zq_curve"] = summarize_zq_curve_file(cfg)
    payload["foreign_flow"] = summarize_foreign_flow_file(cfg)
    payload["tradingview"] = summarize_tradingview_env(cfg)
    payload["sina"] = summarize_sina_dce_i0(cfg)

    payload["logs"] = {
        "options_recent": [
            {"name": p.name, "path": str(p), "mtime": p.stat().st_mtime, "mtime_fmt": fmt_dt(p.stat().st_mtime)}
            for p in list_recent_files(cfg.root_dir / LOGS_DIR_NAME, "options_*.log", limit=10)
        ],
        "cotacoes_recent": [
            {"name": p.name, "path": str(p), "mtime": p.stat().st_mtime, "mtime_fmt": fmt_dt(p.stat().st_mtime)}
            for p in list_recent_files(cfg.root_dir / "Cotacoes" / ".edi-market-guardin" / "logs", "market_update_*.log", limit=10)
        ],
    }
    return payload


def write_controle_de_dados_html(cfg: ServiceConfig, state: dict) -> None:
    try:
        payload = build_controle_de_dados_payload(cfg, state)
        data_json = json.dumps(payload, ensure_ascii=False)
        out_path = cfg.root_dir / "controle_de_dados.html"
        html_tpl = """<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Controle de Dados</title>
  <style>
    :root {
      --bg: #0b1020;
      --card: #121a33;
      --muted: #99a3c2;
      --text: #e8ecff;
      --ok: #2bd576;
      --warn: #ffcc66;
      --bad: #ff5c77;
      --border: rgba(255,255,255,0.09);
    }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Liberation Sans", sans-serif;
      background: linear-gradient(180deg, var(--bg), #050713 70%);
      color: var(--text);
    }
    .wrap { max-width: 1180px; margin: 24px auto; padding: 0 16px 40px; }
    .top { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    h1 { margin: 0; font-size: 22px; letter-spacing: 0.2px; }
    .meta { color: var(--muted); font-size: 13px; }
    .grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 12px; margin-top: 14px; }
    .card {
      grid-column: span 12;
      background: rgba(18, 26, 51, 0.92);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 14px 14px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.25);
      overflow: hidden;
    }
    @media (min-width: 980px) {
      .card.half { grid-column: span 6; }
      .card.third { grid-column: span 4; }
    }
    .row { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .k { color: var(--muted); font-size: 12px; }
    .v { font-size: 14px; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 12px;
      border: 1px solid var(--border);
      background: rgba(255,255,255,0.03);
    }
    .dot { width: 9px; height: 9px; border-radius: 99px; display: inline-block; }
    .ok { background: var(--ok); }
    .warn { background: var(--warn); }
    .bad { background: var(--bad); }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { text-align: left; padding: 8px 10px; border-top: 1px solid var(--border); font-size: 13px; }
    th { color: var(--muted); font-weight: 600; }
    .muted { color: var(--muted); }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    .small { font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <h1>Controle de Dados</h1>
      <div class="meta" id="meta"></div>
    </div>
    <div class="grid" id="grid"></div>
  </div>
  <script id="data" type="application/json">__DATA_JSON__</script>
  <script>
    const data = JSON.parse(document.getElementById('data').textContent || '{}');
    const grid = document.getElementById('grid');
    const meta = document.getElementById('meta');

    const fmt = (v) => (v === null || v === undefined || v === '' ? '-' : String(v));
    const escapeHtml = (s) => String(s ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

    const badge = (kind, text) => `<span class=\"badge\"><span class=\"dot ${kind}\"></span><span>${escapeHtml(text)}</span></span>`;
    const card = (title, body, cls='') => `<div class=\"card ${cls}\"><div class=\"row\"><div><div class=\"k\">${escapeHtml(title)}</div></div></div>${body}</div>`;
    const hrow = (k, v) => `<div class=\"row\"><div class=\"k\">${escapeHtml(k)}</div><div class=\"v mono\">${escapeHtml(fmt(v))}</div></div>`;
    const table = (headers, rows) => {
      const th = headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
      const tr = rows.map(r => `<tr>${r.map(c => `<td class=\"mono\">${escapeHtml(fmt(c))}</td>`).join('')}</tr>`).join('');
      return `<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
    };

    meta.textContent = `Gerado em ${fmt(data.generated_at)} • ${fmt(data.root_dir)}`;

    const opt = data.options || {};
    const st = (data.state || {});
    const optExit = st.last_options_exit_code;
    const optGit = fmt(st.last_options_git_status);
    const optWdoLast = fmt(st.last_options_wdo_last_updated);
    const optWinLast = fmt(st.last_options_win_last_updated);
    const optHint = fmt(opt.last_log_hint);

    const optStatusKind = (optExit === 0 && !String(optHint).includes('FALHA')) ? 'ok' : (optExit === 0 ? 'warn' : 'bad');
    const optBadges = [
      badge(optStatusKind, `Opções exit=${fmt(optExit)} | git=${optGit}`),
      badge('ok', `WDO last_updated=${optWdoLast}`),
      badge('ok', `WIN last_updated=${optWinLast}`),
    ].join(' ');

    const wdo = (opt.csv_dolar || {});
    const missingWdo = (wdo.missing_prefixes || []);
    const wdoStatusKind = missingWdo.length === 0 ? 'ok' : (missingWdo.length <= 2 ? 'warn' : 'bad');
    const wdoSummary = badge(wdoStatusKind, `WDO contratos: ${fmt((opt.wdo_expected_contracts || []).length)} esperados | ${fmt(Object.keys(wdo.latest_by_prefix || {}).length)} presentes | ${missingWdo.length} faltando`);

    const recentWdoRows = (opt.wdo_expected_contracts || []).map(sym => {
      const it = (wdo.latest_by_prefix || {})[sym];
      return [sym, it ? it.mtime_fmt : '-', it ? it.size : '-', it ? it.name : '-'];
    });

    const idx = (opt.csv_indice || {});
    const recentIdxRows = (idx.files_recent || []).slice(0, 8).map(f => [f.mtime_fmt, f.size, f.name]);

    const dash = (opt.dashboard_unificado || {});
    const dashWdo = fmt(dash.wdo_last_updated);
    const dashWin = fmt(dash.win_last_updated);

    const cot = data.cotacoes || {};
    const ms = (cot.market_status || {});
    const files = (cot.data_files || {});
    const cotHint = fmt(cot.last_log_hint);
    const running = !!ms.running;
    const lastFinished = fmt(ms.last_finishedAt || ms.current_finishedAt);
    const gitSt = fmt(st.last_cotacoes_git_status || 'unknown');
    const kind = gitSt === 'pushed' || gitSt === 'committed' ? 'ok' : (gitSt === 'no_changes' ? 'warn' : 'bad');
    const b = badge(kind, `Cotações git=${gitSt} | last_finished=${lastFinished} ${running ? '(rodando)' : ''}`);
    const fileRows = (files.files || []).map(f => [f.name, f.exists ? f.mtime_fmt : 'não existe', f.exists ? f.size : '-', f.exists ? f.path : '-']);

    const logs = data.logs || {};
    const optLogs = (logs.options_recent || []).map(l => [l.mtime_fmt, l.name, l.path]);
    const cotLogs = (logs.cotacoes_recent || []).map(l => [l.mtime_fmt, l.name, l.path]);

    const mq = data.market_quotes || {};
    const mqMeta = (mq.meta || {});
    const yc = (mqMeta.yahooCoverage || null);
    const yUpd = yc && typeof yc.updatedAssets === 'number' ? yc.updatedAssets : Number(yc && yc.updatedAssets ? yc.updatedAssets : 0);
    const yMiss = yc && typeof yc.missingAssets === 'number' ? yc.missingAssets : Number(yc && yc.missingAssets ? yc.missingAssets : 0);
    const yKind = yc && yc.enabled ? (yMiss === 0 ? 'ok' : (yMiss <= 10 ? 'warn' : 'bad')) : 'warn';
    const yahooBadge = yc && yc.enabled
      ? badge(yKind, `Yahoo updated=${fmt(yUpd)} | missing=${fmt(yMiss)} | at=${fmt(yc.lastRunAt || mqMeta.yahooUpdatedAt || mqMeta.generatedAt)}`)
      : badge('warn', `Yahoo cobertura: n/d (habilite MARKET_YAHOO_ENABLED)`);    

    const ycCatsRaw = yc && yc.byCategory && typeof yc.byCategory === 'object' ? yc.byCategory : {};
    const ycCats = Object.entries(ycCatsRaw);
    ycCats.sort((a, b) => {
      const am = Number((a[1] && a[1].missing) || 0);
      const bm = Number((b[1] && b[1].missing) || 0);
      if (bm !== am) return bm - am;
      return String(a[0]).localeCompare(String(b[0]));
    });
    const ycCatRows = ycCats.map(([cat, row]) => [
      cat,
      row && row.assets !== undefined ? row.assets : '-',
      row && row.attempted !== undefined ? row.attempted : '-',
      row && row.updated !== undefined ? row.updated : '-',
      row && row.missing !== undefined ? row.missing : '-',
    ]);

    const yMissingSymbols = yc && Array.isArray(yc.missingSymbols) ? yc.missingSymbols : [];
    const yOverrides = yc && yc.symbolOverrides && typeof yc.symbolOverrides === 'object' ? yc.symbolOverrides : null;
    const yOverridesCount = yOverrides && typeof yOverrides.count === 'number' ? yOverrides.count : Number(yOverrides && yOverrides.count ? yOverrides.count : 0);
    const yOverridesItems = yOverrides && Array.isArray(yOverrides.items) ? yOverrides.items : [];

    const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
    const parseTs = (s) => {
      const t = Date.parse(String(s || ''));
      return Number.isFinite(t) ? t : null;
    };
    const dtFmt = new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    });
    const fmtLocalIso = (iso) => {
      const ms = iso ? parseTs(iso) : null;
      return ms === null ? fmt(iso) : dtFmt.format(new Date(ms));
    };
    const fmtLocalEpochSec = (sec) => {
      const v = typeof sec === 'number' ? sec : null;
      return v === null ? '-' : dtFmt.format(new Date(v * 1000));
    };

    const yAttempted = yc && typeof yc.attemptedAssets === 'number'
      ? yc.attemptedAssets
      : (yc && yc.attemptedAssets ? Number(yc.attemptedAssets) : 0);
    const yAt = (yc && (yc.lastRunAt || yc.timestamp)) || mqMeta.yahooUpdatedAt || mqMeta.generatedAt || null;
    const yAtMs = yAt ? parseTs(yAt) : null;
    const stalenessMin = yAtMs ? Math.max(0, Math.round((Date.now() - yAtMs) / 60000)) : null;
    const coveragePct = yAttempted > 0 ? (yUpd / yAttempted) * 100 : null;
    const scoreCoverage = coveragePct === null ? 0 : clamp(coveragePct, 0, 100);
    const scoreStale = stalenessMin === null ? 0 : clamp(100 - stalenessMin * 2, 0, 100);
    const healthScore = Math.round(scoreCoverage * 0.75 + scoreStale * 0.25);
    const healthKind = (yc && yc.enabled)
      ? (healthScore >= 90 ? 'ok' : (healthScore >= 75 ? 'warn' : 'bad'))
      : 'warn';
    const healthBadge = (yc && yc.enabled)
      ? badge(healthKind, `Saúde Yahoo=${fmt(healthScore)}/100 | cobertura=${coveragePct === null ? '-' : coveragePct.toFixed(1)}% | staleness=${stalenessMin === null ? '-' : fmt(stalenessMin)}m`)
      : badge('warn', 'Saúde Yahoo: n/d');

    const degraded = ycCats.map(([cat, row]) => {
      const attempted = Number((row && row.attempted) || 0);
      const updated = Number((row && row.updated) || 0);
      const missing = Number((row && row.missing) || 0);
      const cov = attempted > 0 ? (updated / attempted) * 100 : null;
      const degraded = missing > 0 || (cov !== null && cov < 90);
      return { cat: String(cat), attempted, updated, missing, cov, degraded };
    }).filter(x => x.degraded);
    degraded.sort((a, b) => {
      if (b.missing !== a.missing) return b.missing - a.missing;
      const ac = a.cov === null ? 0 : a.cov;
      const bc = b.cov === null ? 0 : b.cov;
      if (ac !== bc) return ac - bc;
      return a.cat.localeCompare(b.cat);
    });
    const degradedRows = degraded.slice(0, 10).map(x => [
      x.cat,
      x.cov === null ? '-' : x.cov.toFixed(1) + '%',
      x.missing,
    ]);

    const audit = data.yahoo_audit || {};
    const auditMissing = Array.isArray(audit.missing) ? audit.missing : [];
    const auditBadge = badge(
      auditMissing.length > 0 ? 'warn' : 'ok',
      `Audit missing=${fmt(auditMissing.length)}`
    );
    const auditRows = auditMissing.slice(0, 80).map(x => [
      fmt(x.assetSymbol),
      fmt(x.category),
      fmt(x.yahooSymbol),
      fmt(x.reason),
    ]);

    const zq = data.zq_curve || {};
    const zqExists = !!zq.exists;
    const zqItems = Array.isArray(zq.items) ? zq.items : [];
    const zqCount = typeof zq.contractCount === 'number' ? zq.contractCount : zqItems.length;
    const zqSlope = (zq && (zq.slopePct !== undefined && zq.slopePct !== null)) ? Number(zq.slopePct) : null;
    const zqRisk = fmt(zq.riskMode || '-');
    const zqKind = zqRisk === 'RISK_OFF' ? 'warn' : (zqRisk === 'RISK_ON' ? 'ok' : 'warn');
    const zqBadge = zqExists
      ? badge(zqKind, `ZQ contratos=${fmt(zqCount)} | ${zqRisk}${zqSlope === null || !Number.isFinite(zqSlope) ? '' : ` | slope=${zqSlope.toFixed(2)}%`}`)
      : badge('warn', 'Curva ZQ: n/d');
    const zqRows = zqItems.slice(0, 120).map(it => [
      fmt(it.vertex),
      fmt(it.expirationFmt),
      it && typeof it.lastPrice === 'number' ? it.lastPrice.toFixed(4) : fmt(it.lastPrice),
      it && typeof it.impliedRatePct === 'number' ? it.impliedRatePct.toFixed(3) : fmt(it.impliedRatePct),
      fmt(it.yahooSymbol),
    ]);

    const ageMinutes = (iso) => {
      const ms = iso ? parseTs(iso) : null;
      return ms ? Math.max(0, Math.round((Date.now() - ms) / 60000)) : null;
    };

    const flow = data.foreign_flow || {};
    const flowAgeMin = ageMinutes(flow.generatedAt || null);
    const flowKind = flow && flow.exists ? (flowAgeMin !== null && flowAgeMin <= 36 * 60 ? 'ok' : 'warn') : 'bad';
    const flowBadge = flow && flow.exists
      ? badge(flowKind, `Fluxo gerado ${fmt(flow.generatedAt)} | idade=${flowAgeMin === null ? '-' : fmt(flowAgeMin)}m`)
      : badge('bad', 'Fluxo estrangeiro: n/d');

    const tv = data.tradingview || {};
    const tvAgeMin = ageMinutes(tv.last_collected_at_utc || null);
    const tvKind = tv && tv.exists ? (tvAgeMin !== null && tvAgeMin <= 36 * 60 ? 'ok' : 'warn') : 'bad';
    const tvBadge = tv && tv.exists
      ? badge(tvKind, `TradingView (env) ${fmt(tv.last_collected_at_utc)} | idade=${tvAgeMin === null ? '-' : fmt(tvAgeMin)}m`)
      : badge('bad', 'TradingView: n/d');

    const sina = data.sina || {};
    const sinaLast = sina && sina.last ? sina.last : {};
    const sinaTs = sinaLast && (sinaLast.asOf || sinaLast.t) ? (sinaLast.asOf || sinaLast.t) : null;
    const sinaAgeMin = ageMinutes(sinaTs);
    const sinaKind = sina && sina.present ? (sinaAgeMin !== null && sinaAgeMin <= 36 * 60 ? 'ok' : 'warn') : 'warn';
    const sinaBadge = sina && sina.present
      ? badge(sinaKind, `Sina DCE_I0 ${fmt(sinaTs)} | idade=${sinaAgeMin === null ? '-' : fmt(sinaAgeMin)}m`)
      : badge('warn', 'Sina DCE_I0: n/d');

    const ageMinutesFromMtime = (mtimeSec) => {
      const v = typeof mtimeSec === 'number' ? mtimeSec : null;
      return v ? Math.max(0, Math.round((Date.now() - v * 1000) / 60000)) : null;
    };

    const invPortfolioAt = mqMeta.portfolioUpdatedAt || null;
    const invPortfolioAgeMin = ageMinutes(invPortfolioAt);
    const invPortfolioKind = invPortfolioAt ? (invPortfolioAgeMin !== null && invPortfolioAgeMin <= 36 * 60 ? 'ok' : 'warn') : 'bad';
    const invPortfolioBadge = invPortfolioAt
      ? badge(invPortfolioKind, `Investing (Portfolio) ${fmtLocalIso(invPortfolioAt)} | idade=${invPortfolioAgeMin === null ? '-' : fmt(invPortfolioAgeMin)}m`)
      : badge('bad', 'Investing (Portfolio): n/d');

    const diAt = mqMeta.diUpdatedAt || null;
    const diAgeMin = ageMinutes(diAt);
    const diKind = diAt ? (diAgeMin !== null && diAgeMin <= 36 * 60 ? 'ok' : 'warn') : 'warn';
    const diBadge = diAt
      ? badge(diKind, `InfoMoney (DI) ${fmtLocalIso(diAt)} | idade=${diAgeMin === null ? '-' : fmt(diAgeMin)}m`)
      : badge('warn', 'InfoMoney (DI): n/d');

    const calFile = (files.files || []).find(f => f && f.name === 'economic_calendar.json') || null;
    const calKind = calFile && calFile.exists
      ? ((ageMinutesFromMtime(calFile.mtime) !== null && ageMinutesFromMtime(calFile.mtime) <= 36 * 60) ? 'ok' : 'warn')
      : 'warn';
    const calBadge = calFile && calFile.exists
      ? badge(calKind, `Investing (Calendário) ${fmtLocalEpochSec(calFile.mtime)} | idade=${ageMinutesFromMtime(calFile.mtime) === null ? '-' : fmt(ageMinutesFromMtime(calFile.mtime))}m`)
      : badge('warn', 'Investing (Calendário): n/d');

    grid.innerHTML = [
      card('Resumo', `
        <div>${optBadges}</div>
        <div style=\"margin-top:10px\">${wdoSummary}</div>
        <div style=\"margin-top:10px\">${yahooBadge}</div>
        <div style=\"margin-top:10px\">${healthBadge}</div>
        <div style=\"margin-top:12px\" class=\"small muted\">Último alerta relevante (se existir): <span class=\"mono\">${escapeHtml(optHint)}</span></div>
      `),

      card('Opções • WDO (Barchart CSV_Dolar)', `
        ${hrow('Diretório', wdo.dir)}
        ${hrow('Arquivos totais', wdo.files_total)}
        ${missingWdo.length ? `<div class=\"small muted\" style=\"margin-top:10px\">Faltando: <span class=\"mono\">${escapeHtml(missingWdo.join(', '))}</span></div>` : `<div class=\"small muted\" style=\"margin-top:10px\">Todos os contratos esperados estão presentes.</div>`}
        ${table(['Contrato', 'Criado/Atualizado', 'Tamanho', 'Arquivo'], recentWdoRows)}
      `, 'half'),

      card('Opções • Índice (Barchart CSV_Indice)', `
        ${hrow('Diretório', idx.dir)}
        ${hrow('Arquivos totais', idx.files_total)}
        ${table(['Criado/Atualizado', 'Tamanho', 'Arquivo'], recentIdxRows)}
      `, 'half'),

      card('Dashboard Unificado (saídas)', `
        ${hrow('WDO market_data.json', dashWdo)}
        ${hrow('WIN market_data.json', dashWin)}
        <div class=\"small muted\" style=\"margin-top:10px\">Caminhos:</div>
        <div class=\"small mono muted\">${escapeHtml(fmt(dash.wdo_path || ''))}</div>
        <div class=\"small mono muted\">${escapeHtml(fmt(dash.win_path || ''))}</div>
      `, 'third'),

      card('Cotações (market:service)', `
        <div>${b}</div>
        <div class=\"small muted\" style=\"margin-top:10px\">Último alerta relevante (se existir): <span class=\"mono\">${escapeHtml(cotHint)}</span></div>
        <div style=\"margin-top:10px\" class=\"small muted\">Arquivos em ${escapeHtml(fmt(files.dir || ''))} (newest=${escapeHtml(fmt(files.newest_mtime_fmt || '-'))})</div>
        ${table(['Arquivo', 'Atualizado em', 'Tamanho', 'Caminho'], fileRows)}
      `),

      card('Investing + InfoMoney', `
        <div>${invPortfolioBadge}</div>
        <div style=\"margin-top:10px\">${calBadge}</div>
        <div style=\"margin-top:10px\">${diBadge}</div>
        <div class=\"small muted\" style=\"margin-top:10px\">Fonte: <span class=\"mono\">market_quotes.json</span> (portfolio/DI) e <span class=\"mono\">economic_calendar.json</span> (calendário).</div>
      `, 'third'),

      card('Yahoo (sem navegador) • Cobertura', `
        <div>${yahooBadge} ${healthBadge} ${badge('ok', `overrides=${fmt(yOverridesCount)}`)}</div>
        <div style=\"margin-top:10px\" class=\"small muted\">market_quotes.json: <span class=\"mono\">${escapeHtml(fmt(mq.mtime_fmt || '-'))}</span> • <span class=\"mono\">${escapeHtml(fmt(mq.path || ''))}</span></div>
        <div style=\"margin-top:10px\">${hrow('meta.portfolioUpdatedAt', mqMeta.portfolioUpdatedAt || '-')}</div>
        <div style=\"margin-top:6px\">${hrow('meta.yahooUpdatedAt', mqMeta.yahooUpdatedAt || '-')}</div>
        <div style=\"margin-top:6px\">${hrow('meta.source', mqMeta.source || '-')}</div>
        ${degradedRows.length ? table(['Categoria degradada', 'Cobertura', 'Ausentes'], degradedRows) : `<div class=\"small muted\" style=\"margin-top:10px\">Sem categorias degradadas.</div>`}
        ${ycCatRows.length ? table(['Categoria', 'Assets', 'Tentados', 'Atualizados', 'Ausentes'], ycCatRows) : `<div class=\"small muted\" style=\"margin-top:10px\">Sem dados de categoria (meta.yahooCoverage.byCategory vazio).</div>`}
        ${yMissingSymbols.length ? `<div class=\"small muted\" style=\"margin-top:10px\">Ausentes (top): <span class=\"mono\">${escapeHtml(yMissingSymbols.slice(0, 40).join(', '))}</span></div>` : `<div class=\"small muted\" style=\"margin-top:10px\">Sem ausências relevantes.</div>`}
        ${yOverridesItems.length ? `<div class=\"small muted\" style=\"margin-top:10px\">Overrides (top): <span class=\"mono\">${escapeHtml(yOverridesItems.slice(0, 25).join(' ; '))}</span></div>` : ``}
      `),

      card('Curva de Juros EUA (Fed Funds • ZQ)', `
        <div>${zqBadge}</div>
        <div class=\"small muted\" style=\"margin-top:10px\">Fonte: Yahoo • Fórmula: <span class=\"mono\">Juro Implícito (%) = 100 - Preço</span></div>
        <div class=\"small muted\" style=\"margin-top:6px\">Interpretação: curva subindo tende a <span class=\"mono\">RISK_OFF</span>; curva caindo tende a <span class=\"mono\">RISK_ON</span>.</div>
        <div class=\"small muted\" style=\"margin-top:10px\">Arquivo: <span class=\"mono\">${escapeHtml(fmt(zq.mtime_fmt || '-'))}</span> • <span class=\"mono\">${escapeHtml(fmt(zq.path || ''))}</span></div>
        ${zqRows.length ? table(['Vértice', 'Vencimento', 'Preço', 'Juro Implícito (%)', 'Yahoo'], zqRows) : `<div class=\"small muted\" style=\"margin-top:10px\">Sem dados da curva ZQ.</div>`}
      `),

      card('Fluxo estrangeiro (Dados de Mercado)', `
        <div>${flowBadge}</div>
        <div class=\"small muted\" style=\"margin-top:10px\">Arquivo: <span class=\"mono\">${escapeHtml(fmt(flow.mtime_fmt || '-'))}</span> • <span class=\"mono\">${escapeHtml(fmt(flow.path || ''))}</span></div>
        <div style=\"margin-top:10px\">${hrow('Fonte', (flow.source && flow.source.url) || '-')}</div>
        <div style=\"margin-top:6px\">${hrow('Fonte atualizado', (flow.source && (flow.source.updatedAtText || flow.source.updatedAt)) || '-')}</div>
        <div style=\"margin-top:6px\">${hrow('Último dia', (flow.latest && flow.latest.date) || '-')}</div>
        <div style=\"margin-top:6px\">${hrow('Estrangeiro (último dia)', (flow.latest && flow.latest.foreigners) !== undefined ? flow.latest.foreigners : '-')}</div>
      `, 'third'),

      card('TradingView (fechamentos)', `
        <div>${tvBadge}</div>
        <div class=\"small muted\" style=\"margin-top:10px\">Arquivo: <span class=\"mono\">${escapeHtml(fmt(tv.mtime_fmt || '-'))}</span> • <span class=\"mono\">${escapeHtml(fmt(tv.path || ''))}</span></div>
        <div style=\"margin-top:10px\">${hrow('AUTO_BARCHART_LAST_SLOT_ISO', tv.last_slot_iso || '-')}</div>
        <div style=\"margin-top:6px\">${hrow('WDO_SPOT', tv.wdo_spot || '-')}</div>
        <div style=\"margin-top:6px\">${hrow('WIN_SCALING_INDEX_REF_CLOSE', tv.win_scaling_index_ref_close || '-')}</div>
        <div style=\"margin-top:6px\">${hrow('WIN_SCALING_EWZ_REF_CLOSE', tv.win_scaling_ewz_ref_close || '-')}</div>
      `, 'third'),

      card('Sina (minério DCE_I0)', `
        <div>${sinaBadge}</div>
        <div class=\"small muted\" style=\"margin-top:10px\">Fonte: <span class=\"mono\">https://hq.sinajs.cn</span> • Série: <span class=\"mono\">DCE_I0</span></div>
        <div style=\"margin-top:10px\">${hrow('Último carimbo (asOf/t)', sinaTs || '-')}</div>
        <div style=\"margin-top:6px\">${hrow('Preço', (sinaLast && sinaLast.price) !== undefined ? sinaLast.price : '-')}</div>
        <div style=\"margin-top:6px\">${hrow('Variação %', (sinaLast && sinaLast.changePct) !== undefined ? sinaLast.changePct : '-')}</div>
      `, 'third'),

      card('Yahoo Auditoria (faltantes)', `
        <div>${auditBadge}</div>
        <div class=\"small muted\" style=\"margin-top:10px\">Arquivo: <span class=\"mono\">${escapeHtml(fmt((audit && audit.mtime_fmt) || '-'))}</span> • <span class=\"mono\">${escapeHtml(fmt((audit && audit.path) || ''))}</span></div>
        ${auditRows.length ? table(['Asset', 'Categoria', 'Yahoo', 'Motivo'], auditRows) : `<div class=\"small muted\" style=\"margin-top:10px\">Sem faltantes na auditoria.</div>`}
      `),

      card('Logs recentes', `
        <div class=\"k\">Opções</div>
        ${table(['Data/hora', 'Arquivo', 'Caminho'], optLogs)}
        <div class=\"k\" style=\"margin-top:14px\">Cotações</div>
        ${table(['Data/hora', 'Arquivo', 'Caminho'], cotLogs)}
      `),
    ].join('');
  </script>
</body>
</html>"""
        safe_json = data_json.replace("</", "<\\/")
        html = html_tpl.replace("__DATA_JSON__", safe_json)
        out_path.write_text(html, encoding="utf-8")
    except Exception:
        return


def find_npm_cmd() -> str | None:
    npm = shutil.which("npm")
    if npm:
        return npm
    pf = os.environ.get("ProgramFiles", r"C:\Program Files")
    pfx86 = os.environ.get("ProgramFiles(x86)", r"C:\Program Files (x86)")
    candidates = [
        os.path.join(pf, "nodejs", "npm.cmd"),
        os.path.join(pfx86, "nodejs", "npm.cmd"),
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    return None


def post_json(url: str, payload: dict, timeout_sec: float = 3.0) -> tuple[int | None, str]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url=url,
        method="POST",
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
            raw = resp.read()
            return int(getattr(resp, "status", 200)), raw.decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        raw = e.read()
        return int(getattr(e, "code", 0) or 0), raw.decode("utf-8", errors="replace")
    except Exception as e:
        return None, str(e)


def get_json(url: str, timeout_sec: float = 3.0) -> tuple[int | None, dict | None, str]:
    req = urllib.request.Request(url=url, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
            try:
                obj = json.loads(raw)
            except Exception:
                obj = None
            return int(getattr(resp, "status", 200)), obj if isinstance(obj, dict) else None, raw
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            obj = json.loads(raw)
        except Exception:
            obj = None
        return int(getattr(e, "code", 0) or 0), obj if isinstance(obj, dict) else None, raw
    except Exception as e:
        return None, None, str(e)


def read_tail_text(path: Path, max_bytes: int = 240_000) -> str:
    try:
        with open(path, "rb") as f:
            try:
                f.seek(0, os.SEEK_END)
                size = f.tell()
                start = max(0, size - max_bytes)
                f.seek(start, os.SEEK_SET)
            except Exception:
                pass
            raw = f.read()
        return raw.decode("utf-8", errors="replace")
    except Exception:
        return ""


def parse_git_sync_status_from_log_text(text: str) -> tuple[str, str | None]:
    if not text:
        return "unknown", None
    status = "unknown"
    commit_line = None
    for line in text.splitlines():
        if "GIT_SYNC status=" in line:
            try:
                after = line.split("GIT_SYNC status=", 1)[1]
                raw = after.strip().split()[0].strip()
                if raw:
                    status = raw
                    continue
            except Exception:
                pass
        if line.startswith("GIT_SYNC pushed"):
            status = "pushed"
        if line.startswith("GIT_SYNC committed"):
            if status == "unknown":
                status = "committed"
        if line.startswith("GIT_SYNC error"):
            status = "failed"
        if "GIT_SYNC skip • no changes" in line:
            status = "no_changes"
        if "GIT_SYNC skip • index has staged changes" in line:
            status = "index_has_changes"
        if "GIT_SYNC skip • repo not found" in line:
            status = "repo_missing"
        if line.startswith("[") and " files changed" in line:
            commit_line = line.strip()
    return status, commit_line


def parse_options_git_status_from_log_text(text: str) -> str:
    if not text:
        return "unknown"
    for line in text.splitlines():
        s = line.strip()
        if "GIT_SYNC status=" in s:
            try:
                after = s.split("GIT_SYNC status=", 1)[1]
                raw = after.strip().split()[0].strip()
                if raw:
                    return raw
            except Exception:
                pass
        if s == "Git push OK.":
            return "pushed"
        if s.startswith("Git push FALHOU"):
            return "failed"
        if s == "Git: nenhuma alteração para enviar.":
            return "no_changes"
        if s == "Git: repositório inválido. Pulei o envio.":
            return "repo_invalid"
        if s == "Git: comando não encontrado. Pulei o envio.":
            return "git_not_found"
        if s == "Git push desabilitado (ENABLE_AUTO_GIT_PUSH != true).":
            return "disabled"
    return "unknown"


def log_options_last_update(state: dict) -> None:
    finished = state.get("last_options_finished_iso") or "-"
    slot = state.get("last_run_scheduled_iso") or "-"
    exit_code = state.get("last_options_exit_code")
    exit_str = str(exit_code) if exit_code is not None else "-"
    git_st = state.get("last_options_git_status") or "-"
    wdo = state.get("last_options_wdo_last_updated") or "-"
    win = state.get("last_options_win_last_updated") or "-"
    log(f"Opções: última execução(slot={slot}) • finishedAt={finished} • exit={exit_str} • git={git_st} • WDO={wdo} • WIN={win}")


def read_json_file(path: Path) -> dict | None:
    try:
        raw = path.read_text(encoding="utf-8", errors="replace")
        obj = json.loads(raw)
        return obj if isinstance(obj, dict) else None
    except Exception:
        return None


def parse_options_last_updated(v: object) -> datetime | None:
    if not isinstance(v, str):
        return None
    s = v.strip()
    if not s:
        return None
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M"):
        try:
            return datetime.strptime(s, fmt)
        except Exception:
            pass
    try:
        return datetime.fromisoformat(s)
    except Exception:
        return None


def summarize_options_dashboard_market_data(cfg: ServiceConfig) -> dict:
    base = cfg.root_dir / "B3_System" / "dashboard_unificado"
    out: dict = {"ok": False}
    wdo_path = base / "WDO" / "assets" / "data" / "market_data.json"
    win_path = base / "WIN" / "assets" / "data" / "market_data.json"
    wdo_obj = read_json_file(wdo_path) if wdo_path.exists() else None
    win_obj = read_json_file(win_path) if win_path.exists() else None
    wdo_last = (wdo_obj or {}).get("last_updated") if isinstance(wdo_obj, dict) else None
    win_last = (win_obj or {}).get("last_updated") if isinstance(win_obj, dict) else None
    out["ok"] = True
    out["wdo_last_updated"] = wdo_last
    out["win_last_updated"] = win_last
    out["wdo_path"] = str(wdo_path)
    out["win_path"] = str(win_path)
    out["wdo_mtime"] = wdo_path.stat().st_mtime if wdo_path.exists() else None
    out["win_mtime"] = win_path.stat().st_mtime if win_path.exists() else None
    return out


def market_status_url(cfg: ServiceConfig) -> str:
    return f"http://{cfg.market_host}:{cfg.market_port}/api/market/status"


def summarize_cotacoes_from_status(cfg: ServiceConfig) -> dict:
    status_code, obj, raw = get_json(market_status_url(cfg))
    if status_code is None or not obj:
        return {"ok": False, "error": raw}
    state_raw = obj.get("state")
    state = state_raw if isinstance(state_raw, dict) else {}
    schedule_raw = obj.get("schedule")
    schedule = schedule_raw if isinstance(schedule_raw, dict) else {}
    current_raw = state.get("current")
    current = current_raw if isinstance(current_raw, dict) else {}
    last_raw = state.get("last")
    last = last_raw if isinstance(last_raw, dict) else {}
    current_summary_raw = current.get("summary")
    current_summary = current_summary_raw if isinstance(current_summary_raw, dict) else {}
    last_summary_raw = last.get("summary")
    last_summary = last_summary_raw if isinstance(last_summary_raw, dict) else {}
    return {
        "ok": True,
        "running": bool(state.get("running")),
        "current_startedAt": current.get("startedAt"),
        "current_logPath": current.get("logPath"),
        "current_finishedAt": current_summary.get("finishedAt"),
        "last_startedAt": last.get("startedAt") or schedule.get("lastUpdateStartedAt"),
        "last_finishedAt": last.get("finishedAt") or last_summary.get("finishedAt"),
        "last_logPath": last.get("logPath"),
        "nextDueAt": schedule.get("nextDueAt"),
    }


def log_cotacoes_last_update(cfg: ServiceConfig, state: dict) -> None:
    info = summarize_cotacoes_from_status(cfg)
    if not info.get("ok"):
        last = state.get("last_cotacoes_finished_iso") or "-"
        git_st = state.get("last_cotacoes_git_status") or "-"
        log(f"Cotações: última execução={last} | git={git_st} (status indisponível)")
        return

    running = bool(info.get("running"))
    last_finished = info.get("last_finishedAt") or info.get("current_finishedAt") or "-"
    log_path = info.get("last_logPath") or info.get("current_logPath")

    git_status = state.get("last_cotacoes_git_status") or "unknown"
    commit_line = None
    if isinstance(log_path, str) and log_path:
        p = Path(log_path)
        if p.exists():
            git_status, commit_line = parse_git_sync_status_from_log_text(read_tail_text(p))
            state["last_cotacoes_log_path"] = str(p)
            state["last_cotacoes_git_status"] = git_status
            if last_finished != "-":
                state["last_cotacoes_finished_iso"] = str(last_finished)

    if running:
        log(f"Cotações: em execução • startedAt={info.get('current_startedAt') or '-'} • nextDueAt={info.get('nextDueAt') or '-'}")
    else:
        base = f"Cotações: última execução={last_finished} | git={git_status}"
        if commit_line:
            base += f" | {commit_line}"
        log(base)


def monitor_cotacoes_until_done(cfg: ServiceConfig, expected_log_path: str | None, state: dict) -> None:
    deadline = time.time() + 25 * 60
    last_running = True
    while time.time() < deadline:
        info = summarize_cotacoes_from_status(cfg)
        if not info.get("ok"):
            time.sleep(5.0)
            continue
        running = bool(info.get("running"))
        cur_log = info.get("current_logPath")
        if expected_log_path and isinstance(cur_log, str) and cur_log and cur_log != expected_log_path and running:
            expected_log_path = cur_log
        if last_running and not running:
            log_cotacoes_last_update(cfg, state)
            try:
                save_state(cfg.state_path, state)
            except Exception:
                pass
            write_controle_de_dados_html(cfg, state)
            return
        last_running = running
        time.sleep(5.0)
    log("AVISO: Cotações: timeout ao aguardar finalização do update.")


def force_market_update(cfg: ServiceConfig, state: dict) -> None:
    url = f"http://{cfg.market_host}:{cfg.market_port}/api/market/update"
    status, body = post_json(url, {"reason": "schedule"})
    if status == 202:
        log("Cotações: update disparado (schedule).")
        _, obj, _ = get_json(market_status_url(cfg))
        expected_log = None
        try:
            state_obj = obj.get("state") if isinstance(obj, dict) else {}
            cur = state_obj.get("current") if isinstance(state_obj, dict) else {}
            expected_log = cur.get("logPath") if isinstance(cur, dict) else None
        except Exception:
            expected_log = None
        t = threading.Thread(
            target=monitor_cotacoes_until_done,
            args=(cfg, expected_log, state),
            daemon=True,
        )
        t.start()
        return
    if status == 409:
        log("Cotações: update já em execução (409).")
        _, obj, _ = get_json(market_status_url(cfg))
        expected_log = None
        try:
            state_obj = obj.get("state") if isinstance(obj, dict) else {}
            cur = state_obj.get("current") if isinstance(state_obj, dict) else {}
            expected_log = cur.get("logPath") if isinstance(cur, dict) else None
        except Exception:
            expected_log = None
        t = threading.Thread(
            target=monitor_cotacoes_until_done,
            args=(cfg, expected_log, state),
            daemon=True,
        )
        t.start()
        return
    if status is None:
        log(f"AVISO: não consegui disparar update em {url}: {body}")
        return
    log(f"AVISO: update não foi aceito (HTTP {status}) | resp={body[:300]}")


def shutdown_cotacoes(cfg: ServiceConfig, timeout_sec: float = 35.0) -> bool:
    url = f"http://{cfg.market_host}:{cfg.market_port}/api/market/shutdown"
    status, body = post_json(url, {})
    if status == 202:
        log("Cotações: encerramento solicitado (shutdown).")
    else:
        if status is None:
            log(f"AVISO: não consegui solicitar shutdown em {url}: {body}")
        else:
            log(f"AVISO: shutdown não foi aceito (HTTP {status}) | resp={body[:300]}")

    deadline = time.time() + max(5.0, timeout_sec)
    while time.time() < deadline:
        if not is_port_open(cfg.market_host, cfg.market_port):
            log("Cotações: serviço encerrado.")
            return True
        try:
            time.sleep(0.5)
        except KeyboardInterrupt:
            log("Cotações: interrupção durante shutdown (Ctrl+C).")
            return False
    if os.name != "nt":
        log("AVISO: Cotações: timeout aguardando encerramento do serviço.")
        return False

    try:
        out = subprocess.check_output(["netstat", "-ano", "-p", "tcp"], text=True, encoding="utf-8", errors="replace")
        pids: set[int] = set()
        for line in out.splitlines():
            s = line.strip()
            if not s:
                continue
            if f":{cfg.market_port} " not in s and f":{cfg.market_port}\r" not in s:
                continue
            if "LISTENING" not in s.upper():
                continue
            parts = s.split()
            if not parts:
                continue
            try:
                pid = int(parts[-1])
            except Exception:
                continue
            if pid > 0:
                pids.add(pid)
        if not pids:
            log("AVISO: Cotações: não encontrei PID do listener para encerrar.")
            return False
        for pid in sorted(pids):
            subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(0.8)
        if not is_port_open(cfg.market_host, cfg.market_port):
            log("Cotações: serviço encerrado (forçado por PID na porta).")
            return True
    except Exception:
        pass

    log("AVISO: Cotações: não consegui encerrar o serviço.")
    return False


def install_windows_close_handler(cfg: ServiceConfig) -> None:
    if os.name != "nt":
        return
    try:
        import ctypes

        CTRL_C_EVENT = 0
        CTRL_BREAK_EVENT = 1
        CTRL_CLOSE_EVENT = 2
        CTRL_LOGOFF_EVENT = 5
        CTRL_SHUTDOWN_EVENT = 6

        handler_type = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_uint)

        def _handler(ctrl_type: int) -> bool:
            if ctrl_type in (CTRL_CLOSE_EVENT, CTRL_LOGOFF_EVENT, CTRL_SHUTDOWN_EVENT):
                try:
                    shutdown_cotacoes(cfg, timeout_sec=3.0)
                except Exception:
                    pass
            return False

        cb = handler_type(_handler)
        ctypes.windll.kernel32.SetConsoleCtrlHandler(cb, True)
        globals()["_edi_win_ctrl_handler"] = cb
    except Exception:
        return


def start_market_service_background(cfg: ServiceConfig) -> bool:
    npm = find_npm_cmd()
    if not npm:
        log("AVISO: npm não encontrado; não consegui iniciar o market:service em background.")
        return False

    cot_dir = cfg.cotacoes_bat.parent
    cfg.logs_dir.mkdir(parents=True, exist_ok=True)
    stamp = now_local().strftime("%Y%m%d_%H%M%S")
    log_path = cfg.logs_dir / f"cotacoes_market_service_{stamp}.log"

    env = dict(os.environ)
    env["MARKET_SERVICE_HOST"] = cfg.market_host
    env["MARKET_SERVICE_PORT"] = str(cfg.market_port)
    env["MARKET_GIT_SYNC_ENABLED"] = "true"
    env["MARKET_GIT_SYNC_PUSH"] = "true"

    tsx_cmd = cot_dir / "node_modules" / ".bin" / "tsx.cmd"
    if os.name == "nt" and not tsx_cmd.exists():
        ci_log = cfg.logs_dir / f"cotacoes_npm_ci_{stamp}.log"
        log("Cotações: dependências ausentes; rodando npm ci...")
        res = subprocess.run(
            [npm, "ci", "--silent"],
            cwd=str(cot_dir),
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        ci_log.write_text(res.stdout or "", encoding="utf-8", errors="replace")
        if res.returncode != 0:
            log(f"AVISO: npm ci falhou; log={ci_log}")
            return False

    try:
        with open(log_path, "w", encoding="utf-8", errors="replace") as f:
            proc = subprocess.Popen(
                [npm, "run", "-s", "market:service"],
                cwd=str(cot_dir),
                env=env,
                stdout=f,
                stderr=subprocess.STDOUT,
            )
        log(f"Cotações: market:service iniciado em background (pid={proc.pid}) | log={log_path}")
        return True
    except Exception as e:
        log(f"AVISO: falha ao iniciar market:service em background: {e}")
        return False


def ensure_cotacoes_service_running(cfg: ServiceConfig, state: dict) -> None:
    if is_port_open(cfg.market_host, cfg.market_port):
        log(f"Cotações já estava rodando (porta {cfg.market_port}). Reiniciando em janela para facilitar o encerramento.")
        log_cotacoes_last_update(cfg, state)
        save_state(cfg.state_path, state)
        shutdown_cotacoes(cfg)

    if not cfg.cotacoes_bat.exists():
        log(f"AVISO: não encontrei {cfg.cotacoes_bat}")
        return

    log("Iniciando Cotações (market:service)...")
    try:
        env = dict(os.environ)
        env["MARKET_SERVICE_HOST"] = cfg.market_host
        env["MARKET_SERVICE_PORT"] = str(cfg.market_port)
        env["MARKET_GIT_SYNC_ENABLED"] = "true"
        env["MARKET_GIT_SYNC_PUSH"] = "true"
        if os.name == "nt":
            try:
                work_dir = str(cfg.cotacoes_bat.parent)
                creationflags = getattr(subprocess, "CREATE_NEW_CONSOLE", 0)
                subprocess.Popen(
                    ["cmd.exe", "/k", "title EDI Cotações & call Atualizar_Dados_Mercado.bat"],
                    cwd=work_dir,
                    env=env,
                    creationflags=creationflags,
                )
            except Exception:
                os.startfile(cfg.cotacoes_bat)  # type: ignore[attr-defined]
        else:
            subprocess.Popen([str(cfg.cotacoes_bat)], cwd=str(cfg.cotacoes_bat.parent), env=env)
    except Exception as e:
        log(f"AVISO: falha ao iniciar Cotações: {e}")
        return

    for i in range(240):
        if is_port_open(cfg.market_host, cfg.market_port, timeout_sec=0.25):
            log("Cotações iniciado com sucesso.")
            force_market_update(cfg, state)
            return
        if i == 40:
            log("Aguardando Cotações iniciar... (npm pode demorar na primeira vez)")
        time.sleep(0.5)
    log("AVISO: Cotações ainda não respondeu na porta esperada. Verifique a janela 'EDI Cotações' para erros.")


def run_options(cfg: ServiceConfig, scheduled_slot: datetime) -> tuple[int, Path]:
    cfg.logs_dir.mkdir(parents=True, exist_ok=True)
    stamp = now_local().strftime("%Y%m%d_%H%M%S")
    log_path = cfg.logs_dir / f"options_{stamp}.log"
    python_exe = sys.executable
    if getattr(sys, "frozen", False):
        python_exe = (os.environ.get("EDI_CHILD_PYTHON", "") or "").strip()
        if not python_exe:
            log("ERRO: executável (PyInstaller) não pode chamar scripts .py sem um Python externo. Configure EDI_CHILD_PYTHON apontando para python.exe.")
            return 2, log_path
    cmd = [python_exe, str(cfg.options_runner), "--log-file", str(log_path)]

    log(f"Rodando Opções (slot {scheduled_slot.strftime('%Y-%m-%d %H:%M')})...")
    log(f"cmd={' '.join(cmd)}")

    try:
        env = dict(os.environ)
        env["PYTHONIOENCODING"] = "utf-8"
        env["PYTHONUTF8"] = "1"
        env["EDI_SCHEDULE_SLOT_ISO"] = scheduled_slot.replace(second=0, microsecond=0).isoformat(timespec="minutes")
        proc = subprocess.Popen(
            cmd,
            cwd=str(cfg.root_dir),
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        assert proc.stdout is not None
        for line in proc.stdout:
            safe_stdout_write(line)
        code = int(proc.wait() or 0)
        log(f"Fim Opções: exit={code} | log={log_path}")
        return code, log_path
    except Exception as e:
        log(f"AVISO: falha ao executar Opções: {e}")
        return 1, log_path


def yahoo_uup_export_paths(cfg: ServiceConfig) -> tuple[Path, Path]:
    base = cfg.root_dir / "B3_System" / "Edi_OpenInterest - PY - Stranger - WDO"
    script_path = base / "yahoo_uup_options_export.py"
    cache_path = base / "dashboard_v1" / "assets" / "data" / "yahoo_uup_options.json"
    return script_path, cache_path


def run_yahoo_uup_export(cfg: ServiceConfig, scheduled_slot: datetime) -> tuple[int, Path, str | None]:
    cfg.logs_dir.mkdir(parents=True, exist_ok=True)
    stamp = now_local().strftime("%Y%m%d_%H%M%S")
    log_path = cfg.logs_dir / f"yahoo_uup_{stamp}.log"

    script_path, cache_path = yahoo_uup_export_paths(cfg)
    if not script_path.exists():
        log(f"AVISO: Yahoo UUP: não encontrei exportador: {script_path}")
        return 2, log_path, None

    python_exe = sys.executable
    if getattr(sys, "frozen", False):
        python_exe = (os.environ.get("EDI_CHILD_PYTHON", "") or "").strip()
        if not python_exe:
            log("AVISO: Yahoo UUP: pulando (faltando EDI_CHILD_PYTHON para rodar script .py).")
            return 2, log_path, None
    cmd = [python_exe, str(script_path)]
    log(f"Rodando Yahoo UUP (slot {scheduled_slot.strftime('%Y-%m-%d %H:%M')})...")
    log(f"cmd={' '.join(cmd)}")

    captured_at = None
    try:
        env = dict(os.environ)
        env["PYTHONIOENCODING"] = "utf-8"
        env["PYTHONUTF8"] = "1"
        with open(log_path, "w", encoding="utf-8", errors="replace") as out:
            proc = subprocess.Popen(
                cmd,
                cwd=str(cfg.root_dir),
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
            )
            assert proc.stdout is not None
            for line in proc.stdout:
                out.write(line)
                safe_stdout_write(line)
            code = int(proc.wait() or 0)

        obj = read_json_file(cache_path) if cache_path.exists() else None
        if isinstance(obj, dict):
            v = obj.get("captured_at_utc")
            captured_at = str(v) if isinstance(v, str) and v.strip() else None

        log(f"Fim Yahoo UUP: exit={code} | log={log_path} | captured_at_utc={captured_at or '-'}")
        return code, log_path, captured_at
    except Exception as e:
        log(f"AVISO: falha ao executar Yahoo UUP: {e}")
        return 1, log_path, None


def yahoo_usdu_export_paths(cfg: ServiceConfig) -> tuple[Path, Path]:
    base = cfg.root_dir / "B3_System" / "Edi_OpenInterest - PY - Stranger - WDO"
    script_path = base / "yahoo_uup_options_export.py"
    cache_path = base / "dashboard_v1" / "assets" / "data" / "yahoo_usdu_options.json"
    return script_path, cache_path


def run_yahoo_usdu_export(cfg: ServiceConfig, scheduled_slot: datetime) -> tuple[int, Path, str | None]:
    cfg.logs_dir.mkdir(parents=True, exist_ok=True)
    stamp = now_local().strftime("%Y%m%d_%H%M%S")
    log_path = cfg.logs_dir / f"yahoo_usdu_{stamp}.log"

    script_path, cache_path = yahoo_usdu_export_paths(cfg)
    if not script_path.exists():
        log(f"AVISO: Yahoo USDU: não encontrei exportador: {script_path}")
        return 2, log_path, None

    python_exe = sys.executable
    if getattr(sys, "frozen", False):
        python_exe = (os.environ.get("EDI_CHILD_PYTHON", "") or "").strip()
        if not python_exe:
            log("AVISO: Yahoo USDU: pulando (faltando EDI_CHILD_PYTHON para rodar script .py).")
            return 2, log_path, None
    cmd = [python_exe, str(script_path), "--proxy", "USDU"]
    log(f"Rodando Yahoo USDU (slot {scheduled_slot.strftime('%Y-%m-%d %H:%M')})...")
    log(f"cmd={' '.join(cmd)}")

    captured_at = None
    try:
        env = dict(os.environ)
        env["PYTHONIOENCODING"] = "utf-8"
        env["PYTHONUTF8"] = "1"
        with open(log_path, "w", encoding="utf-8", errors="replace") as out:
            proc = subprocess.Popen(
                cmd,
                cwd=str(cfg.root_dir),
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
            )
            assert proc.stdout is not None
            for line in proc.stdout:
                out.write(line)
                safe_stdout_write(line)
            code = int(proc.wait() or 0)

        obj = read_json_file(cache_path) if cache_path.exists() else None
        if isinstance(obj, dict):
            v = obj.get("captured_at_utc")
            captured_at = str(v) if isinstance(v, str) and v.strip() else None

        log(f"Fim Yahoo USDU: exit={code} | log={log_path} | captured_at_utc={captured_at or '-'}")
        return code, log_path, captured_at
    except Exception as e:
        log(f"AVISO: falha ao executar Yahoo USDU: {e}")
        return 1, log_path, None


def yahoo_ewz_export_paths(cfg: ServiceConfig) -> tuple[Path, Path]:
    wdo_base = cfg.root_dir / "B3_System" / "Edi_OpenInterest - PY - Stranger - WDO"
    script_path = wdo_base / "yahoo_uup_options_export.py"
    win_base = cfg.root_dir / "B3_System" / "Edi_OpenInterest - PY - Stranger - Indice"
    cache_path = win_base / "dashboard_v1" / "assets" / "data" / "yahoo_ewz_options.json"
    return script_path, cache_path


def run_yahoo_ewz_export(cfg: ServiceConfig, scheduled_slot: datetime) -> tuple[int, Path, str | None]:
    cfg.logs_dir.mkdir(parents=True, exist_ok=True)
    stamp = now_local().strftime("%Y%m%d_%H%M%S")
    log_path = cfg.logs_dir / f"yahoo_ewz_{stamp}.log"

    script_path, cache_path = yahoo_ewz_export_paths(cfg)
    if not script_path.exists():
        log(f"AVISO: Yahoo EWZ: não encontrei exportador: {script_path}")
        return 2, log_path, None

    python_exe = sys.executable
    if getattr(sys, "frozen", False):
        python_exe = (os.environ.get("EDI_CHILD_PYTHON", "") or "").strip()
        if not python_exe:
            log("AVISO: Yahoo EWZ: pulando (faltando EDI_CHILD_PYTHON para rodar script .py).")
            return 2, log_path, None
    cmd = [python_exe, str(script_path), "--target", "WIN", "--ticker", "EWZ"]
    log(f"Rodando Yahoo EWZ (slot {scheduled_slot.strftime('%Y-%m-%d %H:%M')})...")
    log(f"cmd={' '.join(cmd)}")

    captured_at = None
    try:
        env = dict(os.environ)
        env["PYTHONIOENCODING"] = "utf-8"
        env["PYTHONUTF8"] = "1"
        with open(log_path, "w", encoding="utf-8", errors="replace") as out:
            proc = subprocess.Popen(
                cmd,
                cwd=str(cfg.root_dir),
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
            )
            assert proc.stdout is not None
            for line in proc.stdout:
                out.write(line)
                safe_stdout_write(line)
            code = int(proc.wait() or 0)

        obj = read_json_file(cache_path) if cache_path.exists() else None
        if isinstance(obj, dict):
            v = obj.get("captured_at_utc")
            captured_at = str(v) if isinstance(v, str) and v.strip() else None

        log(f"Fim Yahoo EWZ: exit={code} | log={log_path} | captured_at_utc={captured_at or '-'}")
        return code, log_path, captured_at
    except Exception as e:
        log(f"AVISO: falha ao executar Yahoo EWZ: {e}")
        return 1, log_path, None


def resolve_config() -> ServiceConfig:
    root_env = (os.environ.get("EDI_ROOT_DIR", "") or "").strip()
    if root_env:
        p = Path(root_env).resolve()
        if p.exists():
            root = p
        else:
            root = Path(os.getcwd()).resolve()
    else:
        if getattr(sys, "frozen", False):
            root = Path(os.getcwd()).resolve()
        else:
            root = Path(__file__).resolve().parent
    host = (os.environ.get("MARKET_SERVICE_HOST", "") or "127.0.0.1").strip() or "127.0.0.1"
    port_raw = (os.environ.get("MARKET_SERVICE_PORT", "") or "3033").strip()
    try:
        port = int(port_raw)
    except Exception:
        port = 3033
    return ServiceConfig(
        root_dir=root,
        cotacoes_bat=root / "Cotacoes" / "Atualizar_Dados_Mercado.bat",
        options_runner=root / "rodar_automacao_total.py",
        logs_dir=root / LOGS_DIR_NAME,
        state_path=root / STATE_FILE_NAME,
        market_host=host,
        market_port=port,
    )


def main() -> int:
    if isinstance(sys.stdout, io.TextIOWrapper):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    if isinstance(sys.stderr, io.TextIOWrapper):
        try:
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    cfg = resolve_config()
    install_windows_close_handler(cfg)

    log("=== EDI Service (Opções + Cotações) ===")
    log(f"Root: {cfg.root_dir}")
    log("Agenda (Seg-Sex): " + " ".join(SCHEDULE_TIMES))

    if not cfg.options_runner.exists():
        log(f"ERRO: não encontrei {cfg.options_runner}")
        return 2

    state = load_state(cfg.state_path)
    removed_logs = prune_service_logs(cfg, state)
    if removed_logs:
        log(f"Limpeza: removidos {removed_logs} arquivos antigos em {cfg.logs_dir}")
    removed_pycache = prune_pycache(cfg.root_dir)
    if removed_pycache:
        log(f"Limpeza: removidos {removed_pycache} diretórios __pycache__")
    log_options_last_update(state)
    log_cotacoes_last_update(cfg, state)
    save_state(cfg.state_path, state)
    write_controle_de_dados_html(cfg, state)

    try:
        ensure_cotacoes_service_running(cfg, state)
    except KeyboardInterrupt:
        log("Encerrando Serviço Unificado (Ctrl+C)...")
        return 130

    last_run = datetime.min
    if state.get("last_run_scheduled_iso"):
        try:
            last_run = datetime.fromisoformat(state["last_run_scheduled_iso"])
        except Exception:
            last_run = datetime.min

    log(f"Estado: last_run_scheduled={state.get('last_run_scheduled_iso') or '-'}")
    argv = [a.strip().lower() for a in sys.argv[1:] if isinstance(a, str)]
    force_options_now = ("--options-now" in argv) or ("--opcoes-agora" in argv) or ("--opcoes-now" in argv)
    run_once = ("--once" in argv) or ("--run-once" in argv) or ("--uma-vez" in argv)
    if force_options_now:
        slot = now_local().replace(microsecond=0)
        log(f"Forçando Opções agora (slot={slot.isoformat()})...")
        run_started = now_local()
        code, log_path = run_options(cfg, slot)
        y_code, y_log_path, y_captured = run_yahoo_uup_export(cfg, slot)
        u_code, u_log_path, u_captured = run_yahoo_usdu_export(cfg, slot)
        e_code, e_log_path, e_captured = run_yahoo_ewz_export(cfg, slot)
        last_run = slot
        state["last_run_scheduled_iso"] = slot.isoformat()
        state["last_options_finished_iso"] = now_local().isoformat()
        state["last_options_exit_code"] = int(code or 0)
        state["last_options_log_path"] = str(log_path)
        state["last_options_git_status"] = parse_options_git_status_from_log_text(read_tail_text(log_path))
        state["last_yahoo_uup_finished_iso"] = now_local().isoformat()
        state["last_yahoo_uup_exit_code"] = int(y_code or 0)
        state["last_yahoo_uup_log_path"] = str(y_log_path)
        state["last_yahoo_uup_captured_at_utc"] = y_captured or "-"
        state["last_yahoo_usdu_finished_iso"] = now_local().isoformat()
        state["last_yahoo_usdu_exit_code"] = int(u_code or 0)
        state["last_yahoo_usdu_log_path"] = str(u_log_path)
        state["last_yahoo_usdu_captured_at_utc"] = u_captured or "-"
        state["last_yahoo_ewz_finished_iso"] = now_local().isoformat()
        state["last_yahoo_ewz_exit_code"] = int(e_code or 0)
        state["last_yahoo_ewz_log_path"] = str(e_log_path)
        state["last_yahoo_ewz_captured_at_utc"] = e_captured or "-"
        info = summarize_options_dashboard_market_data(cfg)
        if info.get("ok"):
            wdo_last = info.get("wdo_last_updated") or "-"
            win_last = info.get("win_last_updated") or "-"
            state["last_options_wdo_last_updated"] = str(wdo_last)
            state["last_options_win_last_updated"] = str(win_last)
            wdo_dt = parse_options_last_updated(wdo_last)
            win_dt = parse_options_last_updated(win_last)
            if wdo_dt and (run_started - wdo_dt).total_seconds() > 30 * 60:
                log(f"AVISO: Opções: WDO parece desatualizado (last_updated={wdo_last}).")
            if win_dt and (run_started - win_dt).total_seconds() > 30 * 60:
                log(f"AVISO: Opções: WIN parece desatualizado (last_updated={win_last}).")
            log(f"Opções: dados no dashboard_unificado • WDO last_updated={wdo_last} • WIN last_updated={win_last}")
        save_state(cfg.state_path, state)
        log_options_last_update(state)
        write_controle_de_dados_html(cfg, state)
        if run_once:
            return 0
    elif run_once:
        ts = now_local()
        due = latest_due_slot(ts, last_run)
        if due is None:
            nxt = next_future_slot(ts)
            log(f"Nenhum slot pendente agora. Próximo slot: {nxt.strftime('%Y-%m-%d %H:%M')}")
            write_controle_de_dados_html(cfg, state)
            return 0
        run_started = now_local()
        code, log_path = run_options(cfg, due)
        y_code, y_log_path, y_captured = run_yahoo_uup_export(cfg, due)
        u_code, u_log_path, u_captured = run_yahoo_usdu_export(cfg, due)
        e_code, e_log_path, e_captured = run_yahoo_ewz_export(cfg, due)
        last_run = due
        state["last_run_scheduled_iso"] = due.isoformat()
        state["last_options_finished_iso"] = now_local().isoformat()
        state["last_options_exit_code"] = int(code or 0)
        state["last_options_log_path"] = str(log_path)
        state["last_options_git_status"] = parse_options_git_status_from_log_text(read_tail_text(log_path))
        state["last_yahoo_uup_finished_iso"] = now_local().isoformat()
        state["last_yahoo_uup_exit_code"] = int(y_code or 0)
        state["last_yahoo_uup_log_path"] = str(y_log_path)
        state["last_yahoo_uup_captured_at_utc"] = y_captured or "-"
        state["last_yahoo_usdu_finished_iso"] = now_local().isoformat()
        state["last_yahoo_usdu_exit_code"] = int(u_code or 0)
        state["last_yahoo_usdu_log_path"] = str(u_log_path)
        state["last_yahoo_usdu_captured_at_utc"] = u_captured or "-"
        state["last_yahoo_ewz_finished_iso"] = now_local().isoformat()
        state["last_yahoo_ewz_exit_code"] = int(e_code or 0)
        state["last_yahoo_ewz_log_path"] = str(e_log_path)
        state["last_yahoo_ewz_captured_at_utc"] = e_captured or "-"
        info = summarize_options_dashboard_market_data(cfg)
        if info.get("ok"):
            wdo_last = info.get("wdo_last_updated") or "-"
            win_last = info.get("win_last_updated") or "-"
            state["last_options_wdo_last_updated"] = str(wdo_last)
            state["last_options_win_last_updated"] = str(win_last)
            wdo_dt = parse_options_last_updated(wdo_last)
            win_dt = parse_options_last_updated(win_last)
            if wdo_dt and (run_started - wdo_dt).total_seconds() > 30 * 60:
                log(f"AVISO: Opções: WDO parece desatualizado (last_updated={wdo_last}).")
            if win_dt and (run_started - win_dt).total_seconds() > 30 * 60:
                log(f"AVISO: Opções: WIN parece desatualizado (last_updated={win_last}).")
            log(f"Opções: dados no dashboard_unificado • WDO last_updated={wdo_last} • WIN last_updated={win_last}")
        save_state(cfg.state_path, state)
        log_options_last_update(state)
        write_controle_de_dados_html(cfg, state)
        return 0 if int(code or 0) == 0 else 1

    try:
        while True:
            ts = now_local()

            due = latest_due_slot(ts, last_run)
            if due is not None:
                run_started = now_local()
                code, log_path = run_options(cfg, due)
                y_code, y_log_path, y_captured = run_yahoo_uup_export(cfg, due)
                u_code, u_log_path, u_captured = run_yahoo_usdu_export(cfg, due)
                e_code, e_log_path, e_captured = run_yahoo_ewz_export(cfg, due)
                last_run = due
                state["last_run_scheduled_iso"] = due.isoformat()
                state["last_options_finished_iso"] = now_local().isoformat()
                state["last_options_exit_code"] = int(code or 0)
                state["last_options_log_path"] = str(log_path)
                state["last_options_git_status"] = parse_options_git_status_from_log_text(read_tail_text(log_path))
                state["last_yahoo_uup_finished_iso"] = now_local().isoformat()
                state["last_yahoo_uup_exit_code"] = int(y_code or 0)
                state["last_yahoo_uup_log_path"] = str(y_log_path)
                state["last_yahoo_uup_captured_at_utc"] = y_captured or "-"
                state["last_yahoo_usdu_finished_iso"] = now_local().isoformat()
                state["last_yahoo_usdu_exit_code"] = int(u_code or 0)
                state["last_yahoo_usdu_log_path"] = str(u_log_path)
                state["last_yahoo_usdu_captured_at_utc"] = u_captured or "-"
                state["last_yahoo_ewz_finished_iso"] = now_local().isoformat()
                state["last_yahoo_ewz_exit_code"] = int(e_code or 0)
                state["last_yahoo_ewz_log_path"] = str(e_log_path)
                state["last_yahoo_ewz_captured_at_utc"] = e_captured or "-"
                info = summarize_options_dashboard_market_data(cfg)
                if info.get("ok"):
                    wdo_last = info.get("wdo_last_updated") or "-"
                    win_last = info.get("win_last_updated") or "-"
                    state["last_options_wdo_last_updated"] = str(wdo_last)
                    state["last_options_win_last_updated"] = str(win_last)
                    wdo_dt = parse_options_last_updated(wdo_last)
                    win_dt = parse_options_last_updated(win_last)
                    if wdo_dt and (run_started - wdo_dt).total_seconds() > 30 * 60:
                        log(f"AVISO: Opções: WDO parece desatualizado (last_updated={wdo_last}).")
                    if win_dt and (run_started - win_dt).total_seconds() > 30 * 60:
                        log(f"AVISO: Opções: WIN parece desatualizado (last_updated={win_last}).")
                    log(f"Opções: dados no dashboard_unificado • WDO last_updated={wdo_last} • WIN last_updated={win_last}")
                save_state(cfg.state_path, state)
                log_options_last_update(state)
                write_controle_de_dados_html(cfg, state)
                continue

            expected_slot = latest_scheduled_slot_at_or_before(ts)
            if expected_slot is not None:
                expected_iso = expected_slot.replace(second=0, microsecond=0).isoformat(timespec="minutes")
                last_barchart_iso = get_barchart_last_slot_iso(cfg)
                if last_barchart_iso != expected_iso:
                    last_attempt = None
                    try:
                        raw_attempt = state.get("last_barchart_force_attempt_iso")
                        if isinstance(raw_attempt, str) and raw_attempt:
                            last_attempt = datetime.fromisoformat(raw_attempt)
                    except Exception:
                        last_attempt = None
                    retry_backoff_min = int(os.environ.get("BARCHART_FORCE_RETRY_MINUTES", "15") or "15")
                    if last_attempt is None or (ts - last_attempt).total_seconds() >= float(retry_backoff_min) * 60.0:
                        log(
                            "Barchart: slot desatualizado"
                            f" (último={last_barchart_iso or '-'} esperado={expected_iso})."
                            " Forçando atualização no próximo loop.",
                        )
                        state["last_barchart_force_attempt_iso"] = ts.replace(microsecond=0).isoformat()
                        try:
                            save_state(cfg.state_path, state)
                        except Exception:
                            pass
                        last_run = min(last_run, expected_slot - timedelta(seconds=1))
                        continue

            nxt = next_future_slot(ts)
            sleep_sec = max(5.0, (nxt - ts).total_seconds())
            log(f"Próxima execução: {nxt.strftime('%Y-%m-%d %H:%M')} (sleep {int(sleep_sec)}s)")
            write_controle_de_dados_html(cfg, state)
            time.sleep(sleep_sec)
    except KeyboardInterrupt:
        log("Encerrando Serviço Unificado (Ctrl+C)...")
        return 130
    finally:
        try:
            shutdown_cotacoes(cfg)
        except Exception:
            pass


if __name__ == "__main__":
    raise SystemExit(main())
