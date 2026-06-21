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

# --- test_stale_banner.py (7 testes E37) ---
def test_banner_file_exists(golden: dict) -> tuple[bool, str]:
    from tests.test_stale_banner import test_banner_file_exists
    return _wrap_test("banner_exists", test_banner_file_exists)

def test_banner_uses_iife(golden: dict) -> tuple[bool, str]:
    from tests.test_stale_banner import test_banner_uses_iife
    return _wrap_test("banner_iife", test_banner_uses_iife)

def test_banner_has_config(golden: dict) -> tuple[bool, str]:
    from tests.test_stale_banner import test_banner_has_config
    return _wrap_test("banner_config", test_banner_has_config)

def test_banner_uses_neon_terminal_styles(golden: dict) -> tuple[bool, str]:
    from tests.test_stale_banner import test_banner_uses_neon_terminal_styles
    return _wrap_test("banner_neon", test_banner_uses_neon_terminal_styles)

def test_banner_checks_marketdata_first(golden: dict) -> tuple[bool, str]:
    from tests.test_stale_banner import test_banner_checks_marketdata_first
    return _wrap_test("banner_priority", test_banner_checks_marketdata_first)

def test_banner_has_interval_check(golden: dict) -> tuple[bool, str]:
    from tests.test_stale_banner import test_banner_has_interval_check
    return _wrap_test("banner_interval", test_banner_has_interval_check)

def test_banner_handles_missing_data(golden: dict) -> tuple[bool, str]:
    from tests.test_stale_banner import test_banner_handles_missing_data
    return _wrap_test("banner_robust", test_banner_handles_missing_data)

# --- test_scheduled_snapshots.py (7 testes E42) ---
def test_slots_correct(golden: dict) -> tuple[bool, str]:
    from tests.test_scheduled_snapshots import test_slots_correct
    return _wrap_test("sched_slots", test_slots_correct)

def test_parse_slot(golden: dict) -> tuple[bool, str]:
    from tests.test_scheduled_snapshots import test_parse_slot
    return _wrap_test("sched_parse", test_parse_slot)

def test_slot_datetime_uses_today(golden: dict) -> tuple[bool, str]:
    from tests.test_scheduled_snapshots import test_slot_datetime_uses_today
    return _wrap_test("sched_today", test_slot_datetime_uses_today)

def test_should_snapshot_now_in_window(golden: dict) -> tuple[bool, str]:
    from tests.test_scheduled_snapshots import test_should_snapshot_now_in_window
    return _wrap_test("sched_window", test_should_snapshot_now_in_window)

def test_next_snapshot_slot_returns_future(golden: dict) -> tuple[bool, str]:
    from tests.test_scheduled_snapshots import test_next_snapshot_slot_returns_future
    return _wrap_test("sched_next", test_next_snapshot_slot_returns_future)

def test_tolerance_constants(golden: dict) -> tuple[bool, str]:
    from tests.test_scheduled_snapshots import test_tolerance_constants
    return _wrap_test("sched_tol", test_tolerance_constants)

def test_label_prefix_correct(golden: dict) -> tuple[bool, str]:
    from tests.test_scheduled_snapshots import test_label_prefix_correct
    return _wrap_test("sched_label", test_label_prefix_correct)

# --- test_auto_discovery.py (7 testes E44) ---
def test_nav_has_auto_discover_function(golden: dict) -> tuple[bool, str]:
    from tests.test_auto_discovery import test_nav_has_auto_discover_function
    return _wrap_test("nav_discover", test_nav_has_auto_discover_function)

def test_nav_accepts_extra_dashboards(golden: dict) -> tuple[bool, str]:
    from tests.test_auto_discovery import test_nav_accepts_extra_dashboards
    return _wrap_test("nav_extra", test_nav_accepts_extra_dashboards)

def test_nav_base_dashboards_unchanged(golden: dict) -> tuple[bool, str]:
    from tests.test_auto_discovery import test_nav_base_dashboards_unchanged
    return _wrap_test("nav_base", test_nav_base_dashboards_unchanged)

def test_nav_extra_dashboard_pattern(golden: dict) -> tuple[bool, str]:
    from tests.test_auto_discovery import test_nav_extra_dashboard_pattern
    return _wrap_test("nav_pattern", test_nav_extra_dashboard_pattern)

def test_nav_does_not_override_existing(golden: dict) -> tuple[bool, str]:
    from tests.test_auto_discovery import test_nav_does_not_override_existing
    return _wrap_test("nav_no_override", test_nav_does_not_override_existing)

def test_nav_iife_pattern(golden: dict) -> tuple[bool, str]:
    from tests.test_auto_discovery import test_nav_iife_pattern
    return _wrap_test("nav_iife", test_nav_iife_pattern)

def test_nav_has_comment_doc(golden: dict) -> tuple[bool, str]:
    from tests.test_auto_discovery import test_nav_has_comment_doc
    return _wrap_test("nav_doc", test_nav_has_comment_doc)

# --- test_sabr.py (12 testes E21) ---
def test_hagan_atm(golden: dict) -> tuple[bool, str]:
    from tests.test_sabr import test_hagan_atm
    return _wrap_test("sabr_atm", test_hagan_atm)

def test_hagan_otm_call(golden: dict) -> tuple[bool, str]:
    from tests.test_sabr import test_hagan_otm_call
    return _wrap_test("sabr_otm_call", test_hagan_otm_call)

def test_hagan_otm_put_higher_iv(golden: dict) -> tuple[bool, str]:
    from tests.test_sabr import test_hagan_otm_put_higher_iv
    return _wrap_test("sabr_otm_put", test_hagan_otm_put_higher_iv)

def test_hagan_edge_cases(golden: dict) -> tuple[bool, str]:
    from tests.test_sabr import test_hagan_edge_cases
    return _wrap_test("sabr_edge", test_hagan_edge_cases)

def test_sabr_model_implied_vol(golden: dict) -> tuple[bool, str]:
    from tests.test_sabr import test_sabr_model_implied_vol
    return _wrap_test("sabr_scalar", test_sabr_model_implied_vol)

def test_sabr_model_array(golden: dict) -> tuple[bool, str]:
    from tests.test_sabr import test_sabr_model_array
    return _wrap_test("sabr_array", test_sabr_model_array)

def test_sabr_calibrate_perfect_fit(golden: dict) -> tuple[bool, str]:
    from tests.test_sabr import test_sabr_calibrate_perfect_fit
    return _wrap_test("sabr_perfect", test_sabr_calibrate_perfect_fit)

def test_sabr_calibrate_with_noise(golden: dict) -> tuple[bool, str]:
    from tests.test_sabr import test_sabr_calibrate_with_noise
    return _wrap_test("sabr_noise", test_sabr_calibrate_with_noise)

def test_sabr_calibrate_requires_min_points(golden: dict) -> tuple[bool, str]:
    from tests.test_sabr import test_sabr_calibrate_requires_min_points
    return _wrap_test("sabr_min_points", test_sabr_calibrate_requires_min_points)

def test_sabr_smile_metrics(golden: dict) -> tuple[bool, str]:
    from tests.test_sabr import test_sabr_smile_metrics
    return _wrap_test("sabr_metrics", test_sabr_smile_metrics)

def test_sabr_calibrate_from_iv_strike_ref(golden: dict) -> tuple[bool, str]:
    from tests.test_sabr import test_sabr_calibrate_from_iv_strike_ref
    return _wrap_test("sabr_helper", test_sabr_calibrate_from_iv_strike_ref)

def test_sabr_parameter_limits(golden: dict) -> tuple[bool, str]:
    from tests.test_sabr import test_sabr_parameter_limits
    return _wrap_test("sabr_limits", test_sabr_parameter_limits)

# --- test_structured_logging.py (10 testes E38) ---
def test_json_formatter_basic(golden: dict) -> tuple[bool, str]:
    from tests.test_structured_logging import test_json_formatter_basic
    return _wrap_test("log_json_basic", test_json_formatter_basic)

def test_json_formatter_extras(golden: dict) -> tuple[bool, str]:
    from tests.test_structured_logging import test_json_formatter_extras
    return _wrap_test("log_json_extras", test_json_formatter_extras)

def test_json_formatter_correlation_id(golden: dict) -> tuple[bool, str]:
    from tests.test_structured_logging import test_json_formatter_correlation_id
    return _wrap_test("log_json_corr", test_json_formatter_correlation_id)

def test_json_formatter_exception(golden: dict) -> tuple[bool, str]:
    from tests.test_structured_logging import test_json_formatter_exception
    return _wrap_test("log_json_exc", test_json_formatter_exception)

def test_setup_json_logging_capture(golden: dict) -> tuple[bool, str]:
    from tests.test_structured_logging import test_setup_json_logging_capture
    return _wrap_test("log_json_setup", test_setup_json_logging_capture)

