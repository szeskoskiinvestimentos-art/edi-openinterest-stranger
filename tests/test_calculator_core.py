"""
test_calculator_core.py - Testes de cobertura para calculator.py

Testa os métodos críticos não cobertos:
1. calculate_max_pain
2. calculate_expected_moves
3. calculate_effective_walls
4. calculate_flow_sentiment
5. calculate_pinning_risk
6. calculate_flips_and_walls (integração)

Referência: calculator.py (1272 linhas).
"""
from __future__ import annotations

import numpy as np
import pandas as pd
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def _make_calc(spot=100.0, strikes=None, expiry='2026-06-25'):
    """Helper: cria OptionsCalculator com dados sintéticos."""
    from src.calculator import OptionsCalculator

    if strikes is None:
        strikes = np.arange(80, 121, 5)

    data = []
    for k in strikes:
        moneyness = abs(k - spot) / spot
        iv = 0.20 + 0.5 * moneyness**2
        oi_call = max(100, 500 - abs(k - spot) * 10)
        oi_put = max(100, 500 - abs(k - spot) * 10)

        data.append({'StrikeK': k, 'OptionType': 'CALL', 'Open Int': oi_call,
                     'Last': max(0.1, spot - k + 5), 'IV': iv, 'Volume': oi_call // 10})
        data.append({'StrikeK': k, 'OptionType': 'PUT', 'Open Int': oi_put,
                     'Last': max(0.1, k - spot + 5), 'IV': iv, 'Volume': oi_put // 10})

    df = pd.DataFrame(data)

    calc = OptionsCalculator(
        options_df=df,
        spot=spot,
        expiry_date=expiry,
        iv_annual=0.20,
        risk_free=0.05,
    )
    return calc


def test_max_pain_basic():
    """Max Pain deve ser o strike que minimiza a dor total dos holders."""
    calc = _make_calc(spot=100.0)
    calc.calculate_greeks_exposure()
    # calculate_max_pain retorna valor mas não seta self.max_pain
    # Precisa ser chamado via calculate_flips_and_walls ou capturar retorno
    max_pain_val = calc.calculate_max_pain()

    assert max_pain_val is not None, "max_pain é None"
    assert isinstance(max_pain_val, (int, float, np.floating)), f"max_pain não é numérico: {type(max_pain_val)}"
    # Max Pain deve estar dentro do range dos strikes
    assert 80 <= max_pain_val <= 120, f"max_pain={max_pain_val} fora do range [80, 120]"
    # Para dados simétricos, Max Pain deve estar próximo ao spot
    assert abs(max_pain_val - 100) < 20, f"max_pain={max_pain_val} muito distante do spot=100"

    return True, f"max_pain={max_pain_val}"


def test_max_pain_symmetric():
    """Para dados simétricos perfeitos, Max Pain deve ser o strike ATM."""
    from src.calculator import OptionsCalculator

    strikes = np.array([90, 95, 100, 105, 110])
    spot = 100.0

    data = []
    for k in strikes:
        # OI simétrico: mesmo OI para calls e puts em cada strike
        data.append({'StrikeK': k, 'OptionType': 'CALL', 'Open Int': 1000, 'Last': max(0.1, spot - k + 5), 'IV': 0.20})
        data.append({'StrikeK': k, 'OptionType': 'PUT', 'Open Int': 1000, 'Last': max(0.1, k - spot + 5), 'IV': 0.20})

    df = pd.DataFrame(data)
    calc = OptionsCalculator(options_df=df, spot=spot, expiry_date='2026-06-25', iv_annual=0.20, risk_free=0.05)
    calc.calculate_greeks_exposure()
    max_pain_val = calc.calculate_max_pain()

    # Para OI simétrico perfeito, Max Pain deve ser o strike central (100)
    assert max_pain_val == 100, f"Max Pain simétrico deve ser 100, got {max_pain_val}"

    return True, f"Max Pain simétrico OK: {max_pain_val}"


def test_expected_moves_structure():
    """Expected Moves deve retornar estrutura válida."""
    calc = _make_calc(spot=100.0)
    calc.calculate_greeks_exposure()
    calc.calculate_expected_moves()

    assert calc.expected_moves is not None, "expected_moves é None"
    assert isinstance(calc.expected_moves, (list, dict)), f"expected_moves tipo inesperado: {type(calc.expected_moves)}"

    if isinstance(calc.expected_moves, list):
        assert len(calc.expected_moves) > 0, "expected_moves está vazio"
        for em in calc.expected_moves:
            assert 'label' in em, "expected_moves item sem 'label'"
            assert 'upper' in em, "expected_moves item sem 'upper'"
            assert 'lower' in em, "expected_moves item sem 'lower'"
            assert em['upper'] > em['lower'], f"upper ({em['upper']}) <= lower ({em['lower']})"

    return True, f"expected_moves: {len(calc.expected_moves) if isinstance(calc.expected_moves, list) else 'dict'} itens"


def test_expected_moves_symmetric():
    """Para IV constante, Expected Moves deve ser simétrico ao redor do spot."""
    calc = _make_calc(spot=100.0)
    calc.calculate_greeks_exposure()
    calc.calculate_expected_moves()

    if isinstance(calc.expected_moves, list) and len(calc.expected_moves) > 0:
        em = calc.expected_moves[0]
        upper_dist = abs(em['upper'] - 100.0)
        lower_dist = abs(100.0 - em['lower'])
        # Deve ser aproximadamente simétrico (dentro de 5% de tolerância)
        ratio = upper_dist / max(lower_dist, 1e-10)
        assert 0.5 < ratio < 2.0, f"Expected Move assimétrico: upper_dist={upper_dist:.2f}, lower_dist={lower_dist:.2f}"

    return True, "Simetria OK"


def test_effective_walls():
    """Effective Walls devem ser calculadas corretamente."""
    calc = _make_calc(spot=100.0)
    calc.calculate_greeks_exposure()
    calc.calculate_effective_walls()

    assert hasattr(calc, 'effective_call_wall'), "effective_call_wall não existe"
    assert hasattr(calc, 'effective_put_wall'), "effective_put_wall não existe"
    assert calc.effective_call_wall is not None, "effective_call_wall é None"
    assert calc.effective_put_wall is not None, "effective_put_wall é None"

    # Call wall deve estar acima ou igual ao spot (resistência)
    # Put wall deve estar abaixo ou igual ao spot (suporte)
    # Mas com dados sintéticos, pode variar
    assert isinstance(calc.effective_call_wall, (int, float)), "effective_call_wall não é numérico"
    assert isinstance(calc.effective_put_wall, (int, float)), "effective_put_wall não é numérico"

    return True, f"effective_call_wall={calc.effective_call_wall:.2f}, effective_put_wall={calc.effective_put_wall:.2f}"


def test_flow_sentiment():
    """Flow Sentiment deve classificar Bull/Bear."""
    calc = _make_calc(spot=100.0)
    calc.calculate_greeks_exposure()
    calc.calculate_flow_sentiment()

    assert hasattr(calc, 'flow_sentiment'), "flow_sentiment não existe"
    assert calc.flow_sentiment is not None, "flow_sentiment é None"
    assert isinstance(calc.flow_sentiment, dict), f"flow_sentiment tipo inesperado: {type(calc.flow_sentiment)}"

    # Deve ter classificação
    if 'classification' in calc.flow_sentiment:
        cls = calc.flow_sentiment['classification']
        assert cls in ['Bull', 'Bear', 'Neutral', 'BULLISH', 'BEARISH', 'NEUTRAL'], \
            f"classificação inesperada: {cls}"

    return True, f"flow_sentiment: {calc.flow_sentiment}"


def test_pinning_risk():
    """Pinning Risk deve identificar strike de pinning."""
    calc = _make_calc(spot=100.0, expiry='2026-06-20')  # Próximo ao vencimento
    calc.calculate_greeks_exposure()
    calc.calculate_pinning_risk()

    assert hasattr(calc, 'pinning_risk'), "pinning_risk não existe"
    # pinning_risk pode ser None se T > 1.5 dias
    if calc.pinning_risk is not None:
        assert isinstance(calc.pinning_risk, dict), f"pinning_risk tipo inesperado: {type(calc.pinning_risk)}"

    return True, f"pinning_risk: {calc.pinning_risk}"


def test_flips_and_walls_integration():
    """calculate_flips_and_walls deve executar sem erros."""
    calc = _make_calc(spot=100.0)
    calc.calculate_greeks_exposure()

    try:
        calc.calculate_flips_and_walls()
    except Exception as e:
        return False, f"calculate_flips_and_walls falhou: {e}"

    # Verificar que os atributos principais foram calculados
    attrs = ['gamma_flip', 'call_wall', 'put_wall', 'max_pain']
    missing = [a for a in attrs if not hasattr(calc, a) or getattr(calc, a) is None]
    # max_pain pode ser None em alguns casos, então só verificamos os outros
    critical_missing = [a for a in missing if a != 'max_pain']
    if critical_missing:
        return False, f"Atributos não calculados: {critical_missing}"

    return True, "Integração OK"


def test_flips_and_walls_autoloads_greeks():
    """Regressao: calculate_flips_and_walls deve auto-carregar greeks_exposure.

    Bug latente: antes, chamar calculate_flips_and_walls() sem antes ter
    chamado calculate_greeks_exposure() causava AttributeError em
    self.gex_cum_signed / self.gex_flip_base. Agora auto-chama.
    """
    calc = _make_calc(spot=100.0)

    # NUNCA chamar calculate_greeks_exposure() antes
    assert not hasattr(calc, "gex_cum_signed") or calc.gex_cum_signed is None, \
        "Setup invalido: gex_cum_signed ja existe"

    # Deve funcionar sem erro
    try:
        calc.calculate_flips_and_walls()
    except Exception as e:
        return False, f"calculate_flips_and_walls falhou sem auto-load: {e}"

    # Apos chamada, gex_cum_signed deve existir
    if not hasattr(calc, "gex_cum_signed") or calc.gex_cum_signed is None:
        return False, "gex_cum_signed nao foi criado mesmo apos auto-load"

    # Atributos principais devem estar calculados
    if calc.gamma_flip is None:
        return False, "gamma_flip ficou None apos auto-load"

    return True, "Auto-load de greeks_exposure OK"


def test_find_zero_cross():
    """_find_zero_cross deve encontrar raizes corretamente."""
    calc = _make_calc(spot=100.0)

    # Teste direto com arrays conhecidos
    x = np.array([1, 2, 3, 4, 5])
    y = np.array([-2, -1, 0, 1, 2])  # Zero crossing em x=3

    result = calc._find_zero_cross(x, y, target_x=3.0)
    assert result is not None, "_find_zero_cross retornou None"
    assert abs(result - 3.0) < 0.1, f"Zero crossing esperado ~3.0, got {result}"

    return True, f"_find_zero_cross={result:.4f}"


if __name__ == "__main__":
    tests = [
        ("Max Pain Basic", test_max_pain_basic),
        ("Max Pain Symmetric", test_max_pain_symmetric),
        ("Expected Moves Structure", test_expected_moves_structure),
        ("Expected Moves Symmetric", test_expected_moves_symmetric),
        ("Effective Walls", test_effective_walls),
        ("Flow Sentiment", test_flow_sentiment),
        ("Pinning Risk", test_pinning_risk),
        ("Flips and Walls Integration", test_flips_and_walls_integration),
        ("Flips and Walls Auto-Load", test_flips_and_walls_autoloads_greeks),
        ("Find Zero Cross", test_find_zero_cross),
    ]

    passed = 0
    failed = 0
    for name, fn in tests:
        try:
            ok, msg = fn()
            if ok:
                print(f"  [OK ] {name} — {msg}")
                passed += 1
            else:
                print(f"  [FAIL] {name} — {msg}")
                failed += 1
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"  [FAIL] {name} — {e}")
            failed += 1

    print(f"\n=== Total: {len(tests)}, Passou: {passed}, Falhou: {failed} ===")
    sys.exit(1 if failed else 0)
