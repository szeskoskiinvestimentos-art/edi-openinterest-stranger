import re

headless_path = 'c:/Users/ednil/Downloads/Gamma/Edi_OpenInterest/run_notebook_headless.py'

new_extension_code = r"""
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
"""

with open(headless_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Substituir bloco antigo
pattern = re.compile(r'# --- EDI EXTENSION START ---.*?# --- EDI EXTENSION END ---', re.DOTALL)
if pattern.search(content):
    print("Substituindo extensão antiga no script headless...")
    new_content = pattern.sub(new_extension_code.strip(), content)
    with open(headless_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Script headless atualizado.")
else:
    print("Extensão antiga não encontrada no headless. Anexando ao final...")
    with open(headless_path, 'a', encoding='utf-8') as f:
        f.write('\n' + new_extension_code)
    print("Script headless atualizado (anexado).")
