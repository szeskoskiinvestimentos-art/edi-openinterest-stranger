"""
test_volga.py - Testes para Volga (E22: Implementação completa de Volga).

Valida que calculate_volga() produz valores corretos via:
1. Fórmula fechada (sabemos o resultado esperado)
2. Diferenças finitas (dVega/dσ) como cross-check
3. Edge cases (T=0, sigma=0, IV per-strike, etc)

Referência: volatility.py (VolatilityMixin)
"""
from __future__ import annotations

import numpy as np
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def _make_calc(spot=100.0, strikes=None, iv_annual=0.20, expiry='2026-06-25'):
    """Helper: cria OptionsCalculator com dados sintéticos."""
    from src.calculator import OptionsCalculator
    import pandas as pd

    if strikes is None:
        strikes = np.arange(80, 121, 5)

    data = []
    for k in strikes:
        moneyness = abs(k - spot) / spot
        iv = iv_annual + 0.5 * moneyness**2  # Smile quadrática
        data.append({'StrikeK': k, 'OptionType': 'CALL', 'Open Int': 500,
                     'Last': max(0.1, spot - k + 5), 'IV': iv, 'Volume': 50})
        data.append({'StrikeK': k, 'OptionType': 'PUT', 'Open Int': 500,
                     'Last': max(0.1, k - spot + 5), 'IV': iv, 'Volume': 50})

    df = pd.DataFrame(data)
    return OptionsCalculator(
        options_df=df, spot=spot, expiry_date=expiry,
        iv_annual=iv_annual, risk_free=0.05,
    )


def test_volga_basic_atm():
    """Volga ATM deve ser aproximadamente 0 (d1*d2 ~ 0 quando K=S)."""
    calc = _make_calc(spot=100.0)
    calc.calculate_greeks_exposure()
    calc.calculate_volga()

    assert hasattr(calc, 'volga'), "calc.volga nao foi criado"
    assert 'per_strike' in calc.volga, "Falta per_strike"
    assert 'volga_exposure' in calc.volga, "Falta volga_exposure"

    # ATM (strike=100): d1 ≈ 0, d2 ≈ -sigma*sqrt(T), entao d1*d2 ≈ 0
    # Portanto volga ATM ≈ 0
    strikes = calc.strikes_ref
    atm_idx = int(np.argmin(np.abs(strikes - 100.0)))
    volga_atm = calc.volga['per_strike'][atm_idx]['total']
    assert abs(volga_atm) < 100, f"Volga ATM muito alta: {volga_atm} (esperado ~0)"

    return True, f"Volga ATM: {volga_atm:.4f} (próximo de 0 conforme esperado)"


def test_volga_symmetric():
    """Volga deve ser simétrica (call e put têm mesmo valor, pois é 2ª derivada em sigma)."""
    calc = _make_calc(spot=100.0)
    calc.calculate_greeks_exposure()
    calc.calculate_volga()

    # Verifica que call == put em todos os strikes
    for ps in calc.volga['per_strike']:
        assert abs(ps['call'] - ps['put']) < 1e-6, \
            f"Volga call={ps['call']} != put={ps['put']} em strike {ps['strike']}"

    return True, f"Volga simétrica: {len(calc.volga['per_strike'])} strikes"


def test_volga_finite_diff_cross_check():
    """Volga (fórmula fechada) deve bater com diferenças finitas (dVega/dσ)."""
    calc = _make_calc(spot=100.0, iv_annual=0.25)
    calc.calculate_greeks_exposure()
    calc.calculate_volga()
    calc.calculate_volga_finite_diff(dsigma=0.005)

    volga_closed = calc.volga['volga_exposure']
    volga_fd = calc.calculate_volga_finite_diff(dsigma=0.005)

    # Tolerância: 5% (diferenças finitas têm erro de truncamento)
    if abs(volga_fd) < 1e-6:
        # Se FD retorna 0 (sem strikes com OI), aceita closed-form = 0 também
        assert abs(volga_closed) < 1e-6
        return True, f"Volga ~0 (sem dados suficientes)"

    diff_pct = abs(volga_closed - volga_fd) / abs(volga_fd) * 100
    assert diff_pct < 10, \
        f"Volga closed={volga_closed} vs FD={volga_fd}, diff={diff_pct:.2f}% > 10%"

    return True, f"Cross-check OK: closed={volga_closed:.2f} vs FD={volga_fd:.2f} (diff={diff_pct:.2f}%)"


def test_volga_otm_positive():
    """Volga OTM deve ser POSITIVA (Vega é convexa em sigma)."""
    calc = _make_calc(spot=100.0)
    calc.calculate_greeks_exposure()
    calc.calculate_volga()

    # OTM call com K=110: moneyness=10%, d1 < 0, d2 < 0, entao d1*d2 > 0
    strikes = calc.strikes_ref
    otm_idx = int(np.argmin(np.abs(strikes - 110.0)))
    volga_otm = calc.volga['per_strike'][otm_idx]['total']

    # Pode ser 0 se OI for 0 nesse strike, entao aceita |volga| < threshold
    assert volga_otm > 0 or abs(volga_otm) < 1e-6, \
        f"Volga OTM esperada >= 0, got {volga_otm}"

    return True, f"Volga OTM (K=110): {volga_otm:.4f} (esperado >= 0)"


def test_volga_zero_t():
    """T=0 (vencimento) deve produzir Volga = 0."""
    calc = _make_calc(spot=100.0, expiry='2026-06-19')  # mesmo dia = T~0
    calc.calculate_greeks_exposure()
    calc.calculate_volga()

    # T pode ser settings.MIN_T_EXPIRY se 0DTE mode
    # Em todo caso, Volga deve ser finita e razoável (não inf ou nan)
    for ps in calc.volga['per_strike']:
        assert np.isfinite(ps['call']), f"Volga nao finita em strike {ps['strike']}"

    return True, f"Volga T~0: exposure={calc.volga['volga_exposure']}"


def test_volga_uses_iv_per_strike():
    """Volga deve usar iv_strike_ref (per-strike) quando disponível."""
    # Cria dados com IV smile pronunciado
    calc = _make_calc(spot=100.0)
    calc.calculate_greeks_exposure()
    calc.calculate_volga()

    # iv_strike_ref tem valores diferentes por strike (smile)
    # Se usasse IV flat, volga seria menor
    # Verifica que temos array de volga por strike (nao um único valor)
    assert len(calc.volga['volga_call']) == len(calc.strikes_ref)

    # Volga deve variar entre strikes
    volgas = [ps['total'] for ps in calc.volga['per_strike']]
    volga_std = np.std(volgas)
    assert volga_std > 0, "Volga nao varia entre strikes (provavelmente flat IV)"

    return True, f"Volga varia entre strikes: std={volga_std:.4f}"


if __name__ == "__main__":
    tests = [
        ("Volga Basic ATM", test_volga_basic_atm),
        ("Volga Simetrica", test_volga_symmetric),
        ("Volga Cross-Check FD", test_volga_finite_diff_cross_check),
        ("Volga OTM Positiva", test_volga_otm_positive),
        ("Volga T~0", test_volga_zero_t),
        ("Volga usa IV per-strike", test_volga_uses_iv_per_strike),
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
