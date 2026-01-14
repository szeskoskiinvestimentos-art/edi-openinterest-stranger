# CELL 0
import os
import sys
import json
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.io as pio

# Configuration
TOP_N_CONTRACTS = 5
pd.options.display.float_format = '{:,.2f}'.format
pd.set_option('display.max_columns', None)

print('Environment initialized.')


# CELL 2
try:
    import plotly
except ImportError:
    import sys, subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'plotly'])
import pandas as pd
import numpy as np
import re, datetime as dt, os
from pathlib import Path
from scipy.stats import norm
from scipy.interpolate import PchipInterpolator
from scipy.optimize import brentq
import plotly.graph_objects as go


# CELL 3
CONTRACT_MULT = 50000
SPOT = 5.40950
IV_ANNUAL = 0.1318
RISK_FREE = 0.05
DATAREF = dt.date.today()
USE_IMPLIED_VOL = False
USE_CSV_SPOT = False
HVL_ANNUAL = 0.1318
SIGMA_FACTOR = 1.0
USE_HVL_FLIP = True
USE_CSV_SPOT = False
ATM_BAND_STEPS = 0.5
DPI_WEIGHTS = {'delta':0.25,'gamma':0.25,'charm':0.25,'vanna':0.25}
DPI_WINDOW_STRIKES = 2
EXTERNAL_PUT_OI_TOTAL = None
EXTERNAL_CALL_OI_TOTAL = None
EXTERNAL_PUT_PREM_TOTAL = None
EXTERNAL_CALL_PREM_TOTAL = None


# CELL 4
def _num(s):
    return pd.to_numeric(
        s.astype(str).str.replace(r'[^\d\.\-]', '', regex=True).str.replace(',', ''),
        errors='coerce'
    )

def collect_csv_files():
    roots = [Path.cwd(), Path('/content'), Path('/mnt/data')]
    files = [str(p) for r in roots if r.exists() for p in r.glob('*.csv')]
    if not files:
        try:
            from google.colab import files as colab_files  # type: ignore
            up = colab_files.upload()
            if up: files = list(up.keys())
        except Exception:
            pass
    if not files:
        return []
    return files

def read_options_table(path: Path):
    try:
        df = pd.read_csv(path)
    except Exception:
        return None, None
    if df.empty:
        return None, None
    df.columns = [c.strip() for c in df.columns]
    spot_val = None
    for c in df.columns:
        if any(k in c.lower() for k in ['spot', 'underlying', 'à vista', 'avista']):
            try:
                spot_val = float(_num(df[c]).dropna().iloc[0])
                break
            except Exception:
                pass
    rename_map = {
        'Open Int':'Open Int', 'Open Interest':'Open Int', 'OI':'Open Int',
        'Qtde. Contratos em Aberto':'Open Int',
        'Option Type':'OptionType', 'Type':'OptionType'
    }
    df = df.rename(columns={c: rename_map[c] for c in df.columns if c in rename_map})
    if not {'Strike','Open Int','OptionType'}.issubset(df.columns):
        return None, spot_val
    df['OptionType'] = (df['OptionType'].astype(str).str.strip().str.upper()
                        .replace({'C':'CALL','CALLS':'CALL','P':'PUT','PUTS':'PUT'}))
    for col in ['Strike','Last','Volume','Open Int','Premium','Change']:
        if col in df.columns:
            df[col] = _num(df[col])
    df = df.dropna(subset=['Strike','Open Int']).reset_index(drop=True)
    df['StrikeK'] = df['Strike'].astype(float)
    return df, spot_val


# CELL 5
CSV_FILES = collect_csv_files()
parts, spot_auto = [], None
for f in CSV_FILES:
    d, s = read_options_table(Path(f))
    if d is not None and not d.empty:
        parts.append(d)
    if s and not spot_auto:
        spot_auto = s
if not parts:
    options = pd.DataFrame(columns=['Strike','Open Int','OptionType','StrikeK'])
    NO_DATA = True
else:
    options = pd.concat(parts, ignore_index=True)
    NO_DATA = False
if USE_CSV_SPOT and spot_auto: SPOT = spot_auto
if SPOT < 100: SPOT *= 1000
print('Spot (pontos):', SPOT)


# CELL 6
expiry = None
m = re.search(r'exp[_\-]?(20\d{2})[_\-](\d{2})[_\-](\d{2})', os.path.basename(CSV_FILES[0]))
if m:
    yyyy, mm, dd = map(int, m.groups())
    expiry = dt.date(yyyy, mm, dd)
bdays = int(np.busday_count(DATAREF, expiry)) if expiry else 1
T = max(bdays, 1) / 252
strikes_ref = np.sort(options['StrikeK'].unique())
min_k, max_k = strikes_ref.min(), strikes_ref.max()
pad = max(10, int((max_k - min_k) * 0.03))
print('Nº strikes:', len(strikes_ref), '| Range:', (min_k, max_k))


# CELL 7
oi_call = options.loc[options['OptionType']=='CALL'].groupby('StrikeK', as_index=True)['Open Int'].sum()
oi_put  = options.loc[options['OptionType']=='PUT'].groupby('StrikeK', as_index=True)['Open Int'].sum()
oi_call_ref = np.array([oi_call.get(k, 0.0) for k in strikes_ref], dtype=float)
oi_put_ref  = np.array([oi_put.get(k, 0.0)  for k in strikes_ref], dtype=float)
midwalls_strikes = (strikes_ref[:-1] + strikes_ref[1:]) / 2
midwalls_call = (oi_call_ref[:-1] + oi_call_ref[1:]) / 2
midwalls_put  = (oi_put_ref[:-1]  + oi_put_ref[1:]) / 2
print('Midwalls criadas:', len(midwalls_strikes))
def bs_price(S,K,T,r,sigma,typ):
    # Versão Otimizada (Vetorizada)
    S = np.asarray(S, dtype=float)
    K = np.asarray(K, dtype=float)
    T = float(T)
    sigma = float(sigma)
    with np.errstate(divide='ignore', invalid='ignore'):
        d1 = (np.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*np.sqrt(T))
        d2 = d1 - sigma*np.sqrt(T)
    if typ=='C':
        val = S*norm.cdf(d1) - K*np.exp(-r*T)*norm.cdf(d2)
    else:
        val = K*np.exp(-r*T)*norm.cdf(-d2) - S*norm.cdf(-d1)
    return val
def implied_vol(price,S,K,T,r,typ):
    if np.isnan(price) or price<=0: return np.nan
    lo, hi = 1e-6, 3.0
    for _ in range(40):
        mid = 0.5*(lo+hi)
        pm = bs_price(S,K,T,r,mid,typ)
        if np.isnan(pm): return np.nan
        if pm>price: hi = mid
        else: lo = mid
    return 0.5*(lo+hi)
def _group_price(df, typ, col1='Last', col2='Premium'):
    sel = df.loc[df['OptionType']==typ]
    series = None
    if col1 in sel.columns and not sel[col1].isna().all():
        series = sel.groupby('StrikeK')[col1].mean()
    elif col2 in sel.columns and not sel[col2].isna().all():
        series = sel.groupby('StrikeK')[col2].mean()
    else:
        series = pd.Series(dtype=float)
    return np.array([series.get(k, np.nan) for k in strikes_ref], dtype=float)
prices_call = _group_price(options,'CALL')
prices_put  = _group_price(options,'PUT')
iv_call_ref = np.array([implied_vol(prices_call[i], SPOT, float(k), T, RISK_FREE, 'C') if USE_IMPLIED_VOL else IV_ANNUAL for i,k in enumerate(strikes_ref)])
iv_put_ref  = np.array([implied_vol(prices_put[i],  SPOT, float(k), T, RISK_FREE, 'P') if USE_IMPLIED_VOL else IV_ANNUAL for i,k in enumerate(strikes_ref)])
iv_pair = np.vstack([iv_call_ref, iv_put_ref])
iv_strike_ref = np.nanmean(iv_pair, axis=0)
iv_strike_ref = np.where(np.isnan(iv_strike_ref), IV_ANNUAL, iv_strike_ref)
iv_strike_ref = np.where(iv_strike_ref>2.0, iv_strike_ref/100.0, iv_strike_ref)

def get_iv_daily_atm():
    idx_atm = int(np.argmin(np.abs(strikes_ref - SPOT)))
    iva = float(iv_strike_ref[idx_atm]) if 'iv_strike_ref' in globals() else IV_ANNUAL
    if np.isnan(iva) or iva<=0 or iva>1.5:
        iva = IV_ANNUAL
    base = (iva if USE_IMPLIED_VOL else IV_ANNUAL)
    return base/np.sqrt(252)
step = float(np.median(np.diff(strikes_ref))) if len(strikes_ref)>1 else 1.0
atm_band = step*ATM_BAND_STEPS
def _class_call(k):
    if k < SPOT - atm_band: return 'ITM'
    if abs(k - SPOT) <= atm_band: return 'ATM'
    return 'OTM'
def _class_put(k):
    if k > SPOT + atm_band: return 'ITM'
    if abs(k - SPOT) <= atm_band: return 'ATM'
    return 'OTM'
labels_call = np.array([_class_call(float(k)) for k in strikes_ref])
labels_put  = np.array([_class_put(float(k))  for k in strikes_ref])
def _sum_by(labels, arr, key):
    m = labels==key
    return float(np.nansum(arr[m]))
pcr_itm = (_sum_by(labels_put, oi_put_ref, 'ITM') / max(_sum_by(labels_call, oi_call_ref, 'ITM'), 1e-9))
pcr_atm = (_sum_by(labels_put, oi_put_ref, 'ATM') / max(_sum_by(labels_call, oi_call_ref, 'ATM'), 1e-9))
pcr_otm = (_sum_by(labels_put, oi_put_ref, 'OTM') / max(_sum_by(labels_call, oi_call_ref, 'OTM'), 1e-9))
def vega(S,K,T,r,sigma):
    if S<=0 or K<=0 or T<=0 or sigma<=0: return np.nan
    d1 = (np.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*np.sqrt(T))
    return S*norm.pdf(d1)*np.sqrt(T)
vega_ref = np.array([0 if np.isnan(vega(SPOT, float(k), T, RISK_FREE, float(s))) else vega(SPOT, float(k), T, RISK_FREE, float(s)) for k,s in zip(strikes_ref, iv_strike_ref)])
vex_tot = vega_ref*(oi_call_ref + oi_put_ref)
iv_skew = np.zeros_like(iv_strike_ref)
if len(strikes_ref) >= 3:
    for i in range(1, len(strikes_ref)-1):
        iv_skew[i] = (iv_strike_ref[i+1] - iv_strike_ref[i-1])/(strikes_ref[i+1]-strikes_ref[i-1])
    iv_skew[0] = (iv_strike_ref[1] - iv_strike_ref[0])/(strikes_ref[1]-strikes_ref[0])
    iv_skew[-1] = (iv_strike_ref[-1] - iv_strike_ref[-2])/(strikes_ref[-1]-strikes_ref[-2])
def theta(S,K,T,r,sigma,t):
    if S<=0 or K<=0 or T<=0 or sigma<=0: return np.nan
    d1 = (np.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*np.sqrt(T))
    d2 = d1 - sigma*np.sqrt(T)
    term = -(S*norm.pdf(d1)*sigma)/(2*np.sqrt(T))
    if t=='C':
        return term - r*K*np.exp(-r*T)*norm.cdf(d2)
    else:
        return term + r*K*np.exp(-r*T)*norm.cdf(-d2)
thetaC_ref = np.array([0 if np.isnan(theta(SPOT, float(k), T, RISK_FREE, float(s), 'C')) else theta(SPOT, float(k), T, RISK_FREE, float(s), 'C') for k,s in zip(strikes_ref, iv_strike_ref)])
thetaP_ref = np.array([0 if np.isnan(theta(SPOT, float(k), T, RISK_FREE, float(s), 'P')) else theta(SPOT, float(k), T, RISK_FREE, float(s), 'P') for k,s in zip(strikes_ref, iv_strike_ref)])
theta_daily_C = thetaC_ref/252.0
theta_daily_P = thetaP_ref/252.0
theta_tot = theta_daily_C*oi_call_ref + theta_daily_P*oi_put_ref


# CELL 8
def greeks(S, K, T, r, sigma, t):
    # Versão Otimizada (Vetorizada)
    S = np.asarray(S, dtype=float)
    K = np.asarray(K, dtype=float)
    T = float(T)
    sigma = float(sigma)
    with np.errstate(divide='ignore', invalid='ignore'):
        d1 = (np.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*np.sqrt(T))
    if t=='C':
        delta = norm.cdf(d1)
    else:
        delta = norm.cdf(d1) - 1.0
    gamma = norm.pdf(d1) / (S*sigma*np.sqrt(T))
    return delta, gamma

# --- CÁLCULO VETORIZADO (SPEEDUP ~200x) ---
dC, gC = greeks(SPOT, strikes_ref, T, RISK_FREE, IV_ANNUAL, 'C')
dP, gP = greeks(SPOT, strikes_ref, T, RISK_FREE, IV_ANNUAL, 'P')
dC, gC = np.nan_to_num(dC), np.nan_to_num(gC)
dP, gP = np.nan_to_num(dP), np.nan_to_num(gP)

dT = 1/252
dsigma = 0.01

# Charm (Vetorizado)
dTp_C, _ = greeks(SPOT, strikes_ref, max(T + dT, 1e-6), RISK_FREE, IV_ANNUAL, 'C')
dTm_C, _ = greeks(SPOT, strikes_ref, max(T - dT, 1e-6), RISK_FREE, IV_ANNUAL, 'C')
chC = (np.nan_to_num(dTp_C) - np.nan_to_num(dTm_C)) / (2*dT)

dTp_P, _ = greeks(SPOT, strikes_ref, max(T + dT, 1e-6), RISK_FREE, IV_ANNUAL, 'P')
dTm_P, _ = greeks(SPOT, strikes_ref, max(T - dT, 1e-6), RISK_FREE, IV_ANNUAL, 'P')
chP = (np.nan_to_num(dTp_P) - np.nan_to_num(dTm_P)) / (2*dT)

# Vanna (Vetorizado)
dSp_C, _ = greeks(SPOT, strikes_ref, T, RISK_FREE, IV_ANNUAL + dsigma, 'C')
dSm_C, _ = greeks(SPOT, strikes_ref, T, RISK_FREE, max(IV_ANNUAL - dsigma, 1e-6), 'C')
vaC = (np.nan_to_num(dSp_C) - np.nan_to_num(dSm_C)) / (2*dsigma)

dSp_P, _ = greeks(SPOT, strikes_ref, T, RISK_FREE, IV_ANNUAL + dsigma, 'P')
dSm_P, _ = greeks(SPOT, strikes_ref, T, RISK_FREE, max(IV_ANNUAL - dsigma, 1e-6), 'P')
vaP = (np.nan_to_num(dSp_P) - np.nan_to_num(dSm_P)) / (2*dsigma)

# Garante Arrays
chC, chP, vaC, vaP = map(np.array, (chC, chP, vaC, vaP))
gex_tot  = gC*oi_call_ref*CONTRACT_MULT*SPOT*0.01 + gP*oi_put_ref*CONTRACT_MULT*SPOT*0.01
gex_cum  = np.cumsum(gex_tot)
# Base assinada para cálculo de flips: sinal por moneyness
sgn_call = np.where(strikes_ref <= SPOT, +1.0, -1.0)
sgn_put  = np.where(strikes_ref >= SPOT, -1.0, +1.0)
gex_flip_base = (gC*oi_call_ref*sgn_call + gP*oi_put_ref*sgn_put) * CONTRACT_MULT * SPOT * 0.01
gex_cum_signed = np.cumsum(gex_flip_base)
# PVOP alternativo (valor por ponto/prêmio) — se não definido, usa o peso atual como padrão
PVOP = float(PVOP) if 'PVOP' in globals() else float(CONTRACT_MULT)*float(SPOT)*0.01
gex_flip_base_pvop = (gC*oi_call_ref*sgn_call + gP*oi_put_ref*sgn_put) * PVOP
gex_cum_signed_pvop = np.cumsum(gex_flip_base_pvop)
ivw = iv_strike_ref if 'iv_strike_ref' in globals() else np.ones_like(strikes_ref, dtype=float)
gex_oi = gC*oi_call_ref + gP*oi_put_ref
gex_vol = gex_oi * ivw
gex_oi_cum = np.cumsum(gex_oi)
gex_vol_cum = np.cumsum(gex_vol)
r_gamma = gex_flip_base_pvop
dexp_tot = dC*oi_call_ref + dP*oi_put_ref
dexp_cum = np.cumsum(dexp_tot)
charm_tot = chC*oi_call_ref + chP*oi_put_ref
vanna_tot = vaC*oi_call_ref + vaP*oi_put_ref
charm_cum = np.cumsum(charm_tot)
vanna_cum = np.cumsum(vanna_tot)
def _norm(a):
    m = float(np.nanmax(np.abs(a))) if np.nanmax(np.abs(a))>0 else 1.0
    return a/m
dpi_arr = (DPI_WEIGHTS['delta']*_norm(dexp_tot) + DPI_WEIGHTS['gamma']*_norm(gex_tot) + DPI_WEIGHTS['charm']*_norm(charm_tot) + DPI_WEIGHTS['vanna']*_norm(vanna_tot))
i_spot = int(np.argmin(np.abs(strikes_ref - SPOT)))
i0 = max(0, i_spot - DPI_WINDOW_STRIKES)
i1 = min(len(strikes_ref)-1, i_spot + DPI_WINDOW_STRIKES)
dealer_pressure_spot = float(np.nanmean(dpi_arr[i0:i1+1]))
try:
    gamma_flip = strikes_ref[np.where(gex_cum_signed>=0)[0][0]]
except Exception:
    gamma_flip = None
regime = 'Gamma Positivo' if (gamma_flip is not None and SPOT>=gamma_flip) else 'Gamma Negativo'
regime_color = 'lime' if 'Positivo' in regime else 'red'
delta_agregado_val = float(np.nansum(dexp_tot))

# --- Delta Flip Calculation (Nova Implementação) ---
delta_flip = None
try:
    # Simula spot +/- 15% para encontrar cruzamento do Delta Agregado
    s_sim_range = np.linspace(SPOT*0.85, SPOT*1.15, 100)
    net_deltas = []
    # Loop Otimizado (Semi-Vetorizado)
    for s_sim in s_sim_range:
        # Vetorização interna dos strikes
        d_c_arr, _ = greeks(s_sim, strikes_ref, T, RISK_FREE, iv_strike_ref, 'C')
        d_p_arr, _ = greeks(s_sim, strikes_ref, T, RISK_FREE, iv_strike_ref, 'P')
        d_c_arr = np.nan_to_num(d_c_arr)
        d_p_arr = np.nan_to_num(d_p_arr)
        net = np.sum(d_c_arr*oi_call_ref + d_p_arr*oi_put_ref)
        net_deltas.append(net)
    
    net_deltas = np.array(net_deltas)
    # Encontra onde cruza zero
    idx_cross = np.where(np.diff(np.sign(net_deltas)))[0]
    if len(idx_cross) > 0:
        # Interpolação linear
        i = idx_cross[0]
        y1, y2 = net_deltas[i], net_deltas[i+1]
        x1, x2 = s_sim_range[i], s_sim_range[i+1]
        if y2 != y1:
            delta_flip = x1 - y1 * (x2 - x1) / (y2 - y1)
        else:
            delta_flip = x1
    else:
        delta_flip = None
except Exception as e:
    delta_flip = None
# ---------------------------------------------------

# ---------------------------------------------------
iv_atm = float(iv_strike_ref[int(np.argmin(np.abs(strikes_ref - SPOT)))]) if 'iv_strike_ref' in globals() else IV_ANNUAL
iv_atm = (IV_ANNUAL if np.isnan(iv_atm) else iv_atm)
IV_DAILY = get_iv_daily_atm()
range_low, range_high = SPOT*(1 - IV_DAILY), SPOT*(1 + IV_DAILY)
dist_call = float(np.min(np.abs(strikes_ref - SPOT)))
if 'CALL' in options['OptionType'].unique():
    idx_call = np.argsort(oi_call_ref)[-1:]
    if len(idx_call)>0: dist_call = float(np.min(np.abs(strikes_ref[idx_call] - SPOT)))
dist_put = float(np.min(np.abs(strikes_ref - SPOT)))
if 'PUT' in options['OptionType'].unique():
    idx_put = np.argsort(oi_put_ref)[-1:]
    if len(idx_put)>0: dist_put = float(np.min(np.abs(strikes_ref[idx_put] - SPOT)))
dist_wall_min = max(min(dist_call, dist_put), 1e-9)
range_wall_ratio = float((range_high - range_low)/dist_wall_min)
# Calcula Gamma Flip (HVL) neste bloco para evitar NameError na Info
gamma_flip_hvl = None
if USE_HVL_FLIP:
    try:
        HVL_DAILY = float(HVL_ANNUAL)/np.sqrt(252)
        step = float(np.median(np.diff(strikes_ref))) if len(strikes_ref)>1 else 25.0
        sigma_pts = float(SIGMA_FACTOR) * max(step*2.0, float(SPOT)*float(HVL_DAILY))
        order = np.argsort(np.array(strikes_ref, dtype=float))
        ks = np.array(strikes_ref, dtype=float)[order]
        gex = np.array(gex_tot, dtype=float)[order]
        w = np.exp(-((ks - float(SPOT))**2) / (2.0 * (sigma_pts**2)))
        gex_cum_hvl = np.cumsum(gex * w)
        sg_h = np.sign(gex_cum_hvl)
        idx_h = np.where(np.diff(sg_h)!=0)[0]
        if len(idx_h)>0:
            j = int(np.argmin(np.abs(ks[idx_h] - float(SPOT))))
            i = idx_h[j]
            y1, y2 = gex_cum_hvl[i], gex_cum_hvl[i+1]
            x1, x2 = ks[i], ks[i+1]
            gamma_flip_hvl = float(x1 if y2==y1 else x1 - y1*(x2 - x1)/(y2 - y1))
        else:
            gamma_flip_hvl = float(ks[int(np.argmin(np.abs(gex_cum_hvl)))])
    except Exception:
        gamma_flip_hvl = None
# Gamma Flip (HVL janela local) calculado antes de construir labels para evitar NameError
gamma_flip_hvl_win = None
if USE_HVL_FLIP:
    try:
        HVL_DAILY = float(HVL_ANNUAL)/np.sqrt(252)
        step = float(np.median(np.diff(strikes_ref))) if len(strikes_ref)>1 else 25.0
        W = float(SIGMA_FACTOR) * max(step*2.0, float(SPOT)*float(HVL_DAILY))
        order = np.argsort(np.array(strikes_ref, dtype=float))
        ks_all = np.array(strikes_ref, dtype=float)[order]
        gex_all = np.array(gex_tot, dtype=float)[order]
        mask = (ks_all >= float(SPOT) - W) & (ks_all <= float(SPOT) + W)
        ks = ks_all[mask]
        gex = gex_all[mask]
        if len(ks) >= 2:
            gex_cum_w = np.cumsum(gex)
            sgw = np.sign(gex_cum_w)
            idxw = np.where(np.diff(sgw)!=0)[0]
            if len(idxw)>0:
                j = int(np.argmin(np.abs(ks[idxw] - float(SPOT))))
                i = idxw[j]
                y1, y2 = gex_cum_w[i], gex_cum_w[i+1]
                x1, x2 = ks[i], ks[i+1]
                gamma_flip_hvl_win = float(x1 if y2==y1 else x1 - y1*(x2 - x1)/(y2 - y1))
            else:
                gamma_flip_hvl_win = float(ks[int(np.argmin(np.abs(gex_cum_w)))])
        else:
            gamma_flip_hvl_win = None
    except Exception:
        gamma_flip_hvl_win = None

# --- IMPLEMENTAÇÃO DE MARKET MAKER HEDGE & TEORIA DE OPÇÕES ---
# 1. Max Pain: Ponto de menor pagamento total para compradores de opções
def calculate_max_pain(strikes, oi_call, oi_put):
    loss = []
    strikes = np.asarray(strikes)
    oi_call = np.asarray(oi_call)
    oi_put = np.asarray(oi_put)
    for k_exp in strikes:
        # Valor intrínseco agregado
        val_calls = np.maximum(0, k_exp - strikes) * oi_call
        val_puts = np.maximum(0, strikes - k_exp) * oi_put
        loss.append(np.sum(val_calls + val_puts))
    return strikes[np.argmin(loss)]

try:
    max_pain = calculate_max_pain(strikes_ref, oi_call_ref, oi_put_ref)
except Exception:
    max_pain = SPOT

# 2. Call/Put Walls: Identificação de barreiras baseadas em Gamma Exposure
try:
    # Call Wall: Maior GEX positivo vindo de Calls (Resistência)
    # Put Wall: Maior GEX positivo vindo de Puts (Suporte) - Note que GEX de Put é negativo, mas aqui olhamos magnitude de exposição
    # Ajuste: Usamos Open Interest * Gamma para identificar onde o MM tem maior risco de Gamma
    idx_call_wall = np.argmax(gC * oi_call_ref)
    call_wall = strikes_ref[idx_call_wall]
    
    # Para Puts, o Gamma é positivo para Long Put, mas MM geralmente é Short Put (Gamma Negativo).
    # O 'Muro' é onde há maior concentração. Usamos o pico de OI de Puts ponderado pelo Gamma.
    idx_put_wall = np.argmax(gP * oi_put_ref)
    put_wall = strikes_ref[idx_put_wall]
except Exception:
    call_wall = SPOT
    put_wall = SPOT

# 3. Refinamento do Zero Gamma (Interpolação Linear para precisão de reversão)
zero_gamma_level = None
try:
    # Encontra onde cruza zero no acumulado assinado
    idx_cross = np.where(np.diff(np.sign(gex_cum_signed)))[0]
    if len(idx_cross) > 0:
        i = idx_cross[0]
        y1, y2 = gex_cum_signed[i], gex_cum_signed[i+1]
        x1, x2 = strikes_ref[i], strikes_ref[i+1]
        if y2 != y1:
            zero_gamma_level = x1 - y1 * (x2 - x1) / (y2 - y1)
        else:
            zero_gamma_level = x1
    else:
        zero_gamma_level = gamma_flip # Fallback para versão anterior
except Exception:
    zero_gamma_level = gamma_flip

info = (f"<b>USD/BRL Spot:</b> <span style='color:lime'>{SPOT:.0f}</span><br>"
        f"<b>Delta Agregado:</b> {delta_agregado_val:,.0f}<br>"
        f"<b>Zero Gamma (Flip):</b> {(f'{zero_gamma_level:.0f}' if zero_gamma_level else 'N/A')}<br>"
        f"<b>Max Pain:</b> <span style='color:orange'>{max_pain:.0f}</span><br>"
        f"<b>Call Wall (Resist.):</b> <span style='color:red'>{call_wall:.0f}</span><br>"
        f"<b>Put Wall (Sup.):</b> <span style='color:green'>{put_wall:.0f}</span><br>"
        f"<b>Regime:</b> <span style='color:{regime_color}'>{regime}</span><br>"
        f"<b>Vol Diária:</b> <span style='color:yellow'>{IV_DAILY*100:.2f}%</span><br>"
        f"<b>Dealer Pressure:</b> {dealer_pressure_spot:+.2f}<br>"
        f"<b>Range/Distância Walls:</b> {range_wall_ratio:.2f}")


# CELL 9
fig = go.Figure()
fig.add_trace(go.Bar(x=strikes_ref, y=dexp_tot, name='Delta Agregado', marker_color=['lime' if v>=0 else 'red' for v in dexp_tot], visible=True))
fig.add_trace(go.Scatter(x=strikes_ref, y=dexp_cum, mode='lines', name='Delta Acumulado', visible=False, line=dict(width=3, color='yellow')))
fig.add_trace(go.Bar(x=strikes_ref, y=gex_tot, name='Gamma Exposure', marker_color='cyan', opacity=0.6, visible=False))
fig.add_trace(go.Scatter(x=strikes_ref, y=gex_cum, mode='lines', name='Curvatura do Gamma (acumulado)', line=dict(color='orange', width=3), visible=False))
fig.add_trace(go.Bar(x=strikes_ref, y=oi_call_ref, name='CALL OI', marker_color='green', visible=False))
fig.add_trace(go.Bar(x=strikes_ref, y=-oi_put_ref, name='PUT OI', marker_color='red', visible=False))
fig.add_trace(go.Bar(x=midwalls_strikes, y=midwalls_call, marker_color='#2c2c2c', opacity=0.8, visible=False, showlegend=False))
fig.add_trace(go.Bar(x=midwalls_strikes, y=-midwalls_put, marker_color='#2c2c2c', opacity=0.8, visible=False, showlegend=False))
fig.add_trace(go.Bar(x=strikes_ref, y=charm_tot, name='Charm Exposure', marker_color='magenta', opacity=0.6, visible=False))
fig.add_trace(go.Bar(x=strikes_ref, y=vanna_tot, name='Vanna Exposure', marker_color='purple', opacity=0.6, visible=False))
fig.add_trace(go.Scatter(x=strikes_ref, y=charm_cum, mode='lines', name='Charm Acumulado', line=dict(color='magenta', width=3), visible=False))
fig.add_trace(go.Scatter(x=strikes_ref, y=vanna_cum, mode='lines', name='Vanna Acumulado', line=dict(color='purple', width=3), visible=False))
fig.add_trace(go.Bar(x=strikes_ref, y=vex_tot, name='Vega Exposure', marker_color='gold', opacity=0.6, visible=False))
fig.add_trace(go.Scatter(x=strikes_ref, y=iv_skew, mode='lines', name='Skew IV (local)', line=dict(color='white', width=2, dash='dot'), visible=False))
fig.add_trace(go.Scatter(x=strikes_ref, y=dpi_arr, mode='lines', name='Dealer Pressure', line=dict(color='#9ca3af', width=3), visible=False))
fig.update_layout(template='plotly_dark', barmode='overlay', xaxis_title='Strike', yaxis_title='Exposição / OI', xaxis=dict(range=[SPOT-300, SPOT+300], tickmode='auto'), legend=dict(orientation='h', yanchor='top', y=-0.15, xanchor='center', x=0.5), margin=dict(t=100))
spot_line = dict(type='line', x0=SPOT, x1=SPOT, y0=0, y1=1, xref='x', yref='paper', line=dict(color='lime', dash='dot', width=2))
hline0   = dict(type='line', x0=min_k, x1=max_k, y0=0, y1=0, line=dict(color='white', dash='dot', width=1))
flip_line = None
flip_label = None
spot_label = dict(x=float(SPOT), y=0.92, xref='x', yref='paper', text=f'SPOT {SPOT:.0f}', showarrow=False, font=dict(color='lime', size=12), bgcolor='black', bordercolor='lime')
edi_badge = dict(x=1.02, y=1.18, xref='paper', yref='paper', showarrow=False, text='EDI', align='right', font=dict(color='#e5e7eb', size=12), bgcolor='rgba(30,30,30,0.85)', bordercolor='#444', borderwidth=1, borderpad=4)
if gamma_flip is not None:
    flip_line = dict(type='line', x0=gamma_flip, x1=gamma_flip, y0=0, y1=1, xref='x', yref='paper', line=dict(color='red', dash='dash', width=2))
    flip_label = dict(x=gamma_flip, y=0.05, xref='x', yref='paper', text='Gamma Flip', showarrow=False, font=dict(color='red', size=12), bgcolor='black', bordercolor='red')
def infobox():
    return dict(xref='paper', yref='paper', x=0.99, y=0.95, xanchor='right', showarrow=False, align='left', text=info, font=dict(size=14, color='white'), bordercolor=regime_color, borderwidth=2, borderpad=6, bgcolor='rgba(20,20,20,0.85)', opacity=0.95)

# Calculate smart range for Vanna
v_indices = np.where(np.abs(vanna_tot) > np.max(np.abs(vanna_tot)) * 0.01)[0]
if len(v_indices) > 0:
    v_min_k = strikes_ref[v_indices[0]]
    v_max_k = strikes_ref[v_indices[-1]]
    v_pad = (v_max_k - v_min_k) * 0.1
    vanna_range = [v_min_k - v_pad, v_max_k + v_pad]
else:
    vanna_range = [min_k, max_k]

buttons = [
    dict(label='Delta Agregado', method='update', args=[{'visible':[True, False, False, False, False, False, False, False, False, False, False, False, False, False, False]}, {'title':'USD/BRL — Delta Agregado por Strike', 'shapes':[spot_line, hline0], 'annotations':[infobox(), spot_label]}]),
    dict(label='Delta Acumulado', method='update', args=[{'visible':[False, True, False, False, False, False, False, False, False, False, False, False, False, False, False]}, {'title':'USD/BRL — Delta Acumulado por Strike', 'shapes':[spot_line, hline0], 'annotations':[infobox(), spot_label]}]),
    dict(label='Gamma Exposure', method='update', args=[{'visible':[False, False, True, True, False, False, False, False, False, False, False, False, False, False, False]}, {'title':'USD/BRL — Gamma Exposure (total + curvatura)', 'shapes':[spot_line, hline0] + ([flip_line] if flip_line else []), 'annotations':([infobox(), spot_label, flip_label] if flip_label else [infobox(), spot_label])}]),
    dict(label='EDI &#8212; Open Interest &#8212; Open Interest por Strike', method='update', args=[{'visible':[False, False, False, False, True, True, True, True, False, False, False, False, False, False, False]}, {'title':'EDI &#8212; Open Interest &#8212; Open Interest (OI) por Strike', 'shapes':[spot_line, hline0] + ([flip_line] if flip_line else []), 'annotations':([infobox(), spot_label, flip_label] if flip_label else [infobox(), spot_label])}]),
    dict(label='Charm Exposure', method='update', args=[{'visible':[False, False, False, False, False, False, False, False, True, False, False, False, False, False, False]}, {'title':'USD/BRL — Charm Exposure por Strike', 'shapes':[spot_line, hline0], 'annotations':[infobox(), spot_label]}]),
    dict(label='Vanna Exposure', method='update', args=[{'visible':[False, False, False, False, False, False, False, False, False, True, False, False, False, False, False]}, {'title':'USD/BRL — Vanna Exposure por Strike', 'shapes':[spot_line, hline0], 'annotations':[infobox(), spot_label], 'xaxis.range': vanna_range}]),
    dict(label='Charm Acumulado', method='update', args=[{'visible':[False, False, False, False, False, False, False, False, False, False, True, False, False, False, False]}, {'title':'USD/BRL — Charm Acumulado', 'shapes':[spot_line, hline0], 'annotations':[infobox(), spot_label]}]),
    dict(label='Vanna Acumulado', method='update', args=[{'visible':[False, False, False, False, False, False, False, False, False, False, False, True, False, False, False]}, {'title':'USD/BRL — Vanna Acumulado', 'shapes':[spot_line, hline0], 'annotations':[infobox(), spot_label]}]),
    dict(label='Vega Exposure', method='update', args=[{'visible':[False, False, False, False, False, False, False, False, False, False, False, False, True, False, False]}, {'title':'USD/BRL — Vega Exposure por Strike', 'shapes':[spot_line, hline0], 'annotations':[infobox(), spot_label]}]),
    dict(label='Skew IV (local)', method='update', args=[{'visible':[False, False, False, False, False, False, False, False, False, False, False, False, False, True, False]}, {'title':'USD/BRL — Skew IV (local)', 'shapes':[spot_line, hline0], 'annotations':[infobox(), spot_label]}]),
    dict(label='Dealer Pressure', method='update', args=[{'visible':[False, False, False, False, False, False, False, False, False, False, False, False, False, False, True]}, {'title':'USD/BRL — Dealer Pressure (normalizado)', 'shapes':[spot_line, hline0], 'annotations':[infobox(), spot_label]}]),
    dict(label='Visão Completa', method='relayout', args=[{'xaxis.range':[min_k - pad, max_k + pad]}])
]
fig.update_layout(updatemenus=[dict(direction='down', showactive=True, x=0.0, y=1.05, buttons=buttons)])
fig.show()


# CELL 10
top_n = 3
idx_call = np.argsort(oi_call_ref)[-top_n:]
idx_put  = np.argsort(oi_put_ref)[-top_n:]
call_walls = strikes_ref[idx_call]
put_walls  = strikes_ref[idx_put]
call_walls_oi = oi_call_ref[idx_call]
put_walls_oi  = oi_put_ref[idx_put]

iv_atm = float(iv_strike_ref[int(np.argmin(np.abs(strikes_ref - SPOT)))])
iv_atm = (IV_ANNUAL if np.isnan(iv_atm) else iv_atm)
IV_DAILY = get_iv_daily_atm()
range_low, range_high = SPOT*(1 - IV_DAILY), SPOT*(1 + IV_DAILY)
range_lines = [
    dict(type='line', x0=float(range_low),  x1=float(range_low),  y0=0, y1=1, xref='x', yref='paper',
         line=dict(color='yellow', dash='dot', width=1)),
    dict(type='line', x0=float(range_high), x1=float(range_high), y0=0, y1=1, xref='x', yref='paper',
         line=dict(color='yellow', dash='dot', width=1)),
]

sg = np.sign(gex_cum)
idx = np.where(np.diff(sg)!=0)[0]
zero_gamma = None
if len(idx)>0:
    i = idx[0]
    y1, y2 = gex_cum[i], gex_cum[i+1]
    x1, x2 = strikes_ref[i], strikes_ref[i+1]
    zero_gamma = x1 - y1*(x2 - x1)/(y2 - y1) if y2!=y1 else x1

gamma_flip = zero_gamma if zero_gamma is not None else (strikes_ref[np.where(gex_cum_signed>=0)[0][0]] if np.any(gex_cum_signed>=0) else None)

