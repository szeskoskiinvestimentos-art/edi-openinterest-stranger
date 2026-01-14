window.marketData = {
    "last_updated": "2026-01-14 15:28:42",
    "spot_price": 5396.0,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);      // Edi_Wall (Midpoints)\n  MostrarPLUS(true);        // Fibo 38.2% e 61.8%\n  MostrarPLUS2(true);       // Fibo 23.6% e 76.4%\n  ModeloFlip(1); // Selecione o modelo de Gamma Flip abaixo\n  // 1 = Classic\n  // 2 = Spline\n  // 1 = Classic (5300.00)\n  // 2 = Spline (5300.00)\n  // 3 = HVL (5300.00)\n  // 4 = HVL Log (5300.00)\n  // 5 = Sigma Kernel (5300.00)\n  // 6 = PVOP (5300.00)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5300.00;\n\n  if (ModeloFlip = 1) then GammaVal := 5300.00;\n  if (ModeloFlip = 2) then GammaVal := 5300.00;\n  if (ModeloFlip = 3) then GammaVal := 5300.00;\n  if (ModeloFlip = 4) then GammaVal := 5300.00;\n  if (ModeloFlip = 5) then GammaVal := 5300.00;\n  if (ModeloFlip = 6) then GammaVal := 5300.00;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(5300.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5300.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5350.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5350.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5359.59, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5400.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5400.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5432.41, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (6205.40 > 0) then\n      HorizontalLineCustom(6205.40, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  // Fibonacci 38.2% e 61.8% - Grid Completo\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  // Fibonacci 23.6% e 76.4% - Grid Completo\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 5810,
        "total_volume": 5810,
        "gamma_exposure": 36684567.28802662,
        "delta_position": -1839.119113507802,
        "last_update": "2026-01-14T15:28:42.774951",
        "spot_price": 5396.0,
        "dealer_pressure": -0.25466894544720864,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 5300.0,
        "gamma_flip_hvl": 5300.0,
        "call_wall": 5300.0,
        "put_wall": 5350.0,
        "max_pain": 5400.0,
        "zero_gamma": 5300.0,
        "range_low": 5359.594991110013,
        "range_high": 5432.405008889987,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5432.405008889987,
                "sigma_1_down": 5359.594991110013,
                "sigma_2_up": 5468.810017779973,
                "sigma_2_down": 5323.189982220027
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5477.404074599494,
                "sigma_1_down": 5314.595925400506,
                "sigma_2_up": 5558.808149198988,
                "sigma_2_down": 5233.191850801012
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 12.0,
                "sigma_1_up": 5522.110650094906,
                "sigma_1_down": 5269.889349905094,
                "sigma_2_up": 5648.2213001898135,
                "sigma_2_down": 5143.7786998101865
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
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0,
                5300.0
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4586.599999999999,
                4619.636734693877,
                4652.673469387754,
                4685.710204081632,
                4718.74693877551,
                4751.783673469387,
                4784.820408163265,
                4817.857142857142,
                4850.89387755102,
                4883.930612244898,
                4916.967346938775,
                4950.004081632653,
                4983.04081632653,
                5016.077551020408,
                5049.114285714285,
                5082.151020408162,
                5115.187755102041,
                5148.224489795918,
                5181.2612244897955,
                5214.297959183673,
                5247.33469387755,
                5280.371428571429,
                5313.408163265306,
                5346.444897959183,
                5379.481632653061,
                5412.518367346938,
                5445.555102040816,
                5478.591836734693,
                5511.628571428571,
                5544.665306122449,
                5577.702040816326,
                5610.738775510204,
                5643.775510204081,
                5676.812244897959,
                5709.848979591836,
                5742.885714285714,
                5775.9224489795915,
                5808.959183673469,
                5841.995918367346,
                5875.032653061224,
                5908.069387755102,
                5941.1061224489795,
                5974.142857142857,
                6007.179591836734,
                6040.216326530612,
                6073.25306122449,
                6106.2897959183665,
                6139.326530612245,
                6172.363265306122,
                6205.4
            ],
            "deltas": [
                -5809.729742625648,
                -5809.448595644977,
                -5808.9164014854505,
                -5807.9469949131535,
                -5806.246349779249,
                -5803.37041348821,
                -5798.6776587939585,
                -5791.280364150696,
                -5779.998034913034,
                -5763.310877225884,
                -5739.2982476816815,
                -5705.527585242632,
                -5658.843775811595,
                -5595.020565293225,
                -5508.304582659406,
                -5391.021311380506,
                -5233.580236701724,
                -5025.30195877906,
                -4756.351958528042,
                -4420.639426251953,
                -4018.9475710957936,
                -3561.117423099068,
                -3066.151496013722,
                -2559.7553484140226,
                -2069.844437979555,
                -1621.4005403037747,
                -1232.3092534111506,
                -911.3367277252539,
                -658.4993747102362,
                -467.22495332563875,
                -327.26686326652725,
                -227.3976509120506,
                -157.29827491683528,
                -108.51130930431927,
                -74.64301498177826,
                -51.11986650326028,
                -34.774599578332754,
                -23.438544069350854,
                -15.618752852617174,
                -10.272446094716074,
                -6.660407014290886,
                -4.254077413858305,
                -2.6755340151009523,
                -1.6566813466073393,
                -1.009901029855712,
                -0.6061187329167084,
                -0.35820089735012384,
                -0.20847298515177304,
                -0.11950834292841717,
                -0.06749116028274216
            ],
            "flip_value": 6205.4
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                760.0,
                0.0
            ],
            "bear": [
                -300.0,
                -0.0,
                -150.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4586.599999999999,
                4619.636734693877,
                4652.673469387754,
                4685.710204081632,
                4718.74693877551,
                4751.783673469387,
                4784.820408163265,
                4817.857142857142,
                4850.89387755102,
                4883.930612244898,
                4916.967346938775,
                4950.004081632653,
                4983.04081632653,
                5016.077551020408,
                5049.114285714285,
                5082.151020408162,
                5115.187755102041,
                5148.224489795918,
                5181.2612244897955,
                5214.297959183673,
                5247.33469387755,
                5280.371428571429,
                5313.408163265306,
                5346.444897959183,
                5379.481632653061,
                5412.518367346938,
                5445.555102040816,
                5478.591836734693,
                5511.628571428571,
                5544.665306122449,
                5577.702040816326,
                5610.738775510204,
                5643.775510204081,
                5676.812244897959,
                5709.848979591836,
                5742.885714285714,
                5775.9224489795915,
                5808.959183673469,
                5841.995918367346,
                5875.032653061224,
                5908.069387755102,
                5941.1061224489795,
                5974.142857142857,
                6007.179591836734,
                6040.216326530612,
                6073.25306122449,
                6106.2897959183665,
                6139.326530612245,
                6172.363265306122,
                6205.4
            ],
            "pnl": [
                -5600941.294540957,
                -5350845.049613691,
                -5100748.805284003,
                -4850652.5642188,
                -4600556.339293991,
                -4350460.186752486,
                -4100364.329271122,
                -3850269.5673402185,
                -3600178.518054796,
                -3350098.9746871665,
                -3100052.1037073466,
                -2850090.4004315026,
                -2600332.8678662903,
                -2351026.259567377,
                -2102638.724045573,
                -1855982.8145976672,
                -1612347.6607463607,
                -1373599.160581382,
                -1142192.3779334435,
                -921044.6784628727,
                -713249.3551762082,
                -521662.5222559811,
                -348451.0896384931,
                -194720.14137153723,
                -60325.474167750974,
                56077.092104476,
                156767.46961181637,
                244565.4728989395,
                322412.8128093084,
                393028.0912232403,
                458688.6609051724,
                521146.18994928227,
                581647.9159236896,
                641020.5632217765,
                699776.3797508412,
                758213.0090591548,
                816493.0547339289,
                874700.214832465,
                932875.1572959054,
                991036.5648613859,
                1049192.5640324668,
                1107346.5060468887,
                1165499.7026826842,
                1223652.641856088,
                1281805.4961921528,
                1339958.3238412894,
                1398111.1434709888,
                1456263.9607970675,
                1514416.7774901697,
                1572569.5940167985
            ]
        },
        "max_pain_profile": {
            "strikes": [
                5300.0,
                5350.0,
                5400.0
            ],
            "loss": [
                253000.0,
                42500.0,
                0.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5300.0,
                "options": [
                    {
                        "Strike": 5300.0,
                        "Call_Now": 121.84605616819681,
                        "Call_Sim": 55.9138199452218,
                        "Call_Chg": -54.111095833879,
                        "Put_Now": 13.242019309221405,
                        "Put_Sim": 43.309783086245716,
                        "Put_Chg": 227.0632829849892
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 84.78329146975284,
                        "Call_Sim": 33.163095989373915,
                        "Call_Chg": -60.88486845169826,
                        "Put_Now": 26.060348602673912,
                        "Put_Sim": 70.44015312229521,
                        "Put_Chg": 170.29628112905493
                    },
                    {
                        "Strike": 5396.0,
                        "Call_Now": 56.92659857064473,
                        "Call_Sim": 18.878608186587826,
                        "Call_Chg": -66.83692920250651,
                        "Put_Now": 44.09426217610962,
                        "Put_Sim": 102.04627179205318,
                        "Put_Chg": 131.42755260193942
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5350.0,
                "options": [
                    {
                        "Strike": 5300.0,
                        "Call_Now": 121.84605616819681,
                        "Call_Sim": 87.05026545375813,
                        "Call_Chg": -28.557174363039227,
                        "Put_Now": 13.242019309221405,
                        "Put_Sim": 24.44622859478295,
                        "Put_Chg": 84.61103268260017
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 84.78329146975284,
                        "Call_Sim": 56.44130881262936,
                        "Call_Chg": -33.42873597592602,
                        "Put_Now": 26.060348602673912,
                        "Put_Sim": 43.71836594555043,
                        "Put_Chg": 67.75817780528357
                    },
                    {
                        "Strike": 5396.0,
                        "Call_Now": 56.92659857064473,
                        "Call_Sim": 35.190964633369276,
                        "Call_Chg": -38.18185959293173,
                        "Put_Now": 44.09426217610962,
                        "Put_Sim": 68.35862823883463,
                        "Put_Chg": 55.028397948501095
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5300.0,
                "options": [
                    {
                        "Strike": 5300.0,
                        "Call_Now": 121.84605616819681,
                        "Call_Sim": 55.9138199452218,
                        "Call_Chg": -54.111095833879,
                        "Put_Now": 13.242019309221405,
                        "Put_Sim": 43.309783086245716,
                        "Put_Chg": 227.0632829849892
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 84.78329146975284,
                        "Call_Sim": 33.163095989373915,
                        "Call_Chg": -60.88486845169826,
                        "Put_Now": 26.060348602673912,
                        "Put_Sim": 70.44015312229521,
                        "Put_Chg": 170.29628112905493
                    },
                    {
                        "Strike": 5396.0,
                        "Call_Now": 56.92659857064473,
                        "Call_Sim": 18.878608186587826,
                        "Call_Chg": -66.83692920250651,
                        "Put_Now": 44.09426217610962,
                        "Put_Sim": 102.04627179205318,
                        "Put_Chg": 131.42755260193942
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5449.96,
                "options": [
                    {
                        "Strike": 5300.0,
                        "Call_Now": 121.84605616819681,
                        "Call_Sim": 168.32779948284315,
                        "Call_Chg": 38.147925978402405,
                        "Put_Now": 13.242019309221405,
                        "Put_Sim": 5.7637626238663415,
                        "Put_Chg": -56.47368811905746
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 84.78329146975284,
                        "Call_Sim": 125.48250759824805,
                        "Call_Chg": 48.00381705281518,
                        "Put_Now": 26.060348602673912,
                        "Put_Sim": 12.79956473116954,
                        "Put_Chg": -50.884905930014135
                    },
                    {
                        "Strike": 5396.0,
                        "Call_Now": 56.92659857064473,
                        "Call_Sim": 90.7681496922728,
                        "Call_Chg": 59.44769575443966,
                        "Put_Now": 44.09426217610962,
                        "Put_Sim": 23.975813297737886,
                        "Put_Chg": -45.62600185488977
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5342.04,
                "options": [
                    {
                        "Strike": 5300.0,
                        "Call_Now": 121.84605616819681,
                        "Call_Sim": 81.59293796988868,
                        "Call_Chg": -33.03604520670128,
                        "Put_Now": 13.242019309221405,
                        "Put_Sim": 26.948901110912857,
                        "Put_Chg": 103.51051060729333
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 84.78329146975284,
                        "Call_Sim": 52.202149757012194,
                        "Call_Chg": -38.42872946772094,
                        "Put_Now": 26.060348602673912,
                        "Put_Sim": 47.4392068899333,
                        "Put_Chg": 82.0359643426482
                    },
                    {
                        "Strike": 5396.0,
                        "Call_Now": 56.92659857064473,
                        "Call_Sim": 32.10255912497382,
                        "Call_Chg": -43.607101195172916,
                        "Put_Now": 44.09426217610962,
                        "Put_Sim": 73.23022273043944,
                        "Put_Chg": 66.07653494226227
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.2213944755985473,
            -0.5,
            -0.04261236074307863
        ]
    },
    "delta_data": {
        "strikes": [
            5300.0,
            5350.0,
            5400.0
        ],
        "delta_values": [
            -409.5614544508534,
            -1060.600567421136,
            -368.95709163581256
        ],
        "delta_cumulative": [
            -409.5614544508534,
            -1470.1620218719895,
            -1839.119113507802
        ]
    },
    "gamma_data": {
        "strikes": [
            5300.0,
            5350.0,
            5400.0
        ],
        "gamma_values": [
            6744443.440786532,
            25558359.424711514,
            4381764.422528573
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0
        ],
        "gamma_put": [
            6744443.440786532,
            25558359.424711514,
            4381764.422528573
        ],
        "gamma_exposure": [
            6744443.440786532,
            32302802.865498047,
            36684567.28802662
        ]
    },
    "volume_data": {
        "strikes": [
            5300.0,
            5350.0,
            5400.0
        ],
        "call_volume": [
            0.0,
            0.0,
            0.0
        ],
        "put_volume": [
            1600.0,
            3360.0,
            850.0
        ],
        "total_volume": [
            1600.0,
            3360.0,
            850.0
        ]
    },
    "volatility_data": {
        "strikes": [
            5300.0,
            5350.0,
            5400.0
        ],
        "iv_values": [
            10.71,
            10.71,
            10.71
        ],
        "skew": [
            0.0,
            0.0,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            5300.0,
            5350.0,
            5400.0
        ],
        "charm": [
            -578.0042776368024,
            -3188.0599627316114,
            269.83463028074124
        ],
        "vanna": [
            -2983.7614032584092,
            -5126.744974108094,
            -403.2414685541982
        ],
        "vex": [
            989890.0571363681,
            1406711.656048582,
            643116.8224118258
        ],
        "theta": [
            -1207.7712289262695,
            -5124.561195055401,
            -669.7769620683224
        ],
        "charm_cum": [
            -578.0042776368024,
            -3766.0642403684137,
            -3496.2296100876724
        ],
        "vanna_cum": [
            -2983.7614032584092,
            -8110.506377366502,
            -8513.747845920701
        ],
        "theta_cum": [
            -1207.7712289262695,
            -6332.33242398167,
            -7002.109386049992
        ],
        "r_gamma": [
            6744443.440786532,
            25558359.424711514,
            -4381764.422528573
        ],
        "r_gamma_cum": [
            6744443.440786532,
            32302802.865498047,
            27921038.442969475
        ]
    },
    "detailed_data": [
        {
            "strike": 5300.0,
            "delta": -409.5614544508534,
            "gamma": 6744443.440786532,
            "volume": 0,
            "oi": 1600,
            "iv": 10.71
        },
        {
            "strike": 5350.0,
            "delta": -1060.600567421136,
            "gamma": 25558359.424711514,
            "volume": 0,
            "oi": 3360,
            "iv": 10.71
        },
        {
            "strike": 5400.0,
            "delta": -368.95709163581256,
            "gamma": 4381764.422528573,
            "volume": 0,
            "oi": 850,
            "iv": 10.71
        }
    ]
};