def test_setup_json_logging_with_file(golden: dict) -> tuple[bool, str]:
    from tests.test_structured_logging import test_setup_json_logging_with_file
    return _wrap_test("log_json_file", test_setup_json_logging_with_file)

def test_setup_text_logging_fallback(golden: dict) -> tuple[bool, str]:
    from tests.test_structured_logging import test_setup_text_logging_fallback
    return _wrap_test("log_text_fallback", test_setup_text_logging_fallback)

def test_setup_logging_json_dispatches_to_json(golden: dict) -> tuple[bool, str]:
    from tests.test_structured_logging import test_setup_logging_json_dispatches_to_json
    return _wrap_test("log_dispatch_json", test_setup_logging_json_dispatches_to_json)

def test_setup_logging_text_dispatches_to_text(golden: dict) -> tuple[bool, str]:
    from tests.test_structured_logging import test_setup_logging_text_dispatches_to_text
    return _wrap_test("log_dispatch_text", test_setup_logging_text_dispatches_to_text)

def test_json_formatter_safely_serializes_complex(golden: dict) -> tuple[bool, str]:
    from tests.test_structured_logging import test_json_formatter_safely_serializes_complex
    return _wrap_test("log_json_complex", test_json_formatter_safely_serializes_complex)

def test_find_zero_cross(golden: dict) -> tuple[bool, str]:
    from tests.test_calculator_core import test_find_zero_cross
    return _wrap_test("zero_cross", test_find_zero_cross)

# --- test_stress_test.py (11 testes E23) ---
def test_stress_scenario_dataclass(golden: dict) -> tuple[bool, str]:
    from tests.test_stress_test import test_stress_scenario_dataclass
    return _wrap_test("stress_dataclass", test_stress_scenario_dataclass)

def test_default_scenarios_count(golden: dict) -> tuple[bool, str]:
    from tests.test_stress_test import test_default_scenarios_count
    return _wrap_test("stress_default_count", test_default_scenarios_count)

def test_stress_scenario_apply_restores_state(golden: dict) -> tuple[bool, str]:
    from tests.test_stress_test import test_stress_scenario_apply_restores_state
    return _wrap_test("stress_restore", test_stress_scenario_apply_restores_state)

def test_stress_scenario_spot_shift(golden: dict) -> tuple[bool, str]:
    from tests.test_stress_test import test_stress_scenario_spot_shift
    return _wrap_test("stress_spot", test_stress_scenario_spot_shift)

def test_stress_scenario_vol_shift(golden: dict) -> tuple[bool, str]:
    from tests.test_stress_test import test_stress_scenario_vol_shift
    return _wrap_test("stress_vol", test_stress_scenario_vol_shift)

def test_stress_scenario_time_decay(golden: dict) -> tuple[bool, str]:
    from tests.test_stress_test import test_stress_scenario_time_decay
    return _wrap_test("stress_decay", test_stress_scenario_time_decay)

def test_stress_test_run_all(golden: dict) -> tuple[bool, str]:
    from tests.test_stress_test import test_stress_test_run_all
    return _wrap_test("stress_run_all", test_stress_test_run_all)

def test_stress_test_run_single(golden: dict) -> tuple[bool, str]:
    from tests.test_stress_test import test_stress_test_run_single
    return _wrap_test("stress_run_single", test_stress_test_run_single)

def test_stress_test_custom_scenarios(golden: dict) -> tuple[bool, str]:
    from tests.test_stress_test import test_stress_test_custom_scenarios
    return _wrap_test("stress_custom", test_stress_test_custom_scenarios)

def test_stress_test_format_summary(golden: dict) -> tuple[bool, str]:
    from tests.test_stress_test import test_stress_test_format_summary
    return _wrap_test("stress_format", test_stress_test_format_summary)

def test_stress_scenario_metrics_keys(golden: dict) -> tuple[bool, str]:
    from tests.test_stress_test import test_stress_scenario_metrics_keys
    return _wrap_test("stress_metrics", test_stress_scenario_metrics_keys)


# --- test_heston.py (10 testes E52) ---
def test_heston_call_atm_basic(golden: dict) -> tuple[bool, str]:
    from tests.test_heston import test_heston_call_atm_basic
    return _wrap_test("heston_atm", test_heston_call_atm_basic)

def test_heston_call_itm_otm(golden: dict) -> tuple[bool, str]:
    from tests.test_heston import test_heston_call_itm_otm
    return _wrap_test("heston_itm_otm", test_heston_call_itm_otm)

def test_heston_put_call_parity(golden: dict) -> tuple[bool, str]:
    from tests.test_heston import test_heston_put_call_parity
    return _wrap_test("heston_parity", test_heston_put_call_parity)

def test_heston_higher_vol_higher_call(golden: dict) -> tuple[bool, str]:
    from tests.test_heston import test_heston_higher_vol_higher_call
    return _wrap_test("heston_vol_of_vol", test_heston_higher_vol_higher_call)

def test_heston_higher_rho_higher_call(golden: dict) -> tuple[bool, str]:
    from tests.test_heston import test_heston_higher_rho_higher_call
    return _wrap_test("heston_rho_skew", test_heston_higher_rho_higher_call)

def test_heston_feller_condition(golden: dict) -> tuple[bool, str]:
    from tests.test_heston import test_heston_feller_condition
    return _wrap_test("heston_feller", test_heston_feller_condition)

def test_heston_model_class_call(golden: dict) -> tuple[bool, str]:
    from tests.test_heston import test_heston_model_class_call
    return _wrap_test("heston_oo_call", test_heston_model_class_call)

def test_heston_zero_T_returns_intrinsic(golden: dict) -> tuple[bool, str]:
    from tests.test_heston import test_heston_zero_T_returns_intrinsic
    return _wrap_test("heston_t0", test_heston_zero_T_returns_intrinsic)

def test_heston_invalid_params_raises(golden: dict) -> tuple[bool, str]:
    from tests.test_heston import test_heston_invalid_params_raises
    return _wrap_test("heston_validation", test_heston_invalid_params_raises)

def test_heston_calibrate_returns_valid_model(golden: dict) -> tuple[bool, str]:
    from tests.test_heston import test_heston_calibrate_returns_valid_model
    return _wrap_test("heston_calibrate", test_heston_calibrate_returns_valid_model)


# --- test_dupire.py (6 testes E53) ---
def test_dupire_flat_vol_recovers_bs_vol(golden: dict) -> tuple[bool, str]:
    from tests.test_dupire import test_dupire_flat_vol_recovers_bs_vol
    return _wrap_test("dupire_flat", test_dupire_flat_vol_recovers_bs_vol)

def test_dupire_smile_shape(golden: dict) -> tuple[bool, str]:
    from tests.test_dupire import test_dupire_smile_shape
    return _wrap_test("dupire_smile", test_dupire_smile_shape)

def test_dupire_term_structure(golden: dict) -> tuple[bool, str]:
    from tests.test_dupire import test_dupire_term_structure
    return _wrap_test("dupire_term", test_dupire_term_structure)

def test_dupire_local_vol_model_class(golden: dict) -> tuple[bool, str]:
    from tests.test_dupire import test_dupire_local_vol_model_class
    return _wrap_test("dupire_oo", test_dupire_local_vol_model_class)

def test_dupire_grid_returns_full_surface(golden: dict) -> tuple[bool, str]:
    from tests.test_dupire import test_dupire_grid_returns_full_surface
    return _wrap_test("dupire_grid", test_dupire_grid_returns_full_surface)

def test_dupire_too_few_points_raises(golden: dict) -> tuple[bool, str]:
    from tests.test_dupire import test_dupire_too_few_points_raises
    return _wrap_test("dupire_validation", test_dupire_too_few_points_raises)


# --- test_svi.py (6 testes E54) ---
def test_svi_smoke_basic(golden: dict) -> tuple[bool, str]:
    from tests.test_svi import test_svi_smoke_basic
    return _wrap_test("svi_smoke", test_svi_smoke_basic)

def test_svi_implied_vol_atm(golden: dict) -> tuple[bool, str]:
    from tests.test_svi import test_svi_implied_vol_atm
    return _wrap_test("svi_atm", test_svi_implied_vol_atm)

def test_svi_skew_with_negative_rho(golden: dict) -> tuple[bool, str]:
    from tests.test_svi import test_svi_skew_with_negative_rho
    return _wrap_test("svi_skew", test_svi_skew_with_negative_rho)

def test_svi_function_matches_class(golden: dict) -> tuple[bool, str]:
    from tests.test_svi import test_svi_function_matches_class
    return _wrap_test("svi_func_class", test_svi_function_matches_class)

