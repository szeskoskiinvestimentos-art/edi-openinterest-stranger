"""
test_kaniadakis.py - Testes para E78 (Kaniadakis κ-Gaussian Jump-Diffusion).

Valida:
- exp_κ(1, 0) == exp(1) (limite Gaussiano)
- Call ATM com kappa=0 (degenerate em Merton)
- Heavy tails (kappa>0) -> call mais cara
- Light tails (kappa<0) -> call mais barata
- ITM > OTM
- Edge case lambda=0 -> BS
- T=0 -> intrinsic
- Validacao de parametros
- KaniadakisJumpModel class (OO)
- is_gaussian / is_heavy_tailed / is_light_tailed / tail_factor
- Repr tem 5 campos
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.calculator.kaniadakis import (
    KaniadakisJumpModel,
    kaniadakis_call_price,
    kaniadakis_put_price,
    _exp_kappa,
)
from src.calculator.merton import merton_call_price


# Parametros tipicos
PARAMS_TYPICAL = {
    "S0": 5000.0,
    "K": 5000.0,
    "T": 0.25,
    "r": 0.10,
    "sigma": 0.20,
    "kappa": 0.5,    # heavy tails
    "lam": 1.0,
    "mu_J": -0.05,
    "sigma_J": 0.15,
}


def test_exp_kappa_at_zero_is_exp() -> tuple[bool, str]:
    """exp_κ(x, 0) == exp(x) para qualquer x (limite Gaussiano)."""
    for x in [-2.0, -0.5, 0.0, 0.5, 2.0]:
        actual = _exp_kappa(x, 0.0)
        expected = math.exp(x)
        if abs(actual - expected) > 1e-9:
            return False, f"exp_κ({x}, 0) = {actual} != exp({x}) = {expected}"
    return True, f"exp_κ(x, 0) == exp(x) para 5 valores testados"


def test_exp_kappa_positive_and_negative() -> tuple[bool, str]:
    """exp_κ(1, +κ) == exp_κ(1, -κ) (simetria por sinal)."""
    for k in [0.1, 0.3, 0.5, 0.9]:
        v_pos = _exp_kappa(1.0, k)
        v_neg = _exp_kappa(1.0, -k)
        if abs(v_pos - v_neg) > 1e-9:
            return False, f"exp_κ(1, ±{k}): {v_pos} vs {v_neg} (devem ser iguais)"
    return True, "exp_κ(1, +κ) == exp_κ(1, -κ) verificado"


def test_kaniadakis_call_atm_basic() -> tuple[bool, str]:
    """Call ATM com kappa>0 retorna valor positivo razoavel."""
    p = PARAMS_TYPICAL
    call = kaniadakis_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["sigma"], p["kappa"], p["lam"], p["mu_J"], p["sigma_J"],
    )
    if not np.isfinite(call):
        return False, f"Call ATM nao finita: {call}"
    if call <= 0:
        return False, f"Call ATM deve ser > 0, got {call}"
    if call < 0.001 * p["S0"] or call > 0.3 * p["S0"]:
        return False, f"Call ATM fora do range: {call} (spot={p['S0']})"
    return True, f"Call ATM = {call:.4f}"


def test_kaniadakis_kappa_zero_is_merton() -> tuple[bool, str]:
    """Edge case: kappa=0 -> degenera em Merton classico."""
    p = PARAMS_TYPICAL
    c_kan = kaniadakis_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["sigma"], kappa=0.0, lam=p["lam"], mu_J=p["mu_J"], sigma_J=p["sigma_J"],
    )
    c_mer = merton_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        sigma=p["sigma"], lam=p["lam"], mu_J=p["mu_J"], sigma_J=p["sigma_J"],
    )
    if not (np.isfinite(c_kan) and np.isfinite(c_mer)):
        return False, f"Valores nao finitos: kan={c_kan}, mert={c_mer}"
    if abs(c_kan - c_mer) > 0.5:
        return False, f"Kan(κ=0) deve == Merton: {c_kan} vs {c_mer}"
    return True, f"Kan(κ=0)={c_kan:.4f} == Merton={c_mer:.4f}"


def test_kaniadakis_lambda_zero_is_bs() -> tuple[bool, str]:
    """Edge case: lambda=0 -> sem saltos -> Black-Scholes."""
    p = PARAMS_TYPICAL
    c_kan = kaniadakis_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["sigma"], p["kappa"], lam=0.0, mu_J=p["mu_J"], sigma_J=p["sigma_J"],
    )
    # BS com vol=sigma
    from src.calculator.kaniadakis import _bs_call
    c_bs = _bs_call(p["S0"], p["K"], p["T"], p["r"], p["sigma"])
    if not (np.isfinite(c_kan) and np.isfinite(c_bs)):
        return False, f"Valores nao finitos: kan={c_kan}, bs={c_bs}"
    if abs(c_kan - c_bs) > 0.5:
        return False, f"Kan(λ=0) deve == BS: {c_kan} vs {c_bs}"
    return True, f"Kan(λ=0)={c_kan:.4f} == BS={c_bs:.4f}"


def test_kaniadakis_heavy_vs_light_tails() -> tuple[bool, str]:
    """Caudas pesadas (κ>0) -> call mais cara que caudas leves (κ<0)."""
    p = PARAMS_TYPICAL
    c_heavy = kaniadakis_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["sigma"], kappa=0.5, lam=p["lam"], mu_J=p["mu_J"], sigma_J=p["sigma_J"],
    )
    c_light = kaniadakis_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["sigma"], kappa=-0.5, lam=p["lam"], mu_J=p["mu_J"], sigma_J=p["sigma_J"],
    )
    c_gauss = kaniadakis_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["sigma"], kappa=0.0, lam=p["lam"], mu_J=p["mu_J"], sigma_J=p["sigma_J"],
    )
    if not all(np.isfinite([c_heavy, c_light, c_gauss])):
        return False, f"Valores nao finitos: heavy={c_heavy}, light={c_light}, gauss={c_gauss}"
    if not (c_heavy > c_gauss > c_light):
        return False, f"Ordem esperada: heavy > gauss > light. Got: H={c_heavy:.2f}, G={c_gauss:.2f}, L={c_light:.2f}"
    return True, f"H={c_heavy:.2f} > G={c_gauss:.2f} > L={c_light:.2f} ✓"


def test_kaniadakis_call_itm_otm() -> tuple[bool, str]:
    """Call ITM > Call OTM (mesma T, mesmo modelo)."""
    p = PARAMS_TYPICAL
    call_itm = kaniadakis_call_price(
        p["S0"], p["K"] * 0.95, p["T"], p["r"],
        p["sigma"], p["kappa"], p["lam"], p["mu_J"], p["sigma_J"],
    )
    call_otm = kaniadakis_call_price(
        p["S0"], p["K"] * 1.10, p["T"], p["r"],
        p["sigma"], p["kappa"], p["lam"], p["mu_J"], p["sigma_J"],
    )
    if not (np.isfinite(call_itm) and np.isfinite(call_otm)):
        return False, f"Valores nao finitos: ITM={call_itm}, OTM={call_otm}"
    if call_itm <= call_otm:
        return False, f"ITM deve custar mais que OTM: {call_itm} vs {call_otm}"
    return True, f"ITM={call_itm:.2f}, OTM={call_otm:.2f}"


def test_kaniadakis_zero_T_returns_intrinsic() -> tuple[bool, str]:
    """T=0 -> intrinsic value max(S0 - K, 0)."""
    p = PARAMS_TYPICAL
    call = kaniadakis_call_price(
        p["S0"], p["K"], 0.0, p["r"],
        p["sigma"], p["kappa"], p["lam"], p["mu_J"], p["sigma_J"],
    )
    intrinsic = max(0.0, p["S0"] - p["K"])
    if not np.isfinite(call):
        return False, f"Call T=0 nao finita: {call}"
    if abs(call - intrinsic) > 1e-6:
        return False, f"T=0 deve dar intrinseco: {call} vs {intrinsic}"
    return True, f"T=0 call = {call:.4f} (intrinsic = {intrinsic:.4f})"


def test_kaniadakis_invalid_params_raises() -> tuple[bool, str]:
    """KaniadakisJumpModel() valida parametros fora do range."""
    base = dict(sigma=0.2, kappa=0.0, lam=1.0, mu_J=-0.05, sigma_J=0.15)
    cases = [
        ("sigma alto", {**base, "sigma": 99.0}),
        ("kappa fora range", {**base, "kappa": 1.5}),
        ("lam negativo", {**base, "lam": -0.1}),
        ("mu_J fora range", {**base, "mu_J": 5.0}),
        ("sigma_J alto", {**base, "sigma_J": 99.0}),
    ]
    for name, kw in cases:
        try:
            KaniadakisJumpModel(**kw)
        except ValueError:
            continue
        return False, f"{name}: deveria levantar ValueError"
    return True, "5/5 casos rejeitados corretamente"


def test_kaniadakis_model_class_call() -> tuple[bool, str]:
    """KaniadakisJumpModel.call_price() retorna mesmo que kaniadakis_call_price()."""
    model = KaniadakisJumpModel(sigma=0.2, kappa=0.5, lam=1.0, mu_J=-0.05, sigma_J=0.15)
    p = PARAMS_TYPICAL
    call_oo = model.call_price(p["S0"], p["K"], p["T"], p["r"])
    call_fn = kaniadakis_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["sigma"], p["kappa"], p["lam"], p["mu_J"], p["sigma_J"],
    )
    if not (np.isfinite(call_oo) and np.isfinite(call_fn)):
        return False, f"Valores nao finitos: oo={call_oo}, fn={call_fn}"
    if abs(call_oo - call_fn) > 1e-6:
        return False, f"OO vs funcional divergem: {call_oo} vs {call_fn}"
    return True, f"OO = funcional: {call_oo:.4f}"


def test_kaniadakis_is_gaussian_heavy_light() -> tuple[bool, str]:
    """is_gaussian/is_heavy_tailed/is_light_tailed detectam regime correto."""
    m_gauss = KaniadakisJumpModel(sigma=0.2, kappa=0.0, lam=1.0, mu_J=0, sigma_J=0.15)
    m_heavy = KaniadakisJumpModel(sigma=0.2, kappa=0.5, lam=1.0, mu_J=0, sigma_J=0.15)
    m_light = KaniadakisJumpModel(sigma=0.2, kappa=-0.5, lam=1.0, mu_J=0, sigma_J=0.15)
    if not m_gauss.is_gaussian():
        return False, "kappa=0 deveria ser gaussian"
    if m_gauss.is_heavy_tailed() or m_gauss.is_light_tailed():
        return False, "kappa=0 NAO deveria ser heavy nem light"
    if not m_heavy.is_heavy_tailed():
        return False, "kappa>0 deveria ser heavy_tailed"
    if m_heavy.is_gaussian() or m_heavy.is_light_tailed():
        return False, "kappa>0 NAO deveria ser gauss nem light"
    if not m_light.is_light_tailed():
        return False, "kappa<0 deveria ser light_tailed"
    if m_light.is_gaussian() or m_light.is_heavy_tailed():
        return False, "kappa<0 NAO deveria ser gauss nem heavy"
    return True, f"regimes OK: gauss, heavy, light"


def test_kaniadakis_tail_factor() -> tuple[bool, str]:
    """tail_factor() = 1 + kappa*0.5 (linear scaling)."""
    m_gauss = KaniadakisJumpModel(sigma=0.2, kappa=0.0, lam=1.0, mu_J=0, sigma_J=0.15)
    m_heavy = KaniadakisJumpModel(sigma=0.2, kappa=0.5, lam=1.0, mu_J=0, sigma_J=0.15)
    m_light = KaniadakisJumpModel(sigma=0.2, kappa=-0.5, lam=1.0, mu_J=0, sigma_J=0.15)
    if abs(m_gauss.tail_factor() - 1.0) > 1e-9:
        return False, f"gauss tail_factor deveria ser 1.0, got {m_gauss.tail_factor()}"
    if abs(m_heavy.tail_factor() - 1.25) > 1e-9:
        return False, f"heavy tail_factor deveria ser 1.25, got {m_heavy.tail_factor()}"
    if abs(m_light.tail_factor() - 0.75) > 1e-9:
        return False, f"light tail_factor deveria ser 0.75, got {m_light.tail_factor()}"
    return True, f"tail_factor: gauss={m_gauss.tail_factor()}, heavy={m_heavy.tail_factor()}, light={m_light.tail_factor()}"


def test_kaniadakis_put_basic() -> tuple[bool, str]:
    """Put ATM basico retorna valor positivo."""
    p = PARAMS_TYPICAL
    put = kaniadakis_put_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["sigma"], p["kappa"], p["lam"], p["mu_J"], p["sigma_J"],
    )
    if not np.isfinite(put):
        return False, f"Put nao finita: {put}"
    if put <= 0:
        return False, f"Put ATM deve ser > 0, got {put}"
    return True, f"Put ATM = {put:.4f}"


def test_kaniadakis_repr() -> tuple[bool, str]:
    """KaniadakisJumpModel.__repr__ nao quebra e tem 5 campos principais."""
    model = KaniadakisJumpModel(sigma=0.2, kappa=0.5, lam=1.0, mu_J=-0.05, sigma_J=0.15)
    r = repr(model)
    for key in ("sigma", "kappa", "lam", "mu_J", "sigma_J"):
        if key not in r:
            return False, f"repr() falta campo {key}: {r}"
    if "regime" not in r:
        return False, f"repr() falta 'regime' tag: {r}"
    return True, f"repr OK: {r}"
