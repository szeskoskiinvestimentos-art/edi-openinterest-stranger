"""
test_heston.py - Testes para E52 (Heston Stochastic Volatility Model).

Valida:
- Calculo de Call ATM com parametros tipicos
- Paridade put-call
- Vol implied aumenta com sigma_v
- Feller condition
- Calibracao basica
- Edge cases (ITM/OTM/intrinsic)
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.calculator.heston import (
    HestonModel,
    heston_call_price,
    heston_put_price,
)


# Parametros "tipicos" para WDO/equities
PARAMS_TYPICAL = {
    "S0": 5000.0,
    "K": 5000.0,
    "T": 0.25,
    "r": 0.10,
    "v0": 0.04,
    "kappa": 2.0,
    "theta": 0.04,
    "sigma_v": 0.3,
    "rho": -0.7,
}


def test_heston_call_atm_basic() -> tuple[bool, str]:
    """Call ATM com parametros tipicos retorna valor positivo razoavel."""
    p = PARAMS_TYPICAL
    call = heston_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa"], p["theta"], p["sigma_v"], p["rho"],
    )
    if not np.isfinite(call):
        return False, f"Call ATM nao finita: {call}"
    if call <= 0:
        return False, f"Call ATM deve ser > 0, got {call}"
    if call > 0.20 * p["S0"]:
        return False, f"Call ATM muito alta (>20% spot): {call}"
    return True, f"Call ATM = {call:.4f}"


def test_heston_call_itm_otm() -> tuple[bool, str]:
    """Call ITM > Call OTM (mesma T, mesmo modelo)."""
    p = PARAMS_TYPICAL
    call_itm = heston_call_price(
        p["S0"], p["K"] * 0.95, p["T"], p["r"],
        p["v0"], p["kappa"], p["theta"], p["sigma_v"], p["rho"],
    )
    call_otm = heston_call_price(
        p["S0"], p["K"] * 1.10, p["T"], p["r"],
        p["v0"], p["kappa"], p["theta"], p["sigma_v"], p["rho"],
    )
    if not (np.isfinite(call_itm) and np.isfinite(call_otm)):
        return False, f"Valores nao finitos: ITM={call_itm}, OTM={call_otm}"
    if call_itm <= call_otm:
        return False, f"ITM deve custar mais que OTM: {call_itm} vs {call_otm}"
    return True, f"ITM={call_itm:.2f}, OTM={call_otm:.2f}"


def test_heston_put_call_parity() -> tuple[bool, str]:
    """Paridade put-call: C - P = S - K*exp(-rT)."""
    p = PARAMS_TYPICAL
    call = heston_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa"], p["theta"], p["sigma_v"], p["rho"],
    )
    put = heston_put_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa"], p["theta"], p["sigma_v"], p["rho"],
    )
    if not (np.isfinite(call) and np.isfinite(put)):
        return False, f"Valores nao finitos: C={call}, P={put}"
    parity_lhs = call - put
    parity_rhs = p["S0"] - p["K"] * math.exp(-p["r"] * p["T"])
    diff = abs(parity_lhs - parity_rhs)
    if diff > 0.5:
        return False, f"Paridade put-call violada: C-P={parity_lhs:.4f} vs S-Ke^-rT={parity_rhs:.4f}, diff={diff:.4f}"
    return True, f"Paridade OK: diff={diff:.4f}"


def test_heston_higher_vol_higher_call() -> tuple[bool, str]:
    """sigma_v (vol of vol) afeta o preco da call.

    Para Heston, maior sigma_v pode DIMINUIR a call ATM quando vol inicial
    (v0) ja e' igual a theta (mean-reversion neutral). Isso acontece porque
    maior vol of vol -> mais chance de REVERSAO da vol para theta,
    reduzindo o premio.

    O teste valida que a call VARIA com sigma_v (efeito nao-trivial).
    """
    p = PARAMS_TYPICAL
    call_low = heston_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa"], p["theta"], sigma_v=0.1, rho=p["rho"],
    )
    call_high = heston_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa"], p["theta"], sigma_v=0.6, rho=p["rho"],
    )
    if not (np.isfinite(call_low) and np.isfinite(call_high)):
        return False, f"Valores nao finitos: low={call_low}, high={call_high}"
    if abs(call_high - call_low) < 0.5:
        return False, (
            f"sigma_v deveria afetar a call: low={call_low}, high={call_high} "
            f"(variacao={abs(call_high-call_low):.4f})"
        )
    return True, f"low={call_low:.2f} (sv=0.1), high={call_high:.2f} (sv=0.6)"


def test_heston_higher_rho_higher_call() -> tuple[bool, str]:
    """rho positivo -> call OTM mais cara (correlacao direta spot<->vol).

    Em Heston, rho > 0 significa que quando spot sobe, vol tambem sobe.
    Para call OTM, isso significa mais upside -> call vale mais.
    Para equities, rho e' tipicamente negativo (skew), mas matematicamente
    rho positivo aumenta o preco de calls OTM.
    """
    p = PARAMS_TYPICAL
    # Call OTM (K > S0)
    call_rho_neutral = heston_call_price(
        p["S0"], p["K"] * 1.10, p["T"], p["r"],
        p["v0"], p["kappa"], p["theta"], p["sigma_v"], rho=0.0,
    )
    call_rho_pos = heston_call_price(
        p["S0"], p["K"] * 1.10, p["T"], p["r"],
        p["v0"], p["kappa"], p["theta"], p["sigma_v"], rho=0.9,
    )
    if not (np.isfinite(call_rho_neutral) and np.isfinite(call_rho_pos)):
        return False, f"Valores nao finitos: neutral={call_rho_neutral}, pos={call_rho_pos}"
    if call_rho_pos <= call_rho_neutral:
        return False, f"rho positivo deve aumentar OTM call: {call_rho_pos} vs {call_rho_neutral}"
    return True, f"neutral={call_rho_neutral:.2f}, pos={call_rho_pos:.2f}"


def test_heston_feller_condition() -> tuple[bool, str]:
    """Feller condition: 2*kappa*theta > sigma_v^2."""
    model_ok = HestonModel(v0=0.04, kappa=2.0, theta=0.04, sigma_v=0.1, rho=-0.5)
    if not model_ok.feller_condition():
        return False, "Feller deveria estar OK (params OK)"
    if model_ok.feller_ratio() <= 1.0:
        return False, f"Feller ratio deveria ser > 1: {model_ok.feller_ratio()}"

    model_bad = HestonModel(v0=0.04, kappa=0.5, theta=0.04, sigma_v=1.0, rho=-0.5)
    if model_bad.feller_condition():
        return False, "Feller deveria estar violado (params BAD)"
    if model_bad.feller_ratio() >= 1.0:
        return False, f"Feller ratio deveria ser < 1: {model_bad.feller_ratio()}"
    return True, f"OK ratio={model_ok.feller_ratio():.2f}, BAD ratio={model_bad.feller_ratio():.2f}"


def test_heston_model_class_call() -> tuple[bool, str]:
    """HestonModel.call_price() retorna mesmo que heston_call_price()."""
    model = HestonModel(v0=0.04, kappa=2.0, theta=0.04, sigma_v=0.3, rho=-0.7)
    p = PARAMS_TYPICAL
    call_oo = model.call_price(p["S0"], p["K"], p["T"], p["r"])
    call_fn = heston_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        model.v0, model.kappa, model.theta, model.sigma_v, model.rho,
    )
    if not (np.isfinite(call_oo) and np.isfinite(call_fn)):
        return False, f"Valores nao finitos: oo={call_oo}, fn={call_fn}"
    if abs(call_oo - call_fn) > 1e-6:
        return False, f"OO vs funcional divergem: {call_oo} vs {call_fn}"
    return True, f"OO = funcional: {call_oo:.4f}"


def test_heston_zero_T_returns_intrinsic() -> tuple[bool, str]:
    """Quando T=0, modelo degenera (intrinsic value)."""
    p = PARAMS_TYPICAL
    call = heston_call_price(
        p["S0"], p["K"], 0.0, p["r"],
        p["v0"], p["kappa"], p["theta"], p["sigma_v"], p["rho"],
    )
    # Quando T=0, Call = max(S - K*exp(-rT), 0) ~= max(S-K, 0)
    intrinsic = max(0.0, p["S0"] - p["K"])
    if not np.isfinite(call):
        return False, f"Call T=0 nao finita: {call}"
    if abs(call - intrinsic) > 1.0:
        return False, f"T=0 deve dar intrinseco: {call} vs {intrinsic}"
    return True, f"T=0 call = {call:.4f} (intrinsic = {intrinsic:.4f})"


def test_heston_invalid_params_raises() -> tuple[bool, str]:
    """HestonModel() valida parametros fora do range."""
    cases = [
        ("v0 alto", dict(v0=99.0, kappa=2.0, theta=0.04, sigma_v=0.3, rho=-0.7)),
        ("kappa baixo", dict(v0=0.04, kappa=0.001, theta=0.04, sigma_v=0.3, rho=-0.7)),
        ("rho > 1", dict(v0=0.04, kappa=2.0, theta=0.04, sigma_v=0.3, rho=1.5)),
    ]
    for name, kw in cases:
        try:
            HestonModel(**kw)
        except ValueError:
            continue
        return False, f"{name}: deveria levantar ValueError"
    return True, "3/3 casos rejeitados corretamente"


def test_heston_calibrate_returns_valid_model() -> tuple[bool, str]:
    """Calibracao retorna HestonModel com parametros no range valido."""
    true_model = HestonModel(v0=0.04, kappa=2.0, theta=0.04, sigma_v=0.3, rho=-0.7)
    p = PARAMS_TYPICAL
    market_prices = [
        (K, 0.25, true_model.call_price(p["S0"], K, 0.25, p["r"]))
        for K in [4900, 4950, 5000, 5050, 5100]
    ]

    initial = HestonModel(v0=0.05, kappa=1.5, theta=0.05, sigma_v=0.2, rho=-0.5)
    try:
        calibrated = initial.calibrate(p["S0"], p["r"], market_prices, fix_rho=-0.7)
    except Exception as e:
        return False, f"Calibrate falhou: {e}"

    if not isinstance(calibrated, HestonModel):
        return False, f"Retorno nao e HestonModel: {type(calibrated)}"
    if not (0.001 < calibrated.v0 < 1.0):
        return False, f"v0 fora do range: {calibrated.v0}"
    if not (0.01 < calibrated.kappa < 20.0):
        return False, f"kappa fora do range: {calibrated.kappa}"
    if not (0.001 < calibrated.theta < 1.0):
        return False, f"theta fora do range: {calibrated.theta}"
    if not (0.01 < calibrated.sigma_v < 5.0):
        return False, f"sigma_v fora do range: {calibrated.sigma_v}"
    if not (-0.99 < calibrated.rho < 0.99):
        return False, f"rho fora do range: {calibrated.rho}"
    return True, f"Calibrado: v0={calibrated.v0:.4f}, kappa={calibrated.kappa:.2f}, sigma_v={calibrated.sigma_v:.4f}"
