window.marketData = {
    "last_updated": "2026-03-20 07:57:24",
    "spot_price": 5260.975,
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-03-20",
        "meetings": [
            {
                "date": "2026-04-29",
                "days_remaining": 39,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 4.3,
                    "3.50-3.75": 87.1,
                    "3.75-4.00": 12.9
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 88,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.8,
                    "3.25-3.50": 1.7,
                    "3.50-3.75": 85.8,
                    "3.75-4.00": 14.0,
                    "4.00-4.25": 0.2
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
                    "3.50-3.75": 82.0,
                    "3.75-4.00": 17.2,
                    "4.00-4.25": 0.8,
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
                    "3.50-3.75": 79.2,
                    "3.75-4.00": 19.4,
                    "4.00-4.25": 1.4,
                    "4.25-4.50": 0.0,
                    "4.50-4.75": 0.0
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
                    "3.50-3.75": 75.5,
                    "3.75-4.00": 22.2,
                    "4.00-4.25": 2.2,
                    "4.25-4.50": 0.1,
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
                    "3.25-3.50": 7.6,
                    "3.50-3.75": 70.2,
                    "3.75-4.00": 20.2,
                    "4.00-4.25": 2.0,
                    "4.25-4.50": 0.1,
                    "4.50-4.75": 0.0,
                    "4.75-5.00": 14.75
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 20/03/2026 07:57\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(2);\n  spot(5260.98);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5439.02;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (5439.02)\n  // 2 = Spline (5433.81)\n  // 3 = HVL (4500.00)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (5439.02)\n  // 7 = HVL Gaussian (5466.04)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 5439.02;\n  if (ModeloFlip = 2) then GammaVal := 5433.81;\n  if (ModeloFlip = 3) then GammaVal := 4500.00;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 5439.02;\n  if (ModeloFlip = 7) then GammaVal := 5466.04;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5000.00 <= LimitUpper) and (5000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5176.72 <= LimitUpper) and (5176.72 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5176.72, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5221.21 <= LimitUpper) and (5221.21 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5221.21, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirMaxPain) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5275.00 <= LimitUpper) and (5275.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5275.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirRange) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5300.74 <= LimitUpper) and (5300.74 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.74, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5381.49 <= LimitUpper) and (5381.49 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5381.49, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5450.00 <= LimitUpper) and (5450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5450.00 <= LimitUpper) and (5450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5450.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5500.00 <= LimitUpper) and (5500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5550.00 <= LimitUpper) and (5550.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5550.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5650.00 <= LimitUpper) and (5650.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5650.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5800.00 <= LimitUpper) and (5800.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5800.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5850.00 <= LimitUpper) and (5850.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5850.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5221.00 > 0) then\n      HorizontalLineCustom(5221.00, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4750.00 <= LimitUpper) and (4750.00 >= LimitLower) then\n      HorizontalLineCustom(4750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5075.00 <= LimitUpper) and (5075.00 >= LimitLower) then\n      HorizontalLineCustom(5075.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5262.50 <= LimitUpper) and (5262.50 >= LimitLower) then\n      HorizontalLineCustom(5262.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5287.50 <= LimitUpper) and (5287.50 >= LimitLower) then\n      HorizontalLineCustom(5287.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5425.00 <= LimitUpper) and (5425.00 >= LimitLower) then\n      HorizontalLineCustom(5425.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5475.00 <= LimitUpper) and (5475.00 >= LimitLower) then\n      HorizontalLineCustom(5475.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5525.00 <= LimitUpper) and (5525.00 >= LimitLower) then\n      HorizontalLineCustom(5525.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5575.00 <= LimitUpper) and (5575.00 >= LimitLower) then\n      HorizontalLineCustom(5575.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5625.00 <= LimitUpper) and (5625.00 >= LimitLower) then\n      HorizontalLineCustom(5625.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5725.00 <= LimitUpper) and (5725.00 >= LimitLower) then\n      HorizontalLineCustom(5725.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5825.00 <= LimitUpper) and (5825.00 >= LimitLower) then\n      HorizontalLineCustom(5825.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4691.00 <= LimitUpper) and (4691.00 >= LimitLower) then\n      HorizontalLineCustom(4691.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4809.00 <= LimitUpper) and (4809.00 >= LimitLower) then\n      HorizontalLineCustom(4809.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5057.30 <= LimitUpper) and (5057.30 >= LimitLower) then\n      HorizontalLineCustom(5057.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5092.70 <= LimitUpper) and (5092.70 >= LimitLower) then\n      HorizontalLineCustom(5092.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5259.55 <= LimitUpper) and (5259.55 >= LimitLower) then\n      HorizontalLineCustom(5259.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5265.45 <= LimitUpper) and (5265.45 >= LimitLower) then\n      HorizontalLineCustom(5265.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5284.55 <= LimitUpper) and (5284.55 >= LimitLower) then\n      HorizontalLineCustom(5284.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5290.45 <= LimitUpper) and (5290.45 >= LimitLower) then\n      HorizontalLineCustom(5290.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5419.10 <= LimitUpper) and (5419.10 >= LimitLower) then\n      HorizontalLineCustom(5419.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5430.90 <= LimitUpper) and (5430.90 >= LimitLower) then\n      HorizontalLineCustom(5430.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5469.10 <= LimitUpper) and (5469.10 >= LimitLower) then\n      HorizontalLineCustom(5469.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5480.90 <= LimitUpper) and (5480.90 >= LimitLower) then\n      HorizontalLineCustom(5480.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5519.10 <= LimitUpper) and (5519.10 >= LimitLower) then\n      HorizontalLineCustom(5519.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5530.90 <= LimitUpper) and (5530.90 >= LimitLower) then\n      HorizontalLineCustom(5530.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5569.10 <= LimitUpper) and (5569.10 >= LimitLower) then\n      HorizontalLineCustom(5569.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5580.90 <= LimitUpper) and (5580.90 >= LimitLower) then\n      HorizontalLineCustom(5580.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5619.10 <= LimitUpper) and (5619.10 >= LimitLower) then\n      HorizontalLineCustom(5619.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5630.90 <= LimitUpper) and (5630.90 >= LimitLower) then\n      HorizontalLineCustom(5630.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5707.30 <= LimitUpper) and (5707.30 >= LimitLower) then\n      HorizontalLineCustom(5707.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5742.70 <= LimitUpper) and (5742.70 >= LimitLower) then\n      HorizontalLineCustom(5742.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5819.10 <= LimitUpper) and (5819.10 >= LimitLower) then\n      HorizontalLineCustom(5819.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5830.90 <= LimitUpper) and (5830.90 >= LimitLower) then\n      HorizontalLineCustom(5830.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4618.00 <= LimitUpper) and (4618.00 >= LimitLower) then\n      HorizontalLineCustom(4618.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4882.00 <= LimitUpper) and (4882.00 >= LimitLower) then\n      HorizontalLineCustom(4882.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5035.40 <= LimitUpper) and (5035.40 >= LimitLower) then\n      HorizontalLineCustom(5035.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5114.60 <= LimitUpper) and (5114.60 >= LimitLower) then\n      HorizontalLineCustom(5114.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5255.90 <= LimitUpper) and (5255.90 >= LimitLower) then\n      HorizontalLineCustom(5255.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5294.10 <= LimitUpper) and (5294.10 >= LimitLower) then\n      HorizontalLineCustom(5294.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5411.80 <= LimitUpper) and (5411.80 >= LimitLower) then\n      HorizontalLineCustom(5411.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5438.20 <= LimitUpper) and (5438.20 >= LimitLower) then\n      HorizontalLineCustom(5438.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5461.80 <= LimitUpper) and (5461.80 >= LimitLower) then\n      HorizontalLineCustom(5461.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5488.20 <= LimitUpper) and (5488.20 >= LimitLower) then\n      HorizontalLineCustom(5488.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5511.80 <= LimitUpper) and (5511.80 >= LimitLower) then\n      HorizontalLineCustom(5511.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5538.20 <= LimitUpper) and (5538.20 >= LimitLower) then\n      HorizontalLineCustom(5538.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5588.20 <= LimitUpper) and (5588.20 >= LimitLower) then\n      HorizontalLineCustom(5588.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5611.80 <= LimitUpper) and (5611.80 >= LimitLower) then\n      HorizontalLineCustom(5611.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5638.20 <= LimitUpper) and (5638.20 >= LimitLower) then\n      HorizontalLineCustom(5638.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5685.40 <= LimitUpper) and (5685.40 >= LimitLower) then\n      HorizontalLineCustom(5685.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5764.60 <= LimitUpper) and (5764.60 >= LimitLower) then\n      HorizontalLineCustom(5764.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5811.80 <= LimitUpper) and (5811.80 >= LimitLower) then\n      HorizontalLineCustom(5811.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5838.20 <= LimitUpper) and (5838.20 >= LimitLower) then\n      HorizontalLineCustom(5838.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5268.87, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5253.08, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5276.76, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5245.19, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5291.41, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5230.54, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5299.30, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5222.65, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "positive"
    },
    "overview": {
        "total_trades": 61245,
        "total_volume": 20880,
        "gamma_exposure": 258817943.27704376,
        "delta_position": 3883.6003172688206,
        "last_update": "2026-03-20T07:57:24.872657",
        "spot_price": 5260.975,
        "dealer_pressure": 0.05470684875494577,
        "regime": "Gamma Negativo"
    },
    "key_levels": {
        "gamma_flip": 5439.018839907983,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 5466.041649080601,
        "gamma_flip_selected": 5433.813506838207,
        "gamma_flip_model": "Spline",
        "call_wall": 5300.0,
        "put_wall": 5200.0,
        "effective_call_wall": 5381.491712707182,
        "effective_put_wall": 5176.72147995889,
        "max_pain": 5250.0,
        "zero_gamma": 5439.018839907983,
        "range_low": 5221.205767132205,
        "range_high": 5300.744232867795,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5300.744232867794,
                "sigma_1_down": 5221.205767132206,
                "sigma_2_up": 5340.513465735589,
                "sigma_2_down": 5181.436534264411
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5349.901708105407,
                "sigma_1_down": 5172.048291894594,
                "sigma_2_up": 5438.828416210815,
                "sigma_2_down": 5083.121583789186
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 8,
                "sigma_1_up": 5373.4593769736175,
                "sigma_1_down": 5148.490623026383,
                "sigma_2_up": 5485.943753947235,
                "sigma_2_down": 5036.006246052766
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
                5555.901951371728,
                5474.992908243675,
                5452.2174092089135,
                5447.747648198007,
                5445.814096306479,
                5444.365364244417,
                5443.263489676197,
                5442.414365071132,
                5441.752405678279,
                5441.231035786031,
                5440.816622630673,
                5440.4845150098,
                5440.216400937257,
                5439.998511443463,
                5439.820378590779,
                5439.673963361587
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
                4471.828750000001,
                4504.038801020409,
                4536.248852040817,
                4568.458903061225,
                4600.668954081633,
                4632.879005102041,
                4665.08905612245,
                4697.299107142858,
                4729.509158163266,
                4761.719209183674,
                4793.929260204082,
                4826.1393112244905,
                4858.349362244899,
                4890.559413265307,
                4922.769464285715,
                4954.979515306123,
                4987.189566326531,
                5019.3996173469395,
                5051.609668367348,
                5083.819719387755,
                5116.029770408164,
                5148.239821428571,
                5180.44987244898,
                5212.659923469388,
                5244.869974489797,
                5277.080025510204,
                5309.290076530612,
                5341.50012755102,
                5373.7101785714285,
                5405.920229591837,
                5438.130280612245,
                5470.340331632653,
                5502.550382653061,
                5534.760433673469,
                5566.970484693878,
                5599.180535714286,
                5631.390586734694,
                5663.600637755102,
                5695.81068877551,
                5728.020739795918,
                5760.230790816327,
                5792.440841836735,
                5824.650892857143,
                5856.860943877551,
                5889.070994897959,
                5921.281045918367,
                5953.491096938776,
                5985.701147959184,
                6017.911198979592,
                6050.12125
            ],
            "deltas": [
                -24913.234475352896,
                -24709.296506972423,
                -24474.937332641814,
                -24208.260763058996,
                -23907.711892020085,
                -23572.05740072542,
                -23200.229938092725,
                -22790.94246979918,
                -22341.99459031412,
                -21849.299129695875,
                -21305.854779710397,
                -20701.05973055208,
                -20020.68146954727,
                -19247.346330326833,
                -18360.837451905318,
                -17337.409404713755,
                -16148.215871565753,
                -14758.443673188936,
                -13129.595953505826,
                -11226.380728035949,
                -9026.981854197204,
                -6532.838161130611,
                -3773.474130679264,
                -804.0646563040975,
                2303.0505928862767,
                5469.037898801817,
                8617.33461274986,
                11678.453679579943,
                14591.517197787623,
                17304.87418940762,
                19777.856314000797,
                21983.929216623106,
                23913.620156118763,
                25574.99791144207,
                26990.527006934517,
                28191.027351396373,
                29208.934749220512,
                30073.20232452307,
                30807.09374325463,
                31428.62428903416,
                31952.39828439092,
                32391.463447257305,
                32758.34881246115,
                33065.17190210105,
                33323.17950643378,
                33542.19378367987,
                33730.2805815636,
                33893.729828834206,
                34037.27548517952,
                34164.42537890007
            ],
            "flip_value": 5220.9952961627605
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
                4471.828750000001,
                4504.038801020409,
                4536.248852040817,
                4568.458903061225,
                4600.668954081633,
                4632.879005102041,
                4665.08905612245,
                4697.299107142858,
                4729.509158163266,
                4761.719209183674,
                4793.929260204082,
                4826.1393112244905,
                4858.349362244899,
                4890.559413265307,
                4922.769464285715,
                4954.979515306123,
                4987.189566326531,
                5019.3996173469395,
                5051.609668367348,
                5083.819719387755,
                5116.029770408164,
                5148.239821428571,
                5180.44987244898,
                5212.659923469388,
                5244.869974489797,
                5277.080025510204,
                5309.290076530612,
                5341.50012755102,
                5373.7101785714285,
                5405.920229591837,
                5438.130280612245,
                5470.340331632653,
                5502.550382653061,
                5534.760433673469,
                5566.970484693878,
                5599.180535714286,
                5631.390586734694,
                5663.600637755102,
                5695.81068877551,
                5728.020739795918,
                5760.230790816327,
                5792.440841836735,
                5824.650892857143,
                5856.860943877551,
                5889.070994897959,
                5921.281045918367,
                5953.491096938776,
                5985.701147959184,
                6017.911198979592,
                6050.12125
            ],
            "pnl": [
                -16108686.117566328,
                -15265076.711666824,
                -14421531.25447319,
                -13578045.559400484,
                -12734616.567026548,
                -11891258.439421885,
                -11048040.921668177,
                -10205175.054608589,
                -9363184.512183866,
                -8523200.833816957,
                -7687387.474809062,
                -6859419.54579515,
                -6044845.599284265,
                -5251101.829291221,
                -4487017.110170076,
                -3761858.74262842,
                -3084228.185557855,
                -2461250.157814171,
                -1898385.1037049172,
                -1399880.109589464,
                -969556.5974216289,
                -611516.9356627909,
                -330484.6414516468,
                -131743.95693167788,
                -20826.702340331394,
                -3111.4175437894883,
                -83400.24843858927,
                -265447.88614423014,
                -551422.8899883295,
                -941373.1064101392,
                -1432854.9456058545,
                -2020885.2407944854,
                -2698270.026794577,
                -3456221.1810160764,
                -4285079.218181635,
                -5174966.823331937,
                -6116281.057655906,
                -7100026.777702506,
                -8118042.854674485,
                -9163164.2999808,
                -10229326.621444553,
                -11311592.76844348,
                -12406087.24554525,
                -13509848.37186263,
                -14620636.097839545,
                -15736741.779648896,
                -16856835.073979836,
                -17979861.177772593,
                -19104981.670409318,
                -20231542.07938936
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
                        "Call_Now": 269.15831557596175,
                        "Call_Sim": 308.014046430525,
                        "Call_Chg": 14.436013530333383,
                        "Put_Now": 0.25310312389153466,
                        "Put_Sim": 0.08383397845452478,
                        "Put_Chg": -66.87754099374484
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.21542522576419,
                        "Call_Sim": 162.10956478923345,
                        "Call_Chg": 27.429173389582278,
                        "Put_Now": 8.072306400131083,
                        "Put_Sim": 3.9414459636006427,
                        "Put_Chg": -51.17323639329846
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.4797178016156,
                        "Call_Sim": 118.22839750270668,
                        "Call_Chg": 35.149495761774396,
                        "Put_Now": 18.257296851462115,
                        "Put_Sim": 9.98097655255367,
                        "Put_Chg": -45.3315754585304
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.10267764815217,
                        "Call_Sim": 80.01177161056467,
                        "Call_Chg": 45.20487029952493,
                        "Put_Now": 35.800954573477156,
                        "Put_Sim": 21.685048535889564,
                        "Put_Chg": -39.42885379946055
                    },
                    {
                        "Strike": 5275.0,
                        "Call_Now": 42.12547521870192,
                        "Call_Sim": 63.6993144187968,
                        "Call_Chg": 51.21328385754806,
                        "Put_Now": 47.78410108176786,
                        "Put_Sim": 30.332940281862875,
                        "Put_Chg": -36.52085192529345
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.34252725717215,
                        "Call_Sim": 49.498365800486226,
                        "Call_Chg": 57.92716839437206,
                        "Put_Now": 61.96150205797767,
                        "Put_Sim": 41.09234060129211,
                        "Put_Chg": -33.68085143765267
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.905495002274847,
                        "Call_Sim": 27.615173491008136,
                        "Call_Chg": 73.62033364606721,
                        "Put_Now": 96.4451676785593,
                        "Put_Sim": 69.12984616729318,
                        "Put_Chg": -28.322125585705816
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.13349659397079,
                        "Call_Sim": 13.738143884543888,
                        "Call_Chg": 92.58639439395438,
                        "Put_Now": 137.5938671457352,
                        "Put_Sim": 105.17351443630832,
                        "Put_Chg": -23.562353019039893
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 2.8080264391441574,
                        "Call_Sim": 6.041510082429454,
                        "Call_Chg": 115.1514671731799,
                        "Put_Now": 183.18909486638677,
                        "Put_Sim": 147.3975785096727,
                        "Put_Chg": -19.5380169233433
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.9656517741612873,
                        "Call_Sim": 2.3338458038787735,
                        "Call_Chg": 141.6860680348074,
                        "Put_Now": 231.2674180768836,
                        "Put_Sim": 193.61061210660137,
                        "Put_Chg": -16.28279776002144
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 0.28929337639364405,
                        "Call_Sim": 0.7886699023477348,
                        "Call_Chg": 172.61941223105802,
                        "Put_Now": 280.5117575545946,
                        "Put_Sim": 241.98613408054916,
                        "Put_Chg": -13.734049442311669
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5200.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 269.15831557596175,
                        "Call_Sim": 209.10766571555178,
                        "Call_Chg": -22.31053115780943,
                        "Put_Now": 0.25310312389153466,
                        "Put_Sim": 1.1774532634816524,
                        "Put_Chg": 365.20692648038613
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.21542522576419,
                        "Call_Sim": 79.15709379206828,
                        "Call_Chg": -37.777125964409336,
                        "Put_Now": 8.072306400131083,
                        "Put_Sim": 20.988974966435535,
                        "Put_Chg": 160.01211953617994
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.4797178016156,
                        "Call_Sim": 48.56443437028838,
                        "Call_Chg": -44.48492108716945,
                        "Put_Now": 18.257296851462115,
                        "Put_Sim": 40.31701342013548,
                        "Put_Chg": 120.8268493860127
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.10267764815217,
                        "Call_Sim": 26.76254567497199,
                        "Call_Chg": -51.431496948552635,
                        "Put_Now": 35.800954573477156,
                        "Put_Sim": 68.4358226002978,
                        "Put_Chg": 91.1564186363844
                    },
                    {
                        "Strike": 5275.0,
                        "Call_Now": 42.12547521870192,
                        "Call_Sim": 19.010186233203058,
                        "Call_Chg": -54.872470554911764,
                        "Put_Now": 47.78410108176786,
                        "Put_Sim": 85.64381209626981,
                        "Put_Chg": 79.23076956018625
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.34252725717215,
                        "Call_Sim": 13.090137291352903,
                        "Call_Chg": -58.23522084244986,
                        "Put_Now": 61.96150205797767,
                        "Put_Sim": 104.6841120921581,
                        "Put_Chg": 68.95024913083077
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.905495002274847,
                        "Call_Sim": 5.631099847377868,
                        "Call_Chg": -64.59651305053698,
                        "Put_Now": 96.4451676785593,
                        "Put_Sim": 147.14577252366234,
                        "Put_Chg": 52.569357351404435
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.13349659397079,
                        "Call_Sim": 2.1165856333786053,
                        "Call_Chg": -70.32891786662466,
                        "Put_Now": 137.5938671457352,
                        "Put_Sim": 193.55195618514335,
                        "Put_Chg": 40.66902849684359
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 2.8080264391441574,
                        "Call_Sim": 0.6921665003164037,
                        "Call_Chg": -75.35042794941185,
                        "Put_Now": 183.18909486638677,
                        "Put_Sim": 242.04823492755895,
                        "Put_Chg": 32.13026414268953
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.9656517741612873,
                        "Call_Sim": 0.19644713558304616,
                        "Call_Chg": -79.65652413845876,
                        "Put_Now": 231.2674180768836,
                        "Put_Sim": 291.4732134383057,
                        "Put_Chg": 26.03297769399019
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 0.28929337639364405,
                        "Call_Sim": 0.048337406337746636,
                        "Call_Chg": -83.2912156716739,
                        "Put_Now": 280.5117575545946,
                        "Put_Sim": 341.24580158453864,
                        "Put_Chg": 21.65115806888189
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5439.018839907983,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 269.15831557596175,
                        "Call_Sim": 446.9498121430106,
                        "Call_Chg": 66.05461777638173,
                        "Put_Now": 0.25310312389153466,
                        "Put_Sim": 0.0007597829573167958,
                        "Put_Chg": -99.69981288826666
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.21542522576419,
                        "Call_Sim": 297.3382960848603,
                        "Call_Chg": 133.72817844784606,
                        "Put_Now": 8.072306400131083,
                        "Put_Sim": 0.151337351243793,
                        "Put_Chg": -98.12522786249373
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.4797178016156,
                        "Call_Sim": 247.86037603051864,
                        "Call_Chg": 183.33467717924103,
                        "Put_Now": 18.257296851462115,
                        "Put_Sim": 0.5941151723814926,
                        "Put_Chg": -96.74587548630501
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.10267764815217,
                        "Call_Sim": 199.29231042467563,
                        "Call_Chg": 261.6744574505424,
                        "Put_Now": 35.800954573477156,
                        "Put_Sim": 1.9467474420178803,
                        "Put_Chg": -94.56230297428965
                    },
                    {
                        "Strike": 5275.0,
                        "Call_Now": 42.12547521870192,
                        "Call_Sim": 175.69043896483072,
                        "Call_Chg": 317.0645863404566,
                        "Put_Now": 47.78410108176786,
                        "Put_Sim": 3.30522491991303,
                        "Put_Chg": -93.0830028292106
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.34252725717215,
                        "Call_Sim": 152.81317002789638,
                        "Call_Chg": 387.5585455315444,
                        "Put_Now": 61.96150205797767,
                        "Put_Sim": 5.388304920718156,
                        "Put_Chg": -91.30378583192464
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.905495002274847,
                        "Call_Sim": 110.26742017278502,
                        "Call_Chg": 593.2661960977276,
                        "Put_Now": 96.4451676785593,
                        "Put_Sim": 12.763252941086193,
                        "Put_Chg": -86.76631162732315
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.13349659397079,
                        "Call_Sim": 73.82793215731863,
                        "Call_Chg": 934.9473247063407,
                        "Put_Now": 137.5938671457352,
                        "Put_Sim": 26.2444628011001,
                        "Put_Chg": -80.92613911832075
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 2.8080264391441574,
                        "Call_Sim": 45.24327928666253,
                        "Call_Chg": 1511.2127242096756,
                        "Put_Now": 183.18909486638677,
                        "Put_Sim": 47.580507805922934,
                        "Put_Chg": -74.02656100210174
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.9656517741612873,
                        "Call_Sim": 25.07188510434321,
                        "Call_Chg": 2496.369185581343,
                        "Put_Now": 231.2674180768836,
                        "Put_Sim": 77.32981149908255,
                        "Put_Chg": -66.56260006613873
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 0.28929337639364405,
                        "Call_Sim": 12.439198047418131,
                        "Call_Chg": 4199.855808137137,
                        "Put_Now": 280.5117575545946,
                        "Put_Sim": 114.61782231763664,
                        "Put_Chg": -59.1397439747854
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5313.58475,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 269.15831557596175,
                        "Call_Sim": 321.5707729950318,
                        "Call_Chg": 19.472724558746997,
                        "Put_Now": 0.25310312389153466,
                        "Put_Sim": 0.05581054296192356,
                        "Put_Chg": -77.94948473814937
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.21542522576419,
                        "Call_Sim": 174.76316249416595,
                        "Call_Chg": 37.37576412924822,
                        "Put_Now": 8.072306400131083,
                        "Put_Sim": 3.0102936685335635,
                        "Put_Chg": -62.70838197513563
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.4797178016156,
                        "Call_Sim": 129.77120395921975,
                        "Call_Chg": 48.34433308702681,
                        "Put_Now": 18.257296851462115,
                        "Put_Sim": 7.939033009066293,
                        "Put_Chg": -56.515835429216324
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.10267764815217,
                        "Call_Sim": 89.81541333944733,
                        "Call_Chg": 62.9964589251848,
                        "Put_Now": 35.800954573477156,
                        "Put_Sim": 17.903940264773155,
                        "Put_Chg": -49.99032713491628
                    },
                    {
                        "Strike": 5275.0,
                        "Call_Now": 42.12547521870192,
                        "Call_Sim": 72.43050634381325,
                        "Call_Chg": 71.93991514108113,
                        "Put_Now": 47.78410108176786,
                        "Put_Sim": 25.479382206879563,
                        "Put_Chg": -46.67811755362018
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.34252725717215,
                        "Call_Sim": 57.07239329214917,
                        "Call_Chg": 82.09250589098306,
                        "Put_Now": 61.96150205797767,
                        "Put_Sim": 35.08161809295507,
                        "Put_Chg": -43.38158868368131
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.905495002274847,
                        "Call_Sim": 32.83598201182667,
                        "Call_Chg": 106.44426348963287,
                        "Put_Now": 96.4451676785593,
                        "Put_Sim": 60.76590468811173,
                        "Put_Chg": -36.99435010509025
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.13349659397079,
                        "Call_Sim": 16.903443071617176,
                        "Call_Chg": 136.95873193384455,
                        "Put_Now": 137.5938671457352,
                        "Put_Sim": 94.75406362338072,
                        "Put_Chg": -31.134965831711003
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 2.8080264391441574,
                        "Call_Sim": 7.713312286699875,
                        "Call_Chg": 174.68802213453415,
                        "Put_Now": 183.18909486638677,
                        "Put_Sim": 135.48463071394326,
                        "Put_Chg": -26.041104786962276
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.9656517741612873,
                        "Call_Sim": 3.098565613130461,
                        "Call_Chg": 220.87815670630405,
                        "Put_Now": 231.2674180768836,
                        "Put_Sim": 180.79058191585318,
                        "Put_Chg": -21.826177064098868
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 0.28929337639364405,
                        "Call_Sim": 1.0906822664979643,
                        "Call_Chg": 277.01598290790565,
                        "Put_Now": 280.5117575545946,
                        "Put_Sim": 228.70339644470005,
                        "Put_Chg": -18.469229796833513
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5208.365250000001,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 269.15831557596175,
                        "Call_Sim": 217.26206043361708,
                        "Call_Chg": -19.280940672887564,
                        "Put_Now": 0.25310312389153466,
                        "Put_Sim": 0.9665979815467125,
                        "Put_Chg": 281.89887453184514
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.21542522576419,
                        "Call_Sim": 85.15593022380563,
                        "Call_Chg": -33.06163142348284,
                        "Put_Now": 8.072306400131083,
                        "Put_Sim": 18.62256139817191,
                        "Put_Chg": 130.69690959537297
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.4797178016156,
                        "Call_Sim": 53.15485505004381,
                        "Call_Chg": -39.2375096927186,
                        "Put_Now": 18.257296851462115,
                        "Put_Sim": 36.54218409988971,
                        "Put_Chg": 100.15111983548249
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.10267764815217,
                        "Call_Sim": 29.87947274491694,
                        "Call_Chg": -45.77491690021541,
                        "Put_Now": 35.800954573477156,
                        "Put_Sim": 63.18749967024178,
                        "Put_Chg": 76.49668960797408
                    },
                    {
                        "Strike": 5275.0,
                        "Call_Now": 42.12547521870192,
                        "Call_Sim": 21.454133839830092,
                        "Call_Chg": -49.07087996409031,
                        "Put_Now": 47.78410108176786,
                        "Put_Sim": 79.72250970289588,
                        "Put_Chg": 66.83898597668545
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.34252725717215,
                        "Call_Sim": 14.940430018708184,
                        "Call_Chg": -52.33176349782277,
                        "Put_Now": 61.96150205797767,
                        "Put_Sim": 98.16915481951355,
                        "Put_Chg": 58.43572469830737
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.905495002274847,
                        "Call_Sim": 6.581962606024945,
                        "Call_Chg": -58.61831018095586,
                        "Put_Now": 96.4451676785593,
                        "Put_Sim": 139.73138528230902,
                        "Put_Chg": 44.881686294556225
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.13349659397079,
                        "Call_Sim": 2.537120111980471,
                        "Call_Chg": -64.4337096323164,
                        "Put_Now": 137.5938671457352,
                        "Put_Sim": 185.60724066374405,
                        "Put_Chg": 34.89499533228073
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 2.8080264391441574,
                        "Call_Sim": 0.8517513152269061,
                        "Call_Chg": -69.66726155589524,
                        "Put_Now": 183.18909486638677,
                        "Put_Sim": 233.8425697424691,
                        "Put_Chg": 27.650922623438706
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 0.9656517741612873,
                        "Call_Sim": 0.24835935774400042,
                        "Call_Chg": -74.28065018989771,
                        "Put_Now": 231.2674180768836,
                        "Put_Sim": 283.15987566046533,
                        "Put_Chg": 22.43829157392607
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 0.28929337639364405,
                        "Call_Sim": 0.06281924256917826,
                        "Call_Chg": -78.28528141491233,
                        "Put_Now": 280.5117575545946,
                        "Put_Sim": 332.89503342077023,
                        "Put_Chg": 18.674181903402218
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
                        "Call_Now": 269.15831557596175,
                        "Call_Sim": 308.014046430525,
                        "Call_Chg": 14.436013530333383,
                        "Put_Now": 0.25310312389153466,
                        "Put_Sim": 0.08383397845452478,
                        "Put_Chg": -66.87754099374484
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.21542522576419,
                        "Call_Sim": 162.10956478923345,
                        "Call_Chg": 27.429173389582278,
                        "Put_Now": 8.072306400131083,
                        "Put_Sim": 3.9414459636006427,
                        "Put_Chg": -51.17323639329846
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.4797178016156,
                        "Call_Sim": 118.22839750270668,
                        "Call_Chg": 35.149495761774396,
                        "Put_Now": 18.257296851462115,
                        "Put_Sim": 9.98097655255367,
                        "Put_Chg": -45.3315754585304
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.10267764815217,
                        "Call_Sim": 80.01177161056467,
                        "Call_Chg": 45.20487029952493,
                        "Put_Now": 35.800954573477156,
                        "Put_Sim": 21.685048535889564,
                        "Put_Chg": -39.42885379946055
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.34252725717215,
                        "Call_Sim": 49.498365800486226,
                        "Call_Chg": 57.92716839437206,
                        "Put_Now": 61.96150205797767,
                        "Put_Sim": 41.09234060129211,
                        "Put_Chg": -33.68085143765267
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.905495002274847,
                        "Call_Sim": 27.615173491008136,
                        "Call_Chg": 73.62033364606721,
                        "Put_Now": 96.4451676785593,
                        "Put_Sim": 69.12984616729318,
                        "Put_Chg": -28.322125585705816
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.13349659397079,
                        "Call_Sim": 13.738143884543888,
                        "Call_Chg": 92.58639439395438,
                        "Put_Now": 137.5938671457352,
                        "Put_Sim": 105.17351443630832,
                        "Put_Chg": -23.562353019039893
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5200.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 269.15831557596175,
                        "Call_Sim": 209.10766571555178,
                        "Call_Chg": -22.31053115780943,
                        "Put_Now": 0.25310312389153466,
                        "Put_Sim": 1.1774532634816524,
                        "Put_Chg": 365.20692648038613
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.21542522576419,
                        "Call_Sim": 79.15709379206828,
                        "Call_Chg": -37.777125964409336,
                        "Put_Now": 8.072306400131083,
                        "Put_Sim": 20.988974966435535,
                        "Put_Chg": 160.01211953617994
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.4797178016156,
                        "Call_Sim": 48.56443437028838,
                        "Call_Chg": -44.48492108716945,
                        "Put_Now": 18.257296851462115,
                        "Put_Sim": 40.31701342013548,
                        "Put_Chg": 120.8268493860127
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.10267764815217,
                        "Call_Sim": 26.76254567497199,
                        "Call_Chg": -51.431496948552635,
                        "Put_Now": 35.800954573477156,
                        "Put_Sim": 68.4358226002978,
                        "Put_Chg": 91.1564186363844
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.34252725717215,
                        "Call_Sim": 13.090137291352903,
                        "Call_Chg": -58.23522084244986,
                        "Put_Now": 61.96150205797767,
                        "Put_Sim": 104.6841120921581,
                        "Put_Chg": 68.95024913083077
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.905495002274847,
                        "Call_Sim": 5.631099847377868,
                        "Call_Chg": -64.59651305053698,
                        "Put_Now": 96.4451676785593,
                        "Put_Sim": 147.14577252366234,
                        "Put_Chg": 52.569357351404435
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.13349659397079,
                        "Call_Sim": 2.1165856333786053,
                        "Call_Chg": -70.32891786662466,
                        "Put_Now": 137.5938671457352,
                        "Put_Sim": 193.55195618514335,
                        "Put_Chg": 40.66902849684359
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5000.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 269.15831557596175,
                        "Call_Sim": 46.69657150989224,
                        "Call_Chg": -82.6508902725268,
                        "Put_Now": 0.25310312389153466,
                        "Put_Sim": 38.76635905782268,
                        "Put_Chg": 15216.428522010538
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.21542522576419,
                        "Call_Sim": 4.849583470850121,
                        "Call_Chg": -96.1878966624969,
                        "Put_Now": 8.072306400131083,
                        "Put_Sim": 146.6814646452176,
                        "Put_Chg": 1717.094859566229
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.4797178016156,
                        "Call_Sim": 1.7180437829331652,
                        "Call_Chg": -98.03606615783866,
                        "Put_Now": 18.257296851462115,
                        "Put_Sim": 193.47062283278046,
                        "Put_Chg": 959.6893089202664
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.10267764815217,
                        "Call_Sim": 0.5232748846903377,
                        "Call_Chg": -99.05036396228944,
                        "Put_Now": 35.800954573477156,
                        "Put_Sim": 242.19655181001508,
                        "Put_Chg": 576.5086425640851
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.34252725717215,
                        "Call_Sim": 0.13668536678060406,
                        "Call_Chg": -99.56389806840058,
                        "Put_Now": 61.96150205797767,
                        "Put_Sim": 291.7306601675864,
                        "Put_Chg": 370.8256747788532
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.905495002274847,
                        "Call_Sim": 0.03059301231920486,
                        "Call_Chg": -99.80765759056962,
                        "Put_Now": 96.4451676785593,
                        "Put_Sim": 341.54526568860365,
                        "Put_Chg": 254.13414057916816
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.13349659397079,
                        "Call_Sim": 0.0058688178105916755,
                        "Call_Chg": -99.91772873606538,
                        "Put_Now": 137.5938671457352,
                        "Put_Sim": 391.44123936957476,
                        "Put_Chg": 184.49032467048275
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5313.58475,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 269.15831557596175,
                        "Call_Sim": 321.5707729950318,
                        "Call_Chg": 19.472724558746997,
                        "Put_Now": 0.25310312389153466,
                        "Put_Sim": 0.05581054296192356,
                        "Put_Chg": -77.94948473814937
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.21542522576419,
                        "Call_Sim": 174.76316249416595,
                        "Call_Chg": 37.37576412924822,
                        "Put_Now": 8.072306400131083,
                        "Put_Sim": 3.0102936685335635,
                        "Put_Chg": -62.70838197513563
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.4797178016156,
                        "Call_Sim": 129.77120395921975,
                        "Call_Chg": 48.34433308702681,
                        "Put_Now": 18.257296851462115,
                        "Put_Sim": 7.939033009066293,
                        "Put_Chg": -56.515835429216324
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.10267764815217,
                        "Call_Sim": 89.81541333944733,
                        "Call_Chg": 62.9964589251848,
                        "Put_Now": 35.800954573477156,
                        "Put_Sim": 17.903940264773155,
                        "Put_Chg": -49.99032713491628
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.34252725717215,
                        "Call_Sim": 57.07239329214917,
                        "Call_Chg": 82.09250589098306,
                        "Put_Now": 61.96150205797767,
                        "Put_Sim": 35.08161809295507,
                        "Put_Chg": -43.38158868368131
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.905495002274847,
                        "Call_Sim": 32.83598201182667,
                        "Call_Chg": 106.44426348963287,
                        "Put_Now": 96.4451676785593,
                        "Put_Sim": 60.76590468811173,
                        "Put_Chg": -36.99435010509025
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.13349659397079,
                        "Call_Sim": 16.903443071617176,
                        "Call_Chg": 136.95873193384455,
                        "Put_Now": 137.5938671457352,
                        "Put_Sim": 94.75406362338072,
                        "Put_Chg": -31.134965831711003
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5208.365250000001,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 269.15831557596175,
                        "Call_Sim": 217.26206043361708,
                        "Call_Chg": -19.280940672887564,
                        "Put_Now": 0.25310312389153466,
                        "Put_Sim": 0.9665979815467125,
                        "Put_Chg": 281.89887453184514
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 127.21542522576419,
                        "Call_Sim": 85.15593022380563,
                        "Call_Chg": -33.06163142348284,
                        "Put_Now": 8.072306400131083,
                        "Put_Sim": 18.62256139817191,
                        "Put_Chg": 130.69690959537297
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 87.4797178016156,
                        "Call_Sim": 53.15485505004381,
                        "Call_Chg": -39.2375096927186,
                        "Put_Now": 18.257296851462115,
                        "Put_Sim": 36.54218409988971,
                        "Put_Chg": 100.15111983548249
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 55.10267764815217,
                        "Call_Sim": 29.87947274491694,
                        "Call_Chg": -45.77491690021541,
                        "Put_Now": 35.800954573477156,
                        "Put_Sim": 63.18749967024178,
                        "Put_Chg": 76.49668960797408
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 31.34252725717215,
                        "Call_Sim": 14.940430018708184,
                        "Call_Chg": -52.33176349782277,
                        "Put_Now": 61.96150205797767,
                        "Put_Sim": 98.16915481951355,
                        "Put_Chg": 58.43572469830737
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 15.905495002274847,
                        "Call_Sim": 6.581962606024945,
                        "Call_Chg": -58.61831018095586,
                        "Put_Now": 96.4451676785593,
                        "Put_Sim": 139.73138528230902,
                        "Put_Chg": 44.881686294556225
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 7.13349659397079,
                        "Call_Sim": 2.537120111980471,
                        "Call_Chg": -64.4337096323164,
                        "Put_Now": 137.5938671457352,
                        "Put_Sim": 185.60724066374405,
                        "Put_Chg": 34.89499533228073
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.00019263818158681524,
            -0.30901875299493486,
            -0.22517878768464308,
            -0.15826391566870882,
            0.02235738287790306,
            -0.0012479788213620086,
            0.6358675430715397,
            0.3750468655041864,
            0.772758114585818,
            0.5947295863338522,
            0.15167731834225415,
            0.04596857129736457,
            0.33385405716140254,
            0.0048646711168221,
            0.007642004356596427,
            0.06388457628748145
        ],
        "flip_variations": {
            "Classic": 5439.018839907983,
            "Spline": 5433.813506838207,
            "HVL": 4500.0,
            "HVL Log": 4500.0,
            "Sigma Kernel": 4500.0,
            "PVOP": 5439.018839907983,
            "HVL Gaussian": 5466.041649080601
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
            -0.33330847848713596,
            -1333.4390547491764,
            -688.4943414872711,
            -1293.079883034612,
            -1703.1831116961694,
            -52.91227737085269,
            1969.8716354807705,
            654.6030352278378,
            2923.9373088065804,
            319.9501843012268,
            445.4667697883239,
            85.68199871664629,
            2301.4643712117804,
            1.1473532773532622,
            43.50193317836137,
            209.41770409650817
        ],
        "delta_cumulative": [
            -0.33330847848713596,
            -1333.7723632276636,
            -2022.2667047149348,
            -3315.346587749547,
            -5018.529699445717,
            -5071.441976816569,
            -3101.5703413357987,
            -2446.967306107961,
            476.9700026986193,
            796.920186999846,
            1242.38695678817,
            1328.0689555048164,
            3629.533326716597,
            3630.6806799939504,
            3674.182613172312,
            3883.60031726882
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
            4138.68939171116,
            16893628.998771463,
            23989048.142585278,
            39975535.31637369,
            36206436.42867184,
            551261.5140691593,
            44727479.37814572,
            19753865.823084604,
            32993894.909683622,
            24401399.42104559,
            5949401.29144629,
            1684463.2211667309,
            9763065.712605033,
            94390.93015367215,
            189778.45007674253,
            1640155.049772655
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            171687.60511213343,
            0.0,
            0.0,
            44727479.37814572,
            19753865.823084604,
            32993894.909683622,
            22460898.084619142,
            5949401.29144629,
            1684463.2211667309,
            9763065.712605033,
            94390.93015367215,
            189778.45007674253,
            1640155.049772655
        ],
        "gamma_put": [
            4138.68939171116,
            16893628.998771463,
            23989048.142585278,
            39803847.711261556,
            36206436.42867184,
            551261.5140691593,
            0.0,
            0.0,
            0.0,
            1940501.3364264467,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            4138.68939171116,
            16897767.688163172,
            40886815.830748454,
            80862351.14712214,
            117068787.57579398,
            117620049.08986314,
            162347528.46800885,
            182101394.29109344,
            215095289.20077705,
            239496688.62182266,
            245446089.91326895,
            247130553.13443568,
            256893618.8470407,
            256988009.77719438,
            257177788.2272711,
            258817943.27704376
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
            "abs_call": 96304879.00194111,
            "abs_put": 100375084.18991148,
            "net": 196679963.1918526
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 30,
            "abs_call": 13543467.276739985,
            "abs_put": 551261.5140691593,
            "net": 14094728.790809143
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 51,
            "abs_call": 237009.77268512733,
            "abs_put": 0.0,
            "net": 237009.77268512733
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 73,
            "abs_call": 17414133.498369504,
            "abs_put": 15933508.361183122,
            "net": 33347641.859552626
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 96,
            "abs_call": 0.0,
            "abs_put": 454702.1589974769,
            "net": 454702.1589974769
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 117,
            "abs_call": 0.0,
            "abs_put": 1940501.3364264467,
            "net": 1940501.3364264467
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 139,
            "abs_call": 1640155.049772655,
            "abs_put": 0.0,
            "net": 1640155.049772655
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 161,
            "abs_call": 0.0,
            "abs_put": 31632.636333053422,
            "net": 31632.636333053422
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 182,
            "abs_call": 957200.9615406648,
            "abs_put": 0.0,
            "net": 957200.9615406648
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 205,
            "abs_call": 8568854.97837924,
            "abs_put": 0.0,
            "net": 8568854.97837924
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 226,
            "abs_call": 0.0,
            "abs_put": 102172.62425670362,
            "net": 102172.62425670362
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 246,
            "abs_call": 763379.9164380443,
            "abs_put": 0.0,
            "net": 763379.9164380443
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
            "spot": 5260.975,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5371.72120697994,
                    "lower": 5152.511994602545,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5484.798678100166,
                    "lower": 5046.285119112542,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5600.256487659834,
                    "lower": 4942.248272309163,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 41,
            "iv_atm": 0.12,
            "spot": 5260.975,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5476.876472312235,
                    "lower": 5053.584482057879,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5701.638174096495,
                    "lower": 4854.369411999903,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5935.62371411124,
                    "lower": 4663.007509189672,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 72,
            "iv_atm": 0.12,
            "spot": 5260.975,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5548.974644343823,
                    "lower": 4987.9229451584515,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5852.740148655076,
                    "lower": 4729.042678750261,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 6173.1345776819135,
                    "lower": 4483.598664880942,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 102,
            "iv_atm": 0.12,
            "spot": 5260.975,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5605.522321539231,
                    "lower": 4937.605518806477,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5972.634444618072,
                    "lower": 4634.112167297541,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 6363.789164118944,
                    "lower": 4349.273245361665,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 135,
            "iv_atm": 0.12,
            "spot": 5260.975,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5659.276219677968,
                    "lower": 4890.706315833435,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 6087.732279779421,
                    "lower": 4546.49723059567,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 6548.626162017804,
                    "lower": 4226.513663454676,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 164,
            "iv_atm": 0.12,
            "spot": 5260.975,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5701.638174096495,
                    "lower": 4854.369411999903,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 6179.211623000378,
                    "lower": 4479.189197470105,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 6696.7869787481795,
                    "lower": 4133.0055799085285,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 194,
            "iv_atm": 0.12,
            "spot": 5260.975,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5741.966745986866,
                    "lower": 4820.274859649686,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 6266.93381208217,
                    "lower": 4416.491187008263,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 6839.896701329416,
                    "lower": 4046.5315719235177,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 226,
            "iv_atm": 0.12,
            "spot": 5260.975,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5781.954731239066,
                    "lower": 4786.937850115902,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 6354.525637186609,
                    "lower": 4355.613547084381,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 6983.796648475054,
                    "lower": 3963.153474216434,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 255,
            "iv_atm": 0.12,
            "spot": 5260.975,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5816.026449281808,
                    "lower": 4758.894787014389,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 6429.637787433993,
                    "lower": 4304.7305098147635,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 7107.987289621765,
                    "lower": 3893.9093195955643,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 286,
            "iv_atm": 0.12,
            "spot": 5260.975,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5850.570580688993,
                    "lower": 4730.796350356228,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 6506.241926567517,
                    "lower": 4254.046846552929,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 7235.394124933342,
                    "lower": 3825.3421268713537,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 317,
            "iv_atm": 0.12,
            "spot": 5260.975,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5883.477194270432,
                    "lower": 4704.336744532438,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 6579.636644443333,
                    "lower": 4206.593683862412,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 7358.168807905071,
                    "lower": 3761.514402997926,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 345,
            "iv_atm": 0.12,
            "spot": 5260.975,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5911.989367232054,
                    "lower": 4681.648804044375,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 6643.562890579191,
                    "lower": 4166.116646517066,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 7465.664286494731,
                    "lower": 3707.353677916353,
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
            -0.7753703117403332,
            -3361.5651247387295,
            -14522.538941491312,
            -12437.355572344404,
            -323.61018763005814,
            43.87329910717601,
            13069.83842221447,
            11634.416724177669,
            16272.838139060343,
            21311.59846289866,
            2429.5009243309005,
            853.1100054515393,
            1372.1804197832062,
            221.50447920389888,
            29.818230115833806,
            409.38386566317865
        ],
        "vanna": [
            -12.570769820784616,
            -17638.02699866341,
            -9174.361064819173,
            -8836.274343182336,
            -2158.525422025582,
            -22.563042348324096,
            4524.004451586661,
            5092.8269349115235,
            10402.912865790357,
            12768.814866805578,
            3657.141450208985,
            1356.0069902481937,
            4685.354256878139,
            115.74630845257798,
            177.22701459354894,
            2258.3215482616765
        ],
        "vex": [
            3338.6096847921685,
            5866373.307957516,
            1162055.0563976138,
            1828176.3185847662,
            1562885.9778063018,
            82862.086970857,
            1792839.2443538292,
            791806.4323703047,
            6993939.3466502605,
            2733598.635694753,
            1329250.1327943176,
            253197.68271364694,
            9734874.790304124,
            3783.530085830211,
            233915.4682119549,
            1142290.7096227615
        ],
        "theta": [
            -0.8834471049396825,
            -3639.4017532759035,
            -6483.031472261093,
            -10638.65539688049,
            -9077.127047506194,
            -108.70347062579548,
            -15471.688477946947,
            -6613.315274379788,
            -12844.547128896376,
            -7623.393806588388,
            -2233.884680973576,
            -594.0126538272738,
            -5157.270854266045,
            -29.56735138372492,
            -99.015443860964,
            -701.2242398759101
        ],
        "charm_cum": [
            -0.7753703117403332,
            -3362.34049505047,
            -17884.87943654178,
            -30322.235008886186,
            -30645.845196516246,
            -30601.97189740907,
            -17532.133475194598,
            -5897.716751016929,
            10375.121388043413,
            31686.71985094207,
            34116.220775272974,
            34969.330780724515,
            36341.511200507724,
            36563.01567971162,
            36592.83390982745,
            37002.21777549063
        ],
        "vanna_cum": [
            -12.570769820784616,
            -17650.597768484193,
            -26824.958833303368,
            -35661.23317648571,
            -37819.75859851129,
            -37842.32164085961,
            -33318.31718927295,
            -28225.49025436143,
            -17822.577388571073,
            -5053.762521765495,
            -1396.6210715565098,
            -40.614081308316145,
            4644.740175569823,
            4760.486484022401,
            4937.71349861595,
            7196.035046877627
        ],
        "theta_cum": [
            -0.8834471049396825,
            -3640.285200380843,
            -10123.316672641937,
            -20761.972069522424,
            -29839.099117028618,
            -29947.802587654412,
            -45419.49106560136,
            -52032.80633998115,
            -64877.353468877525,
            -72500.74727546591,
            -74734.63195643948,
            -75328.64461026675,
            -80485.9154645328,
            -80515.48281591652,
            -80614.49825977748,
            -81315.72249965339
        ],
        "r_gamma": [
            4138.68939171116,
            16893628.998771463,
            23989048.142585278,
            39975535.31637369,
            36206436.42867184,
            -551261.5140691593,
            -44727479.37814572,
            -19753865.823084604,
            -32993894.909683622,
            -24401399.42104559,
            -5949401.29144629,
            -1684463.2211667309,
            -9763065.712605033,
            -94390.93015367215,
            -189778.45007674253,
            -1640155.049772655
        ],
        "r_gamma_cum": [
            4138.68939171116,
            16897767.688163172,
            40886815.830748454,
            80862351.14712214,
            117068787.57579398,
            116517526.06172483,
            71790046.68357912,
            52036180.86049451,
            19042285.950810887,
            -5359113.470234703,
            -11308514.761680994,
            -12992977.982847724,
            -22756043.695452757,
            -22850434.62560643,
            -23040213.075683173,
            -24680368.125455827
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.33330847848713596,
            "gamma": 4138.68939171116,
            "volume": 15,
            "oi": 15,
            "iv": 12.0
        },
        {
            "strike": 5000.0,
            "delta": -1333.4390547491764,
            "gamma": 16893628.998771463,
            "volume": 330,
            "oi": 11045,
            "iv": 12.0
        },
        {
            "strike": 5150.0,
            "delta": -688.4943414872711,
            "gamma": 23989048.142585278,
            "volume": 330,
            "oi": 4730,
            "iv": 12.0
        },
        {
            "strike": 5200.0,
            "delta": -1293.079883034612,
            "gamma": 39975535.31637369,
            "volume": 610,
            "oi": 5335,
            "iv": 12.0
        },
        {
            "strike": 5250.0,
            "delta": -1703.1831116961694,
            "gamma": 36206436.42867184,
            "volume": 495,
            "oi": 4000,
            "iv": 12.0
        },
        {
            "strike": 5275.0,
            "delta": -52.91227737085269,
            "gamma": 551261.5140691593,
            "volume": 115,
            "oi": 115,
            "iv": 12.0
        },
        {
            "strike": 5300.0,
            "delta": 1969.8716354807705,
            "gamma": 44727479.37814572,
            "volume": 3800,
            "oi": 4960,
            "iv": 12.0
        },
        {
            "strike": 5350.0,
            "delta": 654.6030352278378,
            "gamma": 19753865.823084604,
            "volume": 3805,
            "oi": 2705,
            "iv": 12.0
        },
        {
            "strike": 5400.0,
            "delta": 2923.9373088065804,
            "gamma": 32993894.909683622,
            "volume": 4630,
            "oi": 8880,
            "iv": 12.0
        },
        {
            "strike": 5450.0,
            "delta": 319.9501843012268,
            "gamma": 24401399.42104559,
            "volume": 4800,
            "oi": 8360,
            "iv": 12.0
        },
        {
            "strike": 5500.0,
            "delta": 445.4667697883239,
            "gamma": 5949401.29144629,
            "volume": 290,
            "oi": 1980,
            "iv": 12.0
        },
        {
            "strike": 5550.0,
            "delta": 85.68199871664629,
            "gamma": 1684463.2211667309,
            "volume": 200,
            "oi": 660,
            "iv": 12.0
        },
        {
            "strike": 5600.0,
            "delta": 2301.4643712117804,
            "gamma": 9763065.712605033,
            "volume": 1200,
            "oi": 5300,
            "iv": 12.0
        },
        {
            "strike": 5650.0,
            "delta": 1.1473532773532622,
            "gamma": 94390.93015367215,
            "volume": 100,
            "oi": 2000,
            "iv": 12.0
        },
        {
            "strike": 5800.0,
            "delta": 43.50193317836137,
            "gamma": 189778.45007674253,
            "volume": 120,
            "oi": 120,
            "iv": 12.0
        },
        {
            "strike": 5850.0,
            "delta": 209.41770409650817,
            "gamma": 1640155.049772655,
            "volume": 40,
            "oi": 1040,
            "iv": 12.0
        }
    ]
};