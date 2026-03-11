window.marketData = {
    "last_updated": "2026-03-11 15:36:23",
    "spot_price": 5190.0,
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-03-11",
        "meetings": [
            {
                "date": "2026-03-18",
                "days_remaining": 6,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 1.1,
                    "3.50-3.75": 98.9
                }
            },
            {
                "date": "2026-04-29",
                "days_remaining": 48,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.1,
                    "3.25-3.50": 13.7,
                    "3.50-3.75": 86.1
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 97,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 3.4,
                    "3.25-3.50": 31.0,
                    "3.50-3.75": 65.6
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 139,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.8,
                    "3.00-3.25": 9.5,
                    "3.25-3.50": 38.7,
                    "3.50-3.75": 51.1
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 188,
                "current_rate": "3.25-3.50",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.2,
                    "2.75-3.00": 3.0,
                    "3.00-3.25": 17.1,
                    "3.25-3.50": 41.9,
                    "3.50-3.75": 37.8
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 230,
                "current_rate": "3.25-3.50",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.7,
                    "2.75-3.00": 5.3,
                    "3.00-3.25": 21.0,
                    "3.25-3.50": 41.2,
                    "3.50-3.75": 31.7
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 272,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.2,
                    "2.50-2.75": 1.9,
                    "2.75-3.00": 9.4,
                    "3.00-3.25": 26.3,
                    "3.25-3.50": 38.8,
                    "3.50-3.75": 23.5
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 11/03/2026 15:36\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(4);\n  spot(5190.00);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5514.30;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (5514.30)\n  // 2 = Spline (5521.24)\n  // 3 = HVL (5285.01)\n  // 4 = HVL Log (5236.01)\n  // 5 = Sigma Kernel (5237.25)\n  // 6 = PVOP (5514.30)\n  // 7 = HVL Gaussian (5503.84)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 5514.30;\n  if (ModeloFlip = 2) then GammaVal := 5521.24;\n  if (ModeloFlip = 3) then GammaVal := 5285.01;\n  if (ModeloFlip = 4) then GammaVal := 5236.01;\n  if (ModeloFlip = 5) then GammaVal := 5237.25;\n  if (ModeloFlip = 6) then GammaVal := 5514.30;\n  if (ModeloFlip = 7) then GammaVal := 5503.84;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5125.31 <= LimitUpper) and (5125.31 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5125.31, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5151.36 <= LimitUpper) and (5151.36 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5151.36, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5228.64 <= LimitUpper) and (5228.64 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5228.64, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5450.00 <= LimitUpper) and (5450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirMaxPain) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5750.00 <= LimitUpper) and (5750.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5750.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5900.00 <= LimitUpper) and (5900.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5900.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (6128.15 <= LimitUpper) and (6128.15 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6128.15, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6450.00 <= LimitUpper) and (6450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5375.76 > 0) then\n      HorizontalLineCustom(5375.76, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5275.00 <= LimitUpper) and (5275.00 >= LimitLower) then\n      HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5425.00 <= LimitUpper) and (5425.00 >= LimitLower) then\n      HorizontalLineCustom(5425.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5525.00 <= LimitUpper) and (5525.00 >= LimitLower) then\n      HorizontalLineCustom(5525.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5675.00 <= LimitUpper) and (5675.00 >= LimitLower) then\n      HorizontalLineCustom(5675.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5825.00 <= LimitUpper) and (5825.00 >= LimitLower) then\n      HorizontalLineCustom(5825.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5950.00 <= LimitUpper) and (5950.00 >= LimitLower) then\n      HorizontalLineCustom(5950.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6225.00 <= LimitUpper) and (6225.00 >= LimitLower) then\n      HorizontalLineCustom(6225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5419.10 <= LimitUpper) and (5419.10 >= LimitLower) then\n      HorizontalLineCustom(5419.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5430.90 <= LimitUpper) and (5430.90 >= LimitLower) then\n      HorizontalLineCustom(5430.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5507.30 <= LimitUpper) and (5507.30 >= LimitLower) then\n      HorizontalLineCustom(5507.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5542.70 <= LimitUpper) and (5542.70 >= LimitLower) then\n      HorizontalLineCustom(5542.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5657.30 <= LimitUpper) and (5657.30 >= LimitLower) then\n      HorizontalLineCustom(5657.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5692.70 <= LimitUpper) and (5692.70 >= LimitLower) then\n      HorizontalLineCustom(5692.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5807.30 <= LimitUpper) and (5807.30 >= LimitLower) then\n      HorizontalLineCustom(5807.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5842.70 <= LimitUpper) and (5842.70 >= LimitLower) then\n      HorizontalLineCustom(5842.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5938.20 <= LimitUpper) and (5938.20 >= LimitLower) then\n      HorizontalLineCustom(5938.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5961.80 <= LimitUpper) and (5961.80 >= LimitLower) then\n      HorizontalLineCustom(5961.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6171.90 <= LimitUpper) and (6171.90 >= LimitLower) then\n      HorizontalLineCustom(6171.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6278.10 <= LimitUpper) and (6278.10 >= LimitLower) then\n      HorizontalLineCustom(6278.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5261.80 <= LimitUpper) and (5261.80 >= LimitLower) then\n      HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5411.80 <= LimitUpper) and (5411.80 >= LimitLower) then\n      HorizontalLineCustom(5411.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5438.20 <= LimitUpper) and (5438.20 >= LimitLower) then\n      HorizontalLineCustom(5438.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5485.40 <= LimitUpper) and (5485.40 >= LimitLower) then\n      HorizontalLineCustom(5485.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5564.60 <= LimitUpper) and (5564.60 >= LimitLower) then\n      HorizontalLineCustom(5564.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5635.40 <= LimitUpper) and (5635.40 >= LimitLower) then\n      HorizontalLineCustom(5635.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5714.60 <= LimitUpper) and (5714.60 >= LimitLower) then\n      HorizontalLineCustom(5714.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5785.40 <= LimitUpper) and (5785.40 >= LimitLower) then\n      HorizontalLineCustom(5785.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5864.60 <= LimitUpper) and (5864.60 >= LimitLower) then\n      HorizontalLineCustom(5864.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5923.60 <= LimitUpper) and (5923.60 >= LimitLower) then\n      HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5976.40 <= LimitUpper) and (5976.40 >= LimitLower) then\n      HorizontalLineCustom(5976.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6106.20 <= LimitUpper) and (6106.20 >= LimitLower) then\n      HorizontalLineCustom(6106.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6343.80 <= LimitUpper) and (6343.80 >= LimitLower) then\n      HorizontalLineCustom(6343.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5197.78, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5182.22, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5205.57, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5174.43, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5220.03, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5159.97, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5227.81, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5152.19, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 74790,
        "total_volume": 33340,
        "gamma_exposure": 199355221.3338758,
        "delta_position": -12463.089217616662,
        "last_update": "2026-03-11T15:36:23.851827",
        "spot_price": 5190.0,
        "dealer_pressure": 0.05036425430533429,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 5503.841312298379,
        "call_wall": 6000.0,
        "put_wall": 5250.0,
        "effective_call_wall": 6128.152969894223,
        "effective_put_wall": 5125.314861460957,
        "max_pain": 5600.0,
        "zero_gamma": 5514.304158169663,
        "range_low": 5151.355778386118,
        "range_high": 5228.644221613883,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5228.644221613882,
                "sigma_1_down": 5151.355778386118,
                "sigma_2_up": 5267.288443227765,
                "sigma_2_down": 5112.711556772235
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5276.4111064662075,
                "sigma_1_down": 5103.5888935337925,
                "sigma_2_up": 5362.822212932416,
                "sigma_2_down": 5017.177787067584
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 212,
                "sigma_1_up": 5752.668359869546,
                "sigma_1_down": 4627.331640130454,
                "sigma_2_up": 6315.3367197390935,
                "sigma_2_down": 4064.6632802609065
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
                5158.06152026222,
                5240.213738249982,
                5236.719668471433,
                5238.167240336852,
                5240.741454819479,
                5243.662322693756,
                5246.558311715352,
                5249.199695232479,
                5265.893350977022,
                5285.012855936355,
                5299.985120893116,
                5320.214200993335,
                5335.449112555337,
                5347.239230168169,
                5367.744922940211,
                5387.229401127452,
                5409.470775420392,
                5452.120875820135,
                5468.2429570498925,
                5479.423570063004,
                5487.390163212411,
                5493.200106467289,
                5497.523391535245,
                5500.797511774437,
                5503.315773364788,
                5505.279446494406,
                5506.829532324782,
                5508.066654525638,
                5509.063826201265,
                5509.874828221579
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4411.5,
                4443.275510204082,
                4475.051020408163,
                4506.826530612245,
                4538.602040816327,
                4570.377551020408,
                4602.15306122449,
                4633.928571428572,
                4665.704081632653,
                4697.4795918367345,
                4729.255102040816,
                4761.030612244897,
                4792.806122448979,
                4824.581632653061,
                4856.357142857142,
                4888.132653061224,
                4919.908163265306,
                4951.683673469387,
                4983.459183673469,
                5015.234693877551,
                5047.010204081633,
                5078.785714285714,
                5110.561224489796,
                5142.336734693878,
                5174.112244897959,
                5205.8877551020405,
                5237.663265306122,
                5269.438775510203,
                5301.214285714285,
                5332.989795918367,
                5364.765306122448,
                5396.54081632653,
                5428.316326530612,
                5460.091836734693,
                5491.867346938775,
                5523.642857142857,
                5555.418367346938,
                5587.19387755102,
                5618.969387755102,
                5650.744897959183,
                5682.520408163265,
                5714.2959183673465,
                5746.0714285714275,
                5777.846938775509,
                5809.622448979591,
                5841.397959183672,
                5873.173469387754,
                5904.948979591836,
                5936.724489795917,
                5968.499999999999
            ],
            "deltas": [
                -40642.05903004652,
                -40451.331221527464,
                -40229.41897049017,
                -39973.30729252143,
                -39679.926132092456,
                -39346.03733743249,
                -38968.01367542624,
                -38541.482390545185,
                -38060.82478910874,
                -37518.5611967287,
                -36904.7068711723,
                -36206.24986099624,
                -35406.95719681404,
                -34487.73490135622,
                -33427.72461710435,
                -32206.202006139025,
                -30805.159842968867,
                -29212.250969483845,
                -27423.594620684766,
                -25445.87930118016,
                -23297.268899001727,
                -21006.83345243635,
                -18612.528345020757,
                -16158.047729529522,
                -13689.09070255572,
                -11249.646774337276,
                -8878.827690796175,
                -6608.5905906461385,
                -4462.481464126177,
                -2455.340909468107,
                -593.7930208570292,
                1122.7114227697045,
                2700.521253093332,
                4150.269817043782,
                5485.364840200853,
                6720.590974840625,
                7870.901656437632,
                8950.45135548427,
                9971.896006151148,
                10945.966253141743,
                11881.29533879451,
                12784.462983586975,
                13660.201350192458,
                14511.701593113663,
                15340.960689369589,
                16149.117494201126,
                16936.74185357674,
                17704.057705114647,
                18451.09692597225,
                19177.792588407094
            ],
            "flip_value": 5375.757457213819
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
                5.0,
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
                4411.5,
                4443.275510204082,
                4475.051020408163,
                4506.826530612245,
                4538.602040816327,
                4570.377551020408,
                4602.15306122449,
                4633.928571428572,
                4665.704081632653,
                4697.4795918367345,
                4729.255102040816,
                4761.030612244897,
                4792.806122448979,
                4824.581632653061,
                4856.357142857142,
                4888.132653061224,
                4919.908163265306,
                4951.683673469387,
                4983.459183673469,
                5015.234693877551,
                5047.010204081633,
                5078.785714285714,
                5110.561224489796,
                5142.336734693878,
                5174.112244897959,
                5205.8877551020405,
                5237.663265306122,
                5269.438775510203,
                5301.214285714285,
                5332.989795918367,
                5364.765306122448,
                5396.54081632653,
                5428.316326530612,
                5460.091836734693,
                5491.867346938775,
                5523.642857142857,
                5555.418367346938,
                5587.19387755102,
                5618.969387755102,
                5650.744897959183,
                5682.520408163265,
                5714.2959183673465,
                5746.0714285714275,
                5777.846938775509,
                5809.622448979591,
                5841.397959183672,
                5873.173469387754,
                5904.948979591836,
                5936.724489795917,
                5968.499999999999
            ],
            "pnl": [
                -24130048.419878535,
                -22774055.219851196,
                -21441254.215334207,
                -20133008.19242348,
                -18850660.927096944,
                -17595529.029185385,
                -16368894.132247888,
                -15171995.529919613,
                -14006023.346154932,
                -12872112.31217067,
                -11771336.207312983,
                -10704703.005047828,
                -9673150.749311317,
                -8677544.171007678,
                -7718672.039925121,
                -6797245.234100491,
                -5913895.496979941,
                -5069174.842799215,
                -4263555.5625754725,
                -3497430.77701338,
                -2771115.478474496,
                -2084848.001863299,
                -1438791.8637194727,
                -833037.9098065495,
                -267606.7138442565,
                257548.8264726717,
                742540.7456347104,
                1187543.1630726214,
                1592789.371444935,
                1958568.893715378,
                2285224.536589097,
                2573149.4623608924,
                2822784.296032302,
                3034614.279797936,
                3209166.4827764835,
                3347007.070226984,
                3448738.6334843803,
                3514997.5794732403,
                3546451.5769078173,
                3543797.0551203787,
                3507756.7508373074,
                3439077.298077559,
                3338526.8566177916,
                3206892.7750750966,
                3044979.2855307553,
                2853605.22768021,
                2633601.801675357,
                2385810.3500594757,
                2111080.1704244744,
                1810266.3615903147
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
                        "Call_Now": 884.6444413257477,
                        "Call_Sim": 1685.541601466899,
                        "Call_Chg": 90.53322699240715,
                        "Put_Now": 9.284499804526831,
                        "Put_Sim": 0.18165994567832744,
                        "Put_Chg": -98.04340622001246
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 469.058398584928,
                        "Call_Sim": 1210.038375175357,
                        "Call_Chg": 157.97179601214768,
                        "Put_Now": 73.10290800579287,
                        "Put_Sim": 4.082884596222115,
                        "Put_Chg": -94.41488073785168
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 399.9432063214581,
                        "Call_Sim": 1116.7801298427748,
                        "Call_Chg": 179.23467937223876,
                        "Put_Now": 99.86860593073993,
                        "Put_Sim": 6.705529452056851,
                        "Put_Chg": -93.28564828800432
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 367.6497938675634,
                        "Call_Sim": 1070.611320623494,
                        "Call_Chg": 191.20411284907587,
                        "Put_Now": 115.51563857105498,
                        "Put_Sim": 8.477165326985727,
                        "Put_Chg": -92.66145655094887
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 336.93316571086325,
                        "Call_Sim": 1024.817943057842,
                        "Call_Chg": 204.16060137495697,
                        "Put_Now": 132.7394555085632,
                        "Put_Sim": 10.624232855541862,
                        "Put_Chg": -91.9961756549043
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 307.82914163443,
                        "Call_Sim": 979.45705972617,
                        "Call_Chg": 218.1820455742777,
                        "Put_Now": 151.57587652633856,
                        "Put_Sim": 13.203794618078177,
                        "Put_Chg": -91.28898679613849
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 280.3611597486233,
                        "Call_Sim": 934.5898605050779,
                        "Call_Chg": 233.35211672795455,
                        "Put_Now": 172.0483397347407,
                        "Put_Sim": 16.27704049119518,
                        "Put_Chg": -90.53926325805254
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 254.54009003280044,
                        "Call_Sim": 890.2811887198632,
                        "Call_Chg": 249.76069530152998,
                        "Put_Now": 194.16771511312572,
                        "Put_Sim": 19.908813800188284,
                        "Put_Chg": -89.74658903073096
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 104.73004928952128,
                        "Call_Sim": 564.3384715357333,
                        "Call_Chg": 438.8505737982098,
                        "Put_Now": 427.88123512351603,
                        "Put_Sim": 77.48965736972764,
                        "Put_Chg": -81.8899145349623
                    },
                    {
                        "Strike": 5900.0,
                        "Call_Now": 71.2160893239427,
                        "Call_Sim": 459.69049470579284,
                        "Call_Chg": 545.4868542623639,
                        "Put_Now": 538.1886104405635,
                        "Put_Sim": 116.66301582241272,
                        "Put_Chg": -78.32302401812036
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 54.2162648404385,
                        "Call_Sim": 396.47220016318033,
                        "Call_Chg": 631.2790752554058,
                        "Put_Now": 617.0696761454774,
                        "Put_Sim": 149.325611468219,
                        "Put_Chg": -75.80085082109679
                    },
                    {
                        "Strike": 6450.0,
                        "Call_Now": 13.704762412157038,
                        "Call_Sim": 181.3834368645712,
                        "Call_Chg": 1223.506613319119,
                        "Put_Now": 1008.0221795650732,
                        "Put_Sim": 365.7008540174875,
                        "Put_Chg": -63.72095163865593
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 884.6444413257477,
                        "Call_Sim": 942.5370110579306,
                        "Call_Chg": 6.544162493738592,
                        "Put_Now": 9.284499804526831,
                        "Put_Sim": 7.177069536710377,
                        "Put_Chg": -22.698371610594865
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 469.058398584928,
                        "Call_Sim": 517.0131349450808,
                        "Call_Chg": 10.223617465293087,
                        "Put_Now": 73.10290800579287,
                        "Put_Sim": 61.05764436594575,
                        "Put_Chg": -16.477133356846245
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 399.9432063214581,
                        "Call_Sim": 444.59538412009897,
                        "Call_Chg": 11.164629650628763,
                        "Put_Now": 99.86860593073993,
                        "Put_Sim": 84.52078372938126,
                        "Put_Chg": -15.36801486144962
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 367.6497938675634,
                        "Call_Sim": 410.51633429166213,
                        "Call_Chg": 11.659612255770861,
                        "Put_Now": 115.51563857105498,
                        "Put_Sim": 98.38217899515371,
                        "Put_Chg": -14.832155877632347
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 336.93316571086325,
                        "Call_Sim": 377.93936911119545,
                        "Call_Chg": 12.170426533647143,
                        "Put_Now": 132.7394555085632,
                        "Put_Sim": 113.74565890889517,
                        "Put_Chg": -14.30908129530689
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 307.82914163443,
                        "Call_Sim": 346.91317514278353,
                        "Call_Chg": 12.696664552561664,
                        "Put_Now": 151.57587652633856,
                        "Put_Sim": 130.65991003469162,
                        "Put_Chg": -13.799007448267982
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 280.3611597486233,
                        "Call_Sim": 317.4750646409684,
                        "Call_Chg": 13.237891056529394,
                        "Put_Now": 172.0483397347407,
                        "Put_Sim": 149.162244627086,
                        "Put_Chg": -13.302130751706073
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 254.54009003280044,
                        "Call_Sim": 289.65045737014134,
                        "Call_Chg": 13.793649296193983,
                        "Put_Now": 194.16771511312572,
                        "Put_Sim": 169.27808245046708,
                        "Put_Chg": -12.818625716513932
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 104.73004928952128,
                        "Call_Sim": 124.31963013491259,
                        "Call_Chg": 18.70483302384098,
                        "Put_Now": 427.88123512351603,
                        "Put_Sim": 387.47081596890666,
                        "Put_Chg": -9.44430740061413
                    },
                    {
                        "Strike": 5900.0,
                        "Call_Now": 71.2160893239427,
                        "Call_Sim": 85.97771594694359,
                        "Call_Chg": 20.727937693762225,
                        "Put_Now": 538.1886104405635,
                        "Put_Sim": 492.95023706356415,
                        "Put_Chg": -8.405672751039269
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 54.2162648404385,
                        "Call_Sim": 66.20990421280612,
                        "Call_Chg": 22.12184739702297,
                        "Put_Now": 617.0696761454774,
                        "Put_Sim": 569.0633155178439,
                        "Put_Chg": -7.779730958018388
                    },
                    {
                        "Strike": 6450.0,
                        "Call_Now": 13.704762412157038,
                        "Call_Sim": 17.6455142122997,
                        "Call_Chg": 28.7546159621633,
                        "Put_Now": 1008.0221795650732,
                        "Put_Sim": 951.9629313652158,
                        "Put_Chg": -5.561310984649666
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 884.6444413257477,
                        "Call_Sim": 297.3541501223849,
                        "Call_Chg": -66.38715666638187,
                        "Put_Now": 9.284499804526831,
                        "Put_Sim": 111.99420860116447,
                        "Put_Chg": 1106.2492429216231
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 469.058398584928,
                        "Call_Sim": 87.11960615819794,
                        "Call_Chg": -81.42670370661234,
                        "Put_Now": 73.10290800579287,
                        "Put_Sim": 381.16411557906304,
                        "Put_Chg": 421.4075964650525
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 399.9432063214581,
                        "Call_Sim": 64.76960376562056,
                        "Call_Chg": -83.80529966708289,
                        "Put_Now": 99.86860593073993,
                        "Put_Sim": 454.6950033749026,
                        "Put_Chg": 355.2932316790714
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 367.6497938675634,
                        "Call_Sim": 55.498596912196945,
                        "Call_Chg": -84.90449394017914,
                        "Put_Now": 115.51563857105498,
                        "Put_Sim": 493.36444161568807,
                        "Put_Chg": 327.09753217718134
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 336.93316571086325,
                        "Call_Sim": 47.359042328721785,
                        "Call_Chg": -85.94408412457602,
                        "Put_Now": 132.7394555085632,
                        "Put_Sim": 533.1653321264212,
                        "Put_Chg": 301.66303988796005
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 307.82914163443,
                        "Call_Sim": 40.248742833263236,
                        "Call_Chg": -86.92497317844533,
                        "Put_Now": 151.57587652633856,
                        "Put_Sim": 573.9954777251714,
                        "Put_Chg": 278.68524390517456
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 280.3611597486233,
                        "Call_Sim": 34.06827744328052,
                        "Call_Chg": -87.84843183206021,
                        "Put_Now": 172.0483397347407,
                        "Put_Sim": 615.7554574293977,
                        "Put_Chg": 257.89677388270775
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 254.54009003280044,
                        "Call_Sim": 28.722208432379603,
                        "Call_Chg": -88.71603745065131,
                        "Put_Now": 194.16771511312572,
                        "Put_Sim": 658.3498335127056,
                        "Put_Chg": 239.0624610940798
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 104.73004928952128,
                        "Call_Sim": 6.3939349682237605,
                        "Call_Chg": -93.89484201372996,
                        "Put_Now": 427.88123512351603,
                        "Put_Sim": 1019.5451208022187,
                        "Put_Chg": 138.2775960034582
                    },
                    {
                        "Strike": 5900.0,
                        "Call_Now": 71.2160893239427,
                        "Call_Sim": 3.4324865770954744,
                        "Call_Chg": -95.18018103818925,
                        "Put_Now": 538.1886104405635,
                        "Put_Sim": 1160.4050076937156,
                        "Put_Chg": 115.61307414956312
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 54.2162648404385,
                        "Call_Sim": 2.230336846394117,
                        "Call_Chg": -95.88622186910493,
                        "Put_Now": 617.0696761454774,
                        "Put_Sim": 1255.0837481514327,
                        "Put_Chg": 103.39417032956587
                    },
                    {
                        "Strike": 6450.0,
                        "Call_Now": 13.704762412157038,
                        "Call_Sim": 0.27637109523237235,
                        "Call_Chg": -97.98339375086712,
                        "Put_Now": 1008.0221795650732,
                        "Put_Sim": 1684.5937882481485,
                        "Put_Chg": 67.11872242483717
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5241.9,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 884.6444413257477,
                        "Call_Sim": 934.6934597899899,
                        "Call_Chg": 5.657529299481904,
                        "Put_Now": 9.284499804526831,
                        "Put_Sim": 7.433518268769063,
                        "Put_Chg": -19.93625477653936
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 469.058398584928,
                        "Call_Sim": 510.43633816894135,
                        "Call_Chg": 8.821489969872362,
                        "Put_Now": 73.10290800579287,
                        "Put_Sim": 62.580847589807036,
                        "Put_Chg": -14.393490906205864
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 399.9432063214581,
                        "Call_Sim": 438.44909886606,
                        "Call_Chg": 9.627840137295006,
                        "Put_Now": 99.86860593073993,
                        "Put_Sim": 86.47449847534199,
                        "Put_Chg": -13.41172967277316
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 367.6497938675634,
                        "Call_Sim": 404.6042784106621,
                        "Call_Chg": 10.051545019065246,
                        "Put_Now": 115.51563857105498,
                        "Put_Sim": 100.57012311415383,
                        "Put_Chg": -12.938088419697383
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 336.93316571086325,
                        "Call_Sim": 372.27235467587207,
                        "Call_Chg": 10.488486311654723,
                        "Put_Now": 132.7394555085632,
                        "Put_Sim": 116.17864447357215,
                        "Put_Chg": -12.476178218105382
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 307.82914163443,
                        "Call_Sim": 341.50038620422265,
                        "Call_Chg": 10.93829011477404,
                        "Put_Now": 151.57587652633856,
                        "Put_Sim": 133.34712109613133,
                        "Put_Chg": -12.026158679042647
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 280.3611597486233,
                        "Call_Sim": 312.32390196480947,
                        "Call_Chg": 11.400559993704011,
                        "Put_Now": 172.0483397347407,
                        "Put_Sim": 152.11108195092675,
                        "Put_Chg": -11.588172146591273
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 254.54009003280044,
                        "Call_Sim": 284.7664255642044,
                        "Call_Chg": 11.874882077518293,
                        "Put_Now": 194.16771511312572,
                        "Put_Sim": 172.49405064453094,
                        "Put_Chg": -11.162342027853239
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 104.73004928952128,
                        "Call_Sim": 121.54057074297543,
                        "Call_Chg": 16.051287636638328,
                        "Put_Now": 427.88123512351603,
                        "Put_Sim": 392.79175657697033,
                        "Put_Chg": -8.200751906406099
                    },
                    {
                        "Strike": 5900.0,
                        "Call_Now": 71.2160893239427,
                        "Call_Sim": 83.8670509801616,
                        "Call_Chg": 17.764190334396346,
                        "Put_Now": 538.1886104405635,
                        "Put_Sim": 498.9395720967823,
                        "Put_Chg": -7.292803597543948
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 54.2162648404385,
                        "Call_Sim": 64.48587912297444,
                        "Call_Chg": 18.941943552843394,
                        "Put_Now": 617.0696761454774,
                        "Put_Sim": 575.439290428013,
                        "Put_Chg": -6.746464350267278
                    },
                    {
                        "Strike": 6450.0,
                        "Call_Now": 13.704762412157038,
                        "Call_Sim": 17.06521366966831,
                        "Call_Chg": 24.520317510432196,
                        "Put_Now": 1008.0221795650732,
                        "Put_Sim": 959.4826308225856,
                        "Put_Chg": -4.815325468674778
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5138.1,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 884.6444413257477,
                        "Call_Sim": 835.0034380967477,
                        "Call_Chg": -5.611407353061184,
                        "Put_Now": 9.284499804526831,
                        "Put_Sim": 11.543496575526461,
                        "Put_Chg": 24.33083977123048
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 469.058398584928,
                        "Call_Sim": 429.0824210257724,
                        "Call_Chg": -8.52260138178029,
                        "Put_Now": 73.10290800579287,
                        "Put_Sim": 85.02693044663692,
                        "Put_Chg": 16.311283321176724
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 399.9432063214581,
                        "Call_Sim": 363.02865320909996,
                        "Call_Chg": -9.22994878495016,
                        "Put_Now": 99.86860593073993,
                        "Put_Sim": 114.85405281838166,
                        "Put_Chg": 15.005162781619596
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 367.6497938675634,
                        "Call_Sim": 332.36852730849387,
                        "Call_Chg": -9.59643311313231,
                        "Put_Now": 115.51563857105498,
                        "Put_Sim": 132.13437201198485,
                        "Put_Chg": 14.386565876712442
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 336.93316571086325,
                        "Call_Sim": 303.3384744530804,
                        "Call_Chg": -9.970728523238318,
                        "Put_Now": 132.7394555085632,
                        "Put_Sim": 151.0447642507795,
                        "Put_Chg": 13.79040517537411
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 307.82914163443,
                        "Call_Sim": 275.9618271531813,
                        "Call_Chg": -10.352273443653864,
                        "Put_Now": 151.57587652633856,
                        "Put_Sim": 171.608562045089,
                        "Put_Chg": 13.216275556400603
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 280.3611597486233,
                        "Call_Sim": 250.2489644680636,
                        "Call_Chg": -10.74050175407993,
                        "Put_Now": 172.0483397347407,
                        "Put_Sim": 193.8361444541806,
                        "Put_Chg": 12.663769236617886
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 254.54009003280044,
                        "Call_Sim": 226.19743779238888,
                        "Call_Chg": -11.13484804564942,
                        "Put_Now": 194.16771511312572,
                        "Put_Sim": 217.72506287271426,
                        "Put_Chg": 12.13247410665753
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 104.73004928952128,
                        "Call_Sim": 89.60139559012805,
                        "Call_Chg": -14.445380100577227,
                        "Put_Now": 427.88123512351603,
                        "Put_Sim": 464.6525814241222,
                        "Put_Chg": 8.59382073392198
                    },
                    {
                        "Strike": 5900.0,
                        "Call_Now": 71.2160893239427,
                        "Call_Sim": 60.016310748795036,
                        "Call_Chg": -15.726472320324838,
                        "Put_Now": 538.1886104405635,
                        "Put_Sim": 578.8888318654144,
                        "Put_Chg": 7.562445699386611
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 54.2162648404385,
                        "Call_Sim": 45.225181526408846,
                        "Call_Chg": -16.583737999087383,
                        "Put_Now": 617.0696761454774,
                        "Put_Sim": 659.9785928314459,
                        "Put_Chg": 6.953658289287336
                    },
                    {
                        "Strike": 6450.0,
                        "Call_Now": 13.704762412157038,
                        "Call_Sim": 10.90805683698673,
                        "Call_Chg": -20.406815463575224,
                        "Put_Now": 1008.0221795650732,
                        "Put_Sim": 1057.1254739899023,
                        "Put_Chg": 4.871251389132673
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -8.776852967466711e-05,
            -0.16374913598183444,
            -0.12726475822009342,
            -0.012099672125460228,
            -0.0049810713681401175,
            0.2802450224035607,
            0.11592175083680448,
            0.1001730174586126,
            0.05607650009887339,
            0.020849419811472023,
            0.17060907375475817,
            0.0003957890273245345,
            0.005372052939496011,
            0.40163032104322854,
            0.116305197566217
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
            -0.45926256535144705,
            -1962.4231927204457,
            -1401.0775960552999,
            -1584.5010348817407,
            -886.8942661426404,
            -5999.03384741415,
            291.6240453745647,
            130.22595328549102,
            72.43686614088124,
            20.07159393300823,
            1856.8821183112814,
            0.11087443758096947,
            19.597188260948702,
            -3433.173350928277,
            413.52469334748906
        ],
        "delta_cumulative": [
            -0.45926256535144705,
            -1962.8824552857973,
            -3363.960051341097,
            -4948.461086222837,
            -5835.355352365477,
            -11834.389199779627,
            -11542.765154405062,
            -11412.53920111957,
            -11340.10233497869,
            -11320.030741045683,
            -9463.148622734401,
            -9463.03774829682,
            -9443.440560035871,
            -12876.613910964148,
            -12463.08921761666
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
            5377.730656425814,
            23950800.22945426,
            28353079.39945381,
            29085428.287578795,
            6435472.96760912,
            56819836.911347315,
            6759377.8579082545,
            4903318.976086228,
            2179429.0769236917,
            697678.9529973555,
            8396589.754213138,
            7094.858753672791,
            216615.4465358741,
            27745942.198126506,
            3799178.6862313333
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            203230.75292346827,
            6662945.320550042,
            4689922.97931018,
            2179429.0769236917,
            697678.9529973555,
            8396589.754213138,
            7094.858753672791,
            216615.4465358741,
            20565256.21456994,
            3799178.6862313333
        ],
        "gamma_put": [
            5377.730656425814,
            23950800.22945426,
            28353079.39945381,
            29085428.287578795,
            6435472.96760912,
            56616606.15842384,
            96432.5373582125,
            213395.9967760481,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            7180685.983556568,
            0.0
        ],
        "gamma_exposure": [
            5377.730656425814,
            23956177.960110687,
            52309257.3595645,
            81394685.64714329,
            87830158.61475241,
            144649995.52609974,
            151409373.384008,
            156312692.36009422,
            158492121.43701792,
            159189800.39001527,
            167586390.1442284,
            167593485.00298208,
            167810100.44951797,
            195556042.64764446,
            199355221.3338758
        ]
    },
    "gex_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 15,
            "abs_call": 14237071.188534942,
            "abs_put": 86073423.50890501,
            "net": 100310494.69743995
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 37,
            "abs_call": 0.0,
            "abs_put": 30843506.137523655,
            "net": 30843506.137523655
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 58,
            "abs_call": 0.0,
            "abs_put": 517467.5894263754,
            "net": 517467.5894263754
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 80,
            "abs_call": 0.0,
            "abs_put": 26829841.191543277,
            "net": 26829841.191543277
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 103,
            "abs_call": 100667.45205565024,
            "abs_put": 0.0,
            "net": 100667.45205565024
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 124,
            "abs_call": 115947.99448022386,
            "abs_put": 0.0,
            "net": 115947.99448022386
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 146,
            "abs_call": 5311460.471478542,
            "abs_put": 7180685.983556568,
            "net": 12492146.45503511
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 168,
            "abs_call": 0.0,
            "abs_put": 34289.51831434817,
            "net": 34289.51831434817
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 189,
            "abs_call": 924125.3068284445,
            "abs_put": 0.0,
            "net": 924125.3068284445
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 212,
            "abs_call": 26525438.876707423,
            "abs_put": 0.0,
            "net": 26525438.876707423
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 233,
            "abs_call": 0.0,
            "abs_put": 106824.74668995607,
            "net": 106824.74668995607
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 253,
            "abs_call": 203230.75292346827,
            "abs_put": 351240.6149079014,
            "net": 554471.3678313696
        }
    ],
    "oi_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 15,
            "call_oi": 3630.0,
            "put_oi": 15310.0,
            "total_oi": 18940.0
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 37,
            "call_oi": 0.0,
            "put_oi": 7020.0,
            "total_oi": 7020.0
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 58,
            "call_oi": 0.0,
            "put_oi": 150.0,
            "total_oi": 150.0
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 80,
            "call_oi": 0.0,
            "put_oi": 11725.0,
            "total_oi": 11725.0
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 103,
            "call_oi": 100.0,
            "put_oi": 0.0,
            "total_oi": 100.0
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 124,
            "call_oi": 100.0,
            "put_oi": 0.0,
            "total_oi": 100.0
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 146,
            "call_oi": 5200.0,
            "put_oi": 7030.0,
            "total_oi": 12230.0
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 168,
            "call_oi": 0.0,
            "put_oi": 30.0,
            "total_oi": 30.0
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 189,
            "call_oi": 500.0,
            "put_oi": 0.0,
            "total_oi": 500.0
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 212,
            "call_oi": 23580.0,
            "put_oi": 0.0,
            "total_oi": 23580.0
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 233,
            "call_oi": 0.0,
            "put_oi": 65.0,
            "total_oi": 65.0
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 253,
            "call_oi": 130.0,
            "put_oi": 220.0,
            "total_oi": 350.0
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
            5.0,
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
            5.0,
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
                "strike": 5750.0,
                "type": "CALL",
                "oi": 375,
                "volume": 200,
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
                "strike": 5350.0,
                "type": "PUT",
                "oi": 130,
                "volume": 130,
                "expiry": "2027-03-01 00:00:00",
                "iv": 0.0
            }
        ]
    },
    "fed_watch": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 20,
            "iv_atm": 0.0,
            "spot": 5190.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 50,
            "iv_atm": 0.0,
            "spot": 5190.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 81,
            "iv_atm": 0.0,
            "spot": 5190.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 111,
            "iv_atm": 0.0,
            "spot": 5190.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 144,
            "iv_atm": 0.0,
            "spot": 5190.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 173,
            "iv_atm": 0.0,
            "spot": 5190.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 203,
            "iv_atm": 0.0,
            "spot": 5190.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 235,
            "iv_atm": 0.0,
            "spot": 5190.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 264,
            "iv_atm": 0.0,
            "spot": 5190.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 295,
            "iv_atm": 0.0,
            "spot": 5190.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 326,
            "iv_atm": 0.0,
            "spot": 5190.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 354,
            "iv_atm": 0.0,
            "spot": 5190.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5190.0,
                    "lower": 5190.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5190.0,
                    "lower": 5190.0,
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
            -0.8442969374278197,
            -4039.921728356247,
            -6225.58955577565,
            -2132.4034463549283,
            406.86182331239684,
            10626.71158707912,
            2739.2710791519285,
            2680.3645170182235,
            1576.3177377909697,
            612.0757127528959,
            1247.530450224744,
            12.732133351077398,
            74.13513184040875,
            7337.6873626996985,
            1198.0263248696463
        ],
        "vanna": [
            -15.471440713751727,
            -19717.783889165257,
            -10075.197295285509,
            -5099.784170669726,
            -1262.0386830857028,
            6460.659313905851,
            2047.5307923321475,
            2160.6386840140717,
            1363.85012705644,
            543.3847023735316,
            5753.320487477891,
            12.906503549816415,
            396.9348881421256,
            53402.665963517786,
            11571.719722500406
        ],
        "vex": [
            4398.6825240395565,
            7718766.68496936,
            2776053.0233986154,
            2124129.603147799,
            2463558.657783793,
            7802170.159199107,
            605383.7814840593,
            605366.3520425071,
            159165.26222279217,
            50951.99227950616,
            8563202.507463023,
            518.1426025369766,
            120482.65886236723,
            24624292.14621067,
            3921388.495250772
        ],
        "theta": [
            -1.0561156676132746,
            -4797.029255874193,
            -6683.928905822897,
            -6705.245336786714,
            -893.5231818343264,
            -9949.388945722008,
            -2237.5443957254815,
            -1537.0597876498111,
            -700.6890300470878,
            -221.16786909931395,
            -4190.645450762859,
            -2.1548219949584326,
            -81.77068578560518,
            -3368.4520821825963,
            -1499.977112277357
        ],
        "charm_cum": [
            -0.8442969374278197,
            -4040.766025293675,
            -10266.355581069325,
            -12398.759027424254,
            -11991.897204111858,
            -1365.1856170327374,
            1374.085462119191,
            4054.4499791374146,
            5630.767716928384,
            6242.84342968128,
            7490.373879906025,
            7503.106013257102,
            7577.2411450975105,
            14914.928507797209,
            16112.954832666856
        ],
        "vanna_cum": [
            -15.471440713751727,
            -19733.255329879008,
            -29808.452625164515,
            -34908.236795834244,
            -36170.275478919946,
            -29709.616165014093,
            -27662.085372681944,
            -25501.44668866787,
            -24137.59656161143,
            -23594.211859237897,
            -17840.891371760008,
            -17827.98486821019,
            -17431.049980068066,
            35971.61598344972,
            47543.33570595013
        ],
        "theta_cum": [
            -1.0561156676132746,
            -4798.085371541806,
            -11482.014277364702,
            -18187.259614151415,
            -19080.782795985742,
            -29030.171741707753,
            -31267.716137433235,
            -32804.77592508305,
            -33505.46495513014,
            -33726.632824229455,
            -37917.27827499231,
            -37919.433096987275,
            -38001.20378277288,
            -41369.65586495547,
            -42869.63297723283
        ],
        "r_gamma": [
            5377.730656425814,
            23950800.22945426,
            28353079.39945381,
            29085428.287578795,
            -6435472.96760912,
            -56819836.911347315,
            -6759377.8579082545,
            -4903318.976086228,
            -2179429.0769236917,
            -697678.9529973555,
            -8396589.754213138,
            -7094.858753672791,
            -216615.4465358741,
            -27745942.19812651,
            -3799178.6862313333
        ],
        "r_gamma_cum": [
            5377.730656425814,
            23956177.960110687,
            52309257.3595645,
            81394685.64714329,
            74959212.67953417,
            18139375.768186852,
            11379997.910278598,
            6476678.93419237,
            4297249.857268678,
            3599570.9042713223,
            -4797018.849941815,
            -4804113.708695488,
            -5020729.155231362,
            -32766671.353357874,
            -36565850.039589204
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.45926256535144705,
            "gamma": 5377.730656425814,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -1962.4231927204457,
            "gamma": 23950800.22945426,
            "volume": 4050,
            "oi": 10890,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -1401.0775960552999,
            "gamma": 28353079.39945381,
            "volume": 1130,
            "oi": 5760,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -1584.5010348817407,
            "gamma": 29085428.287578795,
            "volume": 750,
            "oi": 4530,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -886.8942661426404,
            "gamma": 6435472.96760912,
            "volume": 2315,
            "oi": 2190,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -5999.03384741415,
            "gamma": 56819836.911347315,
            "volume": 1000,
            "oi": 11075,
            "iv": 11.82
        },
        {
            "strike": 5300.0,
            "delta": 291.6240453745647,
            "gamma": 6759377.8579082545,
            "volume": 85,
            "oi": 1220,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": 130.22595328549102,
            "gamma": 4903318.976086228,
            "volume": 430,
            "oi": 1180,
            "iv": 11.82
        },
        {
            "strike": 5400.0,
            "delta": 72.43686614088124,
            "gamma": 2179429.0769236917,
            "volume": 5,
            "oi": 695,
            "iv": 11.82
        },
        {
            "strike": 5450.0,
            "delta": 20.07159393300823,
            "gamma": 697678.9529973555,
            "volume": 100,
            "oi": 350,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 1856.8821183112814,
            "gamma": 8396589.754213138,
            "volume": 4700,
            "oi": 4700,
            "iv": 11.82
        },
        {
            "strike": 5750.0,
            "delta": 0.11087443758096947,
            "gamma": 7094.858753672791,
            "volume": 200,
            "oi": 375,
            "iv": 11.82
        },
        {
            "strike": 5900.0,
            "delta": 19.597188260948702,
            "gamma": 216615.4465358741,
            "volume": 300,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -3433.173350928277,
            "gamma": 27745942.198126506,
            "volume": 11260,
            "oi": 24610,
            "iv": 11.82
        },
        {
            "strike": 6450.0,
            "delta": 413.52469334748906,
            "gamma": 3799178.6862313333,
            "volume": 7000,
            "oi": 7000,
            "iv": 11.82
        }
    ]
};