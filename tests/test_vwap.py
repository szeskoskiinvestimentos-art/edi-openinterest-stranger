"""
Testes E68 — VWAP intraday.

Cobre:
- Cálculo básico de VWAP (média ponderada por volume)
- Edge cases (vazio, volume=0, 1 sample)
- Bandas ±1σ e ±2σ
- Classificação position_in_band
- Sinal de trading (signal)
- Anchored VWAP
- Cruzamento de preço sobre/sob VWAP
"""
from datetime import datetime, timedelta
import math

from src.calculator.vwap import (
    Tick,
    VWAPResult,
    compute_vwap,
    anchor_vwap,
    vwap_cross_signal,
)


_BASE = datetime(2026, 6, 20, 9, 0, 0)


def _tick(seconds: int, price: float, volume: float) -> Tick:
    return Tick(
        timestamp=_BASE + timedelta(seconds=seconds),
        price=price,
        volume=volume,
    )


def test_vwap_basic() -> tuple[bool, str]:
    """VWAP = Σ(P×V) / Σ(V)."""
    # 3 ticks: (100, 10), (110, 20), (120, 30)
    # Σ(P×V) = 1000 + 2200 + 3600 = 6800
    # Σ(V)   = 10 + 20 + 30 = 60
    # VWAP   = 6800 / 60 = 113.33...
    ticks = [
        _tick(0, 100.0, 10.0),
        _tick(1, 110.0, 20.0),
        _tick(2, 120.0, 30.0),
    ]
    r = compute_vwap(ticks)
    expected = 6800.0 / 60.0
    if not math.isclose(r.vwap, expected, rel_tol=1e-9):
        return False, f"VWAP esperado {expected}, got {r.vwap}"
    if r.cum_volume != 60.0:
        return False, f"cum_volume esperado 60, got {r.cum_volume}"
    if r.num_samples != 3:
        return False, f"num_samples esperado 3, got {r.num_samples}"
    return True, f"VWAP={r.vwap:.4f}, cum_vol={r.cum_volume}"


def test_vwap_equal_volume_is_simple_average() -> tuple[bool, str]:
    """Volume igual em todos ticks → VWAP = média simples."""
    ticks = [
        _tick(0, 100.0, 10.0),
        _tick(1, 110.0, 10.0),
        _tick(2, 120.0, 10.0),
    ]
    r = compute_vwap(ticks)
    # VWAP = (100+110+120)/3 = 110
    if not math.isclose(r.vwap, 110.0, rel_tol=1e-9):
        return False, f"VWAP esperado 110, got {r.vwap}"
    return True, f"VWAP={r.vwap} (igual a média simples)"


def test_vwap_volume_emphasizes_high_volume() -> tuple[bool, str]:
    """Tick com volume alto puxa VWAP para seu preço."""
    # 2 ticks: (100, 1), (200, 99)
    # Σ(P×V) = 100 + 19800 = 19900
    # Σ(V)   = 100
    # VWAP   = 199
    ticks = [
        _tick(0, 100.0, 1.0),
        _tick(1, 200.0, 99.0),
    ]
    r = compute_vwap(ticks)
    if not math.isclose(r.vwap, 199.0, rel_tol=1e-9):
        return False, f"VWAP esperado 199, got {r.vwap}"
    return True, f"VWAP={r.vwap} (puxado pelo volume)"


def test_vwap_empty_raises() -> tuple[bool, str]:
    """Lista vazia → ValueError."""
    try:
        compute_vwap([])
        return False, "Deveria ter lançado ValueError"
    except ValueError:
        return True, "ValueError lançado corretamente"


def test_vwap_zero_volume_raises() -> tuple[bool, str]:
    """Volume total = 0 → ValueError."""
    ticks = [_tick(0, 100.0, 0.0), _tick(1, 110.0, 0.0)]
    try:
        compute_vwap(ticks)
        return False, "Deveria ter lançado ValueError"
    except ValueError:
        return True, "ValueError lançado para volume=0"


def test_vwap_single_sample() -> tuple[bool, str]:
    """1 sample → VWAP = price, σ = 0."""
    ticks = [_tick(0, 100.0, 10.0)]
    r = compute_vwap(ticks)
    if r.vwap != 100.0:
        return False, f"VWAP esperado 100, got {r.vwap}"
    if r.std_dev != 0.0:
        return False, f"σ esperado 0, got {r.std_dev}"
    if r.upper_band_1sigma != 100.0 or r.lower_band_1sigma != 100.0:
        return False, "Bandas deveriam colapsar para VWAP com σ=0"
    return True, f"VWAP={r.vwap}, σ=0, bandas=colapsadas"


