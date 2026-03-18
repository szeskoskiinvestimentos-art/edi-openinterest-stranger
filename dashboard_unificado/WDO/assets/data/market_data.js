window.marketData = {
    "last_updated": "2026-03-18 15:10:14",
    "spot_price": 5220.0,
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
                    "3.25-3.50": 1.0,
                    "3.50-3.75": 99.0,
                    "3.75-4.00": 2.1
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 90,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.2,
                    "3.25-3.50": 17.4,
                    "3.50-3.75": 82.5,
                    "3.75-4.00": 1.7
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 132,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 2.5,
                    "3.25-3.50": 26.0,
                    "3.50-3.75": 71.5,
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
                    "3.00-3.25": 6.3,
                    "3.25-3.50": 33.5,
                    "3.50-3.75": 59.7,
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
                    "2.75-3.00": 1.1,
                    "3.00-3.25": 9.5,
                    "3.25-3.50": 36.5,
                    "3.50-3.75": 52.8,
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
                    "2.75-3.00": 3.1,
                    "3.00-3.25": 16.0,
                    "3.25-3.50": 40.5,
                    "3.50-3.75": 40.2,
                    "3.75-4.00": 0.6
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 18/03/2026 15:10\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(2);\n  spot(5220.00);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 4500.00;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (4500.00)\n  // 2 = Spline (4974.95)\n  // 3 = HVL (4500.00)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (4500.00)\n  // 7 = HVL Gaussian (4500.00)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 4500.00;\n  if (ModeloFlip = 2) then GammaVal := 4974.95;\n  if (ModeloFlip = 3) then GammaVal := 4500.00;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 4500.00;\n  if (ModeloFlip = 7) then GammaVal := 4500.00;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirMaxPain) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirRange) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5181.13 <= LimitUpper) and (5181.13 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5181.13, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5258.87 <= LimitUpper) and (5258.87 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5258.87, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirRange) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5455.56 <= LimitUpper) and (5455.56 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5455.56, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5500.00 <= LimitUpper) and (5500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5750.00 <= LimitUpper) and (5750.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5750.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5800.00 <= LimitUpper) and (5800.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5800.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5546.55 > 0) then\n      HorizontalLineCustom(5546.55, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5300.00 <= LimitUpper) and (5300.00 >= LimitLower) then\n      HorizontalLineCustom(5300.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5450.00 <= LimitUpper) and (5450.00 >= LimitLower) then\n      HorizontalLineCustom(5450.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5550.00 <= LimitUpper) and (5550.00 >= LimitLower) then\n      HorizontalLineCustom(5550.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5675.00 <= LimitUpper) and (5675.00 >= LimitLower) then\n      HorizontalLineCustom(5675.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5775.00 <= LimitUpper) and (5775.00 >= LimitLower) then\n      HorizontalLineCustom(5775.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5900.00 <= LimitUpper) and (5900.00 >= LimitLower) then\n      HorizontalLineCustom(5900.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5438.20 <= LimitUpper) and (5438.20 >= LimitLower) then\n      HorizontalLineCustom(5438.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5461.80 <= LimitUpper) and (5461.80 >= LimitLower) then\n      HorizontalLineCustom(5461.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5538.20 <= LimitUpper) and (5538.20 >= LimitLower) then\n      HorizontalLineCustom(5538.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5657.30 <= LimitUpper) and (5657.30 >= LimitLower) then\n      HorizontalLineCustom(5657.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5692.70 <= LimitUpper) and (5692.70 >= LimitLower) then\n      HorizontalLineCustom(5692.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5769.10 <= LimitUpper) and (5769.10 >= LimitLower) then\n      HorizontalLineCustom(5769.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5780.90 <= LimitUpper) and (5780.90 >= LimitLower) then\n      HorizontalLineCustom(5780.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5876.40 <= LimitUpper) and (5876.40 >= LimitLower) then\n      HorizontalLineCustom(5876.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5923.60 <= LimitUpper) and (5923.60 >= LimitLower) then\n      HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5273.60 <= LimitUpper) and (5273.60 >= LimitLower) then\n      HorizontalLineCustom(5273.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5326.40 <= LimitUpper) and (5326.40 >= LimitLower) then\n      HorizontalLineCustom(5326.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5423.60 <= LimitUpper) and (5423.60 >= LimitLower) then\n      HorizontalLineCustom(5423.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5476.40 <= LimitUpper) and (5476.40 >= LimitLower) then\n      HorizontalLineCustom(5476.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5523.60 <= LimitUpper) and (5523.60 >= LimitLower) then\n      HorizontalLineCustom(5523.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5576.40 <= LimitUpper) and (5576.40 >= LimitLower) then\n      HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5635.40 <= LimitUpper) and (5635.40 >= LimitLower) then\n      HorizontalLineCustom(5635.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5714.60 <= LimitUpper) and (5714.60 >= LimitLower) then\n      HorizontalLineCustom(5714.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5761.80 <= LimitUpper) and (5761.80 >= LimitLower) then\n      HorizontalLineCustom(5761.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5788.20 <= LimitUpper) and (5788.20 >= LimitLower) then\n      HorizontalLineCustom(5788.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5847.20 <= LimitUpper) and (5847.20 >= LimitLower) then\n      HorizontalLineCustom(5847.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5952.80 <= LimitUpper) and (5952.80 >= LimitLower) then\n      HorizontalLineCustom(5952.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5227.83, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5212.17, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5235.66, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5204.34, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5250.20, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5189.80, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5258.03, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5181.97, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 39285,
        "total_volume": 5225,
        "gamma_exposure": 92676620.2664085,
        "delta_position": -9004.012883427384,
        "last_update": "2026-03-18T15:10:14.952834",
        "spot_price": 5220.0,
        "dealer_pressure": -0.05159804601592579,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 4500.0,
        "gamma_flip_selected": 4974.950813552407,
        "gamma_flip_model": "Spline",
        "call_wall": 5400.0,
        "put_wall": 5100.0,
        "effective_call_wall": 5455.555555555556,
        "effective_put_wall": 5100.0,
        "max_pain": 5100.0,
        "zero_gamma": 4500.0,
        "range_low": 5181.13240138257,
        "range_high": 5258.867598617431,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5258.867598617431,
                "sigma_1_down": 5181.132401382569,
                "sigma_2_up": 5297.7351972348615,
                "sigma_2_down": 5142.2648027651385
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5306.910592630752,
                "sigma_1_down": 5133.089407369248,
                "sigma_2_up": 5393.821185261505,
                "sigma_2_down": 5046.178814738495
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 10,
                "sigma_1_up": 5342.910138812293,
                "sigma_1_down": 5097.089861187707,
                "sigma_2_up": 5465.820277624586,
                "sigma_2_down": 4974.179722375414
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
                4437.0,
                4468.959183673469,
                4500.918367346939,
                4532.877551020408,
                4564.836734693878,
                4596.7959183673465,
                4628.755102040816,
                4660.714285714285,
                4692.673469387755,
                4724.632653061224,
                4756.591836734694,
                4788.551020408163,
                4820.510204081633,
                4852.469387755102,
                4884.428571428572,
                4916.3877551020405,
                4948.34693877551,
                4980.306122448979,
                5012.265306122448,
                5044.224489795918,
                5076.183673469387,
                5108.142857142857,
                5140.102040816326,
                5172.061224489796,
                5204.020408163265,
                5235.9795918367345,
                5267.938775510203,
                5299.897959183673,
                5331.857142857142,
                5363.816326530612,
                5395.775510204081,
                5427.73469387755,
                5459.69387755102,
                5491.65306122449,
                5523.612244897959,
                5555.5714285714275,
                5587.530612244897,
                5619.489795918366,
                5651.448979591836,
                5683.408163265305,
                5715.367346938775,
                5747.326530612244,
                5779.285714285714,
                5811.244897959183,
                5843.204081632652,
                5875.1632653061215,
                5907.122448979591,
                5939.08163265306,
                5971.040816326529,
                6002.999999999999
            ],
            "deltas": [
                -27462.396725383856,
                -27310.800671450103,
                -27131.51738224505,
                -26921.407427809936,
                -26677.265532794296,
                -26395.847345049653,
                -26073.899600024248,
                -25708.182446067724,
                -25295.450445432038,
                -24832.32940017408,
                -24315.008806700476,
                -23738.702439808272,
                -23096.95472842762,
                -22381.093364742643,
                -21580.364491869415,
                -20683.35051045014,
                -19680.96213957799,
                -18570.57585569559,
                -17360.018813224793,
                -16069.60125370932,
                -14730.730570968914,
                -13380.862939715036,
                -12056.145149319784,
                -10784.243710062934,
                -9579.910328473452,
                -8444.73739555103,
                -7370.862507943971,
                -6346.897067231144,
                -5363.7089230371985,
                -4418.054649492495,
                -3513.1461665710294,
                -2656.506112141211,
                -1856.388946345219,
                -1118.3224461569805,
                -442.97247103714244,
                174.18192255945036,
                741.6020821160512,
                1269.5750961109088,
                1768.038050770515,
                2244.9599876329694,
                2705.571825149944,
                3152.415545817633,
                3585.9688214842927,
                4005.5192898051996,
                4409.994949563863,
                4798.559583224991,
                5170.905267759282,
                5527.277096608767,
                5868.324773685368,
                6194.888153936393
            ],
            "flip_value": 5546.551461909221
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
                4437.0,
                4468.959183673469,
                4500.918367346939,
                4532.877551020408,
                4564.836734693878,
                4596.7959183673465,
                4628.755102040816,
                4660.714285714285,
                4692.673469387755,
                4724.632653061224,
                4756.591836734694,
                4788.551020408163,
                4820.510204081633,
                4852.469387755102,
                4884.428571428572,
                4916.3877551020405,
                4948.34693877551,
                4980.306122448979,
                5012.265306122448,
                5044.224489795918,
                5076.183673469387,
                5108.142857142857,
                5140.102040816326,
                5172.061224489796,
                5204.020408163265,
                5235.9795918367345,
                5267.938775510203,
                5299.897959183673,
                5331.857142857142,
                5363.816326530612,
                5395.775510204081,
                5427.73469387755,
                5459.69387755102,
                5491.65306122449,
                5523.612244897959,
                5555.5714285714275,
                5587.530612244897,
                5619.489795918366,
                5651.448979591836,
                5683.408163265305,
                5715.367346938775,
                5747.326530612244,
                5779.285714285714,
                5811.244897959183,
                5843.204081632652,
                5875.1632653061215,
                5907.122448979591,
                5939.08163265306,
                5971.040816326529,
                6002.999999999999
            ],
            "pnl": [
                -25539803.66795642,
                -24349764.66145061,
                -23159782.932539,
                -21969860.980609708,
                -20780001.352646858,
                -19590217.26000189,
                -18400557.700726554,
                -17211160.49874399,
                -16022353.875294914,
                -14834830.835480442,
                -13649913.13032235,
                -12469895.539377263,
                -11298416.333509194,
                -10140748.760308826,
                -9003876.645238588,
                -7896231.808697296,
                -6827043.346023548,
                -5805362.364390345,
                -4838939.563366232,
                -3933200.7708468866,
                -3090558.3523810674,
                -2310215.572449552,
                -1588494.852494998,
                -919590.9604168497,
                -296555.2788624242,
                287718.11949423514,
                839705.1365372399,
                1364785.2451034244,
                1867118.1402453687,
                2349795.6133940434,
                2815146.2505641906,
                3265062.16577039,
                3701248.6603254103,
                4125350.5580674973,
                4538960.159911213,
                4943543.94891847,
                5340332.336827949,
                5730204.220619375,
                6113577.984087955,
                6490305.378668823,
                6859562.504779937,
                7219744.056913617,
                7568387.399151548,
                7902171.3388965,
                8217038.963750239,
                8508476.736600496,
                8771943.811648898,
                9003397.06259728,
                9199816.565711804,
                9359620.903905291
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
                        "Call_Now": 728.9197195756269,
                        "Call_Sim": 908.9197195741908,
                        "Call_Chg": 24.694077436039034,
                        "Put_Now": 1.4369832004597763e-09,
                        "Put_Sim": 3.5751978177344574e-14,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 231.19494663498062,
                        "Call_Sim": 409.92351153007803,
                        "Call_Chg": 77.30643229727718,
                        "Put_Now": 1.2841471081022178,
                        "Put_Sim": 0.012712003200096245,
                        "Put_Chg": -99.01008201319841
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 138.90862743122943,
                        "Call_Sim": 310.34751326915466,
                        "Call_Chg": 123.41845788001957,
                        "Put_Now": 8.799611913813465,
                        "Put_Sim": 0.23849775173891175,
                        "Put_Chg": -97.2896787486216
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 98.91782416223168,
                        "Call_Sim": 261.0161423323543,
                        "Call_Chg": 163.87169809181287,
                        "Put_Now": 18.70970064954713,
                        "Put_Sim": 0.8080188196702665,
                        "Put_Chg": -95.68128408462898
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 65.53154081429966,
                        "Call_Sim": 212.65928760949737,
                        "Call_Chg": 224.51440171706278,
                        "Put_Now": 35.224309306347095,
                        "Put_Sim": 2.3520561015442922,
                        "Put_Chg": -93.32263386319836
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 39.94864501453003,
                        "Call_Sim": 166.34645306822586,
                        "Call_Chg": 316.40073901811365,
                        "Put_Now": 59.542305511308314,
                        "Put_Sim": 5.940113565003799,
                        "Put_Chg": -90.02370916948178
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 11.15988215931111,
                        "Call_Sim": 86.42714912747715,
                        "Call_Chg": 674.4449976594756,
                        "Put_Now": 130.55532666555246,
                        "Put_Sim": 25.82259363371827,
                        "Put_Chg": -80.22095743372556
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.046468857018624,
                        "Call_Sim": 56.205064215686434,
                        "Call_Chg": 1013.7503432229942,
                        "Put_Now": 174.34280536798997,
                        "Put_Sim": 45.50140072665772,
                        "Put_Chg": -73.90118816166992
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.7400865772169425,
                        "Call_Sim": 18.47030206176032,
                        "Call_Chg": 2395.694778199727,
                        "Put_Now": 269.83820709765223,
                        "Put_Sim": 107.56842258219422,
                        "Put_Chg": -60.13595563831103
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.06886875830162253,
                        "Call_Sim": 4.147547363852709,
                        "Call_Chg": 5922.393123000439,
                        "Put_Now": 368.96877328819846,
                        "Put_Sim": 193.0474518937499,
                        "Put_Chg": -47.67918971208923
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 728.9197195756269,
                        "Call_Sim": 608.9197202285704,
                        "Call_Chg": -16.46271820124716,
                        "Put_Now": 1.4369832004597763e-09,
                        "Put_Sim": 6.54380357686886e-07,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 231.19494663498062,
                        "Call_Sim": 121.29710366087738,
                        "Call_Chg": -47.53470807803345,
                        "Put_Now": 1.2841471081022178,
                        "Put_Sim": 11.386304133999033,
                        "Put_Chg": 786.6822237232875
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 138.90862743122943,
                        "Call_Sim": 53.082560648148046,
                        "Call_Chg": -61.78598721348101,
                        "Put_Now": 8.799611913813465,
                        "Put_Sim": 42.97354513073242,
                        "Put_Chg": 388.3572770211986
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 98.91782416223168,
                        "Call_Sim": 30.792909247019452,
                        "Call_Chg": -68.87021170571133,
                        "Put_Now": 18.70970064954713,
                        "Put_Sim": 70.58478573433467,
                        "Put_Chg": 277.2630415444043
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 65.53154081429966,
                        "Call_Sim": 16.153030885890985,
                        "Call_Chg": -75.35075372076979,
                        "Put_Now": 35.224309306347095,
                        "Put_Sim": 105.84579937793933,
                        "Put_Chg": 200.49077316859382
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 39.94864501453003,
                        "Call_Sim": 7.606993379680034,
                        "Call_Chg": -80.95806909868098,
                        "Put_Now": 59.542305511308314,
                        "Put_Sim": 147.200653876459,
                        "Put_Chg": 147.22027911482627
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 11.15988215931111,
                        "Call_Sim": 1.197262839537558,
                        "Call_Chg": -89.27172507338138,
                        "Put_Now": 130.55532666555246,
                        "Put_Sim": 240.59270734577785,
                        "Put_Chg": 84.28409892620581
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.046468857018624,
                        "Call_Sim": 0.39787953775774554,
                        "Call_Chg": -92.11568427288766,
                        "Put_Now": 174.34280536798997,
                        "Put_Sim": 289.6942160487288,
                        "Put_Chg": 66.16356232037424
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.7400865772169425,
                        "Call_Sim": 0.030675888928096917,
                        "Call_Chg": -95.8550945426612,
                        "Put_Now": 269.83820709765223,
                        "Put_Sim": 389.1287964093626,
                        "Put_Chg": 44.20819075059304
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.06886875830162253,
                        "Call_Sim": 0.0014684375659615445,
                        "Call_Chg": -97.86777400642208,
                        "Put_Now": 368.96877328819846,
                        "Put_Sim": 488.9013729674625,
                        "Put_Chg": 32.50481026089048
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 728.9197195756269,
                        "Call_Sim": 46.837553513071725,
                        "Call_Chg": -93.57438792569087,
                        "Put_Now": 1.4369832004597763e-09,
                        "Put_Sim": 37.91783393888181,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 231.19494663498062,
                        "Call_Sim": 0.00013169805050343777,
                        "Call_Chg": -99.99994303593031,
                        "Put_Now": 1.2841471081022178,
                        "Put_Sim": 490.0893321711728,
                        "Put_Chg": 38064.57858130082
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 138.90862743122943,
                        "Call_Sim": 1.6984774866155776e-06,
                        "Call_Chg": -99.99999877726998,
                        "Put_Now": 8.799611913813465,
                        "Put_Sim": 589.8909861810625,
                        "Put_Chg": 6603.602294722371
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 98.91782416223168,
                        "Call_Sim": 1.5589218567148663e-07,
                        "Call_Chg": -99.99999984240233,
                        "Put_Now": 18.70970064954713,
                        "Put_Sim": 639.7918766432076,
                        "Put_Chg": 3319.57302592489
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 65.53154081429966,
                        "Call_Sim": 1.2467518412653701e-08,
                        "Call_Chg": -99.99999998097478,
                        "Put_Now": 35.224309306347095,
                        "Put_Sim": 689.6927685045148,
                        "Put_Chg": 1858.002249259827
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 39.94864501453003,
                        "Call_Sim": 8.716668752651267e-10,
                        "Call_Chg": -99.99999999781804,
                        "Put_Now": 59.542305511308314,
                        "Put_Sim": 739.5936604976496,
                        "Put_Chg": 1142.1313789355797
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 11.15988215931111,
                        "Call_Sim": 2.884560439690171e-12,
                        "Call_Chg": -99.99999999997415,
                        "Put_Now": 130.55532666555246,
                        "Put_Sim": 839.3954445062436,
                        "Put_Chg": 542.9423187431858
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.046468857018624,
                        "Call_Sim": 1.3743570894583737e-13,
                        "Call_Chg": -99.99999999999727,
                        "Put_Now": 174.34280536798997,
                        "Put_Sim": 889.2963365109717,
                        "Put_Chg": 410.08490693602783
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.7400865772169425,
                        "Call_Sim": 2.175159979771622e-16,
                        "Call_Chg": -99.99999999999997,
                        "Put_Now": 269.83820709765223,
                        "Put_Sim": 989.0981205204343,
                        "Put_Chg": 266.5522874462651
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.06886875830162253,
                        "Call_Sim": 2.1734029248899474e-19,
                        "Call_Chg": -100.0,
                        "Put_Now": 368.96877328819846,
                        "Put_Sim": 1088.899904529897,
                        "Put_Chg": 195.11979965832128
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5272.2,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 728.9197195756269,
                        "Call_Sim": 781.1197195742689,
                        "Call_Chg": 7.161282456322144,
                        "Put_Now": 1.4369832004597763e-09,
                        "Put_Sim": 7.874074327286714e-11,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 231.19494663498062,
                        "Call_Sim": 282.509001303305,
                        "Call_Chg": 22.195145445519174,
                        "Put_Now": 1.2841471081022178,
                        "Put_Sim": 0.3982017764278183,
                        "Put_Chg": -68.99095330158065
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 138.90862743122943,
                        "Call_Sim": 185.9279241639715,
                        "Call_Chg": 33.84908310034255,
                        "Put_Now": 8.799611913813465,
                        "Put_Sim": 3.61890864655669,
                        "Put_Chg": -58.87422443169572
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 98.91782416223168,
                        "Call_Sim": 141.15242719782782,
                        "Call_Chg": 42.696655929601356,
                        "Put_Now": 18.70970064954713,
                        "Put_Sim": 8.744303685144018,
                        "Put_Chg": -53.26326247044645
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 65.53154081429966,
                        "Call_Sim": 101.01898725696265,
                        "Call_Chg": 54.15323064541656,
                        "Put_Now": 35.224309306347095,
                        "Put_Sim": 18.511755749010717,
                        "Put_Chg": -47.446078820131554
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 39.94864501453003,
                        "Call_Sim": 67.37696031946416,
                        "Call_Chg": 68.6589377310744,
                        "Put_Now": 59.542305511308314,
                        "Put_Sim": 34.77062081624263,
                        "Put_Chg": -41.60350272355684
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 11.15988215931111,
                        "Call_Sim": 23.28107493997186,
                        "Call_Chg": 108.61398541334579,
                        "Put_Now": 130.55532666555246,
                        "Put_Sim": 90.47651944621248,
                        "Put_Chg": -30.69871466984344
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.046468857018624,
                        "Call_Sim": 11.86152468656394,
                        "Call_Chg": 135.04602966224476,
                        "Put_Now": 174.34280536798997,
                        "Put_Sim": 128.95786119753666,
                        "Put_Chg": -26.032014383764277
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.7400865772169425,
                        "Call_Sim": 2.2481761710805017,
                        "Call_Chg": 203.7720504990987,
                        "Put_Now": 269.83820709765223,
                        "Put_Sim": 219.1462966915151,
                        "Put_Chg": -18.786038845785896
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.06886875830162253,
                        "Call_Sim": 0.27459280094970495,
                        "Call_Chg": 298.7189659309359,
                        "Put_Now": 368.96877328819846,
                        "Put_Sim": 316.97449733084704,
                        "Put_Chg": -14.091782210723593
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5167.8,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 728.9197195756269,
                        "Call_Sim": 676.7197195968811,
                        "Call_Chg": -7.161282453592611,
                        "Put_Now": 1.4369832004597763e-09,
                        "Put_Sim": 2.2690618779755097e-08,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 231.19494663498062,
                        "Call_Sim": 181.3268450108635,
                        "Call_Chg": -21.56971955916094,
                        "Put_Now": 1.2841471081022178,
                        "Put_Sim": 3.6160454839859995,
                        "Put_Chg": 181.59121810662236
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 138.90862743122943,
                        "Call_Sim": 96.82265879524039,
                        "Call_Chg": -30.29759159979093,
                        "Put_Now": 8.799611913813465,
                        "Put_Sim": 18.913643277824804,
                        "Put_Chg": 114.93724340427471
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 98.91782416223168,
                        "Call_Sim": 63.698774098956164,
                        "Call_Chg": -35.60435175516395,
                        "Put_Now": 18.70970064954713,
                        "Put_Sim": 35.69065058627166,
                        "Put_Chg": 90.76013697277168
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 65.53154081429966,
                        "Call_Sim": 38.480917222292646,
                        "Call_Chg": -41.27878462168601,
                        "Put_Now": 35.224309306347095,
                        "Put_Sim": 60.3736857143399,
                        "Put_Chg": 71.39778438029192
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 39.94864501453003,
                        "Call_Sim": 21.141570434537243,
                        "Call_Chg": -47.078128865578094,
                        "Put_Now": 59.542305511308314,
                        "Put_Sim": 92.93523093131535,
                        "Put_Chg": 56.08268798672068
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 11.15988215931111,
                        "Call_Sim": 4.663417224067018,
                        "Call_Chg": -58.212666070347765,
                        "Put_Now": 130.55532666555246,
                        "Put_Sim": 176.25886173030813,
                        "Put_Chg": 35.0070244026395
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.046468857018624,
                        "Call_Sim": 1.8540461566259978,
                        "Call_Chg": -63.26052514824515,
                        "Put_Now": 174.34280536798997,
                        "Put_Sim": 223.35038266759693,
                        "Put_Chg": 28.109893721261038
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.7400865772169425,
                        "Call_Sim": 0.2072729650193672,
                        "Call_Chg": -71.99341652718435,
                        "Put_Now": 269.83820709765223,
                        "Put_Sim": 321.50539348545226,
                        "Put_Chg": 19.14746875304508
                    },
                    {
                        "Strike": 5600.0,
                        "Call_Now": 0.06886875830162253,
                        "Call_Sim": 0.014534496691362087,
                        "Call_Chg": -78.89536990386009,
                        "Put_Now": 368.96877328819846,
                        "Put_Sim": 421.1144390265881,
                        "Put_Chg": 14.132812723872194
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
                        "Call_Now": 138.90862743122943,
                        "Call_Sim": 310.34751326915466,
                        "Call_Chg": 123.41845788001957,
                        "Put_Now": 8.799611913813465,
                        "Put_Sim": 0.23849775173891175,
                        "Put_Chg": -97.2896787486216
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.046468857018624,
                        "Call_Sim": 56.205064215686434,
                        "Call_Chg": 1013.7503432229942,
                        "Put_Now": 174.34280536798997,
                        "Put_Sim": 45.50140072665772,
                        "Put_Chg": -73.90118816166992
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0008324552057611401,
                        "Call_Sim": 0.20258220094995494,
                        "Call_Chg": 0.0,
                        "Put_Now": 518.6034129992968,
                        "Put_Sim": 338.80516274504043,
                        "Put_Chg": -34.66970053559986
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 138.90862743122943,
                        "Call_Sim": 53.082560648148046,
                        "Call_Chg": -61.78598721348101,
                        "Put_Now": 8.799611913813465,
                        "Put_Sim": 42.97354513073242,
                        "Put_Chg": 388.3572770211986
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.046468857018624,
                        "Call_Sim": 0.39787953775774554,
                        "Call_Chg": -92.11568427288766,
                        "Put_Now": 174.34280536798997,
                        "Put_Sim": 289.6942160487288,
                        "Put_Chg": 66.16356232037424
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0008324552057611401,
                        "Call_Sim": 6.439484378330425e-06,
                        "Call_Chg": 0.0,
                        "Put_Now": 518.6034129992968,
                        "Put_Sim": 638.6025869835748,
                        "Put_Chg": 23.138909420258823
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5750.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 138.90862743122943,
                        "Call_Sim": 660.1090180871297,
                        "Call_Chg": 375.21095722721395,
                        "Put_Now": 8.799611913813465,
                        "Put_Sim": 2.5697146345701706e-06,
                        "Put_Chg": -99.99997079740947
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.046468857018624,
                        "Call_Sim": 360.8209654865068,
                        "Call_Chg": 7049.969131082169,
                        "Put_Now": 174.34280536798997,
                        "Put_Sim": 0.11730199747811199,
                        "Put_Chg": -99.93271761502832
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0008324552057611401,
                        "Call_Sim": 59.84798504448099,
                        "Call_Chg": 0.0,
                        "Put_Now": 518.6034129992968,
                        "Put_Sim": 48.45056558857095,
                        "Put_Chg": -90.65749195356015
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5272.2,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 138.90862743122943,
                        "Call_Sim": 185.9279241639715,
                        "Call_Chg": 33.84908310034255,
                        "Put_Now": 8.799611913813465,
                        "Put_Sim": 3.61890864655669,
                        "Put_Chg": -58.87422443169572
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.046468857018624,
                        "Call_Sim": 11.86152468656394,
                        "Call_Chg": 135.04602966224476,
                        "Put_Now": 174.34280536798997,
                        "Put_Sim": 128.95786119753666,
                        "Put_Chg": -26.032014383764277
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0008324552057611401,
                        "Call_Sim": 0.005063018553438381,
                        "Call_Chg": 0.0,
                        "Put_Now": 518.6034129992968,
                        "Put_Sim": 466.4076435626439,
                        "Put_Chg": -10.06467912248847
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5167.8,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 138.90862743122943,
                        "Call_Sim": 96.82265879524039,
                        "Call_Chg": -30.29759159979093,
                        "Put_Now": 8.799611913813465,
                        "Put_Sim": 18.913643277824804,
                        "Put_Chg": 114.93724340427471
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.046468857018624,
                        "Call_Sim": 1.8540461566259978,
                        "Call_Chg": -63.26052514824515,
                        "Put_Now": 174.34280536798997,
                        "Put_Sim": 223.35038266759693,
                        "Put_Chg": 28.109893721261038
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0008324552057611401,
                        "Call_Sim": 0.00011381498134418327,
                        "Call_Chg": 0.0,
                        "Put_Now": 518.6034129992968,
                        "Put_Sim": 570.8026943590721,
                        "Put_Chg": 10.065356311075053
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.00013857102497211857,
            -0.15243244834389152,
            -0.26278743023926465,
            -0.002043764769845877,
            -0.005225644655276477,
            -2.639249595756633e-05,
            0.012093002080715563,
            0.31612427105083524,
            0.009423749176911305,
            0.023129760098174905,
            0.00011826977253517093,
            0.005438562167353599,
            0.15358800449843235,
            0.03677441431010007
        ],
        "flip_variations": {
            "Classic": 4500.0,
            "Spline": 4974.950813552407,
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
            -0.384695138695445,
            -1566.2673662696884,
            -1874.8237379539282,
            -62.85225292940648,
            -677.9529304023343,
            -10.158600972910218,
            81.59925645803604,
            284.65048473234344,
            123.12712112697375,
            194.14748708712614,
            0.0181448397561511,
            40.45753795972907,
            -5656.756682623914,
            121.18335065952802
        ],
        "delta_cumulative": [
            -0.384695138695445,
            -1566.6520614083838,
            -3441.475799362312,
            -3504.3280522917184,
            -4182.280982694053,
            -4192.439583666963,
            -4110.840327208927,
            -3826.1898424765836,
            -3703.06272134961,
            -3508.915234262484,
            -3508.8970894227277,
            -3468.4395514629987,
            -9125.196234086912,
            -9004.012883427384
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
            4710.697060976438,
            17852482.749634065,
            40708947.84797415,
            481451.16728551313,
            6154434.461184158,
            153602.20442800847,
            716302.2594937612,
            10921648.464506337,
            408052.97595597967,
            948502.7984528217,
            1632.1636928891728,
            186881.04334299656,
            13197845.136497349,
            940126.2968994929
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            179149.15867112228,
            47473.99554122245,
            716302.2594937612,
            10921648.464506337,
            408052.97595597967,
            948502.7984528217,
            1632.1636928891728,
            186881.04334299656,
            5611512.241192658,
            940126.2968994929
        ],
        "gamma_put": [
            4710.697060976438,
            17852482.749634065,
            40708947.84797415,
            481451.16728551313,
            5975285.302513036,
            106128.208886786,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            7586332.89530469,
            0.0
        ],
        "gamma_exposure": [
            4710.697060976438,
            17857193.44669504,
            58566141.294669196,
            59047592.46195471,
            65202026.92313887,
            65355629.12756688,
            66071931.38706064,
            76993579.85156699,
            77401632.82752296,
            78350135.62597579,
            78351767.78966868,
            78538648.83301167,
            91736493.96950902,
            92676620.26640852
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
            "abs_call": 10923280.628199227,
            "abs_put": 21802036.956280775,
            "net": 32725317.58448
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 32,
            "abs_call": 0.0,
            "abs_put": 18311150.446594417,
            "net": 18311150.446594417
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 53,
            "abs_call": 716302.2594937612,
            "abs_put": 595760.4450989576,
            "net": 1312062.7045927187
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 75,
            "abs_call": 0.0,
            "abs_put": 23799049.686294124,
            "net": 23799049.686294124
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 98,
            "abs_call": 0.0,
            "abs_put": 481451.16728551313,
            "net": 481451.16728551313
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 119,
            "abs_call": 47473.99554122245,
            "abs_put": 0.0,
            "net": 47473.99554122245
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 141,
            "abs_call": 5611512.241192658,
            "abs_put": 7586332.89530469,
            "net": 13197845.136497349
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 163,
            "abs_call": 0.0,
            "abs_put": 33429.06291395475,
            "net": 33429.06291395475
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 184,
            "abs_call": 948502.7984528217,
            "abs_put": 0.0,
            "net": 948502.7984528217
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 207,
            "abs_call": 940126.2968994929,
            "abs_put": 0.0,
            "net": 940126.2968994929
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 228,
            "abs_call": 0.0,
            "abs_put": 106128.208886786,
            "net": 106128.208886786
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 248,
            "abs_call": 774083.1779700986,
            "abs_put": 0.0,
            "net": 774083.1779700986
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
            "spot": 5220.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 43,
            "iv_atm": 0.0,
            "spot": 5220.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 74,
            "iv_atm": 0.0,
            "spot": 5220.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 104,
            "iv_atm": 0.0,
            "spot": 5220.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 137,
            "iv_atm": 0.0,
            "spot": 5220.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 166,
            "iv_atm": 0.0,
            "spot": 5220.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 196,
            "iv_atm": 0.0,
            "spot": 5220.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 228,
            "iv_atm": 0.0,
            "spot": 5220.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 257,
            "iv_atm": 0.0,
            "spot": 5220.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 288,
            "iv_atm": 0.0,
            "spot": 5220.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 319,
            "iv_atm": 0.0,
            "spot": 5220.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 347,
            "iv_atm": 0.0,
            "spot": 5220.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5220.0,
                    "lower": 5220.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5220.0,
                    "lower": 5220.0,
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
            -0.8124676148176613,
            -1565.7681404386462,
            -13913.114882599853,
            10.720961119945116,
            273.1435997191157,
            10.001523020840999,
            124.61672465600464,
            9945.935683707086,
            44.918336303164295,
            145.33456853201903,
            4.2930858201110125,
            30.657103407909638,
            4036.916909228275,
            250.48625183427652
        ],
        "vanna": [
            -13.940451427234407,
            -16895.94525493592,
            -18457.01580330879,
            -247.7613372076104,
            -1843.0296859962264,
            -71.85074588409503,
            189.6285144867338,
            5924.708306542927,
            68.63714036793489,
            627.0711066269447,
            3.108503735546069,
            200.2354193591769,
            25644.757739369554,
            2168.9679458162805
        ],
        "vex": [
            3760.020519793215,
            6556579.325270961,
            4091581.166372566,
            231044.56357097946,
            2424446.728887186,
            146154.718051818,
            185904.38129987693,
            534817.522951926,
            495547.92823359,
            854621.6174667588,
            79.92472437836437,
            226952.1834457695,
            9112542.674004102,
            952958.4836371441
        ],
        "theta": [
            -0.9500172169487282,
            -3486.2499128087347,
            -9798.977986423368,
            -71.01405291149932,
            -1032.9386134391316,
            -31.230772887962033,
            -288.6212664063925,
            -3452.404052577929,
            -234.3527737168327,
            -462.08430508865627,
            -0.491048889013366,
            -92.92581090443778,
            2955.137566982048,
            -391.2509352615469
        ],
        "charm_cum": [
            -0.8124676148176613,
            -1566.580608053464,
            -15479.695490653317,
            -15468.974529533372,
            -15195.830929814256,
            -15185.829406793415,
            -15061.21268213741,
            -5115.276998430323,
            -5070.358662127159,
            -4925.02409359514,
            -4920.731007775029,
            -4890.073904367119,
            -853.1569951388442,
            -602.6707433045676
        ],
        "vanna_cum": [
            -13.940451427234407,
            -16909.885706363155,
            -35366.901509671945,
            -35614.66284687955,
            -37457.69253287578,
            -37529.54327875988,
            -37339.91476427314,
            -31415.206457730215,
            -31346.569317362282,
            -30719.49821073534,
            -30716.38970699979,
            -30516.154287640613,
            -4871.396548271059,
            -2702.4286024547787
        ],
        "theta_cum": [
            -0.9500172169487282,
            -3487.1999300256834,
            -13286.17791644905,
            -13357.19196936055,
            -14390.130582799682,
            -14421.361355687644,
            -14709.982622094038,
            -18162.386674671965,
            -18396.7394483888,
            -18858.823753477456,
            -18859.31480236647,
            -18952.240613270907,
            -15997.10304628886,
            -16388.353981550405
        ],
        "r_gamma": [
            4710.697060976438,
            17852482.749634065,
            40708947.84797415,
            481451.16728551313,
            6154434.461184158,
            -153602.20442800847,
            -716302.2594937612,
            -10921648.464506337,
            -408052.97595597967,
            -948502.7984528217,
            -1632.1636928891728,
            -186881.04334299656,
            -13197845.13649735,
            -940126.2968994929
        ],
        "r_gamma_cum": [
            4710.697060976438,
            17857193.44669504,
            58566141.294669196,
            59047592.46195471,
            65202026.92313887,
            65048424.71871086,
            64332122.4592171,
            53410473.994710766,
            53002421.01875479,
            52053918.22030196,
            52052286.05660907,
            51865405.01326607,
            38667559.87676872,
            37727433.57986923
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.384695138695445,
            "gamma": 4710.697060976438,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -1566.2673662696884,
            "gamma": 17852482.749634065,
            "volume": 160,
            "oi": 8900,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -1874.8237379539282,
            "gamma": 40708947.84797415,
            "volume": 875,
            "oi": 9855,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -62.85225292940648,
            "gamma": 481451.16728551313,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -677.9529304023343,
            "gamma": 6154434.461184158,
            "volume": 215,
            "oi": 2160,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -10.158600972910218,
            "gamma": 153602.20442800847,
            "volume": 40,
            "oi": 85,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": 81.59925645803604,
            "gamma": 716302.2594937612,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5400.0,
            "delta": 284.65048473234344,
            "gamma": 10921648.464506337,
            "volume": 1900,
            "oi": 3180,
            "iv": 11.82
        },
        {
            "strike": 5500.0,
            "delta": 123.12712112697375,
            "gamma": 408052.97595597967,
            "volume": 240,
            "oi": 240,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 194.14748708712614,
            "gamma": 948502.7984528217,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        },
        {
            "strike": 5750.0,
            "delta": 0.0181448397561511,
            "gamma": 1632.1636928891728,
            "volume": 200,
            "oi": 600,
            "iv": 11.82
        },
        {
            "strike": 5800.0,
            "delta": 40.45753795972907,
            "gamma": 186881.04334299656,
            "volume": 120,
            "oi": 120,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5656.756682623914,
            "gamma": 13197845.136497349,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 121.18335065952802,
            "gamma": 940126.2968994929,
            "volume": 500,
            "oi": 1000,
            "iv": 11.82
        }
    ]
};