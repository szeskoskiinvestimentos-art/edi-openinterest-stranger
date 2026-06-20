"""
Testes E45d — Discovery Levels (Fibonacci + Midwalls + Range).
"""
import math

import numpy as np

from src.calculator.discovery import (
    FIB_RETRACEMENTS,
    compute_fibonacci_levels,
    compute_midwalls,
    find_range_levels,
    discover_levels,
    DiscoveryResult,
)


# ===========================================================================
# Testes compute_fibonacci_levels
# ===========================================================================

def test_fibonacci_basic() -> tuple[bool, str]:
    """Fibonacci entre 2 strikes conhecidos."""
    strikes = [100.0, 110.0]
    fib = compute_fibonacci_levels(strikes, percentages=[0.382, 0.618])
    expected = np.array([100 + 0.382*10, 100 + 0.618*10])
    if not np.allclose(fib, expected, atol=1e-9):
        return False, f"Esperado {expected}, got {fib}"
    return True, f"Fib [100,110] @ 38.2/61.8: {fib.tolist()}"


def test_fibonacci_default_percentages() -> tuple[bool, str]:
    """Default usa 5 retracements classicos."""
    strikes = [100.0, 200.0]
    fib = compute_fibonacci_levels(strikes)
    # 5 fib lines entre 100-200
    if len(fib) != 5:
        return False, f"Esperado 5 levels, got {len(fib)}"
    # 23.6% = 100 + 23.6 = 123.6
    if not math.isclose(fib[0], 123.6, abs_tol=1e-9):
        return False, f"Primeiro fib esperado 123.6, got {fib[0]}"
    return True, f"Default 5 levels: {fib.tolist()}"


def test_fibonacci_multiple_strikes() -> tuple[bool, str]:
    """3 strikes -> 2 segmentos -> 2*N fib levels."""
    strikes = [100.0, 110.0, 125.0]
    fib = compute_fibonacci_levels(strikes, percentages=[0.5])
    # 1 fib entre 100-110 = 105
    # 1 fib entre 110-125 = 117.5
    if not np.allclose(fib, [105.0, 117.5], atol=1e-9):
        return False, f"Esperado [105, 117.5], got {fib.tolist()}"
    return True, f"2 segmentos @ 50%: {fib.tolist()}"


def test_fibonacci_empty_strikes() -> tuple[bool, str]:
    """< 2 strikes -> array vazio."""
    if len(compute_fibonacci_levels([])) != 0:
        return False, "Lista vazia deveria dar array vazio"
    if len(compute_fibonacci_levels([100.0])) != 0:
        return False, "1 strike deveria dar array vazio"
    return True, "Empty/1-element retorna []"


def test_fibonacci_unsorted() -> tuple[bool, str]:
    """Strikes desordenados sao ordenados internamente."""
    strikes = [110.0, 100.0]
    fib = compute_fibonacci_levels(strikes, percentages=[0.5])
    if not math.isclose(fib[0], 105.0, abs_tol=1e-9):
        return False, f"Esperado 105, got {fib[0]}"
    return True, f"Auto-sort funciona: {fib.tolist()}"


def test_fibonacci_invalid_percentages() -> tuple[bool, str]:
    """Percentages fora de [0,1] sao ignorados."""
    strikes = [100.0, 110.0]
    fib = compute_fibonacci_levels(strikes, percentages=[0.5, 1.5, -0.5])
    # Apenas 0.5 e valido
    if len(fib) != 1:
        return False, f"Esperado 1 fib (0.5), got {len(fib)}"
    if not math.isclose(fib[0], 105.0, abs_tol=1e-9):
        return False, f"Esperado 105, got {fib[0]}"
    return True, f"Invalidos ignorados: {fib.tolist()}"


# ===========================================================================
# Testes compute_midwalls
# ===========================================================================

def test_midwalls_basic() -> tuple[bool, str]:
    """Midwalls = (strike[i] + strike[i+1])/2, OI interpolado."""
    strikes = [100.0, 110.0, 125.0]
    oi_call = [50.0, 100.0, 75.0]
    oi_put = [80.0, 60.0, 90.0]
    mw_strikes, mw_call, mw_put = compute_midwalls(strikes, oi_call, oi_put)
    expected_strikes = np.array([105.0, 117.5])
    expected_call = np.array([75.0, 87.5])
    expected_put = np.array([70.0, 75.0])
    if not np.allclose(mw_strikes, expected_strikes, atol=1e-9):
        return False, f"mw_strikes errado: {mw_strikes}"
    if not np.allclose(mw_call, expected_call, atol=1e-9):
        return False, f"mw_call errado: {mw_call}"
    if not np.allclose(mw_put, expected_put, atol=1e-9):
        return False, f"mw_put errado: {mw_put}"
    return True, f"3 strikes -> 2 midwalls: {mw_strikes.tolist()}"


def test_midwalls_single_strike() -> tuple[bool, str]:
    """1 strike -> arrays vazios."""
    mw_s, mw_c, mw_p = compute_midwalls([100.0], [50.0], [50.0])
    if len(mw_s) != 0:
        return False, f"Esperado vazio, got {mw_s}"
    return True, "Single strike -> midwalls vazios"


