"""
kou.py - E72: Kou (2002) Double-Exponential Jump-Diffusion Model.

Extensão do Merton (1976) com saltos assimétricos via distribuição
double-exponential (also known as asymmetric Laplace):

    dS/S = (mu - lambda*kappa) * dt + sigma * dW + J * dN

Tamanho do salto Y tem pdf assimétrica:
    f_Y(y) = p * eta_1 * exp(-eta_1 * y)    para y >= 0   [up jumps]
    f_Y(y) = (1-p) * eta_2 * exp(eta_2 * y)  para y < 0    [down jumps]

Onde:
    - sigma: volatilidade difusiva (continua)
    - lambda: intensidade de saltos (saltos/ano)
    - p: probabilidade de up-jump (ex: 0.7 = mais rallies que crashes)
    - eta_1: taxa de decaimento para up-jumps (ex: 10 = media 10%)
    - eta_2: taxa de decaimento para down-jumps (ex: 5 = media -20%)

Premissa: para equities, crashes são mais frequentes e maiores que
rallies (assimetria). Merton (log-normal) força simetria — inadequado
para capturar eventos de cauda esquerda (Lehman 2008, COVID 2020).

Pricing (via Merton's framework + moment-matching para n saltos):

    C = SUM_{n=0}^{n_max} P(N=n) * BS(S_n, K, T, r, sigma_n)

Onde (para n saltos, double-exponential compound):
    E[Y] = p/eta_1 - (1-p)/eta_2                    [mean log-jump]
    Var[Y] = p/eta_1^2 + (1-p)/eta_2^2
              + p*(1-p)*(1/eta_1 + 1/eta_2)^2       [variance]

    log(S_n/S_0) = n * (E[Y] + Var[Y]/2)            [drift compound]
    sigma_n^2 = sigma^2 + n*Var[Y]/T                 [vol efetiva]

NOTA: Esta implementação usa moment-matching (aproximação), não a
forma fechada exata via transformada de Laplace. Aproximação é
precisa para n pequeno a moderado (até ~10 saltos). Para precisão
total, usar COS method ou Fourier inversion.

Referência:
    Kou, S.G. (2002) "A Jump-Diffusion Model for Option Pricing",
    Management Science, 48(8), 1086-1101.

Limitacoes:
    - Moment-matching em vez de transformada exata (erro <1% tipico)
    - Para n_max=50, pode ter pequena drift accumulation
    - Calibração 5D instavel (mesmo problema de Merton)
"""
from __future__ import annotations

import logging
import math
from typing import Optional, Tuple

logger = logging.getLogger(__name__)


# Limites razoaveis para os parametros
SIGMA_MIN, SIGMA_MAX = 0.001, 5.0          # vol difusiva
LAMBDA_MIN, LAMBDA_MAX = 0.0, 100.0         # intensidade
P_MIN, P_MAX = 0.0, 1.0                     # probabilidade de up-jump
ETA_1_MIN, ETA_1_MAX = 0.1, 100.0           # taxa up-jump (alta = saltos pequenos)
ETA_2_MIN, ETA_2_MAX = 0.1, 100.0           # taxa down-jump

N_MAX_DEFAULT = 50


def _norm_cdf(x: float) -> float:
    """CDF da normal padrao."""
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


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
    """Black-Scholes put price via paridade put-call classica."""
    call = _bs_call(S, K, T, r, sigma)
    put = call - S + K * math.exp(-r * T)
    return max(put, 0.0)


