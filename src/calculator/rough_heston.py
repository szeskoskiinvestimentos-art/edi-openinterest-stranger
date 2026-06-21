"""
rough_heston.py - E77: Rough Heston (El Euch-Rosenbaum 2018, simplified).

Modelo que combina:
- Rough vol (H < 0.5): expoente de Hurst, variancia rough
- Mean reversion (kappa_h, theta): variancia reverte para long-term level
- Stochastic vol com saltos estilo Heston

Processo de variancia (rough):

    dxi(t) = kappa_h * (theta - xi(t)) * dt + nu * sqrt(xi(t)) * dW^H(t)

Onde:
    - xi(t): variancia instantanea rough
    - kappa_h: velocidade de mean reversion
    - theta: long-term variance
    - nu: vol of vol (sigma_v)
    - W^H: fractional Brownian motion com Hurst H in (0, 1)

Caracteristica: combinacao de mean reversion (Heston) com rough vol.
Para H=0.5, recupera Heston classico (markoviano).
Para kappa_h -> 0, recupera rBergomi (sem mean reversion).

Implementacao: usa closed-form aproximada (Heston-style char func com
correcao rough na variancia integrada). Convergencia via COS method
(mesmo padrao de rbergomi.py).

Referencia:
    El Euch, O., Rosenbaum, M. (2018) "The rough volatility framework",
    Quantitative Finance, 19(2), 243-265.

    Bayer, C., Friz, P., Gatheral, J. (2016) "Pricing under rough volatility",
    Quantitative Finance, 16(6), 887-904.

Limitacoes:
- Caracteristica simplificada (Heston + correcao rough na variancia
  integrada, NAO a fractional Riccati completa de El Euch-Rosenbaum)
- H tipico: 0.05-0.15 (rough) ou 0.5 (markoviano=Heston)
- Requer COS method (Fang-Oosterlee 2008) para inverter caracteristica
- Cosseno truncado em [a, b] = [c1 - L*sqrt(c2), c1 + L*sqrt(c2)]
  com L=10 e N=256 termos
"""
from __future__ import annotations

import logging
import math

logger = logging.getLogger(__name__)


# Limites para os parametros
H_MIN, H_MAX = 0.01, 0.99            # Hurst parameter
KAPPA_H_MIN, KAPPA_H_MAX = 0.0, 50.0  # mean reversion speed (0 = sem reversion, -> rBergomi)
THETA_MIN, THETA_MAX = 0.0001, 5.0   # long-term variance
NU_MIN, NU_MAX = 0.0, 5.0           # vol of vol (sigma_v)
RHO_MIN, RHO_MAX = -0.999, 0.999    # correlacao spot-vol
V0_MIN, V0_MAX = 0.0001, 5.0         # variancia inicial

# COS method params
N_COS_DEFAULT = 256
L_COS = 10.0


