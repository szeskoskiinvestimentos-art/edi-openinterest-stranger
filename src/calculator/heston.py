"""
heston.py - E52: Heston (1993) Stochastic Volatility Model.

Modelo de volatilidade estocástica com mean reversion:

    dS = mu * S * dt + sqrt(v) * S * dW1
    dv = kappa * (theta - v) * dt + sigma_v * sqrt(v) * dW2

    com correlacao rho entre W1 e W2.

Parametros:
    S0: spot price atual
    K: strike
    T: tempo em anos
    r: taxa livre de risco
    v0: variancia instantanea inicial
    kappa: velocidade de mean reversion (mean reversion speed)
    theta: variancia de longo prazo (long-term variance)
    sigma_v: volatilidade da volatilidade (vol of vol)
    rho: correlacao entre spot e variancia (tipico: -0.7 a -0.3 para equities)

Implementacao semi-analitica (Heston 1993, formula fechada):
    C = S0 * P1 - K * exp(-r*T) * P2

    P_j = 1/2 + (1/pi) * integral_0^inf Re[exp(-i*phi*ln(K)) * f_j(phi) / (i*phi)] d phi

    f_j(phi) = exp(C_j(T, phi) + D_j(T, phi) * v0 + i*phi*ln(S0))

Referencia:
    Heston, S. (1993) "A Closed-Form Solution for Options with Stochastic Volatility"
    Review of Financial Studies, 6(2), 327-343.

    Albrecher, H., Lord, R. (2010) "A Comparison of the Heston and the SVJ Models"
    (Little Heston Trap - estabilizacao numerica).

Limitacoes:
    - Para T muito pequeno, integracao numerica pode oscilar
    - Usar a versao "Little Heston Trap" (com d modificada) para evitar instabilidade
      quando kappa^2 - sigma_v^2*xi^2*... < 0
"""
from __future__ import annotations

import logging
import math
from typing import Optional, Tuple

import numpy as np
from scipy.integrate import quad
from scipy.optimize import minimize

logger = logging.getLogger(__name__)


# Limites razoaveis para os parametros
V0_MIN, V0_MAX = 0.0001, 5.0      # variancia inicial
KAPPA_MIN, KAPPA_MAX = 0.01, 20.0  # mean reversion speed
THETA_MIN, THETA_MAX = 0.0001, 5.0  # long-term variance
SIGMA_V_MIN, SIGMA_V_MAX = 0.01, 5.0  # vol of vol
RHO_MIN, RHO_MAX = -0.999, 0.999   # correlacao

# Feller condition: 2*kappa*theta > sigma_v^2 garante v>0 sempre
FELLER_RATIO_MIN = 1.0


