window.marketData = {
    "last_updated": "2026-03-18 14:02:55",
    "spot_price": 5223.5,
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-03-18",
        "meetings": [
            {
                "date": "2026-03-18",
                "days_remaining": 0,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 1.3,
                    "3.50-3.75": 100.0,
                    "3.75-4.00": 2.1
                }
            },
            {
                "date": "2026-04-29",
                "days_remaining": 41,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.1,
                    "3.25-3.50": 2.1,
                    "3.50-3.75": 100.0,
                    "3.75-4.00": 2.1
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 90,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.4,
                    "3.25-3.50": 16.5,
                    "3.50-3.75": 83.5,
                    "3.75-4.00": 1.7
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 132,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 2.6,
                    "3.25-3.50": 26.9,
                    "3.50-3.75": 70.6,
                    "3.75-4.00": 1.3
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 181,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.4,
                    "3.00-3.25": 6.6,
                    "3.25-3.50": 34.1,
                    "3.50-3.75": 58.9,
                    "3.75-4.00": 1.0
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 223,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 1.1,
                    "3.00-3.25": 9.7,
                    "3.25-3.50": 36.9,
                    "3.50-3.75": 52.1,
                    "3.75-4.00": 0.8
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 265,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.3,
                    "2.75-3.00": 3.2,
                    "3.00-3.25": 16.3,
                    "3.25-3.50": 40.6,
                    "3.50-3.75": 39.6,
                    "3.75-4.00": 0.6
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 18/03/2026 14:02\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(2);\n  spot(5223.50);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 4500.00;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (4500.00)\n  // 2 = Spline (4974.67)\n  // 3 = HVL (4500.00)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (4500.00)\n  // 7 = HVL Gaussian (4500.00)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 4500.00;\n  if (ModeloFlip = 2) then GammaVal := 4974.67;\n  if (ModeloFlip = 3) then GammaVal := 4500.00;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 4500.00;\n  if (ModeloFlip = 7) then GammaVal := 4500.00;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirMaxPain) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirRange) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5184.61 <= LimitUpper) and (5184.61 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5184.61, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5262.39 <= LimitUpper) and (5262.39 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5262.39, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirRange) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5455.56 <= LimitUpper) and (5455.56 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5455.56, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5500.00 <= LimitUpper) and (5500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5750.00 <= LimitUpper) and (5750.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5750.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5800.00 <= LimitUpper) and (5800.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5800.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5546.60 > 0) then\n      HorizontalLineCustom(5546.60, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5300.00 <= LimitUpper) and (5300.00 >= LimitLower) then\n      HorizontalLineCustom(5300.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5450.00 <= LimitUpper) and (5450.00 >= LimitLower) then\n      HorizontalLineCustom(5450.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5550.00 <= LimitUpper) and (5550.00 >= LimitLower) then\n      HorizontalLineCustom(5550.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5675.00 <= LimitUpper) and (5675.00 >= LimitLower) then\n      HorizontalLineCustom(5675.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5775.00 <= LimitUpper) and (5775.00 >= LimitLower) then\n      HorizontalLineCustom(5775.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5900.00 <= LimitUpper) and (5900.00 >= LimitLower) then\n      HorizontalLineCustom(5900.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5438.20 <= LimitUpper) and (5438.20 >= LimitLower) then\n      HorizontalLineCustom(5438.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5461.80 <= LimitUpper) and (5461.80 >= LimitLower) then\n      HorizontalLineCustom(5461.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5538.20 <= LimitUpper) and (5538.20 >= LimitLower) then\n      HorizontalLineCustom(5538.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5657.30 <= LimitUpper) and (5657.30 >= LimitLower) then\n      HorizontalLineCustom(5657.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5692.70 <= LimitUpper) and (5692.70 >= LimitLower) then\n      HorizontalLineCustom(5692.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5769.10 <= LimitUpper) and (5769.10 >= LimitLower) then\n      HorizontalLineCustom(5769.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5780.90 <= LimitUpper) and (5780.90 >= LimitLower) then\n      HorizontalLineCustom(5780.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5876.40 <= LimitUpper) and (5876.40 >= LimitLower) then\n      HorizontalLineCustom(5876.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5923.60 <= LimitUpper) and (5923.60 >= LimitLower) then\n      HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5273.60 <= LimitUpper) and (5273.60 >= LimitLower) then\n      HorizontalLineCustom(5273.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5326.40 <= LimitUpper) and (5326.40 >= LimitLower) then\n      HorizontalLineCustom(5326.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5423.60 <= LimitUpper) and (5423.60 >= LimitLower) then\n      HorizontalLineCustom(5423.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5476.40 <= LimitUpper) and (5476.40 >= LimitLower) then\n      HorizontalLineCustom(5476.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5523.60 <= LimitUpper) and (5523.60 >= LimitLower) then\n      HorizontalLineCustom(5523.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5576.40 <= LimitUpper) and (5576.40 >= LimitLower) then\n      HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5635.40 <= LimitUpper) and (5635.40 >= LimitLower) then\n      HorizontalLineCustom(5635.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5714.60 <= LimitUpper) and (5714.60 >= LimitLower) then\n      HorizontalLineCustom(5714.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5761.80 <= LimitUpper) and (5761.80 >= LimitLower) then\n      HorizontalLineCustom(5761.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5788.20 <= LimitUpper) and (5788.20 >= LimitLower) then\n      HorizontalLineCustom(5788.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5847.20 <= LimitUpper) and (5847.20 >= LimitLower) then\n      HorizontalLineCustom(5847.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5952.80 <= LimitUpper) and (5952.80 >= LimitLower) then\n      HorizontalLineCustom(5952.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5231.34, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5215.66, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5239.17, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5207.83, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5253.72, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5193.28, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5261.56, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5185.44, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 39285,
        "total_volume": 5225,
        "gamma_exposure": 92146806.22077747,
        "delta_position": -8880.131515090956,
        "last_update": "2026-03-18T14:02:55.363768",
        "spot_price": 5223.5,
        "dealer_pressure": -0.051119311619735694,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 4500.0,
        "gamma_flip_selected": 4974.674077409135,
        "gamma_flip_model": "Spline",
        "call_wall": 5400.0,
        "put_wall": 5100.0,
        "effective_call_wall": 5455.555555555556,
        "effective_put_wall": 5100.0,
        "max_pain": 5100.0,
        "zero_gamma": 4500.0,
        "range_low": 5184.606340732155,
        "range_high": 5262.393659267846,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5262.393659267845,
                "sigma_1_down": 5184.606340732155,
                "sigma_2_up": 5301.287318535689,
                "sigma_2_down": 5145.712681464311
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5310.468866016616,
                "sigma_1_down": 5136.531133983384,
                "sigma_2_up": 5397.437732033231,
                "sigma_2_down": 5049.562267966769
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 10,
                "sigma_1_up": 5346.492549824907,
                "sigma_1_down": 5100.507450175093,
                "sigma_2_up": 5469.4850996498135,
                "sigma_2_down": 4977.5149003501865
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
                4439.974999999999,
                4471.955612244898,
                4503.936224489796,
                4535.916836734694,
                4567.897448979591,
                4599.878061224489,
                4631.858673469387,
                4663.839285714285,
                4695.819897959183,
                4727.800510204081,
                4759.781122448979,
                4791.761734693877,
                4823.742346938775,
                4855.722959183673,
                4887.703571428571,
                4919.684183673469,
                4951.6647959183665,
                4983.645408163265,
                5015.626020408163,
                5047.606632653061,
                5079.587244897959,
                5111.567857142856,
                5143.548469387754,
                5175.529081632652,
                5207.5096938775505,
                5239.490306122449,
                5271.470918367347,
                5303.451530612245,
                5335.432142857142,
                5367.41275510204,
                5399.393367346938,
                5431.373979591836,
                5463.3545918367345,
                5495.335204081632,
                5527.315816326531,
                5559.296428571428,
                5591.277040816326,
                5623.257653061224,
                5655.238265306122,
                5687.21887755102,
                5719.1994897959175,
                5751.180102040816,
                5783.160714285714,
                5815.141326530612,
                5847.12193877551,
                5879.102551020407,
                5911.083163265306,
                5943.063775510203,
                5975.0443877551015,
                6007.025
            ],
            "deltas": [
                -27449.371147808826,
                -27295.215726300292,
                -27113.044621582783,
                -26899.70485193526,
                -26651.979760474598,
                -26366.616299901834,
                -26040.35529609953,
                -25669.951758306335,
                -25252.148902001994,
                -24783.54005495387,
                -24260.238141272956,
                -23677.312737639542,
                -23028.091052842545,
                -22303.65003791774,
                -21493.056306656075,
                -20584.944867135233,
                -19570.67316057609,
                -18448.52977811956,
                -17227.61544238612,
                -15929.578557494135,
                -14586.823622139897,
                -13237.111193281913,
                -11916.06549725186,
                -10650.162301600882,
                -9452.68971306396,
                -8323.974164774909,
                -7255.443903586054,
                -6235.678396679979,
                -5256.0553521583,
                -4314.0753962140025,
                -3413.588101861941,
                -2562.4039990815054,
                -1768.6413205533797,
                -1037.3577333410121,
                -368.60565990211836,
                242.6886298607818,
                805.3327286687993,
                1329.6993222749588,
                1825.5823777827666,
                2300.6654154429693,
                2759.8528874751596,
                3205.403749748863,
                3637.605524786221,
                4055.6601397090417,
                4458.496294573357,
                4845.331171683823,
                5215.927541155399,
                5570.591447391577,
                5910.009523872499,
                6235.032237199921
            ],
            "flip_value": 5546.599874558412
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                0.0,
                120.0,
                20.0,
                200.0,
                1900.0,
                240.0,
                500.0,
                200.0,
                120.0,
                30.0,
                500.0
            ],
            "bear": [
                -15.0,
                -160.0,
                -875.0,
                -200.0,
                -95.0,
                -20.0,
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
                4439.974999999999,
                4471.955612244898,
                4503.936224489796,
                4535.916836734694,
                4567.897448979591,
                4599.878061224489,
                4631.858673469387,
                4663.839285714285,
                4695.819897959183,
                4727.800510204081,
                4759.781122448979,
                4791.761734693877,
                4823.742346938775,
                4855.722959183673,
                4887.703571428571,
                4919.684183673469,
                4951.6647959183665,
                4983.645408163265,
                5015.626020408163,
                5047.606632653061,
                5079.587244897959,
                5111.567857142856,
                5143.548469387754,
                5175.529081632652,
                5207.5096938775505,
                5239.490306122449,
                5271.470918367347,
                5303.451530612245,
                5335.432142857142,
                5367.41275510204,
                5399.393367346938,
                5431.373979591836,
                5463.3545918367345,
                5495.335204081632,
                5527.315816326531,
                5559.296428571428,
                5591.277040816326,
                5623.257653061224,
                5655.238265306122,
                5687.21887755102,
                5719.1994897959175,
                5751.180102040816,
                5783.160714285714,
                5815.141326530612,
                5847.12193877551,
                5879.102551020407,
                5911.083163265306,
                5943.063775510203,
                5975.0443877551015,
                6007.025
            ],
            "pnl": [
                -25398871.463835258,
                -24211872.29411627,
                -23024930.837203085,
                -21838049.379678935,
                -20651230.87426197,
                -19464490.581746086,
                -18277883.259167932,
                -17091560.058613546,
                -15905876.459935986,
                -14721575.526716448,
                -13540061.670816023,
                -12363751.941104766,
                -11196445.31366862,
                -10043599.81376604,
                -8912378.938572947,
                -7811349.263735847,
                -6749789.288228878,
                -5736685.897992889,
                -4779606.479397287,
                -3883695.8974033305,
                -3051032.034840365,
                -2280485.8743386315,
                -1568102.8731284756,
                -907893.846602466,
                -292833.7129521072,
                284162.10551019013,
                829478.5693457024,
                1348371.493141397,
                1844878.8904055748,
                2321996.9312821925,
                2781994.306112634,
                3226735.4254908348,
                3657918.2143546278,
                4077186.3228456457,
                4486125.568841674,
                4886183.990408896,
                5278559.367407979,
                5664083.92301611,
                6043115.658645489,
                6415431.722874774,
                6780118.739204112,
                7135468.44135458,
                7478907.840380518,
                7807010.478173045,
                8115637.514158597,
                8400237.341095023,
                8656291.972809564,
                8879849.626454614,
                9068044.23805472,
                9219491.210562676
            ]
        },
        "max_pain_profile": {
            "strikes": [
                4500.0,
                5000.0,
                5100.0,
                5150.0,
                5200.0,
                5250.0,
                5350.0,
                5400.0,
                5500.0,
                5600.0,
                5750.0,
                5800.0,
                6000.0,
                6200.0
            ],
            "loss": [
                22514750.0,
                8469750.0,
                6550750.0,
                6084000.0,
                5627250.0,
                5278500.0,
                4589500.0,
                4255000.0,
                3904000.0,
                3577000.0,
                3161500.0,
                3053000.0,
                2643000.0,
                4679000.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5400.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 732.4197195753777,
                        "Call_Sim": 908.9197195741908,
                        "Call_Chg": 24.098204251127953,
                        "Put_Now": 1.1880440772862751e-09,
                        "Put_Sim": 3.5751978177344574e-14,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 234.6030580279139,
                        "Call_Sim": 409.92351153007803,
                        "Call_Chg": 74.73067698942947,
                        "Put_Now": 1.192258501036207,
                        "Put_Sim": 0.012712003200096245,
                        "Put_Chg": -98.93378800075251
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 141.9322366524666,
                        "Call_Sim": 310.34751326915466,
                        "Call_Chg": 118.65893231082343,
                        "Put_Now": 8.323221135051654,
                        "Put_Sim": 0.23849775173891175,
                        "Put_Chg": -97.13454985913418
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 101.5529538900164,
                        "Call_Sim": 261.0161423323543,
                        "Call_Chg": 157.02466775613374,
                        "Put_Now": 17.844830377332528,
                        "Put_Sim": 0.8080188196702665,
                        "Put_Chg": -95.47197254003234
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 67.65844806763425,
                        "Call_Sim": 212.65928760949737,
                        "Call_Chg": 214.3129848277249,
                        "Put_Now": 33.851216559681916,
                        "Put_Sim": 2.3520561015442922,
                        "Put_Chg": -93.05178265189535
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 41.51333988546503,
                        "Call_Sim": 166.34645306822586,
                        "Call_Chg": 300.70602251511053,
                        "Put_Now": 57.607000382243314,
                        "Put_Sim": 5.940113565003799,
                        "Put_Chg": -89.68855603383444
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 11.772532946651268,
                        "Call_Sim": 86.42714912747715,
                        "Call_Chg": 634.1423423415571,
                        "Put_Now": 127.66797745289205,
                        "Put_Sim": 25.82259363371827,
                        "Put_Chg": -79.77363302144698
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.367924644624111,
                        "Call_Sim": 56.205064215686434,
                        "Call_Chg": 947.0538976730028,
                        "Put_Now": 171.16426115559625,
                        "Put_Sim": 45.50140072665772,
                        "Put_Chg": -73.41652958423673
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8012781995651324,
                        "Call_Sim": 18.47030206176032,
                        "Call_Chg": 2205.104777814307,
                        "Put_Now": 266.3993987199992,
                        "Put_Sim": 107.56842258219422,
                        "Put_Chg": -59.62137185780412
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.0759624391926863,
                        "Call_Sim": 4.147547363852709,
                        "Call_Chg": 5359.997609255334,
                        "Put_Now": 365.47586696909,
                        "Put_Sim": 193.0474518937499,
                        "Put_Chg": -47.17915207515554
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 732.4197195753777,
                        "Call_Sim": 608.9197202285704,
                        "Call_Chg": -16.86191619996342,
                        "Put_Now": 1.1880440772862751e-09,
                        "Put_Sim": 6.54380357686886e-07,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 234.6030580279139,
                        "Call_Sim": 121.29710366087738,
                        "Call_Chg": -48.296878702047856,
                        "Put_Now": 1.192258501036207,
                        "Put_Sim": 11.386304133999033,
                        "Put_Chg": 855.0197481588978
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 141.9322366524666,
                        "Call_Sim": 53.082560648148046,
                        "Call_Chg": -62.600067539184,
                        "Put_Now": 8.323221135051654,
                        "Put_Sim": 42.97354513073242,
                        "Put_Chg": 416.30906392427266
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 101.5529538900164,
                        "Call_Sim": 30.792909247019452,
                        "Call_Chg": -69.67797777663,
                        "Put_Now": 17.844830377332528,
                        "Put_Sim": 70.58478573433467,
                        "Put_Chg": 295.5475296867786
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 67.65844806763425,
                        "Call_Sim": 16.153030885890985,
                        "Call_Chg": -76.1256260714941,
                        "Put_Now": 33.851216559681916,
                        "Put_Sim": 105.84579937793933,
                        "Put_Chg": 212.67945478806126
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 41.51333988546503,
                        "Call_Sim": 7.606993379680034,
                        "Call_Chg": -81.67578566150624,
                        "Put_Now": 57.607000382243314,
                        "Put_Sim": 147.200653876459,
                        "Put_Chg": 155.52563559937047
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 11.772532946651268,
                        "Call_Sim": 1.197262839537558,
                        "Call_Chg": -89.83003194840815,
                        "Put_Now": 127.66797745289205,
                        "Put_Sim": 240.59270734577785,
                        "Put_Chg": 88.45188288077462
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.367924644624111,
                        "Call_Sim": 0.39787953775774554,
                        "Call_Chg": -92.58783302488764,
                        "Put_Now": 171.16426115559625,
                        "Put_Sim": 289.6942160487288,
                        "Put_Chg": 69.24924285764497
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8012781995651324,
                        "Call_Sim": 0.030675888928096917,
                        "Call_Chg": -96.17163065902139,
                        "Put_Now": 266.3993987199992,
                        "Put_Sim": 389.1287964093626,
                        "Put_Chg": 46.06969770917498
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.0759624391926863,
                        "Call_Sim": 0.0014684375659615445,
                        "Call_Chg": -98.06688992406272,
                        "Put_Now": 365.47586696909,
                        "Put_Sim": 488.9013729674625,
                        "Put_Chg": 33.77117811415197
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 732.4197195753777,
                        "Call_Sim": 46.837553513071725,
                        "Call_Chg": -93.60509387428483,
                        "Put_Now": 1.1880440772862751e-09,
                        "Put_Sim": 37.91783393888181,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 234.6030580279139,
                        "Call_Sim": 0.00013169805050343777,
                        "Call_Chg": -99.99994386345531,
                        "Put_Now": 1.192258501036207,
                        "Put_Sim": 490.0893321711728,
                        "Put_Chg": 41005.96248592314
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 141.9322366524666,
                        "Call_Sim": 1.6984774866155776e-06,
                        "Call_Chg": -99.99999880331802,
                        "Put_Now": 8.323221135051654,
                        "Put_Sim": 589.8909861810625,
                        "Put_Chg": 6987.292006418639
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 101.5529538900164,
                        "Call_Sim": 1.5589218567148663e-07,
                        "Call_Chg": -99.99999984649173,
                        "Put_Now": 17.844830377332528,
                        "Put_Sim": 639.7918766432076,
                        "Put_Chg": 3485.306574031132
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 67.65844806763425,
                        "Call_Sim": 1.2467518412653701e-08,
                        "Call_Chg": -99.99999998157286,
                        "Put_Now": 33.851216559681916,
                        "Put_Sim": 689.6927685045148,
                        "Put_Chg": 1937.4238760032188
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 41.51333988546503,
                        "Call_Sim": 8.716668752651267e-10,
                        "Call_Chg": -99.99999999790028,
                        "Put_Now": 57.607000382243314,
                        "Put_Sim": 739.5936604976496,
                        "Put_Chg": 1183.8607384348738
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 11.772532946651268,
                        "Call_Sim": 2.884560439690171e-12,
                        "Call_Chg": -99.9999999999755,
                        "Put_Now": 127.66797745289205,
                        "Put_Sim": 839.3954445062436,
                        "Put_Chg": 557.4831537657675
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.367924644624111,
                        "Call_Sim": 1.3743570894583737e-13,
                        "Call_Chg": -99.99999999999744,
                        "Put_Now": 171.16426115559625,
                        "Put_Sim": 889.2963365109717,
                        "Put_Chg": 419.55725483052805
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8012781995651324,
                        "Call_Sim": 2.175159979771622e-16,
                        "Call_Chg": -99.99999999999997,
                        "Put_Now": 266.3993987199992,
                        "Put_Sim": 989.0981205204343,
                        "Put_Chg": 271.2839162824208
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.0759624391926863,
                        "Call_Sim": 2.1734029248899474e-19,
                        "Call_Chg": -100.0,
                        "Put_Now": 365.47586696909,
                        "Put_Sim": 1088.899904529897,
                        "Put_Chg": 197.94030275109526
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5275.735,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 732.4197195753777,
                        "Call_Sim": 784.6547195742542,
                        "Call_Chg": 7.131839654612225,
                        "Put_Now": 1.1880440772862751e-09,
                        "Put_Sim": 6.435108499612576e-11,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 234.6030580279139,
                        "Call_Sim": 286.01183280897567,
                        "Call_Chg": 21.913088095784737,
                        "Put_Now": 1.192258501036207,
                        "Put_Sim": 0.36603328209847774,
                        "Put_Chg": -69.29916777440852
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 141.9322366524666,
                        "Call_Sim": 189.23601800985762,
                        "Call_Chg": 33.328426630250625,
                        "Put_Now": 8.323221135051654,
                        "Put_Sim": 3.3920024924422023,
                        "Put_Chg": -59.24651721486249
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 101.5529538900164,
                        "Call_Sim": 144.2126079380123,
                        "Call_Chg": 42.007300047812535,
                        "Put_Now": 17.844830377332528,
                        "Put_Sim": 8.2694844253283,
                        "Put_Chg": -53.658935106311525
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 67.65844806763425,
                        "Call_Sim": 103.69408531729141,
                        "Call_Chg": 53.26110527045256,
                        "Put_Now": 33.851216559681916,
                        "Put_Sim": 17.651853809338718,
                        "Put_Chg": -47.854595481916164
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 41.51333988546503,
                        "Call_Sim": 69.54706257482349,
                        "Call_Chg": 67.52943214567479,
                        "Put_Now": 57.607000382243314,
                        "Put_Sim": 33.4057230716021,
                        "Put_Chg": -42.01100065974096
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 11.772532946651268,
                        "Call_Sim": 24.357056884707617,
                        "Call_Chg": 106.89733462700613,
                        "Put_Now": 127.66797745289205,
                        "Put_Sim": 88.01750139094929,
                        "Put_Chg": -31.05749527251131
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.367924644624111,
                        "Call_Sim": 12.505702373926738,
                        "Call_Chg": 132.97090033577493,
                        "Put_Now": 171.16426115559625,
                        "Put_Sim": 126.06703888489847,
                        "Put_Chg": -26.347335574744964
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8012781995651324,
                        "Call_Sim": 2.4103681634631187,
                        "Call_Chg": 200.81539280255814,
                        "Put_Now": 266.3993987199992,
                        "Put_Sim": 215.773488683898,
                        "Put_Chg": -19.003762876098648
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.0759624391926863,
                        "Call_Sim": 0.29974541753837514,
                        "Call_Chg": 294.5968833070789,
                        "Put_Now": 365.47586696909,
                        "Put_Sim": 313.46464994743565,
                        "Put_Chg": -14.231094778702092
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5171.265,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 732.4197195753777,
                        "Call_Sim": 680.1847195931687,
                        "Call_Chg": -7.131839652336564,
                        "Put_Now": 1.1880440772862751e-09,
                        "Put_Sim": 1.8979226769738623e-08,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 234.6030580279139,
                        "Call_Sim": 184.56574941461622,
                        "Call_Chg": -21.328498031489456,
                        "Put_Now": 1.192258501036207,
                        "Put_Sim": 3.389949887738908,
                        "Put_Chg": 184.33010834417698
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 141.9322366524666,
                        "Call_Sim": 99.4177085571514,
                        "Call_Chg": -29.954102815568046,
                        "Put_Now": 8.323221135051654,
                        "Put_Sim": 18.043693039735444,
                        "Put_Chg": 116.78738011354622
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 101.5529538900164,
                        "Call_Sim": 65.78239675305849,
                        "Call_Chg": -35.223551621844535,
                        "Put_Now": 17.844830377332528,
                        "Put_Sim": 34.30927324037384,
                        "Put_Chg": 92.26449629891323
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 67.65844806763425,
                        "Call_Sim": 40.002023298188305,
                        "Call_Chg": -40.87652844445887,
                        "Put_Now": 33.851216559681916,
                        "Put_Sim": 58.42979179023541,
                        "Put_Chg": 72.60765706077315
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 41.51333988546503,
                        "Call_Sim": 22.138674126066917,
                        "Call_Chg": -46.67093954100696,
                        "Put_Now": 57.607000382243314,
                        "Put_Sim": 90.46733462284465,
                        "Put_Chg": 57.04225879244035
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 11.772532946651268,
                        "Call_Sim": 4.963895000354455,
                        "Call_Chg": -57.83494492774853,
                        "Put_Now": 127.66797745289205,
                        "Put_Sim": 173.09433950659422,
                        "Put_Chg": 35.581641504788436
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.367924644624111,
                        "Call_Sim": 1.9909763822736295,
                        "Call_Chg": -62.90975536946928,
                        "Put_Now": 171.16426115559625,
                        "Put_Sim": 220.02231289324482,
                        "Put_Chg": 28.544540436063535
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8012781995651324,
                        "Call_Sim": 0.22672287774079436,
                        "Call_Chg": -71.70484884477816,
                        "Put_Now": 266.3993987199992,
                        "Put_Sim": 318.0598433981759,
                        "Put_Chg": 19.39210258221141
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.0759624391926863,
                        "Call_Sim": 0.016204855698937592,
                        "Call_Chg": -78.66727836657225,
                        "Put_Now": 365.47586696909,
                        "Put_Sim": 417.6511093855952,
                        "Put_Chg": 14.275974731025912
                    }
                ]
            }
        ],
        "fair_value_sims_nearest": [
            {
                "scenario": "Call Wall",
                "target_spot": 5400.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 141.9322366524666,
                        "Call_Sim": 310.34751326915466,
                        "Call_Chg": 118.65893231082343,
                        "Put_Now": 8.323221135051654,
                        "Put_Sim": 0.23849775173891175,
                        "Put_Chg": -97.13454985913418
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.367924644624111,
                        "Call_Sim": 56.205064215686434,
                        "Call_Chg": 947.0538976730028,
                        "Put_Now": 171.16426115559625,
                        "Put_Sim": 45.50140072665772,
                        "Put_Chg": -73.41652958423673
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0009449320136607486,
                        "Call_Sim": 0.20258220094995494,
                        "Call_Chg": 0.0,
                        "Put_Now": 515.1035254761036,
                        "Put_Sim": 338.80516274504043,
                        "Put_Chg": -34.22581170806643
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 141.9322366524666,
                        "Call_Sim": 53.082560648148046,
                        "Call_Chg": -62.600067539184,
                        "Put_Now": 8.323221135051654,
                        "Put_Sim": 42.97354513073242,
                        "Put_Chg": 416.30906392427266
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.367924644624111,
                        "Call_Sim": 0.39787953775774554,
                        "Call_Chg": -92.58783302488764,
                        "Put_Now": 171.16426115559625,
                        "Put_Sim": 289.6942160487288,
                        "Put_Chg": 69.24924285764497
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0009449320136607486,
                        "Call_Sim": 6.439484378330425e-06,
                        "Call_Chg": 0.0,
                        "Put_Now": 515.1035254761036,
                        "Put_Sim": 638.6025869835748,
                        "Put_Chg": 23.97558071327945
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5750.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 141.9322366524666,
                        "Call_Sim": 660.1090180871297,
                        "Call_Chg": 365.0874485290216,
                        "Put_Now": 8.323221135051654,
                        "Put_Sim": 2.5697146345701706e-06,
                        "Put_Chg": -99.99996912595985
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.367924644624111,
                        "Call_Sim": 360.8209654865068,
                        "Call_Chg": 6621.796399430888,
                        "Put_Now": 171.16426115559625,
                        "Put_Sim": 0.11730199747811199,
                        "Put_Chg": -99.93146817175142
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0009449320136607486,
                        "Call_Sim": 59.84798504448099,
                        "Call_Chg": 0.0,
                        "Put_Now": 515.1035254761036,
                        "Put_Sim": 48.45056558857095,
                        "Put_Chg": -90.59401398121112
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5275.735,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 141.9322366524666,
                        "Call_Sim": 189.23601800985762,
                        "Call_Chg": 33.328426630250625,
                        "Put_Now": 8.323221135051654,
                        "Put_Sim": 3.3920024924422023,
                        "Put_Chg": -59.24651721486249
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.367924644624111,
                        "Call_Sim": 12.505702373926738,
                        "Call_Chg": 132.97090033577493,
                        "Put_Now": 171.16426115559625,
                        "Put_Sim": 126.06703888489847,
                        "Put_Chg": -26.347335574744964
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0009449320136607486,
                        "Call_Sim": 0.0056844816021074385,
                        "Call_Chg": 0.0,
                        "Put_Now": 515.1035254761036,
                        "Put_Sim": 462.8732650256925,
                        "Put_Chg": -10.139759847719036
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5171.265,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 141.9322366524666,
                        "Call_Sim": 99.4177085571514,
                        "Call_Chg": -29.954102815568046,
                        "Put_Now": 8.323221135051654,
                        "Put_Sim": 18.043693039735444,
                        "Put_Chg": 116.78738011354622
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.367924644624111,
                        "Call_Sim": 1.9909763822736295,
                        "Call_Chg": -62.90975536946928,
                        "Put_Now": 171.16426115559625,
                        "Put_Sim": 220.02231289324482,
                        "Put_Chg": 28.544540436063535
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0009449320136607486,
                        "Call_Sim": 0.0001306499636677498,
                        "Call_Chg": 0.0,
                        "Put_Now": 515.1035254761036,
                        "Put_Sim": 567.3377111940536,
                        "Put_Chg": 10.140521882406167
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.000136112808357152,
            -0.15031301140991699,
            -0.26060570564987084,
            -0.0020220419614289846,
            -0.005083112127314902,
            -1.675710455965526e-05,
            0.01213105874449587,
            0.32433862241114414,
            0.009463629256267444,
            0.02321563909639346,
            0.00013102578386661439,
            0.005457276090350868,
            0.15617640149513282,
            0.03699514131889073
        ],
        "flip_variations": {
            "Classic": 4500.0,
            "Spline": 4974.674077409135,
            "HVL": 4500.0,
            "HVL Log": 4500.0,
            "Sigma Kernel": 4500.0,
            "PVOP": 4500.0,
            "HVL Gaussian": 4500.0
        }
    },
    "delta_data": {
        "strikes": [
            4500.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0,
            5400.0,
            5500.0,
            5600.0,
            5750.0,
            5800.0,
            6000.0,
            6200.0
        ],
        "delta_values": [
            -0.3784234730663516,
            -1542.4511038565101,
            -1820.8466814475842,
            -62.20827159875866,
            -669.7165245819895,
            -9.952932730182953,
            82.5608514495423,
            299.5730611234614,
            123.67408119204597,
            195.42018811239274,
            0.020462311577517354,
            40.70836053747455,
            -5638.982828395388,
            122.44824626602896
        ],
        "delta_cumulative": [
            -0.3784234730663516,
            -1542.8295273295764,
            -3363.6762087771604,
            -3425.884480375919,
            -4095.601004957908,
            -4105.553937688091,
            -4022.993086238548,
            -3723.420025115087,
            -3599.745943923041,
            -3404.3257558106484,
            -3404.305293499071,
            -3363.5969329615964,
            -9002.579761356985,
            -8880.131515090956
        ]
    },
    "gamma_data": {
        "strikes": [
            4500.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0,
            5400.0,
            5500.0,
            5600.0,
            5750.0,
            5800.0,
            6000.0,
            6200.0
        ],
        "gamma_values": [
            4646.2887526932145,
            17679638.620725237,
            39821192.440922566,
            479317.90191878943,
            6133597.918492775,
            153239.08915330592,
            718311.3877585578,
            11342922.70638379,
            407970.1228305221,
            950269.732444864,
            1828.833623398032,
            187327.47132835962,
            13319533.965790346,
            947009.7406522429
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            178623.70302251162,
            47370.34302615201,
            718311.3877585578,
            11342922.70638379,
            407970.1228305221,
            950269.732444864,
            1828.833623398032,
            187327.47132835962,
            5663252.381202764,
            947009.7406522429
        ],
        "gamma_put": [
            4646.2887526932145,
            17679638.620725237,
            39821192.440922566,
            479317.90191878943,
            5954974.215470264,
            105868.74612715392,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            7656281.584587582,
            0.0
        ],
        "gamma_exposure": [
            4646.2887526932145,
            17684284.90947793,
            57505477.35040049,
            57984795.252319284,
            64118393.170812055,
            64271632.25996536,
            64989943.64772392,
            76332866.35410771,
            76740836.47693823,
            77691106.2093831,
            77692935.0430065,
            77880262.51433486,
            91199796.4801252,
            92146806.22077745
        ]
    },
    "oi_data": {
        "strikes": [
            4500.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0,
            5400.0,
            5500.0,
            5600.0,
            5750.0,
            5800.0,
            6000.0,
            6200.0
        ],
        "call_oi": [
            0.0,
            0.0,
            0.0,
            0.0,
            120.0,
            20.0,
            200.0,
            3180.0,
            240.0,
            500.0,
            600.0,
            120.0,
            5200.0,
            1000.0
        ],
        "put_oi": [
            15.0,
            8900.0,
            9855.0,
            200.0,
            2040.0,
            65.0,
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
            9855.0,
            200.0,
            2160.0,
            85.0,
            200.0,
            3180.0,
            240.0,
            500.0,
            600.0,
            120.0,
            12230.0,
            1000.0
        ]
    },
    "oi_data_nearest": {
        "strikes": [
            5100.0,
            5400.0,
            5750.0
        ],
        "call_oi": [
            0.0,
            3180.0,
            600.0
        ],
        "put_oi": [
            4630.0,
            0.0,
            0.0
        ],
        "total_oi": [
            4630.0,
            3180.0,
            600.0
        ]
    },
    "gex_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 10,
            "abs_call": 11344751.540007189,
            "abs_put": 21131130.923340686,
            "net": 32475882.463347875
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 32,
            "abs_call": 0.0,
            "abs_put": 18099116.362962723,
            "net": 18099116.362962723
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 53,
            "abs_call": 718311.3877585578,
            "abs_put": 590945.1546191607,
            "net": 1309256.5423777185
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 75,
            "abs_call": 0.0,
            "abs_put": 23605981.74119635,
            "net": 23605981.74119635
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 98,
            "abs_call": 0.0,
            "abs_put": 479317.90191878943,
            "net": 479317.90191878943
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 119,
            "abs_call": 47370.34302615201,
            "abs_put": 0.0,
            "net": 47370.34302615201
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 141,
            "abs_call": 5663252.381202764,
            "abs_put": 7656281.584587582,
            "net": 13319533.965790346
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 163,
            "abs_call": 0.0,
            "abs_put": 33277.38375184355,
            "net": 33277.38375184355
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 184,
            "abs_call": 950269.732444864,
            "abs_put": 0.0,
            "net": 950269.732444864
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 207,
            "abs_call": 947009.7406522429,
            "abs_put": 0.0,
            "net": 947009.7406522429
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 228,
            "abs_call": 0.0,
            "abs_put": 105868.74612715392,
            "net": 105868.74612715392
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 248,
            "abs_call": 773921.2971813933,
            "abs_put": 0.0,
            "net": 773921.2971813933
        }
    ],
    "oi_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 10,
            "call_oi": 3780.0,
            "put_oi": 4630.0,
            "total_oi": 8410.0
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 32,
            "call_oi": 0.0,
            "put_oi": 5025.0,
            "total_oi": 5025.0
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 53,
            "call_oi": 200.0,
            "put_oi": 200.0,
            "total_oi": 400.0
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 75,
            "call_oi": 0.0,
            "put_oi": 10925.0,
            "total_oi": 10925.0
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 98,
            "call_oi": 0.0,
            "put_oi": 200.0,
            "total_oi": 200.0
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 119,
            "call_oi": 20.0,
            "put_oi": 0.0,
            "total_oi": 20.0
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 141,
            "call_oi": 5200.0,
            "put_oi": 7030.0,
            "total_oi": 12230.0
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 163,
            "call_oi": 0.0,
            "put_oi": 30.0,
            "total_oi": 30.0
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 184,
            "call_oi": 500.0,
            "put_oi": 0.0,
            "total_oi": 500.0
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 207,
            "call_oi": 1000.0,
            "put_oi": 0.0,
            "total_oi": 1000.0
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 228,
            "call_oi": 0.0,
            "put_oi": 65.0,
            "total_oi": 65.0
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 248,
            "call_oi": 480.0,
            "put_oi": 0.0,
            "total_oi": 480.0
        }
    ],
    "volume_data": {
        "strikes": [
            4500.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0,
            5400.0,
            5500.0,
            5600.0,
            5750.0,
            5800.0,
            6000.0,
            6200.0
        ],
        "call_volume": [
            0.0,
            0.0,
            0.0,
            0.0,
            120.0,
            20.0,
            200.0,
            1900.0,
            240.0,
            500.0,
            200.0,
            120.0,
            30.0,
            500.0
        ],
        "put_volume": [
            15.0,
            160.0,
            875.0,
            200.0,
            95.0,
            20.0,
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
            875.0,
            200.0,
            215.0,
            40.0,
            200.0,
            1900.0,
            240.0,
            500.0,
            200.0,
            120.0,
            60.0,
            500.0
        ]
    },
    "volatility_data": {
        "strikes": [
            4500.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0,
            5400.0,
            5500.0,
            5600.0,
            5750.0,
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
            11.82
        ],
        "skew": [
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
            -4.336808689942018e-19,
            -1.6263032587282567e-19,
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
                "strike": 5100.0,
                "type": "PUT",
                "oi": 5025,
                "volume": 175,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5100.0,
                "type": "PUT",
                "oi": 4630,
                "volume": 500,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5400.0,
                "type": "CALL",
                "oi": 3180,
                "volume": 1900,
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
                "strike": 6200.0,
                "type": "CALL",
                "oi": 1000,
                "volume": 500,
                "expiry": "2027-01-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5750.0,
                "type": "CALL",
                "oi": 600,
                "volume": 200,
                "expiry": "2026-04-01 00:00:00",
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
                "strike": 5100.0,
                "type": "PUT",
                "oi": 200,
                "volume": 200,
                "expiry": "2026-06-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5350.0,
                "type": "CALL",
                "oi": 200,
                "volume": 200,
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
            }
        ],
        "top_vol": [
            {
                "strike": 5400.0,
                "type": "CALL",
                "oi": 3180,
                "volume": 1900,
                "expiry": "2026-04-01 00:00:00",
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
                "strike": 5100.0,
                "type": "PUT",
                "oi": 4630,
                "volume": 500,
                "expiry": "2026-04-01 00:00:00",
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
                "strike": 5500.0,
                "type": "CALL",
                "oi": 240,
                "volume": 240,
                "expiry": "2027-03-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5100.0,
                "type": "PUT",
                "oi": 200,
                "volume": 200,
                "expiry": "2026-06-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5350.0,
                "type": "CALL",
                "oi": 200,
                "volume": 200,
                "expiry": "2026-06-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5750.0,
                "type": "CALL",
                "oi": 600,
                "volume": 200,
                "expiry": "2026-04-01 00:00:00",
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
                "strike": 5100.0,
                "type": "PUT",
                "oi": 5025,
                "volume": 175,
                "expiry": "2026-05-01 00:00:00",
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
                "strike": 5200.0,
                "type": "CALL",
                "oi": 120,
                "volume": 120,
                "expiry": "2027-03-01 00:00:00",
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
                "type": "PUT",
                "oi": 2025,
                "volume": 80,
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
            }
        ]
    },
    "fed_watch": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 13,
            "iv_atm": 0.0,
            "spot": 5223.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 43,
            "iv_atm": 0.0,
            "spot": 5223.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 74,
            "iv_atm": 0.0,
            "spot": 5223.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 104,
            "iv_atm": 0.0,
            "spot": 5223.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 137,
            "iv_atm": 0.0,
            "spot": 5223.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 166,
            "iv_atm": 0.0,
            "spot": 5223.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 196,
            "iv_atm": 0.0,
            "spot": 5223.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 228,
            "iv_atm": 0.0,
            "spot": 5223.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 257,
            "iv_atm": 0.0,
            "spot": 5223.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 288,
            "iv_atm": 0.0,
            "spot": 5223.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 319,
            "iv_atm": 0.0,
            "spot": 5223.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 347,
            "iv_atm": 0.0,
            "spot": 5223.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5223.5,
                    "lower": 5223.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5223.5,
                    "lower": 5223.5,
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
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0,
            5400.0,
            5500.0,
            5600.0,
            5750.0,
            5800.0,
            6000.0,
            6200.0
        ],
        "charm": [
            -0.8061734357012551,
            -1590.4266671820922,
            -13983.03055231093,
            9.84726991552849,
            258.7199502642918,
            9.832257014616802,
            122.67674552186436,
            10140.05903678933,
            44.63135234168293,
            144.7329766266261,
            4.767458194896225,
            30.60275321526472,
            4058.1838220340123,
            251.5475480006837
        ],
        "vanna": [
            -13.802241822217425,
            -16931.00072757967,
            -18515.242634852537,
            -252.11256142453564,
            -1906.7450089101733,
            -73.42443593605714,
            181.9685776938479,
            6026.975163037402,
            63.96296964229143,
            617.4146538035774,
            3.437959519795674,
            198.5858292705136,
            25732.790306477094,
            2174.2902752601876
        ],
        "vex": [
            3711.0972157259152,
            6497453.460737706,
            4026950.7613833114,
            230175.05511118573,
            2417931.593013271,
            145902.39289073722,
            186550.8154002058,
            555819.1467185122,
            495779.5061656438,
            856787.7529823259,
            89.61541662230786,
            227646.8692905094,
            9202729.838876601,
            960579.5176339572
        ],
        "theta": [
            -0.9387765935462304,
            -3464.333829972989,
            -9605.708375200802,
            -71.15689015307149,
            -1036.632044386457,
            -31.368505974231475,
            -290.3383730880984,
            -3591.984388139839,
            -234.9746444742485,
            -464.0986550293745,
            -0.5507219386896183,
            -93.35122666611083,
            2898.92089780473,
            -394.73730582691456
        ],
        "charm_cum": [
            -0.8061734357012551,
            -1591.2328406177935,
            -15574.263392928722,
            -15564.416123013194,
            -15305.696172748902,
            -15295.863915734284,
            -15173.187170212419,
            -5033.12813342309,
            -4988.496781081407,
            -4843.763804454781,
            -4838.996346259885,
            -4808.3935930446205,
            -750.2097710106082,
            -498.66222300992445
        ],
        "vanna_cum": [
            -13.802241822217425,
            -16944.802969401888,
            -35460.045604254425,
            -35712.15816567896,
            -37618.90317458913,
            -37692.32761052519,
            -37510.359032831344,
            -31483.383869793943,
            -31419.42090015165,
            -30802.00624634807,
            -30798.568286828275,
            -30599.982457557762,
            -4867.192151080668,
            -2692.90187582048
        ],
        "theta_cum": [
            -0.9387765935462304,
            -3465.272606566535,
            -13070.980981767338,
            -13142.13787192041,
            -14178.769916306866,
            -14210.138422281098,
            -14500.476795369195,
            -18092.461183509033,
            -18327.43582798328,
            -18791.534483012656,
            -18792.085204951345,
            -18885.436431617454,
            -15986.515533812724,
            -16381.25283963964
        ],
        "r_gamma": [
            4646.2887526932145,
            17679638.620725237,
            39821192.440922566,
            479317.90191878943,
            6133597.918492775,
            -153239.08915330592,
            -718311.3877585578,
            -11342922.70638379,
            -407970.1228305221,
            -950269.732444864,
            -1828.833623398032,
            -187327.47132835962,
            -13319533.965790344,
            -947009.7406522429
        ],
        "r_gamma_cum": [
            4646.2887526932145,
            17684284.90947793,
            57505477.35040049,
            57984795.252319284,
            64118393.170812055,
            63965154.08165875,
            63246842.69390019,
            51903919.9875164,
            51495949.86468588,
            50545680.13224101,
            50543851.29861762,
            50356523.82728925,
            37036989.86149891,
            36089980.12084667
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.3784234730663516,
            "gamma": 4646.2887526932145,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -1542.4511038565101,
            "gamma": 17679638.620725237,
            "volume": 160,
            "oi": 8900,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -1820.8466814475842,
            "gamma": 39821192.440922566,
            "volume": 875,
            "oi": 9855,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -62.20827159875866,
            "gamma": 479317.90191878943,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -669.7165245819895,
            "gamma": 6133597.918492775,
            "volume": 215,
            "oi": 2160,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -9.952932730182953,
            "gamma": 153239.08915330592,
            "volume": 40,
            "oi": 85,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": 82.5608514495423,
            "gamma": 718311.3877585578,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5400.0,
            "delta": 299.5730611234614,
            "gamma": 11342922.70638379,
            "volume": 1900,
            "oi": 3180,
            "iv": 11.82
        },
        {
            "strike": 5500.0,
            "delta": 123.67408119204597,
            "gamma": 407970.1228305221,
            "volume": 240,
            "oi": 240,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 195.42018811239274,
            "gamma": 950269.732444864,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        },
        {
            "strike": 5750.0,
            "delta": 0.020462311577517354,
            "gamma": 1828.833623398032,
            "volume": 200,
            "oi": 600,
            "iv": 11.82
        },
        {
            "strike": 5800.0,
            "delta": 40.70836053747455,
            "gamma": 187327.47132835962,
            "volume": 120,
            "oi": 120,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5638.982828395388,
            "gamma": 13319533.965790346,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 122.44824626602896,
            "gamma": 947009.7406522429,
            "volume": 500,
            "oi": 1000,
            "iv": 11.82
        }
    ]
};