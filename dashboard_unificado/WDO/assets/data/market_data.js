window.marketData = {
    "last_updated": "2026-03-02 08:40:59",
    "spot_price": 5170.5,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 02/03/2026 08:40\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  ModeloFlip(1);\n  spot(0);\n  // 1 = Classic (5171.29)\n  // 2 = Spline (5169.55)\n  // 3 = HVL (5166.42)\n  // 4 = HVL Log (5152.01)\n  // 5 = Sigma Kernel (5151.38)\n  // 6 = PVOP (5171.29)\n  // 7 = HVL Gaussian (5154.04)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5171.29;\n\n  if (ModeloFlip = 1) then GammaVal := 5171.29;\n  if (ModeloFlip = 2) then GammaVal := 5169.55;\n  if (ModeloFlip = 3) then GammaVal := 5166.42;\n  if (ModeloFlip = 4) then GammaVal := 5152.01;\n  if (ModeloFlip = 5) then GammaVal := 5151.38;\n  if (ModeloFlip = 6) then GammaVal := 5171.29;\n  if (ModeloFlip = 7) then GammaVal := 5154.04;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(5075.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5133.37, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5150.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5156.14, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5200.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5200.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5207.63, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5250.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5292.86, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5319.60 > 0) then\n      HorizontalLineCustom(5319.60, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(5112.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5300.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(5103.65, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5121.35, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(5092.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5132.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5273.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5326.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5178.26, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5162.74, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5186.01, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5154.99, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5200.42, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5140.58, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5208.17, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5132.83, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 7130,
        "total_volume": 7130,
        "gamma_exposure": 39008377.54125026,
        "delta_position": -1957.7488824574798,
        "last_update": "2026-03-02T08:40:59.490198",
        "spot_price": 5170.5,
        "dealer_pressure": 0.05258589968687494,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 5075.0,
        "gamma_flip_hvl": 5075.0,
        "gamma_flip_hvl_gaussian": 5154.03716039341,
        "call_wall": 5250.0,
        "put_wall": 5200.0,
        "effective_call_wall": 5292.857142857143,
        "effective_put_wall": 5156.140350877193,
        "max_pain": 5200.0,
        "zero_gamma": 5171.293234203175,
        "range_low": 5133.3689591538105,
        "range_high": 5207.6310408461895,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5207.6310408461895,
                "sigma_1_down": 5133.3689591538105,
                "sigma_2_up": 5244.76208169238,
                "sigma_2_down": 5096.23791830762
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5253.527531407402,
                "sigma_1_down": 5087.472468592598,
                "sigma_2_up": 5336.555062814804,
                "sigma_2_down": 5004.444937185196
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 21.0,
                "sigma_1_up": 5340.655805310163,
                "sigma_1_down": 5000.344194689837,
                "sigma_2_up": 5510.811610620325,
                "sigma_2_down": 4830.188389379675
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
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4394.925,
                4426.58112244898,
                4458.2372448979595,
                4489.893367346939,
                4521.549489795919,
                4553.2056122448985,
                4584.861734693877,
                4616.517857142857,
                4648.1739795918365,
                4679.830102040816,
                4711.486224489796,
                4743.1423469387755,
                4774.798469387755,
                4806.454591836735,
                4838.1107142857145,
                4869.766836734694,
                4901.422959183674,
                4933.0790816326535,
                4964.735204081633,
                4996.391326530613,
                5028.0474489795915,
                5059.703571428571,
                5091.359693877551,
                5123.0158163265305,
                5154.67193877551,
                5186.32806122449,
                5217.9841836734695,
                5249.640306122449,
                5281.296428571429,
                5312.9525510204085,
                5344.608673469387,
                5376.264795918367,
                5407.9209183673465,
                5439.577040816326,
                5471.233163265306,
                5502.8892857142855,
                5534.545408163265,
                5566.201530612245,
                5597.8576530612245,
                5629.513775510204,
                5661.169897959184,
                5692.8260204081635,
                5724.482142857143,
                5756.138265306123,
                5787.794387755102,
                5819.450510204081,
                5851.106632653061,
                5882.7627551020405,
                5914.41887755102,
                5946.075
            ],
            "deltas": [
                -5714.951707128847,
                -5714.896301957217,
                -5714.77672472479,
                -5714.5231858832485,
                -5713.999789466859,
                -5712.954239773248,
                -5710.94080232117,
                -5707.210900262628,
                -5700.570292184317,
                -5689.210200967669,
                -5670.531735995988,
                -5640.9966090181015,
                -5596.048980735099,
                -5530.1587158739485,
                -5437.030974806097,
                -5310.00833559864,
                -5142.660174036258,
                -4929.514413308829,
                -4666.847031454113,
                -4353.414723704652,
                -3991.0050038608374,
                -3584.6915656328706,
                -3142.7212222931457,
                -2676.0162531254123,
                -2197.341212170714,
                -1720.242122768374,
                -1257.9052565734764,
                -822.0936106484007,
                -422.29990038960796,
                -65.2108708823339,
                245.47993145270848,
                508.9317516639796,
                726.7557846362947,
                902.4483150641397,
                1040.7583118262166,
                1147.077910446065,
                1226.9204061476348,
                1285.5221104757354,
                1327.5780308729,
                1357.1009858269015,
                1377.3811821239306,
                1391.018114398602,
                1399.9972658722907,
                1405.788361321097,
                1409.4478376399004,
                1411.7142168418256,
                1413.0902386888781,
                1413.9095097201052,
                1414.3880114417022,
                1414.6622696626825
            ],
            "flip_value": 5319.596852358398
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                200.0,
                0.0
            ],
            "bear": [
                -4000.0,
                -0.0,
                -800.0,
                -0.0,
                -100.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4394.925,
                4426.58112244898,
                4458.2372448979595,
                4489.893367346939,
                4521.549489795919,
                4553.2056122448985,
                4584.861734693877,
                4616.517857142857,
                4648.1739795918365,
                4679.830102040816,
                4711.486224489796,
                4743.1423469387755,
                4774.798469387755,
                4806.454591836735,
                4838.1107142857145,
                4869.766836734694,
                4901.422959183674,
                4933.0790816326535,
                4964.735204081633,
                4996.391326530613,
                5028.0474489795915,
                5059.703571428571,
                5091.359693877551,
                5123.0158163265305,
                5154.67193877551,
                5186.32806122449,
                5217.9841836734695,
                5249.640306122449,
                5281.296428571429,
                5312.9525510204085,
                5344.608673469387,
                5376.264795918367,
                5407.9209183673465,
                5439.577040816326,
                5471.233163265306,
                5502.8892857142855,
                5534.545408163265,
                5566.201530612245,
                5597.8576530612245,
                5629.513775510204,
                5661.169897959184,
                5692.8260204081635,
                5724.482142857143,
                5756.138265306123,
                5787.794387755102,
                5819.450510204081,
                5851.106632653061,
                5882.7627551020405,
                5914.41887755102,
                5946.075
            ],
            "pnl": [
                -5384605.6797688585,
                -5141708.298562751,
                -4898812.935045786,
                -4655922.262317076,
                -4413041.965301596,
                -4170183.5322285187,
                -3927369.046546553,
                -3684638.930301713,
                -3442063.708130622,
                -3199760.77353949,
                -2957916.7239690465,
                -2716814.9995514834,
                -2476867.3096571993,
                -2238645.7899566637,
                -2002911.2770495324,
                -1770631.9107866029,
                -1542985.904368473,
                -1321343.104779705,
                -1107222.0421686696,
                -902222.3851993785,
                -707936.6171074002,
                -525848.6149757728,
                -357229.84190956847,
                -203045.32876275695,
                -63881.09142434009,
                60097.92025099072,
                169154.389399071,
                263949.71504101716,
                345484.4161616224,
                415016.4267078617,
                473967.955684966,
                523831.8122483868,
                566086.6354675884,
                602127.8295442153,
                633217.8460940763,
                660456.4114914556,
                684768.8482456757,
                706909.0402416454,
                727472.8763615354,
                746918.0410864684,
                765586.5773355379,
                783727.4799510955,
                801517.4760273797,
                819078.9609849963,
                836494.7044071269,
                853819.3915359837,
                871088.3387372664,
                888323.8493287226,
                905539.7019186604,
                922744.2259704692
            ]
        },
        "max_pain_profile": {
            "strikes": [
                5075.0,
                5150.0,
                5200.0,
                5250.0,
                5350.0
            ],
            "loss": [
                463625.0,
                185000.0,
                750.0,
                1500.0,
                83000.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 5075.0,
                        "Call_Now": 140.9177449536678,
                        "Call_Sim": 206.48555294513062,
                        "Call_Chg": 46.52913514406634,
                        "Put_Now": 24.315904317600598,
                        "Put_Sim": 10.38371230906364,
                        "Put_Chg": -57.296622928608954
                    },
                    {
                        "Strike": 5170.5,
                        "Call_Now": 79.02979242044012,
                        "Call_Sim": 130.31610164239282,
                        "Call_Chg": 64.8949056440747,
                        "Put_Now": 57.530862960581544,
                        "Put_Sim": 29.317172182534023,
                        "Put_Chg": -49.04096571153246
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 64.06447651997996,
                        "Call_Sim": 110.14085228022532,
                        "Call_Chg": 71.92187974231771,
                        "Put_Now": 71.94288611455204,
                        "Put_Sim": 38.519261874797394,
                        "Put_Chg": -46.458553506646126
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 43.26306415356544,
                        "Call_Sim": 80.24492993082094,
                        "Call_Chg": 85.48138348681371,
                        "Put_Now": 100.93357384039246,
                        "Put_Sim": 58.415439617648644,
                        "Put_Chg": -42.12486747965378
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5200.0,
                "options": [
                    {
                        "Strike": 5075.0,
                        "Call_Now": 140.9177449536678,
                        "Call_Sim": 164.126014450806,
                        "Call_Chg": 16.46937332467874,
                        "Put_Now": 24.315904317600598,
                        "Put_Sim": 18.024173814738788,
                        "Put_Chg": -25.87495994671957
                    },
                    {
                        "Strike": 5170.5,
                        "Call_Now": 79.02979242044012,
                        "Call_Sim": 96.45493470778229,
                        "Call_Chg": 22.048827098823764,
                        "Put_Now": 57.530862960581544,
                        "Put_Sim": 45.45600524792303,
                        "Put_Chg": -20.988487033354343
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 64.06447651997996,
                        "Call_Sim": 79.48069250290837,
                        "Call_Chg": 24.063594710120682,
                        "Put_Now": 71.94288611455204,
                        "Put_Sim": 57.8591020974809,
                        "Put_Chg": -19.576340035408148
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 43.26306415356544,
                        "Call_Sim": 55.28655580726581,
                        "Call_Chg": 27.791585938115954,
                        "Put_Now": 100.93357384039246,
                        "Put_Sim": 83.45706549409306,
                        "Put_Chg": -17.31486133041838
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5075.0,
                "options": [
                    {
                        "Strike": 5075.0,
                        "Call_Now": 140.9177449536678,
                        "Call_Sim": 77.57009893312716,
                        "Call_Chg": -44.953633086712145,
                        "Put_Now": 24.315904317600598,
                        "Put_Sim": 56.4682582970604,
                        "Put_Chg": 132.22767107282513
                    },
                    {
                        "Strike": 5170.5,
                        "Call_Now": 79.02979242044012,
                        "Call_Sim": 36.50034731454434,
                        "Call_Chg": -53.81444617700405,
                        "Put_Now": 57.530862960581544,
                        "Put_Sim": 110.50141785468531,
                        "Put_Chg": 92.0732840917016
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 64.06447651997996,
                        "Call_Sim": 27.86796265166481,
                        "Call_Chg": -56.50013210835563,
                        "Put_Now": 71.94288611455204,
                        "Put_Sim": 131.24637224623712,
                        "Put_Chg": 82.43134149116328
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 43.26306415356544,
                        "Call_Sim": 16.91266970719687,
                        "Call_Chg": -60.90736974347425,
                        "Put_Now": 100.93357384039246,
                        "Put_Sim": 170.08317939402423,
                        "Put_Chg": 68.51001398501843
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5222.205,
                "options": [
                    {
                        "Strike": 5075.0,
                        "Call_Now": 140.9177449536678,
                        "Call_Sim": 182.51332005444056,
                        "Call_Chg": 29.5176275453804,
                        "Put_Now": 24.315904317600598,
                        "Put_Sim": 14.206479418374101,
                        "Put_Chg": -41.5753605836859
                    },
                    {
                        "Strike": 5170.5,
                        "Call_Now": 79.02979242044012,
                        "Call_Sim": 110.84821371065027,
                        "Call_Chg": 40.26129933498433,
                        "Put_Now": 57.530862960581544,
                        "Put_Sim": 37.64428425079154,
                        "Put_Chg": -34.566800646490734
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 64.06447651997996,
                        "Call_Sim": 92.41003147257243,
                        "Call_Chg": 44.24535482429527,
                        "Put_Now": 71.94288611455204,
                        "Put_Sim": 48.58344106714412,
                        "Put_Chg": -32.46943000064457
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 43.26306415356544,
                        "Call_Sim": 65.65575017803803,
                        "Call_Chg": 51.759362085376345,
                        "Put_Now": 100.93357384039246,
                        "Put_Sim": 71.62125986486535,
                        "Put_Chg": -29.04119299478986
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5118.795,
                "options": [
                    {
                        "Strike": 5075.0,
                        "Call_Now": 140.9177449536678,
                        "Call_Sim": 104.17924470897378,
                        "Call_Chg": -26.070882880486934,
                        "Put_Now": 24.315904317600598,
                        "Put_Sim": 39.282404072906274,
                        "Put_Chg": 61.55024941627387
                    },
                    {
                        "Strike": 5170.5,
                        "Call_Now": 79.02979242044012,
                        "Call_Sim": 53.36995250034897,
                        "Call_Chg": -32.468565504487565,
                        "Put_Now": 57.530862960581544,
                        "Put_Sim": 83.57602304049033,
                        "Put_Chg": 45.27163115518389
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 64.06447651997996,
                        "Call_Sim": 41.93636433188408,
                        "Call_Chg": -34.54037774146914,
                        "Put_Now": 71.94288611455204,
                        "Put_Sim": 101.51977392645631,
                        "Put_Chg": 41.11162257906928
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 43.26306415356544,
                        "Call_Sim": 26.782303426245562,
                        "Call_Chg": -38.09429833453359,
                        "Put_Now": 100.93357384039246,
                        "Put_Sim": 136.1578131130732,
                        "Put_Chg": 34.89843659789682
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.34893231865561186,
            0.0005099979951252928,
            0.3052221084722127,
            0.2535438109357736,
            0.23181816970708086
        ]
    },
    "delta_data": {
        "strikes": [
            5075.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0
        ],
        "delta_values": [
            -477.9741680167886,
            3.4122264761790078,
            -1893.997728710839,
            299.40633622765495,
            111.40445156631392
        ],
        "delta_cumulative": [
            -477.9741680167886,
            -474.5619415406096,
            -2368.5596702514486,
            -2069.153334023794,
            -1957.7488824574798
        ]
    },
    "gamma_data": {
        "strikes": [
            5075.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0
        ],
        "gamma_values": [
            9424669.341677984,
            121875.32971088459,
            22416849.831964612,
            4606137.643873427,
            2438845.394023355
        ],
        "gamma_call": [
            0.0,
            60937.66485544229,
            0.0,
            4606137.643873427,
            2438845.394023355
        ],
        "gamma_put": [
            9424669.341677984,
            60937.66485544229,
            22416849.831964612,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            9424669.341677984,
            9546544.671388868,
            31963394.50335348,
            36569532.14722691,
            39008377.54125026
        ]
    },
    "volume_data": {
        "strikes": [
            5075.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0
        ],
        "call_volume": [
            0.0,
            15.0,
            0.0,
            800.0,
            600.0
        ],
        "put_volume": [
            2000.0,
            15.0,
            3700.0,
            0.0,
            0.0
        ],
        "total_volume": [
            2000.0,
            30.0,
            3700.0,
            800.0,
            600.0
        ]
    },
    "volatility_data": {
        "strikes": [
            5075.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0
        ],
        "iv_values": [
            11.4,
            11.4,
            11.4,
            11.4,
            11.4
        ],
        "skew": [
            0.0,
            0.0,
            0.0,
            1.0842021724855044e-19,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            5075.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0
        ],
        "charm": [
            -1578.2936844168876,
            4.047741456305907,
            2799.412571402972,
            1104.722949812308,
            1137.04770953316
        ],
        "vanna": [
            -3695.897900045575,
            -24.556679050054154,
            816.3810989541598,
            946.1139577226851,
            1306.4410346801074
        ],
        "vex": [
            925874.8037917742,
            24516.08440403311,
            2202220.119067287,
            452504.6590653036,
            239590.95208615737
        ],
        "theta": [
            -2013.0892999018783,
            -35.40396425670593,
            -3981.600653555011,
            -1528.5186004276968,
            -762.5814815520225
        ],
        "charm_cum": [
            -1578.2936844168876,
            -1574.2459429605817,
            1225.1666284423902,
            2329.889578254698,
            3466.9372877878577
        ],
        "vanna_cum": [
            -3695.897900045575,
            -3720.4545790956295,
            -2904.0734801414696,
            -1957.9595224187847,
            -651.5184877386773
        ],
        "theta_cum": [
            -2013.0892999018783,
            -2048.493264158584,
            -6030.093917713595,
            -7558.612518141292,
            -8321.193999693314
        ],
        "r_gamma": [
            9424669.341677984,
            121875.32971088459,
            -22416849.831964612,
            -4606137.643873427,
            -2438845.394023355
        ],
        "r_gamma_cum": [
            9424669.341677984,
            9546544.671388868,
            -12870305.160575744,
            -17476442.80444917,
            -19915288.198472526
        ]
    },
    "detailed_data": [
        {
            "strike": 5075.0,
            "delta": -477.9741680167886,
            "gamma": 9424669.341677984,
            "volume": 0,
            "oi": 2000,
            "iv": 11.4
        },
        {
            "strike": 5150.0,
            "delta": 3.4122264761790078,
            "gamma": 121875.32971088459,
            "volume": 0,
            "oi": 30,
            "iv": 11.4
        },
        {
            "strike": 5200.0,
            "delta": -1893.997728710839,
            "gamma": 22416849.831964612,
            "volume": 0,
            "oi": 3700,
            "iv": 11.4
        },
        {
            "strike": 5250.0,
            "delta": 299.40633622765495,
            "gamma": 4606137.643873427,
            "volume": 0,
            "oi": 800,
            "iv": 11.4
        },
        {
            "strike": 5350.0,
            "delta": 111.40445156631392,
            "gamma": 2438845.394023355,
            "volume": 0,
            "oi": 600,
            "iv": 11.4
        }
    ]
};