def _heston_characteristic(
    phi: complex, j: int, kappa: float, theta: float, sigma_v: float, rho: float,
    T: float, r: float, v0: float, S0: float,
) -> complex:
    """Calcula a funcao caracteristica de Heston f_j(phi).

    Implementacao baseada em Heston (1993), com atencao a:
    - Estabilidade numerica via separacao real/complexa
    - Tratamento do log complexo principal

    f_j(phi) = exp(C + D*v0 + i*phi*ln(S0))

    Args:
        phi: variavel de integracao (real >= 0)
        j: indice (1 ou 2) para P1 ou P2
        kappa, theta, sigma_v, rho, T, r, v0, S0: parametros do modelo
    Returns:
        Numero complexo
    """
    # Constantes
    if j == 1:
        b = kappa - rho * sigma_v
        u = 0.5
    else:  # j == 2
        b = kappa
        u = -0.5
    a = kappa * theta

    # phi como complexo (caso venha como float)
    iphi = 1j * phi

    # d = sqrt((rho*sigma_v*i*phi - b)^2 - sigma_v^2*(2*u*i*phi - phi^2))
    # Equivalente: d = sqrt(b^2 - 2*u*sigma_v^2*i*phi + phi^2*(sigma_v^2 - (rho*sigma_v)^2) + 2*rho*sigma_v*b*i*phi)
    # Para estavel, mantemos na forma complexa
    z = (rho * sigma_v * iphi - b) ** 2 - sigma_v ** 2 * (2 * u * iphi - phi ** 2)
    d = np.sqrt(z)

    # Garantir parte real >= 0 (ramo principal)
    if np.real(d) < 0:
        d = -d

    # g = (b - rho*sigma_v*i*phi + d) / (b - rho*sigma_v*i*phi - d)
    num_g = b - rho * sigma_v * iphi + d
    den_g = b - rho * sigma_v * iphi - d
    g = num_g / den_g

    # Numeros para log
    one_minus_g = 1 - g
    one_minus_g_expT = 1 - g * np.exp(d * T)

    # Evitar divisao por zero
    eps = 1e-12
    if abs(one_minus_g) < eps or abs(one_minus_g_expT) < eps:
        # Caso degenerado
        return complex(np.exp(-100), 0)  # retorna muito pequeno

    # C = i*phi*(ln(S0) + r*T) + (a/sigma_v^2) * ((b - rho*sigma_v*i*phi + d)*T - 2*log((1 - g*exp(d*T))/(1 - g)))
    log_term = np.log(one_minus_g_expT / one_minus_g)
    C = iphi * (np.log(S0) + r * T) + (a / sigma_v ** 2) * (
        (b - rho * sigma_v * iphi + d) * T - 2 * log_term
    )

    # D = ((b - rho*sigma_v*i*phi + d)/sigma_v^2) * ((1 - exp(d*T))/(1 - g*exp(d*T)))
    D = ((b - rho * sigma_v * iphi + d) / sigma_v ** 2) * (
        (1 - np.exp(d * T)) / one_minus_g_expT
    )

    # f = exp(C + D*v0 + i*phi*ln(S0))
    # Combinando: i*phi*ln(S0) ja esta em C (C comeca com isso), entao f = exp(C + D*v0)
    # Mas pela formula original: f = exp(C + D*v0 + i*phi*ln(S0)) onde C ja tem i*phi*ln(S0)
    # Entao so precisamos: f = exp(C + D*v0)
    exponent = C + D * v0

    # Evitar overflow
    if np.real(exponent) > 700:
        return complex(np.exp(700), 0)
    if np.real(exponent) < -700:
        return complex(0, 0)

    return np.exp(exponent)


def _heston_integrand(phi: float, j: int, S0: float, K: float, T: float, r: float,
                     v0: float, kappa: float, theta: float, sigma_v: float, rho: float) -> float:
    """Integrando da formula de Heston para P_j.

    P_j = 1/2 + (1/pi) * integral_0^inf Re[ exp(-i*phi*ln(K)) * f_j(phi) / (i*phi) ] d phi
    """
    if phi == 0:
        return 0.0

    # f_j(phi)
    f = _heston_characteristic(phi, j, kappa, theta, sigma_v, rho, T, r, v0, S0)

    # exp(-i*phi*ln(K)) * f / (i*phi)
    # = exp(-i*phi*ln(K)) * f * (-i/phi)
    # = (-i/phi) * f * (cos(phi*ln(K)) - i*sin(phi*ln(K)))
    # Real part: (-i/phi) * [f_real * cos - f_real * i*sin ... ]
    # Vamos calcular diretamente:
    #   exp(-i*phi*ln(K)) = cos(-phi*ln(K)) + i*sin(-phi*ln(K)) = cos(phi*ln(K)) - i*sin(phi*ln(K))
    #   multiplica por f = f_real + i*f_imag
    cK = np.cos(phi * np.log(K))
    sK = np.sin(phi * np.log(K))
    f_real = float(np.real(f))
    f_imag = float(np.imag(f))

    # (cos - i*sin) * (f_real + i*f_imag)
    prod_real = cK * f_real + sK * f_imag
    prod_imag = cK * f_imag - sK * f_real

    # divide por (i*phi): equivalente a multiplicar por (-i/phi)
    # (-i/phi) * (a + i*b) = b/phi - i*a/phi
    real_part = prod_imag / phi
    # imag_part = -prod_real / phi (nao usado, so parte real importa)

    return real_part