def kou_jump_moments(p: float, eta_1: float, eta_2: float) -> Tuple[float, float]:
    """
    Calcula E[Y] e Var[Y] para a distribuicao double-exponential de Kou.

    f_Y(y) = p*eta_1*exp(-eta_1*y)        para y >= 0
    f_Y(y) = (1-p)*eta_2*exp(eta_2*y)     para y < 0

    E[Y] = p/eta_1 - (1-p)/eta_2
    E[Y^2] = 2p/eta_1^2 + 2(1-p)/eta_2^2
    Var[Y] = E[Y^2] - E[Y]^2
    """
    if not (0 <= p <= 1):
        raise ValueError(f"p deve estar em [0,1], got {p}")
    if eta_1 <= 0 or eta_2 <= 0:
        raise ValueError(f"eta_1 e eta_2 devem ser > 0, got {eta_1}, {eta_2}")

    mu_Y = p / eta_1 - (1.0 - p) / eta_2
    # E[Y^2] (cuidado: distribuicao tem 2 caudas)
    # Para y >= 0: integral y^2 * p*eta_1*exp(-eta_1*y) dy = 2p/eta_1^2
    # Para y < 0: integral y^2 * (1-p)*eta_2*exp(eta_2*y) dy = 2(1-p)/eta_2^2
    EY2 = 2.0 * p / (eta_1 ** 2) + 2.0 * (1.0 - p) / (eta_2 ** 2)
    var_Y = EY2 - mu_Y ** 2
    return mu_Y, var_Y


def kou_call_price(
    S0: float, K: float, T: float, r: float,
    sigma: float, lam: float, p: float, eta_1: float, eta_2: float,
    n_max: int = N_MAX_DEFAULT,
) -> float:
    """
    Preco de Call Europeia no modelo Kou (2002) jump-diffusion.

    Args:
        S0: spot price
        K: strike
        T: tempo em anos
        r: taxa livre de risco
        sigma: volatilidade difusiva
        lam: intensidade de saltos
        p: probabilidade de up-jump [0, 1]
        eta_1: taxa de decaimento up-jump (media = 1/eta_1)
        eta_2: taxa de decaimento down-jump (media = -1/eta_2)
        n_max: numero maximo de saltos na serie

    Returns:
        Preco teorico da call

    Edge cases:
        - T=0: retorna max(S0 - K, 0) (intrinseco)
        - lambda=0: degenera para BS(S0, K, T, r, sigma)
        - p=0 ou p=1: saltos puramente down ou up (ainda asimmetricos)
    """
    # Validacao
    if S0 <= 0:
        raise ValueError(f"S0 deve ser > 0, got {S0}")
    if K <= 0:
        raise ValueError(f"K deve ser > 0, got {K}")
    if T < 0:
        raise ValueError(f"T deve ser >= 0, got {T}")
    if r < 0 or r > 1:
        raise ValueError(f"r fora do range razoavel [0, 1]: {r}")
    if not (SIGMA_MIN <= sigma <= SIGMA_MAX):
        raise ValueError(f"sigma fora do range: {sigma}")
    if not (LAMBDA_MIN <= lam <= LAMBDA_MAX):
        raise ValueError(f"lambda fora do range: {lam}")
    if not (P_MIN <= p <= P_MAX):
        raise ValueError(f"p fora do range [0, 1]: {p}")
    if not (ETA_1_MIN <= eta_1 <= ETA_1_MAX):
        raise ValueError(f"eta_1 fora do range: {eta_1}")
    if not (ETA_2_MIN <= eta_2 <= ETA_2_MAX):
        raise ValueError(f"eta_2 fora do range: {eta_2}")

    # Edge case: T=0
    if T == 0:
        return max(S0 - K, 0.0)

    # Edge case: lambda=0 -> BS puro
    if lam == 0:
        return _bs_call(S0, K, T, r, sigma)

    # Momentos do salto individual
    mu_Y, var_Y = kou_jump_moments(p, eta_1, eta_2)

    # Compensador de drift: kappa = E[exp(Y) - 1]
    kappa = math.exp(mu_Y + 0.5 * var_Y) - 1.0
    r_compensated = r - lam * kappa  # taxa livre de risco sob risco-neutro

    # Para n saltos, drift compound = n * (E[Y] + Var[Y]/2)
    # (compensacao do log do exp(Y) -> exp(E[Y] + Var[Y]/2))
    log_jump_compound = mu_Y + 0.5 * var_Y
    sigma_J_sq_per_n = var_Y  # adicional de vol por salto (sobre T)

    # Pre-compute
    lamT = lam * T
    exp_neg_lamT = math.exp(-lamT)
    sigma_sq = sigma * sigma

    call = 0.0
    prob_sum = 0.0

    for n in range(n_max + 1):
        # Poisson probability
        if n == 0:
            p_n = exp_neg_lamT
        else:
            log_p_n = -lamT + n * math.log(lamT) - math.lgamma(n + 1)
            p_n = math.exp(log_p_n)

        # Compound spot: S_n = S0 * exp(n * log_jump_compound)
        S_n = S0 * math.exp(n * log_jump_compound)

        # Effective vol: sigma_n^2 = sigma^2 + n * var_Y / T
        sigma_n_sq = sigma_sq + n * sigma_J_sq_per_n / T if T > 0 else sigma_sq
        sigma_n = math.sqrt(sigma_n_sq) if sigma_n_sq > 0 else sigma

        # Drift compensado: usa r - lambda*kappa no BS
        bs_price = _bs_call(S_n, K, T, r_compensated, sigma_n)

        call += p_n * bs_price
        prob_sum += p_n

        # Convergence check
        if prob_sum > 1.0 - 1e-10:
            break

    return max(call, 0.0)


