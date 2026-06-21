"""
bates.py - E76: Bates (1996) Stochastic Volatility with Jumps.

Combina Heston (1993) stochastic volatility + Merton (1976) Poisson jumps:

    dS/S = (r - lambda*kappa) * dt + sqrt(v) * dW1 + (exp(J) - 1) * dN
    dv    = kappa_h * (theta - v) * dt + sigma_v * sqrt(v) * dW2
    dW1 * dW2 = rho * dt

Onde:
    - v: variancia instantanea (Heston)
    - N: processo Poisson com intensidade lambda
    - J ~ N(mu_J, sigma_J^2): log-salto
    - kappa = E[exp(J) - 1] = exp(mu_J + sigma_J^2/2) - 1  (compensador)
    - kappa_h: mean reversion speed da variancia (Heston)
    - theta: long-term variance (Heston)
    - sigma_v: vol of vol (Heston)
    - rho: correlacao spot-variancia (Heston)

Pricing formula (Bates 1996, semi-analitica em serie de Poisson):

    C = SUM_{n=0}^{inf} [ exp(-lambda*T) * (lambda*T)^n / n! ]
        * C_Heston(S_n, K, T, r - lambda*kappa, v0, kappa_h, theta, sigma_v, rho)

Onde:
    S_n = S0 * exp(n * (mu_J + sigma_J^2/2))   [spot ajustado por n saltos]

Casos degenerados:
    - lambda=0  -> reduz a Heston puro
    - sigma_v=0 e kappa_h=0 -> reduz a Merton puro (com vol=sqrt(v0))

Parametros principais:
    S0: spot price
    K: strike
    T: tempo em anos
    r: taxa livre de risco
    v0: variancia instantanea inicial
    kappa_h: mean reversion speed (Heston)
    theta: long-term variance (Heston)
    sigma_v: vol of vol (Heston)
    rho: correlacao (Heston)
    lam: intensidade de saltos (saltos/ano)
    mu_J: media do log-salto
    sigma_J: volatilidade do log-salto

Referencia:
    Bates, D.S. (1996) "Jumps and Stochastic Volatility: Exchange Rate
    Processes Implicit in Deutsche Mark Options", Review of Financial
    Studies, 9(1), 69-107.

    Bakshi, G., Cao, C., Chen, Z. (1997) "Empirical Performance of
    Alternative Option Pricing Models", Journal of Finance, 52(5), 2003-2049.

Limitacoes:
    - Assume saltos Poissonianos (sem clustering temporal)
    - Strips Heston e Merton de suas hipoteses originais (e.g., Feller
      pode falhar se kappa_h^2 - sigma_v^2 < 0)
    - Truncamento da serie em n_max=50 (suficiente para lambda*T < 100)
    - Combinacao de 2 integrais numericas (Heston) por termo da serie
      pode ser lenta para T longo. Use com cuidado em calibracao.
"""
from __future__ import annotations

import logging
import math
from typing import Optional, Tuple

from src.calculator.heston import heston_call_price
from src.calculator.merton import merton_call_price

logger = logging.getLogger(__name__)


# Limites razoaveis para os parametros (Heston + Merton combinados)
# kappa_h e sigma_J podem ser 0 (caso degenerado: sem stoch vol / sem saltos)
# mas o caller deve usar os edge cases propriamente.
V0_MIN, V0_MAX = 0.0001, 5.0
KAPPA_H_MIN, KAPPA_H_MAX = 0.0, 20.0
THETA_MIN, THETA_MAX = 0.0001, 5.0
SIGMA_V_MIN, SIGMA_V_MAX = 0.0, 5.0
RHO_MIN, RHO_MAX = -0.999, 0.999

# Parametros de saltos (mesmos limites de Merton)
LAMBDA_MIN, LAMBDA_MAX = 0.0, 100.0
MU_J_MIN, MU_J_MAX = -2.0, 2.0
SIGMA_J_MIN, SIGMA_J_MAX = 0.0, 3.0

# Truncamento da serie de Poisson
N_MAX_DEFAULT = 50


