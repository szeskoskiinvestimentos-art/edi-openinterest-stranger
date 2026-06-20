"""
iv_smile.py - E21: SABR Model para IV Smile parametrico.

O modelo SABR (Stochastic Alpha Beta Rho) e o padrao da industria
para modelar o smile de volatilidade implicita.

Modelo:
    dF = alpha * F^beta * dW1
    dalpha = nu * alpha * dW2
    com correlacao rho entre W1 e W2

Parametros:
    F: forward price
    K: strike
    T: tempo em anos
    alpha: vol inicial (nivel de vol)
    beta: expoente do CEV (0 = normal, 1 = lognormal)
    rho: correlacao (tipico: -0.3 a -0.7 para equities)
    nu: vol da vol (vol of vol)

Implementacao baseada na aproximacao de Hagan (2002):
    sigma_implied(F, K, T, alpha, beta, rho, nu)

Referencias:
    Hagan, Kumar, Lesniewski, Woodward (2002) "Managing Smile Risk"
"""
from __future__ import annotations

import numpy as np
from scipy.optimize import minimize
from typing import Optional


# Limites razoaveis para os parametros
ALPHA_MIN, ALPHA_MAX = 0.001, 5.0   # vol inicial
BETA_MIN, BETA_MAX = 0.0, 1.0       # CEV exponent (0=normal, 1=lognormal)
RHO_MIN, RHO_MAX = -0.999, 0.999     # correlacao
NU_MIN, NU_MAX = 0.001, 5.0         # vol of vol


def hagan_implied_vol(
    F: float,
    K: float,
    T: float,
    alpha: float,
    beta: float,
    rho: float,
    nu: float,
) -> float:
    """Calcula volatilidade implicita SABR usando aproximacao de Hagan.

    Args:
        F: forward price (tipicamente = spot)
        K: strike
        T: tempo em anos
        alpha: vol inicial (nivel)
        beta: expoente CEV (0=normal, 1=lognormal)
        rho: correlacao
        nu: vol of vol

    Returns:
        Volatilidade implicita (sigma) para o strike K
    """
    if F <= 0 or K <= 0 or T <= 0 or alpha <= 0 or nu <= 0:
        return 0.0

    # Edge case: ATM
    eps = 1e-7
    if abs(F - K) < eps:
        # Formula ATM simplificada
        # sigma = alpha * F^(beta-1) * [1 + ((1-beta)^2/24 * alpha^2/F^(2-2beta) + rho*beta*nu*alpha/(4*F^(1-beta)) + (2-3*rho^2)/24 * nu^2) * T]
        one_minus_beta = 1.0 - beta
        factor = (
            1.0
            + (one_minus_beta**2 / 24.0) * (alpha**2) / (F ** (2 - 2 * beta))
            + (rho * beta * nu * alpha) / (4.0 * F ** (1 - beta))
            + ((2 - 3 * rho**2) / 24.0) * (nu**2)
        ) * T
        return alpha * (F ** (beta - 1)) * factor

    # Formula geral de Hagan (2002)
    log_FK = np.log(F / K)
    F_K_mid = (F * K) ** ((1 - beta) / 2)

    # Termo zeta
    zeta = (nu / alpha) * F_K_mid * log_FK

    # Termo x_zeta (para evitar singularidade)
    x_zeta = np.log((np.sqrt(1 - 2 * rho * zeta + zeta**2) + zeta - rho) / (1 - rho))

    # Verificar denominador
    if abs(x_zeta) < 1e-10:
        # Quando zeta -> 0, x_zeta -> 0 tambem
        # Usa formula ATM
        one_minus_beta = 1.0 - beta
        factor = (
            1.0
            + (one_minus_beta**2 / 24.0) * (alpha**2) / (F ** (2 - 2 * beta))
            + (rho * beta * nu * alpha) / (4.0 * F ** (1 - beta))
            + ((2 - 3 * rho**2) / 24.0) * (nu**2)
        ) * T
        return alpha * (F ** (beta - 1)) * factor

    # Termos de correcao
    one_minus_beta = 1.0 - beta
    z_over_xz = zeta / x_zeta

    factor_B = (
        one_minus_beta**2 / 24.0 * alpha**2 / (F ** (2 - 2 * beta))
        + rho * beta * nu * alpha / (4.0 * F ** (1 - beta))
        + (2 - 3 * rho**2) / 24.0 * nu**2
    )

    factor_A = alpha / (F_K_mid * (1 + (1 - beta)**2 / 24.0 * log_FK**2
                          + (1 - beta)**4 / 1920.0 * log_FK**4))

    B_T = factor_B * T

    sigma = factor_A * (z_over_xz) * (1 + B_T)

    return float(sigma)


