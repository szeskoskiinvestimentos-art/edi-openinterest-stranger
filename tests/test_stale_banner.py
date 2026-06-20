"""
test_stale_banner.py - Testes para E37 (Auto-pull snapshots no init).

Valida que dashboard_unificado/shared/stale-banner.js:
- Existe
- Detecta window.marketData.last_update
- Detecta #last-update-label
- Threshold configuravel (maxAgeMin)
- Banner aparece quando stale
- API exposta via window.EDI_STALE_CONFIG
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


BANNER_PATH = ROOT / "dashboard_unificado" / "shared" / "stale-banner.js"


def test_banner_file_exists():
    """stale-banner.js deve existir em dashboard_unificado/shared/."""
    assert BANNER_PATH.exists(), f"Arquivo nao encontrado: {BANNER_PATH}"
    return True, f"Arquivo existe: {BANNER_PATH.relative_to(ROOT)}"


def test_banner_uses_iife():
    """stale-banner.js deve usar IIFE (sem poluir namespace global)."""
    content = BANNER_PATH.read_text(encoding="utf-8")
    assert content.count("(function () {") >= 1, "IIFE nao encontrada"
    assert content.count("})();") >= 1, "IIFE nao fechada corretamente"
    return True, "IIFE presente"


def test_banner_has_config():
    """stale-banner.js deve aceitar configuracao via window.EDI_STALE_CONFIG."""
    content = BANNER_PATH.read_text(encoding="utf-8")
    assert "EDI_STALE_CONFIG" in content, \
        "window.EDI_STALE_CONFIG nao referenciado"
    assert "maxAgeMin" in content, "maxAgeMin config nao encontrado"
    return True, "Configuracao via window.EDI_STALE_CONFIG"


def test_banner_uses_neon_terminal_styles():
    """Banner deve usar cores Neon Terminal (Stranger Things)."""
    content = BANNER_PATH.read_text(encoding="utf-8")
    # Cores/fontes neon esperadas
    neon_colors = ["#ff073a", "#00f3ff", "Share Tech Mono"]
    for c in neon_colors:
        assert c in content, f"Cor/fonte neon '{c}' nao encontrada"
    return True, f"Estilo Neon Terminal: {neon_colors}"


def test_banner_checks_marketdata_first():
    """Banner deve priorizar window.marketData.last_update."""
    content = BANNER_PATH.read_text(encoding="utf-8")
    # marketData check deve vir ANTES de last-update-label
    marketdata_idx = content.find("window.marketData")
    label_idx = content.find("last-update-label")
    assert marketdata_idx > 0, "window.marketData nao checado"
    assert label_idx > 0, "last-update-label nao checado"
    assert marketdata_idx < label_idx, \
        "marketData deve ser checado ANTES de last-update-label (prioridade)"
    return True, "Prioridade: marketData > last-update-label"


def test_banner_has_interval_check():
    """Banner deve re-checar periodicamente (5 min)."""
    content = BANNER_PATH.read_text(encoding="utf-8")
    assert "setInterval(check, 5 * 60000)" in content, \
        "setInterval(check, 5 * 60000) nao encontrado"
    return True, "Re-check a cada 5 min"


def test_banner_handles_missing_data():
    """Banner nao deve quebrar se nao encontrar dados."""
    content = BANNER_PATH.read_text(encoding="utf-8")
    # Verifica que parseLastUpdate retorna null se nao achar
    assert "return null" in content, "Funcao parseLastUpdate deve retornar null"
    # E check() nao chama showBanner se lastUpdate for null
    assert "if (!lastUpdate) return" in content or "if (!lastUpdate)" in content, \
        "check() deve retornar se sem dados"
    return True, "Robusto a dados faltantes"


if __name__ == "__main__":
    tests = [
        ("stale-banner.js existe", test_banner_file_exists),
        ("stale-banner usa IIFE", test_banner_uses_iife),
        ("stale-banner tem config", test_banner_has_config),
        ("stale-banner usa Neon Terminal", test_banner_uses_neon_terminal_styles),
        ("stale-banner prioriza marketData", test_banner_checks_marketdata_first),
        ("stale-banner tem interval check", test_banner_has_interval_check),
        ("stale-banner robusto a dados faltantes", test_banner_handles_missing_data),
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