call_top = sorted(list(zip(call_walls, call_walls_oi)), key=lambda x: x[1], reverse=True)
put_top  = sorted(list(zip(put_walls,  put_walls_oi)),  key=lambda x: x[1], reverse=True)
walls_call_txt = ' | '.join([f"{k:.0f}({v:,.0f})" for k,v in call_top])
walls_put_txt  = ' | '.join([f"{k:.0f}({v:,.0f})" for k,v in put_top])

regime = 'Gamma Positivo' if (gamma_flip is not None and SPOT>=gamma_flip) else 'Gamma Negativo'
regime_color = 'lime' if 'Positivo' in regime else 'red'
delta_agregado_val = float(np.nansum(dexp_tot))

info = (f"<b>DOLFUT:</b> <span style='color:lime'>{SPOT:.0f}</span><br>"
        f"<b>Delta Agregado:</b> {delta_agregado_val:,.0f}<br>"
        f"<b>Gamma Flip:</b> {(f'{gamma_flip:.0f}' if gamma_flip is not None else 'N/A')}<br>"
        f"<b>Regime:</b> <span style='color:{regime_color}'>{regime}</span><br>"
        f"<b>Vol Diária:</b> <span style='color:yellow'>{IV_DAILY*100:.2f}%</span><br>"
        f"<b>CALL walls:</b> {walls_call_txt}<br>"
        f"<b>PUT walls:</b> {walls_put_txt}")

fig2 = go.Figure()
fig2.add_trace(go.Bar(x=strikes_ref, y=dexp_tot, name='Delta Agregado',
                      marker_color=['lime' if v>=0 else 'red' for v in dexp_tot], visible=True))
fig2.add_trace(go.Scatter(x=strikes_ref, y=dexp_cum, mode='lines', name='Delta Acumulado',
                          visible=False, line=dict(width=3, color='yellow')))
fig2.add_trace(go.Bar(x=strikes_ref, y=gex_tot, name='Gamma Exposure', marker_color='cyan',
                      opacity=0.6, visible=False))
fig2.add_trace(go.Scatter(x=strikes_ref, y=gex_cum, mode='lines', name='Curvatura do Gamma (acumulado)',
                          line=dict(color='orange', width=3), visible=False))
fig2.add_trace(go.Bar(x=strikes_ref, y=oi_call_ref, name='CALL OI', marker_color='green', visible=False))
fig2.add_trace(go.Bar(x=strikes_ref, y=-oi_put_ref, name='PUT OI', marker_color='red', visible=False))
fig2.add_trace(go.Bar(x=midwalls_strikes, y=midwalls_call, marker_color='#2c2c2c', opacity=0.8,
                      visible=False, showlegend=False))
fig2.add_trace(go.Bar(x=midwalls_strikes, y=-midwalls_put, marker_color='#2c2c2c', opacity=0.8,
                      visible=False, showlegend=False))

fig2.update_layout(template='plotly_dark', barmode='overlay',
                   xaxis_title='Strike', yaxis_title='Contratos Abertos',
                   xaxis=dict(range=[SPOT-300, SPOT+300], tickmode='auto'),
                   legend=dict(orientation='h', yanchor='top', y=-0.15, xanchor='center', x=0.5),
                   margin=dict(t=100))

spot_line = dict(type='line', x0=float(SPOT), x1=float(SPOT), y0=0, y1=1, xref='x', yref='paper',
                 line=dict(color='lime', dash='dot', width=2))
hline0   = dict(type='line', x0=float(min_k), x1=float(max_k), y0=0, y1=0,
                line=dict(color='white', dash='dot', width=1))

flip_line = None
flip_label = None
spot_label = dict(x=float(SPOT), y=0.92, xref='x', yref='paper', text=f'SPOT {SPOT:.0f}', showarrow=False, font=dict(color='lime', size=12), bgcolor='black', bordercolor='lime')
if gamma_flip is not None:
    flip_line = dict(type='line', x0=float(gamma_flip), x1=float(gamma_flip), y0=0, y1=1,
                     xref='x', yref='paper', line=dict(color='red', dash='dash', width=2))
    flip_label = dict(x=float(gamma_flip), y=0.05, xref='x', yref='paper', text='Gamma Flip',
                      showarrow=False, font=dict(color='red', size=12),
                      bgcolor='black', bordercolor='red')

wall_lines = ([dict(type='line', x0=float(k), x1=float(k), y0=0, y1=1, xref='x', yref='paper',
                    line=dict(color='green', dash='dot', width=1)) for k in call_walls]
              + [dict(type='line', x0=float(k), x1=float(k), y0=0, y1=1, xref='x', yref='paper',
                      line=dict(color='red', dash='dot', width=1)) for k in put_walls])

def infobox2():
    return dict(xref='paper', yref='paper', x=0.99, y=0.95, xanchor='right', showarrow=False,
                align='left', text=info, font=dict(size=14, color='white'),
                bordercolor=regime_color, borderwidth=2, borderpad=6,
                bgcolor='rgba(20,20,20,0.85)', opacity=0.95)

buttons2 = [
    dict(label='Delta Agregado', method='update',
         args=[{'visible':[True, False, False, False, False, False, False, False]},
               {'title':'USD/BRL — Delta Agregado (nova célula)',
                'shapes':[spot_line, hline0] + range_lines,
                'annotations':[infobox2(), spot_label]}]),
    dict(label='Delta Acumulado', method='update',
         args=[{'visible':[False, True, False, False, False, False, False, False]},
               {'title':'USD/BRL — Delta Acumulado (nova célula)',
                'shapes':[spot_line, hline0] + range_lines,
                'annotations':[infobox2(), spot_label]}]),
    dict(label='Gamma Exposure', method='update',
         args=[{'visible':[False, False, True, True, False, False, False, False]},
               {'title':'Edi - Dólar "Análise de Open Interest"',
                'shapes':[spot_line, hline0] + range_lines + ([flip_line] if flip_line else []),
                'annotations':([infobox2(), spot_label, flip_label] if flip_label else [infobox2(), spot_label])}]),
    dict(label='Open Interest por Strike', method='update',
         args=[{'visible':[False, False, False, False, True, True, True, True]},
               {'title':'USD/BRL — OI por Strike (nova célula)',
                'shapes':[spot_line, hline0] + range_lines + (wall_lines if wall_lines else []),
                'annotations':[infobox2(), spot_label]}]),
    dict(label='Visão Completa', method='relayout',
         args=[{'xaxis.range':[float(min_k) - pad, float(max_k) + pad]}]),
]

overlayButtons = [
    dict(label='Overlay: Range + Walls + ZeroGamma', method='relayout',
         args=[{'shapes':[spot_line, hline0] + range_lines
                          + (wall_lines if wall_lines else [])
                          + ([flip_line] if flip_line else [])}]),
    dict(label='Overlay: Range apenas', method='relayout',
         args=[{'shapes':[spot_line, hline0] + range_lines}]),
    dict(label='Overlay: Walls apenas', method='relayout',
         args=[{'shapes':[spot_line, hline0] + (wall_lines if wall_lines else [])}]),
    dict(label='Overlay: GammaFlip apenas', method='relayout',
         args=[{'shapes':[spot_line, hline0] + ([flip_line] if flip_line else [])}]),
    dict(label='Limpar overlays', method='relayout',
         args=[{'shapes':[spot_line, hline0]}]),
]
buttonsUnified = buttons2 + overlayButtons

BRAND_TITLE = 'EDI &#8212; Open Interest &#8212; Painel Delta & GEX'
fig2.update_layout(updatemenus=[
    dict(type='dropdown', direction='down', showactive=True, active=0, x=1.00, y=1.30, buttons=buttonsUnified, bgcolor='rgba(30,30,30,0.95)', bordercolor='#444', borderwidth=1, font=dict(color='#e5e7eb', size=12), pad=dict(t=4, r=4, b=4, l=4))
], title=dict(text=BRAND_TITLE, font=dict(color='white', size=18), x=0.5))
fig2.show()
items = ['Spot','Range baixo','Range alto','Gamma Flip','Regime','CALL walls top','PUT walls top']
values = [f'{SPOT:.0f}', f'{range_low:.0f}', f'{range_high:.0f}', (f'{gamma_flip:.0f}' if gamma_flip is not None else 'N/A'), regime, walls_call_txt, walls_put_txt]
descs  = ['Preço à vista (pontos)', 'Limite inferior esperado intradiário', 'Limite superior esperado intradiário', 'Zero Gamma (Gamma Flip) interpolado', 'Sinal do Gamma acumulado no spot', 'Top-3 paredes de OI em CALL', 'Top-3 paredes de OI em PUT']
fig_vals = go.Figure(data=[go.Table(
    header=dict(values=['Item','Valor','Descrição'], fill_color='grey', align='left', font=dict(color='white', size=12)),
    cells=dict(values=[items, values, descs], fill_color='black', align='left', font=dict(color='white', size=12))
)])
fig_vals.update_layout(template='plotly_dark', margin=dict(t=30))
fig_vals.show()

# CELL 11
top_n = 3
idx_call = np.argsort(oi_call_ref)[-top_n:]
idx_put  = np.argsort(oi_put_ref)[-top_n:]
call_walls = strikes_ref[idx_call]
put_walls  = strikes_ref[idx_put]
call_walls_oi = oi_call_ref[idx_call]
put_walls_oi  = oi_put_ref[idx_put]

iv_atm = float(iv_strike_ref[int(np.argmin(np.abs(strikes_ref - SPOT)))])
iv_atm = (IV_ANNUAL if np.isnan(iv_atm) else iv_atm)
IV_DAILY = get_iv_daily_atm()
range_low, range_high = SPOT*(1 - IV_DAILY), SPOT*(1 + IV_DAILY)
range_lines = [
    dict(type='line', x0=float(range_low),  x1=float(range_low),  y0=0, y1=1, xref='x', yref='paper',
         line=dict(color='yellow', dash='dot', width=1)),
    dict(type='line', x0=float(range_high), x1=float(range_high), y0=0, y1=1, xref='x', yref='paper',
         line=dict(color='yellow', dash='dot', width=1)),
]


sg = np.sign(gex_cum_signed)
idx = np.where(np.diff(sg)!=0)[0]
zero_gamma = None
if len(idx)>0:
    zg_list = []
    for i in idx:
        y1, y2 = gex_cum_signed[i], gex_cum_signed[i+1]
        x1, x2 = strikes_ref[i], strikes_ref[i+1]
        xz = x1 - y1*(x2 - x1)/(y2 - y1) if y2!=y1 else x1
        zg_list.append(xz)
    zero_gamma = float(zg_list[int(np.argmin(np.abs(np.array(zg_list) - SPOT)))])

gamma_flip = zero_gamma if zero_gamma is not None else (float(strikes_ref[np.where(gex_cum_signed>=0)[0][0]]) if np.any(gex_cum_signed>=0) else None)
# HVL Gamma Flip: pondera exposições de gamma por distância ao spot usando HVL diária
gamma_flip_hvl = None
if USE_HVL_FLIP:
    try:
        HVL_DAILY = float(HVL_ANNUAL)/np.sqrt(252)
        sigma_pts = max(float(np.median(np.diff(strikes_ref))) * 2.0 if len(strikes_ref)>1 else 25.0, float(SPOT)*HVL_DAILY)
        order = np.argsort(np.array(strikes_ref, dtype=float))
        ks = np.array(strikes_ref, dtype=float)[order]
        gex = np.array(gex_tot, dtype=float)[order]
        w = np.exp(-((ks - float(SPOT))**2) / (2.0 * (sigma_pts**2)))
        gex_cum_hvl = np.cumsum(gex * w)
        sg_h = np.sign(gex_cum_hvl)
        idx_h = np.where(np.diff(sg_h)!=0)[0]
        if len(idx_h)>0:
            # escolhe o cruzamento mais próximo do spot e interpola
            j = int(np.argmin(np.abs(ks[idx_h] - float(SPOT))))
            i = idx_h[j]
            y1, y2 = gex_cum_hvl[i], gex_cum_hvl[i+1]
            x1, x2 = ks[i], ks[i+1]
            gamma_flip_hvl = float(x1 if y2==y1 else x1 - y1*(x2 - x1)/(y2 - y1))
        else:
            gamma_flip_hvl = float(ks[int(np.argmin(np.abs(gex_cum_hvl)))])
    except Exception:
        gamma_flip_hvl = None

# Gamma Flip (HVL log-moneyness) calculado antes de labels para evitar NameError
gamma_flip_hvl_log = None
if USE_HVL_FLIP:
    try:
        HVL_DAILY = float(HVL_ANNUAL)/np.sqrt(252)
        order = np.argsort(np.array(strikes_ref, dtype=float))
        ks = np.array(strikes_ref, dtype=float)[order]
        gex = np.array(gex_tot, dtype=float)[order]
        sigma_m = float(HVL_DAILY) * float(SIGMA_FACTOR)
        z = np.log(ks/float(SPOT))
        w = np.exp(-(z**2) / (2.0 * (sigma_m**2)))
        gex_cum_log = np.cumsum(gex * w)
        sg_l = np.sign(gex_cum_log)
        idx_l = np.where(np.diff(sg_l)!=0)[0]
        if len(idx_l)>0:
            j = int(np.argmin(np.abs(ks[idx_l] - float(SPOT))))
            i = idx_l[j]
            y1, y2 = gex_cum_log[i], gex_cum_log[i+1]
            x1, x2 = ks[i], ks[i+1]
            gamma_flip_hvl_log = float(x1 if y2==y1 else x1 - y1*(x2 - x1)/(y2 - y1))
        else:
            gamma_flip_hvl_log = float(ks[int(np.argmin(np.abs(gex_cum_log)))])
    except Exception:
        gamma_flip_hvl_log = None
call_top = sorted(list(zip(call_walls, call_walls_oi)), key=lambda x: x[1], reverse=True)
put_top  = sorted(list(zip(put_walls,  put_walls_oi)),  key=lambda x: x[1], reverse=True)
walls_call_txt = ' | '.join([f"{float(k):.0f}({float(v):,.0f})" for k,v in call_top])
walls_put_txt  = ' | '.join([f"{float(k):.0f}({float(v):,.0f})" for k,v in put_top])

call_near_idx = idx_call[int(np.argmin(np.abs(call_walls - SPOT)))]
put_near_idx  = idx_put[int(np.argmin(np.abs(put_walls  - SPOT)))]
nearest_call_txt = f"{float(strikes_ref[call_near_idx]):.0f} (dist {abs(float(strikes_ref[call_near_idx])-float(SPOT)):.0f})"
nearest_put_txt  = f"{float(strikes_ref[put_near_idx]):.0f} (dist {abs(float(strikes_ref[put_near_idx])-float(SPOT)):.0f})"

regime = 'Gamma Positivo' if (gamma_flip is not None and SPOT>=gamma_flip) else 'Gamma Negativo'
regime_color = 'lime' if 'Positivo' in regime else 'red'
delta_agregado_val = float(np.nansum(dexp_tot))
pcr = (float(np.nansum(oi_put_ref)) / float(np.nansum(oi_call_ref))) if float(np.nansum(oi_call_ref))>0 else np.nan

info = (f"<b>DOLFUT:</b> <span style='color:lime'>{SPOT:.0f}</span><br>"
        f"<b>Delta Agregado:</b> {delta_agregado_val:,.0f}<br>"
        f"<b>Gamma Flip:</b> {(f'{gamma_flip:.0f}' if gamma_flip is not None else 'N/A')}<br>"
        f"<b>Regime:</b> <span style='color:{regime_color}'>{regime}</span><br>"
        f"<b>Volatilidade Diária:</b> <span style='color:yellow'>{IV_DAILY*100:.2f}%</span><br>"
        f"<b>Put/Call Ratio:</b> {(f'{pcr:.2f}' if not np.isnan(pcr) else 'N/A')}<br>"
        f"<b>CALL walls:</b> {walls_call_txt}<br>"
        f"<b>PUT walls:</b> {walls_put_txt}<br>"
        f"<b>CALL wall próxima:</b> {nearest_call_txt}<br>"
        f"<b>PUT wall próxima:</b> {nearest_put_txt}")

fig3 = go.Figure()
fig3.add_trace(go.Bar(x=strikes_ref, y=dexp_tot, name='Delta Agregado',
                      marker_color=['lime' if v>=0 else 'red' for v in dexp_tot], visible=True,
                      text=[f'{float(k):.0f}' for k in strikes_ref], textposition='outside',
                      textfont=dict(size=11, color='white'), cliponaxis=False,
                      hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))
fig3.add_trace(go.Scatter(x=strikes_ref, y=dexp_cum, mode='lines', name='Delta Acumulado',
                          visible=False, line=dict(width=3, color='yellow')))
fig3.add_trace(go.Bar(x=strikes_ref, y=gex_tot, name='Gamma Exposure', marker_color='cyan',
                      opacity=0.6, visible=False, hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))
fig3.add_trace(go.Scatter(x=strikes_ref, y=gex_cum, mode='lines', name='Curvatura do Gamma (acumulado)',
                          line=dict(color='orange', width=3), visible=False, hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))
fig3.add_trace(go.Bar(x=strikes_ref, y=oi_call_ref, name='CALL OI', marker_color='lime', visible=False, text=[f'{float(k):.0f}' for k in strikes_ref], textposition='outside', textfont=dict(size=10, color='white'), cliponaxis=False, hovertemplate='Strike %{x:.0f}<br>OI %{y:.0f}'))
fig3.add_trace(go.Bar(x=strikes_ref, y=-oi_put_ref, name='PUT OI', marker_color='red', visible=False, text=[f'{float(k):.0f}' for k in strikes_ref], textposition='outside', textfont=dict(size=10, color='white'), cliponaxis=False, hovertemplate='Strike %{x:.0f}<br>OI %{y:.0f}'))
fig3.add_trace(go.Bar(x=midwalls_strikes, y=midwalls_call, marker_color='lime', opacity=0.2, visible=False, showlegend=False))
fig3.add_trace(go.Bar(x=midwalls_strikes, y=-midwalls_put, marker_color='red', opacity=0.2, visible=False, showlegend=False))
fig3.add_trace(go.Bar(x=strikes_ref, y=charm_tot, name='Charm Exposure', marker_color='magenta', opacity=0.6, visible=False, hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))
fig3.add_trace(go.Bar(x=strikes_ref, y=vanna_tot, name='Vanna Exposure', marker_color='purple', opacity=0.6, visible=False, hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))
fig3.add_trace(go.Bar(x=strikes_ref, y=gex_oi, name='Gamma Exposure (OI)', marker_color='cyan', opacity=0.6, visible=False, hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))
fig3.add_trace(go.Bar(x=strikes_ref, y=gex_vol, name='Gamma Exposure (IV)', marker_color='violet', opacity=0.6, visible=False, hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))
fig3.add_trace(go.Bar(x=strikes_ref, y=r_gamma, name='R Gamma (PVOP assinado)', marker_color='teal', opacity=0.6, visible=False, hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))
fig3.add_trace(go.Scatter(x=strikes_ref, y=gex_oi_cum, mode='lines', name='Curvatura do GEX OI (acumulado)', line=dict(color='yellow', width=2), visible=False, hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))
fig3.add_trace(go.Scatter(x=strikes_ref, y=gex_vol_cum, mode='lines', name='Curvatura do GEX VOL (acumulado)', line=dict(color='violet', width=2), visible=False, hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))

fig3.update_layout(template='plotly_dark', barmode='overlay',
                   xaxis_title='Strike', yaxis_title='Contratos Abertos',
                   xaxis=dict(range=[SPOT-300, SPOT+300], tickmode='auto'),
                   legend=dict(orientation='h', yanchor='top', y=-0.15, xanchor='center', x=0.5),
                   margin=dict(t=100))

spot_line = dict(type='line', x0=float(SPOT), x1=float(SPOT), y0=0, y1=1, xref='x', yref='paper',
                 line=dict(color='lime', dash='dot', width=2))
hline0   = dict(type='line', x0=float(min_k), x1=float(max_k), y0=0, y1=0,
                line=dict(color='white', dash='dot', width=1))

flip_line = None
flip_label = None
if gamma_flip is not None:
    flip_line = dict(type='line', x0=float(gamma_flip), x1=float(gamma_flip), y0=0, y1=1,
                     xref='x', yref='paper', line=dict(color='red', dash='dash', width=2))
    flip_label = dict(x=float(gamma_flip), y=0.05, xref='x', yref='paper', text='Gamma Flip',
                      showarrow=False, font=dict(color='red', size=12), bgcolor='black', bordercolor='red')

    flip_label_hvl_win = dict(x=float(gamma_flip_hvl_win), y=0.14, xref='x', yref='paper', text='Gamma Flip (HVL janela)',
                               showarrow=False, font=dict(color='magenta', size=12), bgcolor='black', bordercolor='magenta')

wall_lines = ([dict(type='line', x0=float(k), x1=float(k), y0=0, y1=1, xref='x', yref='paper',
                    line=dict(color='blue', dash='dot', width=1)) for k in call_walls]
              + [dict(type='line', x0=float(k), x1=float(k), y0=0, y1=1, xref='x', yref='paper',
                      line=dict(color='red', dash='dot', width=1)) for k in put_walls])

def infobox3():
    return dict(xref='paper', yref='paper', x=0.995, y=0.98, xanchor='right', showarrow=False,
                align='left', text=info, font=dict(size=15, color='white'),
                bordercolor='#2563eb', borderwidth=2, borderpad=10,
                bgcolor='rgba(20,20,20,0.88)', opacity=0.98)

range_low_label = dict(x=float(range_low), y=0.98, xref='x', yref='paper', text='Mínima Diária',
                       showarrow=False, font=dict(color='yellow', size=11), bgcolor='black')
range_high_label = dict(x=float(range_high), y=0.98, xref='x', yref='paper', text='Máxima Diária',
                        showarrow=False, font=dict(color='yellow', size=11), bgcolor='black')
mid_above_idx = np.where(midwalls_strikes >= SPOT)[0]
mid_below_idx = np.where(midwalls_strikes <  SPOT)[0]
mid_above = list(map(lambda x: f'{float(x):.0f}', list(midwalls_strikes[mid_above_idx][:3])))
mid_below = list(map(lambda x: f'{float(x):.0f}', list(midwalls_strikes[mid_below_idx][-3:])))
mid_above_txt = ' | '.join(mid_above) if len(mid_above)>0 else 'N/A'
mid_below_txt = ' | '.join(mid_below) if len(mid_below)>0 else 'N/A'

call_fence_lines = [dict(type='line', x0=float(k), x1=float(k), y0=0, y1=1, xref='x', yref='paper', line=dict(color='lime', dash='dot', width=1)) for k in call_walls]
put_fence_lines  = [dict(type='line', x0=float(k), x1=float(k), y0=0, y1=1, xref='x', yref='paper', line=dict(color='red',  dash='dot', width=1)) for k in put_walls]
midwall_lines_shapes = [dict(type='line', x0=float(k), x1=float(k), y0=0, y1=1, xref='x', yref='paper', line=dict(color='#6b7280', dash='dot', width=1)) for k in midwalls_strikes]
midwall_annos = [dict(x=float(k), y=0.92 - 0.04*(i%4), xref='x', yref='paper', text=f'{float(k):.0f}', showarrow=False, font=dict(color='#9ca3af', size=11), bgcolor='black') for i,k in enumerate(midwalls_strikes)]
fib_percs = [0.236, 0.382, 0.618, 0.7645]
fib_lines_shapes = []
fib_annos = []
for i in range(len(strikes_ref)-1):
    lower = float(strikes_ref[i]); upper = float(strikes_ref[i+1]); dist = upper - lower
    for j, p in enumerate(fib_percs):
        lvl = lower + p*dist
        fib_lines_shapes.append(dict(type='line', x0=lvl, x1=lvl, y0=0, y1=1, xref='x', yref='paper', line=dict(color='#374151', dash='dot', width=1)))
        fib_annos.append(dict(x=lvl, y=0.90 - 0.05*(j%4), xref='x', yref='paper', text=f'{lvl:.0f}', showarrow=False, font=dict(color='#d1d5db', size=10), bgcolor='black'))
shapes_strike_mid_fibo = [spot_line, hline0] + call_fence_lines + put_fence_lines + midwall_lines_shapes + fib_lines_shapes
annos_strike_mid_fibo  = [infobox3(), spot_label] + midwall_annos + fib_annos
buttonsMainNew = [
    dict(label='Delta Agregado', method='update',
         args=[{'visible':[True, False, False, False, False, False, False, False, False, False, False, False, False]},
               {'title':{'text':'EDI - Delta Agregado (Soma Delta das Opções)', 'font':{'color':'white','size':18}, 'x':0.5}, 'shapes':[spot_line, hline0] + range_lines, 'annotations':[spot_label, range_low_label, range_high_label]}]),
    dict(label='Delta Acumulado', method='update',
         args=[{'visible':[False, True, False, False, False, False, False, False, False, False, False, False, False]},
               {'title':{'text':'EDI - Delta Acumulado (Líquido)', 'font':{'color':'white','size':18}, 'x':0.5}, 'shapes':[spot_line, hline0] + range_lines, 'annotations':[spot_label, range_low_label, range_high_label]}]),
    dict(label='GEX', method='update',
         args=[{'visible':[False, False, True, True, False, False, False, False, False, False, False, False, False]},
               {'title':{'text':'EDI - Painel Delta & GEX', 'font':{'color':'white','size':18}, 'x':0.5},
                'shapes':[spot_line, hline0] + range_lines + ([flip_line] if flip_line else []),
                'annotations':[spot_label, range_low_label, range_high_label] + ([flip_label] if flip_label else []) + [edi_badge]}]),
    dict(label='GEX (OI)', method='update',
         args=[{'visible':[False, False, False, False, False, False, False, False, False, False, True, False, False, True, False]},
               {'title':{'text':'EDI - Painel Delta & GEX', 'font':{'color':'white','size':18}, 'x':0.5},
                'shapes':[spot_line, hline0] + range_lines + ([flip_line] if flip_line else []),
                'annotations':[spot_label, range_low_label, range_high_label] + ([flip_label] if flip_label else [])}]),
    dict(label='GEX (IV)', method='update',
         args=[{'visible':[False, False, False, False, False, False, False, False, False, False, False, True, False, False, True]},
               {'title':{'text':'EDI - Painel Delta & GEX', 'font':{'color':'white','size':18}, 'x':0.5},
                'shapes':[spot_line, hline0] + range_lines + ([flip_line] if flip_line else []),
                'annotations':[spot_label, range_low_label, range_high_label] + ([flip_label] if flip_label else [])}]),
    dict(label='R Gamma (PVOP)', method='update',
         args=[{'visible':[False, False, False, False, False, False, False, False, False, False, False, False, True]},
               {'title':{'text':'EDI - R Gamma (PVOP assinado)', 'font':{'color':'white','size':18}, 'x':0.5},
                'shapes':[spot_line, hline0] + range_lines + ([flip_line] if flip_line else []),
                'annotations':[infobox3(), spot_label, range_low_label, range_high_label] + ([flip_label] if flip_label else [])}]),
    dict(label='Open Interest por Strike', method='update',
         args=[{'visible':[False, False, False, False, True, True, True, True, False, False, False, False, False]},
               {'title':{'text':'EDI - Open Interest (OI) por Strike', 'font':{'color':'white','size':18}, 'x':0.5},
                'shapes':[spot_line, hline0] + range_lines + wall_lines + ([flip_line] if flip_line else []),
                'annotations':[spot_label, range_low_label, range_high_label] + ([flip_label] if flip_label else [])}]),
    dict(label='Charm Exposure', method='update',
         args=[{'visible':[False, False, False, False, False, False, False, False, True, False, False, False, False]},
               {'title':{'text':'EDI - Charm Exposure', 'font':{'color':'white','size':18}, 'x':0.5},
                'shapes':[spot_line, hline0] + range_lines,
                'annotations':[spot_label, range_low_label, range_high_label]}]),
    dict(label='Vanna Exposure', method='update',
         args=[{'visible':[False, False, False, False, False, False, False, False, False, True, False, False, False]},
               {'title':{'text':'EDI - Vanna Exposure', 'font':{'color':'white','size':18}, 'x':0.5},
                'shapes':[spot_line, hline0] + range_lines,
                'annotations':[spot_label, range_low_label, range_high_label]}]),
    dict(label='Visão Completa', method='relayout',
         args=[{'xaxis.range':[float(min_k) - pad, float(max_k) + pad]}]),
]
overlayButtonsNew = [
    dict(label='Strikes + Midwalls + Fibonacci', method='relayout',
         args=[{'title':{'text':'EDI - Painel Delta & GEX', 'font':{'color':'white','size':18}, 'x':0.5}, 'shapes': shapes_strike_mid_fibo, 'annotations': annos_strike_mid_fibo}]),
    dict(label='Range + Walls', method='relayout',
         args=[{'title':{'text':'EDI - Painel Delta & GEX', 'font':{'color':'white','size':18}, 'x':0.5}, 'shapes':[spot_line, hline0] + range_lines + wall_lines}]),
    dict(label='Range apenas', method='relayout',
         args=[{'title':{'text':'EDI - Painel Delta & GEX', 'font':{'color':'white','size':18}, 'x':0.5}, 'shapes':[spot_line, hline0] + range_lines}]),
    dict(label='Walls apenas', method='relayout',
         args=[{'title':{'text':'EDI - Painel Delta & GEX', 'font':{'color':'white','size':18}, 'x':0.5}, 'shapes':[spot_line, hline0] + wall_lines}]),
    # Removidos botões de Gamma Flip da Figura 3 — dedicados à Figura 4
    dict(label='Limpar overlays', method='relayout',
         args=[{'title':{'text':'EDI - Painel Delta & GEX', 'font':{'color':'white','size':18}, 'x':0.5}, 'shapes':[spot_line, hline0]}]),
]
buttonsUnified = buttonsMainNew + overlayButtonsNew

BRAND_TITLE = 'EDI - Painel Delta & GEX'
fig3.update_layout(
    updatemenus=[
        dict(type='dropdown', direction='down', showactive=True, active=0, x=1.00, y=1.25, xanchor='right', yanchor='top',
             buttons=buttonsUnified, bgcolor='rgba(30,30,30,0.95)', bordercolor='#444',
             borderwidth=1, font=dict(color='#e5e7eb', size=12), pad=dict(t=4, r=4, b=4, l=4)),
        dict(type='buttons', direction='right', showactive=True, x=0.1, y=1.25, xanchor='right', yanchor='top',
             buttons=[
                 dict(label='Info ON', method='relayout', args=[{'title':{'text':'EDI - Painel Delta & GEX', 'font':{'color':'white','size':18}, 'x':0.5}, 'annotations':[infobox3(), spot_label, range_low_label, range_high_label, edi_badge]}]),
                 dict(label='Info OFF', method='relayout', args=[{'title':{'text':'EDI - Painel Delta & GEX', 'font':{'color':'white','size':18}, 'x':0.5}, 'annotations':[spot_label, range_low_label, range_high_label, edi_badge]}])
             ], bgcolor='rgba(30,30,30,0.85)', bordercolor='#444', borderwidth=1,
             font=dict(color='#e5e7eb', size=11), pad=dict(t=2, r=2, b=2, l=2))
        ,
        dict(type='buttons', direction='right', showactive=True, x=0.3, y=1.25, xanchor='right', yanchor='top',
             buttons=[
                 dict(label='Modo Básico', method='relayout', args=[{'title':{'text':'EDI - Painel Delta & GEX', 'font':{'color':'white','size':18}, 'x':0.5}, 'shapes':[spot_line, hline0], 'annotations':[spot_label, edi_badge]}]),
                 dict(label='Modo Avançado', method='relayout', args=[{'title':{'text':'EDI - Painel Delta & GEX', 'font':{'color':'white','size':18}, 'x':0.5}, 'shapes':[spot_line, hline0] + range_lines, 'annotations':[spot_label, range_low_label, range_high_label, edi_badge]}])
             ], bgcolor='rgba(30,30,30,0.85)', bordercolor='#444', borderwidth=1,
             font=dict(color='#e5e7eb', size=11), pad=dict(t=2, r=2, b=2, l=2))
    ],
    sliders=[dict(active=1, currentvalue=dict(prefix='Strikes: ~'),
                  steps=[
                      dict(label='40', method='relayout', args=[{'title':{'text':'EDI - Painel Delta & GEX', 'font':{'color':'white','size':18}, 'x':0.5}, 'xaxis.range':[float(SPOT) - (np.median(np.diff(strikes_ref)) if len(strikes_ref)>1 else 25.0)*20, float(SPOT) + (np.median(np.diff(strikes_ref)) if len(strikes_ref)>1 else 25.0)*20]}]),
                      dict(label='60', method='relayout', args=[{'title':{'text':'EDI - Painel Delta & GEX', 'font':{'color':'white','size':18}, 'x':0.5}, 'xaxis.range':[float(SPOT) - (np.median(np.diff(strikes_ref)) if len(strikes_ref)>1 else 25.0)*30, float(SPOT) + (np.median(np.diff(strikes_ref)) if len(strikes_ref)>1 else 25.0)*30]}]),
                      dict(label='80', method='relayout', args=[{'title':{'text':'EDI - Painel Delta & GEX', 'font':{'color':'white','size':18}, 'x':0.5}, 'xaxis.range':[float(SPOT) - (np.median(np.diff(strikes_ref)) if len(strikes_ref)>1 else 25.0)*40, float(SPOT) + (np.median(np.diff(strikes_ref)) if len(strikes_ref)>1 else 25.0)*40]}])
                  ]
                 )],
    title=dict(text=BRAND_TITLE, font=dict(color='white', size=18), x=0.5),
    height=int(650),
    margin=dict(t=110)
)
fig3.show()

# Métricas adicionais inspiradas no painel
net_gex_oi = float(np.nansum(gex_oi))
net_gex_vol = float(np.nansum(gex_vol))
gex_oi_signed = gC*oi_call_ref*sgn_call + gP*oi_put_ref*sgn_put
gex_vol_signed = gex_oi_signed * ivw
major_pos_oi = float(strikes_ref[int(np.argmax(gex_oi_signed))]) if len(strikes_ref)>0 else None
major_neg_oi = float(strikes_ref[int(np.argmin(gex_oi_signed))]) if len(strikes_ref)>0 else None
major_pos_vol = float(strikes_ref[int(np.argmax(gex_vol_signed))]) if len(strikes_ref)>0 else None
major_neg_vol = float(strikes_ref[int(np.argmin(gex_vol_signed))]) if len(strikes_ref)>0 else None
long_gamma = float(np.nanmean(gex_flip_base[strikes_ref>=SPOT])) if np.any(strikes_ref>=SPOT) else None
short_gamma = float(np.nanmean(gex_flip_base[strikes_ref<=SPOT])) if np.any(strikes_ref<=SPOT) else None
items = ['Spot','Delta Agregado','Volatilidade Diária (%)','Linha amarela (range)','Range baixo','Range alto','Gamma Flip','Regime','Put/Call','CALL walls top','PUT walls top','CALL wall próxima','PUT wall próxima','Midwalls acima (3)','Midwalls abaixo (3)','Net GEX (OI)','Net GEX (VOL)','Major + (GEX OI)','Major − (GEX OI)','Major + (GEX VOL)','Major − (GEX VOL)','Long Gamma (>= spot)','Short Gamma (<= spot)']
values = [f'{SPOT:.0f}', f'{delta_agregado_val:,.0f}', f'{IV_DAILY*100:.2f}', f'{range_low:.0f}–{range_high:.0f}', f'{range_low:.0f}', f'{range_high:.0f}',
          (f'{gamma_flip:.0f}' if gamma_flip is not None else 'N/A'),
          regime, (f'{pcr:.2f}' if not np.isnan(pcr) else 'N/A'),
          walls_call_txt, walls_put_txt, nearest_call_txt, nearest_put_txt, mid_above_txt, mid_below_txt,
          f'{net_gex_oi:.4f}', f'{net_gex_vol:.4f}',
          (f'{major_pos_oi:.0f}' if not np.isnan(major_pos_oi) else 'N/A'),
          (f'{major_neg_oi:.0f}' if not np.isnan(major_neg_oi) else 'N/A'),
          (f'{major_pos_vol:.0f}' if not np.isnan(major_pos_vol) else 'N/A'),
          (f'{major_neg_vol:.0f}' if not np.isnan(major_neg_vol) else 'N/A'),
          (f'{long_gamma:.4f}' if not np.isnan(long_gamma) else 'N/A'),
          (f'{short_gamma:.4f}' if not np.isnan(short_gamma) else 'N/A')]
descs  = ['Preço à vista (pontos)', 'Soma líquida de Delta por strike (Δ*OI)', 'IV diária em % (ATM por strike)', 'Intervalo diário esperado (amarelo)', 'Limite inferior esperado intradiário', 'Limite superior esperado intradiário',
          'Zero Gamma (Gamma Flip) interpolado', 'Sinal do Gamma acumulado no spot', 'Put/Call Ratio agregado',
          'Top-3 paredes de OI em CALL', 'Top-3 paredes de OI em PUT', 'Strike de CALL mais próximo do spot',
          'Strike de PUT mais próximo do spot', '3 midpoints de strike acima do spot', '3 midpoints de strike abaixo do spot',
          'Soma líquida do GEX OI', 'Soma líquida do GEX VOL', 'Strike com maior GEX OI (assinado)', 'Strike com menor GEX OI (assinado)',
          'Strike com maior GEX VOL (assinado)', 'Strike com menor GEX VOL (assinado)',
          'Média de gamma assinado acima do spot', 'Média de gamma assinado abaixo do spot']
fig_vals3 = go.Figure(data=[go.Table(
    header=dict(values=['Item','Valor','Descrição'], fill_color='grey', align='left', height=32, font=dict(color='white', size=13)),
    cells=dict(values=[items, values, descs], fill_color='black', align='left', height=26, font=dict(color='white', size=12))
)])
fig_vals3.update_layout(template='plotly_dark', margin=dict(t=30,b=30), height=700)
fig_vals3.show()

