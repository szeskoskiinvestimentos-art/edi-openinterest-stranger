"""
test_auto_discovery.py - Testes para E44 (Auto-discovery de telas).

Valida que unified-nav.js:
- Tem funcao autoDiscoverDashboards
- Aceita window.EDI_EXTRA_DASHBOARDS
- 6 dashboards base detectados
- Backward compat (nao quebra testes existentes)
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


NAV_PATH = ROOT / "dashboard_unificado" / "shared" / "unified-nav.js"


def test_nav_has_auto_discover_function():
    """unified-nav.js deve ter funcao autoDiscoverDashboards."""
    content = NAV_PATH.read_text(encoding="utf-8")
    assert "function autoDiscoverDashboards" in content, \
        "Funcao autoDiscoverDashboards nao encontrada"
    return True, "autoDiscoverDashboards() presente"


def test_nav_accepts_extra_dashboards():
    """unified-nav.js deve aceitar window.EDI_EXTRA_DASHBOARDS."""
    content = NAV_PATH.read_text(encoding="utf-8")
    assert "EDI_EXTRA_DASHBOARDS" in content, \
        "window.EDI_EXTRA_DASHBOARDS nao referenciado"
    return True, "Aceita window.EDI_EXTRA_DASHBOARDS"


def test_nav_base_dashboards_unchanged():
    """6 dashboards base devem continuar presentes (backward compat)."""
    content = NAV_PATH.read_text(encoding="utf-8")
    expected = ["HUB", "WDO", "WIN", "MERCADO", "CORR", "CONTROLE"]
    missing = [d for d in expected if f"{d}:" not in content]
    if missing:
        return False, f"Dashboards base faltando: {missing}"
    return True, f"6/6 dashboards base: {expected}"


def test_nav_extra_dashboard_pattern():
    """Padrao de extracao de EDI_EXTRA_DASHBOARDS deve estar correto."""
    content = NAV_PATH.read_text(encoding="utf-8")
    # Verifica que faz Object.keys + forEach
    assert "Object.keys(window.EDI_EXTRA_DASHBOARDS)" in content, \
        "Iteracao sobre Object.keys nao encontrada"
    assert "forEach" in content, "forEach nao encontrado"
    assert "map[k] = window.EDI_EXTRA_DASHBOARDS[k]" in content, \
        "Atribuicao ao map nao encontrada"
    return True, "Extracao via Object.keys+forEach"


def test_nav_does_not_override_existing():
    """EDI_EXTRA_DASHBOARDS NAO deve sobrescrever dashboards existentes."""
    content = NAV_PATH.read_text(encoding="utf-8")
    # Padrao: if (!map[k]) map[k] = ...
    assert "if (!map[k])" in content, \
        "Verificacao !map[k] nao encontrada (deve apenas adicionar, nao sobrescrever)"
    return True, "Apenas adiciona novos, nao sobrescreve"


def test_nav_iife_pattern():
    """unified-nav.js deve usar IIFE (sem poluir namespace global)."""
    content = NAV_PATH.read_text(encoding="utf-8")
    assert content.count("(function () {") >= 1, "IIFE nao encontrada"
    assert content.count("})();") >= 1, "IIFE nao fechada"
    return True, "IIFE pattern OK"


def test_nav_has_comment_doc():
    """Deve ter comentario documentando E44."""
    content = NAV_PATH.read_text(encoding="utf-8")
    assert "E44" in content, "Comentario sobre E44 nao encontrado"
    return True, "Comentario E44 presente"


if __name__ == "__main__":
    tests = [
        ("Nav tem autoDiscoverDashboards", test_nav_has_auto_discover_function),
        ("Nav aceita EDI_EXTRA_DASHBOARDS", test_nav_accepts_extra_dashboards),
        ("Nav 6 dashboards base (backward compat)", test_nav_base_dashboards_unchanged),
        ("Nav extracao Object.keys+forEach", test_nav_extra_dashboard_pattern),
        ("Nav nao sobrescreve existentes", test_nav_does_not_override_existing),
        ("Nav IIFE pattern", test_nav_iife_pattern),
        ("Nav comentario E44", test_nav_has_comment_doc),
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
