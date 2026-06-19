import json
import os
import sys
import numpy as np
import pandas as pd
from datetime import date, datetime
from typing import Any, Optional, List, cast

# Adicionar o diretório atual ao path para importar módulos src
sys.path.append(os.getcwd())

try:
    from src.data_loader import load_data
    from src.calculator import OptionsCalculator
    from src.greeks import GreeksEngine
    from src.ntsl import generate_ntsl_script
    from src import config as settings
except ImportError as e:
    print(f"Erro ao importar módulos: {e}")
    print("Certifique-se de executar este script da raiz do projeto.")
    sys.exit(1)

def convert_to_serializable(obj):
    if isinstance(obj, (int, np.integer)):
        return int(obj)
    elif isinstance(obj, (float, np.floating)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    return obj

def _fmt_date_yyyy_mm_dd(d: Optional[date]) -> Optional[str]:
    if d is None:
        return None
    return d.strftime("%Y-%m-%d")

def safe_float(value: Any) -> Optional[float]:
    """Converte valor para float de forma segura, retornando None se falhar ou for None."""
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None

def safe_list(value: Any) -> List[Any]:
    """Converte valor para lista de forma segura (suporta ndarray e list)."""
    if isinstance(value, np.ndarray):
        return value.tolist()
    if isinstance(value, list):
        return value
    return []

def safe_scale(value: Any, scale_factor: float) -> Optional[float]:
    """Aplica fator de escala de forma segura, retornando None se o valor for inválido."""
    val = safe_float(value)
    if val is not None:
        return val * scale_factor
    return None

def compute_gex_by_expiry(options_df: pd.DataFrame, calc: OptionsCalculator) -> List[dict]:
    if options_df is None or options_df.empty:
        return []
    if 'Expiry' not in options_df.columns:
        return []

    expiries = options_df['Expiry'].dropna().unique()
    if len(expiries) == 0:
        return []

    dataref_dt = pd.to_datetime(getattr(calc, 'dataref', datetime.now()))
    strikes_ref = np.asarray(getattr(calc, 'strikes_ref', []), dtype=float)
    if strikes_ref.size == 0:
        return []

    spot = float(getattr(calc, 'spot', 0.0))
    r = float(getattr(calc, 'risk_free', 0.0))
    sigma = float(getattr(calc, 'iv_annual', 0.0))
    factor = float(getattr(settings, 'CONTRACT_MULT', 100.0)) * spot * 0.01

    rows: List[dict] = []
    for expiry in sorted(expiries):
        if pd.isnull(expiry):
            continue

        expiry_dt = pd.to_datetime(expiry)
        bdays = int(np.busday_count(dataref_dt.date(), expiry_dt.date()))
        is_0dte = dataref_dt.date() == expiry_dt.date()
        if getattr(settings, 'USE_ODTE_MODE', False) and is_0dte:
            T_exp = float(getattr(settings, 'MIN_T_EXPIRY', 1e-6))
        else:
            T_exp = float(max(bdays, 1) / 252.0)

        df_exp = options_df.loc[options_df["Expiry"] == expiry]
        if "StrikeK" not in df_exp.columns or "Open Int" not in df_exp.columns or "OptionType" not in df_exp.columns:
            continue

        strike_to_idx = {float(k): int(i) for i, k in enumerate(strikes_ref)}

        strikek_arr = np.asarray(pd.to_numeric(df_exp["StrikeK"], errors="coerce"), dtype=float)
        open_int_arr = np.asarray(pd.to_numeric(df_exp["Open Int"], errors="coerce"), dtype=float)
        open_int_arr = np.nan_to_num(open_int_arr, nan=0.0, posinf=0.0, neginf=0.0)
        opt_type_arr = np.asarray(df_exp["OptionType"].astype(str).str.upper(), dtype=str)
        valid = np.isfinite(strikek_arr)

        oi_call = np.zeros_like(strikes_ref, dtype=float)
        oi_put = np.zeros_like(strikes_ref, dtype=float)

        for k, oi, t in zip(strikek_arr[valid], open_int_arr[valid], opt_type_arr[valid]):
            idx = strike_to_idx.get(float(k))
            if idx is None:
                continue
            if t == "CALL":
                oi_call[idx] += float(oi)
            elif t == "PUT":
                oi_put[idx] += float(oi)

        if float(oi_call.sum() + oi_put.sum()) == 0.0:
            continue

        _, gC = GreeksEngine.calculate_greeks(spot, strikes_ref, T_exp, r, sigma, 'C')
        _, gP = GreeksEngine.calculate_greeks(spot, strikes_ref, T_exp, r, sigma, 'P')
        gex_call = np.nan_to_num(gC) * oi_call * factor
        gex_put = np.nan_to_num(gP) * oi_put * factor

        rows.append({
            "expiry": expiry_dt.strftime("%Y-%m-%d"),
            "days_to_exp": bdays,
            "abs_call": float(np.sum(np.abs(gex_call))),
            "abs_put": float(np.sum(np.abs(gex_put))),
            "net": float(np.sum(gex_call + gex_put)),
        })

    return sorted(rows, key=lambda r: (r.get("days_to_exp", 0), r.get("expiry", "")))

def main():
    print("=== Exportador de Dados para Dashboard V1 (Stranger Things) ===")
    
    # 1. Carregar Dados
    print("Carregando dados...")
    project_root = os.path.dirname(os.path.abspath(__file__))
    env_dir = getattr(settings, 'CSV_INDICE_DIR', '') or ''
    default_dir = os.path.join(project_root, 'CSV_Indice')
    base_dir = env_dir if env_dir else default_dir
    if not (os.path.exists(base_dir) and any(f.endswith('.csv') for f in os.listdir(base_dir))):
        print(f"ERRO: Nenhum arquivo CSV encontrado no diretório configurado para Índice: {base_dir}")
        return
        
    options_df, spot, expiry = load_data(directory=base_dir, use_csv_spot=settings.USE_CSV_SPOT, spot_override=settings.SPOT)
    if not isinstance(options_df, pd.DataFrame):
        options_df = pd.DataFrame(options_df)
    options_df = cast(pd.DataFrame, options_df)
    
    if options_df.empty:
        print("ERRO: Nenhum dado encontrado.")
        return

    today = datetime.now().date()
    detected_expiry: Optional[date] = None
    if 'Expiry' in options_df.columns:
        try:
            exp_series = pd.to_datetime(options_df['Expiry'], errors='coerce').dropna()
            if getattr(exp_series, "size", 0):
                exp_dates = sorted({d for d in exp_series.dt.date if d is not None})
                future = [d for d in exp_dates if d >= today]
                detected_expiry = future[0] if future else (exp_dates[0] if exp_dates else None)
        except Exception:
            detected_expiry = None

    manual_exp_date_str = getattr(settings, 'MANUAL_EXPIRATION_DATE', None)
    manual_expiry: Optional[date] = None
    if manual_exp_date_str:
        try:
            manual_expiry = datetime.strptime(str(manual_exp_date_str), "%Y-%m-%d").date()
            if manual_expiry < today:
                manual_expiry = None
        except Exception:
            manual_expiry = None

    expiry_reference_mode = "detected"
    expiry_reference_applied = detected_expiry or expiry
    if manual_expiry is not None:
        expiry_reference_mode = "manual"
        expiry_reference_applied = manual_expiry

    expiry = expiry_reference_applied

    # 2. Calcular Métricas
    print("Calculando gregas e métricas...")
    calc = OptionsCalculator(options_df, spot, expiry)
    calc.calculate_greeks_exposure()
    calc.calculate_flips_and_walls()
    
    # Cálculos Avançados V3
    print("Calculando métricas avançadas V3...")
    calc.calculate_expected_moves()
    calc.calculate_volatility_analysis()
    calc.calculate_pinning_risk()
    calc.calculate_gamma_flip_cone()
    calc.calculate_delta_flip_profile()
    calc.calculate_flow_sentiment()
    calc.calculate_mm_pnl_simulation()
    
    # Obter Métricas Resumidas (Necessário para Overview e Key Levels)
    summary_metrics = calc.get_summary_metrics()
    
    # Prepara dados vetoriais (Definido antes para uso nas simulações)
    sf = getattr(settings, 'DISPLAY_SCALE_FACTOR', 1.0)
    ewz_ref = float(getattr(settings, 'SCALING_EWZ_REF_CLOSE', 0.0))
    idx_ref = float(getattr(settings, 'SCALING_INDEX_REF_CLOSE', 0.0))
    idx_from_sf = ewz_ref * sf if ewz_ref > 0.0 else 0.0
    ref_diff_pct = 0.0
    if idx_ref > 0.0 and idx_from_sf > 0.0:
        ref_diff_pct = (idx_ref - idx_from_sf) / idx_ref * 100.0
    index_spot = float(spot * sf)
    spot_ratio_to_ref = index_spot / idx_ref if idx_ref > 0.0 else 0.0
    if abs(ref_diff_pct) > 1.0:
        print(f"Aviso: Diferença de {ref_diff_pct:.2f}% entre escala calculada e índice de referência.")
    if idx_ref > 0.0 and (spot_ratio_to_ref < 0.5 or spot_ratio_to_ref > 1.5):
        print("Aviso: Spot em índice distante do fechamento de referência. Verifique SCALING_INDEX_REF_CLOSE e DISPLAY_SCALE_FACTOR.")

    # Fair Value Simulation (Novo)
    print("Calculando Simulação de Valor Justo...")
    def build_fair_value_sims(calc_obj, scenarios_list):
        def pct_change(now_val: Any, sim_val: Any) -> float:
            now_f = safe_float(now_val)
            sim_f = safe_float(sim_val)
            if now_f is None or sim_f is None:
                return 0.0
            if not np.isfinite(now_f) or not np.isfinite(sim_f) or abs(now_f) <= 0.01:
                return 0.0
            return (sim_f - now_f) / now_f * 100.0

        sims = []
        for scen in scenarios_list:
            scen_spot = scen.get('spot')
            if scen_spot is None or (isinstance(scen_spot, float) and np.isnan(scen_spot)):
                continue
            try:
                if not hasattr(calc_obj, 'calculate_fair_value_scenario'):
                    continue
                res = calc_obj.calculate_fair_value_scenario(scen_spot, target_days_from_now=0)
                if not res:
                    continue

                scaled_res = []
                for item in res:
                    call_now_scaled = safe_scale(item.get('Call_Now'), sf)
                    call_sim_scaled = safe_scale(item.get('Call_Sim'), sf)
                    put_now_scaled = safe_scale(item.get('Put_Now'), sf)
                    put_sim_scaled = safe_scale(item.get('Put_Sim'), sf)
                    scaled_res.append({
                        'Strike': safe_scale(item.get('Strike'), sf),
                        'Call_Now': call_now_scaled,
                        'Call_Sim': call_sim_scaled,
                        'Call_Chg': pct_change(call_now_scaled, call_sim_scaled),
                        'Put_Now': put_now_scaled,
                        'Put_Sim': put_sim_scaled,
                        'Put_Chg': pct_change(put_now_scaled, put_sim_scaled)
                    })

                sims.append({
                    'scenario': scen.get('label'),
                    'target_spot': safe_scale(scen_spot, sf),
                    'options': scaled_res
                })
            except Exception as e:
                print(f"Erro ao simular cenário {scen.get('label')}: {e}")
        return sims

    scenarios_all = [
        {'label': 'Call Wall', 'spot': calc.call_wall},
        {'label': 'Put Wall', 'spot': calc.put_wall},
        {'label': 'Gamma Flip', 'spot': calc.gamma_flip},
        {'label': '+1%', 'spot': spot * 1.01},
        {'label': '-1%', 'spot': spot * 0.99}
    ]

    fair_value_sims = build_fair_value_sims(calc, scenarios_all)

    fair_value_sims_nearest = []
    expiry_nearest = None
    if 'Expiry' in options_df.columns:
        try:
            exp_series = pd.to_datetime(options_df['Expiry'], errors='coerce')
            valid = exp_series.dropna()
            if getattr(valid, "size", 0):
                dataref_dt = pd.to_datetime(getattr(calc, 'dataref', datetime.now()), errors="coerce")
                if pd.isnull(dataref_dt):
                    dataref_dt = pd.to_datetime(datetime.now())
                mask = valid.dt.normalize() >= dataref_dt.normalize()
                candidates = valid[mask]
                raw_nearest = candidates.min() if getattr(candidates, "size", 0) else valid.min()
                expiry_nearest = pd.to_datetime(raw_nearest, errors="coerce")
                if pd.isnull(expiry_nearest):
                    expiry_nearest = None
        except Exception as e:
            print(f"Aviso: não foi possível identificar vencimento mais próximo: {e}")
            expiry_nearest = None

    calc_nearest = None
    if expiry_nearest is not None:
        try:
            exp_series = pd.to_datetime(options_df['Expiry'], errors='coerce')
            options_df_nearest = options_df.loc[exp_series == expiry_nearest].copy()
            calc_nearest = OptionsCalculator(options_df_nearest, spot, expiry_nearest.strftime("%Y-%m-%d"))
            calc_nearest.calculate_greeks_exposure()
            calc_nearest.calculate_flips_and_walls()
            calc_nearest.calculate_gamma_flip_cone()

            scenarios_nearest = [
                {'label': 'Call Wall', 'spot': calc_nearest.call_wall},
                {'label': 'Put Wall', 'spot': calc_nearest.put_wall},
                {'label': 'Gamma Flip', 'spot': calc_nearest.gamma_flip},
                {'label': '+1%', 'spot': spot * 1.01},
                {'label': '-1%', 'spot': spot * 0.99}
            ]
            fair_value_sims_nearest = build_fair_value_sims(calc_nearest, scenarios_nearest)
        except Exception as e:
            print(f"Aviso: falha ao calcular fair value do vencimento mais próximo: {e}")
            fair_value_sims_nearest = []

    # 3. Montar Estrutura JSON para V1
    # Baseado em dashboard_v1/assets/data/market_data.json
    
    strikes = calc.strikes_ref * sf
    
    # Delta Data
    delta_values = calc.dexp_tot # Delta Exposure por Strike
    delta_cum = calc.dexp_cum    # Delta Acumulado
    
    # Gamma Data
    gamma_values = calc.gex_tot  # Gamma Exposure por Strike
    gamma_exposure = calc.gex_cum # Gamma Acumulado
    
    # GEX Split (Call vs Put) - Novo
    gex_call = calc.gex_call_tot
    gex_put = calc.gex_put_tot

    gex_by_expiry = compute_gex_by_expiry(options_df, calc)

    oi_by_expiry: List[dict] = []
    if 'Expiry' in options_df.columns:
        try:
            dataref_dt = pd.to_datetime(getattr(calc, 'dataref', datetime.now()), errors="coerce")
            if pd.isnull(dataref_dt):
                dataref_dt = pd.to_datetime(datetime.now())
            for exp_date, group in options_df.groupby('Expiry'):
                exp_dt = pd.to_datetime(cast(Any, exp_date), errors="coerce")
                if pd.isnull(exp_dt):
                    continue
                days_to_exp = int(np.busday_count(dataref_dt.date(), exp_dt.date()))
                call_oi_sum = float(group.loc[group['OptionType'] == 'CALL', 'Open Int'].sum())
                put_oi_sum = float(group.loc[group['OptionType'] == 'PUT', 'Open Int'].sum())
                oi_by_expiry.append({
                    "expiry": exp_dt.strftime("%Y-%m-%d"),
                    "days_to_exp": days_to_exp,
                    "call_oi": call_oi_sum,
                    "put_oi": put_oi_sum,
                    "total_oi": call_oi_sum + put_oi_sum
                })
            oi_by_expiry.sort(key=lambda x: (x.get("days_to_exp") is None, x.get("days_to_exp", 10**9)))
        except Exception as e:
            print(f"Erro ao gerar OI por vencimento: {e}")
            oi_by_expiry = []
    
    # Volume/OI Data
    call_oi = calc.oi_call_ref
    put_oi = calc.oi_put_ref
    total_oi = call_oi + put_oi

    oi_data_nearest_payload = None
    if calc_nearest is not None:
        try:
            strikes_nearest = calc_nearest.strikes_ref * sf
            call_oi_nearest = calc_nearest.oi_call_ref
            put_oi_nearest = calc_nearest.oi_put_ref
            total_oi_nearest = call_oi_nearest + put_oi_nearest
            oi_data_nearest_payload = {
                "strikes": safe_list(strikes_nearest),
                "call_oi": safe_list(call_oi_nearest),
                "put_oi": safe_list(put_oi_nearest),
                "total_oi": safe_list(total_oi_nearest)
            }
        except Exception as e:
            print(f"Aviso: falha ao montar oi_data_nearest: {e}")
            oi_data_nearest_payload = None
    
    # Volume Data (New)
    call_vol = getattr(calc, 'vol_call_ref', np.zeros_like(strikes))
    put_vol = getattr(calc, 'vol_put_ref', np.zeros_like(strikes))
    total_vol = call_vol + put_vol

    # Most Actives (Top Contracts)
    most_actives = {
        "top_oi": [],
        "top_vol": []
    }
    if not options_df.empty:
        try:
            # Helper para formatar registros
            def format_active_record(row):
                strike_base = safe_float(row.get('StrikeK', None))
                if strike_base is None:
                    strike_base = safe_float(row.get('Strike', None))
                strike_scaled = (strike_base * sf) if strike_base is not None else None

                iv_raw = row.get('IV', 0)
                iv_val = safe_float(iv_raw)
                if iv_val is None or not np.isfinite(iv_val) or iv_val <= 0:
                    iv_pct = 0.0
                else:
                    iv_pct = float(iv_val * 100.0) if iv_val <= 5.0 else float(iv_val)

                return {
                    "strike": float(strike_scaled) if strike_scaled is not None else 0.0,
                    "type": str(row['OptionType']),
                    "oi": int(row['Open Int']),
                    "volume": int(row.get('Volume', 0)),
                    "expiry": str(row.get('Expiry', '')),
                    "iv": iv_pct
                }

            # Top OI
            top_oi_df = options_df.sort_values('Open Int', ascending=False).head(15)
            most_actives["top_oi"] = [format_active_record(r) for _, r in top_oi_df.iterrows()]
            
            # Top Volume
            if 'Volume' in options_df.columns:
                top_vol_df = options_df.sort_values('Volume', ascending=False).head(15)
                most_actives["top_vol"] = [format_active_record(r) for _, r in top_vol_df.iterrows()]
        except Exception as e:
            print(f"Erro ao gerar Most Actives: {e}")

    # Volatility Data
    iv_ref = calc.iv_strike_ref
    if iv_ref is not None:
        iv_values = iv_ref * 100 # Em porcentagem
    else:
        iv_values = np.zeros_like(strikes)
    
    # Gregas de 2ª Ordem e Fluxo - Novo
    charm_values = calc.charm_tot
    vanna_values = calc.vanna_tot
    vex_values = calc.vex_tot # Vanna Exposure? Não, Vex é Vega Exposure provavelmente
    theta_values = calc.theta_tot

    # Acumulados de 2ª Ordem
    charm_cum = calc.charm_cum
    vanna_cum = calc.vanna_cum
    theta_cum = calc.theta_cum
    
    # R-Gamma (PVOP)
    r_gamma_exposure = calc.r_gamma_exposure
    r_gamma_cum = calc.r_gamma_cum
    
    # Term Structure (Volatilidade por Vencimento) - Evolução: sem duplicações e com fallback
    term_structure = {"expiries": [], "iv_atm_pct": []}
    if 'Expiry' in options_df.columns:
        exp_groups = options_df.groupby('Expiry')
        for exp_date, group in exp_groups:
            exp_dt = pd.to_datetime(cast(Any, exp_date), errors="coerce")
            if pd.isnull(exp_dt):
                continue
            # ATM aproximado: strike mais próximo do spot
            group_sorted = group.iloc[(group['StrikeK'] - spot).abs().argsort()]
            atm_row = group_sorted.head(1)
            atm_iv_pct = None
            if 'IV' in group.columns and not atm_row.empty:
                try:
                    iv_val = float(atm_row['IV'].iloc[0])
                    # Se a fonte estiver em decimal (ex.: 0.33), converte para %
                    atm_iv_pct = iv_val * 100.0 if iv_val < 5.0 else iv_val
                except Exception:
                    pass
            if atm_iv_pct is None:
                # Fallback: média da coluna IV se existir
                if 'IV' in group.columns:
                    try:
                        iv_mean = float(group['IV'].mean())
                        atm_iv_pct = iv_mean * 100.0 if iv_mean < 5.0 else iv_mean
                    except Exception:
                        atm_iv_pct = None
            if atm_iv_pct is None:
                # Fallback final: usar IV_ANNUAL global (decimal) convertida para %
                try:
                    atm_iv_pct = float(getattr(settings, 'IV_ANNUAL', 0.0)) * 100.0
                except Exception:
                    atm_iv_pct = 0.0
            term_structure["expiries"].append(exp_dt.strftime("%Y-%m-%d"))
            term_structure["iv_atm_pct"].append(atm_iv_pct)
    
    # Detailed Data List
    detailed_data = []
    for i, k in enumerate(strikes):
        detailed_data.append({
            "strike": float(k),
            "delta": float(delta_values[i]),
            "gamma": float(gamma_values[i]),
            "volume": int(total_vol[i]),
            "oi": int(total_oi[i]),
            "iv": float(iv_values[i])
        })
        
    # Overview
    open_interest_total = int(np.sum(total_oi))
    volume_total = int(np.sum(total_vol))
    overview = {
        "open_interest_total": open_interest_total,
        "volume_total": volume_total,
        "total_trades": open_interest_total,
        "total_volume": volume_total,
        "gamma_exposure": float(np.sum(gamma_values)),
        "delta_position": float(np.sum(delta_values) * settings.CONTRACT_MULT * (sf if getattr(settings, 'EXPOSURE_INDEX_SCALE_ENABLED', True) else 1.0)),
        "last_update": datetime.now().isoformat(),
        "spot_price": float(spot * sf),
        "dealer_pressure": safe_float(summary_metrics.get('dealer_pressure')),
        "regime": summary_metrics.get('regime')
    }

    # Key Levels (Novos)
    expected_moves_scaled = []
    if calc.expected_moves:
        for move in calc.expected_moves:
            expected_moves_scaled.append({
                "label": move.get("label"),
                "days": move.get("days"),
                "move": safe_scale(move.get("move"), sf),
                "upper": safe_scale(move.get("upper"), sf),
                "lower": safe_scale(move.get("lower"), sf)
            })

    prisk = getattr(calc, 'pinning_risk', None) or {}
    flip_map = getattr(calc, 'flip_variations', {}) or {}
    flip_keys_order = ['Classic', 'Spline', 'HVL', 'HVL Log', 'Sigma Kernel', 'PVOP', 'HVL Gaussian']
    sel_name = None
    sel_val = None
    best_dist = float('inf')
    for k in flip_keys_order:
        v = flip_map.get(k)
        try:
            vf = float(v) if v is not None else None
        except Exception:
            vf = None
        if vf is None:
            continue
        d = abs(vf - float(spot))
        if d < best_dist:
            best_dist = d
            sel_name = k
            sel_val = vf
    if sel_name is None:
        sel_name = 'HVL Gaussian' if flip_map.get('HVL Gaussian') is not None else None
        try:
            fallback_raw = flip_map.get(sel_name) if sel_name else None
            sel_val = float(fallback_raw) if fallback_raw is not None else None
        except Exception:
            sel_val = None
    def has_puts_below_spot(cobj) -> bool:
        try:
            strikes_arr = np.asarray(getattr(cobj, 'strikes_ref', []), dtype=float)
            oi_put_arr = np.asarray(getattr(cobj, 'oi_put_ref', []), dtype=float)
            spot_val = float(getattr(cobj, 'spot', spot or 0.0))
            if strikes_arr.size == 0 or oi_put_arr.size == 0:
                return False
            return bool(np.any((strikes_arr <= spot_val) & (oi_put_arr > 0)))
        except Exception:
            return False

    def has_calls_above_spot(cobj) -> bool:
        try:
            strikes_arr = np.asarray(getattr(cobj, 'strikes_ref', []), dtype=float)
            oi_call_arr = np.asarray(getattr(cobj, 'oi_call_ref', []), dtype=float)
            spot_val = float(getattr(cobj, 'spot', spot or 0.0))
            if strikes_arr.size == 0 or oi_call_arr.size == 0:
                return False
            return bool(np.any((strikes_arr >= spot_val) & (oi_call_arr > 0)))
        except Exception:
            return False

    def has_calls_and_puts(cobj) -> bool:
        try:
            oi_put_arr = np.asarray(getattr(cobj, 'oi_put_ref', []), dtype=float)
            oi_call_arr = np.asarray(getattr(cobj, 'oi_call_ref', []), dtype=float)
            return bool(float(oi_put_arr.sum()) > 0.0 and float(oi_call_arr.sum()) > 0.0)
        except Exception:
            return False

    effective_call_wall_val = (
        calc_nearest.effective_call_wall
        if (calc_nearest is not None and has_calls_above_spot(calc_nearest))
        else calc.effective_call_wall
    )
    effective_put_wall_val = (
        calc_nearest.effective_put_wall
        if (calc_nearest is not None and has_puts_below_spot(calc_nearest))
        else calc.effective_put_wall
    )
    max_pain_val = (
        calc_nearest.max_pain
        if (calc_nearest is not None and has_calls_and_puts(calc_nearest))
        else calc.max_pain
    )
    key_levels = {
        "gamma_flip": safe_scale(calc.gamma_flip, sf),
        "gamma_flip_hvl": safe_scale(calc.gamma_flip_hvl, sf),
        "gamma_flip_hvl_gaussian": safe_scale(calc.flip_variations.get('HVL Gaussian'), sf) if hasattr(calc, 'flip_variations') and calc.flip_variations else None,
        "gamma_flip_selected": safe_scale(sel_val, sf),
        "gamma_flip_model": sel_name,
        "call_wall": safe_scale(calc.call_wall, sf),
        "put_wall": safe_scale(calc.put_wall, sf),
        "effective_call_wall": safe_scale(effective_call_wall_val, sf),
        "effective_put_wall": safe_scale(effective_put_wall_val, sf),
        "max_pain": safe_scale(max_pain_val, sf),
        "zero_gamma": safe_scale(calc.zero_gamma_level, sf),
        "range_low": safe_scale(summary_metrics.get('range_low'), sf),
        "range_high": safe_scale(summary_metrics.get('range_high'), sf),
        "expected_moves": expected_moves_scaled,
        "pinning_risk": {
            "strike": safe_scale(prisk.get('strike'), sf) if prisk else None,
            "score": prisk.get('strength') if prisk else None
        },
        "volatility_analysis": getattr(calc, 'vol_analysis', None)
    }

    # Advanced V3 Data Structures
    gf_cone = getattr(calc, 'gamma_flip_cone', None) or {}
    gf_cone_nearest = getattr(calc_nearest, 'gamma_flip_cone', None) if calc_nearest is not None else None
    d_flip = getattr(calc, 'delta_flip_profile', None) or {}
    flow_s = getattr(calc, 'flow_sentiment', None) or {}
    mm_pnl = getattr(calc, 'mm_pnl_simulation', None) or {}
    mp_prof = getattr(calc, 'max_pain_profile', None) if hasattr(calc, 'max_pain_profile') else None

    flips_scaled = {}
    if flip_map:
        for k in flip_keys_order:
            v = flip_map.get(k)
            if v is None:
                continue
            flips_scaled[k] = safe_scale(v, sf)

    v3_data = {
        "gamma_flip_cone": {
            "alphas": safe_list(gf_cone.get('alphas')) if gf_cone else [],
            "flips": [safe_scale(f, sf) for f in safe_list(gf_cone.get('flips'))] if gf_cone else []
        } if gf_cone else None,

        "gamma_flip_cone_nearest": {
            "alphas": safe_list(gf_cone_nearest.get('alphas')) if gf_cone_nearest else [],
            "flips": [safe_scale(f, sf) for f in safe_list(gf_cone_nearest.get('flips'))] if gf_cone_nearest else []
        } if gf_cone_nearest else None,

        "gamma_flip_cone_nearest_expiry": (
            expiry_nearest.strftime("%Y-%m-%d") if expiry_nearest is not None else None
        ),
        
        "delta_flip_profile": {
            "spots": [s*sf for s in safe_list(d_flip.get('spots'))] if d_flip else [],
            "deltas": safe_list(d_flip.get('deltas')) if d_flip else [],
            "flip_value": safe_scale(d_flip.get('flip_value'), sf) if d_flip else None
        } if d_flip else None,
        
        "flow_sentiment": {
            "bull": safe_list(flow_s.get('bull')) if flow_s else [],
            "bear": safe_list(flow_s.get('bear')) if flow_s else []
        } if flow_s else None,
        
        "mm_pnl": {
            "spots": [s*sf for s in safe_list(mm_pnl.get('spots'))] if mm_pnl else [],
            "pnl": safe_list(mm_pnl.get('pnl')) if mm_pnl else []
        } if mm_pnl else None,
        
        "max_pain_profile": {
            "strikes": [k*sf for k in safe_list(mp_prof.get('strikes'))] if mp_prof else [],
            "loss": safe_list(mp_prof.get('loss')) if mp_prof else []
        } if mp_prof else None,

        "fair_value_sims": fair_value_sims,
        "fair_value_sims_nearest": fair_value_sims_nearest,
        "dealer_pressure_profile": safe_list(summary_metrics.get('dpi_arr')),
        "flip_variations": flips_scaled or None
    }

    # Gerar Script NTSL (ProfitChart)
    # IMPORTANTE: Passamos valores ORIGINAIS (não escalados), pois o ntsl.py agora aplica o scale factor internamente.
    metrics_ntsl = {
        'spot': spot,
        'call_wall': calc.call_wall,
        'put_wall': calc.put_wall,
        'effective_call_wall': calc.effective_call_wall,
        'effective_put_wall': calc.effective_put_wall,
        'range_high': calc.call_wall, # Fallback simples
        'range_low': calc.put_wall,   # Fallback simples
        'max_pain': calc.max_pain
    }
    
    # Tenta calcular range baseado em vol se possível, ou usa walls
    try:
        ntsl_code = generate_ntsl_script(metrics_ntsl, calc)
    except Exception as e:
        print(f"Aviso: Erro ao gerar NTSL: {e}")
        ntsl_code = "// Erro ao gerar script. Verifique os dados."

    scale_diagnostics = {
        "ewz_spot": float(spot),
        "index_spot": index_spot,
        "scaling_ewz_ref_close": ewz_ref,
        "scaling_index_ref_close": idx_ref,
        "display_scale_factor": sf,
        "ref_close_diff_pct": ref_diff_pct,
        "spot_ratio_to_index_ref": spot_ratio_to_ref,
        "exposure_index_scale_enabled": bool(getattr(settings, 'EXPOSURE_INDEX_SCALE_ENABLED', True))
    }
    
    market_data = {
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "spot_price": index_spot,  # Usar preço do índice (WIN), não o EWZ raw
        "ntsl_script": ntsl_code,
        "market_sentiment": {
            "score": 65,
            "label": "Bullish",
            "delta_sign": "positive" if delta_cum[-1] > 0 else "negative"
        },
        "overview": overview,
        "key_levels": key_levels,
        "most_actives": most_actives,
        "v3_data": v3_data,
        "delta_data": {
            "strikes": safe_list(strikes),
            "delta_values": safe_list(delta_values),
            "delta_cumulative": safe_list(delta_cum)
        },
        "gamma_data": {
            "strikes": safe_list(strikes),
            "gamma_values": safe_list(gamma_values), # GEX Net
            "gamma_call": safe_list(gex_call),       # GEX Call (Novo)
            "gamma_put": safe_list(gex_put),         # GEX Put (Novo)
            "gamma_exposure": safe_list(calc.gex_cum) # GEX Acumulado
        },
        "oi_data": {
            "strikes": safe_list(strikes),
            "call_oi": safe_list(call_oi),
            "put_oi": safe_list(put_oi),
            "total_oi": safe_list(total_oi)
        },
        "oi_data_nearest": oi_data_nearest_payload,
        "gex_by_expiry": gex_by_expiry,
        "oi_by_expiry": oi_by_expiry,
        "volume_data": {
            "strikes": safe_list(strikes),
            "call_volume": safe_list(call_vol), 
            "put_volume": safe_list(put_vol),
            "total_volume": safe_list(total_vol)
        },
        "volatility_data": {
            "strikes": safe_list(strikes),
            "iv_values": safe_list(iv_values),
            "skew": safe_list(calc.iv_skew),
            "term_structure": term_structure
        },
        "greeks_2nd_order": {
            "strikes": safe_list(strikes),
            "charm": safe_list(charm_values),
            "vanna": safe_list(vanna_values),
            "vex": safe_list(vex_values),
            "theta": safe_list(theta_values),
            "charm_cum": safe_list(charm_cum),
            "vanna_cum": safe_list(vanna_cum),
            "theta_cum": safe_list(theta_cum),
            "r_gamma": safe_list(r_gamma_exposure),
            "r_gamma_cum": safe_list(r_gamma_cum)
        },
        "ewz_meta": {
            "expiration": _fmt_date_yyyy_mm_dd(expiry_reference_applied) + f" ({(expiry_reference_applied - today).days} DTE)" if expiry_reference_applied else None,
            "atm_iv_pct": getattr(settings, 'EWZ_ATM_IV_PCT', None),
            "hv_pct": getattr(settings, 'EWZ_HV_PCT', None),
            "iv_rank_pct": getattr(settings, 'EWZ_IV_RANK_PCT', None),
            "iv_context_source_url": getattr(settings, 'EWZ_IV_CONTEXT_SOURCE_URL', None),
            "iv_context_captured_at_utc": getattr(settings, 'EWZ_IV_CONTEXT_CAPTURED_AT_UTC', None),
            "iv_context_method": getattr(settings, 'EWZ_IV_CONTEXT_METHOD', None),
            "expiry_reference": {
                "mode": expiry_reference_mode,
                "detected": _fmt_date_yyyy_mm_dd(detected_expiry),
                "manual": _fmt_date_yyyy_mm_dd(manual_expiry),
                "applied": (
                    expiry_reference_applied.strftime("%Y-%m-%d")
                    if hasattr(expiry_reference_applied, "strftime")
                    else (str(expiry_reference_applied) if expiry_reference_applied is not None else None)
                ),
            },
        },
        "scale_diagnostics": scale_diagnostics,
        "detailed_data": detailed_data
    }
    
    # 4. Salvar Dados
    output_path_json = os.path.join('dashboard_v1', 'assets', 'data', 'market_data.json')

    if not settings.ENABLE_V1_EXPORTS:
        print("Exportação V1 desabilitada (ENABLE_V1_EXPORTS=False). Dados montados apenas em memória.")
        return
    try:
        # Garantir diretório
        os.makedirs(os.path.dirname(output_path_json), exist_ok=True)
        
        # 1. Salvar como JSON puro (Compatibilidade)
        with open(output_path_json, "w", encoding="utf-8") as f:
            json.dump(market_data, f, default=convert_to_serializable, indent=4)
        print(f"Dados exportados com sucesso para: {output_path_json}")
        
        # 2. Salvar como Arquivo JS Global (Para funcionar sem servidor/CORS)
        # Caminho: dashboard_v1/assets/data/market_data.js
        output_path_js = output_path_json.replace('.json', '.js')
        json_str = json.dumps(market_data, default=convert_to_serializable, indent=4)
        js_content = f"window.marketData = {json_str};"
        
        with open(output_path_js, "w", encoding="utf-8") as f:
            f.write(js_content)
        print(f"Dados exportados como JS Global para: {output_path_js}")

        # 3. Salvar no Dashboard Unificado (WIN)
        try:
            unified_path = os.path.join(project_root, 'dashboard_unificado', 'WIN', 'assets', 'data')
            os.makedirs(unified_path, exist_ok=True)
            
            output_unified_json = os.path.join(unified_path, 'market_data.json')
            output_unified_js = os.path.join(unified_path, 'market_data.js')
            output_unified_ntsl = os.path.join(unified_path, 'ntsl_script.txt')

            with open(output_unified_json, "w", encoding="utf-8") as f:
                json.dump(market_data, f, default=convert_to_serializable, indent=4)
            print(f"Dados exportados para Dashboard Unificado: {output_unified_json}")

            with open(output_unified_js, "w", encoding="utf-8") as f:
                f.write(js_content)
            print(f"Dados JS exportados para Dashboard Unificado: {output_unified_js}")
            
            with open(output_unified_ntsl, "w", encoding="utf-8") as f:
                f.write(ntsl_code)
            print(f"Script NTSL exportado para Dashboard Unificado: {output_unified_ntsl}")
        except Exception as e:
            print(f"ERRO ao salvar no Dashboard Unificado: {e}")
            
    except Exception as e:
        print(f"ERRO ao salvar JSON/JS: {e}")

    # Gerar Script NTSL (ProfitChart)
    try:
        ntsl_file = os.path.join('dashboard_v1', 'assets', 'data', 'ntsl_script.txt')
        with open(ntsl_file, "w", encoding="utf-8") as f:
            f.write(ntsl_code)
        print(f"Script NTSL exportado para: {ntsl_file}")
    except Exception as e:
        print(f"ERRO ao salvar NTSL: {e}")

if __name__ == "__main__":
    main()