# CELL 12
# --- SETUP: EXTRAÇÃO DE SUB-FIGURAS DA FIGURA 3 ---
# Este bloco prepara os dados para exibir cada gráfico do menu lateral individualmente.

if 'fig3' in globals():
    # Mapear traces da fig3 original para reutilizar
    f3_data = fig3.data
    
    # Shapes comuns
    common_shapes = [spot_line, hline0]
    if 'range_lines' in globals(): common_shapes += range_lines
    if 'flip_line' in globals() and flip_line: common_shapes.append(flip_line)
    
    # Annotations comuns
    common_annos = [spot_label]
    if 'range_low_label' in globals(): common_annos.append(range_low_label)
    if 'range_high_label' in globals(): common_annos.append(range_high_label)
    if 'flip_label' in globals() and flip_label: common_annos.append(flip_label)
    
    # Trace invisível para definir range do eixo X em gráficos de overlay
    dummy_trace = go.Scatter(x=strikes_ref, y=np.zeros_like(strikes_ref), mode='markers', marker=dict(opacity=0), showlegend=False, hoverinfo='skip')


# CELL 13
# --- GRÁFICO: Delta Agregado ---
# Soma do Delta de todas as opções por strike.
try:
    if 'fig3' in globals():
        traces = []
        idxs = [0]
        for i in idxs:
            if i < len(f3_data):
                import copy
                t = copy.deepcopy(f3_data[i])
                t.visible = True
                traces.append(t)
        
        if traces:
            fig_sub = go.Figure(data=traces)
            fig_sub.update_layout(
                template='plotly_dark', 
                title=dict(text='EDI - Delta Agregado', font=dict(color='white', size=18), x=0.5),
                xaxis_title='Strike', 
                yaxis_title='Valor',
                shapes=common_shapes,
                annotations=common_annos,
                barmode='overlay',
                margin=dict(t=80)
            )
            # Adicionar Walls extras para OI e Visão Completa
            if 'OI' in 'Delta Agregado' or 'Completa' in 'Delta Agregado':
                if 'wall_lines' in globals(): 
                    for w in wall_lines: fig_sub.add_shape(w)
            fig_sub.show()
    else:
        print('fig3 não está definido.')
except Exception as e: print(f'Erro: {e}')


# CELL 14
# --- GRÁFICO: Delta Acumulado ---
# Acúmulo líquido do Delta ao longo dos strikes.
try:
    if 'fig3' in globals():
        traces = []
        idxs = [1]
        for i in idxs:
            if i < len(f3_data):
                import copy
                t = copy.deepcopy(f3_data[i])
                t.visible = True
                traces.append(t)
        
        if traces:
            fig_sub = go.Figure(data=traces)
            fig_sub.update_layout(
                template='plotly_dark', 
                title=dict(text='EDI - Delta Acumulado', font=dict(color='white', size=18), x=0.5),
                xaxis_title='Strike', 
                yaxis_title='Valor',
                shapes=common_shapes,
                annotations=common_annos,
                barmode='overlay',
                margin=dict(t=80)
            )
            # Adicionar Walls extras para OI e Visão Completa
            if 'OI' in 'Delta Acumulado' or 'Completa' in 'Delta Acumulado':
                if 'wall_lines' in globals(): 
                    for w in wall_lines: fig_sub.add_shape(w)
            fig_sub.show()
    else:
        print('fig3 não está definido.')
except Exception as e: print(f'Erro: {e}')


# CELL 15
# --- GRÁFICO: Gamma Exposure (GEX) ---
# Exposição de Gamma total e sua curvatura acumulada.
try:
    if 'fig3' in globals():
        traces = []
        idxs = [2, 3]
        for i in idxs:
            if i < len(f3_data):
                import copy
                t = copy.deepcopy(f3_data[i])
                t.visible = True
                traces.append(t)
        
        if traces:
            fig_sub = go.Figure(data=traces)
            fig_sub.update_layout(
                template='plotly_dark', 
                title=dict(text='EDI - Gamma Exposure (GEX)', font=dict(color='white', size=18), x=0.5),
                xaxis_title='Strike', 
                yaxis_title='Valor',
                shapes=common_shapes,
                annotations=common_annos,
                barmode='overlay',
                margin=dict(t=80)
            )
            # Adicionar Walls extras para OI e Visão Completa
            if 'OI' in 'Gamma Exposure (GEX)' or 'Completa' in 'Gamma Exposure (GEX)':
                if 'wall_lines' in globals(): 
                    for w in wall_lines: fig_sub.add_shape(w)
            fig_sub.show()
    else:
        print('fig3 não está definido.')
except Exception as e: print(f'Erro: {e}')


# CELL 16
# --- GRÁFICO: Gamma Exposure (OI) ---
# GEX calculado isolando apenas a variável Open Interest.
try:
    if 'fig3' in globals():
        traces = []
        idxs = [10, 13]
        for i in idxs:
            if i < len(f3_data):
                import copy
                t = copy.deepcopy(f3_data[i])
                t.visible = True
                traces.append(t)
        
        if traces:
            fig_sub = go.Figure(data=traces)
            fig_sub.update_layout(
                template='plotly_dark', 
                title=dict(text='EDI - Gamma Exposure (OI)', font=dict(color='white', size=18), x=0.5),
                xaxis_title='Strike', 
                yaxis_title='Valor',
                shapes=common_shapes,
                annotations=common_annos,
                barmode='overlay',
                margin=dict(t=80)
            )
            # Adicionar Walls extras para OI e Visão Completa
            if 'OI' in 'Gamma Exposure (OI)' or 'Completa' in 'Gamma Exposure (OI)':
                if 'wall_lines' in globals(): 
                    for w in wall_lines: fig_sub.add_shape(w)
            fig_sub.show()
    else:
        print('fig3 não está definido.')
except Exception as e: print(f'Erro: {e}')


# CELL 17
# --- GRÁFICO: Gamma Exposure (IV) ---
# GEX calculado isolando apenas a variável Volatilidade Implícita.
try:
    if 'fig3' in globals():
        traces = []
        idxs = [11, 14]
        for i in idxs:
            if i < len(f3_data):
                import copy
                t = copy.deepcopy(f3_data[i])
                t.visible = True
                traces.append(t)
        
        if traces:
            fig_sub = go.Figure(data=traces)
            fig_sub.update_layout(
                template='plotly_dark', 
                title=dict(text='EDI - Gamma Exposure (IV)', font=dict(color='white', size=18), x=0.5),
                xaxis_title='Strike', 
                yaxis_title='Valor',
                shapes=common_shapes,
                annotations=common_annos,
                barmode='overlay',
                margin=dict(t=80)
            )
            # Adicionar Walls extras para OI e Visão Completa
            if 'OI' in 'Gamma Exposure (IV)' or 'Completa' in 'Gamma Exposure (IV)':
                if 'wall_lines' in globals(): 
                    for w in wall_lines: fig_sub.add_shape(w)
            fig_sub.show()
    else:
        print('fig3 não está definido.')
except Exception as e: print(f'Erro: {e}')


# CELL 18
# --- GRÁFICO: R Gamma (PVOP) ---
# Gamma ponderado pelo volume de Puts (Put Volume Over Price).
try:
    if 'fig3' in globals():
        traces = []
        idxs = [12]
        for i in idxs:
            if i < len(f3_data):
                import copy
                t = copy.deepcopy(f3_data[i])
                t.visible = True
                traces.append(t)
        
        if traces:
            fig_sub = go.Figure(data=traces)
            fig_sub.update_layout(
                template='plotly_dark', 
                title=dict(text='EDI - R Gamma (PVOP)', font=dict(color='white', size=18), x=0.5),
                xaxis_title='Strike', 
                yaxis_title='Valor',
                shapes=common_shapes,
                annotations=common_annos,
                barmode='overlay',
                margin=dict(t=80)
            )
            # Adicionar Walls extras para OI e Visão Completa
            if 'OI' in 'R Gamma (PVOP)' or 'Completa' in 'R Gamma (PVOP)':
                if 'wall_lines' in globals(): 
                    for w in wall_lines: fig_sub.add_shape(w)
            fig_sub.show()
    else:
        print('fig3 não está definido.')
except Exception as e: print(f'Erro: {e}')


# CELL 19
# --- GRÁFICO: Open Interest por Strike ---
# Contratos em aberto (Calls vs Puts) e Midwalls.
try:
    if 'fig3' in globals():
        traces = []
        idxs = [4, 5, 6, 7]
        for i in idxs:
            if i < len(f3_data):
                import copy
                t = copy.deepcopy(f3_data[i])
                t.visible = True
                traces.append(t)
        
        if traces:
            fig_sub = go.Figure(data=traces)
            fig_sub.update_layout(
                template='plotly_dark', 
                title=dict(text='EDI - Open Interest por Strike', font=dict(color='white', size=18), x=0.5),
                xaxis_title='Strike', 
                yaxis_title='Valor',
                shapes=common_shapes,
                annotations=common_annos,
                barmode='overlay',
                margin=dict(t=80)
            )
            # Adicionar Walls extras para OI e Visão Completa
            if 'OI' in 'Open Interest por Strike' or 'Completa' in 'Open Interest por Strike':
                if 'wall_lines' in globals(): 
                    for w in wall_lines: fig_sub.add_shape(w)
            fig_sub.show()
    else:
        print('fig3 não está definido.')
except Exception as e: print(f'Erro: {e}')


# CELL 20
# --- GRÁFICO: Charm Exposure ---
# Sensibilidade do Delta à passagem do tempo (Decaimento).
try:
    if 'fig3' in globals():
        traces = []
        idxs = [8]
        for i in idxs:
            if i < len(f3_data):
                import copy
                t = copy.deepcopy(f3_data[i])
                t.visible = True
                traces.append(t)
        
        if traces:
            fig_sub = go.Figure(data=traces)
            fig_sub.update_layout(
                template='plotly_dark', 
                title=dict(text='EDI - Charm Exposure', font=dict(color='white', size=18), x=0.5),
                xaxis_title='Strike', 
                yaxis_title='Valor',
                shapes=common_shapes,
                annotations=common_annos,
                barmode='overlay',
                margin=dict(t=80)
            )
            # Adicionar Walls extras para OI e Visão Completa
            if 'OI' in 'Charm Exposure' or 'Completa' in 'Charm Exposure':
                if 'wall_lines' in globals(): 
                    for w in wall_lines: fig_sub.add_shape(w)
            fig_sub.show()
    else:
        print('fig3 não está definido.')
except Exception as e: print(f'Erro: {e}')


# CELL 21
# --- GRÁFICO: Vanna Exposure ---
# Sensibilidade do Delta a mudanças na Volatilidade Implícita.
try:
    if 'fig3' in globals():
        traces = []
        idxs = [9]
        for i in idxs:
            if i < len(f3_data):
                import copy
                t = copy.deepcopy(f3_data[i])
                t.visible = True
                traces.append(t)
        
        if traces:
            fig_sub = go.Figure(data=traces)
            fig_sub.update_layout(
                template='plotly_dark', 
                title=dict(text='EDI - Vanna Exposure', font=dict(color='white', size=18), x=0.5),
                xaxis_title='Strike', 
                yaxis_title='Valor',
                shapes=common_shapes,
                annotations=common_annos,
                barmode='overlay',
                margin=dict(t=80)
            )
            # Adicionar Walls extras para OI e Visão Completa
            if 'OI' in 'Vanna Exposure' or 'Completa' in 'Vanna Exposure':
                if 'wall_lines' in globals(): 
                    for w in wall_lines: fig_sub.add_shape(w)
            fig_sub.show()
    else:
        print('fig3 não está definido.')
except Exception as e: print(f'Erro: {e}')


# CELL 22
# --- GRÁFICO: Visão Completa ---
# Visão geral combinando Delta, Gamma e OI.
try:
    if 'fig3' in globals():
        traces = []
        idxs = [0, 2, 4, 5]
        for i in idxs:
            if i < len(f3_data):
                import copy
                t = copy.deepcopy(f3_data[i])
                t.visible = True
                traces.append(t)
        
        if traces:
            fig_sub = go.Figure(data=traces)
            fig_sub.update_layout(
                template='plotly_dark', 
                title=dict(text='EDI - Visão Completa', font=dict(color='white', size=18), x=0.5),
                xaxis_title='Strike', 
                yaxis_title='Valor',
                shapes=common_shapes,
                annotations=common_annos,
                barmode='overlay',
                margin=dict(t=80)
            )
            # Adicionar Walls extras para OI e Visão Completa
            if 'OI' in 'Visão Completa' or 'Completa' in 'Visão Completa':
                if 'wall_lines' in globals(): 
                    for w in wall_lines: fig_sub.add_shape(w)
            fig_sub.show()
    else:
        print('fig3 não está definido.')
except Exception as e: print(f'Erro: {e}')


# CELL 23
# --- GRÁFICO: Strikes + Midwalls + Fibonacci ---
# Visualização de níveis de suporte/resistência e Fibo.
try:
    if 'fig3' in globals():
        shps = shapes_strike_mid_fibo if 'shapes_strike_mid_fibo' in globals() else common_shapes
        anns = annos_strike_mid_fibo if 'annos_strike_mid_fibo' in globals() else common_annos
        
        fig_ov = go.Figure(data=[dummy_trace])
        fig_ov.update_layout(
            template='plotly_dark', 
            title='Strikes + Midwalls + Fibonacci',
            xaxis_title='Strike', 
            yaxis_title='-',
            shapes=shps,
            annotations=anns,
            margin=dict(t=80)
        )
        fig_ov.show()
    else:
        print('fig3 não está definido.')
except Exception as e: print(f'Erro: {e}')


# CELL 24
# --- GRÁFICO: Range + Walls ---
# Range esperado e barreiras de volume.
try:
    if 'fig3' in globals():
        shps = [spot_line, hline0] + (range_lines if 'range_lines' in globals() else []) + (wall_lines if 'wall_lines' in globals() else [])
        anns = common_annos
        
        fig_ov = go.Figure(data=[dummy_trace])
        fig_ov.update_layout(
            template='plotly_dark', 
            title='Range + Walls',
            xaxis_title='Strike', 
            yaxis_title='-',
            shapes=shps,
            annotations=anns,
            margin=dict(t=80)
        )
        fig_ov.show()
    else:
        print('fig3 não está definido.')
except Exception as e: print(f'Erro: {e}')


# CELL 25
# --- GRÁFICO: Range apenas ---
# Apenas o range esperado.
try:
    if 'fig3' in globals():
        shps = [spot_line, hline0] + (range_lines if 'range_lines' in globals() else [])
        anns = common_annos
        
        fig_ov = go.Figure(data=[dummy_trace])
        fig_ov.update_layout(
            template='plotly_dark', 
            title='Range apenas',
            xaxis_title='Strike', 
            yaxis_title='-',
            shapes=shps,
            annotations=anns,
            margin=dict(t=80)
        )
        fig_ov.show()
    else:
        print('fig3 não está definido.')
except Exception as e: print(f'Erro: {e}')


# CELL 26
# --- GRÁFICO: Walls apenas ---
# Apenas as barreiras de volume.
try:
    if 'fig3' in globals():
        shps = [spot_line, hline0] + (wall_lines if 'wall_lines' in globals() else [])
        anns = common_annos
        
        fig_ov = go.Figure(data=[dummy_trace])
        fig_ov.update_layout(
            template='plotly_dark', 
            title='Walls apenas',
            xaxis_title='Strike', 
            yaxis_title='-',
            shapes=shps,
            annotations=anns,
            margin=dict(t=80)
        )
        fig_ov.show()
    else:
        print('fig3 não está definido.')
except Exception as e: print(f'Erro: {e}')


# CELL 27
# --- GRÁFICO: Limpar overlays ---
# Visualização limpa apenas com Spot.
try:
    if 'fig3' in globals():
        shps = [spot_line, hline0]
        anns = [spot_label]
        
        fig_ov = go.Figure(data=[dummy_trace])
        fig_ov.update_layout(
            template='plotly_dark', 
            title='Limpar overlays',
            xaxis_title='Strike', 
            yaxis_title='-',
            shapes=shps,
            annotations=anns,
            margin=dict(t=80)
        )
        fig_ov.show()
    else:
        print('fig3 não está definido.')
except Exception as e: print(f'Erro: {e}')


# CELL 28
def _plot_flow_sentiment():
    # Calcular Fluxo Altista vs Baixista
    bull_vols = []
    bear_vols = []

    # DEBUG DEEP
    try:
        unique_types = options['OptionType'].unique()
        print(f"DEBUG FLOW DEEP: Unique OptionTypes: {unique_types}")
    except:
        pass

    # Ensure consistency just in case
    options['StrikeK'] = options['StrikeK'].astype(float)
    strikes_ref_float = np.array(strikes_ref, dtype=float)

    total_bull = 0
    total_bear = 0

    for k in strikes_ref_float:
        # Robust filtering
        df_k = options[np.isclose(options['StrikeK'], k, atol=1e-5)]

        v_bull = 0.0
        v_bear = 0.0

        for _, row in df_k.iterrows():
            tipo = str(row['OptionType']).strip().upper()
            chg = float(row['Change']) if pd.notnull(row['Change']) else 0.0
            vol = float(row['Volume']) if pd.notnull(row['Volume']) else 0.0

            # Normalizar tipos comuns
            if tipo in ['C', 'CALL', 'COMPRA']: tipo = 'CALL'
            if tipo in ['P', 'PUT', 'VENDA']: tipo = 'PUT'

            if vol > 0:
                if tipo == 'CALL':
                    if chg > 0: v_bull += vol   # Call valorizando -> Bull
                    elif chg < 0: v_bear += vol # Call desvalorizando -> Bear
                elif tipo == 'PUT':
                    if chg > 0: v_bear += vol   # Put valorizando -> Bear
                    elif chg < 0: v_bull += vol # Put desvalorizando -> Bull

        bull_vols.append(v_bull)
        bear_vols.append(-v_bear) # Negativo para plotar para baixo
        total_bull += v_bull
        total_bear += v_bear

    print(f"DEBUG FLOW DEEP: Total Bull Vol: {total_bull}, Total Bear Vol: {total_bear}")
    if total_bull == 0 and total_bear == 0:
         print("DEBUG FLOW DEEP: WARNING - No volume classified! Check OptionType or Change logic.")

    fig = go.Figure()

    # Bullish (Verde)
    fig.add_trace(go.Bar(
        x=strikes_ref, y=bull_vols,
        name='Fluxo Altista (Call Up / Put Down)',
        marker_color='lime',
        opacity=0.7
    ))

    # Bearish (Vermelho)
    fig.add_trace(go.Bar(
        x=strikes_ref, y=bear_vols,
        name='Fluxo Baixista (Call Down / Put Up)',
        marker_color='red',
        opacity=0.7
    ))

    # Layout
    fig.update_layout(
        title=dict(text='EDI - Sentimento do Fluxo (Volume x Variação)', font=dict(color='white', size=20), x=0.5, y=0.98, xanchor='center', yanchor='top'),
        xaxis=dict(title='Strike', tickfont=dict(color='white'), gridcolor='#333'),
        yaxis=dict(title='Volume Estimado', tickfont=dict(color='white'), gridcolor='#333'),
        paper_bgcolor='black',
        plot_bgcolor='black',
        margin=dict(t=100, b=50, l=50, r=50), # Margem superior aumentada para garantir visibilidade do titulo
        barmode='relative', # Empilhado relativo (pos/neg)
        legend=dict(font=dict(color='white'), orientation='h', y=-0.15, x=0.5, xanchor='center', yanchor='top'),
        shapes=[spot_line, hline0] + range_lines
    )

    # Add Walls/Flips
    if 'flip_line' in globals() and flip_line: fig.add_shape(flip_line)

    # Check for empty data
    if sum(np.abs(bull_vols)) == 0 and sum(np.abs(bear_vols)) == 0:
        fig.add_annotation(text='Sem dados de fluxo relevantes<br>(Volume=0 ou Variação=0)', xref='paper', yref='paper', x=0.5, y=0.5, showarrow=False, font=dict(color='yellow', size=20))
    return fig


# CELL 29

# --- EDI EXTENSION START ---
# Esta célula foi injetada automaticamente para gerar painéis individuais, métricas avançadas e thumbnails.
# VERSÃO 2.0: Correção de escopo de variáveis visuais (Range, Walls, Flip)
import plotly.graph_objects as go
import numpy as np
import json
import os
import re
from scipy.stats import norm
import pandas as pd

# 1. Funções Auxiliares Financeiras (Black-Scholes)
def _d1_ext(S, K, T, r, sigma):
    return (np.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*np.sqrt(T))

def _d2_ext(S, K, T, r, sigma):
    return _d1_ext(S, K, T, r, sigma) - sigma*np.sqrt(T)

def _bs_theta_ext(S, K, T, r, sigma, type_='call'):
    d1 = _d1_ext(S, K, T, r, sigma)
    d2 = _d2_ext(S, K, T, r, sigma)
    term1 = - (S * norm.pdf(d1) * sigma) / (2 * np.sqrt(T))
    if type_ == 'call':
        term2 = - r * K * np.exp(-r*T) * norm.cdf(d2)
        return term1 + term2
    else:
        term2 = r * K * np.exp(-r*T) * norm.cdf(-d2)
        return term1 + term2

def _bs_delta_ext(S, K, T, r, sigma, type_='call'):
    d1 = _d1_ext(S, K, T, r, sigma)
    if type_ == 'call': return norm.cdf(d1)
    else: return norm.cdf(d1) - 1

# 2. Cálculos de Theta e Delta Flip
try:
    # Theta Exposure
    theta_calls_ext = []
    theta_puts_ext = []
    for K in strikes_ref:
        theta_calls_ext.append(_bs_theta_ext(SPOT, K, T, RISK_FREE, IV_ANNUAL, 'call'))
        theta_puts_ext.append(_bs_theta_ext(SPOT, K, T, RISK_FREE, IV_ANNUAL, 'put'))

    theta_calls_ext = np.array(theta_calls_ext)
    theta_puts_ext = np.array(theta_puts_ext)
    theta_tot_ext = (theta_calls_ext * oi_call_ref + theta_puts_ext * oi_put_ref) * CONTRACT_MULT

    # Delta Flip Profile (Simulação)
    spots_sim_ext = np.linspace(SPOT * 0.85, SPOT * 1.15, 50)
    deltas_sim_ext = []
    delta_flip_val_ext = None

    for s_sim in spots_sim_ext:
        d_calls_sim = [_bs_delta_ext(s_sim, K, T, RISK_FREE, IV_ANNUAL, 'call') for K in strikes_ref]
        d_puts_sim = [_bs_delta_ext(s_sim, K, T, RISK_FREE, IV_ANNUAL, 'put') for K in strikes_ref]
        net_delta = np.sum(np.array(d_calls_sim) * oi_call_ref + np.array(d_puts_sim) * oi_put_ref)
        deltas_sim_ext.append(net_delta)

    deltas_sim_ext = np.array(deltas_sim_ext)

    # Encontrar cruzamento de zero do Delta (Flip Point de Delta)
    cross_idx = np.where(np.diff(np.sign(deltas_sim_ext)))[0]
    if len(cross_idx) > 0:
        idx = cross_idx[0]
        y1, y2 = deltas_sim_ext[idx], deltas_sim_ext[idx+1]
        x1, x2 = spots_sim_ext[idx], spots_sim_ext[idx+1]
        delta_flip_val_ext = x1 - y1 * (x2 - x1) / (y2 - y1)
    else:
        delta_flip_val_ext = spots_sim_ext[np.argmin(np.abs(deltas_sim_ext))]

except Exception as e:
    print(f'Erro nos calculos estendidos: {e}')
    delta_flip_val_ext = SPOT
    theta_tot_ext = np.zeros_like(strikes_ref)

# 3. Atualizar Metrics JSON
try:
    _metrics_path = 'exports/metrics.json'
    if os.path.exists(_metrics_path):
        with open(_metrics_path, 'r') as f: _mdata = json.load(f)
    else:
        _mdata = {}

    _mdata['delta_flip'] = float(delta_flip_val_ext) if delta_flip_val_ext is not None else None
    
    # Tenta usar regime global, senão recalcula
    if 'regime' in globals():
        _regime_curr = regime
    elif 'gamma_flip' in globals() and gamma_flip is not None:
        _regime_curr = 'Gamma Positivo' if SPOT >= gamma_flip else 'Gamma Negativo'
    else:
        _regime_curr = 'N/A'
        
    _mdata['regime'] = _regime_curr

    if 'Positivo' in _regime_curr:
        _mdata['clima'] = 'Ímã (Estável)'
    else:
        _mdata['clima'] = 'Repelente (Volátil)'

    with open(_metrics_path, 'w') as f: json.dump(_mdata, f, indent=2)
    print(f'Métricas atualizadas: {_mdata}')
except Exception as e:
    print(f'Erro ao atualizar metrics.json: {e}')

# 4. === RECALCULO DE VARIÁVEIS VISUAIS LOCAIS ===
# Garante que range lines, wall lines, etc existam neste escopo
try:
    # Range
    if 'IV_DAILY' not in globals(): 
        _iv_daily_local = float(IV_ANNUAL)/np.sqrt(252)
    else:
        _iv_daily_local = IV_DAILY
        
    _range_low, _range_high = float(SPOT)*(1 - _iv_daily_local), float(SPOT)*(1 + _iv_daily_local)
    
    _range_lines_local = [
        dict(type='line', x0=_range_low, x1=_range_low, y0=0, y1=1, xref='x', yref='paper', line=dict(color='yellow', dash='dot', width=1)),
        dict(type='line', x0=_range_high, x1=_range_high, y0=0, y1=1, xref='x', yref='paper', line=dict(color='yellow', dash='dot', width=1))
    ]
    _range_low_label_local = dict(x=_range_low, y=0.98, xref='x', yref='paper', text='Mínima Diária', showarrow=False, font=dict(color='yellow', size=11), bgcolor='black')
    _range_high_label_local = dict(x=_range_high, y=0.98, xref='x', yref='paper', text='Máxima Diária', showarrow=False, font=dict(color='yellow', size=11), bgcolor='black')

    # Walls
    _top_n = 3
    _idx_call = np.argsort(oi_call_ref)[-_top_n:]
    _idx_put = np.argsort(oi_put_ref)[-_top_n:]
    _call_walls = strikes_ref[_idx_call]
    _put_walls = strikes_ref[_idx_put]
    _wall_lines_local = ([dict(type='line', x0=float(k), x1=float(k), y0=0, y1=1, xref='x', yref='paper', line=dict(color='blue', dash='dot', width=1)) for k in _call_walls] +
                         [dict(type='line', x0=float(k), x1=float(k), y0=0, y1=1, xref='x', yref='paper', line=dict(color='red', dash='dot', width=1)) for k in _put_walls])

    # Flip
    _flip_line_local = None
    _flip_label_local = None
    if 'gamma_flip' in globals() and gamma_flip is not None:
        _flip_line_local = dict(type='line', x0=float(gamma_flip), x1=float(gamma_flip), y0=0, y1=1, xref='x', yref='paper', line=dict(color='red', dash='dash', width=2))
        _flip_label_local = dict(x=float(gamma_flip), y=0.05, xref='x', yref='paper', text='Gamma Flip', showarrow=False, font=dict(color='red', size=12), bgcolor='black', bordercolor='red')

    # Spot Line e Zero Line (Auxiliares)
    _spot_line_local = dict(type='line', x0=float(SPOT), x1=float(SPOT), y0=0, y1=1, xref='x', yref='paper', line=dict(color='lime', dash='dot', width=2))
    _hline0_local = dict(type='line', x0=float(min(strikes_ref)), x1=float(max(strikes_ref)), y0=0, y1=0, line=dict(color='white', dash='dot', width=1))
    _spot_label_local = dict(x=float(SPOT), y=0.02, xref='x', yref='paper', text='SPOT', showarrow=False, font=dict(color='lime', size=10), bgcolor='black')

    print("Variáveis visuais locais recalculadas com sucesso.")

except Exception as e:
    print(f"Erro ao recalcular variáveis visuais locais: {e}")
    _range_lines_local = []
    _wall_lines_local = []
    _flip_line_local = None
    _range_low_label_local = None
    _range_high_label_local = None
    _flip_label_local = None
    _spot_line_local = None
    _hline0_local = None
    _spot_label_local = None

