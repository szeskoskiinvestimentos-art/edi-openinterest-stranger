import numpy as np
import pandas as pd
from scipy.stats import norm
from scipy.interpolate import UnivariateSpline
from src import config as settings
import datetime as dt
import logging
from src.greeks import GreeksEngine

# Configure logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class OptionsCalculator:
    def __init__(self, options_df, spot, expiry_date, risk_free=settings.RISK_FREE, iv_annual=settings.IV_ANNUAL):
        self.options_df = options_df.copy()
        self.spot = float(spot)
        self.expiry_date = expiry_date
        self.risk_free = float(risk_free)
        self.iv_annual = float(iv_annual)
        self.dataref = settings.DATAREF
        
        logger.info(f"OptionsCalculator initialized: Spot={self.spot:.2f}, Expiry={self.expiry_date}")
        
        # Garante que a coluna Expiry existe e é datetime
        if 'Expiry' not in self.options_df.columns:
            self.options_df['Expiry'] = pd.to_datetime(self.expiry_date) if self.expiry_date else pd.NaT
        else:
            self.options_df['Expiry'] = pd.to_datetime(self.options_df['Expiry'])
            
        # Garante que StrikeK é numérico
        self.options_df['StrikeK'] = pd.to_numeric(self.options_df['StrikeK'], errors='coerce')
        self.options_df = self.options_df.dropna(subset=['StrikeK'])
        
        # Preparação de Dados Básicos
        self.strikes_ref = np.sort(self.options_df['StrikeK'].unique())
        
        # Cálculo do Tempo (T) - Referência (vencimento mais próximo ou o passado)
        # Útil para métricas que exigem um T único, mas as gregas usarão T por vencimento
        bdays = int(np.busday_count(self.dataref, self.expiry_date)) if self.expiry_date else 1
        self.T = max(bdays, 1) / 252.0
        
        # OIs Agregados por Strike (Soma de todos os vencimentos para visualização geral)
        self.oi_call = self.options_df.loc[self.options_df['OptionType']=='CALL'].groupby('StrikeK')['Open Int'].sum()
        self.oi_put  = self.options_df.loc[self.options_df['OptionType']=='PUT'].groupby('StrikeK')['Open Int'].sum()
        
        self.oi_call_ref = np.array([self.oi_call.get(k, 0.0) for k in self.strikes_ref], dtype=float)
        self.oi_put_ref  = np.array([self.oi_put.get(k, 0.0)  for k in self.strikes_ref], dtype=float)
        
        # IV por Strike
        # Tenta usar a coluna 'IV' ou 'Implied Volatility' se existir no dataframe
        self.iv_strike_ref = None
        iv_col = None
        for col in ['IV', 'Implied Volatility', 'ImpliedVol', 'iv']:
            if col in self.options_df.columns:
                iv_col = col
                break
        
        if iv_col:
            # Agrupa por Strike e pega a média da IV (caso haja múltiplos vencimentos, idealmente filtraria)
            # Aqui pegamos a média geral por strike para a referência
            iv_series = self.options_df.groupby('StrikeK')[iv_col].mean()
            # Reindexa para garantir alinhamento com self.strikes_ref e preenche falhas
            self.iv_strike_ref = iv_series.reindex(self.strikes_ref).interpolate(method='linear').fillna(self.iv_annual).values
            # Se os valores estiverem em porcentagem (ex: 15.5), converte para decimal (0.155)
            if np.nanmean(self.iv_strike_ref) > 5.0: # Heurística: se média > 5, provável que seja %
                self.iv_strike_ref /= 100.0
        else:
            # Fallback para valor constante
            self.iv_strike_ref = np.full_like(self.strikes_ref, self.iv_annual, dtype=float)
        
        # Inicialização de atributos calculados posteriormente
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
        
        # Acumuladores de Exposição por Tipo (para Walls)
        self.gex_call_tot = np.zeros_like(self.strikes_ref, dtype=float)
        self.gex_put_tot = np.zeros_like(self.strikes_ref, dtype=float)

        # New attributes initialization
        self.max_pain = None
        self.max_pain_profile = None
        self.expected_moves = None
        self.mm_pnl_simulation = None

        
    def calculate_greeks_exposure(self):
        """Calcula Delta, Gamma, Charm, Vanna Exposure (Agregado por Vencimento)."""
        # Inicializa acumuladores zerados alinhados com self.strikes_ref
        self.dexp_tot = np.zeros_like(self.strikes_ref, dtype=float)
        self.gex_tot = np.zeros_like(self.strikes_ref, dtype=float)
        self.charm_tot = np.zeros_like(self.strikes_ref, dtype=float)
        self.vanna_tot = np.zeros_like(self.strikes_ref, dtype=float)
        self.vex_tot = np.zeros_like(self.strikes_ref, dtype=float)
        self.theta_tot = np.zeros_like(self.strikes_ref, dtype=float)
        
        # Acumuladores específicos para Walls
        self.gex_call_tot = np.zeros_like(self.strikes_ref, dtype=float)
        self.gex_put_tot = np.zeros_like(self.strikes_ref, dtype=float)
        
        # Para flip calculation (Gamma Flip Base)
        self.gex_flip_base = np.zeros_like(self.strikes_ref, dtype=float)
        
        # Parâmetros gerais
        S = self.spot
        r = self.risk_free
        sigma = self.iv_annual
        
        # Identifica vencimentos disponíveis
        if 'Expiry' in self.options_df.columns:
            expiries = self.options_df['Expiry'].dropna().unique()
        else:
            expiries = []
            
        # Loop por vencimento
        if len(expiries) > 0:
            for expiry in expiries:
                if pd.isnull(expiry): continue
                
                # Calcula Tempo (T) para este vencimento
                expiry_dt = pd.to_datetime(expiry)
                # Usa dataref (data base do cálculo)
                dataref_dt = pd.to_datetime(self.dataref)
                bdays = int(np.busday_count(dataref_dt.date(), expiry_dt.date()))
                T_exp = max(bdays, 1) / 252.0
                
                # Filtra e processa dados deste vencimento
                df_exp = self.options_df[self.options_df['Expiry'] == expiry]
                self._accumulate_greeks_for_expiry(df_exp, T_exp, S, r, sigma)
        else:
            # Fallback se não houver coluna Expiry válida (usa T global)
            self._accumulate_greeks_for_expiry(self.options_df, self.T, S, r, sigma)

        # IV Skew (Derivada local da Volatilidade Implícita)
        # Mantém simplificado baseada na referência global, pois IV Skew por vencimento é complexo de visualizar em 1 linha
        if self.iv_strike_ref is not None and len(self.iv_strike_ref) > 1:
            self.iv_skew = np.gradient(self.iv_strike_ref, self.strikes_ref)
        else:
            self.iv_skew = np.zeros_like(self.strikes_ref)

        # Acumulados (Cumulativos ao longo dos Strikes)
        self.dexp_cum = np.cumsum(self.dexp_tot)
        self.gex_cum = np.cumsum(self.gex_tot)
        self.charm_cum = np.cumsum(self.charm_tot)
        self.vanna_cum = np.cumsum(self.vanna_tot)
        self.vex_cum = np.cumsum(self.vex_tot)
        self.theta_cum = np.cumsum(self.theta_tot)
        self.gex_cum_signed = np.cumsum(self.gex_flip_base)
        
        # R-Gamma (PVOP) - Usando Gamma Exposure como base
        self.r_gamma_exposure = self.gex_tot 
        self.r_gamma_cum = np.cumsum(self.r_gamma_exposure)
        
    def _accumulate_greeks_for_expiry(self, df, T, S, r, sigma):
        """Calcula e acumula gregas para um dataframe (subset de vencimento)."""
        K_ref = self.strikes_ref
        
        # Agrupa OI por Strike para este subset
        # Reindexa para garantir alinhamento com self.strikes_ref
        oi_call = df[df['OptionType'] == 'CALL'].groupby('StrikeK')['Open Int'].sum().reindex(K_ref, fill_value=0.0).values
        oi_put  = df[df['OptionType'] == 'PUT'].groupby('StrikeK')['Open Int'].sum().reindex(K_ref, fill_value=0.0).values
        
        # Se OI for tudo zero, pula
        if np.sum(oi_call) + np.sum(oi_put) == 0:
            return

        # Calcula Gregas Unitárias para todos os strikes de referência com o T deste vencimento
        dC, gC = GreeksEngine.calculate_greeks(S, K_ref, T, r, sigma, 'C')
        dP, gP = GreeksEngine.calculate_greeks(S, K_ref, T, r, sigma, 'P')
        
        dC, gC = np.nan_to_num(dC), np.nan_to_num(gC)
        dP, gP = np.nan_to_num(dP), np.nan_to_num(gP)

        # Diferenças finitas para Charm e Vanna
        dT = settings.DT_DAILY
        dsigma = settings.DSIGMA
        
        # Charm
        dTp_C, _ = GreeksEngine.calculate_greeks(S, K_ref, max(T + dT, settings.EPSILON), r, sigma, 'C')
        dTm_C, _ = GreeksEngine.calculate_greeks(S, K_ref, max(T - dT, settings.EPSILON), r, sigma, 'C')
        chC = (np.nan_to_num(dTp_C) - np.nan_to_num(dTm_C)) / (2*dT)
        
        dTp_P, _ = GreeksEngine.calculate_greeks(S, K_ref, max(T + dT, settings.EPSILON), r, sigma, 'P')
        dTm_P, _ = GreeksEngine.calculate_greeks(S, K_ref, max(T - dT, settings.EPSILON), r, sigma, 'P')
        chP = (np.nan_to_num(dTp_P) - np.nan_to_num(dTm_P)) / (2*dT)
        
        # Vanna
        dSp_C, _ = GreeksEngine.calculate_greeks(S, K_ref, T, r, sigma + dsigma, 'C')
        dSm_C, _ = GreeksEngine.calculate_greeks(S, K_ref, T, r, max(sigma - dsigma, settings.EPSILON), 'C')
        vaC = (np.nan_to_num(dSp_C) - np.nan_to_num(dSm_C)) / (2*dsigma)
        
        dSp_P, _ = GreeksEngine.calculate_greeks(S, K_ref, T, r, sigma + dsigma, 'P')
        dSm_P, _ = GreeksEngine.calculate_greeks(S, K_ref, T, r, max(sigma - dsigma, settings.EPSILON), 'P')
        vaP = (np.nan_to_num(dSp_P) - np.nan_to_num(dSm_P)) / (2*dsigma)
        
        # Vega e Theta
        if hasattr(self, 'iv_strike_ref') and self.iv_strike_ref is not None:
             iv_vec = self.iv_strike_ref
        else:
             iv_vec = np.full_like(K_ref, sigma)
        
        # Vectorized Vega and Theta (Optimized with GreeksEngine)
        vega_val = GreeksEngine.calculate_vega(S, K_ref, T, r, iv_vec)
        
        thetaC = GreeksEngine.calculate_theta(S, K_ref, T, r, iv_vec, 'C')
        thetaP = GreeksEngine.calculate_theta(S, K_ref, T, r, iv_vec, 'P')
        
        thetaC_daily = thetaC / 252.0
        thetaP_daily = thetaP / 252.0
        
        # Acumula Totais Ponderados por OI
        self.dexp_tot += (dC * oi_call + dP * oi_put)
        
        # Gamma Exposure:
        # Standard: Dealer Long Gamma from Short Calls/Puts? 
        # Usually GEX = Gamma * OI * 100 * Spot * 0.01 (change for 1% move)
        # Here keeping original scaling: Gamma * OI * ContractMult * Spot * 0.01
        factor = settings.CONTRACT_MULT * S * 0.01
        
        gex_call = gC * oi_call * factor
        gex_put  = gP * oi_put * factor
        
        self.gex_tot += (gex_call + gex_put)
        self.gex_call_tot += gex_call
        self.gex_put_tot  += gex_put
        
        self.charm_tot += (chC * oi_call + chP * oi_put)
        self.vanna_tot += (vaC * oi_call + vaP * oi_put)
        self.vex_tot   += vega_val * (oi_call + oi_put)
        self.theta_tot += (thetaC_daily * oi_call + thetaP_daily * oi_put)
        
        # GEX Signed para Flip (Directional)
        # Assuming Dealer is Short Calls (Long Gamma if K<=S ?) -> Wait, logic was:
        # sgn_call = np.where(K <= S, +1.0, -1.0)
        # sgn_put  = np.where(K >= S, -1.0, +1.0)
        # This implies:
        # ITM Call (K<=S): Dealer Short -> Long Gamma (+)
        # OTM Call (K>S): Dealer Short -> Short Gamma (-) ?? This is unusual.
        # Standard GEX Model: Dealer is Short OTM Calls (Long Gamma) and Long OTM Puts (Short Gamma? No, Dealer Short Puts -> Long Gamma).
        # Usually GEX is positive everywhere for Long Gamma positions.
        # But for "Flip", we care about Dealer Delta Hedging flow.
        # Positive GEX -> Dealer buys dips/sells rallies (Stabilizing).
        # Negative GEX -> Dealer sells dips/buys rallies (Destabilizing).
        # Usually Dealers are Short Calls and Short Puts.
        # Short Call -> Long Gamma (Stabilizing).
        # Short Put -> Long Gamma (Stabilizing).
        # So GEX is usually all positive.
        # But the logic here seems to implement a specific "Flip" logic where some options are negative gamma.
        # Preserving original logic:
        sgn_call = np.where(K_ref <= S, +1.0, -1.0)
        sgn_put  = np.where(K_ref >= S, -1.0, +1.0)
        
        self.gex_flip_base += (gC * oi_call * sgn_call + gP * oi_put * sgn_put) * factor


    def _calculate_hvl_flip(self):
        """Calcula Gamma Flip ponderado por HVL."""
        try:
            if not getattr(settings, 'USE_HVL_FLIP', True):
                return None
            
            hvl_daily = float(settings.HVL_ANNUAL)/np.sqrt(252)
            step = float(np.median(np.diff(self.strikes_ref))) if len(self.strikes_ref)>1 else 25.0
            sigma_pts = float(settings.SIGMA_FACTOR) * max(step*2.0, float(self.spot)*float(hvl_daily))
            
            order = np.argsort(np.array(self.strikes_ref, dtype=float))
            ks = np.array(self.strikes_ref, dtype=float)[order]
            gex = np.array(self.gex_tot, dtype=float)[order]
            
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
        except Exception:
            return None

    def calculate_flips_and_walls(self):
        """Calcula Gamma Flip, Zero Gamma, Max Pain e Walls."""
        # Gamma Flip
        try:
            idx = np.where(self.gex_cum_signed >= 0)[0]
            self.gamma_flip = self.strikes_ref[idx[0]] if len(idx) > 0 else None
        except:
            self.gamma_flip = None
            
        # Gamma Flip HVL
        self.gamma_flip_hvl = self._calculate_hvl_flip()
            
        # Zero Gamma Level (Interpolado)
        self.zero_gamma_level = self.gamma_flip # Fallback
        try:
            idx_cross = np.where(np.diff(np.sign(self.gex_cum_signed)))[0]
            if len(idx_cross) > 0:
                i = idx_cross[0]
                y1, y2 = self.gex_cum_signed[i], self.gex_cum_signed[i+1]
                x1, x2 = self.strikes_ref[i], self.strikes_ref[i+1]
                if y2 != y1:
                    self.zero_gamma_level = x1 - y1 * (x2 - x1) / (y2 - y1)
                else:
                    self.zero_gamma_level = x1
        except:
            pass
            
        # Max Pain
        self.max_pain = self.calculate_max_pain()
        
        # Walls
        try:
            # Use aggregated GEX per strike calculated in calculate_greeks_exposure
            self.call_wall = self.strikes_ref[np.argmax(np.array(self.gex_call_tot))]
            self.put_wall = self.strikes_ref[np.argmax(np.array(self.gex_put_tot))]
        except:
            self.call_wall = self.spot
            self.put_wall = self.spot

        # Midwalls (Interpolação de OI para visualização)
        try:
            self.midwalls_strikes = (self.strikes_ref[:-1] + self.strikes_ref[1:]) / 2
            self.midwalls_call = (self.oi_call_ref[:-1] + self.oi_call_ref[1:]) / 2
            self.midwalls_put  = (self.oi_put_ref[:-1]  + self.oi_put_ref[1:]) / 2
        except:
            self.midwalls_strikes = np.array([])
            self.midwalls_call = np.array([])
            self.midwalls_put = np.array([])

        # Fibonacci Levels
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

        # R-Gamma (PVOP) - Alias para exposição gamma assinada com PVOP
        # PVOP já está implícito em gex_flip_base (multiplicado por CONTRACT_MULT * S * 0.01)
        self.r_gamma_exposure = self.gex_flip_base
        self.r_gamma_cum = self.gex_cum_signed
        
        # Flips Variations
        self.flip_variations = {}
        self.delta_flip_profile = {}
        self.flow_sentiment = {}
        self.gamma_flip_cone = {}
        
        try:
            self.calculate_gamma_flip_variations()
        except Exception as e:
            print(f"Error calculating flip variations: {e}")
            
        try:
            self.calculate_delta_flip_profile()
        except Exception as e:
            print(f"Error calculating delta flip profile: {e}")

        try:
            self.calculate_gamma_flip_cone()
        except Exception as e:
            print(f"Error calculating gamma flip cone: {e}")
            
        try:
            self.calculate_flow_sentiment()
        except Exception as e:
            print(f"Error calculating flow sentiment: {e}")

        try:
            self.calculate_expected_moves()
        except Exception as e:
            print(f"Error calculating expected moves: {e}")

        try:
            self.calculate_mm_pnl_simulation()
        except Exception as e:
            print(f"Error calculating MM PnL: {e}")


    def _find_zero_cross(self, x_arr, y_arr, target_x=None):
        """Helper to find zero crossing x-value."""
        x_arr = np.array(x_arr, dtype=float)
        y_arr = np.array(y_arr, dtype=float)
        if len(x_arr) == 0: return target_x if target_x else 0.0
        
        sg = np.sign(y_arr)
        idx = np.where(np.diff(sg) != 0)[0]
        
        if len(idx) > 0:
            if target_x is not None:
                # Find crossing closest to target_x (spot)
                j = int(np.argmin(np.abs(x_arr[idx] - float(target_x))))
                i = idx[j]
            else:
                i = idx[0] # First crossing
                
            y1, y2 = y_arr[i], y_arr[i+1]
            x1, x2 = x_arr[i], x_arr[i+1]
            if y2 == y1: return x1
            return float(x1 - y1 * (x2 - x1) / (y2 - y1))
        
        # No crossing, return argmin abs
        return float(x_arr[np.argmin(np.abs(y_arr))])

    def calculate_gamma_flip_variations(self):
        """Calcula múltiplas variações do Gamma Flip."""
        flips = {}
        strikes = np.array(self.strikes_ref, dtype=float)
        spot = float(self.spot)
        hvl_daily = float(settings.HVL_ANNUAL)/np.sqrt(252)
        sigma_factor = float(settings.SIGMA_FACTOR)
        
        # 1. Classic (Linear Interpolation)
        flips['Classic'] = self._find_zero_cross(strikes, self.gex_cum_signed, spot)
        
        # 2. Spline
        try:
            spl = UnivariateSpline(strikes, self.gex_cum_signed, s=0)
            roots = spl.roots()
            if len(roots) > 0:
                # Find root closest to spot
                roots_arr = np.array(roots).flatten()
                flips['Spline'] = float(roots_arr[np.argmin(np.abs(roots_arr - spot))])
            else:
                flips['Spline'] = flips['Classic']
        except Exception:
            flips['Spline'] = flips['Classic']
            
        # 3. HVL (Points Weighting)
        step = float(np.median(np.diff(strikes))) if len(strikes) > 1 else 25.0
        sigma_pts = float(sigma_factor * max(step*2.0, spot*hvl_daily))
        w_hvl = np.exp(-((strikes - spot)**2) / (2.0 * (sigma_pts**2)))
        
        # Legacy check: 
        # compute_gamma_flip_hvl uses gex_arr (which is passed as gex_flip_base usually). 
        # In legacy call: compute_gamma_flip_hvl(strikes, gex_flip_base, ...)
        # So we should use gex_flip_base (signed).
        gex_cum_hvl = np.cumsum(self.gex_flip_base * w_hvl)
        flips['HVL'] = self._find_zero_cross(strikes, gex_cum_hvl, spot)
        
        # 4. HVL Log
        sigma_m = hvl_daily * sigma_factor
        z = np.log(strikes / spot)
        w_log = np.exp(-(z**2) / (2.0 * (sigma_m**2)))
        gex_cum_log = np.cumsum(self.gex_flip_base * w_log)
        flips['HVL Log'] = self._find_zero_cross(strikes, gex_cum_log, spot)
        
        # 5. Sigma Kernel (IV Weighted)
        iv_vec = self.iv_strike_ref
        sigma_k = iv_vec * np.sqrt(self.T) * sigma_factor
        # Legacy: w = exp(-((strikes-spot)**2)/(2*(sigma_k*spot)**2)) roughly? 
        # Let's approximate based on standard kernel smoothing
        # Legacy compute_gamma_flip_sigma_kernel uses ivw.
        # Simplification: Use HVL Log as proxy for robust flip if exact kernel logic is complex to port without exact formula.
        # But let's try to match legacy "sigma_pts" logic but using local IV.
        sigma_pts_iv = sigma_factor * spot * (iv_vec / np.sqrt(252)) # approx daily IV per strike
        w_sk = np.exp(-((strikes - spot)**2) / (2.0 * (sigma_pts_iv**2)))
        gex_cum_sk = np.cumsum(self.gex_flip_base * w_sk)
        flips['Sigma Kernel'] = self._find_zero_cross(strikes, gex_cum_sk, spot)
        
        # 6. PVOP (Volume Weighted)
        # Already calculated in r_gamma_cum
        flips['PVOP'] = self._find_zero_cross(strikes, self.r_gamma_cum, spot)
        
        self.flip_variations = flips
        
    def calculate_delta_flip_profile(self):
        """Simula Spot +/- 15% para encontrar onde o Delta Agregado inverte."""
        spots_sim = np.linspace(self.spot * 0.85, self.spot * 1.15, 50)
        deltas_sim = []
        
        # Optimization: Pre-group data by expiry
        if 'Expiry' in self.options_df.columns:
            expiries = self.options_df['Expiry'].dropna().unique()
        else:
            expiries = []
            
        # Helper to pre-process OI and T for each expiry
        expiry_data = []
        if len(expiries) > 0:
            for expiry in expiries:
                if pd.isnull(expiry): continue
                expiry_dt = pd.to_datetime(expiry)
                dataref_dt = pd.to_datetime(self.dataref)
                bdays = int(np.busday_count(dataref_dt.date(), expiry_dt.date()))
                T_exp = max(bdays, 1) / 252.0
                
                df_exp = self.options_df[self.options_df['Expiry'] == expiry]
                oi_call = df_exp[df_exp['OptionType'] == 'CALL'].groupby('StrikeK')['Open Int'].sum().reindex(self.strikes_ref, fill_value=0.0).values
                oi_put  = df_exp[df_exp['OptionType'] == 'PUT'].groupby('StrikeK')['Open Int'].sum().reindex(self.strikes_ref, fill_value=0.0).values
                
                expiry_data.append({'T': T_exp, 'oi_call': oi_call, 'oi_put': oi_put})
        else:
             # Fallback single T
             expiry_data.append({'T': self.T, 'oi_call': self.oi_call_ref, 'oi_put': self.oi_put_ref})
        
        for s_sim in spots_sim:
            net_delta = 0.0
            for data in expiry_data:
                T = data['T']
                dC, _ = GreeksEngine.calculate_greeks(s_sim, self.strikes_ref, T, self.risk_free, self.iv_annual, 'C')
                dP, _ = GreeksEngine.calculate_greeks(s_sim, self.strikes_ref, T, self.risk_free, self.iv_annual, 'P')
                
                dC = np.nan_to_num(dC)
                dP = np.nan_to_num(dP)
                
                net_delta += np.sum(dC * data['oi_call'] + dP * data['oi_put'])
            
            deltas_sim.append(net_delta)
            
        deltas_sim = np.array(deltas_sim)
        flip_val = self._find_zero_cross(spots_sim, deltas_sim, self.spot)
        
        self.delta_flip_profile = {
            'spots': spots_sim,
            'deltas': deltas_sim,
            'flip_value': flip_val
        }

    def calculate_gamma_flip_cone(self):
        """Calcula Gamma Flip variando o Sigma Factor (Cone de Incerteza)."""
        alphas = np.linspace(settings.CONE_ALPHA_MIN, settings.CONE_ALPHA_MAX, settings.CONE_ALPHA_STEPS)
        flips = []
        
        # Salva estado original
        original_sigma_factor = float(settings.SIGMA_FACTOR)
        
        try:
            for alpha in alphas:
                settings.SIGMA_FACTOR = alpha
                flip = self._calculate_hvl_flip()
                flips.append(flip if flip else 0.0)
        finally:
            settings.SIGMA_FACTOR = original_sigma_factor
            
        self.gamma_flip_cone = {
            'alphas': alphas,
            'flips': flips
        }
        
    def calculate_flow_sentiment(self):
        """Analisa variação de preço e volume para determinar fluxo Bull/Bear."""
        bull_vols = []
        bear_vols = []
        strikes = self.strikes_ref
        
        # Ensure StrikeK is float in df
        df = self.options_df.copy()
        df['StrikeK'] = pd.to_numeric(df['StrikeK'], errors='coerce')
        
        for k in strikes:
            # Filter options for this strike
            # Using simple equality with tolerance
            df_k = df[np.isclose(df['StrikeK'], k, atol=1e-5)]
            
            v_bull = 0.0
            v_bear = 0.0
            
            for _, row in df_k.iterrows():
                tipo = str(row['OptionType']).strip().upper()
                # Handle possible column names for Change/Volume
                chg = float(row.get('Change', 0.0)) if pd.notnull(row.get('Change', 0.0)) else 0.0
                vol = float(row.get('Volume', 0.0)) if pd.notnull(row.get('Volume', 0.0)) else 0.0
                
                # Normalize types
                if tipo in ['C', 'CALL', 'COMPRA']: tipo = 'CALL'
                if tipo in ['P', 'PUT', 'VENDA']: tipo = 'PUT'
                
                if vol > 0:
                    if tipo == 'CALL':
                        if chg > 0: v_bull += vol
                        elif chg < 0: v_bear += vol
                    elif tipo == 'PUT':
                        if chg > 0: v_bear += vol
                        elif chg < 0: v_bull += vol
            
            bull_vols.append(v_bull)
            bear_vols.append(-v_bear) # Negative for plotting
            
        self.flow_sentiment = {
            'bull': np.array(bull_vols),
            'bear': np.array(bear_vols)
        }


    def calculate_max_pain(self):
        loss = []
        for k_exp in self.strikes_ref:
            # Assume settlement at k_exp
            # Call holders gain max(0, k_exp - K)
            # Put holders gain max(0, K - k_exp)
            # This is the payout FROM sellers TO buyers.
            # Max Pain is where this payout is MINIMIZED (Sellers keep most premium).
            val_calls = np.maximum(0, k_exp - self.strikes_ref) * self.oi_call_ref
            val_puts = np.maximum(0, self.strikes_ref - k_exp) * self.oi_put_ref
            loss.append(np.sum(val_calls + val_puts))
            
        loss = np.array(loss)
        self.max_pain_profile = {
            'strikes': self.strikes_ref,
            'loss': loss
        }
        return self.strikes_ref[np.argmin(loss)]

    def calculate_expected_moves(self):
        """Calcula movimentos esperados baseados na IV ATM."""
        try:
            if self.iv_strike_ref is None or len(self.iv_strike_ref) == 0:
                 self.expected_moves = []
                 return

            # Encontrar IV ATM
            idx_atm = int(np.argmin(np.abs(self.strikes_ref - self.spot)))
            iv_atm = self.iv_strike_ref[idx_atm]
            
            # Movimentos para hoje (1 dia), 1 semana, e Expiração
            t_days = [1, 5, self.T * 252]
            labels = ['1 Dia', '1 Semana', 'Expiração']
            
            moves = []
            for t, lbl in zip(t_days, labels):
                t_year = t / 252.0
                sigma_move = self.spot * iv_atm * np.sqrt(t_year)
                moves.append({
                    'label': lbl,
                    'days': t,
                    'sigma_1_up': self.spot + sigma_move,
                    'sigma_1_down': self.spot - sigma_move,
                    'sigma_2_up': self.spot + 2*sigma_move,
                    'sigma_2_down': self.spot - 2*sigma_move
                })
            self.expected_moves = moves
        except Exception as e:
            print(f"Error calculating expected moves: {e}")
            self.expected_moves = []

    def calculate_mm_pnl_simulation(self):
        """Simula o PnL do Market Maker em função do movimento do Spot."""
        # Premissa: MM está Short na ponta dos clientes (Se clientes Long Call, MM Short Call)
        # Aproximação: Delta Hedged no Spot atual.
        # PnL = 0.5 * Gamma * (dS^2) + Theta * dT ...
        # Vamos simular o PnL total da carteira do MM para range de spots
        
        spots_sim = np.linspace(self.spot * settings.SIM_SPOT_RANGE_LOWER, self.spot * settings.SIM_SPOT_RANGE_UPPER, settings.SIM_STEPS)
        pnl_sim = []
        
        # Carteira MM = -1 * (Call OI + Put OI)
        # Delta Inicial MM
        
        # Valor Inicial da Carteira (negativo das opções)
        # V_0 = - sum(Price_0 * OI)
        
        # Simplificação via Gregas Locais (Taylor Expansion de 2ª ordem)
        # PnL approx = Delta_Net * dS + 0.5 * Gamma_Net * dS^2 + Theta_Net * dT
        # Assumindo Delta Neutral no inicio (dS=0 -> PnL=0)
        # Então PnL(S_new) ~= 0.5 * Gamma_Net * (S_new - S_0)^2
        # Mas isso é só Gamma PnL. Vamos tentar algo mais robusto: Valor Justo.
        
        try:
            mm_pnl = []
            
            # Valor das opções no spot atual
            calls_val_0 = GreeksEngine.bs_price(self.spot, self.strikes_ref, self.T, self.risk_free, self.iv_annual, 'C')
            puts_val_0  = GreeksEngine.bs_price(self.spot, self.strikes_ref, self.T, self.risk_free, self.iv_annual, 'P')
            
            # MM Position (Short Client Longs)
            # Assumindo que OI representa posições LONGAS dos clientes
            # MM Value = -1 * (Calls * OI_Call + Puts * OI_Put)
            mm_val_0 = -1 * np.sum(calls_val_0 * self.oi_call_ref + puts_val_0 * self.oi_put_ref)
            
            # Hedge Delta (Ações)
            # MM Delta = -1 * (Delta_Call * OI_Call + Delta_Put * OI_Put)
            delta_calls, _ = GreeksEngine.calculate_greeks(self.spot, self.strikes_ref, self.T, self.risk_free, self.iv_annual, 'C')
            delta_puts, _  = GreeksEngine.calculate_greeks(self.spot, self.strikes_ref, self.T, self.risk_free, self.iv_annual, 'P')
            mm_delta_0 = -1 * np.sum(delta_calls * self.oi_call_ref + delta_puts * self.oi_put_ref)
            
            # Valor do Hedge em Cash = - (MM Delta * Spot)
            hedge_cash = - (mm_delta_0 * self.spot)
            
            for s_sim in spots_sim:
                # Valor das opções no spot simulado (T constante, volatilidade constante)
                calls_val_s = GreeksEngine.bs_price(s_sim, self.strikes_ref, self.T, self.risk_free, self.iv_annual, 'C')
                puts_val_s  = GreeksEngine.bs_price(s_sim, self.strikes_ref, self.T, self.risk_free, self.iv_annual, 'P')
                
                mm_val_s = -1 * np.sum(calls_val_s * self.oi_call_ref + puts_val_s * self.oi_put_ref)
                
                # Valor do Hedge (Mantido fixo, pois é PnL instantâneo/curto prazo sem rebalanceamento)
                hedge_val_s = mm_delta_0 * s_sim + hedge_cash
                
                total_pnl = (mm_val_s + hedge_val_s) - (mm_val_0 + (mm_delta_0 * self.spot + hedge_cash))
                mm_pnl.append(total_pnl)
                
            self.mm_pnl_simulation = {
                'spots': spots_sim,
                'pnl': np.array(mm_pnl)
            }
        except Exception as e:
            print(f"Error calculating MM PnL: {e}")
            self.mm_pnl_simulation = None


    def calculate_fair_value_scenario(self, target_spot, target_days_from_now=0):
        """
        Simula o Valor Justo (Fair Value) de opções chave para um cenário de preço alvo.
        Retorna um dicionário com os preços simulados.
        
        target_spot: Preço do ativo subjacente simulado (ex: bater na Call Wall).
        target_days_from_now: Dias úteis a partir de hoje (0 = hoje, 1 = amanhã).
        """
        # Ajuste do Tempo (T)
        # Reduz T proporcionalmente aos dias passados (aproximação linear)
        days_to_expiry = self.T / settings.DT_DAILY
        new_T = max(settings.MIN_T_EXPIRY, (days_to_expiry - target_days_from_now) * settings.DT_DAILY) # Mínimo 1 dia
        
        # Strikes de Interesse: Call Wall, Put Wall, Gamma Flip, Spot Atual
        raw_strikes = []
        if self.call_wall is not None: raw_strikes.append(self.call_wall)
        if self.put_wall is not None: raw_strikes.append(self.put_wall)
        if self.gamma_flip is not None: raw_strikes.append(self.gamma_flip)
        else: raw_strikes.append(self.spot)
        raw_strikes.append(self.spot) # Always add spot

        valid_strikes = []
        for k in raw_strikes:
            try:
                val = float(k)
                if not np.isnan(val):
                    valid_strikes.append(val)
            except (ValueError, TypeError):
                continue
        
        key_strikes = sorted(list(set(valid_strikes)))
        
        simulation_results = []
        
        for k in key_strikes:
            if k is None or np.isnan(k): continue
            
            # Preço Call e Put no Spot Atual (Hoje)
            call_now = float(GreeksEngine.bs_price(self.spot, k, self.T, self.risk_free, self.iv_annual, 'C'))
            put_now  = float(GreeksEngine.bs_price(self.spot, k, self.T, self.risk_free, self.iv_annual, 'P'))
            
            # Preço Call e Put no Cenário (Alvo)
            call_sim = float(GreeksEngine.bs_price(target_spot, k, new_T, self.risk_free, self.iv_annual, 'C'))
            put_sim  = float(GreeksEngine.bs_price(target_spot, k, new_T, self.risk_free, self.iv_annual, 'P'))
            
            # Delta Estimado (Grosso modo, variação preço / variação spot)
            # Ou usar o Delta Black Scholes no ponto simulado
            
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


    def get_summary_metrics(self):
        """Retorna um dicionário com métricas resumidas para o dashboard."""
        delta_agregado = float(np.nansum(self.dexp_tot))
        regime = 'Gamma Positivo' if (self.gamma_flip and self.spot >= self.gamma_flip) else 'Gamma Negativo'
        
        # Dealer Pressure (Simplificado)
        # Requer normalização dos arrays
        def _norm(a):
            m = float(np.nanmax(np.abs(a))) if np.nanmax(np.abs(a))>0 else 1.0
            return a/m
            
        dpi_arr = (settings.DPI_WEIGHTS['delta']*_norm(self.dexp_tot) + 
                   settings.DPI_WEIGHTS['gamma']*_norm(self.gex_tot) + 
                   settings.DPI_WEIGHTS['charm']*_norm(self.charm_tot) + 
                   settings.DPI_WEIGHTS['vanna']*_norm(self.vanna_tot))
                   
        i_spot = int(np.argmin(np.abs(self.strikes_ref - self.spot)))
        i0 = max(0, i_spot - settings.DPI_WINDOW_STRIKES)
        i1 = min(len(self.strikes_ref)-1, i_spot + settings.DPI_WINDOW_STRIKES)
        dealer_pressure_spot = float(np.nanmean(dpi_arr[i0:i1+1]))

        # Dados para Tabela de Valores
        iv_daily = self.iv_annual / np.sqrt(252)
        range_low = self.spot * (1 - iv_daily)
        range_high = self.spot * (1 + iv_daily)
        
        # Top Walls OI
        idx_call = np.argsort(self.oi_call_ref)[-3:]
        idx_put  = np.argsort(self.oi_put_ref)[-3:]
        walls_call_txt = ' | '.join([f"{self.strikes_ref[i]:.0f}({self.oi_call_ref[i]:,.0f})" for i in reversed(idx_call)])
        walls_put_txt  = ' | '.join([f"{self.strikes_ref[i]:.0f}({self.oi_put_ref[i]:,.0f})" for i in reversed(idx_put)])

        return {
            'spot': self.spot,
            'delta_agregado': delta_agregado,
            'gamma_flip': self.gamma_flip,
            'gamma_flip_hvl': self.gamma_flip_hvl,
            'zero_gamma_level': self.zero_gamma_level,
            'max_pain': self.max_pain,
            'call_wall': self.call_wall,
            'put_wall': self.put_wall,
            'regime': regime,
            'dealer_pressure': dealer_pressure_spot,
            'dpi_arr': dpi_arr,
            'range_low': range_low,
            'range_high': range_high,
            'walls_call_txt': walls_call_txt,
            'walls_put_txt': walls_put_txt,
            'iv_daily': iv_daily,
            'dataref': self.dataref
        }
