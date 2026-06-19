"""Shared test fixtures for EDI Market Guardian tests."""
from __future__ import annotations

import numpy as np
import pandas as pd
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def synthetic_options_data(spot=100.0, strikes=None):
    """Returns a DataFrame with synthetic option chain data."""
    if strikes is None:
        strikes = np.arange(80, 121, 5)

    data = []
    for k in strikes:
        moneyness = abs(k - spot) / spot
        iv = 0.20 + 0.5 * moneyness**2
        oi_call = max(100, 500 - abs(k - spot) * 10)
        oi_put = max(100, 500 - abs(k - spot) * 10)

        data.append({'StrikeK': k, 'OptionType': 'CALL', 'Open Int': oi_call,
                     'Last': max(0.1, spot - k + 5), 'IV': iv, 'Volume': oi_call // 10})
        data.append({'StrikeK': k, 'OptionType': 'PUT', 'Open Int': oi_put,
                     'Last': max(0.1, k - spot + 5), 'IV': iv, 'Volume': oi_put // 10})

    return pd.DataFrame(data)


def simple_calc(spot=100.0, expiry='2026-06-25'):
    """Returns a pre-configured OptionsCalculator with synthetic data."""
    from src.calculator import OptionsCalculator
    df = synthetic_options_data(spot=spot)
    return OptionsCalculator(
        options_df=df, spot=spot, expiry_date=expiry,
        iv_annual=0.20, risk_free=0.05,
    )


def spot_100_strikes():
    """Returns standard strikes array for testing."""
    return np.arange(80, 121, 5)
