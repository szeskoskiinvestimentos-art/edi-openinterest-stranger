"""
test_bates.py - Testes para E76 (Bates 1996 Stochastic Volatility + Jumps).

Valida:
- Calculo de Call ATM com parametros tipicos
- Edge case lambda=0 -> reduz a Heston
- Edge case kappa_h=0, sigma_v=0 -> reduz a Merton
- T=0 -> intrinsic
- ITM > OTM (mesma T)
- Validacao de parametros
- BatesModel class (OO)
- feller_ratio + jump_compensator
- Put price
- Skew: saltos adicionam caudas pesadas
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.calculator.bates import (
    BatesModel,
    bates_call_price,
    bates_put_price,
)
from src.calculator.heston import heston_call_price, HestonModel
from src.calculator.merton import merton_call_price, MertonJumpModel


# Parametros "tipicos" para WDO/equities (Bates = Heston + Merton)
PARAMS_TYPICAL = {
    "S0": 5000.0,
    "K": 5000.0,
    "T": 0.25,
    "r": 0.10,
    "v0": 0.04,
    "kappa_h": 2.0,
    "theta": 0.04,
    "sigma_v": 0.3,
    "rho": -0.7,
    "lam": 1.0,
    "mu_J": -0.05,
    "sigma_J": 0.15,
}


def test_bates_call_atm_basic() -> tuple[bool, str]:
    """Call ATM com parametros tipicos retorna valor positivo razoavel."""
    p = PARAMS_TYPICAL
    call = bates_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["sigma_v"], p["rho"],
        p["lam"], p["mu_J"], p["sigma_J"],
    )
    if not np.isfinite(call):
        return False, f"Call ATM nao finita: {call}"
    if call <= 0:
        return False, f"Call ATM deve ser > 0, got {call}"
    # 0.5% a 25% do spot e' range razoavel para opcoes de 3 meses ATM
    if call < 0.005 * p["S0"] or call > 0.25 * p["S0"]:
        return False, f"Call ATM fora do range razoavel: {call} (spot={p['S0']})"
    return True, f"Call ATM = {call:.4f}"


def test_bates_call_itm_otm() -> tuple[bool, str]:
    """Call ITM > Call OTM (mesma T, mesmo modelo)."""
    p = PARAMS_TYPICAL
    call_itm = bates_call_price(
        p["S0"], p["K"] * 0.95, p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["sigma_v"], p["rho"],
        p["lam"], p["mu_J"], p["sigma_J"],
    )
    call_otm = bates_call_price(
        p["S0"], p["K"] * 1.10, p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["sigma_v"], p["rho"],
        p["lam"], p["mu_J"], p["sigma_J"],
    )
    if not (np.isfinite(call_itm) and np.isfinite(call_otm)):
        return False, f"Valores nao finitos: ITM={call_itm}, OTM={call_otm}"
    if call_itm <= call_otm:
        return False, f"ITM deve custar mais que OTM: {call_itm} vs {call_otm}"
    return True, f"ITM={call_itm:.2f}, OTM={call_otm:.2f}"


def test_bates_lambda_zero_equals_heston() -> tuple[bool, str]:
    """Edge case: lambda=0 -> Bates reduz a Heston puro."""
    p = PARAMS_TYPICAL
    bates_call = bates_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["sigma_v"], p["rho"],
        lam=0.0, mu_J=p["mu_J"], sigma_J=p["sigma_J"],
    )
    heston_call = heston_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["sigma_v"], p["rho"],
    )
    if not (np.isfinite(bates_call) and np.isfinite(heston_call)):
        return False, f"Valores nao finitos: bates={bates_call}, heston={heston_call}"
    if abs(bates_call - heston_call) > 1e-4:
        return False, f"Bates(lam=0) deve == Heston: {bates_call} vs {heston_call} (diff={abs(bates_call-heston_call):.6f})"
    return True, f"Bates(lam=0)={bates_call:.4f} == Heston={heston_call:.4f}"


def test_bates_no_stoch_vol_equals_merton() -> tuple[bool, str]:
    """Edge case: kappa_h=0, sigma_v=0 -> Bates reduz a Merton com vol=sqrt(v0).

    Caso degenerado: Heston subjacente colapsa para BS com vol=sqrt(v0),
    que e' exatamente o Merton sem stoch vol.
    """
    p = PARAMS_TYPICAL
    bates_call = bates_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        v0=p["v0"], kappa_h=0.0, theta=p["theta"], sigma_v=0.0, rho=p["rho"],
        lam=p["lam"], mu_J=p["mu_J"], sigma_J=p["sigma_J"],
    )
    sigma = math.sqrt(p["v0"])
    merton_call = merton_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        sigma=sigma, lam=p["lam"], mu_J=p["mu_J"], sigma_J=p["sigma_J"],
    )
    if not (np.isfinite(bates_call) and np.isfinite(merton_call)):
        return False, f"Valores nao finitos: bates={bates_call}, merton={merton_call}"
    if abs(bates_call - merton_call) > 1e-3:
        return False, f"Bates(sv=0) deve == Merton(sqrt(v0)): {bates_call} vs {merton_call} (diff={abs(bates_call-merton_call):.6f})"
    return True, f"Bates(sv=0)={bates_call:.4f} == Merton={merton_call:.4f}"


def test_bates_zero_T_returns_intrinsic() -> tuple[bool, str]:
    """T=0 -> intrinsic value max(S0 - K, 0)."""
    p = PARAMS_TYPICAL
    call = bates_call_price(
        p["S0"], p["K"], 0.0, p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["sigma_v"], p["rho"],
        p["lam"], p["mu_J"], p["sigma_J"],
    )
    intrinsic = max(0.0, p["S0"] - p["K"])
    if not np.isfinite(call):
        return False, f"Call T=0 nao finita: {call}"
    if abs(call - intrinsic) > 1e-6:
        return False, f"T=0 deve dar intrinseco: {call} vs {intrinsic}"
    return True, f"T=0 call = {call:.4f} (intrinsic = {intrinsic:.4f})"


def test_bates_invalid_params_raises() -> tuple[bool, str]:
    """BatesModel() valida parametros fora do range."""
    base = dict(
        v0=0.04, kappa_h=2.0, theta=0.04, sigma_v=0.3, rho=-0.7,
        lam=1.0, mu_J=-0.05, sigma_J=0.15,
    )
    cases = [
        ("v0 alto", {**base, "v0": 99.0}),
        ("kappa_h negativo", {**base, "kappa_h": -0.1}),
        ("rho > 1", {**base, "rho": 1.5}),
        ("lam negativo", {**base, "lam": -0.1}),
        ("sigma_J negativo", {**base, "sigma_J": -0.01}),
        ("mu_J fora range", {**base, "mu_J": 5.0}),
        ("sigma_v negativo", {**base, "sigma_v": -0.1}),
    ]
    for name, kw in cases:
        try:
            BatesModel(**kw)
        except ValueError:
            continue
        return False, f"{name}: deveria levantar ValueError"
    return True, "5/5 casos rejeitados corretamente"


def test_bates_model_class_call() -> tuple[bool, str]:
    """BatesModel.call_price() retorna mesmo que bates_call_price()."""
    model = BatesModel(
        v0=0.04, kappa_h=2.0, theta=0.04, sigma_v=0.3, rho=-0.7,
        lam=1.0, mu_J=-0.05, sigma_J=0.15,
    )
    p = PARAMS_TYPICAL
    call_oo = model.call_price(p["S0"], p["K"], p["T"], p["r"])
    call_fn = bates_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["sigma_v"], p["rho"],
        p["lam"], p["mu_J"], p["sigma_J"],
    )
    if not (np.isfinite(call_oo) and np.isfinite(call_fn)):
        return False, f"Valores nao finitos: oo={call_oo}, fn={call_fn}"
    if abs(call_oo - call_fn) > 1e-6:
        return False, f"OO vs funcional divergem: {call_oo} vs {call_fn}"
    return True, f"OO = funcional: {call_oo:.4f}"


def test_bates_feller_ratio() -> tuple[bool, str]:
    """feller_ratio = 2*kappa_h*theta / sigma_v^2, >= 1 = Feller OK."""
    model_ok = BatesModel(
        v0=0.04, kappa_h=2.0, theta=0.04, sigma_v=0.1, rho=-0.5,
        lam=1.0, mu_J=-0.05, sigma_J=0.15,
    )
    if model_ok.feller_ratio() <= 1.0:
        return False, f"Feller ratio deveria ser > 1 (params OK): {model_ok.feller_ratio()}"

    model_bad = BatesModel(
        v0=0.04, kappa_h=0.5, theta=0.04, sigma_v=1.0, rho=-0.5,
        lam=1.0, mu_J=-0.05, sigma_J=0.15,
    )
    if model_bad.feller_ratio() >= 1.0:
        return False, f"Feller ratio deveria ser < 1 (params BAD): {model_bad.feller_ratio()}"

    return True, f"OK ratio={model_ok.feller_ratio():.2f}, BAD ratio={model_bad.feller_ratio():.2f}"


def test_bates_jump_compensator() -> tuple[bool, str]:
    """jump_compensator = exp(mu_J + sigma_J^2/2) - 1.

    Quando mu_J=0 e sigma_J=0, compensador = 0 (sem drift bias).
    """
    # Caso 1: mu_J=-0.05, sigma_J=0.15 -> compensador ~ 0.00564
    m1 = BatesModel(
        v0=0.04, kappa_h=2.0, theta=0.04, sigma_v=0.3, rho=-0.7,
        lam=1.0, mu_J=-0.05, sigma_J=0.15,
    )
    expected1 = math.exp(-0.05 + 0.5 * 0.15**2) - 1.0
    if abs(m1.jump_compensator() - expected1) > 1e-6:
        return False, f"Compensador errado: {m1.jump_compensator()} vs {expected1}"

    # Caso 2: sem saltos efetivos (mu_J=0, sigma_J=0) -> compensador = 0
    m2 = BatesModel(
        v0=0.04, kappa_h=2.0, theta=0.04, sigma_v=0.3, rho=-0.7,
        lam=1.0, mu_J=0.0, sigma_J=0.0,
    )
    if abs(m2.jump_compensator()) > 1e-12:
        return False, f"Compensador deveria ser 0 (sem salt): {m2.jump_compensator()}"

    return True, f"compensator1={m1.jump_compensator():.6f}, compensator2={m2.jump_compensator():.6f}"


def test_bates_put_basic() -> tuple[bool, str]:
    """Put ATM com parametros tipicos retorna valor positivo."""
    p = PARAMS_TYPICAL
    put = bates_put_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["sigma_v"], p["rho"],
        p["lam"], p["mu_J"], p["sigma_J"],
    )
    if not np.isfinite(put):
        return False, f"Put nao finita: {put}"
    if put <= 0:
        return False, f"Put ATM deve ser > 0, got {put}"
    if put > 0.25 * p["S0"]:
        return False, f"Put ATM muito alta (>25% spot): {put}"
    return True, f"Put ATM = {put:.4f}"


def test_bates_put_lambda_zero_equals_heston() -> tuple[bool, str]:
    """Edge case: lambda=0 -> Bates put == Heston put."""
    p = PARAMS_TYPICAL
    bates_put = bates_put_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["sigma_v"], p["rho"],
        lam=0.0, mu_J=p["mu_J"], sigma_J=p["sigma_J"],
    )
    from src.calculator.heston import heston_put_price
    heston_put = heston_put_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["sigma_v"], p["rho"],
    )
    if not (np.isfinite(bates_put) and np.isfinite(heston_put)):
        return False, f"Valores nao finitos: bates={bates_put}, heston={heston_put}"
    if abs(bates_put - heston_put) > 1e-3:
        return False, f"Bates put(lam=0) deve == Heston put: {bates_put} vs {heston_put}"
    return True, f"Bates put(lam=0)={bates_put:.4f} == Heston put={heston_put:.4f}"


def test_bates_jumps_increase_call_price() -> tuple[bool, str]:
    """Saltos com mu_J neutro (0) e sigma_J positivo devem AUMENTAR call ATM.

    Saltos adicionam caudas (alta kurtosis), o que aumenta o premio
    de opcoes ATM em qualquer direcao. Com mu_J=0, nao ha drift bias.
    """
    p = PARAMS_TYPICAL
    # Sem saltos
    call_no_jumps = bates_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["sigma_v"], p["rho"],
        lam=0.0, mu_J=0.0, sigma_J=0.01,
    )
    # Com saltos neutros (mu_J=0)
    call_jumps = bates_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["sigma_v"], p["rho"],
        lam=2.0, mu_J=0.0, sigma_J=0.20,
    )
    if not (np.isfinite(call_no_jumps) and np.isfinite(call_jumps)):
        return False, f"Valores nao finitos: no_jumps={call_no_jumps}, jumps={call_jumps}"
    if call_jumps <= call_no_jumps:
        return False, f"Saltos neutros deveriam aumentar call: {call_jumps} vs {call_no_jumps}"
    return True, f"no_jumps={call_no_jumps:.2f}, com_jumps={call_jumps:.2f} (delta=+{call_jumps-call_no_jumps:.2f})"


def test_bates_repr() -> tuple[bool, str]:
    """BatesModel.__repr__ nao quebra e tem campos principais."""
    model = BatesModel(
        v0=0.04, kappa_h=2.0, theta=0.04, sigma_v=0.3, rho=-0.7,
        lam=1.0, mu_J=-0.05, sigma_J=0.15,
    )
    r = repr(model)
    for key in ("v0", "kappa_h", "theta", "sigma_v", "rho", "lam", "mu_J", "sigma_J"):
        if key not in r:
            return False, f"repr() falta campo {key}: {r}"
    return True, f"repr OK: {r}"
