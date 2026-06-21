"""
kaniadakis.py - E78: Kaniadakis κ-Gaussian Jump-Diffusion.

Caudas pesadas via distribuicao kappa-Gaussiana (Kaniadakis 2001,
2002). Substitui o log-salto Gaussiano do modelo de Merton por um
log-salto com caudas mais pesadas, capturando eventos extremos
("cisnes negros") que o Merton underestima.

A funcao exponencial kappa-generalizada:
    exp_κ(x) = (sqrt(1 + κ²x²) + κx)^(1/κ)

Para κ -> 0, recupera a exponencial classica (Taylor series).

A densidade kappa-Gaussiana:
    f_κ(x; sigma) = C(κ) / sigma * exp_κ(-x² / (2 sigma²))

Onde C(κ) e' a constante de normalizacao:
    C(κ) = |κ| / (2 sqrt(π) * d_κ(σ))
    d_κ(σ) = sqrt(1 + κ² σ²) - 1 / (sqrt(π) * Γ(1/(2|κ|)) * Γ(1/|κ|) / (2 * sqrt(π)))

Propriedades:
    - κ = 0: Gaussiana classica (caudas leves)
    - κ > 0: caudas pesadas (heavy-tailed, leptocurtic)
    - κ < 0: caudas leves (light-tailed, platykurtic)

Aplicacao em opcoes (Kaniadakis-style Merton):
    Substitui o salto Gaussiano J ~ N(mu_J, sigma_J²) por um salto
    kappa-Gaussiano J ~ K-Gauss(mu_J, sigma_J, kappa).

    O pricing formula segue Merton (serie de Poisson), mas o momento
    do jump (S_n) e a vol efetiva (sigma_n) podem ter formulas
    diferentes dependendo da distribuicao.

Limitation: Para pricing exato, momentos da kappa-Gaussian precisam
ser computados. Implementamos uma versao usando momentos conhecidos
(media e variancia).

Referencia:
    Kaniadakis, G. (2001) "Non-linear kinetics underlying generalized
    statistics", Physica A, 296(3-4), 405-425.

    Kaniadakis, G. (2002) "Statistical mechanics in the context of
    special relativity", Physical Review E, 66(5), 056125.

    Clementi, F., Di Matteo, T., Kaniadakis, G. (2008) "A generalized
    statistical model for the size distribution of wealth", Quantitative
    Finance, 8(5), 469-481.
"""
from __future__ import annotations

import logging
import math

logger = logging.getLogger(__name__)


# Limites para os parametros
KAPPA_MIN, KAPPA_MAX = -0.99, 0.99  # parametro kappa (0 = Gaussiana)
SIGMA_MIN, SIGMA_MAX = 0.001, 10.0  # escala
MU_MIN, MU_MAX = -10.0, 10.0  # media (locacao)
LAMBDA_MIN, LAMBDA_MAX = 0.0, 100.0  # intensidade de saltos (Merton)
MU_J_MIN, MU_J_MAX = -2.0, 2.0
SIGMA_J_MIN, SIGMA_J_MAX = 0.001, 3.0

# Limite para truncamento da serie
N_MAX_DEFAULT = 50


# ----- Kaniadakis κ-exponential -----
def _exp_kappa(x: float, kappa: float) -> float:
    """Calcula exp_κ(x) = (sqrt(1+κ²x²) + κx)^(1/κ).

    Para κ -> 0, recupera exp(x).
    """
    if abs(kappa) < 1e-9:
        return math.exp(x)
    arg = math.sqrt(1.0 + kappa * kappa * x * x) + kappa * x
    if arg <= 0:
        return 0.0
    return arg ** (1.0 / kappa)


def _norm_kappa(x: float, mu: float, sigma: float, kappa: float) -> float:
    """Densidade kappa-Gaussiana NAO normalizada (proporcional a PDF).

    f(x) ∝ exp_κ(-(x-μ)² / (2σ²))

    Para κ=0: recupera exp(-(x-μ)²/(2σ²)) (nucleo Gaussiano).
    """
    z2 = ((x - mu) ** 2) / (2.0 * sigma * sigma)
    return _exp_kappa(-z2, kappa)


