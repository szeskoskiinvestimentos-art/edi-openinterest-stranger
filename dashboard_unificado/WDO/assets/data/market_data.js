window.marketData = {
    "last_updated": "2026-03-12 16:06:17",
    "spot_price": 5255.5,
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
                    "3.00-3.25": 1.0,
                    "3.25-3.50": 20.4,
                    "3.50-3.75": 78.6
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 138,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.2,
                    "3.00-3.25": 4.0,
                    "3.25-3.50": 29.4,
                    "3.50-3.75": 66.4
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 187,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.6,
                    "3.00-3.25": 6.8,
                    "3.25-3.50": 33.4,
                    "3.50-3.75": 59.2
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
                    "2.75-3.00": 1.2,
                    "3.00-3.25": 9.2,
                    "3.25-3.50": 35.8,
                    "3.50-3.75": 53.8
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
                    "2.75-3.00": 2.8,
                    "3.00-3.25": 14.5,
                    "3.25-3.50": 39.4,
                    "3.50-3.75": 43.0
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 12/03/2026 16:06\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(3);\n  spot(5255.50);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5940.76;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (5940.76)\n  // 2 = Spline (5948.34)\n  // 3 = HVL (5390.25)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (5940.76)\n  // 7 = HVL Gaussian (5921.11)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 5940.76;\n  if (ModeloFlip = 2) then GammaVal := 5948.34;\n  if (ModeloFlip = 3) then GammaVal := 5390.25;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 5940.76;\n  if (ModeloFlip = 7) then GammaVal := 5921.11;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirRange) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5216.37 <= LimitUpper) and (5216.37 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5216.37, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5294.63 <= LimitUpper) and (5294.63 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5294.63, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5391.75 <= LimitUpper) and (5391.75 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5391.75, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5750.00 <= LimitUpper) and (5750.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5750.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5869.53 <= LimitUpper) and (5869.53 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5869.53, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5900.00 <= LimitUpper) and (5900.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5900.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirMaxPain) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5553.01 > 0) then\n      HorizontalLineCustom(5553.01, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5150.00 <= LimitUpper) and (5150.00 >= LimitLower) then\n      HorizontalLineCustom(5150.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5275.00 <= LimitUpper) and (5275.00 >= LimitLower) then\n      HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5500.00 <= LimitUpper) and (5500.00 >= LimitLower) then\n      HorizontalLineCustom(5500.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5675.00 <= LimitUpper) and (5675.00 >= LimitLower) then\n      HorizontalLineCustom(5675.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5825.00 <= LimitUpper) and (5825.00 >= LimitLower) then\n      HorizontalLineCustom(5825.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5950.00 <= LimitUpper) and (5950.00 >= LimitLower) then\n      HorizontalLineCustom(5950.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5476.40 <= LimitUpper) and (5476.40 >= LimitLower) then\n      HorizontalLineCustom(5476.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5523.60 <= LimitUpper) and (5523.60 >= LimitLower) then\n      HorizontalLineCustom(5523.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5657.30 <= LimitUpper) and (5657.30 >= LimitLower) then\n      HorizontalLineCustom(5657.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5692.70 <= LimitUpper) and (5692.70 >= LimitLower) then\n      HorizontalLineCustom(5692.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5807.30 <= LimitUpper) and (5807.30 >= LimitLower) then\n      HorizontalLineCustom(5807.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5842.70 <= LimitUpper) and (5842.70 >= LimitLower) then\n      HorizontalLineCustom(5842.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5938.20 <= LimitUpper) and (5938.20 >= LimitLower) then\n      HorizontalLineCustom(5938.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5961.80 <= LimitUpper) and (5961.80 >= LimitLower) then\n      HorizontalLineCustom(5961.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5123.60 <= LimitUpper) and (5123.60 >= LimitLower) then\n      HorizontalLineCustom(5123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5176.40 <= LimitUpper) and (5176.40 >= LimitLower) then\n      HorizontalLineCustom(5176.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5261.80 <= LimitUpper) and (5261.80 >= LimitLower) then\n      HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5447.20 <= LimitUpper) and (5447.20 >= LimitLower) then\n      HorizontalLineCustom(5447.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5552.80 <= LimitUpper) and (5552.80 >= LimitLower) then\n      HorizontalLineCustom(5552.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5635.40 <= LimitUpper) and (5635.40 >= LimitLower) then\n      HorizontalLineCustom(5635.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5714.60 <= LimitUpper) and (5714.60 >= LimitLower) then\n      HorizontalLineCustom(5714.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5785.40 <= LimitUpper) and (5785.40 >= LimitLower) then\n      HorizontalLineCustom(5785.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5864.60 <= LimitUpper) and (5864.60 >= LimitLower) then\n      HorizontalLineCustom(5864.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5923.60 <= LimitUpper) and (5923.60 >= LimitLower) then\n      HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5976.40 <= LimitUpper) and (5976.40 >= LimitLower) then\n      HorizontalLineCustom(5976.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5263.38, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5247.62, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5271.27, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5239.73, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5285.91, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5225.09, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5293.79, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5217.21, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 33265,
        "total_volume": 10240,
        "gamma_exposure": 74824780.45763217,
        "delta_position": -7131.275077206744,
        "last_update": "2026-03-12T16:06:17.686609",
        "spot_price": 5255.5,
        "dealer_pressure": 0.15380490396151134,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 5921.108338896028,
        "call_wall": 5300.0,
        "put_wall": 5000.0,
        "effective_call_wall": 5869.525959367946,
        "effective_put_wall": 5391.7525773195875,
        "max_pain": 6000.0,
        "zero_gamma": 5940.764666162483,
        "range_low": 5216.36807192837,
        "range_high": 5294.63192807163,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5294.63192807163,
                "sigma_1_down": 5216.36807192837,
                "sigma_2_up": 5333.7638561432595,
                "sigma_2_down": 5177.2361438567405
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5343.001651258796,
                "sigma_1_down": 5167.998348741204,
                "sigma_2_up": 5430.5033025175935,
                "sigma_2_down": 5080.4966974824065
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 211,
                "sigma_1_up": 5823.9240887412125,
                "sigma_1_down": 4687.0759112587875,
                "sigma_2_up": 6392.348177482426,
                "sigma_2_down": 4118.651822517574
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
                null,
                5342.963563907355,
                5339.610405297427,
                5343.686559331906,
                5351.129127909228,
                5366.472761286557,
                5379.477053709227,
                5390.252951019699,
                5399.123361842114,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                5996.730990983119,
                5990.651717749793,
                5985.541452273045,
                5981.203092666325,
                5977.487004582881,
                5974.278086618301,
                5971.48670519682
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
                5336.922206661316,
                5310.330161111373,
                5302.167917865467,
                5299.156722209042,
                5297.805141312538,
                5297.058194227018,
                5296.736215696795,
                5296.713317898721,
                5296.895232812946,
                5297.211184789004,
                5297.6091453064555,
                5298.051880689095,
                5298.513473411879,
                5298.976402319741,
                5299.429220849049,
                5299.86478688734,
                5300.227317160892,
                5300.541863368377,
                5300.83328887334,
                5301.102744805979,
                5301.351603188283,
                5301.581326251585,
                5301.793383766725,
                5301.989202395634,
                5302.170136259585,
                5302.337451434266
            ]
        },
        "gamma_flip_cone_nearest_expiry": "2026-04-01",
        "delta_flip_profile": {
            "spots": [
                4467.175,
                4499.351530612245,
                4531.52806122449,
                4563.704591836735,
                4595.88112244898,
                4628.057653061224,
                4660.2341836734695,
                4692.410714285715,
                4724.587244897959,
                4756.763775510204,
                4788.940306122449,
                4821.116836734694,
                4853.293367346939,
                4885.469897959184,
                4917.646428571428,
                4949.822959183673,
                4981.999489795919,
                5014.176020408163,
                5046.352551020408,
                5078.529081632653,
                5110.705612244898,
                5142.882142857143,
                5175.058673469388,
                5207.235204081633,
                5239.411734693877,
                5271.588265306123,
                5303.764795918367,
                5335.941326530612,
                5368.117857142857,
                5400.294387755102,
                5432.470918367347,
                5464.647448979592,
                5496.823979591836,
                5529.000510204081,
                5561.177040816327,
                5593.353571428572,
                5625.530102040816,
                5657.706632653061,
                5689.8831632653055,
                5722.059693877551,
                5754.236224489796,
                5786.412755102041,
                5818.589285714285,
                5850.7658163265305,
                5882.942346938775,
                5915.11887755102,
                5947.295408163265,
                5979.47193877551,
                6011.648469387755,
                6043.825
            ],
            "deltas": [
                -21905.436171425306,
                -21717.99926949845,
                -21501.963429603744,
                -21255.457858349248,
                -20976.74987777146,
                -20664.129141693,
                -20315.7373736983,
                -19929.392189232178,
                -19502.492243367797,
                -19032.11094709552,
                -18515.36180271774,
                -17950.036107701293,
                -17335.387998549573,
                -16672.82123651194,
                -15966.18362854036,
                -15221.448984384277,
                -14445.761746391012,
                -13646.070374158331,
                -12827.775741668369,
                -11993.872883269021,
                -11144.930272915424,
                -10279.973299603927,
                -9398.02334741988,
                -8499.811830069062,
                -7589.1242323160195,
                -6673.3491854147,
                -5763.059870587183,
                -4870.7456451187845,
                -4009.043594513084,
                -3188.9268385851437,
                -2418.272241061953,
                -1701.0852384416362,
                -1037.4634625925778,
                -424.1977167692191,
                144.21415998743035,
                674.4085714666385,
                1173.092246089659,
                1646.2375000310428,
                2098.609209685846,
                2533.613283867666,
                2953.3985730449735,
                3359.116414875036,
                3751.241395044104,
                4129.875558747713,
                4494.9867349654105,
                4846.561084060717,
                5184.674007900746,
                5509.498745758188,
                5821.2778437968445,
                6120.281008340594
            ],
            "flip_value": 5553.013398353343
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                0.0,
                155.0,
                150.0,
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
                4467.175,
                4499.351530612245,
                4531.52806122449,
                4563.704591836735,
                4595.88112244898,
                4628.057653061224,
                4660.2341836734695,
                4692.410714285715,
                4724.587244897959,
                4756.763775510204,
                4788.940306122449,
                4821.116836734694,
                4853.293367346939,
                4885.469897959184,
                4917.646428571428,
                4949.822959183673,
                4981.999489795919,
                5014.176020408163,
                5046.352551020408,
                5078.529081632653,
                5110.705612244898,
                5142.882142857143,
                5175.058673469388,
                5207.235204081633,
                5239.411734693877,
                5271.588265306123,
                5303.764795918367,
                5335.941326530612,
                5368.117857142857,
                5400.294387755102,
                5432.470918367347,
                5464.647448979592,
                5496.823979591836,
                5529.000510204081,
                5561.177040816327,
                5593.353571428572,
                5625.530102040816,
                5657.706632653061,
                5689.8831632653055,
                5722.059693877551,
                5754.236224489796,
                5786.412755102041,
                5818.589285714285,
                5850.7658163265305,
                5882.942346938775,
                5915.11887755102,
                5947.295408163265,
                5979.47193877551,
                6011.648469387755,
                6043.825
            ],
            "pnl": [
                -13591984.794568,
                -12841322.845876476,
                -12104084.862038022,
                -11380886.275339646,
                -10672317.448911598,
                -9978940.240860289,
                -9301284.938301612,
                -8639847.58849303,
                -7995087.744455559,
                -7367426.632871976,
                -6757245.742931606,
                -6164885.826406553,
                -5590646.291795226,
                -5034784.969005963,
                -4497518.2158802,
                -3979021.333924543,
                -3479429.2579391524,
                -2998837.48275703,
                -2537303.189971514,
                -2094846.5382191874,
                -1671452.0821699332,
                -1267070.2877096208,
                -881619.1137216734,
                -514985.63422387,
                -167027.67823478766,
                162424.53151718248,
                473566.75620742235,
                766619.146432722,
                1041824.6838673651,
                1299447.6642655144,
                1539772.2243690044,
                1763100.9130506348,
                1969753.3052309416,
                2160064.6557564232,
                2334384.5895030787,
                2493075.823445349,
                2636512.9162695203,
                2765081.041265717,
                2879174.778654255,
                2979196.924134272,
                3065557.3112323815,
                3138671.645921657,
                3198960.352927153,
                3246847.4340857537,
                3282759.3400467476,
                3307123.8574483152,
                3320369.0144574214,
                3322922.008194059,
                3315208.1580607677,
                3297649.8893560898
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
                        "Call_Now": 946.9518682308626,
                        "Call_Sim": 990.216077783336,
                        "Call_Chg": 4.568786545962628,
                        "Put_Now": 6.948091020450107,
                        "Put_Sim": 5.712300572923226,
                        "Put_Chg": -17.786042869755395
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 520.3911276959357,
                        "Call_Sim": 557.1738610391667,
                        "Call_Chg": 7.068286022878385,
                        "Put_Now": 59.8869307954775,
                        "Put_Sim": 52.16966413870887,
                        "Put_Chg": -12.886395335777362
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 447.66705630113574,
                        "Call_Sim": 482.1848396543819,
                        "Call_Chg": 7.71059269771837,
                        "Put_Now": 83.06277546266847,
                        "Put_Sim": 73.08055881591508,
                        "Put_Chg": -12.017677703581876
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 380.68633727879023,
                        "Call_Sim": 412.6566693941795,
                        "Call_Chg": 8.398077100407274,
                        "Put_Now": 111.98197250231397,
                        "Put_Sim": 99.45230461770416,
                        "Put_Chg": -11.189004448328411
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 349.4940657632678,
                        "Call_Sim": 380.10303578825915,
                        "Call_Chg": 8.758080042974038,
                        "Put_Now": 128.7396590177866,
                        "Put_Sim": 114.84862904277838,
                        "Put_Chg": -10.790016130995845
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 319.88916932628536,
                        "Call_Sim": 349.090278420897,
                        "Call_Chg": 9.128508213051331,
                        "Put_Now": 147.08472061180032,
                        "Put_Sim": 131.78582970641196,
                        "Put_Chg": -10.401414124969934
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 291.89839427004426,
                        "Call_Sim": 319.6550870998781,
                        "Call_Chg": 9.509025528984319,
                        "Put_Now": 167.04390358655564,
                        "Put_Sim": 150.30059641638877,
                        "Put_Chg": -10.023297355171746
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 265.5363158312457,
                        "Call_Sim": 291.8225027710132,
                        "Call_Chg": 9.899281330871883,
                        "Put_Now": 188.63178317875054,
                        "Put_Sim": 170.4179701185185,
                        "Put_Chg": -9.655749817607532
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5000.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 946.9518682308626,
                        "Call_Sim": 704.5371664418872,
                        "Call_Chg": -25.599474474015803,
                        "Put_Now": 6.948091020450107,
                        "Put_Sim": 20.03338923147504,
                        "Put_Chg": 188.3294011622958
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 520.3911276959357,
                        "Call_Sim": 329.33045134046915,
                        "Call_Chg": -36.71482202269659,
                        "Put_Now": 59.8869307954775,
                        "Put_Sim": 124.3262544400111,
                        "Put_Chg": 107.6016466173616
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 447.66705630113574,
                        "Call_Sim": 272.2556955380228,
                        "Call_Chg": -39.18344186692121,
                        "Put_Now": 83.06277546266847,
                        "Put_Sim": 163.15141469955574,
                        "Put_Chg": 96.41941145210362
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 380.68633727879023,
                        "Call_Sim": 222.02052117116364,
                        "Call_Chg": -41.67888378705589,
                        "Put_Now": 111.98197250231397,
                        "Put_Sim": 208.8161563946869,
                        "Put_Chg": 86.47301143974045
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 349.4940657632678,
                        "Call_Sim": 199.45818831585257,
                        "Call_Chg": -42.92944920817142,
                        "Put_Now": 128.7396590177866,
                        "Put_Sim": 234.20378157037203,
                        "Put_Chg": 81.92046130712103
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 319.88916932628536,
                        "Call_Sim": 178.56757048163126,
                        "Call_Chg": -44.17830061026754,
                        "Put_Now": 147.08472061180032,
                        "Put_Sim": 261.263121767146,
                        "Put_Chg": 77.6276425453436
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 291.89839427004426,
                        "Call_Sim": 159.30964054792707,
                        "Call_Chg": -45.42291301522379,
                        "Put_Now": 167.04390358655564,
                        "Put_Sim": 289.9551498644373,
                        "Put_Chg": 73.5802047479056
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 265.5363158312457,
                        "Call_Sim": 141.6346166212777,
                        "Call_Chg": -46.66092425892898,
                        "Put_Now": 188.63178317875054,
                        "Put_Sim": 320.23008396878276,
                        "Put_Chg": 69.76464865696971
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 946.9518682308626,
                        "Call_Sim": 296.39740620642215,
                        "Call_Chg": -68.69984461193737,
                        "Put_Now": 6.948091020450107,
                        "Put_Sim": 111.89362899600997,
                        "Put_Chg": 1510.4226134441362
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 520.3911276959357,
                        "Call_Sim": 86.47203470416389,
                        "Call_Chg": -83.38326114685617,
                        "Put_Now": 59.8869307954775,
                        "Put_Sim": 381.46783780370606,
                        "Put_Chg": 536.9801102455455
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 447.66705630113574,
                        "Call_Sim": 64.21417459266831,
                        "Call_Chg": -85.65581860697097,
                        "Put_Now": 83.06277546266847,
                        "Put_Sim": 455.10989375420104,
                        "Put_Chg": 447.91077136441766
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 380.68633727879023,
                        "Call_Sim": 46.89419074090222,
                        "Call_Chg": -87.68167224594669,
                        "Put_Now": 111.98197250231397,
                        "Put_Sim": 533.6898259644267,
                        "Put_Chg": 376.58548428712373
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 349.4940657632678,
                        "Call_Sim": 39.827283207601454,
                        "Call_Chg": -88.60430344629121,
                        "Put_Now": 128.7396590177866,
                        "Put_Sim": 574.5728764621203,
                        "Put_Chg": 346.3060418567193
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 319.88916932628536,
                        "Call_Sim": 33.688391178849315,
                        "Call_Chg": -89.4687302949956,
                        "Put_Now": 147.08472061180032,
                        "Put_Sim": 616.3839424643638,
                        "Put_Chg": 319.06728306006823
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 291.89839427004426,
                        "Call_Sim": 28.381759094771837,
                        "Call_Chg": -90.2768361690558,
                        "Put_Now": 167.04390358655564,
                        "Put_Sim": 659.0272684112829,
                        "Put_Chg": 294.52338831976624
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 265.5363158312457,
                        "Call_Sim": 23.81664203637888,
                        "Call_Chg": -91.03074019769299,
                        "Put_Now": 188.63178317875054,
                        "Put_Sim": 702.412109383884,
                        "Put_Chg": 272.372087856619
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5308.055,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 946.9518682308626,
                        "Call_Sim": 998.0702057387571,
                        "Call_Chg": 5.398198073508848,
                        "Put_Now": 6.948091020450107,
                        "Put_Sim": 5.511428528344453,
                        "Put_Chg": -20.677082206856078
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 520.3911276959357,
                        "Call_Sim": 563.9252042674675,
                        "Call_Chg": 8.3656454260244,
                        "Put_Now": 59.8869307954775,
                        "Put_Sim": 50.86600736700893,
                        "Put_Chg": -15.063258892455714
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 447.66705630113574,
                        "Call_Sim": 488.54223854210113,
                        "Call_Chg": 9.130710349494548,
                        "Put_Now": 83.06277546266847,
                        "Put_Sim": 71.38295770363379,
                        "Put_Chg": -14.061434492137847
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 380.68633727879023,
                        "Call_Sim": 418.5672637802427,
                        "Call_Chg": 9.950692418391387,
                        "Put_Now": 111.98197250231397,
                        "Put_Sim": 97.30789900376612,
                        "Put_Chg": -13.103960548868363
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 349.4940657632678,
                        "Call_Sim": 385.77338944877465,
                        "Call_Chg": 10.380526377830082,
                        "Put_Now": 128.7396590177866,
                        "Put_Sim": 112.46398270329337,
                        "Put_Chg": -12.64231740138802
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 319.88916932628536,
                        "Call_Sim": 354.5111739172685,
                        "Call_Chg": 10.823124979160784,
                        "Put_Now": 147.08472061180032,
                        "Put_Sim": 129.15172520278315,
                        "Put_Chg": -12.192289813941718
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 291.89839427004426,
                        "Call_Sim": 324.819015752415,
                        "Call_Chg": 11.278109824720325,
                        "Put_Now": 167.04390358655564,
                        "Put_Sim": 147.40952506892495,
                        "Put_Chg": -11.754022802428658
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 265.5363158312457,
                        "Call_Sim": 296.7237796324939,
                        "Call_Chg": 11.745084171864669,
                        "Put_Now": 188.63178317875054,
                        "Put_Sim": 167.26424697999892,
                        "Put_Chg": -11.32764364449834
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5202.945,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 946.9518682308626,
                        "Call_Sim": 896.1678484205513,
                        "Call_Chg": -5.3628934599588725,
                        "Put_Now": 6.948091020450107,
                        "Put_Sim": 8.71907121013939,
                        "Put_Chg": 25.488730422166462
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 520.3911276959357,
                        "Call_Sim": 478.1478519610323,
                        "Call_Chg": -8.117601067093153,
                        "Put_Now": 59.8869307954775,
                        "Put_Sim": 70.19865506057431,
                        "Put_Chg": 17.218655436380335
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 447.66705630113574,
                        "Call_Sim": 408.2887549622942,
                        "Call_Chg": -8.796336648983306,
                        "Put_Now": 83.06277546266847,
                        "Put_Sim": 96.239474123827,
                        "Put_Chg": 15.863542468648461
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 380.68633727879023,
                        "Call_Sim": 344.48092895294076,
                        "Call_Chg": -9.510561525441602,
                        "Put_Now": 111.98197250231397,
                        "Put_Sim": 128.33156417646524,
                        "Put_Chg": 14.600199754307264
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 349.4940657632678,
                        "Call_Sim": 314.9651379978409,
                        "Call_Chg": -9.879689284571528,
                        "Put_Now": 128.7396590177866,
                        "Put_Sim": 146.76573125235996,
                        "Put_Chg": 14.001957417086894
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 319.88916932628536,
                        "Call_Sim": 287.0809952939476,
                        "Call_Chg": -10.256106545099563,
                        "Put_Now": 147.08472061180032,
                        "Put_Sim": 166.83154657946284,
                        "Put_Chg": 13.425477429283886
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 291.89839427004426,
                        "Call_Sim": 260.8425541445031,
                        "Call_Chg": -10.63926377642573,
                        "Put_Now": 167.04390358655564,
                        "Put_Sim": 188.54306346101384,
                        "Put_Chg": 12.870364863880335
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 265.5363158312457,
                        "Call_Sim": 236.25134961323738,
                        "Call_Chg": -11.028610578682418,
                        "Put_Now": 188.63178317875054,
                        "Put_Sim": 211.90181696074296,
                        "Put_Chg": 12.336221070412806
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
                        "Call_Now": 270.99354004881025,
                        "Call_Sim": 314.58720625162823,
                        "Call_Chg": 16.086607154903422,
                        "Put_Now": 1.623923434549198,
                        "Put_Sim": 0.7175896373675954,
                        "Put_Chg": -55.811362647968764
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 68.87911851003219,
                        "Call_Sim": 96.40335670968034,
                        "Call_Chg": 39.96020680148406,
                        "Put_Now": 48.81602106505807,
                        "Put_Sim": 31.840259264706447,
                        "Put_Chg": -34.77498048791746
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 44.87904468310671,
                        "Call_Sim": 66.4664494411445,
                        "Call_Chg": 48.10130186697954,
                        "Put_Now": 74.6772510719893,
                        "Put_Sim": 51.76465583002755,
                        "Put_Chg": -30.682162121733537
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 27.40010628150071,
                        "Call_Sim": 43.17728277391279,
                        "Call_Chg": 57.58071275462206,
                        "Put_Now": 107.0596165042416,
                        "Put_Sim": 78.33679299665391,
                        "Put_Chg": -26.82881225008845
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 15.610517450002362,
                        "Call_Sim": 26.298690312269173,
                        "Call_Chg": 68.4677679423445,
                        "Put_Now": 145.13133150660087,
                        "Put_Sim": 111.319504368867,
                        "Put_Chg": -23.297400214505743
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0369124846349802,
                        "Call_Sim": 0.10730346097973076,
                        "Call_Chg": 190.6969336820106,
                        "Put_Now": 478.586853378235,
                        "Put_Sim": 434.15724435458014,
                        "Put_Chg": -9.283499684547625
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5350.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 270.99354004881025,
                        "Call_Sim": 364.1337365058671,
                        "Call_Chg": 34.36989547436474,
                        "Put_Now": 1.623923434549198,
                        "Put_Sim": 0.2641198916063132,
                        "Put_Chg": -83.7356930759711
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 68.87911851003219,
                        "Call_Sim": 133.01713205343094,
                        "Call_Chg": 93.1167746202459,
                        "Put_Now": 48.81602106505807,
                        "Put_Sim": 18.454034608457505,
                        "Put_Chg": -62.19676613162828
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 44.87904468310671,
                        "Call_Sim": 97.00031203798972,
                        "Call_Chg": 116.13720328254311,
                        "Put_Now": 74.6772510719893,
                        "Put_Sim": 32.29851842687276,
                        "Put_Chg": -56.749186715862365
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 27.40010628150071,
                        "Call_Sim": 67.09349141700432,
                        "Call_Chg": 144.86580718959746,
                        "Put_Now": 107.0596165042416,
                        "Put_Sim": 52.253001639745435,
                        "Put_Chg": -51.192612727437506
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 15.610517450002362,
                        "Call_Sim": 43.773436337326075,
                        "Call_Chg": 180.40989978406802,
                        "Put_Now": 145.13133150660087,
                        "Put_Sim": 78.7942503939239,
                        "Put_Chg": -45.70831151622131
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0369124846349802,
                        "Call_Sim": 0.32057484288406357,
                        "Call_Chg": 768.4726754488645,
                        "Put_Now": 478.586853378235,
                        "Put_Sim": 384.37051573648387,
                        "Put_Chg": -19.686361415216396
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5000.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 270.99354004881025,
                        "Call_Sim": 62.70419758598564,
                        "Call_Chg": -76.86136814379722,
                        "Put_Now": 1.623923434549198,
                        "Put_Sim": 48.83458097172479,
                        "Put_Chg": 2907.197256518519
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 68.87911851003219,
                        "Call_Sim": 2.930465775171882,
                        "Call_Chg": -95.7454946599744,
                        "Put_Now": 48.81602106505807,
                        "Put_Sim": 238.36736833019768,
                        "Put_Chg": 388.29741369646007
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 44.87904468310671,
                        "Call_Sim": 1.2429667459424252,
                        "Call_Chg": -97.23040729873134,
                        "Put_Now": 74.6772510719893,
                        "Put_Sim": 286.54117313482584,
                        "Put_Chg": 283.7061073105094
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 27.40010628150071,
                        "Call_Sim": 0.4840249662404901,
                        "Call_Chg": -98.23349237675299,
                        "Put_Now": 107.0596165042416,
                        "Put_Sim": 335.64353518898133,
                        "Put_Chg": 213.5108700633945
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 15.610517450002362,
                        "Call_Sim": 0.17300902705255083,
                        "Call_Chg": -98.89171497609436,
                        "Put_Now": 145.13133150660087,
                        "Put_Sim": 385.1938230836513,
                        "Put_Chg": 165.4105209984461
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0369124846349802,
                        "Call_Sim": 1.2412421153231486e-05,
                        "Call_Chg": -99.96637337942438,
                        "Put_Now": 478.586853378235,
                        "Put_Sim": 734.049953306021,
                        "Put_Chg": 53.37862879528147
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5308.055,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 270.99354004881025,
                        "Call_Sim": 322.5390712455428,
                        "Call_Chg": 19.02094462748019,
                        "Put_Now": 1.623923434549198,
                        "Put_Sim": 0.614454631281582,
                        "Put_Chg": -62.162339787149214
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 68.87911851003219,
                        "Call_Sim": 101.91913746741375,
                        "Call_Chg": 47.96812106788113,
                        "Put_Now": 48.81602106505807,
                        "Put_Sim": 29.301040022439565,
                        "Put_Chg": -39.97659091594234
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 44.87904468310671,
                        "Call_Sim": 70.94516973100372,
                        "Call_Chg": 58.08083757564645,
                        "Put_Now": 74.6772510719893,
                        "Put_Sim": 48.188376119886016,
                        "Put_Chg": -35.47114358369707
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 27.40010628150071,
                        "Call_Sim": 46.5785979051434,
                        "Call_Chg": 69.99422347712249,
                        "Put_Now": 107.0596165042416,
                        "Put_Sim": 73.68310812788422,
                        "Put_Chg": -31.175628557416918
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 15.610517450002362,
                        "Call_Sim": 28.69962007561412,
                        "Call_Chg": 83.84797408243362,
                        "Put_Now": 145.13133150660087,
                        "Put_Sim": 105.66543413221189,
                        "Put_Chg": -27.193230410481007
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0369124846349802,
                        "Call_Sim": 0.12893841941801298,
                        "Call_Chg": 249.3084269267103,
                        "Put_Now": 478.586853378235,
                        "Put_Sim": 426.1238793130178,
                        "Put_Chg": -10.962059173772335
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5202.945,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 270.99354004881025,
                        "Call_Sim": 220.7164330686055,
                        "Call_Chg": -18.552880253584284,
                        "Put_Now": 1.623923434549198,
                        "Put_Sim": 3.901816454345237,
                        "Put_Chg": 140.27096175432578
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 68.87911851003219,
                        "Call_Sim": 43.20317743481746,
                        "Call_Chg": -37.276814266249716,
                        "Put_Now": 48.81602106505807,
                        "Put_Sim": 75.69507998984363,
                        "Put_Chg": 55.06196190992978
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 44.87904468310671,
                        "Call_Sim": 26.128638639020664,
                        "Call_Chg": -41.77986892654166,
                        "Put_Now": 74.6772510719893,
                        "Put_Sim": 108.48184502790355,
                        "Put_Chg": 45.26759283536886
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 27.40010628150071,
                        "Call_Sim": 14.721484906357205,
                        "Call_Chg": -46.27216130071557,
                        "Put_Now": 107.0596165042416,
                        "Put_Sim": 146.93599512909896,
                        "Put_Chg": 37.24689096310885
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 15.610517450002362,
                        "Call_Sim": 7.702383518527313,
                        "Call_Chg": -50.65901214872191,
                        "Put_Now": 145.13133150660087,
                        "Put_Sim": 189.7781975751259,
                        "Put_Chg": 30.76307893343787
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.0369124846349802,
                        "Call_Sim": 0.009304272461815977,
                        "Call_Chg": -74.79369770465475,
                        "Put_Now": 478.586853378235,
                        "Put_Sim": 531.1142451660626,
                        "Put_Chg": 10.975519159594285
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.0001227293771046529,
            -0.20862397309435635,
            -0.0005846707250240259,
            0.031223876965426507,
            0.13561739512123352,
            0.24785037324535647,
            0.3549175452005642,
            0.28685215711780426,
            0.035638661992854856,
            0.0028903557232904113,
            0.0066640489442372705,
            0.45078039940589953,
            0.028362661204346832
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
            -0.33691925092860175,
            -1420.638067807002,
            -194.60826032518335,
            -679.888462597485,
            613.5976994028955,
            515.1467342733914,
            -1239.0953562356162,
            387.0516444864197,
            209.29872342046426,
            0.3690142748216885,
            10.906072020978492,
            -5402.344960506687,
            69.26706163718747
        ],
        "delta_cumulative": [
            -0.33691925092860175,
            -1420.9749870579305,
            -1615.583247383114,
            -2295.471709980599,
            -1681.8740105777033,
            -1166.727276304312,
            -2405.8226325399282,
            -2018.7709880535085,
            -1809.4722646330442,
            -1809.1032503582226,
            -1798.1971783372442,
            -7200.542138843932,
            -7131.275077206744
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
            4163.213455142341,
            18257964.119146075,
            1894233.4896053467,
            5591026.949017746,
            7066655.829658246,
            8429250.777477223,
            10806514.00881028,
            6497603.476484579,
            956500.6989271129,
            22446.47178758482,
            124256.24947889063,
            14663365.312722929,
            510799.8610610024
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            6964375.35735422,
            8336188.698664872,
            0.0,
            6497603.476484579,
            956500.6989271129,
            22446.47178758482,
            124256.24947889063,
            6234627.933455375,
            510799.8610610024
        ],
        "gamma_put": [
            4163.213455142341,
            18257964.119146075,
            1894233.4896053467,
            5591026.949017746,
            102280.47230402594,
            93062.07881235097,
            10806514.00881028,
            0.0,
            0.0,
            0.0,
            0.0,
            8428737.379267555,
            0.0
        ],
        "gamma_exposure": [
            4163.213455142341,
            18262127.332601216,
            20156360.822206564,
            25747387.771224312,
            32814043.60088256,
            41243294.37835978,
            52049808.38717006,
            58547411.86365464,
            59503912.562581755,
            59526359.03436934,
            59650615.28384823,
            74313980.59657116,
            74824780.45763217
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
            "abs_call": 18167352.392891068,
            "abs_put": 12960547.58362437,
            "net": 31127899.97651544
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 36,
            "abs_call": 3059619.0317938305,
            "abs_put": 0.0,
            "net": 3059619.0317938305
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 57,
            "abs_call": 353720.2090748077,
            "abs_put": 0.0,
            "net": 353720.2090748077
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 79,
            "abs_call": 0.0,
            "abs_put": 23315512.479965854,
            "net": 23315512.479965854
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 102,
            "abs_call": 124256.24947889063,
            "abs_put": 0.0,
            "net": 124256.24947889063
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 123,
            "abs_call": 45448.076900596396,
            "abs_put": 0.0,
            "net": 45448.076900596396
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 145,
            "abs_call": 6234627.933455375,
            "abs_put": 8428737.379267555,
            "net": 14663365.312722929
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 167,
            "abs_call": 0.0,
            "abs_put": 31566.254970562717,
            "net": 31566.254970562717
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 188,
            "abs_call": 956500.6989271129,
            "abs_put": 0.0,
            "net": 956500.6989271129
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 211,
            "abs_call": 510799.8610610024,
            "abs_put": 0.0,
            "net": 510799.8610610024
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 232,
            "abs_call": 0.0,
            "abs_put": 102280.47230402594,
            "net": 102280.47230402594
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 252,
            "abs_call": 194474.29363095088,
            "abs_put": 339337.5402861563,
            "net": 533811.8339171072
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
            150.0,
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
            210.0,
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
                "volume": 50,
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
                "strike": 5300.0,
                "type": "CALL",
                "oi": 1135,
                "volume": 50,
                "expiry": "2026-04-01 00:00:00",
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
            "spot": 5255.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 49,
            "iv_atm": 0.0,
            "spot": 5255.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 80,
            "iv_atm": 0.0,
            "spot": 5255.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 110,
            "iv_atm": 0.0,
            "spot": 5255.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 143,
            "iv_atm": 0.0,
            "spot": 5255.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 172,
            "iv_atm": 0.0,
            "spot": 5255.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 201,
            "iv_atm": 0.0,
            "spot": 5255.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 234,
            "iv_atm": 0.0,
            "spot": 5255.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 263,
            "iv_atm": 0.0,
            "spot": 5255.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 294,
            "iv_atm": 0.0,
            "spot": 5255.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 325,
            "iv_atm": 0.0,
            "spot": 5255.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 353,
            "iv_atm": 0.0,
            "spot": 5255.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5255.5,
                    "lower": 5255.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5255.5,
                    "lower": 5255.5,
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
            -0.7377384935114351,
            -3602.555282478832,
            -71.01115108861796,
            129.74224218758476,
            275.3816457464307,
            1709.7230203579234,
            4027.6425587102435,
            2632.1706429317273,
            135.91155561393074,
            37.773230772608756,
            42.59152139018947,
            4211.798940052661,
            129.93412382364045
        ],
        "vanna": [
            -12.843143539911479,
            -19106.2392191456,
            -1419.3755747764892,
            -2301.837320709454,
            -627.967084297777,
            758.5491718581509,
            2691.1966346964123,
            2532.6485188141023,
            511.01829417843635,
            34.55537223472464,
            205.93807108426452,
            26677.96214673966,
            1115.1954897368296
        ],
        "vex": [
            3427.7261797421684,
            6354328.1087700855,
            770701.2704040521,
            2189496.646303025,
            850299.9138594317,
            765990.2802727884,
            989561.0012404876,
            780336.1212555956,
            886551.7937050428,
            1549.3056132327633,
            62485.51943964289,
            10482445.871404782,
            531366.532751572
        ],
        "theta": [
            -0.8487005424151982,
            -3787.37092331904,
            -340.64108203898184,
            -887.8955770123232,
            -2673.043120554015,
            -2978.838759507093,
            -1816.1599932815757,
            -2287.0998958218916,
            -481.6525087199034,
            -6.922145983057868,
            -47.17772293528747,
            2235.6824791051927,
            -217.2724891403602
        ],
        "charm_cum": [
            -0.7377384935114351,
            -3603.2930209723436,
            -3674.3041720609617,
            -3544.561929873377,
            -3269.180284126946,
            -1559.4572637690226,
            2468.185294941221,
            5100.355937872948,
            5236.267493486878,
            5274.040724259487,
            5316.632245649677,
            9528.431185702339,
            9658.36530952598
        ],
        "vanna_cum": [
            -12.843143539911479,
            -19119.08236268551,
            -20538.457937461997,
            -22840.295258171453,
            -23468.26234246923,
            -22709.713170611078,
            -20018.516535914667,
            -17485.868017100565,
            -16974.84972292213,
            -16940.294350687403,
            -16734.35627960314,
            9943.60586713652,
            11058.801356873351
        ],
        "theta_cum": [
            -0.8487005424151982,
            -3788.219623861455,
            -4128.860705900437,
            -5016.75628291276,
            -7689.799403466775,
            -10668.638162973868,
            -12484.798156255443,
            -14771.898052077335,
            -15253.550560797237,
            -15260.472706780296,
            -15307.650429715584,
            -13071.967950610391,
            -13289.24043975075
        ],
        "r_gamma": [
            4163.213455142341,
            18257964.119146075,
            1894233.4896053467,
            5591026.949017746,
            7066655.829658246,
            -8429250.777477223,
            -10806514.00881028,
            -6497603.476484579,
            -956500.6989271129,
            -22446.47178758482,
            -124256.24947889063,
            -14663365.31272293,
            -510799.8610610024
        ],
        "r_gamma_cum": [
            4163.213455142341,
            18262127.332601216,
            20156360.822206564,
            25747387.771224312,
            32814043.60088256,
            24384792.823405337,
            13578278.814595057,
            7080675.338110478,
            6124174.639183365,
            6101728.16739578,
            5977471.917916889,
            -8685893.394806042,
            -9196693.255867045
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.33691925092860175,
            "gamma": 4163.213455142341,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -1420.638067807002,
            "gamma": 18257964.119146075,
            "volume": 4025,
            "oi": 10915,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -194.60826032518335,
            "gamma": 1894233.4896053467,
            "volume": 830,
            "oi": 830,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -679.888462597485,
            "gamma": 5591026.949017746,
            "volume": 2015,
            "oi": 2040,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": 613.5976994028955,
            "gamma": 7066655.829658246,
            "volume": 175,
            "oi": 1165,
            "iv": 11.82
        },
        {
            "strike": 5300.0,
            "delta": 515.1467342733914,
            "gamma": 8429250.777477223,
            "volume": 210,
            "oi": 1295,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": -1239.0953562356162,
            "gamma": 10806514.00881028,
            "volume": 1630,
            "oi": 1830,
            "iv": 11.82
        },
        {
            "strike": 5400.0,
            "delta": 387.0516444864197,
            "gamma": 6497603.476484579,
            "volume": 55,
            "oi": 1445,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 209.29872342046426,
            "gamma": 956500.6989271129,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        },
        {
            "strike": 5750.0,
            "delta": 0.3690142748216885,
            "gamma": 22446.47178758482,
            "volume": 25,
            "oi": 400,
            "iv": 11.82
        },
        {
            "strike": 5900.0,
            "delta": 10.906072020978492,
            "gamma": 124256.24947889063,
            "volume": 200,
            "oi": 100,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5402.344960506687,
            "gamma": 14663365.312722929,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 69.26706163718747,
            "gamma": 510799.8610610024,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        }
    ]
};