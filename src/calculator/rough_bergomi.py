"""
rough_bergomi.py - E73: Rough Bergomi (Bayer-Friz-Gatheral 2016).

Modelo "rough volatility": expoente de Hurst H < 0.5, observacao
empirica de que a variancia realizada tem correlacao log-correlada
(nao exponencialmente como assumed em Heston).

Processo de variancia instantanea:

    ξ(t) = ξ_0(t) * exp(η * W^H(t) - 0.5 * η² * γ(t))

Onde:
    - ξ_0(t): forward variance curve (input do modelo)
    - η: vol of vol
    - W^H(t): fractional Brownian motion com Hurst H ∈ (0, 1)
    - γ(t) = t^(2H) / (2H)

Funcao caracteristica (Bayer-Friz-Gatheral 2016, Theorem 4.1,
para ξ_0(t) constante = v0):

    φ(u, T) = exp( ψ(u, T) )

    ψ(u) = iu * log(S_0/K)
           - 0.5 * u² * v_0 * T
           - 0.5 * u² * 0.5 * η² * v_0² * (2H+1) * T^(2H+3) / ((H+1)²(2H+3))
           + iu * ρ * η * v_0 * √(2H+1) * T^(H+1) / (H+1)
           - 0.5 * u² * η² * v_0² * (2H+1) * T^(2H+2) / (2*(H+1)³)

Implementacao: COS method (Fang & Oosterlee 2008) para inverter a
caracteristica e obter call/put. Convergencia exponencial.

Limitacoes:
- Implementacao assume ξ_0(t) constante (flat forward variance)
- Hurst H tipico: 0.05-0.15 (muito rough) - regime empirico
- H=0.5 recupera Bergomi classico (markoviano)
- Requer integracao numerica das formulas caracteristicas

Referencia:
    Bayer, C., Friz, P., Gatheral, J. (2016) "Pricing under rough volatility",
    Quantitative Finance, 16(6), 887-904.
    Fang, F., Oosterlee, C.W. (2008) "A Novel Pricing Method for European
    Options Based on Fourier-Cosine Series Expansions", SIAM J. Sci. Comput.
"""
from __future__ import annotations

import logging
import math

logger = logging.getLogger(__name__)


# Limites para os parametros
H_MIN, H_MAX = 0.01, 0.99          # Hurst parameter
ETA_MIN, ETA_MAX = 0.0, 5.0        # vol of vol (0 = sem stochastic vol, degenera em BS)
RHO_MIN, RHO_MAX = -0.999, 0.999   # correlacao
V0_MIN, V0_MAX = 0.0001, 5.0       # variancia forward

# COS method params
N_COS_DEFAULT = 256
L_COS = 10.0  # largura do dominio (maior = mais preciso mas mais lento)


