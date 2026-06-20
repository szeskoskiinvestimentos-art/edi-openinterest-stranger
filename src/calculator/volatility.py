"""VolatilityMixin — Análise de volatilidade e expected moves.

Calcula VRP (Volatility Risk Premium), expected moves,
pinning risk e classificação de regime de volatilidade.
"""
from __future__ import annotations
import numpy as np
from scipy.stats import norm
from src import config as settings
import logging

logger = logging.getLogger(__name__)


class VolatilityMixin:
    """Mixin para análise de volatilidade e expected moves.

    Calcula:
    - Expected Moves: variação esperada (1σ) por horizonte (intraday, semanal, expiração)
    - Volatility Analysis: VRP, IV Rank, regime (cara/barata/justa)
    - Pinning Risk: risco de preço travar em strikes com alto OI
    """

    def calculate_expected_moves(self):
        """Calcula movimentos esperados baseados na IV ATM.

        Para cada horizonte (1 dia, 1 semana, expiração), calcula:
        - move = Spot × IV_ATM × √(dias/252)
        - upper = Spot + move
        - lower = Spot - move

        Prioriza IV manual (EWZ_ATM_IV_PCT) → IV per-strike → IV flat.
        """
        try:
            iv_atm = None
            try:
                env_iv = getattr(settings, 'EWZ_ATM_IV_PCT', None)
                if env_iv is not None:
                    env_iv_f = float(env_iv)
                    if np.isfinite(env_iv_f) and env_iv_f > 0:
                        iv_atm = env_iv_f / 100.0
            except (ValueError, TypeError):
                pass

            if iv_atm is None:
                if self.iv_strike_ref is not None and len(self.iv_strike_ref) > 0:
                    idx_atm = int(np.argmin(np.abs(self.strikes_ref - self.spot)))
                    iv_atm = float(self.iv_strike_ref[idx_atm])
                    if not np.isfinite(iv_atm) or iv_atm <= 0:
                        finite = np.isfinite(self.iv_strike_ref) & (self.iv_strike_ref > 0)
                        if np.any(finite):
                            iv_atm = float(np.nanmedian(self.iv_strike_ref[finite]))
                        else:
                            iv_atm = float(self.iv_annual) if np.isfinite(self.iv_annual) and self.iv_annual > 0 else float(getattr(settings, 'HVL_ANNUAL', 0.12))
                else:
                    iv_atm = float(self.iv_annual) if np.isfinite(self.iv_annual) and self.iv_annual > 0 else float(getattr(settings, 'HVL_ANNUAL', 0.12))

            is_0dte = bool(self.expiry_date) and (self.dataref == self.expiry_date)
            expiry_days = int(max(round(float(self.T) * 252.0), 1))

            horizons_days: list[int] = []
            horizons_labels: list[str] = []
            if expiry_days == 1:
                horizons_days = [1]
                horizons_labels = ['Expiração']
            else:
                horizons_days.append(1)
                horizons_labels.append('Intraday (0DTE)' if is_0dte else '1 Dia')
                if expiry_days >= 5:
                    horizons_days.append(5)
                    horizons_labels.append('1 Semana')
                if expiry_days in horizons_days:
                    horizons_labels[horizons_days.index(expiry_days)] = 'Expiração'
                else:
                    horizons_days.append(expiry_days)
                    horizons_labels.append('Expiração')

            moves = []
            for t, lbl in zip(horizons_days, horizons_labels):
                t_year = max(float(t), 0.5) / 252.0
                sigma_move = self.spot * iv_atm * np.sqrt(t_year)
                moves.append({
                    'label': lbl,
                    'days': int(t),
                    'move': sigma_move,
                    'upper': self.spot + sigma_move,
                    'lower': self.spot - sigma_move
                })

            self.expected_moves = moves
            self.iv_atm_used = iv_atm

        except Exception as e:
            logger.error(f"Erro em calculate_expected_moves: {e}")
            self.expected_moves = []

    def calculate_volatility_analysis(self):
        try:
            iv = self.iv_atm_used if hasattr(self, 'iv_atm_used') and self.iv_atm_used else self.iv_annual

            try:
                env_hv = getattr(settings, 'EWZ_HV_PCT', None)
                if env_hv is not None:
                    env_hv_f = float(env_hv)
                    hv = (env_hv_f / 100.0) if np.isfinite(env_hv_f) and env_hv_f > 0 else settings.HVL_ANNUAL
                else:
                    hv = settings.HVL_ANNUAL
            except (ValueError, TypeError):
                hv = settings.HVL_ANNUAL

            try:
                env_rank = getattr(settings, 'EWZ_IV_RANK_PCT', None)
                iv_rank = float(env_rank) if env_rank is not None else 50.0
            except (ValueError, TypeError):
                iv_rank = 50.0

            vrp = iv / hv if hv > 0 else 1.0

            if vrp > 1.15: regime_vol = "Cara (Venda de Vol)"
            elif vrp < 0.85: regime_vol = "Barata (Compra de Vol)"
            else: regime_vol = "Justa (Neutro)"

            if iv_rank > 80: rank_desc = "Extrema Alta"
            elif iv_rank > 50: rank_desc = "Alta"
            elif iv_rank > 20: rank_desc = "Média"
            else: rank_desc = "Baixa"

            self.vol_analysis = {
                'iv_current': iv,
                'hv_current': hv,
                'vrp': vrp,
                'iv_rank': iv_rank,
                'regime': regime_vol,
                'rank_desc': rank_desc,
                'source_url': (getattr(settings, 'EWZ_IV_CONTEXT_SOURCE_URL', None) or None),
                'captured_at_utc': (getattr(settings, 'EWZ_IV_CONTEXT_CAPTURED_AT_UTC', None) or None),
                'capture_method': (getattr(settings, 'EWZ_IV_CONTEXT_METHOD', None) or None),
            }
        except Exception as e:
            logger.error(f"Erro em calculate_volatility_analysis: {e}")
            self.vol_analysis = {}

    def calculate_pinning_risk(self):
        try:
            if (self.T * 252) > 1.5:
                self.pinning_risk = None
                return

            gex_total_abs = np.abs(self.gex_call_tot) + np.abs(self.gex_put_tot)
            idx_max = np.argmax(gex_total_abs)
            magnet_strike = self.strikes_ref[idx_max]
            magnet_strength = gex_total_abs[idx_max]

            self.pinning_risk = {
                'strike': magnet_strike,
                'strength': magnet_strength,
                'is_active': True
            }
        except Exception as e:
            logger.error(f"Erro em calculate_pinning_risk: {e}")
            self.pinning_risk = None

    def calculate_volga(self):
        """Calcula Volga (∂Vega/∂σ) por strike.

        Volga mede a curvatura de Vega em relação à volatilidade.
        Também conhecida como "vol of vol" ou "vomma".

        Fórmula (fechada, por strike):
            Volga = S · φ(d1) · √T · (d1 · d2) / σ

        Onde:
            d1 = [ln(S/K) + (r + σ²/2)·T] / (σ·√T)
            d2 = d1 - σ·√T
            φ(d1) = pdf da normal padrão em d1

        Convenção: Volga por UNIDADE de sigma (não por 1%).
        Para converter para convenção de mercado (por 1%): volga / 100

        Returns:
            dict com chaves:
                - 'volga_call': np.ndarray, Volga por strike para calls
                - 'volga_put': np.ndarray, Volga por strike para puts
                - 'volga_total': np.ndarray, soma call+put ponderada por OI
                - 'volga_exposure': float, soma ponderada por OI (para UI)
                - 'per_strike': list de dicts com strike, call, put, total
        """
        try:
            S = float(self.spot)
            r = float(self.risk_free)
            T = float(self.T)
            sigma = float(self.iv_annual) if self.iv_annual else 0.20
            oi_call = np.asarray(self.oi_call_ref, dtype=float)
            oi_put = np.asarray(self.oi_put_ref, dtype=float)
            strikes = np.asarray(self.strikes_ref, dtype=float)

            if T <= 0 or sigma <= 0 or S <= 0 or len(strikes) == 0:
                self.volga = {
                    'volga_call': np.zeros_like(strikes),
                    'volga_put': np.zeros_like(strikes),
                    'volga_total': np.zeros_like(strikes),
                    'volga_exposure': 0.0,
                    'per_strike': [],
                }
                return

            # Usar IV per-strike se disponível
            if hasattr(self, 'iv_strike_ref') and self.iv_strike_ref is not None and len(self.iv_strike_ref) == len(strikes):
                sigma_arr = np.asarray(self.iv_strike_ref, dtype=float)
            else:
                sigma_arr = np.full_like(strikes, sigma, dtype=float)

            # d1 e d2 por strike
            with np.errstate(divide='ignore', invalid='ignore'):
                d1 = (np.log(S / strikes) + (r + 0.5 * sigma_arr**2) * T) / (sigma_arr * np.sqrt(T))
                d2 = d1 - sigma_arr * np.sqrt(T)
                phi_d1 = norm.pdf(d1)

            # Volga (mesma para call e put — é a 2ª derivada em σ)
            # Volga = S · φ(d1) · √T · (d1·d2) / σ
            volga_per_strike = S * phi_d1 * np.sqrt(T) * (d1 * d2) / sigma_arr

            # Trata edge cases
            volga_per_strike = np.where(np.isfinite(volga_per_strike), volga_per_strike, 0.0)
            # Convenção por unidade (mesma do Vega)
            # Para convenção de mercado (por 1%), dividir por 100

            # Separar call/put (mesmo valor, mas armazenados separados para UI)
            volga_call = volga_per_strike.copy()
            volga_put = volga_per_strike.copy()

            # Total ponderado por OI
            volga_total_arr = volga_per_strike * (oi_call + oi_put)
            volga_exposure = float(np.nansum(volga_total_arr))

            # Per-strike para UI
            per_strike = []
            for i, k in enumerate(strikes):
                per_strike.append({
                    'strike': float(k),
                    'call': float(volga_call[i]),
                    'put': float(volga_put[i]),
                    'total': float(volga_total_arr[i]),
                    'oi_call': float(oi_call[i]),
                    'oi_put': float(oi_put[i]),
                })

            self.volga = {
                'volga_call': volga_call,
                'volga_put': volga_put,
                'volga_total': volga_total_arr,
                'volga_exposure': volga_exposure,
                'per_strike': per_strike,
            }

        except Exception as e:
            logger.error(f"Erro em calculate_volga: {e}")
            self.volga = {
                'volga_call': np.zeros_like(self.strikes_ref) if hasattr(self, 'strikes_ref') else np.array([]),
                'volga_put': np.zeros_like(self.strikes_ref) if hasattr(self, 'strikes_ref') else np.array([]),
                'volga_total': np.zeros_like(self.strikes_ref) if hasattr(self, 'strikes_ref') else np.array([]),
                'volga_exposure': 0.0,
                'per_strike': [],
            }

    def calculate_volga_finite_diff(self, dsigma: float = 0.005) -> float:
        """Validação: Volga via diferenças finitas (Volga ≈ dVega/dσ).

        Útil para testar calculate_volga() com fórmula fechada.
        Retorna Volga Exposure (sum ponderada por OI).
        """
        from src.greeks import GreeksEngine

        S = float(self.spot)
        r = float(self.risk_free)
        T = float(self.T)
        sigma = float(self.iv_annual) if self.iv_annual else 0.20
        strikes = np.asarray(self.strikes_ref, dtype=float)
        oi_call = np.asarray(self.oi_call_ref, dtype=float)
        oi_put = np.asarray(self.oi_put_ref, dtype=float)

        sigma_up = sigma + dsigma
        sigma_down = max(sigma - dsigma, 1e-6)

        # Vega com sigma_up e sigma_down (chamadas + puts)
        vega_up = GreeksEngine.calculate_vega(S, strikes, T, r, sigma_up) * (oi_call + oi_put)
        vega_down = GreeksEngine.calculate_vega(S, strikes, T, r, sigma_down) * (oi_call + oi_put)

        volga_exposure = float(np.nansum((vega_up - vega_down) / (2 * dsigma)))
        return volga_exposure
