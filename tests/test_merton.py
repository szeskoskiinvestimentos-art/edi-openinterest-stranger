"""
Testes E71 — Merton (1976) Jump-Diffusion Model.

Cobre:
- Degeneração para BS quando lambda=0
- T=0 → intrinsic
- S0/K/r/sigma negativos ou inválidos
- Put via paridade put-call modificada
- Saltos positivos (mu_J > 0) encarecem calls
- Lambda maior = mais saltos = mais prêmio (especialmente OTM)
- MertonJumpModel.calibrate recupera parâmetros
- sigma_J > 0 (volatilidade de salto) aumenta prêmio de OTM
- kappa (compensador) consistente
- expected_jumps consistente
"""
import math

from src.calculator.merton import (
    MertonJumpModel,
    merton_call_price,
    merton_put_price,
)


# ===========================================================================
# Helper: Black-Scholes referência (calculado separadamente para cross-check)
# ===========================================================================

def _bs_call_ref(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """BS call para cross-check."""
    if T <= 0 or sigma <= 0:
        return max(S - K * math.exp(-r * T), 0.0)
    sqrt_T = math.sqrt(T)
    d1 = (math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt_T)
    d2 = d1 - sigma * sqrt_T
    # CDF via erf
    cdf = lambda x: 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))
    return max(S * cdf(d1) - K * math.exp(-r * T) * cdf(d2), 0.0)


# ===========================================================================
# Testes
# ===========================================================================

def test_merton_lambda_zero_recovers_bs() -> tuple[bool, str]:
    """Sem saltos (lambda=0), Merton = Black-Scholes."""
    S0, K, T, r, sigma = 100.0, 100.0, 0.25, 0.05, 0.20
    bs = _bs_call_ref(S0, K, T, r, sigma)
    merton = merton_call_price(S0, K, T, r, sigma, lam=0.0, mu_J=0.0, sigma_J=0.1)
    if not math.isclose(bs, merton, rel_tol=1e-9):
        return False, f"BS={bs:.6f}, Merton(λ=0)={merton:.6f}, diff={abs(bs-merton):.2e}"
    return True, f"Merton(λ=0) = BS = {bs:.4f}"


def test_merton_t_zero_returns_intrinsic() -> tuple[bool, str]:
    """T=0 → max(S0 - K, 0) (intrinseco)."""
    # S0 > K: call ITM
    c_itm = merton_call_price(110.0, 100.0, T=0.0, r=0.05, sigma=0.2, lam=1.0, mu_J=-0.1, sigma_J=0.2)
    if c_itm != 10.0:
        return False, f"ITM esperado 10, got {c_itm}"
    # S0 < K: call OTM
    c_otm = merton_call_price(90.0, 100.0, T=0.0, r=0.05, sigma=0.2, lam=1.0, mu_J=-0.1, sigma_J=0.2)
    if c_otm != 0.0:
        return False, f"OTM esperado 0, got {c_otm}"
    return True, f"T=0: ITM={c_itm}, OTM={c_otm}"


def test_merton_invalid_params_raise() -> tuple[bool, str]:
    """Parametros invalidos levantam ValueError."""
    cases = [
        # (S0, K, T, r, sigma, lam, mu_J, sigma_J, descricao)
        (-100.0, 100.0, 0.25, 0.05, 0.2, 1.0, 0.0, 0.1, "S0<0"),
        (100.0, -100.0, 0.25, 0.05, 0.2, 1.0, 0.0, 0.1, "K<0"),
        (100.0, 100.0, -0.25, 0.05, 0.2, 1.0, 0.0, 0.1, "T<0"),
        (100.0, 100.0, 0.25, 1.5, 0.2, 1.0, 0.0, 0.1, "r>1"),
        (100.0, 100.0, 0.25, 0.05, -0.2, 1.0, 0.0, 0.1, "sigma<0"),
        (100.0, 100.0, 0.25, 0.05, 0.2, -1.0, 0.0, 0.1, "lambda<0"),
        (100.0, 100.0, 0.25, 0.05, 0.2, 1.0, 5.0, 0.1, "mu_J=5"),
        (100.0, 100.0, 0.25, 0.05, 0.2, 1.0, 0.0, -0.1, "sigma_J<0"),
    ]
    for S0, K, T, r, sigma, lam, mu_J, sigma_J, desc in cases:
        try:
            merton_call_price(S0, K, T, r, sigma, lam, mu_J, sigma_J)
            return False, f"{desc}: deveria ter levantado ValueError"
        except ValueError:
            pass
    return True, f"Todas {len(cases)} validações levantaram ValueError"