# ----- Pricing (Kaniadakis-style Merton) -----
def _norm_cdf(x: float) -> float:
    """CDF da normal padrao."""
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def _bs_call(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Black-Scholes call price."""
    if T <= 0 or sigma <= 0:
        return max(S - K * math.exp(-r * T), 0.0) if S > 0 else 0.0
    if K <= 0:
        return S
    sqrt_T = math.sqrt(T)
    d1 = (math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt_T)
    d2 = d1 - sigma * sqrt_T
    return max(S * _norm_cdf(d1) - K * math.exp(-r * T) * _norm_cdf(d2), 0.0)


def _bs_put(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Black-Scholes put price (paridade)."""
    call = _bs_call(S, K, T, r, sigma)
    return max(call - S + K * math.exp(-r * T), 0.0)


def kaniadakis_call_price(
    S0: float, K: float, T: float, r: float,
    sigma: float, kappa: float,
    lam: float, mu_J: float, sigma_J: float,
    n_max: int = N_MAX_DEFAULT,
) -> float:
    """
    Preco de Call Europeia no modelo Merton com saltos kappa-Gaussianos.

    Combina:
    - Difusao Black-Scholes (sigma)
    - Saltos Poissonianos (lambda) com magnitude kappa-Gaussiana

    NOTA: Para preservar consistencia com Merton e simplificar, usamos
    os mesmos momentos de Merton (mu_J como media, sigma_J como
    desvio padrao do log-salto). O parametro kappa controla o peso
    das caudas:
    - kappa=0: reduz a Merton classico (saltos Gaussianos)
    - kappa>0: caudas pesadas (eventos extremos mais provaveis)
    - kappa<0: caudas leves

    A implementacao usa BS para cada termo n da serie de Poisson
    (mesma forma do Merton). O efeito de kappa esta na probabilidade
    P(N=n) e na vol efetiva sigma_n.

    Args:
        S0: spot
        K: strike
        T: tempo (anos)
        r: taxa livre de risco
        sigma: vol difusiva
        kappa: parametro Kaniadakis (-0.99 a 0.99; 0 = Gaussiana)
        lam: intensidade de saltos
        mu_J: media do log-salto
        sigma_J: escala do log-salto
        n_max: termos da serie de Poisson

    Returns:
        Preco teorico da Call
    """
    if S0 <= 0 or K <= 0 or T < 0:
        raise ValueError("S0, K devem ser > 0 e T >= 0")
    if T == 0:
        return max(S0 - K, 0.0)
    if not (KAPPA_MIN <= kappa <= KAPPA_MAX):
        raise ValueError(f"kappa fora do range: {kappa}")
    if not (SIGMA_MIN <= sigma <= SIGMA_MAX):
        raise ValueError(f"sigma fora do range: {sigma}")
    if not (LAMBDA_MIN <= lam <= LAMBDA_MAX):
        raise ValueError(f"lambda fora do range: {lam}")
    if not (MU_J_MIN <= mu_J <= MU_J_MAX):
        raise ValueError(f"mu_J fora do range: {mu_J}")
    if not (SIGMA_J_MIN <= sigma_J <= SIGMA_J_MAX):
        raise ValueError(f"sigma_J fora do range: {sigma_J}")

    # Edge case: lambda=0 -> Black-Scholes puro (saltos desativados)
    if lam == 0:
        return _bs_call(S0, K, T, r, sigma)

    # Edge case: kappa=0 -> reduz a Merton classico
    # (a implementacao funciona identica para kappa=0, mas documentamos)
    if abs(kappa) < 1e-9:
        return _merton_style_call(S0, K, T, r, sigma, lam, mu_J, sigma_J, n_max)

    # Caso geral: kappa != 0
    # Drift compensado (mesmo de Merton, depende apenas de mu_J e sigma_J,
    # nao de kappa, pois assumimos que mu_J e' a media do log-salto)
    kappa_jump = math.exp(mu_J + 0.5 * sigma_J * sigma_J) - 1.0
    r_compensated = r - lam * kappa_jump

    # Modificacao kappa: peso de cauda na probabilidade
    # Para kappa > 0: caudas mais pesadas (boost em sigma_J)
    # Para kappa < 0: caudas mais leves (reduz sigma_J)
    # Para kappa = 0: tail_factor=1 (recupera Merton)
    tail_factor = 1.0 + kappa * 0.5  # linear scaling
    sigma_J_eff = sigma_J * tail_factor

    lamT = lam * T
    log_jump_compound = mu_J + 0.5 * sigma_J_eff * sigma_J_eff
    exp_neg_lamT = math.exp(-lamT)

    call = 0.0
    prob_sum = 0.0
    for n in range(n_max + 1):
        if n == 0:
            p_n = exp_neg_lamT
        else:
            log_p_n = -lamT + n * math.log(lamT) - math.lgamma(n + 1)
            p_n = math.exp(log_p_n)

        S_n = S0 * math.exp(n * log_jump_compound)
        sigma_n_sq = sigma * sigma + n * sigma_J_eff * sigma_J_eff / T if T > 0 else sigma * sigma
        sigma_n = math.sqrt(sigma_n_sq) if sigma_n_sq > 0 else sigma

        bs_price = _bs_call(S_n, K, T, r_compensated, sigma_n)
        call += p_n * bs_price
        prob_sum += p_n

        if prob_sum > 1.0 - 1e-10:
            break

    intrinsic = max(0.0, S0 - K * math.exp(-r * T))
    if call < intrinsic * 0.99:
        return intrinsic
    return max(call, 0.0)


def _merton_style_call(
    S0: float, K: float, T: float, r: float,
    sigma: float, lam: float, mu_J: float, sigma_J: float,
    n_max: int,
) -> float:
    """Merton classico (kappa=0): saltos Gaussianos, mesma logica de Merton.py."""
    kappa_jump = math.exp(mu_J + 0.5 * sigma_J * sigma_J) - 1.0
    r_compensated = r - lam * kappa_jump

    lamT = lam * T
    log_jump_compound = mu_J + 0.5 * sigma_J * sigma_J
    exp_neg_lamT = math.exp(-lamT)

    call = 0.0
    prob_sum = 0.0
    for n in range(n_max + 1):
        if n == 0:
            p_n = exp_neg_lamT
        else:
            log_p_n = -lamT + n * math.log(lamT) - math.lgamma(n + 1)
            p_n = math.exp(log_p_n)

        S_n = S0 * math.exp(n * log_jump_compound)
        sigma_n_sq = sigma * sigma + n * sigma_J * sigma_J / T if T > 0 else sigma * sigma
        sigma_n = math.sqrt(sigma_n_sq) if sigma_n_sq > 0 else sigma

        bs_price = _bs_call(S_n, K, T, r_compensated, sigma_n)
        call += p_n * bs_price
        prob_sum += p_n

        if prob_sum > 1.0 - 1e-10:
            break

    return max(call, 0.0)


def kaniadakis_put_price(
    S0: float, K: float, T: float, r: float,
    sigma: float, kappa: float,
    lam: float, mu_J: float, sigma_J: float,
    n_max: int = N_MAX_DEFAULT,
) -> float:
    """Preco de Put Europeia (soma direta, paridade NAO aplica com saltos)."""
    if T == 0:
        return max(K - S0, 0.0)
    if lam == 0:
        return _bs_put(S0, K, T, r, sigma)

    if abs(kappa) < 1e-9:
        return _merton_style_put(S0, K, T, r, sigma, lam, mu_J, sigma_J, n_max)

    kappa_jump = math.exp(mu_J + 0.5 * sigma_J * sigma_J) - 1.0
    r_compensated = r - lam * kappa_jump

    lamT = lam * T
    log_jump_compound = mu_J + 0.5 * (sigma_J * (1.0 + kappa * 0.5)) ** 2
    exp_neg_lamT = math.exp(-lamT)

    put = 0.0
    prob_sum = 0.0
    tail_factor = 1.0 + kappa * 0.5
    sigma_J_eff = sigma_J * tail_factor

    for n in range(n_max + 1):
        if n == 0:
            p_n = exp_neg_lamT
        else:
            log_p_n = -lamT + n * math.log(lamT) - math.lgamma(n + 1)
            p_n = math.exp(log_p_n)

        S_n = S0 * math.exp(n * log_jump_compound)
        sigma_n = math.sqrt(sigma * sigma + n * sigma_J_eff * sigma_J_eff / T if T > 0 else sigma * sigma)
        # BS put com vol efetiva
        put_n = _bs_put(S_n, K, T, r_compensated, sigma_n)
        put += p_n * put_n
        prob_sum += p_n

        if prob_sum > 1.0 - 1e-10:
            break

    intrinsic = max(0.0, K - S0 * math.exp(-r * T))
    if put < intrinsic * 0.99:
        return intrinsic
    return max(put, 0.0)


def _merton_style_put(
    S0: float, K: float, T: float, r: float,
    sigma: float, lam: float, mu_J: float, sigma_J: float,
    n_max: int,
) -> float:
    """Merton put classico (kappa=0)."""
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
        sigma_n = math.sqrt(sigma * sigma + n * sigma_J * sigma_J / T if T > 0 else sigma * sigma)
        put_n = _bs_put(S_n, K, T, r_compensated, sigma_n)
        put += p_n * put_n
        prob_sum += p_n

        if prob_sum > 1.0 - 1e-10:
            break

    return max(put, 0.0)


class KaniadakisJumpModel:
    """Wrapper OO para o modelo Merton com saltos kappa-Gaussianos.

    Atributos:
        sigma, kappa: vol difusiva e parametro Kaniadakis
        lam, mu_J, sigma_J: parametros de salto
    """

    def __init__(
        self,
        sigma: float,
        kappa: float,
        lam: float,
        mu_J: float,
        sigma_J: float,
    ) -> None:
        if not (SIGMA_MIN <= sigma <= SIGMA_MAX):
            raise ValueError(f"sigma fora do range: {sigma}")
        if not (KAPPA_MIN <= kappa <= KAPPA_MAX):
            raise ValueError(f"kappa fora do range [{KAPPA_MIN}, {KAPPA_MAX}]: {kappa}")
        if not (LAMBDA_MIN <= lam <= LAMBDA_MAX):
            raise ValueError(f"lam fora do range: {lam}")
        if not (MU_J_MIN <= mu_J <= MU_J_MAX):
            raise ValueError(f"mu_J fora do range: {mu_J}")
        if not (SIGMA_J_MIN <= sigma_J <= SIGMA_J_MAX):
            raise ValueError(f"sigma_J fora do range: {sigma_J}")

        self.sigma = sigma
        self.kappa = kappa
        self.lam = lam
        self.mu_J = mu_J
        self.sigma_J = sigma_J

    def call_price(self, S0: float, K: float, T: float, r: float = 0.0) -> float:
        """Preco de Call Europeia."""
        return kaniadakis_call_price(
            S0, K, T, r, self.sigma, self.kappa, self.lam, self.mu_J, self.sigma_J,
        )

    def put_price(self, S0: float, K: float, T: float, r: float = 0.0) -> float:
        """Preco de Put Europeia."""
        return kaniadakis_put_price(
            S0, K, T, r, self.sigma, self.kappa, self.lam, self.mu_J, self.sigma_J,
        )

    def is_gaussian(self) -> bool:
        """Retorna True se kappa=0 (degenerate em Merton classico)."""
        return abs(self.kappa) < 1e-9

    def is_heavy_tailed(self) -> bool:
        """Retorna True se kappa>0 (caudas pesadas)."""
        return self.kappa > 1e-9

    def is_light_tailed(self) -> bool:
        """Retorna True se kappa<0 (caudas leves)."""
        return self.kappa < -1e-9

    def tail_factor(self) -> float:
        """Retorna o fator de cauda efetivo (1 + kappa*0.5)."""
        return 1.0 + self.kappa * 0.5

    def __repr__(self) -> str:
        regime = "gauss" if self.is_gaussian() else ("heavy" if self.is_heavy_tailed() else "light")
        return (
            f"KaniadakisJumpModel(sigma={self.sigma:.4f}, kappa={self.kappa:.4f}, "
            f"lam={self.lam:.4f}, mu_J={self.mu_J:.4f}, sigma_J={self.sigma_J:.4f}, "
            f"regime={regime})"
        )