def _bs_call(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Black-Scholes call price (fallback)."""
    if T <= 0 or sigma <= 0:
        return max(S - K * math.exp(-r * T), 0.0) if S > 0 else 0.0
    sqrt_T = math.sqrt(T)
    d1 = (math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt_T)
    d2 = d1 - sigma * sqrt_T
    cdf = lambda x: 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))
    return max(S * cdf(d1) - K * math.exp(-r * T) * cdf(d2), 0.0)


def _heston_mean_rev_integrated_variance(v0: float, kappa_h: float, theta: float, T: float) -> float:
    """Variancia integrada com mean reversion (caso Heston: T*V onde V~E[xi(t)]).

    Para Heston (kappa_h > 0):
        E[integral_0^T xi(t) dt] = (v0 - theta)/kappa_h * (1 - exp(-kappa_h*T)) + theta*T

    Para kappa_h = 0 (sem mean reversion): reduz a v0*T.
    """
    if kappa_h <= 1e-9:
        return v0 * T
    # Heston formula
    return (v0 - theta) / kappa_h * (1.0 - math.exp(-kappa_h * T)) + theta * T


def _rough_heston_char_func(
    u: complex,
    S0: float, K: float, T: float, r: float,
    v0: float, kappa_h: float, theta: float, nu: float, rho: float, H: float,
) -> complex:
    """
    Funcao caracteristica do log-preco no modelo Rough Heston (simplificado).

    Combina:
    - Heston mean reversion (kappa_h, theta) na variancia integrada
    - Rough vol correction (H) na variancia e covariancia (skew)
    - Correlacao rho (skew term)

    Forma:
        psi(u) = iu * log(S_0/K)
              + iu * (r - 0.5 * V_avg) * T           # drift risk-neutral
              - 0.5 * u^2 * V_avg                     # variancia (Heston-style)
              - 0.5 * u^2 * nu^2 * I2_rough           # rough correction
              + iu * rho * nu * I1_rough              # skew (rough)

    Onde:
        V_avg = mean-reverting integrated variance
        I1_rough = integral_0^T K_H(T,s) xi_0(s) ds
        I2_rough = integral_0^T integral_0^T K_H(T,s) K_H(T,r) xi_0(s) xi_0(r) ds dr

    Para H=0.5 e kappa_h=0: reduz a BS com vol=sqrt(v0).
    Para H=0.5 e kappa_h>0: reduz a Heston classico.
    Para kappa_h=0: reduz a rBergomi (rough Bergomi sem mean reversion).
    """
    if T <= 0:
        return complex(1.0, 0.0)

    log_moneyness = math.log(S0 / K)

    # Variancia integrada (Heston mean-reverting)
    V_avg = _heston_mean_rev_integrated_variance(v0, kappa_h, theta, T)

    # Rough vol integrals (mesmo padrao de rBergomi)
    # I1 = integral_0^T K_H(T,s) xi_0(s) ds = v0 * sqrt(2H+1) * T^(H+1) / (H+1)
    I1 = v0 * math.sqrt(2.0 * H + 1.0) * (T ** (H + 1.0)) / (H + 1.0)

    # I2 = integral duplo
    I2 = (v0 ** 2) * (2.0 * H + 1.0) * (T ** (2.0 * H + 2.0)) / (2.0 * (H + 1.0) ** 3)

    # Rough correction to integrated variance
    rough_var = 0.5 * (nu ** 2) * (v0 ** 2) * (2.0 * H + 1.0) * (T ** (2.0 * H + 3.0)) / (
        ((H + 1.0) ** 2) * (2.0 * H + 3.0)
    )

    # Termos
    term1 = complex(0, 1) * u * log_moneyness
    term2 = complex(0, 1) * u * (r - 0.5 * V_avg / T) * T  # drift risk-neutral
    term3 = -0.5 * u ** 2 * V_avg
    term4 = -0.5 * u ** 2 * (nu ** 2) * I2  # rough correction
    term5 = complex(0, 1) * u * rho * nu * I1  # skew

    psi = term1 + term2 + term3 + term4 + term5

    exp_real = math.exp(psi.real)
    if exp_real > 1e300:
        exp_real = 1e300
    elif exp_real < 1e-300:
        exp_real = 0.0

    return complex(exp_real * math.cos(psi.imag), exp_real * math.sin(psi.imag))


def _cos_method_call(
    S0: float, K: float, T: float, r: float,
    v0: float, kappa_h: float, theta: float, nu: float, rho: float, H: float,
    n_cos: int = N_COS_DEFAULT,
) -> float:
    """
    Call price via COS method (Fang & Oosterlee 2008).

    Trunca o dominio do log-preco em [a, b] e expande em series de
    cosenos. Convergencia exponencial.
    """
    if T <= 0:
        return max(S0 - K, 0.0)

    # Dominio de truncamento
    V_avg = _heston_mean_rev_integrated_variance(v0, kappa_h, theta, T)
    rough_var = 0.5 * (nu ** 2) * (v0 ** 2) * (2.0 * H + 1.0) * (T ** (2.0 * H + 3.0)) / (
        ((H + 1.0) ** 2) * (2.0 * H + 3.0)
    )
    c1 = math.log(S0 / K) + (r - 0.5 * V_avg / T) * T
    c2 = V_avg + rough_var
    sqrt_c2 = math.sqrt(max(c2, 1e-9))
    a = c1 - L_COS * sqrt_c2
    b = c1 + L_COS * sqrt_c2
    b_minus_a = b - a

    def Vk(k: int) -> float:
        """Fourier-cosine coefficient of call payoff no dominio [a, b]."""
        omega_k = k * math.pi / b_minus_a

        if k == 0:
            if a < 0 < b:
                return K * (math.exp(b) - b - 1.0)
            elif b <= 0:
                return 0.0
            else:  # a >= 0
                return K * (math.exp(b) - math.exp(a) - (b - a))

        i_omega = complex(0, omega_k)
        one_plus_i_omega = complex(1, omega_k)

        exp_b = complex(math.exp(b) * math.cos(omega_k * b),
                        math.exp(b) * math.sin(omega_k * b))
        exp_a = complex(math.exp(a) * math.cos(omega_k * a),
                        math.exp(a) * math.sin(omega_k * a))
        phi_k = (exp_b - exp_a) / one_plus_i_omega

        cos_b = complex(math.cos(omega_k * b), math.sin(omega_k * b))
        cos_a = complex(math.cos(omega_k * a), math.sin(omega_k * a))
        psi_k = (cos_b - cos_a) / i_omega

        exp_neg_iwa = complex(math.cos(-omega_k * a), math.sin(-omega_k * a))
        V_k = K * (phi_k - psi_k) * exp_neg_iwa
        return V_k.real

    # Soma COS (Fang-Oosterlee eq 3.4)
    # c_n = (2/(b-a)) * SUM_k Re[char(ω_k) * exp(-iω_k*a)] * V_k * A_k
    # onde A_k = 0.5 se k=0, 1 caso contrario
    sum_val = 0.0
    for k in range(n_cos + 1):
        omega_k = k * math.pi / b_minus_a
        char_val = _rough_heston_char_func(
            complex(omega_k, 0), S0, K, T, r,
            v0, kappa_h, theta, nu, rho, H,
        )
        exp_factor = complex(math.cos(-omega_k * a), math.sin(-omega_k * a))
        V_k = Vk(k)
        A_k = 0.5 if k == 0 else 1.0
        term = (char_val * exp_factor).real * V_k * A_k
        sum_val += term

    # C = e^(-rT) * (2/(b-a)) * sum_val
    call = math.exp(-r * T) * (2.0 / b_minus_a) * sum_val
    intrinsic = max(0.0, S0 - K * math.exp(-r * T))
    if call < intrinsic * 0.99:
        logger.warning(
            "Rough Heston call %f abaixo do intrinseco %f (S=%f K=%f T=%f)",
            call, intrinsic, S0, K, T,
        )
        return intrinsic
    return max(call, 0.0)


def rough_heston_call_price(
    S0: float, K: float, T: float, r: float,
    v0: float, kappa_h: float, theta: float, nu: float, rho: float, H: float,
    n_cos: int = N_COS_DEFAULT,
) -> float:
    """Calcula preco de Call Europeia no modelo Rough Heston (simplificado).

    Args:
        S0: spot price
        K: strike
        T: tempo em anos
        r: taxa livre de risco
        v0: variancia inicial
        kappa_h: mean reversion speed (0 = sem reversion, -> rBergomi)
        theta: long-term variance
        nu: vol of vol (sigma_v)
        rho: correlacao spot-variance
        H: expoente de Hurst (0.01-0.99, 0.5 = Heston classico)
        n_cos: numero de termos COS

    Returns:
        Preco teorico da Call
    """
    # Edge case: T=0
    if T <= 0:
        return max(S0 - K, 0.0)

    # Edge case: nu=0 e H=0.5 -> Heston degenera em BS
    if nu == 0 and abs(H - 0.5) < 1e-6:
        sigma = math.sqrt(v0)
        return _bs_call(S0, K, T, r, sigma)

    # Edge case: nu=0 -> sem vol of vol, v constante = v0
    if nu == 0:
        sigma = math.sqrt(v0)
        return _bs_call(S0, K, T, r, sigma)

    # Edge case: kappa_h=0 e H<0.5 -> Rough Bergomi sem mean reversion
    if kappa_h <= 1e-9 and H < 0.5:
        # Calcular usando a mesma formula, sem o termo de mean reversion
        # V_avg = v0*T (sem reversion)
        # E' equivalente a chamar _cos_method_call com theta qualquer
        # (theta nao afeta se kappa=0)
        return _cos_method_call(S0, K, T, r, v0, 0.0, v0, nu, rho, H, n_cos)

    # Caso geral
    return _cos_method_call(S0, K, T, r, v0, kappa_h, theta, nu, rho, H, n_cos)


def rough_heston_put_price(
    S0: float, K: float, T: float, r: float,
    v0: float, kappa_h: float, theta: float, nu: float, rho: float, H: float,
    n_cos: int = N_COS_DEFAULT,
) -> float:
    """Calcula preco de Put Europeia no modelo Rough Heston.

    Implementado via paridade put-call (valida para Rough Heston pois
    o drift e' risk-neutral e o modelo e' martingale).
    """
    call = rough_heston_call_price(
        S0, K, T, r, v0, kappa_h, theta, nu, rho, H, n_cos,
    )
    put = call - S0 + K * math.exp(-r * T)
    return max(put, 0.0)


class RoughHestonModel:
    """Wrapper OO para o modelo Rough Heston (simplificado).

    Atributos:
        v0, kappa_h, theta, nu, rho, H: parametros do modelo
    """

    def __init__(
        self,
        v0: float,
        kappa_h: float,
        theta: float,
        nu: float,
        rho: float,
        H: float,
    ) -> None:
        """Inicializa com parametros do modelo Rough Heston.

        Args:
            v0: variancia inicial (ex: 0.04 = 20% vol)
            kappa_h: mean reversion speed (ex: 0.5; 0 = sem reversion)
            theta: long-term variance (ex: 0.04)
            nu: vol of vol (ex: 0.3)
            rho: correlacao (ex: -0.7)
            H: Hurst parameter (0.05-0.15 rough; 0.5 markoviano=Heston)
        """
        if not (V0_MIN <= v0 <= V0_MAX):
            raise ValueError(f"v0 fora do range [{V0_MIN}, {V0_MAX}]: {v0}")
        if not (KAPPA_H_MIN <= kappa_h <= KAPPA_H_MAX):
            raise ValueError(f"kappa_h fora do range: {kappa_h}")
        if not (THETA_MIN <= theta <= THETA_MAX):
            raise ValueError(f"theta fora do range: {theta}")
        if not (NU_MIN <= nu <= NU_MAX):
            raise ValueError(f"nu fora do range: {nu}")
        if not (RHO_MIN <= rho <= RHO_MAX):
            raise ValueError(f"rho fora do range: {rho}")
        if not (H_MIN <= H <= H_MAX):
            raise ValueError(f"H fora do range: {H}")

        self.v0 = v0
        self.kappa_h = kappa_h
        self.theta = theta
        self.nu = nu
        self.rho = rho
        self.H = H

    def call_price(self, S0: float, K: float, T: float, r: float = 0.0) -> float:
        """Preco de Call Europeia."""
        return rough_heston_call_price(
            S0, K, T, r, self.v0, self.kappa_h, self.theta,
            self.nu, self.rho, self.H,
        )

    def put_price(self, S0: float, K: float, T: float, r: float = 0.0) -> float:
        """Preco de Put Europeia."""
        return rough_heston_put_price(
            S0, K, T, r, self.v0, self.kappa_h, self.theta,
            self.nu, self.rho, self.H,
        )

    def is_rough(self) -> bool:
        """Retorna True se H < 0.5 (regime rough vol)."""
        return self.H < 0.5

    def is_classical_heston(self) -> bool:
        """Retorna True se H = 0.5 e kappa_h > 0 (Heston classico)."""
        return abs(self.H - 0.5) < 1e-6 and self.kappa_h > 1e-9

    def is_rbergomi_limit(self) -> bool:
        """Retorna True se kappa_h = 0 e H < 0.5 (limite rBergomi)."""
        return self.kappa_h <= 1e-9 and self.H < 0.5

    def __repr__(self) -> str:
        return (
            f"RoughHestonModel(v0={self.v0:.4f}, kappa_h={self.kappa_h:.4f}, "
            f"theta={self.theta:.4f}, nu={self.nu:.4f}, "
            f"rho={self.rho:.4f}, H={self.H:.4f})"
        )
