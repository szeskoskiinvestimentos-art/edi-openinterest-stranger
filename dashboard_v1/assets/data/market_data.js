window.marketData = {
    "last_updated": "2026-03-11 08:27:26",
    "spot_price": 37.53,
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-03-11",
        "meetings": [
            {
                "date": "2026-03-18",
                "days_remaining": 6,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 1.3,
                    "3.50-3.75": 98.7
                }
            },
            {
                "date": "2026-04-29",
                "days_remaining": 48,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.1,
                    "3.25-3.50": 11.7,
                    "3.50-3.75": 88.1
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 97,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 3.3,
                    "3.25-3.50": 32.7,
                    "3.50-3.75": 64.0
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 139,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.9,
                    "3.00-3.25": 11.1,
                    "3.25-3.50": 41.0,
                    "3.50-3.75": 47.0
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 188,
                "current_rate": "3.25-3.50",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.3,
                    "2.75-3.00": 4.3,
                    "3.00-3.25": 21.1,
                    "3.25-3.50": 43.0,
                    "3.50-3.75": 31.3
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 230,
                "current_rate": "3.25-3.50",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.1,
                    "2.50-2.75": 1.1,
                    "2.75-3.00": 7.8,
                    "3.00-3.25": 25.6,
                    "3.25-3.50": 40.6,
                    "3.50-3.75": 24.8
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 272,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.4,
                    "2.50-2.75": 3.1,
                    "2.75-3.00": 13.1,
                    "3.00-3.25": 30.1,
                    "3.25-3.50": 35.9,
                    "3.50-3.75": 17.4
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 11/03/2026 08:27\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(false);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(false);\n  MostrarPLUS2(false);\n  ExibirMelhoresPontos(true);\n  MostrarTodosPontos(false);\n  ModeloFlip(7);\n  spot(0);\n  // 1 = Classic (133664.03)\n  // 2 = Spline (133664.03)\n  // 3 = HVL (133664.03)\n  // 4 = HVL Log (187710.96)\n  // 5 = Sigma Kernel (133664.03)\n  // 6 = PVOP (133664.03)\n  // 7 = HVL Gaussian (133664.03)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 133664.03;\n\n  if (ModeloFlip = 1) then GammaVal := 133664.03;\n  if (ModeloFlip = 2) then GammaVal := 133664.03;\n  if (ModeloFlip = 3) then GammaVal := 133664.03;\n  if (ModeloFlip = 4) then GammaVal := 187710.96;\n  if (ModeloFlip = 5) then GammaVal := 133664.03;\n  if (ModeloFlip = 6) then GammaVal := 133664.03;\n  if (ModeloFlip = 7) then GammaVal := 133664.03;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(69307.27, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(69307.27, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(74257.79, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(74257.79, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(79208.31, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(84158.83, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(89109.35, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(94059.87, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(94059.87, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(99010.39, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(99010.39, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(103960.91, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(103960.91, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(108911.43, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(108911.43, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(113861.95, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(113861.95, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(118812.47, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(118812.47, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(123762.99, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(123762.99, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(128713.51, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(128713.51, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(130668.68, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(133664.03, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(133664.03, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(138614.55, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(138614.55, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(143565.07, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(143565.07, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(148515.59, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(148515.59, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(153466.11, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(153466.11, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(158416.63, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(158416.63, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(160891.89, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(160891.89, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(163367.15, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(163367.15, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirMaxPain and MostrarTodosPontos) then\n    HorizontalLineCustom(163367.15, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(165842.41, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(165842.41, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(168317.67, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(168317.67, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(170792.93, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(170792.93, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(173268.19, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(173268.19, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(175743.45, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(175743.45, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(178218.71, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(178218.71, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(178218.71, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(178218.71, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(180693.96, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(180693.96, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(180693.96, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(180693.96, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(183169.22, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(183169.22, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(183169.22, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(183169.22, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirRange and MostrarTodosPontos) then\n    HorizontalLineCustom(183169.22, clRangeLow, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirRange and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(183169.22, clRangeLow, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirEffectiveWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(183324.36, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(183324.36, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(185644.48, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(185644.48, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(185644.48, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(185644.48, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(188119.74, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(188119.74, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(188119.74, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(188119.74, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirRange and MostrarTodosPontos) then\n    HorizontalLineCustom(188119.74, clRangeHigh, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirRange and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(188119.74, clRangeHigh, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(190595.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(190595.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(190595.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(190595.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(193070.26, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(193070.26, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(193070.26, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(193070.26, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (157924.05 > 0) then\n      HorizontalLineCustom(157924.05, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (MostrarTodosPontos) then HorizontalLineCustom(71782.53, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(76733.05, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(81683.57, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(86634.09, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(91584.61, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(96535.13, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(101485.65, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(106436.17, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(111386.69, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(116337.21, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(121287.73, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(126238.25, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(131188.77, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(136139.29, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(141089.81, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(146040.33, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(150990.85, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(155941.37, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(159654.26, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(162129.52, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(164604.78, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(167080.04, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(169555.30, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(172030.56, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(174505.82, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(176981.08, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(176981.08, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(179456.33, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(179456.33, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(181931.59, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(181931.59, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(184406.85, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(184406.85, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(186882.11, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(186882.11, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(189357.37, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(189357.37, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(191832.63, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(191832.63, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (MostrarTodosPontos) then HorizontalLineCustom(71198.37, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(72366.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(76148.89, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(77317.21, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(81099.41, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(82267.73, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(86049.93, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(87218.25, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(91000.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(92168.77, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(95950.97, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(97119.29, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(100901.49, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(102069.81, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(105852.01, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(107020.33, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(110802.53, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(111970.85, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(115753.05, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(116921.37, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(120703.57, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(121871.89, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(125654.09, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(126822.41, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(130604.61, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(131772.93, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(135555.13, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(136723.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(140505.65, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(141673.97, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(145456.17, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(146624.49, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(150406.69, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(151575.01, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(155357.21, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(156525.53, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(159362.18, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(159946.34, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(161837.44, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(162421.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(164312.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(164896.86, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(166787.96, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(167372.12, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(169263.22, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(169847.38, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(171738.47, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(172322.64, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(174213.73, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(174797.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(176688.99, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(176688.99, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(177273.16, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(177273.16, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(179164.25, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(179164.25, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(179748.42, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(179748.42, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(181639.51, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(181639.51, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(182223.68, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(182223.68, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(184114.77, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(184114.77, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(184698.94, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(184698.94, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(186590.03, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(186590.03, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(187174.19, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(187174.19, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(189065.29, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(189065.29, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(189649.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(189649.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(191540.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(191540.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(192124.71, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(192124.71, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (MostrarTodosPontos) then HorizontalLineCustom(70475.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(73089.47, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(75426.12, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(78039.99, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(80376.64, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(82990.51, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(85327.16, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(87941.03, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(90277.68, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(92891.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(95228.19, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(97842.07, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(100178.71, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(102792.59, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(105129.23, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(107743.11, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(110079.75, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(112693.63, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(115030.27, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(117644.15, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(119980.79, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(122594.67, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(124931.31, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(127545.19, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(129881.83, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(132495.71, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(134832.35, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(137446.23, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(139782.87, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(142396.75, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(144733.39, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(147347.26, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(149683.91, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(152297.78, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(154634.43, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(157248.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(159000.79, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(160307.73, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(161476.05, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(162782.98, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(163951.31, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(165258.24, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(166426.57, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(167733.50, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(168901.83, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(170208.76, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(171377.09, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(172684.02, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(173852.35, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(175159.28, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(176327.61, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(176327.61, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(177634.54, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(177634.54, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(178802.87, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(178802.87, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(180109.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(180109.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(181278.13, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(181278.13, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(182585.06, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(182585.06, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(183753.39, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(183753.39, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(185060.32, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(185060.32, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(186228.65, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(186228.65, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(187535.58, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(187535.58, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(188703.91, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(188703.91, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(190010.84, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(190010.84, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(191179.17, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(191179.17, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(192486.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(192486.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos) then\n  begin\n    HorizontalLineCustom(185885.08, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(185700.97, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(186235.69, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(185351.36, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(187147.10, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(184448.69, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(191547.94, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(180210.97, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "positive"
    },
    "overview": {
        "total_trades": 3318490,
        "total_volume": 44725,
        "gamma_exposure": 12017097681903.387,
        "delta_position": 214494456783635.25,
        "last_update": "2026-03-11T08:27:26.382154",
        "spot_price": 185793.0,
        "dealer_pressure": 0.18659893583721907,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 133664.0287769784,
        "gamma_flip_hvl": 69307.27418065547,
        "gamma_flip_hvl_gaussian": 133664.0287769784,
        "call_wall": 188119.74420463628,
        "put_wall": 183169.22462030375,
        "effective_call_wall": 183324.35849166784,
        "effective_put_wall": 130668.67833289651,
        "max_pain": 163367.1462829736,
        "zero_gamma": 133664.0287769784,
        "range_low": 179505.68700484678,
        "range_high": 192080.31299515316,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "move": 1.2700309307029833,
                "upper": 192080.31299515322,
                "lower": 179505.68700484678
            },
            {
                "label": "1 Semana",
                "days": 5,
                "move": 2.839875494579195,
                "upper": 199851.85925298036,
                "lower": 171734.14074701964
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 2.0,
                "move": 1.7960949668334834,
                "upper": 194684.60330863026,
                "lower": 176901.39669136974
            }
        ],
        "pinning_risk": {
            "strike": null,
            "score": null
        },
        "volatility_analysis": {
            "iv_current": 0.5372,
            "hv_current": 0.2998,
            "vrp": 1.791861240827218,
            "iv_rank": 39.93,
            "regime": "Cara (Venda de Vol)",
            "rank_desc": "M\u00e9dia"
        }
    },
    "most_actives": {
        "top_oi": [
            {
                "strike": 32.0,
                "type": "CALL",
                "oi": 131761,
                "volume": 0,
                "expiry": "2026-12-18 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 38.0,
                "type": "CALL",
                "oi": 131048,
                "volume": 8126,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 25.0,
                "type": "PUT",
                "oi": 85943,
                "volume": 10,
                "expiry": "2026-06-18 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 36.0,
                "type": "CALL",
                "oi": 83106,
                "volume": 11,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 26.0,
                "type": "PUT",
                "oi": 76634,
                "volume": 0,
                "expiry": "2026-06-18 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 35.0,
                "type": "CALL",
                "oi": 71234,
                "volume": 5,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 28.0,
                "type": "PUT",
                "oi": 67171,
                "volume": 497,
                "expiry": "2026-06-18 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 28.0,
                "type": "PUT",
                "oi": 67171,
                "volume": 497,
                "expiry": "2026-06-18 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 35.0,
                "type": "PUT",
                "oi": 64562,
                "volume": 931,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 39.0,
                "type": "CALL",
                "oi": 63958,
                "volume": 148,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 37.0,
                "type": "CALL",
                "oi": 62769,
                "volume": 1084,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 22.0,
                "type": "PUT",
                "oi": 62023,
                "volume": 11,
                "expiry": "2026-06-18 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 35.0,
                "type": "CALL",
                "oi": 61100,
                "volume": 25,
                "expiry": "2026-12-18 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 34.0,
                "type": "CALL",
                "oi": 60256,
                "volume": 6,
                "expiry": "2026-12-18 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 33.0,
                "type": "CALL",
                "oi": 54884,
                "volume": 0,
                "expiry": "2026-12-18 00:00:00",
                "iv": 0.0
            }
        ],
        "top_vol": [
            {
                "strike": 38.0,
                "type": "PUT",
                "oi": 47393,
                "volume": 13523,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 38.0,
                "type": "CALL",
                "oi": 131048,
                "volume": 8126,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 37.0,
                "type": "PUT",
                "oi": 476,
                "volume": 2189,
                "expiry": "2026-03-13 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 37.5,
                "type": "CALL",
                "oi": 564,
                "volume": 1840,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 35.0,
                "type": "CALL",
                "oi": 34640,
                "volume": 1674,
                "expiry": "2026-06-18 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 35.0,
                "type": "PUT",
                "oi": 1263,
                "volume": 1505,
                "expiry": "2026-03-13 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 37.0,
                "type": "CALL",
                "oi": 62769,
                "volume": 1084,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 37.0,
                "type": "CALL",
                "oi": 3562,
                "volume": 1052,
                "expiry": "2026-03-13 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 39.0,
                "type": "CALL",
                "oi": 1862,
                "volume": 1031,
                "expiry": "2026-03-13 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 36.0,
                "type": "PUT",
                "oi": 35709,
                "volume": 972,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 35.0,
                "type": "PUT",
                "oi": 64562,
                "volume": 931,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 38.0,
                "type": "CALL",
                "oi": 24971,
                "volume": 806,
                "expiry": "2026-04-17 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 36.5,
                "type": "PUT",
                "oi": 673,
                "volume": 663,
                "expiry": "2026-03-13 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 38.0,
                "type": "CALL",
                "oi": 4133,
                "volume": 633,
                "expiry": "2026-05-15 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 31.0,
                "type": "PUT",
                "oi": 5704,
                "volume": 602,
                "expiry": "2026-09-18 00:00:00",
                "iv": 0.0
            }
        ]
    },
    "fed_watch": [
        {
            "expiry": "2026-03-13",
            "days_to_exp": 1,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-03-20",
            "days_to_exp": 8,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-03-27",
            "days_to_exp": 15,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-03-31",
            "days_to_exp": 19,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-04-02",
            "days_to_exp": 21,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-04-10",
            "days_to_exp": 29,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-04-17",
            "days_to_exp": 36,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-04-24",
            "days_to_exp": 43,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-05-15",
            "days_to_exp": 64,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-18",
            "days_to_exp": 98,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-06-30",
            "days_to_exp": 110,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-07-17",
            "days_to_exp": 127,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-08-21",
            "days_to_exp": 162,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-18",
            "days_to_exp": 190,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-09-30",
            "days_to_exp": 201,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-10-16",
            "days_to_exp": 218,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-11-20",
            "days_to_exp": 253,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-18",
            "days_to_exp": 281,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2026-12-31",
            "days_to_exp": 294,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-01-15",
            "days_to_exp": 309,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-07-16",
            "days_to_exp": 490,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2027-12-17",
            "days_to_exp": 645,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
        },
        {
            "expiry": "2028-01-21",
            "days_to_exp": 680,
            "iv_atm": 0.0,
            "ranges": [
                {
                    "sd": 1,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 185793.0,
                    "lower": 185793.0,
                    "prob_inside": 0.9973002039367398
                }
            ]
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
                143565.06794564347,
                108911.43085531575,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547,
                69307.27418065547
            ]
        },
        "delta_flip_profile": {
            "spots": [
                157924.05,
                159061.5581632653,
                160199.06632653062,
                161336.5744897959,
                162474.08265306122,
                163611.5908163265,
                164749.09897959183,
                165886.60714285713,
                167024.11530612243,
                168161.62346938773,
                169299.13163265307,
                170436.63979591834,
                171574.14795918367,
                172711.65612244897,
                173849.16428571427,
                174986.67244897957,
                176124.1806122449,
                177261.68877551018,
                178399.1969387755,
                179536.7051020408,
                180674.2132653061,
                181811.7214285714,
                182949.22959183675,
                184086.73775510202,
                185224.24591836735,
                186361.75408163265,
                187499.26224489795,
                188636.77040816325,
                189774.2785714286,
                190911.78673469386,
                192049.2948979592,
                193186.8030612245,
                194324.3112244898,
                195461.8193877551,
                196599.32755102043,
                197736.8357142857,
                198874.343877551,
                200011.8520408163,
                201149.36020408163,
                202286.86836734693,
                203424.3765306122,
                204561.88469387754,
                205699.39285714287,
                206836.90102040814,
                207974.40918367344,
                209111.91734693878,
                210249.4255102041,
                211386.93367346938,
                212524.44183673468,
                213661.94999999998
            ],
            "deltas": [
                93102.11217229458,
                121390.24730593503,
                150191.85879942725,
                179505.8041982391,
                209325.176874426,
                239637.09344981652,
                270422.5430846091,
                301656.3064191874,
                333306.95267827186,
                365336.92323510774,
                397702.70869804674,
                430355.1244151161,
                463239.6864257637,
                496297.0866248432,
                529463.7625457038,
                562672.5539675527,
                595853.4356780313,
                628934.313264755,
                661841.8667981281,
                694502.4256983474,
                726842.8569449304,
                758791.4480942946,
                790278.7663478601,
                821238.4752018035,
                851608.0910531762,
                881329.6635629392,
                910350.3655831817,
                938622.9810035267,
                966106.2818809683,
                992765.2895710284,
                1018571.4181301355,
                1043502.5018437856,
                1067542.7121797225,
                1090682.3726017873,
                1112917.6823576277,
                1134250.362449484,
                1154687.2384276416,
                1174239.7753709578,
                1192923.580446271,
                1210757.887822162,
                1227765.0395460573,
                1243969.9744001958,
                1259399.7348715905,
                1274083.0003471123,
                1288049.6526110661,
                1301330.377793006,
                1313956.3071751518,
                1325958.6977787442,
                1337368.652434635,
                1348216.8781073138
            ],
            "flip_value": 157924.05
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
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                157924.05,
                159061.5581632653,
                160199.06632653062,
                161336.5744897959,
                162474.08265306122,
                163611.5908163265,
                164749.09897959183,
                165886.60714285713,
                167024.11530612243,
                168161.62346938773,
                169299.13163265307,
                170436.63979591834,
                171574.14795918367,
                172711.65612244897,
                173849.16428571427,
                174986.67244897957,
                176124.1806122449,
                177261.68877551018,
                178399.1969387755,
                179536.7051020408,
                180674.2132653061,
                181811.7214285714,
                182949.22959183675,
                184086.73775510202,
                185224.24591836735,
                186361.75408163265,
                187499.26224489795,
                188636.77040816325,
                189774.2785714286,
                190911.78673469386,
                192049.2948979592,
                193186.8030612245,
                194324.3112244898,
                195461.8193877551,
                196599.32755102043,
                197736.8357142857,
                198874.343877551,
                200011.8520408163,
                201149.36020408163,
                202286.86836734693,
                203424.3765306122,
                204561.88469387754,
                205699.39285714287,
                206836.90102040814,
                207974.40918367344,
                209111.91734693878,
                210249.4255102041,
                211386.93367346938,
                212524.44183673468,
                213661.94999999998
            ],
            "pnl": [
                9275917.748657577,
                9040823.289580263,
                8795948.341453929,
                8540905.606638543,
                8275307.626169844,
                7998769.54539981,
                7710911.065060862,
                7411357.983685739,
                7099743.796342641,
                6775711.790959244,
                6438917.990501638,
                6089035.151204124,
                5725757.872302761,
                5348808.727265511,
                4957945.208965343,
                4552967.200624854,
                4133724.6404477158,
                3700125.033694864,
                3252140.471509208,
                2789813.831548568,
                2313263.8552461015,
                1822688.8186407173,
                1318368.5408122363,
                800664.5112992069,
                270017.9711313462,
                -273054.1449667746,
                -827965.4049333045,
                -1394068.105790848,
                -1970663.3062230125,
                -2557012.329925469,
                -3152349.308870551,
                -3755894.2670567045,
                -4366866.211673857,
                -4984495.7037857855,
                -5608036.42390832,
                -6236775.32423751,
                -6870041.060381223,
                -7507210.510836064,
                -8147713.311128556,
                -8791034.441289324,
                -9436715.001810536,
                -10084351.388663705,
                -10733593.129344206,
                -11384139.668954376,
                -12035736.399974722,
                -12688170.215179201,
                -13341264.834660172,
                -13994876.119996164,
                -14648887.54585858,
                -15303205.955835667
            ]
        },
        "max_pain_profile": {
            "strikes": [
                69307.27418065547,
                74257.793764988,
                79208.31334932054,
                84158.83293365307,
                89109.35251798561,
                94059.87210231814,
                99010.39168665068,
                103960.91127098321,
                108911.43085531575,
                113861.95043964828,
                118812.4700239808,
                123762.98960831334,
                128713.50919264587,
                133664.0287769784,
                138614.54836131094,
                143565.06794564347,
                148515.587529976,
                153466.10711430854,
                158416.62669864108,
                160891.88649080734,
                163367.1462829736,
                165842.40607513988,
                168317.66586730615,
                170792.9256594724,
                173268.18545163868,
                175743.44524380495,
                178218.70503597122,
                180693.96482813748,
                183169.22462030375,
                185644.48441247002,
                188119.74420463628,
                190595.00399680255,
                193070.26378896882
            ],
            "loss": [
                23887959.0,
                22239321.0,
                20600620.0,
                19012013.0,
                17427035.0,
                15862208.0,
                14305504.0,
                12790577.0,
                11352954.0,
                10005522.0,
                8708738.0,
                7459178.0,
                6384464.0,
                5427459.0,
                4590697.0,
                3947069.0,
                3381906.0,
                2982825.0,
                2645615.0,
                2586301.5,
                2527095.0,
                2581871.0,
                2637235.5,
                2780503.0,
                2924255.0,
                3228031.5,
                3533634.5,
                3992389.0,
                4452994.5,
                5047066.5,
                5644981.0,
                6421040.5,
                7198120.5
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 188119.74420463628,
                "options": [
                    {
                        "Strike": 133664.0287769784,
                        "Call_Now": 52182.00198161344,
                        "Call_Sim": 54508.74618624723,
                        "Call_Chg": 4.458901759755455,
                        "Put_Now": 2.9520590722396164e-09,
                        "Put_Sim": 4.462919083759332e-10,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 183169.22462030375,
                        "Call_Now": 5032.376335808124,
                        "Call_Sim": 6606.819744824895,
                        "Call_Chg": 31.286281151386465,
                        "Put_Now": 2335.92917582337,
                        "Put_Sim": 1583.6283802038636,
                        "Put_Chg": -32.205633775447616
                    },
                    {
                        "Strike": 185793.0,
                        "Call_Now": 3583.172663176719,
                        "Call_Sim": 4896.319578113792,
                        "Call_Chg": 36.64760362881541,
                        "Put_Now": 3509.4599087381544,
                        "Put_Sim": 2495.8626190389336,
                        "Put_Chg": -28.881859774932302
                    },
                    {
                        "Strike": 188119.74420463628,
                        "Call_Now": 2554.8139291695193,
                        "Call_Sim": 3628.045861996156,
                        "Call_Chg": 42.00822300884773,
                        "Put_Now": 4806.922251347354,
                        "Put_Sim": 3553.409979537697,
                        "Put_Chg": -26.077232088750858
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 183169.22462030375,
                "options": [
                    {
                        "Strike": 133664.0287769784,
                        "Call_Now": 52182.00198161344,
                        "Call_Sim": 49558.22660193784,
                        "Call_Chg": -5.028123260966683,
                        "Put_Now": 2.9520590722396164e-09,
                        "Put_Sim": 2.3611399903653603e-08,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 183169.22462030375,
                        "Call_Now": 5032.376335808124,
                        "Call_Sim": 3532.5709708909963,
                        "Call_Chg": -29.803124107495467,
                        "Put_Now": 2335.92917582337,
                        "Put_Sim": 3459.899190602481,
                        "Put_Chg": 48.11661356911362
                    },
                    {
                        "Strike": 185793.0,
                        "Call_Now": 3583.172663176719,
                        "Call_Sim": 2392.0135264556457,
                        "Call_Chg": -33.24314088914242,
                        "Put_Now": 3509.4599087381544,
                        "Put_Sim": 4942.076151713303,
                        "Put_Chg": 40.82155887884908
                    },
                    {
                        "Strike": 188119.74420463628,
                        "Call_Now": 2554.8139291695193,
                        "Call_Sim": 1626.145612422473,
                        "Call_Chg": -36.349743758009176,
                        "Put_Now": 4806.922251347354,
                        "Put_Sim": 6502.029314296574,
                        "Put_Chg": 35.2638751848772
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 133664.0287769784,
                "options": [
                    {
                        "Strike": 133664.0287769784,
                        "Call_Now": 52182.00198161344,
                        "Call_Sim": 2577.8220598393727,
                        "Call_Chg": -95.05994028219217,
                        "Put_Now": 2.9520590722396164e-09,
                        "Put_Sim": 2524.791301250467,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 183169.22462030375,
                        "Call_Now": 5032.376335808124,
                        "Call_Sim": 2.6460335118683908e-08,
                        "Call_Chg": -99.99999999947418,
                        "Put_Now": 2335.92917582337,
                        "Put_Sim": 49432.52406306331,
                        "Put_Chg": 2016.1824842415995
                    },
                    {
                        "Strike": 185793.0,
                        "Call_Now": 3583.172663176719,
                        "Call_Sim": 3.3239891201629802e-09,
                        "Call_Chg": -99.99999999990723,
                        "Put_Now": 3509.4599087381544,
                        "Put_Sim": 52055.258468586326,
                        "Put_Chg": 1383.2840329355147
                    },
                    {
                        "Strike": 188119.74420463628,
                        "Call_Now": 2554.8139291695193,
                        "Call_Sim": 5.046167221851056e-10,
                        "Call_Chg": -99.99999999998025,
                        "Put_Now": 4806.922251347354,
                        "Put_Sim": 54381.07954519992,
                        "Put_Chg": 1031.3076580333122
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 187650.93000000002,
                "options": [
                    {
                        "Strike": 133664.0287769784,
                        "Call_Now": 52182.00198161344,
                        "Call_Sim": 54039.931981611146,
                        "Call_Chg": 3.5604804902892764,
                        "Put_Now": 2.9520590722396164e-09,
                        "Put_Sim": 6.552332210226659e-10,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 183169.22462030375,
                        "Call_Now": 5032.376335808124,
                        "Call_Sim": 6272.368435484983,
                        "Call_Chg": 24.64028953585274,
                        "Put_Now": 2335.92917582337,
                        "Put_Sim": 1717.9912755002147,
                        "Put_Chg": -26.453623111468865
                    },
                    {
                        "Strike": 185793.0,
                        "Call_Now": 3583.172663176719,
                        "Call_Sim": 4612.70949302031,
                        "Call_Chg": 28.732548683010968,
                        "Put_Now": 3509.4599087381544,
                        "Put_Sim": 2681.0667385817405,
                        "Put_Chg": -23.604577105833563
                    },
                    {
                        "Strike": 188119.74420463628,
                        "Call_Now": 2554.8139291695193,
                        "Call_Sim": 3392.4863730791767,
                        "Call_Chg": 32.7880020672173,
                        "Put_Now": 4806.922251347354,
                        "Put_Sim": 3786.664695256989,
                        "Put_Chg": -21.22475677247313
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 183935.06999999998,
                "options": [
                    {
                        "Strike": 133664.0287769784,
                        "Call_Now": 52182.00198161344,
                        "Call_Sim": 50324.07198162341,
                        "Call_Chg": -3.5604804902745473,
                        "Put_Now": 2.9520590722396164e-09,
                        "Put_Sim": 1.2943352200111746e-08,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 183169.22462030375,
                        "Call_Now": 5032.376335808124,
                        "Call_Sim": 3938.636127402532,
                        "Call_Chg": -21.734070256690245,
                        "Put_Now": 2335.92917582337,
                        "Put_Sim": 3100.118967417801,
                        "Put_Chg": 32.714595951954266
                    },
                    {
                        "Strike": 185793.0,
                        "Call_Now": 3583.172663176719,
                        "Call_Sim": 2707.87797454339,
                        "Call_Chg": -24.427923823724495,
                        "Put_Now": 3509.4599087381544,
                        "Put_Sim": 4492.095220104857,
                        "Put_Chg": 27.99961637743895
                    },
                    {
                        "Strike": 188119.74420463628,
                        "Call_Now": 2554.8139291695193,
                        "Call_Sim": 1867.5174476733193,
                        "Call_Chg": -26.902017154713725,
                        "Put_Now": 4806.922251347354,
                        "Put_Sim": 5977.555769851186,
                        "Put_Chg": 24.35307785924163
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            1.8206975458144822e-05,
            -0.0012493430096172905,
            -0.0027822129345435698,
            -0.0006659640016874431,
            -0.01441563422698926,
            -0.006547767605428535,
            -0.013704779568530506,
            -0.03272280892276931,
            -0.05566572217425561,
            -0.04060578696468307,
            -0.021979898977862226,
            -0.13005959172216244,
            -0.10873028447660192,
            -0.06637827726048416,
            -0.16356993285639482,
            -0.046009377978844274,
            0.020714521135403716,
            -0.019636099459275982,
            0.11805714764565393,
            -0.00017944976833234012,
            0.022452755346477338,
            -0.003131285359742555,
            0.04613558706628722,
            -0.0028423838282206305,
            -0.11376303820934841,
            -0.012427626957120002,
            0.10499664709659065,
            -0.007341829108602739,
            0.2144819742442562,
            0.006193568176414421,
            0.7012463195808389,
            0.018414646293188522,
            0.40396927588242304
        ]
    },
    "delta_data": {
        "strikes": [
            69307.27418065547,
            74257.793764988,
            79208.31334932054,
            84158.83293365307,
            89109.35251798561,
            94059.87210231814,
            99010.39168665068,
            103960.91127098321,
            108911.43085531575,
            113861.95043964828,
            118812.4700239808,
            123762.98960831334,
            128713.50919264587,
            133664.0287769784,
            138614.54836131094,
            143565.06794564347,
            148515.587529976,
            153466.10711430854,
            158416.62669864108,
            160891.88649080734,
            163367.1462829736,
            165842.40607513988,
            168317.66586730615,
            170792.9256594724,
            173268.18545163868,
            175743.44524380495,
            178218.70503597122,
            180693.96482813748,
            183169.22462030375,
            185644.48441247002,
            188119.74420463628,
            190595.00399680255,
            193070.26378896882
        ],
        "delta_values": [
            39.060855086493405,
            1655.6786900647987,
            -38.20526133460852,
            -19.28477794150775,
            -649.5689015065661,
            -354.6964149376073,
            273.87660078148895,
            -1698.963444359766,
            -2112.522705234399,
            -1366.5837056736677,
            -1624.680187250482,
            -8008.439318117408,
            -6305.08122696133,
            14196.668473979027,
            17737.25779116773,
            18651.632862863804,
            58508.08345300409,
            18666.0109356885,
            120959.65599469193,
            -1.0506063866241995,
            98616.92478350435,
            -95.17157402853583,
            95296.50594164664,
            -125.0291957298284,
            125020.54974441859,
            -285.7011395349565,
            136521.53049876506,
            -965.8295969145832,
            56796.15758583222,
            -2365.7713451391696,
            84987.01281195176,
            492.51272972382117,
            44150.77038508097
        ],
        "delta_cumulative": [
            39.060855086493405,
            1694.739545151292,
            1656.5342838166835,
            1637.2495058751756,
            987.6806043686095,
            632.9841894310022,
            906.8607902124911,
            -792.102654147275,
            -2904.6253593816737,
            -4271.209065055342,
            -5895.889252305824,
            -13904.328570423233,
            -20209.409797384564,
            -6012.741323405537,
            11724.516467762192,
            30376.149330625994,
            88884.23278363008,
            107550.24371931859,
            228509.89971401053,
            228508.84910762392,
            327125.77389112825,
            327030.6023170997,
            422327.10825874633,
            422202.0790630165,
            547222.628807435,
            546936.9276679001,
            683458.4581666652,
            682492.6285697506,
            739288.7861555828,
            736923.0148104436,
            821910.0276223954,
            822402.5403521192,
            866553.3107372002
        ]
    },
    "gamma_data": {
        "strikes": [
            69307.27418065547,
            74257.793764988,
            79208.31334932054,
            84158.83293365307,
            89109.35251798561,
            94059.87210231814,
            99010.39168665068,
            103960.91127098321,
            108911.43085531575,
            113861.95043964828,
            118812.4700239808,
            123762.98960831334,
            128713.50919264587,
            133664.0287769784,
            138614.54836131094,
            143565.06794564347,
            148515.587529976,
            153466.10711430854,
            158416.62669864108,
            160891.88649080734,
            163367.1462829736,
            165842.40607513988,
            168317.66586730615,
            170792.9256594724,
            173268.18545163868,
            175743.44524380495,
            178218.70503597122,
            180693.96482813748,
            183169.22462030375,
            185644.48441247002,
            188119.74420463628,
            190595.00399680255,
            193070.26378896882
        ],
        "gamma_values": [
            22160338.953345247,
            1890452901.2222831,
            1116976066.6852043,
            305308358.29789317,
            7460062009.153063,
            3703691395.754501,
            8943540756.41723,
            20870962951.24176,
            38076990894.9399,
            36219072326.09508,
            19106851501.77881,
            117014905251.27724,
            107357181367.8828,
            129512031633.56142,
            294333761149.7842,
            130112066120.07726,
            237242631037.97278,
            106582520691.20763,
            423532695479.1833,
            180702849.0228885,
            576961984447.5585,
            4997275142.527821,
            598881993003.3131,
            6345151337.361465,
            1611718027857.2266,
            33054096962.28886,
            1966132090363.1074,
            42196198716.024284,
            1913301965784.5571,
            90563882934.87743,
            2561572665549.2217,
            34369406059.078674,
            893418378665.7351
        ],
        "gamma_call": [
            8970257.789942624,
            346013540.899078,
            0.0,
            0.0,
            0.0,
            2449636.65316245,
            510063244.4734398,
            5113085.339434295,
            341780187.2496297,
            2277177367.61363,
            244222315.63125733,
            878084297.1739476,
            1283544471.345787,
            33806916885.038734,
            51606231313.19654,
            51470955675.52978,
            120704266262.25563,
            39548720860.63022,
            320571720330.47534,
            407427.3182096479,
            370904163845.55774,
            20204138.203162313,
            432241109170.28534,
            107173454.40679163,
            946864689797.0636,
            4367052163.929012,
            1481768420068.5454,
            3412238243.10952,
            1081375916759.4031,
            17696463753.538548,
            1851797437496.9785,
            31660467084.04543,
            873208027481.8365
        ],
        "gamma_put": [
            13190081.163402624,
            1544439360.3232052,
            1116976066.6852043,
            305308358.29789317,
            7460062009.153063,
            3701241759.1013384,
            8433477511.943791,
            20865849865.902325,
            37735210707.69028,
            33941894958.481453,
            18862629186.147552,
            116136820954.10329,
            106073636896.53702,
            95705114748.52264,
            242727529836.58768,
            78641110444.54745,
            116538364775.71713,
            67033799830.57739,
            102960975148.708,
            180295421.70467886,
            206057820602.00067,
            4977071004.324658,
            166640883833.0279,
            6237977882.954674,
            664853338060.1633,
            28687044798.359848,
            484363670294.5618,
            38783960472.91477,
            831926049025.1542,
            72867419181.33887,
            709775228052.2434,
            2708938975.0332413,
            20210351183.898266
        ],
        "gamma_exposure": [
            22160338.953345247,
            1912613240.1756284,
            3029589306.8608327,
            3334897665.1587257,
            10794959674.311789,
            14498651070.06629,
            23442191826.48352,
            44313154777.72528,
            82390145672.66519,
            118609217998.76027,
            137716069500.53906,
            254730974751.81628,
            362088156119.6991,
            491600187753.2605,
            785933948903.0447,
            916046015023.122,
            1153288646061.0947,
            1259871166752.3022,
            1683403862231.4856,
            1683584565080.5085,
            2260546549528.067,
            2265543824670.5947,
            2864425817673.9077,
            2870770969011.269,
            4482488996868.496,
            4515543093830.785,
            6481675184193.893,
            6523871382909.917,
            8437173348694.475,
            8527737231629.352,
            11089309897178.574,
            11123679303237.652,
            12017097681903.387
        ]
    },
    "gex_by_expiry": [
        {
            "expiry": "2026-03-13",
            "days_to_exp": 2,
            "abs_call": 32768608.424375057,
            "abs_put": 13772372.209663572,
            "net": 46540980.63403863
        },
        {
            "expiry": "2026-03-20",
            "days_to_exp": 7,
            "abs_call": 854391416.4594259,
            "abs_put": 464383847.8951211,
            "net": 1318775264.3545468
        },
        {
            "expiry": "2026-03-27",
            "days_to_exp": 12,
            "abs_call": 1958458.1397093656,
            "abs_put": 2189183.3209423525,
            "net": 4147641.460651718
        },
        {
            "expiry": "2026-03-31",
            "days_to_exp": 14,
            "abs_call": 17752748.732617848,
            "abs_put": 4015765.9716408756,
            "net": 21768514.70425872
        },
        {
            "expiry": "2026-04-02",
            "days_to_exp": 16,
            "abs_call": 602032.0003254076,
            "abs_put": 703975.9661770461,
            "net": 1306007.9665024537
        },
        {
            "expiry": "2026-04-10",
            "days_to_exp": 22,
            "abs_call": 26025.155829216335,
            "abs_put": 410489.3842293558,
            "net": 436514.5400585721
        },
        {
            "expiry": "2026-04-17",
            "days_to_exp": 27,
            "abs_call": 288268036.26955724,
            "abs_put": 96474210.93795629,
            "net": 384742247.2075135
        },
        {
            "expiry": "2026-04-24",
            "days_to_exp": 32,
            "abs_call": 12015.66237714866,
            "abs_put": 15397.403920378518,
            "net": 27413.066297527177
        },
        {
            "expiry": "2026-05-15",
            "days_to_exp": 47,
            "abs_call": 7835991.191715702,
            "abs_put": 35592985.76078668,
            "net": 43428976.952502385
        },
        {
            "expiry": "2026-06-18",
            "days_to_exp": 71,
            "abs_call": 122987580.41994926,
            "abs_put": 138071485.24281442,
            "net": 261059065.66276368
        },
        {
            "expiry": "2026-06-30",
            "days_to_exp": 79,
            "abs_call": 476721.18337823823,
            "abs_put": 396753.10098705656,
            "net": 873474.2843652947
        },
        {
            "expiry": "2026-07-17",
            "days_to_exp": 92,
            "abs_call": 415985.77612603805,
            "abs_put": 1799327.1967736257,
            "net": 2215312.972899664
        },
        {
            "expiry": "2026-08-21",
            "days_to_exp": 117,
            "abs_call": 140815.89239527076,
            "abs_put": 5700601.046341174,
            "net": 5841416.938736444
        },
        {
            "expiry": "2026-09-18",
            "days_to_exp": 137,
            "abs_call": 14850551.82227414,
            "abs_put": 15598486.260122806,
            "net": 30449038.082396947
        },
        {
            "expiry": "2026-09-30",
            "days_to_exp": 145,
            "abs_call": 998921.2371485748,
            "abs_put": 84286.77377653912,
            "net": 1083208.010925114
        },
        {
            "expiry": "2026-10-16",
            "days_to_exp": 157,
            "abs_call": 278398.5059700014,
            "abs_put": 897170.3113793462,
            "net": 1175568.8173493478
        },
        {
            "expiry": "2026-11-20",
            "days_to_exp": 182,
            "abs_call": 8624986.193448309,
            "abs_put": 5293709.222231076,
            "net": 13918695.415679384
        },
        {
            "expiry": "2026-12-18",
            "days_to_exp": 202,
            "abs_call": 174671156.1426587,
            "abs_put": 46760815.168639734,
            "net": 221431971.31129846
        },
        {
            "expiry": "2026-12-31",
            "days_to_exp": 211,
            "abs_call": 96100.82578317281,
            "abs_put": 16803.547528124775,
            "net": 112904.37331129759
        },
        {
            "expiry": "2027-01-15",
            "days_to_exp": 222,
            "abs_call": 30704444.759211976,
            "abs_put": 32572905.82254516,
            "net": 63277350.58175712
        },
        {
            "expiry": "2027-07-16",
            "days_to_exp": 352,
            "abs_call": 499195.69602065213,
            "abs_put": 1288441.352565463,
            "net": 1787637.0485861155
        },
        {
            "expiry": "2027-12-17",
            "days_to_exp": 462,
            "abs_call": 84331.98813928149,
            "abs_put": 1143812.604930909,
            "net": 1228144.5930701904
        },
        {
            "expiry": "2028-01-21",
            "days_to_exp": 487,
            "abs_call": 791810.0157925928,
            "abs_put": 1022542.2627327654,
            "net": 1814352.2785253585
        }
    ],
    "volume_data": {
        "strikes": [
            69307.27418065547,
            74257.793764988,
            79208.31334932054,
            84158.83293365307,
            89109.35251798561,
            94059.87210231814,
            99010.39168665068,
            103960.91127098321,
            108911.43085531575,
            113861.95043964828,
            118812.4700239808,
            123762.98960831334,
            128713.50919264587,
            133664.0287769784,
            138614.54836131094,
            143565.06794564347,
            148515.587529976,
            153466.10711430854,
            158416.62669864108,
            160891.88649080734,
            163367.1462829736,
            165842.40607513988,
            168317.66586730615,
            170792.9256594724,
            173268.18545163868,
            175743.44524380495,
            178218.70503597122,
            180693.96482813748,
            183169.22462030375,
            185644.48441247002,
            188119.74420463628,
            190595.00399680255,
            193070.26378896882
        ],
        "call_volume": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            6.0,
            8.0,
            7.0,
            0.0,
            0.0,
            0.0,
            4.0,
            11.0,
            0.0,
            9.0,
            41.0,
            210.0,
            4.0,
            0.0,
            468.0,
            1.0,
            39.0,
            3.0,
            1849.0,
            1.0,
            137.0,
            163.0,
            2675.0,
            2209.0,
            10544.0,
            26.0,
            1608.0
        ],
        "put_volume": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            18.0,
            0.0,
            1.0,
            33.0,
            1.0,
            18.0,
            994.0,
            3.0,
            76.0,
            646.0,
            60.0,
            5.0,
            404.0,
            116.0,
            423.0,
            3.0,
            2942.0,
            28.0,
            1714.0,
            699.0,
            2761.0,
            24.0,
            13722.0,
            8.0,
            3.0
        ],
        "total_volume": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            6.0,
            8.0,
            25.0,
            0.0,
            1.0,
            33.0,
            5.0,
            29.0,
            994.0,
            12.0,
            117.0,
            856.0,
            64.0,
            5.0,
            872.0,
            117.0,
            462.0,
            6.0,
            4791.0,
            29.0,
            1851.0,
            862.0,
            5436.0,
            2233.0,
            24266.0,
            34.0,
            1611.0
        ]
    },
    "volatility_data": {
        "strikes": [
            69307.27418065547,
            74257.793764988,
            79208.31334932054,
            84158.83293365307,
            89109.35251798561,
            94059.87210231814,
            99010.39168665068,
            103960.91127098321,
            108911.43085531575,
            113861.95043964828,
            118812.4700239808,
            123762.98960831334,
            128713.50919264587,
            133664.0287769784,
            138614.54836131094,
            143565.06794564347,
            148515.587529976,
            153466.10711430854,
            158416.62669864108,
            160891.88649080734,
            163367.1462829736,
            165842.40607513988,
            168317.66586730615,
            170792.9256594724,
            173268.18545163868,
            175743.44524380495,
            178218.70503597122,
            180693.96482813748,
            183169.22462030375,
            185644.48441247002,
            188119.74420463628,
            190595.00399680255,
            193070.26378896882
        ],
        "iv_values": [
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72,
            53.72
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
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "term_structure": {
            "expiries": [
                "2026-03-13",
                "2026-03-20",
                "2026-03-27",
                "2026-03-31",
                "2026-04-02",
                "2026-04-10",
                "2026-04-17",
                "2026-04-24",
                "2026-05-15",
                "2026-06-18",
                "2026-06-30",
                "2026-07-17",
                "2026-08-21",
                "2026-09-18",
                "2026-09-30",
                "2026-10-16",
                "2026-11-20",
                "2026-12-18",
                "2026-12-31",
                "2027-01-15",
                "2027-07-16",
                "2027-12-17",
                "2028-01-21"
            ],
            "iv_atm_pct": [
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
        }
    },
    "greeks_2nd_order": {
        "strikes": [
            69307.27418065547,
            74257.793764988,
            79208.31334932054,
            84158.83293365307,
            89109.35251798561,
            94059.87210231814,
            99010.39168665068,
            103960.91127098321,
            108911.43085531575,
            113861.95043964828,
            118812.4700239808,
            123762.98960831334,
            128713.50919264587,
            133664.0287769784,
            138614.54836131094,
            143565.06794564347,
            148515.587529976,
            153466.10711430854,
            158416.62669864108,
            160891.88649080734,
            163367.1462829736,
            165842.40607513988,
            168317.66586730615,
            170792.9256594724,
            173268.18545163868,
            175743.44524380495,
            178218.70503597122,
            180693.96482813748,
            183169.22462030375,
            185644.48441247002,
            188119.74420463628,
            190595.00399680255,
            193070.26378896882
        ],
        "charm": [
            -3.640702519187025,
            -323.05324595924253,
            -630.7847067663039,
            -95.4970613979239,
            -1083.5402401797855,
            -440.1285296197745,
            -2244.001786614604,
            -4151.242707343884,
            -9876.741840537805,
            -2750.06597863211,
            -2121.4030472548807,
            -23551.634337883184,
            -21190.77192557326,
            -15135.609134382103,
            -41677.0558459693,
            -24399.52342668173,
            -19626.97184727493,
            -38412.78625709734,
            -46065.500556084146,
            -268.9192427649281,
            -142708.65308637926,
            -4134.764306790792,
            -135398.9551036445,
            -3896.443593829456,
            -536660.7933901917,
            -22086.40841649354,
            -340517.18268909515,
            -14449.195495819953,
            -102916.39254564744,
            2782.6847763121914,
            299922.1625619991,
            25037.990682368905,
            267775.98192294326
        ],
        "vanna": [
            -14.77088689332165,
            -1185.0127236533563,
            -694.0546551385446,
            -169.14888908724873,
            -3693.357349737841,
            -1662.6770718608832,
            -3853.828399811571,
            -8159.974774177911,
            -13981.069380363337,
            -11082.455592174578,
            -5459.604142981781,
            -31811.75719533286,
            -26854.255523935077,
            -26902.052356605804,
            -56394.39025894972,
            -22379.80154701951,
            -27581.074382334587,
            -12721.390723064638,
            -33865.3951490436,
            -19.191828217963725,
            -40632.789269082314,
            -417.0144048141492,
            -33982.07425923549,
            -389.2762121336383,
            -68652.57563572106,
            -1329.5511878110904,
            -48952.80320498271,
            -812.9334597422113,
            -7774.801387832574,
            107.3188315895405,
            42811.79438779114,
            685.0527490703993,
            30532.205730958973
        ],
        "vex": [
            190.2956322236882,
            13586.698291862629,
            2650.1887231899873,
            1458.0518444188783,
            49112.442196697724,
            26747.246843079738,
            43485.17272201069,
            109280.69073416379,
            150339.63570810077,
            258970.3328380366,
            110779.75242718932,
            451920.6154792125,
            318866.50584249286,
            594257.3244569894,
            970538.4913320983,
            327484.89565014135,
            1422571.9490891497,
            298835.03836509114,
            1943618.7053903192,
            41.8208780292296,
            1744955.0170104187,
            1128.979936766537,
            1208007.4618090873,
            1427.90022864773,
            1833168.6262255171,
            6078.401729828837,
            1448359.7228474512,
            8087.824552024303,
            1458673.4159876585,
            18588.353312724266,
            2163065.602981707,
            2909.7050193811538,
            541113.9693613903
        ],
        "theta": [
            -0.28056017755711715,
            -20.176002779214357,
            -9.387456570723158,
            -2.4801749881841104,
            -58.82431321075779,
            -28.80355965747585,
            -75.19573996167811,
            -165.5232208882306,
            -309.1850922529884,
            -286.6353157553294,
            -148.91352010827146,
            -937.732693075586,
            -871.6337179307415,
            -1143.7150797895426,
            -2559.5316420615236,
            -1204.3442614428272,
            -2262.406220265988,
            -1010.000550593144,
            -4227.296286720334,
            -1.5578952244528719,
            -5464.289490541555,
            -42.6388178545615,
            -5705.382815640982,
            -54.085543887556284,
            -14655.191680403866,
            -284.3217524212768,
            -17884.461085218692,
            -358.49513928106643,
            -16863.14458058171,
            -766.679707738448,
            -22637.163415609855,
            -301.8267738002561,
            -8035.652963583299
        ],
        "charm_cum": [
            -3.640702519187025,
            -326.69394847842955,
            -957.4786552447334,
            -1052.9757166426573,
            -2136.5159568224426,
            -2576.644486442217,
            -4820.646273056821,
            -8971.888980400705,
            -18848.63082093851,
            -21598.696799570618,
            -23720.0998468255,
            -47271.73418470868,
            -68462.50611028195,
            -83598.11524466405,
            -125275.17109063335,
            -149674.69451731507,
            -169301.66636459,
            -207714.45262168732,
            -253779.95317777147,
            -254048.8724205364,
            -396757.52550691564,
            -400892.2898137064,
            -536291.2449173509,
            -540187.6885111803,
            -1076848.481901372,
            -1098934.8903178656,
            -1439452.0730069608,
            -1453901.2685027807,
            -1556817.6610484282,
            -1554034.976272116,
            -1254112.8137101168,
            -1229074.823027748,
            -961298.8411048047
        ],
        "vanna_cum": [
            -14.77088689332165,
            -1199.783610546678,
            -1893.8382656852225,
            -2062.987154772471,
            -5756.344504510313,
            -7419.021576371196,
            -11272.849976182766,
            -19432.824750360676,
            -33413.89413072402,
            -44496.349722898594,
            -49955.95386588037,
            -81767.71106121322,
            -108621.9665851483,
            -135524.0189417541,
            -191918.4092007038,
            -214298.21074772332,
            -241879.28513005792,
            -254600.67585312255,
            -288466.07100216614,
            -288485.2628303841,
            -329118.0520994664,
            -329535.06650428055,
            -363517.140763516,
            -363906.41697564966,
            -432558.99261137075,
            -433888.5437991818,
            -482841.34700416453,
            -483654.28046390676,
            -491429.0818517393,
            -491321.7630201498,
            -448509.96863235865,
            -447824.91588328825,
            -417292.7101523293
        ],
        "theta_cum": [
            -0.28056017755711715,
            -20.456562956771474,
            -29.84401952749463,
            -32.32419451567874,
            -91.14850772643653,
            -119.95206738391238,
            -195.14780734559048,
            -360.67102823382106,
            -669.8561204868095,
            -956.4914362421389,
            -1105.4049563504104,
            -2043.1376494259964,
            -2914.7713673567378,
            -4058.4864471462806,
            -6618.018089207804,
            -7822.362350650632,
            -10084.76857091662,
            -11094.769121509764,
            -15322.065408230097,
            -15323.62330345455,
            -20787.912793996104,
            -20830.551611850664,
            -26535.934427491644,
            -26590.0199713792,
            -41245.211651783065,
            -41529.53340420434,
            -59413.99448942303,
            -59772.4896287041,
            -76635.63420928581,
            -77402.31391702426,
            -100039.47733263412,
            -100341.30410643439,
            -108376.95707001768
        ],
        "r_gamma": [
            22160338.95334525,
            1890452901.222283,
            1116976066.6852043,
            305308358.29789317,
            7460062009.153063,
            3703691395.7545004,
            8943540756.41723,
            20870962951.24176,
            38076990894.9399,
            36219072326.09508,
            19106851501.778812,
            117014905251.27722,
            107357181367.8828,
            129512031633.56143,
            294333761149.7842,
            130112066120.07726,
            237242631037.97278,
            106582520691.20763,
            423532695479.1833,
            180702849.0228885,
            576961984447.5585,
            4997275142.527821,
            598881993003.3131,
            6345151337.361466,
            1611718027857.2263,
            33054096962.28886,
            1966132090363.1074,
            42196198716.024284,
            1913301965784.557,
            90563882934.87741,
            -2561572665549.221,
            -34369406059.078674,
            -893418378665.7351
        ],
        "r_gamma_cum": [
            22160338.95334525,
            1912613240.1756282,
            3029589306.860832,
            3334897665.1587253,
            10794959674.311789,
            14498651070.066288,
            23442191826.48352,
            44313154777.72528,
            82390145672.66519,
            118609217998.76027,
            137716069500.5391,
            254730974751.8163,
            362088156119.6991,
            491600187753.2605,
            785933948903.0447,
            916046015023.122,
            1153288646061.0947,
            1259871166752.3022,
            1683403862231.4856,
            1683584565080.5085,
            2260546549528.067,
            2265543824670.5947,
            2864425817673.9077,
            2870770969011.269,
            4482488996868.495,
            4515543093830.784,
            6481675184193.892,
            6523871382909.916,
            8437173348694.473,
            8527737231629.35,
            5966164566080.129,
            5931795160021.05,
            5038376781355.314
        ]
    },
    "ewz_meta": {
        "expiration": "2026-03-13 (3 DTE)",
        "atm_iv_pct": 53.72,
        "hv_pct": 29.98,
        "iv_rank_pct": 39.93
    },
    "scale_diagnostics": {
        "ewz_spot": 37.53,
        "index_spot": 185793.0,
        "scaling_ewz_ref_close": 37.53,
        "scaling_index_ref_close": 185793.0,
        "display_scale_factor": 4950.519584332534,
        "ref_close_diff_pct": 0.0,
        "spot_ratio_to_index_ref": 1.0,
        "exposure_index_scale_enabled": true
    },
    "detailed_data": [
        {
            "strike": 69307.27418065547,
            "delta": 39.060855086493405,
            "gamma": 22160338.953345247,
            "volume": 0,
            "oi": 162,
            "iv": 53.72
        },
        {
            "strike": 74257.793764988,
            "delta": 1655.6786900647987,
            "gamma": 1890452901.2222831,
            "volume": 0,
            "oi": 9937,
            "iv": 53.72
        },
        {
            "strike": 79208.31334932054,
            "delta": -38.20526133460852,
            "gamma": 1116976066.6852043,
            "volume": 0,
            "oi": 50094,
            "iv": 53.72
        },
        {
            "strike": 84158.83293365307,
            "delta": -19.28477794150775,
            "gamma": 305308358.29789317,
            "volume": 0,
            "oi": 3629,
            "iv": 53.72
        },
        {
            "strike": 89109.35251798561,
            "delta": -649.5689015065661,
            "gamma": 7460062009.153063,
            "volume": 0,
            "oi": 20151,
            "iv": 53.72
        },
        {
            "strike": 94059.87210231814,
            "delta": -354.6964149376073,
            "gamma": 3703691395.754501,
            "volume": 0,
            "oi": 8123,
            "iv": 53.72
        },
        {
            "strike": 99010.39168665068,
            "delta": 273.87660078148895,
            "gamma": 8943540756.41723,
            "volume": 6,
            "oi": 41777,
            "iv": 53.72
        },
        {
            "strike": 103960.91127098321,
            "delta": -1698.963444359766,
            "gamma": 20870962951.24176,
            "volume": 8,
            "oi": 77304,
            "iv": 53.72
        },
        {
            "strike": 108911.43085531575,
            "delta": -2112.522705234399,
            "gamma": 38076990894.9399,
            "volume": 25,
            "oi": 90191,
            "iv": 53.72
        },
        {
            "strike": 113861.95043964828,
            "delta": -1366.5837056736677,
            "gamma": 36219072326.09508,
            "volume": 0,
            "oi": 50648,
            "iv": 53.72
        },
        {
            "strike": 118812.4700239808,
            "delta": -1624.680187250482,
            "gamma": 19106851501.77881,
            "volume": 1,
            "oi": 47224,
            "iv": 53.72
        },
        {
            "strike": 123762.98960831334,
            "delta": -8008.439318117408,
            "gamma": 117014905251.27724,
            "volume": 33,
            "oi": 174846,
            "iv": 53.72
        },
        {
            "strike": 128713.50919264587,
            "delta": -6305.08122696133,
            "gamma": 107357181367.8828,
            "volume": 5,
            "oi": 117709,
            "iv": 53.72
        },
        {
            "strike": 133664.0287769784,
            "delta": 14196.668473979027,
            "gamma": 129512031633.56142,
            "volume": 29,
            "oi": 120243,
            "iv": 53.72
        },
        {
            "strike": 138614.54836131094,
            "delta": 17737.25779116773,
            "gamma": 294333761149.7842,
            "volume": 994,
            "oi": 193134,
            "iv": 53.72
        },
        {
            "strike": 143565.06794564347,
            "delta": 18651.632862863804,
            "gamma": 130112066120.07726,
            "volume": 12,
            "oi": 78465,
            "iv": 53.72
        },
        {
            "strike": 148515.587529976,
            "delta": 58508.08345300409,
            "gamma": 237242631037.97278,
            "volume": 117,
            "oi": 166082,
            "iv": 53.72
        },
        {
            "strike": 153466.10711430854,
            "delta": 18666.0109356885,
            "gamma": 106582520691.20763,
            "volume": 856,
            "oi": 61871,
            "iv": 53.72
        },
        {
            "strike": 158416.62669864108,
            "delta": 120959.65599469193,
            "gamma": 423532695479.1833,
            "volume": 64,
            "oi": 218583,
            "iv": 53.72
        },
        {
            "strike": 160891.88649080734,
            "delta": -1.0506063866241995,
            "gamma": 180702849.0228885,
            "volume": 5,
            "oi": 214,
            "iv": 53.72
        },
        {
            "strike": 163367.1462829736,
            "delta": 98616.92478350435,
            "gamma": 576961984447.5585,
            "volume": 872,
            "oi": 227965,
            "iv": 53.72
        },
        {
            "strike": 165842.40607513988,
            "delta": -95.17157402853583,
            "gamma": 4997275142.527821,
            "volume": 117,
            "oi": 1177,
            "iv": 53.72
        },
        {
            "strike": 168317.66586730615,
            "delta": 95296.50594164664,
            "gamma": 598881993003.3131,
            "volume": 462,
            "oi": 175806,
            "iv": 53.72
        },
        {
            "strike": 170792.9256594724,
            "delta": -125.0291957298284,
            "gamma": 6345151337.361465,
            "volume": 6,
            "oi": 969,
            "iv": 53.72
        },
        {
            "strike": 173268.18545163868,
            "delta": 125020.54974441859,
            "gamma": 1611718027857.2266,
            "volume": 4791,
            "oi": 320049,
            "iv": 53.72
        },
        {
            "strike": 175743.44524380495,
            "delta": -285.7011395349565,
            "gamma": 33054096962.28886,
            "volume": 29,
            "oi": 3653,
            "iv": 53.72
        },
        {
            "strike": 178218.70503597122,
            "delta": 136521.53049876506,
            "gamma": 1966132090363.1074,
            "volume": 1851,
            "oi": 306303,
            "iv": 53.72
        },
        {
            "strike": 180693.96482813748,
            "delta": -965.8295969145832,
            "gamma": 42196198716.024284,
            "volume": 862,
            "oi": 3702,
            "iv": 53.72
        },
        {
            "strike": 183169.22462030375,
            "delta": 56796.15758583222,
            "gamma": 1913301965784.5571,
            "volume": 5436,
            "oi": 266933,
            "iv": 53.72
        },
        {
            "strike": 185644.48441247002,
            "delta": -2365.7713451391696,
            "gamma": 90563882934.87743,
            "volume": 2233,
            "oi": 7685,
            "iv": 53.72
        },
        {
            "strike": 188119.74420463628,
            "delta": 84987.01281195176,
            "gamma": 2561572665549.2217,
            "volume": 24266,
            "oi": 356290,
            "iv": 53.72
        },
        {
            "strike": 190595.00399680255,
            "delta": 492.51272972382117,
            "gamma": 34369406059.078674,
            "volume": 34,
            "oi": 2041,
            "iv": 53.72
        },
        {
            "strike": 193070.26378896882,
            "delta": 44150.77038508097,
            "gamma": 893418378665.7351,
            "volume": 1611,
            "oi": 115530,
            "iv": 53.72
        }
    ]
};