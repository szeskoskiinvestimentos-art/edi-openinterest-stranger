from __future__ import annotations
import numpy as np


class WallsMixin:
    def calculate_max_pain(self):
        strikes = np.asarray(self.strikes_ref, dtype=float)
        oi_call = np.asarray(self.oi_call_ref, dtype=float)
        oi_put = np.asarray(self.oi_put_ref, dtype=float)
        spot = float(self.spot)
        lower_bound = spot * 0.70
        upper_bound = spot * 1.30
        mask = (strikes >= lower_bound) & (strikes <= upper_bound)
        if np.any(mask):
            strikes_f = strikes[mask]
            oi_call_f = oi_call[mask]
            oi_put_f = oi_put[mask]
        else:
            strikes_f = strikes
            oi_call_f = oi_call
            oi_put_f = oi_put

        loss = []
        for k_exp in strikes_f:
            val_calls = np.maximum(0, k_exp - strikes_f) * oi_call_f
            val_puts = np.maximum(0, strikes_f - k_exp) * oi_put_f
            loss.append(np.sum(val_calls + val_puts))

        loss = np.asarray(loss, dtype=float)
        self.max_pain_profile = {
            'strikes': strikes_f,
            'loss': loss
        }
        return float(strikes_f[int(np.argmin(loss))])

    def calculate_effective_walls(self):
        try:
            strikes = np.asarray(self.strikes_ref, dtype=float)
            oi_put = np.asarray(self.oi_put_ref, dtype=float)
            oi_call = np.asarray(self.oi_call_ref, dtype=float)
            spot = float(self.spot)
            lower_bound = spot * 0.70
            upper_bound = spot * 1.30
            window_mask = (strikes >= lower_bound) & (strikes <= upper_bound)

            def pick_effective_wall(oi_arr, mask):
                idx = np.where(mask & np.isfinite(oi_arr) & (oi_arr > 0.0))[0]
                if idx.size == 0:
                    return None
                if idx.size == 1:
                    return float(strikes[int(idx[0])])
                top2 = idx[np.argsort(oi_arr[idx])[-2:]]
                w = oi_arr[top2]
                ws = float(np.sum(w))
                if not np.isfinite(ws) or ws <= 0.0:
                    return None
                return float(np.average(strikes[top2], weights=w))

            put_eff = pick_effective_wall(oi_put, window_mask & (strikes <= spot))
            if put_eff is None:
                put_eff = pick_effective_wall(oi_put, strikes <= spot)
            self.effective_put_wall = put_eff if put_eff is not None else self.put_wall

            call_eff = pick_effective_wall(oi_call, window_mask & (strikes >= spot))
            if call_eff is None:
                call_eff = pick_effective_wall(oi_call, strikes >= spot)
            self.effective_call_wall = call_eff if call_eff is not None else self.call_wall

        except Exception as e:
            self.effective_call_wall = self.call_wall
            self.effective_put_wall = self.put_wall
