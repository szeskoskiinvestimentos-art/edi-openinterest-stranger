import numpy as np
import pandas as pd
from scipy.stats import norm
from scipy.interpolate import UnivariateSpline
from scipy.ndimage import gaussian_filter1d
from src import config as settings
import datetime as dt
import logging
from src.greeks import GreeksEngine
from typing import Any, Optional, TypedDict, cast

# Configure logger
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
        
        # Cálculo do Tempo (T) - Referência
        # Se for vencimento hoje (0DTE), usa fração do dia (0.1 dia = ~2h de risco final) para capturar Gamma explosivo
        bdays = int(np.busday_count(self.dataref, self.expiry_date)) if self.expiry_date else 1
        is_0dte = bool(self.expiry_date) and (self.dataref == self.expiry_date)
        if getattr(settings, 'USE_ODTE_MODE', False) and is_0dte:
            self.T = settings.MIN_T_EXPIRY
        else:
            self.T = (1.0/252.0) if bdays <= 0 else (bdays/252.0)
        
        # OIs Agregados por Strike (Soma de todos os vencimentos para visualização geral)
        self.oi_call = self.options_df.loc[self.options_df['OptionType']=='CALL'].groupby('StrikeK')['Open Int'].sum()
        self.oi_put  = self.options_df.loc[self.options_df['OptionType']=='PUT'].groupby('StrikeK')['Open Int'].sum()
        
        self.oi_call_ref = np.array([self.oi_call.get(k, 0.0) for k in self.strikes_ref], dtype=float)
        self.oi_put_ref  = np.array([self.oi_put.get(k, 0.0)  for k in self.strikes_ref], dtype=float)

        # Volume Agregado por Strike (Se disponível)
        if 'Volume' in self.options_df.columns:
            self.vol_call = self.options_df.loc[self.options_df['OptionType']=='CALL'].groupby('StrikeK')['Volume'].sum()
            self.vol_put  = self.options_df.loc[self.options_df['OptionType']=='PUT'].groupby('StrikeK')['Volume'].sum()
        else:
            self.vol_call = pd.Series(dtype=float)
            self.vol_put = pd.Series(dtype=float)
            
        self.vol_call_ref = np.array([self.vol_call.get(k, 0.0) for k in self.strikes_ref], dtype=float)
        self.vol_put_ref  = np.array([self.vol_put.get(k, 0.0)  for k in self.strikes_ref], dtype=float)

        
        # IV por Strike
        # Tenta usar a coluna 'IV' ou 'Implied Volatility' se existir no dataframe
        self.iv_strike_ref = None
        iv_col = None
        for col in ['IV', 'Implied Volatility', 'ImpliedVol', 'iv']:
            if col in self.options_df.columns:
                iv_col = col
                break
        
        fallback_iv = float(self.iv_annual) if np.isfinite(self.iv_annual) and self.iv_annual > 0 else float(getattr(settings, 'HVL_ANNUAL', 0.12))

        if iv_col:
            # Agrupa por Strike e pega a média da IV (caso haja múltiplos vencimentos, idealmente filtraria)
            # Aqui pegamos a média geral por strike para a referência
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
            # Fallback para valor constante
            self.iv_strike_ref = np.full_like(self.strikes_ref, fallback_iv, dtype=float)
        
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
                is_0dte = (dataref_dt.date() == expiry_dt.date())
                T_exp = settings.MIN_T_EXPIRY if (getattr(settings, 'USE_ODTE_MODE', False) and is_0dte) else ((1.0/252.0) if bdays <= 0 else (bdays/252.0))
                
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
        
        # Charm = -dDelta/dT (rate of change of Delta as time decreases)
        dTp_C, _ = GreeksEngine.calculate_greeks(S, K_ref, max(T + dT, settings.EPSILON), r, sigma, 'C')
        dTm_C, _ = GreeksEngine.calculate_greeks(S, K_ref, max(T - dT, settings.EPSILON), r, sigma, 'C')
        chC = (np.nan_to_num(dTm_C) - np.nan_to_num(dTp_C)) / (2*dT)
        
        dTp_P, _ = GreeksEngine.calculate_greeks(S, K_ref, max(T + dT, settings.EPSILON), r, sigma, 'P')
        dTm_P, _ = GreeksEngine.calculate_greeks(S, K_ref, max(T - dT, settings.EPSILON), r, sigma, 'P')
        chP = (np.nan_to_num(dTm_P) - np.nan_to_num(dTp_P)) / (2*dT)
        
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
        except Exception:
            return None

    def calculate_flips_and_walls(self):
        """Calcula Gamma Flip, Zero Gamma, Max Pain e Walls."""
        # Gamma Flip (Usando lógica robusta do _find_zero_cross)
        try:
            self.gamma_flip = self._find_zero_cross(self.strikes_ref, self.gex_cum_signed, self.spot)
        except Exception as e:
            print(f"Erro ao calcular Gamma Flip: {e}")
            self.gamma_flip = None
            
        # Gamma Flip HVL
        self.gamma_flip_hvl = self._calculate_hvl_flip()
            
        # Zero Gamma Level (Interpolado)
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
            
        # Max Pain
        self.max_pain = self.calculate_max_pain()
        
        # Walls
        try:
            # Use aggregated GEX per strike calculated in calculate_greeks_exposure
            self.call_wall = self.strikes_ref[np.argmax(np.array(self.gex_call_tot))]
            self.put_wall = self.strikes_ref[np.argmax(np.array(self.gex_put_tot))]
            
            # Calculate Effective Walls (Weighted Average of Top Strikes)
            self.calculate_effective_walls()
        except:
            self.call_wall = self.spot
            self.put_wall = self.spot
            self.effective_call_wall = self.spot
            self.effective_put_wall = self.spot

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


    def calculate_effective_walls(self):
        """Calcula Effective Walls (Média Ponderada dos Top Strikes)."""
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
            # logger.warning(f"Error calculating effective walls: {e}")
            self.effective_call_wall = self.call_wall
            self.effective_put_wall = self.put_wall

    def _find_zero_cross(self, x_arr, y_arr, target_x=None):
        """Helper to find zero crossing x-value."""
        x_arr = np.array(x_arr, dtype=float)
        y_arr = np.array(y_arr, dtype=float)
        if len(x_arr) == 0: return target_x if target_x else 0.0
        
        sg = np.sign(y_arr)
        idx = np.where(np.diff(sg) != 0)[0]
        
        # 1. Tenta encontrar um cruzamento real de zero (Zero Gamma)
        if len(idx) > 0:
            if target_x is not None:
                # Encontra o cruzamento mais próximo do Spot
                distances = np.abs(x_arr[idx] - float(target_x))
                j = int(np.argmin(distances))
                i = idx[j]
                
                # Validação de Distância: Se o cruzamento estiver muito longe (>40%), ignora
                # O usuário reclamou de valores irrelevantes (ex: 7).
                closest_x = x_arr[i] # Aproximação

                if abs(closest_x - target_x) > (target_x * 0.40):
                    pass # Cai para o fallback local
                else:
                    # Interpolação Linear para precisão
                    y1, y2 = y_arr[i], y_arr[i+1]
                    x1, x2 = x_arr[i], x_arr[i+1]
                    if y2 == y1: return x1
                    return float(x1 - y1 * (x2 - x1) / (y2 - y1))
            else:
                i = idx[0] # First crossing
                y1, y2 = y_arr[i], y_arr[i+1]
                x1, x2 = x_arr[i], x_arr[i+1]
                if y2 == y1: return x1
                return float(x1 - y1 * (x2 - x1) / (y2 - y1))
        
        # 2. Fallback: Se não houver cruzamento ou for muito longe
        # Procura o ponto de menor Gamma Absoluto DENTRO de uma janela operacional (+/- 30% do Spot)
        if target_x is not None:
            lower_bound = target_x * 0.70
            upper_bound = target_x * 1.30
            mask = (x_arr >= lower_bound) & (x_arr <= upper_bound)

            if np.any(mask):
                local_x = x_arr[mask]
                local_y = y_arr[mask]
                # Retorna o strike com menor gamma absoluto na região (o "mais próximo de zero" localmente)
                best_local = float(local_x[np.argmin(np.abs(local_y))])
                return best_local

        # 3. Último caso: Retorna o mínimo global (pode ser o 7 indesejado, mas é o matemático)
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
        
        # 7. HVL Gaussian Smoothed
        try:
            # Sigma otimizado via discovery_levels.py
            sigma_gauss = 1.17 
            gex_smooth = gaussian_filter1d(self.gex_flip_base, sigma=sigma_gauss)
            gex_cum_gauss = np.cumsum(gex_smooth)
            flips['HVL Gaussian'] = self._find_zero_cross(strikes, gex_cum_gauss, spot)
        except Exception as e:
            # logger.error(f"Error calculating HVL Gaussian flip: {e}")
            flips['HVL Gaussian'] = flips['Classic'] # Fallback

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
                is_0dte = (dataref_dt.date() == expiry_dt.date())
                T_exp = settings.MIN_T_EXPIRY if is_0dte else ((1.0/252.0) if bdays <= 0 else (bdays/252.0))
                
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

        except Exception as e:
            # logger.error(f"Error calculating gamma flip cone: {e}")
            flips = [None] * len(alphas)

        self.gamma_flip_cone = {
            'alphas': list(alphas),
            'flips': flips
        }

    def calculate_flow_sentiment(self):
        """Analisa variação de preço e volume para determinar fluxo Bull/Bear."""
        def _to_float(v):
            if v is None or (isinstance(v, float) and np.isnan(v)):
                return None
            try:
                if isinstance(v, str):
                    v = v.strip().replace('%', '').replace('.', '').replace(',', '.')
                x = float(v)
                return x if np.isfinite(x) else None
            except Exception:
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

    def calculate_expected_moves(self):
        """Calcula movimentos esperados baseados na IV ATM."""
        try:
            # Tenta usar IV ATM do ambiente primeiro (mais preciso para 0DTE se fornecido manualmente)
            iv_atm = None
            try:
                env_iv = getattr(settings, 'EWZ_ATM_IV_PCT', None)
                if env_iv is not None:
                    env_iv_f = float(env_iv)
                    if np.isfinite(env_iv_f) and env_iv_f > 0:
                        iv_atm = env_iv_f / 100.0
            except (ValueError, TypeError):
                pass
            
            # Se não tiver manual, tenta extrair dos dados
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

            # Movimentos para hoje (1 dia/0DTE), 1 semana, e Expiração
            # Se for 0DTE, o movimento "1 Dia" é na verdade "Intraday Restante"
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
            self.iv_atm_used = iv_atm # Guarda para uso em outras funções
            
        except Exception as e:
            logger.error(f"Erro em calculate_expected_moves: {e}")
            self.expected_moves = []

    def calculate_volatility_analysis(self):
        """Calcula métricas avançadas de volatilidade (VRP, Cone, Regime)."""
        try:
            # Recupera dados do settings ou usa defaults calculados
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
            
            # Classificação de Regime
            if vrp > 1.15: regime_vol = "Cara (Venda de Vol)"
            elif vrp < 0.85: regime_vol = "Barata (Compra de Vol)"
            else: regime_vol = "Justa (Neutro)"
            
            # Classificação IV Rank
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
        """Identifica riscos de Pinning (preço travado) para 0DTE."""
        try:
            if (self.T * 252) > 1.5: # Só calcula se for próximo do vencimento (< 1.5 dias)
                self.pinning_risk = None
                return

            # Strike com maior Gamma Total (Absoluto) é o maior ímã
            # Gamma Total = Gamma Call + Gamma Put (ambos positivos para Long, negativos para Short dealer)
            # Assumindo Dealer Short Gamma perto do vencimento em strikes vendidos
            
            # Usando GEX Total Absoluto como proxy de interesse
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


    def get_summary_metrics(self) -> SummaryMetrics:
        """Retorna um dicionário com métricas resumidas para o dashboard."""
        delta_agregado = float(np.nansum(self.dexp_tot))
        regime = 'Gamma Positivo' if (self.gamma_flip and self.spot >= self.gamma_flip) else 'Gamma Negativo'
        
        # Dealer Pressure (Simplificado)
        # Requer normalização dos arrays
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

        # Dados para Tabela de Valores
        iv_daily = self.iv_annual / np.sqrt(252)
        range_low = self.spot * (1 - iv_daily)
        range_high = self.spot * (1 + iv_daily)
        
        # Top Walls OI (mantém strikes no espaço original; escala aplicada apenas na exibição)
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
