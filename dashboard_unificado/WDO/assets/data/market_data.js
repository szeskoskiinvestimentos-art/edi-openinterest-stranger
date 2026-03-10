window.marketData = {
    "last_updated": "2026-03-10 11:27:15",
    "spot_price": 5209.5,
    "fed_watch_rates": {
        "source": "Simulated/Manual",
        "last_update": "2026-03-09",
        "meetings": [
            {
                "date": "2026-03-18",
                "days_remaining": 7,
                "current_rate": "525-550",
                "probs": {
                    "Corte 0.25%": 65.5,
                    "Manuten\u00e7\u00e3o": 34.5,
                    "Aumento 0.25%": 0.0
                }
            },
            {
                "date": "2026-05-01",
                "days_remaining": 51,
                "current_rate": "500-525",
                "probs": {
                    "Corte 0.25%": 45.0,
                    "Manuten\u00e7\u00e3o": 45.0,
                    "Corte 0.50%": 10.0
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 10/03/2026 11:27\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  MostrarTodosPontos(false); // Se falso, limita a +/- 10k pts do Spot\n  ModeloFlip(2);\n  spot(5209.50);\n\nvar\n  GammaVal: Float;\n  LimitUpper, LimitLower: Float;\n  ShowLine: Boolean;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5926.29;\n\n  // Define Limites de Exibicao (Otimizacao)\n  if (MostrarTodosPontos) then begin\n    LimitUpper := 9999999;\n    LimitLower := 0;\n  end else begin\n    LimitUpper := spot + 10000;\n    LimitLower := spot - 10000;\n  end;\n\n  // 1 = Classic (5926.29)\n  // 2 = Spline (5645.27)\n  // 3 = HVL (4500.00)\n  // 4 = HVL Log (4500.00)\n  // 5 = Sigma Kernel (4500.00)\n  // 6 = PVOP (5926.29)\n  // 7 = HVL Gaussian (5872.46)\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ModeloFlip = 1) then GammaVal := 5926.29;\n  if (ModeloFlip = 2) then GammaVal := 5645.27;\n  if (ModeloFlip = 3) then GammaVal := 4500.00;\n  if (ModeloFlip = 4) then GammaVal := 4500.00;\n  if (ModeloFlip = 5) then GammaVal := 4500.00;\n  if (ModeloFlip = 6) then GammaVal := 5926.29;\n  if (ModeloFlip = 7) then GammaVal := 5872.46;\n  ShowLine := (ExibirWalls) and (4500.00 <= LimitUpper) and (4500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (4900.00 <= LimitUpper) and (4900.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(4900.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5100.00 <= LimitUpper) and (5100.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5150.00 <= LimitUpper) and (5150.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirRange) and (5200.00 <= LimitUpper) and (5200.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5200.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirExpMoves) and (5209.50 <= LimitUpper) and (5209.50 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5209.50, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  ShowLine := (ExibirExpMoves) and (5209.50 <= LimitUpper) and (5209.50 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5209.50, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5250.00 <= LimitUpper) and (5250.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5300.00 <= LimitUpper) and (5300.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5300.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5350.00 <= LimitUpper) and (5350.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5350.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5400.00 <= LimitUpper) and (5400.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5400.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (5500.00 <= LimitUpper) and (5500.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5550.00 <= LimitUpper) and (5550.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5550.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirMaxPain) and (5600.00 <= LimitUpper) and (5600.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5600.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5683.47 <= LimitUpper) and (5683.47 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5683.47, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirEffectiveWalls) and (5889.68 <= LimitUpper) and (5889.68 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5889.68, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (5900.00 <= LimitUpper) and (5900.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(5900.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  ShowLine := (ExibirWalls) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  ShowLine := (ExibirRange) and (6000.00 <= LimitUpper) and (6000.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6000.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  ShowLine := (ExibirWalls) and (6450.00 <= LimitUpper) and (6450.00 >= LimitLower);\n  if (ShowLine) then\n    HorizontalLineCustom(6450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5404.72 > 0) then\n      HorizontalLineCustom(5404.72, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (4700.00 <= LimitUpper) and (4700.00 >= LimitLower) then\n      HorizontalLineCustom(4700.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5000.00 <= LimitUpper) and (5000.00 >= LimitLower) then\n      HorizontalLineCustom(5000.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5125.00 <= LimitUpper) and (5125.00 >= LimitLower) then\n      HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5175.00 <= LimitUpper) and (5175.00 >= LimitLower) then\n      HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5225.00 <= LimitUpper) and (5225.00 >= LimitLower) then\n      HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5275.00 <= LimitUpper) and (5275.00 >= LimitLower) then\n      HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5325.00 <= LimitUpper) and (5325.00 >= LimitLower) then\n      HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5375.00 <= LimitUpper) and (5375.00 >= LimitLower) then\n      HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5450.00 <= LimitUpper) and (5450.00 >= LimitLower) then\n      HorizontalLineCustom(5450.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5525.00 <= LimitUpper) and (5525.00 >= LimitLower) then\n      HorizontalLineCustom(5525.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5575.00 <= LimitUpper) and (5575.00 >= LimitLower) then\n      HorizontalLineCustom(5575.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5750.00 <= LimitUpper) and (5750.00 >= LimitLower) then\n      HorizontalLineCustom(5750.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5950.00 <= LimitUpper) and (5950.00 >= LimitLower) then\n      HorizontalLineCustom(5950.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6225.00 <= LimitUpper) and (6225.00 >= LimitLower) then\n      HorizontalLineCustom(6225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (4652.80 <= LimitUpper) and (4652.80 >= LimitLower) then\n      HorizontalLineCustom(4652.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4747.20 <= LimitUpper) and (4747.20 >= LimitLower) then\n      HorizontalLineCustom(4747.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4976.40 <= LimitUpper) and (4976.40 >= LimitLower) then\n      HorizontalLineCustom(4976.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5023.60 <= LimitUpper) and (5023.60 >= LimitLower) then\n      HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5119.10 <= LimitUpper) and (5119.10 >= LimitLower) then\n      HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5130.90 <= LimitUpper) and (5130.90 >= LimitLower) then\n      HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5169.10 <= LimitUpper) and (5169.10 >= LimitLower) then\n      HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5180.90 <= LimitUpper) and (5180.90 >= LimitLower) then\n      HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5219.10 <= LimitUpper) and (5219.10 >= LimitLower) then\n      HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5230.90 <= LimitUpper) and (5230.90 >= LimitLower) then\n      HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5269.10 <= LimitUpper) and (5269.10 >= LimitLower) then\n      HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5280.90 <= LimitUpper) and (5280.90 >= LimitLower) then\n      HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5319.10 <= LimitUpper) and (5319.10 >= LimitLower) then\n      HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5330.90 <= LimitUpper) and (5330.90 >= LimitLower) then\n      HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5369.10 <= LimitUpper) and (5369.10 >= LimitLower) then\n      HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5380.90 <= LimitUpper) and (5380.90 >= LimitLower) then\n      HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5438.20 <= LimitUpper) and (5438.20 >= LimitLower) then\n      HorizontalLineCustom(5438.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5461.80 <= LimitUpper) and (5461.80 >= LimitLower) then\n      HorizontalLineCustom(5461.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5519.10 <= LimitUpper) and (5519.10 >= LimitLower) then\n      HorizontalLineCustom(5519.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5530.90 <= LimitUpper) and (5530.90 >= LimitLower) then\n      HorizontalLineCustom(5530.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5569.10 <= LimitUpper) and (5569.10 >= LimitLower) then\n      HorizontalLineCustom(5569.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5580.90 <= LimitUpper) and (5580.90 >= LimitLower) then\n      HorizontalLineCustom(5580.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5714.60 <= LimitUpper) and (5714.60 >= LimitLower) then\n      HorizontalLineCustom(5714.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5785.40 <= LimitUpper) and (5785.40 >= LimitLower) then\n      HorizontalLineCustom(5785.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5938.20 <= LimitUpper) and (5938.20 >= LimitLower) then\n      HorizontalLineCustom(5938.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5961.80 <= LimitUpper) and (5961.80 >= LimitLower) then\n      HorizontalLineCustom(5961.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6171.90 <= LimitUpper) and (6171.90 >= LimitLower) then\n      HorizontalLineCustom(6171.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6278.10 <= LimitUpper) and (6278.10 >= LimitLower) then\n      HorizontalLineCustom(6278.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (4594.40 <= LimitUpper) and (4594.40 >= LimitLower) then\n      HorizontalLineCustom(4594.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4805.60 <= LimitUpper) and (4805.60 >= LimitLower) then\n      HorizontalLineCustom(4805.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (4947.20 <= LimitUpper) and (4947.20 >= LimitLower) then\n      HorizontalLineCustom(4947.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5052.80 <= LimitUpper) and (5052.80 >= LimitLower) then\n      HorizontalLineCustom(5052.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5111.80 <= LimitUpper) and (5111.80 >= LimitLower) then\n      HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5138.20 <= LimitUpper) and (5138.20 >= LimitLower) then\n      HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5161.80 <= LimitUpper) and (5161.80 >= LimitLower) then\n      HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5188.20 <= LimitUpper) and (5188.20 >= LimitLower) then\n      HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5211.80 <= LimitUpper) and (5211.80 >= LimitLower) then\n      HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5238.20 <= LimitUpper) and (5238.20 >= LimitLower) then\n      HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5261.80 <= LimitUpper) and (5261.80 >= LimitLower) then\n      HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5288.20 <= LimitUpper) and (5288.20 >= LimitLower) then\n      HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5311.80 <= LimitUpper) and (5311.80 >= LimitLower) then\n      HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5338.20 <= LimitUpper) and (5338.20 >= LimitLower) then\n      HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5361.80 <= LimitUpper) and (5361.80 >= LimitLower) then\n      HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5388.20 <= LimitUpper) and (5388.20 >= LimitLower) then\n      HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5423.60 <= LimitUpper) and (5423.60 >= LimitLower) then\n      HorizontalLineCustom(5423.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5476.40 <= LimitUpper) and (5476.40 >= LimitLower) then\n      HorizontalLineCustom(5476.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5511.80 <= LimitUpper) and (5511.80 >= LimitLower) then\n      HorizontalLineCustom(5511.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5538.20 <= LimitUpper) and (5538.20 >= LimitLower) then\n      HorizontalLineCustom(5538.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5561.80 <= LimitUpper) and (5561.80 >= LimitLower) then\n      HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5588.20 <= LimitUpper) and (5588.20 >= LimitLower) then\n      HorizontalLineCustom(5588.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5670.80 <= LimitUpper) and (5670.80 >= LimitLower) then\n      HorizontalLineCustom(5670.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5829.20 <= LimitUpper) and (5829.20 >= LimitLower) then\n      HorizontalLineCustom(5829.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5923.60 <= LimitUpper) and (5923.60 >= LimitLower) then\n      HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (5976.40 <= LimitUpper) and (5976.40 >= LimitLower) then\n      HorizontalLineCustom(5976.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6106.20 <= LimitUpper) and (6106.20 >= LimitLower) then\n      HorizontalLineCustom(6106.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (6343.80 <= LimitUpper) and (6343.80 >= LimitLower) then\n      HorizontalLineCustom(6343.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5217.31, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5201.69, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5225.13, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5193.87, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5239.64, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5179.36, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5247.45, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5171.55, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 77380,
        "total_volume": 28675,
        "gamma_exposure": 185149995.07368246,
        "delta_position": -12597.681764928633,
        "last_update": "2026-03-10T11:27:15.330754",
        "spot_price": 5209.5,
        "dealer_pressure": 0.047598854337511085,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4500.0,
        "gamma_flip_hvl": 4500.0,
        "gamma_flip_hvl_gaussian": 5872.462283573941,
        "call_wall": 6000.0,
        "put_wall": 5200.0,
        "effective_call_wall": 5889.684063536394,
        "effective_put_wall": 5683.467741935484,
        "max_pain": 5600.0,
        "zero_gamma": 5926.290723497741,
        "range_low": 5170.710583333811,
        "range_high": 5248.289416666189,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5209.5,
                "sigma_1_down": 5209.5,
                "sigma_2_up": 5209.5,
                "sigma_2_down": 5209.5
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5209.5,
                "sigma_1_down": 5209.5,
                "sigma_2_up": 5209.5,
                "sigma_2_down": 5209.5
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 213.0,
                "sigma_1_up": 5209.5,
                "sigma_1_down": 5209.5,
                "sigma_2_up": 5209.5,
                "sigma_2_down": 5209.5
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
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0,
                4500.0
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4428.075,
                4459.969897959183,
                4491.864795918367,
                4523.7596938775505,
                4555.654591836735,
                4587.549489795918,
                4619.444387755102,
                4651.339285714285,
                4683.2341836734695,
                4715.129081632653,
                4747.023979591837,
                4778.91887755102,
                4810.813775510203,
                4842.708673469388,
                4874.603571428571,
                4906.498469387755,
                4938.393367346938,
                4970.288265306122,
                5002.183163265306,
                5034.078061224489,
                5065.972959183673,
                5097.867857142856,
                5129.7627551020405,
                5161.657653061224,
                5193.552551020408,
                5225.447448979591,
                5257.342346938775,
                5289.237244897959,
                5321.132142857143,
                5353.027040816326,
                5384.921938775509,
                5416.816836734693,
                5448.711734693877,
                5480.606632653061,
                5512.501530612244,
                5544.396428571428,
                5576.2913265306115,
                5608.186224489795,
                5640.081122448979,
                5671.976020408163,
                5703.870918367346,
                5735.76581632653,
                5767.660714285714,
                5799.555612244897,
                5831.450510204081,
                5863.345408163264,
                5895.240306122449,
                5927.135204081632,
                5959.030102040815,
                5990.924999999999
            ],
            "deltas": [
                -36536.84731963365,
                -36415.104510364436,
                -36275.221272925555,
                -36115.05050763958,
                -35932.11734093952,
                -35723.47292398377,
                -35485.46682947635,
                -35213.40734440247,
                -34901.08649708948,
                -34540.174784260606,
                -34119.54620592049,
                -33624.674910657355,
                -33037.33192140172,
                -32335.86784331653,
                -31496.349841110627,
                -30494.693439558934,
                -29309.690899859408,
                -27926.537226040324,
                -26340.186894873175,
                -24557.749325683613,
                -22599.22837715951,
                -20496.237849942434,
                -18288.800872852622,
                -16020.821726109305,
                -13735.148903092786,
                -11469.222402739448,
                -9252.100228144847,
                -7103.26455480814,
                -5033.1506730406645,
                -3044.960426866938,
                -1137.1125036773587,
                694.32721573411,
                2453.7372133274052,
                4144.812926302305,
                5770.231926182563,
                7331.934761598599,
                8831.74619989614,
                10272.052228051458,
                11656.304665467498,
                12989.21604970786,
                14276.603854487765,
                15524.925344006242,
                16740.60260692674,
                17929.269056490633,
                19095.07532658691,
                20240.17688037502,
                21364.491427932684,
                22465.766547285508,
                23539.944094677743,
                24581.757461582256
            ],
            "flip_value": 5404.7249860112415
        },
        "flow_sentiment": {
            "bull": [
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
                0.0,
                0.0,
                0.0,
                0.0
            ],
            "bear": [
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
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
                4428.075,
                4459.969897959183,
                4491.864795918367,
                4523.7596938775505,
                4555.654591836735,
                4587.549489795918,
                4619.444387755102,
                4651.339285714285,
                4683.2341836734695,
                4715.129081632653,
                4747.023979591837,
                4778.91887755102,
                4810.813775510203,
                4842.708673469388,
                4874.603571428571,
                4906.498469387755,
                4938.393367346938,
                4970.288265306122,
                5002.183163265306,
                5034.078061224489,
                5065.972959183673,
                5097.867857142856,
                5129.7627551020405,
                5161.657653061224,
                5193.552551020408,
                5225.447448979591,
                5257.342346938775,
                5289.237244897959,
                5321.132142857143,
                5353.027040816326,
                5384.921938775509,
                5416.816836734693,
                5448.711734693877,
                5480.606632653061,
                5512.501530612244,
                5544.396428571428,
                5576.2913265306115,
                5608.186224489795,
                5640.081122448979,
                5671.976020408163,
                5703.870918367346,
                5735.76581632653,
                5767.660714285714,
                5799.555612244897,
                5831.450510204081,
                5863.345408163264,
                5895.240306122449,
                5927.135204081632,
                5959.030102040815,
                5990.924999999999
            ],
            "pnl": [
                -20814235.12038167,
                -19616491.267494686,
                -18438691.732180472,
                -17282220.14886326,
                -16148471.801870525,
                -15038846.324893426,
                -13954740.289287042,
                -12897539.767615568,
                -11868612.956189819,
                -10869302.936162353,
                -9900920.64724461,
                -8964738.141540088,
                -8061982.177589476,
                -7193828.206763059,
                -6361394.7958519235,
                -5565738.521341853,
                -4807849.36261094,
                -4088646.613357244,
                -3408975.3230919596,
                -2769603.273642214,
                -2171218.4893903155,
                -1614427.2744771168,
                -1099752.7654523533,
                -627633.9838525113,
                -198425.3699060101,
                187603.22403726168,
                530266.1037439071,
                829460.8918316104,
                1085167.300795434,
                1297445.5466873664,
                1466434.4300567005,
                1592349.1107505653,
                1675478.602977857,
                1716183.0167110693,
                1714890.5710825734,
                1672094.4049650338,
                1588349.2094339058,
                1464267.7063105628,
                1300516.9964901134,
                1097814.8012666646,
                856925.6193797514,
                578656.8220089786,
                263854.7074301187,
                -86599.4635010492,
                -471793.4304612987,
                -890787.8754432481,
                -1342620.3240035996,
                -1826308.9875696488,
                -2340856.5292848833,
                -2885253.7368500903
            ]
        },
        "max_pain_profile": {
            "strikes": [
                4500.0,
                4900.0,
                5100.0,
                5150.0,
                5200.0,
                5250.0,
                5300.0,
                5350.0,
                5400.0,
                5500.0,
                5550.0,
                5600.0,
                5900.0,
                6000.0,
                6450.0
            ],
            "loss": [
                32252750.0,
                17376750.0,
                10354750.0,
                8832250.0,
                7533750.0,
                6466000.0,
                5719000.0,
                4975000.0,
                4237500.0,
                3677000.0,
                3475750.0,
                3310750.0,
                4690750.0,
                5230750.0,
                20159500.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 6000.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 904.3279635463723,
                        "Call_Sim": 1686.401493940847,
                        "Call_Chg": 86.48118403057337,
                        "Put_Now": 8.61202757136013,
                        "Put_Sim": 0.1855579658355886,
                        "Put_Chg": -97.8453626129499
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 351.11884374621286,
                        "Call_Sim": 1025.8880700958498,
                        "Call_Chg": 192.17687639611765,
                        "Put_Now": 126.43598439731136,
                        "Put_Sim": 10.705210746947756,
                        "Put_Chg": -91.5330981144515
                    },
                    {
                        "Strike": 5209.5,
                        "Call_Now": 345.34338986016655,
                        "Call_Sim": 1017.2382843690457,
                        "Call_Chg": 194.55849286153617,
                        "Put_Now": 129.76740797976254,
                        "Put_Sim": 11.16230248864116,
                        "Put_Chg": -91.39822343497687
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 58.47717043672924,
                        "Call_Sim": 397.74648990517335,
                        "Call_Chg": 580.1739669253056,
                        "Put_Now": 600.6892558033815,
                        "Put_Sim": 149.4585752718258,
                        "Put_Chg": -75.11881995093536
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5200.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 904.3279635463723,
                        "Call_Sim": 895.1829545379851,
                        "Call_Chg": -1.0112491681142475,
                        "Put_Now": 8.61202757136013,
                        "Put_Sim": 8.967018562974175,
                        "Put_Chg": 4.12203733293413
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 351.11884374621286,
                        "Call_Sim": 344.71362458448357,
                        "Call_Chg": -1.8242311045997166,
                        "Put_Now": 126.43598439731136,
                        "Put_Sim": 129.53076523558207,
                        "Put_Chg": 2.4477057326857956
                    },
                    {
                        "Strike": 5209.5,
                        "Call_Now": 345.34338986016655,
                        "Call_Sim": 338.99587139030564,
                        "Call_Chg": -1.8380309732962015,
                        "Put_Now": 129.76740797976254,
                        "Put_Sim": 132.9198895099014,
                        "Put_Chg": 2.4293322793582286
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 58.47717043672924,
                        "Call_Sim": 56.639250548571454,
                        "Call_Chg": -3.1429699392626493,
                        "Put_Now": 600.6892558033815,
                        "Put_Sim": 608.351335915223,
                        "Put_Chg": 1.275548053809289
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4500.0,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 904.3279635463723,
                        "Call_Sim": 298.3098674288799,
                        "Call_Chg": -67.01308823194616,
                        "Put_Now": 8.61202757136013,
                        "Put_Sim": 112.09393145386912,
                        "Put_Chg": 1201.5974522265224
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 351.11884374621286,
                        "Call_Sim": 47.82522846442271,
                        "Call_Chg": -86.37919060277193,
                        "Put_Now": 126.43598439731136,
                        "Put_Sim": 532.6423691155205,
                        "Put_Chg": 321.2743481647991
                    },
                    {
                        "Strike": 5209.5,
                        "Call_Now": 345.34338986016655,
                        "Call_Sim": 46.389806311440566,
                        "Call_Chg": -86.56704958788285,
                        "Put_Now": 129.76740797976254,
                        "Put_Sim": 540.3138244310362,
                        "Put_Chg": 316.37097699855354
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 58.47717043672924,
                        "Call_Sim": 2.282143720289426,
                        "Call_Chg": -96.09737662878432,
                        "Put_Now": 600.6892558033815,
                        "Put_Sim": 1253.9942290869421,
                        "Put_Chg": 108.75922400340076
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5261.595,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 904.3279635463723,
                        "Call_Sim": 954.6934395770113,
                        "Call_Chg": 5.56938169125369,
                        "Put_Now": 8.61202757136013,
                        "Put_Sim": 6.882503601999247,
                        "Put_Chg": -20.0826571330604
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 351.11884374621286,
                        "Call_Sim": 387.2452785361861,
                        "Call_Chg": 10.28894786862686,
                        "Put_Now": 126.43598439731136,
                        "Put_Sim": 110.46741918728412,
                        "Put_Chg": -12.629763026835583
                    },
                    {
                        "Strike": 5209.5,
                        "Call_Now": 345.34338986016655,
                        "Call_Sim": 381.1614627522481,
                        "Call_Chg": 10.371726792449882,
                        "Put_Now": 129.76740797976254,
                        "Put_Sim": 113.49048087184337,
                        "Put_Chg": -12.543154988853273
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 58.47717043672924,
                        "Call_Sim": 69.35343832974013,
                        "Call_Chg": 18.59916923439161,
                        "Put_Now": 600.6892558033815,
                        "Put_Sim": 559.4705236963928,
                        "Put_Chg": -6.861906003606041
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5157.405,
                "options": [
                    {
                        "Strike": 4500.0,
                        "Call_Now": 904.3279635463723,
                        "Call_Sim": 854.3482380429496,
                        "Call_Chg": -5.5267256480076625,
                        "Put_Now": 8.61202757136013,
                        "Put_Sim": 10.727302067938922,
                        "Put_Chg": 24.56186396352559
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 351.11884374621286,
                        "Call_Sim": 316.71211949399276,
                        "Call_Chg": -9.79916767927418,
                        "Put_Now": 126.43598439731136,
                        "Put_Sim": 144.12426014509106,
                        "Put_Chg": 13.989906300880461
                    },
                    {
                        "Strike": 5209.5,
                        "Call_Now": 345.34338986016655,
                        "Call_Sim": 311.25809741204466,
                        "Call_Chg": -9.869971005358872,
                        "Put_Now": 129.76740797976254,
                        "Put_Sim": 147.77711553164045,
                        "Put_Chg": 13.87845209537248
                    },
                    {
                        "Strike": 6000.0,
                        "Call_Now": 58.47717043672924,
                        "Call_Sim": 48.92532266876458,
                        "Call_Chg": -16.33431935339537,
                        "Put_Now": 600.6892558033815,
                        "Put_Sim": 643.2324080354174,
                        "Put_Chg": 7.082389408669767
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -7.545112197934037e-05,
            -0.018655071569686817,
            -0.107259858228489,
            0.014368279257754472,
            0.15938603710964697,
            0.17184772589348984,
            -0.0003479123448468612,
            -0.0007017702517459297,
            0.2660738876065913,
            0.1112614049578629,
            0.03251726261635886,
            0.4263200473947623,
            0.012945645414533597,
            0.5749672246964824,
            0.15693433463076253
        ]
    },
    "delta_data": {
        "strikes": [
            4500.0,
            4900.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0,
            5500.0,
            5550.0,
            5600.0,
            5900.0,
            6000.0,
            6450.0
        ],
        "delta_values": [
            -0.4235862228613707,
            -244.50861188643333,
            -942.5587995785575,
            -1375.9346323670563,
            -1959.835606587747,
            -3000.490588297807,
            -22.040871503992435,
            -51.67818879617868,
            -4557.92678953199,
            70.34383422848855,
            16.32541601617299,
            2189.392035150161,
            25.052376281990302,
            -3191.1463024081436,
            447.74855057532193
        ],
        "delta_cumulative": [
            -0.4235862228613707,
            -244.9321981092947,
            -1187.490997687852,
            -2563.4256300549087,
            -4523.261236642656,
            -7523.751824940462,
            -7545.792696444454,
            -7597.470885240633,
            -12155.397674772623,
            -12085.053840544135,
            -12068.728424527962,
            -9879.3363893778,
            -9854.28401309581,
            -13045.430315503954,
            -12597.681764928633
        ]
    },
    "gamma_data": {
        "strikes": [
            4500.0,
            4900.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0,
            5500.0,
            5550.0,
            5600.0,
            5900.0,
            6000.0,
            6450.0
        ],
        "gamma_values": [
            5013.615622712319,
            3059630.020017674,
            21927096.62453667,
            25995155.290545285,
            28902576.80947999,
            27331735.750713322,
            95226.81950457323,
            211269.74788888326,
            27391920.146564435,
            2492633.677817891,
            651469.724984725,
            13765208.064276043,
            339161.200170206,
            28948793.398310743,
            4033104.183249291
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            200175.11148538848,
            0.0,
            0.0,
            4817596.703955364,
            2492633.677817891,
            651469.724984725,
            13765208.064276043,
            339161.200170206,
            21358018.89249119,
            4033104.183249291
        ],
        "gamma_put": [
            5013.615622712319,
            3059630.020017674,
            21927096.62453667,
            25995155.290545285,
            28902576.80947999,
            27131560.639227934,
            95226.81950457323,
            211269.74788888326,
            22574323.44260907,
            0.0,
            0.0,
            0.0,
            0.0,
            7590774.505819552,
            0.0
        ],
        "gamma_exposure": [
            5013.615622712319,
            3064643.6356403865,
            24991740.260177057,
            50986895.550722346,
            79889472.36020234,
            107221208.11091566,
            107316434.93042023,
            107527704.67830911,
            134919624.82487354,
            137412258.50269142,
            138063728.22767615,
            151828936.2919522,
            152168097.4921224,
            181116890.89043316,
            185149995.07368246
        ]
    },
    "volume_data": {
        "strikes": [
            4500.0,
            4900.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0,
            5500.0,
            5550.0,
            5600.0,
            5900.0,
            6000.0,
            6450.0
        ],
        "call_volume": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            130.0,
            0.0,
            0.0,
            125.0,
            50.0,
            125.0,
            5500.0,
            800.0,
            11430.0,
            7000.0
        ],
        "put_volume": [
            15.0,
            20.0,
            310.0,
            440.0,
            890.0,
            820.0,
            60.0,
            130.0,
            800.0,
            0.0,
            0.0,
            0.0,
            0.0,
            30.0,
            0.0
        ],
        "total_volume": [
            15.0,
            20.0,
            310.0,
            440.0,
            890.0,
            950.0,
            60.0,
            130.0,
            925.0,
            50.0,
            125.0,
            5500.0,
            800.0,
            11460.0,
            7000.0
        ]
    },
    "volatility_data": {
        "strikes": [
            4500.0,
            4900.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0,
            5500.0,
            5550.0,
            5600.0,
            5900.0,
            6000.0,
            6450.0
        ],
        "iv_values": [
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
            0.0,
            0.0,
            0.0,
            0.0
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
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ]
    },
    "most_actives": {
        "top_oi": [
            {
                "strike": 6000.0,
                "type": "CALL",
                "oi": 12380,
                "volume": 11200,
                "expiry": "2027-01-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5400.0,
                "type": "PUT",
                "oi": 7850,
                "volume": 800,
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
                "strike": 6450.0,
                "type": "CALL",
                "oi": 7000,
                "volume": 7000,
                "expiry": "2027-01-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5250.0,
                "type": "PUT",
                "oi": 6220,
                "volume": 800,
                "expiry": "2026-05-01 00:00:00",
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
                "oi": 4630,
                "volume": 280,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5150.0,
                "type": "PUT",
                "oi": 4280,
                "volume": 140,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5600.0,
                "type": "CALL",
                "oi": 4200,
                "volume": 4200,
                "expiry": "2027-01-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5200.0,
                "type": "PUT",
                "oi": 4050,
                "volume": 75,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5600.0,
                "type": "CALL",
                "oi": 3200,
                "volume": 800,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 6000.0,
                "type": "CALL",
                "oi": 3165,
                "volume": 200,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 4900.0,
                "type": "PUT",
                "oi": 2080,
                "volume": 20,
                "expiry": "2026-07-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5500.0,
                "type": "CALL",
                "oi": 1580,
                "volume": 50,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5400.0,
                "type": "CALL",
                "oi": 1295,
                "volume": 125,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            }
        ],
        "top_vol": [
            {
                "strike": 6000.0,
                "type": "CALL",
                "oi": 12380,
                "volume": 11200,
                "expiry": "2027-01-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 6450.0,
                "type": "CALL",
                "oi": 7000,
                "volume": 7000,
                "expiry": "2027-01-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5600.0,
                "type": "CALL",
                "oi": 4200,
                "volume": 4200,
                "expiry": "2027-01-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5400.0,
                "type": "PUT",
                "oi": 7850,
                "volume": 800,
                "expiry": "2026-07-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5600.0,
                "type": "CALL",
                "oi": 3200,
                "volume": 800,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5250.0,
                "type": "PUT",
                "oi": 6220,
                "volume": 800,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5900.0,
                "type": "CALL",
                "oi": 600,
                "volume": 500,
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
                "strike": 5200.0,
                "type": "PUT",
                "oi": 400,
                "volume": 500,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5200.0,
                "type": "PUT",
                "oi": 150,
                "volume": 300,
                "expiry": "2026-06-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5150.0,
                "type": "PUT",
                "oi": 200,
                "volume": 300,
                "expiry": "2026-05-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 5100.0,
                "type": "PUT",
                "oi": 4630,
                "volume": 280,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 6000.0,
                "type": "CALL",
                "oi": 3165,
                "volume": 200,
                "expiry": "2026-04-01 00:00:00",
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
                "strike": 5150.0,
                "type": "PUT",
                "oi": 4280,
                "volume": 140,
                "expiry": "2026-04-01 00:00:00",
                "iv": 0.0
            }
        ]
    },
    "fed_watch": [
        {
            "expiry": "2026-04-01",
            "days_to_exp": 21,
            "iv_atm": 0.0,
            "spot": 5209.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-01",
            "days_to_exp": 51,
            "iv_atm": 0.0,
            "spot": 5209.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 82,
            "iv_atm": 0.0,
            "spot": 5209.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 112,
            "iv_atm": 0.0,
            "spot": 5209.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 145,
            "iv_atm": 0.0,
            "spot": 5209.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 174,
            "iv_atm": 0.0,
            "spot": 5209.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 204,
            "iv_atm": 0.0,
            "spot": 5209.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 236,
            "iv_atm": 0.0,
            "spot": 5209.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 265,
            "iv_atm": 0.0,
            "spot": 5209.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 296,
            "iv_atm": 0.0,
            "spot": 5209.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 327,
            "iv_atm": 0.0,
            "spot": 5209.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 355,
            "iv_atm": 0.0,
            "spot": 5209.5,
            "prob_data": [
                {
                    "sd": 1,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 5209.5,
                    "lower": 5209.5,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 5209.5,
                    "lower": 5209.5,
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
            4900.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0,
            5500.0,
            5550.0,
            5600.0,
            5900.0,
            6000.0,
            6450.0
        ],
        "charm": [
            -0.8088183631587664,
            -408.6918224949342,
            -6086.396985386647,
            -3148.6901913284464,
            854.5236754117927,
            2948.6294871699356,
            7.053759903066155,
            17.61760257042554,
            6809.647830425517,
            2269.7681212083867,
            685.7074276231476,
            4062.334560427776,
            171.8035544405452,
            7480.2743740550195,
            1249.0064631895668
        ],
        "vanna": [
            -14.753398217934672,
            -3879.412834237895,
            -8941.921465363104,
            -6338.375484156781,
            -2429.645860816075,
            396.6309990501235,
            -42.461413905943715,
            -60.441743533562075,
            11187.78333002719,
            2158.2727242680457,
            663.2214976149658,
            11113.923123629595,
            624.8946579678804,
            53857.72914199626,
            12021.599671809814
        ],
        "vex": [
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
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "theta": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            6301.73829285806,
            0.0,
            0.0,
            8276.622501314843,
            0.0,
            0.0,
            0.0,
            0.0,
            8128.475790181096,
            0.0
        ],
        "charm_cum": [
            -0.8088183631587664,
            -409.50064085809294,
            -6495.89762624474,
            -9644.587817573187,
            -8790.064142161395,
            -5841.434654991459,
            -5834.380895088393,
            -5816.763292517968,
            992.8845379075492,
            3262.652659115936,
            3948.3600867390833,
            8010.69464716686,
            8182.498201607405,
            15662.772575662424,
            16911.77903885199
        ],
        "vanna_cum": [
            -14.753398217934672,
            -3894.1662324558297,
            -12836.087697818934,
            -19174.463181975712,
            -21604.109042791788,
            -21207.478043741663,
            -21249.939457647608,
            -21310.38120118117,
            -10122.597871153981,
            -7964.325146885935,
            -7301.10364927097,
            3812.8194743586246,
            4437.714132326505,
            58295.44327432276,
            70317.04294613257
        ],
        "theta_cum": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            6301.73829285806,
            6301.73829285806,
            6301.73829285806,
            14578.360794172902,
            14578.360794172902,
            14578.360794172902,
            14578.360794172902,
            14578.360794172902,
            22706.836584353998,
            22706.836584353998
        ],
        "r_gamma": [
            5013.615622712319,
            3059630.020017674,
            21927096.62453667,
            25995155.290545285,
            28902576.80947999,
            -27331735.750713322,
            -95226.81950457323,
            -211269.74788888326,
            -27391920.146564435,
            -2492633.677817891,
            -651469.724984725,
            -13765208.064276043,
            -339161.200170206,
            -28948793.398310747,
            -4033104.183249291
        ],
        "r_gamma_cum": [
            5013.615622712319,
            3064643.6356403865,
            24991740.260177057,
            50986895.550722346,
            79889472.36020234,
            52557736.60948902,
            52462509.78998445,
            52251240.042095564,
            24859319.89553113,
            22366686.217713237,
            21715216.492728513,
            7950008.428452469,
            7610847.2282822635,
            -21337946.170028485,
            -25371050.353277776
        ]
    },
    "detailed_data": [
        {
            "strike": 4500.0,
            "delta": -0.4235862228613707,
            "gamma": 5013.615622712319,
            "volume": 15,
            "oi": 15,
            "iv": 0.0
        },
        {
            "strike": 4900.0,
            "delta": -244.50861188643333,
            "gamma": 3059630.020017674,
            "volume": 20,
            "oi": 2080,
            "iv": 0.0
        },
        {
            "strike": 5100.0,
            "delta": -942.5587995785575,
            "gamma": 21927096.62453667,
            "volume": 310,
            "oi": 4660,
            "iv": 0.0
        },
        {
            "strike": 5150.0,
            "delta": -1375.9346323670563,
            "gamma": 25995155.290545285,
            "volume": 440,
            "oi": 4480,
            "iv": 0.0
        },
        {
            "strike": 5200.0,
            "delta": -1959.835606587747,
            "gamma": 28902576.80947999,
            "volume": 890,
            "oi": 4615,
            "iv": 0.0
        },
        {
            "strike": 5250.0,
            "delta": -3000.490588297807,
            "gamma": 27331735.750713322,
            "volume": 950,
            "oi": 6415,
            "iv": 0.0
        },
        {
            "strike": 5300.0,
            "delta": -22.040871503992435,
            "gamma": 95226.81950457323,
            "volume": 60,
            "oi": 60,
            "iv": 0.0
        },
        {
            "strike": 5350.0,
            "delta": -51.67818879617868,
            "gamma": 211269.74788888326,
            "volume": 130,
            "oi": 130,
            "iv": 0.0
        },
        {
            "strike": 5400.0,
            "delta": -4557.92678953199,
            "gamma": 27391920.146564435,
            "volume": 925,
            "oi": 9145,
            "iv": 0.0
        },
        {
            "strike": 5500.0,
            "delta": 70.34383422848855,
            "gamma": 2492633.677817891,
            "volume": 50,
            "oi": 1580,
            "iv": 0.0
        },
        {
            "strike": 5550.0,
            "delta": 16.32541601617299,
            "gamma": 651469.724984725,
            "volume": 125,
            "oi": 725,
            "iv": 0.0
        },
        {
            "strike": 5600.0,
            "delta": 2189.392035150161,
            "gamma": 13765208.064276043,
            "volume": 5500,
            "oi": 7900,
            "iv": 0.0
        },
        {
            "strike": 5900.0,
            "delta": 25.052376281990302,
            "gamma": 339161.200170206,
            "volume": 800,
            "oi": 800,
            "iv": 0.0
        },
        {
            "strike": 6000.0,
            "delta": -3191.1463024081436,
            "gamma": 28948793.398310743,
            "volume": 11460,
            "oi": 27775,
            "iv": 0.0
        },
        {
            "strike": 6450.0,
            "delta": 447.74855057532193,
            "gamma": 4033104.183249291,
            "volume": 7000,
            "oi": 7000,
            "iv": 0.0
        }
    ]
};