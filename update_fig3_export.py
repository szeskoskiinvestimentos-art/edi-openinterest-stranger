import json
import os

nb_path = r'c:\Users\ednil\Downloads\Gamma\Edi_OpenInterest\USDBRL_AnaliseDeOpcoes - Rev4.ipynb'

new_code_source = [
    "# --- EXTRAÇÃO FIGURA 3 PARA HTML INDIVIDUAL (TODOS OS 15 MODOS) ---\n",
    "print('Gerando TODOS os painéis individuais da Figura 3 (15 modos)...')\n",
    "if 'fig3' in globals() and 'save_panel' in globals():\n",
    "    # Mapear traces da fig3 original para reutilizar\n",
    "    f3_data = fig3.data\n",
    "    \n",
    "    # Shapes comuns\n",
    "    common_shapes = [spot_line, hline0]\n",
    "    if 'range_lines' in globals(): common_shapes += range_lines\n",
    "    if 'flip_line' in globals() and flip_line: common_shapes.append(flip_line)\n",
    "    \n",
    "    # Annotations comuns\n",
    "    common_annos = [spot_label]\n",
    "    if 'range_low_label' in globals(): common_annos.append(range_low_label)\n",
    "    if 'range_high_label' in globals(): common_annos.append(range_high_label)\n",
    "    if 'flip_label' in globals() and flip_label: common_annos.append(flip_label)\n",
    "    \n",
    "    # Trace invisível para definir range do eixo X em gráficos de overlay\n",
    "    dummy_trace = go.Scatter(x=strikes_ref, y=np.zeros_like(strikes_ref), mode='markers', marker=dict(opacity=0), showlegend=False, hoverinfo='skip')\n",
    "\n",
    "    # 1. Modos baseados em Dados (Traces)\n",
    "    modes = {\n",
    "        'Delta_Agregado.html': {'idxs': [0], 'title': 'Delta Agregado', 'desc': 'Soma do Delta de todas as opções por strike.'},\n",
    "        'Delta_Acumulado.html': {'idxs': [1], 'title': 'Delta Acumulado', 'desc': 'Acúmulo líquido do Delta ao longo dos strikes.'},\n",
    "        'GEX.html': {'idxs': [2, 3], 'title': 'Gamma Exposure (GEX)', 'desc': 'Exposição de Gamma total e sua curvatura acumulada.'},\n",
    "        'GEX_OI.html': {'idxs': [10, 13], 'title': 'Gamma Exposure (OI)', 'desc': 'GEX calculado isolando apenas a variável Open Interest.'},\n",
    "        'GEX_IV.html': {'idxs': [11, 14], 'title': 'Gamma Exposure (IV)', 'desc': 'GEX calculado isolando apenas a variável Volatilidade Implícita.'},\n",
    "        'R_Gamma_PVOP.html': {'idxs': [12], 'title': 'R Gamma (PVOP)', 'desc': 'Gamma ponderado pelo volume de Puts (Put Volume Over Price).'},\n",
    "        'OI_Strike.html': {'idxs': [4, 5, 6, 7], 'title': 'Open Interest por Strike', 'desc': 'Contratos em aberto (Calls vs Puts) e Midwalls.'},\n",
    "        'Charm_Exposure.html': {'idxs': [8], 'title': 'Charm Exposure', 'desc': 'Sensibilidade do Delta à passagem do tempo (Decaimento).'},\n",
    "        'Vanna_Exposure.html': {'idxs': [9], 'title': 'Vanna Exposure', 'desc': 'Sensibilidade do Delta a mudanças na Volatilidade Implícita.'},\n",
    "        'Visao_Completa.html': {'idxs': [0, 2, 4, 5], 'title': 'Visão Completa', 'desc': 'Visão geral combinando Delta, Gamma e OI.'}\n",
    "    }\n",
    "\n",
    "    for fname, cfg in modes.items():\n",
    "        try:\n",
    "            traces = []\n",
    "            for i in cfg['idxs']:\n",
    "                if i < len(f3_data):\n",
    "                    t = f3_data[i]\n",
    "                    t.visible = True\n",
    "                    traces.append(t)\n",
    "            \n",
    "            if traces:\n",
    "                fig_sub = go.Figure(data=traces)\n",
    "                fig_sub.update_layout(\n",
    "                    template='plotly_dark', \n",
    "                    title=dict(text=f\"EDI - {cfg['title']}\", font=dict(color='white', size=18), x=0.5),\n",
    "                    xaxis_title='Strike', \n",
    "                    yaxis_title='Valor',\n",
    "                    shapes=common_shapes,\n",
    "                    annotations=common_annos,\n",
    "                    barmode='overlay',\n",
    "                    margin=dict(t=80)\n",
    "                )\n",
    "                # Adicionar Walls extras apenas para OI e Visão Completa\n",
    "                if 'OI' in cfg['title'] or 'Completa' in cfg['title']:\n",
    "                    if 'wall_lines' in globals(): \n",
    "                        for w in wall_lines: fig_sub.add_shape(w)\n",
    "                \n",
    "                save_panel(fig_sub, fname, cfg['title'], help_blocks={'desc': cfg['desc']})\n",
    "                print(f'Gerado: {fname}')\n",
    "        except Exception as e: print(f'Erro ao gerar {fname}: {e}')\n",
    "\n",
    "    # 2. Modos de Overlay (Shapes Específicos)\n",
    "    overlays = [\n",
    "        ('Overlay_Fibo.html', 'Strikes + Midwalls + Fibonacci', \n",
    "         shapes_strike_mid_fibo if 'shapes_strike_mid_fibo' in globals() else common_shapes,\n",
    "         annos_strike_mid_fibo if 'annos_strike_mid_fibo' in globals() else common_annos),\n",
    "         \n",
    "        ('Overlay_Range_Walls.html', 'Range + Walls',\n",
    "         [spot_line, hline0] + (range_lines if 'range_lines' in globals() else []) + (wall_lines if 'wall_lines' in globals() else []),\n",
    "         common_annos),\n",
    "         \n",
    "        ('Overlay_Range.html', 'Range apenas',\n",
    "         [spot_line, hline0] + (range_lines if 'range_lines' in globals() else []),\n",
    "         common_annos),\n",
    "         \n",
    "        ('Overlay_Walls.html', 'Walls apenas',\n",
    "         [spot_line, hline0] + (wall_lines if 'wall_lines' in globals() else []),\n",
    "         common_annos),\n",
    "         \n",
    "        ('Overlay_Clean.html', 'Limpar overlays',\n",
    "         [spot_line, hline0],\n",
    "         [spot_label])\n",
    "    ]\n",
    "\n",
    "    for fname, title, shps, anns in overlays:\n",
    "        try:\n",
    "            fig_ov = go.Figure(data=[dummy_trace])\n",
    "            fig_ov.update_layout(\n",
    "                template='plotly_dark', \n",
    "                title=title,\n",
    "                xaxis_title='Strike', \n",
    "                yaxis_title='-',\n",
    "                shapes=shps,\n",
    "                annotations=anns,\n",
    "                margin=dict(t=80)\n",
    "            )\n",
    "            save_panel(fig_ov, fname, title, {'Ajuda': ['Visualização focada em níveis de suporte e resistência.']})\n",
    "            print(f'Gerado: {fname}')\n",
    "        except Exception as e: print(f'Erro ao gerar {fname}: {e}')\n"
]

with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

found = False
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code':
        source_str = "".join(cell['source'])
        if "print('Gerando TODOS os painéis individuais da Figura 3...')" in source_str:
            print(f"Found target cell at index {i}")
            nb['cells'][i]['source'] = new_code_source
            found = True
            break

if found:
    with open(nb_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
    print("Notebook updated successfully.")
else:
    print("Target cell not found.")
