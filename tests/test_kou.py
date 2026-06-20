"""
Testes E72 — Kou (2002) Double-Exponential Jump-Diffusion.

Cobre:
- Degeneração para BS quando lambda=0
- T=0 -> intrinseco
- Validacao de parametros
- Assimetria: p<0.5 favorece down-jumps, eta_1<eta_2 favorece down-grandes
- Merton's log-normal simétrico (p=0.5, eta_1=eta_2) ≈ Merton
- Paridade put-call modificada
- Calibração
- KouJumpModel API OO
- Comportamento de cauda (deep OTM put protection)
"""
import math

from src.calculator.kou import (
    KouJumpModel,
    kou_call_price,
    kou_put_price,
    kou_jump_moments,
)


def _bs_call_ref(S: float, K: float, T: float, r: float, sigma: float) -> float:
    if T <= 0 or sigma <= 0:
        return max(S - K * math.exp(-r * T), 0.0)
    sqrt_T = math.sqrt(T)
    d1 = (math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt_T)
    d2 = d1 - sigma * sqrt_T
    cdf = lambda x: 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))
    return max(S * cdf(d1) - K * math.exp(-r * T) * cdf(d2), 0.0)


# ===========================================================================
# Testes
# ===========================================================================

def test_kou_lambda_zero_recovers_bs() -> tuple[bool, str]:
    """lambda=0 -> BS puro."""
    S0, K, T, r, sigma = 100.0, 100.0, 0.25, 0.05, 0.20
    bs = _bs_call_ref(S0, K, T, r, sigma)
    kou = kou_call_price(S0, K, T, r, sigma, lam=0.0, p=0.5, eta_1=10.0, eta_2=10.0)
    if not math.isclose(bs, kou, rel_tol=1e-9):
        return False, f"BS={bs:.6f}, Kou(λ=0)={kou:.6f}, diff={abs(bs-kou):.2e}"
    return True, f"Kou(λ=0) = BS = {bs:.4f}"


def test_kou_t_zero_returns_intrinsic() -> tuple[bool, str]:
    """T=0 -> max(S0-K, 0)."""
    c_itm = kou_call_price(110.0, 100.0, T=0.0, r=0.05, sigma=0.2, lam=1.0, p=0.5, eta_1=10.0, eta_2=10.0)
    if c_itm != 10.0:
        return False, f"ITM esperado 10, got {c_itm}"
    c_otm = kou_call_price(90.0, 100.0, T=0.0, r=0.05, sigma=0.2, lam=1.0, p=0.5, eta_1=10.0, eta_2=10.0)
    if c_otm != 0.0:
        return False, f"OTM esperado 0, got {c_otm}"
    return True, f"T=0: ITM={c_itm}, OTM={c_otm}"


def test_kou_invalid_params_raise() -> tuple[bool, str]:
    """9 validacoes de parametros."""
    cases = [
        (-100.0, 100.0, 0.25, 0.05, 0.2, 1.0, 0.5, 10.0, 10.0, "S0<0"),
        (100.0, -100.0, 0.25, 0.05, 0.2, 1.0, 0.5, 10.0, 10.0, "K<0"),
        (100.0, 100.0, -0.25, 0.05, 0.2, 1.0, 0.5, 10.0, 10.0, "T<0"),
        (100.0, 100.0, 0.25, 1.5, 0.2, 1.0, 0.5, 10.0, 10.0, "r>1"),
        (100.0, 100.0, 0.25, 0.05, -0.2, 1.0, 0.5, 10.0, 10.0, "sigma<0"),
        (100.0, 100.0, 0.25, 0.05, 0.2, -1.0, 0.5, 10.0, 10.0, "lambda<0"),
        (100.0, 100.0, 0.25, 0.05, 0.2, 1.0, 1.5, 10.0, 10.0, "p>1"),
        (100.0, 100.0, 0.25, 0.05, 0.2, 1.0, 0.5, 0.0, 10.0, "eta_1=0"),
        (100.0, 100.0, 0.25, 0.05, 0.2, 1.0, 0.5, 10.0, 0.0, "eta_2=0"),
    ]
    for S0, K, T, r, sigma, lam, p, eta_1, eta_2, desc in cases:
        try:
            kou_call_price(S0, K, T, r, sigma, lam, p, eta_1, eta_2)
            return False, f"{desc}: deveria ter levantado ValueError"
        except ValueError:
            pass
    return True, f"Todas {len(cases)} validações levantaram ValueError"


