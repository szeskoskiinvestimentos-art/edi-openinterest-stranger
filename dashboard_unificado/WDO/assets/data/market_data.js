window.marketData = {
    "last_updated": "2026-03-13 15:31:47",
    "spot_price": 5324.5,
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
                    "3.00-3.25": 8.7,
                    "3.25-3.50": 36.3,
                    "3.50-3.75": 54.1,
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
                    "2.75-3.00": 1.8,
                    "3.00-3.25": 11.9,
                    "3.25-3.50": 38.3,
                    "3.50-3.75": 47.9,
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
                    "2.50-2.75": 0.5,
                    "2.75-3.00": 4.0,
                    "3.00-3.25": 17.7,
                    "3.25-3.50": 40.4,
                    "3.50-3.75": 37.3,
                    "3.75-4.00": 0.2
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 13/03/2026 15:31\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(2);\n  spot(5324.50);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 4500.00;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (4500.00)\n  // 2 = Spline (4937.99)\n  // 3 = HVL (4500.00)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (4500.00)\n  // 7 = HVL Gaussian (4500.00)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 4500.00;\n  if (ModeloFlip = 2) then GammaVal := 4937.99;\n  if (ModeloFlip = 3) then GammaVal := 4500.00;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 4500.00;\n  if (ModeloFlip = 7) then GammaVal := 4500.00;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5284.85 <= LimitUpper) and (5284.85 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5284.85, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5364.15 <= LimitUpper) and (5364.15 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5364.15, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5441.31 <= LimitUpper) and (5441.31 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5441.31, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5450.00 <= LimitUpper) and (5450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5550.00 <= LimitUpper) and (5550.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5550.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5879.43 <= LimitUpper) and (5879.43 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5879.43, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirMaxPain) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5572.28 > 0) then\n      HorizontalLineCustom(5572.28, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5275.00 <= LimitUpper) and (5275.00 >= LimitLower) then\n      HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5400.00 <= LimitUpper) and (5400.00 >= LimitLower) then\n      HorizontalLineCustom(5400.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5500.00 <= LimitUpper) and (5500.00 >= LimitLower) then\n      HorizontalLineCustom(5500.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5575.00 <= LimitUpper) and (5575.00 >= LimitLower) then\n      HorizontalLineCustom(5575.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5800.00 <= LimitUpper) and (5800.00 >= LimitLower) then\n      HorizontalLineCustom(5800.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5411.80 <= LimitUpper) and (5411.80 >= LimitLower) then\n      HorizontalLineCustom(5411.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5488.20 <= LimitUpper) and (5488.20 >= LimitLower) then\n      HorizontalLineCustom(5488.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5511.80 <= LimitUpper) and (5511.80 >= LimitLower) then\n      HorizontalLineCustom(5511.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5569.10 <= LimitUpper) and (5569.10 >= LimitLower) then\n      HorizontalLineCustom(5569.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5580.90 <= LimitUpper) and (5580.90 >= LimitLower) then\n      HorizontalLineCustom(5580.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5752.80 <= LimitUpper) and (5752.80 >= LimitLower) then\n      HorizontalLineCustom(5752.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5847.20 <= LimitUpper) and (5847.20 >= LimitLower) then\n      HorizontalLineCustom(5847.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5261.80 <= LimitUpper) and (5261.80 >= LimitLower) then\n      HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5373.60 <= LimitUpper) and (5373.60 >= LimitLower) then\n      HorizontalLineCustom(5373.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5426.40 <= LimitUpper) and (5426.40 >= LimitLower) then\n      HorizontalLineCustom(5426.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5473.60 <= LimitUpper) and (5473.60 >= LimitLower) then\n      HorizontalLineCustom(5473.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5526.40 <= LimitUpper) and (5526.40 >= LimitLower) then\n      HorizontalLineCustom(5526.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5588.20 <= LimitUpper) and (5588.20 >= LimitLower) then\n      HorizontalLineCustom(5588.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5694.40 <= LimitUpper) and (5694.40 >= LimitLower) then\n      HorizontalLineCustom(5694.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5905.60 <= LimitUpper) and (5905.60 >= LimitLower) then\n      HorizontalLineCustom(5905.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5332.49, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5316.51, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5340.47, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5308.53, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5355.31, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5293.69, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5363.29, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5285.71, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 37588,
        "total_volume": 4270,
        "gamma_exposure": 90508953.8651911,
        "delta_position": -6019.258496365588,
        "last_update": "2026-03-13T15:31:47.843998",
        "spot_price": 5324.5,
        "dealer_pressure": 0.02943470337393942,
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
        "range_low": 5284.854304820209,
        "range_high": 5364.145695179792,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5364.145695179791,
                "sigma_1_down": 5284.854304820209,
                "sigma_2_up": 5403.791390359583,
                "sigma_2_down": 5245.208609640417
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5413.150469437249,
                "sigma_1_down": 5235.849530562751,
                "sigma_2_up": 5501.800938874499,
                "sigma_2_down": 5147.199061125501
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 210,
                "sigma_1_up": 5899.020705214943,
                "sigma_1_down": 4749.979294785057,
                "sigma_2_up": 6473.541410429885,
                "sigma_2_down": 4175.458589570115
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
                4525.825,
                4558.4239795918365,
                4591.022959183673,
                4623.62193877551,
                4656.220918367347,
                4688.819897959183,
                4721.41887755102,
                4754.017857142857,
                4786.616836734694,
                4819.21581632653,
                4851.814795918367,
                4884.413775510204,
                4917.0127551020405,
                4949.611734693877,
                4982.210714285714,
                5014.809693877551,
                5047.408673469387,
                5080.007653061224,
                5112.606632653061,
                5145.205612244898,
                5177.804591836734,
                5210.403571428571,
                5243.002551020408,
                5275.6015306122445,
                5308.200510204081,
                5340.799489795918,
                5373.398469387755,
                5405.997448979591,
                5438.596428571428,
                5471.195408163265,
                5503.7943877551015,
                5536.393367346938,
                5568.992346938775,
                5601.591326530612,
                5634.190306122448,
                5666.789285714285,
                5699.388265306122,
                5731.987244897959,
                5764.586224489795,
                5797.185204081632,
                5829.784183673469,
                5862.3831632653055,
                5894.982142857142,
                5927.581122448979,
                5960.180102040816,
                5992.779081632652,
                6025.378061224489,
                6057.977040816326,
                6090.576020408163,
                6123.174999999999
            ],
            "deltas": [
                -25967.630568037865,
                -25718.260290216524,
                -25431.096134757638,
                -25103.029583327003,
                -24731.12782515401,
                -24312.75034213123,
                -23845.679468661387,
                -23328.23970238844,
                -22759.363070644566,
                -22138.544803933055,
                -21465.636438465277,
                -20740.456004530548,
                -19962.265627940626,
                -19129.26746674769,
                -18238.36534046013,
                -17285.474760094203,
                -16266.581132882775,
                -15179.524788791303,
                -14026.181979760227,
                -12814.433049725323,
                -11559.206843643455,
                -10282.056663707817,
                -9009.134804509951,
                -7767.9443737926,
                -6583.652853991967,
                -5475.88581916248,
                -4456.736429914792,
                -3530.318422115272,
                -2693.7313717012084,
                -1938.9658327331779,
                -1255.144838307446,
                -630.5710830292176,
                -54.24803581332242,
                483.23090227513774,
                989.3546948045648,
                1469.764429067012,
                1928.5403118654353,
                2368.559382664353,
                2791.8303544594933,
                3199.7615935196004,
                3593.3535304396455,
                3973.326135183328,
                4340.199006444918,
                4694.3410644755395,
                5036.002985112873,
                5365.341058767115,
                5682.4374153830195,
                5987.318918754978,
                6279.975419005983,
                6560.377207445337
            ],
            "flip_value": 5572.282579331258
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
                -380.0,
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
                4525.825,
                4558.4239795918365,
                4591.022959183673,
                4623.62193877551,
                4656.220918367347,
                4688.819897959183,
                4721.41887755102,
                4754.017857142857,
                4786.616836734694,
                4819.21581632653,
                4851.814795918367,
                4884.413775510204,
                4917.0127551020405,
                4949.611734693877,
                4982.210714285714,
                5014.809693877551,
                5047.408673469387,
                5080.007653061224,
                5112.606632653061,
                5145.205612244898,
                5177.804591836734,
                5210.403571428571,
                5243.002551020408,
                5275.6015306122445,
                5308.200510204081,
                5340.799489795918,
                5373.398469387755,
                5405.997448979591,
                5438.596428571428,
                5471.195408163265,
                5503.7943877551015,
                5536.393367346938,
                5568.992346938775,
                5601.591326530612,
                5634.190306122448,
                5666.789285714285,
                5699.388265306122,
                5731.987244897959,
                5764.586224489795,
                5797.185204081632,
                5829.784183673469,
                5862.3831632653055,
                5894.982142857142,
                5927.581122448979,
                5960.180102040816,
                5992.779081632652,
                6025.378061224489,
                6057.977040816326,
                6090.576020408163,
                6123.174999999999
            ],
            "pnl": [
                -14998880.107008815,
                -14142139.738854446,
                -13302924.240491293,
                -12481940.86975582,
                -11679855.549882576,
                -10897288.886108361,
                -10134812.757549115,
                -9392947.509078275,
                -8672159.754179992,
                -7972860.786630341,
                -7295405.58672732,
                -6640092.396942661,
                -6007162.832528667,
                -5396802.484938246,
                -4809141.969991266,
                -4244258.368561723,
                -3702177.005126548,
                -3182873.508709197,
                -2686276.101427757,
                -2212268.061840431,
                -1760690.3133684946,
                -1331344.0920513505,
                -923993.6525264205,
                -538368.9762095297,
                -174168.45097118616,
                168938.50303241983,
                491308.8814755799,
                793323.6330590071,
                1075385.2963349083,
                1337915.742602692,
                1581354.027746276,
                1806154.3528844705,
                2012784.1312899226,
                2201722.1571884453,
                2373456.8707506154,
                2528484.712789841,
                2667308.5623289077,
                2790436.250231173,
                2898379.1424446087,
                2991650.7870101146,
                3070765.6197728533,
                3136237.7246428085,
                3188579.645220818,
                3228301.245585479,
                3255908.6189814704,
                3271903.0440213466,
                3276779.9887852,
                3271028.1638501016,
                3255128.6257948214,
                3229553.93309344
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
                        "Call_Now": 1013.2198539845413,
                        "Call_Sim": 989.3072354878377,
                        "Call_Chg": -2.3600621723573507,
                        "Put_Now": 5.072410975661981,
                        "Put_Sim": 5.6597924789595595,
                        "Put_Chg": 11.579927299185798
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 576.6904980947788,
                        "Call_Sim": 556.0690352204579,
                        "Call_Chg": -3.57582844566512,
                        "Put_Now": 48.137783640469706,
                        "Put_Sim": 52.0163207661484,
                        "Put_Chg": 8.0571576677618
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 500.493443706378,
                        "Call_Sim": 481.05758479143697,
                        "Call_Chg": -3.883339364250169,
                        "Put_Now": 67.85967496298258,
                        "Put_Sim": 72.923816048042,
                        "Put_Chg": 7.462666285716672
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 464.35021770047297,
                        "Call_Sim": 445.5698669405683,
                        "Call_Chg": -4.0444367298690125,
                        "Put_Now": 79.67592181253417,
                        "Put_Sim": 85.3955710526293,
                        "Put_Chg": 7.178642066486063
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 429.60807967486244,
                        "Call_Sim": 411.5208035905248,
                        "Call_Chg": -4.210180613462048,
                        "Put_Now": 92.89325664238072,
                        "Put_Sim": 99.30598055804239,
                        "Put_Chg": 6.903325545307659
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 396.3295962826701,
                        "Call_Sim": 378.96890616802057,
                        "Call_Chg": -4.380366815267444,
                        "Put_Now": 107.57424610564567,
                        "Put_Sim": 114.71355599099638,
                        "Put_Chg": 6.636634830179888
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 364.5674754979641,
                        "Call_Sim": 347.9622290545899,
                        "Call_Chg": -4.554779995306227,
                        "Put_Now": 123.77159817639631,
                        "Put_Sim": 131.6663517330221,
                        "Put_Chg": 6.378485591964635
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 334.3636840510012,
                        "Call_Sim": 318.537594295462,
                        "Call_Chg": -4.733196369832206,
                        "Put_Now": 141.52727958489027,
                        "Put_Sim": 150.2011898293506,
                        "Put_Chg": 6.1287903433893
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 278.7417560718791,
                        "Call_Sim": 264.52281452555553,
                        "Call_Chg": -5.101116440787908,
                        "Put_Now": 181.82429731668208,
                        "Put_Sim": 192.10535577035898,
                        "Put_Chg": 5.654391962681676
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 1013.2198539845413,
                        "Call_Sim": 940.7037880004436,
                        "Call_Chg": -7.156992206471706,
                        "Put_Now": 5.072410975661981,
                        "Put_Sim": 7.056344991564856,
                        "Put_Chg": 39.11224909460258
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 576.6904980947788,
                        "Call_Sim": 514.8012335337462,
                        "Call_Chg": -10.731798905218161,
                        "Put_Now": 48.137783640469706,
                        "Put_Sim": 60.74851907943696,
                        "Put_Chg": 26.19716672698104
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 500.493443706378,
                        "Call_Sim": 442.35126974415925,
                        "Call_Chg": -11.616970150827536,
                        "Put_Now": 67.85967496298258,
                        "Put_Sim": 84.21750100076451,
                        "Put_Chg": 24.105370452636443
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 464.35021770047297,
                        "Call_Sim": 408.2672800637315,
                        "Call_Chg": -12.077723989120107,
                        "Put_Now": 79.67592181253417,
                        "Put_Sim": 98.09298417579316,
                        "Put_Chg": 23.114966158272576
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 429.60807967486244,
                        "Call_Sim": 375.6936687869311,
                        "Call_Chg": -12.549673397375361,
                        "Put_Now": 92.89325664238072,
                        "Put_Sim": 113.47884575444891,
                        "Put_Chg": 22.160477365239043
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 396.3295962826701,
                        "Call_Sim": 344.67956651633904,
                        "Call_Chg": -13.032090020724374,
                        "Put_Now": 107.57424610564567,
                        "Put_Sim": 130.42421633931463,
                        "Put_Chg": 21.24111584405494
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 364.5674754979641,
                        "Call_Sim": 315.26255472564435,
                        "Call_Chg": -13.524223658452792,
                        "Put_Now": 123.77159817639631,
                        "Put_Sim": 148.96667740407588,
                        "Put_Chg": 20.356107215948
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 334.3636840510012,
                        "Call_Sim": 287.4681383295833,
                        "Call_Chg": -14.02531074943677,
                        "Put_Now": 141.52727958489027,
                        "Put_Sim": 169.13173386347262,
                        "Put_Chg": 19.50468797220452
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 278.7417560718791,
                        "Call_Sim": 236.78758045143695,
                        "Call_Chg": -15.051270470443406,
                        "Put_Now": 181.82429731668208,
                        "Put_Sim": 214.37012169623995,
                        "Put_Chg": 17.899601351338124
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 1013.2198539845413,
                        "Call_Sim": 295.4396284425766,
                        "Call_Chg": -70.84150816027297,
                        "Put_Now": 5.072410975661981,
                        "Put_Sim": 111.79218543369802,
                        "Put_Chg": 2103.926021966476
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 576.6904980947788,
                        "Call_Sim": 85.82513887022833,
                        "Call_Chg": -85.11764297248348,
                        "Put_Now": 48.137783640469706,
                        "Put_Sim": 381.772424415919,
                        "Put_Chg": 693.0826796416127
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 500.493443706378,
                        "Call_Sim": 63.659801331925564,
                        "Call_Chg": -87.28059235691556,
                        "Put_Now": 67.85967496298258,
                        "Put_Sim": 455.52603258853014,
                        "Put_Chg": 571.2764728640675
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 464.35021770047297,
                        "Call_Sim": 54.48047905961846,
                        "Call_Chg": -88.2673729907109,
                        "Put_Now": 79.67592181253417,
                        "Put_Sim": 494.30618317168,
                        "Put_Chg": 520.3959388567985
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 429.60807967486244,
                        "Call_Sim": 46.43068438480691,
                        "Call_Chg": -89.19231583820613,
                        "Put_Now": 92.89325664238072,
                        "Put_Sim": 534.2158613523247,
                        "Put_Chg": 475.0857281373418
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 396.3295962826701,
                        "Call_Sim": 39.40727294295323,
                        "Call_Chg": -90.05694419176125,
                        "Put_Now": 107.57424610564567,
                        "Put_Sim": 575.1519227659292,
                        "Put_Chg": 434.6557782994719
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 364.5674754979641,
                        "Call_Sim": 33.310030228244955,
                        "Call_Chg": -90.86313715101802,
                        "Put_Now": 123.77159817639631,
                        "Put_Sim": 617.0141529066773,
                        "Put_Chg": 398.5102899191166
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 334.3636840510012,
                        "Call_Sim": 28.042883266682793,
                        "Call_Chg": -91.61305949051413,
                        "Put_Now": 141.52727958489027,
                        "Put_Sim": 659.7064788005714,
                        "Put_Chg": 366.1337946546688
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 278.7417560718791,
                        "Call_Sim": 19.64072671288767,
                        "Call_Chg": -92.95379099648675,
                        "Put_Now": 181.82429731668208,
                        "Put_Sim": 747.2232679576905,
                        "Put_Chg": 310.9589746722667
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5377.745,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 1013.2198539845413,
                        "Call_Sim": 1065.3766222487693,
                        "Call_Chg": 5.147625962827195,
                        "Put_Now": 5.072410975661981,
                        "Put_Sim": 3.9841792398911196,
                        "Put_Chg": -21.45393464749454
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 576.6904980947788,
                        "Call_Sim": 622.3423320253851,
                        "Call_Chg": 7.916175848471044,
                        "Put_Now": 48.137783640469706,
                        "Put_Sim": 40.54461757107549,
                        "Put_Chg": -15.773817353341125
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 500.493443706378,
                        "Call_Sim": 543.7272969196097,
                        "Call_Chg": 8.638245666729544,
                        "Put_Now": 67.85967496298258,
                        "Put_Sim": 57.84852817621402,
                        "Put_Chg": -14.752718447634239
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 464.35021770047297,
                        "Call_Sim": 506.2350548089048,
                        "Call_Chg": 9.020096365164076,
                        "Put_Now": 79.67592181253417,
                        "Put_Sim": 68.3157589209668,
                        "Put_Chg": -14.257962296685037
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 429.60807967486244,
                        "Call_Sim": 470.05796052810456,
                        "Call_Chg": 9.41553075162263,
                        "Put_Now": 92.89325664238072,
                        "Put_Sim": 80.09813749562295,
                        "Put_Chg": -13.774002128072931
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 396.3295962826701,
                        "Call_Sim": 435.2661178658868,
                        "Call_Chg": 9.824278062606874,
                        "Put_Now": 107.57424610564567,
                        "Put_Sim": 93.26576768886207,
                        "Put_Chg": -13.301025974871013
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 364.5674754979641,
                        "Call_Sim": 401.9211799161085,
                        "Call_Chg": 10.246033156721625,
                        "Put_Now": 123.77159817639631,
                        "Put_Sim": 107.88030259454104,
                        "Put_Chg": -12.839210138667987
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 334.3636840510012,
                        "Call_Sim": 370.07526905930035,
                        "Call_Chg": 10.680461638546843,
                        "Put_Now": 141.52727958489027,
                        "Put_Sim": 123.9938645931893,
                        "Put_Chg": -12.388717597856568
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 278.7417560718791,
                        "Call_Sim": 311.0364546584083,
                        "Call_Chg": 11.585884742076951,
                        "Put_Now": 181.82429731668208,
                        "Put_Sim": 160.8739959032107,
                        "Put_Chg": -11.522278222795707
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5271.255,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 1013.2198539845413,
                        "Call_Sim": 961.330571796525,
                        "Call_Chg": -5.121226354177617,
                        "Put_Now": 5.072410975661981,
                        "Put_Sim": 6.428128787646216,
                        "Put_Chg": 26.727286461785667
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 576.6904980947788,
                        "Call_Sim": 532.2057252959307,
                        "Call_Chg": -7.713803668659899,
                        "Put_Now": 48.137783640469706,
                        "Put_Sim": 56.89801084162093,
                        "Put_Chg": 18.198235437217868
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 500.493443706378,
                        "Call_Sim": 458.6437366474306,
                        "Call_Chg": -8.361689365804988,
                        "Put_Now": 67.85967496298258,
                        "Put_Sim": 79.25496790403577,
                        "Put_Chg": 16.79243666768123
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 464.35021770047297,
                        "Call_Sim": 423.9523849068546,
                        "Call_Chg": -8.699863002902005,
                        "Put_Now": 79.67592181253417,
                        "Put_Sim": 92.5230890189157,
                        "Put_Chg": 16.12427809320994
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 429.60807967486244,
                        "Call_Sim": 390.74180621400683,
                        "Call_Chg": -9.046913989669497,
                        "Put_Now": 92.89325664238072,
                        "Put_Sim": 107.27198318152523,
                        "Put_Chg": 15.47876246227382
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 396.3295962826701,
                        "Call_Sim": 359.0652959449294,
                        "Call_Chg": -9.40235114592932,
                        "Put_Now": 107.57424610564567,
                        "Put_Sim": 123.55494576790466,
                        "Put_Chg": 14.855507001708181
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 364.5674754979641,
                        "Call_Sim": 328.9650412470569,
                        "Call_Chg": -9.765663873958506,
                        "Put_Now": 123.77159817639631,
                        "Put_Sim": 141.41416392548854,
                        "Put_Chg": 14.254131003421694
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 334.3636840510012,
                        "Call_Sim": 300.471483770355,
                        "Call_Chg": -10.13632816519528,
                        "Put_Now": 141.52727958489027,
                        "Put_Sim": 160.8800793042435,
                        "Put_Chg": 13.674254020932503
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 278.7417560718791,
                        "Call_Sim": 248.36564614068539,
                        "Call_Chg": -10.897581460081142,
                        "Put_Now": 181.82429731668208,
                        "Put_Sim": 204.69318738548827,
                        "Put_Chg": 12.577466491717338
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
                        "Call_Now": 150.1638835270187,
                        "Call_Sim": 130.1481603065863,
                        "Call_Chg": -13.32925251419127,
                        "Put_Now": 12.268468374132794,
                        "Put_Sim": 16.75274515370097,
                        "Put_Chg": 36.551235596963025
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 111.13004272235412,
                        "Call_Sim": 93.7814477285965,
                        "Call_Chg": -15.61107560905121,
                        "Put_Now": 23.10582550069239,
                        "Put_Sim": 30.257230506934775,
                        "Put_Chg": 30.950657902389533
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 77.92343570098683,
                        "Call_Sim": 63.777364937505354,
                        "Call_Chg": -18.15380781946493,
                        "Put_Now": 39.77041641054666,
                        "Put_Sim": 50.124345647064274,
                        "Put_Chg": 26.034248999645556
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 150.1638835270187,
                        "Call_Sim": 93.21151476884643,
                        "Call_Chg": -37.92680864432022,
                        "Put_Now": 12.268468374132794,
                        "Put_Sim": 29.816099615961093,
                        "Put_Chg": 143.0303335893684
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 111.13004272235412,
                        "Call_Sim": 63.17569168337786,
                        "Call_Chg": -43.15156357744305,
                        "Put_Now": 23.10582550069239,
                        "Put_Sim": 49.65147446171477,
                        "Put_Chg": 114.88725629052688
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 77.92343570098683,
                        "Call_Sim": 40.10107139755064,
                        "Call_Chg": -48.53785509223537,
                        "Put_Now": 39.77041641054666,
                        "Put_Sim": 76.44805210711002,
                        "Put_Chg": 92.22341380070857
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5200.0,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 150.1638835270187,
                        "Call_Sim": 62.57401842925083,
                        "Call_Chg": -58.32951508743312,
                        "Put_Now": 12.268468374132794,
                        "Put_Sim": 49.178603276365266,
                        "Put_Chg": 300.8536499963997
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 111.13004272235412,
                        "Call_Sim": 39.532604678535336,
                        "Call_Chg": -64.42671692541045,
                        "Put_Now": 23.10582550069239,
                        "Put_Sim": 76.0083874568736,
                        "Put_Chg": 228.95767976173772
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 77.92343570098683,
                        "Call_Sim": 23.22595167950317,
                        "Call_Chg": -70.19388137783427,
                        "Put_Now": 39.77041641054666,
                        "Put_Sim": 109.57293238906277,
                        "Put_Chg": 175.51366638445677
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5377.745,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 150.1638835270187,
                        "Call_Sim": 196.96352558143462,
                        "Call_Chg": 31.165711058608416,
                        "Put_Now": 12.268468374132794,
                        "Put_Sim": 5.82311042854991,
                        "Put_Chg": -52.53596250997777
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 111.13004272235412,
                        "Call_Sim": 153.3297013524416,
                        "Call_Chg": 37.97322271846737,
                        "Put_Now": 23.10582550069239,
                        "Put_Sim": 12.060484130779741,
                        "Put_Chg": -47.80327528043377
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 77.92343570098683,
                        "Call_Sim": 114.0645060572715,
                        "Call_Chg": 46.380232122936256,
                        "Put_Now": 39.77041641054666,
                        "Put_Sim": 22.666486766831213,
                        "Put_Chg": -43.00666472071356
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5271.255,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 150.1638835270187,
                        "Call_Sim": 108.2102532142926,
                        "Call_Chg": -27.938562407502904,
                        "Put_Now": 12.268468374132794,
                        "Put_Sim": 23.55983806140739,
                        "Put_Chg": 92.03569135884686
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 111.13004272235412,
                        "Call_Sim": 75.35989499327707,
                        "Call_Chg": -32.18764867970467,
                        "Put_Now": 23.10582550069239,
                        "Put_Sim": 40.58067777161432,
                        "Put_Chg": 75.6296383801491
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 77.92343570098683,
                        "Call_Sim": 49.30976169968426,
                        "Call_Chg": -36.72024179105877,
                        "Put_Now": 39.77041641054666,
                        "Put_Sim": 64.40174240924398,
                        "Put_Chg": 61.933789539516546
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.00010417497428580978,
            -0.15699724323555875,
            -0.13763768662603854,
            -0.0017119132766539754,
            -0.017077055254910843,
            -0.10834680351707693,
            0.09565496766895198,
            -0.0006205984857653026,
            0.17756300645849818,
            0.05739739589290224,
            0.03077934618594581,
            0.4019252758279357,
            0.054837750372054454
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
            -0.2396354297197023,
            -982.5084532155845,
            -605.3714685927132,
            -45.29425392519406,
            -120.98908342077357,
            -924.7577717416838,
            676.2200510561102,
            -42.86517560152615,
            530.6695662247602,
            102.60022987264684,
            234.02973572274655,
            -5006.595011689639,
            165.84277437498167
        ],
        "delta_cumulative": [
            -0.2396354297197023,
            -982.7480886453042,
            -1588.1195572380175,
            -1633.4138111632114,
            -1754.402894583985,
            -2679.160666325669,
            -2002.9406152695587,
            -2045.8057908710848,
            -1515.1362246463245,
            -1412.5359947736777,
            -1178.506259050931,
            -6185.10127074057,
            -6019.258496365588
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
            3125.2389331338873,
            12757038.06279197,
            11280296.031852292,
            402270.26718015404,
            7342513.270147889,
            23775507.427854292,
            7821595.668427474,
            199482.48929690482,
            6220191.050770504,
            1558177.4999269631,
            976376.1211058258,
            17018305.538434688,
            1154075.198469015
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            2273975.2977593006,
            226205.8539664977,
            7732981.318629673,
            0.0,
            6220191.050770504,
            1558177.4999269631,
            976376.1211058258,
            7235910.776766998,
            1154075.198469015
        ],
        "gamma_put": [
            3125.2389331338873,
            12757038.06279197,
            11280296.031852292,
            402270.26718015404,
            5068537.972388588,
            23549301.5738878,
            88614.34979780127,
            199482.48929690482,
            0.0,
            0.0,
            0.0,
            9782394.761667691,
            0.0
        ],
        "gamma_exposure": [
            3125.2389331338873,
            12760163.301725103,
            24040459.333577394,
            24442729.600757547,
            31785242.870905437,
            55560750.29875973,
            63382345.9671872,
            63581828.45648411,
            69802019.50725462,
            71360197.00718158,
            72336573.1282874,
            89354878.66672209,
            90508953.8651911
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
            "abs_call": 9665767.202412827,
            "abs_put": 23452812.61723295,
            "net": 33118579.819645777
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 35,
            "abs_call": 7778368.550697467,
            "abs_put": 11244838.41794044,
            "net": 19023206.968637906
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 56,
            "abs_call": 341189.4139761465,
            "abs_put": 0.0,
            "net": 341189.4139761465
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 78,
            "abs_call": 0.0,
            "abs_put": 17800129.25121515,
            "net": 17800129.25121515
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 101,
            "abs_call": 0.0,
            "abs_put": 402270.26718015404,
            "net": 402270.26718015404
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 122,
            "abs_call": 42662.243120880485,
            "abs_put": 0.0,
            "net": 42662.243120880485
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 144,
            "abs_call": 7235910.776766998,
            "abs_put": 9782394.761667691,
            "net": 17018305.538434688
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 166,
            "abs_call": 0.0,
            "abs_put": 28572.022898543357,
            "net": 28572.022898543357
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 187,
            "abs_call": 976376.1211058258,
            "abs_put": 0.0,
            "net": 976376.1211058258
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 210,
            "abs_call": 1154075.198469015,
            "abs_put": 0.0,
            "net": 1154075.198469015
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 231,
            "abs_call": 0.0,
            "abs_put": 96488.95665484866,
            "net": 96488.95665484866
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 251,
            "abs_call": 183543.61084561722,
            "abs_put": 323554.4530065591,
            "net": 507098.06385217636
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
            380.0,
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
            380.0,
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
                "volume": 350,
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
            }
        ]
    },
    "fed_watch": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 18,
            "iv_atm": 0.0,
            "spot": 5324.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 47,
            "iv_atm": 0.0,
            "spot": 5324.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 79,
            "iv_atm": 0.0,
            "spot": 5324.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 109,
            "iv_atm": 0.0,
            "spot": 5324.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 142,
            "iv_atm": 0.0,
            "spot": 5324.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 171,
            "iv_atm": 0.0,
            "spot": 5324.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 200,
            "iv_atm": 0.0,
            "spot": 5324.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 233,
            "iv_atm": 0.0,
            "spot": 5324.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 262,
            "iv_atm": 0.0,
            "spot": 5324.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 293,
            "iv_atm": 0.0,
            "spot": 5324.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 324,
            "iv_atm": 0.0,
            "spot": 5324.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 352,
            "iv_atm": 0.0,
            "spot": 5324.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5324.5,
                    "lower": 5324.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5324.5,
                    "lower": 5324.5,
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
            -0.620094738261241,
            -1864.8037227473642,
            -2847.266858944254,
            -10.52290975292598,
            -1013.0360667903474,
            -5075.604005153386,
            -224.7341650045069,
            12.324544757234882,
            1398.277093073154,
            554.2499738117416,
            122.01768711176908,
            4526.980080033626,
            276.5877652016601
        ],
        "vanna": [
            -10.325097205883955,
            -16408.84041780252,
            -9369.435531978606,
            -345.35195536092857,
            -4188.337216721619,
            -6790.677738441325,
            -1014.3361234259456,
            -129.41035220137826,
            1833.562683227191,
            938.2854819064744,
            307.65649026736617,
            27306.969314046473,
            2271.7231428030173
        ],
        "vex": [
            2591.2963111529198,
            4970158.248926434,
            2010288.6443497133,
            202938.79182924636,
            2133551.253963553,
            1890314.1658770058,
            686507.9277674338,
            250094.5704603902,
            1087420.5380360044,
            272402.27856285666,
            911978.3297280263,
            12240652.569847481,
            1210540.0586669096
        ],
        "theta": [
            -0.6604446367265258,
            -2693.9558897856537,
            -2675.858424642115,
            -68.74797012375723,
            -2001.0781299437049,
            -6009.847367936049,
            -3002.5351658900463,
            -9.85375323240249,
            -2380.3387627244038,
            -565.6700925366882,
            -517.2359293667837,
            1069.3013981993731,
            -506.3195021686634
        ],
        "charm_cum": [
            -0.620094738261241,
            -1865.4238174856255,
            -4712.69067642988,
            -4723.2135861828065,
            -5736.249652973154,
            -10811.85365812654,
            -11036.587823131047,
            -11024.263278373812,
            -9625.986185300659,
            -9071.736211488917,
            -8949.718524377147,
            -4422.738444343521,
            -4146.1506791418615
        ],
        "vanna_cum": [
            -10.325097205883955,
            -16419.165515008404,
            -25788.60104698701,
            -26133.95300234794,
            -30322.290219069557,
            -37112.96795751088,
            -38127.304080936825,
            -38256.7144331382,
            -36423.15174991101,
            -35484.86626800454,
            -35177.209777737175,
            -7870.240463690701,
            -5598.517320887684
        ],
        "theta_cum": [
            -0.6604446367265258,
            -2694.61633442238,
            -5370.474759064495,
            -5439.222729188252,
            -7440.300859131957,
            -13450.148227068006,
            -16452.683392958053,
            -16462.537146190454,
            -18842.87590891486,
            -19408.54600145155,
            -19925.78193081833,
            -18856.48053261896,
            -19362.800034787622
        ],
        "r_gamma": [
            3125.2389331338873,
            12757038.06279197,
            11280296.031852292,
            402270.26718015404,
            7342513.270147889,
            23775507.427854292,
            7821595.668427474,
            -199482.48929690482,
            -6220191.050770504,
            -1558177.4999269631,
            -976376.1211058258,
            -17018305.538434688,
            -1154075.198469015
        ],
        "r_gamma_cum": [
            3125.2389331338873,
            12760163.301725103,
            24040459.333577394,
            24442729.600757547,
            31785242.870905437,
            55560750.29875973,
            63382345.9671872,
            63182863.4778903,
            56962672.42711979,
            55404494.92719283,
            54428118.806087,
            37409813.26765232,
            36255738.069183305
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.2396354297197023,
            "gamma": 3125.2389331338873,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -982.5084532155845,
            "gamma": 12757038.06279197,
            "volume": 160,
            "oi": 8900,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -605.3714685927132,
            "gamma": 11280296.031852292,
            "volume": 380,
            "oi": 4883,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -45.29425392519406,
            "gamma": 402270.26718015404,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -120.98908342077357,
            "gamma": 7342513.270147889,
            "volume": 295,
            "oi": 2540,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -924.7577717416838,
            "gamma": 23775507.427854292,
            "volume": 245,
            "oi": 4075,
            "iv": 11.82
        },
        {
            "strike": 5300.0,
            "delta": 676.2200510561102,
            "gamma": 7821595.668427474,
            "volume": 885,
            "oi": 1195,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": -42.86517560152615,
            "gamma": 199482.48929690482,
            "volume": 130,
            "oi": 130,
            "iv": 11.82
        },
        {
            "strike": 5450.0,
            "delta": 530.6695662247602,
            "gamma": 6220191.050770504,
            "volume": 450,
            "oi": 1460,
            "iv": 11.82
        },
        {
            "strike": 5550.0,
            "delta": 102.60022987264684,
            "gamma": 1558177.4999269631,
            "volume": 450,
            "oi": 460,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 234.02973572274655,
            "gamma": 976376.1211058258,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5006.595011689639,
            "gamma": 17018305.538434688,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 165.84277437498167,
            "gamma": 1154075.198469015,
            "volume": 500,
            "oi": 1000,
            "iv": 11.82
        }
    ]
};