class SABRModel:
    """Modelo SABR com calibracao por minimos quadrados.

    Uso:
        sabr = SABRModel(F=100.0, T=0.25)
        sabr.calibrate(strikes, ivs)
        iv_otm = sabr.implied_vol(K=110.0)
    """

    def __init__(
        self,
        F: float,
        T: float,
        beta: float = 0.5,  # default CEV (entre 0 e 1)
    ):
        """Inicializa modelo SABR.

        Args:
            F: forward price
            T: tempo em anos
            beta: expoente CEV (fixo na calibracao, tipicamente 0.5)
        """
        self.F = float(F)
        self.T = float(T)
        self.beta = float(beta)
        # Parametros calibrados (default: valores tipicos)
        self.alpha = 0.20  # vol inicial
        self.rho = -0.30   # correlacao (negativa para equities)
        self.nu = 0.50     # vol of vol

    def implied_vol(self, K: float) -> float:
        """Calcula IV para strike K usando parametros atuais."""
        return hagan_implied_vol(
            self.F, float(K), self.T,
            self.alpha, self.beta, self.rho, self.nu
        )

    def implied_vol_array(self, strikes: np.ndarray) -> np.ndarray:
        """Vetorizado: IV para array de strikes."""
        return np.array([
            hagan_implied_vol(
                self.F, float(K), self.T,
                self.alpha, self.beta, self.rho, self.nu
            )
            for K in strikes
        ])

    def calibrate(
        self,
        strikes: np.ndarray,
        market_ivs: np.ndarray,
        initial_alpha: Optional[float] = None,
        max_iter: int = 200,
        tol: float = 1e-4,
    ) -> dict:
        """Calibra alpha, rho, nu para casar market_ivs via minimos quadrados.

        Args:
            strikes: array de strikes observados
            market_ivs: IVs de mercado para esses strikes
            initial_alpha: chute inicial para alpha (default: media das IVs ATM)
            max_iter: maximo de iteracoes
            tol: tolerancia de convergencia

        Returns:
            dict com 'alpha', 'rho', 'nu', 'rmse', 'converged', 'iterations'
        """
        strikes = np.asarray(strikes, dtype=float)
        market_ivs = np.asarray(market_ivs, dtype=float)

        if len(strikes) != len(market_ivs) or len(strikes) < 3:
            raise ValueError(f"Necessario >= 3 strikes, got {len(strikes)}")

        # Chute inicial: alpha = media das IVs, rho = -0.3, nu = 0.5
        if initial_alpha is None:
            initial_alpha = float(np.nanmean(market_ivs))

        def objective(params):
            alpha, rho, nu = params
            if not (ALPHA_MIN <= alpha <= ALPHA_MAX):
                return 1e10
            if not (RHO_MIN <= rho <= RHO_MAX):
                return 1e10
            if not (NU_MIN <= nu <= NU_MAX):
                return 1e10
            try:
                model_ivs = np.array([
                    hagan_implied_vol(
                        self.F, K, self.T,
                        alpha, self.beta, rho, nu
                    )
                    for K in strikes
                ])
                if not np.all(np.isfinite(model_ivs)):
                    return 1e10
                residuals = model_ivs - market_ivs
                return float(np.sum(residuals**2))
            except Exception:
                return 1e10

        result = minimize(
            objective,
            x0=[initial_alpha, -0.30, 0.50],
            method='L-BFGS-B',
            bounds=[(ALPHA_MIN, ALPHA_MAX), (RHO_MIN, RHO_MAX), (NU_MIN, NU_MAX)],
            options={'maxiter': max_iter, 'ftol': tol**2}
        )

        self.alpha, self.rho, self.nu = result.x
        rmse = float(np.sqrt(result.fun / len(strikes)))
        return {
            'alpha': self.alpha,
            'rho': self.rho,
            'nu': self.nu,
            'rmse': rmse,
            'converged': result.success,
            'iterations': int(result.nit),
            'message': result.message,
        }

    def smile_metrics(self, strikes: np.ndarray) -> dict:
        """Calcula metricas do smile: skew, curvature, ATM vol."""
        strikes = np.asarray(strikes, dtype=float)
        ivs = self.implied_vol_array(strikes)

        # ATM = strike mais proximo do forward
        atm_idx = int(np.argmin(np.abs(strikes - self.F)))
        atm_vol = float(ivs[atm_idx])

        # Skew = diferenca OTM put vs OTM call (25-delta proxy)
        # Para simplificar: skew = IV(K<F) media - IV(K>F) media
        otm_put_mask = strikes < self.F
        otm_call_mask = strikes > self.F
        skew = 0.0
        if otm_put_mask.any() and otm_call_mask.any():
            iv_puts = ivs[otm_put_mask]
            iv_calls = ivs[otm_call_mask]
            skew = float(np.mean(iv_puts) - np.mean(iv_calls))

        # Curvature = IV(K=0.9F) - 2*ATM + IV(K=1.1F)
        curvature = 0.0
        try:
            iv_otm = float(self.implied_vol(self.F * 0.9))
            iv_far = float(self.implied_vol(self.F * 1.1))
            curvature = iv_otm - 2 * atm_vol + iv_far
        except Exception:
            pass

        return {
            'atm_vol': atm_vol,
            'skew': skew,
            'curvature': curvature,
            'smile_range': float(ivs.max() - ivs.min()),
            'n_points': len(strikes),
        }


def calibrate_from_iv_strike_ref(
    F: float,
    T: float,
    strikes: np.ndarray,
    iv_strike_ref: np.ndarray,
    beta: float = 0.5,
) -> SABRModel:
    """Helper: calibra SABR a partir de strikes e IVs per-strike.

    Args:
        F: forward price
        T: tempo em anos
        strikes: array de strikes observados
        iv_strike_ref: IV por strike (do calculator)
        beta: expoente CEV

    Returns:
        SABRModel calibrado
    """
    sabr = SABRModel(F=F, T=T, beta=beta)
    sabr.calibrate(strikes, iv_strike_ref)
    return sabr
