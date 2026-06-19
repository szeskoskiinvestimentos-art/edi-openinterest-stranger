"""Charts — Geração de gráficos Plotly para o dashboard.

Gera figuras interativas com dados de opções, incluindo:
- Delta/Gamma/Charm/Vanna/Theta/Vega Exposure
- Open Interest por Strike e Vencimento
- Max Pain Curve, Expected Move Cone
- Gamma Flip Cone, Delta Flip Profile
- Flow Sentiment, Dealer Pressure
- MM PnL Simulation, Fair Value
"""
import plotly.graph_objects as go
import numpy as np
from src import config as settings
from src.layout_config import get_common_layout
from src.utils_fmt import format_number_br, parse_and_scale_walls

def create_dashboard_figure(calc, metrics):
    """Gera a figura principal do dashboard com todos os traces.

    Cria gráfico Plotly com 15 traces (visíveis por botões):
    0. Delta Agregado (barras)
    1. Delta Acumulado (linha)
    2. Gamma Exposure (barras)
    3. Curvatura do Gamma (linha)
    4. CALL OI (barras)
    5. PUT OI (barras)
    6. Midwalls Call (sombra)
    7. Midwalls Put (sombra)
    8. Charm Exposure (barras)
    9. Vanna Exposure (barras)
    10. Charm Acumulado (linha)
    11. Vanna Acumulado (linha)
    12. Vega Exposure (barras)
    13. Skew IV (linha pontilhada)
    14. Dealer Pressure (linha)

    Inclui InfoBox com métricas-chave e botões de seleção de trace.

    Args:
        calc: OptionsCalculator com cálculos executados
        metrics: SummaryMetrics do get_summary_metrics()

    Returns:
        go.Figure: Figura Plotly pronta para renderização.
    """
    sf = getattr(settings, 'DISPLAY_SCALE_FACTOR', 1.0)
    strikes_raw = calc.strikes_ref
    spot_raw = metrics['spot']
    # Aplica escala apenas para exibição
    strikes = strikes_raw * sf
    spot = float(spot_raw) * sf
    min_k, max_k = strikes.min(), strikes.max()
    
    # Cores de Regime
    regime_color = 'lime' if 'Positivo' in metrics['regime'] else 'red'
    
    # Texto do InfoBox
    zero_gamma_disp = (metrics['zero_gamma_level'] * sf) if metrics['zero_gamma_level'] else None
    max_pain_disp = metrics['max_pain'] * sf if metrics['max_pain'] else None
    call_wall_disp = metrics['call_wall'] * sf if metrics['call_wall'] else None
    put_wall_disp = metrics['put_wall'] * sf if metrics['put_wall'] else None

    # Formatação BRL para InfoBox
    info_text = (f"<b>Spot (Escala Índice):</b> <span style='color:lime'>{format_number_br(spot, 0)}</span><br>"
                 f"<b>Delta Agregado:</b> {format_number_br(metrics['delta_agregado'], 0)}<br>"
                 f"<b>Zero Gamma (Flip):</b> {(format_number_br(zero_gamma_disp, 0) if zero_gamma_disp else 'N/A')}<br>"
                 f"<b>Max Pain:</b> <span style='color:orange'>{format_number_br(max_pain_disp, 0)}</span><br>"
                 f"<b>Call Wall (Resist.):</b> <span style='color:red'>{format_number_br(call_wall_disp, 0)}</span><br>"
                 f"<b>Put Wall (Sup.):</b> <span style='color:green'>{format_number_br(put_wall_disp, 0)}</span><br>"
                 f"<b>Regime:</b> <span style='color:{regime_color}'>{metrics['regime']}</span><br>"
                 f"<b>Dealer Pressure:</b> {metrics['dealer_pressure']:+.2f}<br>")

    fig = go.Figure()
    
    # 0. Delta Agregado
    dexp_tot = calc.dexp_tot
    fig.add_trace(go.Bar(x=strikes, y=dexp_tot, name='Delta Agregado', 
                         marker_color=['lime' if v>=0 else 'red' for v in dexp_tot], visible=True))
                         
    # 1. Delta Acumulado
    fig.add_trace(go.Scatter(x=strikes, y=calc.dexp_cum, mode='lines', name='Delta Acumulado', 
                             visible=False, line=dict(width=3, color='yellow')))
                             
    # 2. Gamma Exposure
    fig.add_trace(go.Bar(x=strikes, y=calc.gex_tot, name='Gamma Exposure', 
                         marker_color='cyan', opacity=0.6, visible=False))
                         
    # 3. Curvatura Gamma
    fig.add_trace(go.Scatter(x=strikes, y=calc.gex_cum, mode='lines', name='Curvatura do Gamma', 
                             line=dict(color='orange', width=3), visible=False))
                             
    # 4. Call OI
    fig.add_trace(go.Bar(x=strikes, y=calc.oi_call_ref, name='CALL OI', marker_color='green', visible=False))
    
    # 5. Put OI
    fig.add_trace(go.Bar(x=strikes, y=-calc.oi_put_ref, name='PUT OI', marker_color='red', visible=False))

    # 6. Midwalls Call (Sombra)
    fig.add_trace(go.Bar(x=calc.midwalls_strikes * sf, y=calc.midwalls_call, marker_color='#2c2c2c', opacity=0.8, 
                         visible=False, showlegend=False))

    # 7. Midwalls Put (Sombra)
    fig.add_trace(go.Bar(x=calc.midwalls_strikes * sf, y=-calc.midwalls_put, marker_color='#2c2c2c', opacity=0.8, 
                         visible=False, showlegend=False))
    
    # 8. Charm Exposure
    fig.add_trace(go.Bar(x=strikes, y=calc.charm_tot, name='Charm Exposure', marker_color='magenta', opacity=0.6, visible=False))
    
    # 9. Vanna Exposure
    fig.add_trace(go.Bar(x=strikes, y=calc.vanna_tot, name='Vanna Exposure', marker_color='purple', opacity=0.6, visible=False))

    # 10. Charm Acumulado
    fig.add_trace(go.Scatter(x=strikes, y=calc.charm_cum, mode='lines', name='Charm Acumulado', 
                             line=dict(color='magenta', width=3), visible=False))

    # 11. Vanna Acumulado
    fig.add_trace(go.Scatter(x=strikes, y=calc.vanna_cum, mode='lines', name='Vanna Acumulado', 
                             line=dict(color='purple', width=3), visible=False))

    # 12. Vega Exposure
    fig.add_trace(go.Bar(x=strikes, y=calc.vex_tot, name='Vega Exposure', marker_color='gold', opacity=0.6, visible=False))

    # 13. Skew IV
    fig.add_trace(go.Scatter(x=strikes, y=calc.iv_skew, mode='lines', name='Skew IV (local)', 
                             line=dict(color='white', width=2, dash='dot'), visible=False))
    
    # 14. Dealer Pressure
    fig.add_trace(go.Scatter(x=strikes, y=metrics['dpi_arr'], mode='lines', name='Dealer Pressure', 
                             line=dict(color='#9ca3af', width=3), visible=False))

    # Layout Base
    fig.update_layout(template='plotly_dark', barmode='overlay', 
                      xaxis_title='Strike', yaxis_title='Exposição / OI', 
                      xaxis=dict(tickmode='auto'), 
                      legend=dict(orientation='h', yanchor='top', y=-0.15, xanchor='center', x=0.5), 
                      margin=dict(t=100))
                      
    # Linhas e Anotações
    spot_line = dict(type='line', x0=spot, x1=spot, y0=0, y1=1, xref='x', yref='paper', 
                     line=dict(color='lime', dash='dot', width=2))
    hline0 = dict(type='line', x0=min_k, x1=max_k, y0=0, y1=0, 
                  line=dict(color='white', dash='dot', width=1))
                  
    flip_line = None
    flip_label = None
    if metrics['gamma_flip']:
        flip_x = metrics['gamma_flip'] * sf
        flip_line = dict(type='line', x0=flip_x, x1=flip_x, y0=0, y1=1, xref='x', yref='paper', 
                         line=dict(color='red', dash='dash', width=2))
        flip_label = dict(x=flip_x, y=0.05, xref='x', yref='paper', text='Gamma Flip', showarrow=False, 
                          font=dict(color='red', size=12), bgcolor='black', bordercolor='red')

    spot_label = dict(x=float(spot), y=0.92, xref='x', yref='paper', text=f'SPOT {format_number_br(spot, 0)}', showarrow=False, 
                      font=dict(color='lime', size=12), bgcolor='black', bordercolor='lime')
                      
    def infobox():
        return dict(xref='paper', yref='paper', x=0.99, y=0.95, xanchor='right', showarrow=False, align='left', 
                    text=info_text, font=dict(size=14, color='white'), bordercolor=regime_color, borderwidth=2, 
                    borderpad=6, bgcolor='rgba(20,20,20,0.85)', opacity=0.95)

    # Configura separadores de milhar/decimal para formato BR (ponto milhar, virgula decimal)
    # Plotly syntax: separators='decimal_char+thousands_char'
    fig.update_layout(separators=',.')

    # Calculate smart range for Vanna
    v_indices = np.where(np.abs(calc.vanna_tot) > np.max(np.abs(calc.vanna_tot)) * 0.01)[0]
    if len(v_indices) > 0:
        v_min_k = strikes[v_indices[0]]
        v_max_k = strikes[v_indices[-1]]
        v_pad = (v_max_k - v_min_k) * 0.1
        vanna_range = [v_min_k - v_pad, v_max_k + v_pad]
    else:
        vanna_range = [strikes[0], strikes[-1]]

    base_shapes = [spot_line, hline0]
    if flip_line: base_shapes.append(flip_line)
    
    base_annotations = [infobox(), spot_label]
    if flip_label: base_annotations.append(flip_label)

    # Definição dos botões para alternar visualizações
    # Indices:
    # 0: Delta Agg, 1: Delta Cum
    # 2: GEX, 3: GEX Cum
    # 4: Call OI, 5: Put OI, 6: MidCall, 7: MidPut
    # 8: Charm, 9: Vanna
    # 10: Charm Cum, 11: Vanna Cum
    # 12: Vega
    # 13: Skew
    # 14: DPI

    buttons = [
        dict(label='Delta Agregado', method='update', 
             args=[{'visible':[True, False, False, False, False, False, False, False, False, False, False, False, False, False, False]}, 
                   {'title':'Edi - Delta Agregado por Strike', 'shapes':base_shapes, 'annotations':base_annotations}]),
        dict(label='Delta Acumulado', method='update', 
             args=[{'visible':[False, True, False, False, False, False, False, False, False, False, False, False, False, False, False]}, 
                   {'title':'Edi - Delta Acumulado', 'shapes':base_shapes, 'annotations':base_annotations}]),
        dict(label='Gamma Exposure', method='update', 
             args=[{'visible':[False, False, True, True, False, False, False, False, False, False, False, False, False, False, False]}, 
                   {'title':'Edi - Gamma Exposure & Curvatura', 'shapes':base_shapes, 'annotations':base_annotations}]),
        dict(label='Open Interest', method='update', 
             args=[{'visible':[False, False, False, False, True, True, True, True, False, False, False, False, False, False, False]}, 
                   {'title':'Edi - Open Interest (OI) por Strike', 'shapes':base_shapes, 'annotations':base_annotations}]),
        dict(label='Charm Exposure', method='update', 
             args=[{'visible':[False, False, False, False, False, False, False, False, True, False, False, False, False, False, False]}, 
                   {'title':'Edi - Charm Exposure por Strike', 'shapes':base_shapes, 'annotations':base_annotations}]),
        dict(label='Vanna Exposure', method='update', 
             args=[{'visible':[False, False, False, False, False, False, False, False, False, True, False, False, False, False, False]}, 
                   {'title':'Edi - Vanna Exposure por Strike', 'shapes':base_shapes, 'annotations':base_annotations, 'xaxis.range': vanna_range}]),
        dict(label='Charm Acumulado', method='update', 
             args=[{'visible':[False, False, False, False, False, False, False, False, False, False, True, False, False, False, False]}, 
                   {'title':'Edi - Charm Acumulado', 'shapes':base_shapes, 'annotations':base_annotations}]),
        dict(label='Vanna Acumulado', method='update', 
             args=[{'visible':[False, False, False, False, False, False, False, False, False, False, False, True, False, False, False]}, 
                   {'title':'Edi - Vanna Acumulado', 'shapes':base_shapes, 'annotations':base_annotations}]),
        dict(label='Vega Exposure', method='update', 
             args=[{'visible':[False, False, False, False, False, False, False, False, False, False, False, False, True, False, False]}, 
                   {'title':'Edi - Vega Exposure por Strike', 'shapes':base_shapes, 'annotations':base_annotations}]),
        dict(label='Skew IV', method='update', 
             args=[{'visible':[False, False, False, False, False, False, False, False, False, False, False, False, False, True, False]}, 
                   {'title':'Edi - Skew IV (local)', 'shapes':base_shapes, 'annotations':base_annotations}]),
        dict(label='Dealer Pressure', method='update', 
             args=[{'visible':[False, False, False, False, False, False, False, False, False, False, False, False, False, False, True]}, 
                   {'title':'Edi - Dealer Pressure (normalizado)', 'shapes':base_shapes, 'annotations':base_annotations}]),
    ]
    
    fig.update_layout(updatemenus=[dict(active=0, buttons=buttons, x=0.0, xanchor='left', y=1.1, type='buttons', direction='right')])
    
    return fig

