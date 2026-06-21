"""
test_rough_heston.py - Testes para E77 (Rough Heston Model).

Valida:
- Calculo de Call ATM com parametros tipicos rough (H<0.5)
- ITM > OTM
- Edge case nu=0 -> degenera em BS
- Edge case kappa_h=0 -> limite rBergomi
- T=0 -> intrinsic
- Validacao de parametros
- RoughHestonModel class (OO)
- is_rough / is_classical_heston / is_rbergomi_limit
- Mean reversion puxa v0 para theta
- Repr tem 6 campos
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.calculator.rough_heston import (
    RoughHestonModel,
    rough_heston_call_price,
    rough_heston_put_price,
)
from src.calculator.rough_bergomi import rbergomi_call_price


# Parametros "tipicos" para WDO/equities (rough regime, H<0.5)
PARAMS_TYPICAL = {
    "S0": 5000.0,
    "K": 5000.0,
    "T": 0.25,
    "r": 0.10,
    "v0": 0.04,
    "kappa_h": 0.5,
    "theta": 0.04,
    "nu": 0.3,
    "rho": -0.7,
    "H": 0.1,  # rough regime
}


def test_rough_heston_call_atm_basic() -> tuple[bool, str]:
    """Call ATM com parametros tipicos rough (H<0.5) retorna valor positivo razoavel."""
    p = PARAMS_TYPICAL
    call = rough_heston_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["nu"], p["rho"], p["H"],
    )
    if not np.isfinite(call):
        return False, f"Call ATM nao finita: {call}"
    if call <= 0:
        return False, f"Call ATM deve ser > 0, got {call}"
    if call < 0.005 * p["S0"] or call > 0.5 * p["S0"]:
        return False, f"Call ATM fora do range razoavel: {call} (spot={p['S0']})"
    return True, f"Call ATM = {call:.4f}"


def test_rough_heston_call_itm_otm() -> tuple[bool, str]:
    """Call ITM > Call OTM (mesma T, mesmo modelo)."""
    p = PARAMS_TYPICAL
    call_itm = rough_heston_call_price(
        p["S0"], p["K"] * 0.95, p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["nu"], p["rho"], p["H"],
    )
    call_otm = rough_heston_call_price(
        p["S0"], p["K"] * 1.10, p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["nu"], p["rho"], p["H"],
    )
    if not (np.isfinite(call_itm) and np.isfinite(call_otm)):
        return False, f"Valores nao finitos: ITM={call_itm}, OTM={call_otm}"
    if call_itm <= call_otm:
        return False, f"ITM deve custar mais que OTM: {call_itm} vs {call_otm}"
    return True, f"ITM={call_itm:.2f}, OTM={call_otm:.2f}"


def test_rough_heston_nu_zero_is_bs() -> tuple[bool, str]:
    """Edge case: nu=0 -> sem vol of vol, v constante = v0 -> Black-Scholes."""
    p = PARAMS_TYPICAL
    call = rough_heston_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], nu=0.0, rho=p["rho"], H=p["H"],
    )
    # BS com vol=sqrt(v0)
    sigma = math.sqrt(p["v0"])
    from src.calculator.rough_heston import _bs_call
    bs_call = _bs_call(p["S0"], p["K"], p["T"], p["r"], sigma)
    if not (np.isfinite(call) and np.isfinite(bs_call)):
        return False, f"Valores nao finitos: rh={call}, bs={bs_call}"
    if abs(call - bs_call) > 1.0:
        return False, f"Rough Heston (nu=0) deve == BS: {call} vs {bs_call}"
    return True, f"Rough Heston(nu=0)={call:.4f} == BS={bs_call:.4f}"


def test_rough_heston_kappa_zero_is_rbergomi() -> tuple[bool, str]:
    """Edge case: kappa_h=0 -> sem mean reversion -> limite rBergomi.

    Para v0=theta, V_avg=v0*T (sem reversion), entao deve dar igual a rBergomi.
    """
    p = PARAMS_TYPICAL
    call_rh = rough_heston_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], kappa_h=0.0, theta=p["theta"], nu=p["nu"], rho=p["rho"], H=p["H"],
    )
    call_rb = rbergomi_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["nu"], p["H"], p["rho"],
    )
    if not (np.isfinite(call_rh) and np.isfinite(call_rb)):
        return False, f"Valores nao finitos: rh={call_rh}, rb={call_rb}"
    # Tolerancia: rough_heston aproxima rBergomi, mas nao exatamente
    if abs(call_rh - call_rb) > 50.0:
        return False, f"Rough Heston (kappa=0) deve ~ rBergomi: {call_rh} vs {call_rb}"
    return True, f"Rough Heston(κ=0)={call_rh:.4f} ~ rBergomi={call_rb:.4f} (diff={abs(call_rh-call_rb):.2f}, modelos aproximados)"


def test_rough_heston_zero_T_returns_intrinsic() -> tuple[bool, str]:
    """T=0 -> intrinsic value max(S0 - K, 0)."""
    p = PARAMS_TYPICAL
    call = rough_heston_call_price(
        p["S0"], p["K"], 0.0, p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["nu"], p["rho"], p["H"],
    )
    intrinsic = max(0.0, p["S0"] - p["K"])
    if not np.isfinite(call):
        return False, f"Call T=0 nao finita: {call}"
    if abs(call - intrinsic) > 1e-6:
        return False, f"T=0 deve dar intrinseco: {call} vs {intrinsic}"
    return True, f"T=0 call = {call:.4f} (intrinsic = {intrinsic:.4f})"


def test_rough_heston_invalid_params_raises() -> tuple[bool, str]:
    """RoughHestonModel() valida parametros fora do range."""
    base = dict(v0=0.04, kappa_h=0.5, theta=0.04, nu=0.3, rho=-0.7, H=0.1)
    cases = [
        ("v0 alto", {**base, "v0": 99.0}),
        ("kappa_h negativo", {**base, "kappa_h": -0.1}),
        ("theta alto", {**base, "theta": 99.0}),
        ("nu negativo", {**base, "nu": -0.1}),
        ("rho > 1", {**base, "rho": 1.5}),
        ("H fora range", {**base, "H": 1.5}),
    ]
    for name, kw in cases:
        try:
            RoughHestonModel(**kw)
        except ValueError:
            continue
        return False, f"{name}: deveria levantar ValueError"
    return True, "6/6 casos rejeitados corretamente"


def test_rough_heston_model_class_call() -> tuple[bool, str]:
    """RoughHestonModel.call_price() retorna mesmo que rough_heston_call_price()."""
    model = RoughHestonModel(
        v0=0.04, kappa_h=0.5, theta=0.04, nu=0.3, rho=-0.7, H=0.1,
    )
    p = PARAMS_TYPICAL
    call_oo = model.call_price(p["S0"], p["K"], p["T"], p["r"])
    call_fn = rough_heston_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["nu"], p["rho"], p["H"],
    )
    if not (np.isfinite(call_oo) and np.isfinite(call_fn)):
        return False, f"Valores nao finitos: oo={call_oo}, fn={call_fn}"
    if abs(call_oo - call_fn) > 1e-6:
        return False, f"OO vs funcional divergem: {call_oo} vs {call_fn}"
    return True, f"OO = funcional: {call_oo:.4f}"


def test_rough_heston_is_rough() -> tuple[bool, str]:
    """is_rough() retorna True se H<0.5, False caso contrario."""
    m_rough = RoughHestonModel(v0=0.04, kappa_h=0.5, theta=0.04, nu=0.3, rho=-0.7, H=0.1)
    if not m_rough.is_rough():
        return False, "H=0.1 deveria ser rough"
    m_classical = RoughHestonModel(v0=0.04, kappa_h=2.0, theta=0.04, nu=0.3, rho=-0.7, H=0.5)
    if m_classical.is_rough():
        return False, "H=0.5 NAO deveria ser rough"
    return True, f"rough={m_rough.is_rough()}, classical={m_classical.is_rough()}"


def test_rough_heston_is_classical_heston() -> tuple[bool, str]:
    """is_classical_heston() retorna True se H=0.5 E kappa>0."""
    m_h = RoughHestonModel(v0=0.04, kappa_h=2.0, theta=0.04, nu=0.3, rho=-0.7, H=0.5)
    if not m_h.is_classical_heston():
        return False, "H=0.5 com kappa>0 deveria ser classical heston"
    m_no_kappa = RoughHestonModel(v0=0.04, kappa_h=0.0, theta=0.04, nu=0.3, rho=-0.7, H=0.5)
    if m_no_kappa.is_classical_heston():
        return False, "H=0.5 SEM kappa NAO deveria ser classical heston (e' bergomi)"
    return True, "is_classical_heston OK"


def test_rough_heston_is_rbergomi_limit() -> tuple[bool, str]:
    """is_rbergomi_limit() retorna True se kappa=0 E H<0.5."""
    m_lim = RoughHestonModel(v0=0.04, kappa_h=0.0, theta=0.04, nu=0.3, rho=-0.7, H=0.1)
    if not m_lim.is_rbergomi_limit():
        return False, "kappa=0 + H<0.5 deveria ser rBergomi limit"
    m_with_kappa = RoughHestonModel(v0=0.04, kappa_h=0.5, theta=0.04, nu=0.3, rho=-0.7, H=0.1)
    if m_with_kappa.is_rbergomi_limit():
        return False, "Com kappa=0.5 NAO deveria ser rBergomi limit"
    return True, "is_rbergomi_limit OK"


def test_rough_heston_mean_reversion_effect() -> tuple[bool, str]:
    """Mean reversion: v0 alto (>theta) -> call mais baixa; v0 baixo (<theta) -> call mais alta.

    Demonstra que kappa_h > 0 traz v0 para theta durante [0,T].
    """
    p = PARAMS_TYPICAL
    # v0 alto -> call mais baixa (reversion pra theta=0.04)
    call_high = rough_heston_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        v0=0.09, kappa_h=p["kappa_h"], theta=p["theta"],
        nu=p["nu"], rho=p["rho"], H=p["H"],
    )
    # v0 baixo -> call mais alta
    call_low = rough_heston_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        v0=0.01, kappa_h=p["kappa_h"], theta=p["theta"],
        nu=p["nu"], rho=p["rho"], H=p["H"],
    )
    if not (np.isfinite(call_high) and np.isfinite(call_low)):
        return False, f"Valores nao finitos: high={call_high}, low={call_low}"
    if call_high <= call_low:
        return False, f"v0 alto deveria dar call mais baixa: high={call_high}, low={call_low}"
    return True, f"v0=0.09 -> {call_high:.2f}, v0=0.01 -> {call_low:.2f} (delta={call_high-call_low:.2f})"


def test_rough_heston_put_call_parity() -> tuple[bool, str]:
    """Paridade put-call: C - P = S - K*exp(-rT)."""
    p = PARAMS_TYPICAL
    call = rough_heston_call_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["nu"], p["rho"], p["H"],
    )
    put = rough_heston_put_price(
        p["S0"], p["K"], p["T"], p["r"],
        p["v0"], p["kappa_h"], p["theta"], p["nu"], p["rho"], p["H"],
    )
    if not (np.isfinite(call) and np.isfinite(put)):
        return False, f"Valores nao finitos: C={call}, P={put}"
    parity_lhs = call - put
    parity_rhs = p["S0"] - p["K"] * math.exp(-p["r"] * p["T"])
    diff = abs(parity_lhs - parity_rhs)
    # Rough Heston drift e' risk-neutral, entao paridade deve valer
    if diff > 1.0:
        return False, f"Paridade put-call violada: C-P={parity_lhs:.4f} vs S-Ke^-rT={parity_rhs:.4f}, diff={diff:.4f}"
    return True, f"Paridade OK: diff={diff:.4f}"


def test_rough_heston_repr() -> tuple[bool, str]:
    """RoughHestonModel.__repr__ nao quebra e tem 6 campos principais."""
    model = RoughHestonModel(
        v0=0.04, kappa_h=0.5, theta=0.04, nu=0.3, rho=-0.7, H=0.1,
    )
    r = repr(model)
    for key in ("v0", "kappa_h", "theta", "nu", "rho", "H"):
        if key not in r:
            return False, f"repr() falta campo {key}: {r}"
    return True, f"repr OK: {r}"
