window.marketData = {
    "last_updated": "2026-03-18 15:33:59",
    "spot_price": 5226.5,
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-03-18",
        "meetings": [
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
                    "3.25-3.50": 16.3,
                    "3.50-3.75": 83.7,
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
                    "3.00-3.25": 2.9,
                    "3.25-3.50": 28.2,
                    "3.50-3.75": 68.9,
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
                    "2.75-3.00": 0.6,
                    "3.00-3.25": 8.0,
                    "3.25-3.50": 36.5,
                    "3.50-3.75": 55.0,
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
                    "2.50-2.75": 0.1,
                    "2.75-3.00": 1.6,
                    "3.00-3.25": 11.9,
                    "3.25-3.50": 39.0,
                    "3.50-3.75": 47.4,
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
                    "2.50-2.75": 0.4,
                    "2.75-3.00": 4.1,
                    "3.00-3.25": 18.4,
                    "3.25-3.50": 41.0,
                    "3.50-3.75": 36.0,
                    "3.75-4.00": 0.6
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 18/03/2026 15:33\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(2);\n  spot(5226.50);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 4500.00;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (4500.00)\n  // 2 = Spline (4974.43)\n  // 3 = HVL (4500.00)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (4500.00)\n  // 7 = HVL Gaussian (4500.00)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 4500.00;\n  if (ModeloFlip = 2) then GammaVal := 4974.43;\n  if (ModeloFlip = 3) then GammaVal := 4500.00;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 4500.00;\n  if (ModeloFlip = 7) then GammaVal := 4500.00;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirMaxPain) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirRange) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5187.58 <= LimitUpper) and (5187.58 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5187.58, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5265.42 <= LimitUpper) and (5265.42 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5265.42, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirRange) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5455.56 <= LimitUpper) and (5455.56 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5455.56, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5500.00 <= LimitUpper) and (5500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5750.00 <= LimitUpper) and (5750.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5750.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5800.00 <= LimitUpper) and (5800.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5800.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5546.61 > 0) then\n      HorizontalLineCustom(5546.61, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5300.00 <= LimitUpper) and (5300.00 >= LimitLower) then\n      HorizontalLineCustom(5300.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5450.00 <= LimitUpper) and (5450.00 >= LimitLower) then\n      HorizontalLineCustom(5450.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5550.00 <= LimitUpper) and (5550.00 >= LimitLower) then\n      HorizontalLineCustom(5550.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5675.00 <= LimitUpper) and (5675.00 >= LimitLower) then\n      HorizontalLineCustom(5675.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5775.00 <= LimitUpper) and (5775.00 >= LimitLower) then\n      HorizontalLineCustom(5775.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5900.00 <= LimitUpper) and (5900.00 >= LimitLower) then\n      HorizontalLineCustom(5900.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5438.20 <= LimitUpper) and (5438.20 >= LimitLower) then\n      HorizontalLineCustom(5438.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5461.80 <= LimitUpper) and (5461.80 >= LimitLower) then\n      HorizontalLineCustom(5461.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5538.20 <= LimitUpper) and (5538.20 >= LimitLower) then\n      HorizontalLineCustom(5538.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5657.30 <= LimitUpper) and (5657.30 >= LimitLower) then\n      HorizontalLineCustom(5657.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5692.70 <= LimitUpper) and (5692.70 >= LimitLower) then\n      HorizontalLineCustom(5692.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5769.10 <= LimitUpper) and (5769.10 >= LimitLower) then\n      HorizontalLineCustom(5769.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5780.90 <= LimitUpper) and (5780.90 >= LimitLower) then\n      HorizontalLineCustom(5780.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5876.40 <= LimitUpper) and (5876.40 >= LimitLower) then\n      HorizontalLineCustom(5876.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5923.60 <= LimitUpper) and (5923.60 >= LimitLower) then\n      HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5273.60 <= LimitUpper) and (5273.60 >= LimitLower) then\n      HorizontalLineCustom(5273.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5326.40 <= LimitUpper) and (5326.40 >= LimitLower) then\n      HorizontalLineCustom(5326.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5423.60 <= LimitUpper) and (5423.60 >= LimitLower) then\n      HorizontalLineCustom(5423.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5476.40 <= LimitUpper) and (5476.40 >= LimitLower) then\n      HorizontalLineCustom(5476.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5523.60 <= LimitUpper) and (5523.60 >= LimitLower) then\n      HorizontalLineCustom(5523.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5576.40 <= LimitUpper) and (5576.40 >= LimitLower) then\n      HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5635.40 <= LimitUpper) and (5635.40 >= LimitLower) then\n      HorizontalLineCustom(5635.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5714.60 <= LimitUpper) and (5714.60 >= LimitLower) then\n      HorizontalLineCustom(5714.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5761.80 <= LimitUpper) and (5761.80 >= LimitLower) then\n      HorizontalLineCustom(5761.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5788.20 <= LimitUpper) and (5788.20 >= LimitLower) then\n      HorizontalLineCustom(5788.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5847.20 <= LimitUpper) and (5847.20 >= LimitLower) then\n      HorizontalLineCustom(5847.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5952.80 <= LimitUpper) and (5952.80 >= LimitLower) then\n      HorizontalLineCustom(5952.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5234.34, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5218.66, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5242.18, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5210.82, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5256.74, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5196.26, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5264.58, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5188.42, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 39285,
        "total_volume": 5225,
        "gamma_exposure": 91699324.19105946,
        "delta_position": -8774.574509969652,
        "last_update": "2026-03-18T15:33:59.370584",
        "spot_price": 5226.5,
        "dealer_pressure": 0.06737488115833695,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 4500.0,
        "gamma_flip_selected": 4974.428708757057,
        "gamma_flip_model": "Spline",
        "call_wall": 5400.0,
        "put_wall": 5100.0,
        "effective_call_wall": 5455.555555555556,
        "effective_put_wall": 5100.0,
        "max_pain": 5100.0,
        "zero_gamma": 4500.0,
        "range_low": 5187.5840030318,
        "range_high": 5265.4159969682,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5265.4159969682,
                "sigma_1_down": 5187.5840030318,
                "sigma_2_up": 5304.331993936399,
                "sigma_2_down": 5148.668006063601
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5313.51881463307,
                "sigma_1_down": 5139.48118536693,
                "sigma_2_up": 5400.53762926614,
                "sigma_2_down": 5052.46237073386
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 10,
                "sigma_1_up": 5349.563187835718,
                "sigma_1_down": 5103.436812164282,
                "sigma_2_up": 5472.626375671437,
                "sigma_2_down": 4980.373624328563
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
                4442.525,
                4474.523979591836,
                4506.522959183673,
                4538.52193877551,
                4570.520918367347,
                4602.519897959183,
                4634.51887755102,
                4666.517857142857,
                4698.516836734693,
                4730.5158163265305,
                4762.514795918367,
                4794.513775510204,
                4826.5127551020405,
                4858.511734693877,
                4890.510714285714,
                4922.5096938775505,
                4954.508673469387,
                4986.507653061224,
                5018.5066326530605,
                5050.505612244898,
                5082.504591836734,
                5114.503571428571,
                5146.502551020408,
                5178.501530612244,
                5210.500510204081,
                5242.499489795918,
                5274.498469387754,
                5306.497448979591,
                5338.496428571428,
                5370.495408163265,
                5402.494387755101,
                5434.493367346939,
                5466.492346938775,
                5498.491326530611,
                5530.490306122449,
                5562.489285714285,
                5594.488265306121,
                5626.487244897959,
                5658.486224489796,
                5690.485204081632,
                5722.484183673469,
                5754.483163265306,
                5786.482142857142,
                5818.481122448979,
                5850.480102040816,
                5882.479081632652,
                5914.4780612244895,
                5946.477040816326,
                5978.476020408163,
                6010.474999999999
            ],
            "deltas": [
                -27438.034675756127,
                -27281.6615984328,
                -27096.990058456176,
                -26880.855592778396,
                -26630.031961035562,
                -26341.258875282896,
                -26011.272262040336,
                -25636.822571493813,
                -25214.642282868503,
                -24741.294302079557,
                -24212.821266709583,
                -23624.16299724638,
                -22968.455402845564,
                -22236.561244004126,
                -21417.405444628494,
                -20499.694845395126,
                -19475.207676232265,
                -18343.051748766396,
                -17113.439572116673,
                -15809.155223802336,
                -14463.411958625215,
                -13114.162798214678,
                -11796.516481341341,
                -10535.885928485399,
                -9344.302367056625,
                -8221.042873172742,
                -7156.98518968179,
                -6140.737586646518,
                -5164.149701159194,
                -4225.3641804789495,
                -3328.7541056920704,
                -2482.3392475975174,
                -1694.085002449895,
                -968.6239762135391,
                -305.4798077556913,
                300.8813417911142,
                859.5408603475184,
                1380.9211581752845,
                1874.6759243712404,
                2348.2355993076562,
                2806.2254803545857,
                3250.6689954736994,
                3681.700545858151,
                4098.457955852335,
                4499.877204571643,
                4885.22444029017,
                5254.323130728649,
                5607.529672489368,
                5945.5597203677835,
                6269.270458311747
            ],
            "flip_value": 5546.611131378813
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
                4442.525,
                4474.523979591836,
                4506.522959183673,
                4538.52193877551,
                4570.520918367347,
                4602.519897959183,
                4634.51887755102,
                4666.517857142857,
                4698.516836734693,
                4730.5158163265305,
                4762.514795918367,
                4794.513775510204,
                4826.5127551020405,
                4858.511734693877,
                4890.510714285714,
                4922.5096938775505,
                4954.508673469387,
                4986.507653061224,
                5018.5066326530605,
                5050.505612244898,
                5082.504591836734,
                5114.503571428571,
                5146.502551020408,
                5178.501530612244,
                5210.500510204081,
                5242.499489795918,
                5274.498469387754,
                5306.497448979591,
                5338.496428571428,
                5370.495408163265,
                5402.494387755101,
                5434.493367346939,
                5466.492346938775,
                5498.491326530611,
                5530.490306122449,
                5562.489285714285,
                5594.488265306121,
                5626.487244897959,
                5658.486224489796,
                5690.485204081632,
                5722.484183673469,
                5754.483163265306,
                5786.482142857142,
                5818.481122448979,
                5850.480102040816,
                5882.479081632652,
                5914.4780612244895,
                5946.477040816326,
                5978.476020408163,
                6010.474999999999
            ],
            "pnl": [
                -25279147.70953528,
                -24094696.78232303,
                -22910303.917018775,
                -21725971.24246545,
                -20541702.139214944,
                -19357513.81985371,
                -18173466.400787245,
                -16989723.288676284,
                -15806664.787352413,
                -14625079.128999181,
                -13446444.603287842,
                -12273286.425441403,
                -11109544.127661588,
                -9960835.148671905,
                -8834475.091981342,
                -7739140.643961204,
                -6684144.189894933,
                -5678407.524837701,
                -4729331.448510997,
                -3841813.322774155,
                -3017641.9889511745,
                -2255406.057135255,
                -1550920.0548826726,
                -898045.9302939605,
                -289702.10036386736,
                281170.358136137,
                820874.0205695527,
                1334557.4909675159,
                1826155.9012049427,
                2298586.36286123,
                2754069.3459474007,
                3194447.866321249,
                3621414.6395534184,
                4036612.227809947,
                4441619.985581361,
                4837868.853469003,
                5226527.283668914,
                5608386.1635499,
                5983750.376151799,
                6352331.659316862,
                6713138.456324298,
                7064373.083666418,
                7403367.6981011545,
                7726606.897974843,
                8029884.904570435,
                8308622.744814569,
                8558328.627310842,
                8775135.81063256,
                8956315.58154776,
                9100655.023810912
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
                        "Call_Now": 735.4197195751995,
                        "Call_Sim": 908.9197195741908,
                        "Call_Chg": 23.591970052041873,
                        "Put_Now": 1.0087687311251819e-09,
                        "Put_Sim": 3.5751978177344574e-14,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 237.52900420110655,
                        "Call_Sim": 409.92351153007803,
                        "Call_Chg": 72.57829750467518,
                        "Put_Now": 1.1182046742290623,
                        "Put_Sim": 0.012712003200096245,
                        "Put_Chg": -98.86317742242846
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.54096608710097,
                        "Call_Sim": 310.34751326915466,
                        "Call_Chg": 114.71249409121702,
                        "Put_Now": 7.93195056968591,
                        "Put_Sim": 0.23849775173891175,
                        "Put_Chg": -96.99320173967807
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 103.8364500990956,
                        "Call_Sim": 261.0161423323543,
                        "Call_Chg": 151.37236691282817,
                        "Put_Now": 17.12832658641105,
                        "Put_Sim": 0.8080188196702665,
                        "Put_Chg": -95.28255830717686
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 69.51186728142602,
                        "Call_Sim": 212.65928760949737,
                        "Call_Chg": 205.93234785151742,
                        "Put_Now": 32.70463577347391,
                        "Put_Sim": 2.3520561015442922,
                        "Put_Chg": -92.80818744524287
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 42.88590373234183,
                        "Call_Sim": 166.34645306822586,
                        "Call_Chg": 287.88142161215063,
                        "Put_Now": 55.97956422911966,
                        "Put_Sim": 5.940113565003799,
                        "Put_Chg": -89.3887820550167
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 12.318345510051017,
                        "Call_Sim": 86.42714912747715,
                        "Call_Chg": 601.6132893573888,
                        "Put_Now": 125.21379001629248,
                        "Put_Sim": 25.82259363371827,
                        "Put_Chg": -79.3771966886728
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.656751283959409,
                        "Call_Sim": 56.205064215686434,
                        "Call_Chg": 893.5926363788446,
                        "Put_Now": 168.45308779493098,
                        "Put_Sim": 45.50140072665772,
                        "Put_Chg": -72.9886811086244
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8572454871718804,
                        "Call_Sim": 18.47030206176032,
                        "Call_Chg": 2054.610591499908,
                        "Put_Now": 263.45536600760624,
                        "Put_Sim": 107.56842258219422,
                        "Put_Chg": -59.17015310324384
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.0825706660841714,
                        "Call_Sim": 4.147547363852709,
                        "Call_Chg": 4923.027620516899,
                        "Put_Now": 362.48247519598135,
                        "Put_Sim": 193.0474518937499,
                        "Put_Chg": -46.742955838244036
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 735.4197195751995,
                        "Call_Sim": 608.9197202285704,
                        "Call_Chg": -17.201061649488977,
                        "Put_Now": 1.0087687311251819e-09,
                        "Put_Sim": 6.54380357686886e-07,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 237.52900420110655,
                        "Call_Sim": 121.29710366087738,
                        "Call_Chg": -48.933771659237095,
                        "Put_Now": 1.1182046742290623,
                        "Put_Sim": 11.386304133999033,
                        "Put_Chg": 918.2665478347454
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.54096608710097,
                        "Call_Sim": 53.082560648148046,
                        "Call_Chg": -63.27507551308307,
                        "Put_Now": 7.93195056968591,
                        "Put_Sim": 42.97354513073242,
                        "Put_Chg": 441.7777727330705
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 103.8364500990956,
                        "Call_Sim": 30.792909247019452,
                        "Call_Chg": -70.3447977876435,
                        "Put_Now": 17.12832658641105,
                        "Put_Sim": 70.58478573433467,
                        "Put_Chg": 312.09388073166417
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 69.51186728142602,
                        "Call_Sim": 16.153030885890985,
                        "Call_Chg": -76.76219684835431,
                        "Put_Now": 32.70463577347391,
                        "Put_Sim": 105.84579937793933,
                        "Put_Chg": 223.64157824924865
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 42.88590373234183,
                        "Call_Sim": 7.606993379680034,
                        "Call_Chg": -82.26225235416149,
                        "Put_Now": 55.97956422911966,
                        "Put_Sim": 147.200653876459,
                        "Put_Chg": 162.95426894353636
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 12.318345510051017,
                        "Call_Sim": 1.197262839537558,
                        "Call_Chg": -90.28065223076699,
                        "Put_Now": 125.21379001629248,
                        "Put_Sim": 240.59270734577785,
                        "Put_Chg": 92.1455354993029
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.656751283959409,
                        "Call_Sim": 0.39787953775774554,
                        "Call_Chg": -92.96628899195207,
                        "Put_Now": 168.45308779493098,
                        "Put_Sim": 289.6942160487288,
                        "Put_Chg": 71.97322996025612
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8572454871718804,
                        "Call_Sim": 0.030675888928096917,
                        "Call_Chg": -96.42157475458995,
                        "Put_Now": 263.45536600760624,
                        "Put_Sim": 389.1287964093626,
                        "Put_Chg": 47.70198167006704
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.0825706660841714,
                        "Call_Sim": 0.0014684375659615445,
                        "Call_Chg": -98.22159898230124,
                        "Put_Now": 362.48247519598135,
                        "Put_Sim": 488.9013729674625,
                        "Put_Chg": 34.87586474439377
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 735.4197195751995,
                        "Call_Sim": 46.837553513071725,
                        "Call_Chg": -93.63118063517165,
                        "Put_Now": 1.0087687311251819e-09,
                        "Put_Sim": 37.91783393888181,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 237.52900420110655,
                        "Call_Sim": 0.00013169805050343777,
                        "Call_Chg": -99.99994455496038,
                        "Put_Now": 1.1182046742290623,
                        "Put_Sim": 490.0893321711728,
                        "Put_Chg": 43728.231402185935
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.54096608710097,
                        "Call_Sim": 1.6984774866155776e-06,
                        "Call_Chg": -99.99999882491619,
                        "Put_Now": 7.93195056968591,
                        "Put_Sim": 589.8909861810625,
                        "Put_Chg": 7336.89690194856
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 103.8364500990956,
                        "Call_Sim": 1.5589218567148663e-07,
                        "Call_Chg": -99.99999984986758,
                        "Put_Now": 17.12832658641105,
                        "Put_Sim": 639.7918766432076,
                        "Put_Chg": 3635.2853672862225
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 69.51186728142602,
                        "Call_Sim": 1.2467518412653701e-08,
                        "Call_Chg": -99.99999998206418,
                        "Put_Now": 32.70463577347391,
                        "Put_Sim": 689.6927685045148,
                        "Put_Chg": 2008.8532319442954
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 42.88590373234183,
                        "Call_Sim": 8.716668752651267e-10,
                        "Call_Chg": -99.99999999796748,
                        "Put_Now": 55.97956422911966,
                        "Put_Sim": 739.5936604976496,
                        "Put_Chg": 1221.1850979592389
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 12.318345510051017,
                        "Call_Sim": 2.884560439690171e-12,
                        "Call_Chg": -99.99999999997658,
                        "Put_Now": 125.21379001629248,
                        "Put_Sim": 839.3954445062436,
                        "Put_Chg": 570.3698086265289
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.656751283959409,
                        "Call_Sim": 1.3743570894583737e-13,
                        "Call_Chg": -99.99999999999757,
                        "Put_Now": 168.45308779493098,
                        "Put_Sim": 889.2963365109717,
                        "Put_Chg": 427.91928491899813
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8572454871718804,
                        "Call_Sim": 2.175159979771622e-16,
                        "Call_Chg": -99.99999999999997,
                        "Put_Now": 263.45536600760624,
                        "Put_Sim": 989.0981205204343,
                        "Put_Chg": 275.4328998908597
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.0825706660841714,
                        "Call_Sim": 2.1734029248899474e-19,
                        "Call_Chg": -100.0,
                        "Put_Now": 362.48247519598135,
                        "Put_Sim": 1088.899904529897,
                        "Put_Chg": 200.4007032177673
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5278.765,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 735.4197195751995,
                        "Call_Sim": 787.6847195742448,
                        "Call_Chg": 7.106826021640431,
                        "Put_Now": 1.0087687311251819e-09,
                        "Put_Sim": 5.4101555071063964e-11,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 237.52900420110655,
                        "Call_Sim": 289.01616607655706,
                        "Call_Chg": 21.67615784380519,
                        "Put_Now": 1.1182046742290623,
                        "Put_Sim": 0.3403665496791888,
                        "Put_Chg": -69.56133724679233
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.54096608710097,
                        "Call_Sim": 192.0813849423157,
                        "Call_Chg": 32.890619277144374,
                        "Put_Now": 7.93195056968591,
                        "Put_Sim": 3.207369424899639,
                        "Put_Chg": -59.56392571131914
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 103.8364500990956,
                        "Call_Sim": 146.85269731853714,
                        "Call_Chg": 41.42692395434289,
                        "Put_Now": 17.12832658641105,
                        "Put_Sim": 7.879573805852829,
                        "Put_Chg": -53.99682644944325
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 69.51186728142602,
                        "Call_Sim": 106.01187348088888,
                        "Call_Chg": 52.50902849680155,
                        "Put_Now": 32.70463577347391,
                        "Put_Sim": 16.939641972936215,
                        "Put_Chg": -48.204156468008655
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 42.88590373234183,
                        "Call_Sim": 71.43766405754423,
                        "Call_Chg": 66.57609573392402,
                        "Put_Now": 55.97956422911966,
                        "Put_Sim": 32.26632455432264,
                        "Put_Chg": -42.36052924195823
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 12.318345510051017,
                        "Call_Sim": 25.307529412782742,
                        "Call_Chg": 105.44584816307794,
                        "Put_Now": 125.21379001629248,
                        "Put_Sim": 85.93797391902353,
                        "Put_Chg": -31.367005257295126
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.656751283959409,
                        "Call_Sim": 13.079273204090669,
                        "Call_Chg": 131.2152779490052,
                        "Put_Now": 168.45308779493098,
                        "Put_Sim": 123.61060971506231,
                        "Put_Chg": -26.620157972086783
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8572454871718804,
                        "Call_Sim": 2.557267238437248,
                        "Call_Chg": 198.3121260718294,
                        "Put_Now": 263.45536600760624,
                        "Put_Sim": 212.89038775887093,
                        "Put_Chg": -19.19299614769488
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.0825706660841714,
                        "Call_Sim": 0.3229385044740596,
                        "Call_Chg": 291.1056066144126,
                        "Put_Now": 362.48247519598135,
                        "Put_Sim": 310.45784303437085,
                        "Put_Chg": -14.352316517779965
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5174.235,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 735.4197195751995,
                        "Call_Sim": 683.1547195904659,
                        "Call_Chg": -7.106826019694356,
                        "Put_Now": 1.0087687311251819e-09,
                        "Put_Sim": 1.62766841096576e-08,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 237.52900420110655,
                        "Call_Sim": 187.35174097589606,
                        "Call_Chg": -21.1246889170332,
                        "Put_Now": 1.1182046742290623,
                        "Put_Sim": 3.2059414490187805,
                        "Put_Chg": 186.70435054558257
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.54096608710097,
                        "Call_Sim": 101.66681510820081,
                        "Call_Chg": -29.66228339242179,
                        "Put_Now": 7.93195056968591,
                        "Put_Sim": 17.322799590785962,
                        "Put_Chg": 118.39268208490503
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 103.8364500990956,
                        "Call_Sim": 67.59854940936111,
                        "Call_Chg": -34.899017305725586,
                        "Put_Now": 17.12832658641105,
                        "Put_Sim": 33.15542589667689,
                        "Put_Chg": 93.57072466717862
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 69.51186728142602,
                        "Call_Sim": 41.336828663004326,
                        "Call_Chg": -40.532702861156245,
                        "Put_Now": 32.70463577347391,
                        "Put_Sim": 56.79459715505209,
                        "Put_Chg": 73.65916424948256
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 42.88590373234183,
                        "Call_Sim": 23.020291784565416,
                        "Call_Chg": -46.32200844305638,
                        "Put_Now": 55.97956422911966,
                        "Put_Sim": 88.37895228134357,
                        "Put_Chg": 57.87717088974815
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 12.318345510051017,
                        "Call_Sim": 5.234062195465356,
                        "Call_Chg": -57.51002282575464,
                        "Put_Now": 125.21379001629248,
                        "Put_Sim": 170.39450670170663,
                        "Put_Chg": 36.082860106331225
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.656751283959409,
                        "Call_Sim": 2.1151946595046525,
                        "Call_Chg": -62.60760720552425,
                        "Put_Now": 168.45308779493098,
                        "Put_Sim": 217.17653117047666,
                        "Put_Chg": 28.924042897248604
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8572454871718804,
                        "Call_Sim": 0.24469381151649827,
                        "Call_Chg": -71.45580639639618,
                        "Put_Now": 263.45536600760624,
                        "Put_Sim": 315.107814331951,
                        "Put_Chg": 19.605768182703656
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.0825706660841714,
                        "Call_Sim": 0.01777730231391672,
                        "Call_Chg": -78.47019630943176,
                        "Put_Now": 362.48247519598135,
                        "Put_Sim": 414.68268183221153,
                        "Put_Chg": 14.400753197242816
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
                        "Call_Now": 144.54096608710097,
                        "Call_Sim": 310.34751326915466,
                        "Call_Chg": 114.71249409121702,
                        "Put_Now": 7.93195056968591,
                        "Put_Sim": 0.23849775173891175,
                        "Put_Chg": -96.99320173967807
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.656751283959409,
                        "Call_Sim": 56.205064215686434,
                        "Call_Chg": 893.5926363788446,
                        "Put_Now": 168.45308779493098,
                        "Put_Sim": 45.50140072665772,
                        "Put_Chg": -72.9886811086244
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0010526682229649587,
                        "Call_Sim": 0.20258220094995494,
                        "Call_Chg": 0.0,
                        "Put_Now": 512.1036332123131,
                        "Put_Sim": 338.80516274504043,
                        "Put_Chg": -33.840507902708985
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.54096608710097,
                        "Call_Sim": 53.082560648148046,
                        "Call_Chg": -63.27507551308307,
                        "Put_Now": 7.93195056968591,
                        "Put_Sim": 42.97354513073242,
                        "Put_Chg": 441.7777727330705
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.656751283959409,
                        "Call_Sim": 0.39787953775774554,
                        "Call_Chg": -92.96628899195207,
                        "Put_Now": 168.45308779493098,
                        "Put_Sim": 289.6942160487288,
                        "Put_Chg": 71.97322996025612
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0010526682229649587,
                        "Call_Sim": 6.439484378330425e-06,
                        "Call_Chg": 0.0,
                        "Put_Now": 512.1036332123131,
                        "Put_Sim": 638.6025869835748,
                        "Put_Chg": 24.70182704578012
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5750.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.54096608710097,
                        "Call_Sim": 660.1090180871297,
                        "Call_Chg": 356.69337624970996,
                        "Put_Now": 7.93195056968591,
                        "Put_Sim": 2.5697146345701706e-06,
                        "Put_Chg": -99.99996760299233
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.656751283959409,
                        "Call_Sim": 360.8209654865068,
                        "Call_Chg": 6278.589889742374,
                        "Put_Now": 168.45308779493098,
                        "Put_Sim": 0.11730199747811199,
                        "Put_Chg": -99.9303651841509
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0010526682229649587,
                        "Call_Sim": 59.84798504448099,
                        "Call_Chg": 0.0,
                        "Put_Now": 512.1036332123131,
                        "Put_Sim": 48.45056558857095,
                        "Put_Chg": -90.53891391383982
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5278.765,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.54096608710097,
                        "Call_Sim": 192.0813849423157,
                        "Call_Chg": 32.890619277144374,
                        "Put_Now": 7.93195056968591,
                        "Put_Sim": 3.207369424899639,
                        "Put_Chg": -59.56392571131914
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.656751283959409,
                        "Call_Sim": 13.079273204090669,
                        "Call_Chg": 131.2152779490052,
                        "Put_Now": 168.45308779493098,
                        "Put_Sim": 123.61060971506231,
                        "Put_Chg": -26.620157972086783
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0010526682229649587,
                        "Call_Sim": 0.006273494446036532,
                        "Call_Chg": 0.0,
                        "Put_Now": 512.1036332123131,
                        "Put_Sim": 459.84385403853685,
                        "Put_Chg": -10.204922555608942
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5174.235,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.54096608710097,
                        "Call_Sim": 101.66681510820081,
                        "Call_Chg": -29.66228339242179,
                        "Put_Now": 7.93195056968591,
                        "Put_Sim": 17.322799590785962,
                        "Put_Chg": 118.39268208490503
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.656751283959409,
                        "Call_Sim": 2.1151946595046525,
                        "Call_Chg": -62.60760720552425,
                        "Put_Now": 168.45308779493098,
                        "Put_Sim": 217.17653117047666,
                        "Put_Chg": 28.924042897248604
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0010526682229649587,
                        "Call_Sim": 0.00014694979091763039,
                        "Call_Chg": 0.0,
                        "Put_Now": 512.1036332123131,
                        "Put_Sim": 564.3677274938809,
                        "Put_Chg": 10.205765179545148
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.00013404049029787333,
            -0.1484627224992624,
            -0.258631734847658,
            -0.0020008988082374775,
            -0.004924158977435717,
            -7.512906067282284e-06,
            0.01217013608787024,
            0.331636840395555,
            0.009501336092248019,
            0.023298474490350676,
            0.00014309505603337134,
            0.005475251274969043,
            0.15857712885359124,
            0.03719736470294485
        ],
        "flip_variations": {
            "Classic": 4500.0,
            "Spline": 4974.428708757057,
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
            -0.37311944751858506,
            -1522.2342227797635,
            -1775.5549331898274,
            -61.65891951066473,
            -662.6836288595541,
            -9.777145349115562,
            83.38665448582631,
            312.80823823049315,
            124.14251774957597,
            196.51226109551297,
            0.022667537561980807,
            40.92369104097246,
            -5623.6276831437435,
            123.53911217059232
        ],
        "delta_cumulative": [
            -0.37311944751858506,
            -1522.607342227282,
            -3298.1622754171094,
            -3359.8211949277743,
            -4022.5048237873284,
            -4032.281969136444,
            -3948.8953146506174,
            -3636.087076420124,
            -3511.944558670548,
            -3315.4322975750347,
            -3315.4096300374727,
            -3274.4859389965004,
            -8898.113622140245,
            -8774.574509969652
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
            4591.635188508858,
            17531403.67376754,
            39062226.67655583,
            477466.64812734665,
            6115291.842987964,
            152923.1795330838,
            719949.3692911227,
            11709140.724304544,
            407888.56505770393,
            951752.5907724823,
            2014.7438872312755,
            187705.85655382104,
            13424052.120684214,
            952916.5643480606
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            178170.18886053437,
            47279.17303276992,
            719949.3692911227,
            11709140.724304544,
            407888.56505770393,
            951752.5907724823,
            2014.7438872312755,
            187705.85655382104,
            5707691.825638423,
            952916.5643480606
        ],
        "gamma_put": [
            4591.635188508858,
            17531403.67376754,
            39062226.67655583,
            477466.64812734665,
            5937121.654127429,
            105644.00650031389,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            7716360.295045791,
            0.0
        ],
        "gamma_exposure": [
            4591.635188508858,
            17535995.30895605,
            56598221.98551188,
            57075688.633639224,
            63190980.476627186,
            63343903.65616027,
            64063853.02545139,
            75772993.74975593,
            76180882.31481364,
            77132634.90558612,
            77134649.64947335,
            77322355.50602718,
            90746407.6267114,
            91699324.19105946
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
            "abs_call": 11711155.468191775,
            "abs_put": 20559615.395120393,
            "net": 32270770.86331217
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 32,
            "abs_call": 0.0,
            "abs_put": 17915831.336221945,
            "net": 17915831.336221945
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 53,
            "abs_call": 719949.3692911227,
            "abs_put": 586779.9452134907,
            "net": 1306729.3145046134
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 75,
            "abs_call": 0.0,
            "abs_put": 23439969.90792942,
            "net": 23439969.90792942
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 98,
            "abs_call": 0.0,
            "abs_put": 477466.64812734665,
            "net": 477466.64812734665
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 119,
            "abs_call": 47279.17303276992,
            "abs_put": 0.0,
            "net": 47279.17303276992
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 141,
            "abs_call": 5707691.825638423,
            "abs_put": 7716360.295045791,
            "net": 13424052.120684214
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 163,
            "abs_call": 0.0,
            "abs_put": 33147.05515405989,
            "net": 33147.05515405989
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 184,
            "abs_call": 951752.5907724823,
            "abs_put": 0.0,
            "net": 951752.5907724823
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 207,
            "abs_call": 952916.5643480606,
            "abs_put": 0.0,
            "net": 952916.5643480606
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 228,
            "abs_call": 0.0,
            "abs_put": 105644.00650031389,
            "net": 105644.00650031389
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 248,
            "abs_call": 773764.6104720593,
            "abs_put": 0.0,
            "net": 773764.6104720593
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
            "spot": 5226.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 43,
            "iv_atm": 0.0,
            "spot": 5226.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 74,
            "iv_atm": 0.0,
            "spot": 5226.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 104,
            "iv_atm": 0.0,
            "spot": 5226.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 137,
            "iv_atm": 0.0,
            "spot": 5226.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 166,
            "iv_atm": 0.0,
            "spot": 5226.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 196,
            "iv_atm": 0.0,
            "spot": 5226.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 228,
            "iv_atm": 0.0,
            "spot": 5226.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 257,
            "iv_atm": 0.0,
            "spot": 5226.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 288,
            "iv_atm": 0.0,
            "spot": 5226.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 319,
            "iv_atm": 0.0,
            "spot": 5226.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 347,
            "iv_atm": 0.0,
            "spot": 5226.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.5,
                    "lower": 5226.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.5,
                    "lower": 5226.5,
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
            -0.8007661865437854,
            -1610.9141360143692,
            -14024.595464789309,
            9.104250410416093,
            246.41937359399682,
            9.687489841850994,
            120.99078877861749,
            10299.809028343141,
            44.38445701039669,
            144.21041342635814,
            5.211951178295425,
            30.55505683470811,
            4076.2539523999276,
            252.45048690492655
        ],
        "vanna": [
            -13.684262292284311,
            -16957.726242960605,
            -18549.647899087744,
            -255.78768994065416,
            -1960.7968982076845,
            -74.76366029084036,
            175.349333082479,
            6109.882792787248,
            59.95894794809953,
            609.0902568706452,
            3.7456244500248914,
            197.16026680104392,
            25806.56489148869,
            2178.7502572145595
        ],
        "vex": [
            3669.5504768259234,
            6446675.934387988,
            3971403.622982001,
            229417.7428564946,
            2412171.411724646,
            145681.7648607625,
            187083.5969903007,
            574093.8727204193,
            495965.07722929004,
            858617.581063297,
            98.78198135919092,
            228237.70416053635,
            9280270.35795246,
            967126.1090217276
        ],
        "theta": [
            -0.9292114282929399,
            -3445.2800991634685,
            -9439.364373869808,
            -71.26970117401851,
            -1039.6388039548112,
            -31.484693794251566,
            -291.7885901441595,
            -3713.7090314341626,
            -235.50449839135294,
            -465.8185469019677,
            -0.6071825185895474,
            -93.71526094305061,
            2850.50108963253,
            -397.7373130219728
        ],
        "charm_cum": [
            -0.8007661865437854,
            -1611.714902200913,
            -15636.310366990221,
            -15627.206116579806,
            -15380.786742985809,
            -15371.099253143957,
            -15250.10846436534,
            -4950.299436022198,
            -4905.914979011802,
            -4761.704565585444,
            -4756.492614407148,
            -4725.93755757244,
            -649.6836051725122,
            -397.23311826758567
        ],
        "vanna_cum": [
            -13.684262292284311,
            -16971.41050525289,
            -35521.058404340634,
            -35776.84609428129,
            -37737.642992488974,
            -37812.40665277981,
            -37637.057319697335,
            -31527.174526910087,
            -31467.215578961986,
            -30858.125322091342,
            -30854.379697641318,
            -30657.219430840272,
            -4850.654539351581,
            -2671.9042821370213
        ],
        "theta_cum": [
            -0.9292114282929399,
            -3446.2093105917616,
            -12885.57368446157,
            -12956.843385635588,
            -13996.482189590399,
            -14027.96688338465,
            -14319.755473528809,
            -18033.464504962973,
            -18268.969003354327,
            -18734.787550256293,
            -18735.394732774883,
            -18829.109993717935,
            -15978.608904085406,
            -16376.346217107379
        ],
        "r_gamma": [
            4591.635188508858,
            17531403.67376754,
            39062226.67655583,
            477466.64812734665,
            6115291.842987964,
            -152923.1795330838,
            -719949.3692911227,
            -11709140.724304544,
            -407888.56505770393,
            -951752.5907724823,
            -2014.7438872312755,
            -187705.85655382104,
            -13424052.120684216,
            -952916.5643480606
        ],
        "r_gamma_cum": [
            4591.635188508858,
            17535995.30895605,
            56598221.98551188,
            57075688.633639224,
            63190980.476627186,
            63038057.2970941,
            62318107.92780298,
            50608967.20349844,
            50201078.638440736,
            49249326.047668256,
            49247311.303781025,
            49059605.4472272,
            35635553.32654299,
            34682636.76219493
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.37311944751858506,
            "gamma": 4591.635188508858,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -1522.2342227797635,
            "gamma": 17531403.67376754,
            "volume": 160,
            "oi": 8900,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -1775.5549331898274,
            "gamma": 39062226.67655583,
            "volume": 875,
            "oi": 9855,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -61.65891951066473,
            "gamma": 477466.64812734665,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -662.6836288595541,
            "gamma": 6115291.842987964,
            "volume": 215,
            "oi": 2160,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -9.777145349115562,
            "gamma": 152923.1795330838,
            "volume": 40,
            "oi": 85,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": 83.38665448582631,
            "gamma": 719949.3692911227,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5400.0,
            "delta": 312.80823823049315,
            "gamma": 11709140.724304544,
            "volume": 1900,
            "oi": 3180,
            "iv": 11.82
        },
        {
            "strike": 5500.0,
            "delta": 124.14251774957597,
            "gamma": 407888.56505770393,
            "volume": 240,
            "oi": 240,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 196.51226109551297,
            "gamma": 951752.5907724823,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        },
        {
            "strike": 5750.0,
            "delta": 0.022667537561980807,
            "gamma": 2014.7438872312755,
            "volume": 200,
            "oi": 600,
            "iv": 11.82
        },
        {
            "strike": 5800.0,
            "delta": 40.92369104097246,
            "gamma": 187705.85655382104,
            "volume": 120,
            "oi": 120,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5623.6276831437435,
            "gamma": 13424052.120684214,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 123.53911217059232,
            "gamma": 952916.5643480606,
            "volume": 500,
            "oi": 1000,
            "iv": 11.82
        }
    ]
};