def create_analysis_figure(calc, metrics):
    """Gera a Figura 2 (Análise Detalhada) do notebook original (CELL 10)."""
    sf = getattr(settings, 'DISPLAY_SCALE_FACTOR', 1.0)
    strikes = calc.strikes_ref * sf
    spot = float(metrics['spot']) * sf
    min_k, max_k = strikes.min(), strikes.max()
    
    regime_color = 'lime' if 'Positivo' in metrics['regime'] else 'red'
    
    gamma_flip_disp = (metrics['gamma_flip'] * sf) if metrics['gamma_flip'] else None
    
    # Scale Walls text
    _, c_walls_txt = parse_and_scale_walls(metrics['walls_call_txt'], sf)
    _, p_walls_txt = parse_and_scale_walls(metrics['walls_put_txt'], sf)
    
    info_text = (f"<b>DOLFUT (Escala Índice):</b> <span style='color:lime'>{format_number_br(spot, 0)}</span><br>"
                 f"<b>Delta Agregado:</b> {format_number_br(metrics['delta_agregado'], 0)}<br>"
                 f"<b>Gamma Flip:</b> {(format_number_br(gamma_flip_disp, 0) if gamma_flip_disp else 'N/A')}<br>"
                 f"<b>Regime:</b> <span style='color:{regime_color}'>{metrics['regime']}</span><br>"
                 f"<b>Vol Diária:</b> <span style='color:yellow'>{metrics['iv_daily']*100:.2f}%</span><br>"
                 f"<b>CALL walls:</b> {c_walls_txt}<br>"
                 f"<b>PUT walls:</b> {p_walls_txt}")

    fig = go.Figure()
    
    # 0. Delta Agregado
    dexp_tot = calc.dexp_tot
    fig.add_trace(go.Bar(x=strikes, y=dexp_tot, name='Delta Agregado', 
                         marker_color=['lime' if v>=0 else 'red' for v in dexp_tot], visible=True))
    
    # 1. Delta Acumulado
    fig.add_trace(go.Scatter(x=strikes, y=calc.dexp_cum, mode='lines', name='Delta Acumulado', 
                             visible=False, line=dict(width=3, color='yellow')))
                             
    # 2. Gamma Exposure
    fig.add_trace(go.Bar(x=strikes, y=calc.gex_tot, name='Gamma Exposure', marker_color='cyan', opacity=0.6, visible=False))
    
    # 3. Curvatura Gamma
    fig.add_trace(go.Scatter(x=strikes, y=calc.gex_cum, mode='lines', name='Curvatura do Gamma', 
                             line=dict(color='orange', width=3), visible=False))
                             
    # 4. Call OI
    fig.add_trace(go.Bar(x=strikes, y=calc.oi_call_ref, name='CALL OI', marker_color='green', visible=False))
    
    # 5. Put OI
    fig.add_trace(go.Bar(x=strikes, y=-calc.oi_put_ref, name='PUT OI', marker_color='red', visible=False))

    # 6. Midwalls Call
    fig.add_trace(go.Bar(x=calc.midwalls_strikes * sf, y=calc.midwalls_call, marker_color='#2c2c2c', opacity=0.8, 
                         visible=False, showlegend=False))

    # 7. Midwalls Put
    fig.add_trace(go.Bar(x=calc.midwalls_strikes * sf, y=-calc.midwalls_put, marker_color='#2c2c2c', opacity=0.8, 
                         visible=False, showlegend=False))

    fig.update_layout(template='plotly_dark', barmode='overlay', 
                      xaxis_title='Strike', yaxis_title='Contratos Abertos', 
                      xaxis=dict(tickmode='auto'), 
                      legend=dict(orientation='h', yanchor='top', y=-0.15, xanchor='center', x=0.5), 
                      margin=dict(t=100),
                      title=dict(text='EDI — Open Interest — Painel Delta & GEX', font=dict(color='white', size=18), x=0.5))
    fig.update_layout(separators=',.')

    spot_line = dict(type='line', x0=spot, x1=spot, y0=0, y1=1, xref='x', yref='paper', 
                     line=dict(color='lime', dash='dot', width=2))
    hline0 = dict(type='line', x0=min_k, x1=max_k, y0=0, y1=0, 
                  line=dict(color='white', dash='dot', width=1))
                  
    flip_line = None
    flip_label = None
    if metrics['gamma_flip']:
        flip_x = metrics['gamma_flip'] * sf
        flip_line = dict(type='line', x0=flip_x, x1=flip_x, y0=0, y1=1, xref='x', yref='paper', 
                         line=dict(color='red', dash='dash', width=2))
        flip_label = dict(x=flip_x, y=0.05, xref='x', yref='paper', text='Gamma Flip', showarrow=False, 
                          font=dict(color='red', size=12), bgcolor='black', bordercolor='red')

    spot_label = dict(x=float(spot), y=0.92, xref='x', yref='paper', text=f'SPOT {format_number_br(spot, 0)}', showarrow=False, 
                      font=dict(color='lime', size=12), bgcolor='black', bordercolor='lime')
    
    range_lines = [
        dict(type='line', x0=metrics['range_low'] * sf, x1=metrics['range_low'] * sf, y0=0, y1=1, xref='x', yref='paper', 
             line=dict(color='yellow', dash='dot', width=1)),
        dict(type='line', x0=metrics['range_high'] * sf, x1=metrics['range_high'] * sf, y0=0, y1=1, xref='x', yref='paper', 
             line=dict(color='yellow', dash='dot', width=1))
    ]

    # Infobox removido conforme solicitação (substituído por tabela detalhada)

    base_shapes = [spot_line, hline0] + range_lines
    if flip_line: base_shapes.append(flip_line)

    buttons = [
        dict(label='Delta Agregado', method='update', 
             args=[{'visible':[True, False, False, False, False, False, False, False]}, 
                   {'title':'USD/BRL — Delta Agregado (Painel)', 'shapes':base_shapes, 'annotations':[spot_label]}]),
        dict(label='Delta Acumulado', method='update', 
             args=[{'visible':[False, True, False, False, False, False, False, False]}, 
                   {'title':'USD/BRL — Delta Acumulado (Painel)', 'shapes':base_shapes, 'annotations':[spot_label]}]),
        dict(label='Gamma Exposure', method='update', 
             args=[{'visible':[False, False, True, True, False, False, False, False]}, 
                   {'title':'USD/BRL — Gamma Exposure (Painel)', 'shapes':base_shapes, 'annotations':[spot_label]}]),
        dict(label='Open Interest', method='update', 
             args=[{'visible':[False, False, False, False, True, True, True, True]}, 
                   {'title':'USD/BRL — Open Interest (Painel)', 'shapes':base_shapes, 'annotations':[spot_label]}]),
    ]

    fig.update_layout(updatemenus=[dict(type='dropdown', direction='down', showactive=True, active=0, x=1.0, y=1.3, buttons=buttons)])
    
    return fig