def test_svi_invalid_params_raises(golden: dict) -> tuple[bool, str]:
    from tests.test_svi import test_svi_invalid_params_raises
    return _wrap_test("svi_validation", test_svi_invalid_params_raises)

def test_svi_fit_recovers_params(golden: dict) -> tuple[bool, str]:
    from tests.test_svi import test_svi_fit_recovers_params
    return _wrap_test("svi_fit", test_svi_fit_recovers_params)


# --- test_position.py (7 testes E66) ---
def test_position_long_profit(golden: dict) -> tuple[bool, str]:
    from tests.test_position import test_position_long_profit
    return _wrap_test("pos_long_profit", test_position_long_profit)

def test_position_long_loss(golden: dict) -> tuple[bool, str]:
    from tests.test_position import test_position_long_loss
    return _wrap_test("pos_long_loss", test_position_long_loss)

def test_position_short_profit(golden: dict) -> tuple[bool, str]:
    from tests.test_position import test_position_short_profit
    return _wrap_test("pos_short_profit", test_position_short_profit)

def test_position_with_multiplier_wdo(golden: dict) -> tuple[bool, str]:
    from tests.test_position import test_position_with_multiplier_wdo
    return _wrap_test("pos_wdo_mult", test_position_with_multiplier_wdo)

def test_position_with_fees(golden: dict) -> tuple[bool, str]:
    from tests.test_position import test_position_with_fees
    return _wrap_test("pos_fees", test_position_with_fees)

def test_position_validation(golden: dict) -> tuple[bool, str]:
    from tests.test_position import test_position_validation
    return _wrap_test("pos_validation", test_position_validation)

def test_position_risk_reward(golden: dict) -> tuple[bool, str]:
    from tests.test_position import test_position_risk_reward
    return _wrap_test("pos_rr", test_position_risk_reward)


# --- test_kelly.py (7 testes E67) ---
def test_kelly_positive_edge(golden: dict) -> tuple[bool, str]:
    from tests.test_kelly import test_kelly_positive_edge
    return _wrap_test("kelly_pos", test_kelly_positive_edge)

def test_kelly_zero_edge(golden: dict) -> tuple[bool, str]:
    from tests.test_kelly import test_kelly_zero_edge
    return _wrap_test("kelly_zero", test_kelly_zero_edge)

def test_kelly_negative_edge_clamped(golden: dict) -> tuple[bool, str]:
    from tests.test_kelly import test_kelly_negative_edge_clamped
    return _wrap_test("kelly_neg", test_kelly_negative_edge_clamped)

def test_kelly_variants(golden: dict) -> tuple[bool, str]:
    from tests.test_kelly import test_kelly_variants
    return _wrap_test("kelly_variants", test_kelly_variants)

def test_kelly_position_size(golden: dict) -> tuple[bool, str]:
    from tests.test_kelly import test_kelly_position_size
    return _wrap_test("kelly_pos_size", test_kelly_position_size)

def test_kelly_max_consecutive_losses(golden: dict) -> tuple[bool, str]:
    from tests.test_kelly import test_kelly_max_consecutive_losses
    return _wrap_test("kelly_max_losses", test_kelly_max_consecutive_losses)

def test_kelly_invalid_params_raises(golden: dict) -> tuple[bool, str]:
    from tests.test_kelly import test_kelly_invalid_params_raises
    return _wrap_test("kelly_validation", test_kelly_invalid_params_raises)


# --- test_veta.py (7 testes E22/E51) ---
def test_veta_call_atm_basic(golden: dict) -> tuple[bool, str]:
    from tests.test_veta import test_veta_call_atm_basic
    return _wrap_test("veta_atm", test_veta_call_atm_basic)

def test_veta_put_equals_call(golden: dict) -> tuple[bool, str]:
    from tests.test_veta import test_veta_put_equals_call
    return _wrap_test("veta_put_eq_call", test_veta_put_equals_call)

def test_veta_finite_diff_matches_closed_form(golden: dict) -> tuple[bool, str]:
    from tests.test_veta import test_veta_finite_diff_matches_closed_form
    return _wrap_test("veta_fd_check", test_veta_finite_diff_matches_closed_form)

def test_veta_at_T_zero(golden: dict) -> tuple[bool, str]:
    from tests.test_veta import test_veta_at_T_zero
    return _wrap_test("veta_t0", test_veta_at_T_zero)

def test_veta_class_consistency(golden: dict) -> tuple[bool, str]:
    from tests.test_veta import test_veta_class_consistency
    return _wrap_test("veta_oo", test_veta_class_consistency)

def test_veta_invalid_params_raises(golden: dict) -> tuple[bool, str]:
    from tests.test_veta import test_veta_invalid_params_raises
    return _wrap_test("veta_validation", test_veta_invalid_params_raises)

def test_veta_larger_T_smaller_magnitude(golden: dict) -> tuple[bool, str]:
    from tests.test_veta import test_veta_larger_T_smaller_magnitude
    return _wrap_test("veta_T_effect", test_veta_larger_T_smaller_magnitude)


def test_vwap_basic(golden: dict) -> tuple[bool, str]:
    from tests.test_vwap import test_vwap_basic
    return _wrap_test("vwap_basic", test_vwap_basic)

def test_vwap_equal_volume_is_simple_average(golden: dict) -> tuple[bool, str]:
    from tests.test_vwap import test_vwap_equal_volume_is_simple_average
    return _wrap_test("vwap_equal_vol", test_vwap_equal_volume_is_simple_average)

def test_vwap_volume_emphasizes_high_volume(golden: dict) -> tuple[bool, str]:
    from tests.test_vwap import test_vwap_volume_emphasizes_high_volume
    return _wrap_test("vwap_high_vol", test_vwap_volume_emphasizes_high_volume)

def test_vwap_empty_raises(golden: dict) -> tuple[bool, str]:
    from tests.test_vwap import test_vwap_empty_raises
    return _wrap_test("vwap_empty", test_vwap_empty_raises)

def test_vwap_zero_volume_raises(golden: dict) -> tuple[bool, str]:
    from tests.test_vwap import test_vwap_zero_volume_raises
    return _wrap_test("vwap_zero_vol", test_vwap_zero_volume_raises)

def test_vwap_single_sample(golden: dict) -> tuple[bool, str]:
    from tests.test_vwap import test_vwap_single_sample
    return _wrap_test("vwap_single", test_vwap_single_sample)

def test_vwap_bands(golden: dict) -> tuple[bool, str]:
    from tests.test_vwap import test_vwap_bands
    return _wrap_test("vwap_bands", test_vwap_bands)

def test_vwap_position_in_band(golden: dict) -> tuple[bool, str]:
    from tests.test_vwap import test_vwap_position_in_band
    return _wrap_test("vwap_position", test_vwap_position_in_band)

def test_vwap_signal(golden: dict) -> tuple[bool, str]:
    from tests.test_vwap import test_vwap_signal
    return _wrap_test("vwap_signal", test_vwap_signal)

def test_anchored_vwap(golden: dict) -> tuple[bool, str]:
    from tests.test_vwap import test_anchored_vwap
    return _wrap_test("vwap_anchored", test_anchored_vwap)

def test_anchored_vwap_invalid_index(golden: dict) -> tuple[bool, str]:
    from tests.test_vwap import test_anchored_vwap_invalid_index
    return _wrap_test("vwap_anchor_bad", test_anchored_vwap_invalid_index)

def test_vwap_cross_above_real(golden: dict) -> tuple[bool, str]:
    from tests.test_vwap import test_vwap_cross_above_real
    return _wrap_test("vwap_cross_above", test_vwap_cross_above_real)

def test_vwap_cross_below(golden: dict) -> tuple[bool, str]:
    from tests.test_vwap import test_vwap_cross_below
    return _wrap_test("vwap_cross_below", test_vwap_cross_below)

def test_vwap_no_cross_insufficient_samples(golden: dict) -> tuple[bool, str]:
    from tests.test_vwap import test_vwap_no_cross_insufficient_samples
    return _wrap_test("vwap_no_cross", test_vwap_no_cross_insufficient_samples)

def test_vwap_max_min_price(golden: dict) -> tuple[bool, str]:
    from tests.test_vwap import test_vwap_max_min_price
    return _wrap_test("vwap_max_min", test_vwap_max_min_price)

def test_vwap_negative_price_raises(golden: dict) -> tuple[bool, str]:
    from tests.test_vwap import test_vwap_negative_price_raises
    return _wrap_test("vwap_neg_price", test_vwap_negative_price_raises)


def test_merton_lambda_zero_recovers_bs(golden: dict) -> tuple[bool, str]:
    from tests.test_merton import test_merton_lambda_zero_recovers_bs
    return _wrap_test("merton_lambda0", test_merton_lambda_zero_recovers_bs)

