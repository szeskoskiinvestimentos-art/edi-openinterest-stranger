import os
import sys

# Adiciona o diretório raiz ao path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pandas as pd
import numpy as np
from scipy.stats import norm
from scipy.ndimage import gaussian_filter1d, uniform_filter1d
import src.config as config
from src.calculator import OptionsCalculator

# Importação de funções utilitárias do projeto
from src.data_loader import load_data

def bs_greeks(S, K, T, r, sigma, option_type):
    """Cálculo vetorizado de gregas para simulação."""
    S = np.asarray(S, dtype=float)
    K = np.asarray(K, dtype=float)
    T = float(max(T, 1e-6))
    sigma = float(max(sigma, 1e-6))
    
    d1 = (np.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*np.sqrt(T))
    d2 = d1 - sigma*np.sqrt(T)
    
    if option_type == 'CALL':
        delta = norm.cdf(d1)
    else:
        delta = norm.cdf(d1) - 1.0
        
    gamma = norm.pdf(d1) / (S*sigma*np.sqrt(T))
    return delta, gamma

def discovery():
    print("--- INICIANDO ENGENHARIA REVERSA DOS NÍVEIS ---")
    
    # 1. Carregar Dados
    try:
        target_dir = '.'
        if not any(f.endswith('.csv') for f in os.listdir('.')) and os.path.exists('Histórico barchart'):
            target_dir = 'Histórico barchart'
        
        df_options, spot_price, expiry = load_data(directory=target_dir, use_csv_spot=config.USE_CSV_SPOT, spot_override=config.SPOT)
        print(f"Dados carregados. Spot: {spot_price}, Expiry: {expiry}")
    except Exception as e:
        print(f"Erro ao carregar dados: {e}")
        return

    # 2. Instanciar Engine para Cálculos Base
    calc_engine = OptionsCalculator(df_options, spot_price, expiry)
    calc_engine.calculate_greeks_exposure()
    
    strikes = np.array(calc_engine.strikes_ref, dtype=float)
    oi_put = np.array(calc_engine.oi_put_ref, dtype=float)
    oi_call = np.array(calc_engine.oi_call_ref, dtype=float)
    
    T = calc_engine.T
    r = config.RISK_FREE
    
    _, gC = bs_greeks(spot_price, strikes, T, r, config.IV_ANNUAL, 'CALL')
    _, gP = bs_greeks(spot_price, strikes, T, r, config.IV_ANNUAL, 'PUT')
    
    # Alvos
    TARGET_PUT_WALL = 5358.04
    TARGET_HVL_FLIP = 5400.96
    
    print(f"\n--- ALVOS ---")
    print(f"Put Wall Alvo: {TARGET_PUT_WALL}")
    print(f"HVL Flip Alvo: {TARGET_HVL_FLIP}")
    
    # ==============================================================================
    # 3. ANÁLISE DO PUT WALL (Alvo: 5358.04)
    # ==============================================================================
    print(f"\n--- ANÁLISE PUT WALL ---")
    
    # Média Ponderada Top 2 (OI)
    indices_oi = np.argsort(oi_put)
    top2_idx = indices_oi[-2:]
    wavg_2 = np.average(strikes[top2_idx], weights=oi_put[top2_idx])
    print(f"Weighted Avg OI (Top 2): {wavg_2:.4f} (Diff: {wavg_2 - TARGET_PUT_WALL:.4f})")

    # Média Ponderada Top 3 (OI)
    top3_idx = indices_oi[-3:]
    wavg_3 = np.average(strikes[top3_idx], weights=oi_put[top3_idx])
    print(f"Weighted Avg OI (Top 3): {wavg_3:.4f} (Diff: {wavg_3 - TARGET_PUT_WALL:.4f})")

    # Média Ponderada Put GEX (Top 2)
    # GEX Put é proporcional a gamma * oi_put
    put_gex = gP * oi_put
    indices_gex = np.argsort(put_gex)
    
    top2_gex_idx = indices_gex[-2:]
    wavg_gex_2 = np.average(strikes[top2_gex_idx], weights=put_gex[top2_gex_idx])
    print(f"Weighted Avg GEX Put (Top 2): {wavg_gex_2:.4f} (Diff: {wavg_gex_2 - TARGET_PUT_WALL:.4f})")
    
    top3_gex_idx = indices_gex[-3:]
    wavg_gex_3 = np.average(strikes[top3_gex_idx], weights=put_gex[top3_gex_idx])
    print(f"Weighted Avg GEX Put (Top 3): {wavg_gex_3:.4f} (Diff: {wavg_gex_3 - TARGET_PUT_WALL:.4f})")
    
    # Max Pain Check
    pain_vals = []
    for k_expiry in strikes:
        val_calls = np.maximum(0, k_expiry - strikes) * oi_call
        val_puts  = np.maximum(0, strikes - k_expiry) * oi_put
        total_loss = np.sum(val_calls) + np.sum(val_puts)
        pain_vals.append(total_loss)
    
    idx_pain = np.argmin(pain_vals)
    max_pain = strikes[idx_pain]
    print(f"Max Pain Strike: {max_pain:.4f} (Diff: {max_pain - TARGET_PUT_WALL:.4f})")

    # ==============================================================================
    # 4. ANÁLISE DO HVL FLIP (Alvo: 5400.96)
    # ==============================================================================
    print(f"\n--- ANÁLISE HVL FLIP ---")
    
    sgn_call = np.where(strikes <= spot_price, 1.0, -1.0) # Call ITM (+), OTM (-)
    sgn_put  = np.where(strikes >= spot_price, -1.0, 1.0) # Put ITM (-), OTM (+)
    
    gex_legacy_raw = (gC * oi_call * sgn_call + gP * oi_put * sgn_put) * 50000 * spot_price * 0.01
    
    # 1. Raw Zero Crossing
    idx_cross = np.where(np.diff(np.sign(gex_legacy_raw)))[0]
    print(f"Raw GEX Zero Crossings indices: {idx_cross}")
    if len(idx_cross) > 0:
        for i in idx_cross:
            y1, y2 = gex_legacy_raw[i], gex_legacy_raw[i+1]
            x1, x2 = strikes[i], strikes[i+1]
            if y2 != y1:
                cx = x1 - y1 * (x2 - x1) / (y2 - y1)
            else:
                cx = x1
            print(f" -> Raw GEX Flip at: {cx:.4f} (Diff: {cx - TARGET_HVL_FLIP:.4f})")
            
    # 2. Gaussian Smoothing Optimization
    print("\nSimulando Gaussian Smoothing (HVL Effect)...")
    
    def find_flip(arr, target):
        idx_cross_s = np.where(np.diff(np.sign(arr)))[0]
        val = None
        if len(idx_cross_s) > 0:
            cross_strikes = []
            for i in idx_cross_s:
                y1, y2 = arr[i], arr[i+1]
                x1, x2 = strikes[i], strikes[i+1]
                if y2 != y1:
                    cx = x1 - y1 * (x2 - x1) / (y2 - y1)
                else:
                    cx = x1
                cross_strikes.append(cx)
            # Escolhe o mais próximo do spot ou do target? Vamos pegar o mais próximo do TARGET
            val = min(cross_strikes, key=lambda x: abs(x - target))
        return val

    # Grid Search Fino para Gaussian
    best_diff_gauss = 99999.0
    best_sigma_gauss = None
    best_val_gauss = None
    
    sigmas = np.linspace(0.5, 2.0, 151) # 0.5 a 2.0 com passo 0.01
    
    for sig in sigmas:
        gex_smooth = gaussian_filter1d(gex_legacy_raw, sigma=sig)
        val = find_flip(gex_smooth, TARGET_HVL_FLIP)
        if val:
            diff = abs(val - TARGET_HVL_FLIP)
            if diff < best_diff_gauss:
                best_diff_gauss = diff
                best_val_gauss = val
                best_sigma_gauss = sig

    if best_val_gauss:
        print(f"Melhor Gaussian Flip: {best_val_gauss:.4f} (Diff: {best_diff_gauss:.4f}) | Sigma: {best_sigma_gauss:.2f}")
    else:
        print("Nenhum Gaussian Flip encontrado.")

    # 3. Uniform Filter (Moving Average) Optimization
    print("\nSimulando Uniform Filter (Moving Average)...")
    best_diff_uni = 99999.0
    best_size_uni = None
    best_val_uni = None
    
    sizes = range(2, 20)
    for size in sizes:
        gex_smooth = uniform_filter1d(gex_legacy_raw, size=size)
        val = find_flip(gex_smooth, TARGET_HVL_FLIP)
        if val:
            diff = abs(val - TARGET_HVL_FLIP)
            if diff < best_diff_uni:
                best_diff_uni = diff
                best_val_uni = val
                best_size_uni = size

    if best_val_uni:
        print(f"Melhor Uniform Flip: {best_val_uni:.4f} (Diff: {best_diff_uni:.4f}) | Size: {best_size_uni}")
    else:
        print("Nenhum Uniform Flip encontrado.")

if __name__ == "__main__":
    discovery()
