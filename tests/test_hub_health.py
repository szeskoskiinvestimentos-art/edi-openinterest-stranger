"""
test_hub_health.py - Testes para E31 (HUB Health dashboard).

Valida que dashboard_unificado/index.html tem:
- 4 cards de saude
- IDs corretos para popular via JS
- Auto-refresh habilitado
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


HUB_PATH = ROOT / "dashboard_unificado" / "index.html"


def test_hub_has_health_section():
    """HUB deve ter secao #status com 4 cards de saude."""
    content = HUB_PATH.read_text(encoding="utf-8")
    assert 'id="status"' in content, "Secao #status nao encontrada"
    assert "SAÚDE DO SISTEMA" in content or "SAUDE DO SISTEMA" in content, \
        "Titulo SAÚDE DO SISTEMA nao encontrado"
    return True, "Secao SAUDE DO SISTEMA encontrada"


def test_hub_has_four_health_cards():
    """HUB deve ter 4 cards: data-freshness, tests, snapshots, next-slot."""
    content = HUB_PATH.read_text(encoding="utf-8")
    required_ids = [
        "card-data-freshness",
        "card-tests",
        "card-snapshots",
        "card-next-slot",
    ]
    missing = [i for i in required_ids if f'id="{i}"' not in content]
    if missing:
        return False, f"Cards faltando: {missing}"
    return True, f"4/4 cards presentes: {required_ids}"


def test_hub_has_auto_refresh():
    """HUB deve ter JS que atualiza cards a cada 60s."""
    content = HUB_PATH.read_text(encoding="utf-8")
    assert "setInterval(refreshHealth, 60000)" in content, \
        "setInterval(refreshHealth, 60000) nao encontrado"
    assert "refreshHealth()" in content, "refreshHealth() nao chamado"
    return True, "Auto-refresh 60s habilitado"


def test_hub_has_next_slot_logic():
    """HUB deve calcular proximo slot baseado em horarios BRT."""
    content = HUB_PATH.read_text(encoding="utf-8")
    assert "SLOTS_BRT" in content, "Constante SLOTS_BRT nao encontrada"
    # Horarios esperados
    for h in ['04:00', '07:00', '12:00', '18:00']:
        assert h in content, f"Slot {h} nao encontrado em SLOTS_BRT"
    return True, "4 slots BRT: 04:00, 07:00, 12:00, 18:00"


def test_hub_has_legacy_status_link():
    """HUB ainda tem link para #status no nav."""
    content = HUB_PATH.read_text(encoding="utf-8")
    assert 'href="#status"' in content, "Link #status no nav nao encontrado"
    return True, "Link #status presente no nav"


if __name__ == "__main__":
    tests = [
        ("HUB tem secao SAUDE", test_hub_has_health_section),
        ("HUB tem 4 cards", test_hub_has_four_health_cards),
        ("HUB tem auto-refresh 60s", test_hub_has_auto_refresh),
        ("HUB calcula proximo slot", test_hub_has_next_slot_logic),
        ("HUB tem link #status", test_hub_has_legacy_status_link),
    ]

    passed = 0
    failed = 0
    for name, fn in tests:
        try:
            ok, msg = fn()
            if ok:
                print(f"  [OK ] {name} — {msg}")
                passed += 1
            else:
                print(f"  [FAIL] {name} — {msg}")
                failed += 1
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"  [FAIL] {name} — {e}")
            failed += 1

    print(f"\n=== Total: {len(tests)}, Passou: {passed}, Falhou: {failed} ===")
    sys.exit(1 if failed else 0)