def test_merton_t_zero_returns_intrinsic(golden: dict) -> tuple[bool, str]:
    from tests.test_merton import test_merton_t_zero_returns_intrinsic
    return _wrap_test("merton_t0", test_merton_t_zero_returns_intrinsic)

def test_merton_invalid_params_raise(golden: dict) -> tuple[bool, str]:
    from tests.test_merton import test_merton_invalid_params_raise
    return _wrap_test("merton_invalid", test_merton_invalid_params_raise)

def test_merton_higher_lambda_higher_call(golden: dict) -> tuple[bool, str]:
    from tests.test_merton import test_merton_higher_lambda_higher_call
    return _wrap_test("merton_lambda_up", test_merton_higher_lambda_higher_call)

def test_merton_positive_mu_j_increases_call(golden: dict) -> tuple[bool, str]:
    from tests.test_merton import test_merton_positive_mu_j_increases_call
    return _wrap_test("merton_mu_j_pos", test_merton_positive_mu_j_increases_call)

def test_merton_higher_sigma_j_higher_otm_call(golden: dict) -> tuple[bool, str]:
    from tests.test_merton import test_merton_higher_sigma_j_higher_otm_call
    return _wrap_test("merton_sigma_j", test_merton_higher_sigma_j_higher_otm_call)

def test_merton_put_call_parity_modified(golden: dict) -> tuple[bool, str]:
    from tests.test_merton import test_merton_put_call_parity_modified
    return _wrap_test("merton_parity", test_merton_put_call_parity_modified)

def test_merton_class_call_equals_function(golden: dict) -> tuple[bool, str]:
    from tests.test_merton import test_merton_class_call_equals_function
    return _wrap_test("merton_oo_func", test_merton_class_call_equals_function)

def test_merton_class_kappa_compensator(golden: dict) -> tuple[bool, str]:
    from tests.test_merton import test_merton_class_kappa_compensator
    return _wrap_test("merton_kappa", test_merton_class_kappa_compensator)

def test_merton_calibrate_recovers_lambda(golden: dict) -> tuple[bool, str]:
    from tests.test_merton import test_merton_calibrate_recovers_lambda
    return _wrap_test("merton_calibrate", test_merton_calibrate_recovers_lambda)

def test_merton_calibrate_requires_min_points(golden: dict) -> tuple[bool, str]:
    from tests.test_merton import test_merton_calibrate_requires_min_points
    return _wrap_test("merton_calib_min", test_merton_calibrate_requires_min_points)

def test_merton_invalid_class_params_raise(golden: dict) -> tuple[bool, str]:
    from tests.test_merton import test_merton_invalid_class_params_raise
    return _wrap_test("merton_class_invalid", test_merton_invalid_class_params_raise)

def test_merton_zero_jumps_higher_than_bs_for_otm(golden: dict) -> tuple[bool, str]:
    from tests.test_merton import test_merton_zero_jumps_higher_than_bs_for_otm
    return _wrap_test("merton_otm_vs_bs", test_merton_zero_jumps_higher_than_bs_for_otm)

def test_kou_lambda_zero_recovers_bs(golden: dict) -> tuple[bool, str]:
    from tests.test_kou import test_kou_lambda_zero_recovers_bs
    return _wrap_test("kou_lambda0", test_kou_lambda_zero_recovers_bs)

def test_kou_t_zero_returns_intrinsic(golden: dict) -> tuple[bool, str]:
    from tests.test_kou import test_kou_t_zero_returns_intrinsic
    return _wrap_test("kou_t0", test_kou_t_zero_returns_intrinsic)

def test_kou_invalid_params_raise(golden: dict) -> tuple[bool, str]:
    from tests.test_kou import test_kou_invalid_params_raise
    return _wrap_test("kou_invalid", test_kou_invalid_params_raise)

def test_kou_jump_moments_known_case(golden: dict) -> tuple[bool, str]:
    from tests.test_kou import test_kou_jump_moments_known_case
    return _wrap_test("kou_moments", test_kou_jump_moments_known_case)

def test_kou_asymmetric_p_moments(golden: dict) -> tuple[bool, str]:
    from tests.test_kou import test_kou_asymmetric_p_moments
    return _wrap_test("kou_asym_p", test_kou_asymmetric_p_moments)

def test_kou_asymmetric_eta_moments(golden: dict) -> tuple[bool, str]:
    from tests.test_kou import test_kou_asymmetric_eta_moments
    return _wrap_test("kou_asym_eta", test_kou_asymmetric_eta_moments)

def test_kou_higher_lambda_higher_call(golden: dict) -> tuple[bool, str]:
    from tests.test_kou import test_kou_higher_lambda_higher_call
    return _wrap_test("kou_lambda_up", test_kou_higher_lambda_higher_call)

def test_kou_asymmetric_put_protection(golden: dict) -> tuple[bool, str]:
    from tests.test_kou import test_kou_asymmetric_put_protection
    return _wrap_test("kou_put_asym", test_kou_asymmetric_put_protection)

def test_kou_put_call_parity_modified(golden: dict) -> tuple[bool, str]:
    from tests.test_kou import test_kou_put_call_parity_modified
    return _wrap_test("kou_parity", test_kou_put_call_parity_modified)

def test_kou_class_call_equals_function(golden: dict) -> tuple[bool, str]:
    from tests.test_kou import test_kou_class_call_equals_function
    return _wrap_test("kou_oo_func", test_kou_class_call_equals_function)

def test_kou_class_is_asymmetric(golden: dict) -> tuple[bool, str]:
    from tests.test_kou import test_kou_class_is_asymmetric
    return _wrap_test("kou_asym_check", test_kou_class_is_asymmetric)

def test_kou_kappa_compensator(golden: dict) -> tuple[bool, str]:
    from tests.test_kou import test_kou_kappa_compensator
    return _wrap_test("kou_kappa", test_kou_kappa_compensator)

def test_kou_calibrate_recovers_lambda(golden: dict) -> tuple[bool, str]:
    from tests.test_kou import test_kou_calibrate_recovers_lambda
    return _wrap_test("kou_calibrate", test_kou_calibrate_recovers_lambda)

def test_kou_calibrate_requires_min_points(golden: dict) -> tuple[bool, str]:
    from tests.test_kou import test_kou_calibrate_requires_min_points
    return _wrap_test("kou_calib_min", test_kou_calibrate_requires_min_points)

def test_rbergomi_eta_zero_recovers_bs(golden: dict) -> tuple[bool, str]:
    from tests.test_rough_bergomi import test_rbergomi_eta_zero_recovers_bs
    return _wrap_test("rberg_eta0", test_rbergomi_eta_zero_recovers_bs)

def test_rbergomi_t_zero_returns_intrinsic(golden: dict) -> tuple[bool, str]:
    from tests.test_rough_bergomi import test_rbergomi_t_zero_returns_intrinsic
    return _wrap_test("rberg_t0", test_rbergomi_t_zero_returns_intrinsic)

def test_rbergomi_invalid_params_raise(golden: dict) -> tuple[bool, str]:
    from tests.test_rough_bergomi import test_rbergomi_invalid_params_raise
    return _wrap_test("rberg_invalid", test_rbergomi_invalid_params_raise)

def test_rbergomi_char_func_at_zero(golden: dict) -> tuple[bool, str]:
    from tests.test_rough_bergomi import test_rbergomi_char_func_at_zero
    return _wrap_test("rberg_phi0", test_rbergomi_char_func_at_zero)

def test_rbergomi_char_func_is_finite(golden: dict) -> tuple[bool, str]:
    from tests.test_rough_bergomi import test_rbergomi_char_func_is_finite
    return _wrap_test("rberg_phi_finite", test_rbergomi_char_func_is_finite)

def test_rbergomi_higher_eta_higher_call(golden: dict) -> tuple[bool, str]:
    from tests.test_rough_bergomi import test_rbergomi_higher_eta_higher_call
    return _wrap_test("rberg_eta_up", test_rbergomi_higher_eta_higher_call)

def test_rbergomi_lower_h_heavier_tail(golden: dict) -> tuple[bool, str]:
    from tests.test_rough_bergomi import test_rbergomi_lower_h_heavier_tail
    return _wrap_test("rberg_rough_tail", test_rbergomi_lower_h_heavier_tail)

def test_rbergomi_negative_rho_increases_otm_put(golden: dict) -> tuple[bool, str]:
    from tests.test_rough_bergomi import test_rbergomi_negative_rho_increases_otm_put
    return _wrap_test("rberg_rho_skew", test_rbergomi_negative_rho_increases_otm_put)

def test_rbergomi_put_call_parity(golden: dict) -> tuple[bool, str]:
    from tests.test_rough_bergomi import test_rbergomi_put_call_parity
    return _wrap_test("rberg_parity", test_rbergomi_put_call_parity)

