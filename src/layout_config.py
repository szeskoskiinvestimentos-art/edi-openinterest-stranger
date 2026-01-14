import plotly.graph_objects as go

def get_common_layout(metrics, spot, min_k, max_k):
    """
    Retorna um dicionário com o layout padrão do Plotly e elementos gráficos (shapes, annotations)
    padronizados para todos os gráficos do relatório.
    """
    regime_color = 'lime' if 'Positivo' in metrics['regime'] else 'red'
    
    # Texto do InfoBox
    info_text = (f"<b>USD/BRL Spot:</b> <span style='color:lime'>{spot:.0f}</span><br>"
                 f"<b>Delta Agregado:</b> {metrics['delta_agregado']:,.0f}<br>"
                 f"<b>Zero Gamma (Flip):</b> {(f'{metrics['zero_gamma_level']:.0f}' if metrics['zero_gamma_level'] else 'N/A')}<br>"
                 f"<b>Max Pain:</b> <span style='color:orange'>{metrics['max_pain']:.0f}</span><br>"
                 f"<b>Call Wall (Resist.):</b> <span style='color:red'>{metrics['call_wall']:.0f}</span><br>"
                 f"<b>Put Wall (Sup.):</b> <span style='color:green'>{metrics['put_wall']:.0f}</span><br>"
                 f"<b>Regime:</b> <span style='color:{regime_color}'>{metrics['regime']}</span><br>"
                 f"<b>Dealer Pressure:</b> {metrics['dealer_pressure']:+.2f}<br>")

    # Shapes
    spot_line = dict(type='line', x0=spot, x1=spot, y0=0, y1=1, xref='x', yref='paper', 
                     line=dict(color='lime', dash='dot', width=2))
    hline0 = dict(type='line', x0=min_k, x1=max_k, y0=0, y1=0, 
                  line=dict(color='white', dash='dot', width=1))
    
    flip_line = None
    flip_label = None
    if metrics['gamma_flip']:
        flip_line = dict(type='line', x0=metrics['gamma_flip'], x1=metrics['gamma_flip'], y0=0, y1=1, xref='x', yref='paper', 
                         line=dict(color='red', dash='dash', width=2))
        flip_label = dict(x=metrics['gamma_flip'], y=0.05, xref='x', yref='paper', text='Gamma Flip', showarrow=False, 
                          font=dict(color='red', size=12), bgcolor='black', bordercolor='red')
    
    spot_label = dict(x=float(spot), y=0.92, xref='x', yref='paper', text=f'SPOT {spot:.0f}', showarrow=False, 
                      font=dict(color='lime', size=12), bgcolor='black', bordercolor='lime')
    
    # Infobox removido conforme solicitação (movido para tabelas dedicadas)
    
    base_shapes = [spot_line, hline0]
    if flip_line: base_shapes.append(flip_line)
    
    base_annotations = [spot_label]
    if flip_label: base_annotations.append(flip_label)

    layout = dict(
        template='plotly_dark', 
        barmode='overlay', 
        xaxis_title='Strike', 
        yaxis_title='Exposição / OI', 
        xaxis=dict(range=[spot-300, spot+300], tickmode='auto'), 
        legend=dict(orientation='h', yanchor='top', y=-0.15, xanchor='center', x=0.5), 
        margin=dict(t=80, l=50, r=50, b=50),
        shapes=base_shapes,
        annotations=base_annotations
    )
    
    return layout
