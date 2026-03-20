window.marketData = {
    "last_updated": "2026-03-20 08:15:50",
    "spot_price": 5261.0,
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-03-20",
        "meetings": [
            {
                "date": "2026-04-29",
                "days_remaining": 39,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 6.4,
                    "3.50-3.75": 91.4,
                    "3.75-4.00": 8.6
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 88,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 1.1,
                    "3.25-3.50": 1.7,
                    "3.50-3.75": 90.0,
                    "3.75-4.00": 9.9,
                    "4.00-4.25": 0.1
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 130,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 0.0,
                    "3.25-3.50": 3.7,
                    "3.50-3.75": 86.0,
                    "3.75-4.00": 13.4,
                    "4.00-4.25": 0.6,
                    "4.25-4.50": 0.0
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 179,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.2,
                    "3.25-3.50": 7.1,
                    "3.50-3.75": 84.8,
                    "3.75-4.00": 14.4,
                    "4.00-4.25": 0.7,
                    "4.25-4.50": 0.0
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 221,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.1,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.2,
                    "3.25-3.50": 7.1,
                    "3.50-3.75": 80.9,
                    "3.75-4.00": 17.7,
                    "4.00-4.25": 1.4,
                    "4.25-4.50": 0.0,
                    "4.50-4.75": 0.0
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 263,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 1.2,
                    "3.25-3.50": 8.1,
                    "3.50-3.75": 74.6,
                    "3.75-4.00": 16.0,
                    "4.00-4.25": 1.2,
                    "4.25-4.50": 0.0,
                    "4.50-4.75": 0.0,
                    "4.75-5.00": 14.75
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 20/03/2026 08:15\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(2);\n  spot(5261.00);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5438.96;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (5438.96)\n  // 2 = Spline (5433.74)\n  // 3 = HVL (4500.00)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (5438.96)\n  // 7 = HVL Gaussian (5465.92)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 5438.96;\n  if (ModeloFlip = 2) then GammaVal := 5433.74;\n  if (ModeloFlip = 3) then GammaVal := 4500.00;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 5438.96;\n  if (ModeloFlip = 7) then GammaVal := 5465.92;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5176.72 <= LimitUpper) and (5176.72 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5176.72, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5221.23 <= LimitUpper) and (5221.23 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5221.23, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirMaxPain) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5275.00 <= LimitUpper) and (5275.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5275.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirRange) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5300.77 <= LimitUpper) and (5300.77 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.77, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5381.49 <= LimitUpper) and (5381.49 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5381.49, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5450.00 <= LimitUpper) and (5450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5450.00 <= LimitUpper) and (5450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5450.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5500.00 <= LimitUpper) and (5500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5550.00 <= LimitUpper) and (5550.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5550.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5650.00 <= LimitUpper) and (5650.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5650.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5800.00 <= LimitUpper) and (5800.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5800.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5850.00 <= LimitUpper) and (5850.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5850.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5221.00 > 0) then\n      HorizontalLineCustom(5221.00, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5075.00 <= LimitUpper) and (5075.00 >= LimitLower) then\n      HorizontalLineCustom(5075.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5262.50 <= LimitUpper) and (5262.50 >= LimitLower) then\n      HorizontalLineCustom(5262.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5287.50 <= LimitUpper) and (5287.50 >= LimitLower) then\n      HorizontalLineCustom(5287.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5425.00 <= LimitUpper) and (5425.00 >= LimitLower) then\n      HorizontalLineCustom(5425.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5475.00 <= LimitUpper) and (5475.00 >= LimitLower) then\n      HorizontalLineCustom(5475.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5525.00 <= LimitUpper) and (5525.00 >= LimitLower) then\n      HorizontalLineCustom(5525.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5575.00 <= LimitUpper) and (5575.00 >= LimitLower) then\n      HorizontalLineCustom(5575.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5625.00 <= LimitUpper) and (5625.00 >= LimitLower) then\n      HorizontalLineCustom(5625.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5725.00 <= LimitUpper) and (5725.00 >= LimitLower) then\n      HorizontalLineCustom(5725.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5825.00 <= LimitUpper) and (5825.00 >= LimitLower) then\n      HorizontalLineCustom(5825.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5057.30 <= LimitUpper) and (5057.30 >= LimitLower) then\n      HorizontalLineCustom(5057.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5092.70 <= LimitUpper) and (5092.70 >= LimitLower) then\n      HorizontalLineCustom(5092.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5259.55 <= LimitUpper) and (5259.55 >= LimitLower) then\n      HorizontalLineCustom(5259.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5265.45 <= LimitUpper) and (5265.45 >= LimitLower) then\n      HorizontalLineCustom(5265.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5284.55 <= LimitUpper) and (5284.55 >= LimitLower) then\n      HorizontalLineCustom(5284.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5290.45 <= LimitUpper) and (5290.45 >= LimitLower) then\n      HorizontalLineCustom(5290.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5419.10 <= LimitUpper) and (5419.10 >= LimitLower) then\n      HorizontalLineCustom(5419.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5430.90 <= LimitUpper) and (5430.90 >= LimitLower) then\n      HorizontalLineCustom(5430.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5469.10 <= LimitUpper) and (5469.10 >= LimitLower) then\n      HorizontalLineCustom(5469.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5480.90 <= LimitUpper) and (5480.90 >= LimitLower) then\n      HorizontalLineCustom(5480.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5519.10 <= LimitUpper) and (5519.10 >= LimitLower) then\n      HorizontalLineCustom(5519.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5530.90 <= LimitUpper) and (5530.90 >= LimitLower) then\n      HorizontalLineCustom(5530.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5569.10 <= LimitUpper) and (5569.10 >= LimitLower) then\n      HorizontalLineCustom(5569.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5580.90 <= LimitUpper) and (5580.90 >= LimitLower) then\n      HorizontalLineCustom(5580.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5619.10 <= LimitUpper) and (5619.10 >= LimitLower) then\n      HorizontalLineCustom(5619.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5630.90 <= LimitUpper) and (5630.90 >= LimitLower) then\n      HorizontalLineCustom(5630.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5707.30 <= LimitUpper) and (5707.30 >= LimitLower) then\n      HorizontalLineCustom(5707.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5742.70 <= LimitUpper) and (5742.70 >= LimitLower) then\n      HorizontalLineCustom(5742.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5819.10 <= LimitUpper) and (5819.10 >= LimitLower) then\n      HorizontalLineCustom(5819.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5830.90 <= LimitUpper) and (5830.90 >= LimitLower) then\n      HorizontalLineCustom(5830.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5035.40 <= LimitUpper) and (5035.40 >= LimitLower) then\n      HorizontalLineCustom(5035.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5114.60 <= LimitUpper) and (5114.60 >= LimitLower) then\n      HorizontalLineCustom(5114.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5255.90 <= LimitUpper) and (5255.90 >= LimitLower) then\n      HorizontalLineCustom(5255.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5294.10 <= LimitUpper) and (5294.10 >= LimitLower) then\n      HorizontalLineCustom(5294.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5411.80 <= LimitUpper) and (5411.80 >= LimitLower) then\n      HorizontalLineCustom(5411.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5438.20 <= LimitUpper) and (5438.20 >= LimitLower) then\n      HorizontalLineCustom(5438.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5461.80 <= LimitUpper) and (5461.80 >= LimitLower) then\n      HorizontalLineCustom(5461.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5488.20 <= LimitUpper) and (5488.20 >= LimitLower) then\n      HorizontalLineCustom(5488.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5511.80 <= LimitUpper) and (5511.80 >= LimitLower) then\n      HorizontalLineCustom(5511.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5538.20 <= LimitUpper) and (5538.20 >= LimitLower) then\n      HorizontalLineCustom(5538.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5588.20 <= LimitUpper) and (5588.20 >= LimitLower) then\n      HorizontalLineCustom(5588.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5611.80 <= LimitUpper) and (5611.80 >= LimitLower) then\n      HorizontalLineCustom(5611.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5638.20 <= LimitUpper) and (5638.20 >= LimitLower) then\n      HorizontalLineCustom(5638.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5685.40 <= LimitUpper) and (5685.40 >= LimitLower) then\n      HorizontalLineCustom(5685.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5764.60 <= LimitUpper) and (5764.60 >= LimitLower) then\n      HorizontalLineCustom(5764.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5811.80 <= LimitUpper) and (5811.80 >= LimitLower) then\n      HorizontalLineCustom(5811.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5838.20 <= LimitUpper) and (5838.20 >= LimitLower) then\n      HorizontalLineCustom(5838.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5268.89, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5253.11, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5276.78, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5245.22, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5291.44, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5230.56, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5299.33, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5222.67, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "positive"
    },
    "overview": {
        "total_trades": 61245,
        "total_volume": 20880,
        "gamma_exposure": 258820402.80376643,
        "delta_position": 3886.060113774267,
        "last_update": "2026-03-20T08:15:50.267066",
        "spot_price": 5261.0,
        "dealer_pressure": 0.054659304628602634,
        "regime": "Gamma Negativo"
    },
    "key_levels": {
        "gamma_flip": 5438.959365657862,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 5465.920436155906,
        "gamma_flip_selected": 5433.741503072518,
        "gamma_flip_model": "Spline",
        "call_wall": 5300.0,
        "put_wall": 5200.0,
        "effective_call_wall": 5381.491712707182,
        "effective_put_wall": 5176.72147995889,
        "max_pain": 5250.0,
        "zero_gamma": 5438.959365657862,
        "range_low": 5221.230578149969,
        "range_high": 5300.769421850031,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5300.769421850031,
                "sigma_1_down": 5221.230578149969,
                "sigma_2_up": 5340.538843700062,
                "sigma_2_down": 5181.461156299938
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5349.927130682535,
                "sigma_1_down": 5172.072869317465,
                "sigma_2_up": 5438.854261365069,
                "sigma_2_down": 5083.145738634931
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 8,
                "sigma_1_up": 5373.484911496101,
                "sigma_1_down": 5148.515088503899,
                "sigma_2_up": 5485.969822992202,
                "sigma_2_down": 5036.030177007798
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
                5553.39972060354,
                5474.0404336887,
                5451.3945562784775,
                5447.620422207531,
                5445.695809154862,
                5444.254267810834,
                5443.1582771177555,
                5442.314037743133,
                5441.656185795252,
                5441.138307439782,
                5440.7268909396835,
                5440.39737718419,
                5440.131525368789,
                5439.915622320658,
                5439.739244394367,
                5439.594388134593
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
                4471.849999999999,
                4504.060204081632,
                4536.270408163265,
                4568.480612244897,
                4600.69081632653,
                4632.901020408162,
                4665.111224489795,
                4697.321428571428,
                4729.531632653061,
                4761.741836734694,
                4793.952040816326,
                4826.162244897959,
                4858.372448979591,
                4890.582653061224,
                4922.7928571428565,
                4955.003061224489,
                4987.213265306122,
                5019.423469387754,
                5051.633673469387,
                5083.84387755102,
                5116.054081632652,
                5148.2642857142855,
                5180.474489795918,
                5212.684693877551,
                5244.894897959183,
                5277.105102040816,
                5309.315306122448,
                5341.525510204081,
                5373.735714285714,
                5405.945918367346,
                5438.156122448979,
                5470.366326530611,
                5502.576530612245,
                5534.7867346938765,
                5566.99693877551,
                5599.207142857143,
                5631.417346938775,
                5663.627551020408,
                5695.83775510204,
                5728.047959183673,
                5760.2581632653055,
                5792.468367346938,
                5824.678571428571,
                5856.888775510203,
                5889.098979591836,
                5921.309183673469,
                5953.519387755101,
                5985.7295918367345,
                6017.939795918367,
                6050.15
            ],
            "deltas": [
                -24913.10949198128,
                -24709.151107297017,
                -24474.769862873232,
                -24208.069758868154,
                -23907.496100142405,
                -23571.815735264805,
                -23199.96131083191,
                -22790.645421907117,
                -22341.666687617068,
                -21848.936194577567,
                -21305.450188710525,
                -20700.60407686344,
                -20020.162710714394,
                -19246.750117822376,
                -18360.147002260444,
                -17336.6045171737,
                -16147.271668412723,
                -14757.330720357402,
                -13128.283532603942,
                -11224.843601398794,
                -9025.20857967686,
                -6530.837487750518,
                -3771.2764983927605,
                -801.718152681369,
                2305.487807384353,
                5471.505373764722,
                8619.774973919151,
                11680.814979631174,
                14593.753580413373,
                17306.946827101005,
                19779.735674245574,
                21985.598055994164,
                23915.07547342503,
                25576.250233898714,
                26991.59670241843,
                28191.939218844127,
                29209.71292053067,
                30073.867120473595,
                30807.66096359482,
                31429.106275201237,
                31952.805573039706,
                32391.806025351776,
                32758.636563849443,
                33065.41437855784,
                33323.38541442053,
                33542.37054633449,
                33730.43415513573,
                33893.86477456179,
                34037.395200433166,
                34164.53237797817
            ],
            "flip_value": 5220.995538297168
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                120.0,
                0.0,
                0.0,
                3800.0,
                3805.0,
                4630.0,
                4000.0,
                290.0,
                200.0,
                1200.0,
                100.0,
                120.0,
                40.0
            ],
            "bear": [
                -15.0,
                -330.0,
                -330.0,
                -490.0,
                -495.0,
                -115.0,
                -0.0,
                -0.0,
                -0.0,
                -800.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4471.849999999999,
                4504.060204081632,
                4536.270408163265,
                4568.480612244897,
                4600.69081632653,
                4632.901020408162,
                4665.111224489795,
                4697.321428571428,
                4729.531632653061,
                4761.741836734694,
                4793.952040816326,
                4826.162244897959,
                4858.372448979591,
                4890.582653061224,
                4922.7928571428565,
                4955.003061224489,
                4987.213265306122,
                5019.423469387754,
                5051.633673469387,
                5083.84387755102,
                5116.054081632652,
                5148.2642857142855,
                5180.474489795918,
                5212.684693877551,
                5244.894897959183,
                5277.105102040816,
                5309.315306122448,
                5341.525510204081,
                5373.735714285714,
                5405.945918367346,
                5438.156122448979,
                5470.366326530611,
                5502.576530612245,
                5534.7867346938765,
                5566.99693877551,
                5599.207142857143,
                5631.417346938775,
                5663.627551020408,
                5695.83775510204,
                5728.047959183673,
                5760.2581632653055,
                5792.468367346938,
                5824.678571428571,
                5856.888775510203,
                5889.098979591836,
                5921.309183673469,
                5953.519387755101,
                5985.7295918367345,
                6017.939795918367,
                6050.15
            ],
            "pnl": [
                -16106322.249977611,
                -15262783.211424842,
                -14419308.120732918,
                -13575892.789227966,
                -12732534.162058096,
                -11889246.422578119,
                -11046099.376722302,
                -10203304.211995669,
                -9361384.912260544,
                -8521473.5908353,
                -7685734.626369811,
                -6857844.402644999,
                -6043352.9399582865,
                -5249697.773383581,
                -4485708.602293576,
                -3760652.767409716,
                -3083131.006803451,
                -2460266.9027011865,
                -1897519.8497913182,
                -1399136.3720480977,
                -968937.9265954306,
                -611027.334684679,
                -330128.67195864604,
                -131526.58328831452,
                -20753.007190673845,
                -3186.2813268330647,
                -83627.99826197012,
                -265831.880587041,
                -551965.0520192508,
                -942073.5027166435,
                -1433711.5575252972,
                -2021894.0312306918,
                -2699425.2985183904,
                -3457516.1138426503,
                -4286506.430312155,
                -5176518.840088869,
                -6117950.650011657,
                -7101807.196909126,
                -8119928.005709664,
                -9165148.873382282,
                -10231406.17257801,
                -11313763.722942635,
                -12408346.82480191,
                -13512194.458459761,
                -14623067.078632083,
                -15739256.404010184,
                -16859432.349690165,
                -17982540.30767681,
                -19107742.01906791,
                -20234383.15449062
            ]
        },
        "max_pain_profile": {
            "strikes": [
                4500.0,
                5000.0,
                5150.0,
                5200.0,
                5250.0,
                5275.0,
                5300.0,
                5350.0,
                5400.0,
                5450.0,
                5500.0,
                5550.0,
                5600.0,
                5650.0,
                5800.0,
                5850.0
            ],
            "loss": [
                16096625.0,
                3144125.0,
                915125.0,
                408625.0,
                168875.0,
                149000.0,
                132000.0,
                346000.0,
                695250.0,
                1488500.0,
                2699750.0,
                4010000.0,
                5353250.0,
                6961500.0,
                12086250.0,
                13800500.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5300.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 269.1831441481527,
                        "Call_Sim": 308.014046430525,
                        "Call_Chg": 14.425458326989684,
                        "Put_Now": 0.2529316960829746,
                        "Put_Sim": 0.08383397845452478,
                        "Put_Chg": -66.85509180825525
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.23693554894908,
                        "Call_Sim": 162.10956478923345,
                        "Call_Chg": 27.4076305672016,
                        "Put_Now": 8.068816723315877,
                        "Put_Sim": 3.9414459636006427,
                        "Put_Chg": -51.15211934097683
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.49811142469389,
                        "Call_Sim": 118.22839750270668,
                        "Call_Chg": 35.12108498988703,
                        "Put_Now": 18.250690474540306,
                        "Put_Sim": 9.98097655255367,
                        "Put_Chg": -45.31178660622664
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.11698984645545,
                        "Call_Sim": 80.01177161056467,
                        "Call_Chg": 45.16716503107469,
                        "Put_Now": 35.79026677178126,
                        "Put_Sim": 21.685048535889564,
                        "Put_Chg": -39.41076585384079
                    },
                    {
                        "Strike": 5275.0,
                        "Call_Now": 42.13758159212557,
                        "Call_Sim": 63.6993144187968,
                        "Call_Chg": 51.169839397476395,
                        "Put_Now": 47.771207455191416,
                        "Put_Sim": 30.332940281862875,
                        "Put_Chg": -36.50371866711835
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.352457116964615,
                        "Call_Sim": 49.498365800486226,
                        "Call_Chg": 57.87715015708601,
                        "Put_Now": 61.946431917771406,
                        "Put_Sim": 41.09234060129211,
                        "Put_Chg": -33.66471751619419
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.911545805507103,
                        "Call_Sim": 27.615173491008136,
                        "Call_Chg": 73.5543097355778,
                        "Put_Now": 96.42621848179215,
                        "Put_Sim": 69.12984616729318,
                        "Put_Chg": -28.30803980937327
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.136702017202424,
                        "Call_Sim": 13.738143884543888,
                        "Call_Chg": 92.49989492946797,
                        "Put_Now": 137.5720725689671,
                        "Put_Sim": 105.17351443630832,
                        "Put_Chg": -23.550243539739395
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 2.8094935021127867,
                        "Call_Sim": 6.041510082429454,
                        "Call_Chg": 115.03911925356425,
                        "Put_Now": 183.16556192935604,
                        "Put_Sim": 147.3975785096727,
                        "Put_Chg": -19.527679244354054
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.9662299564734553,
                        "Call_Sim": 2.3338458038787735,
                        "Call_Chg": 141.54144551643176,
                        "Put_Now": 231.24299625919593,
                        "Put_Sim": 193.61061210660137,
                        "Put_Chg": -16.273956297648528
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 0.2894893494761064,
                        "Call_Sim": 0.7886699023477348,
                        "Call_Chg": 172.43485944301705,
                        "Put_Now": 280.48695352767754,
                        "Put_Sim": 241.98613408054916,
                        "Put_Chg": -13.726420770344044
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5200.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 269.1831441481527,
                        "Call_Sim": 209.10766571555178,
                        "Call_Chg": -22.317696980141015,
                        "Put_Now": 0.2529316960829746,
                        "Put_Sim": 1.1774532634816524,
                        "Put_Chg": 365.52222663915836
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.23693554894908,
                        "Call_Sim": 79.15709379206828,
                        "Call_Chg": -37.787645190797676,
                        "Put_Now": 8.068816723315877,
                        "Put_Sim": 20.988974966435535,
                        "Put_Chg": 160.12457199313016
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.49811142469389,
                        "Call_Sim": 48.56443437028838,
                        "Call_Chg": -44.49659132119001,
                        "Put_Now": 18.250690474540306,
                        "Put_Sim": 40.31701342013548,
                        "Put_Chg": 120.9067841919607
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.11698984645545,
                        "Call_Sim": 26.76254567497199,
                        "Call_Chg": -51.44410870490766,
                        "Put_Now": 35.79026677178126,
                        "Put_Sim": 68.4358226002978,
                        "Put_Chg": 91.2135023655533
                    },
                    {
                        "Strike": 5275.0,
                        "Call_Now": 42.13758159212557,
                        "Call_Sim": 19.010186233203058,
                        "Call_Chg": -54.88543595782542,
                        "Put_Now": 47.771207455191416,
                        "Put_Sim": 85.64381209626981,
                        "Put_Chg": 79.2791446115367
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.352457116964615,
                        "Call_Sim": 13.090137291352903,
                        "Call_Chg": -58.24844846284819,
                        "Put_Now": 61.946431917771406,
                        "Put_Sim": 104.6841120921581,
                        "Put_Chg": 68.9913508353755
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.911545805507103,
                        "Call_Sim": 5.631099847377868,
                        "Call_Chg": -64.60997620087356,
                        "Put_Now": 96.42621848179215,
                        "Put_Sim": 147.14577252366234,
                        "Put_Chg": 52.59933951619954
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.136702017202424,
                        "Call_Sim": 2.1165856333786053,
                        "Call_Chg": -70.34224452307589,
                        "Put_Now": 137.5720725689671,
                        "Put_Sim": 193.55195618514335,
                        "Put_Chg": 40.691313702577716
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 2.8094935021127867,
                        "Call_Sim": 0.6921665003164037,
                        "Call_Chg": -75.36329947743667,
                        "Put_Now": 183.16556192935604,
                        "Put_Sim": 242.04823492755895,
                        "Put_Chg": 32.147240113244095
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.9662299564734553,
                        "Call_Sim": 0.19644713558304616,
                        "Call_Chg": -79.66869747031663,
                        "Put_Now": 231.24299625919593,
                        "Put_Sim": 291.4732134383057,
                        "Put_Chg": 26.046288170215053
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 0.2894893494761064,
                        "Call_Sim": 0.048337406337746636,
                        "Call_Chg": -83.3025268718094,
                        "Put_Now": 280.48695352767754,
                        "Put_Sim": 341.24580158453864,
                        "Put_Chg": 21.661915926105852
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5438.959365657862,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 269.1831441481527,
                        "Call_Sim": 446.89033961668883,
                        "Call_Chg": 66.01720773821184,
                        "Put_Now": 0.2529316960829746,
                        "Put_Sim": 0.0007615067573476242,
                        "Put_Chg": -99.69892790459214
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.23693554894908,
                        "Call_Sim": 297.27906950532724,
                        "Call_Chg": 133.64211675073042,
                        "Put_Now": 8.068816723315877,
                        "Put_Sim": 0.15158502183271239,
                        "Put_Chg": -98.12134756519269
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.49811142469389,
                        "Call_Sim": 247.8017574718624,
                        "Call_Chg": 183.20812122343398,
                        "Put_Now": 18.250690474540306,
                        "Put_Sim": 0.594970863847891,
                        "Put_Chg": -96.74000901676638
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.11698984645545,
                        "Call_Sim": 199.2352757433382,
                        "Call_Chg": 261.4770623329876,
                        "Put_Now": 35.79026677178126,
                        "Put_Sim": 1.949187010802774,
                        "Put_Chg": -94.55386286100665
                    },
                    {
                        "Strike": 5275.0,
                        "Call_Now": 42.13758159212557,
                        "Call_Sim": 175.63481028452406,
                        "Call_Chg": 316.81274446311767,
                        "Put_Now": 47.771207455191416,
                        "Put_Sim": 3.309070489729038,
                        "Put_Chg": -93.07308593187038
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.352457116964615,
                        "Call_Sim": 152.7594973235373,
                        "Call_Chg": 387.2329360140647,
                        "Put_Now": 61.946431917771406,
                        "Put_Sim": 5.394106466481503,
                        "Put_Chg": -91.292304819684
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.911545805507103,
                        "Call_Sim": 110.21959474977302,
                        "Call_Chg": 592.7019919813523,
                        "Put_Now": 96.42621848179215,
                        "Put_Sim": 12.774901768195832,
                        "Put_Chg": -86.75163044933876
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.136702017202424,
                        "Call_Sim": 73.78848453248611,
                        "Call_Chg": 933.9297388993562,
                        "Put_Now": 137.5720725689671,
                        "Put_Sim": 26.26448942638831,
                        "Put_Chg": -80.90856019253363
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 2.8094935021127867,
                        "Call_Sim": 45.21377133585247,
                        "Call_Chg": 1509.3210858772568,
                        "Put_Now": 183.16556192935604,
                        "Put_Sim": 47.61047410523361,
                        "Put_Chg": -74.00686373369892
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.9662299564734553,
                        "Call_Sim": 25.052191326838056,
                        "Call_Chg": 2492.777336181286,
                        "Put_Now": 231.24299625919593,
                        "Put_Sim": 77.36959197169926,
                        "Put_Chg": -66.54186581937506
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 0.2894893494761064,
                        "Call_Sim": 12.427607811117923,
                        "Call_Chg": 4192.941289069311,
                        "Put_Now": 280.48695352767754,
                        "Put_Sim": 114.66570633145784,
                        "Put_Chg": -59.119058876247166
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5313.61,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 269.1831441481527,
                        "Call_Sim": 321.59598020753765,
                        "Call_Chg": 19.47106912108065,
                        "Put_Now": 0.2529316960829746,
                        "Put_Sim": 0.05576775546870216,
                        "Put_Chg": -77.95145632898162
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.23693554894908,
                        "Call_Sim": 174.78687567638644,
                        "Call_Chg": 37.371176790991264,
                        "Put_Now": 8.068816723315877,
                        "Put_Sim": 3.008756850754253,
                        "Put_Chg": -62.71130013326408
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.49811142469389,
                        "Call_Sim": 129.79300449414768,
                        "Call_Chg": 48.338063965935206,
                        "Put_Now": 18.250690474540306,
                        "Put_Sim": 7.935583543994994,
                        "Put_Chg": -56.51899551381289
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.11698984645545,
                        "Call_Sim": 89.83413718781594,
                        "Call_Chg": 62.988104825889955,
                        "Put_Now": 35.79026677178126,
                        "Put_Sim": 17.897414113142077,
                        "Put_Chg": -49.99362752095146
                    },
                    {
                        "Strike": 5275.0,
                        "Call_Now": 42.13758159212557,
                        "Call_Sim": 72.44729537520607,
                        "Call_Chg": 71.93035916599591,
                        "Put_Now": 47.771207455191416,
                        "Put_Sim": 25.470921238272467,
                        "Put_Chg": -46.681437218927826
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.352457116964615,
                        "Call_Sim": 57.08706665840782,
                        "Call_Chg": 82.08163540559752,
                        "Put_Now": 61.946431917771406,
                        "Put_Sim": 35.07104145921403,
                        "Put_Chg": -43.38488856667671
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.911545805507103,
                        "Call_Sim": 32.846267310121675,
                        "Call_Chg": 106.43039784829291,
                        "Put_Now": 96.42621848179215,
                        "Put_Sim": 60.75093998640705,
                        "Put_Chg": -36.99748787942104
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.136702017202424,
                        "Call_Sim": 16.909795867690946,
                        "Call_Chg": 136.94131865014535,
                        "Put_Now": 137.5720725689671,
                        "Put_Sim": 94.73516641945525,
                        "Put_Chg": -31.137792249249575
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 2.8094935021127867,
                        "Call_Sim": 7.7167348535771225,
                        "Call_Chg": 174.6664068727693,
                        "Put_Now": 183.16556192935604,
                        "Put_Sim": 135.46280328082048,
                        "Put_Chg": -26.043519396366516
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.9662299564734553,
                        "Call_Sim": 3.100163841749975,
                        "Call_Chg": 220.8515551582512,
                        "Put_Now": 231.24299625919593,
                        "Put_Sim": 180.766930144473,
                        "Put_Chg": -21.828149146686044
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 0.2894893494761064,
                        "Call_Sim": 1.091326943017549,
                        "Call_Chg": 276.98345206569473,
                        "Put_Now": 280.48695352767754,
                        "Put_Sim": 228.67879112121955,
                        "Put_Chg": -18.47079222575881
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5208.39,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 269.1831441481527,
                        "Call_Sim": 217.28624011475495,
                        "Call_Chg": -19.279403321344216,
                        "Put_Now": 0.2529316960829746,
                        "Put_Sim": 0.9660276626847661,
                        "Put_Chg": 281.9322282043526
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.23693554894908,
                        "Call_Sim": 85.1739920105988,
                        "Call_Chg": -33.05875244234276,
                        "Put_Now": 8.068816723315877,
                        "Put_Sim": 18.615873184966176,
                        "Put_Chg": 130.71379389710555
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.49811142469389,
                        "Call_Sim": 53.16880529617856,
                        "Call_Chg": -39.234339541215334,
                        "Put_Now": 18.250690474540306,
                        "Put_Sim": 36.53138434602488,
                        "Put_Chg": 100.16439595524412
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.11698984645545,
                        "Call_Sim": 29.889049072531634,
                        "Call_Chg": -45.771622950026206,
                        "Put_Now": 35.79026677178126,
                        "Put_Sim": 63.172325997857115,
                        "Put_Chg": 76.50699951659809
                    },
                    {
                        "Strike": 5275.0,
                        "Call_Now": 42.13758159212557,
                        "Call_Sim": 21.461687226586946,
                        "Call_Chg": -49.067586663308695,
                        "Put_Now": 47.771207455191416,
                        "Put_Sim": 79.70531308965246,
                        "Put_Chg": 66.84801857774832
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.352457116964615,
                        "Call_Sim": 14.946184100654136,
                        "Call_Chg": -52.328507954271785,
                        "Put_Now": 61.946431917771406,
                        "Put_Sim": 98.15015890145924,
                        "Put_Chg": 58.443603389046174
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.911545805507103,
                        "Call_Sim": 6.584958154265905,
                        "Call_Chg": -58.61522045213984,
                        "Put_Now": 96.42621848179215,
                        "Put_Sim": 139.70963083055085,
                        "Put_Chg": 44.88759699410153
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.136702017202424,
                        "Call_Sim": 2.538462936038286,
                        "Call_Chg": -64.43086834900024,
                        "Put_Now": 137.5720725689671,
                        "Put_Sim": 185.5838334878017,
                        "Put_Chg": 34.89935131620959
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 2.8094935021127867,
                        "Call_Sim": 0.8522679867085685,
                        "Call_Chg": -69.6647105228167,
                        "Put_Now": 183.16556192935604,
                        "Put_Sim": 233.81833641395224,
                        "Put_Chg": 27.65409280601128
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.9662299564734553,
                        "Call_Sim": 0.248529801390184,
                        "Call_Chg": -74.27840032022318,
                        "Put_Now": 231.24299625919593,
                        "Put_Sim": 283.13529610411297,
                        "Put_Chg": 22.44059309227767
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 0.2894893494761064,
                        "Call_Sim": 0.06286746636332552,
                        "Call_Chg": -78.28332321133824,
                        "Put_Now": 280.48695352767754,
                        "Put_Sim": 332.87033164456443,
                        "Put_Chg": 18.675869753677464
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
                        "Call_Now": 269.1831441481527,
                        "Call_Sim": 308.014046430525,
                        "Call_Chg": 14.425458326989684,
                        "Put_Now": 0.2529316960829746,
                        "Put_Sim": 0.08383397845452478,
                        "Put_Chg": -66.85509180825525
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.23693554894908,
                        "Call_Sim": 162.10956478923345,
                        "Call_Chg": 27.4076305672016,
                        "Put_Now": 8.068816723315877,
                        "Put_Sim": 3.9414459636006427,
                        "Put_Chg": -51.15211934097683
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.49811142469389,
                        "Call_Sim": 118.22839750270668,
                        "Call_Chg": 35.12108498988703,
                        "Put_Now": 18.250690474540306,
                        "Put_Sim": 9.98097655255367,
                        "Put_Chg": -45.31178660622664
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.11698984645545,
                        "Call_Sim": 80.01177161056467,
                        "Call_Chg": 45.16716503107469,
                        "Put_Now": 35.79026677178126,
                        "Put_Sim": 21.685048535889564,
                        "Put_Chg": -39.41076585384079
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.352457116964615,
                        "Call_Sim": 49.498365800486226,
                        "Call_Chg": 57.87715015708601,
                        "Put_Now": 61.946431917771406,
                        "Put_Sim": 41.09234060129211,
                        "Put_Chg": -33.66471751619419
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.911545805507103,
                        "Call_Sim": 27.615173491008136,
                        "Call_Chg": 73.5543097355778,
                        "Put_Now": 96.42621848179215,
                        "Put_Sim": 69.12984616729318,
                        "Put_Chg": -28.30803980937327
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.136702017202424,
                        "Call_Sim": 13.738143884543888,
                        "Call_Chg": 92.49989492946797,
                        "Put_Now": 137.5720725689671,
                        "Put_Sim": 105.17351443630832,
                        "Put_Chg": -23.550243539739395
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5200.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 269.1831441481527,
                        "Call_Sim": 209.10766571555178,
                        "Call_Chg": -22.317696980141015,
                        "Put_Now": 0.2529316960829746,
                        "Put_Sim": 1.1774532634816524,
                        "Put_Chg": 365.52222663915836
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.23693554894908,
                        "Call_Sim": 79.15709379206828,
                        "Call_Chg": -37.787645190797676,
                        "Put_Now": 8.068816723315877,
                        "Put_Sim": 20.988974966435535,
                        "Put_Chg": 160.12457199313016
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.49811142469389,
                        "Call_Sim": 48.56443437028838,
                        "Call_Chg": -44.49659132119001,
                        "Put_Now": 18.250690474540306,
                        "Put_Sim": 40.31701342013548,
                        "Put_Chg": 120.9067841919607
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.11698984645545,
                        "Call_Sim": 26.76254567497199,
                        "Call_Chg": -51.44410870490766,
                        "Put_Now": 35.79026677178126,
                        "Put_Sim": 68.4358226002978,
                        "Put_Chg": 91.2135023655533
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.352457116964615,
                        "Call_Sim": 13.090137291352903,
                        "Call_Chg": -58.24844846284819,
                        "Put_Now": 61.946431917771406,
                        "Put_Sim": 104.6841120921581,
                        "Put_Chg": 68.9913508353755
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.911545805507103,
                        "Call_Sim": 5.631099847377868,
                        "Call_Chg": -64.60997620087356,
                        "Put_Now": 96.42621848179215,
                        "Put_Sim": 147.14577252366234,
                        "Put_Chg": 52.59933951619954
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.136702017202424,
                        "Call_Sim": 2.1165856333786053,
                        "Call_Chg": -70.34224452307589,
                        "Put_Now": 137.5720725689671,
                        "Put_Sim": 193.55195618514335,
                        "Put_Chg": 40.691313702577716
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5000.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 269.1831441481527,
                        "Call_Sim": 46.69657150989224,
                        "Call_Chg": -82.65249049762514,
                        "Put_Now": 0.2529316960829746,
                        "Put_Sim": 38.76635905782268,
                        "Put_Chg": 15226.809434395807
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.23693554894908,
                        "Call_Sim": 4.849583470850121,
                        "Call_Chg": -96.18854112610686,
                        "Put_Now": 8.068816723315877,
                        "Put_Sim": 146.6814646452176,
                        "Put_Chg": 1717.88073363177
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.49811142469389,
                        "Call_Sim": 1.7180437829331652,
                        "Call_Chg": -98.03647901085063,
                        "Put_Now": 18.250690474540306,
                        "Put_Sim": 193.47062283278046,
                        "Put_Chg": 960.072894790867
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.11698984645545,
                        "Call_Sim": 0.5232748846903377,
                        "Call_Chg": -99.05061055375471,
                        "Put_Now": 35.79026677178126,
                        "Put_Sim": 242.19655181001508,
                        "Put_Chg": 576.7106636963497
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.352457116964615,
                        "Call_Sim": 0.13668536678060406,
                        "Call_Chg": -99.56403618934657,
                        "Put_Now": 61.946431917771406,
                        "Put_Sim": 291.7306601675864,
                        "Put_Chg": 370.9402158220088
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.911545805507103,
                        "Call_Sim": 0.03059301231920486,
                        "Call_Chg": -99.80773073406472,
                        "Put_Now": 96.42621848179215,
                        "Put_Sim": 341.54526568860365,
                        "Put_Chg": 254.2037332440829
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.136702017202424,
                        "Call_Sim": 0.0058688178105916755,
                        "Call_Chg": -99.91776568789832,
                        "Put_Now": 137.5720725689671,
                        "Put_Sim": 391.44123936957476,
                        "Put_Chg": 184.53539447356874
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5313.61,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 269.1831441481527,
                        "Call_Sim": 321.59598020753765,
                        "Call_Chg": 19.47106912108065,
                        "Put_Now": 0.2529316960829746,
                        "Put_Sim": 0.05576775546870216,
                        "Put_Chg": -77.95145632898162
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.23693554894908,
                        "Call_Sim": 174.78687567638644,
                        "Call_Chg": 37.371176790991264,
                        "Put_Now": 8.068816723315877,
                        "Put_Sim": 3.008756850754253,
                        "Put_Chg": -62.71130013326408
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.49811142469389,
                        "Call_Sim": 129.79300449414768,
                        "Call_Chg": 48.338063965935206,
                        "Put_Now": 18.250690474540306,
                        "Put_Sim": 7.935583543994994,
                        "Put_Chg": -56.51899551381289
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.11698984645545,
                        "Call_Sim": 89.83413718781594,
                        "Call_Chg": 62.988104825889955,
                        "Put_Now": 35.79026677178126,
                        "Put_Sim": 17.897414113142077,
                        "Put_Chg": -49.99362752095146
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.352457116964615,
                        "Call_Sim": 57.08706665840782,
                        "Call_Chg": 82.08163540559752,
                        "Put_Now": 61.946431917771406,
                        "Put_Sim": 35.07104145921403,
                        "Put_Chg": -43.38488856667671
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.911545805507103,
                        "Call_Sim": 32.846267310121675,
                        "Call_Chg": 106.43039784829291,
                        "Put_Now": 96.42621848179215,
                        "Put_Sim": 60.75093998640705,
                        "Put_Chg": -36.99748787942104
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.136702017202424,
                        "Call_Sim": 16.909795867690946,
                        "Call_Chg": 136.94131865014535,
                        "Put_Now": 137.5720725689671,
                        "Put_Sim": 94.73516641945525,
                        "Put_Chg": -31.137792249249575
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5208.39,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 269.1831441481527,
                        "Call_Sim": 217.28624011475495,
                        "Call_Chg": -19.279403321344216,
                        "Put_Now": 0.2529316960829746,
                        "Put_Sim": 0.9660276626847661,
                        "Put_Chg": 281.9322282043526
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.23693554894908,
                        "Call_Sim": 85.1739920105988,
                        "Call_Chg": -33.05875244234276,
                        "Put_Now": 8.068816723315877,
                        "Put_Sim": 18.615873184966176,
                        "Put_Chg": 130.71379389710555
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.49811142469389,
                        "Call_Sim": 53.16880529617856,
                        "Call_Chg": -39.234339541215334,
                        "Put_Now": 18.250690474540306,
                        "Put_Sim": 36.53138434602488,
                        "Put_Chg": 100.16439595524412
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.11698984645545,
                        "Call_Sim": 29.889049072531634,
                        "Call_Chg": -45.771622950026206,
                        "Put_Now": 35.79026677178126,
                        "Put_Sim": 63.172325997857115,
                        "Put_Chg": 76.50699951659809
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.352457116964615,
                        "Call_Sim": 14.946184100654136,
                        "Call_Chg": -52.328507954271785,
                        "Put_Now": 61.946431917771406,
                        "Put_Sim": 98.15015890145924,
                        "Put_Chg": 58.443603389046174
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.911545805507103,
                        "Call_Sim": 6.584958154265905,
                        "Call_Chg": -58.61522045213984,
                        "Put_Now": 96.42621848179215,
                        "Put_Sim": 139.70963083055085,
                        "Put_Chg": 44.88759699410153
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.136702017202424,
                        "Call_Sim": 2.538462936038286,
                        "Call_Chg": -64.43086834900024,
                        "Put_Now": 137.5720725689671,
                        "Put_Sim": 185.5838334878017,
                        "Put_Chg": 34.89935131620959
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.0001926242647431621,
            -0.3089940768694415,
            -0.22515920401632367,
            -0.1583159595909658,
            0.02227895807687879,
            -0.0012482495261850607,
            0.635740978199609,
            0.3750189810698151,
            0.7727345267492299,
            0.5947985136606355,
            0.15167419868788062,
            0.045969497777853,
            0.33382581914914816,
            0.004867345917032685,
            0.007641521920559337,
            0.06388336104391763
        ],
        "flip_variations": {
            "Classic": 5438.959365657862,
            "Spline": 5433.741503072518,
            "HVL": 4500.0,
            "HVL Log": 4500.0,
            "Sigma Kernel": 4500.0,
            "PVOP": 5438.959365657862,
            "HVL Gaussian": 5465.920436155906
        }
    },
    "delta_data": {
        "strikes": [
            4500.0,
            5000.0,
            5150.0,
            5200.0,
            5250.0,
            5275.0,
            5300.0,
            5350.0,
            5400.0,
            5450.0,
            5500.0,
            5550.0,
            5600.0,
            5650.0,
            5800.0,
            5850.0
        ],
        "delta_values": [
            -0.333269146675953,
            -1333.2785073808313,
            -688.2663784881422,
            -1292.6999852745498,
            -1702.8390156256205,
            -52.90703825610269,
            1970.2967341428691,
            654.7907889729659,
            2924.250899689334,
            320.18212236706137,
            445.5233151591508,
            85.69800875454135,
            2301.557158999519,
            1.1482506853514516,
            43.503736830125874,
            209.43329234527081
        ],
        "delta_cumulative": [
            -0.333269146675953,
            -1333.6117765275073,
            -2021.8781550156496,
            -3314.5781402901994,
            -5017.41715591582,
            -5070.324194171923,
            -3100.027460029054,
            -2445.236671056088,
            479.0142286332457,
            799.196351000307,
            1244.7196661594578,
            1330.4176749139992,
            3631.974833913518,
            3633.1230845988694,
            3676.6268214289953,
            3886.060113774266
        ]
    },
    "gamma_data": {
        "strikes": [
            4500.0,
            5000.0,
            5150.0,
            5200.0,
            5250.0,
            5275.0,
            5300.0,
            5350.0,
            5400.0,
            5450.0,
            5500.0,
            5550.0,
            5600.0,
            5650.0,
            5800.0,
            5850.0
        ],
        "gamma_values": [
            4138.277293098972,
            16891878.963451862,
            23983371.44428504,
            39969959.16265633,
            36204968.32314579,
            551255.1731820066,
            44730070.18214376,
            19756938.342347234,
            32998013.68418348,
            24407531.369980127,
            5949978.270532597,
            1684681.149535659,
            9763149.942423305,
            94459.16772234466,
            189781.12537922905,
            1640228.2255045723
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            171683.68767563417,
            0.0,
            0.0,
            44730070.18214376,
            19756938.342347234,
            32998013.68418348,
            22467017.979373116,
            5949978.270532597,
            1684681.149535659,
            9763149.942423305,
            94459.16772234466,
            189781.12537922905,
            1640228.2255045723
        ],
        "gamma_put": [
            4138.277293098972,
            16891878.963451862,
            23983371.44428504,
            39798275.4749807,
            36204968.32314579,
            551255.1731820066,
            0.0,
            0.0,
            0.0,
            1940513.3906070087,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            4138.277293098972,
            16896017.24074496,
            40879388.68503,
            80849347.84768632,
            117054316.17083211,
            117605571.34401412,
            162335641.5261579,
            182092579.86850512,
            215090593.5526886,
            239498124.92266873,
            245448103.19320133,
            247132784.342737,
            256895934.2851603,
            256990393.45288265,
            257180174.57826188,
            258820402.80376646
        ]
    },
    "oi_data": {
        "strikes": [
            4500.0,
            5000.0,
            5150.0,
            5200.0,
            5250.0,
            5275.0,
            5300.0,
            5350.0,
            5400.0,
            5450.0,
            5500.0,
            5550.0,
            5600.0,
            5650.0,
            5800.0,
            5850.0
        ],
        "call_oi": [
            0.0,
            0.0,
            0.0,
            120.0,
            0.0,
            0.0,
            4960.0,
            2705.0,
            8880.0,
            7560.0,
            1980.0,
            660.0,
            5300.0,
            2000.0,
            120.0,
            1040.0
        ],
        "put_oi": [
            15.0,
            11045.0,
            4730.0,
            5215.0,
            4000.0,
            115.0,
            0.0,
            0.0,
            0.0,
            800.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_oi": [
            15.0,
            11045.0,
            4730.0,
            5335.0,
            4000.0,
            115.0,
            4960.0,
            2705.0,
            8880.0,
            8360.0,
            1980.0,
            660.0,
            5300.0,
            2000.0,
            120.0,
            1040.0
        ]
    },
    "oi_data_nearest": {
        "strikes": [
            5000.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0,
            5450.0,
            5650.0
        ],
        "call_oi": [
            0.0,
            0.0,
            0.0,
            0.0,
            4960.0,
            2705.0,
            3180.0,
            5900.0,
            2000.0
        ],
        "put_oi": [
            2145.0,
            4530.0,
            5200.0,
            3935.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_oi": [
            2145.0,
            4530.0,
            5200.0,
            3935.0,
            4960.0,
            2705.0,
            3180.0,
            5900.0,
            2000.0
        ]
    },
    "gex_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 8,
            "abs_call": 96320162.15153477,
            "abs_put": 100361861.03389713,
            "net": 196682023.1854319
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 30,
            "abs_call": 13544762.150596045,
            "abs_put": 551255.1731820066,
            "net": 14096017.323778052
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 51,
            "abs_call": 237029.4334672841,
            "abs_put": 0.0,
            "net": 237029.4334672841
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 73,
            "abs_call": 17414322.162508838,
            "abs_put": 15932284.11443537,
            "net": 33346606.276944205
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 96,
            "abs_call": 0.0,
            "abs_put": 454685.1780565172,
            "net": 454685.1780565172
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 117,
            "abs_call": 0.0,
            "abs_put": 1940513.3906070087,
            "net": 1940513.3906070087
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 139,
            "abs_call": 1640228.2255045723,
            "abs_put": 0.0,
            "net": 1640228.2255045723
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 161,
            "abs_call": 0.0,
            "abs_put": 31631.539685081225,
            "net": 31631.539685081225
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 182,
            "abs_call": 957210.2060236018,
            "abs_put": 0.0,
            "net": 957210.2060236018
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 205,
            "abs_call": 8568910.302932419,
            "abs_put": 0.0,
            "net": 8568910.302932419
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 226,
            "abs_call": 0.0,
            "abs_put": 102170.61708238776,
            "net": 102170.61708238776
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 246,
            "abs_call": 763377.1242534084,
            "abs_put": 0.0,
            "net": 763377.1242534084
        }
    ],
    "oi_by_expiry": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 8,
            "call_oi": 18745.0,
            "put_oi": 15810.0,
            "total_oi": 34555.0
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 30,
            "call_oi": 4060.0,
            "put_oi": 115.0,
            "total_oi": 4175.0
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 51,
            "call_oi": 100.0,
            "put_oi": 0.0,
            "total_oi": 100.0
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 73,
            "call_oi": 5700.0,
            "put_oi": 8900.0,
            "total_oi": 14600.0
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 96,
            "call_oi": 0.0,
            "put_oi": 200.0,
            "total_oi": 200.0
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 117,
            "call_oi": 0.0,
            "put_oi": 800.0,
            "total_oi": 800.0
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 139,
            "call_oi": 1040.0,
            "put_oi": 0.0,
            "total_oi": 1040.0
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 161,
            "call_oi": 0.0,
            "put_oi": 30.0,
            "total_oi": 30.0
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 182,
            "call_oi": 500.0,
            "put_oi": 0.0,
            "total_oi": 500.0
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 205,
            "call_oi": 4700.0,
            "put_oi": 0.0,
            "total_oi": 4700.0
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 226,
            "call_oi": 0.0,
            "put_oi": 65.0,
            "total_oi": 65.0
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 246,
            "call_oi": 480.0,
            "put_oi": 0.0,
            "total_oi": 480.0
        }
    ],
    "volume_data": {
        "strikes": [
            4500.0,
            5000.0,
            5150.0,
            5200.0,
            5250.0,
            5275.0,
            5300.0,
            5350.0,
            5400.0,
            5450.0,
            5500.0,
            5550.0,
            5600.0,
            5650.0,
            5800.0,
            5850.0
        ],
        "call_volume": [
            0.0,
            0.0,
            0.0,
            120.0,
            0.0,
            0.0,
            3800.0,
            3805.0,
            4630.0,
            4000.0,
            290.0,
            200.0,
            1200.0,
            100.0,
            120.0,
            40.0
        ],
        "put_volume": [
            15.0,
            330.0,
            330.0,
            490.0,
            495.0,
            115.0,
            0.0,
            0.0,
            0.0,
            800.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_volume": [
            15.0,
            330.0,
            330.0,
            610.0,
            495.0,
            115.0,
            3800.0,
            3805.0,
            4630.0,
            4800.0,
            290.0,
            200.0,
            1200.0,
            100.0,
            120.0,
            40.0
        ]
    },
    "volatility_data": {
        "strikes": [
            4500.0,
            5000.0,
            5150.0,
            5200.0,
            5250.0,
            5275.0,
            5300.0,
            5350.0,
            5400.0,
            5450.0,
            5500.0,
            5550.0,
            5600.0,
            5650.0,
            5800.0,
            5850.0
        ],
        "iv_values": [
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0
        ],
        "skew": [
            0.0,
            0.0,
            -2.168404344971009e-19,
            0.0,
            4.336808689942018e-19,
            0.0,
            -3.2526065174565133e-19,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            1.3552527156068805e-19,
            -2.168404344971009e-19,
            0.0
        ]
    },
    "most_actives": {
        "top_oi": [
            {
                "strike": 5000.0,
                "type": "PUT",
                "oi": 8900,
                "volume": 200,
                "expiry": "2026-07-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5450.0,
                "type": "CALL",
                "oi": 5900,
                "volume": 3800,
                "expiry": "2026-04-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5400.0,
                "type": "CALL",
                "oi": 5700,
                "volume": 700,
                "expiry": "2026-07-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5200.0,
                "type": "PUT",
                "oi": 5200,
                "volume": 475,
                "expiry": "2026-04-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5300.0,
                "type": "CALL",
                "oi": 4960,
                "volume": 3800,
                "expiry": "2026-04-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5600.0,
                "type": "CALL",
                "oi": 4700,
                "volume": 600,
                "expiry": "2027-01-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5150.0,
                "type": "PUT",
                "oi": 4530,
                "volume": 130,
                "expiry": "2026-04-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5250.0,
                "type": "PUT",
                "oi": 3935,
                "volume": 475,
                "expiry": "2026-04-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5400.0,
                "type": "CALL",
                "oi": 3180,
                "volume": 3930,
                "expiry": "2026-04-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5350.0,
                "type": "CALL",
                "oi": 2705,
                "volume": 3805,
                "expiry": "2026-04-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5000.0,
                "type": "PUT",
                "oi": 2145,
                "volume": 130,
                "expiry": "2026-04-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5650.0,
                "type": "CALL",
                "oi": 2000,
                "volume": 100,
                "expiry": "2026-04-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5500.0,
                "type": "CALL",
                "oi": 1740,
                "volume": 50,
                "expiry": "2026-05-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5450.0,
                "type": "CALL",
                "oi": 1660,
                "volume": 200,
                "expiry": "2026-05-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5850.0,
                "type": "CALL",
                "oi": 1040,
                "volume": 40,
                "expiry": "2026-10-01 00:00:00",
                "iv": 12.0
            }
        ],
        "top_vol": [
            {
                "strike": 5400.0,
                "type": "CALL",
                "oi": 3180,
                "volume": 3930,
                "expiry": "2026-04-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5350.0,
                "type": "CALL",
                "oi": 2705,
                "volume": 3805,
                "expiry": "2026-04-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5300.0,
                "type": "CALL",
                "oi": 4960,
                "volume": 3800,
                "expiry": "2026-04-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5450.0,
                "type": "CALL",
                "oi": 5900,
                "volume": 3800,
                "expiry": "2026-04-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5450.0,
                "type": "PUT",
                "oi": 800,
                "volume": 800,
                "expiry": "2026-09-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5400.0,
                "type": "CALL",
                "oi": 5700,
                "volume": 700,
                "expiry": "2026-07-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5600.0,
                "type": "CALL",
                "oi": 4700,
                "volume": 600,
                "expiry": "2027-01-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5600.0,
                "type": "CALL",
                "oi": 500,
                "volume": 500,
                "expiry": "2026-12-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5200.0,
                "type": "PUT",
                "oi": 5200,
                "volume": 475,
                "expiry": "2026-04-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5250.0,
                "type": "PUT",
                "oi": 3935,
                "volume": 475,
                "expiry": "2026-04-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5500.0,
                "type": "CALL",
                "oi": 240,
                "volume": 240,
                "expiry": "2027-03-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5150.0,
                "type": "PUT",
                "oi": 200,
                "volume": 200,
                "expiry": "2026-08-03 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5000.0,
                "type": "PUT",
                "oi": 8900,
                "volume": 200,
                "expiry": "2026-07-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5550.0,
                "type": "CALL",
                "oi": 660,
                "volume": 200,
                "expiry": "2026-05-01 00:00:00",
                "iv": 12.0
            },
            {
                "strike": 5450.0,
                "type": "CALL",
                "oi": 1660,
                "volume": 200,
                "expiry": "2026-05-01 00:00:00",
                "iv": 12.0
            }
        ]
    },
    "fed_watch": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 11,
            "iv_atm": 0.12,
            "spot": 5261.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5371.7467332426895,
                    "lower": 5152.536479189502,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5484.824741703766,
                    "lower": 5046.309098912479,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5600.283099915583,
                    "lower": 4942.271757729035,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 41,
            "iv_atm": 0.12,
            "spot": 5261.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5476.902498269744,
                    "lower": 5053.608496544176,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5701.665268115065,
                    "lower": 4854.392479821989,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5935.651920022284,
                    "lower": 4663.029667665568,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 72,
            "iv_atm": 0.12,
            "spot": 5261.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5549.001012909745,
                    "lower": 4987.946647623038,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5852.76796070583,
                    "lower": 4729.06515102336,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 6173.163912237664,
                    "lower": 4483.619970811234,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 102,
            "iv_atm": 0.12,
            "spot": 5261.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5605.548958818069,
                    "lower": 4937.628982164119,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5972.662826403029,
                    "lower": 4634.134188463615,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 6363.819404659738,
                    "lower": 4349.293912981476,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 135,
            "iv_atm": 0.12,
            "spot": 5261.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5659.303112393764,
                    "lower": 4890.72955632743,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 6087.761208505939,
                    "lower": 4546.518835418115,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 6548.657280898628,
                    "lower": 4226.5337477245275,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 164,
            "iv_atm": 0.12,
            "spot": 5261.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5701.665268115065,
                    "lower": 4854.392479821989,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 6179.24098643407,
                    "lower": 4479.210482446737,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 6696.818801684892,
                    "lower": 4133.02521983069,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 194,
            "iv_atm": 0.12,
            "spot": 5261.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5741.994031645636,
                    "lower": 4820.297765455452,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 6266.963592369151,
                    "lower": 4416.512174045775,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 6839.929204319362,
                    "lower": 4046.550800923712,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 226,
            "iv_atm": 0.12,
            "spot": 5261.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5781.982206919578,
                    "lower": 4786.960597505169,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 6354.555833707393,
                    "lower": 4355.634244833121,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 6983.829835273358,
                    "lower": 3963.1723070063363,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 255,
            "iv_atm": 0.12,
            "spot": 5261.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5816.054086870132,
                    "lower": 4758.917401143838,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 6429.668340885527,
                    "lower": 4304.750965768792,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 7108.02106657038,
                    "lower": 3893.92782333926,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 286,
            "iv_atm": 0.12,
            "spot": 5261.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5850.598382430023,
                    "lower": 4730.818830962723,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 6506.2728440396895,
                    "lower": 4254.067061659666,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 7235.428507315528,
                    "lower": 3825.360304785746,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 317,
            "iv_atm": 0.12,
            "spot": 5261.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5883.5051523827315,
                    "lower": 4704.359099403657,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 6579.667910685068,
                    "lower": 4206.613673473102,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 7358.203773708975,
                    "lower": 3761.5322776048333,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 345,
            "iv_atm": 0.12,
            "spot": 5261.0,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5912.017460833369,
                    "lower": 4681.6710511031615,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 6643.594460596585,
                    "lower": 4166.136443782052,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 7465.699763114018,
                    "lower": 3707.3712951530715,
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
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            4500.0,
            5000.0,
            5150.0,
            5200.0,
            5250.0,
            5275.0,
            5300.0,
            5350.0,
            5400.0,
            5450.0,
            5500.0,
            5550.0,
            5600.0,
            5650.0,
            5800.0,
            5850.0
        ],
        "charm": [
            -0.7753238847946453,
            -3361.018116119887,
            -14522.552296885402,
            -12441.593949525917,
            -329.0544882125112,
            43.85077509599709,
            13063.850784185937,
            11633.273511369893,
            16273.73523096634,
            21315.684496344402,
            2429.526555270207,
            853.1532003011768,
            1372.1344345732143,
            221.64765264055328,
            29.817726638719847,
            409.388000337324
        ],
        "vanna": [
            -12.569845379846983,
            -17637.606292658304,
            -9174.087498400657,
            -8838.217407276514,
            -2161.3246125938576,
            -22.606740907649304,
            4520.705537591242,
            5092.0605524789635,
            10401.969413870978,
            12770.320620657407,
            3657.0538301129545,
            1356.0510129928193,
            4684.62492524782,
            115.81950652211248,
            177.21443965476436,
            2258.2935258494385
        ],
        "vex": [
            3338.293115312366,
            5865932.32286348,
            1161825.5474871793,
            1827956.2962475088,
            1562832.364928682,
            82861.52760315819,
            1792951.6131676824,
            791933.3532882956,
            6994199.122135475,
            2733918.9415137246,
            1329341.4999892549,
            253231.64364877436,
            9734991.330738263,
            3786.2832867600396,
            233919.87728814333,
            1142347.1014464363
        ],
        "theta": [
            -0.8833701851183677,
            -3639.067363258376,
            -6481.597123059746,
            -10637.432708695073,
            -9077.096600076535,
            -108.70782072317773,
            -15472.974981897596,
            -6614.463167396915,
            -12846.159825142233,
            -7625.514212569403,
            -2234.1256612169595,
            -594.0972877231723,
            -5157.406979621177,
            -29.588937147099866,
            -99.01840198138977,
            -701.2648534127403
        ],
        "charm_cum": [
            -0.7753238847946453,
            -3361.7934400046815,
            -17884.345736890085,
            -30325.939686416,
            -30654.99417462851,
            -30611.143399532513,
            -17547.292615346574,
            -5914.019103976681,
            10359.716126989659,
            31675.400623334062,
            34104.92717860427,
            34958.08037890544,
            36330.214813478655,
            36551.86246611921,
            36581.68019275793,
            36991.068193095256
        ],
        "vanna_cum": [
            -12.569845379846983,
            -17650.17613803815,
            -26824.26363643881,
            -35662.48104371532,
            -37823.80565630918,
            -37846.41239721683,
            -33325.706859625585,
            -28233.64630714662,
            -17831.676893275642,
            -5061.356272618235,
            -1404.3024425052809,
            -48.25142951246153,
            4636.373495735359,
            4752.193002257472,
            4929.407441912236,
            7187.700967761675
        ],
        "theta_cum": [
            -0.8833701851183677,
            -3639.9507334434948,
            -10121.54785650324,
            -20758.98056519831,
            -29836.077165274844,
            -29944.784985998023,
            -45417.75996789562,
            -52032.22313529253,
            -64878.38296043476,
            -72503.89717300417,
            -74738.02283422112,
            -75332.12012194429,
            -80489.52710156547,
            -80519.11603871257,
            -80618.13444069396,
            -81319.3992941067
        ],
        "r_gamma": [
            4138.277293098972,
            16891878.963451862,
            23983371.44428504,
            39969959.16265633,
            36204968.32314579,
            -551255.1731820066,
            -44730070.18214376,
            -19756938.342347234,
            -32998013.68418348,
            -24407531.369980127,
            -5949978.270532597,
            -1684681.149535659,
            -9763149.942423305,
            -94459.16772234466,
            -189781.12537922905,
            -1640228.2255045723
        ],
        "r_gamma_cum": [
            4138.277293098972,
            16896017.24074496,
            40879388.68503,
            80849347.84768632,
            117054316.17083211,
            116503060.9976501,
            71772990.81550634,
            52016052.473159105,
            19018038.788975626,
            -5389492.5810045,
            -11339470.851537097,
            -13024152.001072757,
            -22787301.943496063,
            -22881761.111218408,
            -23071542.23659764,
            -24711770.462102212
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.333269146675953,
            "gamma": 4138.277293098972,
            "volume": 15,
            "oi": 15,
            "iv": 12.0
        },
        {
            "strike": 5000.0,
            "delta": -1333.2785073808313,
            "gamma": 16891878.963451862,
            "volume": 330,
            "oi": 11045,
            "iv": 12.0
        },
        {
            "strike": 5150.0,
            "delta": -688.2663784881422,
            "gamma": 23983371.44428504,
            "volume": 330,
            "oi": 4730,
            "iv": 12.0
        },
        {
            "strike": 5200.0,
            "delta": -1292.6999852745498,
            "gamma": 39969959.16265633,
            "volume": 610,
            "oi": 5335,
            "iv": 12.0
        },
        {
            "strike": 5250.0,
            "delta": -1702.8390156256205,
            "gamma": 36204968.32314579,
            "volume": 495,
            "oi": 4000,
            "iv": 12.0
        },
        {
            "strike": 5275.0,
            "delta": -52.90703825610269,
            "gamma": 551255.1731820066,
            "volume": 115,
            "oi": 115,
            "iv": 12.0
        },
        {
            "strike": 5300.0,
            "delta": 1970.2967341428691,
            "gamma": 44730070.18214376,
            "volume": 3800,
            "oi": 4960,
            "iv": 12.0
        },
        {
            "strike": 5350.0,
            "delta": 654.7907889729659,
            "gamma": 19756938.342347234,
            "volume": 3805,
            "oi": 2705,
            "iv": 12.0
        },
        {
            "strike": 5400.0,
            "delta": 2924.250899689334,
            "gamma": 32998013.68418348,
            "volume": 4630,
            "oi": 8880,
            "iv": 12.0
        },
        {
            "strike": 5450.0,
            "delta": 320.18212236706137,
            "gamma": 24407531.369980127,
            "volume": 4800,
            "oi": 8360,
            "iv": 12.0
        },
        {
            "strike": 5500.0,
            "delta": 445.5233151591508,
            "gamma": 5949978.270532597,
            "volume": 290,
            "oi": 1980,
            "iv": 12.0
        },
        {
            "strike": 5550.0,
            "delta": 85.69800875454135,
            "gamma": 1684681.149535659,
            "volume": 200,
            "oi": 660,
            "iv": 12.0
        },
        {
            "strike": 5600.0,
            "delta": 2301.557158999519,
            "gamma": 9763149.942423305,
            "volume": 1200,
            "oi": 5300,
            "iv": 12.0
        },
        {
            "strike": 5650.0,
            "delta": 1.1482506853514516,
            "gamma": 94459.16772234466,
            "volume": 100,
            "oi": 2000,
            "iv": 12.0
        },
        {
            "strike": 5800.0,
            "delta": 43.503736830125874,
            "gamma": 189781.12537922905,
            "volume": 120,
            "oi": 120,
            "iv": 12.0
        },
        {
            "strike": 5850.0,
            "delta": 209.43329234527081,
            "gamma": 1640228.2255045723,
            "volume": 40,
            "oi": 1040,
            "iv": 12.0
        }
    ]
};