def create_summary_table(metrics):
    """Gera a tabela de resumo (fig_vals) do notebook original (CELL 10)."""
    sf = getattr(settings, 'DISPLAY_SCALE_FACTOR', 1.0)
    spot_disp = metrics['spot'] * sf
    range_low_disp = metrics['range_low'] * sf
    range_high_disp = metrics['range_high'] * sf
    gamma_flip_disp = metrics['gamma_flip'] * sf if metrics['gamma_flip'] else None

    # Scale Walls text
    _, c_walls_txt = parse_and_scale_walls(metrics['walls_call_txt'], sf)
    _, p_walls_txt = parse_and_scale_walls(metrics['walls_put_txt'], sf)

    items = ['Spot (escala índice)','Range baixo','Range alto','Gamma Flip','Regime','CALL walls top','PUT walls top']
    values = [
        format_number_br(spot_disp, 0), 
        format_number_br(range_low_disp, 0), 
        format_number_br(range_high_disp, 0), 
        (format_number_br(gamma_flip_disp, 0) if gamma_flip_disp else 'N/A'), 
        metrics['regime'], 
        c_walls_txt, 
        p_walls_txt
    ]
    descs  = [
        'Preço à vista (pontos)', 
        'Limite inferior esperado intradiário', 
        'Limite superior esperado intradiário', 
        'Zero Gamma (Gamma Flip) interpolado', 
        'Sinal do Gamma acumulado no spot', 
        'Top-3 paredes de OI em CALL', 
        'Top-3 paredes de OI em PUT'
    ]

    if getattr(settings, 'EWZ_EXPIRATION_LABEL', None):
        items.append('EWZ Expiration')
        values.append(str(settings.EWZ_EXPIRATION_LABEL))
        descs.append('Vencimento de referência do EWZ')
    if getattr(settings, 'EWZ_ATM_IV_PCT', None) is not None:
        items.append('EWZ IV ATM')
        values.append(f"{settings.EWZ_ATM_IV_PCT:.2f}%")
        descs.append('Volatilidade Implícita ATM do EWZ')
    if getattr(settings, 'EWZ_HV_PCT', None) is not None:
        items.append('EWZ HV')
        values.append(f"{settings.EWZ_HV_PCT:.2f}%")
        descs.append('Volatilidade Histórica do EWZ')
    if getattr(settings, 'EWZ_IV_RANK_PCT', None) is not None:
        items.append('EWZ IV Rank')
        values.append(f"{settings.EWZ_IV_RANK_PCT:.2f}%")
        descs.append('IV Rank do EWZ')
    
    fig = go.Figure(data=[go.Table(
        header=dict(values=['Item','Valor','Descrição'], fill_color='grey', align='left', font=dict(color='white', size=12)),
        cells=dict(values=[items, values, descs], fill_color='black', align='left', font=dict(color='white', size=12))
    )])
    
    fig.update_layout(template='plotly_dark', margin=dict(t=30, l=10, r=10, b=10), height=400)
    return fig

