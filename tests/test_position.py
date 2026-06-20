"""
test_position.py - Testes para E66 (P&L Calculator).
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.calculator.position import Position


def test_position_long_profit() -> tuple[bool, str]:
    """Position long: preco subiu -> P&L positivo."""
    pos = Position(side="long", entry=100.0, current=110.0, qty=10)
    if pos.pnl_gross != 100.0:
        return False, f"P&L bruto esperado 100, got {pos.pnl_gross}"
    if pos.pnl_net != 100.0:  # sem fees
        return False, f"P&L liquido esperado 100, got {pos.pnl_net}"
    if abs(pos.pnl_pct - 10.0) > 0.01:
        return False, f"P&L % esperado 10%, got {pos.pnl_pct}"
    if not pos.is_profitable:
        return False, "Deveria ser profitable"
    return True, f"Long: P&L = {pos.pnl_gross} (+{pos.pnl_pct:.1f}%)"


def test_position_long_loss() -> tuple[bool, str]:
    """Position long: preco caiu -> P&L negativo."""
    pos = Position(side="long", entry=100.0, current=90.0, qty=10)
    if pos.pnl_gross != -100.0:
        return False, f"P&L bruto esperado -100, got {pos.pnl_gross}"
    if pos.is_profitable:
        return False, "Nao deveria ser profitable"
    return True, f"Long: P&L = {pos.pnl_gross} ({pos.pnl_pct:.1f}%)"


def test_position_short_profit() -> tuple[bool, str]:
    """Position short: preco caiu -> P&L positivo (vendeu caro, comprou barato)."""
    pos = Position(side="short", entry=100.0, current=90.0, qty=10)
    if pos.pnl_gross != 100.0:
        return False, f"Short: P&L bruto esperado 100, got {pos.pnl_gross}"
    if not pos.is_profitable:
        return False, "Short em queda deveria ser profitable"
    return True, f"Short: P&L = {pos.pnl_gross} ({pos.pnl_pct:.1f}%)"


def test_position_with_multiplier_wdo() -> tuple[bool, str]:
    """WDO opcao: multiplier 0.50. Premio subiu 1.0 -> P&L 5.0 por contrato."""
    pos = Position(side="long", entry=2.50, current=3.50, qty=2, multiplier=0.50)
    # diff = 1.0, qty = 2, mult = 0.50 -> 1.0 * 2 * 0.50 = 1.0
    if abs(pos.pnl_gross - 1.0) > 0.01:
        return False, f"WDO P&L esperado 1.0, got {pos.pnl_gross}"
    return True, f"WDO: 2 contratos, mult=0.50, P&L = {pos.pnl_gross}"


def test_position_with_fees() -> tuple[bool, str]:
    """Fees sao descontados do P&L liquido."""
    pos = Position(side="long", entry=100.0, current=110.0, qty=10, fees=1.0)
    # P&L bruto = 100, fees total = 1*10 = 10
    # P&L liquido = 100 - 10 = 90
    if abs(pos.pnl_net - 90.0) > 0.01:
        return False, f"P&L liquido esperado 90, got {pos.pnl_net}"
    # Breakeven: 100 + 10/10 = 101
    if abs(pos.breakeven - 101.0) > 0.01:
        return False, f"Breakeven esperado 101, got {pos.breakeven}"
    return True, f"Fees: P&L_liq={pos.pnl_net}, breakeven={pos.breakeven}"


def test_position_validation() -> tuple[bool, str]:
    """Position valida parametros."""
    cases = [
        ("side invalido", dict(side="invalid", entry=100, current=110, qty=10)),
        ("qty <= 0", dict(side="long", entry=100, current=110, qty=-1)),
        ("preco <= 0", dict(side="long", entry=-100, current=110, qty=10)),
    ]
    for name, kw in cases:
        try:
            Position(**kw)
        except ValueError:
            continue
        return False, f"{name}: deveria levantar ValueError"
    return True, "3/3 casos rejeitados"


def test_position_risk_reward() -> tuple[bool, str]:
    """Risk/reward ratio para alvo."""
    pos = Position(side="long", entry=100, current=105, qty=10)
    # Alvo 110 (ganho potencial: 5*10 = 50)
    # Loss atual: 0 (em lucro)
    rr = pos.risk_reward_ratio(target_price=110)
    # loss=0, gain=50 -> ratio 0
    if abs(rr) > 0.01:
        return False, f"Risk/reward esperado 0, got {rr}"
    return True, f"Risk/reward (alvo 110, current 105) = {rr}"
