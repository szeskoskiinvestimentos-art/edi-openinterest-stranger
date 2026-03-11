window.marketData = {
    "last_updated": "2026-03-11 11:05:40",
    "spot_price": 37.88,
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
                    "3.00-3.25": 3.4,
                    "3.25-3.50": 33.0,
                    "3.50-3.75": 63.6
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 139,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.8,
                    "3.00-3.25": 9.9,
                    "3.25-3.50": 39.8,
                    "3.50-3.75": 49.5
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 188,
                "current_rate": "3.25-3.50",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.2,
                    "2.75-3.00": 3.3,
                    "3.00-3.25": 18.2,
                    "3.25-3.50": 42.5,
                    "3.50-3.75": 35.8
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 230,
                "current_rate": "3.25-3.50",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.8,
                    "2.75-3.00": 6.0,
                    "3.00-3.25": 22.6,
                    "3.25-3.50": 41.2,
                    "3.50-3.75": 29.2
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 272,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.3,
                    "2.50-2.75": 2.3,
                    "2.75-3.00": 10.7,
                    "3.00-3.25": 27.9,
                    "3.25-3.50": 37.9,
                    "3.50-3.75": 21.1
                }
            }
        ]
    },
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 11/03/2026 11:05\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(false);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(false);\n  MostrarPLUS2(false);\n  ExibirMelhoresPontos(true);\n  MostrarTodosPontos(false);\n  ModeloFlip(7);\n  spot(0);\n  // 1 = Classic (133207.37)\n  // 2 = Spline (133207.37)\n  // 3 = HVL (133207.37)\n  // 4 = HVL Log (185989.13)\n  // 5 = Sigma Kernel (187430.57)\n  // 6 = PVOP (133207.37)\n  // 7 = HVL Gaussian (133207.37)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 133207.37;\n\n  if (ModeloFlip = 1) then GammaVal := 133207.37;\n  if (ModeloFlip = 2) then GammaVal := 133207.37;\n  if (ModeloFlip = 3) then GammaVal := 133207.37;\n  if (ModeloFlip = 4) then GammaVal := 185989.13;\n  if (ModeloFlip = 5) then GammaVal := 187430.57;\n  if (ModeloFlip = 6) then GammaVal := 133207.37;\n  if (ModeloFlip = 7) then GammaVal := 133207.37;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(69070.49, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(69070.49, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(74004.09, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(74004.09, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(78937.70, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(83871.30, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(88804.91, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(93738.52, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(93738.52, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(98672.12, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(98672.12, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(103605.73, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(103605.73, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(108539.33, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(108539.33, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(113472.94, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(113472.94, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(118406.55, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(118406.55, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(123340.15, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(123340.15, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(128273.76, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(128273.76, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(133207.37, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(133207.37, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(133323.50, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(138140.97, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(138140.97, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(143074.58, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(143074.58, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(148008.18, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(148008.18, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(152941.79, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(152941.79, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(157875.40, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(157875.40, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(160342.20, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(160342.20, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(162809.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(162809.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(165275.81, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(165275.81, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(167742.61, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(167742.61, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirMaxPain and MostrarTodosPontos) then\n    HorizontalLineCustom(167742.61, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(170209.41, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(170209.41, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(172676.21, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(172676.21, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(175143.02, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(175143.02, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(177609.82, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(177609.82, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(177609.82, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(177609.82, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(180076.62, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(180076.62, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(180076.62, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(180076.62, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(180796.30, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(180796.30, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(182543.43, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(182543.43, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(182543.43, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(182543.43, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirRange and MostrarTodosPontos) then\n    HorizontalLineCustom(182543.43, clRangeLow, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirRange and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(182543.43, clRangeLow, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(185010.23, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(185010.23, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(185010.23, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(185010.23, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(187477.03, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(187477.03, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(187477.03, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(187477.03, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirRange and MostrarTodosPontos) then\n    HorizontalLineCustom(187477.03, clRangeHigh, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirRange and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(187477.03, clRangeHigh, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(189943.84, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(189943.84, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(189943.84, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(189943.84, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(192410.64, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(192410.64, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls and MostrarTodosPontos) then\n    HorizontalLineCustom(192410.64, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls and (not MostrarTodosPontos)) then\n    HorizontalLineCustom(192410.64, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (160575.94 > 0) then\n      HorizontalLineCustom(160575.94, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    if (MostrarTodosPontos) then HorizontalLineCustom(71537.29, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(76470.89, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(81404.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(86338.11, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(91271.71, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(96205.32, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(101138.93, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(106072.53, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(111006.14, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(115939.74, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(120873.35, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(125806.96, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(130740.56, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(135674.17, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(140607.77, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(145541.38, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(150474.99, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(155408.59, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(159108.80, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(161575.60, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(164042.40, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(166509.21, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(168976.01, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(171442.81, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(173909.62, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(176376.42, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(178843.22, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(178843.22, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(181310.03, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(181310.03, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(183776.83, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(183776.83, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(186243.63, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(186243.63, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(188710.43, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(188710.43, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(191177.24, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(191177.24, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    if (MostrarTodosPontos) then HorizontalLineCustom(70955.12, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(72119.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(75888.73, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(77053.06, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(80822.34, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(81986.67, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(85755.94, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(86920.27, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(90689.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(91853.88, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(95623.15, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(96787.48, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(100556.76, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(101721.09, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(105490.37, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(106654.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(110423.97, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(111588.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(115357.58, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(116521.91, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(120291.18, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(121455.52, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(125224.79, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(126389.12, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(130158.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(131322.73, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(135092.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(136256.33, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(140025.61, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(141189.94, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(144959.22, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(146123.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(149892.82, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(151057.15, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(154826.43, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(155990.76, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(158817.71, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(159399.88, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(161284.52, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(161866.68, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(163751.32, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(164333.49, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(166218.12, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(166800.29, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(168684.93, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(169267.09, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(171151.73, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(171733.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(173618.53, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(174200.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(176085.34, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(176667.50, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(178552.14, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(178552.14, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(179134.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(179134.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(181018.94, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(181018.94, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(181601.11, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(181601.11, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(183485.75, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(183485.75, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(184067.91, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(184067.91, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(185952.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(185952.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(186534.71, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(186534.71, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(188419.35, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(188419.35, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(189001.52, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(189001.52, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(190886.15, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(190886.15, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(191468.32, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(191468.32, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    if (MostrarTodosPontos) then HorizontalLineCustom(70234.82, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(72839.76, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(75168.42, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(77773.37, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(80102.03, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(82706.97, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(85035.64, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(87640.58, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(89969.24, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(92574.19, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(94902.85, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(97507.79, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(99836.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(102441.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(104770.06, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(107375.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(109703.67, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(112308.61, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(114637.27, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(117242.22, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(119570.88, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(122175.82, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(124504.48, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(127109.43, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(129438.09, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(132043.03, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(134371.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(136976.64, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(139305.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(141910.25, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(144238.91, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(146843.85, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(149172.51, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(151777.46, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(154106.12, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(156711.06, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(158457.56, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(159760.03, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(160924.36, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(162226.84, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(163391.17, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(164693.64, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(165857.97, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(167160.44, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(168324.77, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(169627.25, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(170791.58, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(172094.05, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(173258.38, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(174560.85, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(175725.18, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(177027.65, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(177027.65, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(178191.99, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(178191.99, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(179494.46, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(179494.46, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(180658.79, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(180658.79, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(181961.26, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(181961.26, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(183125.59, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(183125.59, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(184428.06, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(184428.06, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(185592.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(185592.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(186894.87, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(186894.87, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(188059.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(188059.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(189361.67, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(189361.67, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(190526.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(190526.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (MostrarTodosPontos) then HorizontalLineCustom(191828.47, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    if (not MostrarTodosPontos) then HorizontalLineCustom(191828.47, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos) then\n  begin\n    HorizontalLineCustom(186977.62, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(186792.43, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(187330.29, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(186440.77, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(188247.06, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(185532.79, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(192673.76, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(181270.16, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "positive"
    },
    "overview": {
        "total_trades": 2968883,
        "total_volume": 45,
        "gamma_exposure": 11227525872547.613,
        "delta_position": 181674874354275.44,
        "last_update": "2026-03-11T11:05:40.339257",
        "spot_price": 186885.0,
        "dealer_pressure": 0.2211137091484531,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 133207.36536430835,
        "gamma_flip_hvl": 69070.48574445618,
        "gamma_flip_hvl_gaussian": 133207.36536430835,
        "call_wall": 187477.0327349525,
        "put_wall": 182543.42661034846,
        "effective_call_wall": 180796.29700907777,
        "effective_put_wall": 133323.5004562097,
        "max_pain": 167742.60823653644,
        "zero_gamma": 133207.36536430835,
        "range_low": 180560.7332671349,
        "range_high": 193209.2667328651,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "move": 1.2818750774055159,
                "upper": 193209.2667328651,
                "lower": 180560.7332671349
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 2,
                "move": 1.8128451197349413,
                "upper": 195828.8637856828,
                "lower": 177941.13621431723
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
                "strike": 38.0,
                "type": "CALL",
                "oi": 131694,
                "volume": 3,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 36.0,
                "type": "CALL",
                "oi": 83098,
                "volume": 0,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 25.0,
                "type": "PUT",
                "oi": 81933,
                "volume": 0,
                "expiry": "2026-06-18 00:00:00",
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
                "volume": 0,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 35.0,
                "type": "PUT",
                "oi": 64074,
                "volume": 0,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 39.0,
                "type": "CALL",
                "oi": 63985,
                "volume": 0,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 22.0,
                "type": "PUT",
                "oi": 62034,
                "volume": 0,
                "expiry": "2026-06-18 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 37.0,
                "type": "CALL",
                "oi": 61744,
                "volume": 2,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 35.0,
                "type": "CALL",
                "oi": 61095,
                "volume": 0,
                "expiry": "2026-12-18 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 34.0,
                "type": "CALL",
                "oi": 60256,
                "volume": 0,
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
            },
            {
                "strike": 37.0,
                "type": "PUT",
                "oi": 54694,
                "volume": 2,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 36.0,
                "type": "CALL",
                "oi": 50655,
                "volume": 0,
                "expiry": "2026-04-17 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 16.0,
                "type": "PUT",
                "oi": 50002,
                "volume": 0,
                "expiry": "2026-06-18 00:00:00",
                "iv": 0.0
            }
        ],
        "top_vol": [
            {
                "strike": 36.0,
                "type": "PUT",
                "oi": 11870,
                "volume": 11,
                "expiry": "2026-04-17 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 38.0,
                "type": "PUT",
                "oi": 17311,
                "volume": 9,
                "expiry": "2026-04-17 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 39.0,
                "type": "CALL",
                "oi": 2865,
                "volume": 5,
                "expiry": "2026-03-13 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 37.5,
                "type": "CALL",
                "oi": 2,
                "volume": 4,
                "expiry": "2026-04-10 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 38.0,
                "type": "CALL",
                "oi": 131694,
                "volume": 3,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 38.0,
                "type": "PUT",
                "oi": 44865,
                "volume": 2,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 37.0,
                "type": "CALL",
                "oi": 61744,
                "volume": 2,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 37.0,
                "type": "PUT",
                "oi": 54694,
                "volume": 2,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 37.0,
                "type": "CALL",
                "oi": 85,
                "volume": 2,
                "expiry": "2028-01-21 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 37.0,
                "type": "PUT",
                "oi": 7,
                "volume": 2,
                "expiry": "2028-01-21 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 34.0,
                "type": "PUT",
                "oi": 12081,
                "volume": 1,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 34.0,
                "type": "PUT",
                "oi": 12,
                "volume": 1,
                "expiry": "2026-04-02 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 34.0,
                "type": "PUT",
                "oi": 12081,
                "volume": 1,
                "expiry": "2026-03-20 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 28.0,
                "type": "PUT",
                "oi": 2,
                "volume": 0,
                "expiry": "2026-03-13 00:00:00",
                "iv": 0.0
            },
            {
                "strike": 39.0,
                "type": "PUT",
                "oi": 4,
                "volume": 0,
                "expiry": "2028-01-21 00:00:00",
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.6826894921370859
                },
                {
                    "sd": 2,
                    "upper": 186885.0,
                    "lower": 186885.0,
                    "prob_inside": 0.9544997361036416
                },
                {
                    "sd": 3,
                    "upper": 186885.0,
                    "lower": 186885.0,
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
                185028.22901507615,
                185240.74385265462,
                185735.59175599163,
                186205.83698954654,
                186636.0322344284,
                187041.19170932166,
                187424.6701830973,
                190889.03838916196,
                191937.16113047354,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835,
                133207.36536430835
            ]
        },
        "delta_flip_profile": {
            "spots": [
                158852.25,
                159996.443877551,
                161140.63775510204,
                162284.83163265305,
                163429.02551020408,
                164573.2193877551,
                165717.41326530612,
                166861.60714285713,
                168005.80102040817,
                169149.99489795917,
                170294.1887755102,
                171438.3826530612,
                172582.57653061225,
                173726.77040816325,
                174870.9642857143,
                176015.1581632653,
                177159.3520408163,
                178303.54591836734,
                179447.73979591837,
                180591.93367346938,
                181736.12755102038,
                182880.32142857142,
                184024.51530612243,
                185168.70918367346,
                186312.90306122447,
                187457.0969387755,
                188601.2908163265,
                189745.48469387754,
                190889.67857142855,
                192033.8724489796,
                193178.0663265306,
                194322.26020408163,
                195466.45408163263,
                196610.64795918364,
                197754.84183673467,
                198899.0357142857,
                200043.22959183672,
                201187.42346938772,
                202331.61734693876,
                203475.81122448976,
                204620.0051020408,
                205764.1989795918,
                206908.39285714287,
                208052.58673469385,
                209196.7806122449,
                210340.9744897959,
                211485.1683673469,
                212629.36224489793,
                213773.556122449,
                214917.75
            ],
            "deltas": [
                -44712.359389950674,
                -15240.910173022252,
                14851.783517960308,
                45535.40563344896,
                76773.37481153553,
                108523.04352383947,
                140735.95632572877,
                173358.16697700898,
                206330.6149929999,
                239589.56259630088,
                273067.09292947804,
                306691.6696919914,
                340388.75708125235,
                374081.497103334,
                407691.4390754263,
                441139.31361021136,
                474345.84072767396,
                507232.55918582453,
                539722.6618778284,
                571741.8204235445,
                603218.981072728,
                634087.1138629466,
                664283.8976896286,
                693752.3255173061,
                722441.2162822682,
                750305.6229426373,
                777307.12942622,
                803414.0327098129,
                828601.4097533065,
                852851.0723554734,
                876151.4160752333,
                898497.1720803906,
                919889.0730734665,
                940333.4462439249,
                959841.7474616899,
                978430.0516260908,
                996118.5142039745,
                1012930.8185434156,
                1028893.622578788,
                1044036.017124424,
                1058389.0061913112,
                1071985.0177771482,
                1084857.4515055576,
                1097040.2674507583,
                1108567.6185887028,
                1119473.5276479272,
                1129791.6077468002,
                1139554.825121348,
                1148795.3014651123,
                1157544.152893609
            ],
            "flip_value": 160575.93856444582
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
                4.0,
                4.0,
                3.0,
                0.0,
                5.0
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
                -3.0,
                -0.0,
                -0.0,
                -0.0,
                -11.0,
                -0.0,
                -4.0,
                -0.0,
                -11.0,
                -0.0,
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                158852.25,
                159996.443877551,
                161140.63775510204,
                162284.83163265305,
                163429.02551020408,
                164573.2193877551,
                165717.41326530612,
                166861.60714285713,
                168005.80102040817,
                169149.99489795917,
                170294.1887755102,
                171438.3826530612,
                172582.57653061225,
                173726.77040816325,
                174870.9642857143,
                176015.1581632653,
                177159.3520408163,
                178303.54591836734,
                179447.73979591837,
                180591.93367346938,
                181736.12755102038,
                182880.32142857142,
                184024.51530612243,
                185168.70918367346,
                186312.90306122447,
                187457.0969387755,
                188601.2908163265,
                189745.48469387754,
                190889.67857142855,
                192033.8724489796,
                193178.0663265306,
                194322.26020408163,
                195466.45408163263,
                196610.64795918364,
                197754.84183673467,
                198899.0357142857,
                200043.22959183672,
                201187.42346938772,
                202331.61734693876,
                203475.81122448976,
                204620.0051020408,
                205764.1989795918,
                206908.39285714287,
                208052.58673469385,
                209196.7806122449,
                210340.9744897959,
                211485.1683673469,
                212629.36224489793,
                213773.556122449,
                214917.75
            ],
            "pnl": [
                7638721.475935595,
                7470190.277924049,
                7291916.969702205,
                7103410.816570915,
                6904187.968791446,
                6693780.882318565,
                6471746.735293785,
                6237674.487080148,
                5991190.406034184,
                5731962.066113852,
                5459700.967915468,
                5174164.066407258,
                4875154.5764326565,
                4562522.47017459,
                4236165.07256197,
                3896028.0993120894,
                3542107.371807294,
                3174451.293841902,
                2793164.0043989266,
                2398408.9496963066,
                1990412.470186913,
                1569466.8955189525,
                1135932.5987053998,
                690238.4877505223,
                232880.5070171291,
                -235582.12932125945,
                -714533.0617862884,
                -1203307.1559419753,
                -1701200.8137679305,
                -2207483.759618175,
                -2721411.7201818023,
                -3242239.360675006,
                -3769232.8412099136,
                -4301681.412905796,
                -4838907.572318981,
                -5380275.4211543845,
                -5925197.02062907,
                -6473136.671597793,
                -7023613.1801908435,
                -7576200.275101076,
                -8130525.421355412,
                -8686267.324596316,
                -9243152.440878596,
                -9800950.803393971,
                -10359471.454498306,
                -10918557.734691378,
                -11478082.635479882,
                -12037944.375411075,
                -12598062.312123854,
                -13158373.261043698
            ]
        },
        "max_pain_profile": {
            "strikes": [
                69070.48574445618,
                74004.09186906018,
                78937.6979936642,
                83871.30411826822,
                88804.91024287223,
                93738.51636747624,
                98672.12249208025,
                103605.72861668427,
                108539.33474128827,
                113472.94086589229,
                118406.54699049631,
                123340.15311510031,
                128273.75923970433,
                133207.36536430835,
                138140.97148891236,
                143074.57761351636,
                148008.18373812037,
                152941.7898627244,
                157875.3959873284,
                160342.1990496304,
                162809.0021119324,
                165275.8051742344,
                167742.60823653644,
                170209.41129883844,
                172676.21436114045,
                175143.01742344245,
                177609.82048574445,
                180076.62354804645,
                182543.42661034846,
                185010.2296726505,
                187477.0327349525,
                189943.8357972545,
                192410.6388595565
            ],
            "loss": [
                23223927.5,
                21663407.5,
                20112824.5,
                18612335.5,
                17115475.5,
                15638766.5,
                14170180.5,
                12743548.5,
                11394224.5,
                10135113.5,
                8897640.5,
                7707390.5,
                6687947.5,
                5751478.5,
                4935242.5,
                4154586.5,
                3452398.5,
                2913394.5,
                2436246.5,
                2266562.0,
                2096987.0,
                2041359.0,
                1986376.0,
                2047096.5,
                2108301.5,
                2329710.5,
                2552951.0,
                2880747.0,
                3210386.0,
                3673762.5,
                4141127.0,
                4785817.0,
                5431534.5
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 187477.0327349525,
                "options": [
                    {
                        "Strike": 123340.15311510031,
                        "Call_Now": 63601.28484946137,
                        "Call_Sim": 64192.74034043332,
                        "Call_Chg": 0.92994267705735,
                        "Put_Now": 7.503169284192268,
                        "Put_Sim": 6.925925303676105,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 128273.75923970433,
                        "Call_Now": 58682.39757113068,
                        "Call_Sim": 59272.97841700166,
                        "Call_Chg": 1.0064020393084971,
                        "Put_Now": 20.264623746417,
                        "Put_Sim": 18.81273466491214,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 133207.36536430835,
                        "Call_Now": 53779.82027583738,
                        "Call_Sim": 54368.5664124169,
                        "Call_Chg": 1.09473429542872,
                        "Put_Now": 49.33606124604017,
                        "Put_Sim": 46.04946287308672,
                        "Put_Chg": -6.661655369209757
                    },
                    {
                        "Strike": 138140.97148891236,
                        "Call_Now": 48848.17154304448,
                        "Call_Sim": 49436.595270483864,
                        "Call_Chg": 1.204597242541344,
                        "Put_Now": 49.33606124603866,
                        "Put_Sim": 45.72705373297753,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 143074.57761351636,
                        "Call_Now": 43916.52281025154,
                        "Call_Sim": 44504.56570906593,
                        "Call_Chg": 1.339001499174073,
                        "Put_Now": 49.33606124604072,
                        "Put_Sim": 45.34622510795411,
                        "Put_Chg": -8.087058507141768
                    },
                    {
                        "Strike": 177609.82048574445,
                        "Call_Now": 9987.014415653666,
                        "Call_Sim": 10501.732783554735,
                        "Call_Chg": 5.153876288536229,
                        "Put_Now": 641.3687961985211,
                        "Put_Sim": 564.0544291471655,
                        "Put_Chg": -12.054588172921465
                    },
                    {
                        "Strike": 180076.62354804645,
                        "Call_Now": 8014.550661717558,
                        "Call_Sim": 8485.539473319108,
                        "Call_Chg": 5.87667146270948,
                        "Put_Now": 1134.7294086589338,
                        "Put_Sim": 1013.6854853080143,
                        "Put_Chg": -10.667205981201608
                    },
                    {
                        "Strike": 182543.42661034846,
                        "Call_Now": 6338.103275257771,
                        "Call_Sim": 6753.581771122119,
                        "Call_Chg": 6.555249698853319,
                        "Put_Now": 1924.1063885955678,
                        "Put_Sim": 1747.5521495074024,
                        "Put_Chg": -9.175908366326603
                    },
                    {
                        "Strike": 185010.2296726505,
                        "Call_Now": 4414.975582567763,
                        "Call_Sim": 4778.414086555949,
                        "Call_Chg": 8.231948222391052,
                        "Put_Now": 2466.803062302024,
                        "Put_Sim": 2238.2088313377235,
                        "Put_Chg": -9.266821273968096
                    },
                    {
                        "Strike": 187477.0327349525,
                        "Call_Now": 2121.450633579724,
                        "Call_Sim": 2412.417827549797,
                        "Call_Chg": 13.715482668531234,
                        "Put_Now": 2639.1024797104315,
                        "Put_Sim": 2338.0369387280357,
                        "Put_Chg": -11.40787609791604
                    },
                    {
                        "Strike": 189943.8357972545,
                        "Call_Now": 1184.0654699049553,
                        "Call_Sim": 1380.8851558731465,
                        "Call_Chg": 16.62236514539942,
                        "Put_Now": 4167.541682432126,
                        "Put_Sim": 3772.3286334478403,
                        "Put_Chg": -9.48312168418781
                    },
                    {
                        "Strike": 192410.6388595565,
                        "Call_Now": 542.696673706443,
                        "Call_Sim": 656.2360195421909,
                        "Call_Chg": 20.921327020545537,
                        "Put_Now": 5991.997252630092,
                        "Put_Sim": 5513.503863513362,
                        "Put_Chg": -7.985540862968565
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 182543.42661034846,
                "options": [
                    {
                        "Strike": 123340.15311510031,
                        "Call_Now": 63601.28484946137,
                        "Call_Sim": 59265.615046277504,
                        "Call_Chg": -6.816953169178911,
                        "Put_Now": 7.503169284192268,
                        "Put_Sim": 13.406755751892529,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 128273.75923970433,
                        "Call_Now": 58682.39757113068,
                        "Call_Sim": 54355.27219214282,
                        "Call_Chg": -7.373804680940017,
                        "Put_Now": 20.264623746417,
                        "Put_Sim": 34.71263441010325,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 133207.36536430835,
                        "Call_Now": 53779.82027583738,
                        "Call_Sim": 49470.1167231332,
                        "Call_Chg": -8.013607205453004,
                        "Put_Now": 49.33606124604017,
                        "Put_Sim": 81.20589819339938,
                        "Put_Chg": 64.5974488892081
                    },
                    {
                        "Strike": 138140.97148891236,
                        "Call_Now": 48848.17154304448,
                        "Call_Sim": 44542.552919060494,
                        "Call_Chg": -8.814288207676153,
                        "Put_Now": 49.33606124603866,
                        "Put_Sim": 85.29082691361644,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 143074.57761351636,
                        "Call_Now": 43916.52281025154,
                        "Call_Sim": 39615.99468264713,
                        "Call_Chg": -9.792505991846266,
                        "Put_Now": 49.33606124604072,
                        "Put_Sim": 90.38132329316642,
                        "Put_Chg": 83.19525517538074
                    },
                    {
                        "Strike": 177609.82048574445,
                        "Call_Now": 9987.014415653666,
                        "Call_Sim": 6516.825420304215,
                        "Call_Chg": -34.747010977677874,
                        "Put_Now": 641.3687961985211,
                        "Put_Sim": 1512.753190500653,
                        "Put_Chg": 135.8632349230184
                    },
                    {
                        "Strike": 180076.62354804645,
                        "Call_Now": 8014.550661717558,
                        "Call_Sim": 4939.819767596748,
                        "Call_Chg": -38.36435782741537,
                        "Put_Now": 1134.7294086589338,
                        "Put_Sim": 2401.5719041896587,
                        "Put_Chg": 111.64269524202493
                    },
                    {
                        "Strike": 182543.42661034846,
                        "Call_Now": 6338.103275257771,
                        "Call_Sim": 3714.9096533167944,
                        "Call_Chg": -41.38767558713046,
                        "Put_Now": 1924.1063885955678,
                        "Put_Sim": 3642.486156306117,
                        "Put_Chg": 89.30793940998342
                    },
                    {
                        "Strike": 185010.2296726505,
                        "Call_Now": 4414.975582567763,
                        "Call_Sim": 2252.007921897539,
                        "Call_Chg": -48.99161094368353,
                        "Put_Now": 2466.803062302024,
                        "Put_Sim": 4645.408791283317,
                        "Put_Chg": 88.31697034412691
                    },
                    {
                        "Strike": 187477.0327349525,
                        "Call_Now": 2121.450633579724,
                        "Call_Sim": 673.0091282516564,
                        "Call_Chg": -68.27599390724333,
                        "Put_Now": 2639.1024797104315,
                        "Put_Sim": 5532.2343640339295,
                        "Put_Chg": 109.62559834512146
                    },
                    {
                        "Strike": 189943.8357972545,
                        "Call_Now": 1184.0654699049553,
                        "Call_Sim": 305.30919826184663,
                        "Call_Chg": -74.21517593226042,
                        "Put_Now": 4167.541682432126,
                        "Put_Sim": 7630.358800440549,
                        "Put_Chg": 83.0901615838804
                    },
                    {
                        "Strike": 192410.6388595565,
                        "Call_Now": 542.696673706443,
                        "Call_Sim": 103.26862463258426,
                        "Call_Chg": -80.97120737311823,
                        "Put_Now": 5991.997252630092,
                        "Put_Sim": 9894.142593207767,
                        "Put_Chg": 65.12261564981343
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 133207.36536430835,
                "options": [
                    {
                        "Strike": 123340.15311510031,
                        "Call_Now": 63601.28484946137,
                        "Call_Sim": 13084.449359013943,
                        "Call_Chg": -79.42738202540454,
                        "Put_Now": 7.503169284192268,
                        "Put_Sim": 3168.3023145284487,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 128273.75923970433,
                        "Call_Now": 58682.39757113068,
                        "Call_Sim": 9947.7277264635,
                        "Call_Chg": -83.04819138583156,
                        "Put_Now": 20.264623746417,
                        "Put_Sim": 4963.22941477092,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 133207.36536430835,
                        "Call_Now": 53779.82027583738,
                        "Call_Sim": 7344.755729015913,
                        "Call_Chg": -86.3429150723365,
                        "Put_Now": 49.33606124604017,
                        "Put_Sim": 7291.906150116245,
                        "Put_Chg": 14680.073572860481
                    },
                    {
                        "Strike": 138140.97148891236,
                        "Call_Now": 48848.17154304448,
                        "Call_Sim": 4569.572731495704,
                        "Call_Chg": -90.6453556250943,
                        "Put_Now": 49.33606124603866,
                        "Put_Sim": 9448.371885388937,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 143074.57761351636,
                        "Call_Now": 43916.52281025154,
                        "Call_Sim": 2436.1689418139904,
                        "Call_Chg": -94.45272807152821,
                        "Put_Now": 49.33606124604072,
                        "Put_Sim": 12246.61682850016,
                        "Put_Chg": 24722.850708381116
                    },
                    {
                        "Strike": 177609.82048574445,
                        "Call_Now": 9987.014415653666,
                        "Call_Sim": 1.3584959004031008e-06,
                        "Call_Chg": -99.99999998639737,
                        "Put_Now": 641.3687961985211,
                        "Put_Sim": 44331.98901759506,
                        "Put_Chg": 6812.090092370677
                    },
                    {
                        "Strike": 180076.62354804645,
                        "Call_Now": 8014.550661717558,
                        "Call_Sim": 3.884117325419064e-07,
                        "Call_Chg": -99.99999999515367,
                        "Put_Now": 1134.7294086589338,
                        "Put_Sim": 46797.81338302145,
                        "Put_Chg": 4024.138585456147
                    },
                    {
                        "Strike": 182543.42661034846,
                        "Call_Now": 6338.103275257771,
                        "Call_Sim": 2.8524769310774644e-07,
                        "Call_Chg": -99.99999999549948,
                        "Put_Now": 1924.1063885955678,
                        "Put_Sim": 49263.637749314716,
                        "Put_Chg": 2460.338557228789
                    },
                    {
                        "Strike": 185010.2296726505,
                        "Call_Now": 4414.975582567763,
                        "Call_Sim": 1.8114713918415276e-10,
                        "Call_Chg": -99.9999999999959,
                        "Put_Now": 2466.803062302024,
                        "Put_Sim": 51729.462115426104,
                        "Put_Chg": 1997.0243999596833
                    },
                    {
                        "Strike": 187477.0327349525,
                        "Call_Now": 2121.450633579724,
                        "Call_Sim": 1.4061445602524941e-24,
                        "Call_Chg": -100.0,
                        "Put_Now": 2639.1024797104315,
                        "Put_Sim": 54195.286481822375,
                        "Put_Chg": 1953.5499056394663
                    },
                    {
                        "Strike": 189943.8357972545,
                        "Call_Now": 1184.0654699049553,
                        "Call_Sim": 1.2984970818316927e-26,
                        "Call_Chg": -100.0,
                        "Put_Now": 4167.541682432126,
                        "Put_Sim": 56661.11084821884,
                        "Put_Chg": 1259.5811431729246
                    },
                    {
                        "Strike": 192410.6388595565,
                        "Call_Now": 542.696673706443,
                        "Call_Sim": 7.387309520646618e-31,
                        "Call_Chg": -100.0,
                        "Put_Now": 5991.997252630092,
                        "Put_Sim": 59126.9352146153,
                        "Put_Chg": 886.7650588234578
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 188753.85,
                "options": [
                    {
                        "Strike": 123340.15311510031,
                        "Call_Now": 63601.28484946137,
                        "Call_Sim": 65468.45523523103,
                        "Call_Chg": 2.935743185360301,
                        "Put_Now": 7.503169284192268,
                        "Put_Sim": 5.823555053860507,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 128273.75923970433,
                        "Call_Now": 58682.39757113068,
                        "Call_Sim": 60546.996793131795,
                        "Call_Chg": 3.17744212775387,
                        "Put_Now": 20.264623746417,
                        "Put_Sim": 16.013845747572155,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 133207.36536430835,
                        "Call_Now": 53779.82027583738,
                        "Call_Sim": 55638.990862439874,
                        "Call_Chg": 3.4570040901341597,
                        "Put_Now": 49.33606124604017,
                        "Put_Sim": 39.656647848523406,
                        "Put_Chg": -19.619347700346996
                    },
                    {
                        "Strike": 138140.97148891236,
                        "Call_Now": 48848.17154304448,
                        "Call_Sim": 50706.461965253904,
                        "Call_Chg": 3.8042169512361745,
                        "Put_Now": 49.33606124603866,
                        "Put_Sim": 38.77648345544826,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 143074.57761351636,
                        "Call_Now": 43916.52281025154,
                        "Call_Sim": 45773.78911778039,
                        "Call_Chg": 4.229083244029756,
                        "Put_Now": 49.33606124604072,
                        "Put_Sim": 37.752368774877496,
                        "Put_Chg": -23.479159419303727
                    },
                    {
                        "Strike": 177609.82048574445,
                        "Call_Now": 9987.014415653666,
                        "Call_Sim": 11638.047852325535,
                        "Call_Chg": 16.53180187748639,
                        "Put_Now": 641.3687961985211,
                        "Put_Sim": 423.5522328703967,
                        "Put_Chg": -33.96120369733489
                    },
                    {
                        "Strike": 180076.62354804645,
                        "Call_Now": 8014.550661717558,
                        "Call_Sim": 9536.503750339465,
                        "Call_Chg": 18.98987420332489,
                        "Put_Now": 1134.7294086589338,
                        "Put_Sim": 787.8324972808362,
                        "Put_Chg": -30.570892825283657
                    },
                    {
                        "Strike": 182543.42661034846,
                        "Call_Now": 6338.103275257771,
                        "Call_Sim": 7691.90274246878,
                        "Call_Chg": 21.359694034899583,
                        "Put_Now": 1924.1063885955678,
                        "Put_Sim": 1409.055855806568,
                        "Put_Chg": -26.768298044316687
                    },
                    {
                        "Strike": 185010.2296726505,
                        "Call_Now": 4414.975582567763,
                        "Call_Sim": 5614.939788911694,
                        "Call_Chg": 27.179407539237815,
                        "Put_Now": 2466.803062302024,
                        "Put_Sim": 1797.9172686459376,
                        "Put_Chg": -27.115492269248325
                    },
                    {
                        "Strike": 187477.0327349525,
                        "Call_Now": 2121.450633579724,
                        "Call_Sim": 3119.4267246987665,
                        "Call_Chg": 47.04215480305866,
                        "Put_Now": 2639.1024797104315,
                        "Put_Sim": 1768.2285708294737,
                        "Put_Chg": -32.998866681998344
                    },
                    {
                        "Strike": 189943.8357972545,
                        "Call_Now": 1184.0654699049553,
                        "Call_Sim": 1880.4936714506935,
                        "Call_Chg": 58.81669715456192,
                        "Put_Now": 4167.541682432126,
                        "Put_Sim": 2995.1198839778735,
                        "Put_Chg": -28.13221529124676
                    },
                    {
                        "Strike": 192410.6388595565,
                        "Call_Now": 542.696673706443,
                        "Call_Sim": 962.1158391667688,
                        "Call_Chg": 77.28427052921263,
                        "Put_Now": 5991.997252630092,
                        "Put_Sim": 4542.566418090404,
                        "Put_Chg": -24.189444244212275
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 185016.15000000002,
                "options": [
                    {
                        "Strike": 123340.15311510031,
                        "Call_Now": 63601.28484946137,
                        "Call_Sim": 61734.57848457164,
                        "Call_Chg": -2.9350136075207547,
                        "Put_Now": 7.503169284192268,
                        "Put_Sim": 9.646804394447017,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 128273.75923970433,
                        "Call_Now": 58682.39757113068,
                        "Call_Sim": 56818.86982423152,
                        "Call_Chg": -3.175616239333639,
                        "Put_Now": 20.264623746417,
                        "Put_Sim": 25.586876847249,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 133207.36536430835,
                        "Call_Now": 53779.82027583738,
                        "Call_Sim": 51922.8706759461,
                        "Call_Chg": -3.452874313017345,
                        "Put_Now": 49.33606124604017,
                        "Put_Sim": 61.2364613547406,
                        "Put_Chg": 24.121098863877343
                    },
                    {
                        "Strike": 138140.97148891236,
                        "Call_Now": 48848.17154304448,
                        "Call_Sim": 46992.56271295467,
                        "Call_Chg": -3.798727304367318,
                        "Put_Now": 49.33606124603866,
                        "Put_Sim": 62.57723115621998,
                        "Put_Chg": 0.0
                    },
                    {
                        "Strike": 143074.57761351636,
                        "Call_Now": 43916.52281025154,
                        "Call_Sim": 42062.542081296895,
                        "Call_Chg": -4.221601826185257,
                        "Put_Now": 49.33606124604072,
                        "Put_Sim": 64.20533229139335,
                        "Put_Chg": 30.13874774315492
                    },
                    {
                        "Strike": 177609.82048574445,
                        "Call_Now": 9987.014415653666,
                        "Call_Sim": 8421.603357215728,
                        "Call_Chg": -15.674464792844484,
                        "Put_Now": 641.3687961985211,
                        "Put_Sim": 944.8077377606058,
                        "Put_Chg": 47.31114818192093
                    },
                    {
                        "Strike": 180076.62354804645,
                        "Call_Now": 8014.550661717558,
                        "Call_Sim": 6604.091159160892,
                        "Call_Chg": -17.598734627680262,
                        "Put_Now": 1134.7294086589338,
                        "Put_Sim": 1593.119906102251,
                        "Put_Chg": 40.3964587456194
                    },
                    {
                        "Strike": 182543.42661034846,
                        "Call_Now": 6338.103275257771,
                        "Call_Sim": 5114.343834150431,
                        "Call_Chg": -19.307975713879014,
                        "Put_Now": 1924.1063885955678,
                        "Put_Sim": 2569.1969474882094,
                        "Put_Chg": 33.526761447089335
                    },
                    {
                        "Strike": 185010.2296726505,
                        "Call_Now": 4414.975582567763,
                        "Call_Sim": 3374.163603977256,
                        "Call_Chg": -23.57458063188579,
                        "Put_Now": 2466.803062302024,
                        "Put_Sim": 3294.8410837115084,
                        "Put_Chg": 33.567252857095056
                    },
                    {
                        "Strike": 187477.0327349525,
                        "Call_Now": 2121.450633579724,
                        "Call_Sim": 1355.6949861866797,
                        "Call_Chg": -36.09585041820711,
                        "Put_Now": 2639.1024797104315,
                        "Put_Sim": 3742.1968323173874,
                        "Put_Chg": 41.79808708027094
                    },
                    {
                        "Strike": 189943.8357972545,
                        "Call_Now": 1184.0654699049553,
                        "Call_Sim": 695.2929171482521,
                        "Call_Chg": -41.27918305023597,
                        "Put_Now": 4167.541682432126,
                        "Put_Sim": 5547.619129675415,
                        "Put_Chg": 33.1149044786012
                    },
                    {
                        "Strike": 192410.6388595565,
                        "Call_Now": 542.696673706443,
                        "Call_Sim": 281.93185281052547,
                        "Call_Chg": -48.04982848245191,
                        "Put_Now": 5991.997252630092,
                        "Put_Sim": 7600.08243173415,
                        "Put_Chg": 26.837214893551813
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            2.6218430993138706e-05,
            -0.0006999500463077588,
            -0.0023608613679314424,
            -0.0005892830703530284,
            -0.013153881913841533,
            -0.0060141132912846585,
            -0.012102633500369058,
            -0.029698769441041196,
            -0.049948411850180716,
            -0.013598277866310727,
            -0.020375618043075593,
            -0.11494361540155104,
            -0.0896855552697315,
            -0.05742235249608342,
            -0.025716800179766495,
            -0.03733840458576636,
            -0.0690956442261133,
            -0.011279064953929066,
            -0.06627740888923167,
            -0.00014069772597553746,
            0.04223498284008281,
            -0.0028736454965894997,
            -0.06427854388690055,
            -0.0026321944417552028,
            -0.103967188584553,
            -0.011536605079627229,
            -0.05962968783164585,
            -0.00902287573536367,
            0.13324554278035805,
            0.0006474062582388699,
            0.5827362237224594,
            0.014572312756037873,
            0.37436706022517136
        ]
    },
    "delta_data": {
        "strikes": [
            69070.48574445618,
            74004.09186906018,
            78937.6979936642,
            83871.30411826822,
            88804.91024287223,
            93738.51636747624,
            98672.12249208025,
            103605.72861668427,
            108539.33474128827,
            113472.94086589229,
            118406.54699049631,
            123340.15311510031,
            128273.75923970433,
            133207.36536430835,
            138140.97148891236,
            143074.57761351636,
            148008.18373812037,
            152941.7898627244,
            157875.3959873284,
            160342.1990496304,
            162809.0021119324,
            165275.8051742344,
            167742.60823653644,
            170209.41129883844,
            172676.21436114045,
            175143.01742344245,
            177609.82048574445,
            180076.62354804645,
            182543.42661034846,
            185010.2296726505,
            187477.0327349525,
            189943.8357972545,
            192410.6388595565
        ],
        "delta_values": [
            39.14237110008459,
            1662.6289073549556,
            -34.224414202118744,
            -18.17472635588838,
            -622.0865563301513,
            -341.02359887238777,
            313.576263496927,
            -1618.3991669246102,
            -1969.752658283439,
            -1413.1491456140318,
            -1554.0967579270675,
            -7425.267427675066,
            -4764.167811295955,
            14678.688768801798,
            469.13543008278907,
            19133.398255893062,
            17516.55160589113,
            19035.256511362622,
            39426.67210049539,
            -1.3297269034382917,
            100372.582520186,
            -83.01570684649954,
            131887.03283520672,
            -102.53655555393628,
            130782.42522661095,
            -172.67897047856707,
            76586.77954384571,
            -864.9022635713063,
            62625.16401242783,
            -1882.3046233803689,
            96277.93611405745,
            630.8627550121895,
            47908.313787011684
        ],
        "delta_cumulative": [
            39.14237110008459,
            1701.7712784550401,
            1667.5468642529213,
            1649.3721378970329,
            1027.2855815668815,
            686.2619826944938,
            999.8382461914208,
            -618.5609207331894,
            -2588.3135790166284,
            -4001.46272463066,
            -5555.559482557727,
            -12980.826910232794,
            -17744.99472152875,
            -3066.3059527269525,
            -2597.1705226441636,
            16536.2277332489,
            34052.779339140034,
            53088.03585050265,
            92514.70795099804,
            92513.3782240946,
            192885.9607442806,
            192802.9450374341,
            324689.9778726408,
            324587.44131708686,
            455369.86654369783,
            455197.18757321924,
            531783.967117065,
            530919.0648534937,
            593544.2288659215,
            591661.9242425411,
            687939.8603565985,
            688570.7231116107,
            736479.0368986224
        ]
    },
    "gamma_data": {
        "strikes": [
            69070.48574445618,
            74004.09186906018,
            78937.6979936642,
            83871.30411826822,
            88804.91024287223,
            93738.51636747624,
            98672.12249208025,
            103605.72861668427,
            108539.33474128827,
            113472.94086589229,
            118406.54699049631,
            123340.15311510031,
            128273.75923970433,
            133207.36536430835,
            138140.97148891236,
            143074.57761351636,
            148008.18373812037,
            152941.7898627244,
            157875.3959873284,
            160342.1990496304,
            162809.0021119324,
            165275.8051742344,
            167742.60823653644,
            170209.41129883844,
            172676.21436114045,
            175143.01742344245,
            177609.82048574445,
            180076.62354804645,
            182543.42661034846,
            185010.2296726505,
            187477.0327349525,
            189943.8357972545,
            192410.6388595565
        ],
        "gamma_values": [
            21244616.574339706,
            1810338137.984106,
            1004302134.0307099,
            285911708.35274875,
            7173032975.352104,
            3576291427.8957977,
            8502572857.03415,
            19899362617.59469,
            35956533524.25614,
            11504847591.599224,
            18472540303.661034,
            107967589947.17632,
            91340700070.0209,
            125083794228.34111,
            42548421474.2578,
            124257821338.18182,
            266973333483.8802,
            99288470660.36832,
            281893247686.7054,
            158879565.3453998,
            546170703865.4944,
            4505447583.752315,
            880260777966.7399,
            5634737323.191608,
            1500888437881.3657,
            29201975095.79546,
            1498337076080.605,
            38973224170.58158,
            1876342806331.2393,
            93152221042.7822,
            2533116599706.406,
            37088349954.14743,
            936134279196.9005
        ],
        "gamma_call": [
            8683528.19044082,
            331391418.8817527,
            0.0,
            0.0,
            0.0,
            2389266.397461344,
            485711665.4988555,
            4950289.9818309145,
            331857179.914526,
            18561836.760168515,
            235672349.06344652,
            854900964.5909083,
            1008708779.6710134,
            32851637055.257587,
            6250149220.156738,
            49544450981.20628,
            71803448948.36658,
            36110809666.545616,
            97275755249.8851,
            220999.0825266978,
            351680449302.9403,
            19092170.63998685,
            650346543167.7517,
            78117206.80220571,
            886863497845.5482,
            4009187343.5656533,
            1024029016904.3951,
            2619833508.2661266,
            1038106650913.238,
            21167167734.49808,
            1852565459474.9727,
            34199436217.906784,
            915207083166.5564
        ],
        "gamma_put": [
            12561088.383898886,
            1478946719.1023533,
            1004302134.0307099,
            285911708.35274875,
            7173032975.352104,
            3573902161.4983363,
            8016861191.535295,
            19894412327.612858,
            35624676344.34161,
            11486285754.839056,
            18236867954.597588,
            107112688982.58539,
            90331991290.34988,
            92232157173.08353,
            36298272254.10105,
            74713370356.97552,
            195169884535.5136,
            63177660993.82272,
            184617492436.82025,
            158658566.2628731,
            194490254562.55414,
            4486355413.112328,
            229914234798.98816,
            5556620116.389402,
            614024940035.8176,
            25192787752.22981,
            474308059176.2095,
            36353390662.31545,
            838236155418.0016,
            71985053308.2841,
            680551140231.4329,
            2888913736.2406445,
            20927196030.344315
        ],
        "gamma_exposure": [
            21244616.574339706,
            1831582754.5584457,
            2835884888.5891557,
            3121796596.9419045,
            10294829572.294008,
            13871121000.189806,
            22373693857.223957,
            42273056474.81865,
            78229589999.0748,
            89734437590.67403,
            108206977894.33505,
            216174567841.51135,
            307515267911.5322,
            432599062139.87335,
            475147483614.13116,
            599405304952.313,
            866378638436.1931,
            965667109096.5614,
            1247560356783.2668,
            1247719236348.6123,
            1793889940214.1067,
            1798395387797.859,
            2678656165764.5986,
            2684290903087.79,
            4185179340969.156,
            4214381316064.951,
            5712718392145.557,
            5751691616316.139,
            7628034422647.378,
            7721186643690.16,
            10254303243396.566,
            10291391593350.713,
            11227525872547.613
        ]
    },
    "oi_data": {
        "strikes": [
            69070.48574445618,
            74004.09186906018,
            78937.6979936642,
            83871.30411826822,
            88804.91024287223,
            93738.51636747624,
            98672.12249208025,
            103605.72861668427,
            108539.33474128827,
            113472.94086589229,
            118406.54699049631,
            123340.15311510031,
            128273.75923970433,
            133207.36536430835,
            138140.97148891236,
            143074.57761351636,
            148008.18373812037,
            152941.7898627244,
            157875.3959873284,
            160342.1990496304,
            162809.0021119324,
            165275.8051742344,
            167742.60823653644,
            170209.41129883844,
            172676.21436114045,
            175143.01742344245,
            177609.82048574445,
            180076.62354804645,
            182543.42661034846,
            185010.2296726505,
            187477.0327349525,
            189943.8357972545,
            192410.6388595565
        ],
        "call_oi": [
            41.0,
            1809.0,
            0.0,
            0.0,
            0.0,
            5.0,
            943.0,
            12.0,
            477.0,
            25.0,
            322.0,
            941.0,
            1002.0,
            26841.0,
            4601.0,
            28162.0,
            47701.0,
            27112.0,
            57015.0,
            2.0,
            150732.0,
            6.0,
            175974.0,
            24.0,
            210353.0,
            499.0,
            138575.0,
            237.0,
            163440.0,
            1536.0,
            255673.0,
            1879.0,
            112262.0
        ],
        "put_oi": [
            121.0,
            8128.0,
            50094.0,
            3629.0,
            20151.0,
            8118.0,
            41011.0,
            77296.0,
            89736.0,
            21613.0,
            46901.0,
            169866.0,
            81972.0,
            93392.0,
            30979.0,
            50306.0,
            115483.0,
            34744.0,
            80764.0,
            217.0,
            77162.0,
            1284.0,
            55433.0,
            945.0,
            110055.0,
            3164.0,
            70536.0,
            3449.0,
            104035.0,
            6440.0,
            98978.0,
            176.0,
            4504.0
        ],
        "total_oi": [
            162.0,
            9937.0,
            50094.0,
            3629.0,
            20151.0,
            8123.0,
            41954.0,
            77308.0,
            90213.0,
            21638.0,
            47223.0,
            170807.0,
            82974.0,
            120233.0,
            35580.0,
            78468.0,
            163184.0,
            61856.0,
            137779.0,
            219.0,
            227894.0,
            1290.0,
            231407.0,
            969.0,
            320408.0,
            3663.0,
            209111.0,
            3686.0,
            267475.0,
            7976.0,
            354651.0,
            2055.0,
            116766.0
        ]
    },
    "gex_by_expiry": [
        {
            "expiry": "2026-03-13",
            "days_to_exp": 2,
            "abs_call": 36168415.83546427,
            "abs_put": 20614683.26544199,
            "net": 56783099.10090626
        },
        {
            "expiry": "2026-03-20",
            "days_to_exp": 7,
            "abs_call": 931785204.3579614,
            "abs_put": 434922826.3183392,
            "net": 1366708030.6763008
        },
        {
            "expiry": "2026-03-27",
            "days_to_exp": 12,
            "abs_call": 2022560.563889443,
            "abs_put": 2177617.528008144,
            "net": 4200178.091897587
        },
        {
            "expiry": "2026-03-31",
            "days_to_exp": 14,
            "abs_call": 16351928.29282155,
            "abs_put": 4351875.135784231,
            "net": 20703803.428605784
        },
        {
            "expiry": "2026-04-02",
            "days_to_exp": 16,
            "abs_call": 606948.0217781698,
            "abs_put": 732823.795396428,
            "net": 1339771.8171745979
        },
        {
            "expiry": "2026-04-10",
            "days_to_exp": 22,
            "abs_call": 30723.80117289992,
            "abs_put": 402590.5268400592,
            "net": 433314.32801295916
        },
        {
            "expiry": "2026-04-17",
            "days_to_exp": 27,
            "abs_call": 202703218.70283443,
            "abs_put": 113398552.56216472,
            "net": 316101771.2649991
        },
        {
            "expiry": "2026-04-24",
            "days_to_exp": 32,
            "abs_call": 11883.409797978591,
            "abs_put": 59544.30220725343,
            "net": 71427.71200523202
        },
        {
            "expiry": "2026-05-15",
            "days_to_exp": 47,
            "abs_call": 6801533.540567622,
            "abs_put": 48785032.9708756,
            "net": 55586566.51144321
        },
        {
            "expiry": "2026-06-18",
            "days_to_exp": 71,
            "abs_call": 77415698.00198686,
            "abs_put": 110522398.51063019,
            "net": 187938096.51261708
        },
        {
            "expiry": "2026-06-30",
            "days_to_exp": 79,
            "abs_call": 404343.271732664,
            "abs_put": 383936.21324277914,
            "net": 788279.4849754431
        },
        {
            "expiry": "2026-07-17",
            "days_to_exp": 92,
            "abs_call": 435230.00199554936,
            "abs_put": 1741005.399913055,
            "net": 2176235.4019086044
        },
        {
            "expiry": "2026-08-21",
            "days_to_exp": 117,
            "abs_call": 182126.4064441839,
            "abs_put": 5617721.974810226,
            "net": 5799848.381254409
        },
        {
            "expiry": "2026-09-18",
            "days_to_exp": 137,
            "abs_call": 14308508.946588527,
            "abs_put": 20177061.414977774,
            "net": 34485570.361566305
        },
        {
            "expiry": "2026-09-30",
            "days_to_exp": 145,
            "abs_call": 984545.0789840515,
            "abs_put": 92202.23839107655,
            "net": 1076747.317375128
        },
        {
            "expiry": "2026-10-16",
            "days_to_exp": 157,
            "abs_call": 281354.5817775623,
            "abs_put": 909888.6305166435,
            "net": 1191243.2122942056
        },
        {
            "expiry": "2026-11-20",
            "days_to_exp": 182,
            "abs_call": 7362195.011722118,
            "abs_put": 6805077.948936241,
            "net": 14167272.960658358
        },
        {
            "expiry": "2026-12-18",
            "days_to_exp": 202,
            "abs_call": 110883320.51113199,
            "abs_put": 32363793.191118,
            "net": 143247113.70224997
        },
        {
            "expiry": "2026-12-31",
            "days_to_exp": 211,
            "abs_call": 94096.38889574131,
            "abs_put": 16836.781965708306,
            "net": 110933.17086144965
        },
        {
            "expiry": "2027-01-15",
            "days_to_exp": 222,
            "abs_call": 23245111.454193745,
            "abs_put": 30373718.346851014,
            "net": 53618829.801044755
        },
        {
            "expiry": "2027-07-16",
            "days_to_exp": 352,
            "abs_call": 620293.0061130009,
            "abs_put": 1244970.0628642207,
            "net": 1865263.0689772218
        },
        {
            "expiry": "2027-12-17",
            "days_to_exp": 462,
            "abs_call": 85853.71840948505,
            "abs_put": 4158875.2273712065,
            "net": 4244728.945780691
        },
        {
            "expiry": "2028-01-21",
            "days_to_exp": 487,
            "abs_call": 1867503.1042538264,
            "abs_put": 1218373.3128678415,
            "net": 3085876.417121668
        }
    ],
    "volume_data": {
        "strikes": [
            69070.48574445618,
            74004.09186906018,
            78937.6979936642,
            83871.30411826822,
            88804.91024287223,
            93738.51636747624,
            98672.12249208025,
            103605.72861668427,
            108539.33474128827,
            113472.94086589229,
            118406.54699049631,
            123340.15311510031,
            128273.75923970433,
            133207.36536430835,
            138140.97148891236,
            143074.57761351636,
            148008.18373812037,
            152941.7898627244,
            157875.3959873284,
            160342.1990496304,
            162809.0021119324,
            165275.8051742344,
            167742.60823653644,
            170209.41129883844,
            172676.21436114045,
            175143.01742344245,
            177609.82048574445,
            180076.62354804645,
            182543.42661034846,
            185010.2296726505,
            187477.0327349525,
            189943.8357972545,
            192410.6388595565
        ],
        "call_volume": [
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
            4.0,
            4.0,
            3.0,
            0.0,
            5.0
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
            3.0,
            0.0,
            0.0,
            0.0,
            11.0,
            0.0,
            4.0,
            0.0,
            11.0,
            0.0,
            0.0
        ],
        "total_volume": [
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
            3.0,
            0.0,
            0.0,
            0.0,
            11.0,
            0.0,
            8.0,
            4.0,
            14.0,
            0.0,
            5.0
        ]
    },
    "volatility_data": {
        "strikes": [
            69070.48574445618,
            74004.09186906018,
            78937.6979936642,
            83871.30411826822,
            88804.91024287223,
            93738.51636747624,
            98672.12249208025,
            103605.72861668427,
            108539.33474128827,
            113472.94086589229,
            118406.54699049631,
            123340.15311510031,
            128273.75923970433,
            133207.36536430835,
            138140.97148891236,
            143074.57761351636,
            148008.18373812037,
            152941.7898627244,
            157875.3959873284,
            160342.1990496304,
            162809.0021119324,
            165275.8051742344,
            167742.60823653644,
            170209.41129883844,
            172676.21436114045,
            175143.01742344245,
            177609.82048574445,
            180076.62354804645,
            182543.42661034846,
            185010.2296726505,
            187477.0327349525,
            189943.8357972545,
            192410.6388595565
        ],
        "iv_values": [
            154.7344887370716,
            154.7344887370716,
            154.7344887370716,
            154.7344887370716,
            154.7344887370716,
            154.7344887370716,
            154.7344887370716,
            154.7344887370716,
            154.7344887370716,
            154.7344887370716,
            154.7344887370716,
            154.7344887370716,
            154.7344887370716,
            154.7344887370716,
            139.69215812616494,
            125.0686518522143,
            124.19488568112153,
            123.32111951002878,
            112.7163143971607,
            102.11150928429262,
            77.18326595310307,
            69.96879911826642,
            56.478871411840984,
            91.14640682556711,
            62.51142170060102,
            53.80388661987514,
            53.976814260816774,
            54.7403719154028,
            56.718155988405485,
            50.723253190438115,
            35.65355624220907,
            35.62273676088055,
            34.36784998278179
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
            -0.07521165305453326,
            -0.14832918442428644,
            -0.07748636222521699,
            -0.008737661710927602,
            -0.057392856419804184,
            -0.17674675188113453,
            -0.35533048444057624,
            -0.3214271016602621,
            -0.20704394541262094,
            0.21177607707300705,
            0.06032550288760041,
            -0.37342520205691976,
            -0.08534607439784248,
            0.00936485295527656,
            0.027413417275887086,
            -0.040171187249646856,
            -0.2106459974619641,
            -0.15100516429557564,
            -0.012857062594272772,
            -0.025097735561975032
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
            69070.48574445618,
            74004.09186906018,
            78937.6979936642,
            83871.30411826822,
            88804.91024287223,
            93738.51636747624,
            98672.12249208025,
            103605.72861668427,
            108539.33474128827,
            113472.94086589229,
            118406.54699049631,
            123340.15311510031,
            128273.75923970433,
            133207.36536430835,
            138140.97148891236,
            143074.57761351636,
            148008.18373812037,
            152941.7898627244,
            157875.3959873284,
            160342.1990496304,
            162809.0021119324,
            165275.8051742344,
            167742.60823653644,
            170209.41129883844,
            172676.21436114045,
            175143.01742344245,
            177609.82048574445,
            180076.62354804645,
            182543.42661034846,
            185010.2296726505,
            187477.0327349525,
            189943.8357972545,
            192410.6388595565
        ],
        "charm": [
            -3.533626176499212,
            -314.2803513413653,
            -575.2567322089967,
            -89.39933249952433,
            -1062.1134369746362,
            -433.6015358329153,
            -2133.9860669396185,
            -3990.0831750702077,
            -9459.908790393796,
            -758.97887819575,
            -2094.706947744563,
            -21969.943739945647,
            -20089.315003313113,
            -14948.276473086758,
            -8755.365006702508,
            -23772.517795141925,
            -22012.83559507905,
            -33844.22242914449,
            -143490.9259536601,
            -210.52366092285587,
            -135657.52855468064,
            -4016.4754212386592,
            -432558.9936801972,
            -3808.558864975742,
            -563860.0780780545,
            -21252.78639316056,
            -406067.7080339216,
            -17519.27911820581,
            -226712.85486420838,
            -7080.510515160504,
            149921.22983062928,
            18243.866850270242,
            237861.7174974233
        ],
        "vanna": [
            -14.354121477714699,
            -1151.3550343814197,
            -633.2636031547414,
            -160.80129855908154,
            -3613.5679597718236,
            -1635.9082704139832,
            -3725.5213184907284,
            -7938.042378902749,
            -13484.34764930578,
            -3467.6272210206225,
            -5422.29372060526,
            -30118.74821744134,
            -23898.438875354732,
            -26917.175858386094,
            -7966.918062489639,
            -22290.995757435674,
            -35180.13923161203,
            -12474.111526095334,
            -31133.918624255857,
            -17.907618618274967,
            -41955.27490816532,
            -408.39918926956193,
            -61954.51269123844,
            -386.26006505629874,
            -73977.62426353293,
            -1381.4293968081827,
            -51086.07538023798,
            -1024.5031456364509,
            -20751.416875605762,
            -544.0924754696014,
            24786.802201698807,
            481.5347593432323,
            25360.41726606048
        ],
        "vex": [
            749.3953400388048,
            53188.765993501576,
            135215.12905062214,
            12532.3481880414,
            123584.22722722602,
            52881.1058029788,
            144742.62441633112,
            260781.00767003573,
            405524.328281888,
            118299.74170686745,
            164411.07158456647,
            753998.526398038,
            463444.15572686214,
            736558.3527398977,
            241436.03075224743,
            444477.06170470355,
            1404352.6424917656,
            343842.32122448104,
            659018.9254599848,
            158.5838163499923,
            1790806.5942060817,
            1585.2280698485433,
            1153842.4026902472,
            1867.3815062964284,
            1839913.7026384487,
            5642.104452803996,
            752399.4980073448,
            7820.612259275193,
            1454048.233761108,
            19100.153195088576,
            2190294.0356040346,
            2971.9198148100627,
            544085.5362302988
        ],
        "theta": [
            -2.366066255013663,
            -175.9733774286236,
            -1429.7180705990954,
            -108.14783236587519,
            -433.55024356030816,
            -173.57600415632706,
            -1186.748463069968,
            -2084.8318396154873,
            -3552.8289555656934,
            -542.8466429097374,
            -1860.4113384090158,
            -8681.81717558798,
            -4558.415368086891,
            -6331.427557585249,
            -1783.968513796541,
            -4402.028613151836,
            -6095.23531046969,
            -4622.575960777313,
            -11563.538071203631,
            -18.38995809447735,
            -8784.9144134783,
            -78.23659988563048,
            -9283.49077888113,
            -123.13385787872569,
            -17204.4208886075,
            -255.7062304993583,
            -13720.778373178766,
            -343.9730203926967,
            -17759.03634604865,
            -756.634039698783,
            -15335.920703300171,
            -206.44950102901058,
            -5214.965745080391
        ],
        "charm_cum": [
            -3.533626176499212,
            -317.81397751786454,
            -893.0707097268612,
            -982.4700422263855,
            -2044.5834792010219,
            -2478.1850150339374,
            -4612.171081973556,
            -8602.254257043764,
            -18062.16304743756,
            -18821.14192563331,
            -20915.848873377872,
            -42885.792613323516,
            -62975.107616636626,
            -77923.38408972339,
            -86678.74909642589,
            -110451.26689156782,
            -132464.10248664688,
            -166308.32491579137,
            -309799.25086945144,
            -310009.77453037427,
            -445667.3030850549,
            -449683.77850629354,
            -882242.7721864907,
            -886051.3310514664,
            -1449911.4091295209,
            -1471164.1955226813,
            -1877231.903556603,
            -1894751.182674809,
            -2121464.0375390174,
            -2128544.548054178,
            -1978623.3182235486,
            -1960379.4513732784,
            -1722517.733875855
        ],
        "vanna_cum": [
            -14.354121477714699,
            -1165.7091558591344,
            -1798.972759013876,
            -1959.7740575729574,
            -5573.342017344781,
            -7209.250287758765,
            -10934.771606249493,
            -18872.813985152243,
            -32357.161634458025,
            -35824.78885547865,
            -41247.08257608391,
            -71365.83079352525,
            -95264.26966887998,
            -122181.44552726607,
            -130148.36358975571,
            -152439.35934719138,
            -187619.4985788034,
            -200093.61010489875,
            -231227.5287291546,
            -231245.4363477729,
            -273200.7112559382,
            -273609.1104452078,
            -335563.62313644623,
            -335949.88320150255,
            -409927.5074650355,
            -411308.9368618437,
            -462395.0122420817,
            -463419.51538771816,
            -484170.9322633239,
            -484715.0247387935,
            -459928.22253709467,
            -459446.6877777514,
            -434086.27051169093
        ],
        "theta_cum": [
            -2.366066255013663,
            -178.33944368363726,
            -1608.0575142827327,
            -1716.205346648608,
            -2149.755590208916,
            -2323.3315943652433,
            -3510.0800574352115,
            -5594.911897050699,
            -9147.740852616393,
            -9690.58749552613,
            -11550.998833935146,
            -20232.816009523125,
            -24791.231377610016,
            -31122.658935195264,
            -32906.62744899181,
            -37308.656062143644,
            -43403.89137261333,
            -48026.46733339065,
            -59590.00540459428,
            -59608.39536268876,
            -68393.30977616707,
            -68471.54637605269,
            -77755.03715493382,
            -77878.17101281254,
            -95082.59190142003,
            -95338.2981319194,
            -109059.07650509816,
            -109403.04952549086,
            -127162.08587153952,
            -127918.7199112383,
            -143254.64061453845,
            -143461.09011556747,
            -148676.05586064784
        ],
        "r_gamma": [
            21244616.574339703,
            1810338137.9841058,
            1004302134.0307099,
            285911708.35274875,
            7173032975.352104,
            3576291427.8957977,
            8502572857.03415,
            19899362617.59469,
            35956533524.25614,
            11504847591.599224,
            18472540303.661034,
            107967589947.17632,
            91340700070.0209,
            125083794228.34111,
            42548421474.2578,
            124257821338.18182,
            266973333483.8802,
            99288470660.3683,
            281893247686.7054,
            158879565.3453998,
            546170703865.4944,
            4505447583.752315,
            880260777966.7399,
            5634737323.191607,
            1500888437881.3657,
            29201975095.795456,
            1498337076080.6052,
            38973224170.58159,
            1876342806331.2393,
            93152221042.7822,
            -2533116599706.406,
            -37088349954.14743,
            -936134279196.9005
        ],
        "r_gamma_cum": [
            21244616.574339703,
            1831582754.5584455,
            2835884888.589155,
            3121796596.941904,
            10294829572.294008,
            13871121000.189806,
            22373693857.223957,
            42273056474.81865,
            78229589999.0748,
            89734437590.67403,
            108206977894.33505,
            216174567841.51135,
            307515267911.5322,
            432599062139.87335,
            475147483614.13116,
            599405304952.313,
            866378638436.1931,
            965667109096.5614,
            1247560356783.2668,
            1247719236348.6123,
            1793889940214.1067,
            1798395387797.859,
            2678656165764.5986,
            2684290903087.79,
            4185179340969.156,
            4214381316064.951,
            5712718392145.557,
            5751691616316.139,
            7628034422647.378,
            7721186643690.16,
            5188070043983.754,
            5150981694029.606,
            4214847414832.706
        ]
    },
    "ewz_meta": {
        "expiration": "2026-03-13 (3 DTE)",
        "atm_iv_pct": 53.72,
        "hv_pct": 29.98,
        "iv_rank_pct": 39.93
    },
    "scale_diagnostics": {
        "ewz_spot": 37.88,
        "index_spot": 186885.0,
        "scaling_ewz_ref_close": 37.88,
        "scaling_index_ref_close": 186885.0,
        "display_scale_factor": 4933.606124604013,
        "ref_close_diff_pct": 0.0,
        "spot_ratio_to_index_ref": 1.0,
        "exposure_index_scale_enabled": true
    },
    "detailed_data": [
        {
            "strike": 69070.48574445618,
            "delta": 39.14237110008459,
            "gamma": 21244616.574339706,
            "volume": 0,
            "oi": 162,
            "iv": 154.7344887370716
        },
        {
            "strike": 74004.09186906018,
            "delta": 1662.6289073549556,
            "gamma": 1810338137.984106,
            "volume": 0,
            "oi": 9937,
            "iv": 154.7344887370716
        },
        {
            "strike": 78937.6979936642,
            "delta": -34.224414202118744,
            "gamma": 1004302134.0307099,
            "volume": 0,
            "oi": 50094,
            "iv": 154.7344887370716
        },
        {
            "strike": 83871.30411826822,
            "delta": -18.17472635588838,
            "gamma": 285911708.35274875,
            "volume": 0,
            "oi": 3629,
            "iv": 154.7344887370716
        },
        {
            "strike": 88804.91024287223,
            "delta": -622.0865563301513,
            "gamma": 7173032975.352104,
            "volume": 0,
            "oi": 20151,
            "iv": 154.7344887370716
        },
        {
            "strike": 93738.51636747624,
            "delta": -341.02359887238777,
            "gamma": 3576291427.8957977,
            "volume": 0,
            "oi": 8123,
            "iv": 154.7344887370716
        },
        {
            "strike": 98672.12249208025,
            "delta": 313.576263496927,
            "gamma": 8502572857.03415,
            "volume": 0,
            "oi": 41954,
            "iv": 154.7344887370716
        },
        {
            "strike": 103605.72861668427,
            "delta": -1618.3991669246102,
            "gamma": 19899362617.59469,
            "volume": 0,
            "oi": 77308,
            "iv": 154.7344887370716
        },
        {
            "strike": 108539.33474128827,
            "delta": -1969.752658283439,
            "gamma": 35956533524.25614,
            "volume": 0,
            "oi": 90213,
            "iv": 154.7344887370716
        },
        {
            "strike": 113472.94086589229,
            "delta": -1413.1491456140318,
            "gamma": 11504847591.599224,
            "volume": 0,
            "oi": 21638,
            "iv": 154.7344887370716
        },
        {
            "strike": 118406.54699049631,
            "delta": -1554.0967579270675,
            "gamma": 18472540303.661034,
            "volume": 0,
            "oi": 47223,
            "iv": 154.7344887370716
        },
        {
            "strike": 123340.15311510031,
            "delta": -7425.267427675066,
            "gamma": 107967589947.17632,
            "volume": 0,
            "oi": 170807,
            "iv": 154.7344887370716
        },
        {
            "strike": 128273.75923970433,
            "delta": -4764.167811295955,
            "gamma": 91340700070.0209,
            "volume": 0,
            "oi": 82974,
            "iv": 154.7344887370716
        },
        {
            "strike": 133207.36536430835,
            "delta": 14678.688768801798,
            "gamma": 125083794228.34111,
            "volume": 0,
            "oi": 120233,
            "iv": 154.7344887370716
        },
        {
            "strike": 138140.97148891236,
            "delta": 469.13543008278907,
            "gamma": 42548421474.2578,
            "volume": 0,
            "oi": 35580,
            "iv": 139.69215812616494
        },
        {
            "strike": 143074.57761351636,
            "delta": 19133.398255893062,
            "gamma": 124257821338.18182,
            "volume": 0,
            "oi": 78468,
            "iv": 125.0686518522143
        },
        {
            "strike": 148008.18373812037,
            "delta": 17516.55160589113,
            "gamma": 266973333483.8802,
            "volume": 0,
            "oi": 163184,
            "iv": 124.19488568112153
        },
        {
            "strike": 152941.7898627244,
            "delta": 19035.256511362622,
            "gamma": 99288470660.36832,
            "volume": 0,
            "oi": 61856,
            "iv": 123.32111951002878
        },
        {
            "strike": 157875.3959873284,
            "delta": 39426.67210049539,
            "gamma": 281893247686.7054,
            "volume": 0,
            "oi": 137779,
            "iv": 112.7163143971607
        },
        {
            "strike": 160342.1990496304,
            "delta": -1.3297269034382917,
            "gamma": 158879565.3453998,
            "volume": 0,
            "oi": 219,
            "iv": 102.11150928429262
        },
        {
            "strike": 162809.0021119324,
            "delta": 100372.582520186,
            "gamma": 546170703865.4944,
            "volume": 0,
            "oi": 227894,
            "iv": 77.18326595310307
        },
        {
            "strike": 165275.8051742344,
            "delta": -83.01570684649954,
            "gamma": 4505447583.752315,
            "volume": 0,
            "oi": 1290,
            "iv": 69.96879911826642
        },
        {
            "strike": 167742.60823653644,
            "delta": 131887.03283520672,
            "gamma": 880260777966.7399,
            "volume": 3,
            "oi": 231407,
            "iv": 56.478871411840984
        },
        {
            "strike": 170209.41129883844,
            "delta": -102.53655555393628,
            "gamma": 5634737323.191608,
            "volume": 0,
            "oi": 969,
            "iv": 91.14640682556711
        },
        {
            "strike": 172676.21436114045,
            "delta": 130782.42522661095,
            "gamma": 1500888437881.3657,
            "volume": 0,
            "oi": 320408,
            "iv": 62.51142170060102
        },
        {
            "strike": 175143.01742344245,
            "delta": -172.67897047856707,
            "gamma": 29201975095.79546,
            "volume": 0,
            "oi": 3663,
            "iv": 53.80388661987514
        },
        {
            "strike": 177609.82048574445,
            "delta": 76586.77954384571,
            "gamma": 1498337076080.605,
            "volume": 11,
            "oi": 209111,
            "iv": 53.976814260816774
        },
        {
            "strike": 180076.62354804645,
            "delta": -864.9022635713063,
            "gamma": 38973224170.58158,
            "volume": 0,
            "oi": 3686,
            "iv": 54.7403719154028
        },
        {
            "strike": 182543.42661034846,
            "delta": 62625.16401242783,
            "gamma": 1876342806331.2393,
            "volume": 8,
            "oi": 267475,
            "iv": 56.718155988405485
        },
        {
            "strike": 185010.2296726505,
            "delta": -1882.3046233803689,
            "gamma": 93152221042.7822,
            "volume": 4,
            "oi": 7976,
            "iv": 50.723253190438115
        },
        {
            "strike": 187477.0327349525,
            "delta": 96277.93611405745,
            "gamma": 2533116599706.406,
            "volume": 14,
            "oi": 354651,
            "iv": 35.65355624220907
        },
        {
            "strike": 189943.8357972545,
            "delta": 630.8627550121895,
            "gamma": 37088349954.14743,
            "volume": 0,
            "oi": 2055,
            "iv": 35.62273676088055
        },
        {
            "strike": 192410.6388595565,
            "delta": 47908.313787011684,
            "gamma": 936134279196.9005,
            "volume": 5,
            "oi": 116766,
            "iv": 34.36784998278179
        }
    ]
};