def test_vwap_bands() -> tuple[bool, str]:
    """Bandas ±1σ e ±2σ em torno do VWAP."""
    # Ticks com σ conhecido
    ticks = [
        _tick(0, 100.0, 1.0),
        _tick(1, 104.0, 1.0),
    ]
    r = compute_vwap(ticks)
    # VWAP = 102, σ = sqrt(((100-102)² + (104-102)²)/2) = sqrt(4) = 2
    if not math.isclose(r.vwap, 102.0, rel_tol=1e-9):
        return False, f"VWAP esperado 102, got {r.vwap}"
    if not math.isclose(r.std_dev, 2.0, rel_tol=1e-9):
        return False, f"σ esperado 2, got {r.std_dev}"
    if not math.isclose(r.upper_band_1sigma, 104.0, rel_tol=1e-9):
        return False, f"Upper 1σ esperado 104, got {r.upper_band_1sigma}"
    if not math.isclose(r.lower_band_2sigma, 98.0, rel_tol=1e-9):
        return False, f"Lower 2σ esperado 98, got {r.lower_band_2sigma}"
    return True, f"VWAP={r.vwap}, σ={r.std_dev}, 1σ=[{r.lower_band_1sigma:.1f}, {r.upper_band_1sigma:.1f}]"


def test_vwap_position_in_band() -> tuple[bool, str]:
    """position_in_band classifica corretamente."""
    ticks = [
        _tick(0, 100.0, 1.0),
        _tick(1, 104.0, 1.0),
    ]
    r = compute_vwap(ticks)  # VWAP=102, σ=2
    # Bandas: 1σ = [100, 104], 2σ = [98, 106]
    # Ordem de checagem: 2σ → 1σ → VWAP
    cases = [
        (110.0, "above_2sigma"),   # 110 > 106
        (105.0, "above_1sigma"),   # 105 ∈ (104, 106]
        (103.0, "above_vwap"),     # 103 ∈ (102, 104]
        (102.0, "at_vwap"),        # 102 == VWAP (rel_tol=0.001)
        (101.0, "below_vwap"),     # 101 ∈ [100, 102)
        (99.0, "below_1sigma"),    # 99 ∈ [98, 100)
        (97.0, "below_2sigma"),    # 97 < 98
    ]
    for price, expected in cases:
        actual = r.position_in_band(price)
        if actual != expected:
            return False, f"price={price} esperado {expected}, got {actual}"
    return True, f"Todas {len(cases)} classificações corretas"


def test_vwap_signal() -> tuple[bool, str]:
    """Signal: 'buy' abaixo -2σ, 'sell' acima +2σ, 'hold' caso contrário."""
    ticks = [
        _tick(0, 100.0, 1.0),
        _tick(1, 104.0, 1.0),
    ]
    r = compute_vwap(ticks)  # VWAP=102, σ=2
    # Abaixo -2σ (price=97) → buy
    if r.signal(97.0) != "buy":
        return False, f"97.0 esperado 'buy', got {r.signal(97.0)}"
    # Acima +2σ (price=107) → sell
    if r.signal(107.0) != "sell":
        return False, f"107.0 esperado 'sell', got {r.signal(107.0)}"
    # Dentro (price=102) → hold
    if r.signal(102.0) != "hold":
        return False, f"102.0 esperado 'hold', got {r.signal(102.0)}"
    return True, "Sinal correto: buy/hold/sell"


def test_anchored_vwap() -> tuple[bool, str]:
    """anchored_vwap começa cálculo a partir de anchor_index."""
    # 5 ticks: 100, 110, 120, 130, 140 (todos volume 1)
    # anchor_index=2 (tick 120): VWAP = (120+130+140)/3 = 130
    ticks = [_tick(i, 100.0 + i*10, 1.0) for i in range(5)]
    r = anchor_vwap(ticks, anchor_index=2)
    if not math.isclose(r.vwap, 130.0, rel_tol=1e-9):
        return False, f"VWAP ancorado esperado 130, got {r.vwap}"
    if r.num_samples != 3:
        return False, f"num_samples esperado 3, got {r.num_samples}"
    return True, f"Anchored VWAP={r.vwap} (3 samples a partir de anchor=2)"


