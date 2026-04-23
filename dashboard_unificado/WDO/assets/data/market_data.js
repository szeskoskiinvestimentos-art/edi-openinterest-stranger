window.marketData = {
    "last_updated": "2026-04-23 15:06:53",
    "spot_price": 4999.5,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 23/04/2026 15:06\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(false);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  ModeloFlip(7);\n  spot(0);\n  ExibirOpcoesEdi(true);\n  ExibirUsdBeta(true);\n  JanelaUsdBeta(90);\n  // 1 = Classic (5008.51)\n  // 2 = Spline (5011.47)\n  // 3 = HVL (5002.76)\n  // 4 = HVL Log (4950.21)\n  // 5 = Sigma Kernel (4950.19)\n  // 6 = PVOP (5008.51)\n  // 7 = HVL Gaussian (4960.52)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5008.51;\n\n  if (ModeloFlip = 1) then GammaVal := 5008.51;\n  if (ModeloFlip = 2) then GammaVal := 5011.47;\n  if (ModeloFlip = 3) then GammaVal := 5002.76;\n  if (ModeloFlip = 4) then GammaVal := 4950.21;\n  if (ModeloFlip = 5) then GammaVal := 4950.19;\n  if (ModeloFlip = 6) then GammaVal := 5008.51;\n  if (ModeloFlip = 7) then GammaVal := 4960.52;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(4450.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4800.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4950.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(4989.95, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5100.00, clRangeLow, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5200.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5200.00, clRangeHigh, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5439.15, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5700.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5900.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(6050.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(6100.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5218.94 > 0) then\n      HorizontalLineCustom(5218.94, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(4625.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4875.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4975.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5600.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5800.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5975.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6075.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(4583.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4666.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4857.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4892.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4969.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4980.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5345.50, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5404.50, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5623.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5776.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5823.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5957.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5992.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6069.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6080.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(4532.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4717.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4835.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4914.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4961.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4988.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5309.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5441.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5547.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5652.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5747.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5852.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5935.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6014.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6088.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos) then\n  begin\n    HorizontalLineCustom(5001.98, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4997.02, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5011.41, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4987.62, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5035.94, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4963.33, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5154.36, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4849.29, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n  if (ExibirOpcoesEdi) then\n  begin\n    HorizontalLineCustom(4922.00, clFib, 1, psDot, \"OpcoesEdiMap_A_P_2200\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4923.00, clEffectiveWall, 1, psDot, \"OpcoesEdiMap_A_C_2300\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4923.00, clFib, 1, psDot, \"OpcoesEdiMap_A_P_2300\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4924.00, clFib, 1, psDot, \"OpcoesEdiMap_A_P_2400\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4925.00, clEffectiveWall, 1, psDot, \"OpcoesEdiMap_A_C_2500\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4926.00, clEffectiveWall, 1, psDot, \"OpcoesEdiMap_A_C_2600\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4927.00, clEffectiveWall, 1, psDot, \"OpcoesEdiMap_A_C_2700\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4927.00, clFib, 1, psDot, \"OpcoesEdiMap_A_P_2700\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4928.00, clEffectiveWall, 1, psDot, \"OpcoesEdiMap_A_C_2800\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4928.00, clFib, 1, psDot, \"OpcoesEdiMap_A_P_2800\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4929.00, clEffectiveWall, 1, psDot, \"OpcoesEdiMap_A_C_2900\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4929.00, clFib, 1, psDot, \"OpcoesEdiMap_A_P_2900\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4930.00, clEffectiveWall, 1, psDot, \"OpcoesEdiMap_A_C_3000\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4934.00, clEffectiveWall, 1, psDot, \"OpcoesEdiMap_A_C_3400\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4928.00, clEdiWall, 2, psSolid, \"OpcoesEdiMap_A_MediaIntervalo\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4928.00, clEffectiveWall, 2, psDashDot, \"OpcoesEdiMap_A_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4917.00, clRangeHigh, 1, psDot, \"OpcoesEdiMap_B_C_1700\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4920.00, clGammaFlip, 1, psDot, \"OpcoesEdiMap_B_P_2000\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4921.00, clGammaFlip, 1, psDot, \"OpcoesEdiMap_B_P_2100\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4922.00, clGammaFlip, 1, psDot, \"OpcoesEdiMap_B_P_2200\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4923.00, clGammaFlip, 1, psDot, \"OpcoesEdiMap_B_P_2300\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4926.00, clRangeHigh, 1, psDot, \"OpcoesEdiMap_B_C_2600\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4927.00, clRangeHigh, 1, psDot, \"OpcoesEdiMap_B_C_2700\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4931.00, clRangeHigh, 1, psDot, \"OpcoesEdiMap_B_C_3100\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4932.00, clRangeHigh, 1, psDot, \"OpcoesEdiMap_B_C_3200\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4934.00, clRangeHigh, 1, psDot, \"OpcoesEdiMap_B_C_3400\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4935.00, clRangeHigh, 1, psDot, \"OpcoesEdiMap_B_C_3500\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4926.00, clEdiWall, 2, psSolid, \"OpcoesEdiMap_B_MediaIntervalo\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4926.46, clEffectiveWall, 2, psDashDot, \"OpcoesEdiMap_B_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n  end;\n\n  if (ExibirUsdBeta) then\n  begin\n    if (JanelaUsdBeta = 30) then\n    begin\n    HorizontalLineCustom(4996.33, clEffectiveWall, 2, psSolid, \"UsdBeta_30_A_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4996.21, clFib, 2, psDashDot, \"UsdBeta_30_A_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4938.67, clRangeHigh, 2, psSolid, \"UsdBeta_30_B_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(4999.08, clGammaFlip, 2, psDashDot, \"UsdBeta_30_B_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    end;\n    if (JanelaUsdBeta = 60) then\n    begin\n    HorizontalLineCustom(5068.31, clEffectiveWall, 2, psSolid, \"UsdBeta_60_A_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5068.20, clFib, 2, psDashDot, \"UsdBeta_60_A_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5012.37, clRangeHigh, 2, psSolid, \"UsdBeta_60_B_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5082.26, clGammaFlip, 2, psDashDot, \"UsdBeta_60_B_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    end;\n    if (JanelaUsdBeta = 90) then\n    begin\n    HorizontalLineCustom(5073.48, clEffectiveWall, 2, psSolid, \"UsdBeta_90_A_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5073.35, clFib, 2, psDashDot, \"UsdBeta_90_A_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5009.62, clRangeHigh, 2, psSolid, \"UsdBeta_90_B_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5084.09, clGammaFlip, 2, psDashDot, \"UsdBeta_90_B_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    end;\n    if (JanelaUsdBeta = 252) then\n    begin\n    HorizontalLineCustom(5090.78, clEffectiveWall, 2, psSolid, \"UsdBeta_252_A_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5090.62, clFib, 2, psDashDot, \"UsdBeta_252_A_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5009.62, clRangeHigh, 2, psSolid, \"UsdBeta_252_B_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5084.09, clGammaFlip, 2, psDashDot, \"UsdBeta_252_B_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    end;\n    if (JanelaUsdBeta = 0) then\n    begin\n    HorizontalLineCustom(5090.78, clEffectiveWall, 2, psSolid, \"UsdBeta_all_A_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5090.62, clFib, 2, psDashDot, \"UsdBeta_all_A_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5009.62, clRangeHigh, 2, psSolid, \"UsdBeta_all_B_MediaRange\", TamanhoFonte, tpTopRight, 0, 0);\n    HorizontalLineCustom(5084.09, clGammaFlip, 2, psDashDot, \"UsdBeta_all_B_MediaOI\", TamanhoFonte, tpTopRight, 0, 0);\n    end;\n  end;\n\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "open_interest_total": 18730,
        "volume_total": 3155,
        "total_trades": 18730,
        "total_volume": 18730,
        "gamma_exposure": 77577513.85691704,
        "delta_position": -8831.99569195149,
        "last_update": "2026-04-23T15:06:53.481896",
        "spot_price": 4999.5,
        "dealer_pressure": 0.09520919033938244,
        "regime": "Gamma Negativo"
    },
    "key_levels": {
        "gamma_flip": 5008.506920142905,
        "gamma_flip_hvl": 5002.7586395813605,
        "gamma_flip_hvl_gaussian": 4960.515646462605,
        "call_wall": 5200.0,
        "put_wall": 5100.0,
        "effective_call_wall": 5439.145907473309,
        "effective_put_wall": 4989.945990859992,
        "max_pain": 5200.0,
        "zero_gamma": 5008.506920142905,
        "range_low": 4961.707332343807,
        "range_high": 5037.292667656193,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "move": 37.79266765619263,
                "upper": 5037.292667656193,
                "lower": 4961.707332343807
            },
            {
                "label": "1 Semana",
                "days": 5,
                "move": 84.50697393030435,
                "upper": 5084.006973930304,
                "lower": 4914.993026069696
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 6.0,
                "move": 92.57275177625742,
                "upper": 5092.072751776257,
                "lower": 4906.927248223743
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
            4450.0,
            4800.0,
            4950.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5500.0,
            5700.0,
            5900.0,
            6050.0,
            6100.0
        ],
        "call_oi": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            1850.0,
            30.0,
            300.0,
            320.0,
            960.0,
            40.0,
            10.0
        ],
        "put_oi": [
            40.0,
            4415.0,
            40.0,
            590.0,
            7620.0,
            2450.0,
            0.0,
            65.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_oi": [
            40.0,
            4415.0,
            40.0,
            590.0,
            7620.0,
            2450.0,
            1850.0,
            95.0,
            300.0,
            320.0,
            960.0,
            40.0,
            10.0
        ]
    },
    "oi_data_nearest": {
        "strikes": [
            4450.0,
            4800.0,
            4950.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5500.0,
            5700.0,
            5900.0,
            6050.0,
            6100.0
        ],
        "call_oi": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            900.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "put_oi": [
            0.0,
            0.0,
            0.0,
            590.0,
            6820.0,
            2450.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_oi": [
            0.0,
            0.0,
            0.0,
            590.0,
            6820.0,
            2450.0,
            900.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ]
    },
    "oi_by_expiry": [
        {
            "expiry": "2026-05-01",
            "days_to_exp": 6,
            "call_oi": 900,
            "put_oi": 9860
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 49,
            "call_oi": 0,
            "put_oi": 5215
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 72,
            "call_oi": 200,
            "put_oi": 0
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 93,
            "call_oi": 320,
            "put_oi": 0
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 115,
            "call_oi": 10,
            "put_oi": 0
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 137,
            "call_oi": 950,
            "put_oi": 0
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 158,
            "call_oi": 30,
            "put_oi": 0
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 181,
            "call_oi": 300,
            "put_oi": 0
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 202,
            "call_oi": 0,
            "put_oi": 65
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 222,
            "call_oi": 760,
            "put_oi": 0
        },
        {
            "expiry": "2027-04-01",
            "days_to_exp": 245,
            "call_oi": 40,
            "put_oi": 80
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
                4950.064238149176,
                4950.307740087185,
                4952.728094027674,
                4961.503934619698,
                4973.144886998418,
                4983.9655320094125,
                4992.841318272561,
                4999.823652013389,
                5001.554231443509,
                5002.7586395813605,
                5003.681364840245,
                5004.402300258949,
                5004.975371451199,
                5005.43787944329,
                5005.816207712836,
                5006.129398913266,
                5006.391451351283,
                5006.61282726347,
                5006.801464515239,
                5006.963468566255,
                5007.103594330098,
                5007.225587323335,
                5007.332428904873,
                5007.426515066411,
                5007.509788483416,
                5007.583837225328,
                5007.64996937066,
                5007.7092699963405,
                5007.762645127155,
                5007.810855935767
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4249.575,
                4280.184183673469,
                4310.793367346939,
                4341.402551020408,
                4372.011734693878,
                4402.620918367346,
                4433.230102040816,
                4463.839285714285,
                4494.448469387755,
                4525.057653061224,
                4555.666836734694,
                4586.276020408163,
                4616.885204081633,
                4647.494387755101,
                4678.103571428571,
                4708.71275510204,
                4739.32193877551,
                4769.931122448979,
                4800.540306122449,
                4831.149489795918,
                4861.758673469388,
                4892.367857142857,
                4922.977040816326,
                4953.586224489795,
                4984.195408163265,
                5014.804591836734,
                5045.413775510204,
                5076.022959183673,
                5106.632142857143,
                5137.241326530611,
                5167.850510204081,
                5198.45969387755,
                5229.06887755102,
                5259.678061224489,
                5290.287244897959,
                5320.896428571428,
                5351.505612244898,
                5382.114795918367,
                5412.723979591836,
                5443.333163265305,
                5473.942346938775,
                5504.551530612244,
                5535.160714285714,
                5565.769897959183,
                5596.379081632653,
                5626.988265306121,
                5657.597448979592,
                5688.20663265306,
                5718.81581632653,
                5749.424999999999
            ],
            "deltas": [
                -15068.592461264916,
                -15027.845765257036,
                -14976.720980797612,
                -14913.422202149271,
                -14836.14976101152,
                -14743.192540982282,
                -14633.030824377061,
                -14504.442355494046,
                -14356.602979073512,
                -14189.172772261232,
                -14002.359135795152,
                -13796.949670110022,
                -13574.30906478741,
                -13336.333608054521,
                -13085.349813122924,
                -12823.92252139205,
                -12554.493851038036,
                -12278.704078110832,
                -11996.16463050523,
                -11702.42134840126,
                -11386.001585521091,
                -11024.997749045466,
                -10584.725748306008,
                -10019.22507714437,
                -9279.533653840313,
                -8329.33240219605,
                -7163.732087541241,
                -5822.460092995573,
                -4388.700559421016,
                -2971.079643240063,
                -1675.3979961755485,
                -578.3563627511126,
                286.21972993292303,
                925.5242114229144,
                1374.730041543068,
                1680.602508635504,
                1888.2523207892118,
                2033.817137713852,
                2142.559683948283,
                2230.2950001077425,
                2306.0500790157353,
                2374.6063226807933,
                2438.3710117187143,
                2498.5406498428874,
                2555.7354445870383,
                2610.3097869142875,
                2662.4914305531024,
                2712.4405614279613,
                2760.2751782949153,
                2806.0834837319017
            ],
            "flip_value": 5218.935643057697
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                1050.0,
                30.0,
                100.0,
                135.0,
                860.0,
                40.0,
                10.0
            ],
            "bear": [
                -40.0,
                -5.0,
                -40.0,
                -75.0,
                -700.0,
                -50.0,
                -0.0,
                -20.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4249.575,
                4280.184183673469,
                4310.793367346939,
                4341.402551020408,
                4372.011734693878,
                4402.620918367346,
                4433.230102040816,
                4463.839285714285,
                4494.448469387755,
                4525.057653061224,
                4555.666836734694,
                4586.276020408163,
                4616.885204081633,
                4647.494387755101,
                4678.103571428571,
                4708.71275510204,
                4739.32193877551,
                4769.931122448979,
                4800.540306122449,
                4831.149489795918,
                4861.758673469388,
                4892.367857142857,
                4922.977040816326,
                4953.586224489795,
                4984.195408163265,
                5014.804591836734,
                5045.413775510204,
                5076.022959183673,
                5106.632142857143,
                5137.241326530611,
                5167.850510204081,
                5198.45969387755,
                5229.06887755102,
                5259.678061224489,
                5290.287244897959,
                5320.896428571428,
                5351.505612244898,
                5382.114795918367,
                5412.723979591836,
                5443.333163265305,
                5473.942346938775,
                5504.551530612244,
                5535.160714285714,
                5565.769897959183,
                5596.379081632653,
                5626.988265306121,
                5657.597448979592,
                5688.20663265306,
                5718.81581632653,
                5749.424999999999
            ],
            "pnl": [
                -17198787.996799238,
                -16455112.223285634,
                -15711461.487084266,
                -14967860.274991557,
                -14224343.599744657,
                -13480951.877503067,
                -12737720.85214103,
                -11994671.67474465,
                -11251810.505267851,
                -10509150.12948827,
                -9766770.82779053,
                -9024944.555636548,
                -8284343.511790463,
                -7546317.329992027,
                -6813141.106904504,
                -6088049.1553874,
                -5374871.250134299,
                -4677253.985449187,
                -3997726.916730269,
                -3337069.5876663206,
                -2694369.9411515426,
                -2067846.258003121,
                -1456139.2103916805,
                -859582.7790475632,
                -280988.1831861348,
                274358.1613365769,
                799555.0093648132,
                1287616.1949137386,
                1733226.5924713237,
                2134147.089916967,
                2491795.0265172417,
                2810853.2945329207,
                3098141.595319672,
                3361213.4885776024,
                3607133.2083475785,
                3841700.0488016484,
                4069162.816535636,
                4292310.629822797,
                4512771.6505519515,
                4731371.762908998,
                4948456.6494385945,
                5164131.049473052,
                5378405.731787805,
                5591265.825968066,
                5802686.19793831,
                6012621.398303257,
                6220990.475690756,
                6427665.191813099,
                6632461.280552427,
                6835131.73469311
            ]
        },
        "max_pain_profile": {
            "strikes": [
                4450.0,
                4800.0,
                4950.0,
                5000.0,
                5100.0,
                5150.0,
                5200.0,
                5250.0,
                5500.0,
                5700.0,
                5900.0,
                6050.0,
                6100.0
            ],
            "loss": [
                8609750.0,
                3296750.0,
                1682000.0,
                1145750.0,
                132250.0,
                6500.0,
                3250.0,
                92500.0,
                562500.0,
                998500.0,
                1498500.0,
                2017500.0,
                2192500.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5200.0,
                "options": [
                    {
                        "Strike": 4999.5,
                        "Call_Now": 39.959064236386894,
                        "Call_Sim": 206.9255217515847,
                        "Call_Chg": 417.8437626253456,
                        "Put_Now": 34.010819846265804,
                        "Put_Sim": 0.4772773614643455,
                        "Put_Chg": -98.59668963105943
                    },
                    {
                        "Strike": 5008.506920142905,
                        "Call_Now": 35.437943740234005,
                        "Call_Sim": 198.07884681820906,
                        "Call_Chg": 458.94565517164256,
                        "Put_Now": 38.48590334896153,
                        "Put_Sim": 0.6268064269364828,
                        "Put_Chg": -98.37133502817105
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 7.6295617219037695,
                        "Call_Sim": 112.44075919804891,
                        "Call_Chg": 1373.751223156657,
                        "Put_Now": 102.06174566237496,
                        "Put_Sim": 6.372943138519986,
                        "Put_Chg": -93.75579645717409
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.6824909777190413,
                        "Call_Sim": 41.56158296413878,
                        "Call_Chg": 5989.689727920227,
                        "Put_Now": 194.99569813270955,
                        "Put_Sim": 35.37479011912819,
                        "Put_Chg": -81.85868177714724
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 4999.5,
                        "Call_Now": 39.959064236386894,
                        "Call_Sim": 112.37905973202214,
                        "Call_Chg": 181.23546404194644,
                        "Put_Now": 34.010819846265804,
                        "Put_Sim": 5.930815341901393,
                        "Put_Chg": -82.56197478123256
                    },
                    {
                        "Strike": 5008.506920142905,
                        "Call_Now": 35.437943740234005,
                        "Call_Sim": 104.64125060443075,
                        "Call_Chg": 195.2802548913911,
                        "Put_Now": 38.48590334896153,
                        "Put_Sim": 7.189210213156684,
                        "Put_Chg": -81.31988705586491
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 7.6295617219037695,
                        "Call_Sim": 40.7623217532896,
                        "Call_Chg": 434.2681957243327,
                        "Put_Now": 102.06174566237496,
                        "Put_Sim": 34.694505693760675,
                        "Put_Chg": -66.00635677099652
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.6824909777190413,
                        "Call_Sim": 8.178228414655337,
                        "Call_Chg": 1098.2910663504829,
                        "Put_Now": 194.99569813270955,
                        "Put_Sim": 101.99143556964555,
                        "Put_Chg": -47.69554582674304
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5008.506920142905,
                "options": [
                    {
                        "Strike": 4999.5,
                        "Call_Now": 39.959064236386894,
                        "Call_Sim": 44.90024906347435,
                        "Call_Chg": 12.365616967045966,
                        "Put_Now": 34.010819846265804,
                        "Put_Sim": 29.94508453044864,
                        "Put_Chg": -11.954240839223871
                    },
                    {
                        "Strike": 5008.506920142905,
                        "Call_Now": 35.437943740234005,
                        "Call_Sim": 40.03105305538156,
                        "Call_Chg": 12.960992739352514,
                        "Put_Now": 38.48590334896153,
                        "Put_Sim": 34.0720925212031,
                        "Put_Chg": -11.468642915140313
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 7.6295617219037695,
                        "Call_Sim": 9.164947191665192,
                        "Call_Chg": 20.124163428070478,
                        "Put_Now": 102.06174566237496,
                        "Put_Sim": 94.59021098923131,
                        "Put_Chg": -7.320602469273687
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.6824909777190413,
                        "Call_Sim": 0.8871059813807847,
                        "Call_Chg": 29.980616644279873,
                        "Put_Now": 194.99569813270955,
                        "Put_Sim": 186.19339299346575,
                        "Put_Chg": -4.514102220477271
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5049.495,
                "options": [
                    {
                        "Strike": 4999.5,
                        "Call_Now": 39.959064236386894,
                        "Call_Sim": 71.5833212338598,
                        "Call_Chg": 79.14163557582945,
                        "Put_Now": 34.010819846265804,
                        "Put_Sim": 15.640076843739507,
                        "Put_Chg": -54.014408019462365
                    },
                    {
                        "Strike": 5008.506920142905,
                        "Call_Now": 35.437943740234005,
                        "Call_Sim": 65.2262862991115,
                        "Call_Chg": 84.05776242896876,
                        "Put_Now": 38.48590334896153,
                        "Put_Sim": 18.279245907838458,
                        "Put_Chg": -52.50404871078156
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 7.6295617219037695,
                        "Call_Sim": 19.363118258934946,
                        "Call_Chg": 153.79070207067355,
                        "Put_Now": 102.06174566237496,
                        "Put_Sim": 63.800302199406815,
                        "Put_Chg": -37.48852541630906
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.6824909777190413,
                        "Call_Sim": 2.643182475209528,
                        "Call_Chg": 287.284603240226,
                        "Put_Now": 194.99569813270955,
                        "Put_Sim": 146.96138963019985,
                        "Put_Chg": -24.633522155867595
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 4949.505,
                "options": [
                    {
                        "Strike": 4999.5,
                        "Call_Now": 39.959064236386894,
                        "Call_Sim": 18.826078334253452,
                        "Call_Chg": -52.886588577541445,
                        "Put_Now": 34.010819846265804,
                        "Put_Sim": 62.87283394413271,
                        "Put_Chg": 84.86127129051195
                    },
                    {
                        "Strike": 5008.506920142905,
                        "Call_Now": 35.437943740234005,
                        "Call_Sim": 16.16386344233797,
                        "Call_Chg": -54.38825807495557,
                        "Put_Now": 38.48590334896153,
                        "Put_Sim": 69.20682305106538,
                        "Put_Chg": 79.82382386493418
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 7.6295617219037695,
                        "Call_Sim": 2.410006911215703,
                        "Call_Chg": -68.41224962769755,
                        "Put_Now": 102.06174566237496,
                        "Put_Sim": 146.8371908516865,
                        "Put_Chg": 43.87093802748663
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.6824909777190413,
                        "Call_Sim": 0.13653277562949384,
                        "Call_Chg": -79.99493325379903,
                        "Put_Now": 194.99569813270955,
                        "Put_Sim": 244.44473993062002,
                        "Put_Chg": 25.359042415518623
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.0010568402233112081,
            -0.12904550965263448,
            -0.0010036909170988734,
            0.02286833272800992,
            0.5,
            0.08322681953863557,
            0.07278954080126258,
            0.001202044551480232,
            0.01634261896454809,
            0.012226424304188598,
            0.041506606258657604,
            0.001938229559324532,
            0.00015698222940617945
        ]
    },
    "delta_data": {
        "strikes": [
            4450.0,
            4800.0,
            4950.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5500.0,
            5700.0,
            5900.0,
            6050.0,
            6100.0
        ],
        "delta_values": [
            -2.9186767134339675,
            -722.3003330605773,
            -11.590272308457328,
            -278.97144909703275,
            -6192.854205316206,
            -2295.085210035792,
            457.9876718385021,
            -19.869162150825545,
            88.98251185784389,
            20.999993245050558,
            118.38843461109315,
            5.070064719989091,
            0.16494045835936366
        ],
        "delta_cumulative": [
            -2.9186767134339675,
            -725.2190097740113,
            -736.8092820824686,
            -1015.7807311795013,
            -7208.634936495708,
            -9503.7201465315,
            -9045.732474692997,
            -9065.601636843823,
            -8976.619124985978,
            -8955.619131740928,
            -8837.230697129835,
            -8832.160632409847,
            -8831.995691951488
        ]
    },
    "gamma_data": {
        "strikes": [
            4450.0,
            4800.0,
            4950.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5500.0,
            5700.0,
            5900.0,
            6050.0,
            6100.0
        ],
        "gamma_values": [
            23430.048230864966,
            10298742.340459963,
            57837.1848483581,
            6341134.227010208,
            47477527.45625114,
            8210318.634719166,
            3318243.9736718833,
            183021.477130148,
            510174.07388856326,
            280362.8760033399,
            839052.5954615547,
            35134.93433541723,
            2534.0349064412726
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            3318243.9736718833,
            62389.350956075425,
            510174.07388856326,
            280362.8760033399,
            839052.5954615547,
            35134.93433541723,
            2534.0349064412726
        ],
        "gamma_put": [
            23430.048230864966,
            10298742.340459963,
            57837.1848483581,
            6341134.227010208,
            47477527.45625114,
            8210318.634719166,
            0.0,
            120632.12617407259,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            23430.048230864966,
            10322172.388690827,
            10380009.573539186,
            16721143.800549395,
            64198671.25680053,
            72408989.8915197,
            75727233.86519158,
            75910255.34232172,
            76420429.4162103,
            76700792.29221363,
            77539844.88767518,
            77574979.82201059,
            77577513.85691704
        ]
    },
    "volume_data": {
        "strikes": [
            4450.0,
            4800.0,
            4950.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5500.0,
            5700.0,
            5900.0,
            6050.0,
            6100.0
        ],
        "call_volume": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            1850.0,
            30.0,
            300.0,
            320.0,
            960.0,
            40.0,
            10.0
        ],
        "put_volume": [
            40.0,
            4415.0,
            40.0,
            590.0,
            7620.0,
            2450.0,
            0.0,
            65.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_volume": [
            40.0,
            4415.0,
            40.0,
            590.0,
            7620.0,
            2450.0,
            1850.0,
            95.0,
            300.0,
            320.0,
            960.0,
            40.0,
            10.0
        ]
    },
    "volatility_data": {
        "strikes": [
            4450.0,
            4800.0,
            4950.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5500.0,
            5700.0,
            5900.0,
            6050.0,
            6100.0
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
            1.0842021724855044e-19,
            -2.168404344971009e-19,
            -1.6263032587282567e-19,
            2.168404344971009e-19,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            -2.168404344971009e-19,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            4450.0,
            4800.0,
            4950.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5500.0,
            5700.0,
            5900.0,
            6050.0,
            6100.0
        ],
        "charm": [
            -1.4658110438713479,
            -1568.1131955880453,
            2.716346229995281,
            391.1002555655915,
            40418.76556212732,
            10644.125521347776,
            2279.9002281015437,
            22.691541646901435,
            96.95219236191366,
            115.65016893101743,
            221.97188251447497,
            8.902093150267145,
            1.2496571094830418
        ],
        "vanna": [
            -61.435252020630045,
            -8423.157199571377,
            -49.99359322566521,
            -97.93242745537361,
            14581.282741983197,
            3896.5954102632895,
            1325.5281481117363,
            52.496424363086156,
            552.012576000864,
            535.8362479391342,
            1804.361623622848,
            87.10774901756511,
            7.538578890135552
        ],
        "vex": [
            27332.32276371552,
            2402799.5754527138,
            67469.96798485213,
            181157.1461025002,
            1965365.856325067,
            234557.07436730555,
            1424930.3180947881,
            162960.87817870834,
            439677.4915385359,
            124148.28615982748,
            857290.59082073,
            40986.657648980974,
            1387.547013520582
        ],
        "theta": [
            -3.6382959076265307,
            -2205.1504947140434,
            -4.11795816441839,
            -1530.8323104306894,
            -7261.247084488865,
            2.4805036630446864,
            -1374.1445456829297,
            -28.61436433749743,
            -228.63248068355588,
            -100.28117336586818,
            -350.6580236641857,
            -14.785020916310522,
            -0.882919737535534
        ],
        "charm_cum": [
            -1.4658110438713479,
            -1569.5790066319166,
            -1566.8626604019214,
            -1175.76240483633,
            39243.003157290994,
            49887.12867863877,
            52167.028906740314,
            52189.72044838721,
            52286.67264074912,
            52402.32280968014,
            52624.29469219461,
            52633.19678534488,
            52634.44644245436
        ],
        "vanna_cum": [
            -61.435252020630045,
            -8484.592451592007,
            -8534.586044817672,
            -8632.518472273045,
            5948.764269710153,
            9845.359679973442,
            11170.887828085179,
            11223.384252448264,
            11775.396828449127,
            12311.233076388262,
            14115.59470001111,
            14202.702449028675,
            14210.24102791881
        ],
        "theta_cum": [
            -3.6382959076265307,
            -2208.7887906216697,
            -2212.906748786088,
            -3743.7390592167776,
            -11004.986143705642,
            -11002.505640042598,
            -12376.650185725528,
            -12405.264550063026,
            -12633.897030746582,
            -12734.17820411245,
            -13084.836227776635,
            -13099.621248692945,
            -13100.504168430482
        ],
        "r_gamma": [
            23430.048230864966,
            10298742.340459963,
            57837.1848483581,
            -6341134.227010208,
            -47477527.45625114,
            -8210318.634719166,
            -3318243.9736718833,
            -183021.477130148,
            -510174.07388856326,
            -280362.8760033399,
            -839052.5954615547,
            -35134.93433541723,
            -2534.0349064412726
        ],
        "r_gamma_cum": [
            23430.048230864966,
            10322172.388690827,
            10380009.573539186,
            4038875.346528978,
            -43438652.10972216,
            -51648970.74444132,
            -54967214.71811321,
            -55150236.19524335,
            -55660410.269131914,
            -55940773.14513525,
            -56779825.74059681,
            -56814960.67493223,
            -56817494.709838666
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
            "strike": 4450.0,
            "delta": -2.9186767134339675,
            "gamma": 23430.048230864966,
            "volume": 0,
            "oi": 40,
            "iv": 12.0
        },
        {
            "strike": 4800.0,
            "delta": -722.3003330605773,
            "gamma": 10298742.340459963,
            "volume": 0,
            "oi": 4415,
            "iv": 12.0
        },
        {
            "strike": 4950.0,
            "delta": -11.590272308457328,
            "gamma": 57837.1848483581,
            "volume": 0,
            "oi": 40,
            "iv": 12.0
        },
        {
            "strike": 5000.0,
            "delta": -278.97144909703275,
            "gamma": 6341134.227010208,
            "volume": 0,
            "oi": 590,
            "iv": 12.0
        },
        {
            "strike": 5100.0,
            "delta": -6192.854205316206,
            "gamma": 47477527.45625114,
            "volume": 0,
            "oi": 7620,
            "iv": 12.0
        },
        {
            "strike": 5150.0,
            "delta": -2295.085210035792,
            "gamma": 8210318.634719166,
            "volume": 0,
            "oi": 2450,
            "iv": 12.0
        },
        {
            "strike": 5200.0,
            "delta": 457.9876718385021,
            "gamma": 3318243.9736718833,
            "volume": 0,
            "oi": 1850,
            "iv": 12.0
        },
        {
            "strike": 5250.0,
            "delta": -19.869162150825545,
            "gamma": 183021.477130148,
            "volume": 0,
            "oi": 95,
            "iv": 12.0
        },
        {
            "strike": 5500.0,
            "delta": 88.98251185784389,
            "gamma": 510174.07388856326,
            "volume": 0,
            "oi": 300,
            "iv": 12.0
        },
        {
            "strike": 5700.0,
            "delta": 20.999993245050558,
            "gamma": 280362.8760033399,
            "volume": 0,
            "oi": 320,
            "iv": 12.0
        },
        {
            "strike": 5900.0,
            "delta": 118.38843461109315,
            "gamma": 839052.5954615547,
            "volume": 0,
            "oi": 960,
            "iv": 12.0
        },
        {
            "strike": 6050.0,
            "delta": 5.070064719989091,
            "gamma": 35134.93433541723,
            "volume": 0,
            "oi": 40,
            "iv": 12.0
        },
        {
            "strike": 6100.0,
            "delta": 0.16494045835936366,
            "gamma": 2534.0349064412726,
            "volume": 0,
            "oi": 10,
            "iv": 12.0
        }
    ],
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-04-23",
        "meetings": [
            {
                "date": "2026-04-29",
                "days_remaining": 6,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.50-3.75": 97.9,
                    "3.75-4.00": 2.1
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 55,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 3.5,
                    "3.50-3.75": 94.4,
                    "3.75-4.00": 2.1
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 97,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.2,
                    "3.25-3.50": 7.5,
                    "3.50-3.75": 90.3,
                    "3.75-4.00": 2.0
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 146,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.7,
                    "3.25-3.50": 14.1,
                    "3.50-3.75": 83.3,
                    "3.75-4.00": 1.8
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 188,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.7,
                    "3.25-3.50": 14.1,
                    "3.50-3.75": 83.3,
                    "3.75-4.00": 1.8
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 230,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 1.3,
                    "3.25-3.50": 17.2,
                    "3.50-3.75": 79.7,
                    "3.75-4.00": 1.7
                }
            },
            {
                "date": "2027-01-27",
                "days_remaining": 279,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 1.3,
                    "3.25-3.50": 16.8,
                    "3.50-3.75": 78.2,
                    "3.75-4.00": 3.6,
                    "4.00-4.25": 0.0
                }
            },
            {
                "date": "2027-03-17",
                "days_remaining": 328,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 1.3,
                    "3.25-3.50": 16.5,
                    "3.50-3.75": 77.1,
                    "3.75-4.00": 4.9,
                    "4.00-4.25": 0.1,
                    "4.25-4.50": 0.0
                }
            },
            {
                "date": "2027-04-28",
                "days_remaining": 370,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 1.3,
                    "3.25-3.50": 16.2,
                    "3.50-3.75": 75.8,
                    "3.75-4.00": 6.5,
                    "4.00-4.25": 0.2,
                    "4.25-4.50": 0.0
                }
            },
            {
                "date": "2027-06-09",
                "days_remaining": 412,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.2,
                    "3.00-3.25": 3.0,
                    "3.25-3.50": 23.0,
                    "3.50-3.75": 67.9,
                    "3.75-4.00": 5.8,
                    "4.00-4.25": 0.2,
                    "4.25-4.50": 0.0
                }
            },
            {
                "date": "2027-07-28",
                "days_remaining": 461,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.50-1.75": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.3,
                    "3.00-3.25": 3.9,
                    "3.25-3.50": 25.0,
                    "3.50-3.75": 65.0,
                    "3.75-4.00": 5.5,
                    "4.00-4.25": 0.2,
                    "4.25-4.50": 0.0
                }
            },
            {
                "date": "2027-09-15",
                "days_remaining": 510,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.50-1.75": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.2,
                    "2.75-3.00": 2.3,
                    "3.00-3.25": 15.8,
                    "3.25-3.50": 47.6,
                    "3.50-3.75": 31.4,
                    "3.75-4.00": 2.5,
                    "4.00-4.25": 0.1,
                    "4.25-4.50": 0.0
                }
            },
            {
                "date": "2027-10-27",
                "days_remaining": 552,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.25-1.50": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.4,
                    "2.75-3.00": 3.6,
                    "3.00-3.25": 18.9,
                    "3.25-3.50": 46.1,
                    "3.50-3.75": 28.7,
                    "3.75-4.00": 2.3,
                    "4.00-4.25": 0.1,
                    "4.25-4.50": 0.0
                }
            },
            {
                "date": "2027-12-08",
                "days_remaining": 594,
                "current_rate": "3.00-3.25",
                "probs": {
                    "1.00-1.25": 0.0,
                    "1.50-1.75": 0.0,
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.1,
                    "2.25-2.50": 1.4,
                    "2.50-2.75": 8.5,
                    "2.75-3.00": 27.6,
                    "3.00-3.25": 40.5,
                    "3.25-3.50": 20.2,
                    "3.50-3.75": 1.6,
                    "3.75-4.00": 0.0,
                    "4.00-4.25": 0.0,
                    "4.25-4.50": 14.75
                }
            }
        ]
    }
};