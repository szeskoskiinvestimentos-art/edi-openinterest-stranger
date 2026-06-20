import plotly.graph_objects as go
import json
import os
import numpy as np
import pandas as pd
from datetime import datetime
from scipy.stats import norm
from plotly.subplots import make_subplots
from src import config as settings
from src.utils_fmt import format_number_br, parse_and_scale_walls

import logging

logger = logging.getLogger(__name__)

def create_detailed_table(calc, metrics):
    """
    Recria a Tabela Detalhada (Figura 3) com métricas de GEX, Walls, Range e Midwalls.
    """
    sf = getattr(settings, 'DISPLAY_SCALE_FACTOR', 1.0)
    spot = metrics['spot'] * sf
    
    # Midwalls (Escalar strikes)
    mid_above = [k * sf for k in calc.midwalls_strikes if k >= metrics['spot']][:3]
    mid_below = [k * sf for k in calc.midwalls_strikes if k < metrics['spot']][-3:]
    
    mid_above_txt = ' | '.join([format_number_br(k, 0) for k in mid_above]) if mid_above else 'N/A'
    mid_below_txt = ' | '.join([format_number_br(k, 0) for k in mid_below]) if mid_below else 'N/A'
    
    # Net GEX
    # Net GEX (OI) = Soma de gex_tot
    # Se os valores forem muito pequenos/grandes, ajustaremos.
    net_gex_oi = np.sum(calc.gex_tot)
    
    # Net GEX (VOL) = Soma de gex_flip_base ponderado por IV (aproximação)
    # gex_flip_base já considera sinal call/put.
    gex_iv = calc.gex_flip_base * calc.iv_strike_ref
    net_gex_vol = np.sum(gex_iv)
    
    def fmt_gex(val):
        # Heurística para formatação baseada na magnitude
        if abs(val) < 100: return f"{val:.4f}"
        return format_number_br(val, 2)

    # PCR
    oi_call_sum = np.sum(calc.oi_call_ref)
    oi_put_sum = np.sum(calc.oi_put_ref)
    pcr = (oi_put_sum / oi_call_sum) if oi_call_sum > 0 else np.nan
    
    # Walls Próximas
    # Extrair walls de metrics['walls_call_txt'] (formato "5700(1,200) | ...")
    c_walls_vals, c_walls_txt = parse_and_scale_walls(metrics['walls_call_txt'], sf)
    p_walls_vals, p_walls_txt = parse_and_scale_walls(metrics['walls_put_txt'], sf)
    
    cw_next = min(c_walls_vals, key=lambda x: abs(x-spot)) if c_walls_vals else None
    pw_next = min(p_walls_vals, key=lambda x: abs(x-spot)) if p_walls_vals else None
    
    cw_next_txt = f"{format_number_br(cw_next, 0)} (dist {format_number_br(abs(cw_next-spot), 0)})" if cw_next else 'N/A'
    pw_next_txt = f"{format_number_br(pw_next, 0)} (dist {format_number_br(abs(pw_next-spot), 0)})" if pw_next else 'N/A'
    
    # IV Daily
    iv_daily = calc.iv_annual / np.sqrt(252)

    # Dados da Tabela
    items = [
        'Spot', 'EDI - Delta Agregado', 'Volatilidade Diária (%)',
        'Linha amarela (range)', 'Range baixo', 'Range alto',
        'Gamma Flip', 'Regime', 'Put/Call',
        'CALL walls top', 'PUT walls top',
        'CALL wall próxima', 'PUT wall próxima',
        'Midwalls acima (3)', 'Midwalls abaixo (3)',
        'Net GEX (OI)', 'Net GEX (VOL)'
    ]
    
    range_low = metrics['range_low'] * sf
    range_high = metrics['range_high'] * sf
    gamma_flip = metrics['gamma_flip'] * sf if metrics['gamma_flip'] else None
    
    values = [
        format_number_br(spot, 0),
        format_number_br(metrics['delta_agregado'], 0),
        f"{format_number_br(iv_daily*100, 2)}%",
        f"{format_number_br(range_low, 0)}–{format_number_br(range_high, 0)}",
        format_number_br(range_low, 0),
        format_number_br(range_high, 0),
        (format_number_br(gamma_flip, 0) if gamma_flip else 'N/A'),
        metrics['regime'],
        (format_number_br(pcr, 2) if not np.isnan(pcr) else 'N/A'),
        c_walls_txt,
        p_walls_txt,
        cw_next_txt,
        pw_next_txt,
        mid_above_txt,
        mid_below_txt,
        fmt_gex(net_gex_oi),
        fmt_gex(net_gex_vol)
    ]
    
    descs = [
        'Preço à vista (pontos)', 'Soma líquida de Delta por strike (Δ*OI)', 'IV diária em % (ATM por strike)',
        'Intervalo diário esperado (amarelo)', 'Limite inferior esperado intradiário', 'Limite superior esperado intradiário',
        'Zero Gamma (Gamma Flip) interpolado', 'Sinal do Gamma acumulado no spot', 'Put/Call Ratio agregado',
        'Top-3 paredes de OI em CALL', 'Top-3 paredes de OI em PUT',
        'Strike de CALL mais próximo do spot', 'Strike de PUT mais próximo do spot',
        '3 midpoints de strike acima do spot', '3 midpoints de strike abaixo do spot',
        'Soma líquida do GEX OI', 'Soma líquida do GEX VOL'
    ]
    
    fig = go.Figure(data=[go.Table(
        header=dict(values=['Item','Valor','Descrição'], fill_color='#2c3e50', align='left', font=dict(color='white', size=12)),
        cells=dict(values=[items, values, descs], fill_color='#1c1c1c', align='left', font=dict(color='lightgrey', size=11), height=25),
        columnwidth=[200, 150, 400]
    )])
    
    fig.update_layout(margin=dict(l=0, r=0, t=0, b=0), height=500, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
    return fig

def create_model_comparison_table(calc):
    """
    Tabela comparativa de modelos (se implementado).
    """
    sf = getattr(settings, "DISPLAY_SCALE_FACTOR", 1.0)
    try:
        spot = float(getattr(calc, "spot", 0.0)) * float(sf)
    except Exception as e:
        logger.debug("[E95] create_model_comparison_table failed: %s", e)
        spot = 0.0

    flip_map = getattr(calc, "flip_variations", {}) or {}
    flip_keys_order = ["Classic", "Spline", "HVL", "HVL Log", "Sigma Kernel", "PVOP", "HVL Gaussian"]

    rows = []

    def add_row(modelo, val):
        try:
            v = float(val) * float(sf)
        except Exception as e:
            logger.debug("[E95] add_row failed: %s", e)
            return
        if not np.isfinite(v):
            return
        rows.append(
            {
                "Modelo": str(modelo),
                "Nível": format_number_br(v, 0),
                "Dist. Spot": format_number_br(abs(v - spot), 0),
            }
        )

    add_row("Gamma Flip (main)", getattr(calc, "gamma_flip", None))
    add_row("Gamma Flip HVL", getattr(calc, "gamma_flip_hvl", None))
    add_row("Zero Gamma (interp)", getattr(calc, "zero_gamma_level", None))

    delta_profile = getattr(calc, "delta_flip_profile", {}) or {}
    add_row("Delta Flip (perfil)", delta_profile.get("flip_value"))

    for k in flip_keys_order:
        add_row(f"Gamma Flip ({k})", flip_map.get(k))

    if not rows:
        rows = [{"Modelo": "-", "Nível": "Dados indisponíveis", "Dist. Spot": "-"}]

    fig = go.Figure(
        data=[
            go.Table(
                header=dict(
                    values=["Modelo", "Nível", "Dist. Spot"],
                    fill_color="#2c3e50",
                    align="left",
                    font=dict(color="white", size=12),
                ),
                cells=dict(
                    values=[
                        [r["Modelo"] for r in rows],
                        [r["Nível"] for r in rows],
                        [r["Dist. Spot"] for r in rows],
                    ],
                    fill_color="#1c1c1c",
                    align="left",
                    font=dict(color="lightgrey", size=11),
                    height=28,
                ),
            )
        ]
    )
    fig.update_layout(
        margin=dict(l=0, r=0, t=0, b=0),
        height=420,
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
    )
    return fig

def create_fed_rates_table(options_df=None, spot=None, expiry=None):
    project_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    candidates = [
        os.path.join(project_dir, "data_input", "fed_rates.json"),
        os.path.join(
            os.path.dirname(project_dir),
            "Edi_OpenInterest - PY - Stranger - WDO",
            "data_input",
            "fed_rates.json",
        ),
    ]

    data = {}
    for p in candidates:
        if not os.path.isfile(p):
            continue
        try:
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f) or {}
            break
        except Exception as e:
            logger.debug("[E95] create_fed_rates_table failed: %s", e)
            data = {}

    if isinstance(data, dict):
        src = str(data.get("source") or "").strip().lower()
        if src and ("simulated" in src or "mock" in src or "demo" in src):
            data = {}

    meetings = data.get("meetings") if isinstance(data, dict) else None
    meetings = meetings if isinstance(meetings, list) else []

    rows = []
    for m in meetings:
        if not isinstance(m, dict):
            continue
        probs = m.get("probs") if isinstance(m.get("probs"), dict) else {}
        probs_txt = (
            " | ".join([f"{k}: {format_number_br(v, 1)}%" for k, v in probs.items()])
            if probs
            else "-"
        )
        rows.append(
            [
                str(m.get("date") or "-"),
                str(m.get("days_remaining") if m.get("days_remaining") is not None else "-"),
                str(m.get("current_rate") or "-"),
                probs_txt,
            ]
        )

    if not rows:
        rows = [["-", "-", "-", "Dados indisponíveis"]]

    fig = go.Figure(
        data=[
            go.Table(
                header=dict(
                    values=["Reunião", "Dias", "Faixa Atual", "Probabilidades"],
                    fill_color="#2c3e50",
                    align="center",
                    font=dict(color="white", size=12),
                ),
                cells=dict(
                    values=list(zip(*rows)),
                    fill_color="#1c1c1c",
                    align="center",
                    font=dict(color="lightgrey", size=11),
                    height=30,
                ),
            )
        ]
    )
    fig.update_layout(
        margin=dict(l=0, r=0, t=40, b=0),
        height=300,
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        title=dict(text="FedWatch (Juros EUA)", x=0.5, font=dict(color="white")),
    )
    return fig