def _bs_call_safe(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Black-Scholes call para caso degenerado (v constante)."""
    if T <= 0 or sigma <= 0:
        return max(S - K * math.exp(-r * T), 0.0) if S > 0 else 0.0
    if K <= 0:
        return S

    sqrt_T = math.sqrt(T)
    d1 = (math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt_T)
    d2 = d1 - sigma * sqrt_T
    return S * 0.5 * (1.0 + math.erf(d1 / math.sqrt(2.0))) - K * math.exp(-r * T) * 0.5 * (1.0 + math.erf(d2 / math.sqrt(2.0)))


def bates_call_price(
    S0: float, K: float, T: float, r: float,
    v0: float, kappa_h: float, theta: float, sigma_v: float, rho: float,
    lam: float, mu_J: float, sigma_J: float,
    n_max: int = N_MAX_DEFAULT,
) -> float:
    """
    Preco de Call Europeia no modelo de Bates (1996).

    Combina Heston (stoch vol) com Merton (jumps) via serie de Poisson.

    Args:
        S0: spot price
        K: strike
        T: tempo em anos
        r: taxa livre de risco
        v0: variancia instantanea inicial
        kappa_h: mean reversion speed (Heston)
        theta: long-term variance (Heston)
        sigma_v: vol of vol (Heston)
        rho: correlacao spot-variancia (Heston)
        lam: intensidade de saltos (lambda, saltos/ano)
        mu_J: media do log-salto
        sigma_J: volatilidade do log-salto
        n_max: numero maximo de termos na serie de Poisson

    Returns:
        Preco teorico da Call

    Raises:
        ValueError: se parametros fora dos ranges razoaveis
    """
    # Validacoes
    if S0 <= 0:
        raise ValueError(f"S0 deve ser > 0, got {S0}")
    if K <= 0:
        raise ValueError(f"K deve ser > 0, got {K}")
    if T < 0:
        raise ValueError(f"T deve ser >= 0, got {T}")
    if r < 0 or r > 1:
        raise ValueError(f"r fora do range razoavel [0, 1]: {r}")
    if not (V0_MIN <= v0 <= V0_MAX):
        raise ValueError(f"v0 fora do range [{V0_MIN}, {V0_MAX}]: {v0}")
    if not (KAPPA_H_MIN <= kappa_h <= KAPPA_H_MAX):
        raise ValueError(f"kappa_h fora do range: {kappa_h}")
    if not (THETA_MIN <= theta <= THETA_MAX):
        raise ValueError(f"theta fora do range: {theta}")
    if not (SIGMA_V_MIN <= sigma_v <= SIGMA_V_MAX):
        raise ValueError(f"sigma_v fora do range: {sigma_v}")
    if not (RHO_MIN <= rho <= RHO_MAX):
        raise ValueError(f"rho fora do range: {rho}")
    if not (LAMBDA_MIN <= lam <= LAMBDA_MAX):
        raise ValueError(f"lambda fora do range: {lam}")
    if not (MU_J_MIN <= mu_J <= MU_J_MAX):
        raise ValueError(f"mu_J fora do range: {mu_J}")
    if not (SIGMA_J_MIN <= sigma_J <= SIGMA_J_MAX):
        raise ValueError(f"sigma_J fora do range: {sigma_J}")

    # Edge case: T=0 -> intrinsic
    if T == 0:
        return max(S0 - K, 0.0)

    # Edge case: lambda=0 -> degenera para Heston puro
    if lam == 0:
        return heston_call_price(S0, K, T, r, v0, kappa_h, theta, sigma_v, rho)

    # Edge case: sem stoch vol (kappa_h=0 e sigma_v=0) -> v=v0 fixo
    # Reduz a Merton com vol=sqrt(v0)
    if kappa_h == 0 and sigma_v == 0:
        sigma = math.sqrt(v0)
        return merton_call_price(S0, K, T, r, sigma, lam, mu_J, sigma_J, n_max)

    # Caso geral: serie de Poisson com termo Heston
    # Drift compensado (Merton): sob risco-neutro, mu = r - lambda*kappa
    kappa_jump = math.exp(mu_J + 0.5 * sigma_J * sigma_J) - 1.0
    r_compensated = r - lam * kappa_jump

    # Pre-computar
    lamT = lam * T
    log_jump_compound = mu_J + 0.5 * sigma_J * sigma_J  # log(S_n/S0) por salto
    exp_neg_lamT = math.exp(-lamT)

    call = 0.0
    prob_sum = 0.0

    for n in range(n_max + 1):
        # Poisson probability P(N=n) = exp(-lamT) * (lamT)^n / n!
        if n == 0:
            p_n = exp_neg_lamT
        else:
            # Estabilidade numerica via lgamma
            log_p_n = -lamT + n * math.log(lamT) - math.lgamma(n + 1)
            p_n = math.exp(log_p_n)

        # Spot ajustado: S_n = S0 * exp(n * log_jump_compound)
        S_n = S0 * math.exp(n * log_jump_compound)

        # Heston price com drift compensado
        heston_price = heston_call_price(
            S_n, K, T, r_compensated, v0, kappa_h, theta, sigma_v, rho
        )
        # Garantir nao-negatividade (Heston pode retornar pequenos negativos
        # em regimes extremos; clipamos)
        heston_price = max(heston_price, 0.0)

        call += p_n * heston_price
        prob_sum += p_n

        # Convergencia: se cobrimos > 99.99999999% da probabilidade, parar
        if prob_sum > 1.0 - 1e-10:
            break

    # Sanidade: preco >= intrinseco (com tolerancia)
    intrinsic = max(0.0, S0 - K * math.exp(-r * T))
    if call < intrinsic * 0.99:
        logger.warning(
            "Bates call %f abaixo do intrinseco %f (S=%f K=%f T=%f)",
            call, intrinsic, S0, K, T,
        )
        return intrinsic

    return max(call, 0.0)


def bates_put_price(
    S0: float, K: float, T: float, r: float,
    v0: float, kappa_h: float, theta: float, sigma_v: float, rho: float,
    lam: float, mu_J: float, sigma_J: float,
    n_max: int = N_MAX_DEFAULT,
) -> float:
    """
    Preco de Put Europeia no modelo de Bates.

    Implementado via soma direta (mesma estrutura da call), NAO via
    paridade put-call. A paridade NAO se aplica diretamente a modelos
    com saltos discretos (vide bugfix Merton P071).

    Args:
        Mesmos de bates_call_price.

    Returns:
        Preco teorico da Put.
    """
    # Validacoes (mesmas)
    if S0 <= 0:
        raise ValueError(f"S0 deve ser > 0, got {S0}")
    if K <= 0:
        raise ValueError(f"K deve ser > 0, got {K}")
    if T < 0:
        raise ValueError(f"T deve ser >= 0, got {T}")
    if r < 0 or r > 1:
        raise ValueError(f"r fora do range razoavel [0, 1]: {r}")

    # Edge cases
    if T == 0:
        return max(K - S0, 0.0)

    if lam == 0:
        # Bates sem saltos = Heston. Put via paridade put-call (Heston puro OK)
        from src.calculator.heston import heston_put_price
        return heston_put_price(S0, K, T, r, v0, kappa_h, theta, sigma_v, rho)

    if kappa_h == 0 and sigma_v == 0:
        from src.calculator.merton import merton_put_price
        sigma = math.sqrt(v0)
        return merton_put_price(S0, K, T, r, sigma, lam, mu_J, sigma_J, n_max)

    # Drift compensado
    kappa_jump = math.exp(mu_J + 0.5 * sigma_J * sigma_J) - 1.0
    r_compensated = r - lam * kappa_jump

    lamT = lam * T
    log_jump_compound = mu_J + 0.5 * sigma_J * sigma_J
    exp_neg_lamT = math.exp(-lamT)

    put = 0.0
    prob_sum = 0.0

    for n in range(n_max + 1):
        if n == 0:
            p_n = exp_neg_lamT
        else:
            log_p_n = -lamT + n * math.log(lamT) - math.lgamma(n + 1)
            p_n = math.exp(log_p_n)

        S_n = S0 * math.exp(n * log_jump_compound)

        # Put: BS-Put direto (paridade nao aplica com saltos)
        # Usando BS para manter consistencia (Heston put via paridade)
        # Para Bates, o "Heston + jumps" nao tem paridade limpa
        # Entao calculamos via soma de BS puts com S_n
        sigma_n = math.sqrt(v0)  # v0 fixo ja que e' variancia inicial
        # NOTA: para Heston stoch vol, nao ha "BS put" direto. Aqui,
        # estamos no edge case onde kappa_h=0 e sigma_v=0 (v constante).
        # Para o caso geral, melhor calcular via put-call parity no Heston
        # de S_n (com compensacao dos saltos):
        from src.calculator.heston import heston_call_price
        heston_call_n = heston_call_price(
            S_n, K, T, r_compensated, v0, kappa_h, theta, sigma_v, rho
        )
        # Put-call parity para cada n (sob compensated drift):
        # P_n = C_n - S_n + K * exp(-r_comp * T)
        # Mas drift compensado r_comp difere de r, entao:
        # P_n = C_n - S_n + K * exp(-r_comp * T)
        put_n = heston_call_n - S_n + K * math.exp(-r_compensated * T)
        put_n = max(put_n, 0.0)

        put += p_n * put_n
        prob_sum += p_n

        if prob_sum > 1.0 - 1e-10:
            break

    intrinsic = max(0.0, K - S0 * math.exp(-r * T))
    if put < intrinsic * 0.99:
        logger.warning(
            "Bates put %f abaixo do intrinseco %f (S=%f K=%f T=%f)",
            put, intrinsic, S0, K, T,
        )
        return intrinsic

    return max(put, 0.0)


class BatesModel:
    """Wrapper OO para o modelo de Bates (1996).

    Atributos:
        v0, kappa_h, theta, sigma_v, rho: parametros Heston (stoch vol)
        lam, mu_J, sigma_J: parametros Merton (jumps)
    """

    def __init__(
        self,
        v0: float,
        kappa_h: float,
        theta: float,
        sigma_v: float,
        rho: float,
        lam: float,
        mu_J: float,
        sigma_J: float,
    ) -> None:
        """Inicializa com parametros do modelo Bates.

        Args:
            v0: variancia instantanea inicial (ex: 0.04 = 20% vol)
            kappa_h: mean reversion speed (ex: 2.0)
            theta: long-term variance (ex: 0.04)
            sigma_v: vol of vol (ex: 0.3)
            rho: correlacao spot-variancia (ex: -0.7)
            lam: intensidade de saltos (ex: 1.0 = 1 salto/ano)
            mu_J: media do log-salto (ex: -0.05)
            sigma_J: volatilidade do log-salto (ex: 0.15)
        """
        if not (V0_MIN <= v0 <= V0_MAX):
            raise ValueError(f"v0 fora do range [{V0_MIN}, {V0_MAX}]: {v0}")
        if not (KAPPA_H_MIN <= kappa_h <= KAPPA_H_MAX):
            raise ValueError(f"kappa_h fora do range: {kappa_h}")
        if not (THETA_MIN <= theta <= THETA_MAX):
            raise ValueError(f"theta fora do range: {theta}")
        if not (SIGMA_V_MIN <= sigma_v <= SIGMA_V_MAX):
            raise ValueError(f"sigma_v fora do range: {sigma_v}")
        if not (RHO_MIN <= rho <= RHO_MAX):
            raise ValueError(f"rho fora do range: {rho}")
        if not (LAMBDA_MIN <= lam <= LAMBDA_MAX):
            raise ValueError(f"lam fora do range: {lam}")
        if not (MU_J_MIN <= mu_J <= MU_J_MAX):
            raise ValueError(f"mu_J fora do range: {mu_J}")
        if not (SIGMA_J_MIN <= sigma_J <= SIGMA_J_MAX):
            raise ValueError(f"sigma_J fora do range: {sigma_J}")

        self.v0 = v0
        self.kappa_h = kappa_h
        self.theta = theta
        self.sigma_v = sigma_v
        self.rho = rho
        self.lam = lam
        self.mu_J = mu_J
        self.sigma_J = sigma_J

    def call_price(self, S0: float, K: float, T: float, r: float = 0.0) -> float:
        """Preco de Call Europeia."""
        return bates_call_price(
            S0, K, T, r,
            self.v0, self.kappa_h, self.theta, self.sigma_v, self.rho,
            self.lam, self.mu_J, self.sigma_J,
        )

    def put_price(self, S0: float, K: float, T: float, r: float = 0.0) -> float:
        """Preco de Put Europeia."""
        return bates_put_price(
            S0, K, T, r,
            self.v0, self.kappa_h, self.theta, self.sigma_v, self.rho,
            self.lam, self.mu_J, self.sigma_J,
        )

    def feller_ratio(self) -> float:
        """Retorna ratio 2*kappa_h*theta / sigma_v^2 (Feller condition).

        Quando >= 1, a variancia nunca atinge zero no Heston subjacente.
        Importante para estabilidade numerica.
        """
        if self.sigma_v == 0:
            return float("inf")
        return (2 * self.kappa_h * self.theta) / (self.sigma_v ** 2)

    def jump_compensator(self) -> float:
        """Retorna kappa = E[exp(J) - 1] = exp(mu_J + sigma_J^2/2) - 1.

        E o drift compensado sob risco-neutro (subtraido de r).
        """
        return math.exp(self.mu_J + 0.5 * self.sigma_J ** 2) - 1.0

    def __repr__(self) -> str:
        return (
            f"BatesModel(v0={self.v0:.4f}, kappa_h={self.kappa_h:.4f}, "
            f"theta={self.theta:.4f}, sigma_v={self.sigma_v:.4f}, "
            f"rho={self.rho:.4f}, lam={self.lam:.4f}, "
            f"mu_J={self.mu_J:.4f}, sigma_J={self.sigma_J:.4f}, "
            f"feller={self.feller_ratio():.2f})"
        )
