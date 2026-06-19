"""Core do Calculator — OptionsCalculator principal.

Contém a classe OptionsCalculator que orquestra todos os cálculos
de opções financeiras (Greeks, Gamma Flip, Max Pain, Walls, etc.).

Classes:
    OptionsCalculator: Motor principal de cálculo de opções.
    SummaryMetrics: TypedDict com métricas resumidas para o dashboard.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from src import config as settings
import datetime as dt
import logging
from src.greeks import GreeksEngine
from typing import Any, Optional, TypedDict, cast
from src.calculator.flips import FlipsMixin
from src.calculator.greeks_exposure import GreeksExposureMixin
from src.calculator.volatility import VolatilityMixin
from src.calculator.walls import WallsMixin
from src.calculator.fair_value import FairValueMixin

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SummaryMetrics(TypedDict):
    spot: float
    delta_agregado: float
    gamma_flip: Optional[float]
    gamma_flip_hvl: Optional[float]
    zero_gamma_level: Optional[float]
    max_pain: Optional[float]
    call_wall: float
    put_wall: float
    effective_call_wall: float
    effective_put_wall: float
    regime: str
    dealer_pressure: float
    dpi_arr: Any
    range_low: float
    range_high: float
    walls_call_txt: str
    walls_put_txt: str
    iv_daily: float
    dataref: Any
    vol_analysis: Any
    pinning_risk: Any
    expected_moves: Any

class OptionsCalculator(FlipsMixin, GreeksExposureMixin, VolatilityMixin, WallsMixin, FairValueMixin):
    """Motor principal de cálculo de opções financeiras.

    Processa DataFrame de opções e calcula métricas de risco como:
    - Gamma Flip (7 variações: Classic, Spline, HVL, HVL Log, Sigma Kernel, PVOP, HVL Gaussian)
    - Max Pain (preço de máxima dor para compradores)
    - Greeks Exposure (Delta, Gamma, Charm, Vanna, Vega, Theta)
    - Effective Walls (Call Wall, Put Wall ponderados por OI)
    - Fair Value (simulação de cenários)
    - Expected Moves (variação esperada baseada em IV)

    Attributes:
        options_df: DataFrame com dados das opções (StrikeK, OptionType, Open Int, etc.)
        spot: Preço spot do ativo subjacente
        expiry_date: Data de vencimento das opções
        risk_free: Taxa livre de risco anual
        iv_annual: Volatilidade implícita anual (fallback)
        strikes_ref: Array ordenado de strikes únicos
        T: Tempo até vencimento em anos (business days / 252)

    Exemplo:
        >>> calc = OptionsCalculator(df, spot=50000, expiry_date='2026-06-20')
        >>> calc.calculate_greeks_exposure()
        >>> calc.calculate_flips_and_walls()
        >>> metrics = calc.get_summary_metrics()
    """
    def __init__(self, options_df, spot, expiry_date, risk_free=settings.RISK_FREE, iv_annual=settings.IV_ANNUAL):
        self.options_df = options_df.copy()
        self.spot = float(spot)
        self.expiry_date = expiry_date
        self.risk_free = float(risk_free)
        self.iv_annual = float(iv_annual)
        self.dataref = settings.DATAREF

        logger.info(f"OptionsCalculator initialized: Spot={self.spot:.2f}, Expiry={self.expiry_date}")

        if 'Expiry' not in self.options_df.columns:
            self.options_df['Expiry'] = pd.to_datetime(self.expiry_date) if self.expiry_date else pd.NaT
        else:
            self.options_df['Expiry'] = pd.to_datetime(self.options_df['Expiry'])

        self.options_df['StrikeK'] = pd.to_numeric(self.options_df['StrikeK'], errors='coerce')
        self.options_df = self.options_df.dropna(subset=['StrikeK'])

        self.strikes_ref = np.sort(self.options_df['StrikeK'].unique())

        bdays = int(np.busday_count(self.dataref, self.expiry_date)) if self.expiry_date else 1
        is_0dte = bool(self.expiry_date) and (self.dataref == self.expiry_date)
        if getattr(settings, 'USE_ODTE_MODE', False) and is_0dte:
            self.T = settings.MIN_T_EXPIRY
        else:
            self.T = (1.0/252.0) if bdays <= 0 else (bdays/252.0)

        self.oi_call = self.options_df.loc[self.options_df['OptionType']=='CALL'].groupby('StrikeK')['Open Int'].sum()
        self.oi_put  = self.options_df.loc[self.options_df['OptionType']=='PUT'].groupby('StrikeK')['Open Int'].sum()

        self.oi_call_ref = np.array([self.oi_call.get(k, 0.0) for k in self.strikes_ref], dtype=float)
        self.oi_put_ref  = np.array([self.oi_put.get(k, 0.0)  for k in self.strikes_ref], dtype=float)

        if 'Volume' in self.options_df.columns:
            self.vol_call = self.options_df.loc[self.options_df['OptionType']=='CALL'].groupby('StrikeK')['Volume'].sum()
            self.vol_put  = self.options_df.loc[self.options_df['OptionType']=='PUT'].groupby('StrikeK')['Volume'].sum()
        else:
            self.vol_call = pd.Series(dtype=float)
            self.vol_put = pd.Series(dtype=float)

        self.vol_call_ref = np.array([self.vol_call.get(k, 0.0) for k in self.strikes_ref], dtype=float)
        self.vol_put_ref  = np.array([self.vol_put.get(k, 0.0)  for k in self.strikes_ref], dtype=float)


        self.iv_strike_ref = None
        iv_col = None
        for col in ['IV', 'Implied Volatility', 'ImpliedVol', 'iv']:
            if col in self.options_df.columns:
                iv_col = col
                break

        fallback_iv = float(self.iv_annual) if np.isfinite(self.iv_annual) and self.iv_annual > 0 else float(getattr(settings, 'HVL_ANNUAL', 0.12))

        if iv_col:
            iv_raw_series = self.options_df[iv_col].copy()
            if not np.issubdtype(iv_raw_series.dtype, np.number):
                iv_raw_series = iv_raw_series.astype(str).str.replace('%', '', regex=False).str.replace(',', '.', regex=False)
            iv_num = pd.Series(pd.to_numeric(iv_raw_series, errors='coerce'))
            iv_num = iv_num.astype(float)
            iv_num.loc[iv_num <= 0] = np.nan

            if int(iv_num.notna().sum()) == 0 and ("Last" in self.options_df.columns):
                df_iv = self.options_df[["StrikeK", "OptionType", "Expiry", "Last"]].copy()
                last_numeric = pd.to_numeric(df_iv["Last"], errors="coerce")
                df_iv["Last"] = pd.Series(last_numeric, index=df_iv.index, dtype="float64")
                df_iv.loc[df_iv["Last"] <= 0, "Last"] = np.nan

                expiry_min = None
                try:
                    expiry_min = pd.to_datetime(df_iv["Expiry"], errors="coerce").dropna().min()
                except Exception:
                    expiry_min = None
                if expiry_min is not None and pd.notnull(expiry_min):
                    df_iv = df_iv[pd.to_datetime(df_iv["Expiry"], errors="coerce") == expiry_min]

                dataref_dt = pd.to_datetime(self.dataref)

                def _implied_vol_bisect(price, S, K, T, r, typ):
                    if not (np.isfinite(price) and np.isfinite(S) and np.isfinite(K) and np.isfinite(T) and np.isfinite(r)):
                        return None
                    if price <= 0 or S <= 0 or K <= 0 or T <= 0:
                        return None
                    intrinsic = max(0.0, S - K) if typ == "C" else max(0.0, K - S)
                    if price < intrinsic:
                        return None

                    lo = 1e-6
                    hi = 5.0
                    p_hi = float(GreeksEngine.bs_price(S, K, T, r, hi, typ))
                    if not np.isfinite(p_hi) or p_hi < price:
                        return None

                    for _ in range(60):
                        mid = 0.5 * (lo + hi)
                        p_mid = float(GreeksEngine.bs_price(S, K, T, r, mid, typ))
                        if not np.isfinite(p_mid):
                            hi = mid
                            continue
                        if p_mid > price:
                            hi = mid
                        else:
                            lo = mid
                    return 0.5 * (lo + hi)

                rows = []
                for _, row in df_iv.iterrows():
                    k = row.get("StrikeK")
                    last = row.get("Last")
                    if not (np.isfinite(k) and np.isfinite(last)):
                        continue
                    opt = str(row.get("OptionType") or "").strip().upper()
                    if opt not in ("CALL", "PUT", "C", "P"):
                        continue
                    typ = "C" if opt in ("CALL", "C") else "P"
                    is_otm = (typ == "C" and float(k) >= self.spot) or (typ == "P" and float(k) <= self.spot)
                    if not is_otm:
                        continue

                    expiry_dt = pd.to_datetime(row.get("Expiry"), errors="coerce")
                    if pd.isnull(expiry_dt):
                        T_row = float(self.T)
                    else:
                        bdays = int(np.busday_count(dataref_dt.date(), expiry_dt.date()))
                        T_row = float(max(bdays, 1) / 252.0)

                    iv = _implied_vol_bisect(float(last), float(self.spot), float(k), max(T_row, float(settings.EPSILON)), float(self.risk_free), typ)
                    if iv is None or not np.isfinite(iv) or iv <= 0:
                        continue
                    rows.append((float(k), float(iv)))

                if rows:
                    tmp = pd.DataFrame(rows, columns=pd.Index(["StrikeK", "_iv_calc"]))
                    iv_series = tmp.groupby("StrikeK")["_iv_calc"].median()
                    iv_ref = iv_series.reindex(self.strikes_ref)
                    iv_ref = iv_ref.interpolate(method="linear", limit_direction="both").fillna(fallback_iv)
                    self.iv_strike_ref = np.clip(iv_ref.to_numpy(dtype=float), 1e-6, 5.0)
                else:
                    self.iv_strike_ref = np.full_like(self.strikes_ref, fallback_iv, dtype=float)
            else:
                tmp_iv = pd.DataFrame({'StrikeK': self.options_df['StrikeK'].values, '_iv': iv_num.values})
                iv_series = tmp_iv.groupby('StrikeK')['_iv'].mean()
                iv_ref = iv_series.reindex(self.strikes_ref)
                iv_ref_values = iv_ref.to_numpy(dtype=float)
                finite = np.isfinite(iv_ref_values)
                median_val = float(np.nanmedian(iv_ref_values[finite])) if finite.any() else float('nan')
                if np.isfinite(median_val) and median_val > 5.0:
                    iv_ref_values = iv_ref_values / 100.0
                    iv_ref = pd.Series(iv_ref_values, index=iv_ref.index)

                iv_ref = iv_ref.interpolate(method='linear', limit_direction='both').fillna(fallback_iv)
                self.iv_strike_ref = np.clip(iv_ref.to_numpy(dtype=float), 1e-6, 5.0)
        else:
            self.iv_strike_ref = np.full_like(self.strikes_ref, fallback_iv, dtype=float)

        self.gamma_flip = None
        self.gamma_flip_hvl = None
        self.zero_gamma_level = None
        self.max_pain = None
        self.call_wall = None
        self.put_wall = None
        self.midwalls_strikes = np.array([])
        self.midwalls_call = np.array([])
        self.midwalls_put = np.array([])
        self.iv_skew = np.array([])

        self.gex_call_tot = np.zeros_like(self.strikes_ref, dtype=float)
        self.gex_put_tot = np.zeros_like(self.strikes_ref, dtype=float)

        self.max_pain_profile = None
        self.expected_moves = None
        self.mm_pnl_simulation = None

    def calculate_flips_and_walls(self):
        """Calcula Gamma Flip, Max Pain, Walls e métricas derivadas.

        Executa a sequência completa de cálculos:
        1. Gamma Flip (interpolação linear do zero-crossing do GEX cumulado)
        2. Gamma Flip HVL (High Volatility Level, ponderado por volatilidade)
        3. Zero Gamma Level (mesmo que Gamma Flip com fallback)
        4. Max Pain (strike com menor perda para compradores)
        5. Call Wall / Put Wall (strikes com maior GEX)
        6. Effective Walls (média ponderada dos top 2 strikes por OI)
        7. Midwalls (interpolação de OI entre strikes)
        8. Fibonacci Levels (níveis de suporte/resistência)
        9. Flip Variations (7 modelos de Gamma Flip)
        10. Delta Flip Profile (simulação Spot +/- 15%)
        11. Gamma Flip Cone (incerteza via variação de sigma_factor)
        12. Flow Sentiment (análise Bull/Bear por volume)
        13. Expected Moves (variação esperada por horizonte)
        14. MM PnL Simulation (PnL do Market Maker)

        Raises:
            Exception: Erros são logados mas não propagados (pipeline continua).
        """
        try:
            self.gamma_flip = self._find_zero_cross(self.strikes_ref, self.gex_cum_signed, self.spot)
        except Exception as e:
            logger.error(f"Erro ao calcular Gamma Flip: {e}")
            self.gamma_flip = None

        self.gamma_flip_hvl = self._calculate_hvl_flip()

        self.zero_gamma_level = self.gamma_flip
        try:
            idx_cross = np.where(np.diff(np.sign(self.gex_cum_signed)))[0]
            if len(idx_cross) > 0:
                i = int(idx_cross[int(np.argmin(np.abs(self.strikes_ref[idx_cross] - float(self.spot))))])
                y1, y2 = float(self.gex_cum_signed[i]), float(self.gex_cum_signed[i + 1])
                x1, x2 = float(self.strikes_ref[i]), float(self.strikes_ref[i + 1])
                if y2 != y1:
                    self.zero_gamma_level = float(x1 - y1 * (x2 - x1) / (y2 - y1))
                else:
                    self.zero_gamma_level = float(x1)
        except Exception:
            self.zero_gamma_level = self.gamma_flip

        self.max_pain = self.calculate_max_pain()

        try:
            self.call_wall = self.strikes_ref[np.argmax(np.array(self.gex_call_tot))]
            self.put_wall = self.strikes_ref[np.argmax(np.array(self.gex_put_tot))]
            self.calculate_effective_walls()
        except:
            self.call_wall = self.spot
            self.put_wall = self.spot
            self.effective_call_wall = self.spot
            self.effective_put_wall = self.spot

        try:
            self.midwalls_strikes = (self.strikes_ref[:-1] + self.strikes_ref[1:]) / 2
            self.midwalls_call = (self.oi_call_ref[:-1] + self.oi_call_ref[1:]) / 2
            self.midwalls_put  = (self.oi_put_ref[:-1]  + self.oi_put_ref[1:]) / 2
        except:
            self.midwalls_strikes = np.array([])
            self.midwalls_call = np.array([])
            self.midwalls_put = np.array([])

        self.fib_levels = []
        try:
            fib_percs = [0.236, 0.382, 0.618, 0.764]
            for i in range(len(self.strikes_ref)-1):
                lower = float(self.strikes_ref[i])
                upper = float(self.strikes_ref[i+1])
                dist = upper - lower
                for p in fib_percs:
                    self.fib_levels.append(lower + p*dist)
            self.fib_levels = np.array(self.fib_levels)
        except:
            self.fib_levels = np.array([])

        self.r_gamma_exposure = self.gex_flip_base
        self.r_gamma_cum = self.gex_cum_signed

        self.flip_variations = {}
        self.delta_flip_profile = {}
        self.flow_sentiment = {}
        self.gamma_flip_cone = {}

        try:
            self.calculate_gamma_flip_variations()
        except Exception as e:
            logger.error(f"Error calculating flip variations: {e}")

        try:
            self.calculate_delta_flip_profile()
        except Exception as e:
            logger.error(f"Error calculating delta flip profile: {e}")

        try:
            self.calculate_gamma_flip_cone()
        except Exception as e:
            logger.error(f"Error calculating gamma flip cone: {e}")

        try:
            self.calculate_flow_sentiment()
        except Exception as e:
            logger.error(f"Error calculating flow sentiment: {e}")

        try:
            self.calculate_expected_moves()
        except Exception as e:
            logger.error(f"Error calculating expected moves: {e}")

        try:
            self.calculate_mm_pnl_simulation()
        except Exception as e:
            logger.error(f"Error calculating MM PnL: {e}")

    def get_summary_metrics(self) -> SummaryMetrics:
        """Retorna métricas resumidas para o dashboard.

        Consolida todos os cálculos em um dicionário tipado contendo:
        - Spot, Delta Agregado, Gamma Flip, Max Pain
        - Call Wall, Put Wall, Effective Walls
        - Regime (Gamma Positivo/Negativo)
        - Dealer Pressure Index (peso: delta, gamma, charm, vanna)
        - Range (baseado em IV diária)
        - Top Walls (3 maiores OI Call/Put)
        - Volatility Analysis, Pin Risk, Expected Moves

        Returns:
            SummaryMetrics: TypedDict com todas as métricas.
        """
        delta_agregado = float(np.nansum(self.dexp_tot))
        regime = 'Gamma Positivo' if (self.gamma_flip and self.spot >= self.gamma_flip) else 'Gamma Negativo'

        def _norm(a):
            abs_arr = np.abs(np.asarray(a, dtype=float))
            method = str(getattr(settings, "DPI_NORM_METHOD", "maxabs") or "maxabs").strip().lower()
            if method == "percentile":
                p = float(getattr(settings, "DPI_NORM_PERCENTILE", 95.0) or 95.0)
                if not np.isfinite(p) or p <= 0.0 or p > 100.0:
                    p = 95.0
                m = float(np.nanpercentile(abs_arr, p))
            else:
                m = float(np.nanmax(abs_arr))
            if not np.isfinite(m) or m <= 0.0:
                m = 1.0
            return np.asarray(a, dtype=float) / m

        dpi_arr = (settings.DPI_WEIGHTS['delta']*_norm(self.dexp_tot) +
                   settings.DPI_WEIGHTS['gamma']*_norm(self.gex_tot) +
                   settings.DPI_WEIGHTS['charm']*_norm(self.charm_tot) +
                   settings.DPI_WEIGHTS['vanna']*_norm(self.vanna_tot))

        i_spot = int(np.argmin(np.abs(self.strikes_ref - self.spot)))
        i0 = max(0, i_spot - settings.DPI_WINDOW_STRIKES)
        i1 = min(len(self.strikes_ref)-1, i_spot + settings.DPI_WINDOW_STRIKES)
        dealer_pressure_spot = float(np.nanmean(dpi_arr[i0:i1+1]))

        iv_daily = self.iv_annual / np.sqrt(252)
        range_low = self.spot * (1 - iv_daily)
        range_high = self.spot * (1 + iv_daily)

        idx_call = np.argsort(self.oi_call_ref)[-3:]
        idx_put  = np.argsort(self.oi_put_ref)[-3:]
        walls_call_txt = ' | '.join([f"{float(self.strikes_ref[i]):.4f}({self.oi_call_ref[i]:,.0f})" for i in reversed(idx_call)])
        walls_put_txt  = ' | '.join([f"{float(self.strikes_ref[i]):.4f}({self.oi_put_ref[i]:,.0f})" for i in reversed(idx_put)])

        return cast(SummaryMetrics, {
            'spot': self.spot,
            'delta_agregado': delta_agregado,
            'gamma_flip': self.gamma_flip,
            'gamma_flip_hvl': self.gamma_flip_hvl,
            'zero_gamma_level': self.zero_gamma_level,
            'max_pain': self.max_pain,
            'call_wall': self.call_wall,
            'put_wall': self.put_wall,
            'effective_call_wall': getattr(self, 'effective_call_wall', self.call_wall),
            'effective_put_wall': getattr(self, 'effective_put_wall', self.put_wall),
            'regime': regime,
            'dealer_pressure': dealer_pressure_spot,
            'dpi_arr': dpi_arr,
            'range_low': range_low,
            'range_high': range_high,
            'walls_call_txt': walls_call_txt,
            'walls_put_txt': walls_put_txt,
            'iv_daily': iv_daily,
            'dataref': self.dataref,
            'vol_analysis': getattr(self, 'vol_analysis', {}),
            'pinning_risk': getattr(self, 'pinning_risk', None),
            'expected_moves': getattr(self, 'expected_moves', [])
        })
