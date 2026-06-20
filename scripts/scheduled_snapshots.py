"""
scheduled_snapshots.py - E42: Snapshot automatico agendado.

Cria snapshots automaticamente em 4 horarios BRT (04:00, 07:00, 12:00, 18:00).
A janela de tolerancia e de 5 minutos (slot HH:MM-04 ate HH:MM+01).

Uso standalone:
    python scripts/scheduled_snapshots.py --run-now    # criar snapshot imediato
    python scripts/scheduled_snapshots.py --check      # verificar se deve criar
    python scripts/scheduled_snapshots.py --status     # status dos snapshots

Integrado no orquestrador:
    from scripts.scheduled_snapshots import (
        SNAPSHOT_SLOTS_BRT,
        should_snapshot_now,
        create_scheduled_snapshot,
    )
"""
from __future__ import annotations

import argparse
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


# Slots BRT de snapshot (formato HH:MM, 24h)
SNAPSHOT_SLOTS_BRT = ["04:00", "07:00", "12:00", "18:00"]
SNAPSHOT_LABEL_PREFIX = "scheduled"
TOLERANCE_MINUTES_BEFORE = 4
TOLERANCE_MINUTES_AFTER = 1


def _now_brt() -> datetime:
    """Retorna datetime atual (assumindo BRT)."""
    return datetime.now()


def _parse_slot(slot_str: str) -> tuple[int, int]:
    """Parse 'HH:MM' -> (hour, minute)."""
    h, m = slot_str.split(":")
    return int(h), int(m)


def _slot_datetime(slot_str: str, now: Optional[datetime] = None) -> datetime:
    """Retorna datetime de hoje no slot especificado."""
    if now is None:
        now = _now_brt()
    h, m = _parse_slot(slot_str)
    return now.replace(hour=h, minute=m, second=0, microsecond=0)


def should_snapshot_now(now: Optional[datetime] = None) -> Optional[str]:
    """Retorna o slot a disparar se estamos na janela de tolerancia.

    Janela: [slot - 4 min, slot + 1 min]
    Retorna None se fora de qualquer janela.
    """
    if now is None:
        now = _now_brt()
    for slot in SNAPSHOT_SLOTS_BRT:
        target = _slot_datetime(slot, now)
        delta = (now - target).total_seconds() / 60.0  # minutos
        if -TOLERANCE_MINUTES_BEFORE <= delta <= TOLERANCE_MINUTES_AFTER:
            return slot
    return None


def next_snapshot_slot(now: Optional[datetime] = None) -> tuple[str, datetime]:
    """Retorna (slot_str, datetime) do proximo slot futuro."""
    if now is None:
        now = _now_brt()
    future_slots = []
    for slot in SNAPSHOT_SLOTS_BRT:
        target = _slot_datetime(slot, now)
        if target > now:
            future_slots.append((slot, target))
    if future_slots:
        return future_slots[0]
    # Se passou de todos, retorna o primeiro slot de amanha
    tomorrow = now + timedelta(days=1)
    return SNAPSHOT_SLOTS_BRT[0], _slot_datetime(SNAPSHOT_SLOTS_BRT[0], tomorrow)


def create_scheduled_snapshot(slot: str, label_suffix: str = "") -> bool:
    """Cria snapshot via pre_run_snapshot. Retorna True se criou, False se erro.

    Args:
        slot: slot que disparou (ex: '07:00')
        label_suffix: sufixo extra para o label (ex: 'pre-pipeline')
    """
    try:
        from scripts.hooks.pre_run_snapshot import create_snapshot
    except ImportError as e:
        print(f"[ERROR] Nao foi possivel importar pre_run_snapshot: {e}")
        return False

    label_parts = [SNAPSHOT_LABEL_PREFIX, slot]
    if label_suffix:
        label_parts.append(label_suffix)
    label = "-".join(label_parts)
    try:
        create_snapshot(label=label)
        print(f"[SNAPSHOT-SCHEDULED] slot={slot} label={label} criado com sucesso")
        return True
    except Exception as e:
        print(f"[SNAPSHOT-SCHEDULED] ERRO ao criar snapshot slot={slot}: {e}")
        return False


def run_scheduler_tick(now: Optional[datetime] = None) -> Optional[str]:
    """Uma iteracao do scheduler: verifica se deve criar snapshot, e cria.

    Retorna o slot que disparou, ou None.
    """
    slot = should_snapshot_now(now)
    if slot is None:
        return None
    create_scheduled_snapshot(slot)
    return slot


def list_recent_snapshots(limit: int = 10) -> list[dict]:
    """Lista snapshots recentes (mais novos primeiro)."""
    from scripts.hooks.pre_run_snapshot import SNAPSHOTS_DIR
    if not SNAPSHOTS_DIR.exists():
        return []
    snaps = []
    for d in sorted(SNAPSHOTS_DIR.iterdir(), key=lambda p: p.name, reverse=True):
        if d.is_dir() and d.name.startswith("snap-"):
            meta_path = d / "_META.json"
            meta = {}
            if meta_path.exists():
                try:
                    import json
                    meta = json.loads(meta_path.read_text(encoding="utf-8"))
                except Exception:
                    pass
            snaps.append({
                "name": d.name,
                "created": meta.get("stamp", "?"),
                "label": meta.get("label", ""),
                "files": meta.get("files_copied", 0),
            })
            if len(snaps) >= limit:
                break
    return snaps


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(description="Snapshot scheduler (E42)")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("check", help="Verificar se deve criar snapshot agora")
    sub.add_parser("run-now", help="Criar snapshot imediato (forcado)")
    sub.add_parser("status", help="Mostrar snapshots recentes")
    sub.add_parser("next", help="Mostrar proximo slot agendado")

    args = parser.parse_args()

    if args.cmd == "check":
        slot = should_snapshot_now()
        if slot:
            print(f"YES: slot {slot} esta na janela de tolerancia (criaria agora)")
            return 0
        else:
            print(f"NO: fora da janela. Slots BRT: {SNAPSHOT_SLOTS_BRT}")
            return 0

    if args.cmd == "run-now":
        slot = should_snapshot_now() or "manual"
        ok = create_scheduled_snapshot(slot, label_suffix="manual")
        return 0 if ok else 1

    if args.cmd == "status":
        snaps = list_recent_snapshots(limit=10)
        if not snaps:
            print("Nenhum snapshot encontrado")
        else:
            print(f"{'NAME':<50s} {'CREATED':<20s} {'LABEL':<30s} {'FILES':>5s}")
            for s in snaps:
                print(f"{s['name']:<50s} {s['created']:<20s} {s['label']:<30s} {s['files']:>5d}")
        return 0

    if args.cmd == "next":
        slot, dt = next_snapshot_slot()
        delta = dt - _now_brt()
        hours, rem = divmod(delta.total_seconds(), 3600)
        minutes = rem / 60
        print(f"Proximo slot: {slot} (em {int(hours)}h{int(minutes)}m) = {dt.isoformat()}")
        return 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