def create_volatility_panel(metrics):
    """Painel de Análise de Volatilidade (VRP, IV Rank, Regime)."""
    sf = getattr(settings, 'DISPLAY_SCALE_FACTOR', 1.0)
    vol = metrics.get('vol_analysis', {}) or {}
    iv = vol.get('iv_current', None)
    hv = vol.get('hv_current', None)
    vrp = vol.get('vrp', None)
    iv_rank = vol.get('iv_rank', None)
    regime = vol.get('regime', 'N/A')
    rank_desc = vol.get('rank_desc', 'N/A')
    spot_disp = metrics['spot'] * sf
    gamma_flip_disp = metrics['gamma_flip'] * sf if metrics['gamma_flip'] else None
    range_low_disp = metrics['range_low'] * sf
    range_high_disp = metrics['range_high'] * sf
    
    items = ['Spot (escala índice)', 'IV ATM (%)', 'HV (%)', 'VRP (IV/HV)', 'IV Rank (%)', 'Regime Vol', 'Range baixo', 'Range alto', 'Gamma Flip']
    values = [
        format_number_br(spot_disp, 0),
        (format_number_br(iv*100, 2) if iv is not None else 'N/A'),
        (format_number_br(hv*100, 2) if hv is not None else 'N/A'),
        (format_number_br(vrp, 2) if vrp is not None else 'N/A'),
        (format_number_br(iv_rank, 2) if iv_rank is not None else 'N/A'),
        regime,
        format_number_br(range_low_disp, 0),
        format_number_br(range_high_disp, 0),
        (format_number_br(gamma_flip_disp, 0) if gamma_flip_disp else 'N/A'),
    ]
    descs = [
        'Preço à vista (pontos)',
        'Volatilidade Implícita ATM do EWZ',
        'Volatilidade Histórica (EWZ)',
        'Volatility Risk Premium (IV/HV)',
        'Percentil de IV atual',
        'Sugestão de regime para operações de vol',
        'Limite inferior esperado intradiário',
        'Limite superior esperado intradiário',
        'Zero Gamma interpolado',
    ]
    
    fig = go.Figure(data=[go.Table(
        header=dict(values=['Métrica','Valor','Descrição'], fill_color='#374151', align='left', font=dict(color='white', size=12)),
        cells=dict(values=[items, values, descs], fill_color='black', align='left', font=dict(color='white', size=12), height=25),
        columnwidth=[180, 120, 420]
    )])
    fig.update_layout(template='plotly_dark', margin=dict(t=40, l=10, r=10, b=10), height=420)
    fig.update_layout(separators=',.')
    return fig

