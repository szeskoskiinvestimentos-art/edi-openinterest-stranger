"""
discovery_levels.py - E45d: Módulo Discovery Levels.

Funcionalidades:
- Fibonacci Retracements entre strikes consecutivos (v3 style)
- Midwalls (interpolação OI entre strikes)
- Range detection (max OI cluster)

Adaptado de v3 (Auto_B3_System/Edi_OpenInterest - PY - Stranger - WDO/src/discovery_levels.py)
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from typing import List, Optional, Sequence, Tuple

import numpy as np


# Fibonacci Retracement levels (proporções clássicas)
FIB_RETRACEMENTS = [0.236, 0.382, 0.500, 0.618, 0.764]
FIB_EXTENSIONS = [1.272, 1.618, 2.000, 2.618]


def compute_fibonacci_levels(
    strikes: Sequence[float],
    percentages: Optional[Sequence[float]] = None,
) -> np.ndarray:
    """
    Calcula niveis de Fibonacci entre strikes consecutivos.

    v3 style (calculator.py:fib_levels): para cada par (lower, upper),
    adiciona lower + p*(upper - lower) para cada p em percentages.

    Args:
        strikes: array ordenado de strikes
        percentages: lista de percentuais (default: 23.6%, 38.2%, 50%, 61.8%, 76.4%)

    Returns:
        array com todos os niveis de Fibonacci (ordenado)

    Edge cases:
        - strikes < 2 elementos: retorna array vazio
        - strikes nao ordenados: ordena internamente
    """
    if len(strikes) < 2:
        return np.array([])

    if percentages is None:
        percentages = FIB_RETRACEMENTS

    strikes_arr = np.sort(np.asarray(strikes, dtype=float))
    fib_levels: List[float] = []

    for i in range(len(strikes_arr) - 1):
        lower = float(strikes_arr[i])
        upper = float(strikes_arr[i + 1])
        dist = upper - lower
        if dist <= 0:
            continue
        for p in percentages:
            if not (0 <= p <= 1):
                continue
            fib_levels.append(lower + p * dist)

    return np.array(fib_levels, dtype=float)


def compute_midwalls(
    strikes: Sequence[float],
    oi_call: Sequence[float],
    oi_put: Sequence[float],
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Calcula midwalls (interpolacao linear de OI entre strikes).

    Midwalls sao "barras sombra" que preenchem os gaps entre strikes
    no grafico de OI. Visualizacao classica do v3.

    Args:
        strikes: array ordenado de strikes
        oi_call: OI de calls por strike
        oi_put: OI de puts por strike

    Returns:
        Tupla (midwalls_strikes, midwalls_call, midwalls_put)

    Edge cases:
        - len(strikes) < 2: retorna arrays vazios
        - tamanhos incompativeis: levanta ValueError
    """
    if len(strikes) < 2:
        return np.array([]), np.array([]), np.array([])

    if len(oi_call) != len(strikes) or len(oi_put) != len(strikes):
        raise ValueError(
            f"Tamanhos incompativeis: strikes={len(strikes)}, "
            f"oi_call={len(oi_call)}, oi_put={len(oi_put)}"
        )

    strikes_arr = np.asarray(strikes, dtype=float)
    call_arr = np.asarray(oi_call, dtype=float)
    put_arr = np.asarray(oi_put, dtype=float)

    # Midpoints entre strikes consecutivos
    midwalls_strikes = (strikes_arr[:-1] + strikes_arr[1:]) / 2.0
    midwalls_call = (call_arr[:-1] + call_arr[1:]) / 2.0
    midwalls_put = (put_arr[:-1] + put_arr[1:]) / 2.0

    return midwalls_strikes, midwalls_call, midwalls_put


