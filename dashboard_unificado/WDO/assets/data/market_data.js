window.marketData = {
    "last_updated": "2026-03-11 09:25:58",
    "spot_price": 5183.0,
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
                    "3.00-3.25": 3.1,
                    "3.25-3.50": 31.2,
                    "3.50-3.75": 65.7
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 139,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.8,
                    "3.00-3.25": 10.5,
                    "3.25-3.50": 40.3,
                    "3.50-3.75": 48.3
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 188,
                "current_rate": "3.25-3.50",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.3,
                    "2.75-3.00": 3.9,
                    "3.00-3.25": 19.8,
                    "3.25-3.50": 42.8,
                    "3.50-3.75": 33.3
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 230,
                "current_rate": "3.25-3.50",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.1,
                    "2.50-2.75": 1.1,
                    "2.75-3.00": 7.5,
                    "3.00-3.25": 25.1,
                    "3.25-3.50": 40.6,
                    "3.50-3.75": 25.6
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 272,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.4,
                    "2.50-2.75": 2.9,
                    "2.75-3.00": 12.4,
                    "3.00-3.25": 29.4,
                    "3.25-3.50": 36.4,
                    "3.50-3.75": 18.5
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 11/03/2026 09:25\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(3);\n  spot(5183.00);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5568.99;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (5568.99)\n  // 2 = Spline (5568.47)\n  // 3 = HVL (5445.78)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (5568.99)\n  // 7 = HVL Gaussian (5624.90)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 5568.99;\n  if (ModeloFlip = 2) then GammaVal := 5568.47;\n  if (ModeloFlip = 3) then GammaVal := 5445.78;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 5568.99;\n  if (ModeloFlip = 7) then GammaVal := 5624.90;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5125.31 <= LimitUpper) and (5125.31 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5125.31, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5144.41 <= LimitUpper) and (5144.41 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5144.41, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5221.59 <= LimitUpper) and (5221.59 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5221.59, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5450.00 <= LimitUpper) and (5450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirMaxPain) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5750.00 <= LimitUpper) and (5750.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5750.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5900.00 <= LimitUpper) and (5900.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5900.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (6128.15 <= LimitUpper) and (6128.15 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6128.15, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6450.00 <= LimitUpper) and (6450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5375.78 > 0) then\n      HorizontalLineCustom(5375.78, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5275.00 <= LimitUpper) and (5275.00 >= LimitLower) then\n      HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5425.00 <= LimitUpper) and (5425.00 >= LimitLower) then\n      HorizontalLineCustom(5425.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5525.00 <= LimitUpper) and (5525.00 >= LimitLower) then\n      HorizontalLineCustom(5525.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5675.00 <= LimitUpper) and (5675.00 >= LimitLower) then\n      HorizontalLineCustom(5675.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5825.00 <= LimitUpper) and (5825.00 >= LimitLower) then\n      HorizontalLineCustom(5825.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5950.00 <= LimitUpper) and (5950.00 >= LimitLower) then\n      HorizontalLineCustom(5950.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6225.00 <= LimitUpper) and (6225.00 >= LimitLower) then\n      HorizontalLineCustom(6225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5419.10 <= LimitUpper) and (5419.10 >= LimitLower) then\n      HorizontalLineCustom(5419.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5430.90 <= LimitUpper) and (5430.90 >= LimitLower) then\n      HorizontalLineCustom(5430.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5507.30 <= LimitUpper) and (5507.30 >= LimitLower) then\n      HorizontalLineCustom(5507.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5542.70 <= LimitUpper) and (5542.70 >= LimitLower) then\n      HorizontalLineCustom(5542.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5657.30 <= LimitUpper) and (5657.30 >= LimitLower) then\n      HorizontalLineCustom(5657.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5692.70 <= LimitUpper) and (5692.70 >= LimitLower) then\n      HorizontalLineCustom(5692.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5807.30 <= LimitUpper) and (5807.30 >= LimitLower) then\n      HorizontalLineCustom(5807.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5842.70 <= LimitUpper) and (5842.70 >= LimitLower) then\n      HorizontalLineCustom(5842.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5938.20 <= LimitUpper) and (5938.20 >= LimitLower) then\n      HorizontalLineCustom(5938.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5961.80 <= LimitUpper) and (5961.80 >= LimitLower) then\n      HorizontalLineCustom(5961.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6171.90 <= LimitUpper) and (6171.90 >= LimitLower) then\n      HorizontalLineCustom(6171.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6278.10 <= LimitUpper) and (6278.10 >= LimitLower) then\n      HorizontalLineCustom(6278.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5261.80 <= LimitUpper) and (5261.80 >= LimitLower) then\n      HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5411.80 <= LimitUpper) and (5411.80 >= LimitLower) then\n      HorizontalLineCustom(5411.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5438.20 <= LimitUpper) and (5438.20 >= LimitLower) then\n      HorizontalLineCustom(5438.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5485.40 <= LimitUpper) and (5485.40 >= LimitLower) then\n      HorizontalLineCustom(5485.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5564.60 <= LimitUpper) and (5564.60 >= LimitLower) then\n      HorizontalLineCustom(5564.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5635.40 <= LimitUpper) and (5635.40 >= LimitLower) then\n      HorizontalLineCustom(5635.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5714.60 <= LimitUpper) and (5714.60 >= LimitLower) then\n      HorizontalLineCustom(5714.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5785.40 <= LimitUpper) and (5785.40 >= LimitLower) then\n      HorizontalLineCustom(5785.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5864.60 <= LimitUpper) and (5864.60 >= LimitLower) then\n      HorizontalLineCustom(5864.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5923.60 <= LimitUpper) and (5923.60 >= LimitLower) then\n      HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5976.40 <= LimitUpper) and (5976.40 >= LimitLower) then\n      HorizontalLineCustom(5976.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6106.20 <= LimitUpper) and (6106.20 >= LimitLower) then\n      HorizontalLineCustom(6106.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6343.80 <= LimitUpper) and (6343.80 >= LimitLower) then\n      HorizontalLineCustom(6343.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5190.77, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5175.23, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5198.55, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5167.45, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5212.99, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5153.01, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5220.76, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5145.24, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 74790,
        "total_volume": 34210,
        "gamma_exposure": 199912402.6444848,
        "delta_position": -13002.000324502724,
        "last_update": "2026-03-11T09:25:58.105366",
        "spot_price": 5183.0,
        "dealer_pressure": 0.060039307130165184,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 5624.897217362331,
        "call_wall": 6000.0,
        "put_wall": 5250.0,
        "effective_call_wall": 6128.152969894223,
        "effective_put_wall": 5125.314861460957,
        "max_pain": 5600.0,
        "zero_gamma": 5568.985563107283,
        "range_low": 5144.407899686946,
        "range_high": 5221.592100313055,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5221.592100313054,
                "sigma_1_down": 5144.407899686946,
                "sigma_2_up": 5260.184200626109,
                "sigma_2_down": 5105.815799373891
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5269.294559694481,
                "sigma_1_down": 5096.705440305519,
                "sigma_2_up": 5355.589119388961,
                "sigma_2_down": 5010.410880611039
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 212.0,
                "sigma_1_up": 5744.909462274347,
                "sigma_1_down": 4621.090537725653,
                "sigma_2_up": 6306.818924548694,
                "sigma_2_down": 4059.1810754513062
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
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4405.55,
                4437.282653061225,
                4469.015306122449,
                4500.747959183674,
                4532.480612244898,
                4564.213265306123,
                4595.945918367347,
                4627.678571428572,
                4659.411224489796,
                4691.1438775510205,
                4722.876530612245,
                4754.6091836734695,
                4786.341836734694,
                4818.074489795918,
                4849.807142857143,
                4881.539795918367,
                4913.272448979592,
                4945.005102040816,
                4976.737755102041,
                5008.470408163265,
                5040.20306122449,
                5071.935714285714,
                5103.668367346939,
                5135.401020408163,
                5167.133673469388,
                5198.866326530612,
                5230.598979591837,
                5262.331632653061,
                5294.064285714286,
                5325.79693877551,
                5357.529591836735,
                5389.262244897959,
                5420.994897959184,
                5452.727551020408,
                5484.460204081633,
                5516.192857142857,
                5547.925510204082,
                5579.658163265306,
                5611.3908163265305,
                5643.123469387755,
                5674.8561224489795,
                5706.588775510204,
                5738.321428571428,
                5770.054081632653,
                5801.786734693877,
                5833.519387755102,
                5865.252040816326,
                5896.984693877551,
                5928.717346938775,
                5960.45
            ],
            "deltas": [
                -40674.5498488466,
                -40489.59747510859,
                -40274.10963125275,
                -40025.08794510495,
                -39739.49118828768,
                -39414.13981234525,
                -39045.51947565536,
                -38629.45450706357,
                -38160.637854702174,
                -37632.037729117015,
                -37034.253644707256,
                -36354.95869765376,
                -35578.623628009365,
                -34686.746478939116,
                -33658.78333688513,
                -32473.874293245466,
                -31113.28924623432,
                -29563.313325349383,
                -27818.10895545448,
                -25881.996562495136,
                -23770.63741883692,
                -21510.78803636498,
                -19138.58290351957,
                -16696.609207157355,
                -14230.272779038625,
                -11784.054778152664,
                -9398.209188169047,
                -7106.287737081119,
                -4933.666516714781,
                -2897.053002009601,
                -1004.8163174911591,
                742.0804747601355,
                2348.7723615183877,
                3825.005131370918,
                5183.623460074768,
                6439.149171680824,
                7606.532085566352,
                8700.129622430883,
                9732.94803062899,
                10716.155233705744,
                11658.85252335004,
                12568.071273789134,
                13448.944268881325,
                14304.99174140947,
                15138.461304480667,
                15950.668337052826,
                16742.29704514936,
                17513.63913648429,
                18264.763304295248,
                18995.621630046895
            ],
            "flip_value": 5375.782237175967
        },
        "flow_sentiment": {
            "bull": [
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
                0.0,
                0.0,
                0.0,
                0.0
            ],
            "bear": [
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4405.55,
                4437.282653061225,
                4469.015306122449,
                4500.747959183674,
                4532.480612244898,
                4564.213265306123,
                4595.945918367347,
                4627.678571428572,
                4659.411224489796,
                4691.1438775510205,
                4722.876530612245,
                4754.6091836734695,
                4786.341836734694,
                4818.074489795918,
                4849.807142857143,
                4881.539795918367,
                4913.272448979592,
                4945.005102040816,
                4976.737755102041,
                5008.470408163265,
                5040.20306122449,
                5071.935714285714,
                5103.668367346939,
                5135.401020408163,
                5167.133673469388,
                5198.866326530612,
                5230.598979591837,
                5262.331632653061,
                5294.064285714286,
                5325.79693877551,
                5357.529591836735,
                5389.262244897959,
                5420.994897959184,
                5452.727551020408,
                5484.460204081633,
                5516.192857142857,
                5547.925510204082,
                5579.658163265306,
                5611.3908163265305,
                5643.123469387755,
                5674.8561224489795,
                5706.588775510204,
                5738.321428571428,
                5770.054081632653,
                5801.786734693877,
                5833.519387755102,
                5865.252040816326,
                5896.984693877551,
                5928.717346938775,
                5960.45
            ],
            "pnl": [
                -24486679.118044097,
                -23119461.268749435,
                -21775115.326490954,
                -20455001.2216951,
                -19160461.54768721,
                -17892813.406251546,
                -16653340.575900294,
                -15443286.10476407,
                -14263845.417354561,
                -13116160.010229152,
                -12001311.796319332,
                -10920318.141879473,
                -9874127.624169603,
                -8863616.522567403,
                -7889586.041228447,
                -6952760.248035412,
                -6053784.70268736,
                -5193225.73659344,
                -4371570.338897081,
                -3589226.5965332314,
                -2846524.631716596,
                -2143717.9776099697,
                -1480985.3320149612,
                -858432.6296036132,
                -276095.37527179345,
                266058.8155688029,
                768127.5197722297,
                1230270.6974503808,
                1652707.8109679185,
                2035714.90613883,
                2379621.6841821466,
                2684808.587485144,
                2951703.9169993866,
                3180780.99428265,
                3372555.376892941,
                3527582.132108785,
                3646453.1708290223,
                3729794.641013665,
                3778264.37815132,
                3792549.408955056,
                3773363.5037502516,
                3721444.772768216,
                3637553.3017357215,
                3522468.8226765096,
                3376988.4166482463,
                3201924.246149771,
                2998101.3160785995,
                2766355.2633336745,
                2507530.176379459,
                2222476.447264947
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
                        "Call_Now": 877.9237637299952,
                        "Call_Sim": 1685.541601466899,
                        "Call_Chg": 91.9917959966836,
                        "Put_Now": 9.5638222087737,
                        "Put_Sim": 0.18165994567832744,
                        "Put_Chg": -98.10055078698898
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 463.5823052214373,
                        "Call_Sim": 1210.038375175357,
                        "Call_Chg": 161.01910309052096,
                        "Put_Now": 74.62681464230286,
                        "Put_Sim": 4.082884596222115,
                        "Put_Chg": -94.52893089998284
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 394.86922304686686,
                        "Call_Sim": 1116.7801298427748,
                        "Call_Chg": 182.82278401581698,
                        "Put_Now": 101.79462265614893,
                        "Put_Sim": 6.705529452056851,
                        "Put_Chg": -93.41268794255726
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 362.7915120658254,
                        "Call_Sim": 1070.611320623494,
                        "Call_Chg": 195.1037400316138,
                        "Put_Now": 117.6573567693165,
                        "Put_Sim": 8.477165326985727,
                        "Put_Chg": -92.7950401404934
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 332.298429325117,
                        "Call_Sim": 1024.817943057842,
                        "Call_Chg": 208.4028850630443,
                        "Put_Now": 135.10471912281673,
                        "Put_Sim": 10.624232855541862,
                        "Put_Chg": -92.13629773665869
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 303.4241782297654,
                        "Call_Sim": 979.45705972617,
                        "Call_Chg": 222.8012564590302,
                        "Put_Now": 154.17091312167418,
                        "Put_Sim": 13.203794618078177,
                        "Put_Chg": -91.43561236634984
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 276.1904860698546,
                        "Call_Sim": 934.5898605050779,
                        "Call_Chg": 238.38597187185502,
                        "Put_Now": 174.87766605597244,
                        "Put_Sim": 16.27704049119518,
                        "Put_Chg": -90.69232746622691
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 250.60645859267197,
                        "Call_Sim": 890.2811887198632,
                        "Call_Chg": 255.2506961390404,
                        "Put_Now": 197.23408367299817,
                        "Put_Sim": 19.908813800188284,
                        "Put_Chg": -89.90599726505899
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 102.59281245696411,
                        "Call_Sim": 564.3384715357333,
                        "Call_Chg": 450.0760316639759,
                        "Put_Now": 432.7439982909582,
                        "Put_Sim": 77.48965736972764,
                        "Put_Chg": -82.09341835455636
                    },
                    {
                        "Strike": 5900.0,
                        "Call_Now": 69.62272974525195,
                        "Call_Sim": 459.69049470579284,
                        "Call_Chg": 560.2592233711467,
                        "Put_Now": 543.5952508618734,
                        "Put_Sim": 116.66301582241272,
                        "Put_Chg": -78.53862489831491
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 52.93105397555462,
                        "Call_Sim": 396.47220016318033,
                        "Call_Chg": 649.0351511728537,
                        "Put_Now": 622.7844652805934,
                        "Put_Sim": 149.325611468219,
                        "Put_Chg": -76.02290683327485
                    },
                    {
                        "Strike": 6450.0,
                        "Call_Now": 13.296331015270368,
                        "Call_Sim": 181.3834368645712,
                        "Call_Chg": 1264.1615619847212,
                        "Put_Now": 1014.6137481681872,
                        "Put_Sim": 365.7008540174875,
                        "Put_Chg": -63.95664313856043
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 877.9237637299952,
                        "Call_Sim": 942.5370110579306,
                        "Call_Chg": 7.35977883243711,
                        "Put_Now": 9.5638222087737,
                        "Put_Sim": 7.177069536710377,
                        "Put_Chg": -24.95605438873335
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 463.5823052214373,
                        "Call_Sim": 517.0131349450808,
                        "Call_Chg": 11.525640457333976,
                        "Put_Now": 74.62681464230286,
                        "Put_Sim": 61.05764436594575,
                        "Put_Chg": -18.182700603524502
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 394.86922304686686,
                        "Call_Sim": 444.59538412009897,
                        "Call_Chg": 12.59307086268664,
                        "Put_Now": 101.79462265614893,
                        "Put_Sim": 84.52078372938126,
                        "Put_Chg": -16.96930395342866
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 362.7915120658254,
                        "Call_Sim": 410.51633429166213,
                        "Call_Chg": 13.154889416811248,
                        "Put_Now": 117.6573567693165,
                        "Put_Sim": 98.38217899515371,
                        "Put_Chg": -16.382467109094108
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 332.298429325117,
                        "Call_Sim": 377.93936911119545,
                        "Call_Chg": 13.734924922387718,
                        "Put_Now": 135.10471912281673,
                        "Put_Sim": 113.74565890889517,
                        "Put_Chg": -15.809262883338032
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 303.4241782297654,
                        "Call_Sim": 346.91317514278353,
                        "Call_Chg": 14.332739456275778,
                        "Put_Now": 154.17091312167418,
                        "Put_Sim": 130.65991003469162,
                        "Put_Chg": -15.249960327099634
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 276.1904860698546,
                        "Call_Sim": 317.4750646409684,
                        "Call_Chg": 14.947864120370905,
                        "Put_Now": 174.87766605597244,
                        "Put_Sim": 149.162244627086,
                        "Put_Chg": -14.704805941689427
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 250.60645859267197,
                        "Call_Sim": 289.65045737014134,
                        "Call_Chg": 15.579805483357587,
                        "Put_Now": 197.23408367299817,
                        "Put_Sim": 169.27808245046708,
                        "Put_Chg": -14.174021397275533
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 102.59281245696411,
                        "Call_Sim": 124.31963013491259,
                        "Call_Chg": 21.177719138036586,
                        "Put_Now": 432.7439982909582,
                        "Put_Sim": 387.47081596890666,
                        "Put_Chg": -10.461885664700036
                    },
                    {
                        "Strike": 5900.0,
                        "Call_Now": 69.62272974525195,
                        "Call_Sim": 85.97771594694359,
                        "Call_Chg": 23.49087181949657,
                        "Put_Now": 543.5952508618734,
                        "Put_Sim": 492.95023706356415,
                        "Put_Chg": -9.316677016219568
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 52.93105397555462,
                        "Call_Sim": 66.20990421280612,
                        "Call_Chg": 25.087069385363332,
                        "Put_Now": 622.7844652805934,
                        "Put_Sim": 569.0633155178439,
                        "Put_Chg": -8.625961750434099
                    },
                    {
                        "Strike": 6450.0,
                        "Call_Now": 13.296331015270368,
                        "Call_Sim": 17.6455142122997,
                        "Call_Chg": 32.709648940256145,
                        "Put_Now": 1014.6137481681872,
                        "Put_Sim": 951.9629313652158,
                        "Put_Chg": -6.174844064165594
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 877.9237637299952,
                        "Call_Sim": 297.3541501223849,
                        "Call_Chg": -66.12984379656956,
                        "Put_Now": 9.5638222087737,
                        "Put_Sim": 111.99420860116447,
                        "Put_Chg": 1071.019349339459
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 463.5823052214373,
                        "Call_Sim": 87.11960615819794,
                        "Call_Chg": -81.20730554705192,
                        "Put_Now": 74.62681464230286,
                        "Put_Sim": 381.16411557906304,
                        "Put_Chg": 410.76026413031013
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 394.86922304686686,
                        "Call_Sim": 64.76960376562056,
                        "Call_Chg": -83.5972013048145,
                        "Put_Now": 101.79462265614893,
                        "Put_Sim": 454.6950033749026,
                        "Put_Chg": 346.67880435179023
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 362.7915120658254,
                        "Call_Sim": 55.498596912196945,
                        "Call_Chg": -84.70234416561344,
                        "Put_Now": 117.6573567693165,
                        "Put_Sim": 493.36444161568807,
                        "Put_Chg": 319.3230709601927
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 332.298429325117,
                        "Call_Sim": 47.359042328721785,
                        "Call_Chg": -85.74803906689964,
                        "Put_Now": 135.10471912281673,
                        "Put_Sim": 533.1653321264212,
                        "Put_Chg": 294.6311687615797
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 303.4241782297654,
                        "Call_Sim": 40.248742833263236,
                        "Call_Chg": -86.73515635171789,
                        "Put_Now": 154.17091312167418,
                        "Put_Sim": 573.9954777251714,
                        "Put_Chg": 272.311135805601
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 276.1904860698546,
                        "Call_Sim": 34.06827744328052,
                        "Call_Chg": -87.66493447038435,
                        "Put_Now": 174.87766605597244,
                        "Put_Sim": 615.7554574293977,
                        "Put_Chg": 252.10640175876728
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 250.60645859267197,
                        "Call_Sim": 28.722208432379603,
                        "Call_Chg": -88.53891931050995,
                        "Put_Now": 197.23408367299817,
                        "Put_Sim": 658.3498335127056,
                        "Put_Chg": 233.7911081353508
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 102.59281245696411,
                        "Call_Sim": 6.3939349682237605,
                        "Call_Chg": -93.7676579722328,
                        "Put_Now": 432.7439982909582,
                        "Put_Sim": 1019.5451208022187,
                        "Put_Chg": 135.60006027321515
                    },
                    {
                        "Strike": 5900.0,
                        "Call_Now": 69.62272974525195,
                        "Call_Sim": 3.4324865770954744,
                        "Call_Chg": -95.06987647618116,
                        "Put_Now": 543.5952508618734,
                        "Put_Sim": 1160.4050076937156,
                        "Put_Chg": 113.46856983277296
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 52.93105397555462,
                        "Call_Sim": 2.230336846394117,
                        "Call_Chg": -95.78633584847157,
                        "Put_Now": 622.7844652805934,
                        "Put_Sim": 1255.0837481514327,
                        "Put_Chg": 101.5277865972394
                    },
                    {
                        "Strike": 6450.0,
                        "Call_Now": 13.296331015270368,
                        "Call_Sim": 0.27637109523237235,
                        "Call_Chg": -97.92144844382281,
                        "Put_Now": 1014.6137481681872,
                        "Put_Sim": 1684.5937882481485,
                        "Put_Chg": 66.03301416815636
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5234.83,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 877.9237637299952,
                        "Call_Sim": 927.8540930777845,
                        "Call_Chg": 5.687319492942356,
                        "Put_Now": 9.5638222087737,
                        "Put_Sim": 7.664151556563297,
                        "Put_Chg": -19.863090412405153
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 463.5823052214373,
                        "Call_Sim": 504.7214395816909,
                        "Call_Chg": 8.874181325925036,
                        "Put_Now": 74.62681464230286,
                        "Put_Sim": 63.93594900255641,
                        "Put_Chg": -14.325769753123346
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 394.86922304686686,
                        "Call_Sim": 433.11392508327253,
                        "Call_Chg": 9.685409701294047,
                        "Put_Now": 101.79462265614893,
                        "Put_Sim": 88.20932469255467,
                        "Put_Chg": -13.345791368060672
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 362.7915120658254,
                        "Call_Sim": 399.4753317093632,
                        "Call_Chg": 10.1115429726156,
                        "Put_Now": 117.6573567693165,
                        "Put_Sim": 102.51117641285418,
                        "Put_Chg": -12.873126485544367
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 332.298429325117,
                        "Call_Sim": 367.35889707395063,
                        "Call_Chg": 10.550897823995085,
                        "Put_Now": 135.10471912281673,
                        "Put_Sim": 118.33518687164997,
                        "Put_Chg": -12.412247595824132
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 303.4241782297654,
                        "Call_Sim": 336.81022989846633,
                        "Call_Chg": 11.00309535762164,
                        "Put_Now": 154.17091312167418,
                        "Put_Sim": 135.72696479037427,
                        "Put_Chg": -11.963312636504686
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 276.1904860698546,
                        "Call_Sim": 307.86327844121115,
                        "Call_Chg": 11.46773475873669,
                        "Put_Now": 174.87766605597244,
                        "Put_Sim": 154.72045842732837,
                        "Put_Chg": -11.526461945227718
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 250.60645859267197,
                        "Call_Sim": 280.5398923746516,
                        "Call_Chg": 11.944398380662841,
                        "Put_Now": 197.23408367299817,
                        "Put_Sim": 175.33751745497784,
                        "Put_Chg": -11.101816587808154
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 102.59281245696411,
                        "Call_Sim": 119.14949783340512,
                        "Call_Chg": 16.13825079937861,
                        "Put_Now": 432.7439982909582,
                        "Put_Sim": 397.47068366739995,
                        "Put_Chg": -8.151081184918478
                    },
                    {
                        "Strike": 5900.0,
                        "Call_Now": 69.62272974525195,
                        "Call_Sim": 82.05529116819707,
                        "Call_Chg": 17.857043911428924,
                        "Put_Now": 543.5952508618734,
                        "Put_Sim": 504.1978122848177,
                        "Put_Chg": -7.247568575073244
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 52.93105397555462,
                        "Call_Sim": 63.00834768395691,
                        "Call_Chg": 19.038528333587188,
                        "Put_Now": 622.7844652805934,
                        "Put_Sim": 581.0317589889946,
                        "Put_Chg": -6.70419842164612
                    },
                    {
                        "Strike": 6450.0,
                        "Call_Now": 13.296331015270368,
                        "Call_Sim": 16.571478382936903,
                        "Call_Chg": 24.631963237867218,
                        "Put_Now": 1014.6137481681872,
                        "Put_Sim": 966.0588955358535,
                        "Put_Chg": -4.7855504343397675
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5131.17,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 877.9237637299952,
                        "Call_Sim": 828.4098691054355,
                        "Call_Chg": -5.63988545135084,
                        "Put_Now": 9.5638222087737,
                        "Put_Sim": 11.879927584214471,
                        "Put_Chg": 24.21736126917972
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 463.5823052214373,
                        "Call_Sim": 423.85687957843857,
                        "Call_Chg": -8.569228202966736,
                        "Put_Now": 74.62681464230286,
                        "Put_Sim": 86.73138899930359,
                        "Put_Chg": 16.220140729601965
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 394.86922304686686,
                        "Call_Sim": 358.22555427757425,
                        "Call_Chg": -9.279950583776795,
                        "Put_Now": 101.79462265614893,
                        "Put_Sim": 116.98095388685579,
                        "Put_Chg": 14.91859867883652
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 362.7915120658254,
                        "Call_Sim": 327.78922081974815,
                        "Call_Chg": -9.648045800952024,
                        "Put_Now": 117.6573567693165,
                        "Put_Sim": 134.48506552323943,
                        "Put_Chg": 14.302300524153353
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 332.298429325117,
                        "Call_Sim": 298.9891824699871,
                        "Call_Chg": -10.023895365012551,
                        "Put_Now": 135.10471912281673,
                        "Put_Sim": 153.62547226768675,
                        "Put_Chg": 13.70844280282597
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 303.4241782297654,
                        "Call_Sim": 271.8470228962806,
                        "Call_Chg": -10.406934449888594,
                        "Put_Now": 154.17091312167418,
                        "Put_Sim": 174.42375778818905,
                        "Put_Chg": 13.136618481678838
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 276.1904860698546,
                        "Call_Sim": 246.37131942152246,
                        "Call_Chg": -10.796594434751905,
                        "Put_Now": 174.87766605597244,
                        "Put_Sim": 196.8884994076402,
                        "Put_Chg": 12.586417607279163
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 250.60645859267197,
                        "Call_Sim": 222.55781159167327,
                        "Call_Chg": -11.192308114687542,
                        "Put_Now": 197.23408367299817,
                        "Put_Sim": 221.01543667199894,
                        "Put_Chg": 12.05742565186085
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 102.59281245696411,
                        "Call_Sim": 87.70512387121676,
                        "Call_Chg": -14.511434309291872,
                        "Put_Now": 432.7439982909582,
                        "Put_Sim": 469.686309705211,
                        "Put_Chg": 8.53675881355942
                    },
                    {
                        "Strike": 5900.0,
                        "Call_Now": 69.62272974525195,
                        "Call_Sim": 58.62599960308455,
                        "Call_Chg": -15.794741433443058,
                        "Put_Now": 543.5952508618734,
                        "Put_Sim": 584.4285207197045,
                        "Put_Chg": 7.511704672380723
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 52.93105397555462,
                        "Call_Sim": 44.11633029398524,
                        "Call_Chg": -16.653217760674703,
                        "Put_Now": 622.7844652805934,
                        "Put_Sim": 665.799741599023,
                        "Put_Chg": 6.906928273981475
                    },
                    {
                        "Strike": 6450.0,
                        "Call_Now": 13.296331015270368,
                        "Call_Sim": 10.573294060842926,
                        "Call_Chg": -20.479611640986754,
                        "Put_Now": 1014.6137481681872,
                        "Put_Sim": 1063.7207112137594,
                        "Put_Chg": 4.8399662565416
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -8.756492505277253e-05,
            -0.15457119731225166,
            -0.1036155557734049,
            0.00952759568055208,
            -0.0037386085088356074,
            0.2861289213824096,
            0.11189418287010477,
            0.09432240470903759,
            0.051682405606215065,
            0.018840539633324424,
            0.16707613929076828,
            0.0003242047634168975,
            0.005163790364442028,
            0.38858200932664044,
            0.11253128906183765
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
            -0.47396993650033636,
            -2027.9602318270727,
            -1478.8292950064379,
            -1663.6960505947573,
            -904.3070671320601,
            -6151.833895127272,
            273.63848900011385,
            117.26715175601385,
            66.72576574117817,
            18.256825952613433,
            1834.255501256841,
            0.0931897268323849,
            19.018901875055384,
            -3507.5245134827137,
            403.3688732954421
        ],
        "delta_cumulative": [
            -0.47396993650033636,
            -2028.434201763573,
            -3507.2634967700105,
            -5170.959547364768,
            -6075.266614496828,
            -12227.100509624099,
            -11953.462020623985,
            -11836.194868867971,
            -11769.469103126794,
            -11751.21227717418,
            -9916.956775917339,
            -9916.863586190506,
            -9897.84468431545,
            -13405.369197798165,
            -13002.000324502724
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
            5519.819162954024,
            24608808.851870008,
            29250307.781858724,
            29583110.170093656,
            6465736.531026847,
            56381091.22750732,
            6565194.347714078,
            4698085.724887055,
            2052583.075090096,
            647317.6960077661,
            8367911.846709428,
            6034.454304751102,
            211860.86171598855,
            27343140.845994115,
            3725699.410541976
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            204113.47217747994,
            6468431.255271938,
            4484151.615511425,
            2052583.075090096,
            647317.6960077661,
            8367911.846709428,
            6034.454304751102,
            211860.86171598855,
            20296112.994568355,
            3725699.410541976
        ],
        "gamma_put": [
            5519.819162954024,
            24608808.851870008,
            29250307.781858724,
            29583110.170093656,
            6465736.531026847,
            56176977.75532985,
            96763.09244214004,
            213934.10937563027,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            7047027.8514257595,
            0.0
        ],
        "gamma_exposure": [
            5519.819162954024,
            24614328.67103296,
            53864636.452891685,
            83447746.62298533,
            89913483.15401217,
            146294574.3815195,
            152859768.72923356,
            157557854.4541206,
            159610437.52921072,
            160257755.22521847,
            168625667.0719279,
            168631701.52623266,
            168843562.38794866,
            196186703.23394278,
            199912402.64448476
        ]
    },
    "gex_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 15,
            "abs_call": 13658518.096185975,
            "abs_put": 87424165.23635799,
            "net": 101082683.33254397
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 37,
            "abs_call": 0.0,
            "abs_put": 30766442.162408803,
            "net": 30766442.162408803
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 58,
            "abs_call": 0.0,
            "abs_put": 519756.6276195688,
            "net": 519756.6276195688
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 80,
            "abs_call": 0.0,
            "abs_put": 27196530.556981657,
            "net": 27196530.556981657
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 103,
            "abs_call": 98186.01200853624,
            "abs_put": 0.0,
            "net": 98186.01200853624
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 124,
            "abs_call": 113674.84970745232,
            "abs_put": 0.0,
            "net": 113674.84970745232
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 146,
            "abs_call": 5212595.281282212,
            "abs_put": 7047027.8514257595,
            "net": 12259623.132707972
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 168,
            "abs_call": 0.0,
            "abs_put": 34580.254333741854,
            "net": 34580.254333741854
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 189,
            "abs_call": 920090.848849262,
            "abs_put": 0.0,
            "net": 920090.848849262
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 212,
            "abs_call": 26257038.121688284,
            "abs_put": 0.0,
            "net": 26257038.121688284
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 233,
            "abs_call": 0.0,
            "abs_put": 107277.94992260609,
            "net": 107277.94992260609
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 253,
            "abs_call": 204113.47217747994,
            "abs_put": 352405.32353545085,
            "net": 556518.7957129307
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
            300.0,
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
            360.0,
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
                "volume": 300,
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
                "strike": 5300.0,
                "type": "CALL",
                "oi": 1160,
                "volume": 300,
                "expiry": "2026-04-01 00:00:00",
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
                "strike": 5200.0,
                "type": "PUT",
                "oi": 150,
                "volume": 300,
                "expiry": "2026-06-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5900.0,
                "type": "CALL",
                "oi": 100,
                "volume": 200,
                "expiry": "2026-08-03 00:00:00",
                "iv": 0.0
            }
        ]
    },
    "fed_watch": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 20,
            "iv_atm": 0.0,
            "spot": 5183.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 50,
            "iv_atm": 0.0,
            "spot": 5183.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 81,
            "iv_atm": 0.0,
            "spot": 5183.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 111,
            "iv_atm": 0.0,
            "spot": 5183.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 144,
            "iv_atm": 0.0,
            "spot": 5183.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 173,
            "iv_atm": 0.0,
            "spot": 5183.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 203,
            "iv_atm": 0.0,
            "spot": 5183.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 235,
            "iv_atm": 0.0,
            "spot": 5183.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 264,
            "iv_atm": 0.0,
            "spot": 5183.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 295,
            "iv_atm": 0.0,
            "spot": 5183.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 326,
            "iv_atm": 0.0,
            "spot": 5183.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 354,
            "iv_atm": 0.0,
            "spot": 5183.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.0,
                    "lower": 5183.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.0,
                    "lower": 5183.0,
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
            -0.855430268952353,
            -4049.365142937494,
            -5808.944131755384,
            -1496.4175703082697,
            437.0398663746963,
            11383.48008852859,
            2806.312119760487,
            2665.324157364109,
            1530.8957545431092,
            582.4891124343347,
            1256.8642849656942,
            10.977749080487104,
            73.12941239130687,
            7279.93079403859,
            1180.8325388136002
        ],
        "vanna": [
            -15.755541665337297,
            -19663.610084486332,
            -9719.091876639575,
            -4508.596973238211,
            -1119.4020754011572,
            7693.09434765828,
            2136.1465556147477,
            2169.8285119407815,
            1330.501748529317,
            518.690041576039,
            5925.557617424948,
            11.19413272828932,
            392.9573827494654,
            53233.6287197041,
            11431.575636758162
        ],
        "vex": [
            4508.813500922696,
            7856428.952195243,
            2845099.6273259297,
            2157561.730163164,
            2471826.361548811,
            7752906.832284886,
            590787.5536028014,
            590204.4493071609,
            149699.42867170126,
            47210.31291617324,
            8522543.601127345,
            440.1061144514584,
            117706.95668612674,
            24250499.64820867,
            3840358.9098698017
        ],
        "theta": [
            -1.0797233415937222,
            -4909.373073098202,
            -6850.735107783766,
            -6755.471071411598,
            -881.8030278617631,
            -9644.021209692515,
            -2160.6135405864466,
            -1462.8469406172203,
            -657.5164995326647,
            -204.55811828044506,
            -4155.861816888649,
            -1.8291591431023508,
            -79.72527854762677,
            -3165.425536782098,
            -1466.937158958835
        ],
        "charm_cum": [
            -0.855430268952353,
            -4050.2205732064463,
            -9859.16470496183,
            -11355.582275270099,
            -10918.542408895402,
            464.93767963318714,
            3271.249799393674,
            5936.573956757783,
            7467.469711300892,
            8049.958823735227,
            9306.82310870092,
            9317.800857781407,
            9390.930270172714,
            16670.861064211305,
            17851.693603024905
        ],
        "vanna_cum": [
            -15.755541665337297,
            -19679.36562615167,
            -29398.457502791243,
            -33907.05447602946,
            -35026.456551430616,
            -27333.362203772336,
            -25197.215648157588,
            -23027.387136216807,
            -21696.88538768749,
            -21178.19534611145,
            -15252.637728686503,
            -15241.443595958213,
            -14848.486213208747,
            38385.14250649535,
            49816.718143253514
        ],
        "theta_cum": [
            -1.0797233415937222,
            -4910.452796439796,
            -11761.187904223561,
            -18516.65897563516,
            -19398.462003496923,
            -29042.483213189436,
            -31203.096753775884,
            -32665.943694393103,
            -33323.46019392577,
            -33528.018312206215,
            -37683.88012909486,
            -37685.709288237966,
            -37765.434566785596,
            -40930.86010356769,
            -42397.797262526525
        ],
        "r_gamma": [
            5519.819162954024,
            24608808.851870008,
            29250307.781858724,
            29583110.170093656,
            -6465736.531026847,
            -56381091.22750732,
            -6565194.347714078,
            -4698085.724887055,
            -2052583.075090096,
            -647317.6960077661,
            -8367911.846709428,
            -6034.454304751102,
            -211860.86171598855,
            -27343140.845994115,
            -3725699.410541976
        ],
        "r_gamma_cum": [
            5519.819162954024,
            24614328.67103296,
            53864636.452891685,
            83447746.62298533,
            76982010.0919585,
            20600918.86445117,
            14035724.516737092,
            9337638.791850038,
            7285055.716759942,
            6637738.020752176,
            -1730173.8259572526,
            -1736208.2802620037,
            -1948069.1419779921,
            -29291209.987972107,
            -33016909.398514085
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.47396993650033636,
            "gamma": 5519.819162954024,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -2027.9602318270727,
            "gamma": 24608808.851870008,
            "volume": 4050,
            "oi": 10890,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -1478.8292950064379,
            "gamma": 29250307.781858724,
            "volume": 1130,
            "oi": 5760,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -1663.6960505947573,
            "gamma": 29583110.170093656,
            "volume": 750,
            "oi": 4530,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -904.3070671320601,
            "gamma": 6465736.531026847,
            "volume": 2315,
            "oi": 2190,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -6151.833895127272,
            "gamma": 56381091.22750732,
            "volume": 1000,
            "oi": 11075,
            "iv": 11.82
        },
        {
            "strike": 5300.0,
            "delta": 273.63848900011385,
            "gamma": 6565194.347714078,
            "volume": 360,
            "oi": 1220,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": 117.26715175601385,
            "gamma": 4698085.724887055,
            "volume": 430,
            "oi": 1180,
            "iv": 11.82
        },
        {
            "strike": 5400.0,
            "delta": 66.72576574117817,
            "gamma": 2052583.075090096,
            "volume": 600,
            "oi": 695,
            "iv": 11.82
        },
        {
            "strike": 5450.0,
            "delta": 18.256825952613433,
            "gamma": 647317.6960077661,
            "volume": 100,
            "oi": 350,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 1834.255501256841,
            "gamma": 8367911.846709428,
            "volume": 4700,
            "oi": 4700,
            "iv": 11.82
        },
        {
            "strike": 5750.0,
            "delta": 0.0931897268323849,
            "gamma": 6034.454304751102,
            "volume": 200,
            "oi": 375,
            "iv": 11.82
        },
        {
            "strike": 5900.0,
            "delta": 19.018901875055384,
            "gamma": 211860.86171598855,
            "volume": 300,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -3507.5245134827137,
            "gamma": 27343140.845994115,
            "volume": 11260,
            "oi": 24610,
            "iv": 11.82
        },
        {
            "strike": 6450.0,
            "delta": 403.3688732954421,
            "gamma": 3725699.410541976,
            "volume": 7000,
            "oi": 7000,
            "iv": 11.82
        }
    ]
};