window.marketData = {
    "last_updated": "2026-02-19 08:25:13",
    "spot_price": 5249.0,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 19/02/2026 08:25\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  ModeloFlip(5);\n  spot(0);\n  // 1 = Classic (5251.54)\n  // 2 = Spline (5252.05)\n  // 3 = HVL (5251.52)\n  // 4 = HVL Log (5250.85)\n  // 5 = Sigma Kernel (5249.99)\n  // 6 = PVOP (5251.54)\n  // 7 = HVL Gaussian (5225.00)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5251.54;\n\n  if (ModeloFlip = 1) then GammaVal := 5251.54;\n  if (ModeloFlip = 2) then GammaVal := 5252.05;\n  if (ModeloFlip = 3) then GammaVal := 5251.52;\n  if (ModeloFlip = 4) then GammaVal := 5250.85;\n  if (ModeloFlip = 5) then GammaVal := 5249.99;\n  if (ModeloFlip = 6) then GammaVal := 5251.54;\n  if (ModeloFlip = 7) then GammaVal := 5225.00;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5213.79, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5225.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5225.00, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5225.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5225.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5284.21, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5300.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5350.47, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (4461.65 > 0) then\n      HorizontalLineCustom(4461.65, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(5237.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5350.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5425.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(5234.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5240.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5419.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5430.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5244.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5323.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5376.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5411.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5438.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5256.87, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5241.13, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5264.75, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5233.25, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5279.37, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5218.63, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5287.24, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5210.76, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "positive"
    },
    "overview": {
        "total_trades": 3905,
        "total_volume": 3905,
        "gamma_exposure": 28823774.889804788,
        "delta_position": 1057.4566815757246,
        "last_update": "2026-02-19T08:25:13.943911",
        "spot_price": 5249.0,
        "dealer_pressure": 0.3045295098883749,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 5225.0,
        "gamma_flip_hvl": 5225.0,
        "gamma_flip_hvl_gaussian": 5225.0,
        "call_wall": 5300.0,
        "put_wall": 5225.0,
        "effective_call_wall": 5350.471698113208,
        "effective_put_wall": 5225.0,
        "max_pain": 5225.0,
        "zero_gamma": 5251.544143015721,
        "range_low": 5213.785144540849,
        "range_high": 5284.214855459152,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5284.214855459151,
                "sigma_1_down": 5213.785144540849,
                "sigma_2_up": 5319.429710918303,
                "sigma_2_down": 5178.570289081697
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5327.742810624492,
                "sigma_1_down": 5170.257189375508,
                "sigma_2_up": 5406.485621248984,
                "sigma_2_down": 5091.514378751016
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 6.0,
                "sigma_1_up": 5335.258427240784,
                "sigma_1_down": 5162.741572759216,
                "sigma_2_up": 5421.516854481567,
                "sigma_2_down": 5076.483145518433
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
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0,
                5225.0
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4461.65,
                4493.786734693877,
                4525.923469387755,
                4558.060204081632,
                4590.19693877551,
                4622.333673469388,
                4654.470408163265,
                4686.607142857142,
                4718.74387755102,
                4750.880612244898,
                4783.0173469387755,
                4815.154081632652,
                4847.29081632653,
                4879.427551020408,
                4911.564285714286,
                4943.701020408163,
                4975.83775510204,
                5007.974489795918,
                5040.111224489796,
                5072.247959183673,
                5104.3846938775505,
                5136.521428571428,
                5168.658163265306,
                5200.794897959183,
                5232.931632653061,
                5265.068367346938,
                5297.205102040816,
                5329.341836734693,
                5361.478571428571,
                5393.615306122449,
                5425.752040816326,
                5457.888775510204,
                5490.025510204081,
                5522.162244897959,
                5554.2989795918365,
                5586.435714285713,
                5618.572448979591,
                5650.709183673469,
                5682.845918367347,
                5714.9826530612245,
                5747.119387755101,
                5779.256122448979,
                5811.392857142857,
                5843.529591836734,
                5875.6663265306115,
                5907.803061224489,
                5939.939795918367,
                5972.076530612245,
                6004.213265306122,
                6036.349999999999
            ],
            "deltas": [
                0.0004771990776403555,
                0.001260228102703734,
                0.0031809096331155305,
                0.007681958339370461,
                0.01776929791199695,
                0.03940937814655122,
                0.08388954182643679,
                0.17156876238898675,
                0.3374660114704445,
                0.639027864511286,
                1.166123472755757,
                2.0528318022768923,
                3.4901687645559334,
                5.739710566188908,
                9.153829277057607,
                14.22774730272434,
                21.754623651298093,
                33.22778682999398,
                51.68094969747217,
                83.03404622414511,
                137.54628015592218,
                230.21774111617447,
                378.51053245202854,
                596.5820434729553,
                887.7411799480087,
                1239.5502076093335,
                1625.883838272611,
                2015.919546114726,
                2384.5417019236897,
                2717.4412477389615,
                3008.953368049245,
                3256.7085570120416,
                3458.5601658211795,
                3613.4895998382976,
                3724.003003529542,
                3796.895694949511,
                3841.6014278682114,
                3867.552067870147,
                3882.2488311727457,
                3890.683519138045,
                3895.7430454270166,
                3898.9405449570254,
                3901.038514162961,
                3902.4361947985108,
                3903.3651918300748,
                3903.9750830869957,
                3904.3687302843236,
                3904.6180849756392,
                3904.773030777138,
                3904.867481688387
            ],
            "flip_value": 4461.65
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                140.0,
                0.0,
                100.0
            ],
            "bear": [
                -15.0,
                -25.0,
                -0.0,
                -25.0,
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4461.65,
                4493.786734693877,
                4525.923469387755,
                4558.060204081632,
                4590.19693877551,
                4622.333673469388,
                4654.470408163265,
                4686.607142857142,
                4718.74387755102,
                4750.880612244898,
                4783.0173469387755,
                4815.154081632652,
                4847.29081632653,
                4879.427551020408,
                4911.564285714286,
                4943.701020408163,
                4975.83775510204,
                5007.974489795918,
                5040.111224489796,
                5072.247959183673,
                5104.3846938775505,
                5136.521428571428,
                5168.658163265306,
                5200.794897959183,
                5232.931632653061,
                5265.068367346938,
                5297.205102040816,
                5329.341836734693,
                5361.478571428571,
                5393.615306122449,
                5425.752040816326,
                5457.888775510204,
                5490.025510204081,
                5522.162244897959,
                5554.2989795918365,
                5586.435714285713,
                5618.572448979591,
                5650.709183673469,
                5682.845918367347,
                5714.9826530612245,
                5747.119387755101,
                5779.256122448979,
                5811.392857142857,
                5843.529591836734,
                5875.6663265306115,
                5907.803061224489,
                5939.939795918367,
                5972.076530612245,
                6004.213265306122,
                6036.349999999999
            ],
            "pnl": [
                810951.076415989,
                780214.6800946206,
                749478.2837732522,
                718741.8874518847,
                688005.4911305163,
                657269.0948091476,
                626532.6984877739,
                595796.3021663036,
                565059.9058433016,
                534323.5095002643,
                503587.1129380497,
                472850.7143621262,
                442114.3001738025,
                411377.7833323635,
                380640.6911126463,
                349900.8348619926,
                319149.5362602253,
                288357.1957810461,
                257436.64384994528,
                226165.62143785285,
                194052.92786027398,
                160158.62170447508,
                122931.5476842538,
                80181.75949927085,
                29302.329141119677,
                -32252.209841182106,
                -106395.74020633461,
                -194014.77619591355,
                -294926.3716423094,
                -408142.60994936986,
                -532222.9290769079,
                -665521.4165573106,
                -806300.163525758,
                -952802.8105944776,
                -1103367.8996449872,
                -1256570.3610601865,
                -1411324.162839173,
                -1566900.1167784822,
                -1722867.526185508,
                -1879002.2202843786,
                -2035201.0807015654,
                -2191422.0489936755,
                -2347649.8666081424,
                -2503879.594827244,
                -2660109.803584647,
                -2816340.1214750973,
                -2972570.4617787823,
                -3128800.806251419,
                -3285031.151427397,
                -3441261.4967111745
            ]
        },
        "max_pain_profile": {
            "strikes": [
                5225.0,
                5250.0,
                5300.0,
                5400.0,
                5450.0
            ],
            "loss": [
                0.0,
                6875.0,
                30875.0,
                289875.0,
                431625.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5300.0,
                "options": [
                    {
                        "Strike": 5225.0,
                        "Call_Now": 51.516870147962436,
                        "Call_Sim": 89.28255229526712,
                        "Call_Chg": 73.3074079206234,
                        "Put_Now": 21.300333106582002,
                        "Put_Sim": 8.066015253886462,
                        "Put_Chg": -62.13197599527687
                    },
                    {
                        "Strike": 5249.0,
                        "Call_Now": 37.60402193365144,
                        "Call_Sim": 70.46357451675067,
                        "Call_Chg": 87.3830800361638,
                        "Put_Now": 31.358930463755314,
                        "Put_Sim": 13.218483046855454,
                        "Put_Chg": -57.84778737229769
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 16.71139075272481,
                        "Call_Sim": 37.969387740208276,
                        "Call_Chg": 127.20662990910752,
                        "Put_Now": 61.40562112223324,
                        "Put_Sim": 31.663618109716026,
                        "Put_Chg": -48.43531010510124
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5225.0,
                "options": [
                    {
                        "Strike": 5225.0,
                        "Call_Now": 51.516870147962436,
                        "Call_Sim": 37.432085083507445,
                        "Call_Chg": -27.34014124693882,
                        "Put_Now": 21.300333106582002,
                        "Put_Sim": 31.215548042126102,
                        "Put_Chg": 46.54957688187611
                    },
                    {
                        "Strike": 5249.0,
                        "Call_Now": 37.60402193365144,
                        "Call_Sim": 26.163627555334187,
                        "Call_Chg": -30.423326522100986,
                        "Put_Now": 31.358930463755314,
                        "Put_Sim": 43.91853608543852,
                        "Put_Chg": 40.051128772391046
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 16.71139075272481,
                        "Call_Sim": 10.484049871475918,
                        "Call_Chg": -37.2640492547487,
                        "Put_Now": 61.40562112223324,
                        "Put_Sim": 79.17828024098526,
                        "Put_Chg": 28.943049176839995
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5225.0,
                "options": [
                    {
                        "Strike": 5225.0,
                        "Call_Now": 51.516870147962436,
                        "Call_Sim": 37.432085083507445,
                        "Call_Chg": -27.34014124693882,
                        "Put_Now": 21.300333106582002,
                        "Put_Sim": 31.215548042126102,
                        "Put_Chg": 46.54957688187611
                    },
                    {
                        "Strike": 5249.0,
                        "Call_Now": 37.60402193365144,
                        "Call_Sim": 26.163627555334187,
                        "Call_Chg": -30.423326522100986,
                        "Put_Now": 31.358930463755314,
                        "Put_Sim": 43.91853608543852,
                        "Put_Chg": 40.051128772391046
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 16.71139075272481,
                        "Call_Sim": 10.484049871475918,
                        "Call_Chg": -37.2640492547487,
                        "Put_Now": 61.40562112223324,
                        "Put_Sim": 79.17828024098526,
                        "Put_Chg": 28.943049176839995
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5301.49,
                "options": [
                    {
                        "Strike": 5225.0,
                        "Call_Now": 51.516870147962436,
                        "Call_Sim": 90.52011855840829,
                        "Call_Chg": 75.70966228814753,
                        "Put_Now": 21.300333106582002,
                        "Put_Sim": 7.813581517028183,
                        "Put_Chg": -63.317092376298504
                    },
                    {
                        "Strike": 5249.0,
                        "Call_Now": 37.60402193365144,
                        "Call_Sim": 71.58254418809747,
                        "Call_Chg": 90.35874490871684,
                        "Put_Now": 31.358930463755314,
                        "Put_Sim": 12.847452718202021,
                        "Put_Chg": -59.030960150088276
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 16.71139075272481,
                        "Call_Sim": 38.76734686853479,
                        "Call_Chg": 131.98157138545594,
                        "Put_Now": 61.40562112223324,
                        "Put_Sim": 30.971577238043665,
                        "Put_Chg": -49.56230932605984
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5196.51,
                "options": [
                    {
                        "Strike": 5225.0,
                        "Call_Now": 51.516870147962436,
                        "Call_Sim": 24.153736728099375,
                        "Call_Chg": -53.11489875311322,
                        "Put_Now": 21.300333106582002,
                        "Put_Sim": 46.42719968671872,
                        "Put_Chg": 117.96466493931159
                    },
                    {
                        "Strike": 5249.0,
                        "Call_Now": 37.60402193365144,
                        "Call_Sim": 15.9528503536078,
                        "Call_Chg": -57.57674436592176,
                        "Put_Now": 31.358930463755314,
                        "Put_Sim": 62.197758883712595,
                        "Put_Chg": 98.34145477506266
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 16.71139075272481,
                        "Call_Sim": 5.5993332280236245,
                        "Call_Chg": -66.49391238062789,
                        "Put_Now": 61.40562112223324,
                        "Put_Sim": 102.78356359753252,
                        "Put_Chg": 67.38461678114595
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            0.06355563189101177,
            0.06983250405227757,
            1.0,
            0.08472990361021032,
            0.12798244999809263
        ]
    },
    "delta_data": {
        "strikes": [
            5225.0,
            5250.0,
            5300.0,
            5400.0,
            5450.0
        ],
        "delta_values": [
            176.1103160967669,
            108.14407732043753,
            693.3601242521694,
            65.1932026785131,
            14.648961227837601
        ],
        "delta_cumulative": [
            176.1103160967669,
            284.2543934172044,
            977.6145176693738,
            1042.807720347887,
            1057.4566815757246
        ]
    },
    "gamma_data": {
        "strikes": [
            5225.0,
            5250.0,
            5300.0,
            5400.0,
            5450.0
        ],
        "gamma_values": [
            3129095.0661030235,
            2482407.6713157864,
            20940009.707759436,
            1132621.8363977023,
            1139640.6082288343
        ],
        "gamma_call": [
            3129095.0661030235,
            2482407.6713157864,
            20940009.707759436,
            1132621.8363977023,
            1139640.6082288343
        ],
        "gamma_put": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            3129095.0661030235,
            5611502.73741881,
            26551512.445178248,
            27684134.28157595,
            28823774.889804788
        ]
    },
    "volume_data": {
        "strikes": [
            5225.0,
            5250.0,
            5300.0,
            5400.0,
            5450.0
        ],
        "call_volume": [
            275.0,
            205.0,
            2110.0,
            245.0,
            1070.0
        ],
        "put_volume": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_volume": [
            275.0,
            205.0,
            2110.0,
            245.0,
            1070.0
        ]
    },
    "volatility_data": {
        "strikes": [
            5225.0,
            5250.0,
            5300.0,
            5400.0,
            5450.0
        ],
        "iv_values": [
            10.65,
            10.65,
            10.65,
            10.65,
            10.65
        ],
        "skew": [
            0.0,
            -1.0842021724855044e-19,
            -5.421010862427522e-20,
            0.0,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            5225.0,
            5250.0,
            5300.0,
            5400.0,
            5450.0
        ],
        "charm": [
            -437.7145041452974,
            158.90076856677905,
            9225.273529660679,
            352.298318173197,
            1841.492851470371
        ],
        "vanna": [
            -333.90537015272156,
            -40.73542497809243,
            3281.3993079018665,
            500.7983512460253,
            776.9183143883699
        ],
        "vex": [
            83296.28715287204,
            66081.51489559257,
            726621.725769944,
            140701.45778895306,
            30337.151588150988
        ],
        "theta": [
            -919.856911557382,
            -697.5937989794891,
            -5659.313676080363,
            -334.0392700974394,
            -284.41114272388023
        ],
        "charm_cum": [
            -437.7145041452974,
            -278.81373557851833,
            8946.45979408216,
            9298.758112255357,
            11140.250963725728
        ],
        "vanna_cum": [
            -333.90537015272156,
            -374.640795130814,
            2906.7585127710527,
            3407.5568640170777,
            4184.475178405448
        ],
        "theta_cum": [
            -919.856911557382,
            -1617.4507105368712,
            -7276.764386617234,
            -7610.803656714674,
            -7895.214799438554
        ],
        "r_gamma": [
            3129095.0661030235,
            -2482407.6713157864,
            -20940009.707759436,
            -1132621.8363977023,
            -1139640.6082288343
        ],
        "r_gamma_cum": [
            3129095.0661030235,
            646687.394787237,
            -20293322.3129722,
            -21425944.149369903,
            -22565584.757598735
        ]
    },
    "detailed_data": [
        {
            "strike": 5225.0,
            "delta": 176.1103160967669,
            "gamma": 3129095.0661030235,
            "volume": 0,
            "oi": 275,
            "iv": 10.65
        },
        {
            "strike": 5250.0,
            "delta": 108.14407732043753,
            "gamma": 2482407.6713157864,
            "volume": 0,
            "oi": 205,
            "iv": 10.65
        },
        {
            "strike": 5300.0,
            "delta": 693.3601242521694,
            "gamma": 20940009.707759436,
            "volume": 0,
            "oi": 2110,
            "iv": 10.65
        },
        {
            "strike": 5400.0,
            "delta": 65.1932026785131,
            "gamma": 1132621.8363977023,
            "volume": 0,
            "oi": 245,
            "iv": 10.65
        },
        {
            "strike": 5450.0,
            "delta": 14.648961227837601,
            "gamma": 1139640.6082288343,
            "volume": 0,
            "oi": 1070,
            "iv": 10.65
        }
    ]
};