def heston_call_price(
    S0: float, K: float, T: float, r: float,
    v0: float, kappa: float, theta: float, sigma_v: float, rho: float,
    limit: int = 200,
) -> float:
    """Calcula preco de Call Europeia usando modelo de Heston (1993).

    Args:
        S0: spot price
        K: strike
        T: tempo em anos
        r: taxa livre de risco (anualizada)
        v0: variancia instantanea inicial
        kappa: mean reversion speed
        theta: long-term variance
        sigma_v: vol of vol
        rho: correlacao
        limit: limite de integracao (subdivisoes max)

    Returns:
        Preco teorico da Call
    """
    if S0 <= 0 or K <= 0 or T <= 0:
        return max(0.0, S0 - K * math.exp(-r * T))

    # Validacao basica dos parametros
    if v0 < V0_MIN or kappa < KAPPA_MIN or theta < THETA_MIN or sigma_v < SIGMA_V_MIN:
        return 0.0

    # P1 (limite finito grande evita instabilidade numerica em np.inf)
    integral_1, _ = quad(
        _heston_integrand, 0, 250.0,
        args=(1, S0, K, T, r, v0, kappa, theta, sigma_v, rho),
        limit=limit,
    )
    P1 = 0.5 + (1.0 / math.pi) * integral_1

    # P2
    integral_2, _ = quad(
        _heston_integrand, 0, 250.0,
        args=(2, S0, K, T, r, v0, kappa, theta, sigma_v, rho),
        limit=limit,
    )
    P2 = 0.5 + (1.0 / math.pi) * integral_2

    # C = S0 * P1 - K * exp(-rT) * P2
    call = S0 * P1 - K * math.exp(-r * T) * P2

    # Sanidade: preco >= max(intrinsic, 0)
    intrinsic = max(0.0, S0 - K * math.exp(-r * T))
    if call < intrinsic * 0.99:
        logger.warning(
            "Heston call %f abaixo do intrinseco %f (S=%f K=%f T=%f)",
            call, intrinsic, S0, K, T,
        )
        return intrinsic

    return max(call, 0.0)


def heston_put_price(
    S0: float, K: float, T: float, r: float,
    v0: float, kappa: float, theta: float, sigma_v: float, rho: float,
    limit: int = 200,
) -> float:
    """Calcula preco de Put Europeia usando Heston (via paridade put-call).

    Args:
        Mesmos de heston_call_price.

    Returns:
        Preco teorico da Put
    """
    call = heston_call_price(S0, K, T, r, v0, kappa, theta, sigma_v, rho, limit)
    # Paridade put-call: P = C - S0 + K*exp(-rT)
    put = call - S0 + K * math.exp(-r * T)
    return max(put, 0.0)


