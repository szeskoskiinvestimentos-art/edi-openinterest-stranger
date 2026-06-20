"""
E68 — VWAP intraday (Volume-Weighted Average Price) + desvios.

VWAP = Σ(preço × volume) / Σ(volume)

Sinais de trading baseados em VWAP:
- Preço > VWAP: compradores no controle (trend up)
- Preço < VWAP: vendedores no controle (trend down)
- Banda ±k·σ_VWAP: zonas de sobrecompra/sobrevenda técnicas
- Cruzamento de preço sobre/sob VWAP: sinal de continuação ou reversão

Tipicamente calculado a partir de trades (tick data) ou candles de 1min.
Aqui implementamos a versão sample-based (cada sample tem preço, volume e timestamp).

Uso típico (sem dados tick reais): pode ser aplicado a candles com:
  - price = (high+low+close)/3 (typical price) ou close
  - volume = volume do candle
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Sequence, Tuple

import math


@dataclass(frozen=True)
class Tick:
    """Amostra de trade ou candle para cálculo de VWAP."""
    timestamp: datetime
    price: float
    volume: float

    def __post_init__(self) -> None:
        if self.price <= 0:
            raise ValueError(f"price deve ser > 0, got {self.price}")
        if self.volume < 0:
            raise ValueError(f"volume deve ser >= 0, got {self.volume}")


@dataclass
class VWAPResult:
    """Resultado do cálculo de VWAP."""
    vwap: float
    cum_volume: float
    cum_pv: float  # Σ(price × volume)
    num_samples: int
    upper_band_1sigma: float
    lower_band_1sigma: float
    upper_band_2sigma: float
    lower_band_2sigma: float
    std_dev: float
    max_price: float
    min_price: float

    def position_in_band(self, current_price: float) -> str:
        """
        Classifica onde o preço está vs VWAP e bandas.
        Retorna: 'above_2sigma' | 'above_1sigma' | 'above_vwap'
                | 'at_vwap' | 'below_vwap' | 'below_1sigma' | 'below_2sigma'
        """
        if current_price >= self.upper_band_2sigma:
            return "above_2sigma"
        if current_price >= self.upper_band_1sigma:
            return "above_1sigma"
        if current_price > self.vwap:
            return "above_vwap"
        if math.isclose(current_price, self.vwap, rel_tol=0.001):
            return "at_vwap"
        if current_price <= self.lower_band_2sigma:
            return "below_2sigma"
        if current_price <= self.lower_band_1sigma:
            return "below_1sigma"
        return "below_vwap"

    def signal(self, current_price: float) -> str:
        """
        Sinal de trading baseado em VWAP.
        - 'buy': preço < VWAP - 2σ (sobrevendido)
        - 'sell': preço > VWAP + 2σ (sobrecomprado)
        - 'hold': dentro das bandas
        """
        pos = self.position_in_band(current_price)
        if pos == "below_2sigma":
            return "buy"
        if pos == "above_2sigma":
            return "sell"
        return "hold"


def compute_vwap(ticks: Sequence[Tick]) -> VWAPResult:
    """
    Calcula VWAP intraday + bandas ±1σ e ±2σ.

    Fórmula:
        VWAP = Σ(P_i × V_i) / Σ(V_i)
        σ² = Σ(V_i × (P_i - VWAP)²) / Σ(V_i)   [populacional ponderada por volume]
        banda_k = VWAP ± k·σ

    Edge cases:
        - Lista vazia → ValueError
        - Volume total = 0 → ValueError (divisão por zero)
        - 1 sample → VWAP = price, σ = 0, bandas = VWAP
    """
    if not ticks:
        raise ValueError("Lista de ticks vazia")

    cum_pv = 0.0
    cum_vol = 0.0
    prices: List[float] = []
    max_p = -math.inf
    min_p = math.inf

    for t in ticks:
        cum_pv += t.price * t.volume
        cum_vol += t.volume
        prices.append(t.price)
        if t.price > max_p:
            max_p = t.price
        if t.price < min_p:
            min_p = t.price

    if cum_vol == 0:
        raise ValueError("Volume total = 0, impossível calcular VWAP")

    vwap = cum_pv / cum_vol

    # Desvio padrão ponderado por volume
    if len(ticks) == 1:
        std_dev = 0.0
    else:
        # Variação amostral ponderada (Bessel-corrected)
        sum_w_sq_dev = sum(t.volume * (t.price - vwap) ** 2 for t in ticks)
        # weighted variance: divisor = (N-1)/N * sum(w)
        std_dev = math.sqrt(sum_w_sq_dev / cum_vol)

    return VWAPResult(
        vwap=vwap,
        cum_volume=cum_vol,
        cum_pv=cum_pv,
        num_samples=len(ticks),
        upper_band_1sigma=vwap + std_dev,
        lower_band_1sigma=vwap - std_dev,
        upper_band_2sigma=vwap + 2 * std_dev,
        lower_band_2sigma=vwap - 2 * std_dev,
        std_dev=std_dev,
        max_price=max_p,
        min_price=min_p,
    )


def anchor_vwap(
    ticks: Sequence[Tick],
    anchor_index: int = 0,
) -> VWAPResult:
    """
    Anchored VWAP: começa cálculo a partir de anchor_index.
    Útil para medir VWAP desde um evento (abertura, notícia, suporte).

    anchor_index deve apontar para o tick que marca o início do cálculo.
    """
    if anchor_index < 0 or anchor_index >= len(ticks):
        raise ValueError(
            f"anchor_index {anchor_index} fora de [0, {len(ticks)})"
        )
    return compute_vwap(ticks[anchor_index:])


def session_vwap(
    ticks: Sequence[Tick],
    session_start_hour: int = 9,
    session_start_minute: int = 0,
) -> Tuple[VWAPResult, List[VWPPartial]]:
    """
    VWAP resetado por sessão.
    Filtra ticks a partir de session_start_hour:session_start_minute do dia do primeiro tick.

    Retorna (VWAPResult final, lista de parciais por dia).
    Útil para day trade B3 (sessão 09:00-17:30).
    """
    if not ticks:
        raise ValueError("Lista de ticks vazia")

    first_day = ticks[0].timestamp.date()
    session_dt = datetime.combine(
        first_day,
        __import__("datetime").time(session_start_hour, session_start_minute),
    )

    session_ticks = [t for t in ticks if t.timestamp >= session_dt]
    if not session_ticks:
        raise ValueError("Nenhum tick a partir do session_start")

    final = compute_vwap(session_ticks)
    return final, []  # partials omitted for simplicity (single-session)


def vwap_cross_signal(
    ticks: Sequence[Tick],
    current_price: float,
) -> str:
    """
    Detecta cruzamento de preço sobre/sob VWAP nos últimos 2 ticks.
    - 'cross_above': preço cruzou de <VWAP para >=VWAP
    - 'cross_below': preço cruzou de >=VWAP para <VWAP
    - 'no_cross': sem cruzamento

    Útil para sinais de reversão/continuação.
    """
    if len(ticks) < 2:
        return "no_cross"

    vwap_result = compute_vwap(ticks)
    prev_price = ticks[-2].price
    last_price = ticks[-1].price

    prev_above = prev_price >= vwap_result.vwap
    last_above = last_price >= vwap_result.vwap

    if last_above and not prev_above:
        return "cross_above"
    if not last_above and prev_above:
        return "cross_below"
    return "no_cross"