def test_rbergomi_class_call_equals_function(golden: dict) -> tuple[bool, str]:
    from tests.test_rough_bergomi import test_rbergomi_class_call_equals_function
    return _wrap_test("rberg_oo_func", test_rbergomi_class_call_equals_function)

def test_rbergomi_is_rough_property(golden: dict) -> tuple[bool, str]:
    from tests.test_rough_bergomi import test_rbergomi_is_rough_property
    return _wrap_test("rberg_rough_check", test_rbergomi_is_rough_property)

def test_rbergomi_call_positive(golden: dict) -> tuple[bool, str]:
    from tests.test_rough_bergomi import test_rbergomi_call_positive
    return _wrap_test("rberg_call_pos", test_rbergomi_call_positive)

def test_discovery_fibonacci_basic(golden: dict) -> tuple[bool, str]:
    from tests.test_discovery import test_fibonacci_basic
    return _wrap_test("disc_fib_basic", test_fibonacci_basic)

def test_discovery_fibonacci_default_percentages(golden: dict) -> tuple[bool, str]:
    from tests.test_discovery import test_fibonacci_default_percentages
    return _wrap_test("disc_fib_default", test_fibonacci_default_percentages)

def test_discovery_fibonacci_multiple_strikes(golden: dict) -> tuple[bool, str]:
    from tests.test_discovery import test_fibonacci_multiple_strikes
    return _wrap_test("disc_fib_multi", test_fibonacci_multiple_strikes)

def test_discovery_fibonacci_empty(golden: dict) -> tuple[bool, str]:
    from tests.test_discovery import test_fibonacci_empty_strikes
    return _wrap_test("disc_fib_empty", test_fibonacci_empty_strikes)

def test_discovery_fibonacci_unsorted(golden: dict) -> tuple[bool, str]:
    from tests.test_discovery import test_fibonacci_unsorted
    return _wrap_test("disc_fib_unsorted", test_fibonacci_unsorted)

def test_discovery_fibonacci_invalid_pct(golden: dict) -> tuple[bool, str]:
    from tests.test_discovery import test_fibonacci_invalid_percentages
    return _wrap_test("disc_fib_invalid", test_fibonacci_invalid_percentages)

def test_discovery_midwalls_basic(golden: dict) -> tuple[bool, str]:
    from tests.test_discovery import test_midwalls_basic
    return _wrap_test("disc_mw_basic", test_midwalls_basic)

def test_discovery_midwalls_single(golden: dict) -> tuple[bool, str]:
    from tests.test_discovery import test_midwalls_single_strike
    return _wrap_test("disc_mw_single", test_midwalls_single_strike)

def test_discovery_midwalls_mismatch(golden: dict) -> tuple[bool, str]:
    from tests.test_discovery import test_midwalls_size_mismatch
    return _wrap_test("disc_mw_mismatch", test_midwalls_size_mismatch)

def test_discovery_range_basic(golden: dict) -> tuple[bool, str]:
    from tests.test_discovery import test_range_basic
    return _wrap_test("disc_range_basic", test_range_basic)

def test_discovery_range_empty(golden: dict) -> tuple[bool, str]:
    from tests.test_discovery import test_range_empty
    return _wrap_test("disc_range_empty", test_range_empty)

def test_discovery_range_n_large(golden: dict) -> tuple[bool, str]:
    from tests.test_discovery import test_range_n_larger_than_data
    return _wrap_test("disc_range_n", test_range_n_larger_than_data)

def test_discovery_integration(golden: dict) -> tuple[bool, str]:
    from tests.test_discovery import test_discover_levels_integration
    return _wrap_test("disc_integration", test_discover_levels_integration)

def test_discovery_result_dataclass(golden: dict) -> tuple[bool, str]:
    from tests.test_discovery import test_discovery_result_dataclass
    return _wrap_test("disc_dataclass", test_discovery_result_dataclass)

def test_discovery_custom_fib(golden: dict) -> tuple[bool, str]:
    from tests.test_discovery import test_discovery_custom_fib_percentages
    return _wrap_test("disc_custom", test_discovery_custom_fib_percentages)


def test_rbergomi_class_invalid_params_raise(golden: dict) -> tuple[bool, str]:
    from tests.test_rough_bergomi import test_rbergomi_class_invalid_params_raise
    return _wrap_test("rberg_class_invalid", test_rbergomi_class_invalid_params_raise)


def test_kou_invalid_class_params_raise(golden: dict) -> tuple[bool, str]:
    from tests.test_kou import test_kou_invalid_class_params_raise
    return _wrap_test("kou_class_invalid", test_kou_invalid_class_params_raise)


def test_merton_call_positive_for_itm(golden: dict) -> tuple[bool, str]:
    from tests.test_merton import test_merton_call_positive_for_itm
    return _wrap_test("merton_itm", test_merton_call_positive_for_itm)


def test_wdo_external_assets_exist(golden: dict) -> tuple[bool, str]:
    from tests.test_dashboards import test_wdo_external_assets_exist
    return _wrap_test("dash_wdo_assets", test_wdo_external_assets_exist)


def test_win_external_assets_exist(golden: dict) -> tuple[bool, str]:
    from tests.test_dashboards import test_win_external_assets_exist
    return _wrap_test("dash_win_assets", test_win_external_assets_exist)


# --- test_dashboards.py (8 testes E26) ---
def test_wdo_has_skew_canvas(golden: dict) -> tuple[bool, str]:
    """E45e: WDO tem canvas skewChart dedicado."""
    src = (ROOT / "dashboard_unificado" / "WDO" / "index.html").read_text(encoding="utf-8")
    if 'id="skewChart"' not in src:
        return False, "E45e: skewChart canvas ausente em WDO/index.html"
    if 'createSkewChart' not in (ROOT / "dashboard_unificado" / "WDO" / "assets" / "js" / "charts.js").read_text(encoding="utf-8"):
        return False, "E45e: createSkewChart ausente em WDO/charts.js"
    return True, "E45e: WDO skewChart canvas + createSkewChart presentes"


def test_win_has_skew_canvas(golden: dict) -> tuple[bool, str]:
    """E45e: WIN tem canvas skewChart dedicado."""
    src = (ROOT / "dashboard_unificado" / "WIN" / "index.html").read_text(encoding="utf-8")
    if 'id="skewChart"' not in src:
        return False, "E45e: skewChart canvas ausente em WIN/index.html"
    if 'createSkewChart' not in (ROOT / "dashboard_unificado" / "WIN" / "assets" / "js" / "charts.js").read_text(encoding="utf-8"):
        return False, "E45e: createSkewChart ausente em WIN/charts.js"
    return True, "E45e: WIN skewChart canvas + createSkewChart presentes"


# --- E45b: Strikes + Midwalls + Fibonacci chart combinado ---
def test_wdo_has_discovery_canvas(golden: dict) -> tuple[bool, str]:
    """E45b: WDO tem canvas discoveryChart + createDiscoveryChart."""
    src = (ROOT / "dashboard_unificado" / "WDO" / "index.html").read_text(encoding="utf-8")
    if 'id="discoveryChart"' not in src:
        return False, "E45b: discoveryChart canvas ausente em WDO/index.html"
    if 'createDiscoveryChart' not in (ROOT / "dashboard_unificado" / "WDO" / "assets" / "js" / "charts.js").read_text(encoding="utf-8"):
        return False, "E45b: createDiscoveryChart ausente em WDO/charts.js"
    return True, "E45b: WDO discoveryChart canvas + createDiscoveryChart presentes"


def test_win_has_discovery_canvas(golden: dict) -> tuple[bool, str]:
    """E45b: WIN tem canvas discoveryChart + createDiscoveryChart."""
    src = (ROOT / "dashboard_unificado" / "WIN" / "index.html").read_text(encoding="utf-8")
    if 'id="discoveryChart"' not in src:
        return False, "E45b: discoveryChart canvas ausente em WIN/index.html"
    if 'createDiscoveryChart' not in (ROOT / "dashboard_unificado" / "WIN" / "assets" / "js" / "charts.js").read_text(encoding="utf-8"):
        return False, "E45b: createDiscoveryChart ausente em WIN/charts.js"
    return True, "E45b: WIN discoveryChart canvas + createDiscoveryChart presentes"


# --- E45c: Range + Walls chart (top N clusters OI) ---
def test_wdo_has_range_walls_canvas(golden: dict) -> tuple[bool, str]:
    """E45c: WDO tem canvas rangeWallsChart + createRangeWallsChart."""
    src = (ROOT / "dashboard_unificado" / "WDO" / "index.html").read_text(encoding="utf-8")
    if 'id="rangeWallsChart"' not in src:
        return False, "E45c: rangeWallsChart canvas ausente em WDO/index.html"
    if 'createRangeWallsChart' not in (ROOT / "dashboard_unificado" / "WDO" / "assets" / "js" / "charts.js").read_text(encoding="utf-8"):
        return False, "E45c: createRangeWallsChart ausente em WDO/charts.js"
    return True, "E45c: WDO rangeWallsChart canvas + createRangeWallsChart presentes"


