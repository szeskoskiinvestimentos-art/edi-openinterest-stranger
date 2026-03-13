window.marketData = {
    "last_updated": "2026-03-13 15:38:52",
    "spot_price": 5331.0,
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
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 13/03/2026 15:38\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(2);\n  spot(5331.00);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 4500.00;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (4500.00)\n  // 2 = Spline (4937.51)\n  // 3 = HVL (4500.00)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (4500.00)\n  // 7 = HVL Gaussian (4500.00)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 4500.00;\n  if (ModeloFlip = 2) then GammaVal := 4937.51;\n  if (ModeloFlip = 3) then GammaVal := 4500.00;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 4500.00;\n  if (ModeloFlip = 7) then GammaVal := 4500.00;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5291.31 <= LimitUpper) and (5291.31 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5291.31, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5370.69 <= LimitUpper) and (5370.69 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5370.69, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5441.31 <= LimitUpper) and (5441.31 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5441.31, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5450.00 <= LimitUpper) and (5450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5550.00 <= LimitUpper) and (5550.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5550.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5879.43 <= LimitUpper) and (5879.43 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5879.43, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirMaxPain) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5572.30 > 0) then\n      HorizontalLineCustom(5572.30, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5275.00 <= LimitUpper) and (5275.00 >= LimitLower) then\n      HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5400.00 <= LimitUpper) and (5400.00 >= LimitLower) then\n      HorizontalLineCustom(5400.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5500.00 <= LimitUpper) and (5500.00 >= LimitLower) then\n      HorizontalLineCustom(5500.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5575.00 <= LimitUpper) and (5575.00 >= LimitLower) then\n      HorizontalLineCustom(5575.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5800.00 <= LimitUpper) and (5800.00 >= LimitLower) then\n      HorizontalLineCustom(5800.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5411.80 <= LimitUpper) and (5411.80 >= LimitLower) then\n      HorizontalLineCustom(5411.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5488.20 <= LimitUpper) and (5488.20 >= LimitLower) then\n      HorizontalLineCustom(5488.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5511.80 <= LimitUpper) and (5511.80 >= LimitLower) then\n      HorizontalLineCustom(5511.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5569.10 <= LimitUpper) and (5569.10 >= LimitLower) then\n      HorizontalLineCustom(5569.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5580.90 <= LimitUpper) and (5580.90 >= LimitLower) then\n      HorizontalLineCustom(5580.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5752.80 <= LimitUpper) and (5752.80 >= LimitLower) then\n      HorizontalLineCustom(5752.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5847.20 <= LimitUpper) and (5847.20 >= LimitLower) then\n      HorizontalLineCustom(5847.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5261.80 <= LimitUpper) and (5261.80 >= LimitLower) then\n      HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5373.60 <= LimitUpper) and (5373.60 >= LimitLower) then\n      HorizontalLineCustom(5373.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5426.40 <= LimitUpper) and (5426.40 >= LimitLower) then\n      HorizontalLineCustom(5426.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5473.60 <= LimitUpper) and (5473.60 >= LimitLower) then\n      HorizontalLineCustom(5473.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5526.40 <= LimitUpper) and (5526.40 >= LimitLower) then\n      HorizontalLineCustom(5526.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5588.20 <= LimitUpper) and (5588.20 >= LimitLower) then\n      HorizontalLineCustom(5588.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5694.40 <= LimitUpper) and (5694.40 >= LimitLower) then\n      HorizontalLineCustom(5694.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5905.60 <= LimitUpper) and (5905.60 >= LimitLower) then\n      HorizontalLineCustom(5905.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5339.00, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5323.00, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5346.99, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5315.01, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5361.84, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5300.16, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5369.84, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5292.16, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 37588,
        "total_volume": 4270,
        "gamma_exposure": 89226887.19320351,
        "delta_position": -5799.9673616373275,
        "last_update": "2026-03-13T15:38:52.707958",
        "spot_price": 5331.0,
        "dealer_pressure": 0.04206230468792925,
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
        "range_low": 5291.30590646944,
        "range_high": 5370.69409353056,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5370.69409353056,
                "sigma_1_down": 5291.30590646944,
                "sigma_2_up": 5410.38818706112,
                "sigma_2_down": 5251.61181293888
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5419.758691439567,
                "sigma_1_down": 5242.241308560433,
                "sigma_2_up": 5508.517382879134,
                "sigma_2_down": 5153.482617120866
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 210,
                "sigma_1_up": 5906.222063949828,
                "sigma_1_down": 4755.777936050172,
                "sigma_2_up": 6481.444127899656,
                "sigma_2_down": 4180.555872100344
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
                4531.349999999999,
                4563.988775510204,
                4596.627551020408,
                4629.266326530612,
                4661.905102040816,
                4694.54387755102,
                4727.182653061224,
                4759.821428571428,
                4792.460204081632,
                4825.098979591836,
                4857.73775510204,
                4890.376530612244,
                4923.015306122448,
                4955.654081632652,
                4988.2928571428565,
                5020.931632653061,
                5053.570408163265,
                5086.209183673469,
                5118.847959183673,
                5151.486734693877,
                5184.125510204081,
                5216.7642857142855,
                5249.40306122449,
                5282.041836734694,
                5314.680612244898,
                5347.319387755102,
                5379.958163265305,
                5412.596938775509,
                5445.235714285714,
                5477.874489795918,
                5510.513265306122,
                5543.152040816326,
                5575.79081632653,
                5608.429591836734,
                5641.068367346938,
                5673.707142857143,
                5706.345918367347,
                5738.984693877551,
                5771.623469387754,
                5804.262244897958,
                5836.901020408162,
                5869.5397959183665,
                5902.178571428571,
                5934.817346938775,
                5967.456122448979,
                6000.094897959183,
                6032.733673469387,
                6065.372448979591,
                6098.0112244897955,
                6130.65
            ],
            "deltas": [
                -25927.88969124536,
                -25672.002537724562,
                -25377.68911808343,
                -25041.8524549601,
                -24661.590691071335,
                -24234.31789912815,
                -23757.895770123843,
                -23230.7477157951,
                -22651.909433577137,
                -22020.958671466673,
                -21337.774150133344,
                -20602.1130121989,
                -19813.07422420132,
                -18968.619508049786,
                -18065.414206764464,
                -17099.268049797905,
                -16066.346074943634,
                -14965.074009136048,
                -13798.345106756567,
                -12575.377575997034,
                -11312.515616046707,
                -10032.487987120096,
                -8762.08748198367,
                -7528.746964491167,
                -6356.854148629371,
                -5264.719125867862,
                -4262.8684753213965,
                -3353.902794432245,
                -2533.7029378331144,
                -1793.4639704934577,
                -1121.9483319166986,
                -507.4567769834206,
                60.77010684682921,
                591.7842335151184,
                1092.6985122983392,
                1568.817057140682,
                2023.9494008978775,
                2460.7714997322087,
                2881.1505418157317,
                3286.3981367919373,
                3677.448548511925,
                4054.975078030275,
                4419.462644409398,
                4771.253015375103,
                5110.574941984962,
                5437.56703877713,
                5752.2977067366355,
                6054.783979022051,
                6345.00973650004,
                6622.943023681163
            ],
            "flip_value": 5572.300200286446
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
                4531.349999999999,
                4563.988775510204,
                4596.627551020408,
                4629.266326530612,
                4661.905102040816,
                4694.54387755102,
                4727.182653061224,
                4759.821428571428,
                4792.460204081632,
                4825.098979591836,
                4857.73775510204,
                4890.376530612244,
                4923.015306122448,
                4955.654081632652,
                4988.2928571428565,
                5020.931632653061,
                5053.570408163265,
                5086.209183673469,
                5118.847959183673,
                5151.486734693877,
                5184.125510204081,
                5216.7642857142855,
                5249.40306122449,
                5282.041836734694,
                5314.680612244898,
                5347.319387755102,
                5379.958163265305,
                5412.596938775509,
                5445.235714285714,
                5477.874489795918,
                5510.513265306122,
                5543.152040816326,
                5575.79081632653,
                5608.429591836734,
                5641.068367346938,
                5673.707142857143,
                5706.345918367347,
                5738.984693877551,
                5771.623469387754,
                5804.262244897958,
                5836.901020408162,
                5869.5397959183665,
                5902.178571428571,
                5934.817346938775,
                5967.456122448979,
                6000.094897959183,
                6032.733673469387,
                6065.372448979591,
                6098.0112244897955,
                6130.65
            ],
            "pnl": [
                -14818321.252382658,
                -13967637.272424437,
                -13134644.73934329,
                -12320046.703462888,
                -11524503.950679515,
                -10748631.092185903,
                -9992993.239006106,
                -9258103.283843387,
                -8544419.798936993,
                -7852345.5455250265,
                -7182226.578470337,
                -6534351.91890771,
                -5908953.758631728,
                -5306208.152509236,
                -4726236.149541228,
                -4169105.3093235726,
                -3634831.548509606,
                -3123381.2613513274,
                -2634673.6593399597,
                -2168583.277194894,
                -1724942.5957531026,
                -1303544.7364699636,
                -904146.1870283475,
                -526469.5227475669,
                -170206.09387860633,
                164981.34572387673,
                479456.0878146244,
                773605.0111681586,
                1047836.2249601008,
                1302576.8198491614,
                1538270.7289980752,
                1755376.698361897,
                1954366.363251768,
                2135722.4264355255,
                2299936.9318328025,
                2447509.6271541733,
                2578946.4085655455,
                2694757.840565917,
                2795457.744681528,
                2881561.851233503,
                2953586.509262072,
                3012047.4506254112,
                3057458.6052763993,
                3090330.965706018,
                3111171.499482425,
                3120482.109676061,
                3118758.6437136466,
                3106489.9518296225,
                3084156.9967693025,
                3052232.0167377135
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
                        "Call_Now": 1019.573711913742,
                        "Call_Sim": 989.3072354878377,
                        "Call_Chg": -2.96854225175089,
                        "Put_Now": 4.92626890486342,
                        "Put_Sim": 5.6597924789595595,
                        "Put_Chg": 14.890043322076352
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 582.2034526678403,
                        "Call_Sim": 556.0690352204579,
                        "Call_Chg": -4.488880532677419,
                        "Put_Now": 47.150738213530076,
                        "Put_Sim": 52.0163207661484,
                        "Put_Chg": 10.319207581827689
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 505.69957177336755,
                        "Call_Sim": 481.05758479143697,
                        "Call_Chg": -4.872851067584856,
                        "Put_Now": 66.56580302997304,
                        "Put_Sim": 72.923816048042,
                        "Put_Chg": 9.551470467810766
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 469.38608249892604,
                        "Call_Sim": 445.5698669405683,
                        "Call_Chg": -5.073907481782274,
                        "Put_Now": 78.2117866109877,
                        "Put_Sim": 85.3955710526293,
                        "Put_Chg": 9.18504071179518
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 434.4634842201117,
                        "Call_Sim": 411.5208035905248,
                        "Call_Chg": -5.280692500721989,
                        "Put_Now": 91.24866118762998,
                        "Put_Sim": 99.30598055804239,
                        "Put_Chg": 8.830068590096417
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 400.9953579386447,
                        "Call_Sim": 378.96890616802057,
                        "Call_Chg": -5.492944328296775,
                        "Put_Now": 105.74000776162052,
                        "Put_Sim": 114.71355599099638,
                        "Put_Chg": 8.48642667929982
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 369.03559060651696,
                        "Call_Sim": 347.9622290545899,
                        "Call_Chg": -5.710387314484382,
                        "Put_Now": 121.73971328494872,
                        "Put_Sim": 131.6663517330221,
                        "Put_Chg": 8.15398540067095
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 338.62746578726546,
                        "Call_Sim": 318.537594295462,
                        "Call_Chg": -5.932735386687285,
                        "Put_Now": 139.29106132115385,
                        "Put_Sim": 150.2011898293506,
                        "Put_Chg": 7.832612089186409
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 282.58258134354855,
                        "Call_Sim": 264.52281452555553,
                        "Call_Chg": -6.3909695821048995,
                        "Put_Now": 179.16512258835155,
                        "Put_Sim": 192.10535577035898,
                        "Put_Chg": 7.22251797395792
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 232.976552746969,
                        "Call_Sim": 216.98209084835162,
                        "Call_Chg": -6.865266787593267,
                        "Put_Now": 225.47803970268615,
                        "Put_Sim": 240.48357780406832,
                        "Put_Chg": 6.6549887169359705
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 1019.573711913742,
                        "Call_Sim": 940.7037880004436,
                        "Call_Chg": -7.735578408083844,
                        "Put_Now": 4.92626890486342,
                        "Put_Sim": 7.056344991564856,
                        "Put_Chg": 43.23913549661358
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 582.2034526678403,
                        "Call_Sim": 514.8012335337462,
                        "Call_Chg": -11.577090246585769,
                        "Put_Now": 47.150738213530076,
                        "Put_Sim": 60.74851907943696,
                        "Put_Chg": 28.838956464110993
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 505.69957177336755,
                        "Call_Sim": 442.35126974415925,
                        "Call_Chg": -12.526864874941646,
                        "Put_Now": 66.56580302997304,
                        "Put_Sim": 84.21750100076451,
                        "Put_Chg": 26.51766698111239
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 469.38608249892604,
                        "Call_Sim": 408.2672800637315,
                        "Call_Chg": -13.021008656628496,
                        "Put_Now": 78.2117866109877,
                        "Put_Sim": 98.09298417579316,
                        "Put_Chg": 25.419694941494175
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 434.4634842201117,
                        "Call_Sim": 375.6936687869311,
                        "Call_Chg": -13.526986172077498,
                        "Put_Now": 91.24866118762998,
                        "Put_Sim": 113.47884575444891,
                        "Put_Chg": 24.362203540836767
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 400.9953579386447,
                        "Call_Sim": 344.67956651633904,
                        "Call_Chg": -14.044000836269632,
                        "Put_Now": 105.74000776162052,
                        "Put_Sim": 130.42421633931463,
                        "Put_Chg": 23.34424698865353
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 369.03559060651696,
                        "Call_Sim": 315.26255472564435,
                        "Call_Chg": -14.571233032698991,
                        "Put_Now": 121.73971328494872,
                        "Put_Sim": 148.96667740407588,
                        "Put_Chg": 22.364899164333224
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 338.62746578726546,
                        "Call_Sim": 287.4681383295833,
                        "Call_Chg": -15.107849370323006,
                        "Put_Now": 139.29106132115385,
                        "Put_Sim": 169.13173386347262,
                        "Put_Chg": 21.42325017792576
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 282.58258134354855,
                        "Call_Sim": 236.78758045143695,
                        "Call_Chg": -16.2058824271396,
                        "Put_Now": 179.16512258835155,
                        "Put_Sim": 214.37012169623995,
                        "Put_Chg": 19.64947116899261
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 232.976552746969,
                        "Call_Sim": 192.59831255471136,
                        "Call_Chg": -17.331460920065894,
                        "Put_Now": 225.47803970268615,
                        "Put_Sim": 266.0997995104285,
                        "Put_Chg": 18.015838642781333
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 1019.573711913742,
                        "Call_Sim": 295.4396284425766,
                        "Call_Chg": -71.02322029389757,
                        "Put_Now": 4.92626890486342,
                        "Put_Sim": 111.79218543369802,
                        "Put_Chg": 2169.3074128237713
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 582.2034526678403,
                        "Call_Sim": 85.82513887022833,
                        "Call_Chg": -85.2585658025643,
                        "Put_Now": 47.150738213530076,
                        "Put_Sim": 381.772424415919,
                        "Put_Chg": 709.6849357628254
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 505.69957177336755,
                        "Call_Sim": 63.659801331925564,
                        "Call_Chg": -87.41153742553392,
                        "Put_Now": 66.56580302997304,
                        "Put_Sim": 455.52603258853014,
                        "Put_Chg": 584.3244005986337
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 469.38608249892604,
                        "Call_Sim": 54.48047905961846,
                        "Call_Chg": -88.39324788464663,
                        "Put_Now": 78.2117866109877,
                        "Put_Sim": 494.30618317168,
                        "Put_Chg": 532.0098345665929
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 434.4634842201117,
                        "Call_Sim": 46.43068438480691,
                        "Call_Chg": -89.31309855230923,
                        "Put_Now": 91.24866118762998,
                        "Put_Sim": 534.2158613523247,
                        "Put_Chg": 485.45062952084726
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 400.9953579386447,
                        "Call_Sim": 39.40727294295323,
                        "Call_Chg": -90.17263612588182,
                        "Put_Now": 105.74000776162052,
                        "Put_Sim": 575.1519227659292,
                        "Put_Chg": 443.93028234171055
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 369.03559060651696,
                        "Call_Sim": 33.310030228244955,
                        "Call_Chg": -90.97376213131658,
                        "Put_Now": 121.73971328494872,
                        "Put_Sim": 617.0141529066773,
                        "Put_Chg": 406.8306276214647
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 338.62746578726546,
                        "Call_Sim": 28.042883266682793,
                        "Call_Chg": -91.7186625126563,
                        "Put_Now": 139.29106132115385,
                        "Put_Sim": 659.7064788005714,
                        "Put_Chg": 373.6172389982236
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 282.58258134354855,
                        "Call_Sim": 19.64072671288767,
                        "Call_Chg": -93.04956214232838,
                        "Put_Now": 179.16512258835155,
                        "Put_Sim": 747.2232679576905,
                        "Put_Chg": 317.05844148836104
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 232.976552746969,
                        "Call_Sim": 13.544911776384936,
                        "Call_Chg": -94.18614808371048,
                        "Put_Now": 225.47803970268615,
                        "Put_Sim": 837.0463987321027,
                        "Put_Chg": 271.23189461635667
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5384.31,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 1019.573711913742,
                        "Call_Sim": 1071.8235260441124,
                        "Call_Chg": 5.124672548912367,
                        "Put_Now": 4.92626890486342,
                        "Put_Sim": 3.866083035233956,
                        "Put_Chg": -21.52107183151947
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 582.2034526678403,
                        "Call_Sim": 628.0460008437799,
                        "Call_Chg": 7.873973946027717,
                        "Put_Now": 47.150738213530076,
                        "Put_Sim": 39.683286389470595,
                        "Put_Chg": -15.83740171838215
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 505.69957177336755,
                        "Call_Sim": 549.1478514813907,
                        "Call_Chg": 8.591717718023851,
                        "Put_Now": 66.56580302997304,
                        "Put_Sim": 56.70408273799501,
                        "Put_Chg": -14.814994851842359
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 469.38608249892604,
                        "Call_Sim": 511.49653941660426,
                        "Call_Chg": 8.971390181295922,
                        "Put_Now": 78.2117866109877,
                        "Put_Sim": 67.01224352866552,
                        "Put_Chg": -14.319508053213037
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 434.4634842201117,
                        "Call_Sim": 475.1494448977687,
                        "Call_Chg": 9.364644476552682,
                        "Put_Now": 91.24866118762998,
                        "Put_Sim": 78.62462186528705,
                        "Put_Chg": -13.83476662346284
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 400.9953579386447,
                        "Call_Sim": 440.1774785674429,
                        "Call_Chg": 9.771215514867222,
                        "Put_Now": 105.74000776162052,
                        "Put_Sim": 91.61212839041787,
                        "Put_Chg": -13.360959271964912
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 369.03559060651696,
                        "Call_Sim": 406.6432819266015,
                        "Call_Chg": 10.190803347253198,
                        "Put_Now": 121.73971328494872,
                        "Put_Sim": 106.03740460503354,
                        "Put_Chg": -12.898263234086759
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 338.62746578726546,
                        "Call_Sim": 374.60012650385306,
                        "Call_Chg": 10.623078264769743,
                        "Put_Now": 139.29106132115385,
                        "Put_Sim": 121.95372203774127,
                        "Put_Chg": -12.446842689667688
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 282.58258134354855,
                        "Call_Sim": 315.14810871603413,
                        "Call_Chg": 11.524251501154694,
                        "Put_Now": 179.16512258835155,
                        "Put_Sim": 158.4206499608365,
                        "Put_Chg": -11.578410087758764
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 232.976552746969,
                        "Call_Sim": 262.03265858403347,
                        "Call_Chg": 12.471686740348378,
                        "Put_Now": 225.47803970268615,
                        "Put_Sim": 201.22414553975022,
                        "Put_Chg": -10.756654703454467
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5277.69,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 1019.573711913742,
                        "Call_Sim": 967.5857165575944,
                        "Call_Chg": -5.09899330952404,
                        "Put_Now": 4.92626890486342,
                        "Put_Sim": 6.248273548716298,
                        "Put_Chg": 26.835819752911572
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 582.2034526678403,
                        "Call_Sim": 537.5159025158914,
                        "Call_Chg": -7.675590027365252,
                        "Put_Now": 47.150738213530076,
                        "Put_Sim": 55.77318806158303,
                        "Put_Chg": 18.286988019158326
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 505.69957177336755,
                        "Call_Sim": 463.62397268260247,
                        "Call_Chg": -8.320275799960838,
                        "Put_Now": 66.56580302997304,
                        "Put_Sim": 77.80020393920768,
                        "Put_Chg": 16.87713570311177
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 469.38608249892604,
                        "Call_Sim": 428.7518185805752,
                        "Call_Chg": -8.656895769474332,
                        "Put_Now": 78.2117866109877,
                        "Put_Sim": 90.8875226926366,
                        "Put_Chg": 16.20693840519956
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 434.4634842201117,
                        "Call_Sim": 395.3512074766072,
                        "Call_Chg": -9.00243131219955,
                        "Put_Now": 91.24866118762998,
                        "Put_Sim": 105.44638444412521,
                        "Put_Chg": 15.559377060120566
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 400.9953579386447,
                        "Call_Sim": 363.476644612314,
                        "Call_Chg": -9.356395924182086,
                        "Put_Now": 105.74000776162052,
                        "Put_Sim": 121.53129443528996,
                        "Put_Chg": 14.93406990215965
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 369.03559060651696,
                        "Call_Sim": 333.1716675551702,
                        "Call_Chg": -9.718282996066515,
                        "Put_Now": 121.73971328494872,
                        "Put_Sim": 139.1857902336028,
                        "Put_Chg": 14.33063745420454
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 338.62746578726546,
                        "Call_Sim": 304.46817694388074,
                        "Call_Chg": -10.087571828814523,
                        "Put_Now": 139.29106132115385,
                        "Put_Sim": 158.44177247776997,
                        "Put_Chg": 13.748700724206303
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 282.58258134354855,
                        "Call_Sim": 251.93301109533058,
                        "Call_Chg": -10.846234790019093,
                        "Put_Now": 179.16512258835155,
                        "Put_Sim": 201.82555234013444,
                        "Put_Chg": 12.647790721996333
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 232.976552746969,
                        "Call_Sim": 205.88571535486835,
                        "Call_Chg": -11.628139000547165,
                        "Put_Now": 225.47803970268615,
                        "Put_Sim": 251.69720231058636,
                        "Put_Chg": 11.62825552433959
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
                        "Call_Now": 155.65363956890997,
                        "Call_Sim": 130.1481603065863,
                        "Call_Chg": -16.386047466003546,
                        "Put_Now": 11.25822441602486,
                        "Put_Sim": 16.75274515370097,
                        "Put_Chg": 48.804505352151786
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 115.96877390866302,
                        "Call_Sim": 93.7814477285965,
                        "Call_Chg": -19.132155521055395,
                        "Put_Now": 21.44455668700084,
                        "Put_Sim": 30.257230506934775,
                        "Put_Chg": 41.095155048255016
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 81.94975170449607,
                        "Call_Sim": 63.777364937505354,
                        "Call_Chg": -22.175035785976284,
                        "Put_Now": 37.29673241405567,
                        "Put_Sim": 50.124345647064274,
                        "Put_Chg": 34.39339696196652
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 155.65363956890997,
                        "Call_Sim": 93.21151476884643,
                        "Call_Chg": -40.11607115194988,
                        "Put_Now": 11.25822441602486,
                        "Put_Sim": 29.816099615961093,
                        "Put_Chg": 164.83838404856377
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 115.96877390866302,
                        "Call_Sim": 63.17569168337786,
                        "Call_Chg": -45.523532280219655,
                        "Put_Now": 21.44455668700084,
                        "Put_Sim": 49.65147446171477,
                        "Put_Chg": 131.53416126252807
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 81.94975170449607,
                        "Call_Sim": 40.10107139755064,
                        "Call_Chg": -51.06626858107912,
                        "Put_Now": 37.29673241405567,
                        "Put_Sim": 76.44805210711002,
                        "Put_Chg": 104.972519464734
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5200.0,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 155.65363956890997,
                        "Call_Sim": 62.57401842925083,
                        "Call_Chg": -59.79919351545361,
                        "Put_Now": 11.25822441602486,
                        "Put_Sim": 49.178603276365266,
                        "Put_Chg": 336.8237961784175
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 115.96877390866302,
                        "Call_Sim": 39.532604678535336,
                        "Call_Chg": -65.91099194540834,
                        "Put_Now": 21.44455668700084,
                        "Put_Sim": 76.0083874568736,
                        "Put_Chg": 254.44140238603302
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 81.94975170449607,
                        "Call_Sim": 23.22595167950317,
                        "Call_Chg": -71.65830134146837,
                        "Put_Now": 37.29673241405567,
                        "Put_Sim": 109.57293238906277,
                        "Put_Chg": 193.7869494105308
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5384.31,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 155.65363956890997,
                        "Call_Sim": 202.98251127710773,
                        "Call_Chg": 30.406530704503464,
                        "Put_Now": 11.25822441602486,
                        "Put_Sim": 5.277096124222339,
                        "Put_Chg": -53.126746019461415
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 115.96877390866302,
                        "Call_Sim": 158.89642713187277,
                        "Call_Chg": 37.016562110952,
                        "Put_Now": 21.44455668700084,
                        "Put_Sim": 11.0622099102103,
                        "Put_Chg": -48.414835187915365
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 81.94975170449607,
                        "Call_Sim": 118.98848101463318,
                        "Call_Chg": 45.19687801336564,
                        "Put_Now": 37.29673241405567,
                        "Put_Sim": 21.025461724192382,
                        "Put_Chg": -43.6265314323656
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5277.69,
                "options": [
                    {
                        "Strike": 5200.0,
                        "Call_Now": 155.65363956890997,
                        "Call_Sim": 112.96332641706795,
                        "Call_Chg": -27.42647924589161,
                        "Put_Now": 11.25822441602486,
                        "Put_Sim": 21.877911264183012,
                        "Put_Chg": 94.32825688784621
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 115.96877390866302,
                        "Call_Sim": 79.29359686407543,
                        "Call_Chg": -31.62504509487438,
                        "Put_Now": 21.44455668700084,
                        "Put_Sim": 38.07937964241387,
                        "Put_Chg": 77.5713072469185
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 81.94975170449607,
                        "Call_Sim": 52.34684141685648,
                        "Call_Chg": -36.12324585727264,
                        "Put_Now": 37.29673241405567,
                        "Put_Sim": 61.00382212641671,
                        "Put_Chg": 63.5634496051101
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -9.913106755964253e-05,
            -0.14758615797882235,
            -0.1263408672708156,
            -0.0016556299520875993,
            -0.014004134135303783,
            -0.10841637192940064,
            0.08981813611365709,
            -0.0006499998045676333,
            0.1732604546311865,
            0.05629930442877095,
            0.030632974436892915,
            0.39488481906426487,
            0.05464153346856284
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
            -0.23211294936785476,
            -951.733232946754,
            -578.285914202504,
            -44.31871650295997,
            -103.27022205725656,
            -867.5830348188872,
            695.1807642921589,
            -42.37954351410867,
            545.918849105763,
            106.44217561168482,
            236.4132341904362,
            -4964.793839122263,
            168.6742312767312
        ],
        "delta_cumulative": [
            -0.23211294936785476,
            -951.9653458961219,
            -1530.251260098626,
            -1574.569976601586,
            -1677.8401986588426,
            -2545.42323347773,
            -1850.2424691855708,
            -1892.6220126996795,
            -1346.7031635939165,
            -1240.2609879822317,
            -1003.8477537917954,
            -5968.6415929140585,
            -5799.9673616373275
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
            3040.8917725660667,
            12468364.157784041,
            10921006.428181607,
            397325.1163216036,
            7180667.362893044,
            23083455.334328953,
            7717304.949858505,
            198564.8267757769,
            6278231.650217724,
            1590799.0709418608,
            977244.0778762696,
            17244145.970099617,
            1166737.3561519384
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            2171612.6016526446,
            224735.3513336476,
            7629170.828696854,
            0.0,
            6278231.650217724,
            1590799.0709418608,
            977244.0778762696,
            7331934.508954866,
            1166737.3561519384
        ],
        "gamma_put": [
            3040.8917725660667,
            12468364.157784041,
            10921006.428181607,
            397325.1163216036,
            5009054.761240399,
            22858719.982995305,
            88134.12116165078,
            198564.8267757769,
            0.0,
            0.0,
            0.0,
            9912211.461144751,
            0.0
        ],
        "gamma_exposure": [
            3040.8917725660667,
            12471405.049556607,
            23392411.477738217,
            23789736.59405982,
            30970403.956952866,
            54053859.29128182,
            61771164.24114032,
            61969729.067916095,
            68247960.71813382,
            69838759.78907569,
            70816003.86695196,
            88060149.83705157,
            89226887.19320351
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
            "abs_call": 9461983.576045707,
            "abs_put": 22762844.34583455,
            "net": 32224827.921880256
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 35,
            "abs_call": 7869030.721159585,
            "abs_put": 10885859.699688418,
            "net": 18754890.420848005
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 56,
            "abs_call": 338799.8543037932,
            "abs_put": 0.0,
            "net": 338799.8543037932
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 78,
            "abs_call": 0.0,
            "abs_put": 17452179.78369866,
            "net": 17452179.78369866
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 101,
            "abs_call": 0.0,
            "abs_put": 397325.1163216036,
            "net": 397325.1163216036
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 122,
            "abs_call": 42338.05928238385,
            "abs_put": 0.0,
            "net": 42338.05928238385
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 144,
            "abs_call": 7331934.508954866,
            "abs_put": 9912211.461144751,
            "net": 17244145.970099617
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 166,
            "abs_call": 0.0,
            "abs_put": 28280.02709834763,
            "net": 28280.02709834763
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 187,
            "abs_call": 977244.0778762696,
            "abs_put": 0.0,
            "net": 977244.0778762696
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 210,
            "abs_call": 1166737.3561519384,
            "abs_put": 0.0,
            "net": 1166737.3561519384
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 231,
            "abs_call": 0.0,
            "abs_put": 95875.6371607561,
            "net": 95875.6371607561
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 251,
            "abs_call": 182397.29205126374,
            "abs_put": 321845.67643061635,
            "net": 504242.9684818801
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
            "spot": 5331.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 47,
            "iv_atm": 0.0,
            "spot": 5331.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 79,
            "iv_atm": 0.0,
            "spot": 5331.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 109,
            "iv_atm": 0.0,
            "spot": 5331.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 142,
            "iv_atm": 0.0,
            "spot": 5331.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 171,
            "iv_atm": 0.0,
            "spot": 5331.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 200,
            "iv_atm": 0.0,
            "spot": 5331.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 233,
            "iv_atm": 0.0,
            "spot": 5331.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 262,
            "iv_atm": 0.0,
            "spot": 5331.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 293,
            "iv_atm": 0.0,
            "spot": 5331.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 324,
            "iv_atm": 0.0,
            "spot": 5331.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 352,
            "iv_atm": 0.0,
            "spot": 5331.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5331.0,
                    "lower": 5331.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5331.0,
                    "lower": 5331.0,
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
            -0.6089907185733356,
            -1871.7493208696765,
            -2851.9996715893135,
            -11.603074367070976,
            -1041.6619437413144,
            -5465.724711877558,
            -396.5188186693016,
            12.024626906767173,
            1356.162975752365,
            551.8837685249932,
            120.51945511718331,
            4550.239926089005,
            277.9143057461477
        ],
        "vanna": [
            -10.10996123364158,
            -16290.654470918,
            -9293.471858000945,
            -349.27398039341085,
            -4253.63694030841,
            -7073.076796811337,
            -1161.6890528008007,
            -132.92922090738767,
            1720.5486896242767,
            925.2793223206389,
            287.6196303006506,
            27317.778624501887,
            2272.866848144053
        ],
        "vex": [
            2524.4377480064495,
            4863620.660620023,
            1949518.8496667894,
            200688.7402957762,
            2106206.537266784,
            1845419.8007099805,
            679480.3228877037,
            249247.9853783847,
            1098907.1377800344,
            278444.71998277307,
            913903.3468191242,
            12418232.781819707,
            1225315.738592259
        ],
        "theta": [
            -0.6445933173241576,
            -2645.765376643238,
            -2602.3643473604548,
            -68.46258841389486,
            -1974.6196962107965,
            -5874.312460640454,
            -2994.573058080814,
            -10.167775959696783,
            -2415.854634146657,
            -579.9344894512544,
            -520.3638971873705,
            952.2317282627591,
            -513.4709176009749
        ],
        "charm_cum": [
            -0.6089907185733356,
            -1872.3583115882498,
            -4724.357983177563,
            -4735.961057544634,
            -5777.623001285949,
            -11243.347713163506,
            -11639.866531832808,
            -11627.841904926041,
            -10271.678929173677,
            -9719.795160648684,
            -9599.275705531501,
            -5049.035779442496,
            -4771.121473696348
        ],
        "vanna_cum": [
            -10.10996123364158,
            -16300.764432151642,
            -25594.236290152585,
            -25943.510270545994,
            -30197.147210854404,
            -37270.22400766574,
            -38431.91306046654,
            -38564.84228137393,
            -36844.29359174965,
            -35919.01426942901,
            -35631.39463912836,
            -8313.616014626474,
            -6040.749166482421
        ],
        "theta_cum": [
            -0.6445933173241576,
            -2646.409969960562,
            -5248.7743173210165,
            -5317.2369057349115,
            -7291.8566019457085,
            -13166.169062586163,
            -16160.742120666977,
            -16170.909896626674,
            -18586.764530773333,
            -19166.699020224587,
            -19687.062917411957,
            -18734.831189149198,
            -19248.302106750172
        ],
        "r_gamma": [
            3040.8917725660667,
            12468364.157784041,
            10921006.428181607,
            397325.1163216036,
            7180667.362893044,
            23083455.334328953,
            7717304.949858505,
            -198564.8267757769,
            -6278231.650217724,
            -1590799.0709418608,
            -977244.0778762696,
            -17244145.970099617,
            -1166737.3561519384
        ],
        "r_gamma_cum": [
            3040.8917725660667,
            12471405.049556607,
            23392411.477738217,
            23789736.59405982,
            30970403.956952866,
            54053859.29128182,
            61771164.24114032,
            61572599.41436455,
            55294367.76414682,
            53703568.69320496,
            52726324.61532869,
            35482178.64522907,
            34315441.28907713
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.23211294936785476,
            "gamma": 3040.8917725660667,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -951.733232946754,
            "gamma": 12468364.157784041,
            "volume": 160,
            "oi": 8900,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -578.285914202504,
            "gamma": 10921006.428181607,
            "volume": 380,
            "oi": 4883,
            "iv": 11.82
        },
        {
            "strike": 5150.0,
            "delta": -44.31871650295997,
            "gamma": 397325.1163216036,
            "volume": 200,
            "oi": 200,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -103.27022205725656,
            "gamma": 7180667.362893044,
            "volume": 295,
            "oi": 2540,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": -867.5830348188872,
            "gamma": 23083455.334328953,
            "volume": 245,
            "oi": 4075,
            "iv": 11.82
        },
        {
            "strike": 5300.0,
            "delta": 695.1807642921589,
            "gamma": 7717304.949858505,
            "volume": 885,
            "oi": 1195,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": -42.37954351410867,
            "gamma": 198564.8267757769,
            "volume": 130,
            "oi": 130,
            "iv": 11.82
        },
        {
            "strike": 5450.0,
            "delta": 545.918849105763,
            "gamma": 6278231.650217724,
            "volume": 450,
            "oi": 1460,
            "iv": 11.82
        },
        {
            "strike": 5550.0,
            "delta": 106.44217561168482,
            "gamma": 1590799.0709418608,
            "volume": 450,
            "oi": 460,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 236.4132341904362,
            "gamma": 977244.0778762696,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -4964.793839122263,
            "gamma": 17244145.970099617,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 168.6742312767312,
            "gamma": 1166737.3561519384,
            "volume": 500,
            "oi": 1000,
            "iv": 11.82
        }
    ]
};