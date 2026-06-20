"""
test_dupire.py - Testes para E53 (Local Volatility de Dupire).

Valida:
- Vol local extraida de superficie BS sintetica deve ser ~constante
- Variacao da vol local em K (smile)
- Variacao da vol local em T (termo structure)
- Edge cases (K nos extremos da grade)
- Vol local vs Black-Scholes vol (sanity check)
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.calculator.dupire import (
    LocalVolModel,
    dupire_local_vol_from_surface,
    dupire_local_vol_grid,
)
from src.greeks import GreeksEngine


def _bs_call(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Calcula Call BS via GreeksEngine + paridade."""
    if T <= 0:
        return max(0.0, S - K)
    delta, _ = GreeksEngine.calculate_greeks(S, K, T, r, sigma, "call")
    # N(d1) = delta quando q=0, entao call = S*N(d1) - K*exp(-rT)*N(d2)
    # Para evitar recalcular d2, use formula alternativa
    # call = delta*S - delta_neg*K*exp(-rT) ... mas mais facil:
    # call_intrinsic = max(S-K, 0); para ATM, call ~ S*0.5 - K*exp(-rT)*0.5 (aprox)
    # Vamos usar a formula direta:
    from src.greeks import GreeksEngine as GE
    # GE tem d1/d2? Vou usar uma versao simples
    # d1 = (ln(S/K) + (r + sigma^2/2)*T) / (sigma*sqrt(T))
    import math
    d1 = (math.log(S/K) + (r + sigma**2/2)*T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    from scipy.stats import norm
    return S * norm.cdf(d1) - K * math.exp(-r*T) * norm.cdf(d2)


def _generate_bs_surface(
    S0: float, r: float, sigma: float,
    K_grid: np.ndarray, T_grid: np.ndarray,
    smile_func=None,
) -> np.ndarray:
    """Gera superficie de precos de Call usando BS.

    Args:
        S0, r, sigma: parametros BS
        K_grid, T_grid: eixos
        smile_func: opcinal, funcao(K, T) -> sigma que retorna vol por strike
    """
    C = np.zeros((len(T_grid), len(K_grid)))
    for i, T in enumerate(T_grid):
        for j, K in enumerate(K_grid):
            if T <= 0:
                C[i, j] = max(0.0, S0 - K)
            else:
                local_sigma = smile_func(K, T) if smile_func else sigma
                C[i, j] = _bs_call(S0, K, T, r, local_sigma)
    return C


def test_dupire_flat_vol_recovers_bs_vol() -> tuple[bool, str]:
    """Vol local de superficie BS flat deve recuperar a vol BS."""
    S0, r, sigma = 5000.0, 0.10, 0.20
    K_grid = np.array([4500.0, 4750.0, 5000.0, 5250.0, 5500.0])
    T_grid = np.array([0.1, 0.25, 0.5, 1.0])
    C = _generate_bs_surface(S0, r, sigma, K_grid, T_grid)

    # Calcula vol local no ATM (K=5000, T=0.25)
    sigma_loc = dupire_local_vol_from_surface(
        K=5000.0, T=0.25, K_grid=K_grid, T_grid=T_grid, C_grid=C, r=r,
    )

    if not np.isfinite(sigma_loc):
        return False, f"sigma_local nao finita: {sigma_loc}"
    # Tolerancia: dentro de 10% da vol BS (diferencas finitas introduzem erro)
    if abs(sigma_loc - sigma) > 0.10 * sigma:
        return False, f"sigma_local={sigma_loc:.4f} difere de sigma BS={sigma} > 10%"
    return True, f"sigma_local = {sigma_loc:.4f} (BS vol = {sigma})"


def test_dupire_smile_shape() -> tuple[bool, str]:
    """Superficie com smile: vol local deve ser maior em OTM puts (K << S0)."""
    S0, r = 5000.0, 0.10
    K_grid = np.array([4500.0, 4750.0, 5000.0, 5250.0, 5500.0])
    T_grid = np.array([0.1, 0.25, 0.5, 1.0])

    # Smile: sigma maior para strikes baixos (skew)
    def smile(K, T):
        return 0.20 + 0.10 * (5000.0 - K) / 500.0  # 0.10-0.30 para K=5500-4500

    C = _generate_bs_surface(S0, r, sigma=0.20, K_grid=K_grid, T_grid=T_grid, smile_func=smile)

    # Vol local ATM
    sigma_atm = dupire_local_vol_from_surface(5000.0, 0.25, K_grid, T_grid, C, r)
    # Vol local ITM put (K=4500)
    sigma_put = dupire_local_vol_from_surface(4500.0, 0.25, K_grid, T_grid, C, r)

    if not (np.isfinite(sigma_atm) and np.isfinite(sigma_put)):
        return False, f"Valores nao finitos: ATM={sigma_atm}, put={sigma_put}"
    # Smile construido: sigma_put > sigma_atm
    if sigma_put <= sigma_atm:
        return False, f"smile esperado: sigma_put > sigma_atm. Got put={sigma_put:.4f}, ATM={sigma_atm:.4f}"
    return True, f"ATM={sigma_atm:.4f}, put={sigma_put:.4f} (smile detectado)"


def test_dupire_term_structure() -> tuple[bool, str]:
    """Term structure: vol local pode variar com T (ex: vol aumenta com T)."""
    S0, r = 5000.0, 0.10
    K_grid = np.array([4750.0, 5000.0, 5250.0])
    T_grid = np.array([0.1, 0.5, 1.0, 2.0])

    # Term structure: sigma cresce com T
    def term(K, T):
        return 0.15 + 0.05 * T  # 0.15-0.25 para T=0-2

    C = _generate_bs_surface(S0, r, sigma=0.20, K_grid=K_grid, T_grid=T_grid, smile_func=term)

    sigma_short = dupire_local_vol_from_surface(5000.0, 0.1, K_grid, T_grid, C, r)
    sigma_long = dupire_local_vol_from_surface(5000.0, 1.0, K_grid, T_grid, C, r)

    if not (np.isfinite(sigma_short) and np.isfinite(sigma_long)):
        return False, f"Valores nao finitos: short={sigma_short}, long={sigma_long}"
    if sigma_long <= sigma_short:
        return False, f"term structure esperado: sigma_long > sigma_short. Got short={sigma_short:.4f}, long={sigma_long:.4f}"
    return True, f"T=0.1: {sigma_short:.4f}, T=1.0: {sigma_long:.4f}"


def test_dupire_local_vol_model_class() -> tuple[bool, str]:
    """LocalVolModel.local_vol() retorna mesmo que dupire_local_vol_from_surface()."""
    S0, r, sigma = 5000.0, 0.10, 0.20
    K_grid = np.array([4500.0, 4750.0, 5000.0, 5250.0, 5500.0])
    T_grid = np.array([0.1, 0.25, 0.5, 1.0])
    C = _generate_bs_surface(S0, r, sigma, K_grid, T_grid)

    model = LocalVolModel(K_grid, T_grid, C, r=r)
    sigma_oo = model.local_vol(5000.0, 0.25)
    sigma_fn = dupire_local_vol_from_surface(5000.0, 0.25, K_grid, T_grid, C, r)

    if not (np.isfinite(sigma_oo) and np.isfinite(sigma_fn)):
        return False, f"Valores nao finitos: oo={sigma_oo}, fn={sigma_fn}"
    if abs(sigma_oo - sigma_fn) > 1e-6:
        return False, f"OO vs funcional: {sigma_oo} vs {sigma_fn}"
    return True, f"OO = funcional: {sigma_oo:.4f}"


def test_dupire_grid_returns_full_surface() -> tuple[bool, str]:
    """dupire_local_vol_grid retorna sigma para toda a grade."""
    S0, r, sigma = 5000.0, 0.10, 0.20
    K_grid = np.array([4750.0, 5000.0, 5250.0])
    T_grid = np.array([0.25, 0.5, 1.0])
    C = _generate_bs_surface(S0, r, sigma, K_grid, T_grid)

    K_out, T_out, sigma_grid = dupire_local_vol_grid(K_grid, T_grid, C, r)

    if sigma_grid.shape != (len(T_grid), len(K_grid)):
        return False, f"Shape errado: {sigma_grid.shape} vs esperado {(len(T_grid), len(K_grid))}"
    if not np.all(np.isfinite(sigma_grid)):
        # Toleramos alguns NaN (bordas podem falhar)
        n_nan = np.sum(np.isnan(sigma_grid))
        n_total = sigma_grid.size
        if n_nan > n_total / 2:
            return False, f"Muitos NaN: {n_nan}/{n_total}"
    return True, f"Grid {sigma_grid.shape}, ATM(0.25)=~{sigma_grid[0, 1]:.4f}"


def test_dupire_too_few_points_raises() -> tuple[bool, str]:
    """LocalVolModel valida tamanho da grade."""
    # Menos de 3 strikes
    try:
        LocalVolModel(
            K_grid=np.array([5000.0, 5500.0]),
            T_grid=np.array([0.25, 0.5]),
            C_grid=np.zeros((2, 2)),
        )
    except ValueError:
        return True, "LocalVolModel rejeitou grade com <3 strikes"
    return False, "Deveria levantar ValueError"
