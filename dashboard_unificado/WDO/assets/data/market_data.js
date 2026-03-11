window.marketData = {
    "last_updated": "2026-03-11 11:05:25",
    "spot_price": 5194.0,
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-03-11",
        "meetings": [
            {
                "date": "2026-03-18",
                "days_remaining": 6,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 1.3,
                    "3.50-3.75": 98.7
                }
            },
            {
                "date": "2026-04-29",
                "days_remaining": 48,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.1,
                    "3.25-3.50": 11.7,
                    "3.50-3.75": 88.1
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 97,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 3.4,
                    "3.25-3.50": 33.0,
                    "3.50-3.75": 63.6
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 139,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.8,
                    "3.00-3.25": 9.9,
                    "3.25-3.50": 39.8,
                    "3.50-3.75": 49.5
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 188,
                "current_rate": "3.25-3.50",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.2,
                    "2.75-3.00": 3.3,
                    "3.00-3.25": 18.2,
                    "3.25-3.50": 42.5,
                    "3.50-3.75": 35.8
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 230,
                "current_rate": "3.25-3.50",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.8,
                    "2.75-3.00": 6.0,
                    "3.00-3.25": 22.6,
                    "3.25-3.50": 41.2,
                    "3.50-3.75": 29.2
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 272,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.3,
                    "2.50-2.75": 2.3,
                    "2.75-3.00": 10.7,
                    "3.00-3.25": 27.9,
                    "3.25-3.50": 37.9,
                    "3.50-3.75": 21.1
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 11/03/2026 11:05\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(5);\n  spot(5194.00);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5483.35;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (5483.35)\n  // 2 = Spline (5492.74)\n  // 3 = HVL (5259.73)\n  // 4 = HVL Log (5225.78)\n  // 5 = Sigma Kernel (5225.45)\n  // 6 = PVOP (5483.35)\n  // 7 = HVL Gaussian (5443.92)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 5483.35;\n  if (ModeloFlip = 2) then GammaVal := 5492.74;\n  if (ModeloFlip = 3) then GammaVal := 5259.73;\n  if (ModeloFlip = 4) then GammaVal := 5225.78;\n  if (ModeloFlip = 5) then GammaVal := 5225.45;\n  if (ModeloFlip = 6) then GammaVal := 5483.35;\n  if (ModeloFlip = 7) then GammaVal := 5443.92;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5125.31 <= LimitUpper) and (5125.31 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5125.31, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5155.33 <= LimitUpper) and (5155.33 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5155.33, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5232.67 <= LimitUpper) and (5232.67 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5232.67, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5450.00 <= LimitUpper) and (5450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirMaxPain) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5750.00 <= LimitUpper) and (5750.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5750.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5900.00 <= LimitUpper) and (5900.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5900.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (6128.15 <= LimitUpper) and (6128.15 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6128.15, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6450.00 <= LimitUpper) and (6450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5375.68 > 0) then\n      HorizontalLineCustom(5375.68, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5275.00 <= LimitUpper) and (5275.00 >= LimitLower) then\n      HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5425.00 <= LimitUpper) and (5425.00 >= LimitLower) then\n      HorizontalLineCustom(5425.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5525.00 <= LimitUpper) and (5525.00 >= LimitLower) then\n      HorizontalLineCustom(5525.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5675.00 <= LimitUpper) and (5675.00 >= LimitLower) then\n      HorizontalLineCustom(5675.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5825.00 <= LimitUpper) and (5825.00 >= LimitLower) then\n      HorizontalLineCustom(5825.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5950.00 <= LimitUpper) and (5950.00 >= LimitLower) then\n      HorizontalLineCustom(5950.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6225.00 <= LimitUpper) and (6225.00 >= LimitLower) then\n      HorizontalLineCustom(6225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5419.10 <= LimitUpper) and (5419.10 >= LimitLower) then\n      HorizontalLineCustom(5419.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5430.90 <= LimitUpper) and (5430.90 >= LimitLower) then\n      HorizontalLineCustom(5430.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5507.30 <= LimitUpper) and (5507.30 >= LimitLower) then\n      HorizontalLineCustom(5507.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5542.70 <= LimitUpper) and (5542.70 >= LimitLower) then\n      HorizontalLineCustom(5542.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5657.30 <= LimitUpper) and (5657.30 >= LimitLower) then\n      HorizontalLineCustom(5657.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5692.70 <= LimitUpper) and (5692.70 >= LimitLower) then\n      HorizontalLineCustom(5692.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5807.30 <= LimitUpper) and (5807.30 >= LimitLower) then\n      HorizontalLineCustom(5807.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5842.70 <= LimitUpper) and (5842.70 >= LimitLower) then\n      HorizontalLineCustom(5842.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5938.20 <= LimitUpper) and (5938.20 >= LimitLower) then\n      HorizontalLineCustom(5938.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5961.80 <= LimitUpper) and (5961.80 >= LimitLower) then\n      HorizontalLineCustom(5961.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6171.90 <= LimitUpper) and (6171.90 >= LimitLower) then\n      HorizontalLineCustom(6171.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6278.10 <= LimitUpper) and (6278.10 >= LimitLower) then\n      HorizontalLineCustom(6278.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5261.80 <= LimitUpper) and (5261.80 >= LimitLower) then\n      HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5411.80 <= LimitUpper) and (5411.80 >= LimitLower) then\n      HorizontalLineCustom(5411.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5438.20 <= LimitUpper) and (5438.20 >= LimitLower) then\n      HorizontalLineCustom(5438.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5485.40 <= LimitUpper) and (5485.40 >= LimitLower) then\n      HorizontalLineCustom(5485.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5564.60 <= LimitUpper) and (5564.60 >= LimitLower) then\n      HorizontalLineCustom(5564.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5635.40 <= LimitUpper) and (5635.40 >= LimitLower) then\n      HorizontalLineCustom(5635.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5714.60 <= LimitUpper) and (5714.60 >= LimitLower) then\n      HorizontalLineCustom(5714.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5785.40 <= LimitUpper) and (5785.40 >= LimitLower) then\n      HorizontalLineCustom(5785.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5864.60 <= LimitUpper) and (5864.60 >= LimitLower) then\n      HorizontalLineCustom(5864.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5923.60 <= LimitUpper) and (5923.60 >= LimitLower) then\n      HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5976.40 <= LimitUpper) and (5976.40 >= LimitLower) then\n      HorizontalLineCustom(5976.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6106.20 <= LimitUpper) and (6106.20 >= LimitLower) then\n      HorizontalLineCustom(6106.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6343.80 <= LimitUpper) and (6343.80 >= LimitLower) then\n      HorizontalLineCustom(6343.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5201.79, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5186.21, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5209.58, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5178.42, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5224.05, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5163.95, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5231.84, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5156.16, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 74790,
        "total_volume": 33935,
        "gamma_exposure": 198965327.6881018,
        "delta_position": -12156.210039958456,
        "last_update": "2026-03-11T11:05:25.363892",
        "spot_price": 5194.0,
        "dealer_pressure": 0.044530399934587205,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 5443.91697545617,
        "call_wall": 6000.0,
        "put_wall": 5250.0,
        "effective_call_wall": 6128.152969894223,
        "effective_put_wall": 5125.314861460957,
        "max_pain": 5600.0,
        "zero_gamma": 5483.352542354231,
        "range_low": 5155.325994785645,
        "range_high": 5232.674005214356,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5232.674005214356,
                "sigma_1_down": 5155.325994785644,
                "sigma_2_up": 5271.348010428711,
                "sigma_2_down": 5116.651989571289
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5280.47770462148,
                "sigma_1_down": 5107.52229537852,
                "sigma_2_up": 5366.955409242961,
                "sigma_2_down": 5021.044590757039
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 212,
                "sigma_1_up": 5757.102015638232,
                "sigma_1_down": 4630.897984361768,
                "sigma_2_up": 6320.204031276465,
                "sigma_2_down": 4067.795968723535
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
                5153.28844091125,
                5218.678436882504,
                5227.808616175749,
                5232.374814491787,
                5236.317853097476,
                5239.971924187156,
                5243.325646666657,
                5246.289806489321,
                5248.832988576241,
                5259.729473981406,
                5276.745199906911,
                5290.254747045948,
                5301.862501987228,
                5315.9369302103305,
                5327.081381461846,
                5336.070663740784,
                5343.435344575717,
                5349.549911498026,
                5361.669727950569,
                5372.278430056091,
                5381.175206891704,
                5388.716280427886,
                5395.16865088988,
                5402.491590586808,
                5418.746736369115,
                5432.784182822982,
                5444.997334278278,
                5451.9576765123,
                5455.100223999237,
                5457.782884492478
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4414.9,
                4446.7,
                4478.5,
                4510.299999999999,
                4542.099999999999,
                4573.9,
                4605.7,
                4637.5,
                4669.299999999999,
                4701.099999999999,
                4732.9,
                4764.7,
                4796.5,
                4828.299999999999,
                4860.099999999999,
                4891.9,
                4923.7,
                4955.5,
                4987.299999999999,
                5019.099999999999,
                5050.9,
                5082.7,
                5114.5,
                5146.299999999999,
                5178.099999999999,
                5209.9,
                5241.7,
                5273.5,
                5305.299999999999,
                5337.099999999999,
                5368.9,
                5400.7,
                5432.5,
                5464.299999999999,
                5496.099999999999,
                5527.9,
                5559.7,
                5591.5,
                5623.299999999999,
                5655.099999999999,
                5686.9,
                5718.7,
                5750.5,
                5782.299999999999,
                5814.099999999999,
                5845.9,
                5877.7,
                5909.5,
                5941.299999999999,
                5973.099999999999
            ],
            "deltas": [
                -40623.050398385174,
                -40428.968078056714,
                -40203.328829233724,
                -39943.107603850476,
                -39645.21603022636,
                -39306.378711032165,
                -38922.89760758015,
                -38490.278156585315,
                -38002.71178672563,
                -37452.44980979634,
                -36829.161912735406,
                -36119.43828544292,
                -35306.64741114293,
                -34371.37483938639,
                -33292.61696772094,
                -32049.776918652173,
                -30625.320715813225,
                -29007.74372068339,
                -27194.33339455177,
                -25193.15935337132,
                -23023.81377164427,
                -20716.65558054139,
                -18310.621120935146,
                -15849.961227960986,
                -13380.462930387435,
                -10945.763148180276,
                -8584.265801103384,
                -6326.982394336064,
                -4196.3994209396205,
                -2206.29479995559,
                -362.3130766210723,
                1336.9325747093578,
                2898.453176017033,
                4333.356262794397,
                5655.339381535243,
                6879.308550151183,
                8020.195084320019,
                9092.018977917298,
                10107.223671588632,
                11076.283745442362,
                12007.564281396477,
                12907.390584711158,
                13780.272526543986,
                14629.221319071896,
                15456.098938152083,
                16261.950676508062,
                17047.286817395838,
                17812.29664346967,
                18556.993495976385,
                19281.300876006357
            ],
            "flip_value": 5375.680394481238
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                130.0,
                25.0,
                300.0,
                600.0,
                100.0,
                4700.0,
                200.0,
                300.0,
                11230.0,
                7000.0
            ],
            "bear": [
                -15.0,
                -4050.0,
                -1130.0,
                -750.0,
                -2315.0,
                -870.0,
                -60.0,
                -130.0,
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
                4414.9,
                4446.7,
                4478.5,
                4510.299999999999,
                4542.099999999999,
                4573.9,
                4605.7,
                4637.5,
                4669.299999999999,
                4701.099999999999,
                4732.9,
                4764.7,
                4796.5,
                4828.299999999999,
                4860.099999999999,
                4891.9,
                4923.7,
                4955.5,
                4987.299999999999,
                5019.099999999999,
                5050.9,
                5082.7,
                5114.5,
                5146.299999999999,
                5178.099999999999,
                5209.9,
                5241.7,
                5273.5,
                5305.299999999999,
                5337.099999999999,
                5368.9,
                5400.7,
                5432.5,
                5464.299999999999,
                5496.099999999999,
                5527.9,
                5559.7,
                5591.5,
                5623.299999999999,
                5655.099999999999,
                5686.9,
                5718.7,
                5750.5,
                5782.299999999999,
                5814.099999999999,
                5845.9,
                5877.7,
                5909.5,
                5941.299999999999,
                5973.099999999999
            ],
            "pnl": [
                -23925521.551954255,
                -22575977.66838617,
                -21249809.49940195,
                -19948381.324428543,
                -18673037.452709332,
                -17425094.06839528,
                -16205831.434768619,
                -15016486.557348372,
                -13858246.392214132,
                -12732241.671040053,
                -11639541.398580713,
                -10581148.062209932,
                -9557993.577086577,
                -8570935.975066045,
                -7620756.830998955,
                -6708159.406906156,
                -5833767.482958877,
                -4998124.83442728,
                -4201695.305906093,
                -3444863.4282334726,
                -2727935.5195672233,
                -2051141.2099894136,
                -1414635.328644205,
                -818500.0935959648,
                -262747.54712129943,
                252677.81721188687,
                727896.2848115303,
                1163090.0516588334,
                1558500.295673443,
                1914424.2205548808,
                2231212.099099109,
                2509264.337472042,
                2749028.5767444707,
                2950996.8432718143,
                3115702.7553249914,
                3243718.789803393,
                3335653.6099187452,
                3392149.4524343573,
                3413879.5713615194,
                3401545.733919909,
                3355875.7640092038,
                3277621.1283551827,
                3167554.5608146098,
                3026467.720975546,
                2855168.884097336,
                2654480.6605245303,
                2425237.7439074833,
                2168284.6888079178,
                1884473.719498178,
                1574662.5729298294
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
                5300.0,
                5350.0,
                5400.0,
                5450.0,
                5600.0,
                5750.0,
                5900.0,
                6000.0,
                6450.0
            ],
            "loss": [
                32290750.0,
                11523250.0,
                8458750.0,
                7214500.0,
                6196750.0,
                5288500.0,
                4934000.0,
                4640500.0,
                4406000.0,
                4206250.0,
                3659500.0,
                3817750.0,
                4032250.0,
                4195250.0,
                16003250.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 6000.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 888.4881657680844,
                        "Call_Sim": 1685.541601466899,
                        "Call_Chg": 89.7089535244146,
                        "Put_Now": 9.128224246863283,
                        "Put_Sim": 0.18165994567832744,
                        "Put_Chg": -98.00990925764394
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 472.19906432092375,
                        "Call_Sim": 1210.038375175357,
                        "Call_Chg": 156.25598748602573,
                        "Put_Now": 72.24357374178885,
                        "Put_Sim": 4.082884596222115,
                        "Put_Chg": -94.34844597968663
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 402.8556427991448,
                        "Call_Sim": 1116.7801298427748,
                        "Call_Chg": 177.21595807448514,
                        "Put_Now": 98.78104240842686,
                        "Put_Sim": 6.705529452056851,
                        "Put_Chg": -93.21172434652824
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 370.4396411975317,
                        "Call_Sim": 1070.611320623494,
                        "Call_Chg": 189.0110024841012,
                        "Put_Now": 114.30548590102262,
                        "Put_Sim": 8.477165326985727,
                        "Put_Chg": -92.58376335994396
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 339.595854708984,
                        "Call_Sim": 1024.817943057842,
                        "Call_Chg": 201.7757516316145,
                        "Put_Now": 131.40214450668395,
                        "Put_Sim": 10.624232855541862,
                        "Put_Chg": -91.9147188233283
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 310.36101655743505,
                        "Call_Sim": 979.45705972617,
                        "Call_Chg": 215.58636796284395,
                        "Put_Now": 150.1077514493429,
                        "Put_Sim": 13.203794618078177,
                        "Put_Chg": -91.20378895120945
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 282.7595345632776,
                        "Call_Sim": 934.5898605050779,
                        "Call_Chg": 230.5246141208122,
                        "Put_Now": 170.44671454939498,
                        "Put_Sim": 16.27704049119518,
                        "Put_Chg": -90.45036418905093
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 256.8032814259259,
                        "Call_Sim": 890.2811887198632,
                        "Call_Chg": 246.67827598482694,
                        "Put_Now": 192.43090650625118,
                        "Put_Sim": 19.908813800188284,
                        "Put_Chg": -89.65404561998385
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 105.96506297873293,
                        "Call_Sim": 564.3384715357333,
                        "Call_Chg": 432.5703167363713,
                        "Put_Now": 425.11624881272746,
                        "Put_Sim": 77.48965736972764,
                        "Put_Chg": -81.77212525135367
                    },
                    {
                        "Strike": 5900.0,
                        "Call_Now": 72.13842524037204,
                        "Call_Sim": 459.69049470579284,
                        "Call_Chg": 537.2338918877986,
                        "Put_Now": 535.1109463569933,
                        "Put_Sim": 116.66301582241272,
                        "Put_Chg": -78.19834996524584
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 54.9611022111668,
                        "Call_Sim": 396.47220016318033,
                        "Call_Chg": 621.3687211728197,
                        "Put_Now": 613.8145135162049,
                        "Put_Sim": 149.325611468219,
                        "Put_Chg": -75.67251862247197
                    },
                    {
                        "Strike": 6450.0,
                        "Call_Now": 13.942741195599183,
                        "Call_Sim": 181.3834368645712,
                        "Call_Chg": 1200.9166154631212,
                        "Put_Now": 1004.2601583485157,
                        "Put_Sim": 365.7008540174875,
                        "Put_Chg": -63.58504805977022
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 888.4881657680844,
                        "Call_Sim": 942.5370110579306,
                        "Call_Chg": 6.083237500763087,
                        "Put_Now": 9.128224246863283,
                        "Put_Sim": 7.177069536710377,
                        "Put_Chg": -21.374964696155203
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 472.19906432092375,
                        "Call_Sim": 517.0131349450808,
                        "Call_Chg": 9.490503901909413,
                        "Put_Now": 72.24357374178885,
                        "Put_Sim": 61.05764436594575,
                        "Put_Chg": -15.483632379294479
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 402.8556427991448,
                        "Call_Sim": 444.59538412009897,
                        "Call_Chg": 10.360967276252035,
                        "Put_Now": 98.78104240842686,
                        "Put_Sim": 84.52078372938126,
                        "Put_Chg": -14.436230203042555
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 370.4396411975317,
                        "Call_Sim": 410.51633429166213,
                        "Call_Chg": 10.818683703659046,
                        "Put_Now": 114.30548590102262,
                        "Put_Sim": 98.38217899515371,
                        "Put_Chg": -13.930483546220119
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 339.595854708984,
                        "Call_Sim": 377.93936911119545,
                        "Call_Chg": 11.290925336844833,
                        "Put_Now": 131.40214450668395,
                        "Put_Sim": 113.74565890889517,
                        "Put_Chg": -13.436984353699543
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 310.36101655743505,
                        "Call_Sim": 346.91317514278353,
                        "Call_Chg": 11.777303409683922,
                        "Put_Now": 150.1077514493429,
                        "Put_Sim": 130.65991003469162,
                        "Put_Chg": -12.95592081479842
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 282.7595345632776,
                        "Call_Sim": 317.4750646409684,
                        "Call_Chg": 12.277403883589272,
                        "Put_Now": 170.44671454939498,
                        "Put_Sim": 149.162244627086,
                        "Put_Chg": -12.48746271148617
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 256.8032814259259,
                        "Call_Sim": 289.65045737014134,
                        "Call_Chg": 12.790792922048436,
                        "Put_Now": 192.43090650625118,
                        "Put_Sim": 169.27808245046708,
                        "Put_Chg": -12.031759594206333
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 105.96506297873293,
                        "Call_Sim": 124.31963013491259,
                        "Call_Chg": 17.32133841119256,
                        "Put_Now": 425.11624881272746,
                        "Put_Sim": 387.47081596890666,
                        "Put_Chg": -8.855326736853193
                    },
                    {
                        "Strike": 5900.0,
                        "Call_Now": 72.13842524037204,
                        "Call_Sim": 85.97771594694359,
                        "Call_Chg": 19.184353776032292,
                        "Put_Now": 535.1109463569933,
                        "Put_Sim": 492.95023706356415,
                        "Put_Chg": -7.878872518018365
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 54.9611022111668,
                        "Call_Sim": 66.20990421280612,
                        "Call_Chg": 20.46684209210387,
                        "Put_Now": 613.8145135162049,
                        "Put_Sim": 569.0633155178439,
                        "Put_Chg": -7.290671206519065
                    },
                    {
                        "Strike": 6450.0,
                        "Call_Now": 13.942741195599183,
                        "Call_Sim": 17.6455142122997,
                        "Call_Chg": 26.556994530381466,
                        "Put_Now": 1004.2601583485157,
                        "Put_Sim": 951.9629313652158,
                        "Put_Chg": -5.207537762854352
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 888.4881657680844,
                        "Call_Sim": 297.3541501223849,
                        "Call_Chg": -66.5325705418567,
                        "Put_Now": 9.128224246863283,
                        "Put_Sim": 111.99420860116447,
                        "Put_Chg": 1126.9002773419909
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 472.19906432092375,
                        "Call_Sim": 87.11960615819794,
                        "Call_Chg": -81.55023744414109,
                        "Put_Now": 72.24357374178885,
                        "Put_Sim": 381.16411557906304,
                        "Put_Chg": 427.6097178434308
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 402.8556427991448,
                        "Call_Sim": 64.76960376562056,
                        "Call_Chg": -83.92237891578614,
                        "Put_Now": 98.78104240842686,
                        "Put_Sim": 454.6950033749026,
                        "Put_Chg": 360.3059375450702
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 370.4396411975317,
                        "Call_Sim": 55.498596912196945,
                        "Call_Chg": -85.01818090181037,
                        "Put_Now": 114.30548590102262,
                        "Put_Sim": 493.36444161568807,
                        "Put_Chg": 331.61921558418766
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 339.595854708984,
                        "Call_Sim": 47.359042328721785,
                        "Call_Chg": -86.0542931628815,
                        "Put_Now": 131.40214450668395,
                        "Put_Sim": 533.1653321264212,
                        "Put_Chg": 305.75086055715093
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 310.36101655743505,
                        "Call_Sim": 40.248742833263236,
                        "Call_Chg": -87.03163713029828,
                        "Put_Now": 150.1077514493429,
                        "Put_Sim": 573.9954777251714,
                        "Put_Chg": 282.38896538189675
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 282.7595345632776,
                        "Call_Sim": 34.06827744328052,
                        "Call_Chg": -87.95150179607595,
                        "Put_Now": 170.44671454939498,
                        "Put_Sim": 615.7554574293977,
                        "Put_Chg": 261.2597984403821
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 256.8032814259259,
                        "Call_Sim": 28.722208432379603,
                        "Call_Chg": -88.81548231280509,
                        "Put_Now": 192.43090650625118,
                        "Put_Sim": 658.3498335127056,
                        "Put_Chg": 242.12271067346393
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 105.96506297873293,
                        "Call_Sim": 6.3939349682237605,
                        "Call_Chg": -93.965997104624,
                        "Put_Now": 425.11624881272746,
                        "Put_Sim": 1019.5451208022187,
                        "Put_Chg": 139.8273704309405
                    },
                    {
                        "Strike": 5900.0,
                        "Call_Now": 72.13842524037204,
                        "Call_Sim": 3.4324865770954744,
                        "Call_Chg": -95.24180550703997,
                        "Put_Now": 535.1109463569933,
                        "Put_Sim": 1160.4050076937156,
                        "Put_Chg": 116.85316205801635
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 54.9611022111668,
                        "Call_Sim": 2.230336846394117,
                        "Call_Chg": -95.94197212817002,
                        "Put_Now": 613.8145135162049,
                        "Put_Sim": 1255.0837481514327,
                        "Put_Chg": 104.47280416387517
                    },
                    {
                        "Strike": 6450.0,
                        "Call_Now": 13.942741195599183,
                        "Call_Sim": 0.27637109523237235,
                        "Call_Chg": -98.01781377596247,
                        "Put_Now": 1004.2601583485157,
                        "Put_Sim": 1684.5937882481485,
                        "Put_Chg": 67.74475958684121
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5245.94,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 888.4881657680844,
                        "Call_Sim": 938.6045261198087,
                        "Call_Chg": 5.640633413321774,
                        "Put_Now": 9.128224246863283,
                        "Put_Sim": 7.3045845985888604,
                        "Put_Chg": -19.97803295532619
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 472.19906432092375,
                        "Call_Sim": 513.712728736255,
                        "Call_Chg": 8.791560075417063,
                        "Put_Now": 72.24357374178885,
                        "Put_Sim": 61.81723815712064,
                        "Put_Chg": -14.432197972284364
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 402.8556427991448,
                        "Call_Sim": 441.51015848874295,
                        "Call_Chg": 9.595128274986202,
                        "Put_Now": 98.78104240842686,
                        "Put_Sim": 85.49555809802519,
                        "Put_Chg": -13.449427123344778
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 370.4396411975317,
                        "Call_Sim": 407.5482385530022,
                        "Call_Chg": 10.017447710376878,
                        "Put_Now": 114.30548590102262,
                        "Put_Sim": 99.47408325649349,
                        "Put_Chg": -12.975232577526228
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 339.595854708984,
                        "Call_Sim": 375.0938490412286,
                        "Call_Chg": 10.453011672555471,
                        "Put_Now": 131.40214450668395,
                        "Put_Sim": 114.96013883892897,
                        "Put_Chg": -12.512737695021894
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 310.36101655743505,
                        "Call_Sim": 344.19486493892236,
                        "Call_Chg": 10.901449143573759,
                        "Put_Now": 150.1077514493429,
                        "Put_Sim": 132.00159983083063,
                        "Put_Chg": -12.062103018459107
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 282.7595345632776,
                        "Call_Sim": 314.8877084013611,
                        "Call_Chg": 11.362366219659227,
                        "Put_Now": 170.44671454939498,
                        "Put_Sim": 150.6348883874789,
                        "Put_Chg": -11.623472012524287
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 256.8032814259259,
                        "Call_Sim": 287.1968517173955,
                        "Call_Chg": 11.835351216194065,
                        "Put_Now": 192.43090650625118,
                        "Put_Sim": 170.88447679772162,
                        "Put_Chg": -11.196969395261679
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 105.96506297873293,
                        "Call_Sim": 122.92136765260011,
                        "Call_Chg": 16.00178794521199,
                        "Put_Now": 425.11624881272746,
                        "Put_Sim": 390.1325534865946,
                        "Put_Chg": -8.22920681668508
                    },
                    {
                        "Strike": 5900.0,
                        "Call_Now": 72.13842524037204,
                        "Call_Sim": 84.91509503509064,
                        "Call_Chg": 17.71132340655556,
                        "Put_Now": 535.1109463569933,
                        "Put_Sim": 495.9476161517114,
                        "Put_Chg": -7.318730904666363
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 54.9611022111668,
                        "Call_Sim": 65.34157454486376,
                        "Call_Chg": 18.886943522009442,
                        "Put_Now": 613.8145135162049,
                        "Put_Sim": 572.2549858499024,
                        "Put_Chg": -6.770698110123026
                    },
                    {
                        "Strike": 6450.0,
                        "Call_Now": 13.942741195599183,
                        "Call_Sim": 17.35267660698787,
                        "Call_Chg": 24.4567073543973,
                        "Put_Now": 1004.2601583485157,
                        "Put_Sim": 955.7300937599048,
                        "Put_Chg": -4.832419586217337
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5142.06,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 888.4881657680844,
                        "Call_Sim": 838.775063171639,
                        "Call_Chg": -5.595246454798778,
                        "Put_Now": 9.128224246863283,
                        "Put_Sim": 11.355121650418312,
                        "Put_Chg": 24.395735066656076
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 472.19906432092375,
                        "Call_Sim": 432.0806036491017,
                        "Call_Chg": -8.496090675130198,
                        "Put_Now": 72.24357374178885,
                        "Put_Sim": 84.0651130699664,
                        "Put_Chg": 16.363447592487322
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 402.8556427991448,
                        "Call_Sim": 365.7868493852616,
                        "Call_Chg": -9.201507804711309,
                        "Put_Now": 98.78104240842686,
                        "Put_Sim": 113.65224899454347,
                        "Put_Chg": 15.054717204369139
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 370.4396411975317,
                        "Call_Sim": 334.99942071315536,
                        "Call_Chg": -9.567070189844603,
                        "Put_Now": 114.30548590102262,
                        "Put_Sim": 130.80526541664653,
                        "Put_Chg": 14.434809830484523
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 339.595854708984,
                        "Call_Sim": 305.8384111407445,
                        "Call_Chg": -9.940475744960992,
                        "Put_Now": 131.40214450668395,
                        "Put_Sim": 149.58470093844335,
                        "Put_Chg": 13.83733614091398
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 310.36101655743505,
                        "Call_Sim": 278.32814456738924,
                        "Call_Chg": -10.321164798774861,
                        "Put_Now": 150.1077514493429,
                        "Put_Sim": 170.0148794592974,
                        "Put_Chg": 13.261892086014335
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 282.7595345632776,
                        "Call_Sim": 252.48002423835032,
                        "Call_Chg": -10.708572700013113,
                        "Put_Now": 170.44671454939498,
                        "Put_Sim": 192.1072042244673,
                        "Put_Chg": 12.708071101479145
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 256.8032814259259,
                        "Call_Sim": 228.2926341678749,
                        "Call_Chg": -11.102135105027777,
                        "Put_Now": 192.43090650625118,
                        "Put_Sim": 215.86025924819978,
                        "Put_Chg": 12.175462438611698
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 105.96506297873293,
                        "Call_Sim": 90.69790035102687,
                        "Call_Chg": -14.407732320953897,
                        "Put_Now": 425.11624881272746,
                        "Put_Sim": 461.78908618502146,
                        "Put_Chg": 8.626543321906556
                    },
                    {
                        "Strike": 5900.0,
                        "Call_Now": 72.13842524037204,
                        "Call_Sim": 60.82167386855622,
                        "Call_Chg": -15.687549782390372,
                        "Put_Now": 535.1109463569933,
                        "Put_Sim": 575.7341949851766,
                        "Put_Chg": 7.591556275337707
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 54.9611022111668,
                        "Call_Sim": 45.86827267430442,
                        "Call_Chg": -16.544117877997966,
                        "Put_Now": 613.8145135162049,
                        "Put_Sim": 656.6616839793423,
                        "Put_Chg": 6.980475293373177
                    },
                    {
                        "Strike": 6450.0,
                        "Call_Now": 13.942741195599183,
                        "Call_Sim": 11.10326316924207,
                        "Call_Chg": -20.365278150994815,
                        "Put_Now": 1004.2601583485157,
                        "Put_Sim": 1053.3606803221583,
                        "Put_Chg": 4.889223331769661
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -8.798277048267839e-05,
            -0.16929102448543232,
            -0.1415908460497217,
            -0.02531371291754682,
            -0.005666347893366941,
            0.27684413184173895,
            0.11837877469183256,
            0.1038151681071538,
            0.0588470917478459,
            0.022131733174108312,
            0.1728812846432613,
            0.00044456563882573944,
            0.005504554720850966,
            0.41025057691060995,
            0.11869366553109675
        ]
    },
    "delta_data": {
        "strikes": [
            4500.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0,
            5450.0,
            5600.0,
            5750.0,
            5900.0,
            6000.0,
            6450.0
        ],
        "delta_values": [
            -0.4510380715038165,
            -1925.8058440775967,
            -1357.7936131325084,
            -1539.9207934133044,
            -876.9923719864048,
            -5911.314923531849,
            302.1217888283559,
            137.87105963986744,
            75.85165095877991,
            21.16944111200486,
            1869.832094520795,
            0.12232242076669951,
            19.933060671909132,
            -3390.24403595968,
            419.41116206191356
        ],
        "delta_cumulative": [
            -0.4510380715038165,
            -1926.2568821491004,
            -3284.050495281609,
            -4823.971288694914,
            -5700.963660681318,
            -11612.278584213167,
            -11310.156795384812,
            -11172.285735744945,
            -11096.434084786164,
            -11075.26464367416,
            -9205.432549153365,
            -9205.3102267326,
            -9185.37716606069,
            -12575.621202020371,
            -12156.210039958458
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
            5300.0,
            5350.0,
            5400.0,
            5450.0,
            5600.0,
            5750.0,
            5900.0,
            6000.0,
            6450.0
        ],
        "gamma_values": [
            5297.8046072580855,
            23579001.607201323,
            27828085.681290813,
            28776829.386068083,
            6417046.454270044,
            57034991.31113483,
            6866176.981584572,
            5019942.36153892,
            2253106.0325100743,
            727449.1846538656,
            8412411.864778785,
            7774.087425813409,
            219349.27886467025,
            27976362.3270214,
            3841503.325151315
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            202716.78581200098,
            6769938.2296523675,
            4806865.331120528,
            2253106.0325100743,
            727449.1846538656,
            8412411.864778785,
            7774.087425813409,
            219349.27886467025,
            20718979.961158596,
            3841503.325151315
        ],
        "gamma_put": [
            5297.8046072580855,
            23579001.607201323,
            27828085.681290813,
            28776829.386068083,
            6417046.454270044,
            56832274.52532283,
            96238.75193220505,
            213077.0304183912,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            7257382.365862806,
            0.0
        ],
        "gamma_exposure": [
            5297.8046072580855,
            23584299.41180858,
            51412385.09309939,
            80189214.47916748,
            86606260.93343753,
            143641252.24457234,
            150507429.22615692,
            155527371.58769584,
            157780477.6202059,
            158507926.8048598,
            166920338.66963857,
            166928112.7570644,
            167147462.03592908,
            195123824.36295047,
            198965327.6881018
        ]
    },
    "gex_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 15,
            "abs_call": 14565132.865362648,
            "abs_put": 85247150.08782752,
            "net": 99812282.95319016
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 37,
            "abs_call": 0.0,
            "abs_put": 30875288.141752418,
            "net": 30875288.141752418
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 58,
            "abs_call": 0.0,
            "abs_put": 516034.40149128606,
            "net": 516034.40149128606
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 80,
            "abs_call": 0.0,
            "abs_put": 26618138.46801382,
            "net": 26618138.46801382
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 103,
            "abs_call": 102097.32877492877,
            "abs_put": 0.0,
            "net": 102097.32877492877
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 124,
            "abs_call": 117251.95008974147,
            "abs_put": 0.0,
            "net": 117251.95008974147
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 146,
            "abs_call": 5368191.792672346,
            "abs_put": 7257382.365862806,
            "net": 12625574.158535153
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 168,
            "abs_call": 0.0,
            "abs_put": 34122.554479241924,
            "net": 34122.554479241924
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 189,
            "abs_call": 926363.9932955339,
            "abs_put": 0.0,
            "net": 926363.9932955339
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 212,
            "abs_call": 26678339.365120813,
            "abs_put": 0.0,
            "net": 26678339.365120813
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 233,
            "abs_call": 0.0,
            "abs_put": 106560.16969541233,
            "net": 106560.16969541233
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 253,
            "abs_call": 202716.78581200098,
            "abs_put": 350557.41785125504,
            "net": 553274.203663256
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
            5300.0,
            5350.0,
            5400.0,
            5450.0,
            5600.0,
            5750.0,
            5900.0,
            6000.0,
            6450.0
        ],
        "call_volume": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            130.0,
            25.0,
            300.0,
            600.0,
            100.0,
            4700.0,
            200.0,
            300.0,
            11230.0,
            7000.0
        ],
        "put_volume": [
            15.0,
            4050.0,
            1130.0,
            750.0,
            2315.0,
            870.0,
            60.0,
            130.0,
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
            4050.0,
            1130.0,
            750.0,
            2315.0,
            1000.0,
            85.0,
            430.0,
            600.0,
            100.0,
            4700.0,
            200.0,
            300.0,
            11260.0,
            7000.0
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
            5300.0,
            5350.0,
            5400.0,
            5450.0,
            5600.0,
            5750.0,
            5900.0,
            6000.0,
            6450.0
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
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            3.2526065174565133e-19,
            0.0,
            0.0,
            0.0,
            -1.3552527156068805e-19,
            0.0
        ]
    },
    "most_actives": {
        "top_oi": [
            {
                "strike": 6000.0,
                "type": "CALL",
                "oi": 12380,
                "volume": 11200,
                "expiry": "2027-01-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5000.0,
                "type": "PUT",
                "oi": 8900,
                "volume": 4000,
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
                "strike": 5250.0,
                "type": "PUT",
                "oi": 7020,
                "volume": 800,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 6450.0,
                "type": "CALL",
                "oi": 7000,
                "volume": 7000,
                "expiry": "2027-01-01 00:00:00",
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
                "oi": 4930,
                "volume": 300,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5150.0,
                "type": "PUT",
                "oi": 4530,
                "volume": 750,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5600.0,
                "type": "CALL",
                "oi": 4200,
                "volume": 4200,
                "expiry": "2027-01-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5250.0,
                "type": "PUT",
                "oi": 3860,
                "volume": 50,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5200.0,
                "type": "PUT",
                "oi": 2025,
                "volume": 2000,
                "expiry": "2026-07-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5000.0,
                "type": "PUT",
                "oi": 1990,
                "volume": 50,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5300.0,
                "type": "CALL",
                "oi": 1160,
                "volume": 25,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5350.0,
                "type": "CALL",
                "oi": 1050,
                "volume": 300,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5100.0,
                "type": "PUT",
                "oi": 800,
                "volume": 800,
                "expiry": "2026-07-01 00:00:00",
                "iv": 0.0
            }
        ],
        "top_vol": [
            {
                "strike": 6000.0,
                "type": "CALL",
                "oi": 12380,
                "volume": 11200,
                "expiry": "2027-01-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 6450.0,
                "type": "CALL",
                "oi": 7000,
                "volume": 7000,
                "expiry": "2027-01-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5600.0,
                "type": "CALL",
                "oi": 4200,
                "volume": 4200,
                "expiry": "2027-01-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5000.0,
                "type": "PUT",
                "oi": 8900,
                "volume": 4000,
                "expiry": "2026-07-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5200.0,
                "type": "PUT",
                "oi": 2025,
                "volume": 2000,
                "expiry": "2026-07-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5250.0,
                "type": "PUT",
                "oi": 7020,
                "volume": 800,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5100.0,
                "type": "PUT",
                "oi": 800,
                "volume": 800,
                "expiry": "2026-07-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5150.0,
                "type": "PUT",
                "oi": 4530,
                "volume": 750,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5400.0,
                "type": "CALL",
                "oi": 695,
                "volume": 600,
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
                "strike": 5350.0,
                "type": "CALL",
                "oi": 1050,
                "volume": 300,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5200.0,
                "type": "PUT",
                "oi": 150,
                "volume": 300,
                "expiry": "2026-06-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5100.0,
                "type": "PUT",
                "oi": 4930,
                "volume": 300,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5900.0,
                "type": "CALL",
                "oi": 100,
                "volume": 200,
                "expiry": "2026-08-03 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5750.0,
                "type": "CALL",
                "oi": 375,
                "volume": 200,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            }
        ]
    },
    "fed_watch": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 20,
            "iv_atm": 0.0,
            "spot": 5194.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 50,
            "iv_atm": 0.0,
            "spot": 5194.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 81,
            "iv_atm": 0.0,
            "spot": 5194.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 111,
            "iv_atm": 0.0,
            "spot": 5194.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 144,
            "iv_atm": 0.0,
            "spot": 5194.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 173,
            "iv_atm": 0.0,
            "spot": 5194.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 203,
            "iv_atm": 0.0,
            "spot": 5194.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 235,
            "iv_atm": 0.0,
            "spot": 5194.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 264,
            "iv_atm": 0.0,
            "spot": 5194.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 295,
            "iv_atm": 0.0,
            "spot": 5194.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 326,
            "iv_atm": 0.0,
            "spot": 5194.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 354,
            "iv_atm": 0.0,
            "spot": 5194.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5194.0,
                    "lower": 5194.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5194.0,
                    "lower": 5194.0,
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
            5300.0,
            5350.0,
            5400.0,
            5450.0,
            5600.0,
            5750.0,
            5900.0,
            6000.0,
            6450.0
        ],
        "charm": [
            -0.8378706874413733,
            -4029.179461688942,
            -6442.314556919795,
            -2483.1439362417022,
            389.6839090006264,
            10179.575386277875,
            2695.42238988349,
            2684.4734066800825,
            1600.575537052591,
            628.8303868839182,
            1242.0795778412553,
            13.842272260345043,
            74.70324980430092,
            7370.091987464658,
            1207.855022831831
        ],
        "vanna": [
            -15.309844444706233,
            -19737.678259012373,
            -10255.224294771988,
            -5422.156195129844,
            -1342.5840226820835,
            5743.783545395816,
            1991.68731369084,
            2150.9429090210633,
            1381.099932471712,
            557.2574891770289,
            5654.028027126645,
            13.985874571447834,
            399.14573956921754,
            53491.984572816524,
            11651.404191574196
        ],
        "vex": [
            4336.647227703523,
            7639945.758848399,
            2735526.8802566063,
            2103212.129339558,
            2458391.0582054625,
            7826438.177179156,
            613431.2634309141,
            613986.6806765264,
            164672.76059806382,
            53167.07855879708,
            8585895.049643775,
            568.1847276904247,
            122080.95169811664,
            24838377.803806808,
            3968130.543158056
        ],
        "theta": [
            -1.0427650621549749,
            -4732.998198955429,
            -6583.627313339832,
            -6668.755181202581,
            -899.8447194147425,
            -10114.31052922658,
            -2280.6119189545625,
            -1579.6060545223208,
            -725.9063513717548,
            -231.0262688734171,
            -4210.404237431335,
            -2.3637812765121753,
            -82.95196778013894,
            -3485.1816316459053,
            -1519.071561687512
        ],
        "charm_cum": [
            -0.8378706874413733,
            -4030.0173323763834,
            -10472.331889296178,
            -12955.47582553788,
            -12565.791916537253,
            -2386.2165302593785,
            309.2058596241113,
            2993.679266304194,
            4594.254803356785,
            5223.085190240703,
            6465.164768081959,
            6479.007040342304,
            6553.710290146605,
            13923.802277611263,
            15131.657300443094
        ],
        "vanna_cum": [
            -15.309844444706233,
            -19752.98810345708,
            -30008.212398229065,
            -35430.36859335891,
            -36772.95261604099,
            -31029.16907064517,
            -29037.48175695433,
            -26886.53884793327,
            -25505.438915461556,
            -24948.18142628453,
            -19294.153399157884,
            -19280.167524586435,
            -18881.02178501722,
            34610.962787799304,
            46262.3669793735
        ],
        "theta_cum": [
            -1.0427650621549749,
            -4734.040964017584,
            -11317.668277357416,
            -17986.42345856,
            -18886.26817797474,
            -29000.57870720132,
            -31281.190626155883,
            -32860.796680678206,
            -33586.70303204996,
            -33817.729300923376,
            -38028.13353835471,
            -38030.49731963123,
            -38113.449287411364,
            -41598.63091905727,
            -43117.70248074478
        ],
        "r_gamma": [
            5297.8046072580855,
            23579001.607201323,
            27828085.681290813,
            28776829.386068083,
            -6417046.454270044,
            -57034991.31113483,
            -6866176.981584572,
            -5019942.36153892,
            -2253106.0325100743,
            -727449.1846538656,
            -8412411.864778785,
            -7774.087425813409,
            -219349.27886467025,
            -27976362.3270214,
            -3841503.325151315
        ],
        "r_gamma_cum": [
            5297.8046072580855,
            23584299.41180858,
            51412385.09309939,
            80189214.47916748,
            73772168.02489743,
            16737176.713762596,
            9870999.732178025,
            4851057.370639105,
            2597951.338129031,
            1870502.1534751654,
            -6541909.71130362,
            -6549683.798729433,
            -6769033.077594103,
            -34745395.40461551,
            -38586898.72976682
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.4510380715038165,
            "gamma": 5297.8046072580855,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -1925.8058440775967,
            "gamma": 23579001.607201323,
            "volume": 4050,
            "oi": 10890,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -1357.7936131325084,
            "gamma": 27828085.681290813,
            "volume": 1130,
            "oi": 5760,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -1539.9207934133044,
            "gamma": 28776829.386068083,
            "volume": 750,
            "oi": 4530,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -876.9923719864048,
            "gamma": 6417046.454270044,
            "volume": 2315,
            "oi": 2190,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -5911.314923531849,
            "gamma": 57034991.31113483,
            "volume": 1000,
            "oi": 11075,
            "iv": 11.82
        },
        {
            "strike": 5300.0,
            "delta": 302.1217888283559,
            "gamma": 6866176.981584572,
            "volume": 85,
            "oi": 1220,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": 137.87105963986744,
            "gamma": 5019942.36153892,
            "volume": 430,
            "oi": 1180,
            "iv": 11.82
        },
        {
            "strike": 5400.0,
            "delta": 75.85165095877991,
            "gamma": 2253106.0325100743,
            "volume": 600,
            "oi": 695,
            "iv": 11.82
        },
        {
            "strike": 5450.0,
            "delta": 21.16944111200486,
            "gamma": 727449.1846538656,
            "volume": 100,
            "oi": 350,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 1869.832094520795,
            "gamma": 8412411.864778785,
            "volume": 4700,
            "oi": 4700,
            "iv": 11.82
        },
        {
            "strike": 5750.0,
            "delta": 0.12232242076669951,
            "gamma": 7774.087425813409,
            "volume": 200,
            "oi": 375,
            "iv": 11.82
        },
        {
            "strike": 5900.0,
            "delta": 19.933060671909132,
            "gamma": 219349.27886467025,
            "volume": 300,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -3390.24403595968,
            "gamma": 27976362.3270214,
            "volume": 11260,
            "oi": 24610,
            "iv": 11.82
        },
        {
            "strike": 6450.0,
            "delta": 419.41116206191356,
            "gamma": 3841503.325151315,
            "volume": 7000,
            "oi": 7000,
            "iv": 11.82
        }
    ]
};