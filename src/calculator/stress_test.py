"""
stress_test.py - E23: Stress Testing (Analise de Sensibilidade).

Permite simular cenarios "what-if" para o portfolio:
- Variacao de spot: +1σ, 0, -1σ, -2σ
- Variacao de volatilidade: +50%, 0, -50%
- Time decay: T -> T-1d, T-1w

Para cada cenario, recalcula:
- Gamma Flip
- Walls
- Delta Agregado
- Regime (Gamma +/-)
- Dealer Pressure

Usage:
    from src.calculator.stress_test import StressTest
    st = StressTest(calc)
    results = st.run_all_scenarios()
    for scenario, metrics in results.items():
        print(scenario, metrics['gamma_flip'], metrics['regime'])

Output:
    {
        'baseline': {'spot': 100, 'gamma_flip': 102, 'regime': 'Gamma Positivo', ...},
        'spot_up_1sigma': {'spot': 107, 'gamma_flip': 105, 'regime': '...', ...},
        'spot_down_1sigma': {'spot': 93, ...},
        'vol_up_50pct': {...},
        ...
    }
"""
from __future__ import annotations

import copy
from dataclasses import dataclass, field
from typing import Any, Optional

import numpy as np

from src import config as settings

import logging

logger = logging.getLogger(__name__)


@dataclass
class StressScenario:
    """Cenario de stress individual."""
    name: str
    description: str
    spot_shift_pct: float = 0.0      # ex: +0.05 = +5%
    vol_shift_pct: float = 0.0       # ex: +0.50 = +50%
    time_decay_days: float = 0.0      # ex: 1.0 = -1 dia

    def apply(self, calc) -> dict:
        """Aplica cenario ao calculator e retorna metricas recalculadas."""
        # Salva estado original
        orig_spot = calc.spot
        orig_iv = calc.iv_annual
        orig_T = calc.T
        orig_strikes = calc.strikes_ref.copy() if hasattr(calc, 'strikes_ref') else None
        orig_oi_call = calc.oi_call_ref.copy() if hasattr(calc, 'oi_call_ref') else None
        orig_oi_put = calc.oi_put_ref.copy() if hasattr(calc, 'oi_put_ref') else None
        orig_iv_strike = calc.iv_strike_ref.copy() if calc.iv_strike_ref is not None else None

        try:
            # Aplica shifts
            new_spot = orig_spot * (1 + self.spot_shift_pct)
            new_iv = max(orig_iv * (1 + self.vol_shift_pct), 1e-6)
            new_T = max(orig_T - self.time_decay_days / 252.0, settings.MIN_T_EXPIRY)

            calc.spot = new_spot
            calc.iv_annual = new_iv
            calc.T = new_T

            # Se IV per-strike existe, atualiza proporcionalmente
            if orig_iv_strike is not None:
                ratio = new_iv / orig_iv if orig_iv > 0 else 1.0
                calc.iv_strike_ref = orig_iv_strike * ratio

            # Recalcula metricas principais
            metrics = self._compute_metrics(calc, new_spot)
            metrics['scenario'] = self.name
            metrics['description'] = self.description
            metrics['spot_shift_pct'] = self.spot_shift_pct
            metrics['vol_shift_pct'] = self.vol_shift_pct
            metrics['time_decay_days'] = self.time_decay_days
            return metrics
        finally:
            # Restaura estado original
            calc.spot = orig_spot
            calc.iv_annual = orig_iv
            calc.T = orig_T
            if orig_iv_strike is not None:
                calc.iv_strike_ref = orig_iv_strike

    def _compute_metrics(self, calc, current_spot) -> dict:
        """Calcula metricas principais para o cenario."""
        metrics = {'spot': current_spot}

        try:
            # Tenta recalcular GEX com novos parametros
            calc.calculate_greeks_exposure()
        except Exception as e:
            logger.debug("[E95] _compute_metrics failed: %s", e)
            metrics['error'] = f"greeks_exposure failed: {e}"
            return metrics

        try:
            # Gamma Flip
            if hasattr(calc, 'gex_cum_signed') and calc.gex_cum_signed is not None:
                gamma_flip = calc._find_zero_cross(
                    calc.strikes_ref, calc.gex_cum_signed, current_spot
                )
                metrics['gamma_flip'] = float(gamma_flip) if gamma_flip is not None else None
        except Exception as e:
            logger.debug("[E95] _compute_metrics failed: %s", e)
            metrics['gamma_flip'] = None

        try:
            # Walls
            if hasattr(calc, 'gex_call_tot') and hasattr(calc, 'gex_put_tot'):
                if len(calc.gex_call_tot) > 0 and len(calc.gex_put_tot) > 0:
                    metrics['call_wall'] = float(calc.strikes_ref[np.argmax(calc.gex_call_tot)])
                    metrics['put_wall'] = float(calc.strikes_ref[np.argmax(calc.gex_put_tot)])
        except Exception as e:
            logger.debug("[E95] _compute_metrics failed: %s", e)
            pass

        try:
            # Delta agregado
            if hasattr(calc, 'dexp_tot'):
                metrics['delta_agregado'] = float(np.nansum(calc.dexp_tot))
        except Exception as e:
            logger.debug("[E95] operation failed: %s", e)
            pass

        # Regime
        try:
            gf = metrics.get('gamma_flip')
            if gf is not None and current_spot is not None:
                if current_spot >= gf:
                    metrics['regime'] = 'Gamma Positivo (curva acima)'
                else:
                    metrics['regime'] = 'Gamma Negativo (curva abaixo)'
            else:
                metrics['regime'] = 'indefinido'
        except Exception as e:
            logger.debug("[E95] operation failed: %s", e)
            metrics['regime'] = 'indefinido'

        # IV (atual)
        metrics['iv_annual'] = float(calc.iv_annual) if hasattr(calc, 'iv_annual') else None

        return metrics


