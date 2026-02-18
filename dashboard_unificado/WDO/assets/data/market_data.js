window.marketData = {
    "last_updated": "2026-02-18 14:46:38",
    "spot_price": 5231.0,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 18/02/2026 14:46\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  ModeloFlip(1);\n  spot(0);\n  // 1 = Classic (5250.00)\n  // 2 = Spline (5250.00)\n  // 3 = HVL (5250.00)\n  // 4 = HVL Log (5250.00)\n  // 5 = Sigma Kernel (5250.00)\n  // 6 = PVOP (5250.00)\n  // 7 = HVL Gaussian (5250.00)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5250.00;\n\n  if (ModeloFlip = 1) then GammaVal := 5250.00;\n  if (ModeloFlip = 2) then GammaVal := 5250.00;\n  if (ModeloFlip = 3) then GammaVal := 5250.00;\n  if (ModeloFlip = 4) then GammaVal := 5250.00;\n  if (ModeloFlip = 5) then GammaVal := 5250.00;\n  if (ModeloFlip = 6) then GammaVal := 5250.00;\n  if (ModeloFlip = 7) then GammaVal := 5250.00;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5190.57, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5250.00, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5250.00, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5250.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5250.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5250.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5271.43, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (4446.35 > 0) then\n      HorizontalLineCustom(4446.35, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n  end;\n\n  if (MostrarPLUS) then begin\n  end;\n\n  if (MostrarPLUS2) then begin\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5238.85, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5223.15, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5246.69, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5215.31, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5261.27, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5200.73, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5269.11, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5192.89, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "positive"
    },
    "overview": {
        "total_trades": 205,
        "total_volume": 205,
        "gamma_exposure": 1989783.8195587515,
        "delta_position": 94.4044470598661,
        "last_update": "2026-02-18T14:46:38.442986",
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
                "days": 7.0,
                "sigma_1_up": 5337.97395,
                "sigma_1_down": 5124.02605,
                "sigma_2_up": 5444.9479,
                "sigma_2_down": 5017.0521
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
                8.747792848158007e-14,
                1.4465831334096982e-12,
                2.0796888821774585e-11,
                2.6071243855863327e-10,
                2.8582952973213564e-09,
                2.7484333411254395e-08,
                2.3244830173436173e-07,
                1.7339749004061623e-06,
                1.1440140261049546e-05,
                6.69385970579479e-05,
                0.00034830081723031896,
                0.0016159815976399313,
                0.006703385120392769,
                0.0249290602396392,
                0.08334186591862548,
                0.25117701974281487,
                0.6843884499451821,
                1.6909251885638077,
                3.8001474111786457,
                7.794151330077646,
                14.641136105948098,
                25.28716546894868,
                40.327172565490976,
                59.66633558716856,
                82.33869668158319,
                106.61312322534309,
                130.38711308163937,
                151.7199298825857,
                169.2855888472086,
                182.57828898143956,
                191.8368316799867,
                197.78094400885698,
                201.3035748249045,
                203.23327876390007,
                204.21176019417683,
                204.67163047187853,
                204.8722205030938,
                204.9535284935982,
                204.98419428241496,
                204.99496905373806,
                204.99850023554126,
                204.99958093431783,
                204.99989015314594,
                204.99997296603183,
                204.99999374791113,
                204.99999864007748,
                204.99999972154214,
                204.999999946279,
                204.99999999022648,
                204.99999999832173
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
                81684.47097235851,
                78661.02405866365,
                75637.57714496851,
                72614.13023127058,
                69590.68331754065,
                66567.23640349391,
                63543.78948669396,
                60520.3425488349,
                57496.89546879575,
                54473.447539481844,
                51449.99511136702,
                48426.52150046228,
                45402.959034695254,
                42379.063801589946,
                39354.053534362865,
                36325.69339989071,
                33288.29174965172,
                30228.922111375658,
                27121.411425806888,
                23918.56886963942,
                20544.81922245361,
                16893.184615405058,
                12831.044738459235,
                8216.993148141006,
                2926.470295594623,
                -3121.187699548378,
                -9943.91666964799,
                -17493.484260870486,
                -25668.415449048618,
                -34337.74898973831,
                -43366.76815985365,
                -52636.937744388146,
                -62056.31456210572,
                -71561.0073727392,
                -81110.84408082202,
                -90682.8154508101,
                -100264.85654102603,
                -109851.15348351347,
                -119439.12353063408,
                -129027.70615235536,
                -138616.49790367522,
                -148205.35630552904,
                -157794.23456029646,
                -167383.11834816364,
                -176972.00358053183,
                -186560.88916652554,
                -196149.77483378595,
                -205738.66051859653,
                -215327.54620697154,
                -224916.4318960287
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
                        "Call_Now": 46.37450398231067,
                        "Call_Sim": 57.131666242607935,
                        "Call_Chg": 23.196285321780543,
                        "Put_Now": 39.11426920133181,
                        "Put_Sim": 30.871431461629072,
                        "Put_Chg": -21.073735769610323
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 37.122056521143804,
                        "Call_Sim": 46.542945117019826,
                        "Call_Chg": 25.378143019932413,
                        "Put_Now": 48.835451168412874,
                        "Put_Sim": 39.25633976428844,
                        "Put_Chg": -19.61507711086792
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 5231.0,
                        "Call_Now": 46.37450398231067,
                        "Call_Sim": 57.131666242607935,
                        "Call_Chg": 23.196285321780543,
                        "Put_Now": 39.11426920133181,
                        "Put_Sim": 30.871431461629072,
                        "Put_Chg": -21.073735769610323
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 37.122056521143804,
                        "Call_Sim": 46.542945117019826,
                        "Call_Chg": 25.378143019932413,
                        "Put_Now": 48.835451168412874,
                        "Put_Sim": 39.25633976428844,
                        "Put_Chg": -19.61507711086792
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5283.31,
                "options": [
                    {
                        "Strike": 5231.0,
                        "Call_Now": 46.37450398231067,
                        "Call_Sim": 79.0691493180334,
                        "Call_Chg": 70.50133700231908,
                        "Put_Now": 39.11426920133181,
                        "Put_Sim": 19.498914537053906,
                        "Put_Chg": -50.14884609836968
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 37.122056521143804,
                        "Call_Sim": 66.25373916715353,
                        "Call_Chg": 78.47540081573077,
                        "Put_Now": 48.835451168412874,
                        "Put_Sim": 25.657133814421286,
                        "Put_Chg": -47.46207273494689
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5178.69,
                "options": [
                    {
                        "Strike": 5231.0,
                        "Call_Now": 46.37450398231067,
                        "Call_Sim": 23.65772648543566,
                        "Call_Chg": -48.98548889178463,
                        "Put_Now": 39.11426920133181,
                        "Put_Sim": 68.70749170445742,
                        "Put_Chg": 75.65838019573172
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 37.122056521143804,
                        "Call_Sim": 17.948362020298873,
                        "Call_Chg": -51.65041028889138,
                        "Put_Now": 48.835451168412874,
                        "Put_Sim": 81.97175666756766,
                        "Put_Chg": 67.85297300701009
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
            94.4044470598661
        ],
        "delta_cumulative": [
            94.4044470598661
        ]
    },
    "gamma_data": {
        "strikes": [
            5250.0
        ],
        "gamma_values": [
            1989783.8195587515
        ],
        "gamma_call": [
            1989783.8195587515
        ],
        "gamma_put": [
            0.0
        ],
        "gamma_exposure": [
            1989783.8195587515
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
            377.7589488928624
        ],
        "vanna": [
            79.80419656943182
        ],
        "vex": [
            70951.6782747623
        ],
        "theta": [
            -718.3129312968504
        ],
        "charm_cum": [
            377.7589488928624
        ],
        "vanna_cum": [
            79.80419656943182
        ],
        "theta_cum": [
            -718.3129312968504
        ],
        "r_gamma": [
            -1989783.8195587515
        ],
        "r_gamma_cum": [
            -1989783.8195587515
        ]
    },
    "detailed_data": [
        {
            "strike": 5250.0,
            "delta": 94.4044470598661,
            "gamma": 1989783.8195587515,
            "volume": 0,
            "oi": 205,
            "iv": 12.27
        }
    ]
};