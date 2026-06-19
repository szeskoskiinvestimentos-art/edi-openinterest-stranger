"""
src/calculator - OptionsCalculator package

HISTORICO:
- v1.0 (2026-06-19): Modularizacao. O arquivo src/calculator.py (1178 linhas)
  foi convertido em package src/calculator/. O OptionsCalculator vive em
  src/calculator/core.py, e src/calculator/__init__.py re-exporta.

MIGRACAO:
  ANTES:  from src.calculator import OptionsCalculator
  DEPOIS: from src.calculator import OptionsCalculator  (igual, via __init__)

  Tambem disponivel:
  from src.calculator.core import OptionsCalculator  (importacao direta)

PROXIMOS PASSOS (refactor incremental):
- Extrair metodos para submodulos (walls, flips, flow, volatility, fair_value)
- Manter core.py apenas com OptionsCalculator + __init__ + greeks_exposure
"""
from __future__ import annotations

from src.calculator.core import (
    OptionsCalculator,
    SummaryMetrics,
)

__all__ = ["OptionsCalculator", "SummaryMetrics"]
