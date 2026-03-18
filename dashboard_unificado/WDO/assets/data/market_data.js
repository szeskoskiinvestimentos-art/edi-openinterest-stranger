window.marketData = {
    "last_updated": "2026-03-18 15:45:49",
    "spot_price": 5226.0,
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
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 18/03/2026 15:45\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(2);\n  spot(5226.00);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 4500.00;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (4500.00)\n  // 2 = Spline (4974.47)\n  // 3 = HVL (4500.00)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (4500.00)\n  // 7 = HVL Gaussian (4500.00)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 4500.00;\n  if (ModeloFlip = 2) then GammaVal := 4974.47;\n  if (ModeloFlip = 3) then GammaVal := 4500.00;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 4500.00;\n  if (ModeloFlip = 7) then GammaVal := 4500.00;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirMaxPain) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirRange) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5187.09 <= LimitUpper) and (5187.09 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5187.09, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5264.91 <= LimitUpper) and (5264.91 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5264.91, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirRange) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5455.56 <= LimitUpper) and (5455.56 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5455.56, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5500.00 <= LimitUpper) and (5500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5750.00 <= LimitUpper) and (5750.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5750.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5800.00 <= LimitUpper) and (5800.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5800.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5546.61 > 0) then\n      HorizontalLineCustom(5546.61, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5300.00 <= LimitUpper) and (5300.00 >= LimitLower) then\n      HorizontalLineCustom(5300.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5450.00 <= LimitUpper) and (5450.00 >= LimitLower) then\n      HorizontalLineCustom(5450.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5550.00 <= LimitUpper) and (5550.00 >= LimitLower) then\n      HorizontalLineCustom(5550.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5675.00 <= LimitUpper) and (5675.00 >= LimitLower) then\n      HorizontalLineCustom(5675.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5775.00 <= LimitUpper) and (5775.00 >= LimitLower) then\n      HorizontalLineCustom(5775.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5900.00 <= LimitUpper) and (5900.00 >= LimitLower) then\n      HorizontalLineCustom(5900.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5438.20 <= LimitUpper) and (5438.20 >= LimitLower) then\n      HorizontalLineCustom(5438.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5461.80 <= LimitUpper) and (5461.80 >= LimitLower) then\n      HorizontalLineCustom(5461.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5538.20 <= LimitUpper) and (5538.20 >= LimitLower) then\n      HorizontalLineCustom(5538.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5657.30 <= LimitUpper) and (5657.30 >= LimitLower) then\n      HorizontalLineCustom(5657.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5692.70 <= LimitUpper) and (5692.70 >= LimitLower) then\n      HorizontalLineCustom(5692.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5769.10 <= LimitUpper) and (5769.10 >= LimitLower) then\n      HorizontalLineCustom(5769.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5780.90 <= LimitUpper) and (5780.90 >= LimitLower) then\n      HorizontalLineCustom(5780.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5876.40 <= LimitUpper) and (5876.40 >= LimitLower) then\n      HorizontalLineCustom(5876.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5923.60 <= LimitUpper) and (5923.60 >= LimitLower) then\n      HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5273.60 <= LimitUpper) and (5273.60 >= LimitLower) then\n      HorizontalLineCustom(5273.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5326.40 <= LimitUpper) and (5326.40 >= LimitLower) then\n      HorizontalLineCustom(5326.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5423.60 <= LimitUpper) and (5423.60 >= LimitLower) then\n      HorizontalLineCustom(5423.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5476.40 <= LimitUpper) and (5476.40 >= LimitLower) then\n      HorizontalLineCustom(5476.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5523.60 <= LimitUpper) and (5523.60 >= LimitLower) then\n      HorizontalLineCustom(5523.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5576.40 <= LimitUpper) and (5576.40 >= LimitLower) then\n      HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5635.40 <= LimitUpper) and (5635.40 >= LimitLower) then\n      HorizontalLineCustom(5635.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5714.60 <= LimitUpper) and (5714.60 >= LimitLower) then\n      HorizontalLineCustom(5714.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5761.80 <= LimitUpper) and (5761.80 >= LimitLower) then\n      HorizontalLineCustom(5761.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5788.20 <= LimitUpper) and (5788.20 >= LimitLower) then\n      HorizontalLineCustom(5788.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5847.20 <= LimitUpper) and (5847.20 >= LimitLower) then\n      HorizontalLineCustom(5847.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5952.80 <= LimitUpper) and (5952.80 >= LimitLower) then\n      HorizontalLineCustom(5952.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5233.84, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5218.16, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5241.68, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5210.32, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5256.24, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5195.76, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5264.08, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5187.92, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 39285,
        "total_volume": 5225,
        "gamma_exposure": 91773459.34034783,
        "delta_position": -8792.127512085468,
        "last_update": "2026-03-18T15:45:49.324808",
        "spot_price": 5226.0,
        "dealer_pressure": 0.06712013109227269,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 4500.0,
        "gamma_flip_selected": 4974.470127673698,
        "gamma_flip_model": "Spline",
        "call_wall": 5400.0,
        "put_wall": 5100.0,
        "effective_call_wall": 5455.555555555556,
        "effective_put_wall": 5100.0,
        "max_pain": 5100.0,
        "zero_gamma": 4500.0,
        "range_low": 5187.08772598186,
        "range_high": 5264.912274018141,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5264.91227401814,
                "sigma_1_down": 5187.08772598186,
                "sigma_2_up": 5303.824548036281,
                "sigma_2_down": 5148.175451963719
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5313.010489863661,
                "sigma_1_down": 5138.989510136339,
                "sigma_2_up": 5400.020979727322,
                "sigma_2_down": 5051.979020272678
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 10,
                "sigma_1_up": 5349.051414833916,
                "sigma_1_down": 5102.948585166084,
                "sigma_2_up": 5472.102829667832,
                "sigma_2_down": 4979.897170332168
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
                4442.099999999999,
                4474.095918367347,
                4506.091836734693,
                4538.08775510204,
                4570.083673469388,
                4602.079591836734,
                4634.075510204081,
                4666.071428571428,
                4698.067346938775,
                4730.063265306122,
                4762.059183673469,
                4794.055102040816,
                4826.051020408163,
                4858.046938775509,
                4890.0428571428565,
                4922.038775510204,
                4954.03469387755,
                4986.030612244897,
                5018.026530612245,
                5050.022448979591,
                5082.018367346938,
                5114.0142857142855,
                5146.010204081632,
                5178.006122448979,
                5210.002040816326,
                5241.997959183673,
                5273.99387755102,
                5305.989795918367,
                5337.985714285714,
                5369.981632653061,
                5401.977551020408,
                5433.973469387754,
                5465.969387755102,
                5497.965306122449,
                5529.961224489795,
                5561.957142857143,
                5593.953061224489,
                5625.948979591836,
                5657.944897959183,
                5689.940816326531,
                5721.936734693877,
                5753.932653061224,
                5785.928571428571,
                5817.924489795918,
                5849.920408163265,
                5881.9163265306115,
                5913.912244897959,
                5945.908163265306,
                5977.904081632652,
                6009.9
            ],
            "deltas": [
                -27439.93516444457,
                -27283.933233153053,
                -27099.680048986364,
                -26884.013053738818,
                -26633.707593092608,
                -26345.504572198388,
                -26016.140724016183,
                -25642.367270418523,
                -25220.91854916177,
                -24748.36270927429,
                -24220.754408513687,
                -23633.055490358045,
                -22978.4340631762,
                -22247.78850634093,
                -21430.066525419246,
                -20513.96122134779,
                -19491.17823919476,
                -18360.68648871349,
                -17132.511987415037,
                -15829.250396407911,
                -14483.983240427038,
                -13134.63589679811,
                -11816.40729567376,
                -10554.89006633599,
                -9362.32490231163,
                -8238.161354537331,
                -7173.365188636468,
                -6156.5363245038,
                -5179.4436207830795,
                -4240.122574101614,
                -3342.860581554894,
                -2495.6449717787846,
                -1706.4688893448017,
                -980.0371261666305,
                -315.9615630628321,
                291.21588947075566,
                850.5324806861506,
                1372.4038353001133,
                1866.508115064003,
                2340.318433885698,
                2798.506537272355,
                3243.1346347723893,
                3674.3620111617215,
                4091.3365824254292,
                4492.992701094531,
                4878.588164982394,
                5247.93633054044,
                5601.385329610645,
                5939.646149611499,
                6263.575004615339
            ],
            "flip_value": 5546.611184623845
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
                4442.099999999999,
                4474.095918367347,
                4506.091836734693,
                4538.08775510204,
                4570.083673469388,
                4602.079591836734,
                4634.075510204081,
                4666.071428571428,
                4698.067346938775,
                4730.063265306122,
                4762.059183673469,
                4794.055102040816,
                4826.051020408163,
                4858.046938775509,
                4890.0428571428565,
                4922.038775510204,
                4954.03469387755,
                4986.030612244897,
                5018.026530612245,
                5050.022448979591,
                5082.018367346938,
                5114.0142857142855,
                5146.010204081632,
                5178.006122448979,
                5210.002040816326,
                5241.997959183673,
                5273.99387755102,
                5305.989795918367,
                5337.985714285714,
                5369.981632653061,
                5401.977551020408,
                5433.973469387754,
                5465.969387755102,
                5497.965306122449,
                5529.961224489795,
                5561.957142857143,
                5593.953061224489,
                5625.948979591836,
                5657.944897959183,
                5689.940816326531,
                5721.936734693877,
                5753.932653061224,
                5785.928571428571,
                5817.924489795918,
                5849.920408163265,
                5881.9163265306115,
                5913.912244897959,
                5945.908163265306,
                5977.904081632652,
                6009.9
            ],
            "pnl": [
                -25299033.34526176,
                -24114161.351467,
                -22929347.362901166,
                -21744593.532984503,
                -20559903.1655536,
                -19375293.134813376,
                -18190822.63571687,
                -17006652.9773971,
                -15823160.230128942,
                -14641124.949987987,
                -13462012.91740855,
                -12288331.104348587,
                -11123995.441133205,
                -9974596.740334505,
                -8847425.388625605,
                -7751140.079405474,
                -6695048.101959974,
                -5688082.745891122,
                -4737673.175257729,
                -3848758.4162643254,
                -3023175.615565719,
                -2259560.2710519014,
                -1553764.9710048847,
                -899675.9050714038,
                -290220.3307770407,
                281665.41262622736,
                822297.9028246049,
                1336843.6781023126,
                1829254.917924176,
                2302461.720884258,
                2758692.395246,
                3199793.3764636824,
                3627458.1823084927,
                4043329.565856286,
                4448988.019414997,
                4845867.416505487,
                5235141.1842509005,
                5617607.18453945,
                5993579.241172533,
                6362780.088178555,
                6724231.293659776,
                7076150.149097692,
                7415884.631856158,
                7739934.073692447,
                8044103.632227499,
                8323818.549864763,
                8574582.242600556,
                8792513.36547359,
                8974859.971667768,
                9120380.353967518
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
                        "Call_Now": 734.9197195752258,
                        "Call_Sim": 908.9197195741908,
                        "Call_Chg": 23.676055406369386,
                        "Put_Now": 1.0366834080563219e-09,
                        "Put_Sim": 3.5751978177344574e-14,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 237.0410543361504,
                        "Call_Sim": 409.92351153007803,
                        "Call_Chg": 72.93355055228584,
                        "Put_Now": 1.130254809273012,
                        "Put_Sim": 0.012712003200096245,
                        "Put_Chg": -98.87529757928898
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.10510412357326,
                        "Call_Sim": 310.34751326915466,
                        "Call_Chg": 115.36191598253518,
                        "Put_Now": 7.996088606158764,
                        "Put_Sim": 0.23849775173891175,
                        "Put_Chg": -97.01731979864235
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 103.45429547142294,
                        "Call_Sim": 261.0161423323543,
                        "Call_Chg": 152.30092297564823,
                        "Put_Now": 17.246171958738387,
                        "Put_Sim": 0.8080188196702665,
                        "Put_Chg": -95.31479320974266
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 69.20102814449365,
                        "Call_Sim": 212.65928760949737,
                        "Call_Chg": 207.30654343091396,
                        "Put_Now": 32.89379663654131,
                        "Put_Sim": 2.3520561015442922,
                        "Put_Chg": -92.8495450752212
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 42.65512748687479,
                        "Call_Sim": 166.34645306822586,
                        "Call_Chg": 289.97996927663985,
                        "Put_Now": 56.24878798365353,
                        "Put_Sim": 5.940113565003799,
                        "Put_Chg": -89.43957056153803
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 12.226031561060609,
                        "Call_Sim": 86.42714912747715,
                        "Call_Chg": 606.910894968928,
                        "Put_Now": 125.62147606730196,
                        "Put_Sim": 25.82259363371827,
                        "Put_Chg": -79.44412496802397
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.607743423949671,
                        "Call_Sim": 56.205064215686434,
                        "Call_Chg": 902.2759596247688,
                        "Put_Now": 168.90407993492136,
                        "Put_Sim": 45.50140072665772,
                        "Put_Chg": -73.06080424807419
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8476844742762779,
                        "Call_Sim": 18.47030206176032,
                        "Call_Chg": 2078.9123927897335,
                        "Put_Now": 263.94580499471067,
                        "Put_Sim": 107.56842258219422,
                        "Put_Chg": -59.2460192408249
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.08143387108050426,
                        "Call_Sim": 4.147547363852709,
                        "Call_Chg": 4993.1477391667995,
                        "Put_Now": 362.9813384009776,
                        "Put_Sim": 193.0474518937499,
                        "Put_Chg": -46.816149627919835
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 734.9197195752258,
                        "Call_Sim": 608.9197202285704,
                        "Call_Chg": -17.144729688227955,
                        "Put_Now": 1.0366834080563219e-09,
                        "Put_Sim": 6.54380357686886e-07,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 237.0410543361504,
                        "Call_Sim": 121.29710366087738,
                        "Call_Chg": -48.82865164408833,
                        "Put_Now": 1.130254809273012,
                        "Put_Sim": 11.386304133999033,
                        "Put_Chg": 907.4103680499077
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.10510412357326,
                        "Call_Sim": 53.082560648148046,
                        "Call_Chg": -63.16399688200593,
                        "Put_Now": 7.996088606158764,
                        "Put_Sim": 42.97354513073242,
                        "Put_Chg": 437.43207769900454
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 103.45429547142294,
                        "Call_Sim": 30.792909247019452,
                        "Call_Chg": -70.2352530586559,
                        "Put_Now": 17.246171958738387,
                        "Put_Sim": 70.58478573433467,
                        "Put_Chg": 309.2779887804051
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 69.20102814449365,
                        "Call_Sim": 16.153030885890985,
                        "Call_Chg": -76.65781662641918,
                        "Put_Now": 32.89379663654131,
                        "Put_Sim": 105.84579937793933,
                        "Put_Chg": 221.78042731727885
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 42.65512748687479,
                        "Call_Sim": 7.606993379680034,
                        "Call_Chg": -82.1662861469099,
                        "Put_Now": 56.24878798365353,
                        "Put_Sim": 147.200653876459,
                        "Put_Chg": 161.6956900817792
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 12.226031561060609,
                        "Call_Sim": 1.197262839537558,
                        "Call_Chg": -90.20726526380982,
                        "Put_Now": 125.62147606730196,
                        "Put_Sim": 240.59270734577785,
                        "Put_Chg": 91.52195538355228
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.607743423949671,
                        "Call_Sim": 0.39787953775774554,
                        "Call_Chg": -92.904819145996,
                        "Put_Now": 168.90407993492136,
                        "Put_Sim": 289.6942160487288,
                        "Put_Chg": 71.51404285814043
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8476844742762779,
                        "Call_Sim": 0.030675888928096917,
                        "Call_Chg": -96.3812137818984,
                        "Put_Now": 263.94580499471067,
                        "Put_Sim": 389.1287964093626,
                        "Put_Chg": 47.42753589781832
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.08143387108050426,
                        "Call_Sim": 0.0014684375659615445,
                        "Call_Chg": -98.19677298097511,
                        "Put_Now": 362.9813384009776,
                        "Put_Sim": 488.9013729674625,
                        "Put_Chg": 34.69049817304485
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 734.9197195752258,
                        "Call_Sim": 46.837553513071725,
                        "Call_Chg": -93.62684763171912,
                        "Put_Now": 1.0366834080563219e-09,
                        "Put_Sim": 37.91783393888181,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 237.0410543361504,
                        "Call_Sim": 0.00013169805050343777,
                        "Call_Chg": -99.99994444082657,
                        "Put_Now": 1.130254809273012,
                        "Put_Sim": 490.0893321711728,
                        "Put_Chg": 43260.95968363114
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.10510412357326,
                        "Call_Sim": 1.6984774866155776e-06,
                        "Call_Chg": -99.99999882136203,
                        "Put_Now": 7.996088606158764,
                        "Put_Sim": 589.8909861810625,
                        "Put_Chg": 7277.244240724339
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 103.45429547142294,
                        "Call_Sim": 1.5589218567148663e-07,
                        "Call_Chg": -99.999999849313,
                        "Put_Now": 17.246171958738387,
                        "Put_Sim": 639.7918766432076,
                        "Put_Chg": 3609.7616686990896
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 69.20102814449365,
                        "Call_Sim": 1.2467518412653701e-08,
                        "Call_Chg": -99.9999999819836,
                        "Put_Now": 32.89379663654131,
                        "Put_Sim": 689.6927685045148,
                        "Put_Chg": 1996.7259453970833
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 42.65512748687479,
                        "Call_Sim": 8.716668752651267e-10,
                        "Call_Chg": -99.99999999795648,
                        "Put_Now": 56.24878798365353,
                        "Put_Sim": 739.5936604976496,
                        "Put_Chg": 1214.8615054827192
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 12.226031561060609,
                        "Call_Sim": 2.884560439690171e-12,
                        "Call_Chg": -99.99999999997641,
                        "Put_Now": 125.62147606730196,
                        "Put_Sim": 839.3954445062436,
                        "Put_Chg": 568.1942218673946
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.607743423949671,
                        "Call_Sim": 1.3743570894583737e-13,
                        "Call_Chg": -99.99999999999754,
                        "Put_Now": 168.90407993492136,
                        "Put_Sim": 889.2963365109717,
                        "Put_Chg": 426.509683397593
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8476844742762779,
                        "Call_Sim": 2.175159979771622e-16,
                        "Call_Chg": -99.99999999999997,
                        "Put_Now": 263.94580499471067,
                        "Put_Sim": 989.0981205204343,
                        "Put_Chg": 274.7353061891836
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.08143387108050426,
                        "Call_Sim": 2.1734029248899474e-19,
                        "Call_Chg": -100.0,
                        "Put_Now": 362.9813384009776,
                        "Put_Sim": 1088.899904529897,
                        "Put_Chg": 199.98784767469584
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5278.26,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 734.9197195752258,
                        "Call_Sim": 787.1797195742456,
                        "Call_Chg": 7.110980778856415,
                        "Put_Now": 1.0366834080563219e-09,
                        "Put_Sim": 5.5690576861559234e-11,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 237.0410543361504,
                        "Call_Sim": 288.51532638182744,
                        "Call_Chg": 21.71534048809993,
                        "Put_Now": 1.130254809273012,
                        "Put_Sim": 0.3445268549496774,
                        "Put_Chg": -69.5177713801298
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.10510412357326,
                        "Call_Sim": 191.60654111885742,
                        "Call_Chg": 32.963049632545044,
                        "Put_Now": 7.996088606158764,
                        "Put_Sim": 3.23752560144203,
                        "Put_Chg": -59.51113399433298
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 103.45429547142294,
                        "Call_Sim": 146.41160802874583,
                        "Call_Chg": 41.522985934584945,
                        "Put_Now": 17.246171958738387,
                        "Put_Sim": 7.943484516062085,
                        "Put_Chg": -53.94059310630244
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 69.20102814449365,
                        "Call_Sim": 105.62400172731213,
                        "Call_Chg": 52.63357288097846,
                        "Put_Now": 32.89379663654131,
                        "Put_Sim": 17.056770219359578,
                        "Put_Chg": -48.145936427382715
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 42.65512748687479,
                        "Call_Sim": 71.12061831320261,
                        "Call_Chg": 66.73404231434264,
                        "Put_Now": 56.24878798365353,
                        "Put_Sim": 32.45427880998113,
                        "Put_Chg": -42.30226112709721
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 12.226031561060609,
                        "Call_Sim": 25.147295635117416,
                        "Call_Chg": 105.68649368786586,
                        "Put_Now": 125.62147606730196,
                        "Put_Sim": 86.28274014135786,
                        "Put_Chg": -31.315295089247545
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.607743423949671,
                        "Call_Sim": 12.982285681341182,
                        "Call_Chg": 131.50641354053678,
                        "Put_Now": 168.90407993492136,
                        "Put_Sim": 124.01862219231225,
                        "Put_Chg": -26.57452547025711
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8476844742762779,
                        "Call_Sim": 2.5322654792310573,
                        "Call_Chg": 198.7273633143999,
                        "Put_Now": 263.94580499471067,
                        "Put_Sim": 213.3703859996649,
                        "Put_Chg": -19.16128918815712
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.08143387108050426,
                        "Call_Sim": 0.31896410915417306,
                        "Call_Chg": 291.6848172904001,
                        "Put_Now": 362.9813384009776,
                        "Put_Sim": 310.9588686390507,
                        "Put_Chg": -14.331995686361932
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5173.74,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 734.9197195752258,
                        "Call_Sim": 682.6597195908889,
                        "Call_Chg": -7.1109807768585265,
                        "Put_Now": 1.0366834080563219e-09,
                        "Put_Sim": 1.6699334471589514e-08,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 237.0410543361504,
                        "Call_Sim": 186.88679734588277,
                        "Call_Chg": -21.158468574453504,
                        "Put_Now": 1.130254809273012,
                        "Put_Sim": 3.2359978190043535,
                        "Put_Chg": 186.30692764632167
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.10510412357326,
                        "Call_Sim": 101.2903940127585,
                        "Call_Chg": -29.710752003690455,
                        "Put_Now": 7.996088606158764,
                        "Put_Sim": 17.441378495343315,
                        "Put_Chg": 118.12387724054958
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 103.45429547142294,
                        "Call_Sim": 67.29393140095863,
                        "Call_Chg": -34.952984702750065,
                        "Put_Now": 17.246171958738387,
                        "Put_Sim": 33.345807888274976,
                        "Put_Chg": 93.35193901611967
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 69.20102814449365,
                        "Call_Sim": 41.1123703018302,
                        "Call_Chg": -40.58994294710992,
                        "Put_Now": 32.89379663654131,
                        "Put_Sim": 57.06513879387785,
                        "Put_Chg": 73.48298046715864
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 42.65512748687479,
                        "Call_Sim": 22.871612875465644,
                        "Call_Chg": -46.380155861676045,
                        "Put_Now": 56.24878798365353,
                        "Put_Sim": 88.72527337224437,
                        "Put_Chg": 57.73721808553252
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 12.226031561060609,
                        "Call_Sim": 5.188208216186922,
                        "Call_Chg": -57.56424977086477,
                        "Put_Now": 125.62147606730196,
                        "Put_Sim": 170.84365272242758,
                        "Put_Chg": 35.99876236997705
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.607743423949671,
                        "Call_Sim": 2.0940401888052804,
                        "Call_Chg": -62.65805992724259,
                        "Put_Now": 168.90407993492136,
                        "Put_Sim": 217.65037669977755,
                        "Put_Chg": 28.860342973146725
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.8476844742762779,
                        "Call_Sim": 0.24161192609334492,
                        "Call_Chg": -71.49742228089946,
                        "Put_Now": 263.94580499471067,
                        "Put_Sim": 315.5997324465279,
                        "Put_Chg": 19.569898999854296
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.08143387108050426,
                        "Call_Sim": 0.017505721601488666,
                        "Call_Chg": -78.50314449108924,
                        "Put_Now": 362.9813384009776,
                        "Put_Sim": 415.17741025149826,
                        "Put_Chg": 14.379822411933688
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
                        "Call_Now": 144.10510412357326,
                        "Call_Sim": 310.34751326915466,
                        "Call_Chg": 115.36191598253518,
                        "Put_Now": 7.996088606158764,
                        "Put_Sim": 0.23849775173891175,
                        "Put_Chg": -97.01731979864235
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.607743423949671,
                        "Call_Sim": 56.205064215686434,
                        "Call_Chg": 902.2759596247688,
                        "Put_Now": 168.90407993492136,
                        "Put_Sim": 45.50140072665772,
                        "Put_Chg": -73.06080424807419
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0010339383748971254,
                        "Call_Sim": 0.20258220094995494,
                        "Call_Chg": 0.0,
                        "Put_Now": 512.6036144824657,
                        "Put_Sim": 338.80516274504043,
                        "Put_Chg": -33.905038284385775
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.10510412357326,
                        "Call_Sim": 53.082560648148046,
                        "Call_Chg": -63.16399688200593,
                        "Put_Now": 7.996088606158764,
                        "Put_Sim": 42.97354513073242,
                        "Put_Chg": 437.43207769900454
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.607743423949671,
                        "Call_Sim": 0.39787953775774554,
                        "Call_Chg": -92.904819145996,
                        "Put_Now": 168.90407993492136,
                        "Put_Sim": 289.6942160487288,
                        "Put_Chg": 71.51404285814043
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0010339383748971254,
                        "Call_Sim": 6.439484378330425e-06,
                        "Call_Chg": 0.0,
                        "Put_Now": 512.6036144824657,
                        "Put_Sim": 638.6025869835748,
                        "Put_Chg": 24.58019587480282
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5750.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.10510412357326,
                        "Call_Sim": 660.1090180871297,
                        "Call_Chg": 358.07469631406804,
                        "Put_Now": 7.996088606158764,
                        "Put_Sim": 2.5697146345701706e-06,
                        "Put_Chg": -99.99996786285443
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.607743423949671,
                        "Call_Sim": 360.8209654865068,
                        "Call_Chg": 6334.334423103326,
                        "Put_Now": 168.90407993492136,
                        "Put_Sim": 0.11730199747811199,
                        "Put_Chg": -99.93055111663182
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0010339383748971254,
                        "Call_Sim": 59.84798504448099,
                        "Call_Chg": 0.0,
                        "Put_Now": 512.6036144824657,
                        "Put_Sim": 48.45056558857095,
                        "Put_Chg": -90.54814203027274
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5278.26,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.10510412357326,
                        "Call_Sim": 191.60654111885742,
                        "Call_Chg": 32.963049632545044,
                        "Put_Now": 7.996088606158764,
                        "Put_Sim": 3.23752560144203,
                        "Put_Chg": -59.51113399433298
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.607743423949671,
                        "Call_Sim": 12.982285681341182,
                        "Call_Chg": 131.50641354053678,
                        "Put_Now": 168.90407993492136,
                        "Put_Sim": 124.01862219231225,
                        "Put_Chg": -26.57452547025711
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0010339383748971254,
                        "Call_Sim": 0.006171503384736932,
                        "Call_Chg": 0.0,
                        "Put_Now": 512.6036144824657,
                        "Put_Sim": 460.3487520474746,
                        "Put_Chg": -10.194009749179896
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5173.74,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.10510412357326,
                        "Call_Sim": 101.2903940127585,
                        "Call_Chg": -29.710752003690455,
                        "Put_Now": 7.996088606158764,
                        "Put_Sim": 17.441378495343315,
                        "Put_Chg": 118.12387724054958
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.607743423949671,
                        "Call_Sim": 2.0940401888052804,
                        "Call_Chg": -62.65805992724259,
                        "Put_Now": 168.90407993492136,
                        "Put_Sim": 217.65037669977755,
                        "Put_Chg": 28.860342973146725
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0010339383748971254,
                        "Call_Sim": 0.00014410454969835881,
                        "Call_Chg": 0.0,
                        "Put_Now": 512.6036144824657,
                        "Put_Sim": 564.8627246486394,
                        "Put_Chg": 10.194838407242901
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.00013438372160029104,
            -0.14877326246528363,
            -0.2589671623856721,
            -0.0020045826833683935,
            -0.004952975407970062,
            -9.116359216487053e-06,
            0.012163215614678955,
            0.3304041142972394,
            0.009494826692952846,
            0.023284080269825255,
            0.00014100624607199145,
            0.005472131853895838,
            0.15816534246594108,
            0.03716282599099597
        ],
        "flip_variations": {
            "Classic": 4500.0,
            "Spline": 4974.470127673698,
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
            -0.37399888705306417,
            -1525.5910769282984,
            -1783.04125519275,
            -61.75030849718526,
            -663.8540345062108,
            -9.80641101082612,
            83.24892365472665,
            310.5736619848176,
            124.06447025438078,
            196.33017449372255,
            0.022285117253084637,
            40.88778107293208,
            -5626.194597285037,
            123.35687364405973
        ],
        "delta_cumulative": [
            -0.37399888705306417,
            -1525.9650758153516,
            -3309.0063310081014,
            -3370.756639505287,
            -4034.6106740114974,
            -4044.4170850223236,
            -3961.168161367597,
            -3650.5944993827793,
            -3526.5300291283984,
            -3330.199854634676,
            -3330.177569517423,
            -3289.2897884444906,
            -8915.484385729527,
            -8792.127512085468
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
            4600.708748201968,
            17556113.65132112,
            39188563.42976361,
            477776.6321796232,
            6118371.235111713,
            152976.12863860573,
            719681.7845636338,
            11647789.049829297,
            407902.8326750463,
            951507.4812040941,
            1982.5851304221922,
            187643.06678059927,
            13406619.078477848,
            951931.6759240131
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            178245.97317607858,
            47294.51628390366,
            719681.7845636338,
            11647789.049829297,
            407902.8326750463,
            951507.4812040941,
            1982.5851304221922,
            187643.06678059927,
            5700279.575477091,
            951931.6759240131
        ],
        "gamma_put": [
            4600.708748201968,
            17556113.65132112,
            39188563.42976361,
            477776.6321796232,
            5940125.261935635,
            105681.61235470207,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            7706339.503000759,
            0.0
        ],
        "gamma_exposure": [
            4600.708748201968,
            17560714.360069323,
            56749277.789832935,
            57227054.42201256,
            63345425.65712427,
            63498401.785762876,
            64218083.57032651,
            75865872.62015581,
            76273775.45283085,
            77225282.93403494,
            77227265.51916537,
            77414908.58594596,
            90821527.66442381,
            91773459.34034783
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
            "abs_call": 11649771.634959718,
            "abs_put": 20654613.22848615,
            "net": 32304384.86344587
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 32,
            "abs_call": 0.0,
            "abs_put": 17946473.688343037,
            "net": 17946473.688343037
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 53,
            "abs_call": 719681.7845636338,
            "abs_put": 587476.5129344275,
            "net": 1307158.2974980613
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 75,
            "abs_call": 0.0,
            "abs_put": 23467670.825346887,
            "net": 23467670.825346887
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 98,
            "abs_call": 0.0,
            "abs_put": 477776.6321796232,
            "net": 477776.6321796232
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 119,
            "abs_call": 47294.51628390366,
            "abs_put": 0.0,
            "net": 47294.51628390366
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 141,
            "abs_call": 5700279.575477091,
            "abs_put": 7706339.503000759,
            "net": 13406619.078477848
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 163,
            "abs_call": 0.0,
            "abs_put": 33168.79665807154,
            "net": 33168.79665807154
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 184,
            "abs_call": 951507.4812040941,
            "abs_put": 0.0,
            "net": 951507.4812040941
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 207,
            "abs_call": 951931.6759240131,
            "abs_put": 0.0,
            "net": 951931.6759240131
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 228,
            "abs_call": 0.0,
            "abs_put": 105681.61235470207,
            "net": 105681.61235470207
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 248,
            "abs_call": 773791.8726317242,
            "abs_put": 0.0,
            "net": 773791.8726317242
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
            "spot": 5226.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 43,
            "iv_atm": 0.0,
            "spot": 5226.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 74,
            "iv_atm": 0.0,
            "spot": 5226.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 104,
            "iv_atm": 0.0,
            "spot": 5226.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 137,
            "iv_atm": 0.0,
            "spot": 5226.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 166,
            "iv_atm": 0.0,
            "spot": 5226.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 196,
            "iv_atm": 0.0,
            "spot": 5226.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 228,
            "iv_atm": 0.0,
            "spot": 5226.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 257,
            "iv_atm": 0.0,
            "spot": 5226.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 288,
            "iv_atm": 0.0,
            "spot": 5226.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 319,
            "iv_atm": 0.0,
            "spot": 5226.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 347,
            "iv_atm": 0.0,
            "spot": 5226.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5226.0,
                    "lower": 5226.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5226.0,
                    "lower": 5226.0,
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
            -0.8016681325852293,
            -1607.5410133429186,
            -14018.822346199076,
            9.227707063105361,
            248.465344394173,
            9.711596680935351,
            121.2732369579294,
            10273.630759085867,
            44.425663615854575,
            144.29794781122467,
            5.135318846988693,
            30.56307722784858,
            4073.252555016473,
            252.3004332479587
        ],
        "vanna": [
            -13.703894038121861,
            -16953.48374824916,
            -18544.889641610956,
            -255.17867990186406,
            -1951.8247073613334,
            -74.54107985272704,
            176.45587222978986,
            6096.382598256548,
            60.626116962447355,
            610.4806589641839,
            3.6926488734556275,
            197.39860127497977,
            25794.377795930617,
            2178.013502668849
        ],
        "vex": [
            3676.450152924862,
            6455144.728048364,
            3980669.0972358882,
            229544.725160254,
            2413142.639006864,
            145718.81378466752,
            186996.17238570776,
            571031.194198017,
            495934.9768815106,
            858314.337389586,
            97.19595279250076,
            228139.52866060872,
            9267331.949784225,
            966034.1085340611
        ],
        "theta": [
            -0.9308011513460175,
            -3448.472604047328,
            -9467.122986923605,
            -71.25151306968219,
            -1039.1478400038573,
            -31.46544880892754,
            -291.5482828756051,
            -3693.2914476794276,
            -235.41639359353945,
            -465.5323308556297,
            -0.5974125373012354,
            -93.65462808984728,
            2858.585982501127,
            -397.23656593270954
        ],
        "charm_cum": [
            -0.8016681325852293,
            -1608.342681475504,
            -15627.16502767458,
            -15617.937320611474,
            -15369.4719762173,
            -15359.760379536365,
            -15238.487142578435,
            -4964.856383492568,
            -4920.430719876714,
            -4776.132772065489,
            -4770.997453218501,
            -4740.434375990652,
            -667.1818209741796,
            -414.88138772622085
        ],
        "vanna_cum": [
            -13.703894038121861,
            -16967.18764228728,
            -35512.07728389824,
            -35767.255963800104,
            -37719.080671161435,
            -37793.621751014165,
            -37617.16587878438,
            -31520.78328052783,
            -31460.15716356538,
            -30849.676504601197,
            -30845.98385572774,
            -30648.58525445276,
            -4854.207458522142,
            -2676.1939558532927
        ],
        "theta_cum": [
            -0.9308011513460175,
            -3449.4034051986737,
            -12916.52639212228,
            -12987.777905191962,
            -14026.92574519582,
            -14058.391194004747,
            -14349.939476880352,
            -18043.23092455978,
            -18278.64731815332,
            -18744.179649008947,
            -18744.777061546247,
            -18838.431689636094,
            -15979.845707134968,
            -16377.082273067677
        ],
        "r_gamma": [
            4600.708748201968,
            17556113.65132112,
            39188563.42976361,
            477776.6321796232,
            6118371.235111713,
            -152976.12863860573,
            -719681.7845636338,
            -11647789.049829297,
            -407902.8326750463,
            -951507.4812040941,
            -1982.5851304221922,
            -187643.06678059927,
            -13406619.078477848,
            -951931.6759240131
        ],
        "r_gamma_cum": [
            4600.708748201968,
            17560714.360069323,
            56749277.789832935,
            57227054.42201256,
            63345425.65712427,
            63192449.52848567,
            62472767.74392204,
            50824978.69409274,
            50417075.861417696,
            49465568.3802136,
            49463585.79508318,
            49275942.72830258,
            35869323.64982474,
            34917391.97390073
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.37399888705306417,
            "gamma": 4600.708748201968,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -1525.5910769282984,
            "gamma": 17556113.65132112,
            "volume": 160,
            "oi": 8900,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -1783.04125519275,
            "gamma": 39188563.42976361,
            "volume": 875,
            "oi": 9855,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -61.75030849718526,
            "gamma": 477776.6321796232,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -663.8540345062108,
            "gamma": 6118371.235111713,
            "volume": 215,
            "oi": 2160,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -9.80641101082612,
            "gamma": 152976.12863860573,
            "volume": 40,
            "oi": 85,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": 83.24892365472665,
            "gamma": 719681.7845636338,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5400.0,
            "delta": 310.5736619848176,
            "gamma": 11647789.049829297,
            "volume": 1900,
            "oi": 3180,
            "iv": 11.82
        },
        {
            "strike": 5500.0,
            "delta": 124.06447025438078,
            "gamma": 407902.8326750463,
            "volume": 240,
            "oi": 240,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 196.33017449372255,
            "gamma": 951507.4812040941,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        },
        {
            "strike": 5750.0,
            "delta": 0.022285117253084637,
            "gamma": 1982.5851304221922,
            "volume": 200,
            "oi": 600,
            "iv": 11.82
        },
        {
            "strike": 5800.0,
            "delta": 40.88778107293208,
            "gamma": 187643.06678059927,
            "volume": 120,
            "oi": 120,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5626.194597285037,
            "gamma": 13406619.078477848,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 123.35687364405973,
            "gamma": 951931.6759240131,
            "volume": 500,
            "oi": 1000,
            "iv": 11.82
        }
    ]
};