def find_range_levels(
    strikes: Sequence[float],
    oi_call: Sequence[float],
    oi_put: Sequence[float],
    n_clusters: int = 3,
) -> dict:
    """
    Identifica clusters de OI para definir range de operacao.

    Procura os top-N clusters (call OI + put OI combinados) e retorna:
    - range_low: menor strike com alto OI
    - range_high: maior strike com alto OI
    - top_strikes: lista dos top N strikes por OI total

    Args:
        strikes: array de strikes
        oi_call, oi_put: arrays de OI
        n_clusters: numero de clusters a retornar (default 3)

    Returns:
        dict com keys: 'range_low', 'range_high', 'top_strikes', 'top_oi_total'

    Edge cases:
        - strikes vazio: retorna dict com valores None
    """
    if len(strikes) == 0:
        return {
            "range_low": None,
            "range_high": None,
            "top_strikes": np.array([]),
            "top_oi_total": np.array([]),
        }

    strikes_arr = np.asarray(strikes, dtype=float)
    call_arr = np.asarray(oi_call, dtype=float)
    put_arr = np.asarray(oi_put, dtype=float)

    # OI total (call + put) por strike
    oi_total = call_arr + put_arr

    # Top N strikes
    n = min(n_clusters, len(strikes_arr))
    top_idx = np.argsort(oi_total)[-n:][::-1]  # descending
    top_strikes = strikes_arr[top_idx]
    top_oi = oi_total[top_idx]

    return {
        "range_low": float(top_strikes.min()),
        "range_high": float(top_strikes.max()),
        "top_strikes": top_strikes,
        "top_oi_total": top_oi,
    }


@dataclass
class DiscoveryResult:
    """Resultado consolidado de Discovery Levels."""
    fib_levels: np.ndarray
    midwalls_strikes: np.ndarray
    midwalls_call: np.ndarray
    midwalls_put: np.ndarray
    range_low: Optional[float]
    range_high: Optional[float]
    top_strikes: np.ndarray
    top_oi_total: np.ndarray

    def fib_count(self) -> int:
        """Numero total de niveis Fibonacci."""
        return len(self.fib_levels)

    def range_width(self) -> Optional[float]:
        """Largura do range (high - low)."""
        if self.range_low is None or self.range_high is None:
            return None
        return self.range_high - self.range_low


def discover_levels(
    strikes: Sequence[float],
    oi_call: Sequence[float],
    oi_put: Sequence[float],
    fib_percentages: Optional[Sequence[float]] = None,
    n_range_clusters: int = 3,
) -> DiscoveryResult:
    """
    Funcao consolidada que retorna todos os niveis de discovery.

    Args:
        strikes: array ordenado de strikes
        oi_call: OI de calls por strike
        oi_put: OI de puts por strike
        fib_percentages: percentuais Fibonacci customizados (default: retraements classicos)
        n_range_clusters: numero de clusters para range detection

    Returns:
        DiscoveryResult com todos os calculos
    """
    fib = compute_fibonacci_levels(strikes, fib_percentages)
    mw_strikes, mw_call, mw_put = compute_midwalls(strikes, oi_call, oi_put)
    range_info = find_range_levels(strikes, oi_call, oi_put, n_range_clusters)

    return DiscoveryResult(
        fib_levels=fib,
        midwalls_strikes=mw_strikes,
        midwalls_call=mw_call,
        midwalls_put=mw_put,
        range_low=range_info["range_low"],
        range_high=range_info["range_high"],
        top_strikes=range_info["top_strikes"],
        top_oi_total=range_info["top_oi_total"],
    )


# Helper: validate inputs
def _validate_inputs(
    strikes: Sequence[float],
    oi_call: Sequence[float],
    oi_put: Sequence[float],
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Valida e normaliza inputs."""
    if len(strikes) == 0:
        raise ValueError("strikes nao pode ser vazio")
    if len(oi_call) != len(strikes):
        raise ValueError(f"oi_call ({len(oi_call)}) deve ter mesmo tamanho que strikes ({len(strikes)})")
    if len(oi_put) != len(strikes):
        raise ValueError(f"oi_put ({len(oi_put)}) deve ter mesmo tamanho que strikes ({len(strikes)})")
    return (
        np.asarray(strikes, dtype=float),
        np.asarray(oi_call, dtype=float),
        np.asarray(oi_put, dtype=float),
    )
