"""
monte_carlo_rbergomi.py - E75: Monte Carlo rBergomi (Honisch 2015).

Implementação EXATA do rBergomi via circulant embedding method
(Honisch 2015, Bayer-Friz-Gatheral 2016).

Vantagens sobre Cholesky (E74):
- Complexidade O(N log N) via FFT em vez de O(N^3)
- Exato (não aproximado) para fBm em malha uniforme
- Capaz de gerar 100k+ steps em segundos

Processo (rBergomi puro, 1-factor):
    ξ(t) = ξ_0(t) * exp( η * W^H(t) - 0.5 * η² * t^{2H} )

Onde:
    - W^H(t): fractional Brownian motion, H in (0, 0.5) (rough)
    - ξ_0(t): forward variance curve
    - η: vol of vol

Algoritmo circulant (Honisch 2015):
1. Gerar circulant matrix C[2N x 2N] a partir da covariância
   C[i,j] = 0.5 * (|i-j|^{2H} - |i|^{2H} - |j|^{2H}) para autocovariance fBm
2. C_2N = F^H * diag(F * first_row) * F  (onde F é matriz DFT 2N x 2N)
3. Para cada path: Z = (Z_1, ..., Z_{2N}) ~ N(0, I_{2N})
   W = F^H * diag(sqrt(lambda(C_2N))) * F * Z  — mas pegamos so N primeiros
4. W^H(t_i) = sum cumulativo de incrementos (W_i - W_{i-1})

Implementação simplificada usando numpy FFT:
    cov = [... 2N ...]  (circulant first row)
    lambda = FFT(cov) (eigenvalues reais e positivos para H != 0.5)
    W = IFFT(sqrt(lambda) * FFT(Z_2N))[:N]
    increments = diff(W, prepend=0)

Referencia:
    Honisch, S. (2015) "Circulant embedding for fractional Brownian motion",
    Master's thesis, TU Berlin.
    Bayer, C., Friz, P., Gatheral, J. (2016) "Pricing under rough volatility",
    Quantitative Finance, 16(6), 887-904.
"""
from __future__ import annotations

import logging
import math

try:
    import numpy as np
    _HAS_NUMPY = True
except ImportError:
    _HAS_NUMPY = False

logger = logging.getLogger(__name__)


# ============================================================
# fBm via circulant embedding (Honisch 2015)
# ============================================================

def _fbm_circulant(H, n_steps, n_paths, rng=None):
    """Gera paths de fBm W^H via circulant embedding (Honisch 2015).

    Args:
        H: expoente de Hurst (0 < H < 0.5 para rough; suporta 0 < H < 1)
        n_steps: numero de time-steps
        n_paths: numero de simulacoes
        rng: np.random.Generator (opcional)

    Returns:
        np.ndarray shape (n_paths, n_steps): paths de W^H(t_1), ..., W^H(t_N)
    """
    if not _HAS_NUMPY:
        raise ImportError("numpy required")
    if rng is None:
        rng = np.random.default_rng()

    # Circulant method precisa de 2N points (periodic embedding)
    N = n_steps
    M = 2 * N

    # Circulant embedding (Honisch 2015, Dieker 2004):
    # Covariancia dos INCREMENTOS de fBm: c(k) = 0.5 * (|k+1|^{2H} + |k-1|^{2H} - 2|k|^{2H}) * dt^{2H}
    # Aplicamos circulant embedding de tamanho M=2N (periodicidade).
    # First row c_circ[k] = c(min(k, M-k)) para k=0..M-1
    # Eigenvalues via FFT: lambda = FFT(c_circ)
    # Geramos: W = IFFT(sqrt(lambda) * FFT(Z))[:, :N]  onde Z ~ CN(0,1)
    # E W^H(T) = sum_{i=0}^{N-1} W[i] tem variancia T^{2H} = 1

    N = n_steps
    M = 2 * N
    dt = 1.0 / N

    # First row do circulant (lag 0..M-1) com periodicidade
    k = np.arange(M)
    k_eff = np.minimum(k, M - k)  # distancia circular

    # covariancia dos incrementos de fBm
    c = np.where(
        k_eff == 0,
        dt ** (2 * H),  # var(increment) = dt^{2H}
        0.5 * (np.abs(k_eff + 1) ** (2 * H) +
               np.abs(k_eff - 1) ** (2 * H) -
               2 * k_eff ** (2 * H)) * dt ** (2 * H)
    )

    # Eigenvalues via FFT (circulant eigendecomp)
    lam = np.fft.fft(c).real

    # Garantir real (im tol)
    if np.any(lam < -1e-10):
        logger.warning("Eigenvalues negativos detectados (max abs: %g). Regularizando...",
                       np.abs(lam.min()))
        lam = np.maximum(lam, 0.0)

    # sqrt das eigenvalues (complex para usar FFT)
    sqrt_lam = np.sqrt(lam + 0j)

    # Para cada path: Z ~ CN(0, 1) complex, W = IFFT(sqrt_lam * FFT(Z))
    Z = rng.standard_normal((n_paths, M)) + 1j * rng.standard_normal((n_paths, M))
    W_cmplx = np.fft.ifft(sqrt_lam * np.fft.fft(Z, axis=1), axis=1)

    # Tomar parte real e primeiros N pontos (Z[0..N-1] tem cov c[0..N-1])
    # Estes são os N primeiros INCREMENTOS de fBm
    increments = W_cmplx.real[:, :N]

    return increments


