window.marketData = {
    "last_updated": "2026-03-13 08:41:49",
    "spot_price": 5253.328,
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-03-13",
        "meetings": [
            {
                "date": "2026-03-18",
                "days_remaining": 4,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 3.4,
                    "3.50-3.75": 99.6,
                    "3.75-4.00": 0.4
                }
            },
            {
                "date": "2026-04-29",
                "days_remaining": 46,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.3,
                    "3.25-3.50": 6.4,
                    "3.50-3.75": 93.2,
                    "3.75-4.00": 0.4
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 95,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 1.3,
                    "3.25-3.50": 24.2,
                    "3.50-3.75": 74.2,
                    "3.75-4.00": 0.3
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 137,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.2,
                    "3.00-3.25": 4.9,
                    "3.25-3.50": 31.9,
                    "3.50-3.75": 62.7,
                    "3.75-4.00": 0.3
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 186,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.8,
                    "3.00-3.25": 8.3,
                    "3.25-3.50": 35.9,
                    "3.50-3.75": 54.7,
                    "3.75-4.00": 0.2
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 228,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.1,
                    "2.75-3.00": 1.5,
                    "3.00-3.25": 10.9,
                    "3.25-3.50": 37.6,
                    "3.50-3.75": 49.7,
                    "3.75-4.00": 0.2
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 270,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.4,
                    "2.75-3.00": 3.6,
                    "3.00-3.25": 16.7,
                    "3.25-3.50": 40.3,
                    "3.50-3.75": 38.8,
                    "3.75-4.00": 0.2
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 13/03/2026 08:41\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(2);\n  spot(5253.33);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 4500.00;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (4500.00)\n  // 2 = Spline (4940.92)\n  // 3 = HVL (4500.00)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (4500.00)\n  // 7 = HVL Gaussian (4500.00)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 4500.00;\n  if (ModeloFlip = 2) then GammaVal := 4940.92;\n  if (ModeloFlip = 3) then GammaVal := 4500.00;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 4500.00;\n  if (ModeloFlip = 7) then GammaVal := 4500.00;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5214.21 <= LimitUpper) and (5214.21 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5214.21, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5292.44 <= LimitUpper) and (5292.44 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5292.44, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5441.31 <= LimitUpper) and (5441.31 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5441.31, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5450.00 <= LimitUpper) and (5450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5550.00 <= LimitUpper) and (5550.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5550.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5879.43 <= LimitUpper) and (5879.43 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5879.43, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirMaxPain) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5572.45 > 0) then\n      HorizontalLineCustom(5572.45, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5275.00 <= LimitUpper) and (5275.00 >= LimitLower) then\n      HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5400.00 <= LimitUpper) and (5400.00 >= LimitLower) then\n      HorizontalLineCustom(5400.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5500.00 <= LimitUpper) and (5500.00 >= LimitLower) then\n      HorizontalLineCustom(5500.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5575.00 <= LimitUpper) and (5575.00 >= LimitLower) then\n      HorizontalLineCustom(5575.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5800.00 <= LimitUpper) and (5800.00 >= LimitLower) then\n      HorizontalLineCustom(5800.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5411.80 <= LimitUpper) and (5411.80 >= LimitLower) then\n      HorizontalLineCustom(5411.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5488.20 <= LimitUpper) and (5488.20 >= LimitLower) then\n      HorizontalLineCustom(5488.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5511.80 <= LimitUpper) and (5511.80 >= LimitLower) then\n      HorizontalLineCustom(5511.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5569.10 <= LimitUpper) and (5569.10 >= LimitLower) then\n      HorizontalLineCustom(5569.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5580.90 <= LimitUpper) and (5580.90 >= LimitLower) then\n      HorizontalLineCustom(5580.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5752.80 <= LimitUpper) and (5752.80 >= LimitLower) then\n      HorizontalLineCustom(5752.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5847.20 <= LimitUpper) and (5847.20 >= LimitLower) then\n      HorizontalLineCustom(5847.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5261.80 <= LimitUpper) and (5261.80 >= LimitLower) then\n      HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5373.60 <= LimitUpper) and (5373.60 >= LimitLower) then\n      HorizontalLineCustom(5373.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5426.40 <= LimitUpper) and (5426.40 >= LimitLower) then\n      HorizontalLineCustom(5426.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5473.60 <= LimitUpper) and (5473.60 >= LimitLower) then\n      HorizontalLineCustom(5473.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5526.40 <= LimitUpper) and (5526.40 >= LimitLower) then\n      HorizontalLineCustom(5526.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5588.20 <= LimitUpper) and (5588.20 >= LimitLower) then\n      HorizontalLineCustom(5588.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5694.40 <= LimitUpper) and (5694.40 >= LimitLower) then\n      HorizontalLineCustom(5694.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5905.60 <= LimitUpper) and (5905.60 >= LimitLower) then\n      HorizontalLineCustom(5905.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5261.21, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5245.45, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5269.09, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5237.57, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5283.72, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5222.93, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5291.60, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5215.05, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 37588,
        "total_volume": 3645,
        "gamma_exposure": 100726854.34363647,
        "delta_position": -8611.2893101952,
        "last_update": "2026-03-13T08:41:49.559152",
        "spot_price": 5253.328,
        "dealer_pressure": 0.09020684421665426,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 4500.0,
        "call_wall": 5300.0,
        "put_wall": 5250.0,
        "effective_call_wall": 5879.42942942943,
        "effective_put_wall": 5441.305712492153,
        "max_pain": 6000.0,
        "zero_gamma": 4500.0,
        "range_low": 5214.212244423427,
        "range_high": 5292.4437555765735,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5292.4437555765735,
                "sigma_1_down": 5214.212244423427,
                "sigma_2_up": 5331.559511153147,
                "sigma_2_down": 5175.096488846854
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5340.793488460484,
                "sigma_1_down": 5165.862511539517,
                "sigma_2_up": 5428.258976920968,
                "sigma_2_down": 5078.397023079033
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 210,
                "sigma_1_up": 5820.16915077198,
                "sigma_1_down": 4686.486849228021,
                "sigma_2_up": 6387.01030154396,
                "sigma_2_down": 4119.645698456041
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
                4465.3288,
                4497.492032653062,
                4529.655265306123,
                4561.818497959184,
                4593.981730612245,
                4626.144963265307,
                4658.308195918367,
                4690.471428571429,
                4722.63466122449,
                4754.797893877551,
                4786.961126530612,
                4819.124359183674,
                4851.2875918367345,
                4883.450824489796,
                4915.614057142857,
                4947.7772897959185,
                4979.94052244898,
                5012.103755102041,
                5044.266987755102,
                5076.430220408163,
                5108.593453061225,
                5140.756685714286,
                5172.919918367347,
                5205.083151020408,
                5237.24638367347,
                5269.40961632653,
                5301.572848979592,
                5333.736081632653,
                5365.899314285714,
                5398.062546938775,
                5430.225779591837,
                5462.3890122448975,
                5494.552244897959,
                5526.715477551021,
                5558.8787102040815,
                5591.041942857142,
                5623.205175510204,
                5655.3684081632655,
                5687.531640816326,
                5719.694873469388,
                5751.858106122449,
                5784.02133877551,
                5816.184571428571,
                5848.347804081633,
                5880.511036734693,
                5912.674269387755,
                5944.837502040817,
                5977.000734693877,
                6009.163967346938,
                6041.3272
            ],
            "deltas": [
                -26341.13885580022,
                -26156.14740205401,
                -25940.186402903742,
                -25690.175150587333,
                -25403.053234608873,
                -25075.846970945215,
                -24705.75821686577,
                -24290.27505500513,
                -23827.294212845634,
                -23315.231176313224,
                -22753.07823900374,
                -22140.359355304015,
                -21476.93390272309,
                -20762.631365980105,
                -19996.762829364077,
                -19177.64571914681,
                -18302.36572848853,
                -17367.03452211714,
                -16367.73284563415,
                -15302.136205364433,
                -14171.544048610149,
                -12982.77517286842,
                -11749.279410849043,
                -10490.93736098314,
                -9232.368729064417,
                -8000.029324585371,
                -6818.768231061649,
                -5708.683521004704,
                -4682.99756447502,
                -3747.33290900633,
                -2900.351874801909,
                -2135.3827684574026,
                -1442.4917933228767,
                -810.4857923098706,
                -228.48988472469392,
                313.05081054807886,
                821.9200091285225,
                1304.0974151260632,
                1763.9781270424774,
                2204.6973967286744,
                2628.4585211467106,
                3036.808999134855,
                3430.84700979637,
                3811.362805754208,
                4178.929624451219,
                4533.960372679367,
                4876.7437130076705,
                5207.469191217071,
                5526.2473116541305,
                5833.127636209154
            ],
            "flip_value": 5572.4492015548185
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                0.0,
                200.0,
                150.0,
                225.0,
                0.0,
                450.0,
                450.0,
                500.0,
                30.0,
                500.0
            ],
            "bear": [
                -15.0,
                -160.0,
                -380.0,
                -200.0,
                -95.0,
                -70.0,
                -60.0,
                -130.0,
                -0.0,
                -0.0,
                -0.0,
                -30.0,
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4465.3288,
                4497.492032653062,
                4529.655265306123,
                4561.818497959184,
                4593.981730612245,
                4626.144963265307,
                4658.308195918367,
                4690.471428571429,
                4722.63466122449,
                4754.797893877551,
                4786.961126530612,
                4819.124359183674,
                4851.2875918367345,
                4883.450824489796,
                4915.614057142857,
                4947.7772897959185,
                4979.94052244898,
                5012.103755102041,
                5044.266987755102,
                5076.430220408163,
                5108.593453061225,
                5140.756685714286,
                5172.919918367347,
                5205.083151020408,
                5237.24638367347,
                5269.40961632653,
                5301.572848979592,
                5333.736081632653,
                5365.899314285714,
                5398.062546938775,
                5430.225779591837,
                5462.3890122448975,
                5494.552244897959,
                5526.715477551021,
                5558.8787102040815,
                5591.041942857142,
                5623.205175510204,
                5655.3684081632655,
                5687.531640816326,
                5719.694873469388,
                5751.858106122449,
                5784.02133877551,
                5816.184571428571,
                5848.347804081633,
                5880.511036734693,
                5912.674269387755,
                5944.837502040817,
                5977.000734693877,
                6009.163967346938,
                6041.3272
            ],
            "pnl": [
                -16956699.05787876,
                -16035329.152750887,
                -15129639.624232095,
                -14240372.154917844,
                -13368237.70302895,
                -12513911.871003136,
                -11678030.726322465,
                -10861187.121137738,
                -10063927.544854335,
                -9286749.531286148,
                -8530099.629657103,
                -7794371.936981518,
                -7079907.178498914,
                -6386992.3131248355,
                -5715860.632508285,
                -5066692.315388279,
                -4439615.393597214,
                -3834707.0822768454,
                -3251995.424624741,
                -2691461.2006845623,
                -2153040.0502154212,
                -1636624.7613661904,
                -1142067.6795686083,
                -669183.1945549296,
                -217750.2675098963,
                212485.03510981984,
                621807.0297987582,
                1010527.9501554519,
                1378985.546117559,
                1727540.7629125193,
                2056575.510164732,
                2366490.5278115366,
                2657703.3521604557,
                2930646.382599051,
                3185765.047166012,
                3423516.0633993614,
                3644365.7895755386,
                3848788.6606085487,
                4037265.7024438167,
                4210283.1187068075,
                4368330.943593681,
                4511901.755461541,
                4641489.446229447,
                4757588.042483432,
                4860690.57503296,
                4951287.9945489345,
                5029868.131778691,
                5096914.701649012,
                5152906.351303617,
                5198315.752756718
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
                5450.0,
                5550.0,
                5600.0,
                6000.0,
                6200.0
            ],
            "loss": [
                22585050.0,
                9001050.0,
                7174250.0,
                6505000.0,
                5845750.0,
                5313500.0,
                4985000.0,
                4716250.0,
                4191750.0,
                3813250.0,
                3647000.0,
                2517000.0,
                4398000.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5300.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 943.9298633298831,
                        "Call_Sim": 989.3072354878377,
                        "Call_Chg": 4.807282184915489,
                        "Put_Now": 6.954420321004108,
                        "Put_Sim": 5.6597924789595595,
                        "Put_Chg": -18.615898698766376
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 517.5124352602575,
                        "Call_Sim": 556.0690352204579,
                        "Call_Chg": 7.450371688326726,
                        "Put_Now": 60.13172080594802,
                        "Put_Sim": 52.0163207661484,
                        "Put_Chg": -13.496038249078143
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 444.88611309582166,
                        "Call_Sim": 481.05758479143697,
                        "Call_Chg": 8.130501409430266,
                        "Put_Now": 83.42434435242649,
                        "Put_Sim": 72.923816048042,
                        "Put_Chg": -12.586887419845894
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 410.70600491552705,
                        "Call_Sim": 445.5698669405683,
                        "Call_Chg": 8.48876364303755,
                        "Put_Now": 97.20370902758805,
                        "Put_Sim": 85.3955710526293,
                        "Put_Chg": -12.147826552181671
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 378.03173235229497,
                        "Call_Sim": 411.5208035905248,
                        "Call_Chg": 8.858798976965437,
                        "Put_Now": 112.48890931981259,
                        "Put_Sim": 99.30598055804239,
                        "Put_Chg": -11.719314234161837
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 346.91309495346695,
                        "Call_Sim": 378.96890616802057,
                        "Call_Chg": 9.24030014458042,
                        "Put_Now": 129.32974477644188,
                        "Put_Sim": 114.71355599099638,
                        "Put_Chg": -11.301490473603657
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 317.3884097092914,
                        "Call_Sim": 347.9622290545899,
                        "Call_Chg": 9.632935044257684,
                        "Put_Now": 147.76453238772342,
                        "Put_Sim": 131.6663517330221,
                        "Put_Chg": -10.8944821836277
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 289.4839660146072,
                        "Call_Sim": 318.537594295462,
                        "Call_Chg": 10.036351470806084,
                        "Put_Now": 167.81956154849604,
                        "Put_Sim": 150.2011898293506,
                        "Put_Chg": -10.498401709894907
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 238.57956270141267,
                        "Call_Sim": 264.52281452555553,
                        "Call_Chg": 10.874046179978704,
                        "Put_Now": 212.83410394621524,
                        "Put_Sim": 192.10535577035898,
                        "Put_Chg": -9.739392226865371
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 943.9298633298831,
                        "Call_Sim": 940.7037880004436,
                        "Call_Chg": -0.3417706605932477,
                        "Put_Now": 6.954420321004108,
                        "Put_Sim": 7.056344991564856,
                        "Put_Chg": 1.465609869062851
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 517.5124352602575,
                        "Call_Sim": 514.8012335337462,
                        "Call_Chg": -0.5238911264321208,
                        "Put_Now": 60.13172080594802,
                        "Put_Sim": 60.74851907943696,
                        "Put_Chg": 1.0257452559513773
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 444.88611309582166,
                        "Call_Sim": 442.35126974415925,
                        "Call_Chg": -0.569773539125155,
                        "Put_Now": 83.42434435242649,
                        "Put_Sim": 84.21750100076451,
                        "Put_Chg": 0.9507496336888583
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 410.70600491552705,
                        "Call_Sim": 408.2672800637315,
                        "Call_Chg": -0.5937884575846735,
                        "Put_Now": 97.20370902758805,
                        "Put_Sim": 98.09298417579316,
                        "Put_Chg": 0.9148572180025806
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 378.03173235229497,
                        "Call_Sim": 375.6936687869311,
                        "Call_Chg": -0.6184834142931145,
                        "Put_Now": 112.48890931981259,
                        "Put_Sim": 113.47884575444891,
                        "Put_Chg": 0.880030254202103
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 346.91309495346695,
                        "Call_Sim": 344.67956651633904,
                        "Call_Chg": -0.6438293825223027,
                        "Put_Now": 129.32974477644188,
                        "Put_Sim": 130.42421633931463,
                        "Put_Chg": 0.8462643800655707
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 317.3884097092914,
                        "Call_Sim": 315.26255472564435,
                        "Call_Chg": -0.6697960349573615,
                        "Put_Now": 147.76453238772342,
                        "Put_Sim": 148.96667740407588,
                        "Put_Chg": 0.813554509277043
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 289.4839660146072,
                        "Call_Sim": 287.4681383295833,
                        "Call_Chg": -0.6963521029424247,
                        "Put_Now": 167.81956154849604,
                        "Put_Sim": 169.13173386347262,
                        "Put_Chg": 0.7818947343616975
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 238.57956270141267,
                        "Call_Sim": 236.78758045143695,
                        "Call_Chg": -0.7511046753901636,
                        "Put_Now": 212.83410394621524,
                        "Put_Sim": 214.37012169623995,
                        "Put_Chg": 0.7216971911667291
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 943.9298633298831,
                        "Call_Sim": 295.4396284425766,
                        "Call_Chg": -68.70110376629468,
                        "Put_Now": 6.954420321004108,
                        "Put_Sim": 111.79218543369802,
                        "Put_Chg": 1507.498256843311
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 517.5124352602575,
                        "Call_Sim": 85.82513887022833,
                        "Call_Chg": -83.41583061147762,
                        "Put_Now": 60.13172080594802,
                        "Put_Sim": 381.772424415919,
                        "Put_Chg": 534.8935624974754
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 444.88611309582166,
                        "Call_Sim": 63.659801331925564,
                        "Call_Chg": -85.69076456692767,
                        "Put_Now": 83.42434435242649,
                        "Put_Sim": 455.52603258853014,
                        "Put_Chg": 446.0348967972209
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 410.70600491552705,
                        "Call_Sim": 54.48047905961846,
                        "Call_Chg": -86.73492025741774,
                        "Put_Now": 97.20370902758805,
                        "Put_Sim": 494.30618317168,
                        "Put_Chg": 408.5260512347195
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 378.03173235229497,
                        "Call_Sim": 46.43068438480691,
                        "Call_Chg": -87.71778123072026,
                        "Put_Now": 112.48890931981259,
                        "Put_Sim": 534.2158613523247,
                        "Put_Chg": 374.90536141080145
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 346.91309495346695,
                        "Call_Sim": 39.40727294295323,
                        "Call_Chg": -88.64059226468834,
                        "Put_Now": 129.32974477644188,
                        "Put_Sim": 575.1519227659292,
                        "Put_Chg": 344.7174343072671
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 317.3884097092914,
                        "Call_Sim": 33.310030228244955,
                        "Call_Chg": -89.50496325346128,
                        "Put_Now": 147.76453238772342,
                        "Put_Sim": 617.0141529066773,
                        "Put_Chg": 317.56580076176664
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 289.4839660146072,
                        "Call_Sim": 28.042883266682793,
                        "Call_Chg": -90.3128025870463,
                        "Put_Now": 167.81956154849604,
                        "Put_Sim": 659.7064788005714,
                        "Put_Chg": 293.1046373339089
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 238.57956270141267,
                        "Call_Sim": 19.64072671288767,
                        "Call_Chg": -91.76764074403621,
                        "Put_Now": 212.83410394621524,
                        "Put_Sim": 747.2232679576905,
                        "Put_Chg": 251.08248824000472
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5305.86128,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 943.9298633298831,
                        "Call_Sim": 995.0225746277583,
                        "Call_Chg": 5.4127656389253795,
                        "Put_Now": 6.954420321004108,
                        "Put_Sim": 5.5138516188798405,
                        "Put_Chg": -20.714432485097074
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 517.5124352602575,
                        "Call_Sim": 560.979310878191,
                        "Call_Chg": 8.399194426327936,
                        "Put_Now": 60.13172080594802,
                        "Put_Sim": 51.0653164238812,
                        "Put_Chg": -15.07757346796236
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 444.88611309582166,
                        "Call_Sim": 485.6800394855836,
                        "Call_Chg": 9.169521185071375,
                        "Put_Now": 83.42434435242649,
                        "Put_Sim": 71.68499074218857,
                        "Put_Chg": -14.071856004819129
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 410.70600491552705,
                        "Call_Sim": 450.0335347439991,
                        "Call_Chg": 9.575591629482222,
                        "Put_Now": 97.20370902758805,
                        "Put_Sim": 83.99795885606045,
                        "Put_Chg": -13.58564431711097
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 378.03173235229497,
                        "Call_Sim": 415.8168283474952,
                        "Call_Chg": 9.995218062802081,
                        "Put_Now": 112.48890931981259,
                        "Put_Sim": 97.74072531501315,
                        "Put_Chg": -13.110789404908784
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 346.91309495346695,
                        "Call_Sim": 383.089434997019,
                        "Call_Chg": 10.42806990275318,
                        "Put_Now": 129.32974477644188,
                        "Put_Sim": 112.97280481999474,
                        "Put_Chg": -12.647469446971844
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 317.3884097092914,
                        "Call_Sim": 351.90055212443303,
                        "Call_Chg": 10.873787876108224,
                        "Put_Now": 147.76453238772342,
                        "Put_Sim": 129.7433948028654,
                        "Put_Chg": -12.195847876114051
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 289.4839660146072,
                        "Call_Sim": 322.2882580412829,
                        "Call_Chg": 11.33198929056418,
                        "Put_Now": 167.81956154849604,
                        "Put_Sim": 148.09057357517236,
                        "Put_Chg": -11.756071694670977
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 238.57956270141267,
                        "Call_Sim": 267.8872113542502,
                        "Call_Chg": 12.284224315356248,
                        "Put_Now": 212.83410394621524,
                        "Put_Sim": 189.60847259905313,
                        "Put_Chg": -10.912551567878143
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5200.794720000001,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 943.9298633298831,
                        "Call_Sim": 893.1730497354829,
                        "Call_Chg": -5.377180611210498,
                        "Put_Now": 6.954420321004108,
                        "Put_Sim": 8.730886726602876,
                        "Put_Chg": 25.54442100994946
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 517.5124352602575,
                        "Call_Sim": 475.3432975313067,
                        "Call_Chg": -8.148429845505815,
                        "Put_Now": 60.13172080594802,
                        "Put_Sim": 70.49586307699701,
                        "Put_Chg": 17.235732043151184
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 444.88611309582166,
                        "Call_Sim": 405.5965376824247,
                        "Call_Chg": -8.831378246444519,
                        "Put_Now": 83.42434435242649,
                        "Put_Sim": 96.66804893902918,
                        "Put_Chg": 15.875107787068249
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 410.70600491552705,
                        "Call_Sim": 372.97652052534477,
                        "Call_Chg": -9.18649446042124,
                        "Put_Now": 97.20370902758805,
                        "Put_Sim": 112.00750463740496,
                        "Put_Chg": 15.229661252550919
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 378.03173235229497,
                        "Call_Sim": 341.9296255961722,
                        "Call_Chg": -9.55002018784988,
                        "Put_Now": 112.48890931981259,
                        "Put_Sim": 128.92008256368922,
                        "Put_Chg": 14.606927334642242
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 346.91309495346695,
                        "Call_Sim": 312.49439854325055,
                        "Call_Chg": -9.921417470514665,
                        "Put_Now": 129.32974477644188,
                        "Put_Sim": 147.4443283662256,
                        "Put_Chg": 14.006509964970853
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 317.3884097092914,
                        "Call_Sim": 284.6969697389204,
                        "Call_Chg": -10.30013666860563,
                        "Put_Now": 147.76453238772342,
                        "Put_Sim": 167.6063724173523,
                        "Put_Chg": 13.428012601539137
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 289.4839660146072,
                        "Call_Sim": 258.55080295175367,
                        "Call_Chg": -10.68562224316515,
                        "Put_Now": 167.81956154849604,
                        "Put_Sim": 189.41967848564173,
                        "Put_Chg": 12.87103645000511
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 238.57956270141267,
                        "Call_Sim": 211.20334102761444,
                        "Call_Chg": -11.47467174632227,
                        "Put_Now": 212.83410394621524,
                        "Put_Sim": 237.9911622724162,
                        "Put_Chg": 11.820031592567675
                    }
                ]
            }
        ],
        "fair_value_sims_nearest": [
            {
                "scenario": "Call Wall",
                "target_spot": 5300.0,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 95.48648087000674,
                        "Call_Sim": 130.1481603065863,
                        "Call_Chg": 36.300090987505584,
                        "Put_Now": 28.763065717121435,
                        "Put_Sim": 16.75274515370097,
                        "Put_Chg": -41.75605160291112
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 65.00034787701725,
                        "Call_Sim": 93.7814477285965,
                        "Call_Chg": 44.27837818042762,
                        "Put_Now": 48.14813065535509,
                        "Put_Sim": 30.257230506934775,
                        "Put_Chg": -37.15803688513599
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 41.46009999767921,
                        "Call_Sim": 63.777364937505354,
                        "Call_Chg": 53.82829501394205,
                        "Put_Now": 74.47908070723815,
                        "Put_Sim": 50.124345647064274,
                        "Put_Chg": -32.70010159753085
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 95.48648087000674,
                        "Call_Sim": 93.21151476884643,
                        "Call_Chg": -2.3825007272573036,
                        "Put_Now": 28.763065717121435,
                        "Put_Sim": 29.816099615961093,
                        "Put_Chg": 3.661062799063284
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 65.00034787701725,
                        "Call_Sim": 63.17569168337786,
                        "Call_Chg": -2.807148351100663,
                        "Put_Now": 48.14813065535509,
                        "Put_Sim": 49.65147446171477,
                        "Put_Chg": 3.122330578357515
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 41.46009999767921,
                        "Call_Sim": 40.10107139755064,
                        "Call_Chg": -3.2779192529797117,
                        "Put_Now": 74.47908070723815,
                        "Put_Sim": 76.44805210711002,
                        "Put_Chg": 2.6436569586720338
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5200.0,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 95.48648087000674,
                        "Call_Sim": 62.57401842925083,
                        "Call_Chg": -34.46819082751855,
                        "Put_Now": 28.763065717121435,
                        "Put_Sim": 49.178603276365266,
                        "Put_Chg": 70.9783086407626
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 65.00034787701725,
                        "Call_Sim": 39.532604678535336,
                        "Call_Chg": -39.18093368772072,
                        "Put_Now": 48.14813065535509,
                        "Put_Sim": 76.0083874568736,
                        "Put_Chg": 57.86363130262019
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 41.46009999767921,
                        "Call_Sim": 23.22595167950317,
                        "Call_Chg": -43.97999117029801,
                        "Put_Now": 74.47908070723815,
                        "Put_Sim": 109.57293238906277,
                        "Put_Chg": 47.11907202476261
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5305.86128,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 95.48648087000674,
                        "Call_Sim": 134.83378521491977,
                        "Call_Chg": 41.20719916202547,
                        "Put_Now": 28.763065717121435,
                        "Put_Sim": 15.577090062034586,
                        "Put_Chg": -45.84342915587679
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 65.00034787701725,
                        "Call_Sim": 97.7993392047133,
                        "Call_Chg": 50.459716599906216,
                        "Put_Now": 48.14813065535509,
                        "Put_Sim": 28.413841983050588,
                        "Put_Chg": -40.98661444109384
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 41.46009999767921,
                        "Call_Sim": 67.01131980256332,
                        "Call_Chg": 61.62845677244961,
                        "Put_Now": 74.47908070723815,
                        "Put_Sim": 47.49702051212307,
                        "Put_Chg": -36.227703052855844
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5200.794720000001,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 95.48648087000674,
                        "Call_Sim": 63.00692307925465,
                        "Call_Chg": -34.014823349673,
                        "Put_Now": 28.763065717121435,
                        "Put_Sim": 48.81678792636785,
                        "Put_Chg": 69.72039213924712
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 65.00034787701725,
                        "Call_Sim": 39.85333459890762,
                        "Call_Chg": -38.68750568179817,
                        "Put_Now": 48.14813065535509,
                        "Put_Sim": 75.53439737724466,
                        "Put_Chg": 56.87919001034704
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 41.46009999767921,
                        "Call_Sim": 23.444655616424598,
                        "Call_Chg": -43.45248656482511,
                        "Put_Now": 74.47908070723815,
                        "Put_Sim": 108.99691632598388,
                        "Put_Chg": 46.34567893557681
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.00014432324786499848,
            -0.1817761869013409,
            -0.14031210596242577,
            -0.001168553784489727,
            0.014488103356825214,
            0.23574783308534852,
            0.20227289924020112,
            -0.00030606081461379974,
            0.191785374490684,
            0.05411097102760182,
            0.030937212347265847,
            0.37629362082791756,
            0.05144731154289063
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
            5450.0,
            5550.0,
            5600.0,
            6000.0,
            6200.0
        ],
        "delta_values": [
            -0.3374281964974857,
            -1369.8199223566603,
            -963.372381425952,
            -56.82134531354741,
            -341.1717671655438,
            -1644.486878356576,
            459.5957781895124,
            -48.359221795935014,
            374.25025825776453,
            65.72743336170744,
            207.9658770270412,
            -5431.121576572962,
            136.66186415244914
        ],
        "delta_cumulative": [
            -0.3374281964974857,
            -1370.1573505531578,
            -2333.52973197911,
            -2390.351077292657,
            -2731.522844458201,
            -4376.009722814777,
            -3916.413944625265,
            -3964.7731664211997,
            -3590.522908163435,
            -3524.795474801728,
            -3316.8295977746866,
            -8747.951174347649,
            -8611.2893101952
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
            5450.0,
            5550.0,
            5600.0,
            6000.0,
            6200.0
        ],
        "gamma_values": [
            4181.053031274144,
            16050015.42826802,
            15323970.447044544,
            453013.82793581416,
            8938906.305301767,
            28770758.7804429,
            7956854.928937643,
            208405.93672429162,
            5335930.068170374,
            1178314.4452848893,
            957687.5408673072,
            14534253.201394944,
            1014562.3802327059
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            3295479.9987269132,
            241019.37783155148,
            7863432.13820497,
            0.0,
            5335930.068170374,
            1178314.4452848893,
            957687.5408673072,
            6179731.532890736,
            1014562.3802327059
        ],
        "gamma_put": [
            4181.053031274144,
            16050015.42826802,
            15323970.447044544,
            453013.82793581416,
            5643426.306574855,
            28529739.40261135,
            93422.79073267279,
            208405.93672429162,
            0.0,
            0.0,
            0.0,
            8354521.668504207,
            0.0
        ],
        "gamma_exposure": [
            4181.053031274144,
            16054196.481299294,
            31378166.92834384,
            31831180.756279655,
            40770087.06158142,
            69540845.84202433,
            77497700.77096197,
            77706106.70768626,
            83042036.77585663,
            84220351.22114152,
            85178038.76200883,
            99712291.96340378,
            100726854.34363648
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
            5450.0,
            5550.0,
            5600.0,
            6000.0,
            6200.0
        ],
        "call_oi": [
            0.0,
            0.0,
            0.0,
            0.0,
            500.0,
            150.0,
            1135.0,
            0.0,
            1460.0,
            460.0,
            500.0,
            5200.0,
            1000.0
        ],
        "put_oi": [
            15.0,
            8900.0,
            4883.0,
            200.0,
            2040.0,
            3925.0,
            60.0,
            130.0,
            0.0,
            0.0,
            0.0,
            7030.0,
            0.0
        ],
        "total_oi": [
            15.0,
            8900.0,
            4883.0,
            200.0,
            2540.0,
            4075.0,
            1195.0,
            130.0,
            1460.0,
            460.0,
            500.0,
            12230.0,
            1000.0
        ]
    },
    "oi_data_nearest": {
        "strikes": [
            5200.0,
            5250.0,
            5300.0
        ],
        "call_oi": [
            500.0,
            0.0,
            1035.0
        ],
        "put_oi": [
            0.0,
            3860.0,
            0.0
        ],
        "total_oi": [
            500.0,
            3860.0,
            1035.0
        ]
    },
    "gex_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 13,
            "abs_call": 10801763.430453,
            "abs_put": 28427014.68707014,
            "net": 39228778.11752314
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 35,
            "abs_call": 6514244.513455263,
            "abs_put": 15285172.098777227,
            "net": 21799416.61223249
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 56,
            "abs_call": 357148.70647888264,
            "abs_put": 0.0,
            "net": 357148.70647888264
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 78,
            "abs_call": 0.0,
            "abs_put": 21665885.326326493,
            "net": 21665885.326326493
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 101,
            "abs_call": 0.0,
            "abs_put": 453013.82793581416,
            "net": 453013.82793581416
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 122,
            "abs_call": 45734.3688877995,
            "abs_put": 0.0,
            "net": 45734.3688877995
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 144,
            "abs_call": 6179731.532890736,
            "abs_put": 8354521.668504207,
            "net": 14534253.201394944
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 166,
            "abs_call": 0.0,
            "abs_put": 31737.461547653962,
            "net": 31737.461547653962
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 187,
            "abs_call": 957687.5408673072,
            "abs_put": 0.0,
            "net": 957687.5408673072
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 210,
            "abs_call": 1014562.3802327059,
            "abs_put": 0.0,
            "net": 1014562.3802327059
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 231,
            "abs_call": 0.0,
            "abs_put": 102724.71554121097,
            "net": 102724.71554121097
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 251,
            "abs_call": 195285.00894375198,
            "abs_put": 340627.07572428056,
            "net": 535912.0846680326
        }
    ],
    "oi_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 13,
            "call_oi": 1535.0,
            "put_oi": 3860.0,
            "total_oi": 5395.0
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 35,
            "call_oi": 1920.0,
            "put_oi": 4853.0,
            "total_oi": 6773.0
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 56,
            "call_oi": 100.0,
            "put_oi": 0.0,
            "total_oi": 100.0
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 78,
            "call_oi": 0.0,
            "put_oi": 10925.0,
            "total_oi": 10925.0
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 101,
            "call_oi": 0.0,
            "put_oi": 200.0,
            "total_oi": 200.0
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 122,
            "call_oi": 20.0,
            "put_oi": 0.0,
            "total_oi": 20.0
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 144,
            "call_oi": 5200.0,
            "put_oi": 7030.0,
            "total_oi": 12230.0
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 166,
            "call_oi": 0.0,
            "put_oi": 30.0,
            "total_oi": 30.0
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 187,
            "call_oi": 500.0,
            "put_oi": 0.0,
            "total_oi": 500.0
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 210,
            "call_oi": 1000.0,
            "put_oi": 0.0,
            "total_oi": 1000.0
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 231,
            "call_oi": 0.0,
            "put_oi": 65.0,
            "total_oi": 65.0
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 251,
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
            5450.0,
            5550.0,
            5600.0,
            6000.0,
            6200.0
        ],
        "call_volume": [
            0.0,
            0.0,
            0.0,
            0.0,
            200.0,
            150.0,
            225.0,
            0.0,
            450.0,
            450.0,
            500.0,
            30.0,
            500.0
        ],
        "put_volume": [
            15.0,
            160.0,
            380.0,
            200.0,
            95.0,
            70.0,
            60.0,
            130.0,
            0.0,
            0.0,
            0.0,
            30.0,
            0.0
        ],
        "total_volume": [
            15.0,
            160.0,
            380.0,
            200.0,
            295.0,
            220.0,
            285.0,
            130.0,
            450.0,
            450.0,
            500.0,
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
            5450.0,
            5550.0,
            5600.0,
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
                "oi": 4853,
                "volume": 350,
                "expiry": "2026-05-01 00:00:00",
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
                "volume": 80,
                "expiry": "2026-07-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5450.0,
                "type": "CALL",
                "oi": 1460,
                "volume": 450,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5300.0,
                "type": "CALL",
                "oi": 1035,
                "volume": 125,
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
                "strike": 5200.0,
                "type": "CALL",
                "oi": 500,
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
                "strike": 5550.0,
                "type": "CALL",
                "oi": 460,
                "volume": 450,
                "expiry": "2026-05-01 00:00:00",
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
                "strike": 5250.0,
                "type": "CALL",
                "oi": 130,
                "volume": 130,
                "expiry": "2027-03-01 00:00:00",
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
        ],
        "top_vol": [
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
                "strike": 5550.0,
                "type": "CALL",
                "oi": 460,
                "volume": 450,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5450.0,
                "type": "CALL",
                "oi": 1460,
                "volume": 450,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5100.0,
                "type": "PUT",
                "oi": 4853,
                "volume": 350,
                "expiry": "2026-05-01 00:00:00",
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
                "strike": 5200.0,
                "type": "CALL",
                "oi": 500,
                "volume": 200,
                "expiry": "2026-04-01 00:00:00",
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
                "strike": 5250.0,
                "type": "CALL",
                "oi": 130,
                "volume": 130,
                "expiry": "2027-03-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5350.0,
                "type": "PUT",
                "oi": 130,
                "volume": 130,
                "expiry": "2027-03-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5300.0,
                "type": "CALL",
                "oi": 1035,
                "volume": 125,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5300.0,
                "type": "CALL",
                "oi": 100,
                "volume": 100,
                "expiry": "2026-06-01 00:00:00",
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
                "type": "PUT",
                "oi": 60,
                "volume": 60,
                "expiry": "2027-03-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5250.0,
                "type": "PUT",
                "oi": 3860,
                "volume": 50,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            }
        ]
    },
    "fed_watch": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 18,
            "iv_atm": 0.0,
            "spot": 5253.328,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 47,
            "iv_atm": 0.0,
            "spot": 5253.328,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 79,
            "iv_atm": 0.0,
            "spot": 5253.328,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 109,
            "iv_atm": 0.0,
            "spot": 5253.328,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 142,
            "iv_atm": 0.0,
            "spot": 5253.328,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 171,
            "iv_atm": 0.0,
            "spot": 5253.328,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 200,
            "iv_atm": 0.0,
            "spot": 5253.328,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 233,
            "iv_atm": 0.0,
            "spot": 5253.328,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 262,
            "iv_atm": 0.0,
            "spot": 5253.328,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 293,
            "iv_atm": 0.0,
            "spot": 5253.328,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 324,
            "iv_atm": 0.0,
            "spot": 5253.328,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 352,
            "iv_atm": 0.0,
            "spot": 5253.328,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5253.328,
                    "lower": 5253.328,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5253.328,
                    "lower": 5253.328,
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
            5450.0,
            5550.0,
            5600.0,
            6000.0,
            6200.0
        ],
        "charm": [
            -0.7441745365679364,
            -1648.376037113697,
            -2389.0091466186477,
            3.3608792819069144,
            -330.06727204506484,
            1289.9703461299734,
            1760.1971282041202,
            15.69158566000361,
            1716.5151610272585,
            533.2398002957256,
            137.0495478039095,
            4208.465523499751,
            259.53499270637195
        ],
        "vanna": [
            -12.857162474099571,
            -17041.50698182269,
            -9272.821376126909,
            -285.93503341377004,
            -2963.8674573265594,
            -1614.5798942007364,
            788.3737997192816,
            -87.52209567528018,
            2788.497480709592,
            975.0715807539314,
            521.1693102369269,
            26583.09479803608,
            2224.8217221043196
        ],
        "vex": [
            3420.3867315936495,
            6169521.838480455,
            2684443.692314965,
            225483.24771571252,
            2392373.8464826383,
            2207191.1601918354,
            695018.6248069238,
            257789.51931072012,
            920363.9990221305,
            203240.7061398761,
            882565.3909330604,
            10314226.465707157,
            1049976.3050851547
        ],
        "theta": [
            -0.8530332504758564,
            -3196.375118927567,
            -3433.528441239921,
            -69.8452290731654,
            -2206.0555727092046,
            -6615.8057991978,
            -2783.7515684770465,
            -5.9005771134972225,
            -1934.0817199710693,
            -410.18049077938343,
            -480.58891015821473,
            2305.5037422183527,
            -430.5062273967402
        ],
        "charm_cum": [
            -0.7441745365679364,
            -1649.120211650265,
            -4038.1293582689127,
            -4034.768478987006,
            -4364.835751032071,
            -3074.865404902098,
            -1314.6682766979777,
            -1298.9766910379742,
            417.5384699892843,
            950.7782702850099,
            1087.8278180889192,
            5296.29334158867,
            5555.828334295042
        ],
        "vanna_cum": [
            -12.857162474099571,
            -17054.36414429679,
            -26327.1855204237,
            -26613.12055383747,
            -29576.98801116403,
            -31191.567905364765,
            -30403.194105645485,
            -30490.716201320767,
            -27702.218720611174,
            -26727.147139857243,
            -26205.977829620315,
            377.11696841576486,
            2601.9386905200845
        ],
        "theta_cum": [
            -0.8530332504758564,
            -3197.2281521780433,
            -6630.756593417964,
            -6700.6018224911295,
            -8906.657395200335,
            -15522.463194398135,
            -18306.21476287518,
            -18312.11533998868,
            -20246.197059959748,
            -20656.377550739133,
            -21136.966460897347,
            -18831.462718678995,
            -19261.968946075736
        ],
        "r_gamma": [
            4181.053031274144,
            16050015.42826802,
            15323970.447044544,
            453013.82793581416,
            8938906.305301767,
            28770758.7804429,
            -7956854.928937643,
            -208405.93672429162,
            -5335930.068170374,
            -1178314.4452848893,
            -957687.5408673072,
            -14534253.201394945,
            -1014562.3802327059
        ],
        "r_gamma_cum": [
            4181.053031274144,
            16054196.481299294,
            31378166.92834384,
            31831180.756279655,
            40770087.06158142,
            69540845.84202433,
            61583990.91308668,
            61375584.97636239,
            56039654.908192016,
            54861340.46290713,
            53903652.92203982,
            39369399.72064488,
            38354837.34041217
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.3374281964974857,
            "gamma": 4181.053031274144,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -1369.8199223566603,
            "gamma": 16050015.42826802,
            "volume": 160,
            "oi": 8900,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -963.372381425952,
            "gamma": 15323970.447044544,
            "volume": 380,
            "oi": 4883,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -56.82134531354741,
            "gamma": 453013.82793581416,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -341.1717671655438,
            "gamma": 8938906.305301767,
            "volume": 295,
            "oi": 2540,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -1644.486878356576,
            "gamma": 28770758.7804429,
            "volume": 220,
            "oi": 4075,
            "iv": 11.82
        },
        {
            "strike": 5300.0,
            "delta": 459.5957781895124,
            "gamma": 7956854.928937643,
            "volume": 285,
            "oi": 1195,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": -48.359221795935014,
            "gamma": 208405.93672429162,
            "volume": 130,
            "oi": 130,
            "iv": 11.82
        },
        {
            "strike": 5450.0,
            "delta": 374.25025825776453,
            "gamma": 5335930.068170374,
            "volume": 450,
            "oi": 1460,
            "iv": 11.82
        },
        {
            "strike": 5550.0,
            "delta": 65.72743336170744,
            "gamma": 1178314.4452848893,
            "volume": 450,
            "oi": 460,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 207.9658770270412,
            "gamma": 957687.5408673072,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5431.121576572962,
            "gamma": 14534253.201394944,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 136.66186415244914,
            "gamma": 1014562.3802327059,
            "volume": 500,
            "oi": 1000,
            "iv": 11.82
        }
    ]
};