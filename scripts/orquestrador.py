"""
EDI Market Guardian — Orquestrador Unificado.

Consolida Servico_Unificado.bat e Servico_Unificado_FORCE.bat em um único
script Python com CLI, logging estruturado e todas as funcionalidades.

Uso:
    python scripts/orquestrador.py                    # Modo daemon
    python scripts/orquestrador.py --once             # Roda uma vez e sai
    python scripts/orquestrador.py --force            # FORCE: tudo, push, shutdown
    python scripts/orquestrador.py --git-dry-run      # Mostra status git
    python scripts/orquestrador.py --no-pause         # Pula pause no fim
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import shutil
import signal
import socket
import subprocess
import sys
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime, date
from pathlib import Path
from typing import Any

try:
    import requests
except ImportError:
    requests = None  # type: ignore[assignment]

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logger = logging.getLogger("orquestrador")


def _setup_logging() -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.DEBUG)
    fmt = logging.Formatter("[%(asctime)s] %(levelname)s %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
    handler.setFormatter(fmt)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

@dataclass
class Config:
    root_dir: Path = field(default_factory=Path.cwd)
    py_cmd: str = "python"
    market_host: str = "127.0.0.1"
    market_port: int = 3033
    market_interval_minutes: int = 5
    investing_portfolio_interval_minutes: int = 15
    market_update_mode: str = "once"
    market_schedule_mode: str = "interval"
    market_retention_days: int = 5
    market_scheduler_enabled: bool = True
    market_run_on_start: bool = True
    market_yahoo_enabled: bool = True
    market_yahoo_max_symbols: int = 320
    market_yahoo_timeout_ms: int = 8000
    investing_portfolio_enabled: bool = True
    investing_calendar_enabled: bool = True
    infomoney_di_enabled: bool = True
    dotenv_override: bool = False
    market_git_sync_enabled: bool = True
    market_git_sync_push: bool = True
    market_git_sync_branch: str = "main"
    options_run_times: str = "07:00,08:30,18:10,20:00"
    options_run_weekdays_only: bool = True
    options_lock_max_age_minutes: int = 240
    wdo_candidate_contract_months: int = 60
    enable_auto_git_push: bool = True
    unified_git_push_handled: bool = True
    edi_git_validate_strict: bool = True
    edi_artifacts_branch: str = ""
    opcões_interval_seconds: int = 60
    cotacoes_dir: Path = field(default_factory=lambda: Path.cwd / "Cotacoes")
    auto_b3_dir: Path = field(default_factory=lambda: Path.cwd / "Auto_B3_System")
    dashboard_unificado_dir: Path = field(default_factory=lambda: Path.cwd / "dashboard_unificado")
    locks_dir: Path = field(default_factory=lambda: Path.cwd / "service_locks")
    csv_indice_dir: Path = field(default_factory=lambda: Path.cwd)
    csv_dolar_dir: Path = field(default_factory=lambda: Path.cwd)

    @classmethod
    def from_env(cls, root_dir: Path) -> "Config":
        def _env(name: str, default: Any) -> Any:
            raw = os.getenv(name, "").strip()
            if not raw:
                return default
            return raw

        def _env_int(name: str, default: int) -> int:
            raw = os.getenv(name, "").strip()
            if not raw:
                return default
            try:
                return int(raw)
            except ValueError:
                return default

        def _env_bool(name: str, default: bool) -> bool:
            raw = os.getenv(name, "").strip().lower()
            if not raw:
                return default
            return raw in {"1", "true", "yes", "y", "on"}

        cotacoes_dir = root_dir / "Cotacoes"
        auto_b3_dir = root_dir / "Auto_B3_System"
        dashboard_dir = root_dir / "dashboard_unificado"
        locks_dir = root_dir / "service_locks"

        csv_indice_dir = root_dir
        if (auto_b3_dir / "CSV_Indice").exists() and list((auto_b3_dir / "CSV_Indice").glob("*.csv")):
            csv_indice_dir = auto_b3_dir / "CSV_Indice"
        elif (root_dir / "CSV_Indice").exists() and list((root_dir / "CSV_Indice").glob("*.csv")):
            csv_indice_dir = root_dir / "CSV_Indice"

        csv_dolar_dir = root_dir
        if (auto_b3_dir / "CSV_Dolar").exists() and list((auto_b3_dir / "CSV_Dolar").glob("*.csv")):
            csv_dolar_dir = auto_b3_dir / "CSV_Dolar"

        branch = _env("MARKET_GIT_SYNC_BRANCH", "main")
        artifacts_branch = _env("EDI_ARTIFACTS_BRANCH", "")
        git_sync_enabled = True
        git_sync_push = True
        if artifacts_branch:
            git_sync_enabled = False
            git_sync_push = False

        cfg = cls(
            root_dir=root_dir,
            market_host=_env("MARKET_SERVICE_HOST", "127.0.0.1"),
            market_port=_env_int("MARKET_SERVICE_PORT", 3033),
            market_interval_minutes=_env_int("MARKET_INTERVAL_MINUTES", 5),
            investing_portfolio_interval_minutes=_env_int("INVESTING_PORTFOLIO_INTERVAL_MINUTES", 15),
            market_update_mode=_env("MARKET_UPDATE_MODE", "once"),
            market_schedule_mode=_env("MARKET_SCHEDULE_MODE", "interval"),
            market_retention_days=_env_int("MARKET_RETENTION_DAYS", 5),
            market_scheduler_enabled=_env_bool("MARKET_SCHEDULER_ENABLED", True),
            market_run_on_start=_env_bool("MARKET_RUN_ON_START", True),
            market_yahoo_enabled=_env_bool("MARKET_YAHOO_ENABLED", True),
            market_yahoo_max_symbols=_env_int("MARKET_YAHOO_MAX_SYMBOLS", 320),
            market_yahoo_timeout_ms=_env_int("MARKET_YAHOO_TIMEOUT_MS", 8000),
            investing_portfolio_enabled=_env_bool("INVESTING_PORTFOLIO_ENABLED", True),
            investing_calendar_enabled=_env_bool("INVESTING_CALENDAR_ENABLED", True),
            infomoney_di_enabled=_env_bool("INFOMONEY_DI_ENABLED", True),
            dotenv_override=_env_bool("DOTENV_OVERRIDE", False),
            market_git_sync_enabled=git_sync_enabled,
            market_git_sync_push=git_sync_push,
            market_git_sync_branch=branch,
            options_run_times=_env("OPTIONS_RUN_TIMES", "07:00,08:30,18:10,20:00"),
            options_run_weekdays_only=_env_bool("OPTIONS_RUN_WEEKDAYS_ONLY", True),
            options_lock_max_age_minutes=_env_int("OPTIONS_LOCK_MAX_AGE_MINUTES", 240),
            wdo_candidate_contract_months=_env_int("WDO_CANDIDATE_CONTRACT_MONTHS", 60),
            enable_auto_git_push=_env_bool("ENABLE_AUTO_GIT_PUSH", True),
            unified_git_push_handled=_env_bool("UNIFIED_GIT_PUSH_HANDLED", True),
            edi_git_validate_strict=_env_bool("EDI_GIT_VALIDATE_STRICT", True),
            edi_artifacts_branch=artifacts_branch,
            cotacoes_dir=cotacoes_dir,
            auto_b3_dir=auto_b3_dir,
            dashboard_unificado_dir=dashboard_dir,
            locks_dir=locks_dir,
            csv_indice_dir=csv_indice_dir,
            csv_dolar_dir=csv_dolar_dir,
        )

        if not (cotacoes_dir / "package.json").exists():
            logger.error("ERRO: pasta Cotacoes nao encontrada em %s.", cotacoes_dir)

        return cfg

    def detect_python(self) -> None:
        for cmd in ("py -3", "python"):
            try:
                result = subprocess.run(
                    cmd.split() + ["-c", "import sys"],
                    capture_output=True, timeout=5, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
                )
                if result.returncode == 0:
                    self.py_cmd = cmd
                    return
            except Exception:
                continue
        self.py_cmd = "python"


# ---------------------------------------------------------------------------
# MarketService
# ---------------------------------------------------------------------------

class MarketService:
    def __init__(self, cfg: Config) -> None:
        self.cfg = cfg
        self._started_here = False
        self._process: subprocess.Popen | None = None

    @property
    def _base_url(self) -> str:
        return f"http://{self.cfg.market_host}:{self.cfg.market_port}"

    def _http_get(self, path: str, timeout: int = 4) -> dict | None:
        url = f"{self._base_url}{path}"
        if requests is not None:
            try:
                r = requests.get(url, timeout=timeout)
                r.raise_for_status()
                return r.json()
            except Exception:
                return None
        else:
            return self._http_get_urllib(url, timeout)

    def _http_get_urllib(self, url: str, timeout: int = 4) -> dict | None:
        import urllib.request
        import urllib.error
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception:
            return None

    def _http_post(self, path: str, data: dict | None = None, timeout: int = 8) -> dict | None:
        url = f"{self._base_url}{path}"
        body = json.dumps(data or {}).encode("utf-8")
        if requests is not None:
            try:
                r = requests.post(url, json=data, timeout=timeout)
                return r.json()
            except Exception:
                return None
        else:
            import urllib.request
            try:
                req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
                with urllib.request.urlopen(req, timeout=timeout) as resp:
                    return json.loads(resp.read().decode("utf-8"))
            except Exception:
                return None

    def is_running(self) -> bool:
        return self._is_port_in_use(self.cfg.market_port)

    def _is_port_in_use(self, port: int) -> bool:
        try:
            with socket.create_connection((self.cfg.market_host, port), timeout=0.6):
                return True
        except OSError:
            return False

    def get_pid(self) -> int | None:
        if sys.platform == "win32":
            try:
                result = subprocess.run(
                    ["powershell", "-NoProfile", "-Command",
                     f"$p=(Get-NetTCPConnection -State Listen -LocalPort {self.cfg.market_port} "
                     "-ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess; "
                     "if($p){$p}"],
                    capture_output=True, text=True, timeout=5,
                    creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
                )
                output = result.stdout.strip()
                if output:
                    return int(output)
            except Exception:
                pass
        return None

    def health_check(self) -> bool:
        data = self._http_get("/api/market/health", timeout=2)
        return bool(data and data.get("ok"))

    def status(self) -> dict | None:
        return self._http_get("/api/market/status", timeout=4)

    def wait_ready(self, timeout: int = 120) -> bool:
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            if self.health_check():
                return True
            time.sleep(1)
        return False

    def start(self) -> None:
        if self.is_running() and self.health_check():
            logger.info("Market service ja esta rodando.")
            self._check_modules_active()
            return

        if self.is_running() and not self.health_check():
            pid = self.get_pid()
            if pid:
                logger.warning("Porta %d ocupada mas healthcheck falhou. Encerrando PID=%d...", self.cfg.market_port, pid)
                self._force_kill_pid(pid)
                time.sleep(1)

        logger.info("Iniciando market:service em nova janela...")
        self._started_here = True
        env = os.environ.copy()
        env.update({
            "DOTENV_OVERRIDE": str(self.cfg.dotenv_override).lower(),
            "MARKET_GIT_SYNC_ENABLED": str(self.cfg.market_git_sync_enabled).lower(),
            "MARKET_GIT_SYNC_PUSH": str(self.cfg.market_git_sync_push).lower(),
            "MARKET_GIT_SYNC_BRANCH": self.cfg.market_git_sync_branch,
            "MARKET_SERVICE_HOST": self.cfg.market_host,
            "MARKET_SERVICE_PORT": str(self.cfg.market_port),
            "MARKET_INTERVAL_MINUTES": str(self.cfg.market_interval_minutes),
            "INVESTING_PORTFOLIO_INTERVAL_MINUTES": str(self.cfg.investing_portfolio_interval_minutes),
            "MARKET_UPDATE_MODE": self.cfg.market_update_mode,
            "MARKET_SCHEDULE_MODE": self.cfg.market_schedule_mode,
            "MARKET_SCHEDULER_ENABLED": str(self.cfg.market_scheduler_enabled).lower(),
            "MARKET_RUN_ON_START": str(self.cfg.market_run_on_start).lower(),
            "MARKET_RETENTION_DAYS": str(self.cfg.market_retention_days),
            "MARKET_YAHOO_ENABLED": str(self.cfg.market_yahoo_enabled).lower(),
            "MARKET_YAHOO_MAX_SYMBOLS": str(self.cfg.market_yahoo_max_symbols),
            "MARKET_YAHOO_TIMEOUT_MS": str(self.cfg.market_yahoo_timeout_ms),
            "INVESTING_PORTFOLIO_ENABLED": str(self.cfg.investing_portfolio_enabled).lower(),
            "INVESTING_CALENDAR_ENABLED": str(self.cfg.investing_calendar_enabled).lower(),
            "INFOMONEY_DI_ENABLED": str(self.cfg.infomoney_di_enabled).lower(),
            "OPTIONS_UNIFIED_DASHBOARD_DIR": str(self.cfg.dashboard_unificado_dir),
        })
        npm_bin = self.cfg.cotacoes_dir / "node_modules" / ".bin" / "tsx.cmd"
        if not npm_bin.exists():
            subprocess.run(
                ["npm", "ci", "--silent"],
                cwd=str(self.cfg.cotacoes_dir),
                capture_output=True, timeout=300,
                creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
            )
        try:
            self._process = subprocess.Popen(
                ["npm", "run", "-s", "market:service"],
                cwd=str(self.cfg.cotacoes_dir),
                env=env,
                creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0) | getattr(subprocess, "DETACHED_PROCESS", 0),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except Exception as e:
            logger.error("Falha ao iniciar market:service: %s", e)
        time.sleep(2)

    def _check_modules_active(self) -> None:
        data = self.status()
        if not data:
            return
        try:
            summary = data.get("state", {}).get("last", {}).get("summary", {})
            disabled = []
            for key in ("portfolio", "di", "calendar"):
                mod = summary.get(key, {})
                if isinstance(mod, dict) and mod.get("enabled") is False:
                    disabled.append(key)
            if disabled:
                logger.warning(
                    "market:service com modulos desativados (%s). Reiniciando...",
                    ", ".join(disabled),
                )
                self.shutdown()
        except Exception:
            pass

    def shutdown(self) -> None:
        logger.info("Enviando shutdown para market:service...")
        try:
            self._http_post("/api/market/shutdown", timeout=3)
        except Exception:
            pass
        deadline = time.monotonic() + 12
        while time.monotonic() < deadline:
            if not self.is_running():
                logger.info("Market service encerrado.")
                return
            time.sleep(1)
        pid = self.get_pid()
        if pid:
            logger.warning("Force-kill PID=%d...", pid)
            self._force_kill_pid(pid)

    def _force_kill_pid(self, pid: int) -> None:
        if sys.platform == "win32":
            try:
                subprocess.run(
                    ["taskkill", "/PID", str(pid), "/T", "/F"],
                    capture_output=True, timeout=5,
                    creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
                )
            except Exception:
                pass
        else:
            try:
                os.kill(pid, signal.SIGKILL)
            except Exception:
                pass

    def post_update_force(self) -> int:
        """POST /api/market/update with reason=force. Returns 0=ok, 1=error, 2=already-running."""
        data = self._http_get("/api/market/status", timeout=4)
        if data and data.get("ok") and data.get("state", {}).get("running"):
            logger.info("[market] update ja em andamento. Vou aguardar.")
            return 2
        deadline = time.monotonic() + 180
        while time.monotonic() < deadline:
            try:
                resp = self._http_post("/api/market/update", {"reason": "force"}, timeout=8)
                if resp and resp.get("ok"):
                    logger.info("[market] update(force) solicitado.")
                    return 0
                logger.info("[market] update(force) resposta inesperada.")
                time.sleep(5)
            except Exception as e:
                msg = str(e)
                if "409" in msg:
                    logger.info("[market] force em conflito (409). Aguardando.")
                    return 2
                logger.error("[market] update(force) falhou: %s", e)
                return 1
        logger.info("[market] update(force) TIMEOUT.")
        return 2

    def wait_first_update(self, timeout_minutes: int = 12) -> bool:
        """Wait for the first market update to finish (polls /api/market/status)."""
        status_url = f"{self._base_url}/api/market/status"
        baseline = None
        try:
            data = self.status()
            if data and data.get("state", {}).get("last", {}).get("finishedAt"):
                baseline = datetime.fromisoformat(data["state"]["last"]["finishedAt"].replace("Z", "+00:00"))
        except Exception:
            pass

        deadline = time.monotonic() + timeout_minutes * 60
        while time.monotonic() < deadline:
            try:
                st = self.status()
            except Exception:
                st = None
            if not st or not st.get("ok"):
                logger.info("[market] aguardando status... %s", datetime.now().strftime("%H:%M:%S"))
                time.sleep(10)
                continue

            running = bool(st.get("state", {}).get("running"))
            last = st.get("state", {}).get("last")
            finished_at = last.get("finishedAt") if last else None
            log_path = last.get("logPath") if last else None

            status_msg = "[market] %s %s" % (
                datetime.now().strftime("%H:%M:%S"),
                "RODANDO" if running else "IDLE",
            )
            if finished_at:
                status_msg += " | finishedAt=" + finished_at
            logger.info(status_msg)

            done = False
            if finished_at:
                try:
                    fin = datetime.fromisoformat(finished_at.replace("Z", "+00:00"))
                    if (not baseline) or (fin > baseline):
                        done = True
                except Exception:
                    pass
            if done and not running:
                logger.info("[market] 1a coleta concluida.")
                if log_path:
                    logger.info("[market] log: %s", log_path)
                if last and last.get("summary"):
                    logger.info("[market] resumo: %s", json.dumps(last["summary"], ensure_ascii=False))
                return True
            time.sleep(10)

        logger.info("[market] TIMEOUT aguardando 1a coleta.")
        return False

    def wait_update_complete(self, force_requested_at_utc: str | None = None, timeout_minutes: int = 15) -> bool:
        """Wait for market update cycle to finish and git sync to complete."""
        need_git = self.cfg.market_git_sync_enabled
        dry = False
        start = time.monotonic()
        req_utc = None
        if force_requested_at_utc:
            try:
                req_utc = datetime.fromisoformat(force_requested_at_utc.replace("Z", "+00:00"))
            except Exception:
                req_utc = None
        if not req_utc:
            req_utc = datetime.now().astimezone()
        req_utc_threshold = req_utc - __import__("datetime").timedelta(seconds=15)

        deadline = start + timeout_minutes * 60
        while time.monotonic() < deadline:
            try:
                r = self.status()
            except Exception:
                r = None
            if r and r.get("ok") and r.get("state"):
                state = r["state"]
                if state.get("running"):
                    time.sleep(2)
                    continue
                last = state.get("last")
                if last:
                    reason = str(last.get("reason", ""))
                    if not reason or reason == "force":
                        ref = None
                        if last.get("startedAt"):
                            try:
                                ref = datetime.fromisoformat(last["startedAt"].replace("Z", "+00:00"))
                            except Exception:
                                ref = None
                        if not ref and last.get("finishedAt"):
                            try:
                                ref = datetime.fromisoformat(last["finishedAt"].replace("Z", "+00:00"))
                            except Exception:
                                ref = None
                        if ref and ref >= req_utc_threshold:
                            if dry or not need_git:
                                return True
                            log_path = last.get("logPath", "")
                            if log_path and os.path.isfile(log_path):
                                try:
                                    with open(log_path, "r", encoding="utf-8", errors="replace") as f:
                                        lines = f.readlines()
                                        for line in lines[-250:]:
                                            if line.startswith("GIT_SYNC status="):
                                                return True
                                except Exception:
                                    pass
            time.sleep(2)
        return False


# ---------------------------------------------------------------------------
# OptionsPipeline
# ---------------------------------------------------------------------------

class OptionsPipeline:
    def __init__(self, cfg: Config) -> None:
        self.cfg = cfg
        self.lock_dir = cfg.locks_dir / "options_run.lock"

    def acquire_lock(self) -> bool:
        lock_dir = self.cfg.locks_dir
        lock_dir.mkdir(parents=True, exist_ok=True)

        if self.lock_dir.exists():
            stale = self._is_lock_stale()
            if stale:
                logger.info("Lock stale detectado. Removendo...")
                try:
                    shutil.rmtree(self.lock_dir, ignore_errors=True)
                except Exception:
                    pass
            else:
                return False

        try:
            self.lock_dir.mkdir(exist_ok=False)
        except FileExistsError:
            return False

        pid_file = self.lock_dir / "pid.txt"
        try:
            pid_file.write_text(str(os.getpid()), encoding="utf-8")
        except Exception:
            pass
        return True

    def _is_lock_stale(self) -> bool:
        pid_file = self.lock_dir / "pid.txt"
        if pid_file.exists():
            try:
                pid = int(pid_file.read_text(encoding="utf-8").strip())
                if sys.platform == "win32":
                    result = subprocess.run(
                        ["tasklist", "/FI", f"PID eq {pid}"],
                        capture_output=True, text=True, timeout=5,
                        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
                    )
                    if str(pid) not in result.stdout:
                        return True
                else:
                    os.kill(pid, 0)
            except (ValueError, OSError, subprocess.TimeoutExpired):
                return True

        try:
            age_minutes = (time.time() - self.lock_dir.stat().st_mtime) / 60
            if age_minutes > self.cfg.options_lock_max_age_minutes:
                return True
        except Exception:
            pass
        return False

    def release_lock(self) -> None:
        try:
            shutil.rmtree(self.lock_dir, ignore_errors=True)
        except Exception:
            pass

    def should_run(self) -> bool:
        now = datetime.now()

        if self.cfg.options_run_weekdays_only and now.weekday() >= 5:
            return False

        last_updated = self._read_last_updated()
        today = now.date()

        if last_updated is None or last_updated.date() != today:
            return True

        times = [t.strip() for t in self.cfg.options_run_times.split(",") if t.strip()]
        due_slots = []
        for t in times:
            try:
                parts = t.split(":")
                slot_time = today.replace(hour=int(parts[0]), minute=int(parts[1]), second=0, microsecond=0)
                if slot_time <= now:
                    due_slots.append(slot_time)
            except (ValueError, IndexError):
                continue

        if not due_slots:
            return False

        due = max(due_slots)
        return last_updated < due

    def _read_last_updated(self) -> datetime | None:
        candidates = []
        for sub in ("WDO", "WIN"):
            for base in (self.cfg.dashboard_unificado_dir, self.cfg.auto_b3_dir / "dashboard_unificado"):
                p = base / sub / "assets" / "data" / "market_data.json"
                if p.exists():
                    try:
                        data = json.loads(p.read_text(encoding="utf-8", errors="replace"))
                        raw = data.get("last_updated") or (data.get("overview", {}) or {}).get("last_update")
                        if raw:
                            return datetime.fromisoformat(str(raw).replace("Z", "+00:00")).replace(tzinfo=None)
                    except Exception:
                        pass
                    try:
                        return datetime.fromtimestamp(p.stat().st_mtime)
                    except Exception:
                        pass
        return None

    def run(self) -> int:
        if not self.acquire_lock():
            logger.info("Opcoes ja em execucao (lock). Pulando.")
            return 2

        try:
            if self.cfg.auto_b3_dir.exists():
                chromedriver_dir = os.path.join(os.environ.get("APPDATA", ""), "undetected_chromedriver")
                if os.path.isdir(chromedriver_dir):
                    shutil.rmtree(chromedriver_dir, ignore_errors=True)

            scripts = ["automacao_dados.py", "config.py"]
            py_parts = self.cfg.py_cmd.split()
            for script in scripts:
                script_path = self.cfg.auto_b3_dir / script
                if script_path.exists():
                    result = subprocess.run(
                        py_parts + [str(script_path)],
                        cwd=str(self.cfg.auto_b3_dir),
                        timeout=600,
                        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
                    )
                    if result.returncode != 0:
                        logger.error("Script %s falhou com exit code %d", script, result.returncode)

            gerar = self.cfg.root_dir / "Cotacoes" / "tools" / "market" / "gerar_controle.py"
            if gerar.exists():
                subprocess.run(
                    py_parts + [str(gerar)],
                    cwd=str(self.cfg.auto_b3_dir),
                    timeout=120,
                    creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
                )

            self._copy_to_dashboard()
            time.sleep(1)
            return 0
        except Exception as e:
            logger.error("Erro na pipeline de opcoes: %s", e)
            return 1
        finally:
            self.release_lock()

    def run_force(self) -> int:
        return self.run()

    def _copy_to_dashboard(self) -> None:
        src_dash = self.cfg.auto_b3_dir / "dashboard_unificado"
        dst_dash = self.cfg.dashboard_unificado_dir
        for key in ("WIN", "WDO"):
            src_data = src_dash / key / "assets" / "data"
            dst_data = dst_dash / key / "assets" / "data"
            if not src_data.exists():
                continue
            dst_data.mkdir(parents=True, exist_ok=True)
            for fname in ("market_data.json", "market_data.js", "ntsl_script.txt"):
                src_f = src_data / fname
                dst_f = dst_data / fname
                if src_f.exists():
                    try:
                        shutil.copy2(str(src_f), str(dst_f))
                    except Exception as e:
                        logger.warning("Falha ao copiar %s -> %s: %s", src_f, dst_f, e)

            self._validate_copied_files(key, dst_data)

    def _validate_copied_files(self, key: str, dst_data: Path) -> None:
        js_file = dst_data / "market_data.js"
        if js_file.exists():
            sz = js_file.stat().st_size
            if sz < 1000:
                logger.warning("[WARN] %s market_data.js muito pequeno: %d bytes", key, sz)
        else:
            logger.warning("[WARN] %s market_data.js ausente apos copia", key)

        json_file = dst_data / "market_data.json"
        if json_file.exists():
            sz = json_file.stat().st_size
            if sz < 100:
                logger.warning("[WARN] %s market_data.json muito pequeno: %d bytes", key, sz)
        else:
            logger.warning("[WARN] %s market_data.json ausente apos copia", key)


# ---------------------------------------------------------------------------
# GitManager
# ---------------------------------------------------------------------------

class GitManager:
    GIT_PATHS = [
        "dashboard_unificado",
        "B3_System/dashboard_unificado",
        "controle_de_dados.html",
        "Cotacoes/dashboard/index.html",
        "Cotacoes/dashboard/MERCADO/index.html",
        "Cotacoes/dashboard/MERCADO/assets/js",
        "Cotacoes/dashboard/MERCADO/assets/data",
        "Cotacoes/dashboard/MERCADO/exports",
        "Cotacoes/tools/market",
        "Cotacoes/package.json",
    ]

    def __init__(self, cfg: Config) -> None:
        self.cfg = cfg

    def _run_git(self, *args: str, check: bool = False, timeout: int = 30) -> subprocess.CompletedProcess:
        return subprocess.run(
            ["git"] + list(args),
            capture_output=True, text=True, timeout=timeout,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )

    def get_current_branch(self) -> str:
        result = self._run_git("rev-parse", "--abbrev-ref", "HEAD")
        return result.stdout.strip()

    def fetch(self) -> None:
        target = self.cfg.edi_artifacts_branch or self.cfg.market_git_sync_branch
        self._run_git("fetch", "origin", target, timeout=60)

    def is_behind(self) -> int:
        target = self.cfg.edi_artifacts_branch or self.cfg.market_git_sync_branch
        result = self._run_git("rev-list", "--left-right", "--count", f"HEAD...origin/{target}")
        parts = result.stdout.strip().split()
        if len(parts) == 2:
            return int(parts[1])
        return 0

    def validate_strict(self) -> bool:
        if not self.cfg.edi_git_validate_strict:
            return True
        result = subprocess.run(
            ["npm", "-C", str(self.cfg.cotacoes_dir), "run", "-s", "market:validate:strict"],
            capture_output=True, text=True, timeout=120,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        return result.returncode == 0

    def stage(self) -> None:
        self._run_git("add", *self.GIT_PATHS)

    def has_changes(self) -> bool:
        result = self._run_git("diff", "--cached", "--quiet")
        return result.returncode != 0

    def commit(self) -> bool:
        ts = datetime.now().strftime("%Y-%m-%d %H:%M")
        result = self._run_git("commit", "-m", f"Atualiza dashboard_unificado (auto {ts})")
        if result.returncode != 0:
            logger.error("ERRO: falha ao criar commit.")
            return False
        short_sha = self._run_git("rev-parse", "--short", "HEAD").stdout.strip()
        if short_sha:
            logger.info("Commit criado: %s", short_sha)
        return True

    def push(self, retries: int = 3) -> bool:
        target = self.cfg.edi_artifacts_branch or self.cfg.market_git_sync_branch
        delays = [5, 10, 0]
        for attempt in range(1, retries + 1):
            env = os.environ.copy()
            env["GIT_TERMINAL_PROMPT"] = "0"
            env["GCM_INTERACTIVE"] = "Never"
            result = subprocess.run(
                ["git", "push", "origin", target],
                capture_output=True, text=True, timeout=180,
                env=env,
                creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
            )
            if result.returncode == 0:
                logger.info("Push OK: origin/%s", target)
                return True
            logger.warning("tentativa %d de push falhou (git push origin %s).", attempt, target)
            delay = delays[attempt - 1] if attempt - 1 < len(delays) else 10
            if delay > 0:
                logger.info("Aguardando %d segundos antes de retry...", delay)
                time.sleep(delay)

        logger.error("ERRO: falha no push apos %d tentativas.", retries)
        return False

    def dry_run(self) -> None:
        cur = self.get_current_branch()
        target = self.cfg.edi_artifacts_branch or self.cfg.market_git_sync_branch
        print()
        print("=== GIT DRY-RUN ===")
        print(f"Branch atual: {cur}")
        print(f"Branch alvo:  {target}")
        print()
        self._run_git("status", "--porcelain", "--", *self.GIT_PATHS)
        print()
        self._run_git("diff", "--stat", "--", *self.GIT_PATHS)
        print()

    def full_sync(self) -> bool:
        cur = self.get_current_branch()
        target = self.cfg.edi_artifacts_branch or self.cfg.market_git_sync_branch

        if not cur:
            logger.warning("Git indisponivel. Pulando commit/push.")
            return False

        if cur.lower() != target.lower():
            logger.error("Branch atual (%s) difere do alvo (%s). Abortando.", cur, target)
            return False

        self.fetch()
        behind = self.is_behind()
        if behind > 0:
            logger.error("Branch local esta %d commit(s) atras de origin/%s. Abortando.", behind, target)
            return False

        if not self.validate_strict():
            logger.error("market:validate:strict falhou. Abortando commit/push.")
            return False

        self.stage()
        if not self.has_changes():
            logger.info("Nada para commitar/push (unificado).")
            return True

        if not self.commit():
            return False

        return self.push()


# ---------------------------------------------------------------------------
# Orquestrador
# ---------------------------------------------------------------------------

class Orquestrador:
    def __init__(self, cfg: Config, args: argparse.Namespace) -> None:
        self.cfg = cfg
        self.args = args
        self.market = MarketService(cfg)
        self.options = OptionsPipeline(cfg)
        self.git = GitManager(cfg)
        self._shutdown_event = threading.Event()
        self._exit_watcher_started = False

    def run(self) -> int:
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

        if self.args.git_dry_run:
            self.git.dry_run()
            return 0

        self.market.start()

        logger.info("")
        logger.info("===============================")
        logger.info("  EDI - Servico Unificado")
        logger.info("===============================")
        logger.info("Host: %s", self.cfg.market_host)
        logger.info("Porta: %d", self.cfg.market_port)
        logger.info("")

        if not self.market.wait_ready():
            logger.warning("market:service nao respondeu em %s/api/market/health", self.market._base_url)
        else:
            logger.info("Market service online.")

        self._start_exit_watcher()

        if self.args.force:
            return self._run_force()
        elif self.args.once:
            return self._run_once()
        else:
            return self._run_daemon()

    def _run_daemon(self) -> int:
        py_parts = self.cfg.py_cmd.split()
        automacao = self.cfg.auto_b3_dir / "automacao_dados.py"
        if automacao.exists():
            rc = self.options.should_run()
            if rc:
                logger.info("Opcoes: nada pendente no horario de abertura - skip.")
            else:
                job_rc = self.options.run()
                if job_rc == 2:
                    logger.info("Opcoes: ja em execucao - lock. Nao vou duplicar.")
                else:
                    self.git.full_sync()
        else:
            logger.info("automacao_dados.py nao encontrado. Pulando opcoes.")

        logger.info("")
        logger.info("Status: %s/api/market/status", self.market._base_url)
        logger.info("Update: POST %s/api/market/update", self.market._base_url)
        logger.info("")

        if automacao.exists():
            return self._opcoes_loop()
        return 0

    def _run_once(self) -> int:
        logger.info("")
        logger.info("=== MODO ONCE: aguardando 1a coleta de COTACOES ===")
        logger.info("Intervalo configurado: %d min", self.cfg.market_interval_minutes)
        logger.info("")

        rc = self.market.post_update_force()
        if rc == 1:
            logger.error("ERRO: falha ao solicitar update (force).")
            return 1
        if rc == 2:
            if not self.market.wait_first_update():
                logger.error("ERRO: falha ao solicitar update (force).")
                return 1
            rc2 = self.market.post_update_force()
            if rc2 == 1:
                logger.error("ERRO: falha ao solicitar update (force).")
                return 1

        if not self.market.wait_first_update():
            logger.error("ERRO: falha ao solicitar update (force).")
            return 1
        return 0

    def _run_force(self) -> int:
        logger.info("")
        logger.info("=====================================")
        logger.info("  EDI - Servico Unificado FORCE")
        logger.info("=====================================")
        logger.info("Host: %s", self.cfg.market_host)
        logger.info("Porta: %d", self.cfg.market_port)
        logger.info("")

        logger.info("Forcando update (bypass cooldown)...")
        force_requested_at = datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
        resp = self.market._http_post("/api/market/update", {"reason": "force"}, timeout=8)
        if resp and resp.get("ok"):
            logger.info("[market] update(force) solicitado.")
        else:
            logger.info("[market] update(force) resposta ou erro.")

        logger.info("")
        logger.info("Status: %s/api/market/status", self.market._base_url)
        logger.info("")

        automacao = self.cfg.auto_b3_dir / "automacao_dados.py"
        if automacao.exists():
            logger.info("")
            logger.info("=== Atualizando Opcoes - Python 1x ===")
            self.options.run_force()
        else:
            logger.info("")
            logger.info("AVISO: automacao_dados.py nao encontrado. Pulando Opcoes.")

        logger.info("")
        self.market.wait_update_complete(force_requested_at)

        git_ok = self.git.full_sync()

        self.market.shutdown()

        return 0 if git_ok else 1

    def _opcoes_loop(self) -> int:
        interval = self.cfg.opcões_interval_seconds
        logger.info("")
        logger.info(
            "Monitorando agenda de opcoes - a cada %ds (so executa quando pendente). "
            "Feche esta janela para parar.",
            interval,
        )
        logger.info("")

        while not self._shutdown_event.is_set():
            if not self.options.should_run():
                pass
            else:
                job_rc = self.options.run()
                if job_rc != 2:
                    self.git.full_sync()
            self._shutdown_event.wait(timeout=interval)

        return 0

    def _start_exit_watcher(self) -> None:
        if self._exit_watcher_started:
            return
        self._exit_watcher_started = True
        t = threading.Thread(target=self._exit_watcher_loop, daemon=True)
        t.start()

    def _exit_watcher_loop(self) -> None:
        parent_pid = os.getppid()
        while not self._shutdown_event.is_set():
            try:
                if sys.platform == "win32":
                    result = subprocess.run(
                        ["tasklist", "/FI", f"PID eq {parent_pid}"],
                        capture_output=True, text=True, timeout=5,
                        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
                    )
                    if str(parent_pid) not in result.stdout:
                        logger.info("Processo pai (PID=%d) encerrado. Fazendo shutdown...", parent_pid)
                        self.market.shutdown()
                        return
                else:
                    os.kill(parent_pid, 0)
            except OSError:
                logger.info("Processo pai (PID=%d) encerrado. Fazendo shutdown...", parent_pid)
                self.market.shutdown()
                return
            self._shutdown_event.wait(timeout=1)

    def _signal_handler(self, signum: int, frame: Any) -> None:
        logger.info("Sinal %d recebido. Encerrando...", signum)
        self._shutdown_event.set()
        self.market.shutdown()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="EDI Market Guardian — Orquestrador Unificado",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python scripts/orquestrador.py                   Modo daemon (loop infinito)
  python scripts/orquestrador.py --once            Roda uma vez e sai
  python scripts/orquestrador.py --force           FORCE: update + opcoes + push + shutdown
  python scripts/orquestrador.py --git-dry-run     Mostra status git
  python scripts/orquestrador.py --no-pause        Pula pause no fim
        """,
    )
    parser.add_argument("--once", action="store_true", help="Executa uma vez e sai")
    parser.add_argument("--force", action="store_true", help="Modo FORCE: tudo, push, shutdown")
    parser.add_argument("--git-dry-run", action="store_true", help="Mostra status git apenas")
    parser.add_argument("--no-pause", action="store_true", help="Pula pause no final")
    return parser.parse_args()


def main() -> int:
    _setup_logging()
    args = parse_args()

    root_dir = Path(__file__).resolve().parent.parent
    os.chdir(root_dir)

    cfg = Config.from_env(root_dir)
    cfg.detect_python()

    orch = Orquestrador(cfg, args)
    try:
        return orch.run()
    except KeyboardInterrupt:
        logger.info("Interrompido pelo usuario.")
        orch.market.shutdown()
        return 130
    except Exception as e:
        logger.error("Erro fatal: %s", e, exc_info=True)
        orch.market.shutdown()
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
