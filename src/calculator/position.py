"""
position.py - E66: P&L Calculator para day trade.

Calcula P&L de uma posicao em opcoes ou ativo, considerando:
- Tipo (long/short)
- Entry price, current price
- Quantidade (contracts ou shares)
- Corretagem e impostos (opcional)
- Multiplier (ex: WDO = 1 contrato = BRL multiplier)

Uso:
    pos = Position(side='long', entry=5000.0, current=5050.0, qty=10, multiplier=1.0)
    print(pos.pnl_gross)   # 500.0
    print(pos.pnl_pct)     # 1.0%
    print(pos.breakeven)   # 5000.0

Para opcoes B3 (WDO/WIN):
    pos = Position(side='long', entry=2.50, current=3.00, qty=1, multiplier=1.0)
    # 1 contrato = R$ 0.01 de premio * BRL multiplier (ex: DOL=0.50, WIN=0.20)
    # Se for opcao de WDO: premio * 0.50 * quantidade
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Literal

logger = logging.getLogger(__name__)


Side = Literal["long", "short"]


@dataclass
class Position:
    """Representa uma posicao em ativo ou opcao.

    Atributos:
        side: 'long' (comprado) ou 'short' (vendido)
        entry: preco de entrada
        current: preco atual
        qty: quantidade (contracts ou shares)
        multiplier: multiplicador do ativo (default 1.0)
                   WDO opcao: 0.50, WIN opcao: 0.20, spot: 1.0
        fees: custos fixos (corretagem + impostos) por contrato (default 0.0)
    """

    side: Side
    entry: float
    current: float
    qty: float
    multiplier: float = 1.0
    fees: float = 0.0

    def __post_init__(self) -> None:
        """Validacao basica."""
        if self.side not in ("long", "short"):
            raise ValueError(f"side deve ser 'long' ou 'short': {self.side}")
        if self.entry <= 0 or self.current <= 0:
            raise ValueError(
                f"Precos devem ser > 0: entry={self.entry}, current={self.current}"
            )
        if self.qty <= 0:
            raise ValueError(f"qty deve ser > 0: {self.qty}")
        if self.multiplier <= 0:
            raise ValueError(f"multiplier deve ser > 0: {self.multiplier}")
        if self.fees < 0:
            raise ValueError(f"fees deve ser >= 0: {self.fees}")

    @property
    def pnl_gross(self) -> float:
        """P&L bruto (sem considerar fees)."""
        price_diff = self.current - self.entry
        if self.side == "short":
            price_diff = -price_diff
        return price_diff * self.qty * self.multiplier

    @property
    def pnl_net(self) -> float:
        """P&L liquido (descontando fees)."""
        return self.pnl_gross - self.fees * self.qty

    @property
    def pnl_pct(self) -> float:
        """P&L percentual sobre o capital investido."""
        invested = self.entry * self.qty * self.multiplier
        if invested == 0:
            return 0.0
        return (self.pnl_net / invested) * 100.0

    @property
    def breakeven(self) -> float:
        """Preco de breakeven (considera fees)."""
        # Para breakeven, P&L = 0
        # price_diff * qty * mult = fees * qty
        # price_diff = fees / mult
        # Se long: breakeven = entry + fees/mult
        # Se short: breakeven = entry - fees/mult
        if self.qty == 0 or self.multiplier == 0:
            return self.entry
        breakeven_offset = self.fees / self.multiplier
        if self.side == "long":
            return self.entry + breakeven_offset
        else:
            return self.entry - breakeven_offset

    @property
    def is_profitable(self) -> bool:
        """True se P&L > 0."""
        return self.pnl_net > 0

    def max_loss(self) -> float:
        """Perda maxima teorica (se preco vai a 0 para long, ou a infinito para short).

        Para opcoes (compra): max loss = premio pago + fees
        Para opcoes (venda): max loss teoricamente infinito (short)
        Para spot: depende do tipo
        """
        if self.side == "long":
            # Long: max loss = tudo (preco -> 0)
            return self.pnl_net  # sera o valor mais negativo
        else:
            # Short: max loss ilimitado
            return float("-inf")  # convencao

    def risk_reward_ratio(self, target_price: float) -> float:
        """Calcula ratio risco:recompensa dado um preco alvo.

        Args:
            target_price: preco alvo para fechar a posicao

        Returns:
            ratio = potential_loss / potential_gain (> 1 = mais risco que ganho)
        """
        if target_price == self.current:
            return 0.0
        potential_gain = abs(target_price - self.current) * self.qty * self.multiplier
        if self.side == "long":
            potential_loss = self.pnl_net if self.pnl_net < 0 else 0.0
        else:
            potential_loss = -self.pnl_net if self.pnl_net < 0 else 0.0
        if potential_gain == 0:
            return float("inf") if potential_loss > 0 else 0.0
        return abs(potential_loss) / potential_gain

    def __repr__(self) -> str:
        return (f"Position({self.side}, entry={self.entry:.2f}, current={self.current:.2f}, "
                f"qty={self.qty:.0f}, P&L_net={self.pnl_net:.2f})")
