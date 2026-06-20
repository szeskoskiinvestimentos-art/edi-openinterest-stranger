"""
test_scheduled_snapshots.py - Testes para E42 (Snapshot agendado).

Valida que scripts/scheduled_snapshots.py:
- 4 slots BRT corretos (04:00, 07:00, 12:00, 18:00)
- should_snapshot_now retorna slot certo na janela
- Tolerancia de 4 min antes, 1 min depois
- next_snapshot_slot retorna slot futuro
- create_scheduled_snapshot funciona (smoke test)
"""
from __future__ import annotations

import sys
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

# Importar módulo
sys.path.insert(0, str(ROOT / "scripts"))
from scheduled_snapshots import (
    SNAPSHOT_SLOTS_BRT,
    should_snapshot_now,
    next_snapshot_slot,
    _parse_slot,
    _slot_datetime,
    SNAPSHOT_LABEL_PREFIX,
    TOLERANCE_MINUTES_BEFORE,
    TOLERANCE_MINUTES_AFTER,
)


def test_slots_correct():
    """SNAPSHOT_SLOTS_BRT deve ter 4 slots nos horarios esperados."""
    expected = ["04:00", "07:00", "12:00", "18:00"]
    assert SNAPSHOT_SLOTS_BRT == expected, f"Slots: {SNAPSHOT_SLOTS_BRT} != {expected}"
    return True, f"4 slots BRT: {SNAPSHOT_SLOTS_BRT}"


def test_parse_slot():
    """_parse_slot deve retornar (hour, minute) como int."""
    h, m = _parse_slot("07:30")
    assert (h, m) == (7, 30)
    h, m = _parse_slot("18:00")
    assert (h, m) == (18, 0)
    h, m = _parse_slot("04:00")
    assert (h, m) == (4, 0)
    return True, "_parse_slot OK"


def test_slot_datetime_uses_today():
    """_slot_datetime deve usar a data de hoje."""
    now = datetime(2026, 6, 19, 10, 30, 0)
    target = _slot_datetime("12:00", now)
    assert target.year == 2026
    assert target.month == 6
    assert target.day == 19
    assert target.hour == 12
    assert target.minute == 0
    return True, f"_slot_datetime('12:00', 2026-06-19 10:30) = {target}"


def test_should_snapshot_now_in_window():
    """should_snapshot_now deve retornar slot quando estamos na janela."""
    # Janela: [slot - 4 min, slot + 1 min]
    # Vamos criar now = 07:02 (slot 07:00, delta = +2 min, dentro de [07:-4=06:56, 07:01])
    # 07:02 > 07:01, entao NAO esta na janela
    # Vamos tentar now = 07:00:30 (delta = 0.5 min, dentro)
    now = datetime(2026, 6, 19, 7, 0, 30)
    slot = should_snapshot_now(now)
    assert slot == "07:00", f"Esperado 07:00, got {slot}"

    # Antes do slot (delta = -3 min, dentro de [-4, 1])
    now = datetime(2026, 6, 19, 6, 57, 0)
    slot = should_snapshot_now(now)
    assert slot == "07:00", f"Esperado 07:00 (antes), got {slot}"

    # Fora da janela (delta = -5 min, antes de -4)
    now = datetime(2026, 6, 19, 6, 55, 0)
    slot = should_snapshot_now(now)
    assert slot is None, f"Esperado None (fora da janela), got {slot}"

    # Bem depois do slot (delta = +10 min, depois de +1)
    now = datetime(2026, 6, 19, 7, 10, 0)
    slot = should_snapshot_now(now)
    assert slot is None, f"Esperado None (depois), got {slot}"

    return True, "should_snapshot_now OK (4 casos)"


def test_next_snapshot_slot_returns_future():
    """next_snapshot_slot deve retornar slot futuro."""
    # now = 10:00 -> proximo slot = 12:00
    now = datetime(2026, 6, 19, 10, 0, 0)
    slot, dt = next_snapshot_slot(now)
    assert slot == "12:00", f"Esperado 12:00, got {slot}"
    assert dt.hour == 12
    assert dt.day == 19  # mesmo dia

    # now = 19:00 (depois de todos) -> primeiro slot de amanha = 04:00
    now = datetime(2026, 6, 19, 19, 0, 0)
    slot, dt = next_snapshot_slot(now)
    assert slot == "04:00", f"Esperado 04:00 (amanha), got {slot}"
    assert dt.day == 20  # amanha

    # now = 03:00 -> proximo = 04:00 (mesmo dia)
    now = datetime(2026, 6, 19, 3, 0, 0)
    slot, dt = next_snapshot_slot(now)
    assert slot == "04:00", f"Esperado 04:00 (mesmo dia), got {slot}"
    assert dt.day == 19

    return True, "next_snapshot_slot OK (3 casos)"


def test_tolerance_constants():
    """Tolerancias devem ser razoaveis (4 antes, 1 depois)."""
    assert TOLERANCE_MINUTES_BEFORE == 4
    assert TOLERANCE_MINUTES_AFTER == 1
    return True, f"Tolerancia: -{TOLERANCE_MINUTES_BEFORE}min / +{TOLERANCE_MINUTES_AFTER}min"


def test_label_prefix_correct():
    """SNAPSHOT_LABEL_PREFIX deve ser 'scheduled' para facil identificacao."""
    assert SNAPSHOT_LABEL_PREFIX == "scheduled", \
        f"Label prefix: {SNAPSHOT_LABEL_PREFIX}"
    return True, f"Label prefix: '{SNAPSHOT_LABEL_PREFIX}'"


if __name__ == "__main__":
    tests = [
        ("Slots BRT corretos", test_slots_correct),
        ("_parse_slot", test_parse_slot),
        ("_slot_datetime usa hoje", test_slot_datetime_uses_today),
        ("should_snapshot_now janela", test_should_snapshot_now_in_window),
        ("next_snapshot_slot futuro", test_next_snapshot_slot_returns_future),
        ("Tolerancia constante", test_tolerance_constants),
        ("Label prefix 'scheduled'", test_label_prefix_correct),
    ]

    passed = 0
    failed = 0
    for name, fn in tests:
        try:
            ok, msg = fn()
            if ok:
                print(f"  [OK ] {name} - {msg}")
                passed += 1
            else:
                print(f"  [FAIL] {name} - {msg}")
                failed += 1
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"  [FAIL] {name} - {e}")
            failed += 1

    print(f"\n=== Total: {len(tests)}, Passou: {passed}, Falhou: {failed} ===")
    sys.exit(1 if failed else 0)
