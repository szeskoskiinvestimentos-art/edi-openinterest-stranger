window.marketData = {
    "last_updated": "2026-01-16 06:20:07",
    "spot_price": 5388.0,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ModeloFlip(1);\n  spot(0);\n  // 1 = Classic (5650.00)\n  // 2 = Spline (5650.00)\n  // 3 = HVL (5650.00)\n  // 4 = HVL Log (5650.00)\n  // 5 = Sigma Kernel (5425.00)\n  // 6 = PVOP (5650.00)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5650.00;\n\n  if (ModeloFlip = 1) then GammaVal := 5650.00;\n  if (ModeloFlip = 2) then GammaVal := 5650.00;\n  if (ModeloFlip = 3) then GammaVal := 5650.00;\n  if (ModeloFlip = 4) then GammaVal := 5650.00;\n  if (ModeloFlip = 5) then GammaVal := 5425.00;\n  if (ModeloFlip = 6) then GammaVal := 5650.00;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(5350.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5350.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5358.13, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5375.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5400.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5417.87, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5425.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5425.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5650.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5650.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5724.94 > 0) then\n      HorizontalLineCustom(5724.94, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(5362.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5387.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5412.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5537.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(5359.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5365.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5384.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5390.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5409.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5415.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5510.95, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5564.05, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(5355.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5394.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5405.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5419.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5478.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5596.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if LastBarOnChart then\n  begin\n    HorizontalLineCustom(5396.08, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5379.92, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5404.16, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5371.84, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5419.17, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5356.83, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5427.26, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5348.74, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 9115,
        "total_volume": 9115,
        "gamma_exposure": 79506538.63223892,
        "delta_position": -3211.324782393299,
        "last_update": "2026-01-16T06:20:07.539435",
        "spot_price": 5388.0,
        "dealer_pressure": -0.0796001735167386,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 5350.0,
        "gamma_flip_hvl": 5350.0,
        "call_wall": 5650.0,
        "put_wall": 5350.0,
        "max_pain": 5425.0,
        "zero_gamma": 5350.0,
        "range_low": 5358.131735484919,
        "range_high": 5417.868264515081,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5417.868264515081,
                "sigma_1_down": 5358.131735484919,
                "sigma_2_up": 5447.736529030162,
                "sigma_2_down": 5328.263470969838
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5454.787469825666,
                "sigma_1_down": 5321.212530174334,
                "sigma_2_up": 5521.574939651333,
                "sigma_2_down": 5254.425060348667
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 10.0,
                "sigma_1_up": 5482.451745624041,
                "sigma_1_down": 5293.548254375959,
                "sigma_2_up": 5576.903491248082,
                "sigma_2_down": 5199.096508751918
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
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0,
                5350.0
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4579.8,
                4612.787755102041,
                4645.775510204082,
                4678.763265306123,
                4711.751020408164,
                4744.7387755102045,
                4777.726530612245,
                4810.714285714286,
                4843.702040816326,
                4876.689795918367,
                4909.677551020408,
                4942.665306122449,
                4975.65306122449,
                5008.6408163265305,
                5041.628571428571,
                5074.616326530612,
                5107.604081632653,
                5140.591836734694,
                5173.579591836735,
                5206.567346938776,
                5239.555102040817,
                5272.542857142857,
                5305.530612244898,
                5338.518367346938,
                5371.50612244898,
                5404.49387755102,
                5437.481632653061,
                5470.469387755102,
                5503.457142857143,
                5536.444897959183,
                5569.432653061224,
                5602.420408163265,
                5635.408163265306,
                5668.395918367347,
                5701.383673469388,
                5734.371428571429,
                5767.3591836734695,
                5800.34693877551,
                5833.33469387755,
                5866.322448979592,
                5899.310204081632,
                5932.297959183674,
                5965.285714285714,
                5998.273469387755,
                6031.2612244897955,
                6064.248979591836,
                6097.236734693877,
                6130.224489795918,
                6163.212244897959,
                6196.2
            ],
            "deltas": [
                -9074.998576839931,
                -9074.995370724868,
                -9074.985841062644,
                -9074.959222063608,
                -9074.889259215775,
                -9074.71602358556,
                -9074.311428397128,
                -9073.419096662217,
                -9071.558488534072,
                -9067.886408395187,
                -9061.018157801242,
                -9048.824147868389,
                -9028.224023373052,
                -8994.968669334059,
                -8943.285041149516,
                -8865.05286812241,
                -8748.051528335778,
                -8573.199647321557,
                -8312.055989516615,
                -7927.765505164014,
                -7383.199011838945,
                -6656.895517821889,
                -5760.900178021344,
                -4749.541832661596,
                -3710.5753168195524,
                -2740.2844828881944,
                -1914.693855672934,
                -1271.2674131741783,
                -807.9267490058598,
                -495.65792883212407,
                -295.2686364560322,
                -170.25802720735663,
                -92.8518416233533,
                -44.54068472659427,
                -13.967690511413572,
                5.595542934765793,
                18.16756182119376,
                26.231257861730747,
                31.3749262825603,
                34.63426064219752,
                36.68628878530317,
                37.970386107801644,
                38.76891429124195,
                39.2618689759148,
                39.56341622812675,
                39.74577351324854,
                39.85452156862106,
                39.91831941799754,
                39.95506080761849,
                39.97579609435473
            ],
            "flip_value": 5724.936158042003
        },
        "flow_sentiment": {
            "bull": [
                1400.0,
                0.0,
                200.0,
                0.0,
                0.0
            ],
            "bear": [
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4579.8,
                4612.787755102041,
                4645.775510204082,
                4678.763265306123,
                4711.751020408164,
                4744.7387755102045,
                4777.726530612245,
                4810.714285714286,
                4843.702040816326,
                4876.689795918367,
                4909.677551020408,
                4942.665306122449,
                4975.65306122449,
                5008.6408163265305,
                5041.628571428571,
                5074.616326530612,
                5107.604081632653,
                5140.591836734694,
                5173.579591836735,
                5206.567346938776,
                5239.555102040817,
                5272.542857142857,
                5305.530612244898,
                5338.518367346938,
                5371.50612244898,
                5404.49387755102,
                5437.481632653061,
                5470.469387755102,
                5503.457142857143,
                5536.444897959183,
                5569.432653061224,
                5602.420408163265,
                5635.408163265306,
                5668.395918367347,
                5701.383673469388,
                5734.371428571429,
                5767.3591836734695,
                5800.34693877551,
                5833.33469387755,
                5866.322448979592,
                5899.310204081632,
                5932.297959183674,
                5965.285714285714,
                5998.273469387755,
                6031.2612244897955,
                6064.248979591836,
                6097.236734693877,
                6130.224489795918,
                6163.212244897959,
                6196.2
            ],
            "pnl": [
                -9335986.561522767,
                -8932768.361532448,
                -8529550.161542127,
                -8126331.961551805,
                -7723113.761561531,
                -7319895.56157188,
                -6916677.36159159,
                -6513459.161726199,
                -6110240.963056918,
                -5707022.774958202,
                -5303804.666437439,
                -4900587.069886279,
                -4497372.297060009,
                -4094170.9170487323,
                -3691024.3287506728,
                -3288071.67451468,
                -2885714.648737569,
                -2484949.6516408827,
                -2087898.6480310485,
                -1698431.6401177396,
                -1322559.2442190426,
                -968139.8030220309,
                -643608.1664928291,
                -355941.8208367148,
                -108647.70768299772,
                99281.47974888934,
                272940.155241772,
                419882.9548684151,
                548118.0203586734,
                664539.7366661533,
                774194.3102572717,
                880293.6690557598,
                984642.0557098502,
                1088147.7434924531,
                1191232.0197541893,
                1294086.0241310853,
                1396803.4977980466,
                1499437.9753670404,
                1602023.6174043573,
                1704582.4068663134,
                1807127.6267648914,
                1909666.5864539526,
                2012202.9147667217,
                2114738.235332872,
                2217273.2039607614,
                2319808.060373304,
                2422342.8840750507,
                2524877.6990473922,
                2627412.511884058,
                2729947.324241058
            ]
        },
        "max_pain_profile": {
            "strikes": [
                5350.0,
                5375.0,
                5400.0,
                5425.0,
                5650.0
            ],
            "loss": [
                106250.0,
                53125.0,
                4500.0,
                0.0,
                0.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5650.0,
                "options": [
                    {
                        "Strike": 5350.0,
                        "Call_Now": 66.71550845526872,
                        "Call_Sim": 310.6207766305697,
                        "Call_Chg": 365.59006117570715,
                        "Put_Now": 18.110952961509156,
                        "Put_Sim": 0.016221136810914416,
                        "Put_Chg": -99.91043465882007
                    },
                    {
                        "Strike": 5388.0,
                        "Call_Now": 43.22376064408991,
                        "Call_Sim": 272.7482217075458,
                        "Call_Chg": 531.0145569086186,
                        "Put_Now": 32.54388307392628,
                        "Put_Sim": 0.06834413738238787,
                        "Put_Chg": -99.78999390691288
                    },
                    {
                        "Strike": 5650.0,
                        "Call_Now": 0.1435351523505375,
                        "Call_Sim": 45.325584194340536,
                        "Call_Chg": 31478.0374717182,
                        "Put_Now": 250.94433168697924,
                        "Put_Sim": 34.1263807289688,
                        "Put_Chg": -86.40081626886992
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5350.0,
                "options": [
                    {
                        "Strike": 5350.0,
                        "Call_Now": 66.71550845526872,
                        "Call_Sim": 42.91891600703002,
                        "Call_Chg": -35.668756784179784,
                        "Put_Now": 18.110952961509156,
                        "Put_Sim": 32.31436051327182,
                        "Put_Chg": 78.42440749500528
                    },
                    {
                        "Strike": 5388.0,
                        "Call_Now": 43.22376064408991,
                        "Call_Sim": 25.422368208274747,
                        "Call_Chg": -41.18427496948762,
                        "Put_Now": 32.54388307392628,
                        "Put_Sim": 52.74249063811067,
                        "Put_Chg": 62.065757544363954
                    },
                    {
                        "Strike": 5650.0,
                        "Call_Now": 0.1435351523505375,
                        "Call_Sim": 0.03690686543711852,
                        "Call_Chg": -74.28722871524488,
                        "Put_Now": 250.94433168697924,
                        "Put_Sim": 288.83770340006504,
                        "Put_Chg": 15.100309880819665
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5350.0,
                "options": [
                    {
                        "Strike": 5350.0,
                        "Call_Now": 66.71550845526872,
                        "Call_Sim": 42.91891600703002,
                        "Call_Chg": -35.668756784179784,
                        "Put_Now": 18.110952961509156,
                        "Put_Sim": 32.31436051327182,
                        "Put_Chg": 78.42440749500528
                    },
                    {
                        "Strike": 5388.0,
                        "Call_Now": 43.22376064408991,
                        "Call_Sim": 25.422368208274747,
                        "Call_Chg": -41.18427496948762,
                        "Put_Now": 32.54388307392628,
                        "Put_Sim": 52.74249063811067,
                        "Put_Chg": 62.065757544363954
                    },
                    {
                        "Strike": 5650.0,
                        "Call_Now": 0.1435351523505375,
                        "Call_Sim": 0.03690686543711852,
                        "Call_Chg": -74.28722871524488,
                        "Put_Now": 250.94433168697924,
                        "Put_Sim": 288.83770340006504,
                        "Put_Chg": 15.100309880819665
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5441.88,
                "options": [
                    {
                        "Strike": 5350.0,
                        "Call_Now": 66.71550845526872,
                        "Call_Sim": 109.16905452565697,
                        "Call_Chg": 63.63369935020794,
                        "Put_Now": 18.110952961509156,
                        "Put_Sim": 6.684499031897758,
                        "Put_Chg": -63.09140084398547
                    },
                    {
                        "Strike": 5388.0,
                        "Call_Now": 43.22376064408991,
                        "Call_Sim": 78.55464359121606,
                        "Call_Chg": 81.73949332647213,
                        "Put_Now": 32.54388307392628,
                        "Put_Sim": 13.9947660210521,
                        "Put_Chg": -56.99724587486452
                    },
                    {
                        "Strike": 5650.0,
                        "Call_Now": 0.1435351523505375,
                        "Call_Sim": 0.7651203730634109,
                        "Call_Chg": 433.05434977687935,
                        "Put_Now": 250.94433168697924,
                        "Put_Sim": 197.68591690769154,
                        "Put_Chg": -21.223198954627403
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5334.12,
                "options": [
                    {
                        "Strike": 5350.0,
                        "Call_Now": 66.71550845526872,
                        "Call_Sim": 34.74355427071123,
                        "Call_Chg": -47.92282173191257,
                        "Put_Now": 18.110952961509156,
                        "Put_Sim": 40.018998776952685,
                        "Put_Chg": 120.96572644191754
                    },
                    {
                        "Strike": 5388.0,
                        "Call_Now": 43.22376064408991,
                        "Call_Sim": 19.750926305860048,
                        "Call_Chg": -54.30539589442076,
                        "Put_Now": 32.54388307392628,
                        "Put_Sim": 62.95104873569653,
                        "Put_Chg": 93.4343501440738
                    },
                    {
                        "Strike": 5650.0,
                        "Call_Now": 0.1435351523505375,
                        "Call_Sim": 0.019992415282063192,
                        "Call_Chg": -86.07141529119063,
                        "Put_Now": 250.94433168697924,
                        "Put_Sim": 304.70078894991,
                        "Put_Chg": 21.421666272177468
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.5,
            -0.005052386602591608,
            0.09995094427970992,
            0.0019606629448182438,
            0.005139911794370528
        ]
    },
    "delta_data": {
        "strikes": [
            5350.0,
            5375.0,
            5400.0,
            5425.0,
            5650.0
        ],
        "delta_values": [
            -2168.4302205248505,
            -69.40953960153219,
            -885.9912145842859,
            -91.01766295386803,
            3.5238552712379057
        ],
        "delta_cumulative": [
            -2168.4302205248505,
            -2237.8397601263828,
            -3123.8309747106687,
            -3214.848637664537,
            -3211.324782393299
        ]
    },
    "gamma_data": {
        "strikes": [
            5350.0,
            5375.0,
            5400.0,
            5425.0,
            5650.0
        ],
        "gamma_values": [
            57001894.84053506,
            1133570.8903841414,
            20083390.828684215,
            1182404.1139950382,
            105277.95864046531
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            105277.95864046531
        ],
        "gamma_put": [
            57001894.84053506,
            1133570.8903841414,
            20083390.828684215,
            1182404.1139950382,
            0.0
        ],
        "gamma_exposure": [
            57001894.84053506,
            58135465.7309192,
            78218856.55960341,
            79401260.67359845,
            79506538.63223892
        ]
    },
    "volume_data": {
        "strikes": [
            5350.0,
            5375.0,
            5400.0,
            5425.0,
            5650.0
        ],
        "call_volume": [
            0.0,
            0.0,
            0.0,
            0.0,
            40.0
        ],
        "put_volume": [
            6950.0,
            180.0,
            1765.0,
            180.0,
            0.0
        ],
        "total_volume": [
            6950.0,
            180.0,
            1765.0,
            180.0,
            40.0
        ]
    },
    "volatility_data": {
        "strikes": [
            5350.0,
            5375.0,
            5400.0,
            5425.0,
            5650.0
        ],
        "iv_values": [
            8.799999999999999,
            8.799999999999999,
            8.799999999999999,
            8.799999999999999,
            8.799999999999999
        ],
        "skew": [
            0.0,
            0.0,
            0.0,
            2.507217523872729e-19,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            5350.0,
            5375.0,
            5400.0,
            5425.0,
            5650.0
        ],
        "charm": [
            -5011.015042306705,
            38.058021510153985,
            2216.2400564428312,
            131.72554822908708,
            47.652698739024906
        ],
        "vanna": [
            -13154.384683361657,
            -206.2850650038688,
            181.3736414881004,
            36.65072405976044,
            99.68477936020594
        ],
        "vex": [
            3488879.213125781,
            127970.43720245197,
            755747.5604028291,
            133483.28957763413,
            11884.9791480059
        ],
        "theta": [
            -7084.351641944025,
            -111.88095620835217,
            -2364.69706422041,
            -96.05463661098804,
            -21.14631120531542
        ],
        "charm_cum": [
            -5011.015042306705,
            -4972.957020796552,
            -2756.7169643537204,
            -2624.9914161246334,
            -2577.3387173856086
        ],
        "vanna_cum": [
            -13154.384683361657,
            -13360.669748365526,
            -13179.296106877426,
            -13142.645382817665,
            -13042.960603457459
        ],
        "theta_cum": [
            -7084.351641944025,
            -7196.232598152377,
            -9560.929662372788,
            -9656.984298983776,
            -9678.130610189091
        ],
        "r_gamma": [
            57001894.84053506,
            1133570.8903841414,
            -20083390.828684215,
            -1182404.1139950382,
            -105277.95864046531
        ],
        "r_gamma_cum": [
            57001894.84053506,
            58135465.7309192,
            38052074.90223499,
            36869670.78823995,
            36764392.829599485
        ]
    },
    "detailed_data": [
        {
            "strike": 5350.0,
            "delta": -2168.4302205248505,
            "gamma": 57001894.84053506,
            "volume": 0,
            "oi": 6950,
            "iv": 8.799999999999999
        },
        {
            "strike": 5375.0,
            "delta": -69.40953960153219,
            "gamma": 1133570.8903841414,
            "volume": 0,
            "oi": 180,
            "iv": 8.799999999999999
        },
        {
            "strike": 5400.0,
            "delta": -885.9912145842859,
            "gamma": 20083390.828684215,
            "volume": 0,
            "oi": 1765,
            "iv": 8.799999999999999
        },
        {
            "strike": 5425.0,
            "delta": -91.01766295386803,
            "gamma": 1182404.1139950382,
            "volume": 0,
            "oi": 180,
            "iv": 8.799999999999999
        },
        {
            "strike": 5650.0,
            "delta": 3.5238552712379057,
            "gamma": 105277.95864046531,
            "volume": 0,
            "oi": 40,
            "iv": 8.799999999999999
        }
    ]
};