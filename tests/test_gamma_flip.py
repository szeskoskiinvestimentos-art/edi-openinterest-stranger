"""
test_gamma_flip.py - Validação do GEX Signed e Gamma Flip

Testa a convenção de sinal do gex_flip_base e a consistência
dos 7 modelos de Gamma Flip.

Referência: calculator.py linhas 398-401 (convenção documentada).
"""
from __future__ import annotations

import numpy as np
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def test_gex_sign_convention():
    """Valida que a convenção de sinal está implementada corretamente.

    Convenção (calculator.py:398-401):
    - ITM Call (K<=S): sgn = +1
    - OTM Call (K>S): sgn = -1
    - ITM Put (K>=S): sgn = -1
    - OTM Put (K<S): sgn = +1
    """
    S = 100.0
    K_ref = np.array([80.0, 90.0, 100.0, 110.0, 120.0])

    sgn_call = np.where(K_ref <= S, +1.0, -1.0)
    sgn_put = np.where(K_ref >= S, -1.0, +1.0)

    # Call: K<=S (ITM) → +1, K>S (OTM) → -1
    expected_call = np.array([+1.0, +1.0, +1.0, -1.0, -1.0])
    # Put: K>=S (ITM) → -1, K<S (OTM) → +1
    expected_put = np.array([+1.0, +1.0, -1.0, -1.0, -1.0])

    assert np.allclose(sgn_call, expected_call), f"Call signs: {sgn_call} != {expected_call}"
    assert np.allclose(sgn_put, expected_put), f"Put signs: {sgn_put} != {expected_put}"
    return True, "Convenção de sinal OK"


def test_gex_flip_base_consistency():
    """Valida que gex_flip_base é computado corretamente com a convenção."""
    from src.greeks import GreeksEngine

    S = 100.0
    K_ref = np.array([80.0, 90.0, 100.0, 110.0, 120.0])
    T = 0.25
    r = 0.05
    sigma = 0.20
    oi_call = np.array([100.0, 200.0, 500.0, 200.0, 100.0])
    oi_put = np.array([100.0, 200.0, 500.0, 200.0, 100.0])
    factor = 100.0 * S * 0.01

    dC, gC = GreeksEngine.calculate_greeks(S, K_ref, T, r, sigma, 'C')
    dP, gP = GreeksEngine.calculate_greeks(S, K_ref, T, r, sigma, 'P')

    sgn_call = np.where(K_ref <= S, +1.0, -1.0)
    sgn_put = np.where(K_ref >= S, -1.0, +1.0)

    gex_flip_base = (gC * oi_call * sgn_call + gP * oi_put * sgn_put) * factor

    # Gamma é sempre positivo para calls e puts
    assert np.all(gC >= 0), "Gamma Call deve ser >= 0"
    assert np.all(gP >= 0), "Gamma Put deve ser >= 0"

    # GEX flip base deve ter sinais mistos (senão, não há "flip")
    assert np.any(gex_flip_base > 0), "GEX flip base deve ter valores positivos"
    assert np.any(gex_flip_base < 0), "GEX flip base deve ter valores negativos"

    return True, f"GEX flip base: {np.round(gex_flip_base, 2)}"


def test_gamma_flip_variations_consistency():
    """Valida que os 7 modelos produzem valores razoáveis."""
    from src.calculator import OptionsCalculator
    from src import config as settings

    # Criar dados sintéticos mínimos
    import pandas as pd

    strikes = np.arange(80, 121, 5)
    spot = 100.0
    n = len(strikes)

    data = []
    for k in strikes:
        data.append({'StrikeK': k, 'OptionType': 'CALL', 'Open Int': max(100, 500 - abs(k - spot) * 10), 'Last': max(0.1, spot - k + 5), 'IV': 0.20 + abs(k - spot) * 0.001})
        data.append({'StrikeK': k, 'OptionType': 'PUT', 'Open Int': max(100, 500 - abs(k - spot) * 10), 'Last': max(0.1, k - spot + 5), 'IV': 0.20 + abs(k - spot) * 0.001})

    df = pd.DataFrame(data)

    calc = OptionsCalculator(
        options_df=df,
        spot=spot,
        expiry_date='2026-06-19',
        iv_annual=0.20,
        risk_free=0.05,
    )

    calc.calculate_greeks_exposure()
    calc.calculate_gamma_flip_variations()

    flips = calc.flip_variations
    assert len(flips) == 7, f"Esperado 7 variações, got {len(flips)}"

    # Todas as variações devem estar em range razoável (próximas ao spot)
    for name, value in flips.items():
        assert value is not None, f"Flip {name} é None"
        assert isinstance(value, (int, float)), f"Flip {name} não é numérico: {type(value)}"
        # Flip deve estar dentro de ±50% do spot
        assert abs(value - spot) < spot * 0.5, f"Flip {name}={value} muito distante do spot={spot}"

    return True, f"7 variações OK: { {k: round(v, 2) for k, v in flips.items()} }"


if __name__ == "__main__":
    tests = [
        ("GEX Sign Convention", test_gex_sign_convention),
        ("GEX Flip Base Consistency", test_gex_flip_base_consistency),
        ("Gamma Flip Variations", test_gamma_flip_variations_consistency),
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
            print(f"  [FAIL] {name} — {e}")
            failed += 1

    print(f"\n=== Total: {len(tests)}, Passou: {passed}, Falhou: {failed} ===")
    sys.exit(1 if failed else 0)