# Cenarios padrao (baseado em E23 do IMPLEMENTACOES_FUTURAS.md)
DEFAULT_SCENARIOS = [
    StressScenario(
        name='baseline',
        description='Estado atual sem mudancas',
        spot_shift_pct=0.0,
        vol_shift_pct=0.0,
        time_decay_days=0.0,
    ),
    StressScenario(
        name='spot_up_1sigma',
        description='Spot +1σ (default σ=33%)',
        spot_shift_pct=0.33,
        vol_shift_pct=0.0,
        time_decay_days=0.0,
    ),
    StressScenario(
        name='spot_down_1sigma',
        description='Spot -1σ',
        spot_shift_pct=-0.33,
        vol_shift_pct=0.0,
        time_decay_days=0.0,
    ),
    StressScenario(
        name='spot_down_2sigma',
        description='Spot -2σ (cenario de pânico)',
        spot_shift_pct=-0.66,
        vol_shift_pct=0.0,
        time_decay_days=0.0,
    ),
    StressScenario(
        name='vol_up_50pct',
        description='Volatilidade +50%',
        spot_shift_pct=0.0,
        vol_shift_pct=0.50,
        time_decay_days=0.0,
    ),
    StressScenario(
        name='vol_down_50pct',
        description='Volatilidade -50%',
        spot_shift_pct=0.0,
        vol_shift_pct=-0.50,
        time_decay_days=0.0,
    ),
    StressScenario(
        name='time_decay_1d',
        description='Time decay -1 dia',
        spot_shift_pct=0.0,
        vol_shift_pct=0.0,
        time_decay_days=1.0,
    ),
    StressScenario(
        name='time_decay_1w',
        description='Time decay -1 semana',
        spot_shift_pct=0.0,
        vol_shift_pct=0.0,
        time_decay_days=5.0,
    ),
]


class StressTest:
    """Engine de stress testing para o OptionsCalculator."""

    def __init__(self, calc, scenarios: Optional[list] = None):
        """
        Args:
            calc: instancia de OptionsCalculator
            scenarios: lista de StressScenario (default: DEFAULT_SCENARIOS)
        """
        self.calc = calc
        self.scenarios = scenarios if scenarios is not None else DEFAULT_SCENARIOS

    def run_all_scenarios(self) -> dict:
        """Executa todos os cenarios. Retorna dict {scenario_name: metrics}."""
        results = {}
        for scenario in self.scenarios:
            try:
                metrics = scenario.apply(self.calc)
                results[scenario.name] = metrics
            except Exception as e:
                logger.debug("[E95] run_all_scenarios failed: %s", e)
                results[scenario.name] = {
                    'error': f"{type(e).__name__}: {e}",
                    'scenario': scenario.name,
                }
        return results

    def run_single(self, scenario_name: str) -> Optional[dict]:
        """Executa um cenario especifico."""
        for scenario in self.scenarios:
            if scenario.name == scenario_name:
                return scenario.apply(self.calc)
        return None

    def format_summary_table(self, results: dict) -> str:
        """Formata resultados como tabela legivel."""
        lines = []
        lines.append(f"{'Cenario':<25s} {'Spot':>10s} {'GF':>10s} {'Regime':<25s}")
        lines.append("-" * 75)
        for name, metrics in results.items():
            if 'error' in metrics:
                lines.append(f"{name:<25s} ERRO: {metrics['error'][:40]}")
                continue
            spot = metrics.get('spot', 0)
            gf = metrics.get('gamma_flip', None)
            gf_str = f"{gf:.2f}" if gf is not None else "N/A"
            regime = metrics.get('regime', '?')[:24]
            lines.append(f"{name:<25s} {spot:>10.2f} {gf_str:>10s} {regime:<25s}")
        return "\n".join(lines)


def run_stress_test_cli(calc) -> None:
    """CLI helper: roda stress test e imprime resultados."""
    print("=" * 80)
    print(f"STRESS TEST - Spot={calc.spot}, IV={calc.iv_annual:.2%}, T={calc.T:.4f}")
    print("=" * 80)
    st = StressTest(calc)
    results = st.run_all_scenarios()
    print(st.format_summary_table(results))