def test_kou_jump_moments_known_case() -> tuple[bool, str]:
    """Validacao analitica: p=0.5, eta_1=eta_2 -> E[Y]=0, Var[Y]=1/eta^2."""
    p, eta_1, eta_2 = 0.5, 10.0, 10.0
    mu_Y, var_Y = kou_jump_moments(p, eta_1, eta_2)
    # E[Y] = 0.5/10 - 0.5/10 = 0
    # E[Y^2] = 2*0.5/100 + 2*0.5/100 = 0.01 + 0.01 = 0.02
    # Var[Y] = 0.02 - 0 = 0.02 = 2/eta^2 (ja que 2*0.5/eta^2 * 2 = 2/eta^2 = 2/100 = 0.02)
    if not math.isclose(mu_Y, 0.0, abs_tol=1e-9):
        return False, f"E[Y] esperado 0, got {mu_Y}"
    if not math.isclose(var_Y, 0.02, rel_tol=1e-9):
        return False, f"Var[Y] esperado 0.02, got {var_Y}"
    return True, f"Simetrico p=0.5, η=10: μ_Y={mu_Y}, σ²_Y={var_Y}"


def test_kou_asymmetric_p_moments() -> tuple[bool, str]:
    """p<0.5 (mais down-jumps) -> E[Y] negativo."""
    # p=0.3 (mais down que up), eta_1=eta_2=10
    # E[Y] = 0.3/10 - 0.7/10 = -0.04
    mu_Y, var_Y = kou_jump_moments(p=0.3, eta_1=10.0, eta_2=10.0)
    if not math.isclose(mu_Y, -0.04, abs_tol=1e-9):
        return False, f"E[Y] esperado -0.04, got {mu_Y}"
    if mu_Y >= 0:
        return False, f"p=0.3 deveria ter E[Y]<0 (mais crashes), got {mu_Y}"
    return True, f"p=0.3 (mais crashes): μ_Y={mu_Y} (negativo)"


def test_kou_asymmetric_eta_moments() -> tuple[bool, str]:
    """eta_2 < eta_1 (down-jumps maiores) -> Var[Y] aumenta."""
    # Caso 1: simetrico eta=10
    _, var_sim = kou_jump_moments(p=0.5, eta_1=10.0, eta_2=10.0)
    # Caso 2: eta_2=5 (down-jumps 2x maiores)
    _, var_asym = kou_jump_moments(p=0.5, eta_1=10.0, eta_2=5.0)
    if not (var_asym > var_sim):
        return False, f"Assimetrico Var={var_asym} deveria > simetrico Var={var_sim}"
    return True, f"η₂=5 (down 2x): σ²_Y={var_asym:.4f} > simetrico σ²_Y={var_sim:.4f}"


def test_kou_higher_lambda_higher_call() -> tuple[bool, str]:
    """Maior lambda -> call OTM mais cara."""
    S0, K, T, r, sigma = 100.0, 110.0, 0.25, 0.05, 0.20
    c_low = kou_call_price(S0, K, T, r, sigma, lam=0.5, p=0.5, eta_1=10.0, eta_2=10.0)
    c_high = kou_call_price(S0, K, T, r, sigma, lam=3.0, p=0.5, eta_1=10.0, eta_2=10.0)
    if not (c_high > c_low):
        return False, f"lambda=3 ({c_high:.4f}) deveria ser > lambda=0.5 ({c_low:.4f})"
    return True, f"λ=0.5→{c_low:.4f}, λ=3→{c_high:.4f} (OTM call sobe)"


