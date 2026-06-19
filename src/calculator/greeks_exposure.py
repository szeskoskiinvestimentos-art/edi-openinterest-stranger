"""GreeksExposureMixin — Acumulação de Greeks por strike.

Calcula exposição de Delta, Gamma, Charm, Vanna, Vega e Theta
para cada strike, acumulando por vencimento e calculando
versões cumulativas para análise de risco.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from src import config as settings
from src.greeks import GreeksEngine


class GreeksExposureMixin:
    """Mixin para cálculo de exposição de Greeks por strike.

    Calcula e acumula:
    - dexp_tot: Delta Exposure total por strike
    - gex_tot: Gamma Exposure total por strike
    - charm_tot: Charm Exposure (sensibilidade ao tempo)
    - vanna_tot: Vanna Exposure (Delta x IV)
    - vex_tot: Vega Exposure (sensibilidade à volatilidade)
    - theta_tot: Theta Exposure (decaimento temporal)
    - gex_flip_base: GEX assinado (para Gamma Flip)
    - Versões cumulativas (*_cum) de cada grega
    """

    def calculate_greeks_exposure(self):
        """Calcula exposição de Greeks para todos os strikes.

        Para cada vencimento, agrupa opções por strike e acumula:
        1. Delta Exposure = Delta × OI × CONTRACT_MULT × Spot × 0.01
        2. Gamma Exposure = Gamma × OI × CONTRACT_MULT × Spot² × 0.0001
        3. GEX Assinado = gex_call (+1) - gex_put (-1) × OI
        4. Charm, Vanna, Vega, Theta (mesma lógica)

        Se IV per-strike disponível, usa para Delta/Gamma/Charm/Vanna.
        Caso contrário, usa IV flat (self.iv_annual).
        """
        self.dexp_tot = np.zeros_like(self.strikes_ref, dtype=float)
        self.gex_tot = np.zeros_like(self.strikes_ref, dtype=float)
        self.charm_tot = np.zeros_like(self.strikes_ref, dtype=float)
        self.vanna_tot = np.zeros_like(self.strikes_ref, dtype=float)
        self.vex_tot = np.zeros_like(self.strikes_ref, dtype=float)
        self.theta_tot = np.zeros_like(self.strikes_ref, dtype=float)

        self.gex_call_tot = np.zeros_like(self.strikes_ref, dtype=float)
        self.gex_put_tot = np.zeros_like(self.strikes_ref, dtype=float)

        self.gex_flip_base = np.zeros_like(self.strikes_ref, dtype=float)

        S = self.spot
        r = self.risk_free
        sigma = self.iv_annual

        if 'Expiry' in self.options_df.columns:
            expiries = self.options_df['Expiry'].dropna().unique()
        else:
            expiries = []

        if len(expiries) > 0:
            for expiry in expiries:
                if pd.isnull(expiry): continue

                expiry_dt = pd.to_datetime(expiry)
                dataref_dt = pd.to_datetime(self.dataref)
                bdays = int(np.busday_count(dataref_dt.date(), expiry_dt.date()))
                is_0dte = (dataref_dt.date() == expiry_dt.date())
                T_exp = settings.MIN_T_EXPIRY if (getattr(settings, 'USE_ODTE_MODE', False) and is_0dte) else ((1.0/252.0) if bdays <= 0 else (bdays/252.0))

                df_exp = self.options_df[self.options_df['Expiry'] == expiry]
                self._accumulate_greeks_for_expiry(df_exp, T_exp, S, r, sigma)
        else:
            self._accumulate_greeks_for_expiry(self.options_df, self.T, S, r, sigma)

        if self.iv_strike_ref is not None and len(self.iv_strike_ref) > 1:
            self.iv_skew = np.gradient(self.iv_strike_ref, self.strikes_ref)
        else:
            self.iv_skew = np.zeros_like(self.strikes_ref)

        self.dexp_cum = np.cumsum(self.dexp_tot)
        self.gex_cum = np.cumsum(self.gex_tot)
        self.charm_cum = np.cumsum(self.charm_tot)
        self.vanna_cum = np.cumsum(self.vanna_tot)
        self.vex_cum = np.cumsum(self.vex_tot)
        self.theta_cum = np.cumsum(self.theta_tot)
        self.gex_cum_signed = np.cumsum(self.gex_flip_base)

        self.r_gamma_exposure = self.gex_tot
        self.r_gamma_cum = np.cumsum(self.r_gamma_exposure)

    def _accumulate_greeks_for_expiry(self, df, T, S, r, sigma):
        K_ref = self.strikes_ref

        oi_call = df[df['OptionType'] == 'CALL'].groupby('StrikeK')['Open Int'].sum().reindex(K_ref, fill_value=0.0).values
        oi_put  = df[df['OptionType'] == 'PUT'].groupby('StrikeK')['Open Int'].sum().reindex(K_ref, fill_value=0.0).values

        if np.sum(oi_call) + np.sum(oi_put) == 0:
            return

        if hasattr(self, 'iv_strike_ref') and self.iv_strike_ref is not None and len(self.iv_strike_ref) == len(K_ref):
            iv_for_greeks = self.iv_strike_ref
        else:
            iv_for_greeks = np.full_like(K_ref, sigma, dtype=float)

        dC, gC = GreeksEngine.calculate_greeks(S, K_ref, T, r, iv_for_greeks, 'C')
        dP, gP = GreeksEngine.calculate_greeks(S, K_ref, T, r, iv_for_greeks, 'P')

        dC, gC = np.nan_to_num(dC), np.nan_to_num(gC)
        dP, gP = np.nan_to_num(dP), np.nan_to_num(gP)

        dT = settings.DT_DAILY
        dsigma = settings.DSIGMA

        dTp_C, _ = GreeksEngine.calculate_greeks(S, K_ref, max(T + dT, settings.EPSILON), r, iv_for_greeks, 'C')
        dTm_C, _ = GreeksEngine.calculate_greeks(S, K_ref, max(T - dT, settings.EPSILON), r, iv_for_greeks, 'C')
        chC = (np.nan_to_num(dTm_C) - np.nan_to_num(dTp_C)) / (2*dT)

        dTp_P, _ = GreeksEngine.calculate_greeks(S, K_ref, max(T + dT, settings.EPSILON), r, iv_for_greeks, 'P')
        dTm_P, _ = GreeksEngine.calculate_greeks(S, K_ref, max(T - dT, settings.EPSILON), r, iv_for_greeks, 'P')
        chP = (np.nan_to_num(dTm_P) - np.nan_to_num(dTp_P)) / (2*dT)

        dSp_C, _ = GreeksEngine.calculate_greeks(S, K_ref, T, r, iv_for_greeks + dsigma, 'C')
        dSm_C, _ = GreeksEngine.calculate_greeks(S, K_ref, T, r, np.maximum(iv_for_greeks - dsigma, settings.EPSILON), 'C')
        vaC = (np.nan_to_num(dSp_C) - np.nan_to_num(dSm_C)) / (2*dsigma)

        dSp_P, _ = GreeksEngine.calculate_greeks(S, K_ref, T, r, iv_for_greeks + dsigma, 'P')
        dSm_P, _ = GreeksEngine.calculate_greeks(S, K_ref, T, r, np.maximum(iv_for_greeks - dsigma, settings.EPSILON), 'P')
        vaP = (np.nan_to_num(dSp_P) - np.nan_to_num(dSm_P)) / (2*dsigma)

        vega_val = GreeksEngine.calculate_vega(S, K_ref, T, r, iv_for_greeks)

        thetaC = GreeksEngine.calculate_theta(S, K_ref, T, r, iv_for_greeks, 'C')
        thetaP = GreeksEngine.calculate_theta(S, K_ref, T, r, iv_for_greeks, 'P')

        thetaC_daily = thetaC / 252.0
        thetaP_daily = thetaP / 252.0

        self.dexp_tot += (dC * oi_call + dP * oi_put)

        scale_S = settings.DISPLAY_SCALE_FACTOR if getattr(settings, 'EXPOSURE_INDEX_SCALE_ENABLED', True) else 1.0
        factor = settings.CONTRACT_MULT * (S * scale_S) * 0.01

        gex_call = gC * oi_call * factor
        gex_put  = gP * oi_put * factor

        self.gex_tot += (gex_call + gex_put)
        self.gex_call_tot += gex_call
        self.gex_put_tot  += gex_put

        self.charm_tot += (chC * oi_call + chP * oi_put)
        self.vanna_tot += (vaC * oi_call + vaP * oi_put)
        self.vex_tot   += vega_val * (oi_call + oi_put)
        self.theta_tot += (thetaC_daily * oi_call + thetaP_daily * oi_put)

        sgn_call = np.where(K_ref <= S, +1.0, -1.0)
        sgn_put  = np.where(K_ref >= S, -1.0, +1.0)

        self.gex_flip_base += (gC * oi_call * sgn_call + gP * oi_put * sgn_put) * factor
