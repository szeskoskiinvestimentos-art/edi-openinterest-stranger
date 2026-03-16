window.marketData = {
    "last_updated": "2026-03-16 12:00:10",
    "spot_price": 5280.5,
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-03-16",
        "meetings": [
            {
                "date": "2026-03-18",
                "days_remaining": 1,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 2.0,
                    "3.50-3.75": 98.0
                }
            },
            {
                "date": "2026-04-29",
                "days_remaining": 43,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.1,
                    "3.25-3.50": 2.0,
                    "3.50-3.75": 98.0
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 92,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.4,
                    "3.25-3.50": 21.1,
                    "3.50-3.75": 78.5
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 134,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 5.0,
                    "3.25-3.50": 33.8,
                    "3.50-3.75": 61.1
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 183,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 1.2,
                    "3.00-3.25": 11.4,
                    "3.25-3.50": 39.9,
                    "3.50-3.75": 47.6
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 225,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.2,
                    "2.75-3.00": 2.6,
                    "3.00-3.25": 15.3,
                    "3.25-3.50": 40.9,
                    "3.50-3.75": 41.0
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 267,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.8,
                    "2.75-3.00": 5.9,
                    "3.00-3.25": 22.0,
                    "3.25-3.50": 40.9,
                    "3.50-3.75": 30.3
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 16/03/2026 12:00\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(3);\n  spot(5280.50);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5457.22;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (5457.22)\n  // 2 = Spline (5454.65)\n  // 3 = HVL (5386.99)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (5457.22)\n  // 7 = HVL Gaussian (5452.48)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 5457.22;\n  if (ModeloFlip = 2) then GammaVal := 5454.65;\n  if (ModeloFlip = 3) then GammaVal := 5386.99;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 5457.22;\n  if (ModeloFlip = 7) then GammaVal := 5452.48;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5051.58 <= LimitUpper) and (5051.58 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5051.58, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5241.18 <= LimitUpper) and (5241.18 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5241.18, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5319.82 <= LimitUpper) and (5319.82 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5319.82, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirMaxPain) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirRange) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5425.00 <= LimitUpper) and (5425.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5425.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5450.00 <= LimitUpper) and (5450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5500.00 <= LimitUpper) and (5500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5710.19 <= LimitUpper) and (5710.19 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5710.19, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5800.00 <= LimitUpper) and (5800.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5800.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5346.75 > 0) then\n      HorizontalLineCustom(5346.75, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5275.00 <= LimitUpper) and (5275.00 >= LimitLower) then\n      HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5412.50 <= LimitUpper) and (5412.50 >= LimitLower) then\n      HorizontalLineCustom(5412.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5437.50 <= LimitUpper) and (5437.50 >= LimitLower) then\n      HorizontalLineCustom(5437.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5475.00 <= LimitUpper) and (5475.00 >= LimitLower) then\n      HorizontalLineCustom(5475.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5550.00 <= LimitUpper) and (5550.00 >= LimitLower) then\n      HorizontalLineCustom(5550.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5700.00 <= LimitUpper) and (5700.00 >= LimitLower) then\n      HorizontalLineCustom(5700.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5900.00 <= LimitUpper) and (5900.00 >= LimitLower) then\n      HorizontalLineCustom(5900.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5409.55 <= LimitUpper) and (5409.55 >= LimitLower) then\n      HorizontalLineCustom(5409.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5415.45 <= LimitUpper) and (5415.45 >= LimitLower) then\n      HorizontalLineCustom(5415.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5434.55 <= LimitUpper) and (5434.55 >= LimitLower) then\n      HorizontalLineCustom(5434.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5440.45 <= LimitUpper) and (5440.45 >= LimitLower) then\n      HorizontalLineCustom(5440.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5469.10 <= LimitUpper) and (5469.10 >= LimitLower) then\n      HorizontalLineCustom(5469.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5480.90 <= LimitUpper) and (5480.90 >= LimitLower) then\n      HorizontalLineCustom(5480.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5538.20 <= LimitUpper) and (5538.20 >= LimitLower) then\n      HorizontalLineCustom(5538.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5676.40 <= LimitUpper) and (5676.40 >= LimitLower) then\n      HorizontalLineCustom(5676.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5723.60 <= LimitUpper) and (5723.60 >= LimitLower) then\n      HorizontalLineCustom(5723.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5876.40 <= LimitUpper) and (5876.40 >= LimitLower) then\n      HorizontalLineCustom(5876.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5923.60 <= LimitUpper) and (5923.60 >= LimitLower) then\n      HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5261.80 <= LimitUpper) and (5261.80 >= LimitLower) then\n      HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5405.90 <= LimitUpper) and (5405.90 >= LimitLower) then\n      HorizontalLineCustom(5405.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5419.10 <= LimitUpper) and (5419.10 >= LimitLower) then\n      HorizontalLineCustom(5419.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5430.90 <= LimitUpper) and (5430.90 >= LimitLower) then\n      HorizontalLineCustom(5430.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5444.10 <= LimitUpper) and (5444.10 >= LimitLower) then\n      HorizontalLineCustom(5444.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5461.80 <= LimitUpper) and (5461.80 >= LimitLower) then\n      HorizontalLineCustom(5461.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5488.20 <= LimitUpper) and (5488.20 >= LimitLower) then\n      HorizontalLineCustom(5488.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5523.60 <= LimitUpper) and (5523.60 >= LimitLower) then\n      HorizontalLineCustom(5523.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5576.40 <= LimitUpper) and (5576.40 >= LimitLower) then\n      HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5647.20 <= LimitUpper) and (5647.20 >= LimitLower) then\n      HorizontalLineCustom(5647.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5752.80 <= LimitUpper) and (5752.80 >= LimitLower) then\n      HorizontalLineCustom(5752.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5847.20 <= LimitUpper) and (5847.20 >= LimitLower) then\n      HorizontalLineCustom(5847.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5952.80 <= LimitUpper) and (5952.80 >= LimitLower) then\n      HorizontalLineCustom(5952.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5288.42, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5272.58, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5296.34, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5264.66, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5311.05, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5249.95, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5318.97, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5242.03, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 61505,
        "total_volume": 22655,
        "gamma_exposure": 193082828.1199213,
        "delta_position": -5013.543822305183,
        "last_update": "2026-03-16T12:00:10.121414",
        "spot_price": 5280.5,
        "dealer_pressure": 0.24685414030535074,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 5452.484371479792,
        "call_wall": 5400.0,
        "put_wall": 5250.0,
        "effective_call_wall": 5710.18593371059,
        "effective_put_wall": 5051.5778019586505,
        "max_pain": 5400.0,
        "zero_gamma": 5457.221668021647,
        "range_low": 5241.181924425413,
        "range_high": 5319.818075574587,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5319.818075574587,
                "sigma_1_down": 5241.181924425413,
                "sigma_2_up": 5359.136151149174,
                "sigma_2_down": 5201.863848850826
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5368.41788972925,
                "sigma_1_down": 5192.58211027075,
                "sigma_2_up": 5456.335779458501,
                "sigma_2_down": 5104.664220541499
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 209,
                "sigma_1_up": 5848.914824736113,
                "sigma_1_down": 4712.085175263887,
                "sigma_2_up": 6417.329649472226,
                "sigma_2_down": 4143.670350527774
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
                5257.558853479662,
                4500.0,
                null,
                null,
                null,
                null,
                5428.824153890904,
                5390.313712822879,
                5387.069927317314,
                5386.989091738552,
                5388.33852856828,
                5390.348061407166,
                5392.6343764340345,
                5394.9928178256405,
                5397.310889965485,
                5399.527522361173,
                5426.072947028643,
                5428.614122870748,
                5430.853681363681,
                5432.834892066509,
                5434.593997116521,
                5436.1614320911285,
                5437.562841323386,
                5438.8199094247575,
                5439.95103941422,
                5440.971905889039,
                5441.895907205673,
                5442.734536156585,
                5443.497684784528,
                5444.193895847143
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
                5257.520859315373,
                null,
                null,
                null,
                null,
                5423.7905961155575,
                5373.681357928427,
                5364.501290674167,
                5361.210959576123,
                5360.159990492911,
                5360.04248515942,
                5360.322968715246,
                5360.763154695893,
                5361.252334269938,
                5361.738612171676,
                5362.198480188203,
                5362.622485133515,
                5363.008170943673,
                5363.356496076412,
                5363.669982398165,
                5363.95175417972,
                5364.205044990653,
                5364.432953975045,
                5364.638335673673,
                5364.823760893505,
                5364.9915145106825,
                5365.143611495246,
                5365.281820927515,
                5365.407692494218,
                5365.522582590411
            ]
        },
        "gamma_flip_cone_nearest_expiry": "2026-04-01",
        "delta_flip_profile": {
            "spots": [
                4488.425,
                4520.754591836735,
                4553.08418367347,
                4585.413775510204,
                4617.743367346939,
                4650.072959183673,
                4682.402551020408,
                4714.732142857143,
                4747.061734693878,
                4779.391326530613,
                4811.720918367347,
                4844.050510204082,
                4876.380102040816,
                4908.709693877551,
                4941.039285714286,
                4973.368877551021,
                5005.698469387755,
                5038.02806122449,
                5070.3576530612245,
                5102.687244897959,
                5135.016836734694,
                5167.346428571429,
                5199.676020408163,
                5232.005612244898,
                5264.335204081633,
                5296.664795918367,
                5328.994387755102,
                5361.323979591837,
                5393.653571428571,
                5425.983163265306,
                5458.312755102041,
                5490.6423469387755,
                5522.97193877551,
                5555.301530612245,
                5587.63112244898,
                5619.960714285714,
                5652.290306122449,
                5684.619897959184,
                5716.949489795918,
                5749.279081632652,
                5781.608673469387,
                5813.938265306122,
                5846.267857142857,
                5878.597448979592,
                5910.927040816327,
                5943.256632653061,
                5975.586224489796,
                6007.91581632653,
                6040.245408163265,
                6072.575
            ],
            "deltas": [
                -30723.67476583056,
                -30518.866554503187,
                -30280.63424461874,
                -30005.789690336784,
                -29691.126463594635,
                -29333.402027263946,
                -28929.252067596964,
                -28474.987016692783,
                -27966.228734739958,
                -27397.394166701026,
                -26761.12990829248,
                -26047.92128518745,
                -25246.174522553032,
                -24343.01566854861,
                -23325.819977034276,
                -22184.136118505576,
                -20911.366695922392,
                -19505.51046564448,
                -17968.567190488637,
                -16304.766735343623,
                -14518.35335098529,
                -12611.946598388125,
                -10586.359003439298,
                -8442.237043061803,
                -6183.226543950718,
                -3819.7976554990896,
                -1372.5720862753456,
                1125.9622249995186,
                3632.113688615709,
                6094.219139373479,
                8457.975663996549,
                10672.823721595938,
                12698.015737424126,
                14507.065584349233,
                16089.708063271199,
                17451.160894543562,
                18609.14945202749,
                19589.61397078694,
                20422.155830843807,
                21136.10989081004,
                21757.771103181323,
                22308.908347946,
                22806.389598993792,
                23262.578456447616,
                23686.13686566946,
                24082.936998526933,
                24456.89166701985,
                24810.614120097034,
                25145.891831479068,
                25464.00021278949
            ],
            "flip_value": 5346.754678304458
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                0.0,
                120.0,
                20.0,
                725.0,
                3800.0,
                4200.0,
                150.0,
                5700.0,
                5790.0,
                600.0,
                120.0,
                30.0,
                500.0
            ],
            "bear": [
                -15.0,
                -160.0,
                -305.0,
                -200.0,
                -95.0,
                -95.0,
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
                4488.425,
                4520.754591836735,
                4553.08418367347,
                4585.413775510204,
                4617.743367346939,
                4650.072959183673,
                4682.402551020408,
                4714.732142857143,
                4747.061734693878,
                4779.391326530613,
                4811.720918367347,
                4844.050510204082,
                4876.380102040816,
                4908.709693877551,
                4941.039285714286,
                4973.368877551021,
                5005.698469387755,
                5038.02806122449,
                5070.3576530612245,
                5102.687244897959,
                5135.016836734694,
                5167.346428571429,
                5199.676020408163,
                5232.005612244898,
                5264.335204081633,
                5296.664795918367,
                5328.994387755102,
                5361.323979591837,
                5393.653571428571,
                5425.983163265306,
                5458.312755102041,
                5490.6423469387755,
                5522.97193877551,
                5555.301530612245,
                5587.63112244898,
                5619.960714285714,
                5652.290306122449,
                5684.619897959184,
                5716.949489795918,
                5749.279081632652,
                5781.608673469387,
                5813.938265306122,
                5846.267857142857,
                5878.597448979592,
                5910.927040816327,
                5943.256632653061,
                5975.586224489796,
                6007.91581632653,
                6040.245408163265,
                6072.575
            ],
            "pnl": [
                -5937877.565539004,
                -5295577.927144529,
                -4679655.226580335,
                -4091511.6191739887,
                -3532509.0775197037,
                -3003959.6318468545,
                -2507116.0859574396,
                -2043163.328273058,
                -1613210.3437335975,
                -1218283.0168523043,
                -859317.7996409535,
                -537156.3008512817,
                -252540.8355071023,
                -6110.956456860527,
                201599.02694001794,
                370161.55352534726,
                499256.3633676078,
                588670.1369068567,
                638295.2692567799,
                648127.8381631691,
                618264.8317627367,
                548900.708110718,
                440323.36250226013,
                292909.5809880402,
                107120.0592993442,
                -116505.93419959024,
                -377356.17476170696,
                -674751.3028592207,
                -1007950.7811008748,
                -1376158.920955047,
                -1778530.9188372828,
                -2214178.8465669677,
                -2682177.5468698833,
                -3181570.390368907,
                -3711374.856242964,
                -4270587.904346645,
                -4858191.111983201,
                -5473155.553648917,
                -6114446.40686403,
                -6781027.271640802,
                -7471864.195190815,
                -8185929.397129392,
                -8922204.693697376,
                -9679684.622393696,
                -10457379.270913875,
                -11254316.816436814,
                -12069545.783118779,
                -12902137.027164815,
                -13751185.460078945,
                -14615811.521674352
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
                5425.0,
                5450.0,
                5500.0,
                5600.0,
                5800.0,
                6000.0,
                6200.0
            ],
            "loss": [
                25241000.0,
                9416000.0,
                7141000.0,
                6477500.0,
                5824000.0,
                5278500.0,
                4934000.0,
                4668750.0,
                4538500.0,
                4595250.0,
                4655750.0,
                4936750.0,
                6215750.0,
                9513750.0,
                12835750.0,
                18603750.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5400.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 969.4066643499909,
                        "Call_Sim": 1086.3490138379539,
                        "Call_Chg": 12.06329126758948,
                        "Put_Now": 6.115725467083649,
                        "Put_Sim": 3.5580749550456545,
                        "Put_Chg": -41.82088495966511
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 538.7337702792001,
                        "Call_Sim": 640.6447896828768,
                        "Call_Chg": 18.91676836053195,
                        "Put_Now": 55.13272707596923,
                        "Put_Sim": 37.543746479646074,
                        "Put_Chg": -31.902975835181724
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 464.6785026068178,
                        "Call_Sim": 561.0508453170842,
                        "Call_Chg": 20.73957417216924,
                        "Put_Now": 77.01543853952307,
                        "Put_Sim": 53.88778124979012,
                        "Put_Chg": -30.02989754822238
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 429.72299530641703,
                        "Call_Sim": 523.013327106305,
                        "Call_Chg": 21.709411136671118,
                        "Put_Now": 90.02892080709034,
                        "Put_Sim": 63.819252606978466,
                        "Put_Chg": -29.112498478430837
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 396.238955194091,
                        "Call_Sim": 486.2567149132251,
                        "Call_Chg": 22.71804892960119,
                        "Put_Now": 104.51387026273142,
                        "Put_Sim": 75.03162998186622,
                        "Put_Chg": -28.208925960498345
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 364.28167996458114,
                        "Call_Sim": 450.85414037235887,
                        "Call_Chg": 23.765252322377318,
                        "Put_Now": 120.52558460118917,
                        "Put_Sim": 87.59804500896735,
                        "Put_Chg": -27.319958414785354
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 333.8954789688637,
                        "Call_Sim": 416.87085265907353,
                        "Call_Chg": 24.850702964429004,
                        "Put_Now": 138.10837317343953,
                        "Put_Sim": 101.58374686364937,
                        "Put_Chg": -26.446351854367105
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 305.11298349880553,
                        "Call_Sim": 384.36305883355317,
                        "Call_Chg": 25.974009504927505,
                        "Put_Now": 157.2948672713485,
                        "Put_Sim": 117.04494260609681,
                        "Put_Chg": -25.588835391441457
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 277.9547381708808,
                        "Call_Sim": 353.376971404517,
                        "Call_Chg": 27.134717591059093,
                        "Put_Now": 178.10561151139245,
                        "Put_Sim": 134.02784474502778,
                        "Put_Chg": -24.748106694855743
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 264.9877880725553,
                        "Call_Sim": 338.4660938760949,
                        "Call_Chg": 27.72894039306474,
                        "Put_Now": 189.12315619704987,
                        "Put_Sim": 143.10146200058966,
                        "Put_Chg": -24.33424606583321
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 252.4290759059054,
                        "Call_Sim": 323.94808832830586,
                        "Call_Chg": 28.332319549852354,
                        "Put_Now": 200.54893881438466,
                        "Put_Sim": 152.56795123678512,
                        "Put_Chg": -23.924827456707558
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 969.4066643499909,
                        "Call_Sim": 939.7869307219707,
                        "Call_Chg": -3.0554497629620574,
                        "Put_Now": 6.115725467083649,
                        "Put_Sim": 6.995991839062526,
                        "Put_Chg": 14.393490628653765
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 538.7337702792001,
                        "Call_Sim": 513.6936676105483,
                        "Call_Chg": -4.64795489907282,
                        "Put_Now": 55.13272707596923,
                        "Put_Sim": 60.592624407318226,
                        "Put_Chg": 9.903187491207577
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 464.6785026068178,
                        "Call_Sim": 441.22740357937664,
                        "Call_Chg": -5.046736377061116,
                        "Put_Now": 77.01543853952307,
                        "Put_Sim": 84.06433951208214,
                        "Put_Chg": 9.152581750140506
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 429.72299530641703,
                        "Call_Sim": 407.1408987814102,
                        "Call_Chg": -5.255035632641556,
                        "Put_Now": 90.02892080709034,
                        "Put_Sim": 97.94682428208284,
                        "Put_Chg": 8.794844372241897
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 396.238955194091,
                        "Call_Sim": 374.5689604116001,
                        "Call_Chg": -5.468920836386776,
                        "Put_Now": 104.51387026273142,
                        "Put_Sim": 113.34387548024051,
                        "Put_Chg": 8.448644371614842
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 364.28167996458114,
                        "Call_Sim": 343.56094442105814,
                        "Call_Chg": -5.68810804472453,
                        "Put_Now": 120.52558460118917,
                        "Put_Sim": 130.30484905766593,
                        "Put_Chg": 8.113849427767288
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 333.8954789688637,
                        "Call_Sim": 314.15456863833333,
                        "Call_Chg": -5.912302374232279,
                        "Put_Now": 138.10837317343953,
                        "Put_Sim": 148.8674628429094,
                        "Put_Chg": 7.790323947961039
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 305.11298349880553,
                        "Call_Sim": 286.37538061754003,
                        "Call_Chg": -6.141201421977134,
                        "Put_Now": 157.2948672713485,
                        "Put_Sim": 169.05726439008322,
                        "Put_Chg": 7.4779281249168035
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 277.9547381708808,
                        "Call_Sim": 260.23651774296604,
                        "Call_Chg": -6.37449843255485,
                        "Put_Now": 178.10561151139245,
                        "Put_Sim": 190.8873910834768,
                        "Put_Chg": 7.176517047171632
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 264.9877880725553,
                        "Call_Sim": 247.78292638630228,
                        "Call_Chg": -6.4926998377533645,
                        "Put_Now": 189.12315619704987,
                        "Put_Sim": 202.41829451079684,
                        "Put_Chg": 7.029883902685401
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 252.4290759059054,
                        "Call_Sim": 235.73875525034464,
                        "Call_Chg": -6.611885178307345,
                        "Put_Now": 200.54893881438466,
                        "Put_Sim": 214.35861815882436,
                        "Put_Chg": 6.885939873868424
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 969.4066643499909,
                        "Call_Sim": 294.48080950376425,
                        "Call_Chg": -69.6225722049043,
                        "Put_Now": 6.115725467083649,
                        "Put_Sim": 111.68987062085648,
                        "Put_Chg": 1726.273452299307
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 538.7337702792001,
                        "Call_Sim": 85.17892672174366,
                        "Call_Chg": -84.18905006129475,
                        "Put_Now": 55.13272707596923,
                        "Put_Sim": 382.07788351851286,
                        "Put_Chg": 593.0146643971283
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 464.6785026068178,
                        "Call_Sim": 63.106494148368824,
                        "Call_Chg": -86.4193213599628,
                        "Put_Now": 77.01543853952307,
                        "Put_Sim": 455.94343008107353,
                        "Put_Chg": 492.01562534385977
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 429.72299530641703,
                        "Call_Sim": 53.97325107129859,
                        "Call_Chg": -87.4399900259439,
                        "Put_Now": 90.02892080709034,
                        "Put_Sim": 494.7791765719712,
                        "Put_Chg": 449.578037964223
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 396.238955194091,
                        "Call_Sim": 45.9685340496045,
                        "Call_Chg": -88.39878476181435,
                        "Put_Now": 104.51387026273142,
                        "Put_Sim": 534.7434491182448,
                        "Put_Chg": 411.64830828098127
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 364.28167996458114,
                        "Call_Sim": 38.98872259756479,
                        "Call_Chg": -89.29709487412168,
                        "Put_Now": 120.52558460118917,
                        "Put_Sim": 575.7326272341725,
                        "Put_Chg": 377.68499040202295
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 333.8954789688637,
                        "Call_Sim": 32.93320459759127,
                        "Call_Chg": -90.13667250024001,
                        "Put_Now": 138.10837317343953,
                        "Put_Sim": 617.6460988021668,
                        "Put_Chg": 347.2184304325366
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 305.11298349880553,
                        "Call_Sim": 27.70559012772287,
                        "Call_Chg": -90.91956369407292,
                        "Put_Now": 157.2948672713485,
                        "Put_Sim": 660.3874739002658,
                        "Put_Chg": 319.8404470255441
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 277.9547381708808,
                        "Call_Sim": 23.214658185389965,
                        "Call_Chg": -91.64804372893329,
                        "Put_Now": 178.10561151139245,
                        "Put_Sim": 703.8655315258998,
                        "Put_Chg": 295.19559521619976
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 264.9877880725553,
                        "Call_Sim": 21.218530090075205,
                        "Call_Chg": -91.992638511981,
                        "Put_Now": 189.12315619704987,
                        "Put_Sim": 725.8538982145701,
                        "Put_Chg": 283.79959007150535
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 252.4290759059054,
                        "Call_Sim": 19.375048207971247,
                        "Call_Chg": -92.32455764517657,
                        "Put_Now": 200.54893881438466,
                        "Put_Sim": 747.9949111164501,
                        "Put_Chg": 272.97375669922974
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5333.305,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 969.4066643499909,
                        "Call_Sim": 1020.9237336550568,
                        "Call_Chg": 5.3142887499756615,
                        "Put_Now": 6.115725467083649,
                        "Put_Sim": 4.8277947721486925,
                        "Put_Chg": -21.059328151123186
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 538.7337702792001,
                        "Call_Sim": 583.0592119338658,
                        "Call_Chg": 8.22770802574597,
                        "Put_Now": 55.13272707596923,
                        "Put_Sim": 46.65316873063398,
                        "Put_Chg": -15.380262858485091
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 464.6785026068178,
                        "Call_Sim": 506.4210221051635,
                        "Call_Chg": 8.983096757042285,
                        "Put_Now": 77.01543853952307,
                        "Put_Sim": 65.9529580378678,
                        "Put_Chg": -14.363977809433868
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 429.72299530641703,
                        "Call_Sim": 470.0389710159275,
                        "Call_Chg": 9.381852065133923,
                        "Put_Now": 90.02892080709034,
                        "Put_Sim": 77.53989651660027,
                        "Put_Chg": -13.872235919889523
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 396.238955194091,
                        "Call_Sim": 435.0477768324313,
                        "Call_Chg": 9.794297387880619,
                        "Put_Now": 104.51387026273142,
                        "Put_Sim": 90.51769190107143,
                        "Put_Chg": -13.391694639645243
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 364.28167996458114,
                        "Call_Sim": 401.5117137020584,
                        "Call_Chg": 10.220122445108162,
                        "Put_Now": 120.52558460118917,
                        "Put_Sim": 104.95061833866589,
                        "Put_Chg": -12.922539487412374
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 333.8954789688637,
                        "Call_Sim": 369.48534998970445,
                        "Call_Chg": 10.65898559955032,
                        "Put_Now": 138.10837317343953,
                        "Put_Sim": 120.89324419427953,
                        "Put_Chg": -12.464942264971048
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 305.11298349880553,
                        "Call_Sim": 339.0126200071336,
                        "Call_Chg": 11.11051916558666,
                        "Put_Now": 157.2948672713485,
                        "Put_Sim": 138.3895037796765,
                        "Put_Chg": -12.019059375318628
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 277.9547381708808,
                        "Call_Sim": 310.12614934570365,
                        "Call_Chg": 11.574334507312686,
                        "Put_Now": 178.10561151139245,
                        "Put_Sim": 157.4720226862139,
                        "Put_Chg": -11.585030168383398
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 264.9877880725553,
                        "Call_Sim": 296.2847586770549,
                        "Call_Chg": 11.810721857088115,
                        "Put_Now": 189.12315619704987,
                        "Put_Sim": 167.61512680154874,
                        "Put_Chg": -11.372499184125095
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 252.4290759059054,
                        "Call_Sim": 282.846847323211,
                        "Call_Chg": 12.05002684740012,
                        "Put_Now": 200.54893881438466,
                        "Put_Sim": 178.16171023168954,
                        "Put_Chg": -11.162975339109279
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5227.695,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 969.4066643499909,
                        "Call_Sim": 918.1972390610799,
                        "Call_Chg": -5.28255345998143,
                        "Put_Now": 6.115725467083649,
                        "Put_Sim": 7.711300178172991,
                        "Put_Chg": 26.089704642190366
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 538.7337702792001,
                        "Call_Sim": 495.659407246254,
                        "Call_Chg": -7.99548226030508,
                        "Put_Now": 55.13272707596923,
                        "Put_Sim": 64.8633640430237,
                        "Put_Chg": 17.649475154106373
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 464.6785026068178,
                        "Call_Sim": 424.3995389984125,
                        "Call_Chg": -8.668135793337289,
                        "Put_Now": 77.01543853952307,
                        "Put_Sim": 89.54147493111782,
                        "Put_Chg": 16.264318725091183
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 429.72299530641703,
                        "Call_Sim": 390.9686412432734,
                        "Call_Chg": -9.018450137980064,
                        "Put_Now": 90.02892080709034,
                        "Put_Sim": 104.07956674394654,
                        "Put_Chg": 15.60681368930685
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 396.238955194091,
                        "Call_Sim": 359.0819404849517,
                        "Call_Chg": -9.377425975429029,
                        "Put_Now": 104.51387026273142,
                        "Put_Sim": 120.16185555359198,
                        "Put_Chg": 14.972161351908591
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 364.28167996458114,
                        "Call_Sim": 328.7841155109354,
                        "Call_Chg": -9.74453737478567,
                        "Put_Now": 120.52558460118917,
                        "Put_Sim": 137.83302014754418,
                        "Put_Chg": 14.359968137573542
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 333.8954789688637,
                        "Call_Sim": 300.1077822840589,
                        "Call_Chg": -10.119243539669363,
                        "Put_Now": 138.10837317343953,
                        "Put_Sim": 157.12567648863433,
                        "Put_Chg": 13.769840943179053
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 305.11298349880553,
                        "Call_Sim": 273.07308501316584,
                        "Call_Chg": -10.50099478502367,
                        "Put_Now": 157.2948672713485,
                        "Put_Sim": 178.05996878570977,
                        "Put_Chg": 13.201385318275843
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 277.9547381708808,
                        "Call_Sim": 247.68758516445132,
                        "Call_Chg": -10.889238012493186,
                        "Put_Now": 178.10561151139245,
                        "Put_Sim": 200.64345850496284,
                        "Put_Chg": 12.654203762765082
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 264.9877880725553,
                        "Call_Sim": 235.61224468946511,
                        "Call_Chg": -11.08562156647271,
                        "Put_Now": 189.12315619704987,
                        "Put_Sim": 212.55261281395997,
                        "Put_Chg": 12.38846531965586
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 252.4290759059054,
                        "Call_Sim": 223.94643894404362,
                        "Call_Chg": -11.283421634233159,
                        "Put_Now": 200.54893881438466,
                        "Put_Sim": 224.87130185252317,
                        "Put_Chg": 12.127894159863768
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
                        "Call_Now": 197.10703693420783,
                        "Call_Sim": 312.61148774108733,
                        "Call_Chg": 58.59986157948974,
                        "Put_Now": 4.47862410764634,
                        "Put_Sim": 0.483074914526334,
                        "Put_Chg": -89.21376514493409
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 78.30093778375203,
                        "Call_Sim": 170.4285348526564,
                        "Call_Chg": 117.658357200444,
                        "Put_Now": 35.31580693288015,
                        "Put_Sim": 7.943404001784529,
                        "Put_Chg": -77.50751096560965
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 50.99222995449554,
                        "Call_Sim": 128.6801718677316,
                        "Call_Chg": 152.35250935792223,
                        "Put_Now": 57.88819309551991,
                        "Put_Sim": 16.07613500875641,
                        "Put_Chg": -72.22899152815226
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 30.868099650174372,
                        "Call_Sim": 92.17529396153304,
                        "Call_Chg": 198.61019954628904,
                        "Put_Now": 87.64515678309499,
                        "Put_Sim": 29.45235109445366,
                        "Put_Chg": -66.39591715564774
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 17.268686551954033,
                        "Call_Sim": 62.15590538201377,
                        "Call_Chg": 259.9341802575051,
                        "Put_Now": 123.92683767677227,
                        "Put_Sim": 49.31405650683155,
                        "Put_Chg": -60.20712104713495
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 8.887479898547554,
                        "Call_Sim": 39.182200348928745,
                        "Call_Chg": 340.86963679470193,
                        "Put_Now": 165.42672501526067,
                        "Put_Sim": 76.22144546564277,
                        "Put_Chg": -53.924345985443814
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 4.193854223688675,
                        "Call_Sim": 22.95446782671229,
                        "Call_Chg": 447.3358539039263,
                        "Put_Now": 210.6141933322997,
                        "Put_Sim": 109.8748069353228,
                        "Put_Chg": -47.831242901105824
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 197.10703693420783,
                        "Call_Sim": 169.36257532451145,
                        "Call_Chg": -14.075835161053723,
                        "Put_Now": 4.47862410764634,
                        "Put_Sim": 7.2341624979501375,
                        "Put_Chg": 61.52644928604918
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 78.30093778375203,
                        "Call_Sim": 60.429352454735636,
                        "Call_Chg": -22.824228974592014,
                        "Put_Now": 35.31580693288015,
                        "Put_Sim": 47.9442216038633,
                        "Put_Chg": 35.7585335512345
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 50.99222995449554,
                        "Call_Sim": 37.55538016968194,
                        "Call_Chg": -26.35077892613126,
                        "Put_Now": 57.88819309551991,
                        "Put_Sim": 74.9513433107063,
                        "Put_Chg": 29.476045636855353
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 30.868099650174372,
                        "Call_Sim": 21.595161134203636,
                        "Call_Chg": -30.040522808531083,
                        "Put_Now": 87.64515678309499,
                        "Put_Sim": 108.87221826712448,
                        "Put_Chg": 24.21932056846268
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 17.268686551954033,
                        "Call_Sim": 11.430890006002983,
                        "Call_Chg": -33.80567785736128,
                        "Put_Now": 123.92683767677227,
                        "Put_Sim": 148.58904113082008,
                        "Put_Chg": 19.900615489255134
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 8.887479898547554,
                        "Call_Sim": 5.548438703002773,
                        "Call_Chg": -37.5701687504291,
                        "Put_Now": 165.42672501526067,
                        "Put_Sim": 192.5876838197155,
                        "Put_Chg": 16.41872484748109
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 4.193854223688675,
                        "Call_Sim": 2.462919127857731,
                        "Call_Chg": -41.27313453228501,
                        "Put_Now": 210.6141933322997,
                        "Put_Sim": 239.38325823646755,
                        "Put_Chg": 13.659604060385922
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 197.10703693420783,
                        "Call_Sim": 58.702799527457955,
                        "Call_Chg": -70.21780630437243,
                        "Put_Now": 4.47862410764634,
                        "Put_Sim": 46.57438670089641,
                        "Put_Chg": 939.9262269271521
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 78.30093778375203,
                        "Call_Sim": 10.455077655444143,
                        "Call_Chg": -86.64757032116461,
                        "Put_Now": 35.31580693288015,
                        "Put_Sim": 147.96994680457192,
                        "Put_Chg": 318.99070035635276
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 50.99222995449554,
                        "Call_Sim": 4.921729409711702,
                        "Call_Chg": -90.34807966997373,
                        "Put_Now": 57.88819309551991,
                        "Put_Sim": 192.31769255073596,
                        "Put_Chg": 232.22265589357258
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 30.868099650174372,
                        "Call_Sim": 2.1070089579238527,
                        "Call_Chg": -93.17415395893362,
                        "Put_Now": 87.64515678309499,
                        "Put_Sim": 239.3840660908454,
                        "Put_Chg": 173.12868717124348
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 17.268686551954033,
                        "Call_Sim": 0.8188447526047611,
                        "Call_Chg": -95.25821057588132,
                        "Put_Now": 123.92683767677227,
                        "Put_Sim": 287.9769958774232,
                        "Put_Chg": 132.3766193635384
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 8.887479898547554,
                        "Call_Sim": 0.28862230729014726,
                        "Call_Chg": -96.75248427467818,
                        "Put_Now": 165.42672501526067,
                        "Put_Sim": 337.32786742400367,
                        "Put_Chg": 103.91376749608328
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 4.193854223688675,
                        "Call_Sim": 0.09224840041141924,
                        "Call_Chg": -97.80039086980274,
                        "Put_Now": 210.6141933322997,
                        "Put_Sim": 387.0125875090216,
                        "Put_Chg": 83.75427666377959
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5333.305,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 197.10703693420783,
                        "Call_Sim": 247.22712251454413,
                        "Call_Chg": 25.427851973172245,
                        "Put_Now": 4.47862410764634,
                        "Put_Sim": 1.793709687981675,
                        "Put_Chg": -59.94953707056414
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 78.30093778375203,
                        "Call_Sim": 115.17930423724692,
                        "Call_Chg": 47.098243644723496,
                        "Put_Now": 35.31580693288015,
                        "Put_Sim": 19.38917338637407,
                        "Put_Chg": -45.09774780674167
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 50.99222995449554,
                        "Call_Sim": 80.63751665413292,
                        "Call_Chg": 58.13687051162941,
                        "Put_Now": 57.88819309551991,
                        "Put_Sim": 34.72847979515723,
                        "Put_Chg": -40.007663155330135
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 30.868099650174372,
                        "Call_Sim": 52.93577826753153,
                        "Call_Chg": 71.49024030454852,
                        "Put_Now": 87.64515678309499,
                        "Put_Sim": 56.90783540045231,
                        "Put_Chg": -35.07018814366625
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 17.268686551954033,
                        "Call_Sim": 32.360755841240234,
                        "Call_Chg": 87.39558300442057,
                        "Put_Now": 123.92683767677227,
                        "Put_Sim": 86.21390696605795,
                        "Put_Chg": -30.43160901844177
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 8.887479898547554,
                        "Call_Sim": 18.31722341074601,
                        "Call_Chg": 106.1014328003096,
                        "Put_Now": 165.42672501526067,
                        "Put_Sim": 122.05146852745929,
                        "Put_Chg": -26.220223173613572
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 4.193854223688675,
                        "Call_Sim": 9.55691229791671,
                        "Call_Chg": 127.8789816759772,
                        "Put_Now": 210.6141933322997,
                        "Put_Sim": 163.1722514065268,
                        "Put_Chg": -22.525519849899503
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5227.695,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 197.10703693420783,
                        "Call_Sim": 149.86909952471706,
                        "Call_Chg": -23.965627074622546,
                        "Put_Now": 4.47862410764634,
                        "Put_Sim": 10.045686698155123,
                        "Put_Chg": 124.30296574798845
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 78.30093778375203,
                        "Call_Sim": 49.07483213636442,
                        "Call_Chg": -37.32535838600419,
                        "Put_Now": 35.31580693288015,
                        "Put_Sim": 58.89470128549192,
                        "Put_Chg": 66.76583773782913
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 50.99222995449554,
                        "Call_Sim": 29.407687657691667,
                        "Call_Chg": -42.329080952265656,
                        "Put_Now": 57.88819309551991,
                        "Put_Sim": 89.10865079871655,
                        "Put_Chg": 53.93234100722495
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 30.868099650174372,
                        "Call_Sim": 16.253658744570657,
                        "Call_Chg": -47.34480279391335,
                        "Put_Now": 87.64515678309499,
                        "Put_Sim": 125.83571587749248,
                        "Put_Chg": 43.57406672100755
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 17.268686551954033,
                        "Call_Sim": 8.247792089184372,
                        "Call_Chg": -52.23845157898766,
                        "Put_Now": 123.92683767677227,
                        "Put_Sim": 167.71094321400233,
                        "Put_Chg": 35.33060825083618
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 8.887479898547554,
                        "Call_Sim": 3.829698379627189,
                        "Call_Chg": -56.909062823837594,
                        "Put_Now": 165.42672501526067,
                        "Put_Sim": 213.17394349634105,
                        "Put_Chg": 28.863062166452053
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 4.193854223688675,
                        "Call_Sim": 1.6234731324920233,
                        "Call_Chg": -61.28923310395589,
                        "Put_Now": 210.6141933322997,
                        "Put_Sim": 260.8488122411027,
                        "Put_Chg": 23.851487933457822
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.00010160513654922261,
            -0.11362766974527849,
            -0.15537416607359777,
            -0.001637531739022507,
            -0.0023867168561026338,
            0.11586778165237488,
            0.17016211277567597,
            0.34055848510917663,
            0.6100690388456289,
            0.010208371278894804,
            0.3393904278315203,
            0.5480230094181477,
            0.2223280100216476,
            0.005802675388753226,
            0.19905740050625798,
            0.040997858272342355
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
            5425.0,
            5450.0,
            5500.0,
            5600.0,
            5800.0,
            6000.0,
            6200.0
        ],
        "delta_values": [
            -0.29378323572124443,
            -1203.7553123103507,
            -1133.4862608478256,
            -52.2315313555747,
            -540.4840949047343,
            -1465.661050296639,
            768.666560945409,
            928.633791204838,
            1086.705850573529,
            59.4027313435386,
            420.536066820158,
            619.7911008331013,
            600.7354992620913,
            45.08105169610333,
            -5293.530957638756,
            146.34651560564976
        ],
        "delta_cumulative": [
            -0.29378323572124443,
            -1204.049095546072,
            -2337.535356393898,
            -2389.7668877494725,
            -2930.250982654207,
            -4395.912032950846,
            -3627.245472005437,
            -2698.611680800599,
            -1611.90583022707,
            -1552.5030988835315,
            -1131.9670320633736,
            -512.1759312302723,
            88.55956803181891,
            133.64061972792223,
            -5159.890337910834,
            -5013.543822305184
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
            5425.0,
            5450.0,
            5500.0,
            5600.0,
            5800.0,
            6000.0,
            6200.0
        ],
        "gamma_values": [
            3729.848305596834,
            14806510.456032215,
            26258546.504769288,
            436626.76052897313,
            5646959.71369019,
            28966005.823832072,
            12248780.883246865,
            19261489.822761137,
            28192458.395775277,
            523331.1957033593,
            13221207.267255433,
            18493729.803208087,
            8332283.669509523,
            193362.6781503681,
            15432520.071856018,
            1065285.2252969013
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            168730.2821779984,
            44876.42979472845,
            12248780.883246865,
            19261489.822761137,
            28192458.395775277,
            523331.1957033593,
            13221207.267255433,
            18493729.803208087,
            8332283.669509523,
            193362.6781503681,
            6561660.210437556,
            1065285.2252969013
        ],
        "gamma_put": [
            3729.848305596834,
            14806510.456032215,
            26258546.504769288,
            436626.76052897313,
            5478229.431512191,
            28921129.394037344,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            8870859.861418463,
            0.0
        ],
        "gamma_exposure": [
            3729.848305596834,
            14810240.30433781,
            41068786.809107095,
            41505413.56963607,
            47152373.28332626,
            76118379.10715833,
            88367159.9904052,
            107628649.81316634,
            135821108.2089416,
            136344439.40464497,
            149565646.6719004,
            168059376.47510847,
            176391660.144618,
            176585022.82276836,
            192017542.89462438,
            193082828.1199213
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
            5300.0,
            5350.0,
            5400.0,
            5425.0,
            5450.0,
            5500.0,
            5600.0,
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
            1585.0,
            2700.0,
            4875.0,
            150.0,
            3200.0,
            7170.0,
            3700.0,
            120.0,
            5200.0,
            1000.0
        ],
        "put_oi": [
            15.0,
            8900.0,
            9480.0,
            200.0,
            2040.0,
            4000.0,
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
            9480.0,
            200.0,
            2160.0,
            4020.0,
            1585.0,
            2700.0,
            4875.0,
            150.0,
            3200.0,
            7170.0,
            3700.0,
            120.0,
            12230.0,
            1000.0
        ]
    },
    "oi_data_nearest": {
        "strikes": [
            5100.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0,
            5450.0,
            5500.0
        ],
        "call_oi": [
            0.0,
            0.0,
            1585.0,
            2700.0,
            4875.0,
            3200.0,
            6930.0
        ],
        "put_oi": [
            4630.0,
            3935.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_oi": [
            4630.0,
            3935.0,
            1585.0,
            2700.0,
            4875.0,
            3200.0,
            6930.0
        ]
    },
    "gex_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 12,
            "abs_call": 91014680.08870694,
            "abs_put": 41268876.972645,
            "net": 132283557.06135194
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 34,
            "abs_call": 7363304.997074887,
            "abs_put": 13810079.30928298,
            "net": 21173384.306357868
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 55,
            "abs_call": 523331.1957033593,
            "abs_put": 0.0,
            "net": 523331.1957033593
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 77,
            "abs_call": 0.0,
            "abs_put": 20257858.562609773,
            "net": 20257858.562609773
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 100,
            "abs_call": 0.0,
            "abs_put": 436626.76052897313,
            "net": 436626.76052897313
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 121,
            "abs_call": 44876.42979472845,
            "abs_put": 0.0,
            "net": 44876.42979472845
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 143,
            "abs_call": 6561660.210437556,
            "abs_put": 8870859.861418463,
            "net": 15432520.071856018
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 165,
            "abs_call": 0.0,
            "abs_put": 30611.173240229702,
            "net": 30611.173240229702
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 186,
            "abs_call": 968978.6724346352,
            "abs_put": 0.0,
            "net": 968978.6724346352
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 209,
            "abs_call": 1065285.2252969013,
            "abs_put": 0.0,
            "net": 1065285.2252969013
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 230,
            "abs_call": 0.0,
            "abs_put": 100719.61687865133,
            "net": 100719.61687865133
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 250,
            "abs_call": 765079.043868219,
            "abs_put": 0.0,
            "net": 765079.043868219
        }
    ],
    "oi_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 12,
            "call_oi": 19290.0,
            "put_oi": 8565.0,
            "total_oi": 27855.0
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 34,
            "call_oi": 3200.0,
            "put_oi": 4850.0,
            "total_oi": 8050.0
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 55,
            "call_oi": 150.0,
            "put_oi": 0.0,
            "total_oi": 150.0
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 77,
            "call_oi": 0.0,
            "put_oi": 10925.0,
            "total_oi": 10925.0
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 100,
            "call_oi": 0.0,
            "put_oi": 200.0,
            "total_oi": 200.0
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 121,
            "call_oi": 20.0,
            "put_oi": 0.0,
            "total_oi": 20.0
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 143,
            "call_oi": 5200.0,
            "put_oi": 7030.0,
            "total_oi": 12230.0
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 165,
            "call_oi": 0.0,
            "put_oi": 30.0,
            "total_oi": 30.0
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 186,
            "call_oi": 500.0,
            "put_oi": 0.0,
            "total_oi": 500.0
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 209,
            "call_oi": 1000.0,
            "put_oi": 0.0,
            "total_oi": 1000.0
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 230,
            "call_oi": 0.0,
            "put_oi": 65.0,
            "total_oi": 65.0
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 250,
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
            5300.0,
            5350.0,
            5400.0,
            5425.0,
            5450.0,
            5500.0,
            5600.0,
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
            725.0,
            3800.0,
            4200.0,
            150.0,
            5700.0,
            5790.0,
            600.0,
            120.0,
            30.0,
            500.0
        ],
        "put_volume": [
            15.0,
            160.0,
            305.0,
            200.0,
            95.0,
            95.0,
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
            305.0,
            200.0,
            215.0,
            115.0,
            725.0,
            3800.0,
            4200.0,
            150.0,
            5700.0,
            5790.0,
            600.0,
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
            5300.0,
            5350.0,
            5400.0,
            5425.0,
            5450.0,
            5500.0,
            5600.0,
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
            0.0,
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
                "strike": 5500.0,
                "type": "CALL",
                "oi": 6930,
                "volume": 5550,
                "expiry": "2026-04-01 00:00:00",
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
                "strike": 5400.0,
                "type": "CALL",
                "oi": 4875,
                "volume": 4200,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5100.0,
                "type": "PUT",
                "oi": 4850,
                "volume": 5,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5100.0,
                "type": "PUT",
                "oi": 4630,
                "volume": 300,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5250.0,
                "type": "PUT",
                "oi": 3935,
                "volume": 75,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5600.0,
                "type": "CALL",
                "oi": 3200,
                "volume": 100,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5450.0,
                "type": "CALL",
                "oi": 3200,
                "volume": 5700,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5350.0,
                "type": "CALL",
                "oi": 2700,
                "volume": 3800,
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
                "oi": 1585,
                "volume": 725,
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
                "strike": 5600.0,
                "type": "CALL",
                "oi": 500,
                "volume": 500,
                "expiry": "2026-12-01 00:00:00",
                "iv": 0.0
            }
        ],
        "top_vol": [
            {
                "strike": 5450.0,
                "type": "CALL",
                "oi": 3200,
                "volume": 5700,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5500.0,
                "type": "CALL",
                "oi": 6930,
                "volume": 5550,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5400.0,
                "type": "CALL",
                "oi": 4875,
                "volume": 4200,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5350.0,
                "type": "CALL",
                "oi": 2700,
                "volume": 3800,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5300.0,
                "type": "CALL",
                "oi": 1585,
                "volume": 725,
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
                "strike": 5600.0,
                "type": "CALL",
                "oi": 500,
                "volume": 500,
                "expiry": "2026-12-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5100.0,
                "type": "PUT",
                "oi": 4630,
                "volume": 300,
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
                "strike": 5600.0,
                "type": "CALL",
                "oi": 3200,
                "volume": 100,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            }
        ]
    },
    "fed_watch": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 15,
            "iv_atm": 0.0,
            "spot": 5280.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 45,
            "iv_atm": 0.0,
            "spot": 5280.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 76,
            "iv_atm": 0.0,
            "spot": 5280.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 105,
            "iv_atm": 0.0,
            "spot": 5280.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 139,
            "iv_atm": 0.0,
            "spot": 5280.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 168,
            "iv_atm": 0.0,
            "spot": 5280.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 198,
            "iv_atm": 0.0,
            "spot": 5280.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 230,
            "iv_atm": 0.0,
            "spot": 5280.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 259,
            "iv_atm": 0.0,
            "spot": 5280.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 290,
            "iv_atm": 0.0,
            "spot": 5280.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 321,
            "iv_atm": 0.0,
            "spot": 5280.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 349,
            "iv_atm": 0.0,
            "spot": 5280.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5280.5,
                    "lower": 5280.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5280.5,
                    "lower": 5280.5,
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
            5425.0,
            5450.0,
            5500.0,
            5600.0,
            5800.0,
            6000.0,
            6200.0
        ],
        "charm": [
            -0.6985641711004731,
            -1801.3691300724342,
            -11158.28262248999,
            -2.6539245625922803,
            44.45654488563698,
            -1870.0066773777214,
            1650.8281976200046,
            6406.456587210744,
            14886.00219741006,
            94.56849612934793,
            9530.491275296932,
            16524.49902850278,
            3757.943488178701,
            29.30877006931975,
            4353.366138468626,
            266.8974536458903
        ],
        "vanna": [
            -11.784903365120003,
            -16953.82285010189,
            -17206.455479421864,
            -312.428378453915,
            -2831.242870033102,
            -3946.6417913415657,
            341.37089094666203,
            3614.101013856217,
            9722.038753478688,
            156.8499902232323,
            6598.968786161299,
            11761.469582470194,
            7025.275583519958,
            168.26194961796523,
            26942.22090779586,
            2247.4239725987195
        ],
        "vex": [
            3048.576459977481,
            5647619.397649677,
            3065910.7948009754,
            216287.9518893946,
            2310224.8676589453,
            1854832.805547819,
            728108.4816248602,
            1144967.3434737579,
            1675853.970405805,
            142580.88026431933,
            785912.7565728133,
            1574433.4466880397,
            2132938.1173499636,
            239460.916105577,
            10931880.26622449,
            1102895.0009655189
        ],
        "theta": [
            -0.7730067555031859,
            -3030.6606448975035,
            -6476.179809455718,
            -70.54054279156416,
            -1047.7881357565354,
            -6914.257416604058,
            -4375.24401219973,
            -6595.374258949859,
            -9375.439017941595,
            -213.08435287377853,
            -4305.5807954005695,
            -6044.900372102961,
            -3044.170466596788,
            -100.22834291281954,
            1877.2596910876878,
            -457.09308066752806
        ],
        "charm_cum": [
            -0.6985641711004731,
            -1802.0676942435348,
            -12960.350316733526,
            -12963.004241296117,
            -12918.54769641048,
            -14788.554373788202,
            -13137.726176168197,
            -6731.2695889574525,
            8154.732608452608,
            8249.301104581955,
            17779.792379878887,
            34304.29140838167,
            38062.234896560374,
            38091.543666629696,
            42444.90980509832,
            42711.807258744215
        ],
        "vanna_cum": [
            -11.784903365120003,
            -16965.607753467008,
            -34172.063232888875,
            -34484.49161134279,
            -37315.73448137589,
            -41262.376272717454,
            -40921.005381770796,
            -37306.904367914576,
            -27584.86561443589,
            -27428.015624212658,
            -20829.04683805136,
            -9067.577255581165,
            -2042.3016720612077,
            -1874.0397224432425,
            25068.18118535262,
            27315.60515795134
        ],
        "theta_cum": [
            -0.7730067555031859,
            -3031.4336516530066,
            -9507.613461108725,
            -9578.15400390029,
            -10625.942139656825,
            -17540.199556260883,
            -21915.443568460614,
            -28510.817827410472,
            -37886.256845352065,
            -38099.34119822584,
            -42404.92199362641,
            -48449.82236572937,
            -51493.992832326156,
            -51594.22117523898,
            -49716.96148415129,
            -50174.05456481882
        ],
        "r_gamma": [
            3729.848305596834,
            14806510.456032215,
            26258546.504769288,
            436626.76052897313,
            5646959.71369019,
            28966005.823832072,
            -12248780.883246865,
            -19261489.822761137,
            -28192458.395775277,
            -523331.1957033593,
            -13221207.267255433,
            -18493729.803208087,
            -8332283.669509523,
            -193362.6781503681,
            -15432520.07185602,
            -1065285.2252969013
        ],
        "r_gamma_cum": [
            3729.848305596834,
            14810240.30433781,
            41068786.809107095,
            41505413.56963607,
            47152373.28332626,
            76118379.10715833,
            63869598.223911464,
            44608108.40115033,
            16415650.005375054,
            15892318.809671694,
            2671111.5424162615,
            -15822618.260791825,
            -24154901.930301346,
            -24348264.608451713,
            -39780784.68030773,
            -40846069.90560463
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.29378323572124443,
            "gamma": 3729.848305596834,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -1203.7553123103507,
            "gamma": 14806510.456032215,
            "volume": 160,
            "oi": 8900,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -1133.4862608478256,
            "gamma": 26258546.504769288,
            "volume": 305,
            "oi": 9480,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -52.2315313555747,
            "gamma": 436626.76052897313,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -540.4840949047343,
            "gamma": 5646959.71369019,
            "volume": 215,
            "oi": 2160,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -1465.661050296639,
            "gamma": 28966005.823832072,
            "volume": 115,
            "oi": 4020,
            "iv": 11.82
        },
        {
            "strike": 5300.0,
            "delta": 768.666560945409,
            "gamma": 12248780.883246865,
            "volume": 725,
            "oi": 1585,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": 928.633791204838,
            "gamma": 19261489.822761137,
            "volume": 3800,
            "oi": 2700,
            "iv": 11.82
        },
        {
            "strike": 5400.0,
            "delta": 1086.705850573529,
            "gamma": 28192458.395775277,
            "volume": 4200,
            "oi": 4875,
            "iv": 11.82
        },
        {
            "strike": 5425.0,
            "delta": 59.4027313435386,
            "gamma": 523331.1957033593,
            "volume": 150,
            "oi": 150,
            "iv": 11.82
        },
        {
            "strike": 5450.0,
            "delta": 420.536066820158,
            "gamma": 13221207.267255433,
            "volume": 5700,
            "oi": 3200,
            "iv": 11.82
        },
        {
            "strike": 5500.0,
            "delta": 619.7911008331013,
            "gamma": 18493729.803208087,
            "volume": 5790,
            "oi": 7170,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 600.7354992620913,
            "gamma": 8332283.669509523,
            "volume": 600,
            "oi": 3700,
            "iv": 11.82
        },
        {
            "strike": 5800.0,
            "delta": 45.08105169610333,
            "gamma": 193362.6781503681,
            "volume": 120,
            "oi": 120,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5293.530957638756,
            "gamma": 15432520.071856018,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 146.34651560564976,
            "gamma": 1065285.2252969013,
            "volume": 500,
            "oi": 1000,
            "iv": 11.82
        }
    ]
};