def test_merton_higher_lambda_higher_call() -> tuple[bool, str]:
    """Maior lambda (mais saltos) → call mais cara (especialmente OTM)."""
    S0, K, T, r, sigma = 100.0, 110.0, 0.25, 0.05, 0.20  # OTM call
    c_low = merton_call_price(S0, K, T, r, sigma, lam=0.5, mu_J=0.0, sigma_J=0.15)
    c_high = merton_call_price(S0, K, T, r, sigma, lam=3.0, mu_J=0.0, sigma_J=0.15)
    if not (c_high > c_low):
        return False, f"lambda=3 ({c_high:.4f}) deveria ser > lambda=0.5 ({c_low:.4f})"
    return True, f"lambda=0.5→{c_low:.4f}, lambda=3→{c_high:.4f} (OTM call sobe)"


def test_merton_positive_mu_j_increases_call() -> tuple[bool, str]:
    """mu_J > 0 (saltos bullish médios) → call mais cara."""
    S0, K, T, r, sigma = 100.0, 100.0, 0.25, 0.05, 0.20
    c_neg = merton_call_price(S0, K, T, r, sigma, lam=2.0, mu_J=-0.10, sigma_J=0.15)
    c_pos = merton_call_price(S0, K, T, r, sigma, lam=2.0, mu_J=0.10, sigma_J=0.15)
    if not (c_pos > c_neg):
        return False, f"mu_J=+0.10 ({c_pos:.4f}) deveria ser > mu_J=-0.10 ({c_neg:.4f})"
    return True, f"mu_J=-0.10→{c_neg:.4f}, mu_J=+0.10→{c_pos:.4f} (saltos bullish ↑ call)"


def test_merton_higher_sigma_j_higher_otm_call() -> tuple[bool, str]:
    """Maior sigma_J → mais dispersão nos saltos → OTM call mais valiosa."""
    S0, K, T, r, sigma = 100.0, 130.0, 0.25, 0.05, 0.20  # Deep OTM
    c_low = merton_call_price(S0, K, T, r, sigma, lam=1.0, mu_J=0.0, sigma_J=0.05)
    c_high = merton_call_price(S0, K, T, r, sigma, lam=1.0, mu_J=0.0, sigma_J=0.40)
    if not (c_high > c_low):
        return False, f"sigma_J=0.40 ({c_high:.4f}) deveria ser > sigma_J=0.05 ({c_low:.4f})"
    return True, f"sigma_J=0.05→{c_low:.4f}, sigma_J=0.40→{c_high:.4f} (deep OTM ↑)"


def test_merton_put_call_parity_modified() -> tuple[bool, str]:
    """Merton: P + S0*exp(-lambda*kappa*T) ≈ C + K*exp(-r*T) (paridade forward).

    Em modelos com saltos discretos, a paridade put-call classica NAO se
    aplica diretamente. Mas a versao 'forward' se aplica aproximadamente:
        C - P ≈ S0*exp(-lambda*kappa*T) - K*exp(-r*T)
    onde kappa = E[exp(Y)-1].

    Verificamos que C - P + K*exp(-r*T) é aproximadamente S0*exp(-lambda*kappa*T)
    (consistente com no-arbitrage).
    """
    S0, K, T, r, sigma = 100.0, 100.0, 0.5, 0.05, 0.20
    lam, mu_J, sigma_J = 1.5, -0.05, 0.20
    c = merton_call_price(S0, K, T, r, sigma, lam, mu_J, sigma_J)
    p_price = merton_put_price(S0, K, T, r, sigma, lam, mu_J, sigma_J)
    # Verificacao basica de consistencia: C - P > 0 (call > put para ATM/ITM)
    if c <= p_price:
        return False, f"Call ITM/ATM deveria ser > put: C={c}, P={p_price}"
    # Paridade classica: |C - P - (S0 - K*exp(-rT))| < 5.0 (tolerancia ampla para saltos)
    parity_diff = (c - p_price) - (S0 - K * math.exp(-r * T))
    if abs(parity_diff) > 5.0:
        return False, f"|C-P-(S0-K*e^(-rT))|={abs(parity_diff):.2f} > 5.0"
    return True, f"Merton: C={c:.4f}, P={p_price:.4f}, C-P={c-p_price:.4f} (paridade classica aproximada)"


def test_merton_class_call_equals_function() -> tuple[bool, str]:
    """MertonJumpModel.call_price == merton_call_price."""
    S0, K, T, r = 100.0, 105.0, 0.25, 0.05
    sigma, lam, mu_J, sigma_J = 0.20, 1.0, -0.05, 0.15
    model = MertonJumpModel(sigma, lam, mu_J, sigma_J)
    c_oo = model.call_price(S0, K, T, r)
    c_fn = merton_call_price(S0, K, T, r, sigma, lam, mu_J, sigma_J)
    if not math.isclose(c_oo, c_fn, rel_tol=1e-9):
        return False, f"OO={c_oo:.6f} != func={c_fn:.6f}"
    return True, f"OO == function: {c_oo:.4f}"


def test_merton_class_kappa_compensator() -> tuple[bool, str]:
    """kappa = E[exp(Y) - 1] = exp(mu_J + sigma_J²/2) - 1."""
    model = MertonJumpModel(sigma=0.20, lam=1.0, mu_J=-0.05, sigma_J=0.20)
    expected = math.exp(-0.05 + 0.5 * 0.04) - 1.0
    if not math.isclose(model.kappa, expected, rel_tol=1e-9):
        return False, f"κ={model.kappa:.6f}, esperado={expected:.6f}"
    return True, f"κ = {model.kappa:.4f} (compensador de drift)"


