window.marketData = {
    "last_updated": "2026-02-17 16:21:56",
    "spot_price": 5231.0,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 17/02/2026 16:21\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  ModeloFlip(1);\n  spot(0);\n  // 1 = Classic (5250.00)\n  // 2 = Spline (5250.00)\n  // 3 = HVL (5250.00)\n  // 4 = HVL Log (5250.00)\n  // 5 = Sigma Kernel (5250.00)\n  // 6 = PVOP (5250.00)\n  // 7 = HVL Gaussian (5250.00)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5250.00;\n\n  if (ModeloFlip = 1) then GammaVal := 5250.00;\n  if (ModeloFlip = 2) then GammaVal := 5250.00;\n  if (ModeloFlip = 3) then GammaVal := 5250.00;\n  if (ModeloFlip = 4) then GammaVal := 5250.00;\n  if (ModeloFlip = 5) then GammaVal := 5250.00;\n  if (ModeloFlip = 6) then GammaVal := 5250.00;\n  if (ModeloFlip = 7) then GammaVal := 5250.00;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5190.57, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5250.00, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5250.00, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5250.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5250.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5250.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5271.43, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (4446.35 > 0) then\n      HorizontalLineCustom(4446.35, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n  end;\n\n  if (MostrarPLUS) then begin\n  end;\n\n  if (MostrarPLUS2) then begin\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5238.85, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5223.15, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5246.69, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5215.31, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5261.27, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5200.73, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5269.11, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5192.89, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "positive"
    },
    "overview": {
        "total_trades": 205,
        "total_volume": 205,
        "gamma_exposure": 1864119.220787755,
        "delta_position": 95.77647167813473,
        "last_update": "2026-02-17T16:21:56.574360",
        "spot_price": 5231.0,
        "dealer_pressure": 1.0,
        "regime": "Gamma Negativo"
    },
    "key_levels": {
        "gamma_flip": null,
        "gamma_flip_hvl": 5250.0,
        "gamma_flip_hvl_gaussian": 5250.0,
        "call_wall": 5250.0,
        "put_wall": 5250.0,
        "effective_call_wall": 5250.0,
        "effective_put_wall": 5250.0,
        "max_pain": 5250.0,
        "zero_gamma": null,
        "range_low": 5190.567647362534,
        "range_high": 5271.432352637465,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5271.432352637466,
                "sigma_1_down": 5190.567647362534,
                "sigma_2_up": 5311.864705274931,
                "sigma_2_down": 5150.135294725069
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5321.409488987616,
                "sigma_1_down": 5140.590511012384,
                "sigma_2_up": 5411.818977975231,
                "sigma_2_down": 5050.181022024769
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 8.0,
                "sigma_1_up": 5345.35996291711,
                "sigma_1_down": 5116.64003708289,
                "sigma_2_up": 5459.719925834221,
                "sigma_2_down": 5002.280074165779
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
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4446.349999999999,
                4478.376530612244,
                4510.40306122449,
                4542.429591836734,
                4574.456122448979,
                4606.482653061224,
                4638.509183673469,
                4670.535714285714,
                4702.562244897958,
                4734.588775510204,
                4766.615306122449,
                4798.641836734693,
                4830.668367346938,
                4862.694897959183,
                4894.721428571428,
                4926.747959183673,
                4958.774489795918,
                4990.801020408163,
                5022.827551020408,
                5054.854081632653,
                5086.880612244898,
                5118.907142857142,
                5150.933673469387,
                5182.960204081633,
                5214.986734693877,
                5247.013265306122,
                5279.0397959183665,
                5311.066326530612,
                5343.092857142857,
                5375.119387755101,
                5407.145918367347,
                5439.1724489795915,
                5471.198979591836,
                5503.225510204082,
                5535.252040816326,
                5567.278571428571,
                5599.305102040817,
                5631.331632653061,
                5663.358163265306,
                5695.3846938775505,
                5727.411224489795,
                5759.437755102041,
                5791.464285714285,
                5823.49081632653,
                5855.5173469387755,
                5887.54387755102,
                5919.570408163265,
                5951.59693877551,
                5983.623469387755,
                6015.65
            ],
            "deltas": [
                5.78145634919359e-12,
                6.745043162899752e-11,
                6.963527391407143e-10,
                6.378410135111132e-09,
                5.19702236581076e-08,
                3.7762161088845676e-07,
                2.4530311383434106e-06,
                1.4281113027373569e-05,
                7.469474708197206e-05,
                0.0003518305392767515,
                0.0014960026665071886,
                0.005756037518272461,
                0.020088424419538856,
                0.06374475914684857,
                0.18436469265154048,
                0.4872192929390451,
                1.1794866712762495,
                2.622602460621072,
                5.370884965867622,
                10.160300240318065,
                17.810554684521705,
                29.02910272581476,
                44.155802907586875,
                62.938702201735886,
                84.44874215389733,
                107.20049284593556,
                129.45942351525156,
                149.6299342796318,
                166.5829372296546,
                179.81643598986724,
                189.42303527986675,
                195.91667371648515,
                200.00904102429882,
                202.4165189000423,
                203.7401687105135,
                204.42112303348122,
                204.74929183580946,
                204.8976122823844,
                204.96054972283625,
                204.98565075123275,
                204.99506983848576,
                204.99839882573178,
                204.99950811160025,
                204.9998569594234,
                204.99996059627952,
                204.999989709762,
                204.99999745052185,
                204.99999940028698,
                204.99999986596117,
                204.9999999715134
            ],
            "flip_value": 4446.349999999999
        },
        "flow_sentiment": {
            "bull": [
                75.0
            ],
            "bear": [
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4446.349999999999,
                4478.376530612244,
                4510.40306122449,
                4542.429591836734,
                4574.456122448979,
                4606.482653061224,
                4638.509183673469,
                4670.535714285714,
                4702.562244897958,
                4734.588775510204,
                4766.615306122449,
                4798.641836734693,
                4830.668367346938,
                4862.694897959183,
                4894.721428571428,
                4926.747959183673,
                4958.774489795918,
                4990.801020408163,
                5022.827551020408,
                5054.854081632653,
                5086.880612244898,
                5118.907142857142,
                5150.933673469387,
                5182.960204081633,
                5214.986734693877,
                5247.013265306122,
                5279.0397959183665,
                5311.066326530612,
                5343.092857142857,
                5375.119387755101,
                5407.145918367347,
                5439.1724489795915,
                5471.198979591836,
                5503.225510204082,
                5535.252040816326,
                5567.278571428571,
                5599.305102040817,
                5631.331632653061,
                5663.358163265306,
                5695.3846938775505,
                5727.411224489795,
                5759.437755102041,
                5791.464285714285,
                5823.49081632653,
                5855.5173469387755,
                5887.54387755102,
                5919.570408163265,
                5951.59693877551,
                5983.623469387755,
                6015.65
            ],
            "pnl": [
                83459.73323980147,
                80392.34513766812,
                77324.95703552676,
                74257.56893331125,
                71190.18083047637,
                68122.79272303802,
                65055.404585071665,
                61988.01626604516,
                58920.62698452543,
                55853.23310741842,
                52785.8194810955,
                49718.32931295497,
                46650.5710793498,
                43581.96286607071,
                40510.910017249,
                37433.46790892408,
                34340.8241102443,
                31215.197010798103,
                28024.197344694465,
                24714.643357094246,
                21208.04484164186,
                17400.821265690563,
                13171.927465627841,
                8398.44862535011,
                2976.414584371534,
                -3158.87624485388,
                -10019.567989196566,
                -17563.456213361223,
                -25704.019110905294,
                -34328.45408211526,
                -43317.717521975166,
                -52563.05432351786,
                -61975.92333476106,
                -71491.07921558752,
                -81064.5859963044,
                -90669.23065988946,
                -100289.4364773487,
                -109916.93339239917,
                -119547.63672257701,
                -129179.66497383616,
                -138812.20817148208,
                -148444.9398142647,
                -158077.73645490123,
                -167710.55424677773,
                -177343.3785387301,
                -186976.204718941,
                -196609.03141815806,
                -206241.85825247303,
                -215874.6851201212,
                -225507.51199557245
            ]
        },
        "max_pain_profile": {
            "strikes": [
                5250.0
            ],
            "loss": [
                0.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 5231.0,
                        "Call_Now": 49.854327934377125,
                        "Call_Sim": 60.609204081864846,
                        "Call_Chg": 21.572602807211208,
                        "Put_Now": 41.557739667020996,
                        "Put_Sim": 33.31261581450826,
                        "Put_Chg": -19.840164355848792
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 40.53036457342978,
                        "Call_Sim": 50.03540846023316,
                        "Call_Chg": 23.45166145639493,
                        "Put_Now": 51.20364149875559,
                        "Put_Sim": 41.708685385558965,
                        "Put_Chg": -18.54351728758858
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 5231.0,
                        "Call_Now": 49.854327934377125,
                        "Call_Sim": 60.609204081864846,
                        "Call_Chg": 21.572602807211208,
                        "Put_Now": 41.557739667020996,
                        "Put_Sim": 33.31261581450826,
                        "Put_Chg": -19.840164355848792
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 40.53036457342978,
                        "Call_Sim": 50.03540846023316,
                        "Call_Chg": 23.45166145639493,
                        "Put_Now": 51.20364149875559,
                        "Put_Sim": 41.708685385558965,
                        "Put_Chg": -18.54351728758858
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5283.31,
                "options": [
                    {
                        "Strike": 5231.0,
                        "Call_Now": 49.854327934377125,
                        "Call_Sim": 82.35299166283676,
                        "Call_Chg": 65.1872466744259,
                        "Put_Now": 41.557739667020996,
                        "Put_Sim": 21.74640339548,
                        "Put_Chg": -47.67183304548849
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 40.53036457342978,
                        "Call_Sim": 69.68833028079735,
                        "Call_Chg": 71.94103979632706,
                        "Put_Now": 51.20364149875559,
                        "Put_Sim": 28.051607206122753,
                        "Put_Chg": -45.21560110758041
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5178.69,
                "options": [
                    {
                        "Strike": 5231.0,
                        "Call_Now": 49.854327934377125,
                        "Call_Sim": 26.70771493985353,
                        "Call_Chg": -46.4284926776895,
                        "Put_Now": 41.557739667020996,
                        "Put_Sim": 70.72112667249758,
                        "Put_Chg": 70.17558519579396
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 40.53036457342978,
                        "Call_Sim": 20.723689117579852,
                        "Call_Chg": -48.868732527598475,
                        "Put_Now": 51.20364149875559,
                        "Put_Sim": 83.70696604290652,
                        "Put_Chg": 63.478540964593044
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            1.0
        ]
    },
    "delta_data": {
        "strikes": [
            5250.0
        ],
        "delta_values": [
            95.77647167813473
        ],
        "delta_cumulative": [
            95.77647167813473
        ]
    },
    "gamma_data": {
        "strikes": [
            5250.0
        ],
        "gamma_values": [
            1864119.220787755
        ],
        "gamma_call": [
            1864119.220787755
        ],
        "gamma_put": [
            0.0
        ],
        "gamma_exposure": [
            1864119.220787755
        ]
    },
    "volume_data": {
        "strikes": [
            5250.0
        ],
        "call_volume": [
            205.0
        ],
        "put_volume": [
            0.0
        ],
        "total_volume": [
            205.0
        ]
    },
    "volatility_data": {
        "strikes": [
            5250.0
        ],
        "iv_values": [
            12.27
        ],
        "skew": [
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            5250.0
        ],
        "charm": [
            322.40552785693615
        ],
        "vanna": [
            69.60494162570535
        ],
        "vex": [
            75966.55097850983
        ],
        "theta": [
            -680.3260272233459
        ],
        "charm_cum": [
            322.40552785693615
        ],
        "vanna_cum": [
            69.60494162570535
        ],
        "theta_cum": [
            -680.3260272233459
        ],
        "r_gamma": [
            -1864119.220787755
        ],
        "r_gamma_cum": [
            -1864119.220787755
        ]
    },
    "detailed_data": [
        {
            "strike": 5250.0,
            "delta": 95.77647167813473,
            "gamma": 1864119.220787755,
            "volume": 0,
            "oi": 205,
            "iv": 12.27
        }
    ]
};