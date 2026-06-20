"""
test_kelly.py - Testes para E67 (Kelly Criterion).
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.calculator.kelly import (
    KellyFraction,
    KellyResult,
    kelly_fraction,
    position_size_from_kelly,
    max_consecutive_losses,
)


def test_kelly_positive_edge() -> tuple[bool, str]:
    """Edge positivo (winrate alto + R/R bom) -> Kelly > 0."""
    # 60% wins, ganho medio 2, perda media 1 -> edge = 0.6*2 - 0.4 = 0.8
    # Full Kelly = 0.8 / 2 = 0.4 (40% do capital)
    result = kelly_fraction(winrate=0.60, avg_win=2.0, avg_loss=1.0)
    if not abs(result.full_kelly - 0.4) < 0.01:
        return False, f"Full Kelly esperado 0.4, got {result.full_kelly}"
    if result.edge <= 0:
        return False, f"Edge deveria ser positivo, got {result.edge}"
    if result.expected_growth <= 0:
        return False, f"Growth esperado > 0, got {result.expected_growth}"
    return True, f"Kelly 60%W R/R=2: full={result.full_kelly:.2f}, edge={result.edge:.2f}"


def test_kelly_zero_edge() -> tuple[bool, str]:
    """Edge zero (50% winrate, R/R=1) -> Kelly = 0."""
    result = kelly_fraction(winrate=0.50, avg_win=1.0, avg_loss=1.0)
    if abs(result.full_kelly) > 0.01:
        return False, f"Kelly edge-zero esperado ~0, got {result.full_kelly}"
    if result.edge != 0:
        return False, f"Edge esperado 0, got {result.edge}"
    return True, f"Kelly edge-zero: full={result.full_kelly}"


def test_kelly_negative_edge_clamped() -> tuple[bool, str]:
    """Edge negativo -> Kelly clamped em 0 (nao apostar)."""
    # 30% wins, R/R=1 -> edge = 0.3 - 0.7 = -0.4 (edge negativo)
    result = kelly_fraction(winrate=0.30, avg_win=1.0, avg_loss=1.0)
    if result.full_kelly != 0.0:
        return False, f"Kelly edge-neg deveria ser 0, got {result.full_kelly}"
    if result.edge >= 0:
        return False, f"Edge deveria ser negativo, got {result.edge}"
    return True, f"Kelly edge-negativo: full={result.full_kelly} (clamped)"


def test_kelly_variants() -> tuple[bool, str]:
    """Variantes (FULL, HALF, QUARTER) escalam o full_kelly."""
    result_full = kelly_fraction(0.60, 2.0, 1.0, KellyFraction.FULL)
    result_half = kelly_fraction(0.60, 2.0, 1.0, KellyFraction.HALF)
    result_quarter = kelly_fraction(0.60, 2.0, 1.0, KellyFraction.QUARTER)

    if not abs(result_full.full_kelly - 0.4) < 0.01:
        return False, f"Full esperado 0.4, got {result_full.full_kelly}"
    if not abs(result_half.recommended - 0.2) < 0.01:
        return False, f"Half esperado 0.2, got {result_half.recommended}"
    if not abs(result_quarter.recommended - 0.1) < 0.01:
        return False, f"Quarter esperado 0.1, got {result_quarter.recommended}"
    return True, f"Variants: full=0.4, half=0.2, quarter=0.1"


def test_kelly_position_size() -> tuple[bool, str]:
    """position_size_from_kelly calcula capital * fraction."""
    # Capital 100k, edge 60%W R/R=2, half kelly (20%)
    # Position size = 100000 * 0.2 = 20000
    size = position_size_from_kelly(100000, 0.60, 2.0, 1.0, KellyFraction.HALF)
    if abs(size - 20000) > 1:
        return False, f"Position size esperado 20000, got {size}"
    return True, f"Capital 100k + Half Kelly 20% = {size}"


def test_kelly_max_consecutive_losses() -> tuple[bool, str]:
    """max_consecutive_losses: 2% por trade, ruin 50% -> ~35 losses."""
    n = max_consecutive_losses(100000, 0.02, ruin_threshold=0.5)
    # (1-0.02)^N = 0.5 -> N = log(0.5)/log(0.98) = 34.0
    if not (33 <= n <= 36):
        return False, f"Max losses consecutivos esperado ~34, got {n}"
    return True, f"2% risk, 50% ruin = {n} losses consecutivos"


def test_kelly_invalid_params_raises() -> tuple[bool, str]:
    """kelly_fraction valida parametros."""
    cases = [
        ("winrate > 1", dict(winrate=1.5, avg_win=2.0, avg_loss=1.0)),
        ("winrate < 0", dict(winrate=-0.1, avg_win=2.0, avg_loss=1.0)),
        ("avg_win <= 0", dict(winrate=0.5, avg_win=0.0, avg_loss=1.0)),
        ("avg_loss <= 0", dict(winrate=0.5, avg_win=2.0, avg_loss=0.0)),
    ]
    for name, kw in cases:
        try:
            kelly_fraction(**kw)
        except ValueError:
            continue
        return False, f"{name}: deveria levantar ValueError"
    return True, "4/4 casos rejeitados"