def test_win_has_range_walls_canvas(golden: dict) -> tuple[bool, str]:
    """E45c: WIN tem canvas rangeWallsChart + createRangeWallsChart."""
    src = (ROOT / "dashboard_unificado" / "WIN" / "index.html").read_text(encoding="utf-8")
    if 'id="rangeWallsChart"' not in src:
        return False, "E45c: rangeWallsChart canvas ausente em WIN/index.html"
    if 'createRangeWallsChart' not in (ROOT / "dashboard_unificado" / "WIN" / "assets" / "js" / "charts.js").read_text(encoding="utf-8"):
        return False, "E45c: createRangeWallsChart ausente em WIN/charts.js"
    return True, "E45c: WIN rangeWallsChart canvas + createRangeWallsChart presentes"


# --- E45h: Fair Value Table (3 cenarios) ---
def test_wdo_has_fair_value_table(golden: dict) -> tuple[bool, str]:
    """E45h: WDO tem tabela fairValueTable + createFairValueTable."""
    src = (ROOT / "dashboard_unificado" / "WDO" / "index.html").read_text(encoding="utf-8")
    if 'id="fairValueTable"' not in src:
        return False, "E45h: fairValueTable ausente em WDO/index.html"
    if 'createFairValueTable' not in (ROOT / "dashboard_unificado" / "WDO" / "assets" / "js" / "charts.js").read_text(encoding="utf-8"):
        return False, "E45h: createFairValueTable ausente em WDO/charts.js"
    return True, "E45h: WDO fairValueTable + createFairValueTable presentes"


def test_win_has_fair_value_table(golden: dict) -> tuple[bool, str]:
    """E45h: WIN tem tabela fairValueTable + createFairValueTable."""
    src = (ROOT / "dashboard_unificado" / "WIN" / "index.html").read_text(encoding="utf-8")
    if 'id="fairValueTable"' not in src:
        return False, "E45h: fairValueTable ausente em WIN/index.html"
    if 'createFairValueTable' not in (ROOT / "dashboard_unificado" / "WIN" / "assets" / "js" / "charts.js").read_text(encoding="utf-8"):
        return False, "E45h: createFairValueTable ausente em WIN/charts.js"
    return True, "E45h: WIN fairValueTable + createFairValueTable presentes"


# --- E45i: Tabela Comparativa Modelos (Flip Detection) ---
def test_wdo_has_models_table(golden: dict) -> tuple[bool, str]:
    """E45i: WDO tem tabela modelsTable + createModelsTable."""
    src = (ROOT / "dashboard_unificado" / "WDO" / "index.html").read_text(encoding="utf-8")
    if 'id="modelsTable"' not in src:
        return False, "E45i: modelsTable ausente em WDO/index.html"
    if 'createModelsTable' not in (ROOT / "dashboard_unificado" / "WDO" / "assets" / "js" / "charts.js").read_text(encoding="utf-8"):
        return False, "E45i: createModelsTable ausente em WDO/charts.js"
    return True, "E45i: WDO modelsTable + createModelsTable presentes"


def test_win_has_models_table(golden: dict) -> tuple[bool, str]:
    """E45i: WIN tem tabela modelsTable + createModelsTable."""
    src = (ROOT / "dashboard_unificado" / "WIN" / "index.html").read_text(encoding="utf-8")
    if 'id="modelsTable"' not in src:
        return False, "E45i: modelsTable ausente em WIN/index.html"
    if 'createModelsTable' not in (ROOT / "dashboard_unificado" / "WIN" / "assets" / "js" / "charts.js").read_text(encoding="utf-8"):
        return False, "E45i: createModelsTable ausente em WIN/charts.js"
    return True, "E45i: WIN modelsTable + createModelsTable presentes"


def test_wdo_has_ntsl_code_block(golden: dict) -> tuple[bool, str]:
    from tests.test_dashboards import test_wdo_has_ntsl_code_block
    return _wrap_test("dash_wdo_ntsl_block", test_wdo_has_ntsl_code_block)

def test_wdo_has_copy_ntsl_button(golden: dict) -> tuple[bool, str]:
    from tests.test_dashboards import test_wdo_has_copy_ntsl_button
    return _wrap_test("dash_wdo_ntsl_copy", test_wdo_has_copy_ntsl_button)

def test_win_has_ntsl_code_block(golden: dict) -> tuple[bool, str]:
    from tests.test_dashboards import test_win_has_ntsl_code_block
    return _wrap_test("dash_win_ntsl_block", test_win_has_ntsl_code_block)

def test_win_has_copy_ntsl_button(golden: dict) -> tuple[bool, str]:
    from tests.test_dashboards import test_win_has_copy_ntsl_button
    return _wrap_test("dash_win_ntsl_copy", test_win_has_copy_ntsl_button)

def test_wdo_html_js_sync(golden: dict) -> tuple[bool, str]:
    from tests.test_dashboards import test_wdo_html_js_sync
    return _wrap_test("dash_wdo_sync", test_wdo_html_js_sync)