def create_exploded_charts(calc, metrics):
    """
    Gera uma lista de figuras individuais para cada métrica, 
    permitindo que cada uma seja impressa em uma página separada no PDF.
    """
    sf = getattr(settings, 'DISPLAY_SCALE_FACTOR', 1.0)
    strikes = calc.strikes_ref * sf
    spot = metrics['spot'] * sf
    # Valores brutos para layout comum (ele aplica a escala internamente)
    min_k_raw, max_k_raw = calc.strikes_ref.min(), calc.strikes_ref.max()
    
    # Obtém layout padronizado centralizado
    common_layout = get_common_layout(metrics, metrics['spot'], min_k_raw, max_k_raw)

    charts = []

    # 1. Delta Agregado
    fig1 = go.Figure()
    dexp_tot = calc.dexp_tot
    fig1.add_trace(go.Bar(x=strikes, y=dexp_tot, name='Delta Agregado', 
                          marker_color=['lime' if v>=0 else 'red' for v in dexp_tot]))
    fig1.update_layout(common_layout, title='Edi - Delta Agregado por Strike')
    charts.append(('Delta Agregado', fig1))

    # 2. Delta Acumulado
    fig2 = go.Figure()
    fig2.add_trace(go.Scatter(x=strikes, y=calc.dexp_cum, mode='lines', name='Delta Acumulado', 
                              line=dict(width=3, color='yellow')))
    fig2.update_layout(common_layout, title='Edi - Delta Acumulado')
    charts.append(('Delta Acumulado', fig2))

    # 3. Gamma Exposure
    fig3 = go.Figure()
    fig3.add_trace(go.Bar(x=strikes, y=calc.gex_tot, name='Gamma Exposure', marker_color='cyan', opacity=0.6))
    fig3.update_layout(common_layout, title='Edi - Gamma Exposure')
    charts.append(('Gamma Exposure', fig3))

    # 4. Curvatura Gamma
    fig4 = go.Figure()
    fig4.add_trace(go.Scatter(x=strikes, y=calc.gex_cum, mode='lines', name='Curvatura do Gamma', 
                              line=dict(color='orange', width=3)))
    fig4.update_layout(common_layout, title='Edi - Curvatura do Gamma')
    charts.append(('Curvatura do Gamma', fig4))

    # 5. Call Open Interest
    fig5 = go.Figure()
    fig5.add_trace(go.Bar(x=strikes, y=calc.oi_call_ref, name='CALL OI', marker_color='green'))
    # Sombra Midwalls Call
    fig5.add_trace(go.Bar(x=calc.midwalls_strikes * sf, y=calc.midwalls_call, marker_color='#2c2c2c', opacity=0.8, showlegend=False))
    fig5.update_layout(common_layout, title='Edi - Call Open Interest')
    charts.append(('Call OI', fig5))

    # 6. Put Open Interest
    fig6 = go.Figure()
    # Usando valor positivo para gráfico individual para facilitar leitura de magnitude
    fig6.add_trace(go.Bar(x=strikes, y=calc.oi_put_ref, name='PUT OI', marker_color='red'))
    # Sombra Midwalls Put (positivo)
    fig6.add_trace(go.Bar(x=calc.midwalls_strikes * sf, y=calc.midwalls_put, marker_color='#2c2c2c', opacity=0.8, showlegend=False))
    fig6.update_layout(common_layout, title='Edi - Put Open Interest')
    charts.append(('Put OI', fig6))

    # 7. Charm Exposure
    fig7 = go.Figure()
    fig7.add_trace(go.Bar(x=strikes, y=calc.charm_tot, name='Charm Exposure', marker_color='magenta', opacity=0.6))
    fig7.update_layout(common_layout, title='Edi - Charm Exposure (Sensibilidade ao Tempo)')
    charts.append(('Charm Exposure', fig7))

    # 8. Vanna Exposure
    # Calculate smart range for Vanna
    v_indices = np.where(np.abs(calc.vanna_tot) > np.max(np.abs(calc.vanna_tot)) * 0.01)[0]
    if len(v_indices) > 0:
        v_min_k = strikes[v_indices[0]]
        v_max_k = strikes[v_indices[-1]]
        v_pad = (v_max_k - v_min_k) * 0.1
        vanna_range = [v_min_k - v_pad, v_max_k + v_pad]
    else:
        vanna_range = [strikes[0], strikes[-1]]

    fig8 = go.Figure()
    fig8.add_trace(go.Bar(x=strikes, y=calc.vanna_tot, name='Vanna Exposure', marker_color='purple', opacity=0.6))
    layout_vanna = common_layout.copy()
    # layout_vanna['xaxis'] = dict(range=vanna_range, tickmode='auto') # Removed fixed range for auto-scale
    fig8.update_layout(layout_vanna, title='Edi - Vanna Exposure (Sensibilidade à Volatilidade)')
    charts.append(('Vanna Exposure', fig8))

    # 9. Charm Acumulado
    fig9 = go.Figure()
    fig9.add_trace(go.Scatter(x=strikes, y=calc.charm_cum, mode='lines', name='Charm Acumulado', 
                              line=dict(color='magenta', width=3)))
    fig9.update_layout(common_layout, title='Edi - Charm Acumulado')
    charts.append(('Charm Acumulado', fig9))

    # 10. Vanna Acumulado
    fig10 = go.Figure()
    fig10.add_trace(go.Scatter(x=strikes, y=calc.vanna_cum, mode='lines', name='Vanna Acumulado', 
                              line=dict(color='purple', width=3)))
    fig10.update_layout(common_layout, title='Edi - Vanna Acumulado')
    charts.append(('Vanna Acumulado', fig10))

    # 11. Vega Exposure
    fig11 = go.Figure()
    fig11.add_trace(go.Bar(x=strikes, y=calc.vex_tot, name='Vega Exposure', marker_color='gold', opacity=0.6))
    fig11.update_layout(common_layout, title='Edi - Vega Exposure')
    charts.append(('Vega Exposure', fig11))

    # 12. Skew IV
    fig12 = go.Figure()
    fig12.add_trace(go.Scatter(x=strikes, y=calc.iv_skew, mode='lines', name='Skew IV (local)', 
                               line=dict(color='white', width=2, dash='dot')))
    fig12.update_layout(common_layout, title='Edi - Skew de Volatilidade Implícita')
    charts.append(('Skew IV', fig12))

    # 13. Dealer Pressure
    fig13 = go.Figure()
    fig13.add_trace(go.Scatter(x=strikes, y=metrics['dpi_arr'], mode='lines', name='Dealer Pressure', 
                               line=dict(color='#9ca3af', width=3)))
    fig13.update_layout(common_layout, title='Edi - Dealer Pressure Index (DPI)')
    charts.append(('Dealer Pressure', fig13))

    # 14. Theta Exposure
    fig14 = go.Figure()
    fig14.add_trace(go.Bar(x=strikes, y=calc.theta_tot, name='Theta Exposure', marker_color='orange', opacity=0.6))
    fig14.update_layout(common_layout, title='Edi - Theta Exposure (Decaimento Temporal)')
    charts.append(('Theta Exposure', fig14))

    # 15. Theta Acumulado
    fig15 = go.Figure()
    fig15.add_trace(go.Scatter(x=strikes, y=calc.theta_cum, mode='lines', name='Theta Acumulado',
                               line=dict(color='orange', width=3)))
    fig15.update_layout(common_layout, title='Edi - Theta Acumulado')
    charts.append(('Theta Acumulado', fig15))

    # 16. R-Gamma (PVOP)
    fig16 = go.Figure()
    r_gamma = calc.r_gamma_exposure
    fig16.add_trace(go.Bar(x=strikes, y=r_gamma, name='R-Gamma (PVOP)',
                          marker_color=['lime' if v>=0 else 'red' for v in r_gamma]))
    fig16.update_layout(common_layout, title='Edi - R-Gamma (PVOP)')
    charts.append(('R-Gamma (PVOP)', fig16))

    # 17. R-Gamma Acumulado
    fig17 = go.Figure()
    fig17.add_trace(go.Scatter(x=strikes, y=calc.r_gamma_cum, mode='lines', name='R-Gamma Acumulado',
                               line=dict(color='cyan', width=3)))
    fig17.update_layout(common_layout, title='Edi - R-Gamma Acumulado (PVOP)')
    charts.append(('R-Gamma Acumulado', fig17))

    # 18. Strikes + Midwalls + Fibonacci
    fig18 = go.Figure()
    # OI Calls
    fig18.add_trace(go.Bar(x=strikes, y=calc.oi_call_ref, name='CALL OI', marker_color='green', opacity=0.6))
    # OI Puts (negativo para espelhar)
    fig18.add_trace(go.Bar(x=strikes, y=-calc.oi_put_ref, name='PUT OI', marker_color='red', opacity=0.6))
    # Midwalls Shadows
    fig18.add_trace(go.Bar(x=calc.midwalls_strikes * sf, y=calc.midwalls_call, marker_color='#2c2c2c', opacity=0.3, showlegend=False))
    fig18.add_trace(go.Bar(x=calc.midwalls_strikes * sf, y=-calc.midwalls_put, marker_color='#2c2c2c', opacity=0.3, showlegend=False))
    
    # Fibonacci Lines
    fib_shapes = []
    for fib_level in calc.fib_levels:
        fib_val = fib_level * sf
        fib_shapes.append(dict(type='line', x0=fib_val, x1=fib_val, y0=0, y1=1, xref='x', yref='paper',
                               line=dict(color='#374151', dash='dot', width=1)))
    
    layout_fibo = common_layout.copy()
    current_shapes_fibo = layout_fibo.get('shapes', [])
    if current_shapes_fibo is None: current_shapes_fibo = []
    if not isinstance(current_shapes_fibo, list): current_shapes_fibo = [current_shapes_fibo]
    
    # Combine shapes safely (ensure list of dicts)
    safe_current_shapes = [s for s in current_shapes_fibo if isinstance(s, dict)]
    combined_shapes_fibo = safe_current_shapes + fib_shapes
    layout_fibo['shapes'] = list(combined_shapes_fibo) # type: ignore
    
    fig18.update_layout(layout_fibo, title='Edi - Strikes + Midwalls + Fibonacci')
    charts.append(('Strikes + Midwalls + Fibo', fig18))

    # 19. Range + Walls
    fig19 = go.Figure()
    fig19.add_trace(go.Bar(x=strikes, y=calc.oi_call_ref, name='CALL OI', marker_color='green', opacity=0.4))
    fig19.add_trace(go.Bar(x=strikes, y=-calc.oi_put_ref, name='PUT OI', marker_color='red', opacity=0.4))
    
    # Range Lines & Walls
    range_shapes = [
        dict(type='line', x0=metrics['range_low'] * sf, x1=metrics['range_low'] * sf, y0=0, y1=1, xref='x', yref='paper',
             line=dict(color='yellow', dash='dash', width=2)),
        dict(type='line', x0=metrics['range_high'] * sf, x1=metrics['range_high'] * sf, y0=0, y1=1, xref='x', yref='paper',
             line=dict(color='yellow', dash='dash', width=2)),
        dict(type='line', x0=metrics['call_wall'] * sf, x1=metrics['call_wall'] * sf, y0=0, y1=1, xref='x', yref='paper',
             line=dict(color='red', dash='dot', width=2)),
        dict(type='line', x0=metrics['put_wall'] * sf, x1=metrics['put_wall'] * sf, y0=0, y1=1, xref='x', yref='paper',
             line=dict(color='green', dash='dot', width=2))
    ]
    
    layout_rw = common_layout.copy()
    current_shapes_rw = layout_rw.get('shapes', [])
    if current_shapes_rw is None: current_shapes_rw = []
    if not isinstance(current_shapes_rw, list): current_shapes_rw = [current_shapes_rw]
    
    # Combine shapes safely (ensure list of dicts)
    safe_current_shapes = [s for s in current_shapes_rw if isinstance(s, dict)]
    combined_shapes_rw = safe_current_shapes + range_shapes
    layout_rw['shapes'] = list(combined_shapes_rw) # type: ignore
    
    fig19.update_layout(layout_rw, title='Edi - Range + Walls')
    charts.append(('Range + Walls', fig19))

    # 20. Flow Sentiment
    fig20 = go.Figure()
    bull = calc.flow_sentiment.get('bull', np.zeros_like(strikes))
    bear = calc.flow_sentiment.get('bear', np.zeros_like(strikes))
    fig20.add_trace(go.Bar(x=strikes, y=bull, name='Bullish Volume', marker_color='lime'))
    fig20.add_trace(go.Bar(x=strikes, y=bear, name='Bearish Volume', marker_color='red'))
    fig20.update_layout(common_layout, title='Edi - Flow Sentiment (Bull vs Bear)')
    charts.append(('Flow Sentiment', fig20))

    # 21. Delta Flip Profile
    fig21 = go.Figure()
    spots_sim = [s * sf for s in calc.delta_flip_profile.get('spots', [])]
    deltas_sim = calc.delta_flip_profile.get('deltas', [])
    flip_val = calc.delta_flip_profile.get('flip_value', None)
    
    if len(spots_sim) > 0:
        fig21.add_trace(go.Scatter(x=spots_sim, y=deltas_sim, mode='lines', name='Delta Profile', 
                                   line=dict(color='white')))
        if flip_val:
            flip_val_scaled = flip_val * sf
            fig21.add_vline(x=flip_val_scaled, line_dash='dash', line_color='yellow', annotation_text='Flip')
        fig21.add_vline(x=spot, line_dash='dot', line_color='lime', annotation_text='Spot')
        
        layout_dp = common_layout.copy()
        layout_dp['xaxis'] = dict(title='Spot Price') # Override xaxis title
        fig21.update_layout(layout_dp, title='Edi - Delta Flip Profile')
        charts.append(('Delta Flip Profile', fig21))

    # 22. Gamma Flip Analysis
    fig22 = go.Figure()
    # Traces from legacy fig4
    fig22.add_trace(go.Bar(x=strikes, y=calc.gex_flip_base, name='Gamma Exposure (assinado)', marker_color='cyan', opacity=0.6))
    fig22.add_trace(go.Scatter(x=strikes, y=calc.gex_cum_signed, mode='lines', name='Acumulado (assinado)', line=dict(color='orange', width=3)))
    
    # Flip Variations Lines
    flips = calc.flip_variations
    colors = {'Classic': 'red', 'Spline': 'tomato', 'HVL': 'fuchsia', 'HVL Log': 'deeppink', 'Sigma Kernel': 'orange', 'PVOP': 'green'}
    
    # Adjust annotations y-position to avoid overlap
    y_positions = np.linspace(0.05, 0.3, len(flips))
    i = 0
    for name, val in flips.items():
        if val:
            val_scaled = val * sf
            color = colors.get(name, 'white')
            fig22.add_vline(x=val_scaled, line_dash='dash', line_color=color, 
                            annotation_text=f'{name}: {val_scaled:.0f}', 
                            annotation_position="top left",
                            annotation=dict(font_color=color, y=y_positions[i]))
            i += 1

    fig22.update_layout(common_layout, title='Edi - Gamma Flip Analysis (Multi-Model)')
    charts.append(('Gamma Flip Analysis', fig22))

    # 23. Gamma Flip Cone
    if hasattr(calc, 'gamma_flip_cone') and calc.gamma_flip_cone:
        fig23 = go.Figure()
        alphas = calc.gamma_flip_cone.get('alphas', [])
        flips_cone = calc.gamma_flip_cone.get('flips', [])
        
        if len(alphas) > 0:
            fig23.add_trace(go.Scatter(x=alphas, y=flips_cone, mode='lines+markers', name='Flip vs σ (sensibilidade)', 
                                       line=dict(color='#34d399', width=3)))
            
            layout_cone = common_layout.copy()
            layout_cone['xaxis_title'] = 'Fator σ (SIGMA_FACTOR)'
            layout_cone['yaxis_title'] = 'Gamma Flip (Strike)'
            if 'xaxis' in layout_cone: del layout_cone['xaxis'] # Auto range para X
            
            fig23.update_layout(layout_cone, title='Edi - Gamma Flip Cone')
            charts.append(('Gamma Flip Cone', fig23))

    # 24. Max Pain Curve
    if hasattr(calc, 'max_pain_profile') and calc.max_pain_profile:
        fig24 = go.Figure()
        loss = calc.max_pain_profile['loss']
        strikes_mp = calc.max_pain_profile['strikes'] * sf
        
        # Normalize for better visualization
        loss_norm = (loss - np.min(loss)) / (np.max(loss) - np.min(loss))
        
        fig24.add_trace(go.Bar(x=strikes_mp, y=loss_norm, name='Pain (Loss)', marker_color='purple', opacity=0.7))
        
        # Highlight Max Pain Strike
        mp_strike = calc.max_pain
        if mp_strike:
            mp_strike_scaled = mp_strike * sf
            fig24.add_vline(x=mp_strike_scaled, line_dash='dash', line_color='lime', annotation_text=f'Max Pain: {mp_strike_scaled:.0f}')
            
        fig24.update_layout(common_layout, title='Edi - Max Pain Curve (Painel de Dor)')
        charts.append(('Max Pain Curve', fig24))

    # 25. Market Maker PnL Simulation
    if hasattr(calc, 'mm_pnl_simulation') and calc.mm_pnl_simulation:
        fig25 = go.Figure()
        s_sim = calc.mm_pnl_simulation['spots'] * sf
        pnl = calc.mm_pnl_simulation['pnl']
        
        # Color based on PnL
        color = ['lime' if v >= 0 else 'red' for v in pnl]
        
        fig25.add_trace(go.Bar(x=s_sim, y=pnl, name='MM PnL Estimado', marker_color=color))
        fig25.add_vline(x=spot, line_dash='dot', line_color='white', annotation_text='Spot Atual')
        
        layout_mm = common_layout.copy()
        layout_mm['xaxis'] = dict(title='Spot Price')
        layout_mm['yaxis_title'] = 'PnL Estimado'
        
        fig25.update_layout(layout_mm, title='Edi - Market Maker Profit Simulation')
        charts.append(('MM Profit Sim', fig25))

    # 26. Expected Move Cone
    if hasattr(calc, 'expected_moves') and calc.expected_moves:
        fig26 = go.Figure()
        moves = calc.expected_moves
        
        times = [m['label'] for m in moves]
        # 1 Sigma
        upper = [m['upper'] * sf for m in moves]
        lower = [m['lower'] * sf for m in moves]
        
        # 2 Sigma (Aprox)
        move_val = [m['move'] * sf for m in moves]
        upper2 = [u + m for u, m in zip(upper, move_val)]
        lower2 = [l - m for l, m in zip(lower, move_val)]
        
        fig26.add_trace(go.Scatter(x=times, y=upper, mode='lines+markers', name='+1 Sigma', line=dict(color='yellow')))
        fig26.add_trace(go.Scatter(x=times, y=lower, mode='lines+markers', name='-1 Sigma', line=dict(color='yellow'), fill='tonexty'))
        
        fig26.add_trace(go.Scatter(x=times, y=upper2, mode='lines+markers', name='+2 Sigma', line=dict(color='orange', dash='dash')))
        fig26.add_trace(go.Scatter(x=times, y=lower2, mode='lines+markers', name='-2 Sigma', line=dict(color='orange', dash='dash')))
        
        # Spot Line
        fig26.add_hline(y=spot, line_dash='dot', line_color='white', annotation_text='Spot')
        
        layout_em = common_layout.copy()
        if 'xaxis' in layout_em: del layout_em['xaxis'] # Usa categorico
        layout_em['title'] = 'Edi - Expected Move Cone'
        fig26.update_layout(layout_em)
        charts.append(('Expected Move Cone', fig26))

    # 27. Volatility & Pinning Dashboard
    if hasattr(calc, 'vol_analysis') and calc.vol_analysis:
        from plotly.subplots import make_subplots
        
        fig27 = make_subplots(
            rows=2, cols=2,
            specs=[[{'type': 'indicator'}, {'type': 'indicator'}],
                   [{'colspan': 2, 'type': 'indicator'}, None]],
            vertical_spacing=0.15
        )
        
        va = calc.vol_analysis
        
        # IV Rank Gauge
        fig27.add_trace(go.Indicator(
            mode="gauge+number",
            value=va['iv_rank'],
            title={'text': "IV Rank (%)"},
            gauge={'axis': {'range': [0, 100]},
                   'bar': {'color': "cyan"},
                   'steps': [
                       {'range': [0, 20], 'color': "green"},
                       {'range': [20, 50], 'color': "yellow"},
                       {'range': [50, 80], 'color': "orange"},
                       {'range': [80, 100], 'color': "red"}],
                   'threshold': {'line': {'color': "white", 'width': 4}, 'thickness': 0.75, 'value': va['iv_rank']}}
        ), row=1, col=1)
        
        # VRP Gauge (IV/HV)
        vrp_val = va['vrp']
        fig27.add_trace(go.Indicator(
            mode="number+delta",
            value=vrp_val,
            title={'text': f"VRP (IV/HV)<br><span style='font-size:0.6em'>{va['regime']}</span>"},
            delta={'reference': 1.0, 'relative': False, 'valueformat': '.2f'},
            number={'valueformat': '.2f'}
        ), row=1, col=2)
        
        # Pinning Risk Indicator
        pr = getattr(calc, 'pinning_risk', None)
        if pr and pr.get('is_active'):
            strike = pr['strike']
            # Aplica fator de escala se necessário para exibição
            try:
                sf = getattr(settings, 'DISPLAY_SCALE_FACTOR', 1.0)
            except:
                sf = 1.0
            
            fig27.add_trace(go.Indicator(
                mode="number",
                value=strike * sf,
                title={'text': "⚠️ 0DTE PINNING RISK ⚠️<br><span style='font-size:0.6em'>Target Strike (Magnet)</span>"},
                number={'prefix': "Pts ", 'valueformat': ",.0f", 'font': {'color': 'yellow'}}
            ), row=2, col=1)
        else:
             fig27.add_trace(go.Indicator(
                mode="number",
                value=0,
                title={'text': "Pinning Risk"},
                number={'suffix': " Inativo", 'font': {'size': 20}}
            ), row=2, col=1)

        fig27.update_layout(template='plotly_dark', title='Edi - Volatility & Risk Analysis')
        charts.append(('Vol & Risk Analysis', fig27))

    return charts
