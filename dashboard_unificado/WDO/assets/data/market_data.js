window.marketData = {
    "last_updated": "2026-03-12 16:40:40",
    "spot_price": 5262.0,
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-03-12",
        "meetings": [
            {
                "date": "2026-03-18",
                "days_remaining": 5,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 1.4,
                    "3.50-3.75": 99.6,
                    "3.75-4.00": 0.4
                }
            },
            {
                "date": "2026-04-29",
                "days_remaining": 47,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.1,
                    "3.25-3.50": 6.4,
                    "3.50-3.75": 93.2,
                    "3.75-4.00": 0.4
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 96,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 1.1,
                    "3.25-3.50": 20.9,
                    "3.50-3.75": 77.7,
                    "3.75-4.00": 0.3
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 138,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 3.7,
                    "3.25-3.50": 28.5,
                    "3.50-3.75": 67.4,
                    "3.75-4.00": 0.3
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 187,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.5,
                    "3.00-3.25": 6.4,
                    "3.25-3.50": 32.7,
                    "3.50-3.75": 60.2,
                    "3.75-4.00": 0.3
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
                    "2.75-3.00": 1.1,
                    "3.00-3.25": 8.8,
                    "3.25-3.50": 35.2,
                    "3.50-3.75": 54.7,
                    "3.75-4.00": 0.2
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
                    "2.50-2.75": 0.2,
                    "2.75-3.00": 2.3,
                    "3.00-3.25": 13.0,
                    "3.25-3.50": 38.3,
                    "3.50-3.75": 45.9,
                    "3.75-4.00": 0.2
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 12/03/2026 16:40\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(3);\n  spot(5262.00);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5932.81;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (5932.81)\n  // 2 = Spline (5940.60)\n  // 3 = HVL (5376.67)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (5932.81)\n  // 7 = HVL Gaussian (5898.97)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 5932.81;\n  if (ModeloFlip = 2) then GammaVal := 5940.60;\n  if (ModeloFlip = 3) then GammaVal := 5376.67;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 5932.81;\n  if (ModeloFlip = 7) then GammaVal := 5898.97;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirRange) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5222.82 <= LimitUpper) and (5222.82 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5222.82, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5301.18 <= LimitUpper) and (5301.18 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5301.18, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5391.75 <= LimitUpper) and (5391.75 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5391.75, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5750.00 <= LimitUpper) and (5750.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5750.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5869.53 <= LimitUpper) and (5869.53 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5869.53, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5900.00 <= LimitUpper) and (5900.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5900.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirMaxPain) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5553.08 > 0) then\n      HorizontalLineCustom(5553.08, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5150.00 <= LimitUpper) and (5150.00 >= LimitLower) then\n      HorizontalLineCustom(5150.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5275.00 <= LimitUpper) and (5275.00 >= LimitLower) then\n      HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5500.00 <= LimitUpper) and (5500.00 >= LimitLower) then\n      HorizontalLineCustom(5500.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5675.00 <= LimitUpper) and (5675.00 >= LimitLower) then\n      HorizontalLineCustom(5675.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5825.00 <= LimitUpper) and (5825.00 >= LimitLower) then\n      HorizontalLineCustom(5825.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5950.00 <= LimitUpper) and (5950.00 >= LimitLower) then\n      HorizontalLineCustom(5950.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5476.40 <= LimitUpper) and (5476.40 >= LimitLower) then\n      HorizontalLineCustom(5476.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5523.60 <= LimitUpper) and (5523.60 >= LimitLower) then\n      HorizontalLineCustom(5523.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5657.30 <= LimitUpper) and (5657.30 >= LimitLower) then\n      HorizontalLineCustom(5657.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5692.70 <= LimitUpper) and (5692.70 >= LimitLower) then\n      HorizontalLineCustom(5692.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5807.30 <= LimitUpper) and (5807.30 >= LimitLower) then\n      HorizontalLineCustom(5807.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5842.70 <= LimitUpper) and (5842.70 >= LimitLower) then\n      HorizontalLineCustom(5842.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5938.20 <= LimitUpper) and (5938.20 >= LimitLower) then\n      HorizontalLineCustom(5938.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5961.80 <= LimitUpper) and (5961.80 >= LimitLower) then\n      HorizontalLineCustom(5961.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5123.60 <= LimitUpper) and (5123.60 >= LimitLower) then\n      HorizontalLineCustom(5123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5176.40 <= LimitUpper) and (5176.40 >= LimitLower) then\n      HorizontalLineCustom(5176.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5261.80 <= LimitUpper) and (5261.80 >= LimitLower) then\n      HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5447.20 <= LimitUpper) and (5447.20 >= LimitLower) then\n      HorizontalLineCustom(5447.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5552.80 <= LimitUpper) and (5552.80 >= LimitLower) then\n      HorizontalLineCustom(5552.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5635.40 <= LimitUpper) and (5635.40 >= LimitLower) then\n      HorizontalLineCustom(5635.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5714.60 <= LimitUpper) and (5714.60 >= LimitLower) then\n      HorizontalLineCustom(5714.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5785.40 <= LimitUpper) and (5785.40 >= LimitLower) then\n      HorizontalLineCustom(5785.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5864.60 <= LimitUpper) and (5864.60 >= LimitLower) then\n      HorizontalLineCustom(5864.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5923.60 <= LimitUpper) and (5923.60 >= LimitLower) then\n      HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5976.40 <= LimitUpper) and (5976.40 >= LimitLower) then\n      HorizontalLineCustom(5976.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5269.89, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5254.11, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5277.79, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5246.21, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5292.44, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5231.56, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5300.34, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5223.66, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 33265,
        "total_volume": 10265,
        "gamma_exposure": 74905122.53054142,
        "delta_position": -6946.19607726958,
        "last_update": "2026-03-12T16:40:40.408425",
        "spot_price": 5262.0,
        "dealer_pressure": 0.15002820468686803,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 5898.971114634406,
        "call_wall": 5300.0,
        "put_wall": 5000.0,
        "effective_call_wall": 5869.525959367946,
        "effective_put_wall": 5391.7525773195875,
        "max_pain": 6000.0,
        "zero_gamma": 5932.814791020668,
        "range_low": 5222.819673577602,
        "range_high": 5301.180326422399,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5301.180326422399,
                "sigma_1_down": 5222.819673577601,
                "sigma_2_up": 5340.360652844797,
                "sigma_2_down": 5183.639347155203
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5349.609873261114,
                "sigma_1_down": 5174.390126738886,
                "sigma_2_up": 5437.219746522229,
                "sigma_2_down": 5086.780253477771
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 211,
                "sigma_1_up": 5831.127115394589,
                "sigma_1_down": 4692.872884605411,
                "sigma_2_up": 6400.254230789178,
                "sigma_2_down": 4123.745769210822
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
                null,
                null,
                5342.8758915308645,
                5331.363624780473,
                5331.466479713752,
                5336.415502137159,
                5343.430085070697,
                5351.721828340661,
                5365.365160817759,
                5376.66522440899,
                5385.9875678221015,
                5393.689783758144,
                5404.59904709807,
                5935.012532014352,
                5991.204968239706,
                null,
                null,
                5998.0858452351495,
                5991.603472763725,
                5985.342333218254,
                5979.700917148077,
                5974.75705774875,
                5970.470831188179,
                5966.765246550683,
                5963.55806648961,
                5960.773582468534,
                5958.3461271951965,
                5956.22027088446,
                5954.349802876367,
                5952.696383804861
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
                5309.962112450369,
                5299.700297310099,
                5297.388697411536,
                5295.995024060572,
                5295.168664679007,
                5294.743801122095,
                5294.617873532307,
                5294.712199872591,
                5294.962277274114,
                5295.316140733928,
                5295.733576654741,
                5296.1847183938435,
                5296.648211392014,
                5297.109342288435,
                5297.558379079946,
                5297.989215520512,
                5298.398320470485,
                5298.7839514879815,
                5299.145580398071,
                5299.48348125974,
                5299.798439135019,
                5300.071164869581,
                5300.282052713844,
                5300.47681653524,
                5300.656809822023,
                5300.823292977695
            ]
        },
        "gamma_flip_cone_nearest_expiry": "2026-04-01",
        "delta_flip_profile": {
            "spots": [
                4472.7,
                4504.916326530612,
                4537.132653061224,
                4569.348979591837,
                4601.565306122448,
                4633.781632653061,
                4665.997959183674,
                4698.214285714285,
                4730.430612244898,
                4762.64693877551,
                4794.863265306122,
                4827.079591836735,
                4859.2959183673465,
                4891.512244897959,
                4923.728571428571,
                4955.944897959183,
                4988.161224489795,
                5020.377551020408,
                5052.59387755102,
                5084.810204081632,
                5117.026530612245,
                5149.242857142857,
                5181.459183673469,
                5213.675510204082,
                5245.891836734693,
                5278.108163265306,
                5310.3244897959175,
                5342.54081632653,
                5374.757142857143,
                5406.973469387754,
                5439.189795918367,
                5471.406122448979,
                5503.622448979591,
                5535.838775510203,
                5568.055102040816,
                5600.271428571428,
                5632.48775510204,
                5664.704081632653,
                5696.920408163265,
                5729.136734693877,
                5761.3530612244895,
                5793.569387755101,
                5825.785714285714,
                5858.0020408163255,
                5890.218367346938,
                5922.434693877551,
                5954.651020408162,
                5986.867346938775,
                6019.083673469388,
                6051.299999999999
            ],
            "deltas": [
                -21875.198573271322,
                -21682.736706330918,
                -21461.26795746088,
                -21208.943975411206,
                -20924.039786253827,
                -20604.825921912852,
                -20249.391374793344,
                -19855.47351101887,
                -19420.388629828252,
                -18941.170886115382,
                -18414.992734880107,
                -17839.84690765942,
                -17215.339363072595,
                -16543.329157662945,
                -15828.122323371636,
                -15076.026323205175,
                -14294.286060950853,
                -13489.67484012685,
                -12667.193790352756,
                -11829.350600347609,
                -10976.319439454808,
                -10106.986869510067,
                -9220.577490267251,
                -8318.347008716448,
                -7404.803102729747,
                -6488.067989420974,
                -5579.267241511234,
                -4691.118181592729,
                -3836.103770504492,
                -3024.696830442741,
                -2264.038352418479,
                -1557.3113030298757,
                -903.8511058035452,
                -299.85860053316327,
                260.5268217415758,
                784.0635592206224,
                1277.382157010187,
                1746.2441342311854,
                2195.1390726371733,
                2627.19464984547,
                3044.3223376998085,
                3447.499905168547,
                3837.0962694926507,
                4213.166072027321,
                4575.670983352859,
                4924.613721622438,
                5260.093224145011,
                5582.302576691149,
                5891.495288910238,
                6187.942478737654
            ],
            "flip_value": 5553.077522636378
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                0.0,
                155.0,
                175.0,
                0.0,
                55.0,
                500.0,
                25.0,
                200.0,
                30.0,
                500.0
            ],
            "bear": [
                -15.0,
                -4025.0,
                -830.0,
                -2015.0,
                -20.0,
                -60.0,
                -1630.0,
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
                4472.7,
                4504.916326530612,
                4537.132653061224,
                4569.348979591837,
                4601.565306122448,
                4633.781632653061,
                4665.997959183674,
                4698.214285714285,
                4730.430612244898,
                4762.64693877551,
                4794.863265306122,
                4827.079591836735,
                4859.2959183673465,
                4891.512244897959,
                4923.728571428571,
                4955.944897959183,
                4988.161224489795,
                5020.377551020408,
                5052.59387755102,
                5084.810204081632,
                5117.026530612245,
                5149.242857142857,
                5181.459183673469,
                5213.675510204082,
                5245.891836734693,
                5278.108163265306,
                5310.3244897959175,
                5342.54081632653,
                5374.757142857143,
                5406.973469387754,
                5439.189795918367,
                5471.406122448979,
                5503.622448979591,
                5535.838775510203,
                5568.055102040816,
                5600.271428571428,
                5632.48775510204,
                5664.704081632653,
                5696.920408163265,
                5729.136734693877,
                5761.3530612244895,
                5793.569387755101,
                5825.785714285714,
                5858.0020408163255,
                5890.218367346938,
                5922.434693877551,
                5954.651020408162,
                5986.867346938775,
                6019.083673469388,
                6051.299999999999
            ],
            "pnl": [
                -13437192.824817406,
                -12691593.986559475,
                -11959560.671240324,
                -11241706.491516998,
                -10538619.240108827,
                -9850857.495302595,
                -9178947.60462617,
                -8523381.072382387,
                -7884612.366844691,
                -7263057.153283939,
                -6659090.949903671,
                -6073048.195451038,
                -5505221.709935229,
                -4955862.523673315,
                -4425180.044887371,
                -3913342.532341607,
                -3420477.837031966,
                -2946674.375675123,
                -2491982.2986087594,
                -2056414.8155935872,
                -1639949.6447653938,
                -1242530.5524689509,
                -864068.9547516992,
                -504445.55474392883,
                -163511.99384170026,
                158907.50160921272,
                463014.4926892072,
                749034.7303229747,
                1017216.5954009788,
                1267829.5812824676,
                1501162.820766233,
                1717523.657454187,
                1917236.2597155897,
                2100640.2741864696,
                2268089.5148932897,
                2419950.683640982,
                2556602.1172142094,
                2678432.557159286,
                2785839.938389728,
                2879230.1935359305,
                2959016.0707838926,
                3025615.9638652867,
                3079452.7538214093,
                3120952.6631207066,
                3150544.1236243984,
                3168656.6607323755,
                3175719.796776261,
                3172161.977337024,
                3158409.5246374607,
                3134885.6224877965
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
                5400.0,
                5600.0,
                5750.0,
                5900.0,
                6000.0,
                6200.0
            ],
            "loss": [
                19580750.0,
                8195750.0,
                7010250.0,
                5907750.0,
                5458500.0,
                5067500.0,
                4741250.0,
                4506500.0,
                3856500.0,
                3444000.0,
                3091500.0,
                2866500.0,
                4862500.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5300.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 953.2573019464489,
                        "Call_Sim": 990.216077783336,
                        "Call_Chg": 3.8771038796578035,
                        "Put_Now": 6.753524736035899,
                        "Put_Sim": 5.712300572923226,
                        "Put_Chg": -15.417492402994265
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 525.7079134319611,
                        "Call_Sim": 557.1738610391667,
                        "Call_Chg": 5.985443019449253,
                        "Put_Now": 58.70371653150369,
                        "Put_Sim": 52.16966413870887,
                        "Put_Chg": -11.13056000345103
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 452.64370156432597,
                        "Call_Sim": 482.1848396543819,
                        "Call_Chg": 6.526355715977592,
                        "Put_Now": 81.53942072585892,
                        "Put_Sim": 73.08055881591508,
                        "Put_Chg": -10.373953892048245
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 385.2826882566774,
                        "Call_Sim": 412.6566693941795,
                        "Call_Chg": 7.104908154935176,
                        "Put_Now": 110.07832348020202,
                        "Put_Sim": 99.45230461770416,
                        "Put_Chg": -9.653143803928831
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 353.88807462526665,
                        "Call_Sim": 380.10303578825915,
                        "Call_Chg": 7.407698377729063,
                        "Put_Now": 126.63366787978566,
                        "Put_Sim": 114.84862904277838,
                        "Put_Chg": -9.306402502843799
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 324.07453298290557,
                        "Call_Sim": 349.090278420897,
                        "Call_Chg": 7.719133375812339,
                        "Put_Now": 144.77008426842053,
                        "Put_Sim": 131.78582970641196,
                        "Put_Chg": -8.968879604942593
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 295.8703122852771,
                        "Call_Sim": 319.6550870998781,
                        "Call_Chg": 8.038919021948967,
                        "Put_Now": 164.5158216017876,
                        "Put_Sim": 150.30059641638877,
                        "Put_Chg": -8.640643220204641
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 269.2915542426117,
                        "Call_Sim": 291.8225027710132,
                        "Call_Chg": 8.366749039631143,
                        "Put_Now": 185.887021590117,
                        "Put_Sim": 170.4179701185185,
                        "Put_Chg": -8.321749059871399
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5000.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 953.2573019464489,
                        "Call_Sim": 704.5371664418872,
                        "Call_Chg": -26.091605592393783,
                        "Put_Now": 6.753524736035899,
                        "Put_Sim": 20.03338923147504,
                        "Put_Chg": 196.6360532386825
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 525.7079134319611,
                        "Call_Sim": 329.33045134046915,
                        "Call_Chg": -37.354861335354,
                        "Put_Now": 58.70371653150369,
                        "Put_Sim": 124.3262544400111,
                        "Put_Chg": 111.78600229389343
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 452.64370156432597,
                        "Call_Sim": 272.2556955380228,
                        "Call_Chg": -39.85209678227853,
                        "Put_Now": 81.53942072585892,
                        "Put_Sim": 163.15141469955574,
                        "Put_Chg": 100.08900387958593
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 385.2826882566774,
                        "Call_Sim": 222.02052117116364,
                        "Call_Chg": -42.374643881416134,
                        "Put_Now": 110.07832348020202,
                        "Put_Sim": 208.8161563946869,
                        "Put_Chg": 89.6977986154043
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 353.88807462526665,
                        "Call_Sim": 199.45818831585257,
                        "Call_Chg": -43.638058861672704,
                        "Put_Now": 126.63366787978566,
                        "Put_Sim": 234.20378157037203,
                        "Put_Chg": 84.94590379606119
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 324.07453298290557,
                        "Call_Sim": 178.56757048163126,
                        "Call_Chg": -44.8992277060381,
                        "Put_Now": 144.77008426842053,
                        "Put_Sim": 261.263121767146,
                        "Put_Chg": 80.46761738615407
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 295.8703122852771,
                        "Call_Sim": 159.30964054792707,
                        "Call_Chg": -46.15558441215918,
                        "Put_Now": 164.5158216017876,
                        "Put_Sim": 289.9551498644373,
                        "Put_Chg": 76.24757730978425
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 269.2915542426117,
                        "Call_Sim": 141.6346166212777,
                        "Call_Chg": -47.404731269932284,
                        "Put_Now": 185.887021590117,
                        "Put_Sim": 320.23008396878276,
                        "Put_Chg": 72.27135129148164
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 953.2573019464489,
                        "Call_Sim": 296.39740620642215,
                        "Call_Chg": -68.90688320968425,
                        "Put_Now": 6.753524736035899,
                        "Put_Sim": 111.89362899600997,
                        "Put_Chg": 1556.8182300267683
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 525.7079134319611,
                        "Call_Sim": 86.47203470416389,
                        "Call_Chg": -83.55131576018108,
                        "Put_Now": 58.70371653150369,
                        "Put_Sim": 381.46783780370606,
                        "Put_Chg": 549.8188877002176
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 452.64370156432597,
                        "Call_Sim": 64.21417459266831,
                        "Call_Chg": -85.81352742328113,
                        "Put_Now": 81.53942072585892,
                        "Put_Sim": 455.10989375420104,
                        "Put_Chg": 458.14707745387534
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 385.2826882566774,
                        "Call_Sim": 46.89419074090222,
                        "Call_Chg": -87.82862761026495,
                        "Put_Now": 110.07832348020202,
                        "Put_Sim": 533.6898259644267,
                        "Put_Chg": 384.82735664157605
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 353.88807462526665,
                        "Call_Sim": 39.827283207601454,
                        "Call_Chg": -88.74579674667628,
                        "Put_Now": 126.63366787978566,
                        "Put_Sim": 574.5728764621203,
                        "Put_Chg": 353.7283694629827
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 324.07453298290557,
                        "Call_Sim": 33.688391178849315,
                        "Call_Chg": -89.6047397279976,
                        "Put_Now": 144.77008426842053,
                        "Put_Sim": 616.3839424643638,
                        "Put_Chg": 325.76748198993687
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 295.8703122852771,
                        "Call_Sim": 28.381759094771837,
                        "Call_Chg": -90.40736501220634,
                        "Put_Now": 164.5158216017876,
                        "Put_Sim": 659.0272684112829,
                        "Put_Chg": 300.58595094061275
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 269.2915542426117,
                        "Call_Sim": 23.81664203637888,
                        "Call_Chg": -91.15581544940625,
                        "Put_Now": 185.887021590117,
                        "Put_Sim": 702.412109383884,
                        "Put_Chg": 277.8704416130302
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5314.62,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 953.2573019464489,
                        "Call_Sim": 1004.476307852723,
                        "Call_Chg": 5.373051515229981,
                        "Put_Now": 6.753524736035899,
                        "Put_Sim": 5.352530642310981,
                        "Put_Chg": -20.744635556739762
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 525.7079134319611,
                        "Call_Sim": 569.4480644071023,
                        "Call_Chg": 8.320238264931922,
                        "Put_Now": 58.70371653150369,
                        "Put_Sim": 49.82386750664443,
                        "Put_Chg": -15.126553393078328
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 452.64370156432597,
                        "Call_Sim": 493.7476808023662,
                        "Call_Chg": 9.080868483530386,
                        "Put_Now": 81.53942072585892,
                        "Put_Sim": 70.02339996389856,
                        "Put_Chg": -14.123255548599012
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 385.2826882566774,
                        "Call_Sim": 423.41186669384433,
                        "Call_Chg": 9.896416215764434,
                        "Put_Now": 110.07832348020202,
                        "Put_Sim": 95.58750191736885,
                        "Put_Chg": -13.164100891706793
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 353.88807462526665,
                        "Call_Sim": 390.42364632148247,
                        "Call_Chg": 10.324047153864525,
                        "Put_Now": 126.63366787978566,
                        "Put_Sim": 110.54923957600113,
                        "Put_Chg": -12.701541835662224
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 324.07453298290557,
                        "Call_Sim": 358.95940187613314,
                        "Call_Chg": 10.76445858677445,
                        "Put_Now": 144.77008426842053,
                        "Put_Sim": 127.03495316164776,
                        "Put_Chg": -12.250549688076287
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 295.8703122852771,
                        "Call_Sim": 329.05890256980456,
                        "Call_Chg": 11.217276254647377,
                        "Put_Now": 164.5158216017876,
                        "Put_Sim": 145.0844118863149,
                        "Put_Chg": -11.811271114401768
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 269.2915542426117,
                        "Call_Sim": 300.75048179302576,
                        "Call_Chg": 11.682107015533019,
                        "Put_Now": 185.887021590117,
                        "Put_Sim": 164.72594914053116,
                        "Put_Chg": -11.383835336415391
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5209.38,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 953.2573019464489,
                        "Call_Sim": 902.365916519755,
                        "Call_Chg": -5.338682989658632,
                        "Put_Now": 6.753524736035899,
                        "Put_Sim": 8.482139309342614,
                        "Put_Chg": 25.595739126904498
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 525.7079134319611,
                        "Call_Sim": 483.24684569902865,
                        "Call_Chg": -8.076931438169774,
                        "Put_Now": 58.70371653150369,
                        "Put_Sim": 68.8626487985714,
                        "Put_Chg": 17.305432887909
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 452.64370156432597,
                        "Call_Sim": 413.0261172941223,
                        "Call_Chg": -8.752487692480033,
                        "Put_Now": 81.53942072585892,
                        "Put_Sim": 94.54183645565513,
                        "Put_Chg": 15.946171329216599
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 385.2826882566774,
                        "Call_Sim": 348.82070293929155,
                        "Call_Chg": -9.463696768305004,
                        "Put_Now": 110.07832348020202,
                        "Put_Sim": 126.23633816281585,
                        "Put_Chg": 14.678652591870112
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 353.88807462526665,
                        "Call_Sim": 319.0959611935082,
                        "Call_Chg": -9.831389053897894,
                        "Put_Now": 126.63366787978566,
                        "Put_Sim": 144.46155444802707,
                        "Put_Chg": 14.078314927405849
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 324.07453298290557,
                        "Call_Sim": 290.998113308337,
                        "Call_Chg": -10.206423618085813,
                        "Put_Now": 144.77008426842053,
                        "Put_Sim": 164.31366459385208,
                        "Put_Chg": 13.499736788987068
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 295.8703122852771,
                        "Call_Sim": 264.542813754324,
                        "Call_Chg": -10.588253444214182,
                        "Put_Now": 164.5158216017876,
                        "Put_Sim": 185.80832307083438,
                        "Put_Chg": 12.942525078582124
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 269.2915542426117,
                        "Call_Sim": 239.7332245685152,
                        "Call_Chg": -10.976330006795033,
                        "Put_Now": 185.887021590117,
                        "Put_Sim": 208.94869191602038,
                        "Put_Chg": 12.406283197519095
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
                        "Strike": 5000.0,
                        "Call_Now": 277.31709513708756,
                        "Call_Sim": 314.58720625162823,
                        "Call_Chg": 13.439528888803897,
                        "Put_Now": 1.4474785228261453,
                        "Put_Sim": 0.7175896373675954,
                        "Put_Chg": -50.42485079733483
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 72.5765013576929,
                        "Call_Sim": 96.40335670968034,
                        "Call_Chg": 32.829986161163795,
                        "Put_Now": 46.013403912718786,
                        "Put_Sim": 31.840259264706447,
                        "Put_Chg": -30.802208580127825
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 47.69848766639234,
                        "Call_Sim": 66.4664494411445,
                        "Call_Chg": 39.34707931626058,
                        "Put_Now": 70.99669405527538,
                        "Put_Sim": 51.76465583002755,
                        "Put_Chg": -27.088639099553685
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 29.39688155095564,
                        "Call_Sim": 43.17728277391279,
                        "Call_Chg": 46.87708524140778,
                        "Put_Now": 102.55639177369721,
                        "Put_Sim": 78.33679299665391,
                        "Put_Chg": -23.615884254671034
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 16.917694286457845,
                        "Call_Sim": 26.298690312269173,
                        "Call_Chg": 55.45079528550507,
                        "Put_Now": 139.93850834305613,
                        "Put_Sim": 111.319504368867,
                        "Put_Chg": -20.45112836563205
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.04338133664789989,
                        "Call_Sim": 0.10730346097973076,
                        "Call_Chg": 147.34936558236583,
                        "Put_Now": 472.0933222302474,
                        "Put_Sim": 434.15724435458014,
                        "Put_Chg": -8.035715840345063
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5350.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 277.31709513708756,
                        "Call_Sim": 364.1337365058671,
                        "Call_Chg": 31.305910414885535,
                        "Put_Now": 1.4474785228261453,
                        "Put_Sim": 0.2641198916063132,
                        "Put_Chg": -81.75310462702897
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 72.5765013576929,
                        "Call_Sim": 133.01713205343094,
                        "Call_Chg": 83.27851241803005,
                        "Put_Now": 46.013403912718786,
                        "Put_Sim": 18.454034608457505,
                        "Put_Chg": -59.89421985936464
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 47.69848766639234,
                        "Call_Sim": 97.00031203798972,
                        "Call_Chg": 103.36139945655913,
                        "Put_Now": 70.99669405527538,
                        "Put_Sim": 32.29851842687276,
                        "Put_Chg": -54.50701070429233
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 29.39688155095564,
                        "Call_Sim": 67.09349141700432,
                        "Call_Chg": 128.23336312290996,
                        "Put_Now": 102.55639177369721,
                        "Put_Sim": 52.253001639745435,
                        "Put_Chg": -49.04949293160796
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 16.917694286457845,
                        "Call_Sim": 43.773436337326075,
                        "Call_Chg": 158.74351194752066,
                        "Put_Now": 139.93850834305613,
                        "Put_Sim": 78.7942503939239,
                        "Put_Chg": -43.693661361058986
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.04338133664789989,
                        "Call_Sim": 0.32057484288406357,
                        "Call_Chg": 638.9694916179645,
                        "Put_Now": 472.0933222302474,
                        "Put_Sim": 384.37051573648387,
                        "Put_Chg": -18.581666455129337
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5000.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 277.31709513708756,
                        "Call_Sim": 62.70419758598564,
                        "Call_Chg": -77.38898946890066,
                        "Put_Now": 1.4474785228261453,
                        "Put_Sim": 48.83458097172479,
                        "Put_Chg": 3273.7689507390533
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 72.5765013576929,
                        "Call_Sim": 2.930465775171882,
                        "Call_Chg": -95.96223885093455,
                        "Put_Now": 46.013403912718786,
                        "Put_Sim": 238.36736833019768,
                        "Put_Chg": 418.03898008143096
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 47.69848766639234,
                        "Call_Sim": 1.2429667459424252,
                        "Call_Chg": -97.39411707424385,
                        "Put_Now": 70.99669405527538,
                        "Put_Sim": 286.54117313482584,
                        "Put_Chg": 303.5979096600407
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 29.39688155095564,
                        "Call_Sim": 0.4840249662404901,
                        "Call_Chg": -98.35348193174335,
                        "Put_Now": 102.55639177369721,
                        "Put_Sim": 335.64353518898133,
                        "Put_Chg": 227.27705156556058
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 16.917694286457845,
                        "Call_Sim": 0.17300902705255083,
                        "Call_Chg": -98.9773486615665,
                        "Put_Now": 139.93850834305613,
                        "Put_Sim": 385.1938230836513,
                        "Put_Chg": 175.25934615463902
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.04338133664789989,
                        "Call_Sim": 1.2412421153231486e-05,
                        "Call_Chg": -99.97138764705666,
                        "Put_Now": 472.0933222302474,
                        "Put_Sim": 734.049953306021,
                        "Put_Chg": 55.48831528441177
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5314.62,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 277.31709513708756,
                        "Call_Sim": 329.03017920738057,
                        "Call_Chg": 18.647636578166743,
                        "Put_Now": 1.4474785228261453,
                        "Put_Sim": 0.5405625931203986,
                        "Put_Chg": -62.65487987587054
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 72.5765013576929,
                        "Call_Sim": 106.52857608544355,
                        "Call_Chg": 46.78108491399719,
                        "Put_Now": 46.013403912718786,
                        "Put_Sim": 27.345478640469764,
                        "Put_Chg": -40.570624393838706
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 47.69848766639234,
                        "Call_Sim": 74.72312810514813,
                        "Call_Chg": 56.657227012664734,
                        "Put_Now": 70.99669405527538,
                        "Put_Sim": 45.401334494030834,
                        "Put_Chg": -36.051480849681475
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 29.39688155095564,
                        "Call_Sim": 49.47828657697437,
                        "Call_Chg": 68.31134449145651,
                        "Put_Now": 102.55639177369721,
                        "Put_Sim": 70.01779679971514,
                        "Put_Chg": -31.72751538078906
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 16.917694286457845,
                        "Call_Sim": 30.770320474350683,
                        "Call_Chg": 81.88247141326752,
                        "Put_Now": 139.93850834305613,
                        "Put_Sim": 101.17113453094908,
                        "Put_Chg": -27.70314924114362
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.04338133664789989,
                        "Call_Sim": 0.14944379722717116,
                        "Call_Chg": 244.4886874743307,
                        "Put_Now": 472.0933222302474,
                        "Put_Sim": 419.5793846908273,
                        "Put_Chg": -11.123634897298597
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5209.38,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 277.31709513708756,
                        "Call_Sim": 226.77220008564927,
                        "Call_Chg": -18.226389911682933,
                        "Put_Now": 1.4474785228261453,
                        "Put_Sim": 3.5225834713884865,
                        "Put_Chg": 143.35998191605495
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 72.5765013576929,
                        "Call_Sim": 45.942580328397526,
                        "Call_Chg": -36.69771969033095,
                        "Put_Now": 46.013403912718786,
                        "Put_Sim": 71.9994828834233,
                        "Put_Chg": 56.475019800744576
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 47.69848766639234,
                        "Call_Sim": 28.05215839227276,
                        "Call_Chg": -41.18857899966941,
                        "Put_Now": 70.99669405527538,
                        "Put_Sim": 103.9703647811557,
                        "Put_Chg": 46.443952306016165
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 29.39688155095564,
                        "Call_Sim": 15.967615596372525,
                        "Call_Chg": -45.68262089740792,
                        "Put_Now": 102.55639177369721,
                        "Put_Sim": 141.74712581911353,
                        "Put_Chg": 38.21383861855758
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 16.917694286457845,
                        "Call_Sim": 8.44485996676292,
                        "Call_Chg": -50.08267779420272,
                        "Put_Now": 139.93850834305613,
                        "Put_Sim": 184.08567402336212,
                        "Put_Chg": 31.547546278026772
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.04338133664789989,
                        "Call_Sim": 0.011092167900713212,
                        "Call_Chg": -74.4310139847888,
                        "Put_Now": 472.0933222302474,
                        "Put_Sim": 524.6810330615008,
                        "Put_Chg": 11.139261742322534
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.00011853199800305157,
            -0.19854332574121322,
            -0.0005361045680429936,
            0.030915602038873714,
            0.12821332321418297,
            0.24065696747759058,
            0.3508912352717359,
            0.2890316148705249,
            0.03588238416586957,
            0.003262225879662907,
            0.006781058315258749,
            0.45956520571684234,
            0.028709365677792517
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
            5400.0,
            5600.0,
            5750.0,
            5900.0,
            6000.0,
            6200.0
        ],
        "delta_values": [
            -0.32675919936550335,
            -1376.1197640662695,
            -189.9570782364021,
            -666.1231890947918,
            631.0037174830646,
            536.0595646099156,
            -1212.082394352781,
            403.3191789255442,
            211.666146529888,
            0.428499345627102,
            11.216358222084516,
            -5365.817999773268,
            70.53764233717402
        ],
        "delta_cumulative": [
            -0.32675919936550335,
            -1376.446523265635,
            -1566.4036015020372,
            -2232.526790596829,
            -1601.5230731137644,
            -1065.463508503849,
            -2277.54590285663,
            -1874.2267239310859,
            -1662.5605774011979,
            -1662.1320780555707,
            -1650.9157198334863,
            -7016.733719606754,
            -6946.19607726958
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
            5400.0,
            5600.0,
            5750.0,
            5900.0,
            6000.0,
            6200.0
        ],
        "gamma_values": [
            4057.0024168355017,
            17761119.327207968,
            1868701.3546383015,
            5545346.9195624925,
            7013343.09271441,
            8487445.992442716,
            11045381.152745962,
            6662786.923823948,
            958812.9425247217,
            25746.77115400775,
            126779.99531289766,
            14888450.50227089,
            517150.553726277
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            6911593.253720689,
            8394787.876958018,
            0.0,
            6662786.923823948,
            958812.9425247217,
            25746.77115400775,
            126779.99531289766,
            6330330.548798744,
            517150.553726277
        ],
        "gamma_put": [
            4057.0024168355017,
            17761119.327207968,
            1868701.3546383015,
            5545346.9195624925,
            101749.8389937212,
            92658.11548469911,
            11045381.152745962,
            0.0,
            0.0,
            0.0,
            0.0,
            8558119.953472147,
            0.0
        ],
        "gamma_exposure": [
            4057.0024168355017,
            17765176.329624802,
            19633877.684263103,
            25179224.603825595,
            32192567.696540006,
            40680013.688982725,
            51725394.84172869,
            58388181.76555263,
            59346994.708077356,
            59372741.479231365,
            59499521.474544264,
            74387971.97681515,
            74905122.53054142
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
            5400.0,
            5600.0,
            5750.0,
            5900.0,
            6000.0,
            6200.0
        ],
        "call_oi": [
            0.0,
            0.0,
            0.0,
            0.0,
            1100.0,
            1235.0,
            0.0,
            1445.0,
            500.0,
            400.0,
            100.0,
            5200.0,
            500.0
        ],
        "put_oi": [
            15.0,
            10915.0,
            830.0,
            2040.0,
            65.0,
            60.0,
            1830.0,
            0.0,
            0.0,
            0.0,
            0.0,
            7030.0,
            0.0
        ],
        "total_oi": [
            15.0,
            10915.0,
            830.0,
            2040.0,
            1165.0,
            1295.0,
            1830.0,
            1445.0,
            500.0,
            400.0,
            100.0,
            12230.0,
            500.0
        ]
    },
    "oi_data_nearest": {
        "strikes": [
            5000.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0,
            5750.0
        ],
        "call_oi": [
            0.0,
            950.0,
            1135.0,
            0.0,
            695.0,
            400.0
        ],
        "put_oi": [
            2015.0,
            0.0,
            0.0,
            1700.0,
            0.0,
            0.0
        ],
        "total_oi": [
            2015.0,
            950.0,
            1135.0,
            1700.0,
            695.0,
            400.0
        ]
    },
    "gex_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 14,
            "abs_call": 18308607.0097045,
            "abs_put": 13006850.094240677,
            "net": 31315457.103945177
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 36,
            "abs_call": 3094615.477100332,
            "abs_put": 0.0,
            "net": 3094615.477100332
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 57,
            "abs_call": 353018.64443613245,
            "abs_put": 0.0,
            "net": 353018.64443613245
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 79,
            "abs_call": 0.0,
            "abs_put": 22941226.619962744,
            "net": 22941226.619962744
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 102,
            "abs_call": 126779.99531289766,
            "abs_put": 0.0,
            "net": 126779.99531289766
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 123,
            "abs_call": 45205.880776731305,
            "abs_put": 0.0,
            "net": 45205.880776731305
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 145,
            "abs_call": 6330330.548798744,
            "abs_put": 8558119.953472147,
            "net": 14888450.50227089
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 167,
            "abs_call": 0.0,
            "abs_put": 31281.376773502372,
            "net": 31281.376773502372
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 188,
            "abs_call": 958812.9425247217,
            "abs_put": 0.0,
            "net": 958812.9425247217
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 211,
            "abs_call": 517150.553726277,
            "abs_put": 0.0,
            "net": 517150.553726277
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 232,
            "abs_call": 0.0,
            "abs_put": 101749.8389937212,
            "net": 101749.8389937212
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 252,
            "abs_call": 193467.81363896662,
            "abs_put": 337905.7810793369,
            "net": 531373.5947183034
        }
    ],
    "oi_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 14,
            "call_oi": 3180.0,
            "put_oi": 3715.0,
            "total_oi": 6895.0
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 36,
            "call_oi": 750.0,
            "put_oi": 0.0,
            "total_oi": 750.0
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
            "put_oi": 11725.0,
            "total_oi": 11725.0
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 102,
            "call_oi": 100.0,
            "put_oi": 0.0,
            "total_oi": 100.0
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
            5400.0,
            5600.0,
            5750.0,
            5900.0,
            6000.0,
            6200.0
        ],
        "call_volume": [
            0.0,
            0.0,
            0.0,
            0.0,
            155.0,
            175.0,
            0.0,
            55.0,
            500.0,
            25.0,
            200.0,
            30.0,
            500.0
        ],
        "put_volume": [
            15.0,
            4025.0,
            830.0,
            2015.0,
            20.0,
            60.0,
            1630.0,
            0.0,
            0.0,
            0.0,
            0.0,
            30.0,
            0.0
        ],
        "total_volume": [
            15.0,
            4025.0,
            830.0,
            2015.0,
            175.0,
            235.0,
            1630.0,
            55.0,
            500.0,
            25.0,
            200.0,
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
            5400.0,
            5600.0,
            5750.0,
            5900.0,
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
            -1.6263032587282567e-19,
            -5.421010862427522e-20,
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
                "volume": 2000,
                "expiry": "2026-07-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5000.0,
                "type": "PUT",
                "oi": 2015,
                "volume": 25,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5350.0,
                "type": "PUT",
                "oi": 1700,
                "volume": 1500,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5300.0,
                "type": "CALL",
                "oi": 1135,
                "volume": 75,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5250.0,
                "type": "CALL",
                "oi": 950,
                "volume": 5,
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
            },
            {
                "strike": 5400.0,
                "type": "CALL",
                "oi": 750,
                "volume": 50,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5400.0,
                "type": "CALL",
                "oi": 695,
                "volume": 5,
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
                "strike": 6200.0,
                "type": "CALL",
                "oi": 500,
                "volume": 500,
                "expiry": "2027-01-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5750.0,
                "type": "CALL",
                "oi": 400,
                "volume": 25,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5250.0,
                "type": "CALL",
                "oi": 130,
                "volume": 130,
                "expiry": "2027-03-01 00:00:00",
                "iv": 0.0
            }
        ],
        "top_vol": [
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
                "strike": 5350.0,
                "type": "PUT",
                "oi": 1700,
                "volume": 1500,
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
                "strike": 5900.0,
                "type": "CALL",
                "oi": 100,
                "volume": 200,
                "expiry": "2026-08-03 00:00:00",
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
                "strike": 5300.0,
                "type": "CALL",
                "oi": 1135,
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
                "strike": 5400.0,
                "type": "CALL",
                "oi": 750,
                "volume": 50,
                "expiry": "2026-05-01 00:00:00",
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
            }
        ]
    },
    "fed_watch": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 19,
            "iv_atm": 0.0,
            "spot": 5262.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 49,
            "iv_atm": 0.0,
            "spot": 5262.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 80,
            "iv_atm": 0.0,
            "spot": 5262.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 110,
            "iv_atm": 0.0,
            "spot": 5262.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 143,
            "iv_atm": 0.0,
            "spot": 5262.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 172,
            "iv_atm": 0.0,
            "spot": 5262.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 201,
            "iv_atm": 0.0,
            "spot": 5262.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 234,
            "iv_atm": 0.0,
            "spot": 5262.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 263,
            "iv_atm": 0.0,
            "spot": 5262.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 294,
            "iv_atm": 0.0,
            "spot": 5262.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 325,
            "iv_atm": 0.0,
            "spot": 5262.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 353,
            "iv_atm": 0.0,
            "spot": 5262.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5262.0,
                    "lower": 5262.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5262.0,
                    "lower": 5262.0,
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
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0,
            5600.0,
            5750.0,
            5900.0,
            6000.0,
            6200.0
        ],
        "charm": [
            -0.7264840684004736,
            -3518.86233642196,
            -77.30410402127023,
            106.87321475394816,
            123.88786817915589,
            1540.6046135554882,
            3876.7056325301087,
            2605.8633071270833,
            134.6515299532584,
            42.72449776368713,
            43.06948402049936,
            4244.470112718715,
            130.78617217378303
        ],
        "vanna": [
            -12.60022319339979,
            -18978.77149761851,
            -1439.2953402050155,
            -2399.3959691514633,
            -771.3521193318218,
            586.2647146407301,
            2523.159083715856,
            2460.7822235153826,
            492.089376231819,
            38.92644088359234,
            207.51589330943344,
            26780.95973420803,
            1118.410685879209
        ],
        "vex": [
            3344.4099955017195,
            6230455.154236859,
            761443.2044354648,
            2174313.4220528416,
            845783.4762473409,
            770335.886977594,
            1006435.2644889011,
            796517.2041879768,
            889794.0804058883,
            1779.297562202706,
            63833.503058337985,
            10656516.919996906,
            538638.2922151749
        ],
        "theta": [
            -0.8298165898369438,
            -3695.454995777994,
            -338.7281933676266,
            -890.9467592782116,
            -2678.198123532783,
            -3020.6743733802114,
            -1917.9251684063922,
            -2354.604494029184,
            -485.14193563434964,
            -7.955108324495123,
            -48.282514616030554,
            2126.6211334368086,
            -220.6350000067131
        ],
        "charm_cum": [
            -0.7264840684004736,
            -3519.588820490361,
            -3596.892924511631,
            -3490.019709757683,
            -3366.131841578527,
            -1825.527228023039,
            2051.17840450707,
            4657.041711634153,
            4791.693241587412,
            4834.417739351099,
            4877.487223371599,
            9121.957336090314,
            9252.743508264097
        ],
        "vanna_cum": [
            -12.60022319339979,
            -18991.37172081191,
            -20430.667061016924,
            -22830.06303016839,
            -23601.41514950021,
            -23015.150434859483,
            -20491.991351143628,
            -18031.209127628244,
            -17539.119751396425,
            -17500.193310512834,
            -17292.677417203402,
            9488.282317004629,
            10606.693002883838
        ],
        "theta_cum": [
            -0.8298165898369438,
            -3696.284812367831,
            -4035.0130057354577,
            -4925.959765013669,
            -7604.157888546452,
            -10624.832261926664,
            -12542.757430333057,
            -14897.361924362242,
            -15382.503859996592,
            -15390.458968321087,
            -15438.741482937117,
            -13312.120349500308,
            -13532.75534950702
        ],
        "r_gamma": [
            4057.0024168355017,
            17761119.327207968,
            1868701.3546383015,
            5545346.9195624925,
            7013343.09271441,
            -8487445.992442716,
            -11045381.152745962,
            -6662786.923823948,
            -958812.9425247217,
            -25746.77115400775,
            -126779.99531289766,
            -14888450.50227089,
            -517150.553726277
        ],
        "r_gamma_cum": [
            4057.0024168355017,
            17765176.329624802,
            19633877.684263103,
            25179224.603825595,
            32192567.696540006,
            23705121.70409729,
            12659740.551351327,
            5996953.627527379,
            5038140.685002658,
            5012393.91384865,
            4885613.918535752,
            -10002836.583735138,
            -10519987.137461415
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.32675919936550335,
            "gamma": 4057.0024168355017,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -1376.1197640662695,
            "gamma": 17761119.327207968,
            "volume": 4025,
            "oi": 10915,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -189.9570782364021,
            "gamma": 1868701.3546383015,
            "volume": 830,
            "oi": 830,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -666.1231890947918,
            "gamma": 5545346.9195624925,
            "volume": 2015,
            "oi": 2040,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": 631.0037174830646,
            "gamma": 7013343.09271441,
            "volume": 175,
            "oi": 1165,
            "iv": 11.82
        },
        {
            "strike": 5300.0,
            "delta": 536.0595646099156,
            "gamma": 8487445.992442716,
            "volume": 235,
            "oi": 1295,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": -1212.082394352781,
            "gamma": 11045381.152745962,
            "volume": 1630,
            "oi": 1830,
            "iv": 11.82
        },
        {
            "strike": 5400.0,
            "delta": 403.3191789255442,
            "gamma": 6662786.923823948,
            "volume": 55,
            "oi": 1445,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 211.666146529888,
            "gamma": 958812.9425247217,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        },
        {
            "strike": 5750.0,
            "delta": 0.428499345627102,
            "gamma": 25746.77115400775,
            "volume": 25,
            "oi": 400,
            "iv": 11.82
        },
        {
            "strike": 5900.0,
            "delta": 11.216358222084516,
            "gamma": 126779.99531289766,
            "volume": 200,
            "oi": 100,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5365.817999773268,
            "gamma": 14888450.50227089,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 70.53764233717402,
            "gamma": 517150.553726277,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        }
    ]
};