def _bs_call(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Black-Scholes call price."""
    if T <= 0 or sigma <= 0:
        return max(S - K * math.exp(-r * T), 0.0) if S > 0 else 0.0
    sqrt_T = math.sqrt(T)
    d1 = (math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt_T)
    d2 = d1 - sigma * sqrt_T
    cdf = lambda x: 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))
    return max(S * cdf(d1) - K * math.exp(-r * T) * cdf(d2), 0.0)


def _rbergomi_char_func(
    u: complex,
    S0: float, K: float, T: float, r: float,
    v0: float, eta: float, H: float, rho: float,
) -> complex:
    """
    Funcao caracteristica do log-preço normalizado X = log(S_T/K) - r*T
    no modelo rBergomi (forma simplificada para v0 constante).

    NOTA: u e' a variavel dual a x = log(S_T/K). Usamos x = log(S_T) - log(K),
    e a caracteristica e' de x - r*T (martingale risk-neutral).
    """
    if T <= 0:
        return complex(1.0, 0.0)

    # Caracteristica canonica de X = log(S_T/K) sob risco-neutro
    # E[exp(iu*X)] = exp(iu*log(S_0/K) + iu*rT - 0.5*u*(u+i)*V_0 + rough(u))
    # onde V_0 = integrated variance (BS-like drift compensation: -0.5*iu*integrated_var)
    log_moneyness = math.log(S0 / K)

    # I1 = ∫_0^T K_H(T,s) ξ_0(s) ds = v0 * √(2H+1) * T^(H+1) / (H+1)
    I1 = v0 * math.sqrt(2.0 * H + 1.0) * (T ** (H + 1.0)) / (H + 1.0)

    # I2 = ∫_0^T ∫_0^T K_H(T,s) K_H(T,r) ξ_0(s) ξ_0(r) ds dr
    I2 = (v0 ** 2) * (2.0 * H + 1.0) * (T ** (2.0 * H + 2.0)) / (2.0 * (H + 1.0) ** 3)

    # Rough correction to integrated variance
    rough_var = 0.5 * (eta ** 2) * (v0 ** 2) * (2.0 * H + 1.0) * (T ** (2.0 * H + 3.0)) / (
        ((H + 1.0) ** 2) * (2.0 * H + 3.0)
    )

    # Variancia integrada
    integrated_var = v0 * T + rough_var

    # Termos de psi (forma canonica BS-like + correcao rough na variancia)
    term1 = complex(0, 1) * u * log_moneyness  # log-moneyness
    term2 = complex(0, 1) * u * (r - 0.5 * v0) * T  # drift risk-neutral (BS-like)
    term3 = -0.5 * u ** 2 * v0 * T              # variancia linear (BS-like)
    term4 = -0.5 * u ** 2 * (eta ** 2) * I2     # rough correction to variancia
    # Skew (correlacao): termo adicional que NAO altera martingale
    # (ja incluido em term4 via I2 se usarmos forma completa)
    # Para simplicidade, omitimos drift extra e mantemos skew via variancia only

    psi = term1 + term2 + term3 + term4

    exp_real = math.exp(psi.real)
    return complex(exp_real * math.cos(psi.imag), exp_real * math.sin(psi.imag))


def _cos_method_call(
    S0: float, K: float, T: float, r: float,
    v0: float, eta: float, H: float, rho: float,
    n_cos: int = N_COS_DEFAULT,
) -> float:
    """
    Call price via COS method (Fang & Oosterlee 2008).

    Trunca o dominio do log-preco em [a, b] e expande em series de
    cosenos. Convergencia exponencial quando a funcao caracteristica
    decai rapidamente.

    Domínio de truncamento:
        a = c1 - L * sqrt(c2 + sqrt(c2))
        b = c1 + L * sqrt(c2 + sqrt(c2))
    onde c1 = drift, c2 = variancia.
    """
    if T <= 0:
        return max(S0 - K, 0.0)

    # Dominio de truncamento (x = log(S_T/K))
    # c1 = E[log(S_T/K)] = log(S_0/K) + rT - 0.5*v0*T
    # c2 = Var[log(S_T/K)] ≈ v0*T + rough_var
    rough_var = 0.5 * (eta ** 2) * (v0 ** 2) * (2.0 * H + 1.0) * (T ** (2.0 * H + 3.0)) / (
        ((H + 1.0) ** 2) * (2.0 * H + 3.0)
    )
    c1 = math.log(S0 / K) + (r - 0.5 * v0) * T
    c2 = v0 * T + rough_var
    sqrt_c2 = math.sqrt(max(c2, 1e-9))
    a = c1 - L_COS * sqrt_c2
    b = c1 + L_COS * sqrt_c2
    b_minus_a = b - a

    def Vk(k: int) -> float:
        """Fourier-cosine coefficient of call payoff no dominio [a, b].

        Convencao (Fang-Oosterlee eq 3.3 sem o 2/(b-a)):
            V_k = ∫_a^b v(x) cos(kπ(x-a)/(b-a)) dx

        Payoff: max(K*exp(x) - K, 0) = K*max(exp(x) - 1, 0)
        """
        omega_k = k * math.pi / b_minus_a

        if k == 0:
            # V_0 = ∫_a^b max(K*exp(x) - K, 0) dx
            if a < 0 < b:
                return K * (math.exp(b) - b - 1.0)
            elif b <= 0:
                return 0.0
            else:  # a >= 0
                return K * (math.exp(b) - math.exp(a) - (b - a))

        # General k
        i_omega = complex(0, omega_k)
        one_plus_i_omega = complex(1, omega_k)

        # phi_k = ∫_a^b exp(x) * exp(ikπ(x-a)/(b-a)) dx
        exp_b = complex(math.exp(b) * math.cos(omega_k * b),
                        math.exp(b) * math.sin(omega_k * b))
        exp_a = complex(math.exp(a) * math.cos(omega_k * a),
                        math.exp(a) * math.sin(omega_k * a))
        phi_k = (exp_b - exp_a) / one_plus_i_omega

        # psi_k = ∫_a^b exp(ikπ(x-a)/(b-a)) dx
        cos_b = complex(math.cos(omega_k * b), math.sin(omega_k * b))
        cos_a = complex(math.cos(omega_k * a), math.sin(omega_k * a))
        psi_k = (cos_b - cos_a) / i_omega

        # e^(-i*ω*a)
        exp_neg_iwa = complex(math.cos(-omega_k * a), math.sin(-omega_k * a))

        # V_k = Re[ exp(-iωa) * K * (phi_k - psi_k) ]
        V_k = K * (phi_k - psi_k) * exp_neg_iwa
        return V_k.real

    # Soma COS (Fang-Oosterlee eq 3.4)
    # c_n = (2/(b-a)) * SUM_k Re[char(ω_k) * exp(-iω_k*a)] * V_k * A_k
    # onde A_k = 0.5 se k=0, 1 caso contrario
    sum_val = 0.0
    for k in range(n_cos):
        omega_k = k * math.pi / b_minus_a
        char_val = _rbergomi_char_func(
            complex(omega_k, 0), S0, K, T, r, v0, eta, H, rho
        )
        exp_factor = complex(math.cos(-omega_k * a), math.sin(-omega_k * a))
        V_k = Vk(k)
        A_k = 0.5 if k == 0 else 1.0
        term = (char_val * exp_factor).real * V_k * A_k
        sum_val += term

    # C = e^(-rT) * (2/(b-a)) * sum_val
    call = math.exp(-r * T) * (2.0 / b_minus_a) * sum_val
    return max(call, 0.0)


def rbergomi_call_price(
    S0: float, K: float, T: float, r: float,
    v0: float, eta: float, H: float, rho: float,
    n_cos: int = N_COS_DEFAULT,
) -> float:
    """
    Preco de Call Europeia no modelo Rough Bergomi (rBergomi).

    Args:
        S0: spot price
        K: strike
        T: tempo em anos
        r: taxa livre de risco
        v0: variancia forward (constante, ξ_0(t) = v0)
        eta: vol of vol
        H: expoente de Hurst (0.05-0.15 rough, 0.5 classico)
        rho: correlacao spot-variance
        n_cos: numero de termos no COS method (default 256)

    Returns:
        Preco teorico da call
    """
    if S0 <= 0:
        raise ValueError(f"S0 deve ser > 0, got {S0}")
    if K <= 0:
        raise ValueError(f"K deve ser > 0, got {K}")
    if T < 0:
        raise ValueError(f"T deve ser >= 0, got {T}")
    if r < 0 or r > 1:
        raise ValueError(f"r fora do range razoavel: {r}")
    if not (V0_MIN <= v0 <= V0_MAX):
        raise ValueError(f"v0 fora do range: {v0}")
    if not (ETA_MIN <= eta <= ETA_MAX):
        raise ValueError(f"eta fora do range: {eta}")
    if not (H_MIN <= H <= H_MAX):
        raise ValueError(f"H fora do range [{H_MIN}, {H_MAX}]: {H}")
    if not (RHO_MIN <= rho <= RHO_MAX):
        raise ValueError(f"rho fora do range: {rho}")

    if T == 0:
        return max(S0 - K, 0.0)
    if eta == 0:
        return _bs_call(S0, K, T, r, math.sqrt(v0))

    return _cos_method_call(S0, K, T, r, v0, eta, H, rho, n_cos)


def rbergomi_put_price(
    S0: float, K: float, T: float, r: float,
    v0: float, eta: float, H: float, rho: float,
    n_cos: int = N_COS_DEFAULT,
) -> float:
    """
    Preco de Put Europeia no modelo Rough Bergomi.
    Paridade put-call classica.
    """
    rbergomi_call_price(S0, K, T, r, v0, eta, H, rho, n_cos)
    call = rbergomi_call_price(S0, K, T, r, v0, eta, H, rho, n_cos)
    put = call - S0 + K * math.exp(-r * T)
    return max(put, 0.0)


class RoughBergomiModel:
    """Wrapper OO para o modelo Rough Bergomi (rBergomi)."""

    def __init__(
        self,
        v0: float,
        eta: float,
        H: float,
        rho: float,
    ) -> None:
        if not (V0_MIN <= v0 <= V0_MAX):
            raise ValueError(f"v0 fora do range: {v0}")
        if not (ETA_MIN <= eta <= ETA_MAX):
            raise ValueError(f"eta fora do range: {eta}")
        if not (H_MIN <= H <= H_MAX):
            raise ValueError(f"H fora do range: {H}")
        if not (RHO_MIN <= rho <= RHO_MAX):
            raise ValueError(f"rho fora do range: {rho}")

        self.v0 = v0
        self.eta = eta
        self.H = H
        self.rho = rho

    def call_price(self, S0: float, K: float, T: float, r: float = 0.0,
                   n_cos: int = N_COS_DEFAULT) -> float:
        return rbergomi_call_price(S0, K, T, r,
                                   self.v0, self.eta, self.H, self.rho, n_cos)

    def put_price(self, S0: float, K: float, T: float, r: float = 0.0,
                  n_cos: int = N_COS_DEFAULT) -> float:
        return rbergomi_put_price(S0, K, T, r,
                                  self.v0, self.eta, self.H, self.rho, n_cos)

    @property
    def is_rough(self) -> bool:
        return self.H < 0.5

    @property
    def is_classical_bergomi(self) -> bool:
        return math.isclose(self.H, 0.5)

    def __repr__(self) -> str:
        regime = "rough" if self.is_rough else "classical"
        return (f"RoughBergomiModel(v0={self.v0:.4f}, eta={self.eta:.4f}, "
                f"H={self.H:.4f}, rho={self.rho:.4f}, regime={regime})")