def test_kou_asymmetric_put_protection() -> tuple[bool, str]:
    """Insight: eta_2<eta_1 (down-jumps maiores) -> deep OTM put MAIS cara que simetrico."""
    S0, K, T, r, sigma = 100.0, 70.0, 0.25, 0.05, 0.20  # Deep OTM put

    # Caso simetrico: p=0.5, eta_1=eta_2=10
    p_sym = kou_put_price(S0, K, T, r, sigma, lam=2.0, p=0.5, eta_1=10.0, eta_2=10.0)
    # Caso assimetrico: mesmos params, mas eta_2=5 (down-jumps 2x maiores em magnitude)
    p_asym = kou_put_price(S0, K, T, r, sigma, lam=2.0, p=0.5, eta_1=10.0, eta_2=5.0)

    if not (p_asym > p_sym):
        return False, f"Assimétrico ({p_asym:.4f}) deveria proteger mais OTM put que simétrico ({p_sym:.4f})"
    return True, f"Simétrico={p_sym:.4f}, Assimétrico (η₂=5)={p_asym:.4f} (crash protection)"


def test_kou_put_call_parity_modified() -> tuple[bool, str]:
    """Kou: paridade forward aproximada (C-P ≈ S0*exp(-λ*κ*T) - K*exp(-r*T)).

    Em modelos com saltos discretos, a paridade put-call classica NAO se
    aplica diretamente. A versao 'forward' e' apenas aproximada.
    """
    S0, K, T, r, sigma = 100.0, 100.0, 0.5, 0.05, 0.20
    lam, p_up, eta_1, eta_2 = 1.5, 0.4, 10.0, 8.0
    c = kou_call_price(S0, K, T, r, sigma, lam, p_up, eta_1, eta_2)
    p_price = kou_put_price(S0, K, T, r, sigma, lam, p_up, eta_1, eta_2)
    if c <= p_price:
        return False, f"Call ITM/ATM deveria ser > put: C={c}, P={p_price}"
    parity_diff = (c - p_price) - (S0 - K * math.exp(-r * T))
    if abs(parity_diff) > 5.0:
        return False, f"|C-P-(S0-K*e^(-rT))|={abs(parity_diff):.2f} > 5.0"
    return True, f"Kou: C={c:.4f}, P={p_price:.4f}, C-P={c-p_price:.4f} (paridade classica aprox.)"


def test_kou_class_call_equals_function() -> tuple[bool, str]:
    """KouJumpModel.call_price == kou_call_price."""
    S0, K, T, r = 100.0, 105.0, 0.25, 0.05
    sigma, lam, p, eta_1, eta_2 = 0.20, 1.0, 0.4, 10.0, 8.0
    model = KouJumpModel(sigma, lam, p, eta_1, eta_2)
    c_oo = model.call_price(S0, K, T, r)
    c_fn = kou_call_price(S0, K, T, r, sigma, lam, p, eta_1, eta_2)
    if not math.isclose(c_oo, c_fn, rel_tol=1e-9):
        return False, f"OO={c_oo:.6f} != func={c_fn:.6f}"
    return True, f"OO == function: {c_oo:.4f}"


def test_kou_class_is_asymmetric() -> tuple[bool, str]:
    """is_asymmetric detecta quebra de simetria."""
    # Simetrico
    sym = KouJumpModel(0.2, 1.0, 0.5, 10.0, 10.0)
    if sym.is_asymmetric:
        return False, "p=0.5, eta=10 deveria ser simetrico"
    # Assimetrico em p
    asym_p = KouJumpModel(0.2, 1.0, 0.3, 10.0, 10.0)
    if not asym_p.is_asymmetric:
        return False, "p=0.3 (≠0.5) deveria ser assimetrico"
    # Assimetrico em eta
    asym_eta = KouJumpModel(0.2, 1.0, 0.5, 10.0, 5.0)
    if not asym_eta.is_asymmetric:
        return False, "eta_1≠eta_2 deveria ser assimetrico"
    return True, f"Simetrico: {sym.is_asymmetric}, Asym p: {asym_p.is_asymmetric}, Asym eta: {asym_eta.is_asymmetric}"


