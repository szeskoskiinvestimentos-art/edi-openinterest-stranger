"""
dupire.py - E53: Local Volatility de Dupire (1994).

Modelo de volatilidade local deterministica:

    sigma_local^2(K, T) = [ dC/dT + (r-q)*K * dC/dK + q*C ]
                          / [ 0.5 * K^2 * d2C/dK2 ]

A volatilidade local e' extraida dos precos de mercado C(K, T) via
diferenciacao numerica. Diferente de Heston (estocastica), a vol local
e' deterministica em funcao de (K, T).

Parametros de entrada:
    K_grid: array de strikes (ordenado)
    T_grid: array de maturidades (ordenado, > 0)
    C_grid: matriz 2D de precos de Call de mercado [T x K]
    r: taxa livre de risco
    q: dividend yield (default 0)

Referencia:
    Dupire, B. (1994) "Pricing with a Smile"
    Risk Magazine, 7(1), 18-20.

    Derman, E., Kani, I. (1994) "Riding on a Smile"
    Risk Magazine, 7(2), 32-39.

    Gatheral, J. (2006) "The Volatility Surface"
    Wiley. (Cap 3 - Dupire formula)
"""
from __future__ import annotations

import logging
from typing import Optional

import numpy as np
from scipy.interpolate import RectBivariateSpline

logger = logging.getLogger(__name__)


# Limites razoaveis
SIGMA_LOCAL_MIN, SIGMA_LOCAL_MAX = 0.001, 5.0


def dupire_local_vol_from_surface(
    K: float,
    T: float,
    K_grid: np.ndarray,
    T_grid: np.ndarray,
    C_grid: np.ndarray,
    r: float = 0.0,
    q: float = 0.0,
) -> float:
    """Calcula vol local sigma(K, T) a partir de superficie de precos.

    Args:
        K: strike alvo
        T: maturidade alvo
        K_grid: array de strikes (deve estar ordenado)
        T_grid: array de maturidades (deve estar ordenado, > 0)
        C_grid: matriz 2D [T_grid x K_grid] de precos de Call
        r: taxa livre de risco
        q: dividend yield

    Returns:
        sigma_local(K, T) - volatilidade local
    """
    # Garante arrays numpy ordenados
    K_grid = np.asarray(K_grid, dtype=float)
    T_grid = np.asarray(T_grid, dtype=float)
    C_grid = np.asarray(C_grid, dtype=float)

    if len(K_grid) < 3 or len(T_grid) < 2:
        raise ValueError(
            f"Precisa de >=3 strikes e >=2 maturidades: K={len(K_grid)}, T={len(T_grid)}"
        )

    # Verifica se (K, T) esta' dentro da grade
    if K < K_grid[0] or K > K_grid[-1]:
        logger.warning("K=%f fora da grade [%f, %f]", K, K_grid[0], K_grid[-1])
    if T < T_grid[0] or T > T_grid[-1]:
        logger.warning("T=%f fora da grade [%f, %f]", T, T_grid[0], T_grid[-1])

    # Calcular derivadas parciais via numpy.gradient (diferencas finitas) na grade
    # scipy.RectBivariateSpline e' instavel para dy=2 em grades pequenas (<=4 pontos)
    # dC/dK
    dC_dK_grid = np.gradient(C_grid, K_grid, axis=1)
    # d2C/dK2
    d2C_dK2_grid = np.gradient(dC_dK_grid, K_grid, axis=1)
    # dC/dT
    dC_dT_grid = np.gradient(C_grid, T_grid, axis=0)

    # Agora interpolar cada grade de derivadas para (K, T) alvo
    # Usamos RectBivariateSpline com ky=1 (linear) para interpolar
    try:
        # s = 0 (sem smoothing) para interpolar dados ja derivados
        spline_C = RectBivariateSpline(T_grid, K_grid, C_grid, kx=1, ky=1, s=0)
        spline_dC_dK = RectBivariateSpline(T_grid, K_grid, dC_dK_grid, kx=1, ky=1, s=0)
        spline_d2C_dK2 = RectBivariateSpline(T_grid, K_grid, d2C_dK2_grid, kx=1, ky=1, s=0)
        spline_dC_dT = RectBivariateSpline(T_grid, K_grid, dC_dT_grid, kx=1, ky=1, s=0)
    except Exception as e:
        logger.error("Falha no spline: %s", e)
        return np.nan

    # Valores interpolados em (T, K)
    C = float(spline_C(T, K))
    dC_dK = float(spline_dC_dK(T, K))
    d2C_dK2 = float(spline_d2C_dK2(T, K))
    dC_dT = float(spline_dC_dT(T, K))

    numerator = dC_dT + (r - q) * K * dC_dK + q * C
    denominator = 0.5 * (K ** 2) * d2C_dK2

    # Sanidade: denominador > 0 (precos de call sao convexos em K)
    if abs(denominator) < 1e-10:
        logger.warning("Denominador ~ 0 em K=%f T=%f (K perto de ATM?)", K, T)
        return np.nan

    if denominator <= 0:
        # Vol local negativa/zero nao faz sentido - indica arbitrage ou dados ruins
        logger.warning(
            "Denominador negativo em K=%f T=%f: %f (possivel arbitragem nos dados)",
            K, T, denominator,
        )
        return np.nan

    sigma_sq = numerator / denominator

    if sigma_sq < 0:
        # Numerador negativo: taxa forward caiu com T (raro)
        logger.warning("sigma^2 negativo: %f (numerador=%f)", sigma_sq, numerator)
        return np.nan

    return float(np.sqrt(sigma_sq))


