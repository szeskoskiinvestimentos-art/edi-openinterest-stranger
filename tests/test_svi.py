"""
test_svi.py - Testes para E54 (SVI - Stochastic Volatility Inspired).

Valida:
- Vol implicita varia com k (smile)
- Fit recupera parametros conhecidos
- Skew com rho negativo
- Constraint Gatheral (no-arbitrage)
- ATM variance > 0
- Vol array (mapeamento)
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.calculator.svi import (
    SVIModel,
    svi_implied_variance,
    svi_implied_vol,
)


# Parametros "tipicos" (skew negativo, ATM vol ~20%)
PARAMS_TYPICAL = {
    "a": 0.02,        # nivel de variancia
    "b": 0.30,        # amplitude do smile
    "rho": -0.60,     # skew negativo
    "m": 0.0,         # ATM
    "sigma": 0.20,    # smoothness
}


def test_svi_smoke_basic() -> tuple[bool, str]:
    """SVIModel construtor com parametros tipicos funciona."""
    try:
        m = SVIModel(**PARAMS_TYPICAL)
    except Exception as e:
        return False, f"Construtor falhou: {e}"
    return True, f"OK: {m}"


def test_svi_implied_vol_atm() -> tuple[bool, str]:
    """ATM vol (k=0) deve ser razoavel."""
    p = PARAMS_TYPICAL
    m = SVIModel(**p)
    vol_atm = m.implied_vol(k=0.0, T=0.25)
    # ATM variance = a + b*(-rho*m + sqrt(m^2+sigma^2)) para m=0
    # = a + b*sigma = 0.02 + 0.30*0.20 = 0.08
    # sigma_impl = sqrt(0.08/0.25) = sqrt(0.32) = 0.566
    if not np.isfinite(vol_atm):
        return False, f"Vol nao finita: {vol_atm}"
    if vol_atm < 0.1 or vol_atm > 2.0:
        return False, f"Vol ATM fora do range razoavel: {vol_atm}"
    return True, f"Vol ATM (T=0.25) = {vol_atm:.4f}"


def test_svi_skew_with_negative_rho() -> tuple[bool, str]:
    """rho negativo -> vol OTM put (k<0) > vol OTM call (k>0)."""
    p = PARAMS_TYPICAL
    m = SVIModel(**p)
    vol_put_otm = m.implied_vol(k=-0.20, T=0.25)
    vol_call_otm = m.implied_vol(k=0.20, T=0.25)

    if not (np.isfinite(vol_put_otm) and np.isfinite(vol_call_otm)):
        return False, f"NaN: put={vol_put_otm}, call={vol_call_otm}"
    if vol_put_otm <= vol_call_otm:
        return False, f"Skew negativo esperado: put_OTM > call_OTM. Got put={vol_put_otm}, call={vol_call_otm}"
    return True, f"put_OTM={vol_put_otm:.4f} > call_OTM={vol_call_otm:.4f}"


def test_svi_function_matches_class() -> tuple[bool, str]:
    """svi_implied_vol() bate com SVIModel.implied_vol()."""
    p = PARAMS_TYPICAL
    m = SVIModel(**p)
    k_test = np.array([-0.3, -0.1, 0.0, 0.1, 0.3])
    T = 0.5

    vol_class = m.implied_vol(k_test, T)
    vol_func = svi_implied_vol(k_test, T, p["a"], p["b"], p["rho"], p["m"], p["sigma"])

    if not np.allclose(vol_class, vol_func, rtol=1e-10):
        return False, f"Divergem: class={vol_class}, func={vol_func}"
    return True, f"Class = func: max diff = {np.max(np.abs(vol_class - vol_func)):.2e}"


def test_svi_invalid_params_raises() -> tuple[bool, str]:
    """SVIModel valida parametros fora do range / constraint violada."""
    cases = [
        ("b negativo", dict(a=0.02, b=-0.30, rho=-0.6, m=0.0, sigma=0.2)),
        ("|rho| > 1", dict(a=0.02, b=0.30, rho=1.5, m=0.0, sigma=0.2)),
        ("sigma negativo", dict(a=0.02, b=0.30, rho=-0.6, m=0.0, sigma=-0.2)),
        # Constraint Gatheral violada: a + b*sigma*sqrt(1-rho^2) < 0
        ("constraint violada", dict(a=-0.10, b=0.30, rho=-0.6, m=0.0, sigma=0.2)),
    ]
    for name, kw in cases:
        try:
            SVIModel(**kw)
        except ValueError:
            continue
        return False, f"{name}: deveria levantar ValueError"
    return True, "4/4 casos rejeitados"


def test_svi_fit_recovers_params() -> tuple[bool, str]:
    """fit() recupera parametros proximos do original."""
    # Gerar vols de mercado com SVI
    true_params = dict(a=0.025, b=0.30, rho=-0.60, m=0.0, sigma=0.20)
    true_model = SVIModel(**true_params)
    k_market = np.array([-0.30, -0.20, -0.10, 0.0, 0.10, 0.20, 0.30])
    T = 0.5
    market_vols = true_model.implied_vol(k_market, T)

    # Fit com initial guess diferente
    initial = SVIModel(a=0.05, b=0.20, rho=-0.30, m=0.05, sigma=0.30)
    fitted = initial.fit(k_market, market_vols, T)

    if not isinstance(fitted, SVIModel):
        return False, f"Retorno nao e SVIModel: {type(fitted)}"

    # Erro de fit em vols
    fitted_vols = fitted.implied_vol(k_market, T)
    if not np.all(np.isfinite(fitted_vols)):
        return False, f"Vols fitted tem NaN: {fitted_vols}"

    max_err = np.max(np.abs(fitted_vols - market_vols))
    # Tolerancia: 1% em vol absoluta
    if max_err > 0.02:
        return False, f"Erro de fit grande: max diff = {max_err:.4f} (mercado ~0.4-0.5)"

    return True, f"Fit OK: max diff = {max_err:.4f}, params = {fitted}"
