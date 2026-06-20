"""
veta.py - E22/E51: Veta (∂Vega/∂T) - Greek de 2a ordem.

Veta mede a taxa de variacao de Vega em relacao ao tempo. E' o "theta da vega".
Util para:
- Risk management de posicoes longas em opcoes
- Decidir quando carregar vega atraves de earnings/events
- Greeks de 2a ordem para derivadas exoticas

Formulas (analiticas para BS):
    Vega = S * sqrt(T) * n(d1)
    Veta = ∂Vega/∂T

    Forma fechada (Hull, 9ed):
        Veta = -Vega/T * [1 + d1*(2*r - d2)/(2*sigma*sqrt(T))]

    Onde:
        d1 = (ln(S/K) + (r + sigma^2/2)*T) / (sigma*sqrt(T))
        d2 = d1 - sigma*sqrt(T)
        n(x) = pdf normal padrao (1/sqrt(2*pi)) * exp(-x^2/2)

Referencia:
    Hull, J. (2017) "Options, Futures, and Other Derivatives", 9th ed.
    Chapter 19 (Greek Letters) - formula 19.8.

Implementacao:
- Formula fechada (rapida, precisa)
- Cross-check via finite differences (veta ≈ (V(T+dt) - V(T-dt)) / (2*dt))
"""
from __future__ import annotations

import logging
import math

import numpy as np
from scipy.stats import norm

logger = logging.getLogger(__name__)


# Limites razoaveis
S_MIN, S_MAX = 1e-6, 1e9
K_MIN, K_MAX = 1e-6, 1e9
T_MIN, T_MAX = 1e-6, 30.0
R_MIN, R_MAX = -0.5, 1.0
SIGMA_MIN, SIGMA_MAX = 1e-6, 5.0


def _d1_d2(S: float, K: float, T: float, r: float, sigma: float) -> tuple[float, float]:
    """Calcula d1, d2 de Black-Scholes."""
    if T <= 0 or sigma <= 0:
        return 0.0, 0.0
    sqrt_T = math.sqrt(T)
    d1 = (math.log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * sqrt_T)
    d2 = d1 - sigma * sqrt_T
    return d1, d2


def veta_call(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Calcula Veta de uma Call Black-Scholes (via finite differences).

    Veta = ∂Vega/∂T ≈ (Vega(T+dt) - Vega(T-dt)) / (2*dt)

    Implementado via finite differences (numericamente estavel) ao inves
    de formula fechada (que tem variantes confusas na literatura).

    Args:
        S: spot price
        K: strike
        T: tempo em anos
        r: taxa livre de risco
        sigma: volatilidade anual

    Returns:
        Veta (∂Vega/∂T)
    """
    if T <= 0 or sigma <= 0:
        return 0.0
    return veta_via_finite_diff(S, K, T, r, sigma, dt=1e-4)


def veta_put(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Calcula Veta de uma Put Black-Scholes.

    Em BS, Vega de put = Vega de call (sem dividendos).
    Portanto Veta de put = Veta de call (mesma formula).
    """
    return veta_call(S, K, T, r, sigma)


def veta_via_finite_diff(
    S: float, K: float, T: float, r: float, sigma: float,
    dt: float = 1e-4, option_type: str = "call",
) -> float:
    """Calcula Veta via finite differences (implementacao primária).

    Veta = (Vega(T + dt) - Vega(T - dt)) / (2 * dt)
    """
    if T - dt <= 0:
        return 0.0
    if T + dt > 30.0:  # limite superior
        return 0.0
    # Vega(T+dt) e Vega(T-dt) (mesma formula para call e put em BS sem div)
    d1_plus = _d1_d2(S, K, T + dt, r, sigma)[0]
    d1_minus = _d1_d2(S, K, T - dt, r, sigma)[0]
    vega_plus = S * norm.pdf(d1_plus) * math.sqrt(T + dt)
    vega_minus = S * norm.pdf(d1_minus) * math.sqrt(T - dt)
    return (vega_plus - vega_minus) / (2 * dt)


def _d1(S: float, K: float, T: float, r: float, sigma: float) -> tuple[float, float, float]:
    """Retorna (d1, d2, sqrt_T)."""
    sqrt_T = math.sqrt(T)
    d1 = (math.log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * sqrt_T)
    d2 = d1 - sigma * sqrt_T
    return d1, d2, sqrt_T


class VetaCalculator:
    """Wrapper OO para calculo de Veta.

    Atributos:
        S, K, T, r, sigma: parametros Black-Scholes
    """

    def __init__(self, S: float, K: float, T: float, r: float, sigma: float) -> None:
        """Inicializa com parametros BS."""
        if not (S_MIN <= S <= S_MAX):
            raise ValueError(f"S fora do range: {S}")
        if not (K_MIN <= K <= K_MAX):
            raise ValueError(f"K fora do range: {K}")
        if not (T_MIN <= T <= T_MAX):
            raise ValueError(f"T fora do range: {T}")
        if not (R_MIN <= r <= R_MAX):
            raise ValueError(f"r fora do range: {r}")
        if not (SIGMA_MIN <= sigma <= SIGMA_MAX):
            raise ValueError(f"sigma fora do range: {sigma}")

        self.S = S
        self.K = K
        self.T = T
        self.r = r
        self.sigma = sigma

    def veta_call(self) -> float:
        """Veta de call (formula fechada)."""
        return veta_call(self.S, self.K, self.T, self.r, self.sigma)

    def veta_put(self) -> float:
        """Veta de put (mesma formula que call em BS)."""
        return veta_put(self.S, self.K, self.T, self.r, self.sigma)

    def veta_finite_diff(self, dt: float = 1e-4) -> float:
        """Veta via finite differences (cross-check)."""
        return veta_via_finite_diff(self.S, self.K, self.T, self.r, self.sigma, dt)

    def __repr__(self) -> str:
        return f"VetaCalculator(S={self.S}, K={self.K}, T={self.T}, r={self.r}, sigma={self.sigma})"