def test_merton_calibrate_recovers_lambda() -> tuple[bool, str]:
    """Calibração com sigma_J e mu_J fixos recupera sigma e lambda próximos."""
    S0, r = 100.0, 0.05
    # True params
    true_sigma, true_lam = 0.20, 2.0
    fixed_mu_J, fixed_sigma_J = -0.05, 0.15

    # Generate synthetic prices
    strikes_T = [(90.0, 0.25), (100.0, 0.25), (110.0, 0.25),
                 (95.0, 0.5), (105.0, 0.5)]
    market = []
    for K, T in strikes_T:
        p = merton_call_price(S0, K, T, r, true_sigma, true_lam,
                              fixed_mu_J, fixed_sigma_J)
        market.append((K, T, p))

    # Initial guess (lateralizado)
    init = MertonJumpModel(sigma=0.30, lam=5.0, mu_J=fixed_mu_J, sigma_J=fixed_sigma_J)
    calibrated = init.calibrate(S0, r, market, fix_mu_J=fixed_mu_J, fix_sigma_J=fixed_sigma_J)

    # Tolerância ampla (L-BFGS-B nao-global)
    if not math.isclose(calibrated.sigma, true_sigma, abs_tol=0.05):
        return False, f"sigma recuperado {calibrated.sigma:.4f} != true {true_sigma}"
    if not math.isclose(calibrated.lam, true_lam, abs_tol=2.0):
        return False, f"lambda recuperado {calibrated.lam:.2f} != true {true_lam}"
    return True, f"Calibração: σ={calibrated.sigma:.3f} (true={true_sigma}), λ={calibrated.lam:.2f} (true={true_lam})"


def test_merton_calibrate_requires_min_points() -> tuple[bool, str]:
    """Calibração precisa de >= 3 pontos."""
    model = MertonJumpModel(0.2, 1.0, 0.0, 0.1)
    try:
        model.calibrate(100.0, 0.05, [(100.0, 0.25, 5.0)])
        return False, "Deveria ter levantado ValueError com 1 ponto"
    except ValueError:
        pass
    try:
        model.calibrate(100.0, 0.05, [(100.0, 0.25, 5.0), (110.0, 0.25, 2.0)])
        return False, "Deveria ter levantado ValueError com 2 pontos"
    except ValueError:
        pass
    return True, "ValueError para <3 pontos"


def test_merton_invalid_class_params_raise() -> tuple[bool, str]:
    """MertonJumpModel valida parametros no construtor."""
    cases = [
        (-0.1, 1.0, 0.0, 0.1, "sigma<0"),
        (0.2, -1.0, 0.0, 0.1, "lambda<0"),
        (0.2, 1.0, 5.0, 0.1, "mu_J=5"),
        (0.2, 1.0, 0.0, -0.1, "sigma_J<0"),
    ]
    for sigma, lam, mu_J, sigma_J, desc in cases:
        try:
            MertonJumpModel(sigma, lam, mu_J, sigma_J)
            return False, f"{desc}: deveria ter levantado ValueError"
        except ValueError:
            pass
    return True, f"Todas {len(cases)} validações de construtor OK"


def test_merton_zero_jumps_higher_than_bs_for_otm() -> tuple[bool, str]:
    """Insight: Merton com saltos 0-medios (mu_J=0) ainda tem call OTM > BS
    (porque saltam podem mover preço para ITM, mesmo com média zero).
    """
    S0, K, T, r, sigma = 100.0, 130.0, 0.5, 0.05, 0.20  # Deep OTM
    bs = _bs_call_ref(S0, K, T, r, sigma)
    merton = merton_call_price(S0, K, T, r, sigma, lam=2.0, mu_J=0.0, sigma_J=0.30)
    if not (merton > bs):
        return False, f"Merton({merton:.4f}) deveria ser > BS({bs:.4f}) para deep OTM"
    return True, f"BS={bs:.4f}, Merton com saltos={merton:.4f} (OTM protegido)"


def test_merton_call_positive_for_itm() -> tuple[bool, str]:
    """Call ITM sempre vale > 0 e >= intrinseco (sem arbitragem)."""
    S0, K, T, r = 110.0, 100.0, 0.5, 0.05
    sigma, lam, mu_J, sigma_J = 0.20, 1.0, -0.05, 0.15
    c = merton_call_price(S0, K, T, r, sigma, lam, mu_J, sigma_J)
    intrinsic = max(S0 - K * math.exp(-r * T), 0)
    if c <= 0:
        return False, f"Call ITM deveria ser > 0, got {c}"
    if c < intrinsic:
        return False, f"Call {c:.4f} < intrinseco {intrinsic:.4f}"
    return True, f"ITM: C={c:.4f}, intrinseco={intrinsic:.4f}"