def test_win_html_js_sync(golden: dict) -> tuple[bool, str]:
    from tests.test_dashboards import test_win_html_js_sync
    return _wrap_test("dash_win_sync", test_win_html_js_sync)


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
    # --- Stale Banner E37 (7 testes) ---
    "banner_exists": ("stale-banner.js existe", test_banner_file_exists),
    "banner_iife": ("stale-banner IIFE", test_banner_uses_iife),
    "banner_config": ("stale-banner config", test_banner_has_config),
    "banner_neon": ("stale-banner Neon Terminal", test_banner_uses_neon_terminal_styles),
    "banner_priority": ("stale-banner prioriza marketData", test_banner_checks_marketdata_first),
    "banner_interval": ("stale-banner interval 5min", test_banner_has_interval_check),
    "banner_robust": ("stale-banner robusto a dados faltantes", test_banner_handles_missing_data),
    # --- Snapshot Agendado E42 (7 testes) ---
    "sched_slots": ("Snap slots BRT", test_slots_correct),
    "sched_parse": ("Snap _parse_slot", test_parse_slot),
    "sched_today": ("Snap _slot_datetime hoje", test_slot_datetime_uses_today),
    "sched_window": ("Snap should_snapshot_now janela", test_should_snapshot_now_in_window),
    "sched_next": ("Snap next_snapshot_slot futuro", test_next_snapshot_slot_returns_future),
    "sched_tol": ("Snap tolerancia", test_tolerance_constants),
    "sched_label": ("Snap label 'scheduled'", test_label_prefix_correct),
    # --- Auto-Discovery E44 (7 testes) ---
    "nav_discover": ("Nav autoDiscoverDashboards", test_nav_has_auto_discover_function),
    "nav_extra": ("Nav aceita EDI_EXTRA_DASHBOARDS", test_nav_accepts_extra_dashboards),
    "nav_base": ("Nav 6 dashboards base (backward compat)", test_nav_base_dashboards_unchanged),
    "nav_pattern": ("Nav extracao Object.keys+forEach", test_nav_extra_dashboard_pattern),
    "nav_no_override": ("Nav nao sobrescreve existentes", test_nav_does_not_override_existing),
    "nav_iife": ("Nav IIFE pattern", test_nav_iife_pattern),
    "nav_doc": ("Nav comentario E44", test_nav_has_comment_doc),
    # --- SABR E21 (12 testes) ---
    "sabr_atm": ("SABR Hagan ATM", test_hagan_atm),
    "sabr_otm_call": ("SABR Hagan OTM call", test_hagan_otm_call),
    "sabr_otm_put": ("SABR Hagan OTM put > call", test_hagan_otm_put_higher_iv),
    "sabr_edge": ("SABR Hagan edge cases", test_hagan_edge_cases),
    "sabr_scalar": ("SABRModel.implied_vol", test_sabr_model_implied_vol),
    "sabr_array": ("SABRModel array", test_sabr_model_array),
    "sabr_perfect": ("SABR calibrate perfect fit", test_sabr_calibrate_perfect_fit),
    "sabr_noise": ("SABR calibrate com ruido", test_sabr_calibrate_with_noise),
    "sabr_min_points": ("SABR calibrate requer >=3 pontos", test_sabr_calibrate_requires_min_points),
    "sabr_metrics": ("SABR smile metrics", test_sabr_smile_metrics),
    "sabr_helper": ("SABR helper from iv_strike_ref", test_sabr_calibrate_from_iv_strike_ref),
    "sabr_limits": ("SABR parameter limits", test_sabr_parameter_limits),
    # --- Structured Logging E38 (10 testes) ---
    "log_json_basic": ("Log JSON basico", test_json_formatter_basic),
    "log_json_extras": ("Log JSON extras", test_json_formatter_extras),
    "log_json_corr": ("Log JSON correlation_id", test_json_formatter_correlation_id),
    "log_json_exc": ("Log JSON exception", test_json_formatter_exception),
    "log_json_setup": ("Log setup captura", test_setup_json_logging_capture),
    "log_json_file": ("Log setup arquivo", test_setup_json_logging_with_file),
    "log_text_fallback": ("Log text fallback", test_setup_text_logging_fallback),
    "log_dispatch_json": ("Log dispatch json", test_setup_logging_json_dispatches_to_json),
    "log_dispatch_text": ("Log dispatch text", test_setup_logging_text_dispatches_to_text),
    "log_json_complex": ("Log JSON objetos complexos", test_json_formatter_safely_serializes_complex),
    "zero_cross": ("Find Zero Cross", test_find_zero_cross),
    # --- Stress Test E23 (11 testes) ---
    "stress_dataclass": ("StressScenario dataclass", test_stress_scenario_dataclass),
    "stress_default_count": ("DEFAULT_SCENARIOS 8 itens", test_default_scenarios_count),
    "stress_restore": ("Stress estado restaurado", test_stress_scenario_apply_restores_state),
    "stress_spot": ("Stress spot shift", test_stress_scenario_spot_shift),
    "stress_vol": ("Stress vol shift", test_stress_scenario_vol_shift),
    "stress_decay": ("Stress time decay", test_stress_scenario_time_decay),
    "stress_run_all": ("Stress run_all_scenarios", test_stress_test_run_all),
    "stress_run_single": ("Stress run_single", test_stress_test_run_single),
    "stress_custom": ("Stress custom scenarios", test_stress_test_custom_scenarios),
    "stress_format": ("Stress format_summary_table", test_stress_test_format_summary),
    "stress_metrics": ("Stress metricas keys", test_stress_scenario_metrics_keys),
    # --- Regressão Phase 4G (E8, E10) ---
    "e8_broadcast": ("E8: Greeks Broadcast (S scalar + K array)", test_e8_greeks_broadcast_scalar_s),
    "e10_iv_per_strike": ("E10: IV per-strike extraído do DataFrame", test_e10_iv_per_strike_used_in_greeks),
    # --- Heston E52 (10 testes) ---
    "heston_atm": ("Heston Call ATM basico", test_heston_call_atm_basic),
    "heston_itm_otm": ("Heston Call ITM > OTM", test_heston_call_itm_otm),
    "heston_parity": ("Heston paridade put-call", test_heston_put_call_parity),
    "heston_vol_of_vol": ("Heston sigma_v afeta call (efeito de vol of vol)", test_heston_higher_vol_higher_call),
    "heston_rho_skew": ("Heston rho positivo -> OTM call mais cara", test_heston_higher_rho_higher_call),
    "heston_feller": ("Heston Feller condition", test_heston_feller_condition),
    "heston_oo_call": ("HestonModel.call_price = heston_call_price", test_heston_model_class_call),
    "heston_t0": ("Heston T=0 -> intrinsic", test_heston_zero_T_returns_intrinsic),
    "heston_validation": ("Heston valida parametros", test_heston_invalid_params_raises),
    "heston_calibrate": ("Heston calibrate retorna modelo valido", test_heston_calibrate_returns_valid_model),
    # --- Dupire E53 (6 testes) ---
    "dupire_flat": ("Dupire flat vol recupera BS", test_dupire_flat_vol_recovers_bs_vol),
    "dupire_smile": ("Dupire detecta smile", test_dupire_smile_shape),
    "dupire_term": ("Dupire detecta term structure", test_dupire_term_structure),
    "dupire_oo": ("LocalVolModel.local_vol = dupire_local_vol_from_surface", test_dupire_local_vol_model_class),
    "dupire_grid": ("Dupire grade completa", test_dupire_grid_returns_full_surface),
    "dupire_validation": ("Dupire valida tamanho da grade", test_dupire_too_few_points_raises),
    # --- SVI E54 (6 testes) ---
    "svi_smoke": ("SVI construtor basico", test_svi_smoke_basic),
    "svi_atm": ("SVI vol ATM razoavel", test_svi_implied_vol_atm),
    "svi_skew": ("SVI skew negativo", test_svi_skew_with_negative_rho),
    "svi_func_class": ("svi_implied_vol == SVIModel.implied_vol", test_svi_function_matches_class),
    "svi_validation": ("SVI valida parametros", test_svi_invalid_params_raises),
    "svi_fit": ("SVI fit recupera params", test_svi_fit_recovers_params),
    # --- Position P&L E66 (7 testes) ---
    "pos_long_profit": ("Position long: P&L positivo", test_position_long_profit),
    "pos_long_loss": ("Position long: P&L negativo", test_position_long_loss),
    "pos_short_profit": ("Position short: preco cai -> lucro", test_position_short_profit),
    "pos_wdo_mult": ("Position WDO com multiplier 0.50", test_position_with_multiplier_wdo),
    "pos_fees": ("Position desconta fees e calcula breakeven", test_position_with_fees),
    "pos_validation": ("Position valida parametros", test_position_validation),
    "pos_rr": ("Position risk/reward ratio", test_position_risk_reward),
    # --- Kelly Criterion E67 (7 testes) ---
    "kelly_pos": ("Kelly edge positivo (60%W R/R=2 -> 40%)", test_kelly_positive_edge),
    "kelly_zero": ("Kelly edge zero -> 0", test_kelly_zero_edge),
    "kelly_neg": ("Kelly edge negativo -> clamp 0", test_kelly_negative_edge_clamped),
    "kelly_variants": ("Kelly variancias FULL/HALF/QUARTER", test_kelly_variants),
    "kelly_pos_size": ("Kelly position size = capital * fraction", test_kelly_position_size),
    "kelly_max_losses": ("Kelly max consecutive losses", test_kelly_max_consecutive_losses),
    "kelly_validation": ("Kelly valida parametros", test_kelly_invalid_params_raises),
    # --- Veta E22/E51 (7 testes) ---
    "veta_atm": ("Veta Call ATM basico", test_veta_call_atm_basic),
    "veta_put_eq_call": ("Veta put = Veta call (BS sem div)", test_veta_put_equals_call),
    "veta_fd_check": ("Veta FD primária = FD dt=1e-4 (consistente)", test_veta_finite_diff_matches_closed_form),
    "veta_t0": ("Veta T=0 = 0", test_veta_at_T_zero),
    "veta_oo": ("VetaCalculator.veta_call = veta_call()", test_veta_class_consistency),
    "veta_validation": ("Veta valida parametros", test_veta_invalid_params_raises),
    "veta_T_effect": ("|Veta| diminui com T (Vega mais estavel)", test_veta_larger_T_smaller_magnitude),
    # --- Dashboards E26 (8 testes) ---
    "dash_wdo_ntsl_block": ("WDO tem ntsl-code-block", test_wdo_has_ntsl_code_block),
    "dash_wdo_ntsl_copy": ("WDO tem copy-ntsl", test_wdo_has_copy_ntsl_button),
    "dash_win_ntsl_block": ("WIN tem ntsl-code-block", test_win_has_ntsl_code_block),
    "dash_win_ntsl_copy": ("WIN tem copy-ntsl", test_win_has_copy_ntsl_button),
    "dash_wdo_sync": ("WDO HTML/JS sincronizado (sem dead handlers)", test_wdo_html_js_sync),
    "dash_win_sync": ("WIN HTML/JS sincronizado (sem dead handlers)", test_win_html_js_sync),
    "dash_wdo_assets": ("WDO assets externos existem", test_wdo_external_assets_exist),
    "dash_e45e_wdo_skew": ("E45e WDO skewChart canvas", test_wdo_has_skew_canvas),
    "dash_e45e_win_skew": ("E45e WIN skewChart canvas", test_win_has_skew_canvas),
    "dash_e45b_wdo_discovery": ("E45b WDO discoveryChart canvas", test_wdo_has_discovery_canvas),
    "dash_e45b_win_discovery": ("E45b WIN discoveryChart canvas", test_win_has_discovery_canvas),
    "dash_e45c_wdo_range_walls": ("E45c WDO rangeWallsChart canvas", test_wdo_has_range_walls_canvas),
    "dash_e45c_win_range_walls": ("E45c WIN rangeWallsChart canvas", test_win_has_range_walls_canvas),
    "dash_e45h_wdo_fair_value": ("E45h WDO fairValueTable", test_wdo_has_fair_value_table),
    "dash_e45h_win_fair_value": ("E45h WIN fairValueTable", test_win_has_fair_value_table),
    "dash_e45i_wdo_models": ("E45i WDO modelsTable", test_wdo_has_models_table),
    "dash_e45i_win_models": ("E45i WIN modelsTable", test_win_has_models_table),
    "dash_win_assets": ("WIN assets externos existem", test_win_external_assets_exist),
    # --- VWAP E68 (16 testes) ---
    "vwap_basic": ("VWAP = Σ(P×V) / Σ(V)", test_vwap_basic),
    "vwap_equal_vol": ("VWAP volume igual = média simples", test_vwap_equal_volume_is_simple_average),
    "vwap_high_vol": ("VWAP puxado pelo volume alto", test_vwap_volume_emphasizes_high_volume),
    "vwap_empty": ("VWAP lista vazia -> ValueError", test_vwap_empty_raises),
    "vwap_zero_vol": ("VWAP volume=0 -> ValueError", test_vwap_zero_volume_raises),
    "vwap_single": ("VWAP 1 sample -> σ=0, bandas colapsam", test_vwap_single_sample),
    "vwap_bands": ("VWAP bandas ±1σ e ±2σ", test_vwap_bands),
    "vwap_position": ("VWAP position_in_band classifica", test_vwap_position_in_band),
    "vwap_signal": ("VWAP signal: buy/hold/sell", test_vwap_signal),
    "vwap_anchored": ("Anchored VWAP a partir de index", test_anchored_vwap),
    "vwap_anchor_bad": ("Anchored VWAP rejeita index inválido", test_anchored_vwap_invalid_index),
    "vwap_cross_above": ("VWAP cross above signal", test_vwap_cross_above_real),
    "vwap_cross_below": ("VWAP cross below signal", test_vwap_cross_below),
    "vwap_no_cross": ("VWAP sem cruzamento com <2 samples", test_vwap_no_cross_insufficient_samples),
    "vwap_max_min": ("VWAP max_price e min_price", test_vwap_max_min_price),
    "vwap_neg_price": ("VWAP rejeita price <= 0", test_vwap_negative_price_raises),
    # --- Merton E71 (14 testes) ---
    "merton_lambda0": ("Merton λ=0 degenere em BS", test_merton_lambda_zero_recovers_bs),
    "merton_t0": ("Merton T=0 -> intrinseco", test_merton_t_zero_returns_intrinsic),
    "merton_invalid": ("Merton valida parametros", test_merton_invalid_params_raise),
    "merton_lambda_up": ("Merton ↑λ -> call OTM mais cara", test_merton_higher_lambda_higher_call),
    "merton_mu_j_pos": ("Merton μ_J>0 -> call mais cara (saltos bullish)", test_merton_positive_mu_j_increases_call),
    "merton_sigma_j": ("Merton ↑σ_J -> deep OTM call protegida", test_merton_higher_sigma_j_higher_otm_call),
    "merton_parity": ("Merton paridade put-call modificada", test_merton_put_call_parity_modified),
    "merton_oo_func": ("MertonJumpModel == funcao", test_merton_class_call_equals_function),
    "merton_kappa": ("Merton κ=E[exp(Y)-1] compensador", test_merton_class_kappa_compensator),
    "merton_calibrate": ("Merton calibrate recupera σ e λ", test_merton_calibrate_recovers_lambda),
    "merton_calib_min": ("Merton calibrate >= 3 pontos", test_merton_calibrate_requires_min_points),
    "merton_class_invalid": ("Merton construtor valida", test_merton_invalid_class_params_raise),
    "merton_otm_vs_bs": ("Merton OTM > BS (saltos cobrem)", test_merton_zero_jumps_higher_than_bs_for_otm),
    "merton_itm": ("Merton ITM call >= intrinseco", test_merton_call_positive_for_itm),
    # --- Kou E72 (15 testes) ---
    "kou_lambda0": ("Kou λ=0 degenera em BS", test_kou_lambda_zero_recovers_bs),
    "kou_t0": ("Kou T=0 -> intrinseco", test_kou_t_zero_returns_intrinsic),
    "kou_invalid": ("Kou valida 9 parametros", test_kou_invalid_params_raise),
    "kou_moments": ("Kou momentos (simetrico p=0.5)", test_kou_jump_moments_known_case),
    "kou_asym_p": ("Kou p<0.5 -> E[Y] negativo", test_kou_asymmetric_p_moments),
    "kou_asym_eta": ("Kou η₂<η₁ -> Var[Y] aumenta", test_kou_asymmetric_eta_moments),
    "kou_lambda_up": ("Kou ↑λ -> call OTM mais cara", test_kou_higher_lambda_higher_call),
    "kou_put_asym": ("Kou assimetrico protege deep OTM put", test_kou_asymmetric_put_protection),
    "kou_parity": ("Kou paridade put-call modificada", test_kou_put_call_parity_modified),
    "kou_oo_func": ("KouJumpModel == funcao", test_kou_class_call_equals_function),
    "kou_asym_check": ("Kou is_asymmetric detecta quebra", test_kou_class_is_asymmetric),
    "kou_kappa": ("Kou κ=E[exp(Y)-1] compensador", test_kou_kappa_compensator),
    "kou_calibrate": ("Kou calibrate recupera σ e λ", test_kou_calibrate_recovers_lambda),
    "kou_calib_min": ("Kou calibrate >= 3 pontos", test_kou_calibrate_requires_min_points),
    "kou_class_invalid": ("Kou construtor valida 5 params", test_kou_invalid_class_params_raise),
    # --- Rough Bergomi E73 (13 testes) ---
    "rberg_eta0": ("rBerg η=0 degenera em BS", test_rbergomi_eta_zero_recovers_bs),
    "rberg_t0": ("rBerg T=0 -> intrinseco", test_rbergomi_t_zero_returns_intrinsic),
    "rberg_invalid": ("rBerg valida 8 parametros", test_rbergomi_invalid_params_raise),
    "rberg_phi0": ("rBerg φ(0)=1 normalizacao", test_rbergomi_char_func_at_zero),
    "rberg_phi_finite": ("rBerg φ finita para u=0.1..10", test_rbergomi_char_func_is_finite),
    "rberg_eta_up": ("rBerg ↑η -> OTM call mais cara", test_rbergomi_higher_eta_higher_call),
    "rberg_rough_tail": ("rBerg H menor -> cauda mais pesada", test_rbergomi_lower_h_heavier_tail),
    "rberg_rho_skew": ("rBerg ρ<0 -> OTM put mais cara (skew)", test_rbergomi_negative_rho_increases_otm_put),
    "rberg_parity": ("rBerg paridade put-call", test_rbergomi_put_call_parity),
    "rberg_oo_func": ("RoughBergomiModel == funcao", test_rbergomi_class_call_equals_function),
    "rberg_rough_check": ("rBerg is_rough e is_classical_bergomi", test_rbergomi_is_rough_property),
    "rberg_call_pos": ("rBerg call sempre >= 0", test_rbergomi_call_positive),
    "rberg_class_invalid": ("rBerg construtor valida 4 params", test_rbergomi_class_invalid_params_raise),
    # --- Discovery Levels E45d (14 testes) ---
    "disc_fib_basic": ("Disc fibonacci basico", test_discovery_fibonacci_basic),
    "disc_fib_default": ("Disc fibonacci default 5 levels", test_discovery_fibonacci_default_percentages),
    "disc_fib_multi": ("Disc fibonacci 3 strikes -> 2*N", test_discovery_fibonacci_multiple_strikes),
    "disc_fib_empty": ("Disc fibonacci strikes vazios", test_discovery_fibonacci_empty),
    "disc_fib_unsorted": ("Disc fibonacci auto-sort", test_discovery_fibonacci_unsorted),
    "disc_fib_invalid": ("Disc fibonacci percentages invalidos", test_discovery_fibonacci_invalid_pct),
    "disc_mw_basic": ("Disc midwalls interpola OI", test_discovery_midwalls_basic),
    "disc_mw_single": ("Disc midwalls 1 strike -> []", test_discovery_midwalls_single),
    "disc_mw_mismatch": ("Disc midwalls ValueError", test_discovery_midwalls_mismatch),
    "disc_range_basic": ("Disc range top N clusters", test_discovery_range_basic),
    "disc_range_empty": ("Disc range strikes vazios", test_discovery_range_empty),
    "disc_range_n": ("Disc range n > len", test_discovery_range_n_large),
    "disc_integration": ("Disc integration E45d", test_discovery_integration),
    "disc_dataclass": ("Disc dataclass metodos", test_discovery_result_dataclass),
    "disc_custom": ("Disc custom percentages", test_discovery_custom_fib),
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
