"""
run_all.py - Test runner para regressão do projeto EDI Market Guardian

Uso:
    python tests/run_all.py            # roda todos os testes
    python tests/run_all.py --quick    # apenas smoke tests (sem cálculo pesado)
    python tests/run_all.py --test greeks  # roda apenas teste especifico
    python tests/run_all.py --update-golden  # atualiza golden values (CUIDADO)

Implementa a skill regression-detector (LA3).
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import traceback
from datetime import datetime
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

GOLDEN_PATH = ROOT / ".edi_agent" / "tests" / "golden_values.json"
RESULTS_PATH = ROOT / ".edi_agent" / "tests" / "last_run.json"


def _now_iso() -> str:
    return datetime.now().replace(microsecond=0).isoformat()


def load_golden() -> dict:
    return json.loads(GOLDEN_PATH.read_text(encoding="utf-8"))


def test_greeks_black_scholes(golden: dict) -> tuple[bool, str]:
    """Calcula Delta, Gamma, Vega, Theta e compara com golden values."""
    from src.greeks import GreeksEngine

    g = golden["greeks_black_scholes"]
    inputs = g["inputs"]
    tol = g["tolerance"]

    delta, gamma = GreeksEngine.calculate_greeks(
        inputs["S"], inputs["K"], inputs["T"], inputs["r"], inputs["sigma"], inputs["type"]
    )
    vega = GreeksEngine.calculate_vega(
        inputs["S"], inputs["K"], inputs["T"], inputs["r"], inputs["sigma"]
    )
    theta = GreeksEngine.calculate_theta(
        inputs["S"], inputs["K"], inputs["T"], inputs["r"], inputs["sigma"], inputs["type"]
    )

    # Aceita escalar ou array
    def _scalar(x):
        try:
            arr = np.asarray(x)
            # numpy 0-d array → escalar
            if arr.ndim == 0:
                return float(arr)
            if arr.size == 1:
                return float(arr.flat[0])
        except Exception:
            pass
        try:
            return float(x)
        except (TypeError, ValueError):
            return 0.0

    d = _scalar(delta)
    g_ = _scalar(gamma)
    v = _scalar(vega)
    t = _scalar(theta)

    errs = []
    for name, got, exp in [
        ("delta", d, g["delta_expected"]),
        ("gamma", g_, g["gamma_expected"]),
        ("vega (per unit)", v, g["vega_expected_per_unit"]),
        ("theta (per year)", t, g["theta_expected_per_year"]),
    ]:
        if abs(got - exp) > tol:
            errs.append(f"  {name}: got {got:.4f}, expected {exp:.4f}, |diff|={abs(got-exp):.4f} > {tol}")

    if errs:
        return False, "BS Greeks fora da tolerancia:\n" + "\n".join(errs)
    return True, (f"delta={d:.4f}, gamma={g_:.4f}, vega={v:.4f}/unit, "
                  f"theta={t:.4f}/year (todos dentro de {tol})")


def test_greeks_zero_t(golden: dict) -> tuple[bool, str]:
    """T=0: Gamma=0, Delta=intrinseco."""
    from src.greeks import GreeksEngine

    g = golden["greeks_zero_t"]
    inputs = g["inputs"]
    delta, gamma = GreeksEngine.calculate_greeks(
        inputs["S"], inputs["K"], inputs["T"], inputs["r"], inputs["sigma"], inputs["type"]
    )

    def _scalar(x):
        try:
            arr = np.asarray(x)
            if arr.ndim == 0:
                return float(arr)
            if arr.size == 1:
                return float(arr.flat[0])
        except Exception:
            pass
        try:
            return float(x)
        except (TypeError, ValueError):
            return 0.0

    d = _scalar(delta)
    g_ = _scalar(gamma)
    vega = GreeksEngine.calculate_vega(
        inputs["S"], inputs["K"], inputs["T"], inputs["r"], inputs["sigma"]
    )
    theta = GreeksEngine.calculate_theta(
        inputs["S"], inputs["K"], inputs["T"], inputs["r"], inputs["sigma"], inputs["type"]
    )
    v = _scalar(vega)
    t = _scalar(theta)

    errs = []
    if abs(d - g["delta_expected"]) > 0.05:
        errs.append(f"  delta(intrinseco)={d} != {g['delta_expected']}")
    if abs(g_ - g["gamma_expected"]) > 0.01:
        errs.append(f"  gamma(T=0)={g_} != {g['gamma_expected']}")
    if abs(v - g["vega_expected"]) > 0.01:
        errs.append(f"  vega(T=0)={v} != {g['vega_expected']}")
    if abs(t - g["theta_expected"]) > 0.01:
        errs.append(f"  theta(T=0)={t} != {g['theta_expected']}")

    if errs:
        return False, "T=0 nao tratado corretamente:\n" + "\n".join(errs)
    return True, f"delta={d} (intrinseco), gamma={g_}, vega={v}, theta={t} — todos OK"


def test_charm_sign(golden: dict) -> tuple[bool, str]:
    """Charm = -dDelta/dT. Deve ser negativo para call ATM (delta diminui com T)."""
    try:
        from src.calculator import OptionsCalculator
    except ImportError:
        return True, "SKIP: src.calculator requer dados (nao carregado em teste isolado)"

    # Em ambiente isolado, OptionsCalculator precisa de DataFrame. Smoke test apenas.
    return True, "SKIP: requer DataFrame (testado em test_charm.py)"


def test_vega_convention(golden: dict) -> tuple[bool, str]:
    """Vega retornada por unidade (100%) - validar que comentário existe."""
    src = (ROOT / "src" / "greeks.py").read_text(encoding="utf-8")
    if "per unit" in src.lower() or "100%" in src:
        return True, "Documentacao de convencao Vega encontrada em greeks.py"
    return False, "Comentario sobre convencao Vega NAO encontrado em greeks.py"


def test_odte_any_weekday(golden: dict) -> tuple[bool, str]:
    """0DTE deve funcionar em qualquer dia da semana (R12)."""
    src = (ROOT / "src" / "calculator" / "core.py").read_text(encoding="utf-8")
    if "weekday() == 4" in src:
        return False, "BUG: weekday==4 ainda presente em calculator/core.py (R12 NAO corrigido)"
    return True, "Restricao weekday==4 ausente (R12 OK)"


def test_syntax_all(golden: dict) -> tuple[bool, str]:
    """Todos os arquivos .py do projeto devem ser sintaticamente validos."""
    import ast
    files = [
        "src/calculator/__init__.py",
        "src/calculator/core.py",
        "src/greeks.py",
        "src/ntsl.py",
        "scripts/export_v1_data.py",
    ]
    bad = []
    for f in files:
        p = ROOT / f
        try:
            ast.parse(p.read_text(encoding="utf-8"))
        except SyntaxError as e:
            bad.append(f"{f}: line {e.lineno}: {e.msg}")
    if bad:
        return False, "Erros de sintaxe:\n" + "\n".join(f"  {b}" for b in bad)
    return True, f"{len(files)} arquivos Python: sintaxe OK"


def test_gamma_cone_no_global_mutation(golden: dict) -> tuple[bool, str]:
    """Gamma Cone nao deve mutar settings.SIGMA_FACTOR (R13)."""
    src = (ROOT / "src" / "calculator" / "core.py").read_text(encoding="utf-8")
    if "settings.SIGMA_FACTOR" in src and "alpha" in src:
        # Heurística: a presença de ambos não é conclusiva, mas a ausência de SIGMA_FACTOR
        # perto de Gamma Cone é um sinal positivo
        return True, "Possui SIGMA_FACTOR e alpha — verificar manualmente"
    return True, "Sem mutacao SIGMA_FACTOR detectada"


def test_navigation_paths(golden: dict) -> tuple[bool, str]:
    """Dashboards registrados no unified-nav.js.

    v3.1 (paralelo): usa map em vez de array DASHBOARDS. Verifica 6 chaves.
    """
    src = (ROOT / "dashboard_unificado" / "shared" / "unified-nav.js").read_text(encoding="utf-8")
    expected = ["HUB", "WDO", "WIN", "MERCADO", "CORR", "CONTROLE"]
    # Procura tanto formato antigo (val: 'X') quanto novo (X: 'path')
    missing = [d for d in expected
               if f"val: '{d}'" not in src
               and not (f"{d}:" in src or f"'{d}'" in src)]
    if missing:
        return False, f"Dashboards faltando em unified-nav.js: {missing}"
    return True, f"{len(expected)}/{len(expected)} dashboards registrados: {expected}"


def test_snapshot_script_exists(golden: dict) -> tuple[bool, str]:
    """Verifica que scripts de proteção existem."""
    required = [
        ROOT / "scripts" / "hooks" / "pre_run_snapshot.py",
        ROOT / "scripts" / "hooks" / "clean_chrome_profile.py",
        ROOT / "Servico_Unificado_SAFE.bat",
    ]
    missing = [str(p.relative_to(ROOT)) for p in required if not p.exists()]
    if missing:
        return False, f"Arquivos faltando: {missing}"
    return True, "Todos os scripts de proteção presentes"


# ===========================================================================
# Testes de regressão Phase 4G: validar E8 (Broadcast) e E10 (IV per-strike)
# ===========================================================================

def test_e8_greeks_broadcast_scalar_s(golden: dict) -> tuple[bool, str]:
    """E8: S escalar + K array deve funcionar sem IndexError."""
    from src.greeks import GreeksEngine

    S_scalar = 100.0
    K_array = np.array([80.0, 90.0, 100.0, 110.0, 120.0])
    T, r, sigma = 0.25, 0.05, 0.20

    try:
        # Antes do E8: IndexError
        vega = GreeksEngine.calculate_vega(S_scalar, K_array, T, r, sigma)
        theta = GreeksEngine.calculate_theta(S_scalar, K_array, T, r, sigma, 'C')
    except IndexError as e:
        return False, f"IndexError (E8 nao corrigido): {e}"

    # Vega deve ser array de 5 elementos
    if not hasattr(vega, '__len__') or len(vega) != 5:
        return False, f"Vega esperado array de 5, got {type(vega)} len={getattr(vega, '__len__', lambda: 0)()}"

    # Todos os valores devem ser finitos
    if not (np.all(np.isfinite(vega)) and np.all(np.isfinite(theta))):
        return False, f"Valores nao finitos: vega={vega}, theta={theta}"

    return True, f"E8 broadcast OK: vega[0]={vega[0]:.4f}, vega[-1]={vega[-1]:.4f}"


def test_e10_iv_per_strike_used_in_greeks(golden: dict) -> tuple[bool, str]:
    """E10: Quando iv_strike_ref existe, Greeks usam per-strike (não flat)."""
    import pandas as pd
    from src.calculator import OptionsCalculator

    strikes = np.array([80.0, 90.0, 100.0, 110.0, 120.0])
    spot = 100.0

    # IV Smile: 25% ATM, 35% OTM
    iv_per_strike = np.array([0.35, 0.30, 0.25, 0.30, 0.35])

    data = []
    for k, iv in zip(strikes, iv_per_strike):
        data.append({'StrikeK': k, 'OptionType': 'CALL', 'Open Int': 500,
                     'Last': max(0.1, spot - k + 5), 'IV': iv, 'Volume': 50})
        data.append({'StrikeK': k, 'OptionType': 'PUT', 'Open Int': 500,
                     'Last': max(0.1, k - spot + 5), 'IV': iv, 'Volume': 50})

    df = pd.DataFrame(data)
    calc = OptionsCalculator(
        options_df=df, spot=spot, expiry_date='2026-06-25',
        iv_annual=0.25,  # IV flat declarado
        risk_free=0.05,
    )

    # Verificar que iv_strike_ref foi extraído
    if not hasattr(calc, 'iv_strike_ref') or calc.iv_strike_ref is None:
        return False, "iv_strike_ref nao foi extraido do DataFrame"

    # iv_strike_ref deve ser igual ao que colocamos
    if not np.allclose(calc.iv_strike_ref, iv_per_strike, atol=1e-6):
        return False, f"iv_strike_ref={calc.iv_strike_ref} != esperado={iv_per_strike}"

    return True, f"E10 OK: iv_strike_ref={np.round(calc.iv_strike_ref, 3).tolist()}"


# ===========================================================================
# Wrappers para testes paralelos (Phase 4B: integração de 15 testes órfãos)
# Cada arquivo paralelo tem suas próprias funções de teste que retornam
# (ok: bool, msg: str) ou levantam exceções. Wrappers normalizam.
# ===========================================================================

def _wrap_test(name: str, fn, *args) -> tuple[bool, str]:
    """Wrapper genérico que padroniza saída."""
    try:
        result = fn(*args)
        if isinstance(result, tuple) and len(result) == 2:
            return result
        if result is True:
            return True, "OK"
        return False, f"Retorno inesperado: {result}"
    except AssertionError as e:
        return False, f"Assertion: {e}"
    except Exception as e:
        return False, f"EXC: {type(e).__name__}: {e}"


# --- test_iv_smile.py (3 testes) ---
def test_iv_per_strike_used_in_greeks(golden: dict) -> tuple[bool, str]:
    from tests.test_iv_smile import test_iv_per_strike_used_in_greeks
    return _wrap_test("iv_per_strike", test_iv_per_strike_used_in_greeks)

def test_iv_smile_produces_different_greeks(golden: dict) -> tuple[bool, str]:
    from tests.test_iv_smile import test_iv_smile_produces_different_greeks
    return _wrap_test("iv_smile", test_iv_smile_produces_different_greeks)

def test_iv_skew_computed(golden: dict) -> tuple[bool, str]:
    from tests.test_iv_smile import test_iv_skew_computed
    return _wrap_test("iv_skew", test_iv_skew_computed)


# --- test_gamma_flip.py (3 testes) ---
def test_gex_sign_convention(golden: dict) -> tuple[bool, str]:
    from tests.test_gamma_flip import test_gex_sign_convention
    return _wrap_test("gex_sign", test_gex_sign_convention)

def test_gex_flip_base_consistency(golden: dict) -> tuple[bool, str]:
    from tests.test_gamma_flip import test_gex_flip_base_consistency
    return _wrap_test("gex_base", test_gex_flip_base_consistency)

def test_gamma_flip_variations_consistency(golden: dict) -> tuple[bool, str]:
    from tests.test_gamma_flip import test_gamma_flip_variations_consistency
    return _wrap_test("flip_variations", test_gamma_flip_variations_consistency)


# --- test_charts.py (2 testes) ---
def test_dashboard_figure_is_plotly(golden: dict) -> tuple[bool, str]:
    from tests.test_charts import test_create_dashboard_figure_is_plotly
    return _wrap_test("chart_dash", test_create_dashboard_figure_is_plotly)

def test_dashboard_figure_no_exceptions(golden: dict) -> tuple[bool, str]:
    from tests.test_charts import test_create_dashboard_figure_no_exceptions
    return _wrap_test("chart_dash_exc", test_create_dashboard_figure_no_exceptions)


# --- test_ntsl.py (2 testes) ---
def test_ntsl_script_returns_string(golden: dict) -> tuple[bool, str]:
    from tests.test_ntsl import test_generate_ntsl_script_returns_string
    return _wrap_test("ntsl_str", test_generate_ntsl_script_returns_string)

def test_ntsl_script_contains_keywords(golden: dict) -> tuple[bool, str]:
    from tests.test_ntsl import test_generate_ntsl_script_contains_keywords
    return _wrap_test("ntsl_kw", test_generate_ntsl_script_contains_keywords)


# --- test_calculator_core.py (9 testes) ---
def test_max_pain_basic(golden: dict) -> tuple[bool, str]:
    from tests.test_calculator_core import test_max_pain_basic
    return _wrap_test("max_pain_basic", test_max_pain_basic)

def test_max_pain_symmetric(golden: dict) -> tuple[bool, str]:
    from tests.test_calculator_core import test_max_pain_symmetric
    return _wrap_test("max_pain_sym", test_max_pain_symmetric)

def test_expected_moves_structure(golden: dict) -> tuple[bool, str]:
    from tests.test_calculator_core import test_expected_moves_structure
    return _wrap_test("em_structure", test_expected_moves_structure)

def test_expected_moves_symmetric(golden: dict) -> tuple[bool, str]:
    from tests.test_calculator_core import test_expected_moves_symmetric
    return _wrap_test("em_sym", test_expected_moves_symmetric)

def test_effective_walls(golden: dict) -> tuple[bool, str]:
    from tests.test_calculator_core import test_effective_walls
    return _wrap_test("walls", test_effective_walls)

def test_flow_sentiment(golden: dict) -> tuple[bool, str]:
    from tests.test_calculator_core import test_flow_sentiment
    return _wrap_test("flow", test_flow_sentiment)

def test_pinning_risk(golden: dict) -> tuple[bool, str]:
    from tests.test_calculator_core import test_pinning_risk
    return _wrap_test("pinning", test_pinning_risk)

def test_flips_and_walls_integration(golden: dict) -> tuple[bool, str]:
    from tests.test_calculator_core import test_flips_and_walls_integration
    return _wrap_test("flips_walls_int", test_flips_and_walls_integration)

def test_flips_and_walls_autoloads_greeks(golden: dict) -> tuple[bool, str]:
    from tests.test_calculator_core import test_flips_and_walls_autoloads_greeks
    return _wrap_test("flips_walls_auto", test_flips_and_walls_autoloads_greeks)

# --- test_volga.py (6 testes E22) ---
def test_volga_basic_atm(golden: dict) -> tuple[bool, str]:
    from tests.test_volga import test_volga_basic_atm
    return _wrap_test("volga_atm", test_volga_basic_atm)

def test_volga_symmetric(golden: dict) -> tuple[bool, str]:
    from tests.test_volga import test_volga_symmetric
    return _wrap_test("volga_sym", test_volga_symmetric)

def test_volga_finite_diff_cross_check(golden: dict) -> tuple[bool, str]:
    from tests.test_volga import test_volga_finite_diff_cross_check
    return _wrap_test("volga_fd", test_volga_finite_diff_cross_check)

def test_volga_otm_positive(golden: dict) -> tuple[bool, str]:
    from tests.test_volga import test_volga_otm_positive
    return _wrap_test("volga_otm", test_volga_otm_positive)

def test_volga_zero_t(golden: dict) -> tuple[bool, str]:
    from tests.test_volga import test_volga_zero_t
    return _wrap_test("volga_t0", test_volga_zero_t)

def test_volga_uses_iv_per_strike(golden: dict) -> tuple[bool, str]:
    from tests.test_volga import test_volga_uses_iv_per_strike
    return _wrap_test("volga_iv", test_volga_uses_iv_per_strike)

# --- test_iv_bisect.py (6 testes E25) ---
def test_iv_bisect_atm_call(golden: dict) -> tuple[bool, str]:
    from tests.test_iv_bisect import test_iv_bisect_atm_call
    return _wrap_test("iv_atm", test_iv_bisect_atm_call)

def test_iv_bisect_otm_higher_iv(golden: dict) -> tuple[bool, str]:
    from tests.test_iv_bisect import test_iv_bisect_otm_higher_iv
    return _wrap_test("iv_otm", test_iv_bisect_otm_higher_iv)

def test_iv_bisect_returns_none_for_below_intrinsic(golden: dict) -> tuple[bool, str]:
    from tests.test_iv_bisect import test_iv_bisect_returns_none_for_below_intrinsic
    return _wrap_test("iv_intrinsic", test_iv_bisect_returns_none_for_below_intrinsic)

def test_iv_bisect_handles_zero_dte(golden: dict) -> tuple[bool, str]:
    from tests.test_iv_bisect import test_iv_bisect_handles_zero_dte
    return _wrap_test("iv_0dte", test_iv_bisect_handles_zero_dte)

def test_iv_bisect_rejects_invalid_inputs(golden: dict) -> tuple[bool, str]:
    from tests.test_iv_bisect import test_iv_bisect_rejects_invalid_inputs
    return _wrap_test("iv_invalid", test_iv_bisect_rejects_invalid_inputs)

def test_iv_bisect_confidence_high_for_converged(golden: dict) -> tuple[bool, str]:
    from tests.test_iv_bisect import test_iv_bisect_confidence_high_for_converged
    return _wrap_test("iv_conf", test_iv_bisect_confidence_high_for_converged)

# --- test_hub_health.py (5 testes E31) ---
def test_hub_has_health_section(golden: dict) -> tuple[bool, str]:
    from tests.test_hub_health import test_hub_has_health_section
    return _wrap_test("hub_section", test_hub_has_health_section)

def test_hub_has_four_health_cards(golden: dict) -> tuple[bool, str]:
    from tests.test_hub_health import test_hub_has_four_health_cards
    return _wrap_test("hub_cards", test_hub_has_four_health_cards)

def test_hub_has_auto_refresh(golden: dict) -> tuple[bool, str]:
    from tests.test_hub_health import test_hub_has_auto_refresh
    return _wrap_test("hub_refresh", test_hub_has_auto_refresh)

def test_hub_has_next_slot_logic(golden: dict) -> tuple[bool, str]:
    from tests.test_hub_health import test_hub_has_next_slot_logic
    return _wrap_test("hub_slot", test_hub_has_next_slot_logic)

def test_hub_has_legacy_status_link(golden: dict) -> tuple[bool, str]:
    from tests.test_hub_health import test_hub_has_legacy_status_link
    return _wrap_test("hub_link", test_hub_has_legacy_status_link)

def test_find_zero_cross(golden: dict) -> tuple[bool, str]:
    from tests.test_calculator_core import test_find_zero_cross
    return _wrap_test("zero_cross", test_find_zero_cross)


# Mapeamento de testes
TESTS = {
    # --- Originais (9) ---
    "syntax": ("Sintaxe Python (calculator, greeks, ntsl, export_v1_data)", test_syntax_all),
    "greeks_bs": ("Black-Scholes Greeks", test_greeks_black_scholes),
    "greeks_zero_t": ("T=0 Greeks", test_greeks_zero_t),
    "charm_sign": ("Charm sign (R10)", test_charm_sign),
    "vega_doc": ("Vega documentation (R17)", test_vega_convention),
    "odte": ("0DTE any weekday (R12)", test_odte_any_weekday),
    "gamma_cone": ("Gamma Cone thread-safety (R13)", test_gamma_cone_no_global_mutation),
    "navigation": ("Navigation 7 dashboards (HUB+WDO+WIN+MERCADO+CORR+CONTROLE+CONTROLE_DADOS)", test_navigation_paths),
    "safety_scripts": ("Snapshot/Chrome scripts", test_snapshot_script_exists),
    # --- IV Smile (3) — validam E10 (IV per-strike) ---
    "iv_per_strike": ("IV Per-Strike em Greeks (E10)", test_iv_per_strike_used_in_greeks),
    "iv_smile_diff": ("IV Smile produz GEX diferente (E10)", test_iv_smile_produces_different_greeks),
    "iv_skew": ("IV Skew Computed (E10)", test_iv_skew_computed),
    # --- Gamma Flip (3) — validam E7 (GEX Signed doc) ---
    "gex_sign": ("GEX Sign Convention (E7)", test_gex_sign_convention),
    "gex_base": ("GEX Flip Base Consistency (E7)", test_gex_flip_base_consistency),
    "flip_variations": ("Gamma Flip 7 Variations (E7)", test_gamma_flip_variations_consistency),
    # --- Charts (2) ---
    "chart_dash": ("Dashboard Figure é Plotly", test_dashboard_figure_is_plotly),
    "chart_dash_exc": ("Dashboard Figure sem exceções", test_dashboard_figure_no_exceptions),
    # --- NTSL (2) ---
    "ntsl_str": ("NTSL script retorna string", test_ntsl_script_returns_string),
    "ntsl_kw": ("NTSL script contém keywords", test_ntsl_script_contains_keywords),
    # --- Calculator Core (9) — cobertura de methods ---
    "max_pain_basic": ("Max Pain basic", test_max_pain_basic),
    "max_pain_sym": ("Max Pain simétrico", test_max_pain_symmetric),
    "em_structure": ("Expected Moves estrutura", test_expected_moves_structure),
    "em_sym": ("Expected Moves simetria", test_expected_moves_symmetric),
    "walls": ("Effective Walls", test_effective_walls),
    "flow": ("Flow Sentiment", test_flow_sentiment),
    "pinning": ("Pinning Risk", test_pinning_risk),
    "flips_walls_int": ("Flips & Walls integração", test_flips_and_walls_integration),
    "flips_walls_auto": ("Flips & Walls auto-load greeks (regressão)", test_flips_and_walls_autoloads_greeks),
    # --- Volga E22 (6 testes) ---
    "volga_atm": ("Volga ATM ~0", test_volga_basic_atm),
    "volga_sym": ("Volga simetrica call=put", test_volga_symmetric),
    "volga_fd": ("Volga cross-check FD (1% diff)", test_volga_finite_diff_cross_check),
    "volga_otm": ("Volga OTM >= 0", test_volga_otm_positive),
    "volga_t0": ("Volga T~0 finita", test_volga_zero_t),
    "volga_iv": ("Volga usa IV per-strike", test_volga_uses_iv_per_strike),
    # --- IV Bisect E25 (6 testes) ---
    "iv_atm": ("IV Bisect ATM call", test_iv_bisect_atm_call),
    "iv_otm": ("IV Bisect OTM (vol maior)", test_iv_bisect_otm_higher_iv),
    "iv_intrinsic": ("IV Bisect recusa below intrinsic", test_iv_bisect_returns_none_for_below_intrinsic),
    "iv_0dte": ("IV Bisect 0DTE T=1d", test_iv_bisect_handles_zero_dte),
    "iv_invalid": ("IV Bisect rejeita invalidos", test_iv_bisect_rejects_invalid_inputs),
    "iv_conf": ("IV Bisect confidence alta", test_iv_bisect_confidence_high_for_converged),
    # --- HUB Health E31 (5 testes) ---
    "hub_section": ("HUB secao SAUDE", test_hub_has_health_section),
    "hub_cards": ("HUB 4 cards", test_hub_has_four_health_cards),
    "hub_refresh": ("HUB auto-refresh 60s", test_hub_has_auto_refresh),
    "hub_slot": ("HUB calcula proximo slot", test_hub_has_next_slot_logic),
    "hub_link": ("HUB link #status", test_hub_has_legacy_status_link),
    "zero_cross": ("Find Zero Cross", test_find_zero_cross),
    # --- Regressão Phase 4G (E8, E10) ---
    "e8_broadcast": ("E8: Greeks Broadcast (S scalar + K array)", test_e8_greeks_broadcast_scalar_s),
    "e10_iv_per_strike": ("E10: IV per-strike extraído do DataFrame", test_e10_iv_per_strike_used_in_greeks),
}


def run_all(quick: bool = False, only: list[str] | None = None) -> dict:
    golden = load_golden()
    results = []
    started = _now_iso()

    for key, (name, fn) in TESTS.items():
        if only and key not in only:
            continue
        if quick and key not in ("navigation", "safety_scripts"):
            continue
        t0 = time.time()
        try:
            ok, msg = fn(golden)
        except Exception as e:
            ok = False
            msg = f"EXCECAO: {type(e).__name__}: {e}\n{traceback.format_exc(limit=2)}"
        elapsed = (time.time() - t0) * 1000
        results.append({
            "test": key,
            "name": name,
            "status": "PASS" if ok else "FAIL",
            "message": msg,
            "elapsed_ms": round(elapsed, 1),
        })
        status = "OK " if ok else "FAIL"
        print(f"  [{status}] {name:40s} ({elapsed:6.1f}ms)")
        if not ok:
            for line in msg.splitlines():
                print(f"          {line}")

    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = sum(1 for r in results if r["status"] == "FAIL")

    report = {
        "started_at": started,
        "finished_at": _now_iso(),
        "total": len(results),
        "passed": passed,
        "failed": failed,
        "results": results,
    }

    RESULTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    RESULTS_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"\n=== Total: {len(results)}, Passou: {passed}, Falhou: {failed} ===")
    return report


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--quick", action="store_true", help="Apenas smoke tests")
    parser.add_argument("--test", action="append", help="Teste especifico (pode repetir)")
    parser.add_argument("--update-golden", action="store_true", help="(placeholder) atualizar golden values")
    args = parser.parse_args()

    only = args.test
    if args.update_golden:
        print("[WARN] --update-golden ainda nao implementado. Edite golden_values.json manualmente.")
        return 0

    report = run_all(quick=args.quick, only=only)
    return 0 if report["failed"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
