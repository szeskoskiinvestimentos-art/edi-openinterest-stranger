import plotly.graph_objects as go
import numpy as np

def create_detailed_table(calc, metrics):
    """
    Recria a Tabela Detalhada (Figura 3) com métricas de GEX, Walls, Range e Midwalls.
    """
    spot = metrics['spot']
    
    # Midwalls
    mid_above = [k for k in calc.midwalls_strikes if k >= spot][:3]
    mid_below = [k for k in calc.midwalls_strikes if k < spot][-3:]
    # Ordenar mid_below decrescente (mais próximo do spot primeiro) se necessário, mas a lista original já está ordenada?
    # calc.midwalls_strikes é ordenado crescente.
    # Então mid_below (menores que spot) pega os últimos 3 (mais próximos do spot, mas em ordem crescente).
    # Ex: spot 5400. Mids: ..., 5350, 5375. mid_below[-3:] -> 5325, 5350, 5375.
    # A imagem mostra "5350" para Midwalls abaixo (3). Talvez mostre só o mais próximo ou lista.
    # A imagem mostra: "5438" (acima) e "5350" (abaixo). Parecem ser valores únicos, não listas.
    # Descrição diz "3 midpoints...". Talvez seja a lista.
    # A imagem mostra apenas um valor. Talvez seja a média ou o mais próximo.
    # Vou exibir lista separada por pipe.
    mid_above_txt = ' | '.join([f"{k:.0f}" for k in mid_above]) if mid_above else 'N/A'
    mid_below_txt = ' | '.join([f"{k:.0f}" for k in mid_below]) if mid_below else 'N/A'
    
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
        return f"{val:,.2f}"

    # PCR
    oi_call_sum = np.sum(calc.oi_call_ref)
    oi_put_sum = np.sum(calc.oi_put_ref)
    pcr = (oi_put_sum / oi_call_sum) if oi_call_sum > 0 else np.nan
    
    # Walls Próximas
    # Extrair walls de metrics['walls_call_txt'] (formato "5700(1,200) | ...")
    def parse_walls(txt):
        if not txt: return []
        try:
            return [float(x.split('(')[0]) for x in txt.split('|')]
        except:
            return []
            
    c_walls = parse_walls(metrics['walls_call_txt'])
    p_walls = parse_walls(metrics['walls_put_txt'])
    
    cw_next = min(c_walls, key=lambda x: abs(x-spot)) if c_walls else None
    pw_next = min(p_walls, key=lambda x: abs(x-spot)) if p_walls else None
    
    cw_next_txt = f"{cw_next:.0f} (dist {abs(cw_next-spot):.0f})" if cw_next else 'N/A'
    pw_next_txt = f"{pw_next:.0f} (dist {abs(pw_next-spot):.0f})" if pw_next else 'N/A'
    
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
    
    values = [
        f"{spot:.0f}",
        f"{metrics['delta_agregado']:,.0f}",
        f"{iv_daily*100:.2f}",
        f"{metrics['range_low']:.0f}–{metrics['range_high']:.0f}",
        f"{metrics['range_low']:.0f}",
        f"{metrics['range_high']:.0f}",
        (f"{metrics['gamma_flip']:.0f}" if metrics['gamma_flip'] else 'N/A'),
        metrics['regime'],
        (f"{pcr:.2f}" if not np.isnan(pcr) else 'N/A'),
        metrics['walls_call_txt'],
        metrics['walls_put_txt'],
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
        cells=dict(values=[items, values, descs], fill_color='black', align='left', font=dict(color='white', size=12), height=25),
        columnwidth=[200, 300, 400]
    )])
    
    fig.update_layout(title='Edi - Tabela Detalhada (Figura 3)', template='plotly_dark', margin=dict(t=40, l=10, r=10, b=10), height=650)
    return fig

def create_model_comparison_table(calc):
    """
    Cria tabela comparativa entre os modelos de Gamma Flip e Delta Flip.
    """
    flips = calc.flip_variations
    spot = calc.spot
    
    models = []
    values = []
    dists = []
    
    # Ordem de preferência
    keys = ['Classic', 'Spline', 'HVL', 'HVL Log', 'Sigma Kernel', 'PVOP']
    
    # Descrições dos modelos
    descriptions_map = {
        'Classic': 'Interpolação linear simples entre strikes positivos/negativos',
        'Spline': 'Suavização por spline univariada (mais estável)',
        'HVL': 'Ponderado por volatilidade histórica local (High Vol)',
        'HVL Log': 'Variação logarítmica do modelo HVL',
        'Sigma Kernel': 'Kernel gaussiano baseado no desvio padrão (sigma)',
        'PVOP': 'Ponderado pelo valor presente de um ponto (PVOP)',
        'Delta Flip': 'Ponto onde o Delta Agregado cruza zero (neutralidade)'
    }

    descs = []
    
    for name in keys:
        if name in flips:
            val = flips[name]
            models.append(name)
            values.append(f"{val:.0f}" if val else "N/A")
            dists.append(f"{val - spot:+.0f}" if val else "N/A")
            descs.append(descriptions_map.get(name, ''))
            
    # Adicionar Delta Flip
    df_profile = calc.delta_flip_profile
    if df_profile and df_profile.get('flip_value'):
        d_val = df_profile['flip_value']
        models.append('Delta Flip')
        values.append(f"{d_val:.0f}")
        dists.append(f"{d_val - spot:+.0f}")
        descs.append(descriptions_map.get('Delta Flip', ''))
        
    fig = go.Figure(data=[go.Table(
        header=dict(values=['Modelo', 'Valor (Flip)', 'Distância do Spot', 'Descrição'], fill_color='#8e44ad', align='left', font=dict(color='white', size=12)),
        cells=dict(values=[models, values, dists, descs], fill_color='black', align='left', font=dict(color='white', size=12), height=30),
        columnwidth=[150, 100, 120, 400]
    )])
    
    fig.update_layout(title='Edi - Comparativo de Modelos Flip & Delta', template='plotly_dark', margin=dict(t=40, l=10, r=10, b=10), height=400)
    return fig