def create_fedwatch_table(options_df, spot, expiry):
    """
    Cria tabela estilo FedWatch com probabilidades baseadas na volatilidade implícita.
    """
    sf = getattr(settings, 'DISPLAY_SCALE_FACTOR', 1.0)
    
    rows = []
    if 'Expiry' in options_df.columns:
        exp_groups = options_df.groupby('Expiry')
        for exp_date, group in exp_groups:
            if pd.isnull(exp_date): continue
            
            T_exp = (pd.to_datetime(exp_date) - pd.to_datetime(datetime.now())).days / 365.0
            if T_exp < 0: T_exp = 0.001
            
            group = group.copy()
            group['dist'] = abs(group['StrikeK'] - spot)
            
            atm_iv = settings.IV_ANNUAL
            if 'IV' in group.columns and not group.empty:
                try:
                    atm_iv_val = group.sort_values('dist')['IV'].iloc[0]
                    if atm_iv_val > 5.0: atm_iv_val /= 100.0
                    atm_iv = atm_iv_val
                except: pass
            
            sigma = atm_iv * np.sqrt(T_exp)
            current_spot_scaled = spot * sf
            
            probs = []
            for sd in [1, 2, 3]:
                upper = current_spot_scaled * np.exp(sd * sigma)
                lower = current_spot_scaled * np.exp(-sd * sigma)
                probs.append(f"{format_number_br(lower, 0)} - {format_number_br(upper, 0)}")
            
            rows.append([
                str(exp_date.date()),
                int(T_exp * 365),
                f"{format_number_br(atm_iv*100, 2)}%",
                probs[0],
                probs[1],
                probs[2]
            ])
            
    fig = go.Figure(data=[go.Table(
        header=dict(values=['Vencimento', 'Dias', 'IV ATM', '68% (1σ)', '95% (2σ)', '99% (3σ)'],
                    fill_color='#2c3e50', align='center', font=dict(color='white', size=12)),
        cells=dict(values=list(zip(*rows)) if rows else [],
                   fill_color='#1c1c1c', align='center', font=dict(color='lightgrey', size=11),
                   height=30)
    )])
    fig.update_layout(margin=dict(l=0, r=0, t=40, b=0), height=300, 
                      paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                      title=dict(text='FedWatch Tool (Probabilidades Implícitas)', x=0.5, font=dict(color='white')))
    return fig