# 5. Função de Salvamento
def _save_panel_ext(fig, filename, title, help_key=None):
    if not os.path.exists('exports'): os.makedirs('exports')
    html = fig.to_html(include_plotlyjs='cdn', full_html=True)
    html = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', html, flags=re.S)
    if 'inject_home' in globals(): html = inject_home(html)
    if 'inject_help' in globals() and help_key:
        html = html.replace('</body>', '<script src="help.js"></script></body>')
    with open(f'exports/{filename}.html', 'w', encoding='utf-8') as f: f.write(html)
    
    # Thumbnail
    try:
        fig_thumb = go.Figure(fig)
        fig_thumb.update_layout(title=None, xaxis=dict(visible=False), yaxis=dict(visible=False), margin=dict(l=0,r=0,t=0,b=0), showlegend=False, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
        fig_thumb.layout.annotations = []
        fig_thumb.write_image(f'exports/{filename}.svg', width=300, height=160)
    except Exception as e:
        print(f'Thumb error {filename}: {e}')

def _plot_flow_sentiment_local():
    # ... (mesma lógica anterior, mas usando _shapes locais se precisar) ...
    # Simplificado: reutiliza a funcao se ela existir, senao define
    # Mas como flow sentiment usa dados do DF 'options', ele deve funcionar se 'options' for global.
    if '_plot_flow_sentiment' in globals():
        return _plot_flow_sentiment()
    else:
        # Fallback simplificado ou erro
        return go.Figure()

# Lista de Modos
_modes = [
    ('Delta_Agregado', 'EDI - Delta Agregado', 'Delta Agregado'),
    ('Delta_Acumulado', 'EDI - Delta Acumulado', 'Delta Acumulado'),
    ('Gamma_Exposure', 'EDI - Gamma Exposure', 'Gamma Exposure'),
    ('OI_Strike', 'EDI - Open Interest por Strike', 'Open Interest por Strike'),
    ('Charm_Exposure', 'EDI - Charm Exposure', 'Charm Exposure'),
    ('Vanna_Exposure', 'EDI - Vanna Exposure', 'Vanna Exposure'),
    ('Theta_Exposure', 'EDI - Theta Exposure', 'Theta Exposure'),
    ('Delta_Flip_Profile', 'EDI - Delta Flip Profile', 'Delta Flip Profile'),
    ('Gamma_Flip_Profile', 'EDI - Gamma Flip Profile', 'Gamma Flip Profile'),
    ('Gamma_Flip_Analysis', 'EDI - Quadro Comparativo de Flips', 'Tabela explicativa dos modelos'),
    {'name':'Flow_Sentiment', 'func':_plot_flow_sentiment_local, 'file':'Flow_Sentiment.html'}
]

for item in _modes:
    if isinstance(item, dict):
        try:
            fig_m = item['func']()
            mode_file = item['name']
            mode_title = fig_m.layout.title.text if fig_m.layout.title and fig_m.layout.title.text else mode_file
            
            # Adicionar linhas complexas ao Flow Sentiment também, se fizer sentido
            # Mas Flow Sentiment já tem sua lógica própria.
            
            _save_panel_ext(fig_m, mode_file, mode_title, None)
            print(f'Gerado: {mode_file}')
        except Exception as e:
            print(f'Erro ao gerar {item.get("name")}: {e}')
        continue

    mode_file, mode_title, help_key = item
    try:
        fig_m = go.Figure()

        # Construção dos Gráficos com Shapes Locais
        _shapes = []
        if _spot_line_local: _shapes.append(_spot_line_local)
        if _hline0_local: _shapes.append(_hline0_local)
        
        _annos = []
        if _spot_label_local: _annos.append(_spot_label_local)

        if mode_file == 'Gamma_Exposure':
            fig_m.add_trace(go.Bar(x=strikes_ref, y=gex_tot, name='Gamma Exposure', marker_color='#3b82f6'))
            # Adiciona linhas de contexto
            _shapes += _range_lines_local
            if _flip_line_local: _shapes.append(_flip_line_local)
            if _range_low_label_local: _annos.append(_range_low_label_local)
            if _range_high_label_local: _annos.append(_range_high_label_local)
            if _flip_label_local: _annos.append(_flip_label_local)

        elif mode_file == 'OI_Strike':
            fig_m.add_trace(go.Bar(x=strikes_ref, y=oi_call_ref, name='CALL OI', marker_color='lime', text=[f'{float(k):.0f}' for k in strikes_ref], textposition='outside', textfont=dict(size=10, color='white'), cliponaxis=False, hovertemplate='Strike %{x:.0f}<br>OI %{y:.0f}'))
            fig_m.add_trace(go.Bar(x=strikes_ref, y=-np.array(oi_put_ref), name='PUT OI', marker_color='red', text=[f'{float(k):.0f}' for k in strikes_ref], textposition='outside', textfont=dict(size=10, color='white'), cliponaxis=False, hovertemplate='Strike %{x:.0f}<br>OI %{y:.0f}'))
            
            # FULL CONTEXT para OI Strike
            _shapes += _range_lines_local + _wall_lines_local
            if _flip_line_local: _shapes.append(_flip_line_local)
            
            if _range_low_label_local: _annos.append(_range_low_label_local)
            if _range_high_label_local: _annos.append(_range_high_label_local)
            if _flip_label_local: _annos.append(_flip_label_local)

        elif mode_file == 'Charm_Exposure':
            fig_m.add_trace(go.Bar(x=strikes_ref, y=charm_tot, name='Charm', marker_color='magenta'))
            _shapes += _range_lines_local

        elif mode_file == 'Vanna_Exposure':
            fig_m.add_trace(go.Bar(x=strikes_ref, y=vanna_tot, name='Vanna', marker_color='purple'))
            _shapes += _range_lines_local

        elif mode_file == 'Theta_Exposure':
            fig_m.add_trace(go.Bar(x=strikes_ref, y=theta_tot_ext, name='Theta', marker_color='#fbbf24'))
            _shapes += _range_lines_local

        elif mode_file == 'Delta_Agregado':
            _d_calls = [_bs_delta_ext(SPOT, K, T, RISK_FREE, IV_ANNUAL, 'call') for K in strikes_ref]
            _d_puts = [_bs_delta_ext(SPOT, K, T, RISK_FREE, IV_ANNUAL, 'put') for K in strikes_ref]
            _delta_tot = np.array(_d_calls)*oi_call_ref + np.array(_d_puts)*oi_put_ref
            fig_m.add_trace(go.Bar(x=strikes_ref, y=_delta_tot, name='Delta', marker_color='cyan'))
            _shapes += _range_lines_local
            if _range_low_label_local: _annos.append(_range_low_label_local)
            if _range_high_label_local: _annos.append(_range_high_label_local)

        elif mode_file == 'Delta_Acumulado':
            _d_calls = [_bs_delta_ext(SPOT, K, T, RISK_FREE, IV_ANNUAL, 'call') for K in strikes_ref]
            _d_puts = [_bs_delta_ext(SPOT, K, T, RISK_FREE, IV_ANNUAL, 'put') for K in strikes_ref]
            _delta_tot = np.array(_d_calls)*oi_call_ref + np.array(_d_puts)*oi_put_ref
            _delta_cum = np.cumsum(_delta_tot)
            fig_m.add_trace(go.Scatter(x=strikes_ref, y=_delta_cum, name='Delta Acumulado', line=dict(color='cyan')))
            _shapes += _range_lines_local

        elif mode_file == 'Figura3':
            if 'fig3' in globals(): fig_m = fig3
        elif mode_file == 'Figura4':
            if 'fig4' in globals(): fig_m = fig4

        # Layout Comum e Aplicação de Shapes/Annos
        fig_m.update_layout(
            template='plotly_dark',
            title=mode_title,
            xaxis_title='Strike' if mode_file != 'Delta_Flip_Profile' else 'Spot Price',
            margin=dict(t=50, b=50, l=50, r=50),
            shapes=_shapes,
            annotations=_annos,
            barmode='overlay' if mode_file == 'OI_Strike' else 'group'
        )

        _save_panel_ext(fig_m, mode_file, mode_title, help_key)
        
        # Injeção de Tabela para Figura3 (se aplicável)
        if mode_file == 'Figura3' and 'fig_vals3' in globals():
             try:
                with open(f'exports/{mode_file}.html', 'r', encoding='utf-8') as f: html_content = f.read()
                tbl_div = fig_vals3.to_html(include_plotlyjs=False, full_html=False)
                html_content = html_content.replace('</body>', f'<div style="margin-top:20px;border-top:1px solid #333;padding-top:20px">{tbl_div}</div></body>')
                with open(f'exports/{mode_file}.html', 'w', encoding='utf-8') as f: f.write(html_content)
             except: pass
        
        print(f'Gerado com contexto visual completo: {mode_file}')

    except Exception as e:
        print(f'Erro ao gerar {mode_file}: {e}')

# --- EDI EXTENSION END ---


# CELL 30
# Gerando o código para o Profit da Nelogica NTSL.
import numpy as np

TAMANHO_FONTE = 8
MOSTRAR_PLUS  = True
MOSTRAR_PLUS2 = True

strikes = np.unique(np.sort(np.array(strikes_ref, dtype=float)))
oi_call = np.array(oi_call_ref, dtype=float)
oi_put  = np.array(oi_put_ref, dtype=float)

call_walls_all = np.unique(np.sort(np.array(strikes_ref, dtype=float)[oi_call > 0]))
put_walls_all  = np.unique(np.sort(np.array(strikes_ref, dtype=float)[oi_put  > 0]))

midwalls_all = ((strikes[:-1] + strikes[1:]) / 2).astype(float)

IV_DAILY = float(IV_ANNUAL) / np.sqrt(252)
range_low  = float(SPOT * (1 - IV_DAILY))
range_high = float(SPOT * (1 + IV_DAILY))

def compute_gamma_flip(strikes_arr, gex_cum_arr, spot):
    if len(strikes_arr) == 0 or len(gex_cum_arr) == 0:
        return float(spot)
    sg = np.sign(gex_cum_arr)
    idx = np.where(np.diff(sg)!=0)[0]
    if len(idx)>0:
        zgs=[]
        for i in idx:
            y1, y2 = gex_cum_arr[i], gex_cum_arr[i+1]
            x1, x2 = strikes_arr[i], strikes_arr[i+1]
            zgs.append(float(x1 if y2==y1 else x1 - y1*(x2 - x1)/(y2 - y1)))
        zgs = np.array(zgs, dtype=float)
        return float(zgs[np.argmin(np.abs(zgs - spot))])
    i = int(np.argmin(np.abs(gex_cum_arr)))
    return float(strikes_arr[i])

def zero_cross_spline(strikes_arr, y_arr, spot):
    ks = np.array(strikes_arr,dtype=float)
    ys = np.array(y_arr,dtype=float)
    order = np.argsort(ks); ks=ks[order]; ys=ys[order]
    if len(ks)<3:
        return compute_gamma_flip(ks, ys, spot)
    f = PchipInterpolator(ks, ys)
    sg = np.sign(ys)
    idx = np.where(np.diff(sg)!=0)[0]
    if len(idx)==0:
        i=int(np.argmin(np.abs(ys))); return float(ks[i])
    j = int(np.argmin(np.abs(ks[idx] - float(spot))))
    i = idx[j]; a,b = ks[i], ks[i+1]
    try:
        root = brentq(lambda x: float(f(x)), float(a), float(b))
        return float(root)
    except Exception:
        return compute_gamma_flip(ks, ys, spot)

def compute_gamma_flip_sigma_kernel(strikes_arr,gex_arr,spot,iv_by_strike,T,sigma_factor):
    ks=np.array(strikes_arr,dtype=float)
    gex=np.array(gex_arr,dtype=float)
    iv=np.array(iv_by_strike,dtype=float)
    iv=np.where(iv<=0, np.nanmedian(iv[iv>0]), iv)
    z=np.log(ks/float(spot))/(iv*np.sqrt(T))
    w=np.exp(-(z**2)/(2.0*(float(sigma_factor)**2)))
    gex_cum=np.cumsum(gex*w)
    return zero_cross_spline(ks, gex_cum, spot)

def compute_gamma_flip_topn(strikes_arr,gex_arr,oi_c,oi_p,top_n,spot):
    ks=np.array(strikes_arr,dtype=float); gex=np.array(gex_arr,dtype=float)
    oi=np.array(oi_c,dtype=float)+np.array(oi_p,dtype=float)
    order=np.argsort(ks); ks=ks[order]; gex=gex[order]; oi=oi[order]
    idx=np.argsort(-oi)[:int(top_n)]
    mask=np.zeros_like(oi,dtype=bool); mask[idx]=True
    gex_sel=np.where(mask, gex, 0.0)
    gex_cum=np.cumsum(gex_sel)
    return compute_gamma_flip(ks, gex_cum, spot)

def compute_gamma_flip_hvl(strikes_arr, gex_arr, spot, hvl_daily, sigma_factor):
    if len(strikes_arr) == 0 or len(gex_arr) == 0:
        return None
    order = np.argsort(np.array(strikes_arr, dtype=float))
    ks = np.array(strikes_arr, dtype=float)[order]
    gex = np.array(gex_arr, dtype=float)[order]
    step = float(np.median(np.diff(ks))) if len(ks)>1 else 25.0
    sigma_pts = float(sigma_factor) * max(step * 2.0, float(spot) * float(hvl_daily))
    w = np.exp(-((ks - float(spot))**2) / (2.0 * (sigma_pts**2)))
    gex_cum_hvl = np.cumsum(gex * w)
    sg = np.sign(gex_cum_hvl)
    idx = np.where(np.diff(sg)!=0)[0]
    if len(idx)>0:
        j = int(np.argmin(np.abs(ks[idx] - float(spot))))
        i = idx[j]
        y1, y2 = gex_cum_hvl[i], gex_cum_hvl[i+1]
        x1, x2 = ks[i], ks[i+1]
        return float(x1 if y2==y1 else x1 - y1*(x2 - x1)/(y2 - y1))
    k_idx = int(np.argmin(np.abs(gex_cum_hvl)))
    return float(ks[k_idx])

def compute_gamma_flip_hvl_window(strikes_arr, gex_arr, spot, hvl_daily, sigma_factor):
    if len(strikes_arr) == 0 or len(gex_arr) == 0:
        return None
    order = np.argsort(np.array(strikes_arr, dtype=float))
    ks_all = np.array(strikes_arr, dtype=float)[order]
    gex_all = np.array(gex_arr, dtype=float)[order]
    step = float(np.median(np.diff(ks_all))) if len(ks_all)>1 else 25.0
    W = float(sigma_factor) * max(step * 2.0, float(spot) * float(hvl_daily))
    mask = (ks_all >= float(spot) - W) & (ks_all <= float(spot) + W)
    ks = ks_all[mask]
    gex = gex_all[mask]
    if len(ks) < 2:
        return None
    gex_cum = np.cumsum(gex)
    sg = np.sign(gex_cum)
    idx = np.where(np.diff(sg)!=0)[0]
    if len(idx)>0:
        j = int(np.argmin(np.abs(ks[idx] - float(spot))))
        i = idx[j]
        y1, y2 = gex_cum[i], gex_cum[i+1]
        x1, x2 = ks[i], ks[i+1]
        return float(x1 if y2==y1 else x1 - y1*(x2 - x1)/(y2 - y1))
    k_idx = int(np.argmin(np.abs(gex_cum)))
    return float(ks[k_idx])

def compute_gamma_flip_hvl_log(strikes_arr, gex_arr, spot, hvl_daily, sigma_factor):
    if len(strikes_arr) == 0 or len(gex_arr) == 0:
        return None
    order = np.argsort(np.array(strikes_arr, dtype=float))
    ks = np.array(strikes_arr, dtype=float)[order]
    gex = np.array(gex_arr, dtype=float)[order]
    sigma_m = float(hvl_daily) * float(sigma_factor)
    z = np.log(ks/float(spot))
    w = np.exp(-(z**2) / (2.0 * (sigma_m**2)))
    gex_cum_log = np.cumsum(gex * w)
    sg = np.sign(gex_cum_log)
    idx = np.where(np.diff(sg)!=0)[0]
    if len(idx)>0:
        j = int(np.argmin(np.abs(ks[idx] - float(spot))))
        i = idx[j]
        y1, y2 = gex_cum_log[i], gex_cum_log[i+1]
        x1, x2 = ks[i], ks[i+1]
        return float(x1 if y2==y1 else x1 - y1*(x2 - x1)/(y2 - y1))
    k_idx = int(np.argmin(np.abs(gex_cum_log)))
    return float(ks[k_idx])

gamma_flip = compute_gamma_flip(np.array(strikes_ref,dtype=float),
                                np.array(gex_cum_signed,dtype=float),
                                float(SPOT))
HVL_DAILY = float(HVL_ANNUAL)/np.sqrt(252)
gamma_flip_hvl = compute_gamma_flip_hvl(np.array(strikes_ref,dtype=float),
                                         np.array(gex_flip_base,dtype=float),
                                         float(SPOT), float(HVL_DAILY), float(SIGMA_FACTOR))
gamma_flip_hvl_log = compute_gamma_flip_hvl_log(np.array(strikes_ref,dtype=float),
                                              np.array(gex_flip_base,dtype=float),
                                              float(SPOT), float(HVL_DAILY), float(SIGMA_FACTOR))
gamma_flip_hvl_win = compute_gamma_flip_hvl_window(np.array(strikes_ref,dtype=float),
                                                   np.array(gex_flip_base,dtype=float),
                                                   float(SPOT), float(HVL_DAILY), float(SIGMA_FACTOR))

gamma_flip_spline = zero_cross_spline(np.array(strikes_ref,dtype=float), np.array(gex_cum_signed,dtype=float), float(SPOT))
gamma_flip_sigma_kernel = compute_gamma_flip_sigma_kernel(np.array(strikes_ref,dtype=float), np.array(gex_flip_base,dtype=float), float(SPOT), np.array(ivw,dtype=float) if 'ivw' in globals() else np.ones_like(strikes_ref, dtype=float), float(T) if 'T' in globals() else 1.0, float(SIGMA_FACTOR))
gamma_flip_topn = compute_gamma_flip_topn(np.array(strikes_ref,dtype=float), np.array(gex_flip_base,dtype=float), np.array(oi_call_ref,dtype=float), np.array(oi_put_ref,dtype=float), int(TOP_N_CONTRACTS) if 'TOP_N_CONTRACTS' in globals() else 3, float(SPOT))

# (Figura 3) sem sweep — varredura deslocada para Figura 4 dedicada

def as_price(v): return int(round(float(v)))

lines = []
lines.append("Input")
lines.append(f"  TamanhoFonte({TAMANHO_FONTE}); // Tamanho da fonte para as linhas")
lines.append(f"  MostrarPLUS({str(MOSTRAR_PLUS).lower()});  //função para mostrar os niveis de fibo  0.382 e 0.618")
lines.append(f"  MostrarPLUS2({str(MOSTRAR_PLUS2).lower()});  //função para mostrar os niveis de fibo  0.236 e 0.764")
lines.append("")
lines.append("Inicio")

if MOSTRAR_PLUS:
    lines.append("  if MostrarPLUS then")
    lines.append("    begin")
    for i in range(len(strikes)-1):
        lower = float(strikes[i]); upper = float(strikes[i+1]); dist = upper - lower
        for p in [0.382, 0.618]:
            lvl = lower + p*dist
            lines.append(f"      HorizontalLineCustom({as_price(lvl)}, clgray, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0); //valores das fibonacci 0.382 e 0.618")
    lines.append("    end;")

if MOSTRAR_PLUS2:
    lines.append("  if MostrarPLUS2 then")
    lines.append("    begin")
    for i in range(len(strikes)-1):
        lower = float(strikes[i]); upper = float(strikes[i+1]); dist = upper - lower
        for p in [0.236, 0.764]:
            lvl = lower + p*dist
            lines.append(f"      HorizontalLineCustom({as_price(lvl)}, cldkgray, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0); //valores das fibonacci 0.236 e 0.764")
    lines.append("    end;")

for k in call_walls_all:
    lines.append(f"  HorizontalLineCustom({as_price(k)}, clblue, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0); // valores dos strikes para call")
call_wall_prices = [as_price(k) for k in call_walls_all]
for k in put_walls_all:
    pw_price = as_price(k)
    if pw_price in call_wall_prices:
        lines.append(f"  HorizontalLineCustom({pw_price}, clred,  1, psDash, \"PutWall\", TamanhoFonte, tpBottomLeft, 0); // valores dos strikes para put (alinhamento oposto)")
    else:
        lines.append(f"  HorizontalLineCustom({pw_price}, clred,  1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0); // valores dos strikes para put")

for k in midwalls_all:
    lines.append(f"  HorizontalLineCustom({as_price(k)}, clCream, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0); // valores dos Midwalls")

lines.append(f"  HorizontalLineCustom({as_price(range_high)}, cllime, 1, psDash, \"Edi_1D_MAX\", TamanhoFonte, tpTopLeft, 0); // máxima diária")
lines.append(f"  HorizontalLineCustom({as_price(range_low)},  clred,  1, psDash, \"Edi_1D_MIN\", TamanhoFonte, tpTopLeft, 0); // Minima Diária")
# --- EDI: Max Pain & Zero Gamma ---
if 'max_pain' in globals():
    lines.append(f"  HorizontalLineCustom({as_price(max_pain)}, clFuchsia, 2, psSolid, \"MaxPain\", TamanhoFonte, tpRight, 0);")
if 'zero_gamma_level' in globals() and zero_gamma_level is not None:
    lines.append(f"  HorizontalLineCustom({as_price(zero_gamma_level)}, clYellow, 2, psSolid, \"ZeroGamma\", TamanhoFonte, tpRight, 0);")
# ----------------------------------

# --- EDI: Multi-Model Flips & Deduplication ---
flips_dict = {}

# Helper to safe get
def get_g(k): return float(globals()[k]) if k in globals() and globals()[k] is not None else None

# 1. Try Local Variables (Prioritized)
if 'gamma_flip' in locals() and gamma_flip is not None: flips_dict['GFlip_Classic'] = gamma_flip
if 'gamma_flip_spline' in locals() and gamma_flip_spline is not None: flips_dict['GFlip_Sim'] = gamma_flip_spline
if 'gamma_flip_hvl' in locals() and gamma_flip_hvl is not None: flips_dict['GFlip_HVL'] = gamma_flip_hvl
if 'gamma_flip_sigma_kernel' in locals() and gamma_flip_sigma_kernel is not None: flips_dict['GFlip_Kernel'] = gamma_flip_sigma_kernel
if 'gamma_flip_topn' in locals() and gamma_flip_topn is not None: flips_dict['GFlip_TopN'] = gamma_flip_topn
if 'gamma_flip_hvl_log' in locals() and gamma_flip_hvl_log is not None: flips_dict['GFlip_HVL_Log'] = gamma_flip_hvl_log
if 'gamma_flip_hvl_win' in locals() and gamma_flip_hvl_win is not None: flips_dict['GFlip_HVL_Win'] = gamma_flip_hvl_win

# 2. Fallback to Globals (if needed)
if 'GFlip_Classic' not in flips_dict and get_g('gamma_flip') is not None: flips_dict['GFlip_Classic'] = get_g('gamma_flip')
if 'GFlip_Sim' not in flips_dict and get_g('gamma_flip_sim_val') is not None: flips_dict['GFlip_Sim'] = get_g('gamma_flip_sim_val')
if 'GFlip_HVL' not in flips_dict and get_g('flip_hvl_pts') is not None: flips_dict['GFlip_HVL'] = get_g('flip_hvl_pts')
if 'GFlip_Kernel' not in flips_dict and get_g('flip_sigma_kernel') is not None: flips_dict['GFlip_Kernel'] = get_g('flip_sigma_kernel')
if 'GFlip_TopN' not in flips_dict and get_g('flip_topn') is not None: flips_dict['GFlip_TopN'] = get_g('flip_topn')

# Delta Flip
if 'delta_flip' in locals() and delta_flip is not None: flips_dict['Delta_Flip'] = float(delta_flip)
elif 'delta_flip' in globals() and globals()['delta_flip'] is not None: flips_dict['Delta_Flip'] = float(globals()['delta_flip'])

# Group by Price (Int)
grouped_flips = {}
for name, val in flips_dict.items():
    p = as_price(val)
    if p not in grouped_flips: grouped_flips[p] = []
    grouped_flips[p].append(name)
    
for p, names in grouped_flips.items():
    is_delta = any('Delta' in n for n in names)
    # Simplify names for label
    clean_names = [n.replace('GFlip_', 'GF_').replace('Delta_Flip', 'DF_Flip') for n in names]
    label = " / ".join(clean_names)
    
    # Logic: If Delta is present, prioritize Yellow, else Fuchsia
    color = "clYellow" if is_delta else "clFuchsia"
    
    lines.append(f"  HorizontalLineCustom({p}, {color}, 2, psDash, \"{label}\", TamanhoFonte, tpTopRight, 0);")

lines.append("")
lines.append("Fim;")

output_script = "\n".join(lines)
print(output_script)

# CELL 31

# --- Geração de Painéis Individuais (Refatoração Solicitada) ---
# Gera arquivos HTML individuais para cada modo da Figura 3 e novos modos (Theta, Delta Flip)
import plotly.graph_objects as go
import numpy as np
import re
import json
import os

def inject_home(html):
    nav = (
        '<div id="navbar-header" style="position:fixed;top:0;left:0;width:100%;background:#111827;display:flex;justify-content:space-between;align-items:center;'+
        'border-bottom:1px solid #374151;padding:8px 12px;z-index:9999">'+
        '<div><a href="index.html" style="color:#93c5fd;text-decoration:none;font-weight:600">&#8592; Home</a></div>'+
        '<button id="menuBtn" style="position:absolute;left:50%;transform:translateX(-50%);background:#1f2937;color:#e5e7eb;border:1px solid #374151;border-radius:6px;padding:6px 10px">Menu</button>'+
        '</div>'+
        '<div id="topmenu" style="position:fixed;top:42px;left:0;right:0;margin:0 8px;background:#111827;border-bottom:1px solid #374151;padding:8px 12px;display:none;opacity:0;transform:translateY(-4px);transition:opacity .2s ease,transform .2s ease;z-index:9999">'+
        '<div style="display:flex;flex-wrap:wrap;gap:12px;font-size:14px">'+
        '<a href="Delta_Agregado.html" style="color:#9ca3af">Delta Agregado</a>'+
        '<a href="Gamma_Exposure.html" style="color:#9ca3af">GEX</a>'+
        '<a href="OI_Strike.html" style="color:#9ca3af">OI</a>'+
        '<a href="Fluxo_Hedge.html" style="color:#9ca3af">Fluxo Hedge</a>'+
        '<a href="Dealer_Pressure.html" style="color:#9ca3af">Dealer Pressure</a>'+
        '<a href="Gamma_Flip_Cone.html" style="color:#9ca3af">Flip Cone</a>'+
        '<a href="Charm_Flow.html" style="color:#9ca3af">Charm</a>'+
        '<a href="Vanna_Sensitivity.html" style="color:#9ca3af">Vanna</a>'+
        '<a href="Theta_Exposure.html" style="color:#9ca3af">Theta</a>'+
        '</div></div>'+
        '<script>(function(){var b=document.getElementById("menuBtn"); if(b){b.onclick=function(){var m=document.getElementById("topmenu"); if(m){if(m.style.display==="none"||m.style.display===""){m.style.display="block"; requestAnimationFrame(function(){m.style.opacity=1; m.style.transform="translateY(0)";});} else {m.style.opacity=0; m.style.transform="translateY(-4px)"; setTimeout(function(){m.style.display="none";},200);}}}}})();</script>'+
        '<script>if(window.self!==window.top){var n=document.getElementById("navbar-header");if(n)n.style.display="none";}</script>'+
        '<div style="height:66px"></div>'
    )
    return re.sub(r'<body[^>]*>', lambda m: m.group(0)+nav, html, flags=re.S)

def placeholder_html(title):
    return '''<!doctype html><html><head><meta charset="utf-8"><title>'''+str(title)+'''</title></head><body></body></html>'''

def inject_help(html, title, items):
    help_html = f'''
    <div style="margin:20px;padding:20px;background:#1f2937;border-radius:8px;color:#e5e7eb">
        <h3>{title}</h3>
        <ul>
            {''.join(f'<li>{i}</li>' for i in items)}
        </ul>
    </div>
    '''
    return html.replace('</body>', help_html + '</body>')

def save_panel(fig, filename, title, help_blocks=None):
    try:
        os.makedirs('exports', exist_ok=True)
        # Add EDI Logo
#         fig.add_layout_image( # DISABLED LOGO
#             dict(
#                 source="../edi_logo.png",
#                 xref="paper", yref="paper",
#                 x=0.01, y=0.99,
#                 sizex=0.1, sizey=0.1,
#                 xanchor="left", yanchor="top",
#                 layer="above"
#             )
#         )
        fig.update_layout(template='plotly_dark', title=dict(text=title, font=dict(color='white', size=18), x=0.5), margin=dict(t=100))
        # Ajuste para responsividade e loading lazy nos iframes será tratado no index, mas aqui garantimos HTML limpo
        html = fig.to_html(include_plotlyjs='cdn', full_html=True)
        html = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', html, flags=re.S)
        html = inject_home(html)
        html = html.replace('</body>','<script src="help.js"></script></body>')
        if help_blocks:
            for h_title, h_items in help_blocks.items():
                html = inject_help(html, h_title, h_items)
        if 'NO_DATA' in globals() and NO_DATA: html = placeholder_html(title)
        if '<title>' not in html:
            html = re.sub(r'<head>(.*?)</head>', f'<head><title>{title}</title>\1</head>', html, flags=re.S)
        
        filepath = f'exports/{filename}'
        with open(filepath, 'w', encoding='utf-8') as f: f.write(html)
        print(f"Saved {filepath}")
    except Exception as e:
        print(f"Error saving panel {filename}: {e}")

print("Generating individual panels...")

# 1. Delta Agregado
fig_delta = go.Figure()
fig_delta.add_trace(go.Bar(x=strikes_ref, y=dexp_tot, name='Delta Agregado',
                      marker_color=['lime' if v>=0 else 'red' for v in dexp_tot],
                      text=[f'{float(k):.0f}' for k in strikes_ref], textposition='outside',
                      hovertemplate='Strike %{x:.0f}<br>Delta %{y:.0f}'))
spot_line = dict(type='line', x0=float(SPOT), x1=float(SPOT), y0=0, y1=1, xref='x', yref='paper', line=dict(color='lime', dash='dot', width=2))
hline0 = dict(type='line', x0=float(min_k), x1=float(max_k), y0=0, y1=0, line=dict(color='white', width=1))
fig_delta.update_layout(xaxis_title='Strike', yaxis_title='Delta Líquido', shapes=[spot_line, hline0])
save_panel(fig_delta, 'Delta_Agregado.html', 'EDI &#8212; Delta Agregado', {
    'Ajuda didática': ['Delta por strike', 'Verde: Dealers Long (suporte)', 'Vermelho: Dealers Short (resistência)'],
    'Exemplos de trade': ['Comprar suporte (verde)', 'Vender resistência (vermelho)']
})

# 2. Delta Acumulado
fig_delta_cum = go.Figure()
fig_delta_cum.add_trace(go.Scatter(x=strikes_ref, y=dexp_cum, mode='lines', name='Delta Acumulado', line=dict(width=3, color='yellow')))
fig_delta_cum.update_layout(xaxis_title='Strike', yaxis_title='Delta Acumulado', shapes=[spot_line, hline0])
save_panel(fig_delta_cum, 'Delta_Acumulado.html', 'EDI &#8212; Delta Acumulado', {
    'Ajuda didática': ['Acúmulo do Delta', 'Identifica tendências macro do posicionamento'],
    'Exemplos de trade': ['Seguir a inclinação da curva']
})

# 3. Gamma Exposure
fig_gex = go.Figure()
fig_gex.add_trace(go.Bar(x=strikes_ref, y=gex_tot, name='Gamma Exposure', marker_color='cyan', opacity=0.6))
fig_gex.update_layout(xaxis_title='Strike', yaxis_title='GEX ($)', shapes=[spot_line, hline0])
save_panel(fig_gex, 'Gamma_Exposure.html', 'EDI &#8212; Gamma Exposure', {
    'Ajuda didática': ['Exposição Gamma dos Dealers', 'Barras altas indicam magnetismo ou volatilidade'],
    'Exemplos de trade': ['Scalp em picos de Gamma']
})

# 4. Open Interest por Strike
fig_oi = go.Figure()
fig_oi.add_trace(go.Bar(x=strikes_ref, y=oi_call_ref, name='OI Call', marker_color='green', opacity=0.5))
fig_oi.add_trace(go.Bar(x=strikes_ref, y=oi_put_ref, name='OI Put', marker_color='red', opacity=0.5))

# Walls for OI Chart
oi_shapes = [spot_line]
cw_local = np.unique(np.sort(np.array(strikes_ref, dtype=float)[np.array(oi_call_ref, dtype=float) > 0]))
pw_local = np.unique(np.sort(np.array(strikes_ref, dtype=float)[np.array(oi_put_ref, dtype=float) > 0]))
for k in cw_local:
    oi_shapes.append(dict(type='line', x0=float(k), x1=float(k), y0=0, y1=1, xref='x', yref='paper', line=dict(color='blue', dash='dash', width=1)))
for k in pw_local:
    oi_shapes.append(dict(type='line', x0=float(k), x1=float(k), y0=0, y1=1, xref='x', yref='paper', line=dict(color='red', dash='dash', width=1)))
if 'gamma_flip' in locals() and gamma_flip is not None:
    oi_shapes.append(dict(type='line', x0=float(gamma_flip), x1=float(gamma_flip), y0=0, y1=1, xref='x', yref='paper', line=dict(color='yellow', dash='dash', width=2)))

fig_oi.update_layout(barmode='group', xaxis_title='Strike', yaxis_title='Contratos', shapes=oi_shapes)
save_panel(fig_oi, 'OI_Strike.html', 'EDI &#8212; OI por Strike', {
    'Ajuda didática': ['Volume de contratos abertos', 'Barreiras de liquidez'],
    'Exemplos de trade': ['Evitar operar contra grandes muralhas de OI']
})

# 5. Charm Exposure
fig_charm = go.Figure()
fig_charm.add_trace(go.Bar(x=strikes_ref, y=charm_tot, name='Charm Exposure', marker_color='magenta', opacity=0.6))
fig_charm.update_layout(xaxis_title='Strike', yaxis_title='Charm', shapes=[spot_line, hline0])
save_panel(fig_charm, 'Charm_Exposure.html', 'EDI &#8212; Charm Exposure', {
    'Ajuda didática': ['Decaimento do Delta (dDelta/dTime)', 'Importante perto do vencimento'],
    'Exemplos de trade': ['Antecipar fluxos de fim de dia']
})

# 6. Vanna Exposure
fig_vanna = go.Figure()
fig_vanna.add_trace(go.Bar(x=strikes_ref, y=vanna_tot, name='Vanna Exposure', marker_color='orange', opacity=0.6))
if 'vanna_cum' not in globals() and 'vanna_tot' in globals(): vanna_cum = np.cumsum(vanna_tot)
if 'vanna_cum' in globals(): fig_vanna.add_trace(go.Scatter(x=strikes_ref, y=vanna_cum, mode='lines', name='Vanna Acumulado', line=dict(color='white', width=2)))
fig_vanna.update_layout(xaxis_title='Strike', yaxis_title='Vanna', shapes=[spot_line, hline0])
save_panel(fig_vanna, 'Vanna_Exposure.html', 'EDI &#8212; Vanna Exposure', {
    'Ajuda didática': ['Sensibilidade do Delta à Volatilidade', 'Hedge dinâmico em mudanças de IV'],
    'Exemplos de trade': ['Operar fluxos de Vanna quando IV muda']
})

# 7. Theta Exposure (Novo)
fig_theta = go.Figure()
fig_theta.add_trace(go.Bar(x=strikes_ref, y=theta_tot, name='Theta Exposure', marker_color='purple', opacity=0.6))
fig_theta.update_layout(xaxis_title='Strike', yaxis_title='Theta Agregado ($/dia)', shapes=[spot_line, hline0])
save_panel(fig_theta, 'Theta_Exposure.html', 'EDI &#8212; Theta Exposure', {
    'Ajuda didática': ['Perda de valor por tempo (Time Decay)', 'Ponderado por Open Interest'],
    'Exemplos de trade': ['Vender Theta alto (short options)', 'Monitorar aceleração do decay']
})

# 8. Delta Flip Profile (Novo)
fig_flip = go.Figure()
if 'net_deltas' in globals() and 's_sim_range' in globals():
    fig_flip.add_trace(go.Scatter(x=s_sim_range, y=net_deltas, mode='lines', name='Perfil Delta Líquido', line=dict(color='white', width=2)))
    # Linha zero
    fig_flip.add_shape(type='line', x0=min(s_sim_range), x1=max(s_sim_range), y0=0, y1=0, line=dict(color='gray', dash='dash'))
    # Spot atual
    fig_flip.add_vline(x=SPOT, line_dash="dot", line_color="lime", annotation_text="Spot")
    # Ponto de Flip
    if delta_flip is not None:
        fig_flip.add_vline(x=delta_flip, line_dash="dash", line_color="cyan", annotation_text=f"Flip: {delta_flip:.0f}")
    
    fig_flip.update_layout(title='Perfil de Delta Flip', xaxis_title='Spot Simulado', yaxis_title='Delta Líquido Agregado')
else:
    fig_flip.add_annotation(text="Dados de simulação de Delta Flip não disponíveis", showarrow=False)

save_panel(fig_flip, 'Delta_Flip_Profile.html', 'EDI &#8212; Delta Flip Profile', {
    'Ajuda didática': ['Mostra como o Delta Agregado muda com o Spot', 'Cruzamento do zero indica inversão de regime'],
    'Exemplos de trade': ['Identificar pontos de inflexão do mercado']
})

# 9. Gamma Flip Analysis (Table)
try:
    fig_flip_table = go.Figure()
    def get_g_local(k): return float(globals()[k]) if k in globals() and globals()[k] is not None else None
    local_flips = {}
    if 'gamma_flip' in locals() and gamma_flip is not None: local_flips['GFlip_Classic'] = gamma_flip
    elif get_g_local('gamma_flip') is not None: local_flips['GFlip_Classic'] = get_g_local('gamma_flip')
    if 'gamma_flip_spline' in locals() and gamma_flip_spline is not None: local_flips['GFlip_Sim'] = gamma_flip_spline
    elif get_g_local('gamma_flip_spline') is not None: local_flips['GFlip_Sim'] = get_g_local('gamma_flip_spline')
    if 'gamma_flip_hvl' in locals() and gamma_flip_hvl is not None: local_flips['GFlip_HVL'] = gamma_flip_hvl
    elif get_g_local('gamma_flip_hvl') is not None: local_flips['GFlip_HVL'] = get_g_local('gamma_flip_hvl')
    if 'gamma_flip_sigma_kernel' in locals() and gamma_flip_sigma_kernel is not None: local_flips['GFlip_Kernel'] = gamma_flip_sigma_kernel
    elif get_g_local('gamma_flip_sigma_kernel') is not None: local_flips['GFlip_Kernel'] = get_g_local('gamma_flip_sigma_kernel')
    if 'gamma_flip_topn' in locals() and gamma_flip_topn is not None: local_flips['GFlip_TopN'] = gamma_flip_topn
    elif get_g_local('gamma_flip_topn') is not None: local_flips['GFlip_TopN'] = get_g_local('gamma_flip_topn')
    if 'gamma_flip_hvl_log' in locals() and gamma_flip_hvl_log is not None: local_flips['GFlip_HVL_Log'] = gamma_flip_hvl_log
    elif get_g_local('gamma_flip_hvl_log') is not None: local_flips['GFlip_HVL_Log'] = get_g_local('gamma_flip_hvl_log')
    if 'gamma_flip_hvl_win' in locals() and gamma_flip_hvl_win is not None: local_flips['GFlip_HVL_Win'] = gamma_flip_hvl_win
    elif get_g_local('gamma_flip_hvl_win') is not None: local_flips['GFlip_HVL_Win'] = get_g_local('gamma_flip_hvl_win')
    if get_g_local('delta_flip') is not None: local_flips['Delta_Flip'] = get_g_local('delta_flip')
    f_models = []; f_vals = []; f_descs = []
    desc_map = {'GFlip_Classic': 'Zero GEX (Total)', 'GFlip_Sim': 'Spline Interpolation', 'GFlip_HVL': 'HVL Adjusted', 'GFlip_Kernel': 'Gaussian Kernel', 'GFlip_TopN': 'Top Liquidity', 'GFlip_HVL_Log': 'Log-HVL', 'GFlip_HVL_Win': 'Rolling HVL', 'Delta_Flip': 'Delta Net Zero'}
    for k, v in local_flips.items():
        f_models.append(k); f_vals.append(f'{v:.2f}'); f_descs.append(desc_map.get(k, '-'))
    fig_flip_table.add_trace(go.Table(header=dict(values=['Modelo', 'Flip Level', 'Descrição'], fill_color='#2a3f5f', font=dict(color='white')), cells=dict(values=[f_models, f_vals, f_descs], fill_color='#111827', font=dict(color='white'))))
    fig_flip_table.update_layout(title='Quadro Comparativo de Flips')
    save_panel(fig_flip_table, 'Gamma_Flip_Analysis.html', 'EDI &#8212; Gamma Flip Analysis', {'Ajuda': ['Comparativo de modelos']})
except Exception as e: print(f'Error generating Gamma_Flip_Analysis: {e}')

# 10. Flow Sentiment
try:
    if 'Change' in options.columns:
        bull_vols = []
        bear_vols = []
        for k in strikes_ref:
            df_k = options[options['Strike'] == k]
            v_bull = 0.0
            v_bear = 0.0
            for _, row in df_k.iterrows():
                tipo = str(row['OptionType']).upper()
                chg = float(row['Change']) if pd.notnull(row['Change']) else 0.0
                vol = float(row['Volume']) if pd.notnull(row['Volume']) else 0.0
                if vol > 0:
                    if tipo == 'CALL':
                        if chg > 0: v_bull += vol
                        elif chg < 0: v_bear += vol
                    elif tipo == 'PUT':
                        if chg > 0: v_bear += vol
                        elif chg < 0: v_bull += vol
            bull_vols.append(v_bull)
            bear_vols.append(-v_bear)
        fig_flow = go.Figure()
        fig_flow.add_trace(go.Bar(x=strikes_ref, y=bull_vols, name='Fluxo Altista', marker_color='lime', opacity=0.7))
        fig_flow.add_trace(go.Bar(x=strikes_ref, y=bear_vols, name='Fluxo Baixista', marker_color='red', opacity=0.7))
        fig_flow.update_layout(barmode='relative', template='plotly_dark', xaxis_title='Strike', yaxis_title='Volume Estimado', shapes=[spot_line, hline0])
        save_panel(fig_flow, 'Flow_Sentiment.html', 'EDI &#8212; Flow Sentiment', {'Ajuda didática': ['Volume x Variação de Preço', 'Verde: Agressão de Compra', 'Vermelho: Agressão de Venda'], 'Exemplos de trade': ['Confirmar tendência com fluxo']})
    else:
        print("Skipping Flow Sentiment: 'Change' column missing.")
except Exception as e:
    print(f"Error generating Flow Sentiment: {e}")

# Atualizar metrics.json
try:
    with open('exports/metrics.json', 'r') as f:
        metrics = json.load(f)
    metrics['delta_flip'] = delta_flip if delta_flip is not None else None
    metrics['regime'] = regime
    
    # --- EDI: Injeção de Novas Métricas ---
    metrics['max_pain'] = float(max_pain) if 'max_pain' in globals() else None
    metrics['zero_gamma'] = float(zero_gamma_level) if 'zero_gamma_level' in globals() else None
    metrics['call_wall'] = float(call_wall) if 'call_wall' in globals() else None
    metrics['put_wall'] = float(put_wall) if 'put_wall' in globals() else None
    metrics['gamma_imbalance'] = float(gamma_imbalance) if 'gamma_imbalance' in globals() else 0.0
    # -------------------------------------- if 'regime' in globals() else None
    
    # Clima: Baseado no sinal do GEX Agregado total
    # Se GEX Total > 0 -> Estabilidade (Ímã). GEX Total < 0 -> Volatilidade (Repelente).
    gex_sum = float(np.sum(gex_tot))
    metrics['clima'] = 'Ímã (Estável)' if gex_sum > 0 else 'Repelente (Volátil)'
    if 'vanna_tot' in globals(): metrics['vanna_total'] = float(np.sum(vanna_tot))
    
    with open('exports/metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    print("metrics.json updated.")
except Exception as e:
    print(f"Error updating metrics.json: {e}")


# CELL 32
import numpy as np
import plotly.graph_objects as go
from scipy.stats import norm

def greeks(S, K, T, r, sigma, t):
    if S<=0 or K<=0 or T<=0 or sigma<=0: return np.nan, np.nan
    d1 = (np.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*np.sqrt(T))
    delta = norm.cdf(d1) if t=='C' else norm.cdf(d1) - 1
    gamma = norm.pdf(d1) / (S*sigma*np.sqrt(T))
    return delta, gamma

def compute_gamma_flip(strikes_arr, gex_cum_arr, spot):
    if len(strikes_arr)==0 or len(gex_cum_arr)==0: return float(spot)
    sg = np.sign(gex_cum_arr)
    idx = np.where(np.diff(sg)!=0)[0]
    if len(idx)>0:
        zgs=[]
        for i in idx:
            y1,y2=gex_cum_arr[i],gex_cum_arr[i+1]
            x1,x2=strikes_arr[i],strikes_arr[i+1]
            zgs.append(float(x1 if y2==y1 else x1 - y1*(x2-x1)/(y2-y1)))
        zgs=np.array(zgs,dtype=float)
        return float(zgs[np.argmin(np.abs(zgs - spot))])
    i=int(np.argmin(np.abs(gex_cum_arr)))
    return float(strikes_arr[i])

def compute_gamma_flip_hvl(strikes_arr,gex_arr,spot,hvl_daily,sigma_factor):
    if len(strikes_arr)==0 or len(gex_arr)==0: return None
    order=np.argsort(np.array(strikes_arr,dtype=float))
    ks=np.array(strikes_arr,dtype=float)[order]
    gex=np.array(gex_arr,dtype=float)[order]
    step=float(np.median(np.diff(ks))) if len(ks)>1 else 25.0
    sigma_pts=float(sigma_factor)*max(step*2.0,float(spot)*float(hvl_daily))
    w=np.exp(-((ks-float(spot))**2)/(2.0*(sigma_pts**2)))
    gex_cum_hvl=np.cumsum(gex*w)
    sg=np.sign(gex_cum_hvl)
    idx=np.where(np.diff(sg)!=0)[0]
    if len(idx)>0:
        j=int(np.argmin(np.abs(ks[idx]-float(spot))))
        i=idx[j]
        y1,y2=gex_cum_hvl[i],gex_cum_hvl[i+1]
        x1,x2=ks[i],ks[i+1]
        return float(x1 if y2==y1 else x1 - y1*(x2-x1)/(y2-y1))
    k_idx=int(np.argmin(np.abs(gex_cum_hvl)))
    return float(ks[k_idx])

def compute_gamma_flip_hvl_log(strikes_arr,gex_arr,spot,hvl_daily,sigma_factor):
    if len(strikes_arr)==0 or len(gex_arr)==0: return None
    order=np.argsort(np.array(strikes_arr,dtype=float))
    ks=np.array(strikes_arr,dtype=float)[order]
    gex=np.array(gex_arr,dtype=float)[order]
    sigma_m=float(hvl_daily)*float(sigma_factor)
    z=np.log(ks/float(spot))
    w=np.exp(-(z**2)/(2.0*(sigma_m**2)))
    gex_cum_log=np.cumsum(gex*w)
    sg=np.sign(gex_cum_log)
    idx=np.where(np.diff(sg)!=0)[0]
    if len(idx)>0:
        j=int(np.argmin(np.abs(ks[idx]-float(spot))))
        i=idx[j]
        y1,y2=gex_cum_log[i],gex_cum_log[i+1]
        x1,x2=ks[i],ks[i+1]
        return float(x1 if y2==y1 else x1 - y1*(x2-x1)/(y2-y1))
    k_idx=int(np.argmin(np.abs(gex_cum_log)))
    return float(ks[k_idx])

def compute_gamma_flip_hvl_window(strikes_arr,gex_arr,spot,hvl_daily,sigma_factor):
    if len(strikes_arr)==0 or len(gex_arr)==0: return None
    order=np.argsort(np.array(strikes_arr,dtype=float))
    ks_all=np.array(strikes_arr,dtype=float)[order]
    gex_all=np.array(gex_arr,dtype=float)[order]
    step=float(np.median(np.diff(ks_all))) if len(ks_all)>1 else 25.0
    W=float(sigma_factor)*max(step*2.0,float(spot)*float(hvl_daily))
    mask=(ks_all>=float(spot)-W) & (ks_all<=float(spot)+W)
    ks=ks_all[mask]; gex=gex_all[mask]
    if len(ks)<2: return None
    gex_cum=np.cumsum(gex)
    sg=np.sign(gex_cum)
    idx=np.where(np.diff(sg)!=0)[0]
    if len(idx)>0:
        j=int(np.argmin(np.abs(ks[idx]-float(spot))))
        i=idx[j]
        y1,y2=gex_cum[i],gex_cum[i+1]
        x1,x2=ks[i],ks[i+1]
        return float(x1 if y2==y1 else x1 - y1*(x2-x1)/(y2-y1))
    k_idx=int(np.argmin(np.abs(gex_cum)))
    return float(ks[k_idx])

gC,gP=[],[]
for K in strikes_ref:
    _,g=greeks(SPOT,K,T,RISK_FREE,IV_ANNUAL,'C'); gC.append(0 if np.isnan(g) else g)
    _,g=greeks(SPOT,K,T,RISK_FREE,IV_ANNUAL,'P'); gP.append(0 if np.isnan(g) else g)
gC,gP=np.array(gC),np.array(gP)

CONTRACT_MULT=float(CONTRACT_MULT)
gex_tot=gC*oi_call_ref*CONTRACT_MULT*SPOT*0.01 + gP*oi_put_ref*CONTRACT_MULT*SPOT*0.01

# --- EDI: Gamma Imbalance (Fluxo Financeiro de Hedge) ---
gamma_imbalance = np.sum(gex_tot)
# ------------------------------------------------------
gex_cum=np.cumsum(gex_tot)

sgn_call=np.where(strikes_ref<=SPOT,+1.0,-1.0)
sgn_put=np.where(strikes_ref>=SPOT,-1.0,+1.0)
gex_flip_base=(gC*oi_call_ref*sgn_call + gP*oi_put_ref*sgn_put)*CONTRACT_MULT*SPOT*0.01
gex_cum_signed=np.cumsum(gex_flip_base)

ivw=iv_strike_ref if 'iv_strike_ref' in globals() else np.ones_like(strikes_ref,dtype=float)
gex_flip_base_iv=gex_flip_base*ivw
gex_cum_signed_iv=np.cumsum(gex_flip_base_iv)

PVOP=float(PVOP) if 'PVOP' in globals() else float(CONTRACT_MULT)*float(SPOT)*0.01
gex_flip_base_pvop=(gC*oi_call_ref*sgn_call + gP*oi_put_ref*sgn_put)*PVOP
gex_cum_signed_pvop=np.cumsum(gex_flip_base_pvop)

# --- EDI EXTENSION START ---
def _d1(S, K, T, r, sigma):
    return (np.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*np.sqrt(T))
def _d2(S, K, T, r, sigma):
    return _d1(S, K, T, r, sigma) - sigma*np.sqrt(T)
def _bs_theta(S, K, T, r, sigma, type_='call'):
    d1 = _d1(S, K, T, r, sigma)
    d2 = _d2(S, K, T, r, sigma)
    term1 = - (S * norm.pdf(d1) * sigma) / (2 * np.sqrt(T))
    if type_ == 'call':
        term2 = - r * K * np.exp(-r*T) * norm.cdf(d2)
        return term1 + term2
    else:
        term2 = r * K * np.exp(-r*T) * norm.cdf(-d2)
        return term1 + term2
def _bs_gamma(S, K, T, r, sigma):
    d1 = _d1(S, K, T, r, sigma)
    return norm.pdf(d1) / (S * sigma * np.sqrt(T))

def _bs_delta(S, K, T, r, sigma, type_='call'):
    d1 = _d1(S, K, T, r, sigma)
    if type_ == 'call': return norm.cdf(d1)
    else: return norm.cdf(d1) - 1
theta_calls, theta_puts = [], []
for K in strikes_ref:
    theta_calls.append(_bs_theta(SPOT, K, T, RISK_FREE, IV_ANNUAL, 'call'))
    theta_puts.append(_bs_theta(SPOT, K, T, RISK_FREE, IV_ANNUAL, 'put'))
theta_calls = np.array(theta_calls)
theta_puts = np.array(theta_puts)

# Calculate Delta Tot/Cum explicitly to ensure availability for plots
d_calls_g = [_bs_delta(SPOT, K, T, RISK_FREE, IV_ANNUAL, 'call') for K in strikes_ref]
d_puts_g = [_bs_delta(SPOT, K, T, RISK_FREE, IV_ANNUAL, 'put') for K in strikes_ref]
delta_tot = np.array(d_calls_g)*oi_call_ref + np.array(d_puts_g)*oi_put_ref
delta_cum = np.cumsum(delta_tot)
theta_tot = (theta_calls * oi_call_ref + theta_puts * oi_put_ref) * CONTRACT_MULT
spots_sim = np.linspace(SPOT * 0.85, SPOT * 1.15, 50)
deltas_sim, delta_flip_val = [], None
for s_sim in spots_sim:
    d_calls_sim = [_bs_delta(s_sim, K, T, RISK_FREE, IV_ANNUAL, 'call') for K in strikes_ref]
    d_puts_sim = [_bs_delta(s_sim, K, T, RISK_FREE, IV_ANNUAL, 'put') for K in strikes_ref]
    net_delta = np.sum(np.array(d_calls_sim) * oi_call_ref + np.array(d_puts_sim) * oi_put_ref)
    deltas_sim.append(net_delta)
deltas_sim = np.array(deltas_sim)
cross_idx = np.where(np.diff(np.sign(deltas_sim)))[0]
if len(cross_idx) > 0:
    idx = cross_idx[0]
    y1, y2 = deltas_sim[idx], deltas_sim[idx+1]
    x1, x2 = spots_sim[idx], spots_sim[idx+1]
    delta_flip_val = x1 - y1 * (x2 - x1) / (y2 - y1)
else:
    delta_flip_val = spots_sim[np.argmin(np.abs(deltas_sim))]
import json, os, re
try:
    _metrics_path = 'exports/metrics.json'
    if os.path.exists(_metrics_path): 
        with open(_metrics_path, 'r') as f: _mdata = json.load(f)
    else: _mdata = {}
    _mdata['delta_flip'] = float(delta_flip_val)
    with open(_metrics_path, 'w') as f: json.dump(_mdata, f, indent=2)
except Exception as e: print(f'Error metrics: {e}')
def _save_panel_ext(fig, filename, title, help_key=None):
    if not os.path.exists('exports'): os.makedirs('exports')
    html = fig.to_html(include_plotlyjs='cdn', full_html=True)
    html = re.sub(r'<title>.*?</title>', f'<title>EDI &#8212; {title}</title>', html, flags=re.S)
    if 'inject_home' in globals(): html = inject_home(html)
    if 'inject_help_ext' in globals() and help_key: html = html.replace('</body>', '<script src="help.js"></script></body>')
    with open(f'exports/{filename}.html', 'w', encoding='utf-8') as f: f.write(html)
    try:
        fig_thumb = go.Figure(fig)
        fig_thumb.update_layout(title=None,xaxis=dict(visible=False),yaxis=dict(visible=False),margin=dict(l=0,r=0,t=0,b=0),showlegend=False,paper_bgcolor='rgba(0,0,0,0)',plot_bgcolor='rgba(0,0,0,0)')
        fig_thumb.write_image(f'exports/{filename}.svg', width=300, height=160)
    except Exception as e: print(f'Thumb error {filename}: {e}')
_modes = [('Delta_Agregado', 'Delta Agregado', 'Delta & GEX'),('Delta_Acumulado', 'Delta Acumulado', 'Delta & GEX'),('Gamma_Exposure', 'Gamma Exposure', 'Delta & GEX'),('OI_Strike', 'Open Interest por Strike', 'Open Interest por Strike'),('Charm_Exposure', 'Charm Exposure', 'Charm Flow'),('Vanna_Exposure', 'Vanna Exposure', 'Vanna Sensitivity'),('Theta_Exposure', 'Theta Exposure', 'Theta Exposure'),('Delta_Flip_Profile', 'Delta Flip Profile', 'GEX & Flip'),('Gamma_Flip_Cone', 'Gamma Flip Cone', 'GEX & Flip'),('Gamma_Flip_Analysis', 'Gamma Flip Analysis', 'GEX & Flip'),('Gamma_Exposure_Curve', 'Gamma Exposure Curve', 'Delta & GEX'),('Flow_Sentiment', 'Flow Sentiment', 'Charm Flow'),('Fluxo_Hedge', 'Fluxo Hedge', 'Delta & GEX'),('Dealer_Pressure', 'Dealer Pressure', 'Delta & GEX'),('Expiry_Pressure', 'Expiry Pressure', 'Theta Exposure'),('Charm_Flow', 'Charm Flow', 'Charm Flow'),('Vanna_Sensitivity', 'Vanna Sensitivity', 'Vanna Sensitivity'),('Pin_Risk', 'Pin Risk', 'Open Interest por Strike'),('Rails_Bounce', 'Rails Bounce', 'GEX & Flip'),('Figura3', 'Figura 3', 'GEX & Flip'),('Figura4', 'Figura 4', 'GEX & Flip')]
for mode_file, mode_title, help_key in _modes:
    fig_m = go.Figure()
    if mode_file == 'Gamma_Exposure': fig_m.add_trace(go.Bar(x=strikes_ref, y=gex_tot, name='Gamma Exposure', marker_color='#3b82f6'))
    elif mode_file == 'OI_Strike': 
        fig_m.add_trace(go.Bar(x=strikes_ref, y=oi_call_ref, name='CALL OI', marker_color='lime'))
        fig_m.add_trace(go.Bar(x=strikes_ref, y=-np.array(oi_put_ref), name='PUT OI', marker_color='red'))
    elif mode_file == 'Charm_Exposure': fig_m.add_trace(go.Bar(x=strikes_ref, y=charm_tot, name='Charm', marker_color='magenta'))
    elif mode_file == 'Vanna_Exposure':
        fig_m.add_trace(go.Bar(x=strikes_ref, y=vanna_tot, name='Vanna', marker_color='purple'))
        if 'vanna_cum' not in globals() and 'vanna_tot' in globals(): vanna_cum = np.cumsum(vanna_tot)
        if 'vanna_cum' in globals(): fig_m.add_trace(go.Scatter(x=strikes_ref, y=vanna_cum, mode='lines', name='Vanna Acumulado', line=dict(color='white', width=2)))
    elif mode_file == 'Theta_Exposure': fig_m.add_trace(go.Bar(x=strikes_ref, y=theta_tot, name='Theta', marker_color='#fbbf24'))
    elif mode_file == 'Delta_Flip_Profile':
        fig_m.add_trace(go.Scatter(x=spots_sim, y=deltas_sim, mode='lines', name='Delta Profile', line=dict(color='white')))
        fig_m.add_vline(x=delta_flip_val, line_dash='dash', line_color='yellow', annotation_text='Flip')
        fig_m.add_vline(x=SPOT, line_dash='dot', line_color='lime', annotation_text='Spot')
    elif mode_file == 'Delta_Agregado':
        _d_calls = [_bs_delta(SPOT, K, T, RISK_FREE, IV_ANNUAL, 'call') for K in strikes_ref]
        _d_puts = [_bs_delta(SPOT, K, T, RISK_FREE, IV_ANNUAL, 'put') for K in strikes_ref]
        _delta_tot = np.array(_d_calls)*oi_call_ref + np.array(_d_puts)*oi_put_ref
        fig_m.add_trace(go.Bar(x=strikes_ref, y=_delta_tot, name='Delta', marker_color='cyan'))
    elif mode_file == 'Delta_Acumulado':
        _d_calls = [_bs_delta(SPOT, K, T, RISK_FREE, IV_ANNUAL, 'call') for K in strikes_ref]
        _d_puts = [_bs_delta(SPOT, K, T, RISK_FREE, IV_ANNUAL, 'put') for K in strikes_ref]
        _delta_tot = np.array(_d_calls)*oi_call_ref + np.array(_d_puts)*oi_put_ref
        _delta_cum = np.cumsum(_delta_tot)
        fig_m.add_trace(go.Scatter(x=strikes_ref, y=_delta_cum, name='Delta Acumulado', line=dict(color='cyan')))
    elif mode_file == 'Flow_Sentiment':
        if '_plot_flow_sentiment' in globals(): fig_m = _plot_flow_sentiment()
    elif mode_file == 'Gamma_Flip_Analysis':
        if 'fig4' in globals(): fig_m = fig4
    elif mode_file == 'Figura3':
        if 'fig3' in globals(): fig_m = fig3
    elif mode_file == 'Figura4':
        if 'fig4' in globals(): fig_m = fig4
    fig_m.update_layout(template='plotly_dark', title=mode_title, xaxis_title='Strike' if mode_file != 'Delta_Flip_Profile' else 'Spot Price')
    if mode_file != 'Delta_Flip_Profile': fig_m.add_vline(x=SPOT, line_dash='dot', line_color='lime')
    _save_panel_ext(fig_m, mode_file, mode_title, help_key)
    # --- EDI FIX: Re-inject tables for Figura3 and Gamma_Flip_Analysis ---
    if mode_file == 'Figura3' and 'fig_vals3' in globals():
        try:
            with open(f'exports/{mode_file}.html', 'r', encoding='utf-8') as f: html_content = f.read()
            tbl_div = fig_vals3.to_html(include_plotlyjs=False, full_html=False)
            html_content = html_content.replace('</body>', f'<div style="margin-top:20px;border-top:1px solid #333;padding-top:20px">{tbl_div}</div></body>')
            with open(f'exports/{mode_file}.html', 'w', encoding='utf-8') as f: f.write(html_content)
            print(f"Re-injected table into {mode_file}.html")
        except Exception as e: print(f"Error appending table to {mode_file}: {e}")
    elif mode_file == 'Gamma_Flip_Analysis' and 'fig_vals4' in globals():
        try:
            with open(f'exports/{mode_file}.html', 'r', encoding='utf-8') as f: html_content = f.read()
            tbl_div = fig_vals4.to_html(include_plotlyjs=False, full_html=False)
            html_content = html_content.replace('</body>', f'<div style="max-width:1200px;margin:20px auto">{tbl_div}</div></body>')
            # Inject help text as well if needed
            flip_help = ['<b>Clássico:</b> Interpolação linear (Gamma acumulado=0).','<b>Spline:</b> Suavização cúbica.','<b>HVL:</b> Ajuste por Vol Histórica.','<b>Sigma Kernel:</b> Ponderação por IV.','<b>PVOP:</b> Ponderado por Put Volume.']
            if 'inject_help' in globals(): html_content = inject_help(html_content, 'Legenda dos Modelos', flip_help)
            with open(f'exports/{mode_file}.html', 'w', encoding='utf-8') as f: f.write(html_content)
            print(f"Re-injected table into {mode_file}.html")
        except Exception as e: print(f"Error appending table to {mode_file}: {e}")
    # -------------------------------------------------------------------
    # Export High Quality PNG for Print
    try:
        print_dir = os.path.join('exports', 'print')
        if not os.path.exists(print_dir): os.makedirs(print_dir)
        fig_m.write_image(os.path.join(print_dir, f"{mode_file}.svg"), width=1920, height=1080, scale=2)
    except Exception as e:
        print(f"Erro ao salvar PNG para {mode_file}: {e}")
# --- EDI EXTENSION END ---

HVL_DAILY=float(HVL_ANNUAL)/np.sqrt(252)
min_k,max_k=float(np.min(strikes_ref)),float(np.max(strikes_ref))

fig4=go.Figure()
fig4.add_trace(go.Bar(x=strikes_ref,y=gex_flip_base,name='Gamma Exposure (assinado)',marker_color='cyan',opacity=0.6,visible=True,hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))
fig4.add_trace(go.Scatter(x=strikes_ref,y=gex_cum_signed,mode='lines',name='Acumulado (assinado)',line=dict(color='orange',width=3),visible=True,hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))
fig4.add_trace(go.Bar(x=strikes_ref,y=gex_tot,name='Gamma Exposure (tot)',marker_color='lightblue',opacity=0.4,visible=False,hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))
fig4.add_trace(go.Scatter(x=strikes_ref,y=gex_cum,mode='lines',name='Acumulado (tot)',line=dict(color='yellow',width=2),visible=False,hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))
fig4.add_trace(go.Bar(x=strikes_ref,y=gex_flip_base_iv,name='Gamma Exposure (assinado IV)',marker_color='purple',opacity=0.6,visible=False,hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))
fig4.add_trace(go.Scatter(x=strikes_ref,y=gex_cum_signed_iv,mode='lines',name='Acumulado (assinado IV)',line=dict(color='violet',width=3),visible=False,hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))
fig4.add_trace(go.Bar(x=strikes_ref,y=gex_flip_base_pvop,name='Gamma Exposure (assinado PVOP)',marker_color='teal',opacity=0.6,visible=False,hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))
fig4.add_trace(go.Scatter(x=strikes_ref,y=gex_cum_signed_pvop,mode='lines',name='Acumulado (assinado PVOP)',line=dict(color='lightgreen',width=3),visible=False,hovertemplate='Strike %{x:.0f}<br>Valor %{y:.0f}'))

fig4.update_layout(template='plotly_dark',barmode='overlay',
                   xaxis_title='Strike',yaxis_title='Exposição (normalizada)',
                   xaxis=dict(range=[SPOT-300,SPOT+300]),
                   legend=dict(orientation='h', yanchor='top', y=-0.15, xanchor='center', x=0.5),
                   margin=dict(t=100))
spot_line4=dict(type='line',x0=float(SPOT),x1=float(SPOT),y0=0,y1=1,xref='x',yref='paper',line=dict(color='lime',dash='dot',width=2))
hline04=dict(type='line',x0=float(min_k),x1=float(max_k),y0=0,y1=0,line=dict(color='white',dash='dot',width=1))

flip_classic=compute_gamma_flip(np.array(strikes_ref,dtype=float),np.array(gex_cum_signed,dtype=float),float(SPOT))
flip_classic_spl=zero_cross_spline(np.array(strikes_ref,dtype=float),np.array(gex_cum_signed,dtype=float),float(SPOT))
flip_hvl_pts=compute_gamma_flip_hvl(np.array(strikes_ref,dtype=float),np.array(gex_flip_base,dtype=float),float(SPOT),float(HVL_DAILY),float(SIGMA_FACTOR))
flip_hvl_log=compute_gamma_flip_hvl_log(np.array(strikes_ref,dtype=float),np.array(gex_flip_base,dtype=float),float(SPOT),float(HVL_DAILY),float(SIGMA_FACTOR))
flip_hvl_win=compute_gamma_flip_hvl_window(np.array(strikes_ref,dtype=float),np.array(gex_flip_base,dtype=float),float(SPOT),float(HVL_DAILY),float(SIGMA_FACTOR))
flip_hvl_log_iv=compute_gamma_flip_hvl_log(np.array(strikes_ref,dtype=float),np.array(gex_flip_base_iv,dtype=float),float(SPOT),float(HVL_DAILY),float(SIGMA_FACTOR))
flip_sigma_kernel=compute_gamma_flip_sigma_kernel(np.array(strikes_ref,dtype=float),np.array(gex_flip_base,dtype=float),float(SPOT),np.array(ivw,dtype=float),float(T),float(SIGMA_FACTOR))
flip_topn=compute_gamma_flip_topn(np.array(strikes_ref,dtype=float),np.array(gex_flip_base,dtype=float),np.array(oi_call_ref,dtype=float),np.array(oi_put_ref,dtype=float),int(top_n) if 'top_n' in globals() else 3,float(SPOT))

flip_lines4=[]; flip_annos4=[]
def add_flip(shape_list,anno_list,x,color,text,y):
    if x is None: return
    shape_list.append(dict(type='line',x0=float(x),x1=float(x),y0=0,y1=1,xref='x',yref='paper',line=dict(color=color,dash='dash',width=2)))
    anno_list.append(dict(x=float(x),y=y,xref='x',yref='paper',text=text,showarrow=False,font=dict(color=color,size=12),bgcolor='black',bordercolor=color))
add_flip(flip_lines4,flip_annos4,flip_classic,'red','Flip (clássico)',0.06)
add_flip(flip_lines4,flip_annos4,flip_classic_spl,'tomato','Flip (clássico spline)',0.08)
add_flip(flip_lines4,flip_annos4,flip_hvl_pts,'fuchsia','Flip (HVL pontos)',0.10)
add_flip(flip_lines4,flip_annos4,flip_hvl_log,'deeppink','Flip (HVL log)',0.14)
add_flip(flip_lines4,flip_annos4,flip_hvl_log_iv,'purple','Flip (HVL log IV)',0.16)
add_flip(flip_lines4,flip_annos4,flip_sigma_kernel,'orange','Flip (Sigma kernel)',0.18)
add_flip(flip_lines4,flip_annos4,flip_topn,'steelblue','Flip (Top-N OI)',0.20)
add_flip(flip_lines4,flip_annos4,flip_hvl_win,'magenta','Flip (HVL janela)',0.18)

SIGMA_PRESETS=[0.50,0.75,1.00]
preset_shapes={}; preset_annos={}
for sf in SIGMA_PRESETS:
    fhp=compute_gamma_flip_hvl(np.array(strikes_ref,dtype=float),np.array(gex_flip_base,dtype=float),float(SPOT),float(HVL_DAILY),float(sf))
    fhl=compute_gamma_flip_hvl_log(np.array(strikes_ref,dtype=float),np.array(gex_flip_base,dtype=float),float(SPOT),float(HVL_DAILY),float(sf))
    fhw=compute_gamma_flip_hvl_window(np.array(strikes_ref,dtype=float),np.array(gex_flip_base,dtype=float),float(SPOT),float(HVL_DAILY),float(sf))
    fhl_iv=compute_gamma_flip_hvl_log(np.array(strikes_ref,dtype=float),np.array(gex_flip_base_iv,dtype=float),float(SPOT),float(HVL_DAILY),float(sf))
    fsk=compute_gamma_flip_sigma_kernel(np.array(strikes_ref,dtype=float),np.array(gex_flip_base,dtype=float),float(SPOT),np.array(ivw,dtype=float),float(T),float(sf))
    shps=[]; ann=[]
    add_flip(shps,ann,flip_classic,'red','Flip (clássico)',0.06)
    add_flip(shps,ann,fhp,'fuchsia',f'Flip (HVL pontos sf={sf:.2f})',0.10)
    add_flip(shps,ann,fhl,'deeppink',f'Flip (HVL log sf={sf:.2f})',0.14)
    add_flip(shps,ann,fhl_iv,'purple',f'Flip (HVL log IV sf={sf:.2f})', 0.16)
    add_flip(shps,ann,fsk,'orange',f'Flip (Sigma kernel sf={sf:.2f})', 0.18)
    add_flip(shps,ann,fhw,'magenta',f'Flip (HVL janela sf={sf:.2f})', 0.20)
    preset_shapes[sf]=shps; preset_annos[sf]=ann

flip_classic_pv=compute_gamma_flip(np.array(strikes_ref,dtype=float),np.array(gex_cum_signed_pvop,dtype=float),float(SPOT))
flip_hvl_pts_pv=compute_gamma_flip_hvl(np.array(strikes_ref,dtype=float),np.array(gex_flip_base_pvop,dtype=float),float(SPOT),float(HVL_DAILY),float(SIGMA_FACTOR))
flip_hvl_log_pv=compute_gamma_flip_hvl_log(np.array(strikes_ref,dtype=float),np.array(gex_flip_base_pvop,dtype=float),float(SPOT),float(HVL_DAILY),float(SIGMA_FACTOR))
flip_hvl_win_pv=compute_gamma_flip_hvl_window(np.array(strikes_ref,dtype=float),np.array(gex_flip_base_pvop,dtype=float),float(SPOT),float(HVL_DAILY),float(SIGMA_FACTOR))
pvop_shapes=[]; pvop_annos=[]
add_flip(pvop_shapes,pvop_annos,flip_classic_pv,'red','Flip (clássico PVOP)',0.06)
add_flip(pvop_shapes,pvop_annos,flip_hvl_pts_pv,'fuchsia','Flip (HVL pontos PVOP)',0.10)
add_flip(pvop_shapes,pvop_annos,flip_hvl_log_pv,'deeppink','Flip (HVL log PVOP)',0.14)
add_flip(pvop_shapes,pvop_annos,flip_hvl_win_pv,'magenta','Flip (HVL janela PVOP)',0.18)

buttons_fig4=[
    dict(label='Assinado + flips',method='relayout',args=[{'shapes':[spot_line4,hline04]+flip_lines4,'annotations':flip_annos4}]),
    dict(label='Assinado + flips (sf=0.50)',method='relayout',args=[{'shapes':[spot_line4,hline04]+preset_shapes[0.50],'annotations':preset_annos[0.50]}]),
    dict(label='Assinado + flips (sf=0.75)',method='relayout',args=[{'shapes':[spot_line4,hline04]+preset_shapes[0.75],'annotations':preset_annos[0.75]}]),
    dict(label='Assinado + flips (sf=1.00)',method='relayout',args=[{'shapes':[spot_line4,hline04]+preset_shapes[1.00],'annotations':preset_annos[1.00]}]),
    dict(label='Assinado + flips (PVOP)',method='update',args=[{'visible':[False,False,False,False,False,False,True,True]},{'shapes':[spot_line4,hline04]+pvop_shapes,'annotations':pvop_annos}]),
    dict(label='Assinado apenas',method='update',args=[{'visible':[True,True,False,False,False,False,False,False]},{'shapes':[spot_line4,hline04],'annotations':[]}]),
    dict(label='Assinado apenas (PVOP)',method='update',args=[{'visible':[False,False,False,False,False,False,True,True]},{'shapes':[spot_line4,hline04],'annotations':[]}]),
    dict(label='Tot + cumulativo',method='update',args=[{'visible':[False,False,True,True,False,False,False,False]},{'shapes':[spot_line4,hline04],'annotations':[]}]),
]
fig4.update_layout(updatemenus=[dict(type='dropdown',direction='down',showactive=True,active=0,x=1.00,y=1.25,xanchor='right',yanchor='top',buttons=buttons_fig4,bgcolor='rgba(30,30,30,0.95)',bordercolor='#444',borderwidth=1,font=dict(color='#e5e7eb',size=12),pad=dict(t=4,r=4,b=4,l=4))])
fig4.update_layout(title=dict(text='EDI &#8212; GEX & Gamma Flip (Modelos)',font=dict(color='white',size=18),x=0.5),height=650,margin=dict(t=110))
fig4.show()

items4=['Flip (clássico)','Flip (clássico spline)','Flip (HVL pontos)','Flip (HVL log)','Flip (HVL log IV)','Flip (HVL janela)','Flip (Sigma kernel)','Flip (Top-N OI)','Flip (clássico PVOP)','Flip (HVL pontos PVOP)','Flip (HVL log PVOP)','Flip (HVL janela PVOP)']
values4=[(f'{flip_classic:.0f}' if flip_classic is not None else 'N/A'),
         (f'{flip_classic_spl:.0f}' if flip_classic_spl is not None else 'N/A'),
         (f'{flip_hvl_pts:.0f}' if flip_hvl_pts is not None else 'N/A'),
         (f'{flip_hvl_log:.0f}' if flip_hvl_log is not None else 'N/A'),
         (f'{flip_hvl_log_iv:.0f}' if flip_hvl_log_iv is not None else 'N/A'),
         (f'{flip_hvl_win:.0f}' if flip_hvl_win is not None else 'N/A'),
         (f'{flip_sigma_kernel:.0f}' if flip_sigma_kernel is not None else 'N/A'),
         (f'{flip_topn:.0f}' if flip_topn is not None else 'N/A'),
         (f'{flip_classic_pv:.0f}' if flip_classic_pv is not None else 'N/A'),
         (f'{flip_hvl_pts_pv:.0f}' if flip_hvl_pts_pv is not None else 'N/A'),
         (f'{flip_hvl_log_pv:.0f}' if flip_hvl_log_pv is not None else 'N/A'),
         (f'{flip_hvl_win_pv:.0f}' if flip_hvl_win_pv is not None else 'N/A')]

methodologies = [
    'Acumulação simples de GEX (Soma de Call/Put)',
    'Suavização cúbica sobre GEX acumulado',
    'Ponderado pela Volatilidade Histórica (Pontos)',
    'Distribuição Log-Normal ponderada por HVL',
    'Log-Normal ajustada por IV local',
    'Janela deslizante baseada na Volatilidade',
    'Suavização por Kernel Gaussiano',
    'Considera apenas os N maiores contratos',
    'Clássico ponderado por Volume de Put',
    'HVL Pontos ponderado por Put Volume',
    'HVL Log ponderado por Put Volume',
    'Janela HVL ponderada por Put Volume'
]

interpretations = [
    'Ponto de equilíbrio zero baseado no OI atual',
    'Reduz ruído de strikes discretos',
    'Ajustado pelo risco recente do ativo',
    'Melhor para capturar Skew/Caudas longas',
    'Sensível à expectativa de volatilidade futura',
    'Foco na liquidez local ao redor do Spot',
    'Remove ruído de strikes ilíquidos',
    'Onde as "Baleias" estão posicionadas',
    'Foco em proteção (Put Heavy)',
    'Risco ajustado por pressão de venda',
    'Skew de baixa com peso de volume',
    'Liquidez local de proteção'
]

fig_vals4=go.Figure(data=[go.Table(
    columnorder=[1,2,3,4],
    columnwidth=[200,100,250,250],
    header=dict(values=['<b>Modelo</b>','<b>Valor (R$)</b>','<b>Metodologia</b>','<b>Interpretação</b>'],
                fill_color='darkslategray',
                align=['left','center','left','left'],
                font=dict(color='white',size=13)),
    cells=dict(values=[items4,values4,methodologies,interpretations],
               fill_color='rgba(20,20,20,0.9)',
               align=['left','center','left','left'],
               font=dict(color='white',size=12),
               height=25))
])
fig_vals4.update_layout(title='Quadro Comparativo de Flips', template='plotly_dark',height=500,margin=dict(t=50,b=20))
fig_vals4.show()

# --- EDI FIX: Save Gamma Flip Analysis ---
try:
    html_flip = fig4.to_html(include_plotlyjs='cdn', full_html=True)
    html_flip = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Gamma Flip Analysis</title>', html_flip, flags=re.S)
    if 'inject_home' in globals(): html_flip = inject_home(html_flip)
    tbl_div = fig_vals4.to_html(include_plotlyjs=False, full_html=False)
    html_flip = html_flip.replace('</body>', f'<div style="max-width:1200px;margin:20px auto">{tbl_div}</div></body>')
    flip_help = ['<b>Clássico:</b> Interpolação linear (Gamma acumulado=0).','<b>Spline:</b> Suavização cúbica.','<b>HVL:</b> Ajuste por Vol Histórica.','<b>Sigma Kernel:</b> Ponderação por IV.','<b>PVOP:</b> Ponderado por Put Volume.']
    if 'inject_help' in globals(): html_flip = inject_help(html_flip, 'Legenda dos Modelos', flip_help)
    with open('exports/Gamma_Flip_Analysis.html', 'w', encoding='utf-8') as f: f.write(html_flip)
    print("Gamma_Flip_Analysis.html saved.")
except Exception as e: print(f"Error saving Gamma Flip: {e}")
# --- END FIX ---

# Interface — Botão flutuante para copiar código do Profit
import json
from IPython.display import HTML, display
btn_html = f"""
<div id="profitCopyBar" style="position:fixed; top:12px; right:12px; background:#111827; padding:10px 12px; border:1px solid #374151; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.35); z-index:9999;">
  <span style="color:#e5e7eb; font-size:14px; margin-right:8px;">Copiar código para o Profit</span>
  <button id="copyProfitBtn" style="padding:6px 10px; background:#2563eb; color:white; border:0; border-radius:6px; cursor:pointer;">Copiar</button>
</div>
<script>
  const profitScript = """ + json.dumps(output_script) + """;
  const btn = document.getElementById('copyProfitBtn');
  if (btn) {
    btn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(profitScript);
        alert('Código copiado para a área de transferência.');
      } catch (e) {
        console.log(e);
        alert('Falha ao copiar automaticamente. O código será exibido abaixo para copiar manualmente.');
        const ta = document.getElementById('profitTextarea');
        if (ta) { ta.value = profitScript; ta.style.display = 'block'; ta.select(); document.execCommand('copy'); }
      }
    };
  }
</script>
<textarea id="profitTextarea" style="display:none; width:100%; height:140px; margin-top:8px; background:#0b1020; color:#e5e7eb; border:1px solid #374151; border-radius:6px;"></textarea>
"""
display(HTML(btn_html))

import os, json, re
def inject_home(html):
    nav = (
        '<div style="position:fixed;top:0;left:0;width:100%;background:#111827;display:flex;justify-content:space-between;align-items:center;'+
        'border-bottom:1px solid #374151;padding:8px 12px;z-index:9999">'+
        '<div><a href="index.html" style="color:#93c5fd;text-decoration:none;font-weight:600">&#8592; Home</a></div>'+
        '<button id="menuBtn" style="position:absolute;left:50%;transform:translateX(-50%);background:#1f2937;color:#e5e7eb;border:1px solid #374151;border-radius:6px;padding:6px 10px">Menu</button>'+
        '</div>'+
        '<div id="topmenu" style="position:fixed;top:42px;left:0;right:0;margin:0 8px;background:#111827;border-bottom:1px solid #374151;padding:8px 12px;display:none;opacity:0;transform:translateY(-4px);transition:opacity .2s ease,transform .2s ease;z-index:9999">'+
        '<div style="display:flex;flex-wrap:wrap;gap:12px;font-size:14px">'+
        '<a href="Figura3.html" style="color:#9ca3af">Delta & GEX</a>'+
        '<a href="Figura4.html" style="color:#9ca3af">GEX & Flip</a>'+
        '<a href="Fluxo_Hedge.html" style="color:#9ca3af">Fluxo Hedge</a>'+
        '<a href="Dealer_Pressure.html" style="color:#9ca3af">Dealer Pressure</a>'+
        '<a href="Gamma_Flip_Cone.html" style="color:#9ca3af">Flip Cone</a>'+
        '<a href="Charm_Flow.html" style="color:#9ca3af">Charm</a>'+
        '<a href="Vanna_Sensitivity.html" style="color:#9ca3af">Vanna</a>'+
        '<a href="Pin_Risk.html" style="color:#9ca3af">Pin Risk</a>'+
        '<a href="Rails_Bounce.html" style="color:#9ca3af">Rails</a>'+
        '<a href="Expiry_Pressure.html" style="color:#9ca3af">Expiry</a>'+
        '<a href="Gamma_Exposure_Curve.html" style="color:#9ca3af">Exposure Curve</a>'+
        '</div></div>'+
        '<script>(function(){var b=document.getElementById("menuBtn"); if(b){b.onclick=function(){var m=document.getElementById("topmenu"); if(m){if(m.style.display==="none"||m.style.display===""){m.style.display="block"; requestAnimationFrame(function(){m.style.opacity=1; m.style.transform="translateY(0)";});} else {m.style.opacity=0; m.style.transform="translateY(-4px)"; setTimeout(function(){m.style.display="none";},200);}}}}})();</script>'+
        '<div style="height:66px"></div>'
    )
    return re.sub(r'<body[^>]*>', lambda m: m.group(0)+nav, html, flags=re.S)
def placeholder_html(title):
    return '''<!doctype html><html><head><meta charset="utf-8"><title>'''+str(title)+'''</title></head><body></body></html>'''
def inject_insights(html, heading, items):
    return html
def inject_help_ext(html):
    try:
        mapping = json.dumps({
            'Open Interest por Strike': {
                'Ajuda didática': ['Leitura de OI por strike','Cores: CALL/PUT e acumulado','Clusters e mudanças de interesse'],
                'Exemplos de trade': ['Operar direção do aumento de OI','Evitar OI disperso','Combinar com flip/magneto'],
                'Alertas de risco': ['Atraso de OI','Falsos movimentos em baixa liquidez','Mudanças de série']
            },
            'Delta & GEX': {
                'Ajuda didática': ['Delta agregado e GEX','SPOT e zero gamma','GEX+: amortecer, GEX-: amplificar'],
                'Exemplos de trade': ['Comprar suporte com GEX+','Vender resistência com GEX+','Evitar contra‑tendência em GEX-'],
                'Alertas de risco': ['Regime muda no vencimento','Spikes de IV','Baixa liquidez']
            },
            'GEX & Flip': {
                'Ajuda didática': ['Modelos de Gamma Flip','Mistura α (0=OI,1=VOL)','Sensibilidade do flip à VOL'],
                'Exemplos de trade': ['Ajustar alvo por α','Reversão no cruzamento do SPOT','Usar α médio como baseline'],
                'Alertas de risco': ['Eventos aumentam peso de VOL','Mix muda por série','Dados incompletos']
            },
            'Fluxo Hedge': {
                'Ajuda didática': ['Fluxo vs ΔS','Slider para choques','Fricção por |fluxo|'],
                'Exemplos de trade': ['Evitar contra picos','Entrar pós dissipação','Scalp em baixo fluxo'],
                'Alertas de risco': ['Slippage em choques','Rebalanceio intradiário','Delta‑hedge altera microestrutura']
            },
            'Dealer Pressure': {
                'Ajuda didática': ['|gamma|, OI e distância','Picos de pressão','Modos balanced/gamma/distance'],
                'Exemplos de trade': ['Balanced para swing','Gamma para tático','Distance para alvo amplo'],
                'Alertas de risco': ['Pressão migra com SPOT','Maturidade altera pesos','OI defasado']
            },
            'Gamma Flip Cone': {
                'Ajuda didática': ['Flip vs OI/VOL','Robustez do flip','Leitura de dispersão'],
                'Exemplos de trade': ['Operar regime estável','Evitar cone disperso','Confirmar com GEX agregado'],
                'Alertas de risco': ['Sensível à IV','Eventos deslocam cone','Iliquidez gera ruído']
            },
            'Charm Flow': {
                'Ajuda didática': ['Charm por strike','Decaimento de tempo','Janelas por vencimento'],
                'Exemplos de trade': ['Operar desacelerações','Evitar rolagem contra fluxo','Combinar com vencimentos'],
                'Alertas de risco': ['Não linear perto do vencimento','Book altera charm','Shifts de IV']
            },
            'Vanna': {
                'Ajuda didática': ['ΔΔ vs ΔIV','Slider para cenários','Inclinação = sensibilidade'],
                'Exemplos de trade': ['Ajustar risco à ΔIV','Hedge quando sobe','Selecionar tenores'],
                'Alertas de risco': ['ΔIV elevado','Skew altera resposta','IV com atraso']
            },
            'Pin Risk': {
                'Ajuda didática': ['Score: OI, |gamma|, distância','Picos ~ probabilidade de pin','Curto prazo'],
                'Exemplos de trade': ['Aproximação controlada','Evitar contra magneto','Fechar antes do vencimento'],
                'Alertas de risco': ['Gaps','Intervenções quebram magneto','Mudanças tardias de OI']
            },
            'Rails & Bounce': {
                'Ajuda didática': ['Curvatura/acúmulo de GEX','Range, walls, zero gamma','Zonas operacionais'],
                'Exemplos de trade': ['Comprar rails inferiores','Vender rails superiores','Scalp em bounce'],
                'Alertas de risco': ['Rails movem com dados','Breakouts anulam bounce','Baixa liquidez amplia ranges']
            },
            'Expiry Pressure': {
                'Ajuda didática': ['Short/Mid/Long','Magnetização no vencimento','Ponderação por tempo'],
                'Exemplos de trade': ['Magneto short','Evitar contra pressões mid/long','Sincronizar rolagem'],
                'Alertas de risco': ['bdays','Rolagem desloca pressão','Dias não úteis']
            },
    'Flow_Sentiment': {
                'Ajuda didática': ['Barras Verdes=Touro','Barras Vermelhas=Urso','Confirmação de tendência'],
                'Exemplos de trade': ['Compra se verde crescente','Cuidado se divergência','Fluxo vs Preço'],
                'Alertas de risco': ['Volume sem deslocamento','Exaustão','Dados atrasados']
            },

            'Exposure Curve': {
                'Ajuda didática': ['Área verde/vermelha','SPOT e flip','Transições de sinal'],
                'Exemplos de trade': ['Evitar contra sinal','Buscar transição','Flip como pivô'],
                'Alertas de risco': ['Inversão intradiária','Agregação oculta clusters','Dados incompletos']
            }
        })
        script = ''
        return html.replace('</body>', script+'</body>')
    except Exception:
        return html
def inject_help(html, heading, items):
    try:
        block = (
            '<div class="help-block" data-title="' + str(heading) + '" style="display:none;color:#e5e7eb">' +
            '<ul style="margin:0;padding-left:18px;list-style:disc;color:#e5e7eb">' +
            ''.join('<li style="margin:6px 0">'+str(it)+'</li>' for it in items) +
            '</ul></div>'
        )
        tabs = (
            '<style>#helpTabs{max-width:1000px;margin:18px auto;background:#111827;border:1px solid #374151;border-radius:10px}'+
            '#helpTabs, #helpTabs *{color:#e5e7eb !important}'+
            '#helpTabs a{color:#93c5fd !important}'+
            '#helpTabs .bar{display:flex;gap:8px;padding:8px;border-bottom:1px solid #374151;flex-wrap:wrap;align-items:center;justify-content:space-between}'+
            '#helpTabs .left{display:flex;gap:8px;flex-wrap:wrap}'+
            '#helpTabs .right{font-size:14px}'+
            '#helpTabs button{background:#1f2937;color:#e5e7eb;border:1px solid #374151;border-radius:6px;padding:6px 10px;cursor:pointer}'+
            '#helpTabs button.active{background:#374151;border-color:#93c5fd;box-shadow:0 0 0 1px #93c5fd inset}'+
            '#helpTabs .content{padding:12px}'+
            '</style><div id="helpTabs"><div class="bar"><div class="left" id="helpTabButtons"></div><div class="right"><a href="index.html">&#8592; Voltar ao index</a></div></div><div class="content" id="helpTabContent"></div></div>'
        )
        script = (
            '<script>(function(){var c=document.getElementById("helpTabs");var btns=document.getElementById("helpTabButtons");var cont=document.getElementById("helpTabContent");var blocks=document.querySelectorAll(".help-block");if(blocks.length){if(!c||!btns||!cont){document.body.insertAdjacentHTML("beforeend", '+
            json.dumps(tabs)+
            ');c=document.getElementById("helpTabs");btns=document.getElementById("helpTabButtons");cont=document.getElementById("helpTabContent");}var H={};blocks.forEach(function(b){var t=b.getAttribute("data-title");H[t]=Array.from(b.querySelectorAll("li")).map(function(li){return li.textContent;});});function render(title){cont.innerHTML="<ul style=\\margin:0;padding-left:18px\\>"+(H[title]||[]).map(function(i){return "<li style=\\margin:6px 0\\>"+i+"</li>";}).join("")+"</ul>";}var helpMap={"Open Interest por Strike":{"Ajuda didática":["Leitura de OI por strike","Cores: CALL/PUT e acumulado","Uso: identificar clusters e mudanças de interesse"],"Exemplos de trade":["Operar em direção ao aumento de OI","Evitar regiões com OI disperso","Combinar com flip/magneto"],"Alertas de risco":["OI pode atrasar atualização","Movimentos falsos em baixa liquidez","Mudanças de série afetam comparabilidade"]}};function applyHelpFor(label){var d=helpMap[label]||{};Object.keys(d).forEach(function(k){H[k]=d[k];});var active=btns.querySelector("button.active");var t=active?active.getAttribute("data-title"):(btns.children[0]?btns.children[0].getAttribute("data-title"):"Ajuda didática");render(t);}blocks.forEach(function(b){var t=b.getAttribute("data-title");var dup=false;Array.from(btns.children).forEach(function(x){if(x.getAttribute("data-title")==t){dup=true;}});if(!dup){var btn=document.createElement("button");btn.textContent=t;btn.setAttribute("data-title",t);btn.addEventListener("click",function(){Array.from(btns.children).forEach(function(x){x.classList.remove("active")});btn.classList.add("active");render(t);try{history.replaceState(null,"","#help="+encodeURIComponent(t));}catch(e){}});btns.appendChild(btn);}});var target="";try{var q=new URLSearchParams(location.search).get("tab");if(q)target=decodeURIComponent(q);var h=location.hash||"";if(h.indexOf("#help=")==0)target=decodeURIComponent(h.split("=")[1]);}catch(e){}var found=null;Array.from(btns.children).forEach(function(x){if(x.getAttribute("data-title")==target){found=x;}});var sel=document.querySelector("select");if(sel){var getSel=function(){try{return sel.options[sel.selectedIndex].text||sel.value;}catch(e){return sel.value||"";}};applyHelpFor(getSel());sel.addEventListener("change",function(){applyHelpFor(getSel());});}else{applyHelpFor(document.title||"");}if(found){found.click();}else if(btns.children.length){btns.children[0].click();}}})();</script>'
        )
        return html.replace('</body>', block+script+'</body>')
    except Exception:
        return html
os.makedirs('exports', exist_ok=True)
fig3.update_layout(title=dict(text='EDI &#8212; Painel Delta & GEX', font=dict(color='white', size=18), x=0.5), margin=dict(t=120))
html3 = fig3.to_html(include_plotlyjs='cdn', full_html=True)
html3 = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Painel Delta & GEX</title>', html3, flags=re.S)
html3 = inject_home(html3)
html3 = html3.replace('</body>','<script src="help.js"></script></body>')
script_mode_embed = """
<script>(function(){
  function g(k){ try { var p = new URLSearchParams(location.search); return p.get(k)||""; } catch(e){ return ""; } }
  var mode = g("mode"), embed = g("embed");
  var titleMap = {"Delta Agregado":"EDI &#8212; Delta Agregado","Delta Acumulado":"EDI &#8212; Delta Acumulado","Gamma Exposure":"EDI &#8212; Gamma Exposure","Open Interest por Strike":"EDI &#8212; OI por Strike","Charm Exposure":"EDI &#8212; Charm Exposure","Vanna Exposure":"EDI &#8212; Vanna Exposure","Charm Acumulado":"EDI &#8212; Charm Acumulado","Vanna Acumulado":"EDI &#8212; Vanna Acumulado","Vega Exposure":"EDI &#8212; Vega Exposure","Skew IV (local)":"EDI &#8212; Skew IV (local)","Dealer Pressure":"EDI &#8212; Dealer Pressure"};
  if(embed === "1"){
    try {
      var top = document.querySelector("body > div[style*='position:fixed'][style*='top:0']"); if(top){ top.style.display = "none"; }
      var sp  = document.querySelector("body > div[style*='height:66px']");            if(sp){  sp.style.display  = "none"; }
    } catch(e){}
  }
  function apply(){
    try {
      if(!mode) return;
      var gd = document.querySelector(".plotly-graph-div");
      if(!gd || !gd._fullLayout || !gd._fullLayout.updatemenus) return;
      var ums = gd._fullLayout.updatemenus;
      for(var i=0;i<ums.length;i++){
        var btns = ums[i].buttons || [];
        for(var j=0;j<btns.length;j++){
          var lbl = String(btns[j].label || "");
          if(lbl === mode){
            var obj = {}; obj["updatemenus["+i+"].active"] = j;
            Plotly.relayout(gd, obj);
            var ttl = titleMap[mode] || 'EDI &#8212; Painel Delta & GEX';
            Plotly.relayout(gd, {"title.text": ttl});
            return;
          }
        }
      }
    } catch(e){}
  }
  if(document.readyState === "complete") { apply(); } else { window.addEventListener("load", apply); }
  setTimeout(apply, 500);
})();</script>
"""
html3 = html3.replace('</html>', script_mode_embed + '</html>')
html3 = inject_help(html3, 'Ajuda didática', ['Delta agregado e GEX por strike', 'Referências: SPOT e zero gamma', 'Leitura: GEX positivo tende a amortecer; negativo tende a amplificar', 'Uso: identificar faixas de suporte/resistência e regime de dealer'])
html3 = inject_help(html3, 'Exemplos de trade', ['Comprar suporte com GEX+ e alvo no zero gamma', 'Vender resistência com GEX+ e alvo em parede de GEX', 'Evitar contra‑tendência em GEX‑ sem confirmação de fluxo'])
html3 = inject_help(html3, 'Alertas de risco', ['Virada de regime próxima ao vencimento', 'Spikes de IV podem deslocar zero gamma', 'Baixa liquidez pode distorcer a exposição agregada'])

if 'NO_DATA' in globals() and NO_DATA: html3 = placeholder_html('EDI &#8212; Painel Delta & GEX')
if '<title>' not in html3:
    html3 = re.sub(r'<head>(.*?)</head>', r'<head><title>EDI &#8212; Painel Delta & GEX</title>\1</head>', html3, flags=re.S)
html3_tbl_div = fig_vals3.to_html(include_plotlyjs=False, full_html=False)
# Inserir tabela abaixo do gráfico principal
html3 = html3.replace('</body>', '<div style="margin-top:20px;border-top:1px solid #333;padding-top:20px">' + html3_tbl_div + '</div></body>')
with open('exports/Figura3.html','w',encoding='utf-8') as f: f.write(html3)
html3_tbl = fig_vals3.to_html(include_plotlyjs='cdn', full_html=True)
html3_tbl = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Tabela Delta & GEX</title>', html3_tbl, flags=re.S)
html3_tbl = inject_home(html3_tbl)
if 'NO_DATA' in globals() and NO_DATA: html3_tbl = placeholder_html('EDI &#8212; Tabela Delta & GEX')
if '<title>' not in html3_tbl:
    html3_tbl = re.sub(r'<head>(.*?)</head>', r'<head><title>EDI &#8212; Tabela Delta & GEX</title>\1</head>', html3_tbl, flags=re.S)
with open('exports/Figura3_Tabela.html','w',encoding='utf-8') as f: f.write(html3_tbl)
fig4.update_layout(title=dict(text='EDI &#8212; GEX & Gamma Flip (Modelos)', font=dict(color='white', size=18), x=0.5), margin=dict(t=120))
html4 = fig4.to_html(include_plotlyjs='cdn', full_html=True)
html4 = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; GEX & Gamma Flip (Modelos)</title>', html4, flags=re.S)
html4 = inject_home(html4)
html4 = html4.replace('</body>','<script src="help.js"></script></body>')
html4 = inject_help(html4, 'Ajuda didática', ['Comparação de modelos de Gamma Flip', 'Eixo X: mistura α (0=OI, 1=VOL)', 'Leitura: variação do flip por cenário', 'Uso: calibrar regime e magneto por composição de mercado'])
html4 = inject_help(html4, 'Exemplos de trade', ['Ajustar alvo conforme flip por α', 'Operar reversão quando flip cruza o SPOT', 'Usar α médio como baseline de regime'])
html4 = inject_help(html4, 'Alertas de risco', ['Peso de VOL aumenta em semanas de eventos', 'Mudanças de mix OI/VOL entre séries', 'Dados incompletos podem alterar o flip'])

if 'NO_DATA' in globals() and NO_DATA: html4 = placeholder_html('EDI &#8212; GEX & Gamma Flip (Modelos)')
if '<title>' not in html4:
    html4 = re.sub(r'<head>(.*?)</head>', r'<head><title>EDI &#8212; GEX & Gamma Flip (Modelos)</title>\1</head>', html4, flags=re.S)
with open('exports/Figura4.html','w',encoding='utf-8') as f: f.write(html4)
ds_vals = np.array([-0.015,-0.01,-0.005,0.0,0.005,0.01,0.015], dtype=float)
net_gex_signed = float(np.nansum(gex_oi_signed)) if 'gex_oi_signed' in globals() else float(np.nansum(gex_flip_base))
flow_vals = -net_gex_signed * ds_vals
ds05 = np.array([-0.005,0.0,0.005], dtype=float); flow05 = -net_gex_signed * ds05
ds10 = np.array([-0.01,0.0,0.01], dtype=float); flow10 = -net_gex_signed * ds10
ds15 = ds_vals.copy(); flow15 = flow_vals.copy()
fig_flow = go.Figure()
fig_flow.add_trace(go.Scatter(x=ds05*100.0, y=flow05, mode='lines+markers', name='±0.5%', line=dict(color='#60a5fa', width=3), visible=False))
fig_flow.add_trace(go.Scatter(x=ds10*100.0, y=flow10, mode='lines+markers', name='±1.0%', line=dict(color='#60a5fa', width=3), visible=True))
fig_flow.add_trace(go.Scatter(x=ds15*100.0, y=flow15, mode='lines+markers', name='±1.5%', line=dict(color='#60a5fa', width=3), visible=False))
fig_flow.update_layout(template='plotly_dark', height=600, title=dict(text='EDI &#8212; Fluxo de Hedge (Gamma)', font=dict(color='white', size=18), x=0.5), xaxis_title='ΔS (%)', yaxis_title='Fluxo estimado (unid. relativa)',
                    sliders=[dict(active=1, pad=dict(t=40), steps=[
                        dict(label='±0.5%', method='update', args=[{'visible':[True, False, False]}]),
                        dict(label='±1.0%', method='update', args=[{'visible':[False, True, False]}]),
                        dict(label='±1.5%', method='update', args=[{'visible':[False, False, True]}])
                    ])])
html_flow = fig_flow.to_html(include_plotlyjs='cdn', full_html=True)
html_flow = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Fluxo de Hedge (Gamma)</title>', html_flow, flags=re.S)
html_flow = inject_home(html_flow)
html_flow = html_flow.replace('</body>','<script src="help.js"></script></body>')
html_flow = inject_help(html_flow, 'Ajuda didática', ['Fluxo estimado do dealer vs ΔS', 'Use o slider para testar choques de preço', 'Leitura: maior |fluxo| indica regiões de maior fricção', 'Uso: planejar entradas/saídas em função do hedge necessário'])
html_flow = inject_help(html_flow, 'Exemplos de trade', ['Evitar operar contra picos de fluxo', 'Entrar após dissipação de fricção em zonas críticas', 'Scalpar em regiões de baixo fluxo'])
html_flow = inject_help(html_flow, 'Alertas de risco', ['Choques rápidos geram slippage', 'Dealer rebalanceia intradiário', 'Delta‑hedge altera microestrutura de preço'])

if 'NO_DATA' in globals() and NO_DATA: html_flow = placeholder_html('EDI &#8212; Fluxo de Hedge (Gamma)')
else:
    try:
        idx = int(np.nanargmax(np.abs(flow_vals)))
        html_flow = inject_insights(html_flow, 'Top insights', ['Maior fluxo: {:.2f} @ ΔS={:.2f}%'.format(float(np.abs(flow_vals[idx])), float(ds_vals[idx]*100))])
    except Exception:
        pass
with open('exports/Fluxo_Hedge.html','w',encoding='utf-8') as f: f.write(html_flow)
import pandas as pd
df_flow = pd.DataFrame({'DeltaS_pct': (ds_vals*100.0).astype(float), 'Fluxo': flow_vals.astype(float)})
tbl_flow = df_flow.to_html(index=False)
tbl_flow = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Tabela Fluxo de Hedge (Gamma)</title>', tbl_flow, flags=re.S)
tbl_flow = inject_home(tbl_flow)
with open('exports/Fluxo_Hedge_Tabela.html','w',encoding='utf-8') as f: f.write(tbl_flow)
w = np.exp(-((np.array(strikes_ref,dtype=float)-float(SPOT))**2)/(2.0*(float(SPOT)*float(IV_DAILY))**2))
_gg = (gex_oi_signed if 'gex_oi_signed' in globals() else gex_flip_base)
def _n(v):
    v = np.array(v, dtype=float)
    rng = (np.nanmax(v) - np.nanmin(v))
    return (v - np.nanmin(v))/rng if rng>0 else np.zeros_like(v)
W_DP_GEX, W_DP_DIST = 1.0, 1.0
dp_mix = (W_DP_GEX*_n(_gg) + W_DP_DIST*_n(w)) / (W_DP_GEX + W_DP_DIST)
dp_bal = (1.0*_n(_gg) + 1.0*_n(w)) / 2.0
dp_g = (2.0*_n(_gg) + 1.0*_n(w)) / 3.0
dp_d = (1.0*_n(_gg) + 2.0*_n(w)) / 3.0
fig_dp = go.Figure()
fig_dp.add_trace(go.Bar(x=strikes_ref, y=dp_bal, name='Balanced', marker_color='#f59e0b', opacity=0.7, visible=True))
fig_dp.add_trace(go.Bar(x=strikes_ref, y=dp_g, name='Gamma-focused', marker_color='#f59e0b', opacity=0.7, visible=False))
fig_dp.add_trace(go.Bar(x=strikes_ref, y=dp_d, name='Distance-focused', marker_color='#f59e0b', opacity=0.7, visible=False))
fig_dp.update_layout(template='plotly_dark', height=600, title=dict(text='EDI &#8212; Dealer Pressure 2.0', font=dict(color='white', size=18), x=0.5), xaxis_title='Strike', yaxis_title='Índice ponderado',
                    sliders=[dict(active=0, pad=dict(t=40), steps=[
                        dict(label='Balanced', method='update', args=[{'visible':[True, False, False]}]),
                        dict(label='Gamma-focused', method='update', args=[{'visible':[False, True, False]}]),
                        dict(label='Distance-focused', method='update', args=[{'visible':[False, False, True]}])
                    ])])
html_dp = fig_dp.to_html(include_plotlyjs='cdn', full_html=True)
html_dp = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Dealer Pressure 2.0</title>', html_dp, flags=re.S)
html_dp = inject_home(html_dp)
html_dp = html_dp.replace('</body>','<script src="help.js"></script></body>')
html_dp = inject_help(html_dp, 'Ajuda didática', ['Índice combina |gamma|, OI e distância', 'Leitura: picos sugerem pressão em strikes específicos', 'Uso: selecionar balanced/gamma/distance conforme objetivo'])
html_dp = inject_help(html_dp, 'Exemplos de trade', ['Priorizar strikes com pressão balanceada para swing', 'Modo gamma para operações táticas de curto prazo', 'Modo distância para alvo mais amplo'])
html_dp = inject_help(html_dp, 'Alertas de risco', ['Pressão pode migrar com movimento do SPOT', 'Mudança de maturidade altera pesos', 'Dados de OI podem estar defasados'])

if 'NO_DATA' in globals() and NO_DATA: html_dp = placeholder_html('EDI &#8212; Dealer Pressure 2.0')
else:
    try:
        j = int(np.nanargmax(dp_bal))
        s_g = float(np.nansum(_n(_gg)))
        s_d = float(np.nansum(_n(w)))
        s_t = s_g + s_d if (s_g + s_d) > 0 else 1.0
        pct_g = 100.0 * s_g / s_t
        pct_d = 100.0 * s_d / s_t
        html_dp = inject_insights(html_dp, 'Top insights', ['Topo pressão (Balanced): strike {} com {:.2f}'.format(str(strikes_ref[j]), float(dp_bal[j])), 'Contribuições: |gamma| {:.1f}%, distância {:.1f}%'.format(pct_g, pct_d)])
    except Exception:
        pass
with open('exports/Dealer_Pressure.html','w',encoding='utf-8') as f: f.write(html_dp)
df_dp = pd.DataFrame({'Strike': strikes_ref, 'DealerPressure': dp_bal})
df_dp = df_dp.sort_values('DealerPressure', ascending=False).head(int(top_n if 'top_n' in globals() else 5))
tbl_dp = df_dp.to_html(index=False)
tbl_dp = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Tabela Dealer Pressure</title>', tbl_dp, flags=re.S)
tbl_dp = inject_home(tbl_dp)
with open('exports/Dealer_Pressure_Tabela.html','w',encoding='utf-8') as f: f.write(tbl_dp)
alphas = np.linspace(0.0,1.0,11)
flip_vals = []
for a in alphas:
    gmix = (1.0-a)*(gex_oi_signed if 'gex_oi_signed' in globals() else gex_flip_base) + a*(gex_vol if 'gex_vol' in globals() else gex_flip_base)
    flip_vals.append(compute_gamma_flip(np.array(strikes_ref,dtype=float), np.array(gmix,dtype=float), float(SPOT)))
fig_cone = go.Figure()
fig_cone.add_trace(go.Scatter(x=alphas, y=np.array(flip_vals,dtype=float), mode='lines+markers', name='Flip vs mistura (OI↔VOL)', line=dict(color='#34d399', width=3)))
fig_cone.update_layout(template='plotly_dark', height=600, title=dict(text='EDI &#8212; Gamma Flip Cone', font=dict(color='white', size=18), x=0.5), xaxis_title='Mistura α (0=OI, 1=VOL)', yaxis_title='Gamma Flip (strike)')
html_cone = fig_cone.to_html(include_plotlyjs='cdn', full_html=True)
html_cone = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Gamma Flip Cone</title>', html_cone, flags=re.S)
html_cone = inject_home(html_cone)
html_cone = html_cone.replace('</body>','<script src="help.js"></script></body>')
html_cone = inject_help(html_cone, 'Ajuda didática', ['Gamma Flip vs mistura OI/VOL', 'Leitura: sensibilidade do flip ao peso da volatilidade', 'Uso: avaliar robustez do flip em cenários alternativos'])
html_cone = inject_help(html_cone, 'Exemplos de trade', ['Operar regime quando o cone está estável', 'Evitar entradas quando o cone está disperso', 'Combinar com GEX agregado para confirmação'])
html_cone = inject_help(html_cone, 'Alertas de risco', ['Cone sensível à volatilidade implícita', 'Eventos deslocam o cone', 'Séries ilíquidas geram ruído'])

if 'NO_DATA' in globals() and NO_DATA: html_cone = placeholder_html('EDI &#8212; Gamma Flip Cone')
else:
    try:
        mn, mx = float(np.nanmin(flip_vals)), float(np.nanmax(flip_vals))
        html_cone = inject_insights(html_cone, 'Top insights', ['Flip min/max: {:.2f} / {:.2f}'.format(mn, mx)])
    except Exception:
        pass
with open('exports/Gamma_Flip_Cone.html','w',encoding='utf-8') as f: f.write(html_cone)
df_cone = pd.DataFrame({'Alpha': alphas.astype(float), 'Flip': np.array(flip_vals,dtype=float)})
tbl_cone = df_cone.to_html(index=False)
tbl_cone = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Tabela Gamma Flip Cone</title>', tbl_cone, flags=re.S)
tbl_cone = inject_home(tbl_cone)
with open('exports/Gamma_Flip_Cone_Tabela.html','w',encoding='utf-8') as f: f.write(tbl_cone)
charm_net = float(np.nansum(charm_tot)) if 'charm_tot' in globals() else 0.0
fig_charm = go.Figure()
fig_charm.add_trace(go.Bar(x=strikes_ref, y=charm_tot if 'charm_tot' in globals() else np.zeros_like(strikes_ref), name='Charm agregado', marker_color='#22d3ee', opacity=0.7))
fig_charm.update_layout(template='plotly_dark', height=600, title=dict(text='EDI &#8212; Charm Flow Diário', font=dict(color='white', size=18), x=0.5), xaxis_title='Strike', yaxis_title='Charm (unid. relativa)')
html_charm = fig_charm.to_html(include_plotlyjs='cdn', full_html=True)
html_charm = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Charm Flow Diário</title>', html_charm, flags=re.S)
html_charm = inject_home(html_charm)
html_charm = html_charm.replace('</body>','<script src="help.js"></script></body>')
html_charm = inject_help(html_charm, 'Ajuda didática', ['Charm agregado por strike', 'Leitura: movimentos induzidos por decaimento de tempo', 'Uso: monitorar pressão intradiária por vencimento'])
html_charm = inject_help(html_charm, 'Exemplos de trade', ['Operar desacelerações induzidas por charm', 'Evitar contra fluxo em dias de rolagem', 'Combinar charm com janelas de vencimento'])
html_charm = inject_help(html_charm, 'Alertas de risco', ['Efeito não linear próximo ao vencimento', 'Atualizações de book alteram charm', 'Shifts de IV mudam o impacto'])

if 'NO_DATA' in globals() and NO_DATA: html_charm = placeholder_html('EDI &#8212; Charm Flow Diário')
else:
    try:
        j = int(np.nanargmax(charm_tot)) if 'charm_tot' in globals() else 0
        topv = float(charm_tot[j]) if 'charm_tot' in globals() else 0.0
        html_charm = inject_insights(html_charm, 'Top insights', ['Maior charm em strike {}: {:.2f}'.format(str(strikes_ref[j]), topv)])
    except Exception:
        pass
with open('exports/Charm_Flow.html','w',encoding='utf-8') as f: f.write(html_charm)
df_charm = pd.DataFrame({'Strike': strikes_ref, 'Charm': charm_tot if 'charm_tot' in globals() else np.zeros_like(strikes_ref)})
df_charm = df_charm.sort_values('Charm', ascending=False).head(int(top_n if 'top_n' in globals() else 5))
tbl_charm = df_charm.to_html(index=False)
tbl_charm = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Tabela Charm Flow</title>', tbl_charm, flags=re.S)
tbl_charm = inject_home(tbl_charm)
with open('exports/Charm_Flow_Tabela.html','w',encoding='utf-8') as f: f.write(tbl_charm)
iv_deltas = np.array([-0.03,-0.02,-0.01,0.0,0.01,0.02,0.03], dtype=float)
vanna_sum = float(np.nansum(vanna_tot)) if 'vanna_tot' in globals() else 0.0
vanna_sens = vanna_sum * iv_deltas
fig_vanna = go.Figure()
fig_vanna.add_trace(go.Scatter(x=iv_deltas*100.0, y=vanna_sens, mode='lines+markers', name='ΔΔ vs ΔIV (%)', line=dict(color='#a78bfa', width=3)))
fig_vanna.add_trace(go.Scatter(x=[iv_deltas[0]*100.0], y=[vanna_sens[0]], mode='markers', name='Seleção -3%', marker=dict(color='#a78bfa', size=8), visible=True))
fig_vanna.add_trace(go.Scatter(x=[iv_deltas[1]*100.0], y=[vanna_sens[1]], mode='markers', name='Seleção -2%', marker=dict(color='#a78bfa', size=8), visible=False))
fig_vanna.add_trace(go.Scatter(x=[iv_deltas[2]*100.0], y=[vanna_sens[2]], mode='markers', name='Seleção -1%', marker=dict(color='#a78bfa', size=8), visible=False))
fig_vanna.add_trace(go.Scatter(x=[iv_deltas[3]*100.0], y=[vanna_sens[3]], mode='markers', name='Seleção 0%', marker=dict(color='#a78bfa', size=8), visible=False))
fig_vanna.add_trace(go.Scatter(x=[iv_deltas[4]*100.0], y=[vanna_sens[4]], mode='markers', name='Seleção +1%', marker=dict(color='#a78bfa', size=8), visible=False))
fig_vanna.add_trace(go.Scatter(x=[iv_deltas[5]*100.0], y=[vanna_sens[5]], mode='markers', name='Seleção +2%', marker=dict(color='#a78bfa', size=8), visible=False))
fig_vanna.add_trace(go.Scatter(x=[iv_deltas[6]*100.0], y=[vanna_sens[6]], mode='markers', name='Seleção +3%', marker=dict(color='#a78bfa', size=8), visible=False))
fig_vanna.update_layout(template='plotly_dark', height=600, title=dict(text='EDI &#8212; Vanna Vol-Sensitivity', font=dict(color='white', size=18), x=0.5), xaxis_title='ΔIV (%)', yaxis_title='ΔΔ estimado (unid. relativa)',
                    sliders=[dict(active=0, pad=dict(t=40), steps=[
                        dict(label='-3%', method='update', args=[{'visible':[True, True, False, False, False, False, False, False]}]),
                        dict(label='-2%', method='update', args=[{'visible':[True, False, True, False, False, False, False, False]}]),
                        dict(label='-1%', method='update', args=[{'visible':[True, False, False, True, False, False, False, False]}]),
                        dict(label='0%', method='update', args=[{'visible':[True, False, False, False, True, False, False, False]}]),
                        dict(label='+1%', method='update', args=[{'visible':[True, False, False, False, False, True, False, False]}]),
                        dict(label='+2%', method='update', args=[{'visible':[True, False, False, False, False, False, True, False]}]),
                        dict(label='+3%', method='update', args=[{'visible':[True, False, False, False, False, False, False, True]}])
                    ])])
html_vanna = fig_vanna.to_html(include_plotlyjs='cdn', full_html=True)
html_vanna = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Vanna Vol-Sensitivity</title>', html_vanna, flags=re.S)
html_vanna = inject_home(html_vanna)
html_vanna = html_vanna.replace('</body>','<script src="help.js"></script></body>')
html_vanna = inject_help(html_vanna, 'Ajuda didática', ['Sensibilidade ΔΔ a variações de volatilidade (ΔIV)', 'Use o slider para avaliar o impacto em diferentes cenários', 'Leitura: maior inclinação implica maior sensibilidade a IV'])
html_vanna = inject_help(html_vanna, 'Exemplos de trade', ['Ajustar risco à ΔIV via slider', 'Hedgear quando sensibilidade aumenta', 'Combinar com tenores relevantes'])
html_vanna = inject_help(html_vanna, 'Alertas de risco', ['ΔIV elevado em eventos macro', 'Skew muda a resposta de vanna', 'Dados de IV podem ter atraso'])

if 'NO_DATA' in globals() and NO_DATA: html_vanna = placeholder_html('EDI &#8212; Vanna Vol-Sensitivity')
else:
    try:
        sens = float(vanna_sum*0.03)
        html_vanna = inject_insights(html_vanna, 'Top insights', ['ΔΔ estimado @ ΔIV=+3%: {:.2f}'.format(sens)])
    except Exception:
        pass
with open('exports/Vanna_Sensitivity.html','w',encoding='utf-8') as f: f.write(html_vanna)
df_vanna = pd.DataFrame({'DeltaIV_pct': (iv_deltas*100.0).astype(float), 'DeltaDelta': vanna_sens.astype(float)})
tbl_vanna = df_vanna.to_html(index=False)
tbl_vanna = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Tabela Vanna Vol-Sensitivity</title>', tbl_vanna, flags=re.S)
tbl_vanna = inject_home(tbl_vanna)
with open('exports/Vanna_Sensitivity_Tabela.html','w',encoding='utf-8') as f: f.write(tbl_vanna)
# Pin Risk & Magnet Score
oi_tot = (np.array(oi_call_ref,dtype=float) if 'oi_call_ref' in globals() else np.zeros_like(strikes_ref)) + (np.array(oi_put_ref,dtype=float) if 'oi_put_ref' in globals() else np.zeros_like(strikes_ref))
gamma_abs = np.abs(np.array(gex_tot,dtype=float) if 'gex_tot' in globals() else np.zeros_like(strikes_ref))
dist = np.abs(np.array(strikes_ref,dtype=float) - float(SPOT))
sigma = max(1e-6, float(SPOT)*float(IV_DAILY) if 'IV_DAILY' in globals() else max(1e-6,float(SPOT)*0.02))
w_dist = np.exp(-(dist**2)/(2.0*sigma**2))
W_OI, W_GAMMA, W_DIST, W_TIME = 1.0, 1.0, 1.0, 1.0
def _nz_norm(x):
    x = np.array(x, dtype=float)
    rng = (np.nanmax(x) - np.nanmin(x))
    return (x - np.nanmin(x))/rng if rng>0 else np.zeros_like(x)
oi_comp = _nz_norm(oi_tot) * W_OI
gamma_comp = _nz_norm(gamma_abs) * W_GAMMA
dist_comp = w_dist * W_DIST
mix_sum = W_OI + W_GAMMA + W_DIST
magnet = (oi_comp + gamma_comp + dist_comp) / mix_sum
s_oi, s_g, s_d = float(np.nansum(oi_comp)), float(np.nansum(gamma_comp)), float(np.nansum(dist_comp))
s_total = s_oi + s_g + s_d if (s_oi + s_g + s_d) > 0 else 1.0
pct_oi = 100.0 * s_oi / s_total
pct_g = 100.0 * s_g / s_total
pct_d = 100.0 * s_d / s_total
fig_pin = go.Figure()
fig_pin.add_trace(go.Bar(x=strikes_ref, y=magnet, name='Magnet Score', marker_color='#f87171', opacity=0.75))
fig_pin.add_shape(spot_line)
fig_pin.update_layout(template='plotly_dark', height=600, title=dict(text='EDI &#8212; Pin Risk & Magnet Score', font=dict(color='white', size=18), x=0.5), xaxis_title='Strike', yaxis_title='Score (0–1)')
html_pin = fig_pin.to_html(include_plotlyjs='cdn', full_html=True)
html_pin = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Pin Risk & Magnet Score</title>', html_pin, flags=re.S)
html_pin = inject_home(html_pin)
html_pin = html_pin.replace('</body>','<script src="help.js"></script></body>')
html_pin = inject_help(html_pin, 'Ajuda didática', ['Magnet Score combina OI, |gamma| e distância', 'Leitura: picos indicam maior probabilidade de pin', 'Uso: mapear strikes com risco de magneto no curto prazo'])
html_pin = inject_help(html_pin, 'Exemplos de trade', ['Mapear pin e operar aproximação controlada', 'Evitar operar contra magneto forte', 'Fechar posições antes do vencimento em pin elevado'])
html_pin = inject_help(html_pin, 'Alertas de risco', ['Pin pode falhar com gaps de abertura', 'Intervenções de mercado quebram magneto', 'Mudanças tardias de OI alteram probabilidades'])

if 'NO_DATA' in globals() and NO_DATA: html_pin = placeholder_html('EDI &#8212; Pin Risk & Magnet Score')
else:
    try:
        k = int(np.nanargmax(magnet))
        html_pin = inject_insights(html_pin, 'Top insights', ['Maior magnet: strike {} score {:.2f}'.format(str(strikes_ref[k]), float(magnet[k])), 'Contribuições: OI {:.1f}%, |gamma| {:.1f}%, distância {:.1f}%'.format(pct_oi, pct_g, pct_d)])
    except Exception:
        pass
with open('exports/Pin_Risk.html','w',encoding='utf-8') as f: f.write(html_pin)
df_pin = pd.DataFrame({'Strike': strikes_ref, 'MagnetScore': magnet})
df_pin = df_pin.sort_values('MagnetScore', ascending=False).head(int(top_n if 'top_n' in globals() else 5))
tbl_pin = df_pin.to_html(index=False)
tbl_pin = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Tabela Pin Risk & Magnet</title>', tbl_pin, flags=re.S)
tbl_pin = inject_home(tbl_pin)
with open('exports/Pin_Risk_Tabela.html','w',encoding='utf-8') as f: f.write(tbl_pin)
# Rails & Bounce Zones
fig_rails = go.Figure()
rails_y = (np.array(gex_cum,dtype=float) if 'gex_cum' in globals() else np.zeros_like(strikes_ref))
fig_rails.add_trace(go.Scatter(x=strikes_ref, y=rails_y, mode='lines', name='Curvatura / Acumulado GEX', line=dict(color='#10b981', width=3)))
for sh in ([spot_line, hline0] + (range_lines if 'range_lines' in globals() else []) + (wall_lines if 'wall_lines' in globals() else [])):
    fig_rails.add_shape(sh)
fig_rails.update_layout(template='plotly_dark', height=600, title=dict(text='EDI &#8212; Rails & Bounce Zones', font=dict(color='white', size=18), x=0.5), xaxis_title='Strike', yaxis_title='Índice (relativo)')
html_rails = fig_rails.to_html(include_plotlyjs='cdn', full_html=True)
html_rails = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Rails & Bounce Zones</title>', html_rails, flags=re.S)
html_rails = inject_home(html_rails)
html_rails = html_rails.replace('</body>','<script src="help.js"></script></body>')
html_rails = inject_help(html_rails, 'Ajuda didática', ['Curvatura/acúmulo de GEX e zonas operacionais', 'Referências: range, walls e zero gamma', 'Uso: identificar corredores e áreas de provável bounce'])
html_rails = inject_help(html_rails, 'Exemplos de trade', ['Comprar nos rails inferiores com confirmação', 'Vender nos rails superiores em rejeição', 'Usar bounce zones para scalp técnico'])
html_rails = inject_help(html_rails, 'Alertas de risco', ['Rails movem com dados novos', 'Breakouts anulam bounce zones', 'Liquidez baixa amplia ranges e falsos sinais'])

if 'NO_DATA' in globals() and NO_DATA: html_rails = placeholder_html('EDI &#8212; Rails & Bounce Zones')
else:
    try:
        html_rails = inject_insights(html_rails, 'Top insights', ['Zonas operacionais carregadas com ranges e walls'])
    except Exception:
        pass
with open('exports/Rails_Bounce.html','w',encoding='utf-8') as f: f.write(html_rails)
# Gamma Exposure Curve
x_ref = np.array(strikes_ref, dtype=float)
y_ref = (np.array(gex_cum_signed,dtype=float) if 'gex_cum_signed' in globals() else (np.array(gex_cum,dtype=float) if 'gex_cum' in globals() else np.zeros_like(x_ref)))
y_pos = np.where(y_ref>0, y_ref, 0.0)
y_neg = np.where(y_ref<0, y_ref, 0.0)
fig_expo = go.Figure()
fig_expo.add_trace(go.Scatter(x=x_ref, y=y_pos, mode='lines', name='Gamma Exposure +', line=dict(color='#34d399', width=0), fill='tozeroy', fillcolor='rgba(52,211,153,0.35)'))
fig_expo.add_trace(go.Scatter(x=x_ref, y=y_neg, mode='lines', name='Gamma Exposure -', line=dict(color='#f87171', width=0), fill='tozeroy', fillcolor='rgba(248,113,113,0.35)'))
for sh in [spot_line]:
    fig_expo.add_shape(sh)
if 'gamma_flip' in globals() and gamma_flip is not None:
    fig_expo.add_shape(dict(type='line', x0=float(gamma_flip), x1=float(gamma_flip), y0=float(np.nanmin(y_ref)), y1=float(np.nanmax(y_ref)), line=dict(color='#ef4444', width=2, dash='dot')))
fig_expo.update_layout(template='plotly_dark', height=600, title=dict(text='EDI &#8212; Gamma Exposure Curve', font=dict(color='white', size=18), x=0.5), xaxis_title='Strike', yaxis_title='Exposure (rel.)', showlegend=False)
html_expo = fig_expo.to_html(include_plotlyjs='cdn', full_html=True)
html_expo = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Gamma Exposure Curve</title>', html_expo, flags=re.S)
html_expo = inject_home(html_expo)
html_expo = html_expo.replace('</body>','<script src="help.js"></script></body>')
html_expo = inject_help(html_expo, 'Ajuda didática', ['Área verde: exposição positiva; área vermelha: negativa', 'Linhas: SPOT e Gamma Flip (quando disponível)', 'Leitura: transições de sinal indicam mudanças de regime', 'Uso: localizar strikes com impacto agregado de dealers'])
html_expo = inject_help(html_expo, 'Exemplos de trade', ['Evitar operar contra o sinal agregado', 'Buscar trades na transição de sinal', 'Usar flip como pivô estrutural'])
html_expo = inject_help(html_expo, 'Alertas de risco', ['Sinal pode inverter intradiário', 'Agregação pode ocultar micro clusters', 'Dados incompletos reduzem confiabilidade'])

if 'NO_DATA' in globals() and NO_DATA: html_expo = placeholder_html('EDI &#8212; Gamma Exposure Curve')
with open('exports/Gamma_Exposure_Curve.html','w',encoding='utf-8') as f: f.write(html_expo)
# Theta Exposure agregado
fig_theta = go.Figure()
fig_theta.add_trace(go.Bar(x=strikes_ref, y=theta_tot if 'theta_tot' in globals() else np.zeros_like(strikes_ref), name='Theta Exposure', marker_color='#f59e0b', opacity=0.75))
fig_theta.add_shape(spot_line)
fig_theta.update_layout(template='plotly_dark', height=600, title=dict(text='EDI &#8212; Theta Exposure', font=dict(color='white', size=18), x=0.5), xaxis_title='Strike', yaxis_title='Exposição (θ diário agregado)', showlegend=False)
html_theta = fig_theta.to_html(include_plotlyjs='cdn', full_html=True)
html_theta = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Theta Exposure</title>', html_theta, flags=re.S)
html_theta = inject_home(html_theta)
html_theta = html_theta.replace('</body>','<script src="help.js"></script></body>')
html_theta = inject_help(html_theta, 'Ajuda didática', ['Theta diário por strike (CALL+PUT)', 'Agregado ponderado por OI', 'Interpretação: drenagem temporal de valor', 'Uso: monitorar pressão de tempo por faixas'])
html_theta = inject_help(html_theta, 'Exemplos de trade', ['Evitar posições longas em θ elevado sem hedge', 'Buscar capturar θ em regiões com OI concentrado', 'Combinar com GEX para ajustar regiões de congestão'])
html_theta = inject_help(html_theta, 'Alertas de risco', ['θ depende de T e IV', 'Mudanças de série afetam θ', 'Eventos distorcem a distribuição de θ'])
if 'NO_DATA' in globals() and NO_DATA: html_theta = placeholder_html('EDI &#8212; Theta Exposure')
with open('exports/Theta_Exposure.html','w',encoding='utf-8') as f: f.write(html_theta)
time_weight = 1.0/float(max(1, int(bdays) if 'bdays' in globals() else 1))
expiry_pressure = magnet * time_weight * W_TIME
bdays_arr = (np.array(maturity_days,dtype=float) if 'maturity_days' in globals() else np.full_like(np.array(strikes_ref,dtype=float), float(bdays) if 'bdays' in globals() else 10.0))
mask_short = (bdays_arr <= 5).astype(float)
mask_mid = ((bdays_arr > 5) & (bdays_arr <= 15)).astype(float)
mask_long = (bdays_arr > 15).astype(float)
exp_short = expiry_pressure * mask_short
exp_mid = expiry_pressure * mask_mid
exp_long = expiry_pressure * mask_long
fig_exp = go.Figure()
fig_exp.add_trace(go.Bar(x=strikes_ref, y=exp_short, name='Short (≤5d)', marker_color='#fb7185', opacity=0.8, visible=True))
fig_exp.add_trace(go.Bar(x=strikes_ref, y=exp_mid, name='Mid (6–15d)', marker_color='#fb7185', opacity=0.8, visible=False))
fig_exp.add_trace(go.Bar(x=strikes_ref, y=exp_long, name='Long (>15d)', marker_color='#fb7185', opacity=0.8, visible=False))
fig_exp.add_shape(spot_line)
fig_exp.update_layout(template='plotly_dark', height=600, title=dict(text='EDI &#8212; Expiry Pressure', font=dict(color='white', size=18), x=0.5), xaxis_title='Strike', yaxis_title='Pressão (relativa)',
                    sliders=[dict(active=0, pad=dict(t=40), steps=[
                        dict(label='Short (<=5d)', method='update', args=[{'visible':[True, False, False]}]),
                        dict(label='Mid (6-15d)', method='update', args=[{'visible':[False, True, False]}]),
                        dict(label='Long (>15d)', method='update', args=[{'visible':[False, False, True]}])
                    ])])
html_exp = fig_exp.to_html(include_plotlyjs='cdn', full_html=True)
html_exp = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Expiry Pressure</title>', html_exp, flags=re.S)
html_exp = inject_home(html_exp)
html_exp = html_exp.replace('</body>','<script src="help.js"></script></body>')
html_exp = inject_help(html_exp, 'Ajuda didática', ['Pressão de vencimento ponderada por tempo', 'Selecione janelas Short/Mid/Long', 'Leitura: regiões com maior pressão tendem a magnetizar próximo do vencimento'])
html_exp = inject_help(html_exp, 'Exemplos de trade', ['Operar magneto em janela short', 'Evitar trades contra pressões mid/long', 'Sincronizar entradas com rolagem'])
html_exp = inject_help(html_exp, 'Alertas de risco', ['Mudanças de bdays alteram janelas', 'Grande rolagem desloca pressão', 'Dias não úteis afetam a contagem'])

if 'NO_DATA' in globals() and NO_DATA: html_exp = placeholder_html('EDI &#8212; Expiry Pressure')
else:
    try:
        e = int(np.nanargmax(expiry_pressure))
        html_exp = inject_insights(html_exp, 'Top insights', ['Maior pressão: strike {} {:.2f}'.format(str(strikes_ref[e]), float(expiry_pressure[e]))])
    except Exception:
        pass
with open('exports/Expiry_Pressure.html','w',encoding='utf-8') as f: f.write(html_exp)
df_exp = pd.DataFrame({'Strike': strikes_ref, 'ExpiryPressure': expiry_pressure})
df_exp = df_exp.sort_values('ExpiryPressure', ascending=False).head(int(top_n if 'top_n' in globals() else 5))
tbl_exp = df_exp.to_html(index=False)
tbl_exp = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Tabela Expiry Pressure</title>', tbl_exp, flags=re.S)
tbl_exp = inject_home(tbl_exp)
with open('exports/Expiry_Pressure_Tabela.html','w',encoding='utf-8') as f: f.write(tbl_exp)
html4_tbl = fig_vals4.to_html(include_plotlyjs='cdn', full_html=True)
html4_tbl = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Tabela GEX & Gamma Flip</title>', html4_tbl, flags=re.S)
html4_tbl = inject_home(html4_tbl)
if 'NO_DATA' in globals() and NO_DATA: html4_tbl = placeholder_html('EDI &#8212; Tabela GEX & Gamma Flip')
if '<title>' not in html4_tbl:
    html4_tbl = re.sub(r'<head>(.*?)</head>', r'<head><title>EDI &#8212; Tabela GEX & Gamma Flip</title>\1</head>', html4_tbl, flags=re.S)
with open('exports/Figura4_Tabela.html','w',encoding='utf-8') as f: f.write(html4_tbl)
with open('exports/Profit_NTSL.txt','w',encoding='utf-8') as f: f.write(output_script)
metrics={
  'spot': float(SPOT),
  'gamma_flip': float(gamma_flip) if gamma_flip is not None else None,
  'delta_flip': float(delta_flip) if 'delta_flip' in globals() and delta_flip is not None else None,
  'sigma_factor': float(SIGMA_FACTOR) if 'SIGMA_FACTOR' in globals() else None,
  'top_n': int(top_n) if 'top_n' in globals() else None,
  'flip_models': {
    'classic': float(flip_classic) if flip_classic is not None else None,
    'classic_spline': float(flip_classic_spl) if flip_classic_spl is not None else None,
    'hvl_pts': float(flip_hvl_pts) if flip_hvl_pts is not None else None,
    'hvl_log': float(flip_hvl_log) if flip_hvl_log is not None else None,
    'hvl_log_iv': float(flip_hvl_log_iv) if flip_hvl_log_iv is not None else None,
    'hvl_win': float(flip_hvl_win) if flip_hvl_win is not None else None,
    'sigma_kernel': float(flip_sigma_kernel) if 'flip_sigma_kernel' in globals() and flip_sigma_kernel is not None else None,
    'topn': float(flip_topn) if 'flip_topn' in globals() and flip_topn is not None else None,
    'classic_pv': float(flip_classic_pv) if flip_classic_pv is not None else None,
    'hvl_pts_pv': float(flip_hvl_pts_pv) if flip_hvl_pts_pv is not None else None,
    'hvl_log_pv': float(flip_hvl_log_pv) if flip_hvl_log_pv is not None else None,
    'hvl_win_pv': float(flip_hvl_win_pv) if flip_hvl_win_pv is not None else None
  }
}
with open('exports/metrics.json','w',encoding='utf-8') as f: json.dump(metrics, f, ensure_ascii=False, indent=2)

# Save Gamma Flip Analysis (Table) to HTML
html_flip_tbl = fig_vals4.to_html(include_plotlyjs='cdn', full_html=True)
html_flip_tbl = re.sub(r'<title>.*?</title>', '<title>EDI &#8212; Gamma Flip Analysis</title>', html_flip_tbl, flags=re.S)
html_flip_tbl = inject_home(html_flip_tbl)
html_flip_tbl = html_flip_tbl.replace('</body>','<script src="help.js"></script></body>')
html_flip_tbl = inject_help(html_flip_tbl, 'Modelos de Flip', [
    '<b>Clássico</b>: Interpolação linear onde o Gamma acumulado cruza zero.',
    '<b>Spline</b>: Suavização cúbica para detectar transições mais orgânicas.',
    '<b>HVL (High Vol)</b>: Ajusta o flip considerando a volatilidade histórica (HVL).',
    '<b>Log / Log IV</b>: Usa escala logarítmica para reduzir ruído de extremos de OI.',
    '<b>Sigma Kernel</b>: Ponderação gaussiana baseada na volatilidade implícita (IV).',
    '<b>PVOP</b>: Ponderado pelo volume de Puts (Put Volume Over Price), indicando pressão vendedora.',
    '<b>Top-N OI</b>: Média ponderada dos strikes com maior Open Interest.'
])
html_flip_tbl = inject_help(html_flip_tbl, 'Interpretação', [
    '<b>Convergência</b>: Se vários modelos apontam o mesmo preço, o flip é forte (Ímã).',
    '<b>Divergência</b>: Indica incerteza ou transição de regime de mercado.',
    '<b>Flip vs Spot</b>: Preço acima do flip = Gamma Positivo (Estabilidade); Abaixo = Gamma Negativo (Volatilidade).'
])
if 'NO_DATA' in globals() and NO_DATA: html_flip_tbl = placeholder_html('EDI &#8212; Gamma Flip Analysis')
if '<title>' not in html_flip_tbl:
    html_flip_tbl = re.sub(r'<head>(.*?)</head>', r'<head><title>EDI &#8212; Gamma Flip Analysis</title>\\1</head>', html_flip_tbl, flags=re.S)
html_flip_tbl = html_flip_tbl.replace('</body>', "\n<div style=\"max-width:800px;margin:20px auto;color:#ccc;font-family:sans-serif;background:#111827;padding:15px;border:1px solid #374151;border-radius:8px\">\n  <h3 style=\"color:#93c5fd;border-bottom:1px solid #374151;padding-bottom:8px\">Ajuda Did\u00e1tica: Modelos de Flip</h3>\n  <ul style=\"line-height:1.6\">\n    <li><b>Cl\u00e1ssico:</b> Interpola\u00e7\u00e3o linear onde o Gamma acumulado cruza zero.</li>\n    <li><b>Spline:</b> Suaviza\u00e7\u00e3o c\u00fabica para detectar transi\u00e7\u00f5es mais org\u00e2nicas.</li>\n    <li><b>HVL (High Vol):</b> Ajusta o flip considerando a volatilidade hist\u00f3rica (HVL).</li>\n    <li><b>Log / Log IV:</b> Usa escala logar\u00edtmica para reduzir ru\u00eddo de extremos de OI.</li>\n    <li><b>Sigma Kernel:</b> Pondera\u00e7\u00e3o gaussiana baseada na volatilidade impl\u00edcita (IV).</li>\n    <li><b>PVOP:</b> Ponderado pelo volume de Puts (Put Volume Over Price), indicando press\u00e3o vendedora.</li>\n    <li><b>Top-N OI:</b> M\u00e9dia ponderada dos strikes com maior Open Interest.</li>\n  </ul>\n  <h3 style=\"color:#93c5fd;border-bottom:1px solid #374151;padding-bottom:8px;margin-top:20px\">Interpreta\u00e7\u00e3o</h3>\n  <ul style=\"line-height:1.6\">\n    <li><b>Converg\u00eancia:</b> Se v\u00e1rios modelos apontam o mesmo pre\u00e7o, o flip \u00e9 forte (\u00cdm\u00e3).</li>\n    <li><b>Diverg\u00eancia:</b> Indica incerteza ou transi\u00e7\u00e3o de regime de mercado.</li>\n    <li><b>Flip vs Spot:</b> Pre\u00e7o acima do flip = Gamma Positivo (Estabilidade); Abaixo = Gamma Negativo (Volatilidade).</li>\n  </ul>\n</div>\n" + '</body>')
with open('exports/Gamma_Flip_Analysis.html','w',encoding='utf-8') as f: f.write(html_flip_tbl)


# --- EDI FIX: Generate Individual Rich Panels from Figura3 ---
# This ensures we have standalone files with forced modes for the dashboard
rich_modes_map = {
    "OI_Strike.html": "Open Interest por Strike",
    "Delta_Agregado.html": "Delta Agregado",
    "Gamma_Exposure.html": "Gamma Exposure",
    "Delta_Acumulado.html": "Delta Acumulado",
    "GEX_OI.html": "GEX (OI)",
    "GEX_IV.html": "GEX (IV)",
    "PVOP.html": "R Gamma (PVOP)",
    "Charm_Exposure.html": "Charm Exposure",
    "Vanna_Exposure.html": "Vanna Exposure",
    "Vega_Exposure.html": "Vega Exposure",
    "Skew_Local.html": "Skew IV (local)",
    "Dealer_Pressure.html": "Dealer Pressure"
}

try:
    with open('exports/Figura3.html', 'r', encoding='utf-8') as f:
        base_html = f.read()

    print("Generating rich individual panels from Figura3...")
    for fname, mode_name in rich_modes_map.items():
        # Custom JS to force mode
        js_force = f'''
        <script>
        (function(){{
          var targetMode = "{mode_name}";
          var targetAdvanced = "Modo Avançado"; 
          
          function apply(){{
            try {{
              var gd = document.querySelector(".plotly-graph-div");
              if(!gd || !gd._fullLayout || !gd._fullLayout.updatemenus) return;
              var ums = gd._fullLayout.updatemenus;
              
              // 1. Activate Target Mode
              var modeFound = false;
              for(var i=0; i<ums.length; i++){{
                var btns = ums[i].buttons || [];
                for(var j=0; j<btns.length; j++){{
                  if(btns[j].label === targetMode){{
                     var obj = {{}}; 
                     obj["updatemenus["+i+"].active"] = j;
                     Plotly.relayout(gd, obj);
                     modeFound = true;
                     break; 
                  }}
                }}
                if(modeFound) break;
              }}

              // 2. Activate Advanced Mode (if not already active)
              for(var i=0; i<ums.length; i++){{
                var btns = ums[i].buttons || [];
                for(var j=0; j<btns.length; j++){{
                  if(btns[j].label === targetAdvanced){{
                     var obj = {{}}; 
                     obj["updatemenus["+i+"].active"] = j;
                     Plotly.relayout(gd, obj);
                     break; 
                  }}
                }}
              }}
              
              Plotly.relayout(gd, {{"title.text": "EDI - " + targetMode}});

            }} catch(e){{ console.error("Error applying mode:", e); }}
          }}
          
          if(document.readyState === "complete") {{ apply(); }} else {{ window.addEventListener("load", apply); }}
          setTimeout(apply, 500);
          setTimeout(apply, 1500);
        }})();
        </script>
        '''
        
        # Replace the end of body
        new_content = base_html.replace('</body>', js_force + '</body>')
        new_content = new_content.replace('<title>EDI &#8212; Painel Delta & GEX</title>', f'<title>EDI - {mode_name}</title>')
        
        with open(f'exports/{fname}', 'w', encoding='utf-8') as f:
            f.write(new_content)
            
    print("Rich panels generated.")
except Exception as e:
    print(f"Error generating rich panels: {e}")


# CELL 33
import os
import importlib, sys
from importlib import metadata as md
try:
    pv = md.version('plotly')
except Exception:
    pv = 'desconhecida'
print('Plotly versão:', pv)
kaleido_spec = importlib.util.find_spec('kaleido')
if kaleido_spec is None:
    print('Kaleido não encontrado no kernel atual. Use: py -3 -m pip install -U kaleido')
else:
    kaleido = importlib.import_module('kaleido')
    print('Kaleido encontrado em:', kaleido.__file__)
os.makedirs('exports', exist_ok=True)
try:
    fig3.write_image('exports/Figura3.svg', format='svg', scale=2, width=1400, height=650)
    fig4.write_image('exports/Figura4.svg', format='svg', scale=2, width=1400, height=650)
    fig_flow.write_image('exports/Fluxo_Hedge.svg', format='svg', scale=2, width=1200, height=600)
    fig_dp.write_image('exports/Dealer_Pressure.svg', format='svg', scale=2, width=1200, height=600)
    fig_cone.write_image('exports/Gamma_Flip_Cone.svg', format='svg', scale=2, width=1200, height=600)
    fig_charm.write_image('exports/Charm_Flow.svg', format='svg', scale=2, width=1200, height=600)
    fig_vanna.write_image('exports/Vanna_Sensitivity.svg', format='svg', scale=2, width=1200, height=600)
    fig_pin.write_image('exports/Pin_Risk.svg', format='svg', scale=2, width=1200, height=600)
    fig_rails.write_image('exports/Rails_Bounce.svg', format='svg', scale=2, width=1200, height=600)
    fig_exp.write_image('exports/Expiry_Pressure.svg', format='svg', scale=2, width=1200, height=600)
    fig_expo.write_image('exports/Gamma_Exposure_Curve.svg', format='svg', scale=2, width=1200, height=600)
except Exception as e:
    print('Falha ao gerar imagens estáticas:', e)
profit_script = ''
try:
    with open('exports/Profit_NTSL.txt','r',encoding='utf-8') as pf:
        profit_script = pf.read()
except Exception:
    profit_script = '// arquivo Profit_NTSL.txt não encontrado'
index_html = '''
<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><title>EDI &#8212; Market Guardian</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--bg:#0b1020;--fg:#e5e7eb;--panel:#111827;--border:#374151;--brand:#93c5fd}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font-family:system-ui,Segoe UI,Roboto}
  a{color:var(--brand);text-decoration:none}
  .topnav{position:sticky;top:0;left:0;right:0;background:#111827;border-bottom:1px solid var(--border);padding:10px 16px;z-index:9999;overflow-x:auto;white-space:nowrap}
  .topnav a{margin-right:18px;color:#9ca3af}
  .wrap{max-width:1200px;margin:24px auto;padding:0 16px}
  h1{margin:8px 0 18px 0;text-align:center;font-size:26px;color:#cbd5e1}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
  .card{background:var(--panel);border:1px solid var(--border);border-radius:12px;overflow:hidden}
  .thumb{width:100%;height:140px;object-fit:cover;display:block}
  .card-body{padding:12px}
  .card-body .title{font-weight:600;color:#e5e7eb;margin-bottom:6px}
</style></head><body>
<div class="topnav"><a href="index.html">&#8592; Home</a><a href="Figura3.html">Delta & GEX</a><a href="Figura4.html">GEX & Flip</a><a href="Fluxo_Hedge.html">Fluxo Hedge</a><a href="Dealer_Pressure.html">Dealer Pressure</a><a href="Gamma_Flip_Cone.html">Flip Cone</a><a href="Charm_Flow.html">Charm</a><a href="Vanna_Sensitivity.html">Vanna</a><a href="Pin_Risk.html">Pin Risk</a><a href="Rails_Bounce.html">Rails</a><a href="Expiry_Pressure.html">Expiry</a><a href="Gamma_Exposure_Curve.html">Exposure Curve</a></div>
<div class="wrap">
  <h1>EDI &#8212; Market Guardian</h1>
  <div class="grid" style="max-width:1200px;margin:0 auto">
    <div class="card"><img class="thumb" src="Figura3.png" alt="Figura 3 — Delta Agregado"><div class="card-body"><div class="title">Figura 3 — Delta Agregado</div><a href="Figura3.html?mode=Delta%20Agregado&embed=1">Abrir Modo</a></div></div>
    <div class="card"><img class="thumb" src="Figura3.png" alt="Figura 3 — GEX"><div class="card-body"><div class="title">Figura 3 — GEX</div><a href="Figura3.html?mode=GEX&embed=1">Abrir Modo</a></div></div>
    <div class="card"><img class="thumb" src="Figura3.png" alt="Figura 3 — Open Interest por Strike"><div class="card-body"><div class="title">Figura 3 — Open Interest por Strike</div><a href="Figura3.html?mode=Open%20Interest%20por%20Strike&embed=1">Abrir Modo</a></div></div>
    <div class="card"><img class="thumb" src="Figura3.png" alt="Figura 3 — Delta Acumulado"><div class="card-body"><div class="title">Figura 3 — Delta Acumulado</div><a href="Figura3.html?mode=Delta%20Acumulado&embed=1">Abrir Modo</a></div></div>
    <div class="card"><img class="thumb" src="Figura3.png" alt="Figura 3 — GEX (OI)"><div class="card-body"><div class="title">Figura 3 — GEX (OI)</div><a href="Figura3.html?mode=GEX%20(OI)&embed=1">Abrir Modo</a></div></div>
    <div class="card"><img class="thumb" src="Figura3.png" alt="Figura 3 — GEX (IV)"><div class="card-body"><div class="title">Figura 3 — GEX (IV)</div><a href="Figura3.html?mode=GEX%20(IV)&embed=1">Abrir Modo</a></div></div>
    <div class="card"><img class="thumb" src="Figura3.png" alt="Figura 3 — R Gamma (PVOP)"><div class="card-body"><div class="title">Figura 3 — R Gamma (PVOP)</div><a href="Figura3.html?mode=R%20Gamma%20(PVOP)&embed=1">Abrir Modo</a></div></div>
    <div class="card"><img class="thumb" src="Figura3.png" alt="Figura 3 — Charm Exposure"><div class="card-body"><div class="title">Figura 3 — Charm Exposure</div><a href="Figura3.html?mode=Charm%20Exposure&embed=1">Abrir Modo</a></div></div>
    <div class="card"><img class="thumb" src="Figura3.png" alt="Figura 3 — Vanna Exposure"><div class="card-body"><div class="title">Figura 3 — Vanna Exposure</div><a href="Figura3.html?mode=Vanna%20Exposure&embed=1">Abrir Modo</a></div></div>
  </div>
  <div class="grid">
    <div class="card"><img class="thumb" src="Figura3.png" alt="Painel Delta & GEX"><div class="card-body"><div class="title">Painel Delta & GEX</div><a href="Figura3.html">Abrir Painel</a> · <a href="Figura3_Tabela.html">Tabela</a></div></div>
    <div class="card"><img class="thumb" src="Figura4.png" alt="GEX & Gamma Flip"><div class="card-body"><div class="title">GEX & Gamma Flip</div><a href="Figura4.html">Abrir Painel</a> · <a href="Figura4_Tabela.html">Tabela</a></div></div>
    <div class="card"><img class="thumb" src="Figura4.png" alt="Gamma Flip Analysis"><div class="card-body"><div class="title">Gamma Flip Analysis</div><a href="Gamma_Flip_Analysis.html">Abrir Tabela</a></div></div>\n",
    <div class="card"><img class="thumb" src="Fluxo_Hedge.png" alt="Fluxo de Hedge (Gamma)"><div class="card-body"><div class="title">Fluxo de Hedge (Gamma)</div><a href="Fluxo_Hedge.html">Abrir Painel</a> · <a href="Fluxo_Hedge_Tabela.html">Tabela</a></div></div>
    <div class="card"><img class="thumb" src="Fluxo_Hedge.png" alt="Flow Sentiment"><div class="card-body"><div class="title">Flow Sentiment</div><a href="Flow_Sentiment.html">Abrir Painel</a></div></div>\n",
    <div class="card"><img class="thumb" src="Dealer_Pressure.png" alt="Dealer Pressure 2.0"><div class="card-body"><div class="title">Dealer Pressure 2.0</div><a href="Dealer_Pressure.html">Abrir Painel</a> · <a href="Dealer_Pressure_Tabela.html">Tabela</a></div></div>
    <div class="card"><img class="thumb" src="Gamma_Flip_Cone.png" alt="Gamma Flip Cone"><div class="card-body"><div class="title">Gamma Flip Cone</div><a href="Gamma_Flip_Cone.html">Abrir Painel</a> · <a href="Gamma_Flip_Cone_Tabela.html">Tabela</a></div></div>
    <div class="card"><img class="thumb" src="Charm_Flow.png" alt="Charm Flow Diário"><div class="card-body"><div class="title">Charm Flow Diário</div><a href="Charm_Flow.html">Abrir Painel</a> · <a href="Charm_Flow_Tabela.html">Tabela</a></div></div>
    <div class="card"><img class="thumb" src="Vanna_Sensitivity.png" alt="Vanna Vol-Sensitivity"><div class="card-body"><div class="title">Vanna Vol‑Sensitivity</div><a href="Vanna_Sensitivity.html">Abrir Painel</a> · <a href="Vanna_Sensitivity_Tabela.html">Tabela</a></div></div>
    <div class="card"><img class="thumb" src="Pin_Risk.png" alt="Pin Risk & Magnet Score"><div class="card-body"><div class="title">Pin Risk & Magnet</div><a href="Pin_Risk.html">Abrir Painel</a> · <a href="Pin_Risk_Tabela.html">Tabela</a></div></div>
    <div class="card"><img class="thumb" src="Rails_Bounce.png" alt="Rails & Bounce Zones"><div class="card-body"><div class="title">Rails & Bounce</div><a href="Rails_Bounce.html">Abrir Painel</a></div></div>
    <div class="card"><img class="thumb" src="Expiry_Pressure.png" alt="Expiry Pressure"><div class="card-body"><div class="title">Expiry Pressure</div><a href="Expiry_Pressure.html">Abrir Painel</a> · <a href="Expiry_Pressure_Tabela.html">Tabela</a></div></div>
    <div class="card"><img class="thumb" src="Gamma_Exposure_Curve.png" alt="Gamma Exposure Curve"><div class="card-body"><div class="title">Gamma Exposure Curve</div><a href="Gamma_Exposure_Curve.html">Abrir Painel</a></div></div>
    <div class="card"><img class="thumb" src="Gamma_Levels_Profit.svg" alt="Gamma Levels Profit"><div class="card-body"><div class="title">Gamma Levels Profit</div><button id="copyProfitBtn" style="background:#1f2937;color:#e5e7eb;border:1px solid #374151;border-radius:8px;padding:8px 12px;cursor:pointer">Copiar código do Profit</button><textarea id="profitTextarea" style="display:none; width:100%; height:140px; margin-top:8px; background:#0b1020; color:#e5e7eb; border:1px solid #374151; border-radius:6px;"></textarea><script>(function(){var btn=document.getElementById('copyProfitBtn');var ta=document.getElementById('profitTextarea');var profitScript = __PROFIT_SCRIPT__; if(ta){ta.value=profitScript;} if(btn){btn.onclick=async function(){try{await navigator.clipboard.writeText(profitScript);alert('Código copiado para a área de transferência.');}catch(e){ta.style.display='block';ta.select();document.execCommand('copy');}}}})();</script></div></div>
  </div>
</div>
</body></html>
'''
index_html = index_html.replace('__PROFIT_SCRIPT__', json.dumps(profit_script))
controls_html = ""
index_html = index_html.replace("  <h1>EDI &#8212; Market Guardian</h1>", "  <h1>EDI &#8212; Market Guardian</h1>")
styles_append = ""
index_html = index_html.replace("</style></head><body>", "</style><style>" + styles_append + "</style></head><body>")
badges_style = ".badgebar{display:flex;gap:8px;justify-content:center;align-items:center;margin:12px 0}.badge{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid #374151;border-radius:999px;background:#111827;color:#e5e7eb;font-size:12px}.badge .dot{width:8px;height:8px;border-radius:999px;background:#9ca3af}.badge.green .dot{background:#34d399}.badge.red .dot{background:#ef4444}.badge.yellow .dot{background:#f59e0b}.badgebar .label{color:#9ca3af;font-size:12px}"
index_html = index_html.replace("</style></head><body>", "</style><style>" + badges_style + "</style></head><body>")
badges_html = "<div class=\"badgebar\"><span class=\"label\">Status:</span><span id=\"badge-regime\" class=\"badge\"><span class=\"dot\"></span><span>Regime de Gamma</span></span><span id=\"badge-clima\" class=\"badge\"><span class=\"dot\"></span><span>Clima do Mercado</span></span></div>"
index_html = index_html.replace("  <h1>EDI &#8212; Market Guardian</h1>", "  <h1>EDI &#8212; Market Guardian</h1>\n  " + badges_html)
index_html = index_html.replace('Figura 3 — ', '')
theta_card = "    <div class=\"card\"><img class=\"thumb\" src=\"Theta_Exposure.png\" alt=\"Theta Exposure\"><div class=\"card-body\"><div class=\"title\">Theta Exposure</div><a href=\"Theta_Exposure.html\">Abrir Modo</a></div></div>\n"
index_html = index_html.replace("  </div>\n  <div class=\"grid\"", theta_card + "  </div>\n  <div class=\"grid\"")
script_controls = ""
index_html = index_html.replace("</body></html>", "<script>" + script_controls + "</script></body></html>")
# with open('exports/index.html','w',encoding='utf-8') as f: f.write(index_html) # DISABLED INDEX OVERWRITE
agg = options.groupby(['StrikeK','OptionType'], as_index=False)['Open Int'].sum().pivot(index='StrikeK', columns='OptionType', values='Open Int').fillna(0)
agg = agg.rename(columns={'CALL':'CALL_OI','PUT':'PUT_OI'}).reset_index().rename(columns={'StrikeK':'Strike'})
agg.to_csv('exports/oi_by_strike.csv', index=False, encoding='utf-8')
try:
    fig3.write_image('exports/Painel_Delta_GEX.svg', format='svg', width=1400, height=650)
    fig4.write_image('exports/GEX_Gamma_Flip.svg', format='svg', width=1400, height=650)
    fig_flow.write_image('exports/Fluxo_Hedge.svg', format='svg', width=1200, height=600)
    fig_dp.write_image('exports/Dealer_Pressure.svg', format='svg', width=1200, height=600)
    fig_cone.write_image('exports/Gamma_Flip_Cone.svg', format='svg', width=1200, height=600)
    fig_charm.write_image('exports/Charm_Flow.svg', format='svg', width=1200, height=600)
    fig_vanna.write_image('exports/Vanna_Sensitivity.svg', format='svg', width=1200, height=600)
    fig_pin.write_image('exports/Pin_Risk.svg', format='svg', width=1200, height=600)
    fig_rails.write_image('exports/Rails_Bounce.svg', format='svg', width=1200, height=600)
    fig_exp.write_image('exports/Expiry_Pressure.svg', format='svg', width=1200, height=600)
except Exception as e:
    pass

# CELL 34

# --- EDI: GERAÇÃO DE RELATÓRIO UNIFICADO V4 (CORREÇÃO PLOTLY) ---
def generate_full_report_edi():
    print('Gerando Relatório Unificado Completo (V4 - High Quality)...')
    
    # 1. Extração de Traces da Figura 3 para gráficos individuais
    traces_map = {}
    if 'fig3' in globals():
        for trace in fig3.data:
            traces_map[trace.name] = trace

    def create_fig_from_trace(trace_name, title, color_override=None):
        f = go.Figure()
        if trace_name in traces_map:
            t = traces_map[trace_name]
            import copy
            new_t = copy.deepcopy(t)
            new_t.visible = True
            if color_override: new_t.marker.color = color_override
            f.add_trace(new_t)
            if 'spot_line' in globals(): f.add_shape(spot_line)
            f.update_layout(template='plotly_dark', title=title, height=400,
                          paper_bgcolor='#111827', plot_bgcolor='#111827', margin=dict(t=50, b=50, l=50, r=50))
            return f
        return None

    # Criar figuras auxiliares baseadas na Fig3
    f3_gex_oi = create_fig_from_trace('Gamma Exposure (OI)', 'GEX baseado apenas em Open Interest')
    f3_gex_iv = create_fig_from_trace('Gamma Exposure (IV)', 'GEX baseado apenas em Volatilidade')
    f3_pvop = create_fig_from_trace('R Gamma (PVOP assinado)', 'R Gamma (PVOP) - Pressão Vendedora de Puts')
    
    # 2. Montar Tabela de Pontos Importantes
    spot_val = SPOT if 'SPOT' in globals() else 0
    delta_agg = delta_agregado_val if 'delta_agregado_val' in globals() else 0
    iv_val = IV_DAILY if 'IV_DAILY' in globals() else 0
    r_low = range_low if 'range_low' in globals() else 0
    r_high = range_high if 'range_high' in globals() else 0
    g_flip = gamma_flip if 'gamma_flip' in globals() else 0
    regime_val = regime if 'regime' in globals() else 'N/A'
    cw_prox = f"{call_wall} (dist {abs(call_wall-spot_val):.0f})" if 'call_wall' in globals() else ''
    pw_prox = f"{put_wall} (dist {abs(put_wall-spot_val):.0f})" if 'put_wall' in globals() else ''
    
    table_html = f"""
    <div class='section'>
        <h2>Tabela de Pontos Importantes</h2>
        <div class='help-box'><div class='help-title'>Resumo Estrutural</div>Dados calculados no momento da execução.</div>
        <table style='width:100%; border-collapse: collapse; color: #e5e7eb; background: #1f2937; border-radius: 8px; overflow: hidden;'>
            <tr style='background: #374151; text-align: left;'><th style='padding: 12px;'>Item</th><th style='padding: 12px;'>Valor</th><th style='padding: 12px;'>Descrição</th></tr>
            <tr><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>Spot</td><td style='padding: 10px; border-bottom: 1px solid #4b5563; font-weight: bold;'>{spot_val:.2f}</td><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>Preço à vista</td></tr>
            <tr><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>Delta Agregado</td><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>{delta_agg:,.0f}</td><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>Soma líquida de Delta</td></tr>
            <tr><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>Volatilidade Diária</td><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>{iv_val*100:.2f}%</td><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>IV ATM normalizada</td></tr>
            <tr><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>Range Esperado</td><td style='padding: 10px; border-bottom: 1px solid #4b5563; color: yellow;'>{r_low:.0f} — {r_high:.0f}</td><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>Limites estatísticos intradia</td></tr>
            <tr><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>Gamma Flip</td><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>{g_flip:.2f}</td><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>Nível de inversão de Gamma</td></tr>
            <tr><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>Regime</td><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>{regime_val}</td><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>Condição de mercado</td></tr>
            <tr><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>CALL Wall Próxima</td><td style='padding: 10px; border-bottom: 1px solid #4b5563; color: #ef4444;'>{cw_prox}</td><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>Resistência imediata</td></tr>
            <tr><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>PUT Wall Próxima</td><td style='padding: 10px; border-bottom: 1px solid #4b5563; color: #22c55e;'>{pw_prox}</td><td style='padding: 10px; border-bottom: 1px solid #4b5563;'>Suporte imediato</td></tr>
        </table>
    </div>
    """

    html_content = """
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Relatório Unificado EDI</title>
        <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background-color: #0b1020; color: #e5e7eb; margin: 0; padding: 20px; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #374151; margin-bottom: 40px; position: relative; }
            .logo { font-size: 2em; font-weight: bold; color: #60a5fa; }
            .section { margin-bottom: 60px; page-break-inside: avoid; }
            .help-box { background-color: #1f2937; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
            .help-title { font-weight: bold; color: #93c5fd; margin-bottom: 5px; }
            .help-list { margin: 0; padding-left: 20px; color: #d1d5db; }
            .plot-container { background-color: #111827; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .btn-home { position: absolute; left: 0; top: 20px; background: #374151; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; }
            .btn-home:hover { background: #4b5563; }
            @media print {
                .btn-home { display: none; }
                body { background-color: white; color: black; }
                .help-box { background-color: #f3f4f6; color: black; border-left-color: #000; }
                .plot-container { box-shadow: none; border: 1px solid #ccc; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <a href="index.html" class="btn-home">&#8592; Voltar para Home</a>
                <div class="logo">EDI — Market Guardian</div>
                <p>Relatório de Análise de Estrutura de Mercado e Opções</p>
            </div>
            
            <!-- Tabela de Pontos Importantes -->
            """ + table_html

    # Lista sequencial de gráficos
    report_items = [
        ('OI_Strike', 'Open Interest por Strike', 'Mostra a distribuição total de contratos Abertos (OI) para Calls e Puts.', ['Barras altas indicam zonas de liquidez.', 'Paredes de Calls/Puts atuam como suporte/resistência.']),
        ('Delta_Agregado', 'Delta Agregado', 'Exposição líquida direcional dos Dealers.', ['Positivo: Dealers comprados (ajudam a subir).', 'Negativo: Dealers vendidos (ajudam a cair).']),
        ('Gamma_Exposure', 'Gamma Exposure', 'Sensibilidade do Delta e potencial de aceleração.', ['Barras grandes indicam onde o preço pode travar ou acelerar.']),
        ('Vanna_Exposure', 'Vanna Exposure', 'Sensibilidade do Delta à mudanças na Volatilidade.', ['Mostra como o hedge muda com a variação da IV.']),
        ('Charm_Exposure', 'Charm Exposure', 'Sensibilidade do Delta à passagem do tempo.', ['Indica fluxos automáticos de fim de dia/fim de semana.']),
        # Inserir componentes da Fig3
        (f3_gex_oi, 'Gamma Exposure (OI)', 'GEX calculado isolando a variável Open Interest.', ['Remove o efeito da volatilidade para ver posicionamento puro.']),
        (f3_gex_iv, 'Gamma Exposure (IV)', 'GEX calculado isolando a variável Volatilidade.', ['Mostra onde a vol tem maior impacto.']),
        (f3_pvop, 'R Gamma (PVOP)', 'Pressão Vendedora de Opções de Venda (Puts).', ['Indicador de suporte institucional.']),
        
        ('Fluxo_Hedge', 'Fluxo de Hedge (Gamma Imbalance)', 'Estimativa financeira do fluxo de rebalanceamento.', ['Valores altos: pressão de compra/venda no spot.']),
        ('Dealer_Pressure', 'Dealer Pressure', 'Indicador sintético de pressão comprador/vendedora.', ['Cruzamento de linhas pode sinalizar reversão.']),
        ('Gamma_Flip_Cone', 'Gamma Flip Cone', 'Projeção de mudança de regime de Gamma.', ['O cone mostra a estabilidade do nível de Flip.']),
        ('Flow_Sentiment', 'Flow Sentiment', 'Relação entre agressão de preço e volume.', ['Divergências indicam exaustão ou absorção.']),
        ('Expiry_Pressure', 'Expiry Pressure', 'Pressão de rolagem e vencimento.', ['Incentivo para fechar no vencimento.']),
        ('Charm_Flow', 'Charm Flow Diário', 'Fluxo financeiro estimado pelo Charm.', ['Rebalanceamento apenas pela passagem do tempo.']),
        ('Vanna_Sensitivity', 'Vanna Sensitivity', 'Sensibilidade do Delta à Volatilidade.', ['Picos indicam impacto de IV no hedge.']),
        ('Pin_Risk', 'Pin Risk & Magnet Score', 'Probabilidade de atração para strikes.', ['Score alto indica chance de Pinning.']),
        ('Rails_Bounce', 'Rails & Bounce Zones', 'Zonas de suporte/resistência por volatilidade.', ['Bandas respeitadas em baixa vol.']),
        ('Gamma_Exposure_Curve', 'Gamma Exposure Curve', 'Perfil de Gamma ao longo dos strikes.', ['Convexidade e aceleração.'])
    ]

    for item in report_items:
        fig_obj = None
        if isinstance(item[0], str):
            # É um nome de variável global
            if item[0] == 'OI_Strike' and 'fig_oi' in globals(): fig_obj = fig_oi
            elif item[0] == 'Delta_Agregado' and 'fig_delta' in globals(): fig_obj = fig_delta
            elif item[0] == 'Gamma_Exposure' and 'fig_gamma' in globals(): fig_obj = fig_gamma
            elif item[0] == 'Vanna_Exposure' and 'fig_vanna_bar' in globals(): fig_obj = fig_vanna_bar
            elif item[0] == 'Charm_Exposure' and 'fig_charm_bar' in globals(): fig_obj = fig_charm_bar
            elif item[0] == 'Fluxo_Hedge' and 'fig_flow' in globals(): fig_obj = fig_flow
            elif item[0] == 'Dealer_Pressure' and 'fig_dp' in globals(): fig_obj = fig_dp
            elif item[0] == 'Gamma_Flip_Cone' and 'fig_cone' in globals(): fig_obj = fig_cone
            elif item[0] == 'Flow_Sentiment' and 'fig_sent' in globals(): fig_obj = fig_sent
            elif item[0] == 'Expiry_Pressure' and 'fig_exp' in globals(): fig_obj = fig_exp
            elif item[0] == 'Charm_Flow' and 'fig_charm' in globals(): fig_obj = fig_charm
            elif item[0] == 'Vanna_Sensitivity' and 'fig_vanna' in globals(): fig_obj = fig_vanna
            elif item[0] == 'Pin_Risk' and 'fig_pin' in globals(): fig_obj = fig_pin
            elif item[0] == 'Rails_Bounce' and 'fig_rails' in globals(): fig_obj = fig_rails
            elif item[0] == 'Gamma_Exposure_Curve' and 'fig_expo' in globals(): fig_obj = fig_expo
        else:
            # É um objeto figura já passado
            fig_obj = item[0]
            
        if fig_obj:
            # Forçar background escuro para garantir legibilidade
            fig_obj.update_layout(paper_bgcolor='#111827', plot_bgcolor='#111827', font=dict(color='#e5e7eb'))
            
            # Gerar HTML do Plotly (apenas a div, sem script pois já está no head)
            plot_html = fig_obj.to_html(full_html=False, include_plotlyjs=False)
            
            title = item[1]
            desc = item[2]
            tips = item[3]
            
            tips_html = "".join([f"<li>{t}</li>" for t in tips])
            
            html_content += f"""
            <div class='section'>
                <h2>{title}</h2>
                <div class='help-box'>
                    <div class='help-title'>Como ler este gráfico</div>
                    <p>{desc}</p>
                    <ul class='help-list'>{tips_html}</ul>
                </div>
                <div class='plot-container'>
                    {plot_html}
                </div>
            </div>
            """
            
    html_content += "</div></body></html>"
    
    with open('exports/relatorio_completo.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
        
    print('Relatório gerado com sucesso: exports/relatorio_completo.html')


# CELL 35

def generate_dashboard_report(_modes):
    print("Generating Dashboard Report (Rich Iframe Version)...")
    
    # Define sections mapping (Title, Filename, Description)
    sections = [
        ("Delta Agregado", "Delta_Agregado.html", "Exposição líquida direcional dos Dealers. (Comprado/Vendido)"),
        ("Open Interest por Strike", "OI_Strike.html", "Distribuição total de contratos Abertos (OI). Paredes de liquidez."),
        ("Gamma Exposure", "Gamma_Exposure.html", "Exposição de Gamma. Aceleração do movimento."),
        ("Delta Acumulado", "Delta_Acumulado.html", "Delta acumulado por strike. Visão integral."),
        ("GEX (OI)", "GEX_OI.html", "Gamma Exposure baseado em Open Interest puro."),
        ("GEX (IV)", "GEX_IV.html", "Gamma Exposure ponderado pela Volatilidade Implícita."),
        ("R Gamma (PVOP)", "PVOP.html", "Perfil de Volume de Opções Ponderado."),
        ("Charm Exposure", "Charm_Exposure.html", "Sensibilidade do Delta à passagem do tempo (Decay)."),
        ("Vanna Exposure", "Vanna_Exposure.html", "Sensibilidade do Delta à mudanças na Volatilidade (IV)."),
        ("Theta Exposure", "Theta_Exposure.html", "Perda de valor das opções com o tempo (Theta)."),
        ("Painel Delta & GEX", "Figura3.html", "Painel Interativo Completo (Todos os Modos)."),
        ("GEX & Gamma Flip", "Gamma_Flip_Profile.html", "Perfil de Gamma Flip e mudança de regime."),
        ("Gamma Flip Analysis", "Gamma_Flip_Analysis.html", "Análise detalhada de Gamma Flip."),
    ]
    
    html_content = """<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>EDI - Dashboard Analítico</title>
    <style>
        :root { --bg: #0b1020; --panel: #111827; --border: #374151; --text: #e5e7eb; --accent: #93c5fd; }
        body { background-color: var(--bg); color: var(--text); font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; }
        h1 { text-align: center; margin-bottom: 30px; color: var(--accent); }
        .nav { text-align: center; margin-bottom: 20px; }
        .nav a { color: var(--accent); text-decoration: none; font-weight: bold; font-size: 1.1em; padding: 8px 16px; border: 1px solid var(--border); border-radius: 6px; background: var(--panel); transition: all 0.2s; }
        .nav a:hover { background: #1f2937; border-color: var(--accent); }
        
        .section { margin-bottom: 40px; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; background: var(--panel); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5); }
        .section h2 { background: #1f2937; margin: 0; padding: 12px 20px; font-size: 1.2em; border-bottom: 1px solid var(--border); color: #fff; }
        
        .help-box { padding: 15px 20px; background: #1f2937; border-bottom: 1px solid var(--border); font-size: 0.95em; color: #9ca3af; }
        .help-title { font-weight: bold; color: #d1d5db; margin-bottom: 5px; display: block; }
        .help-list { margin: 5px 0 0 0; padding-left: 20px; }
        
        .plot-container { width: 100%; height: 650px; position: relative; background: #000; }
        iframe { width: 100%; height: 100%; border: none; display: block; }
    </style>
</head>
<body>
    <h1>EDI - Dashboard Analítico</h1>
    <div class="nav">
        <a href="index.html">&larr; Voltar para Home</a>
    </div>
"""

    for title, filename, desc in sections:
        html_content += f"""
    <div class='section'>
        <h2>{title}</h2>
        <div class='help-box'>
            <span class='help-title'>Sobre este gráfico</span>
            {desc}
        </div>
        <div class='plot-container'>
            <iframe src="{filename}" loading="lazy" scrolling="no"></iframe>
        </div>
    </div>
"""

    html_content += """
    <div style="text-align:center; margin-top: 40px; color: #6b7280; font-size: 0.8em;">
        Gerado pelo EDI Analytics System
    </div>
</body></html>"""
    
    with open('exports/dashboard.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"dashboard.html updated with {len(sections)} interactive charts.")


# CELL 36
# --- EXTRAÇÃO FIGURA 3 PARA HTML INDIVIDUAL (TODOS OS 15 MODOS) ---
print('Gerando TODOS os painéis individuais da Figura 3 (15 modos)...')
if 'fig3' in globals() and 'save_panel' in globals():
    # Mapear traces da fig3 original para reutilizar
    f3_data = fig3.data
    
    # Shapes comuns
    common_shapes = [spot_line, hline0]
    if 'range_lines' in globals(): common_shapes += range_lines
    if 'flip_line' in globals() and flip_line: common_shapes.append(flip_line)
    
    # Annotations comuns
    common_annos = [spot_label]
    if 'range_low_label' in globals(): common_annos.append(range_low_label)
    if 'range_high_label' in globals(): common_annos.append(range_high_label)
    if 'flip_label' in globals() and flip_label: common_annos.append(flip_label)
    
    # Trace invisível para definir range do eixo X em gráficos de overlay
    dummy_trace = go.Scatter(x=strikes_ref, y=np.zeros_like(strikes_ref), mode='markers', marker=dict(opacity=0), showlegend=False, hoverinfo='skip')

    # 1. Modos baseados em Dados (Traces)
    modes = {
        'Delta_Agregado.html': {'idxs': [0], 'title': 'Delta Agregado', 'desc': 'Soma do Delta de todas as opções por strike.'},
        'Delta_Acumulado.html': {'idxs': [1], 'title': 'Delta Acumulado', 'desc': 'Acúmulo líquido do Delta ao longo dos strikes.'},
        'GEX.html': {'idxs': [2, 3], 'title': 'Gamma Exposure (GEX)', 'desc': 'Exposição de Gamma total e sua curvatura acumulada.'},
        'GEX_OI.html': {'idxs': [10, 13], 'title': 'Gamma Exposure (OI)', 'desc': 'GEX calculado isolando apenas a variável Open Interest.'},
        'GEX_IV.html': {'idxs': [11, 14], 'title': 'Gamma Exposure (IV)', 'desc': 'GEX calculado isolando apenas a variável Volatilidade Implícita.'},
        'R_Gamma_PVOP.html': {'idxs': [12], 'title': 'R Gamma (PVOP)', 'desc': 'Gamma ponderado pelo volume de Puts (Put Volume Over Price).'},
        'OI_Strike.html': {'idxs': [4, 5, 6, 7], 'title': 'Open Interest por Strike', 'desc': 'Contratos em aberto (Calls vs Puts) e Midwalls.'},
        'Charm_Exposure.html': {'idxs': [8], 'title': 'Charm Exposure', 'desc': 'Sensibilidade do Delta à passagem do tempo (Decaimento).'},
        'Vanna_Exposure.html': {'idxs': [9], 'title': 'Vanna Exposure', 'desc': 'Sensibilidade do Delta a mudanças na Volatilidade Implícita.'},
        'Visao_Completa.html': {'idxs': [0, 2, 4, 5], 'title': 'Visão Completa', 'desc': 'Visão geral combinando Delta, Gamma e OI.'}
    }

    for fname, cfg in modes.items():
        try:
            traces = []
            for i in cfg['idxs']:
                if i < len(f3_data):
                    t = f3_data[i]
                    t.visible = True
                    traces.append(t)
            
            if traces:
                fig_sub = go.Figure(data=traces)
                fig_sub.update_layout(
                    template='plotly_dark', 
                    title=dict(text=f"EDI - {cfg['title']}", font=dict(color='white', size=18), x=0.5),
                    xaxis_title='Strike', 
                    yaxis_title='Valor',
                    shapes=common_shapes,
                    annotations=common_annos,
                    barmode='overlay',
                    margin=dict(t=80)
                )
                # Adicionar Walls extras apenas para OI e Visão Completa
                if 'OI' in cfg['title'] or 'Completa' in cfg['title']:
                    if 'wall_lines' in globals(): 
                        for w in wall_lines: fig_sub.add_shape(w)
                
                save_panel(fig_sub, fname, cfg['title'], help_blocks={'desc': cfg['desc']})
                print(f'Gerado: {fname}')
        except Exception as e: print(f'Erro ao gerar {fname}: {e}')

    # 2. Modos de Overlay (Shapes Específicos)
    overlays = [
        ('Overlay_Fibo.html', 'Strikes + Midwalls + Fibonacci', 
         shapes_strike_mid_fibo if 'shapes_strike_mid_fibo' in globals() else common_shapes,
         annos_strike_mid_fibo if 'annos_strike_mid_fibo' in globals() else common_annos),
         
        ('Overlay_Range_Walls.html', 'Range + Walls',
         [spot_line, hline0] + (range_lines if 'range_lines' in globals() else []) + (wall_lines if 'wall_lines' in globals() else []),
         common_annos),
         
        ('Overlay_Range.html', 'Range apenas',
         [spot_line, hline0] + (range_lines if 'range_lines' in globals() else []),
         common_annos),
         
        ('Overlay_Walls.html', 'Walls apenas',
         [spot_line, hline0] + (wall_lines if 'wall_lines' in globals() else []),
         common_annos),
         
        ('Overlay_Clean.html', 'Limpar overlays',
         [spot_line, hline0],
         [spot_label])
    ]

    for fname, title, shps, anns in overlays:
        try:
            fig_ov = go.Figure(data=[dummy_trace])
            fig_ov.update_layout(
                template='plotly_dark', 
                title=title,
                xaxis_title='Strike', 
                yaxis_title='-',
                shapes=shps,
                annotations=anns,
                margin=dict(t=80)
            )
            save_panel(fig_ov, fname, title, {'Ajuda': ['Visualização focada em níveis de suporte e resistência.']})
            print(f'Gerado: {fname}')
        except Exception as e: print(f'Erro ao gerar {fname}: {e}')


# CELL 37
import plotly.graph_objects as go
if 'save_panel' in globals():
    f = go.Figure([go.Bar(x=strikes_ref, y=dexp_tot, name='Delta Agregado', marker_color=['lime' if v>=0 else 'red' for v in dexp_tot])])
    if 'spot_line' in globals(): f.add_shape(spot_line)
    if 'hline0' in globals(): f.add_shape(hline0)
    f.update_layout(template='plotly_dark', xaxis_title='Strike', yaxis_title='Exposição / OI', height=450)
    save_panel(f, 'Delta_Agregado.html', 'Delta Agregado', help_blocks={'desc':'Soma do delta por strike. Indica posicionamento líquido.', 'tips':['Magnitudes extremas sugerem viés de hedge mais intenso.']})


# CELL 38
import plotly.graph_objects as go
if 'save_panel' in globals():
    f = go.Figure()
    f.add_trace(go.Bar(x=strikes_ref, y=gex_tot, name='Gamma Exposure', marker_color='cyan', opacity=0.6))
    f.add_trace(go.Scatter(x=strikes_ref, y=gex_cum, mode='lines', name='Curvatura do Gamma (acumulado)', line=dict(color='orange', width=3)))
    if 'spot_line' in globals(): f.add_shape(spot_line)
    if 'flip_line' in globals(): f.add_shape(flip_line)
    if 'hline0' in globals(): f.add_shape(hline0)
    f.update_layout(template='plotly_dark', xaxis_title='Strike', yaxis_title='Exposição / OI', height=450)
    save_panel(f, 'Gamma_Exposure.html', 'Gamma Exposure', help_blocks={'desc':'Exposição de Gamma agregada.', 'tips':['Picos positivos tendem a travar o preço; negativos ampliam volatilidade.']})


# CELL 39
import plotly.graph_objects as go
if 'save_panel' in globals():
    f = go.Figure()
    f.add_trace(go.Bar(x=strikes_ref, y=oi_call_ref, name='CALL OI', marker_color='blue'))
    f.add_trace(go.Bar(x=strikes_ref, y=-oi_put_ref, name='PUT OI', marker_color='red'))
    if 'spot_line' in globals(): f.add_shape(spot_line)
    if 'hline0' in globals(): f.add_shape(hline0)
    f.update_layout(template='plotly_dark', barmode='overlay', xaxis_title='Strike', yaxis_title='Contratos Abertos', height=450)
    save_panel(f, 'OI_Strike.html', 'Open Interest por Strike', help_blocks={'desc':'Distribuição de contratos. Ajuda a localizar paredes de liquidez.', 'tips':['Concentração elevada sinaliza zonas de interesse.']})


# CELL 40
# --- EXPORTAÇÃO INDIVIDUAL DOS GRÁFICOS DA FIGURA 3 (15 MODOS) ---
print('Iniciando exportação dos 15 painéis da Figura 3...')

# Função auxiliar para salvar painel (caso não exista)
def save_panel_local(fig, filename, title, help_blocks=None):
    try:
        import os, re
        os.makedirs('exports', exist_ok=True)
        # Add EDI Logo
#         fig.add_layout_image( # DISABLED LOGO
#             dict(
#                 source="../edi_logo.png",
#                 xref="paper", yref="paper",
#                 x=0.01, y=0.99,
#                 sizex=0.1, sizey=0.1,
#                 xanchor="left", yanchor="top",
#                 layer="above"
#             )
#         )
        fig.update_layout(template='plotly_dark', title=dict(text=title, font=dict(color='white', size=18), x=0.5), margin=dict(t=100))
        html = fig.to_html(include_plotlyjs='cdn', full_html=True)
        html = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', html, flags=re.S)
        
        # Injeção básica de Home/Menu se disponível (funções do notebook)
        if 'inject_home' in globals(): html = inject_home(html)
        if 'inject_help' in globals() and help_blocks:
             for h_title, h_items in help_blocks.items():
                 html = inject_help(html, h_title, h_items)
                 
        filepath = f'exports/{filename}'
        with open(filepath, 'w', encoding='utf-8') as f: f.write(html)
        print(f"Saved {filepath}")
    except Exception as e:
        print(f"Error saving panel {filename}: {e}")

if 'fig3' in globals():
    # Mapear traces da fig3 original
    f3_data = fig3.data
    
    # Shapes e Annotations comuns
    common_shapes = [spot_line, hline0]
    if 'range_lines' in globals(): common_shapes += range_lines
    if 'flip_line' in globals() and flip_line: common_shapes.append(flip_line)
    
    common_annos = [spot_label]
    if 'range_low_label' in globals(): common_annos.append(range_low_label)
    if 'range_high_label' in globals(): common_annos.append(range_high_label)
    if 'flip_label' in globals() and flip_label: common_annos.append(flip_label)
    
    # Trace invisível para overlay
    dummy_trace = go.Scatter(x=strikes_ref, y=np.zeros_like(strikes_ref), mode='markers', marker=dict(opacity=0), showlegend=False, hoverinfo='skip')

    # 1. Modos de Dados
    modes_data = {
        'Delta_Agregado.html': {'idxs': [0], 'title': 'Delta Agregado', 'desc': 'Soma do Delta de todas as opções por strike.'},
        'Delta_Acumulado.html': {'idxs': [1], 'title': 'Delta Acumulado', 'desc': 'Acúmulo líquido do Delta ao longo dos strikes.'},
        'GEX.html': {'idxs': [2, 3], 'title': 'Gamma Exposure (GEX)', 'desc': 'Exposição de Gamma total e sua curvatura acumulada.'},
        'GEX_OI.html': {'idxs': [10, 13], 'title': 'Gamma Exposure (OI)', 'desc': 'GEX calculado isolando apenas a variável Open Interest.'},
        'GEX_IV.html': {'idxs': [11, 14], 'title': 'Gamma Exposure (IV)', 'desc': 'GEX calculado isolando apenas a variável Volatilidade Implícita.'},
        'R_Gamma_PVOP.html': {'idxs': [12], 'title': 'R Gamma (PVOP)', 'desc': 'Gamma ponderado pelo volume de Puts (Put Volume Over Price).'},
        'OI_Strike.html': {'idxs': [4, 5, 6, 7], 'title': 'Open Interest por Strike', 'desc': 'Contratos em aberto (Calls vs Puts) e Midwalls.'},
        'Charm_Exposure.html': {'idxs': [8], 'title': 'Charm Exposure', 'desc': 'Sensibilidade do Delta à passagem do tempo (Decaimento).'},
        'Vanna_Exposure.html': {'idxs': [9], 'title': 'Vanna Exposure', 'desc': 'Sensibilidade do Delta a mudanças na Volatilidade Implícita.'},
        'Visao_Completa.html': {'idxs': [0, 2, 4, 5], 'title': 'Visão Completa', 'desc': 'Visão geral combinando Delta, Gamma e OI.'}
    }

    for fname, cfg in modes_data.items():
        try:
            traces = []
            for i in cfg['idxs']:
                if i < len(f3_data):
                    import copy
                    t = copy.deepcopy(f3_data[i])
                    t.visible = True
                    traces.append(t)
            
            if traces:
                fig_sub = go.Figure(data=traces)
                fig_sub.update_layout(
                    template='plotly_dark', 
                    title=dict(text=f"EDI - {cfg['title']}", font=dict(color='white', size=18), x=0.5),
                    xaxis_title='Strike', 
                    yaxis_title='Valor',
                    shapes=common_shapes,
                    annotations=common_annos,
                    barmode='overlay',
                    margin=dict(t=80)
                )
                if 'OI' in cfg['title'] or 'Completa' in cfg['title']:
                    if 'wall_lines' in globals(): 
                        for w in wall_lines: fig_sub.add_shape(w)
                
                save_panel_local(fig_sub, fname, cfg['title'], help_blocks={'desc': [cfg['desc']]})
        except Exception as e: print(f'Erro ao gerar {fname}: {e}')

    # 2. Modos de Overlay
    overlays = [
        ('Overlay_Fibo.html', 'Strikes + Midwalls + Fibonacci', 
         shapes_strike_mid_fibo if 'shapes_strike_mid_fibo' in globals() else common_shapes,
         annos_strike_mid_fibo if 'annos_strike_mid_fibo' in globals() else common_annos),
        ('Overlay_Range_Walls.html', 'Range + Walls',
         [spot_line, hline0] + (range_lines if 'range_lines' in globals() else []) + (wall_lines if 'wall_lines' in globals() else []),
         common_annos),
        ('Overlay_Range.html', 'Range apenas',
         [spot_line, hline0] + (range_lines if 'range_lines' in globals() else []),
         common_annos),
        ('Overlay_Walls.html', 'Walls apenas',
         [spot_line, hline0] + (wall_lines if 'wall_lines' in globals() else []),
         common_annos),
        ('Overlay_Clean.html', 'Limpar overlays',
         [spot_line, hline0],
         [spot_label])
    ]

    for fname, title, shps, anns in overlays:
        try:
            fig_ov = go.Figure(data=[dummy_trace])
            fig_ov.update_layout(
                template='plotly_dark', 
                title=title,
                xaxis_title='Strike', 
                yaxis_title='-', 
                shapes=shps,
                annotations=anns,
                margin=dict(t=80)
            )
            save_panel_local(fig_ov, fname, title, {'Ajuda': ['Visualização focada em níveis de suporte e resistência.']})
        except Exception as e: print(f'Erro ao gerar {fname}: {e}')


# CELL 41
# --- EXPORTAÇÃO INDIVIDUAL DOS GRÁFICOS DA FIGURA 3 (15 MODOS) ---
print('Iniciando exportação dos 15 painéis da Figura 3...')

# Função auxiliar para salvar painel (caso não exista)
def save_panel_local(fig, filename, title, help_blocks=None):
    try:
        import os, re
        os.makedirs('exports', exist_ok=True)
        # Add EDI Logo
#         fig.add_layout_image( # DISABLED LOGO
#             dict(
#                 source="../edi_logo.png",
#                 xref="paper", yref="paper",
#                 x=0.01, y=0.99,
#                 sizex=0.1, sizey=0.1,
#                 xanchor="left", yanchor="top",
#                 layer="above"
#             )
#         )
        fig.update_layout(template='plotly_dark', title=dict(text=title, font=dict(color='white', size=18), x=0.5), margin=dict(t=100))
        html = fig.to_html(include_plotlyjs='cdn', full_html=True)
        html = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', html, flags=re.S)
        
        # Injeção básica de Home/Menu se disponível (funções do notebook)
        if 'inject_home' in globals(): html = inject_home(html)
        if 'inject_help' in globals() and help_blocks:
             for h_title, h_items in help_blocks.items():
                 html = inject_help(html, h_title, h_items)
                 
        filepath = f'exports/{filename}'
        with open(filepath, 'w', encoding='utf-8') as f: f.write(html)
        print(f"Saved {filepath}")
    except Exception as e:
        print(f"Error saving panel {filename}: {e}")

if 'fig3' in globals():
    # Mapear traces da fig3 original
    f3_data = fig3.data
    
    # Shapes e Annotations comuns
    common_shapes = [spot_line, hline0]
    if 'range_lines' in globals(): common_shapes += range_lines
    if 'flip_line' in globals() and flip_line: common_shapes.append(flip_line)
    
    common_annos = [spot_label]
    if 'range_low_label' in globals(): common_annos.append(range_low_label)
    if 'range_high_label' in globals(): common_annos.append(range_high_label)
    if 'flip_label' in globals() and flip_label: common_annos.append(flip_label)
    
    # Trace invisível para overlay
    dummy_trace = go.Scatter(x=strikes_ref, y=np.zeros_like(strikes_ref), mode='markers', marker=dict(opacity=0), showlegend=False, hoverinfo='skip')

    # 1. Modos de Dados
    modes_data = {
        'Delta_Agregado.html': {'idxs': [0], 'title': 'Delta Agregado', 'desc': 'Soma do Delta de todas as opções por strike.'},
        'Delta_Acumulado.html': {'idxs': [1], 'title': 'Delta Acumulado', 'desc': 'Acúmulo líquido do Delta ao longo dos strikes.'},
        'GEX.html': {'idxs': [2, 3], 'title': 'Gamma Exposure (GEX)', 'desc': 'Exposição de Gamma total e sua curvatura acumulada.'},
        'GEX_OI.html': {'idxs': [10, 13], 'title': 'Gamma Exposure (OI)', 'desc': 'GEX calculado isolando apenas a variável Open Interest.'},
        'GEX_IV.html': {'idxs': [11, 14], 'title': 'Gamma Exposure (IV)', 'desc': 'GEX calculado isolando apenas a variável Volatilidade Implícita.'},
        'R_Gamma_PVOP.html': {'idxs': [12], 'title': 'R Gamma (PVOP)', 'desc': 'Gamma ponderado pelo volume de Puts (Put Volume Over Price).'},
        'OI_Strike.html': {'idxs': [4, 5, 6, 7], 'title': 'Open Interest por Strike', 'desc': 'Contratos em aberto (Calls vs Puts) e Midwalls.'},
        'Charm_Exposure.html': {'idxs': [8], 'title': 'Charm Exposure', 'desc': 'Sensibilidade do Delta à passagem do tempo (Decaimento).'},
        'Vanna_Exposure.html': {'idxs': [9], 'title': 'Vanna Exposure', 'desc': 'Sensibilidade do Delta a mudanças na Volatilidade Implícita.'},
        'Visao_Completa.html': {'idxs': [0, 2, 4, 5], 'title': 'Visão Completa', 'desc': 'Visão geral combinando Delta, Gamma e OI.'}
    }

    for fname, cfg in modes_data.items():
        try:
            traces = []
            for i in cfg['idxs']:
                if i < len(f3_data):
                    import copy
                    t = copy.deepcopy(f3_data[i])
                    t.visible = True
                    traces.append(t)
            
            if traces:
                fig_sub = go.Figure(data=traces)
                fig_sub.update_layout(
                    template='plotly_dark', 
                    title=dict(text=f"EDI - {cfg['title']}", font=dict(color='white', size=18), x=0.5),
                    xaxis_title='Strike', 
                    yaxis_title='Valor',
                    shapes=common_shapes,
                    annotations=common_annos,
                    barmode='overlay',
                    margin=dict(t=80)
                )
                if 'OI' in cfg['title'] or 'Completa' in cfg['title']:
                    if 'wall_lines' in globals(): 
                        for w in wall_lines: fig_sub.add_shape(w)
                
                save_panel_local(fig_sub, fname, cfg['title'], help_blocks={'desc': [cfg['desc']]})
        except Exception as e: print(f'Erro ao gerar {fname}: {e}')

    # 2. Modos de Overlay
    overlays = [
        ('Overlay_Fibo.html', 'Strikes + Midwalls + Fibonacci', 
         shapes_strike_mid_fibo if 'shapes_strike_mid_fibo' in globals() else common_shapes,
         annos_strike_mid_fibo if 'annos_strike_mid_fibo' in globals() else common_annos),
        ('Overlay_Range_Walls.html', 'Range + Walls',
         [spot_line, hline0] + (range_lines if 'range_lines' in globals() else []) + (wall_lines if 'wall_lines' in globals() else []),
         common_annos),
        ('Overlay_Range.html', 'Range apenas',
         [spot_line, hline0] + (range_lines if 'range_lines' in globals() else []),
         common_annos),
        ('Overlay_Walls.html', 'Walls apenas',
         [spot_line, hline0] + (wall_lines if 'wall_lines' in globals() else []),
         common_annos),
        ('Overlay_Clean.html', 'Limpar overlays',
         [spot_line, hline0],
         [spot_label])
    ]

    for fname, title, shps, anns in overlays:
        try:
            fig_ov = go.Figure(data=[dummy_trace])
            fig_ov.update_layout(
                template='plotly_dark', 
                title=title,
                xaxis_title='Strike', 
                yaxis_title='-', 
                shapes=shps,
                annotations=anns,
                margin=dict(t=80)
            )
            save_panel_local(fig_ov, fname, title, {'Ajuda': ['Visualização focada em níveis de suporte e resistência.']})
        except Exception as e: print(f'Erro ao gerar {fname}: {e}')


# CELL 42

# --- AUTOMATIC METRICS EXPORT (INJECTED) ---
import json, os
try:
    _m = {}
    # 1. Spot
    try: _m['spot'] = float(SPOT)
    except: _m['spot'] = 0.0
    
    # 2. Gamma Flip
    try: _m['gamma_flip'] = float(gamma_flip)
    except: _m['gamma_flip'] = 0.0
    
    # 3. Regime Logic
    try:
        if 'regime' in locals(): _m['regime'] = regime
        else: _m['regime'] = 'Positivo' if _m['spot'] > _m['gamma_flip'] else 'Negativo'
    except: _m['regime'] = '---'
    
    # 4. Clima Logic
    try:
        if 'clima' in locals(): _m['clima'] = clima
        else: _m['clima'] = 'Normal' # Default
    except: _m['clima'] = '---'
    
    # 5. Delta Flip
    try:
        if 'delta_flip_val' in locals(): _m['delta_flip'] = float(delta_flip_val)
        elif 'delta_flip' in locals(): _m['delta_flip'] = float(delta_flip)
    except: pass
    
    os.makedirs('exports', exist_ok=True)
    with open('exports/metrics.json', 'w') as f: json.dump(_m, f, indent=2)
    print('Metrics exported successfully:', _m)
except Exception as e: print(f'Error exporting metrics: {e}')


# CELL 43

# --- REGENERATE DASHBOARD (INJECTED) ---
# Atualiza o index.html com as novas métricas geradas
import subprocess
import shutil
import os

print("Regenerating Dashboard V2...")
try:
    # Executa o script de construção
    result = subprocess.run(["python", "build_dashboard_v2.py"], capture_output=True, text=True)
    if result.returncode == 0:
        print(result.stdout)
        # Copia para a raiz
        if os.path.exists('exports/index.html'):
            shutil.copy('exports/index.html', 'index.html')
            print("Dashboard updated successfully (exports/index.html -> index.html).")
        else:
            print("Error: exports/index.html not found after build.")
    else:
        print("Error running build_dashboard_v2.py:")
        print(result.stderr)
except Exception as e:
    print(f"Error regenerating dashboard: {e}")


