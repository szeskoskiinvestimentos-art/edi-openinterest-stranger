window.marketData = {
    "last_updated": "2026-04-28 08:34:01",
    "spot_price": 4981.0,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 28/04/2026 08:34\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(false);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  ModeloFlip(7);\n  spot(0);\n  ExibirUsdBeta(true);\n  JanelaUsdBeta(0);\n  ExibirOpcoesEdi(true);\n  // 1 = Classic (4800.00)\n  // 2 = Spline (4922.08)\n  // 3 = HVL (4800.00)\n  // 4 = HVL Log (4800.00)\n  // 5 = Sigma Kernel (4800.00)\n  // 6 = PVOP (4800.00)\n  // 7 = HVL Gaussian (4800.00)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 4800.00;\n\n  if (ModeloFlip = 1) then GammaVal := 4800.00;\n  if (ModeloFlip = 2) then GammaVal := 4922.08;\n  if (ModeloFlip = 3) then GammaVal := 4800.00;\n  if (ModeloFlip = 4) then GammaVal := 4800.00;\n  if (ModeloFlip = 5) then GammaVal := 4800.00;\n  if (ModeloFlip = 6) then GammaVal := 4800.00;\n  if (ModeloFlip = 7) then GammaVal := 4800.00;\n\n  // --- Linhas Principais (Com Intercalação de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(4800.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4925.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4950.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(4950.00, clRangeLow, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4975.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5075.78, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5150.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5200.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5200.00, clRangeHigh, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5300.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5700.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5755.68, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5900.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Dinâmicos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5022.88 > 0) then\n      HorizontalLineCustom(5022.88, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(4862.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4937.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4962.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5062.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5425.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5600.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5800.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5950.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(4847.75, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4877.25, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4934.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4940.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4959.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4965.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5041.85, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5083.15, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5407.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5442.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5623.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5776.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5823.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5938.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5961.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(4829.50, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4895.50, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4930.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4944.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4955.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4969.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5016.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5108.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5385.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5464.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5547.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5652.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5747.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5852.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5976.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n\n  if (ExibirMelhoresPontos) then\n  begin\n    HorizontalLineCustom(4983.47, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4978.53, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4992.87, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4969.16, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5017.30, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4944.96, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5135.29, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4831.35, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n  if (ExibirOpcoesEdi) then\n  begin\n    HorizontalLineCustom(4354.97, clFib, 1, psDot, \"OpcoesEdiMap_A_P_2400\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4536.43, clEffectiveWall, 1, psDot, \"OpcoesEdiMap_A_C_2500\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(6169.54, clEffectiveWall, 1, psDot, \"OpcoesEdiMap_A_C_3400\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5262.26, clEdiWall, 2, psSolid, \"OpcoesEdiMap_A_MediaIntervalo\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5667.64, clEffectiveWall, 2, psDashDot, \"OpcoesEdiMap_A_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n  end;\n\n  if (ExibirUsdBeta) then\n  begin\n    if (JanelaUsdBeta = 30) then\n    begin\n    HorizontalLineCustom(5262.26, clEffectiveWall, 2, psSolid, \"UsdBeta_30_A_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5667.64, clFib, 2, psDashDot, \"UsdBeta_30_A_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5030.80, clMaxPain, 1, psDot, \"UsdBeta_30_ProxyFx\", TamanhoFonte, tpTopRight, 0, 0);\n    end;\n    if (JanelaUsdBeta = 60) then\n    begin\n    HorizontalLineCustom(5262.26, clEffectiveWall, 2, psSolid, \"UsdBeta_60_A_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5667.64, clFib, 2, psDashDot, \"UsdBeta_60_A_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5030.80, clMaxPain, 1, psDot, \"UsdBeta_60_ProxyFx\", TamanhoFonte, tpTopRight, 0, 0);\n    end;\n    if (JanelaUsdBeta = 90) then\n    begin\n    HorizontalLineCustom(5262.26, clEffectiveWall, 2, psSolid, \"UsdBeta_90_A_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5667.64, clFib, 2, psDashDot, \"UsdBeta_90_A_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5030.80, clMaxPain, 1, psDot, \"UsdBeta_90_ProxyFx\", TamanhoFonte, tpTopRight, 0, 0);\n    end;\n    if (JanelaUsdBeta = 252) then\n    begin\n    HorizontalLineCustom(5262.26, clEffectiveWall, 2, psSolid, \"UsdBeta_252_A_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5667.64, clFib, 2, psDashDot, \"UsdBeta_252_A_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5030.80, clMaxPain, 1, psDot, \"UsdBeta_252_ProxyFx\", TamanhoFonte, tpTopRight, 0, 0);\n    end;\n    if (JanelaUsdBeta = 0) then\n    begin\n    HorizontalLineCustom(5262.26, clEffectiveWall, 2, psSolid, \"UsdBeta_30_A_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5667.64, clFib, 2, psDashDot, \"UsdBeta_30_A_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5030.80, clMaxPain, 1, psDot, \"UsdBeta_30_ProxyFx\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5262.26, clEffectiveWall, 2, psSolid, \"UsdBeta_60_A_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5667.64, clFib, 2, psDashDot, \"UsdBeta_60_A_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5030.80, clMaxPain, 1, psDot, \"UsdBeta_60_ProxyFx\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5262.26, clEffectiveWall, 2, psSolid, \"UsdBeta_90_A_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5667.64, clFib, 2, psDashDot, \"UsdBeta_90_A_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5030.80, clMaxPain, 1, psDot, \"UsdBeta_90_ProxyFx\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5262.26, clEffectiveWall, 2, psSolid, \"UsdBeta_252_A_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5667.64, clFib, 2, psDashDot, \"UsdBeta_252_A_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5030.80, clMaxPain, 1, psDot, \"UsdBeta_252_ProxyFx\", TamanhoFonte, tpTopRight, 0, 0);\n    end;\n  end;\n\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "open_interest_total": 20600.0,
        "volume_total": 5460,
        "total_trades": 20600,
        "total_volume": 20600,
        "gamma_exposure": 57967569.70754384,
        "delta_position": -918.8078343120093,
        "last_update": "2026-04-28T08:34:01.149318",
        "spot_price": 4981.0,
        "dealer_pressure": 0.016669519084140088,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4800.0,
        "gamma_flip_hvl": 4800.0,
        "gamma_flip_hvl_gaussian": 4800.0,
        "call_wall": 5200.0,
        "put_wall": 4950.0,
        "effective_call_wall": 5755.681818181818,
        "effective_put_wall": 5075.782227784731,
        "max_pain": 5200.0,
        "zero_gamma": 4800.0,
        "range_low": 4943.34717919882,
        "range_high": 5018.65282080118,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "move": 37.65282080117922,
                "upper": 5018.65282080118,
                "lower": 4943.34717919882
            },
            {
                "label": "1 Semana",
                "days": 5,
                "move": 84.19426685605482,
                "upper": 5065.194266856055,
                "lower": 4896.805733143945
            },
            {
                "label": "Expiração",
                "days": 3.0,
                "move": 65.21659867592868,
                "upper": 5046.216598675928,
                "lower": 4915.783401324072
            }
        ],
        "pinning_risk": {
            "strike": null,
            "score": null
        },
        "volatility_analysis": {
            "iv_current": 0.12,
            "hv_current": 0.1257,
            "vrp": 0.954653937947494,
            "iv_rank": 0.0,
            "regime": "Justa (Neutro)",
            "rank_desc": "Baixa"
        }
    },
    "oi_data": {
        "strikes": [
            4800.0,
            4925.0,
            4950.0,
            4975.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
        ],
        "call_oi": [
            0.0,
            0.0,
            0.0,
            0.0,
            2150.0,
            1600.0,
            30.0,
            1885.0,
            1700.0,
            300.0,
            1720.0,
            960.0,
            5330.0
        ],
        "put_oi": [
            300.0,
            400.0,
            1985.0,
            85.0,
            0.0,
            2010.0,
            65.0,
            80.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_oi": [
            300.0,
            400.0,
            1985.0,
            85.0,
            2150.0,
            3610.0,
            95.0,
            1965.0,
            1700.0,
            300.0,
            1720.0,
            960.0,
            5330.0
        ]
    },
    "oi_data_nearest": {
        "strikes": [
            4925.0,
            4950.0,
            5150.0
        ],
        "call_oi": [
            0.0,
            0.0,
            1600.0
        ],
        "put_oi": [
            400.0,
            1985.0,
            0.0
        ],
        "total_oi": [
            400.0,
            1985.0,
            1600.0
        ]
    },
    "oi_by_expiry": [
        {
            "expiry": "2026-05-01",
            "days_to_exp": 3,
            "call_oi": 1600.0,
            "put_oi": 2385.0,
            "total_oi": 3985.0
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 34,
            "call_oi": 3850.0,
            "put_oi": 85.0,
            "total_oi": 3935.0
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 64,
            "call_oi": 1885.0,
            "put_oi": 2090.0,
            "total_oi": 3975.0
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 97,
            "call_oi": 200.0,
            "put_oi": 0.0,
            "total_oi": 200.0
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 126,
            "call_oi": 320.0,
            "put_oi": 0.0,
            "total_oi": 320.0
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 156,
            "call_oi": 5330.0,
            "put_oi": 0.0,
            "total_oi": 5330.0
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 188,
            "call_oi": 0.0,
            "put_oi": 300.0,
            "total_oi": 300.0
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 217,
            "call_oi": 30.0,
            "put_oi": 0.0,
            "total_oi": 30.0
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 248,
            "call_oi": 300.0,
            "put_oi": 0.0,
            "total_oi": 300.0
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 279,
            "call_oi": 0.0,
            "put_oi": 65.0,
            "total_oi": 65.0
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 307,
            "call_oi": 760.0,
            "put_oi": 0.0,
            "total_oi": 760.0
        },
        {
            "expiry": "2027-04-01",
            "days_to_exp": 338,
            "call_oi": 1400.0,
            "put_oi": 0.0,
            "total_oi": 1400.0
        }
    ],
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
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0,
                4800.0
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4233.849999999999,
                4264.345918367347,
                4294.841836734693,
                4325.33775510204,
                4355.833673469388,
                4386.329591836734,
                4416.825510204081,
                4447.321428571428,
                4477.817346938775,
                4508.313265306122,
                4538.809183673469,
                4569.305102040816,
                4599.801020408163,
                4630.296938775509,
                4660.7928571428565,
                4691.288775510204,
                4721.78469387755,
                4752.280612244897,
                4782.776530612245,
                4813.272448979591,
                4843.768367346938,
                4874.2642857142855,
                4904.760204081632,
                4935.256122448979,
                4965.752040816326,
                4996.247959183673,
                5026.74387755102,
                5057.239795918367,
                5087.735714285714,
                5118.231632653061,
                5148.727551020408,
                5179.223469387754,
                5209.719387755102,
                5240.215306122449,
                5270.711224489795,
                5301.207142857143,
                5331.703061224489,
                5362.198979591836,
                5392.694897959183,
                5423.190816326531,
                5453.686734693877,
                5484.182653061224,
                5514.678571428571,
                5545.174489795918,
                5575.670408163265,
                5606.1663265306115,
                5636.662244897959,
                5667.158163265306,
                5697.654081632652,
                5728.15
            ],
            "deltas": [
                -4842.492168629925,
                -4829.885118267608,
                -4815.846099196952,
                -4800.2504632017835,
                -4782.949331393368,
                -4763.758839056248,
                -4742.446131566062,
                -4718.71169262704,
                -4692.167687989008,
                -4662.312171393724,
                -4628.499245349724,
                -4589.905630809721,
                -4545.494589396708,
                -4493.978342366768,
                -4433.776072715619,
                -4362.932803614803,
                -4278.815600847627,
                -4176.963871776875,
                -4047.849547368463,
                -3870.9699137513453,
                -3610.3065247217983,
                -3221.842063090265,
                -2680.1358412816644,
                -2008.5144993108033,
                -1279.1880218739948,
                -570.8611349736611,
                82.78876328342369,
                708.1552696552415,
                1360.705719175675,
                2077.2363570798743,
                2848.021991655613,
                3625.8561613000784,
                4359.6903849269565,
                5023.198233386813,
                5618.911421527953,
                6163.743058743973,
                6673.6518438050825,
                7157.388147560284,
                7617.6476336458945,
                8054.299975338448,
                8466.689113837163,
                8854.629413254332,
                9218.639621420265,
                9559.871328780178,
                9879.945361723256,
                10180.773610054333,
                10464.394145940927,
                10732.831717404413,
                10987.989196564906,
                11231.571358931526
            ],
            "flip_value": 5022.881382699331
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                0.0,
                540.0,
                200.0,
                30.0,
                720.0,
                500.0,
                100.0,
                1335.0,
                860.0,
                300.0
            ],
            "bear": [
                -40.0,
                -400.0,
                -300.0,
                -85.0,
                -0.0,
                -15.0,
                -20.0,
                -15.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4233.849999999999,
                4264.345918367347,
                4294.841836734693,
                4325.33775510204,
                4355.833673469388,
                4386.329591836734,
                4416.825510204081,
                4447.321428571428,
                4477.817346938775,
                4508.313265306122,
                4538.809183673469,
                4569.305102040816,
                4599.801020408163,
                4630.296938775509,
                4660.7928571428565,
                4691.288775510204,
                4721.78469387755,
                4752.280612244897,
                4782.776530612245,
                4813.272448979591,
                4843.768367346938,
                4874.2642857142855,
                4904.760204081632,
                4935.256122448979,
                4965.752040816326,
                4996.247959183673,
                5026.74387755102,
                5057.239795918367,
                5087.735714285714,
                5118.231632653061,
                5148.727551020408,
                5179.223469387754,
                5209.719387755102,
                5240.215306122449,
                5270.711224489795,
                5301.207142857143,
                5331.703061224489,
                5362.198979591836,
                5392.694897959183,
                5423.190816326531,
                5453.686734693877,
                5484.182653061224,
                5514.678571428571,
                5545.174489795918,
                5575.670408163265,
                5606.1663265306115,
                5636.662244897959,
                5667.158163265306,
                5697.654081632652,
                5728.15
            ],
            "pnl": [
                -5626824.708127477,
                -5389964.1513863765,
                -5153103.59464528,
                -4916243.037904179,
                -4679382.481163075,
                -4442521.92442199,
                -4205661.367681265,
                -3968800.810950676,
                -3731940.25443101,
                -3495079.701217496,
                -3258219.1872865884,
                -3021359.0291512543,
                -2784501.341211953,
                -2547656.871758831,
                -2310867.234506825,
                -2074255.093977685,
                -1838095.672846566,
                -1602862.47501831,
                -1369208.3885206082,
                -1137973.3816975295,
                -910421.026821453,
                -688677.3319828237,
                -475832.5539394065,
                -275096.7626113506,
                -88275.04669972393,
                85160.55968665011,
                247326.43528841488,
                399802.0222116393,
                541514.4289222112,
                667980.9919772514,
                772433.858413145,
                848288.6208935939,
                891527.3833276145,
                901550.3666367435,
                880262.3681653264,
                830592.854608439,
                755784.7827835446,
                659584.2927316708,
                546445.5881231568,
                421091.5981896188,
                287666.33860662824,
                149134.6365314707,
                7234.558148370241,
                -137250.65251624852,
                -284288.82559359295,
                -434589.25157623866,
                -589577.5890145743,
                -751066.8822595057,
                -920596.1181105104,
                -1098784.0296690734
            ]
        },
        "max_pain_profile": {
            "strikes": [
                4800.0,
                4925.0,
                4950.0,
                4975.0,
                5150.0,
                5200.0,
                5250.0,
                5300.0,
                5350.0,
                5500.0,
                5700.0,
                5900.0,
                6000.0
            ],
            "loss": [
                1235875.0,
                657750.0,
                552125.0,
                496125.0,
                119000.0,
                118750.0,
                299000.0,
                484000.0,
                767250.0,
                1872000.0,
                3405000.0,
                5282000.0,
                6316500.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5200.0,
                "options": [
                    {
                        "Strike": 4800.0,
                        "Call_Now": 183.89439047753422,
                        "Call_Sim": 402.8562926894083,
                        "Call_Chg": 119.0693754405869,
                        "Put_Now": 0.038097791834285744,
                        "Put_Sim": 3.708308303064287e-09,
                        "Put_Chg": -99.9999902663432
                    },
                    {
                        "Strike": 4950.0,
                        "Call_Now": 46.35975055600693,
                        "Call_Sim": 252.94664174303762,
                        "Call_Chg": 445.61691706570844,
                        "Put_Now": 12.41419872387928,
                        "Put_Sim": 0.0010899109102785465,
                        "Put_Chg": -99.99122044898328
                    },
                    {
                        "Strike": 4981.0,
                        "Call_Now": 27.51860455614178,
                        "Call_Sim": 221.9715092853603,
                        "Call_Chg": 706.6234202846571,
                        "Put_Now": 24.55460583375134,
                        "Put_Sim": 0.007510562969447854,
                        "Put_Chg": -99.96941281395311
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.010596989747116758,
                        "Call_Sim": 28.72851710338,
                        "Call_Chg": 271000.7351044809,
                        "Put_Now": 215.9162799135729,
                        "Put_Sim": 25.63420002720477,
                        "Put_Chg": -88.12771318704378
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 4950.0,
                "options": [
                    {
                        "Strike": 4800.0,
                        "Call_Now": 183.89439047753422,
                        "Call_Sim": 153.03212935224838,
                        "Call_Chg": -16.782600624816872,
                        "Put_Now": 0.038097791834285744,
                        "Put_Sim": 0.17583666654892482,
                        "Put_Chg": 361.54031003624283
                    },
                    {
                        "Strike": 4950.0,
                        "Call_Now": 46.35975055600693,
                        "Call_Sim": 27.34733839648652,
                        "Call_Chg": -41.01060064279602,
                        "Put_Now": 12.41419872387928,
                        "Put_Sim": 24.4017865643591,
                        "Put_Chg": 96.5635246149326
                    },
                    {
                        "Strike": 4981.0,
                        "Call_Now": 27.51860455614178,
                        "Call_Sim": 14.286334859827775,
                        "Call_Chg": -48.08481356428643,
                        "Put_Now": 24.55460583375134,
                        "Put_Sim": 42.322336137438015,
                        "Put_Chg": 72.36007136088571
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.010596989747116758,
                        "Call_Sim": 0.0015991047807640824,
                        "Call_Chg": -84.90982044028901,
                        "Put_Now": 215.9162799135729,
                        "Put_Sim": 246.90728202860555,
                        "Put_Chg": 14.353249383250647
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4800.0,
                "options": [
                    {
                        "Strike": 4800.0,
                        "Call_Now": 183.89439047753422,
                        "Call_Sim": 26.518631172350524,
                        "Call_Chg": -85.57942354658708,
                        "Put_Now": 0.038097791834285744,
                        "Put_Sim": 23.662338486650697,
                        "Put_Chg": 62009.474978431695
                    },
                    {
                        "Strike": 4950.0,
                        "Call_Now": 46.35975055600693,
                        "Call_Sim": 0.23037510893490776,
                        "Call_Chg": -99.50307086174548,
                        "Put_Now": 12.41419872387928,
                        "Put_Sim": 147.2848232768074,
                        "Put_Chg": 1086.4223100722422
                    },
                    {
                        "Strike": 4981.0,
                        "Call_Now": 27.51860455614178,
                        "Call_Sim": 0.05180842259928653,
                        "Call_Chg": -99.8117331040766,
                        "Put_Now": 24.55460583375134,
                        "Put_Sim": 178.0878097002087,
                        "Put_Chg": 625.2725248613827
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.010596989747116758,
                        "Call_Sim": 6.646856382448293e-09,
                        "Call_Chg": -99.99993727599497,
                        "Put_Now": 215.9162799135729,
                        "Put_Sim": 396.9056829304718,
                        "Put_Chg": 83.82387983404746
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5030.81,
                "options": [
                    {
                        "Strike": 4800.0,
                        "Call_Now": 183.89439047753422,
                        "Call_Sim": 233.66849587110664,
                        "Call_Chg": 27.066679556847696,
                        "Put_Now": 0.038097791834285744,
                        "Put_Sim": 0.0022031854075488244,
                        "Put_Chg": -94.21702597060734
                    },
                    {
                        "Strike": 4950.0,
                        "Call_Now": 46.35975055600693,
                        "Call_Sim": 86.84327947539259,
                        "Call_Chg": 87.32473413651732,
                        "Put_Now": 12.41419872387928,
                        "Put_Sim": 3.0877276432647136,
                        "Put_Chg": -75.12745113927227
                    },
                    {
                        "Strike": 4981.0,
                        "Call_Now": 27.51860455614178,
                        "Call_Sim": 60.575050904441014,
                        "Call_Chg": 120.12399204639715,
                        "Put_Now": 24.55460583375134,
                        "Put_Sim": 7.801052182051308,
                        "Put_Chg": -68.22978045394467
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.010596989747116758,
                        "Call_Sim": 0.14233423892976305,
                        "Call_Chg": 1243.1572769850939,
                        "Put_Now": 215.9162799135729,
                        "Put_Sim": 166.23801716275557,
                        "Put_Chg": -23.00811350153985
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 4931.19,
                "options": [
                    {
                        "Strike": 4800.0,
                        "Call_Now": 183.89439047753422,
                        "Call_Sim": 134.4526484145208,
                        "Call_Chg": -26.88594357588822,
                        "Put_Now": 0.038097791834285744,
                        "Put_Sim": 0.4063557288224757,
                        "Put_Chg": 966.6122871110335
                    },
                    {
                        "Strike": 4950.0,
                        "Call_Now": 46.35975055600693,
                        "Call_Sim": 18.63893673267512,
                        "Call_Chg": -59.79500211038121,
                        "Put_Now": 12.41419872387928,
                        "Put_Sim": 34.503384900547644,
                        "Put_Chg": 177.93485240556686
                    },
                    {
                        "Strike": 4981.0,
                        "Call_Now": 27.51860455614178,
                        "Call_Sim": 8.925877966722283,
                        "Call_Chg": -67.56420570486324,
                        "Put_Now": 24.55460583375134,
                        "Put_Sim": 55.77187924433292,
                        "Put_Chg": 127.13408483092866
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.010596989747116758,
                        "Call_Sim": 0.0004561433178976726,
                        "Call_Chg": -95.69553874465359,
                        "Put_Now": 215.9162799135729,
                        "Put_Sim": 265.71613906714356,
                        "Put_Chg": 23.064429960308953
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.026558463269623397,
            -0.07508058295058219,
            -0.2246476490918073,
            -0.004123098836024989,
            0.19208765709223705,
            0.19511126920687782,
            0.00015763824720060795,
            0.2712334956850112,
            0.13264047223862324,
            0.04397560025297344,
            0.22472887993776264,
            0.09601502420799675,
            0.22889883556603108
        ]
    },
    "delta_data": {
        "strikes": [
            4800.0,
            4925.0,
            4950.0,
            4975.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
        ],
        "delta_values": [
            -66.14242464013061,
            -71.9806855654432,
            -592.444362085447,
            -36.440680986659466,
            134.04064474966125,
            -1234.1674758346085,
            -21.50679850673484,
            228.38203760027352,
            63.44029699010183,
            84.06746502113937,
            365.47858488975373,
            109.72665896701349,
            118.73890508907093
        ],
        "delta_cumulative": [
            -66.14242464013061,
            -138.12311020557382,
            -730.5674722910207,
            -767.0081532776802,
            -632.9675085280189,
            -1867.1349843626274,
            -1888.6417828693623,
            -1660.2597452690889,
            -1596.819448278987,
            -1512.7519832578475,
            -1147.2733983680937,
            -1037.5467394010802,
            -918.8078343120093
        ]
    },
    "gamma_data": {
        "strikes": [
            4800.0,
            4925.0,
            4950.0,
            4975.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
        ],
        "gamma_values": [
            508187.17090311495,
            4007551.2503304966,
            26294845.749513406,
            450509.76229180075,
            3310447.5526639493,
            11539771.159161128,
            183797.70676365425,
            4603946.273083849,
            1869160.5830611594,
            500856.69719343557,
            2134536.5356938196,
            796945.7510866692,
            1767013.5157973664
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            3310447.5526639493,
            5149887.267368144,
            62505.63347821421,
            4416508.256876873,
            1869160.5830611594,
            500856.69719343557,
            2134536.5356938196,
            796945.7510866692,
            1767013.5157973664
        ],
        "gamma_put": [
            508187.17090311495,
            4007551.2503304966,
            26294845.749513406,
            450509.76229180075,
            0.0,
            6389883.891792983,
            121292.07328544006,
            187438.01620697603,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            508187.17090311495,
            4515738.421233611,
            30810584.17074702,
            31261093.93303882,
            34571541.48570277,
            46111312.644863896,
            46295110.35162755,
            50899056.6247114,
            52768217.20777256,
            53269073.904966,
            55403610.44065981,
            56200556.19174648,
            57967569.70754385
        ]
    },
    "volume_data": {
        "strikes": [
            4800.0,
            4925.0,
            4950.0,
            4975.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
        ],
        "call_volume": [
            0.0,
            0.0,
            0.0,
            0.0,
            2150.0,
            1600.0,
            30.0,
            1885.0,
            1700.0,
            300.0,
            1720.0,
            960.0,
            5330.0
        ],
        "put_volume": [
            300.0,
            400.0,
            1985.0,
            85.0,
            0.0,
            2010.0,
            65.0,
            80.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_volume": [
            300.0,
            400.0,
            1985.0,
            85.0,
            2150.0,
            3610.0,
            95.0,
            1965.0,
            1700.0,
            300.0,
            1720.0,
            960.0,
            5330.0
        ]
    },
    "volatility_data": {
        "strikes": [
            4800.0,
            4925.0,
            4950.0,
            4975.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
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
            12.0
        ],
        "skew": [
            0.0,
            0.0,
            0.0,
            -4.743384504624082e-19,
            0.0,
            0.0,
            0.0,
            0.0,
            1.3552527156068805e-19,
            0.0,
            0.0,
            1.0842021724855044e-19,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            4800.0,
            4925.0,
            4950.0,
            4975.0,
            5150.0,
            5200.0,
            5250.0,
            5300.0,
            5350.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
        ],
        "charm": [
            -6.307519249240157,
            -3725.825996145213,
            -13155.530207073027,
            20.06706980437124,
            3905.053542572554,
            4493.725215052651,
            23.937292516413223,
            1829.0682002873277,
            1508.6225889240081,
            98.93155960675138,
            480.9199661807866,
            214.3335012728063,
            841.0547026556052
        ],
        "vanna": [
            -507.9244833412194,
            -790.0326721913742,
            -2973.840233206307,
            -39.9603564932548,
            1683.9449482104355,
            7105.017199367809,
            65.70204660762747,
            4161.842256958265,
            2084.5976641903335,
            577.0538465752059,
            3446.2767686839934,
            1765.9686007564846,
            4890.056382201208
        ],
        "vex": [
            323039.58092187403,
            57033.17936541772,
            374213.21908093215,
            51291.18002229622,
            269233.15801889315,
            1980692.0572202061,
            160461.7089951841,
            1004651.2321586761,
            212806.60261091735,
            422922.4410973805,
            2270671.283943715,
            805303.0905134145,
            938826.0610332462
        ],
        "theta": [
            -75.84785870462814,
            -1069.0172704614256,
            -6893.866057806242,
            -91.21039875116692,
            -1072.1016872304713,
            -1975.8719992822182,
            -27.036927006892128,
            -1523.8260495770712,
            -593.798737333913,
            -220.7083684098723,
            -945.5112752812447,
            -329.4121920173571,
            -616.8895944407707
        ],
        "charm_cum": [
            -6.307519249240157,
            -3732.1335153944533,
            -16887.66372246748,
            -16867.59665266311,
            -12962.543110090555,
            -8468.817895037904,
            -8444.88060252149,
            -6615.8124022341635,
            -5107.189813310155,
            -5008.258253703403,
            -4527.338287522616,
            -4313.0047862498095,
            -3471.9500835942044
        ],
        "vanna_cum": [
            -507.9244833412194,
            -1297.9571555325936,
            -4271.797388738901,
            -4311.757745232156,
            -2627.81279702172,
            4477.2044023460885,
            4542.906448953716,
            8704.748705911981,
            10789.346370102314,
            11366.400216677519,
            14812.676985361511,
            16578.645586117997,
            21468.701968319205
        ],
        "theta_cum": [
            -75.84785870462814,
            -1144.8651291660537,
            -8038.731186972295,
            -8129.941585723463,
            -9202.043272953933,
            -11177.915272236152,
            -11204.952199243044,
            -12728.778248820116,
            -13322.576986154028,
            -13543.285354563901,
            -14488.796629845147,
            -14818.208821862503,
            -15435.098416303274
        ],
        "r_gamma": [
            508187.17090311495,
            4007551.2503304966,
            26294845.749513406,
            450509.76229180075,
            -3310447.5526639493,
            -11539771.159161128,
            -183797.70676365425,
            -4603946.273083849,
            -1869160.5830611594,
            -500856.69719343557,
            -2134536.5356938196,
            -796945.7510866692,
            -1767013.5157973664
        ],
        "r_gamma_cum": [
            508187.17090311495,
            4515738.421233611,
            30810584.17074702,
            31261093.93303882,
            27950646.38037487,
            16410875.221213743,
            16227077.514450088,
            11623131.24136624,
            9753970.65830508,
            9253113.961111644,
            7118577.425417825,
            6321631.674331156,
            4554618.158533789
        ]
    },
    "ewz_meta": {
        "expiration": "",
        "atm_iv_pct": 0.0,
        "hv_pct": 0.0,
        "iv_rank_pct": 0.0
    },
    "detailed_data": [
        {
            "strike": 4800.0,
            "delta": -66.14242464013061,
            "gamma": 508187.17090311495,
            "volume": 0,
            "oi": 300,
            "iv": 12.0
        },
        {
            "strike": 4925.0,
            "delta": -71.9806855654432,
            "gamma": 4007551.2503304966,
            "volume": 0,
            "oi": 400,
            "iv": 12.0
        },
        {
            "strike": 4950.0,
            "delta": -592.444362085447,
            "gamma": 26294845.749513406,
            "volume": 0,
            "oi": 1985,
            "iv": 12.0
        },
        {
            "strike": 4975.0,
            "delta": -36.440680986659466,
            "gamma": 450509.76229180075,
            "volume": 0,
            "oi": 85,
            "iv": 12.0
        },
        {
            "strike": 5150.0,
            "delta": 134.04064474966125,
            "gamma": 3310447.5526639493,
            "volume": 0,
            "oi": 2150,
            "iv": 12.0
        },
        {
            "strike": 5200.0,
            "delta": -1234.1674758346085,
            "gamma": 11539771.159161128,
            "volume": 0,
            "oi": 3610,
            "iv": 12.0
        },
        {
            "strike": 5250.0,
            "delta": -21.50679850673484,
            "gamma": 183797.70676365425,
            "volume": 0,
            "oi": 95,
            "iv": 12.0
        },
        {
            "strike": 5300.0,
            "delta": 228.38203760027352,
            "gamma": 4603946.273083849,
            "volume": 0,
            "oi": 1965,
            "iv": 12.0
        },
        {
            "strike": 5350.0,
            "delta": 63.44029699010183,
            "gamma": 1869160.5830611594,
            "volume": 0,
            "oi": 1700,
            "iv": 12.0
        },
        {
            "strike": 5500.0,
            "delta": 84.06746502113937,
            "gamma": 500856.69719343557,
            "volume": 0,
            "oi": 300,
            "iv": 12.0
        },
        {
            "strike": 5700.0,
            "delta": 365.47858488975373,
            "gamma": 2134536.5356938196,
            "volume": 0,
            "oi": 1720,
            "iv": 12.0
        },
        {
            "strike": 5900.0,
            "delta": 109.72665896701349,
            "gamma": 796945.7510866692,
            "volume": 0,
            "oi": 960,
            "iv": 12.0
        },
        {
            "strike": 6000.0,
            "delta": 118.73890508907093,
            "gamma": 1767013.5157973664,
            "volume": 0,
            "oi": 5330,
            "iv": 12.0
        }
    ],
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-04-28",
        "meetings": [
            {
                "date": "2026-04-29",
                "days_remaining": 1,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.50-3.75": 100.0,
                    "3.75-4.00": 2.1
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 50,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 3.4,
                    "3.50-3.75": 96.6,
                    "3.75-4.00": 2.1
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 92,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.2,
                    "3.25-3.50": 9.6,
                    "3.50-3.75": 90.2,
                    "3.75-4.00": 1.9
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 141,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.8,
                    "3.25-3.50": 14.2,
                    "3.50-3.75": 85.1,
                    "3.75-4.00": 1.6
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 183,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 1.1,
                    "3.25-3.50": 15.8,
                    "3.50-3.75": 83.1,
                    "3.75-4.00": 1.5
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 225,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 2.3,
                    "3.25-3.50": 21.4,
                    "3.50-3.75": 76.2,
                    "3.75-4.00": 1.3
                }
            },
            {
                "date": "2027-01-27",
                "days_remaining": 274,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 2.2,
                    "3.25-3.50": 21.0,
                    "3.50-3.75": 74.8,
                    "3.75-4.00": 1.8
                }
            },
            {
                "date": "2027-03-17",
                "days_remaining": 323,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 2.3,
                    "3.25-3.50": 21.1,
                    "3.50-3.75": 74.7,
                    "3.75-4.00": 1.8
                }
            },
            {
                "date": "2027-04-28",
                "days_remaining": 365,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 2.2,
                    "3.25-3.50": 20.7,
                    "3.50-3.75": 73.5,
                    "3.75-4.00": 3.4,
                    "4.00-4.25": 0.0
                }
            },
            {
                "date": "2027-06-09",
                "days_remaining": 407,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.50-1.75": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.3,
                    "3.00-3.25": 4.0,
                    "3.25-3.50": 25.6,
                    "3.50-3.75": 67.0,
                    "3.75-4.00": 3.1,
                    "4.00-4.25": 0.0
                }
            },
            {
                "date": "2027-07-28",
                "days_remaining": 456,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.50-1.75": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.1,
                    "2.75-3.00": 1.1,
                    "3.00-3.25": 8.4,
                    "3.25-3.50": 34.2,
                    "3.50-3.75": 53.8,
                    "3.75-4.00": 2.5,
                    "4.00-4.25": 0.0
                }
            },
            {
                "date": "2027-09-15",
                "days_remaining": 505,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.25-1.50": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.3,
                    "2.75-3.00": 2.6,
                    "3.00-3.25": 13.7,
                    "3.25-3.50": 38.2,
                    "3.50-3.75": 43.3,
                    "3.75-4.00": 2.0,
                    "4.00-4.25": 0.0
                }
            },
            {
                "date": "2027-10-27",
                "days_remaining": 547,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.25-1.50": 0.0,
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.5,
                    "2.75-3.00": 3.6,
                    "3.00-3.25": 16.0,
                    "3.25-3.50": 38.7,
                    "3.50-3.75": 39.3,
                    "3.75-4.00": 1.8,
                    "4.00-4.25": 0.0
                }
            },
            {
                "date": "2027-12-08",
                "days_remaining": 589,
                "current_rate": "3.00-3.25",
                "probs": {
                    "0.75-1.00": 0.0,
                    "1.50-1.75": 0.0,
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.2,
                    "2.25-2.50": 1.5,
                    "2.50-2.75": 7.6,
                    "2.75-3.00": 23.3,
                    "3.00-3.25": 38.9,
                    "3.25-3.50": 27.3,
                    "3.50-3.75": 1.2,
                    "3.75-4.00": 0.0
                }
            }
        ]
    }
};