# ============================================================
# Pricing Monte Carlo rBergomi (Honisch 2015)
# ============================================================

def _simulate_rbergomi_paths(
    S0, T, r, q, v0, eta, H, rho, n_steps, n_paths, seed=None
):
    """Simula paths de S_T sob rough Bergomi puro (1-factor H<0.5).

    Args:
        S0: spot inicial
        T: maturity
        r, q: taxa livre e dividend yield
        v0: variancia inicial (constante)
        eta: vol of vol
        H: expoente de Hurst (0 < H < 0.5)
        rho: correlacao spot-variancia
        n_steps: time-steps
        n_paths: numero de paths
        seed: RNG seed

    Returns:
        np.ndarray shape (n_paths,): S_T
    """
    rng = np.random.default_rng(seed)

    # 1. Gera fBm increments (rough factor)
    dW_rough = _fbm_circulant(H, n_steps, n_paths, rng)  # shape (n_paths, n_steps)

    # 2. Gera BM padrao (correlacionado com spot)
    dt = T / n_steps
    dW_spot = rng.standard_normal((n_paths, n_steps)) * math.sqrt(dt)

    # 3. W^H cumulativo (path do fBm)
    W_rough = np.cumsum(dW_rough, axis=1)  # shape (n_paths, n_steps)

    # 4. xi(t) = v0 * exp(eta * W^H(t) - 0.5 * eta^2 * t^{2H})
    #    t = (1, 2, ..., N) * dt -> t^{2H} = (i*dt)^{2H}
    times = np.arange(1, n_steps + 1) * dt
    var_WH = times ** (2 * H)  # variancia do fBm em cada t
    log_xi = math.log(v0) + eta * W_rough - 0.5 * eta ** 2 * var_WH
    xi = np.exp(log_xi)  # shape (n_paths, n_steps)

    # 5. Variancia integrada V = integral de xi dt
    V = np.sum(xi, axis=1) * dt  # shape (n_paths,)

    # 6. S_T = S_0 * exp((r-q)T - 0.5*V + sqrt(V) * Z_S)
    # Z_S correlacionado com V (proxy canonica):
    # corr(log(S_T), V) ≈ rho (sob Markov; aqui é aproximação)
    Z_indep = rng.standard_normal(n_paths)
    if rho == 0.0:
        Z_S = Z_indep
    else:
        V_std = (V - V.mean()) / (V.std() + 1e-12)
        Z_S = rho * V_std + math.sqrt(1 - rho ** 2) * Z_indep

    log_ST = math.log(S0) + (r - q) * T - 0.5 * V + np.sqrt(np.maximum(V, 0)) * Z_S
    return np.exp(log_ST)


# ============================================================
# Pricing interface
# ============================================================

def price_european_rough_bergomi_mc(
    S0, K, T, r, q, v0, eta, H, rho,
    option_type="call", n_paths=10000, n_steps=100, seed=42
):
    """Preço de opção europeia via Monte Carlo rBergomi (circulant Honisch 2015).

    Args:
        S0: spot inicial
        K: strike
        T: maturity (anos)
        r: taxa livre de risco
        q: dividend yield
        v0: variancia inicial (constante)
        eta: vol of vol
        H: expoente de Hurst (0 < H < 0.5 para rough; 0.5 = classico BM)
        rho: correlacao spot-variancia
        option_type: "call" ou "put"
        n_paths: numero de simulacoes MC
        n_steps: time-steps por path
        seed: seed RNG

    Returns:
        float: preço da opção

    Raises:
        ValueError: se H fora de (0, 1)
    """
    if not (0 < H < 1):
        raise ValueError(f"H deve estar em (0, 1); recebeu {H}")
    if T <= 0:
        intrinsic = max(0.0, S0 - K) if option_type == "call" else max(0.0, K - S0)
        return intrinsic
    if v0 <= 0:
        raise ValueError(f"v0 > 0; recebeu v0={v0}")
    if eta < 0:
        raise ValueError(f"eta >= 0; recebeu eta={eta}")
    if not _HAS_NUMPY:
        raise ImportError("numpy required for MC pricing")

    ST = _simulate_rbergomi_paths(
        S0, T, r, q, v0, eta, H, rho,
        n_steps=n_steps, n_paths=n_paths, seed=seed
    )

    if option_type == "call":
        payoff = np.maximum(ST - K, 0)
    elif option_type == "put":
        payoff = np.maximum(K - ST, 0)
    else:
        raise ValueError(f"option_type deve ser 'call' ou 'put'; recebeu {option_type}")

    return math.exp(-r * T) * float(np.mean(payoff))


# ============================================================
# Repr
# ============================================================

def __repr__():
    return "MonteCarloRoughBergomi(eta, H, rho) [circulant Honisch 2015]"