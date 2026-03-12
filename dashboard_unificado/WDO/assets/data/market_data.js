window.marketData = {
    "last_updated": "2026-03-12 07:09:15",
    "spot_price": 5183.614,
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
                    "3.50-3.75": 98.6
                }
            },
            {
                "date": "2026-04-29",
                "days_remaining": 47,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.1,
                    "3.25-3.50": 9.8,
                    "3.50-3.75": 90.1
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 96,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 2.6,
                    "3.25-3.50": 30.7,
                    "3.50-3.75": 66.6
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 138,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.6,
                    "3.00-3.25": 8.2,
                    "3.25-3.50": 37.9,
                    "3.50-3.75": 53.3
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 187,
                "current_rate": "3.25-3.50",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.1,
                    "2.75-3.00": 2.4,
                    "3.00-3.25": 15.4,
                    "3.25-3.50": 41.6,
                    "3.50-3.75": 40.4
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 229,
                "current_rate": "3.25-3.50",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.5,
                    "2.75-3.00": 4.2,
                    "3.00-3.25": 19.0,
                    "3.25-3.50": 41.5,
                    "3.50-3.75": 34.9
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 271,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.1,
                    "2.50-2.75": 1.4,
                    "2.75-3.00": 8.1,
                    "3.00-3.25": 24.9,
                    "3.25-3.50": 39.7,
                    "3.50-3.75": 25.8
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 12/03/2026 07:09\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(4);\n  spot(5183.61);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5347.81;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (5347.81)\n  // 2 = Spline (5347.49)\n  // 3 = HVL (5299.40)\n  // 4 = HVL Log (5104.74)\n  // 5 = Sigma Kernel (5103.77)\n  // 6 = PVOP (5347.81)\n  // 7 = HVL Gaussian (5365.32)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 5347.81;\n  if (ModeloFlip = 2) then GammaVal := 5347.49;\n  if (ModeloFlip = 3) then GammaVal := 5299.40;\n  if (ModeloFlip = 4) then GammaVal := 5104.74;\n  if (ModeloFlip = 5) then GammaVal := 5103.77;\n  if (ModeloFlip = 6) then GammaVal := 5347.81;\n  if (ModeloFlip = 7) then GammaVal := 5365.32;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirRange) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5145.02 <= LimitUpper) and (5145.02 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5145.02, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5222.21 <= LimitUpper) and (5222.21 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5222.21, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5391.75 <= LimitUpper) and (5391.75 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5391.75, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5750.00 <= LimitUpper) and (5750.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5750.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5869.53 <= LimitUpper) and (5869.53 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5869.53, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5900.00 <= LimitUpper) and (5900.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5900.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirMaxPain) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (6200.00 <= LimitUpper) and (6200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5552.92 > 0) then\n      HorizontalLineCustom(5552.92, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5050.00 <= LimitUpper) and (5050.00 >= LimitLower) then\n      HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5150.00 <= LimitUpper) and (5150.00 >= LimitLower) then\n      HorizontalLineCustom(5150.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5275.00 <= LimitUpper) and (5275.00 >= LimitLower) then\n      HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5500.00 <= LimitUpper) and (5500.00 >= LimitLower) then\n      HorizontalLineCustom(5500.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5675.00 <= LimitUpper) and (5675.00 >= LimitLower) then\n      HorizontalLineCustom(5675.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5825.00 <= LimitUpper) and (5825.00 >= LimitLower) then\n      HorizontalLineCustom(5825.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5950.00 <= LimitUpper) and (5950.00 >= LimitLower) then\n      HorizontalLineCustom(5950.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6100.00 <= LimitUpper) and (6100.00 >= LimitLower) then\n      HorizontalLineCustom(6100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5038.20 <= LimitUpper) and (5038.20 >= LimitLower) then\n      HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5061.80 <= LimitUpper) and (5061.80 >= LimitLower) then\n      HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5476.40 <= LimitUpper) and (5476.40 >= LimitLower) then\n      HorizontalLineCustom(5476.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5523.60 <= LimitUpper) and (5523.60 >= LimitLower) then\n      HorizontalLineCustom(5523.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5657.30 <= LimitUpper) and (5657.30 >= LimitLower) then\n      HorizontalLineCustom(5657.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5692.70 <= LimitUpper) and (5692.70 >= LimitLower) then\n      HorizontalLineCustom(5692.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5807.30 <= LimitUpper) and (5807.30 >= LimitLower) then\n      HorizontalLineCustom(5807.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5842.70 <= LimitUpper) and (5842.70 >= LimitLower) then\n      HorizontalLineCustom(5842.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5938.20 <= LimitUpper) and (5938.20 >= LimitLower) then\n      HorizontalLineCustom(5938.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5961.80 <= LimitUpper) and (5961.80 >= LimitLower) then\n      HorizontalLineCustom(5961.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6076.40 <= LimitUpper) and (6076.40 >= LimitLower) then\n      HorizontalLineCustom(6076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6123.60 <= LimitUpper) and (6123.60 >= LimitLower) then\n      HorizontalLineCustom(6123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5076.40 <= LimitUpper) and (5076.40 >= LimitLower) then\n      HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5123.60 <= LimitUpper) and (5123.60 >= LimitLower) then\n      HorizontalLineCustom(5123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5176.40 <= LimitUpper) and (5176.40 >= LimitLower) then\n      HorizontalLineCustom(5176.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5261.80 <= LimitUpper) and (5261.80 >= LimitLower) then\n      HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5447.20 <= LimitUpper) and (5447.20 >= LimitLower) then\n      HorizontalLineCustom(5447.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5552.80 <= LimitUpper) and (5552.80 >= LimitLower) then\n      HorizontalLineCustom(5552.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5635.40 <= LimitUpper) and (5635.40 >= LimitLower) then\n      HorizontalLineCustom(5635.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5714.60 <= LimitUpper) and (5714.60 >= LimitLower) then\n      HorizontalLineCustom(5714.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5785.40 <= LimitUpper) and (5785.40 >= LimitLower) then\n      HorizontalLineCustom(5785.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5864.60 <= LimitUpper) and (5864.60 >= LimitLower) then\n      HorizontalLineCustom(5864.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5923.60 <= LimitUpper) and (5923.60 >= LimitLower) then\n      HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5976.40 <= LimitUpper) and (5976.40 >= LimitLower) then\n      HorizontalLineCustom(5976.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6047.20 <= LimitUpper) and (6047.20 >= LimitLower) then\n      HorizontalLineCustom(6047.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6152.80 <= LimitUpper) and (6152.80 >= LimitLower) then\n      HorizontalLineCustom(6152.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5191.39, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5175.84, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5199.16, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5168.06, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5213.60, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5153.62, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5221.38, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5145.85, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 33265,
        "total_volume": 10215,
        "gamma_exposure": 72070650.2517485,
        "delta_position": -9160.694029255086,
        "last_update": "2026-03-12T07:09:15.998649",
        "spot_price": 5183.614,
        "dealer_pressure": 0.04736879840648533,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 5365.320990014031,
        "call_wall": 5300.0,
        "put_wall": 5000.0,
        "effective_call_wall": 5869.525959367946,
        "effective_put_wall": 5391.7525773195875,
        "max_pain": 6000.0,
        "zero_gamma": 5347.812624480659,
        "range_low": 5145.017327904273,
        "range_high": 5222.210672095727,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5222.210672095726,
                "sigma_1_down": 5145.017327904273,
                "sigma_2_up": 5260.807344191454,
                "sigma_2_down": 5106.420655808545
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5269.918782511315,
                "sigma_1_down": 5097.309217488684,
                "sigma_2_up": 5356.223565022629,
                "sigma_2_down": 5011.00443497737
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 211,
                "sigma_1_up": 5744.26304658666,
                "sigma_1_down": 4622.96495341334,
                "sigma_2_up": 6304.91209317332,
                "sigma_2_down": 4062.315906826679
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
                5100.008062097412,
                5104.413811777743,
                5118.092348164827,
                5151.42055622996,
                5201.587113861099,
                5229.172447545203,
                5252.207299291237,
                5273.150366230395,
                5288.216678603461,
                5299.399796909018,
                5308.463008769626,
                5315.185588536827,
                5320.293231220683,
                5324.271555913486,
                5327.434529094488,
                5329.993063308491,
                5332.093419548249,
                5333.839785918324,
                5335.30810824269,
                5336.554862165028,
                5337.62278612875,
                5338.544727203583,
                5339.346280846524,
                5340.047640077452,
                5340.664914613687,
                5341.211087408405,
                5341.696718597592,
                5342.130470571147,
                5342.519504461711,
                5342.869782931228
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4406.0719,
                4437.808312244898,
                4469.544724489796,
                4501.281136734694,
                4533.017548979592,
                4564.75396122449,
                4596.490373469387,
                4628.226785714285,
                4659.963197959183,
                4691.699610204081,
                4723.436022448979,
                4755.172434693877,
                4786.908846938775,
                4818.645259183673,
                4850.381671428571,
                4882.118083673469,
                4913.854495918367,
                4945.590908163265,
                4977.327320408163,
                5009.063732653061,
                5040.8001448979585,
                5072.5365571428565,
                5104.2729693877545,
                5136.009381632653,
                5167.745793877551,
                5199.482206122449,
                5231.218618367347,
                5262.955030612245,
                5294.691442857143,
                5326.427855102041,
                5358.164267346938,
                5389.900679591836,
                5421.637091836734,
                5453.373504081632,
                5485.10991632653,
                5516.846328571428,
                5548.582740816326,
                5580.319153061224,
                5612.055565306122,
                5643.79197755102,
                5675.528389795918,
                5707.264802040816,
                5739.001214285714,
                5770.737626530612,
                5802.47403877551,
                5834.210451020407,
                5865.946863265305,
                5897.683275510203,
                5929.419687755101,
                5961.156099999999
            ],
            "deltas": [
                -22190.16140050774,
                -22053.28326753724,
                -21892.56351076638,
                -21705.869341180765,
                -21491.23873444834,
                -21246.885553482934,
                -20971.151012821596,
                -20662.393117718493,
                -20318.826598509866,
                -19938.358350389408,
                -19518.4981031706,
                -19056.442030979928,
                -18549.40588564128,
                -17995.211540239532,
                -17393.018580941603,
                -16743.982412622576,
                -16051.570688312164,
                -15321.326993557357,
                -14560.037869324542,
                -13774.48384939854,
                -12970.145860104918,
                -12150.306274091918,
                -11315.887031990516,
                -10466.132952530315,
                -9599.962794655214,
                -8717.580854759377,
                -7821.850673537703,
                -6919.007023420516,
                -6018.48867724189,
                -5131.935748858852,
                -4271.62419913605,
                -3448.7396649890893,
                -2671.8965330671376,
                -1946.2024404030662,
                -1273.0000253163416,
                -650.2438991445787,
                -73.33900327822971,
                463.79778818251066,
                967.686829539023,
                1444.4246605931125,
                1899.111972300981,
                2335.5899613090405,
                2756.4421402098023,
                3163.1821267966147,
                3556.5372777586113,
                3936.747906252396,
                4303.824277640043,
                4657.730443568983,
                4998.48852692634,
                5326.214972313729
            ],
            "flip_value": 5552.915932805164
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                0.0,
                155.0,
                125.0,
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
                4406.0719,
                4437.808312244898,
                4469.544724489796,
                4501.281136734694,
                4533.017548979592,
                4564.75396122449,
                4596.490373469387,
                4628.226785714285,
                4659.963197959183,
                4691.699610204081,
                4723.436022448979,
                4755.172434693877,
                4786.908846938775,
                4818.645259183673,
                4850.381671428571,
                4882.118083673469,
                4913.854495918367,
                4945.590908163265,
                4977.327320408163,
                5009.063732653061,
                5040.8001448979585,
                5072.5365571428565,
                5104.2729693877545,
                5136.009381632653,
                5167.745793877551,
                5199.482206122449,
                5231.218618367347,
                5262.955030612245,
                5294.691442857143,
                5326.427855102041,
                5358.164267346938,
                5389.900679591836,
                5421.637091836734,
                5453.373504081632,
                5485.10991632653,
                5516.846328571428,
                5548.582740816326,
                5580.319153061224,
                5612.055565306122,
                5643.79197755102,
                5675.528389795918,
                5707.264802040816,
                5739.001214285714,
                5770.737626530612,
                5802.47403877551,
                5834.210451020407,
                5865.946863265305,
                5897.683275510203,
                5929.419687755101,
                5961.156099999999
            ],
            "pnl": [
                -15274559.500195991,
                -14469675.092201892,
                -13676650.43698351,
                -12896111.873112544,
                -12128669.127033576,
                -11374911.543336466,
                -10635404.581952408,
                -9910686.623763934,
                -9201266.117796995,
                -8507619.094464723,
                -7830187.060547021,
                -7169375.282987186,
                -6525551.4604137065,
                -5899044.773768489,
                -5290145.300715496,
                -4699103.772753566,
                -4126131.649254241,
                -3571401.4790387517,
                -3035047.517606047,
                -2517166.5666953763,
                -2017819.0024499772,
                -1537029.9589528153,
                -1074790.6352174701,
                -631059.6957113361,
                -205764.73702534288,
                201196.20375438407,
                589953.1202127235,
                960662.5052120173,
                1313505.8314934205,
                1648688.0555776712,
                1966436.1532106735,
                2266997.691803864,
                2550639.4428474577,
                2817646.0351638356,
                3068318.6481415983,
                3302973.742753895,
                3521941.8272114834,
                3725566.2535093054,
                3914202.04086814,
                4088214.7221098244,
                4247979.209295582,
                4393878.675452251,
                4526303.449866852,
                4645649.925195015,
                4752319.4754605945,
                4846717.384879476,
                4929251.78828093,
                5000332.6246953495,
                5060370.606396519,
                5109776.206311211
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
                        "Call_Now": 877.5851398770046,
                        "Call_Sim": 990.216077783336,
                        "Call_Chg": 12.834189275597446,
                        "Put_Now": 9.46736266659289,
                        "Put_Sim": 5.712300572923226,
                        "Put_Chg": -39.663232791535535
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 462.9584370300058,
                        "Call_Sim": 557.1738610391667,
                        "Call_Chg": 20.35073053502953,
                        "Put_Now": 74.34024012954819,
                        "Put_Sim": 52.16966413870887,
                        "Put_Chg": -29.823115922418353
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 394.20348099079774,
                        "Call_Sim": 482.1848396543819,
                        "Call_Chg": 22.318767567057073,
                        "Put_Now": 101.48520015233066,
                        "Put_Sim": 73.08055881591508,
                        "Put_Chg": -27.98894941703798
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 331.6045518942392,
                        "Call_Sim": 412.6566693941795,
                        "Call_Chg": 24.442401962501048,
                        "Put_Now": 134.78618711776357,
                        "Put_Sim": 99.45230461770416,
                        "Put_Chg": -26.21476521862583
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 302.72215716468054,
                        "Call_Sim": 380.10303578825915,
                        "Call_Chg": 25.561683144813045,
                        "Put_Now": 153.85375041919997,
                        "Put_Sim": 114.84862904277838,
                        "Put_Chg": -25.352077066789526
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 275.48451627548866,
                        "Call_Sim": 349.090278420897,
                        "Call_Chg": 26.718656692778143,
                        "Put_Now": 174.56606756100336,
                        "Put_Sim": 131.78582970641196,
                        "Put_Chg": -24.506617152065672
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 249.90080587896,
                        "Call_Sim": 319.6550870998781,
                        "Call_Chg": 27.912787626104617,
                        "Put_Now": 196.9323151954709,
                        "Put_Sim": 150.30059641638877,
                        "Put_Chg": -23.679058834400262
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 225.96763600139093,
                        "Call_Sim": 291.8225027710132,
                        "Call_Chg": 29.143495030950767,
                        "Put_Now": 220.94910334889664,
                        "Put_Sim": 170.4179701185185,
                        "Put_Chg": -22.87003317256525
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5000.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 877.5851398770046,
                        "Call_Sim": 704.5371664418872,
                        "Call_Chg": -19.71865356099472,
                        "Put_Now": 9.46736266659289,
                        "Put_Sim": 20.03338923147504,
                        "Put_Chg": 111.60475136508789
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 462.9584370300058,
                        "Call_Sim": 329.33045134046915,
                        "Call_Chg": -28.863927083129454,
                        "Put_Now": 74.34024012954819,
                        "Put_Sim": 124.3262544400111,
                        "Put_Chg": 67.2395114992302
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 394.20348099079774,
                        "Call_Sim": 272.2556955380228,
                        "Call_Chg": -30.935238102481822,
                        "Put_Now": 101.48520015233066,
                        "Put_Sim": 163.15141469955574,
                        "Put_Chg": 60.763751221521225
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 331.6045518942392,
                        "Call_Sim": 222.02052117116364,
                        "Call_Chg": -33.04660026440949,
                        "Put_Now": 134.78618711776357,
                        "Put_Sim": 208.8161563946869,
                        "Put_Chg": 54.92400286703182
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 302.72215716468054,
                        "Call_Sim": 199.45818831585257,
                        "Call_Chg": -34.11179737089825,
                        "Put_Now": 153.85375041919997,
                        "Put_Sim": 234.20378157037203,
                        "Put_Chg": 52.22494149947279
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 275.48451627548866,
                        "Call_Sim": 178.56757048163126,
                        "Call_Chg": -35.18054194266911,
                        "Put_Now": 174.56606756100336,
                        "Put_Sim": 261.263121767146,
                        "Put_Chg": 49.664322177530714
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 249.90080587896,
                        "Call_Sim": 159.30964054792707,
                        "Call_Chg": -36.25084961707204,
                        "Put_Now": 196.9323151954709,
                        "Put_Sim": 289.9551498644373,
                        "Put_Chg": 47.23594224575784
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 225.96763600139093,
                        "Call_Sim": 141.6346166212777,
                        "Call_Chg": -37.32083977707061,
                        "Put_Now": 220.94910334889664,
                        "Put_Sim": 320.23008396878276,
                        "Put_Chg": 44.93386898389597
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 877.5851398770046,
                        "Call_Sim": 296.39740620642215,
                        "Call_Chg": -66.22579477041249,
                        "Put_Now": 9.46736266659289,
                        "Put_Sim": 111.89362899600997,
                        "Put_Chg": 1081.8880604505055
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 462.9584370300058,
                        "Call_Sim": 86.47203470416389,
                        "Call_Chg": -81.32185790609981,
                        "Put_Now": 74.34024012954819,
                        "Put_Sim": 381.46783780370606,
                        "Put_Chg": 413.13775303785053
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 394.20348099079774,
                        "Call_Sim": 64.21417459266831,
                        "Call_Chg": -83.71039889569943,
                        "Put_Now": 101.48520015233066,
                        "Put_Sim": 455.10989375420104,
                        "Put_Chg": 348.4495207883267
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 331.6045518942392,
                        "Call_Sim": 46.89419074090222,
                        "Call_Chg": -85.85839956869515,
                        "Put_Now": 134.78618711776357,
                        "Put_Sim": 533.6898259644267,
                        "Put_Chg": 295.952906879203
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 302.72215716468054,
                        "Call_Sim": 39.827283207601454,
                        "Call_Chg": -86.84361806197904,
                        "Put_Now": 153.85375041919997,
                        "Put_Sim": 574.5728764621203,
                        "Put_Chg": 273.45392939502716
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 275.48451627548866,
                        "Call_Sim": 33.688391178849315,
                        "Call_Chg": -87.77122154293404,
                        "Put_Now": 174.56606756100336,
                        "Put_Sim": 616.3839424643638,
                        "Put_Chg": 253.09493481541824
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 249.90080587896,
                        "Call_Sim": 28.381759094771837,
                        "Call_Chg": -88.64279008827263,
                        "Put_Now": 196.9323151954709,
                        "Put_Sim": 659.0272684112829,
                        "Put_Chg": 234.64658543070814
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 225.96763600139093,
                        "Call_Sim": 23.81664203637888,
                        "Call_Chg": -89.4601534724945,
                        "Put_Now": 220.94910334889664,
                        "Put_Sim": 702.412109383884,
                        "Put_Chg": 217.90674808700987
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5235.45014,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 877.5851398770046,
                        "Call_Sim": 927.5348253379079,
                        "Call_Chg": 5.691719605450915,
                        "Put_Now": 9.46736266659289,
                        "Put_Sim": 7.580908127495547,
                        "Put_Chg": -19.92587170822135
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 462.9584370300058,
                        "Call_Sim": 504.1163780833808,
                        "Call_Chg": 8.890202178280514,
                        "Put_Now": 74.34024012954819,
                        "Put_Sim": 63.66204118292285,
                        "Put_Chg": -14.363955413672457
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 394.20348099079774,
                        "Call_Sim": 432.4613411745845,
                        "Call_Chg": 9.705104604258898,
                        "Put_Now": 101.48520015233066,
                        "Put_Sim": 87.90692033611708,
                        "Put_Chg": -13.379566474552346
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 331.6045518942392,
                        "Call_Sim": 366.6708041308957,
                        "Call_Chg": 10.574719808985137,
                        "Put_Now": 134.78618711776357,
                        "Put_Sim": 118.01629935441974,
                        "Put_Chg": -12.441844466370927
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 302.72215716468054,
                        "Call_Sim": 336.1098246713018,
                        "Call_Chg": 11.029145609734275,
                        "Put_Now": 153.85375041919997,
                        "Put_Sim": 135.40527792582088,
                        "Put_Chg": -11.990915036593632
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 275.48451627548866,
                        "Call_Sim": 307.15454564765287,
                        "Call_Chg": 11.496119564300196,
                        "Put_Now": 174.56606756100336,
                        "Put_Sim": 154.3999569331679,
                        "Put_Chg": -11.552136626316715
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 249.90080587896,
                        "Call_Sim": 279.82697969584797,
                        "Call_Chg": 11.975221012845703,
                        "Put_Now": 196.9323151954709,
                        "Put_Sim": 175.02234901235806,
                        "Put_Chg": -11.125632764417285
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 225.96763600139093,
                        "Call_Sim": 254.13679983950306,
                        "Call_Chg": 12.466016964455358,
                        "Put_Now": 220.94910334889664,
                        "Put_Sim": 197.28212718700843,
                        "Put_Chg": -10.711505864097639
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5131.777859999999,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 877.5851398770046,
                        "Call_Sim": 828.0506498723594,
                        "Call_Chg": -5.644408474326219,
                        "Put_Now": 9.46736266659289,
                        "Put_Sim": 11.76901266194821,
                        "Put_Chg": 24.3114167737237
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 462.9584370300058,
                        "Call_Sim": 423.21680211096145,
                        "Call_Chg": -8.58427706253652,
                        "Put_Now": 74.34024012954819,
                        "Put_Sim": 86.43474521050462,
                        "Put_Chg": 16.269122967426615
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 394.20348099079774,
                        "Call_Sim": 357.55024841187605,
                        "Call_Chg": -9.298048938278482,
                        "Put_Now": 101.48520015233066,
                        "Put_Sim": 116.66810757340977,
                        "Put_Chg": 14.960710919709827
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 331.6045518942392,
                        "Call_Sim": 298.2938836408598,
                        "Call_Chg": -10.045298854644004,
                        "Put_Now": 134.78618711776357,
                        "Put_Sim": 153.3116588643852,
                        "Put_Chg": 13.74433993776811
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 302.72215716468054,
                        "Call_Sim": 271.1480113722823,
                        "Call_Chg": -10.430074259553427,
                        "Put_Now": 153.85375041919997,
                        "Put_Sim": 174.1157446268012,
                        "Put_Chg": 13.169645947787473
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 275.48451627548866,
                        "Call_Sim": 245.67290530240234,
                        "Call_Chg": -10.821519617920835,
                        "Put_Now": 174.56606756100336,
                        "Put_Sim": 196.59059658791784,
                        "Put_Chg": 12.616729777233395
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 249.90080587896,
                        "Call_Sim": 221.86427809010365,
                        "Call_Chg": -11.219062575746914,
                        "Put_Now": 196.9323151954709,
                        "Put_Sim": 220.7319274066149,
                        "Put_Chg": 12.08517362298869
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 225.96763600139093,
                        "Call_Sim": 199.70536817518087,
                        "Call_Chg": -11.622136820534958,
                        "Put_Now": 220.94910334889664,
                        "Put_Sim": 246.52297552268692,
                        "Put_Chg": 11.574553499503027
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
                        "Call_Now": 202.7435775000995,
                        "Call_Sim": 314.58720625162823,
                        "Call_Chg": 55.16506620362554,
                        "Put_Now": 5.259960885839234,
                        "Put_Sim": 0.7175896373675954,
                        "Put_Chg": -86.35751000925737
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 35.64007638812586,
                        "Call_Sim": 96.40335670968034,
                        "Call_Chg": 170.49144244202253,
                        "Put_Now": 87.46297894315194,
                        "Put_Sim": 31.840259264706447,
                        "Put_Chg": -63.59572970250468
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 20.929988568738963,
                        "Call_Sim": 66.4664494411445,
                        "Call_Chg": 217.5656270563798,
                        "Put_Now": 122.6141949576222,
                        "Put_Sim": 51.76465583002755,
                        "Put_Chg": -57.78249341528654
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 11.428730014848952,
                        "Call_Sim": 43.17728277391279,
                        "Call_Chg": 277.79598186162457,
                        "Put_Now": 162.9742402375905,
                        "Put_Sim": 78.33679299665391,
                        "Put_Chg": -51.93302151158898
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.785984793890748,
                        "Call_Sim": 26.298690312269173,
                        "Call_Chg": 354.52401361367544,
                        "Put_Now": 207.19279885048945,
                        "Put_Sim": 111.319504368867,
                        "Put_Chg": -46.27250320162175
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.00542185448477428,
                        "Call_Sim": 0.10730346097973076,
                        "Call_Chg": 0.0,
                        "Put_Now": 550.4413627480853,
                        "Put_Sim": 434.15724435458014,
                        "Put_Chg": -21.125614145883823
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5350.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 202.7435775000995,
                        "Call_Sim": 364.1337365058671,
                        "Call_Chg": 79.60309322532714,
                        "Put_Now": 5.259960885839234,
                        "Put_Sim": 0.2641198916063132,
                        "Put_Chg": -94.97867194569125
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 35.64007638812586,
                        "Call_Sim": 133.01713205343094,
                        "Call_Chg": 273.22347630474775,
                        "Put_Now": 87.46297894315194,
                        "Put_Sim": 18.454034608457505,
                        "Put_Chg": -78.90074768611298
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 20.929988568738963,
                        "Call_Sim": 97.00031203798972,
                        "Call_Chg": 363.45133787062554,
                        "Put_Now": 122.6141949576222,
                        "Put_Sim": 32.29851842687276,
                        "Put_Chg": -73.65841822960569
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 11.428730014848952,
                        "Call_Sim": 67.09349141700432,
                        "Call_Chg": 487.0599036798671,
                        "Put_Now": 162.9742402375905,
                        "Put_Sim": 52.253001639745435,
                        "Put_Chg": -67.9378768303697
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.785984793890748,
                        "Call_Sim": 43.773436337326075,
                        "Call_Chg": 656.5425402352452,
                        "Put_Now": 207.19279885048945,
                        "Put_Sim": 78.7942503939239,
                        "Put_Chg": -61.97056517838638
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.00542185448477428,
                        "Call_Sim": 0.32057484288406357,
                        "Call_Chg": 0.0,
                        "Put_Now": 550.4413627480853,
                        "Put_Sim": 384.37051573648387,
                        "Put_Chg": -30.170488311868628
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5000.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 202.7435775000995,
                        "Call_Sim": 62.70419758598564,
                        "Call_Chg": -69.07216575777603,
                        "Put_Now": 5.259960885839234,
                        "Put_Sim": 48.83458097172479,
                        "Put_Chg": 828.4209907947475
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 35.64007638812586,
                        "Call_Sim": 2.930465775171882,
                        "Call_Chg": -91.77761084668096,
                        "Put_Now": 87.46297894315194,
                        "Put_Sim": 238.36736833019768,
                        "Put_Chg": 172.53515854419803
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 20.929988568738963,
                        "Call_Sim": 1.2429667459424252,
                        "Call_Chg": -94.06131187382051,
                        "Put_Now": 122.6141949576222,
                        "Put_Sim": 286.54117313482584,
                        "Put_Chg": 133.69331196429576
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 11.428730014848952,
                        "Call_Sim": 0.4840249662404901,
                        "Call_Chg": -95.76484031373903,
                        "Put_Now": 162.9742402375905,
                        "Put_Sim": 335.64353518898133,
                        "Put_Chg": 105.9488264523685
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.785984793890748,
                        "Call_Sim": 0.17300902705255083,
                        "Call_Chg": -97.00986032256382,
                        "Put_Now": 207.19279885048945,
                        "Put_Sim": 385.1938230836513,
                        "Put_Chg": 85.91081602290993
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.00542185448477428,
                        "Call_Sim": 1.2412421153231486e-05,
                        "Call_Chg": 0.0,
                        "Put_Now": 550.4413627480853,
                        "Put_Sim": 734.049953306021,
                        "Put_Chg": 33.3566121632407
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5235.45014,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 202.7435775000995,
                        "Call_Sim": 251.61413441099558,
                        "Call_Chg": 24.104614071374026,
                        "Put_Now": 5.259960885839234,
                        "Put_Sim": 2.2943777967347785,
                        "Put_Chg": -56.380325889653314
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 35.64007638812586,
                        "Call_Sim": 58.19425630849355,
                        "Call_Chg": 63.28319747339829,
                        "Put_Now": 87.46297894315194,
                        "Put_Sim": 58.18101886351906,
                        "Put_Chg": -33.4792622358143
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 20.929988568738963,
                        "Call_Sim": 36.89018924520633,
                        "Call_Chg": 76.25518104823777,
                        "Put_Now": 122.6141949576222,
                        "Put_Sim": 86.73825563408991,
                        "Put_Chg": -29.259205539727027
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 11.428730014848952,
                        "Call_Sim": 21.862092199659628,
                        "Call_Chg": 91.29065234067977,
                        "Put_Now": 162.9742402375905,
                        "Put_Sim": 121.57146242240105,
                        "Put_Chg": -25.40449199507283
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.785984793890748,
                        "Call_Sim": 12.066422267202256,
                        "Call_Chg": 108.54569614394491,
                        "Put_Now": 207.19279885048945,
                        "Put_Sim": 161.6370963238005,
                        "Put_Chg": -21.987107071014563
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.00542185448477428,
                        "Call_Sim": 0.022156635968883176,
                        "Call_Chg": 0.0,
                        "Put_Now": 550.4413627480853,
                        "Put_Sim": 498.62195752956904,
                        "Put_Chg": -9.414155389741657
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5131.777859999999,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 202.7435775000995,
                        "Call_Sim": 156.6591454902764,
                        "Call_Chg": -22.730402895154835,
                        "Put_Now": 5.259960885839234,
                        "Put_Sim": 11.011668876016529,
                        "Put_Chg": 109.34887378463083
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 35.64007638812586,
                        "Call_Sim": 20.01671456350391,
                        "Call_Chg": -43.836499266952075,
                        "Put_Now": 87.46297894315194,
                        "Put_Sim": 123.67575711853033,
                        "Put_Chg": 41.40354995102042
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 20.929988568738963,
                        "Call_Sim": 10.809911994110735,
                        "Call_Chg": -48.35204062052656,
                        "Put_Now": 122.6141949576222,
                        "Put_Sim": 164.33025838299454,
                        "Put_Chg": 34.022213692134265
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 11.428730014848952,
                        "Call_Sim": 5.403319408255015,
                        "Call_Chg": -52.72161122684087,
                        "Put_Now": 162.9742402375905,
                        "Put_Sim": 208.78496963099678,
                        "Put_Chg": 28.109184203970848
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 5.785984793890748,
                        "Call_Sim": 2.4948081403076685,
                        "Call_Chg": -56.881875269671234,
                        "Put_Now": 207.19279885048945,
                        "Put_Sim": 255.73776219690717,
                        "Put_Chg": 23.42985065878077
                    },
                    {
                        "Strike": 5750.0,
                        "Call_Now": 0.00542185448477428,
                        "Call_Sim": 0.001163460102003716,
                        "Call_Chg": 0.0,
                        "Put_Now": 550.4413627480853,
                        "Put_Sim": 602.2732443537034,
                        "Put_Chg": 9.41642200485202
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.00016827601180872072,
            -0.26902743107586724,
            0.0006199356459769111,
            0.03588095082898051,
            0.199153550715139,
            0.2702169859181975,
            0.29629996076052706,
            0.2193653195059322,
            0.03252731460553493,
            0.0005836692018378291,
            0.005189142947118936,
            0.333151111951294,
            0.024118526285343167
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
            -0.4692641986367463,
            -2007.6688885641595,
            -250.46949626032432,
            -839.8167094282471,
            419.2899822813349,
            300.92270437822947,
            -1492.533859248116,
            234.82646663958738,
            183.39150445051007,
            0.06160596606843585,
            7.858030298447219,
            -5772.247533513215,
            56.1614279434349
        ],
        "delta_cumulative": [
            -0.4692641986367463,
            -2008.1381527627962,
            -2258.6076490231203,
            -3098.4243584513674,
            -2679.1343761700327,
            -2378.2116717918034,
            -3870.745531039919,
            -3635.9190644003315,
            -3452.5275599498214,
            -3452.465953983753,
            -3444.6079236853056,
            -9216.85545719852,
            -9160.694029255086
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
            5490.8387542789615,
            24599473.78782802,
            2152836.7775147194,
            5983694.10942553,
            6772470.799599585,
            6881102.721408261,
            7446290.442123797,
            4548313.044484329,
            921923.1583232109,
            4260.898286891524,
            97516.50684559098,
            12216092.896279294,
            441184.27087499504
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            6664954.559903394,
            6784138.492477442,
            0.0,
            4548313.044484329,
            921923.1583232109,
            4260.898286891524,
            97516.50684559098,
            5194086.922375497,
            441184.27087499504
        ],
        "gamma_put": [
            5490.8387542789615,
            24599473.78782802,
            2152836.7775147194,
            5983694.10942553,
            107516.2396961909,
            96964.22893081859,
            7446290.442123797,
            0.0,
            0.0,
            0.0,
            0.0,
            7022005.973903797,
            0.0
        ],
        "gamma_exposure": [
            5490.8387542789615,
            24604964.6265823,
            26757801.404097017,
            32741495.513522547,
            39513966.31312213,
            46395069.034530394,
            53841359.47665419,
            58389672.52113852,
            59311595.67946173,
            59315856.57774863,
            59413373.08459422,
            71629465.98087351,
            72070650.2517485
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
            "abs_call": 14840213.145216685,
            "abs_put": 12585056.501274753,
            "net": 27425269.646491434
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 36,
            "abs_call": 2559415.924570176,
            "abs_put": 0.0,
            "net": 2559415.924570176
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 57,
            "abs_call": 349996.3675675668,
            "abs_put": 0.0,
            "net": 349996.3675675668
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 79,
            "abs_call": 0.0,
            "abs_put": 27311927.76663414,
            "net": 27311927.76663414
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 102,
            "abs_call": 97516.50684559098,
            "abs_put": 0.0,
            "net": 97516.50684559098
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 123,
            "abs_call": 47510.59901902573,
            "abs_put": 0.0,
            "net": 47510.59901902573
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 145,
            "abs_call": 5194086.922375497,
            "abs_put": 7022005.973903797,
            "net": 12216092.896279294
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 167,
            "abs_call": 0.0,
            "abs_put": 34638.609093473024,
            "net": 34638.609093473024
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 188,
            "abs_call": 921923.1583232109,
            "abs_put": 0.0,
            "net": 921923.1583232109
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 211,
            "abs_call": 441184.27087499504,
            "abs_put": 0.0,
            "net": 441184.27087499504
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 232,
            "abs_call": 0.0,
            "abs_put": 107516.2396961909,
            "net": 107516.2396961909
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 252,
            "abs_call": 204530.95877860606,
            "abs_put": 353127.3075748007,
            "net": 557658.2663534067
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
            125.0,
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
            185.0,
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
                "volume": 25,
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
            "spot": 5183.614,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 49,
            "iv_atm": 0.0,
            "spot": 5183.614,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 80,
            "iv_atm": 0.0,
            "spot": 5183.614,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 110,
            "iv_atm": 0.0,
            "spot": 5183.614,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 143,
            "iv_atm": 0.0,
            "spot": 5183.614,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 172,
            "iv_atm": 0.0,
            "spot": 5183.614,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 201,
            "iv_atm": 0.0,
            "spot": 5183.614,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 234,
            "iv_atm": 0.0,
            "spot": 5183.614,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 263,
            "iv_atm": 0.0,
            "spot": 5183.614,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 294,
            "iv_atm": 0.0,
            "spot": 5183.614,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 325,
            "iv_atm": 0.0,
            "spot": 5183.614,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 353,
            "iv_atm": 0.0,
            "spot": 5183.614,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5183.614,
                    "lower": 5183.614,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5183.614,
                    "lower": 5183.614,
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
            -0.858889444399028,
            -4288.6121495794305,
            12.484714402861579,
            401.084931049835,
            1864.4296699071617,
            3005.1859099437647,
            4546.921390747753,
            2455.4334187881805,
            148.01815340061958,
            8.316596660214756,
            36.743632830570796,
            3801.247576098949,
            119.48249349963763
        ],
        "vanna": [
            -15.66787162131869,
            -19646.2092579377,
            -1110.78893920955,
            -1061.98073656242,
            966.5006048991114,
            2204.1351762978375,
            3530.070035451596,
            2799.2337335204184,
            708.348978949,
            8.050913361958168,
            183.92547937187052,
            25023.65964221352,
            1064.3106228524323
        ],
        "vex": [
            4458.972018168941,
            7758008.230261403,
            862173.0247185202,
            2311139.903315111,
            836924.1138195662,
            653855.278455174,
            755038.1169086758,
            583446.7584948362,
            842814.8115312665,
            290.07398976425753,
            48367.97365594725,
            8613505.084716646,
            452670.36289835547
        ],
        "theta": [
            -1.0766361166856289,
            -4929.344604913274,
            -349.56892691296474,
            -812.8497619019328,
            -2359.097522532049,
            -2278.422912453843,
            -544.832036588983,
            -1543.2931252029698,
            -441.07236807613657,
            -1.287457740600457,
            -35.84039218116005,
            3380.59195061028,
            -181.65549640551325
        ],
        "charm_cum": [
            -0.858889444399028,
            -4289.47103902383,
            -4276.986324620968,
            -3875.9013935711328,
            -2011.471723663971,
            993.7141862797937,
            5540.635577027547,
            7996.068995815727,
            8144.087149216347,
            8152.4037458765615,
            8189.147378707133,
            11990.394954806081,
            12109.877448305719
        ],
        "vanna_cum": [
            -15.66787162131869,
            -19661.877129559016,
            -20772.666068768565,
            -21834.646805330984,
            -20868.14620043187,
            -18664.011024134034,
            -15133.940988682438,
            -12334.707255162019,
            -11626.358276213019,
            -11618.307362851061,
            -11434.381883479191,
            13589.277758734328,
            14653.58838158676
        ],
        "theta_cum": [
            -1.0766361166856289,
            -4930.42124102996,
            -5279.990167942924,
            -6092.839929844857,
            -8451.937452376906,
            -10730.360364830749,
            -11275.192401419732,
            -12818.485526622702,
            -13259.557894698839,
            -13260.845352439439,
            -13296.6857446206,
            -9916.09379401032,
            -10097.749290415833
        ],
        "r_gamma": [
            5490.8387542789615,
            24599473.78782802,
            2152836.7775147194,
            -5983694.10942553,
            -6772470.799599585,
            -6881102.721408261,
            -7446290.442123797,
            -4548313.044484329,
            -921923.1583232109,
            -4260.898286891524,
            -97516.50684559098,
            -12216092.896279296,
            -441184.27087499504
        ],
        "r_gamma_cum": [
            5490.8387542789615,
            24604964.6265823,
            26757801.404097017,
            20774107.294671487,
            14001636.495071903,
            7120533.773663642,
            -325756.6684601549,
            -4874069.712944484,
            -5795992.871267695,
            -5800253.769554586,
            -5897770.276400177,
            -18113863.172679473,
            -18555047.44355447
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.4692641986367463,
            "gamma": 5490.8387542789615,
            "volume": 15,
            "oi": 15,
            "iv": 11.82
        },
        {
            "strike": 5000.0,
            "delta": -2007.6688885641595,
            "gamma": 24599473.78782802,
            "volume": 4025,
            "oi": 10915,
            "iv": 11.82
        },
        {
            "strike": 5100.0,
            "delta": -250.46949626032432,
            "gamma": 2152836.7775147194,
            "volume": 830,
            "oi": 830,
            "iv": 11.82
        },
        {
            "strike": 5200.0,
            "delta": -839.8167094282471,
            "gamma": 5983694.10942553,
            "volume": 2015,
            "oi": 2040,
            "iv": 11.82
        },
        {
            "strike": 5250.0,
            "delta": 419.2899822813349,
            "gamma": 6772470.799599585,
            "volume": 175,
            "oi": 1165,
            "iv": 11.82
        },
        {
            "strike": 5300.0,
            "delta": 300.92270437822947,
            "gamma": 6881102.721408261,
            "volume": 185,
            "oi": 1295,
            "iv": 11.82
        },
        {
            "strike": 5350.0,
            "delta": -1492.533859248116,
            "gamma": 7446290.442123797,
            "volume": 1630,
            "oi": 1830,
            "iv": 11.82
        },
        {
            "strike": 5400.0,
            "delta": 234.82646663958738,
            "gamma": 4548313.044484329,
            "volume": 55,
            "oi": 1445,
            "iv": 11.82
        },
        {
            "strike": 5600.0,
            "delta": 183.39150445051007,
            "gamma": 921923.1583232109,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        },
        {
            "strike": 5750.0,
            "delta": 0.06160596606843585,
            "gamma": 4260.898286891524,
            "volume": 25,
            "oi": 400,
            "iv": 11.82
        },
        {
            "strike": 5900.0,
            "delta": 7.858030298447219,
            "gamma": 97516.50684559098,
            "volume": 200,
            "oi": 100,
            "iv": 11.82
        },
        {
            "strike": 6000.0,
            "delta": -5772.247533513215,
            "gamma": 12216092.896279294,
            "volume": 60,
            "oi": 12230,
            "iv": 11.82
        },
        {
            "strike": 6200.0,
            "delta": 56.1614279434349,
            "gamma": 441184.27087499504,
            "volume": 500,
            "oi": 500,
            "iv": 11.82
        }
    ]
};