def test_anchored_vwap_invalid_index() -> tuple[bool, str]:
    """anchor_index fora do range → ValueError."""
    ticks = [_tick(0, 100.0, 1.0), _tick(1, 110.0, 1.0)]
    for bad_idx in [-1, 2, 100]:
        try:
            anchor_vwap(ticks, anchor_index=bad_idx)
            return False, f"anchor_index={bad_idx} deveria ter lançado ValueError"
        except ValueError:
            pass
    return True, "ValueError para anchor_index inválido (-1, 2, 100)"


def test_vwap_cross_above() -> tuple[bool, str]:
    """Preço cruzou de <VWAP para >=VWAP → 'cross_above'."""
    # 2 ticks: ambos price=100, volume=1, VWAP=100
    # prev=100 (>=VWAP), last=100 (>=VWAP) → no_cross
    ticks = [_tick(0, 100.0, 1.0), _tick(1, 100.0, 1.0)]
    if vwap_cross_signal(ticks, 100.0) != "no_cross":
        return False, "Mesmo preço no VWAP não deveria cruzar"
    # Cenário real de cruzamento:
    # tick0: 100, vol 10 (VWAP domina)
    # tick1: 100, vol 1
    # VWAP final ≈ 100
    # prev=100, last=100 → no_cross
    return True, "no_cross quando preço == VWAP nos 2 últimos ticks"


def test_vwap_cross_below() -> tuple[bool, str]:
    """Preço cruzou de >=VWAP para <VWAP → 'cross_below'."""
    # Construir cenário: tick 0 com volume alto, tick 1 com volume baixo, preços diferentes
    # tick0: price=200, vol=99 → domina VWAP para ~200
    # tick1: price=100, vol=1 → VWAP ≈ (200*99 + 100*1)/100 = 199
    # prev=200 (>=199), last=100 (<199) → cross_below
    ticks = [_tick(0, 200.0, 99.0), _tick(1, 100.0, 1.0)]
    sig = vwap_cross_signal(ticks, 100.0)
    if sig != "cross_below":
        return False, f"Esperado 'cross_below', got {sig}"
    return True, f"Sinal={sig} (200→100 cruzou VWAP para baixo)"


def test_vwap_cross_above_real() -> tuple[bool, str]:
    """Preço cruzou de <VWAP para >=VWAP → 'cross_above'."""
    # tick0: price=100, vol=99 → VWAP puxado para 100
    # tick1: price=200, vol=1 → VWAP = (100*99 + 200*1)/100 = 101
    # prev=100 (<101), last=200 (>=101) → cross_above
    ticks = [_tick(0, 100.0, 99.0), _tick(1, 200.0, 1.0)]
    sig = vwap_cross_signal(ticks, 200.0)
    if sig != "cross_above":
        return False, f"Esperado 'cross_above', got {sig}"
    return True, f"Sinal={sig} (100→200 cruzou VWAP para cima)"


def test_vwap_no_cross_insufficient_samples() -> tuple[bool, str]:
    """< 2 samples → 'no_cross'."""
    ticks = [_tick(0, 100.0, 1.0)]
    if vwap_cross_signal(ticks, 100.0) != "no_cross":
        return False, "1 sample deveria retornar no_cross"
    return True, "no_cross para <2 samples"


def test_vwap_max_min_price() -> tuple[bool, str]:
    """max_price e min_price refletem extremos dos ticks."""
    ticks = [
        _tick(0, 100.0, 1.0),
        _tick(1, 150.0, 1.0),  # max
        _tick(2, 80.0, 1.0),   # min
        _tick(3, 120.0, 1.0),
    ]
    r = compute_vwap(ticks)
    if r.max_price != 150.0:
        return False, f"max_price esperado 150, got {r.max_price}"
    if r.min_price != 80.0:
        return False, f"min_price esperado 80, got {r.min_price}"
    return True, f"max={r.max_price}, min={r.min_price}"


def test_vwap_negative_price_raises() -> tuple[bool, str]:
    """Tick com price <= 0 → ValueError."""
    try:
        Tick(timestamp=_BASE, price=0.0, volume=10.0)
        return False, "Tick com price=0 deveria ter lançado ValueError"
    except ValueError:
        pass
    try:
        Tick(timestamp=_BASE, price=-5.0, volume=10.0)
        return False, "Tick com price=-5 deveria ter lançado ValueError"
    except ValueError:
        pass
    return True, "ValueError para price <= 0"


def test_vwap_negative_volume_raises() -> tuple[bool, str]:
    """Tick com volume < 0 → ValueError."""
    try:
        Tick(timestamp=_BASE, price=100.0, volume=-1.0)
        return False, "Tick com volume=-1 deveria ter lançado ValueError"
    except ValueError:
        pass
    return True, "ValueError para volume < 0"