def test_midwalls_size_mismatch() -> tuple[bool, str]:
    """Tamanhos incompativeis -> ValueError."""
    try:
        compute_midwalls([100.0, 110.0], [50.0], [50.0, 60.0])
        return False, "Deveria levantar ValueError"
    except ValueError:
        return True, "ValueError para tamanhos incompativeis"


# ===========================================================================
# Testes find_range_levels
# ===========================================================================

def test_range_basic() -> tuple[bool, str]:
    """Range = top N clusters de OI combinado."""
    strikes = [100.0, 105.0, 110.0, 115.0, 120.0]
    oi_call = [10.0, 50.0, 100.0, 30.0, 20.0]  # pico em 110
    oi_put = [20.0, 40.0, 80.0, 60.0, 10.0]     # pico em 110
    result = find_range_levels(strikes, oi_call, oi_put, n_clusters=1)
    # Top 1: 110 (OI=180)
    if result["range_low"] != 110.0:
        return False, f"range_low esperado 110, got {result['range_low']}"
    if result["range_high"] != 110.0:
        return False, f"range_high esperado 110, got {result['range_high']}"
    if len(result["top_strikes"]) != 1:
        return False, f"top_strikes esperado 1, got {len(result['top_strikes'])}"
    return True, f"Range [110, 110] com top 1 cluster"


def test_range_empty() -> tuple[bool, str]:
    """Strikes vazio -> dict com None."""
    result = find_range_levels([], [], [])
    if result["range_low"] is not None or result["range_high"] is not None:
        return False, f"Esperado None, got {result}"
    return True, "Empty strikes -> None"


def test_range_n_larger_than_data() -> tuple[bool, str]:
    """n_clusters > len(data) -> usa todos os strikes."""
    strikes = [100.0, 105.0]
    oi_call = [10.0, 20.0]
    oi_put = [15.0, 5.0]
    result = find_range_levels(strikes, oi_call, oi_put, n_clusters=10)
    if len(result["top_strikes"]) != 2:
        return False, f"Esperado 2, got {len(result['top_strikes'])}"
    return True, f"n_clusters=10 com 2 strikes -> usa todos"


# ===========================================================================
# Testes discover_levels (integrado)
# ===========================================================================

def test_discover_levels_integration() -> tuple[bool, str]:
    """Funcao consolidada retorna DiscoveryResult completo."""
    strikes = [5000.0, 5050.0, 5100.0, 5150.0, 5200.0]
    oi_call = [100.0, 200.0, 500.0, 300.0, 150.0]
    oi_put = [400.0, 350.0, 200.0, 250.0, 100.0]
    result = discover_levels(strikes, oi_call, oi_put, n_range_clusters=3)
    # Verificacoes
    if not isinstance(result, DiscoveryResult):
        return False, f"Esperado DiscoveryResult, got {type(result)}"
    # Fib: 4 segmentos x 5 = 20 levels
    if result.fib_count() != 20:
        return False, f"Esperado 20 fib, got {result.fib_count()}"
    # Midwalls: 4
    if len(result.midwalls_strikes) != 4:
        return False, f"Esperado 4 midwalls, got {len(result.midwalls_strikes)}"
    # Top 3: 5100 (700), 5050 (550), 5150 (550)
    if result.range_low != 5050.0 or result.range_high != 5150.0:
        return False, f"Range errado: [{result.range_low}, {result.range_high}]"
    # Width
    if result.range_width() != 100.0:
        return False, f"Width errado: {result.range_width()}"
    return True, f"Integration OK: 20 fib, 4 midwalls, range=[{result.range_low}, {result.range_high}]"


def test_discovery_result_dataclass() -> tuple[bool, str]:
    """DiscoveryResult tem metodos uteis."""
    strikes = [100.0, 110.0]
    oi_call = [50.0, 100.0]
    oi_put = [50.0, 100.0]
    result = discover_levels(strikes, oi_call, oi_put, n_range_clusters=1)
    # fib_count()
    if result.fib_count() != 5:
        return False, f"fib_count() errado: {result.fib_count()}"
    # range_width() — top 1 cluster = 110 (apenas 1 strike)
    if result.range_width() != 0.0:
        return False, f"range_width() esperado 0 (top 1), got {result.range_width()}"
    return True, f"Dataclass OK: fib_count={result.fib_count()}, width={result.range_width()}"


def test_discovery_custom_fib_percentages() -> tuple[bool, str]:
    """Percentages customizados sao respeitados."""
    strikes = [100.0, 200.0]
    oi_call = [10.0, 20.0]
    oi_put = [10.0, 20.0]
    # Apenas 1 percentage: 50%
    result = discover_levels(strikes, oi_call, oi_put, fib_percentages=[0.5])
    if result.fib_count() != 1:
        return False, f"Esperado 1 fib (50%), got {result.fib_count()}"
    if not math.isclose(result.fib_levels[0], 150.0, abs_tol=1e-9):
        return False, f"Esperado 150, got {result.fib_levels[0]}"
    return True, f"Custom percentages: 1 fib @ 150"
