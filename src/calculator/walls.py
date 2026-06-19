"""WallsMixin — Max Pain e Effective Walls.

Calcula Max Pain (strike de máxima dor), Effective Walls
(média ponderada dos top strikes por OI), e perfil de perda.
"""
from __future__ import annotations
import numpy as np
from numpy.typing import NDArray
from typing import Optional


class WallsMixin:
    """Mixin para cálculo de Max Pain e Effective Walls.

    Calcula:
    - Max Pain: strike onde compradores de opções perdem mais
    - Effective Walls: média ponderada dos top 2 strikes por OI
    - Perfil de perda para visualização
    """

    def calculate_max_pain(self) -> float:
        """Calcula o Max Pain (strike de máxima dor).

        Para cada strike candidato, calcula a perda total dos compradores:
        loss(k) = Σ max(0, k - K) × OI_call + Σ max(0, K - k) × OI_put

        O Max Pain é o strike com menor perda total.

        Returns:
            float: Strike com menor perda (Max Pain).
        """
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

    def calculate_effective_walls(self) -> None:
        """Calcula Effective Walls (média ponderada dos top strikes).

        Para Calls (acima do spot) e Puts (abaixo do spot):
        1. Filtra strikes dentro de janela ±30% do spot
        2. Seleciona top 2 strikes por Open Interest
        3. Calcula média ponderada pelo OI

        Se nenhum strike na janela, usa top 1 global.
        """
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
