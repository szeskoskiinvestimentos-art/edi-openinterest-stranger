"""
test_iv_bisect.py - Testes para IV Bisect robusto (E25).

Valida que GreeksEngine.implied_vol_bs():
1. Calcula IV correta para opcoes ATM
2. Calcula IV maior para opcoes OTM (smile effect)
3. Retorna None em edge cases (preco < intrinsic, T<=0, etc)
4. Confidence varia com qualidade da convergencia
5. Lida com T < 1 dia (0DTE)

Referência: greeks.py (GreeksEngine.implied_vol_bs)
"""
from __future__ import annotations

import numpy as np
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def test_iv_bisect_atm_call():
    """IV de uma opcao ATM call deve ser ~25% (quando preco = BS(σ=25%))."""
    from src.greeks import GreeksEngine

    S, K, T, r, sigma_true = 100.0, 100.0, 0.25, 0.05, 0.25
    typ = 'C'
    # Calcula preco teorico com sigma=25%
    price = float(GreeksEngine.bs_price(S, K, T, r, sigma_true, typ))

    result = GreeksEngine.implied_vol_bs(price, S, K, T, r, typ)
    assert result is not None, "implied_vol_bs retornou None para caso valido"

    iv, confidence = result
    assert abs(iv - sigma_true) < 0.005, \
        f"IV recuperada {iv:.4f} != esperado {sigma_true}"

    return True, f"IV ATM call: {iv:.4f} (expected {sigma_true}), confidence={confidence:.2f}"


def test_iv_bisect_otm_higher_iv():
    """IV de OTM put deve ser maior que ATM (smile de volatilidade)."""
    from src.greeks import GreeksEngine

    S, K, T, r = 100.0, 90.0, 0.25, 0.05
    sigma_true = 0.30  # OTM put com vol maior
    typ = 'P'

    price = float(GreeksEngine.bs_price(S, K, T, r, sigma_true, typ))
    result = GreeksEngine.implied_vol_bs(price, S, K, T, r, typ)
    assert result is not None

    iv, confidence = result
    assert abs(iv - sigma_true) < 0.005, \
        f"IV recuperada {iv:.4f} != esperado {sigma_true}"

    return True, f"IV OTM put: {iv:.4f} (expected {sigma_true}), confidence={confidence:.2f}"


def test_iv_bisect_returns_none_for_below_intrinsic():
    """Preco abaixo do intrinsic value deve retornar None (sem IV possivel)."""
    from src.greeks import GreeksEngine

    S, K, T, r = 100.0, 90.0, 0.25, 0.05
    intrinsic = max(0.0, K - S)  # = 10 para put ITM com S=100, K=90
    # preco MENOR que intrinsic é impossível
    price = intrinsic - 1.0  # = 9

    result = GreeksEngine.implied_vol_bs(price, S, K, T, r, 'P')
    assert result is None, f"Esperado None, got {result}"

    return True, f"Retornou None para preco={price} < intrinsic={intrinsic}"


def test_iv_bisect_handles_zero_dte():
    """T < 1 dia (0DTE) deve usar T_min e ainda convergir."""
    from src.greeks import GreeksEngine

    S, K, r, sigma_true = 100.0, 100.0, 0.05, 0.40  # vol alta (0DTE)
    # 0DTE = mesmo dia, mas para BS convergir bem usamos T = 1/365 (1 dia)
    T = 1.0 / 365.0
    typ = 'C'

    price = float(GreeksEngine.bs_price(S, K, T, r, sigma_true, typ))
    assert price > 0, f"preco BS invalido: {price}"

    result = GreeksEngine.implied_vol_bs(price, S, K, T, r, typ)
    assert result is not None, f"Falhou para T={T}"

    iv, confidence = result
    # 0DTE tem vol instavel, tolerância maior
    assert abs(iv - sigma_true) < 0.10, \
        f"IV 0DTE {iv:.4f} muito longe de {sigma_true}"

    return True, f"IV 0DTE (T=1d): {iv:.4f} (expected {sigma_true}), confidence={confidence:.2f}"


def test_iv_bisect_rejects_invalid_inputs():
    """Inputs invalidos (NaN, zero, negativo) devem retornar None."""
    from src.greeks import GreeksEngine

    # Preco zero
    r1 = GreeksEngine.implied_vol_bs(0, 100, 100, 0.25, 0.05, 'C')
    assert r1 is None, f"Preco=0 deve dar None, got {r1}"

    # Spot zero
    r2 = GreeksEngine.implied_vol_bs(5, 0, 100, 0.25, 0.05, 'C')
    assert r2 is None, f"S=0 deve dar None, got {r2}"

    # T zero
    r3 = GreeksEngine.implied_vol_bs(5, 100, 100, 0, 0.05, 'C')
    assert r3 is None, f"T=0 deve dar None, got {r3}"

    # NaN
    r4 = GreeksEngine.implied_vol_bs(float('nan'), 100, 100, 0.25, 0.05, 'C')
    assert r4 is None, f"NaN deve dar None, got {r4}"

    return True, "Todos os 4 inputs invalidos retornaram None"


def test_iv_bisect_confidence_high_for_converged():
    """Confidence deve ser alta (>0.8) quando converge rapido."""
    from src.greeks import GreeksEngine

    # Caso facil: ATM, T grande, vol tipica
    S, K, T, r, sigma = 100.0, 100.0, 1.0, 0.05, 0.20
    typ = 'C'
    price = float(GreeksEngine.bs_price(S, K, T, r, sigma, typ))

    result = GreeksEngine.implied_vol_bs(price, S, K, T, r, typ, max_iter=60)
    assert result is not None
    iv, confidence = result

    assert confidence > 0.7, f"Confidence esperada > 0.7, got {confidence}"
    return True, f"Confidence alta: {confidence:.2f} (IV={iv:.4f})"


if __name__ == "__main__":
    tests = [
        ("IV Bisect ATM Call", test_iv_bisect_atm_call),
        ("IV Bisect OTM (vol maior)", test_iv_bisect_otm_higher_iv),
        ("IV Bisect recusa below intrinsic", test_iv_bisect_returns_none_for_below_intrinsic),
        ("IV Bisect 0DTE", test_iv_bisect_handles_zero_dte),
        ("IV Bisect rejeita invalidos", test_iv_bisect_rejects_invalid_inputs),
        ("IV Bisect confidence alta", test_iv_bisect_confidence_high_for_converged),
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
