import numpy as np

def generate_ntsl_script(metrics, calc):
    """
    Gera o script NTSL (Nelogica Trading System Language) para importação no ProfitChart.
    Inclui seletor de modelos de Gamma Flip e Delta Flip.
    Implementa lógica de intercalação de texto para legibilidade.
    """
    spot = metrics['spot']
    call_wall = metrics['call_wall']
    put_wall = metrics['put_wall']
    range_high = metrics['range_high']
    range_low = metrics['range_low']
    max_pain = metrics.get('max_pain', 0)
    
    # Mapeamento de Flips disponíveis
    flips = calc.flip_variations
    # Garante ordem consistente
    flip_keys = ['Classic', 'Spline', 'HVL', 'HVL Log', 'Sigma Kernel', 'PVOP']
    available_flips = [(k, flips[k]) for k in flip_keys if k in flips and flips[k] is not None]
    
    # Delta Flip
    delta_flip = spot
    if calc.delta_flip_profile and calc.delta_flip_profile.get('flip_value'):
        delta_flip = calc.delta_flip_profile['flip_value']

    # Recuperando Strikes para Grid
    strikes = np.sort(calc.strikes_ref)

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
        
    # 2. Max Pain (Renomeado para Edi_MaxPain)
    if max_pain > 0:
        main_lines.append({
            'price': max_pain, 'text': "Edi_MaxPain", 'color': 'clMaxPain', 
            'style': 'psSolid', 'width': 2, 'cond': 'ExibirMaxPain', 'align': 'tpTopRight',
            'date_param': 'CurrentDate' # Apenas hoje
        })
        
    # 3. Ranges (Renomeados para Edi_Range)
    if range_high:
        main_lines.append({
            'price': range_high, 'text': "Edi_Range", 'color': 'clRangeHigh', 
            'style': 'psDot', 'width': 1, 'cond': 'ExibirRange', 'align': 'tpTopRight',
            'date_param': '0' # Contínuo (Maxima/Minima Diaria)
        })
    if range_low:
        main_lines.append({
            'price': range_low, 'text': "Edi_Range", 'color': 'clRangeLow', 
            'style': 'psDot', 'width': 1, 'cond': 'ExibirRange', 'align': 'tpTopRight',
            'date_param': '0' # Contínuo (Maxima/Minima Diaria)
        })

    # 4. Expected Moves (Renomeados para Edi_ExpMove)
    if hasattr(calc, 'expected_moves') and calc.expected_moves:
        move_1d = next((m for m in calc.expected_moves if m['days'] == 1), None)
        if move_1d:
            main_lines.append({
                'price': move_1d['sigma_1_up'], 'text': "Edi_ExpMove", 'color': 'clExpMove', 
                'style': 'psDot', 'width': 1, 'cond': 'ExibirExpMoves', 'align': 'tpTopRight',
                'date_param': 'CurrentDate' # Apenas hoje
            })
            main_lines.append({
                'price': move_1d['sigma_1_down'], 'text': "Edi_ExpMove", 'color': 'clExpMove', 
                'style': 'psDot', 'width': 1, 'cond': 'ExibirExpMoves', 'align': 'tpTopRight',
                'date_param': 'CurrentDate' # Apenas hoje
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
    script = [
        "// NTSL Indicator - Edi OpenInterest Levels",
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
        "  clFib = clYellow;",
        "  TamanhoFonte = 8;",
        "",
        "input",
        "  ExibirWalls(true);",
        "  ExibirFlips(true);",
        "  ExibirRange(true);",
        "  ExibirMaxPain(true);",
        "  ExibirExpMoves(true);",
        "  ExibirEdiWall(true);      // Edi_Wall (Midpoints)",
        "  MostrarPLUS(true);        // Fibo 38.2% e 61.8%",
        "  MostrarPLUS2(true);       // Fibo 23.6% e 76.4%",
        "  ModeloFlip(1); // Selecione o modelo de Gamma Flip abaixo",
        "  // 1 = Classic",
        "  // 2 = Spline",
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

    # Fibonacci 38.2% e 61.8%
    script.append("")
    script.append("  // Fibonacci 38.2% e 61.8% - Grid Completo")
    script.append("  if (MostrarPLUS) then begin")
    if len(strikes) > 1:
        for i in range(len(strikes)-1):
            lower = strikes[i]
            upper = strikes[i+1]
            dist = upper - lower
            for p in [0.382, 0.618]:
                lvl = lower + p * dist
                script.append(f"    HorizontalLineCustom({lvl:.2f}, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);")
    script.append("  end;")

    # Fibonacci 23.6% e 76.4%
    script.append("")
    script.append("  // Fibonacci 23.6% e 76.4% - Grid Completo")
    script.append("  if (MostrarPLUS2) then begin")
    if len(strikes) > 1:
        for i in range(len(strikes)-1):
            lower = strikes[i]
            upper = strikes[i+1]
            dist = upper - lower
            for p in [0.236, 0.764]:
                lvl = lower + p * dist
                script.append(f"    HorizontalLineCustom({lvl:.2f}, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);")
    script.append("  end;")

    script.append("end;")
    
    return "\n".join(script)