def dupire_local_vol_grid(
    K_grid: np.ndarray,
    T_grid: np.ndarray,
    C_grid: np.ndarray,
    r: float = 0.0,
    q: float = 0.0,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Calcula vol local em toda a grade (K, T).

    Returns:
        (K_out, T_out, sigma_grid) - 1D arrays + grade 2D
    """
    K_grid = np.asarray(K_grid, dtype=float)
    T_grid = np.asarray(T_grid, dtype=float)
    C_grid = np.asarray(C_grid, dtype=float)

    K_out, T_out = np.meshgrid(K_grid, T_grid)
    sigma_grid = np.full_like(K_out, np.nan)

    for i, t in enumerate(T_grid):
        for j, k in enumerate(K_grid):
            try:
                sigma_grid[i, j] = dupire_local_vol_from_surface(
                    k, t, K_grid, T_grid, C_grid, r, q,
                )
            except Exception as e:
                logger.debug("[E95] dupire_local_vol_grid failed: %s", e)
                sigma_grid[i, j] = np.nan

    return K_out, T_out, sigma_grid


class LocalVolModel:
    """Wrapper OO para o modelo de Local Volatility de Dupire.

    Atributos:
        K_grid, T_grid: arrays ordenados
        C_grid: precos de Call de mercado [T x K]
        r, q: taxa livre de risco, dividend yield
    """

    def __init__(
        self,
        K_grid: np.ndarray,
        T_grid: np.ndarray,
        C_grid: np.ndarray,
        r: float = 0.0,
        q: float = 0.0,
    ) -> None:
        """Inicializa com grade de precos de mercado.

        Args:
            K_grid: array de strikes (deve estar ordenado)
            T_grid: array de maturidades (deve estar ordenado, > 0)
            C_grid: matriz 2D [T x K] de precos de Call
            r: taxa livre de risco
            q: dividend yield
        """
        if len(K_grid) < 3 or len(T_grid) < 2:
            raise ValueError("Precisa de >=3 strikes e >=2 maturidades")

        self.K_grid = np.asarray(K_grid, dtype=float)
        self.T_grid = np.asarray(T_grid, dtype=float)
        self.C_grid = np.asarray(C_grid, dtype=float)
        self.r = r
        self.q = q

    def local_vol(self, K: float, T: float) -> float:
        """Calcula vol local sigma(K, T)."""
        return dupire_local_vol_from_surface(
            K, T, self.K_grid, self.T_grid, self.C_grid, self.r, self.q,
        )

    def local_vol_grid(self) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Calcula vol local em toda a grade."""
        return dupire_local_vol_grid(
            self.K_grid, self.T_grid, self.C_grid, self.r, self.q,
        )

    def __repr__(self) -> str:
        return (f"LocalVolModel(K={len(self.K_grid)} strikes, "
                f"T={len(self.T_grid)} maturidades, r={self.r}, q={self.q})")
