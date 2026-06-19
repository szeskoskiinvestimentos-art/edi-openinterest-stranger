"""Basic tests for src/charts.py."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import plotly.graph_objects as go


def _build_metrics(calc):
    """Build a minimal metrics dict for chart generation."""
    calc.calculate_greeks_exposure()
    calc.calculate_flips_and_walls()
    calc.calculate_expected_moves()

    sf = 1.0
    strikes = calc.strikes_ref
    spot = calc.spot

    delta_agregado = float(calc.dexp_cum[len(calc.dexp_cum) // 2])
    dpi_arr = calc.vanna_tot.copy()

    regime = 'Positivo' if calc.gamma_flip and spot > calc.gamma_flip else 'Negativo'

    return {
        'spot': spot,
        'delta_agregado': delta_agregado,
        'gamma_flip': calc.gamma_flip,
        'zero_gamma_level': calc.gamma_flip,
        'max_pain': calc.max_pain,
        'call_wall': calc.call_wall if hasattr(calc, 'call_wall') else float(strikes[len(strikes) // 2]),
        'put_wall': calc.put_wall if hasattr(calc, 'put_wall') else float(strikes[len(strikes) // 2]),
        'regime': regime,
        'dealer_pressure': 0.5,
        'dpi_arr': dpi_arr,
        'range_low': float(strikes.min()),
        'range_high': float(strikes.max()),
        'walls_call_txt': 'N/A',
        'walls_put_txt': 'N/A',
        'iv_daily': 0.20,
        'expected_moves': [],
        'vol_analysis': {},
        'pinning_risk': None,
    }


def test_create_dashboard_figure_is_plotly():
    """create_dashboard_figure() should return a plotly Figure."""
    from tests.conftest import simple_calc
    calc = simple_calc()
    calc.calculate_greeks_exposure()
    metrics = _build_metrics(calc)
    from src.charts import create_dashboard_figure
    fig = create_dashboard_figure(calc, metrics)
    assert isinstance(fig, go.Figure), f"Expected Figure, got {type(fig)}"
    return True, f"Figure type={type(fig).__name__}"


def test_create_dashboard_figure_no_exceptions():
    """create_dashboard_figure() should not raise with valid data."""
    from tests.conftest import simple_calc
    calc = simple_calc()
    calc.calculate_greeks_exposure()
    metrics = _build_metrics(calc)
    from src.charts import create_dashboard_figure
    try:
        fig = create_dashboard_figure(calc, metrics)
    except Exception as e:
        raise AssertionError(f"create_dashboard_figure raised: {e}")
    assert fig is not None
    return True, "OK"


if __name__ == "__main__":
    tests = [
        ("Dashboard Figure is Plotly", test_create_dashboard_figure_is_plotly),
        ("Dashboard Figure no exceptions", test_create_dashboard_figure_no_exceptions),
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
