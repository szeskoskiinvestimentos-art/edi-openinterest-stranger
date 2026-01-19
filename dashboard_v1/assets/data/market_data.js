window.marketData = {
    "last_updated": "2026-01-19 08:14:08",
    "spot_price": 5386.5,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ModeloFlip(1);\n  spot(0);\n  // 1 = Classic (5650.00)\n  // 2 = Spline (5650.00)\n  // 3 = HVL (5650.00)\n  // 4 = HVL Log (5650.00)\n  // 5 = Sigma Kernel (5650.00)\n  // 6 = PVOP (5650.00)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5650.00;\n\n  if (ModeloFlip = 1) then GammaVal := 5650.00;\n  if (ModeloFlip = 2) then GammaVal := 5650.00;\n  if (ModeloFlip = 3) then GammaVal := 5650.00;\n  if (ModeloFlip = 4) then GammaVal := 5650.00;\n  if (ModeloFlip = 5) then GammaVal := 5650.00;\n  if (ModeloFlip = 6) then GammaVal := 5650.00;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5347.24, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5350.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5350.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5375.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5400.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5425.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5425.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5425.76, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5650.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5650.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5832.93 > 0) then\n      HorizontalLineCustom(5832.93, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(5362.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5387.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5412.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5537.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(5359.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5365.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5384.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5390.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5409.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5415.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5510.95, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5564.05, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(5355.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5394.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5405.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5419.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5478.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5596.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if LastBarOnChart then\n  begin\n    HorizontalLineCustom(5394.58, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5378.42, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5402.66, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5370.34, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5417.66, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5355.34, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5425.74, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5347.26, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 9260,
        "total_volume": 9260,
        "gamma_exposure": 66931006.89168349,
        "delta_position": -3576.2659272202313,
        "last_update": "2026-01-19T08:14:08.171763",
        "spot_price": 5386.5,
        "dealer_pressure": -0.09726280738039009,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 5350.0,
        "gamma_flip_hvl": 5350.0,
        "call_wall": 5650.0,
        "put_wall": 5350.0,
        "max_pain": 5425.0,
        "zero_gamma": 5350.0,
        "range_low": 5347.240953026985,
        "range_high": 5425.759046973015,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5425.759046973015,
                "sigma_1_down": 5347.240953026985,
                "sigma_2_up": 5465.01809394603,
                "sigma_2_down": 5307.98190605397
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5474.285897763518,
                "sigma_1_down": 5298.714102236482,
                "sigma_2_up": 5562.071795527037,
                "sigma_2_down": 5210.928204472963
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 9.0,
                "sigma_1_up": 5504.2771409190445,
                "sigma_1_down": 5268.7228590809555,
                "sigma_2_up": 5622.054281838088,
                "sigma_2_down": 5150.945718161912
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
                4578.525,
                4611.503571428571,
                4644.482142857142,
                4677.460714285714,
                4710.439285714286,
                4743.4178571428565,
                4776.396428571428,
                4809.375,
                4842.353571428571,
                4875.332142857143,
                4908.310714285714,
                4941.289285714285,
                4974.267857142857,
                5007.246428571429,
                5040.224999999999,
                5073.203571428571,
                5106.182142857142,
                5139.160714285714,
                5172.1392857142855,
                5205.117857142857,
                5238.096428571428,
                5271.075,
                5304.053571428571,
                5337.032142857142,
                5370.010714285714,
                5402.989285714285,
                5435.967857142857,
                5468.946428571428,
                5501.924999999999,
                5534.903571428571,
                5567.882142857143,
                5600.860714285714,
                5633.839285714285,
                5666.817857142857,
                5699.796428571428,
                5732.775,
                5765.753571428571,
                5798.732142857142,
                5831.710714285714,
                5864.689285714285,
                5897.6678571428565,
                5930.646428571428,
                5963.625,
                5996.603571428571,
                6029.582142857143,
                6062.560714285713,
                6095.539285714285,
                6128.517857142857,
                6161.496428571429,
                6194.474999999999
            ],
            "deltas": [
                -9219.773136125637,
                -9219.532148192302,
                -9219.069642494676,
                -9218.21445831186,
                -9216.68986916383,
                -9214.067324827727,
                -9209.711192039918,
                -9202.71848498593,
                -9191.859571695531,
                -9175.524489851006,
                -9151.669681276751,
                -9117.735097923673,
                -9070.459301363178,
                -9005.474807036424,
                -8916.564013546998,
                -8794.574105599706,
                -8626.286132629008,
                -8393.953934296047,
                -8076.525264279818,
                -7653.353849311034,
                -7110.271102402644,
                -6446.448063668105,
                -5679.326100797645,
                -4844.942132725427,
                -3992.555009326563,
                -3174.928413003032,
                -2437.5960349110533,
                -1810.7985241314523,
                -1306.4023213819523,
                -919.8786841949217,
                -635.5764453896993,
                -432.8485190203595,
                -291.0743615165152,
                -192.6777357871202,
                -124.21890089627206,
                -76.17865918569649,
                -42.13395672004468,
                -17.837177200064552,
                -0.45933158397089435,
                11.935347950674966,
                20.71671534729247,
                26.880799528647294,
                31.16210028583227,
                34.1030691100648,
                36.10138398955284,
                37.44502283710531,
                38.33954644572905,
                38.929539765546195,
                39.315269145064285,
                39.565357174395785
            ],
            "flip_value": 5832.93285959484
        },
        "flow_sentiment": {
            "bull": [
                1000.0,
                400.0,
                75.0,
                0.0,
                0.0
            ],
            "bear": [
                -400.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4578.525,
                4611.503571428571,
                4644.482142857142,
                4677.460714285714,
                4710.439285714286,
                4743.4178571428565,
                4776.396428571428,
                4809.375,
                4842.353571428571,
                4875.332142857143,
                4908.310714285714,
                4941.289285714285,
                4974.267857142857,
                5007.246428571429,
                5040.224999999999,
                5073.203571428571,
                5106.182142857142,
                5139.160714285714,
                5172.1392857142855,
                5205.117857142857,
                5238.096428571428,
                5271.075,
                5304.053571428571,
                5337.032142857142,
                5370.010714285714,
                5402.989285714285,
                5435.967857142857,
                5468.946428571428,
                5501.924999999999,
                5534.903571428571,
                5567.882142857143,
                5600.860714285714,
                5633.839285714285,
                5666.817857142857,
                5699.796428571428,
                5732.775,
                5765.753571428571,
                5798.732142857142,
                5831.710714285714,
                5864.689285714285,
                5897.6678571428565,
                5930.646428571428,
                5963.625,
                5996.603571428571,
                6029.582142857143,
                6062.560714285713,
                6095.539285714285,
                6128.517857142857,
                6161.496428571429,
                6194.474999999999
            ],
            "pnl": [
                -9685034.719757156,
                -9264642.455663776,
                -8844250.19157826,
                -8423857.927556211,
                -8003465.66398924,
                -7583073.403332238,
                -7162681.15930393,
                -6742289.0003888635,
                -6321897.232547814,
                -5901507.081224773,
                -5481122.953809185,
                -5060759.105513283,
                -4640457.054785003,
                -4220325.811134627,
                -3800623.60608357,
                -3381902.630428454,
                -2965228.761996405,
                -2552457.940673765,
                -2146500.1940745506,
                -1751450.0135689059,
                -1372443.873743771,
                -1015156.9380723445,
                -684974.9924234722,
                -386028.63849490485,
                -120375.54795690207,
                112401.8393925654,
                315055.1364391535,
                492051.9462248584,
                648702.2210537498,
                790298.6597459321,
                921479.3361183808,
                1045899.8286875075,
                1166186.6684217567,
                1284076.8337193646,
                1400636.6990871674,
                1516479.923534783,
                1631941.8566463275,
                1747199.7711654464,
                1862346.5358790082,
                1977431.5954879154,
                2092482.1258592417,
                2207513.50403649,
                2322534.522325699,
                2437550.14286095,
                2552563.076448571,
                2667574.7382506784,
                2782585.8291288884,
                2897596.6771984072,
                3012607.427465882,
                3127618.140415487
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
                109875.0,
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
                        "Call_Now": 73.367389770312,
                        "Call_Sim": 309.73423140493287,
                        "Call_Chg": 322.16880329885515,
                        "Put_Now": 27.322343241130284,
                        "Put_Sim": 0.1891848757509429,
                        "Put_Chg": -99.30758180555264
                    },
                    {
                        "Strike": 5386.5,
                        "Call_Now": 51.90497420249267,
                        "Call_Sim": 273.5974682744172,
                        "Call_Chg": 427.1122324558983,
                        "Put_Now": 42.29480726241172,
                        "Put_Sim": 0.4873013343369905,
                        "Put_Chg": -98.8478459511268
                    },
                    {
                        "Strike": 5650.0,
                        "Call_Now": 0.7739034503978957,
                        "Call_Sim": 54.44409249866976,
                        "Call_Chg": 6934.998031172727,
                        "Put_Now": 254.19362066724352,
                        "Put_Sim": 44.363809715516254,
                        "Put_Chg": -82.54723718122278
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5350.0,
                "options": [
                    {
                        "Strike": 5350.0,
                        "Call_Now": 73.367389770312,
                        "Call_Sim": 51.553255728828844,
                        "Call_Chg": -29.732738359338782,
                        "Put_Now": 27.322343241130284,
                        "Put_Sim": 42.00820919964781,
                        "Put_Chg": 53.75038966793242
                    },
                    {
                        "Strike": 5386.5,
                        "Call_Now": 51.90497420249267,
                        "Call_Sim": 34.56375933552363,
                        "Call_Chg": -33.40954336922925,
                        "Put_Now": 42.29480726241172,
                        "Put_Sim": 61.45359239544314,
                        "Put_Chg": 45.29819704382062
                    },
                    {
                        "Strike": 5650.0,
                        "Call_Now": 0.7739034503978957,
                        "Call_Sim": 0.3136139230339765,
                        "Call_Chg": -59.47635032861855,
                        "Put_Now": 254.19362066724352,
                        "Put_Sim": 290.23333113987974,
                        "Put_Chg": 14.178054656932012
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5350.0,
                "options": [
                    {
                        "Strike": 5350.0,
                        "Call_Now": 73.367389770312,
                        "Call_Sim": 51.553255728828844,
                        "Call_Chg": -29.732738359338782,
                        "Put_Now": 27.322343241130284,
                        "Put_Sim": 42.00820919964781,
                        "Put_Chg": 53.75038966793242
                    },
                    {
                        "Strike": 5386.5,
                        "Call_Now": 51.90497420249267,
                        "Call_Sim": 34.56375933552363,
                        "Call_Chg": -33.40954336922925,
                        "Put_Now": 42.29480726241172,
                        "Put_Sim": 61.45359239544314,
                        "Put_Chg": 45.29819704382062
                    },
                    {
                        "Strike": 5650.0,
                        "Call_Now": 0.7739034503978957,
                        "Call_Sim": 0.3136139230339765,
                        "Call_Chg": -59.47635032861855,
                        "Put_Now": 254.19362066724352,
                        "Put_Sim": 290.23333113987974,
                        "Put_Chg": 14.178054656932012
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5440.365,
                "options": [
                    {
                        "Strike": 5350.0,
                        "Call_Now": 73.367389770312,
                        "Call_Sim": 112.92409773795498,
                        "Call_Chg": 53.91592653286615,
                        "Put_Now": 27.322343241130284,
                        "Put_Sim": 13.014051208773935,
                        "Put_Chg": -52.368466006301574
                    },
                    {
                        "Strike": 5386.5,
                        "Call_Now": 51.90497420249267,
                        "Call_Sim": 85.55292008848073,
                        "Call_Chg": 64.82605261437962,
                        "Put_Now": 42.29480726241172,
                        "Put_Sim": 22.077753148400006,
                        "Put_Chg": -47.80032212601908
                    },
                    {
                        "Strike": 5650.0,
                        "Call_Now": 0.7739034503978957,
                        "Call_Sim": 2.514207807368564,
                        "Call_Chg": 224.87357513083913,
                        "Put_Now": 254.19362066724352,
                        "Put_Sim": 202.06892502421488,
                        "Put_Chg": -20.505902353569827
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5332.635,
                "options": [
                    {
                        "Strike": 5350.0,
                        "Call_Now": 73.367389770312,
                        "Call_Sim": 42.74411354412632,
                        "Call_Chg": -41.739628903326945,
                        "Put_Now": 27.322343241130284,
                        "Put_Sim": 50.56406701494461,
                        "Put_Chg": 85.06489933420825
                    },
                    {
                        "Strike": 5386.5,
                        "Call_Now": 51.90497420249267,
                        "Call_Sim": 27.878362138830653,
                        "Call_Chg": -46.2896137274415,
                        "Put_Now": 42.29480726241172,
                        "Put_Sim": 72.13319519874904,
                        "Put_Chg": 70.54858472627515
                    },
                    {
                        "Strike": 5650.0,
                        "Call_Now": 0.7739034503978957,
                        "Call_Sim": 0.19782210680222434,
                        "Call_Chg": -74.43839968661261,
                        "Put_Now": 254.19362066724352,
                        "Put_Sim": 307.4825393236488,
                        "Put_Chg": 20.963908738749986
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.5,
            -0.0069235466834428935,
            0.11524196028263302,
            0.002630356879249525,
            0.007047343126043054
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
            -2457.3010459012016,
            -135.8359997092054,
            -897.9039129615313,
            -91.09377607312467,
            5.868807424831656
        ],
        "delta_cumulative": [
            -2457.3010459012016,
            -2593.137045610407,
            -3491.040958571938,
            -3582.134734645063,
            -3576.2659272202313
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
            47609628.16189219,
            2191832.75442846,
            16097798.916821836,
            914681.9422123656,
            117065.11632863553
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            117065.11632863553
        ],
        "gamma_put": [
            47609628.16189219,
            2191832.75442846,
            16097798.916821836,
            914681.9422123656,
            0.0
        ],
        "gamma_exposure": [
            47609628.16189219,
            49801460.91632065,
            65899259.83314249,
            66813941.775354855,
            66931006.89168349
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
            325.0,
            1765.0,
            180.0,
            0.0
        ],
        "total_volume": [
            6950.0,
            325.0,
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
            11.57,
            11.57,
            11.57,
            11.57,
            11.57
        ],
        "skew": [
            0.0,
            0.0,
            0.0,
            7.453889935837843e-20,
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
            -4519.41444519831,
            29.446338605725266,
            2051.023984275507,
            108.51347025303541,
            55.22535662426744
        ],
        "vanna": [
            -7775.061872539529,
            -194.13371484521053,
            267.65267468706713,
            33.972765916083894,
            86.4790744580045
        ],
        "vex": [
            3543161.788456064,
            185887.86199036014,
            716602.7750167008,
            131201.13171014513,
            16791.712000946878
        ],
        "theta": [
            -10942.766500239044,
            -478.61603141525563,
            -3629.382739888004,
            -161.21953120681403,
            -39.64420479019199
        ],
        "charm_cum": [
            -4519.41444519831,
            -4489.968106592585,
            -2438.9441223170784,
            -2330.430652064043,
            -2275.2052954397755
        ],
        "vanna_cum": [
            -7775.061872539529,
            -7969.195587384739,
            -7701.542912697672,
            -7667.570146781589,
            -7581.091072323585
        ],
        "theta_cum": [
            -10942.766500239044,
            -11421.382531654299,
            -15050.765271542303,
            -15211.984802749117,
            -15251.62900753931
        ],
        "r_gamma": [
            47609628.16189219,
            2191832.75442846,
            -16097798.916821836,
            -914681.9422123656,
            -117065.11632863553
        ],
        "r_gamma_cum": [
            47609628.16189219,
            49801460.91632065,
            33703661.999498814,
            32788980.05728645,
            32671914.940957814
        ]
    },
    "detailed_data": [
        {
            "strike": 5350.0,
            "delta": -2457.3010459012016,
            "gamma": 47609628.16189219,
            "volume": 0,
            "oi": 6950,
            "iv": 11.57
        },
        {
            "strike": 5375.0,
            "delta": -135.8359997092054,
            "gamma": 2191832.75442846,
            "volume": 0,
            "oi": 325,
            "iv": 11.57
        },
        {
            "strike": 5400.0,
            "delta": -897.9039129615313,
            "gamma": 16097798.916821836,
            "volume": 0,
            "oi": 1765,
            "iv": 11.57
        },
        {
            "strike": 5425.0,
            "delta": -91.09377607312467,
            "gamma": 914681.9422123656,
            "volume": 0,
            "oi": 180,
            "iv": 11.57
        },
        {
            "strike": 5650.0,
            "delta": 5.868807424831656,
            "gamma": 117065.11632863553,
            "volume": 0,
            "oi": 40,
            "iv": 11.57
        }
    ]
};