"""FlipsMixin — Cálculos de Gamma Flip e Delta Flip.

Implementa 7 variações de Gamma Flip:
- Classic: interpolação linear do zero-crossing
- Spline: interpolação spline (scipy)
- HVL: ponderado por High Volatility Level
- HVL Log: HVL em escala logarítmica
- Sigma Kernel: ponderado por IV local
- PVOP: ponderado por fluxo direcional
- HVL Gaussian: suavização Gaussiana

Também inclui Delta Flip Profile e Gamma Flip Cone.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from scipy.interpolate import UnivariateSpline
from scipy.ndimage import gaussian_filter1d
from src import config as settings
from src.greeks import GreeksEngine
import logging

logger = logging.getLogger(__name__)


class FlipsMixin:
    """Mixin para cálculos de Gamma Flip e Delta Flip.

    Fornece métodos para encontrar zero-crossings, calcular flip HVL,
    e gerar variações de Gamma Flip com diferentes métodos de suavização.
    """

    def _find_zero_cross(self, x_arr, y_arr, target_x=None):
        """Encontra o zero-crossing mais próximo de target_x.

        Usa interpolação linear quando há cruzamento de zero.
        Fallback: retorna o ponto com menor |y| dentro de janela ±30% do target.

        Args:
            x_arr: Array de strikes/preços
            y_arr: Array de valores (ex: GEX cumulado)
            target_x: Ponto de referência (spot). Se None, usa primeiro zero-cross.

        Returns:
            float: Valor de x onde y cruza zero (ou mais próximo).
        """
        x_arr = np.array(x_arr, dtype=float)
        y_arr = np.array(y_arr, dtype=float)
        if len(x_arr) == 0: return target_x if target_x else 0.0

        sg = np.sign(y_arr)
        idx = np.where(np.diff(sg) != 0)[0]

        if len(idx) > 0:
            if target_x is not None:
                distances = np.abs(x_arr[idx] - float(target_x))
                j = int(np.argmin(distances))
                i = idx[j]
                closest_x = x_arr[i]
                if abs(closest_x - target_x) > (target_x * 0.40):
                    pass
                else:
                    y1, y2 = y_arr[i], y_arr[i+1]
                    x1, x2 = x_arr[i], x_arr[i+1]
                    if y2 == y1: return x1
                    return float(x1 - y1 * (x2 - x1) / (y2 - y1))
            else:
                i = idx[0]
                y1, y2 = y_arr[i], y_arr[i+1]
                x1, x2 = x_arr[i], x_arr[i+1]
                if y2 == y1: return x1
                return float(x1 - y1 * (x2 - x1) / (y2 - y1))

        if target_x is not None:
            lower_bound = target_x * 0.70
            upper_bound = target_x * 1.30
            mask = (x_arr >= lower_bound) & (x_arr <= upper_bound)
            if np.any(mask):
                local_x = x_arr[mask]
                local_y = y_arr[mask]
                best_local = float(local_x[np.argmin(np.abs(local_y))])
                return best_local

        return float(x_arr[np.argmin(np.abs(y_arr))])

    def _calculate_hvl_flip(self):
        """Calcula Gamma Flip ponderado por HVL (High Volatility Level).

        Usa pesos Gaussianos baseados na volatilidade diária para
        dar mais importância aos strikes próximos do spot.

        Returns:
            float ou None: Valor do flip HVL, ou None se desabilitado/erro.
        """
        try:
            if not getattr(settings, 'USE_HVL_FLIP', True):
                return None

            hvl_daily = float(settings.HVL_ANNUAL)/np.sqrt(252)
            step = float(np.median(np.diff(self.strikes_ref))) if len(self.strikes_ref)>1 else 25.0
            sigma_pts = float(settings.SIGMA_FACTOR) * max(step*2.0, float(self.spot)*float(hvl_daily))

            order = np.argsort(np.array(self.strikes_ref, dtype=float))
            ks = np.array(self.strikes_ref, dtype=float)[order]
            gex = np.array(self.gex_flip_base, dtype=float)[order]

            w = np.exp(-((ks - float(self.spot))**2) / (2.0 * (sigma_pts**2)))
            gex_cum_hvl = np.cumsum(gex * w)
            sg_h = np.sign(gex_cum_hvl)
            idx_h = np.where(np.diff(sg_h)!=0)[0]

            if len(idx_h)>0:
                j = int(np.argmin(np.abs(ks[idx_h] - float(self.spot))))
                i = idx_h[j]
                y1, y2 = gex_cum_hvl[i], gex_cum_hvl[i+1]
                x1, x2 = ks[i], ks[i+1]
                return float(x1 if y2==y1 else x1 - y1*(x2 - x1)/(y2 - y1))
            else:
                return float(ks[int(np.argmin(np.abs(gex_cum_hvl)))])
        except (ValueError, TypeError, IndexError, KeyError, AttributeError) as e:
            logger.debug("[E95] operation failed: %s", e)
            return None

    def calculate_gamma_flip_variations(self):
        flips = {}
        strikes = np.array(self.strikes_ref, dtype=float)
        spot = float(self.spot)
        hvl_daily = float(settings.HVL_ANNUAL)/np.sqrt(252)
        sigma_factor = float(settings.SIGMA_FACTOR)

        flips['Classic'] = self._find_zero_cross(strikes, self.gex_cum_signed, spot)

        try:
            spl = UnivariateSpline(strikes, self.gex_cum_signed, s=0)
            roots = spl.roots()
            if len(roots) > 0:
                roots_arr = np.array(roots).flatten()
                flips['Spline'] = float(roots_arr[np.argmin(np.abs(roots_arr - spot))])
            else:
                flips['Spline'] = flips['Classic']
        except (ValueError, TypeError, IndexError, KeyError, AttributeError) as e:
            logger.debug("[E95] calculate_gamma_flip_variations failed: %s", e)
            flips['Spline'] = flips['Classic']

        step = float(np.median(np.diff(strikes))) if len(strikes) > 1 else 25.0
        sigma_pts = float(sigma_factor * max(step*2.0, spot*hvl_daily))
        w_hvl = np.exp(-((strikes - spot)**2) / (2.0 * (sigma_pts**2)))

        gex_cum_hvl = np.cumsum(self.gex_flip_base * w_hvl)
        flips['HVL'] = self._find_zero_cross(strikes, gex_cum_hvl, spot)

        sigma_m = hvl_daily * sigma_factor
        z = np.log(strikes / spot)
        w_log = np.exp(-(z**2) / (2.0 * (sigma_m**2)))
        gex_cum_log = np.cumsum(self.gex_flip_base * w_log)
        flips['HVL Log'] = self._find_zero_cross(strikes, gex_cum_log, spot)

        iv_vec = self.iv_strike_ref
        sigma_pts_iv = sigma_factor * spot * (iv_vec / np.sqrt(252))
        w_sk = np.exp(-((strikes - spot)**2) / (2.0 * (sigma_pts_iv**2)))
        gex_cum_sk = np.cumsum(self.gex_flip_base * w_sk)
        flips['Sigma Kernel'] = self._find_zero_cross(strikes, gex_cum_sk, spot)

        flips['PVOP'] = self._find_zero_cross(strikes, self.r_gamma_cum, spot)

        try:
            sigma_gauss = 1.17
            gex_smooth = gaussian_filter1d(self.gex_flip_base, sigma=sigma_gauss)
            gex_cum_gauss = np.cumsum(gex_smooth)
            flips['HVL Gaussian'] = self._find_zero_cross(strikes, gex_cum_gauss, spot)
        except (ValueError, TypeError, IndexError, KeyError, AttributeError) as e:
            logger.debug("[E95] operation failed: %s", e)
            flips['HVL Gaussian'] = flips['Classic']

        self.flip_variations = flips

    def calculate_delta_flip_profile(self):
        """Simula Spot +/- 15% para encontrar onde o Delta Agregado inverte.

        Otimização: reduzido de 50 para 30 pontos de simulação (~40% mais rápido)
        com precisão suficiente para encontrar o zero-crossing.
        """
        spots_sim = np.linspace(self.spot * 0.85, self.spot * 1.15, 30)
        deltas_sim = []

        if 'Expiry' in self.options_df.columns:
            expiries = self.options_df['Expiry'].dropna().unique()
        else:
            expiries = []

        expiry_data = []
        if len(expiries) > 0:
            for expiry in expiries:
                if pd.isnull(expiry): continue
                expiry_dt = pd.to_datetime(expiry)
                dataref_dt = pd.to_datetime(self.dataref)
                bdays = int(np.busday_count(dataref_dt.date(), expiry_dt.date()))
                is_0dte = (dataref_dt.date() == expiry_dt.date())
                T_exp = settings.MIN_T_EXPIRY if is_0dte else ((1.0/252.0) if bdays <= 0 else (bdays/252.0))

                df_exp = self.options_df[self.options_df['Expiry'] == expiry]
                oi_call = df_exp[df_exp['OptionType'] == 'CALL'].groupby('StrikeK')['Open Int'].sum().reindex(self.strikes_ref, fill_value=0.0).values
                oi_put  = df_exp[df_exp['OptionType'] == 'PUT'].groupby('StrikeK')['Open Int'].sum().reindex(self.strikes_ref, fill_value=0.0).values

                expiry_data.append({'T': T_exp, 'oi_call': oi_call, 'oi_put': oi_put})
        else:
             expiry_data.append({'T': self.T, 'oi_call': self.oi_call_ref, 'oi_put': self.oi_put_ref})

        strikes = np.asarray(self.strikes_ref, dtype=float)
        T_arr = np.array([d['T'] for d in expiry_data])
        oi_call_arr = np.array([d['oi_call'] for d in expiry_data])
        oi_put_arr = np.array([d['oi_put'] for d in expiry_data])

        for s_sim in spots_sim:
            net_delta = 0.0
            for i in range(len(T_arr)):
                T = T_arr[i]
                dC, _ = GreeksEngine.calculate_greeks(s_sim, strikes, T, self.risk_free, self.iv_annual, 'C')
                dP, _ = GreeksEngine.calculate_greeks(s_sim, strikes, T, self.risk_free, self.iv_annual, 'P')
                net_delta += np.sum(np.nan_to_num(dC) * oi_call_arr[i] + np.nan_to_num(dP) * oi_put_arr[i])
            deltas_sim.append(net_delta)

        deltas_sim = np.array(deltas_sim)
        flip_val = self._find_zero_cross(spots_sim, deltas_sim, self.spot)

        self.delta_flip_profile = {
            'spots': spots_sim,
            'deltas': deltas_sim,
            'flip_value': flip_val
        }

    def calculate_gamma_flip_cone(self):
        if not getattr(settings, 'USE_HVL_FLIP', True):
            self.gamma_flip_cone = {'alphas': [], 'flips': []}
            return

        alphas = np.linspace(settings.CONE_ALPHA_MIN, settings.CONE_ALPHA_MAX, settings.CONE_ALPHA_STEPS)
        flips: list[float | None] = []

        try:
            strikes = np.array(self.strikes_ref, dtype=float)
            if strikes.size == 0:
                self.gamma_flip_cone = {'alphas': list(alphas), 'flips': []}
                return

            spot = float(self.spot)
            hvl_daily = float(settings.HVL_ANNUAL) / np.sqrt(252)
            step = float(np.median(np.diff(strikes))) if strikes.size > 1 else 25.0

            for alpha in alphas:
                sigma_factor = float(alpha)
                sigma_pts = sigma_factor * max(step * 2.0, spot * hvl_daily)
                w = np.exp(-((strikes - spot) ** 2) / (2.0 * (sigma_pts ** 2)))
                gex_cum = np.cumsum(self.gex_flip_base * w)
                sg = np.sign(gex_cum)
                idx = np.where(np.diff(sg) != 0)[0]
                if len(idx) == 0:
                    flips.append(None)
                    continue

                distances = np.abs(strikes[idx] - spot)
                i = int(idx[int(np.argmin(distances))])
                closest_x = float(strikes[i])
                if abs(closest_x - spot) > (spot * 0.40):
                    flips.append(None)
                    continue

                y1, y2 = float(gex_cum[i]), float(gex_cum[i + 1])
                x1, x2 = float(strikes[i]), float(strikes[i + 1])
                if y2 == y1:
                    flips.append(x1)
                    continue
                flips.append(float(x1 - y1 * (x2 - x1) / (y2 - y1)))
        except (ValueError, TypeError, IndexError, KeyError, AttributeError) as e:
            logger.debug("[E95] operation failed: %s", e)
            flips = [None] * len(alphas)

        self.gamma_flip_cone = {
            'alphas': list(alphas),
            'flips': flips
        }

    def calculate_flow_sentiment(self):
        def _to_float(v):
            if v is None or (isinstance(v, float) and np.isnan(v)):
                return None
            try:
                if isinstance(v, str):
                    v = v.strip().replace('%', '').replace('.', '').replace(',', '.')
                x = float(v)
                return x if np.isfinite(x) else None
            except (ValueError, TypeError, IndexError, KeyError, AttributeError) as e:
                logger.debug("[E95] _to_float failed: %s", e)
                return None

        bull_vols: list[float] = []
        bear_vols: list[float] = []
        strikes = self.strikes_ref

        df = self.options_df.copy()
        df['StrikeK'] = pd.to_numeric(df['StrikeK'], errors='coerce')

        change_candidates = ['Change', 'Chg', 'Net Chg', 'NetChg', 'Change %', '% Change', 'Pct Change']
        bid_candidates = ['Bid', 'bid']
        ask_candidates = ['Ask', 'ask']
        last_candidates = ['Last', 'last', 'Price', 'Close']
        vol_candidates = ['Volume', 'Vol', 'VOL']

        chg_col = next((c for c in change_candidates if c in df.columns), None)
        bid_col = next((c for c in bid_candidates if c in df.columns), None)
        ask_col = next((c for c in ask_candidates if c in df.columns), None)
        last_col = next((c for c in last_candidates if c in df.columns), None)
        vol_col = next((c for c in vol_candidates if c in df.columns), None)

        for k in strikes:
            df_k = df[np.isclose(df['StrikeK'], k, atol=1e-5)]

            v_bull = 0.0
            v_bear = 0.0

            for _, row in df_k.iterrows():
                tipo = str(row.get('OptionType', '')).strip().upper()
                if tipo in ['C', 'CALL', 'COMPRA']:
                    tipo = 'CALL'
                elif tipo in ['P', 'PUT', 'VENDA']:
                    tipo = 'PUT'
                else:
                    continue

                vol = _to_float(row.get(vol_col)) if vol_col else None
                if not vol or vol <= 0:
                    continue

                bucket = None
                if chg_col:
                    chg = _to_float(row.get(chg_col))
                    if chg is not None and chg != 0:
                        if tipo == 'CALL':
                            bucket = 'BULL' if chg > 0 else 'BEAR'
                        else:
                            bucket = 'BEAR' if chg > 0 else 'BULL'

                if bucket is None and bid_col and ask_col and last_col:
                    bid = _to_float(row.get(bid_col))
                    ask = _to_float(row.get(ask_col))
                    last = _to_float(row.get(last_col))
                    if bid is not None and ask is not None and last is not None and bid > 0 and ask > 0 and last > 0:
                        mid = (bid + ask) / 2.0
                        if tipo == 'CALL':
                            bucket = 'BULL' if last >= mid else 'BEAR'
                        else:
                            bucket = 'BEAR' if last >= mid else 'BULL'

                if bucket is None:
                    bucket = 'BULL' if tipo == 'CALL' else 'BEAR'

                if bucket == 'BULL':
                    v_bull += vol
                else:
                    v_bear += vol

            bull_vols.append(v_bull)
            bear_vols.append(-v_bear)

        self.flow_sentiment = {
            'bull': np.array(bull_vols, dtype=float),
            'bear': np.array(bear_vols, dtype=float)
        }
