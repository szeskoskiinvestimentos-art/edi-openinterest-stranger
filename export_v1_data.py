import json
import os
import sys
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Any, Optional, List, Union

# Adicionar o diretório atual ao path para importar módulos src
sys.path.append(os.getcwd())

try:
    from src.data_loader import load_data
    from src.calculator import OptionsCalculator
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

def main():
    print("=== Exportador de Dados para Dashboard V1 (Stranger Things) ===")
    
    # 1. Carregar Dados
    print("Carregando dados...")
    target_dir = 'data_input'
    
    if os.path.exists(target_dir) and any(f.endswith('.csv') for f in os.listdir(target_dir)):
         print(f"Utilizando diretório de dados: {target_dir}")
    else:
        target_dir = '.'
        if not any(f.endswith('.csv') for f in os.listdir('.')) and os.path.exists('Histórico barchart'):
            target_dir = 'Histórico barchart'
        
    options_df, spot, expiry = load_data(directory=target_dir, use_csv_spot=settings.USE_CSV_SPOT, spot_override=settings.SPOT)
    
    if options_df.empty:
        print("ERRO: Nenhum dado encontrado.")
        return

    # 2. Calcular Métricas
    print("Calculando gregas e métricas...")
    calc = OptionsCalculator(options_df, spot, expiry)
    calc.calculate_greeks_exposure()
    calc.calculate_flips_and_walls()
    
    # Cálculos Avançados V3
    print("Calculando métricas avançadas V3...")
    calc.calculate_expected_moves()
    calc.calculate_volatility_analysis() # Novo
    calc.calculate_pinning_risk()      # Novo
    calc.calculate_gamma_flip_cone()
    calc.calculate_delta_flip_profile()
    calc.calculate_flow_sentiment()
    calc.calculate_mm_pnl_simulation()
    
    # Obter Métricas Resumidas (Necessário para Overview e Key Levels)
    summary_metrics = calc.get_summary_metrics()

    # Prepara dados vetoriais (Definido antes para uso nas simulações)
    sf = getattr(settings, 'DISPLAY_SCALE_FACTOR', 1.0)

    # Fair Value Simulation (Novo)
    print("Calculando Simulação de Valor Justo...")
    fair_value_sims = []
    # Cenários: Call Wall, Put Wall, Gamma Flip, +1%, -1%
    scenarios = [
        {'label': 'Call Wall', 'spot': calc.call_wall},
        {'label': 'Put Wall', 'spot': calc.put_wall},
        {'label': 'Gamma Flip', 'spot': calc.gamma_flip},
        {'label': '+1%', 'spot': spot * 1.01},
        {'label': '-1%', 'spot': spot * 0.99}
    ]
    
    for scen in scenarios:
        if scen['spot'] and not np.isnan(scen['spot']):
            try:
                # Simula para "Hoje" (dias=0)
                if hasattr(calc, 'calculate_fair_value_scenario'):
                    res = calc.calculate_fair_value_scenario(scen['spot'], target_days_from_now=0)
                    if res: # Garante que retornou algo válido
                        # Escalar os resultados da simulação
                        scaled_res = []
                        for item in res:
                            scaled_res.append({
                                'Strike': safe_scale(item.get('Strike'), sf),
                                'Call_Now': safe_scale(item.get('Call_Now'), sf),
                                'Call_Sim': safe_scale(item.get('Call_Sim'), sf),
                                'Call_Chg': item.get('Call_Chg'), # Porcentagem
                                'Put_Now': safe_scale(item.get('Put_Now'), sf),
                                'Put_Sim': safe_scale(item.get('Put_Sim'), sf),
                                'Put_Chg': item.get('Put_Chg') # Porcentagem
                            })

                        fair_value_sims.append({
                            'scenario': scen['label'],
                            'target_spot': safe_scale(scen['spot'], sf),
                            'options': scaled_res
                        })
            except Exception as e:
                print(f"Erro ao simular cenário {scen['label']}: {e}")

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
    
    # Volume/OI Data
    call_oi = calc.oi_call_ref
    put_oi = calc.oi_put_ref
    total_oi = call_oi + put_oi
    
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
    
    # Term Structure (Volatilidade por Vencimento)
    # Precisamos agrupar por Expiry e pegar a IV média ou ATM
    term_structure_data = {"expiries": [], "iv_atm": []}
    if 'Expiry' in options_df.columns:
        exp_groups = options_df.groupby('Expiry')
        for exp_date, group in exp_groups:
            # Pega ATM aproximado (Strike mais próximo do Spot)
            atm_row = group.iloc[(group['StrikeK'] - spot).abs().argsort()[:1]]
            if not atm_row.empty:
                term_structure_data["expiries"].append(str(exp_date))
                # Tenta pegar IV se existir, senão calcula simples ou usa 0
                # O calculator não exporta IV por vencimento facilmente, vamos tentar pegar do group se tiver col IV
                # Se não tiver, vamos deixar vazio por enquanto ou usar valor fixo
                # Vamos usar a média da coluna 'IV' se existir no DF original (Data Loader costuma carregar)
                if 'IV' in group.columns:
                    iv_mean = group['IV'].mean()
                    term_structure_data["expiries"].append(str(exp_date))
                    term_structure_data["iv_atm"].append(iv_mean)
                else:
                    # Fallback
                    pass
    
    # Detailed Data List
    detailed_data = []
    for i, k in enumerate(strikes):
        detailed_data.append({
            "strike": float(k),
            "delta": float(delta_values[i]),
            "gamma": float(gamma_values[i]),
            "volume": 0,
            "oi": int(total_oi[i]),
            "iv": float(iv_values[i])
        })
        
    # Overview
    overview = {
        "total_trades": int(np.sum(total_oi)), 
        "total_volume": int(np.sum(total_oi)),
        "gamma_exposure": float(np.sum(gamma_values)),
        "delta_position": float(np.sum(delta_values)),
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
                "move": move.get("move"), # Porcentagem mantem
                "upper": safe_scale(move.get("upper"), sf),
                "lower": safe_scale(move.get("lower"), sf)
            })

    key_levels = {
        "gamma_flip": safe_scale(calc.gamma_flip, sf),
        "gamma_flip_hvl": safe_scale(calc.gamma_flip_hvl, sf),
        "gamma_flip_hvl_gaussian": safe_scale(calc.flip_variations.get('HVL Gaussian'), sf) if hasattr(calc, 'flip_variations') and calc.flip_variations else None,
        "call_wall": safe_scale(calc.call_wall, sf),
        "put_wall": safe_scale(calc.put_wall, sf),
        "effective_call_wall": safe_scale(calc.effective_call_wall, sf),
        "effective_put_wall": safe_scale(calc.effective_put_wall, sf),
        "max_pain": safe_scale(calc.max_pain, sf),
        "zero_gamma": safe_scale(calc.zero_gamma_level, sf),
        "range_low": safe_scale(summary_metrics.get('range_low'), sf),
        "range_high": safe_scale(summary_metrics.get('range_high'), sf),
        "expected_moves": expected_moves_scaled,
        "pinning_risk": {
            "strike": safe_scale(calc.pinning_risk.get('strike'), sf) if getattr(calc, 'pinning_risk', None) else None,
            "score": calc.pinning_risk.get('strength') if getattr(calc, 'pinning_risk', None) else None
        },
        "volatility_analysis": getattr(calc, 'vol_analysis', None)
    }

    # Advanced V3 Data Structures
    v3_data = {
        "gamma_flip_cone": {
            "alphas": safe_list(calc.gamma_flip_cone.get('alphas')),
            "flips": [f*sf for f in safe_list(calc.gamma_flip_cone.get('flips'))]
        } if calc.gamma_flip_cone else None,
        
        "delta_flip_profile": {
            "spots": [s*sf for s in safe_list(calc.delta_flip_profile.get('spots'))],
            "deltas": safe_list(calc.delta_flip_profile.get('deltas')),
            "flip_value": safe_scale(calc.delta_flip_profile.get('flip_value'), sf) if calc.delta_flip_profile else None
        } if calc.delta_flip_profile else None,
        
        "flow_sentiment": {
            "bull": safe_list(calc.flow_sentiment.get('bull')),
            "bear": safe_list(calc.flow_sentiment.get('bear'))
        } if calc.flow_sentiment else None,
        
        "mm_pnl": {
            "spots": [s*sf for s in safe_list(calc.mm_pnl_simulation.get('spots'))],
            "pnl": safe_list(calc.mm_pnl_simulation.get('pnl'))
        } if calc.mm_pnl_simulation else None,
        
        "max_pain_profile": {
            "strikes": [k*sf for k in safe_list(calc.max_pain_profile.get('strikes'))],
            "loss": safe_list(calc.max_pain_profile.get('loss'))
        } if hasattr(calc, 'max_pain_profile') and calc.max_pain_profile else None,

        "fair_value_sims": fair_value_sims,
        "dealer_pressure_profile": safe_list(summary_metrics.get('dpi_arr'))
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

    market_data = {
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "spot_price": spot,
        "ntsl_script": ntsl_code,
        "market_sentiment": {
            "score": 65,
            "label": "Bullish",
            "delta_sign": "positive" if delta_cum[-1] > 0 else "negative"
        },
        "overview": overview,
        "key_levels": key_levels,
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
        "volume_data": {
            "strikes": safe_list(strikes),
            "call_volume": safe_list(call_oi), 
            "put_volume": safe_list(put_oi),
            "total_volume": safe_list(total_oi)
        },
        "volatility_data": {
            "strikes": safe_list(strikes),
            "iv_values": safe_list(iv_values),
            "skew": safe_list(calc.iv_skew)
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
            "expiration": getattr(settings, 'EWZ_EXPIRATION_LABEL', None),
            "atm_iv_pct": getattr(settings, 'EWZ_ATM_IV_PCT', None),
            "hv_pct": getattr(settings, 'EWZ_HV_PCT', None),
            "iv_rank_pct": getattr(settings, 'EWZ_IV_RANK_PCT', None)
        },
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
