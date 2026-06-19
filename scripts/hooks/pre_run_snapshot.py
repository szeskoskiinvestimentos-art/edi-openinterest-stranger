"""
pre_run_snapshot.py
====================
Cria um snapshot de TODOS os arquivos regeneráveis antes da execução do pipeline
(servico_unificado.py / scripts/*.py / Cotacoes/tools/market/*).

Resolve o problema CRÍTICO: o pipeline sobrescreve arquivos .js/.json gerados,
podendo perder edições manuais. O snapshot preserva a versão "antes" em
.edi_agent/snapshots/snap-YYYYMMDD-HHMMSS/.

Uso:
    python scripts/hooks/pre_run_snapshot.py             # cria snapshot
    python scripts/hooks/pre_run_snapshot.py --label X   # com rótulo customizado
    python scripts/hooks/pre_run_snapshot.py --list      # lista snapshots existentes
    python scripts/hooks/pre_run_snapshot.py --restore N # restaura snapshot N (último se omitido)
    python scripts/hooks/pre_run_snapshot.py --purge 7   # remove snapshots > 7 dias

Arquivos monitorados (regeneráveis — podem ser sobrescritos):
  - dashboard_unificado/WIN/assets/data/market_data.{js,json}
  - dashboard_unificado/WIN/assets/data/ntsl_script.txt
  - dashboard_unificado/WDO/assets/data/market_data.{js,json}
  - dashboard_unificado/WIN/assets/data/yahoo_*.{js,json}  (se existirem)
  - dashboard_unificado/WDO/assets/data/yahoo_*.{js,json}  (se existirem)
  - controle_de_dados.html
  - Cotacoes/dashboard/MERCADO/assets/data/*.js
  - Cotacoes/dashboard/MERCADO/assets/data/*.json
  - .edi_service_state.json
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SNAPSHOTS_DIR = ROOT / ".edi_agent" / "snapshots"

# Padrões de arquivos regeneráveis (relativos a ROOT)
GLOB_PATTERNS = [
    "dashboard_unificado/WIN/assets/data/*.js",
    "dashboard_unificado/WIN/assets/data/*.json",
    "dashboard_unificado/WIN/assets/data/*.txt",
    "dashboard_unificado/WDO/assets/data/*.js",
    "dashboard_unificado/WDO/assets/data/*.json",
    "dashboard_unificado/WDO/assets/data/*.txt",
    "controle_de_dados.html",
    "Cotacoes/dashboard/MERCADO/assets/data/*.js",
    "Cotacoes/dashboard/MERCADO/assets/data/*.json",
    ".edi_service_state.json",
]


def _now_stamp() -> str:
    return datetime.now().strftime("%Y%m%d-%H%M%S")


def create_snapshot(label: str | None = None) -> Path:
    """Cria um snapshot e retorna o diretório criado."""
    SNAPSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    stamp = _now_stamp()
    name = f"snap-{stamp}" + (f"-{label}" if label else "")
    dest = SNAPSHOTS_DIR / name
    dest.mkdir(parents=True, exist_ok=True)

    copied: list[str] = []
    for pattern in GLOB_PATTERNS:
        for src in ROOT.glob(pattern):
            if src.is_file():
                rel = src.relative_to(ROOT)
                target = dest / rel
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, target)
                copied.append(str(rel))

    meta = {
        "stamp": stamp,
        "label": label,
        "files_copied": len(copied),
        "files": copied,
        "root": str(ROOT),
    }
    (dest / "_META.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"[SNAPSHOT] Criado {dest.name} com {len(copied)} arquivo(s).")
    return dest


def list_snapshots() -> list[Path]:
    SNAPSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    snaps = sorted(
        [p for p in SNAPSHOTS_DIR.iterdir() if p.is_dir() and p.name != "_template"],
        key=lambda p: p.name,
        reverse=True,
    )
    if not snaps:
        print("[SNAPSHOT] Nenhum snapshot encontrado.")
    else:
        print(f"[SNAPSHOT] {len(snaps)} snapshot(s) disponivel(is):")
        for s in snaps:
            meta_path = s / "_META.json"
            info = ""
            if meta_path.exists():
                try:
                    meta = json.loads(meta_path.read_text(encoding="utf-8"))
                    info = f"  ({meta.get('files_copied', '?')} arquivos"
                    if meta.get("label"):
                        info += f", label={meta['label']}"
                    info += ")"
                except Exception:
                    pass
            print(f"  - {s.name}{info}")
    return snaps


def restore_snapshot(snap_name: str | None = None) -> None:
    """Restaura um snapshot. Se snap_name for None, usa o mais recente."""
    snaps = list_snapshots()
    if not snaps:
        print("[SNAPSHOT] Nada para restaurar.")
        return
    target = None
    if snap_name:
        for s in snaps:
            if s.name == snap_name or s.name.startswith(f"snap-{snap_name}"):
                target = s
                break
        if not target:
            print(f"[SNAPSHOT] Snapshot '{snap_name}' nao encontrado.")
            return
    else:
        target = snaps[0]

    meta_path = target / "_META.json"
    if not meta_path.exists():
        print(f"[SNAPSHOT] _META.json ausente em {target}. Abortando.")
        return

    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    restored = 0
    for rel in meta.get("files", []):
        src = target / rel
        dst = ROOT / rel
        if not src.exists():
            print(f"  [WARN] {rel} ausente no snapshot, pulando.")
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        restored += 1

    print(f"[SNAPSHOT] Restaurados {restored} arquivo(s) de {target.name}.")


def purge_old_snapshots(days: int) -> None:
    SNAPSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    cutoff = datetime.now() - timedelta(days=days)
    removed = 0
    for snap_dir in SNAPSHOTS_DIR.iterdir():
        if not snap_dir.is_dir() or snap_dir.name == "_template":
            continue
        try:
            stamp_str = snap_dir.name.split("-", 2)[1] + "-" + snap_dir.name.split("-", 2)[2].split("-")[0]
            # snap-YYYYMMDD-HHMMSS  ou  snap-YYYYMMDD-HHMMSS-label
            parts = snap_dir.name.split("-")
            if len(parts) >= 3:
                stamp_str = parts[1] + "-" + parts[2]
                snap_dt = datetime.strptime(stamp_str, "%Y%m%d-%H%M%S")
                if snap_dt < cutoff:
                    shutil.rmtree(snap_dir)
                    removed += 1
                    print(f"  Removido: {snap_dir.name}")
        except (ValueError, IndexError):
            continue
    print(f"[SNAPSHOT] {removed} snapshot(s) removido(s) (> {days} dias).")


def main() -> int:
    parser = argparse.ArgumentParser(description="Snapshot de arquivos regeneraveis.")
    sub = parser.add_subparsers(dest="cmd", required=False)

    sub.add_parser("create", help="Cria novo snapshot (padrao)")
    sub.add_parser("list", help="Lista snapshots")
    sub.add_parser("restore", help="Restaura o snapshot mais recente")
    sub.add_parser("purge", help="Remove snapshots antigos")

    parser.add_argument("--label", help="Rotulo do snapshot")
    parser.add_argument("--days", type=int, default=7, help="Dias para purge")
    parser.add_argument("--snap", help="Nome do snapshot para restore")

    args = parser.parse_args()
    cmd = args.cmd or "create"

    if cmd == "create":
        create_snapshot(args.label)
    elif cmd == "list":
        list_snapshots()
    elif cmd == "restore":
        restore_snapshot(args.snap)
    elif cmd == "purge":
        purge_old_snapshots(args.days)
    return 0


if __name__ == "__main__":
    sys.exit(main())
