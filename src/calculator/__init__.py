"""Calculator module — Motor de cálculo de opções financeiras.

Este módulo implementa o OptionsCalculator, que processa dados de opções
e calcula métricas como Gamma Flip, Max Pain, Greeks Exposure, e Fair Value.

Exemplo básico:
    from src.calculator import OptionsCalculator
    calc = OptionsCalculator(options_df, spot=50000, expiry_date='2026-06-20')
    calc.calculate_greeks_exposure()
    calc.calculate_flips_and_walls()
    metrics = calc.get_summary_metrics()
"""
from __future__ import annotations

from src.calculator.core import OptionsCalculator, SummaryMetrics

__all__ = ["OptionsCalculator", "SummaryMetrics"]
