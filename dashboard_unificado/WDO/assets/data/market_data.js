window.marketData = {
    "last_updated": "2026-03-18 15:39:25",
    "spot_price": 5225.0,
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
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 18/03/2026 15:39\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(2);\n  spot(5225.00);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 4500.00;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (4500.00)\n  // 2 = Spline (4974.55)\n  // 3 = HVL (4500.00)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (4500.00)\n  // 7 = HVL Gaussian (4500.00)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 4500.00;\n  if (ModeloFlip = 2) then GammaVal := 4974.55;\n  if (ModeloFlip = 3) then GammaVal := 4500.00;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 4500.00;\n  if (ModeloFlip = 7) then GammaVal := 4500.00;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirMaxPain) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirRange) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5186.10 <= LimitUpper) and (5186.10 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5186.10, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5263.90 <= LimitUpper) and (5263.90 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5263.90, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirRange) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5455.56 <= LimitUpper) and (5455.56 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5455.56, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5500.00 <= LimitUpper) and (5500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5750.00 <= LimitUpper) and (5750.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5750.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5800.00 <= LimitUpper) and (5800.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5800.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5546.61 > 0) then\n      HorizontalLineCustom(5546.61, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5300.00 <= LimitUpper) and (5300.00 >= LimitLower) then\n      HorizontalLineCustom(5300.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5450.00 <= LimitUpper) and (5450.00 >= LimitLower) then\n      HorizontalLineCustom(5450.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5550.00 <= LimitUpper) and (5550.00 >= LimitLower) then\n      HorizontalLineCustom(5550.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5675.00 <= LimitUpper) and (5675.00 >= LimitLower) then\n      HorizontalLineCustom(5675.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5775.00 <= LimitUpper) and (5775.00 >= LimitLower) then\n      HorizontalLineCustom(5775.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5900.00 <= LimitUpper) and (5900.00 >= LimitLower) then\n      HorizontalLineCustom(5900.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5438.20 <= LimitUpper) and (5438.20 >= LimitLower) then\n      HorizontalLineCustom(5438.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5461.80 <= LimitUpper) and (5461.80 >= LimitLower) then\n      HorizontalLineCustom(5461.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5538.20 <= LimitUpper) and (5538.20 >= LimitLower) then\n      HorizontalLineCustom(5538.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5657.30 <= LimitUpper) and (5657.30 >= LimitLower) then\n      HorizontalLineCustom(5657.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5692.70 <= LimitUpper) and (5692.70 >= LimitLower) then\n      HorizontalLineCustom(5692.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5769.10 <= LimitUpper) and (5769.10 >= LimitLower) then\n      HorizontalLineCustom(5769.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5780.90 <= LimitUpper) and (5780.90 >= LimitLower) then\n      HorizontalLineCustom(5780.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5876.40 <= LimitUpper) and (5876.40 >= LimitLower) then\n      HorizontalLineCustom(5876.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5923.60 <= LimitUpper) and (5923.60 >= LimitLower) then\n      HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5273.60 <= LimitUpper) and (5273.60 >= LimitLower) then\n      HorizontalLineCustom(5273.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5326.40 <= LimitUpper) and (5326.40 >= LimitLower) then\n      HorizontalLineCustom(5326.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5423.60 <= LimitUpper) and (5423.60 >= LimitLower) then\n      HorizontalLineCustom(5423.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5476.40 <= LimitUpper) and (5476.40 >= LimitLower) then\n      HorizontalLineCustom(5476.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5523.60 <= LimitUpper) and (5523.60 >= LimitLower) then\n      HorizontalLineCustom(5523.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5576.40 <= LimitUpper) and (5576.40 >= LimitLower) then\n      HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5635.40 <= LimitUpper) and (5635.40 >= LimitLower) then\n      HorizontalLineCustom(5635.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5714.60 <= LimitUpper) and (5714.60 >= LimitLower) then\n      HorizontalLineCustom(5714.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5761.80 <= LimitUpper) and (5761.80 >= LimitLower) then\n      HorizontalLineCustom(5761.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5788.20 <= LimitUpper) and (5788.20 >= LimitLower) then\n      HorizontalLineCustom(5788.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5847.20 <= LimitUpper) and (5847.20 >= LimitLower) then\n      HorizontalLineCustom(5847.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5952.80 <= LimitUpper) and (5952.80 >= LimitLower) then\n      HorizontalLineCustom(5952.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5232.84, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5217.16, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5240.67, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5209.33, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5255.23, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5194.77, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5263.07, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5186.93, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 39285,
        "total_volume": 5225,
        "gamma_exposure": 91922269.41101868,
        "delta_position": -8827.281203582304,
        "last_update": "2026-03-18T15:39:25.839777",
        "spot_price": 5225.0,
        "dealer_pressure": -0.050902468212047705,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 4500.0,
        "gamma_flip_selected": 4974.552336352427,
        "gamma_flip_model": "Spline",
        "call_wall": 5400.0,
        "put_wall": 5100.0,
        "effective_call_wall": 5455.555555555556,
        "effective_put_wall": 5100.0,
        "max_pain": 5100.0,
        "zero_gamma": 4500.0,
        "range_low": 5186.095171881978,
        "range_high": 5263.904828118023,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5263.904828118022,
                "sigma_1_down": 5186.095171881978,
                "sigma_2_up": 5302.809656236044,
                "sigma_2_down": 5147.190343763956
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5311.993840324843,
                "sigma_1_down": 5138.006159675157,
                "sigma_2_up": 5398.987680649686,
                "sigma_2_down": 5051.012319350314
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 10,
                "sigma_1_up": 5348.027868830312,
                "sigma_1_down": 5101.972131169688,
                "sigma_2_up": 5471.055737660625,
                "sigma_2_down": 4978.944262339375
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
                4441.25,
                4473.239795918367,
                4505.2295918367345,
                4537.219387755102,
                4569.209183673469,
                4601.198979591836,
                4633.188775510204,
                4665.178571428572,
                4697.168367346939,
                4729.158163265306,
                4761.147959183673,
                4793.1377551020405,
                4825.127551020408,
                4857.117346938775,
                4889.107142857142,
                4921.09693877551,
                4953.086734693878,
                4985.076530612245,
                5017.066326530612,
                5049.056122448979,
                5081.0459183673465,
                5113.035714285714,
                5145.025510204081,
                5177.015306122448,
                5209.0051020408155,
                5240.994897959183,
                5272.984693877551,
                5304.974489795918,
                5336.964285714285,
                5368.954081632653,
                5400.94387755102,
                5432.933673469387,
                5464.923469387754,
                5496.9132653061215,
                5528.90306122449,
                5560.892857142857,
                5592.882653061224,
                5624.872448979591,
                5656.862244897959,
                5688.852040816326,
                5720.841836734693,
                5752.83163265306,
                5784.8214285714275,
                5816.811224489795,
                5848.801020408162,
                5880.790816326529,
                5912.780612244897,
                5944.770408163265,
                5976.760204081632,
                6008.749999999999
            ],
            "deltas": [
                -27443.72282853163,
                -27288.461344064,
                -27105.042930560987,
                -26890.30884998476,
                -26641.037633601005,
                -26353.972589183188,
                -26025.852074550166,
                -25653.428840124026,
                -25233.440856393343,
                -24762.46654912962,
                -24236.584247312203,
                -23650.79936348165,
                -22998.344029006053,
                -22270.187966523532,
                -21455.32546057475,
                -20542.42426970196,
                -19523.047820329346,
                -18395.890046029224,
                -17170.605383613187,
                -15869.411585235062,
                -14525.123004905852,
                -13175.6043987547,
                -11856.22996520428,
                -10592.948712125435,
                -9398.42033133311,
                -8272.442262141818,
                -7206.160800476108,
                -6188.163409158386,
                -5210.059903605807,
                -4269.671618075698,
                -3371.1126746112586,
                -2522.3025929938467,
                -1731.287295359241,
                -1002.9143573203843,
                -336.9720337469531,
                271.8451270141025,
                832.4842985942973,
                1355.3457368766733,
                1850.1552481614317,
                2324.470713602104,
                2783.0568783871663,
                3228.0540887388674,
                3659.6721616794953,
                4077.0799045184067,
                4479.208908262524,
                4865.300492591549,
                5235.147781997691,
                5589.082224343888,
                5927.805268718565,
                6252.171010689964
            ],
            "flip_value": 5546.608979001655
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
                4441.25,
                4473.239795918367,
                4505.2295918367345,
                4537.219387755102,
                4569.209183673469,
                4601.198979591836,
                4633.188775510204,
                4665.178571428572,
                4697.168367346939,
                4729.158163265306,
                4761.147959183673,
                4793.1377551020405,
                4825.127551020408,
                4857.117346938775,
                4889.107142857142,
                4921.09693877551,
                4953.086734693878,
                4985.076530612245,
                5017.066326530612,
                5049.056122448979,
                5081.0459183673465,
                5113.035714285714,
                5145.025510204081,
                5177.015306122448,
                5209.0051020408155,
                5240.994897959183,
                5272.984693877551,
                5304.974489795918,
                5336.964285714285,
                5368.954081632653,
                5400.94387755102,
                5432.933673469387,
                5464.923469387754,
                5496.9132653061215,
                5528.90306122449,
                5560.892857142857,
                5592.882653061224,
                5624.872448979591,
                5656.862244897959,
                5688.852040816326,
                5720.841836734693,
                5752.83163265306,
                5784.8214285714275,
                5816.811224489795,
                5848.801020408162,
                5880.790816326529,
                5912.780612244897,
                5944.770408163265,
                5976.760204081632,
                6008.749999999999
            ],
            "pnl": [
                -25338886.417896636,
                -24153167.932920974,
                -22967507.338020314,
                -21781906.837865423,
                -20596369.589439176,
                -19410911.806059305,
                -18225590.873980667,
                -17040563.973967623,
                -15856198.82546278,
                -14673260.810849361,
                -13493190.928288642,
                -12318459.9217882,
                -11152936.727640886,
                -10002158.972070005,
                -8873366.443222385,
                -7775181.414072775,
                -6716900.317079342,
                -5707478.655088645,
                -4754401.60303007,
                -3862691.0235434463,
                -3034280.5213854397,
                -2267899.584512949,
                -1559477.439523803,
                -902949.4442120651,
                -291261.2277364051,
                282659.7945220424,
                825157.8830225002,
                1341435.369204891,
                1835478.6494340245,
                2310244.0245713936,
                2767975.717062882,
                3210527.175609327,
                3639593.600018404,
                4056818.112410555,
                4463783.407305431,
                4861929.123824934,
                5252438.534581991,
                5636123.348243468,
                6013315.1647733,
                6383758.597162725,
                6746501.349571979,
                7099790.5777246915,
                7441005.888015949,
                7766676.19012942,
                8072628.781198266,
                8354297.751520177,
                8607177.445082659,
                8827357.82496328,
                9012040.884581301,
                9159927.54372883
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
                        "Call_Now": 733.919719575285,
                        "Call_Sim": 908.9197195741908,
                        "Call_Chg": 23.844569825726627,
                        "Put_Now": 1.0948080174905844e-09,
                        "Put_Sim": 3.5751978177344574e-14,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 236.06550236896237,
                        "Call_Sim": 409.92351153007803,
                        "Call_Chg": 73.64820671229695,
                        "Put_Now": 1.1547028420848164,
                        "Put_Sim": 0.012712003200096245,
                        "Put_Chg": -98.8991104259218
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 143.23466263958107,
                        "Call_Sim": 310.34751326915466,
                        "Call_Chg": 116.67067702046172,
                        "Put_Now": 8.12564712216556,
                        "Put_Sim": 0.23849775173891175,
                        "Put_Chg": -97.06487682576905
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 102.69186688535774,
                        "Call_Sim": 261.0161423323543,
                        "Call_Chg": 154.17411353885043,
                        "Put_Now": 17.483743372673416,
                        "Put_Sim": 0.8080188196702665,
                        "Put_Chg": -95.3784564183596
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 68.58166992030056,
                        "Call_Sim": 212.65928760949737,
                        "Call_Chg": 210.08181611300927,
                        "Put_Now": 33.27443841234776,
                        "Put_Sim": 2.3520561015442922,
                        "Put_Chg": -92.93134245453871
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 42.19599451829663,
                        "Call_Sim": 166.34645306822586,
                        "Call_Chg": 294.2233260934193,
                        "Put_Now": 56.78965501507446,
                        "Put_Sim": 5.940113565003799,
                        "Put_Chg": -89.54014852982108
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 12.04302367459502,
                        "Call_Sim": 86.42714912747715,
                        "Call_Chg": 617.6532361204007,
                        "Put_Now": 126.43846818083603,
                        "Put_Sim": 25.82259363371827,
                        "Put_Chg": -79.57694837240037
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.5107772240119175,
                        "Call_Sim": 56.205064215686434,
                        "Call_Chg": 919.9117462195,
                        "Put_Now": 169.80711373498434,
                        "Put_Sim": 45.50140072665772,
                        "Put_Chg": -73.20406682274151
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8288445415219599,
                        "Call_Sim": 18.47030206176032,
                        "Call_Chg": 2128.4398504747783,
                        "Put_Now": 264.92696506195625,
                        "Put_Sim": 107.56842258219422,
                        "Put_Chg": -59.396952078080055
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.07920327625697254,
                        "Call_Sim": 4.147547363852709,
                        "Call_Chg": 5136.585605873325,
                        "Put_Now": 363.9791078061535,
                        "Put_Sim": 193.0474518937499,
                        "Put_Chg": -46.961941563810214
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 733.919719575285,
                        "Call_Sim": 608.9197202285704,
                        "Call_Chg": -17.03183550089801,
                        "Put_Now": 1.0948080174905844e-09,
                        "Put_Sim": 6.54380357686886e-07,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 236.06550236896237,
                        "Call_Sim": 121.29710366087738,
                        "Call_Chg": -48.61718360216219,
                        "Put_Now": 1.1547028420848164,
                        "Put_Sim": 11.386304133999033,
                        "Put_Chg": 886.0808962279037
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 143.23466263958107,
                        "Call_Sim": 53.082560648148046,
                        "Call_Chg": -62.94014334943575,
                        "Put_Now": 8.12564712216556,
                        "Put_Sim": 42.97354513073242,
                        "Put_Chg": 428.8630491165062
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 102.69186688535774,
                        "Call_Sim": 30.792909247019452,
                        "Call_Chg": -70.01426677596993,
                        "Put_Now": 17.483743372673416,
                        "Put_Sim": 70.58478573433467,
                        "Put_Chg": 303.7166654176396
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 68.58166992030056,
                        "Call_Sim": 16.153030885890985,
                        "Call_Chg": -76.44701433391373,
                        "Put_Now": 33.27443841234776,
                        "Put_Sim": 105.84579937793933,
                        "Put_Chg": 218.0994313600832
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 42.19599451829663,
                        "Call_Sim": 7.606993379680034,
                        "Call_Chg": -81.97223820289018,
                        "Put_Now": 56.78965501507446,
                        "Put_Sim": 147.200653876459,
                        "Put_Chg": 159.20328946774816
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 12.04302367459502,
                        "Call_Sim": 1.197262839537558,
                        "Call_Chg": -90.05845316020422,
                        "Put_Now": 126.43846818083603,
                        "Put_Sim": 240.59270734577785,
                        "Put_Chg": 90.28442119503937
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.5107772240119175,
                        "Call_Sim": 0.39787953775774554,
                        "Call_Chg": -92.77997419267687,
                        "Put_Now": 169.80711373498434,
                        "Put_Sim": 289.6942160487288,
                        "Put_Chg": 70.60193161333076
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8288445415219599,
                        "Call_Sim": 0.030675888928096917,
                        "Call_Chg": -96.2989574773855,
                        "Put_Now": 264.92696506195625,
                        "Put_Sim": 389.1287964093626,
                        "Put_Chg": 46.88153632015538
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.07920327625697254,
                        "Call_Sim": 0.0014684375659615445,
                        "Call_Chg": -98.14598885884816,
                        "Put_Now": 363.9791078061535,
                        "Put_Sim": 488.9013729674625,
                        "Put_Chg": 34.32127352425943
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 733.919719575285,
                        "Call_Sim": 46.837553513071725,
                        "Call_Chg": -93.61816391305355,
                        "Put_Now": 1.0948080174905844e-09,
                        "Put_Sim": 37.91783393888181,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 236.06550236896237,
                        "Call_Sim": 0.00013169805050343777,
                        "Call_Chg": -99.99994421122562,
                        "Put_Now": 1.1547028420848164,
                        "Put_Sim": 490.0893321711728,
                        "Put_Chg": 42342.89650195338
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 143.23466263958107,
                        "Call_Sim": 1.6984774866155776e-06,
                        "Call_Chg": -99.9999988141994,
                        "Put_Now": 8.12564712216556,
                        "Put_Sim": 589.8909861810625,
                        "Put_Chg": 7159.618554833958
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 102.69186688535774,
                        "Call_Sim": 1.5589218567148663e-07,
                        "Call_Chg": -99.99999984819424,
                        "Put_Now": 17.483743372673416,
                        "Put_Sim": 639.7918766432076,
                        "Put_Chg": 3559.3529372158587
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 68.58166992030056,
                        "Call_Sim": 1.2467518412653701e-08,
                        "Call_Chg": -99.9999999818209,
                        "Put_Now": 33.27443841234776,
                        "Put_Sim": 689.6927685045148,
                        "Put_Chg": 1972.7405221918868
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 42.19599451829663,
                        "Call_Sim": 8.716668752651267e-10,
                        "Call_Chg": -99.99999999793424,
                        "Put_Now": 56.78965501507446,
                        "Put_Sim": 739.5936604976496,
                        "Put_Chg": 1202.3387099311117
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 12.04302367459502,
                        "Call_Sim": 2.884560439690171e-12,
                        "Call_Chg": -99.99999999997604,
                        "Put_Now": 126.43846818083603,
                        "Put_Sim": 839.3954445062436,
                        "Put_Chg": 563.8766323123399
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.5107772240119175,
                        "Call_Sim": 1.3743570894583737e-13,
                        "Call_Chg": -99.9999999999975,
                        "Put_Now": 169.80711373498434,
                        "Put_Sim": 889.2963365109717,
                        "Put_Chg": 423.7097062369745
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8288445415219599,
                        "Call_Sim": 2.175159979771622e-16,
                        "Call_Chg": -99.99999999999997,
                        "Put_Now": 264.92696506195625,
                        "Put_Sim": 989.0981205204343,
                        "Put_Chg": 273.3474696655066
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.07920327625697254,
                        "Call_Sim": 2.1734029248899474e-19,
                        "Call_Chg": -100.0,
                        "Put_Now": 363.9791078061535,
                        "Put_Sim": 1088.899904529897,
                        "Put_Chg": 199.16549636409871
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5277.25,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 733.919719575285,
                        "Call_Sim": 786.169719574249,
                        "Call_Chg": 7.1193072764417415,
                        "Put_Now": 1.0948080174905844e-09,
                        "Put_Sim": 5.900767736239088e-11,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 236.06550236896237,
                        "Call_Sim": 287.51378658749127,
                        "Call_Chg": 21.794071434510993,
                        "Put_Now": 1.1547028420848164,
                        "Put_Sim": 0.3529870606127403,
                        "Put_Chg": -69.43048481846445
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 143.23466263958107,
                        "Call_Sim": 190.65758794453268,
                        "Call_Chg": 33.10855377533935,
                        "Put_Now": 8.12564712216556,
                        "Put_Sim": 3.298572427117392,
                        "Put_Chg": -59.40541870050724
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 102.69186688535774,
                        "Call_Sim": 145.53071264753999,
                        "Call_Chg": 41.715909021311596,
                        "Put_Now": 17.483743372673416,
                        "Put_Sim": 8.072589134855889,
                        "Put_Chg": -53.82802776965308
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 68.58166992030056,
                        "Call_Sim": 104.85014094905682,
                        "Call_Chg": 52.883621922452775,
                        "Put_Now": 33.27443841234776,
                        "Put_Sim": 17.292909441105166,
                        "Put_Chg": -48.02944762942125
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 42.19599451829663,
                        "Call_Sim": 70.48885818058261,
                        "Call_Chg": 67.05106488251603,
                        "Put_Now": 56.78965501507446,
                        "Put_Sim": 32.83251867736135,
                        "Put_Chg": -42.185740222147565
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 12.04302367459502,
                        "Call_Sim": 24.829018191368732,
                        "Call_Chg": 106.1693048378374,
                        "Put_Now": 126.43846818083603,
                        "Put_Sim": 86.97446269760985,
                        "Put_Chg": -31.2120243554229
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.5107772240119175,
                        "Call_Sim": 12.789987298866208,
                        "Call_Chg": 132.0904434883857,
                        "Put_Now": 169.80711373498434,
                        "Put_Sim": 124.83632380983727,
                        "Put_Chg": -26.483454630371007
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8288445415219599,
                        "Call_Sim": 2.4828883850766204,
                        "Call_Chg": 199.56020226874324,
                        "Put_Now": 264.92696506195625,
                        "Put_Sim": 214.33100890551123,
                        "Put_Chg": -19.098077141604886
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.07920327625697254,
                        "Call_Sim": 0.31114724745651046,
                        "Call_Chg": 292.84643535073343,
                        "Put_Now": 363.9791078061535,
                        "Put_Sim": 311.96105177735353,
                        "Put_Chg": -14.291495009791472
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5172.75,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 733.919719575285,
                        "Call_Sim": 681.6697195917668,
                        "Call_Chg": -7.119307274337158,
                        "Put_Now": 1.0948080174905844e-09,
                        "Put_Sim": 1.7577142198195477e-08,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 236.06550236896237,
                        "Call_Sim": 185.95763945868748,
                        "Call_Chg": -21.22625390301968,
                        "Put_Now": 1.1547028420848164,
                        "Put_Sim": 3.2968399318098136,
                        "Put_Chg": 185.51414369582463
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 143.23466263958107,
                        "Call_Sim": 100.53943028672893,
                        "Call_Chg": -29.807891166878665,
                        "Put_Now": 8.12564712216556,
                        "Put_Sim": 17.68041476931353,
                        "Put_Chg": 117.58777489960129
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 102.69186688535774,
                        "Call_Sim": 66.68700356201089,
                        "Call_Chg": -35.06106609546952,
                        "Put_Now": 17.483743372673416,
                        "Put_Sim": 33.72888004932656,
                        "Put_Chg": 92.91566645872773
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 68.58166992030056,
                        "Call_Sim": 40.66584352554037,
                        "Call_Chg": -40.70450081953596,
                        "Put_Now": 33.27443841234776,
                        "Put_Sim": 57.60861201758826,
                        "Put_Chg": 73.13173344560599
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 42.19599451829663,
                        "Call_Sim": 22.57635053160675,
                        "Call_Chg": -46.49646064908506,
                        "Put_Now": 56.78965501507446,
                        "Put_Sim": 89.42001102838458,
                        "Put_Chg": 57.45827475910639
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 12.04302367459502,
                        "Call_Sim": 5.097496863707022,
                        "Call_Chg": -57.672616101716336,
                        "Put_Now": 126.43846818083603,
                        "Put_Sim": 171.7429413699474,
                        "Put_Chg": 35.83124174228019
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.5107772240119175,
                        "Call_Sim": 2.052276704460894,
                        "Call_Chg": -62.75885195433813,
                        "Put_Now": 169.80711373498434,
                        "Put_Sim": 218.59861321543303,
                        "Put_Chg": 28.733483778893344
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8288445415219599,
                        "Call_Sim": 0.23555327966065676,
                        "Call_Chg": -71.58052350467028,
                        "Put_Now": 264.92696506195625,
                        "Put_Sim": 316.5836738000953,
                        "Put_Chg": 19.498471484795267
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.07920327625697254,
                        "Call_Sim": 0.016974117983656445,
                        "Call_Chg": -78.56891938587938,
                        "Put_Now": 363.9791078061535,
                        "Put_Sim": 416.1668786478813,
                        "Put_Chg": 14.338122634643566
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
                        "Call_Now": 143.23466263958107,
                        "Call_Sim": 310.34751326915466,
                        "Call_Chg": 116.67067702046172,
                        "Put_Now": 8.12564712216556,
                        "Put_Sim": 0.23849775173891175,
                        "Put_Chg": -97.06487682576905
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.5107772240119175,
                        "Call_Sim": 56.205064215686434,
                        "Call_Chg": 919.9117462195,
                        "Put_Now": 169.80711373498434,
                        "Put_Sim": 45.50140072665772,
                        "Put_Chg": -73.20406682274151
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.000997422099297346,
                        "Call_Sim": 0.20258220094995494,
                        "Call_Chg": 0.0,
                        "Put_Now": 513.6035779661897,
                        "Put_Sim": 338.80516274504043,
                        "Put_Chg": -34.0337222558555
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 143.23466263958107,
                        "Call_Sim": 53.082560648148046,
                        "Call_Chg": -62.94014334943575,
                        "Put_Now": 8.12564712216556,
                        "Put_Sim": 42.97354513073242,
                        "Put_Chg": 428.8630491165062
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.5107772240119175,
                        "Call_Sim": 0.39787953775774554,
                        "Call_Chg": -92.77997419267687,
                        "Put_Now": 169.80711373498434,
                        "Put_Sim": 289.6942160487288,
                        "Put_Chg": 70.60193161333076
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.000997422099297346,
                        "Call_Sim": 6.439484378330425e-06,
                        "Call_Chg": 0.0,
                        "Put_Now": 513.6035779661897,
                        "Put_Sim": 638.6025869835748,
                        "Put_Chg": 24.33764373534285
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5750.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 143.23466263958107,
                        "Call_Sim": 660.1090180871297,
                        "Call_Chg": 360.8584304402285,
                        "Put_Now": 8.12564712216556,
                        "Put_Sim": 2.5697146345701706e-06,
                        "Put_Chg": -99.99996837526174
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.5107772240119175,
                        "Call_Sim": 360.8209654865068,
                        "Call_Chg": 6447.551294839395,
                        "Put_Now": 169.80711373498434,
                        "Put_Sim": 0.11730199747811199,
                        "Put_Chg": -99.93092044561739
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.000997422099297346,
                        "Call_Sim": 59.84798504448099,
                        "Call_Chg": 0.0,
                        "Put_Now": 513.6035779661897,
                        "Put_Sim": 48.45056558857095,
                        "Put_Chg": -90.56654438031184
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5277.25,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 143.23466263958107,
                        "Call_Sim": 190.65758794453268,
                        "Call_Chg": 33.10855377533935,
                        "Put_Now": 8.12564712216556,
                        "Put_Sim": 3.298572427117392,
                        "Put_Chg": -59.40541870050724
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.5107772240119175,
                        "Call_Sim": 12.789987298866208,
                        "Call_Chg": 132.0904434883857,
                        "Put_Now": 169.80711373498434,
                        "Put_Sim": 124.83632380983727,
                        "Put_Chg": -26.483454630371007
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.000997422099297346,
                        "Call_Sim": 0.0059721734570277185,
                        "Call_Chg": 0.0,
                        "Put_Now": 513.6035779661897,
                        "Put_Sim": 461.35855271754735,
                        "Put_Chg": -10.17224713572413
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5172.75,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 143.23466263958107,
                        "Call_Sim": 100.53943028672893,
                        "Call_Chg": -29.807891166878665,
                        "Put_Now": 8.12564712216556,
                        "Put_Sim": 17.68041476931353,
                        "Put_Chg": 117.58777489960129
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.5107772240119175,
                        "Call_Sim": 2.052276704460894,
                        "Call_Chg": -62.75885195433813,
                        "Put_Now": 169.80711373498434,
                        "Put_Sim": 218.59861321543303,
                        "Put_Chg": 28.733483778893344
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.000997422099297346,
                        "Call_Sim": 0.00013857112449195547,
                        "Call_Chg": 0.0,
                        "Put_Now": 513.6035779661897,
                        "Put_Sim": 565.8527191152152,
                        "Put_Chg": 10.173048512614729
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.00013507274982226114,
            -0.1493917517889676,
            -0.25963036741410095,
            -0.00201175890656974,
            -0.005007828672651132,
            -1.224806907218609e-05,
            0.012149862002155497,
            0.32795824947623065,
            0.009482077568821454,
            0.02325599706556408,
            0.00013692273617285666,
            0.005466041173595185,
            0.1573557690682187,
            0.0370947504664869
        ],
        "flip_variations": {
            "Classic": 4500.0,
            "Spline": 4974.552336352427,
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
            -0.375763234618145,
            -1532.3199345275473,
            -1798.0886122495638,
            -61.933290396316785,
            -666.1969442874076,
            -9.86498107734629,
            82.97357711751873,
            306.1390315258649,
            123.90834479756852,
            195.96609013159704,
            0.02153840131585522,
            40.815986929833,
            -5631.319156353018,
            122.99290963981552
        ],
        "delta_cumulative": [
            -0.375763234618145,
            -1532.6956977621653,
            -3330.784310011729,
            -3392.7176004080457,
            -4058.9145446954535,
            -4068.7795257728,
            -3985.805948655281,
            -3679.666917129416,
            -3555.7585723318475,
            -3359.7924822002506,
            -3359.7709437989347,
            -3318.954956869102,
            -8950.27411322212,
            -8827.281203582304
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
            4618.898273617845,
            17605528.968356106,
            39441435.272294864,
            478394.8749828805,
            6124496.030883784,
            153081.67036671346,
            719140.114822441,
            11525460.038756011,
            407930.5586385144,
            951014.8206341378,
            1919.6953795459988,
            187517.15765341002,
            13371768.913602546,
            949962.3963741207
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            178397.30394390656,
            47325.0251204256,
            719140.114822441,
            11525460.038756011,
            407930.5586385144,
            951014.8206341378,
            1919.6953795459988,
            187517.15765341002,
            5685461.84388661,
            949962.3963741207
        ],
        "gamma_put": [
            4618.898273617845,
            17605528.968356106,
            39441435.272294864,
            478394.8749828805,
            5946098.7269398775,
            105756.64524628785,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            7686307.069715936,
            0.0
        ],
        "gamma_exposure": [
            4618.898273617845,
            17610147.866629723,
            57051583.138924584,
            57529978.01390746,
            63654474.044791244,
            63807555.715157956,
            64526695.829980396,
            76052155.8687364,
            76460086.42737491,
            77411101.24800906,
            77413020.9433886,
            77600538.101042,
            90972307.01464455,
            91922269.41101867
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
            "abs_call": 11527379.734135557,
            "abs_put": 20844922.68177796,
            "net": 32372302.415913522
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 32,
            "abs_call": 0.0,
            "abs_put": 18007645.76411091,
            "net": 18007645.76411091
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 53,
            "abs_call": 719140.114822441,
            "abs_put": 588866.826405984,
            "net": 1308006.9412284251
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 75,
            "abs_call": 0.0,
            "abs_put": 23523034.33789676,
            "net": 23523034.33789676
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 98,
            "abs_call": 0.0,
            "abs_put": 478394.8749828805,
            "net": 478394.8749828805
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 119,
            "abs_call": 47325.0251204256,
            "abs_put": 0.0,
            "net": 47325.0251204256
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 141,
            "abs_call": 5685461.84388661,
            "abs_put": 7686307.069715936,
            "net": 13371768.913602546
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 163,
            "abs_call": 0.0,
            "abs_put": 33212.2556728424,
            "net": 33212.2556728424
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 184,
            "abs_call": 951014.8206341378,
            "abs_put": 0.0,
            "net": 951014.8206341378
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 207,
            "abs_call": 949962.3963741207,
            "abs_put": 0.0,
            "net": 949962.3963741207
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 228,
            "abs_call": 0.0,
            "abs_put": 105756.64524628785,
            "net": 105756.64524628785
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 248,
            "abs_call": 773845.0202358309,
            "abs_put": 0.0,
            "net": 773845.0202358309
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
            "spot": 5225.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 43,
            "iv_atm": 0.0,
            "spot": 5225.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 74,
            "iv_atm": 0.0,
            "spot": 5225.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 104,
            "iv_atm": 0.0,
            "spot": 5225.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 137,
            "iv_atm": 0.0,
            "spot": 5225.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 166,
            "iv_atm": 0.0,
            "spot": 5225.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 196,
            "iv_atm": 0.0,
            "spot": 5225.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 228,
            "iv_atm": 0.0,
            "spot": 5225.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 257,
            "iv_atm": 0.0,
            "spot": 5225.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 288,
            "iv_atm": 0.0,
            "spot": 5225.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 319,
            "iv_atm": 0.0,
            "spot": 5225.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 347,
            "iv_atm": 0.0,
            "spot": 5225.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5225.0,
                    "lower": 5225.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5225.0,
                    "lower": 5225.0,
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
            -0.8034711531636385,
            -1600.7450552249788,
            -14005.89781868816,
            9.475077586819491,
            252.56227083874103,
            9.759835778031867,
            121.83639484829666,
            10220.731856195065,
            44.508008233677394,
            144.47248874969455,
            4.985151784180324,
            30.579032875832667,
            4067.237374799055,
            251.99980137889366
        ],
        "vanna": [
            -13.743195449226892,
            -16944.745011467992,
            -18534.207428265894,
            -253.9564407708017,
            -1933.8364341102067,
            -74.09516918655457,
            178.6649835508902,
            6068.996944591741,
            61.9606605337113,
            613.2578715285676,
            3.588759405485229,
            197.8743827523217,
            25769.87294705317,
            2176.5320917724734
        ],
        "vex": [
            3690.279223214978,
            6472075.39476898,
            3999191.4903504276,
            229797.77552281827,
            2415071.6785144843,
            145792.57889667907,
            186819.674431187,
            564925.91211393,
            495873.78249098116,
            857705.7750755192,
            94.09478316910406,
            227942.82085140893,
            9241473.053410217,
            963851.1858813948
        ],
        "theta": [
            -0.9339859646009966,
            -3454.83745281574,
            -9522.601420859415,
            -71.21440128609356,
            -1038.15372673862,
            -31.42681530665584,
            -291.06599018352716,
            -3652.611380305685,
            -235.23993883515664,
            -464.9593785949662,
            -0.5783104251991996,
            -93.53331478284122,
            2874.7378829226113,
            -396.23596578416004
        ],
        "charm_cum": [
            -0.8034711531636385,
            -1601.5485263781425,
            -15607.446345066302,
            -15597.971267479483,
            -15345.408996640741,
            -15335.64916086271,
            -15213.812766014413,
            -4993.080909819348,
            -4948.5729015856705,
            -4804.100412835976,
            -4799.115261051796,
            -4768.536228175963,
            -701.2988533769076,
            -449.2990519980139
        ],
        "vanna_cum": [
            -13.743195449226892,
            -16958.48820691722,
            -35492.69563518312,
            -35746.65207595392,
            -37680.488510064126,
            -37754.58367925068,
            -37575.918695699795,
            -31506.921751108053,
            -31444.961090574343,
            -30831.703219045776,
            -30828.114459640292,
            -30630.24007688797,
            -4860.367129834802,
            -2683.8350380623283
        ],
        "theta_cum": [
            -0.9339859646009966,
            -3455.771438780341,
            -12978.372859639756,
            -13049.58726092585,
            -14087.740987664469,
            -14119.167802971124,
            -14410.233793154652,
            -18062.845173460337,
            -18298.085112295492,
            -18763.044490890457,
            -18763.622801315658,
            -18857.1561160985,
            -15982.41823317589,
            -16378.65419896005
        ],
        "r_gamma": [
            4618.898273617845,
            17605528.968356106,
            39441435.272294864,
            478394.8749828805,
            6124496.030883784,
            -153081.67036671346,
            -719140.114822441,
            -11525460.038756011,
            -407930.5586385144,
            -951014.8206341378,
            -1919.6953795459988,
            -187517.15765341002,
            -13371768.913602548,
            -949962.3963741207
        ],
        "r_gamma_cum": [
            4618.898273617845,
            17610147.866629723,
            57051583.138924584,
            57529978.01390746,
            63654474.044791244,
            63501392.37442453,
            62782252.25960209,
            51256792.22084608,
            50848861.662207566,
            49897846.84157343,
            49895927.146193884,
            49708409.98854047,
            36336641.074937925,
            35386678.6785638
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.375763234618145,
            "gamma": 4618.898273617845,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -1532.3199345275473,
            "gamma": 17605528.968356106,
            "volume": 160,
            "oi": 8900,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -1798.0886122495638,
            "gamma": 39441435.272294864,
            "volume": 875,
            "oi": 9855,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -61.933290396316785,
            "gamma": 478394.8749828805,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -666.1969442874076,
            "gamma": 6124496.030883784,
            "volume": 215,
            "oi": 2160,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -9.86498107734629,
            "gamma": 153081.67036671346,
            "volume": 40,
            "oi": 85,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": 82.97357711751873,
            "gamma": 719140.114822441,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5400.0,
            "delta": 306.1390315258649,
            "gamma": 11525460.038756011,
            "volume": 1900,
            "oi": 3180,
            "iv": 11.82
        },
        {
            "strike": 5500.0,
            "delta": 123.90834479756852,
            "gamma": 407930.5586385144,
            "volume": 240,
            "oi": 240,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 195.96609013159704,
            "gamma": 951014.8206341378,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        },
        {
            "strike": 5750.0,
            "delta": 0.02153840131585522,
            "gamma": 1919.6953795459988,
            "volume": 200,
            "oi": 600,
            "iv": 11.82
        },
        {
            "strike": 5800.0,
            "delta": 40.815986929833,
            "gamma": 187517.15765341002,
            "volume": 120,
            "oi": 120,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5631.319156353018,
            "gamma": 13371768.913602546,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 122.99290963981552,
            "gamma": 949962.3963741207,
            "volume": 500,
            "oi": 1000,
            "iv": 11.82
        }
    ]
};