def kou_put_price(
    S0: float, K: float, T: float, r: float,
    sigma: float, lam: float, p: float, eta_1: float, eta_2: float,
    n_max: int = N_MAX_DEFAULT,
) -> float:
    """
    Preco de Put Europeia no modelo Kou.

    Implementado via soma direta (mesma estrutura da call), nao via
    paridade put-call (paridade nao se aplica diretamente a modelos
    com saltos discretos).
    """
    # Validacao (delega para call)
    kou_call_price(S0, K, T, r, sigma, lam, p, eta_1, eta_2, n_max)

    # Edge cases
    if T == 0:
        return max(K - S0, 0.0)
    if lam == 0:
        return _bs_put(S0, K, T, r, sigma)

    # Drift compensado
    mu_Y, var_Y = kou_jump_moments(p, eta_1, eta_2)
    kappa = math.exp(mu_Y + 0.5 * var_Y) - 1.0
    r_compensated = r - lam * kappa

    # Termos auxiliares
    lamT = lam * T
    exp_neg_lamT = math.exp(-lamT)
    log_jump_compound = mu_Y + 0.5 * var_Y
    sigma_J_sq_per_n = var_Y
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
        sigma_n_sq = sigma_sq + n * sigma_J_sq_per_n / T if T > 0 else sigma_sq
        sigma_n = math.sqrt(sigma_n_sq) if sigma_n_sq > 0 else sigma

        bs_put = _bs_put(S_n, K, T, r_compensated, sigma_n)
        put += p_n * bs_put
        prob_sum += p_n

        if prob_sum > 1.0 - 1e-10:
            break

    return max(put, 0.0)


