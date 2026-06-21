"""
test_monte_carlo_rbergomi.py - Testes para E75 (Monte Carlo rBergomi circulant).

Valida:
- Circulant embedding produz fBm com variancia correta
- eta=0 -> recupera BSM
- T=0 -> intrinsic value
- Validacao de parametros
- Put price
- PC parity (com tolerancia MC)
- Repr
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.calculator.monte_carlo_rbergomi import (
    price_european_rough_bergomi_mc,
    _fbm_circulant,
    _simulate_rbergomi_paths,
)


# ============================================================
# Tests
# ============================================================

def test_fbm_circulant_var_correct():
    """fBm circulant: var(W^H(T)) = T^{2H}."""
    rng = np.random.default_rng(42)
    increments = _fbm_circulant(H=0.1, n_steps=100, n_paths=20000, rng=rng)
    WT = increments.sum(axis=1)  # W^H(T) = soma dos incrementos
    var_WT = WT.var()
    # T=1 -> T^{2H} = 1
    assert abs(var_WT - 1.0) < 0.05, f"var(W(T))={var_WT:.4f}, expected ~1.0"


def test_fbm_circulant_var_increment():
    """var do incremento de fBm = dt^{2H}."""
    rng = np.random.default_rng(42)
    increments = _fbm_circulant(H=0.1, n_steps=100, n_paths=20000, rng=rng)
    var_inc = increments[:, 0].var()
    expected = (1.0 / 100) ** (2 * 0.1)  # dt^{2H}
    assert abs(var_inc - expected) < 0.02, f"var(inc)={var_inc:.4f}, expected {expected:.4f}"


def test_fbm_circulant_h_classical():
    """H=0.5 -> BM padrao (incrementos independentes com var=dt)."""
    rng = np.random.default_rng(42)
    increments = _fbm_circulant(H=0.5, n_steps=100, n_paths=20000, rng=rng)
    var_inc = increments[:, 0].var()
    expected_dt = 1.0 / 100  # dt
    # Para H=0.5, fBm = BM, incrementos independentes
    assert abs(var_inc - expected_dt) < 0.005, f"var(inc) H=0.5 = {var_inc:.6f}, expected {expected_dt:.6f}"
    # Cov entre incrementos consecutivos deve ser ~0
    cov_01 = np.cov(increments[:, 0], increments[:, 1])[0, 1]
    assert abs(cov_01) < 0.001, f"cov H=0.5 = {cov_01:.6f}, expected ~0"


def test_fbm_circulant_h_rough():
    """H<0.5 -> incrementos negativamente correlacionados (rough)."""
    rng = np.random.default_rng(42)
    increments = _fbm_circulant(H=0.1, n_steps=100, n_paths=20000, rng=rng)
    # Cov entre incrementos consecutivos deve ser negativa
    cov_01 = np.cov(increments[:, 0], increments[:, 1])[0, 1]
    assert cov_01 < -0.05, f"cov H=0.1 = {cov_01:.4f}, expected < -0.05 (rough)"


def test_eta_zero_recovers_bsm():
    """eta=0 -> vol estocastica desligada -> modelo = BSM."""
    p_mc = price_european_rough_bergomi_mc(
        S0=100, K=100, T=1.0, r=0.05, q=0.0,
        v0=0.04, eta=0.0, H=0.1, rho=0.0,
        n_paths=100000, n_steps=100, seed=42
    )
    from scipy.stats import norm
    sigma = math.sqrt(0.04)
    d1 = (math.log(100/100) + 0.5 * sigma**2 * 1.0) / (sigma * 1.0)
    d2 = d1 - sigma * 1.0
    bsm = 100 * norm.cdf(d1) - 100 * math.exp(-0.05) * norm.cdf(d2)
    # MC noise ~0.2 para 100k paths
    assert abs(p_mc - bsm) < 0.3, f"MC eta=0 {p_mc:.4f} vs BSM {bsm:.4f}"


def test_T_zero_returns_intrinsic():
    """T=0 -> preco = intrinsic value."""
    p_call = price_european_rough_bergomi_mc(
        S0=100, K=95, T=0, r=0.05, q=0,
        v0=0.04, eta=0.3, H=0.1, rho=-0.7
    )
    assert p_call == 5.0, f"T=0 call K=95: {p_call} != 5"

    p_put = price_european_rough_bergomi_mc(
        S0=100, K=105, T=0, r=0.05, q=0,
        v0=0.04, eta=0.3, H=0.1, rho=-0.7,
        option_type="put"
    )
    assert p_put == 5.0, f"T=0 put K=105: {p_put} != 5"


def test_invalid_H():
    """H deve estar em (0, 1)."""
    try:
        price_european_rough_bergomi_mc(
            S0=100, K=100, T=1.0, r=0.05, q=0.0,
            v0=0.04, eta=0.3, H=1.5, rho=-0.7
        )
        assert False, "Deveria falhar com H=1.5"
    except ValueError:
        pass

    try:
        price_european_rough_bergomi_mc(
            S0=100, K=100, T=1.0, r=0.05, q=0.0,
            v0=0.04, eta=0.3, H=-0.1, rho=-0.7
        )
        assert False, "Deveria falhar com H=-0.1"
    except ValueError:
        pass


def test_invalid_v0():
    """v0 > 0 obrigatorio."""
    try:
        price_european_rough_bergomi_mc(
            S0=100, K=100, T=1.0, r=0.05, q=0.0,
            v0=0.0, eta=0.3, H=0.1, rho=-0.7
        )
        assert False, "Deveria falhar com v0=0"
    except ValueError:
        pass


def test_invalid_eta():
    """eta >= 0 obrigatorio."""
    try:
        price_european_rough_bergomi_mc(
            S0=100, K=100, T=1.0, r=0.05, q=0.0,
            v0=0.04, eta=-0.1, H=0.1, rho=-0.7
        )
        assert False, "Deveria falhar com eta=-0.1"
    except ValueError:
        pass


def test_invalid_option_type():
    """option_type deve ser 'call' ou 'put'."""
    try:
        price_european_rough_bergomi_mc(
            S0=100, K=100, T=1.0, r=0.05, q=0.0,
            v0=0.04, eta=0.3, H=0.1, rho=-0.7,
            option_type="banana"
        )
        assert False, "Deveria falhar com option_type=banana"
    except ValueError:
        pass


def test_put_call_parity():
    """C - P = S*exp(-qT) - K*exp(-rT) (martingale, com tolerancia MC)."""
    call = price_european_rough_bergomi_mc(
        S0=100, K=100, T=1.0, r=0.05, q=0.0,
        v0=0.04, eta=0.3, H=0.1, rho=-0.7,
        option_type="call", n_paths=200000, n_steps=100, seed=42
    )
    put = price_european_rough_bergomi_mc(
        S0=100, K=100, T=1.0, r=0.05, q=0.0,
        v0=0.04, eta=0.3, H=0.1, rho=-0.7,
        option_type="put", n_paths=200000, n_steps=100, seed=42
    )
    expected = 100 - 100 * math.exp(-0.05 * 1.0)
    parity = call - put
    # ~1% viés + MC noise para 200k paths
    assert abs(parity - expected) < 1.5, f"PC parity {parity:.4f} vs expected {expected:.4f}"


def test_itm_vs_otm():
    """Call ITM > call OTM (mesma T)."""
    p_itm = price_european_rough_bergomi_mc(
        S0=100, K=90, T=1.0, r=0.05, q=0.0,
        v0=0.04, eta=0.3, H=0.1, rho=-0.7,
        n_paths=30000, n_steps=100, seed=42
    )
    p_otm = price_european_rough_bergomi_mc(
        S0=100, K=110, T=1.0, r=0.05, q=0.0,
        v0=0.04, eta=0.3, H=0.1, rho=-0.7,
        n_paths=30000, n_steps=100, seed=42
    )
    assert p_itm > p_otm, f"ITM {p_itm} deve ser > OTM {p_otm}"


def test_simulate_paths_shape():
    """_simulate_rbergomi_paths retorna array (n_paths,)."""
    ST = _simulate_rbergomi_paths(
        S0=100, T=1.0, r=0.05, q=0.0, v0=0.04,
        eta=0.3, H=0.1, rho=-0.7,
        n_steps=100, n_paths=1000, seed=42
    )
    assert ST.shape == (1000,), f"shape inesperada: {ST.shape}"
    assert np.all(ST > 0), "S_T deve ser sempre positivo"


def test_repr():
    """__repr__ deve retornar string descritiva."""
    from src.calculator import monte_carlo_rbergomi
    assert "MonteCarloRoughBergomi" in monte_carlo_rbergomi.__repr__()


def test_H_zero_5_classical_behavior():
    """H=0.5 (markoviano) ainda funciona, gera BM-like dynamics."""
    p = price_european_rough_bergomi_mc(
        S0=100, K=100, T=1.0, r=0.05, q=0.0,
        v0=0.04, eta=0.3, H=0.5, rho=-0.7,
        n_paths=50000, n_steps=100, seed=42
    )
    # Sanity: preco > 0 e ~ordem BSM
    assert 5.0 < p < 20.0, f"Preco H=0.5 fora da faixa: {p}"


if __name__ == "__main__":
    # Manual smoke test
    tests = [v for k, v in globals().items() if k.startswith("test_")]
    passed = 0
    for t in tests:
        try:
            t()
            print(f"  PASS: {t.__name__}")
            passed += 1
        except Exception as e:
            print(f"  FAIL: {t.__name__}: {e}")
    print(f"\n{passed}/{len(tests)} tests passed")