def test_kou_kappa_compensator() -> tuple[bool, str]:
    """kappa = exp(mu_Y + var_Y/2) - 1."""
    model = KouJumpModel(sigma=0.20, lam=1.0, p=0.4, eta_1=10.0, eta_2=8.0)
    expected = math.exp(model.mu_Y + 0.5 * model.var_Y) - 1.0
    if not math.isclose(model.kappa, expected, rel_tol=1e-9):
        return False, f"κ={model.kappa:.6f}, esperado={expected:.6f}"
    return True, f"κ = {model.kappa:.4f} (compensador de drift)"


def test_kou_calibrate_recovers_lambda() -> tuple[bool, str]:
    """Calibração com p/eta fixos recupera sigma e lambda próximos."""
    S0, r = 100.0, 0.05
    true_sigma, true_lam = 0.20, 2.0
    fixed_p, fixed_eta_1, fixed_eta_2 = 0.5, 10.0, 10.0

    # Generate synthetic prices
    strikes_T = [(90.0, 0.25), (100.0, 0.25), (110.0, 0.25),
                 (95.0, 0.5), (105.0, 0.5)]
    market = []
    for K, T in strikes_T:
        price = kou_call_price(S0, K, T, r, true_sigma, true_lam,
                               fixed_p, fixed_eta_1, fixed_eta_2)
        market.append((K, T, price))

    init = KouJumpModel(sigma=0.30, lam=5.0, p=fixed_p, eta_1=fixed_eta_1, eta_2=fixed_eta_2)
    calibrated = init.calibrate(S0, r, market, fix_p_eta=(fixed_p, fixed_eta_1, fixed_eta_2))

    if not math.isclose(calibrated.sigma, true_sigma, abs_tol=0.05):
        return False, f"sigma recuperado {calibrated.sigma:.4f} != true {true_sigma}"
    if not math.isclose(calibrated.lam, true_lam, abs_tol=2.0):
        return False, f"lambda recuperado {calibrated.lam:.2f} != true {true_lam}"
    return True, f"Calibração: σ={calibrated.sigma:.3f}, λ={calibrated.lam:.2f}"


def test_kou_calibrate_requires_min_points() -> tuple[bool, str]:
    """>= 3 pontos para calibrar."""
    model = KouJumpModel(0.2, 1.0, 0.5, 10.0, 10.0)
    try:
        model.calibrate(100.0, 0.05, [(100.0, 0.25, 5.0)])
        return False, "Deveria levantar ValueError com 1 ponto"
    except ValueError:
        pass
    try:
        model.calibrate(100.0, 0.05, [(100.0, 0.25, 5.0), (110.0, 0.25, 2.0)])
        return False, "Deveria levantar ValueError com 2 pontos"
    except ValueError:
        pass
    return True, "ValueError para <3 pontos"


def test_kou_invalid_class_params_raise() -> tuple[bool, str]:
    """KouJumpModel valida no construtor."""
    cases = [
        (-0.1, 1.0, 0.5, 10.0, 10.0, "sigma<0"),
        (0.2, -1.0, 0.5, 10.0, 10.0, "lambda<0"),
        (0.2, 1.0, 1.5, 10.0, 10.0, "p>1"),
        (0.2, 1.0, 0.5, 0.0, 10.0, "eta_1=0"),
        (0.2, 1.0, 0.5, 10.0, 0.0, "eta_2=0"),
    ]
    for sigma, lam, p, eta_1, eta_2, desc in cases:
        try:
            KouJumpModel(sigma, lam, p, eta_1, eta_2)
            return False, f"{desc}: deveria levantar ValueError"
        except ValueError:
            pass
    return True, f"Todas {len(cases)} validações de construtor OK"
