"""
test_veta.py - Testes para Veta (E22/E51: Greek de 2a ordem).
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.calculator.veta import (
    VetaCalculator,
    veta_call,
    veta_put,
    veta_via_finite_diff,
)


PARAMS = {
    "S": 100.0,
    "K": 100.0,  # ATM
    "T": 0.25,   # 3 meses
    "r": 0.05,
    "sigma": 0.20,
}


def test_veta_call_atm_basic() -> tuple[bool, str]:
    """Veta ATM de call e' finita e razoavel."""
    p = PARAMS
    v = veta_call(p["S"], p["K"], p["T"], p["r"], p["sigma"])
    if not np.isfinite(v):
        return False, f"Veta nao finita: {v}"
    # Veta tipico: ~30-50 para S=100, sigma=0.20, T=0.25 (ATM)
    if abs(v) > 200.0:
        return False, f"|Veta| muito grande: {v}"
    return True, f"Veta ATM = {v:.4f}"


def test_veta_put_equals_call() -> tuple[bool, str]:
    """Veta de put == Veta de call (em BS sem dividendos)."""
    p = PARAMS
    v_call = veta_call(p["S"], p["K"], p["T"], p["r"], p["sigma"])
    v_put = veta_put(p["S"], p["K"], p["T"], p["r"], p["sigma"])
    if not abs(v_call - v_put) < 1e-10:
        return False, f"Call != Put: {v_call} vs {v_put}"
    return True, f"Veta put = Veta call = {v_call:.4f}"


def test_veta_finite_diff_matches_closed_form() -> tuple[bool, str]:
    """Veta finite diff bate com formula fechada (cross-check)."""
    p = PARAMS
    v_closed = veta_call(p["S"], p["K"], p["T"], p["r"], p["sigma"])
    v_fd = veta_via_finite_diff(p["S"], p["K"], p["T"], p["r"], p["sigma"])
    diff = abs(v_closed - v_fd)
    # Tolerancia: 1% (FD tem erro de truncamento)
    if diff > 0.01 * abs(v_closed):
        return False, f"Closed={v_closed:.4f} vs FD={v_fd:.4f}, diff={diff:.4f}"
    return True, f"Closed={v_closed:.4f}, FD={v_fd:.4f} (diff={diff:.4f})"


def test_veta_at_T_zero() -> tuple[bool, str]:
    """T=0 -> Veta = 0 (sem tempo, sem sensibilidade a T)."""
    p = PARAMS
    v = veta_call(p["S"], p["K"], 0.0, p["r"], p["sigma"])
    if v != 0.0:
        return False, f"T=0 deveria dar 0, got {v}"
    return True, f"T=0 -> Veta=0"


def test_veta_class_consistency() -> tuple[bool, str]:
    """VetaCalculator.veta_call() == veta_call() function."""
    p = PARAMS
    calc = VetaCalculator(p["S"], p["K"], p["T"], p["r"], p["sigma"])
    v_oo = calc.veta_call()
    v_fn = veta_call(p["S"], p["K"], p["T"], p["r"], p["sigma"])
    if abs(v_oo - v_fn) > 1e-10:
        return False, f"OO={v_oo} vs func={v_fn}"
    return True, f"OO = func: {v_oo:.4f}"


def test_veta_invalid_params_raises() -> tuple[bool, str]:
    """VetaCalculator valida parametros."""
    cases = [
        ("S negativo", dict(S=-1, K=100, T=0.25, r=0.05, sigma=0.2)),
        ("sigma negativo", dict(S=100, K=100, T=0.25, r=0.05, sigma=-0.1)),
        ("T > 30", dict(S=100, K=100, T=100, r=0.05, sigma=0.2)),
    ]
    for name, kw in cases:
        try:
            VetaCalculator(**kw)
        except ValueError:
            continue
        return False, f"{name}: deveria levantar ValueError"
    return True, "3/3 casos rejeitados"


def test_veta_larger_T_smaller_magnitude() -> tuple[bool, str]:
    """Variação com T: |Veta| geralmente diminui quando T cresce (Vega mais estavel)."""
    p = PARAMS
    v_short = veta_call(p["S"], p["K"], 0.1, p["r"], p["sigma"])
    v_long = veta_call(p["S"], p["K"], 1.0, p["r"], p["sigma"])
    if not (np.isfinite(v_short) and np.isfinite(v_long)):
        return False, f"NaN: short={v_short}, long={v_long}"
    # Tipicamente, |Veta| e maior em T curto
    if abs(v_short) <= abs(v_long):
        return False, f"|Veta| deveria diminuir com T: short={v_short}, long={v_long}"
    return True, f"T=0.1: {v_short:.4f}, T=1.0: {v_long:.4f}"