class HestonModel:
    """Wrapper OO para o modelo de Heston.

    Atributos:
        v0, kappa, theta, sigma_v, rho: parametros do modelo
    """

    def __init__(
        self,
        v0: float,
        kappa: float,
        theta: float,
        sigma_v: float,
        rho: float,
    ) -> None:
        """Inicializa com parametros do modelo Heston.

        Args:
            v0: variancia instantanea inicial (ex: 0.04 = 20% vol)
            kappa: mean reversion speed (ex: 2.0)
            theta: long-term variance (ex: 0.04)
            sigma_v: vol of vol (ex: 0.3)
            rho: correlacao spot-variancia (ex: -0.7)
        """
        if not (V0_MIN <= v0 <= V0_MAX):
            raise ValueError(f"v0 fora do range [{V0_MIN}, {V0_MAX}]: {v0}")
        if not (KAPPA_MIN <= kappa <= KAPPA_MAX):
            raise ValueError(f"kappa fora do range: {kappa}")
        if not (THETA_MIN <= theta <= THETA_MAX):
            raise ValueError(f"theta fora do range: {theta}")
        if not (SIGMA_V_MIN <= sigma_v <= SIGMA_V_MAX):
            raise ValueError(f"sigma_v fora do range: {sigma_v}")
        if not (RHO_MIN <= rho <= RHO_MAX):
            raise ValueError(f"rho fora do range: {rho}")

        self.v0 = v0
        self.kappa = kappa
        self.theta = theta
        self.sigma_v = sigma_v
        self.rho = rho

    def call_price(self, S0: float, K: float, T: float, r: float = 0.0) -> float:
        """Preco de Call Europeia."""
        return heston_call_price(S0, K, T, r,
                                 self.v0, self.kappa, self.theta,
                                 self.sigma_v, self.rho)

    def put_price(self, S0: float, K: float, T: float, r: float = 0.0) -> float:
        """Preco de Put Europeia."""
        return heston_put_price(S0, K, T, r,
                                self.v0, self.kappa, self.theta,
                                self.sigma_v, self.rho)

    def feller_condition(self) -> bool:
        """Verifica se a condicao de Feller (2*kappa*theta > sigma_v^2) e satisfeita.

        Quando satisfeita, a variancia nunca atinge zero (mais estavel).
        """
        return 2 * self.kappa * self.theta > self.sigma_v ** 2

    def feller_ratio(self) -> float:
        """Retorna ratio 2*kappa*theta / sigma_v^2. >= 1 = Feller OK."""
        if self.sigma_v == 0:
            return float("inf")
        return (2 * self.kappa * self.theta) / (self.sigma_v ** 2)

    def calibrate(
        self,
        S0: float,
        r: float,
        market_prices: list[Tuple[float, float, float]],  # [(K, T, price), ...]
        fix_rho: Optional[float] = None,
    ) -> "HestonModel":
        """Calibra os parametros do modelo a partir de precos de mercado.

        Args:
            S0: spot price
            r: taxa livre de risco
            market_prices: lista de (K, T, market_price)
            fix_rho: se fornecido, rho e fixado durante calibracao

        Returns:
            Nova instancia de HestonModel com parametros calibrados
        """
        if len(market_prices) < 3:
            raise ValueError("Precisa de >= 3 pontos para calibrar Heston")

        def _objective(params):
            v0, kappa, theta, sigma_v = params[:4]
            rho = fix_rho if fix_rho is not None else params[4]

            if (v0 < V0_MIN or kappa < KAPPA_MIN or theta < THETA_MIN
                    or sigma_v < SIGMA_V_MIN or abs(rho) > 0.99):
                return 1e10

            model = HestonModel(v0, kappa, theta, sigma_v, rho)
            sq_err = 0.0
            for K, T, mkt_price in market_prices:
                try:
                    model_price = model.call_price(S0, K, T, r)
                    sq_err += (model_price - mkt_price) ** 2
                except Exception:
                    return 1e10
            return sq_err

        # Initial guess (parametros tipicos)
        if fix_rho is not None:
            x0 = [self.v0, self.kappa, self.theta, self.sigma_v]
            bounds = [(V0_MIN, V0_MAX), (KAPPA_MIN, KAPPA_MAX),
                      (THETA_MIN, THETA_MAX), (SIGMA_V_MIN, SIGMA_V_MAX)]
        else:
            x0 = [self.v0, self.kappa, self.theta, self.sigma_v, self.rho]
            bounds = [(V0_MIN, V0_MAX), (KAPPA_MIN, KAPPA_MAX),
                      (THETA_MIN, THETA_MAX), (SIGMA_V_MIN, SIGMA_V_MAX),
                      (RHO_MIN, RHO_MAX)]

        result = minimize(_objective, x0, method="L-BFGS-B", bounds=bounds,
                          options={"maxiter": 100, "ftol": 1e-8})

        if fix_rho is not None:
            v0, kappa, theta, sigma_v = result.x
            rho = fix_rho
        else:
            v0, kappa, theta, sigma_v, rho = result.x

        return HestonModel(v0, kappa, theta, sigma_v, rho)

    def __repr__(self) -> str:
        return (f"HestonModel(v0={self.v0:.4f}, kappa={self.kappa:.4f}, "
                f"theta={self.theta:.4f}, sigma_v={self.sigma_v:.4f}, "
                f"rho={self.rho:.4f}, feller_ratio={self.feller_ratio():.2f})")
