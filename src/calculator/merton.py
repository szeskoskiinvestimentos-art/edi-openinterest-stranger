"""
merton.py - E71: Merton (1976) Jump-Diffusion Model.

Modelo de Black-Scholes estendido com saltos Poissonianos:

    dS/S = (mu - lambda*kappa) * dt + sigma * dW + J * dN

Onde:
    - sigma: volatilidade difusiva (continua)
    - lambda: intensidade de saltos (saltos/ano)
    - J ~ exp(Y) - 1: tamanho do salto, com Y ~ N(mu_J, sigma_J²)
    - kappa = E[exp(Y) - 1] = exp(mu_J + sigma_J²/2) - 1
    - N: processo Poisson com intensidade lambda

Premissa teorica: mercado e incompeto — eventos discretos (earnings,
M&A, regulatory) causam saltos que nao sao capturados por difusao
continua (BS, Heston, SABR, Dupire).

Pricing formula (Merton 1976, analitica):

    C = SUM_{n=0}^{inf} [ exp(-lambda*T) * (lambda*T)^n / n! ] * BS(S_n, K, T, r, sigma_n)

Onde:
    S_n = S0 * exp(n * mu_J + n * sigma_J²/2)   [ajustado pelos saltos]
    sigma_n² = sigma² + n * sigma_J² / T        [vol efetiva com saltos]

Solucao analitica em serie infinita (converge rapidamente para n<20).

Parametros:
    S0: spot price
    K: strike
    T: tempo em anos
    r: taxa livre de risco
    sigma: volatilidade difusiva (continua)
    lambda: intensidade de saltos (ex: 1 = 1 salto/ano)
    mu_J: media do log-salto (ex: -0.05 = queda media de 5%)
    sigma_J: volatilidade do log-salto (ex: 0.15)

Referencia:
    Merton, R.C. (1976) "Option Pricing When Underlying Stock Returns
    Are Discontinuous", Journal of Financial Economics, 3, 125-144.

Limitacoes:
    - Assume saltos Poissonianos (sem clustering de volatilidade)
    - Nao captura sign switch (saltos podem ser + ou -)
    - Para eventos raros (0DTE earnings), requer lambda alto
"""
from __future__ import annotations

import logging
import math
from typing import Optional, Tuple

logger = logging.getLogger(__name__)


# Limites razoaveis para os parametros
SIGMA_MIN, SIGMA_MAX = 0.001, 5.0          # vol difusiva
LAMBDA_MIN, LAMBDA_MAX = 0.0, 100.0         # intensidade (0 = sem saltos, 100 = muito frequente)
MU_J_MIN, MU_J_MAX = -2.0, 2.0              # media do log-salto
SIGMA_J_MIN, SIGMA_J_MAX = 0.001, 3.0       # vol do log-salto

# Limite para truncamento da serie (n saltos)
N_MAX_DEFAULT = 50


def _norm_cdf(x: float) -> float:
    """CDF da normal padrao (sem dependencia de scipy)."""
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def _norm_pdf(x: float) -> float:
    """PDF da normal padrao."""
    return math.exp(-0.5 * x * x) / math.sqrt(2.0 * math.pi)