def create_most_actives_table(options_df):
    """
    Cria tabela de Most Actives (Top OI e Top Volume).
    """
    sf = getattr(settings, 'DISPLAY_SCALE_FACTOR', 1.0)

    def fmt_iv(iv_val):
        if iv_val is None:
            return '-'
        if bool(pd.isna(iv_val)):
            return '-'
        try:
            return f"{format_number_br(float(iv_val), 1)}%"
        except Exception as e:
            logger.debug("[E95] fmt_iv failed: %s", e)
            return '-'
    
    top_oi = options_df.sort_values('Open Int', ascending=False).head(10)
    
    if 'Volume' in options_df.columns:
        top_vol = options_df.sort_values('Volume', ascending=False).head(10)
    else:
        top_vol = pd.DataFrame()
        
    fig = make_subplots(
        rows=1, cols=2,
        specs=[[{"type": "table"}, {"type": "table"}]],
        subplot_titles=("🔥 Top Open Interest", "🌊 Top Volume")
    )
    
    fig.add_trace(go.Table(
        header=dict(values=['Strike', 'Tipo', 'OI', 'IV'], fill_color='#2c3e50', font=dict(color='white')),
        cells=dict(values=[
            [format_number_br(r['StrikeK'] * sf, 2) for _, r in top_oi.iterrows()],
            [r['OptionType'] for _, r in top_oi.iterrows()],
            [format_number_br(r['Open Int'], 0) for _, r in top_oi.iterrows()],
            [fmt_iv(r.get('IV')) for _, r in top_oi.iterrows()]
        ], fill_color='#1c1c1c', font=dict(color='lightgrey'))
    ), row=1, col=1)
    
    if not top_vol.empty:
        fig.add_trace(go.Table(
            header=dict(values=['Strike', 'Tipo', 'Vol', 'IV'], fill_color='#2c3e50', font=dict(color='white')),
            cells=dict(values=[
                [format_number_br(r['StrikeK'] * sf, 2) for _, r in top_vol.iterrows()],
                [r['OptionType'] for _, r in top_vol.iterrows()],
                [format_number_br(r['Volume'], 0) for _, r in top_vol.iterrows()],
                [fmt_iv(r.get('IV')) for _, r in top_vol.iterrows()]
            ], fill_color='#1c1c1c', font=dict(color='lightgrey'))
        ), row=1, col=2)
        
    fig.update_layout(margin=dict(l=0, r=0, t=50, b=0), height=400,
                      paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                      title=dict(text='Most Actives', x=0.5, font=dict(color='white')))
                      
    return fig
