import numpy as np
from datetime import datetime
from src import config as settings

def generate_ntsl_script(metrics, calc):
    """
    Gera o script NTSL (Nelogica Trading System Language) para importação no ProfitChart.
    Inclui seletor de modelos de Gamma Flip e Delta Flip.
    Implementa lógica de intercalação de texto para legibilidade.
    """
    # Recupera fator de escala
    sf = getattr(settings, 'DISPLAY_SCALE_FACTOR', 1.0)

    spot = metrics['spot'] * sf
    call_wall = metrics['call_wall'] * sf if metrics['call_wall'] else 0
    put_wall = metrics['put_wall'] * sf if metrics['put_wall'] else 0
    
    # Effective Walls (com fallback para Wall comum se não existir)
    eff_call = metrics.get('effective_call_wall')
    effective_call_wall = eff_call * sf if eff_call else call_wall
    
    eff_put = metrics.get('effective_put_wall')
    effective_put_wall = eff_put * sf if eff_put else put_wall
    
    range_high = metrics['range_high'] * sf if metrics['range_high'] else 0
    range_low = metrics['range_low'] * sf if metrics['range_low'] else 0
    max_pain = metrics.get('max_pain', 0) * sf if metrics.get('max_pain') else 0
    
    # Mapeamento de Flips disponíveis
    flips = calc.flip_variations
    # Garante ordem consistente
    flip_keys = ['Classic', 'Spline', 'HVL', 'HVL Log', 'Sigma Kernel', 'PVOP', 'HVL Gaussian']
    # Aplica scale factor nos flips
    available_flips = []
    for k in flip_keys:
        if k in flips and flips[k] is not None:
            available_flips.append((k, flips[k] * sf))
    
    # Delta Flip
    delta_flip = spot
    if calc.delta_flip_profile and calc.delta_flip_profile.get('flip_value'):
        delta_flip = calc.delta_flip_profile['flip_value'] * sf

    borboleta_levels = None
    try:
        taxa_selic = float(settings.TAXA_SELIC)
        dy = float(getattr(settings, "DIVIDEND_YIELD_BR", 2.61))
        if taxa_selic > 0:
            i = (taxa_selic - dy) / 100.0
            P = float(spot)
            res1 = P * (1.0 + (i / 250.0))
            res2 = P * (1.0 + (i / 52.0))
            res3 = P * (1.0 + (i / 17.0))
            res4 = P * (1.0 + (i / 4.0))
            sup1 = P / (1.0 + (i / 250.0))
            sup2 = P / (1.0 + (i / 52.0))
            sup3 = P / (1.0 + (i / 17.0))
            sup4 = P / (1.0 + (i / 4.0))
            borboleta_levels = {
                "res1": res1,
                "res2": res2,
                "res3": res3,
                "res4": res4,
                "sup1": sup1,
                "sup2": sup2,
                "sup3": sup3,
                "sup4": sup4,
            }
    except Exception:
        borboleta_levels = None

    # Recuperando Strikes para Grid
    strikes = np.sort(calc.strikes_ref) * sf
    
    # Expected Moves (1 Dia / Intraday)
    moves = metrics.get('expected_moves', [])
    em_entries = []
    for m in moves:
        lbl = str(m.get('label', ''))
        upper = float(m.get('upper', 0.0)) * sf
        lower = float(m.get('lower', 0.0)) * sf
        if upper > 0 and lower > 0:
            em_entries.append({'label': lbl, 'upper': upper, 'lower': lower})

    # --- Lógica de Intercalação de Texto (Anti-Colisão) ---
    # Coleta todas as linhas principais para ordenar e ajustar posição
    # Estrutura: {'price': float, 'text': str, 'color': str, 'style': str, 'width': int, 'cond': str, 'align': str}
    
    main_lines = []
    
    # 1. Walls (Grid Completo - Legacy Mode restored)
    # Recupera referências de OI do calculator
    oi_call_arr = getattr(calc, 'oi_call_ref', [])
    oi_put_arr = getattr(calc, 'oi_put_ref', [])
    
    # Se não existirem arrays de referência, tenta usar os dados brutos se disponíveis
    if len(oi_call_arr) == 0 and len(strikes) > 0:
        # Fallback simples (não ideal, mas evita erro)
        oi_call_arr = np.zeros_like(strikes)
        oi_put_arr = np.zeros_like(strikes)

    # Itera sobre todos os strikes para gerar as linhas de CallWall e PutWall
    for i, strike in enumerate(strikes):
        price = float(strike)
        has_call = oi_call_arr[i] > 0 if i < len(oi_call_arr) else False
        has_put = oi_put_arr[i] > 0 if i < len(oi_put_arr) else False
        
        if has_call:
            main_lines.append({
                'price': price, 'text': "CallWall", 'color': 'clCallWall', 
                'style': 'psDash', 'width': 1, 'cond': 'ExibirWalls', 'align': 'tpTopLeft',
                'date_param': '0' # Contínuo
            })
            
        if has_put:
            # Se houver overlap, o sistema de anti-colisão ajustará o alinhamento
            main_lines.append({
                'price': price, 'text': "PutWall", 'color': 'clPutWall', 
                'style': 'psDash', 'width': 1, 'cond': 'ExibirWalls', 'align': 'tpTopLeft',
                'date_param': '0' # Contínuo
            })
        
    # Effective Walls (Centroid Walls)
    if effective_call_wall and effective_call_wall > 0:
         main_lines.append({
            'price': effective_call_wall, 'text': "Edi Effective Call", 'color': 'clEffectiveWall', 
            'style': 'psDashDot', 'width': 2, 'cond': 'ExibirEffectiveWalls', 'align': 'tpTopLeft',
            'date_param': '0'
        })
        
    if effective_put_wall and effective_put_wall > 0:
         main_lines.append({
            'price': effective_put_wall, 'text': "Edi Effective Put", 'color': 'clEffectiveWall', 
            'style': 'psDashDot', 'width': 2, 'cond': 'ExibirEffectiveWalls', 'align': 'tpTopLeft',
            'date_param': '0'
        })

    # 2. Max Pain (Renomeado para Edi_MaxPain)
    if max_pain > 0:
        main_lines.append({
            'price': max_pain, 'text': "Edi_MaxPain", 'color': 'clMaxPain', 
            'style': 'psSolid', 'width': 2, 'cond': 'ExibirMaxPain', 'align': 'tpTopRight',
            'date_param': 'CurrentDate' # Apenas hoje
        })
        
    # 3. Ranges (Range diário oficial - Edi_Range_1D)
    if range_high:
        main_lines.append({
            'price': range_high, 'text': "Edi_Range_1D", 'color': 'clRangeHigh', 
            'style': 'psDot', 'width': 1, 'cond': 'ExibirRange', 'align': 'tpTopRight',
            'date_param': '0' # Contínuo (Maxima/Minima Diaria)
        })
    if range_low:
        main_lines.append({
            'price': range_low, 'text': "Edi_Range_1D", 'color': 'clRangeLow', 
            'style': 'psDot', 'width': 1, 'cond': 'ExibirRange', 'align': 'tpTopRight',
            'date_param': '0' # Contínuo (Maxima/Minima Diaria)
        })

    # 4. Expected Moves (Edi_EM_<Periodo>)
    for em in em_entries:
        lbl = em['label']
        # Evita redundância: não desenha EM de 1 Dia/Intraday, já representado por Edi_Range_1D
        if ('Intraday' in lbl) or ('1 Dia' in lbl):
            continue
        date_param = '0' if 'Semana' in lbl or 'Exp' in lbl else '0'
        text_id = "Edi_EM_1W" if 'Semana' in lbl else "Edi_EM_Exp"
        main_lines.append({
            'price': em['upper'], 'text': text_id, 'color': 'clExpMove',
            'style': 'psDot', 'width': 1, 'cond': 'ExibirExpMoves', 'align': 'tpTopRight',
            'date_param': date_param
        })
        main_lines.append({
            'price': em['lower'], 'text': text_id, 'color': 'clExpMove',
            'style': 'psDot', 'width': 1, 'cond': 'ExibirExpMoves', 'align': 'tpTopRight',
            'date_param': date_param
        })

    # Ordena por preço para detectar proximidade
    main_lines.sort(key=lambda x: x['price'])
    
    # Ajusta alinhamento se estiverem muito perto
    # Threshold de proximidade: 0.2% do valor do spot (ex: 10 pts no SPX 5000, 10 pts no WIN 120k é pouco, mas ok)
    threshold = spot * 0.002
    
    for i in range(1, len(main_lines)):
        prev = main_lines[i-1]
        curr = main_lines[i]
        
        if (curr['price'] - prev['price']) < threshold:
            # Se colidir, inverte o alinhamento do atual em relação ao anterior
            if prev['align'] == 'tpTopRight':
                curr['align'] = 'tpBottomRight'
            else:
                curr['align'] = 'tpTopRight'

    # Montagem do bloco de seleção de flips
    flip_comments = []
    flip_logic = []
    
    for idx, (name, val) in enumerate(available_flips, 1):
        flip_comments.append(f"  // {idx} = {name} ({val:.2f})")
        flip_logic.append(f"  if (ModeloFlip = {idx}) then GammaVal := {val:.2f};")

    # Formatação do script
    current_date = datetime.now().strftime("%d/%m/%Y %H:%M")
    script = [
        f"// NTSL Indicator - Edi OpenInterest Levels - {current_date}",
        "// Gerado Automaticamente",
        "",
        "const",
        "  clCallWall = clBlue;",
        "  clPutWall = clRed;",
        "  clGammaFlip = clFuchsia;",
        "  clDeltaFlip = clYellow;",
        "  clRangeHigh = clLime;",
        "  clRangeLow = clRed;",
        "  clMaxPain = clPurple;",
        "  clExpMove = clWhite;",
        "  clEdiWall = clSilver;",
        "  clEffectiveWall = clAqua;",
        "  clFib = clYellow;",
        "  TamanhoFonte = 8;",
        "",
        "input",
        "  ExibirWalls(true);",
        "  ExibirFlips(true);",
        "  ExibirRange(true);",
        "  ExibirMaxPain(true);",
        "  ExibirExpMoves(true);",
        "  ExibirEdiWall(false);",
        "  ExibirEffectiveWalls(true);",
        "  MostrarPLUS(false);",
        "  MostrarPLUS2(false);",
        "  ExibirMelhoresPontos(true);",
        "  ModeloFlip(7);",
        "  spot(0);",

    ] + flip_comments + [
        "",
        "var",
        "  GammaVal: Float;",
        "",
        "begin",
        "  // Inicializa GammaVal com o primeiro disponivel por seguranca",
        f"  GammaVal := {available_flips[0][1]:.2f};" if available_flips else "  GammaVal := 0;",
        ""
    ] + flip_logic + [
        "",
        "  // --- Linhas Principais (Com Intercalação de Texto) ---"
    ]

    # Gera o código para as linhas principais processadas
    for line in main_lines:
        date_param = line.get('date_param', '0')
        script.append(f"  if ({line['cond']}) then")
        script.append(f"    HorizontalLineCustom({line['price']:.2f}, {line['color']}, {line['width']}, {line['style']}, \"{line['text']}\", TamanhoFonte, {line['align']}, {date_param}, 0);")

    # Adiciona Flips (Separado pois é dinâmico)
    script.append("")
    script.append("  // Flips (Dinâmicos)")
    script.append("  if (ExibirFlips) then begin")
    script.append("    if (GammaVal > 0) then")
    script.append("      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);")
    script.append(f"    if ({delta_flip:.2f} > 0) then")
    script.append(f"      HorizontalLineCustom({delta_flip:.2f}, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);")
    script.append("  end;")

    # --- Lógica Legacy: HorizontalLineCustom para Grid Completo ---
    
    # Edi_Wall (Midpoints)
    script.append("")
    script.append("  // Edi_Wall (Midpoints) - Grid Completo")
    script.append("  if (ExibirEdiWall) then begin")
    
    # Loop pelos midwalls (pontos médios entre strikes)
    if len(strikes) > 1:
        midwalls = (strikes[:-1] + strikes[1:]) / 2.0
        for mw in midwalls:
            script.append(f"    HorizontalLineCustom({mw:.2f}, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);")
    script.append("  end;")

    script.append("")
    script.append("  if (MostrarPLUS) then begin")
    if len(strikes) > 1:
        window_low = spot - 10000.0
        window_high = spot + 10000.0
        for i in range(len(strikes)-1):
            lower = strikes[i]
            upper = strikes[i+1]
            dist = upper - lower
            for p in [0.382, 0.618]:
                lvl = lower + p * dist
                if window_low <= lvl <= window_high:
                    script.append(f"    HorizontalLineCustom({lvl:.2f}, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);")
    script.append("  end;")

    script.append("")
    script.append("  if (MostrarPLUS2) then begin")
    if len(strikes) > 1:
        window_low = spot - 10000.0
        window_high = spot + 10000.0
        for i in range(len(strikes)-1):
            lower = strikes[i]
            upper = strikes[i+1]
            dist = upper - lower
            for p in [0.236, 0.764]:
                lvl = lower + p * dist
                if window_low <= lvl <= window_high:
                    script.append(f"    HorizontalLineCustom({lvl:.2f}, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);")
    script.append("  end;")

    if borboleta_levels:
        script.append("")
        script.append("  if (ExibirMelhoresPontos) then")
        script.append("  begin")
        script.append(f"    HorizontalLineCustom({borboleta_levels['res1']:.2f}, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, 0);")
        script.append(f"    HorizontalLineCustom({borboleta_levels['sup1']:.2f}, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, 0);")
        script.append(f"    HorizontalLineCustom({borboleta_levels['res2']:.2f}, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);")
        script.append(f"    HorizontalLineCustom({borboleta_levels['sup2']:.2f}, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);")
        script.append(f"    HorizontalLineCustom({borboleta_levels['res3']:.2f}, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);")
        script.append(f"    HorizontalLineCustom({borboleta_levels['sup3']:.2f}, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);")
        script.append(f"    HorizontalLineCustom({borboleta_levels['res4']:.2f}, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);")
        script.append(f"    HorizontalLineCustom({borboleta_levels['sup4']:.2f}, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);")
        script.append("  end;")

    script.append("end;")
    
    return "\n".join(script)
