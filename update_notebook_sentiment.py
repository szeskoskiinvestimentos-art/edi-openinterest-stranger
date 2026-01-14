import json

nb_path = r'c:\Users\ednil\Downloads\Gamma\Edi_OpenInterest\USDBRL_AnaliseDeOpcoes - Rev4.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# 1. Inject Data Prep for 'Change' column
prep_code = """    for col in ['Strike','Last','Volume','Open Int','Premium', 'Change']:
        if col in df.columns:
            df[col] = _num(df[col])"""

# Find Cell 3 and update read_options_table
for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        src = "".join(cell['source'])
        if "read_options_table" in src and "df['Strike'] = _num(df['Strike'])" not in src:
            # We look for the loop over cols
            old_loop = "    for col in ['Strike','Last','Volume','Open Int','Premium']:"
            new_loop = "    for col in ['Strike','Last','Volume','Open Int','Premium','Change']:"
            if old_loop in src:
                cell['source'] = [l.replace(old_loop, new_loop) for l in cell['source']]
                print("Updated read_options_table to parse Change column.")

# 2. Inject Plot Function
plot_func_code = """
def _plot_flow_sentiment():
    # Calcular Fluxo Altista vs Baixista
    bull_vols = []
    bear_vols = []
    
    # Garantir que Change existe
    if 'Change' not in options.columns:
        return go.Figure()

    for k in strikes_ref:
        # Filtrar Calls e Puts para este strike
        df_k = options[options['StrikeK'] == k]
        
        v_bull = 0.0
        v_bear = 0.0
        
        for _, row in df_k.iterrows():
            tipo = str(row['OptionType']).upper()
            chg = float(row['Change']) if pd.notnull(row['Change']) else 0.0
            vol = float(row['Volume']) if pd.notnull(row['Volume']) else 0.0
            
            if vol > 0:
                if tipo == 'CALL':
                    if chg > 0: v_bull += vol   # Call valorizando -> Bull
                    elif chg < 0: v_bear += vol # Call desvalorizando -> Bear
                elif tipo == 'PUT':
                    if chg > 0: v_bear += vol   # Put valorizando -> Bear
                    elif chg < 0: v_bull += vol # Put desvalorizando -> Bull
        
        bull_vols.append(v_bull)
        bear_vols.append(-v_bear) # Negativo para plotar para baixo

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
        title=dict(text='EDI — Sentimento do Fluxo (Volume x Variação)', font=dict(color='white', size=20), x=0.5),
        xaxis=dict(title='Strike', tickfont=dict(color='white'), gridcolor='#333'),
        yaxis=dict(title='Volume Estimado', tickfont=dict(color='white'), gridcolor='#333'),
        paper_bgcolor='black',
        plot_bgcolor='black',
        barmode='relative', # Empilhado relativo (pos/neg)
        legend=dict(font=dict(color='white'), orientation='h', y=1.02, x=0.5, xanchor='center'),
        shapes=[spot_line, hline0] + range_lines
    )
    
    # Add Walls/Flips
    if 'flip_line' in globals() and flip_line: fig.add_shape(flip_line)
    
    return fig
"""

# Find where to inject the function (before modes definition)
# Usually before "modes = ["
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code':
        src = "".join(cell['source'])
        if "modes = [" in src:
            # Inject function before this cell
            new_cell = {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": plot_func_code.strip().splitlines(keepends=True)
            }
            nb['cells'].insert(i, new_cell)
            print("Injected _plot_flow_sentiment function.")
            break

# 3. Add to modes list
# We need to modify the cell containing "modes = ["
for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        src = "".join(cell['source'])
        if "modes = [" in src and "_plot_flow_sentiment" not in src:
            # Find the end of the list to append
            # Assuming simple list structure
            if "]" in src:
                new_entry = "    {'name':'Flow_Sentiment', 'func':_plot_flow_sentiment, 'file':'Flow_Sentiment.html'},\n"
                # Insert before the last closing bracket
                # Using string replace is risky if ] is not at end.
                # Let's search for the last element comma
                last_comma_idx = src.rfind("},")
                if last_comma_idx != -1:
                    new_src = src[:last_comma_idx+2] + "\n" + new_entry + src[last_comma_idx+2:]
                    cell['source'] = new_src.splitlines(keepends=True)
                    print("Added Flow_Sentiment to modes list.")
                else:
                     # Maybe list end
                     last_bracket = src.rfind("]")
                     if last_bracket != -1:
                        new_src = src[:last_bracket] + ",\n" + new_entry + src[last_bracket:]
                        cell['source'] = new_src.splitlines(keepends=True)
                        print("Added Flow_Sentiment to modes list (append).")

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)

print("Notebook updated.")
