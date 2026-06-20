"""
kelly.py - E67: Kelly Criterion para position sizing day trade.

O Kelly Criterion responde: "dado um edge (winrate e risk/reward),
quanto do capital arriscar por trade?"

Formula classica (binary outcome):
    f* = (p * b - q) / b
    onde:
        p = probabilidade de win
        q = 1 - p = probabilidade de loss
        b = ratio de ganho (win_size / loss_size)

Para day trade com 3 estados (win/loss/breakeven):
    f* = (p * b - q) / b
    onde b = avg_win / avg_loss

Variantes para day trade:
- Full Kelly: arrisca 100% do edge (otimo geometricamente mas volátil)
- Half Kelly (1/2): mais conservador, ~75% do crescimento com menos variancia
- Quarter Kelly (1/4): ainda mais conservador (~50% do crescimento)

Referencias:
    Kelly, J. (1956) "A New Interpretation of Information Rate"
    Thorp, E. (2006) "The Kelly Criterion in Blackjack, Sports Betting, and the Stock Market"
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class KellyFraction(Enum):
    """Variantes do Kelly para day trade."""
    FULL = 1.0
    HALF = 0.5
    QUARTER = 0.25
    TENTH = 0.1


@dataclass
class KellyResult:
    """Resultado do calculo de Kelly.

    Atributos:
        full_kelly: fracao otima (0 a 1)
        recommended: fracao recomendada (com base em KellyFraction)
        edge: edge do trader (p*b - q, >0 = edge positivo)
        expected_growth: taxa de crescimento esperada por trade (Kelly log-optimal)
    """

    full_kelly: float
    recommended: float
    edge: float
    expected_growth: float


def kelly_fraction(
    winrate: float,
    avg_win: float,
    avg_loss: float,
    variant: KellyFraction = KellyFraction.HALF,
) -> KellyResult:
    """Calcula Kelly Criterion com fracao configuravel.

    Args:
        winrate: probabilidade de win (0 a 1)
        avg_win: ganho medio em caso de win (valor absoluto, > 0)
        avg_loss: perda media em caso de loss (valor absoluto, > 0)
        variant: fracao do Kelly (default: HALF para day trade)

    Returns:
        KellyResult com full_kelly, recommended, edge, expected_growth

    Raises:
        ValueError: se parametros invalidos
    """
    if not (0 <= winrate <= 1):
        raise ValueError(f"winrate deve estar em [0, 1]: {winrate}")
    if avg_win <= 0:
        raise ValueError(f"avg_win deve ser > 0: {avg_win}")
    if avg_loss <= 0:
        raise ValueError(f"avg_loss deve ser > 0: {avg_loss}")

    p = winrate
    q = 1 - winrate
    b = avg_win / avg_loss  # ratio gain/loss

    # Full Kelly
    f_star = (p * b - q) / b
    edge = p * b - q

    # Clamp em [0, 1] para evitar alavancagem infinita
    full_kelly = max(0.0, min(1.0, f_star))

    # Variante aplicada
    recommended = full_kelly * variant.value
    recommended = max(0.0, min(1.0, recommended))

    # Expected growth (log-utility) - aproximado para Kelly
    # g = p * log(1 + b*f) + q * log(1 - f)
    # Para Kelly otimo, g = -log(1 - edge) (aproximacao)
    if edge > 0:
        import math
        expected_growth = -math.log(1 - edge)
    else:
        expected_growth = 0.0

    return KellyResult(
        full_kelly=full_kelly,
        recommended=recommended,
        edge=edge,
        expected_growth=expected_growth,
    )


def position_size_from_kelly(
    capital: float,
    winrate: float,
    avg_win: float,
    avg_loss: float,
    variant: KellyFraction = KellyFraction.HALF,
) -> float:
    """Calcula o tamanho da posicao em moeda (R$) dado capital e Kelly.

    Args:
        capital: capital total disponivel
        winrate, avg_win, avg_loss: parametros do edge
        variant: fracao do Kelly

    Returns:
        Tamanho da posicao em R$ (capital * recommended_fraction)
    """
    result = kelly_fraction(winrate, avg_win, avg_loss, variant)
    return capital * result.recommended


def max_consecutive_losses(
    capital: float,
    risk_per_trade: float,
    ruin_threshold: float = 0.5,
) -> int:
    """Estima maximo de losses consecutivos antes de atingir ruin threshold.

    Args:
        capital: capital inicial
        risk_per_trade: fracao arriscada por trade (ex: 0.02 = 2%)
        ruin_threshold: limite de "ruina" (ex: 0.5 = 50% do capital perdido)

    Returns:
        Numero de losses consecutivos que levam ao ruin_threshold
    """
    if risk_per_trade <= 0 or risk_per_trade >= 1:
        return 0
    if ruin_threshold <= 0 or ruin_threshold >= 1:
        return 0
    # Apos N losses, capital = capital * (1 - risk)^N
    # Queremos capital * (1 - risk)^N = capital * (1 - ruin_threshold)
    # (1 - risk)^N = 1 - ruin_threshold
    # N * log(1 - risk) = log(1 - ruin_threshold)
    import math
    if risk_per_trade >= 1.0:
        return 1  # risco total = 1 loss = ruin
    n = math.log(1 - ruin_threshold) / math.log(1 - risk_per_trade)
    return int(n)
