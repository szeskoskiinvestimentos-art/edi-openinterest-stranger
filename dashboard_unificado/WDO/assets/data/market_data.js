window.marketData = {
    "last_updated": "2026-03-13 16:20:20",
    "spot_price": 5325.5,
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-03-13",
        "meetings": [
            {
                "date": "2026-03-18",
                "days_remaining": 4,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 1.7,
                    "3.50-3.75": 98.3,
                    "3.75-4.00": 0.4
                }
            },
            {
                "date": "2026-04-29",
                "days_remaining": 46,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.1,
                    "3.25-3.50": 5.9,
                    "3.50-3.75": 94.1,
                    "3.75-4.00": 0.4
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 95,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 1.1,
                    "3.25-3.50": 22.2,
                    "3.50-3.75": 76.7,
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
                    "3.00-3.25": 4.4,
                    "3.25-3.50": 30.6,
                    "3.50-3.75": 64.8,
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
                    "2.75-3.00": 0.9,
                    "3.00-3.25": 8.8,
                    "3.25-3.50": 36.4,
                    "3.50-3.75": 53.9,
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
                    "2.75-3.00": 1.6,
                    "3.00-3.25": 11.3,
                    "3.25-3.50": 38.0,
                    "3.50-3.75": 48.9,
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
                    "2.75-3.00": 3.8,
                    "3.00-3.25": 17.2,
                    "3.25-3.50": 40.4,
                    "3.50-3.75": 38.2,
                    "3.75-4.00": 0.2
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 13/03/2026 16:20\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(2);\n  spot(5325.50);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 4500.00;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (4500.00)\n  // 2 = Spline (4937.91)\n  // 3 = HVL (4500.00)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (4500.00)\n  // 7 = HVL Gaussian (4500.00)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 4500.00;\n  if (ModeloFlip = 2) then GammaVal := 4937.91;\n  if (ModeloFlip = 3) then GammaVal := 4500.00;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 4500.00;\n  if (ModeloFlip = 7) then GammaVal := 4500.00;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5285.85 <= LimitUpper) and (5285.85 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5285.85, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5365.15 <= LimitUpper) and (5365.15 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5365.15, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5441.31 <= LimitUpper) and (5441.31 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5441.31, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5450.00 <= LimitUpper) and (5450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5550.00 <= LimitUpper) and (5550.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5550.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5879.43 <= LimitUpper) and (5879.43 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5879.43, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirMaxPain) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5572.25 > 0) then\n      HorizontalLineCustom(5572.25, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5275.00 <= LimitUpper) and (5275.00 >= LimitLower) then\n      HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5400.00 <= LimitUpper) and (5400.00 >= LimitLower) then\n      HorizontalLineCustom(5400.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5500.00 <= LimitUpper) and (5500.00 >= LimitLower) then\n      HorizontalLineCustom(5500.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5575.00 <= LimitUpper) and (5575.00 >= LimitLower) then\n      HorizontalLineCustom(5575.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5800.00 <= LimitUpper) and (5800.00 >= LimitLower) then\n      HorizontalLineCustom(5800.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5411.80 <= LimitUpper) and (5411.80 >= LimitLower) then\n      HorizontalLineCustom(5411.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5488.20 <= LimitUpper) and (5488.20 >= LimitLower) then\n      HorizontalLineCustom(5488.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5511.80 <= LimitUpper) and (5511.80 >= LimitLower) then\n      HorizontalLineCustom(5511.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5569.10 <= LimitUpper) and (5569.10 >= LimitLower) then\n      HorizontalLineCustom(5569.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5580.90 <= LimitUpper) and (5580.90 >= LimitLower) then\n      HorizontalLineCustom(5580.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5752.80 <= LimitUpper) and (5752.80 >= LimitLower) then\n      HorizontalLineCustom(5752.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5847.20 <= LimitUpper) and (5847.20 >= LimitLower) then\n      HorizontalLineCustom(5847.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5261.80 <= LimitUpper) and (5261.80 >= LimitLower) then\n      HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5373.60 <= LimitUpper) and (5373.60 >= LimitLower) then\n      HorizontalLineCustom(5373.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5426.40 <= LimitUpper) and (5426.40 >= LimitLower) then\n      HorizontalLineCustom(5426.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5473.60 <= LimitUpper) and (5473.60 >= LimitLower) then\n      HorizontalLineCustom(5473.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5526.40 <= LimitUpper) and (5526.40 >= LimitLower) then\n      HorizontalLineCustom(5526.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5588.20 <= LimitUpper) and (5588.20 >= LimitLower) then\n      HorizontalLineCustom(5588.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5694.40 <= LimitUpper) and (5694.40 >= LimitLower) then\n      HorizontalLineCustom(5694.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5905.60 <= LimitUpper) and (5905.60 >= LimitLower) then\n      HorizontalLineCustom(5905.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5333.49, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5317.51, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5341.48, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5309.52, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5356.31, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5294.69, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5364.30, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5286.70, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 37588,
        "total_volume": 3925,
        "gamma_exposure": 90314367.71153411,
        "delta_position": -5985.301032438941,
        "last_update": "2026-03-13T16:20:20.868102",
        "spot_price": 5325.5,
        "dealer_pressure": 0.04393109636310908,
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
        "range_low": 5285.846858920091,
        "range_high": 5365.15314107991,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5365.15314107991,
                "sigma_1_down": 5285.84685892009,
                "sigma_2_up": 5404.80628215982,
                "sigma_2_down": 5246.19371784018
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5414.167118976067,
                "sigma_1_down": 5236.832881023933,
                "sigma_2_up": 5502.834237952135,
                "sigma_2_down": 5148.165762047865
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 210,
                "sigma_1_up": 5900.128606558771,
                "sigma_1_down": 4750.871393441229,
                "sigma_2_up": 6474.757213117542,
                "sigma_2_down": 4176.242786882458
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
                4526.675,
                4559.280102040817,
                4591.885204081633,
                4624.4903061224495,
                4657.095408163265,
                4689.700510204082,
                4722.305612244898,
                4754.910714285715,
                4787.5158163265305,
                4820.120918367347,
                4852.726020408163,
                4885.33112244898,
                4917.936224489796,
                4950.541326530612,
                4983.146428571428,
                5015.751530612245,
                5048.356632653062,
                5080.961734693878,
                5113.566836734693,
                5146.17193877551,
                5178.777040816327,
                5211.382142857143,
                5243.9872448979595,
                5276.592346938775,
                5309.197448979592,
                5341.802551020408,
                5374.407653061225,
                5407.0127551020405,
                5439.617857142857,
                5472.222959183673,
                5504.82806122449,
                5537.433163265307,
                5570.038265306122,
                5602.643367346938,
                5635.248469387755,
                5667.853571428572,
                5700.458673469388,
                5733.063775510204,
                5765.66887755102,
                5798.273979591837,
                5830.879081632653,
                5863.4841836734695,
                5896.089285714285,
                5928.694387755102,
                5961.299489795918,
                5993.904591836735,
                6026.509693877551,
                6059.114795918367,
                6091.719897959183,
                6124.325
            ],
            "deltas": [
                -25961.581674744342,
                -25711.215803136234,
                -25422.95877768329,
                -25093.703666309782,
                -24720.522171695648,
                -24300.781883881013,
                -23832.27706485308,
                -23313.347250794966,
                -22742.940469821227,
                -22120.565061117904,
                -21446.077586531737,
                -20719.287892230248,
                -19939.434195026195,
                -19104.682283710794,
                -18211.898635186397,
                -17256.980010928906,
                -16235.935119159109,
                -15146.688885949237,
                -13991.268897426042,
                -12777.758340275941,
                -11521.304448493862,
                -10243.646124151153,
                -8971.04226364166,
                -7730.994615794048,
                -6548.559166772514,
                -5443.164611962791,
                -4426.664658293517,
                -3502.9380815345758,
                -2668.8922141162766,
                -1916.3894543641968,
                -1234.4919758550486,
                -611.4981000010798,
                -36.44533822414439,
                500.0192903786383,
                1005.3267697803717,
                1485.0656192828721,
                1943.2734701438294,
                2382.7955414479784,
                2805.6180614964087,
                3213.1339997548876,
                3606.333270201688,
                3985.9284531882718,
                4352.433683453976,
                4706.213620301408,
                5047.515503786278,
                5376.492849391275,
                5693.225620255058,
                5997.739112396061,
                6290.022202391562,
                6570.044782786876
            ],
            "flip_value": 5572.253330211343
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                0.0,
                200.0,
                150.0,
                825.0,
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
                -35.0,
                -200.0,
                -95.0,
                -95.0,
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
                4526.675,
                4559.280102040817,
                4591.885204081633,
                4624.4903061224495,
                4657.095408163265,
                4689.700510204082,
                4722.305612244898,
                4754.910714285715,
                4787.5158163265305,
                4820.120918367347,
                4852.726020408163,
                4885.33112244898,
                4917.936224489796,
                4950.541326530612,
                4983.146428571428,
                5015.751530612245,
                5048.356632653062,
                5080.961734693878,
                5113.566836734693,
                5146.17193877551,
                5178.777040816327,
                5211.382142857143,
                5243.9872448979595,
                5276.592346938775,
                5309.197448979592,
                5341.802551020408,
                5374.407653061225,
                5407.0127551020405,
                5439.617857142857,
                5472.222959183673,
                5504.82806122449,
                5537.433163265307,
                5570.038265306122,
                5602.643367346938,
                5635.248469387755,
                5667.853571428572,
                5700.458673469388,
                5733.063775510204,
                5765.66887755102,
                5798.273979591837,
                5830.879081632653,
                5863.4841836734695,
                5896.089285714285,
                5928.694387755102,
                5961.299489795918,
                5993.904591836735,
                6026.509693877551,
                6059.114795918367,
                6091.719897959183,
                6124.325
            ],
            "pnl": [
                -14971117.849557389,
                -14115307.637987897,
                -13277047.951329265,
                -12457045.411510691,
                -11655965.162277397,
                -10874426.896901194,
                -10113001.46265221,
                -9372208.066419277,
                -8652512.092104107,
                -7954323.527294733,
                -7277995.984606884,
                -6623826.292254163,
                -5992054.619100317,
                -5382865.091806835,
                -4796386.855805391,
                -4232695.527708607,
                -3691814.984383879,
                -3173719.4331496675,
                -2678335.708271982,
                -2205545.74095973,
                -1755189.153178364,
                -1327065.9296041792,
                -920939.1267030323,
                -536537.5830179844,
                -173558.60008153226,
                168329.43126110453,
                489484.4790911721,
                790288.4082237156,
                1071144.6180134704,
                1332475.78649001,
                1574721.7235956928,
                1798337.333312543,
                2003790.6820645537,
                2191561.168951247,
                2362137.792085032,
                2516017.5045194607,
                2653703.6529171783,
                2775704.492151697,
                2882531.7693985514,
                2974699.3718830943,
                3052722.0332450857,
                3117114.0943926554,
                3168388.315690129,
                3207054.7383049875,
                3233619.5934832403,
                3248584.2593932813,
                3252444.265946662,
                3245688.348649527,
                3228797.553046885,
                3202244.391686525
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
                        "Call_Now": 1014.1971141658796,
                        "Call_Sim": 989.3072354878377,
                        "Call_Chg": -2.454146075786503,
                        "Put_Now": 5.049671157001939,
                        "Put_Sim": 5.6597924789595595,
                        "Put_Chg": 12.082397110386463
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 577.5375187807795,
                        "Call_Sim": 556.0690352204579,
                        "Call_Chg": -3.7172448303692915,
                        "Put_Now": 47.98480432647091,
                        "Put_Sim": 52.0163207661484,
                        "Put_Chg": 8.401652348623823
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 501.29304938678615,
                        "Call_Sim": 481.05758479143697,
                        "Call_Chg": -4.036653733799522,
                        "Put_Now": 67.6592806433905,
                        "Put_Sim": 72.923816048042,
                        "Put_Chg": 7.780950897777212
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 465.1235289278543,
                        "Call_Sim": 445.5698669405683,
                        "Call_Chg": -4.2039717991387535,
                        "Put_Now": 79.4492330399155,
                        "Put_Sim": 85.3955710526293,
                        "Put_Chg": 7.484449862123074
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 430.35353365321043,
                        "Call_Sim": 411.5208035905248,
                        "Call_Chg": -4.376106756418904,
                        "Put_Now": 92.63871062072849,
                        "Put_Sim": 99.30598055804239,
                        "Put_Chg": 7.197066855356319
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 397.04578796028545,
                        "Call_Sim": 378.96890616802057,
                        "Call_Chg": -4.552845626477978,
                        "Put_Now": 107.2904377832615,
                        "Put_Sim": 114.71355599099638,
                        "Put_Chg": 6.918713690711566
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 365.25318274413576,
                        "Call_Sim": 347.9622290545899,
                        "Call_Chg": -4.733963865732658,
                        "Put_Now": 123.45730542256774,
                        "Put_Sim": 131.6663517330221,
                        "Put_Chg": 6.649299757804183
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 335.01788866672086,
                        "Call_Sim": 318.537594295462,
                        "Call_Chg": -4.919228175201605,
                        "Put_Now": 141.1814842006097,
                        "Put_Sim": 150.2011898293506,
                        "Put_Chg": 6.388731270117885
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 279.33079279587946,
                        "Call_Sim": 264.52281452555553,
                        "Call_Chg": -5.301233753038046,
                        "Put_Now": 181.41333404068246,
                        "Put_Sim": 192.10535577035898,
                        "Put_Chg": 5.89373531235516
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 230.09013393920486,
                        "Call_Sim": 216.98209084835162,
                        "Call_Chg": -5.696916624124654,
                        "Put_Now": 228.09162089492202,
                        "Put_Sim": 240.48357780406832,
                        "Put_Chg": 5.4328856362746745
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 1014.1971141658796,
                        "Call_Sim": 940.7037880004436,
                        "Call_Chg": -7.246453883462302,
                        "Put_Now": 5.049671157001939,
                        "Put_Sim": 7.056344991564856,
                        "Put_Chg": 39.73870321794
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 577.5375187807795,
                        "Call_Sim": 514.8012335337462,
                        "Call_Chg": -10.862720292090076,
                        "Put_Now": 47.98480432647091,
                        "Put_Sim": 60.74851907943696,
                        "Put_Chg": 26.59949317731181
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 501.29304938678615,
                        "Call_Sim": 442.35126974415925,
                        "Call_Chg": -11.757948711782113,
                        "Put_Now": 67.6592806433905,
                        "Put_Sim": 84.21750100076451,
                        "Put_Chg": 24.47294768717224
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 465.1235289278543,
                        "Call_Sim": 408.2672800637315,
                        "Call_Chg": -12.22390296942854,
                        "Put_Now": 79.4492330399155,
                        "Put_Sim": 98.09298417579316,
                        "Put_Chg": 23.466244320459325
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 430.35353365321043,
                        "Call_Sim": 375.6936687869311,
                        "Call_Chg": -12.701153956441225,
                        "Put_Now": 92.63871062072849,
                        "Put_Sim": 113.47884575444891,
                        "Put_Chg": 22.496141185558894
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 397.04578796028545,
                        "Call_Sim": 344.67956651633904,
                        "Call_Chg": -13.188962843042262,
                        "Put_Now": 107.2904377832615,
                        "Put_Sim": 130.42421633931463,
                        "Put_Chg": 21.56182697547186
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 365.25318274413576,
                        "Call_Sim": 315.26255472564435,
                        "Call_Chg": -13.686568763867676,
                        "Put_Now": 123.45730542256774,
                        "Put_Sim": 148.96667740407588,
                        "Put_Chg": 20.662505061320637
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 335.01788866672086,
                        "Call_Sim": 287.4681383295833,
                        "Call_Chg": -14.193197421896627,
                        "Put_Now": 141.1814842006097,
                        "Put_Sim": 169.13173386347262,
                        "Put_Chg": 19.797390444732418
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 279.33079279587946,
                        "Call_Sim": 236.78758045143695,
                        "Call_Chg": -15.230405469665097,
                        "Put_Now": 181.41333404068246,
                        "Put_Sim": 214.37012169623995,
                        "Put_Chg": 18.166684290233505
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 230.09013393920486,
                        "Call_Sim": 192.59831255471136,
                        "Call_Chg": -16.29440634529758,
                        "Put_Now": 228.09162089492202,
                        "Put_Sim": 266.0997995104285,
                        "Put_Chg": 16.663557594259995
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 1014.1971141658796,
                        "Call_Sim": 295.4396284425766,
                        "Call_Chg": -70.86960470346446,
                        "Put_Now": 5.049671157001939,
                        "Put_Sim": 111.79218543369802,
                        "Put_Chg": 2113.850802515834
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 577.5375187807795,
                        "Call_Sim": 85.82513887022833,
                        "Call_Chg": -85.13946954452224,
                        "Put_Now": 47.98480432647091,
                        "Put_Sim": 381.772424415919,
                        "Put_Chg": 695.6110893325317
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 501.29304938678615,
                        "Call_Sim": 63.659801331925564,
                        "Call_Chg": -87.3008809099192,
                        "Put_Now": 67.6592806433905,
                        "Put_Sim": 455.52603258853014,
                        "Put_Chg": 573.2646700597601
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 465.1235289278543,
                        "Call_Sim": 54.48047905961846,
                        "Call_Chg": -88.2868795768728,
                        "Put_Now": 79.4492330399155,
                        "Put_Sim": 494.30618317168,
                        "Put_Chg": 522.1660855093961
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 430.35353365321043,
                        "Call_Sim": 46.43068438480691,
                        "Call_Chg": -89.2110367978942,
                        "Put_Now": 92.63871062072849,
                        "Put_Sim": 534.2158613523247,
                        "Put_Chg": 476.6659075593725
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 397.04578796028545,
                        "Call_Sim": 39.40727294295323,
                        "Call_Chg": -90.07487948798114,
                        "Put_Now": 107.2904377832615,
                        "Put_Sim": 575.1519227659292,
                        "Put_Chg": 436.07006798480904
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 365.25318274413576,
                        "Call_Sim": 33.310030228244955,
                        "Call_Chg": -90.88029022006387,
                        "Put_Now": 123.45730542256774,
                        "Put_Sim": 617.0141529066773,
                        "Put_Chg": 399.77937781386925
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 335.01788866672086,
                        "Call_Sim": 28.042883266682793,
                        "Call_Chg": -91.62943704938093,
                        "Put_Now": 141.1814842006097,
                        "Put_Sim": 659.7064788005714,
                        "Put_Chg": 367.27549475480185
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 279.33079279587946,
                        "Call_Sim": 19.64072671288767,
                        "Call_Chg": -92.96864963712035,
                        "Put_Now": 181.41333404068246,
                        "Put_Sim": 747.2232679576905,
                        "Put_Chg": 311.889937368178
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 230.09013393920486,
                        "Call_Sim": 13.544911776384936,
                        "Call_Chg": -94.11321487606078,
                        "Put_Now": 228.09162089492202,
                        "Put_Sim": 837.0463987321027,
                        "Put_Chg": 266.9781447682885
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5378.755,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 1014.1971141658796,
                        "Call_Sim": 1066.3682392206028,
                        "Call_Chg": 5.144081394634126,
                        "Put_Now": 5.049671157001939,
                        "Put_Sim": 3.9657962117238696,
                        "Put_Chg": -21.464267901389064
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 577.5375187807795,
                        "Call_Sim": 623.2187892917882,
                        "Call_Chg": 7.909662840164041,
                        "Put_Now": 47.98480432647091,
                        "Put_Sim": 40.41107483747919,
                        "Put_Chg": -15.783599819357091
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 501.29304938678615,
                        "Call_Sim": 544.5599843078858,
                        "Call_Chg": 8.631066194519656,
                        "Put_Now": 67.6592806433905,
                        "Put_Sim": 57.67121556449047,
                        "Put_Chg": -14.762298658692213
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 465.1235289278543,
                        "Call_Sim": 507.04316556000003,
                        "Call_Chg": 9.012581395048697,
                        "Put_Now": 79.4492330399155,
                        "Put_Sim": 68.11386967206181,
                        "Put_Chg": -14.267429569973034
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 430.35353365321043,
                        "Call_Sim": 470.8398171655308,
                        "Call_Chg": 9.407680045900408,
                        "Put_Now": 92.63871062072849,
                        "Put_Sim": 79.86999413304875,
                        "Put_Chg": -13.783348669387308
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 397.04578796028545,
                        "Call_Sim": 436.02016879929624,
                        "Call_Chg": 9.816092254556095,
                        "Put_Now": 107.2904377832615,
                        "Put_Sim": 93.0098186222715,
                        "Put_Chg": -13.31024409634568
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 365.25318274413576,
                        "Call_Sim": 402.6460272794993,
                        "Call_Chg": 10.237513675974647,
                        "Put_Now": 123.45730542256774,
                        "Put_Sim": 107.5951499579312,
                        "Put_Chg": -12.848292298575451
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 335.01788866672086,
                        "Call_Sim": 370.76969329585154,
                        "Call_Chg": 10.671610632916657,
                        "Put_Now": 141.1814842006097,
                        "Put_Sim": 123.67828882974004,
                        "Put_Chg": -12.397656441972774
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 279.33079279587946,
                        "Call_Sim": 311.66718572458376,
                        "Call_Chg": 11.576379605357031,
                        "Put_Now": 181.41333404068246,
                        "Put_Sim": 160.49472696938733,
                        "Put_Chg": -11.530909335806633
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 230.09013393920486,
                        "Call_Sim": 258.91427873976136,
                        "Call_Chg": 12.52732757684104,
                        "Put_Now": 228.09162089492202,
                        "Put_Sim": 203.6607656954784,
                        "Put_Chg": -10.710983202096012
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5272.245,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 1014.1971141658796,
                        "Call_Sim": 962.2925971385575,
                        "Call_Chg": -5.1177937998779095,
                        "Put_Now": 5.049671157001939,
                        "Put_Sim": 6.400154129679208,
                        "Put_Chg": 26.743978581747307
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 577.5375187807795,
                        "Call_Sim": 533.0214540955685,
                        "Call_Chg": -7.70790870508073,
                        "Put_Now": 47.98480432647091,
                        "Put_Sim": 56.7237396412595,
                        "Put_Chg": 18.21188069317132
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 501.29304938678615,
                        "Call_Sim": 459.40850105598383,
                        "Call_Chg": -8.355302029828298,
                        "Put_Now": 67.6592806433905,
                        "Put_Sim": 79.02973231258898,
                        "Put_Chg": 16.805457523452446
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 465.1235289278543,
                        "Call_Sim": 424.6892396785415,
                        "Call_Chg": -8.693236685427832,
                        "Put_Now": 79.4492330399155,
                        "Put_Sim": 92.26994379060329,
                        "Put_Chg": 16.13698491494139
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 430.35353365321043,
                        "Call_Sim": 391.44933914599414,
                        "Call_Chg": -9.040054621363062,
                        "Put_Now": 92.63871062072849,
                        "Put_Sim": 106.98951611351276,
                        "Put_Chg": 15.491154180176157
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 397.04578796028545,
                        "Call_Sim": 359.74228253026695,
                        "Call_Chg": -9.395265372705525,
                        "Put_Now": 107.2904377832615,
                        "Put_Sim": 123.2419323532431,
                        "Put_Chg": 14.867582703134627
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 365.25318274413576,
                        "Call_Sim": 329.6104660923902,
                        "Call_Chg": -9.75835895089618,
                        "Put_Now": 123.45730542256774,
                        "Put_Sim": 141.0695887708223,
                        "Put_Chg": 14.265889967362808
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 335.01788866672086,
                        "Call_Sim": 301.0845570532297,
                        "Call_Chg": -10.128811851969017,
                        "Put_Now": 141.1814842006097,
                        "Put_Sim": 160.50315258711862,
                        "Put_Chg": 13.685695752464314
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 279.33079279587946,
                        "Call_Sim": 248.91259917307707,
                        "Call_Chg": -10.889667164275167,
                        "Put_Now": 181.41333404068246,
                        "Put_Sim": 204.25014041787972,
                        "Put_Chg": 12.588273347137783
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 230.09013393920486,
                        "Call_Sim": 203.23039277335192,
                        "Call_Chg": -11.673573614829527,
                        "Put_Now": 228.09162089492202,
                        "Put_Sim": 254.4868797290692,
                        "Put_Chg": 11.572217659984547
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
                        "Call_Now": 151.00384706062778,
                        "Call_Sim": 130.1481603065863,
                        "Call_Chg": -13.811361207021402,
                        "Put_Now": 12.10843190774267,
                        "Put_Sim": 16.75274515370097,
                        "Put_Chg": 38.35602563027605
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 111.86826003275519,
                        "Call_Sim": 93.7814477285965,
                        "Call_Chg": -16.167957112109224,
                        "Put_Now": 22.844042811093004,
                        "Put_Sim": 30.257230506934775,
                        "Put_Chg": 32.45129488306661
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 78.5355327893867,
                        "Call_Sim": 63.777364937505354,
                        "Call_Chg": -18.791707813912957,
                        "Put_Now": 39.38251349894654,
                        "Put_Sim": 50.124345647064274,
                        "Put_Chg": 27.275638840078294
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 151.00384706062778,
                        "Call_Sim": 93.21151476884643,
                        "Call_Chg": -38.27209267627323,
                        "Put_Now": 12.10843190774267,
                        "Put_Sim": 29.816099615961093,
                        "Put_Chg": 146.24245189746952
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 111.86826003275519,
                        "Call_Sim": 63.17569168337786,
                        "Call_Chg": -43.526705729686036,
                        "Put_Now": 22.844042811093004,
                        "Put_Sim": 49.65147446171477,
                        "Put_Chg": 117.34976979470618
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 78.5355327893867,
                        "Call_Sim": 40.10107139755064,
                        "Call_Chg": -48.938945247761914,
                        "Put_Now": 39.38251349894654,
                        "Put_Sim": 76.44805210711002,
                        "Put_Chg": 94.11674196253361
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5200.0,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 151.00384706062778,
                        "Call_Sim": 62.57401842925083,
                        "Call_Chg": -58.56130843863371,
                        "Put_Now": 12.10843190774267,
                        "Put_Sim": 49.178603276365266,
                        "Put_Chg": 306.1517102385345
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 111.86826003275519,
                        "Call_Sim": 39.532604678535336,
                        "Call_Chg": -64.661464595087,
                        "Put_Now": 22.844042811093004,
                        "Put_Sim": 76.0083874568736,
                        "Put_Chg": 232.7273901796583
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 78.5355327893867,
                        "Call_Sim": 23.22595167950317,
                        "Call_Chg": -70.4261869060091,
                        "Put_Now": 39.38251349894654,
                        "Put_Sim": 109.57293238906277,
                        "Put_Chg": 178.22737213558955
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5378.755,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 151.00384706062778,
                        "Call_Sim": 197.8865289262476,
                        "Call_Chg": 31.047342685777075,
                        "Put_Now": 12.10843190774267,
                        "Put_Sim": 5.736113773363002,
                        "Put_Chg": -52.62711293198027
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 111.86826003275519,
                        "Call_Sim": 154.1815268897517,
                        "Call_Chg": 37.82419324713473,
                        "Put_Now": 22.844042811093004,
                        "Put_Sim": 11.902309668089174,
                        "Put_Chg": -47.897533871239965
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 78.5355327893867,
                        "Call_Sim": 114.81584803936812,
                        "Call_Chg": 46.19605159778624,
                        "Put_Now": 39.38251349894654,
                        "Put_Sim": 22.40782874892807,
                        "Put_Chg": -43.10208577843193
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5272.245,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 151.00384706062778,
                        "Call_Sim": 108.93528328489265,
                        "Call_Chg": -27.859266233690505,
                        "Put_Now": 12.10843190774267,
                        "Put_Sim": 23.29486813200765,
                        "Put_Chg": 92.38550713665802
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 111.86826003275519,
                        "Call_Sim": 75.95777242874647,
                        "Call_Chg": -32.10069379240732,
                        "Put_Now": 22.844042811093004,
                        "Put_Sim": 40.18855520708439,
                        "Put_Chg": 75.92575683481446
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 78.5355327893867,
                        "Call_Sim": 49.769432148341366,
                        "Call_Chg": -36.62813457723533,
                        "Put_Now": 39.38251349894654,
                        "Put_Sim": 63.871412857901305,
                        "Put_Chg": 62.18216457822031
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.0001033567444835903,
            -0.1554637770658353,
            -0.13576420000924605,
            -0.0017038371704596413,
            -0.016584628648608025,
            -0.10837506218238811,
            0.09466967302141004,
            -0.0006263252006395165,
            0.17679394037521348,
            0.05719325580194952,
            0.030746783316846944,
            0.4005457473912546,
            0.05478862776451544
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
            -0.2384640927152598,
            -977.725451010645,
            -601.1451635656439,
            -45.143308855535615,
            -118.23599778259691,
            -915.8476498765015,
            679.1549064388063,
            -42.79027890507836,
            533.0075209168378,
            103.18641061902439,
            234.3964766575381,
            -5000.196628973632,
            166.276595991201
        ],
        "delta_cumulative": [
            -0.2384640927152598,
            -977.9639151033603,
            -1579.1090786690042,
            -1624.25238752454,
            -1742.488385307137,
            -2658.336035183638,
            -1979.1811287448318,
            -2021.9714076499101,
            -1488.9638867330723,
            -1385.7774761140479,
            -1151.3809994565097,
            -6151.577628430142,
            -5985.301032438941
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
            3112.137778101112,
            12712457.30550686,
            11224789.888304476,
            401512.0429509638,
            7317663.355649317,
            23670778.067575708,
            7806453.2513450645,
            199342.3503022429,
            6229401.063835954,
            1563232.9671965227,
            976518.8008115314,
            17053081.613796197,
            1156024.8664811908
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            2258214.086533762,
            225980.7646076354,
            7717912.374370476,
            0.0,
            6229401.063835954,
            1563232.9671965227,
            976518.8008115314,
            7250697.006683583,
            1156024.8664811908
        ],
        "gamma_put": [
            3112.137778101112,
            12712457.30550686,
            11224789.888304476,
            401512.0429509638,
            5059449.269115554,
            23444797.302968074,
            88540.87697458816,
            199342.3503022429,
            0.0,
            0.0,
            0.0,
            9802384.607112614,
            0.0
        ],
        "gamma_exposure": [
            3112.137778101112,
            12715569.443284962,
            23940359.331589438,
            24341871.374540403,
            31659534.73018972,
            55330312.79776543,
            63136766.04911049,
            63336108.39941273,
            69565509.46324869,
            71128742.43044521,
            72105261.23125674,
            89158342.84505293,
            90314367.71153411
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
            "abs_call": 9635295.31585309,
            "abs_put": 23348402.27721164,
            "net": 32983697.59306473
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 35,
            "abs_call": 7792634.031032477,
            "abs_put": 11189380.059441151,
            "net": 18982014.09047363
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 56,
            "abs_call": 340831.1450511492,
            "abs_put": 0.0,
            "net": 340831.1450511492
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 78,
            "abs_call": 0.0,
            "abs_put": 17746491.596334375,
            "net": 17746491.596334375
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 101,
            "abs_call": 0.0,
            "abs_put": 401512.0429509638,
            "net": 401512.0429509638
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 122,
            "abs_call": 42612.79239064389,
            "abs_put": 0.0,
            "net": 42612.79239064389
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 144,
            "abs_call": 7250697.006683583,
            "abs_put": 9802384.607112614,
            "net": 17053081.613796197
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 166,
            "abs_call": 0.0,
            "abs_put": 28527.11606614083,
            "net": 28527.11606614083
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 187,
            "abs_call": 976518.8008115314,
            "abs_put": 0.0,
            "net": 976518.8008115314
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 210,
            "abs_call": 1156024.8664811908,
            "abs_put": 0.0,
            "net": 1156024.8664811908
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 231,
            "abs_call": 0.0,
            "abs_put": 96395.02575643332,
            "net": 96395.02575643332
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 251,
            "abs_call": 183367.97221699153,
            "abs_put": 323293.0561401562,
            "net": 506661.0283571477
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
            825.0,
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
            35.0,
            200.0,
            95.0,
            95.0,
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
            35.0,
            200.0,
            295.0,
            245.0,
            885.0,
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
                "volume": 5,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5250.0,
                "type": "PUT",
                "oi": 3860,
                "volume": 75,
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
                "strike": 5300.0,
                "type": "CALL",
                "oi": 1035,
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
                "strike": 5250.0,
                "type": "PUT",
                "oi": 3860,
                "volume": 75,
                "expiry": "2026-04-01 00:00:00",
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
            "days_to_exp": 18,
            "iv_atm": 0.0,
            "spot": 5325.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 47,
            "iv_atm": 0.0,
            "spot": 5325.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 79,
            "iv_atm": 0.0,
            "spot": 5325.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 109,
            "iv_atm": 0.0,
            "spot": 5325.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 142,
            "iv_atm": 0.0,
            "spot": 5325.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 171,
            "iv_atm": 0.0,
            "spot": 5325.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 200,
            "iv_atm": 0.0,
            "spot": 5325.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 233,
            "iv_atm": 0.0,
            "spot": 5325.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 262,
            "iv_atm": 0.0,
            "spot": 5325.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 293,
            "iv_atm": 0.0,
            "spot": 5325.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 324,
            "iv_atm": 0.0,
            "spot": 5325.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 352,
            "iv_atm": 0.0,
            "spot": 5325.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5325.5,
                    "lower": 5325.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5325.5,
                    "lower": 5325.5,
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
            -0.6183824488974732,
            -1865.9995249488659,
            -2848.354685855714,
            -10.691214191233644,
            -1017.7885219362578,
            -5138.18995646819,
            -251.5251382232151,
            12.27830187847308,
            1391.9228548859865,
            553.9352053634809,
            121.78838906453998,
            4530.626734384324,
            276.7945206774861
        ],
        "vanna": [
            -10.291815652356012,
            -16391.228941469755,
            -9358.534379770928,
            -345.9716860469719,
            -4198.867284638679,
            -6836.543965668021,
            -1037.416143061381,
            -129.95524748092697,
            1816.4081216048755,
            936.3927832686609,
            304.57759221671347,
            27309.26228694991,
            2271.9344951520256
        ],
        "vex": [
            2580.9181037545136,
            4953719.717868602,
            2000909.1674245403,
            202594.32237656869,
            2129372.7167565175,
            1883529.3990777042,
            685489.1028672963,
            249965.81336226716,
            1089235.1744992165,
            273337.4069767668,
            912282.9035097037,
            12267969.372652465,
            1212812.8540097796
        ],
        "theta": [
            -0.6579873180535549,
            -2686.5540105531973,
            -2664.560738925718,
            -68.70588498388844,
            -1997.0569553292178,
            -5989.65779125029,
            -3001.598771655917,
            -9.902568247251214,
            -2385.8730665227195,
            -567.868451559954,
            -517.7196669728967,
            1051.3299308277128,
            -507.41748492162543
        ],
        "charm_cum": [
            -0.6183824488974732,
            -1866.6179073977632,
            -4714.972593253477,
            -4725.66380744471,
            -5743.452329380968,
            -10881.642285849157,
            -11133.167424072371,
            -11120.889122193897,
            -9728.966267307911,
            -9175.03106194443,
            -9053.24267287989,
            -4522.615938495565,
            -4245.82141781808
        ],
        "vanna_cum": [
            -10.291815652356012,
            -16401.52075712211,
            -25760.05513689304,
            -26106.02682294001,
            -30304.89410757869,
            -37141.43807324671,
            -38178.85421630809,
            -38308.80946378902,
            -36492.401342184145,
            -35556.008558915484,
            -35251.43096669877,
            -7942.168679748858,
            -5670.234184596833
        ],
        "theta_cum": [
            -0.6579873180535549,
            -2687.211997871251,
            -5351.772736796969,
            -5420.478621780858,
            -7417.535577110076,
            -13407.193368360366,
            -16408.79214001628,
            -16418.694708263534,
            -18804.567774786254,
            -19372.436226346206,
            -19890.155893319105,
            -18838.82596249139,
            -19346.243447413017
        ],
        "r_gamma": [
            3112.137778101112,
            12712457.30550686,
            11224789.888304476,
            401512.0429509638,
            7317663.355649317,
            23670778.067575708,
            7806453.2513450645,
            -199342.3503022429,
            -6229401.063835954,
            -1563232.9671965227,
            -976518.8008115314,
            -17053081.613796197,
            -1156024.8664811908
        ],
        "r_gamma_cum": [
            3112.137778101112,
            12715569.443284962,
            23940359.331589438,
            24341871.374540403,
            31659534.73018972,
            55330312.79776543,
            63136766.04911049,
            62937423.698808245,
            56708022.63497229,
            55144789.667775765,
            54168270.866964236,
            37115189.25316804,
            35959164.38668685
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.2384640927152598,
            "gamma": 3112.137778101112,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -977.725451010645,
            "gamma": 12712457.30550686,
            "volume": 160,
            "oi": 8900,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -601.1451635656439,
            "gamma": 11224789.888304476,
            "volume": 35,
            "oi": 4883,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -45.143308855535615,
            "gamma": 401512.0429509638,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -118.23599778259691,
            "gamma": 7317663.355649317,
            "volume": 295,
            "oi": 2540,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -915.8476498765015,
            "gamma": 23670778.067575708,
            "volume": 245,
            "oi": 4075,
            "iv": 11.82
        },
        {
            "strike": 5300.0,
            "delta": 679.1549064388063,
            "gamma": 7806453.2513450645,
            "volume": 885,
            "oi": 1195,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": -42.79027890507836,
            "gamma": 199342.3503022429,
            "volume": 130,
            "oi": 130,
            "iv": 11.82
        },
        {
            "strike": 5450.0,
            "delta": 533.0075209168378,
            "gamma": 6229401.063835954,
            "volume": 450,
            "oi": 1460,
            "iv": 11.82
        },
        {
            "strike": 5550.0,
            "delta": 103.18641061902439,
            "gamma": 1563232.9671965227,
            "volume": 450,
            "oi": 460,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 234.3964766575381,
            "gamma": 976518.8008115314,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5000.196628973632,
            "gamma": 17053081.613796197,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 166.276595991201,
            "gamma": 1156024.8664811908,
            "volume": 500,
            "oi": 1000,
            "iv": 11.82
        }
    ]
};