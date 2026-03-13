window.marketData = {
    "last_updated": "2026-03-12 22:10:08",
    "spot_price": 5253.328,
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-03-12",
        "meetings": [
            {
                "date": "2026-03-18",
                "days_remaining": 5,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 1.7,
                    "3.50-3.75": 98.3
                }
            },
            {
                "date": "2026-04-29",
                "days_remaining": 47,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.1,
                    "3.25-3.50": 5.9,
                    "3.50-3.75": 94.1
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 96,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 1.3,
                    "3.25-3.50": 23.9,
                    "3.50-3.75": 74.8
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 138,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.2,
                    "3.00-3.25": 4.8,
                    "3.25-3.50": 31.8,
                    "3.50-3.75": 63.2
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 187,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.8,
                    "3.00-3.25": 8.3,
                    "3.25-3.50": 35.9,
                    "3.50-3.75": 54.9
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 229,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.1,
                    "2.75-3.00": 1.3,
                    "3.00-3.25": 10.2,
                    "3.25-3.50": 37.2,
                    "3.50-3.75": 51.1
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 271,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.3,
                    "2.75-3.00": 2.9,
                    "3.00-3.25": 15.1,
                    "3.25-3.50": 39.7,
                    "3.50-3.75": 41.9
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 12/03/2026 22:10\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(4);\n  spot(5253.33);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5839.11;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (5839.11)\n  // 2 = Spline (5829.68)\n  // 3 = HVL (4500.00)\n  // 4 = HVL Log (5280.92)\n  // 5 = Sigma Kernel (5280.97)\n  // 6 = PVOP (5839.11)\n  // 7 = HVL Gaussian (5901.05)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 5839.11;\n  if (ModeloFlip = 2) then GammaVal := 5829.68;\n  if (ModeloFlip = 3) then GammaVal := 4500.00;\n  if (ModeloFlip = 4) then GammaVal := 5280.92;\n  if (ModeloFlip = 5) then GammaVal := 5280.97;\n  if (ModeloFlip = 6) then GammaVal := 5839.11;\n  if (ModeloFlip = 7) then GammaVal := 5901.05;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirRange) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5214.21 <= LimitUpper) and (5214.21 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5214.21, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5292.44 <= LimitUpper) and (5292.44 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5292.44, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5441.31 <= LimitUpper) and (5441.31 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5441.31, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5450.00 <= LimitUpper) and (5450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5550.00 <= LimitUpper) and (5550.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5550.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5865.66 <= LimitUpper) and (5865.66 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5865.66, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirMaxPain) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5649.12 > 0) then\n      HorizontalLineCustom(5649.12, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5150.00 <= LimitUpper) and (5150.00 >= LimitLower) then\n      HorizontalLineCustom(5150.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5275.00 <= LimitUpper) and (5275.00 >= LimitLower) then\n      HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5400.00 <= LimitUpper) and (5400.00 >= LimitLower) then\n      HorizontalLineCustom(5400.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5500.00 <= LimitUpper) and (5500.00 >= LimitLower) then\n      HorizontalLineCustom(5500.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5575.00 <= LimitUpper) and (5575.00 >= LimitLower) then\n      HorizontalLineCustom(5575.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5800.00 <= LimitUpper) and (5800.00 >= LimitLower) then\n      HorizontalLineCustom(5800.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5411.80 <= LimitUpper) and (5411.80 >= LimitLower) then\n      HorizontalLineCustom(5411.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5488.20 <= LimitUpper) and (5488.20 >= LimitLower) then\n      HorizontalLineCustom(5488.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5511.80 <= LimitUpper) and (5511.80 >= LimitLower) then\n      HorizontalLineCustom(5511.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5569.10 <= LimitUpper) and (5569.10 >= LimitLower) then\n      HorizontalLineCustom(5569.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5580.90 <= LimitUpper) and (5580.90 >= LimitLower) then\n      HorizontalLineCustom(5580.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5752.80 <= LimitUpper) and (5752.80 >= LimitLower) then\n      HorizontalLineCustom(5752.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5847.20 <= LimitUpper) and (5847.20 >= LimitLower) then\n      HorizontalLineCustom(5847.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5123.60 <= LimitUpper) and (5123.60 >= LimitLower) then\n      HorizontalLineCustom(5123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5176.40 <= LimitUpper) and (5176.40 >= LimitLower) then\n      HorizontalLineCustom(5176.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5261.80 <= LimitUpper) and (5261.80 >= LimitLower) then\n      HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5373.60 <= LimitUpper) and (5373.60 >= LimitLower) then\n      HorizontalLineCustom(5373.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5426.40 <= LimitUpper) and (5426.40 >= LimitLower) then\n      HorizontalLineCustom(5426.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5473.60 <= LimitUpper) and (5473.60 >= LimitLower) then\n      HorizontalLineCustom(5473.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5526.40 <= LimitUpper) and (5526.40 >= LimitLower) then\n      HorizontalLineCustom(5526.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5588.20 <= LimitUpper) and (5588.20 >= LimitLower) then\n      HorizontalLineCustom(5588.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5694.40 <= LimitUpper) and (5694.40 >= LimitLower) then\n      HorizontalLineCustom(5694.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5905.60 <= LimitUpper) and (5905.60 >= LimitLower) then\n      HorizontalLineCustom(5905.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5261.21, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5245.45, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5269.09, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5237.57, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5283.72, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5222.93, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5291.60, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5215.05, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 26875,
        "total_volume": 2845,
        "gamma_exposure": 50355492.67974557,
        "delta_position": -6399.050664332096,
        "last_update": "2026-03-12T22:10:08.521913",
        "spot_price": 5253.328,
        "dealer_pressure": 0.06390268283580378,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 5901.053541459367,
        "call_wall": 5300.0,
        "put_wall": 5000.0,
        "effective_call_wall": 5865.656565656565,
        "effective_put_wall": 5441.305712492153,
        "max_pain": 6000.0,
        "zero_gamma": 5839.108197138558,
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
                "days": 211,
                "sigma_1_up": 5821.517169681039,
                "sigma_1_down": 4685.1388303189615,
                "sigma_2_up": 6389.706339362077,
                "sigma_2_down": 4116.949660637923
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
                5295.122596753632,
                5281.095606695835,
                5283.183496898711,
                5284.862277631747,
                5288.8908819193975,
                5295.944124325063,
                5391.919446708638,
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
                -17433.359471584226,
                -17256.1456333156,
                -17052.251389685458,
                -16820.22432434522,
                -16559.012690966032,
                -16268.025068817398,
                -15947.172069084854,
                -15596.88612382926,
                -15218.116118237403,
                -14812.294226799868,
                -14381.272668941741,
                -13927.228378499463,
                -13452.534475967235,
                -12959.600245621114,
                -12450.687622801905,
                -11927.722844792122,
                -11392.135593118648,
                -10844.770013264348,
                -10285.91484812487,
                -9715.485816944705,
                -9133.359158703244,
                -8539.806787113197,
                -7935.936432062678,
                -7324.015051676078,
                -6707.5667648631115,
                -6091.189772660904,
                -5480.11490250851,
                -4879.603899885906,
                -4294.330469214601,
                -3727.8856958698816,
                -3182.505060628181,
                -2659.0461319942624,
                -2157.1798892645697,
                -1675.715267088327,
                -1212.9645801889997,
                -767.0729102696368,
                -336.2652336162323,
                81.00243345024381,
                485.97699188631594,
                879.6036191646331,
                1262.5566785975775,
                1635.285040726089,
                1998.0580743074393,
                2351.005545840688,
                2694.1496768356983,
                3027.430370189261,
                3350.725592239016,
                3663.8687826750365,
                3966.6645775786246,
                4258.903482096297
            ],
            "flip_value": 5649.124693832749
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                0.0,
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
                -30.0,
                -95.0,
                -20.0,
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
                -12105274.903841607,
                -11465338.41679161,
                -10835269.141660012,
                -10215521.788985645,
                -9606535.007127434,
                -9008729.240042688,
                -8422504.844744153,
                -7848240.479109628,
                -7286291.76362115,
                -6736990.213925134,
                -6200642.435034014,
                -5677529.562691014,
                -5167906.933020156,
                -4672003.958157983,
                -4190024.1831538565,
                -3722145.4980262686,
                -3268520.478435915,
                -2829276.828908704,
                -2404517.9038158767,
                -1994323.2832738226,
                -1598749.3836295623,
                -1217830.085107362,
                -851577.3623648165,
                -499981.907003155,
                -163013.73436508793,
                159377.2298822077,
                467260.58494587056,
                760724.9108294249,
                1039877.2416721759,
                1304842.551371947,
                1555763.2449782016,
                1792798.6484148558,
                2016124.488612025,
                2225932.356063379,
                2422429.1421493227,
                2605836.4442272345,
                2776389.9324348206,
                2934338.6733266553,
                3079944.4068035595,
                3213480.774243175,
                3335232.4972390095,
                3445494.5078510316,
                3544571.0327155152,
                3632774.6347126886,
                3710425.2171126353,
                3777848.996185014,
                3835377.4491447685,
                3883346.2450025473,
                3922094.1663856227,
                3951962.0306948554
            ]
        },
        "max_pain_profile": {
            "strikes": [
                4500.0,
                5000.0,
                5100.0,
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
                16648250.0,
                7520750.0,
                6585250.0,
                5652750.0,
                5288500.0,
                4935000.0,
                4646250.0,
                4081750.0,
                3618250.0,
                3387000.0,
                1737000.0,
                3358000.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5300.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 944.8460149885113,
                        "Call_Sim": 990.216077783336,
                        "Call_Chg": 4.801847293114352,
                        "Put_Now": 7.01423777809913,
                        "Put_Sim": 5.712300572923226,
                        "Put_Chg": -18.561349734122228
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 518.6188929054292,
                        "Call_Sim": 557.1738610391667,
                        "Call_Chg": 7.434161898295521,
                        "Put_Now": 60.28669600497142,
                        "Put_Sim": 52.16966413870887,
                        "Put_Chg": -13.46405161363163
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 446.00918521902804,
                        "Call_Sim": 482.1848396543819,
                        "Call_Chg": 8.110966238865366,
                        "Put_Now": 83.57690438056011,
                        "Put_Sim": 73.08055881591508,
                        "Put_Chg": -12.558906844468462
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 379.1561546631515,
                        "Call_Sim": 412.6566693941795,
                        "Call_Chg": 8.835545544761219,
                        "Put_Now": 112.62378988667524,
                        "Put_Sim": 99.45230461770416,
                        "Put_Chg": -11.695118129326449
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 348.03175335778315,
                        "Call_Sim": 380.10303578825915,
                        "Call_Chg": 9.21504492652029,
                        "Put_Now": 129.4493466123015,
                        "Put_Sim": 114.84862904277838,
                        "Put_Chg": -11.279097153925392
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 318.49679441239596,
                        "Call_Sim": 349.090278420897,
                        "Call_Chg": 9.605586161375298,
                        "Put_Now": 147.86434569791072,
                        "Put_Sim": 131.78582970641196,
                        "Put_Chg": -10.873828924484224
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 290.5775184236345,
                        "Call_Sim": 319.6550870998781,
                        "Call_Chg": 10.006819809731885,
                        "Put_Now": 167.8950277401441,
                        "Put_Sim": 150.30059641638877,
                        "Put_Chg": -10.47942369739902
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 239.6300453562435,
                        "Call_Sim": 265.6056874564292,
                        "Call_Chg": 10.839893662570278,
                        "Put_Now": 212.8474707347441,
                        "Put_Sim": 192.15111283493025,
                        "Put_Chg": -9.723562994838765
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5000.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 944.8460149885113,
                        "Call_Sim": 704.5371664418872,
                        "Call_Chg": -25.433652122620863,
                        "Put_Now": 7.01423777809913,
                        "Put_Sim": 20.03338923147504,
                        "Put_Chg": 185.6103523325969
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 518.6188929054292,
                        "Call_Sim": 329.33045134046915,
                        "Call_Chg": -36.498562654461,
                        "Put_Now": 60.28669600497142,
                        "Put_Sim": 124.3262544400111,
                        "Put_Chg": 106.22502588259073
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 446.00918521902804,
                        "Call_Sim": 272.2556955380228,
                        "Call_Chg": -38.95737922878823,
                        "Put_Now": 83.57690438056011,
                        "Put_Sim": 163.15141469955574,
                        "Put_Chg": 95.21112430374315
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 379.1561546631515,
                        "Call_Sim": 222.02052117116364,
                        "Call_Chg": -41.44351385554844,
                        "Put_Now": 112.62378988667524,
                        "Put_Sim": 208.8161563946869,
                        "Put_Chg": 85.4103441242767
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 348.03175335778315,
                        "Call_Sim": 199.45818831585257,
                        "Call_Chg": -42.689657943134335,
                        "Put_Now": 129.4493466123015,
                        "Put_Sim": 234.20378157037203,
                        "Put_Chg": 80.92310830413707
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 318.49679441239596,
                        "Call_Sim": 178.56757048163126,
                        "Call_Chg": -43.93426445277863,
                        "Put_Now": 147.86434569791072,
                        "Put_Sim": 261.263121767146,
                        "Put_Chg": 76.69108839862643
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 290.5775184236345,
                        "Call_Sim": 159.30964054792707,
                        "Call_Chg": -45.174822397764196,
                        "Put_Now": 167.8950277401441,
                        "Put_Sim": 289.9551498644373,
                        "Put_Chg": 72.70026025619363
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 239.6300453562435,
                        "Call_Sim": 125.483321394737,
                        "Call_Chg": -47.63456259911459,
                        "Put_Now": 212.8474707347441,
                        "Put_Sim": 352.02874677323734,
                        "Put_Chg": 65.39014795808615
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 944.8460149885113,
                        "Call_Sim": 296.39740620642215,
                        "Call_Chg": -68.63008347344027,
                        "Put_Now": 7.01423777809913,
                        "Put_Sim": 111.89362899600997,
                        "Put_Chg": 1495.235755271663
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 518.6188929054292,
                        "Call_Sim": 86.47203470416389,
                        "Call_Chg": -83.32647809652161,
                        "Put_Now": 60.28669600497142,
                        "Put_Sim": 381.46783780370606,
                        "Put_Chg": 532.756251515673
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 446.00918521902804,
                        "Call_Sim": 64.21417459266831,
                        "Call_Chg": -85.60249951777703,
                        "Put_Now": 83.57690438056011,
                        "Put_Sim": 455.10989375420104,
                        "Put_Chg": 444.54026160372973
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 379.1561546631515,
                        "Call_Sim": 46.89419074090222,
                        "Call_Chg": -87.63195845190387,
                        "Put_Now": 112.62378988667524,
                        "Put_Sim": 533.6898259644267,
                        "Put_Chg": 373.8695319181127
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 348.03175335778315,
                        "Call_Sim": 39.827283207601454,
                        "Call_Chg": -88.55642256105918,
                        "Put_Now": 129.4493466123015,
                        "Put_Sim": 574.5728764621203,
                        "Put_Chg": 343.8592325869021
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 318.49679441239596,
                        "Call_Sim": 33.688391178849315,
                        "Call_Chg": -89.42269066129785,
                        "Put_Now": 147.86434569791072,
                        "Put_Sim": 616.3839424643638,
                        "Put_Chg": 316.8577215521897
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 290.5775184236345,
                        "Call_Sim": 28.381759094771837,
                        "Call_Chg": -90.23263766283739,
                        "Put_Now": 167.8950277401441,
                        "Put_Sim": 659.0272684112829,
                        "Put_Chg": 292.5233982695891
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 239.6300453562435,
                        "Call_Sim": 19.908004650213968,
                        "Call_Chg": -91.6921917614221,
                        "Put_Now": 212.8474707347441,
                        "Put_Sim": 746.453430028715,
                        "Put_Chg": 250.6987550530794
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5305.86128,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 944.8460149885113,
                        "Call_Sim": 995.9305396068967,
                        "Call_Chg": 5.406650798967118,
                        "Put_Now": 7.01423777809913,
                        "Put_Sim": 5.565482396484214,
                        "Put_Chg": -20.654494863838664
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 518.6188929054292,
                        "Call_Sim": 562.0837816157955,
                        "Call_Chg": 8.380891885150074,
                        "Put_Now": 60.28669600497142,
                        "Put_Sim": 51.21830471533815,
                        "Put_Chg": -15.042110267388784
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 446.00918521902804,
                        "Call_Sim": 486.80761430746725,
                        "Call_Chg": 9.147441451996945,
                        "Put_Now": 83.57690438056011,
                        "Put_Sim": 71.84205346899967,
                        "Put_Chg": -14.040781958286978
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 379.1561546631515,
                        "Call_Sim": 416.95388050737756,
                        "Call_Chg": 9.96890736952594,
                        "Put_Now": 112.62378988667524,
                        "Put_Sim": 97.8882357309019,
                        "Put_Chg": -13.083873461016196
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 348.03175335778315,
                        "Call_Sim": 384.2252400072998,
                        "Call_Chg": 10.399478294817856,
                        "Put_Now": 129.4493466123015,
                        "Put_Sim": 113.10955326181829,
                        "Put_Chg": -12.622538296327287
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 318.49679441239596,
                        "Call_Sim": 353.0307916678926,
                        "Call_Chg": 10.842808424244707,
                        "Put_Now": 147.86434569791072,
                        "Put_Sim": 129.865062953407,
                        "Put_Chg": -12.172834945130415
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 290.5775184236345,
                        "Call_Sim": 323.408471613895,
                        "Call_Chg": 11.298517988716558,
                        "Put_Now": 167.8950277401441,
                        "Put_Sim": 148.19270093040495,
                        "Put_Chg": -11.734907861734289
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 239.6300453562435,
                        "Call_Sim": 268.9738710114766,
                        "Call_Chg": 12.245470141947106,
                        "Put_Now": 212.8474707347441,
                        "Put_Sim": 189.6580163899771,
                        "Put_Chg": -10.894869581826642
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5200.794720000001,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 944.8460149885113,
                        "Call_Sim": 894.0980684316919,
                        "Call_Chg": -5.371028268287346,
                        "Put_Now": 7.01423777809913,
                        "Put_Sim": 8.799571221278626,
                        "Put_Chg": 25.45299289331085
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 518.6188929054292,
                        "Call_Sim": 476.44870996865075,
                        "Call_Chg": -8.13124695487487,
                        "Put_Now": 60.28669600497142,
                        "Put_Sim": 70.64979306819191,
                        "Put_Chg": 17.189691507336747
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 446.00918521902804,
                        "Call_Sim": 406.71111665812987,
                        "Call_Chg": -8.811044674248024,
                        "Put_Now": 83.57690438056011,
                        "Put_Sim": 96.81211581966136,
                        "Put_Chg": 15.83596752858406
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 379.1561546631515,
                        "Call_Sim": 343.0366915663885,
                        "Call_Chg": -9.526276351455266,
                        "Put_Now": 112.62378988667524,
                        "Put_Sim": 129.0376067899117,
                        "Put_Chg": 14.574022877184689
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 348.03175335778315,
                        "Call_Sim": 313.5909379361574,
                        "Call_Chg": -9.89588308806408,
                        "Put_Now": 129.4493466123015,
                        "Put_Sim": 147.54181119067584,
                        "Put_Chg": 13.976481961365907
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 318.49679441239596,
                        "Call_Sim": 285.7783781308153,
                        "Call_Chg": -10.272761564820076,
                        "Put_Now": 147.86434569791072,
                        "Put_Sim": 167.6792094163293,
                        "Put_Chg": 13.400704290742716
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 290.5775184236345,
                        "Call_Sim": 259.612527833267,
                        "Call_Chg": -10.65636142752912,
                        "Put_Now": 167.8950277401441,
                        "Put_Sim": 189.46331714977669,
                        "Put_Chg": 12.846294318503853
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 239.6300453562435,
                        "Call_Sim": 212.21271328821467,
                        "Call_Chg": -11.44152521745307,
                        "Put_Now": 212.8474707347441,
                        "Put_Sim": 237.96341866671492,
                        "Put_Chg": 11.799974810727704
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
                        "Strike": 5300.0,
                        "Call_Now": 43.962159972535574,
                        "Call_Sim": 66.4664494411445,
                        "Call_Chg": 51.1901359775498,
                        "Put_Now": 75.93236636141864,
                        "Put_Sim": 51.76465583002755,
                        "Put_Chg": -31.82794332572091
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5300.0,
                "options": [
                    {
                        "Strike": 5300.0,
                        "Call_Now": 43.962159972535574,
                        "Call_Sim": 66.4664494411445,
                        "Call_Chg": 51.1901359775498,
                        "Put_Now": 75.93236636141864,
                        "Put_Sim": 51.76465583002755,
                        "Put_Chg": -31.82794332572091
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5305.86128,
                "options": [
                    {
                        "Strike": 5300.0,
                        "Call_Now": 43.962159972535574,
                        "Call_Sim": 69.708251195304,
                        "Call_Chg": 58.56420894435749,
                        "Put_Now": 75.93236636141864,
                        "Put_Sim": 49.14517758418788,
                        "Put_Chg": -35.27769521857201
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5200.794720000001,
                "options": [
                    {
                        "Strike": 5300.0,
                        "Call_Now": 43.962159972535574,
                        "Call_Sim": 25.507838242352364,
                        "Call_Chg": -41.977741179487445,
                        "Put_Now": 75.93236636141864,
                        "Put_Sim": 110.0113246312344,
                        "Put_Chg": 44.88067460930775
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.00011550810232372833,
            -0.0692390946704221,
            -0.00010149269848928752,
            0.04289122098789901,
            0.008078859611335629,
            0.2675201350929939,
            0.0011246911852796648,
            0.1562061217766689,
            0.001348791502068213,
            0.03752988247409731,
            0.4779718081406241,
            0.029297863257627704
        ]
    },
    "delta_data": {
        "strikes": [
            4500.0,
            5000.0,
            5100.0,
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
            -0.3403759768481107,
            -1376.2852690891705,
            -6.955988140375507,
            -684.5169337720973,
            81.22127548497512,
            508.1873390993172,
            -48.297058655932204,
            263.5445583418878,
            1.4744554591373222,
            208.50828327513736,
            -5414.436593582533,
            68.84564322440589
        ],
        "delta_cumulative": [
            -0.3403759768481107,
            -1376.6256450660185,
            -1383.581633206394,
            -2068.0985669784914,
            -1986.8772914935162,
            -1478.6899523941988,
            -1526.987011050131,
            -1263.4424527082433,
            -1261.967997249106,
            -1053.4597139739687,
            -6467.896307556502,
            -6399.050664332096
        ]
    },
    "gamma_data": {
        "strikes": [
            4500.0,
            5000.0,
            5100.0,
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
            4199.19583080296,
            15997848.05821028,
            38708.27997002676,
            5605952.30381885,
            342790.2245103497,
            8406350.037505925,
            207905.97980751086,
            3673332.2953861374,
            25796.88190368266,
            955697.4027906379,
            14588233.392756678,
            508678.6272546898
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            240334.39148765273,
            8313154.742847702,
            0.0,
            3673332.2953861374,
            25796.88190368266,
            955697.4027906379,
            6202683.045162283,
            508678.6272546898
        ],
        "gamma_put": [
            4199.19583080296,
            15997848.05821028,
            38708.27997002676,
            5605952.30381885,
            102455.83302269697,
            93195.29465822312,
            207905.97980751086,
            0.0,
            0.0,
            0.0,
            8385550.347594394,
            0.0
        ],
        "gamma_exposure": [
            4199.19583080296,
            16002047.254041083,
            16040755.53401111,
            21646707.837829962,
            21989498.06234031,
            30395848.099846236,
            30603754.079653747,
            34277086.37503988,
            34302883.25694357,
            35258580.659734204,
            49846814.05249088,
            50355492.67974557
        ]
    },
    "oi_data": {
        "strikes": [
            4500.0,
            5000.0,
            5100.0,
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
            150.0,
            1235.0,
            0.0,
            1010.0,
            10.0,
            500.0,
            5200.0,
            500.0
        ],
        "put_oi": [
            15.0,
            8900.0,
            30.0,
            2040.0,
            65.0,
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
            30.0,
            2040.0,
            215.0,
            1295.0,
            130.0,
            1010.0,
            10.0,
            500.0,
            12230.0,
            500.0
        ]
    },
    "oi_data_nearest": {
        "strikes": [
            5300.0
        ],
        "call_oi": [
            1135.0
        ],
        "put_oi": [
            0.0
        ],
        "total_oi": [
            1135.0
        ]
    },
    "gex_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 14,
            "abs_call": 7959237.779881819,
            "abs_put": 0.0,
            "net": 7959237.779881819
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 36,
            "abs_call": 3699129.1772898203,
            "abs_put": 0.0,
            "net": 3699129.1772898203
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 57,
            "abs_call": 353916.96296588203,
            "abs_put": 0.0,
            "net": 353916.96296588203
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 79,
            "abs_call": 0.0,
            "abs_put": 21576338.318841487,
            "net": 21576338.318841487
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 123,
            "abs_call": 45527.08763472586,
            "abs_put": 0.0,
            "net": 45527.08763472586
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 145,
            "abs_call": 6202683.045162283,
            "abs_put": 8385550.347594394,
            "net": 14588233.392756678
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 167,
            "abs_call": 0.0,
            "abs_put": 31661.239018447155,
            "net": 31661.239018447155
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 188,
            "abs_call": 955697.4027906379,
            "abs_put": 0.0,
            "net": 955697.4027906379
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 211,
            "abs_call": 508678.6272546898,
            "abs_put": 0.0,
            "net": 508678.6272546898
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 232,
            "abs_call": 0.0,
            "abs_put": 102455.83302269697,
            "net": 102455.83302269697
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 252,
            "abs_call": 194807.30385292688,
            "abs_put": 339809.5544357607,
            "net": 534616.8582886877
        }
    ],
    "oi_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 14,
            "call_oi": 1135.0,
            "put_oi": 0.0,
            "total_oi": 1135.0
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 36,
            "call_oi": 1020.0,
            "put_oi": 0.0,
            "total_oi": 1020.0
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 57,
            "call_oi": 100.0,
            "put_oi": 0.0,
            "total_oi": 100.0
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 79,
            "call_oi": 0.0,
            "put_oi": 10925.0,
            "total_oi": 10925.0
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 123,
            "call_oi": 20.0,
            "put_oi": 0.0,
            "total_oi": 20.0
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 145,
            "call_oi": 5200.0,
            "put_oi": 7030.0,
            "total_oi": 12230.0
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 167,
            "call_oi": 0.0,
            "put_oi": 30.0,
            "total_oi": 30.0
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 188,
            "call_oi": 500.0,
            "put_oi": 0.0,
            "total_oi": 500.0
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 211,
            "call_oi": 500.0,
            "put_oi": 0.0,
            "total_oi": 500.0
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 232,
            "call_oi": 0.0,
            "put_oi": 65.0,
            "total_oi": 65.0
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 252,
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
            30.0,
            95.0,
            20.0,
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
            30.0,
            95.0,
            170.0,
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
                "oi": 1135,
                "volume": 125,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5450.0,
                "type": "CALL",
                "oi": 1010,
                "volume": 450,
                "expiry": "2026-05-01 00:00:00",
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
                "strike": 6200.0,
                "type": "CALL",
                "oi": 500,
                "volume": 500,
                "expiry": "2027-01-01 00:00:00",
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
                "strike": 5250.0,
                "type": "CALL",
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
                "strike": 5250.0,
                "type": "PUT",
                "oi": 65,
                "volume": 20,
                "expiry": "2027-02-01 00:00:00",
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
                "strike": 5100.0,
                "type": "PUT",
                "oi": 30,
                "volume": 30,
                "expiry": "2027-03-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5250.0,
                "type": "CALL",
                "oi": 20,
                "volume": 20,
                "expiry": "2026-09-01 00:00:00",
                "iv": 0.0
            }
        ],
        "top_vol": [
            {
                "strike": 6200.0,
                "type": "CALL",
                "oi": 500,
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
                "strike": 5450.0,
                "type": "CALL",
                "oi": 1010,
                "volume": 450,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5550.0,
                "type": "CALL",
                "oi": 10,
                "volume": 450,
                "expiry": "2026-05-01 00:00:00",
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
                "oi": 1135,
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
                "strike": 6000.0,
                "type": "PUT",
                "oi": 7030,
                "volume": 30,
                "expiry": "2026-10-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5100.0,
                "type": "PUT",
                "oi": 30,
                "volume": 30,
                "expiry": "2027-03-01 00:00:00",
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
                "strike": 5250.0,
                "type": "PUT",
                "oi": 65,
                "volume": 20,
                "expiry": "2027-02-01 00:00:00",
                "iv": 0.0
            }
        ]
    },
    "fed_watch": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 19,
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
            "days_to_exp": 49,
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
            "days_to_exp": 80,
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
            "days_to_exp": 110,
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
            "days_to_exp": 172,
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
            "days_to_exp": 201,
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
            "days_to_exp": 234,
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
            "days_to_exp": 263,
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
            "days_to_exp": 294,
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
            "days_to_exp": 325,
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
            "days_to_exp": 353,
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
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            4500.0,
            5000.0,
            5100.0,
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
            -0.7414955293472036,
            -1610.6773633618543,
            1.0592206790940817,
            137.46194441562008,
            19.28109048768667,
            1764.945608896299,
            15.638837501918466,
            1154.6552073514383,
            11.390861713820728,
            136.32695426552073,
            4200.69820337394,
            129.64565912980623
        ],
        "vanna": [
            -12.924836048689048,
            -17033.030319306024,
            -47.768708451960684,
            -2268.6320085234147,
            -231.8540672606227,
            815.2317011921928,
            -87.91673532786992,
            1909.2423022778778,
            21.27780199767362,
            517.3100417065313,
            26641.69133090633,
            1114.0670543113365
        ],
        "vex": [
            3455.922929109311,
            6228308.386424593,
            48071.29959201721,
            2194428.119320396,
            386665.5049629898,
            764291.6457407273,
            258195.67932333067,
            651694.6666164487,
            4576.686506984563,
            885441.1550323493,
            10424426.078685619,
            528941.1984092637
        ],
        "theta": [
            -0.8550753700954487,
            -3173.8103020919457,
            -3.493418231568406,
            -886.7439747101286,
            -171.69628317917633,
            -2963.89836731842,
            -5.8185953689498415,
            -1337.3058589276195,
            -9.015535003192355,
            -480.479299030348,
            2271.9365892918536,
            -216.1538189893945
        ],
        "charm_cum": [
            -0.7414955293472036,
            -1611.4188588912016,
            -1610.3596382121075,
            -1472.8976937964874,
            -1453.6166033088007,
            311.3290055874984,
            326.9678430894169,
            1481.6230504408552,
            1493.0139121546758,
            1629.3408664201966,
            5830.039069794137,
            5959.684728923943
        ],
        "vanna_cum": [
            -12.924836048689048,
            -17045.955155354713,
            -17093.723863806674,
            -19362.35587233009,
            -19594.20993959071,
            -18778.97823839852,
            -18866.89497372639,
            -16957.65267144851,
            -16936.37486945084,
            -16419.064827744307,
            10222.626503162024,
            11336.693557473362
        ],
        "theta_cum": [
            -0.8550753700954487,
            -3174.6653774620413,
            -3178.1587956936096,
            -4064.902770403738,
            -4236.599053582914,
            -7200.497420901334,
            -7206.316016270284,
            -8543.621875197903,
            -8552.637410201096,
            -9033.116709231444,
            -6761.18011993959,
            -6977.333938928985
        ],
        "r_gamma": [
            4199.19583080296,
            15997848.05821028,
            38708.27997002676,
            5605952.30381885,
            342790.2245103497,
            -8406350.037505925,
            -207905.97980751086,
            -3673332.2953861374,
            -25796.88190368266,
            -955697.4027906379,
            -14588233.392756678,
            -508678.6272546898
        ],
        "r_gamma_cum": [
            4199.19583080296,
            16002047.254041083,
            16040755.53401111,
            21646707.837829962,
            21989498.06234031,
            13583148.024834387,
            13375242.045026876,
            9701909.749640739,
            9676112.867737057,
            8720415.464946419,
            -5867817.927810259,
            -6376496.555064949
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.3403759768481107,
            "gamma": 4199.19583080296,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -1376.2852690891705,
            "gamma": 15997848.05821028,
            "volume": 160,
            "oi": 8900,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -6.955988140375507,
            "gamma": 38708.27997002676,
            "volume": 30,
            "oi": 30,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -684.5169337720973,
            "gamma": 5605952.30381885,
            "volume": 95,
            "oi": 2040,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": 81.22127548497512,
            "gamma": 342790.2245103497,
            "volume": 170,
            "oi": 215,
            "iv": 11.82
        },
        {
            "strike": 5300.0,
            "delta": 508.1873390993172,
            "gamma": 8406350.037505925,
            "volume": 285,
            "oi": 1295,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": -48.297058655932204,
            "gamma": 207905.97980751086,
            "volume": 130,
            "oi": 130,
            "iv": 11.82
        },
        {
            "strike": 5450.0,
            "delta": 263.5445583418878,
            "gamma": 3673332.2953861374,
            "volume": 450,
            "oi": 1010,
            "iv": 11.82
        },
        {
            "strike": 5550.0,
            "delta": 1.4744554591373222,
            "gamma": 25796.88190368266,
            "volume": 450,
            "oi": 10,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 208.50828327513736,
            "gamma": 955697.4027906379,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5414.436593582533,
            "gamma": 14588233.392756678,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 68.84564322440589,
            "gamma": 508678.6272546898,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        }
    ]
};