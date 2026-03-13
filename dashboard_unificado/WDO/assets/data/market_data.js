window.marketData = {
    "last_updated": "2026-03-13 09:16:58",
    "spot_price": 5258.5,
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-03-13",
        "meetings": [
            {
                "date": "2026-03-18",
                "days_remaining": 4,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 1.6,
                    "3.50-3.75": 98.4,
                    "3.75-4.00": 0.4
                }
            },
            {
                "date": "2026-04-29",
                "days_remaining": 46,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.1,
                    "3.25-3.50": 7.8,
                    "3.50-3.75": 92.1,
                    "3.75-4.00": 0.4
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 95,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 1.8,
                    "3.25-3.50": 26.6,
                    "3.50-3.75": 71.6,
                    "3.75-4.00": 0.3
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 137,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.3,
                    "3.00-3.25": 6.2,
                    "3.25-3.50": 34.6,
                    "3.50-3.75": 58.9,
                    "3.75-4.00": 0.3
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 186,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.1,
                    "2.75-3.00": 1.3,
                    "3.00-3.25": 10.9,
                    "3.25-3.50": 38.6,
                    "3.50-3.75": 49.2,
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
                    "2.50-2.75": 0.2,
                    "2.75-3.00": 2.4,
                    "3.00-3.25": 14.1,
                    "3.25-3.50": 39.8,
                    "3.50-3.75": 43.5,
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
                    "2.25-2.50": 0.1,
                    "2.50-2.75": 0.7,
                    "2.75-3.00": 5.0,
                    "3.00-3.25": 19.7,
                    "3.25-3.50": 40.6,
                    "3.50-3.75": 33.9,
                    "3.75-4.00": 0.2
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 13/03/2026 09:16\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(2);\n  spot(5258.50);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 4500.00;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (4500.00)\n  // 2 = Spline (4940.64)\n  // 3 = HVL (4500.00)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (4500.00)\n  // 7 = HVL Gaussian (4500.00)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 4500.00;\n  if (ModeloFlip = 2) then GammaVal := 4940.64;\n  if (ModeloFlip = 3) then GammaVal := 4500.00;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 4500.00;\n  if (ModeloFlip = 7) then GammaVal := 4500.00;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5219.35 <= LimitUpper) and (5219.35 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5219.35, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5297.65 <= LimitUpper) and (5297.65 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5297.65, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5441.31 <= LimitUpper) and (5441.31 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5441.31, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5450.00 <= LimitUpper) and (5450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5550.00 <= LimitUpper) and (5550.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5550.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5879.43 <= LimitUpper) and (5879.43 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5879.43, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirMaxPain) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5572.38 > 0) then\n      HorizontalLineCustom(5572.38, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5275.00 <= LimitUpper) and (5275.00 >= LimitLower) then\n      HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5400.00 <= LimitUpper) and (5400.00 >= LimitLower) then\n      HorizontalLineCustom(5400.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5500.00 <= LimitUpper) and (5500.00 >= LimitLower) then\n      HorizontalLineCustom(5500.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5575.00 <= LimitUpper) and (5575.00 >= LimitLower) then\n      HorizontalLineCustom(5575.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5800.00 <= LimitUpper) and (5800.00 >= LimitLower) then\n      HorizontalLineCustom(5800.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5411.80 <= LimitUpper) and (5411.80 >= LimitLower) then\n      HorizontalLineCustom(5411.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5488.20 <= LimitUpper) and (5488.20 >= LimitLower) then\n      HorizontalLineCustom(5488.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5511.80 <= LimitUpper) and (5511.80 >= LimitLower) then\n      HorizontalLineCustom(5511.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5569.10 <= LimitUpper) and (5569.10 >= LimitLower) then\n      HorizontalLineCustom(5569.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5580.90 <= LimitUpper) and (5580.90 >= LimitLower) then\n      HorizontalLineCustom(5580.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5752.80 <= LimitUpper) and (5752.80 >= LimitLower) then\n      HorizontalLineCustom(5752.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5847.20 <= LimitUpper) and (5847.20 >= LimitLower) then\n      HorizontalLineCustom(5847.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5261.80 <= LimitUpper) and (5261.80 >= LimitLower) then\n      HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5373.60 <= LimitUpper) and (5373.60 >= LimitLower) then\n      HorizontalLineCustom(5373.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5426.40 <= LimitUpper) and (5426.40 >= LimitLower) then\n      HorizontalLineCustom(5426.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5473.60 <= LimitUpper) and (5473.60 >= LimitLower) then\n      HorizontalLineCustom(5473.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5526.40 <= LimitUpper) and (5526.40 >= LimitLower) then\n      HorizontalLineCustom(5526.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5588.20 <= LimitUpper) and (5588.20 >= LimitLower) then\n      HorizontalLineCustom(5588.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5694.40 <= LimitUpper) and (5694.40 >= LimitLower) then\n      HorizontalLineCustom(5694.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5905.60 <= LimitUpper) and (5905.60 >= LimitLower) then\n      HorizontalLineCustom(5905.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5266.39, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5250.61, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5274.28, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5242.72, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5288.92, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5228.08, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5296.81, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5220.19, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 37588,
        "total_volume": 3645,
        "gamma_exposure": 100282282.1918685,
        "delta_position": -8413.480495986441,
        "last_update": "2026-03-13T09:16:58.118770",
        "spot_price": 5258.5,
        "dealer_pressure": 0.0805920256320655,
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
        "range_low": 5219.345734228015,
        "range_high": 5297.654265771985,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5297.654265771985,
                "sigma_1_down": 5219.345734228015,
                "sigma_2_up": 5336.808531543969,
                "sigma_2_down": 5180.191468456031
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5346.051599875251,
                "sigma_1_down": 5170.948400124749,
                "sigma_2_up": 5433.603199750502,
                "sigma_2_down": 5083.396800249498
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 210,
                "sigma_1_up": 5825.899216522261,
                "sigma_1_down": 4691.100783477739,
                "sigma_2_up": 6393.2984330445215,
                "sigma_2_down": 4123.7015669554785
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
                4469.724999999999,
                4501.919897959183,
                4534.114795918367,
                4566.309693877551,
                4598.504591836734,
                4630.6994897959175,
                4662.894387755102,
                4695.089285714285,
                4727.284183673469,
                4759.479081632652,
                4791.6739795918365,
                4823.86887755102,
                4856.063775510203,
                4888.258673469387,
                4920.453571428571,
                4952.648469387755,
                4984.843367346938,
                5017.038265306122,
                5049.233163265306,
                5081.428061224489,
                5113.622959183673,
                5145.817857142857,
                5178.0127551020405,
                5210.207653061224,
                5242.402551020407,
                5274.597448979592,
                5306.792346938775,
                5338.987244897959,
                5371.182142857142,
                5403.377040816326,
                5435.57193877551,
                5467.766836734693,
                5499.961734693878,
                5532.156632653061,
                5564.3515306122445,
                5596.546428571428,
                5628.741326530611,
                5660.936224489796,
                5693.131122448979,
                5725.326020408163,
                5757.520918367347,
                5789.71581632653,
                5821.910714285714,
                5854.105612244897,
                5886.300510204082,
                5918.495408163265,
                5950.690306122448,
                5982.885204081633,
                6015.080102040816,
                6047.275
            ],
            "deltas": [
                -26317.568317227026,
                -26128.323891828615,
                -25907.624693913192,
                -25652.380488597122,
                -25359.52947136356,
                -25026.107952649592,
                -24649.342892132012,
                -24226.765686305087,
                -23756.33526248205,
                -23236.54403483376,
                -22666.464586182792,
                -22045.684875829047,
                -21374.086198574027,
                -20651.453026527604,
                -19876.97311951282,
                -19048.779552519663,
                -18163.770044377965,
                -17217.961154992772,
                -16207.546721207193,
                -15130.61889705237,
                -13989.226704078466,
                -12791.20115953518,
                -11551.095072994347,
                -10289.747251246417,
                -9032.359929179624,
                -7805.442893644673,
                -6633.345098046603,
                -5535.217887264278,
                -4523.092673782741,
                -3601.389491546145,
                -2767.754701286634,
                -2014.8076518441812,
                -1332.243761289276,
                -708.7951613618931,
                -133.72409846086822,
                402.2694015158685,
                906.6765533187472,
                1385.2017931863159,
                1842.0108040334312,
                2280.063322438529,
                2701.436339556201,
                3107.589864108528,
                3499.56217807034,
                3878.1017792449466,
                4243.751488271914,
                4596.900828475475,
                4937.819721473039,
                5266.682481602454,
                5583.587468287478,
                5888.575085031043
            ],
            "flip_value": 5572.383780452622
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
                4469.724999999999,
                4501.919897959183,
                4534.114795918367,
                4566.309693877551,
                4598.504591836734,
                4630.6994897959175,
                4662.894387755102,
                4695.089285714285,
                4727.284183673469,
                4759.479081632652,
                4791.6739795918365,
                4823.86887755102,
                4856.063775510203,
                4888.258673469387,
                4920.453571428571,
                4952.648469387755,
                4984.843367346938,
                5017.038265306122,
                5049.233163265306,
                5081.428061224489,
                5113.622959183673,
                5145.817857142857,
                5178.0127551020405,
                5210.207653061224,
                5242.402551020407,
                5274.597448979592,
                5306.792346938775,
                5338.987244897959,
                5371.182142857142,
                5403.377040816326,
                5435.57193877551,
                5467.766836734693,
                5499.961734693878,
                5532.156632653061,
                5564.3515306122445,
                5596.546428571428,
                5628.741326530611,
                5660.936224489796,
                5693.131122448979,
                5725.326020408163,
                5757.520918367347,
                5789.71581632653,
                5821.910714285714,
                5854.105612244897,
                5886.300510204082,
                5918.495408163265,
                5950.690306122448,
                5982.885204081633,
                6015.080102040816,
                6047.275
            ],
            "pnl": [
                -16815807.67958072,
                -15899025.314599805,
                -14998058.165371977,
                -14113646.14039765,
                -13246497.633010536,
                -12397284.927133769,
                -11566640.06521589,
                -10755151.223506015,
                -9963359.627283849,
                -9191757.026015576,
                -8440783.736041874,
                -7710827.246677277,
                -7002221.37480873,
                -6315245.943478155,
                -5650126.95170577,
                -5007037.196087795,
                -4386097.299547167,
                -3787377.099041193,
                -3210897.341987646,
                -2656631.6405719714,
                -2124508.633814574,
                -1614414.3091469975,
                -1126194.4380921712,
                -659657.0842728931,
                -214575.14618731756,
                209311.0982017517,
                612291.4732010085,
                994683.4367250307,
                1356829.6797744595,
                1699095.808081166,
                2021868.1157825422,
                2325551.4572434314,
                2610567.2198774787,
                2877351.3980631894,
                3126352.766014831,
                3358031.1457458204,
                3572855.7650306,
                3771303.699492556,
                3953858.3925733035,
                4121008.24711998,
                4273245.282602018,
                4411063.852479573,
                4534959.416930936,
                4645427.366950496,
                4742961.896698961,
                4828054.921876225,
                4901195.042753234,
                4962866.551308564,
                5013548.482640033,
                5053713.711441268
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
                        "Call_Now": 948.946127251993,
                        "Call_Sim": 989.3072354878377,
                        "Call_Chg": 4.253256014935699,
                        "Put_Now": 6.798684243113598,
                        "Put_Sim": 5.6597924789595595,
                        "Put_Chg": -16.75164963437778
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 521.7362015190556,
                        "Call_Sim": 556.0690352204579,
                        "Call_Chg": 6.580496734066152,
                        "Put_Now": 59.183487064746714,
                        "Put_Sim": 52.0163207661484,
                        "Put_Chg": -12.110077749824779
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 448.83745229196893,
                        "Call_Sim": 481.05758479143697,
                        "Call_Chg": 7.178574857097448,
                        "Put_Now": 82.20368354857305,
                        "Put_Sim": 72.923816048042,
                        "Put_Chg": -11.288870644157576
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 414.5087159727218,
                        "Call_Sim": 445.5698669405683,
                        "Call_Chg": 7.493485606196663,
                        "Put_Now": 95.834420084783,
                        "Put_Sim": 85.3955710526293,
                        "Put_Chg": -10.892588511433207
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 381.678685837388,
                        "Call_Sim": 411.5208035905248,
                        "Call_Chg": 7.8186492619215455,
                        "Put_Now": 110.96386280490583,
                        "Put_Sim": 99.30598055804239,
                        "Put_Chg": -10.506016960999332
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 350.3981887151608,
                        "Call_Sim": 378.96890616802057,
                        "Call_Chg": 8.153785713796863,
                        "Put_Now": 127.64283853813617,
                        "Put_Sim": 114.71355599099638,
                        "Put_Chg": -10.129265922958048
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 320.7066741869744,
                        "Call_Sim": 347.9622290545899,
                        "Call_Chg": 8.498592970262074,
                        "Put_Now": 145.9107968654066,
                        "Put_Sim": 131.6663517330221,
                        "Put_Chg": -9.762433924286007
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 292.63164247901204,
                        "Call_Sim": 318.537594295462,
                        "Call_Chg": 8.852751396598526,
                        "Put_Now": 165.79523801290134,
                        "Put_Sim": 150.2011898293506,
                        "Put_Chg": -9.405606801769114
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 241.37984850032808,
                        "Call_Sim": 264.52281452555553,
                        "Call_Chg": 9.58777883448543,
                        "Put_Now": 210.46238974513153,
                        "Put_Sim": 192.10535577035898,
                        "Put_Chg": -8.722239634835843
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 948.946127251993,
                        "Call_Sim": 940.7037880004436,
                        "Call_Chg": -0.8685782063748867,
                        "Put_Now": 6.798684243113598,
                        "Put_Sim": 7.056344991564856,
                        "Put_Chg": 3.7898619679571524
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 521.7362015190556,
                        "Call_Sim": 514.8012335337462,
                        "Call_Chg": -1.3292096590418643,
                        "Put_Now": 59.183487064746714,
                        "Put_Sim": 60.74851907943696,
                        "Put_Chg": 2.644372767319542
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 448.83745229196893,
                        "Call_Sim": 442.35126974415925,
                        "Call_Chg": -1.445107246440391,
                        "Put_Now": 82.20368354857305,
                        "Put_Sim": 84.21750100076451,
                        "Put_Chg": 2.4497897968301174
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 414.5087159727218,
                        "Call_Sim": 408.2672800637315,
                        "Call_Chg": -1.5057429840392154,
                        "Put_Now": 95.834420084783,
                        "Put_Sim": 98.09298417579316,
                        "Put_Chg": 2.3567358043300577
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 381.678685837388,
                        "Call_Sim": 375.6936687869311,
                        "Call_Chg": -1.5680773573525664,
                        "Put_Now": 110.96386280490583,
                        "Put_Sim": 113.47884575444891,
                        "Put_Chg": 2.2664882836359697
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 350.3981887151608,
                        "Call_Sim": 344.67956651633904,
                        "Call_Chg": -1.6320353195291353,
                        "Put_Now": 127.64283853813617,
                        "Put_Sim": 130.42421633931463,
                        "Put_Chg": 2.1790316111995987
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 320.7066741869744,
                        "Call_Sim": 315.26255472564435,
                        "Call_Chg": -1.697538560783454,
                        "Put_Now": 145.9107968654066,
                        "Put_Sim": 148.96667740407588,
                        "Put_Chg": 2.0943484679122997
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 292.63164247901204,
                        "Call_Sim": 287.4681383295833,
                        "Call_Chg": -1.764506430571346,
                        "Put_Now": 165.79523801290134,
                        "Put_Sim": 169.13173386347262,
                        "Put_Chg": 2.012419590912287
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 241.37984850032808,
                        "Call_Sim": 236.78758045143695,
                        "Call_Chg": -1.9025068071848121,
                        "Put_Now": 210.46238974513153,
                        "Put_Sim": 214.37012169623995,
                        "Put_Chg": 1.856736472412317
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 948.946127251993,
                        "Call_Sim": 295.4396284425766,
                        "Call_Chg": -68.86655417435279,
                        "Put_Now": 6.798684243113598,
                        "Put_Sim": 111.79218543369802,
                        "Put_Chg": 1544.320892633491
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 521.7362015190556,
                        "Call_Sim": 85.82513887022833,
                        "Call_Chg": -83.55008937076917,
                        "Put_Now": 59.183487064746714,
                        "Put_Sim": 381.772424415919,
                        "Put_Chg": 545.0657832957022
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 448.83745229196893,
                        "Call_Sim": 63.659801331925564,
                        "Call_Chg": -85.8167358791363,
                        "Put_Now": 82.20368354857305,
                        "Put_Sim": 455.52603258853014,
                        "Put_Chg": 454.14309058226803
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 414.5087159727218,
                        "Call_Sim": 54.48047905961846,
                        "Call_Chg": -86.85661435809139,
                        "Put_Now": 95.834420084783,
                        "Put_Sim": 494.30618317168,
                        "Put_Chg": 415.79190726502657
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 381.678685837388,
                        "Call_Sim": 46.43068438480691,
                        "Call_Chg": -87.83513827005042,
                        "Put_Now": 110.96386280490583,
                        "Put_Sim": 534.2158613523247,
                        "Put_Chg": 381.4322860151066
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 350.3981887151608,
                        "Call_Sim": 39.40727294295323,
                        "Call_Chg": -88.75357401604965,
                        "Put_Now": 127.64283853813617,
                        "Put_Sim": 575.1519227659292,
                        "Put_Chg": 350.5947449563256
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 320.7066741869744,
                        "Call_Sim": 33.310030228244955,
                        "Call_Chg": -89.6135525359148,
                        "Put_Now": 145.9107968654066,
                        "Put_Sim": 617.0141529066773,
                        "Put_Chg": 322.870799256777
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 292.63164247901204,
                        "Call_Sim": 28.042883266682793,
                        "Call_Chg": -90.41700240304871,
                        "Put_Now": 165.79523801290134,
                        "Put_Sim": 659.7064788005714,
                        "Put_Chg": 297.9043588388446
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 241.37984850032808,
                        "Call_Sim": 19.64072671288767,
                        "Call_Chg": -91.86314564578866,
                        "Put_Now": 210.46238974513153,
                        "Put_Sim": 747.2232679576905,
                        "Put_Chg": 255.03885937177307
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5311.085,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 948.946127251993,
                        "Call_Sim": 1000.1191468975367,
                        "Call_Chg": 5.392615889980307,
                        "Put_Now": 6.798684243113598,
                        "Put_Sim": 5.386703888659156,
                        "Put_Chg": -20.768435537871028
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 521.7362015190556,
                        "Call_Sim": 565.3678315616112,
                        "Call_Chg": 8.362776038066814,
                        "Put_Now": 59.183487064746714,
                        "Put_Sim": 50.23011710730191,
                        "Put_Chg": -15.128155506703791
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 448.83745229196893,
                        "Call_Sim": 489.81426188509977,
                        "Call_Chg": 9.129543308804678,
                        "Put_Now": 82.20368354857305,
                        "Put_Sim": 70.59549314170454,
                        "Put_Chg": -14.121253337764836
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 414.5087159727218,
                        "Call_Sim": 454.0272807848701,
                        "Call_Chg": 9.53383204968576,
                        "Put_Now": 95.834420084783,
                        "Put_Sim": 82.76798489693124,
                        "Put_Chg": -13.634386451435846
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 381.678685837388,
                        "Call_Sim": 419.66213395038403,
                        "Call_Chg": 9.951681747609731,
                        "Put_Now": 110.96386280490583,
                        "Put_Sim": 96.36231091790182,
                        "Put_Chg": -13.15883524411558
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 350.3981887151608,
                        "Call_Sim": 386.77921274526943,
                        "Call_Chg": 10.382766007869638,
                        "Put_Now": 127.64283853813617,
                        "Put_Sim": 111.43886256824499,
                        "Put_Chg": -12.694778771352603
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 320.7066741869744,
                        "Call_Sim": 355.4287176775192,
                        "Call_Chg": 10.826729309132372,
                        "Put_Now": 145.9107968654066,
                        "Put_Sim": 128.0478403559514,
                        "Put_Chg": -12.242381573676589
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 292.63164247901204,
                        "Call_Sim": 325.649833347039,
                        "Call_Chg": 11.283192271456114,
                        "Put_Now": 165.79523801290134,
                        "Put_Sim": 146.22842888092714,
                        "Put_Chg": -11.8017919974587
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 241.37984850032808,
                        "Call_Sim": 270.9054560614263,
                        "Call_Chg": 12.232010146886022,
                        "Put_Now": 210.46238974513153,
                        "Put_Sim": 187.40299730622928,
                        "Put_Chg": -10.956538347220619
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5205.915,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 948.946127251993,
                        "Call_Sim": 898.1036317706903,
                        "Call_Chg": -5.3577852336607314,
                        "Put_Now": 6.798684243113598,
                        "Put_Sim": 8.541188761811242,
                        "Put_Chg": 25.63002569890828
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 521.7362015190556,
                        "Call_Sim": 479.39295462265545,
                        "Call_Chg": -8.115834548784639,
                        "Put_Now": 59.183487064746714,
                        "Put_Sim": 69.42524016834591,
                        "Put_Chg": 17.305085610103912
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 448.83745229196893,
                        "Call_Sim": 409.35664776721933,
                        "Call_Chg": -8.79623666054216,
                        "Put_Now": 82.20368354857305,
                        "Put_Sim": 95.30787902382463,
                        "Put_Chg": 15.941129289551215
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 414.5087159727218,
                        "Call_Sim": 376.58063996925466,
                        "Call_Chg": -9.150127498395747,
                        "Put_Now": 95.834420084783,
                        "Put_Sim": 110.49134408131636,
                        "Put_Chg": 15.294008127316502
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 381.678685837388,
                        "Call_Sim": 345.371635126005,
                        "Call_Chg": -9.51246481886374,
                        "Put_Now": 110.96386280490583,
                        "Put_Sim": 127.2418120935231,
                        "Put_Chg": 14.669595016926177
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 350.3981887151608,
                        "Call_Sim": 315.76933864705506,
                        "Call_Chg": -9.882713776313379,
                        "Put_Now": 127.64283853813617,
                        "Put_Sim": 145.59898847003092,
                        "Put_Chg": 14.067495002103028
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 320.7066741869744,
                        "Call_Sim": 287.80111983122606,
                        "Call_Chg": -10.26032727231743,
                        "Put_Now": 145.9107968654066,
                        "Put_Sim": 165.5902425096583,
                        "Put_Chg": 13.487312842520305
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 292.63164247901204,
                        "Call_Sim": 261.48173056038286,
                        "Call_Chg": -10.644751761888942,
                        "Put_Now": 165.79523801290134,
                        "Put_Sim": 187.23032609427128,
                        "Put_Chg": 12.928651231648747
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 241.37984850032808,
                        "Call_Sim": 213.78574260297137,
                        "Call_Chg": -11.43181838450744,
                        "Put_Now": 210.46238974513153,
                        "Put_Sim": 235.4532838477753,
                        "Put_Chg": 11.874280308661122
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
                        "Call_Now": 99.07700338700033,
                        "Call_Sim": 130.1481603065863,
                        "Call_Chg": 31.360614327646037,
                        "Put_Now": 27.181588234115452,
                        "Put_Sim": 16.75274515370097,
                        "Put_Chg": -38.36730580490989
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 67.89760264214237,
                        "Call_Sim": 93.7814477285965,
                        "Call_Chg": 38.121883658950665,
                        "Put_Now": 45.873385420480645,
                        "Put_Sim": 30.257230506934775,
                        "Put_Chg": -34.04186277164074
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 43.63288550047855,
                        "Call_Sim": 63.777364937505354,
                        "Call_Chg": 46.168111977847225,
                        "Put_Now": 71.47986621003838,
                        "Put_Sim": 50.124345647064274,
                        "Put_Chg": -29.876273831042806
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 99.07700338700033,
                        "Call_Sim": 93.21151476884643,
                        "Call_Chg": -5.920131228881617,
                        "Put_Now": 27.181588234115452,
                        "Put_Sim": 29.816099615961093,
                        "Put_Chg": 9.692264334057866
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 67.89760264214237,
                        "Call_Sim": 63.17569168337786,
                        "Call_Chg": -6.954459030978712,
                        "Put_Now": 45.873385420480645,
                        "Put_Sim": 49.65147446171477,
                        "Put_Chg": 8.235906302976623
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 43.63288550047855,
                        "Call_Sim": 40.10107139755064,
                        "Call_Chg": -8.094385834026895,
                        "Put_Now": 71.47986621003838,
                        "Put_Sim": 76.44805210711002,
                        "Put_Chg": 6.950468936907328
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5200.0,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 99.07700338700033,
                        "Call_Sim": 62.57401842925083,
                        "Call_Chg": -36.84304501536729,
                        "Put_Now": 27.181588234115452,
                        "Put_Sim": 49.178603276365266,
                        "Put_Chg": 80.92615800367945
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 67.89760264214237,
                        "Call_Sim": 39.532604678535336,
                        "Call_Chg": -41.77614062915615,
                        "Put_Now": 45.873385420480645,
                        "Put_Sim": 76.0083874568736,
                        "Put_Chg": 65.69168976776429
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 43.63288550047855,
                        "Call_Sim": 23.22595167950317,
                        "Call_Chg": -46.769617885462935,
                        "Put_Now": 71.47986621003838,
                        "Put_Sim": 109.57293238906277,
                        "Put_Chg": 53.292022213766735
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5311.085,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 99.07700338700033,
                        "Call_Sim": 139.06581607053704,
                        "Call_Chg": 40.36134654510912,
                        "Put_Now": 27.181588234115452,
                        "Put_Sim": 14.585400917652805,
                        "Put_Chg": -46.34088048119737
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 67.89760264214237,
                        "Call_Sim": 101.45165982305207,
                        "Call_Chg": 49.41861844188813,
                        "Put_Now": 45.873385420480645,
                        "Put_Sim": 26.84244260138985,
                        "Put_Chg": -41.48580412073585
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 43.63288550047855,
                        "Call_Sim": 69.9736847301806,
                        "Call_Chg": 60.36914342832803,
                        "Put_Now": 71.47986621003838,
                        "Put_Sim": 45.2356654397413,
                        "Put_Chg": -36.71551467818981
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5205.915,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 99.07700338700033,
                        "Call_Sim": 65.8389878125954,
                        "Call_Chg": -33.54765933379654,
                        "Put_Now": 27.181588234115452,
                        "Put_Sim": 46.52857265970988,
                        "Put_Chg": 71.17679901173744
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 67.89760264214237,
                        "Call_Sim": 41.96187309364723,
                        "Call_Chg": -38.19829940858247,
                        "Put_Now": 45.873385420480645,
                        "Put_Sim": 72.52265587198508,
                        "Put_Chg": 58.09309735314759
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 43.63288550047855,
                        "Call_Sim": 24.89021069862315,
                        "Call_Chg": -42.95538694467007,
                        "Put_Now": 71.47986621003838,
                        "Put_Sim": 105.32219140818279,
                        "Put_Chg": 47.34525537401147
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.0001415382083407043,
            -0.18236148607516361,
            -0.14404813438590175,
            -0.0012584525507995264,
            0.00964084465829975,
            0.2007159049961046,
            0.19420396700639506,
            -0.0003421359496724231,
            0.1913073956298602,
            0.05458770789240753,
            0.030871189280814348,
            0.3785668767309061,
            0.051677510089629244
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
            -0.32928376582187224,
            -1338.4733460676684,
            -933.5009530910363,
            -55.93314550744881,
            -323.6741470027742,
            -1588.0141604373648,
            475.3110288595889,
            -47.949627473709114,
            384.8280200681962,
            68.07411086429492,
            209.85257768697574,
            -5402.340142154842,
            138.6685720351687
        ],
        "delta_cumulative": [
            -0.32928376582187224,
            -1338.8026298334903,
            -2272.3035829245264,
            -2328.2367284319753,
            -2651.9108754347494,
            -4239.925035872115,
            -3764.6140070125257,
            -3812.5636344862346,
            -3427.7356144180385,
            -3359.6615035537434,
            -3149.808925866768,
            -8552.14906802161,
            -8413.480495986441
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
            4095.738261209805,
            15805179.05223471,
            15031788.55882036,
            449587.98242847883,
            8841892.509418085,
            28611999.534573544,
            8011731.338514849,
            207831.73555144493,
            5413189.683606114,
            1206448.4084802552,
            959609.7818650053,
            14714221.668745039,
            1024706.1993694014
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            3234699.0807353375,
            240031.0046124315,
            7918627.78629596,
            0.0,
            5413189.683606114,
            1206448.4084802552,
            959609.7818650053,
            6256251.241003614,
            1024706.1993694014
        ],
        "gamma_put": [
            4095.738261209805,
            15805179.05223471,
            15031788.55882036,
            449587.98242847883,
            5607193.428682747,
            28371968.529961113,
            93103.55221888928,
            207831.73555144493,
            0.0,
            0.0,
            0.0,
            8457970.427741425,
            0.0
        ],
        "gamma_exposure": [
            4095.738261209805,
            15809274.790495919,
            30841063.349316277,
            31290651.331744757,
            40132543.841162845,
            68744543.37573639,
            76756274.71425124,
            76964106.44980268,
            82377296.1334088,
            83583744.54188906,
            84543354.32375406,
            99257575.9924991,
            100282282.1918685
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
            "abs_call": 10796665.759494038,
            "abs_put": 28269664.139507044,
            "net": 39066329.899001084
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 35,
            "abs_call": 6619638.092086369,
            "abs_put": 14993227.821080366,
            "net": 21612865.91316674
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 56,
            "abs_call": 356661.10753725923,
            "abs_put": 0.0,
            "net": 356661.10753725923
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 78,
            "abs_call": 0.0,
            "abs_put": 21384957.820801362,
            "net": 21384957.820801362
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 101,
            "abs_call": 0.0,
            "abs_put": 449587.98242847883,
            "net": 449587.98242847883
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 122,
            "abs_call": 45543.715027244245,
            "abs_put": 0.0,
            "net": 45543.715027244245
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 144,
            "abs_call": 6256251.241003614,
            "abs_put": 8457970.427741425,
            "net": 14714221.668745039
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 166,
            "abs_call": 0.0,
            "abs_put": 31510.39837730238,
            "net": 31510.39837730238
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 187,
            "abs_call": 959609.7818650053,
            "abs_put": 0.0,
            "net": 959609.7818650053
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 210,
            "abs_call": 1024706.1993694014,
            "abs_put": 0.0,
            "net": 1024706.1993694014
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 231,
            "abs_call": 0.0,
            "abs_put": 102304.39045406855,
            "net": 102304.39045406855
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 251,
            "abs_call": 194487.28958518727,
            "abs_put": 339496.0255103273,
            "net": 533983.3150955145
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
            "spot": 5258.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 47,
            "iv_atm": 0.0,
            "spot": 5258.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 79,
            "iv_atm": 0.0,
            "spot": 5258.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 109,
            "iv_atm": 0.0,
            "spot": 5258.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 142,
            "iv_atm": 0.0,
            "spot": 5258.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 171,
            "iv_atm": 0.0,
            "spot": 5258.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 200,
            "iv_atm": 0.0,
            "spot": 5258.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 233,
            "iv_atm": 0.0,
            "spot": 5258.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 262,
            "iv_atm": 0.0,
            "spot": 5258.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 293,
            "iv_atm": 0.0,
            "spot": 5258.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 324,
            "iv_atm": 0.0,
            "spot": 5258.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 352,
            "iv_atm": 0.0,
            "spot": 5258.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5258.5,
                    "lower": 5258.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5258.5,
                    "lower": 5258.5,
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
            -0.7351076739803608,
            -1673.4789268581972,
            -2449.6439842313007,
            2.2315635202267092,
            -401.99429030263235,
            741.2027089404361,
            1626.5457686715051,
            15.44302172525035,
            1703.021798725685,
            537.4299196250607,
            136.05210866196953,
            4235.239027918364,
            260.9199017443471
        ],
        "vanna": [
            -12.662901871720338,
            -17041.60179524113,
            -9344.711491806678,
            -291.26169898657906,
            -3084.0864172213164,
            -2085.5650069326425,
            660.6424670324416,
            -90.76038341534553,
            2739.0048684293965,
            978.546623285867,
            506.1504724300114,
            26671.150057935818,
            2230.2695090427064
        ],
        "vex": [
            3353.8921491532847,
            6081389.676921638,
            2636387.002102634,
            223998.37998203008,
            2376828.4560740567,
            2197692.076911757,
            698743.8045565273,
            257332.35557405223,
            934609.3027324702,
            208298.2440551174,
            885207.4952836477,
            10452221.297200367,
            1061518.2572286476
        ],
        "theta": [
            -0.8378529005362318,
            -3162.2874803148234,
            -3383.891211463348,
            -69.90261062901337,
            -2198.582662938861,
            -6636.6631245871295,
            -2818.420242615698,
            -6.220075422282234,
            -1969.1668588865984,
            -421.167718692597,
            -483.3914553948964,
            2218.8539022398145,
            -435.8471394460129
        ],
        "charm_cum": [
            -0.7351076739803608,
            -1674.2140345321775,
            -4123.858018763478,
            -4121.626455243251,
            -4523.620745545883,
            -3782.4180366054475,
            -2155.8722679339426,
            -2140.4292462086923,
            -437.40744748300745,
            100.02247214205329,
            236.07458080402282,
            4471.313608722387,
            4732.233510466734
        ],
        "vanna_cum": [
            -12.662901871720338,
            -17054.264697112852,
            -26398.97618891953,
            -26690.237887906107,
            -29774.324305127422,
            -31859.889312060066,
            -31199.246845027625,
            -31290.00722844297,
            -28551.002360013572,
            -27572.455736727705,
            -27066.305264297695,
            -395.1552063618765,
            1835.11430268083
        ],
        "theta_cum": [
            -0.8378529005362318,
            -3163.1253332153597,
            -6547.016544678708,
            -6616.919155307721,
            -8815.501818246583,
            -15452.164942833711,
            -18270.58518544941,
            -18276.805260871693,
            -20245.97211975829,
            -20667.139838450887,
            -21150.531293845783,
            -18931.67739160597,
            -19367.524531051982
        ],
        "r_gamma": [
            4095.738261209805,
            15805179.05223471,
            15031788.55882036,
            449587.98242847883,
            8841892.509418085,
            28611999.534573544,
            -8011731.338514849,
            -207831.73555144493,
            -5413189.683606114,
            -1206448.4084802552,
            -959609.7818650053,
            -14714221.668745039,
            -1024706.1993694014
        ],
        "r_gamma_cum": [
            4095.738261209805,
            15809274.790495919,
            30841063.349316277,
            31290651.331744757,
            40132543.841162845,
            68744543.37573639,
            60732812.037221536,
            60524980.30167009,
            55111790.61806397,
            53905342.209583715,
            52945732.42771871,
            38231510.758973666,
            37206804.559604265
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.32928376582187224,
            "gamma": 4095.738261209805,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -1338.4733460676684,
            "gamma": 15805179.05223471,
            "volume": 160,
            "oi": 8900,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -933.5009530910363,
            "gamma": 15031788.55882036,
            "volume": 380,
            "oi": 4883,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -55.93314550744881,
            "gamma": 449587.98242847883,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -323.6741470027742,
            "gamma": 8841892.509418085,
            "volume": 295,
            "oi": 2540,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -1588.0141604373648,
            "gamma": 28611999.534573544,
            "volume": 220,
            "oi": 4075,
            "iv": 11.82
        },
        {
            "strike": 5300.0,
            "delta": 475.3110288595889,
            "gamma": 8011731.338514849,
            "volume": 285,
            "oi": 1195,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": -47.949627473709114,
            "gamma": 207831.73555144493,
            "volume": 130,
            "oi": 130,
            "iv": 11.82
        },
        {
            "strike": 5450.0,
            "delta": 384.8280200681962,
            "gamma": 5413189.683606114,
            "volume": 450,
            "oi": 1460,
            "iv": 11.82
        },
        {
            "strike": 5550.0,
            "delta": 68.07411086429492,
            "gamma": 1206448.4084802552,
            "volume": 450,
            "oi": 460,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 209.85257768697574,
            "gamma": 959609.7818650053,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5402.340142154842,
            "gamma": 14714221.668745039,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 138.6685720351687,
            "gamma": 1024706.1993694014,
            "volume": 500,
            "oi": 1000,
            "iv": 11.82
        }
    ]
};