def _bs_call(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Black-Scholes call price (formula fechada)."""
    if T <= 0 or sigma <= 0:
        return max(S - K * math.exp(-r * T), 0.0) if S > 0 else 0.0
    if K <= 0:
        return S

    sqrt_T = math.sqrt(T)
    d1 = (math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt_T)
    d2 = d1 - sigma * sqrt_T

    call = S * _norm_cdf(d1) - K * math.exp(-r * T) * _norm_cdf(d2)
    return max(call, 0.0)


def _bs_put(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Black-Scholes put price via paridade put-call."""
    call = _bs_call(S, K, T, r, sigma)
    put = call - S + K * math.exp(-r * T)
    return max(put, 0.0)


def merton_call_price(
    S0: float, K: float, T: float, r: float,
    sigma: float, lam: float, mu_J: float, sigma_J: float,
    n_max: int = N_MAX_DEFAULT,
) -> float:
    """
    Preco de Call Europeia no modelo Merton jump-diffusion.

    Soma ponderada de BS calls, onde cada termo representa n saltos:
        C = SUM_{n=0}^{n_max} P(N=n) * BS(S_n, K, T, r, sigma_n)

    Args:
        S0: spot price
        K: strike
        T: tempo em anos
        r: taxa livre de risco
        sigma: volatilidade difusiva
        lam: intensidade de saltos (lambda, em saltos/ano)
        mu_J: media do log-salto (log-return medio do salto)
        sigma_J: volatilidade do log-salto
        n_max: numero maximo de termos na serie (default 50, suficiente para lambda*T < 100)

    Returns:
        Preco teorico da call

    Edge cases:
        - T=0: retorna max(S0 - K, 0) (intrinseco)
        - lambda=0: degenera para BS(S0, K, T, r, sigma)
        - S0<=0 ou K<=0 ou sigma<=0: validado
    """
    if S0 <= 0:
        raise ValueError(f"S0 deve ser > 0, got {S0}")
    if K <= 0:
        raise ValueError(f"K deve ser > 0, got {K}")
    if T < 0:
        raise ValueError(f"T deve ser >= 0, got {T}")
    if r < 0 or r > 1:
        raise ValueError(f"r fora do range razoavel [0, 1]: {r}")
    if not (SIGMA_MIN <= sigma <= SIGMA_MAX):
        raise ValueError(f"sigma fora do range [{SIGMA_MIN}, {SIGMA_MAX}]: {sigma}")
    if not (LAMBDA_MIN <= lam <= LAMBDA_MAX):
        raise ValueError(f"lambda fora do range [{LAMBDA_MIN}, {LAMBDA_MAX}]: {lam}")
    if not (MU_J_MIN <= mu_J <= MU_J_MAX):
        raise ValueError(f"mu_J fora do range: {mu_J}")
    if not (SIGMA_J_MIN <= sigma_J <= SIGMA_J_MAX):
        raise ValueError(f"sigma_J fora do range: {sigma_J}")

    # Edge case: T=0 -> intrinsic
    if T == 0:
        return max(S0 - K, 0.0)

    # Edge case: lambda=0 -> Black-Scholes puro
    if lam == 0:
        return _bs_call(S0, K, T, r, sigma)

    # Termos auxiliares (pre-computados)
    lamT = lam * T
    # Drift compensado: sob risco-neutro, mu = r - lambda*kappa
    # E[Y] = mu_J; E[exp(Y)] = exp(mu_J + sigma_J²/2) -> compensador
    # kappa = E[exp(Y) - 1] = exp(mu_J + sigma_J²/2) - 1
    kappa = math.exp(mu_J + 0.5 * sigma_J * sigma_J) - 1.0
    r_compensated = r - lam * kappa  # taxa livre de risco ajustada

    # Para cada n saltos:
    #   S_n = S0 * exp(n * (mu_J + sigma_J²/2))   [media do compound asset price]
    #   sigma_n² = sigma² + n * sigma_J² / T       [vol efetiva com componente de saltos]
    #   P(N=n) = exp(-lamT) * (lamT)^n / n!        [Poisson probability]

    log_jump_compound = mu_J + 0.5 * sigma_J * sigma_J  # log(S_n/S0) por salto
    sigma_J_sq = sigma_J * sigma_J
    sigma_sq = sigma * sigma

    # Para n=0: S_0 = S0, sigma_0 = sigma, P(N=0) = exp(-lamT)
    # Termo BS(0): drift compensado e' 0 saltos
    call = 0.0

    # Pre-compute exp(-lamT) uma vez
    exp_neg_lamT = math.exp(-lamT)

    # Probabilidade acumulada (para normalizacao se serie trunca)
    prob_sum = 0.0

    for n in range(n_max + 1):
        # Poisson probability
        if n == 0:
            p_n = exp_neg_lamT
        else:
            # Recursivo: p_n = p_{n-1} * lamT / n
            # Mas como ja estamos no loop, calcular do anterior
            # Para eficiencia: armazenar
            pass
        # Calcular Poisson prob de forma nao-recursiva (claramente)
        if n == 0:
            p_n = exp_neg_lamT
        else:
            # ln(p_n) = -lamT + n*ln(lamT) - ln(n!)
            # Para n grande, usar lgamma para estabilidade
            log_p_n = -lamT + n * math.log(lamT) - math.lgamma(n + 1)
            p_n = math.exp(log_p_n)

        # S_n e sigma_n
        S_n = S0 * math.exp(n * log_jump_compound)
        sigma_n_sq = sigma_sq + n * sigma_J_sq / T if T > 0 else sigma_sq
        sigma_n = math.sqrt(sigma_n_sq) if sigma_n_sq > 0 else sigma

        # Drift compensado: sob risco-neutro, taxa efetiva = r - lambda*kappa
        bs_price = _bs_call(S_n, K, T, r_compensated, sigma_n)

        call += p_n * bs_price
        prob_sum += p_n

        # Convergencia: se probabilidade residual < 1e-10, parar
        if prob_sum > 1.0 - 1e-10:
            break

    return max(call, 0.0)


def merton_put_price(
    S0: float, K: float, T: float, r: float,
    sigma: float, lam: float, mu_J: float, sigma_J: float,
    n_max: int = N_MAX_DEFAULT,
) -> float:
    """
    Preco de Put Europeia no modelo Merton.

    Implementado via soma direta (mesma estrutura da call), nao via
    paridade put-call (paridade nao se aplica diretamente a modelos
    com saltos discretos).

    Args:
        Mesmos de merton_call_price.

    Returns:
        Preco teorico da put
    """
    # Validacao (delega para call)
    merton_call_price(S0, K, T, r, sigma, lam, mu_J, sigma_J, n_max)

    # Drift compensado
    kappa = math.exp(mu_J + 0.5 * sigma_J * sigma_J) - 1.0
    r_compensated = r - lam * kappa

    # Edge cases
    if T == 0:
        return max(K - S0, 0.0)
    if lam == 0:
        return _bs_put(S0, K, T, r, sigma)

    # Termos auxiliares
    lamT = lam * T
    exp_neg_lamT = math.exp(-lamT)
    log_jump_compound = mu_J + 0.5 * sigma_J * sigma_J
    sigma_J_sq = sigma_J * sigma_J
    sigma_sq = sigma * sigma

    put = 0.0
    prob_sum = 0.0

    for n in range(n_max + 1):
        if n == 0:
            p_n = exp_neg_lamT
        else:
            log_p_n = -lamT + n * math.log(lamT) - math.lgamma(n + 1)
            p_n = math.exp(log_p_n)

        S_n = S0 * math.exp(n * log_jump_compound)
        sigma_n_sq = sigma_sq + n * sigma_J_sq / T if T > 0 else sigma_sq
        sigma_n = math.sqrt(sigma_n_sq) if sigma_n_sq > 0 else sigma

        bs_put = _bs_put(S_n, K, T, r_compensated, sigma_n)
        put += p_n * bs_put
        prob_sum += p_n

        if prob_sum > 1.0 - 1e-10:
            break

    return max(put, 0.0)


class MertonJumpModel:
    """
    Wrapper OO para o modelo de Merton (1976) jump-diffusion.

    Atributos:
        sigma: vol difusiva
        lam: intensidade de saltos
        mu_J: media do log-salto
        sigma_J: vol do log-salto
    """

    def __init__(
        self,
        sigma: float,
        lam: float,
        mu_J: float,
        sigma_J: float,
    ) -> None:
        """Inicializa com parametros do modelo Merton."""
        if not (SIGMA_MIN <= sigma <= SIGMA_MAX):
            raise ValueError(f"sigma fora do range [{SIGMA_MIN}, {SIGMA_MAX}]: {sigma}")
        if not (LAMBDA_MIN <= lam <= LAMBDA_MAX):
            raise ValueError(f"lambda fora do range [{LAMBDA_MIN}, {LAMBDA_MAX}]: {lam}")
        if not (MU_J_MIN <= mu_J <= MU_J_MAX):
            raise ValueError(f"mu_J fora do range [{MU_J_MIN}, {MU_J_MAX}]: {mu_J}")
        if not (SIGMA_J_MIN <= sigma_J <= SIGMA_J_MAX):
            raise ValueError(f"sigma_J fora do range [{SIGMA_J_MIN}, {SIGMA_J_MAX}]: {sigma_J}")

        self.sigma = sigma
        self.lam = lam
        self.mu_J = mu_J
        self.sigma_J = sigma_J

    def call_price(self, S0: float, K: float, T: float, r: float = 0.0) -> float:
        """Preco de Call Europeia."""
        return merton_call_price(S0, K, T, r,
                                 self.sigma, self.lam, self.mu_J, self.sigma_J)

    def put_price(self, S0: float, K: float, T: float, r: float = 0.0) -> float:
        """Preco de Put Europeia."""
        return merton_put_price(S0, K, T, r,
                                self.sigma, self.lam, self.mu_J, self.sigma_J)

    @property
    def kappa(self) -> float:
        """Compensador: E[exp(Y) - 1]. Drift adjustment = -lambda*kappa."""
        return math.exp(self.mu_J + 0.5 * self.sigma_J * self.sigma_J) - 1.0

    @property
    def expected_jumps(self) -> float:
        """Numero esperado de saltos em horizonte T."""
        return self.lam  # Por unidade de tempo

    def calibrate(
        self,
        S0: float,
        r: float,
        market_prices: list[Tuple[float, float, float]],  # [(K, T, price), ...]
        fix_mu_J: Optional[float] = None,
        fix_sigma_J: Optional[float] = None,
    ) -> "MertonJumpModel":
        """
        Calibra (sigma, lambda, mu_J, sigma_J) a partir de precos de mercado.

        Usa L-BFGS-B com perda squared error.

        Args:
            S0: spot price
            r: taxa livre de risco
            market_prices: lista de (K, T, market_price)
            fix_mu_J, fix_sigma_J: fixar parametros se fornecidos

        Returns:
            Nova instancia calibrada de MertonJumpModel
        """
        if len(market_prices) < 3:
            raise ValueError("Precisa de >= 3 pontos para calibrar Merton")

        from scipy.optimize import minimize

        def _objective(params):
            if fix_mu_J is not None and fix_sigma_J is not None:
                sigma, lam = params
                mu_J = fix_mu_J
                sigma_J = fix_sigma_J
            elif fix_mu_J is not None:
                sigma, lam, sigma_J = params
                mu_J = fix_mu_J
            elif fix_sigma_J is not None:
                sigma, lam, mu_J = params
                sigma_J = fix_sigma_J
            else:
                sigma, lam, mu_J, sigma_J = params

            if (sigma < SIGMA_MIN or lam < LAMBDA_MIN
                    or abs(mu_J) > 2.0 or sigma_J < SIGMA_J_MIN):
                return 1e10

            try:
                model = MertonJumpModel(sigma, lam, mu_J, sigma_J)
                sq_err = 0.0
                for K, T, mkt_price in market_prices:
                    if T <= 0:
                        continue
                    model_price = model.call_price(S0, K, T, r)
                    sq_err += (model_price - mkt_price) ** 2
                return sq_err
            except Exception as e:
                logger.debug("[E95] _objective failed: %s", e)
                return 1e10

        # Initial guess
        if fix_mu_J is not None and fix_sigma_J is not None:
            x0 = [self.sigma, self.lam]
            bounds = [(SIGMA_MIN, SIGMA_MAX), (LAMBDA_MIN, LAMBDA_MAX)]
        elif fix_mu_J is not None:
            x0 = [self.sigma, self.lam, self.sigma_J]
            bounds = [(SIGMA_MIN, SIGMA_MAX), (LAMBDA_MIN, LAMBDA_MAX),
                      (SIGMA_J_MIN, SIGMA_J_MAX)]
        elif fix_sigma_J is not None:
            x0 = [self.sigma, self.lam, self.mu_J]
            bounds = [(SIGMA_MIN, SIGMA_MAX), (LAMBDA_MIN, LAMBDA_MAX),
                      (MU_J_MIN, MU_J_MAX)]
        else:
            x0 = [self.sigma, self.lam, self.mu_J, self.sigma_J]
            bounds = [(SIGMA_MIN, SIGMA_MAX), (LAMBDA_MIN, LAMBDA_MAX),
                      (MU_J_MIN, MU_J_MAX), (SIGMA_J_MIN, SIGMA_J_MAX)]

        result = minimize(_objective, x0, method="L-BFGS-B", bounds=bounds,
                          options={"maxiter": 100, "ftol": 1e-8})

        if fix_mu_J is not None and fix_sigma_J is not None:
            sigma, lam = result.x
            mu_J = fix_mu_J
            sigma_J = fix_sigma_J
        elif fix_mu_J is not None:
            sigma, lam, sigma_J = result.x
            mu_J = fix_mu_J
        elif fix_sigma_J is not None:
            sigma, lam, mu_J = result.x
            sigma_J = fix_sigma_J
        else:
            sigma, lam, mu_J, sigma_J = result.x

        return MertonJumpModel(sigma, lam, mu_J, sigma_J)

    def __repr__(self) -> str:
        return (f"MertonJumpModel(sigma={self.sigma:.4f}, lam={self.lam:.4f}, "
                f"mu_J={self.mu_J:.4f}, sigma_J={self.sigma_J:.4f}, "
                f"kappa={self.kappa:.4f})")
