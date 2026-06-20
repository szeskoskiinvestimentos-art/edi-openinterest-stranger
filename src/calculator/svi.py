"""
svi.py - E54: SVI (Stochastic Volatility Inspired) parametrizacao de Gatheral (2004).

Parametrizacao do smile de volatilidade implicita em funcao do log-moneyness k = ln(K/F):

    w(k) = a + b * (rho * (k - m) + sqrt((k - m)^2 + sigma^2))

onde:
    a: nivel de variancia (paralelo shift, controla ATM vol)
    b: amplitude do smile (wing steepness)
    rho: correlacao (skew, tipicamente -0.7 a -0.3)
    m: shift do ATM (locacao do minimo)
    sigma: smoothness da ATM (wing curvature)
    k = ln(K/F): log-moneyness (forward)

SVI captura smile/skew de forma natural e e' usado em producao por bancos
para interpolar/extrapolar superficies de vol. Pode ser usado em conjunto
com SABR (forward smile) ou Dupire (smile instantaneo).

Constraints de Gatheral (no-arbitrage):
    b > 0
    |rho| < 1
    sigma > 0
    a + b*sigma*sqrt(1-rho^2) >= 0  (garante w(k) >= 0)

Referencia:
    Gatheral, J. (2004) "A Parsimonious Arbitrage-Free Implied Volatility
    Parameterization with Application to the Valuation of Volatility Derivatives"
    Presentation at Global Derivatives & Risk Management, Madrid.

    Gatheral, J., Jacquier, A. (2014) "Arbitrage-free SVI volatility surfaces"
    Quantitative Finance, 14(1), 59-73.
"""
from __future__ import annotations

import logging
from typing import Optional, Tuple

import numpy as np
from scipy.optimize import minimize

logger = logging.getLogger(__name__)


# Limites razoaveis para os parametros
A_MIN, A_MAX = -0.5, 1.0          # nivel de variancia (pode ser negativo!)
B_MIN, B_MAX = 0.001, 5.0         # amplitude
RHO_MIN, RHO_MAX = -0.999, 0.999  # correlacao
M_MIN, M_MAX = -1.0, 1.0          # shift do ATM
SIGMA_MIN, SIGMA_MAX = 0.001, 5.0  # smoothness


def svi_implied_variance(
    k: float | np.ndarray,
    a: float, b: float, rho: float, m: float, sigma: float,
) -> float | np.ndarray:
    """Calcula variancia total implicita SVI para log-moneyness k.

    w(k) = a + b * (rho*(k - m) + sqrt((k - m)^2 + sigma^2))

    Args:
        k: log-moneyness (escalar ou array) = ln(K/F)
        a, b, rho, m, sigma: parametros SVI

    Returns:
        w(k) - variancia total implicita (escalar ou array)
    """
    km = k - m
    return a + b * (rho * km + np.sqrt(km ** 2 + sigma ** 2))


def svi_implied_vol(
    k: float | np.ndarray,
    T: float,
    a: float, b: float, rho: float, m: float, sigma: float,
) -> float | np.ndarray:
    """Calcula volatilidade implicita SVI para log-moneyness k e maturidade T.

    sigma_impl(k, T) = sqrt(w(k) / T)

    Args:
        k: log-moneyness
        T: maturidade em anos
        a, b, rho, m, sigma: parametros SVI

    Returns:
        sigma_impl(k, T)
    """
    w = svi_implied_variance(k, a, b, rho, m, sigma)
    # Garantir nao-negatividade para evitar sqrt de negativo
    w_safe = np.maximum(w, 0.0)
    return np.sqrt(w_safe / T)


