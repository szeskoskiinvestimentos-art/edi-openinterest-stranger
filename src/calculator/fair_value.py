from __future__ import annotations
import numpy as np
from src import config as settings
from src.greeks import GreeksEngine
import logging

logger = logging.getLogger(__name__)


class FairValueMixin:
    def calculate_mm_pnl_simulation(self):
        spots_sim = np.linspace(self.spot * settings.SIM_SPOT_RANGE_LOWER, self.spot * settings.SIM_SPOT_RANGE_UPPER, settings.SIM_STEPS)
        pnl_sim = []

        try:
            mm_pnl = []

            calls_val_0 = GreeksEngine.bs_price(self.spot, self.strikes_ref, self.T, self.risk_free, self.iv_annual, 'C')
            puts_val_0  = GreeksEngine.bs_price(self.spot, self.strikes_ref, self.T, self.risk_free, self.iv_annual, 'P')

            mm_val_0 = -1 * np.sum(calls_val_0 * self.oi_call_ref + puts_val_0 * self.oi_put_ref)

            delta_calls, _ = GreeksEngine.calculate_greeks(self.spot, self.strikes_ref, self.T, self.risk_free, self.iv_annual, 'C')
            delta_puts, _  = GreeksEngine.calculate_greeks(self.spot, self.strikes_ref, self.T, self.risk_free, self.iv_annual, 'P')
            mm_delta_0 = -1 * np.sum(delta_calls * self.oi_call_ref + delta_puts * self.oi_put_ref)

            hedge_cash = - (mm_delta_0 * self.spot)

            for s_sim in spots_sim:
                calls_val_s = GreeksEngine.bs_price(s_sim, self.strikes_ref, self.T, self.risk_free, self.iv_annual, 'C')
                puts_val_s  = GreeksEngine.bs_price(s_sim, self.strikes_ref, self.T, self.risk_free, self.iv_annual, 'P')

                mm_val_s = -1 * np.sum(calls_val_s * self.oi_call_ref + puts_val_s * self.oi_put_ref)

                hedge_val_s = mm_delta_0 * s_sim + hedge_cash

                total_pnl = (mm_val_s + hedge_val_s) - (mm_val_0 + (mm_delta_0 * self.spot + hedge_cash))
                mm_pnl.append(total_pnl)

            self.mm_pnl_simulation = {
                'spots': spots_sim,
                'pnl': np.array(mm_pnl)
            }
        except Exception as e:
            logger.error(f"Error calculating MM PnL: {e}")
            self.mm_pnl_simulation = None

    def calculate_fair_value_scenario(self, target_spot, target_days_from_now=0):
        days_to_expiry = self.T / settings.DT_DAILY
        new_T = max(settings.MIN_T_EXPIRY, (days_to_expiry - target_days_from_now) * settings.DT_DAILY)

        strikes_arr = np.asarray(self.strikes_ref, dtype=float)
        if strikes_arr.size == 0:
            return []

        order = np.argsort(strikes_arr)
        strikes_sorted = strikes_arr[order]
        iv_sorted = None
        try:
            iv_arr = np.asarray(self.iv_strike_ref, dtype=float)
            if iv_arr.size == strikes_arr.size:
                iv_sorted = iv_arr[order]
        except Exception:
            iv_sorted = None

        refs = [self.call_wall, self.put_wall, self.gamma_flip, self.spot]
        ref_vals: list[float] = []
        for v in refs:
            try:
                fv = float(v)
                if not np.isnan(fv):
                    ref_vals.append(fv)
            except (TypeError, ValueError):
                continue

        idx_set: set[int] = set()
        for rv in ref_vals:
            i0 = int(np.argmin(np.abs(strikes_sorted - rv)))
            for j in range(i0 - 2, i0 + 3):
                if 0 <= j < int(strikes_sorted.size):
                    idx_set.add(j)

        idxs = sorted(idx_set)
        key_strikes = [float(strikes_sorted[i]) for i in idxs]

        simulation_results: list[dict] = []
        for i, k in zip(idxs, key_strikes):
            sigma_k = float(iv_sorted[i]) if iv_sorted is not None and not np.isnan(float(iv_sorted[i])) else float(self.iv_annual)

            call_now = float(GreeksEngine.bs_price(self.spot, k, self.T, self.risk_free, sigma_k, 'C'))
            put_now = float(GreeksEngine.bs_price(self.spot, k, self.T, self.risk_free, sigma_k, 'P'))

            call_sim = float(GreeksEngine.bs_price(target_spot, k, new_T, self.risk_free, sigma_k, 'C'))
            put_sim = float(GreeksEngine.bs_price(target_spot, k, new_T, self.risk_free, sigma_k, 'P'))

            simulation_results.append({
                'Strike': k,
                'Call_Now': call_now,
                'Call_Sim': call_sim,
                'Call_Chg': (call_sim - call_now) / call_now * 100 if call_now > 0.01 else 0.0,
                'Put_Now': put_now,
                'Put_Sim': put_sim,
                'Put_Chg': (put_sim - put_now) / put_now * 100 if put_now > 0.01 else 0.0
            })

        return simulation_results
