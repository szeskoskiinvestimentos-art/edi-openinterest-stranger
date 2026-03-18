window.marketData = {
    "last_updated": "2026-03-18 16:29:09",
    "spot_price": 5237.5,
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
                    "3.25-3.50": 12.5,
                    "3.50-3.75": 87.5,
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
                    "3.00-3.25": 1.9,
                    "3.25-3.50": 24.1,
                    "3.50-3.75": 73.9,
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
                    "2.75-3.00": 0.3,
                    "3.00-3.25": 5.2,
                    "3.25-3.50": 31.5,
                    "3.50-3.75": 63.0,
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
                    "2.75-3.00": 0.7,
                    "3.00-3.25": 7.6,
                    "3.25-3.50": 34.4,
                    "3.50-3.75": 57.2,
                    "3.75-4.00": 0.8
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 265,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.2,
                    "2.75-3.00": 2.3,
                    "3.00-3.25": 13.5,
                    "3.25-3.50": 39.4,
                    "3.50-3.75": 44.6,
                    "3.75-4.00": 0.6
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 18/03/2026 16:29\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(2);\n  spot(5237.50);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 4500.00;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (4500.00)\n  // 2 = Spline (4973.46)\n  // 3 = HVL (4500.00)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (4500.00)\n  // 7 = HVL Gaussian (4500.00)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 4500.00;\n  if (ModeloFlip = 2) then GammaVal := 4973.46;\n  if (ModeloFlip = 3) then GammaVal := 4500.00;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 4500.00;\n  if (ModeloFlip = 7) then GammaVal := 4500.00;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirMaxPain) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirRange) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5198.50 <= LimitUpper) and (5198.50 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5198.50, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5276.50 <= LimitUpper) and (5276.50 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5276.50, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirRange) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5455.56 <= LimitUpper) and (5455.56 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5455.56, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5500.00 <= LimitUpper) and (5500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5750.00 <= LimitUpper) and (5750.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5750.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5800.00 <= LimitUpper) and (5800.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5800.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5546.42 > 0) then\n      HorizontalLineCustom(5546.42, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5300.00 <= LimitUpper) and (5300.00 >= LimitLower) then\n      HorizontalLineCustom(5300.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5450.00 <= LimitUpper) and (5450.00 >= LimitLower) then\n      HorizontalLineCustom(5450.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5550.00 <= LimitUpper) and (5550.00 >= LimitLower) then\n      HorizontalLineCustom(5550.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5675.00 <= LimitUpper) and (5675.00 >= LimitLower) then\n      HorizontalLineCustom(5675.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5775.00 <= LimitUpper) and (5775.00 >= LimitLower) then\n      HorizontalLineCustom(5775.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5900.00 <= LimitUpper) and (5900.00 >= LimitLower) then\n      HorizontalLineCustom(5900.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5438.20 <= LimitUpper) and (5438.20 >= LimitLower) then\n      HorizontalLineCustom(5438.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5461.80 <= LimitUpper) and (5461.80 >= LimitLower) then\n      HorizontalLineCustom(5461.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5538.20 <= LimitUpper) and (5538.20 >= LimitLower) then\n      HorizontalLineCustom(5538.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5657.30 <= LimitUpper) and (5657.30 >= LimitLower) then\n      HorizontalLineCustom(5657.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5692.70 <= LimitUpper) and (5692.70 >= LimitLower) then\n      HorizontalLineCustom(5692.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5769.10 <= LimitUpper) and (5769.10 >= LimitLower) then\n      HorizontalLineCustom(5769.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5780.90 <= LimitUpper) and (5780.90 >= LimitLower) then\n      HorizontalLineCustom(5780.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5876.40 <= LimitUpper) and (5876.40 >= LimitLower) then\n      HorizontalLineCustom(5876.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5923.60 <= LimitUpper) and (5923.60 >= LimitLower) then\n      HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5273.60 <= LimitUpper) and (5273.60 >= LimitLower) then\n      HorizontalLineCustom(5273.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5326.40 <= LimitUpper) and (5326.40 >= LimitLower) then\n      HorizontalLineCustom(5326.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5423.60 <= LimitUpper) and (5423.60 >= LimitLower) then\n      HorizontalLineCustom(5423.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5476.40 <= LimitUpper) and (5476.40 >= LimitLower) then\n      HorizontalLineCustom(5476.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5523.60 <= LimitUpper) and (5523.60 >= LimitLower) then\n      HorizontalLineCustom(5523.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5576.40 <= LimitUpper) and (5576.40 >= LimitLower) then\n      HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5635.40 <= LimitUpper) and (5635.40 >= LimitLower) then\n      HorizontalLineCustom(5635.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5714.60 <= LimitUpper) and (5714.60 >= LimitLower) then\n      HorizontalLineCustom(5714.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5761.80 <= LimitUpper) and (5761.80 >= LimitLower) then\n      HorizontalLineCustom(5761.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5788.20 <= LimitUpper) and (5788.20 >= LimitLower) then\n      HorizontalLineCustom(5788.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5847.20 <= LimitUpper) and (5847.20 >= LimitLower) then\n      HorizontalLineCustom(5847.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5952.80 <= LimitUpper) and (5952.80 >= LimitLower) then\n      HorizontalLineCustom(5952.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5245.36, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5229.64, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5253.21, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5221.79, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5267.80, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5207.20, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5275.66, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5199.34, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 39285,
        "total_volume": 5225,
        "gamma_exposure": 90117297.5517959,
        "delta_position": -8392.347312795633,
        "last_update": "2026-03-18T16:29:09.430285",
        "spot_price": 5237.5,
        "dealer_pressure": 0.07336272047758634,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 4500.0,
        "gamma_flip_selected": 4973.464335918743,
        "gamma_flip_model": "Spline",
        "call_wall": 5400.0,
        "put_wall": 5100.0,
        "effective_call_wall": 5455.555555555556,
        "effective_put_wall": 5100.0,
        "max_pain": 5100.0,
        "zero_gamma": 4500.0,
        "range_low": 5198.5020981305,
        "range_high": 5276.497901869501,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5276.497901869501,
                "sigma_1_down": 5198.502098130499,
                "sigma_2_up": 5315.4958037390015,
                "sigma_2_down": 5159.5041962609985
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5324.70195956007,
                "sigma_1_down": 5150.29804043993,
                "sigma_2_up": 5411.90391912014,
                "sigma_2_down": 5063.09608087986
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 10,
                "sigma_1_up": 5360.822193875361,
                "sigma_1_down": 5114.177806124639,
                "sigma_2_up": 5484.144387750722,
                "sigma_2_down": 4990.855612249278
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
                4451.875,
                4483.941326530612,
                4516.007653061224,
                4548.073979591837,
                4580.140306122449,
                4612.206632653061,
                4644.272959183673,
                4676.339285714285,
                4708.405612244898,
                4740.47193877551,
                4772.538265306122,
                4804.6045918367345,
                4836.6709183673465,
                4868.737244897959,
                4900.803571428572,
                4932.869897959184,
                4964.936224489796,
                4997.002551020408,
                5029.06887755102,
                5061.135204081633,
                5093.201530612245,
                5125.267857142857,
                5157.334183673469,
                5189.400510204081,
                5221.466836734693,
                5253.533163265306,
                5285.599489795918,
                5317.66581632653,
                5349.732142857142,
                5381.798469387755,
                5413.864795918367,
                5445.931122448979,
                5477.997448979591,
                5510.063775510203,
                5542.1301020408155,
                5574.1964285714275,
                5606.2627551020405,
                5638.329081632653,
                5670.395408163265,
                5702.461734693877,
                5734.52806122449,
                5766.594387755102,
                5798.660714285714,
                5830.727040816326,
                5862.793367346938,
                5894.85969387755,
                5926.926020408162,
                5958.992346938775,
                5991.058673469387,
                6023.124999999999
            ],
            "deltas": [
                -27395.08617005378,
                -27230.391455596247,
                -27036.351682563756,
                -26809.761387522147,
                -26547.36061055286,
                -26245.86420684253,
                -25901.991233621622,
                -25512.473442736646,
                -25073.99431259924,
                -24582.98220782028,
                -24035.18267864976,
                -23425.010636228188,
                -22744.864950645537,
                -21984.84120015547,
                -21133.46001442383,
                -20179.92158766732,
                -19117.853752531308,
                -17949.64970879016,
                -16689.720699713667,
                -15364.876132911682,
                -14010.890690782751,
                -12665.869026280021,
                -11362.51894560158,
                -10122.074288050655,
                -8951.998067039696,
                -7848.045164628946,
                -6799.540741878327,
                -5795.621288920091,
                -4830.100427279299,
                -3903.4638471754115,
                -3021.7917688802618,
                -2193.5677662880485,
                -1425.9268302331404,
                -721.7959259207641,
                -78.76446259282869,
                510.26097343396225,
                1055.1781058289503,
                1566.410856466955,
                2052.972717689774,
                2521.3150843643616,
                2975.056968223922,
                3415.420653718819,
                3842.058048504813,
                4253.942657380535,
                4650.084513481512,
                5029.949114005222,
                5393.579311804411,
                5741.499233733007,
                6074.510044743769,
                6393.475856574375
            ],
            "flip_value": 5546.418010205778
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
                4451.875,
                4483.941326530612,
                4516.007653061224,
                4548.073979591837,
                4580.140306122449,
                4612.206632653061,
                4644.272959183673,
                4676.339285714285,
                4708.405612244898,
                4740.47193877551,
                4772.538265306122,
                4804.6045918367345,
                4836.6709183673465,
                4868.737244897959,
                4900.803571428572,
                4932.869897959184,
                4964.936224489796,
                4997.002551020408,
                5029.06887755102,
                5061.135204081633,
                5093.201530612245,
                5125.267857142857,
                5157.334183673469,
                5189.400510204081,
                5221.466836734693,
                5253.533163265306,
                5285.599489795918,
                5317.66581632653,
                5349.732142857142,
                5381.798469387755,
                5413.864795918367,
                5445.931122448979,
                5477.997448979591,
                5510.063775510203,
                5542.1301020408155,
                5574.1964285714275,
                5606.2627551020405,
                5638.329081632653,
                5670.395408163265,
                5702.461734693877,
                5734.52806122449,
                5766.594387755102,
                5798.660714285714,
                5830.727040816326,
                5862.793367346938,
                5894.85969387755,
                5926.926020408162,
                5958.992346938775,
                5991.058673469387,
                6023.124999999999
            ],
            "pnl": [
                -24848421.22939481,
                -23672874.04127907,
                -22497386.01936041,
                -21321958.959069,
                -20146598.547804996,
                -18971330.914033815,
                -17796239.581955805,
                -16621540.14440669,
                -15447716.431619516,
                -14275741.244486274,
                -13107388.436971074,
                -11945606.26181564,
                -10794870.159623312,
                -9661386.891784461,
                -8553010.22282936,
                -7478773.3441901915,
                -6448042.871544445,
                -5469422.076783422,
                -4549628.851976214,
                -3692605.607177444,
                -2899069.5208378695,
                -2166599.4230702836,
                -1490218.6075517153,
                -863314.3096630685,
                -278667.79658603575,
                270631.33663846646,
                790553.2113596788,
                1285848.0193133922,
                1760087.7536693895,
                2215923.599804802,
                2655423.1976020476,
                3080368.0024536126,
                3492438.516920453,
                3893271.1684194757,
                4284413.626893842,
                4667223.724829448,
                5042751.681665599,
                5411626.313426472,
                5773946.827966368,
                6129173.400937498,
                6476016.3015018925,
                6812341.80102266,
                7135134.237079068,
                7440565.241482092,
                7724212.9070547465,
                7981442.246940299,
                8207910.764400672,
                8400115.66672833,
                8555871.662432134,
                8674613.941763453
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
                        "Call_Now": 746.419719574742,
                        "Call_Sim": 908.9197195741908,
                        "Call_Chg": 21.77059310437699,
                        "Put_Now": 5.514931386282488e-10,
                        "Put_Sim": 3.5751978177344574e-14,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 248.29131754890022,
                        "Call_Sim": 409.92351153007803,
                        "Call_Chg": 65.09780349018641,
                        "Put_Now": 0.8805180220228692,
                        "Put_Sim": 0.012712003200096245,
                        "Put_Chg": -98.55630402988321
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 154.23388734596574,
                        "Call_Sim": 310.34751326915466,
                        "Call_Chg": 101.21875847751065,
                        "Put_Now": 6.624871828551022,
                        "Put_Sim": 0.23849775173891175,
                        "Put_Chg": -96.3999642874438
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 112.39842777376043,
                        "Call_Sim": 261.0161423323543,
                        "Call_Chg": 132.2240154975628,
                        "Put_Now": 14.69030426107588,
                        "Put_Sim": 0.8080188196702665,
                        "Put_Chg": -94.49964544430009
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 76.54366350774353,
                        "Call_Sim": 212.65928760949737,
                        "Call_Chg": 177.8274227598,
                        "Put_Now": 28.73643199979074,
                        "Put_Sim": 2.3520561015442922,
                        "Put_Chg": -91.81507258256202
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 48.167391685045914,
                        "Call_Sim": 166.34645306822586,
                        "Call_Chg": 245.35075960916086,
                        "Put_Now": 50.26105218182374,
                        "Put_Sim": 5.940113565003799,
                        "Put_Chg": -88.18147788964919
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 14.489902383293838,
                        "Call_Sim": 86.42714912747715,
                        "Call_Chg": 496.46467478706757,
                        "Put_Now": 116.38534688953405,
                        "Put_Sim": 25.82259363371827,
                        "Put_Chg": -77.81284816014896
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 6.82728782133654,
                        "Call_Sim": 56.205064215686434,
                        "Call_Chg": 723.2414640559782,
                        "Put_Now": 158.62362433230828,
                        "Put_Sim": 45.50140072665772,
                        "Put_Chg": -71.31486503464664
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 1.0930918871376747,
                        "Call_Sim": 18.47030206176032,
                        "Call_Chg": 1589.73004731797,
                        "Put_Now": 252.6912124075725,
                        "Put_Sim": 107.56842258219422,
                        "Put_Chg": -57.43088113064486
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.11157274676019924,
                        "Call_Sim": 4.147547363852709,
                        "Call_Chg": 3617.3480839070303,
                        "Put_Now": 351.5114772766574,
                        "Put_Sim": 193.0474518937499,
                        "Put_Chg": -45.08075429303501
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 746.419719574742,
                        "Call_Sim": 608.9197202285704,
                        "Call_Chg": -18.421271000786188,
                        "Put_Now": 5.514931386282488e-10,
                        "Put_Sim": 6.54380357686886e-07,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 248.29131754890022,
                        "Call_Sim": 121.29710366087738,
                        "Call_Chg": -51.14726327996214,
                        "Put_Now": 0.8805180220228692,
                        "Put_Sim": 11.386304133999033,
                        "Put_Chg": 1193.136977235351
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 154.23388734596574,
                        "Call_Sim": 53.082560648148046,
                        "Call_Chg": -65.58307544367517,
                        "Put_Now": 6.624871828551022,
                        "Put_Sim": 42.97354513073242,
                        "Put_Chg": 548.6698345699391
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 112.39842777376043,
                        "Call_Sim": 30.792909247019452,
                        "Call_Chg": -72.6037900556754,
                        "Put_Now": 14.69030426107588,
                        "Put_Sim": 70.58478573433467,
                        "Put_Chg": 380.4855262348747
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 76.54366350774353,
                        "Call_Sim": 16.153030885890985,
                        "Call_Chg": -78.89697181236059,
                        "Put_Now": 28.73643199979074,
                        "Put_Sim": 105.84579937793933,
                        "Put_Chg": 268.33312980090955
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 48.167391685045914,
                        "Call_Sim": 7.606993379680034,
                        "Call_Chg": -84.2071718779788,
                        "Put_Now": 50.26105218182374,
                        "Put_Sim": 147.200653876459,
                        "Put_Chg": 192.8722091689362
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 14.489902383293838,
                        "Call_Sim": 1.197262839537558,
                        "Call_Chg": -91.73726083263374,
                        "Put_Now": 116.38534688953405,
                        "Put_Sim": 240.59270734577785,
                        "Put_Chg": 106.72078897881701
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 6.82728782133654,
                        "Call_Sim": 0.39787953775774554,
                        "Call_Chg": -94.1722167254426,
                        "Put_Now": 158.62362433230828,
                        "Put_Sim": 289.6942160487288,
                        "Put_Chg": 82.6299312401502
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 1.0930918871376747,
                        "Call_Sim": 0.030675888928096917,
                        "Call_Chg": -97.1936587135027,
                        "Put_Now": 252.6912124075725,
                        "Put_Sim": 389.1287964093626,
                        "Put_Chg": 53.993798479120144
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.11157274676019924,
                        "Call_Sim": 0.0014684375659615445,
                        "Call_Chg": -98.68387432540527,
                        "Put_Now": 351.5114772766574,
                        "Put_Sim": 488.9013729674625,
                        "Put_Chg": 39.0854650764852
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 746.419719574742,
                        "Call_Sim": 46.837553513071725,
                        "Call_Chg": -93.72503803359369,
                        "Put_Now": 5.514931386282488e-10,
                        "Put_Sim": 37.91783393888181,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 248.29131754890022,
                        "Call_Sim": 0.00013169805050343777,
                        "Call_Chg": -99.99994695825379,
                        "Put_Now": 0.8805180220228692,
                        "Put_Sim": 490.0893321711728,
                        "Put_Chg": 55559.20513986299
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 154.23388734596574,
                        "Call_Sim": 1.6984774866155776e-06,
                        "Call_Chg": -99.99999889876504,
                        "Put_Now": 6.624871828551022,
                        "Put_Sim": 589.8909861810625,
                        "Put_Chg": 8804.18715180007
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 112.39842777376043,
                        "Call_Sim": 1.5589218567148663e-07,
                        "Call_Chg": -99.99999986130395,
                        "Put_Now": 14.69030426107588,
                        "Put_Sim": 639.7918766432076,
                        "Put_Chg": 4255.198267325411
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 76.54366350774353,
                        "Call_Sim": 1.2467518412653701e-08,
                        "Call_Chg": -99.99999998371189,
                        "Put_Now": 28.73643199979074,
                        "Put_Sim": 689.6927685045148,
                        "Put_Chg": 2300.0640319909485
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 48.167391685045914,
                        "Call_Sim": 8.716668752651267e-10,
                        "Call_Chg": -99.99999999819033,
                        "Put_Now": 50.26105218182374,
                        "Put_Sim": 739.5936604976496,
                        "Put_Chg": 1371.5045316244175
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 14.489902383293838,
                        "Call_Sim": 2.884560439690171e-12,
                        "Call_Chg": -99.99999999998009,
                        "Put_Now": 116.38534688953405,
                        "Put_Sim": 839.3954445062436,
                        "Put_Chg": 621.2208984546372
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 6.82728782133654,
                        "Call_Sim": 1.3743570894583737e-13,
                        "Call_Chg": -99.99999999999798,
                        "Put_Now": 158.62362433230828,
                        "Put_Sim": 889.2963365109717,
                        "Put_Chg": 460.6329701860436
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 1.0930918871376747,
                        "Call_Sim": 2.175159979771622e-16,
                        "Call_Chg": -99.99999999999997,
                        "Put_Now": 252.6912124075725,
                        "Put_Sim": 989.0981205204343,
                        "Put_Chg": 291.4256103710846
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.11157274676019924,
                        "Call_Sim": 2.1734029248899474e-19,
                        "Call_Chg": -100.0,
                        "Put_Now": 351.5114772766574,
                        "Put_Sim": 1088.899904529897,
                        "Put_Chg": 209.77648666443898
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5289.875,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 746.419719574742,
                        "Call_Sim": 798.7947195742181,
                        "Call_Chg": 7.016829623595122,
                        "Put_Now": 5.514931386282488e-10,
                        "Put_Sim": 2.8522316464359797e-11,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 248.29131754890022,
                        "Call_Sim": 300.0454928964309,
                        "Call_Chg": 20.844134164030066,
                        "Put_Now": 0.8805180220228692,
                        "Put_Sim": 0.2596933695523731,
                        "Put_Chg": -70.50675136032272
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 154.23388734596574,
                        "Call_Sim": 202.58665763276622,
                        "Call_Chg": 31.350289562720558,
                        "Put_Now": 6.624871828551022,
                        "Put_Sim": 2.6026421153514434,
                        "Put_Chg": -60.714075944308675
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 112.39842777376043,
                        "Call_Sim": 156.66065242606965,
                        "Call_Chg": 39.379754262579006,
                        "Put_Now": 14.69030426107588,
                        "Put_Sim": 6.577528913384754,
                        "Put_Chg": -55.22537316798207
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 76.54366350774353,
                        "Call_Sim": 114.6997337516691,
                        "Call_Chg": 49.848764084914116,
                        "Put_Now": 28.73643199979074,
                        "Put_Sim": 14.517502243715853,
                        "Put_Chg": -49.48049833110259
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 48.167391685045914,
                        "Call_Sim": 78.60684205014331,
                        "Call_Chg": 63.19513949215493,
                        "Put_Now": 50.26105218182374,
                        "Put_Sim": 28.325502546921825,
                        "Put_Chg": -43.64323603005395
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 14.489902383293838,
                        "Call_Sim": 29.020095931245578,
                        "Call_Chg": 100.27806374116332,
                        "Put_Now": 116.38534688953405,
                        "Put_Sim": 78.54054043748647,
                        "Put_Chg": -32.51681372567251
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 6.82728782133654,
                        "Call_Sim": 15.358430184057625,
                        "Call_Chg": 124.9565359769905,
                        "Put_Now": 158.62362433230828,
                        "Put_Sim": 114.77976669502914,
                        "Put_Chg": -27.6401814810564
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 1.0930918871376747,
                        "Call_Sim": 3.1631172701934247,
                        "Call_Chg": 189.3734101783733,
                        "Put_Now": 252.6912124075725,
                        "Put_Sim": 202.386237790628,
                        "Put_Chg": -19.907686594105314
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.11157274676019924,
                        "Call_Sim": 0.42244624966157573,
                        "Call_Chg": 278.6285288552856,
                        "Put_Now": 351.5114772766574,
                        "Put_Sim": 299.4473507795583,
                        "Put_Chg": -14.811501149398312
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5185.125,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 746.419719574742,
                        "Call_Sim": 694.0447195834204,
                        "Call_Chg": -7.0168296225026365,
                        "Put_Now": 5.514931386282488e-10,
                        "Put_Sim": 9.229419284071498e-09,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 248.29131754890022,
                        "Call_Sim": 197.63881801092793,
                        "Call_Chg": -20.400431250680537,
                        "Put_Now": 0.8805180220228692,
                        "Put_Sim": 2.603018484050267,
                        "Put_Chg": 195.6235328460614
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 154.23388734596574,
                        "Call_Sim": 110.10253849985429,
                        "Call_Chg": -28.613263664371864,
                        "Put_Now": 6.624871828551022,
                        "Put_Sim": 14.868522982439345,
                        "Put_Chg": 124.43487764338161
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 112.39842777376043,
                        "Call_Sim": 74.49259839221486,
                        "Call_Chg": -33.72451922356403,
                        "Put_Now": 14.69030426107588,
                        "Put_Sim": 29.159474879530308,
                        "Put_Chg": 98.49469664690758
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 76.54366350774353,
                        "Call_Sim": 46.476964136994866,
                        "Call_Chg": -39.280455093068504,
                        "Put_Now": 28.73643199979074,
                        "Put_Sim": 51.0447326290423,
                        "Put_Chg": 77.63072544780094
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 48.167391685045914,
                        "Call_Sim": 26.47084620829196,
                        "Call_Chg": -45.0440530776963,
                        "Put_Now": 50.26105218182374,
                        "Put_Sim": 80.93950670507047,
                        "Put_Chg": 61.03822580606697
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 14.489902383293838,
                        "Call_Sim": 6.330652573968678,
                        "Call_Chg": -56.309901844006795,
                        "Put_Now": 116.38534688953405,
                        "Put_Sim": 160.601097080209,
                        "Put_Chg": 37.990822188846394
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 6.82728782133654,
                        "Call_Sim": 2.6293086255270737,
                        "Call_Chg": -61.48824109465553,
                        "Put_Now": 158.62362433230828,
                        "Put_Sim": 206.80064513649904,
                        "Put_Chg": 30.371907719913395
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 1.0930918871376747,
                        "Call_Sim": 0.32214216197024825,
                        "Call_Chg": -70.52926970176347,
                        "Put_Now": 252.6912124075725,
                        "Put_Sim": 304.2952626824044,
                        "Put_Chg": 20.42178269009148
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.11157274676019924,
                        "Call_Sim": 0.024841615830734298,
                        "Call_Chg": -77.73505040247345,
                        "Put_Now": 351.5114772766574,
                        "Put_Sim": 403.7997461457271,
                        "Put_Chg": 14.875266456211955
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
                        "Call_Now": 154.23388734596574,
                        "Call_Sim": 310.34751326915466,
                        "Call_Chg": 101.21875847751065,
                        "Put_Now": 6.624871828551022,
                        "Put_Sim": 0.23849775173891175,
                        "Put_Chg": -96.3999642874438
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 6.82728782133654,
                        "Call_Sim": 56.205064215686434,
                        "Call_Chg": 723.2414640559782,
                        "Put_Now": 158.62362433230828,
                        "Put_Sim": 45.50140072665772,
                        "Put_Chg": -71.31486503464664
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.001555884062920565,
                        "Call_Sim": 0.20258220094995494,
                        "Call_Chg": 0.0,
                        "Put_Now": 501.10413642815365,
                        "Put_Sim": 338.80516274504043,
                        "Put_Chg": -32.388272593391974
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 154.23388734596574,
                        "Call_Sim": 53.082560648148046,
                        "Call_Chg": -65.58307544367517,
                        "Put_Now": 6.624871828551022,
                        "Put_Sim": 42.97354513073242,
                        "Put_Chg": 548.6698345699391
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 6.82728782133654,
                        "Call_Sim": 0.39787953775774554,
                        "Call_Chg": -94.1722167254426,
                        "Put_Now": 158.62362433230828,
                        "Put_Sim": 289.6942160487288,
                        "Put_Chg": 82.6299312401502
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.001555884062920565,
                        "Call_Sim": 6.439484378330425e-06,
                        "Call_Chg": 0.0,
                        "Put_Now": 501.10413642815365,
                        "Put_Sim": 638.6025869835748,
                        "Put_Chg": 27.43909709776167
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5750.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 154.23388734596574,
                        "Call_Sim": 660.1090180871297,
                        "Call_Chg": 327.99220680110545,
                        "Put_Now": 6.624871828551022,
                        "Put_Sim": 2.5697146345701706e-06,
                        "Put_Chg": -99.99996121110414
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 6.82728782133654,
                        "Call_Sim": 360.8209654865068,
                        "Call_Chg": 5184.98248395028,
                        "Put_Now": 158.62362433230828,
                        "Put_Sim": 0.11730199747811199,
                        "Put_Chg": -99.92605010888393
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.001555884062920565,
                        "Call_Sim": 59.84798504448099,
                        "Call_Chg": 0.0,
                        "Put_Now": 501.10413642815365,
                        "Put_Sim": 48.45056558857095,
                        "Put_Chg": -90.33123814664069
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5289.875,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 154.23388734596574,
                        "Call_Sim": 202.58665763276622,
                        "Call_Chg": 31.350289562720558,
                        "Put_Now": 6.624871828551022,
                        "Put_Sim": 2.6026421153514434,
                        "Put_Chg": -60.714075944308675
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 6.82728782133654,
                        "Call_Sim": 15.358430184057625,
                        "Call_Chg": 124.9565359769905,
                        "Put_Now": 158.62362433230828,
                        "Put_Sim": 114.77976669502914,
                        "Put_Chg": -27.6401814810564
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.001555884062920565,
                        "Call_Sim": 0.008960115685495484,
                        "Call_Chg": 0.0,
                        "Put_Now": 501.10413642815365,
                        "Put_Sim": 448.7365406597755,
                        "Put_Chg": -10.450441726873748
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5185.125,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 154.23388734596574,
                        "Call_Sim": 110.10253849985429,
                        "Call_Chg": -28.613263664371864,
                        "Put_Now": 6.624871828551022,
                        "Put_Sim": 14.868522982439345,
                        "Put_Chg": 124.43487764338161
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 6.82728782133654,
                        "Call_Sim": 2.6293086255270737,
                        "Call_Chg": -61.48824109465553,
                        "Put_Now": 158.62362433230828,
                        "Put_Sim": 206.80064513649904,
                        "Put_Chg": 30.371907719913395
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.001555884062920565,
                        "Call_Sim": 0.00022495444173784018,
                        "Call_Chg": 0.0,
                        "Put_Now": 501.10413642815365,
                        "Put_Sim": 553.4778054985318,
                        "Put_Chg": 10.451653710882361
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.0001266928347841762,
            -0.14141278031573537,
            -0.2506555286754266,
            -0.0019039913669031624,
            -0.004061465168885007,
            3.405340004966986e-05,
            0.012362479111947565,
            0.36038252641172264,
            0.009667208509159355,
            0.02367436382108067,
            0.00019807443444071942,
            0.005556353883210918,
            0.16882419354636824,
            0.03804220314599356
        ],
        "flip_variations": {
            "Classic": 4500.0,
            "Spline": 4973.464335918743,
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
            -0.35422655459280195,
            -1449.6593435991572,
            -1617.1129808599844,
            -59.66576005125663,
            -637.1159053766295,
            -9.136610374560291,
            86.42554933262703,
            364.9225381949632,
            125.85688900264971,
            200.5253179767567,
            0.032814797143834874,
            41.71583763139603,
            -5566.373054467344,
            127.59162155235492
        ],
        "delta_cumulative": [
            -0.35422655459280195,
            -1450.01357015375,
            -3067.1265510137346,
            -3126.7923110649913,
            -3763.908216441621,
            -3773.0448268161813,
            -3686.6192774835545,
            -3321.6967392885913,
            -3195.839850285942,
            -2995.314532309185,
            -2995.281717512041,
            -2953.565879880645,
            -8519.938934347989,
            -8392.347312795633
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
            4395.568119809426,
            16987632.904805653,
            36305787.15200162,
            470504.89178947493,
            6044726.711991624,
            151728.60465820692,
            725284.3703129315,
            13087402.024885833,
            407506.65763858025,
            956938.2620544471,
            2857.4386953044545,
            189059.25505563736,
            13808850.540175322,
            974623.1696114539
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            176483.21393059683,
            46926.807661236366,
            725284.3703129315,
            13087402.024885833,
            407506.65763858025,
            956938.2620544471,
            2857.4386953044545,
            189059.25505563736,
            5871301.946763015,
            974623.1696114539
        ],
        "gamma_put": [
            4395.568119809426,
            16987632.904805653,
            36305787.15200162,
            470504.89178947493,
            5868243.498061027,
            104801.79699697057,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            7937548.593412307,
            0.0
        ],
        "gamma_exposure": [
            4395.568119809426,
            16992028.47292546,
            53297815.62492708,
            53768320.516716555,
            59813047.22870818,
            59964775.83336639,
            60690060.203679316,
            73777462.22856516,
            74184968.88620374,
            75141907.14825818,
            75144764.58695349,
            75333823.84200913,
            89142674.38218445,
            90117297.5517959
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
            "abs_call": 13090259.463581137,
            "abs_put": 18501524.968809735,
            "net": 31591784.432390872
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 32,
            "abs_call": 0.0,
            "abs_put": 17233032.485986695,
            "net": 17233032.485986695
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 53,
            "abs_call": 725284.3703129315,
            "abs_put": 571229.6972051843,
            "net": 1296514.0675181157
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 75,
            "abs_call": 0.0,
            "abs_put": 22827605.187507402,
            "net": 22827605.187507402
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 98,
            "abs_call": 0.0,
            "abs_put": 470504.89178947493,
            "net": 470504.89178947493
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 119,
            "abs_call": 46926.807661236366,
            "abs_put": 0.0,
            "net": 46926.807661236366
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 141,
            "abs_call": 5871301.946763015,
            "abs_put": 7937548.593412307,
            "net": 13808850.540175322
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 163,
            "abs_call": 0.0,
            "abs_put": 32666.783479086276,
            "net": 32666.783479086276
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 184,
            "abs_call": 956938.2620544471,
            "abs_put": 0.0,
            "net": 956938.2620544471
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 207,
            "abs_call": 974623.1696114539,
            "abs_put": 0.0,
            "net": 974623.1696114539
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 228,
            "abs_call": 0.0,
            "abs_put": 104801.79699697057,
            "net": 104801.79699697057
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 248,
            "abs_call": 773049.1266248145,
            "abs_put": 0.0,
            "net": 773049.1266248145
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
            "spot": 5237.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 43,
            "iv_atm": 0.0,
            "spot": 5237.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 74,
            "iv_atm": 0.0,
            "spot": 5237.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 104,
            "iv_atm": 0.0,
            "spot": 5237.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 137,
            "iv_atm": 0.0,
            "spot": 5237.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 166,
            "iv_atm": 0.0,
            "spot": 5237.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 196,
            "iv_atm": 0.0,
            "spot": 5237.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 228,
            "iv_atm": 0.0,
            "spot": 5237.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 257,
            "iv_atm": 0.0,
            "spot": 5237.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 288,
            "iv_atm": 0.0,
            "spot": 5237.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 319,
            "iv_atm": 0.0,
            "spot": 5237.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 347,
            "iv_atm": 0.0,
            "spot": 5237.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5237.5,
                    "lower": 5237.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5237.5,
                    "lower": 5237.5,
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
            -0.780859484517411,
            -1680.9560178150007,
            -14040.47684604166,
            6.427652684777163,
            201.85220519345924,
            9.159416016102417,
            114.63602870417944,
            10825.608544403976,
            43.47231475019285,
            142.24070599150883,
            7.187387822978105,
            30.371469444441285,
            4141.214857055998,
            255.70661759005742
        ],
        "vanna": [
            -13.255635809419019,
            -17029.924171710954,
            -18560.00159353576,
            -268.8264876112201,
            -2154.385931234573,
            -79.59620250608955,
            150.69299207189636,
            6371.639094159147,
            45.30137643517218,
            578.2066530352861,
            5.103046719453231,
            191.84306267422403,
            26063.48451597326,
            2194.28492092639
        ],
        "vex": [
            3520.250644529108,
            6259866.887773984,
            3767240.2294178456,
            226548.49748404196,
            2389688.470555624,
            144838.88910831936,
            188866.5971591212,
            643019.8960358044,
            496543.56346919097,
            865112.7448521357,
            140.3937870395926,
            230367.17180561036,
            9566379.58151277,
            991238.2321352571
        ],
        "theta": [
            -0.8946912547206347,
            -3373.4137632827405,
            -8827.262663707905,
            -71.60845380334794,
            -1049.4196045095346,
            -31.896015956841996,
            -296.931468727824,
            -4175.162470199435,
            -237.42203508099328,
            -472.0707029411399,
            -0.863642751563334,
            -95.04505115692137,
            2671.1426831641757,
            -408.82840463926146
        ],
        "charm_cum": [
            -0.780859484517411,
            -1681.736877299518,
            -15722.213723341178,
            -15715.7860706564,
            -15513.933865462941,
            -15504.774449446839,
            -15390.13842074266,
            -4564.529876338684,
            -4521.057561588491,
            -4378.816855596982,
            -4371.629467774004,
            -4341.257998329563,
            -200.0431412735643,
            55.66347631649313
        ],
        "vanna_cum": [
            -13.255635809419019,
            -17043.179807520373,
            -35603.181401056136,
            -35872.00788866736,
            -38026.39381990193,
            -38105.99002240802,
            -37955.29703033612,
            -31583.657936176976,
            -31538.356559741806,
            -30960.14990670652,
            -30955.046859987066,
            -30763.203797312843,
            -4699.719281339581,
            -2505.4343604131914
        ],
        "theta_cum": [
            -0.8946912547206347,
            -3374.3084545374613,
            -12201.571118245367,
            -12273.179572048715,
            -13322.59917655825,
            -13354.49519251509,
            -13651.426661242915,
            -17826.58913144235,
            -18064.01116652334,
            -18536.08186946448,
            -18536.945512216043,
            -18631.990563372965,
            -15960.847880208788,
            -16369.67628484805
        ],
        "r_gamma": [
            4395.568119809426,
            16987632.904805653,
            36305787.15200162,
            470504.89178947493,
            6044726.711991624,
            -151728.60465820692,
            -725284.3703129315,
            -13087402.024885833,
            -407506.65763858025,
            -956938.2620544471,
            -2857.4386953044545,
            -189059.25505563736,
            -13808850.540175322,
            -974623.1696114539
        ],
        "r_gamma_cum": [
            4395.568119809426,
            16992028.47292546,
            53297815.62492708,
            53768320.516716555,
            59813047.22870818,
            59661318.62404997,
            58936034.25373704,
            45848632.22885121,
            45441125.57121263,
            44484187.309158176,
            44481329.87046287,
            44292270.615407236,
            30483420.075231913,
            29508796.90562046
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.35422655459280195,
            "gamma": 4395.568119809426,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -1449.6593435991572,
            "gamma": 16987632.904805653,
            "volume": 160,
            "oi": 8900,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -1617.1129808599844,
            "gamma": 36305787.15200162,
            "volume": 875,
            "oi": 9855,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -59.66576005125663,
            "gamma": 470504.89178947493,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -637.1159053766295,
            "gamma": 6044726.711991624,
            "volume": 215,
            "oi": 2160,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -9.136610374560291,
            "gamma": 151728.60465820692,
            "volume": 40,
            "oi": 85,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": 86.42554933262703,
            "gamma": 725284.3703129315,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5400.0,
            "delta": 364.9225381949632,
            "gamma": 13087402.024885833,
            "volume": 1900,
            "oi": 3180,
            "iv": 11.82
        },
        {
            "strike": 5500.0,
            "delta": 125.85688900264971,
            "gamma": 407506.65763858025,
            "volume": 240,
            "oi": 240,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 200.5253179767567,
            "gamma": 956938.2620544471,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        },
        {
            "strike": 5750.0,
            "delta": 0.032814797143834874,
            "gamma": 2857.4386953044545,
            "volume": 200,
            "oi": 600,
            "iv": 11.82
        },
        {
            "strike": 5800.0,
            "delta": 41.71583763139603,
            "gamma": 189059.25505563736,
            "volume": 120,
            "oi": 120,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5566.373054467344,
            "gamma": 13808850.540175322,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 127.59162155235492,
            "gamma": 974623.1696114539,
            "volume": 500,
            "oi": 1000,
            "iv": 11.82
        }
    ]
};