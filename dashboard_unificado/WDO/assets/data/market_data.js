window.marketData = {
    "last_updated": "2026-03-17 15:10:15",
    "spot_price": 5200.0,
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-03-17",
        "meetings": [
            {
                "date": "2026-03-18",
                "days_remaining": 0,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 1.1,
                    "3.50-3.75": 99.7,
                    "3.75-4.00": 0.3
                }
            },
            {
                "date": "2026-04-29",
                "days_remaining": 42,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.1,
                    "3.25-3.50": 4.3,
                    "3.50-3.75": 95.5,
                    "3.75-4.00": 0.3
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 91,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.7,
                    "3.25-3.50": 18.7,
                    "3.50-3.75": 80.4,
                    "3.75-4.00": 0.2
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 133,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.2,
                    "3.00-3.25": 4.7,
                    "3.25-3.50": 32.4,
                    "3.50-3.75": 62.6,
                    "3.75-4.00": 0.2
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 182,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 1.1,
                    "3.00-3.25": 10.7,
                    "3.25-3.50": 39.0,
                    "3.50-3.75": 48.9,
                    "3.75-4.00": 0.1
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 224,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.2,
                    "2.75-3.00": 2.7,
                    "3.00-3.25": 15.3,
                    "3.25-3.50": 40.6,
                    "3.50-3.75": 41.1,
                    "3.75-4.00": 0.1
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 266,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.1,
                    "2.50-2.75": 0.9,
                    "2.75-3.00": 6.2,
                    "3.00-3.25": 22.4,
                    "3.25-3.50": 40.7,
                    "3.50-3.75": 29.6,
                    "3.75-4.00": 0.1
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 17/03/2026 15:10\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(4);\n  spot(5200.00);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5309.50;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (5309.50)\n  // 2 = Spline (5309.72)\n  // 3 = HVL (5274.71)\n  // 4 = HVL Log (5151.99)\n  // 5 = Sigma Kernel (5151.82)\n  // 6 = PVOP (5309.50)\n  // 7 = HVL Gaussian (5301.14)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 5309.50;\n  if (ModeloFlip = 2) then GammaVal := 5309.72;\n  if (ModeloFlip = 3) then GammaVal := 5274.71;\n  if (ModeloFlip = 4) then GammaVal := 5151.99;\n  if (ModeloFlip = 5) then GammaVal := 5151.82;\n  if (ModeloFlip = 6) then GammaVal := 5309.50;\n  if (ModeloFlip = 7) then GammaVal := 5301.14;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirRange) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5037.29 <= LimitUpper) and (5037.29 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5037.29, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5161.28 <= LimitUpper) and (5161.28 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5161.28, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5238.72 <= LimitUpper) and (5238.72 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5238.72, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirRange) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirMaxPain) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5425.00 <= LimitUpper) and (5425.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5425.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5456.83 <= LimitUpper) and (5456.83 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5456.83, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5500.00 <= LimitUpper) and (5500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5700.00 <= LimitUpper) and (5700.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5700.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5800.00 <= LimitUpper) and (5800.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5800.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5344.77 > 0) then\n      HorizontalLineCustom(5344.77, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5075.00 <= LimitUpper) and (5075.00 >= LimitLower) then\n      HorizontalLineCustom(5075.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5275.00 <= LimitUpper) and (5275.00 >= LimitLower) then\n      HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5412.50 <= LimitUpper) and (5412.50 >= LimitLower) then\n      HorizontalLineCustom(5412.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5462.50 <= LimitUpper) and (5462.50 >= LimitLower) then\n      HorizontalLineCustom(5462.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5550.00 <= LimitUpper) and (5550.00 >= LimitLower) then\n      HorizontalLineCustom(5550.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5650.00 <= LimitUpper) and (5650.00 >= LimitLower) then\n      HorizontalLineCustom(5650.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5750.00 <= LimitUpper) and (5750.00 >= LimitLower) then\n      HorizontalLineCustom(5750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5900.00 <= LimitUpper) and (5900.00 >= LimitLower) then\n      HorizontalLineCustom(5900.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5057.30 <= LimitUpper) and (5057.30 >= LimitLower) then\n      HorizontalLineCustom(5057.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5092.70 <= LimitUpper) and (5092.70 >= LimitLower) then\n      HorizontalLineCustom(5092.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5409.55 <= LimitUpper) and (5409.55 >= LimitLower) then\n      HorizontalLineCustom(5409.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5415.45 <= LimitUpper) and (5415.45 >= LimitLower) then\n      HorizontalLineCustom(5415.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5453.65 <= LimitUpper) and (5453.65 >= LimitLower) then\n      HorizontalLineCustom(5453.65, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5471.35 <= LimitUpper) and (5471.35 >= LimitLower) then\n      HorizontalLineCustom(5471.35, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5538.20 <= LimitUpper) and (5538.20 >= LimitLower) then\n      HorizontalLineCustom(5538.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5638.20 <= LimitUpper) and (5638.20 >= LimitLower) then\n      HorizontalLineCustom(5638.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5661.80 <= LimitUpper) and (5661.80 >= LimitLower) then\n      HorizontalLineCustom(5661.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5738.20 <= LimitUpper) and (5738.20 >= LimitLower) then\n      HorizontalLineCustom(5738.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5761.80 <= LimitUpper) and (5761.80 >= LimitLower) then\n      HorizontalLineCustom(5761.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5876.40 <= LimitUpper) and (5876.40 >= LimitLower) then\n      HorizontalLineCustom(5876.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5923.60 <= LimitUpper) and (5923.60 >= LimitLower) then\n      HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5035.40 <= LimitUpper) and (5035.40 >= LimitLower) then\n      HorizontalLineCustom(5035.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5114.60 <= LimitUpper) and (5114.60 >= LimitLower) then\n      HorizontalLineCustom(5114.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5261.80 <= LimitUpper) and (5261.80 >= LimitLower) then\n      HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5405.90 <= LimitUpper) and (5405.90 >= LimitLower) then\n      HorizontalLineCustom(5405.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5419.10 <= LimitUpper) and (5419.10 >= LimitLower) then\n      HorizontalLineCustom(5419.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5442.70 <= LimitUpper) and (5442.70 >= LimitLower) then\n      HorizontalLineCustom(5442.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5482.30 <= LimitUpper) and (5482.30 >= LimitLower) then\n      HorizontalLineCustom(5482.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5523.60 <= LimitUpper) and (5523.60 >= LimitLower) then\n      HorizontalLineCustom(5523.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5576.40 <= LimitUpper) and (5576.40 >= LimitLower) then\n      HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5623.60 <= LimitUpper) and (5623.60 >= LimitLower) then\n      HorizontalLineCustom(5623.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5676.40 <= LimitUpper) and (5676.40 >= LimitLower) then\n      HorizontalLineCustom(5676.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5723.60 <= LimitUpper) and (5723.60 >= LimitLower) then\n      HorizontalLineCustom(5723.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5776.40 <= LimitUpper) and (5776.40 >= LimitLower) then\n      HorizontalLineCustom(5776.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5847.20 <= LimitUpper) and (5847.20 >= LimitLower) then\n      HorizontalLineCustom(5847.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5952.80 <= LimitUpper) and (5952.80 >= LimitLower) then\n      HorizontalLineCustom(5952.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5207.80, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5192.20, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5215.60, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5184.40, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5230.09, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5169.91, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5237.89, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5162.11, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 42860,
        "total_volume": 15030,
        "gamma_exposure": 86035759.6882693,
        "delta_position": -6090.247511281006,
        "last_update": "2026-03-17T15:10:15.669829",
        "spot_price": 5200.0,
        "dealer_pressure": 0.06593789065280775,
        "regime": "Gamma Negativo"
    },
    "key_levels": {
        "gamma_flip": 5309.496545529772,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 5301.135979516305,
        "gamma_flip_selected": 5151.98965504028,
        "gamma_flip_model": "HVL Log",
        "call_wall": 5350.0,
        "put_wall": 5000.0,
        "effective_call_wall": 5456.832515767344,
        "effective_put_wall": 5037.294332723949,
        "max_pain": 5400.0,
        "zero_gamma": 5309.496545529772,
        "range_low": 5161.281319384935,
        "range_high": 5238.718680615066,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5238.718680615065,
                "sigma_1_down": 5161.281319384935,
                "sigma_2_up": 5277.437361230131,
                "sigma_2_down": 5122.562638769869
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5286.577601854389,
                "sigma_1_down": 5113.422398145611,
                "sigma_2_up": 5373.155203708779,
                "sigma_2_down": 5026.844796291221
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 208,
                "sigma_1_up": 5758.408753103725,
                "sigma_1_down": 4641.591246896275,
                "sigma_2_up": 6316.817506207451,
                "sigma_2_down": 4083.1824937925494
            }
        ]
    },
    "v3_data": {
        "gamma_flip_cone": {
            "alphas": [
                0.1,
                0.2,
                0.3,
                0.4,
                0.5,
                0.6,
                0.7,
                0.7999999999999999,
                0.8999999999999999,
                0.9999999999999999,
                1.0999999999999999,
                1.2,
                1.3,
                1.4,
                1.5,
                1.5999999999999999,
                1.7,
                1.8,
                1.9,
                2.0,
                2.0999999999999996,
                2.1999999999999997,
                2.3,
                2.4,
                2.5,
                2.6,
                2.6999999999999997,
                2.8,
                2.9,
                3.0
            ],
            "flips": [
                5150.07067832681,
                5151.50925597337,
                5152.773448729883,
                5155.946572606619,
                5165.301826308345,
                5179.830857900943,
                5196.074005784741,
                5257.802005021502,
                5267.230774836485,
                5274.708560818627,
                5280.690417854138,
                5285.521545626642,
                5289.462111566889,
                5292.7078961895295,
                5295.406688673846,
                5297.670740193266,
                5299.585984899974,
                5300.782599007868,
                5301.672063516004,
                5302.431875408766,
                5303.086098029929,
                5303.6534494200005,
                5304.148669765611,
                5304.583496343114,
                5304.967370022055,
                5305.307954809621,
                5305.6115250346165,
                5305.883257422428,
                5306.127453895949,
                5306.347713288673
            ]
        },
        "gamma_flip_cone_nearest": {
            "alphas": [
                0.1,
                0.2,
                0.3,
                0.4,
                0.5,
                0.6,
                0.7,
                0.7999999999999999,
                0.8999999999999999,
                0.9999999999999999,
                1.0999999999999999,
                1.2,
                1.3,
                1.4,
                1.5,
                1.5999999999999999,
                1.7,
                1.8,
                1.9,
                2.0,
                2.0999999999999996,
                2.1999999999999997,
                2.3,
                2.4,
                2.5,
                2.6,
                2.6999999999999997,
                2.8,
                2.9,
                3.0
            ],
            "flips": [
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ]
        },
        "gamma_flip_cone_nearest_expiry": "2026-04-01",
        "delta_flip_profile": {
            "spots": [
                4420.0,
                4451.836734693878,
                4483.673469387755,
                4515.510204081633,
                4547.34693877551,
                4579.183673469388,
                4611.0204081632655,
                4642.857142857143,
                4674.693877551021,
                4706.530612244897,
                4738.367346938775,
                4770.204081632653,
                4802.04081632653,
                4833.877551020408,
                4865.714285714285,
                4897.551020408163,
                4929.3877551020405,
                4961.224489795918,
                4993.061224489796,
                5024.897959183673,
                5056.734693877551,
                5088.571428571428,
                5120.408163265306,
                5152.244897959183,
                5184.08163265306,
                5215.918367346938,
                5247.7551020408155,
                5279.591836734693,
                5311.428571428571,
                5343.265306122448,
                5375.102040816326,
                5406.938775510203,
                5438.775510204081,
                5470.612244897959,
                5502.448979591836,
                5534.285714285714,
                5566.122448979591,
                5597.959183673469,
                5629.7959183673465,
                5661.632653061224,
                5693.469387755102,
                5725.306122448979,
                5757.142857142857,
                5788.979591836734,
                5820.816326530611,
                5852.653061224489,
                5884.489795918366,
                5916.326530612244,
                5948.1632653061215,
                5979.999999999999
            ],
            "deltas": [
                -17666.612048649506,
                -17530.017308495404,
                -17369.45168958987,
                -17182.85796940597,
                -16968.449069972074,
                -16724.789281579415,
                -16450.86462042513,
                -16146.136849232045,
                -15810.576332142991,
                -15444.669848248977,
                -15049.400454142715,
                -14626.196854951913,
                -14176.84846429431,
                -13703.377962036722,
                -13207.854440518195,
                -12692.11763001531,
                -12157.371846505877,
                -11603.608172549999,
                -11028.84137559233,
                -10428.218976721262,
                -9793.173273929842,
                -9110.913183210765,
                -8364.62975031553,
                -7534.743761112278,
                -6601.312829394035,
                -5547.367875883962,
                -4362.577667091232,
                -3046.4011967268166,
                -1609.9035573137753,
                -75.70058983301635,
                1524.0386912562087,
                3151.132547403991,
                4765.744918225684,
                6330.728890269859,
                7815.217452264777,
                9196.955523330002,
                10463.160557291934,
                11609.991773377831,
                12640.95031429827,
                13564.682264628522,
                14392.686032852402,
                15137.336851742431,
                15810.471488313726,
                16422.586759069844,
                16982.555363321237,
                17497.68573084912,
                17973.9490807298,
                18416.241622681315,
                18828.61001827209,
                19214.41862596571
            ],
            "flip_value": 5344.7718388576095
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                120.0,
                20.0,
                25.0,
                1100.0,
                100.0,
                150.0,
                9740.0,
                2500.0,
                105.0,
                120.0,
                30.0,
                500.0
            ],
            "bear": [
                -15.0,
                -160.0,
                -200.0,
                -95.0,
                -20.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -30.0,
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4420.0,
                4451.836734693878,
                4483.673469387755,
                4515.510204081633,
                4547.34693877551,
                4579.183673469388,
                4611.0204081632655,
                4642.857142857143,
                4674.693877551021,
                4706.530612244897,
                4738.367346938775,
                4770.204081632653,
                4802.04081632653,
                4833.877551020408,
                4865.714285714285,
                4897.551020408163,
                4929.3877551020405,
                4961.224489795918,
                4993.061224489796,
                5024.897959183673,
                5056.734693877551,
                5088.571428571428,
                5120.408163265306,
                5152.244897959183,
                5184.08163265306,
                5215.918367346938,
                5247.7551020408155,
                5279.591836734693,
                5311.428571428571,
                5343.265306122448,
                5375.102040816326,
                5406.938775510203,
                5438.775510204081,
                5470.612244897959,
                5502.448979591836,
                5534.285714285714,
                5566.122448979591,
                5597.959183673469,
                5629.7959183673465,
                5661.632653061224,
                5693.469387755102,
                5725.306122448979,
                5757.142857142857,
                5788.979591836734,
                5820.816326530611,
                5852.653061224489,
                5884.489795918366,
                5916.326530612244,
                5948.1632653061215,
                5979.999999999999
            ],
            "pnl": [
                -4301146.746075287,
                -3901803.6520799026,
                -3515847.5008843467,
                -3144140.644115202,
                -2787544.2378244996,
                -2446913.2047954146,
                -2123091.198225137,
                -1816905.6253997404,
                -1529162.7873340026,
                -1260643.1867978983,
                -1012097.0528350063,
                -784240.1249482948,
                -577749.7347434908,
                -393261.2171325367,
                -231364.67735725455,
                -92602.13423334248,
                22534.945740653202,
                113607.71430893987,
                180231.60356207937,
                222077.58523364365,
                238873.0326529406,
                230402.19480347633,
                196506.29544349015,
                137083.27326451056,
                52087.18160428479,
                -58472.73169281706,
                -194533.24203579873,
                -355978.64000478946,
                -542642.473104354,
                -754309.5125082098,
                -990717.9197252337,
                -1251561.588152321,
                -1536492.6347402055,
                -1845124.0174512602,
                -2177032.254803477,
                -2531760.2245450635,
                -2908820.019367438,
                -3307695.838519063,
                -3727846.895213183,
                -4168710.3208136726,
                -4629704.047924612,
                -5110229.655689031,
                -5609675.161814569,
                -6127417.747079864,
                -6662826.399329269,
                -7215264.465229791,
                -7784092.099336546,
                -8368668.601285744,
                -8968354.633201893,
                -9582514.310661454
            ]
        },
        "max_pain_profile": {
            "strikes": [
                4500.0,
                5000.0,
                5150.0,
                5200.0,
                5250.0,
                5300.0,
                5350.0,
                5400.0,
                5425.0,
                5500.0,
                5600.0,
                5700.0,
                5800.0,
                6000.0,
                6200.0
            ],
            "loss": [
                16601750.0,
                7484250.0,
                6084000.0,
                5627250.0,
                5278500.0,
                4934000.0,
                4667500.0,
                4586000.0,
                4622250.0,
                4742250.0,
                5331750.0,
                6411250.0,
                7537250.0,
                9813250.0,
                14535250.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5350.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 890.5571763085964,
                        "Call_Sim": 1036.3648263372088,
                        "Call_Chg": 16.37263209005764,
                        "Put_Now": 8.622911509815196,
                        "Put_Sim": 4.430561538427938,
                        "Put_Chg": -48.618728913259
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 472.5017853849072,
                        "Call_Sim": 596.2113981430944,
                        "Call_Chg": 26.181829695608755,
                        "Put_Now": 70.35260227514937,
                        "Put_Sim": 44.062215033336315,
                        "Put_Chg": -37.369459538953826
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 370.1892676547891,
                        "Call_Sim": 481.95142644156385,
                        "Call_Chg": 30.190545364755366,
                        "Put_Now": 111.97560905173873,
                        "Put_Sim": 73.73776783851304,
                        "Put_Chg": -34.14836636035421
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 339.17975516848173,
                        "Call_Sim": 446.4973254065753,
                        "Call_Chg": 31.640323044866115,
                        "Put_Now": 128.94460473433378,
                        "Put_Sim": 86.26217497242806,
                        "Put_Chg": -33.10136926616269
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 309.791888363819,
                        "Call_Sim": 412.4778867890768,
                        "Call_Chg": 33.146767969813205,
                        "Put_Now": 147.53524609857368,
                        "Put_Sim": 100.22124452383173,
                        "Put_Chg": -32.069625954417525
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 282.0516904292713,
                        "Call_Sim": 379.9508925537166,
                        "Call_Chg": 34.709666861222026,
                        "Put_Now": 167.77355633292882,
                        "Put_Sim": 115.67275845737367,
                        "Put_Chg": -31.0542370408878
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 255.9723142007815,
                        "Call_Sim": 348.96378656757224,
                        "Call_Chg": 36.32872275938771,
                        "Put_Now": 189.672688273341,
                        "Put_Sim": 132.66416064013197,
                        "Put_Chg": -30.056265955936123
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 231.55409878712408,
                        "Call_Sim": 319.5529162252169,
                        "Call_Chg": 38.00356715732045,
                        "Put_Now": 213.23298102858598,
                        "Put_Sim": 151.23179846667858,
                        "Put_Chg": -29.076732062192352
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 219.96460822489553,
                        "Call_Sim": 305.44676634550933,
                        "Call_Chg": 38.86177817897659,
                        "Put_Now": 225.63274455080818,
                        "Put_Sim": 161.11490267142221,
                        "Put_Chg": -28.59418388400527
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5000.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 890.5571763085964,
                        "Call_Sim": 701.6484049458936,
                        "Call_Chg": -21.212424804181463,
                        "Put_Now": 8.622911509815196,
                        "Put_Sim": 19.71414014711246,
                        "Put_Chg": 128.62510098442337
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 472.5017853849072,
                        "Call_Sim": 326.1343799696938,
                        "Call_Chg": -30.97711160942604,
                        "Put_Now": 70.35260227514937,
                        "Put_Sim": 123.9851968599362,
                        "Put_Chg": 76.2339882965942
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 370.1892676547891,
                        "Call_Sim": 243.22552360859663,
                        "Call_Chg": -34.2969813389051,
                        "Put_Now": 111.97560905173873,
                        "Put_Sim": 185.0118650055465,
                        "Put_Chg": 65.22514730869747
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 339.17975516848173,
                        "Call_Sim": 219.03913448250432,
                        "Call_Chg": -35.420929125413046,
                        "Put_Now": 128.94460473433378,
                        "Put_Sim": 208.80398404835614,
                        "Put_Chg": 61.93309094130589
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 309.791888363819,
                        "Call_Sim": 196.56447306054088,
                        "Call_Chg": -36.549509382345114,
                        "Put_Now": 147.53524609857368,
                        "Put_Sim": 234.30783079529556,
                        "Put_Chg": 58.81481679214874
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 282.0516904292713,
                        "Call_Sim": 175.77338609338221,
                        "Call_Chg": -37.68043516212853,
                        "Put_Now": 167.77355633292882,
                        "Put_Sim": 261.4952519970393,
                        "Put_Chg": 55.86201885005627
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 255.9723142007815,
                        "Call_Sim": 156.62554367486928,
                        "Call_Chg": -38.81152961252906,
                        "Put_Now": 189.672688273341,
                        "Put_Sim": 290.3259177474288,
                        "Put_Chg": 53.06680175747519
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 231.55409878712408,
                        "Call_Sim": 139.06968381137813,
                        "Call_Chg": -39.94073759012583,
                        "Put_Now": 213.23298102858598,
                        "Put_Sim": 320.7485660528405,
                        "Put_Chg": 50.421648895787364
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 219.96460822489553,
                        "Call_Sim": 130.87008320137306,
                        "Call_Chg": -40.504027326264556,
                        "Put_Now": 225.63274455080818,
                        "Put_Sim": 336.5382195272864,
                        "Put_Chg": 49.15309397900996
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5309.496545529772,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 890.5571763085964,
                        "Call_Sim": 996.7538526410744,
                        "Call_Chg": 11.924745446740273,
                        "Put_Now": 8.622911509815196,
                        "Put_Sim": 5.323042312520215,
                        "Put_Chg": -38.268619520667016
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 472.5017853849072,
                        "Call_Sim": 561.8206878672449,
                        "Call_Chg": 18.9033999965899,
                        "Put_Now": 70.35260227514937,
                        "Put_Sim": 50.17495922771525,
                        "Put_Chg": -28.680734464546536
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 370.1892676547891,
                        "Call_Sim": 450.538365150378,
                        "Call_Chg": 21.70486951299639,
                        "Put_Now": 111.97560905173873,
                        "Put_Sim": 82.82816101755543,
                        "Put_Chg": -26.030175929398712
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 339.17975516848173,
                        "Call_Sim": 416.21190854404904,
                        "Call_Chg": 22.711306380094207,
                        "Put_Now": 128.94460473433378,
                        "Put_Sim": 96.48021258012909,
                        "Put_Chg": -25.17700699543924
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 309.791888363819,
                        "Call_Sim": 383.37806139188433,
                        "Call_Chg": 23.753421503937467,
                        "Put_Now": 147.53524609857368,
                        "Put_Sim": 111.62487359686679,
                        "Put_Chg": -24.340199004184978
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 282.0516904292713,
                        "Call_Sim": 352.0871921696794,
                        "Call_Chg": 24.830732846811486,
                        "Put_Now": 167.77355633292882,
                        "Put_Sim": 128.31251254356425,
                        "Put_Chg": -23.520419219735864
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 255.9723142007815,
                        "Call_Sim": 322.37845103201107,
                        "Call_Chg": 25.942702842129016,
                        "Put_Now": 189.672688273341,
                        "Put_Sim": 146.5822795747979,
                        "Put_Chg": -22.718299134583198
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 231.55409878712408,
                        "Call_Sim": 294.27920537023056,
                        "Call_Chg": 27.08874812048648,
                        "Put_Now": 213.23298102858598,
                        "Put_Sim": 166.46154208192002,
                        "Put_Chg": -21.934429993451996
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 219.96460822489553,
                        "Call_Sim": 280.83839791102673,
                        "Call_Chg": 27.674356423690128,
                        "Put_Now": 225.63274455080818,
                        "Put_Sim": 177.00998870716785,
                        "Put_Chg": -21.549512213060645
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5252.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 890.5571763085964,
                        "Call_Sim": 940.8091547902504,
                        "Call_Chg": 5.642757120879203,
                        "Put_Now": 8.622911509815196,
                        "Put_Sim": 6.874889991469189,
                        "Put_Chg": -20.271824851226736
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 472.5017853849072,
                        "Call_Sim": 514.2137594361088,
                        "Call_Chg": 8.827897659100364,
                        "Put_Now": 70.35260227514937,
                        "Put_Sim": 60.064576326351016,
                        "Put_Chg": -14.62351869879927
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 370.1892676547891,
                        "Call_Sim": 407.4772641957452,
                        "Call_Chg": 10.07268438039325,
                        "Put_Now": 111.97560905173873,
                        "Put_Sim": 97.2636055926946,
                        "Put_Chg": -13.13857864550341
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 339.17975516848173,
                        "Call_Sim": 374.84612036298176,
                        "Call_Chg": 10.515475835750685,
                        "Put_Now": 128.94460473433378,
                        "Put_Sim": 112.61096992883381,
                        "Put_Chg": -12.667171952756275
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 309.791888363819,
                        "Call_Sim": 343.78100137159527,
                        "Call_Chg": 10.971595540248465,
                        "Put_Now": 147.53524609857368,
                        "Put_Sim": 129.52435910634995,
                        "Put_Chg": -12.207853694967236
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 282.0516904292713,
                        "Call_Sim": 314.32021237780737,
                        "Call_Chg": 11.440641217014052,
                        "Put_Now": 167.77355633292882,
                        "Put_Sim": 148.04207828146446,
                        "Put_Chg": -11.76077951897815
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 255.9723142007815,
                        "Call_Sim": 286.4898231523439,
                        "Call_Chg": 11.922191291213165,
                        "Put_Now": 189.672688273341,
                        "Put_Sim": 168.1901972249034,
                        "Put_Chg": -11.326085607791242
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 231.55409878712408,
                        "Call_Sim": 260.3034155493797,
                        "Call_Chg": 12.415809917787666,
                        "Put_Now": 213.23298102858598,
                        "Put_Sim": 189.98229779084159,
                        "Put_Chg": -10.903886971700413
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 219.96460822489553,
                        "Call_Sim": 247.82753830038928,
                        "Call_Chg": 12.667005978982864,
                        "Put_Now": 225.63274455080818,
                        "Put_Sim": 201.49567462630284,
                        "Put_Chg": -10.697503136150583
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5148.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 890.5571763085964,
                        "Call_Sim": 840.6991504485409,
                        "Call_Chg": -5.598520475318549,
                        "Put_Now": 8.622911509815196,
                        "Put_Sim": 10.764885649759407,
                        "Put_Chg": 24.840497754222184
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 472.5017853849072,
                        "Call_Sim": 432.1888858354987,
                        "Call_Chg": -8.531798354279017,
                        "Put_Now": 70.35260227514937,
                        "Put_Sim": 82.03970272574134,
                        "Put_Chg": 16.61217932619417
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 370.1892676547891,
                        "Call_Sim": 334.5811055576555,
                        "Call_Chg": -9.618907193803114,
                        "Put_Now": 111.97560905173873,
                        "Put_Sim": 128.36744695460538,
                        "Put_Chg": 14.638757530930462
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 339.17975516848173,
                        "Call_Sim": 305.2676866337092,
                        "Call_Chg": -9.998258450869885,
                        "Put_Now": 128.94460473433378,
                        "Put_Sim": 147.03253619956195,
                        "Put_Chg": 14.02767607260107
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 309.791888363819,
                        "Call_Sim": 277.61954111418436,
                        "Call_Chg": -10.38514837155823,
                        "Put_Now": 147.53524609857368,
                        "Put_Sim": 167.36289884893858,
                        "Put_Chg": 13.439265039838228
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 282.0516904292713,
                        "Call_Sim": 251.64935842130308,
                        "Call_Chg": -10.778993014258159,
                        "Put_Now": 167.77355633292882,
                        "Put_Sim": 189.37122432496062,
                        "Put_Chg": 12.873106146223378
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 255.9723142007815,
                        "Call_Sim": 227.3566363763357,
                        "Call_Chg": -11.179208155300744,
                        "Put_Now": 189.672688273341,
                        "Put_Sim": 213.0570104488952,
                        "Put_Chg": 12.328776688109459
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 231.55409878712408,
                        "Call_Sim": 204.7280602700007,
                        "Call_Chg": -11.585214279357462,
                        "Put_Now": 213.23298102858598,
                        "Put_Sim": 238.40694251146215,
                        "Put_Chg": 11.805847932830497
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 219.96460822489553,
                        "Call_Sim": 194.03031848235378,
                        "Call_Chg": -11.790210230559497,
                        "Put_Now": 225.63274455080818,
                        "Put_Sim": 251.6984548082669,
                        "Put_Chg": 11.552272835820247
                    }
                ]
            }
        ],
        "fair_value_sims_nearest": [
            {
                "scenario": "Call Wall",
                "target_spot": 5350.0,
                "options": [
                    {
                        "Strike": 5300.0,
                        "Call_Now": 19.042592050686608,
                        "Call_Sim": 88.83121721877524,
                        "Call_Chg": 366.4870044074294,
                        "Put_Now": 107.48774577525955,
                        "Put_Sim": 27.27637094334773,
                        "Put_Chg": -74.62373896985574
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 9.597260073464781,
                        "Call_Sim": 58.6867106572231,
                        "Call_Chg": 511.4944287014216,
                        "Put_Now": 147.93340581430675,
                        "Put_Sim": 47.022856398066324,
                        "Put_Chg": -68.21349705347032
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 4.387430417976759,
                        "Call_Sim": 35.964639988769704,
                        "Call_Chg": 719.7198943921853,
                        "Put_Now": 192.61456817508952,
                        "Put_Sim": 74.19177774588206,
                        "Put_Chg": -61.48174125726532
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.6767551048461087,
                        "Call_Sim": 10.498727301855752,
                        "Call_Chg": 1451.3333001371477,
                        "Put_Now": 288.6858768944976,
                        "Put_Sim": 148.50784909150843,
                        "Put_Chg": -48.55728631789572
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5300.0,
                "options": [
                    {
                        "Strike": 5300.0,
                        "Call_Now": 19.042592050686608,
                        "Call_Sim": 58.13823672584749,
                        "Call_Chg": 205.30631844182804,
                        "Put_Now": 107.48774577525955,
                        "Put_Sim": 46.58339045042112,
                        "Put_Chg": -56.66167327778939
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 9.597260073464781,
                        "Call_Sim": 35.45079604938178,
                        "Call_Chg": 269.3845511949684,
                        "Put_Now": 147.93340581430675,
                        "Put_Sim": 73.78694179022477,
                        "Put_Chg": -50.12151489106811
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 4.387430417976759,
                        "Call_Sim": 19.880265401477573,
                        "Call_Chg": 353.11864821881903,
                        "Put_Now": 192.61456817508952,
                        "Put_Sim": 108.10740315858993,
                        "Put_Chg": -43.87371413136379
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.6767551048461087,
                        "Call_Sim": 4.760463813639944,
                        "Call_Chg": 603.4248843564252,
                        "Put_Now": 288.6858768944976,
                        "Put_Sim": 192.7695856032915,
                        "Put_Chg": -33.22514157014319
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5300.0,
                "options": [
                    {
                        "Strike": 5300.0,
                        "Call_Now": 19.042592050686608,
                        "Call_Sim": 58.13823672584749,
                        "Call_Chg": 205.30631844182804,
                        "Put_Now": 107.48774577525955,
                        "Put_Sim": 46.58339045042112,
                        "Put_Chg": -56.66167327778939
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 9.597260073464781,
                        "Call_Sim": 35.45079604938178,
                        "Call_Chg": 269.3845511949684,
                        "Put_Now": 147.93340581430675,
                        "Put_Sim": 73.78694179022477,
                        "Put_Chg": -50.12151489106811
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 4.387430417976759,
                        "Call_Sim": 19.880265401477573,
                        "Call_Chg": 353.11864821881903,
                        "Put_Now": 192.61456817508952,
                        "Put_Sim": 108.10740315858993,
                        "Put_Chg": -43.87371413136379
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.6767551048461087,
                        "Call_Sim": 4.760463813639944,
                        "Call_Chg": 603.4248843564252,
                        "Put_Now": 288.6858768944976,
                        "Put_Sim": 192.7695856032915,
                        "Put_Chg": -33.22514157014319
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5252.0,
                "options": [
                    {
                        "Strike": 5300.0,
                        "Call_Now": 19.042592050686608,
                        "Call_Sim": 35.72061103233864,
                        "Call_Chg": 87.58271425055646,
                        "Put_Now": 107.48774577525955,
                        "Put_Sim": 72.16576475691181,
                        "Put_Chg": -32.86140272417714
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 9.597260073464781,
                        "Call_Sim": 19.97242670303831,
                        "Call_Chg": 108.10550667746892,
                        "Put_Now": 147.93340581430675,
                        "Put_Sim": 106.30857244388108,
                        "Put_Chg": -28.137548203733783
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 4.387430417976759,
                        "Call_Sim": 10.196247784697334,
                        "Call_Chg": 132.39679751774344,
                        "Put_Now": 192.61456817508952,
                        "Put_Sim": 146.4233855418097,
                        "Put_Chg": -23.981146945900452
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.6767551048461087,
                        "Call_Sim": 1.9901510353188883,
                        "Call_Chg": 194.0725560941931,
                        "Put_Now": 288.6858768944976,
                        "Put_Sim": 237.99927282496992,
                        "Put_Chg": -17.557701337794047
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5148.0,
                "options": [
                    {
                        "Strike": 5300.0,
                        "Call_Now": 19.042592050686608,
                        "Call_Sim": 9.018969528983462,
                        "Call_Chg": -52.637910296154935,
                        "Put_Now": 107.48774577525955,
                        "Put_Sim": 149.46412325355777,
                        "Put_Chg": 39.05224467732759
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 9.597260073464781,
                        "Call_Sim": 4.05958761300991,
                        "Call_Chg": -57.700556388649304,
                        "Put_Now": 147.93340581430675,
                        "Put_Sim": 194.39573335385285,
                        "Put_Chg": 31.407596738405307
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 4.387430417976759,
                        "Call_Sim": 1.648706694232061,
                        "Call_Chg": -62.42204349323097,
                        "Put_Now": 192.61456817508952,
                        "Put_Sim": 241.87584445134416,
                        "Put_Chg": 25.5750521588146
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.6767551048461087,
                        "Call_Sim": 0.19843610491912855,
                        "Call_Chg": -70.67829950625166,
                        "Put_Now": 288.6858768944976,
                        "Put_Sim": 340.2075578945696,
                        "Put_Chg": 17.846969707804934
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.00011832604066040699,
            -0.023309553334165484,
            0.0018359649906175579,
            0.04558035722139759,
            0.0012233924444740693,
            0.304359291941715,
            0.5752353697996117,
            0.3897330592627332,
            0.01376948891079251,
            0.18839652366897422,
            0.2879036292222821,
            0.0004640444968843478,
            0.006998417609003403,
            0.2650251418479849,
            0.0443957367250067
        ],
        "flip_variations": {
            "Classic": 5309.496545529772,
            "Spline": 5309.72353838887,
            "HVL": 5274.708560818627,
            "HVL Log": 5151.98965504028,
            "Sigma Kernel": 5151.81910443855,
            "PVOP": 5309.496545529772,
            "HVL Gaussian": 5301.135979516305
        }
    },
    "delta_data": {
        "strikes": [
            4500.0,
            5000.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0,
            5425.0,
            5500.0,
            5600.0,
            5700.0,
            5800.0,
            6000.0,
            6200.0
        ],
        "delta_values": [
            -0.42567011922310827,
            -1712.6277456660634,
            -66.53091718968733,
            -724.2196720219949,
            -11.302089590409054,
            391.92902438661423,
            707.9358296695433,
            236.2843238967571,
            43.62292847069881,
            180.9337069002681,
            449.75199900966925,
            0.06932253099074431,
            39.15539963666012,
            -5739.909249065597,
            115.08529787076638
        ],
        "delta_cumulative": [
            -0.42567011922310827,
            -1713.0534157852865,
            -1779.5843329749737,
            -2503.8040049969686,
            -2515.106094587378,
            -2123.1770702007634,
            -1415.2412405312202,
            -1178.9569166344631,
            -1135.3339881637644,
            -954.4002812634963,
            -504.648282253827,
            -504.57895972283626,
            -465.42356008617617,
            -6205.332809151772,
            -6090.247511281006
        ]
    },
    "gamma_data": {
        "strikes": [
            4500.0,
            5000.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0,
            5425.0,
            5500.0,
            5600.0,
            5700.0,
            5800.0,
            6000.0,
            6200.0
        ],
        "gamma_values": [
            5110.298826805312,
            18748820.102293868,
            490386.7264177981,
            6219124.654620642,
            155059.2222909433,
            10063244.377175145,
            16691000.790196385,
            8980789.578934586,
            469821.62080088066,
            3513620.9773664717,
            7031288.046031676,
            5420.246209317672,
            184093.92929586332,
            12573744.546305543,
            904234.5715033861
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            181624.05268975475,
            47789.2618124318,
            10063244.377175145,
            16691000.790196385,
            8980789.578934586,
            469821.62080088066,
            3513620.9773664717,
            7031288.046031676,
            5420.246209317672,
            184093.92929586332,
            5346154.672182242,
            904234.5715033861
        ],
        "gamma_put": [
            5110.298826805312,
            18748820.102293868,
            490386.7264177981,
            6037500.601930887,
            107269.9604785115,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            7227589.8741233,
            0.0
        ],
        "gamma_exposure": [
            5110.298826805312,
            18753930.401120674,
            19244317.127538472,
            25463441.782159112,
            25618501.004450057,
            35681745.381625205,
            52372746.171821594,
            61353535.75075618,
            61823357.371557064,
            65336978.348923534,
            72368266.39495522,
            72373686.64116454,
            72557780.57046041,
            85131525.11676595,
            86035759.68826933
        ]
    },
    "oi_data": {
        "strikes": [
            4500.0,
            5000.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0,
            5425.0,
            5500.0,
            5600.0,
            5700.0,
            5800.0,
            6000.0,
            6200.0
        ],
        "call_oi": [
            0.0,
            0.0,
            0.0,
            120.0,
            20.0,
            1560.0,
            3700.0,
            3080.0,
            150.0,
            4295.0,
            4900.0,
            465.0,
            120.0,
            5200.0,
            1000.0
        ],
        "put_oi": [
            15.0,
            8900.0,
            200.0,
            2040.0,
            65.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            7030.0,
            0.0
        ],
        "total_oi": [
            15.0,
            8900.0,
            200.0,
            2160.0,
            85.0,
            1560.0,
            3700.0,
            3080.0,
            150.0,
            4295.0,
            4900.0,
            465.0,
            120.0,
            12230.0,
            1000.0
        ]
    },
    "oi_data_nearest": {
        "strikes": [
            5300.0,
            5350.0,
            5400.0,
            5500.0,
            5700.0
        ],
        "call_oi": [
            1560.0,
            2700.0,
            3080.0,
            4055.0,
            465.0
        ],
        "put_oi": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_oi": [
            1560.0,
            2700.0,
            3080.0,
            4055.0,
            465.0
        ]
    },
    "gex_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 11,
            "abs_call": 34711522.117174305,
            "abs_put": 0.0,
            "net": 34711522.117174305
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 33,
            "abs_call": 10230349.754039258,
            "abs_put": 0.0,
            "net": 10230349.754039258
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 54,
            "abs_call": 469821.62080088066,
            "abs_put": 0.0,
            "net": 469821.62080088066
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 76,
            "abs_call": 0.0,
            "abs_put": 24757227.913227215,
            "net": 24757227.913227215
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 99,
            "abs_call": 0.0,
            "abs_put": 490386.7264177981,
            "net": 490386.7264177981
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 120,
            "abs_call": 47789.2618124318,
            "abs_put": 0.0,
            "net": 47789.2618124318
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 142,
            "abs_call": 5346154.672182242,
            "abs_put": 7227589.8741233,
            "net": 12573744.546305543
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 164,
            "abs_call": 0.0,
            "abs_put": 34203.089824342926,
            "net": 34203.089824342926
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 185,
            "abs_call": 936042.7412184997,
            "abs_put": 0.0,
            "net": 936042.7412184997
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 208,
            "abs_call": 904234.5715033861,
            "abs_put": 0.0,
            "net": 904234.5715033861
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 229,
            "abs_call": 0.0,
            "abs_put": 107269.9604785115,
            "net": 107269.9604785115
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 249,
            "abs_call": 773167.3854671356,
            "abs_put": 0.0,
            "net": 773167.3854671356
        }
    ],
    "oi_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 11,
            "call_oi": 11860.0,
            "put_oi": 0.0,
            "total_oi": 11860.0
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 33,
            "call_oi": 5400.0,
            "put_oi": 0.0,
            "total_oi": 5400.0
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 54,
            "call_oi": 150.0,
            "put_oi": 0.0,
            "total_oi": 150.0
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 76,
            "call_oi": 0.0,
            "put_oi": 10925.0,
            "total_oi": 10925.0
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 99,
            "call_oi": 0.0,
            "put_oi": 200.0,
            "total_oi": 200.0
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 120,
            "call_oi": 20.0,
            "put_oi": 0.0,
            "total_oi": 20.0
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 142,
            "call_oi": 5200.0,
            "put_oi": 7030.0,
            "total_oi": 12230.0
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 164,
            "call_oi": 0.0,
            "put_oi": 30.0,
            "total_oi": 30.0
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 185,
            "call_oi": 500.0,
            "put_oi": 0.0,
            "total_oi": 500.0
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 208,
            "call_oi": 1000.0,
            "put_oi": 0.0,
            "total_oi": 1000.0
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 229,
            "call_oi": 0.0,
            "put_oi": 65.0,
            "total_oi": 65.0
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 249,
            "call_oi": 480.0,
            "put_oi": 0.0,
            "total_oi": 480.0
        }
    ],
    "volume_data": {
        "strikes": [
            4500.0,
            5000.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0,
            5425.0,
            5500.0,
            5600.0,
            5700.0,
            5800.0,
            6000.0,
            6200.0
        ],
        "call_volume": [
            0.0,
            0.0,
            0.0,
            120.0,
            20.0,
            25.0,
            1100.0,
            100.0,
            150.0,
            9740.0,
            2500.0,
            105.0,
            120.0,
            30.0,
            500.0
        ],
        "put_volume": [
            15.0,
            160.0,
            200.0,
            95.0,
            20.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            30.0,
            0.0
        ],
        "total_volume": [
            15.0,
            160.0,
            200.0,
            215.0,
            40.0,
            25.0,
            1100.0,
            100.0,
            150.0,
            9740.0,
            2500.0,
            105.0,
            120.0,
            60.0,
            500.0
        ]
    },
    "volatility_data": {
        "strikes": [
            4500.0,
            5000.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0,
            5425.0,
            5500.0,
            5600.0,
            5700.0,
            5800.0,
            6000.0,
            6200.0
        ],
        "iv_values": [
            11.82,
            11.82,
            11.82,
            11.82,
            11.82,
            11.82,
            11.82,
            11.82,
            11.82,
            11.82,
            11.82,
            11.82,
            11.82,
            11.82,
            11.82
        ],
        "skew": [
            0.0,
            -1.0842021724855044e-19,
            -4.336808689942018e-19,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            6.505213034913027e-19,
            1.0842021724855044e-19,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ]
    },
    "most_actives": {
        "top_oi": [
            {
                "strike": 5000.0,
                "type": "PUT",
                "oi": 8900,
                "volume": 160,
                "expiry": "2026-07-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 6000.0,
                "type": "PUT",
                "oi": 7030,
                "volume": 30,
                "expiry": "2026-10-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 6000.0,
                "type": "CALL",
                "oi": 5200,
                "volume": 30,
                "expiry": "2026-10-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5600.0,
                "type": "CALL",
                "oi": 4400,
                "volume": 2000,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5500.0,
                "type": "CALL",
                "oi": 4055,
                "volume": 9500,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5400.0,
                "type": "CALL",
                "oi": 3080,
                "volume": 100,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5350.0,
                "type": "CALL",
                "oi": 2700,
                "volume": 100,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5200.0,
                "type": "PUT",
                "oi": 2025,
                "volume": 80,
                "expiry": "2026-07-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5300.0,
                "type": "CALL",
                "oi": 1560,
                "volume": 25,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5350.0,
                "type": "CALL",
                "oi": 1000,
                "volume": 1000,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 6200.0,
                "type": "CALL",
                "oi": 1000,
                "volume": 500,
                "expiry": "2027-01-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5600.0,
                "type": "CALL",
                "oi": 500,
                "volume": 500,
                "expiry": "2026-12-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5700.0,
                "type": "CALL",
                "oi": 465,
                "volume": 105,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5500.0,
                "type": "CALL",
                "oi": 240,
                "volume": 240,
                "expiry": "2027-03-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5150.0,
                "type": "PUT",
                "oi": 200,
                "volume": 200,
                "expiry": "2026-08-03 00:00:00",
                "iv": 0.0
            }
        ],
        "top_vol": [
            {
                "strike": 5500.0,
                "type": "CALL",
                "oi": 4055,
                "volume": 9500,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5600.0,
                "type": "CALL",
                "oi": 4400,
                "volume": 2000,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5350.0,
                "type": "CALL",
                "oi": 1000,
                "volume": 1000,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5600.0,
                "type": "CALL",
                "oi": 500,
                "volume": 500,
                "expiry": "2026-12-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 6200.0,
                "type": "CALL",
                "oi": 1000,
                "volume": 500,
                "expiry": "2027-01-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5500.0,
                "type": "CALL",
                "oi": 240,
                "volume": 240,
                "expiry": "2027-03-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5150.0,
                "type": "PUT",
                "oi": 200,
                "volume": 200,
                "expiry": "2026-08-03 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5000.0,
                "type": "PUT",
                "oi": 8900,
                "volume": 160,
                "expiry": "2026-07-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5425.0,
                "type": "CALL",
                "oi": 150,
                "volume": 150,
                "expiry": "2026-06-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5800.0,
                "type": "CALL",
                "oi": 120,
                "volume": 120,
                "expiry": "2027-03-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5200.0,
                "type": "CALL",
                "oi": 120,
                "volume": 120,
                "expiry": "2027-03-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5700.0,
                "type": "CALL",
                "oi": 465,
                "volume": 105,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5400.0,
                "type": "CALL",
                "oi": 3080,
                "volume": 100,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5350.0,
                "type": "CALL",
                "oi": 2700,
                "volume": 100,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5200.0,
                "type": "PUT",
                "oi": 2025,
                "volume": 80,
                "expiry": "2026-07-01 00:00:00",
                "iv": 0.0
            }
        ]
    },
    "fed_watch": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 14,
            "iv_atm": 0.0,
            "spot": 5200.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 44,
            "iv_atm": 0.0,
            "spot": 5200.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 75,
            "iv_atm": 0.0,
            "spot": 5200.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 105,
            "iv_atm": 0.0,
            "spot": 5200.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 138,
            "iv_atm": 0.0,
            "spot": 5200.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 167,
            "iv_atm": 0.0,
            "spot": 5200.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 197,
            "iv_atm": 0.0,
            "spot": 5200.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 229,
            "iv_atm": 0.0,
            "spot": 5200.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 258,
            "iv_atm": 0.0,
            "spot": 5200.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 289,
            "iv_atm": 0.0,
            "spot": 5200.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 320,
            "iv_atm": 0.0,
            "spot": 5200.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 348,
            "iv_atm": 0.0,
            "spot": 5200.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5200.0,
                    "lower": 5200.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        }
    ],
    "term_structure": {
        "expiries": [
            "2026-04-01 00:00:00",
            "2026-04-01 00:00:00",
            "2026-05-01 00:00:00",
            "2026-05-01 00:00:00",
            "2026-06-01 00:00:00",
            "2026-06-01 00:00:00",
            "2026-07-01 00:00:00",
            "2026-07-01 00:00:00",
            "2026-08-03 00:00:00",
            "2026-08-03 00:00:00",
            "2026-09-01 00:00:00",
            "2026-09-01 00:00:00",
            "2026-10-01 00:00:00",
            "2026-10-01 00:00:00",
            "2026-11-02 00:00:00",
            "2026-11-02 00:00:00",
            "2026-12-01 00:00:00",
            "2026-12-01 00:00:00",
            "2027-01-01 00:00:00",
            "2027-01-01 00:00:00",
            "2027-02-01 00:00:00",
            "2027-02-01 00:00:00",
            "2027-03-01 00:00:00",
            "2027-03-01 00:00:00"
        ],
        "iv_atm": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            4500.0,
            5000.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0,
            5425.0,
            5500.0,
            5600.0,
            5700.0,
            5800.0,
            6000.0,
            6200.0
        ],
        "charm": [
            -0.8440959045312102,
            -1370.0270203990037,
            15.884020382340758,
            354.4084760866709,
            10.926225143929186,
            4979.130258733351,
            10038.636780141327,
            8267.729832877654,
            119.65849928073004,
            4200.8419659440315,
            3943.6931261500326,
            11.984815981785877,
            30.835939380478294,
            3909.633990308115,
            244.21807149595276
        ],
        "vanna": [
            -14.808126022021973,
            -16591.391282539385,
            -221.83727701811762,
            -1474.6449768216883,
            -62.90292683970047,
            2933.747675115884,
            7241.5225919355435,
            5422.27954532417,
            264.5863690883579,
            2928.0219080340457,
            7695.603565458137,
            9.10054028424629,
            208.68997801783618,
            25199.91024698462,
            2141.3935044890395
        ],
        "vex": [
            4088.2779970543597,
            6950848.284628701,
            236823.1623414135,
            2471411.832027867,
            147804.0045563213,
            539984.1092369542,
            1339394.739312225,
            481900.6156726976,
            123759.06900387998,
            661580.8801231207,
            1825924.7173216813,
            290.8452494527392,
            223608.90224523767,
            8709701.122282984,
            917476.0103333251
        ],
        "theta": [
            -1.0174461053004018,
            -3572.8689778268035,
            -69.23964066930127,
            -996.7356222864461,
            -30.292346663914003,
            -3299.664430538974,
            -5528.544735997848,
            -2830.2247866353873,
            -178.95266192976973,
            -1188.2666109364754,
            -2473.3891869543495,
            -1.6337253767443471,
            -90.5508123130453,
            3235.041398426843,
            -373.4814028690878
        ],
        "charm_cum": [
            -0.8440959045312102,
            -1370.871116303535,
            -1354.9870959211942,
            -1000.5786198345234,
            -989.6523946905942,
            3989.477864042757,
            14028.114644184085,
            22295.84447706174,
            22415.502976342468,
            26616.3449422865,
            30560.038068436534,
            30572.02288441832,
            30602.858823798797,
            34512.49281410691,
            34756.710885602864
        ],
        "vanna_cum": [
            -14.808126022021973,
            -16606.199408561406,
            -16828.036685579522,
            -18302.68166240121,
            -18365.58458924091,
            -15431.836914125026,
            -8190.3143221894825,
            -2768.034776865313,
            -2503.448407776955,
            424.5735002570909,
            8120.177065715228,
            8129.277605999475,
            8337.967584017311,
            33537.877831001926,
            35679.271335490965
        ],
        "theta_cum": [
            -1.0174461053004018,
            -3573.8864239321038,
            -3643.1260646014052,
            -4639.861686887852,
            -4670.154033551766,
            -7969.81846409074,
            -13498.363200088588,
            -16328.587986723975,
            -16507.540648653743,
            -17695.80725959022,
            -20169.19644654457,
            -20170.830171921316,
            -20261.38098423436,
            -17026.33958580752,
            -17399.82098867661
        ],
        "r_gamma": [
            5110.298826805312,
            18748820.102293868,
            490386.7264177981,
            -5855876.549241133,
            -155059.2222909433,
            -10063244.377175145,
            -16691000.790196385,
            -8980789.578934586,
            -469821.62080088066,
            -3513620.9773664717,
            -7031288.046031676,
            -5420.246209317672,
            -184093.92929586332,
            -12573744.546305543,
            -904234.5715033861
        ],
        "r_gamma_cum": [
            5110.298826805312,
            18753930.401120674,
            19244317.127538472,
            13388440.57829734,
            13233381.356006397,
            3170136.978831252,
            -13520863.811365133,
            -22501653.39029972,
            -22971475.011100598,
            -26485095.988467067,
            -33516384.034498744,
            -33521804.28070806,
            -33705898.21000392,
            -46279642.756309465,
            -47183877.32781285
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.42567011922310827,
            "gamma": 5110.298826805312,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -1712.6277456660634,
            "gamma": 18748820.102293868,
            "volume": 160,
            "oi": 8900,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -66.53091718968733,
            "gamma": 490386.7264177981,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -724.2196720219949,
            "gamma": 6219124.654620642,
            "volume": 215,
            "oi": 2160,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -11.302089590409054,
            "gamma": 155059.2222909433,
            "volume": 40,
            "oi": 85,
            "iv": 11.82
        },
        {
            "strike": 5300.0,
            "delta": 391.92902438661423,
            "gamma": 10063244.377175145,
            "volume": 25,
            "oi": 1560,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": 707.9358296695433,
            "gamma": 16691000.790196385,
            "volume": 1100,
            "oi": 3700,
            "iv": 11.82
        },
        {
            "strike": 5400.0,
            "delta": 236.2843238967571,
            "gamma": 8980789.578934586,
            "volume": 100,
            "oi": 3080,
            "iv": 11.82
        },
        {
            "strike": 5425.0,
            "delta": 43.62292847069881,
            "gamma": 469821.62080088066,
            "volume": 150,
            "oi": 150,
            "iv": 11.82
        },
        {
            "strike": 5500.0,
            "delta": 180.9337069002681,
            "gamma": 3513620.9773664717,
            "volume": 9740,
            "oi": 4295,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 449.75199900966925,
            "gamma": 7031288.046031676,
            "volume": 2500,
            "oi": 4900,
            "iv": 11.82
        },
        {
            "strike": 5700.0,
            "delta": 0.06932253099074431,
            "gamma": 5420.246209317672,
            "volume": 105,
            "oi": 465,
            "iv": 11.82
        },
        {
            "strike": 5800.0,
            "delta": 39.15539963666012,
            "gamma": 184093.92929586332,
            "volume": 120,
            "oi": 120,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5739.909249065597,
            "gamma": 12573744.546305543,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 115.08529787076638,
            "gamma": 904234.5715033861,
            "volume": 500,
            "oi": 1000,
            "iv": 11.82
        }
    ]
};