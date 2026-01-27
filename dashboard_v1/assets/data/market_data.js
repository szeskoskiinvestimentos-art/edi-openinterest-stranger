window.marketData = {
    "last_updated": "2026-01-27 08:18:34",
    "spot_price": 5288.5,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 27/01/2026 08:18\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  ModeloFlip(7);\n  spot(0);\n  // 1 = Classic (5225.00)\n  // 2 = Spline (5337.90)\n  // 3 = HVL (5225.00)\n  // 4 = HVL Log (5225.00)\n  // 5 = Sigma Kernel (5225.00)\n  // 6 = PVOP (5225.00)\n  // 7 = HVL Gaussian (5225.00)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5225.00;\n\n  if (ModeloFlip = 1) then GammaVal := 5225.00;\n  if (ModeloFlip = 2) then GammaVal := 5337.90;\n  if (ModeloFlip = 3) then GammaVal := 5225.00;\n  if (ModeloFlip = 4) then GammaVal := 5225.00;\n  if (ModeloFlip = 5) then GammaVal := 5225.00;\n  if (ModeloFlip = 6) then GammaVal := 5225.00;\n  if (ModeloFlip = 7) then GammaVal := 5225.00;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(5225.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5246.79, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5250.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5254.85, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5275.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5275.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5330.21, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5550.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5550.00, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5550.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5362.99 > 0) then\n      HorizontalLineCustom(5362.99, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(5237.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5262.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5412.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(5234.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5240.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5259.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5265.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5380.05, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5444.95, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5244.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5255.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5339.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5485.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5296.43, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5280.57, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5304.37, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5272.63, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5319.10, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5257.90, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5327.03, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5249.97, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 7970,
        "total_volume": 7970,
        "gamma_exposure": 80875897.55269276,
        "delta_position": -1557.2934404560424,
        "last_update": "2026-01-27T08:18:34.676375",
        "spot_price": 5288.5,
        "dealer_pressure": -0.12224170043907079,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 5225.0,
        "gamma_flip_hvl": 5225.0,
        "gamma_flip_hvl_gaussian": 5225.0,
        "call_wall": 5550.0,
        "put_wall": 5250.0,
        "effective_call_wall": 5550.0,
        "effective_put_wall": 5254.847908745247,
        "max_pain": 5275.0,
        "zero_gamma": 5225.0,
        "range_low": 5246.79034792304,
        "range_high": 5330.209652076961,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5330.209652076961,
                "sigma_1_down": 5246.790347923039,
                "sigma_2_up": 5371.919304153921,
                "sigma_2_down": 5205.080695846079
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5381.76561736195,
                "sigma_1_down": 5195.23438263805,
                "sigma_2_up": 5475.031234723899,
                "sigma_2_down": 5101.968765276101
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 3.0,
                "sigma_1_up": 5360.743236563317,
                "sigma_1_down": 5216.256763436683,
                "sigma_2_up": 5432.986473126633,
                "sigma_2_down": 5144.013526873367
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
                4495.224999999999,
                4527.603571428571,
                4559.982142857142,
                4592.360714285714,
                4624.739285714285,
                4657.117857142856,
                4689.496428571428,
                4721.874999999999,
                4754.253571428571,
                4786.632142857143,
                4819.010714285714,
                4851.3892857142855,
                4883.767857142857,
                4916.146428571428,
                4948.525,
                4980.903571428571,
                5013.282142857142,
                5045.660714285714,
                5078.039285714285,
                5110.4178571428565,
                5142.796428571428,
                5175.174999999999,
                5207.553571428571,
                5239.932142857142,
                5272.310714285713,
                5304.689285714285,
                5337.067857142857,
                5369.446428571428,
                5401.825,
                5434.203571428571,
                5466.582142857143,
                5498.960714285714,
                5531.339285714285,
                5563.717857142857,
                5596.096428571428,
                5628.474999999999,
                5660.853571428571,
                5693.232142857142,
                5725.6107142857145,
                5757.989285714286,
                5790.367857142857,
                5822.746428571429,
                5855.125,
                5887.503571428571,
                5919.882142857143,
                5952.260714285714,
                5984.6392857142855,
                6017.017857142857,
                6049.396428571428,
                6081.775
            ],
            "deltas": [
                -6269.999952935058,
                -6269.999865996998,
                -6269.999634160213,
                -6269.999041439138,
                -6269.997587396371,
                -6269.994161952153,
                -6269.986406361315,
                -6269.96951720246,
                -6269.9341154321055,
                -6269.862635012776,
                -6269.723506951999,
                -6269.462242844979,
                -6268.988055442429,
                -6268.150645524479,
                -6266.673063118295,
                -6263.859558178741,
                -6257.378227768214,
                -6239.296909006724,
                -6186.844949802033,
                -6049.019946246246,
                -5741.591433882483,
                -5172.765774671992,
                -4305.21487679382,
                -3214.188059244826,
                -2078.5622034534254,
                -1093.0738038004608,
                -370.03267926537745,
                92.11302991139928,
                366.9407985228926,
                538.3910612377396,
                665.1916213795784,
                776.8191515444909,
                883.7900158768462,
                987.8723707582494,
                1087.851187127921,
                1181.9139450088983,
                1268.4556356420624,
                1346.3186126645178,
                1414.8472634863965,
                1473.8684238225737,
                1523.6303151240984,
                1564.7165162295025,
                1597.9486588077843,
                1624.2897714320566,
                1644.7575378207275,
                1660.3534774286172,
                1672.0107971889831,
                1680.560882540949,
                1686.716371146127,
                1691.0675611129889
            ],
            "flip_value": 5362.992861526955
        },
        "flow_sentiment": {
            "bull": [
                1000.0,
                0.0,
                0.0,
                0.0
            ],
            "bear": [
                -0.0,
                -2000.0,
                -1000.0,
                -1000.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4495.224999999999,
                4527.603571428571,
                4559.982142857142,
                4592.360714285714,
                4624.739285714285,
                4657.117857142856,
                4689.496428571428,
                4721.874999999999,
                4754.253571428571,
                4786.632142857143,
                4819.010714285714,
                4851.3892857142855,
                4883.767857142857,
                4916.146428571428,
                4948.525,
                4980.903571428571,
                5013.282142857142,
                5045.660714285714,
                5078.039285714285,
                5110.4178571428565,
                5142.796428571428,
                5175.174999999999,
                5207.553571428571,
                5239.932142857142,
                5272.310714285713,
                5304.689285714285,
                5337.067857142857,
                5369.446428571428,
                5401.825,
                5434.203571428571,
                5466.582142857143,
                5498.960714285714,
                5531.339285714285,
                5563.717857142857,
                5596.096428571428,
                5628.474999999999,
                5660.853571428571,
                5693.232142857142,
                5725.6107142857145,
                5757.989285714286,
                5790.367857142857,
                5822.746428571429,
                5855.125,
                5887.503571428571,
                5919.882142857143,
                5952.260714285714,
                5984.6392857142855,
                6017.017857142857,
                6049.396428571428,
                6081.775
            ],
            "pnl": [
                -6038737.2824921105,
                -5778274.958618243,
                -5517812.634744377,
                -5257350.310870511,
                -4996887.986996645,
                -4736425.663122779,
                -4475963.3392489115,
                -4215501.015375041,
                -3955038.691501216,
                -3694576.3676286614,
                -3434114.0437875497,
                -3173651.720551949,
                -2913189.406443331,
                -2652727.200588198,
                -2392266.0102021727,
                -2131812.390008991,
                -1871403.828316397,
                -1611210.3477138109,
                -1351843.7166056281,
                -1095047.5746161672,
                -844738.7778334615,
                -607771.8056625631,
                -393245.7898405349,
                -209699.7346203672,
                -61377.83183289209,
                53841.07116908861,
                143230.52739399963,
                215717.45204823505,
                278555.54508179985,
                335756.05370317167,
                388209.4303602546,
                434723.5013515038,
                473398.2889721225,
                502946.5875203324,
                523507.4357872559,
                536627.1159242357,
                544561.2091616375,
                549446.2396291234,
                552814.581088578,
                555542.9875758073,
                558041.7729039489,
                560470.3108386137,
                562880.480233977,
                565286.5342650623,
                567691.7963883316,
                570096.9273223573,
                572502.0395027412,
                574907.1493645223,
                577312.258977825,
                579717.3685679926
            ]
        },
        "max_pain_profile": {
            "strikes": [
                5225.0,
                5250.0,
                5275.0,
                5550.0
            ],
            "loss": [
                157000.0,
                25500.0,
                0.0,
                0.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5550.0,
                "options": [
                    {
                        "Strike": 5225.0,
                        "Call_Now": 73.45785482382416,
                        "Call_Sim": 328.10925536377636,
                        "Call_Chg": 346.6632685513198,
                        "Put_Now": 6.8486612232441075,
                        "Put_Sim": 6.176319706112723e-05,
                        "Put_Chg": -99.99909817123307
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 54.192307337482816,
                        "Call_Sim": 303.1243895924299,
                        "Call_Chg": 459.3494805539862,
                        "Put_Now": 12.568237212498389,
                        "Put_Sim": 0.0003194674453181473,
                        "Put_Chg": -99.99745813641232
                    },
                    {
                        "Strike": 5288.5,
                        "Call_Now": 30.41292013748989,
                        "Call_Sim": 264.65016122181714,
                        "Call_Chg": 770.1899062154965,
                        "Put_Now": 27.265940164922085,
                        "Put_Sim": 0.003181249250795104,
                        "Put_Chg": -99.98833251583642
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 0.004511071223765262,
                        "Call_Sim": 31.91674515705199,
                        "Call_Chg": 0.0,
                        "Put_Now": 258.201922653383,
                        "Put_Sim": 28.614156739211012,
                        "Put_Chg": -88.91791492287864
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 5225.0,
                        "Call_Now": 73.45785482382416,
                        "Call_Sim": 44.764393185360404,
                        "Call_Chg": -39.061121111254906,
                        "Put_Now": 6.8486612232441075,
                        "Put_Sim": 16.655199584780576,
                        "Put_Chg": 143.18912911407318
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 54.192307337482816,
                        "Call_Sim": 30.191515689103653,
                        "Call_Chg": -44.288189279179676,
                        "Put_Now": 12.568237212498389,
                        "Put_Sim": 27.06744556411877,
                        "Put_Chg": 115.36389794745243
                    },
                    {
                        "Strike": 5288.5,
                        "Call_Now": 30.41292013748989,
                        "Call_Sim": 14.427124922305666,
                        "Call_Chg": -52.562513375618266,
                        "Put_Now": 27.265940164922085,
                        "Put_Sim": 49.780144949738315,
                        "Put_Chg": 82.5726332876685
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 0.004511071223765262,
                        "Call_Sim": 0.00047265796336179444,
                        "Call_Chg": 0.0,
                        "Put_Now": 258.201922653383,
                        "Put_Sim": 296.6978842401222,
                        "Put_Chg": 14.909246682263166
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5225.0,
                "options": [
                    {
                        "Strike": 5225.0,
                        "Call_Now": 73.45785482382416,
                        "Call_Sim": 30.047746566774094,
                        "Call_Chg": -59.09525722083993,
                        "Put_Now": 6.8486612232441075,
                        "Put_Sim": 26.938552966194493,
                        "Put_Chg": 293.34042213631506
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 54.192307337482816,
                        "Call_Sim": 18.920517999089043,
                        "Call_Chg": -65.08633987244455,
                        "Put_Now": 12.568237212498389,
                        "Put_Sim": 40.79644787410507,
                        "Put_Chg": 224.59960123552847
                    },
                    {
                        "Strike": 5288.5,
                        "Call_Now": 30.41292013748989,
                        "Call_Sim": 8.026939650711483,
                        "Call_Chg": -73.60681047915321,
                        "Put_Now": 27.265940164922085,
                        "Put_Sim": 68.37995967814459,
                        "Put_Chg": 150.78893030842968
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 0.004511071223765262,
                        "Call_Sim": 9.398596968152734e-05,
                        "Call_Chg": 0.0,
                        "Put_Now": 258.201922653383,
                        "Put_Sim": 321.6975055681287,
                        "Put_Chg": 24.591444657824567
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5341.385,
                "options": [
                    {
                        "Strike": 5225.0,
                        "Call_Now": 73.45785482382416,
                        "Call_Sim": 120.96077649057406,
                        "Call_Chg": 64.66690564362023,
                        "Put_Now": 6.8486612232441075,
                        "Put_Sim": 1.4665828899931626,
                        "Put_Chg": -78.58584558080295
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 54.192307337482816,
                        "Call_Sim": 97.75381407047462,
                        "Call_Chg": 80.38319251053908,
                        "Put_Now": 12.568237212498389,
                        "Put_Sim": 3.2447439454903133,
                        "Put_Chg": -74.18298293842193
                    },
                    {
                        "Strike": 5288.5,
                        "Call_Now": 30.41292013748989,
                        "Call_Sim": 65.19592678814661,
                        "Call_Chg": 114.36917761731087,
                        "Put_Now": 27.265940164922085,
                        "Put_Sim": 9.16394681557972,
                        "Put_Chg": -66.39049759461722
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 0.004511071223765262,
                        "Call_Sim": 0.06444356330979772,
                        "Call_Chg": 0.0,
                        "Put_Now": 258.201922653383,
                        "Put_Sim": 205.37685514546865,
                        "Put_Chg": -20.45882035465247
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5235.615,
                "options": [
                    {
                        "Strike": 5225.0,
                        "Call_Now": 73.45785482382416,
                        "Call_Sim": 35.881533351780945,
                        "Call_Chg": -51.15357855489173,
                        "Put_Now": 6.8486612232441075,
                        "Put_Sim": 22.15733975120156,
                        "Put_Chg": 223.52804480969732
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 54.192307337482816,
                        "Call_Sim": 23.285224002008817,
                        "Call_Chg": -57.032233639730464,
                        "Put_Now": 12.568237212498389,
                        "Put_Sim": 34.54615387702461,
                        "Put_Chg": 174.868728946892
                    },
                    {
                        "Strike": 5288.5,
                        "Call_Now": 30.41292013748989,
                        "Call_Sim": 10.404288584518099,
                        "Call_Chg": -65.78990594299174,
                        "Put_Now": 27.265940164922085,
                        "Put_Sim": 60.14230861195074,
                        "Put_Chg": 120.57669109581792
                    },
                    {
                        "Strike": 5550.0,
                        "Call_Now": 0.004511071223765262,
                        "Call_Sim": 0.00018936538913927325,
                        "Call_Chg": 0.0,
                        "Put_Now": 258.201922653383,
                        "Put_Sim": 311.0826009475486,
                        "Put_Chg": 20.480358066564047
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.14161756703630474,
            -0.5,
            -0.06546253521920066,
            0.21811330049922215
        ]
    },
    "delta_data": {
        "strikes": [
            5225.0,
            5250.0,
            5275.0,
            5550.0
        ],
        "delta_values": [
            -176.72150894544973,
            -1183.7288583893217,
            -414.2525196886287,
            217.4094465673575
        ],
        "delta_cumulative": [
            -176.72150894544973,
            -1360.4503673347713,
            -1774.7028870233999,
            -1557.2934404560424
        ]
    },
    "gamma_data": {
        "strikes": [
            5225.0,
            5250.0,
            5275.0,
            5550.0
        ],
        "gamma_values": [
            9528477.819436803,
            52167267.00080698,
            14479910.834952926,
            4700241.897496043
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            4700241.897496043
        ],
        "gamma_put": [
            9528477.819436803,
            52167267.00080698,
            14479910.834952926,
            0.0
        ],
        "gamma_exposure": [
            9528477.819436803,
            61695744.82024378,
            76175655.65519671,
            80875897.55269276
        ]
    },
    "volume_data": {
        "strikes": [
            5225.0,
            5250.0,
            5275.0,
            5550.0
        ],
        "call_volume": [
            0.0,
            0.0,
            0.0,
            1700.0
        ],
        "put_volume": [
            1010.0,
            4240.0,
            1020.0,
            0.0
        ],
        "total_volume": [
            1010.0,
            4240.0,
            1020.0,
            1700.0
        ]
    },
    "volatility_data": {
        "strikes": [
            5225.0,
            5250.0,
            5275.0,
            5550.0
        ],
        "iv_values": [
            12.520000000000001,
            12.520000000000001,
            12.520000000000001,
            12.520000000000001
        ],
        "skew": [
            0.0,
            0.0,
            -4.0657581468206416e-20,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            5225.0,
            5250.0,
            5275.0,
            5550.0
        ],
        "charm": [
            -9480.48552680048,
            -30931.7688207175,
            -2490.9886187613192,
            2757.5157824918597
        ],
        "vanna": [
            -1916.548028423626,
            -6533.676991942871,
            -711.7122561423223,
            3329.173130577635
        ],
        "vex": [
            150214.22951192997,
            822404.7919054218,
            228272.41566717136,
            568086.3287303537
        ],
        "theta": [
            -2947.6629447256287,
            -15908.180111455651,
            -4324.312801385037,
            -1770.075357423789
        ],
        "charm_cum": [
            -9480.48552680048,
            -40412.254347517985,
            -42903.2429662793,
            -40145.72718378744
        ],
        "vanna_cum": [
            -1916.548028423626,
            -8450.225020366497,
            -9161.93727650882,
            -5832.7641459311835
        ],
        "theta_cum": [
            -2947.6629447256287,
            -18855.84305618128,
            -23180.155857566315,
            -24950.231214990104
        ],
        "r_gamma": [
            9528477.819436803,
            52167267.00080698,
            14479910.834952926,
            -4700241.897496043
        ],
        "r_gamma_cum": [
            9528477.819436803,
            61695744.82024378,
            76175655.65519671,
            71475413.75770067
        ]
    },
    "detailed_data": [
        {
            "strike": 5225.0,
            "delta": -176.72150894544973,
            "gamma": 9528477.819436803,
            "volume": 0,
            "oi": 1010,
            "iv": 12.520000000000001
        },
        {
            "strike": 5250.0,
            "delta": -1183.7288583893217,
            "gamma": 52167267.00080698,
            "volume": 0,
            "oi": 4240,
            "iv": 12.520000000000001
        },
        {
            "strike": 5275.0,
            "delta": -414.2525196886287,
            "gamma": 14479910.834952926,
            "volume": 0,
            "oi": 1020,
            "iv": 12.520000000000001
        },
        {
            "strike": 5550.0,
            "delta": 217.4094465673575,
            "gamma": 4700241.897496043,
            "volume": 0,
            "oi": 1700,
            "iv": 12.520000000000001
        }
    ]
};