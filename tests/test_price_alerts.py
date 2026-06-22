"""
test_price_alerts.py - Testes para price-alerts level detection.

Valida que dashboard_unificado/shared/js/price-alerts.js:
- Existe
- Tem syntax correta (node -c)
- Expõe EDI.priceAlerts com init/check/clear
- Detecta proximidade de max_pain
- Detecta proximidade de gamma_flip
- Detecta proximidade de wall/support/resistance
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

JS_FILE = ROOT / 'dashboard_unificado' / 'shared' / 'js' / 'price-alerts.js'


def _run_node(args: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(
        ['node', *args],
        capture_output=True,
        text=True,
        timeout=30,
    )


def test_js_file_exists():
    """price-alerts.js deve existir em dashboard_unificado/shared/js/."""
    assert JS_FILE.exists(), f"Arquivo nao encontrado: {JS_FILE}"
    return True, f"Arquivo existe: {JS_FILE.relative_to(ROOT)}"


def test_js_syntax():
    """price-alerts.js deve ter syntax valida (node -c)."""
    result = _run_node(['-c', str(JS_FILE)])
    assert result.returncode == 0, (
        f"Syntax error:\n{result.stderr}"
    )
    return True, "Syntax OK"


def test_module_exposes_edi_price_alerts():
    """Module deve exportar EDI.priceAlerts com init/check/clear."""
    code = f"""
    const m = require('{JS_FILE.as_posix()}');
    const eda = m.EDI || m.edi || (typeof EDI !== 'undefined' ? EDI : null);
    if (!eda) {{ console.error('EDI namespace not found'); process.exit(1); }}
    const pa = eda.priceAlerts;
    if (!pa) {{ console.error('EDI.priceAlerts not found'); process.exit(1); }}
    const fns = ['init', 'check', 'clear'];
    const missing = fns.filter(f => typeof pa[f] !== 'function');
    if (missing.length) {{ console.error('Missing functions: ' + missing.join(', ')); process.exit(1); }}
    console.log('OK: EDI.priceAlerts has init/check/clear');
    """
    result = _run_node(['-e', code])
    assert result.returncode == 0, (
        f"Module export check failed:\n{result.stderr}\n{result.stdout}"
    )
    return True, result.stdout.strip()


def test_detects_max_pain_proximity():
    """priceAlerts.check() deve detectar proximidade de max_pain."""
    code = f"""
    const m = require('{JS_FILE.as_posix()}');
    const EDI = m.EDI || (typeof EDI !== 'undefined' ? EDI : null);
    const pa = EDI.priceAlerts;
    pa.init({{ max_pain: 100, gamma_flip: 95, walls: [] }});
    const alerts1 = pa.check(101);
    const hit1 = alerts1.some(a => a.type === 'max_pain' || a.level === 'max_pain');
    if (!hit1) {{ console.error('max_pain not detected near 101'); process.exit(1); }}
    const alerts2 = pa.check(150);
    const hit2 = alerts2.some(a => a.type === 'max_pain' || a.level === 'max_pain');
    if (hit2) {{ console.error('max_pain falsely triggered at 150'); process.exit(1); }}
    console.log('OK: max_pain proximity detection works');
    """
    result = _run_node(['-e', code])
    assert result.returncode == 0, (
        f"max_pain detection failed:\n{result.stderr}\n{result.stdout}"
    )
    return True, result.stdout.strip()


def test_detects_gamma_flip_proximity():
    """priceAlerts.check() deve detectar proximidade de gamma_flip."""
    code = f"""
    const m = require('{JS_FILE.as_posix()}');
    const EDI = m.EDI || (typeof EDI !== 'undefined' ? EDI : null);
    const pa = EDI.priceAlerts;
    pa.init({{ max_pain: 100, gamma_flip: 95, walls: [] }});
    const alerts1 = pa.check(96);
    const hit1 = alerts1.some(a => a.type === 'gamma_flip' || a.level === 'gamma_flip');
    if (!hit1) {{ console.error('gamma_flip not detected near 96'); process.exit(1); }}
    const alerts2 = pa.check(150);
    const hit2 = alerts2.some(a => a.type === 'gamma_flip' || a.level === 'gamma_flip');
    if (hit2) {{ console.error('gamma_flip falsely triggered at 150'); process.exit(1); }}
    console.log('OK: gamma_flip proximity detection works');
    """
    result = _run_node(['-e', code])
    assert result.returncode == 0, (
        f"gamma_flip detection failed:\n{result.stderr}\n{result.stdout}"
    )
    return True, result.stdout.strip()


def test_detects_wall_proximity():
    """priceAlerts.check() deve detectar proximidade de wall/support/resistance."""
    code = f"""
    const m = require('{JS_FILE.as_posix()}');
    const EDI = m.EDI || (typeof EDI !== 'undefined' ? EDI : null);
    const pa = EDI.priceAlerts;
    pa.init({{
        max_pain: 100,
        gamma_flip: 95,
        walls: [{{ price: 90, type: 'support' }}, {{ price: 110, type: 'resistance' }}]
    }});
    const alerts1 = pa.check(91);
    const hit1 = alerts1.some(a => a.type === 'wall' || a.type === 'support');
    if (!hit1) {{ console.error('wall/support not detected near 91'); process.exit(1); }}
    const alerts2 = pa.check(109);
    const hit2 = alerts2.some(a => a.type === 'wall' || a.type === 'resistance');
    if (!hit2) {{ console.error('wall/resistance not detected near 109'); process.exit(1); }}
    const alerts3 = pa.check(150);
    const hit3 = alerts3.some(a => a.type === 'wall' || a.type === 'support' || a.type === 'resistance');
    if (hit3) {{ console.error('wall falsely triggered at 150'); process.exit(1); }}
    console.log('OK: wall proximity detection works');
    """
    result = _run_node(['-e', code])
    assert result.returncode == 0, (
        f"wall detection failed:\n{result.stderr}\n{result.stdout}"
    )
    return True, result.stdout.strip()


if __name__ == "__main__":
    tests = [
        ("price-alerts.js existe", test_js_file_exists),
        ("price-alerts tem syntax valida", test_js_syntax),
        ("module expoe EDI.priceAlerts", test_module_exposes_edi_price_alerts),
        ("detecta max_pain proximity", test_detects_max_pain_proximity),
        ("detecta gamma_flip proximity", test_detects_gamma_flip_proximity),
        ("detecta wall proximity", test_detects_wall_proximity),
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