class SVIModel:
    """Wrapper OO para parametrizacao SVI de Gatheral.

    Atributos:
        a, b, rho, m, sigma: parametros SVI
    """

    def __init__(
        self,
        a: float,
        b: float,
        rho: float,
        m: float,
        sigma: float,
    ) -> None:
        """Inicializa com parametros SVI.

        Args:
            a: nivel de variancia
            b: amplitude do smile
            rho: correlacao (-1 < rho < 1)
            m: shift do ATM
            sigma: smoothness da ATM
        """
        if not (A_MIN <= a <= A_MAX):
            raise ValueError(f"a fora do range [{A_MIN}, {A_MAX}]: {a}")
        if not (B_MIN <= b <= B_MAX):
            raise ValueError(f"b fora do range [{B_MIN}, {B_MAX}]: {b}")
        if not (RHO_MIN <= rho <= RHO_MAX):
            raise ValueError(f"rho fora do range: {rho}")
        if not (M_MIN <= m <= M_MAX):
            raise ValueError(f"m fora do range: {m}")
        if not (SIGMA_MIN <= sigma <= SIGMA_MAX):
            raise ValueError(f"sigma fora do range: {sigma}")

        # Constraint de Gatheral: garante w(k) >= 0
        min_var = a + b * sigma * np.sqrt(1.0 - rho ** 2)
        if min_var < 0:
            raise ValueError(
                f"Constraint violada: a + b*sigma*sqrt(1-rho^2) = {min_var} < 0 "
                f"(risco de arbitragem)"
            )

        self.a = a
        self.b = b
        self.rho = rho
        self.m = m
        self.sigma = sigma

    def implied_variance(self, k: float | np.ndarray) -> float | np.ndarray:
        """Variancia total implicita para log-moneyness k."""
        return svi_implied_variance(k, self.a, self.b, self.rho, self.m, self.sigma)

    def implied_vol(self, k: float, T: float) -> float:
        """Vol implicita para (k, T)."""
        return svi_implied_vol(k, T, self.a, self.b, self.rho, self.m, self.sigma)

    def fit(
        self,
        k_market: np.ndarray,
        market_vols: np.ndarray,
        T: float,
    ) -> "SVIModel":
        """Calibra parametros SVI a partir de vols de mercado.

        Args:
            k_market: array de log-moneyness
            market_vols: array de vols implicitas
            T: maturidade em anos

        Returns:
            Nova instancia de SVIModel com parametros calibrados
        """
        if len(k_market) != len(market_vols):
            raise ValueError("k_market e market_vols devem ter mesmo tamanho")
        if len(k_market) < 3:
            raise ValueError("Precisa de >= 3 pontos para calibrar")

        market_vars = market_vols ** 2 * T  # variancia total

        def _objective(params):
            a, b, rho, m, sigma = params
            # Penalty para parametros fora do range
            if not (A_MIN <= a <= A_MAX and B_MIN <= b <= B_MAX
                    and RHO_MIN <= rho <= RHO_MAX
                    and M_MIN <= m <= M_MAX and SIGMA_MIN <= sigma <= SIGMA_MAX):
                return 1e10
            # Penalty para constraint Gatheral
            if a + b * sigma * np.sqrt(1.0 - rho ** 2) < 0:
                return 1e10

            try:
                model_vars = svi_implied_variance(k_market, a, b, rho, m, sigma)
                # MSE em vols (normalizado pela vol media)
                mse = np.mean((model_vars - market_vars) ** 2) / (np.mean(market_vars) ** 2)
                return mse
            except Exception as e:
                logger.debug("[E95] _objective failed: %s", e)
                return 1e10

        # Initial guess
        x0 = [self.a, self.b, self.rho, self.m, self.sigma]
        bounds = [
            (A_MIN, A_MAX), (B_MIN, B_MAX), (RHO_MIN, RHO_MAX),
            (M_MIN, M_MAX), (SIGMA_MIN, SIGMA_MAX),
        ]
        result = minimize(_objective, x0, method="L-BFGS-B", bounds=bounds,
                          options={"maxiter": 200, "ftol": 1e-10})

        a, b, rho, m, sigma = result.x
        return SVIModel(a, b, rho, m, sigma)

    def min_variance(self) -> float:
        """Variancia minima do smile (em k=m).

        w(m) = a + b*sigma
        """
        return self.a + self.b * self.sigma

    def atm_variance(self) -> float:
        """Variancia ATM (em k=0).

        w(0) = a + b * (rho*(-m) + sqrt(m^2 + sigma^2))
        """
        return float(svi_implied_variance(0.0, self.a, self.b, self.rho, self.m, self.sigma))

    def __repr__(self) -> str:
        return (f"SVIModel(a={self.a:.4f}, b={self.b:.4f}, rho={self.rho:.4f}, "
                f"m={self.m:.4f}, sigma={self.sigma:.4f})")
