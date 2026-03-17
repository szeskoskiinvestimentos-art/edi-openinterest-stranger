window.marketData = {
    "last_updated": "2026-03-16 21:58:18",
    "spot_price": 5253.0,
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-03-16",
        "meetings": [
            {
                "date": "2026-03-18",
                "days_remaining": 1,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 1.7,
                    "3.50-3.75": 99.7,
                    "3.75-4.00": 0.3
                }
            },
            {
                "date": "2026-04-29",
                "days_remaining": 43,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.1,
                    "3.25-3.50": 4.3,
                    "3.50-3.75": 95.5,
                    "3.75-4.00": 0.3
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 92,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.9,
                    "3.25-3.50": 22.6,
                    "3.50-3.75": 76.3,
                    "3.75-4.00": 0.2
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 134,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.2,
                    "3.00-3.25": 5.2,
                    "3.25-3.50": 33.3,
                    "3.50-3.75": 61.2,
                    "3.75-4.00": 0.2
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
                    "3.00-3.25": 10.9,
                    "3.25-3.50": 38.9,
                    "3.50-3.75": 48.8,
                    "3.75-4.00": 0.1
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
                    "2.75-3.00": 2.5,
                    "3.00-3.25": 14.7,
                    "3.25-3.50": 40.3,
                    "3.50-3.75": 42.1,
                    "3.75-4.00": 0.1
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 267,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.1,
                    "2.50-2.75": 0.8,
                    "2.75-3.00": 5.7,
                    "3.00-3.25": 21.4,
                    "3.25-3.50": 40.8,
                    "3.50-3.75": 31.2,
                    "3.75-4.00": 0.1
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 16/03/2026 21:58\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(2);\n  spot(5253.00);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5598.45;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (5598.45)\n  // 2 = Spline (4969.11)\n  // 3 = HVL (4500.00)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (5598.45)\n  // 7 = HVL Gaussian (5669.66)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 5598.45;\n  if (ModeloFlip = 2) then GammaVal := 4969.11;\n  if (ModeloFlip = 3) then GammaVal := 4500.00;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 5598.45;\n  if (ModeloFlip = 7) then GammaVal := 5669.66;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5051.58 <= LimitUpper) and (5051.58 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5051.58, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirRange) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5213.89 <= LimitUpper) and (5213.89 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5213.89, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5292.11 <= LimitUpper) and (5292.11 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5292.11, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirMaxPain) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirRange) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5425.00 <= LimitUpper) and (5425.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5425.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5450.00 <= LimitUpper) and (5450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5500.00 <= LimitUpper) and (5500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5710.19 <= LimitUpper) and (5710.19 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5710.19, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5800.00 <= LimitUpper) and (5800.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5800.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5346.76 > 0) then\n      HorizontalLineCustom(5346.76, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5275.00 <= LimitUpper) and (5275.00 >= LimitLower) then\n      HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5412.50 <= LimitUpper) and (5412.50 >= LimitLower) then\n      HorizontalLineCustom(5412.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5437.50 <= LimitUpper) and (5437.50 >= LimitLower) then\n      HorizontalLineCustom(5437.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5475.00 <= LimitUpper) and (5475.00 >= LimitLower) then\n      HorizontalLineCustom(5475.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5550.00 <= LimitUpper) and (5550.00 >= LimitLower) then\n      HorizontalLineCustom(5550.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5700.00 <= LimitUpper) and (5700.00 >= LimitLower) then\n      HorizontalLineCustom(5700.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5900.00 <= LimitUpper) and (5900.00 >= LimitLower) then\n      HorizontalLineCustom(5900.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5409.55 <= LimitUpper) and (5409.55 >= LimitLower) then\n      HorizontalLineCustom(5409.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5415.45 <= LimitUpper) and (5415.45 >= LimitLower) then\n      HorizontalLineCustom(5415.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5434.55 <= LimitUpper) and (5434.55 >= LimitLower) then\n      HorizontalLineCustom(5434.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5440.45 <= LimitUpper) and (5440.45 >= LimitLower) then\n      HorizontalLineCustom(5440.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5469.10 <= LimitUpper) and (5469.10 >= LimitLower) then\n      HorizontalLineCustom(5469.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5480.90 <= LimitUpper) and (5480.90 >= LimitLower) then\n      HorizontalLineCustom(5480.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5538.20 <= LimitUpper) and (5538.20 >= LimitLower) then\n      HorizontalLineCustom(5538.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5676.40 <= LimitUpper) and (5676.40 >= LimitLower) then\n      HorizontalLineCustom(5676.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5723.60 <= LimitUpper) and (5723.60 >= LimitLower) then\n      HorizontalLineCustom(5723.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5876.40 <= LimitUpper) and (5876.40 >= LimitLower) then\n      HorizontalLineCustom(5876.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5923.60 <= LimitUpper) and (5923.60 >= LimitLower) then\n      HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5261.80 <= LimitUpper) and (5261.80 >= LimitLower) then\n      HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5405.90 <= LimitUpper) and (5405.90 >= LimitLower) then\n      HorizontalLineCustom(5405.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5419.10 <= LimitUpper) and (5419.10 >= LimitLower) then\n      HorizontalLineCustom(5419.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5430.90 <= LimitUpper) and (5430.90 >= LimitLower) then\n      HorizontalLineCustom(5430.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5444.10 <= LimitUpper) and (5444.10 >= LimitLower) then\n      HorizontalLineCustom(5444.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5461.80 <= LimitUpper) and (5461.80 >= LimitLower) then\n      HorizontalLineCustom(5461.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5488.20 <= LimitUpper) and (5488.20 >= LimitLower) then\n      HorizontalLineCustom(5488.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5523.60 <= LimitUpper) and (5523.60 >= LimitLower) then\n      HorizontalLineCustom(5523.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5576.40 <= LimitUpper) and (5576.40 >= LimitLower) then\n      HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5647.20 <= LimitUpper) and (5647.20 >= LimitLower) then\n      HorizontalLineCustom(5647.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5752.80 <= LimitUpper) and (5752.80 >= LimitLower) then\n      HorizontalLineCustom(5752.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5847.20 <= LimitUpper) and (5847.20 >= LimitLower) then\n      HorizontalLineCustom(5847.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5952.80 <= LimitUpper) and (5952.80 >= LimitLower) then\n      HorizontalLineCustom(5952.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5260.88, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5245.12, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5268.76, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5237.24, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5283.39, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5222.61, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5291.27, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5214.73, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 61505,
        "total_volume": 23810,
        "gamma_exposure": 184902548.82554358,
        "delta_position": -6987.877238145878,
        "last_update": "2026-03-16T21:58:18.021398",
        "spot_price": 5253.0,
        "dealer_pressure": 0.13811215401282012,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 5669.660133332738,
        "call_wall": 5400.0,
        "put_wall": 5100.0,
        "effective_call_wall": 5710.18593371059,
        "effective_put_wall": 5051.5778019586505,
        "max_pain": 5400.0,
        "zero_gamma": 5598.445533501098,
        "range_low": 5213.886686678666,
        "range_high": 5292.113313321334,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5292.113313321334,
                "sigma_1_down": 5213.886686678666,
                "sigma_2_up": 5331.226626642669,
                "sigma_2_down": 5174.773373357331
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5340.460027411751,
                "sigma_1_down": 5165.539972588249,
                "sigma_2_up": 5427.920054823502,
                "sigma_2_down": 5078.079945176498
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 209,
                "sigma_1_up": 5818.454611180532,
                "sigma_1_down": 4687.545388819468,
                "sigma_2_up": 6383.909222361065,
                "sigma_2_down": 4122.090777638935
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
                5449.957684350119,
                5423.676948617341,
                5407.901961182167,
                5399.356912720008,
                5397.225259962381,
                5395.594705681805,
                5394.317973980911,
                5393.298355688067,
                5392.470217027193,
                5391.787730945842,
                5391.218100055206,
                5390.737338480782,
                5390.327566081689,
                5389.97522589776,
                5389.669881595293,
                5389.403388749365,
                5389.16931269782,
                5388.9625124470385,
                5388.7788385363265
            ]
        },
        "gamma_flip_cone_nearest_expiry": "2026-04-01",
        "delta_flip_profile": {
            "spots": [
                4465.05,
                4497.211224489796,
                4529.372448979592,
                4561.533673469388,
                4593.694897959183,
                4625.8561224489795,
                4658.0173469387755,
                4690.178571428572,
                4722.339795918368,
                4754.501020408164,
                4786.66224489796,
                4818.823469387755,
                4850.984693877551,
                4883.145918367347,
                4915.307142857143,
                4947.468367346939,
                4979.629591836735,
                5011.790816326531,
                5043.952040816326,
                5076.113265306122,
                5108.274489795918,
                5140.435714285714,
                5172.59693877551,
                5204.758163265306,
                5236.919387755102,
                5269.080612244898,
                5301.241836734694,
                5333.40306122449,
                5365.564285714286,
                5397.725510204082,
                5429.886734693878,
                5462.047959183674,
                5494.209183673469,
                5526.370408163265,
                5558.531632653061,
                5590.692857142857,
                5622.854081632653,
                5655.015306122449,
                5687.176530612245,
                5719.33775510204,
                5751.498979591837,
                5783.660204081632,
                5815.821428571428,
                5847.9826530612245,
                5880.1438775510205,
                5912.305102040817,
                5944.466326530612,
                5976.627551020409,
                6008.788775510204,
                6040.95
            ],
            "deltas": [
                -30852.722712839037,
                -30671.140724686207,
                -30458.761257039514,
                -30212.46612969409,
                -29929.111506194065,
                -29605.535225548905,
                -29238.526556397184,
                -28824.71856063177,
                -28360.354053210613,
                -27840.89187846627,
                -27260.4786864374,
                -26611.41365424895,
                -25883.8456318417,
                -25065.992637153744,
                -24145.084396287304,
                -23108.973999705377,
                -21948.02243507517,
                -20656.603313486346,
                -19233.5869041417,
                -17681.50997428092,
                -16004.700755307866,
                -14207.144090759235,
                -12291.080173410011,
                -10257.120890822647,
                -8106.13164603855,
                -5842.487611207326,
                -3477.8041719655753,
                -1034.0098630453283,
                1455.2808553254313,
                3945.763967602662,
                6385.909997837043,
                8722.359406678195,
                10906.180906730493,
                12898.661091288426,
                14675.398757790743,
                16227.928447843155,
                17562.74646713699,
                18698.241273223957,
                19660.4431564779,
                20478.608912411004,
                21181.472264586086,
                21794.63763583425,
                22339.218294529142,
                22831.532716356312,
                23283.5255937287,
                23703.563127084013,
                24097.32133721734,
                24468.588951899095,
                24819.902888239958,
                25153.003768025024
            ],
            "flip_value": 5346.762297686766
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                0.0,
                120.0,
                20.0,
                25.0,
                100.0,
                3905.0,
                150.0,
                5700.0,
                9740.0,
                2500.0,
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
                4465.05,
                4497.211224489796,
                4529.372448979592,
                4561.533673469388,
                4593.694897959183,
                4625.8561224489795,
                4658.0173469387755,
                4690.178571428572,
                4722.339795918368,
                4754.501020408164,
                4786.66224489796,
                4818.823469387755,
                4850.984693877551,
                4883.145918367347,
                4915.307142857143,
                4947.468367346939,
                4979.629591836735,
                5011.790816326531,
                5043.952040816326,
                5076.113265306122,
                5108.274489795918,
                5140.435714285714,
                5172.59693877551,
                5204.758163265306,
                5236.919387755102,
                5269.080612244898,
                5301.241836734694,
                5333.40306122449,
                5365.564285714286,
                5397.725510204082,
                5429.886734693878,
                5462.047959183674,
                5494.209183673469,
                5526.370408163265,
                5558.531632653061,
                5590.692857142857,
                5622.854081632653,
                5655.015306122449,
                5687.176530612245,
                5719.33775510204,
                5751.498979591837,
                5783.660204081632,
                5815.821428571428,
                5847.9826530612245,
                5880.1438775510205,
                5912.305102040817,
                5944.466326530612,
                5976.627551020409,
                6008.788775510204,
                6040.95
            ],
            "pnl": [
                -7378082.262686312,
                -6688994.332686178,
                -6024979.547660947,
                -5387440.916596238,
                -4777749.327998683,
                -4197233.781592231,
                -3647171.9879549798,
                -3128781.4599326197,
                -2643211.207885487,
                -2191534.1371546946,
                -1774740.2310094368,
                -1393730.586226061,
                -1049312.3518016692,
                -742194.6045602281,
                -472985.17897314765,
                -242188.45275659487,
                -50204.07503900118,
                102673.38961856999,
                216253.94011843018,
                290450.78984816,
                325278.24777806364,
                320848.8945847042,
                277370.12402169406,
                195140.12335529365,
                74543.36869217828,
                -83954.28842973895,
                -279810.86759578064,
                -512413.76556782797,
                -781085.4511331841,
                -1085089.2818145398,
                -1423635.3799326979,
                -1795886.510433739,
                -2200963.9081519153,
                -2637953.007638477,
                -3105909.034218766,
                -3603862.4204347674,
                -4130824.017393261,
                -4685790.075695837,
                -5267746.975511812,
                -5875675.689925436,
                -6508555.969910264,
                -7165370.243137233,
                -7845107.222300455,
                -8546765.221743606,
                -9269355.183902826,
                -10011903.419457428,
                -10773454.067120414,
                -11553071.280727502,
                -12349841.1527175,
                -13162873.384269692
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
                        "Call_Now": 942.6954829994638,
                        "Call_Sim": 1086.3490138379539,
                        "Call_Chg": 15.238593313443483,
                        "Put_Now": 6.904544116555712,
                        "Put_Sim": 3.5580749550456545,
                        "Put_Chg": -48.467633851247264
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 516.1374579159055,
                        "Call_Sim": 640.6447896828768,
                        "Call_Chg": 24.122901730425706,
                        "Put_Now": 60.03641471267497,
                        "Put_Sim": 37.543746479646074,
                        "Put_Chg": -37.46504240913675
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 443.51177734884914,
                        "Call_Sim": 561.0508453170842,
                        "Call_Chg": 26.501904565159577,
                        "Put_Now": 83.3487132815535,
                        "Put_Sim": 53.88778124979012,
                        "Put_Chg": -35.34659489252558
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 409.33837413486253,
                        "Call_Sim": 523.013327106305,
                        "Call_Chg": 27.770412000021928,
                        "Put_Now": 97.14429963553562,
                        "Put_Sim": 63.819252606978466,
                        "Put_Chg": -34.30468607379487
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 376.67542561401933,
                        "Call_Sim": 486.2567149132251,
                        "Call_Chg": 29.091701196216103,
                        "Put_Now": 112.45034068266,
                        "Put_Sim": 75.03162998186622,
                        "Put_Chg": -33.27576463853595
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 345.5728958021814,
                        "Call_Sim": 450.85414037235887,
                        "Call_Chg": 30.465712400790924,
                        "Put_Now": 129.3168004387892,
                        "Put_Sim": 87.59804500896735,
                        "Put_Chg": -32.260893625781435
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 316.06917110430277,
                        "Call_Sim": 416.87085265907353,
                        "Call_Chg": 31.89228522433345,
                        "Put_Now": 147.7820653088786,
                        "Put_Sim": 101.58374686364937,
                        "Put_Chg": -31.261113010344214
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 288.19051208216024,
                        "Call_Sim": 384.36305883355317,
                        "Call_Chg": 33.37117036107528,
                        "Put_Now": 167.87239585470388,
                        "Put_Sim": 117.04494260609681,
                        "Put_Chg": -30.277433636319223
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 261.9507965501534,
                        "Call_Sim": 353.376971404517,
                        "Call_Chg": 34.90204116896396,
                        "Put_Now": 189.60166989066465,
                        "Put_Sim": 134.02784474502778,
                        "Put_Chg": -29.31083105844161
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 249.44649537471378,
                        "Call_Sim": 338.4660938760949,
                        "Call_Chg": 35.686850748356896,
                        "Put_Now": 201.08186349920788,
                        "Put_Sim": 143.10146200058966,
                        "Put_Chg": -28.834227259310545
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 237.35155034253557,
                        "Call_Sim": 323.94808832830586,
                        "Call_Chg": 36.48450488770681,
                        "Put_Now": 212.97141325101438,
                        "Put_Sim": 152.56795123678512,
                        "Put_Chg": -28.362239369203962
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 942.6954829994638,
                        "Call_Sim": 796.0341113102545,
                        "Call_Chg": -15.557661443604557,
                        "Put_Now": 6.904544116555712,
                        "Put_Sim": 13.243172427347133,
                        "Put_Chg": 91.80371946053124
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 516.1374579159055,
                        "Call_Sim": 397.4158972183136,
                        "Call_Chg": -23.001926885325048,
                        "Put_Now": 60.03641471267497,
                        "Put_Sim": 94.3148540150828,
                        "Put_Chg": 57.09607988161712
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 443.51177734884914,
                        "Call_Sim": 333.7449174375988,
                        "Call_Chg": -24.749480288301786,
                        "Put_Now": 83.3487132815535,
                        "Put_Sim": 126.58185337030432,
                        "Put_Chg": 51.87019497554625
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 409.33837413486253,
                        "Call_Sim": 304.3623792055987,
                        "Call_Chg": -25.645285554067783,
                        "Put_Now": 97.14429963553562,
                        "Put_Sim": 145.1683047062711,
                        "Put_Chg": 49.43574172742112
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 376.67542561401933,
                        "Call_Sim": 276.6554040619317,
                        "Call_Chg": -26.553370554780635,
                        "Put_Now": 112.45034068266,
                        "Put_Sim": 165.43031913057166,
                        "Put_Chg": 47.11411110565115
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 345.5728958021814,
                        "Call_Sim": 250.63733282187695,
                        "Call_Chg": -27.471935482651116,
                        "Put_Now": 129.3168004387892,
                        "Put_Sim": 187.38123745848497,
                        "Put_Chg": 44.90092302212504
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 316.06917110430277,
                        "Call_Sim": 226.3080365066362,
                        "Call_Chg": -28.399205871313978,
                        "Put_Now": 147.7820653088786,
                        "Put_Sim": 211.02093071121226,
                        "Put_Chg": 42.79197565019707
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 288.19051208216024,
                        "Call_Sim": 203.65429812133016,
                        "Call_Chg": -29.33344798552204,
                        "Put_Now": 167.87239585470388,
                        "Put_Sim": 236.33618189387334,
                        "Put_Chg": 40.78323043558984
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 261.9507965501534,
                        "Call_Sim": 182.65047931325898,
                        "Call_Chg": -30.2729819039552,
                        "Put_Now": 189.60166989066465,
                        "Put_Sim": 263.30135265376975,
                        "Put_Chg": 38.870798345607724
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 249.44649537471378,
                        "Call_Sim": 172.75610175127804,
                        "Call_Chg": -30.74422573395264,
                        "Put_Now": 201.08186349920788,
                        "Put_Sim": 277.39146987577305,
                        "Put_Chg": 37.94952217402032
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 237.35155034253557,
                        "Call_Sim": 163.25943389828967,
                        "Call_Chg": -31.21619232624322,
                        "Put_Now": 212.97141325101438,
                        "Put_Sim": 291.87929680676916,
                        "Put_Chg": 37.050927329271005
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 942.6954829994638,
                        "Call_Sim": 294.48080950376425,
                        "Call_Chg": -68.76183085477543,
                        "Put_Now": 6.904544116555712,
                        "Put_Sim": 111.68987062085648,
                        "Put_Chg": 1517.6284593945395
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 516.1374579159055,
                        "Call_Sim": 85.17892672174366,
                        "Call_Chg": -83.49685235679564,
                        "Put_Now": 60.03641471267497,
                        "Put_Sim": 382.07788351851286,
                        "Put_Chg": 536.4102276044944
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 443.51177734884914,
                        "Call_Sim": 63.106494148368824,
                        "Call_Chg": -85.77117962332449,
                        "Put_Now": 83.3487132815535,
                        "Put_Sim": 455.94343008107353,
                        "Put_Chg": 447.03115636697135
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 409.33837413486253,
                        "Call_Sim": 53.97325107129859,
                        "Call_Chg": -86.8145147189361,
                        "Put_Now": 97.14429963553562,
                        "Put_Sim": 494.7791765719712,
                        "Put_Chg": 409.32394224702387
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 376.67542561401933,
                        "Call_Sim": 45.9685340496045,
                        "Call_Chg": -87.79624819573215,
                        "Put_Now": 112.45034068266,
                        "Put_Sim": 534.7434491182448,
                        "Put_Chg": 375.5374202265116
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 345.5728958021814,
                        "Call_Sim": 38.98872259756479,
                        "Call_Chg": -88.71765608033006,
                        "Put_Now": 129.3168004387892,
                        "Put_Sim": 575.7326272341725,
                        "Put_Chg": 345.2110052836404
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 316.06917110430277,
                        "Call_Sim": 32.93320459759127,
                        "Call_Chg": -89.58038062284686,
                        "Put_Now": 147.7820653088786,
                        "Put_Sim": 617.6460988021668,
                        "Put_Chg": 317.94388074847075
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 288.19051208216024,
                        "Call_Sim": 27.70559012772287,
                        "Call_Chg": -90.38636285159023,
                        "Put_Now": 167.87239585470388,
                        "Put_Sim": 660.3874739002658,
                        "Put_Chg": 293.3865782625997
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 261.9507965501534,
                        "Call_Sim": 23.214658185389965,
                        "Call_Chg": -91.1377791206887,
                        "Put_Now": 189.60166989066465,
                        "Put_Sim": 703.8655315258998,
                        "Put_Chg": 271.23382506693616
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 249.44649537471378,
                        "Call_Sim": 21.218530090075205,
                        "Call_Chg": -91.49375498012063,
                        "Put_Now": 201.08186349920788,
                        "Put_Sim": 725.8538982145701,
                        "Put_Chg": 260.97432437880184
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 237.35155034253557,
                        "Call_Sim": 19.375048207971247,
                        "Call_Chg": -91.83698266136876,
                        "Put_Now": 212.97141325101438,
                        "Put_Sim": 747.9949111164501,
                        "Put_Chg": 251.2184568333785
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5305.53,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 942.6954829994638,
                        "Call_Sim": 993.7913113521881,
                        "Call_Chg": 5.420183853024081,
                        "Put_Now": 6.904544116555712,
                        "Put_Sim": 5.47037246928042,
                        "Put_Chg": -20.77141695476224
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 516.1374579159055,
                        "Call_Sim": 559.5959040270413,
                        "Call_Chg": 8.419936480993886,
                        "Put_Now": 60.03641471267497,
                        "Put_Sim": 50.96486082381114,
                        "Put_Chg": -15.110085990775584
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 443.51177734884914,
                        "Call_Sim": 484.2895959992861,
                        "Call_Chg": 9.194303451013598,
                        "Put_Now": 83.3487132815535,
                        "Put_Sim": 71.5965319319912,
                        "Put_Chg": -14.100015329406729
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 409.33837413486253,
                        "Call_Sim": 448.6453670497435,
                        "Call_Chg": 9.602567313156603,
                        "Put_Now": 97.14429963553562,
                        "Put_Sim": 83.92129255041641,
                        "Put_Chg": -13.611716935248971
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 376.67542561401933,
                        "Call_Sim": 414.43525393577283,
                        "Call_Chg": 10.024500074620248,
                        "Put_Now": 112.45034068266,
                        "Put_Sim": 97.6801690044133,
                        "Put_Chg": -13.134839422077697
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 345.5728958021814,
                        "Call_Sim": 381.719021139108,
                        "Call_Chg": 10.459768626535451,
                        "Put_Now": 129.3168004387892,
                        "Put_Sim": 112.93292577571628,
                        "Put_Chg": -12.669563898488228
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 316.06917110430277,
                        "Call_Sim": 350.5460304655121,
                        "Call_Chg": 10.908010813187465,
                        "Put_Now": 147.7820653088786,
                        "Put_Sim": 129.72892467008796,
                        "Put_Chg": -12.216056529632233
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 288.19051208216024,
                        "Call_Sim": 320.9544325266729,
                        "Call_Chg": 11.368840774040475,
                        "Put_Now": 167.87239585470388,
                        "Put_Sim": 148.10631629921636,
                        "Put_Chg": -11.774466823357525
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 261.9507965501534,
                        "Call_Sim": 292.97062748466215,
                        "Call_Chg": 11.841854021073619,
                        "Put_Now": 189.60166989066465,
                        "Put_Sim": 168.09150082517317,
                        "Put_Chg": -11.34492595866666
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 249.44649537471378,
                        "Call_Sim": 279.5866141630845,
                        "Call_Chg": 12.0827990560039,
                        "Put_Now": 201.08186349920788,
                        "Put_Sim": 178.69198228757978,
                        "Put_Chg": -11.134709427295668
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 237.35155034253557,
                        "Call_Sim": 266.6090029325742,
                        "Call_Chg": 12.326632182438038,
                        "Put_Now": 212.97141325101438,
                        "Put_Sim": 189.69886584105325,
                        "Put_Chg": -10.92754518303892
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5200.47,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 942.6954829994638,
                        "Call_Sim": 891.9352051735832,
                        "Call_Chg": -5.384589057791157,
                        "Put_Now": 6.904544116555712,
                        "Put_Sim": 8.674266290675547,
                        "Put_Chg": 25.63126752824123
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 516.1374579159055,
                        "Call_Sim": 473.980392731607,
                        "Call_Chg": -8.167798042506574,
                        "Put_Now": 60.03641471267497,
                        "Put_Sim": 70.40934952837597,
                        "Put_Chg": 17.277738628038115
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 443.51177734884914,
                        "Call_Sim": 404.24285469708866,
                        "Call_Chg": -8.854087908667433,
                        "Put_Now": 83.3487132815535,
                        "Put_Sim": 96.60979062979368,
                        "Put_Chg": 15.91035641239477
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 409.33837413486253,
                        "Call_Sim": 371.63432857391217,
                        "Call_Chg": -9.210972619080227,
                        "Put_Now": 97.14429963553562,
                        "Put_Sim": 111.970254074585,
                        "Put_Chg": 15.261785297411329
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 376.67542561401933,
                        "Call_Sim": 340.6037611066722,
                        "Call_Chg": -9.576325412932537,
                        "Put_Now": 112.45034068266,
                        "Put_Sim": 128.90867617531194,
                        "Put_Chg": 14.636092156535227
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 345.5728958021814,
                        "Call_Sim": 311.1897642457311,
                        "Call_Chg": -9.949603100855585,
                        "Put_Now": 129.3168004387892,
                        "Put_Sim": 147.4636688823391,
                        "Put_Chg": 14.03287769413964
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 316.06917110430277,
                        "Call_Sim": 283.41843335781914,
                        "Call_Chg": -10.330250695569703,
                        "Put_Now": 147.7820653088786,
                        "Put_Sim": 167.66132756239494,
                        "Put_Chg": 13.451742071655847
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 288.19051208216024,
                        "Call_Sim": 257.30309660838384,
                        "Call_Chg": -10.717707273087015,
                        "Put_Now": 167.87239585470388,
                        "Put_Sim": 189.51498038092677,
                        "Put_Chg": 12.892283103503733
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 261.9507965501534,
                        "Call_Sim": 232.8443661815977,
                        "Call_Chg": -11.111411284822326,
                        "Put_Now": 189.60166989066465,
                        "Put_Sim": 213.02523952210822,
                        "Put_Chg": 12.354094584162134
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 249.44649537471378,
                        "Call_Sim": 221.2330201392001,
                        "Call_Chg": -11.310431599021635,
                        "Put_Now": 201.08186349920788,
                        "Put_Sim": 225.39838826369396,
                        "Put_Chg": 12.092848326215092
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 237.35155034253557,
                        "Call_Sim": 210.03047554638488,
                        "Call_Chg": -11.51080528301673,
                        "Put_Now": 212.97141325101438,
                        "Put_Sim": 238.1803384548639,
                        "Put_Chg": 11.836764765296232
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
                        "Call_Now": 172.04016351469,
                        "Call_Sim": 312.61148774108733,
                        "Call_Chg": 81.70843444611954,
                        "Put_Now": 6.9117506881285635,
                        "Put_Sim": 0.483074914526334,
                        "Put_Chg": -93.01081684910814
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 62.06820411635272,
                        "Call_Sim": 170.4285348526564,
                        "Call_Chg": 174.5826744611009,
                        "Put_Now": 46.58307326548038,
                        "Put_Sim": 7.943404001784529,
                        "Put_Chg": -82.94787474301131
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 38.757866698418184,
                        "Call_Sim": 128.6801718677316,
                        "Call_Chg": 232.01046091884976,
                        "Put_Now": 73.15382983944255,
                        "Put_Sim": 16.07613500875641,
                        "Put_Chg": -78.02420591780337
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 22.40276333459292,
                        "Call_Sim": 92.17529396153304,
                        "Call_Chg": 311.4460907561427,
                        "Put_Now": 106.67982046751422,
                        "Put_Sim": 29.45235109445366,
                        "Put_Chg": -72.39182540298482
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 11.924579286401013,
                        "Call_Sim": 62.15590538201377,
                        "Call_Chg": 421.2419146132676,
                        "Put_Now": 146.08273041121902,
                        "Put_Sim": 49.31405650683155,
                        "Put_Chg": -66.24237761163569
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 5.822140490009133,
                        "Call_Sim": 39.182200348928745,
                        "Call_Chg": 572.9861709137026,
                        "Put_Now": 189.86138560672225,
                        "Put_Sim": 76.22144546564277,
                        "Put_Chg": -59.85416138091006
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.6002517540148915,
                        "Call_Sim": 22.95446782671229,
                        "Call_Chg": 782.7786690757802,
                        "Put_Now": 236.5205908626258,
                        "Put_Sim": 109.8748069353228,
                        "Put_Chg": -53.54535242170966
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 172.04016351469,
                        "Call_Sim": 169.36257532451145,
                        "Call_Chg": -1.5563738928613076,
                        "Put_Now": 6.9117506881285635,
                        "Put_Sim": 7.2341624979501375,
                        "Put_Chg": 4.664690964263799
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 62.06820411635272,
                        "Call_Sim": 60.429352454735636,
                        "Call_Chg": -2.640404511374132,
                        "Put_Now": 46.58307326548038,
                        "Put_Sim": 47.9442216038633,
                        "Put_Chg": 2.9219805456493457
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 38.757866698418184,
                        "Call_Sim": 37.55538016968194,
                        "Call_Chg": -3.1025611860761195,
                        "Put_Now": 73.15382983944255,
                        "Put_Sim": 74.9513433107063,
                        "Put_Chg": 2.4571693309959626
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 22.40276333459292,
                        "Call_Sim": 21.595161134203636,
                        "Call_Chg": -3.6049222514538433,
                        "Put_Now": 106.67982046751422,
                        "Put_Sim": 108.87221826712448,
                        "Put_Chg": 2.0551195062030345
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 11.924579286401013,
                        "Call_Sim": 11.430890006002983,
                        "Call_Chg": -4.140098099402478,
                        "Put_Now": 146.08273041121902,
                        "Put_Sim": 148.58904113082008,
                        "Put_Chg": 1.7156789940507424
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 5.822140490009133,
                        "Call_Sim": 5.548438703002773,
                        "Call_Chg": -4.7010508845678896,
                        "Put_Now": 189.86138560672225,
                        "Put_Sim": 192.5876838197155,
                        "Put_Chg": 1.4359413865442237
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.6002517540148915,
                        "Call_Sim": 2.462919127857731,
                        "Call_Chg": -5.281512682189852,
                        "Put_Now": 236.5205908626258,
                        "Put_Sim": 239.38325823646755,
                        "Put_Chg": 1.210324802335892
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 172.04016351469,
                        "Call_Sim": 58.702799527457955,
                        "Call_Chg": -65.87843307737528,
                        "Put_Now": 6.9117506881285635,
                        "Put_Sim": 46.57438670089641,
                        "Put_Chg": 573.8435571886487
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 62.06820411635272,
                        "Call_Sim": 10.455077655444143,
                        "Call_Chg": -83.15550159008127,
                        "Put_Now": 46.58307326548038,
                        "Put_Sim": 147.96994680457192,
                        "Put_Chg": 217.64745524899195
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 38.757866698418184,
                        "Call_Sim": 4.921729409711702,
                        "Call_Chg": -87.30134078841711,
                        "Put_Now": 73.15382983944255,
                        "Put_Sim": 192.31769255073596,
                        "Put_Chg": 162.8949064906558
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 22.40276333459292,
                        "Call_Sim": 2.1070089579238527,
                        "Call_Chg": -90.59487025571376,
                        "Put_Now": 106.67982046751422,
                        "Put_Sim": 239.3840660908454,
                        "Put_Chg": 124.39489028174906
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 11.924579286401013,
                        "Call_Sim": 0.8188447526047611,
                        "Call_Chg": -93.13313507388403,
                        "Put_Now": 146.08273041121902,
                        "Put_Sim": 287.9769958774232,
                        "Put_Chg": 97.13281307569729
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 5.822140490009133,
                        "Call_Sim": 0.28862230729014726,
                        "Call_Chg": -95.04267703973433,
                        "Put_Now": 189.86138560672225,
                        "Put_Sim": 337.32786742400367,
                        "Put_Chg": 77.67060234288114
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.6002517540148915,
                        "Call_Sim": 0.09224840041141924,
                        "Call_Chg": -96.45232811519176,
                        "Put_Now": 236.5205908626258,
                        "Put_Sim": 387.0125875090216,
                        "Put_Chg": 63.62743983410878
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5305.53,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 172.04016351469,
                        "Call_Sim": 220.60043256525478,
                        "Call_Chg": 28.226123515872136,
                        "Put_Now": 6.9117506881285635,
                        "Put_Sim": 2.9420197386940004,
                        "Put_Chg": -57.43452170884673
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 62.06820411635272,
                        "Call_Sim": 94.89832977715378,
                        "Call_Chg": 52.893629078195794,
                        "Put_Now": 46.58307326548038,
                        "Put_Sim": 26.883198926281693,
                        "Put_Chg": -42.289769562707136
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 38.757866698418184,
                        "Call_Sim": 64.04583290531173,
                        "Call_Chg": 65.24602193320824,
                        "Put_Now": 73.15382983944255,
                        "Put_Sim": 45.91179604633635,
                        "Put_Chg": -37.239381523697126
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 22.40276333459292,
                        "Call_Sim": 40.34061491967168,
                        "Call_Chg": 80.0698169112927,
                        "Put_Now": 106.67982046751422,
                        "Put_Sim": 72.087672052593,
                        "Put_Chg": -32.42614044842257
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 11.924579286401013,
                        "Call_Sim": 23.564266738310153,
                        "Call_Chg": 97.61088565349414,
                        "Put_Now": 146.08273041121902,
                        "Put_Sim": 105.19241786312841,
                        "Put_Chg": -27.99120226804733
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 5.822140490009133,
                        "Call_Sim": 12.700030478920667,
                        "Call_Chg": 118.13335663600148,
                        "Put_Now": 189.86138560672225,
                        "Put_Sim": 144.2092755956337,
                        "Put_Chg": -24.044968314753618
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.6002517540148915,
                        "Call_Sim": 6.290792929041913,
                        "Call_Chg": 141.9301484684581,
                        "Put_Now": 236.5205908626258,
                        "Put_Sim": 187.6811320376528,
                        "Put_Chg": -20.6491361478712
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5200.47,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 172.04016351469,
                        "Call_Sim": 127.22400358081677,
                        "Call_Chg": -26.049824074973344,
                        "Put_Now": 6.9117506881285635,
                        "Put_Sim": 14.62559075425554,
                        "Put_Chg": 111.6047209193477
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 62.06820411635272,
                        "Call_Sim": 37.20041074453047,
                        "Call_Chg": -40.065269691394995,
                        "Put_Now": 46.58307326548038,
                        "Put_Sim": 74.24527989365788,
                        "Put_Chg": 59.38252822120288
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 38.757866698418184,
                        "Call_Sim": 21.27023047753164,
                        "Call_Chg": -45.12022386825605,
                        "Put_Now": 73.15382983944255,
                        "Put_Sim": 108.19619361855575,
                        "Put_Chg": 47.9022955544828
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 22.40276333459292,
                        "Call_Sim": 11.177115599937565,
                        "Call_Chg": -50.10831729548928,
                        "Put_Now": 106.67982046751422,
                        "Put_Sim": 147.9841727328594,
                        "Put_Chg": 38.718055658823545
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 11.924579286401013,
                        "Call_Sim": 5.376598133986931,
                        "Call_Chg": -54.911632478988224,
                        "Put_Now": 146.08273041121902,
                        "Put_Sim": 192.0647492588041,
                        "Put_Chg": 31.47669729210765
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 5.822140490009133,
                        "Call_Sim": 2.361044770552951,
                        "Call_Chg": -59.44713504243785,
                        "Put_Now": 189.86138560672225,
                        "Put_Sim": 238.93028988726655,
                        "Put_Chg": 25.84459400406217
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.6002517540148915,
                        "Call_Sim": 0.9448303237998772,
                        "Call_Chg": -63.66389053132945,
                        "Put_Now": 236.5205908626258,
                        "Put_Sim": 287.3951694324096,
                        "Put_Chg": 21.50957698196028
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.00011566695643021647,
            -0.12455405795374494,
            -0.17990740934179733,
            -0.0016679334980964876,
            -0.001893419239918221,
            0.16616858879477733,
            0.1845398655400745,
            0.34341366846726334,
            0.5700653049781772,
            0.010058241072248657,
            0.29389325054402016,
            0.44206652797708423,
            0.20301890365025338,
            0.005690936733042402,
            0.18360945989443883,
            0.039410903707735534
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
            -0.3349899929857142,
            -1365.214696457461,
            -1436.1954207797432,
            -56.891147773976435,
            -600.5763623178944,
            -1776.2936595274778,
            642.1040175978178,
            736.7347100281014,
            815.6696199003477,
            54.01318410865657,
            297.78950416702816,
            453.25502791402596,
            519.1257578223383,
            43.07656227898729,
            -5449.644528093906,
            135.50518298026287
        ],
        "delta_cumulative": [
            -0.3349899929857142,
            -1365.5496864504469,
            -2801.74510723019,
            -2858.6362550041667,
            -3459.2126173220613,
            -5235.506276849539,
            -4593.402259251721,
            -3856.66754922362,
            -3040.9979293232723,
            -2986.9847452146155,
            -2689.1952410475874,
            -2235.9402131335614,
            -1716.8144553112231,
            -1673.737893032236,
            -7123.382421126142,
            -6987.877238145878
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
            4168.131470070017,
            16117922.127554754,
            31790846.735979423,
            455540.5187712089,
            5857076.655390535,
            30334250.46307103,
            11909123.255455123,
            17396910.946523603,
            23670545.983841617,
            508168.2209266062,
            10325990.885680322,
            13556916.681875888,
            7305713.527220249,
            190476.9272738069,
            14467810.800084606,
            1011086.9644247396
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            173192.2616657787,
            45956.09705911719,
            11909123.255455123,
            17396910.946523603,
            23670545.983841617,
            508168.2209266062,
            10325990.885680322,
            13556916.681875888,
            7305713.527220249,
            190476.9272738069,
            6151481.288670478,
            1011086.9644247396
        ],
        "gamma_put": [
            4168.131470070017,
            16117922.127554754,
            31790846.735979423,
            455540.5187712089,
            5683884.393724755,
            30288294.366011914,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            8316329.511414128,
            0.0
        ],
        "gamma_exposure": [
            4168.131470070017,
            16122090.259024823,
            47912936.995004244,
            48368477.51377545,
            54225554.169165984,
            84559804.63223702,
            96468927.88769214,
            113865838.83421575,
            137536384.81805736,
            138044553.03898397,
            148370543.9246643,
            161927460.60654017,
            169233174.13376042,
            169423651.06103423,
            183891461.86111885,
            184902548.82554358
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
            "abs_call": 76454493.4713712,
            "abs_put": 46553965.96507308,
            "net": 123008459.43644428
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 34,
            "abs_call": 6346155.896067533,
            "abs_put": 15422153.33078906,
            "net": 21768309.226856593
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 55,
            "abs_call": 508168.2209266062,
            "abs_put": 0.0,
            "net": 508168.2209266062
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 77,
            "abs_call": 0.0,
            "abs_put": 21774145.969407246,
            "net": 21774145.969407246
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 100,
            "abs_call": 0.0,
            "abs_put": 455540.5187712089,
            "net": 455540.5187712089
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 121,
            "abs_call": 45956.09705911719,
            "abs_put": 0.0,
            "net": 45956.09705911719
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 143,
            "abs_call": 6151481.288670478,
            "abs_put": 8316329.511414128,
            "net": 14467810.800084606
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 165,
            "abs_call": 0.0,
            "abs_put": 31828.683342334465,
            "net": 31828.683342334465
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 186,
            "abs_call": 959557.6311527169,
            "abs_put": 0.0,
            "net": 959557.6311527169
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 209,
            "abs_call": 1011086.9644247396,
            "abs_put": 0.0,
            "net": 1011086.9644247396
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 230,
            "abs_call": 0.0,
            "abs_put": 103021.80612919778,
            "net": 103021.80612919778
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 250,
            "abs_call": 768663.4709449348,
            "abs_put": 0.0,
            "net": 768663.4709449348
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
            25.0,
            100.0,
            3905.0,
            150.0,
            5700.0,
            9740.0,
            2500.0,
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
            25.0,
            100.0,
            3905.0,
            150.0,
            5700.0,
            9740.0,
            2500.0,
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
                "volume": 9500,
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
                "volume": 3905,
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
                "volume": 2000,
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
                "volume": 100,
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
                "volume": 25,
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
                "strike": 5500.0,
                "type": "CALL",
                "oi": 6930,
                "volume": 9500,
                "expiry": "2026-04-01 00:00:00",
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
                "strike": 5400.0,
                "type": "CALL",
                "oi": 4875,
                "volume": 3905,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5600.0,
                "type": "CALL",
                "oi": 3200,
                "volume": 2000,
                "expiry": "2026-05-01 00:00:00",
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
                "strike": 5350.0,
                "type": "CALL",
                "oi": 2700,
                "volume": 100,
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
            }
        ]
    },
    "fed_watch": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 15,
            "iv_atm": 0.0,
            "spot": 5253.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 45,
            "iv_atm": 0.0,
            "spot": 5253.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 76,
            "iv_atm": 0.0,
            "spot": 5253.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 105,
            "iv_atm": 0.0,
            "spot": 5253.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 139,
            "iv_atm": 0.0,
            "spot": 5253.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 168,
            "iv_atm": 0.0,
            "spot": 5253.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 198,
            "iv_atm": 0.0,
            "spot": 5253.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 230,
            "iv_atm": 0.0,
            "spot": 5253.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 259,
            "iv_atm": 0.0,
            "spot": 5253.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 290,
            "iv_atm": 0.0,
            "spot": 5253.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 321,
            "iv_atm": 0.0,
            "spot": 5253.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 349,
            "iv_atm": 0.0,
            "spot": 5253.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.0,
                    "lower": 5253.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.0,
                    "lower": 5253.0,
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
            -0.7474127729796642,
            -1685.486698279883,
            -11740.512708954013,
            3.225485373852255,
            143.839541900927,
            1366.2976398620265,
            2915.7861095196577,
            7696.004429299641,
            15086.573829228828,
            103.98669769914454,
            8568.173284863546,
            13456.028429218892,
            3507.9785656976733,
            29.873882694226893,
            4214.347535939849,
            259.68390334354797
        ],
        "vanna": [
            -12.801244909115217,
            -17049.49981514367,
            -17974.958157827634,
            -285.7249052909505,
            -2416.7330086692987,
            -1435.1904792739374,
            1390.9359757518107,
            4802.443224258216,
            10235.756609241673,
            197.3944663440591,
            6050.6507713973715,
            9724.435333931215,
            6748.108537618799,
            182.63287634269741,
            26516.391377637632,
            2221.050071911965
        ],
        "vex": [
            3389.063337486142,
            6115811.772546993,
            3551857.8294047983,
            224481.90761224597,
            2382062.515776024,
            1929135.680005484,
            704231.3725027676,
            1028744.9554749387,
            1399728.655797979,
            137728.72402454788,
            610614.7848073317,
            1276656.925164893,
            1942776.0965698482,
            234658.7308297067,
            10195139.918344576,
            1041331.7965648703
        ],
        "theta": [
            -0.8519044906276235,
            -3221.296650622865,
            -7731.03688886909,
            -70.51401858450926,
            -1037.5770369957474,
            -6943.973077972217,
            -4125.391332140485,
            -5822.437947534354,
            -7732.270810224754,
            -202.23840781618782,
            -3313.955873870826,
            -4404.885540908004,
            -2647.2087384655733,
            -96.99842581384208,
            2344.886030988911,
            -428.355221507208
        ],
        "charm_cum": [
            -0.7474127729796642,
            -1686.2341110528628,
            -13426.746820006876,
            -13423.521334633024,
            -13279.681792732097,
            -11913.38415287007,
            -8997.598043350412,
            -1301.593614050771,
            13784.980215178057,
            13888.966912877202,
            22457.140197740748,
            35913.16862695964,
            39421.147192657314,
            39451.02107535154,
            43665.36861129139,
            43925.05251463494
        ],
        "vanna_cum": [
            -12.801244909115217,
            -17062.301060052785,
            -35037.25921788042,
            -35322.98412317137,
            -37739.71713184067,
            -39174.907611114606,
            -37783.971635362795,
            -32981.52841110458,
            -22745.771801862902,
            -22548.377335518842,
            -16497.72656412147,
            -6773.291230190254,
            -25.182692571454936,
            157.45018377124248,
            26673.841561408874,
            28894.89163332084
        ],
        "theta_cum": [
            -0.8519044906276235,
            -3222.1485551134924,
            -10953.185443982582,
            -11023.69946256709,
            -12061.276499562839,
            -19005.249577535054,
            -23130.640909675538,
            -28953.07885720989,
            -36685.349667434646,
            -36887.58807525083,
            -40201.54394912166,
            -44606.429490029666,
            -47253.63822849524,
            -47350.636654309084,
            -45005.75062332017,
            -45434.105844827376
        ],
        "r_gamma": [
            4168.131470070017,
            16117922.127554754,
            31790846.735979423,
            455540.5187712089,
            5857076.655390535,
            30334250.46307103,
            -11909123.255455123,
            -17396910.946523603,
            -23670545.983841617,
            -508168.2209266062,
            -10325990.885680322,
            -13556916.681875888,
            -7305713.527220249,
            -190476.9272738069,
            -14467810.800084608,
            -1011086.9644247396
        ],
        "r_gamma_cum": [
            4168.131470070017,
            16122090.259024823,
            47912936.995004244,
            48368477.51377545,
            54225554.169165984,
            84559804.63223702,
            72650681.3767819,
            55253770.43025829,
            31583224.446416672,
            31075056.225490067,
            20749065.339809746,
            7192148.657933857,
            -113564.86928639188,
            -304041.79656019877,
            -14771852.596644806,
            -15782939.561069544
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.3349899929857142,
            "gamma": 4168.131470070017,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -1365.214696457461,
            "gamma": 16117922.127554754,
            "volume": 160,
            "oi": 8900,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -1436.1954207797432,
            "gamma": 31790846.735979423,
            "volume": 305,
            "oi": 9480,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -56.891147773976435,
            "gamma": 455540.5187712089,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -600.5763623178944,
            "gamma": 5857076.655390535,
            "volume": 215,
            "oi": 2160,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -1776.2936595274778,
            "gamma": 30334250.46307103,
            "volume": 115,
            "oi": 4020,
            "iv": 11.82
        },
        {
            "strike": 5300.0,
            "delta": 642.1040175978178,
            "gamma": 11909123.255455123,
            "volume": 25,
            "oi": 1585,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": 736.7347100281014,
            "gamma": 17396910.946523603,
            "volume": 100,
            "oi": 2700,
            "iv": 11.82
        },
        {
            "strike": 5400.0,
            "delta": 815.6696199003477,
            "gamma": 23670545.983841617,
            "volume": 3905,
            "oi": 4875,
            "iv": 11.82
        },
        {
            "strike": 5425.0,
            "delta": 54.01318410865657,
            "gamma": 508168.2209266062,
            "volume": 150,
            "oi": 150,
            "iv": 11.82
        },
        {
            "strike": 5450.0,
            "delta": 297.78950416702816,
            "gamma": 10325990.885680322,
            "volume": 5700,
            "oi": 3200,
            "iv": 11.82
        },
        {
            "strike": 5500.0,
            "delta": 453.25502791402596,
            "gamma": 13556916.681875888,
            "volume": 9740,
            "oi": 7170,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 519.1257578223383,
            "gamma": 7305713.527220249,
            "volume": 2500,
            "oi": 3700,
            "iv": 11.82
        },
        {
            "strike": 5800.0,
            "delta": 43.07656227898729,
            "gamma": 190476.9272738069,
            "volume": 120,
            "oi": 120,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5449.644528093906,
            "gamma": 14467810.800084606,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 135.50518298026287,
            "gamma": 1011086.9644247396,
            "volume": 500,
            "oi": 1000,
            "iv": 11.82
        }
    ]
};