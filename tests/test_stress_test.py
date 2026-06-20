"""Testes para E23 (Stress Testing)."""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.calculator.stress_test import (
    DEFAULT_SCENARIOS,
    StressScenario,
    StressTest,
    run_stress_test_cli,
)


def _make_calc(spot=100.0, iv=0.25, expiry='2026-06-25'):
    from src.calculator import OptionsCalculator
    import pandas as pd
    strikes = np.arange(80, 121, 5)
    data = []
    for k in strikes:
        data.append({'StrikeK': k, 'OptionType': 'CALL', 'Open Int': 500,
                     'Last': max(0.1, spot - k + 5), 'IV': iv, 'Volume': 50})
        data.append({'StrikeK': k, 'OptionType': 'PUT', 'Open Int': 500,
                     'Last': max(0.1, k - spot + 5), 'IV': iv, 'Volume': 50})
    df = pd.DataFrame(data)
    return OptionsCalculator(
        options_df=df, spot=spot, expiry_date=expiry,
        iv_annual=iv, risk_free=0.05,
    )


def test_stress_scenario_dataclass():
    s = StressScenario(name='t', description='d',
                       spot_shift_pct=0.1, vol_shift_pct=0.2, time_decay_days=3.0)
    assert s.name == 't' and s.spot_shift_pct == 0.1
    return True, f"dataclass OK: {s.name}"


def test_default_scenarios_count():
    assert len(DEFAULT_SCENARIOS) == 8
    names = [s.name for s in DEFAULT_SCENARIOS]
    expected = ['baseline', 'spot_up_1sigma', 'spot_down_1sigma', 'spot_down_2sigma',
                'vol_up_50pct', 'vol_down_50pct', 'time_decay_1d', 'time_decay_1w']
    assert names == expected
    return True, f"8 cenarios: {names}"


def test_stress_scenario_apply_restores_state():
    calc = _make_calc(spot=100.0, iv=0.25)
    orig_spot = calc.spot
    orig_iv = calc.iv_annual
    orig_T = calc.T
    s = StressScenario(name='up', description='+10%', spot_shift_pct=0.10)
    metrics = s.apply(calc)
    assert calc.spot == orig_spot
    assert calc.iv_annual == orig_iv
    assert calc.T == orig_T
    assert abs(metrics['spot'] - 110.0) < 0.01
    return True, "estado restaurado, novo spot=110.00"


def test_stress_scenario_spot_shift():
    calc = _make_calc(spot=100.0)
    s = StressScenario(name='up50', description='', spot_shift_pct=0.50)
    m = s.apply(calc)
    assert m['spot'] == 150.0
    return True, "100 -> 150"


def test_stress_scenario_vol_shift():
    calc = _make_calc(iv=0.20)
    s = StressScenario(name='vol', description='', vol_shift_pct=0.50)
    m = s.apply(calc)
    assert abs(m['iv_annual'] - 0.30) < 1e-6
    return True, "iv 0.20 -> 0.30"


def test_stress_scenario_time_decay():
    calc = _make_calc()
    orig_T = calc.T
    s = StressScenario(name='decay', description='', time_decay_days=1.0)
    s.apply(calc)
    assert abs(calc.T - orig_T) < 1e-9
    return True, "T restaurado"


def test_stress_test_run_all():
    calc = _make_calc()
    st = StressTest(calc)
    results = st.run_all_scenarios()
    assert len(results) == 8
    for name in ['baseline', 'spot_up_1sigma', 'spot_down_1sigma',
                 'spot_down_2sigma', 'vol_up_50pct', 'vol_down_50pct',
                 'time_decay_1d', 'time_decay_1w']:
        assert name in results
    return True, f"8 cenarios: {list(results.keys())}"


def test_stress_test_run_single():
    calc = _make_calc()
    st = StressTest(calc)
    m = st.run_single('spot_up_1sigma')
    assert m is not None
    assert m['spot'] > 100
    assert abs(m['spot'] - 133.0) < 0.1
    assert st.run_single('nao_existe') is None
    return True, "single OK spot=133.0"


def test_stress_test_custom_scenarios():
    calc = _make_calc()
    custom = [StressScenario(name='custom1', description='c', spot_shift_pct=0.05)]
    st = StressTest(calc, scenarios=custom)
    results = st.run_all_scenarios()
    assert len(results) == 1
    assert 'custom1' in results
    return True, "custom scenarios OK"


def test_stress_test_format_summary():
    calc = _make_calc()
    st = StressTest(calc)
    results = st.run_all_scenarios()
    table = st.format_summary_table(results)
    assert 'baseline' in table
    assert 'spot_up_1sigma' in table
    assert 'Spot' in table
    return True, "format table OK"


def test_stress_scenario_metrics_keys():
    calc = _make_calc()
    s = StressScenario(name='baseline', description='base')
    m = s.apply(calc)
    assert 'scenario' in m
    assert 'description' in m
    assert 'spot_shift_pct' in m
    assert 'vol_shift_pct' in m
    assert 'time_decay_days' in m
    return True, "metricas: scenario/description/shifts OK"
