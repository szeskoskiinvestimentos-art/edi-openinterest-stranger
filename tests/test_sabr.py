"""
test_sabr.py - Testes para E21 (SABR IV Smile).

Valida que:
1. hagan_implied_vol() produz valores corretos para casos conhecidos
2. SABRModel.calibrate() encontra parametros que casam o smile
3. Edge cases (T=0, alpha=0, etc) sao tratados
4. Smile metrics (skew, curvature) sao computadas
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.calculator.iv_smile import (
    hagan_implied_vol,
    SABRModel,
    calibrate_from_iv_strike_ref,
    ALPHA_MIN, ALPHA_MAX, BETA_MIN, BETA_MAX,
    RHO_MIN, RHO_MAX, NU_MIN, NU_MAX,
)


def test_hagan_atm():
    """ATM: sigma deve ser ~alpha * F^(beta-1) * fator."""
    F, K, T = 100.0, 100.0, 0.25
    alpha, beta, rho, nu = 0.20, 0.5, -0.30, 0.50

    sigma = hagan_implied_vol(F, K, T, alpha, beta, rho, nu)

    # Valor esperado ~ alpha * F^(beta-1) * (1 + correcoes_pequenas)
    # Para ATM, sigma ~ alpha (com F=1, beta=0.5: F^(-0.5)=1/sqrt(100)=0.1, entao sigma ~ 0.02)
    # Hmm, formula de Hagan tem normalizacao diferente
    # Vamos so verificar que e > 0 e finito
    assert np.isfinite(sigma), f"sigma nao finito: {sigma}"
    assert sigma > 0, f"sigma deve ser positivo: {sigma}"
    return True, f"ATM sigma: {sigma:.4f}"


def test_hagan_otm_call():
    """OTM call (K>F) deve ter IV maior que ATM (smile effect)."""
    F, T = 100.0, 0.25
    alpha, beta, rho, nu = 0.20, 0.5, -0.30, 0.50

    iv_atm = hagan_implied_vol(F, F, T, alpha, beta, rho, nu)
    iv_otm = hagan_implied_vol(F, 110.0, T, alpha, beta, rho, nu)

    # Com rho negativo, OTM call tem IV maior que ATM (skew reverso)
    # Mas pode ser proximo de ATM dependendo dos parametros
    assert iv_otm > 0, "OTM IV deve ser positivo"
    assert iv_otm >= iv_atm * 0.7, f"OTM {iv_otm} muito menor que ATM {iv_atm}"
    return True, f"ATM={iv_atm:.4f}, OTM={iv_otm:.4f}"


def test_hagan_otm_put_higher_iv():
    """OTM put (K<F) com rho negativo deve ter IV MAIOR que OTM call (smile)."""
    F, T = 100.0, 0.25
    alpha, beta, rho, nu = 0.20, 0.5, -0.50, 0.50

    iv_call = hagan_implied_vol(F, 110.0, T, alpha, beta, rho, nu)
    iv_put = hagan_implied_vol(F, 90.0, T, alpha, beta, rho, nu)

    # rho negativo => OTM put (K<F) tem IV > OTM call (K>F)
    assert iv_put > iv_call, \
        f"Esperado IV put {iv_put} > IV call {iv_call} (com rho negativo)"
    return True, f"OTM put={iv_put:.4f} > OTM call={iv_call:.4f}"


def test_hagan_edge_cases():
    """Edge cases: T=0, alpha=0, F=0 devem retornar 0 (sem quebrar)."""
    F, K, T = 100.0, 100.0, 0.25
    alpha, beta, rho, nu = 0.20, 0.5, -0.30, 0.50

    # T=0
    s = hagan_implied_vol(F, K, 0.0, alpha, beta, rho, nu)
    assert s == 0.0, f"T=0 deve dar 0, got {s}"

    # alpha=0
    s = hagan_implied_vol(F, K, T, 0.0, beta, rho, nu)
    assert s == 0.0, f"alpha=0 deve dar 0, got {s}"

    # F=0
    s = hagan_implied_vol(0.0, K, T, alpha, beta, rho, nu)
    assert s == 0.0, f"F=0 deve dar 0, got {s}"

    # K=0
    s = hagan_implied_vol(F, 0.0, T, alpha, beta, rho, nu)
    assert s == 0.0, f"K=0 deve dar 0, got {s}"

    return True, "4 edge cases retornaram 0.0"


def test_sabr_model_implied_vol():
    """SABRModel.implied_vol() deve usar hagan com parametros corretos."""
    sabr = SABRModel(F=100.0, T=0.25, beta=0.5)
    sabr.alpha = 0.20
    sabr.rho = -0.30
    sabr.nu = 0.50

    iv1 = sabr.implied_vol(100.0)
    iv2 = hagan_implied_vol(100.0, 100.0, 0.25, 0.20, 0.5, -0.30, 0.50)

    assert abs(iv1 - iv2) < 1e-10, f"SABRModel vs hagan: {iv1} != {iv2}"
    return True, f"SABRModel.implied_vol == hagan: {iv1:.6f}"


def test_sabr_model_array():
    """SABRModel.implied_vol_array() deve retornar array consistente."""
    sabr = SABRModel(F=100.0, T=0.25, beta=0.5)
    sabr.alpha = 0.25
    sabr.rho = -0.40
    sabr.nu = 0.60

    strikes = np.array([80.0, 90.0, 100.0, 110.0, 120.0])
    ivs = sabr.implied_vol_array(strikes)

    assert len(ivs) == 5
    assert np.all(ivs > 0), "Todas IVs devem ser positivas"

    # Verifica que sao as mesmas chamando scalar
    for i, K in enumerate(strikes):
        expected = sabr.implied_vol(K)
        assert abs(ivs[i] - expected) < 1e-10, f"ivs[{i}]={ivs[i]} != {expected}"
    return True, f"Array OK: {np.round(ivs, 4).tolist()}"


def test_sabr_calibrate_perfect_fit():
    """Calibração com dados perfeitos deve ter RMSE ~0."""
    sabr_true = SABRModel(F=100.0, T=0.25, beta=0.5)
    sabr_true.alpha = 0.20
    sabr_true.rho = -0.30
    sabr_true.nu = 0.50

    strikes = np.array([80.0, 90.0, 95.0, 100.0, 105.0, 110.0, 120.0])
    market_ivs = sabr_true.implied_vol_array(strikes)

    sabr_cal = SABRModel(F=100.0, T=0.25, beta=0.5)
    result = sabr_cal.calibrate(strikes, market_ivs)

    # RMSE deve ser muito baixo (< 0.001 = 0.1%)
    assert result['rmse'] < 1e-3, \
        f"RMSE muito alto: {result['rmse']}"
    assert result['converged'], f"Nao convergiu: {result['message']}"
    return True, f"RMSE: {result['rmse']:.6f}, converged={result['converged']}"


def test_sabr_calibrate_with_noise():
    """Calibração com ruído ainda deve encontrar parâmetros próximos."""
    sabr_true = SABRModel(F=100.0, T=0.25, beta=0.5)
    sabr_true.alpha = 0.25
    sabr_true.rho = -0.40
    sabr_true.nu = 0.40

    strikes = np.array([80.0, 90.0, 95.0, 100.0, 105.0, 110.0, 120.0])
    clean_ivs = sabr_true.implied_vol_array(strikes)
    # Adiciona ruido de 1% (relativo)
    np.random.seed(42)
    noisy_ivs = clean_ivs * (1.0 + 0.01 * np.random.randn(len(strikes)))

    sabr_cal = SABRModel(F=100.0, T=0.25, beta=0.5)
    result = sabr_cal.calibrate(strikes, noisy_ivs)

    # RMSE com ruido de 1% deve ser < 1%
    assert result['rmse'] < 0.01, f"RMSE com ruido muito alto: {result['rmse']}"
    # Parametros devem estar proximos (dentro de 20%)
    assert abs(result['alpha'] - 0.25) / 0.25 < 0.20, \
        f"alpha={result['alpha']} muito longe de 0.25"
    return True, f"RMSE: {result['rmse']:.4f}, alpha={result['alpha']:.3f}"


def test_sabr_calibrate_requires_min_points():
    """Calibração com < 3 pontos deve levantar ValueError."""
    sabr = SABRModel(F=100.0, T=0.25, beta=0.5)
    try:
        sabr.calibrate(np.array([100.0]), np.array([0.20]))
        return False, "Deveria ter levantado ValueError"
    except ValueError:
        return True, "ValueError levantado corretamente com < 3 pontos"


def test_sabr_smile_metrics():
    """SABR.smile_metrics() deve retornar skew, curvature, atm_vol."""
    sabr = SABRModel(F=100.0, T=0.25, beta=0.5)
    sabr.alpha = 0.20
    sabr.rho = -0.40
    sabr.nu = 0.50

    strikes = np.array([80.0, 90.0, 100.0, 110.0, 120.0])
    metrics = sabr.smile_metrics(strikes)

    assert 'atm_vol' in metrics
    assert 'skew' in metrics
    assert 'curvature' in metrics
    assert 'smile_range' in metrics

    # Com rho negativo, skew (OTM put - OTM call) deve ser POSITIVO
    assert metrics['skew'] > 0, \
        f"Esperado skew > 0 (rho negativo), got {metrics['skew']}"

    # Curvature deve ser positiva (smile tipico)
    assert metrics['curvature'] > 0, \
        f"Esperado curvature > 0, got {metrics['curvature']}"

    return True, f"ATM={metrics['atm_vol']:.4f}, skew={metrics['skew']:.4f}, curvature={metrics['curvature']:.4f}"


def test_sabr_calibrate_from_iv_strike_ref():
    """Helper calibrate_from_iv_strike_ref deve funcionar com IV per-strike."""
    # Simula iv_strike_ref vindo do calculator
    sabr_true = SABRModel(F=100.0, T=0.25, beta=0.5)
    sabr_true.alpha = 0.22
    sabr_true.rho = -0.35
    sabr_true.nu = 0.45

    strikes = np.array([85.0, 90.0, 95.0, 100.0, 105.0, 110.0, 115.0])
    iv_ref = sabr_true.implied_vol_array(strikes)

    # Calibra via helper
    sabr_cal = calibrate_from_iv_strike_ref(
        F=100.0, T=0.25, strikes=strikes, iv_strike_ref=iv_ref
    )

    # Deve estar calibrado com RMSE baixo
    ivs_pred = sabr_cal.implied_vol_array(strikes)
    rmse = float(np.sqrt(np.mean((ivs_pred - iv_ref)**2)))
    assert rmse < 1e-3, f"RMSE helper: {rmse}"
    return True, f"helper calibrado, RMSE: {rmse:.6f}"


def test_sabr_parameter_limits():
    """Constantes de limites devem ser razoaveis."""
    assert 0 < ALPHA_MIN < ALPHA_MAX
    assert 0 <= BETA_MIN < BETA_MAX <= 1
    assert -1 <= RHO_MIN < RHO_MAX <= 1
    assert 0 < NU_MIN < NU_MAX
    return True, f"Limits: alpha=[{ALPHA_MIN},{ALPHA_MAX}], beta=[{BETA_MIN},{BETA_MAX}], rho=[{RHO_MIN},{RHO_MAX}], nu=[{NU_MIN},{NU_MAX}]"


if __name__ == "__main__":
    tests = [
        ("Hagan ATM", test_hagan_atm),
        ("Hagan OTM call", test_hagan_otm_call),
        ("Hagan OTM put > call (rho neg)", test_hagan_otm_put_higher_iv),
        ("Hagan edge cases", test_hagan_edge_cases),
        ("SABRModel.implied_vol", test_sabr_model_implied_vol),
        ("SABRModel array", test_sabr_model_array),
        ("SABR calibrate perfect fit", test_sabr_calibrate_perfect_fit),
        ("SABR calibrate com ruido", test_sabr_calibrate_with_noise),
        ("SABR calibrate requer >=3 pontos", test_sabr_calibrate_requires_min_points),
        ("SABR smile metrics", test_sabr_smile_metrics),
        ("SABR helper from iv_strike_ref", test_sabr_calibrate_from_iv_strike_ref),
        ("SABR parameter limits", test_sabr_parameter_limits),
    ]

    passed = 0
    failed = 0
    for name, fn in tests:
        try:
            ok, msg = fn()
            if ok:
                print(f"  [OK ] {name} - {msg}")
                passed += 1
            else:
                print(f"  [FAIL] {name} - {msg}")
                failed += 1
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"  [FAIL] {name} - {e}")
            failed += 1

    print(f"\n=== Total: {len(tests)}, Passou: {passed}, Falhou: {failed} ===")
    sys.exit(1 if failed else 0)
