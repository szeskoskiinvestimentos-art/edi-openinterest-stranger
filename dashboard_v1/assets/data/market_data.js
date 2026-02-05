window.marketData = {
    "last_updated": "2026-02-05 08:27:54",
    "spot_price": 5266.0,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 05/02/2026 08:27\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  ModeloFlip(7);\n  spot(0);\n  // 1 = Classic (5800.00)\n  // 2 = Spline (5800.00)\n  // 3 = HVL (5800.00)\n  // 4 = HVL Log (5100.00)\n  // 5 = Sigma Kernel (5100.00)\n  // 6 = PVOP (5800.00)\n  // 7 = HVL Gaussian (5800.00)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5800.00;\n\n  if (ModeloFlip = 1) then GammaVal := 5800.00;\n  if (ModeloFlip = 2) then GammaVal := 5800.00;\n  if (ModeloFlip = 3) then GammaVal := 5800.00;\n  if (ModeloFlip = 4) then GammaVal := 5100.00;\n  if (ModeloFlip = 5) then GammaVal := 5100.00;\n  if (ModeloFlip = 6) then GammaVal := 5800.00;\n  if (ModeloFlip = 7) then GammaVal := 5800.00;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5100.00, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5100.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5100.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5233.46, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5298.54, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5500.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5600.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5680.77, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5800.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5235.29 > 0) then\n      HorizontalLineCustom(5235.29, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5550.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5700.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(5157.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5192.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5345.50, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5404.50, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5538.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5561.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5676.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5723.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(5135.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5214.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5309.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5441.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5523.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5647.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5752.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5273.90, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5258.10, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5281.80, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5250.20, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5296.47, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5235.53, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5304.37, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5227.63, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "positive"
    },
    "overview": {
        "total_trades": 5260,
        "total_volume": 5260,
        "gamma_exposure": 12679800.595642585,
        "delta_position": 161.05573021147197,
        "last_update": "2026-02-05T08:27:54.134684",
        "spot_price": 5266.0,
        "dealer_pressure": 0.11562016759101747,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 5100.0,
        "gamma_flip_hvl": 5100.0,
        "gamma_flip_hvl_gaussian": 5800.0,
        "call_wall": 5500.0,
        "put_wall": 5100.0,
        "effective_call_wall": 5680.7692307692305,
        "effective_put_wall": 5100.0,
        "max_pain": 5100.0,
        "zero_gamma": 5100.0,
        "range_low": 5233.457599041932,
        "range_high": 5298.542400958069,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5298.542400958068,
                "sigma_1_down": 5233.457599041932,
                "sigma_2_up": 5331.084801916138,
                "sigma_2_down": 5200.915198083862
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5338.767020693296,
                "sigma_1_down": 5193.232979306704,
                "sigma_2_up": 5411.534041386592,
                "sigma_2_down": 5120.465958613408
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 16.0,
                "sigma_1_up": 5396.169603832275,
                "sigma_1_down": 5135.830396167725,
                "sigma_2_up": 5526.3392076645505,
                "sigma_2_down": 5005.6607923354495
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
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4476.099999999999,
                4508.34081632653,
                4540.58163265306,
                4572.822448979591,
                4605.063265306122,
                4637.304081632653,
                4669.544897959183,
                4701.785714285714,
                4734.026530612245,
                4766.267346938775,
                4798.5081632653055,
                4830.748979591836,
                4862.989795918367,
                4895.230612244897,
                4927.471428571428,
                4959.712244897959,
                4991.953061224489,
                5024.19387755102,
                5056.434693877551,
                5088.675510204081,
                5120.9163265306115,
                5153.157142857142,
                5185.397959183673,
                5217.638775510203,
                5249.879591836734,
                5282.120408163265,
                5314.361224489796,
                5346.602040816326,
                5378.842857142857,
                5411.083673469388,
                5443.3244897959175,
                5475.565306122448,
                5507.806122448979,
                5540.046938775509,
                5572.28775510204,
                5604.528571428571,
                5636.769387755101,
                5669.010204081632,
                5701.251020408163,
                5733.491836734694,
                5765.7326530612245,
                5797.973469387754,
                5830.214285714285,
                5862.455102040816,
                5894.695918367346,
                5926.936734693877,
                5959.177551020408,
                5991.418367346938,
                6023.659183673469,
                6055.9
            ],
            "deltas": [
                -2299.9995801854175,
                -2299.9982909898613,
                -2299.9933913511154,
                -2299.9760629145276,
                -2299.919399855757,
                -2299.7485864090404,
                -2299.2743134289176,
                -2298.0612025673804,
                -2295.2004245529993,
                -2288.973511190695,
                -2276.4465796972545,
                -2253.121138613488,
                -2212.859194632368,
                -2148.332733033429,
                -2052.15065995057,
                -1918.5687682694477,
                -1745.3663382526036,
                -1535.24143674601,
                -1296.1035186164165,
                -1039.9782812797482,
                -780.7588486099512,
                -531.4889777299599,
                -302.0221431890409,
                -97.70052568163919,
                80.73359269105056,
                236.2193098212829,
                373.9342251859603,
                499.8282037786312,
                619.4784781439097,
                737.3987795449489,
                856.7657956535338,
                979.4406917088652,
                1106.1521947687236,
                1236.738151072488,
                1370.3836213374739,
                1505.8276234807029,
                1641.5321815471732,
                1775.8179914803466,
                1906.9744167406552,
                2033.3508878977616,
                2153.4343008392343,
                2265.914105257404,
                2369.7343625701815,
                2464.1306656222537,
                2548.6496369124325,
                2623.149627507131,
                2687.782862536613,
                2742.9611479576724,
                2789.3089100446537,
                2827.6084426131047
            ],
            "flip_value": 5235.292040100151
        },
        "flow_sentiment": {
            "bull": [
                2000.0,
                50.0,
                0.0,
                0.0,
                0.0
            ],
            "bear": [
                -0.0,
                -0.0,
                -0.0,
                -20.0,
                -1000.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4476.099999999999,
                4508.34081632653,
                4540.58163265306,
                4572.822448979591,
                4605.063265306122,
                4637.304081632653,
                4669.544897959183,
                4701.785714285714,
                4734.026530612245,
                4766.267346938775,
                4798.5081632653055,
                4830.748979591836,
                4862.989795918367,
                4895.230612244897,
                4927.471428571428,
                4959.712244897959,
                4991.953061224489,
                5024.19387755102,
                5056.434693877551,
                5088.675510204081,
                5120.9163265306115,
                5153.157142857142,
                5185.397959183673,
                5217.638775510203,
                5249.879591836734,
                5282.120408163265,
                5314.361224489796,
                5346.602040816326,
                5378.842857142857,
                5411.083673469388,
                5443.3244897959175,
                5475.565306122448,
                5507.806122448979,
                5540.046938775509,
                5572.28775510204,
                5604.528571428571,
                5636.769387755101,
                5669.010204081632,
                5701.251020408163,
                5733.491836734694,
                5765.7326530612245,
                5797.973469387754,
                5830.214285714285,
                5862.455102040816,
                5894.695918367346,
                5926.936734693877,
                5959.177551020408,
                5991.418367346938,
                6023.659183673469,
                6055.9
            ],
            "pnl": [
                -1370328.5240096843,
                -1296192.962178435,
                -1222057.4788012067,
                -1147922.291777403,
                -1073788.1277722402,
                -999657.196861287,
                -925535.636794858,
                -851439.0291121633,
                -777403.5648888579,
                -703506.2059159826,
                -629896.8504501823,
                -556842.8974147468,
                -484780.9812075409,
                -414362.837305781,
                -346475.35642395273,
                -282213.6336473667,
                -222794.15664297965,
                -169413.1285878042,
                -123076.52975504768,
                -84444.2709592473,
                -53732.19099486107,
                -30700.501895060585,
                -14731.422537213617,
                -4972.934690321457,
                -509.7035000207361,
                -520.4493413985729,
                -4391.16183488788,
                -11769.455766097239,
                -22561.046654373673,
                -36881.09636565138,
                -54979.8459470034,
                -77163.63136068096,
                -103729.52804109048,
                -134925.20661038137,
                -170936.54337276059,
                -211896.50584081982,
                -257902.64523792293,
                -309029.30497825623,
                -365324.77003791975,
                -426791.3099839349,
                -493354.23279409885,
                -564831.4073350999,
                -640915.2876942513,
                -721175.412877668,
                -805082.6340218701,
                -892049.725838882,
                -981478.9118650996,
                -1072806.1970875913,
                -1165534.8072705492,
                -1259254.0555781748
            ]
        },
        "max_pain_profile": {
            "strikes": [
                5100.0,
                5250.0,
                5500.0,
                5600.0,
                5800.0
            ],
            "loss": [
                0.0,
                0.0,
                50000.0,
                163000.0,
                473000.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5500.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 186.60974831667954,
                        "Call_Sim": 416.19058102935287,
                        "Call_Chg": 123.0272452450186,
                        "Put_Now": 4.444944121441097,
                        "Put_Sim": 0.025776834115800895,
                        "Put_Chg": -99.42008643052539
                    },
                    {
                        "Strike": 5266.0,
                        "Call_Now": 60.61898187226325,
                        "Call_Sim": 252.20828968030128,
                        "Call_Chg": 316.0549746806312,
                        "Put_Now": 43.92802914831691,
                        "Put_Sim": 1.517336956355166,
                        "Put_Chg": -96.54585697156573
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.872039905398651,
                        "Call_Sim": 63.31264722701235,
                        "Call_Chg": 2104.4487302562147,
                        "Put_Now": 219.4394079301419,
                        "Put_Sim": 45.880015251755594,
                        "Put_Chg": -79.0921714178333
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 186.60974831667954,
                        "Call_Sim": 58.70809106504794,
                        "Call_Chg": -68.5396440461302,
                        "Put_Now": 4.444944121441097,
                        "Put_Sim": 42.54328686980989,
                        "Put_Chg": 857.1163485406632
                    },
                    {
                        "Strike": 5266.0,
                        "Call_Now": 60.61898187226325,
                        "Call_Sim": 7.668735032638324,
                        "Call_Chg": -87.34928434001425,
                        "Put_Now": 43.92802914831691,
                        "Put_Sim": 156.97778230869244,
                        "Put_Chg": 257.3522084923926
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.872039905398651,
                        "Call_Sim": 0.06466301496575433,
                        "Call_Chg": -97.7485335477336,
                        "Put_Now": 219.4394079301419,
                        "Put_Sim": 382.63203103970864,
                        "Put_Chg": 74.3679654665851
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 186.60974831667954,
                        "Call_Sim": 58.70809106504794,
                        "Call_Chg": -68.5396440461302,
                        "Put_Now": 4.444944121441097,
                        "Put_Sim": 42.54328686980989,
                        "Put_Chg": 857.1163485406632
                    },
                    {
                        "Strike": 5266.0,
                        "Call_Now": 60.61898187226325,
                        "Call_Sim": 7.668735032638324,
                        "Call_Chg": -87.34928434001425,
                        "Put_Now": 43.92802914831691,
                        "Put_Sim": 156.97778230869244,
                        "Put_Chg": 257.3522084923926
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.872039905398651,
                        "Call_Sim": 0.06466301496575433,
                        "Call_Chg": -97.7485335477336,
                        "Put_Now": 219.4394079301419,
                        "Put_Sim": 382.63203103970864,
                        "Put_Chg": 74.3679654665851
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5318.66,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 186.60974831667954,
                        "Call_Sim": 236.5396221149149,
                        "Call_Chg": 26.756305203039876,
                        "Put_Now": 4.444944121441097,
                        "Put_Sim": 1.7148179196768751,
                        "Put_Chg": -61.42093414841594
                    },
                    {
                        "Strike": 5266.0,
                        "Call_Now": 60.61898187226325,
                        "Call_Sim": 93.95842021532053,
                        "Call_Chg": 54.99834756926533,
                        "Put_Now": 43.92802914831691,
                        "Put_Sim": 24.60746749137479,
                        "Put_Chg": -43.98230931715356
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.872039905398651,
                        "Call_Sim": 7.06985138835671,
                        "Call_Chg": 146.16132161211686,
                        "Put_Now": 219.4394079301419,
                        "Put_Sim": 170.977219413101,
                        "Put_Chg": -22.084542140429363
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5213.34,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 186.60974831667954,
                        "Call_Sim": 139.7555138239668,
                        "Call_Chg": -25.10813873088795,
                        "Put_Now": 4.444944121441097,
                        "Put_Sim": 10.250709628729169,
                        "Put_Chg": 130.61503921461636
                    },
                    {
                        "Strike": 5266.0,
                        "Call_Now": 60.61898187226325,
                        "Call_Sim": 35.5851689162605,
                        "Call_Chg": -41.29698682296278,
                        "Put_Now": 43.92802914831691,
                        "Put_Sim": 71.55421619231447,
                        "Put_Chg": 62.889657422875864
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.872039905398651,
                        "Call_Sim": 1.0154933499680254,
                        "Call_Chg": -64.6420877349519,
                        "Put_Now": 219.4394079301419,
                        "Put_Sim": 270.24286137471245,
                        "Put_Chg": 23.15147216435424
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.5,
            0.22377372958202296,
            0.5769789608728858,
            0.1617279799091611,
            0.1180997916053968
        ]
    },
    "delta_data": {
        "strikes": [
            5100.0,
            5250.0,
            5500.0,
            5600.0,
            5800.0
        ],
        "delta_values": [
            -173.4630772340563,
            120.81364016865474,
            165.22118512494748,
            34.08619692513065,
            14.397785226795374
        ],
        "delta_cumulative": [
            -173.4630772340563,
            -52.64943706540156,
            112.57174805954593,
            146.6579449846766,
            161.05573021147197
        ]
    },
    "gamma_data": {
        "strikes": [
            5100.0,
            5250.0,
            5500.0,
            5600.0,
            5800.0
        ],
        "gamma_values": [
            6613618.31222894,
            1558689.0756692633,
            3176689.849006936,
            828483.4252095054,
            502319.93352794007
        ],
        "gamma_call": [
            0.0,
            1558689.0756692633,
            3176689.849006936,
            828483.4252095054,
            502319.93352794007
        ],
        "gamma_put": [
            6613618.31222894,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            6613618.31222894,
            8172307.387898204,
            11348997.236905139,
            12177480.662114644,
            12679800.595642585
        ]
    },
    "volume_data": {
        "strikes": [
            5100.0,
            5250.0,
            5500.0,
            5600.0,
            5800.0
        ],
        "call_volume": [
            0.0,
            200.0,
            930.0,
            420.0,
            1410.0
        ],
        "put_volume": [
            2300.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_volume": [
            2300.0,
            200.0,
            930.0,
            420.0,
            1410.0
        ]
    },
    "volatility_data": {
        "strikes": [
            5100.0,
            5250.0,
            5500.0,
            5600.0,
            5800.0
        ],
        "iv_values": [
            9.81,
            9.81,
            9.81,
            9.81,
            9.81
        ],
        "skew": [
            0.0,
            0.0,
            -1.0842021724855044e-19,
            0.0,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            5100.0,
            5250.0,
            5500.0,
            5600.0,
            5800.0
        ],
        "charm": [
            -2974.771556369578,
            10.589791856190445,
            1090.1131214730294,
            383.2274577073049,
            349.2080664110109
        ],
        "vanna": [
            -4671.982375028418,
            -189.79509981796093,
            2376.410323516217,
            917.1695369512844,
            915.9650877457052
        ],
        "vex": [
            433848.82622966164,
            102248.93454853752,
            494923.105008955,
            129076.36840320556,
            78260.62757976129
        ],
        "theta": [
            -1146.7479793004145,
            -436.9214201168521,
            -807.9784297403536,
            -201.61778308829975,
            -115.86905894665236
        ],
        "charm_cum": [
            -2974.771556369578,
            -2964.1817645133874,
            -1874.068643040358,
            -1490.841185333053,
            -1141.6331189220423
        ],
        "vanna_cum": [
            -4671.982375028418,
            -4861.777474846379,
            -2485.367151330162,
            -1568.1976143788775,
            -652.2325266331723
        ],
        "theta_cum": [
            -1146.7479793004145,
            -1583.6693994172665,
            -2391.64782915762,
            -2593.26561224592,
            -2709.134671192572
        ],
        "r_gamma": [
            6613618.31222894,
            1558689.0756692633,
            -3176689.849006936,
            -828483.4252095054,
            -502319.93352794007
        ],
        "r_gamma_cum": [
            6613618.31222894,
            8172307.387898204,
            4995617.538891268,
            4167134.1136817625,
            3664814.1801538225
        ]
    },
    "detailed_data": [
        {
            "strike": 5100.0,
            "delta": -173.4630772340563,
            "gamma": 6613618.31222894,
            "volume": 0,
            "oi": 2300,
            "iv": 9.81
        },
        {
            "strike": 5250.0,
            "delta": 120.81364016865474,
            "gamma": 1558689.0756692633,
            "volume": 0,
            "oi": 200,
            "iv": 9.81
        },
        {
            "strike": 5500.0,
            "delta": 165.22118512494748,
            "gamma": 3176689.849006936,
            "volume": 0,
            "oi": 930,
            "iv": 9.81
        },
        {
            "strike": 5600.0,
            "delta": 34.08619692513065,
            "gamma": 828483.4252095054,
            "volume": 0,
            "oi": 420,
            "iv": 9.81
        },
        {
            "strike": 5800.0,
            "delta": 14.397785226795374,
            "gamma": 502319.93352794007,
            "volume": 0,
            "oi": 1410,
            "iv": 9.81
        }
    ]
};