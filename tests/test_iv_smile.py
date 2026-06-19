"""
test_iv_smile.py - Validação do IV Per-Strike (IV Smile)

Testa que o IV por strike é corretamente integrado no cálculo de Greeks,
produzindo um IV Smile (curva) em vez de IV flat.

Referência: calculator.py linhas 313-352 (integração IV per-strike).
"""
from __future__ import annotations

import numpy as np
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def test_iv_per_strike_used_in_greeks():
    """Valida que IV per-strike é usado para Delta/Gamma (não flat)."""
    from src.calculator import OptionsCalculator
    import pandas as pd

    strikes = np.arange(80, 121, 5)
    spot = 100.0

    # Criar dados com IV Smile: OTM calls têm IV maior, ATM tem IV menor
    data = []
    for k in strikes:
        # IV Smile: menor ATM (k=100), maior para longe do ATM
        moneyness = abs(k - spot) / spot
        iv = 0.20 + 0.5 * moneyness**2  # Smile quadrática

        data.append({'StrikeK': k, 'OptionType': 'CALL', 'Open Int': 500, 'Last': max(0.1, spot - k + 5), 'IV': iv})
        data.append({'StrikeK': k, 'OptionType': 'PUT', 'Open Int': 500, 'Last': max(0.1, k - spot + 5), 'IV': iv})

    df = pd.DataFrame(data)

    calc = OptionsCalculator(
        options_df=df,
        spot=spot,
        expiry_date='2026-06-19',
        iv_annual=0.20,  # Flat IV para comparação
        risk_free=0.05,
    )

    # Verificar que iv_strike_ref foi calculado
    assert calc.iv_strike_ref is not None, "iv_strike_ref não foi calculado"
    assert len(calc.iv_strike_ref) == len(strikes), f"iv_strike_ref tem {len(calc.iv_strike_ref)} elementos, esperado {len(strikes)}"

    # Verificar que IV per-strike NÃO é flat
    iv_std = np.std(calc.iv_strike_ref)
    assert iv_std > 0.001, f"iv_strike_ref parece flat (std={iv_std:.6f}), esperado variável"

    # Calcular Greeks
    calc.calculate_greeks_exposure()

    # Verificar que Delta e Gamma foram calculados
    assert hasattr(calc, 'dexp_tot'), "dexp_tot não foi calculado"
    assert hasattr(calc, 'gex_tot'), "gex_tot não foi calculado"
    assert np.any(calc.dexp_tot != 0), "dexp_tot é todo zero"
    assert np.any(calc.gex_tot != 0), "gex_tot é todo zero"

    return True, f"IV per-strike OK: std={iv_std:.4f}, range=[{calc.iv_strike_ref.min():.4f}, {calc.iv_strike_ref.max():.4f}]"


def test_iv_smile_produces_different_greeks():
    """Valida que IV per-strike produz Greeks diferentes de IV flat."""
    from src.calculator import OptionsCalculator
    import pandas as pd

    strikes = np.arange(80, 121, 5)
    spot = 100.0

    # Criar dados com IV Smile pronunciado
    data = []
    for k in strikes:
        moneyness = abs(k - spot) / spot
        iv = 0.20 + 1.0 * moneyness**2  # Smile forte

        data.append({'StrikeK': k, 'OptionType': 'CALL', 'Open Int': 500, 'Last': max(0.1, spot - k + 5), 'IV': iv})
        data.append({'StrikeK': k, 'OptionType': 'PUT', 'Open Int': 500, 'Last': max(0.1, k - spot + 5), 'IV': iv})

    df = pd.DataFrame(data)

    # Calcular com IV per-strike
    calc_smile = OptionsCalculator(
        options_df=df,
        spot=spot,
        expiry_date='2026-06-19',
        iv_annual=0.20,
        risk_free=0.05,
    )
    calc_smile.calculate_greeks_exposure()

    # Calcular com IV flat (simular forçando iv_strike_ref = flat)
    calc_flat = OptionsCalculator(
        options_df=df,
        spot=spot,
        expiry_date='2026-06-19',
        iv_annual=0.20,
        risk_free=0.05,
    )
    calc_flat.iv_strike_ref = np.full_like(calc_flat.strikes_ref, 0.20, dtype=float)
    calc_flat.calculate_greeks_exposure()

    # GEX deve ser diferente (IV Smile afeta Gamma)
    gex_diff = np.abs(calc_smile.gex_tot - calc_flat.gex_tot)
    assert np.any(gex_diff > 1e-6), f"GEX identical between Smile and Flat (max diff={gex_diff.max():.2e})"

    return True, f"IV Smile produz GEX diferente: max diff={gex_diff.max():.2f}"


def test_iv_skew_computed():
    """Valida que IV Skew é computado como derivada do IV per-strike."""
    from src.calculator import OptionsCalculator
    import pandas as pd

    strikes = np.arange(80, 121, 5)
    spot = 100.0

    data = []
    for k in strikes:
        moneyness = abs(k - spot) / spot
        iv = 0.20 + 0.5 * moneyness**2

        data.append({'StrikeK': k, 'OptionType': 'CALL', 'Open Int': 500, 'Last': max(0.1, spot - k + 5), 'IV': iv})
        data.append({'StrikeK': k, 'OptionType': 'PUT', 'Open Int': 500, 'Last': max(0.1, k - spot + 5), 'IV': iv})

    df = pd.DataFrame(data)

    calc = OptionsCalculator(
        options_df=df,
        spot=spot,
        expiry_date='2026-06-19',
        iv_annual=0.20,
        risk_free=0.05,
    )

    # iv_skew é calculado em calculate_greeks_exposure()
    calc.calculate_greeks_exposure()

    assert hasattr(calc, 'iv_skew'), "iv_skew não foi calculado"
    assert len(calc.iv_skew) == len(strikes), f"iv_skew tem {len(calc.iv_skew)} elementos"

    # Para IV Smile quadrática, skew deve ser:
    # Negativo para K < ATM (IV decrescente)
    # Zero no ATM
    # Positivo para K > ATM (IV crescente)
    mid_idx = len(strikes) // 2
    assert calc.iv_skew[mid_idx] < 0.01, f"Skew no ATM deve ser ~0, got {calc.iv_skew[mid_idx]:.4f}"

    return True, f"IV Skew OK: {np.round(calc.iv_skew, 4)}"


if __name__ == "__main__":
    tests = [
        ("IV Per-Strike Used in Greeks", test_iv_per_strike_used_in_greeks),
        ("IV Smile Produces Different Greeks", test_iv_smile_produces_different_greeks),
        ("IV Skew Computed", test_iv_skew_computed),
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
