"""Basic tests for src/ntsl.py."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def _build_metrics(calc):
    """Build a minimal metrics dict for NTSL generation."""
    calc.calculate_greeks_exposure()
    calc.calculate_flips_and_walls()
    calc.calculate_expected_moves()

    spot = calc.spot
    strikes = calc.strikes_ref

    return {
        'spot': spot,
        'delta_agregado': float(calc.dexp_cum[len(calc.dexp_cum) // 2]),
        'gamma_flip': calc.gamma_flip,
        'zero_gamma_level': calc.gamma_flip,
        'max_pain': calc.max_pain,
        'call_wall': calc.call_wall if hasattr(calc, 'call_wall') else float(strikes[len(strikes) // 2]),
        'put_wall': calc.put_wall if hasattr(calc, 'put_wall') else float(strikes[len(strikes) // 2]),
        'effective_call_wall': getattr(calc, 'effective_call_wall', None),
        'effective_put_wall': getattr(calc, 'effective_put_wall', None),
        'regime': 'Positivo',
        'dealer_pressure': 0.5,
        'range_low': float(strikes.min()),
        'range_high': float(strikes.max()),
        'expected_moves': [],
        'walls_call_txt': 'N/A',
        'walls_put_txt': 'N/A',
        'iv_daily': 0.20,
        'vol_analysis': {},
        'pinning_risk': None,
    }


def test_generate_ntsl_script_returns_string():
    """generate_ntsl_script() should return a non-empty string."""
    from tests.conftest import simple_calc
    calc = simple_calc()
    metrics = _build_metrics(calc)
    from src.ntsl import generate_ntsl_script
    result = generate_ntsl_script(metrics, calc)
    assert isinstance(result, str), f"Expected str, got {type(result)}"
    assert len(result) > 0, "Script is empty"
    return True, f"len={len(result)}"


def test_generate_ntsl_script_contains_keywords():
    """generate_ntsl_script() script should contain expected NTSL keywords."""
    from tests.conftest import simple_calc
    calc = simple_calc()
    metrics = _build_metrics(calc)
    from src.ntsl import generate_ntsl_script
    script = generate_ntsl_script(metrics, calc)

    required_keywords = ['HorizontalLine', 'clBlue', 'clRed', 'begin', 'end']
    missing = [kw for kw in required_keywords if kw not in script]
    assert not missing, f"Missing keywords: {missing}"
    return True, f"all {len(required_keywords)} keywords present"


if __name__ == "__main__":
    tests = [
        ("NTSL script non-empty string", test_generate_ntsl_script_returns_string),
        ("NTSL script contains keywords", test_generate_ntsl_script_contains_keywords),
    ]
    passed = 0
    failed = 0
    for name, fn in tests:
        try:
            fn()
            print(f"  [OK ] {name}")
            passed += 1
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"  [FAIL] {name} — {e}")
            failed += 1
    print(f"\n=== Total: {len(tests)}, Passou: {passed}, Falhou: {failed} ===")
    sys.exit(1 if failed else 0)