class KouJumpModel:
    """
    Wrapper OO para o modelo de Kou (2002) double-exponential jumps.

    Atributos:
        sigma: vol difusiva
        lam: intensidade de saltos
        p: probabilidade de up-jump
        eta_1: taxa up-jump (1/eta_1 = media do up-salto em log)
        eta_2: taxa down-jump (1/eta_2 = |media| do down-salto em log)
    """

    def __init__(
        self,
        sigma: float,
        lam: float,
        p: float,
        eta_1: float,
        eta_2: float,
    ) -> None:
        """Inicializa com parametros do modelo Kou."""
        if not (SIGMA_MIN <= sigma <= SIGMA_MAX):
            raise ValueError(f"sigma fora do range: {sigma}")
        if not (LAMBDA_MIN <= lam <= LAMBDA_MAX):
            raise ValueError(f"lambda fora do range: {lam}")
        if not (P_MIN <= p <= P_MAX):
            raise ValueError(f"p fora do range [0, 1]: {p}")
        if not (ETA_1_MIN <= eta_1 <= ETA_1_MAX):
            raise ValueError(f"eta_1 fora do range: {eta_1}")
        if not (ETA_2_MIN <= eta_2 <= ETA_2_MAX):
            raise ValueError(f"eta_2 fora do range: {eta_2}")

        self.sigma = sigma
        self.lam = lam
        self.p = p
        self.eta_1 = eta_1
        self.eta_2 = eta_2

    def call_price(self, S0: float, K: float, T: float, r: float = 0.0) -> float:
        """Preco de Call Europeia."""
        return kou_call_price(S0, K, T, r,
                              self.sigma, self.lam, self.p,
                              self.eta_1, self.eta_2)

    def put_price(self, S0: float, K: float, T: float, r: float = 0.0) -> float:
        """Preco de Put Europeia."""
        return kou_put_price(S0, K, T, r,
                             self.sigma, self.lam, self.p,
                             self.eta_1, self.eta_2)

    @property
    def mu_Y(self) -> float:
        """Media do log-jump."""
        return self.p / self.eta_1 - (1.0 - self.p) / self.eta_2

    @property
    def var_Y(self) -> float:
        """Variancia do log-jump."""
        return kou_jump_moments(self.p, self.eta_1, self.eta_2)[1]

    @property
    def kappa(self) -> float:
        """Compensador: E[exp(Y) - 1]."""
        return math.exp(self.mu_Y + 0.5 * self.var_Y) - 1.0

    @property
    def is_asymmetric(self) -> bool:
        """Retorna True se a distribuicao de saltos e assimetrica (p != 0.5 ou eta_1 != eta_2)."""
        return not (math.isclose(self.p, 0.5) and math.isclose(self.eta_1, self.eta_2))

    def calibrate(
        self,
        S0: float,
        r: float,
        market_prices: list[Tuple[float, float, float]],
        fix_p_eta: Optional[Tuple[float, float, float]] = None,  # (p, eta_1, eta_2)
    ) -> "KouJumpModel":
        """
        Calibra sigma, lambda (e opcionalmente p, eta_1, eta_2) a partir de
        precos de mercado.

        Args:
            S0: spot price
            r: taxa livre de risco
            market_prices: lista de (K, T, market_price)
            fix_p_eta: se fornecido, (p, eta_1, eta_2) sao fixados

        Returns:
            Nova instancia calibrada de KouJumpModel
        """
        if len(market_prices) < 3:
            raise ValueError("Precisa de >= 3 pontos para calibrar Kou")

        from scipy.optimize import minimize

        def _objective(params):
            if fix_p_eta is not None:
                sigma, lam = params
                p, eta_1, eta_2 = fix_p_eta
            else:
                sigma, lam, p, eta_1, eta_2 = params

            if (sigma < SIGMA_MIN or lam < LAMBDA_MIN
                    or p < P_MIN or p > P_MAX
                    or eta_1 < ETA_1_MIN or eta_2 < ETA_2_MIN):
                return 1e10

            try:
                model = KouJumpModel(sigma, lam, p, eta_1, eta_2)
                sq_err = 0.0
                for K, T, mkt_price in market_prices:
                    if T <= 0:
                        continue
                    model_price = model.call_price(S0, K, T, r)
                    sq_err += (model_price - mkt_price) ** 2
                return sq_err
            except Exception:
                return 1e10

        # Initial guess
        if fix_p_eta is not None:
            x0 = [self.sigma, self.lam]
            bounds = [(SIGMA_MIN, SIGMA_MAX), (LAMBDA_MIN, LAMBDA_MAX)]
        else:
            x0 = [self.sigma, self.lam, self.p, self.eta_1, self.eta_2]
            bounds = [
                (SIGMA_MIN, SIGMA_MAX), (LAMBDA_MIN, LAMBDA_MAX),
                (P_MIN, P_MAX), (ETA_1_MIN, ETA_1_MAX), (ETA_2_MIN, ETA_2_MAX),
            ]

        result = minimize(_objective, x0, method="L-BFGS-B", bounds=bounds,
                          options={"maxiter": 100, "ftol": 1e-8})

        if fix_p_eta is not None:
            sigma, lam = result.x
            p, eta_1, eta_2 = fix_p_eta
        else:
            sigma, lam, p, eta_1, eta_2 = result.x

        return KouJumpModel(sigma, lam, p, eta_1, eta_2)

    def __repr__(self) -> str:
        return (f"KouJumpModel(sigma={self.sigma:.4f}, lam={self.lam:.4f}, "
                f"p={self.p:.4f}, eta_1={self.eta_1:.4f}, eta_2={self.eta_2:.4f}, "
                f"asym={self.is_asymmetric})")
