window.marketData = {
    "last_updated": "2026-03-17 08:27:17",
    "spot_price": 5253.0,
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-03-16",
        "meetings": [
            {
                "date": "2026-03-18",
                "days_remaining": 0,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 1.7,
                    "3.50-3.75": 99.7,
                    "3.75-4.00": 0.3
                }
            },
            {
                "date": "2026-04-29",
                "days_remaining": 42,
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
                "days_remaining": 91,
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
                "days_remaining": 133,
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
                "days_remaining": 182,
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
                "days_remaining": 224,
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
                "days_remaining": 266,
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
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 17/03/2026 08:27\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(2);\n  spot(5253.00);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5830.82;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (5830.82)\n  // 2 = Spline (4968.78)\n  // 3 = HVL (4500.00)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (5830.82)\n  // 7 = HVL Gaussian (5745.52)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 5830.82;\n  if (ModeloFlip = 2) then GammaVal := 4968.78;\n  if (ModeloFlip = 3) then GammaVal := 4500.00;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 5830.82;\n  if (ModeloFlip = 7) then GammaVal := 5745.52;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5051.58 <= LimitUpper) and (5051.58 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5051.58, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirRange) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5213.89 <= LimitUpper) and (5213.89 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5213.89, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5292.11 <= LimitUpper) and (5292.11 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5292.11, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirMaxPain) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirRange) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5425.00 <= LimitUpper) and (5425.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5425.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5450.00 <= LimitUpper) and (5450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5500.00 <= LimitUpper) and (5500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5710.19 <= LimitUpper) and (5710.19 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5710.19, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5800.00 <= LimitUpper) and (5800.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5800.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5348.43 > 0) then\n      HorizontalLineCustom(5348.43, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5275.00 <= LimitUpper) and (5275.00 >= LimitLower) then\n      HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5412.50 <= LimitUpper) and (5412.50 >= LimitLower) then\n      HorizontalLineCustom(5412.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5437.50 <= LimitUpper) and (5437.50 >= LimitLower) then\n      HorizontalLineCustom(5437.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5475.00 <= LimitUpper) and (5475.00 >= LimitLower) then\n      HorizontalLineCustom(5475.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5550.00 <= LimitUpper) and (5550.00 >= LimitLower) then\n      HorizontalLineCustom(5550.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5700.00 <= LimitUpper) and (5700.00 >= LimitLower) then\n      HorizontalLineCustom(5700.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5900.00 <= LimitUpper) and (5900.00 >= LimitLower) then\n      HorizontalLineCustom(5900.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5409.55 <= LimitUpper) and (5409.55 >= LimitLower) then\n      HorizontalLineCustom(5409.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5415.45 <= LimitUpper) and (5415.45 >= LimitLower) then\n      HorizontalLineCustom(5415.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5434.55 <= LimitUpper) and (5434.55 >= LimitLower) then\n      HorizontalLineCustom(5434.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5440.45 <= LimitUpper) and (5440.45 >= LimitLower) then\n      HorizontalLineCustom(5440.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5469.10 <= LimitUpper) and (5469.10 >= LimitLower) then\n      HorizontalLineCustom(5469.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5480.90 <= LimitUpper) and (5480.90 >= LimitLower) then\n      HorizontalLineCustom(5480.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5538.20 <= LimitUpper) and (5538.20 >= LimitLower) then\n      HorizontalLineCustom(5538.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5676.40 <= LimitUpper) and (5676.40 >= LimitLower) then\n      HorizontalLineCustom(5676.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5723.60 <= LimitUpper) and (5723.60 >= LimitLower) then\n      HorizontalLineCustom(5723.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5876.40 <= LimitUpper) and (5876.40 >= LimitLower) then\n      HorizontalLineCustom(5876.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5923.60 <= LimitUpper) and (5923.60 >= LimitLower) then\n      HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5261.80 <= LimitUpper) and (5261.80 >= LimitLower) then\n      HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5405.90 <= LimitUpper) and (5405.90 >= LimitLower) then\n      HorizontalLineCustom(5405.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5419.10 <= LimitUpper) and (5419.10 >= LimitLower) then\n      HorizontalLineCustom(5419.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5430.90 <= LimitUpper) and (5430.90 >= LimitLower) then\n      HorizontalLineCustom(5430.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5444.10 <= LimitUpper) and (5444.10 >= LimitLower) then\n      HorizontalLineCustom(5444.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5461.80 <= LimitUpper) and (5461.80 >= LimitLower) then\n      HorizontalLineCustom(5461.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5488.20 <= LimitUpper) and (5488.20 >= LimitLower) then\n      HorizontalLineCustom(5488.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5523.60 <= LimitUpper) and (5523.60 >= LimitLower) then\n      HorizontalLineCustom(5523.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5576.40 <= LimitUpper) and (5576.40 >= LimitLower) then\n      HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5647.20 <= LimitUpper) and (5647.20 >= LimitLower) then\n      HorizontalLineCustom(5647.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5752.80 <= LimitUpper) and (5752.80 >= LimitLower) then\n      HorizontalLineCustom(5752.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5847.20 <= LimitUpper) and (5847.20 >= LimitLower) then\n      HorizontalLineCustom(5847.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5952.80 <= LimitUpper) and (5952.80 >= LimitLower) then\n      HorizontalLineCustom(5952.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5260.88, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5245.12, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5268.76, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5237.24, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5283.39, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5222.61, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5291.27, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5214.73, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 61505,
        "total_volume": 23810,
        "gamma_exposure": 184967878.53058013,
        "delta_position": -7164.949727690197,
        "last_update": "2026-03-17T08:27:17.188302",
        "spot_price": 5253.0,
        "dealer_pressure": 0.14282374877611845,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 5745.518834699822,
        "call_wall": 5400.0,
        "put_wall": 5100.0,
        "effective_call_wall": 5710.18593371059,
        "effective_put_wall": 5051.5778019586505,
        "max_pain": 5400.0,
        "zero_gamma": 5830.822410067256,
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
                "days": 208,
                "sigma_1_up": 5817.100226933437,
                "sigma_1_down": 4688.899773066563,
                "sigma_2_up": 6381.2004538668725,
                "sigma_2_down": 4124.7995461331275
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
                5476.441554529948,
                5434.620416732887,
                5416.378664529959,
                5404.659542447254,
                5399.028313058591,
                5397.263881648632,
                5395.880628603162,
                5394.774721406272,
                5393.875606025206,
                5393.133963053982,
                5392.514457138482,
                5391.991219657304,
                5391.544948257272,
                5391.160994266494,
                5390.828071254188,
                5390.537364284892,
                5390.28190367515,
                5390.056117019064,
                5389.855503651356
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
                -30873.32100601462,
                -30694.696997781393,
                -30485.476627159136,
                -30242.533341493876,
                -29962.718350465577,
                -29642.880740725475,
                -29279.86356276862,
                -28870.436374652647,
                -28411.103374622464,
                -27897.724297290824,
                -27324.93119219112,
                -26685.437337455427,
                -25969.494432974112,
                -25164.87898163872,
                -24257.755744777474,
                -23234.490488671247,
                -22084.017910251827,
                -20799.936360884036,
                -19381.393391927453,
                -17832.21305395397,
                -16158.480837461932,
                -14365.571381951364,
                -12455.966200595774,
                -10428.971542837136,
                -8282.739178721118,
                -6018.151070288468,
                -3643.4785249639317,
                -1178.4375576237242,
                1343.6508516939111,
                3876.4827888667614,
                6364.419242313016,
                8748.633962557422,
                10974.526196917792,
                12998.74668004968,
                14794.242027322987,
                16352.268707976604,
                17681.17856162613,
                18802.623798024408,
                19746.38055283729,
                20545.102948942353,
                21230.038797394285,
                21828.242767147196,
                22361.324097488083,
                22845.4157968188,
                23291.904257875376,
                23708.48087102466,
                24100.196757756876,
                24470.344629022566,
                24821.109519835118,
                25154.00405498217
            ],
            "flip_value": 5348.430288144024
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
                -7447703.026719442,
                -6755824.200988984,
                -6088962.660266718,
                -5448527.485867897,
                -4835896.1290628,
                -4252404.561401039,
                -3699337.787818523,
                -3177920.848275611,
                -2689310.4218900874,
                -2234587.133794196,
                -1814748.649713859,
                -1430703.6270044316,
                -1083266.5740454495,
                -773153.6529420409,
                -500979.4438187983,
                -267254.67299745604,
                -72384.89234755561,
                83329.91663973033,
                199694.85276938975,
                276618.7684022337,
                314112.1643209122,
                312284.37161345035,
                271340.09137903526,
                191575.36674922332,
                73373.06379462034,
                -82802.06152795441,
                -276408.6339956783,
                -506834.19286394306,
                -773400.9172567278,
                -1075371.475532202,
                -1411954.9354287703,
                -1782312.676775843,
                -2185564.253878502,
                -2620793.160213748,
                -3087052.453676896,
                -3583370.206181515,
                -4108754.746845031,
                -4662199.67321022,
                -5242688.609894743,
                -5849199.698682098,
                -6480709.80833455,
                -7136198.456299467,
                -7814651.437992243,
                -8515064.162463022,
                -9236444.69600909,
                -9977816.51768669,
                -10738220.99272762,
                -11516719.571601784,
                -12312395.723905148,
                -13124356.617428368
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
                        "Call_Now": 941.7789584810225,
                        "Call_Sim": 1085.4536751818423,
                        "Call_Chg": 15.255672831398781,
                        "Put_Now": 6.844693682240802,
                        "Put_Sim": 3.519410383060489,
                        "Put_Chg": -48.58191547429028
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 515.0288415039067,
                        "Call_Sim": 639.548123684352,
                        "Call_Chg": 24.177147403404355,
                        "Put_Now": 59.87965839414983,
                        "Put_Sim": 37.39894057459435,
                        "Put_Chg": -37.54316310821142
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 442.38632395137074,
                        "Call_Sim": 559.9215216733774,
                        "Call_Chg": 26.568451906964164,
                        "Put_Now": 83.19415717941843,
                        "Put_Sim": 53.72935490142447,
                        "Put_Chg": -35.41691301042871
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 408.2101367928112,
                        "Call_Sim": 521.8713740460685,
                        "Call_Chg": 27.84380567965819,
                        "Put_Now": 96.99647818976177,
                        "Put_Sim": 63.65771544301799,
                        "Put_Chg": -34.37110642462767
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 375.54860177600904,
                        "Call_Sim": 485.1051995295952,
                        "Call_Chg": 29.17241529737601,
                        "Put_Now": 112.31345134186131,
                        "Put_Sim": 74.87004909544726,
                        "Put_Chg": -33.338306141481915
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 344.45191536337416,
                        "Call_Sim": 449.6965358153325,
                        "Call_Chg": 30.554227094638787,
                        "Put_Now": 129.19527309812838,
                        "Put_Sim": 87.43989355008694,
                        "Put_Chg": -32.319587665043095
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 314.9586068835538,
                        "Call_Sim": 415.71098507991246,
                        "Call_Chg": 31.98908554786971,
                        "Put_Now": 147.68047278721065,
                        "Put_Sim": 101.43285098356955,
                        "Put_Chg": -31.316003348850472
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 287.0949853064981,
                        "Call_Sim": 383.20504183283356,
                        "Call_Chg": 33.476745134969846,
                        "Put_Now": 167.79535937905712,
                        "Put_Sim": 116.90541590539283,
                        "Put_Chg": -30.328576226414977
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 260.87488098015865,
                        "Call_Sim": 352.22513036726923,
                        "Call_Chg": 35.016882056213916,
                        "Put_Now": 189.55376322162056,
                        "Put_Sim": 133.90401260873114,
                        "Put_Chg": -29.358293745835795
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 248.38205999210413,
                        "Call_Sim": 337.31900647279326,
                        "Call_Chg": 35.806509730822086,
                        "Put_Now": 201.05019631801724,
                        "Put_Sim": 142.98714279870683,
                        "Put_Chg": -28.87987904645834
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 236.2996786038011,
                        "Call_Sim": 322.8068774535004,
                        "Call_Chg": 36.60910559033987,
                        "Put_Now": 212.95706901416543,
                        "Put_Sim": 152.46426786386496,
                        "Put_Chg": -28.406101488125113
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 941.7789584810225,
                        "Call_Sim": 795.0899778892963,
                        "Call_Chg": -15.575733485096984,
                        "Put_Now": 6.844693682240802,
                        "Put_Sim": 13.155713090514496,
                        "Put_Chg": 92.20309485358307
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 515.0288415039067,
                        "Call_Sim": 396.3205211580689,
                        "Call_Chg": -23.04886848651123,
                        "Put_Now": 59.87965839414983,
                        "Put_Sim": 94.17133804831224,
                        "Put_Chg": 57.267660794659214
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 442.38632395137074,
                        "Call_Sim": 332.6570675690873,
                        "Call_Chg": -24.803944073629502,
                        "Put_Now": 83.19415717941843,
                        "Put_Sim": 126.46490079713521,
                        "Put_Chg": 52.011757898331865
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 408.2101367928112,
                        "Call_Sim": 303.28529176547545,
                        "Call_Chg": -25.703635351071846,
                        "Put_Now": 96.99647818976177,
                        "Put_Sim": 145.07163316242531,
                        "Put_Chg": 49.56381496512726
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 375.54860177600904,
                        "Call_Sim": 275.5938380468119,
                        "Call_Chg": -26.615666589224528,
                        "Put_Now": 112.31345134186131,
                        "Put_Sim": 165.3586876126642,
                        "Put_Chg": 47.22963780121317
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 344.45191536337416,
                        "Call_Sim": 249.59598628438016,
                        "Call_Chg": -27.53822082217984,
                        "Put_Now": 129.19527309812838,
                        "Put_Sim": 187.33934401913484,
                        "Put_Chg": 45.0047974099207
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 314.9586068835538,
                        "Call_Sim": 225.29144477774526,
                        "Call_Chg": -28.469506832356608,
                        "Put_Now": 147.68047278721065,
                        "Put_Sim": 211.0133106814028,
                        "Put_Chg": 42.88504546260965
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 287.0949853064981,
                        "Call_Sim": 202.6667387140319,
                        "Call_Chg": -29.407774748253406,
                        "Put_Now": 167.79535937905712,
                        "Put_Sim": 236.3671127865914,
                        "Put_Chg": 40.86629908079142
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 260.87488098015865,
                        "Call_Sim": 181.69588679946082,
                        "Call_Chg": -30.35132929748033,
                        "Put_Now": 189.55376322162056,
                        "Put_Sim": 263.37476904092273,
                        "Put_Chg": 38.944626877701644
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 248.38205999210413,
                        "Call_Sim": 171.81934076795233,
                        "Call_Chg": -30.82457695478718,
                        "Put_Now": 201.05019631801724,
                        "Put_Sim": 277.487477093865,
                        "Put_Chg": 38.01900330151419
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 236.2996786038011,
                        "Call_Sim": 162.34132741100575,
                        "Call_Chg": -31.2985407469808,
                        "Put_Now": 212.95706901416543,
                        "Put_Sim": 291.99871782137006,
                        "Put_Chg": 37.1162362316073
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 941.7789584810225,
                        "Call_Sim": 293.52094197272436,
                        "Call_Chg": -68.83335103959651,
                        "Put_Now": 6.844693682240802,
                        "Put_Sim": 111.58667717394269,
                        "Put_Chg": 1530.2654633539667
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 515.0288415039067,
                        "Call_Sim": 84.53340643896581,
                        "Call_Chg": -83.58666551719229,
                        "Put_Now": 59.87965839414983,
                        "Put_Sim": 382.38422332920845,
                        "Put_Chg": 538.5878503384498
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 442.38632395137074,
                        "Call_Sim": 62.55426333020387,
                        "Call_Chg": -85.85981077094053,
                        "Put_Now": 83.19415717941843,
                        "Put_Sim": 456.36209655825087,
                        "Put_Chg": 448.55065791946174
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 408.2101367928112,
                        "Call_Sim": 53.46725804505104,
                        "Call_Chg": -86.90202588668478,
                        "Put_Now": 96.99647818976177,
                        "Put_Sim": 495.2535994420009,
                        "Put_Chg": 410.5892592028936
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 375.54860177600904,
                        "Call_Sim": 45.50775063091862,
                        "Call_Chg": -87.8823272365527,
                        "Put_Now": 112.31345134186131,
                        "Put_Sim": 535.2726001967708,
                        "Put_Chg": 376.5881502185346
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 344.45191536337416,
                        "Call_Sim": 38.5716428202029,
                        "Call_Chg": -88.80202399817915,
                        "Put_Now": 129.19527309812838,
                        "Put_Sim": 576.3150005549578,
                        "Put_Chg": 346.08056218684266
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 314.9586068835538,
                        "Call_Sim": 32.5579243641306,
                        "Call_Chg": -89.66279261700954,
                        "Put_Now": 147.68047278721065,
                        "Put_Sim": 618.2797902677871,
                        "Put_Chg": 318.6604895006343
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 287.0949853064981,
                        "Call_Sim": 27.369888907064137,
                        "Call_Chg": -90.46660850664303,
                        "Put_Now": 167.79535937905712,
                        "Put_Sim": 661.0702629796233,
                        "Put_Chg": 293.97410359021694
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 260.87488098015865,
                        "Call_Sim": 22.916079480195094,
                        "Call_Chg": -91.2156818647718,
                        "Put_Now": 189.55376322162056,
                        "Put_Sim": 704.5949617216565,
                        "Put_Chg": 271.7124628635652
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 248.38205999210413,
                        "Call_Sim": 20.93753879266052,
                        "Call_Chg": -91.57043033086765,
                        "Put_Now": 201.05019631801724,
                        "Put_Sim": 726.6056751185733,
                        "Put_Chg": 261.4051060011117
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 236.2996786038011,
                        "Call_Sim": 19.11097606813803,
                        "Call_Chg": -91.91239861981319,
                        "Put_Now": 212.95706901416543,
                        "Put_Sim": 748.7683664785027,
                        "Put_Chg": 251.6053117864316
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5305.53,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 941.7789584810225,
                        "Call_Sim": 992.8830498958669,
                        "Call_Chg": 5.426336079675124,
                        "Put_Now": 6.844693682240802,
                        "Put_Sim": 5.418785097086385,
                        "Put_Chg": -20.832321376982442
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 515.0288415039067,
                        "Call_Sim": 558.4894201667721,
                        "Call_Chg": 8.438474733950546,
                        "Put_Now": 59.87965839414983,
                        "Put_Sim": 50.81023705701557,
                        "Put_Chg": -15.146080622965494
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 442.38632395137074,
                        "Call_Sim": 483.1597077147949,
                        "Call_Chg": 9.216691736588617,
                        "Put_Now": 83.19415717941843,
                        "Put_Sim": 71.43754094284259,
                        "Put_Chg": -14.13154076580312
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 408.2101367928112,
                        "Call_Sim": 447.50875557599056,
                        "Call_Chg": 9.627056077523502,
                        "Put_Now": 96.99647818976177,
                        "Put_Sim": 83.76509697294091,
                        "Put_Chg": -13.641094464208567
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 375.54860177600904,
                        "Call_Sim": 413.29575802383897,
                        "Call_Chg": 10.051204043716218,
                        "Put_Now": 112.31345134186131,
                        "Put_Sim": 97.5306075896915,
                        "Put_Chg": -13.162131138837124
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 344.45191536337416,
                        "Call_Sim": 380.5807886977241,
                        "Call_Chg": 10.488800242622059,
                        "Put_Now": 129.19527309812838,
                        "Put_Sim": 112.79414643247878,
                        "Put_Chg": -12.694834936563323
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 314.9586068835538,
                        "Call_Sim": 349.4134402016384,
                        "Call_Chg": 10.93947984435404,
                        "Put_Now": 147.68047278721065,
                        "Put_Sim": 129.60530610529554,
                        "Put_Chg": -12.239374875213999
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 287.0949853064981,
                        "Call_Sim": 319.8320073077102,
                        "Call_Chg": 11.402853994911345,
                        "Put_Now": 167.79535937905712,
                        "Put_Sim": 148.0023813802702,
                        "Put_Chg": -11.795903100081391
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 260.87488098015865,
                        "Call_Sim": 291.86294274814736,
                        "Call_Chg": 11.87851496148668,
                        "Put_Now": 189.55376322162056,
                        "Put_Sim": 168.01182498960952,
                        "Put_Chg": -11.364553183164636
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 248.38205999210413,
                        "Call_Sim": 278.4880064021286,
                        "Call_Chg": 12.120821612873927,
                        "Put_Now": 201.05019631801724,
                        "Put_Sim": 178.62614272804194,
                        "Put_Chg": -11.153460180911923
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 236.2996786038011,
                        "Call_Sim": 265.5205935999129,
                        "Call_Chg": 12.366040939524892,
                        "Put_Now": 212.95706901416543,
                        "Put_Sim": 189.647984010277,
                        "Put_Chg": -10.94543849227092
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5200.47,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 941.7789584810225,
                        "Call_Sim": 891.0097169539413,
                        "Call_Chg": -5.390781039424155,
                        "Put_Now": 6.844693682240802,
                        "Put_Sim": 8.6054521551589,
                        "Put_Chg": 25.724430553942113
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 515.0288415039067,
                        "Call_Sim": 472.87271041230497,
                        "Call_Chg": -8.185198127643496,
                        "Put_Now": 59.87965839414983,
                        "Put_Sim": 70.25352730254735,
                        "Put_Chg": 17.324529208421538
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 442.38632395137074,
                        "Call_Sim": 403.12587970915456,
                        "Call_Chg": -8.874696643319353,
                        "Put_Now": 83.19415717941843,
                        "Put_Sim": 96.46371293720176,
                        "Put_Chg": 15.950105401231374
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 408.2101367928112,
                        "Call_Sim": 370.51892043987846,
                        "Call_Chg": -9.23328770056073,
                        "Put_Now": 96.99647818976177,
                        "Put_Sim": 111.8352618368283,
                        "Put_Chg": 15.298270539303758
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 375.54860177600904,
                        "Call_Sim": 339.49440194594763,
                        "Call_Chg": -9.600408484962342,
                        "Put_Now": 112.31345134186131,
                        "Put_Sim": 128.7892515117992,
                        "Put_Chg": 14.669480790674488
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 344.45191536337416,
                        "Call_Sim": 310.0910776900819,
                        "Call_Chg": -9.975510699960502,
                        "Put_Now": 129.19527309812838,
                        "Put_Sim": 147.36443542483653,
                        "Put_Chg": 14.063333658428839
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 314.9586068835538,
                        "Call_Sim": 282.33508699470394,
                        "Call_Chg": -10.358034095861804,
                        "Put_Now": 147.68047278721065,
                        "Put_Sim": 167.58695289836078,
                        "Put_Chg": 13.479426044249543
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 287.0949853064981,
                        "Call_Sim": 256.2397032189788,
                        "Call_Chg": -10.747412412856564,
                        "Put_Now": 167.79535937905712,
                        "Put_Sim": 189.47007729153847,
                        "Put_Chg": 12.917352418261588
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 260.87488098015865,
                        "Call_Sim": 231.80538751075255,
                        "Call_Chg": -11.143078766413327,
                        "Put_Now": 189.55376322162056,
                        "Put_Sim": 213.0142697522142,
                        "Put_Chg": 12.376703122039487
                    },
                    {
                        "Strike": 5425.0,
                        "Call_Now": 248.38205999210413,
                        "Call_Sim": 220.20784988064952,
                        "Call_Chg": -11.343093825838407,
                        "Put_Now": 201.05019631801724,
                        "Put_Sim": 225.40598620656192,
                        "Put_Chg": 12.114283066910897
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 236.2996786038011,
                        "Call_Sim": 209.02013206528272,
                        "Call_Chg": -11.544470436736164,
                        "Put_Now": 212.95706901416543,
                        "Put_Sim": 238.20752247564678,
                        "Put_Chg": 11.857062824151544
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
                        "Call_Now": 170.11537830866382,
                        "Call_Sim": 311.46787363445947,
                        "Call_Chg": 83.09213236990267,
                        "Put_Now": 5.996563968158625,
                        "Put_Sim": 0.3490592939537649,
                        "Put_Chg": -94.17901158384622
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 59.22387428344928,
                        "Call_Sim": 168.3848810259633,
                        "Call_Chg": 184.31925986480115,
                        "Put_Now": 44.77803599175286,
                        "Put_Sim": 6.939042734266877,
                        "Put_Chg": -84.50346787084432
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 36.116569064641226,
                        "Call_Sim": 126.19036821225745,
                        "Call_Chg": 249.39744134168075,
                        "Put_Now": 71.56172278921531,
                        "Put_Sim": 14.635521936829946,
                        "Put_Chg": -79.54839351766473
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 20.232199239013653,
                        "Call_Sim": 89.34656101048222,
                        "Call_Chg": 341.60577876376226,
                        "Put_Now": 105.56834497985574,
                        "Put_Sim": 27.682706751324986,
                        "Put_Chg": -73.77745501588822
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 10.349938188455894,
                        "Call_Sim": 59.23518458859917,
                        "Call_Chg": 472.32404203794044,
                        "Put_Now": 145.57707594556814,
                        "Put_Sim": 47.46232234571198,
                        "Put_Chg": -67.39711796144447
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 4.8135772395098115,
                        "Call_Sim": 36.4791069925991,
                        "Call_Chg": 657.8377821213467,
                        "Put_Now": 189.93170701289182,
                        "Put_Sim": 74.5972367659815,
                        "Put_Chg": -60.72417926464583
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.029037715978234,
                        "Call_Sim": 20.726368811093835,
                        "Call_Chg": 921.4876070502858,
                        "Put_Now": 237.03815950562966,
                        "Put_Sim": 108.73549060074538,
                        "Put_Chg": -54.12743212842786
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 170.11537830866382,
                        "Call_Sim": 167.41300356414558,
                        "Call_Chg": -1.5885540574791226,
                        "Put_Now": 5.996563968158625,
                        "Put_Sim": 6.29418922364016,
                        "Put_Chg": 4.963263246450899
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 59.22387428344928,
                        "Call_Sim": 57.589762794471426,
                        "Call_Chg": -2.759210721603399,
                        "Put_Now": 44.77803599175286,
                        "Put_Sim": 46.14392450277546,
                        "Put_Chg": 3.0503537745026845
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 36.116569064641226,
                        "Call_Sim": 34.93759223500433,
                        "Call_Chg": -3.2643655257695405,
                        "Put_Now": 71.56172278921531,
                        "Put_Sim": 73.38274595957819,
                        "Put_Chg": 2.544688835575818
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 20.232199239013653,
                        "Call_Sim": 19.460350229473534,
                        "Call_Chg": -3.814953581772597,
                        "Put_Now": 105.56834497985574,
                        "Put_Sim": 107.7964959703163,
                        "Put_Chg": 2.110624156214377
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 10.349938188455894,
                        "Call_Sim": 9.8943122207761,
                        "Call_Chg": -4.402209553173847,
                        "Put_Now": 145.57707594556814,
                        "Put_Sim": 148.121449977888,
                        "Put_Chg": 1.7477848183124773
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 4.8135772395098115,
                        "Call_Sim": 4.572038955856897,
                        "Call_Chg": -5.017854116276977,
                        "Put_Now": 189.93170701289182,
                        "Put_Sim": 192.6901687292393,
                        "Put_Chg": 1.4523439818082873
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.029037715978234,
                        "Call_Sim": 1.9143038189488664,
                        "Call_Chg": -5.654596566927404,
                        "Put_Now": 237.03815950562966,
                        "Put_Sim": 239.92342560860016,
                        "Put_Chg": 1.2172158731691323
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 170.11537830866382,
                        "Call_Sim": 55.944341000343684,
                        "Call_Chg": -67.11388379077867,
                        "Put_Now": 5.996563968158625,
                        "Put_Sim": 44.82552665983849,
                        "Put_Chg": 647.5201948625779
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 59.22387428344928,
                        "Call_Sim": 9.013760518934419,
                        "Call_Chg": -84.78019104965342,
                        "Put_Now": 44.77803599175286,
                        "Put_Sim": 147.56792222723743,
                        "Put_Chg": 229.55425346126447
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 36.116569064641226,
                        "Call_Sim": 4.029779383426273,
                        "Call_Chg": -88.84229735052132,
                        "Put_Now": 71.56172278921531,
                        "Put_Sim": 192.4749331080002,
                        "Put_Chg": 168.96352631830024
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 20.232199239013653,
                        "Call_Sim": 1.6223766595275038,
                        "Call_Chg": -91.98121449694365,
                        "Put_Now": 105.56834497985574,
                        "Put_Sim": 239.95852240036947,
                        "Put_Chg": 127.30158594999071
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 10.349938188455894,
                        "Call_Sim": 0.5870529972155651,
                        "Call_Chg": -94.32795649088656,
                        "Put_Now": 145.57707594556814,
                        "Put_Sim": 288.8141907543277,
                        "Put_Chg": 98.39263076167053
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 4.8135772395098115,
                        "Call_Sim": 0.19074290643465375,
                        "Call_Chg": -96.03739803177899,
                        "Put_Now": 189.93170701289182,
                        "Put_Sim": 338.3088726798169,
                        "Put_Chg": 78.12132476482918
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.029037715978234,
                        "Call_Sim": 0.055640796504378365,
                        "Call_Chg": -97.25777416229285,
                        "Put_Now": 237.03815950562966,
                        "Put_Sim": 388.06476258615567,
                        "Put_Chg": 63.714046462185394
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5305.53,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 170.11537830866382,
                        "Call_Sim": 219.06339162426775,
                        "Call_Chg": 28.77342060562614,
                        "Put_Now": 5.996563968158625,
                        "Put_Sim": 2.4145772837622417,
                        "Put_Chg": -59.733986052954755
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 59.22387428344928,
                        "Call_Sim": 92.15121587320755,
                        "Call_Chg": 55.598087744421946,
                        "Put_Now": 44.77803599175286,
                        "Put_Sim": 25.17537758151093,
                        "Put_Chg": -43.77739660991901
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 36.116569064641226,
                        "Call_Sim": 61.17136087243489,
                        "Call_Chg": 69.3720152735182,
                        "Put_Now": 71.56172278921531,
                        "Put_Sim": 44.08651459700923,
                        "Put_Chg": -38.39372100240539
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 20.232199239013653,
                        "Call_Sim": 37.65209163751524,
                        "Call_Chg": 86.09984605584,
                        "Put_Now": 105.56834497985574,
                        "Put_Sim": 70.45823737835826,
                        "Put_Chg": -33.25817754194886
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 10.349938188455894,
                        "Call_Sim": 21.33303879750406,
                        "Call_Chg": 106.11754784486043,
                        "Put_Now": 145.57707594556814,
                        "Put_Sim": 104.0301765546169,
                        "Put_Chg": -28.53945177912888
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 4.8135772395098115,
                        "Call_Sim": 11.06124625105167,
                        "Call_Chg": 129.79264070515023,
                        "Put_Now": 189.93170701289182,
                        "Put_Sim": 143.64937602443297,
                        "Put_Chg": -24.367880285158176
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.029037715978234,
                        "Call_Sim": 5.225556453023842,
                        "Call_Chg": 157.53865548549015,
                        "Put_Now": 237.03815950562966,
                        "Put_Sim": 187.70467824267598,
                        "Put_Chg": -20.81246385216808
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5200.47,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 170.11537830866382,
                        "Call_Sim": 124.86142584039226,
                        "Call_Chg": -26.601917426983622,
                        "Put_Now": 5.996563968158625,
                        "Put_Sim": 13.272611499886352,
                        "Put_Chg": 121.3369451299624
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 59.22387428344928,
                        "Call_Sim": 34.6073325118175,
                        "Call_Chg": -41.56523373296286,
                        "Put_Now": 44.77803599175286,
                        "Put_Sim": 72.69149422012106,
                        "Put_Chg": 62.337388431929554
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 36.116569064641226,
                        "Call_Sim": 19.160947481716676,
                        "Call_Chg": -46.94693328310748,
                        "Put_Now": 71.56172278921531,
                        "Put_Sim": 107.13610120628937,
                        "Put_Chg": 49.71146170119214
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 20.232199239013653,
                        "Call_Sim": 9.666392203408577,
                        "Call_Chg": -52.22273125519188,
                        "Put_Now": 105.56834497985574,
                        "Put_Sim": 147.5325379442511,
                        "Put_Chg": 39.750734912442596
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 10.349938188455894,
                        "Call_Sim": 4.423610871357084,
                        "Call_Chg": -57.25954309281684,
                        "Put_Now": 145.57707594556814,
                        "Put_Sim": 192.1807486284688,
                        "Put_Chg": 32.01305726206917
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 4.8135772395098115,
                        "Call_Sim": 1.8306979983901783,
                        "Call_Chg": -61.96803526151361,
                        "Put_Now": 189.93170701289182,
                        "Put_Sim": 239.47882777177165,
                        "Put_Chg": 26.086808536668794
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.029037715978234,
                        "Call_Sim": 0.6838297634648427,
                        "Call_Chg": -66.29782886341485,
                        "Put_Now": 237.03815950562966,
                        "Put_Sim": 288.2229515531153,
                        "Put_Chg": 21.59348189094845
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.000114350976103552,
            -0.12238749215373768,
            -0.17694870347887182,
            -0.0016454510980340744,
            -0.0016095830828053784,
            0.17673391252016957,
            0.1904956733025973,
            0.3501441922386648,
            0.5662365047974842,
            0.010014064543294437,
            0.28084688143206216,
            0.4026097856589304,
            0.19744056782012992,
            0.005664408147635887,
            0.17882695085219696,
            0.039070910514330134
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
            -0.3320188076994962,
            -1358.448293895574,
            -1387.9175832230212,
            -56.903528931321425,
            -601.144160009043,
            -1781.7689621329132,
            629.9482485961271,
            704.7628911237657,
            753.6991740798641,
            53.596499467744756,
            263.19914541873095,
            400.16962074763205,
            505.1402752027791,
            42.957802221895946,
            -5466.383062866114,
            134.47422531694974
        ],
        "delta_cumulative": [
            -0.3320188076994962,
            -1358.7803127032735,
            -2746.6978959262947,
            -2803.601424857616,
            -3404.745584866659,
            -5186.514546999572,
            -4556.566298403445,
            -3851.8034072796795,
            -3098.1042331998156,
            -3044.507733732071,
            -2781.30858831334,
            -2381.138967565708,
            -1875.9986923629288,
            -1833.0408901410328,
            -7299.423953007147,
            -7164.9497276901975
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
            4149.509857482453,
            16170265.153071309,
            31664961.14654036,
            457883.04030629643,
            5896411.592579605,
            31690791.27946514,
            12377133.916406775,
            17767768.601774212,
            23480134.42422134,
            511473.73892928084,
            9835758.129484009,
            12302878.972567005,
            7197611.95500617,
            190675.8080295003,
            14411761.90022451,
            1008219.3621171225
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            173617.15271403192,
            46168.4609694443,
            12377133.916406775,
            17767768.601774212,
            23480134.42422134,
            511473.73892928084,
            9835758.129484009,
            12302878.972567005,
            7197611.95500617,
            190675.8080295003,
            6127650.194698893,
            1008219.3621171225
        ],
        "gamma_put": [
            4149.509857482453,
            16170265.153071309,
            31664961.14654036,
            457883.04030629643,
            5722794.439865573,
            31644622.818495695,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            8284111.705525618,
            0.0
        ],
        "gamma_exposure": [
            4149.509857482453,
            16174414.662928792,
            47839375.80946915,
            48297258.84977545,
            54193670.44235505,
            85884461.72182019,
            98261595.63822697,
            116029364.24000119,
            139509498.66422254,
            140020972.4031518,
            149856730.5326358,
            162159609.5052028,
            169357221.46020898,
            169547897.26823848,
            183959659.168463,
            184967878.5305801
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
            "days_to_exp": 11,
            "abs_call": 75357804.30931503,
            "abs_put": 47654592.901283346,
            "net": 123012397.21059835
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 33,
            "abs_call": 6236052.352328637,
            "abs_put": 15551696.94437569,
            "net": 21787749.296704326
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 54,
            "abs_call": 511473.73892928084,
            "abs_put": 0.0,
            "net": 511473.73892928084
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 76,
            "abs_call": 0.0,
            "abs_put": 21865302.991461746,
            "net": 21865302.991461746
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 99,
            "abs_call": 0.0,
            "abs_put": 457883.04030629643,
            "net": 457883.04030629643
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 120,
            "abs_call": 46168.4609694443,
            "abs_put": 0.0,
            "net": 46168.4609694443
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 142,
            "abs_call": 6127650.194698893,
            "abs_put": 8284111.705525618,
            "net": 14411761.90022451
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 164,
            "abs_call": 0.0,
            "abs_put": 31906.111332617373,
            "net": 31906.111332617373
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 185,
            "abs_call": 961559.6026775336,
            "abs_put": 0.0,
            "net": 961559.6026775336
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 208,
            "abs_call": 1008219.3621171225,
            "abs_put": 0.0,
            "net": 1008219.3621171225
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 229,
            "abs_call": 0.0,
            "abs_put": 103294.11937701929,
            "net": 103294.11937701929
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 249,
            "abs_call": 770162.6958818557,
            "abs_put": 0.0,
            "net": 770162.6958818557
        }
    ],
    "oi_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 11,
            "call_oi": 19290.0,
            "put_oi": 8565.0,
            "total_oi": 27855.0
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 33,
            "call_oi": 3200.0,
            "put_oi": 4850.0,
            "total_oi": 8050.0
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 54,
            "call_oi": 150.0,
            "put_oi": 0.0,
            "total_oi": 150.0
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 76,
            "call_oi": 0.0,
            "put_oi": 10925.0,
            "total_oi": 10925.0
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 99,
            "call_oi": 0.0,
            "put_oi": 200.0,
            "total_oi": 200.0
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 120,
            "call_oi": 20.0,
            "put_oi": 0.0,
            "total_oi": 20.0
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 142,
            "call_oi": 5200.0,
            "put_oi": 7030.0,
            "total_oi": 12230.0
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 164,
            "call_oi": 0.0,
            "put_oi": 30.0,
            "total_oi": 30.0
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 185,
            "call_oi": 500.0,
            "put_oi": 0.0,
            "total_oi": 500.0
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 208,
            "call_oi": 1000.0,
            "put_oi": 0.0,
            "total_oi": 1000.0
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 229,
            "call_oi": 0.0,
            "put_oi": 65.0,
            "total_oi": 65.0
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 249,
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
            "days_to_exp": 14,
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
            "days_to_exp": 44,
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
            "days_to_exp": 75,
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
            "days_to_exp": 138,
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
            "days_to_exp": 167,
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
            "days_to_exp": 197,
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
            "days_to_exp": 229,
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
            "days_to_exp": 258,
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
            "days_to_exp": 289,
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
            "days_to_exp": 320,
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
            "days_to_exp": 348,
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
            -0.750052314770393,
            -1725.3382338549306,
            -12630.080737050554,
            3.0112314663786055,
            142.28970562987288,
            1392.732491165713,
            3243.6245723438687,
            8485.66159357607,
            16203.665585212617,
            106.06195818938772,
            8848.603834555732,
            13208.85026953713,
            3539.770500501399,
            29.981538104162038,
            4221.799994576742,
            259.91609646019674
        ],
        "vanna": [
            -12.732327787542602,
            -17057.42260113118,
            -17819.476996066223,
            -285.8639724278089,
            -2415.4291261461976,
            -1403.7635499513801,
            1481.5024955108652,
            4954.749272978023,
            10215.024914797346,
            200.15738608024387,
            5787.601085125458,
            8831.177883345601,
            6660.37415455752,
            183.37510200520592,
            26453.269531037426,
            2217.5399970314566
        ],
        "vex": [
            3353.4742885239425,
            6055988.835507044,
            3402418.7629706645,
            223379.89613355807,
            2368335.2862800276,
            1853593.3241700218,
            670914.390624149,
            963118.9033519756,
            1272763.160307866,
            136104.17026302405,
            533156.6836343188,
            1142901.391911707,
            1890695.1817812375,
            233964.12771622365,
            10084625.036741966,
            1033410.0973610962
        ],
        "theta": [
            -0.8497468160265378,
            -3244.234492854161,
            -7746.22877010562,
            -71.19739418288125,
            -1048.6478703770426,
            -7334.752640430641,
            -4249.853017962834,
            -5898.284034062748,
            -7613.750178976246,
            -202.80697491900324,
            -3135.7716579176144,
            -3985.1714563292703,
            -2601.6701295380235,
            -96.95180863787577,
            2379.123949835953,
            -426.530361092907
        ],
        "charm_cum": [
            -0.750052314770393,
            -1726.088286169701,
            -14356.169023220255,
            -14353.157791753876,
            -14210.868086124003,
            -12818.13559495829,
            -9574.51102261442,
            -1088.8494290383514,
            15114.816156174265,
            15220.878114363653,
            24069.481948919383,
            37278.33221845651,
            40818.10271895791,
            40848.08425706207,
            45069.88425163882,
            45329.800348099016
        ],
        "vanna_cum": [
            -12.732327787542602,
            -17070.154928918724,
            -34889.63192498495,
            -35175.49589741276,
            -37590.92502355896,
            -38994.688573510335,
            -37513.18607799947,
            -32558.436805021443,
            -22343.411890224095,
            -22143.25450414385,
            -16355.653419018392,
            -7524.475535672791,
            -864.1013811152707,
            -680.7262791100648,
            25772.54325192736,
            27990.083248958817
        ],
        "theta_cum": [
            -0.8497468160265378,
            -3245.084239670188,
            -10991.313009775808,
            -11062.51040395869,
            -12111.158274335732,
            -19445.910914766373,
            -23695.763932729205,
            -29594.047966791954,
            -37207.7981457682,
            -37410.60512068721,
            -40546.37677860482,
            -44531.54823493409,
            -47133.218364472115,
            -47230.17017310999,
            -44851.04622327404,
            -45277.57658436694
        ],
        "r_gamma": [
            4149.509857482453,
            16170265.153071309,
            31664961.14654036,
            457883.04030629643,
            5896411.592579605,
            31690791.27946514,
            -12377133.916406775,
            -17767768.601774212,
            -23480134.42422134,
            -511473.73892928084,
            -9835758.129484009,
            -12302878.972567005,
            -7197611.95500617,
            -190675.8080295003,
            -14411761.900224512,
            -1008219.3621171225
        ],
        "r_gamma_cum": [
            4149.509857482453,
            16174414.662928792,
            47839375.80946915,
            48297258.84977545,
            54193670.44235505,
            85884461.72182019,
            73507327.80541341,
            55739559.203639194,
            32259424.779417854,
            31747951.040488575,
            21912192.911004566,
            9609313.93843756,
            2411701.9834313905,
            2221026.17540189,
            -12190735.724822622,
            -13198955.086939745
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.3320188076994962,
            "gamma": 4149.509857482453,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -1358.448293895574,
            "gamma": 16170265.153071309,
            "volume": 160,
            "oi": 8900,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -1387.9175832230212,
            "gamma": 31664961.14654036,
            "volume": 305,
            "oi": 9480,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -56.903528931321425,
            "gamma": 457883.04030629643,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -601.144160009043,
            "gamma": 5896411.592579605,
            "volume": 215,
            "oi": 2160,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -1781.7689621329132,
            "gamma": 31690791.27946514,
            "volume": 115,
            "oi": 4020,
            "iv": 11.82
        },
        {
            "strike": 5300.0,
            "delta": 629.9482485961271,
            "gamma": 12377133.916406775,
            "volume": 25,
            "oi": 1585,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": 704.7628911237657,
            "gamma": 17767768.601774212,
            "volume": 100,
            "oi": 2700,
            "iv": 11.82
        },
        {
            "strike": 5400.0,
            "delta": 753.6991740798641,
            "gamma": 23480134.42422134,
            "volume": 3905,
            "oi": 4875,
            "iv": 11.82
        },
        {
            "strike": 5425.0,
            "delta": 53.596499467744756,
            "gamma": 511473.73892928084,
            "volume": 150,
            "oi": 150,
            "iv": 11.82
        },
        {
            "strike": 5450.0,
            "delta": 263.19914541873095,
            "gamma": 9835758.129484009,
            "volume": 5700,
            "oi": 3200,
            "iv": 11.82
        },
        {
            "strike": 5500.0,
            "delta": 400.16962074763205,
            "gamma": 12302878.972567005,
            "volume": 9740,
            "oi": 7170,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 505.1402752027791,
            "gamma": 7197611.95500617,
            "volume": 2500,
            "oi": 3700,
            "iv": 11.82
        },
        {
            "strike": 5800.0,
            "delta": 42.957802221895946,
            "gamma": 190675.8080295003,
            "volume": 120,
            "oi": 120,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5466.383062866114,
            "gamma": 14411761.90022451,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 134.47422531694974,
            "gamma": 1008219.3621171225,
            "volume": 500,
            "oi": 1000,
            "iv": 11.82
        }
    ]
};